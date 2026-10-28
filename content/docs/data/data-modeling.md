+++
title = "Modeling Analytical Data"
description = "Shaping warehouse data people can trust: grain, facts and dimensions, conformed dimensions, slowly changing history, dbt layers, semantic layers and tests."
category = "Data Platforms"
order = 1276
tags = ["data", "analytics", "data-modeling", "dbt", "warehouse"]
+++

[Data Pipelines & Analytics](/docs/architecture/data-pipelines) gets data into the warehouse and through raw, staging and marts, with tests and contracts. This chapter is about the shape of what you build there: which tables exist, what one row in each means, and how history and definitions are kept straight. A pipeline can be flawless and still produce marts nobody can use, because every analyst has to rediscover which join double-counts and which status column means "paid".

The model is the interface between data engineering and everyone else. A good one makes the common question a short query, makes the wrong query hard to write, and survives the next five product launches without a rewrite.

## Start From the Process and the Grain

Dimensional modeling, as Ralph Kimball's group describes it, starts from a business process (taking an order, completing a visit, capturing a payment, finishing a match) and asks what one row records. "Declaring the _grain_ is the pivotal step in a dimensional design" ([Kimball: Grain](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/)), and the grain is stated before any columns are chosen: "one row per order line", "one row per visit", "one row per player per day".

Kimball's guidance is to start at the atomic grain, the lowest level the process captures, because it answers questions nobody has thought of yet, and to give each grain its own table rather than mixing them. Both rules match my experience. A table at "one row per order, except bundles, which have one row per item" is a table every query gets wrong. A summary built first ("daily revenue by region") answers exactly the question it was built for and nothing else; build the order-line table, and the daily summary is one `GROUP BY` away.

My rule: **the grain is written in the model's description and enforced by a uniqueness test on the columns that define it.** If the test can't be written, the grain isn't known yet.

## Facts and Dimensions

A **fact table** holds the measurements of a process at its grain: amounts, quantities, durations, counts. A **dimension table** holds the context you filter and group by: the customer, the product, the merchant, the technician, the date, the game build. Facts are long and narrow and grow with activity; dimensions are wide and change slowly.

Kimball's catalog names three common kinds of fact table, and most marts are one of them ([Kimball: Dimensional modeling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)):

- **Transaction facts:** one row per event. An order line, a card authorization, a support ticket created, a purchase in a game store.
- **Periodic snapshots:** one row per entity per period. A SaaS account's seats and MRR at each month end, an inventory balance per warehouse per day, a player's activity per day.
- **Accumulating snapshots:** one row per instance of a process with milestones, updated as it moves. A loan application from submitted to funded, a work order from booked to completed, an order from placed to delivered.

```sql
-- One row per order line. The grain is (order_id, line_number); a test enforces it.
CREATE TABLE fct_order_lines (
  order_id         UUID NOT NULL,
  line_number      INTEGER NOT NULL,
  ordered_at       TIMESTAMPTZ NOT NULL,
  ordered_on       DATE NOT NULL,          -- business date, in the store's time zone
  customer_key     UUID NOT NULL,          -- the dim_customers version current at ordered_at
  product_key      UUID NOT NULL,
  store_id         UUID NOT NULL,
  quantity         INTEGER NOT NULL,
  net_amount       BIGINT NOT NULL,        -- minor units
  discount_amount  BIGINT NOT NULL DEFAULT 0,
  currency         CHAR(3) NOT NULL,
  is_test_order    BOOLEAN NOT NULL DEFAULT FALSE
);
```

The business date is assigned once, in the location's zone ([Time & Date Formats](/docs/fundamentals/time#business-dates-business-days-and-holidays)); money is integer minor units with its currency ([Money](/docs/payments/money)). Facts carry measures that add up: an amount sums across lines, days and stores. Ratios and averages are not stored as facts, because an average of averages is wrong; store the numerator and the denominator and compute the ratio at query time or in the [semantic layer](#semantic-layers).

## Conformed Dimensions

The value of a warehouse is joining processes: orders with support tickets, visits with invoices, matches with purchases. That only works if they share dimensions. Kimball's definition: "Dimension tables conform when attributes in separate dimension tables have the same column names and domain contents" ([Kimball: Conformed dimensions](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/conformed-dimension)). One `dim_customers`, one `dim_dates`, one `dim_products`, used by every fact that refers to a customer, a date or a product.

