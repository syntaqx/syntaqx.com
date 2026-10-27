+++
title = "Defects & Triage"
description = "A good bug report, severity and priority as separate axes, triage that keeps the backlog honest, a regression test for every fix, and escaped-defect reviews."
category = "Quality"
order = 1058
tags = ["quality", "bugs", "triage", "process"]
+++

Every system ships bugs. What separates a healthy team from a struggling one isn't the count, it's what happens next: whether a bug arrives with enough to act on, gets a decision quickly, is fixed with a test that keeps it fixed, and teaches something about why it got through. A backlog of a thousand untriaged tickets is the opposite of all four.

## The Bug Report

A report exists so someone who wasn't there can see the bug for themselves. The engineer who can reproduce it in five minutes fixes it today; the one who can't sends it back with a question and moves on. [Mozilla's bug writing guidelines](https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html) are the long-standing reference, and the essentials carry over to any tracker:

- **A title that names the symptom.** "Refund button returns 500 for partially captured payments," not "Refunds broken" and not "Fix null check in RefundService." The title is how duplicates get found, so it describes what a user sees, not the cause someone guesses at.
- **Steps to reproduce,** numbered, starting from a known state, precise enough to follow on another machine. This is the part that matters most.
- **Expected and actual,** as separate lines. A lot of "bugs" turn out to be a disagreement about what should happen, and this is where it shows.
- **Environment and version:** build or commit, environment, browser or app version, OS, account or tenant (an ID, never personal data), feature flags in effect.
- **Evidence:** a screenshot or recording, the [request ID](/docs/operations/observability#request-ids) and timestamp, the log line or stack trace. One request ID beats a paragraph of description.
- **Frequency:** every time, sometimes (how often), or once. An intermittent bug with "3 of 10 attempts" is workable; "sometimes" isn't.

Facts and guesses stay apart. "I think it's the cache" goes under a separate heading, or the next reader treats it as established. My default is a template in the tracker, so nobody has to remember the list:

```markdown
## Summary
One sentence: what's wrong, from the user's side.

## Steps to reproduce
1.
2.
3.

## Expected

## Actual

## Environment
Version/commit:
Environment:
Client (browser/app version, OS):
Account/tenant ID:
Flags:

## Evidence
Request ID, timestamp, logs, screenshot or recording.

## Frequency
Always / N of M attempts / once

## Notes
Guesses, suspected cause, workarounds.
```

One bug per report. A ticket that lists three problems gets one fixed and closed, and the other two vanish with it.

## Severity and Priority Are Different Axes

Severity is how bad the bug is; priority is when it gets fixed. They're separate fields because they diverge all the time: a crash in an admin screen two people use a month is severe and can wait, while a typo in the pricing page headline is trivial and goes out today. Collapsing them into one field means every argument about scheduling turns into an argument about how bad the bug "really" is.

**Severity is a fact about impact,** decided by whoever triages it, from written criteria. My scale, close to the one [Mozilla's Bugzilla](https://wiki.mozilla.org/BMO/UserGuide/BugFields#bug_severity) uses:

| Severity | Criteria | Examples |
| -------- | -------- | -------- |
| **S1** | A core flow is broken for many users with no workaround, or data is lost, exposed or wrong, or money moves incorrectly | Checkout fails, a report shows another tenant's data, a refund is applied twice |
| **S2** | A major feature is badly impaired, or a subset of users is blocked, with no reasonable workaround | Exports time out for large accounts, login fails on one browser |
| **S3** | A feature misbehaves but a workaround exists, or a non-critical feature is broken | A filter ignores one field, bulk edit fails but single edit works |
| **S4** | Cosmetic or minor, little effect on what users can do | Misaligned icon, wrong pluralization, a confusing label |

When unsure, pick the higher one; downgrading costs nothing. Anything touching money, security or personal data starts at S1 until someone shows otherwise.

**Priority is a business decision,** made by the product owner for the area, with severity as one input among several: how many users, which customers, revenue at risk, a contractual or regulatory commitment, and what else the team would stop doing. Engineering advises on cost and risk; the product owner decides the order. Keep the priority scale short (now, next, later) and let the backlog's order carry the rest. Five priority levels end up meaning "important," "also important," and three kinds of never.

## Triage

A bug that nobody has looked at is not in the backlog, it's in a pile. Triage turns the pile into decisions.

- **Who:** the owning team, by rotation, using [code ownership](/docs/engineering/code-ownership) to route anything that lands in the wrong place. One person per week runs triage, with the product owner joining for the priority calls. A rotation spreads the knowledge of what's breaking; a single permanent triager becomes the person who knows and the bottleneck.
- **How often:** new bugs get a first look within one business day, and S1s immediately (see [below](#when-a-bug-is-an-incident)). A short triage session two or three times a week clears the rest. Daily is fine for a busy product; weekly lets the queue rot.
- **Every bug leaves triage with one outcome:**

| Outcome | Means | Next step |
| ------- | ----- | --------- |
| **Fix now** | Severity and priority both demand it | Assigned, in the current work |
| **Schedule** | Real, worth fixing, not urgent | Severity and priority set, placed in the ordered backlog |
| **Won't fix** | Real, but the cost exceeds the value, or the behavior is intended | Closed with the reason written down |
| **Need info** | Can't reproduce or act on it as written | Back to the reporter with a specific question, and a clock |
| **Duplicate** | Already tracked | Closed and linked to the original, with any new evidence copied over |

"Won't fix" is a legitimate answer, and saying it out loud is kinder than leaving a ticket open for two years. The same goes for "need info": if the reporter doesn't answer within two weeks, it closes.

### Keep the Backlog Honest

A backlog that only grows stops being a plan and becomes a record of guilt. Nobody reads it, so new reports go unnoticed among the old, and duplicates multiply because search returns forty near-matches.

My default: **a scheduled bug untouched for 90 days gets a stale warning, and closes 14 days later** unless someone comments with a reason to keep it. Closing isn't deleting; if the bug is real it'll be reported again, with fresh evidence from the current version, and the reopened ticket is worth more than the stale one. S1 and S2 bugs are exempt, because they should never get that old. Tools do this for you; GitHub's [stale action](https://github.com/actions/stale) labels and then closes inactive issues on a schedule you set. Pair it with a periodic check of the count: if the open-bug total rises quarter over quarter, triage is scheduling more than the team fixes, and "schedule" has quietly come to mean "won't fix."

## Where Bugs Come From

Most bug reports shouldn't come from engineers noticing things. Two intake paths matter more.

- **From customers, via support.** Support reproduces and escalates with the context engineering needs, and one engineering bug links to every customer ticket it affects, so all of them hear back when it ships. The tiers, criteria and response clock are in [Customer Support](/docs/operations/customer-support#escalation-to-engineering). Triage owes support the same first-look clock as any other reporter.
- **From production errors.** Error tracking groups exceptions by signature and opens or updates a ticket per group, with a count, first and last seen, the release that introduced it, and sample request IDs ([Observability](/docs/operations/observability)). A new error group after a deploy is a bug report written by the system, with better evidence than most people provide. Triage treats it like any other report, including "won't fix" for noise, which then gets silenced at the source rather than ignored.

### When a Bug Is an Incident

A bug becomes an [incident](/docs/operations/incident-response) when it's hurting customers now, at scale, and the response is measured in minutes rather than sprints: a core flow down, data being corrupted or exposed, money moving incorrectly. In practice, most S1s are incidents, and the triager's job is to declare one, not to schedule it. The incident gets mitigated (often a rollback or a [kill switch](/docs/delivery/feature-flags#kill-switches)); the underlying bug then comes back through triage as "fix now," with the postmortem's action items attached. When in doubt, declare; an incident closed in ten minutes costs less than a bug that sat in a queue while it spread.

## Every Fix Gets a Regression Test

A bug that was fixed without a test will be fixed again. Write the test first: a test that reproduces the bug and fails, then the fix that turns it green, in the same pull request. That proves the test actually catches the bug, and the reviewer can see both.

Put it **at the lowest level that catches it**, the same rule as the rest of the [test pyramid](/docs/quality/testing#the-pyramid): a rounding error gets a unit test case, a missing constraint gets an integration test, and only a bug that genuinely lives in the journey gets an end-to-end test. A suite that grows a slow end-to-end test for every bug becomes the ice-cream cone one fix at a time. Name the test for the behavior, not the ticket number, and link the ticket in the commit.

The exceptions are rare and stated in the pull request: a pure copy change, or a bug in configuration that a test of the config loader already covers.

## Escaped-Defect Review

An escaped defect is a bug a customer found before you did. Each one is a free lesson about the test strategy, and worth fifteen minutes. For every S1 and S2 that reached production (and a sample of the rest), the fixing engineer adds a short note to the ticket:

- **Which layer should have caught it?** Static checks, unit, integration, contract, end to end, review, a canary, monitoring. Name one.
- **Why didn't it?** No test existed, the test existed but asserted the wrong thing, the fixture didn't match production data, the canary metric didn't cover that path.
- **What changes?** Usually the regression test is enough. Sometimes it's a gap worth more than one test: a missing contract test between two services, an alert on a metric nobody watched.

This is blameless in the same sense as a [postmortem](/docs/operations/incident-response#the-postmortem): the question is which layer had the gap, never who wrote the bug. Someone always wrote it; that's what code review and tests are for. Review the notes together monthly. One escape is a bug; the same layer named five times is a strategy problem, and that's input for the [quality strategy](/docs/quality/strategy) and [quality metrics](/docs/quality/metrics).

## Zero Bugs or a Bug Budget

Two coherent policies, and a common incoherent one (no policy, so the backlog grows forever).

| | Zero-bug policy | Bug budget |
| --- | --- | --- |
| **Rule** | Every bug is fixed now or closed as won't fix; nothing is scheduled for later | Open bugs are allowed up to a stated limit per team; above it, bugs come before features |
| **Backlog** | Effectively empty | Bounded |
| **Works when** | The product is mature, the bug rate is low, and the team can absorb fixes without wrecking plans | The product is young or changing fast, and the bug rate is too high to fix everything immediately |
| **Fails when** | Pressure to keep the count at zero turns into closing real bugs as won't fix | The limit gets raised every time it's hit |

Both work for the same reason: they force a decision on every bug instead of letting "later" mean never. My default is a budget, set per team as a count of open S1 to S3 bugs (S1s should never be open long enough to count), reviewed with the [error budget](/docs/operations/slos#error-budget-policy) because the two tend to move together. A team that keeps its count near zero for a few quarters can switch to a zero-bug policy; that's a sign of a healthy suite, not a goal to impose first.

## Bugs Versus Tech Debt

A bug is behavior that's wrong: the system doesn't do what it should. [Tech debt](/docs/engineering/tech-debt) is a design that makes correct behavior expensive to change. The distinction matters because they're funded differently: bugs are prioritized against features by the product owner, while debt is paid from the team's standing capacity share.

- **A bug fix stays a bug fix.** Don't smuggle a refactor into it; land the refactor first as its own change, then the fix.
- **A bug that keeps recurring is debt.** If the same area produces a third bug of the same kind, the escaped-defect review should say so, and the fix is a debt item with the bugs linked as its interest.
- **Debt is not a bug because it's annoying.** "This module is hard to read" isn't a defect; filing it as one inflates the bug count and hides the real ones.

## References

**Reference**

- [Mozilla: Bug Writing Guidelines](https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html), the elements of a reproducible bug report
- [Mozilla BMO: Bug Fields](https://wiki.mozilla.org/BMO/UserGuide/BugFields), severity (S1 to S4) and priority defined as separate fields
- [GitHub: actions/stale](https://github.com/actions/stale), labeling and closing inactive issues on a schedule
