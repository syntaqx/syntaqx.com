+++
title = "The Playbook"
description = "The principles behind every standard here, and a map of the whole playbook: API design, HTTP semantics, payments, architecture, operations and delivery."
category = "Start Here"
order = -2
tags = ["architecture", "standards", "principles"]
+++

This is the playbook I bring to every team: the decisions I've already made, written down, so they don't have to be re-argued in every new codebase. None of it is novel. Most of it is a published standard (an RFC, a spec, a practice from Stripe, GitHub or Google) applied consistently. The value is in the consistency.

Every doc states a default. Defaults can be overridden, but the override is a decision, and it gets written down ([Design Docs & ADRs](/docs/design-docs)).

## Principles

These are the rules the rest of the playbook is built from.

1. **Standards before inventions.** If an RFC, a spec, or a widely adopted practice already solves it, use that. `Link` for pagination, RFC 3339 for time, `Idempotency-Key`, `RateLimit`, `Deprecation` and `Sunset`, `QUERY`. A custom convention has to earn its place.
2. **HTTP means what it says.** Methods carry intent, status codes carry outcome, headers carry metadata. Bodies carry resources: a list is an array, a single resource is an object, and there are no `data` envelopes.
3. **Make the wrong thing hard.** Money is an integer, so it can't drift. State transitions are guarded in the database. Method overrides can only become `QUERY`. A guardrail beats a guideline.
4. **Everything retries, so everything is idempotent.** Networks fail after the work is done. Keys, dedupe and at-least-once handling are designed in from the start, not added after the first double charge.
5. **Nothing is rewritten.** Financial records, events, decisions and incidents are appended, corrected with new entries, and kept explainable.
6. **Change is additive.** APIs, schemas and events grow without breaking anyone. Breaking changes ship as new versions with a dated, announced sunset.
7. **Observable by default.** Every request has an ID, every log line is structured, every service has an SLO. If you can't see it, you can't own it.
8. **Small, reversible steps.** Small PRs, expand-and-contract migrations, flags and progressive rollouts. The cost of a mistake is how hard it is to undo.

## The Map

| Area | What it covers |
| ---- | -------------- |
| **Fundamentals** | [REST & HTTP Verbs](/docs/rest-http-verbs), [Time & Date Formats](/docs/time), [Identifier Conventions](/docs/identifier-conventions) |
| **API Design** | [Principles](/docs/api-design-principles), [Naming](/docs/naming-conventions), [Relationships](/docs/resource-relationships), [Authentication](/docs/api-authentication) |
| **Requests & Responses** | [Errors](/docs/error-responses), [JSON Fields](/docs/json-conventions), [Pagination](/docs/pagination), [Filtering & Sorting](/docs/filtering-and-sorting), [HTTP QUERY](/docs/http-query), [Expanding](/docs/expanding-responses), [Caching](/docs/caching), [Long-Running Operations](/docs/long-running-operations), [Bulk Operations](/docs/bulk-operations) |
| **Operations** | [Rate Limiting](/docs/rate-limiting), [Versioning](/docs/versioning), [Retries & Timeouts](/docs/retries-and-timeouts), [Observability](/docs/observability), [SLOs](/docs/slos), [On-Call](/docs/on-call), [Configuration & Secrets](/docs/configuration) |
| **Payments** | [Money](/docs/money), [Idempotency](/docs/idempotency), [Payment States & Ledgers](/docs/payment-states), [Webhooks](/docs/webhooks), [Sensitive Data](/docs/sensitive-data) |
| **Architecture** | [Service Boundaries](/docs/service-boundaries), [Events](/docs/events), [Multi-Tenancy](/docs/multi-tenancy), [Data Retention](/docs/data-retention) |
| **Database** | [Naming](/docs/database-naming-conventions), [Zero-Downtime Migrations](/docs/zero-downtime-migrations) |
| **Engineering Practice** | [Design Docs & ADRs](/docs/design-docs), [Commits & Review](/docs/commits-and-reviews), [Testing](/docs/testing), [Feature Flags](/docs/feature-flags), [Dependencies](/docs/dependencies), [Postmortems](/docs/postmortems) |

## Where to Start

- **Designing an API?** [API Design Principles](/docs/api-design-principles), then [Errors](/docs/error-responses), [Pagination](/docs/pagination) and [Versioning](/docs/versioning).
- **Moving money?** [Money](/docs/money) and [Idempotency](/docs/idempotency) before writing a line of code.
- **Splitting a system?** [Service Boundaries](/docs/service-boundaries) and [Events](/docs/events).
- **Running it in production?** [Observability](/docs/observability), [SLOs](/docs/slos) and [Postmortems](/docs/postmortems).
