+++
title = "Migrations, Imports & Switching"
description = "Moving collaboration data: Atlassian's Server and Data Center endings, importers between tools, merger tenant moves, export by plan and the EU Data Act."
category = "Workplace & Collaboration Industry"
order = 2065
part = "Running the Platform"
tags = ["migrations", "imports", "exports", "data-portability", "eu-data-act"]
nav_title = "Migrations & Switching"
+++

Collaboration data is hard to move because its value is in its connections. A message matters because of the thread it's in, the channel's members, the file it links to and the person who wrote it; an issue matters because of its links, history, watchers, workflow state and the commits that reference it; a page matters because of its children, comments, permissions and the macros that render other pages into it. An export flattens those connections into files, and an import has to rebuild them in a product with a different model. Identity makes it worse: every author, assignee and mention must be mapped to an account in the destination, and the destination's accounts usually don't exist yet.

Migrations happen for four reasons, and each has its own forcing function: a vendor ends a product (Atlassian Server, then Data Center), a customer switches vendors (Slack to Teams, Jira to Linear, Confluence to Notion), two companies merge or one divests (tenant-to-tenant moves), or a regulation requires the vendor to make leaving possible (the EU Data Act). In every case the customer's admin owns the decision and the data, and the vendors on both sides decide how hard the move is. This chapter covers each, the export options vendors offer by plan, the importers and APIs on the receiving side, and what a vendor must build to be easy to join and lawful to leave. It adds import jobs, ID maps, tenant exports and switching requests to the core data model. The playbook covers the general engineering: [Replacing Systems](/docs/architecture/replacing-systems), and Hosting & Cloud covers infrastructure moves and shutdowns in [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life) and [Egress & Switching](/books/hosting-and-cloud/egress-and-switching).

## How the Platforms Do It

