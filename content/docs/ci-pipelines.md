+++
title = "CI Pipelines"
description = "Fast, trustworthy continuous integration: parallel jobs, cached dependencies, local parity with real services, least privilege, and pinned actions."
category = "Delivery"
order = 11
tags = ["ci", "devops", "delivery", "github-actions"]
+++

Continuous integration is a promise: anything on `main` works. The pipeline is how you keep it, and it only works if people trust it and don't wait on it. Slow pipelines get skipped; flaky ones get rerun until they're ignored.

## Fast

- **Under 10 minutes,** from push to green. Past that, people batch changes to avoid waiting, and batches are what CI exists to prevent.
- **Parallel jobs.** Lint, typecheck and test don't depend on each other, so they run side by side and the pipeline takes as long as the slowest one, not the sum.
- **Parallel tests.** Test runners split files across workers. Keep tests independent (no shared state, no ordering) so they can run that way. See [Testing Strategy](/docs/testing).
- **Fail fast.** Cheap checks first within a job, and cancel superseded runs: a new push to a pull request cancels the run for the old one.

### Parallelism Costs Setup

Every parallel job installs dependencies on its own. Split a pipeline into three jobs without caching and you pay for the install three times, which can wipe out the gain. Measure before splitting: if the install is 27 seconds and the tests are 2, the install is the problem.

- **Cache the dependency directory** (`node_modules`, not just the package manager's download cache), keyed on the lockfile and runtime version. A hit skips the install entirely.
- **Share setup in one place.** A reusable or composite action keeps every job's setup identical.

## Trustworthy

- **Deterministic.** Same commit, same result. No network calls to services you don't control, no clock or ordering dependencies.
- **Flaky tests are bugs.** Quarantine and fix them; never retry automatically to hide them. See [Testing Strategy](/docs/testing#flaky-tests).
- **Real services, not mocks.** If production talks to Postgres or Redis, CI runs Postgres or Redis as service containers, the same images developers run locally from `compose.yml`. Parity means a green build means something.
- **Required checks.** Branch protection lists the checks that must pass before a merge. A check that isn't required eventually gets ignored.

## Secure

- **Least privilege.** Workflows default to `permissions: contents: read` and request more per job, only when a step needs it.
- **Pin third-party actions to a full commit SHA,** with the version in a comment. Tags can be moved. See [Dependency Management](/docs/dependencies).
- **No secrets in pull requests from forks.** Jobs that need secrets run only on trusted events.
- **Secrets come from the platform's secret store,** scoped to the environment that needs them. See [Configuration & Secrets](/docs/configuration).

## What CI Is Not

CI tells you a change is safe to ship. It doesn't ship it. What happens after green is [Continuous Deployment](/docs/continuous-deployment).

## This Site

[syntaqx.com's pipeline](https://github.com/syntaqx/syntaqx.com/blob/main/.github/workflows/ci.yml) runs lint, typecheck and test as parallel jobs. A composite setup action restores `node_modules` from a cache keyed on the lockfile, so jobs skip `npm ci` when dependencies haven't changed. The test job starts the same Redis and REST proxy containers as `compose.yml`, every action is pinned to a SHA, and superseded runs are cancelled.

## References

**Reference**

- [GitHub Actions: Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows), keying caches on the lockfile
- [GitHub Actions: About service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers), real databases in CI
- [GitHub Actions: Concurrency](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs), cancelling superseded runs
- [GitHub Actions: Creating a composite action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action), shared setup across jobs
- [GitHub: Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), least privilege and SHA pinning

**In practice**

- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html), integrate often, keep the build fast and green
- [DORA: Four keys](https://dora.dev/guides/dora-metrics-four-keys/), lead time for changes and why pipeline speed matters
