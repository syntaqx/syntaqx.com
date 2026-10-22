+++
title = "API Design Principles"
description = "The core principles and conventions that guide how the syntaqx API is designed: consistency, predictability, and least surprise for the developer using it."
category = "API Design"
order = 0
tags = ["api", "design", "rest"]
+++

## RESTful by Default

If you're unfamiliar with REST conventions, start with the [REST & HTTP Verbs](/docs/rest-http-verbs) primer.

Every endpoint follows a few non-negotiable rules:

- **Resources are nouns**, not verbs. `GET /v1/uuid`, not `GET /v1/generateUuid`.
- **HTTP methods convey intent.** `GET` reads, `POST` writes.
- **Status codes convey outcome.** `2xx` means it worked. No `success` wrappers.
- **Collections return arrays.** Even a single-item collection is `["value"]`, not `"value"`.

## Response Format

All JSON responses return objects at the top level. Do not nest them under a `data` or `attributes` key.

```json
{
  "id": "3e23b9a4-7204-11ed-a1eb-0242ac120002",
  "type": "example",
  "name": "Sample Object"
}
```

### Arrays of Objects

When returning multiple records from a list endpoint, respond with an array of objects:

```json
[
  {
    "id": "3e23b9a4-7204-11ed-a1eb-0242ac120002",
    "name": "Object A"
  },
  {
    "id": "4451a6d0-7204-11ed-a1eb-0242ac120002",
    "name": "Object B"
  }
]
```

### Errors

All errors use a consistent envelope with `message` and an optional `errors` object for field-level validation failures. See [Error Responses](/docs/error-responses) for the full format and status code reference.

## Content Negotiation

Most responses are JSON, but some endpoints support alternative formats via the `Accept` header. The client declares what it can handle, and the server picks the best match.

### vCard Example

If the endpoint supports [vCard](https://datatracker.ietf.org/doc/html/rfc6350) format (media type `text/vcard`), a client can request it by setting:

```
Accept: text/vcard
```

Server response:

```
Content-Type: text/vcard

BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Organization
TEL;TYPE=WORK,VOICE:(111) 555-1212
EMAIL;TYPE=PREF,INTERNET:johndoe@example.org
END:VCARD
```

### CSV Example

If the endpoint supports [CSV](https://datatracker.ietf.org/doc/html/rfc4180) output (media type `text/csv`), a client can request it by setting:

```
Accept: text/csv
```

Server response:

```
Content-Type: text/csv

id,name,created_at
1,"Object A","2025-03-17T10:00:00Z"
2,"Object B","2025-03-18T10:00:00Z"
```

> **Note:** The client can always request JSON by including `Accept: application/json`.

## Pagination

All pagination is handled via the `Link` header ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288)), never in the response body. See [Pagination](/docs/pagination) for full details on page-based and cursor-based approaches.

## Versioning

Versions are selected with the `Api-Version` request header and named by date, with a version in the URL path (`/v1/`) as the fallback. Breaking changes ship in a new version. Non-breaking additions (new fields, new endpoints) ship in every supported version. See [Versioning & Deprecation](/docs/versioning).

## Request Headers

| Header | Description |
| ------ | ----------- |
| `Content-Type` | `application/json` for request bodies |
| `Accept` | Desired response format (defaults to `application/json`) |
| `User-Agent` | Identifies the calling client |
| `Api-Version` | The dated API version to use (see [Versioning & Deprecation](/docs/versioning)) |
| `Idempotency-Key` | Makes a `POST` safe to retry (see [Idempotency](/docs/idempotency)) |

## Request-Id

Every response carries a unique `Request-Id`. Log it on your end. When something goes wrong, this is the fastest way to trace a request across services. It's a foundational piece of any observability and traceability strategy. See [Observability](/docs/observability).

```http
Request-Id: 019a0b6e-4c2d-7f31-9b8e-2d5a6c7e8f90
```

`X-Request-ID` carries the same value and stays for existing clients. Prefer `Request-Id`.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), methods, status codes and content negotiation
- [RFC 8288: Web Linking](https://datatracker.ietf.org/doc/html/rfc8288), the `Link` header used for pagination
- [RFC 6648: Deprecating the "X-" Prefix](https://datatracker.ietf.org/doc/html/rfc6648), why `Request-Id` has no `X-`

**Reference**

- [MDN: Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation), how `Accept` picks a response format
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), what each status code means

**In practice**

- [GitHub REST API: Getting started](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api), bare arrays and objects with metadata in headers, the model for no `data` wrappers
- [Stripe: Request IDs](https://docs.stripe.com/api/request_ids), the `Request-Id` response header
- [Google AIP-121: Resource-oriented design](https://google.aip.dev/121), resources as nouns with standard methods
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), a thorough public rulebook to compare against
