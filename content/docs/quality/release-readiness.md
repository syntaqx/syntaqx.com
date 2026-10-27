+++
title = "Release Readiness"
description = "Readiness as pipeline gates, exit criteria by risk tier, when a go/no-go earns its place, the release checklist, the first hour, and when to freeze code."
category = "Quality"
order = 1059
tags = ["quality", "releases", "delivery", "process"]
+++

"Is it ready to ship?" is a question most teams answer in a meeting, and most of the time the meeting adds nothing the pipeline didn't already know. With continuous delivery, the ordinary change doesn't need a release ceremony at all: readiness is a set of checks that every change passes on its way to production, automatically, and the human judgment goes where it's actually needed.

## Readiness Is Mostly Gates

If a check can be automated, it belongs in the [pipeline](/docs/delivery/ci-pipelines), not on a checklist someone ticks. A gate runs every time, never gets skipped on a Friday afternoon, and doesn't depend on who's on holiday. For a web service deployed on every merge, readiness looks like this:

- **Before merge:** static checks, the full test suite, contract checks against consumers, security scanning, a reviewed pull request, a preview deployment.
- **During deploy:** migrations applied ahead of the code that needs them, a [canary](/docs/delivery/deployment-strategies#canary) judged automatically against the current version, automatic rollback when it fails.
- **After deploy:** synthetic checks on the critical journeys, and [SLO](/docs/operations/slos) burn-rate alerts watching real traffic.

A change that clears all three is ready by definition. What remains for people is the small set of releases those gates can't judge, and those are worth a real conversation precisely because they're rare.

## Done, by Risk Tier

"Done" means the same thing everywhere: merged, deployed, verified in production, and behind a flag if users shouldn't see it yet. What changes with risk is how much evidence the exit criteria demand. The tiers, and the testing each one gets, come from [Risk-Based Testing](/docs/quality/strategy#risk-based-testing); the release exit criteria per tier look like this:

| Tier | Exit criteria beyond the standard gates |
| ---- | --------------------------------------- |
| **Low** | None. The gates are the criteria |
| **Medium** | None beyond a standard rollout, behind a flag when users shouldn't see it yet |
| **High** | Flag in place with staged rollout, [expand/contract](/docs/database/zero-downtime-migrations#expand-and-contract) for any schema change, dashboards for the new path |
| **Critical** | Everything above, plus a written rollback plan, rollout stages with go/no-go metrics stated in advance, a named owner watching it, and a manual go/no-go when it's a one-way door |

The tier is set when the work is planned, not when it's about to ship. Discovering on release day that a change is high risk means the evidence wasn't gathered while it was cheap.

## When a Manual Go/No-Go Is Warranted

A go/no-go is a short meeting (or a written thread) where the owners confirm the checklist and someone with authority says "go." It's for changes where a mistake is expensive and hard to undo, and where the pipeline can't see everything that matters:

- **Big launches,** where marketing, support, sales and partners all move on the same date, and "ready" includes people as well as code.
- **Mobile store releases,** where a shipped binary can't be rolled back and review adds latency you don't control. The release owner's go/no-go on each rollout stage is part of [Mobile Releases](/docs/delivery/mobile-releases#release-trains).
- **Regulated changes,** where a recorded approval is a requirement, not a preference.
- **Large data migrations** and other one-way doors: a backfill of record data, a change of primary datastore, a destructive contract step ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations)).

For anything else, a go/no-go is ceremony. It batches changes waiting for the meeting, and it puts a person in front of the release who can't tell a safe change from an unsafe one any better than the tests could. Keep the meeting short and the decision explicit: go, no-go with the blocking item named, or go with a stated condition ("go, with rollout paused at 10% until support confirms").

## The Checklist

For a release that does need one, the checklist is the agenda. Every item is a yes, a no, or "not applicable," with a link to the evidence:

