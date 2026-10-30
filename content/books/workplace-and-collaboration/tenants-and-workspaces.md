+++
title = "Tenants, Workspaces & Organizations"
nav_title = "Tenants & Workspaces"
description = "Workspace, org and tenant across Slack, Atlassian, Microsoft 365, Google, Notion and Figma; joining by domain; merging and splitting tenants; isolation."
category = "Workplace & Collaboration Industry"
order = 2006
part = "Tenancy and Identity"
tags = ["workplace", "multi-tenancy", "workspaces", "organizations", "mergers"]
+++

Every workplace product has to answer one question before any other: whose is this? A consumer app answers it per person. A workplace app answers it per customer, and the customer is not one thing. It is a legal entity that pays, a set of email domains it can prove it owns, one or more administrative units with their own settings, and thousands of people who may have signed up before anyone in IT knew the product existed. The vendor's word for the unit varies (workspace, site, tenant, team, account), and so does where the line between the paying organization and the place the work happens is drawn.

It is hard because the shape changes over a customer's life. A product usually starts as one free workspace created by one employee; it becomes ten workspaces created by ten departments; procurement then wants them under one contract with one set of policies; an acquisition brings a second company with its own tenant; a divestiture carves a business unit out. Each of those moves touches identity, billing, data location, search and every permission in the product. This chapter covers the containers themselves: how each vendor structures the organization above its workspaces, how people find and join a workspace by email domain, how tenants are merged and split after a deal, and how isolation is enforced underneath. Identity inside the tenant follows in [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts), and where the tenant's data sits in [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty). The generic engineering (tenant ids everywhere, enforcement in the database, hierarchies) is the playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy); this chapter is what the industry built on it.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Top unit (the customer) | Work unit | Many work units under one customer? | Domain-based joining |
| --- | --- | --- | --- | --- |
| **Slack** | Enterprise organization (the Enterprise Grid design) | Workspace, with channels | Yes on Enterprise plans; on Free, Pro and Business+ workspaces exist but aren't connected | "Approved domains" on Free, Pro and Business+; claimed and verified domains on paid plans |
| **Atlassian** | Organization | Apps (Jira, Confluence and others), on sites in the original model or directly in the org in the centralized model | Yes | Verified domains let the org claim accounts |
| **Microsoft 365** | Microsoft Entra tenant | The tenant itself, with Teams, SharePoint sites and mailboxes inside | One tenant is the norm; a multitenant organization groups up to 100 active tenants | Users are created or synced into the tenant by its admins |
| **Google Workspace** | The customer account, with a customer ID | Organizational units for settings; content belongs to users and shared drives | One customer can hold several domains; OUs nest under one top-level unit | Verified domains; unmanaged personal accounts on the domain can be transferred in |
| **Notion** | Organization (Enterprise) | Workspace, with teamspaces | Yes; verified domains bring workspaces on the domain under the organization | Domain verification and claiming, with control over who may create workspaces |
| **Figma** | Organization (Organization and Enterprise plans) | Teams, and on Enterprise, workspaces | Yes | Domain capture adds people with a company email as members |

Three patterns run through the table:

- **Two layers, always.** Every vendor ends up with a layer that pays and sets policy (organization, tenant, customer) and a layer where people work (workspace, site, team). Products that started with one layer added the second when large customers arrived: Slack's Enterprise Grid connected existing workspaces, Atlassian moved administration from sites to organizations, Notion added organizations over workspaces.
- **The domain is the join key.** Every vendor uses a verified email domain to connect people who signed up on their own to the organization that pays. What changes is what verification unlocks: auto-joining, claiming accounts, blocking other workspaces, or adding people as members instead of guests.
- **Microsoft is the outlier in direction.** Most collaboration vendors grew from many small workspaces upward; a Microsoft 365 tenant starts as the whole organization, created by an admin, and the hard problem is the reverse: an enterprise with several tenants that wants them to behave like one.

## Workspace, Organization, Tenant

