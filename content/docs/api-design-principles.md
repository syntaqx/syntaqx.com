+++
title = "API Design Principles"
description = "Core principles and conventions that guide the API design."
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

If the endpoint supports vcard format (media type `text/vcard`), a client can request it by setting:

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

If the endpoint supports CSV output (media type `text/csv`), a client can request it by setting:

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

All pagination is handled via the `Link` header (RFC 8288), never in the response body. See [Pagination](/docs/pagination) for full details on page-based and cursor-based approaches.

## Versioning

The API is versioned via the URL path: `/v1/`. Breaking changes will result in a new version (`/v2/`). Non-breaking additions (new fields, new endpoints) are added to the current version.

## Request Headers

| Header | Description |
| ------ | ----------- |
| `Content-Type` | `application/json` for request bodies |
| `Accept` | Desired response format (defaults to `application/json`) |
| `User-Agent` | Identifies the calling client |

## X-Request-ID

Every response carries a unique `X-Request-ID`. Log it on your end. When something goes wrong, this is the fastest way to trace a request across services. It's a foundational piece of any observability and traceability strategy.

```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```
