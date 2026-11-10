+++
title = "Identifier Conventions"
description = "What identifiers are, why UUID v7 is my default (and why it used to be v4), when to choose integers, other UUID versions, ULIDs, Snowflake IDs, ObjectIds or short random strings, and what each reveals, costs and breaks."
category = "Fundamentals"
order = 103
tags = ["ids", "uuid", "ulid", "mongodb", "database"]
aliases = ["identifier-conventions"]
+++

An identifier is the value a system uses to point at one record and only that one: the `id` on a row, the last segment of `/invoices/…`, the reference in a webhook payload. Once it's issued, it spreads into foreign keys, URLs, logs, caches and other companies' databases, so changing its format later means migrating all of them. It's one of the few decisions worth getting right on day one.

Identifiers come from three places:

- **Natural keys** already exist in the world: an email address, a SKU, an ISBN.
- **Sequences** are handed out by a single counter, usually the database: 1, 2, 3.
- **Generated IDs** are created by any program on its own, from randomness, a clock, a name, or a mix: UUIDs, ULIDs, Snowflake IDs, MongoDB ObjectIds.

Records almost always get a sequential or generated key, and natural keys stay on the row as data.

## What I Choose

My default is **UUID v7**: a 128-bit ID that starts with a millisecond timestamp and ends with random bits. Four questions decide an identifier format, and v7 answers them best for most data:

- **Who generates it?** Anyone. Services, clients and batch jobs create IDs without asking a database, so a client knows an object's ID before the insert, and two systems never collide.
- **What does it reveal?** When it was created, which is usually in the response as `created_at` anyway. It doesn't reveal how many rows exist or how fast they grow.
- **How does it index?** Well. New IDs sort after old ones, so inserts append to the end of the index instead of landing at random.
- **Who reads it?** Everything. It's a standard UUID, so databases store it in a native 16-byte type and every language, driver and log tool already parses it.

### Why It Used to Be v4

For most of the time UUIDs have existed, my default was v4. [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122) (July 2005) defined versions 1 through 5. Of the ones that don't need a name to hash, v1 embedded the generating machine's MAC address and a timestamp laid out so it doesn't sort, which left v4: random bits, revealing nothing, and available everywhere. PostgreSQL made that easy in version 13, which [added `gen_random_uuid()`](https://www.postgresql.org/docs/release/13.0/) to core; before that, UUID generation needed the `uuid-ossp` or `pgcrypto` extension.

