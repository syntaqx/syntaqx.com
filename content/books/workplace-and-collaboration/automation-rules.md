+++
title = "Automation Rules"
description = "Jira Automation, Asana, monday.com, ClickUp, GitHub Actions and Linear: triggers, conditions and actions, usage quotas by plan, loops, actors and run audit."
category = "Workplace & Collaboration Industry"
order = 2034
part = "Work Management"
tags = ["work-management", "automation", "rules-engines", "quotas", "audit"]
+++

Every work management product ships a rules engine for its customers: when something happens to an item, check some conditions, then do something. Move the parent to Done when the last sub-task closes; assign new bugs by component; comment on the issue when a pull request merges; post to a channel when a priority-one item is created. Customers build thousands of these, most of them by admins and team leads rather than engineers, and they quietly become part of how the company runs.

The hard parts are the ones a product team can't see from a single rule. Rules fire on events that other rules cause, so one careless rule can loop until something stops it. Rules run with someone's authority, so the actor on an automated change matters for permissions and audit. Rules cost compute per run, so every vendor meters them by plan and throttles the heavy users. And rules fail silently, so the run log is the only way a customer learns that the automation they depend on stopped working last Tuesday. The customer's admins own the rules and their consequences; the vendor owns the engine's guarantees, its limits and its loop protection, and should publish all three.

