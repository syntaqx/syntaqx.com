+++
title = "Database Naming Conventions"
nav_title = "Naming Conventions"
description = "Naming and typing conventions for tables, columns, keys, constraints and indexes, so a schema is predictable enough to guess and safe to change."
category = "Database"
order = 501
tags = ["database", "naming", "conventions"]
aliases = ["database-naming-conventions"]
+++

A schema is read far more often than it's written, by people writing queries at 2 a.m., by migration tools, by analysts who've never seen the code. Good conventions mean you can guess a column's name, its type and its relationships without looking. If a column ends in `_id`, it points at another table and probably needs an index. If it ends in `_at`, it's a UTC timestamp. That predictability is worth more than any individual naming choice.

## Casing: lowercase snake_case

Every table, column, index and constraint is lowercase with underscores between words.

```text
customer_addresses
customer_id
first_name
```

This isn't just taste. Postgres folds unquoted identifiers to lowercase, so a table created as `"CustomerAddresses"` has to be quoted, exactly, in every query forever after; `SELECT * FROM CustomerAddresses` fails. snake_case also matches the JSON field names in [JSON Field Conventions](/docs/requests/json-conventions), so a column and the API field it feeds have the same name.

## Tables Are Plural

Tables hold many rows, so they're plural: `customers`, `payments`, `addresses`. Columns hold one value per row, so they're singular.

Plural also sidesteps a real trap: `user` and `order` are reserved words in Postgres and in the SQL standard. A table called `user` has to be quoted everywhere. `users` and `orders` don't.

**Join tables** that model a many-to-many relationship use the domain's name for the relationship when there is one (`memberships`, `enrollments`), and otherwise both tables (`project_collaborators`). A relationship with its own name usually grows its own columns (a role, a joined date), and the name keeps that from looking strange later. See [Resource Relationships](/docs/api-design/resource-relationships).

## Keys

The primary key is always `id`. A foreign key is the singular of the related table plus `_id`:

```sql
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  street      TEXT NOT NULL,
  city        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX addresses_customer_id_idx ON addresses (customer_id);
```

- **`id` names the role, not the type.** It works the same for integers, UUIDs or ULIDs, as long as one schema is consistent. The default here is [UUID v7](/docs/fundamentals/identifier-conventions): globally unique, sortable by creation time, and kind to B-tree indexes. Postgres 18 generates them natively with `uuidv7()`; on older versions, generate them in the application.
- **Declare foreign keys in transactional databases.** A missing constraint is how orphaned rows appear, and nobody notices until a report doesn't add up. Analytics warehouses are the exception: they often skip constraints for load speed, and the pipeline is responsible for integrity instead.
- **Index every foreign key column.** Postgres doesn't do it for you. Without one, deleting a customer scans the whole `addresses` table to check for references, and joins on `customer_id` scan too.

### `_uid` for mixed schemas

When a schema mixes integer keys and universally unique keys, use `_uid` for foreign keys to the universal ones, so the type is obvious from the name. It's `_uid` rather than `_uuid` because the value might be a ULID or another format.

```sql
-- Integer keys on some tables, UUIDs on others
ALTER TABLE comments ADD COLUMN post_uid UUID NOT NULL;
ALTER TABLE comments ADD COLUMN author_id BIGINT NOT NULL;
```

When universal IDs are the only kind in the schema, plain `_id` everywhere. No suffix gymnastics.

### `_xid` for external IDs

Identifiers that come from another system use `_xid`. They're usually strings in a format the vendor controls, and the suffix makes it clear the value is a reference to someone else's record, not a key you can join on.

```sql
ALTER TABLE locations ADD COLUMN google_place_xid TEXT;
ALTER TABLE payments  ADD COLUMN stripe_charge_xid TEXT;
```

## Types Follow From the Name

