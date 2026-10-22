# 0006. Serve HTTP QUERY in the proxy layer

Status: Accepted (2026-10-22)

## Context

[RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) (June 2026) defines `QUERY`: a safe, idempotent request with a body. `POST /hash` was really a read (same input, same digest, no side effects), and its input is the kind of data that shouldn't end up in a URL.

Next.js route handlers only dispatch `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `DELETE` and `PATCH`. Tested on this stack, a native `QUERY` reaches `proxy.ts` (Node 24 parses it, and Vercel's edge passes it through on preview and production), then the route layer answers with an empty `400`. Some clients and infrastructure also can't send the method yet.

## Decision

Serve `QUERY` from the proxy layer (`lib/query.ts`), with two ways in, as [HTTP QUERY](https://www.syntaqx.com/docs/http-query) describes:

- **Native `QUERY`.**
- **`POST` + `X-HTTP-Method-Override: QUERY`** as the fallback. This is the **only** override allowed. Any other value or method gets `400`, because an override that turns a read into a write is a security hole. That's what gave the older overrides used to tunnel `PUT` and `DELETE` their reputation.

Both go through one check before reaching the endpoint's existing read-only handler: a `Content-Type` is required (`400`), only `application/json` is accepted (`415` with `Accept-Query`), and the body is limited to 64 KB (`413`). Endpoints opt in through the `queryRoutes` table. `/hash` is the first. `Allow` and `Accept-Query` advertise support, and CORS allows the method and the override header.

Successful native responses use the endpoint's cache policy (immutable for hash). Overridden ones are `private, no-store`, since caches see a `POST`.

## Consequences

- The playbook's `QUERY` guidance runs in production, not just on paper.
- Endpoints are added explicitly. There's no accidental `QUERY` support.
- No stored-query `Location`, since there's no database ([0002](0002-no-auth-no-database.md)).
- Plain `POST /hash` keeps working.
- If Next.js gains native `QUERY` routing, this layer can shrink to just handling the override.
