# 0002. Header-only API versioning, no URL version

Status: Accepted (2026-10-22)

## Context

[Versioning & Deprecation](https://www.syntaqx.com/docs/api-design/versioning) selects versions with the `Api-Version` header and keeps a version in the URL path (`/v1/...`) as a fallback for clients that can't set headers. The API had both: endpoints lived under `/v1`, and the header picked the dated version within it.

## Decision

Drop the fallback. Endpoints live at the root of `api.syntaqx.com` (`/hash`, not `/v1/hash`), and the `Api-Version` header is the only way to choose a version. A request without it gets the oldest supported version, exactly as the playbook says.

The fallback exists for clients that can't send headers. This API's clients are browsers, `curl` and generated SDKs, all of which can, so the prefix carried the cost of path versions (two version mechanisms, longer URLs, a `/v2` waiting to happen) without the benefit.

## Consequences

- One versioning mechanism, and URLs that never change across versions.
- A client that truly can't set headers is pinned to the oldest supported version and moves only when that version is retired.
- If a client like that ever matters, a path version can come back as a fallback without changing anything else.
