+++
title = "Quality Metrics"
description = "Quality metrics worth tracking (change fail rate, escaped defects, flake rate, time to detect), the ones that mislead, and mutation testing."
category = "Quality"
order = 1061
tags = ["quality", "metrics", "dora", "testing"]
+++

Quality metrics exist to answer two questions: are users getting a working product, and can the team keep changing it safely? A metric that answers neither is noise, and a metric used to judge people stops answering anything. Marilyn Strathern's phrasing of Goodhart's law is the whole problem in one line: "When a measure becomes a target, it ceases to be a good measure."

So the rule for everything below: **measure outcomes at the team or service level, watch trends, and never turn a quality metric into a personal target.**

## Delivery Stability: DORA

DORA's research splits software delivery performance into throughput and instability. Two of its five metrics are quality metrics in all but name:

- **Change fail rate:** the ratio of deployments that require immediate intervention after they ship (a rollback, a hotfix, a flag turned off). It's the most direct measure of how much broken work gets past everything before production.
- **Failed deployment recovery time:** how long it takes to recover from a deployment that fails and needs immediate intervention. It replaced MTTR in DORA's model.

DORA also tracks **deployment rework rate**, the share of deployments that are unplanned and happen because of a production incident. Read the three together, and next to the throughput metrics: a change fail rate that drops because the team stopped deploying isn't an improvement. DORA's own guidance says the metrics apply per application or service, and the goal is a team improving over time, not teams competing.

## What to Measure

