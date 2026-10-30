+++
title = "No-Code Databases & Internal Tools"
nav_title = "No-Code & Internal Tools"
description = "Airtable, Notion databases, Lists and Power Apps, AppSheet, Retool and Coda: user-owned schemas, formulas, limits, connector policies, shadow apps."
category = "Workplace & Collaboration Industry"
order = 2027
part = "Docs, Wikis and Files"
tags = ["workplace", "no-code", "low-code", "internal-tools", "governance"]
+++

Every company runs on spreadsheets that outgrew themselves. The hiring tracker with forty columns, the equipment register with a photo per row, the vendor list that three departments edit: at some point someone moves it into a no-code database, adds a form, a few automations and an interface, and it becomes an application that nobody in IT built and the business can't run without. No-code databases (Airtable, Notion databases, Microsoft Lists, Superhuman Docs, formerly Coda) and low-code app builders (Power Apps, AppSheet, Retool) are the products that make this easy, and their vendors' hardest problems come from the same ease.

The schema belongs to the user. A member can add a field, change its type, rename it or delete it at any moment, and every view, formula, automation, integration and API client built on it has to cope. The data is the customer's business records, sometimes personal data and sometimes regulated, held in a tool the customer's admins may not know exists. And the apps connect to everything, which is where data leaks: a flow that copies the CRM into a personal spreadsheet is two connectors and a trigger. The inversion is sharper here than anywhere in the book: the vendor provides a database engine and an app runtime, and the customer's makers design the schema while the customer's admins have to govern applications they didn't commission.

This chapter covers the platforms, the user-defined schema, formulas and computed fields, limits, the gap between a database and an app, and governance of what the book calls shadow apps. Custom fields as a general engineering pattern are [Custom Fields](/docs/architecture/custom-fields); triggers and actions inside work tools are [Automation Rules](/books/workplace-and-collaboration/automation-rules); cross-tool integration platforms (Zapier, Make, Power Automate as an iPaaS) are [Integration Platforms & Workflow Builders](/books/workplace-and-collaboration/integration-platforms).

## How the Platforms Do It

As of October 2026:

| Platform | Shape | Data lives in | Notable published limits | Governance surface |
| --- | --- | --- | --- | --- |
| **Airtable** | Bases of linked tables with typed fields, views, interfaces and automations | Airtable | Records per base 1,000 (Free) to 125,000 (Business); API 5 requests a second per base | Plan limits; Enterprise Scale terms set by sales |
| **Notion databases** | Databases containing one or more data sources; rows are pages | Notion workspace | API requests per connection per minute; 100 related pages per request | Workspace settings and page permissions |
| **Microsoft Lists** | SharePoint lists | SharePoint sites and OneDrive | 30 million items per list; 250 MB per item attachment | SharePoint and Microsoft 365 admin |
| **Power Apps** | Canvas and model-driven apps over connectors and Dataverse | Dataverse or connected sources | 500 records processed locally by default, up to 10,000 | Data policies, Managed Environments, admin center inventory |
| **Google AppSheet** | Apps generated from data sources | Connected sources | Not covered here | Governance policies on Enterprise Plus |
| **Retool** | Internal apps on top of the customer's databases and APIs | Customer systems | Not covered here | Cloud or single-tenant self-hosted |
| **Superhuman Docs (Coda)** | Docs with tables and formulas | Superhuman | Not researched here | Not researched here |

The products split on one question: **is the tool the database, or a front end to the customer's databases?** Airtable, Notion and Lists store the data themselves, so their limits are storage limits and their exports are the customer's records. Power Apps, AppSheet and Retool mostly sit on top of other systems (Dataverse, SharePoint, SQL, spreadsheets, REST APIs), so their hard problems are query delegation, credential custody and connector policy. Coda's acquisition by Grammarly (announced December 17, 2024) and its renaming to Superhuman Docs on July 8, 2026 put the docs-with-tables model inside a writing and AI suite ([Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#structured-documents-confluence-google-docs-and-loop)).

## A Schema in the Hands of Users

In a no-code database the field definitions are data. That has consequences an engineer coming from migrations-in-code needs to internalize:

