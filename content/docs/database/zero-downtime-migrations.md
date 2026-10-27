+++
title = "Zero-Downtime Migrations"
description = "Changing a live schema without downtime: the expand and contract pattern, safe backfills, lock-aware DDL, and the order to ship code and migrations in."
category = "Database"
order = 504
tags = ["database", "migrations", "postgres", "operations"]
aliases = ["zero-downtime-migrations"]
+++

During a deploy, old and new versions of the code run against the same database at the same time: for seconds with a rolling deploy, longer with a canary, and indefinitely if you roll back. Every migration has to work with both. That one constraint rules out most "simple" changes, like renaming a column in a single step, and it's why schema changes deserve their own discipline.

A maintenance window avoids the problem by taking the product down, which means scheduling around traffic and batching changes into risky releases. With [continuous deployment](/docs/delivery/ci-pipelines) there's no window to schedule into, so migrations have to be safe on a live system.

## Expand and Contract

Every breaking schema change is split into steps that are each backward compatible, a pattern also known as [parallel change](https://martinfowler.com/bliki/ParallelChange.html):

1. **Expand.** Add the new structure alongside the old one. Nothing reads it yet.
2. **Write both.** Deploy code that writes to the old and the new.
3. **Backfill.** Copy existing data into the new structure.
4. **Read new.** Deploy code that reads from the new structure.
5. **Stop writing old.** Deploy code that no longer touches the old structure.
6. **Contract.** Drop the old structure.

Each step is its own deploy, and each can be rolled back without undoing the one before. At no point is there a version of the code the current schema can't serve. It costs more deploys than a one-shot change, and in exchange none of them can take the site down.

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

A single `ALTER TABLE users RENAME COLUMN` takes effect instantly, and every old instance still running fails on its next query until it's replaced.

![Dimensional timeline of the rename from users.name to users.full_name over six deploys. The name column is read and written until d4, written only until d5, and unused until d6 drops it. The full_name column is added empty at d1, written from d2, filled by a batched backfill job from d3, and read and written from d4 on. A dimension marks at least one deploy cycle between d5 and the drop at d6, and a table lists each step's schema change, reads and writes.](/diagrams/pb-database-expand-contract.svg "Six deploys, each one compatible with the one before it, so any of them can roll back; only the drop is irreversible, and it ships last and alone.")

## Backfills

- **Batch it.** Hundreds to low thousands of rows per batch, each in its own transaction, with a short pause between. One `UPDATE` across 50 million rows holds row locks for its whole duration, floods replicas with write-ahead log, and leaves a table full of dead tuples for vacuum.
- **Make it resumable.** Key off `WHERE new_column IS NULL` or an ID cursor, so a backfill interrupted at 60% resumes at 60%, not zero.
- **Run it as a job, not a migration.** Schema migrations should finish in seconds, inside the deploy. Data work that takes hours runs separately, with progress you can watch and a way to pause it.
- **Verify before you contract.** Count the rows that still differ; drop only at zero. Dropping a column with data you didn't copy is the one step here you can't roll back.

## Lock-Aware DDL

Some DDL takes an `ACCESS EXCLUSIVE` lock that blocks every read and write on the table while it runs, so a statement that's instant in development can stall production for minutes. On Postgres:

| Change | Safe approach |
| ------ | ------------- |
| Add an index | `CREATE INDEX CONCURRENTLY` (slower, and can't run in a transaction, but doesn't block writes) |
| Add a foreign key | `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` separately |
| Add `NOT NULL` | Add a `CHECK (col IS NOT NULL) NOT VALID`, validate it, then `SET NOT NULL`, which skips the table scan once a valid check proves there are no nulls. Postgres 18 can also add the `NOT NULL` constraint itself as `NOT VALID` |
| Add a column with a default | Safe on Postgres 11+ when the default is non-volatile: it's stored as metadata, not written to every row |
| Change a column's type | Usually rewrites the table. Use expand and contract with a new column |

`NOT VALID` is the general trick: add the constraint for new rows immediately, under a brief lock, and validate existing rows later under a lock that doesn't block writes.

**Set a [`lock_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html)** of a few seconds on migration sessions. The dangerous case isn't the DDL itself; it's DDL waiting for a lock behind one long-running query, while every other query on the table queues behind it, so a 10-second report becomes a site-wide stall. With a timeout, the migration fails fast and retries instead.

## Shipping Order

- **Migrations run before the code that needs them,** as their own pipeline step, so the expanded schema is in place before any code relies on it.
- **No deploy depends on migration and code landing at the same instant.** Either can be ahead of the other and nothing breaks, which is what makes the deploy safe to roll back.
- **Destructive steps ship last and alone.** A `DROP` is never bundled with other changes, and waits at least one full deploy cycle after the last code that used the column, so a rollback never lands on code that expects a column that's gone.

## Financial Tables

On ledger and payment tables the bar is higher. Backfills never modify existing financial rows in place: those rows are [append-only](/docs/payments/payment-states), and an in-place backfill is exactly the untraceable edit the ledger exists to prevent. New derived columns are filled from the history, and reconciliation runs before and after to prove no balance changed.

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
