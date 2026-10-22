+++
title = "Versioning & Deprecation"
description = "Header-based, date-named API versions with a URL fallback, what counts as a breaking change, and the Deprecation and Sunset headers that announce removals."
category = "Operations"
order = 5.5
tags = ["api", "versioning", "deprecation", "headers"]
aliases = ["versioning"]
+++

APIs change. Integrations shouldn't break without warning. Versions are selected with a request header and named by date, with a version in the URL path as the fallback, and anything being removed is announced on the wire with the `Deprecation` header ([RFC 9745](https://datatracker.ietf.org/doc/html/rfc9745)) and `Sunset` header ([RFC 8594](https://datatracker.ietf.org/doc/html/rfc8594)) before it goes away.

## Header Versioning

Clients pick a version with the `Api-Version` request header. Versions are named by their release date, in the `YYYY-MM-DD` form from [Time & Date Formats](/docs/fundamentals/time).

### Example Request

```http
GET /resources
Api-Version: 2026-10-01
```

### Example Response

```http
HTTP/1.1 200 OK
Api-Version: 2026-10-01
Vary: Api-Version
```

The response always echoes the version that served it, and `Vary: Api-Version` keeps caches from mixing versions.

### Missing or Unknown Versions

| Request | Result |
| ------- | ------ |
| No `Api-Version` header | Served by the **oldest supported** version, so existing clients never shift underneath |
| A supported version | Served by that version |
| An unknown or retired version | `400` with the standard [error format](/docs/requests/error-responses), listing the supported versions |

Pin a version explicitly. Relying on the default works, but it means your integration moves whenever the oldest version is retired.

### Why Headers First

GitHub, Stripe and others started with versions in the URL and moved to dated header versions. The lessons are the same:

- **URLs stay stable.** A resource's URL identifies the resource, not a revision of the API. Links, bookmarks and stored URLs keep working across versions.
- **Small, frequent versions.** Each breaking change ships as its own dated version. Clients upgrade one change at a time instead of migrating everything in one `/v2` rewrite.
- **Explicit pinning.** The version a client was built against is written down in one place, its request headers, and the response confirms it.

## URL Versioning (Fallback)

When a client can't set request headers, the version goes in the first path segment instead:

```http
GET /v1/resources
```

URL versioning is still valid, but it's the fallback, not the recommendation. Path versions are coarse: every breaking change means a new prefix, every URL a client has stored changes with it, and clients migrate everything at once. Prefer the header wherever you control the client.

The syntaqx API skips the fallback entirely: endpoints live at the root of `api.syntaqx.com`, and the version is only ever the header.

## Breaking and Non-Breaking Changes

### Non-Breaking Changes

These ship in every supported version, without a new version. Clients must tolerate them:

- New endpoints
- New optional query parameters or request fields
- New fields in a response body
- New response headers
- New values in a field documented as open-ended

### Breaking Changes

These never ship in place. Each one ships in a new dated version:

- Removing or renaming an endpoint, parameter, or response field
- Changing a field's type, format, or meaning
- Making an optional parameter required
- Changing status codes or the error envelope for existing behavior

## Timing Windows

Every version, and every endpoint, follows the same lifecycle:

| Phase | Starts | What clients see |
| ----- | ------ | ---------------- |
| Active | Release | Normal responses |
| Deprecated | Deprecation date | Normal responses, plus `Deprecation`, `Sunset` and `Link` headers |
| Sunset | Sunset date, **at least 30 days** after deprecation | `410 Gone` for a retired endpoint, `400` for a retired `Api-Version` |

- The deprecation window is never shorter than 30 days.
- The `Sunset` date is set when deprecation starts, and it never moves earlier.
- A dated version isn't deprecated until its successor has been released.

## Deprecation Headers

Every response served by a deprecated version or endpoint carries these headers for the whole deprecation window:

| Header | Format | Description |
| ------ | ------ | ----------- |
| `Deprecation` | `@` + Unix seconds (RFC 9745) | When the version or endpoint was deprecated |
| `Sunset` | HTTP-date (RFC 8594) | When it stops being served |
| `Link` | `rel="deprecation"` | Where to read about the change and how to migrate |

### Example Deprecated Response

```http
HTTP/1.1 200 OK
Api-Version: 2026-10-01
Deprecation: @1798761600
Sunset: Mon, 01 Feb 2027 00:00:00 GMT
Link: <https://www.syntaqx.com/docs/operations/versioning>; rel="deprecation"
```

## After the Sunset

Once the `Sunset` date passes, a retired endpoint returns `410 Gone` and a retired `Api-Version` returns `400`, both with the standard [error format](/docs/requests/error-responses).

```http
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "message": "This endpoint was removed on 2027-02-01. See https://www.syntaqx.com/docs/operations/versioning."
}
```

## Client Expectations

1. Send `Api-Version` on every request.
2. Treat any `Deprecation` header as a signal to log or alert on.
3. Follow the `rel="deprecation"` link for the replacement.
4. Move to a newer version before the `Sunset` date.

## References

**Specifications**

- [RFC 9745: The Deprecation HTTP Response Header Field](https://datatracker.ietf.org/doc/html/rfc9745), the `Deprecation` header
- [RFC 8594: The Sunset HTTP Header Field](https://datatracker.ietf.org/doc/html/rfc8594), the `Sunset` header
- [RFC 8288: Web Linking](https://datatracker.ietf.org/doc/html/rfc8288), the `rel="deprecation"` link
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), `Vary`, `400` and `410`

**Reference**

- [MDN: Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary), caching per `Api-Version`
- [MDN: 410 Gone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/410), retired endpoints
- [MDN: Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link), header syntax

**In practice**

- [Stripe: APIs as infrastructure](https://stripe.com/blog/api-versioning), dated, header-selected versions
- [GitHub: API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions), dated versions selected by header
