+++
title = "Workflows & Status Machines"
description = "Statuses, transitions, conditions, validators and post functions, resolutions, state categories, shared schemes vs team-owned workflows, and workflows as data."
category = "Workplace & Collaboration Industry"
order = 2030
part = "Work Management"
tags = ["work-management", "workflows", "state-machines", "jira", "azure-boards"]
+++

A work item's status is the one field everyone reads: the board column it sits in, the filter that finds it, the number on the report. A workflow is the machine behind that field: the set of statuses an item can be in, the transitions between them, and the rules about who may move it, what must be true first and what happens after. In Atlassian's words, a Jira workflow "is a set of statuses and transitions that a work item moves through."

The difficulty is that the workflow is shared configuration with local meanings. A status called "Done" has to mean done to the board, the sprint report, the velocity chart, the automation that notifies the customer and the portfolio rollup three levels up, even when one team's "Done" means merged and another's means shipped. The products handle this by separating the status a team sees from a small fixed set of categories the product understands, and they differ in how much of the rest a customer may define. The customer's admins own the machine: which statuses exist, who may transition, which rules gate a move. The vendor owns the categories and the guarantees that reports depend on.

This chapter covers statuses and categories, transitions and their rules, resolutions, shared versus team-owned workflows, and how to store a workflow as data. Items themselves are [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields); how statuses become board columns is [Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#columns-are-mapped-statuses); rules that run on transitions without a human are [Automation Rules](/books/workplace-and-collaboration/automation-rules). The general case for configuration as data, with versions and a record of which rule decided, is the playbook's [Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule).

## How the Platforms Do It

As of October 2026:

| Product | Who defines the workflow | Statuses | Transitions | Rules on a transition | Terminal handling |
| --- | --- | --- | --- | --- | --- |
| **Jira (company-managed)** | Jira admins; shared across spaces through workflow schemes | Admin-defined | Explicit and one-way; loops and global transitions allowed | Conditions, validators, post functions, triggers, properties | Resolution field (Done, Won't do, Duplicate) |
| **Jira (team-managed)** | The space's own admins | Per space | Per space | Space-level (not detailed in the sources cited here) | Resolution field |
| **Azure Boards** | Process editors, for every project on the process | 2 to 4 inherited, up to 32 per work item type, each in a state category | Bidirectional between all states by default; restricted by rules | Work item rules (conditions and actions), enforced on every write | One Completed state per type; Removed category hides items |
| **Linear** | Each team, from a default; sub-teams can inherit | Ordered statuses per team | Any status to any status | Automations (Git, sub-issue, triage) rather than gates | Completed and canceled statuses |
| **GitHub Issues** | Fixed | Open and closed, with a close reason | Open or close | None in the issue; rules live in Projects and Actions | Closed as completed or not planned |

Three patterns run through the table. **Categories are the contract:** every product that lets customers invent statuses maps each one to a small fixed category the product's reports understand. **Gates or no gates:** Jira and Azure Boards put rules on transitions, Linear and GitHub mostly don't, and that one choice decides whether the workflow is a compliance tool or a coordination tool. **Sharing is the admin's trade-off:** a workflow shared across fifty projects keeps reporting consistent and makes every change a negotiation; a team-owned workflow is fast to change and hard to roll up.

## Statuses and Categories

A status is what a team calls a step: "In Review," "Waiting for Customer," "Ready for QA." A category is what the product understands about it. Azure Boards states the model most explicitly: teams map workflow states to "Proposed, In Progress, Resolved, and Completed," with a Removed category that hides items from backlogs and boards. The categories drive behavior:

- **Proposed** states appear on the backlog and in the first board column, and the first Proposed state "automatically becomes the default for new work items."
- **In Progress** states map to middle columns; moving into this category sets Activated By and Activated Date.
- **Resolved** states mean "a solution is implemented but not yet verified"; moving in sets Resolved By and Resolved Date, and moving backward clears them.
- **Completed** states leave the backlog and map to the final column, and "each work item type can have only one state mapped to this category."

Azure's process rules also bound the shape: at least two states, at least one in Proposed or In Progress, at most 32 per work item type. Inherited states can be hidden but not renamed or recategorized, custom state names can't change once defined, and hiding a state leaves items in it "invalid but retain their state value," so they must be moved before they can be edited again.

Jira's boards make the same decision by column: on a board, only the right-most column counts as complete, and work items "are considered as complete once they have been moved to the last column on the board" when a sprint closes ([Boards, Sprints & Cycles](/books/workplace-and-collaboration/boards-sprints-and-cycles#sprints)).

Linear's model is a workflow per team, "a group of ordered issue statuses defined per-team," created from a default and customizable in team settings; sub-teams can inherit a parent team's workflow. Every status carries a type the product defines: Linear's API schema lists them as triage, backlog, unstarted, started, completed and canceled, plus a duplicate type for issues closed as duplicates. The type, not the status name, is what lets cycles, project graphs and Insights read every team's workflow the same way.

The categories are why a system can let customers name anything. My rule is that the product never branches on a status name, only on a category, and that every report, automation trigger and integration defines "done" by category. A customer who renames "Done" to "Shipped" then breaks nothing.

## Transitions

A transition is a permitted move from one status to another. The products split on whether transitions are explicit.

**Jira makes them explicit and directional.** "Transitions are one-way. To move a work item back and forth, you need two separate transitions," and "for a work item to move between two statuses, a transition must exist." Transitions can loop, leaving the status unchanged (useful for a "Comment" or "Escalate" action with its own screen and rules). A global transition lets any status move to one destination, set by enabling "Allow all statuses to transition to this one."

**Azure Boards creates them all.** Adding a state automatically creates "bidirectional transitions to and from all existing states," with generated reasons ("Moved to state Triaged"). Restriction comes from rules, not from missing edges.

**Linear and GitHub don't model transitions at all**: any status can move to any other, and the product's opinions live in automation.

The explicit-edge model fits processes where the path matters (a change can't go from "Draft" to "Implemented" without passing "Approved"); the any-to-any model fits teams that want the board to reflect reality and fix mistakes by dragging a card back. A product serving both needs both: any-to-any by default, with the ability to remove edges and attach rules where an admin needs a gate. That is the shape Azure arrived at, and it's my default.

## Conditions, Validators and Post Functions

Jira's advanced workflow configuration names the three kinds of transition rule every gated workflow needs:

- **Conditions** decide whether a user may run a transition at all. If a condition fails, "the user will not see the transition button," and conditions can be combined with All or Any logic. They can't check what the user is about to enter: "Conditions cannot validate input parameters gathered from the user on the transition's screen."
- **Validators** check the input on the transition's screen before it runs. If one fails, the item doesn't move and the transition's post functions don't run.
- **Post functions** run after the transition: update fields, add comments, fire events, call webhooks. Some are essential and fixed (setting the status, storing the item, reindexing, firing the event), and Atlassian's instruction is "Do not edit or remove this post function"; custom ones go between them. Several have documented edge cases, such as Update Work Item Field not updating custom fields, and Store Work Item creating no change history.

Jira adds **triggers**, which move items when something happens in a connected development tool (creating a branch moves an item to "In progress"), and **properties**, key-value settings on a transition that can't be edited in place.

**Azure Boards rules** cover the same ground with a different grammar: each rule is conditions plus actions, "for most rules, you can specify a maximum of two conditions and 10 actions per rule," state-transition rules take one condition, and "rules are always enforced," through the API and Excel as well as the UI, unless a user holds the "Bypass rules on work item updates" permission or a REST caller passes `bypassRules=true`. All of a project's rules compile into one SQL validation expression, and too many conditional rules make it too complex to evaluate ([Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#custom-fields)).

Four design rules come from the two products:

- **Enforce on every write path.** A rule the UI checks and the API skips is a suggestion. Azure's "always enforced" is the right default, and the bypass is a named permission, not a missing check.
- **Keep the order fixed:** condition, then validator, then the state change, then post functions. A post function that fails after the status changed must not leave the item half-moved; it either runs in the same transaction or is an at-least-once job with its own retries ([Background Jobs](/docs/architecture/background-jobs#retries-and-dead-letters)).
- **Separate gates from side effects.** Conditions and validators belong in the workflow; notifications, field copies and webhooks increasingly belong in automation, where they have their own audit, limits and loop protection ([Automation Rules](/books/workplace-and-collaboration/automation-rules#loops-and-runaway-rules)).
- **Record which rule decided.** A rejected transition should say which condition or validator failed, and a bypass should be logged with its actor ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Resolutions

A status says where an item is; a resolution says how it ended. Jira keeps them apart: a work item counts as resolved when "the work item's Resolution field is filled in," with defaults including Done ("Work has been completed on this work item"), Won't do ("This work item won't be actioned") and Duplicate, and references to a resolved item "show the key in strikethrough text." GitHub folds the same idea into its close action: an issue is closed "when bugs are fixed, feedback is acted on, or to show that work is not planned," with the reason chosen from the close menu. Azure attaches a Reason to each state transition, from defaults the inherited process supplies.

The separation matters for reporting. "Closed" items include work that was finished, abandoned and duplicated; a throughput chart that counts all of them flatters the team, and a cycle-time chart that includes "Won't do" items measures how fast the team says no. My rule is that a terminal status always carries a resolution, that the resolution is cleared when an item is reopened (an item reopened with "Done" still set reads as resolved to every filter and report), and that flow metrics count only the resolutions that mean delivered ([Flow Metrics and Their Misuse](/books/workplace-and-collaboration/boards-sprints-and-cycles#flow-metrics-and-their-misuse)).

## Team-Managed and Company-Managed

The deepest workflow decision is who may change it. Jira offers both answers. Company-managed spaces are "set up and maintained by Jira admins," who "configure screens and schemes that spaces are based on," and a scheme change affects "every company-managed space that uses that configuration"; the payoff is "the ability to standardize workflows across spaces." Team-managed spaces are "set up and maintained by anyone on the team," self-contained, with their own workflow. A **workflow scheme** is the mapping: "Workflows can be associated with particular spaces and, if you like, specific work types by using a workflow scheme." Once a workflow is active (used by one or more spaces), its name can't be edited, though it can be copied; an inactive workflow can be edited freely.

Azure makes the shared model the only model: workflow changes are made in the process by users with process-edit permissions, and "when you customize an inherited process, any projects that use the process automatically reflect the customizations." Microsoft's guidance is to test changes in a separate process and project first. Teams get local freedom through board columns, which team administrators can add without changing states: "State: Project-level workflow logic shared across teams. Column: Team-level board visualization."

Linear chooses the team: each team owns its workflow, with inheritance for sub-teams.

The trade-off is the inversion at small scale. An org admin who standardizes gets consistent portfolio reporting and one place to put a compliance gate; a team that owns its workflow moves faster and drifts. A system that serves enterprises needs both modes and a migration between them, because customers start team-managed and are asked to standardize when the first portfolio report goes to the board of directors.

### Changing a Live Workflow

A shared workflow change touches every item in every project on it. The products guard it in three ways that a builder should copy:

- **Separate the live workflow from the edit.** Jira restricts what can change on an active workflow (its name can't, and copying is the escape hatch) while inactive ones can be edited freely; Azure recommends testing in a separate process and project. A builder's version of both is a draft that is published as a new version.
- **Map orphans before removing a status.** Azure leaves items in a hidden state invalid until moved, and tells admins to query and bulk-update them first.
- **Keep history meaningful.** An item's status history must still render when a status has been renamed or removed, so history stores status IDs and the status row is never hard-deleted.

## Workflows as Data

A workflow is a graph with attached rules, and storing it as data rather than code buys versioning, diffing, per-tenant variation and the ability to answer "what rules applied when this item moved last March." The playbook's [Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions) covers the general case. The work management specifics:

- **Version the whole workflow**, not individual edges, and stamp each status change with the version in force. A transition's validity is a property of the version, and an auditor's question is always about a point in time.
- **Statuses are workspace objects; workflows reference them.** Two workflows sharing "In Review" lets cross-project boards and queries treat it as one status.
- **The category lives on the status**, so reports never need the workflow to interpret history.
- **Rules are typed, ordered and named** (condition, validator, post function), with parameters as JSON validated against a schema per rule type, so the UI can render them and the engine can refuse an unknown one.
- **Transitions are commands.** The API exposes "transition item X via transition T with these field values," not "set status to S," when the workflow has gates, because a raw status write can't carry a validator's input or name the transition whose rules applied.

## How to Build It

The chapter adds statuses, workflows with versions, transitions with rules, the scheme that assigns workflows to projects and types, and status history. `work_items.status_id` from [Work Items, Hierarchies & Fields](/books/workplace-and-collaboration/work-items-and-fields#how-to-build-it) references `work_item_statuses`.

```sql
CREATE TABLE work_item_statuses (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('triage', 'proposed', 'in_progress',
                   'resolved', 'completed', 'canceled')),
  color          TEXT,
  archived_at    TIMESTAMPTZ,              -- never deleted: history references it
  UNIQUE (workspace_id, name)
);

ALTER TABLE work_items
  ADD CONSTRAINT work_items_status_fk FOREIGN KEY (status_id) REFERENCES work_item_statuses (id),
  ADD COLUMN resolution TEXT,              -- null while unresolved
  ADD COLUMN resolved_at TIMESTAMPTZ,
  ADD COLUMN workflow_version_id UUID;     -- the version the item is moving under

CREATE TABLE work_item_workflows (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  name           TEXT NOT NULL,
  owner_container_id UUID REFERENCES containers (id),  -- set: team-managed, owned by one project
  UNIQUE (workspace_id, name)
);

CREATE TABLE work_item_workflow_versions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workflow_id    UUID NOT NULL REFERENCES work_item_workflows (id),
  version        INT NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('draft', 'published', 'superseded')),
  initial_status_id UUID NOT NULL REFERENCES work_item_statuses (id),
  any_to_any     BOOLEAN NOT NULL DEFAULT TRUE,   -- false: only listed transitions
  published_by   UUID REFERENCES members (id),
  published_at   TIMESTAMPTZ,
  UNIQUE (workflow_id, version)
);
CREATE UNIQUE INDEX one_published_version ON work_item_workflow_versions (workflow_id)
  WHERE state = 'published';

CREATE TABLE work_item_workflow_statuses (  -- which statuses a version uses, in order
  workflow_version_id UUID NOT NULL REFERENCES work_item_workflow_versions (id),
  status_id      UUID NOT NULL REFERENCES work_item_statuses (id),
  position       SMALLINT NOT NULL,
  PRIMARY KEY (workflow_version_id, status_id)
);

CREATE TABLE work_item_transitions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workflow_version_id UUID NOT NULL REFERENCES work_item_workflow_versions (id),
  name           TEXT NOT NULL,            -- 'Start progress', 'Approve'
  from_status_id UUID REFERENCES work_item_statuses (id),  -- null: global transition
  to_status_id   UUID NOT NULL REFERENCES work_item_statuses (id),
  screen         JSONB NOT NULL DEFAULT '[]',   -- field ids collected on the transition
  sets_resolution TEXT,
  clears_resolution BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE work_item_transition_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  transition_id  UUID NOT NULL REFERENCES work_item_transitions (id),
  phase          TEXT NOT NULL CHECK (phase IN ('condition', 'validator', 'post_function')),
  position       SMALLINT NOT NULL,
  rule_type      TEXT NOT NULL,            -- 'in_group', 'field_required', 'set_field', 'webhook'
  params         JSONB NOT NULL DEFAULT '{}',
  combinator     TEXT NOT NULL DEFAULT 'all' CHECK (combinator IN ('all', 'any')),
  UNIQUE (transition_id, phase, position)
);

CREATE TABLE work_item_workflow_schemes (   -- which workflow a project and type use
  container_id   UUID NOT NULL REFERENCES containers (id),
  type_id        UUID REFERENCES work_item_types (id),   -- null: the project's default
  workflow_id    UUID NOT NULL REFERENCES work_item_workflows (id),
  UNIQUE NULLS NOT DISTINCT (container_id, type_id)
);

CREATE TABLE work_item_status_changes (    -- append-only; feeds flow metrics and audit
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id        UUID NOT NULL REFERENCES work_items (item_id),
  from_status_id UUID REFERENCES work_item_statuses (id),
  to_status_id   UUID NOT NULL REFERENCES work_item_statuses (id),
  from_category  TEXT,
  to_category    TEXT NOT NULL,            -- copied, so history survives recategorization
  transition_id  UUID REFERENCES work_item_transitions (id),
  workflow_version_id UUID NOT NULL REFERENCES work_item_workflow_versions (id),
  actor          TEXT NOT NULL,            -- 'member:<id>', 'automation:<rule id>', 'integration:<app id>'
  bypassed_rules BOOLEAN NOT NULL DEFAULT FALSE,
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX status_changes_item ON work_item_status_changes (item_id, changed_at);
```

A transition is one transaction: lock the item, check that the transition exists in the item's version (or that the version is any-to-any), evaluate conditions against the actor and validators against the submitted fields, update the status and resolution, insert the status change, write the `item_versions` row, and enqueue post functions through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). Publishing a new version does not rewrite items in flight; each item moves to the new version on its next transition, after an orphan-mapping step has moved any item whose status the new version drops.

Cycle time per item falls out of the history table:

```sql
SELECT item_id,
       MIN(changed_at) FILTER (WHERE to_category = 'in_progress') AS started_at,
       MAX(changed_at) FILTER (WHERE to_category = 'completed')   AS finished_at
FROM work_item_status_changes
WHERE item_id = ANY ($1)
GROUP BY item_id;
```

## Auditing

- **Every workflow publish** as an admin event: the version diff (statuses, transitions, rules), the actor, and the projects and item counts affected.
- **Every scheme change**, because moving a project to a different workflow changes which gates its items pass.
- **Every bypass**: a transition with `bypassed_rules`, the permission that allowed it and the actor, as Azure's bypass permission implies.
- **Rejected transitions** in a short-retention log, with the failing rule, which answers "why can't I close this" without a support ticket.
- **Who moved it, typed:** member, automation, integration or agent, never "system" ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).

## What This Means for the System You Build

- **Branch on categories, never on status names,** and let customers name statuses freely.
- **Default to any-to-any transitions** and let admins remove edges and add gates where a process needs them.
- **Enforce transition rules on every write path,** with bypass as a named, logged permission.
- **Keep resolution separate from status,** clear it on reopen, and count only delivered resolutions in flow metrics.
- **Version workflows as data,** draft and publish, map orphans before removing statuses, and stamp each change with the version in force.
- **Offer shared and team-owned workflows** and a path from one to the other.
- **Expose transitions as commands** in the API, so gated workflows can carry their inputs.

## References

**Vendor documentation**

- [Atlassian Support: Work with workflows](https://support.atlassian.com/jira-cloud-administration/docs/work-with-issue-workflows/), definition, one-way and looping transitions, workflow schemes, active workflows and editing permissions
- [Atlassian Support: Configure advanced workflows](https://support.atlassian.com/jira-cloud-administration/docs/configure-advanced-issue-workflows/), conditions, validators, post functions, essential post functions, triggers, properties and global transitions
- [Atlassian Support: Statuses, priorities and resolutions](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/), resolution defaults and the resolved definition
- [Atlassian Support: Team-managed and company-managed spaces](https://support.atlassian.com/jira-software-cloud/docs/what-are-team-managed-and-company-managed-projects/), who configures each and the effect of shared schemes
- [Atlassian Support: Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/), only the right-most column counts as complete
- [Atlassian Support: Complete a sprint](https://support.atlassian.com/jira-software-cloud/docs/complete-a-sprint/), completeness by last board column
- [Microsoft Learn: Workflow and state categories](https://learn.microsoft.com/en-us/azure/devops/boards/work-items/workflow-and-state-categories), categories and their behavior, the single Completed state, Activated and Resolved fields, states versus columns
- [Microsoft Learn: Customize the workflow of an inherited process](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/customize-process-workflow), state rules and limits, automatic bidirectional transitions, hidden and removed states, process-wide effect
- [Microsoft Learn: Rules reference](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/rule-reference), conditions and actions per rule, enforcement on every path and the bypass permission
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), 32 states per type and the per-project validation expression
- [Linear Docs: Conceptual model](https://linear.app/docs/conceptual-model), per-team ordered workflows, sub-team inheritance and triage
- [Linear SDK: GraphQL schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql), the `WorkflowState` type and its state types (triage, backlog, unstarted, started, completed, canceled, duplicate)
- [GitHub Docs: Closing an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue), closing as completed or not planned
