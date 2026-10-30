+++
title = "Work Items, Hierarchies & Fields"
nav_title = "Work Items & Fields"
description = "Issues and tasks across Jira, Linear, GitHub, Azure Boards, Asana and monday.com: types, hierarchies, custom fields and their cost, links and dependencies."
category = "Workplace & Collaboration Industry"
order = 2029
part = "Work Management"
tags = ["work-management", "issue-tracking", "custom-fields", "hierarchies", "dependencies"]
+++

A work item is the unit every work management product is built on: a row that says what needs doing, who is doing it, what state it's in and how it relates to the rest of the work. Jira calls it a work item (it called it an issue until its recent renaming), Linear and GitHub call it an issue, Asana and ClickUp a task, monday.com an item, Azure Boards a work item again. Under the names the record is the same: an identifier people can say out loud, a title and description, a type, a status, an assignee, a parent, links to other items, and a long tail of fields the customer defines.

The hard part is the long tail. Every customer wants its own fields, its own types and its own hierarchy, and the product has to store, validate, index, query, report on and export all of them without one tenant's schema slowing another tenant's search. The vendors split on how much of that freedom to give away: Jira and Azure Boards let administrators define almost anything and publish limits and performance warnings to match; Linear fixes most of the model and lets teams configure inside it. Who owns the schema is the first place the book's [inversion](/books/workplace-and-collaboration/workplace-business#the-inversion) shows up in work management: the customer's admin, not the vendor, decides what a "Bug" is, which fields it has and who may change them.

This chapter covers the item, its types and hierarchy, custom fields, and links and dependencies. Statuses and transitions are [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states); searching over items is [Queries, Views & Dashboards](/books/workplace-and-collaboration/queries-views-and-dashboards); the generic engineering of user-defined fields is the playbook's [Custom Fields](/docs/architecture/custom-fields#three-storage-models). The tables extend the [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model): a work item is a row in `items` with `kind = 'work_item'`, extended by `work_items`, and it lives in a `containers` row of kind `project`.

## How the Platforms Do It

As of October 2026:

| Product | Item name | Identifier | Types | Hierarchy | Custom fields | Links and dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| **Jira Cloud** | Work item (formerly issue) | Space key plus number (`JRA-123`) | Configurable work types per space | Epic (level 1), story (0), subtask (-1) by default; more levels on Premium and Enterprise | Admin-defined, with contexts per space and type | Admin-configurable link types in pairs (blocks / is blocked by, clones, duplicates, relates to) |
| **Linear** | Issue | Team key plus consecutive number (`ENG-123`) | Labels rather than types | Parent and sub-issues; projects and initiatives above | Fixed properties (status, priority, estimate, labels, cycle, project) | Duplicates from triage; "relates to" from Git |
| **GitHub Issues** | Issue | Repository plus number (`#123`) | Task, bug, feature by default; up to 25 per organization | Sub-issues: up to 100 per parent, eight levels, across repositories | Project fields: up to 50 per project (text, number, date, single select, iteration) | Blocked by / blocking |
| **Azure Boards** | Work item | Numeric ID | Up to 64 work item types per process | Up to 5 portfolio backlog levels above the requirement level | Up to 1,024 fields per process, 8,192 per organization | Parent-child, related, predecessor-successor; up to 1,000 links per item |
| **Asana** | Task | Global ID | Task, with custom fields | Subtasks; projects and portfolios above | Text, number, single and multi-select, date, people, reference, formula | Dependencies (not detailed in the sources cited here) |
| **monday.com** | Item | Item ID | Board defines the item | Subitems; boards and workspaces above | Columns are the fields: status, people, timeline, numbers, formula, mirror and others | Dependency and connect-boards columns |

Three patterns run through the table. **The identifier is human-sized and container-scoped:** `ENG-123` and `JRA-123` are spoken in standups and pasted into commits, so the key is part of the product, not a database detail. **The hierarchy is fixed at the bottom and configurable at the top:** a task and its subtasks are universal; how many levels sit above an epic is where plans and pricing tiers differ. **Custom fields are the enterprise feature and the scaling problem:** the products that give the most freedom publish the most limits.

