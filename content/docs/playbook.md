+++
title = "The Playbook"
description = "How to read the playbook, the principles behind every standard in it, and a map of the whole book, from HTTP fundamentals to industry volumes."
category = "Start Here"
order = 1
tags = ["architecture", "standards", "principles"]
+++

This is the playbook I bring to every team: the decisions I've already made, written down so they don't get re-argued in every new codebase. Little of it is novel. Most of it is a published standard (an RFC, a spec, a practice from Stripe, GitHub or Google) applied consistently, and the consistency is the value.

Each doc makes its own case: the problem, the default, why it beats the alternatives, and what it costs. The sources at the bottom are evidence and further reading, not the argument. If a default can't be defended without "because Stripe does it", it doesn't belong here.

Defaults can be overridden, but an override is a decision, and it gets written down ([Decisions & Design Docs](/docs/engineering/design-docs)). Where this site departs from its own playbook, the departure is an [ADR](https://github.com/syntaqx/syntaqx.com/tree/main/docs/adr); everywhere else, the playbook is the explanation. CI fails any doc that drops its references, links to a doc that doesn't exist, or wraps JSON in an envelope.

## How to Read It

It reads front to back. The sections run from how HTTP and APIs work, through building and protecting the system and the money it moves, to how the work ships, how it runs, and how the team behind it grows. Industry volumes come last: payments, then field operations. Every doc links to the one before and after it.

It also reads by chapter. Each doc stands on its own and links back to anything it builds on, so you can start wherever your problem is.

## Principles

The rest of the playbook is built from these.

1. **Standards before inventions.** If an RFC, a spec or a widely adopted practice already solves it, use that: `Link` for pagination, RFC 3339 for time, `Idempotency-Key`, `RateLimit`, `Deprecation` and `Sunset`, `QUERY`. A standard arrives with documentation, client libraries and engineers who already know it. An invention has to earn its place.
2. **HTTP means what it says.** Methods carry intent, status codes carry outcome, headers carry metadata. Bodies carry resources: a list is an array, a single resource is an object, and there are no `data` envelopes.
3. **Make the wrong thing hard.** Money is an integer, so it can't drift. State transitions are guarded in the database. Method overrides can only become `QUERY`. A guardrail beats a guideline.
4. **Everything retries, so everything is idempotent.** Networks fail after the work is done. Keys, dedupe and at-least-once handling are designed in from the start, not added after the first double charge.
5. **Nothing is rewritten.** Financial records, events, decisions and incidents are appended, corrected with new entries, and kept explainable.
6. **Change is additive.** APIs, schemas and events grow without breaking anyone. Breaking changes ship as new versions with a dated, announced sunset.
7. **Observable by default.** Every request has an ID, every log line is structured, every service has an SLO. If you can't see it, you can't own it.
8. **Small, reversible steps.** Small PRs, expand-and-contract migrations, flags and progressive rollouts. The cost of a mistake is how hard it is to undo.

## The Map

| Section | What it's for | Chapters |
| ------- | ------------- | -------- |
| **Fundamentals** | The shared vocabulary everything else assumes | [REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs), [Time & Date Formats](/docs/fundamentals/time), [Identifier Conventions](/docs/fundamentals/identifier-conventions), [Addresses & Geocoding](/docs/fundamentals/addresses) |
| **API Design** | The shape of an API before any endpoint exists | [Principles](/docs/api-design/principles), [Naming](/docs/api-design/naming-conventions), [Relationships & Expansion](/docs/api-design/resource-relationships), [Authentication](/docs/api-design/authentication), [Versioning](/docs/api-design/versioning), [API Styles](/docs/api-design/api-styles), [GraphQL](/docs/api-design/graphql), [SDK Design](/docs/api-design/sdk-design), [Webhooks](/docs/api-design/webhooks) |
| **Requests & Responses** | What crosses the wire, request by request | [JSON Fields](/docs/requests/json-conventions), [Errors](/docs/requests/error-responses), [Pagination](/docs/requests/pagination), [Filtering & Sorting](/docs/requests/filtering-and-sorting), [HTTP QUERY](/docs/requests/http-query), [Caching](/docs/requests/caching), [Rate Limiting](/docs/requests/rate-limiting), [Long-Running Operations](/docs/requests/long-running-operations), [Bulk Operations](/docs/requests/bulk-operations) |
| **Architecture** | How services divide the work and talk to each other | [Service Boundaries](/docs/architecture/service-boundaries), [Events](/docs/architecture/events), [Background Jobs](/docs/architecture/background-jobs), [Retries & Timeouts](/docs/architecture/retries-and-timeouts), [Application Caching](/docs/architecture/application-caching), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Data Retention](/docs/architecture/data-retention), [Data Pipelines](/docs/architecture/data-pipelines), [Audit Trails](/docs/architecture/audit-trails), [Notifications & Consent](/docs/architecture/notifications), [AI Agents in the Product](/docs/architecture/ai-agents), [Matching & Merging](/docs/architecture/record-linkage), [Offline-First Sync](/docs/architecture/offline-sync), [Rules as Data](/docs/architecture/rules-as-data) |
| **Database** | Schemas, queries and changes that hold up under load | [Naming](/docs/database/naming-conventions), [Transactions & Concurrency](/docs/database/transactions-and-concurrency), [Performance](/docs/database/performance), [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations), [Effective Dating & History](/docs/database/temporal-data) |
| **Frontend** | Interfaces that work for everyone, fast | [Accessibility](/docs/frontend/accessibility), [Web Performance](/docs/frontend/web-performance), [Design Tokens](/docs/frontend/design-tokens), [Forms & Validation](/docs/frontend/forms), [Error & Empty States](/docs/frontend/error-states), [Internationalization](/docs/frontend/internationalization) |
| **Security** | Deciding what to defend, then defending it | [Threat Modeling](/docs/security/threat-modeling), [Authentication & Sessions](/docs/security/authentication), [Choosing an Identity Provider](/docs/security/identity-providers), [SSO & Identity Federation](/docs/security/sso-and-federation), [Authorization](/docs/security/authorization), [API Security](/docs/security/api-security), [Security Headers & CSP](/docs/security/security-headers), [Vulnerability Management](/docs/security/vulnerability-management), [AI & LLM Security](/docs/security/ai-security), [Support Access & Internal Tools](/docs/security/support-access) |
| **Payments** | The engineering of money, for anyone who handles it | [Money](/docs/payments/money), [Idempotency](/docs/payments/idempotency), [Payment States & Ledgers](/docs/payments/payment-states), [Multi-Currency & FX](/docs/payments/multi-currency), [Sensitive Data](/docs/payments/sensitive-data), [Subscriptions & Recurring Billing](/docs/payments/subscriptions), [Sales Tax & VAT](/docs/payments/sales-tax) |
| **Compliance** | The frameworks auditors and regulators hold you to, and what meeting them takes | [PCI DSS](/docs/compliance/pci-dss), [SOC 2](/docs/compliance/soc-2), [GDPR & Privacy](/docs/compliance/gdpr), [HIPAA](/docs/compliance/hipaa), [Calls, Texts & Email](/docs/compliance/consumer-contact), [Electronic Signatures & Records](/docs/compliance/electronic-signatures) |
| **Engineering Practice** | How code gets decided, written, reviewed and kept healthy | [Decisions & Design Docs](/docs/engineering/design-docs), [Commits & Review](/docs/engineering/commits-and-reviews), [Code Ownership](/docs/engineering/code-ownership), [Testing](/docs/engineering/testing), [Dependencies & Upgrades](/docs/engineering/dependencies), [Tech Debt](/docs/engineering/tech-debt), [AI-Assisted Development](/docs/engineering/ai-assisted-development) |
| **Delivery** | Getting a change from merge to production safely | [CI & Continuous Deployment](/docs/delivery/ci-pipelines), [Feature Flags](/docs/delivery/feature-flags), [Deployment Strategies](/docs/delivery/deployment-strategies), [Containers](/docs/delivery/containers), [Infrastructure as Code](/docs/delivery/infrastructure-as-code), [Mobile Releases](/docs/delivery/mobile-releases) |
| **Operations** | Running it, seeing it, and recovering when it breaks | [Environments & Configuration](/docs/operations/environments), [Observability](/docs/operations/observability), [SLOs](/docs/operations/slos), [On-Call](/docs/operations/on-call), [Incidents & Postmortems](/docs/operations/incident-response), [Disaster Recovery](/docs/operations/disaster-recovery), [Load Testing](/docs/operations/load-testing), [Kubernetes](/docs/operations/kubernetes), [Cost & FinOps](/docs/operations/cost-and-finops) |
| **Leadership** | Hiring, growing and organizing the people who do all of this | [Hiring & Interviews](/docs/leadership/hiring), [Onboarding](/docs/leadership/onboarding), [1:1s & Feedback](/docs/leadership/one-on-ones), [Career Ladders](/docs/leadership/career-ladders), [Performance Reviews](/docs/leadership/performance-reviews), [Team Structure](/docs/leadership/team-structure), [Growing Managers](/docs/leadership/growing-managers) |