This chapter covers the trigger-condition-action model, smart values and templating, quotas and service limits, loops, the rule actor, and the run log. Workflow post functions, which are rules bound to a single transition, are [Workflows & Status Machines](/books/workplace-and-collaboration/workflows-and-states#conditions-validators-and-post-functions); cross-product automation through Zapier, Power Automate and Slack Workflow Builder is [Integration Platforms & Workflow Builders](/books/workplace-and-collaboration/integration-platforms). The playbook's [Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule) covers storing rules with versions, and [Background Jobs](/docs/architecture/background-jobs#retries-and-dead-letters) the execution machinery.

## How the Platforms Do It

As of October 2026:

| Product | Model | Metered unit and allowance | Loop protection | Actor on changes | Run history |
| --- | --- | --- | --- | --- | --- |
| **Jira and Atlassian Automation** | Flows (formerly rules) of trigger, conditions, branches and actions, with smart values | Steps per month: Jira Free 150 per subscription; Standard 400, Premium 750, Enterprise 1,000 per user; pooled across the org | Flows don't trigger other flows unless "Allow flow trigger" is set; loop detection stops a chain at 10 | "Automation for Jira" by default in Jira; the creator in Confluence | Audit log, 90 days |
| **monday.com** | Automations | Actions per month: Standard 250, Pro 25,000, Enterprise up to 250,000 combined with integrations | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here |
| **ClickUp** | Automations | Actions per workspace per month: Free Forever 100, Core 1,000, Business 10,000, Enterprise and Max 1 million | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here |
| **Asana** | Rules | "Unlimited automations" from Starter | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here |
| **GitHub Actions on issues and projects** | Workflows triggered by `issues`, `issue_comment` and other events; built-in project workflows | Actions minutes by plan (see the Hosting & Cloud volume's [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business)); auto-add workflows: Free 1, Pro and Team 5, Enterprise 20 | Events caused by `GITHUB_TOKEN` don't start new runs | The token's identity, or a GitHub App or personal token | Workflow run logs |
| **Linear** | Built-in automations (Git, sub-issues, triage) | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here | Not covered in the sources cited here |
| **Azure Boards** | Work item rules (conditions and actions) on the process | Up to 1,024 rules per work item type | Rules evaluate on save, not as chained events | Not covered in the sources cited here | Not covered in the sources cited here |

Three patterns run through the table. **Automation is metered by plan**, and the unit moved from rule runs toward finer-grained steps or actions, which prices heavy rules accurately and makes the bill harder to predict. **Rules don't trigger rules by default** in the engines that publish their loop rules: Atlassian makes chaining opt-in and GitHub refuses to start runs from its own token's events. **The actor is a design decision**: a bot identity makes automated changes easy to spot and hard to permission; a person's identity does the reverse.

## Triggers, Conditions and Actions

Atlassian's definitions are the industry's: triggers "listen for events," conditions "narrow the scope of your flow," branches "create a separate execution path" (run the following steps for each sub-task, each linked item, each result of a search), and actions "automate tasks and make changes." The current documentation calls rules "flows" and components "steps," which is the vocabulary its metering now uses.

Triggers fall into four kinds, and an engine needs all of them:

- **Item events**: created, transitioned, field changed, commented, assigned, linked. GitHub's `issues` event alone has types for opened, edited, deleted, transferred, pinned, closed, reopened, assigned, labeled, milestoned, typed and more; `issue_comment` has created, edited and deleted.
- **Schedules**: run daily, or run a search on a schedule and act on each result. Atlassian caps a scheduled search at 999 work items per run.
- **External events**: a pull request merged, a deployment succeeded, a webhook received ([Development Collaboration](/books/workplace-and-collaboration/development-collaboration#linking-work-to-code)).
- **Manual**: a button a person presses on an item, which runs with defined inputs.

Azure Boards' rules show the other model: rules attached to a work item type, evaluated on save rather than on events, each with conditions and actions ("for most rules, you can specify a maximum of two conditions and 10 actions per rule"), always enforced and bypassable only by permission ([Conditions, Validators and Post Functions](/books/workplace-and-collaboration/workflows-and-states#conditions-validators-and-post-functions)). They are field rules (make this required, set that default, copy a value) rather than workflows of side effects, and they don't chain.

The distinction matters to a builder: **save-time rules** are part of the write and can reject it; **event rules** run after the write, asynchronously, and can only make further writes. Mixing them in one engine is how products end up with rules that sometimes block a save and sometimes don't.

## Smart Values and Templating

An action that sets a field or writes a comment needs values from the triggering event. Atlassian's smart values use "dot notation inside double mustache brackets," such as `{{issue.summary}}` and `{{issue.assignee.displayName}}`, with functions (`{{now.plusDays(5)}}`, `.toLowerCase()`), list iteration (`{{#issue.comments}}...{{/}}`) and defaults (`{{x|"Hello world"}}`). 

Templating is where automation meets permissions. A rule that writes `{{issue.description}}` into a public comment, a chat message or an outbound webhook copies content to an audience the original item may not have had. The engine should evaluate templates as the rule's actor, and admins should be able to see which rules send item content outside the product.

## Quotas, Limits and Pricing

Automation is compute the customer triggers, and every vendor meters it. Atlassian's model as of October 2026 counts **steps**: each trigger run, each executed condition (including ones that evaluate false), each action, each branch and each loop iteration. Monthly allowances are per plan and app:

| App | Free (per subscription) | Standard (per user) | Premium (per user) | Enterprise (per user) |
| --- | --- | --- | --- | --- |
| Jira | 150 | 400 | 750 | 1,000 |
| Confluence | 50 | 100 | 250 | 500 |
| Jira Service Management | 1,250 | 3,000 | 6,500 | 9,500 |
| Jira Product Discovery | 100 | 300 | 500 | 750 |
| Teamwork Collection | 200 | 2,500 | 5,000 | 7,500 |

Allowances pool at the organization level and refresh monthly. System steps such as logging, creating variables and lookups don't count, nor do aborted or throttled runs, Atlassian system errors, or Rovo agent steps (billed as Rovo credits). Usage beyond the allowance costs $0.50 per 1,000 steps, with extra usage billing taking effect December 3, 2026; admins are notified at 80 and 100 percent, and with extra usage disabled, flows stop at 100 percent. The older model, still described in Atlassian's knowledge base, capped "the total number of successful rule runs" per month.

Other vendors meter **actions**: monday.com allows 250 automation actions a month on Standard and 25,000 on Pro (with separate equal allowances for integration actions), and "up to 250,000 automation and integration actions per month" combined on Enterprise; ClickUp allows 100 automation actions per workspace per month on Free Forever, 1,000 on Core, 10,000 on Business and 1 million on Enterprise and Max. Asana advertises "Unlimited automations" from its Starter plan.

Beside the monthly quota sit **service limits**, which protect the shared engine from one tenant. Atlassian publishes them: daily processing time of "60 min per 12 hrs," 50,000 items queued globally, 65 steps in a standard flow and 500 in an advanced one, 5,000 associated items per flow, 999 items from a scheduled search, the first 100 results from a lookup, and concurrent flows of 5, 10, 20 and 30 by plan. Breaching a service limit marks the run "THROTTLED in the audit log" and may disable the rule; breaching the queued-items limit disables it.

The two kinds of limit serve different purposes, and a builder needs both. **Quotas** are commercial: they price automation and push heavy users up a tier. **Service limits** are operational: they keep one tenant's runaway rule from delaying everyone's. The metering hosting platforms use is the same machinery ([Metering and Rating](/books/hosting-and-cloud/metering-and-rating#how-the-providers-do-it)); the work management twist is that the customer's admin needs to see, per rule, what it consumed, because the bill is the sum of rules someone else wrote.

## Loops and Runaway Rules

A rule that reacts to field changes and changes a field can trigger itself; two rules can trigger each other. Every engine needs a defense, and the public ones layer three:

1. **No chaining by default.** "By default, automation rules won't be triggered by other automation rules"; an author opts in with "Allow flow trigger" (formerly "Allow rule trigger"). GitHub's version is structural: "events triggered by the GITHUB_TOKEN will not create a new workflow run," except `workflow_dispatch` and `repository_dispatch`, and "this behavior prevents you from accidentally creating recursive workflow runs." A workflow that needs to trigger another uses a GitHub App or personal token, deliberately.
2. **Loop detection.** Atlassian stops a chain when a flow triggers itself or others "in quick succession" more than 10 times and marks the run as LOOP.
3. **Budgets.** Processing-time and queue limits stop the rule that loops slowly enough to evade detection.

The builder's version:

- **Carry a causation chain on every event**: the run ID that caused a write is stamped on the resulting event, and a run triggered by an event whose chain already contains the same rule is refused or counted.
- **Make chaining explicit per rule**, off by default, as Atlassian does.
- **Cap depth and fan-out**: a chain depth limit, a per-run cap on items touched (Atlassian's 5,000 associated items), and a per-rule rate limit.
- **Disable, don't delete**, a rule that trips a limit, notify its owner and the admins, and show the reason on the rule.

## The Rule Actor

Every automated change needs an author. In Jira, "the default flow actor is the 'user' called Automation for Jira," and "changes performed by your flow will be seen as being made by the flow actor"; in Confluence the actor is "the person who created the flow." GitHub workflows act as the `GITHUB_TOKEN`, scoped to the repository (it "cannot access projects," so project automation uses a GitHub App or a personal token). 

The choices trade off:

- **A bot actor** makes automated changes visible in history and notifications, keeps working when the author leaves, and needs its own permissions, which tend to grow until the bot can do anything.
- **The author as actor** limits the rule to what its author can do and attributes changes to a person who didn't make them; the rule breaks when the author is deactivated.
- **The triggering user as actor** makes the rule an extension of the user's action and is right for save-time rules, wrong for scheduled ones.

My default is a per-rule service identity (a `members` row of kind `bot` scoped to the rule's projects), with the rule's owner recorded separately, so history shows "Automation (rule: Auto-assign bugs, owner: …)." Permissions for the identity are the intersection of what the rule needs and what its owner may grant, checked when the rule is saved and again when the owner's access changes. Offboarding lists the rules a departing member owns ([Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim#content-ownership-on-the-way-out)), and every automated audit event names the rule and its version ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## Run History

A rule nobody can debug is a rule nobody trusts. Atlassian's automation audit log keeps "activity from the past 90 days," after which "older entries are automatically deleted and can't be recovered," and statuses like THROTTLED and LOOP appear there. The minimum run record:

- the rule and its version, the trigger event and its causation chain;
- each step with its outcome (passed, failed condition, action result, error), and the items it touched;
- usage consumed, duration, and the final status (success, no actions performed, some errors, throttled, loop, disabled);
- the actor used.

Two retention periods apply: run logs for debugging (days to months) and the audit events for the writes themselves, which follow the workspace's audit retention ([Audit Logs](/books/workplace-and-collaboration/audit-logs)). The writes are business records; the logs are diagnostics.

## How to Build It

The chapter adds rules with versions, runs and their steps, monthly usage counters, and the causation chain. Rules reference a bot `members` row as their actor and are owned by a person.

```sql
CREATE TABLE automation_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  scope_container_ids UUID[],              -- null: workspace-wide (admin only)
  name           TEXT NOT NULL,
  owner_member_id UUID NOT NULL REFERENCES members (id),
  actor_member_id UUID NOT NULL REFERENCES members (id),   -- kind = 'bot'
  allow_rule_triggers BOOLEAN NOT NULL DEFAULT FALSE,
  state          TEXT NOT NULL DEFAULT 'enabled' CHECK (state IN ('enabled', 'disabled',
                   'auto_disabled')),
  disabled_reason TEXT,
  current_version INT NOT NULL DEFAULT 1
);

CREATE TABLE automation_rule_versions (
  rule_id        UUID NOT NULL REFERENCES automation_rules (id),
  version        INT NOT NULL,
  trigger        JSONB NOT NULL,           -- {type:'item.transitioned', to_category:'completed'}
  steps          JSONB NOT NULL,           -- ordered conditions, branches and actions
  saved_by       UUID NOT NULL REFERENCES members (id),
  saved_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rule_id, version),
  CHECK (jsonb_array_length(steps) <= 500)
);

CREATE TABLE automation_runs (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_id        UUID NOT NULL REFERENCES automation_rules (id),
  rule_version   INT NOT NULL,
  trigger_event_id UUID,                   -- the domain event that started it
  causation      UUID[] NOT NULL DEFAULT '{}',   -- run ids upstream of this one
  status         TEXT NOT NULL CHECK (status IN ('queued', 'running', 'success',
                   'no_actions', 'partial', 'failed', 'throttled', 'loop')),
  steps_used     INT NOT NULL DEFAULT 0,
  items_touched  INT NOT NULL DEFAULT 0,
  started_at     TIMESTAMPTZ,
  finished_at    TIMESTAMPTZ,
  CHECK (cardinality(causation) <= 10)
);
CREATE INDEX automation_runs_rule ON automation_runs (rule_id, started_at DESC);

CREATE TABLE automation_run_steps (       -- diagnostics; short retention
  run_id         UUID NOT NULL REFERENCES automation_runs (id),
  position       INT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('condition', 'branch', 'action')),
  outcome        TEXT NOT NULL,            -- 'passed', 'failed', 'ok', 'error'
  item_id        UUID,
  detail         JSONB,
  PRIMARY KEY (run_id, position)
);

CREATE TABLE automation_usage (           -- quota counters per org per month
  organization_id UUID NOT NULL REFERENCES organizations (id),
  month          DATE NOT NULL,
  app            TEXT NOT NULL,
  steps          BIGINT NOT NULL DEFAULT 0,
  allowance      BIGINT NOT NULL,
  PRIMARY KEY (organization_id, month, app)
);
```

Writes made by a run carry the run ID, so the events they emit can carry the chain. The dispatcher refuses a run that would close a loop or exceed the chain depth, before it costs anything:

```sql
-- incoming event was caused by run $caused_by_run (null for a human write)
SELECT r.id
FROM automation_rules r
JOIN automation_rule_versions v ON v.rule_id = r.id AND v.version = r.current_version
LEFT JOIN automation_runs up ON up.id = $caused_by_run
WHERE r.workspace_id = $1
  AND r.state = 'enabled'
  AND v.trigger @> $event_match
  AND ($caused_by_run IS NULL OR r.allow_rule_triggers)          -- no chaining by default
  AND ($caused_by_run IS NULL OR NOT (r.id = up.rule_id
       OR r.id IN (SELECT rule_id FROM automation_runs WHERE id = ANY (up.causation))))
  AND ($caused_by_run IS NULL OR cardinality(up.causation) < 10);
```

Usage is incremented with the run's final step count when it finishes; at 80 and 100 percent the org's admins are notified, and at 100 percent new runs queue as throttled unless extra usage is enabled. Throttled and aborted runs don't count against the quota, matching the published rule that customers aren't billed for the vendor's protections.

## Auditing

- **Rule changes**: create, edit (as a new version with the diff), enable, disable, owner and actor changes, in `audit_events`.
- **Automated writes** name the rule, its version and the run as the actor, typed as automation, never as the owner.
- **Auto-disables** with the limit that tripped, so an admin can answer "why did this stop."
- **Rules that send content outside** (outbound webhooks, chat posts, emails) are listed for admins, with their destinations.
- **Usage and quota events** (80 and 100 percent, extra usage enabled), since they become invoice lines.

## What This Means for the System You Build

- **Separate save-time rules from event rules**; one can reject a write, the other can only make more.
- **Meter by a unit customers can see per rule,** and publish both quotas and service limits.
- **Make chaining opt-in,** carry a causation chain, and cap depth, fan-out and runtime.
- **Give each rule a scoped bot identity** with a human owner, and re-check its permissions when the owner changes.
- **Disable, don't delete,** rules that trip limits, and tell the owner why.
- **Keep a run log** with steps and outcomes, separate from the audit events of the writes.
- **Don't bill customers for your own protections**: throttled and aborted runs shouldn't count.

## References

**Vendor documentation**

- [Atlassian Support: What are automation flows?](https://support.atlassian.com/cloud-automation/docs/what-are-automation-rules/), triggers, conditions, branches and actions
- [Atlassian Support: What are smart values?](https://support.atlassian.com/cloud-automation/docs/what-are-smart-values/), syntax, functions, lists and defaults
- [Atlassian Support: How is my usage calculated?](https://support.atlassian.com/cloud-automation/docs/how-is-my-usage-calculated/), steps, allowances by app and plan, pooling, exclusions, overage price, December 3, 2026 billing date and notifications
- [Atlassian Support: Automation service limits](https://support.atlassian.com/cloud-automation/docs/automation-service-limits/), processing time, queue, loop detection, step, item, search and concurrency limits
- [Atlassian Support: Service limits vs usage limits](https://support.atlassian.com/automation/kb/difference-between-automation-service-limits-and-automation-usage-limits/), the older rule-run cap, throttling and disabling
- [Atlassian Support: Rules not triggered by other rules](https://support.atlassian.com/automation/kb/rules-dont-get-triggered-if-the-trigger-came-from-another-rule/), no chaining by default and the Allow rule trigger setting
- [Atlassian Support: Flow details](https://support.atlassian.com/cloud-automation/docs/what-are-rule-details-in-atlassian-automation/), Allow flow trigger and changes made as the flow actor
- [Atlassian Support: What is a flow actor?](https://support.atlassian.com/cloud-automation/docs/what-is-a-rule-actor/), Automation for Jira and the Confluence creator
- [Atlassian Support: Automation audit log](https://support.atlassian.com/cloud-automation/docs/what-is-the-automation-audit-log/), 90-day retention
- [GitHub Docs: GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token), events from the token don't create workflow runs and the dispatch exceptions
- [GitHub Docs: Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), issues and issue_comment activity types
- [GitHub Docs: Automating Projects using Actions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions), the token can't access projects; GitHub Apps and personal tokens
- [GitHub Docs: Using the built-in automations](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations), default workflows
- [GitHub Docs: Adding items automatically](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically), auto-add workflow counts by plan
- [Linear Docs: GitHub integration](https://linear.app/docs/github), Git automations on pull request events
- [Linear Docs: Parent and sub-issues](https://linear.app/docs/parent-and-sub-issues), sub-issue automations
- [Microsoft Learn: Rules reference](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/rule-reference), conditions and actions per rule, enforcement and bypass
- [Microsoft Learn: Work tracking, process, and project limits](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/object-limits), rules per work item type
- [monday.com: Pricing](https://monday.com/pricing), automation and integration actions by plan
- [ClickUp: Pricing](https://clickup.com/pricing), automation actions per workspace per month by plan
- [Asana: Pricing](https://asana.com/pricing), unlimited automations from Starter
