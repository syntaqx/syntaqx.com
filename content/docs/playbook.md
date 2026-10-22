+++
title = "The Playbook"
description = "The principles behind every standard here, and a map of the whole playbook: API design, HTTP semantics, payments, architecture, operations and delivery."
category = "Start Here"
order = 1
tags = ["architecture", "standards", "principles"]
+++

This is the playbook I bring to every team: the decisions I've already made, written down, so they don't have to be re-argued in every new codebase. None of it is novel. Most of it is a published standard (an RFC, a spec, a practice from Stripe, GitHub or Google) applied consistently. The value is in the consistency.

Each doc makes its own case: the problem, the default, why it beats the alternatives, and what it costs. The sources at the bottom are the evidence and the place to dig deeper, not the argument. If a default can't be defended without "because Stripe does it", it doesn't belong here.

Every doc states a default. Defaults can be overridden, but the override is a decision, and it gets written down ([Design Docs & ADRs](/docs/engineering/design-docs)). Where this site departs from its own playbook, the departure is recorded as an [ADR](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr); everywhere else, the playbook is the explanation. CI fails any doc here that drops its references, links to a doc that doesn't exist, or wraps JSON in an envelope.

## Principles

These are the rules the rest of the playbook is built from.

1. **Standards before inventions.** If an RFC, a spec, or a widely adopted practice already solves it, use that. `Link` for pagination, RFC 3339 for time, `Idempotency-Key`, `RateLimit`, `Deprecation` and `Sunset`, `QUERY`. A standard arrives with documentation, client libraries, and engineers who already know it; an invention arrives with none of those. A custom convention has to earn its place.
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
| **Fundamentals** | [REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs), [Time & Date Formats](/docs/fundamentals/time), [Identifier Conventions](/docs/fundamentals/identifier-conventions) |
| **API Design** | [Principles](/docs/api-design/principles), [Naming](/docs/api-design/naming-conventions), [Relationships](/docs/api-design/resource-relationships), [Authentication](/docs/api-design/authentication), [API Styles](/docs/api-design/api-styles), [SDK Design](/docs/api-design/sdk-design), [GraphQL](/docs/api-design/graphql) |
| **Requests & Responses** | [Errors](/docs/requests/error-responses), [JSON Fields](/docs/requests/json-conventions), [Pagination](/docs/requests/pagination), [Filtering & Sorting](/docs/requests/filtering-and-sorting), [HTTP QUERY](/docs/requests/http-query), [Expanding](/docs/api-design/resource-relationships), [Caching](/docs/requests/caching), [Long-Running Operations](/docs/requests/long-running-operations), [Bulk Operations](/docs/requests/bulk-operations) |
| **Operations** | [Rate Limiting](/docs/requests/rate-limiting), [Versioning](/docs/api-design/versioning), [Retries & Timeouts](/docs/architecture/retries-and-timeouts), [Observability](/docs/operations/observability), [SLOs](/docs/operations/slos), [On-Call](/docs/operations/on-call), [Configuration & Secrets](/docs/operations/environments), [Incident Response](/docs/operations/incident-response), [Cost & FinOps](/docs/operations/cost-and-finops), [Environments](/docs/operations/environments), [Disaster Recovery](/docs/operations/disaster-recovery), [Load Testing](/docs/operations/load-testing), [Kubernetes](/docs/operations/kubernetes) |
| **Payments** | [Money](/docs/payments/money), [Idempotency](/docs/payments/idempotency), [Payment States & Ledgers](/docs/payments/payment-states), [Webhooks](/docs/payments/webhooks), [Sensitive Data](/docs/payments/sensitive-data), [Disputes & Chargebacks](/docs/payments/disputes-and-chargebacks), [Payouts & Settlement](/docs/payments/payouts-and-settlement), [Merchant Onboarding](/docs/payments/merchant-onboarding), [SCA & 3-D Secure](/docs/payments/strong-customer-authentication), [Fraud & Risk](/docs/payments/fraud-and-risk), [Multi-Currency & FX](/docs/payments/multi-currency), [Becoming a Payment Provider](/docs/payments/becoming-a-payment-provider) |
| **Architecture** | [Service Boundaries](/docs/architecture/service-boundaries), [Events](/docs/architecture/events), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Data Retention](/docs/architecture/data-retention), [Application Caching](/docs/architecture/application-caching), [Background Jobs](/docs/architecture/background-jobs), [Data Pipelines & Analytics](/docs/architecture/data-pipelines) |
| **Security** | [Threat Modeling](/docs/security/threat-modeling), [Authorization](/docs/security/authorization), [API Security](/docs/security/api-security), [Security Headers & CSP](/docs/security/security-headers), [Vulnerability Management](/docs/security/vulnerability-management), [AI & LLM Security](/docs/security/ai-security) |
| **Compliance** | [PCI DSS](/docs/compliance/pci-dss), [SOC 2](/docs/compliance/soc-2), [HIPAA](/docs/compliance/hipaa), [GDPR & Privacy](/docs/compliance/gdpr) |
| **Database** | [Naming](/docs/database/naming-conventions), [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations), [Performance](/docs/database/performance), [Transactions & Concurrency](/docs/database/transactions-and-concurrency) |
| **Delivery** | [CI Pipelines](/docs/delivery/ci-pipelines), [Continuous Deployment](/docs/delivery/ci-pipelines), [Deployment Strategies](/docs/delivery/deployment-strategies), [Infrastructure as Code](/docs/delivery/infrastructure-as-code), [Containers](/docs/delivery/containers), [Staying Current](/docs/engineering/dependencies), [Mobile Releases](/docs/delivery/mobile-releases) |
| **Engineering Practice** | [Design Docs & ADRs](/docs/engineering/design-docs), [Commits & Review](/docs/engineering/commits-and-reviews), [Testing](/docs/engineering/testing), [Feature Flags](/docs/delivery/feature-flags), [Dependencies](/docs/engineering/dependencies), [Postmortems](/docs/operations/incident-response), [Code Ownership](/docs/engineering/code-ownership), [Tech Debt](/docs/engineering/tech-debt), [AI-Assisted Development](/docs/engineering/ai-assisted-development) |
| **Frontend** | [Accessibility](/docs/frontend/accessibility), [Web Performance](/docs/frontend/web-performance), [Design Tokens & Theming](/docs/frontend/design-tokens), [Forms & Validation](/docs/frontend/forms), [Internationalization](/docs/frontend/internationalization), [Error & Empty States](/docs/frontend/error-states) |
| **Leadership** | [Technical Decisions](/docs/engineering/design-docs), [Hiring & Interviews](/docs/leadership/hiring), [Onboarding](/docs/leadership/onboarding), [1:1s & Feedback](/docs/leadership/one-on-ones), [Career Ladders](/docs/leadership/career-ladders), [Team Structure](/docs/leadership/team-structure), [Growing Managers](/docs/leadership/growing-managers), [Performance Reviews](/docs/leadership/performance-reviews) |

