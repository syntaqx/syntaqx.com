+++
title = "CI Pipelines"
description = "Fast, trustworthy continuous integration: parallel jobs, cached dependencies, local parity with real services, least privilege, and pinned actions."
category = "Delivery"
order = 11
tags = ["ci", "devops", "delivery", "github-actions"]
aliases = ["ci-pipelines"]
+++

Continuous integration is a promise: anything on `main` works. The pipeline is how you keep it, and it only keeps it if people trust it and don't wait on it. Both failures are behavioral, not technical. A slow pipeline teaches people to batch changes and context-switch while they wait. A flaky one teaches them that red doesn't mean broken, so they rerun until it's green, and one day the red is real.

## Fast

- **Under 10 minutes,** from push to green. Past that, people stop waiting for it: they open the next change, stack work on an unverified base, and batch changes to avoid paying the wait twice. Batches are exactly what CI exists to prevent, because a failing batch takes longer to diagnose than the sum of its parts.
- **Parallel jobs.** Lint, typecheck and test don't depend on each other, so they run side by side and the pipeline takes as long as the slowest one, not the sum.
- **Parallel tests.** Test runners split files across workers. Keep tests independent (no shared state, no ordering) so they can run that way. See [Testing Strategy](/docs/engineering/testing).
- **Fail fast.** Cheap checks first within a job, and cancel superseded runs: a new push to a pull request cancels the run for the old one.

### Parallelism Costs Setup

Every parallel job installs dependencies on its own. Split a pipeline into three jobs without caching and you pay for the install three times, which can wipe out the gain. Measure before splitting: if the install is 27 seconds and the tests are 2, the install is the problem.

- **Cache the dependency directory** (`node_modules`, not just the package manager's download cache). Caching downloads still leaves the install step; caching the installed directory skips it.
- **Key the cache on what actually changes the result:** the lockfile and the runtime's major version. Keying on the exact patch version sounds safer but fragments the cache, because hosted runners resolve "Node 24" to different patch releases, and every miss pays the full install.
- **Share setup in one place.** A reusable or composite action keeps every job's setup identical.

## Trustworthy

- **Deterministic.** Same commit, same result. No network calls to services you don't control, no clock or ordering dependencies. Every source of nondeterminism is a future flaky test, and every flaky test erodes the one thing the pipeline sells: that red means broken.
- **Flaky tests are bugs.** Quarantine and fix them; never retry automatically to hide them. See [Testing Strategy](/docs/engineering/testing#flaky-tests).
- **Real services, not mocks.** If production talks to Postgres or Redis, CI runs Postgres or Redis as service containers, the same images developers run locally from `compose.yml`. Mocks test your assumptions about a dependency; real services test the dependency. The bugs that matter live in the gap between the two: a query that works on the mock but not on the real engine, a script the real server rejects.
- **Required checks.** Branch protection lists the checks that must pass before a merge. A check that isn't required eventually gets ignored.

## Secure

- **Least privilege.** Workflows default to `permissions: contents: read` and request more per job, only when a step needs it.
- **Pin third-party actions to a full commit SHA,** with the version in a comment. A tag is a pointer the action's owner (or whoever compromises them) can move. In March 2025 attackers did exactly that to `tj-actions/changed-files`, a widely used action: they [repointed its version tags](https://github.com/advisories/GHSA-mrrh-fwg8-r2c3) to a malicious commit that printed CI secrets into build logs. Workflows pinned to a SHA kept running the code they'd reviewed. See [Dependency Management](/docs/engineering/dependencies).
- **No secrets in pull requests from forks.** A fork's pull request runs code anyone on the internet wrote. Triggers that run that code with your repository's secrets, like `pull_request_target` checking out the fork's branch, are the classic ["pwn request"](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/). Jobs that need secrets run only on trusted events.
- **Secrets come from the platform's secret store,** scoped to the environment that needs them. See [Configuration & Secrets](/docs/operations/configuration).

## What CI Is Not

CI tells you a change is safe to ship. It doesn't ship it. What happens after green is [Continuous Deployment](/docs/delivery/continuous-deployment).

## This Site

[syntaqx.com's pipeline](https://github.com/syntaqx/syntaqx.com/blob/main/.github/workflows/ci.yml) runs lint, typecheck and test as parallel jobs. A composite setup action restores `node_modules` from a cache keyed on `.nvmrc` and the lockfile, so jobs skip `npm ci` when dependencies haven't changed. The test job starts the same Redis and REST proxy containers as `compose.yml`, every action is pinned to a SHA, and superseded runs are cancelled.

The numbers make the setup-cost point. The single serial job took about 57 seconds, of which installing dependencies was 27 and the tests themselves 2. Splitting into parallel jobs alone would have paid that install three times; with the cache warm, the parallel pipeline finishes in about 36.

## References

**Reference**

- [GitHub Actions: Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows), keying caches on the lockfile
- [GitHub Actions: About service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers), real databases in CI
- [GitHub Actions: Concurrency](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs), cancelling superseded runs
- [GitHub Actions: Creating a composite action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action), shared setup across jobs
- [GitHub: Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), least privilege and SHA pinning
- [GitHub Advisory: tj-actions/changed-files (GHSA-mrrh-fwg8-r2c3)](https://github.com/advisories/GHSA-mrrh-fwg8-r2c3), version tags repointed to a malicious commit
- [GitHub Security Lab: Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/), secrets and untrusted code from forks

**In practice**

- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html), integrate often, keep the build fast and green
- [DORA: Four keys](https://dora.dev/guides/dora-metrics-four-keys/), lead time for changes and why pipeline speed matters
