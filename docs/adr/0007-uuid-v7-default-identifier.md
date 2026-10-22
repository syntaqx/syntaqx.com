# 0007. UUID v7 as the default identifier

Status: Accepted (2026-05-10)

## Context

Identifiers are hard to change later. Auto-increment integers leak record counts and don't work across distributed writers. UUID v4 is unique but random, which fragments B-tree indexes. UUID v1 leaks the time and the machine. ULIDs sort well but most databases store them as strings.

## Decision

UUID v7 ([RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562)) is the default for new identifiers: a 48-bit millisecond timestamp, then randomness. The reasoning and the alternatives are in [Identifier Conventions](https://www.syntaqx.com/docs/fundamentals/identifier-conventions).

In this codebase:

- `lib/uuid.ts` exports `uuidv7()`, shared by the API (request IDs, [0005](0005-request-id-uuid-v7-with-legacy-aliases.md)), `GET /uuid`, and the UUID tool at `/misc/uuid`.
- `GET /uuid` returns v7 by default. `?version=4` is still there for callers who want purely random values.
- Every example ID in the playbook docs is a UUID v7. Idempotency keys are the exception: clients generate those, and UUID v4 is fine for them.

## Consequences

- IDs sort by creation time, so sorting by `id` doubles as a creation-time tiebreaker ([Filtering & Sorting](https://www.syntaqx.com/docs/requests/filtering-and-sorting)).
- The creation time can be read from the ID itself. Don't use v7 where that's sensitive. Use v4 there.
