+++
title = "Identifier Conventions"
description = "UUID v7 as the default key, when integers, v4, v5 or ULIDs are the better choice, and what each format reveals, costs, and breaks when you get it wrong."
category = "Fundamentals"
order = 103
tags = ["ids", "uuid", "ulid", "database"]
aliases = ["identifier-conventions"]
+++

An identifier ends up everywhere: foreign keys, URLs, logs, caches, webhook payloads, other companies' databases. Changing its format later means migrating all of them, so it's one of the few decisions worth getting right on day one.

My default is **UUID v7**. Four questions decide the format, and v7 answers them best for most data: who generates the ID (one database, or anyone without coordinating), what it reveals (row counts, growth, creation time), how it indexes (random keys scatter inserts across a B-tree, ordered keys append), and who reads it (support tickets, URLs, other systems).

## Auto-Increment Integers

`BIGSERIAL` keys are small (8 bytes), fast, ordered and easy to read aloud. Their problems all come from being a single counter:

- **They leak.** `/invoices/10482` tells a competitor how many invoices you've issued, and two invoices a week apart tell them your growth rate. Sequential IDs also make enumeration attacks trivial: increment and try the next one.
- **They need one writer.** Only the database can hand them out, so a client can't create an ID before the insert, and two databases (a sharded table, a merger, an offline client) will collide.

Use them inside a single database for things that are never exposed: join tables, internal queues, and warehouse tables where 8-byte keys measurably shrink indexes.

## UUID v7: The Default

A [UUID v7](https://datatracker.ietf.org/doc/html/rfc9562#section-5.7) is 128 bits: a 48-bit Unix timestamp in milliseconds, then random bits.

```
01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

- **Generated anywhere.** Services, clients and batch jobs create IDs without asking anyone, so a client knows an object's ID before the insert.
- **Index-friendly.** New IDs sort after old ones, so inserts append to the B-tree instead of splitting pages all over it. On large tables that's the difference that matters most against v4.
- **Sorted by creation.** Sorting by `id` is sorting by creation time, which makes cursor pagination simple ([Pagination](/docs/requests/pagination)).

What it costs:

- **It reveals when it was created,** to the millisecond. Usually that's fine, since `created_at` is in the response anyway. When creation time is itself sensitive (an anonymous report, a signup that shouldn't be correlated with an event), use v4, as [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562#section-8) recommends for security-sensitive uses.
- **Order within a millisecond isn't guaranteed** unless the generator uses one of RFC 9562's monotonic methods (a counter or extra clock precision). If two IDs from the same millisecond must sort in creation order, use a generator that does, or don't depend on it.

```sql
-- PostgreSQL 18+
CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

PostgreSQL 18 generates v7 natively with `uuidv7()`. On older versions, generate it in the application: a timestamp in the first 48 bits, random bytes for the rest, then the version and variant bits.

## UUID v4: Pure Randomness

122 random bits, nothing else. Use v4 when the ID must reveal nothing, including when it was made. The cost is index locality: on a large, write-heavy table, random inserts mean more page splits, cache misses and write amplification.

## UUID v5: Derived From a Name

A [v5](https://datatracker.ietf.org/doc/html/rfc9562#section-5.5) UUID is a hash of a namespace and a name. The same input always produces the same ID, and that's the point:

```go tab="Go"
uuid.NewSHA1(uuid.NameSpaceURL, []byte("https://example.com/users/42")) // github.com/google/uuid
// always 38fcaf6d-63bc-5c9f-8a4f-de8cf4e651ed
```

```rust tab="Rust"
Uuid::new_v5(&Uuid::NAMESPACE_URL, b"https://example.com/users/42") // uuid crate, "v5" feature
// always 38fcaf6d-63bc-5c9f-8a4f-de8cf4e651ed
```

```python tab="Python"
import uuid
uuid.uuid5(uuid.NAMESPACE_URL, "https://example.com/users/42")
# always 38fcaf6d-63bc-5c9f-8a4f-de8cf4e651ed
```

- **Idempotent imports.** Derive each record's ID from the source system's key, and re-running an import updates rows instead of duplicating them.
- **Shared identity without a mapping table.** Two systems that agree on a namespace compute the same ID for the same entity independently.
- **Stable test fixtures.** `uuid5(ns, "user-admin")` is the same on every run, so fixtures don't hard-code UUIDs ([Testing Strategy](/docs/quality/testing)).

Don't use v5 where a user can guess the input. Anyone who knows the namespace and the name can compute the ID, so it's no access control, and it can leak the input it was derived from.

## v1, v6 and ULID

- **v1** embeds a timestamp and a node ID (historically the MAC address) in an order that doesn't sort. Don't create new ones.
- **v6** is v1 reordered to sort by time. It exists for systems migrating from v1; the RFC says everything else should use v7.
- **[ULID](https://github.com/ulid/spec)** is v7's idea in a different encoding: 26 characters of Crockford Base32, case-insensitive, no dashes. It's nicer in a URL, but most databases have a native 16-byte UUID type and no ULID type, so ULIDs usually end up stored as strings, larger and slower. Prefer v7 unless the string form genuinely matters.

## Choosing

| Format | Generated by | Reveals | Index locality | Use it for |
| ------ | ------------ | ------- | -------------- | ---------- |
| Integer | One database | Count and rate | Excellent | Internal-only keys, warehouses |
| UUID v7 | Anyone | Creation time | Good | **The default** |
| UUID v4 | Anyone | Nothing | Poor at scale | IDs where timing is sensitive |
| UUID v5 | Anyone, from a name | The name, if guessable | Poor | Imports, shared identity, fixtures |
| ULID | Anyone | Creation time | Good | When the 26-character string matters |

## Conventions

- **The ID is opaque to clients.** It's a string to them, even though it's time-ordered; parsing timestamps out of IDs couples clients to the format.
- **Public IDs never change.** If an internal key has to change, the public one doesn't.
- **Column names describe roles, not types:** `id`, `user_id`, `stripe_charge_xid` for external IDs. See [Database Naming Conventions](/docs/database/naming-conventions).

## References

**Specifications**

- [RFC 9562: Universally Unique IDentifiers (UUIDs)](https://datatracker.ietf.org/doc/html/rfc9562), every version, v7 monotonicity methods, and security considerations
- [ULID specification](https://github.com/ulid/spec), the format, Crockford Base32 encoding and sort order

**Reference**

- [PostgreSQL: UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html), `uuidv7()` and `uuid_extract_timestamp()`
- [PostgreSQL: UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html), native storage as 16 bytes
- [MDN: Crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), generating v4 UUIDs in the browser and Node
- [MDN: UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID), a short primer

**In practice**

- [Buildkite: Goodbye to sequential integers, hello UUIDv7](https://www.buildkite.com/resources/blog/goodbye-integers-hello-uuids/), a production migration to time-ordered UUIDs
