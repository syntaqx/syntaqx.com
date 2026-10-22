# 0001. No authentication or user identity

Status: Accepted (2026-09-16, datastore rule added 2026-10-22)

## Context

The playbook assumes a product with accounts: [API Authentication](https://www.syntaqx.com/docs/api-design/authentication), [Multi-Tenancy](https://www.syntaqx.com/docs/architecture/multi-tenancy), [Sensitive Data](https://www.syntaqx.com/docs/payments/sensitive-data). This site started that way in May 2026, with Better Auth for sign-in and Neon Postgres with Drizzle for persistence (`39dd3aa`).

In practice it's a personal site: posts, the playbook, and a set of stateless developer tools. Nothing it does needs to know who a visitor is. The auth layer still cost something every week: dependency upgrades, secrets, a database to run, and a security surface with no user-facing benefit.

## Decision

- **No authentication, no user identity, no user data.** All of it was removed on 2026-09-16 (`3e7cd3d`).
- **Datastores are allowed when they earn their place:** managed, on a free tier, holding no personal data beyond what a feature strictly needs, and never on the critical path. If a store is down, the feature degrades and the site keeps serving. Upstash Redis for [rate limiting](https://www.syntaqx.com/docs/operations/rate-limiting) is the first, and it falls back to in-memory counting when Redis is unreachable.

## Consequences

- The playbook's identity-dependent practices (API keys, scopes, tenancy, per-user data handling) are documented here but not demonstrated. The docs say so where it matters.
- Rate-limit counters are keyed by IP address, which some jurisdictions treat as personal data. They expire within the hour and are never logged or joined to anything, in line with [Data Retention & Deletion](https://www.syntaqx.com/docs/architecture/data-retention).
- Local development needs nothing running: the rate limiter defaults to a no-op store, and `compose.yml` runs Redis when you want the real thing.
