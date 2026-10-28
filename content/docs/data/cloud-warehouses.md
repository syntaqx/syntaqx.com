+++
title = "Running a Cloud Warehouse"
nav_title = "Cloud Warehouses"
description = "Operating Snowflake, BigQuery and Redshift: how each bills compute, workload isolation, table layout, caches, loading, recovery windows, spend and sharing."
category = "Data Platforms"
order = 1273
tags = ["data", "warehouse", "snowflake", "bigquery", "redshift"]
+++

[Warehouses, Lakes & Lakehouses](/docs/data/warehouses-and-lakes#cloud-warehouses) explains what a cloud warehouse is: columnar storage, separate compute, one managed product. This chapter is about running one. The three I see most often, Snowflake, BigQuery and Amazon Redshift, look alike from a SQL prompt and behave very differently on the bill, under load and when someone asks for yesterday's table back.

Most warehouse problems I've seen aren't query problems. A dashboard keeps a warehouse awake all night, a `SELECT *` scans a year of events, an ingest job and the finance close fight over the same compute, or nobody can say which team spent last month's budget. Each product has its own answers to those, and they are worth knowing before the first invoice.

Two neighbors cover the rest. Access control, masking, erasure and spend caps are in [Data Governance & Access](/docs/data/data-governance); what goes into the tables and how they're modeled is in [Modeling Analytical Data](/docs/data/data-modeling). List prices vary by region, edition and contract and change often, so this chapter gives each product's billing units and rules and leaves the dollar figures to the vendors' pricing pages.

## How Each One Bills Compute

Storage is cheap and predictable on all three. Compute is where the money goes, and each product meters it differently. The meter decides what a careless query costs, so it's the first thing to learn.

**Snowflake bills warehouse time.** A virtual warehouse has a size, and each size up doubles the credits it burns per hour: an X-Small uses 1 credit an hour, a Small 2, a Medium 4, up to 512 for a 6X-Large. Billing is per second "with a 60-second minimum each time the warehouse starts," and auto-suspend and auto-resume are both on by default ([Snowflake: Overview of warehouses](https://docs.snowflake.com/en/user-guide/warehouses-overview)). The warehouse bills while it's running, not while queries are: a warehouse that sits idle for ten minutes before suspending pays for ten idle minutes. Snowflake suggests setting auto-suspend "to a low value (for example, 5 or 10 minutes or less)" ([Snowflake: Warehouse considerations](https://docs.snowflake.com/en/user-guide/warehouses-considerations)).

**BigQuery bills bytes scanned or slot time.** On demand, "you pay for the number of bytes processed," with a minimum of 10 MiB per query and up to 2,000 slots per project ([BigQuery: Introduction to reservations](https://docs.cloud.google.com/bigquery/docs/reservations-intro)); each project gets 1 TiB of free on-demand querying a month ([BigQuery: Estimate and control costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs)). Under capacity pricing you buy slots, BigQuery's unit of compute, through one of three editions (Standard, Enterprise, Enterprise Plus). Autoscaling adds slots in multiples of 50, billed "per second with a one-minute minimum duration," and baseline slots "are always charged" whether used or not ([BigQuery: Understand slots](https://docs.cloud.google.com/bigquery/docs/slots-autoscaling-intro)). Enterprise and Enterprise Plus offer one-year commitments at a 20% discount and three-year ones at 40%; Standard has no commitments and caps a reservation at 1,600 slots ([BigQuery: Editions](https://docs.cloud.google.com/bigquery/docs/editions-intro)).

**Redshift bills capacity time.** Redshift Serverless charges "in RPU-hours on a per-second basis, with a 60-second minimum charge," and "when no queries are running, you aren't billed for compute capacity" ([AWS: Billing for on-demand compute capacity](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing-on-demand.html)). One RPU is 16 GB of memory. Base capacity defaults to 128 RPUs and can be set from 4 to 512 (1,024 in five Regions) ([AWS: Compute capacity for Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-capacity.html)). A query cancelled halfway is still billed for the time it ran ([AWS: Billing for Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing.html)). Provisioned clusters bill per node while they exist; pausing one suspends on-demand billing and leaves only storage charges ([AWS: Pausing and resuming a cluster](https://docs.aws.amazon.com/redshift/latest/mgmt/rs-mgmt-pause-resume-cluster.html)), and reserved nodes trade a term commitment for a discount on steady workloads ([AWS: Redshift provisioned clusters](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html)).

| | Snowflake | BigQuery | Redshift |
| --- | --- | --- | --- |
| Compute unit | Warehouse size (credits per hour) | Bytes scanned, or slots | RPUs (Serverless) or nodes (provisioned) |
| Metered by | Running time, per second | TiB processed, or slot time per second | Running time per second, or node-hours |
| Minimum | 60 s each start | 10 MiB per query; 1 min per autoscale | 60 s |
| Idle cost | Until auto-suspend | None on demand; baseline slots always | None on Serverless; full on a running cluster |
| What a careless query costs | Time on a warehouse that was already awake | Every byte it reads | Capacity it scales up to |

The difference shows in what goes wrong. On BigQuery on demand, the expensive mistake is a wide scan: a `SELECT *` over an unpartitioned event table bills every byte, and a `LIMIT` doesn't help, because "applying a LIMIT clause to a query doesn't affect the amount of data that is read" on a non-clustered table ([BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). On Snowflake and Redshift Serverless, the expensive mistake is keeping compute awake: a dashboard that refreshes every few minutes means the warehouse never suspends.

![Dimensional drawing of one warehouse billed per second under two auto-suspend settings. A timeline from 0 to 480 seconds shows two illustrative queries, Q1 of 20 seconds at time 0 and Q2 of 25 seconds arriving at T2, 150 seconds. With a 300-second auto-suspend, A1, the warehouse runs from 0 until 300 seconds after Q2 ends and bills B1 = T2+Q2+A1 = 475 seconds. With a 60-second auto-suspend, A2, it suspends between the queries and bills two runs, (Q1+A2)+(Q2+A2) = 165 seconds; each start bills at least M1, 60 seconds, and drops the local cache.](/diagrams/dp-cloud-warehouses-billing.svg "Per-second billing charges for the time the warehouse is awake, not for the time queries run. The auto-suspend setting is most of the bill for bursty work.")

A short auto-suspend isn't free. Snowflake's local disk cache "is dropped when the warehouse is suspended" ([Snowflake: Warehouse considerations](https://docs.snowflake.com/en/user-guide/warehouses-considerations)), so the first query after a resume reads from remote storage. My default is 60 seconds for warehouses that serve ad hoc and scheduled work, and a few minutes for one serving an interactive dashboard where the warm cache is part of what users notice.

## Sizing and Isolating Compute

The other half of compute is who shares it. One warehouse for everything means the nightly transform slows the morning dashboards, and nobody can tell which workload spent the money. All three products let you split compute by workload. Splitting it is the habit that matters most.

**Snowflake: one warehouse per workload.** Warehouses are independent clusters over the same storage ([Snowflake: Key concepts and architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts)), so separating ingest, transformation, BI and ad hoc work costs nothing extra: each bills only while awake. Size answers how fast one big query runs; concurrency is a different control. A multi-cluster warehouse (an Enterprise Edition feature) adds clusters of the same size under load. The Standard scaling policy adds one "when a query is queued, or if Snowflake estimates the currently running clusters don't have enough resources"; Economy adds one only if there's "enough query load to keep the cluster busy for at least 6 minutes," trading queueing for cost ([Snowflake: Multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster)). For outlier queries there's the query acceleration service, which "can accelerate parts of the query workload in a warehouse" and bills separately ([Snowflake: Query Acceleration Service](https://docs.snowflake.com/en/user-guide/query-acceleration-service)); for memory-hungry Python and ML work, Snowpark-optimized warehouses provide "16x memory per node compared to a standard warehouse" ([Snowflake: Snowpark-optimized warehouses](https://docs.snowflake.com/en/user-guide/warehouses-snowpark-optimized)). Generation 2 standard warehouses run on "faster underlying hardware and intelligent software optimizations," aren't available at 5X-Large and 6X-Large, and are chosen when the warehouse is created ([Snowflake: Generation 2 standard warehouses](https://docs.snowflake.com/en/user-guide/warehouses-gen2)).

**BigQuery: reservations and assignments.** Capacity is bought as reservations, and "to use allocated slots in a reservation, you must assign it to one or more projects, folders, or organizations"; a project assignment overrides a folder's, which overrides the organization's ([BigQuery: Workload management using reservations](https://docs.cloud.google.com/bigquery/docs/reservations-workload-management)). That makes the project the unit of isolation: put ingest, transformation and BI in separate projects and assign each to its own reservation. Idle slots in one reservation are shared with others in the same administration project by default, but never across regions. Within a reservation, the scheduler shares slots equally among projects with running queries ([BigQuery: Understand slots](https://docs.cloud.google.com/bigquery/docs/slots)). On demand there's nothing to size: concurrency is computed dynamically, and you "can't specify a maximum concurrency target for an on-demand project" ([BigQuery: Query queues](https://docs.cloud.google.com/bigquery/docs/query-queues)).

**Redshift: workgroups, or queues on a cluster.** On Serverless, a namespace holds the database objects and a workgroup holds the compute, one to one ([AWS: Workgroups and namespaces](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-workgroup-namespace.html)). Isolation means separate workgroups reading shared data through datashares, which can now carry writes as well as reads, with data "live and available to all warehouses as soon as a write transaction is committed" ([AWS: Data sharing in Amazon Redshift](https://docs.aws.amazon.com/redshift/latest/dg/datashare-overview.html)). A provisioned cluster isolates inside itself with workload management: automatic WLM manages "query concurrency and memory allocation" across up to eight queues ([AWS: Implementing automatic WLM](https://docs.aws.amazon.com/redshift/latest/dg/automatic-wlm.html)), queries run at priorities from LOWEST to HIGHEST (NORMAL by default) ([AWS: Query priority](https://docs.aws.amazon.com/redshift/latest/dg/query-priority.html)), and short query acceleration, on by default, runs short queries ahead of long ones ([AWS: Short query acceleration](https://docs.aws.amazon.com/redshift/latest/dg/wlm-short-query-acceleration.html)). Concurrency scaling adds temporary clusters when queues fill, charged "only for the time they're actively running queries," with one such cluster by default ([AWS: Concurrency scaling](https://docs.aws.amazon.com/redshift/latest/dg/concurrency-scaling.html)).

The split I start with, on any of the three:

- **Ingest and transform.** Loads, dbt runs and backfills. Sized for throughput, scheduled, allowed to queue.
- **BI.** Dashboards and scheduled reports. Sized for concurrency, with caching in mind.
- **Ad hoc.** Analysts and engineers exploring. Small, with a short timeout and a tight cost cap.
- **Data science.** Feature builds and training extracts, which read wide and run long ([Data Science & ML Platforms](/docs/data/data-science-platforms)).

Split by workload, not by person or team. A warehouse per team multiplies idle time and leaves every team undersized. A warehouse per workload, tagged by team ([Watching Spend](#watching-spend)), gives the same attribution with far less idle compute.

## Laying Out Tables

All three store data in columnar blocks and skip blocks a query can't need. How well they skip depends on how the table is laid out, and on BigQuery on demand, it decides the bill directly.

**Snowflake micro-partitions.** Snowflake divides every table automatically into micro-partitions of "between 50 MB and 500 MB of uncompressed data" and keeps per-column metadata that allows "precise pruning of columns in micro-partitions at query run-time." How well the data is ordered for a filter is measured as clustering depth; lower is better ([Snowflake: Micro-partitions & Data Clustering](https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions)). Data loaded in time order tends to be clustered on time already. A clustering key, "a subset of columns in a table (or expressions on a table) that are explicitly designated to co-locate" data, is for very large tables queried by something other than load order ([Snowflake: Clustering Keys & Clustered Tables](https://docs.snowflake.com/en/user-guide/tables-clustering-keys)). Maintaining one isn't free: Automatic Clustering "consumes Snowflake credits, but does not require you to provide a virtual warehouse" ([Snowflake: Automatic Clustering](https://docs.snowflake.com/en/user-guide/tables-auto-reclustering)), and rewritten micro-partitions linger in Time Travel and Fail-safe storage. For point lookups on a few selective values, the search optimization service is the better tool ([Snowflake: Search optimization service](https://docs.snowflake.com/en/user-guide/search-optimization-service)).

**BigQuery partitions and clusters.** A table can be partitioned on a `DATE`, `TIMESTAMP` or `DATETIME` column, by ingestion time or by integer range ([BigQuery: Partitioned tables](https://docs.cloud.google.com/bigquery/docs/partitioned-tables)), with up to 10,000 partitions per table ([BigQuery: Quotas and limits](https://docs.cloud.google.com/bigquery/quotas)). Setting `require_partition_filter` means "every query on that table must include at least one predicate that only references the partitioning column," which turns a year-long accidental scan into an error ([BigQuery: Managing partitioned tables](https://docs.cloud.google.com/bigquery/docs/managing-partitioned-tables)). Clustering sorts data within partitions by up to four columns, and automatic reclustering is free ([BigQuery: Clustered tables](https://docs.cloud.google.com/bigquery/docs/clustered-tables)). Before running a large query, a dry run returns an upper bound on the bytes it will bill ([BigQuery: Estimate and control costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs)).

**Redshift distribution and sort keys.** Redshift spreads rows across slices by a distribution style. Without one it uses AUTO, which starts a small table as ALL (a copy on every node) and may move it to KEY or EVEN as it grows ([AWS: Distribution styles](https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html)). Sort keys order the blocks for skipping; AWS recommends `SORTKEY AUTO`, and a compound key (the default) works best when filters use its leading columns ([AWS: Sort keys](https://docs.aws.amazon.com/redshift/latest/dg/t_Sorting_data.html)). Interleaved sort keys exist, but concurrency scaling won't run queries on those tables. Compression is `ENCODE AUTO` by default ([AWS: Column compression](https://docs.aws.amazon.com/redshift/latest/dg/t_Compressing_data_on_disk.html)), and automatic table optimization applies sort and distribution keys "without the need for administrator intervention" ([AWS: Automatic table optimization](https://docs.aws.amazon.com/redshift/latest/dg/t_Creating_tables.html)). Deletes and updates leave dead rows that Redshift vacuums in the background, during periods of reduced load ([AWS: Vacuuming tables](https://docs.aws.amazon.com/redshift/latest/dg/t_Reclaiming_storage_space202.html)); statistics refresh automatically once 10 percent of rows change ([AWS: Analyzing tables](https://docs.aws.amazon.com/redshift/latest/dg/t_Analyzing_tables.html)).

The same event table, laid out for queries that filter by time and tenant:

```sql tab="Snowflake"
CREATE TABLE analytics.events (
  id           STRING,
  tenant_id    STRING,
  type         STRING,
  occurred_at  TIMESTAMP_NTZ,
  payload      VARIANT
)
CLUSTER BY (TO_DATE(occurred_at), tenant_id);
-- Only once the table is large and queried by tenant across dates;
-- data loaded in time order is already clustered on time.
```

```sql tab="BigQuery"
CREATE TABLE analytics.events (
  id           STRING,
  tenant_id    STRING,
  type         STRING,
  occurred_at  TIMESTAMP,
  payload      JSON
)
PARTITION BY DATE(occurred_at)
CLUSTER BY tenant_id, type
OPTIONS (require_partition_filter = TRUE);
```

```sql tab="Redshift"
CREATE TABLE analytics.events (
  id           VARCHAR(36),
  tenant_id    VARCHAR(36),
  type         VARCHAR(64),
  occurred_at  TIMESTAMP,
  payload      SUPER
)
DISTSTYLE AUTO
SORTKEY AUTO;
-- Or name it when the access pattern is known:
-- COMPOUND SORTKEY (occurred_at, tenant_id)
```

My rules: partition or sort on the time column every query filters by, add tenant or another high-use filter second, and leave the rest to the engine until query history shows a pattern. Layout is easy to get roughly right and expensive to tune by guesswork.

## Caches and Precomputed Results

Each product caches query results, and each has rules that quietly turn the cache off. Knowing them is the cheapest performance work there is.

- **Snowflake** keeps persisted results for 24 hours, and each reuse resets the clock, "up to a maximum of 31 days from the date and time that the query was first executed." Reuse requires the same query text, unchanged data, and no functions such as `UUID_STRING` or `RANDOM` that make results non-reusable ([Snowflake: Using Persisted Query Results](https://docs.snowflake.com/en/user-guide/querying-persisted-results)).
- **BigQuery** caches results "for approximately 24 hours," per user and per project, and a cached query costs nothing. Results aren't cached when the query writes to a destination table, when a referenced table has changed or recently received streaming inserts, or when the query uses non-deterministic functions ([BigQuery: Cached query results](https://docs.cloud.google.com/bigquery/docs/cached-results)).
- **Redshift** caches results on the leader node, on by default, and uses them only when the tables are unmodified, no function like `GETDATE` is used, and the query "syntactically matches the cached query" ([AWS: Amazon Redshift performance](https://docs.aws.amazon.com/redshift/latest/dg/c_challenges_achieving_high_performance_queries.html)).

The pattern is the same everywhere: a dashboard that writes `WHERE occurred_at > CURRENT_TIMESTAMP() - INTERVAL 7 DAY` never hits the cache, and one that filters on a date the BI tool fills in does. Fixing that in the BI layer costs nothing and often removes most of a dashboard's compute.

For results that have to stay fresh, each product precomputes:

- **Materialized views.** BigQuery adds base table changes to them incrementally "with no user action required," and smart tuning reroutes matching queries to them ([BigQuery: Materialized views](https://docs.cloud.google.com/bigquery/docs/materialized-views-intro)). Redshift refreshes them automatically and rewrites queries to use them, but only when they're up to date ([AWS: Refreshing a materialized view](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-refresh.html), [Automatic query rewriting](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-auto-rewrite.html)).
- **Dynamic tables** in Snowflake materialize "the results of a SELECT query" and keep them up to date, with a target lag that "tells Snowflake how fresh the data must be" ([Snowflake: Dynamic tables](https://docs.snowflake.com/en/user-guide/dynamic-tables-about)).

These overlap with what a transformation tool's incremental models do. I use the warehouse's own feature for a few hot aggregates behind dashboards, and keep the modeled layers in dbt where they're versioned and tested ([Modeling Analytical Data](/docs/data/data-modeling#layers-in-dbt)).

## Loading Data

Each warehouse has a bulk path from files, a streaming path for rows, and a managed path from somewhere upstream. They differ mainly in what they cost.

**Snowflake.** `COPY INTO` loads staged files on a warehouse you size; Snowflake recommends files of "roughly 100-250 MB (or larger) in size compressed" ([Snowflake: Preparing your data files](https://docs.snowflake.com/en/user-guide/data-load-considerations-prepare)). Snowpipe loads new files on serverless compute, "typically within a minute," and "charges a fixed number of credits per GB of data loaded." It remembers files loaded in the last 14 days, against 64 days for bulk loads, which is the window in which a re-sent file won't load twice ([Snowflake: Snowpipe](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro)). Snowpipe Streaming writes rows straight into tables with no staged files, billed by uncompressed GB ingested ([Snowflake: Snowpipe Streaming](https://docs.snowflake.com/en/user-guide/snowpipe-streaming/data-load-snowpipe-streaming-overview)).

**BigQuery.** "There is no charge for batch loading data into BigQuery using the shared slot pool," though BigQuery "doesn't guarantee the available capacity of this shared pool" ([BigQuery: Batch loading data](https://docs.cloud.google.com/bigquery/docs/batch-loading-data)). For streaming, the Storage Write API offers "stream-level transactions and exactly-once delivery semantics" ([BigQuery: Storage Write API](https://docs.cloud.google.com/bigquery/docs/write-api)); Google recommends it over the legacy `tabledata.insertAll` method "for lower pricing," and streaming isn't in the free tier ([BigQuery: Streaming data](https://docs.cloud.google.com/bigquery/docs/streaming-data-into-bigquery)).

**Redshift.** `COPY` from S3 runs in parallel across slices, so AWS recommends files "from 1 MB to 1 GB after compression" in a count that's "a multiple of the number of slices in your cluster" ([AWS: Loading data files](https://docs.aws.amazon.com/redshift/latest/dg/c_best-practices-use-multiple-files.html)). Auto-copy watches an S3 path and tracks which files it has loaded ([AWS: Auto-copy from Amazon S3](https://docs.aws.amazon.com/redshift/latest/dg/loading-data-copy-job.html)). Streaming ingestion reads Kinesis or Kafka (MSK) straight into a materialized view with no S3 landing area ([AWS: Streaming ingestion](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-streaming-ingestion.html)), and zero-ETL integrations replicate Aurora, RDS, DynamoDB and other sources into Redshift with no extract, transform and load pipeline to maintain ([AWS: Zero-ETL integrations](https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html)).

Managed replication from the production database is convenient and dangerous in the same way: it copies the production schema across the boundary, and the analysts start depending on column names the product team thinks are private. The contract still applies ([Separating Production from Analytics](/docs/data/separating-production-and-analytics#data-contracts-between-product-and-data-teams)): land replicated tables in a raw schema and expose only modeled ones.

My defaults: batch files every few minutes to every hour cover most analytics; a streaming path earns its place when someone acts on data within minutes ([Streaming & Event Processing](/docs/data/streaming)). Either way, the raw landing tables are append-only and replayable, and deduplication happens in the model, not in the loader.

## Semi-Structured Data

All three can store JSON without a schema, which is how event payloads usually arrive:

- **Snowflake** has `VARIANT`, which holds any value up to 128 MB uncompressed ([Snowflake: Semi-structured data types](https://docs.snowflake.com/en/sql-reference/data-types-semistructured)), queried with path notation like `src:salesperson.name` and expanded with `FLATTEN` ([Snowflake: Querying semi-structured data](https://docs.snowflake.com/en/user-guide/querying-semistructured)).
- **BigQuery** has a `JSON` type that encodes each field individually ([BigQuery: Working with JSON data](https://docs.cloud.google.com/bigquery/docs/json-data)), and nested `STRUCT` and repeated `ARRAY` columns. Google's guidance is that "BigQuery performs best when your data is denormalized," with nested and repeated fields keeping relationships without join cost ([BigQuery: Nested and repeated fields](https://docs.cloud.google.com/bigquery/docs/nested-repeated)).
- **Redshift** has `SUPER`, up to 16 MB per value, navigated with PartiQL ([AWS: SUPER type](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)).

Querying raw JSON is fine for exploration and slow and fragile for anything that runs daily. My rule: land the payload whole, then promote every field a model or dashboard depends on into a typed column in staging, so a producer renaming a key breaks one tested model instead of every report ([Event Design](/docs/telemetry/event-design)).

## Storage, Recovery Windows and Clones

Deleted and overwritten data stays recoverable for a while on all three. That's the safety net for a bad migration, and it's also storage you pay for and data that hasn't really gone yet.

**Snowflake** has two windows. Time Travel lets you query, clone and undrop data within a retention period that's 1 day by default and up to 90 days for permanent objects on Enterprise Edition and above ([Snowflake: Time Travel](https://docs.snowflake.com/en/user-guide/data-time-travel)). After it, Fail-safe keeps data for "a (non-configurable) 7-day period during which historical data may be recoverable by Snowflake," through Snowflake Support, not by you ([Snowflake: Fail-safe](https://docs.snowflake.com/en/user-guide/data-failsafe)). Storage "is calculated and charged for data regardless of whether it is in the Active, Time Travel, or Fail-safe state"; transient and temporary tables have no Fail-safe ([Snowflake: Data storage considerations](https://docs.snowflake.com/en/user-guide/tables-storage-considerations)). That makes transient tables the right home for staging data that can be rebuilt, especially if it's rewritten daily.

**BigQuery** keeps time travel for seven days by default, configurable from two to seven, then seven days of fail-safe ([BigQuery: Time travel](https://docs.cloud.google.com/bigquery/docs/time-travel)). Storage is billed on logical (uncompressed) bytes by default or on physical (compressed) bytes by choice; under physical billing, time travel and fail-safe bytes are charged too ([BigQuery: Storage overview](https://docs.cloud.google.com/bigquery/docs/storage_overview)). Tables or partitions left unmodified for 90 days drop to long-term storage, "around 50% cheaper than active storage" ([BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). Partitioning by date gets this for free: old partitions age into long-term storage while new ones stay active.

**Redshift** takes automated snapshots "about every eight hours or following every 5 GB per node of data changes," kept one day by default and up to 35 on RA3 and RG nodes; manual snapshots stay "indefinitely, even after you delete your cluster" ([AWS: Redshift snapshots and backups](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-snapshots.html)). Serverless creates recovery points every 30 minutes, kept for 24 hours ([AWS: Snapshots and recovery points](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-snapshots-recovery-points.html)).

Two consequences. First, these windows extend every erasure deadline; [Data Governance](/docs/data/data-governance#retention-and-deletion-through-the-warehouse) covers how to fit them in. Second, Snowflake's zero-copy clone makes a full-size test environment nearly free: a clone "utilizes no data storage because it shares all the existing micro-partitions of the original table" until either side changes ([Snowflake: Data storage considerations](https://docs.snowflake.com/en/user-guide/tables-storage-considerations)), and it can be taken at a point in the past ([Snowflake: Cloning considerations](https://docs.snowflake.com/en/user-guide/object-clone)). I clone production into a CI database for every dbt pull request and drop it after. Personal data comes along with the clone, so the same masking policies apply ([Environments](/docs/operations/environments)).

## Watching Spend

Every warehouse I've run has had a month where the bill doubled and nobody knew why. The fix is the same each time: attribute every query to a workload and a team, and look weekly.

- **Snowflake** records queries in `ACCOUNT_USAGE.QUERY_HISTORY` (about 45 minutes behind) and credits per warehouse in `WAREHOUSE_METERING_HISTORY` (up to 3 hours behind), kept for a year ([Snowflake: Account Usage](https://docs.snowflake.com/en/sql-reference/account-usage)). A `QUERY_TAG` of up to 2,000 characters set by the session lets a dbt run or a dashboard identify itself ([Snowflake: Parameters](https://docs.snowflake.com/en/sql-reference/parameters)).
- **BigQuery** records 180 days of jobs in `INFORMATION_SCHEMA.JOBS`, with `total_bytes_billed`, `total_slot_ms` and the job's labels ([BigQuery: JOBS view](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs)). Labels flow through to billing, so charges can be broken down by label ([BigQuery: Labels](https://docs.cloud.google.com/bigquery/docs/labels-intro)).
- **Redshift** records queries in `SYS_QUERY_HISTORY` for both deployment types ([AWS: SYS_QUERY_HISTORY](https://docs.aws.amazon.com/redshift/latest/dg/SYS_QUERY_HISTORY.html)), and Serverless usage per minute in `SYS_SERVERLESS_USAGE`, whose `charged_seconds` is the column to bill from; it keeps only 7 days ([AWS: SYS_SERVERLESS_USAGE](https://docs.aws.amazon.com/redshift/latest/dg/SYS_SERVERLESS_USAGE.html)), as do the STL log views, so anything you want to trend has to be copied out ([AWS: System tables and views](https://docs.aws.amazon.com/redshift/latest/dg/cm_chap_system-tables.html)).

The weekly question is which workload used the most compute, and whether that changed:

```sql tab="Snowflake"
SELECT warehouse_name,
       DATE_TRUNC('week', start_time) AS week,
       SUM(credits_used)              AS credits
FROM snowflake.account_usage.warehouse_metering_history
WHERE start_time >= DATEADD('week', -8, CURRENT_DATE())
GROUP BY 1, 2
ORDER BY 2 DESC, 3 DESC;
```

```sql tab="BigQuery"
SELECT
  (SELECT value FROM UNNEST(labels) WHERE key = 'workload') AS workload,
  DATE_TRUNC(DATE(creation_time), WEEK)                     AS week,
  SUM(total_bytes_billed) / POW(1024, 4)                    AS tib_billed,
  SUM(total_slot_ms) / 1000 / 3600                          AS slot_hours
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 56 DAY)
  AND job_type = 'QUERY'
GROUP BY 1, 2
ORDER BY 2 DESC, 3 DESC;
```

```sql tab="Redshift"
-- Serverless; the view keeps 7 days, so copy it out daily to trend it.
SELECT DATE_TRUNC('day', start_time)     AS day,
       SUM(charged_seconds) / 3600.0     AS charged_rpu_hours
FROM sys_serverless_usage
GROUP BY 1
ORDER BY 1 DESC;
```

Attribution tells you what happened; brakes stop it from happening. The defaults are generous: Snowflake's `STATEMENT_TIMEOUT_IN_SECONDS` defaults to 172,800 seconds, two days ([Snowflake: Parameters](https://docs.snowflake.com/en/sql-reference/parameters)), Redshift's `statement_timeout` defaults to no limit ([AWS: statement_timeout](https://docs.aws.amazon.com/redshift/latest/dg/r_statement_timeout.html)), and a BigQuery query can run for six hours before it fails ([BigQuery: Quotas and limits](https://docs.cloud.google.com/bigquery/quotas)). I set them per workload:

```sql tab="Snowflake"
ALTER WAREHOUSE adhoc_wh SET
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  STATEMENT_TIMEOUT_IN_SECONDS = 900;
```

```sql tab="BigQuery"
-- The timeout includes queue time; allowed range is 5 minutes to 48 hours.
ALTER PROJECT adhoc_project SET OPTIONS (
  `region-us.default_query_job_timeout_ms` = 900000
);
```

```sql tab="Redshift"
-- Milliseconds; includes planning, queueing and execution.
ALTER USER adhoc_reader SET statement_timeout TO 900000;
```

The BigQuery project timeout is from [BigQuery: Default configuration](https://docs.cloud.google.com/bigquery/docs/default-configuration). Cost caps (Snowflake resource monitors, BigQuery's maximum bytes billed and custom quotas) are in [Data Governance](/docs/data/data-governance#cost-governance); Redshift Serverless has its own usage limits on RPU-hours per day, week or month, which can log, alert or turn off user queries ([AWS: Billing for on-demand compute capacity](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing-on-demand.html)). The company-wide side (budgets, unit costs, showback) is [Cost & FinOps](/docs/operations/cost-and-finops).

## Sharing Data Out

Sooner or later a partner, a customer or another business unit needs data from the warehouse. All three can share it without an export, which beats a nightly CSV on every count but one: it ties the recipient to the same product.

- **Snowflake** Secure Data Sharing copies nothing: "no actual data is copied or transferred between accounts," and "consumers pay only for the compute (virtual warehouses) that they use." For a recipient without a Snowflake account, a reader account is "owned and paid for by your provider account" ([Snowflake: About Secure Data Sharing](https://docs.snowflake.com/en/user-guide/data-sharing-intro)).
- **BigQuery sharing** (formerly Analytics Hub) publishes listings; subscribing "creates a linked dataset in your project without replicating data," with the publisher paying storage and the subscriber paying for queries ([BigQuery: Sharing introduction](https://docs.cloud.google.com/bigquery/docs/analytics-hub-introduction)). Inside an organization, authorized views share a subset of a dataset without access to the source ([BigQuery: Authorized views](https://docs.cloud.google.com/bigquery/docs/authorized-views)).
- **Redshift** datashares share live data across clusters, workgroups, accounts and Regions "without manually moving or copying the data," with transactional consistency across producer and consumers ([AWS: Data sharing in Amazon Redshift](https://docs.aws.amazon.com/redshift/latest/dg/datashare-overview.html)).

A share is an API. Share views, never raw tables, so the schema behind them can change; version them like any other interface ([API Design Principles](/docs/api-design/principles)); and when the recipients are customers, filter by tenant in the shared view itself, not in a convention they're trusted to follow ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

## Open Tables From the Warehouse

All three now read open table formats, which changes the lock-in question from "where do the bytes live" to "which catalog do the engines trust" ([Open Table Formats](/docs/data/warehouses-and-lakes#open-table-formats)).

- **Snowflake** Iceberg tables store Parquet in your own storage through an external volume. With Snowflake as the catalog they get "full Snowflake platform support with read and write access"; with an external catalog, "limited Snowflake platform support" ([Snowflake: Apache Iceberg tables](https://docs.snowflake.com/en/user-guide/tables-iceberg)).
- **BigQuery** Apache Iceberg managed tables "offer the same fully managed experience as standard BigQuery tables, but store data in storage buckets that you own" ([BigQuery: Apache Iceberg managed tables](https://docs.cloud.google.com/bigquery/docs/iceberg-tables)). External tables read CSV, JSON, Avro, ORC and Parquet in Cloud Storage, and BigLake tables add access delegation so users need permissions only on the table ([BigQuery: Cloud Storage external tables](https://docs.cloud.google.com/bigquery/docs/external-data-cloud-storage)).
- **Redshift** queries Iceberg tables cataloged in AWS Glue, format versions 1 to 3, though not with `COPY` and not with time travel ([AWS: Using Apache Iceberg tables](https://docs.aws.amazon.com/redshift/latest/dg/querying-iceberg.html)); Redshift Spectrum queries other files in S3 "without having to load the data into Amazon Redshift tables" ([AWS: Redshift Spectrum](https://docs.aws.amazon.com/redshift/latest/dg/c-using-spectrum.html)).

The warehouse's own tables are still faster and get every feature first. My split: raw, high-volume and long-retention data in Iceberg tables that more than one engine reads; modeled marts and anything a dashboard touches in native tables.

## Choosing Between Them

The three are close enough on SQL and performance that the choice rarely comes down to a benchmark. What decides it:

- **Where production runs.** Data moving between clouds pays egress, and permissions have to be set up twice. BigQuery on Google Cloud and Redshift on AWS sit inside the same identity and network as the systems that feed them; zero-ETL from Aurora is a real advantage for an AWS shop. Snowflake runs on all three major clouds and is the usual choice when production spans more than one, or when the company wants the warehouse independent of its cloud.
- **The shape of the workload.** Small and spiky favors BigQuery on demand (no idle cost, a free TiB a month) or Redshift Serverless. Steady and heavy favors committed capacity on any of them. Many concurrent dashboard users favor Snowflake multi-cluster warehouses or BigQuery reservations.
- **Who operates it.** Snowflake and BigQuery on demand have the fewest knobs. Provisioned Redshift has the most, and repays them only with someone who will tune WLM and keys.
- **Sharing with outside parties.** If partners already run one of them, sharing on the same product is the shortest path.

My default for a new company is the warehouse native to the cloud production runs on, with Snowflake when production is multi-cloud or the team has run it before. The skills that matter (workload isolation, layout, attribution, cache-friendly dashboards) transfer between all three. A migration between them is a real project, mostly spent on dialect differences and on the dashboards nobody remembered.

## A Checklist

- One warehouse, reservation or workgroup per workload (ingest and transform, BI, ad hoc, data science), not per person.
- Auto-suspend at a minute for batch and ad hoc compute, a few minutes for dashboards; nothing that polls a warehouse awake.
- Large tables partitioned or sorted on the time column, with a second key only where queries prove it; `require_partition_filter` on BigQuery event tables.
- Dashboards filter on dates the BI tool supplies, so results come from cache.
- Raw data lands append-only and replayable; JSON payloads promoted to typed columns in staging.
- Rebuildable staging in transient tables (Snowflake), with recovery windows sized for the data that matters.
- Every query tagged or labeled by workload and team; spend reviewed weekly, with history copied out where the platform keeps only days.
- Statement timeouts set per workload, and cost caps in place before anyone gets ad hoc access.
- Shares expose versioned views filtered by tenant, never raw tables.
- Open table formats for raw and long-retention data that other engines read; native tables for marts.

## References

**Snowflake**

- [Overview of warehouses](https://docs.snowflake.com/en/user-guide/warehouses-overview), credits per hour by size, per-second billing with a 60-second minimum, auto-suspend and auto-resume defaults
- [Warehouse considerations](https://docs.snowflake.com/en/user-guide/warehouses-considerations), auto-suspend guidance and the cache dropped on suspend
- [Multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster), Standard and Economy scaling policies
- [Using the Query Acceleration Service](https://docs.snowflake.com/en/user-guide/query-acceleration-service), [Snowpark-optimized warehouses](https://docs.snowflake.com/en/user-guide/warehouses-snowpark-optimized) and [Generation 2 standard warehouses](https://docs.snowflake.com/en/user-guide/warehouses-gen2)
- [Key concepts and architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts), storage, virtual warehouses and cloud services
- [Micro-partitions & Data Clustering](https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions), [Clustering Keys & Clustered Tables](https://docs.snowflake.com/en/user-guide/tables-clustering-keys), [Automatic Clustering](https://docs.snowflake.com/en/user-guide/tables-auto-reclustering) and [Search optimization service](https://docs.snowflake.com/en/user-guide/search-optimization-service)
- [Using Persisted Query Results](https://docs.snowflake.com/en/user-guide/querying-persisted-results), the 24-hour and 31-day result cache rules
- [Dynamic tables](https://docs.snowflake.com/en/user-guide/dynamic-tables-about), target lag
- [Preparing your data files](https://docs.snowflake.com/en/user-guide/data-load-considerations-prepare), [Snowpipe](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro) and [Snowpipe Streaming](https://docs.snowflake.com/en/user-guide/snowpipe-streaming/data-load-snowpipe-streaming-overview)
- [Semi-structured data types](https://docs.snowflake.com/en/sql-reference/data-types-semistructured) and [Querying semi-structured data](https://docs.snowflake.com/en/user-guide/querying-semistructured)
- [Understanding & using Time Travel](https://docs.snowflake.com/en/user-guide/data-time-travel), [Understanding and viewing Fail-safe](https://docs.snowflake.com/en/user-guide/data-failsafe), [Data storage considerations](https://docs.snowflake.com/en/user-guide/tables-storage-considerations) and [Cloning considerations](https://docs.snowflake.com/en/user-guide/object-clone)
- [Account Usage](https://docs.snowflake.com/en/sql-reference/account-usage) and [Parameters](https://docs.snowflake.com/en/sql-reference/parameters), view latency and retention, `QUERY_TAG` and `STATEMENT_TIMEOUT_IN_SECONDS`
- [About Secure Data Sharing](https://docs.snowflake.com/en/user-guide/data-sharing-intro) and [Apache Iceberg tables](https://docs.snowflake.com/en/user-guide/tables-iceberg)

**BigQuery**

- [Introduction to reservations](https://docs.cloud.google.com/bigquery/docs/reservations-intro), on-demand billing, the 10 MiB minimum and 2,000 slots per project
- [Estimate and control costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs), the free monthly TiB and dry runs
- [Editions](https://docs.cloud.google.com/bigquery/docs/editions-intro), [Understand slots (autoscaling)](https://docs.cloud.google.com/bigquery/docs/slots-autoscaling-intro), [Understand slots](https://docs.cloud.google.com/bigquery/docs/slots) and [Workload management using reservations](https://docs.cloud.google.com/bigquery/docs/reservations-workload-management)
- [Query queues](https://docs.cloud.google.com/bigquery/docs/query-queues) and [Quotas and limits](https://docs.cloud.google.com/bigquery/quotas)
- [Partitioned tables](https://docs.cloud.google.com/bigquery/docs/partitioned-tables), [Managing partitioned tables](https://docs.cloud.google.com/bigquery/docs/managing-partitioned-tables) and [Clustered tables](https://docs.cloud.google.com/bigquery/docs/clustered-tables)
- [Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs), `LIMIT` and bytes read, long-term storage
- [Cached query results](https://docs.cloud.google.com/bigquery/docs/cached-results) and [Materialized views](https://docs.cloud.google.com/bigquery/docs/materialized-views-intro)
- [Batch loading data](https://docs.cloud.google.com/bigquery/docs/batch-loading-data), [Storage Write API](https://docs.cloud.google.com/bigquery/docs/write-api) and [Streaming data](https://docs.cloud.google.com/bigquery/docs/streaming-data-into-bigquery)
- [Working with JSON data](https://docs.cloud.google.com/bigquery/docs/json-data) and [Nested and repeated fields](https://docs.cloud.google.com/bigquery/docs/nested-repeated)
- [Storage overview](https://docs.cloud.google.com/bigquery/docs/storage_overview) and [Time travel](https://docs.cloud.google.com/bigquery/docs/time-travel)
- [JOBS view](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs), [Labels](https://docs.cloud.google.com/bigquery/docs/labels-intro) and [Default configuration](https://docs.cloud.google.com/bigquery/docs/default-configuration)
- [Sharing introduction](https://docs.cloud.google.com/bigquery/docs/analytics-hub-introduction) and [Authorized views](https://docs.cloud.google.com/bigquery/docs/authorized-views)
- [Apache Iceberg managed tables](https://docs.cloud.google.com/bigquery/docs/iceberg-tables) and [Cloud Storage external tables](https://docs.cloud.google.com/bigquery/docs/external-data-cloud-storage)

**Amazon Redshift**

- [Billing for on-demand compute capacity](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing-on-demand.html), [Billing for Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing.html) and [Compute capacity for Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-capacity.html), RPU-hours, base capacity and usage limits
- [Workgroups and namespaces](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-workgroup-namespace.html)
- [Redshift provisioned clusters](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html) and [Pausing and resuming a cluster](https://docs.aws.amazon.com/redshift/latest/mgmt/rs-mgmt-pause-resume-cluster.html)
- [Implementing automatic WLM](https://docs.aws.amazon.com/redshift/latest/dg/automatic-wlm.html), [Query priority](https://docs.aws.amazon.com/redshift/latest/dg/query-priority.html), [Short query acceleration](https://docs.aws.amazon.com/redshift/latest/dg/wlm-short-query-acceleration.html) and [Concurrency scaling](https://docs.aws.amazon.com/redshift/latest/dg/concurrency-scaling.html)
- [Distribution styles](https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html), [Sort keys](https://docs.aws.amazon.com/redshift/latest/dg/t_Sorting_data.html), [Column compression](https://docs.aws.amazon.com/redshift/latest/dg/t_Compressing_data_on_disk.html), [Automatic table optimization](https://docs.aws.amazon.com/redshift/latest/dg/t_Creating_tables.html), [Vacuuming tables](https://docs.aws.amazon.com/redshift/latest/dg/t_Reclaiming_storage_space202.html) and [Analyzing tables](https://docs.aws.amazon.com/redshift/latest/dg/t_Analyzing_tables.html)
- [Amazon Redshift performance](https://docs.aws.amazon.com/redshift/latest/dg/c_challenges_achieving_high_performance_queries.html), result caching
- [Refreshing a materialized view](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-refresh.html) and [Automatic query rewriting](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-auto-rewrite.html)
- [Loading data files](https://docs.aws.amazon.com/redshift/latest/dg/c_best-practices-use-multiple-files.html), [Auto-copy from Amazon S3](https://docs.aws.amazon.com/redshift/latest/dg/loading-data-copy-job.html), [Streaming ingestion](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-streaming-ingestion.html) and [Zero-ETL integrations](https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html)
- [SUPER type](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)
- [Redshift snapshots and backups](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-snapshots.html) and [Snapshots and recovery points](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-snapshots-recovery-points.html)
- [SYS_QUERY_HISTORY](https://docs.aws.amazon.com/redshift/latest/dg/SYS_QUERY_HISTORY.html), [SYS_SERVERLESS_USAGE](https://docs.aws.amazon.com/redshift/latest/dg/SYS_SERVERLESS_USAGE.html), [System tables and views](https://docs.aws.amazon.com/redshift/latest/dg/cm_chap_system-tables.html) and [statement_timeout](https://docs.aws.amazon.com/redshift/latest/dg/r_statement_timeout.html)
- [Data sharing in Amazon Redshift](https://docs.aws.amazon.com/redshift/latest/dg/datashare-overview.html), [Using Apache Iceberg tables](https://docs.aws.amazon.com/redshift/latest/dg/querying-iceberg.html) and [Redshift Spectrum](https://docs.aws.amazon.com/redshift/latest/dg/c-using-spectrum.html)