The terms collide, so this volume uses the [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model)'s names: an `organizations` row is the customer that signs the contract and verifies domains; a `workspaces` row is a tenant unit where content lives and where region and residency are set. A Slack workspace, an Atlassian site (or app instance), a Microsoft 365 tenant, a Google Workspace customer, a Notion workspace and a Figma team are all `workspaces`; Slack's Enterprise organization, Atlassian's organization and Notion's and Figma's organizations are `organizations`. A Microsoft 365 tenant is both at once, which is why multitenant Microsoft customers are the hardest case below.

### Slack: workspaces, then the organization

On Slack's Free, Pro and Business+ plans each workspace stands alone; the Enterprise plan connects several workspaces under one organization. Org-wide policies apply across every workspace, direct messages, files and emoji are available across the organization, search covers every workspace a person belongs to, and apps can be installed org-wide or per workspace. Org-wide channels and multi-workspace channels connect members of different workspaces, and a multi-workspace channel can be shared with a specific set of workspaces or all of them. The usual design is a workspace per business unit (marketing, sales, engineering), with the organization holding policy.

Two details make the layering concrete. Policy flows down with locks: some workspace settings are controlled by Org Owners and Org Admins, and a lock icon on a setting means an org admin has locked it, so a workspace admin who needs it changed has to ask an org admin. And workspaces join the organization rather than being created inside it: Org Owners can move existing workspaces into the org with the approval of the workspace's Primary Owner, and Slack's help center notes that a moved workspace keeps its member accounts, messages, files and even emoji reactions. Each workspace has one of four access modes: Open, By Request, Invite Only or Hidden.

Underneath, Slack's own engineering write-up shows why the second layer was hard. Data was originally "partitioned and scaled horizontally by workspace id," with a metadata cluster mapping each workspace to its shard; Enterprise Grid and Slack Connect "challenge the paradigm that all data for a team will be on the same database shard," the largest customers' shards reached the largest available hardware, and an outage of one shard took down every customer on it. Slack moved message data to sharding by channel id as part of its move to Vitess. The lesson for any builder: the unit you shard by is a product decision as much as a database one, because every later feature that crosses it (org-wide search, shared channels) becomes a cross-shard query.

### Atlassian: organizations and sites

Atlassian organizations "bring together your company's users and apps." Organization admins manage employees' Atlassian accounts and the apps that belong to the organization, including Jira (and Jira Service Management), Confluence, Statuspage, Trello, Opsgenie and Bitbucket. Atlassian documents two user management experiences: in the original one, each app instance is "associated with a site, which has its own site URL and administration," and the users page filters by site; in the centralized one, apps sit directly in the organization without a site division.

