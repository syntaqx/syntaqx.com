+++
title = "Data Governance & Access"
description = "Knowing what data you hold and who can see it: owners, catalogs and lineage, PII tags, masking and row-level security, quality contracts, erasure and cost."
category = "Data Platforms"
order = 1278
tags = ["data", "governance", "privacy", "access-control", "data-quality"]
+++

The warehouse tends to become the most complete copy of customer data in the company and the least protected one. Production systems have authorization in every endpoint, audit trails and a security review for each feature. The warehouse has a few hundred tables loaded by a dozen pipelines, a role called `analyst` that can read all of them, and a dashboard someone shared with a vendor two years ago.

Data governance is the set of habits that fixes this. Not a committee or a policy binder: knowing what data you hold, who owns it, who can see which parts of it, whether it's right, how long you keep it, and what it costs. Every one of those is enforceable in code, and the parts that aren't in code drift.

## Ownership Comes First

Every dataset has an owning team: the one that answers when it's late or wrong, approves changes to its definition, and decides who may read it. [Data Pipelines](/docs/architecture/data-pipelines#data-contracts) makes the producer the owner of what it publishes; the same rule applies to every mart and model downstream.

- **Owners are teams, not people,** recorded in the model's metadata next to its code, the same way [Code Ownership](/docs/engineering/code-ownership) assigns code. A dataset owned by someone who left is owned by nobody.
- **Ownership includes classification and access.** The owner tags the sensitive columns and approves who reads them; the platform team enforces the decision but doesn't make it.
- **Unowned data is deleted.** A table with no owner, no reader in ninety days and no documented purpose goes to an archive with an expiry, then away. Orphan tables are where retention and cost problems hide.

## Catalogs and Lineage

A catalog answers "what do we have, what does it mean, and who owns it?"; lineage answers "where did this come from, and what breaks if it changes?" Both are worthless if they're maintained by hand, because they're wrong within a month. They should be by-products of the code and the query logs.

