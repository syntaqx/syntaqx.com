+++
title = "Real-Time Analytical Databases"
nav_title = "Analytical Databases"
description = "ClickHouse, Druid, Pinot, StarRocks and DuckDB: how columnar storage and vectorized execution work, where real-time OLAP beats a warehouse, and update costs."
category = "Data Platforms"
order = 1273
tags = ["data", "olap", "clickhouse", "analytics", "observability"]
+++

A warehouse answers questions for the people inside the company, and it is allowed to take a few seconds and cost a few cents per query. Some questions can't wait that long or run that often. A merchant opens their dashboard and expects today's sales by the minute. A game's live operations team watches concurrency during a launch. An on-call engineer filters a billion log lines by a customer ID. A field service dispatcher wants every technician's progress against the plan, refreshed every few seconds, for every branch at once.

These workloads share a shape: fresh data, sub-second answers, high query concurrency, and often an end customer on the other side of the screen. That is the job of a real-time analytical database. This chapter explains the two ideas underneath them (columnar storage and vectorized execution), the main systems, and the price they charge for their speed: updates and deletes are hard.

## Columnar Storage

A row store keeps each row's values together, which is ideal for "fetch order 42 and all its fields." A column store keeps each column's values together, which is ideal for "sum `amount` over a billion orders." ClickHouse's own definition is a database that "stores the data of each column independently," so a query reads only the columns it names; the cost is that "operations that affect whole rows become proportionally more expensive" ([ClickHouse: What is a columnar database?](https://clickhouse.com/docs/faq/general/columnar-database)).

Three effects stack:

