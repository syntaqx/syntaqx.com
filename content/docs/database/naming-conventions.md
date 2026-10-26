+++
title = "Database Naming Conventions"
nav_title = "Naming Conventions"
description = "Naming and typing conventions for tables, columns, keys, constraints and indexes, so a schema is predictable enough to guess and safe to change."
category = "Database"
order = 501
tags = ["database", "naming", "conventions"]
aliases = ["database-naming-conventions"]
+++

A schema is read far more often than it's written: by people writing queries at 2 a.m., by migration tools, by analysts who've never seen the code. Good conventions let you guess a column's name, type and relationships without looking. A column ending in `_id` points at another table and probably needs an index; one ending in `_at` is a UTC timestamp. That predictability is worth more than any individual naming choice, and it only pays off when it's universal: one table named `tblCustomer` makes every query writer stop and check the rest.

## Casing: lowercase snake_case

Every table, column, index and constraint is lowercase with underscores between words: `customer_addresses`, `customer_id`, `first_name`.

This isn't just taste. Postgres folds unquoted identifiers to lowercase, so a table created as `"CustomerAddresses"` has to be quoted, exactly, in every query forever after; `SELECT * FROM CustomerAddresses` fails. snake_case also matches the API's [JSON field names](/docs/requests/json-conventions), so a column and the field it feeds share a name.

## Tables Are Plural

Tables hold many rows, so they're plural: `customers`, `payments`, `addresses`. Columns hold one value per row, so they're singular. Plural also sidesteps a real trap: `user` and `order` are reserved words in Postgres and the SQL standard, so a table called `user` has to be quoted everywhere. `users` and `orders` don't.

**Join tables** use the domain's name for the relationship when there is one (`memberships`, `enrollments`), and otherwise both tables (`project_collaborators`). A named relationship usually grows its own columns (a role, a joined date), and the name keeps that from looking strange later. See [Resource Relationships](/docs/api-design/resource-relationships).

## Keys

The primary key is always `id`. A foreign key is the singular of the related table plus `_id`:

```sql
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  placed_on   DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

- **`id` names the role, not the type.** It works the same for integers, UUIDs or ULIDs, as long as the schema is consistent. The default is [UUID v7](/docs/fundamentals/identifier-conventions): globally unique, sortable by creation time, and kind to B-tree indexes. Postgres 18 generates them natively with `uuidv7()`; on older versions, generate them in the application.
- **Declare foreign keys in transactional databases.** A missing constraint is how orphaned rows appear, and nobody notices until a report doesn't add up. Analytics warehouses often skip constraints for load speed and leave integrity to the pipeline; that's their call, not the application database's.
- **Index every foreign key column.** Postgres doesn't do it for you. Without one, deleting a customer scans all of `orders` to check for references, and joins on `customer_id` scan too.

When a schema mixes integer keys and universal ones, foreign keys to the universal ones end in `_uid`, so the type is obvious from the name (`post_uid UUID` next to `author_id BIGINT`). It's `_uid` rather than `_uuid` because the value might be a ULID. When universal IDs are the only kind, plain `_id` everywhere.

Identifiers from another system end in `_xid`: `google_place_xid`, `stripe_charge_xid`. They're usually strings in a format the vendor controls, and the suffix says the value references someone else's record, not a key you can join on.

## Types Follow From the Name

| Suffix or prefix | Type | Example |
| ---------------- | ---- | ------- |
| `id`, `_id` | The schema's key type, `UUID` by default | `customer_id` |
| `_uid` | Universal key in a mixed schema | `address_uid` |
| `_xid` | External ID, usually `TEXT` | `stripe_charge_xid` |
| `_at` | `TIMESTAMPTZ`, stored in UTC | `created_at`, `deleted_at` |
| `_on` | `DATE`, no time component | `published_on` |
| `is_`, `has_`, `can_`, `do_` | `BOOLEAN NOT NULL` with a default | `is_active`, `can_export` |
| `amount`, `_amount` | `BIGINT` minor units, paired with a `currency` column | `fee_amount`, `fee_currency` |
| `_during` | A range (`DATERANGE` or `TSTZRANGE`), closed-open, for effective dating; see [Effective Dating & History](/docs/database/temporal-data) | `valid_during`, `recorded_during` |

The rules behind the table:

- **Timestamps are always `TIMESTAMPTZ`.** A `TIMESTAMP` without a zone is a number nobody can interpret correctly once servers or users span zones. See [Time & Date Formats](/docs/fundamentals/time).
- **Every table has `created_at`, and `updated_at` when rows change.** One name everywhere, not `inserted_at` in some tables. Soft deletes are `deleted_at`, never a boolean, so you know when (see [Data Retention & Deletion](/docs/architecture/data-retention)).
- **Booleans are `NOT NULL`.** A nullable boolean has three values, and the third is always a bug.
- **Prefer `TEXT` to `VARCHAR(255)`.** In Postgres they perform the same, and `255` is a habit inherited from other databases, not a real limit. When a value genuinely has a maximum length, say so with a named `CHECK` constraint.
- **Money follows [Money & Amounts](/docs/payments/money):** integer minor units in `BIGINT`, always with a currency beside it.

## Enumerations

Use `TEXT` with a `CHECK` constraint, with lowercase snake_case values that match the API:

```sql
status TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'captured', 'settled', 'failed', 'voided'))
```

Native `ENUM` types look tidier but are harder to change: values can be added but not easily removed or renamed, and changes interact awkwardly with transactions and migrations. A `CHECK` constraint is replaced like any other. A lookup table is the right choice when values carry their own data (a display name, an ordering) or change without a deploy.

## Constraints and Indexes Have Predictable Names

Name constraints and indexes explicitly, using the pattern Postgres uses when it generates names: the table, the columns, then a suffix.

| Object | Suffix | Example |
| ------ | ------ | ------- |
| Primary key | `_pkey` | `customers_pkey` |
| Unique constraint | `_key` | `customers_email_key` |
| Foreign key | `_fkey` | `orders_customer_id_fkey` |
| Check constraint | `_check` | `payments_status_check` |
| Index | `_idx` | `orders_customer_id_idx` |

Constraint names appear in error messages and migrations. `violates unique constraint "customers_email_key"` tells whoever is on call exactly what happened; `"uq_8f3a2"` sends them digging. Explicit names also let a later migration drop or replace the constraint by name on every environment, without looking up what the database happened to call it.

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
