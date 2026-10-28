+++
title = "Managed Databases"
description = "RDS to Aurora's log-structured storage, DynamoDB, Spanner, Atlas and managed caches: how they work, how they meter, extended support fees and lock-in."
category = "Hosting & Cloud Industry"
order = 2134
part = "Managed Services"
tags = ["databases", "rds", "aurora", "dynamodb", "valkey", "pricing"]
+++

A managed database is a database engine that the provider installs, patches, backs up, replicates and fails over, sold by the hour and the gigabyte. The customer gets an endpoint and a set of knobs; the provider keeps the operating system, the storage layout, the replication topology and the 3 a.m. pages. It was the first managed service most clouds added after compute and storage, and it is still the stickiest: a virtual machine can be moved in an afternoon, but a database holds the company's state, and moving it means a migration with a cutover window.

The product has two halves that pull in different directions. One is a commodity: open-source engines (MySQL, PostgreSQL, MariaDB, Redis and its fork Valkey) run on rented machines with automation around them, where every provider competes on price and the customer can leave. The other is proprietary: storage engines the provider wrote itself (Aurora's shared log, DynamoDB, Spanner, Cosmos DB, Aurora DSQL) that speak a familiar protocol or none at all, outperform the commodity version, and can't be taken elsewhere. Most of what is interesting about this market is the line between the two, and the meters that sit on each side of it. This chapter covers the history from RDS to Aurora, how a managed relational database works, key-value and distributed SQL services, managed document databases and caches, the meters, extended support fees, migration and lock-in, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `databases`, `caches` and engine support windows. Serverless Postgres, branching and databases at the edge are the next chapter, [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases); the license fights over the engines are [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds).

The engineering rules for using a database live in the playbook: [Database Performance](/docs/database/performance) for plans, indexes, pooling and replicas, [Transactions & Concurrency](/docs/database/transactions-and-concurrency) for isolation, [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations) for schema changes, [Disaster Recovery](/docs/operations/disaster-recovery) for RPO, RTO and restores, and [Application Caching](/docs/architecture/application-caching) for when a cache earns its place. This chapter is the provider side.

## How the Providers Do It

| Provider | Open-source engines | Own engines | Cache | Notes, as of October 2026 |
| --- | --- | --- | --- | --- |
| **AWS** | RDS for PostgreSQL, MySQL, MariaDB; also SQL Server, Oracle, Db2 | Aurora (MySQL and PostgreSQL compatible), Aurora DSQL, DynamoDB | ElastiCache (Valkey, Redis, Memcached) | Paid Extended Support for engine versions past end of standard support |
| **Google Cloud** | Cloud SQL (MySQL, PostgreSQL, SQL Server) | Spanner, AlloyDB for PostgreSQL | Memorystore (Valkey, Redis, Memcached) | Memorystore for Valkey GA 18 Apr 2025 |
| **Azure** | Azure Database for PostgreSQL and for MySQL (Flexible Server), Managed Instance for Apache Cassandra | Azure SQL Database (incl. Hyperscale), Cosmos DB, Azure HorizonDB (preview, PostgreSQL-based), Azure DocumentDB (MongoDB-compatible) | Azure Managed Redis | Retired Single Server for MySQL (2024) and PostgreSQL (2025) |
| **MongoDB** | Its own engine, on AWS, Google Cloud and Azure | MongoDB Atlas | None | Atlas was 73% of MongoDB's revenue in fiscal 2026 |
| **Developer clouds and specialists** | DigitalOcean offers PostgreSQL, MySQL, MongoDB, Kafka, OpenSearch and Valkey; Aiven runs PostgreSQL, Kafka, OpenSearch and Valkey on AWS, Google Cloud, Azure and others | Rare | Managed Valkey | Aiven bills hourly plans with no separate HA charge |

Three patterns run through the table:

- **Every cloud runs the same open-source engines and competes on automation and price.** RDS, Cloud SQL and Azure's Flexible Server are the same idea: an engine on a VM with backups, patching, replicas and failover around it.
- **Every hyperscaler also sells an engine only it has.** Aurora, Spanner, AlloyDB, Cosmos DB and DynamoDB exist because the provider controls the storage layer underneath and can do things a VM with a disk can't. They are also where the lock-in is.
- **The database company competes with its own hosts.** MongoDB sells Atlas on all three hyperscalers while each of them sells a compatible or competing service, and its 10-K says plainly that the clouds "can bundle competing products."

## How Managed Databases Got Here

The history is a sequence of moves of the hard part from the customer to the provider.

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Oct 2007 | Amazon's Dynamo paper (SOSP) | A highly available key-value store for Amazon's own services | The operational burden stayed with each team running it |
| 26 Oct 2009 | Amazon RDS beta, MySQL 5.1 | Installing, patching and backing up MySQL on a VM | A per-instance price plus storage and a per-I/O charge |
| 17 May 2010 | RDS Multi-AZ | A hot standby in a second zone with synchronous replication and automatic failover | Double the instance and storage price |
| 22 Aug 2011 | ElastiCache (Memcached 1.4.5) | Running a cache fleet | Another per-node bill |
| 6 Oct 2011 | Google Cloud SQL limited preview, MySQL for App Engine | The same for Google's platform | App Engine only at first |
| 18 Jan 2012 | DynamoDB | Dynamo's design without Dynamo's operations: SSDs, synchronous replication across zones, provisioned throughput | A proprietary API and data model |
| 2012 | Spanner paper (OSDI) | Externally consistent transactions across the globe, using clock uncertainty | Google-internal until 2017 |
| 12 Nov 2014 | Aurora preview | Storage that grows by itself and survives a zone loss, with MySQL compatibility | A proprietary storage layer and an I/O meter |
| 28 Jun 2016 | MongoDB Atlas, on AWS first | MongoDB run by its maker | A second vendor on top of the cloud |
| 14 Feb 2017 | Cloud Spanner public beta | Spanner as a product, at "US$0.90 per node per hour" plus $0.30 per GB-month | A new SQL dialect and node-sized pricing |
| 28 Nov 2018 | DynamoDB on-demand | Pay per request instead of provisioning throughput | A higher unit price than well-used provisioned capacity |
| 21 Apr 2022 | Aurora Serverless v2 GA | Capacity that scales in 0.5-unit steps instead of instance sizes | A per-capacity-unit rate above the equivalent instance |
| 11 May 2022 | AlloyDB preview | PostgreSQL with disaggregated storage and a columnar accelerator, "no opaque I/O charges" | Google-only |
| 11 May 2023 | Aurora I/O-Optimized | Removing the per-I/O meter for I/O-heavy workloads | Higher compute and storage rates |
| 1 Mar 2024 | RDS Extended Support charges begin (MySQL 5.7) | Running an engine version past its community end of life | A per-vCPU-hour fee, doubling in year three |
| 20 Mar 2024 | Redis moves to source-available licenses | (Redis's revenue problem with the clouds) | Clouds switch to the Valkey fork |
| 27 May 2025 | Aurora DSQL GA | Serverless distributed SQL with multi-region active-active writes | Another proprietary engine and a new unit (DPUs) |

The 2009 RDS launch post set the vocabulary that every later service kept: a database instance class (the launch small instance was "db.m1.small" with 1.7 GB of memory at $0.11 an hour), storage at $0.10 per GB-month "plus $0.10 per million I/O requests," backup storage free up to the size of the provisioned storage, and point-in-time restore "to within the last five minutes." Jeff Barr pitched it as "a really nice complement to Amazon SimpleDB": relational for the workloads that needed it, key-value for the rest. Seventeen years later the split is the same, with better engines on each side.

## How a Managed Relational Database Works

A managed instance is a VM the customer can't log into, with an agent and a control plane around it. The provider's control plane owns:

- **Provisioning and the instance class.** The customer picks a class (vCPU and memory), storage type and size, engine and version, and a network placement. RDS storage runs from 20 GiB to 64 TiB on current storage types; partial instance hours "are billed in one-second increments with a 10-minute minimum charge."
- **Storage.** For RDS, Cloud SQL and Flexible Server, an attached network block volume per instance (gp3, io1 and similar), sized and sometimes provisioned for IOPS separately from the instance. Storage autoscaling grows the volume; shrinking it is usually a migration.
- **High availability.** Multi-AZ, as AWS introduced it in May 2010, keeps a hot standby in a second zone with synchronous replication and flips DNS to it on failure; the 2010 post put failover at "approximately about three minutes." Every provider has the same shape: a synchronous standby that serves no reads, a failover that is a DNS change, and connections that must reconnect. The standby is billed as a second instance with its own storage, which is why RDS Multi-AZ rates are double: in October 2026, a db.t4g.micro MySQL instance in US East (N. Virginia) is $0.016 an hour Single-AZ and $0.032 Multi-AZ, and gp3 storage $0.115 against $0.23 per GB-month.
- **Read replicas.** Asynchronous copies for read scaling, each a separately billed instance, with replica lag the customer has to handle ([Read Replicas](/docs/database/performance#read-replicas)).
- **Backups and point-in-time recovery.** A daily snapshot plus continuously shipped transaction logs, so the provider can restore to any second in the retention window. The restore creates a new instance, never an overwrite: the customer's runbook has to repoint the application ([Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter)).
- **Maintenance windows.** Minor-version patches and OS updates applied in a weekly window the customer picks, with a failover to the standby if Multi-AZ, and a forced application when the provider decides a patch is mandatory.
- **Stopped is not free.** While an RDS instance is stopped, "you are charged for provisioned storage (including Provisioned IOPS)" and for backup storage, though not for instance hours; and "if you don't manually start your DB instance after it is stopped for seven consecutive days, RDS automatically starts your DB instance for you," a detail that catches customers who stop a database to save money and find it running, and billing, again.

The general rules for pooling, replicas and failover-aware clients are the playbook's ([Connections and Pooling](/docs/database/performance#connections-and-pooling)); what the provider adds is that every one of these features is a line on the bill.

## Aurora: The Log Is the Database

Aurora is the design that every later "cloud-native" relational database answers to, so it is worth knowing in detail. The SIGMOD 2017 paper (Verbitski et al.) starts from a claim about where the bottleneck went: in a cloud database it "has moved from compute and storage to the network." A conventional MySQL with a mirrored standby writes data pages, redo log, binlog and double-write buffers, each replicated, so one transaction becomes many network writes. Aurora's answer is to push "redo processing to a multi-tenant scale-out storage service, purpose-built for Aurora."

How it works, in the paper's terms:

- **Only the log crosses the network.** Section 3 is titled "THE LOG IS THE DATABASE": "the only writes that cross the network are redo log records. No pages are ever written from the database tier." Storage nodes apply redo records to produce pages in the background and on demand.
- **Quorums sized for a zone plus one.** Each data item is replicated "6 ways across 3 AZs with 2 copies of each item in each AZ," with "a write quorum of 4/6 (Vw = 4), and a read quorum of 3/6 (Vr = 3)." The design can "lose a single AZ and one additional node ... without losing read availability" and lose any two nodes, including a whole zone, while keeping writes.
- **Small segments, fast repair.** The volume is split into "small fixed size segments, currently 10GB in size," each replicated six ways into a **protection group**; "a 10GB segment can be repaired in 10 seconds on a 10Gbps network link," which is what makes the quorum math hold in practice: the window during which a second failure could hit the same segment is short.
- **Replicas share storage.** Read replicas read the same volume rather than replaying a copy, so failover to one loses nothing and crash recovery doesn't replay a log at startup.
- **The result, as measured by AWS.** Against mirrored MySQL on a write-only SysBench run, Aurora did "35 times more transactions" with "7.7 times fewer" I/Os per transaction on the database node. These are the vendor's own benchmarks.

What it cost the customer is in the meters. Aurora launched with storage that "grows in 10 GB increments up to 64 TB" and "you pay only for the storage that you use," and with a per-I/O charge, because I/O against shared storage is the provider's real marginal cost. In October 2026 Aurora Standard storage is $0.10 per GB-month plus $0.20 per million I/O requests in N. Virginia. On 11 May 2023 AWS added **I/O-Optimized**, a cluster configuration with no I/O charge and higher rates (a db.r6g.large is $0.26 an hour on Standard and $0.338 on I/O-Optimized; storage is $0.225 per GB-month), and claimed "up to 40 percent cost savings when your I/O spend exceeds 25 percent of your current Aurora database spend." The two configurations are the same engine with two ways of pricing the provider's risk: either the customer carries the I/O variance, or the provider does and charges a premium for it.

The same storage design carries Aurora Serverless v2 (GA 21 Apr 2022), which scales in steps of 0.5 **Aurora Capacity Units** (one ACU is about 2 GiB of memory with matching CPU and network). At GA the range was 0.5 to 128 ACUs; AWS's current documentation gives "from 0 ACUs to 256 ACUs for Aurora MySQL and to 384 ACUs for Aurora PostgreSQL," with 0 meaning auto-pause on recent engine versions. In October 2026 it is $0.12 per ACU-hour on Standard and $0.16 on I/O-Optimized. Aurora DSQL (GA 27 May 2025) goes further: query processors, an adjudicator, a journal and a crossbar as separate services, single-region commits written to a distributed transaction log replicated synchronously across three zones, and multi-region clusters of two peered regional endpoints plus a witness region, designed for 99.99% single-region and 99.999% multi-region availability. It bills **Distributed Processing Units** for reads and writes plus storage, with a free tier of 100,000 DPUs and 1 GB-month a month.

Neon is the open-source cousin of Aurora's design (separate WAL quorum, page servers, object storage underneath), covered in [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases#serverless-postgres).

## Key-Value and Distributed SQL

**DynamoDB** came from the Dynamo paper (SOSP 2007), which described the key-value store Amazon built for its own shopping cart. The 2012 launch post by Werner Vogels described DynamoDB as "a fully managed NoSQL database service that provides fast performance at any scale," built on Dynamo's principles but removing the operational burden Dynamo had left with each team. Its original pricing unit was the product's isolation unit: **provisioned throughput**, where "customers can now specify the request throughput capacity they require for a given table," and the service partitions the table to deliver it. On-demand mode (28 Nov 2018) added "simple pay-per-request pricing for read and write requests so that you only pay for what you use." The USENIX ATC 2022 paper (Elhemali et al.) covers what running it taught AWS: partition traffic imbalance, fairness between tenants, and automated operations, with a Prime Day 2021 peak of 89.2 million requests per second across "trillions of API calls."

**Spanner** is the other pole. The OSDI 2012 paper described a database that is "scalable, multi-version, globally-distributed, and synchronously-replicated," the first to offer externally consistent distributed transactions at global scale, made possible by an API that exposes clock uncertainty (TrueTime in the paper's body). Cloud Spanner went to public beta on 14 Feb 2017 and GA in May 2017; the 99.999% availability SLA arrived with multi-region configurations on 14 Nov 2017.

**Aurora DSQL** is AWS's answer to Spanner with PostgreSQL compatibility, and Azure lists Cosmos DB and the preview PostgreSQL-based HorizonDB in the same slot. These engines are where a provider's control of the hardware and network turns into a product no one else can sell: synchronized clocks, private backbones and a storage tier designed with the engine.

The general isolation and concurrency rules are the playbook's ([Serializable, With Retries](/docs/database/transactions-and-concurrency#serializable-with-retries)); a distributed SQL service adds retries on transaction conflicts as a normal outcome, not an error.

## Managed Document Databases

MongoDB announced Atlas on 28 Jun 2016 as "an elastic, on-demand cloud service that includes comprehensive infrastructure and turnkey management of its popular database," available first on AWS with Azure and Google Cloud to follow. A decade later it is most of the company. The fiscal 2026 10-K (year ended 31 Jan 2026) reports total revenue of $2,463.8 million, with "Atlas represented 73%, 70% and 66% of our total revenue" for fiscal 2026, 2025 and 2024, "over 63,900 Atlas customers," and an Atlas ARR that annualizes the prior 30 days of usage. Atlas is a consumption business sitting on top of three consumption businesses it also competes with.

The clouds' answer is compatibility rather than the engine: AWS's DocumentDB and Azure DocumentDB accept MongoDB drivers without running MongoDB's server, which the [SSPL](/books/hosting-and-cloud/open-source-and-the-clouds#mongodb-and-the-sspl) made hard to resell. "Compatible" is the word to read carefully in every one of these products; each publishes a list of supported operators and versions, and the gap is where a migration fails.

## Managed Caches

ElastiCache launched on 22 Aug 2011 running Memcached 1.4.5, and Redis followed as the default engine at every cloud (Memorystore for Redis opened to everyone in public beta on 9 May 2018). The managed cache is the simplest managed service: nodes in a cluster, a replica per shard for failover, a maintenance window, and no backup expectation beyond snapshots.

The engine underneath changed in 2024. Redis moved from BSD-3 to source-available licenses in March 2024 and the Linux Foundation launched the Valkey fork eight days later ([Redis and Valkey](/books/hosting-and-cloud/open-source-and-the-clouds#redis-and-valkey)). The clouds moved their caches to Valkey and cut prices to pull customers across: ElastiCache for Valkey (8 Oct 2024) is "priced 33% lower" for serverless and up to 20% lower for node-based clusters than the other engines, with the serverless minimum storage cut to 100 MB, from about $6 a month; Google's Memorystore for Valkey reached GA on 18 Apr 2025, explicitly citing the Redis license change and letting Redis committed-use discounts transfer. Azure took the other path and continues under a licensing agreement with Redis, selling Azure Managed Redis. The cache market is the clearest case in this volume of a license change moving a whole product category in under a year.

Serverless caches priced per command (Upstash) are in [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases#upstash-and-deno-kv). When a cache earns its place, and how to avoid stampedes when it empties after a failover, is the playbook's ([Stampedes](/docs/architecture/application-caching#stampedes)).

## The Meters

A managed database bill is several meters, each tied to a cost the provider carries:

| Meter | Unit | Example, as of October 2026 | Who carries the variance |
| --- | --- | --- | --- |
| Instance time | Instance-hour, billed per second after a 10-minute minimum | RDS MySQL db.t4g.micro $0.016/h (N. Virginia) | Customer, by choosing a size |
| Standby | A second instance and storage | Multi-AZ doubles both rates | Customer |
| Storage | GB-month provisioned (RDS) or used (Aurora) | gp3 $0.115/GB-month Single-AZ; Aurora $0.10 | Customer |
| Provisioned IOPS | IOPS-month | io1 example: "$0.125 x 1024 GiB plus $0.10 x 3000 IOPS, or $428/month" | Customer |
| I/O requests | Per million | Aurora Standard $0.20 per million | Customer on Standard, provider on I/O-Optimized |
| Capacity units | ACU-hour, DPU | Aurora Serverless v2 $0.12 per ACU-hour | Shared: scales with load |
| Backup storage | GB-month beyond free | RDS $0.095, Aurora $0.021 | Customer |
| Data transfer | GB out of region or to the internet | The cloud's general egress rates | Customer |
| Extended support | vCPU-hour or ACU-hour | $0.100 per vCPU-hour years 1 to 2, $0.200 year 3 (MySQL, US East Ohio) | Customer, by not upgrading |

Two decisions recur in every catalog. The first is **provisioned versus used storage**: RDS bills what the customer allocated, Aurora what it consumes, and the difference decides whether a deleted table lowers the bill. The second is **whether I/O is a meter at all**: a per-I/O charge is honest about cost and impossible for a customer to forecast, which is why AWS ended up selling both and Google's AlloyDB announcement made "no opaque I/O charges" a selling point. The FinOps side of both (budgets, anomaly alerts, who owns a database's cost) is the playbook's [Cost & FinOps](/docs/operations/cost-and-finops#the-levers-that-actually-matter) and the [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills) chapter.

## Extended Support and Forced Upgrades

Open-source engines have community end-of-life dates, and a managed database provider has to decide what happens to customers still running a version past its date. Three answers exist, and the clouds have used all of them.

- **Paid extended support.** RDS Extended Support is "a paid option to keep running a major version past end of standard support, up to 3 years," after which the provider upgrades the database itself. It covers critical and high CVE patches and support cases. Enrollment is automatic: when MySQL 5.7 reached end of standard support on 29 Feb 2024, charges began on 1 Mar 2024 for every instance still on it, at $0.100 per vCPU-hour in US East (Ohio) "between March 1, 2024 to February 28, 2026," then "$0.200 per vCPU-hr" from 1 Mar 2026. Aurora Serverless v2 extended support is $0.085 per ACU-hour in years one and two and $0.170 in year three. Opting out is a creation-time setting (`EngineLifecycleSupport`), and opting out past the date triggers an automatic major-version upgrade.
- **Forced upgrade on a date.** The provider announces a date and upgrades whatever is left in a maintenance window, which is what Extended Support's year-three end becomes.
- **Product retirement.** Azure retired an entire deployment option ([Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life#the-lifecycle-of-a-sunset)): Azure Database for MySQL Single Server was "scheduled for retirement by September 16, 2024," with no new instances from the portal after 16 Jan 2024; PostgreSQL Single Server was "scheduled for retirement by March 28, 2025." Microsoft offered a service-initiated in-place migration only for "select Single Server database workloads," with a nomination form, not a blanket promise.

The [managed Kubernetes chapter](/books/hosting-and-cloud/managed-kubernetes#extended-support) describes the same fee for clusters past their support window; the pattern is the provider pricing its own cost of maintaining a version it would rather drop, and turning an upgrade deadline into a revenue line. A provider that sells this has to make the date and the charge visible before it starts: the enrollment default, the rate, the date the rate doubles and the date of the forced upgrade are all facts the customer needs on the resource, not in a blog post. The general upgrade discipline (small, continuous, on supported versions) is the playbook's [Runtime Policy](/docs/engineering/dependencies#runtime-policy).

## Migration and Lock-In

Every provider sells a way in. AWS Database Migration Service handles homogeneous and heterogeneous migrations from Oracle, SQL Server, PostgreSQL, MySQL, MongoDB and MariaDB, with a schema conversion tool that AWS markets as converting "up to 90%" of code with generative AI. Azure's PostgreSQL migration service has first-class paths out of RDS, Aurora, Cloud SQL and AlloyDB. Migration tooling is a competitive weapon: it is built for the direction the provider wants customers to move.

The ways out are narrower. The levers that make a managed database hard to leave, all visible in the sources above:

- **Proprietary storage and APIs.** Aurora's storage, DynamoDB's API, Spanner's dialect, Cosmos DB and DSQL have no other host.
- **Compatible but not identical.** DocumentDB and Azure DocumentDB accept MongoDB drivers; Aurora accepts MySQL and PostgreSQL clients but has its own features and limits. The application drifts onto the parts that aren't portable.
- **Meters that punish exit.** Egress for the data on the way out, and a migration period in which both databases run and both bill.
- **Discounts tied to the engine.** Reserved instances and committed-use discounts that would be stranded by a move (Google's decision to let Redis commitments transfer to Valkey shows the provider knows this).

The schema side of a migration (expand and contract, backfills, dual writes during cutover) is the playbook's [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations#expand-and-contract).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape |
| --- | --- | --- | --- | --- | --- |
| **Self-managed on VMs** | Engine on the customer's VMs and disks | Full control, any version, any extension, portable | The customer owns backups, failover, patching and pages | Engine's license (PostgreSQL, MySQL GPL, Valkey BSD) | VM plus disk; staff time |
| **Kubernetes operator** | An operator runs the engine in a cluster ([Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage) covers it) | Portable across clouds, declarative | Storage and failover depend on the cluster's own reliability | Operator's license plus engine's | Cluster cost plus staff time |
| **Managed open-source engine** (RDS, Cloud SQL, Flexible Server, Aiven, DigitalOcean) | Provider-run engine on attached storage | Portable engine, provider-run HA and PITR, many vendors | Failover is a reconnect; replicas lag; extended support fees on old versions | Engine's license; the provider's service terms | Instance-hours, storage, IOPS, standby doubled |
| **Cloud-native relational** (Aurora, AlloyDB, Azure Hyperscale) | Familiar engine on the provider's own storage | Fast failover, storage that grows itself, fewer replicas needed | Proprietary storage; I/O meters; one provider | Proprietary service | Instance or capacity units, storage used, I/O or a premium |
| **Distributed SQL** (Spanner, DSQL, Cosmos DB) | The provider's own engine across zones or regions | Strong consistency across regions, no failover to manage | New dialect or subset; conflict retries; deepest lock-in | Proprietary | Nodes, processing units, storage |
| **Managed key-value** (DynamoDB) | Partitioned key-value, provisioned or on-demand | Predictable latency at any scale, no servers | Data model must be designed around access patterns; proprietary API | Proprietary | Read and write units or requests, storage |
| **Vendor's own cloud** (MongoDB Atlas) | The engine's maker runs it on a hyperscaler | The real engine, newest versions, multi-cloud | A second vendor and contract; the cloud's egress still applies | Engine maker's license (SSPL for MongoDB) | Cluster tiers and usage |

## My Default

My default is a managed open-source engine, PostgreSQL on RDS, Cloud SQL, Azure Flexible Server or a developer cloud's managed Postgres, with Multi-AZ on in production, point-in-time recovery tested by an actual restore, and the engine version on the provider's support calendar with an upgrade scheduled before standard support ends. It keeps the most portable engine with the least operational load, and the bill is legible: instance, standby, storage, backups.

I'd move to a cloud-native engine (Aurora, AlloyDB) when failover time or storage growth is the problem the business actually has, and I'd pick Aurora I/O-Optimized over Standard as soon as I/O is a meaningful share of the bill, because a meter I can't forecast is worse than a premium I can. I'd pick DynamoDB or a distributed SQL service only for a workload whose access pattern or consistency need genuinely requires it, knowing I'm choosing the provider for the life of that data. For caches, my default is the provider's managed Valkey, since it is the cheaper engine at the clouds that offer it and the license is BSD. The tradeoff that would change all of this is staff: a team with database operators on call can run the engine on VMs or an operator for less money and more control; a team without them should not.

## How to Build It

The chapter adds `databases` and `caches` side tables for resources of kind `'database'` and `'cache'`, an `engine_versions` table with support windows, and the meters and SKUs that bill them, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). A serverless or edge store that isn't a provisioned engine is an `edge_stores` row from [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases#how-to-build-it); serverless Postgres is a `databases` row with `deployment = 'serverless'`.

```sql
CREATE TABLE engine_versions (           -- the support calendar the provider publishes
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  engine                  TEXT NOT NULL,   -- 'postgresql', 'mysql', 'mariadb', 'valkey', 'redis'
  major_version           TEXT NOT NULL,   -- '5.7', '16', '8.0'
  standard_support        TSTZRANGE NOT NULL,  -- upper bound: end of standard support
  extended_support_until  TIMESTAMPTZ,     -- null: no extended support offered
  forced_upgrade_at       TIMESTAMPTZ,     -- when the provider upgrades what's left
  upgrade_target          TEXT,            -- the major version a forced upgrade goes to
  announced_at            TIMESTAMPTZ NOT NULL,  -- notice is measured from here
  UNIQUE (engine, major_version)
);

CREATE TABLE databases (                 -- side table: kind = 'database'
  resource_id          UUID PRIMARY KEY REFERENCES resources (id),
  engine               TEXT NOT NULL,
  engine_version       TEXT NOT NULL,      -- the full version, e.g. '16.4'
  engine_version_id    UUID NOT NULL REFERENCES engine_versions (id),  -- its major
  deployment           TEXT NOT NULL CHECK (deployment IN ('single_instance', 'standby',
                         'cluster', 'serverless', 'distributed')),
  storage_model        TEXT NOT NULL CHECK (storage_model IN ('attached_block',
                         'shared_log', 'local_nvme', 'provider_managed')),
  io_billing           TEXT NOT NULL CHECK (io_billing IN ('per_request', 'included',
                         'provisioned')),    -- Aurora Standard, I/O-Optimized, io1
  instance_class       TEXT,               -- null for serverless and distributed
  capacity_min         NUMERIC,            -- capacity units, for serverless
  capacity_max         NUMERIC,
  storage_gb           NUMERIC,            -- provisioned; null where billed as used
  standby_zone_id      TEXT REFERENCES zones (id),
  backup_retention_days SMALLINT NOT NULL CHECK (backup_retention_days >= 0),
  maintenance_window   TEXT NOT NULL,      -- 'sun:05:00-sun:06:00' UTC
  extended_support     TEXT NOT NULL DEFAULT 'auto_enroll' CHECK (extended_support IN
                         ('auto_enroll', 'opted_out')),  -- set at creation
  CHECK ((deployment = 'serverless') = (capacity_max IS NOT NULL)),
  CHECK (deployment <> 'standby' OR standby_zone_id IS NOT NULL)
);

CREATE TABLE database_replicas (         -- read replicas are resources of their own
  replica_resource_id  UUID PRIMARY KEY REFERENCES resources (id),
  source_resource_id   UUID NOT NULL REFERENCES resources (id),
  replication          TEXT NOT NULL CHECK (replication IN ('async', 'shared_storage')),
  cross_region         BOOLEAN NOT NULL
);

CREATE TABLE caches (                    -- side table: kind = 'cache'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  engine             TEXT NOT NULL CHECK (engine IN ('valkey', 'redis', 'memcached')),
  engine_version     TEXT NOT NULL,
  engine_version_id  UUID NOT NULL REFERENCES engine_versions (id),
  mode               TEXT NOT NULL CHECK (mode IN ('node_based', 'serverless')),
  node_type          TEXT,               -- null for serverless
  shards             SMALLINT,
  replicas_per_shard SMALLINT,
  engine_license     TEXT NOT NULL,      -- SPDX id of what this build ships under
  CHECK ((mode = 'node_based') = (node_type IS NOT NULL))
);

CREATE TABLE database_lifecycle_events (  -- what the provider did to the engine, and when
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  resource_id   UUID NOT NULL REFERENCES resources (id),
  event         TEXT NOT NULL CHECK (event IN ('minor_patch', 'major_upgrade',
                  'forced_upgrade', 'extended_support_started', 'extended_support_ended',
                  'failover', 'restore', 'storage_scaled')),
  from_version  TEXT,
  to_version    TEXT,
  initiated_by  TEXT NOT NULL,           -- typed actor: 'system:lifecycle', a user
  occurred_at   TIMESTAMPTZ NOT NULL
);
```

The meters are `usage_events.meter` values rated by SKUs in the core catalog:

| Meter | Unit | SKU example | Notes |
| --- | --- | --- | --- |
| `db.instance_seconds` | second | `db.mysql.t4g-micro.standby.second` | Dimensions: class, deployment; standby is its own SKU |
| `db.storage_gb_hours` | gb_month | `db.gp3.standby.gb_month` | Provisioned or used, per `storage_gb` |
| `db.io_requests` | request | `db.aurora.io.million` | Only where `io_billing = 'per_request'` |
| `db.capacity_unit_seconds` | second | `db.aurora-serverless.acu.second` | Summed per second at the current capacity |
| `db.backup_gb_hours` | gb_month | `db.backup.gb_month` | Only beyond the free allowance |
| `db.extended_support_vcpu_seconds` | second | `db.mysql.5-7.extended.y1-2.vcpu_hour`, `...y3.vcpu_hour` | Two price versions; year three is a new `price_versions` row, announced in advance |
| `cache.node_seconds` | second | `cache.valkey.r7g-large.second` | Per node, replicas included |

Extended support is the piece most providers get wrong in the data, because it starts by itself. The job that starts billing it is a query over the support calendar, run daily, which emits a lifecycle event and starts a meter; nothing is billed without the event:

```sql
-- Databases that crossed end of standard support today and are now in extended support.
INSERT INTO database_lifecycle_events (resource_id, event, from_version, initiated_by,
                                       occurred_at)
SELECT d.resource_id, 'extended_support_started', d.engine_version,
       'system:lifecycle', upper(v.standard_support)
FROM databases d
JOIN engine_versions v ON v.id = d.engine_version_id
JOIN resources r ON r.id = d.resource_id
WHERE r.state IN ('active', 'stopped')         -- stopped databases still hold a version
  AND d.extended_support = 'auto_enroll'
  AND upper(v.standard_support) <= NOW()
  AND (v.extended_support_until IS NULL OR v.extended_support_until > NOW())
  AND NOT EXISTS (SELECT 1 FROM database_lifecycle_events e
                  WHERE e.resource_id = d.resource_id
                    AND e.event = 'extended_support_started'
                    AND e.from_version = d.engine_version);
```

Notes on the sketch:

- **The support calendar is data.** End of standard support, end of extended support, the forced-upgrade date and the target version live in `engine_versions` with the date they were announced, so a notice job can tell every affected account how many days it has, and a dispute can be answered with when the customer was told.
- **Opt-out is decided at creation.** RDS treats it that way, and the column makes it visible; an `opted_out` database reaching its date gets a `forced_upgrade` event instead of a charge.
- **Standby, replicas and serverless are different shapes.** A standby is a column (it serves nothing and is billed with the primary); a read replica is a resource of its own because it has an endpoint, a bill and a lag; a serverless database has a capacity range instead of a class.
- **Every engine change is an event.** Failovers, restores, forced upgrades and patches are rows the customer can see, because "what did the provider do to my database last night" is the first support question after an incident.
- **Events:** `database.failover`, `database.upgraded`, `database.extended_support_started`, `database.restore_completed` and `engine_version.deprecation_announced` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing and the status page.

## Auditing

- **What was running, at which version, under which support status.** Every database's version history and every extended-support start and end, so a charge can be traced to the date the version left standard support and the notice that preceded it.
- **What the provider changed.** Patches, forced upgrades and failovers with their actor and time, because a customer's incident review needs them and a credit claim may depend on them.
- **Restores and who asked.** Each point-in-time restore with its target time and requester; a restore is how data from a deleted account or a legal hold comes back.
- **Backups past account closure.** Snapshots are customer data: they are deleted on the provider's published schedule after termination, and that deletion is logged ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Sell the open-source engine for portability and your own engine for capability,** and be explicit with customers about which one they are on.
- **Make every HA and durability feature a visible line:** standby, replicas, backups beyond free, cross-region copies.
- **Decide who carries I/O variance,** and if it's the customer, offer an I/O-inclusive configuration too.
- **Publish the engine support calendar as data,** with announcement dates, extended-support rates by year and the forced-upgrade date.
- **Start extended-support billing only from a lifecycle event,** never from a silent rate change.
- **Log every change the provider makes to a customer's database,** and show it to them.
- **Expect a license change to move a category:** keep the engine and its license as columns, so switching a cache fleet from Redis to Valkey is a migration you can count.

## References

**Papers**

- [Verbitski et al., Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases (SIGMOD 2017)](https://www.amazon.science/publications/amazon-aurora-design-considerations-for-high-throughput-cloud-native-relational-databases), the network as the bottleneck and redo pushed to storage
- [Aurora paper, archived PDF](http://web.archive.org/web/20211009113903/https://www.allthingsdistributed.com/files/p1041-verbitski.pdf), six copies across three zones, 4/6 write and 3/6 read quorums, 10 GB segments in protection groups, "the log is the database," the 35x and 7.7x figures
- [Elhemali et al., Amazon DynamoDB: A Scalable, Predictably Performant, and Fully Managed NoSQL Database Service (USENIX ATC 2022)](https://www.usenix.org/conference/atc22/presentation/elhemali), fairness and partition imbalance, the Prime Day 2021 peak
- [Corbett et al., Spanner: Google's Globally-Distributed Database (OSDI 2012)](https://research.google/pubs/spanner-googles-globally-distributed-database-2/), externally consistent distributed transactions and clock uncertainty

**Provider announcements**

- [AWS: Introducing RDS](https://aws.amazon.com/blogs/aws/introducing-rds-the-amazon-relational-database-service/), the 2009 launch, instance classes, storage and I/O prices, point-in-time restore, the SimpleDB complement
- [AWS What's New: Introducing Amazon RDS (27 Oct 2009)](https://aws.amazon.com/about-aws/whats-new/2009/10/27/introducing-amazon-relational-database-service/), the announcement date
- [AWS: Amazon RDS Multi-AZ deployment](https://aws.amazon.com/blogs/aws/amazon-rds-multi-az-deployment/), the 2010 standby design and failover time
- [AWS: Highly scalable MySQL-compatible RDS engine](https://aws.amazon.com/blogs/aws/highly-scalable-mysql-compat-rds-db-engine/), the Aurora preview, 10 GB increments to 64 TB
- [AWS: Aurora I/O-Optimized](https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/), the 2023 configuration and its savings claim
- [AWS: Aurora Serverless v2 is generally available](https://aws.amazon.com/blogs/aws/amazon-aurora-serverless-v2-is-generally-available-instant-scaling-for-demanding-workloads/), ACUs, 0.5-unit steps and the GA range
- [AWS: Aurora DSQL is now generally available](https://aws.amazon.com/blogs/aws/amazon-aurora-dsql-is-now-generally-available), components, multi-region design, DPUs and free tier
- [AWS What's New: Aurora DSQL generally available](https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-aurora-dsql-generally-available), the 27 May 2025 date and availability targets
- [Werner Vogels: Amazon DynamoDB](https://www.allthingsdistributed.com/2012/01/amazon-dynamodb.html), the 2012 launch, the Dynamo lineage and provisioned throughput
- [AWS What's New: DynamoDB on-demand](https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-amazon-dynamodb-on-demand/), pay-per-request pricing, 28 Nov 2018
- [AWS: Amazon ElastiCache](https://aws.amazon.com/blogs/aws/amazon-elasticache-distributed-in-memory-caching/), the 2011 launch on Memcached
- [AWS: Get started with ElastiCache for Valkey](https://aws.amazon.com/blogs/database/get-started-with-amazon-elasticache-for-valkey/), the 33% and 20% price differences and the 100 MB minimum
- [Google: Cloud SQL, your database in the cloud](https://developers.googleblog.com/2011/10/google-cloud-sql-your-database-in-cloud.html), the 2011 preview
- [The Register: Google's cloudy database hits beta](https://www.theregister.com/2017/02/15/googles_cloudy_database_hits_beta_gets_prices/), Cloud Spanner beta pricing
- [Google Cloud: Multi-region support in Cloud Spanner](https://cloud.google.com/blog/products/gcp/with-multi-region-support-in-cloud-spanner-have-your-cake-and-eat-it-too), GA in May 2017 and the 99.999% SLA with multi-region
- [Google Cloud: Introducing AlloyDB for PostgreSQL](https://cloud.google.com/blog/products/databases/introducing-alloydb-for-postgresql), the 2022 preview and "no opaque I/O charges"
- [Google Cloud: Introducing Cloud Memorystore for Redis](https://cloud.google.com/blog/products/gcp/introducing-cloud-memorystore-a-fully-managed-in-memory-data-store-service-for-redis/), the 2018 public beta
- [Google Cloud: Memorystore for Valkey is generally available](https://cloud.google.com/blog/products/databases/announcing-general-availability-of-memorystore-for-valkey/), GA, pricing parity and transferable commitments
- [MongoDB: MongoDB unveils MongoDB Atlas](https://www.mongodb.com/press/mongodb-unveils-mongodb-atlas-the-new-industry-standard-for-database-as-a-service), the 28 Jun 2016 launch on AWS

**Provider documentation and pricing**

- [Amazon RDS](https://aws.amazon.com/rds/), the engine list
- [Amazon RDS for MySQL pricing](https://aws.amazon.com/rds/mysql/pricing/), per-second billing, storage range, the io1 example, Extended Support rates
- [Amazon RDS: Stopping a DB instance temporarily](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html), charges while stopped and the automatic start after seven days
- [DigitalOcean: Managed Databases](https://docs.digitalocean.com/products/databases/), the six engines offered
- [Aiven: Pricing](https://aiven.io/pricing), hourly plans, no separate HA charge, clouds and free plans
- [AWS Price List API: Amazon RDS, US East (N. Virginia)](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/us-east-1/index.json), RDS, Aurora, Serverless v2 and extended support rates as of October 2026
- [Amazon RDS: Extended Support](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/extended-support.html), auto-enrollment, the MySQL 5.7 dates, `EngineLifecycleSupport` and the forced upgrade
- [Aurora Serverless v2: How it works](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.how-it-works.html), the current 0 to 256 and 384 ACU ranges
- [AWS Database Migration Service](https://aws.amazon.com/dms/), sources, schema conversion and its claims
- [Azure: Databases](https://azure.microsoft.com/en-us/products/category/databases), the October 2026 portfolio
- [Microsoft Learn: Azure Database for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/), Flexible Server and the migration service
- [Microsoft Learn (archived): What's happening to PostgreSQL Single Server](http://web.archive.org/web/20231002024315/https://learn.microsoft.com/en-us/azure/postgresql/single-server/whats-happening-to-postgresql-single-server), the 28 Mar 2025 retirement
- [Microsoft Learn (archived): What's happening to MySQL Single Server](http://web.archive.org/web/20240512132304/https://learn.microsoft.com/en-us/azure/mysql/single-server/whats-happening-to-mysql-single-server), the 16 Sep 2024 retirement and select-workload auto-migration
- [Redis: Redis adopts dual source-available licensing](https://redis.io/blog/redis-adopts-dual-source-available-licensing/), Microsoft's agreement to continue its Redis service

**Filings**

- [MongoDB: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1441816/000162828026016799/mdb-20260131.htm), revenue, Atlas share and customers, Atlas ARR method, competition with the clouds
