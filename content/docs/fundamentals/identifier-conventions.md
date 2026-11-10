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

## What a UUID Is

A UUID (universally unique identifier) is a 128-bit value that any program can generate on its own, without asking a database or a central service, and with no practical chance of producing one that already exists. It's stored as 16 bytes and written as 32 hex digits in five groups:

```text
01932c6c-7616-7590-a8db-cb4b0e4d1c8a
              ^    ^
              |    variant: 8, 9, a or b for every UUID on this page
              version: 7
```

The first digit of the third group is the **version**, and it names the recipe that made the ID, not a release. v7 isn't an upgrade of v4, and v8 isn't the newest and best; they're different recipes for different jobs, all defined in [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562), which replaced the original RFC 4122 in 2024:

| Version | Recipe | Where it stands |
| ------- | ------ | --------------- |
| v1 | Timestamp plus a node ID (historically the MAC address) | Legacy |
| v2 | Reserved for DCE Security | You won't meet it |
| v3 | MD5 hash of a namespace and a name | Legacy, use v5 |
| v4 | Random | Current |
| v5 | SHA-1 hash of a namespace and a name | Current |
| v6 | v1 reordered to sort by time | Only for v1 migrations |
| v7 | Unix timestamp, then random | Current, my default |
| v8 | A layout you define | Custom schemes |

Three ideas cover almost every need: **time-ordered** (v7), **random** (v4) and **derived from a name** (v5). The rest of this page is about choosing among them.

## UUID v7: The Default

