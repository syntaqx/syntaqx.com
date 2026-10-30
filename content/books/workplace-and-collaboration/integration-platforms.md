+++
title = "Integration Platforms & Workflow Builders"
nav_title = "Integration Platforms"
description = "Zapier, Make, Workato, Power Automate, Slack Workflow Builder, n8n and unified APIs: triggers, billing units, failures, credential custody and governance."
category = "Workplace & Collaboration Industry"
order = 2043
part = "Search, Integrations and AI"
tags = ["ipaas", "automation", "power-automate", "zapier", "unified-apis"]
+++

An integration platform lets someone who isn't a developer connect two products: when a form is submitted, create a ticket; when a deal closes, post in a channel and add a row to a sheet; every Monday, copy last week's invoices into the finance folder. Zapier calls the result a Zap, Make a scenario, Workato a recipe, Power Automate a flow, Slack and n8n a workflow. Underneath, each is a trigger, a sequence of actions and a set of saved connections, run on someone's schedule against someone's API budget.

The engineering is ordinary; the custody isn't. Every connection is a credential to a business system, usually an employee's own OAuth grant, stored in a third party's database, and a flow keeps running on it after the employee who built it has moved on. Whoever can build a flow can move data between any two systems they can sign in to, including from a governed one to an ungoverned one. That is why integration platforms are the place where the customer admin's controls (which connectors may be combined, who owns a connection, what happens when its owner leaves) matter more than the platform's features. This chapter covers the platform types, triggers and billing units, failure handling, credential custody, governance, in-suite builders, unified APIs and embedded integration, and self-hosting. The APIs underneath are [APIs, Events & Rate Limits](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits); rules that run inside a work-management product (Jira Automation, Asana rules) are [Automation Rules](/books/workplace-and-collaboration/automation-rules); the generic engineering of moving data between systems is the playbook's [Data Pipelines](/docs/architecture/data-pipelines). Commerce's version of the same problem, order and inventory sync with an ERP, is [ERP & Integrations](/books/commerce/erp-and-integrations#integration-platforms).

## How the Platforms Do It

As of October 2026:

| Platform | Model | Billing unit | Where it runs | Governance highlights |
| --- | --- | --- | --- | --- |
| **Zapier** | Zaps: trigger, actions, filters and paths, across thousands of app integrations | Tasks: each successful action; triggers, polling and built-in tools don't count | Zapier's cloud | App access controls and action restrictions, managed app connections, SCIM and a one-year audit log on Enterprise |
| **Make** | Scenarios: visual graphs of modules with per-module error handlers | Usage-based, per scenario run | Make's cloud | Error handlers and stored incomplete executions per scenario |
| **Workato** | Recipes: a trigger and actions over connections, sold to IT-run enterprise integration teams | By contract | Workato's cloud | Run by IT rather than by individual employees |
| **Microsoft Power Automate** | Cloud flows (automated, scheduled, instant) over standard and premium connectors; desktop flows for UI automation | Power Platform requests per user or per flow per 24 hours, by license | Microsoft's cloud, in Power Platform environments | Tenant and environment data policies (Business, Non-business, Blocked), advanced connector policies |
| **Slack Workflow Builder** | Workflows started from a link, schedule, emoji, channel event or form, with connector steps | Included with paid plans | Slack | Admins control who builds, which connector and custom steps are allowed, and use in Slack Connect |
| **n8n** | Workflows of nodes, including custom code | Cloud plans, or self-hosting under its license | n8n's cloud or self-hosted | Self-hosting puts credentials and patching with the customer |
| **Merge** | A unified API: one schema per category (HR, ATS, CRM, ticketing, accounting, file storage) over many vendors | Linked accounts: $650 a month for up to 10 on Launch, then $65 each | Merge's cloud | Built into the developer's product, not the customer's admin console |

The pattern: **two markets share the name.** Zapier, Make, Power Automate, Workato, Slack's builder and n8n sell automation to the customer organization, whose employees build the flows. Merge and the embedded integration vendors (Paragon, Prismatic, Workato's embedded offering) sell integrations to software vendors, who ship them inside their own product so their customers can connect a CRM or an HRIS in a settings page. The first market's hard problem is governance; the second's is schema mapping across many vendors' APIs.

