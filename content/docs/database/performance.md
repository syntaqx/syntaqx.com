+++
title = "Database Performance"
description = "Measure before you optimize: reading query plans, designing indexes that earn their write cost, catching N+1 queries, pooling connections, and timeouts."
category = "Database"
order = 503
tags = ["database", "postgres", "performance", "indexes"]
+++

Most slow applications are slow in the database, and most slow databases are slow for a handful of reasons: a missing index, an index nobody uses, a query that runs once per row, or more connections than the server can hold. None are exotic, and all are found the same way: by measuring what the database actually does instead of guessing.

## Measure First

The query you think is slow usually isn't the one costing you. A report query that takes two seconds and runs twice a day matters less than a 15 ms lookup that runs 40,000 times an hour. Ranking by total time, not by worst time, is what finds the real cost.

On Postgres, [`pg_stat_statements`](https://www.postgresql.org/docs/current/pgstatstatements.html) records every normalized statement with its call count, `total_exec_time` and `mean_exec_time`. It loads through `shared_preload_libraries`, so adding it takes a restart: enable it on day one, not during an incident.

```sql
SELECT query, calls, round(total_exec_time) AS total_ms, round(mean_exec_time, 1) AS mean_ms
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

Pair it with `log_min_duration_statement` ([logging settings](https://www.postgresql.org/docs/current/runtime-config-logging.html)) so slow statements land in the logs with their parameters, and with traces that show which request issued them ([Observability](/docs/operations/observability)). Fix the top of the list, then measure again.

## Reading a Plan

[`EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html) shows the plan the planner chose; `EXPLAIN (ANALYZE, BUFFERS)` runs the query and shows what actually happened. Read the second, because the gap between the two is usually the bug:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM payments WHERE account_id = $1 AND status = 'pending'
ORDER BY created_at DESC LIMIT 25;
```

What to look for, roughly in order:

- **Estimated rows vs actual rows.** When the planner expected 10 rows and got 400,000, every later choice (join order, join type, index or not) was made on bad information. Stale statistics (`ANALYZE` the table) or correlated columns are the usual causes.
- **Sequential scans on large tables** in a query that should touch a few rows. That's a missing or unusable index.
- **Rows removed by filter.** An index scan that reads 50,000 rows to return 25 means the index matches the first condition but not the rest.
- **Sorts that spill to disk.** A sort that doesn't fit in `work_mem` writes temporary files; an index in the right order can make the sort disappear entirely.

`ANALYZE` actually executes the statement, so wrap writes in a transaction you roll back, and never run it casually against production for a query that changes data.

## Indexes That Earn Their Keep

An index is a second, sorted copy of some columns that every insert, update and delete has to maintain. It makes the reads it fits fast and every write slower, so every index should exist because a measured query needs it, not because a column "might be searched".

### Column Order in Composite Indexes

A B-tree index on `(account_id, status, created_at)` is sorted by `account_id`, then by `status` within each account, then by time. Postgres can use it efficiently for equality on the leading columns plus a range or sort on the next one; columns further right can still be checked inside the index but don't narrow how much of it is scanned ([multicolumn indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)). The rule of thumb that follows:

1. **Equality columns first** (`account_id = $1 AND status = 'pending'`).
2. **Then the range or sort column** (`ORDER BY created_at DESC`).

That index serves the query above with no sort and no filter: it walks one account's pending payments newest first and stops after 25. Put `created_at` first and it has to scan every account's recent rows to find the right ones. The same docs advise using multicolumn indexes sparingly; more than three columns is rarely worth it unless the query pattern is very stable.

### Covering and Partial Indexes

- **Covering indexes** (`INCLUDE (amount, currency)`) carry extra columns so a query can be answered from the index alone, an [index-only scan](https://www.postgresql.org/docs/current/indexes-index-only-scans.html), without visiting the table. Worth it for hot, narrow queries; wasteful as a habit, because every included column is copied into the index.
- **Partial indexes** index only the rows a query asks about: `CREATE INDEX ... ON jobs (run_at) WHERE status = 'pending'`. When 99% of rows are finished, an index of the pending 1% is small, fast and cheap to maintain ([partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html)).

### When Not to Index

- Columns with few distinct values on their own (`is_active`), unless as part of a composite or partial index.
- Tables small enough that a sequential scan is faster than the index lookup.
- Write-heavy tables where the read the index serves is rare. Measure the write cost too.
- Duplicates: an index on `(a)` is redundant next to one on `(a, b)`, because the composite already serves queries on `a`.

Foreign keys are the exception the other way: Postgres doesn't index them, and an unindexed one makes every join, and every delete on the parent, scan the child table ([Naming Conventions](/docs/database/naming-conventions)).

## N+1 Queries

The most common performance bug in application code isn't a slow query; it's a fast query run once per row. Load 50 orders, loop over them fetching each one's customer, and you've made 51 round trips where 2 would do. Each is a millisecond, so it's invisible in development with 5 rows and an outage in production with 5,000.

- **Fetch related rows in one query:** a join, or `WHERE customer_id = ANY($1)` with the collected IDs, then match them up in code.
- **Catch it automatically.** Count queries per request in tests and fail when an endpoint's count grows with the data. In traces, N+1 shows up as a staircase of identical spans.
- **Design APIs that don't invite it.** [Expanding related resources](/docs/api-design/resource-relationships) lets clients fetch related objects in one request instead of looping.

## Pagination at Depth

`OFFSET 100000 LIMIT 25` reads and discards 100,000 rows before returning 25. Keyset pagination, `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 25`, starts from the index exactly where the last page ended, at the same speed on every page. That's why the API uses cursors ([Pagination](/docs/requests/pagination); [Use The Index, Luke](https://use-the-index-luke.com/no-offset) has the details).

## Connections and Pooling

Every Postgres connection is a backend process with its own memory, and a server handles a few hundred well, not tens of thousands. Serverless functions are the worst case: each concurrent invocation wants its own connection, a spike multiplies them, and suspended instances can hold connections nobody is using ([Vercel: connection pooling with functions](https://vercel.com/kb/guide/connection-pooling-with-functions)).

- **Put a pooler between the app and the database.** PgBouncer (or your provider's built-in pooler) multiplexes many client connections onto a few server ones.
- **Know what transaction pooling breaks.** In transaction mode, a client only holds a server connection for one transaction, so anything that assumes a session breaks: session-level `SET`, `LISTEN`, session advisory locks, and SQL-level `PREPARE`. Protocol-level prepared statements work only when `max_prepared_statements` is set ([PgBouncer features](https://www.pgbouncer.org/features.html)). Use `SET LOCAL` and transaction-level advisory locks instead.
- **Size pools for the database, not the app.** A pool of 20 per instance across 50 instances is 1,000 connections.

## Timeouts

A query with no time limit can hold locks and a connection forever, and one runaway report can take the whole pool with it. Postgres ships with every timeout disabled, so set them deliberately ([client settings](https://www.postgresql.org/docs/current/runtime-config-client.html)):

| Setting | What it stops |
| ------- | ------------- |
| `statement_timeout` | A single query running longer than its budget |
| `lock_timeout` | A statement waiting too long for a lock, such as a migration queued behind a long transaction ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations)) |
| `idle_in_transaction_session_timeout` | A session that opened a transaction and wandered off, holding locks and blocking vacuum |

Set them per role or session, not globally: the Postgres docs advise against the global setting because it also hits maintenance and migrations that legitimately run long. A web role with a 5-second `statement_timeout` and a reporting role with a longer one is a reasonable shape, matched to the request budgets in [Retries & Timeouts](/docs/architecture/retries-and-timeouts).

## Read Replicas

Replicas add read capacity at the cost of consistency: data reaches a standby after the primary commits, so the same query on both can disagree ([hot standby](https://www.postgresql.org/docs/current/hot-standby.html)). The classic bug: a user saves a change, the next page reads from a replica, and their change is "gone".

- **Read your own writes from the primary** for a short window after a user changes something, or for the rest of that request.
- **Send replicas the reads that tolerate lag:** reports, search, dashboards.
- **Watch replication lag** as a metric, and expect long replica queries to be cancelled when they conflict with changes replayed from the primary.

Replicas are a scaling step for read-heavy load you've measured, not a first response to a slow query; an index is cheaper.

## References

**Reference**

- [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html), reading plans and EXPLAIN ANALYZE
- [PostgreSQL: Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html), leading-column rule and using composites sparingly
- [PostgreSQL: Index-Only Scans and Covering Indexes](https://www.postgresql.org/docs/current/indexes-index-only-scans.html), INCLUDE columns
- [PostgreSQL: Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html), indexing only the rows a query needs
- [PostgreSQL: pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html), per-statement totals and preload requirement
- [PostgreSQL: Client Connection Defaults](https://www.postgresql.org/docs/current/runtime-config-client.html), statement, lock and idle-in-transaction timeouts
- [PostgreSQL: Error Reporting and Logging](https://www.postgresql.org/docs/current/runtime-config-logging.html), logging slow statements
- [PostgreSQL: Hot Standby](https://www.postgresql.org/docs/current/hot-standby.html), replica lag and query conflicts
- [PgBouncer: Features](https://www.pgbouncer.org/features.html), what transaction pooling supports

**In practice**

- [Use The Index, Luke](https://use-the-index-luke.com/), how indexes work and why OFFSET pagination doesn't scale
- [Vercel: Connection pooling with functions](https://vercel.com/kb/guide/connection-pooling-with-functions), why serverless needs a pool
