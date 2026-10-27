+++
title = "Warehouses, Lakes & Lakehouses"
description = "From Hadoop to cloud warehouses and open table formats: what Iceberg, Delta Lake and Hudi each provide, Parquet and ORC, and how I choose where data lives."
category = "Data Platforms"
order = 1272
tags = ["data", "warehouse", "lakehouse", "iceberg", "parquet"]
+++

Once analytics has its own side of the line ([Separating Production from Analytics](/docs/data/separating-production-and-analytics)), the next question is what that side is made of. The answer has changed three times in twenty years, and most companies still carry a layer from each era: a Hive metastore nobody wants to touch, a cloud warehouse where the analysts live, and a bucket of Parquet files someone calls the lake.

[Warehouse or Lakehouse](/docs/architecture/data-pipelines#warehouse-or-lakehouse) gives my short default: start with a managed warehouse, move toward open table formats for a concrete reason. This chapter is the long version: where each design came from, what it actually guarantees, and how I choose.

## The Hadoop Era

In 2004, Google described MapReduce: a programming model where users write a `map` and a `reduce` function and the runtime "automatically parallelized and executed" them on a large cluster of commodity machines, handling partitioning, scheduling and machine failure ([Google: MapReduce](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/)). Hadoop was the open-source answer, and for a decade it was what "big data" meant.

The stack had four parts:

- **HDFS**, the distributed file system. One NameNode holds the namespace and the block map, DataNodes hold the blocks (typically 128 MB), and each block is commonly replicated three times. Files are write-once-read-many, and the guiding principle is that "Moving Computation is Cheaper than Moving Data" ([Apache Hadoop: HDFS Architecture](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)).
- **MapReduce**, the execution model: jobs run on the machines holding the data, with every stage written back to disk.
- **YARN**, added later to "split up the functionalities of resource management and job scheduling/monitoring into separate daemons," so engines other than MapReduce could share the cluster ([Apache Hadoop: YARN](https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/YARN.html)).
- **Hive**, SQL over all of it, "reading, writing, and managing petabytes of data residing in distributed storage using SQL," with a metastore as "the central repository of metadata for Hive tables and partitions" ([Apache Hive](https://hive.apache.org/)).

Hadoop got the important things right. Storage was cheap enough to keep raw data, schemas could be applied on read, and the work went to the data. The Hive metastore outlived almost everything else and is still the catalog under many lakes.

### Why It Faded

Hadoop didn't lose to a better Hadoop. It lost because its central assumption, that compute and storage live on the same machines, stopped paying off.

- **Storage and compute grew together.** Adding disk meant adding servers, and adding servers meant adding disk. Riot Games, which said in December 2015 that it had collected 26 petabytes of player data since League of Legends launched in 2009, describes the moment in 2011 when "our existing data warehouse ran out of space," which led it to move the whole warehouse to AWS ([Riot Games: Moving Mountains of Data to AWS](https://www.riotgames.com/en/news/moving-mountains-data-aws)).
- **The NameNode is a ceiling.** It "keeps an image of the entire file system namespace and file Blockmap in memory," so the number of files, not their size, limits the cluster. Every team that wrote many small files hit it.
- **Batch was the only speed.** At Uber, the Hadoop-era lake made new data available "once every 24 hours, which was too slow to make real-time decisions," and the fixes (incremental ingestion, upserts on HDFS) became Apache Hudi ([Uber: Uber's Big Data Platform](https://www.uber.com/blog/uber-big-data-platform/)).
- **Operating it was a job.** A cluster needed a team for upgrades, capacity, security and tuning, before anyone answered a business question.

Object storage removed the reason to run HDFS, and the engines that came after Hadoop kept its good ideas without its hardware.

## Spark and the Query Engines

**Apache Spark** replaced MapReduce as the general-purpose engine. Its core idea, resilient distributed datasets, is "a distributed memory abstraction that lets programmers perform in-memory computations on large clusters in a fault-tolerant manner," and keeping data in memory between steps can "improve performance by an order of magnitude" for iterative work ([USENIX: Resilient Distributed Datasets](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/zaharia)). Today Spark is where batch transformation, large joins and machine learning feature pipelines run when SQL in a warehouse isn't enough ([Data Science & ML Platforms](/docs/data/data-science-platforms)).

**Presto**, created at Facebook in 2012 "to support low-latency interactive analytics" on its Hadoop warehouse, separated the query engine from storage entirely: it owns no data and reads whatever its connectors point at. The original creators' fork was renamed **Trino** at the end of 2020 after a trademark dispute ([Trino: We're rebranding PrestoSQL as Trino](https://trino.io/blog/2020/12/27/announcing-trino.html)). Trino and Presto are how many companies query a lake with SQL, and how they join a lake table to a production replica or a warehouse in one query.

Both are engines, not places. The data lives somewhere else, which is the idea the next two designs build on.

## Cloud Warehouses

The cloud warehouses took the warehouse (SQL, managed storage, a single product) and rebuilt it on the separation Hadoop never had.

- **Snowflake** has three layers: storage in "its internally optimized, compressed, columnar format," split into micro-partitions; compute in virtual warehouses, each "a cluster of compute resources" that runs independently of the others; and a cloud services layer for metadata, access control and optimization. It calls the design "a hybrid of traditional shared-disk and shared-nothing database architectures" ([Snowflake: Key concepts and architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts)).
- **BigQuery** stores each column separately and names "the separation of storage and compute" as one of its key features, which lets it "scale both storage and compute independently, based on demand" ([Google Cloud: BigQuery storage overview](https://docs.cloud.google.com/bigquery/docs/storage_overview)).
- **Redshift** started as a classic cluster (a leader node and compute nodes with local disks) and added managed storage: on RA3 and RG nodes you scale and pay "for compute and managed storage independently," with data offloaded to Amazon S3 as it grows past local SSDs ([AWS: Amazon Redshift provisioned clusters](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html)).

What separation buys is more than elasticity. Finance's month-end close runs on its own compute and doesn't slow the data scientists. A backfill gets a large cluster for an hour and gives it back. Nobody plans disk a year ahead. The cost is that compute is now a meter: one careless `SELECT *` on a wide table, or a dashboard that refreshes every minute, is a line on the bill. Budgets, per-team warehouses and query limits are part of running one ([Cost & FinOps](/docs/operations/cost-and-finops)).

## Lakes on Object Storage

A lake is files in object storage (Amazon S3, Google Cloud Storage, Azure Data Lake Storage) in an open format, read by whatever engine you like. Storage is the cheapest it will ever be, and no vendor owns the bytes.

A plain lake is also a directory of files pretending to be a table, and it breaks in predictable ways:

- **No transactions.** A job that fails halfway leaves half its files; a reader listing the directory mid-write sees a mix of old and new.
- **No safe updates or deletes.** Changing one row means rewriting files by hand, which is how an erasure request turns into a week of work ([Data Retention & Deletion](/docs/architecture/data-retention)).
- **Schema by convention.** Two writers disagree about a column's type, and the first reader to find out is a dashboard.
- **Listing is slow and partitioning is visible.** Queries have to know the directory layout (`dt=2026-10-26/`) to prune, and changing the layout means rewriting history.

Open table formats exist to fix exactly this list.

## Open Table Formats

A table format is a metadata layer over data files that turns a directory into a table with transactions, a schema and a history. The data stays in Parquet or ORC on object storage; the format defines how writers commit and how readers find a consistent snapshot. Because the specification is open, several engines (Spark, Trino, Flink, and increasingly the warehouses themselves) can read and write the same table. That is the lakehouse: warehouse guarantees on lake storage.

![Exploded axonometric of a lakehouse, five layers from bottom to top. 01 object storage: buckets of immutable files, cheap and durable. 02 data files: a columnar file format (Parquet or ORC), with statistics in each file. 03 table metadata: snapshots, manifests and schema, the table format's own files. 04 catalog: one pointer per table to its current metadata file, swapped atomically on commit. 05 engines: batch, SQL and stream engines (Spark, Trino, Flink) and warehouses reading the same tables. Phantom lines run through the stack's corners, and an arrow marks that a commit writes upward through the layers and becomes visible only at the catalog swap.](/diagrams/dp-warehouses-lakehouse-stack.svg "A lakehouse is layers, not a product. The data and metadata are open files; the catalog's atomic pointer swap is what makes a commit a transaction.")

The three formats solve the same problem with different emphases.

**Apache Iceberg** is defined by a written specification for "a large, slow-changing collection of files." Its goals include serializable isolation ("reads will be isolated from concurrent writes and always use a committed snapshot"), planning a scan in O(1) remote calls, and full schema and partition evolution ([Apache Iceberg: Table spec](https://iceberg.apache.org/spec/)). Every commit writes a new metadata file pointing at a tree of manifest lists and manifests, and "an atomic swap of one table metadata file for another provides the basis for serializable isolation." Columns are tracked by field ID, so renames and reorders don't break old files. Partitioning is derived from transforms on columns (hidden partitioning), so queries filter on `occurred_at` and the engine prunes. Format version 2 added row-level deletes through delete files; version 3 adds deletion vectors, row lineage and new types such as `variant` and `geography`.

```sql
CREATE TABLE lake.analytics.match_events (
  id           STRING,
  match_id     STRING,
  tenant_id    STRING,
  type         STRING,
  occurred_at  TIMESTAMP
)
USING iceberg
PARTITIONED BY (days(occurred_at), bucket(16, match_id));

-- A year later, the layout changes without rewriting history:
ALTER TABLE lake.analytics.match_events ADD PARTITION FIELD type;
```

The transforms (`days`, `bucket`) and partition evolution are from Iceberg's Spark DDL ([Apache Iceberg: Spark DDL](https://iceberg.apache.org/docs/latest/spark-ddl/)).

**Delta Lake** is defined by its transaction log protocol: each commit is a newline-delimited JSON file in `_delta_log`, applied atomically to the previous version, with periodic Parquet checkpoints holding the reconciled state. Its goals are serializable ACID writes with concurrent writers, snapshot isolation for readers, and self-describing tables with no separate metastore. Deletion vectors mark rows deleted without rewriting files, old versions support time travel, and removed files stay as tombstones until vacuum, with a default retention of 7 days ([Delta Lake: Transaction protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)).

**Apache Hudi** came from Uber's need for upserts and incremental reads on its lake. It offers two table types: Copy on Write, "optimized for read-heavy workloads," which rewrites files on update, and Merge on Read, which writes changes to log files merged at query time and "reduces write latency and supports near real-time data availability." A timeline of commits gives snapshot, time travel and incremental queries, including change records with before and after images ([Apache Hudi: Table types](https://hudi.apache.org/docs/table_types)).

| | Iceberg | Delta Lake | Hudi |
| --- | --- | --- | --- |
| Defined by | Table spec, format versions 1 to 3 | Transaction log protocol | Timeline and table types |
| Commit | Atomic swap of the metadata pointer in a catalog | New JSON commit in `_delta_log` | Completed instant on the timeline |
| Row-level change | Delete files (v2), deletion vectors (v3) | Deletion vectors | Copy on Write or Merge on Read |
| Strength | Engine neutrality, schema and partition evolution | Simplicity, tight Spark integration | Upserts and incremental pulls from streams |

My default is Iceberg, because its specification is the most engine-neutral and its catalog model fits a company with more than one engine. I pick Delta when the platform is Databricks and will stay so. I pick Hudi when the workload is mostly upserts from CDC streams and incremental consumers. All three are fine; mixing two without a reason is not.

## File Formats

Under every format above sits a columnar file.

- **Apache Parquet** is "an open source, column-oriented data file format designed for efficient data storage and retrieval." A file is split into row groups, each holding one column chunk per column, and the footer stores the location of every chunk so "readers are expected to first read the file metadata to find all the column chunks they are interested in" ([Apache Parquet: Overview](https://parquet.apache.org/docs/overview/), [File format](https://parquet.apache.org/docs/file-format/)).
- **Apache ORC** came out of Hive. Its body is split into self-contained stripes, "typically ~200MB," with indexes holding "the minimum and maximum values for each column in each set of 10,000 rows," so readers skip what can't match ([Apache ORC: Specification v1](https://orc.apache.org/specification/ORCv1/)).

Both give the two wins that matter: read only the columns a query names, and skip blocks whose statistics rule them out. I default to Parquet because nearly every engine reads it well; ORC is a reasonable choice inside a Hive-heavy estate. Either way, the practical rule is file size. Thousands of tiny files from a streaming job make every query pay for listing and opening them, so compaction into files of a few hundred megabytes is part of operating a lake, not an optimization.

## Choosing

The decision is less about technology than about how many engines and how much data you have.

- **One team, one engine, under a few terabytes:** a managed warehouse. A SaaS company's product analytics, a field service platform's operating metrics and a fintech's finance reporting all start here. The team's time goes to [modeling](/docs/data/data-modeling), not infrastructure.
- **High-volume raw events next to modeled data:** a lake for raw, a warehouse for marts. A game's client telemetry or a commerce site's clickstream lands as Parquet in an Iceberg table, cheap and replayable; the warehouse reads modeled tables built from it ([Telemetry](/books/gaming/telemetry) is one example).
- **Several engines on the same data:** a lakehouse with one catalog. When Spark trains models, Trino serves ad hoc SQL and a warehouse runs dashboards, an open table format lets them share one copy instead of three.
- **Strict retention and ownership requirements:** open formats, so you own the bytes and can prove deletion. A regulated fintech that must keep some records for years and erase others on request benefits from formats with real row-level deletes.
- **User-facing or sub-second queries:** neither; that is a [real-time analytical database](/docs/data/analytical-databases), fed from the same stream.

What I avoid: standing up a self-managed Hadoop cluster for new work, a lake without a table format, and a second warehouse bought because one team didn't like the first.

## A Checklist

- A managed warehouse until a named reason (volume, several engines, ownership, ML) justifies more.
- If there is a lake, every table in it has a table format and lives in one catalog.
- One table format per company, chosen for its engines; Iceberg unless the platform decides otherwise.
- Parquet by default, compacted into large files on a schedule.
- Partitioning hidden behind transforms, so layout can change without rewriting queries.
- Compute budgets, per-team warehouses or resource groups, and alerts on query cost.
- Deletes and erasure tested end to end, including old snapshots, tombstones and time travel windows.

## References

**Specifications**

- [Apache Iceberg: Table spec](https://iceberg.apache.org/spec/), snapshots, manifests, atomic metadata swaps, field IDs, hidden partitioning and format versions
- [Delta Lake: Transaction protocol](https://github.com/delta-io/delta/blob/master/PROTOCOL.md), the `_delta_log`, checkpoints, deletion vectors and vacuum retention
- [Apache Parquet: Overview](https://parquet.apache.org/docs/overview/) and [File format](https://parquet.apache.org/docs/file-format/), row groups, column chunks and footer metadata
- [Apache ORC: Specification v1](https://orc.apache.org/specification/ORCv1/), stripes and min/max indexes per 10,000 rows

**Reference**

- [Apache Hadoop: HDFS Architecture](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html), the NameNode, 128 MB blocks, replication and moving computation to data
- [Apache Hadoop: YARN](https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/YARN.html), resource management split from job scheduling
- [Apache Hive](https://hive.apache.org/), SQL over distributed storage and the Hive Metastore
- [Apache Hudi: Table types](https://hudi.apache.org/docs/table_types), Copy on Write, Merge on Read, the timeline and incremental queries
- [Apache Iceberg: Spark DDL](https://iceberg.apache.org/docs/latest/spark-ddl/), partition transforms and partition evolution
- [Snowflake: Key concepts and architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts), storage, virtual warehouses and cloud services
- [Google Cloud: BigQuery storage overview](https://docs.cloud.google.com/bigquery/docs/storage_overview), columnar storage and separate scaling of storage and compute
- [AWS: Amazon Redshift provisioned clusters](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html), leader and compute nodes, and managed storage on RA3 and RG

**Papers**

- [Google: MapReduce, Simplified Data Processing on Large Clusters](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/), Dean and Ghemawat, OSDI 2004
- [USENIX: Resilient Distributed Datasets](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/zaharia), the abstraction behind Spark, NSDI 2012

**In practice**

- [Riot Games: Moving Mountains of Data to AWS](https://www.riotgames.com/en/news/moving-mountains-data-aws), a warehouse that ran out of space in 2011 and moved to the cloud (2015)
- [Uber: Uber's Big Data Platform](https://www.uber.com/blog/uber-big-data-platform/), from a Hadoop lake with 24-hour latency to Hudi (2018)
- [Trino: We're rebranding PrestoSQL as Trino](https://trino.io/blog/2020/12/27/announcing-trino.html), Presto's origin at Facebook in 2012 and the 2020 rename
