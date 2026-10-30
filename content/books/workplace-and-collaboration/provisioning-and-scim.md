+++
title = "Provisioning, SCIM & Offboarding"
nav_title = "Provisioning & SCIM"
description = "SCIM 2.0, Entra, Okta and Google directory sync, HR-driven joiner-mover-leaver, deactivation versus deletion, and handing content over at offboarding."
category = "Workplace & Collaboration Industry"
order = 2008
part = "Tenancy and Identity"
tags = ["workplace", "scim", "provisioning", "offboarding", "identity"]
+++

Single sign-on decides who may sign in. Provisioning decides who exists. An enterprise with ten thousand employees hires, moves and loses people every day, and it wants each change to reach every product it uses without an administrator clicking through fifty admin consoles: an account and the right groups on the first morning, new groups when someone changes teams, and a dead account the hour they leave. The source of truth is the HR system and the identity provider; the collaboration product is a target that has to accept changes it didn't originate, at volume, and keep its own state consistent with them.

The hard part is not creating users. It is the edges: a directory that sends a delete when the employer meant a suspension, a group that grants access to a channel full of salary data, a person who leaves while owning the shared drive the finance team runs on, a rehire with the same email and a different employee number, and an identity provider that stops syncing for a week and then sends everything at once. This chapter covers the protocol (SCIM 2.0), how the major identity providers drive it, HR-driven joiner-mover-leaver flows, what deactivation and deletion mean in each product, and how content changes hands when someone leaves. The playbook's [Provisioning and Deprovisioning](/docs/security/sso-and-federation#provisioning-and-deprovisioning) has the generic rule; this is the industry detail.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Product | Provisioning in | Plan | Deprovisioning semantics | Content after removal |
| --- | --- | --- | --- | --- |
| **Slack** | SCIM 1.1 and 2.0 API | Business+ or Enterprise | Users can only be deactivated, never deleted; a deactivated user's email blocks re-provisioning until changed | Messages and files stay; the member is removed from channels and signed out |
| **Atlassian** | SCIM from Okta, OneLogin, Entra ID, Duo, Google, PingFederate, JumpCloud, or the user provisioning API | Atlassian Guard Standard | Deleting a user in the identity provider deactivates the Atlassian account | Deactivated accounts keep roles and groups; deletion after a 14-day grace replaces the name with "Former user" |
| **Google Workspace** | Google Cloud Directory Sync from Active Directory or LDAP | Not covered here | Suspend (temporary), Archived User license (retain data at lower cost) or delete (restorable for 20 days) | User-owned Drive files, calendars and other data are deleted unless transferred; shared drive files stay |
| **Microsoft 365** | Entra ID is the directory; Entra provisioning pushes to SaaS apps over SCIM | Group-based assignment needs Entra ID P1 or P2 | Soft delete for 30 days, then hard delete; SCIM targets get `active: false`, then a DELETE | The deleted user's OneDrive is kept 30 days by default for the manager or a secondary owner |
| **Notion** | SCIM and SAML automatic account creation | Enterprise for SCIM | Not covered here | Not covered here |

Three patterns:

- **SCIM is universal, and gated.** Every enterprise product speaks SCIM 2.0, and every one charges for it: Slack's Business+ and Enterprise plans, Atlassian Guard, Notion Enterprise.
- **Nobody deletes on the first signal.** Slack never deletes through SCIM, Atlassian turns an identity provider delete into a deactivation, Microsoft soft-deletes for 30 days, Google keeps a deleted account restorable for 20. The directory's delete is treated as "stop access now," and destruction of the person's record is a separate, later decision.
- **Content outlives the person, but who gets it varies.** Chat messages stay where they were posted. Files are the hard case, because the suites tie them to a user's storage: Google deletes untransferred files, OneDrive hands them to a manager for 30 days. Products that store content in shared containers by default have an easier offboarding.

## SCIM 2.0

SCIM (System for Cross-domain Identity Management) is two IETF documents published in September 2015: RFC 7643 defines the schema, RFC 7644 the protocol. The product implements a SCIM service provider; the identity provider is the client that pushes changes.

