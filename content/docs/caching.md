+++
title = "Caching & Conditional Requests"
description = "Cache-Control, ETags and conditional requests: cheap revalidation with 304, safe concurrent updates with If-Match and 412, and Vary on Api-Version."
category = "Requests & Responses"
order = 6.2
tags = ["api", "caching", "http", "concurrency"]
+++

HTTP already has a complete caching and concurrency model in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) and [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111). Use it instead of inventing one: every client, CDN and proxy already understands it.

## Cache-Control

Every response says how it may be cached. No header means a cache gets to guess.

| Response | `Cache-Control` |
| -------- | --------------- |
| Account-specific data (most API responses) | `private, no-cache` |
| Public, slowly changing data | `public, max-age=300` |
| Immutable data (a versioned asset, a settled ledger entry) | `public, max-age=31536000, immutable` |
| Anything with secrets or card data | `no-store` |

`no-cache` doesn't mean "don't cache". It means "revalidate before reuse", which pairs with ETags below. `no-store` is the one that forbids storing.

## Validators: ETag and Last-Modified

Every `GET` on a resource returns an `ETag`, and a `Last-Modified` where the resource has a meaningful update time.

```http
HTTP/1.1 200 OK
ETag: "a3f1c9"
Last-Modified: Thu, 22 Oct 2026 14:23:45 GMT
Cache-Control: private, no-cache
```

- **Strong ETags** (`"a3f1c9"`) when the bytes are identical. A hash of the response body, or the row's version number, both work.
- **Weak ETags** (`W/"a3f1c9"`) when two representations are equivalent but not byte-identical (different compression, key order).

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

Make revalidation cheap for clients to adopt. [GitHub](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api) doesn't count an authorized request that returns `304` against the primary rate limit, and that's the policy here too: polling with `If-None-Match` should be the path of least resistance.

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

On `412`, the client re-reads, reapplies its change, and tries again. `If-Match` is required on resources where a lost update is costly (configuration, settings, anything edited by humans in two tabs). In the database, the check is the same guarded update as in [Payment States & Ledgers](/docs/payment-states): `UPDATE ... WHERE id = $1 AND version = $2`.

## Vary

A cache keys on the URL by default. Any request header that changes the response must be listed in `Vary`, or a cache will serve one client's representation to another:

```http
Vary: Accept, Api-Version, Accept-Encoding
```

- `Accept` because of [content negotiation](/docs/api-design-principles).
- `Api-Version` because each version can shape the response differently ([Versioning](/docs/versioning)).
- `Authorization` responses should be `private` instead of relying on `Vary: Authorization`, which shared caches handle poorly.

## Don't Cache Errors by Accident

`4xx` and `5xx` responses get `Cache-Control: no-store` unless the error is genuinely stable (a `404` on an ID that can never exist, a `410` after [sunset](/docs/versioning)). A cached `503` turns a ten-second blip into a ten-minute outage.

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
