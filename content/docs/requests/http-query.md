+++
title = "HTTP QUERY"
description = "Supporting RFC 10008's QUERY method today: one query model behind GET, QUERY and a POST fallback, plus caching, CORS, and where the ecosystem still falls short."
category = "Requests & Responses"
order = 4.4
tags = ["api", "http", "query", "rfc10008", "standards"]
aliases = ["http-query"]
+++

[RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), published June 2026, adds the `QUERY` method: a request that carries its query in the body like `POST`, but is **safe and idempotent** like `GET`. It closes a gap every API has hit. Either you put a complex search in the URL and fight length limits, encoding, and URLs full of filters ending up in logs, or you use `POST /search` and lose caching, automatic retries, and the meaning of "this is a read".

`QUERY` is the right answer. The ecosystem is still catching up, so this is how I support it now without leaving clients behind.

## What QUERY Is

```http
QUERY /payments
Content-Type: application/json
Accept: application/json

{
  "status": ["captured", "settled"],
  "amount_gte": 10000,
  "created_after": "2026-10-01T00:00:00Z",
  "sort": "-created_at"
}
```

Field names, operator suffixes and `sort` are exactly the [Filtering & Sorting](/docs/requests/filtering-and-sorting) parameters. A comma list in the query string is an array in the body. The body can also express what a query string can't, such as nested `any` and `all` groups for `(a AND b) OR c`.

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: <https://api.syntaqx.com/payments/queries/0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70?cursor=eyJpZCI6IjEyMyJ9>; rel="next"

[
  { "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a", "status": "captured", "amount": 25000, "currency": "USD" }
]
```

| Property | `GET` | `QUERY` | `POST` |
| -------- | ----- | ------- | ------ |
| Safe (no side effects) | Yes | Yes | No |
| Idempotent (safe to retry) | Yes | Yes | No |
| Request body has meaning | No | Yes | Yes |
| Cacheable | Yes | Yes, keyed on the body | Rarely |

Responses follow the same rules as everywhere else: a list is an array, metadata lives in headers ([Pagination](/docs/requests/pagination), [JSON Field Conventions](/docs/requests/json-conventions)), errors use the [standard format](/docs/requests/error-responses).

## One Query Model, Three Doors

Every searchable collection has **one** query model, the same filters and operators as [Filtering & Sorting](/docs/requests/filtering-and-sorting). There are three ways to send it, and they all reach the same handler:

| Door | When | Example |
| ---- | ---- | ------- |
| `GET` with a query string | Simple filters that fit in a URL and aren't sensitive | `GET /payments?status=captured&sort=-created_at` |
| `QUERY` with a body | The preferred form for anything structured, long, or sensitive | `QUERY /payments` |
| `POST` with a method override | Clients or infrastructure that can't send `QUERY` yet | `POST /payments` + `X-HTTP-Method-Override: QUERY` |

`GET /payments?status=captured` and `QUERY /payments` with `{"status": "captured"}` return the same thing. The transport changes. The query doesn't.

### The POST Fallback

This is the polyfill. A `POST` to the collection with `X-HTTP-Method-Override: QUERY` is handled **exactly** as a `QUERY`:

```http
POST /payments
X-HTTP-Method-Override: QUERY
Content-Type: application/json

