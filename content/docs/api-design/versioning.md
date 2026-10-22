+++
title = "Versioning & Deprecation"
description = "Header-selected, date-named API versions, what counts as a breaking change, and announcing removals on the wire with the Deprecation and Sunset headers."
category = "API Design"
order = 205
tags = ["api", "versioning", "deprecation", "headers"]
aliases = ["versioning", "operations/versioning"]
+++

An API is a promise to code you'll never see. Someone wrote an integration against it, shipped it, and moved on; if a response changes shape, their code breaks at 3 a.m. and they find out from their customers. Versioning is how the API keeps changing without breaking that promise.

The approach: versions are chosen with a request header and named by date, breaking changes only ever ship in a new version, and anything being removed is announced in the responses themselves, with the [`Deprecation`](https://datatracker.ietf.org/doc/html/rfc9745) and [`Sunset`](https://datatracker.ietf.org/doc/html/rfc8594) headers, well before it goes away.

## Header Versioning

Clients pick a version with the `Api-Version` request header. Versions are named by their release date, in the `YYYY-MM-DD` form from [Time & Date Formats](/docs/fundamentals/time).

```http
GET /resources
Api-Version: 2026-10-01
```

```http
HTTP/1.1 200 OK
Api-Version: 2026-10-01
Vary: Api-Version
```

The response echoes the version that served it, so a client can confirm what it got instead of assuming. `Vary: Api-Version` matters as much: without it, a cache can serve a response shaped for one version to a client that asked for another.

### Why a Header

The version describes how the client wants to talk, not which resource it wants, and the URL is for the resource. That distinction has practical consequences:

- **URLs stay stable.** Links, bookmarks, stored IDs and webhook targets keep working across versions. A `/v1/` in the URL bakes the version into every URL a client has ever saved.
- **Versions can be small.** When the version lives in the URL, each new one is a new tree of routes, so APIs batch years of breaking changes into one painful `/v2`. A header version costs nothing to add, so each breaking change can be its own version, and clients upgrade one change at a time.
- **The pin is in one place.** A client's version is a single header, set once in its HTTP client, not scattered across every URL it builds.

The cost is visibility: a header doesn't show up when someone pastes a URL into a browser or a chat. That's why the response echoes it, and why errors about versions say which versions exist.

### Why Dates

Dates sort, they say how old a version is at a glance, and they map directly to the changelog entry that introduced them. `2026-10-01` tells you more than `v7`, and nobody argues about whether a change deserves a major or minor bump.

### Missing or Unknown Versions

| Request | Result |
| ------- | ------ |
| No `Api-Version` header | Served by the **oldest supported** version |
| A supported version | Served by that version |
| An unknown or retired version | `400` with the standard [error format](/docs/requests/error-responses), listing the supported versions |

Defaulting to the oldest version, not the newest, is deliberate. A client that never sent the header was built against whatever existed when it was written; serving it the newest version would break it the day a new version ships. The oldest supported version only changes when one is retired, and that's announced in advance.

Still, pin a version explicitly. An unpinned client moves whenever the oldest version is retired, and it can't tell from its own code which behavior it depends on.

## URL Versioning (Fallback)

When a client genuinely can't set request headers, the version goes in the first path segment instead:

```http
GET /v1/resources
```

It's a fallback, not the recommendation, for all the reasons above: coarse versions, URLs that change, and big-bang migrations. Prefer the header wherever you control the client.

The syntaqx API skips the fallback entirely: endpoints live at the root of `api.syntaqx.com`, and the version is only ever the header. Every client it has can send headers, so the fallback would cost two versioning mechanisms for no benefit. That departure is recorded in [ADR 0002](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0002-header-only-api-versioning.md).

## Breaking and Non-Breaking Changes

The test is whether correct client code, written against the documented contract, can break.

### Non-Breaking Changes

These ship into every supported version without a new one. Clients are expected to tolerate them, and that expectation is part of the contract:

- New endpoints
- New optional query parameters or request fields
- New fields in a response body
- New response headers
- New values in a field documented as open-ended

That last line is why enums are documented as open-ended where they can grow (see [JSON Field Conventions](/docs/requests/json-conventions)): a client that switches exhaustively over every value breaks the day a new one appears, and the documentation is what makes handling unknown values the client's job.

### Breaking Changes

These never ship in place. Each one ships in a new dated version:

- Removing or renaming an endpoint, parameter, or response field
- Changing a field's type, format, or meaning
- Making an optional parameter required, or tightening validation on an existing one
- Changing a default (sort order, page size, which version is served)
- Changing status codes or the error format for existing behavior

The subtle ones are behavior changes with the same shape: a stricter validation rule, a different default, a field that used to be `null` and is now omitted. The JSON looks compatible and the client still breaks. Treat them as breaking.

## The Lifecycle

| Phase | Starts | What clients see |
| ----- | ------ | ---------------- |
| Active | Release | Normal responses |
| Deprecated | Deprecation date | Normal responses, plus `Deprecation`, `Sunset` and `Link` headers |
| Sunset | Sunset date | `410 Gone` for a retired endpoint, `400` for a retired `Api-Version` |

- **At least 30 days between deprecation and sunset.** That's the floor, long enough for a team on a monthly release cycle to notice and ship a fix. APIs with many consumers should give far longer: GitHub supports a previous REST version for at least 24 months after its successor ships.
- **The sunset date is set when deprecation starts,** and it never moves earlier. Clients plan around it; pulling it in breaks the plan.
- **Nothing is deprecated until its replacement exists.** A deprecation with nowhere to go is just a removal with a delay.

## Deprecation Headers

Every response served by a deprecated version or endpoint carries these headers for the whole deprecation window. Announcing it in the response, and not only in a changelog, reaches the integration that nobody has looked at in a year, through the logs and alerts its owners already watch.

| Header | Format | Description |
| ------ | ------ | ----------- |
| `Deprecation` | `@` + Unix seconds (RFC 9745) | When the version or endpoint was deprecated |
| `Sunset` | HTTP-date (RFC 8594) | When it stops being served; never earlier than `Deprecation` |
| `Link` | `rel="deprecation"` | Where to read about the change and how to migrate |

```http
HTTP/1.1 200 OK
Api-Version: 2026-10-01
Deprecation: @1798761600
Sunset: Mon, 01 Feb 2027 00:00:00 GMT
Link: <https://www.syntaqx.com/docs/api-design/versioning>; rel="deprecation"
```

The two date formats differ for historical reasons: `Deprecation` is a newer Structured Field date, `Sunset` predates them and uses the classic HTTP-date.

## After the Sunset

Once the sunset passes, a retired endpoint returns `410 Gone` and a retired `Api-Version` returns `400`, both with the standard [error format](/docs/requests/error-responses). `410` instead of `404` tells the client the thing existed and was removed on purpose, so it's a migration to do, not a typo to debug.

```http
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "message": "This endpoint was removed on 2027-02-01. See https://www.syntaqx.com/docs/api-design/versioning."
}
```

## Client Expectations

1. Send `Api-Version` on every request.
2. Alert on any `Deprecation` header. It's the earliest warning you'll get.
3. Follow the `rel="deprecation"` link for the replacement.
4. Move to a newer version before the `Sunset` date.

## References

**Specifications**

- [RFC 9745: The Deprecation HTTP Response Header Field](https://datatracker.ietf.org/doc/html/rfc9745), the `Deprecation` header and its relation to `Sunset`
- [RFC 8594: The Sunset HTTP Header Field](https://datatracker.ietf.org/doc/html/rfc8594), the `Sunset` header
- [RFC 8288: Web Linking](https://datatracker.ietf.org/doc/html/rfc8288), the `rel="deprecation"` link
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), `Vary`, `400` and `410`

**Reference**

- [MDN: Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary), caching per `Api-Version`
- [MDN: 410 Gone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/410), retired endpoints
- [MDN: Link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link), header syntax

**In practice**

- [Stripe: APIs as infrastructure](https://stripe.com/blog/api-versioning), small dated versions selected by header
- [GitHub: API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions), dated header versions and a 24-month support window
