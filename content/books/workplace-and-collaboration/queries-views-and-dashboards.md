+++
title = "Queries, Views & Dashboards"
description = "JQL and WIQL grammars, Linear and GitHub filters, saved filters and their sharing, list, board and timeline views, dashboards, and permission-trimmed queries."
category = "Workplace & Collaboration Industry"
order = 2031
part = "Work Management"
tags = ["work-management", "query-languages", "jql", "dashboards", "permissions"]
+++

Every screen in a work management product is a query. A board is a query grouped by status; a backlog is a query ordered by rank; a sprint report is a query over history; a dashboard is a page of queries someone saved and shared. The products expose that query to users in two ways: a filter builder for most people, and a text language (Jira's JQL, Azure Boards' WIQL, GitHub's search syntax) for the people who build the boards and reports everyone else uses.

The hard parts are not the grammar. They are that the query runs over a schema each customer defined ([Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#custom-fields)), that a saved query outlives its author and is shared with people who can see different things, and that every result must be trimmed to what the person looking at it may see, at the speed of a board load. A saved filter shared to the whole organization is a small publication, and the customer's admins decide who may publish to whom; the vendor's job is to make sure the same filter shows each viewer only their own slice.

This chapter covers the query languages, filters and saved views, view layouts, dashboards, and permission-trimmed queries. Board columns, sprints and flow charts are [Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles); search across every product a company uses, with connectors and ranking, is Enterprise Search. The playbook covers filter and sort parameters for APIs in [Filtering and Sorting](/docs/requests/filtering-and-sorting#allowlisted-fields) and authorization checks in [Where Checks Belong](/docs/security/authorization#where-checks-belong).

## How the Platforms Do It

As of October 2026:

| Product | Text query language | Filter builder | Saved and shared | Layouts | Dashboards and reports | Published limits |
| --- | --- | --- | --- | --- | --- | --- |
| **Jira** | JQL: field, operator, value or function, joined by keywords | Basic search (no `OR`, `NOT`, `EMPTY` or comparisons) | Filters shared with groups, spaces, roles or the organization; viewers and editors separate; email subscriptions | List, board, backlog, timeline | Dashboards of gadgets fed by filters; charts on boards | Subscription emails carry the first 200 results; autocomplete shows 15 matches |
| **Azure Boards** | WIQL: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `ASOF` | Query editor | Shared queries in folders, favorites | Backlog, board, taskboard, delivery plans | Project and team dashboards of widgets | 20,000 results, 32,000-character queries, 30-second execution, 500 dashboards per project and per team |
| **Linear** | None for users; GraphQL API filters | Filters with nested AND/OR groups, natural-language filters | Views owned by a person, shared to the workspace or a team | List, board | Insights (Business and Enterprise) | Not stated in the sources cited here |
| **GitHub** | Search qualifiers with `AND`, `OR` and parentheses | Filter bar | Saved project views | Table, board, roadmap | Project insights charts | Five levels of parentheses; 50,000 items per project |

Three patterns run through the table. **A text language is a power-user tool and an API**: Jira and Azure expose one, Linear doesn't, and none of them is SQL. **Saving is publishing**: every product separates who owns a saved query from who may see it, and none lets a shared link grant access by itself. **The limits are about cost, not correctness**: result caps, execution timeouts and query length limits exist because one tenant's broad query can't be allowed to slow everyone's boards.

## JQL

Atlassian describes a JQL query as one that "consists of a field, followed by an operator, followed by one or more values or functions," with keywords such as `AND`, `OR`, `NOT` and `ORDER BY` joining or altering clauses:

```text
project = "TEST" AND assignee = currentUser() ORDER BY created DESC
(status = resolved AND project = SysAdmin) OR assignee = bobsmith
```

The grammar's rules show what kind of language it is:

- **It isn't SQL.** JQL "is not a database query language, even though it uses SQL-like syntax." There are no joins, projections or aggregates; a query returns work items, and what is shown about them is the view's business.
- **Precedence is positional.** Without parentheses, statements are evaluated left to right.
- **Operators are typed by field.** `=` matches exact values and can't be used on text fields (use `~`, CONTAINS, instead); `>` works "only with fields that support ordering (e.g. date fields and version fields)"; `!=` "will not match a field that has no value," which is the most common JQL surprise, solved with `IS EMPTY`.
- **Text search is tokenized.** `CONTAINS` works on Summary, Description, Environment, Comments and free-text custom fields; non-alphanumeric characters are generally not indexed and are ignored, with email addresses and URLs as exceptions; reserved words must be quoted.
- **Functions resolve at run time.** `currentUser()` makes one saved filter mean "mine" for every viewer, which is what lets a shared board show each person their own work.
- **Bounded and unbounded queries differ.** A query with no restriction, only an `ORDER BY`, is unbounded, and the distinction matters to a builder because an unbounded query asks the index for everything the viewer can see.

Basic search, the builder most users see, "can't represent queries using `OR`, `NOT`, `EMPTY`, or comparison operators," and Atlassian suggests `IN` (`project in (A, B)`) for the common `OR` case. The gap between the builder and the language is a design decision every product faces: the builder must round-trip to text, and anything the text can say that the builder can't must be shown as text, not silently dropped.

## Azure Boards WIQL

WIQL is the closest any work tracker comes to SQL, and its limits are the most precisely published. A query has five parts:

```sql
SELECT [System.Id], [System.Title], [System.State]
FROM workitems
WHERE [System.TeamProject] = @project
  AND [System.WorkItemType] = 'User Story'
  AND [System.AssignedTo] = @Me
  AND [System.ChangedDate] >= @Today - 30
ORDER BY [System.ChangedDate] DESC
ASOF '2025-02-11T00:00:00Z'
```

The features that matter for a builder:

- **History is queryable.** `ASOF` filters "as they were defined on a specific date and time," and `EVER` (`WAS EVER` in the editor) matches a value a field "equals or ever equaled" across all past revisions. Both require that every revision is stored and indexed by time ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Links are queryable.** `FROM WorkItemLinks` returns links between items, with `[Source]` and `[Target]` clauses and a `MODE`: `MustContain` (the default), `MayContain`, `DoesNotContain`, or `Recursive` for tree queries over parent-child links, where `ORDER BY` and `ASOF` aren't allowed.
- **Macros make saved queries personal and relative.** `@Me`, `@Project`, `@CurrentIteration`, `@Today` with day offsets, and `@StartOfDay`, `@StartOfWeek`, `@StartOfMonth` and `@StartOfYear` with offsets like `('+3M')`. `@Today` resolves to midnight on the machine running the query, so "a query that uses the `@today` macro can return different result sets depending on the time zone in which it runs."
- **Custom fields are first-class**, by reference name (`Custom.RequestType`).
- **The API returns IDs only.** "The API only returns work item IDs, regardless of which fields you include in the `SELECT` statement"; clients fetch fields in a second call. That split keeps the query path an index lookup and moves field hydration, and its permission checks, to a separate batch read.

The published limits as of October 2026: queries "must not exceed 32-K characters"; execution stops after 30 seconds with a timeout error; results are "truncated at 20,000 items, no error is shown"; 999 shared queries per folder and 200 favorite queries per project. The silent truncation is the limit worth copying with care: a report built on a truncated query is wrong without saying so. My rule is that a truncated result always says it was truncated, in the UI and in the API response.

## Filters Without a Language

Linear has no user-facing query language, and its filter builder carries most of the expressiveness instead. Filters are applied from a menu (or the `F` key), stack, and appear in the browser URL so a shared link reapplies them; "Advanced filter" groups conditions with AND/OR logic, "including nested filter groups"; natural-language input such as "Show me issues assigned to me" is translated into filters. Operators are typed by property: `is` and `is not` for single values, `is either of` for several, `includes any`, `all`, `neither`, `either` or `none` for labels and links, `before` and `after` for dates. Some properties carry product meaning beyond their value: "Added to cycle" distinguishes Planned issues (added before the cycle started or within its first 24 hours) from those added after, which is a scope-change filter built into the vocabulary ([Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#linear-cycles)).

GitHub sits between the two: qualifiers such as `is:open`, `label:"bug"`, `assignee:octocat` and `type:"Bug"`, a space meaning `AND`, explicit `AND` and `OR`, and parentheses "limited to five levels" of nesting. Commas within a qualifier mean OR (`label:"bug","wip"`), separate qualifiers mean AND.

The convergence is clear: a typed condition tree (field, operator, values), grouped with AND and OR, serialized into the URL and into saved views. Whether a product also accepts typed text is a surface choice; the stored form should be the tree, because a tree can be validated against field definitions, rewritten when a field is renamed, and translated to the index's query language without parsing user text twice.

## Saved Filters and Views

A saved query becomes an object with an owner, an audience and a lifecycle.

**Jira filters** can be shared "via user groups, spaces, and space roles," or with "My organization" (every user on the site); private filters can be viewed or edited "only by the owner and Jira admins." Viewer and editor permissions are granted separately, and a non-owner who changes a filter's criteria can only save the result as a new filter they own. Changing a filter's owner needs a Jira admin. Boards are built on filters: a board created from a saved filter "will be available to all users who have access to your chosen filter," which makes the filter's sharing the board's sharing. **Subscriptions** email a filter's results on a schedule, but "only the first 200 results of a filter are sent," and a user can choose a group as recipient only if they belong to it.

**Linear views** have an owner (the creator by default, changeable), and are shared at the workspace level (available to full members) or scoped to a team, project or initiative. "Sharing a link does not automatically give anyone access to a view, it must be shared first." Members can subscribe to a view, personally or into a Slack channel, and be notified when an issue is added to it or when one in it is completed or canceled.

**GitHub project views** save automatically when created, but changes to sorting, grouping and filtering stay local until saved: a dot marks unsaved changes, and "No one else will see your changes" until someone saves them.

**Azure Boards** keeps shared queries in folders (999 per folder) and personal favorites (200 per project).

Four rules for a builder follow:

- **Ownership survives the owner.** Saved views referenced by boards and dashboards can't vanish when their author is deactivated; an admin must be able to reassign them, and offboarding (Provisioning, SCIM & Offboarding) should list what a departing member owns.
- **Sharing never widens access to items.** A filter shared with the whole organization returns, for each viewer, only the items that viewer can see. The share grants the query, not the results.
- **Subscriptions run as the recipient.** A scheduled email of a filter's results must evaluate permissions per recipient, or a subscription becomes a way to mail restricted items to a group; Jira's rule that you can only target a group you belong to is one guard, per-recipient evaluation is the other.
- **Group recipients are a publication.** A view piped into a chat channel publishes its results to everyone in the channel, including guests, so the channel's audience must be checked against the view's audience when the subscription is created.

## Views and Layouts

A view is a saved query plus a presentation. The layouts are converging across products:

- **List or table:** rows and columns, with sorting and grouping; GitHub's table layout shows project fields as columns.
- **Board:** columns from a status or single-select field, with per-column counts and limits ([Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#columns-are-mapped-statuses)).
- **Timeline or roadmap:** items positioned by date fields; GitHub's roadmap "use[s] your custom date and iteration fields to position your issues" ([Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals#roadmaps-and-timelines)).
- **Calendar:** items on due or target dates.

The engineering point is that layout is not the query. A board and a list over the same filter must show the same items, and switching layout must not change the result set, which is only true if grouping, column mapping and hidden-item rules are applied after the query, visibly. Jira's board hides work items whose status isn't mapped to a column ("Unmapped statuses will hide work items both in your board view and backlog view"), Azure's backlogs and boards hide completed items whose Changed Date is older than 183 days, and both are frequent sources of "where did my ticket go" because the hiding happens in the layout without saying so.

## Dashboards

A dashboard is a shared page of widgets, each fed by a saved query or a chart over one. In Jira, "any Jira user can create a dashboard," access is set with Viewers and Editors fields for spaces or groups, gadgets draw on filters, and trashed dashboards "can only be restored by a Jira admin, and are permanently deleted from your site after 60 days." Azure Boards allows 500 project dashboards per project and 500 team dashboards per team, and advises removing duplicates and consolidating widgets as the limit approaches. Linear's Insights turn a view into a chart (issue count, effort, cycle time, lead time, triage time and issue age, sliced and segmented by the view's properties) on its Business and Enterprise plans.

Dashboards concentrate three problems. **Each widget is a query per viewer**, so a dashboard with twenty gadgets opened by an all-hands audience is twenty permission-trimmed queries times every attendee; caching has to be per permission set, not per dashboard ([Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely)). **Widgets outlive their filters**: a deleted or privatized filter leaves a broken widget, which should say so rather than show zero. **Numbers travel**: a dashboard screenshot in a board deck is a record, so every chart should show the query, the time it ran and whether results were truncated.

## Permission-Trimmed Queries

Every query result must be trimmed to what the viewer may see. In work management, visibility comes from several layers at once: the workspace, the project (container) and its grants, sometimes an item-level restriction, and occasionally field-level security. Jira's work item security schemes are the item-level case: users not assigned to an item's security level "won't be able to view those work items, even if they can access the rest of the space," and an item moved to a new space takes that space's default level. The permission model itself, with roles, inheritance and link sharing, is Permissions & Sharing; this section is about making a trimmed query fast.

There are three ways to trim, and products use all three:

1. **Filter in the index.** Store each item's visibility (project ID, security level, explicit principals) in the search index as fields, and add the viewer's allowed set to every query: `project IN (viewer's projects) AND (security_level IS NULL OR security_level IN (viewer's levels))`. This is fast and keeps pagination and counts correct, and it requires reindexing items when their visibility changes.
2. **Post-filter after the index.** Query without visibility, then drop items the viewer can't see. It's simple and breaks counts and pagination (a page of 50 can come back with 12), and it leaks timing and totals.
3. **Hydrate and check.** Return IDs from the index, then check each one in the permission service while fetching fields, as WIQL's ID-only API makes natural. This is correct for rare restrictions layered on index filtering, and too slow as the only mechanism.

My default is the first for every visibility rule that applies to many items (project membership, security levels), with a hydrate-time check as a safety net for rare restrictions and for permission changes the index hasn't caught up with. The viewer's allowed set is computed once per request and is part of any cache key. Counts and "N results" show the trimmed number; a result capped by limits says so.

Two subtleties catch builders:

- **Links and rollups leak.** A parent's progress bar computed over children the viewer can't see, a "blocked by" badge whose blocker is restricted, or a sum on a board column all reveal hidden items. Rollups must be computed over the viewer's visible set, or show only that something hidden exists ([Links and Dependencies](/books/workplace-and-collaboration/work-items-and-fields#links-and-dependencies)).
- **Saved queries reference what the author could see.** A filter mentioning a restricted project or a private field by ID still runs for viewers who can't see either; the clause should match nothing for them and the filter editor should not reveal the hidden names.

## How to Build It

The chapter adds saved views with their condition tree, view subscriptions, and dashboards with widgets. Sharing reuses the core `grants` table with `resource_type = 'work_item_view'` or `'work_dashboard'`; the share grants the object, never the items.

```sql
CREATE TABLE work_item_views (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  owner_member_id UUID NOT NULL REFERENCES members (id),
  scope_container_id UUID REFERENCES containers (id),   -- team or project view; null: workspace
  name           TEXT NOT NULL,
  filter         JSONB NOT NULL,           -- condition tree: {op:'and', terms:[{field, operator, values}]}
  filter_text    TEXT,                     -- the JQL-style text, if entered as text
  sort           JSONB NOT NULL DEFAULT '[]',
  layout         TEXT NOT NULL DEFAULT 'list' CHECK (layout IN ('list', 'board', 'timeline', 'calendar')),
  layout_options JSONB NOT NULL DEFAULT '{}',   -- group_by, columns, swimlanes, date fields
  version        INT NOT NULL DEFAULT 1,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at    TIMESTAMPTZ
);

CREATE TABLE work_item_view_subscriptions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  view_id        UUID NOT NULL REFERENCES work_item_views (id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('member', 'group', 'channel')),
  recipient_id   UUID NOT NULL,
  trigger        TEXT NOT NULL CHECK (trigger IN ('schedule', 'item_added', 'item_completed')),
  schedule       TEXT,                     -- RRULE for scheduled digests
  created_by     UUID NOT NULL REFERENCES members (id),
  max_items      INT NOT NULL DEFAULT 200
);

CREATE TABLE work_dashboards (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  owner_member_id UUID NOT NULL REFERENCES members (id),
  name           TEXT NOT NULL,
  layout         JSONB NOT NULL DEFAULT '{}',
  trashed_at     TIMESTAMPTZ               -- restorable by an admin, purged after a set period
);

CREATE TABLE work_dashboard_widgets (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  dashboard_id   UUID NOT NULL REFERENCES work_dashboards (id),
  view_id        UUID REFERENCES work_item_views (id),   -- null when the view was deleted
  widget_type    TEXT NOT NULL,            -- 'count', 'pie', 'created_vs_resolved', 'list'
  options        JSONB NOT NULL DEFAULT '{}',
  position       JSONB NOT NULL
);
```

The condition tree is validated against `work_item_fields` and operator types on save, and stores field IDs, not labels, so a renamed field doesn't break saved views. Execution translates the tree to the index's query and always appends the viewer's visibility clause; the API response reports truncation:

```sql
-- the relational fallback for small tenants: visibility is a join, not a post-filter
SELECT w.item_id
FROM work_items w
JOIN viewer_visible_containers v ON v.container_id = w.container_id   -- computed per request
WHERE w.status_id = ANY ($statuses)
  AND (w.custom ->> $priority_field)::int <= 2
  AND NOT EXISTS (SELECT 1 FROM item_restrictions r   -- item-level restrictions, from Permissions & Sharing
                  WHERE r.item_id = w.item_id
                    AND NOT r.principal_ids && $viewer_principals)
ORDER BY w.item_id DESC
LIMIT 501;   -- one more than the page cap tells the caller "truncated"
```

Subscriptions run as each recipient: a group or channel recipient is expanded at send time and the query is evaluated per member, or once with the intersection of members' visibility for a channel, whichever the product promises in its UI.

## Auditing

- **Sharing changes** on views and dashboards (who shared what with whom, and widening to the whole organization), as admin-visible events in `audit_events`.
- **Subscriptions to groups and channels**, with the creator and the audience at creation, because they publish results outside the product.
- **Exports** of query results (CSV, Excel, API bulk reads), with the viewer and the row count, since an export is the bulk path out ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Ownership transfers** of views and dashboards during offboarding.

## What This Means for the System You Build

- **Store queries as typed condition trees** against field IDs, with text as an optional surface that round-trips.
- **Make saved queries personal with functions** (`currentUser()`, `@Me`, relative dates) so one shared view works for everyone.
- **Share the query, never the results:** every execution is trimmed for the viewer, including subscriptions and channel digests.
- **Trim in the index** for common visibility rules and check at hydration for rare ones; keep counts and pagination honest.
- **Publish limits and never truncate silently.**
- **Keep layouts honest:** say when a board hides unmapped or old items.
- **Make views and dashboards survive their owners** with admin reassignment.

## References

**Vendor documentation**

- [Atlassian Support: What is advanced search in Jira Cloud?](https://support.atlassian.com/jira-software-cloud/docs/what-is-advanced-search-in-jira-cloud/), JQL structure, examples, precedence, indexing of non-alphanumeric characters, reserved words, CONTAINS fields, autocomplete and basic search limits
- [Atlassian Support: JQL operators](https://support.atlassian.com/jira-software-cloud/docs/jql-operators/), equals, not equals on empty fields, ordering for greater-than, and text-field restrictions
- [Atlassian Support: Manage filters](https://support.atlassian.com/jira-software-cloud/docs/manage-filters/), sharing options, private filters, viewer and editor permissions, saving as new, subscriptions and the 200-result limit, owner changes
- [Atlassian Support: Save your search as a filter](https://support.atlassian.com/jira-software-cloud/docs/save-your-search-as-a-filter/), sharing, scheduled email, exports and dashboard gadgets
- [Atlassian Support: Create a board based on filters](https://support.atlassian.com/jira-software-cloud/docs/create-a-board-based-on-filters/), board visibility follows the filter
- [Atlassian Support: Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/), unmapped statuses hide work items
- [Atlassian Support: Create and edit dashboards](https://support.atlassian.com/jira-software-cloud/docs/create-and-edit-dashboards/), creation, viewers and editors, trash and 60-day deletion
- [Atlassian Support: Configure work item security schemes](https://support.atlassian.com/jira-cloud-administration/docs/configure-issue-security-schemes/), item-level visibility and default levels on move
- [Microsoft Learn: WIQL syntax](https://learn.microsoft.com/en-us/azure/devops/boards/queries/wiql-syntax), clauses, ID-only API results, 32K limit, operators by field type, EVER, macros and time zones, ASOF, link queries and modes
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), query execution time, results truncation, query length, shared and favorite query limits, dashboard limits
- [Microsoft Learn: Workflow and state categories](https://learn.microsoft.com/en-us/azure/devops/boards/work-items/workflow-and-state-categories), hiding completed items older than 183 days
- [Linear Docs: Filters](https://linear.app/docs/filters), operators, advanced nested filters, AI filters, URL filters and Added to cycle
- [Linear Docs: Custom views](https://linear.app/docs/custom-views), saved views, ownership, workspace and team scope, link sharing and subscriptions
- [Linear Docs: Insights](https://linear.app/docs/insights), measures, slices and segments, plan availability
- [GitHub Docs: Filtering and searching issues and pull requests](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests), qualifiers, AND and OR, five levels of parentheses
- [GitHub Docs: Managing your views](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/managing-your-views), automatic saving and unsaved changes
- [GitHub Docs: Customizing the roadmap layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout), date and iteration fields position items
- [GitHub Docs: Adding items to your project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project), 50,000 items per project