- **Every schema change is online and immediate.** There's no deploy. Renaming a field must not break the formulas, filters, automations and API clients that reference it, which means references are to field IDs, never names. Notion's API, for example, moved schema to a separate data source object in version 2025-09-03, and relation properties now identify their target by `data_source_id`.
- **Type changes are conversions with loss.** Turning a text field into a single-select creates options from distinct values; turning a number into text is lossless one way and lossy back. The product must preview the conversion, keep the old values recoverable for a period, and record the change.
- **Deleting a field is deleting data.** It needs the same trash, restore window and audit as deleting records.
- **Links are relations.** A linked-record field is a foreign key the user created, often many-to-many, and its integrity (what happens to links when a record is deleted) must be defined by the product, because the user won't define it.

The storage model behind this is the one [Three Storage Models](/docs/architecture/custom-fields#three-storage-models) describes: typed values keyed by field ID (an entity-attribute-value or JSONB shape) with per-tenant indexes for the fields people filter on. The no-code twist is scale and volatility: thousands of tenants each with hundreds of tables whose schemas change daily.

## Formulas and Computed Fields

Formulas are where no-code databases become programming environments. A formula field computes a value per record from other fields; a rollup or lookup field computes across linked records; a view filter or sort applies a predicate to all of them. The engine underneath is a dependency graph:

- **Compute on write, not on read**, for anything that's filtered, sorted or exported, and store the result with the record. Recomputing a rollup across 50,000 linked records on every view load doesn't work.
- **Track dependencies by field ID** so a change to one field recomputes only what depends on it, and detect cycles (A references B references A) at definition time, not at evaluation time.
- **Make volatile functions explicit.** `NOW()` and `TODAY()` change without any write; formulas that use them are recomputed on a schedule or at read time and must say which.
- **Version the formula language.** Changing a function's semantics silently changes customers' business data, so each field pins a language version and an upgrade is a migration the customer can preview.

Low-code app builders push formulas further, into queries. Power Fx in Power Apps is the instructive case, because its limits are documented precisely. A query is **delegated** when Power Apps can translate it into a query the data source runs; if any part of the expression isn't delegable, none of it is delegated, and Power Apps fetches the first 500 records and evaluates locally. That limit can be raised to 10,000. The consequence Microsoft spells out: a `Filter` over a million-record source with a non-delegable predicate scans only the first 500 records, so "if the record you want is record 501 or 500,001, Filter doesn't find or return it," and an `Average` averages only those 500. Microsoft recommends setting the limit to 1 during development, so anything non-delegated returns a single record and is obvious in testing. Queries are also capped at two lookup levels (one offline) and 20 joined entities.

That's the general lesson for anyone building a formula-over-connector product: **a silently partial answer is worse than an error.** Warn at authoring time (Power Apps shows a delegation warning on formulas that won't delegate), fail closed at runtime above a threshold, and never let an aggregate over partial data look complete.

## Limits Are Product Design

No-code platforms publish per-plan limits, and the limits are the product's architecture made visible. Airtable's, as of October 2026:

| Plan | Records per base | Attachment storage per base | Automation runs per month | API calls per month | Revision history |
| --- | --- | --- | --- | --- | --- |
| Free | 1,000 | 1 GB | 100 | 1,000 | 2 weeks |
| Team | 50,000 | 20 GB | 25,000 | 100,000 | 1 year |
| Business | 125,000 | 100 GB | 100,000 | Unlimited | 1 year |

Enterprise Scale limits aren't published; Airtable's sales team sets them. The API is limited to 5 requests a second per base and 50 a second across a user's personal access tokens, and a 429 means waiting 30 seconds before requests succeed again.

Read the table as engineering: records are capped **per base** because a base is the unit loaded, indexed and computed together; automation runs and API calls are metered **per workspace per month** because they're the cost drivers; attachments are capped separately because they're blob storage, not database rows. Microsoft Lists inherits SharePoint's platform limits instead: 30 million items per list, 250 MB per attachment on a list item, and no breaking permission inheritance once a list passes 100,000 items. Notion's API caps per-request arrays (100 related pages per relation request) rather than database size.

