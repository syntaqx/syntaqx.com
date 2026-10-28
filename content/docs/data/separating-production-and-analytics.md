+++
title = "Separating Production from Analytics"
nav_title = "Production vs Analytics"
description = "Why analysts never query production primaries, where read replicas stop helping, and how CDC, events, contracts and reverse ETL cross the boundary safely."
category = "Data Platforms"
order = 1271
tags = ["data", "analytics", "cdc", "data-contracts", "security"]
+++

Every product that succeeds grows a second workload. The first is the product itself: a checkout, a match, a booking, a ledger entry, thousands of small transactions a second. The second is everyone who wants to understand the first: finance closing the month, a designer checking whether a level is too hard, a data scientist training a churn model, a support lead asking which customers had a bad week. Both want the same data. They should never get it from the same place.

This chapter is about the line between them: why it exists, what crosses it, and who is allowed to stand on which side. [Data Pipelines & Analytics](/docs/architecture/data-pipelines) covers the pipeline that carries data over the line (CDC mechanics, ELT layers, tests, replayability). The rest of this section covers what sits on the far side: [warehouses and lakes](/docs/data/warehouses-and-lakes), [running a cloud warehouse](/docs/data/cloud-warehouses), [real-time analytical databases](/docs/data/analytical-databases), [streaming](/docs/data/streaming), [modeling](/docs/data/data-modeling), [data science platforms](/docs/data/data-science-platforms) and [governance](/docs/data/data-governance).

## Two Workloads, Two Shapes

| | Production (OLTP) | Analytics (OLAP) |
| --- | --- | --- |
| A typical query | Fetch one order by ID, update one row | Sum revenue by country and week for two years |
| Rows touched | A handful, through an index | Millions or billions, through scans |
| Columns touched | Most of a row | A few columns of a wide table |
| Concurrency | Thousands of short transactions | Tens of long queries |
| Latency budget | Milliseconds, inside a user request | Seconds to minutes, nobody waiting at a spinner |
| Schema designed for | The application's invariants | The questions people ask |
| Who changes it | Product engineers, every sprint | Data engineers, on a slower cadence |

