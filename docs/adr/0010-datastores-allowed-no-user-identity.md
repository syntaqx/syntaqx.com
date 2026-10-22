# 0010. Datastores are allowed; still no authentication or user identity

Status: Accepted (2026-10-22)

## Context

[0002](0002-no-auth-no-database.md) removed authentication, user identity and the database together, because none of them earned their cost. That reasoning still holds for auth and identity. It doesn't hold for every datastore: the API's rate limit was only per instance, so the documented 5,000 requests per hour per IP wasn't real across Vercel's serverless instances. Enforcing it needs shared state, and a free managed store provides that without the costs 0002 was avoiding.

## Decision

Supersede 0002 with a narrower rule:

- **No authentication, no user identity, no user data.** Unchanged from 0002.
- **Datastores are allowed when they earn their place:** managed, within a free tier, holding no personal data beyond what a feature strictly needs, and never on the critical path. If a store is down, the feature degrades and the site keeps serving.
- Each datastore gets its own ADR saying what it holds and how it fails. The first is Upstash Redis for rate limiting ([0011](0011-rate-limiting-in-upstash-redis.md)).

`AGENTS.md` is updated to match.

## Consequences

- The playbook's practices that need state (stored queries for [HTTP QUERY](https://www.syntaqx.com/docs/http-query), idempotency keys, webhook delivery) become possible here, each through its own ADR.
- Rate-limit counters are keyed by IP address, which is personal data in some jurisdictions. They expire within an hour and are never logged or joined to anything else, in line with [Data Retention & Deletion](https://www.syntaqx.com/docs/data-retention).
- Local development needs no datastore by default: features fall back to in-process behavior, and `compose.yml` runs the real thing when you want it.
