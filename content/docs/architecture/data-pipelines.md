+++
title = "Data Pipelines & Analytics"
nav_title = "Data Pipelines"
description = "Getting data from production into analytics without breaking either: CDC, ELT, tested transformations, replayable pipelines, contracts and one metrics layer."
category = "Architecture"
order = 408
tags = ["data", "analytics", "pipelines", "cdc", "warehouse"]
+++

Every company eventually asks questions its production database wasn't built to answer: revenue by cohort, conversion by channel, churn by plan. How you answer them decides whether analytics becomes a trusted part of how the company runs or a pile of dashboards nobody believes. The difference is almost never the tools; it's whether the pipeline is treated as software, with contracts, tests, owners and the ability to rebuild from scratch.

## Keep Analytics Off Production

Production databases (OLTP) are tuned for many small reads and writes on a few rows each. Analytical queries (OLAP) scan millions of rows, join everything, and aggregate. Running the second on the first is the most common early mistake, and it fails in two ways.

The obvious one: a heavy report fills the buffer cache with cold data and burns CPU, and checkout gets slow. A read replica moves the load but not the problem: its schema is still designed for the application, and a long analytical query there can conflict with replication and either stall it or get cancelled. The subtler one: analysts querying production tables couple themselves to your schema, so every [migration](/docs/database/zero-downtime-migrations) can break a dashboard you don't know exists.

So analytics gets its own store, a columnar warehouse (BigQuery, Snowflake, Redshift, ClickHouse) or lakehouse, fed by a pipeline, with a defined interface between the two.

## ELT, Not ETL

The old pattern was ETL: extract, transform in a pipeline tool, load the result. The modern default is ELT: load the raw data as-is, then transform it inside the warehouse with SQL. Warehouses made compute cheap, and keeping the raw data changes what's possible: when a transformation has a bug, you fix the SQL and rebuild from the raw layer. With ETL, the raw data was never kept, and the bug is baked into history.

The layers I use:

- **Raw:** exactly what the source sent, append-only, never edited. The audit trail and the rebuild source.
- **Staging:** one model per source table, cleaned up: renamed columns, cast types, deduplicated, nothing joined.
- **Marts:** business entities and facts (`customers`, `orders`, `daily_revenue`) built from staging, the only layer dashboards and analysts query.

The exception to "keep raw" is sensitive fields you shouldn't hold at all, which are dropped or tokenized before loading (see Privacy below).

## Change Data Capture

Rows leave an application database one of two ways. Scheduled queries (`WHERE updated_at > last_run`) are simple and fine for small tables, but they miss hard deletes and intermediate states, depend on every write updating `updated_at`, and put scan load on production.

**Change data capture (CDC)** reads the database's own replication log, so it sees every insert, update and delete, in commit order, with almost no load. In PostgreSQL, that's logical decoding through a replication slot; Debezium is the standard open-source connector, and most managed ingestion tools do the same underneath.

The operational catch is the replication slot: PostgreSQL retains every WAL segment the slot hasn't confirmed, so a stalled or abandoned connector makes the primary's disk grow until it fills. Monitor slot lag, alert on it well before disk is at risk, and set `max_slot_wal_keep_size` so a dead consumer costs you a resync instead of an outage.

CDC exports your tables, which means it exports your schema. For data other teams depend on, [domain events](/docs/architecture/events) through an outbox are a deliberate contract instead of your internal columns. CDC for your own analytics, events between teams.

## Event Tracking

Product analytics (page views, clicks, feature usage) comes from the client, and it rots faster than anything else in the stack. Six months in, there are `signup_clicked`, `SignUp Clicked` and `click_signup`, and nobody knows which one the funnel uses.

The fix is a **tracking plan**: a reviewed, versioned list of every event, its properties and their types, owned like code.

- **Events are named `object_action`** in past tense (`order_completed`, `invite_sent`), with one convention for the whole company.
- **Every event has a schema**, validated at collection. Events that don't match are quarantined, not silently loaded.
- **Adding or changing an event goes through review**, like an API change, because dashboards and models are its consumers.
- **No personal data in event properties by default.** Use the user's ID, not their email. Free-text fields are where PII leaks in unnoticed.
- **Server-side for anything that matters.** Purchases, signups and billing events are recorded by the backend, where ad blockers and flaky networks can't drop them. Client events are for behavior, not for money.

## Warehouse or Lakehouse

A **warehouse** stores data in its own managed format and gives you SQL, with storage and compute managed together. A **lakehouse** stores data as open table formats (Apache Iceberg, Delta Lake) on object storage, and lets several engines (Spark, Trino, the warehouses themselves) query the same tables.

Start with a managed warehouse: the fewest moving parts, so the team's time goes to modeling instead of infrastructure. Move toward a lakehouse for a concrete reason: volumes where object storage pricing matters, machine-learning workloads that need the data outside SQL, or avoiding years of data locked into one vendor's format. Open table formats have made that move much less dramatic.

## Transformations Are Code