**The schema (RFC 7643).** Every resource has `id` (the service provider's identifier), `externalId` (the client's identifier) and `meta`. A User has `userName`, `name`, `emails`, `active` and `groups`; a Group has `displayName` and `members`. The Enterprise User extension, `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`, adds `employeeNumber`, `manager`, `department`, `costCenter`, `organization` and `division`. The attribute that matters most is the vaguest: `active` is "a Boolean value indicating the user's administrative status," and "the definitive meaning of this attribute is determined by the service provider." Every product has to write down what `active: false` does to sessions, tokens, seats and content.

**The protocol (RFC 7644).** Endpoints are `/Users`, `/Groups`, `/Me`, `/ServiceProviderConfig`, `/ResourceTypes`, `/Schemas`, `/Bulk`, and `/.search` for searches by POST. GET reads, POST creates, PUT replaces ("PUT MUST NOT be used to create new resources"), PATCH changes parts with `add`, `remove` and `replace` operations applied in order and atomically, and DELETE removes. Filters use `eq`, `ne`, `co`, `sw`, `ew`, `pr`, `gt`, `ge`, `lt` and `le` with `and`, `or` and `not`; list responses page with a 1-based `startIndex` and `count`. ETags with `If-Match` give optimistic concurrency.

What the RFCs leave to the implementer, and where integrations break:

- **Matching.** The client has to find the existing user before it creates one. Entra's provisioning service queries the target for a user matching a configured attribute (for example `userPrincipalName` mapped to `userName`), creates one if none matches, and caches the target's id for every later operation. A product that lets the matching attribute change (an email rename) without keeping `externalId` stable gets duplicates.
- **Group membership at scale.** A PATCH that adds 20,000 members to one group is a single request in the protocol and a large transaction in the product. Atlassian publishes recommended limits per connected directory: 1 million users, 290,000 users per group, 250,000 groups and 8 million total memberships.
- **What a guest is.** Slack's SCIM can't fully provision single-channel guests: they are created as full users and then restricted in Slack's admin pages. Guest status is product-specific and outside the core schema.
- **Read-only after sync.** Once Atlassian is connected to an identity provider, admins are "unable to make changes to a user's account from the organization," and synced groups can only be edited in the identity provider. The product has to show which fields are mastered elsewhere and refuse edits to them, or the next sync silently reverts them.

## How the Identity Providers Drive It

### Microsoft Entra ID

Entra's provisioning service connects to the app's SCIM 2.0 endpoint over TLS 1.2 and runs an initial cycle (read every in-scope user and group, match or create in the target, write a watermark) and then incremental cycles that read changes since the watermark through Microsoft Graph delta queries. Scope is usually assignment-based: users and groups assigned to the app (groups need P1 or P2), with the important limitation that the service can't read nested groups and provisions only immediate members of an assigned group. Attribute-based scoping filters are the alternative.

Deprovisioning has four triggers: a user soft-deleted in Entra (or blocked from sign-in), permanently deleted, unassigned from the app, or moved out of scope. For a SCIM app, the first, third and fourth send a PATCH setting `active` to false; the hard delete, 30 days after a soft delete, sends a DELETE. Microsoft's own recommendation to app developers is to support both soft and hard deletes "to recover when a user is accidentally disabled."

The failure modes are documented too. Errors are retried in later cycles with backoff. If most calls fail (expired credentials, an endpoint down), the job enters quarantine, incremental cycles slow to once a day, and after four weeks in quarantine the job is disabled. Initial cycles for assigned users are estimated at 0.01 to 0.08 minutes per assigned user, group and membership, and creating everyone takes about twice as long as matching everyone. Every operation is in the provisioning logs, and configuration changes are in the audit log.

### Okta

Okta frames the same work as lifecycle management: provisioning and deprovisioning to apps, and profile sourcing. A profile source is the authoritative system for a user's identity, only one source applies to a given profile at a time, and an HR system such as Workday can act as one, sending hire, change and termination events that create, update and deactivate Okta users, which Okta then pushes to downstream apps. Okta warns that enabling both profile sourcing and attribute updates on the same app can cause data loss, because Okta may overwrite the source's attributes: the two-masters problem in one warning.

