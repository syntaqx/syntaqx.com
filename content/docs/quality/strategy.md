+++
title = "Quality Strategy"
description = "What quality means, why it's the whole team's job and not a gate, what quality engineers are for, shift-left and shift-right, and risk-based test depth."
category = "Quality"
order = 1051
tags = ["quality", "testing", "process", "risk"]
+++

Quality isn't the absence of bugs. It's fitness for purpose: the software does what the people relying on it need, reliably enough, fast enough, safely enough, and keeps doing it as it changes. Jerry Weinberg put it as "value to some person", and the useful part of that definition is the question it forces: which person, and what do they value? A payments ledger and a marketing page have different answers, so they get different amounts of testing.

A quality strategy is the set of decisions about where to spend effort so the answer stays true. This doc is the map; the rest of the section has the detail.

## Whole Team, Not a Gate

The traditional model puts quality at the end: developers build, a QA team tests, and a release ships when QA signs off. It fails in predictable ways.

- **Feedback arrives late.** A defect found a week after the code was written costs a context switch, a re-read and a re-test. Found in review or by a unit test, it costs minutes.
- **Responsibility moves.** When someone downstream is paid to find bugs, the people writing the code stop looking for them. "QA will catch it" is a design decision nobody admits to making.
- **The gate becomes the bottleneck.** Testing a batch of changes at the end means batching changes, which means bigger releases, which means more to test. It's the opposite of [deploying every merge](/docs/delivery/ci-pipelines#delivery-vs-deployment).
- **Testers can only check what they can see.** A tester at the end sees the UI. They can't see the missing database constraint, the retry without an [idempotency key](/docs/payments/idempotency), or the race that shows up once in fifty runs.

My rule: **the team that writes the code owns its quality**, including the tests, the release decision and what happens in production. Nobody downstream signs off. Quality specialists, where they exist, make the team better at it; they don't do it for them.

## What Quality Engineers Are For

Dedicated QA engineers, SDETs and quality engineers earn their place when they do the things a feature team doesn't do well on its own:

- **Risk analysis.** Looking at a design and asking what breaks: the edge cases, the failure modes, the user who does it in the wrong order. This is most valuable before the code exists.
- **Exploratory testing.** Skilled, structured investigation of a running system to find what nobody wrote a test for. See [Manual & Exploratory Testing](/docs/quality/exploratory-testing).
- **Tooling and infrastructure.** Test harnesses, [test data and environments](/docs/quality/test-data), device labs, visual diffing, flake tracking: shared things every team needs and no single team builds well.
- **Coaching.** Teaching developers to write tests that catch bugs rather than tests that execute lines, and reviewing test plans the way a senior engineer reviews code.

What they shouldn't be is the team's manual regression suite. A person re-running the same checklist every release is a script that hasn't been written yet.

| Shape | How it works | Good at | Watch for |
| ----- | ------------ | ------- | --------- |
| **Embedded** | A quality engineer sits in a product team | Context, early risk analysis, fast feedback | Becoming the team's tester; isolation from other QEs |
| **Central** | A quality team serves many product teams | Shared tooling, consistent practice, platform work | Becoming a gate; distance from the code |
| **None** | Developers own all of it | No handoffs, full ownership | Nobody with exploratory or tooling depth; testing only what's easy |

My default: **embedded quality engineers with a small central group for shared tooling**, and a ratio low enough that the embedded engineer can't become the tester for everyone. With no specialists at all, make exploratory testing and test tooling someone's named, scheduled responsibility, or neither will happen.

## Shift Left and Shift Right

Both terms describe moving quality work away from the single gate before release. They're complements, not rivals.

**Shift left** catches defects earlier, where they're cheaper:

- **Testability in design.** Logic extracted into plain functions, dependencies injected, a clock you can control. Untestable code is a design defect, and it produces the [ice-cream cone](/docs/quality/testing#where-the-pyramid-goes-wrong).
- **Static analysis.** Types, linters and security scanners on every change, before a human looks.
- **Review.** A [reviewer](/docs/engineering/commits-and-reviews#reviewing) checks that the tests cover the risk, not just that tests exist.
- **Tests with the code.** In the same pull request, never "in a follow-up".

**Shift right** accepts that production is the only environment that's really production, and tests there safely:

- **Observability.** Errors, latency and business events watched per release. See [Observability](/docs/observability/overview).
- **Canaries.** A small slice of traffic on the new version, [judged automatically](/docs/delivery/deployment-strategies#let-the-canary-be-judged-automatically).
- **Feature flags.** Code deployed dark, released gradually, and turned off in seconds. See [Feature Flags](/docs/delivery/feature-flags).
- **Experiments.** Measuring whether a change made things better, with [guardrail metrics](/docs/telemetry/experimentation#guardrail-metrics) that catch the ones that made things worse.

Shift left finds the defects you can anticipate. Shift right finds the ones you can't, and limits how many users meet them. A team doing only the first ships surprises to everyone at once; a team doing only the second uses customers as its test suite.

## Risk-Based Testing

Not everything deserves the same depth. Testing effort should follow risk: how likely a change is to break something, times how bad it is if it does.

- **Likelihood** goes up with complexity, churn, new technology, unclear requirements, many integrations, and code nobody on the team wrote.
- **Impact** goes up with money, data loss or corruption, security and privacy, legal exposure, the number of users affected, and how hard the damage is to undo.

My tiers, decided per feature or component and written down where the team can see them (the [service catalog](/docs/engineering/code-ownership#the-service-catalog) is a good home):

| Tier | Examples | What it gets |
| ---- | -------- | ------------ |
| **Critical** | Money movement, auth, data deletion, anything irreversible | Unit tests on every rule and transition, integration tests on every failure path, contract tests, exploratory session before release, canary with automatic rollback, a named reviewer who knows the domain |
| **High** | Core user journeys, public APIs, data migrations | Unit and integration tests, an end-to-end test of the journey, contract tests at boundaries, progressive rollout behind a flag |
| **Medium** | Most product features | Unit and integration tests at the lowest level that catches the bug, standard review, standard rollout |
| **Low** | Internal tools, copy changes, easily reverted UI | Static checks and the tests that are cheap to write; rely on review and fast rollback |

Two rules keep this honest. **Tiers are about impact, not effort**: a change being small doesn't make it low risk if it touches money. And **a change takes the tier of the riskiest thing it touches**, so a "simple" refactor of a payment path is critical.

## The Testing Quadrants

Brian Marick's agile testing matrix, later refined into four quadrants by Lisa Crispin and Janet Gregory, sorts tests on two axes: whether a test faces the business or the technology, and whether it supports the team while building or critiques the finished product. It's useful as a checklist for gaps, because most teams over-invest in one quadrant and forget another exists. Crispin is explicit that the numbering implies no order.

| | Supports the team | Critiques the product |
| --- | --- | --- |
| **Business facing** | Q2: examples and acceptance tests for stories, functional tests, prototypes | Q3: [exploratory testing](/docs/quality/exploratory-testing), usability, user acceptance, betas |
| **Technology facing** | Q1: [unit, integration and contract tests](/docs/quality/testing#test-types) | Q4: [load and performance](/docs/quality/load-testing), [security](/docs/security/vulnerability-management), [accessibility](/docs/frontend/accessibility#testing), other "-ilities" |

The left column is mostly automated and runs on every change. The right column needs judgment and usually a running system. A suite that's all Q1 is fast and green while users struggle; a team that's all Q3 finds bugs but can't change code safely.

## Where It's Covered

| Quality work | Doc |
| ------------ | --- |
| The pyramid, test types, mocks, fixtures, flaky tests | [Testing Strategy](/docs/quality/testing) |
| Frameworks, suites in CI, what to automate and what not to | [Automated Testing](/docs/quality/automated-testing) |
| Charters, sessions, heuristics, when humans beat scripts | [Manual & Exploratory Testing](/docs/quality/exploratory-testing) |
| Agents exploring in a browser, findings into tests | [AI-Assisted Testing](/docs/quality/ai-assisted-testing) |
| Synthetic data, seeding, ephemeral environments | [Test Data & Environments](/docs/quality/test-data) |
| Visual regression, browsers, devices | [Visual & Cross-Platform Testing](/docs/quality/cross-platform-testing) |
| Budgets, load shapes, capacity | [Load & Performance Testing](/docs/quality/load-testing) |
| Severity, priority, triage, bug lifecycle | [Defects & Triage](/docs/quality/defects) |
| Ship criteria, go/no-go, rollback readiness | [Release Readiness](/docs/quality/release-readiness) |
| What to measure and what not to | [Quality Metrics](/docs/quality/metrics) |
| Production signals and error budgets | [SLOs](/docs/operations/slos), [Observability](/docs/observability/overview) |
| Safe rollout | [Deployment Strategies](/docs/delivery/deployment-strategies), [Feature Flags](/docs/delivery/feature-flags) |

## References

**Reference**

- [Lisa Crispin: Agile testing quadrants](https://www.techtarget.com/searchsoftwarequality/tip/Agile-testing-quadrants-Guiding-managers-and-teams-in-test-strategies), the quadrants' origin in Marick's matrix and why the numbering implies no order
- [The Marick Test Matrix](https://the.codegardener.com/the-marick-test-matrix/), the two axes and links to Marick's original 2003 posts

**In practice**

- [Markus Gärtner: Remembering Jerry, Quality Software Management Vol. 1](https://www.goodreads.com/author_blog_posts/22976989-remembering-jerry-quality-software-management-volume-1-systems-thinki), Weinberg's definition of quality as "value to some person"
- [Rouan Wilsenach: QA in Production](https://martinfowler.com/articles/qa-in-production.html), production monitoring as a complement to pre-release testing
- [Martin Fowler: TestPyramid](https://martinfowler.com/bliki/TestPyramid.html), why most tests belong low in the stack
