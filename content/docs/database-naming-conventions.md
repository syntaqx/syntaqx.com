+++
title = "Database Naming Conventions"
description = "Consistent naming for tables, columns, keys, and relationships."
category = "Database"
order = 10
tags = ["database", "naming", "conventions"]
+++

Consistent naming makes relationships discoverable, data types obvious, and audits straightforward. If a column ends in `_id`, you immediately know it's a relationship to another table and likely needs an index.

## Casing

All database constructs (tables, columns, nodes, predicates) use lowercase with underscores separating words.

```
customer_addresses
user_id
first_name
```

## Singular vs. Plural

Tables hold many rows, so they use plural names. Columns represent a single value per row, so they're always singular.

```sql
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  VARCHAR(255),
  last_name   VARCHAR(255),
  is_active   BOOLEAN DEFAULT TRUE,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Primary and Foreign Keys

The primary key is always `id`. A foreign key uses the singular form of the related table followed by `_id`.

If `users` has a one-to-many relationship with `addresses`, the foreign key column is `user_id`:

```sql
CREATE TABLE addresses (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  street  VARCHAR(255),
  city    VARCHAR(255)
);
```

### Using `id` with UUIDs or ULIDs

`id` is not limited to integers. If your project uses UUIDs or ULIDs as primary keys, `id` and `_id` still work as long as you're consistent across the dataset. The column name describes the role (primary key, foreign key), not the data type.

```sql
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  total       INTEGER NOT NULL
);
```

### When to use `_uid`

If you're mixing integer-based IDs and universal IDs within the same dataset, use `_uid` for universal foreign keys to remove ambiguity. The suffix is `_uid` rather than `_uuid` because the value isn't always a UUID type. It could be a UUID, ULID, or any other universally unique value.

When universal IDs are the only ID type in your schema, stick with `_id`. No suffix gymnastics needed.

```sql
-- Mixed: integer PKs on some tables, UUIDs on others
ALTER TABLE comments ADD COLUMN post_uid UUID NOT NULL;
ALTER TABLE comments ADD COLUMN author_id BIGINT NOT NULL;
```

### External IDs

Use `_xid` for identifiers that come from external systems. These are typically strings and don't need to follow your internal conventions since the format is dictated by the vendor.

```sql
ALTER TABLE locations ADD COLUMN google_place_xid VARCHAR(255);
ALTER TABLE payments  ADD COLUMN stripe_charge_xid VARCHAR(255);
```

### Notes

- UUID and GUID are the same thing. GUID is more common in the Microsoft ecosystem.
- Foreign keys may or may not have database-level constraints. In data warehouses, tables are often joined without formal foreign key constraints.

## Column Suffixes

| Suffix | Meaning | Example |
| ------ | ------- | ------- |
| `_id` | Foreign key (integer, or UUID/ULID when used consistently) | `user_id` |
| `_uid` | Universal foreign key when mixing ID types | `address_uid` |
| `_xid` | External/vendor ID | `google_place_xid` |
| `_at` | Datetime/timestamp | `created_at` |
| `_on` | Date (no time component) | `published_on` |

## Column Prefixes

| Prefix | Meaning | Example |
| ------ | ------- | ------- |
| `is_` | Boolean state | `is_active` |
| `has_` | Boolean possession | `has_logged_in` |
| `can_` | Boolean capability | `can_export` |
| `do_` | Boolean action flag | `do_notify` |
