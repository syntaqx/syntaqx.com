+++
title = "Continuous Deployment"
description = "Why every merge to main goes to production on its own, how that differs from continuous delivery, and what has to be true before you can do it safely."
category = "Delivery"
order = 11.1
tags = ["cd", "devops", "delivery", "deployment"]
aliases = ["continuous-deployment"]
+++

Every change that merges to `main` goes to production, automatically, without a person pressing a button. That's continuous deployment, and it's the default I work toward on every team.

## Delivery vs. Deployment

The two are one step apart, and the step matters.

| | Continuous Delivery | Continuous Deployment |
| --- | --- | --- |
| Every green build is | Releasable | Released |
| Getting to production | A person decides when | The merge decides |
| Batch size | Whatever accumulated since the last release | One change |

Continuous delivery is a real achievement: `main` is always shippable. But the manual step quietly rebuilds the things CI was meant to remove.

Picture a weekly release. Thirty pull requests from eight people go out on Thursday afternoon. Error rates climb. Which of the thirty did it? The authors have moved on to other work, half of them are in meetings, and rolling back means rolling back all thirty, including the urgent fix a customer was waiting for. So the team debugs forward under pressure instead. None of that happens when each of those thirty changes went out on its own, within minutes of merging, with its author still watching.

## Why Deployment

- **Small batches are safe batches.** One change per deploy means one place to look when something breaks, and a revert that undoes exactly one thing.
- **Feedback in minutes, not weeks.** The engineer who wrote the change is still in context when production tells them something about it.
- **Rollback is cheap, so it gets used.** When deploying is routine, rolling back is too, and nobody debugs production at 2 a.m. instead of reverting.
- **No release ceremony.** No release trains, no release managers, no code freeze. The process is the pipeline.
- **It keeps everything else honest.** Nothing can hide on `main` if `main` is production. Tests, reviews and monitoring have to be good enough to stand on their own, and you find out quickly when they aren't.

The intuition most teams start with is that shipping more often means breaking things more often. The [DORA research](https://dora.dev/guides/dora-metrics-four-keys/) found the opposite: teams that deploy more frequently, with shorter lead times, also have lower change failure rates and recover faster. Speed and stability come from the same practices: small changes, automated checks and cheap rollback.

## Deploy Is Not Release

Deploying puts code in production. Releasing puts a feature in front of users. The most common objection to continuous deployment is "but this feature isn't ready", and the answer is that it doesn't need to be: unready code can be in production as long as nobody can reach it. Continuous deployment works because the two are separate:

- **Unfinished work ships dark,** behind a flag. See [Feature Flags & Progressive Rollout](/docs/engineering/feature-flags).
- **Risky changes roll out progressively:** internal users, then a percentage, then everyone, watching the [SLOs](/docs/operations/slos) at each step.
- **Schema changes are backward compatible,** so every deploy works with the previous one still running. See [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations).

## What Has to Be True First

Continuous deployment is the result of good practice, not a substitute for it. Turning it on without the foundations just ships bugs faster. Before turning it on:

1. **CI you trust.** Fast, deterministic and required. See [CI Pipelines](/docs/delivery/ci-pipelines).
2. **Small pull requests, merged often.** Trunk-based development, short-lived branches. See [Commits, PRs & Code Review](/docs/engineering/commits-and-reviews).
3. **A preview of every change.** Each pull request deploys somewhere real before it merges.
4. **Observability that notices.** Error rates and latency alert on their own. See [Observability](/docs/operations/observability).
5. **One-step rollback,** practiced, not theoretical.

## When Delivery Is the Right Call

Some releases genuinely need a human gate: app store submissions, software installed on customers' machines, regulated changes that need a recorded sign-off. What they have in common is that you can't take a release back quickly, or someone outside the team has to approve it. Use continuous delivery there, and keep the gate as thin as the rules allow.

For a web service you run yourself, neither is true. You can roll back in a minute, and a manual gate mostly adds a person who can't tell a safe change from an unsafe one any better than the tests can.

## This Site

Every pull request to [syntaqx.com](https://github.com/syntaqx/syntaqx.com) gets a Vercel preview deployment. When CI is green it merges to `main`, and `main` deploys to production in about a minute, with no release step. Rolling back is Vercel's instant rollback to the previous deployment, or reverting the commit.

## References

**Reference**

- [Vercel: Preview deployments](https://vercel.com/docs/deployments/preview-deployments), a deployment for every pull request
- [Vercel: Instant rollback](https://vercel.com/docs/instant-rollback), one-step rollback to a previous deployment

**In practice**

- [Martin Fowler: Continuous Delivery](https://martinfowler.com/bliki/ContinuousDelivery.html), the distinction between delivery and deployment
- [Jez Humble: Continuous Delivery](https://continuousdelivery.com/), principles and the case for small batches
- [Atlassian: Continuous integration vs. delivery vs. deployment](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment), the three practices side by side
- [DORA: Four keys](https://dora.dev/guides/dora-metrics-four-keys/), deployment frequency, lead time, change failure rate and time to restore
- [Martin Fowler: Feature Toggles](https://martinfowler.com/bliki/FeatureToggle.html), separating deploy from release