The distinctive part is that Atlassian accounts are not owned by the organization by default. Users "aren't tied to any one app," so the same account can use apps inside and outside the organization; an account becomes a managed account only when the organization claims it, which requires a verified domain. That separation (an account that exists independently, an organization that can claim it) is the model [SSO, Domains & Managed Accounts](/books/workplace-and-collaboration/sso-and-managed-accounts#managed-versus-personal-accounts) builds on.

### Microsoft 365: one tenant, and then several

A Microsoft 365 tenant is a Microsoft Entra directory plus the services provisioned against it. By default, the user who signs up for a Microsoft cloud service gets a new tenant and the Global Administrator role, so the tenant is born as the whole customer. Everything (users, groups, Teams, SharePoint sites, mailboxes) lives in it, and its initial `onmicrosoft.com` domain is permanent.

Large enterprises end up with several tenants anyway, from acquisitions, regional subsidiaries or regulatory separation. Microsoft's answer is the multitenant organization: one tenant administrator defines a group of tenants the organization owns, each listed tenant's admin must join (the relationship is "a collaboration of equals," and each admin stays in control of their own tenant), and joining can take up to two hours to process. The constraints are specific: a tenant can create or join only one multitenant organization, a multitenant organization can't include a Cloud Solution Provider and its customer tenants, each active tenant needs cross-tenant access settings for every other active tenant, and the limit is 100 active tenants including the owner (raisable through support). People cross the boundary as B2B collaboration member users, ideally provisioned in bulk with cross-tenant synchronization, and Teams then shows chat, calling and meeting notifications from all connected tenants with faster tenant switching. The capability needs Microsoft Entra ID P1 licenses (one per employee per multitenant organization, and at least one per tenant).

The design choice is worth noting because it is the opposite of Slack's. Slack built a parent that owns its workspaces; Microsoft built a federation of peers, each of which can leave at any time. A federation fits a holding company whose subsidiaries are separate legal controllers of their own data; a parent fits one company that wants one policy. Many products need both: a single organization for the common case and a trust relationship between organizations for the conglomerate and the joint venture ([Guests & Cross-Org Collaboration](/books/workplace-and-collaboration/guests-and-external-collaboration#trust-between-two-admins)).

### Google Workspace: one customer, organizational units

Google assigns each Google Workspace or Cloud Identity account a unique customer ID at sign-up. Inside it, the structure for settings is the organizational unit tree: all users and devices start in one top-level OU, child OUs inherit their parent's settings, a setting applied to a child overrides the inherited one, and "a user or device belongs to only one organizational unit." An OU can contain users from several domains, so the tree is administrative rather than a mirror of the domains. For exceptions that cut across the tree, Google adds configuration groups (to customize service settings) and access groups (to turn services on or off), independent of OU placement; in features such as data regions, group settings override organizational units. The policy engine on top of this tree is [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies#policy-scope-and-inheritance).

Content ownership is the other difference. In Google Workspace, most files belong to a user, and only shared drives belong to the organization; the consequences for offboarding are in [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#content-ownership-on-the-way-out).

### Notion and Figma: organizations over workspaces and teams

Notion's Enterprise organization sits above its workspaces. Organization owners are "super admins" with control over organization-wide settings, including over workspaces they don't belong to, while workspace owners manage their own workspace within the organization's restrictions. Claiming the company domain is the first step: it gives control and visibility over anyone or any space affiliated with the domain, unlocks SAML SSO configuration, and lets the organization control who can create workspaces on that domain. Verified domains bring multiple workspaces under the organization, and settings applied at the workspace level cascade to its teamspaces. Notion supports one SAML configuration per Business workspace and up to 25 per Enterprise organization.

Figma's organization holds teams (and, on Enterprise, workspaces), and its join mechanism is domain capture: on the Organization and Enterprise plans, verifying a domain by DNS TXT record lets the organization automatically add people with a company email, both existing Figma accounts and new sign-ups, as members rather than guests. Verifying `example.com` doesn't capture `brand.example.com` (subdomains are verified separately), and admins can list active Figma accounts on a verified domain that sit outside the organization and add them.

## Finding and Joining a Workspace

A workplace product spreads by people signing up with their work email, and the product has to decide what happens next: does the new user land alone in a new workspace, or in the one their colleagues already use? The answer is the domain.

- **Slack approved domains.** On Free, Pro and Business+, workspace owners and admins can allow people with approved email domains to join; anyone with an approved address can join from the workspace's sign-up link or by entering their email on the sign-in page, the approved domains are shown on the sign-in page, and a member's request to invite someone with an approved address is approved automatically.
- **Slack claimed domains.** On paid plans, claiming and verifying a domain (by DNS TXT record, allowing up to 72 hours to propagate) lets admins restrict members to Slack Connect invitations from claimed domains; on Enterprise plans it also stops other workspaces from inviting people on the claimed domains, and can prevent people from creating unsanctioned workspaces while making the organization's own workspaces easier to find.
- **Notion workspace creation.** With a verified domain, Notion Enterprise organizations control whether users may create new workspaces with the domain. Verification codes expire after a week, a domain belongs to only one Notion organization, and claiming existing workspaces waits until the domain has been verified for at least 14 days, a notification period for their owners.
- **Figma domain capture.** People with a company email become members of the organization automatically, existing accounts included.

The design question every builder faces is the default. Open joining by domain grows the workspace and reduces duplicate workspaces; it also means anyone who controls an address on the domain (a contractor given a company mailbox, a shared inbox) can read every open channel. My default is that unverified domain joining lands people in the existing workspace only after an admin has opted in, verified domains are required for anything that removes a person's choice (capture, claiming, blocking other workspaces), and every auto-join is an audit event with the rule that admitted the person.

### Shadow workspaces

The other side of bottom-up adoption is the workspace nobody in IT knows about: a second Slack workspace started by a team, a Notion workspace on a personal plan, a Figma team paid by a manager's card. Vendors give the organization ways to find and absorb them: Notion's verified domain gives control and visibility "over anyone or any space affiliated with that domain across Notion"; Figma lists accounts on the domain outside the organization; Slack Enterprise claiming prevents new unsanctioned workspaces. Absorbing one is a consolidation, below; finding them is also the vendor's sales signal ([From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises#domain-capture-and-admin-claiming)).

## Consolidating and Splitting Tenants

Mergers, acquisitions, divestitures and reorganizations change the customer, and the product has to move content without breaking it. Three operations recur:

1. **Move a workspace under an organization.** The cheapest case, because nothing moves physically: Slack moves an existing workspace into an Enterprise organization with the workspace Primary Owner's approval and keeps its accounts, messages and files.
2. **Merge one workspace into another.** Content, people, permissions and links all have to be rewritten into the target. Notion's workspace consolidation migrates users, page content, permissions and relations from a source workspace into an Enterprise target, and deletes the source 30 days afterward. It is available to Enterprise customers through their account managers, after the customer signs an acknowledgement form, and only for source workspaces the customer has claimed and that are billed through its main billing account.
3. **Move data between tenants.** Microsoft's cross-tenant migration tools move individual users' data between Microsoft 365 tenants, for mergers and divestitures. Cross-tenant mailbox migration moves "only user-visible content in the mailbox (email, contacts, calendar, tasks, and notes)," deletes the source mailbox after a successful migration, and requires a Cross-tenant User Data Migration license, for which "Microsoft doesn't offer exceptions." Cross-tenant OneDrive migration does the same for OneDrive with SharePoint Online PowerShell, under the same one-time per-user license: users and groups are precreated in the target, up to 4,000 OneDrive accounts can be scheduled at a time, the move is one pass with no incremental or delta passes, and a redirect left at the old location keeps shared links working. Microsoft's FAQ is explicit that the Teams chat folder content in the mailbox does not migrate; after the move it stays searchable and exportable by the source tenant's administrators.

The hard parts are the same in every product:

- **Identity first.** People must exist in the target before their content does, and their old identifiers must map to new ones, or every authorship, mention, assignment and permission points at a ghost. Microsoft's mailbox migration requires the target user to exist first; Notion's consolidation migrates users along with pages.
- **References.** Links between items (a page linking another page, an issue mentioning a channel) break when ids change. A move needs a map from old ids to new ones, kept after the move, so old links redirect.
- **Permissions.** A grant to a group in the source has no meaning in the target unless the group comes too. Consolidations move groups or map them to equivalent target groups before content.
- **Compliance state.** Retention policies and legal holds bind content in the source. A move that deletes the source (as Microsoft's mailbox migration does) has to carry holds into the target or leave a searchable copy, and the Teams chat example shows what stays behind for the source tenant's investigators. Microsoft blocks OneDrive accounts under a hold policy from cross-tenant migration: the admin removes the hold, migrates, and reapplies it in the target. The hold rules themselves belong to [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold); here the rule is that a tenant move never silently drops a hold.
- **Licenses and money.** Moves happen across contracts; the per-user migration license is Microsoft's way of pricing that work.

Splitting is the same machinery in the other direction, with one more question: who owns content that both halves used? A shared channel or a page edited by people who now belong to two companies has no obvious owner. My default is that content stays with the container's owning workspace, the leaving side gets an export of what its own people authored, and anything else is decided by the two admins, not by the vendor.

## Tenant Isolation

Everything above assumes that one tenant can never see another's data. The generic patterns (a tenant id on every row, enforcement in the database with row-level security, tenant context on every request, isolation tests) are in the playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy#enforce-it-in-the-database). What workplace products add:

- **The partition key is the workspace, and the exceptions are the product.** Notion sharded its block data by workspace id because "each block belongs to exactly one workspace," which keeps most queries on one shard; it used 480 logical shards over 32 physical databases, a number chosen because it has many factors. Slack started the same way and had to shard messages by channel once organizations and shared channels crossed workspaces. Any feature that deliberately crosses tenants (shared channels, org-wide search, cross-tenant sync) needs its own explicit path, never a relaxed tenant filter.
- **Two scopes on every row.** Content belongs to a workspace; policy belongs to an organization. Queries that enforce policy (is this file type allowed? may this person share outside?) read the organization; queries that return content filter by workspace. Mixing them is how a workspace admin ends up reading another workspace's data in the same organization.
- **Isolation includes the indexes.** Search indexes, AI retrieval indexes, caches and exports are all copies of tenant data and need the same tenant scoping as the primary store ([Enterprise Search](/books/workplace-and-collaboration/enterprise-search)).
- **Support access is a tenant boundary crossing.** A vendor engineer opening a customer's workspace is the one cross-tenant read that is legitimate; it needs a reason, a time box and a record the customer can see ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation)).

## How to Build It

The [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) defines `organizations`, `workspaces`, `domains`, `accounts` and `members`. This chapter adds the structure between them: workspace placement under an organization, organizational units for policy scope, domain-based join rules, and tenant moves.

```sql
ALTER TABLE workspaces                     -- core already has organization_id and a unique slug;
                                           -- a free workspace starts under its own organization
  ADD COLUMN access_mode     TEXT NOT NULL DEFAULT 'invite_only'
    CHECK (access_mode IN ('open', 'by_request', 'invite_only', 'hidden')),
  ADD COLUMN shard_key       INT  NOT NULL,                        -- logical shard, assigned at creation
  ADD COLUMN created_by_account_id UUID REFERENCES accounts (id),
  ADD COLUMN joined_organization_at TIMESTAMPTZ;   -- when it moved under its current organization

CREATE TABLE org_units (                  -- Google-style OU tree for policy scope
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  parent_id       UUID REFERENCES org_units (id),                  -- null for the root
  name            TEXT NOT NULL,
  path            TEXT NOT NULL,                                   -- '/Sales/EMEA', for display and sorting
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, parent_id, name)
);

ALTER TABLE accounts
  ADD COLUMN org_unit_id UUID REFERENCES org_units (id);           -- exactly one OU per managed account

CREATE TABLE workspace_join_rules (       -- who may join without an invitation
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id  UUID NOT NULL REFERENCES workspaces (id),
  domain_id     UUID REFERENCES domains (id),                      -- verified domain, or
  domain_name   TEXT,                                              -- an approved but unverified domain
  effect        TEXT NOT NULL CHECK (effect IN ('auto_join', 'auto_approve_invite', 'capture')),
  member_kind   TEXT NOT NULL DEFAULT 'full' CHECK (member_kind IN ('full', 'guest')),
  created_by    UUID NOT NULL REFERENCES accounts (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_at   TIMESTAMPTZ,
  CHECK ((domain_id IS NULL) <> (domain_name IS NULL)),
  CHECK (effect <> 'capture' OR domain_id IS NOT NULL)            -- capture needs a verified domain
);

CREATE TABLE tenant_moves (               -- move under an org, merge, split, cross-tenant user moves
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('attach_to_org', 'detach_from_org',
                        'merge_workspace', 'split_workspace', 'move_users')),
  source_workspace_id UUID NOT NULL REFERENCES workspaces (id),
  target_workspace_id UUID REFERENCES workspaces (id),
  target_organization_id UUID REFERENCES organizations (id),
  requested_by        UUID NOT NULL REFERENCES accounts (id),
  approved_by_source  UUID REFERENCES accounts (id),               -- the source owner's consent
  state               TEXT NOT NULL DEFAULT 'planned' CHECK (state IN ('planned', 'approved',
                        'identities_mapped', 'copying', 'verifying', 'cut_over', 'completed',
                        'rolled_back', 'failed')),
  holds_carried       BOOLEAN NOT NULL DEFAULT FALSE,              -- legal holds re-applied in target
  scheduled_for       TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ
);

CREATE TABLE tenant_move_id_map (         -- kept after the move so old links and ids resolve
  tenant_move_id UUID NOT NULL REFERENCES tenant_moves (id),
  object_type    TEXT NOT NULL,            -- 'member', 'group', 'container', 'item', 'grant'
  source_id      UUID NOT NULL,
  target_id      UUID NOT NULL,
  PRIMARY KEY (tenant_move_id, object_type, source_id)
);
```

Notes on the sketch:

- **The workspace is the shard unit; the organization is not.** `shard_key` is assigned when the workspace is created, so attaching a workspace to an organization is a metadata change, not a data move. Org-wide features read across shards through explicit fan-out, never through a join.
- **Organization is nullable on purpose.** A self-serve workspace exists before any organization claims it; the claim (by verified domain or by an admin moving it in) sets `organization_id` and `joined_organization_at` and records who consented.
- **One OU per account.** The OU tree scopes policy for managed accounts; groups handle exceptions. Admin roles scoped to an OU and the policy resolution order are in [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies#how-to-build-it).
- **Join rules are data, with the rule recorded on the member.** When `auto_join` admits someone, the `members` row records the `workspace_join_rules.id` that admitted them, so an admin removing a domain can find everyone it let in.
- **Moves are state machines that map identities first.** `identities_mapped` comes before `copying`, the id map is written as objects copy, and `holds_carried` must be true before `cut_over` if any source content is under hold. Rollback restores from the id map.
- **Events:** `workspace.attached_to_organization`, `workspace.join_rule_changed`, `member.joined_by_domain`, `tenant_move.state_changed` and `tenant_move.completed` go through the outbox to the audit log, billing (seat counts move with members) and search (indexes are rebuilt in the target).

## Auditing

- **Every change to the tenant structure:** workspaces attached to or detached from an organization, with the consenting owner; OUs created, moved or deleted.
- **Join rules and what they admitted:** who added a domain rule, when, and every member admitted by it.
- **Tenant moves end to end:** who requested and approved, the id map, counts copied and verified per object type, holds carried, and the cut-over time.
- **Cross-tenant reads:** org-wide search, admin views across workspaces and vendor support sessions, logged as access, not just changes ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Model two layers from the start:** an organization that pays and sets policy, workspaces where content lives, with the organization nullable until a customer claims its workspaces.
- **Shard by workspace and build cross-workspace features as explicit fan-out,** not relaxed filters; plan from day one for the shared container that crosses workspaces.
- **Make the domain the join key, and require verification** before anything that removes a person's choice.
- **Treat merges, splits and moves as state machines** that map identities, groups and ids first, carry legal holds, and keep the id map after the move.
- **Support both a parent organization and a federation of peers,** because conglomerates and joint ventures need the second.
- **Scope every index, cache and export by tenant,** and log every legitimate cross-tenant read.

## References

**Vendor documentation**

- [Slack: Manage a workspace on Enterprise Grid](https://slack.com/intl/en-gb/help/articles/115005225987), workspaces moved into an org keep accounts, messages and files; locked policies; access modes; multi-workspace channels
- [Salesforce Trailhead: Discover Slack Enterprise Grid](https://trailhead.salesforce.com/content/learn/modules/designing-a-slack-enterprise-grid/discover-slack-enterprise-grid), connected workspaces on the enterprise plan versus unconnected ones on other plans, org-wide DMs, files, search and apps, workspace-per-business-unit design
- [Slack: Manage how people join your workspace](https://slack.com/intl/en-gb/help/articles/115004856503-Manage-how-people-join-your-workspace), approved email domains on Free, Pro and Business+, automatic approval of invitation requests
- [Slack: Claim and verify email domains](https://slack.com/help/articles/5513043606547-Claim-and-verify-email-domains), DNS TXT verification and its 72-hour window, Slack Connect restriction, blocking external workspace invitations and unsanctioned workspaces on Enterprise
- [Atlassian: What is an Atlassian organization?](https://support.atlassian.com/organization-administration/docs/what-is-an-atlassian-organization/), organizations, apps, sites in the original and centralized experiences, accounts not tied to one app, managed accounts after claiming
- [Microsoft Entra: What is a multitenant organization?](https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/multi-tenant-organization-overview), invite-and-join between tenant admins, two-hour processing, constraints, 100 active tenants, P1 licensing
- [Microsoft Entra: Best practices for Microsoft Entra roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/best-practices), a new tenant created at sign-up with the creating user as Global Administrator
- [Microsoft 365: Cross-tenant mailbox migration](https://learn.microsoft.com/en-us/microsoft-365/migration/cross-tenant-mailbox-migration), what content moves, source mailbox deletion, the required license, Teams chat folder content not migrated
- [Microsoft 365: Cross-tenant OneDrive migration](https://learn.microsoft.com/en-us/microsoft-365/migration/cross-tenant-onedrive-migration), OneDrive moves between tenants for mergers and divestitures, the one-time per-user license, precreated users, the 4,000-account queue, single-pass moves, redirects, and holds blocking migration
- [Google Workspace: Find your customer ID](https://knowledge.workspace.google.com/admin/getting-started/find-your-customer-id), a unique customer ID per Google Workspace or Cloud Identity account
- [Google Workspace: How the organizational structure works](https://knowledge.workspace.google.com/admin/users/advanced/how-the-organizational-structure-works), the top-level OU, inheritance and overrides, one OU per user, multi-domain OUs, configuration and access groups
- [Google Workspace: Choose a geographic location for your data](https://knowledge.workspace.google.com/admin/compliance/choose-a-geographic-location-for-your-data), group settings overriding organizational units
- [Notion: Setting up and managing an organization](https://www.notion.com/help/guides/everything-about-setting-up-and-managing-an-organization-in-notion), organization owners as super admins, what domain claiming gives, workspace creation control, consolidation under the organization and settings cascading to teamspaces
- [Notion: Domain management](https://www.notion.com/help/domain-management), DNS verification, codes expiring after a week, one organization per domain, the 14-day period before claiming, workspace creation control on Enterprise
- [Notion: Workspace consolidation guide](https://notion.notion.site/Notion-Workspace-Consolidation-Guide-0eca1f05f2614ff6818c86c3b3fb0357), migrating users, content, permissions and relations from a source to a target workspace, deletion of the source after 30 days, and eligibility
- [Notion: SAML SSO configuration](https://www.notion.com/help/saml-sso-configuration), one SAML configuration per Business workspace, up to 25 per Enterprise organization
- [Figma: Domain capture](https://help.figma.com/hc/en-us/articles/360040453113), adding existing and new accounts with a company email to the organization
- [Figma: Find users with Figma accounts outside your organization](https://help.figma.com/hc/en-us/articles/27503664218391-Find-users-with-Figma-accounts-outside-your-organization), DNS verification, listing and adding outside accounts, subdomains not captured, Organization or Enterprise plan

**Engineering write-ups**

- [Slack: Scaling datastores at Slack with Vitess (2020)](https://slack.engineering/scaling-datastores-at-slack-with-vitess/), workspace-id partitioning, problems from Enterprise Grid, Slack Connect and large customers, resharding messages by channel
- [Notion: Herding elephants, sharding Postgres at Notion](https://www.notion.com/blog/sharding-postgres-at-notion), workspace id as partition key, 480 logical shards on 32 physical databases
