+++
title = "Identifier Conventions"
description = "How to choose and use identifiers: auto-increment, UUID versions, ULID, and when each makes sense."
category = "Fundamentals"
order = -0.25
tags = ["ids", "uuid", "ulid", "database"]
+++

Identifiers are one of the first decisions in any data model, and switching later is painful. Pick the right format upfront and stick with it.

## Auto-Increment Integers

The classic `SERIAL` or `BIGINT` primary key. Simple, compact, and fast to index.

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY
);
```

**Strengths**: Small storage footprint, naturally sortable, fast joins, human-readable.

**Drawbacks**: Exposes record count and creation order. Problematic in distributed systems where multiple nodes generate IDs. Merging datasets risks collisions.

Use auto-increment when the system is a single database and there's no reason to hide sequence information.

## UUID

UUIDs (Universally Unique Identifiers) are 128-bit values, typically displayed as 32 hex characters with dashes. Standardized by [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562) (which replaced RFC 4122).

```
550e8400-e29b-41d4-a716-446655440000
```

Multiple versions exist, each with different tradeoffs.

### UUID v4 (Random)

122 bits of cryptographic randomness. No timestamp, no node ID, no ordering.

```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

The most widely deployed version. Good when all you need is uniqueness. Bad when you need sortability, because random values fragment B-tree indexes and hurt write performance on large tables.

### UUID v1 (Timestamp + Node)

Embeds a 60-bit timestamp (100ns precision) and a 48-bit node ID (typically a MAC address or random value).

```
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

Sortable by creation time, but the timestamp and node fields can leak when the ID was created and on what machine. The non-sequential byte ordering also limits index performance compared to v7.

### UUID v7 (Timestamp + Random)

The recommended version. First 48 bits are a Unix timestamp in milliseconds, followed by random data.

```
01932c6c-7616-7590-a8db-cb4b0e4d1c8a
```

**Why v7 is the default choice:**

- **Sortable**: IDs generated later are lexicographically greater. B-tree indexes stay sequential, which means faster writes and less page splitting.
- **Distributed-safe**: No coordination between nodes. Generate them anywhere.
- **Timestamp-inspectable**: The creation time is encoded in the ID itself. Useful for debugging and rough time-ordering without an extra column.
- **No information leakage**: Unlike v1, there's no node/MAC address embedded.

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- or use application-level v7
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Most modern UUID libraries support v7 natively. If the language or database doesn't, generating one is straightforward: pack the current timestamp into the first 48 bits, fill the rest with random bytes, set the version and variant bits.

### UUID v5 / v3 (Name-Based)

Deterministic UUIDs derived from a namespace and a name using SHA-1 (v5) or MD5 (v3). Given the same namespace + name, the output is always the same.

```python
import uuid

# Same namespace + name always produces the same UUID
ns = uuid.NAMESPACE_URL
uuid.uuid5(ns, "https://example.com/users/42")
# => c98b5196-7c6e-5eb4-8adf-8ebc04937a87
```

This is more useful than it first appears:

- **Test fixtures**: Seed data can derive IDs from human-readable keys (`uuid5(ns, "test-user-admin")`), making test datasets stable across runs without hardcoding UUIDs.
- **Cross-platform identity**: When two systems need to refer to the same entity but can't share a database, both can independently derive the same UUID from an agreed-upon namespace and natural key. No synchronization or ID-mapping table required.
- **Idempotent imports**: Importing records from an external source can derive the UUID from the source's natural key, so re-running the import produces the same IDs rather than duplicates.

Not suitable for primary keys where uniqueness needs to come from randomness, since collisions are possible if two different inputs happen to share a namespace and name.

## ULID

[ULID](https://github.com/ulid/spec) (Universally Unique Lexicographically Sortable Identifier) is a 26-character Crockford Base32 string. Like UUID v7 in spirit: timestamp prefix for sortability, random suffix for uniqueness.

```
01ARZ3NDEKTSV4RRFFQ69G5FAV
```

**Compared to UUID v7**: Shorter string representation (26 chars vs 36), case-insensitive, no dashes. The tradeoff is less ecosystem support: most databases have native UUID types but treat ULIDs as strings.

## Choosing a Format

| Format | Sortable | Distributed | Size | Best For |
| ------ | -------- | ----------- | ---- | -------- |
| Auto-increment | Yes | No | 4-8 bytes | Single-database systems |
| UUID v4 | No | Yes | 16 bytes | Simple uniqueness, no ordering needed |
| UUID v7 | Yes | Yes | 16 bytes | Primary keys, most applications |
| UUID v1 | Yes | Yes | 16 bytes | Legacy systems (prefer v7 for new work) |
| ULID | Yes | Yes | 16 bytes | When shorter string representation matters |

For new projects, **UUID v7** is the default. It handles the common case: distributed ID generation with natural ordering and strong uniqueness guarantees. Fall back to auto-increment only when simplicity outweighs distribution needs, and consider ULID when the shorter representation is valuable.

## Column Naming

See [Database Naming Conventions](/docs/database-naming-conventions) for how column suffixes like `_id`, `_uid`, and `_xid` pair with these identifier formats.

## Tools

Generate, validate, and inspect UUIDs and ULIDs with the [UUID/ULID Generator](/misc/uuid).