- **DataHub** is an open-source catalog that searches "dashboards, datasets, ML models, and raw files," tracks lineage, and lets you "define ownership and track PII," with assertions and data contracts for quality ([DataHub: Features](https://docs.datahub.com/docs/features)).
- **Unity Catalog** on Databricks "captures lineage automatically for queries run on Databricks, down to the column level"; its lineage system tables keep "a rolling 1-year window," while lineage in Catalog Explorer is retained indefinitely ([Databricks: Data lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage)).
- **OpenLineage** is "an open framework for data lineage collection and analysis," a specification built on a model of datasets, jobs and runs, extended by facets, with integrations for Airflow, Spark, Flink, dbt and Trino; it is an LF AI & Data Foundation graduate project ([OpenLineage](https://openlineage.io/docs/)).

I pick a catalog by what it can harvest automatically from the stack you already run, and I make OpenLineage support a requirement for anything new in the pipeline, so lineage doesn't depend on one vendor's view. Documentation lives in the model's YAML next to its SQL, reviewed in the same pull request, and the catalog reads it from there.

Column-level lineage is what makes the rest of this chapter possible: it tells you which marts contain a column derived from `email`, which dashboards an erasure touches, and which models break when a source drops a field.

## Classifying Personal Data

You can't protect what you haven't labeled. Every column that reaches the warehouse gets a classification, and the classification drives masking, access and retention automatically.

My classes, coarse on purpose:

| Class | Examples | Default treatment |
| --- | --- | --- |
| Public | Product catalog, published prices | Readable by all data users |
| Internal | Order totals, plan, usage counts, pseudonymous IDs | Readable by all data users |
| Personal | Name, email, phone, address, IP address, device ID | Masked by default; unmasked for an approved purpose |
| Sensitive | Health, precise location history, government IDs, children's data, payroll | Excluded from the warehouse where possible; otherwise restricted role, logged reads |
| Prohibited | Card numbers, CVV, passwords, secrets | Never loaded ([Sensitive Data](/docs/payments/sensitive-data)) |

Warehouses help with discovery. Snowflake's classification assigns each column a semantic category ("the type of personal attribute") and a privacy category of `IDENTIFIER`, `QUASI_IDENTIFIER` or `SENSITIVE`, stored as system tags, and can classify a database automatically ([Snowflake: Sensitive data classification](https://docs.snowflake.com/en/user-guide/classify-intro)). Quasi-identifiers deserve the attention: a postcode, a birth date and a gender are each harmless and together often identify a person.

Treat automatic classification as a detector, not the decision. The owner confirms the class in the model's metadata, and CI fails a pull request that adds a column to a mart without one. That single check keeps classification complete as models multiply.

## Access Control

The models are the same as in the application ([Authorization](/docs/security/authorization#choosing-a-model)): roles for coarse access, attributes for rules that depend on the data. In a warehouse, they map to grants, tags, masks and row filters.

**Roles by job, granted to groups.** `finance_analyst`, `product_analyst`, `data_scientist`, `support_lead`, each a group in the identity provider, granted read on the schemas its job needs. People get access by joining a group, and lose it by leaving one, which is what makes the quarterly access review short. Service accounts for pipelines and BI tools are users too: least privilege, owned, and rotated.

**Tag-based policies over per-table grants.** With hundreds of tables, per-table rules drift. Attach policies to classifications instead: every column tagged `personal` is masked for every role without the `personal_reader` attribute, in every table, including ones created tomorrow. Unity Catalog recommends exactly this for consistency: ABAC policies that "attach at the catalog or schema level and apply automatically based on governed tags" ([Databricks: Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)).

**Column masking at query time.** Snowflake's Dynamic Data Masking applies masking policies "to selectively mask plain-text data in table and view columns at query time," so the stored data is unchanged and what each role sees depends on the policy ([Snowflake: Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro)). BigQuery's masking "builds on top of column-level access control" and offers rules including a SHA-256 hash, which still lets masked users join on the column, nullify and a type-appropriate default ([BigQuery: Data masking](https://docs.cloud.google.com/bigquery/docs/column-data-masking-intro)). Hashing for joins is the rule I use most: an analyst can count distinct customers and join orders to tickets without ever seeing an email address. Use a keyed hash or a tokenized ID for low-entropy values like phone numbers, which an unsalted hash doesn't protect.

**Row-level security for tenants and territories.** BigQuery's row access policies give a `grantee_list` a `filter_expression` that "functions like a `WHERE` clause," and principals outside the list "cannot see any rows" ([BigQuery: Row-level security](https://docs.cloud.google.com/bigquery/docs/row-level-security-intro)); Unity Catalog's row filters do the same with a SQL function evaluated per row. Use them where the warehouse is shared across a boundary that matters: a customer-facing analytics feature that reads per-tenant data ([Multi-Tenancy](/docs/architecture/multi-tenancy#enforce-it-in-the-database)), a franchise network where each franchisee sees its own locations, a regional team that may only see its own region's customers.

**Exceptions are time-boxed and logged.** An unmasked read of personal data for an investigation, a fraud review or a data subject request is granted for a reason and a period, approved by someone else, and its queries are kept in the audit log, the same rules as [Support Access](/docs/security/support-access#time-boxed-sessions). Exports and shares to vendors go through the same approval, with an owner and an expiry.

## Quality: Tests and Contracts

Governance includes knowing whether the data is right. Three tools cover different layers, and most teams need the first two:

- **dbt data tests** validate content after a model builds; they "return a set of failing records," and zero rows passes. Severity can be `warn` or `error`, with thresholds, and `store_failures` writes failing rows to a table for investigation ([dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests)).
- **dbt model contracts** validate shape before a model builds: with `enforced: true`, every column's name and type must be declared, and dbt runs a preflight check so a model that doesn't match "does not build" ([dbt: Model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts)).
- **Great Expectations (GX)** defines an Expectation as "a verifiable assertion about data" and runs suites of them in Checkpoints, "the primary means for validating data in a production deployment" ([GX: Expectation](https://docs.greatexpectations.io/docs/reference/learn/terms/expectation)). It fits checks outside a dbt project: files landing in a lake, a feature table before training, data received from a partner.

Where each belongs: contracts on every model another team, a semantic layer or an export depends on, so a breaking change fails the producer's build; tests on every model for keys, grain and domains ([Modeling Analytical Data](/docs/data/data-modeling#testing-models)); expectations at the edges where data enters from outside. Failing tests block publication of the affected models, and the result is visible in the catalog, so a reader can see that a table is stale or failing before they quote it in a board deck.

## Retention and Deletion Through the Warehouse

Retention schedules and erasure ([Data Retention](/docs/architecture/data-retention)) apply to every copy, and the warehouse holds several copies of each row: raw, staging, marts, snapshots, exports, feature tables and the stream that fed them. An erasure request under [GDPR](/docs/compliance/gdpr#data-subject-rights) has one month to complete ([GDPR Article 12](https://gdpr-info.eu/art-12-gdpr/)), and the warehouse is where it usually fails.

- **Pseudonymize at ingestion.** Keep identifying fields in as few tables as possible (one `dim_customers`, one identity table) and use IDs everywhere else, so an erasure is a delete in a few places and facts can stay.
- **Erasure runs as a pipeline.** The request arrives as an event, a purge model deletes or scrubs the subject's rows in raw and every table the lineage graph says contains their identifying columns, and the run reports completion per table. Type 2 dimensions and snapshots are included: history is a copy.
- **Rebuilds must not resurrect.** If raw is the source for rebuilds, the purge has to reach raw, or the next full refresh brings the data back. Keep an erasure log of subject IDs and filter against it in staging, the warehouse version of replaying erasures after a backup restore.
- **Know your platform's undelete windows.** Deleted data stays recoverable for a while, by design. BigQuery's time travel "covers the past seven days by default" (configurable from two to seven), and afterwards deleted data is "retained for an additional seven days" in fail-safe ([BigQuery: Time travel](https://docs.cloud.google.com/bigquery/docs/time-travel)). Delta Lake never deletes data files automatically; `VACUUM` removes them, by default once they've been deleted for seven days ([Delta Lake: Table batch reads and writes](https://docs.delta.io/latest/delta-batch.html)). Your completion date is the purge plus these windows, and it has to fit inside the deadline.

![Plan view of one erasure request on a timeline in days. A purge phase P1 of 2 days (illustrative) covers source, raw, staging, marts and snapshots, followed by BigQuery's time travel window T1 of 7 days and its fail-safe T2 of 7 days, hatched. The highlighted total E1 = P1 + T1 + T2 = 16 days marks when no warehouse copy is recoverable, inside the GDPR response deadline M1 of one month, drawn as 30 days. A table defines P1, T1, T2, E1 and M1, and notes say that Delta Lake keeps deleted files until VACUUM and that backups, exports, streams and vendors have their own clocks.](/diagrams/dp-data-governance-erasure.svg "A delete in the warehouse isn't gone until the platform's recovery windows pass. Purge time plus time travel plus fail-safe has to fit inside the response deadline, with room for everything outside the warehouse.")

Retention windows run the same way: tables partitioned by event date, with partition expiry set from the retention schedule, so expiring old data is a configuration, not a project. Raw has retention too; "keep everything for rebuilds" is a choice with a documented window, not a default.

## Cost Governance

Warehouse cost is governance because it has the same failure shape: nobody owns it until it's a problem. The practice is in [Cost & FinOps](/docs/operations/cost-and-finops); the warehouse-specific controls are:

- **Every query is attributable.** Each person, pipeline and BI tool runs as its own identity with labels for team and purpose, so the bill can be split by owner and the top spenders have names.
- **Brakes before bills.** BigQuery can cap the bytes a query may bill and set custom daily quotas on the data processed ([BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). Snowflake resource monitors set a credit quota per interval, with actions to notify, suspend after running statements finish, or suspend immediately and cancel them; they cover warehouses only, not serverless features ([Snowflake: Resource monitors](https://docs.snowflake.com/en/user-guide/resource-monitors)).
- **Storage has owners and expiries.** Unused tables, abandoned sandboxes, duplicate extracts and long time travel settings all cost money every month. The orphan rule in [Ownership](#ownership-comes-first) is also a cost control.
- **Expensive models are reviewed like expensive services.** A model that scans the whole history every hour gets the same scrutiny as an oversized cluster: incremental builds, partition pruning, or a slower schedule.

## Checklist

- Does every dataset have an owning team recorded next to its code, and are orphan tables expired?
- Are catalog entries and lineage harvested automatically, down to the column?
- Does every column in a mart carry a classification, with CI failing on new unclassified columns?
- Is access granted to groups by job, with tag-based masking for personal data and row filters where tenants or territories share tables?
- Are unmasked reads and vendor shares time-boxed, approved by someone else and logged?
- Do contracts guard every shared model, tests guard keys and grain, and expectations guard data entering from outside?
- Does erasure run as a pipeline that reaches raw, snapshots and derived tables, and does purge time plus the platform's recovery windows fit inside the deadline?
- Is every query attributable to an owner, with byte caps, quotas or resource monitors in place?

## References

**Reference**

- [OpenLineage](https://openlineage.io/docs/), an open standard for lineage with dataset, job and run entities, facets and integrations
- [DataHub: Features](https://docs.datahub.com/docs/features), search, lineage, ownership, PII tracking, assertions and data contracts
- [Databricks: Data lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage), automatic column-level lineage in Unity Catalog and how long it's retained
- [Databricks: Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters), query-time row and column controls and ABAC policies on governed tags
- [Snowflake: Sensitive data classification](https://docs.snowflake.com/en/user-guide/classify-intro), semantic and privacy categories as system tags, and automatic classification
- [Snowflake: Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro), masking policies applied at query time
- [Snowflake: Resource monitors](https://docs.snowflake.com/en/user-guide/resource-monitors), credit quotas and notify or suspend actions for warehouses
- [BigQuery: Data masking](https://docs.cloud.google.com/bigquery/docs/column-data-masking-intro), policy tags, SHA-256, nullify and default masking rules on top of column-level access control
- [BigQuery: Row-level security](https://docs.cloud.google.com/bigquery/docs/row-level-security-intro), row access policies with grantee lists and filter expressions
- [BigQuery: Time travel](https://docs.cloud.google.com/bigquery/docs/time-travel), a two-to-seven-day time travel window and a seven-day fail-safe
- [BigQuery: Controlling costs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs), maximum bytes billed and custom daily quotas
- [Delta Lake: Table batch reads and writes](https://docs.delta.io/latest/delta-batch.html), data files removed only by `VACUUM`, and the retention settings for history and deleted files
- [dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests), tests as failing rows, severity and stored failures
- [dbt: Model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts), enforced column names and types checked before building
- [Great Expectations: Expectation](https://docs.greatexpectations.io/docs/reference/learn/terms/expectation), expectations, checkpoints and validation results

**Regulation**

- [GDPR Article 12](https://gdpr-info.eu/art-12-gdpr/), responding to data subject requests within one month, extendable by two further months
