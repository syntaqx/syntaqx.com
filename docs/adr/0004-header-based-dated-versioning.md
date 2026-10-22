# 0004. Header-based dated versioning

Status: Accepted (2026-10-22)

## Context

The API started with the version only in the URL (`/v1/...`). Path versions are coarse: every breaking change means a new prefix, every stored URL changes, and clients migrate all at once. GitHub and Stripe both moved from URL versions to dated versions selected by a header.

## Decision

Versions are selected with the `Api-Version` request header and named by release date (`YYYY-MM-DD`). There is no version in the URL: endpoints live at the root of `api.syntaqx.com` (`/hash`, not `/v1/hash`). The playbook allows a path version as a fallback for clients that can't set headers, but this API has no such clients, so the `/v1` prefix was removed outright rather than deprecated. Policy: [Versioning & Deprecation](https://www.syntaqx.com/docs/versioning) (`#114`). Implementation: `resolveApiVersion()` in `lib/api.ts`, applied to all API traffic by `proxy.ts` (`#115`).

- No header: served by the **oldest** supported version, so existing clients never shift underneath.
- Unknown or retired version: `400` in the standard error format, listing the supported versions.
- Every response echoes `Api-Version` and sends `Vary: Api-Version`.
- Deprecated versions keep serving for at least 30 days, with `Deprecation` ([RFC 9745](https://datatracker.ietf.org/doc/html/rfc9745)), `Sunset` ([RFC 8594](https://datatracker.ietf.org/doc/html/rfc8594)) and a `Link` with `rel="deprecation"`.

The first and only version is `2026-10-22`.

## Consequences

- Breaking changes can ship one at a time, each in its own dated version.
- Stored URLs stay valid across versions, and are shorter.
- A client that can't send headers always gets the oldest supported version.
- The version table in `lib/api.ts` is now part of every release decision.
- Before anyone depends on the API, fixing a wrong behavior doesn't need a new version. [0008](0008-400-malformed-422-validation.md) used that exception once, deliberately.