My rule, from [Limits Per Tenant](/docs/architecture/custom-fields#limits-per-tenant): **publish every limit, enforce it at write time with a clear error, show usage against it in the admin console, and warn well before it's reached.** A base that silently stops accepting form submissions at 50,000 records is an outage the customer discovers from its own customers.

## From Database to App

The step from a table to an app is interfaces (Airtable), forms, buttons and automations. Each step adds a runtime responsibility for the vendor:

- **Forms take input from outside.** A public form is an unauthenticated write endpoint into the customer's data, so it needs rate limits, spam protection, field-level validation and an admin switch, like publishing in [Docs & Wikis](/books/workplace-and-collaboration/docs-and-wikis#publishing-to-the-web).
- **Automations run as someone.** A rule that sends email or calls an API when a record changes runs with somebody's credentials. When that maker leaves, the automation either breaks or keeps running as a deactivated identity; neither is acceptable. Automations need an owner, a service identity option, and an offboarding report.
- **Interfaces need their own permissions.** An interface that shows a subset of fields to a subset of people is a view-level permission model on top of the base's. Field-level and row-level visibility have to be enforced in the API and exports, not only in the UI.

Front-end builders face credential custody instead. Retool connects to the customer's own databases and APIs and offers a single-tenant self-hosted deployment, either Retool-managed in the customer's AWS account or self-managed on the customer's infrastructure, with Kubernetes and Helm recommended for production. Self-hosting exists for a workplace reason: the customer's security team would rather the tool that holds production database credentials ran inside its own network.

## Governance and Shadow Apps

The governance problem is visibility first and policy second. Admins can't govern apps they can't list, and the people building them don't think of themselves as building software.

**Microsoft's Power Platform** has the most complete public governance model, and its pieces are the checklist for any vendor:

- **Data policies on connectors.** Connectors go into three groups: **Business**, **Non-Business** and **Blocked**. Connectors in different groups can't be used together in one app or flow, so with SharePoint and Salesforce in Business and Gmail in Non-Business, a maker can't build a flow that copies one into the other. New policies put every connector in Non-Business by default, and Microsoft advises keeping Non-Business as the default group for new connectors so nothing is trusted until evaluated. Some connectors can't be blocked (Dataverse, Approvals, Notifications, SharePoint, Teams, OneDrive for Business, Outlook and other Microsoft Enterprise Plan standard connectors), though newer advanced connector policies use a strict allowlist that can restrict any certified connector.
- **Enforcement on existing apps.** When a policy changes, resources check for it, apps and flows that violate it are suspended or quarantined, connections to blocked connectors are disabled, and running resources fail at runtime; full enforcement can take up to 24 hours, usually within one.
- **Managed Environments** add sharing limits, weekly usage insights, environment-level data policies, deployment pipelines, solution checks, IP firewall, customer-managed keys and app allowlists. Unmanaged developer environments are deprecated; existing ones must be converted to managed before December 15, 2026 to be kept.
- **Inventory as a product feature.** The Center of Excellence Starter Kit, which organizations used to inventory apps, flows and makers, is no longer maintained; its core capabilities moved into the Power Platform admin center as Inventory, Usage, Monitor and Actions, with an inventory API.

**Google AppSheet** draws the governance line by edition: AppSheet Core is included in most paid Google Workspace plans, while team and organization governance policy enforcement and audit log export to BigQuery come with Enterprise Plus. **Airtable** and **Notion** expose governance mostly through workspace administration and plan tiers.

What a governance surface needs, whoever builds it:

- **An inventory** of every base, app, form, automation and connection in the tenant, with owner, last activity, connectors used, sharing scope and record count.
- **Connector or data-flow policy** that prevents business data flowing to personal services, defaulting new connectors to untrusted.
- **Sharing limits**: who can share an app with the whole organization, and whether public forms are allowed.
- **Lifecycle**: inactive app reports, ownerless app reports at offboarding, archive and delete with a restore window.
- **Promotion paths**: a way to move a successful shadow app into a governed environment (pipelines, a supported data store, an IT owner) rather than banning it.

The cultural reality is that bans don't work. A company that blocks the no-code tool gets the same apps in personal spreadsheets with less visibility. The useful posture is visible by default, safe by default and promotable, which is roughly where Microsoft's Managed Environments ended up.

## How to Build It

The chapter adds user-defined tables, fields and records on top of the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model), with automations and connections owned by identities the admin can see. Tables are `containers` children (the base is a `containers` row with `kind = 'base'`); records are `items` with `kind = 'record'` so they share permissions, versions, holds and export with everything else.

