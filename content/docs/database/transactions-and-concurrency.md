+++
title = "Transactions & Concurrency"
description = "What isolation levels really guarantee, stopping lost updates with optimistic or pessimistic locking, retrying serialization failures, and avoiding deadlocks."
category = "Database"
order = 502
tags = ["database", "postgres", "transactions", "concurrency"]
+++

Concurrency bugs are the ones that pass every test. Each request is correct on its own; the bug only exists when two interleave, which happens rarely in development and constantly in production. Wrapping code in a transaction doesn't make it safe. What a transaction guarantees depends on its isolation level, and most code runs at a level that allows more than its authors assume.

## What Isolation Levels Allow

The SQL standard defines four isolation levels by which anomalies they permit. Postgres implements them on top of snapshots, which makes some levels stronger than the standard requires ([transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)):

| Level | Dirty read | Non-repeatable read | Phantom read | Serialization anomaly |
| ----- | ---------- | ------------------- | ------------ | --------------------- |
| Read uncommitted | Not in Postgres | Possible | Possible | Possible |
| Read committed (the default) | No | Possible | Possible | Possible |
| Repeatable read | No | No | Not in Postgres | Possible |
| Serializable | No | No | No | No |

The anomalies, in plain terms:

- **Non-repeatable read:** reading the same row twice in one transaction and getting different values, because another transaction committed in between.
- **Phantom read:** running the same query twice and getting a different set of rows.
- **Serialization anomaly, including write skew:** two transactions each read something, each make a decision based on it, and each write. Individually fine, together wrong. Two doctors both check that someone else is on call, both go off call, and nobody is.

The practical consequence: at the default level, **every statement sees a fresh snapshot**, so a `SELECT` followed by an `UPDATE` based on it is not atomic, even inside `BEGIN ... COMMIT`.

## The Lost Update

The most common concurrency bug in application code:

```text
Request A: SELECT balance FROM accounts WHERE id = 1   -- 100
Request B: SELECT balance FROM accounts WHERE id = 1   -- 100
Request A: UPDATE accounts SET balance = 100 - 30      -- 70
Request B: UPDATE accounts SET balance = 100 - 50      -- 50, A's withdrawal is gone
```

Both requests read, computed in application code, and wrote back. The fix is to stop doing read-modify-write in the application, in order of preference:

1. **Make the change atomic in one statement:** `UPDATE accounts SET balance = balance - 30 WHERE id = 1 AND balance >= 30`. The database reads and writes the row under one row lock, so concurrent updates serialize. The `WHERE` clause turns the business rule into a guard, and zero rows updated means the rule failed.
2. **Optimistic concurrency** when the decision can't fit in one statement.
3. **Pessimistic locking** when conflicts are frequent.

## Optimistic Concurrency

Give the row a version (an integer, or `updated_at`), read it with the data, and make the write conditional on it:

```sql
UPDATE documents
SET body = $1, version = version + 1
WHERE id = $2 AND version = $3;   -- the version you read
```

If another writer got there first, the version moved and zero rows are updated: your code knows it lost the race and can reload, reapply, or tell the user. No lock is held while the user thinks or the code computes, so throughput stays high when conflicts are rare. When they're common, repeated retries waste more work than a lock would.

The same mechanism shows up at every layer: guarded status transitions in [Payment States & Ledgers](/docs/payments/payment-states), and `If-Match` with `412 Precondition Failed` in [Caching & Conditional Requests](/docs/requests/caching), which is optimistic concurrency over HTTP.

## Pessimistic Locking

`SELECT ... FOR UPDATE` locks the rows it reads until the transaction ends, so a second transaction that wants them waits instead of racing:

```sql
BEGIN;
SELECT * FROM inventory WHERE sku = $1 FOR UPDATE;
-- decide, with the row guaranteed not to change underneath you
UPDATE inventory SET reserved = reserved + 1 WHERE sku = $1;
COMMIT;
```