- **Read less.** A query over 3 columns of a 60-column event table reads about a twentieth of the bytes.
- **Compress more.** Values of one type and similar distribution sit next to each other, which compresses far better than mixed rows, and compression "improves query performance as local disks and network I/O are often constrained by low throughput" ([ClickHouse: Why is ClickHouse so fast?](https://clickhouse.com/docs/concepts/why-clickhouse-is-so-fast)).
- **Skip blocks.** Data sorted by a key, with a small index of where each block starts, lets the engine skip everything outside the query's range.

ClickHouse's MergeTree makes the third effect concrete. Rows in each part are sorted by the table's `ORDER BY` key, and the primary index "does not reference individual rows but blocks of 8192 rows called granules," which keeps the index small enough to stay in memory ([ClickHouse: MergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree)).

![Plan view of one MergeTree part as a grid: six column files as rows (tenant_id, occurred_at, type, match_id, region, payload) and eight granules as columns, each G1 = 8,192 rows, for a part of P1 = 8 x G1 = 65,536 rows. A sparse index row above the grid holds one mark per granule. A query filtering on tenant and time and grouping by type reads only granules 3 and 4, the highlighted R1 = 2 x G1 = 16,384 rows, and only the three columns it names, C1 = 3 of 6. The variable table computes the fraction read F1 = (2 x 3) / (8 x 6) = 12.5 percent.](/diagrams/dp-analytical-granules.svg "Columnar storage and a sparse index multiply: the query opens 3 of 6 columns and 2 of 8 granules, an eighth of the part. G1 is ClickHouse's default; the part and the query are illustrative.")

The design lesson is that the sort key is the most important decision in the table. Put the columns every query filters on first (usually tenant, then time), and the engine skips most of the data before it reads a byte.

## Vectorized Execution

The classic database executor pulls one row at a time through a tree of operators, paying a function call and a branch per row per operator. On analytical queries over billions of rows, that overhead dominates.

Vectorized engines pass batches instead. In ClickHouse, operators "pass intermediate result rows in batches instead of single rows," which keeps CPU caches warm and "allows operators to apply SIMD instructions to process multiple values at once"; the query plan is also split into lanes, "typically one per core," so a single query uses the whole machine. DuckDB describes the same design as "a columnar-vectorized query execution engine," where queries are still interpreted but each operation works on a vector of values ([DuckDB: Why DuckDB](https://duckdb.org/why_duckdb)). Every system in this chapter is built this way, which is why the same hardware that struggles with a row-at-a-time report answers it interactively in a columnar engine.

## ClickHouse

ClickHouse is the system I reach for first: open source, fast at both ingestion and queries, and operable by a small team (or bought as a managed service).

- **MergeTree tables.** Each insert writes a new sorted part, and "insert operations create table parts which are merged by a background process with other table parts." Partitions (usually by month or day) bound merges and let old data be dropped cheaply. TTL rules expire rows or move them to cheaper disks, evaluated "during background merges, and not at insert time."
- **Materialized views are insert triggers.** A view "is just a trigger that runs a query on blocks of data as they're inserted into a table" and writes the result into a target table, often a `SummingMergeTree` or `AggregatingMergeTree` that folds partial results together during merges ([ClickHouse: Incremental materialized views](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)). This is how a raw event table feeds a minute-level rollup with no batch job.

```sql
CREATE TABLE match_events (
  id           UUID,
  tenant_id    UUID,
  match_id     UUID,
  type         LowCardinality(String),
  region       LowCardinality(String),
  occurred_at  DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(occurred_at)
ORDER BY (tenant_id, occurred_at)
TTL toDateTime(occurred_at) + INTERVAL 90 DAY;

CREATE TABLE match_event_minutes (
  tenant_id     UUID,
  type          LowCardinality(String),
  minute_at     DateTime('UTC'),
  event_count   UInt64
)
ENGINE = SummingMergeTree
ORDER BY (tenant_id, type, minute_at);

CREATE MATERIALIZED VIEW match_event_minutes_mv TO match_event_minutes AS
SELECT tenant_id, type, toStartOfMinute(occurred_at) AS minute_at, count() AS event_count
FROM match_events
GROUP BY tenant_id, type, minute_at;
```

The caveats come straight from the documentation, and each one surprises teams in production. The view sees only inserts into the left-most source table: "Right-side tables in JOINs don't trigger updates," so a dimension joined in the view is frozen as of the insert. Creating a view does not process rows already in the table, so backfill is a separate `INSERT ... SELECT`. And merges are asynchronous, so a summing table can hold several rows per key until they merge; queries re-aggregate with `sum()` and `GROUP BY` rather than trusting one row per key.

## Druid and Pinot

Apache Druid and Apache Pinot were built for the same job: high-concurrency queries over streams, with data queryable seconds after it arrives.

**Druid** combines "ideas from data warehouses, timeseries databases, and logsearch systems." It ingests from Kafka and batch sources, and "ingested data is immediately available for querying." Data is partitioned by time first, so time-bounded queries only touch the matching partitions ([Apache Druid: Introduction](https://druid.apache.org/docs/latest/design/)). It stores data in segments, one per time interval, ideally 300 to 700 MB with about 5 million rows as a starting point ([Apache Druid: Segments](https://druid.apache.org/docs/latest/design/segments)), and keeps the durable copy in deep storage (object storage or HDFS), so it "bootstraps from deep storage even if every single data server is lost." The price is more moving parts than most databases: Coordinators, Overlords, Brokers, Routers, Historicals and MiddleManagers, each a separate service ([Apache Druid: Architecture](https://druid.apache.org/docs/latest/design/architecture)).

**Pinot** "was originally built at LinkedIn to power rich interactive real-time analytics applications" such as Who Viewed Profile, and targets user-facing workloads at "hundreds of thousands of queries per second"; the Uber Eats Restaurant Manager is another of its public examples ([Apache Pinot: Introduction](https://docs.pinot.apache.org/)). Pinot's distinguishing feature for product use is upserts on real-time tables, with conditions covered below.

I choose Druid or Pinot over ClickHouse when the workload is overwhelmingly time-series slicing at very high concurrency, and the team can run a multi-service cluster or buy one. For most companies, ClickHouse covers the same ground with less to operate.

## StarRocks

StarRocks, a Linux Foundation project, describes itself as a query engine "for sub-second analytics both on and off the data lakehouse," with a native vectorized engine, a cost-based optimizer for complex joins, upserts and deletes by primary key, and direct queries on "Apache Hive, Apache Iceberg, Delta Lake and Apache Hudi without importing" ([StarRocks on GitHub](https://github.com/StarRocks/starrocks)). It can run shared-nothing, with data on local disks for the lowest latency, or shared-data, with data in object storage and stateless compute nodes that "can be added or removed within seconds" ([StarRocks: Architecture](https://docs.starrocks.io/docs/introduction/Architecture/)).

Its niche is the join-heavy workload the others handle less gracefully, and serving fast queries directly over [lakehouse tables](/docs/data/warehouses-and-lakes) without copying them. When the dashboards need star-schema joins at interactive speed, I evaluate it alongside ClickHouse.

## DuckDB and Embedded Analytics

DuckDB is the analytical counterpart of SQLite: "there is no DBMS server software to install, update and maintain," and it runs "completely embedded within a host process" ([DuckDB: Why DuckDB](https://duckdb.org/why_duckdb)). It reads Parquet and lakehouse formats through extensions and runs in the browser through WebAssembly.

Where I use it:

- **Analysts' laptops and notebooks,** querying an export or a slice of the lake without touching shared compute.
- **Tests for data models,** running transformations against fixtures in CI in seconds ([Testing](/docs/engineering/testing)).
- **Small embedded analytics,** a per-tenant report computed inside a service from a Parquet file, or a SaaS product's in-app charts for customers whose data fits on one machine.
- **Pipelines' glue,** converting, sampling and validating files between stages.

It is a single-process database, not a shared server; many writers or many concurrent users need one of the systems above.

## What They're Used For

**User-facing analytics.** Cloudflare's HTTP analytics serve customers' dashboards from ClickHouse. Its 2018 write-up describes ingesting an average of 6 million HTTP requests per second, with peaks up to 8 million, on 36 ClickHouse nodes with threefold replication, after replacing a PostgreSQL rollup database and a Citus cluster; the schema relied on materialized views and `SummingMergeTree` aggregates rather than raw logs, and the team removed the API rate limits the old system had needed ([Cloudflare: HTTP Analytics for 6M requests per second using ClickHouse](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/)). The same pattern serves a payments platform's merchant dashboard, a marketplace's seller analytics or a game's player match history.

**Observability.** Logs and traces are the purest real-time OLAP workload: append-only, huge, queried by filters and aggregations. Uber moved its log analytics from Elasticsearch to ClickHouse after finding that over 80% of queries were aggregations; a single ClickHouse node ingested 300K logs per second, about ten times a single Elasticsearch node, and hardware cost fell by more than half ([Uber: Fast and Reliable Schema-Agnostic Log Analytics Platform](https://www.uber.com/blog/logging/)). [Observability](/docs/operations/observability) puts per-request detail in logs and traces; a columnar store is a strong place to keep them.

**Operational dashboards.** Live concurrency in a game, today's routes in a field service business, authorization rates by processor in payments: numbers that operations act on within minutes, fed from the [stream](/docs/data/streaming) rather than a nightly batch.

## Ingestion, Updates and Deletes

These systems are fast because their data is immutable, sorted and compressed. Changing a row means rewriting the block it lives in, so each system offers a compromise, and you design around it.

- **Insert in batches.** In ClickHouse every insert is a part, and thousands of tiny inserts a second create more parts than merges can keep up with. Batch on the client or through a buffer (or a Kafka consumer that batches) into inserts of thousands of rows.
- **Model changes as new rows.** `ReplacingMergeTree` keeps the latest row per sort key, but "data deduplication occurs only during a merge," so exact answers need `FINAL` at query time or a re-aggregation ([ClickHouse: ReplacingMergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree)). An order's status is better stored as a stream of status events, with the current state derived.
- **Deletes are masks, then rewrites.** ClickHouse's lightweight `DELETE` marks rows in a hidden `_row_exists` column and removes them "later, normally during background merges"; the heavyweight `ALTER TABLE ... DELETE` rewrites parts. Large deletes slow queries until merges catch up ([ClickHouse: Lightweight DELETE](https://clickhouse.com/docs/guides/developer/lightweight-delete)).
- **Druid replaces intervals.** Changing data means reindexing a time interval into a new segment version that replaces the old one, atomic per interval, not per row.
- **Pinot upserts have prerequisites.** The input stream must be partitioned by the primary key, and each server keeps an in-memory map from primary key to record, about `primaryKeysCount * (sizeOfKeyInBytes + 24)` bytes ([Apache Pinot: Upsert](https://docs.pinot.apache.org/manage-data/data-import/upsert-and-dedup/upsert)).

Two consequences for system design. First, deduplicate on an event ID at the sort key or before ingestion, because at-least-once delivery ([Events](/docs/architecture/events)) will produce duplicates. Second, plan erasure from day one: keep personal data out of the hot tables where you can, partition so that expiring data is dropping a partition, and know which delete mechanism you'll run when a [GDPR](/docs/compliance/gdpr) request arrives, and how long until the data is physically gone.

## Choosing Against a Warehouse

| | Cloud warehouse | Real-time analytical database |
| --- | --- | --- |
| Freshness | Minutes to hours, batch or micro-batch | Seconds, from the stream |
| Query latency | Seconds | Milliseconds to low seconds |
| Concurrency | Tens of analysts | Thousands of users or dashboards |
| Joins | Large, arbitrary joins are routine | Best with denormalized tables or small dimensions |
| Updates and deletes | Ordinary SQL | Designed around: versions, masks, reindexing |
| Who queries | Employees | Customers, operators, on-call engineers |
| Operating cost | Managed, metered per query or per hour | Managed or self-run, sized for peak |

My rules:

- **Start in the warehouse.** If people inside the company are the only readers and a few seconds is fine, a second database is a second thing to keep correct.
- **Add a real-time store when a product feature or an operational loop needs it:** customer-facing dashboards, live operations, observability at volume. Not because a dashboard is slow; fix the model first.
- **Feed both from the same stream.** The warehouse remains the system of record for analytics; the real-time store serves a defined set of tables with their own retention.
- **Denormalize at ingestion.** Join dimensions in the stream or the pipeline, so queries scan one wide sorted table.
- **Scope every query by tenant.** In user-facing analytics, the tenant leads the sort key and every query filters on it, which is both the fastest plan and the isolation boundary ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

## A Checklist

- The workload is named: who queries, how fresh, how fast, how many at once.
- The sort key starts with the columns every query filters on, usually tenant then time.
- Inserts are batched; duplicates are removed by event ID.
- Rollups are materialized views or stream aggregations, with a tested backfill path.
- Mutable state is modeled as versioned rows or events, and queries handle unmerged duplicates.
- Retention is a TTL or partition drop, and erasure has a known mechanism and time to physical deletion.
- The warehouse stays the analytical system of record; the real-time store serves defined tables.

## References

**Reference**

- [ClickHouse: What is a columnar database?](https://clickhouse.com/docs/faq/general/columnar-database), storing each column independently and the cost for whole-row operations
- [ClickHouse: Why is ClickHouse so fast?](https://clickhouse.com/docs/concepts/why-clickhouse-is-so-fast), compression, batched operators, SIMD and per-core lanes
- [ClickHouse: MergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree), parts and merges, sort keys, 8,192-row granules, partitions and TTL
- [ClickHouse: Incremental materialized views](https://clickhouse.com/docs/materialized-view/incremental-materialized-view), views as insert triggers and their JOIN caveats
- [ClickHouse: ReplacingMergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree), deduplication during merges and `FINAL`
- [ClickHouse: Lightweight DELETE](https://clickhouse.com/docs/guides/developer/lightweight-delete), the `_row_exists` mask and heavyweight mutations
- [Apache Druid: Introduction](https://druid.apache.org/docs/latest/design/), immediate queryability, time partitioning and deep storage
- [Apache Druid: Architecture](https://druid.apache.org/docs/latest/design/architecture), the services and deep storage recovery
- [Apache Druid: Segments](https://druid.apache.org/docs/latest/design/segments), time-interval segments, sizing and versioned replacement
- [Apache Pinot: Introduction](https://docs.pinot.apache.org/), real-time OLAP for user-facing analytics, from LinkedIn
- [Apache Pinot: Upsert](https://docs.pinot.apache.org/manage-data/data-import/upsert-and-dedup/upsert), primary keys, stream partitioning and memory cost
- [StarRocks on GitHub](https://github.com/StarRocks/starrocks), vectorized engine, cost-based optimizer, primary key upserts and lakehouse queries
- [StarRocks: Architecture](https://docs.starrocks.io/docs/introduction/Architecture/), frontends, backends and shared-data compute nodes
- [DuckDB: Why DuckDB](https://duckdb.org/why_duckdb), in-process analytics and columnar-vectorized execution

**In practice**

- [Cloudflare: HTTP Analytics for 6M requests per second using ClickHouse](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/), user-facing analytics on ClickHouse aggregates (2018)
- [Uber: Fast and Reliable Schema-Agnostic Log Analytics Platform](https://www.uber.com/blog/logging/), moving log analytics from Elasticsearch to ClickHouse (2021)