The cost of v4 was always the index. [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562#section-2.1) says it plainly: versions that aren't time-ordered, "such as UUIDv4", have poor database-index locality. Teams that felt it built their own time-ordered formats outside the standard, and the RFC counts 16 of them, among them ULID, Twitter's Snowflake, Segment's KSUID and MongoDB's ObjectId. Each fixed the ordering, but each came with its own size, encoding and libraries.

RFC 9562 (May 2024) folded that idea into the UUID layout as v7, and that's what moved my default. v7 keeps everything v4 gave me (generated anywhere, the same 16-byte type, the same columns and drivers) and fixes the index. Native support followed: [PostgreSQL 18](https://www.postgresql.org/docs/release/18.0/) (released September 25, 2025) generates it with `uuidv7()`, and Go 1.27 has it in the standard library. v4 is still my choice for one case: when the ID must not reveal when it was created.

Switching an existing table is cheap. v4 and v7 are both UUIDs, so the column takes either without a migration. Rows created before the switch just don't sort by time: paging by `id` still returns every row exactly once, but the old ones come back in random order, not creation order.

## Choosing Something Else

v7 is where I start. These are the reasons I move off it:

- **The key never leaves one database, and size matters.** Use an integer sequence: 8 bytes, fastest to index, and nothing outside the database ever sees it.
- **Creation time must stay private.** Use v4.
- **The same input must always produce the same ID.** Use v5, or a name-based v8 when the names come from untrusted input.
- **The ID must fit in a 64-bit integer.** Use a Snowflake-style ID, if you can assign every generator a machine ID.
- **The database is MongoDB.** Keep its ObjectId for `_id`, unless other systems need to share the ID, in which case store a UUID.
- **People type it, or it goes in a short link.** Add a short random string in its own column, and keep the v7 as the key.
- **People read it in logs and support tickets.** Prefix the public form with the type, as Stripe does with `cus_` and `ch_`.
- **A natural key exists.** Keep it in a unique column, not as the primary key.

| Format | Size | Generated by | Reveals | Index locality | Use it for |
| ------ | ---- | ------------ | ------- | -------------- | ---------- |
| Integer | 8 bytes | One database | Count and rate | Excellent | Internal-only keys, warehouses |
| UUID v7 | 16 bytes | Anyone | Creation time (ms) | Good | **The default** |
| UUID v4 | 16 bytes | Anyone | Nothing | Poor at scale | IDs where timing is sensitive |
| UUID v5 | 16 bytes | Anyone, from a name | The name, if guessable | Poor | Tests, imports, shared identity |
| UUID v8 (name-based) | 16 bytes | Your own code, from a name | The name, if guessable | Poor | Name-based IDs from untrusted input |
| ULID | 16 bytes, 26 characters | Anyone | Creation time (ms) | Good | When the 26-character string matters |
| Snowflake | 8 bytes | Generators with assigned machine IDs | Creation time, machine | Good | IDs that must fit 64 bits |
| KSUID | 20 bytes, 27 characters | Anyone | Creation time | Good | Systems already built on it |
| MongoDB ObjectId | 12 bytes | Drivers | Creation time (s) | Good | MongoDB `_id` |
| Short random string | 21 characters (Nano ID) | Anyone | Nothing | Poor | Short links and typed codes, beside the key |

The rest of this page covers each option in detail.

## Natural Keys

A natural key is a value the record already has: an email address, a SKU, a government-issued number. It's tempting as a primary key because it's already unique, but it isn't stable. People change email addresses, products get re-numbered, and a typo fixed later becomes a cascade through every foreign key that copied it. Keep natural keys in unique columns, so they still prevent duplicates and match imports ([Imports and Exports](/docs/building-blocks/imports-and-exports)), and point everything else at a key that never changes.

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

The first digit of the third group is the **version**, and it names the recipe that made the ID, not a release. v7 isn't an upgrade of v4, and v8 isn't the newest and best; they're different recipes for different jobs, all defined in [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562), which replaced RFC 4122 in 2024:

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

Three ideas cover almost every need: **time-ordered** (v7), **random** (v4) and **derived from a name** (v5).

## UUID v7

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

## UUID v4

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

## UUID v5

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

### v1 and v6

- **v1** embeds a timestamp and a node ID (historically the MAC address) in an order that doesn't sort. Don't create new ones.
- **v6** is v1 reordered to sort by time. It exists for systems migrating from v1; the RFC says everything else [should use v7](https://datatracker.ietf.org/doc/html/rfc9562#section-5.6).

## Other Time-Ordered Formats

These are the formats that solved v4's index problem before v7 existed. They all put time first so new IDs sort last; they differ in size and encoding.

- **[ULID](https://github.com/ulid/spec)** is v7's idea in a different encoding: a 48-bit millisecond timestamp and 80 random bits, written as 26 characters of Crockford Base32, case-insensitive, no dashes. It's nicer in a URL, but most databases have a native 16-byte UUID type and no ULID type, so ULIDs usually end up stored as strings, larger and slower. Prefer v7 unless the string form genuinely matters.
- **[Snowflake](https://github.com/twitter-archive/snowflake/tree/snowflake-2010)**, Twitter's format, fits in 64 bits: a 41-bit millisecond timestamp from a custom epoch, a 10-bit machine ID and a 12-bit per-machine sequence. Fitting a `BIGINT` is its whole advantage, and the machine ID is its cost: every generator needs a unique one assigned, which is exactly the coordination UUIDs avoid. Choose it only when the ID has to be a 64-bit integer.
- **[KSUID](https://github.com/segmentio/ksuid)**, from Segment, is 20 bytes: a 32-bit timestamp from a 2014 epoch and 128 random bits, written as 27 base62 characters. It's larger than a UUID and has no native column type. I keep it where a system already uses it and don't start new ones on it.

## MongoDB ObjectId

MongoDB's default `_id` is an [ObjectId](https://www.mongodb.com/docs/manual/reference/bson-types/#objectid): 12 bytes, made of a 4-byte timestamp in seconds, a 5-byte random value generated once per client process, and a 3-byte counter. If an inserted document has no `_id`, the driver generates one.

- **It's time-ordered, roughly.** The timestamp comes first, so ObjectIds sort approximately by creation time. MongoDB's documentation is explicit that the order isn't exact: IDs from the same second have no guaranteed order, and different clients' clocks disagree.
- **It reveals creation time to the second.** `ObjectId.getTimestamp()` reads it back, and so can anyone who sees the ID.
- **It's MongoDB's format.** Other databases and languages don't have a native type for it, so it travels as a 24-character hex string.

Inside MongoDB I keep ObjectId for `_id`. It's generated anywhere, indexes well and every driver supports it. When the ID has to be shared with systems outside MongoDB, I store a UUID instead: MongoDB has a binary [UUID subtype](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data), and the application generates a v7 for it. MongoDB's own [`UUID()`](https://www.mongodb.com/docs/manual/reference/method/UUID/) helper generates v4 by default, so don't rely on it when you want time order.

## Short Random Strings

Sometimes the ID is for a person to type or share: a short link, an invite code, a code read over the phone. A 36-character UUID is too long for that. [Nano ID](https://github.com/ai/nanoid) is the common answer: 21 URL-safe characters (`A-Za-z0-9_-`) carrying about 126 random bits, close to v4's 122.

Treat these as a second, public column, not the key. Generate them randomly, put a unique constraint on them, and keep the v7 as the primary key that everything joins on. A shorter code than 21 characters is fine for things like invite codes, but fewer random bits make collisions and guessing more likely, so check for collisions on insert and rate-limit lookups.

## Prefixed Public IDs

A prefix makes an ID say what it points at. Stripe's customers have IDs like [`cus_NffrFeUfNV2Hib`](https://docs.stripe.com/api/customers/object) and its charges like [`ch_3MmlLrLkdIwHu7ix0snN0B15`](https://docs.stripe.com/api/charges/object), so a stray ID in a log line or a support ticket is identifiable at a glance, and passing a charge ID where a customer ID belongs fails visibly.

The prefix belongs to the public form, not the storage. Store the UUID in a `UUID` column and add the prefix (and any shorter encoding) when the ID leaves the API, stripping and checking it on the way back in. That keeps the database type native and the prefix free to change.

## Conventions

- **The ID is opaque to clients.** It's a string to them, even though it's time-ordered; parsing timestamps out of IDs couples clients to the format.
- **Public IDs never change.** If an internal key has to change, the public one doesn't.
- **Usernames and handles aren't IDs.** They're text, with [Unicode rules of their own](/docs/fundamentals/text-and-unicode#identifiers-and-usernames).
- **Column names describe roles, not types:** `id`, `user_id`, `stripe_charge_xid` for external IDs. See [Database Naming Conventions](/docs/database/naming-conventions).

## References

**Specifications**

- [RFC 9562: Universally Unique IDentifiers (UUIDs)](https://datatracker.ietf.org/doc/html/rfc9562), every version, the motivation for v6 through v8, v7 monotonicity methods, and security considerations
- [RFC 4122: A Universally Unique IDentifier (UUID) URN Namespace](https://datatracker.ietf.org/doc/html/rfc4122), the original 2005 specification of versions 1 through 5
- [ULID specification](https://github.com/ulid/spec), the format, Crockford Base32 encoding and sort order

**Reference**

- [Go: package uuid](https://pkg.go.dev/uuid), the standard library's v4 and v7 generators since Go 1.27
- [Go proposal #62026](https://github.com/golang/go/issues/62026), the design discussion, including why v3, v5 and v8 were left out
- [PostgreSQL: UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html), `uuidv7()` and `uuid_extract_timestamp()`
- [PostgreSQL: UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html), native storage as 16 bytes
- [PostgreSQL 13 release notes](https://www.postgresql.org/docs/release/13.0/), `gen_random_uuid()` in core
- [PostgreSQL 18 release notes](https://www.postgresql.org/docs/release/18.0/), `uuidv7()`
- [MongoDB: BSON Types](https://www.mongodb.com/docs/manual/reference/bson-types/), ObjectId layout and ordering, and the binary UUID subtype
- [MongoDB: UUID()](https://www.mongodb.com/docs/manual/reference/method/UUID/), generating UUIDs in `mongosh`
- [Snowflake (2010 release)](https://github.com/twitter-archive/snowflake/tree/snowflake-2010), Twitter's 64-bit ID layout
- [KSUID](https://github.com/segmentio/ksuid), Segment's 20-byte format
- [Nano ID](https://github.com/ai/nanoid), short URL-safe random IDs
- [Stripe API: Customer object](https://docs.stripe.com/api/customers/object), prefixed object IDs
- [MDN: Crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), generating v4 UUIDs in the browser and Node
- [MDN: UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID), a short primer

**In practice**

- [Buildkite: Goodbye to sequential integers, hello UUIDv7](https://www.buildkite.com/resources/blog/goodbye-integers-hello-uuids/), a production migration to time-ordered UUIDs