### Google

Google Cloud Directory Sync reads Active Directory or another LDAP server and updates the Google account to match; it is one-way ("data on the LDAP server is never updated or altered"), runs inside the customer's network, covers users, groups and shared contacts, doesn't migrate content (mail, calendar events, files), and has a simulation stage to test rules before a real run. Because the directory wins every disagreement, a mistaken exclusion rule is a mass deprovisioning, which is what the simulation is for. In the other direction, Atlassian lists Google Workspace and Google Cloud among the identity providers that can provision into it over SCIM.

## Joiner, Mover, Leaver

The enterprise view of provisioning starts in HR, not in the identity provider. Microsoft's planning guide for HR-driven provisioning (Workday, SAP SuccessFactors) defines the joiners-movers-leavers process as "new hires, transfers, and termination by using a cloud HR app as a system of records": a termination in the HR app disables the user in Active Directory and Entra ID automatically, and the identity provider's outbound provisioning carries the change to every connected SaaS app. Its planning questions are the ones every product's provisioning design should answer:

- **Joiners.** Future-dated hires are created before their start date, so the target product sees an account that shouldn't be usable yet, and a rescinded offer has to remove an account that was never used. Rehires raise the question of whether the old employee id comes back with the old account.
- **Movers.** A transfer changes department, manager and groups, so access granted by the old groups has to go when the new groups arrive. The product receives this as group membership PATCHes; nothing in SCIM tells it that two changes are one transfer, so a grant removed before its replacement is added produces a short outage, and the reverse produces a short overgrant.
- **Leavers.** Effective dates, contingent workers handled differently from employees, and what "terminated" means at midnight in which time zone. The product's job is to make `active: false` take effect everywhere at once: sessions, API tokens, OAuth grants, scheduled automations running as the person, and seat counts.

My default for the target side: treat every SCIM deactivation as an incident-grade revocation (sessions and tokens killed within minutes), run the content handover as a separate, slower workflow that an admin can review, and never require the identity provider to send a hard delete for anything other than erasing the person's personal data.

## Deactivation Versus Deletion

Each product means something specific by each word:

- **Slack.** Deactivated people aren't notified, "nor are their messages or files deleted"; they are removed from all channels, signed out on every device and blocked from signing back in, and can be reactivated. SCIM can only deactivate. Billing follows: under Slack's Fair Billing Policy, when an admin deactivates a member Slack deposits a prorated credit the next day for the unused part of the billing period, and a member inactive for more than 28 days is credited too; reactivating charges the prorated cost again.
- **Atlassian.** Deactivating a managed account retains its roles and group memberships so it can come back. Deleting "permanently close[s] an Atlassian account": the account is deactivated for a 14-day grace period that can't be shortened (only organization admins can cancel), personal data is removed from account services within 30 days, content the person created (pages, issues, comments) stays, and the name becomes "Former user." Billing for a deleted account stops, and resumes if the deletion is cancelled.
- **Google Workspace.** Suspension blocks access temporarily. An Archived User license keeps a former employee's data at lower cost. Deletion removes access to all services and data, and "data owned solely by the user, that isn't transferred before deleting their account, is permanently deleted": Gmail, owned Drive files, Sites, the primary calendar and owned shared calendars among them. A deleted account can be restored for up to 20 days. On the Annual/Fixed-Term plan deleting a user doesn't reduce the license count.
- **Microsoft 365.** A deleted user stays in the admin center for 30 days. Removing a license or blocking sign-in does not start OneDrive cleanup; only deleting the account from Entra ID does.

Two consequences for anyone building a product:

1. **Deactivation must be reversible and complete.** Reversible because directories make mistakes (a scoping filter edited, a group renamed); complete because a deactivated account with a live API token or a running automation is still acting. Microsoft's guidance, Slack's reactivation and Atlassian's retained roles all say the same thing.
2. **Deletion is about the person's personal data, not the work.** Atlassian's split is the model: the account and its personal data go; pages, issues and comments stay, attributed to "Former user." Erasing a departed employee's authored work would destroy the employer's records and break every thread they took part in. Where personal data is embedded in content the employee typed, Atlassian keeps it; the employer, as controller, decides about it under its own retention rules ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## Content Ownership on the Way Out

The hardest offboarding question is who owns what the person owned. The products split by where they put content by default.

- **Personal storage by default (Google Drive, OneDrive).** In Google Workspace, super admins can transfer a user's Drive and Docs files, primary calendar and Data Studio assets during deletion; other admins must transfer before deleting; group calendars must be transferred first because deleting the owner deletes them; private files may move anyway if they sit in a shared folder; and files in shared drives aren't affected because "your organization owns these files, not users." In Microsoft 365, the deleted user's manager is given access to their OneDrive by default (or a secondary owner, if no manager is set), told it will be deleted at the end of the retention period, reminded seven days before, and the OneDrive then sits in the recycle bin for 93 days. The default retention is 30 days and is configurable. Retention policies and holds override this schedule: content can be kept longer, and a OneDrive under an eDiscovery hold isn't deleted until the hold is removed. Unlicensed OneDrive accounts are archived on their 93rd unlicensed day.
- **Shared containers by default (chat, wikis, trackers).** A Slack message lives in a channel; a Confluence page lives in a space; a Jira issue lives in a project. Nothing has to move, but responsibility does: the open issues assigned to the person, the pages they own, the saved filters and dashboards the team relies on, the automation rules that run as them. Atlassian's guidance for Jira is a search for `assignee in (inactiveUsers())` followed by a bulk change of the assignee field; filters, dashboards and project leads need their own reassignment.