- **Tests green** on the exact build being released, including the end-to-end journeys.
- **No open S1 or S2 bugs** against the release ([Defects & Triage](/docs/quality/defects#severity-and-priority-are-different-axes)). Lower-severity known issues are listed, with whoever decided they're acceptable.
- **Migrations reversible or expand/contract,** with the contract step scheduled as a separate later release.
- **Flags in place** for every new behavior, with a kill switch for anything risky, and the rollout stages decided ([Feature Flags](/docs/delivery/feature-flags#progressive-rollout)).
- **Monitoring ready:** dashboards for the new paths, alerts with owners and runbooks, the metrics that decide each rollout stage written down in advance.
- **Rollback plan,** stating exactly what gets undone and how: a flag, a redeploy, a forward fix for anything that can't be reversed. Rehearsed, if it's never been done for this system.
- **Support briefed,** with what's changing, known issues, macros for the expected questions, and the escalation path ([Customer Support](/docs/operations/customer-support)).
- **Docs and changelog** updated, for users and for API consumers.
- **An owner on watch** for the first hour, by name, with the authority to roll back without asking.

## Testing in Production, Safely

No pre-production environment is production. Real data, real traffic, real devices and real third parties will find what staging didn't. The answer isn't to pretend otherwise, it's to expose new code to production in small, controlled, reversible steps, and to keep checking after it's there. The mechanics are owned elsewhere; this is how they combine into a release:

- **Internal and dogfood cohorts first.** The new behavior is turned on by [feature flag](/docs/delivery/feature-flags) for employees, then for a beta cohort, before anyone else. Staff using the real product on real data find the bugs nobody wrote a test for.
- **Canaries for the code itself,** compared against the current version and judged automatically ([Deployment Strategies](/docs/delivery/deployment-strategies#canary)).
- **Dark launches** for new back-end paths, running on real traffic with their results discarded, so load and correctness are proven before users depend on them ([Shadow and Dark Launches](/docs/delivery/deployment-strategies#shadow-and-dark-launches)).
- **Synthetic monitoring:** scripted journeys (sign up, log in, pay) run against production on a schedule, from outside, so a broken flow alerts even when real traffic is too quiet to show it. [AWS CloudWatch Synthetics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html) describes the pattern, and most observability vendors offer the same.

The safety rules: [test accounts](/docs/quality/test-data#test-accounts-in-production) are flagged so their data is excluded from analytics and billing, synthetic transactions never move real money, and nothing tested in production can affect a customer who didn't opt into a cohort.

## The First Hour

A release isn't done when the deploy finishes; it's done when production has shown it works. The first hour is when most bad releases reveal themselves, and when rolling back is cheapest.

- **Verify, then watch.** Run the smoke and synthetic checks against production immediately. Then watch the service's [SLIs](/docs/operations/slos) (error rate, latency, the key business events) against the same hour last week, not just against zero.
- **Compare cohorts.** If the release is flagged or canaried, compare the new cohort with the old one directly; that cancels out everything else changing at the same time.
- **Decide on numbers.** The thresholds that trigger rollback were written down before the release. If one trips, roll back first and investigate after. Debating whether the spike is "real" while the error budget burns is the most expensive habit in release management.
- **Watch the side channels:** support ticket volume by category, new error groups in error tracking, and the status of jobs and queues that the release touched.

When the hour passes cleanly, the owner says so in the release channel and the rollout continues to its next stage.

## Sign-off

Sign-off records who decided the release was ready, so it should come from the people who own the outcome: the engineering owner for the change, the product owner for the release decision, and, where the rules require it, a named approver for the regulated part (security, compliance, a change advisory process). Each signs for what they actually checked.

"QA signs off" is an anti-pattern when it means one person or team owns quality for everyone else. It tells the engineers who wrote the code that quality is checked downstream, makes QA the gate blamed for every escape, and makes the release wait for one person's availability ([Whole Team, Not a Gate](/docs/quality/strategy#whole-team-not-a-gate)). Quality engineers' judgment, from [exploratory sessions](/docs/quality/exploratory-testing) on risky features and from reviewing escaped defects, is an input to the go/no-go, not a substitute for the owners' accountability.

## Release Candidates and Code Freezes

A release candidate is a specific build, cut from main, that's tested and then either shipped exactly as is or replaced by the next candidate. A code freeze stops merges for a period before a release. Both make sense where the release itself is expensive or slow to correct:

- **Mobile apps,** where store review and no rollback make each binary a commitment. A release branch takes fixes only, cherry-picked from main, as in [Mobile Releases](/docs/delivery/mobile-releases#release-trains). Google's SRE book describes the same branch-and-cherry-pick model for server releases that need a known set of contents ([Release Engineering](https://sre.google/sre-book/release-engineering/)).
- **Hardware and firmware,** and software installed on customers' machines, where updates reach users slowly or not at all.
- **Regulated releases,** where the build that was validated has to be the build that ships, byte for byte.

Everywhere else, they make things worse. A freeze doesn't stop work, it stops merging: changes pile up on branches and land all at once when it lifts, which is the riskiest deploy of the quarter. A long-lived candidate accumulates cherry-picks until it no longer matches what was tested. Both turn a stream of small, separately reversible changes into a batch, and batches are what [continuous deployment](/docs/delivery/ci-pipelines#delivery-vs-deployment) exists to avoid. If the team wants a freeze before a big event, what it usually wants is a pause on risky changes, which a [risk tier](#done-by-risk-tier) and a flag already express without stopping the low-risk work.

## References

**Reference**

- [Google SRE Book: Release Engineering](https://sre.google/sre-book/release-engineering/), release branches cut from a tested revision, with fixes cherry-picked from mainline
- [AWS: CloudWatch Synthetics canaries](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html), scripted journeys run on a schedule against production

**In practice**

- [Martin Fowler: Dark Launching](https://martinfowler.com/bliki/DarkLaunching.html), running new back-end behavior on live traffic before release