- **Escaped defects.** Bugs found in production that should have been caught before it, counted per release or per month. The **defect escape rate** is escaped defects divided by all defects found (before and after release). Classify escapes by where they should have been caught; that tells you which layer of the [test suite](/docs/quality/testing) or [release process](/docs/quality/release-readiness) has the hole.
- **Defect age.** How long open defects have been open, as a distribution by severity, not an average. A growing tail of old high-severity bugs means triage isn't working. See [Defects & Triage](/docs/quality/defects).
- **Reopen rate.** The share of fixed defects that come back. High means fixes are going out without a test that reproduces the bug.
- **Flake rate.** The share of test runs (or tests) that fail and then pass with no code change. It measures how much the team can trust a red build. My threshold: any flake gets the [quarantine treatment](/docs/quality/testing#flaky-tests); the rate is for spotting a suite drifting, not for deciding what's acceptable.
- **Suite duration.** Wall-clock time from push to a merge-blocking result, at the median and the slow tail. It's a quality metric because a slow suite gets skipped, batched and resented. My threshold is the one in [CI & Continuous Deployment](/docs/delivery/ci-pipelines#fast).
- **Mean time to detect.** From a defect reaching production to someone knowing about it. Short detection is what makes shift-right safe; if users report bugs before your [alerts](/docs/operations/observability#alerts) do, this is the number to work on. Pull it from [postmortem](/docs/operations/incident-response#the-postmortem) timelines.

## What Not to Measure

Some metrics are easy to collect, look rigorous, and push behavior the wrong way.

- **Coverage percentage as a target.** Coverage shows which lines ran, not whether a test would notice them break. Set a target and people write tests that execute code without asserting on it. Use coverage to find untested code, as in [Testing Strategy](/docs/quality/testing#in-ci), and never as a gate number to hit.
- **Test case counts.** More tests isn't more quality. It rewards splitting one good test into five, and punishes deleting the redundant or flaky ones that should go.
- **Bugs found per tester, or bugs caused per developer.** Ranking people by bug counts turns testers into bug farmers (ten trivial reports beat one important one), makes developers argue severity instead of fixing, and makes everyone hide problems. It also measures the wrong thing: most defects come from the system people work in, not from the person.
- **Pass rate on its own.** A suite at 100% green can be testing nothing. A falling pass rate is a signal; a high one isn't proof.

## Mutation Testing: Measuring the Tests

If coverage tells you what ran, mutation testing tells you whether the tests would catch a bug there. A tool makes small changes to the code (flips a `<` to `<=`, deletes a call, replaces a return value), runs the tests against each changed version, and records whether any test failed. A mutant that makes a test fail is **killed**; one where every test still passes **survived**, and points at an assertion that's missing. The **mutation score** is the percentage of mutants detected.

- **Tools:** [Stryker](https://stryker-mutator.io/) for JavaScript and TypeScript, C# and Scala; [PIT](https://pitest.org/) for the JVM.
- **Run it on the code that matters.** Mutation testing is expensive, because it runs the suite once per mutant. Run it on critical-tier code (see [risk-based testing](/docs/quality/strategy#risk-based-testing)), nightly, or on changed files only: StrykerJS has an incremental mode that reruns only what changed.
- **Read the survivors, don't chase the score.** A surviving mutant is a concrete question: should a test have failed here? Some survivors are equivalent mutants that change nothing observable. A mutation score as a target is Goodhart's law again, one level up.

## Customer-Facing Signals

Internal metrics are proxies. These measure what users actually experienced:

- **SLO burn.** How fast each service spends its error budget, per [SLOs](/docs/operations/slos). A release that doubles the burn rate is a quality problem, whatever the tests said.
- **Crash-free sessions and users.** For apps: the share of sessions that didn't end in a crash, and of users who didn't hit one, per release. They gate [mobile rollouts](/docs/delivery/mobile-releases#release-health-gates).
- **Support tickets.** Volume and themes tagged by feature and release. A spike after a release that touched one area is the cheapest escaped-defect detector there is.
- **User-reported bugs.** Escaped defects that a user found first. Every one is also a detection failure.

## The Metrics Table

| Metric | Definition | What it tells you | How it gets gamed |
| ------ | ---------- | ----------------- | ----------------- |
| Change fail rate | Deployments needing immediate intervention, over all deployments | How much broken work reaches production | Not counting flag flips and quiet hotfixes as failures; deploying less |
| Failed deployment recovery time | Time from a failed deployment to recovery | How fast the team can undo damage | Declaring recovery at mitigation while the bug lingers |
| Deployment rework rate | Unplanned deployments caused by incidents, over all deployments | How much delivery capacity goes to fixing production | Rolling fixes into planned deployments |
| Defect escape rate | Escaped defects over all defects found | Which layer of testing has holes | Reclassifying bugs as "feature requests"; not filing internal bugs |
| Defect age | Time defects stay open, by severity | Whether triage keeps up | Closing old bugs as "won't fix" without a decision |
| Reopen rate | Fixed defects reopened, over all fixed | Whether fixes are verified | Filing a new bug instead of reopening |
| Flake rate | Runs that fail then pass with no code change | How much a red build can be trusted | Automatic retries; deleting tests without recording the gap |
| Suite duration | Push to merge-blocking result, median and slow tail | Feedback speed | Moving slow tests out of the required suite |
| Mean time to detect | Defect in production to someone knowing | Whether monitoring catches what tests miss | Starting the clock at the alert, not the deploy |
| Mutation score | Mutants killed over mutants generated | Whether tests would catch real bugs | Excluding hard files; trivial assertions that kill mutants |
| Crash-free sessions | Sessions not ending in a crash, per release | User-visible stability | Catching and swallowing exceptions |
| SLO burn | Rate of error budget spend | User-visible reliability | Loosening the SLO, or the SLI definition |

## Presenting Them

- **Trends, not snapshots.** A number this month means little; the direction over a quarter means a lot. Plot each metric over time, with releases and incidents marked.
- **Per team or service, never per person.** Quality metrics describe a system. The moment one is attached to an individual's review, it gets gamed, and you lose the signal for everyone.
- **Never rank.** Not people, and not teams against each other: services differ in risk, age and traffic, and a league table rewards picking easy work.
- **Pair every metric with its counterweight.** Change fail rate with deployment frequency, escape rate with suite duration, coverage with mutation score. Optimizing one alone always costs the other.
- **Few, and reviewed.** Five to eight metrics the team looks at regularly, in a retro or an ops review, with a question attached: what changed, and what does the team try next? A dashboard nobody discusses is decoration.

## References

**Specifications**

- [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics/), change fail rate, failed deployment recovery time and deployment rework rate, and the pitfalls of using them as targets

**Reference**

- [Stryker: Mutant states and metrics](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/), killed, survived and the mutation score
- [StrykerJS: Incremental mode](https://stryker-mutator.io/docs/stryker-js/incremental/), mutation testing only changed code
- [PIT](https://pitest.org/), mutation testing for the JVM, and why line coverage doesn't show fault detection
- [Firebase Crashlytics: Crash-free metrics](https://firebase.google.com/docs/crashlytics/crash-free-metrics), crash-free users and sessions defined

**In practice**

- [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), Goodhart's 1975 formulation and Strathern's 1997 phrasing