My default for a builder: put content in containers the organization owns, keep an `owner` (a responsible person) separate from the `author` (who wrote it), and generate an offboarding worklist on deactivation, with every container the person owns, every item assigned to them, every automation and integration acting as them, and every share link they created, so an admin (or the departing person's manager) reassigns before the deletion clock runs out.

## How to Build It

The core data model's `members` (`kind`, `role`, `status`, `deactivated_at`) and `groups` with `group_members` (`source` local, scim or directory) are where provisioning lands. This chapter adds the directory connection, the external ids and mastering, a log of SCIM operations, and offboarding.

```sql
CREATE TABLE directory_connections (      -- one per identity provider pushing to the organization
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  provider         TEXT NOT NULL,         -- 'entra', 'okta', 'google', 'onelogin', 'custom'
  scim_version     TEXT NOT NULL DEFAULT '2.0' CHECK (scim_version IN ('1.1', '2.0')),
  token_hash       BYTEA NOT NULL,        -- bearer token for the SCIM endpoint, stored hashed
  token_rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mastered_fields  TEXT[] NOT NULL DEFAULT '{name,emails,title,department,manager,active}',
  state            TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'paused', 'disconnected')),
  last_request_at  TIMESTAMPTZ
);

ALTER TABLE members
  ADD COLUMN directory_connection_id UUID REFERENCES directory_connections (id),
  ADD COLUMN external_id     TEXT,                  -- SCIM externalId from the identity provider
  ADD COLUMN employee_number TEXT,                  -- Enterprise User extension
  ADD COLUMN manager_member_id UUID REFERENCES members (id),
  ADD COLUMN scim_etag       TEXT,                  -- version for If-Match
  ADD COLUMN deactivation_source TEXT CHECK (deactivation_source IN ('admin', 'scim', 'hr',
    'inactivity', 'self')),
  ADD CONSTRAINT members_external_id_unique UNIQUE (directory_connection_id, external_id);

ALTER TABLE groups
  ADD COLUMN directory_connection_id UUID REFERENCES directory_connections (id),
  ADD COLUMN external_id TEXT,
  ADD CONSTRAINT groups_external_id_unique UNIQUE (directory_connection_id, external_id);

CREATE TABLE scim_operations (            -- every request the identity provider sent, as received
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  directory_connection_id UUID NOT NULL REFERENCES directory_connections (id),
  received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method                  TEXT NOT NULL,      -- GET, POST, PUT, PATCH, DELETE
  resource_type           TEXT NOT NULL CHECK (resource_type IN ('User', 'Group', 'Bulk')),
  resource_id             UUID,               -- our member or group id, once resolved
  request_body            JSONB,              -- personal data: purged on the retention schedule
  status_code             SMALLINT NOT NULL,
  error_detail            TEXT,
  purge_after             TIMESTAMPTZ NOT NULL
);

CREATE TABLE offboarding_runs (           -- the worklist generated when a member is deactivated
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  member_id         UUID NOT NULL REFERENCES members (id),
  triggered_by      TEXT NOT NULL CHECK (triggered_by IN ('scim', 'admin', 'hr')),
  access_revoked_at TIMESTAMPTZ,          -- sessions, tokens, OAuth grants, automations stopped
  delete_after      TIMESTAMPTZ,          -- end of the grace period, if deletion was requested
  state             TEXT NOT NULL DEFAULT 'revoking' CHECK (state IN ('revoking', 'awaiting_handover',
                      'handed_over', 'deleted', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ownership_transfers (        -- one row per thing that changes hands
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  offboarding_run_id UUID NOT NULL REFERENCES offboarding_runs (id),
  object_type       TEXT NOT NULL CHECK (object_type IN ('container', 'item', 'work_item_assignment',
                      'saved_query', 'automation', 'app_installation', 'share_link', 'api_token')),
  object_id         UUID NOT NULL,
  to_member_id      UUID REFERENCES members (id),   -- null when the action is revoke, not transfer
  action            TEXT NOT NULL CHECK (action IN ('transfer', 'revoke', 'keep_as_former')),
  done_at           TIMESTAMPTZ,
  done_by           UUID REFERENCES accounts (id)
);
```

Notes on the sketch:

- **`externalId` is the match key, never the email.** Emails change on marriage, rebrand and rehire; the identity provider's `externalId` doesn't. The unique constraint per connection is what prevents duplicates when a client retries a POST.
- **Mastered fields are enforced in the product.** The admin UI and API refuse edits to fields in `mastered_fields` for members bound to a connection, and show where the field comes from, so the next sync can't silently revert a manual change.
- **`active: false` revokes synchronously; deletion runs on a clock.** The SCIM handler sets `members.status`, kills sessions and tokens, pauses automations and writes `offboarding_runs.access_revoked_at` in the same transaction as the response; `delete_after` is set only by a DELETE or an admin, after a grace period, and the deletion removes personal data while items stay attributed to a former member.
- **Group PATCHes are applied in batches with idempotent membership writes.** A 20,000-member PATCH is split into chunks inside one logical operation, and `group_members` writes are upserts, so a retry after a timeout converges instead of failing.
- **The SCIM log is personal data with its own retention.** It is invaluable for "why was this person removed?" and should be purged on a schedule like any log of personal data.
- **Events:** `member.provisioned`, `member.updated`, `member.deactivated`, `member.reactivated`, `group.membership_changed`, `offboarding.access_revoked` and `offboarding.handed_over` go to the audit log, billing (seats), search (re-trim results for the removed person) and notifications (the manager's handover worklist).

## Auditing

- **Every SCIM request and its outcome,** with the connection, the resolved member or group and the error, kept long enough to answer disputes ([Typed Actors](/docs/architecture/audit-trails#typed-actors) records the identity provider as the actor, not a person).
- **Mastering changes:** connections created, tokens rotated, mastered fields changed.
- **Deactivations and reactivations** with their source, and the time access was actually revoked.
- **Ownership transfers:** every object handed over, to whom, by whom, and what was revoked instead.
- **Deletions:** the grace period, who requested and who cancelled, and what personal data was removed.

## What This Means for the System You Build

- **Implement SCIM 2.0 completely:** stable `externalId` matching, PATCH with ordered atomic operations, ETags, paging, and a `/ServiceProviderConfig` that tells the truth.
- **Write down what `active: false` means** and make it revoke sessions, tokens, OAuth grants and automations at once.
- **Treat the directory's delete as deactivation;** delete personal data after a grace period and keep authored content attributed to a former member.
- **Enforce mastered fields** and show admins where each value comes from.
- **Handle the mover case:** group changes arrive as separate PATCHes, so make grants idempotent and avoid long windows of over- or under-access.
- **Store content in organization-owned containers** and generate an offboarding worklist of everything the person owned or ran.
- **Expect quarantine and floods:** idempotent writes, batching and clear errors, because identity providers retry and then catch up all at once.

## References

**Standards**

- [RFC 7643: SCIM Core Schema](https://www.rfc-editor.org/rfc/rfc7643), common attributes, User and Group attributes, the Enterprise User extension, the definition of `active`
- [RFC 7644: SCIM Protocol](https://www.rfc-editor.org/rfc/rfc7644), endpoints, methods, PATCH operations, filters, ETags, paging, September 2015 publication

**Vendor documentation**

- [Slack: SCIM API](https://docs.slack.dev/admins/scim-api), Business+ and Enterprise, SCIM 1.1 and 2.0, deactivation only, email blocking re-provisioning, single-channel guests
- [Slack: Deactivate a member's account](https://slack.com/help/articles/204475027-Deactivate-a-members-account), messages and files kept, channels removed, sign-out, reactivation, who can deactivate
- [Slack: Fair Billing Policy](https://slack.com/help/articles/218915077-Slacks-Fair-Billing-Policy), the 28-day inactivity rule, prorated credits on deactivation and charges on reactivation
- [Atlassian: Understand user provisioning](https://support.atlassian.com/provisioning-users/docs/understand-user-provisioning/), Guard Standard, supported identity providers, read-only synced users and groups, deactivation on IdP delete, recommended sync limits
- [Atlassian: Delete a managed account](https://support.atlassian.com/user-management/docs/delete-a-managed-account/), deactivate versus delete, 14-day grace, 30-day personal data removal, content kept, "Former user", billing
- [Atlassian: How to remove inactive users from the backlog](https://support.atlassian.com/jira/kb/how-to-remove-inactive-users-from-the-backlog/), `assignee in (inactiveUsers())` and bulk reassignment
- [Microsoft Entra: How application provisioning works](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works), SCIM over TLS 1.2, matching, initial and incremental cycles, scoping and nested groups, deprovisioning triggers, 30-day hard delete, quarantine
- [Microsoft Entra: When will provisioning finish for a specific user](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user), cycle time estimates, provisioning and audit logs
- [Microsoft Entra: Plan cloud HR application to Microsoft Entra user provisioning](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/plan-cloud-hr-provision), joiners-movers-leavers, automatic disable on termination, rehires, rescinds and effective dates
- [Okta: About profile sourcing](https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-about-profile-sourcing.htm), the authoritative source per profile, Workday as a source, the warning about pushes to a source app
- [Google Workspace: About Google Cloud Directory Sync](https://knowledge.workspace.google.com/admin/users/about-google-cloud-directory-sync), one-way sync from AD or LDAP, objects covered, no content migration, the simulation stage
- [Notion: Setting up and managing an organization](https://www.notion.com/help/guides/everything-about-setting-up-and-managing-an-organization-in-notion), SCIM provisioning and SAML in Enterprise organization settings, suppressing SCIM invite emails in phased rollouts
- [Google Workspace: Delete or remove a user from your organization](https://knowledge.workspace.google.com/admin/users/delete-or-remove-a-user-from-your-organization), suspend, archive and delete, what is deleted, 20-day restore, transfers during deletion, shared drives, licenses
- [Microsoft: OneDrive retention and deletion](https://learn.microsoft.com/en-us/sharepoint/retention-and-deletion), manager and secondary owner access, 30-day default, seven-day reminder, 93-day recycle bin, holds and retention precedence, archiving on day 93 unlicensed
