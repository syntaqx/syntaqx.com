+++
title = "Testing Strategy"
description = "The test pyramid and why it has that shape, what each test type covers, real databases over mocks, deterministic fixtures, and zero tolerance for flaky tests."
category = "Engineering Practice"
order = 1004
tags = ["testing", "quality", "process", "ci"]
aliases = ["testing"]
+++

Tests exist so you can change code with confidence, and everything downstream, from [code review](/docs/engineering/commits-and-reviews) to deploying every merge, leans on them. A suite that's slow, flaky, or only checks that mocks were called gives you the cost of tests without the confidence.

## The Pyramid

Tests come in layers, and every layer up costs more to write, run and keep passing, while telling you less about where the bug is. So a healthy suite is shaped like a pyramid, the shape Mike Cohn described in *Succeeding with Agile*: a broad base of unit tests, fewer integration tests above them, and a handful of end-to-end tests at the top.

![The test pyramid: static checks on everything as the foundation, then most tests as unit tests whose failures name the function and input, fewer integration tests whose failures name a service and its wiring, and a handful of end-to-end tests whose failures name only a broken journey. A ruler shows time to run rising from instant at the base to minutes at the top. Contract tests sit beside the pyramid, at every boundary.](/diagrams/test-pyramid.svg "Most tests belong at the bottom. Each level up takes longer to run and its failures say less about where the bug is, so each behavior is tested at the lowest level that can catch it.")

The shape follows from four properties that all get worse as you go up:

- **Speed is feedback.** A unit test runs in milliseconds, so thousands run on every save, while the code is still in your head. An integration test takes tens of milliseconds to seconds, and an end-to-end test seconds to minutes. The slow layers run in CI, after you've moved on, and every failure there costs a context switch.
- **Precision.** A failing unit test names the function and the input that broke it. A failing end-to-end test says "checkout is broken" and leaves you to work out which of a dozen components did it.
- **Reliability.** Each layer up adds a network, timing, shared data and an environment, and each is a source of flakes. A unit test of a pure function can't be flaky.
- **Combinatorics.** Edge cases multiply: currency, times rounding rule, times refund state. At the unit level that's a table of cases in one test. End to end, it's a full journey per combination, so in practice most combinations never get tested at all.

The rule that falls out: **test each behavior at the lowest level that can catch its bug**, and go up a level only for what the lower one can't see. A rounding error belongs in a unit test. A missing database constraint belongs in an integration test. "A customer can pay and get a receipt" belongs in one end-to-end test.

## Test Types

| Type | What it exercises | Runs in | How many |
| ---- | ----------------- | ------- | -------- |
| Static | Types, linting, formatting | Instant | Everything |
| Unit | One function or module, no I/O | Milliseconds | Most |
| Integration | One service with its real dependencies (database, cache, queue), through its API | Tens of ms to seconds | Fewer |
| Contract | The agreement between a service and its consumers | Milliseconds | Every boundary |
| End to end | Critical journeys across the deployed system, through the UI or public API | Seconds to minutes | A handful |

The names vary by team. *Functional*, *acceptance* and *behavior* tests usually mean the top of the pyramid: a feature checked from the user's side, as a black box. Behavior-driven development (given, when, then) is a way of writing tests, not a layer; it works at any level. Load and security testing sit outside the pyramid altogether, because they answer different questions: see [Load Testing](/docs/operations/load-testing) and [Vulnerability Management](/docs/security/vulnerability-management).

## Where the Pyramid Goes Wrong

The pyramid counts tests; it doesn't excuse bad ones. It fails in two familiar ways.

- **The ice-cream cone.** The inverted shape: mostly end-to-end and manual tests, few unit tests. It's slow, flaky, and every failure is an investigation. It usually means the code can't be tested in pieces, because business logic lives inside request handlers and UI components. The fix is design, pulling the logic out into plain functions, not more end-to-end tests.
- **Unit tests of wiring.** A test that mocks the database, the router and the validator, then asserts the handler called them in order, is a pyramid by count and tests nothing that can break. Most service bugs live in exactly that wiring: a route that isn't registered, a query that violates a constraint, an error mapped to the wrong status. Kent C. Dodds' [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) is a reaction to suites like that, and its point stands: wiring gets integration tests against real dependencies, never mocks.

So the base is wide because the logic is extracted and unit-testable, not because every handler has a mock-heavy test. Units for logic, integration for wiring, end to end to prove the journeys hold together.

## What to Test Where