The two shapes pull storage engines in opposite directions. Row stores with B-tree indexes make the left column fast; columnar stores with compression and vectorized scans make the right column fast ([Real-Time Analytical Databases](/docs/data/analytical-databases) explains why). No setting turns one into the other. [Keep Analytics Off Production](/docs/architecture/data-pipelines#keep-analytics-off-production) gives the short version of what goes wrong when they share a database; the rest of this chapter is the longer one.

## Nobody Queries the Primary

My rule has no exceptions for people: analysts, data scientists, BI tools, notebooks and spreadsheets never connect to a production primary. Not read-only, not "just this once", not with a timeout.

- **Load.** One `SELECT` with a `GROUP BY` over the orders table can evict the hot working set from the buffer cache, and the next thousand checkouts pay for it in disk reads. The analyst sees a slow query; the customer sees a slow page.
- **Locks and long transactions.** A long-running read holds back cleanup (in PostgreSQL, vacuum cannot remove row versions an open snapshot can still see), so a notebook left open over lunch bloats the hottest tables.
- **Coupling.** A dashboard that reads `orders.status` directly turns a column rename into an outage on a team that was never consulted. Production schemas belong to the people who ship the product, and they need to change them every week.
- **Exposure.** Production holds everything: emails, addresses, tokens, free-text notes. A credential that can read production for analytics can read all of it.

The early-stage version of this is real. Uber's own history of its data platform describes the start: data in "a few" MySQL and PostgreSQL databases, where "our engineers had to access each database or table individually," before it adopted a columnar warehouse and later a Hadoop lake ([Uber: Uber's Big Data Platform](https://www.uber.com/blog/uber-big-data-platform/)). Every company starts there. The mistake is staying.

Production debugging is a different thing. An on-call engineer reading one customer's rows to fix one incident uses the [support access](/docs/security/support-access) path: time-boxed, reasoned, logged. That is an operational read with a ticket attached, not analytics.

## Read Replicas Buy Time, Not a Platform

The usual first step is a read replica: the same database, a copy behind the primary, and the analysts pointed at it. It moves the CPU and I/O off the primary, which is real, and it fixes nothing else.

PostgreSQL's documentation is direct about the main limit. A hot standby has to keep replaying changes from the primary, and when a replayed change conflicts with a running query (most often vacuum removing row versions the standby query can still see), the standby waits and then cancels the query: "Conflicting queries will be canceled once it has taken longer than the relevant delay setting to apply any newly-received WAL data" ([PostgreSQL: Hot Standby](https://www.postgresql.org/docs/current/hot-standby.html)). The delay, `max_standby_streaming_delay`, defaults to 30 seconds ([PostgreSQL: Replication settings](https://www.postgresql.org/docs/current/runtime-config-replication.html)). So the analyst's ten-minute query dies at an unpredictable point, and while the standby waits, the replica falls up to that delay behind for everyone else reading it.

![Plan view of a hot standby timeline in seconds. A long analytical query Q1 of 300 seconds starts at zero. At C1 = 60 seconds a vacuum cleanup record arrives from the primary that conflicts with the query's snapshot. Replay pauses for the highlighted D1 = 30 seconds, the default standby max delay setting (max_standby_streaming_delay), during which replica lag grows to L1 = 30 seconds for every other reader. At X1 = C1 + D1 = 90 seconds the query is cancelled, R1 = Q1 - X1 = 210 seconds short of finishing, and replay catches up. Notes say raising the delay trades cancelled queries for a replica that lags further, and standby feedback (hot_standby_feedback) trades them for bloat on the primary.](/diagrams/dp-separation-replica-conflict.svg "A replica serves two masters. The 30-second default either cancels the long query or holds the whole replica behind; the timing values other than the default are illustrative.")

Both escape hatches move the cost somewhere worse. Raising the delay (or setting it to `-1`, wait forever) keeps the query alive and lets the replica lag for every other reader, including the application reads you moved there on purpose. Turning on `hot_standby_feedback` stops most cancellations by telling the primary not to clean up rows the standby still needs, which PostgreSQL warns "may result in undesirable table bloat" on the primary; it adds that this is no worse than running the queries on the primary, which is exactly the problem you were avoiding. And the replica still has the production schema, the production PII and the production column names, so the coupling and exposure problems are untouched.

When I accept a replica for analytics: in the first year, for a handful of internal reports with a `statement_timeout`, on a replica dedicated to reporting (never the one the application reads from), with a date on the calendar to replace it. [Database Performance](/docs/database/performance#read-replicas) covers replicas as a scaling tool for the application, which is what they are good at.

## What Crosses the Boundary: Snapshots or Events

Data reaches the analytics side in two forms, and a mature platform uses both on purpose.

**Database snapshots and CDC** copy the tables. Change data capture reads the database's log, so the warehouse gets every insert, update and delete in commit order, at almost no cost to the primary ([Change Data Capture](/docs/architecture/data-pipelines#change-data-capture)). Netflix built its own framework, DBLog, to capture both the log and a table's full state in resumable chunks, with an approach that "does not use locks and has minimum impact on the source" ([Netflix: DBLog](https://arxiv.org/abs/2010.12597)). CDC is complete and cheap to start, because the application changes nothing. Its weakness is that it ships your internal model: column names, status enums, the join table you meant to drop next quarter.

**Service-owned analytical events** are facts the service decides to publish: `order.completed`, `match.ended`, `visit.completed`, `transfer.settled`. They carry business meaning the tables don't (why a visit was skipped, which matchmaking rule placed a player), they survive a schema refactor, and their shape is a promise. Their weakness is that someone has to design, publish and maintain each one, and a fact nobody thought to publish is missing forever.

My default:

- **CDC for a team's own analytics** and for the long tail of tables nobody has designed events for. It is the safety net that makes "we didn't publish that" recoverable.
- **Published events for anything another team depends on**, using the same envelope, outbox and schema rules as any other [event](/docs/architecture/events): CloudEvents attributes, UUID v7 IDs, additive evolution.
- **Server-side events for anything that touches money or fairness.** A purchase, a payout, a penalty and a match result are recorded by the backend; client events are for behavior.

An analytical event is an ordinary domain event with enough context to be understood without a join back to production:

```http
POST /events HTTP/1.1
ce-specversion: 1.0
ce-id: 019a1f40-6c2e-7d11-8a3b-5e6f7a8b9c0d
ce-source: /matches
ce-type: match.ended
ce-subject: 019a1f3b-0d4e-7a90-b1c2-d3e4f5a6b7c8
ce-time: 2026-10-26T19:42:07Z
Content-Type: application/json

{
  "id": "019a1f3b-0d4e-7a90-b1c2-d3e4f5a6b7c8",
  "tenant_id": "0199e2c4-1a2b-7c3d-8e4f-5a6b7c8d9e0f",
  "mode": "ranked_5v5",
  "region": "eu-west",
  "started_at": "2026-10-26T19:08:31Z",
  "ended_at": "2026-10-26T19:42:07Z",
  "winning_team": "blue",
  "is_abandoned": false,
  "rating_model_version": "glicko2-2026-09"
}
```

The same shape works for a SaaS `subscription.renewed`, a marketplace `order.completed` or a field service `visit.completed`. Note what it leaves out: no player names, no chat, no IP addresses. Identity travels as an opaque ID.

## The Boundary Is a Security Boundary

The warehouse usually ends up as the most complete copy of customer data in the company, read by the most people, with the weakest controls. [Privacy and Retention](/docs/architecture/data-pipelines#privacy-and-retention) covers minimizing at ingestion and erasure; the boundary adds access design.

- **Least privilege by layer.** Raw and staging are readable by the pipeline's service account and the data engineers who maintain it. Marts are readable by analysts. Nobody outside the data team reads raw. It's the same deny-by-default model as [Authorization](/docs/security/authorization), applied to schemas.
- **Personal fields are classified and protected at the column.** BigQuery attaches policy tags to columns, and a user needs the Fine-Grained Reader role on the tag in addition to dataset access, so `SELECT *` fails on the restricted columns rather than leaking them; masking can substitute null, default or hashed values ([Google Cloud: Column-level access control](https://docs.cloud.google.com/bigquery/docs/column-level-security-intro)). Snowflake's masking policies "selectively mask plain-text data in table and view columns at query time" depending on the role ([Snowflake: Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro)). Use whichever your platform has; the point is that the default view of a person is masked.
- **Tokenize join keys you don't need to read.** An email used only to join two sources becomes a keyed hash before it lands. Card data never crosses the boundary in any form ([Sensitive Data](/docs/payments/sensitive-data)).
- **Tenant isolation survives the copy.** In a multi-tenant SaaS product, the warehouse holds every tenant's data side by side, and a customer-facing report built on it needs the same `tenant_id` scoping as the product ([Multi-Tenancy](/docs/architecture/multi-tenancy)).
- **Machines get their own identities.** BI tools, notebooks and reverse ETL syncs each use a service account scoped to what they read, never a shared analyst login, so an access review can say who reads what.
- **Reviewed on a schedule.** Grants are code, reviewed like code, and re-certified quarterly. Access that nobody can justify is removed.

A minimal version in SQL, for warehouses that use roles:

```sql
CREATE ROLE pipeline_writer;   -- the ingestion and transformation service account
CREATE ROLE analyst_reader;    -- people and BI tools

GRANT USAGE ON SCHEMA raw, staging, marts TO pipeline_writer;
GRANT ALL ON ALL TABLES IN SCHEMA raw, staging, marts TO pipeline_writer;

GRANT USAGE ON SCHEMA marts TO analyst_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA marts TO analyst_reader;
-- No grant on raw or staging: analysts read modeled, masked data only.
```

[Data Governance & Access](/docs/data/data-governance) goes further into catalogs, lineage and approval workflows. [GDPR & Privacy](/docs/compliance/gdpr) covers the legal duties these controls serve.

## Data Contracts Between Product and Data Teams

The pipeline failures that cost the most start upstream: a product team shipped a change that was correct for the product and broke something they didn't know existed. [Data Contracts](/docs/architecture/data-pipelines#data-contracts) defines the contract; what follows is how to run one between two teams.

A contract names its producer, its consumers, its schema, its meaning, its freshness and its change policy. The Open Data Contract Standard gives a YAML shape for it, with sections for fundamentals, schema, data quality, team, roles and a service-level agreement among others ([ODCS](https://bitol-io.github.io/open-data-contract-standard/latest/)). The format matters less than three habits:

- **The producer owns it and enforces it in CI.** The contract file lives in the producing service's repository. A migration that drops or retypes a contracted column fails that service's build, the same way breaking an API test would.
- **Consumers register.** A contract lists who reads it, so the producer knows whom to tell. Unregistered consumers get no promises, which is the incentive to register.
- **Breaking changes follow the event rules.** Additive changes are free. A rename or a meaning change is a new version, published alongside the old one through a migration window, exactly as [Schema Evolution](/docs/architecture/events#schema-evolution) handles event types.

A trimmed example, for a field service platform's visits:

```yaml
apiVersion: v3.2.0
kind: DataContract
id: 019a1f52-3c4d-7e5f-9a0b-1c2d3e4f5a6b
name: visits
version: 2.1.0
status: active
domain: scheduling
schema:
  - name: visits
    logicalType: object
    properties:
      - name: id
        logicalType: string
        required: true
        description: UUID v7, stable for the life of the visit.
      - name: status
        logicalType: string
        required: true
        description: One of scheduled, completed, not_completed, cancelled.
      - name: completed_at
        logicalType: timestamp
        description: Set when the technician closes the visit, UTC.
slaProperties:
  - id: visits_latency
    property: latency
    value: 1
    unit: d
    element: visits.completed_at
```

For a small company, the contract can be a reviewed list of the tables and events analytics depends on, with an owner per row. What matters is that a product engineer about to rename a column can find out, before merging, that a commission run reads it.

## Feeding Analytics Back into Production

Sooner or later, analytics produces something the product wants: a churn risk for the support queue, a lead score for sales, a recommended bundle in a game's store, a fraud feature for a payment decision, a predicted job duration for a scheduler. The boundary has to be crossed in the other direction, and this is where teams quietly undo everything above by letting the product query the warehouse.

**Reverse ETL** is the name for syncing modeled warehouse data into operational tools: Hightouch defines its pieces as a source (the warehouse), a model (the query), a sync (how and when data lands) and a destination (a CRM, ad platform or support desk) ([Hightouch: Core concepts](https://hightouch.com/docs/getting-started/concepts)). Into SaaS tools, that's fine and usually worth buying. Into your own product, I hold it to the rules of any other dependency:

- **Never a synchronous read.** A user request never waits on the warehouse. Warehouses are built for throughput, not for a p99 inside a checkout, and they go down for maintenance on their own schedule.
- **Publish through an owned interface.** The analytics side writes its output to a table or topic the product owns (`customer_scores`, `player_offers`), or calls the product's API. The product never reaches into a mart.
- **Validate before applying.** A job that produces scores also checks them: row counts, null rates, value ranges against yesterday. A model that suddenly scores every customer at zero should fail its own publish, not page support.
- **Upsert idempotently, with a version and a timestamp.** Every row carries `scored_at` and a `model_version`, and the product treats an old score as absent rather than true.
- **Degrade to a default.** When the score is stale or missing, the product behaves as if the feature were off: no recommendation, the standard queue order, the rule-based fraud check. Analytics outages should cost relevance, never availability.
- **Keep a kill switch.** Each sync can be turned off from configuration without a deploy ([Feature Flags](/docs/delivery/feature-flags)).
- **Watch for loops.** A score that changes what customers see changes the data that trains the next score. Record what the product did with each score, so analysis can tell the model's effect from the world's.

When the product needs features at request time with low latency (a fraud decision, a matchmaking input), batch reverse ETL is the wrong tool; that is an online feature store or a stream, covered in [Data Science & ML Platforms](/docs/data/data-science-platforms) and [Streaming & Event Processing](/docs/data/streaming).

## The Boundary, as a Checklist

- No human or BI tool has credentials to a production primary; production reads for incidents go through audited support access.
- Any replica used for reporting is dedicated, has a statement timeout and a replacement date.
- CDC covers the long tail; published events cover anything another team depends on, with schemas and an outbox.
- Raw and staging are readable only by the pipeline; analysts read masked marts; machines have their own scoped identities.
- Personal fields are classified, masked by default and tokenized where only a join is needed; card data never crosses.
- Every table or event analytics depends on has a contract, an owner and a CI check in the producer.
- Analytics outputs return through an owned table, topic or API, validated, versioned, timestamped and safe to ignore when stale.

## References

**Reference**

- [PostgreSQL: Hot Standby](https://www.postgresql.org/docs/current/hot-standby.html), query conflicts on a standby, cancellation after the delay setting, and the bloat cost of `hot_standby_feedback`
- [PostgreSQL: Replication settings](https://www.postgresql.org/docs/current/runtime-config-replication.html), `max_standby_streaming_delay` defaults to 30 seconds and `hot_standby_feedback` to off
- [Google Cloud: Column-level access control](https://docs.cloud.google.com/bigquery/docs/column-level-security-intro), policy tags, the Fine-Grained Reader role and dynamic masking in BigQuery
- [Snowflake: Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro), masking policies applied at query time by role
- [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/latest/), a YAML structure for data contracts with schema, quality, team, roles and SLA sections
- [Hightouch: Core concepts](https://hightouch.com/docs/getting-started/concepts), sources, models, syncs and destinations in reverse ETL

**In practice**

- [Uber: Uber's Big Data Platform](https://www.uber.com/blog/uber-big-data-platform/), from querying a few OLTP databases one by one to a warehouse, a Hadoop lake and Hudi (2018)
- [Netflix: DBLog, a Generic Change-Data-Capture Framework](https://arxiv.org/abs/2010.12597), log events interleaved with chunked full-state reads, without locks
