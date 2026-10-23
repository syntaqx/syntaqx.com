+++
title = "API Design Principles"
nav_title = "Principles"
description = "The rules every endpoint follows: resources and methods, bare JSON with metadata in headers, status codes that mean something, and a Request-Id on all of it."
category = "API Design"
order = 201
tags = ["api", "design", "rest"]
aliases = ["api-design-principles"]
+++

An API's real users are the people who integrate against it at 11 p.m. with a deadline. Every rule here exists to make their first guess correct: having used one endpoint, they can predict the next without reading its docs. Consistency is the feature, and a clever exception in one endpoint costs every integrator a lookup, forever. These rules build directly on the method and status-code promises in [REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs).

## Resources, Methods, Status Codes

- **URLs name things, methods say what you're doing to them.** `GET /uuid`, not `GET /generateUuid`. Verb-shaped URLs push intent into names, where caches, retries and tooling can't see it.
- **Status codes carry the outcome.** `2xx` worked, `4xx` means the client should change something, `5xx` means the server failed. Every HTTP client, proxy, monitor and retry library already understands that, so there's no `"success": true` in the body to disagree with the status.
- **`400` and `422` mean different things.** `400` is a request the server couldn't parse (bad JSON, a missing header); `422` is a well-formed request with invalid values. A client can branch on the code alone: fix the format, or fix the data. See [Error Responses](/docs/requests/error-responses).

## Bodies Carry Resources, Headers Carry Metadata

A single resource is a JSON object. A list is a JSON array. No envelope.

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "name": "Sample Object",
  "created_at": "2026-10-22T14:23:45Z"
}
```

```json
[
  { "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a", "name": "Object A" },
  { "id": "0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70", "name": "Object B" }
]
```

The common alternative wraps every response in an envelope, the payload under `data` beside a `meta` object for pagination and counts. I don't:

- **The envelope is noise on every response.** Every client unwraps `data` on every call, forever, to get the thing it asked for.
- **HTTP already has a place for metadata.** Pagination goes in the `Link` header ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288)), rate limits in `RateLimit`, versions in `Api-Version`, tracing in `Request-Id`. Generic HTTP tooling reads headers without knowing your body schema.
- **The same resource has the same shape everywhere.** A payment looks the same in `GET /payments/{id}`, in a list, and in a webhook. With envelopes, each context tends to grow its own wrapper.

GitHub's REST API works this way, the most widely used proof that unwrapped responses scale. Naming and types inside the body are in [JSON Field Conventions](/docs/requests/json-conventions).

## Content Negotiation

JSON is the default. Where an endpoint can return another representation of the same resource, the client asks with `Accept`, instead of the API growing parallel URLs like `/report.csv`:

```http
GET /reports/01932c6c-7616-7590-a8db-cb4b0e4d1c8a
Accept: text/csv
```

- One URL per resource, many representations. Links, caches and permissions don't fork per format.
- Responses that vary by `Accept` send `Vary: Accept`, so caches don't serve CSV to a client that asked for JSON.
- A client asking for a format the endpoint can't produce gets `406 Not Acceptable`, not JSON it didn't ask for.

## Versioning

Clients pin a dated version with the `Api-Version` header. Additive changes ship to every version; breaking changes ship as a new version, with old ones announced for removal via `Deprecation` and `Sunset`. The URL identifies the resource, not the API revision. See [Versioning & Deprecation](/docs/api-design/versioning).

## Every Response Has a Request-Id

```http
Request-Id: 01a1648f-c612-79f6-9e96-d0e9005fb00c
```

A unique ID on every response, success or error, logged on every line the server writes for that request. When an integrator reports a problem, the ID turns "it failed around 3 p.m." into a single search, so clients should log it next to their own errors. See [Observability](/docs/operations/observability).

The header has no `X-` prefix: [RFC 6648](https://datatracker.ietf.org/doc/html/rfc6648) deprecated the convention because "experimental" headers become permanent and then can never be renamed.

## Request Headers

| Header | Purpose |
| ------ | ------- |
| `Content-Type` | `application/json` for request bodies |
| `Accept` | The representation the client wants (default `application/json`) |
| `Api-Version` | The dated API version to use |
| `Idempotency-Key` | Makes a `POST` safe to retry ([Idempotency](/docs/payments/idempotency)) |
| `User-Agent` | Who's calling, so their traffic can be found and contacted |

## This Site

The syntaqx API at `api.syntaqx.com` follows every rule above, with the version only in the header ([ADR 0001](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-header-only-api-versioning.md)). Every response carries `Request-Id`, plus a legacy `X-Request-ID` with the same value for older clients. The site itself does content negotiation: request a post, a doc or the home page with `Accept: text/markdown` and you get its Markdown instead of HTML, from the same URL.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), methods, status codes, `Accept` and `406`
- [RFC 8288: Web Linking](https://datatracker.ietf.org/doc/html/rfc8288), the `Link` header used for pagination
- [RFC 6648: Deprecating the "X-" Prefix](https://datatracker.ietf.org/doc/html/rfc6648), why `Request-Id` has no `X-`

**Reference**

- [MDN: Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation), how `Accept` picks a representation
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), what each status code means

**In practice**

- [GitHub REST API: Getting started](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api), bare arrays and objects with metadata in headers
- [Stripe: Request IDs](https://docs.stripe.com/api/request_ids), the `Request-Id` response header
- [Google AIP-121: Resource-oriented design](https://google.aip.dev/121), resources as nouns with standard methods
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), a thorough public rulebook to compare against
