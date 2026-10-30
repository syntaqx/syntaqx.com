+++
title = "Boards, Sprints & Cycles"
description = "Scrum and Kanban as data: boards and column mapping, WIP limits, sprints and Linear cycles, estimates and velocity, burndown, cumulative flow and flow metrics."
category = "Workplace & Collaboration Industry"
order = 2032
part = "Work Management"
tags = ["work-management", "scrum", "kanban", "sprints", "flow-metrics"]
+++

A board is the face of a work management product: cards in columns, dragged left to right as work moves. Behind it sit two methods that the products encode as data. Scrum time-boxes work into sprints, which "are fixed length events of one month or less" with a single Sprint Goal; Kanban, in its own guide's words "a strategy for optimizing the flow of value through a process," limits work in progress and measures flow. Jira, Azure Boards, GitHub Projects, Linear and ClickUp all implement both, with different defaults, and every chart they draw (velocity, burndown, cumulative flow, cycle time) is a query over the history those methods produce.

The hard parts are definitional. Which column counts as done, what happens to unfinished work when a sprint closes, whether an estimate added mid-sprint is scope change, and how to stop a velocity chart from becoming a performance target. The products answer each with a rule, and the rules decide what every report means. The customer's teams and admins choose the method, the board's columns and the estimation scale; the vendor decides the semantics of the charts, and should publish them.

