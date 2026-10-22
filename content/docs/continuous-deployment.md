+++
title = "Continuous Deployment"
description = "Why every merge to main goes to production on its own, how that differs from continuous delivery, and what has to be true before you can do it safely."
category = "Delivery"
order = 11.1
tags = ["cd", "devops", "delivery", "deployment"]
+++

Every change that merges to `main` goes to production, automatically, without a person pressing a button. That's continuous deployment, and it's the default I work toward on every team.

## Delivery vs. Deployment

The two are one step apart, and the step matters.

| | Continuous Delivery | Continuous Deployment |
| --- | --- | --- |
| Every green build is | Releasable | Released |
| Getting to production | A person decides when | The merge decides |
| Batch size | Whatever accumulated since the last release | One change |

Continuous delivery is a real achievement: `main` is always shippable. But the manual step quietly rebuilds the things CI was meant to remove. Changes pile up between releases, every release is bigger than it needs to be, and when something breaks, the cause is somewhere in that pile.

## Why Deployment

- **Small batches are safe batches.** One change per deploy means one place to look when something breaks, and a revert that undoes exactly one thing.
- **Feedback in minutes, not weeks.** The engineer who wrote the change is still in context when production tells them something about it.
- **Rollback is cheap, so it gets used.** When deploying is routine, rolling back is too, and nobody debugs production at 2 a.m. instead of reverting.
- **No release ceremony.** No release trains, no release managers, no code freeze. The process is the pipeline.
- **It keeps everything else honest.** Nothing can hide on `main` if `main` is production. Tests, reviews and monitoring have to be good enough to stand on their own, and you find out quickly when they aren't.

The [DORA research](https://dora.dev/guides/dora-metrics-four-keys/) backs this up: deployment frequency and lead time go together with lower change failure rates and faster recovery, not against them.

## Deploy Is Not Release

Deploying puts code in production. Releasing puts a feature in front of users. Continuous deployment works because the two are separate:

- **Unfinished work ships dark,** behind a flag. See [Feature Flags & Progressive Rollout](/docs/feature-flags).
- **Risky changes roll out progressively:** internal users, then a percentage, then everyone, watching the [SLOs](/docs/slos) at each step.
- **Schema changes are backward compatible,** so every deploy works with the previous one still running. See [Zero-Downtime Migrations](/docs/zero-downtime-migrations).

## What Has to Be True First

Continuous deployment is the result of good practice, not a substitute for it. Before turning it on:

1. **CI you trust.** Fast, deterministic and required. See [CI Pipelines](/docs/ci-pipelines).
2. **Small pull requests, merged often.** Trunk-based development, short-lived branches. See [Commits, PRs & Code Review](/docs/commits-and-reviews).
3. **A preview of every change.** Each pull request deploys somewhere real before it merges.
4. **Observability that notices.** Error rates and latency alert on their own. See [Observability](/docs/observability).
5. **One-step rollback,** practiced, not theoretical.

## When Delivery Is the Right Call

Some releases genuinely need a human gate: app store submissions, software installed on customers' machines, regulated changes that need a recorded sign-off. Use continuous delivery there, and keep the gate as thin as the rules allow. For a web service you run yourself, it's rarely necessary.

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
