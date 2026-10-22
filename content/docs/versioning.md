+++
title = "Versioning & Deprecation"
description = "URL-based major versions, what counts as a breaking change, and the timing windows and Deprecation and Sunset headers that announce a removal."
category = "Operations"
order = 5.5
tags = ["api", "versioning", "deprecation", "headers"]
+++

APIs change. Integrations shouldn't break without warning. The major version lives in the URL, breaking changes only ship in a new major version, and anything being removed is announced on the wire with the `Deprecation` header (RFC 9745) and `Sunset` header (RFC 8594) before it goes away.

## Versioning

The major version is the first path segment:

```http
GET /v1/resources
```

Only the major version appears in the URL. There are no minor or patch versions in paths or headers: non-breaking changes ship in place.

### Non-Breaking Changes

These ship in the current version without notice. Clients must tolerate them:

- New endpoints
- New optional query parameters or request fields
- New fields in a response body
- New response headers
- New values in a field documented as open-ended

### Breaking Changes

These never ship in place. They require a new major version (`/v2`):

- Removing or renaming an endpoint, parameter, or response field
- Changing a field's type, format, or meaning
- Making an optional parameter required
- Changing status codes or the error envelope for existing behavior

## Timing Windows

Every removal follows the same timeline:

| Phase | Starts | What clients see |
| ----- | ------ | ---------------- |
| Active | Release | Normal responses |
| Deprecated | Deprecation date | Normal responses, plus `Deprecation`, `Sunset` and `Link` headers |
| Sunset | Sunset date, **at least 30 days** after deprecation | `410 Gone` |

- The deprecation window is never shorter than 30 days.
- The `Sunset` date is set when deprecation starts, and it never moves earlier.
- When a new major version replaces an old one, the old version stays active until its own deprecation window ends.

## Deprecation Headers

Every response from a deprecated endpoint carries these headers for the whole deprecation window:

| Header | Format | Description |
| ------ | ------ | ----------- |
| `Deprecation` | `@` + Unix seconds (RFC 9745) | When the endpoint was deprecated |
| `Sunset` | HTTP-date (RFC 8594) | When the endpoint stops responding |
| `Link` | `rel="deprecation"` | Where to read about the change and how to migrate |

### Example Response

```http
HTTP/1.1 200 OK
Deprecation: @1798761600
Sunset: Thu, 01 Feb 2027 00:00:00 GMT
Link: <https://www.syntaqx.com/docs/versioning>; rel="deprecation"
```

## After the Sunset

Once the `Sunset` date passes, the endpoint returns `410 Gone` with the standard [error format](/docs/error-responses).

```http
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "message": "This endpoint was removed on 2027-02-01. See https://www.syntaqx.com/docs/versioning."
}
```

## Client Expectations

1. Treat any `Deprecation` header as a signal to log or alert on.
2. Follow the `rel="deprecation"` link for the replacement.
3. Migrate before the `Sunset` date.