Use it when conflicts are frequent enough that optimistic retries would thrash, or when the read-decide-write has to be right the first time. The cost is waiting: every transaction touching that row queues behind you, so keep the locked section short.

### SKIP LOCKED for Work Queues

`FOR UPDATE SKIP LOCKED` skips rows another transaction has locked instead of waiting, which turns a table into a work queue: each worker claims a different row and none block each other. The Postgres docs are explicit that this gives an inconsistent view of the data, fine for queue-like tables and wrong for general queries ([SELECT locking clause](https://www.postgresql.org/docs/current/sql-select.html)). See [Background Jobs](/docs/architecture/background-jobs).

## Serializable, With Retries

Serializable isolation removes every anomaly, including write skew, by detecting when concurrent transactions couldn't have run one after another and aborting one. It's the right tool when an invariant spans rows and can't be expressed as a constraint or a single guarded statement.

The price is that **aborts are normal, not exceptional.** Postgres reports them with SQLSTATE `40001`, and its docs say applications must be prepared to retry the whole transaction (repeatable read raises the same error when a concurrent update hits a row you're changing). So a serializable transaction needs a retry loop:

- Retry the **entire** transaction, including the reads, never just the failed statement.
- Bound the retries and back off between them ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).
- Keep the transaction free of side effects outside the database, because it may run more than once.

## Deadlocks

Two transactions each hold a lock the other wants. Postgres detects this and aborts one of them, and which one is unpredictable ([explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)). Ordinary row updates are enough to cause it: transfer A→B locks A then B, transfer B→A locks B then A.

- **Lock in a consistent order.** Sort the IDs and update the lower one first. The Postgres docs call consistent ordering the best defense.
- **Treat a deadlock abort as retryable,** like a serialization failure.
- **Keep transactions short,** so the window where they can overlap is small.

## Keep Transactions Short, and Local

A transaction holds its locks and its snapshot until it ends. A long one blocks writers, blocks [migrations](/docs/database/zero-downtime-migrations) waiting for locks, and stops vacuum from cleaning up rows that died while it was open.

**Never call an external service inside a transaction.** A processor call, an email send or a queue publish can take seconds or hang, holding locks the whole time, and if the transaction then rolls back, the external effect has already happened. Make the call before (and record its result) or after (from an [outbox](/docs/architecture/events)), never in the middle. `idle_in_transaction_session_timeout` is the safety net for code that forgets ([Database Performance](/docs/database/performance)).

## Distributed Locks: Avoid Them

"Only one worker should do this" tempts people toward a lock in Redis. But a process that pauses (GC, a slow network, a clock jump) can lose its lock while still believing it holds it, and then two processes do the work. Martin Kleppmann's analysis of Redlock argues that timing-based locks can't guarantee correctness without a **fencing token**: a number that increases with every grant, checked by the storage being protected, so a stale holder's writes are rejected ([How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)).

You rarely need one:

- **If the data lives in Postgres, let Postgres arbitrate:** a unique constraint, a guarded update or `FOR UPDATE` is already a correct lock.
- **Advisory locks** give you a named mutex in the database you already trust. Prefer the transaction-level form (`pg_advisory_xact_lock`), which releases automatically at commit or rollback; the session-level form survives a rollback and must be released explicitly, and it doesn't work behind a transaction-pooling connection pooler.
- **A lock that only prevents duplicate work,** not incorrect results, can be best-effort. Make the work idempotent and let the rare duplicate run.

## References

**Reference**

- [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), what each level allows, and retrying 40001 failures
- [PostgreSQL: Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html), snapshots and MVCC
- [PostgreSQL: Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html), row locks, deadlock detection and advisory locks
- [PostgreSQL: SELECT, The Locking Clause](https://www.postgresql.org/docs/current/sql-select.html), FOR UPDATE, NOWAIT and SKIP LOCKED

**In practice**

- [Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html), why timing-based locks need fencing tokens
- [2ndQuadrant: What is SELECT SKIP LOCKED for in PostgreSQL 9.5?](https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/), queue consumers without lock contention