## Where to Start

- **Designing an API?** [API Design Principles](/docs/api-design/principles), then [Errors](/docs/requests/error-responses), [Pagination](/docs/requests/pagination) and [Versioning](/docs/api-design/versioning).
- **Moving money?** [Money](/docs/payments/money) and [Idempotency](/docs/payments/idempotency) before writing a line of code.
- **Splitting a system?** [Service Boundaries](/docs/architecture/service-boundaries) and [Events](/docs/architecture/events).
- **Running it in production?** [Observability](/docs/operations/observability), [SLOs](/docs/operations/slos) and [Postmortems](/docs/operations/incident-response).

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the foundation for methods, status codes and headers
- [RFC 9205: Building Protocols with HTTP](https://datatracker.ietf.org/doc/html/rfc9205), the IETF's best practice for HTTP APIs

**Reference**

- [MDN: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP), the most readable reference for every header, method and status code

**In practice**

- [Stripe: API Reference](https://docs.stripe.com/api), the benchmark for payments APIs: idempotency, expansion, versioning
- [GitHub Docs: REST API](https://docs.github.com/en/rest), unwrapped responses, `Link` pagination and conditional requests
- [Google: API Improvement Proposals](https://google.aip.dev/), design guidance written as numbered, citable decisions
- [Microsoft: Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md), long-running operations, paging and concurrency at scale
- [Zalando: RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), a public, opinionated rulebook in the same spirit
- [Heroku: HTTP API Design Guide](https://github.com/interagent/http-api-design), concise conventions from the Heroku Platform API
- [Google: Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/), SLOs, error budgets and blameless postmortems
