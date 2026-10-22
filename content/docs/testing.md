+++
title = "Testing Strategy"
description = "What to test at each level, contract tests between services, deterministic fixtures, real databases over mocks, and a zero-tolerance policy for flaky tests."
category = "Engineering Practice"
order = 12.2
tags = ["testing", "quality", "process", "ci"]
+++

Tests exist so you can change code with confidence. A test suite that's slow, flaky, or only checks that mocks were called gives you the cost of tests without the confidence.

## The Shape

Most confidence per minute of CI comes from tests that exercise real behavior through a stable interface. The [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) shape fits service code better than a strict pyramid:

| Level | What it covers | Share |
| ----- | -------------- | ----- |
| Static | Types, linting, formatting | Everything, free |
| Unit | Pure logic: money math, state transitions, parsers | Many |
| Integration | One service end to end through its API, with a real database | The most |
| Contract | The agreement between a service and its consumers | Every boundary |
| End to end | A few critical journeys across the deployed system | A handful |

## What to Test Where

- **Unit test the logic that's easy to get wrong.** Rounding and remainder allocation from [Money & Amounts](/docs/money), every allowed and rejected transition in [Payment States](/docs/payment-states), signature verification in [Webhooks](/docs/webhooks).
- **Integration test through the HTTP interface.** Send a request, assert on the response and the resulting state. This tests routing, validation, [error format](/docs/error-responses), and the database together, which is where real bugs live.
- **Test behavior, not implementation.** A test that breaks when you rename a private function is a test of the wrong thing.
- **Test the failure paths.** Timeouts, duplicate requests, a replayed [idempotency key](/docs/idempotency), a webhook delivered twice. Payments bugs live in the unhappy paths.

## Real Dependencies Over Mocks

- **Test against real Postgres,** in a container, with migrations applied. Mocked repositories pass while the real query fails on a constraint.
- **Isolate per test** with a transaction rolled back at the end, or a fresh schema per worker for parallel runs.
- **Mock only what you don't own,** at the network edge: processors, email providers, third-party APIs. Use recorded responses or the vendor's sandbox, not hand-written guesses.

## Contract Tests

When one service calls another, each side's tests can pass while the integration breaks. Contract tests catch that.

- **Consumer-driven:** the consumer records what it relies on (endpoints, fields, status codes), and the provider's CI verifies every consumer's contract. [Pact](https://docs.pact.io/) is the common tool.
- **Schema-driven:** for public APIs, the OpenAPI document is the contract. CI fails on breaking changes to it, per [Versioning & Deprecation](/docs/versioning).
- **Events too.** Event schemas between producers and consumers are contracts. See [Events & Async Messaging](/docs/events).

## Deterministic Fixtures

Tests produce the same result every run, on every machine.

- **Stable IDs.** Derive fixture IDs with UUID v5 from readable names (`uuid5(ns, "merchant-with-expired-card")`), as described in [Identifier Conventions](/docs/identifier-conventions). Failures are reproducible and IDs are recognizable in output.
- **Controlled time.** Inject a clock. Never assert against "now". Tests for authorization expiry or [idempotency key](/docs/idempotency) retention set the clock explicitly.
- **Seeded randomness.** If a test uses random data, it logs the seed so a failure can be replayed.
- **Builders, not shared fixtures.** Each test builds the data it needs, with defaults for everything else, so one test's setup can't break another.

## Flaky Tests

A flaky test is a failing test. Teams learn to rerun red builds, and then they rerun the real failure too.

- **Quarantine within a day.** Move it out of the required suite, and open a ticket with an owner.
- **Fix or delete within a week.** A quarantined test that nobody fixes is deleted, and the gap is written down.
- **Never retry in CI to hide it.** Automatic retries turn a flaky test into a slow, silent one.

## In CI

- The full suite runs on every pull request and blocks the merge. See [Commits, PRs & Code Review](/docs/commits-and-reviews).
- Keep it under about 10 minutes. Parallelize before you start skipping.
- Coverage is a signal for finding untested code, not a target to hit. 100% coverage of the wrong assertions proves nothing.