| Suffix or prefix | Type | Example |
| ---------------- | ---- | ------- |
| `id`, `_id` | The schema's key type, `UUID` by default | `customer_id` |
| `_uid` | Universal key in a mixed schema | `address_uid` |
| `_xid` | External ID, usually `TEXT` | `stripe_charge_xid` |
| `_at` | `TIMESTAMPTZ`, stored in UTC | `created_at`, `deleted_at` |
| `_on` | `DATE`, no time component | `published_on` |
| `is_`, `has_`, `can_`, `do_` | `BOOLEAN NOT NULL` with a default | `is_active`, `has_logged_in`, `can_export`, `do_notify` |
| `amount`, `_amount` | `BIGINT` minor units, paired with a `currency` column | `fee_amount`, `fee_currency` |

A few rules behind the table:

- **Timestamps are always `TIMESTAMPTZ`.** A `TIMESTAMP` without a time zone is a number nobody can interpret correctly once servers or users span zones. See [Time & Date Formats](/docs/fundamentals/time).
- **Every table has `created_at`, and `updated_at` when rows change.** One name, everywhere: not `created_at` in some tables and `inserted_at` in others. Soft deletes are `deleted_at`, never a boolean, so you know when (see [Data Retention & Deletion](/docs/architecture/data-retention)).
- **Booleans are `NOT NULL`.** A nullable boolean has three values, and the third one is always a bug: what does `is_active = NULL` mean?
- **Prefer `TEXT` to `VARCHAR(255)`.** In Postgres they perform the same, and `255` is a habit inherited from other databases, not a real limit of anything. When a value genuinely has a maximum length, express it as a `CHECK` constraint with a name that says why.
- **Money follows [Money & Amounts](/docs/payments/money):** integer minor units in `BIGINT`, always with a currency next to it.

## Enumerations

Use `TEXT` with a `CHECK` constraint, with lowercase snake_case values that match the API:

```sql
status TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'captured', 'settled', 'failed', 'voided'))
```

Native `ENUM` types look tidier, but they're harder to change: values can be added but not easily removed or renamed, and changes interact awkwardly with transactions and migrations. A `CHECK` constraint is replaced like any other constraint. A lookup table is the right choice when values carry their own data (a display name, an ordering) or change without a deploy.

## Constraints and Indexes Have Predictable Names

Name constraints and indexes explicitly, using the same pattern Postgres uses when it generates names: the table, the columns, then a suffix.

| Object | Suffix | Example |
| ------ | ------ | ------- |
| Primary key | `_pkey` | `customers_pkey` |
| Unique constraint | `_key` | `customers_email_key` |
| Foreign key | `_fkey` | `addresses_customer_id_fkey` |
| Check constraint | `_check` | `payments_status_check` |
| Index | `_idx` | `addresses_customer_id_idx` |

Constraint names appear in error messages and in migrations. `violates unique constraint "customers_email_key"` tells whoever is on call exactly what happened; `violates unique constraint "uq_8f3a2"` sends them digging. Explicit names also mean a later migration can drop or replace the constraint by name, on every environment, without looking up what the database happened to call it.

## Notes

- UUID and GUID are the same thing; GUID is the Microsoft name.
- Conventions only pay off when they're universal. One table named `tblCustomer` makes every query writer stop and check the rest.

## References

**Specifications**

- [RFC 9562: Universally Unique IDentifiers](https://datatracker.ietf.org/doc/html/rfc9562), UUID formats behind `_id` and `_uid`

**Reference**

- [PostgreSQL: Lexical structure](https://www.postgresql.org/docs/current/sql-syntax-lexical.html), folding of unquoted identifiers to lowercase
- [PostgreSQL: SQL key words](https://www.postgresql.org/docs/current/sql-keywords-appendix.html), `USER` and `ORDER` as reserved words
- [PostgreSQL: UUID functions](https://www.postgresql.org/docs/current/functions-uuid.html), native `uuidv7()` from Postgres 18
- [PostgreSQL: Character types](https://www.postgresql.org/docs/current/datatype-character.html), no performance difference between `TEXT` and `VARCHAR`
- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), why foreign key columns usually need their own index

**In practice**

- [SQL Style Guide](https://www.sqlstyle.guide/), lowercase names with underscores