This chapter covers boards and columns, WIP limits, sprints and cycles, estimates and velocity, the standard charts and flow metrics. Statuses and categories are [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states#statuses-and-categories); the board's underlying query is [Queries, Views & Dashboards](/books/workplace-and-collaboration/queries-views-and-dashboards); plans that span many boards are [Portfolios, Roadmaps & Goals](/books/workplace-and-collaboration/portfolios-roadmaps-and-goals). DORA's delivery metrics as engineering practice are the playbook's [Delivery Stability: DORA](/docs/quality/metrics#delivery-stability-dora).

## How the Platforms Do It

As of October 2026:

| Product | Board source | Time-box | Unfinished work at close | Estimates | WIP limits | Charts |
| --- | --- | --- | --- | --- | --- | --- |
| **Jira** | A saved filter; columns mapped to statuses | Sprints with name, dates and optional goal; parallel sprints in company-managed spaces | Moves to the backlog, a future sprint or a new sprint | Story points, time or work item count | Column min and max; red or yellow header | Velocity, burndown, cumulative flow, control chart |
| **Azure Boards** | Team backlog by area path; columns mapped to states | Iteration paths, up to 300 per team | Not covered in the sources cited here | Effort, story points or size; capacity in hours | Soft limits; highlights the count | Velocity (up to 15 sprints), sprint burndown, cumulative flow |
| **GitHub Projects** | Project items; columns from a single-select or iteration field | Iteration field in days or weeks, with breaks | Not covered in the sources cited here | Number fields, summed per column | Per-view column limit, not enforced | Burn up and custom insights charts |
| **Linear** | Team issues; columns from statuses | Cycles of 1 to 8 weeks, automatic, with optional cooldown | Open issues roll over automatically | Linear, exponential, Fibonacci or T-shirt scales | Not covered in the sources cited here | Cycle graph, project graph, Insights |
| **ClickUp** | Lists and boards | Sprints with custom durations on every plan; Sprint automations from Business | Not covered in the sources cited here | Sprint Points: 100 uses on Free Forever and Unlimited, a trial on Core, unlimited from Business | Not covered in the sources cited here | Sprint dashboard cards from Business |

Three patterns run through the table. **The board is a view, not a container:** in Jira a board is a saved filter, in GitHub a field, so the same item can sit on many boards. **"Done" is a column decision:** only the last column counts as complete in Jira, and the Completed category maps to the final column in Azure. **WIP limits are advisory everywhere:** none of the products blocks a card from entering a full column; they color the header.

## Boards and Columns

"A board displays your team's work as cards you can move between columns," and "the columns on your board represent the status of your team's work items," with To Do, In Progress and Done as Jira's defaults. A board's contents come from a query, and its columns from a mapping.

### Columns Are Mapped Statuses

A column is a set of statuses, not a status. Jira's default mapping puts Open and Reopened under To Do, In Progress under In Progress, and Resolved and Closed under Done; "unmapped statuses will hide work items both in your board view and backlog view," and "Jira only considers work items in the right-most column of your board as complete." Azure Boards gives the same rule from the other side: states belong to categories, Proposed maps to the first column and Completed to the last, and "if a state isn't mapped, it doesn't appear on the board." Azure draws the line between the two layers: "State: Project-level workflow logic shared across teams. Column: Team-level board visualization," so team administrators can add columns (split "In Progress" into "Doing" and "Review") without touching the shared workflow. GitHub's board takes its columns from "any single select or iteration field," which makes any field a possible board.

The mapping is the source of most board confusion: a new status added to the workflow and not mapped makes items disappear from the board. A builder should flag unmapped statuses on the board itself ("3 items in statuses not on this board") rather than hiding them silently, and should derive the done line from status categories, not from whichever column happens to be last.

### What a Board Holds

Boards have display limits that say something about their cost. Jira's company-managed board, backlog and timeline can each show "up to 5,000 work items at a time" (the new board view rolling out as of October 2026 removes that limit except for company-managed boards that pull work items from multiple spaces), while "there's no limit on the number of work items that can be included in a filter"; without sprints, completed work leaves a Kanban board's last column after 14 days. Azure shows 1,000 cards per board excluding the Proposed and Completed categories, 1,000 tasks on a taskboard, 10,000 items on a backlog, and hides completed or closed items whose Changed Date is older than a year. GitHub Projects allow 50,000 items per project.

The pattern is that boards show working sets, and history lives in queries and reports. My rule is the same: a board's query should exclude old completed work by default, the exclusion should be stated on the board, and every chart should read from history tables, not from what the board currently shows.

## WIP Limits

Kanban's central control is a limit on work in progress per column. Jira offers "Work item count" or "Work item count, excluding subtasks," with a minimum and maximum per column; over the maximum turns the header red, under the minimum yellow, and constraints count items hidden by quick filters. Azure's limits are "soft constraints ... You can exceed these limits, but the board highlights the column count," with a starting suggestion of "two to three items per team member in a stage," and the advice that exceeding a limit by one or two is normal while consistently exceeding it by three or more means the process needs review. GitHub's column limits are per view, and "setting a limit does not restrict anyone from adding cards that would exceed the column's limit."

None of the products enforces a limit, and I think that's right: the limit is a signal for the team's conversation, and a hard block pushes people to work around the board, which corrupts the data every chart depends on. What a builder should add is history: record when a column was over its limit and for how long, since "we were over WIP for nine days" is the useful fact in a retrospective.

## Sprints

A sprint is a time-box with a scope. In Jira, a sprint is started from the backlog with a name, start and end dates and an optional goal ("this sprint goal is also displayed on the Sprint Report and Burndown Chart"); company-managed spaces can turn on parallel sprints to "run multiple active sprints at the same time." When a sprint completes, items "are considered as complete once they have been moved to the last column on the board," and incomplete items go to the backlog, an existing future sprint or a new sprint; incomplete items from other boards go to the backlog. Azure calls sprints Iteration Paths, defined per project and selected by teams (up to 300 per team), with `@CurrentIteration` as a query macro, and warns that deleting or reconfiguring iteration paths "causes irreversible data loss" in burndown, velocity and trend charts. GitHub's iteration field creates three iterations to start, with length in days or weeks and breaks inserted between them.

The Scrum Guide sets the outer bounds the products don't enforce: sprints are one month or less, the Sprint Goal is "the single objective for the Sprint," and for a one-month sprint the planning event is at most eight hours, the Daily Scrum 15 minutes, the review four hours and the retrospective three hours. The guide never mentions velocity or story points; it lists burn-downs, burn-ups and cumulative flows as forecasting practices without prescribing them.

Three data rules follow for a builder:

- **A sprint's scope is a history, not a list.** Record when each item entered and left the sprint, and its estimate at each moment. Jira's burndown treats a subtask added mid-sprint as "scope change," and its velocity chart's "commitment" is the estimate at sprint start while "completed" is the estimate at sprint end, which only works if both are stored.
- **Closing a sprint is a batch operation** with a record: which items were done, which moved and where, with the actor. Reports read that record rather than recomputing from current state.
- **Iteration definitions are append-only.** Azure's warning about irreversible data loss is the case for never deleting or re-dating a past iteration; correct it by adding a new one.

## Linear Cycles

Linear's cycles are sprints made automatic. A team picks a duration of 1 to 8 weeks and a start day; cycles "begin at 12:01 AM on the chosen day" in the team's time zone and repeat, with up to 15 future cycles created. An optional cooldown follows each cycle ("Issues cannot be assigned to a cooldown"). At the end, "open issues generally roll over automatically," except those moved to backlog, triage, canceled or completed during the cooldown. Teams can auto-add started or completed issues to the current cycle. Turning cycles off completes the current one and removes upcoming ones, keeping completed cycle data.

Cycles reframe the sprint as a cadence rather than a commitment: there is no "start sprint" ceremony in the tool, and rollover is the default rather than a decision. Capacity follows the same logic. Linear computes it "from the completed issues or estimate counts from your three previous cycles," falling back to "a very rough estimate on capacity based on your team size" when there are none, and its cycle graph shows started and completed on separate lines plus scope added or removed. Its filter vocabulary marks issues added to a cycle more than 24 hours after it started, which makes mid-cycle scope change a first-class query ([Filters Without a Language](/books/workplace-and-collaboration/queries-views-and-dashboards#filters-without-a-language)).

### Triage

Linear's triage is the intake step in front of cycles: a team inbox for issues created by integrations or by people outside the team, where each issue is accepted, declined (which sets it to canceled), marked as a duplicate or snoozed. Responsibility for triage can rotate through an on-call schedule from PagerDuty, Opsgenie, Rootly or incident.io, and triage rules and triage responsibility require the Business or Enterprise plan as of October 2026. Triage is the work management version of a service desk queue ([IT & Service Management](/books/workplace-and-collaboration/service-management#requests-and-queues)): work that arrives from outside the team is reviewed before it competes for the team's time.

## Estimates and Velocity

Estimates come in scales. Jira's company-managed boards choose an estimation statistic (story points, original time, work item count or a numeric field); team-managed spaces choose story points or time, and time tracking can run separately from estimation. Linear offered "a linear scale, exponential scale, Fibonacci scale, or ... T-Shirt sizes" from its 2019 launch of cycles, with T-shirt sizes mapping to points (XS 1, S 2, M 3, L 5, XL 8, XXL 13, XXXL 21). Azure sums Effort, Story Points or Size, and also plans capacity in hours or days per person per sprint, accounting for days off, with the tip "Define tasks that take a day or less to complete."

Velocity is the sum of completed estimates per sprint. Jira's velocity chart "displays the average amount of work a scrum team completes during a sprint," with a commitment bar (the estimate at sprint start) and a completed bar (the estimate at sprint end, including scope changes); sub-task estimates are excluded. Azure counts velocity "in the sprint when work is completed," classifies items as Planned (assigned by the end of the first day), Incomplete, Completed or Completed Late, and its widget shows six sprints by default and 15 at most, for a single team.

Azure's documentation also carries the most important sentence about the number: "Use velocity to aid in determining team capacity, but don't confuse it with key performance indicators." Velocity is in a team's private unit, inflates when it's watched, and can't be compared across teams whose points mean different things. A product can't prevent misuse, but it can avoid inviting it: no cross-team velocity leaderboards, velocity shown only within a team's own history, and estimates kept out of individual performance views.

## The Standard Charts

Each chart is a query over status history and estimate history, and each has a published definition worth matching:

- **Burndown.** Remaining work in the sprint against time; Jira's vertical axis is "the estimation statistic that you have configured for your board," and a missing guideline means "the sprint may have been started before any work items were assigned to it." Azure's sprint burndown can use work item count or a sum of Story Points, Effort or Remaining Work, with Ideal Trend, Total Scope Increase and Capacity lines, and Microsoft tells users to expect a "staircase burndown pattern."
- **Burn up.** Completed work rising toward a scope line; GitHub's default insights chart is a burn up of open, completed and not-planned items, and it "does not track items you have archived or deleted."
- **Cumulative flow.** "An area chart that shows the various statuses of work items" over time; when an area widens, "the column that equates to the widening area will generally be a bottleneck." Azure's version covers a rolling 14 to 180 days and reports average WIP excluding completed items. Linear's Insights can render burn-up history as a cumulative flow diagram.
- **Control chart.** Cycle time per item as a scatter. Jira defines cycle time as "the time spent working on a work item" and lead time as the time "from when a work item is logged," and computes a rolling average that is "work-based, not time-based," over "20% of the total work items displayed (always an odd number and a minimum of 5 work items)," with the standard deviation shaded.
- **Project graph.** Linear plots scope, started and completed for a project and predicts completion after at least one week of data, weighting recent weeks, counting in-progress issues at a quarter of their points toward remaining work, and showing optimistic and pessimistic dates around the estimate.

The builder's lesson is that every chart needs three histories: status changes ([Workflows as Data](/books/workplace-and-collaboration/workflows-and-states#workflows-as-data)), sprint membership changes, and estimate changes. A product that stores only current state can draw none of them correctly after the fact.

## Flow Metrics and Their Misuse

The Kanban Guide names four flow metrics: work in progress ("the number of work items started but not finished"), throughput ("the number of work items finished per unit of time"), work item age ("elapsed time between when a work item started and the current date") and cycle time ("elapsed time between when a work item started and when a work item finished"). They are the board-level cousins of DORA's delivery metrics, which measure the pipeline rather than the board: change lead time ("time it takes for a change to go from committed to version control to deployed in production"), deployment frequency, failed deployment recovery time, change fail rate and deployment rework rate. The two families meet at the item: a work item's cycle time ends when its change ships, which needs the item linked to the deploy ([Development Collaboration](/books/workplace-and-collaboration/development-collaboration#deployments-on-the-work-item)).

Misuse follows the same pattern for both. Flow metrics describe a system; used to rank people they change behavior (items split to raise throughput, statuses skipped to shorten cycle time, "Won't do" closures counted as delivery). The playbook's [What Not to Measure](/docs/quality/metrics#what-not-to-measure) covers the engineering side. The product rules:

- **Define start and finish by category**, not by status name, and publish the definition on the chart.
- **Count only delivered resolutions** in throughput and cycle time ([Resolutions](/books/workplace-and-collaboration/workflows-and-states#resolutions)).
- **Show distributions, not just averages**: Jira's control chart and Linear's scatterplots are the right shape, because averages hide the old items that matter.
- **Show work item age on the board**, because it is the one flow metric a team can act on today.
- **Aggregate at team level and above.** Individual flow metrics are the misuse.

## Who Decides

- **Teams choose the method** (sprints, cycles or continuous flow), the board's columns, WIP limits and estimation scale.
- **Admins choose the boundaries**: whether parallel sprints are allowed (Jira needs the Administer Jira permission), which workflows boards map onto, and which plan features (Linear's triage rules, ClickUp's Sprint Points) are bought.
- **Managers decide how the numbers are used**, which is outside the product; the product's part is not to make individual rankings the default view.

## How to Build It

The chapter adds the board and its columns, sprints (cycles are sprints generated from a cadence), sprint membership history, estimate history and daily snapshots for flow charts. A board is a kind table on `containers` (kind `board`) whose contents come from a saved view in `work_item_views`.

```sql
CREATE TABLE boards (                      -- kind table for containers.kind = 'board'
  container_id   UUID PRIMARY KEY REFERENCES containers (id),
  view_id        UUID NOT NULL REFERENCES work_item_views (id),   -- the board's query
  method         TEXT NOT NULL CHECK (method IN ('scrum', 'kanban', 'cycles')),
  estimate_field TEXT NOT NULL DEFAULT 'estimate',   -- or a work_item_fields id, or 'count'
  wip_counts_subtasks BOOLEAN NOT NULL DEFAULT TRUE,
  done_ages_out_after INTERVAL DEFAULT INTERVAL '14 days'   -- kanban: hide old done cards
);

CREATE TABLE board_columns (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  board_id       UUID NOT NULL REFERENCES boards (container_id),
  name           TEXT NOT NULL,
  position       SMALLINT NOT NULL,
  status_ids     UUID[] NOT NULL,          -- statuses mapped to this column
  wip_min        SMALLINT,
  wip_max        SMALLINT,
  UNIQUE (board_id, position)
);

CREATE TABLE cycle_cadences (              -- Linear-style automatic sprints
  board_id       UUID PRIMARY KEY REFERENCES boards (container_id),
  duration_weeks SMALLINT NOT NULL CHECK (duration_weeks BETWEEN 1 AND 8),
  cooldown_weeks SMALLINT NOT NULL DEFAULT 0,
  start_weekday  SMALLINT NOT NULL CHECK (start_weekday BETWEEN 0 AND 6),
  time_zone      TEXT NOT NULL,
  future_count   SMALLINT NOT NULL DEFAULT 3 CHECK (future_count <= 15),
  auto_rollover  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sprints (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  board_id       UUID NOT NULL REFERENCES boards (container_id),
  name           TEXT NOT NULL,
  goal           TEXT,
  period         TSTZRANGE NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('future', 'active', 'closed')),
  generated      BOOLEAN NOT NULL DEFAULT FALSE,   -- created by a cadence
  started_at     TIMESTAMPTZ,
  closed_at      TIMESTAMPTZ,
  closed_by      TEXT                      -- typed actor; 'system' only for cadence rollover
);
-- one active sprint per board unless the workspace allows parallel sprints (checked in code)

CREATE TABLE sprint_membership (           -- append-only: when items entered and left
  sprint_id      UUID NOT NULL REFERENCES sprints (id),
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  during         TSTZRANGE NOT NULL,
  added_reason   TEXT NOT NULL CHECK (added_reason IN ('planned', 'added', 'rolled_over')),
  removed_reason TEXT CHECK (removed_reason IN ('removed', 'completed', 'rolled_over', 'moved')),
  EXCLUDE USING GIST (sprint_id WITH =, item_id WITH =, during WITH &&)
);

CREATE TABLE work_item_estimate_changes (
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  estimate       NUMERIC(8,2),
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor          TEXT NOT NULL
);

CREATE TABLE board_daily_snapshots (       -- feeds cumulative flow and WIP history
  board_id       UUID NOT NULL REFERENCES boards (container_id),
  day            DATE NOT NULL,
  column_id      UUID NOT NULL REFERENCES board_columns (id),
  item_count     INT NOT NULL,
  estimate_sum   NUMERIC(12,2) NOT NULL,
  over_wip       BOOLEAN NOT NULL,
  PRIMARY KEY (board_id, day, column_id)
);
```

A sprint's commitment and completion come from membership and estimate history at two instants, which is what makes a velocity bar reproducible:

```sql
WITH s AS (SELECT id, lower(period) AS start_at, closed_at FROM sprints WHERE id = $1),
members AS (
  SELECT m.item_id,
         m.added_reason,
         lower(m.during) <= s.start_at AS at_start,
         upper(m.during) IS NULL OR upper(m.during) >= s.closed_at AS at_close
  FROM sprint_membership m, s WHERE m.sprint_id = s.id
)
SELECT
  SUM(e_start.estimate) FILTER (WHERE at_start) AS commitment,
  SUM(e_end.estimate)   FILTER (WHERE at_close AND st.to_category = 'completed') AS completed
FROM members mb
CROSS JOIN s
LEFT JOIN LATERAL (SELECT estimate FROM work_item_estimate_changes
                   WHERE item_id = mb.item_id AND changed_at <= s.start_at
                   ORDER BY changed_at DESC LIMIT 1) e_start ON TRUE
LEFT JOIN LATERAL (SELECT estimate FROM work_item_estimate_changes
                   WHERE item_id = mb.item_id AND changed_at <= s.closed_at
                   ORDER BY changed_at DESC LIMIT 1) e_end ON TRUE
LEFT JOIN LATERAL (SELECT to_category FROM work_item_status_changes
                   WHERE item_id = mb.item_id AND changed_at <= s.closed_at
                   ORDER BY changed_at DESC LIMIT 1) st ON TRUE;
```

Closing a sprint runs in one transaction: close open membership rows with `completed` or `rolled_over`, open new rows in the target sprint with `added_reason = 'rolled_over'`, set the sprint's state, and write one audit event. The snapshot job runs once per board per day in the board's time zone ([Scheduling](/docs/architecture/background-jobs#scheduling)).

## Auditing

- **Sprint lifecycle**: start, scope changes after start, close and where unfinished items went, with actors.
- **Board configuration**: column mapping, WIP limits and estimation statistic, since each changes what every chart means.
- **Estimate changes** after sprint start, which is the history behind "completed includes scope changes."
- **Iteration and cadence edits**, which can rewrite the meaning of past reports and should be append-only.

## What This Means for the System You Build

- **Make the board a view** over a saved query, with columns as sets of statuses and the done line from categories.
- **Show what a board hides**: unmapped statuses, aged-out completed items, display limits.
- **Keep WIP limits advisory** and record how long columns were over them.
- **Store sprint membership, estimate and status histories**; every chart is a query over them.
- **Treat closing a sprint as a recorded batch** and never delete or re-date past iterations.
- **Publish each chart's definition** and match the established ones where they exist.
- **Keep velocity within a team** and flow metrics at team level; don't build the leaderboard.

## References

**Vendor documentation**

- [Atlassian Support: What is a Jira board?](https://support.atlassian.com/jira-software-cloud/docs/what-is-a-jira-software-board/), boards, default columns, the 5,000-item limit and where the new board view keeps it, 14-day removal of done work without sprints
- [Atlassian Support: Work item limits in company-managed spaces](https://support.atlassian.com/jira-software-cloud/docs/issue-limits-in-company-managed-projects/), board, backlog and timeline display limits and unlimited filters
- [Atlassian Support: Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/), column constraints, status mapping, unmapped statuses and the right-most column
- [Atlassian Support: Plan a sprint](https://support.atlassian.com/jira-software-cloud/docs/plan-a-sprint/), starting a sprint and the sprint goal
- [Atlassian Support: Complete a sprint](https://support.atlassian.com/jira-software-cloud/docs/complete-a-sprint/), completeness and where incomplete items go
- [Atlassian Support: Use parallel sprints](https://support.atlassian.com/jira-software-cloud/docs/use-parallel-sprints/), multiple active sprints and the admin permission
- [Atlassian Support: Configure estimation and tracking](https://support.atlassian.com/jira-software-cloud/docs/configure-estimation-and-tracking/), estimation statistics and time tracking
- [Atlassian Support: Velocity chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-velocity-chart/), definition, commitment and completed bars, excluded sub-tasks
- [Atlassian Support: Burndown chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-burndown-chart/), vertical axis, scope change and the missing guideline
- [Atlassian Support: Cumulative flow diagram](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-cumulative-flow-diagram/), definition and bottlenecks
- [Atlassian Support: Control chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/), cycle and lead time, the work-based rolling average and standard deviation
- [Microsoft Learn: Define iteration paths](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/set-iteration-paths-sprints), 300 iteration paths per team, @CurrentIteration, irreversible data loss
- [Microsoft Learn: Set capacity](https://learn.microsoft.com/en-us/azure/devops/boards/sprints/set-capacity), capacity in hours or days, days off, tasks of a day or less
- [Microsoft Learn: WIP limits](https://learn.microsoft.com/en-us/azure/devops/boards/boards/wip-limits), soft constraints and starting guidance
- [Microsoft Learn: Team velocity](https://learn.microsoft.com/en-us/azure/devops/report/dashboards/team-velocity), velocity basis, planned and late categories, widget limits, and the warning against treating velocity as a KPI
- [Microsoft Learn: Cumulative flow](https://learn.microsoft.com/en-us/azure/devops/report/dashboards/cumulative-flow), definition, rolling period and average WIP
- [Microsoft Learn: Sprint burndown](https://learn.microsoft.com/en-us/azure/devops/boards/sprints/sprint-burndown), measures, trend lines and the staircase pattern
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), board, taskboard and backlog display limits
- [Microsoft Learn: Workflow and state categories](https://learn.microsoft.com/en-us/azure/devops/boards/work-items/workflow-and-state-categories), category-to-column mapping and states versus columns
- [GitHub Docs: About iteration fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-iteration-fields), iteration length, initial iterations and breaks
- [GitHub Docs: Customizing the board layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout), columns from fields, unenforced column limits and field sums
- [GitHub Docs: About insights for Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects), burn up default and archived items
- [GitHub Docs: Adding items to your project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project), 50,000 items per project
- [Linear Docs: Conceptual model](https://linear.app/docs/conceptual-model), statuses as board columns
- [Linear Docs: Cycles](https://linear.app/docs/use-cycles), duration, start time, future cycles, cooldown, rollover, auto-add and turning cycles off
- [Linear Changelog: Cycles (July 4, 2019)](https://linear.app/changelog/2019-07-04-cycles), estimate scales and computed effort
- [Linear Changelog: Cycle and graph improvements (September 22, 2022)](https://linear.app/changelog/2022-09-22-cycles-and-graph-improvements), capacity from three previous cycles and graph lines
- [Linear Docs: Project graph](https://linear.app/docs/project-graph), scope, started and completed lines and prediction rules
- [Linear Docs: Triage](https://linear.app/docs/triage), triage actions, rotating responsibility and plan availability
- [Linear Docs: Creating issues](https://linear.app/docs/creating-issues), T-shirt estimate mapping
- [Linear Docs: Filters](https://linear.app/docs/filters), issues added to a cycle after its first 24 hours
- [Linear Docs: Insights](https://linear.app/docs/insights), burn-up history as cumulative flow
- [ClickUp Help: Sprints feature availability and limits](https://help.clickup.com/hc/en-us/articles/35714017592471-Sprints-feature-availability-and-limits), Sprints, Sprint Points, Sprint Cards and Sprint automations by plan

**Methods and research**

- [The Scrum Guide (2020)](https://scrumguides.org/scrum-guide.html), sprint length, Sprint Goal, Developers, event timeboxes, and the absence of velocity and story points
- [The Kanban Guide](https://kanbanguides.org/english/), definition and the four flow metrics
- [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics-four-keys/), change lead time, deployment frequency, recovery time, change fail rate and rework rate
