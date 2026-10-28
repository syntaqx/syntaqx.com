+++
title = "Test Data & Environments"
description = "Where tests run and why shared staging decays, seeding, synthetic data over production copies, third-party sandboxes, isolation, and test accounts in prod."
category = "Quality"
order = 1056
tags = ["quality", "testing", "test-data", "environments"]
+++

A test is only as trustworthy as the place it runs and the data it runs against. Most "works in CI, fails in staging" stories are really about one of the two: an environment nobody owns that drifted, or data that some earlier test, person or migration left in a state no one expected. This doc covers where tests run and what they run against. What each environment is for, configuration and parity live in [Environments & Configuration](/docs/operations/environments).

## Where Tests Run

| Environment | Cost | Fidelity | Isolation | Use it for |
| ----------- | ---- | -------- | --------- | ---------- |
| Local | Free | Real dependencies in containers, fake third parties | Total, one developer | Unit and integration tests on every save |
| CI | Per run, minutes | Same containers as local, clean every run | Per job, per worker | The required suite on every pull request |
| Ephemeral preview | Per pull request, torn down on merge | Deployed build, real infrastructure, sandboxed third parties | Per pull request | End-to-end checks, review, exploratory sessions |
| Shared staging | Always on, grows over time | Close to production on day one, drifting after | None, everyone at once | Questions previews can't answer |
| Pre-prod at production scale | Expensive, often on demand | Production sizes, limits and data volume | Scheduled, one user at a time | [Load tests](/docs/quality/load-testing), migration rehearsals, partner certification |
| Production | Already paid for | Total | Test accounts only | Synthetic monitoring and post-deploy smoke checks |

My default: **local and CI for the suite, an ephemeral environment per pull request for anything deployed, and a production-like pre-prod only where a specific question needs one.** No long-lived shared staging unless something forces it.

## Why Shared Staging Decays

A shared, long-lived staging environment starts as a copy of production and becomes its own thing within weeks.

- **Drift.** Someone changes a setting to unblock a test, a hotfix goes to production but not staging, a migration is applied by hand. Nobody records it, and staging stops predicting production in ways nobody can list.
- **Contention.** Two teams deploy their branches to the one environment, and each breaks the other's test. "Who's on staging?" becomes a chat channel, then a booking spreadsheet, then a queue that slows every release.
- **Data rot.** Months of manual testing leave half-finished orders, users in impossible states, and fixtures that reference rows someone deleted. Tests start failing on data, not code, and the fix becomes "reset staging", which breaks everyone else.
- **False confidence.** Green on staging means green against a system that doesn't exist anywhere else.

