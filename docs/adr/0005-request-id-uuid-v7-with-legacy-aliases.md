# 0005. Request-Id as UUID v7, with legacy X- aliases

Status: Accepted (2026-10-22)

## Context

Since May 2026 the API has sent `X-Request-ID` (a random UUID v4) and `X-RateLimit-Limit`, `-Remaining` and `-Reset`. [RFC 6648](https://datatracker.ietf.org/doc/html/rfc6648) deprecates the `X-` prefix for new headers, and the playbook names the request ID `Request-Id`, the header Stripe uses ([Observability](https://www.syntaqx.com/docs/observability)). The rate-limit state now also has standard names: `RateLimit` and `RateLimit-Policy` from the IETF httpapi draft.

The site's own API disagreed with its own docs.

## Decision

- Send `Request-Id` on every API response, generated as a [UUID v7](0007-uuid-v7-default-identifier.md) by `uuidv7()` in `lib/uuid.ts`.
- Keep `X-Request-ID` with the **same value**, as a legacy alias (`requestIdHeaders()` in `lib/api.ts`).
- Keep `X-RateLimit-*` alongside `RateLimit` and `RateLimit-Policy`, carrying the same state.
- Expose all of them through CORS.

One exception to dropping `X-`: `X-HTTP-Method-Override` keeps its prefix, because that's the name existing clients and gateways send. See [0006](0006-http-query-in-the-proxy.md).

## Consequences

- The API matches [API Design Principles](https://www.syntaqx.com/docs/api-design-principles) and [Rate Limiting](https://www.syntaqx.com/docs/rate-limiting).
- No client that reads the old headers breaks. Removing a response header is treated as a breaking change.
- Request IDs sort by time, which helps when reading logs.
- Two headers per value until the aliases are retired. Retiring them needs a new dated version.