The transformations between raw and marts are the business logic of analytics: what counts as an active user, how refunds affect revenue, which orders are test orders. They live in a repository as SQL models, reviewed, tested in CI and deployed like any other code. dbt made this standard, and the practices matter more than the tool.

- **Models are `SELECT` statements** that build on other models, so the dependency graph is explicit and the tool can build them in order.
- **Every model is tested.** At minimum, primary keys are `unique` and `not_null`, foreign keys satisfy `relationships`, and status columns hold `accepted_values`. A test is a query that returns failing rows; zero rows passes.
- **Business rules get their own tests.** Revenue is never negative; every order in the mart has a customer; daily totals reconcile with the payments ledger within a tolerance. These catch what schema tests can't.
- **CI builds changed models against a sample** and runs their tests before merge, the same [testing](/docs/engineering/testing) discipline as application code.
- **Incremental models for large tables,** processing only new data on each run, with a full rebuild available and exercised regularly so it still works when you need it.

A dashboard querying a raw table with its own joins and filters will drift from every other definition of the same thing.

## Pipelines Must Be Replayable

A pipeline that can only run forward is one bug away from permanently wrong data. Design every step so you can rerun it for any time range and get the same result:

- **Idempotent writes.** A run for a date partition replaces that partition (or merges on a key), never appends. Running it twice produces the same data as running it once, exactly the property [background jobs](/docs/architecture/background-jobs) need, for the same reason: retries happen.
- **Partitioned by event time**, not load time, so late-arriving data lands in the right place and a backfill touches only the affected partitions.
- **Parameterized by interval.** Each run processes "the data for this interval," given as input, not "everything since the last run," which can't be reproduced.
- **Deterministic.** No `now()` inside transformations; the interval is the clock.

With those, a backfill is routine: fix the logic, rerun the range, and the corrected data replaces the wrong data. Without them, every backfill is a bespoke script and a prayer.

## Data Contracts

The most common pipeline failure isn't in the pipeline. It's upstream: an application team renames a column, changes a status value or starts sending a field as a string, and every downstream model breaks, often silently.

A **data contract** is the producing team's explicit promise about what it publishes: the schema, what each field means, the allowed values, the freshness, and how changes are announced. It's an API contract for data, treated the same way:

- **Enforced in the producer's CI.** A schema change that breaks the contract fails the producer's build, not the consumer's dashboard a week later.
- **Versioned with a compatibility policy**, the same rules as [event schema evolution](/docs/architecture/events): additive changes are free; breaking ones need a new version and a migration window.
- **Owned.** Every published dataset has a named owning team, the one that gets paged when it's late or wrong.

For a small company, the lightweight version is enough: the tables analytics reads are documented, owned, and changes to them are reviewed by someone who knows what reads them.

## Quality and Freshness

Data is wrong in quieter ways than services are down. Nobody gets an error page; someone gets a wrong number in a board deck. So the pipeline needs the same reliability practices as a service:

- **Freshness SLOs** per important dataset: "the revenue mart is no more than 2 hours behind." Measure it, alert on it, and report it, as with any [SLO](/docs/operations/slos).
- **Volume checks:** a day with 40% fewer orders than the trailing average is either a real event or a broken ingest, and a human should find out which before a dashboard does.
- **Tests block publication.** When a model's tests fail, consumers keep the last good version rather than getting the broken one. Wrong data published confidently is worse than stale data clearly labeled.
- **Lineage**, so when a source breaks you know every model and dashboard it affects, and when a number looks wrong you can trace where it came from.

## Orchestration

An orchestrator runs the steps in order, retries failures, backfills ranges and shows what ran when. Apache Airflow is the long-established choice, pipelines as DAGs of tasks in Python; Dagster models pipelines around the data assets they produce; warehouse-native scheduling covers simpler setups. Whatever you choose, tasks are idempotent and parameterized by interval, the orchestrator holds no business logic, and retries, alerting and ownership are set per pipeline rather than left to defaults.

## Privacy and Retention

Analytics copies data, and every copy is in scope for your [privacy obligations](/docs/compliance/gdpr). The warehouse often ends up holding the most complete, least protected copy of customer data in the company.

- **Minimize at ingestion.** Don't load fields analytics doesn't need. Hash or tokenize identifiers that are only needed for joins. Card data never enters the warehouse in any form; see [Sensitive Data](/docs/payments/sensitive-data).
- **Classify columns** as personal or sensitive, and use the warehouse's column-level access controls and masking so most analysts see aggregates or masked values.
- **Erasure has to reach the warehouse,** including raw tables, snapshots and exports ([Data Retention](/docs/architecture/data-retention)).
- **Raw data has retention too,** the tension with "keep everything for rebuilds." Keep raw history as long as you can justify, partitioned by time so expiring it is cheap, and document the window.

## One Definition per Metric

The final failure mode is organizational: finance's revenue number doesn't match the product dashboard's, and the meeting is spent arguing which is right. Both are "right" by their own SQL.

Define each important metric once, in code: a semantic or metrics layer, or at minimum one mart model per metric with its definition next to it, and every dashboard reads from that. Changing what "active user" means is then a reviewed pull request, not a silent edit to one dashboard. A short list of company metrics with owners and written definitions does more for trust in data than any tool purchase.