Per-pull-request environments fix all four by construction: built from the branch, seeded from scratch, owned by one change, deleted on merge. Database branching makes this cheap for the data layer; [Neon](https://neon.com/docs/introduction/branching), for example, creates copy-on-write branches that can expire automatically. When staging must exist (a partner sandbox that accepts one fixed callback URL, a hardware integration), treat it like production: deployed only by the pipeline, configuration in code, and rebuilt from scratch on a schedule so drift can't accumulate.

## Seeding

Every environment, from a laptop to a preview, gets its data the same way: **schema from migrations, data from a seed script**, both versioned in the repository. Never from a dump someone made once.

- **Migrations create structure,** and the same migrations run in every environment, so a preview that seeds cleanly is evidence the migration works.
- **One seed command** creates a realistic baseline: a few tenants, users in each role, records in each interesting state (a paid order, a refunded one, a disputed one). Idempotent, so rerunning it is safe.
- **Deterministic IDs and builders** so failures reproduce. Stable UUIDs, an injected clock and per-test builders are covered in [Deterministic Fixtures](/docs/quality/testing#deterministic-fixtures); the seed script uses the same factories the tests do, so there's one definition of a valid order.
- **Volume on demand.** The default seed is small and fast. A flag scales it to production volumes for performance work, because queries that are instant on a thousand rows aren't on a hundred million.

## Synthetic Data, Not Production Copies

Copying production into a test environment moves real people's data somewhere with weaker access controls, more people, more tools and less logging. Under the [GDPR](/docs/compliance/gdpr) it's still processing of personal data, needs a lawful basis and a purpose, and a leak from staging is a breach like any other.

"Masked" copies are weaker than they sound. [Recital 26](https://gdpr-info.eu/recitals/no-26/) says pseudonymised data that could be attributed to a person with additional information is information on an identifiable person, and the [EDPB's pseudonymisation guidelines](https://www.edpb.europa.eu/our-work-tools/documents/public-consultations/2025/guidelines-012025-pseudonymisation_en) repeat that it remains personal data. Replacing names and emails while keeping addresses, dates of birth, order histories and free-text notes leaves records that are easy to re-identify, and the team doing the copying holds the originals anyway. Only data that's genuinely anonymous falls outside the GDPR, and getting there is much harder than hashing a few columns. The same reasoning applies to analytics: see [Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous).

My rule: **test data is synthetic.** Generate it from the same factories the tests use, shaped by what production looks like (distributions, volumes, the odd edge cases support keeps seeing), never derived from production rows. When a production bug needs production-shaped data to reproduce, write a builder for that shape and add it to the seed, which also leaves a regression test behind.

When a copy is truly unavoidable (a data migration rehearsal on real volumes, say):

- **Subset first.** A referentially intact slice (a sample of tenants and everything they own) is smaller, faster and exposes less than a full copy.
- **Anonymize in production,** before the data leaves, never after it lands somewhere weaker.
- **Treat the result as production:** same access controls, same retention, deleted when the rehearsal ends, and an entry in the record of processing.

## Third-Party Sandboxes

Anything that moves money, sends a message or calls a partner needs a test mode, and every environment except production uses it.

- **Payments.** Processors ship sandboxes with test keys and test card numbers for specific outcomes. [Stripe's](https://docs.stripe.com/testing), for example, has cards that succeed, decline with a given code, or require 3D Secure, and its terms prohibit testing in live mode with real card details. Seed scripts use the outcome cards, so every decline path is reachable in a preview.
- **Email.** Point SMTP at a sink. [Mailpit](https://mailpit.axllent.org/) captures every message, shows it in a web UI and exposes an API, so end-to-end tests can read the password-reset link out of the email instead of mocking it.
- **SMS and voice.** [Twilio's test credentials](https://www.twilio.com/docs/iam/test-credentials) don't charge the account or reach real phones, and magic numbers trigger specific success and error cases.
- **No sandbox at all.** Some partners don't have one, or have one that's down half the time. Put an adapter in front of the integration with a fake implementation for local and CI, and keep a small set of contract tests that run against the real sandbox on a schedule, not on every pull request.

Make the wrong combination impossible, not just unlikely: config validation fails at boot if a non-production environment holds a live key, and if production holds a test key.

## Virtualizing the Edge

Your own dependencies (database, cache, queue) run for real in tests, per [Real Dependencies Over Mocks](/docs/quality/testing#real-dependencies-over-mocks). Third-party HTTP APIs get virtualized at the network edge with a stub server such as [WireMock](https://wiremock.org/docs/), which can record real sandbox responses for playback and inject latency and faults. Recordings beat hand-written stubs because they start from what the vendor actually returns; refresh them on a schedule, or they quietly encode last year's API.

## Isolation and Reset

Every test run starts from a known state and can't see another run's data.

- **Per test:** wrap each test in a transaction and roll it back. Fastest, and enough for most integration tests.
- **Per worker:** parallel workers each get their own schema or database. In Postgres, `CREATE DATABASE ... TEMPLATE` [copies a migrated, seeded template](https://www.postgresql.org/docs/current/manage-ag-templatedbs.html) in one statement, much faster than rerunning migrations, as long as nothing is connected to the template during the copy.
- **Per tenant:** in a [multi-tenant](/docs/architecture/multi-tenancy) system, give each worker or each end-to-end test its own freshly created tenant. Tests can run in parallel against one deployed environment, and every run doubles as an isolation check.
- **Unique everything else.** Emails, usernames and external IDs carry a run or worker suffix, so two runs never collide on a unique constraint in a shared sandbox.
- **Clean up by expiry, not by hope.** Tests that create data in long-lived places (a sandbox account, a preview) tag it with a run ID and a creation time, and a scheduled job deletes anything old. Teardown steps don't run when a test crashes.

## Test Accounts in Production

[Synthetic monitoring](/docs/quality/release-readiness#testing-in-production-safely) needs to run real journeys in production: sign in, search, check out. That means test accounts in production, and they have to stay out of everything that counts.

- **Flag them in the data,** a dedicated internal tenant or an `is_test` attribute on the account, set at creation and impossible to set from the public API.
- **Exclude them at the source.** Product analytics, revenue reports, [experiments](/docs/telemetry/experimentation) and usage-based billing filter on the flag, and the dashboards say so. Excluding them in every query by hand is how one gets missed.
- **Keep money out of it.** Synthetic checks stop before capture, or run on a dedicated internal payment method with an automatic refund and an accounting code that keeps it out of revenue.
- **Least privilege.** Test accounts are ordinary users with ordinary permissions, never admins, and their credentials are secrets like any other.
- **Make their traffic visible.** Tag requests from synthetic checks (a header or user agent) so [observability](/docs/observability/frontend-and-synthetic) can split them out, and so an alert on synthetic failure isn't diluted by real traffic.

## Secrets for Test Environments

Test environments have credentials too: sandbox API keys, test-account passwords, preview database URLs. They follow the same rules as production ([Secrets](/docs/operations/environments#secrets)), with two additions:

- **Separate credentials per environment,** never production's. A leaked preview key should reach only a sandbox.
- **Scoped to the pipeline.** Previews from forks or untrusted branches don't get secrets at all, so a malicious pull request can't print them in a build log ([CI & Continuous Deployment](/docs/delivery/ci-pipelines#secure)).

## References

**Specifications**

- [GDPR Recital 26](https://gdpr-info.eu/recitals/no-26/), pseudonymised data is information on an identifiable person; anonymous data is out of scope
- [EDPB Guidelines 01/2025 on Pseudonymisation](https://www.edpb.europa.eu/our-work-tools/documents/public-consultations/2025/guidelines-012025-pseudonymisation_en), pseudonymised data remains personal data (version for public consultation)

**Reference**

- [PostgreSQL: Template Databases](https://www.postgresql.org/docs/current/manage-ag-templatedbs.html), cloning a seeded database per worker
- [Neon: Branching](https://neon.com/docs/introduction/branching), copy-on-write database branches per preview
- [Stripe: Testing](https://docs.stripe.com/testing), sandboxes and test cards for each outcome
- [Twilio: Test Credentials](https://www.twilio.com/docs/iam/test-credentials), SMS and calls without charges or real phones
- [Mailpit](https://mailpit.axllent.org/), an SMTP sink with a web UI and API
- [WireMock](https://wiremock.org/docs/), stubbing third-party APIs with record, playback and fault injection
