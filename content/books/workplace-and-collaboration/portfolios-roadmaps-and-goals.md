+++
title = "Portfolios, Roadmaps & Goals"
description = "Jira Plans, Atlassian Goals and Focus, Asana and monday portfolios, Linear initiatives, Azure delivery plans, OKRs, dependencies, capacity and status updates."
category = "Workplace & Collaboration Industry"
order = 2033
part = "Work Management"
tags = ["work-management", "portfolios", "roadmaps", "okrs", "capacity-planning"]
+++

Above the board sits the question executives ask: "across all of this work, are we doing the right things, and will they land on time?" Portfolio features answer it by grouping projects and epics into plans and portfolios, laying them on a timeline, connecting them to goals, tracking dependencies between teams, comparing demand with capacity, and collecting status updates from the people who own each piece. Every major vendor sells this layer, almost always on its top tiers: Jira Plans on Premium and Enterprise, Asana portfolios and goals on Advanced, monday.com portfolios and workload on Enterprise, Linear's team initiatives on Business and Enterprise.

The hard part is that the portfolio layer is made of other people's data. A plan's dates come from estimates teams entered for their own use; its progress from statuses mapped differently in each workflow; its dependencies from links someone remembered to draw. Rolling those up honestly, across permissions and across teams that don't share a method, is the engineering problem; deciding which numbers leadership sees is the political one. The customer's leaders own the goals and the structure; the teams own the underlying items; the vendor owns the rollup rules, and the best thing it can do is make them visible.

This chapter covers plans and portfolios, roadmaps, goals and OKRs, dependencies across teams, capacity, and status updates. Boards and sprints are [Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles); the items and links being rolled up are [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields).

## How the Platforms Do It

As of October 2026:

| Product | Portfolio object | Goals | Capacity | Dependencies | Status updates | Plan |
| --- | --- | --- | --- | --- | --- | --- |
| **Jira Plans** (formerly Advanced Roadmaps) | A plan over boards, spaces and filters, with sandboxed scenarios | Atlassian Goals, linked to work items, projects and epics | Per team, from story points or time, on board-sourced plans | Item links, respected by the auto-scheduler | Goal and project updates with reminders | Jira Premium and Enterprise |
| **Atlassian Focus and Jira Align** | Strategic portfolio: goals, work, teams and funds | Focus Areas; OKRs | Funding and teams | Not covered in the sources cited here | Rollups to Focus Areas | Strategy Collection |
| **Asana** | Portfolios of projects | Goals | Resource management within a portfolio; universal on Enterprise | Not covered in the sources cited here | Project status updates | Advanced and above |
| **monday.com** | Portfolio with health snapshots | Not covered in the sources cited here | Resource management (workload) | Dependency columns | Not covered in the sources cited here | Enterprise |
| **Linear** | Projects grouped into initiatives and sub-initiatives | Initiatives as company objectives | Cycle capacity per team | Not covered in the sources cited here | Project and initiative updates with health and reminders | Initiatives on all plans; team initiatives Business and Enterprise |
| **Azure Boards** | Delivery plans of up to 20 team backlogs | Epics and features | Sprint capacity per person | Predecessor and successor links on the plan | Not covered in the sources cited here | Included |
| **GitHub Projects** | A project with a roadmap layout | Not covered in the sources cited here | Not covered in the sources cited here | Blocked by and blocking | Not covered in the sources cited here | Included |
| **Microsoft Planner** | Plans (absorbing Project for the web) | Viva Goals retired December 31, 2025 | Not covered in the sources cited here | Task links (20 per task in Project for the web) | Not covered in the sources cited here | Planner and Project plans |

Three patterns run through the table. **Portfolio features are the top tier**, and the tier boundary is drawn at the point where one team's tool becomes the company's. **Goals moved into the work tools**: Microsoft retired its standalone OKR product while Atlassian and Linear built goals beside the work. **Plans are views over items, not copies of them**: Jira Plans pull from boards, spaces and filters; Azure delivery plans read team backlogs; the rollup is always computed from the items teams already maintain.

## Plans and Portfolios

**Jira Plans** "let you combine work items from boards, spaces, and filters," and the features are "only available as part of Jira Cloud Premium and Enterprise." A plan is a sandbox: changes stay in the plan until someone commits them to the underlying work items, and scenarios let a planner try alternative versions of the same plan. Its documented size limits are worth reading carefully: one page says "a plan can load up to 10,000 work items" and "can span up to 200 Jira spaces," with no enforced limit on teams but a recommendation of "no more than 50 teams," and labels those limits as applying to Jira Plans Enterprise; another says Premium plans can "display up to 30,000 work items." I cite both because they conflict as of October 2026, and a builder should notice that even the vendor's own documentation struggles to state one number for a view that scales with its sources.

