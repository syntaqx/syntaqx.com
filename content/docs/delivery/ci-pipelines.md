+++
title = "CI & Continuous Deployment"
nav_title = "CI & Deployment"
description = "Fast, trustworthy CI with parallel jobs and real services, then every merge to main deployed on its own, and what must be true before that is safe."
category = "Delivery"
order = 1101
tags = ["ci", "cd", "devops", "delivery", "github-actions", "deployment"]
aliases = ["ci-pipelines", "delivery/continuous-deployment", "continuous-deployment"]
+++

Continuous integration is a promise that anything on `main` works. Continuous deployment cashes it: every merge to `main` goes to production automatically, without a person pressing a button. That's the default I work toward on every team, and it only holds if people trust the pipeline and don't wait on it. Both failures are behavioral. A slow pipeline teaches people to batch changes; a flaky one teaches them that red doesn't mean broken, so they rerun until it's green, and one day the red is real.

## Fast

- **Under 10 minutes** from push to green. Past that, people open the next change, stack work on an unverified base, and batch changes to avoid paying the wait twice, which is exactly what CI exists to prevent.
- **Parallel jobs.** Lint, typecheck and test don't depend on each other, so the pipeline takes as long as the slowest, not the sum. Test runners split files across workers too, as long as tests share no state.
- **Fail fast.** Cheap checks first, and a new push cancels the run for the old one.

Parallelism costs setup: every job installs dependencies on its own, so splitting into three jobs without caching pays for the install three times. Cache the installed directory (`node_modules`, not just the download cache), keyed on the lockfile and the runtime's *major* version; keying on the patch version fragments the cache, because hosted runners resolve "Node 24" to different patch releases. Put shared setup in one composite action.

## Trustworthy

- **Deterministic.** Same commit, same result: no calls to services you don't control, no clock or ordering dependencies. [Flaky tests are bugs](/docs/engineering/testing#flaky-tests), quarantined and fixed, never retried to hide them.
- **Real services, not mocks.** If production talks to Postgres or Redis, CI runs them as service containers, the same images developers run from `compose.yml`.
- **Required checks.** Branch protection lists the checks that must pass. A check that isn't required eventually gets ignored.

## Secure

- **Least privilege.** Workflows default to `permissions: contents: read` and request more per job.
- **Third-party actions pinned to a full commit SHA,** because a tag can be moved by whoever compromises its owner. See [Dependencies & Upgrades](/docs/engineering/dependencies#supply-chain).
- **No secrets for fork pull requests.** A fork's PR runs code anyone wrote; `pull_request_target` checking out the fork's branch with your secrets is the classic ["pwn request"](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/). Jobs that need secrets run only on trusted events, with secrets scoped per [environment](/docs/operations/environments).

## Delivery vs. Deployment

| | Continuous Delivery | Continuous Deployment |
| --- | --- | --- |
| Every green build is | Releasable | Released |
| Getting to production | A person decides when | The merge decides |
| Batch size | Whatever accumulated | One change |

Continuous delivery is a real achievement, but the manual step quietly rebuilds what CI removed. Picture a weekly release: thirty pull requests from eight people go out Thursday afternoon, and error rates climb. Which one did it? The authors have moved on, and rolling back means rolling back all thirty, including the fix a customer was waiting for, so the team debugs forward under pressure. None of that happens when each change went out alone, minutes after merging, with its author still watching.

One change per deploy means one place to look and a revert that undoes exactly one thing. Rollback is routine, so it gets used. There are no release trains or code freezes, and nothing can hide on `main` when `main` is production. The intuition that shipping more often breaks more is backwards: [DORA's research](https://dora.dev/guides/dora-metrics-four-keys/) found teams that deploy more frequently, with shorter lead times, also have lower change failure rates and recover faster.

## Deploy Is Not Release

Deploying puts code in production; releasing puts a feature in front of users. "This feature isn't ready" isn't an objection, because unready code can be in production as long as nobody can reach it: it ships dark behind a [feature flag](/docs/delivery/feature-flags) and rolls out progressively, and [schema changes stay backward compatible](/docs/database/zero-downtime-migrations) so each deploy works alongside the previous one.

Continuous deployment is the result of good practice, not a substitute for it. Before turning it on you need: CI you trust; small pull requests on short-lived branches ([Commits, PRs & Code Review](/docs/engineering/commits-and-reviews)); a preview deployment of every change; [observability](/docs/operations/observability) that alerts on its own; and a one-step rollback that's been practiced.

Some releases genuinely need a human gate: app store submissions ([Mobile Releases](/docs/delivery/mobile-releases)), software on customers' machines, regulated changes needing a recorded sign-off. You can't take those back quickly, or someone outside the team must approve. Use continuous delivery there, with the gate as thin as the rules allow. For a web service you run yourself, a manual gate mostly adds a person who can't tell a safe change from an unsafe one any better than the tests can.

## References

**Reference**

- [GitHub Actions: Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows), keying caches on the lockfile
- [GitHub Actions: About service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers), real databases in CI
- [GitHub Actions: Concurrency](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs), cancelling superseded runs
- [GitHub Actions: Creating a composite action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action), shared setup across jobs
- [GitHub: Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), least privilege and SHA pinning
- [GitHub Security Lab: Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/), secrets and untrusted code from forks
- [Vercel: Preview deployments](https://vercel.com/docs/deployments/environments#preview-environment-pre-production), a deployment for every pull request
- [Vercel: Instant rollback](https://vercel.com/docs/instant-rollback), one-step rollback to a previous deployment

**In practice**

- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html), integrate often, keep the build fast and green
- [Martin Fowler: Continuous Delivery](https://martinfowler.com/bliki/ContinuousDelivery.html), the distinction between delivery and deployment
- [Jez Humble: Continuous Delivery](https://continuousdelivery.com/), principles and the case for small batches
- [DORA: Four keys](https://dora.dev/guides/dora-metrics-four-keys/), deployment frequency, lead time, change failure rate and time to restore
