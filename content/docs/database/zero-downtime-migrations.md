+++
title = "Zero-Downtime Migrations"
description = "Changing a live schema without downtime: the expand and contract pattern, safe backfills, lock-aware DDL, and the order to ship code and migrations in."
category = "Database"
order = 10.5
tags = ["database", "migrations", "postgres", "operations"]
aliases = ["zero-downtime-migrations"]
+++

During a deploy, old and new versions of the code run against the same database at the same time: for seconds with a rolling deploy, longer with a canary, and indefinitely if you have to roll back. Every migration has to work with both versions. That one constraint rules out most "simple" changes, like renaming a column in a single step, and it's why schema changes deserve their own discipline.

The alternative, a maintenance window, works until it doesn't. It means scheduling changes around traffic, batching them into risky releases, and telling customers the product is down so the schema can change. With [continuous deployment](/docs/delivery/continuous-deployment), there's no window to schedule into, so migrations have to be safe on a live system.

## Expand and Contract

Every breaking schema change is split into steps that are each backward compatible, a pattern also known as [parallel change](https://martinfowler.com/bliki/ParallelChange.html):

1. **Expand.** Add the new structure alongside the old one. Nothing reads it yet.
2. **Write both.** Deploy code that writes to the old and the new.
3. **Backfill.** Copy existing data into the new structure.
4. **Read new.** Deploy code that reads from the new structure.
5. **Stop writing old.** Deploy code that no longer touches the old structure.
6. **Contract.** Drop the old structure.

Each step is its own deploy, and each can be rolled back without undoing the one before. That's the property that matters: at no point is there a version of the code that the current schema can't serve. It costs more deploys than a one-shot change, and in exchange none of them can take the site down.

### Example: Renaming a Column

Renaming `users.name` to `users.full_name`:

```sql
-- 1. Expand
ALTER TABLE users ADD COLUMN full_name TEXT;

-- 3. Backfill, one batch at a time until no rows are left (see below)
UPDATE users SET full_name = name
WHERE id IN (SELECT id FROM users WHERE full_name IS NULL LIMIT 1000);

-- 6. Contract, once no code reads or writes "name"
ALTER TABLE users DROP COLUMN name;
```

A single `ALTER TABLE users RENAME COLUMN` takes effect instantly, and every running instance of the old code starts failing on its next query. On a rolling deploy, that's every request served by old instances until they're replaced.

## Backfills

- **Batch it.** Small batches (hundreds to low thousands of rows), each in its own transaction, with a short pause between. One `UPDATE` across 50 million rows holds row locks for its whole duration, generates a burst of write-ahead log that replicas have to replay, and leaves a table full of dead tuples for vacuum to clean up.
- **Make it resumable.** Key off `WHERE new_column IS NULL` or an ID cursor, so a backfill interrupted at 60% resumes at 60%, not zero.
- **Run it as a job, not a migration.** Schema migrations should finish in seconds, inside the deploy. Data work that takes hours runs separately, with progress you can watch and a way to pause it.
- **Verify before you contract.** Count the rows that still differ. Zero, then drop. Dropping a column with data you didn't copy is the one step in this process you can't roll back.

## Lock-Aware DDL

Some DDL takes an `ACCESS EXCLUSIVE` lock that blocks every read and write on the table for as long as it runs. On a big table, a statement that's instant in development can stall production for minutes. On Postgres:

| Change | Safe approach |
| ------ | ------------- |
| Add an index | `CREATE INDEX CONCURRENTLY` (slower, and can't run in a transaction, but doesn't block writes) |
| Add a foreign key | `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` separately |
| Add `NOT NULL` | Add a `CHECK (col IS NOT NULL) NOT VALID`, validate it, then `SET NOT NULL`, which skips the table scan once a valid check proves there are no nulls. Postgres 18 can also add the `NOT NULL` constraint itself as `NOT VALID` |
| Add a column with a default | Safe on Postgres 11+ when the default is non-volatile: it's stored as metadata, not written to every row |
| Change a column's type | Usually rewrites the table. Use expand and contract with a new column |

`NOT VALID` is the general trick: add the constraint for new rows immediately, under a brief lock, and validate existing rows later under a lock that doesn't block writes.

**Set a [`lock_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html)** on migration sessions, a few seconds. The dangerous case isn't the DDL itself; it's DDL waiting for a lock behind one long-running query. While it waits in the queue, every other query on the table queues behind it, and a 10-second report becomes a site-wide stall. With a timeout, the migration fails fast and retries, instead of taking production down while it waits.

## Shipping Order

- **Migrations run before the code that needs them,** as their own step in the deploy pipeline. The expanded schema is always in place before any code relies on it.
- **No deploy depends on migration and code landing at the same instant.** If the migration has run but the code hasn't, or the reverse, nothing breaks. That's what makes the deploy itself safe to roll back.
- **Destructive steps ship last and alone.** A `DROP` is never bundled with other changes, and it waits at least one full deploy cycle after the last code that used the column, so a rollback never lands on code that expects a column that's gone.

## Financial Tables

On ledger and payment tables the bar is higher. Backfills never modify existing financial rows in place, because those rows are [append-only](/docs/payments/payment-states) and an in-place backfill is exactly the kind of untraceable edit the ledger exists to prevent. New derived columns are filled from the append-only history, and reconciliation runs before and after to prove that no balance changed.

## References

**Reference**

- [PostgreSQL: CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html), building indexes `CONCURRENTLY`
- [PostgreSQL: ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html), `NOT VALID`, `VALIDATE CONSTRAINT`, skipped scans for `SET NOT NULL`, and non-volatile defaults
- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), which DDL takes which lock
- [PostgreSQL: Client connection defaults](https://www.postgresql.org/docs/current/runtime-config-client.html), `lock_timeout`

**In practice**

- [Martin Fowler: Parallel Change](https://martinfowler.com/bliki/ParallelChange.html), the expand and contract pattern
- [Stripe: Online migrations at scale](https://stripe.com/blog/online-migrations), dual writes and backfills on live data
- [strong_migrations](https://github.com/ankane/strong_migrations), a catalog of unsafe migrations and safe alternatives