**Hierarchy above the epic** is what makes a plan a portfolio. Jira's default hierarchy stops at the epic; "Jira Premium and Enterprise customers can also create and manage additional levels" (initiative, theme or whatever the customer names them), and the change is irreversible ([Why Hierarchy Changes Are One-Way](/books/workplace-and-collaboration/work-items-and-fields#why-hierarchy-changes-are-one-way)). Azure Boards allows up to five portfolio backlog levels per process.

**Azure delivery plans** show "up to 20 team backlogs," including from other projects, on one timeline, with predecessor and successor dependencies drawn between items, custom markers, and feature and epic rollups; "Target Date always overrides the Iteration end date" when an item is placed.

**Asana** sells "Unlimited portfolios," goals and resource management "within a portfolio" on its Advanced plan ($24.99 per user per month billed annually as of October 2026), and "Universal resource management ... across your organization" on Enterprise. **monday.com** offers portfolio management ("Connect projects to a unified portfolio with real-time health snapshots") and resource management only on its Enterprise tier of monday work management.

**Atlassian Focus**, announced January 14, 2025, is a "central hub for leaders to map and track goals, work, teams, and funds," working alongside Jira Align and supporting OKRs. On April 9, 2025 Atlassian packaged Focus, Talent and Jira Align as the Strategy Collection, with work rolling up to "Focus Areas," and gave existing Align customers the collection at no extra cost. That is the strategic portfolio management (SPM) tier: funding and headcount decisions joined to the work, sold to the planning office rather than to teams.

## Projects, Initiatives and Goals

Linear's model separates the layers cleanly. "A project is a grouping of issues that have a clear outcome or planned completion date," with a single lead, one lead team (projects can span several teams) and a target date set at year, half-year, quarter, month or day precision. Initiatives "group projects around company objectives," can have sub-initiatives, and are on all plans; team-level initiatives need Business or Enterprise, and saved initiative views Enterprise.

Atlassian Goals take the OKR shape. A goal "represents the outcomes that multiple projects or streams of work contribute to," can have sub-goals, and links to Jira work items, projects and epics. Its status is On track, At risk or Off track (or Pending, Paused, Completed), and Atlassian maps an OKR score onto it: "0.0-0.3 = Off track," "0.4-0.6 = At risk," "0.7-1.0 = On track," with "typically 2 to 3 Key Results paired with an Objective."

Microsoft went the other way. "Viva Goals will be retired on December 31, 2025," with no new feature development after December 5, 2024, and customers told to export their data by API, Excel or PowerPoint before then. Microsoft Project for the web retired on August 1, 2025, with "most of the Project for the web capabilities" continuing in Microsoft Planner under renamed Planner and Project plans; its published limits had been 3,000 tasks per project, a 10-level task hierarchy, 20 links per task and 150 resources per project. A standalone goals product that sits beside, rather than inside, the work tools has to be fed by hand, and the retirement is a data point about how hard that is to sustain.

My default model has three layers and no more: items roll up to projects (an outcome with a date and an owner), projects to goals or initiatives (an outcome without a date, measured by key results), and goals to sub-goals. Each layer's progress is computed from the one below by a stated rule, and every layer can carry a manually set status that overrides the computed one, with both shown.

## Roadmaps and Timelines

A roadmap is a timeline view over projects or epics. Jira has a timeline per space, with the same 5,000-item display limit as its boards in company-managed spaces; GitHub's roadmap layout "use[s] your custom date and iteration fields to position your issues," zooms by month, quarter or year, and marks iterations, item dates and milestones. Azure's delivery plans are the cross-team version.

The data questions are the same in every product:

