# 0003. Breaking changes without a deprecation window, while there are no consumers

Status: Accepted (2026-10-22)

## Context

[Versioning & Deprecation](https://www.syntaqx.com/docs/api-design/versioning) says breaking changes never ship in place: they ship in a new dated version, and anything removed is announced with `Deprecation` and `Sunset` headers at least 30 days ahead.

Two changes the API needed were breaking:

- Validation failures returned `400`, while [Error Responses](https://www.syntaqx.com/docs/requests/error-responses) says `400` is for malformed requests and `422` for invalid values (`#123`).
- The `/v1` path prefix was removed ([0002](0002-header-only-api-versioning.md)), so every old URL stopped working (`#124`).

## Decision

Ship both in place, with no new version and no deprecation window. The deprecation policy protects integrations, and the API has none: it's a set of public tools with no known consumers. A new version would protect nobody and keep a behavior the docs call wrong for as long as the old version lived.

## Consequences

- The API matches its own docs today, without carrying a wrong version alongside the right one.
- This exception expires the moment anyone depends on the API. From then on, the playbook's policy applies in full.
- "Nobody uses it" is a claim that needs evidence. Before relying on this again, check traffic for clients other than the docs console.
