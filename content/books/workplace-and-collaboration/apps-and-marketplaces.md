+++
title = "Apps & Marketplaces"
description = "How workplace apps are reviewed, approved and paid for: marketplace review, admin consent, Forge and the Connect retirement, OAuth verification, revenue share."
category = "Workplace & Collaboration Industry"
order = 2041
part = "Search, Integrations and AI"
tags = ["apps", "marketplaces", "oauth", "admin-consent", "forge"]
+++

A workplace app is someone else's software holding a key to the customer's data. A standup bot reads a channel and posts a summary; a Jira add-on adds a field and a report; a Google Workspace add-on reads mail to file invoices; a Teams app puts a tab on every meeting. Each one is an identity of its own (a bot user, a service principal, an OAuth client), installed into a tenant with a set of scopes, holding tokens that keep working after the person who clicked "Allow" has gone home, changed teams or left the company.

On a community platform the person installing an app decides for themselves, and the platform reviews apps that grow large ([Bots and Apps](/books/user-generated-platforms/developer-platforms-and-apis#bots-and-apps)). In workplace software the data belongs to the customer organization, so the decision moves to its admin: which apps may be installed at all, by whom, with which scopes, into which workspaces. The vendor runs a marketplace and a review, but the review is a floor, not a guarantee, and the admin's allowlist is the real control. This chapter covers what an app is, how the marketplaces review them, how admins approve and consent, why Atlassian moved every app onto its own runtime, how the money splits, and what goes wrong when an app's tokens are stolen. APIs and rate limits are [APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits); no-code integration tools are [Integration Platforms & Workflow Builders](/books/workplace-and-collaboration/integration-platforms); AI agents and MCP clients, which arrive through the same consent screens, are [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp). The core tables (`apps`, `app_installations`, `api_tokens`) are from the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model).

## How the Platforms Do It

As of October 2026:

| Platform | Where apps run | Marketplace review | Admin control | Money |
| --- | --- | --- | --- | --- |
| **Slack** | The developer's servers (HTTP or Socket Mode) | Preliminary review up to 10 business days, functional review up to 10 weeks; 10 or more active workspaces to apply | Workspace and org owners can require approval; pre-approve or restrict per app; org-level app management policies on Enterprise | Commercial distribution requires a Marketplace listing or a partner agreement |
| **Microsoft Teams and Microsoft 365** | The developer's cloud, registered as an Entra app | Store validation; optional Publisher Attestation and Microsoft 365 Certification | Teams admin center allow and block, app-centric assignment to users and groups (tenants migrated from April 2025); Entra user consent policy and admin consent workflow | Transactable SaaS offers pay a 3% store service fee |
| **Atlassian Cloud** | Forge, Atlassian's hosted runtime; Connect (developer-hosted) is being retired | Marketplace approval; trust programs (Atlassian Enterprise Certified replaces Cloud Fortified, Runs on Atlassian) | Admins install apps for a site; Forge apps declare scopes and egress in a manifest, and app admins can switch off analytics egress | Atlassian bills customers and keeps a revenue share: 16% Forge, 20% Connect from April 1, 2026 |
| **Google Workspace** | The developer's servers, as an OAuth client and Marketplace listing | OAuth verification; annual CASA security assessment for restricted scopes | API controls: trusted, specific data, limited or blocked per app; services can be restricted | Developers collect payment directly; Google doesn't process it |
| **Zoom** | The developer's servers | Functional review, security review against OWASP Top 10, scope minimization; published apps monitored | Per-account app management (outside the review process) | Developer-billed |

The pattern: **the marketplace review checks the app once; the customer's admin decides continuously.** Every platform has converged on the same three layers: a review before listing, a per-tenant allow or block decision, and per-installation scopes the admin can see and revoke. Atlassian alone has gone further and taken the app's runtime in-house, which changes what the admin can promise their own auditors.

## What an App Is

The vocabulary differs by vendor; the parts don't.

- **An identity.** Slack apps get a bot user with a bot token (`xoxb-`) and can also act as an individual through user tokens (`xoxp-`), and every app has an app-level token (`xapp-`) for app-wide tasks such as opening Socket Mode connections. A Microsoft 365 app is an Entra application registration, which becomes a service principal in each tenant that consents to it. A Google Workspace app is an OAuth client in a Google Cloud project. The identity is what the audit log names when the app acts.
- **An installation.** The app installed into one workspace, site or tenant, by someone allowed to install it, with the scopes granted at that moment. One app, many installations; each installation has its own tokens and can be revoked alone. In the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) this is `app_installations`.
- **Scopes.** The permissions the installation holds. Slack's granular bot scopes replaced an umbrella `bot` scope that Slack no longer recommends; Microsoft Graph splits permissions into delegated (act as the signed-in user) and application (act as the app, across the tenant); Google classifies scopes as non-sensitive, sensitive or restricted. Application-level scopes across a whole tenant ("read all channels", "read all files") are the ones that turn an app into a data processor for the entire organization.
- **Surfaces.** Where the app shows up: slash commands, message actions and shortcuts, link unfurls, home tabs and modals in Slack; tabs, bots, message extensions and meeting apps in Teams; issue panels, custom fields and macros in Jira and Confluence; side panels and add-ons in Gmail, Docs and Drive.
- **A runtime.** Most marketplaces leave hosting to the developer: Slack delivers events to a public Request URL or over a WebSocket ([Socket Mode](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits#slack-events-and-socket-mode)), Microsoft and Google call the developer's endpoints. Atlassian's Forge hosts the app's functions and storage itself.

The design consequence is that **"the app" is never one thing to revoke.** Removing a vendor means revoking every installation's tokens, every user token granted through it, and every webhook or subscription it registered, in every workspace of the organization, and then confirming the vendor deleted what it copied. The data model has to make that enumerable.

## Marketplace Review

Review exists because a listing in a vendor's marketplace reads as an endorsement to the admin who installs it. What each review checks:

- **Slack.** An app must be installed on 10 or more active workspaces (used in the past 28 days) before submission, except security and compliance partners using the Discovery API. The preliminary review, up to 10 business days, checks the reason for every requested scope and approves only scopes for features already in the app; legacy and restricted scopes, scopes with extensive workspace data access and coded workflow scopes are not accepted. The functional review takes up to 10 weeks for a new submission and up to 6 weeks for a resubmission, tests install and uninstall on a workspace other than the developer's, and returns buggy apps. Socket Mode apps can't be listed in the Marketplace, though they can be deployed organization-wide.
- **Microsoft.** Every Teams store app goes through Microsoft's app validation program, and Microsoft says it contacts developers whose apps don't work as listed and removes the app after repeated reminders. Two optional tiers sit above validation: Publisher Attestation (the developer's self-assessment) and Microsoft 365 Certification (an audit against controls from industry frameworks). The Teams admin center surfaces both, with a tile counting certified and attested apps, and admins can download a certified app's audit evidence if the developer consents.
- **Google.** An OAuth client that requests sensitive or restricted scopes has to pass verification. Until it does, it shows an unverified app screen and is capped at 100 new users. Apps that request restricted scopes (the broad Gmail and Drive ones) must pass an annual security assessment under the App Defense Alliance's CASA framework, built on OWASP ASVS, at assurance level AL1 or AL2 depending on user count and scopes, and receive a Letter of Validation from an assessor. Internal apps used only inside one organization's domain don't need verification.
- **Zoom.** Review covers listing completeness, functionality (install, uninstall, configuration, data flow), a security review of the technical design, OAuth scope minimization, and testing against OWASP Top 10 risks; apps that fail get a report of open items, and published apps are monitored afterward.
- **Atlassian.** Marketplace approval plus trust programs layered on top. Cloud Fortified, the long-running badge for security and reliability practices, stopped accepting submissions in 2026; Atlassian Enterprise Certified (AEC), announced October 1, 2026, replaces it as the primary trust designation, asks partners to publish standardized evidence (compliance, security, uptime, privacy, accessibility, responsible AI) up front, and is open to eligible Forge apps. Existing Cloud Fortified badges stay visible through December 31, 2026. Runs on Atlassian is a separate, automatic badge described below.

Three things review can't do. It checks a version, and the app changes after; it checks the app, not the vendor's operations (who in the vendor's company can read the tokens); and it can't see what the vendor does with data once it leaves the platform. That is why the platforms' API terms carry the data-use rules ([Data-Use Terms](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits#data-use-terms)) and why the admin controls below exist.

## Admin Approval and Consent

Installing an app is a grant from the customer to a third party, and the customer's admin decides who may make it. Each suite has a version of the same three dials: who can install, which apps are allowed, and which permissions need an admin.

**Slack.** Owners turn on "Require approved apps" in App Management Settings, after which members can only install pre-approved apps or request others. Approving a request approves the app's scopes; admins can pre-approve or restrict an app from the app directory, and restricting an app doesn't uninstall copies already installed. Owners choose who reviews requests (the owners, or named app managers), can require a comment with every request, and can automate approve, restrict or flag rules. On an Enterprise org, an org-level app management policy turns approval on for every workspace.

**Microsoft 365.** Two systems decide together. The Teams admin center controls availability: org-wide settings for Microsoft, third-party and custom apps; allow or block per app; and, since tenants were migrated to app-centric management from April 2025, assignment of each app to all users, specific users or groups (guests can't use an assigned app even if added). Third-party apps are blocked by default in GCC, GCC High and DoD. Entra ID controls what an app can read: by default users can consent to permissions that don't require admin consent (their own mailbox, for example) but not to tenant-wide access, and Microsoft recommends limiting user consent to verified publishers and low-impact permissions the admin has classified. When a user can't consent, the admin consent workflow sends the request to a reviewer. Changing the consent policy affects only future consents; grants already made stay until an admin revokes them.

**Google Workspace.** API controls in the Admin console give each app one of four access levels: trusted (all services, including restricted ones), specific Google data (only listed scopes), limited (only unrestricted services) or blocked. Services such as Gmail and Drive can be marked restricted, so only trusted apps reach them, and switching a service to restricted revokes tokens held by untrusted apps already installed. For apps the admin has never configured, the default is to allow any third-party app; the alternatives are to allow only apps requesting basic sign-in information, or none. Users can request access, and requests land in "Apps pending review" per organizational unit. Changes can take up to 24 hours to apply.

The rules that follow, anchored in all three:

- **Default to approval, not to open.** All three suites ship with installation or consent at least partly open to users (Google's default allows any unconfigured app; Entra allows user consent for non-admin permissions). An admin who hasn't changed the defaults has delegated the decision to every employee.
- **Tenant-wide scopes need an admin.** Delegated access to one person's data is that person's decision; application access to everyone's data is the organization's.
- **Approval and existing grants are different switches.** Every suite separates "may new installs happen" from "revoke what's already installed." A policy change that doesn't sweep existing grants leaves the old ones live.
- **Requests are a queue with an owner.** Approval only works if requests get answered; otherwise employees route around it with personal accounts or integration platforms ([Credential Custody](/books/workplace-and-collaboration/integration-platforms#credential-custody)).

Where the admin console's policy engine lives, and the delegated admin roles that run these queues, is the subject of [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies#third-party-app-controls).

## Hosting: Forge and the Connect Retirement

Atlassian ran its cloud marketplace on Connect for years: the app lived on the developer's servers, Jira and Confluence called it and rendered its iframes, and customer data flowed to wherever the developer hosted. Forge reverses that. It's Atlassian's serverless platform: Atlassian hosts the app's functions, gives each app development, staging and production environments, and supplies storage and triggers, with UI Kit or Custom UI for the interface. The app's manifest declares the OAuth scopes it needs (`permissions.scopes`) and every external domain it may call (`permissions.external.fetch`), and calls to any undeclared domain are rejected.

Atlassian announced Connect's end of support in three phases:

| Phase | Enforcement | What changes |
| --- | --- | --- |
| One | September 17, 2025 | New Marketplace apps must be built on Forge and can't include Connect modules |
| Two | March 2026 | Apps with a Connect descriptor can no longer ship updates through the Marketplace; new Connect private apps can't be installed |
| Three | Q4 2026 | Connect moves to end of support, "use at your own risk" |

**Runs on Atlassian** is the badge that makes the move legible to admins. A Forge app qualifies when it uses only Atlassian-hosted compute and storage, supports data residency matching the host product, and lets customers control any external egress (analytics, logs) through admin controls; in general it can't send data outside Atlassian except analytics without in-scope end-user data. Atlassian applies the badge automatically.

Why a platform would take on hosting thousands of third-party apps: once the app's code and data live inside the platform, the platform's residency, encryption and audit promises extend to it, and the customer's admin can answer a procurement question ("where does this app send our data?") from the manifest instead of a questionnaire. The cost moves to the platform and to developers, who give up their own infrastructure and accept the runtime's limits. Data residency itself is [Data Residency & Sovereignty](/books/workplace-and-collaboration/data-residency-and-sovereignty)'s subject.

## Revenue Share and Billing

Marketplaces split into those that bill the customer and those that only list.

- **Atlassian** bills customers for paid apps on its invoice and pays partners net of a revenue share. After a deferral, the rates moved from 15% to 16% for Forge apps and from 15% to 20% for Connect apps on April 1, 2026, and to 17% and 25% on October 1, 2026. Qualifying Runs on Atlassian apps (since October 2025) and other qualifying Forge apps (from January 1, 2026) pay no revenue share until the partner's lifetime Forge revenue reaches $1 million, counted per partner company including subsidiaries. The spread between Forge and Connect is the retirement plan expressed in money.
- **Microsoft** charges a 3% standard store service fee on transactable offers sold through its marketplace (SaaS offers included), with a 50% discount available on qualifying private offer renewals; Microsoft acts as the publisher's agent for billing and collection, and the customer can pay on its Enterprise Agreement invoice. That invoice is the attraction: a purchase that draws down an existing Microsoft commitment avoids a new vendor in procurement. Cloud marketplace mechanics belong to [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management) and [Hosting & Cloud's marketplace chapter](/books/hosting-and-cloud/commitments-and-marketplaces).
- **Google Workspace Marketplace** doesn't process payments: developers collect directly from users, and Google doesn't verify the pricing labels on listings.

For the developer, the marketplace that bills is a channel with a fee; the marketplace that lists is a directory with a review. For the customer, an app bought through the suite's own billing shows up in the same contract, the same renewal and often the same seat count as the suite, which is why the suites push it.

## When an App's Tokens Are Stolen

The failure the review process can't prevent is theft of an approved app's tokens from the app vendor. Google Threat Intelligence Group's write-up of the 2025 Salesloft Drift campaign is the reference case: from as early as August 8 through at least August 18, 2025, an actor it tracks as UNC6395 used stolen OAuth tokens for the Drift integration to export Cases, Accounts, Users and Opportunities from Salesforce customer instances, then searched the exports for AWS keys, passwords and Snowflake tokens. On August 20 Salesloft and Salesforce revoked every Drift access and refresh token and Salesforce pulled the app from its AppExchange. A later update found the actor had also used "Drift Email" tokens on August 9 to read mail from a very small number of Google Workspace accounts that had connected Drift; Google revoked the tokens and disabled the integration. Neither platform was breached; the integration was.

What that implies for an app platform:

- **Tokens are bearer credentials held by a third party.** A refresh token for an installation with tenant-wide read scope is, in practice, a standing export capability stored in someone else's database. Short-lived access tokens limit the window: Slack's token rotation issues access tokens that expire after 12 hours, with single-use refresh tokens, and can't be turned off once on ([Rotation](/docs/api-design/authentication#rotation)).
- **Revocation must be by app, fleet-wide, in one action.** The response above was "revoke every token this app holds, everywhere", which only works if the platform can enumerate them by app and installation.
- **Exports leave a trail.** The actor deleted its query jobs but not the logs. Bulk reads by an app identity, especially out of its normal pattern, are the detection signal ([Auditing](#auditing) below; the attack catalog is [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents#oauth-consent-and-app-abuse)).
- **Admins need the inventory.** Microsoft's SharePoint Advanced Management, for example, includes an app insights report on which third-party Entra apps access SharePoint content and how. The customer can only revoke what it can see.

## How to Build It

The [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model)'s `apps`, `app_installations` and `api_tokens` hold the app, its installations and its credentials. This chapter adds versions with declared scopes and egress, marketplace listings and reviews, tenant policies and install requests, and columns that make fleet-wide revocation a query:

```sql
ALTER TABLE apps                              -- the core table: one row per app identity,
                                              -- with distribution already on it
  ADD COLUMN publisher_org_id UUID REFERENCES organizations (id),  -- the developer's org
  ADD COLUMN hosting          TEXT NOT NULL DEFAULT 'external' CHECK (hosting IN
                                ('external', 'platform_hosted')),
  ADD COLUMN publisher_verified_at TIMESTAMPTZ,
  ADD COLUMN suspended_at     TIMESTAMPTZ,    -- platform-wide kill switch
  ADD COLUMN suspended_reason TEXT;

CREATE TABLE app_versions (                   -- what each release asks for
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  app_id          UUID NOT NULL REFERENCES apps (id),
  version         TEXT NOT NULL,
  scopes          TEXT[] NOT NULL,            -- requested OAuth scopes
  tenant_wide     BOOLEAN NOT NULL,           -- any scope over all users' data
  egress_domains  TEXT[] NOT NULL DEFAULT '{}',  -- declared outbound hosts (Forge-style)
  manifest        JSONB NOT NULL,             -- surfaces, events, webhooks
  breaking_scopes BOOLEAN NOT NULL DEFAULT FALSE, -- adds scopes: needs re-consent
  released_at     TIMESTAMPTZ,
  UNIQUE (app_id, version)
);

CREATE TABLE app_listings (                   -- the marketplace face of an app
  app_id          UUID PRIMARY KEY REFERENCES apps (id),
  status          TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'listed',
                    'delisted', 'removed')),
  pricing         TEXT NOT NULL CHECK (pricing IN ('free', 'paid', 'freemium', 'trial')),
  billed_by       TEXT NOT NULL CHECK (billed_by IN ('platform', 'developer')),
  revenue_share_bps INT,                      -- platform's cut when billed_by = 'platform'
  trust_badges    TEXT[] NOT NULL DEFAULT '{}',  -- 'certified', 'attested', 'runs_on_platform'
  privacy_url     TEXT NOT NULL,
  security_contact TEXT NOT NULL
);

CREATE TABLE app_reviews (                    -- each review of a version, kept
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  app_version_id  UUID NOT NULL REFERENCES app_versions (id),
  stage           TEXT NOT NULL CHECK (stage IN ('preliminary', 'functional',
                    'security', 'reverification')),
  outcome         TEXT NOT NULL CHECK (outcome IN ('pending', 'passed', 'returned',
                    'rejected')),
  scopes_approved TEXT[],                     -- may be fewer than requested
  findings        JSONB NOT NULL DEFAULT '[]',
  reviewer_id     UUID,                       -- platform staff account
  decided_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ                 -- annual assessments lapse
);

CREATE TABLE app_policies (                   -- the customer admin's decision, per app
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  app_id          UUID REFERENCES apps (id),  -- null: the default for unconfigured apps
  decision        TEXT NOT NULL CHECK (decision IN ('allowed', 'blocked', 'requires_approval',
                    'limited')),
  allowed_scopes  TEXT[],                     -- 'specific data' style narrowing
  assigned_group_ids UUID[],                  -- who may use it; null = everyone allowed
  decided_by      UUID NOT NULL REFERENCES members (id),
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (workspace_id WITH =, app_id WITH =, valid_during WITH &&)
);

CREATE TABLE app_install_requests (           -- a member asking for an app
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  app_version_id  UUID NOT NULL REFERENCES app_versions (id),
  requested_by    UUID NOT NULL REFERENCES members (id),
  justification   TEXT,
  status          TEXT NOT NULL CHECK (status IN ('open', 'approved', 'restricted',
                    'dismissed', 'expired')),
  decided_by      UUID REFERENCES members (id),
  decided_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_installations
  ADD COLUMN app_version_id  UUID REFERENCES app_versions (id),
  ADD COLUMN granted_scopes  TEXT[] NOT NULL DEFAULT '{}',  -- never more than policy allows
  ADD COLUMN consent_kind    TEXT NOT NULL DEFAULT 'user' CHECK (consent_kind IN
                               ('user', 'admin')),
  ADD COLUMN request_id      UUID REFERENCES app_install_requests (id),
  ADD COLUMN revoked_at      TIMESTAMPTZ,
  ADD COLUMN revoked_reason  TEXT;            -- 'uninstalled', 'policy', 'app_suspended'

-- every token traceable to its installation (core api_tokens.app_installation_id)
CREATE INDEX api_tokens_installation_idx ON api_tokens (app_installation_id)
  WHERE revoked_at IS NULL;
```

Notes on the sketch:

- **Consent can't exceed policy.** At install time `granted_scopes` is the intersection of the version's `scopes`, the review's `scopes_approved` and the workspace policy's `allowed_scopes`, and a tenant-wide scope forces `consent_kind = 'admin'`. The check lives in the install path, not the UI.
- **A new version that adds scopes doesn't inherit consent.** `breaking_scopes` routes the upgrade back through approval; existing installations keep running on their old grant until an admin accepts.
- **A policy change sweeps.** Moving an app to `blocked` writes the policy row and enqueues revocation of every live installation and token for it in that workspace, the behavior Google applies when a service becomes restricted.
- **Suspension is one row.** `apps.suspended_at` makes every token check for that app fail at once, across all tenants, which is the Drift response as a primitive. Token validation reads it through the same cache that holds the token, invalidated on change ([Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely)).
- **App actions are typed actors.** Every write an app makes lands in `audit_events` with the app, the installation and, for user tokens, the human it acted for ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).

## Auditing

- **Every install, upgrade, consent and uninstall,** with the version, scopes granted, consent kind and the member or admin who granted it; an installation with a tenant-wide scope and `consent_kind = 'user'` is a finding.
- **Every policy decision and request,** with who decided and when; open requests older than the queue's target are a finding of their own.
- **Token issuance, refresh and revocation by installation,** so "which tokens did this app hold on this date" is answerable after a compromise.
- **Reads by app identities in volume.** Bulk exports, searches across many containers and access from new network locations by an app, reported per installation for the customer's security team (the audit event's contents are [Audit Logs](/books/workplace-and-collaboration/audit-logs)' subject).
- **Review history per version,** including returned and rejected reviews and lapsed annual assessments, kept for the life of the listing.

## What This Means for the System You Build

- **Model the app, the version, the installation and the token separately,** with keys that let one query find every live credential an app holds.
- **Put the customer's admin in front of every tenant-wide grant,** and ship with approval on for new apps, not off.
- **Make scopes granular enough to say no to,** and record what each installation was actually granted, not what the app asked for.
- **Re-consent on scope increases;** never let an upgrade widen access silently.
- **Treat review as a dated event with an expiry,** not a permanent property of the app.
- **Build fleet-wide suspension and revocation before the first marketplace listing;** the day it's needed is not the day to write it.
- **Decide early whether you host third-party code.** Hosting (Forge's path) lets your residency and egress promises cover apps; not hosting keeps the platform simpler and puts the burden on review and terms.
- **If you bill for apps, the invoice is the product:** the customer buys through a contract it already has, and you own the refund and tax questions that come with it.

## References

**Vendor documentation**

- [Slack: Slack Marketplace review guide](https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide), the 10-active-workspace minimum, scope review, review stages and timelines
- [Slack: Manage app approval for your workspace](https://slack.com/help/articles/222386767-Manage-app-approval-for-your-workspace), require approved apps, pre-approve and restrict, app managers, request automation and Enterprise org policies
- [Slack: Tokens](https://docs.slack.dev/authentication/tokens), bot, user, app-level and configuration tokens, granular bot scopes and token rotation's 12-hour expiry
- [Slack: Using Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode), Socket Mode apps can't be listed in the Marketplace
- [Slack API Terms of Service](https://slack.com/terms-of-service/api), commercial distribution through the Marketplace or a partner agreement
- [Microsoft Learn: Manage your apps in the Microsoft Teams admin center](https://learn.microsoft.com/en-us/microsoftteams/manage-apps), org-wide app settings, allow and block, app-centric management from April 2025, government cloud defaults, validation, attestation and certification
- [Microsoft Learn: Configure how users consent to applications](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent), default user consent, verified-publisher policies, admin consent workflow and existing grants
- [Microsoft Learn: Microsoft Marketplace transact capabilities](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/marketplace-commercial-transaction-capabilities-and-considerations), the 3% store service fee, the renewal discount and Microsoft as billing agent
- [Microsoft Learn: SharePoint Advanced Management overview](https://learn.microsoft.com/en-us/sharepoint/advanced-management), the app insights report on third-party apps accessing SharePoint
- [Google Workspace Admin Help: Control which apps access Google Workspace data](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data), access levels, restricted services and token revocation, unconfigured-app defaults, requests and propagation time
- [Google Cloud Help: Security assessment for restricted scopes](https://support.google.com/cloud/answer/13465431), annual CASA assessment, assurance levels and the Letter of Validation
- [Google Cloud Help: Unverified apps](https://support.google.com/cloud/answer/7454865), the 100-user cap and verification exceptions for internal apps
- [Google Workspace Marketplace Help: Find and install an app](https://knowledge.workspace.google.com/marketplace/find-and-install-an-app-in-the-marketplace), developers collect payment directly and admin installs
- [Zoom Developer: App review process](https://developers.zoom.us/docs/distribute/app-review-process/), review stages, security review against OWASP Top 10 and scope minimization
- [Atlassian Developer: Forge](https://developer.atlassian.com/platform/forge/), the hosted runtime, environments, storage and UI options
- [Atlassian Developer: Forge manifest permissions](https://developer.atlassian.com/platform/forge/manifest-reference/permissions/), declared scopes and egress, rejection of undeclared domains
- [Atlassian Developer: Runs on Atlassian](https://developer.atlassian.com/platform/marketplace/runs-on-atlassian/), the badge's hosting, residency and egress requirements

**Announcements**

- [Atlassian: Connect end-of-support timeline and next steps](https://www.atlassian.com/blog/developer/announcing-connect-end-of-support-timeline-and-next-steps), the three phases and their dates
- [Atlassian: Extended timelines for Marketplace revenue share changes](https://www.atlassian.com/blog/developer/extended-timelines-for-marketplace-revenue-share-changes), Forge and Connect rates by date and the $1 million 0% incentive
- [Atlassian Developer Community: Introducing Atlassian Enterprise Certified](https://community.developer.atlassian.com/t/introducing-atlassian-enterprise-certified-aec/103035), AEC replacing Cloud Fortified and the badge transition through December 31, 2026

**Incident reports**

- [Google Threat Intelligence Group: Widespread data theft targets Salesforce instances via Salesloft Drift](https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift), the UNC6395 dates, data exported, token revocation, AppExchange removal and the Google Workspace update