Two teams each building a customer table is how "customers in Germany" ends up meaning a billing address in one report and a shipping address in another. The tool Kimball uses to prevent it is the bus matrix: processes as rows, dimensions as columns, a mark where a process uses a dimension ([Kimball: Bus matrix](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-matrix)). I keep one in the repository next to the models. It's the cheapest architecture document there is, and it shows at a glance which dimension a new fact must reuse.

Identity is the hard part of conforming. A customer who signed up twice, a player with accounts on three platforms, a property known by two addresses: the conformed dimension carries the resolved identity, and the rules that resolved it are their own reviewed model ([Matching & Merging](/docs/architecture/record-linkage)).

## Slowly Changing Dimensions

A customer moves from the SMB segment to enterprise. A technician transfers branches. A product changes category. Should last year's revenue follow the customer into enterprise, or stay where it was earned? Both answers are legitimate; the model has to make the choice explicit.

- **Type 1: overwrite.** The dimension holds only the current value. Simple, and right for corrections (a misspelled name) and for attributes nobody reports history on. Every past fact now reports under the new value, and Kimball warns that aggregates built on the old value must be recomputed ([Kimball: Type 1](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-1/)).
- **Type 2: add a new row.** Kimball's definition: type 2 changes "add a new row in the dimension with the updated attribute values," with a new surrogate key used by facts, and at least an effective time, an expiration time and a current-row indicator ([Kimball: Type 2](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2)). Facts point at the version that was current when they happened, so last year's revenue stays in SMB.

```sql
-- One row per customer per version. customer_key is the surrogate; customer_id is the business key.
CREATE TABLE dim_customers (
  customer_key   UUID PRIMARY KEY,
  customer_id    UUID NOT NULL,
  segment        TEXT NOT NULL,           -- smb, mid_market, enterprise
  country        CHAR(2),
  valid_from_at  TIMESTAMPTZ NOT NULL,
  valid_to_at    TIMESTAMPTZ,             -- exclusive; null while current
  is_current     BOOLEAN NOT NULL
);
```