```sql
-- containers.kind gains 'base'; items.kind gains 'record'.

CREATE TABLE nocode_tables (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  base_id          UUID NOT NULL REFERENCES containers (id),
  name             TEXT NOT NULL,
  primary_field_id UUID,                     -- set after fields exist
  record_count     BIGINT NOT NULL DEFAULT 0,  -- checked against the plan's per-base cap
  created_by       UUID NOT NULL REFERENCES members (id),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE nocode_fields (               -- definitions are data; references use the id
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  table_id         UUID NOT NULL REFERENCES nocode_tables (id),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('text', 'number', 'currency', 'date',
                     'checkbox', 'single_select', 'multi_select', 'person', 'attachment',
                     'link', 'formula', 'rollup', 'lookup', 'created_time', 'autonumber')),
  config           JSONB NOT NULL DEFAULT '{}',  -- options, precision, link target, formula
  formula_lang_version INT,                  -- pinned per field; upgrades are migrations
  depends_on       UUID[] NOT NULL DEFAULT '{}', -- field ids, for recompute and cycle checks
  volatile         BOOLEAN NOT NULL DEFAULT FALSE, -- uses NOW() or TODAY()
  schema_version   INT NOT NULL DEFAULT 1,   -- bumps on type or config change
  deleted_at       TIMESTAMPTZ,              -- soft delete with a restore window
  UNIQUE (table_id, name)
);

CREATE TABLE nocode_records (              -- kind table for items where kind = 'record'
  item_id          UUID PRIMARY KEY REFERENCES items (id),
  table_id         UUID NOT NULL REFERENCES nocode_tables (id),
  values           JSONB NOT NULL DEFAULT '{}',  -- {field_id: value}, computed values included
  computed_at      TIMESTAMPTZ               -- last formula and rollup recompute
);

CREATE INDEX nocode_records_values ON nocode_records USING GIN (values jsonb_path_ops);

CREATE TABLE nocode_links (                -- link fields as an edge table, both directions
  field_id         UUID NOT NULL REFERENCES nocode_fields (id),
  from_item_id     UUID NOT NULL REFERENCES items (id),
  to_item_id       UUID NOT NULL REFERENCES items (id),
  PRIMARY KEY (field_id, from_item_id, to_item_id)
);

CREATE TABLE nocode_automations (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  base_id          UUID NOT NULL REFERENCES containers (id),
  name             TEXT NOT NULL,
  trigger          JSONB NOT NULL,           -- record created, field changed, schedule, form
  actions          JSONB NOT NULL,
  run_as_kind      TEXT NOT NULL CHECK (run_as_kind IN ('member', 'service')),
  run_as_member_id UUID REFERENCES members (id),
  api_token_id     UUID REFERENCES api_tokens (id),  -- service identity or OAuth grant
  owner_member_id  UUID REFERENCES members (id),     -- null means flagged ownerless
  state            TEXT NOT NULL CHECK (state IN ('on', 'off', 'suspended_policy',
                     'suspended_owner_left', 'over_quota')),
  last_run_at      TIMESTAMPTZ
);

-- The tenant data policy over connectors (business, non-business, blocked groups) is
-- connector_policies, owned by Integration Platforms & Workflow Builders; no-code apps
-- and automations are checked against the same rows as integration flows.
```

Three behaviors carry the design:

- **Schema changes are transactions over definitions plus a background migration.** Changing a field's type bumps `schema_version`, writes the old values to `item_versions` for the restore window, converts values in batches, and recomputes dependents found through `depends_on`. Cycle detection runs on the dependency graph before the change commits.
- **Policy evaluation runs at save and on policy change.** Saving an app or automation checks that all its connectors fall in one data group under the policy in effect; a new policy version re-evaluates every app and automation and moves violators to `suspended_policy` with an audit event, rather than leaving them to fail at runtime.
- **Offboarding sweeps ownership.** Deactivating a member moves their automations that `run_as` them to `suspended_owner_left` (or to a service identity if the admin chose that policy), nulls `owner_member_id` on what they owned, and lists both in the ownerless report.