| Path | What the vendors provide, as of October 2026 | What doesn't move |
| --- | --- | --- |
| **Slack export** | Free and Pro: public channel messages and file links in JSON (Free: file links only from the last 90 days); Business+: Owners can apply for a self-serve tool covering private channels and DMs, with scheduled weekly or monthly exports; Enterprise: custom exports by conversation type, member or workspace in JSON or TXT, through Support | Private conversations without an approved application; files themselves (links require an API token to fetch) |
| **Slack to Teams** (Microsoft's guidance) | Map workspaces to teams (one team for workspaces under 200 channels, the per-team limit); copy files into channel document libraries; import history with the Graph migration API | DMs into Teams per the guidance page; apps and workflows (rebuilt as Teams apps or connectors) |
| **Teams import API** | `startMigration`, message import with original `createdDateTime` and author, `completeMigration`, on existing channels and chats including 1:1 and group chats; up to 250 reactions, replies, mentions, inline images; five requests per second per channel | Videos, cross-posts between channels, federated content; corrections require deleting and re-migrating |
| **Confluence to Notion** | Zip importer up to 5 GB (15 GB on request); API importer for whole workspaces up to 30 GB, preserving comments and mapping users; imports around 50,000 pages or 30 GB may fail | Permissions (imported pages are private to the importer); most macros flattened to text, images or links |
| **Jira to Linear** | One-time import of history, separate from Jira Sync, which keeps new and updated issues flowing both ways and maps epics to projects | Import filters don't carry over to sync |
| **Exchange tenant to tenant** | Cross-tenant mailbox migration through Exchange Online PowerShell and MRS, with an organization relationship between tenants; a one-time per-user Cross Tenant User Data Migration license that also covers OneDrive | Migrations without the license fail; Microsoft "doesn't offer exceptions" |
| **Atlassian Server and Data Center to Cloud** | Atlassian Migration Program, migration trials for the length of the Data Center subscription, step-up credits for unused maintenance, dual licensing for larger customers | Read-only instances after Data Center end of life |

The patterns:

- **Exports are gated by plan; imports are free.** Every vendor makes it easy to bring data in. Getting it out varies: Slack's export depth climbs with the plan and needs an approved application for private conversations. The asymmetry is commercial, and the EU Data Act is aimed at it.
- **Permissions don't survive.** Notion's Confluence importer makes every imported page private to the importer; Microsoft's guidance has the admin rebuild team membership. Permissions are the hardest structure to map, because every product's permission model differs ([The Permission Service](/books/workplace-and-collaboration/collaboration-architecture#the-permission-service) shows why).
- **History import needs a special mode.** Teams' migration mode is the clean version: a state in which the destination accepts back-dated messages with arbitrary authors, shows a banner that messages "may be out of order," and is closed explicitly. Without such a mode, imported history either shows the importer as author or the import date as timestamp.
- **Sync beats one-time import for long transitions.** Linear pairs a one-time import with ongoing two-way sync, so teams can move gradually.

## When the Vendor Ends the Product: Atlassian

Atlassian's move off self-managed software is the largest planned migration in workplace software. The dates, from Atlassian's licensing pages:

- **February 2, 2021:** Server app sales ended.
- **February 15, 2024:** end of support for Server products, including Jira, Confluence, Bitbucket, Crowd and Bamboo: "Support and bug fixes are no longer available."
- **March 30, 2026:** Data Center end of sale for new customers.
- **March 30, 2028:** end of new Data Center subscriptions, expansions and Marketplace app sales for existing customers.
- **March 28, 2029:** end of life for Jira Software, Jira Service Management, Confluence and Crowd Data Center, Data Center mobile apps, and Atlassian and Marketplace apps for them. Bitbucket, Bamboo and Jira Align Data Center are excluded. At end of life the instance becomes read-only: data stays accessible, but nothing new can be added, support and updates end, and Atlassian advises against running it connected to the internet.
- **May 15, 2028:** end of support for Fisheye and Crucible.

The offers attached to the deadline show what a vendor-driven migration needs: assessment and planning help (the Atlassian Migration Program), cloud trials that last the whole remaining Data Center term instead of seven days, step-up credits that offset paying twice by crediting unused maintenance, dual licensing for larger customers during the move, a first-year Cloud Enterprise discount for purchases by June 2027, and specialized partners for complex cases.

For an enterprise customer, the hard parts of a self-managed-to-cloud move are rarely the core data. They are apps (each Marketplace app has its own cloud equivalent, or none), customizations (scripted fields, custom workflows, direct database integrations), identity (local directories to the cloud organization and SSO), and compliance (residency, keys and audit, which the self-managed instance handled on the customer's own terms). The lifecycle of a shutdown is in [The Lifecycle of a Sunset](/books/hosting-and-cloud/migrations-and-end-of-life#the-lifecycle-of-a-sunset).

## When the Customer Switches

A switch between vendors runs through the customer's admin, with both vendors as tools. The phases, from Microsoft's Slack-to-Teams guide and the import APIs:

1. **Assess.** Inventory workspaces, channels, members and apps, with usage, to decide what to move and what to leave. Microsoft's guide points admins at Slack's analytics pages for channel activity and member types.
2. **Map identity.** Build a user-ID map from source accounts to destination accounts before anything else. Email addresses in the source may not match work accounts in the destination; Microsoft publishes a script that compares a Slack export's users against Entra ID.
3. **Map structure.** Source containers rarely map one-to-one. A Slack workspace becomes one team or several; channels become channels in a team (Teams allows 200 per team) or are left behind. Confluence spaces become Notion teamspaces or page trees; Jira projects, issue types and workflows become Linear teams, labels and states.
4. **Export.** What the source's plan allows, with the approvals it requires.
5. **Import.** Content in dependency order: containers, then items, then replies and comments, then reactions and attachments, so references resolve. Back-date and attribute through the destination's migration mode.
6. **Rebuild what doesn't move.** Permissions, apps, automations, integrations and saved views.
7. **Cut over.** Microsoft suggests removing source access at an agreed date as each user joins the destination, "to avoid needing to re-export and import delta changes." The alternative is a sync period, which costs more and lowers the risk.

The source vendor holds two levers that make this easier or harder: the completeness of the export (private conversations, files, edit history, permissions) and the rate at which its API allows a full-tenant export. A vendor that wants to be trusted as a destination must be a good source as well; the EU now requires it.

There is also a vendor-to-vendor version: a product that exits a market by agreement with a competitor sends its customers to the competitor, as Atlassian's HipChat and Stride did to Slack in 2018. I couldn't open Atlassian's announcement of that deal at its original address, so the dates and terms are left to The Collaboration Landscape. <!-- source-gap: hipchat-stride-slack-2018 | missing | Atlassian sold HipChat and Stride IP to Slack and ended both products, with migration to Slack | closes with: Atlassian's 2018 announcement or a filing describing the deal | checked: 2026-10-29 -->

## Tenant to Tenant: Mergers and Divestitures

Mergers create the opposite problem: two tenants of the same product that must become one, or one tenant that must split. Microsoft's cross-tenant mailbox migration exists for exactly this: "During mergers or divestitures, you might need the ability to move your users' Exchange Online mailboxes into a new tenant." It runs through Exchange's mailbox replication service with an organization relationship configured on both sides, requires target mail users prepared to match the source (including the source's ExchangeGUID), and requires a one-time per-user Cross Tenant User Data Migration license, which also covers OneDrive; without it "the migration fails."

The general shape of a tenant-to-tenant move:

- **A trust between the two admins.** Both tenants consent, usually through an organization relationship or a migration app approved on each side. Neither vendor support nor one admin alone can move another tenant's data.
- **Identity first.** Accounts are created or matched in the target, domains are moved (a verified domain can belong to only one organization at a time, so the domain move is a scheduled cutover), and SSO is repointed.
- **Content with its IDs remapped.** Every reference (mentions, links, permissions, app installs) must be rewritten from source IDs to target IDs.
- **A period of coexistence.** Free/busy, mail routing and cross-tenant chat must work while users are split between tenants, which is where guest and external access features (Guests & Cross-Org Collaboration) carry the load.
- **Retention and holds travel.** A legal hold in the source must be honored in the target, or the source must be kept until the hold is released. A merger doesn't suspend a preservation duty.

For the vendor, a tenant-to-tenant move inside its own product is the same machinery as a residency move or a rebalance: copy, catch up, verify, cut over ([Logical Shards and Moving Tenants](/books/workplace-and-collaboration/collaboration-architecture#logical-shards-and-moving-tenants)), plus ID remapping when the target is a different tenant rather than the same tenant elsewhere.

## The EU Data Act: Switching as a Duty

Regulation (EU) 2023/2854, the Data Act, is "applicable from 12 September 2025," and its chapter on switching between data processing services covers SaaS as well as infrastructure. The Commission's summary of the obligations:

- **For PaaS and SaaS:** make open interfaces available and, at a minimum, export data in a "commonly used and machine-readable format."
- **For IaaS:** take measures toward "functional equivalence," materially comparable outcomes for shared features after switching.
- **For all providers:** remove obstacles that prevent customers from switching or using several services in parallel, and meet minimum contractual transparency requirements.
- **Charges:** providers may charge for switching and data egress during a transitional period from January 11, 2024 to January 12, 2027; from January 12, 2027, switching charges, including egress charges, are removed entirely.

The contract clocks (maximum notice, the transitional period to complete the switch, and the minimum period for data retrieval after termination) are set in Article 25 and summarized in [The EU Data Act](/books/hosting-and-cloud/egress-and-switching#the-eu-data-act), with the cost-based charges of Article 29 and the exemptions of Article 31.

For a collaboration vendor selling in the EU, the practical consequences:

- **Export can't be a premium feature for EU customers' data.** Gating a complete export of private conversations behind a plan or a manual approval is hard to square with an obligation to remove obstacles to switching. Vendors will need a complete, self-serve, machine-readable tenant export on every paid plan, with documented formats.
- **The export must be usable.** "Commonly used and machine-readable" means documented JSON or similar with stable schemas, including the structure that gives the data meaning: threads, memberships, versions, authors and timestamps.
- **Switching has a process with clocks.** A switching request starts a notice period and a transition the contract must state; the vendor needs to track them per customer, alongside the retrieval window after termination.
- **No switching fees from 2027.** A vendor that charges for bulk exports, export assistance or egress during a switch must stop for EU customers from January 12, 2027.

## Export Formats

There is no standard export format for collaboration data. Each vendor publishes its own (Slack's JSON per channel per day; Confluence's HTML or XML space exports; Jira's CSV and XML), and every importer is a translator. What makes a format good for switching:

- **Complete structure.** Containers, memberships, items, replies, edits and versions, reactions, attachments with their bytes (or durable signed links), and authors as stable IDs with a separate user list.
- **Stable IDs.** So an incremental export can be merged with a previous one, and a destination can keep a map from source IDs to its own.
- **Timestamps in UTC with precision,** because importers order and deduplicate by them (Teams' import truncates to milliseconds and requires unique timestamps per thread).
- **Permissions as data,** even when the destination can't apply them directly, so the admin can rebuild them.
- **A manifest** listing every file, its checksum and the export's scope and time range.

eDiscovery exports are a different product with different requirements (review formats, custodians, chain of custody); eDiscovery & Export covers them.

## Importers and Migration Mode

A receiving vendor's importer is its sales tool, and the quality bar is set by how much of the source's meaning survives. The design pattern from the Teams API generalizes:

- **A migration state on the container** in which back-dated content and other authors are accepted, normal notifications are suppressed (an import must not page everyone for a decade of old mentions), and users see that the container is being populated.
- **Explicit completion,** after which the container behaves normally and imported items are indistinguishable from native ones except for an import marker.
- **Idempotent item import** keyed by source ID, so a retried batch doesn't duplicate.
- **An ID map** from source IDs to destination IDs, kept after the import, so later passes (replies, links, a delta sync) can resolve references.
- **Rate limits sized for imports,** separate from interactive API limits (Teams documents five requests per second per channel for import).
- **A report** of what didn't import and why.

## How to Build It

Core tables (`workspaces`, `containers`, `items`, `members`, `accounts`) are fixed. This chapter adds the import pipeline, its ID map, tenant exports, and Data Act switching requests.

```sql
ALTER TABLE containers
  ADD COLUMN migration_state TEXT NOT NULL DEFAULT 'none'
    CHECK (migration_state IN ('none', 'in_progress', 'completed')),
  ADD COLUMN history_starts_at TIMESTAMPTZ;   -- earliest back-dated item allowed

ALTER TABLE items
  ADD COLUMN imported_from TEXT,              -- 'slack', 'confluence', 'jira'
  ADD COLUMN source_id     TEXT;              -- stable ID in the source system

CREATE TABLE import_jobs (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  source_system   TEXT NOT NULL,
  source_ref      TEXT NOT NULL,              -- export file digest or source tenant id
  requested_by    UUID NOT NULL REFERENCES members (id),
  phase           TEXT NOT NULL CHECK (phase IN ('mapping_identities', 'mapping_structure',
                    'importing', 'resolving_references', 'completed', 'failed')),
  counts          JSONB NOT NULL DEFAULT '{}',  -- {"items": 1820455, "skipped": 912}
  skipped_report  TEXT,                       -- stored report of what didn't import
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ
);

CREATE TABLE import_id_map (                  -- source IDs to ours, kept after import
  import_job_id   UUID NOT NULL REFERENCES import_jobs (id),
  source_kind     TEXT NOT NULL,              -- 'user', 'channel', 'message', 'page'
  source_id       TEXT NOT NULL,
  target_table    TEXT NOT NULL,              -- 'accounts', 'containers', 'items'
  target_id       UUID NOT NULL,
  PRIMARY KEY (import_job_id, source_kind, source_id)
);

CREATE TABLE tenant_exports (                 -- portability exports, not eDiscovery
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  requested_by    UUID NOT NULL REFERENCES members (id),
  scope           TEXT NOT NULL CHECK (scope IN ('public_only', 'all_conversations',
                    'members', 'full_tenant')),
  covers          TSTZRANGE NOT NULL,         -- content time range
  format_version  TEXT NOT NULL,              -- documented schema version
  incremental_of  UUID REFERENCES tenant_exports (id),
  status          TEXT NOT NULL CHECK (status IN ('queued', 'running', 'ready',
                    'expired', 'failed')),
  manifest_ref    TEXT,                       -- file list with checksums
  ready_at        TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  charge          BIGINT NOT NULL DEFAULT 0   -- must be 0 for EU switching after 2027-01-12
);

CREATE TABLE switching_requests (             -- EU Data Act switching, per customer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  requested_at        TIMESTAMPTZ NOT NULL,
  destination         TEXT NOT NULL CHECK (destination IN ('other_provider',
                        'on_premises', 'erasure')),
  notice_ends_at      TIMESTAMPTZ NOT NULL,   -- from the contract's notice period
  transition_ends_at  TIMESTAMPTZ NOT NULL,   -- from the contract's transitional period
  retrieval_ends_at   TIMESTAMPTZ,            -- set at termination
  export_ids          UUID[] NOT NULL DEFAULT '{}',
  switching_charge    BIGINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('received', 'in_transition',
                        'completed', 'extended'))
);
```

Importing a message idempotently, inside a container in migration mode:

```sql
-- $1: import job, $2: source message id, $3: container, $4: source author id,
-- $5: original timestamp, $6: body
WITH author AS (
  SELECT target_id FROM import_id_map
  WHERE import_job_id = $1 AND source_kind = 'user' AND source_id = $4
),
ins AS (
  INSERT INTO items (id, workspace_id, container_id, kind, author_account_id,
                     created_at, imported_from, source_id)
  SELECT uuidv7(), c.workspace_id, c.id, 'message', author.target_id, $5, j.source_system, $2
  FROM containers c, author, import_jobs j
  WHERE c.id = $3 AND j.id = $1
    AND c.migration_state = 'in_progress'
    AND $5 >= c.history_starts_at
  ON CONFLICT (workspace_id, imported_from, source_id) DO NOTHING
  RETURNING id
)
INSERT INTO import_id_map (import_job_id, source_kind, source_id, target_table, target_id)
SELECT $1, 'message', $2, 'items', id FROM ins
ON CONFLICT DO NOTHING;
-- the message body goes into the messages kind table keyed by the new item id
```

Notes on the sketch:

- **Back-dating is only allowed in migration mode.** A normal write can't set `created_at` in the past; a container in `in_progress` accepts timestamps after `history_starts_at`, and notifications, unread counts and webhooks for imported items are suppressed until `completed`.
- **Uniqueness on source IDs.** A unique index on `(workspace_id, imported_from, source_id)` makes every import retry-safe.
- **The ID map outlives the job.** Later passes resolve replies, links and mentions through it, and a delta import after cutover uses it to update rather than duplicate.
- **Exports have a documented, versioned format.** `format_version` names the published schema; a full-tenant export is available to admins on every paid plan, and `incremental_of` lets large tenants take a baseline and then deltas during a switch.
- **Switching clocks are data.** The notice and transition ends are computed from the customer's agreement terms ([agreement commitments](/books/workplace-and-collaboration/selling-to-enterprises#how-to-build-it)) when a request arrives, and a job alerts the account team before each passes.
- **Charges are checked.** For EU customers, a non-zero `charge` or `switching_charge` on or after January 12, 2027 fails a constraint check in the billing path, not a policy document.
- **Holds survive the move.** An export or tenant move that would delete source data checks `legal_holds` first; held content stays in the source until the hold is released.

## Auditing

- **Every export:** who requested it, its scope and time range, when it was downloaded and by whom, and when it expired, because an export is a full copy of the company's conversations.
- **Every import:** source, counts, skips and the identity map decisions, so a missing or misattributed item can be traced.
- **Every tenant-to-tenant move:** the consent on both sides, the domains moved, and the deletion of source data after cutover.
- **Every switching request:** the dates, the exports delivered, any charges and their basis.

## What This Means for the System You Build

- **Offer a complete, documented, machine-readable tenant export on every paid plan,** including private content and structure, without manual approval.
- **Make exports incremental and API-friendly** for large tenants, with rate limits sized for a full copy.
- **Build an importer with a migration mode:** back-dated, attributed, idempotent, notification-free, explicitly completed.
- **Map identity first** and keep the ID map after the import.
- **Treat permissions as data** in exports even when they can't be applied directly.
- **Reuse tenant-move machinery** for mergers, with consent from both admins and ID remapping.
- **Track Data Act switching clocks and zero charges** for EU customers from January 12, 2027.
- **If you end a product, give years of notice,** trials and credits that remove the cost of paying twice, and a read-only end state.

## References

**Vendor documentation**

- [Atlassian: Server end of support](https://www.atlassian.com/licensing/server-end-of-support), Server app sales end February 2, 2021, end of support February 15, 2024, Fisheye and Crucible May 15, 2028
- [Atlassian: Data Center end of life](https://www.atlassian.com/licensing/data-center-end-of-life), end of sale for new and existing customers, end of life March 28, 2029, affected and excluded products, read-only state and migration offers
- [Slack Help Center: Export your workspace data](https://slack.com/help/articles/201658943-Export-your-workspace-data), export scope by plan, approvals, scheduled exports, the 90-day file link limit on Free, who can export
- [Microsoft Learn: Migrate from Slack to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams), assessment, identity mapping script, workspace-to-team mappings, the 200-channel limit, DMs, apps and cutover advice
- [Microsoft Learn: Import third-party platform messages to Teams using Microsoft Graph](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams), migration mode, content in and out of scope, timestamps, completion and the five-per-second throttle
- [Microsoft Learn: Cross-tenant mailbox migration](https://learn.microsoft.com/en-us/microsoft-365/enterprise/cross-tenant-mailbox-migration), merger and divestiture use, organization relationships, target preparation and the per-user license
- [Notion Help Center: Import from Confluence](https://www.notion.com/help/import-from-confluence), zip and API importers, size limits, what transfers and that permissions don't
- [Linear Docs: Jira](https://linear.app/docs/jira), one-time import versus ongoing Jira Sync

**Law and regulation**

- [European Commission: Data Act](https://digital-strategy.ec.europa.eu/en/policies/data-act), application from September 12, 2025 and the switching framework
- [European Commission: Data Act explained](https://digital-strategy.ec.europa.eu/en/factpages/data-act-explained), SaaS and PaaS export and interface duties, IaaS functional equivalence, and switching charges removed from January 12, 2027