### What a Definition Contains

"Churn rate" is not a definition. Two honest teams computing it will disagree on five points, and a definition settles each one:

- **The unit.** Customers, subscriptions, seats or accounts. Stripe counts "a customer with multiple active subscriptions" as "a single active subscriber" ([Stripe: Billing analytics](https://docs.stripe.com/billing/subscriptions/analytics)); a report that counts subscriptions will show a customer who cancels two plans as two churns.
- **The numerator and the denominator.** Stripe divides churned subscribers by subscribers at the start of the period plus new subscribers in it; dividing by the starting count alone gives a higher number from the same data.
- **Inclusion rules.** Free plans, trials, test accounts, internal users, refunds, discounts. Stripe even lets the account choose whether discounts reduce MRR and whether a subscriber is active at the start of the subscription or at the first payment, which makes those settings part of the definition.
- **The clock.** Which timestamp places an event in a period (created, completed, paid, settled), and which duration a rate is measured over (clocked-in hours, scheduled hours, calendar days).
- **An owner,** who approves changes and answers when the number looks wrong.

### Versions, Stamps and Frozen Periods

Once a metric decides money (a commission, a bonus, a royalty, a revenue share, an SLA credit), its definition is a contract, and someone will dispute it.

- **Version every definition.** The SQL or YAML lives in version control with an author, a reviewer, an effective date and a reason. Settings that change a metric without touching code (a threshold, a weighting, an attribution window) are logged with who changed them, when, and the before and after values.
- **Stamp outputs with the version.** Every row a payout, scorecard or invoice reads carries the definition version that built it, so a disputed number can be recomputed exactly as it was.
- **Freeze what was paid.** A closed period's figures are snapshotted, not recomputed from live data on each read. A late correction (a refund after payroll, a callback linked after the commission run) posts as an adjustment to the next open period, with a reference to the record it corrects, the same way a [ledger](/docs/payments/payment-states) corrects with new entries rather than edits.
- **Log manual overrides.** Excusing a late delivery for weather or reclassifying a cancellation reason changes someone's pay. Each override is an attributed action with a reason, reviewable by someone other than the person it benefits.

### Assign the Business Date Once

Every metric with a period needs a date, and the date is local to the business: a sale at 23:30 in Chicago belongs to that day's report, not tomorrow's UTC one. Assign the business date once, in the location's time zone, at the staging or mart layer ([Time & Date Formats](/docs/fundamentals/time#business-dates-business-days-and-holidays)), and have every metric group by that column. The alternative is the bug Stripe documents in its own product: prebuilt reports "use UTC" while charts use the account's time zone, "so monthly totals may not match exactly."

### Reconcile to the Source

A metric is only as complete as the pipeline under it. Run daily checks that the warehouse's counts (completed orders, payments, active subscriptions) match the source system's own totals for the same business date; a gap means the pipeline dropped or duplicated changes, and it surfaces before a payout uses the number.

The classic hole is deletes. Log-based CDC "can capture deletes" and needs no "Last Updated" column ([Debezium: Features](https://debezium.io/documentation/reference/stable/features.html)); a polling extract or a vendor connector's incremental sync that doesn't capture deletes never learns that a row is gone. A hard-deleted cancelled order then stays in the warehouse as a live one, and the completion rate quietly rises. When you sync from a system you don't control, check per table whether deletes are captured, and for tables where they aren't, schedule periodic full re-imports to find what disappeared.

For a worked set of metric definitions with formulas, see [Operating Metrics](/books/field-operations/operating-metrics).

## References

**Reference**

- [PostgreSQL: Logical replication](https://www.postgresql.org/docs/current/logical-replication.html), publications, subscriptions and replication slots
- [PostgreSQL: Replication settings](https://www.postgresql.org/docs/current/runtime-config-replication.html), `max_slot_wal_keep_size` caps the WAL a slot can retain (unlimited by default)
- [Debezium: Features](https://debezium.io/documentation/reference/stable/features.html), log-based CDC captures deletes and old record state without a "Last Updated" column
- [Stripe: Billing analytics](https://docs.stripe.com/billing/subscriptions/analytics), published metric definitions with units, denominators, configurable inclusion rules and the UTC report caveat
- [Debezium: PostgreSQL connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html), logical decoding, initial snapshots, and WAL retained by replication slots
- [dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests), the `unique`, `not_null`, `accepted_values` and `relationships` tests, and tests as queries for failing rows
- [dbt: Incremental models](https://docs.getdbt.com/docs/build/incremental-models), processing only new data on each run
- [Apache Airflow: DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html), pipelines as dependency graphs of tasks
- [Dagster](https://dagster.io/docs), orchestration around data assets
- [Apache Iceberg](https://iceberg.apache.org/), an open table format for lakehouses

**In practice**

- [Google SRE Workbook: Data processing pipelines](https://sre.google/workbook/data-processing/), freshness SLOs and idempotent mutations for pipelines
- [datacontract.com](https://datacontract.com/), data contracts and the Open Data Contract Standard, a Linux Foundation project