- **Unit test the logic that's easy to get wrong.** Rounding and remainder allocation from [Money & Amounts](/docs/payments/money), every allowed and rejected transition in [Payment States](/docs/payments/payment-states), signature verification in [Webhooks](/docs/api-design/webhooks).
- **Integration test through the HTTP interface.** Send a request, assert on the response and the resulting state. This tests routing, validation, [error format](/docs/requests/error-responses), and the database together, which is where wiring bugs live.
- **Test behavior, not implementation.** A test that breaks when you rename a private function is a test of the wrong thing.
- **Test the failure paths.** Timeouts, duplicate requests, a replayed [idempotency key](/docs/payments/idempotency), a webhook delivered twice. Payments bugs live in the unhappy paths.

## Real Dependencies Over Mocks

A mock encodes your belief about how a dependency behaves. When the belief is wrong, the test is wrong in exactly the same way as the code, and both pass together.

- **Test against real Postgres,** in a container ([Testcontainers](https://testcontainers.com/), or CI service containers), with migrations applied. A mocked repository happily accepts a duplicate key that the real unique constraint rejects.
- **Isolate per test** with a transaction rolled back at the end, or a fresh schema per worker for parallel runs.
- **Mock only what you don't own,** at the network edge: processors, email providers, third-party APIs. Use recorded responses or the vendor's sandbox, not hand-written guesses.

## Contract Tests

When one service calls another, each side's tests can pass while the integration breaks. Contract tests catch that.

- **Consumer-driven:** the consumer records what it relies on (endpoints, fields, status codes), and the provider's CI verifies every consumer's contract. [Pact](https://docs.pact.io/) is the common tool.
- **Schema-driven:** for public APIs, the OpenAPI document is the contract. CI fails on breaking changes to it, per [Versioning & Deprecation](/docs/api-design/versioning).
- **Events too.** Event schemas between producers and consumers are contracts. See [Events & Async Messaging](/docs/architecture/events).

## Deterministic Fixtures

Tests produce the same result every run, on every machine.

- **Stable IDs.** Derive fixture IDs with [UUID v5](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5) from readable names (`uuid5(ns, "merchant-with-expired-card")`), as described in [Identifier Conventions](/docs/fundamentals/identifier-conventions). Failures are reproducible and IDs are recognizable in output.
- **Controlled time.** Inject a clock. Never assert against "now". Tests for authorization expiry or [idempotency key](/docs/payments/idempotency) retention set the clock explicitly.
- **Seeded randomness.** If a test uses random data, it logs the seed so a failure can be replayed.
- **Builders, not shared fixtures.** Each test builds the data it needs, with defaults for everything else, so one test's setup can't break another.

## Flaky Tests

A flaky test is a failing test. The damage isn't the one false alarm; it's what the team learns from it. Once "just rerun it" is a habit, a red build stops meaning anything, and the next real failure gets rerun until it happens to pass. Flakes are also often real bugs: a race condition that shows up in CI one time in fifty shows up in production too.

- **Quarantine within a day.** Move it out of the required suite, and open a ticket with an owner. A day is long enough to look, and short enough that nobody learns to ignore red.
- **Fix or delete within a week.** A quarantined test protects nothing, so it can't live there indefinitely. If nobody fixes it, delete it and write down the gap it leaves.
- **Never retry in CI to hide it.** Automatic retries turn a flaky test into a slow, silent one, and hide the race condition behind it.

## In CI

- The full suite runs on every pull request and blocks the merge, in under about 10 minutes. Parallelize before you start skipping. See [CI & Continuous Deployment](/docs/delivery/ci-pipelines).
- Coverage is a signal for finding untested code, not a target to hit. Make it a target and people write tests that execute lines without asserting anything; 100% coverage of the wrong assertions proves nothing.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) runs its suite with Vitest on every pull request. The API's proxy tests go through the real request handling (headers, rate limits, `QUERY` routing) rather than calling functions in isolation, and the rate limiter's integration tests run against a real Redis: `compose.yml` locally, CI service containers in the pipeline. One of those tests checks the key inside Redis itself, because an earlier version passed while silently falling back to the in-memory store. The docs have tests too: `lib/docs.test.ts` fails the build on a broken link or a missing References section.

## References

**Specifications**

- [RFC 9562: UUIDs](https://www.rfc-editor.org/rfc/rfc9562.html), name-based UUID v5 for stable fixtures

**Reference**

- [Pact Docs](https://docs.pact.io/), consumer-driven contract testing
- [Testcontainers](https://testcontainers.com/), real Postgres in tests

**In practice**

- [Martin Fowler: TestPyramid](https://martinfowler.com/bliki/TestPyramid.html), the shape and the ice-cream cone it guards against
- [Ham Vocke: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), what to test at each level
- [Kent C. Dodds: The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications), the counterpoint on mock-heavy unit tests
- [Martin Fowler: Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html), quarantining and fixing flaky tests
