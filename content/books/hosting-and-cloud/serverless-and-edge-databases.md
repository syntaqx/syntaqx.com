+++
title = "Serverless & Edge Databases"
description = "Neon, Supabase, PlanetScale, D1, Turso, Workers KV, Durable Objects, Hyperdrive and Upstash: consistency, branching, scale to zero and pricing per row."
category = "Hosting & Cloud Industry"
order = 2135
part = "Managed Services"
tags = ["databases", "serverless", "edge", "postgres", "sqlite", "pricing"]
+++

A serverless database is one the customer never sizes. There is no instance class to pick: compute starts when a query arrives, stops when the queries stop, and the bill counts what was done (compute-seconds, rows read, rows written, commands, requests) instead of how long a machine sat waiting. An edge database is one that puts data, or a copy of it, in many locations near the code that reads it. The two arrived together because the compute that calls them changed: functions and isolates that start in milliseconds, run in hundreds of locations and open a fresh connection per request broke the assumptions of a database that expected a few long-lived connections from servers in one region.

The products in this chapter come from two directions. One is serverless Postgres and MySQL: real relational engines with storage separated from compute so compute can scale to zero and databases can be branched like code (Neon, Supabase, PlanetScale, Xata, Nile). The other is data built for edge runtimes: SQLite as a service (Cloudflare D1, Turso and libSQL, Fly.io's LiteFS), global key-value stores (Workers KV, Deno KV, Upstash), and single-writer actors with storage attached (Durable Objects). Both change the meters, and both trade something for it: cold starts, consistency, size limits, or the risk that a young vendor changes its free tier or shuts a product. This chapter covers the history, how each family works, the consistency spectrum, pricing per request and row, free tiers and sunsets, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `edge_stores`, branches and the row and request meters. Provisioned engines (RDS, Aurora, Spanner, managed caches) are [Managed Databases](/books/hosting-and-cloud/managed-databases); the compute these databases serve is the [Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute) chapter.

## How the Providers Do It

| Product | Model | Consistency | Pricing unit, as of October 2026 | Notes |
| --- | --- | --- | --- | --- |
| **Neon** | Serverless Postgres, storage separated from compute | Postgres on one primary; read replicas | Compute-unit hours, GB-month storage | Part of Databricks since 2025; scale to zero, copy-on-write branches |
| **Supabase** | Postgres plus REST, auth, realtime and storage around it | Postgres | Plan plus compute add-ons, disk, MAU, egress | Free projects pause after a week inactive |
| **PlanetScale** | Managed MySQL (Vitess) and Postgres; Metal on local NVMe | Engine's own | Cluster size per month | Free Hobby plan retired 8 Apr 2024 |
| **Xata, Nile** | Postgres with branching (Xata) or per-tenant virtual databases (Nile) | Postgres | Not published on the pages opened | Built for preview environments and multi-tenant SaaS |
| **Cloudflare D1** | SQLite as a service, single primary, async read replicas | Sequential consistency per session | Rows read, rows written, GB-month | 10 GB per database, can't be raised |
| **Turso** | SQLite (libSQL) with embedded replicas in the app | Read-your-writes for the writer; others on sync | Plan with row-read and row-write allowances | libSQL forked from SQLite in 2022 |
| **Workers KV** | Global key-value, cached at the edge | Eventual, "up to 60 seconds or more" | Reads, writes, GB-month | 1 write per second per key |
| **Durable Objects** | Single-threaded actor with SQLite storage, one location | Strong | Requests, duration, rows, storage | SQLite storage GA 7 Apr 2025 |
| **Upstash Redis** | Serverless Redis-protocol store over HTTP or TCP | Per region, with read regions | Commands, storage, bandwidth | Also QStash (messaging) and Vector |
| **Deno KV** | Key-value on FoundationDB in production | Strong or eventual per read | Read and write units, storage | Still flagged unstable |

Three patterns run through the table:

- **The meter follows the work, not the machine.** Rows, commands and compute-seconds replace instance-hours, which makes a quiet database nearly free and a scan-heavy query expensive.
- **Consistency is a menu.** One vendor, Cloudflare, sells four points on the spectrum (KV, D1 with replicas, Durable Objects, and Hyperdrive in front of someone else's Postgres), and the customer picks per use.
- **The vendors are young and the terms move.** Neon was bought, PlanetScale removed its free plan, Upstash shut its Kafka, Fly.io sunset LiteFS Cloud, and Deno shut Deploy Classic, all between 2024 and 2026.

## How Serverless Databases Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 2010 | Vitess created at YouTube | Scaling MySQL by sharding behind a proxy | Operational complexity; later PlanetScale's base |
| 28 Sep 2018 | Workers KV announced | A data store reachable from edge code | Eventual consistency |
| 28 Sep 2020 | Durable Objects closed beta | Coordination and strong consistency at the edge | One location per object |
| 2021 | Neon founded | Postgres with separated storage, compute that scales to zero | A new storage layer to trust |
| 11 May 2022 | D1 announced ("D1 is built on SQLite") | A SQL database for Workers | Size limits and a single writer |
| 21 Sep 2022 | R2 generally available | Object storage with no egress fee | ([Storage chapter](/books/hosting-and-cloud/storage#egress-and-the-s3-compatible-challengers)) |
| 29 Sep 2022 | libSQL fork of SQLite | SQLite with replication and remote access | Diverging from upstream SQLite |
| Sept 2023 | Hyperdrive open beta | Serverless code opening connections to a database in one region | Cached reads aren't invalidated on writes |
| 8 Apr 2024 | PlanetScale retires Hobby | (A free plan with no path to profit) | Free users had to pay or leave |
| 1 Apr 2024 | D1, Hyperdrive and Queues GA | Production status for Cloudflare's data stack | |
| 15 Apr 2024 | Neon GA | | |
| 15 Oct 2024 | LiteFS Cloud ends | | Users move backups elsewhere |
| 11 Mar 2025 | PlanetScale Metal | Local NVMe instead of network storage | Fixed-size drives, no autoscaling |
| 7 Apr 2025 | Durable Objects SQLite storage GA, on the Free plan | | |
| 14 May 2025 | Databricks agrees to acquire Neon | Postgres for agents ("over 80% of databases provisioned on Neon were created automatically by AI agents") | A startup becomes part of a data platform |
| 22 Sep 2025 | PlanetScale for Postgres GA | | |
| 20 Jul 2026 | Deno Deploy Classic shut down | | KV data not migrated automatically |

## Serverless Postgres

**Neon** is the clearest design and the one most others are compared to. Its architecture separates compute from storage in three tiers:

- **Compute is ephemeral.** "Compute nodes do not own durable state and can be replaced freely." A compute is a Postgres process that can be started, resized or stopped without touching data.
- **Safekeepers hold the WAL.** They replicate the write-ahead log with Paxos; "a transaction is considered committed once a quorum of safekeepers has acknowledged the WAL record."
- **Pageservers materialize pages.** A pageserver "materializes page versions" from base images plus WAL, asynchronously, and serves pages to compute on request.
- **Object storage holds history,** and "is never accessed directly by the compute layer."

This is the shape of Aurora's [log-is-the-database](/books/hosting-and-cloud/managed-databases#aurora-the-log-is-the-database) design built from open source and Postgres extensions, and two features fall out of it. Compute can stop when idle (on the Free plan it scales to zero after five minutes, which can't be disabled; Scale lets the customer set it from one minute to always on), and a database can be branched from any point in its history window, covered below.

Neon's pricing (as of October 2026) is in **compute-unit hours**: Free includes 100 CU-hours per project, up to 2 CU (8 GB of RAM), 1 GB of storage per project and 10 branches; Launch is $0.106 per CU-hour up to 16 CU with storage at $0.35 per GB-month; Scale is $0.222 per CU-hour up to 56 CU (224 GB). Billing is hourly with no minimum, and "suspended compute accrues no CU-hours." The prices moved a lot after the acquisition. Databricks announced it would acquire Neon on 14 May 2025 without publishing a price (press reported about $1 billion), and the deal closed in 2025: Neon's November 2025 price post says "since joining Databricks earlier this year." Between August and November 2025 Neon cut storage from $1.75 to $0.35 per GB-month, folded enterprise features into Scale, doubled free compute from 50 to 100 CU-hours, and cut compute prices by up to 25%, attributing part of it to running "on Databricks' global infrastructure." Databricks separately sells Lakebase, generally available on AWS from 3 Feb 2026; neon.com continues as its own product.

**Supabase** wraps Postgres in the pieces of a backend: PostgREST and `pg_graphql` generate REST and GraphQL from the schema, GoTrue issues JWTs that work with Row Level Security, Realtime is "a scalable WebSocket engine" for presence, broadcast and database changes, Storage is "S3-compatible object storage service that stores metadata in Postgres," and Supavisor is a "multi-tenant Postgres connection pooler." Its stated philosophy is not to hide the database ("We do not abstract the Postgres database") and to keep the cloud compatible with self-hosting. Pricing (as of October 2026): Free gives 500 MB of database per project, 50,000 monthly active users and 5 GB of egress, with **projects that pause after a week of inactivity** and two active projects; Pro starts at $25 a month with 8 GB of disk ($0.125 per GB after), 100,000 MAU, 250 GB of egress and a $10 compute credit, and compute add-ons run from Micro at $10 (1 GB) to 16XL at $3,730 (256 GB). Supabase raised $100 million "at a $5B pre-money valuation" in October 2025; it is private, with no audited figures.

**PlanetScale** began on Vitess, which "was created in 2010 to solve the MySQL scalability challenges that the team at YouTube faced" and graduated from the CNCF in November 2019. Its recent history is a case study in the economics of the category. On 6 Mar 2024 it announced the end of its free Hobby plan as of 8 Apr 2024, alongside layoffs: "Every unprofitable company has a date in the future where it could disappear," and "We do not need to give away endless amounts of free resources in order to keep growing." On 11 Mar 2025 it launched **Metal**, databases on locally attached NVMe drives on AWS and Google Cloud with "unlimited I/O," against network storage; the tradeoff is fixed-size drives with no autoscaling, and a database that reaches its limit goes read-only until resized. PlanetScale for Postgres reached GA on 22 Sep 2025, with **Neki**, a Postgres sharding system from the Vitess team that is "not a fork of Vitess," and single-node Postgres from $5 a month (as of October 2026). Metal for Postgres dropped "from $589 per month to $50 per month" in December 2025.

**Xata** is now a managed Postgres platform built on copy-on-write branching, with production clones that anonymize data, branches that hibernate when idle, and a provisioning API for platforms. **Nile** virtualizes tenants inside one Postgres: "Each tenant ... functions as its own virtual database," isolated without Row Level Security, the database-level version of the playbook's [isolation models](/docs/architecture/multi-tenancy#isolation-models).

Serverless code and Postgres have one structural problem: every function invocation wants a connection, and Postgres connections are expensive processes. The products answer with poolers (Supabase's Supavisor, Cloudflare's Hyperdrive below), and the general rule is the playbook's ([Connections and Pooling](/docs/database/performance#connections-and-pooling)).

## Branching

A branch is a writable copy of a database at a point in time that costs only the changes made to it. Neon's documentation says branching "creates copy-on-write clones of your database instantly," that "writes to a branch are saved as a delta," and that branching "does not increase load on the parent branch." A branch can be cut from a past state within the history window (6 hours on Free, 1 day by default on paid plans, up to 7 days on Launch and 30 on Scale), can expire on its own, and can be schema-only when the data is sensitive. Xata adds anonymized production clones; Turso charges no usage for branching or point-in-time restore.

What branching changes for a provider is the number of databases. A preview deployment per pull request with its own database, a test run per CI job, an agent that creates a database per task: Databricks' release quoted Ali Ghodsi that "four out of every five databases on their platform are spun up by code, not humans." A provider selling branches has to bill them (Neon charges $1.50 per extra branch-month on Launch), cap them per project, expire them, and make sure a branch with production data inherits production's access rules. The environment discipline behind preview databases is the playbook's [Environments](/docs/operations/environments).

## SQLite at the Edge

SQLite is a library, not a server: one file, one writer at a time, reads as fast as the disk. Running it as a service means adding the parts a library doesn't have (a network protocol, replication, backups) without losing what makes it fast.

**Cloudflare D1** was announced on 11 May 2022 ("D1 is built on SQLite") and went GA on 1 Apr 2024 with 10 GB databases and up to 50,000 databases per account. The limits shape how it's used: on the Paid plan, 50,000 databases per account, **10 GB per database, which can't be raised**, 1 TB per account and 1,000 queries per Worker invocation; on Free, 10 databases of 500 MB. The 10 GB ceiling pushes customers toward many small databases (one per tenant, per user, per site) rather than one large one. Read replication requires the Sessions API: each query carries a **bookmark**, and a replica serves a version at least as new as the session has seen, which gives "sequential consistency for all queries in a session" (monotonic reads and read-your-writes); one primary takes all writes, and asynchronous replicas sit in six regions.

**Turso and libSQL.** libSQL is an open-contribution fork of SQLite under the MIT license, created on GitHub on 29 Sep 2022, which keeps SQLite's single-writer model and adds embedded replicas and remote access; Turso now says "libSQL is actively maintained, but new features are being developed in Turso." Turso Database (announced as Limbo on 10 Dec 2024 and renamed in January 2025) is a from-scratch Rust rewrite, file-compatible with SQLite, with `BEGIN CONCURRENT` multi-version writes and io_uring I/O; it says "we have not yet reached 1.0" and advises independent backups. Turso's distinctive feature is **embedded replicas**: "Reads are always served from the local replica" inside the application's own process, while writes go to the cloud primary first (they are "NOT written to the local file first" unless offline mode is on), and other replicas see them on their next sync. Pricing (as of October 2026): Free gives 100 databases, 5 GB, 500 million rows read and 10 million written; Developer is $4.99 with 2.5 billion reads (then $1 per billion) and 25 million writes (then $1 per million).

**LiteFS** is Fly.io's open-source replicated SQLite: "stable and running in production" but pre-1.0, with a warning that Fly is "not able to provide support or guidance for it. Use with caution." Its managed backup service, LiteFS Cloud, was announced as sunsetting on 15 Jul 2024 and "will continue to be available until October 15, 2024."

## Cloudflare's Data Stack

Cloudflare sells the most complete data stack for edge code, and the products differ mainly in where they sit on the consistency spectrum:

- **Workers KV** is "eventually-consistent": writes go to a small number of central stores and are cached at the edge on read, and "changes may take up to 60 seconds or more to be visible in other global network locations" (the default `cacheTtl` is 60 seconds). Limits are one write per second per key, 25 MiB values and 512-byte keys. It is built for configuration, routing tables and content that is read far more than written.
- **Durable Objects** are "single-threaded and cooperatively multi-tasked" objects with a "globally-unique name," created "close to where it is first requested," with storage that is "strongly consistent yet fast to access." Two mechanisms make a single-threaded object correct without locks: **input gates**, which deliver no new events to the object while storage operations run, and **output gates**, which hold outgoing messages "back until the write has completed," so no client sees a result that could still be lost. SQLite-backed storage went GA on 7 Apr 2025 with 10 GB per object on the Paid plan, and the Free plan got access the same day. A Durable Object is the edge answer to coordination: a chat room, a game session, a rate limiter, a document being edited, each one an object.
- **R2** is S3-compatible object storage with no egress fee, GA on 21 Sep 2022; it belongs to the [Storage: Block, File & Object](/books/hosting-and-cloud/storage#egress-and-the-s3-compatible-challengers) chapter, and appears here because Workers read it as a data source.
- **Hyperdrive** puts a connection pool "in one or more regions closest to your origin database" and caches non-mutating query results, for "any Postgres or MySQL database." It solves the connection storm from serverless code; its cache is TTL-based and "does not invalidate cached read query results when your application writes," so read-after-write needs the cache off for that query. It reached GA on 1 Apr 2024; Free includes 100,000 queries a day and Paid is unlimited, with pooling and caching included.
- **Queues** deliver at least once and bill per 64 KB operation; they are covered with the other queues in [Managed Queues & Streaming](/books/hosting-and-cloud/managed-queues-and-streaming#serverless-and-http-queues).

## Upstash and Deno KV

**Upstash** sells Redis-protocol storage priced per command, reachable over HTTP from functions that can't hold a TCP connection. Pricing (as of October 2026): Free gives 250 MB, 10 GB of bandwidth and 500,000 commands a month; pay-as-you-go is $0.20 per 100,000 commands, $0.25 per GB of storage after the first 1 GB, 200 GB of bandwidth free then $0.03 per GB, up to 100 GB; fixed plans from $10 to $1,500 a month drop the command charge; a Prod Pack adds an SLA, multi-zone HA, encryption at rest and SOC 2 for $200 a month per database. Upstash also sells **QStash**, HTTP messaging and scheduling (in the queues chapter), and **Upstash Vector**, per-request vector indexes. It shut down its Kafka product: a 6 Sep 2024 post said it would "discontinue support for Upstash Kafka starting in six months" (early 2025), closed it to new users and offered migration credits.

**Deno KV** is backed by FoundationDB in production and SQLite locally; reads choose strong or eventual consistency, writes are always strong, and `kv.atomic()` gives compare-and-set on versionstamps. It is still flagged unstable (`--unstable-kv`). When Deno shut down Deploy Classic on 20 Jul 2026, its migration guide warned that "your existing KV data is not automatically migrated." On the new Deploy (as of October 2026), Free includes 1 GiB of KV storage, 1 million read units (4 KiB each) and 500,000 write units (1 KiB each) a month; Pro is $20 a month with higher allowances and overage at $1 per million reads and $2.50 per million writes.

## The Consistency Spectrum

The products sort along one axis, and the right one depends on what a stale read costs:

| Point | Example | What a reader can see | Good for | Bad for |
| --- | --- | --- | --- | --- |
| Eventual, cached | Workers KV | A value up to a minute or more old in another location | Config, flags, routing, rendered content | Counters, balances, anything written often |
| Eventual or strong per read | Deno KV, Upstash read regions | The reader chooses | Mixed workloads with clear rules | Code that forgets to choose |
| Session-consistent replicas | D1 with Sessions, Turso embedded replicas | Its own writes, and never an older version than it saw | User-scoped data read near the user | Cross-user invariants |
| Single writer, async replicas | Neon, Supabase, PlanetScale | Strong on the primary, lag on replicas | Ordinary relational applications | Writes from far away (latency) |
| Strong, one location | Durable Objects | Everything, serialized | Coordination: rooms, sessions, locks, rate limits | Global read latency, data larger than an object |

The general isolation rules are the playbook's ([What Isolation Levels Allow](/docs/database/transactions-and-concurrency#what-isolation-levels-allow)). The edge adds distance: a strongly consistent write has to travel to wherever the single writer lives, so "edge database" usually means fast reads near the user and writes that still go somewhere specific.

## Pricing per Request and Row

The new meters, side by side (as of October 2026):

| Product | Reads | Writes | Storage | Free allowance |
| --- | --- | --- | --- | --- |
| D1 (Paid) | 25 billion rows a month, then $0.001 per million | 50 million rows a month, then $1.00 per million | 5 GB, then $0.75 per GB-month | Free: 5 million rows read and 100,000 written a day |
| Durable Objects (SQLite) | Same as D1 | Same as D1 | 5 GB-month, then $0.20 per GB-month | Plus requests ($0.15 per million after 1 million) and duration ($12.50 per million GB-s after 400,000) |
| Workers KV (Paid) | 10 million, then $0.50 per million | 1 million, then $5.00 per million | $0.50 per GB-month | Free: 100,000 reads and 1,000 writes a day |
| Turso (Developer, $4.99) | 2.5 billion rows, then $1 per billion | 25 million rows, then $1 per million | 9 GB | Free: 500 million read, 10 million written |
| Upstash Redis (pay as you go) | $0.20 per 100,000 commands, reads and writes alike | Same | $0.25 per GB after 1 GB | 500,000 commands a month |
| Neon (Launch) | Compute: $0.106 per CU-hour | Same | $0.35 per GB-month | 100 CU-hours a project |

The units aren't comparable, and that is the point to understand before reading any comparison. A D1 "row read" counts rows the query scanned, not rows returned, so an unindexed query over a million-row table costs a million rows; an indexed write in D1 adds a row written per index. A KV read is one key. An Upstash command is one Redis command, whatever its size. A Neon CU-hour bills compute whether the query was efficient or not. The same application can cost ten times more on one product than another depending only on its query shapes, so the playbook's [indexing](/docs/database/performance#indexes-that-earn-their-keep) rules are a pricing rule on row-metered databases.

Two other properties are part of the price. **Egress**: D1, KV and R2 charge no egress, and Hyperdrive charges none for its pooling; Supabase and Upstash bill bandwidth past an allowance. **Idle cost**: idle D1 databases "cost nothing," idle Turso databases cost only storage, suspended Neon compute accrues nothing, while a provisioned instance bills every hour it exists. That is the economic reason a provider can offer 50,000 databases per account: a database that isn't queried costs it only storage.

## Free Tiers, Pauses and Sunsets

The free tiers in this category have a common shape and common failure modes:

- **Daily limits that hard-fail.** D1's and KV's free limits reset at 00:00 UTC, and queries fail when a limit is hit; Hyperdrive's free queries "fail with an error" past 100,000 a day. A provider choosing hard failure over billing protects itself from free-tier abuse and the customer from a surprise bill, at the cost of an outage the customer may not have planned for.
- **Inactivity pauses.** Supabase pauses free projects after a week without activity; Neon free compute suspends after five minutes and resumes on the next connection; CloudAMQP deletes idle free instances after two months. A paused database is a resource in a stopped state with a resume path, not a deleted one, and the notice before deletion is a customer-contact obligation ([Consumer Contact](/docs/compliance/consumer-contact)).
- **Free plans removed.** PlanetScale's Hobby plan ended on 8 Apr 2024 with about a month's notice.
- **Products sunset.** LiteFS Cloud (2024), Upstash Kafka (2025) and Deno Deploy Classic (2026) each gave months of notice and a migration path of varying completeness.

The engineering rule for free-tier cliffs is the playbook's ([Free Tiers and Their Cliffs](/docs/operations/cost-and-finops#free-tiers-and-their-cliffs)); the provider's side is the [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits) and [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life) chapters.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape |
| --- | --- | --- | --- | --- | --- |
| **Provisioned managed Postgres** (RDS, Cloud SQL) | Instance in one region | Mature, predictable, portable | Connection storms from serverless; idle cost; no branching | Engine's license, cloud's terms | Instance-hours and storage |
| **Serverless Postgres** (Neon, Supabase, PlanetScale, Xata) | Postgres with separated storage or managed plans | Scale to zero, branches, real Postgres | Cold start on first query after suspend; vendor risk; pooling required | Neon and Supabase components open source; services proprietary; Neon owned by Databricks | CU-hours or plan plus usage |
| **SQLite as a service** (D1, Turso) | One file per database, single writer, replicas | Many small databases nearly free; reads near users | Size caps (D1 10 GB); one writer; libSQL and Turso Database diverging from SQLite | SQLite public domain; libSQL and Turso MIT; D1 proprietary | Rows read and written |
| **Edge key-value** (Workers KV, Deno KV, Upstash) | Keys and values, cached or replicated | Simple, global, cheap reads | Eventual consistency (KV); per-key write limits; no queries | Proprietary services | Reads, writes, commands |
| **Actors with storage** (Durable Objects) | One single-threaded object per key | Strong consistency without locks; coordination | One location per object; 10 GB per object; Cloudflare only | Proprietary | Requests, duration, rows, storage |
| **Pool and cache in front of an existing database** (Hyperdrive) | Keeps the origin, fixes connections | No migration | Cached reads aren't invalidated on writes; origin latency remains | Proprietary | Included in the plan |

## My Default

My default for a new application on serverless compute is serverless Postgres with its pooler (Neon or Supabase, chosen by whether I want the backend pieces Supabase bundles), with branches per pull request and scale to zero on everything except production. It keeps a portable engine, gives me preview databases for nothing, and costs almost nothing while traffic is small; the price is a cold start on the first query after a suspend and a dependency on a young vendor, which I'd hedge by keeping the schema and data in plain Postgres I can dump and restore elsewhere.

I'd pick D1 or Turso when the data naturally splits into many small databases (one per tenant or user) and reads must be near the user, and Durable Objects whenever the problem is coordination (a room, a counter, a lock) rather than storage. I'd use Workers KV only for data I'd happily see a minute stale. On any row-metered product I'd index before launch, because there the query plan is the bill. The tradeoff that would change my default is scale and predictability: once a database is busy around the clock, an always-on serverless compute costs about what a provisioned instance does, and a provisioned managed engine with a pooler in front becomes the simpler bill.

## How to Build It

The chapter adds an `edge_stores` side table for resources of kind `'edge_store'`, scale-to-zero and branching columns on the `databases` side table from [Managed Databases](/books/hosting-and-cloud/managed-databases#how-to-build-it), a `database_branches` table, and the row, request and compute-unit meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Serverless Postgres is a `databases` row with `deployment = 'serverless'`; a SQLite database, a key-value namespace, a Durable Object namespace or a Redis-protocol store is an `edge_stores` row. An object store such as R2 is a `buckets` row from the storage chapter.

```sql
CREATE TABLE edge_stores (               -- side table: kind = 'edge_store'
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  store_kind          TEXT NOT NULL CHECK (store_kind IN ('sqlite', 'key_value',
                        'actor_namespace', 'redis_protocol', 'vector_index')),
  consistency         TEXT NOT NULL CHECK (consistency IN ('eventual_cached',
                        'per_read_choice', 'session_sequential', 'strong_single_writer')),
  primary_region_id   TEXT REFERENCES regions (id),  -- null: placed on first request
  replica_regions     TEXT[] NOT NULL DEFAULT '{}',
  max_bytes           BIGINT NOT NULL,     -- a hard cap, e.g. 10 GB per SQLite database
  max_writes_per_key_per_second NUMERIC,   -- KV's per-key write limit, where one applies
  engine_license      TEXT,                -- SPDX id of the engine, e.g. 'MIT' for libSQL
  CHECK (store_kind <> 'sqlite' OR consistency IN ('session_sequential',
         'strong_single_writer'))
);

ALTER TABLE databases                    -- serverless Postgres from Managed Databases
  ADD COLUMN suspend_after       INTERVAL,         -- null: always on
  ADD COLUMN history_retention   INTERVAL,         -- how far back a branch or restore can reach
  ADD COLUMN pooler_endpoint     TEXT;             -- the pooled connection string's host

CREATE TABLE database_branches (         -- a copy-on-write branch of a database
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),  -- the branch is a resource
  parent_resource_id  UUID NOT NULL REFERENCES resources (id),     -- the branch it came from
  branched_at_point   TIMESTAMPTZ NOT NULL, -- the history point it was cut from
  data_mode           TEXT NOT NULL CHECK (data_mode IN ('full', 'schema_only',
                        'anonymized')),
  created_by          TEXT NOT NULL,        -- typed actor: a user, 'ci:<run>', 'agent:<id>'
  expires_at          TIMESTAMPTZ,          -- branches for previews end on their own
  CHECK (resource_id <> parent_resource_id)
);

CREATE INDEX database_branches_expiry ON database_branches (expires_at)
  WHERE expires_at IS NOT NULL;
```

The meters, all `usage_events.meter` values rated by SKUs in the core catalog:

| Meter | Unit | Counted when |
| --- | --- | --- |
| `edge.rows_read` | row | Each row scanned by a query, not each row returned |
| `edge.rows_written` | row | Each row written, plus one per index updated |
| `edge.requests` | request | Each KV read, write, delete or list; each actor request (WebSocket messages at the provider's ratio) |
| `edge.commands` | request | Each Redis-protocol command |
| `edge.duration_gb_seconds` | gb_second | Actor wall time times the memory billed per object |
| `edge.storage_gb_hours` | gb_month | Sampled hourly, per store |
| `db.compute_unit_seconds` | second | Each second a serverless compute runs, times its size; zero while suspended |

Free plans in this category hard-fail at a daily limit instead of billing. That is a quota with a daily window, checked against the day's usage, with the plan's `overage_mode` deciding between failing and billing:

```sql
-- Has this account used up today's free rows read? (UTC day, as the providers reset)
SELECT q.limit_value,
       COALESCE(SUM(u.quantity), 0) AS used_today,
       COALESCE(SUM(u.quantity), 0) >= q.limit_value AS exhausted
FROM quotas q
LEFT JOIN usage_events u
  ON u.account_id = q.account_id
 AND u.meter = 'edge.rows_read'
 AND lower(u.occurred_during) >= date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
WHERE q.quota_code = 'edge.rows_read.daily'
  AND q.account_id = $1
  AND q.valid_during @> NOW()
GROUP BY q.limit_value;
```

In production the check reads a running counter, not `usage_events`, because the decision is on the request path; the counter is reconciled against the events, which stay the billing truth.

Notes on the sketch:

- **A branch is a resource.** It has its own endpoint, compute, quota and bill, so it is a `resources` row (kind `'database'`) with a `database_branches` row naming its parent and the history point; deleting the parent can't silently orphan it.
- **Branches expire and say who made them.** Agents and CI create most branches; `created_by` and `expires_at` let the provider clean them up and bill the right project.
- **Consistency is a column.** Support, documentation and the console can tell a customer what a reader may see, and a migration between stores can be checked against it.
- **Caps are data, not code.** The 10 GB ceiling and the per-key write limit are columns, so an error message can quote them and a quota request can be refused with the real number.
- **Suspension is a state.** A suspended serverless compute is `resources.state = 'stopped'` with a `resource.suspended` event; a free project paused for inactivity is the same state with a deletion clock from the [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension#suspension-and-deletion-clocks) chapter, and its notice goes through [notifications](/docs/architecture/notifications).
- **Events:** `database.branch_created`, `database.branch_expired`, `database.suspended`, `database.resumed`, `edge_store.limit_reached` and `edge_store.cap_reached` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Who created each database and branch, and from what.** Branches carry production data unless they are schema-only or anonymized; the record of who cut a branch from which point, with which data mode, is what an access review or a breach investigation asks for.
- **Every hard-fail and pause.** When a free limit stopped a customer's queries, or a project was paused for inactivity, with the notice sent and the time it resumed, because "my site went down" tickets start there.
- **Row counts behind the bill.** Rows read and written per database per day, reproducible from events, since row-metered bills are the hardest for customers to predict and the most often disputed.
- **Sunset notices and exports.** For a product being retired, every notice sent and every export delivered, per account ([Data Retention & Deletion](/docs/architecture/data-retention)).

## What This Means for the System You Build

- **Meter the work, and publish what a unit counts:** rows scanned, not returned; one command, whatever its size.
- **Make consistency a stated property of every store,** and sell more than one point on the spectrum if the compute is global.
- **Bill idle at storage only,** and make suspend and resume a visible state with an event.
- **Treat branches as resources** with a parent, a creator, a data mode and an expiry.
- **Pool connections for serverless callers** as part of the product, not an add-on.
- **Choose hard-fail or billing for free limits deliberately,** reset on a published clock, and tell the customer before they hit it.
- **Plan every sunset as a migration:** notice, export, and a path that moves the data, not just the code.

## References

**Neon**

- [Neon: Architecture overview](https://neon.com/docs/introduction/architecture-overview), ephemeral compute, safekeepers and Paxos commit, pageservers, object storage
- [Neon: Branching](https://neon.com/docs/introduction/branching), copy-on-write branches, history windows, expiry and schema-only branches
- [Neon: Pricing](https://neon.com/pricing), plans, CU-hour rates, storage and branch prices, scale to zero
- [Neon: Major compute price reduction](https://neon.com/blog/major-compute-price-reduction-on-neon), the 2025 price changes and "since joining Databricks earlier this year"
- [Neon: Neon is Generally Available](https://neon.com/blog/neon-ga), the 15 Apr 2024 GA
- [Databricks: Databricks agrees to acquire Neon](https://www.databricks.com/company/newsroom/press-releases/databricks-agrees-acquire-neon-help-developers-deliver-ai-systems), the 14 May 2025 announcement, founding year and the agent-provisioning figures
- [The Stack: Databricks just bought a baby Postgres provider](https://www.thestack.technology/databricks-just-bought-a-baby-postgres-provider-for-1-billion/), the reported price of about $1 billion
- [Databricks: Lakebase generally available](https://www.databricks.com/blog/databricks-lakebase-generally-available), GA on AWS, 3 Feb 2026

**Supabase, PlanetScale, Xata and Nile**

- [Supabase: Architecture](https://supabase.com/docs/guides/getting-started/architecture), the components and philosophy
- [Supabase: Pricing](https://supabase.com/pricing), plans, pauses and add-ons
- [Supabase: Series E](https://supabase.com/blog/supabase-series-e), the October 2025 raise
- [Vitess: History](https://vitess.io/docs/overview/history/), the 2010 YouTube origin and the 2019 CNCF graduation
- [PlanetScale: PlanetScale forever](https://planetscale.com/blog/planetscale-forever), the Hobby plan's retirement and the quotes
- [PlanetScale: Announcing Metal](https://planetscale.com/blog/announcing-metal), local NVMe and the launch claims
- [PlanetScale: Metal documentation](https://planetscale.com/docs/metal), fixed drives and read-only at the limit
- [PlanetScale: $50 Metal is GA for Postgres](https://planetscale.com/blog/50-dollar-planetscale-metal-is-ga-for-postgres), the price change
- [PlanetScale: PlanetScale for Postgres is generally available](https://planetscale.com/blog/planetscale-for-postgres-is-generally-available), GA and Neki
- [PlanetScale: Pricing](https://planetscale.com/pricing), the $5 single-node plan
- [Xata](https://xata.io/), branching, anonymized clones and hibernation
- [Nile: What is Nile](https://www.thenile.dev/docs/getting-started/whatisnile), tenants as virtual databases

**Cloudflare**

- [Cloudflare: Introducing Workers KV](https://blog.cloudflare.com/introducing-workers-kv/), the 28 Sep 2018 announcement
- [Cloudflare: Workers Durable Objects beta](https://blog.cloudflare.com/introducing-workers-durable-objects/), the 28 Sep 2020 closed beta
- [Cloudflare: Durable Objects, easy, fast, correct: choose three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/), input and output gates
- [Cloudflare: Announcing D1](https://blog.cloudflare.com/introducing-d1/), the 11 May 2022 announcement
- [Cloudflare: D1 GA, Hyperdrive and Queues](https://blog.cloudflare.com/making-full-stack-easier-d1-ga-hyperdrive-queues/), the 1 Apr 2024 GA announcements
- [Cloudflare: R2 is generally available](https://blog.cloudflare.com/r2-ga/), GA on 21 Sep 2022
- [Cloudflare D1: Limits](https://developers.cloudflare.com/d1/platform/limits/), database counts and sizes
- [Cloudflare D1: Pricing](https://developers.cloudflare.com/d1/platform/pricing/), rows read and written, storage, free limits and resets
- [Cloudflare D1: Read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/), the Sessions API, bookmarks and replica regions
- [Cloudflare Workers KV: How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/), eventual consistency and propagation
- [Cloudflare Workers KV: Limits](https://developers.cloudflare.com/kv/platform/limits/), per-key writes, value and key sizes
- [Cloudflare Workers KV: Pricing](https://developers.cloudflare.com/kv/platform/pricing/), reads, writes and storage
- [Cloudflare: What are Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/), single-threaded objects with strongly consistent storage
- [Cloudflare changelog: Durable Objects on the Free plan](https://developers.cloudflare.com/changelog/2025-04-07-durable-objects-free-tier/), SQLite storage GA
- [Cloudflare Durable Objects: Limits](https://developers.cloudflare.com/durable-objects/platform/limits/), 10 GB per object on Paid
- [Cloudflare Durable Objects: Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), requests, duration, rows and storage
- [Cloudflare R2: Pricing](https://developers.cloudflare.com/r2/pricing/), storage classes, operations and no egress
- [Cloudflare Hyperdrive: How Hyperdrive works](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/), pool placement and the TTL cache
- [Cloudflare Hyperdrive: Pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/), free daily queries and failures past the limit

**SQLite, key-value and Redis-protocol services**

- [libSQL repository](https://github.com/tursodatabase/libsql), the fork's model and maintenance status
- [GitHub API: tursodatabase/libsql](https://api.github.com/repos/tursodatabase/libsql), the 29 Sep 2022 creation date
- [Turso Database repository](https://github.com/tursodatabase/turso), the Rust rewrite and its pre-1.0 status
- [Turso: Introducing Limbo](https://turso.tech/blog/introducing-limbo-a-complete-rewrite-of-sqlite-in-rust), the 10 Dec 2024 announcement
- [Turso: Upcoming changes to the Turso platform](https://turso.tech/blog/upcoming-changes-to-the-turso-platform-and-roadmap), the January 2025 rename
- [Turso: Embedded replicas](https://docs.turso.tech/features/embedded-replicas/introduction), local reads, remote writes and sync
- [Turso: Pricing](https://turso.tech/pricing), plans and row allowances
- [Fly.io: LiteFS](https://docs.fly.io/litefs), status and support warning
- [Fly.io community: Sunsetting LiteFS Cloud](https://community.fly.io/t/sunsetting-litefs-cloud/20829), the 15 Oct 2024 end date
- [Upstash: Redis pricing](https://upstash.com/pricing/redis), commands, storage, bandwidth and fixed plans
- [Upstash: Announcing Upstash Workflow and deprecating Upstash Kafka](https://upstash.com/blog/workflow-kafka), the six-month notice
- [Upstash: Vector](https://upstash.com/docs/vector/overall/getstarted), per-request pricing
- [Deno: Deno KV manual](https://docs.deno.com/deploy/kv/manual/), FoundationDB, consistency choices and atomic operations
- [Deno: Migration guide](https://docs.deno.com/deploy/migration_guide/), the Deploy Classic shutdown and KV data
- [Deno Deploy: Pricing](https://deno.com/deploy/pricing), KV allowances and overage
