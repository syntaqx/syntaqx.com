+++
title = "Zero-Downtime Migrations"
description = "Changing a live schema without downtime: the expand and contract pattern, safe backfills, lock-aware DDL, and the order to ship code and migrations in."
category = "Database"
order = 10.5
tags = ["database", "migrations", "postgres", "operations"]
aliases = ["zero-downtime-migrations"]
+++

During a deploy, old and new versions of the code run against the same database at the same time. Every migration has to work with both. That rules out most "simple" changes, like renaming a column, done in a single step.

## Expand and Contract

Every breaking schema change is split, as a [parallel change](https://martinfowler.com/bliki/ParallelChange.html), into steps that are each backward compatible:

1. **Expand.** Add the new structure alongside the old one. Nothing reads it yet.
2. **Write both.** Deploy code that writes to old and new.
3. **Backfill.** Copy existing data into the new structure.
4. **Read new.** Deploy code that reads from the new structure.
5. **Stop writing old.** Deploy code that no longer touches the old structure.
6. **Contract.** Drop the old structure.

Each step is its own deploy, and each can be rolled back without the one before it.

### Example: Renaming a Column

Renaming `users.name` to `users.full_name`:

```sql
-- 1. Expand
ALTER TABLE users ADD COLUMN full_name TEXT;

-- 3. Backfill, in batches (see below)
UPDATE users SET full_name = name
WHERE id IN (SELECT id FROM users WHERE full_name IS NULL LIMIT 1000);

-- 6. Contract, after no code reads or writes "name"
ALTER TABLE users DROP COLUMN name;
```

A single `ALTER TABLE users RENAME COLUMN` would break every running instance of the old code the moment it ran.

## Backfills

- **Batch it.** Small batches (hundreds to low thousands of rows), each in its own transaction, with a short pause between. One giant `UPDATE` holds locks and bloats the table.
- **Make it resumable.** Key off something like `WHERE new_column IS NULL` or an ID cursor so it can stop and restart.
- **Run it as a job, not a migration.** Schema migrations should finish in seconds. Long data work runs separately, with progress you can watch.
- **Verify before you contract.** Count the rows that still differ. Zero, then drop.

## Lock-Aware DDL

Some DDL takes locks that block every read and write on the table. On Postgres:

| Change | Safe approach |
| ------ | ------------- |
| Add an index | `CREATE INDEX CONCURRENTLY` |
| Add a foreign key | `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` separately |
| Add `NOT NULL` | Add a `CHECK (col IS NOT NULL) NOT VALID`, validate it, then set `NOT NULL` |
| Add a column with a default | Safe on Postgres 11+ for constant defaults |
| Change a column type | Usually a rewrite. Use expand and contract with a new column |

Set a [`lock_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html) on migration sessions (a few seconds). A migration that can't get its lock should fail and be retried, not queue behind a long transaction while every other query queues behind it.

## Shipping Order

- **Migrations run before the code that needs them,** as their own step in the deploy pipeline.
- **Code never depends on a migration in the same deploy** in a way that breaks if the migration has run but the code hasn't (or the other way around).
- **Destructive steps ship last and alone.** A `DROP` is never bundled with other changes, and it waits at least one full deploy cycle after the last code that used the column.

## Financial Tables

On ledger and payment tables the bar is higher: backfills never modify existing financial rows in place (see [Payment States & Ledgers](/docs/payments/payment-states)). New derived columns are filled from the append-only history, and reconciliation runs before and after to prove nothing changed.

## References

**Reference**

- [PostgreSQL: CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html), `CONCURRENTLY`
- [PostgreSQL: ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html), `NOT VALID` and `VALIDATE CONSTRAINT`
- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), which DDL takes which lock
- [PostgreSQL: Client connection defaults](https://www.postgresql.org/docs/current/runtime-config-client.html), `lock_timeout`

**In practice**

- [Martin Fowler: Parallel Change](https://martinfowler.com/bliki/ParallelChange.html), the expand and contract pattern
- [Stripe: Online migrations at scale](https://stripe.com/blog/online-migrations), dual writes and backfills on live data
- [strong_migrations](https://github.com/ankane/strong_migrations), a catalog of unsafe migrations and safe alternatives
