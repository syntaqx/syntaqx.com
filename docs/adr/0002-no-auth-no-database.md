# 0002. No authentication, user identity, or database

Status: Superseded by [0010](0010-datastores-allowed-no-user-identity.md)

## Context

The site was built in May 2026 with Better Auth for sign-in and Neon Postgres with Drizzle for persistence (`39dd3aa`, "auth implementation", 2026-05-11). In practice the site is a personal site: posts, projects, the playbook, and a set of stateless developer tools under `/api/v1`. None of that needs to know who a visitor is or remember anything about them.

Carrying the auth and database layer still cost something: dependency upgrades (Better Auth alone was bumped repeatedly through the summer), secrets and environment configuration, a database to keep running, and a larger security surface for no user-facing benefit.

## Decision

Remove authentication, user identity, and the database entirely (`3e7cd3d`, 2026-09-16). The site is static content plus stateless API tools.

`AGENTS.md` records the rule for anyone working in the repository: don't reintroduce auth or a database without being asked.

## Consequences

- No user data, so no privacy, retention or breach obligations for it. See [Sensitive Data](https://www.syntaqx.com/docs/sensitive-data) and [Data Retention & Deletion](https://www.syntaqx.com/docs/data-retention).
- API endpoints must be stateless. Rate limiting is in-memory per instance and resets on deploy, which is acceptable at this scale.
- Features that need state can't be added casually. [HTTP QUERY](0006-http-query-in-the-proxy.md) on `/hash` returns no stored-query `Location`, because there's nowhere to store one.
- Practices the playbook documents (API keys, idempotency keys, webhooks) are described, not implemented here. The docs say so where it matters.