### Industries

The core of the book applies anywhere. Each industry volume shows how one industry's networks, rules and economics shape the engineering.

| Volume | What it's for | Chapters |
| ------ | ------------- | -------- |
| **Payments Industry** | How money moves through networks, banks and platforms, and what building on them takes | [How Card Payments Work](/docs/industries/payments/card-payments), [Card-Present Payments](/docs/industries/payments/card-present), [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing), [ACH & Bank Transfers](/docs/industries/payments/ach), [Accepting Checks](/docs/industries/payments/checks), [Cash Payments](/docs/industries/payments/cash-payments), [Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods), [Comparing the Rails](/docs/industries/payments/comparing-the-rails), [The Payments Rulebook](/docs/industries/payments/payments-rulebook), [Surcharging & Fees](/docs/industries/payments/surcharging-and-fees), [Payments in Canada](/docs/industries/payments/canada), [Merchant Onboarding](/docs/industries/payments/merchant-onboarding), [Designing the Payments API](/docs/industries/payments/payments-api), [Strong Customer Authentication & 3-D Secure](/docs/industries/payments/strong-customer-authentication), [Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials), [Phone Payments](/docs/industries/payments/phone-payments), [Fraud & Risk](/docs/industries/payments/fraud-and-risk), [Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks), [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement), [Treasury & Bank Operations](/docs/industries/payments/treasury), [Vendor Payouts](/docs/industries/payments/vendor-payouts), [Payments for Software Platforms](/docs/industries/payments/software-platforms), [Processor Routing](/docs/industries/payments/processor-routing), [Running a Card Vault](/docs/industries/payments/card-vault), [HSMs & Key Management](/docs/industries/payments/key-management), [Inside a Processor](/docs/industries/payments/inside-a-processor), [Network Certification](/docs/industries/payments/network-certification), [Operating the Platform](/docs/industries/payments/operating-the-platform), [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider), [Payments Glossary](/docs/industries/payments/glossary) |
| **Field Operations Industry** | How businesses that send people and trucks to customers work, and how to build the platform that runs them | [The Field Operations Business](/docs/industries/field-operations/field-operations-business), [The Software Landscape](/docs/industries/field-operations/software-landscape), [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties), [Service Agreements & Plans](/docs/industries/field-operations/service-agreements), [Repair, Install & Commercial Work](/docs/industries/field-operations/repair-and-installation), [Recurring Schedules](/docs/industries/field-operations/recurring-schedules), [Territories & Capacity](/docs/industries/field-operations/territories-and-capacity), [Booking Appointments](/docs/industries/field-operations/booking-appointments), [Route Optimization](/docs/industries/field-operations/route-optimization), [Dispatch & the Day of Service](/docs/industries/field-operations/dispatch), [The Technician App](/docs/industries/field-operations/technician-app), [Proof of Service](/docs/industries/field-operations/proof-of-service), [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety), [Regulated Materials](/docs/industries/field-operations/regulated-materials), [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits), [Consumer Protection](/docs/industries/field-operations/consumer-protection), [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records), [Door-to-Door Sales](/docs/industries/field-operations/door-to-door-sales), [Pricing & Sales Rules](/docs/industries/field-operations/pricing-and-sales-rules), [Signing the Agreement](/docs/industries/field-operations/signing-the-agreement), [Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions), [Customer Communications](/docs/industries/field-operations/customer-communications), [Customer Self-Service](/docs/industries/field-operations/customer-self-service), [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service), [Collections & Retention](/docs/industries/field-operations/collections-and-retention), [Platform Architecture](/docs/industries/field-operations/platform-architecture), [AI in Field Operations](/docs/industries/field-operations/ai-in-field-operations), [Operating Metrics](/docs/industries/field-operations/operating-metrics), [Switching Platforms](/docs/industries/field-operations/switching-platforms), [Field Operations Glossary](/docs/industries/field-operations/glossary) |

## Where to Start

- **Designing an API?** [API Design Principles](/docs/api-design/principles), then [Errors](/docs/requests/error-responses), [Pagination](/docs/requests/pagination) and [Versioning](/docs/api-design/versioning).
- **Moving money?** [Money](/docs/payments/money) and [Idempotency](/docs/payments/idempotency) before writing a line of code.
- **Building payments into a product?** [How Card Payments Work](/docs/industries/payments/card-payments), [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) and [Payments for Software Platforms](/docs/industries/payments/software-platforms).
- **Running a business that sends people to customers?** [The Field Operations Business](/docs/industries/field-operations/field-operations-business), then [Route Optimization](/docs/industries/field-operations/route-optimization) and [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service).
- **Building for any industry?** [Audit Trails](/docs/architecture/audit-trails), [Notifications & Consent](/docs/architecture/notifications) and [Rules as Data](/docs/architecture/rules-as-data) come up in every volume.
- **Splitting a system?** [Service Boundaries](/docs/architecture/service-boundaries) and [Events](/docs/architecture/events).
- **Running it in production?** [Observability](/docs/operations/observability), [SLOs](/docs/operations/slos) and [Incidents & Postmortems](/docs/operations/incident-response).

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