## Auditing

The audit trail (core `audit_events`) needs schema and policy events as well as data events, because in no-code the schema is customer content:

- **Schema**: table and field created, renamed, retyped (with conversion counts), deleted and restored; formula changed (old and new expression).
- **Data**: record bulk edits and bulk deletes with counts, imports, exports and API reads above a volume threshold.
- **Automation**: created, enabled, run summaries, failures, suspensions by policy or offboarding, run-as identity changes.
- **Sharing**: base or app shared, public form enabled, interface published.
- **Policy**: data policy versions, connector reclassifications, apps suspended by a policy change.

Per-record edit history belongs in `item_versions`; the audit log records who did bulk and structural things. [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions) covers attributing automated actions.

## What This Means for the System You Build

- Reference fields by ID everywhere (formulas, filters, automations, API), so users can rename freely.
- Preview type conversions, keep old values for a restore window, and treat field deletion as data deletion.
- Compute formulas and rollups on write with a dependency graph, detect cycles at definition time, and version the formula language.
- Never return a silently partial query result; warn at authoring time and fail visibly at runtime.
- Publish limits per plan, enforce them at write time, and show usage before customers hit them.
- Give automations owners and service identities, and sweep them at offboarding.
- Classify connectors into data groups, default new ones to untrusted, and re-evaluate existing apps when policy changes.
- Make inventory a product feature, and offer a path to promote a shadow app into governed status.

## References

**Vendor documentation**

- [Airtable: Airtable plans](https://support.airtable.com/docs/airtable-plans), records, attachment storage, automation runs, API calls and revision history per plan
- [Airtable Developers: Rate limits](https://airtable.com/developers/web/api/rate-limits), 5 requests a second per base, 50 a second per user's tokens, 30-second wait after a 429
- [Notion Developers: Upgrade guide for 2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03), databases containing data sources, schema on the data source, relations by `data_source_id`, renamed webhook events
- [Notion Developers: Request limits](https://developers.notion.com/reference/request-limits), per-connection request budgets and per-request limits such as 100 related pages
- [Microsoft Learn: SharePoint limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits), 30 million items per list, 250 MB per list item attachment, 100,000-item inheritance limit
- [Microsoft Learn: Understand delegation in a canvas app](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/delegation-overview), delegation, the 500-record default and 10,000 maximum, partial results, the set-to-1 testing advice, lookup and join limits
- [Microsoft Learn: Data policies](https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention), design-time and runtime effects, suspension and quarantine on policy change, up to 24 hours to enforce
- [Microsoft Learn: Connector classification](https://learn.microsoft.com/en-us/power-platform/admin/dlp-connector-classification), Business, Non-Business and Blocked groups, no data sharing across groups, default group, nonblockable connectors, advanced connector policies
- [Microsoft Learn: Managed environments overview](https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-overview), Managed Environment features and licensing, deprecation of unmanaged developer environments by December 15, 2026
- [Microsoft Learn: CoE Starter Kit transition to Power Platform admin center](https://learn.microsoft.com/en-us/power-platform/guidance/coe/starter-kit), the Starter Kit no longer maintained, Inventory, Usage, Monitor and Actions
- [Google: AppSheet pricing](https://about.appsheet.com/pricing/), Starter, Core and Enterprise Plus, Core included in most paid Workspace plans, governance features on Enterprise Plus
- [Retool: Self-hosted Retool](https://docs.retool.com/self-hosted), single-tenant instances, Retool-managed and self-managed deployment, Kubernetes and Helm for production

**Corporate announcements**

- [Grammarly: Grammarly to acquire Coda (December 17, 2024)](https://www.grammarly.com/blog/company/grammarly-to-acquire-coda/), the acquisition
- [Superhuman: Superhuman launches Superhuman Docs (July 8, 2026)](https://blog.superhuman.com/superhuman-launches-superhuman-docs/), Coda renamed Superhuman Docs