- **Which date wins?** An item can have a target date, an iteration, a parent's date and a computed date from its children. Azure's rule ("Target Date always overrides the Iteration end date") is one answer; whatever the rule, it must be stated and consistent between the roadmap and the reports.
- **Rolled-up or entered?** A project's end date can be entered by its lead or derived from its latest child; the roadmap should show which, and flag the gap when the derived date is later than the entered one.
- **Public or internal?** A roadmap shared outside the team is a publication with the same permission-trimming obligations as a dashboard ([Permission-Trimmed Queries](/books/workplace-and-collaboration/queries-views-and-dashboards#permission-trimmed-queries)); a roadmap shared with customers is a commitment, and my rule is that the admin chooses exactly which fields and items it exposes.

## Dependencies Across Teams

Dependencies are where portfolios earn their price. Within one team, a blocked item is a conversation; across teams, it is a scheduling constraint nobody owns. Jira Plans' auto-scheduler balances dates, estimates, capacity, velocity and dependencies, ignores cyclical dependencies, and Atlassian names overbooking as "a common source of unexpectedly overbooked sprints." Azure delivery plans draw predecessor and successor links between teams' items on the shared timeline. GitHub expresses dependencies as blocked-by relations on issues ([Links and Dependencies](/books/workplace-and-collaboration/work-items-and-fields#links-and-dependencies)).

The rules for a builder:

- **Dependencies are links on items**, not lines drawn on a plan. A plan that stores its own dependencies drifts from the items the teams actually work.
- **Cycles must be detected** and shown, not silently ignored: a scheduler that drops a cycle produces a plan nobody can execute.
- **A violated dependency is a state**: if the blocker's date is later than the blocked item's start, the plan should flag it on both items, and notify both owners, because neither team's board will show it.
- **Visibility is two-sided**: the blocked team may not be able to see the blocker's project, and the plan must show that a restricted blocker exists, with its date if the viewer may see that much, without leaking its content.

## Capacity and Resource Management

Capacity planning compares the work assigned to a team or person with the time they have. Jira Plans needs estimates in story points or hours or days, and "your plan needs to use boards as work sources": "work drawn from spaces and filters won't show capacity information." Azure sets capacity per person per sprint in hours or days, accounting for days off ([Estimates and Velocity](/books/workplace-and-collaboration/boards-sprints-and-cycles#estimates-and-velocity)). Linear derives a team's cycle capacity from its last three cycles. Asana and monday.com sell resource management as a separate, top-tier capability.

Two models coexist. **Velocity-based capacity** (Jira Plans, Linear) uses a team's own history in its own unit; it needs no time entry and can't be compared across teams. **Time-based capacity** (Azure, Asana, monday workload) uses hours per person; it can be summed across teams and requires people to keep availability current. Professional services firms live in the second model because hours are what they bill, which is the PSA territory of Law Firms & Professional Services. My default for product teams is velocity-based capacity at the team level, with time-based allocation only for people split across teams, because person-level hour plans for knowledge work tend to be precise and wrong.

Capacity data is also people data. A workload view that shows each person's allocation and overruns is a monitoring surface, and where works councils or employee-monitoring rules apply (Employee Monitoring & Privacy), the customer's admin should be able to restrict person-level views to aggregate ones.

## Status Updates

Portfolio tools collect written updates from owners, because computed progress can't say why something is late. Linear's project and initiative updates carry a health of "On track, At risk, or Off track," with reminders daily, weekly, biweekly or on a custom schedule, follow-ups one and then two working days later, an "Update Missing" flag when an update is overdue by one cycle plus three days, and delivery to Slack or the inbox. Atlassian's Goals and projects remind project owners "weekly on their Friday" and goal owners "on the 1st of each month," sending followers project digests on Mondays and goal notifications on the 8th.

The pattern is a cadence, a health value, free text, and a digest to followers. The builder's rules:

- **Store each update as an immutable record** with the health, the text, the computed progress at that moment and the author. The history of updates is the project's story, and an edited update should be a new version.
- **Show computed and declared health together.** A project declared on track whose computed progress lags is the most useful signal a portfolio can show.
- **Reminders are notifications** with the same schedule and quiet-hours handling as the rest of the product (Notifications, Presence & Attention).

## How to Build It

The chapter adds portfolios and their members, goals with links to the work, status updates for any subject, and capacity allocations. Projects already exist as the `projects` kind table on `containers` ([Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#how-to-build-it)); this chapter adds their planning fields. Dependencies are `work_item_links` with `semantics = 'blocks'`.

```sql
ALTER TABLE projects
  ADD COLUMN lead_member_id   UUID REFERENCES members (id),
  ADD COLUMN lead_team_id     UUID REFERENCES groups (id),
  ADD COLUMN start_on         DATE,
  ADD COLUMN target_on        DATE,
  ADD COLUMN target_precision TEXT CHECK (target_precision IN ('day', 'month', 'quarter',
                                'half_year', 'year'));

CREATE TABLE portfolios (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,
  owner_member_id UUID NOT NULL REFERENCES members (id),
  parent_portfolio_id UUID REFERENCES portfolios (id)
);

CREATE TABLE portfolio_members (           -- projects, boards or saved views in a portfolio
  portfolio_id   UUID NOT NULL REFERENCES portfolios (id),
  source_type    TEXT NOT NULL CHECK (source_type IN ('project', 'board', 'view', 'portfolio')),
  source_id      UUID NOT NULL,
  PRIMARY KEY (portfolio_id, source_type, source_id)
);

CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  parent_goal_id UUID REFERENCES goals (id),
  kind           TEXT NOT NULL DEFAULT 'goal' CHECK (kind IN ('goal', 'objective',
                   'key_result', 'initiative')),
  name           TEXT NOT NULL,
  owner_member_id UUID REFERENCES members (id),
  period         DATERANGE,                -- a quarter, a half, or open
  metric_start   NUMERIC, metric_target NUMERIC, metric_current NUMERIC,   -- key results
  state          TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('pending', 'active',
                   'paused', 'completed', 'archived'))
);

CREATE TABLE goal_links (                  -- what contributes to a goal
  goal_id        UUID NOT NULL REFERENCES goals (id),
  target_type    TEXT NOT NULL CHECK (target_type IN ('project', 'work_item', 'goal')),
  target_id      UUID NOT NULL,
  weight         NUMERIC NOT NULL DEFAULT 1,
  PRIMARY KEY (goal_id, target_type, target_id)
);

CREATE TABLE status_updates (              -- immutable; an edit is a new row
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  subject_type   TEXT NOT NULL CHECK (subject_type IN ('project', 'goal', 'portfolio')),
  subject_id     UUID NOT NULL,
  health         TEXT NOT NULL CHECK (health IN ('on_track', 'at_risk', 'off_track')),
  body           TEXT NOT NULL,
  computed_progress NUMERIC(5,4),          -- snapshot of the rollup when posted
  author_member_id UUID NOT NULL REFERENCES members (id),
  supersedes_id  UUID REFERENCES status_updates (id),
  posted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX status_updates_subject ON status_updates (subject_type, subject_id, posted_at DESC);

CREATE TABLE update_cadences (
  subject_type   TEXT NOT NULL,
  subject_id     UUID NOT NULL,
  rrule          TEXT NOT NULL,            -- 'FREQ=WEEKLY;BYDAY=FR'
  remind_member_id UUID NOT NULL REFERENCES members (id),
  PRIMARY KEY (subject_type, subject_id)
);

CREATE TABLE capacity_allocations (        -- time-based capacity, when used
  member_id      UUID NOT NULL REFERENCES members (id),
  team_id        UUID NOT NULL REFERENCES groups (id),
  period         DATERANGE NOT NULL,
  hours_per_day  NUMERIC(4,2) NOT NULL,
  days_off       DATE[] NOT NULL DEFAULT '{}',
  EXCLUDE USING GIST (member_id WITH =, team_id WITH =, period WITH &&)
);
```

Progress is computed, never stored as truth: a project's progress is the share of its estimate in completed-category items; a goal's is the weighted mean of its links' progress, or its key result's `(current - start) / (target - start)`. The rollup runs over the viewer's visible items, so two people looking at the same goal can see different numbers if one can't see a restricted project; the UI says when items were excluded:

```sql
WITH RECURSIVE tree AS (
  SELECT id FROM goals WHERE id = $1
  UNION ALL
  SELECT g.id FROM goals g JOIN tree t ON g.parent_goal_id = t.id
)
SELECT l.goal_id,
       SUM(l.weight * p.progress) / NULLIF(SUM(l.weight), 0) AS progress,
       COUNT(*) FILTER (WHERE NOT p.visible) AS hidden_contributors
FROM goal_links l
JOIN tree t ON t.id = l.goal_id
JOIN LATERAL project_progress_for_viewer(l.target_type, l.target_id, $viewer) p ON TRUE
GROUP BY l.goal_id;
```

A dependency violation is a query, run when either side's dates change, that writes a flag both owners see:

```sql
SELECT l.id, l.source_item_id AS blocker, l.target_item_id AS blocked
FROM work_item_links l
JOIN work_item_link_types t ON t.id = l.link_type_id AND t.semantics = 'blocks'
JOIN work_items b ON b.item_id = l.source_item_id
JOIN work_items d ON d.item_id = l.target_item_id
WHERE b.due_on > COALESCE(d.custom ->> $start_field, d.due_on::text)::date;
```

## Auditing

- **Goal and key result changes**: targets, periods, owners and manual status overrides, with actors, since a moved target is the change leadership most wants explained.
- **Status updates are their own record**; superseding versions are kept.
- **Plan commits**: when a sandboxed plan's changes are written back to items, one audit event with the plan, the scenario and the items changed.
- **Capacity edits** at person level, with access to person-level capacity views logged where the customer has enabled monitoring controls.

## What This Means for the System You Build

- **Build plans as views over items** teams already maintain, never as copies.
- **Keep three layers** (items, projects, goals) with stated rollup rules, and show computed and declared status side by side.
- **Store dependencies as typed links on items,** detect cycles, and flag violations to both owners.
- **Choose a capacity model on purpose:** velocity per team by default, hours per person where people are shared or billed.
- **Make status updates immutable records** on a cadence, with the computed progress snapshotted.
- **Trim rollups by permission** and say when contributors were hidden.
- **Publish your size limits consistently**; a portfolio view's limits are the first question an enterprise buyer asks.

## References

**Vendor documentation**

- [Atlassian Support: What are plans?](https://support.atlassian.com/jira-software-cloud/docs/what-is-advanced-roadmaps/), sources, Premium and Enterprise availability, sandbox and scenarios
- [Atlassian Support: Limits on plan size](https://support.atlassian.com/jira-software-cloud/docs/limits-on-plan-size-in-advanced-roadmaps/), 10,000 work items, 200 spaces and the 50-team recommendation
- [Atlassian Support: Work item limits in company-managed spaces](https://support.atlassian.com/jira-software-cloud/docs/issue-limits-in-company-managed-projects/), the 30,000-item figure for Premium plans
- [Atlassian Support: Configure the work type hierarchy](https://support.atlassian.com/jira-cloud-administration/docs/configure-the-issue-type-hierarchy/), levels above epic
- [Atlassian Support: Enable capacity planning](https://support.atlassian.com/jira-software-cloud/docs/enable-capacity-planning-in-advanced-roadmaps/), estimates and board-sourced plans
- [Atlassian Support: How the auto-scheduler works](https://support.atlassian.com/jira-software-cloud/docs/how-does-the-auto-scheduler-in-advanced-roadmaps-work/), inputs, cyclical dependencies and overbooking
- [Atlassian Support: What is a goal?](https://support.atlassian.com/platform-experiences/docs/what-is-a-goal/), goals, sub-goals and links to work
- [Atlassian Support: Goal status and OKRs](https://support.atlassian.com/platform-experiences/docs/use-goal-status-to-track-objectives-and-key-results/), statuses, score mapping and key results per objective
- [Atlassian Support: Update reminders for goals and projects](https://support.atlassian.com/platform-experiences/docs/update-reminders-for-goals-and-projects/), reminder and digest schedule
- [Microsoft Learn: Review team delivery plans](https://learn.microsoft.com/en-us/azure/devops/boards/plans/review-team-plans), 20 team backlogs, dependencies, markers, rollups and target-date precedence
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), five portfolio backlog levels
- [Microsoft Learn: Viva Goals retirement](https://learn.microsoft.com/en-us/viva/goals/goals-retirement), December 31, 2025 retirement and export guidance
- [Microsoft Learn: Project for the web service description](https://learn.microsoft.com/en-us/office365/servicedescriptions/project-online-service-description/project-web-service-description), August 1, 2025 retirement, Planner continuation and limits
- [Linear Docs: Projects](https://linear.app/docs/projects), definition, leads, multi-team projects and target date precision
- [Linear Docs: Initiatives](https://linear.app/docs/initiatives), initiatives, sub-initiatives and plan availability
- [Linear Docs: Initiative and project updates](https://linear.app/docs/initiative-and-project-updates), health values, reminders, follow-ups, Update Missing and delivery
- [Linear Changelog: Cycle and graph improvements](https://linear.app/changelog/2022-09-22-cycles-and-graph-improvements), capacity from three previous cycles
- [GitHub Docs: Customizing the roadmap layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout), date fields, zoom and markers
- [Asana: Pricing](https://asana.com/pricing), portfolios, goals and resource management by plan, Advanced price
- [monday.com: Pricing](https://monday.com/pricing), portfolio and resource management on Enterprise

**Announcements**

- [Atlassian: Announcing Focus](https://www.atlassian.com/blog/focus/announcing-focus-atlassians-new-enterprise-strategic-portfolio-management-offering), January 14, 2025, scope and relationship to Jira Align
- [Atlassian: Strategy Collection](https://www.atlassian.com/blog/announcements/strategy-collection), April 9, 2025, Focus, Talent and Jira Align, Focus Areas and Align customer terms