A [UUID v7](https://datatracker.ietf.org/doc/html/rfc9562#section-5.7) puts the time first: a 48-bit Unix timestamp in milliseconds, then the version and variant, then 74 random bits. Because the time leads, v7 IDs sort in the order they were made.

```text
01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

- **Generated anywhere.** Services, clients and batch jobs create IDs without asking anyone, so a client knows an object's ID before the insert.
- **Index-friendly.** A database index is a sorted tree. A new v7 sorts after everything before it, so inserts land on the last page; a random key lands anywhere, so the database splits full pages to make room and has to keep more of the index in memory. On large tables that's the difference that matters most against v4.
- **Sorted by creation.** Sorting by `id` is sorting by creation time, which makes cursor pagination simple ([Pagination](/docs/requests/pagination)).

What it costs:

- **It reveals when it was created,** to the millisecond. Usually that's fine, since `created_at` is in the response anyway. When creation time is itself sensitive (an anonymous report, a signup that shouldn't be correlated with an event), use v4, as [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562#section-8) recommends for security-sensitive uses.
- **Order within a millisecond isn't guaranteed.** Two IDs from the same millisecond share a timestamp, so their order comes down to the random bits, unless the generator uses one of RFC 9562's monotonic methods (a counter or extra clock precision in the bits after the timestamp). If two IDs from the same millisecond must sort in creation order, use a generator that does, or don't depend on it.

```sql
-- PostgreSQL 18+
CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT uuidv7(),
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

PostgreSQL 18 generates v7 natively with `uuidv7()`. On older versions, generate it in the application. Go has it in the standard library since 1.27 ([`uuid`](https://pkg.go.dev/uuid), no third-party package), and its `NewV7` returns IDs that sort in increasing order unless the system clock moves backwards, which covers the same-millisecond case above:

```go tab="Go"
id := uuid.NewV7() // standard library, Go 1.27+
id.String()        // 01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

```rust tab="Rust"
let id = Uuid::now_v7(); // uuid crate, "v7" feature
id.to_string()           // 01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

## UUID v4: Pure Randomness

Everything except the version and variant is random: 122 bits, nothing else.

```text
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

```go tab="Go"
id := uuid.NewV4() // standard library, Go 1.27+; uuid.New() is currently the same
```

```rust tab="Rust"
let id = Uuid::new_v4(); // uuid crate, "v4" feature
```

In a browser or Node, [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) returns one. Use v4 when the ID must reveal nothing, including when it was made. The cost is index locality: on a large, write-heavy table, random inserts mean more page splits, cache misses and write amplification.

Random isn't secret. RFC 9562 says not to assume any UUID is [hard to guess](https://datatracker.ietf.org/doc/html/rfc9562#section-8), and never to let possession of one grant access. A v4 in a URL still needs an authorization check behind it.

## UUID v5: Derived From a Name

Every version above makes a new ID each time you call it. A [v5](https://datatracker.ietf.org/doc/html/rfc9562#section-5.5) UUID is computed instead: hash a **namespace** and a **name** with SHA-1, keep the first 128 bits, and set the version and variant. The same namespace and name always produce the same ID, on any machine, in any language.

- **The name** is whatever identifies the thing: a URL, a source system's key, a fixture label like `user-admin`.
- **The namespace** is itself a UUID that keeps names from different domains apart, so `42` in your users namespace and `42` in your orders namespace give different IDs. RFC 9562 predefines four (DNS names, URLs, ISO OIDs and X.500 names). For your own, generate a v4 or v7 once, as the RFC [recommends](https://datatracker.ietf.org/doc/html/rfc9562#section-6.6), and hard-code it.

```go tab="Go"
uuid.NewSHA1(uuid.NameSpaceURL, []byte("https://example.com/users/42")) // github.com/google/uuid; the standard library has no v5
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

Where that pays off:

- **Deterministic tests.** Fixtures built from readable names get the same IDs on every run and every machine, so snapshots, golden files and seed data stay stable, and a failing assertion shows an ID you can trace back to `user-admin` instead of a fresh random value ([Deterministic Fixtures](/docs/quality/testing#deterministic-fixtures)).
- **Idempotent imports.** Derive each imported record's ID from the source system's key, and re-running the import finds the rows it already made instead of duplicating them. Keep that derived ID in its own unique column and give the row a v7 primary key: RFC 9562 [cautions](https://datatracker.ietf.org/doc/html/rfc9562#section-6.13) against name-based UUIDs as primary keys, because the ID changes whenever the name does.
- **Shared identity without a mapping table.** Two systems that agree on a namespace compute the same ID for the same entity independently.

A fixture helper is a few lines:

```go tab="Go"
// The namespace for this repository's fixtures: a v4 generated once and hard-coded.
var fixtures = uuid.MustParse("0b33cbb7-da21-413c-aa6e-27bfa66ac34c") // github.com/google/uuid

func fixtureID(name string) uuid.UUID {
	return uuid.NewSHA1(fixtures, []byte(name))
}

adminID := fixtureID("user-admin") // the same ID on every run
```

```rust tab="Rust"
// The namespace for this repository's fixtures: a v4 generated once and hard-coded.
const FIXTURES: Uuid = Uuid::from_u128(0x0b33cbb7_da21_413c_aa6e_27bfa66ac34c);

fn fixture_id(name: &str) -> Uuid {
    Uuid::new_v5(&FIXTURES, name.as_bytes()) // uuid crate, "v5" feature
}

let admin_id = fixture_id("user-admin"); // the same ID on every run
```

Don't use v5 where a user can guess the input. Anyone who knows the namespace and the name can compute the ID, so it's no access control, and it can leak the input it was derived from.

### Why Not v3, and Where v8 Fits

v3 is the same recipe with MD5 in place of SHA-1, and RFC 9562 says to use [v5 instead](https://datatracker.ietf.org/doc/html/rfc9562#section-5.3) where possible. Both hashes are broken in the cryptographic sense: it's possible to construct two different inputs that hash to the same value ([MD5](https://datatracker.ietf.org/doc/html/rfc6151), [SHA-1](https://shattered.io/), first shown in 2017). That's why Go left v3 and v5 out of its standard library; the [design notes](https://github.com/golang/go/issues/62026#issuecomment-4209523935) call both algorithms "cryptographically broken" and expect people who want hashed IDs to use v8.

A broken hash only matters here when an attacker chooses the names and two names landing on one ID would hurt, such as names taken from user input that could be steered onto another account's record. Test fixtures, import keys and URLs you control aren't that case, and v5 is the one name-based recipe every language computes identically, so it's still my choice there.

When the names do come from untrusted input, RFC 9562 puts name-based IDs on SHA-256 or newer [in the v8 space](https://datatracker.ietf.org/doc/html/rfc9562#appendix-B.2). v8 is the custom version: the RFC fixes only the version and variant bits and leaves the other 122 to you, so its [uniqueness "MUST NOT be assumed"](https://datatracker.ietf.org/doc/html/rfc9562#section-5.8) and two libraries won't derive the same ID from the same name. Even the RFC's own SHA-256 example comes with a note that it hasn't been rigorously tested and that implementers should design their own. Use v8 only when every system that derives these IDs runs your code.

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
| UUID v5 | Anyone, from a name | The name, if guessable | Poor | Tests, imports, shared identity |
| UUID v8 (name-based) | Your own code, from a name | The name, if guessable | Poor | Name-based IDs from untrusted input |
| ULID | Anyone | Creation time | Good | When the 26-character string matters |

## Conventions

- **The ID is opaque to clients.** It's a string to them, even though it's time-ordered; parsing timestamps out of IDs couples clients to the format.
- **Public IDs never change.** If an internal key has to change, the public one doesn't.
- **Usernames and handles aren't IDs.** They're text, with [Unicode rules of their own](/docs/fundamentals/text-and-unicode#identifiers-and-usernames).
- **Column names describe roles, not types:** `id`, `user_id`, `stripe_charge_xid` for external IDs. See [Database Naming Conventions](/docs/database/naming-conventions).

## References

**Specifications**

- [RFC 9562: Universally Unique IDentifiers (UUIDs)](https://datatracker.ietf.org/doc/html/rfc9562), every version, v7 monotonicity methods, and security considerations
- [ULID specification](https://github.com/ulid/spec), the format, Crockford Base32 encoding and sort order

**Reference**

- [Go: package uuid](https://pkg.go.dev/uuid), the standard library's v4 and v7 generators since Go 1.27
- [Go proposal #62026](https://github.com/golang/go/issues/62026), the design discussion, including why v3, v5 and v8 were left out
- [PostgreSQL: UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html), `uuidv7()` and `uuid_extract_timestamp()`
- [PostgreSQL: UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html), native storage as 16 bytes
- [MDN: Crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), generating v4 UUIDs in the browser and Node
- [MDN: UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID), a short primer

**In practice**

- [Buildkite: Goodbye to sequential integers, hello UUIDv7](https://www.buildkite.com/resources/blog/goodbye-integers-hello-uuids/), a production migration to time-ordered UUIDs
