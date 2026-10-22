+++
title = "Caching & Conditional Requests"
description = "Cache-Control, ETags and conditional requests: cheap revalidation with 304, safe concurrent updates with If-Match and 412, and Vary on Api-Version."
category = "Requests & Responses"
order = 6.2
tags = ["api", "caching", "http", "concurrency"]
aliases = ["caching"]
+++

Caching and concurrency control are two sides of one question: "is the copy I have still the current one?" HTTP answers it with validators (`ETag`, `Last-Modified`) and conditional requests, defined in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) and [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111). Using that model instead of inventing one means every browser, CDN, proxy and HTTP library already knows how to take part, and you write none of that code.

## Cache-Control

Every response says how it may be cached. With no `Cache-Control`, caches fall back to heuristics, and a shared cache that guesses "cacheable" on an account-specific response serves one customer's data to another.

| Response | `Cache-Control` |
| -------- | --------------- |
| Account-specific data (most API responses) | `private, no-cache` |
| Public, slowly changing data | `public, max-age=300` |
| Immutable data (a versioned asset, a settled ledger entry) | `public, max-age=31536000, immutable` |
| Anything with secrets or card data | `no-store` |

- **`private`** keeps account-specific responses out of shared caches (CDNs, corporate proxies). Only the client's own cache may store them.
- **`no-cache` doesn't mean "don't cache".** It means "revalidate before reuse": the client keeps its copy and asks the server whether it's still current, which costs a round trip but almost no bandwidth when paired with the ETags below. It's the right default for data that changes unpredictably.
- **`no-store` is the one that forbids storing,** for responses that must never sit on a disk: secrets, card data, one-time tokens.
- **`immutable`** tells the client not to revalidate at all, for content that by definition can't change.

## Validators: ETag and Last-Modified

Every `GET` on a resource returns an `ETag`, and a `Last-Modified` where the resource has a meaningful update time.

```http
HTTP/1.1 200 OK
ETag: "a3f1c9"
Last-Modified: Thu, 22 Oct 2026 14:23:45 GMT
Cache-Control: private, no-cache
```

- **Strong ETags** (`"a3f1c9"`) when the bytes are identical. A hash of the response body, or the row's version number, both work.
- **Weak ETags** (`W/"a3f1c9"`) when two representations are equivalent but not byte-identical (different compression, key order). Weak ETags are fine for revalidating a read, but `If-Match` compares strongly, so a resource that supports conditional writes needs a strong one.

Prefer `ETag` to `Last-Modified` as the validator. `Last-Modified` has one-second resolution, so two writes in the same second look identical, and clocks across servers disagree. A version number or a hash has neither problem.

The syntaqx API does this on every deterministic `GET`. [`/healthz`](/docs/api) and [`/openapi`](/docs/api) return an `ETag` hashed from the body, a `timestamp` for a given `t` is `immutable`, and generated values like `/uuid` are `no-store`.

## Revalidation: 304 Not Modified

Clients send the validator back. If nothing changed, the response is an empty `304`:

```http
GET /payments/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
If-None-Match: "a3f1c9"
```

```http
HTTP/1.1 304 Not Modified
ETag: "a3f1c9"
```

Make revalidation the path of least resistance for clients that poll. A `304` costs the server a lookup and a hash comparison, not a serialized body, so it shouldn't cost the client rate-limit quota either; otherwise the client that does the polite thing (sending `If-None-Match`) pays the same as the one that downloads the whole resource every time. [GitHub](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api) works this way: an authorized conditional request that returns `304` doesn't count against its primary rate limit.

The syntaqx API does this. Its rate limiter has to count each request in the proxy, before the response exists, so the endpoint gives the request back when it answers with a `304`: one extra Redis command per revalidation, in exchange for making the polite client the cheap one.

One trap to know about: some platforms answer conditional requests at their edge. Vercel compares `If-None-Match` with your response's `ETag` itself and strips the header before your code runs, so your handler never sees a revalidation and can't act on one (here, refund it). It worked locally and silently did nothing in production. If your code needs to know, forward the header under a name the platform leaves alone, from a layer that still sees it; this site's proxy does exactly that.

## Optimistic Concurrency: If-Match

Two clients read the same resource, both edit it, the second write silently overwrites the first. Conditional writes prevent the lost update:

```http
PATCH /customers/0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
If-Match: "a3f1c9"
Content-Type: application/merge-patch+json

{ "email": "alice@example.com" }
```

| Situation | Response |
| --------- | -------- |
| ETag matches | `200`, with the new `ETag` |
| ETag doesn't match, someone else changed it | `412 Precondition Failed` |
| `If-Match` required but missing | `428 Precondition Required` ([RFC 6585](https://www.rfc-editor.org/rfc/rfc6585)) |

On `412`, the client re-reads, reapplies its change, and tries again. That's "optimistic" concurrency: instead of locking the resource while someone edits it (and deciding what happens when they walk away), every write proves it was based on the current version, and the rare conflict is resolved by the client, which is the only party that knows what the user meant. `If-Match` is required on resources where a lost update is costly (configuration, settings, anything edited by humans in two tabs). In the database, the check is the same guarded update as in [Payment States & Ledgers](/docs/payments/payment-states): `UPDATE ... WHERE id = $1 AND version = $2`.

## Vary

A cache keys on the URL by default. Any request header that changes the response must be listed in `Vary`, or a cache will serve one client's representation to another: a CSV to a client that asked for JSON, or the `2026-10-01` shape to a client pinned to an older version.

```http
Vary: Accept, Api-Version, Accept-Encoding
```

- `Accept` because of [content negotiation](/docs/api-design/principles).
- `Api-Version` because each version can shape the response differently ([Versioning](/docs/operations/versioning)).
- `Authorization` responses should be `private` instead of relying on `Vary: Authorization`, which shared caches handle poorly.

## Don't Cache Errors by Accident

`4xx` and `5xx` responses get `Cache-Control: no-store` unless the error is genuinely stable (a `404` on an ID that can never exist, a `410` after [sunset](/docs/operations/versioning)). A cached `503` turns a ten-second blip into a ten-minute outage.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), validators, conditional requests and `412`
- [RFC 9111: HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111), `Cache-Control` and cache keys
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), `428 Precondition Required`

**Reference**

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), how browsers and shared caches behave
- [MDN: HTTP conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests), revalidation and lost-update prevention
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control), every directive in one place
- [MDN: ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag), strong and weak validators

**In practice**

- [GitHub Docs: Best practices for using the REST API](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api), conditional requests that don't count against the rate limit
- [Google AIP-154: Resource freshness validation](https://google.aip.dev/154), ETags on resources
- [Microsoft: Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md), conditional requests and optimistic concurrency