## The Item and Its Identifier

Every product gives an item two identities: a global ID for the API and a short key for people. Linear's documentation states the rule plainly: an issue "must belong to a single team" and gets a number assigned "in consecutive order of when it was created," referenced inline as `ENG-123`, with the team key as the prefix. Jira's key is the space key (two or more uppercase letters) plus a hyphen and a number; GitHub's is the repository plus a number.

The short key creates three obligations for a system that issues one:

- **Allocate numbers without gaps or collisions** per container, inside the same transaction that creates the item, because people notice a skipped number and a duplicate breaks every commit message that references it.
- **Keep old keys resolvable after a move.** When a Linear issue moves teams, its status maps to "the closest corresponding status in the destination team's workflow," and because numbers run per team it takes a key in the new team; links, commits and chat messages that used the old key must still find it. A redirect table from old key to item is the usual answer.
- **Keep keys stable when a container's key changes.** Renaming a project key is an admin action that can't rewrite every commit message in every repository, so the old prefix has to keep resolving.

Linear requires only a title and a status; everything else on its issues (priority of "Urgent, High, Medium or Low," an estimate, labels, an assignee, a cycle, a project) is optional. Jira's and Azure's required fields are configurable per type, which is why item creation in those products is a form an admin designs.

## Types and Hierarchies

A type decides which fields an item has, which workflow it follows and where it sits in the hierarchy. The products disagree on how much of that a customer controls.

