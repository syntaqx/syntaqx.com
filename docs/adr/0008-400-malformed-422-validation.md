# 0008. 400 for malformed requests, 422 for validation failures

Status: Accepted (2026-10-22)

## Context

[Error Responses](https://www.syntaqx.com/docs/error-responses) has always said `400` means a malformed or unservable request and `422` means validation failed. The API didn't follow it: every endpoint returned `400` for invalid fields too (an out-of-range `count`, an unknown `algorithm`, a JWT without three parts). [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) uses the same split for `QUERY`, and the first `QUERY` implementation briefly papered over the gap by rewriting `400` to `422` for `QUERY` requests only.

[Versioning & Deprecation](https://www.syntaqx.com/docs/versioning) lists changing a status code as a breaking change that needs a new dated version.

## Decision

Fix it everywhere, in place, without a new version:

- **`422`** with field-level `errors` for validation failures, using `invalidField()` in `lib/api.ts` for single-field cases. Applies to hash, base64, jwt/decode, uuid, random, timestamp and flaky (`#123`).
- **`400`** stays for malformed requests: invalid JSON, a missing `User-Agent`, an unknown `Api-Version`, a disallowed method override.
- The `QUERY` remapping is removed, since handlers now return `422` themselves.
- OpenAPI responses updated to match.

No new version because nobody depended on the old behavior. The API is a set of public tools with no known integrations, so a new dated version would protect nobody and permanently keep a behavior the docs say is wrong.

## Consequences

- The API matches its own docs, and `QUERY` errors match the RFC.
- Clients can branch on the status alone: `400` means fix the request format, `422` means fix the values.
- This exception exists because the API had no consumers yet. Once it does, a status change ships in a new dated version per [0004](0004-header-based-dated-versioning.md).