## Triggers and Polling

A flow starts in one of three ways:

- **Polling triggers.** The platform asks the source system for new records on a schedule. Zapier's interval is part of the price: 15 minutes on Free, 2 minutes on Pro, 1 minute on Team and Enterprise. Polling is how integration platforms reach APIs that offer no events, and it spends the source system's rate limit on the customer's behalf whether or not anything changed.
- **Instant triggers.** The platform registers a webhook or event subscription with the source and runs when it fires. These inherit the source's delivery rules: expiries to renew, retries to deduplicate, lost events to reconcile ([Event Delivery](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits#event-delivery)).
- **Scheduled and manual triggers.** A clock, a button, a form, a message shortcut, a link in a channel.

The consequence for the source system is that integration platforms are among its heaviest API callers, each multiplied across thousands of customer tenants and polling on schedules the source doesn't control. For the customer, a flow that polls a system every minute is running in that system's per-tenant budget alongside the customer's own apps, which is how one employee's Zap can slow an IT team's sync.

## Billing Units

The unit of billing decides what users optimize and what the platform must meter.

- **Zapier tasks.** A task is counted when an action successfully completes a unit of work. Failed actions, triggers, polling and built-in tools such as Formatter and Paths don't count; some actions cost more than one task. Entry plans are 100 tasks a month on Free, 750 on Pro ($19.99 a month billed annually, $29.99 monthly) and 2,000 on Team ($69 annually, $103.50 monthly). With pay-per-task on, usage continues past the plan at 1.25 times the base rate on annual plans or 2.5 times on monthly plans and pauses at three times the subscription; with it off, Zaps stop at the limit.
- **Power Platform requests.** Every connector call, HTTP action and built-in action counts, including failed actions, retries and pagination. Limits are per 24-hour sliding window: 40,000 for a Power Automate Premium user, 6,000 for Office 365 licenses with seeded Power Automate, 250,000 for a flow with a Process license (stackable to 10 on one flow, or shared across a flow group of up to 25 flows), and a separate 100,000 per five minutes regardless of license. As of October 2026 every tenant is in a transition period where Premium and seeded limits are applied per cloud flow (200,000 a day per flow for Premium, 10,000 for Office 365) rather than per user; Microsoft says enforcement of the per-user limits won't begin until at least six months after Power Automate usage reporting is generally available. Automated and scheduled flows use the owner's limits; instant flows use those of the person who runs them.
- **Merge linked accounts.** A unified API charges per customer connection: the Launch plan is $650 a month for up to 10 production linked accounts with 3 free, $65 for each additional one, and syncs daily; Professional and Enterprise are contracted with configurable sync frequency.

The pattern across units: failed work is free at Zapier and counted at Microsoft, which changes who pays for a broken flow retrying; and per-connection pricing (Merge) prices the integration by the end customer, which suits a vendor reselling it inside a product.

## Failure Handling

A flow fails in the middle more often than at the start: the trigger fired, two actions succeeded, the third hit a 429 or an expired token. The platforms give builders different tools:

- **Zapier Autoreplay**, on paid plans, automatically replays any Zap run that ends in an errored status. Runs that were safely halted aren't replayed, an owner or super admin enables it account-wide, and each Zap can override with "always" or "never replay".
- **Make error handlers** attach to a module: **Skip** ignores the error and processes the remaining bundles, **Retry** stores the incomplete execution for automatic or manual reprocessing, **Resume** substitutes a value for the failed module's output and continues, **Commit** stops and keeps what was processed, and **Rollback** stops and reverts it.
- **Power Automate** runs can last up to 30 days (pending approvals included), and run history is kept for 30 days from the run's start. A cloud flow not triggered for 90 days may be turned off, with 30 days' notice to owners and co-owners, unless its owner has a premium or capacity license.