**Jira** separates work types from hierarchy levels. Its default hierarchy has three levels: epic at level 1, story at level 0 (every standard type, such as task and bug, sits here) and subtask at level -1. "Jira Premium and Enterprise customers can also create and manage additional levels" above the epic, and the documentation warns that changing the hierarchy "will break existing parent and child relationships" and that "once these changes are made, they cannot be undone." The hierarchy is site-wide; the types available in each space come from that space's configuration, which in company-managed spaces is a shared scheme an admin maintains and in team-managed spaces is set by the space's own admins ([Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states#team-managed-and-company-managed) covers the split).

**Azure Boards** builds the hierarchy from backlog levels in a process: tasks, a requirement level (user story, product backlog item or requirement, depending on the process), and portfolio levels above it. Its published limits are 64 work item types per process and 5 portfolio backlog levels per process, and Microsoft advises against nesting backlog items of the same type.

**GitHub** added organization-level issue types ("The default types are task, bug, and feature," up to 25 per organization) and sub-issues, with "up to 100 sub-issues per parent issue" and "eight levels" of nesting, across repositories. The hierarchy is the parent link, not the type: any type can be the parent of any other.

**Linear** keeps types out of the model (labels do that work) and offers parent issues and sub-issues, with two optional team-level automations: when all sub-issues are done the parent is marked done, and when the parent is done the remaining sub-issues are marked done. Above issues sit projects and initiatives, which are separate objects rather than deeper issue levels ([Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals#projects-initiatives-and-goals)).

Two designs result. In the **typed-level** design (Jira, Azure Boards), the type decides the level and a parent must be exactly one level up, which makes rollups predictable and reports simple. In the **free-parent** design (GitHub, Linear), any item can parent any other up to a depth limit, which fits teams that don't share a methodology and makes rollups a recursive query. My default for a new product is free parenting with a depth limit, plus an optional per-workspace rule that restricts which types may parent which, because the restriction is easy to add and the free model is hard to retrofit.

### Why Hierarchy Changes Are One-Way

Jira's warning that a hierarchy change can't be undone is a data problem, not a UI one. A parent link that was valid under the old levels (a story under an epic) may be invalid under the new ones (if a new level sits between them), and the product has to either break the link or invent an intermediate parent. Either change rewrites thousands of rows that reports, rollups and automation depend on. A system that lets admins redefine levels should treat it as a migration: preview the links that will break, write the change as a batch with its own audit event, and keep the previous parent in the item's history so a report "as of last quarter" can still show the old shape.

## Custom Fields

Custom fields are the reason enterprise customers choose configurable trackers and the reason those trackers slow down. The playbook's [Custom Fields](/docs/architecture/custom-fields#the-definitions-table) covers the storage models, definitions table, validation and indexing in general; the work management twist is the scale and the number of places a field goes.

**Azure Boards publishes the most complete set of limits** as of October 2026: 1,024 fields per process, 8,192 per organization, 1,024 fields per work item type, 2,048 picklist items per list, 1,024 rules per work item type, 1,000 links per work item, 100 tags per work item, a 1-million-character long text field, and a 10,000-revision limit on updates through the REST API (after which Microsoft suggests creating a new work item). It then adds "practical limits": "Limit the number of custom fields you define," limit rules per type, limit custom types. The reason is stated in the same page: a single SQL expression per project validates every work item on save, it grows with every rule, and "once the expression reaches a certain size or complexity, SQL can no longer evaluate it efficiently and might generate an error."

**Jira's custom fields** carry contexts: one field can have different options and defaults in different spaces and work types, and team-managed spaces define fields that belong only to that space. Atlassian publishes per-site limits and performance guidance for custom fields; the specific figures aren't cited in this chapter. <!-- source-gap: jira-custom-field-limits | missing | Jira Cloud's per-site custom field limit and related guidance as of October 2026 | closes with: the Atlassian support page stating the custom field limit for Jira Cloud | checked: 2026-10-29 -->

**Asana's** API exposes the field types directly: text (limited to 1,024 characters), number, single-select (`enum`), multi-select (`multi_enum`), date, people, reference (links to tasks, projects, portfolios or goals), and formula fields, which are read-only numbers. Disabled select options stay in the metadata for values already set to them, which is the right rule for any option list: retiring an option must not erase history. The developer guide calls custom fields a premium feature and tells integrators to be defensive about whether a given user can read or write them.

**monday.com** makes columns the fields: the board's columns are the item's schema, with types including status, people, timeline, numbers, dropdown, dependency, connect boards, mirror (a value read through a connection to another board), formula, and subitems.

**GitHub Projects** puts fields on the project, not the issue: "up to 50 fields in a project," of type text, number, date, single select and iteration. The same issue in two projects can have different values in each, which is a deliberate choice: the issue belongs to a repository, and the planning metadata belongs to whoever is planning.

**Linear** offers no arbitrary custom fields on issues; its properties are fixed, and teams configure their values (statuses, labels, estimate scales). That is a product position as much as an engineering one: a fixed schema keeps every view, filter and integration fast and identical across workspaces.

### Where the Cost Lands

A custom field is cheap to create and expensive to carry. Each one has to be:

- **Validated** on every write from the UI, API, imports and automation, against a definition that can change.
- **Indexed** for search, because a field nobody can filter on is a field nobody uses ([Indexing and Querying](/docs/architecture/custom-fields#indexing-and-querying)).
- **Rendered** on create screens, detail views, boards, list columns and exports.
- **Exported** in CSV, API responses, webhooks and migrations to other tools, with a stable key even after the label changes.
- **Permissioned** where the product supports field-level security, and **retained** under the item's retention policy.

The vendors' limits are the visible part of that cost; the invisible part is that every field multiplies the size of the search index and the work of every view. My rule is that limits are per tenant and published, as Azure does, with a usage counter the admin can see before they hit the ceiling ([Limits Per Tenant](/docs/architecture/custom-fields#limits-per-tenant)).

### Field Sprawl Is an Admin Problem

Large customers accumulate fields: every team adds one, nobody removes any, and two fields called "Team" with different options appear in the same search. The products answer with admin tooling rather than hard rules: Jira's field contexts and the split between company-managed and team-managed spaces, Azure's per-process field lists, and Linear's refusal to have custom fields at all. A system built for large customers needs the tooling from the start: a field inventory with usage counts (how many items have a value, when it was last written, which screens and automations reference it), the ability to merge two fields into one, and a soft-delete that hides a field everywhere while its values stay in history and exports.

## Links and Dependencies

Links connect items across the hierarchy: this bug duplicates that one, this story blocks that one, this task relates to an incident. The vendors converge on a small, typed set:

- **Jira** link types come in pairs with an inward and outward description: "is blocked by" and "blocks," "is cloned by" and "clones," "is duplicated by" and "duplicates," with "relates to" having no separate inverse. Link types "can be configured by Jira admins," and a deleted link type is no longer available to use.
- **Azure Boards** has fixed system link types: hierarchy (parent-child), related, and dependency (predecessor and successor), with up to 1,000 links per work item; queries can walk them with a `FROM WorkItemLinks` clause ([Queries, Views & Dashboards](/books/workplace-and-collaboration/queries-views-and-dashboards#azure-boards-wiql)).
- **GitHub** offers "Mark as blocked by" and "Mark as blocking," shows a Blocked icon on boards and issue lists, and exposes `blockedBy` and `blocking` in the CLI's JSON output.
- **Linear** marks duplicates from triage, and its Git integration's "relates to" magic word links an issue without changing its status ([Development Collaboration](/books/workplace-and-collaboration/development-collaboration#linking-work-to-code)).
- **monday.com** expresses dependencies and cross-board links as columns (`dependency`, `board_relation`).

Three rules follow. **Store a link once, with a direction**, and derive the inverse label at read time; storing both directions invites the two rows to disagree. **Make "blocks" a first-class type**, because it is the only link that changes behavior: boards show blocked items, schedulers in [Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals#dependencies-across-teams) respect it, and automation can react to it. **Allow links across containers and check permission at both ends**: a user who can see a story but not the item blocking it should see that a blocker exists without seeing its title, which is the same permission-trimming problem search has ([Permission-Trimmed Queries](/books/workplace-and-collaboration/queries-views-and-dashboards#permission-trimmed-queries)).

Duplicates deserve their own handling: marking an item a duplicate usually closes it with a duplicate resolution (Jira has "Duplicate" among its default resolutions) and moves watchers and votes to the surviving item. Linear's triage marks duplicates with a dedicated action ([Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#triage)).

## Who Decides

The inversion in work management is quieter than in chat but just as real. The vendor sets the limits and the fixed parts of the model; everything else is the customer's:

- **The customer's admins own the schema:** types, hierarchy levels, fields, options and link types. A vendor that changes a customer's field silently is editing the customer's records.
- **Space or team admins own local configuration** where the product allows it (Jira team-managed spaces, Linear teams), and the org admin decides how much local freedom to allow.
- **Members own the content** of the items they write, under the workspace's retention and legal hold settings; an item's fields are business records for discovery like any message ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) covers holds).
- **The vendor owns limits, performance and the fixed core**, and should publish all three.

## How to Build It

The chapter adds the kind table for work items, types and levels, field definitions and values, links, and the project key allocator. `items` already carries the workspace, the container, the author, timestamps and versioning; `work_items` adds what is specific to tracked work.

```sql
CREATE TABLE projects (                    -- kind table for containers.kind = 'project'
  container_id   UUID PRIMARY KEY REFERENCES containers (id),
  key            TEXT NOT NULL CHECK (key ~ '^[A-Z][A-Z0-9]{1,9}$'),
  next_number    BIGINT NOT NULL DEFAULT 1,
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  UNIQUE (workspace_id, key)
);

CREATE TABLE project_key_aliases (         -- old keys keep resolving after a rename
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  key            TEXT NOT NULL,
  container_id   UUID NOT NULL REFERENCES containers (id),
  retired_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, key)
);

CREATE TABLE work_item_types (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,
  hierarchy_level SMALLINT NOT NULL DEFAULT 0,  -- 1 epic, 0 standard, -1 subtask; higher on request
  icon           TEXT,
  archived_at    TIMESTAMPTZ,
  UNIQUE (workspace_id, name)
);

CREATE TABLE work_items (                  -- extends items where kind = 'work_item'
  item_id        UUID PRIMARY KEY REFERENCES items (id),
  container_id   UUID NOT NULL REFERENCES containers (id),     -- the project
  number         BIGINT NOT NULL,
  type_id        UUID NOT NULL REFERENCES work_item_types (id),
  parent_item_id UUID REFERENCES work_items (item_id),
  title          TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 255),
  status_id      UUID NOT NULL,            -- work_item_statuses, from Workflows & Status Machines
  assignee_member_id UUID REFERENCES members (id),
  priority       SMALLINT NOT NULL DEFAULT 0 CHECK (priority BETWEEN 0 AND 4),  -- 0 none ... 1 urgent
  estimate       NUMERIC(8,2),
  due_on         DATE,
  custom         JSONB NOT NULL DEFAULT '{}',   -- keyed by work_item_fields.id
  UNIQUE (container_id, number)
);
CREATE INDEX work_items_parent ON work_items (parent_item_id);
CREATE INDEX work_items_custom ON work_items USING GIN (custom jsonb_path_ops);

CREATE TABLE work_item_key_aliases (       -- keys from before a move between projects
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  key            TEXT NOT NULL,            -- 'ENG-123'
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  PRIMARY KEY (workspace_id, key)
);
```

Numbers come from the project row inside the creating transaction, so two concurrent creates can't take the same number and a rolled-back create doesn't leave a gap:

```sql
UPDATE projects SET next_number = next_number + 1
WHERE container_id = $1
RETURNING next_number - 1 AS number;      -- row lock serializes creates per project
```

Field definitions follow the playbook's definitions table, with the work management additions: a context that scopes a field to some projects and types, options that are disabled rather than deleted, and a stable key for exports:

```sql
CREATE TABLE work_item_fields (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  key            TEXT NOT NULL,            -- stable export key; label can change
  label          TEXT NOT NULL,
  field_type     TEXT NOT NULL CHECK (field_type IN ('text', 'long_text', 'number',
                   'date', 'datetime', 'single_select', 'multi_select', 'member',
                   'members', 'url', 'item_reference', 'formula')),
  options        JSONB NOT NULL DEFAULT '[]',   -- [{id, label, color, disabled}]
  formula        TEXT,
  owner_container_id UUID REFERENCES containers (id),  -- set: local to one project
  archived_at    TIMESTAMPTZ,
  UNIQUE (workspace_id, key)
);

CREATE TABLE work_item_field_contexts (    -- where a field applies, with its default
  field_id       UUID NOT NULL REFERENCES work_item_fields (id),
  container_id   UUID REFERENCES containers (id),   -- null: every project
  type_id        UUID REFERENCES work_item_types (id),  -- null: every type
  required       BOOLEAN NOT NULL DEFAULT FALSE,
  default_value  JSONB,
  UNIQUE NULLS NOT DISTINCT (field_id, container_id, type_id)
);
```

Links are stored once, directed, with a type that names both directions:

```sql
CREATE TABLE work_item_link_types (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,            -- 'Blocks'
  outward_label  TEXT NOT NULL,            -- 'blocks'
  inward_label   TEXT NOT NULL,            -- 'is blocked by'
  semantics      TEXT NOT NULL DEFAULT 'none'
                   CHECK (semantics IN ('none', 'blocks', 'duplicates', 'clones')),
  UNIQUE (workspace_id, name)
);

CREATE TABLE work_item_links (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  link_type_id   UUID NOT NULL REFERENCES work_item_link_types (id),
  source_item_id UUID NOT NULL REFERENCES work_items (item_id),
  target_item_id UUID NOT NULL REFERENCES work_items (item_id),
  created_by     UUID NOT NULL REFERENCES members (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_item_id <> target_item_id),
  UNIQUE (link_type_id, source_item_id, target_item_id)
);
CREATE INDEX work_item_links_target ON work_item_links (target_item_id);
```

A link count per item is enforced in the write path, and the depth limit on parents (eight, if following GitHub) is checked with a recursive query before a parent is set, which also rejects cycles:

```sql
WITH RECURSIVE ancestors AS (
  SELECT item_id, parent_item_id, 1 AS depth FROM work_items WHERE item_id = $new_parent
  UNION ALL
  SELECT w.item_id, w.parent_item_id, a.depth + 1
  FROM work_items w JOIN ancestors a ON w.item_id = a.parent_item_id
)
SELECT bool_or(item_id = $child) AS would_cycle, max(depth) AS parent_depth FROM ancestors;
```

Field values change through `item_versions` like any other edit, so a field's history is the item's history; a field removed from a context keeps its values in `custom` and in every version, hidden but exportable.

## Auditing

- **Schema changes are admin actions:** creating, renaming, archiving or merging a type, field, option, link type or hierarchy level, with the actor, the before and after definition and the count of items affected, in `audit_events`.
- **Bulk changes carry one event and many versions:** a bulk edit or field merge writes one audit event with a batch ID, and each item's `item_versions` row references it, so "who changed 4,000 items' priority" has one answer.
- **Moves keep both keys:** a move between projects records the old and new key and container, so references and discovery exports can follow the item.
- **Automated writes name the automation**, not a person ([Automation Rules](/books/workplace-and-collaboration/automation-rules#the-rule-actor)).

## What This Means for the System You Build

- **Treat the short key as product surface:** allocate it transactionally per container and keep old keys resolving after moves and renames.
- **Fix the bottom of the hierarchy and price the top:** parent and child are universal; levels above epic are the enterprise feature.
- **Publish per-tenant limits** for fields, options, types, rules and links, with usage the admin can see, as Azure does.
- **Disable options and fields; never delete their values** while an item, version or export still refers to them.
- **Store links once, directed, typed,** and give "blocks" real semantics.
- **Make schema changes migrations:** preview what breaks, apply in a batch, audit it, keep history.
- **Leave the schema to the customer's admin,** and give them inventory tools to keep it under control.

## References

**Vendor documentation**

- [Atlassian Support: Configure the work type hierarchy](https://support.atlassian.com/jira-cloud-administration/docs/configure-the-issue-type-hierarchy/), default levels epic, story and subtask, extra levels on Premium and Enterprise, irreversible changes
- [Atlassian Support: Team-managed and company-managed spaces](https://support.atlassian.com/jira-software-cloud/docs/what-are-team-managed-and-company-managed-projects/), who configures each and shared schemes
- [Atlassian Support: Link work items](https://support.atlassian.com/jira-software-cloud/docs/link-issues/), paired link types and admin configuration
- [Atlassian Support: Statuses, priorities and resolutions](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/), default resolutions including Duplicate
- [Atlassian Support: Use Smart Commits](https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/), work item keys as two or more uppercase letters followed by a hyphen
- [Linear Docs: Triage](https://linear.app/docs/triage), marking duplicates
- [Linear Docs: Creating issues](https://linear.app/docs/creating-issues), single team, consecutive numbers, required title and status, priorities, estimates, moving between teams
- [Linear Docs: Parent and sub-issues](https://linear.app/docs/parent-and-sub-issues), sub-issues and the parent and sub-issue auto-close options
- [Linear Docs: GitHub integration](https://linear.app/docs/github), the "relates to" magic word
- [GitHub Docs: Managing issue types in an organization](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-types-in-an-organization), default types and the 25-type limit
- [GitHub Docs: Adding sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues), 100 sub-issues per parent and eight levels
- [GitHub Docs: Creating issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies), blocked by and blocking
- [GitHub Docs: About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects), 50 fields per project
- [GitHub Docs: Understanding fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields), project field types
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), field, type, picklist, rule, link, tag, revision and backlog-level limits, practical limits and the per-project SQL validation expression
- [Microsoft Learn: WIQL syntax](https://learn.microsoft.com/en-us/azure/devops/boards/queries/wiql-syntax), system link types
- [Asana Developers: Custom fields guide](https://developers.asana.com/docs/custom-fields-guide), field subtypes, the 1,024-character text limit, formula fields, disabled options and premium availability
- [monday.com Developers: Column types reference](https://developer.monday.com/api-reference/reference/column-types-reference), column types including dependency, connect boards, mirror and subitems
