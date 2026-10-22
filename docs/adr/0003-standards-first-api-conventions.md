# 0003. Standards-first API conventions

Status: Accepted (2026-05-10)

## Context

The API under `/api` (served at the root of `api.syntaqx.com`) is small, but it's also the live example for the playbook. Every API eventually has to decide how to shape responses, where to put metadata, and how to report errors. Ad hoc answers drift endpoint by endpoint.

Common choices like `{ "data": ..., "meta": ... }` envelopes and `success: true` flags duplicate what HTTP already provides, and every client has to unwrap them.

## Decision

Follow published standards and the conventions GitHub's REST API uses, written down in [API Design Principles](https://www.syntaqx.com/docs/api-design-principles) and [JSON Field Conventions](https://www.syntaqx.com/docs/json-conventions):

- **No envelopes.** A single resource is a JSON object, a list is a JSON array. Never a `data` wrapper.
- **Metadata goes in headers.** Pagination in `Link` ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288)), rate limits in `RateLimit` and `RateLimit-Policy`, version in `Api-Version`, tracing in `Request-Id`.
- **Status codes carry the outcome.** No `success` booleans.
- **One error format** everywhere: `message`, plus field-level `errors` when there are any ([Error Responses](https://www.syntaqx.com/docs/error-responses)). `lib/api.ts` provides `json()` and `errorResponse()` so routes can't drift from it.

## Consequences

- Clients use plain HTTP tooling: no unwrapping, and standard libraries already understand `Link` and `Retry-After`.
- Adding metadata never changes the body, so it's never a breaking change.
- Some clients find headers less discoverable than body fields. CORS has to expose every one of them (`Access-Control-Expose-Headers` in `proxy.ts`), or browsers can't read them.
- Later decisions build on this one: [0004](0004-header-based-dated-versioning.md), [0005](0005-request-id-uuid-v7-with-legacy-aliases.md), [0008](0008-400-malformed-422-validation.md).