{ "status": ["captured"] }
```

- **The only allowed override is `POST` to `QUERY`.** An override that would turn a request into `DELETE`, `PUT` or anything else is rejected with `400`. A method override that can escalate privileges is a security hole.
- **No side effects, ever.** The handler is the read-only `QUERY` handler. An `Idempotency-Key` isn't needed and is ignored.
- **The header name keeps its `X-` prefix.** Everywhere else these docs drop `X-` ([RFC 6648](https://datatracker.ietf.org/doc/html/rfc6648)), but `X-HTTP-Method-Override` is the name that gateways, SDKs and Google's APIs already send. Renaming it would break the very clients it exists for.
- **Responses tell caches the truth.** Intermediaries see a `POST`, so they won't cache it, and the response says `Cache-Control: private, no-store`. Clients that want caching use the stored query (below).

Why not a separate `POST /payments/search` endpoint? Because it's a second URL for the same read, with its own docs and its own drift. One resource, one query model.

## Discovery

Resources that support `QUERY` advertise it, as RFC 10008 defines:

```http
HTTP/1.1 200 OK
Allow: GET, HEAD, OPTIONS, QUERY
Accept-Query: application/json
```

- `Allow` on `OPTIONS` responses, and on any `405 Method Not Allowed`.
- `Accept-Query` lists the query formats the resource understands. It's a [Structured Field](https://www.rfc-editor.org/rfc/rfc9651.html) list, and it applies to every URL with the same path.
- Clients can also just send `QUERY` and fall back to the override on `405` or `501`.

## Status Codes

| Situation | Status |
| --------- | ------ |
| Missing `Content-Type`, or it doesn't match the body | `400` |
| Body is larger than the limit (64 KB) | `413` |
| Unsupported query format | `415`, with `Accept-Query` listing what is |
| Valid JSON, but the query can't run (unknown field, bad operator) | `422`, with field-level `errors` |
| `Accept` asks for a format the resource can't produce | `406` |

The server never sniffs the body to guess its type. The RFC forbids it, and it's how parsers get confused into doing the wrong thing.

## Stored Queries

A `QUERY` body can't be bookmarked, linked to, or cached by most of today's infrastructure. RFC 10008's answer is the **equivalent resource**: a URL that stands for "this query, against this collection", which anyone can `GET`.

```http
HTTP/1.1 200 OK
Location: /payments/queries/0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
ETag: "a3f9c1"
```

- `Location` points to the stored query. A `GET` to it runs the query again, with current results, without resending the body.
- That `GET` works with everything `GET` already works with: [conditional requests](/docs/requests/caching) (`If-None-Match` and `304`), CDNs, browser caches, pagination links.
- The stored query ID is derived from a hash of the normalized query, so the same query always gets the same URL ([UUID v5](/docs/fundamentals/identifier-conventions) is a natural fit).
- Stored queries expire after 24 hours without use. A `GET` after that returns `404`, and the client re-sends the original `QUERY`.
- The URL never contains the query's contents, so nothing sensitive ends up in logs, as the RFC requires.

Pagination links on `QUERY` responses point at the stored query, so following `rel="next"` is a plain `GET`.

## Caching

`QUERY` responses are cacheable, and the cache key **includes the body**. Caches may normalize it (key order, whitespace, content encoding) for the key only.

In practice: assume no shared cache understands `QUERY` yet. Send `Cache-Control` on `QUERY` responses as you would for the equivalent `GET`, and rely on the stored-query `GET` URL for CDN caching.

## Limitations

The method is standardized. Support isn't. Each of these has a workaround, and that's why the fallback exists.

| Layer | Limitation | What we do |
| ----- | ---------- | ---------- |
| Browsers | `fetch()` can send `QUERY`, but it isn't [CORS-safelisted](https://fetch.spec.whatwg.org/#cors-safelisted-method), so every cross-origin call needs a preflight. HTML forms can't send it at all. | List `QUERY` in `Access-Control-Allow-Methods` and cache preflights with `Access-Control-Max-Age` |
| Frameworks | Many routers only dispatch the classic methods. Next.js route handlers, for example, only export `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `DELETE` and `PATCH`, so a native `QUERY` gets a `405`. | Route `QUERY` at the server or proxy layer where possible, and the `POST` override always works |
| CDNs, WAFs, load balancers | Some reject unknown methods outright, and most don't cache `QUERY` with a body-aware key yet | Allow `QUERY` explicitly in edge rules, and cache through stored-query `GET` URLs |
| Runtimes | Older HTTP parsers reject the method. Node.js parses it in current releases (`http.METHODS` includes `QUERY` in Node 24). | Check the runtime before relying on native support |
| API descriptions | [OpenAPI 3.2](https://spec.openapis.org/oas/v3.2.0.html) has a `query` operation. 3.1 and older tooling doesn't. | Describe `QUERY` in 3.2 where tooling supports it, and document the `POST` override alongside it |
| Logging and observability | Tools that log method + URL see the same URL for every query | Log a hash of the normalized body with the [request ID](/docs/operations/observability), never the body itself |

## Live Example

The syntaqx API's [`/hash`](/docs/api) endpoint supports all of this. Hashing has no side effects and always gives the same answer, and its input is exactly the kind of data that shouldn't end up in a URL.

```bash
# Native QUERY
curl -X QUERY https://api.syntaqx.com/hash \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world"}'

# The POST fallback
curl -X POST https://api.syntaqx.com/hash \
  -H "Content-Type: application/json" \
  -H "X-HTTP-Method-Override: QUERY" \
  -d '{"input": "hello world"}'
```

How it's built:

- **QUERY is served in the proxy layer.** Next.js route handlers answer a native `QUERY` with an empty `400`, so the proxy recognizes both doors, applies the checks above (`Content-Type`, the 64 KB limit, override rules), and calls the endpoint's read-only handler directly.
- **Native responses are cacheable for a year.** A digest never changes for the same input, so a successful `QUERY` returns `Cache-Control: public, max-age=31536000, immutable`. Overridden requests return `private, no-store`.
- **No stored query.** A digest is already the complete, permanent answer, so there's nothing to re-run and responses don't include a `Location`.
- **Plain `POST /hash` still works** for existing clients. Every path returns `400` for malformed JSON and `422` for a well-formed query that can't run, as RFC 10008 and [Error Responses](/docs/requests/error-responses) specify.

## Client Expectations

1. Use `GET` for simple filters, `QUERY` for anything structured, long, or sensitive.
2. Treat `QUERY` like `GET`: retry it freely, and don't expect it to change anything.
3. On `405` or `501`, retry as `POST` with `X-HTTP-Method-Override: QUERY`.
4. Keep the `Location` from the response, and `GET` it to re-run or cache the query.

## References

**Specifications**

- [RFC 10008: The HTTP QUERY Method](https://datatracker.ietf.org/doc/html/rfc10008), the method, `Accept-Query`, and equivalent resources
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), safe and idempotent methods, status codes and `Allow`
- [RFC 9111: HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111), the cache model QUERY responses extend
- [RFC 9651: Structured Field Values for HTTP](https://datatracker.ietf.org/doc/html/rfc9651), the syntax of `Accept-Query`
- [WHATWG: Fetch Standard](https://fetch.spec.whatwg.org/#cors-safelisted-method), CORS-safelisted methods and preflights
- [OpenAPI Specification 3.2](https://spec.openapis.org/oas/v3.2.0.html), the `query` operation

**Reference**

- [MDN: QUERY](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/QUERY), browser-side behavior of the method
- [MDN: Preflight request](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request), why cross-origin QUERY calls need one
- [Node.js: HTTP](https://nodejs.org/api/http.html#httpmethods), `http.METHODS` lists what the parser accepts

**In practice**

- [OpenAPI Initiative: HTTP Methods](https://learn.openapis.org/specification/http-methods), describing QUERY operations in an API description