The columns follow [Effective Dating & History](/docs/database/temporal-data#one-naming-standard-range-columns): closed-open intervals, a null end for "current", no `9999-12-31` sentinels. When the source system already keeps effective-dated history, model from it; when it doesn't, you have to capture changes yourself. dbt snapshots do that: they "implement type-2 Slowly Changing Dimensions over mutable source tables," detecting changes with an `updated_at` column (the `timestamp` strategy) or by comparing columns (`check`), and hard deletes are ignored unless you configure `hard_deletes` ([dbt: Snapshots](https://docs.getdbt.com/docs/build/snapshots)). A snapshot only sees the states that existed when it ran, so changes between runs are lost; log-based capture from [CDC](/docs/architecture/data-pipelines#change-data-capture) sees every one.

My default is type 2 for anything a report groups by and a person can change (segment, plan, region, branch, owner, price tier), type 1 for everything else, and a written note per attribute saying which. Reports that need "as it is today" join on `is_current`; reports that need "as it was" join on the surrogate key in the fact.

## Star Schemas or Wide Tables

A star schema is facts in the middle, dimensions around them, joined on keys. In a columnar warehouse ([Warehouses, Lakes & Lakehouses](/docs/data/warehouses-and-lakes)), a wide denormalized table (the fact with its dimension attributes copied onto every row) is often faster to query and easier for a casual analyst. Both camps have a case, and the vendors say so:

- dbt's project guide recommends marts that are "wide and denormalized," because storage is cheap and compute is expensive, while adding that if you use the dbt Semantic Layer, you should "stay as normalized as possible to allow MetricFlow the most flexibility" ([dbt: Marts](https://docs.getdbt.com/best-practices/how-we-structure/4-marts)).
- BigQuery recommends nested and repeated fields to denormalize, but notes that "star schemas are typically optimized schemas for analytics" and that "performance might not be significantly different if you attempt to denormalize further" ([BigQuery: Nested and repeated fields](https://docs.cloud.google.com/bigquery/docs/best-practices-performance-nested)).

What I do: **the star is the model of record, and wide tables are built from it.** Facts and conformed dimensions are where definitions live and where type 2 history is kept. A wide table for a specific audience (a customer 360, a match summary for the balance team, a visit table for branch managers) is a mart built from the star, so its columns come from one place. A wide table with no star underneath copies dimension attributes at build time, and every copy is a place for a definition to drift.

## Layers in dbt

The layering in [Data Pipelines](/docs/architecture/data-pipelines#elt-not-etl) is raw, staging and marts. dbt's guide adds an intermediate layer and gives each a job ([dbt: How we structure our dbt projects](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview)):

- **Staging** creates "our atoms," one model per source table, named `stg_[source]__[entity]s`. Renaming, type casting, unit conversion and categorizing belong here; joins and aggregations don't, because changing the grain here loses source data you'll need later. dbt suggests views ([dbt: Staging](https://docs.getdbt.com/best-practices/how-we-structure/2-staging)).
- **Intermediate** models stack logic with "clear and specific purposes," named with verbs (`int_order_items_summed_to_orders`), and "should generally not be exposed in the main production schema"; ephemeral or views in a restricted schema ([dbt: Intermediate](https://docs.getdbt.com/best-practices/how-we-structure/3-intermediate)).
- **Marts** bring the pieces "into a wide, rich vision of the entities our organization cares about." Start as a view, make it a table when it's slow to query, and incremental when it's slow to build.

![Exploded axonometric drawing of an analytics project in five stacked layers, bottom to top: 01 raw, as loaded and append-only; 02 staging, one model per source table, renamed and typed; 03 intermediate, joins and reshaping with verb names; 04 marts, facts and conformed dimensions; 05 semantic layer, metrics with entities and dimensions. An arrow beside the stack shows that each layer builds only on the one beneath it. A table lists each layer's materialization and who reads it.](/diagrams/dp-data-modeling-layers.svg "Each layer reads only the layer below it. People and dashboards read marts or the semantic layer; raw and staging are for the pipeline.")

## Naming

Warehouse tables follow the same [Database Naming Conventions](/docs/database/naming-conventions) as the application database, because the same people read both: lowercase snake_case, `_id` for keys, `_at` for timestamps, `_on` for dates, `is_` for booleans, `_amount` with a `currency` column for money. Analytical models add a few of their own:

- **A prefix that says the layer and the kind:** `stg_`, `int_`, and in marts `fct_` for facts and `dim_` for dimensions. dbt's guide names marts by plain entity (`customers`, `orders`) and warns that department-named marts like `finance_orders` are an anti-pattern. I keep `fct_` and `dim_` where the marts are a star, because the prefix tells the reader whether to sum the table or join to it, and I agree about departments: two departments, one `orders`.
- **The grain is in the name** where it isn't obvious: `fct_order_lines`, `fct_player_days`, `fct_account_months`.
- **Surrogate keys end in `_key`,** business keys in `_id`, so nobody joins a type 2 dimension on the wrong one.
- **Metrics are not tables.** A mart named `revenue_per_day` is a metric with a time grain baked in; dbt's guide says the same. Rollups belong in the semantic layer.

## Data Vault, Briefly

Data Vault is another modeling pattern for "enterprise-scale analytics," built from hubs ("core business concepts"), links ("relationships between hubs") and satellites (descriptive attributes and their history) ([Databricks: Data Vault](https://www.databricks.com/glossary/data-vault)). Its strength is integration: dozens of source systems, each loaded into its own satellites without remodeling, with full history and an audit trail of where every value came from. Its cost is that nobody queries a vault directly; you still build dimensional marts on top.

I'd consider it for an organization with many overlapping source systems and strong audit requirements (a bank after several acquisitions, an insurer). For a product company with a handful of sources, the raw layer plus type 2 dimensions already provides history and auditability, and a vault is a layer of modeling with no reader.

## Semantic Layers

A [single definition per metric](/docs/architecture/data-pipelines#one-definition-per-metric) needs a home. A semantic layer is that home: metrics, the entities they join on and the dimensions they can be sliced by, declared once in code and compiled into SQL for every consumer.

- **dbt MetricFlow** "is a SQL query generation tool"; metrics and semantic models are declared in YAML, with entities ("the join keys of your semantic model") and dimensions ("the ways you want to group or slice/dice your metrics"). It's distributed under the Apache 2.0 license ([dbt: About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow)).
- **Cube** models "business entities" as cubes that "define measures, dimensions, and joins," exposes them through a Postgres-compatible SQL API and REST and GraphQL APIs, caches with pre-aggregations, and applies access control "at the semantic layer, so the same policies apply to every consumer" ([Cube: Introduction](https://docs.cube.dev/docs/introduction)).

```yaml
metrics:
  - name: net_revenue
    description: "Order-line net amount after discounts, excluding test orders. Owner: finance."
    type: simple
    agg: sum
    expr: net_amount
```

The semantic layer earns its place when more than one tool reads the same metric: a BI tool, a spreadsheet export, an in-product usage dashboard, a notebook. With one dashboard tool and five metrics, a mart per metric with its definition beside it is enough. Either way, the semantic layer reads from facts and dimensions, which is why dbt asks for normalized marts underneath it: the layer does the joins, so it needs the keys.

## Testing Models

Tests are how a model keeps its promises after the person who wrote it moves on. [Data Pipelines](/docs/architecture/data-pipelines#transformations-are-code) lists the baseline; for modeling, the tests that matter most are about grain and keys:

- **The grain is unique and complete.** A uniqueness test on the grain columns of every fact, and `not_null` on each. A failed uniqueness test is a join that fanned out, the most common silent error in analytics.
- **Every foreign key resolves.** A `relationships` test from each fact key to its dimension. For type 2 dimensions, test that exactly one row per business key has `is_current`, and that versions don't overlap.
- **Values are in their domain.** `accepted_values` on status and segment columns, so a new upstream status fails a test instead of falling into "other".
- **Totals reconcile.** A singular test that returns rows where the fact's daily total differs from the source system's ([dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests)), and one that the wide table's total equals the star's.
- **Shapes are contracts where others depend on them.** A model with `contract: {enforced: true}` must declare every column's name and type, and dbt checks them before building ([dbt: Model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts)). I enforce contracts on the marts the semantic layer, exports or other teams read; [Data Governance & Access](/docs/data/data-governance) covers how they fit with ownership.

## Checklist

- Does every fact table state its grain in its description, and is the grain enforced by a uniqueness test?
- Are facts at the atomic grain, with summaries built from them rather than instead of them?
- Are measures additive, with ratios computed from stored numerators and denominators?
- Is there one conformed dimension per shared entity, and a bus matrix that shows which facts use it?
- Is each dimension attribute marked type 1 or type 2, with type 2 history captured from a source that sees every change?
- Are wide tables built from the star, not instead of it?
- Do staging, intermediate and marts follow their jobs (no joins in staging, intermediate hidden from consumers)?
- Do names follow the database conventions, with the layer, kind and grain readable from the name?
- Do metrics live in one semantic layer or one documented model each, with owners?

## References

**Reference**

- [Kimball Group: Dimensional modeling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/), the catalog of techniques, including transaction, periodic snapshot and accumulating snapshot fact tables
- [Kimball Group: Grain](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/), declaring the grain first, atomic grain, one grain per table
- [Kimball Group: Conformed dimensions](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/conformed-dimension), shared column names and domain contents across facts
- [Kimball Group: Enterprise data warehouse bus matrix](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-matrix), processes against the dimensions they share
- [Kimball Group: Type 2, add new row](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2), new surrogate keys, effective and expiration times, current-row indicator
- [Kimball Group: Type 1, overwrite](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-1/), replacing the old value in place and recomputing affected aggregates
- [dbt: Snapshots](https://docs.getdbt.com/docs/build/snapshots), type 2 history over mutable sources, timestamp and check strategies, hard deletes
- [dbt: Model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts), enforced column names and types checked before a model builds
- [dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests), generic and singular tests that return failing rows
- [dbt: About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow), semantic models, entities, dimensions and metrics in YAML, Apache 2.0
- [Cube: Introduction](https://docs.cube.dev/docs/introduction), cubes with measures and dimensions, SQL, REST and GraphQL APIs, pre-aggregations and access control
- [BigQuery: Use nested and repeated fields](https://docs.cloud.google.com/bigquery/docs/best-practices-performance-nested), denormalizing with nested fields, and star schemas already optimized for analytics
- [Databricks: Data Vault](https://www.databricks.com/glossary/data-vault), hubs, links and satellites

**In practice**

- [dbt: How we structure our dbt projects](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview), staging, intermediate and marts as layers from source-conformed to business-conformed
- [dbt: Staging models](https://docs.getdbt.com/best-practices/how-we-structure/2-staging), naming, no joins or aggregations, views
- [dbt: Intermediate models](https://docs.getdbt.com/best-practices/how-we-structure/3-intermediate), verb names, hidden from end users, ephemeral or restricted views
- [dbt: Marts](https://docs.getdbt.com/best-practices/how-we-structure/4-marts), entity names, wide and denormalized, normalized under the Semantic Layer, view to table to incremental