What no platform can supply is idempotency in the target. Replaying a run whose first two actions succeeded creates the ticket twice unless the action is an upsert keyed on something stable or the target accepts an idempotency key. Builders who don't know that produce duplicates on every outage; platforms that know it expose "find or create" actions and pass the source record's ID through ([What Is Safe to Retry](/docs/architecture/retries-and-timeouts#what-is-safe-to-retry), [Idempotency](/docs/payments/idempotency)).

## Credential Custody

Every action runs as somebody. In an integration platform that somebody is a **connection**: the platform's saved credential to one account in one system, almost always an OAuth grant from the person who built the flow. Microsoft's description of Power Platform is exact: connections "represent a saved credential" stored in the environment that hosts the app or flow. Four consequences follow.

**The flow acts as its builder.** A flow that copies a shared mailbox's attachments into Dropbox does so with the builder's mailbox permissions and the builder's Dropbox account, which may be personal. The source system's audit log records the builder (or the platform's app identity) as the actor for every run, months after the builder last looked at the flow. Slack's Workflow Builder makes the same point in its own terms: connector steps require authenticating the builder's account with the third-party service.

**Leavers break flows, or don't.** When an employee leaves and their account is deactivated, every flow on their connections either fails (the honest outcome) or keeps running on a token the platform still holds, if the source system doesn't revoke on deactivation. Power Automate flows can have co-owners and their owner can be changed through the Web API; Microsoft also notes that a flow whose original owner leaves the organization drops to the Low performance profile. Offboarding is [Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim)'s subject; for integrations, it means inventorying connections by owner and moving business-critical flows to service accounts with documented owners before people leave.

**Shared connections need an owner.** Zapier's Enterprise plan includes managed app connections, so a connection to a business system can belong to the organization rather than an individual. The data model needs the same: a connection owned by a group or service identity, with a human accountable for it.

**The platform is a concentration of tokens.** An integration platform holds standing OAuth grants into thousands of customers' CRMs, file stores and mailboxes. The 2025 theft of the Salesloft Drift integration's tokens ([When an App's Tokens Are Stolen](/books/workplace-and-collaboration/apps-and-marketplaces#when-an-app-s-tokens-are-stolen)) is the failure this creates: an attacker who reaches the platform's token store reaches every connected tenant at once. For the customer, each connection is a third-party processor with a key; for the platform, token encryption, scope minimization and fleet-wide revocation are the core of the security program, not features.

## Governance

The customer's controls are the reason an IT team allows these platforms at all.

**Power Platform data policies** are the most developed. Admins create tenant-level or environment-level policies that sort connectors into three groups: **Business**, **Non-business** and **Blocked**. Connectors in different groups can't be used together in one app or flow, so with SharePoint and Salesforce in Business and Gmail in Non-business, nobody can build a flow that moves SharePoint data to Gmail; blocked connectors can't be used at all. New connectors land in the policy's default group, Non-business unless changed, and Microsoft advises leaving it there and moving connectors deliberately. Some connectors can't be blocked: core platform connectors (Dataverse, Approvals, Notifications) and the Microsoft 365 standard connectors (SharePoint, Teams, Outlook, OneDrive for Business and others) can only be classified Business or Non-business. Custom connectors are classified at the environment level or, at the tenant level, by ordered URL patterns. When a policy changes, flows that violate it are suspended and connections to newly blocked connectors are disabled; Microsoft puts full enforcement at under an hour in most tenants and up to 24 hours at the extreme. **Advanced connector policies** add a strict allowlist in which every certified connector is blocked unless allowed, including the otherwise unblockable ones and connectors that expose MCP servers to Copilot Studio agents.

**Zapier Enterprise** offers app access controls and action restrictions (which apps and which actions employees may use), SAML SSO and SCIM provisioning, managed connections, custom data retention, and an audit log kept one year (six months on Team).

**Slack Workflow Builder** is on by default for full members, and admins can manage who builds, restrict connector steps and custom steps, decide whether external organizations can use workflows in Slack Connect conversations, and see published workflows on a dashboard. Connector steps may also require the connector app's approval through Slack's app approval process ([Admin Approval and Consent](/books/workplace-and-collaboration/apps-and-marketplaces#admin-approval-and-consent)).

The rules that cross the three:

- **Classify data paths, not just apps.** Allowing Gmail and allowing SharePoint is fine; allowing a flow between them is the decision. Power Platform's group rule is the cleanest expression of it.
- **New connectors start untrusted.** The default group for anything new is the restrictive one.
- **Inventory flows by owner and connection.** The admin's view is a list of every flow, who owns it, which connections it uses and which systems it bridges.
- **Expect shadow integration when the sanctioned path is slow.** An approval queue that takes weeks sends employees to personal accounts on [unsanctioned platforms](/books/workplace-and-collaboration/no-code-databases-and-internal-tools#governance-and-shadow-apps), where none of the above applies.

The policy engine these controls sit in, and their place among other tenant policies, is the subject of [Admin Consoles & Policies](/books/workplace-and-collaboration/admin-consoles-and-policies).

## In-Suite Builders

Every suite now ships its own builder, and the suite's builder has two advantages over an outside platform: it runs inside the suite's tenant, retention and audit, and it needs no new vendor in procurement. Slack's Workflow Builder, on paid plans, starts workflows from a link, a schedule, an emoji reaction, joining or creating a channel, with conditional branches and connector steps to third-party services; creators and workflow managers can see activity logs, edit and download form responses. Power Automate is the Microsoft 365 builder, with standard connectors included in Microsoft 365 licenses and premium connectors licensed separately. Google's equivalents are Apps Script and AppSheet. Work-management products carry their own rule engines, which [Automation Rules](/books/workplace-and-collaboration/automation-rules) covers.

The outside platforms win on breadth: thousands of connectors across vendors no suite will build for. Organizations usually run both: the suite's builder for workflows inside the suite, an outside platform for flows that cross vendors, and a governance gap between them.

## Unified APIs and Embedded Integration

A software vendor whose customers each use a different HRIS, ATS or CRM faces the same integration many times. A **unified API** collapses a category into one schema: Merge offers common models for accounting, ATS, CRM, file storage, HR and payroll, and ticketing; the vendor integrates once, and an end customer connects their own system, producing a linked account and an account token the vendor stores. Merge recommends combining its "linked account synced" webhook with incremental pulls using `modified_after`, and polling a `/sync-status` endpoint at least every 24 hours because webhooks can fail; each common model reports its own sync status.

**Embedded integration platforms** (Paragon, Prismatic, Workato's embedded product) take the other approach: instead of one normalized schema, they give the vendor a workflow engine and connector library to build and host per-vendor integrations under the vendor's own brand.

The trade-off is the usual one for abstractions. A unified schema is fast to adopt and covers the common fields; anything beyond it (a custom field in one customer's Salesforce, a Workday-specific object) falls back to passthrough requests or a different tool. And the custody question returns one layer down: the unified API vendor now holds tokens to every end customer's HR system, which the software vendor's own customers will ask about in their security reviews.

## Self-Hosting

n8n is the main automation platform a customer can run on its own infrastructure. Its code is published under the Sustainable Use License, which permits use and modification for the user's own internal business purposes or for non-commercial or personal use, and permits distribution only free of charge and for non-commercial purposes; files marked `.ee` require a separate enterprise license. Running it internally to automate one's own company is the licensed case; offering it to others as a hosted service is not.

Self-hosting moves custody back inside: the credential store, the execution logs and the network path to internal systems stay with the customer, which is the reason regulated teams choose it. It also moves the platform's security program inside. A self-hosted automation server holds credentials to everything it connects and often accepts inbound webhooks from the internet, so patch cadence, network exposure and secret management become the customer's job ([Vulnerability Management](/docs/security/vulnerability-management)).

## How to Build It

Integration in the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) shows up as `apps` and `app_installations` (the platform's app installed in a workspace) and `api_tokens` (the grant it holds). A product that offers its own workflow builder, or a platform that runs customers' flows, adds connections with owners, flows with versions, runs with step-level outcomes, and connector policies. The names carry an `integration_` prefix to stay distinct from in-product rule engines:

```sql
CREATE TABLE integration_connections (       -- a saved credential to one external account
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  connector_key    TEXT NOT NULL,            -- 'salesforce', 'gmail', 'http'
  external_account TEXT NOT NULL,            -- the account signed in, as reported
  owner_member_id  UUID REFERENCES members (id),
  owner_group_id   UUID REFERENCES groups (id),  -- shared, managed connection
  scopes           TEXT[] NOT NULL DEFAULT '{}',
  secret_ref       TEXT NOT NULL,            -- key into the secret store, never the token
  status           TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked',
                     'disabled_by_policy', 'owner_departed')),
  last_used_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((owner_member_id IS NULL) <> (owner_group_id IS NULL))
);

CREATE TABLE integration_flows (             -- a Zap, scenario, recipe or workflow
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  name             TEXT NOT NULL,
  owner_member_id  UUID NOT NULL REFERENCES members (id),
  co_owner_ids     UUID[] NOT NULL DEFAULT '{}',
  current_version  INT NOT NULL,
  trigger_kind     TEXT NOT NULL CHECK (trigger_kind IN ('polling', 'event', 'schedule',
                     'manual', 'form')),
  poll_interval_s  INT,                      -- capped by plan
  status           TEXT NOT NULL CHECK (status IN ('on', 'off', 'suspended_policy',
                     'suspended_inactive', 'suspended_quota')),
  replay_policy    TEXT NOT NULL DEFAULT 'account' CHECK (replay_policy IN ('account',
                     'always', 'never')),
  last_triggered_at TIMESTAMPTZ
);

CREATE TABLE integration_flow_versions (     -- the definition, immutable once published
  flow_id          UUID NOT NULL REFERENCES integration_flows (id),
  version          INT NOT NULL,
  definition       JSONB NOT NULL,           -- steps, mappings, error handlers
  connection_ids   UUID[] NOT NULL,          -- every connection the steps use
  connector_keys   TEXT[] NOT NULL,          -- denormalized for policy checks
  published_by     UUID NOT NULL REFERENCES members (id),
  published_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (flow_id, version)
);

CREATE TABLE integration_flow_runs (         -- one execution, with per-step outcomes
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  flow_id          UUID NOT NULL REFERENCES integration_flows (id),
  flow_version     INT NOT NULL,
  trigger_event_id TEXT,                     -- source record or delivery ID: dedupe key
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  outcome          TEXT NOT NULL CHECK (outcome IN ('running', 'succeeded', 'errored',
                     'halted', 'incomplete', 'rolled_back')),
  billable_units   INT NOT NULL DEFAULT 0,   -- tasks, requests or operations
  steps            JSONB NOT NULL DEFAULT '[]',  -- step, connection, status, target ID
  replay_of        UUID REFERENCES integration_flow_runs (id),
  UNIQUE (flow_id, trigger_event_id, replay_of)
);

CREATE TABLE connector_policies (            -- the admin's data-path rules
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID REFERENCES workspaces (id),  -- null: organization-wide
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  connector_key    TEXT,                     -- null: the default group
  url_pattern      TEXT,                     -- for custom and HTTP connectors
  data_group       TEXT NOT NULL CHECK (data_group IN ('business', 'non_business',
                     'blocked')),
  blocked_actions  TEXT[] NOT NULL DEFAULT '{}',
  rule_order       INT,                      -- pattern rules evaluate in order
  valid_during     TSTZRANGE NOT NULL
);
```

Notes on the sketch:

- **Policy is checked on publish and on change.** Publishing a flow version computes the data groups of its `connector_keys` and refuses a mix of business and non-business; a policy change re-evaluates every published version and sets `status = 'suspended_policy'` and connections to `disabled_by_policy`, the Power Platform behavior.
- **Owner departure is an event.** Deactivating a member (from SCIM or the admin) marks their connections `owner_departed`, notifies co-owners and the workspace admin, and lists every flow affected; whether flows keep running is a workspace setting, defaulting to stop.
- **Runs carry a dedupe key.** `trigger_event_id` plus `replay_of` makes a replay a new run linked to the original, and each step records the target ID it created, so a replay can skip or upsert instead of duplicating.
- **Billing reads runs.** `billable_units` follows the platform's rule (successful actions only, or every action including failures), written once when the run ends and summed into usage ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating)).
- **Secrets stay out of the row.** `secret_ref` points into a secret store with its own access log; the database never holds a token ([Store a Hash, Show the Key Once](/docs/api-design/authentication#store-a-hash-show-the-key-once) for the platform's own keys).

## Auditing

- **Every connection created, refreshed, revoked or orphaned,** with the external account and scopes, so a security team can answer "which outside accounts can our automation reach."
- **Every flow version published,** with the connectors and connections it uses and who published it; a flow bridging data groups that predates a policy is reported, not silently suspended.
- **Run history with step outcomes,** kept at least as long as the platform's retention (30 days at Power Automate) and longer where the flow moves regulated records.
- **Policy changes and their effects:** flows suspended and connections disabled by each change.
- **Actions in target systems attributed to the flow,** not only to the connection's owner, so a record created by automation is distinguishable from one a person made ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## What This Means for the System You Build

- **Treat every connection as a credential with an owner,** prefer organization-owned connections for business flows, and plan for the owner leaving.
- **Govern data paths:** classify connectors and refuse flows that bridge classes, with new connectors starting in the restrictive group.
- **Make replays safe:** carry a stable trigger ID, record created target IDs, and offer upsert actions.
- **Prefer events to polling,** and expose your own events so integration platforms don't poll you.
- **Pick a billing unit deliberately;** charging for failed actions changes who pays for an outage.
- **If you sell integrations inside your product,** a unified API covers the common fields fast and leaves you holding your customers' tokens to other vendors' systems.
- **Self-hosting is custody, not just cost:** it keeps tokens inside and makes patching your job.

## References

**Vendor documentation**

- [Zapier: Pricing](https://zapier.com/pricing), plans, prices, task counts, polling intervals, task counting rules, pay-per-task overage and Enterprise controls
- [Zapier Help: Replay failed Zap runs automatically](https://help.zapier.com/hc/en-us/articles/8496241726989-Replay-failed-Zap-runs-automatically), Autoreplay's plans, scope and overrides
- [Make Help: Error handlers](https://help.make.com/error-handlers), Skip, Retry, Resume, Commit and Rollback, and incomplete executions
- [Workato Docs: Recipes](https://docs.workato.com/en/recipes.html), recipes as a trigger, actions and connections
- [Microsoft Learn: Data policies](https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention), connections as saved credentials, MCP connectors, design-time and runtime enforcement, suspension and enforcement latency
- [Microsoft Learn: Connector classification](https://learn.microsoft.com/en-us/power-platform/admin/dlp-connector-classification), Business, Non-business and Blocked groups, the cross-group rule, unblockable connectors, custom connector patterns, the default group and advanced connector policies
- [Microsoft Learn: Requests limits and allocations](https://learn.microsoft.com/en-us/power-platform/admin/api-request-limits-allocations), what counts as a request, limits by license, Process licenses and flow groups, the five-minute limit, the transition period and whose limits a flow uses
- [Microsoft Learn: Limits of automated, scheduled, and instant flows](https://learn.microsoft.com/en-us/power-automate/limits-and-config), 30-day run duration and retention, 90-day inactivity suspension and the departed-owner performance profile
- [Slack Help: Guide to Workflow Builder](https://slack.com/help/articles/360035692513-Guide-to-Workflow-Builder), paid plans, triggers, connector steps, admin controls and workflow management
- [n8n: License](https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md), the Sustainable Use License's permitted uses and distribution terms and the enterprise-licensed files
- [Merge: Pricing](https://www.merge.dev/pricing), plans, linked account pricing, sync frequency and categories
- [Merge Docs: Syncing data](https://docs.merge.dev/basics/syncing-data/), account tokens, the sync webhook, `modified_after` pulls and `/sync-status` polling

**Incident reports**

- [Google Threat Intelligence Group: Data theft from Salesforce instances via Salesloft Drift](https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift), stolen integration tokens used across many customers' tenants
