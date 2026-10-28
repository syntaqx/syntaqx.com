+++
title = "Regions, Zones, Cells & Quotas"
description = "Regions, zones and sovereign partitions across providers, control and data planes, cells and shuffle sharding, real outages, quotas and capacity limits."
category = "Hosting & Cloud Industry"
order = 2124
part = "The Stack, Bottom to Top"
tags = ["regions", "availability-zones", "cell-based-architecture", "quotas", "reliability"]
+++

A provider's footprint is a set of promises about what fails together. A **region** is a metro area with its own control plane, its own prices and usually its own legal home. A **zone** inside it is a set of buildings with separate power, cooling and networking, close enough for synchronous replication and far enough apart that one fire, flood or utility fault shouldn't take two. A **cell** is a smaller wall the provider builds inside its own services: a complete copy of a service that serves only some customers, so a bad deploy or a poison request reaches a fraction of them. And a **quota** is a limit on what one account may hold or do, which protects the fleet, other tenants and the customer's own bill from one account's growth, mistake or compromise. Each of these is a blast-radius boundary, and the outages of the last fifteen years are, almost without exception, stories of a boundary that turned out to be thinner than stated.

This chapter surveys footprints as of October 2026 across AWS, Azure, Google Cloud, Oracle, DigitalOcean, Hetzner, OVHcloud, Akamai, Vultr and Cloudflare; tells how zones, cells and shuffle sharding arrived; sets out what each provider promises a zone is; explains control planes, data planes and static stability; walks the public post-mortems where blast radius crossed a boundary; and covers quotas and capacity, which are different limits that customers routinely confuse. It adds a zone-to-facility mapping, per-account zone names, cells and cell assignments, quota requests, quota columns and capacity reservations to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The buildings are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation); the network between zones is [Data Center Networking](/books/hosting-and-cloud/data-center-networking); placement inside a zone is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers); regions run on a customer's site are [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud). Outage communication is the chapter [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages), availability credits are [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits), data residency law is [Shared Responsibility & Compliance Programs](/books/hosting-and-cloud/compliance-programs), and quotas used against fraud are [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys).

## How the Providers Do It

Footprints as published, as of October 2026:

| Provider | Footprint | Failure domain below the region | Name mapping | Other location types |
| --- | --- | --- | --- | --- |
| **AWS** | 39 Regions, 124 Availability Zones, at least three per Region; Saudi Arabia and Chile announced | Availability Zone: one or more data centers, up to about 100 km apart | Before November 2025, zone names were mapped independently per account in the oldest Regions; AZ IDs (`use1-az4`) are the same everywhere | 46 Local Zones, 33 Wavelength Zones, 750+ CloudFront points of presence; the European Sovereign Cloud as a separate partition |
| **Microsoft Azure** | "70+ announced regions"; zone-enabled regions mostly have three zones (East US 2 has four, one in preview) | Availability zone: one or more datacenters, typically several kilometers apart and usually within 100 km | Physical zones mapped to logical zone numbers per subscription | Regions without zones; Azure Government and Azure in China as separate clouds |
| **Google Cloud** | 43 regions, 130 zones | Zone: "a deployment area within a region"; regions have three or more zones in three or more data centers, except Stockholm, Osaka and Montreal (three zones in one or two data centers) | Not documented on the pages opened | 200+ network edge locations; AI zones such as `us-west4-ai2b` |
| **Oracle Cloud** | Regions grouped into realms (commercial, government, dedicated) | Availability domain: one or more data centers that don't share power, cooling or the internal network; three fault domains per availability domain | Availability domain names randomized per tenancy (`Uocm:PHX-AD-1`) | Most commercial regions have one availability domain; government and sovereign realms |
| **DigitalOcean** | 16 datacenters in 13 regions (`nyc1` to `nyc3`, `sfo2`, `sfo3`, `ams3`, `fra1`, others) | The datacenter; no availability zones documented | Each slug is one datacenter | Legacy datacenters with restricted creation |
| **Hetzner** | Six locations: Falkenstein, Nuremberg, Helsinki (owned parks), Ashburn, Hillsboro and Singapore (colocation) | The location; network zones (`eu-central`, `us-east`, `us-west`, `ap-southeast`) are networking and pricing scopes | Location codes (`fsn1`, `nbg1`, `hel1`) | None |
| **OVHcloud** | 3-AZ regions (Paris `eu-west-par`, Milan `eu-south-mil`) and 1-AZ regions (Gravelines, Roubaix, Strasbourg and others) | Availability zone: one or more datacentres with their own power, cooling and network | Region codes with zone letters | Local Zones (`eu-west-lz-vie`); SecNumCloud regions |
| **Akamai (Linode)** | Core compute regions plus 11 distributed regions | Not documented on the pages opened | Region identifiers | Distributed regions need a Dedicated CPU plan and an existing core-region footprint, with no Block Storage, Object Storage or Backups |
| **Vultr** | 34 cloud data center regions, in 34 cities, on its locations page | Not documented on the pages opened | Not verified | Not verified |
| **Cloudflare** | 348 cities, 8 regions on its network page | None exposed to customers; code runs everywhere | None | The whole network is the product |

Four patterns run through the table:

- **Three zones is the hyperscaler standard; one location is the developer-cloud standard.** AWS, Azure's zone regions, Google and OVHcloud's 3-AZ regions all build three or more failure domains per region. DigitalOcean and Hetzner sell locations and leave cross-location redundancy to the customer; Oracle launches most regions with one availability domain and offers fault domains inside it.
- **Zone names lie on purpose.** AWS (for older accounts), Azure and Oracle map physical zones to names differently per customer to spread load, so "zone a" in two accounts can be different buildings. Each provides a stable physical identifier or an API to translate.
- **A footprint number is a count of different things.** Regions, zones, local zones, edge locations and cities are not comparable across providers, and a region with one zone isn't the same product as a region with three.
- **Sovereignty became a partition.** AWS's European Sovereign Cloud, Azure Government, Oracle's government and sovereign realms and OVHcloud's SecNumCloud regions are separate control planes and identity systems, not just more regions.

## How It Got Here

### Zones as a product (2008 to 2011)

AWS announced Availability Zones with Elastic IP addresses on March 26, 2008: each zone with "its own reliable, physically independent infrastructure," so customers could launch instances across zones for fault-resilient applications. Werner Vogels's post the next day described zones as "engineered to be insulated from failures in other Availability Zones" and connected to each other cheaply and with low latency. The April 2011 EBS outage then showed the limit of the idea: a network change in one zone started a re-mirroring storm, and slow volume-creation calls "exhausted the EBS control plane's regional thread pool," so API calls failed in other zones too. AWS's stated goal afterwards was to make "Availability Zones indistinguishable from completely independent," by making the control plane zone-aware and moving functions into per-cluster services.

**What it solved:** a unit of failure customers could design around. **What it cost:** the discovery that a zone is only as independent as the regional systems behind it.

### Cells and shards inside the services (2013 to 2019)

Starting in 2013, the EBS team built Physalia, "a transactional key-value store, optimized for use in large-scale cloud control planes," as EBS's configuration master; its NSDI 2020 paper describes it as "extremely available for only the keys it knows each client needs" rather than for the whole database. The S3 outage of February 28, 2017, where a mistyped capacity-removal command took down the index and placement subsystems for hours, ended with AWS committing to split services into smaller cells to limit blast radius and accelerating the partitioning of S3's index. In December 2019 the Builders' Library published two of the ideas behind this: static stability (by Mike Furr) and shuffle sharding, the latter with Route 53's use of 2,048 virtual name servers, four per domain.

### Zones everywhere (2018 to 2023)

Azure made availability zones generally available in Central US and France Central, with East US 2, West Europe and Southeast Asia in preview, reported April 7, 2018, with a 99.99% uptime SLA for VMs in two or more zones. Slack's June 30, 2021 incident, a faulty link between one AWS zone and the others that left components disagreeing about which backends were up, led it to treat each zone as a cell that can be drained (published August 22, 2023). AWS's December 7, 2021 us-east-1 event showed the other side of the control-plane problem: congestion between AWS's internal and main networks impaired EC2 launches, Route 53 APIs, console sign-in, STS and the status dashboard for about seven hours, while running instances, existing load balancers and DNS answers kept working. AWS published its cell-based architecture guidance on September 20, 2023, noting that "For more than a decade, our service teams have used cell-based architecture."

### Global planes fail (2023 to 2025)

The outages that defined the period crossed zones and regions through shared configuration and control systems rather than through buildings: Cloudflare's control plane in one Oregon facility (November 2023), Google's globally replicated quota policy (June 12, 2025), AWS's DynamoDB DNS automation in us-east-1 (October 19 and 20, 2025) and Azure Front Door's configuration metadata (October 29, 2025). They're in [Blast Radius in Real Outages](#blast-radius-in-real-outages) below. Accounts created from November 2025 get consistent AWS zone names, ending per-account mapping for new customers.

### Sovereign partitions (2026)

AWS opened the European Sovereign Cloud on January 14, 2026: a first Region, `eusc-de-east-1`, in Brandenburg, in a separate partition (`aws-eusc`) that is "physically and logically separate," with its own IAM and billing, operations run by EU residents located in the EU, and sovereign Local Zones planned in Belgium, the Netherlands and Portugal. "This Region operates independently from existing AWS Regions." A sovereign region is the cell idea applied to legal jurisdiction: a separate control plane, so neither an outage nor an order in one partition reaches the other. The legal side is [Shared Responsibility & Compliance Programs](/books/hosting-and-cloud/compliance-programs#sovereign-cloud).

## What a Zone Promises

Every provider uses the word "zone"; the promises differ. From each provider's own documentation, as of October 2026:

| Provider | Building blocks | Distance and latency | What's not shared | Change management |
| --- | --- | --- | --- | --- |
| **AWS** | "One or more discrete data centers" | "Up to 60 miles (~100 km)" apart; "single-digit millisecond latency" for synchronous replication | Generators and cooling; supplied by different power substations; each zone reaches the internet through two transit centers | "Deployments to Availability Zones in the same Region are separated in time" |
| **Azure** | "A logical grouping of one or more physically separate datacenters" | "Typically separated by several kilometers, and usually are within 100 kilometers"; inter-zone round trip under about 2 ms targeted | Power, cooling and networking | Microsoft "aims to deploy updates to Azure services within a single availability zone at a time"; no charge for inter-zone data transfer |
| **Google Cloud** | Zones as logical abstractions of physical resources | Not stated on the pages opened | Designed to minimize correlated failures of power, cooling or networking | Not stated on the pages opened |
| **Oracle** | Availability domain: "one or more data centers located within a region"; fault domain: "a grouping of hardware and infrastructure within an availability domain" | Not stated | Availability domains don't share power, cooling or the internal network | Not stated |
| **OVHcloud** | One or more datacentres per zone | Not stated | Own power, cooling and network | Not stated |

Three consequences for anyone building on, or building, zones:

**Zonal and regional resources are different products.** Google states the scopes plainly: zonal resources (instances, zonal disks) work only within their zone, regional ones (static external IPs) anywhere in the region, global ones (images) everywhere. Azure distinguishes zone-redundant resources, which Microsoft replicates and fails over, from zonal ones, where "you're responsible for failover to another zone," and nonzonal resources that Azure "might place ... across any zones in the region," so they can be in the zone that fails. Block volumes are zonal and object storage is regional ([Storage: Block, File & Object](/books/hosting-and-cloud/storage#block-volumes)).

**Names map per customer, IDs don't.** Azure: "Physical zones are mapped to logical zones in your Azure subscription, and different subscriptions might have a different mapping order." Oracle "randomizes availability domains by tenancy," so `PHX-AD-1` can be different data centers for two tenancies. AWS did the same for accounts created before November 2025 in its oldest Regions, and gives every zone an AZ ID "which is the same physical location in every AWS account." The purpose is load spreading (without it, every customer's first choice is the same building). The cost is that two customers coordinating a failover, or a provider's incident notice, must use physical IDs; Azure exposes the mapping through its List Locations and Check Zone Peers APIs.

**Zones fill up.** AWS documents constrained zones: "we might restrict you from creating zonal resources in a constrained Availability Zone, unless you already have resources in that Availability Zone," and eventually remove it from the list for new accounts, so "your account might have a different number of available Availability Zones in a Region than another account does." A zone's status is a fact that changes, and the core model's `zones.status` already carries `constrained`.

## Control Plane and Data Plane

AWS's fault isolation whitepaper gives the vocabulary most providers now use. **Control planes** "provide the administrative APIs used to create, read/describe, update, delete, and list (CRUDL) resources": launching an instance means finding a host, allocating interfaces, preparing a volume, issuing credentials and programming security groups. The **data plane** "is what provides the primary function of the service": the running instance, reads and writes to a volume, GETs and PUTs on a bucket, DNS answers. Data planes "are intentionally less complicated," so "failure events [are] statistically less likely to occur in the data plane versus the control plane."

**Static stability** is the design rule that follows: systems "continue to operate as normal without the need to make changes during the failure or unavailability of dependencies." "Once an EC2 instance has been launched, it is just as available as the physical server in a data center," independent of control-plane APIs, and the same holds for VPCs, buckets and volumes. The customer version is to pre-provision instead of reacting: the Builders' Library example runs a service in three zones with 50% extra capacity, each zone at about 66% of its tested load, so losing a zone needs no new launches.

**Global services have one control plane.** AWS lists services whose control planes sit in a single Region while their data planes are distributed: IAM, Organizations, Account Management, Route 53 Public and Private DNS, CloudFront, ACM for CloudFront and Shield Advanced in `us-east-1`; Route 53 ARC, Network Manager and Global Accelerator in `us-west-2`. Some regional operations carry the same dependency: creating a load balancer, API Gateway endpoint or EKS cluster creates Route 53 records through the `us-east-1` control plane, and S3's `CreateBucket` and `DeleteBucket` depend on `us-east-1` to keep bucket names unique. The recommendation is the same for all of them: "Do not rely on the control planes of partitional services in your recovery path"; pre-provision, and fail over by data-plane actions such as health checks and routing controls rather than by editing records.

For a provider, the split is the most important architecture decision in this chapter. Every outage below that crossed a boundary did so through a control or configuration plane: a regional thread pool, a global policy table, a DNS automation, a configuration push. A provider can't avoid having control planes; it can keep each one regional or smaller, keep data planes working on their last known state when the control plane is down, and refuse to put a control-plane call in its own recovery path.

## Cells and Shuffle Sharding

### Cells

AWS's guidance defines a cell-based architecture as "multiple isolated instances of a workload, where each instance is known as a *cell*," each "independent," sharing no state, and handling a subset of requests. The workload is partitioned by a **partition key** that "needs to align with the *grain* of the service": customer ID, resource ID, or another value present in most API calls. Three components make it work:

- **Cell router:** "the *thinnest possible layer*, with the responsibility of routing requests to the right cell, and only that."
- **Cell:** "A complete workload, with everything needed to operate independently."
- **Control plane:** provisions and deprovisions cells and migrates customers between them.

The arithmetic is simple: "If a workload uses 10 cells to service 100 requests, when a failure occurs in one cell, 90% of the overall requests would be unaffected." Cells also contain what zones can't: "unsuccessful code deployments" and "poison pill requests" that fail every server they touch. The sizing guidance argues for capping cell size and using consistent sizes, small enough "to test at full scale" and to stay under account and region quotas, large enough for the biggest customer and for economies of scale; smaller cells mean more cells to operate and a smaller share of customers in each.

Azure's **Deployment Stamps** pattern is the same idea under another name: "Each copy is called a *stamp*, or sometimes a *service unit*, *scale unit*, or *cell*," each serving "a predefined number of tenants," deployed and updated independently. Its list of costs is the honest one: stamps multiply infrastructure cost, moving tenants between stamps "can be difficult," the routing component that resolves tenants to stamps "might also need to be highly available," and at least two stamps are needed from the start, because with one "you can easily hard-code assumptions." Azure Storage has been built from storage stamps since its 2011 design paper ([Storage: Block, File & Object](/books/hosting-and-cloud/storage#how-it-got-here)).

Slack's version makes the zone itself the cell. After the June 30, 2021 incident, every service runs in every zone and talks only to backends in its own zone, so "AZs are cells, and cells may be drained": edge load balancers shift weight away from a zone in 1% steps, with a goal of moving as much traffic as possible within 5 minutes. Draining is the operation cells exist to make safe, and it needs no control plane beyond a weight change.

### Shuffle sharding

Cells divide customers into fixed groups; shuffle sharding gives each customer its own random combination of workers. The Builders' Library example: with 8 workers and plain sharding into 4 pairs, a customer whose requests crash workers takes down a quarter of the service. Assigning each customer a random pair from the 8 gives 28 combinations, so the same customer affects about 1/28 of others' capacity, roughly seven times better. Route 53 runs 2,048 virtual name servers and gives each domain four, about 730 billion combinations, so "no two domains share more than two virtual name servers," and a DDoS against one domain leaves nearly every other domain with healthy servers. The technique only works with clients that retry across their shard, which is why it fits DNS and SDK-driven APIs best.

For a provider, cells and shuffle shards are complementary: cells bound the blast radius of the provider's own deploys and data; shuffle shards bound the blast radius of one customer's traffic. Both need the assignment recorded, because during an incident the first question is which customers were in the affected cell or shared the affected workers.

## Blast Radius in Real Outages

The public post-mortems, in the order they happened:

| Incident | Boundary crossed | How | Remedies stated |
| --- | --- | --- | --- |
| **AWS EBS, us-east-1, April 21, 2011** | Zone to region | Slow volume-creation calls exhausted the EBS control plane's regional thread pool, failing API requests in other zones | Timeouts, a zone-aware control plane with load shedding, per-cluster services |
| **AWS S3, us-east-1, February 28, 2017** | Subsystem to service | A mistyped playbook command removed too much capacity from the index and placement subsystems; full restarts took hours; the status dashboard depended on S3 | Slower capacity removal with minimum-capacity guards; cell partitioning of the index; a multi-region dashboard |
| **AWS, us-east-1, December 7, 2021** | Internal network to control planes | An automated scaling task triggered connection floods that clients failed to back off from, congesting devices between the internal and main networks for about seven hours | Fixes to client back-off; protections for network devices; a status dashboard and support system spanning regions |
| **Cloudflare, November 2 to 4, 2023** | One facility to the whole control plane | Flexential PDX-04 lost utility and generator power; Kafka and ClickHouse ran only there, so the dashboard, APIs and analytics failed for about 40 hours while the network kept serving | Control plane off core data centers; high-availability requirements for GA products; tests that remove an entire facility |
| **Google Cloud, June 12, 2025** | Region to global | A Service Control quota-policy feature, rolled out May 29 with an unexercised code path, crashed on a policy with blank fields that Spanner replicated globally "within seconds"; no error handling and no feature flag; the kill switch was rolled out within about 40 minutes, but restarts overloaded Spanner in us-central1 for up to about 2 hours 40 minutes without randomized backoff | Fail open; feature flags off by default; incremental propagation of global data; backoff audits; monitoring and status communications independent of Google Cloud |
| **Cloudflare, June 12, 2025** | Provider to provider | Workers KV's storage ran partly on a third-party cloud provider, unnamed in the post, that had its own outage that day; 90.22% of KV requests failed and Access, WARP, Turnstile, Workers AI and others failed with it | Remove KV's dependence on any single storage provider; gradual re-enable tooling |
| **AWS, us-east-1, October 19 and 20, 2025** | Regional service to the region and beyond | A race between DynamoDB's DNS Enactors left `dynamodb.us-east-1.amazonaws.com` with no IP addresses for about 2 hours 52 minutes; EC2's DropletWorkflow Manager, whose host leases depend on DynamoDB, fell into congestive collapse; network propagation backlogged; NLB health checks flapped and triggered zone failover; console sign-in for some users outside us-east-1 and Redshift's IAM queries in all Regions failed through dependencies on us-east-1 | DNS automation disabled worldwide pending fixes; velocity control on NLB capacity removal; DWFM recovery tests; queue-based throttling |
| **Azure Front Door, October 29 and 30, 2025** | Configuration to the global edge | Valid customer configuration changes "across two control plane build versions" generated "incompatible customer configuration metadata," which "exposed a latent bug in the data plane" and crashed edge sites from 15:41 UTC; the bad configuration had passed the protection safeguards; mitigated at 00:05 UTC on October 30 | Synchronous configuration processing before production stages; longer bake times; isolating configuration processing from traffic-serving instances; "micro cell" segmentation of customer traffic and configuration |

The pattern across eight incidents run by four companies: buildings rarely caused the widest outages; shared planes did. A thread pool, an internal network, a single facility hosting the control plane, a globally replicated table, a DNS automation and a configuration compiler each crossed the zone and region boundaries that the data plane respected. The recoveries were slowed by the same thing every time: retries without backoff and work queued during the outage arriving all at once, which the playbook's [Exponential Backoff With Jitter](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter) and [Ramping After an Outage](/docs/architecture/admission-control#ramping-after-an-outage) address. The remedies converge too: staged propagation of configuration as well as code, a kill switch, feature flags off by default, cells for configuration, and recovery paths that don't depend on the thing that failed. How these incidents were communicated is [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages); whether customers got credits is [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits).

## Quotas as Protection

A quota is a limit set per account or project, per region, on how much a customer may hold or do. Providers state three purposes. Google's: "Quotas protect the community of Google Cloud users by preventing the overloading of services," they smooth spikes, and they help customers manage their own resources. The scheduler's version is admission control: quota decides whether a request runs before placement decides where ([Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#admission-and-quota)). The third, unstated but visible in the defaults, is fraud: a new account with a stolen card gets little.

**Defaults are small and conditional.** As of October 2026:

- **AWS** measures On-Demand quotas in vCPUs per instance-family group and Region: a default of 5 vCPUs for the Standard families (A, C, D, H, I, M, R, T, Z) and 0 for GPU and accelerator families (G, P, Inf, Trn, DL) and others, all adjustable. "Amazon EC2 automatically increases your On-Demand Instance quotas based on your usage," and customers can request increases.
- **Azure** applies vCPU quotas in two tiers per subscription per region, Total Regional vCPUs and per-VM-family vCPUs, plus a VM count, and a deployment must fit both. Quota counts allocated and deallocated cores.
- **Google Cloud** has allocation quotas (how much can be held), rate quotas (per time period) and concurrent quotas (operations in flight), mostly per project and global, regional or zonal. Increases are requested, "Most requests are reviewed automatically" by undisclosed criteria, some by people, some may require advance payment, and a quota adjuster can request increases as usage approaches a limit once it has enough history. Fixed **system limits** are different and can't be raised.
- **Hetzner** sets a default limit on cloud resources per customer; an increase can be requested "only if you have been with us for a month and paid your first invoice."

**Requests are a workflow with outcomes.** AWS's Service Quotas distinguishes the **default value**, the **applied quota** (an override after an increase), and whether a quota is adjustable, at the account or resource level; "Support might approve, deny, or partially approve your requests." Global quotas can be increased only from `us-east-1` (or the GovCloud and China equivalents), which is the control-plane dependency again. Automatic Management notifies customers before they run out.

**Quotas are a product surface and a risk control at once.** A default of zero GPUs means every new GPU customer files a request, which is how a provider rations scarce hardware and screens for fraud before granting expensive capacity. A one-month wait for more servers is a fraud rule that a legitimate customer experiences as friction. The core `quotas` table already distinguishes `default`, `applied`, `risk` and `abuse` sources; what the provider adds is the request history and the reason for each decision, because a customer refused capacity during a launch asks why, and a regulator or court may too. How risk quotas are set from fraud signals is [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys).

## Capacity Is Not Quota

Quota is permission; capacity is hardware. Azure says it directly: "Azure checks quota and capacity separately. Quota is your subscription's permission to deploy a certain number of vCPUs or VMs. Capacity is the actual compute resources available in the selected region or availability zone." Google: "Resource errors aren't related to your Compute Engine quota."

The failure looks the same to a customer whose launch didn't happen, so the error codes matter. AWS returns `InstanceLimitExceeded` when an account hits its per-Region limit, and `InsufficientInstanceCapacity` when "AWS does not currently have enough available On-Demand capacity to fulfill your request," with advice to retry in a few minutes, request fewer instances, omit the zone, or change instance type. Google returns `ZONE_RESOURCE_POOL_EXHAUSTED` when a zone "does not have enough resources available to fulfill the request," and advises retrying, another zone or region, another machine configuration, or Spot and Flex-start capacity that draws on different pools. A provider's scheduler records these as `rejected_quota` and `rejected_infeasible` in [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#how-to-build-it)'s `placement_decisions`, and the split is what capacity planning needs: quota rejections are a policy decision, capacity rejections are demand the fleet couldn't serve.

**Capacity reservations sell the difference.** They guarantee capacity without a discount:

| | AWS On-Demand Capacity Reservations | Azure on-demand capacity reservation |
| --- | --- | --- |
| Scope | Instance type, platform, tenancy, one Availability Zone | One VM size in a region, optionally one zone |
| Term | None for immediate use; future-dated reservations carry a commitment, a 32-vCPU minimum and limited families | None |
| Price | "No billing discount"; combine with Savings Plans or Regional Reserved Instances for one | "Priced at the same rate as the underlying VM size," used or not; Reserved Instances and Savings Plans apply |
| Guarantee | Capacity reserved in the zone | Capacity "always available within the scope of applicable service-level agreements," with an SLA for capacity |
| Quota | Counts toward On-Demand quota | Requires quota like a VM |
| Exclusions | Not with Dedicated Hosts, spread or partition placement groups | ND-series and NCads H100 v5 among unsupported GPU series; not for Spot VMs or Dedicated Hosts |

A reservation is the provider selling idle capacity at full price as insurance, and it's the only product that turns a capacity risk into a contract. Time-boxed GPU reservations and commitment discounts are [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#buying-capacity) and [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#gpu-capacity-reservations).

## The Alternatives

How a provider or a customer can draw blast-radius boundaries:

| Approach | Model | Strengths | Failure modes | Ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **One location** | A datacenter or location per region, no zones | Simple, cheapest; no cross-zone traffic | One building's failure is the region's | The provider's choice; customer replicates across locations | Lowest | DigitalOcean, Hetzner; most web hosts |
| **One failure domain with fault domains** | Racks or hardware groups inside one building | Anti-affinity for VMs without a second building | Building-level failures take everything | Provider | Low | Oracle's single-AD regions |
| **Multi-zone regions** | Three or more zones within about 100 km | Synchronous replication; zone-redundant managed services | Shared regional and global control planes; per-account zone names; constrained zones | Provider builds; customer must spread zonal resources | Buildings, fiber, often cross-zone transfer fees | AWS, Azure, Google, OVHcloud 3-AZ |
| **Multi-region** | Independent regions with asynchronous replication | Survives regional and many control-plane failures | Data loss up to the RPO; global control planes still shared | Customer designs it | Duplicate capacity and egress | Workloads that can't lose a region |
| **Sovereign partition** | A separate control plane, identity and operations staff | Isolation from other partitions' outages and jurisdictions | Fewer services; separate accounts and billing | Provider, sometimes with a local partner | Premium | Regulated and public-sector customers |
| **Cells or stamps** | Complete service copies per customer group | Contains bad deploys and poison requests; testable at full size | Router is critical; tenant moves are hard; cross-cell features get complex | Provider's internal design | Duplicated fixed cost per cell | AWS services, Azure Storage, Slack |
| **Shuffle sharding** | A random subset of workers per customer | One customer's load or attack reaches few others | Needs clients that retry across the shard | Provider's internal design | Little extra hardware | Route 53, multi-tenant APIs |

## My Default

My default for a provider building a region is three zones from the first day the region sells managed services, with each zone's facilities, power feeds and fiber paths recorded and checked for shared fate, per-account zone names backed by stable physical IDs that every incident notice uses, and zone status (including constrained) published through the API. A developer cloud selling single-location regions is a legitimate product, but I'd label it as one location and sell the cross-location replication and the quota for a second location as part of the onboarding, rather than letting customers discover the boundary in an outage.

Inside the provider, I'd make the control plane regional, never global, for everything except identity and billing, and I'd make those two degrade to cached, read-only operation rather than fail. Every service that holds per-customer state goes into cells with a fixed maximum size and at least two cells from the start, routed by account; every customer-facing endpoint with heavy-tailed traffic (DNS, edge, API gateways) gets shuffle sharding. Configuration and policy are deployed like code: by cell, by zone, by region, with bake time and a kill switch, because the last three years of public outages were configuration, not code.

For quotas, I'd ship small defaults, automatic increases driven by payment history and usage, a request workflow with recorded reasons and an answer within a stated time, and separate error codes for quota and capacity in every API. Capacity reservations at the on-demand rate are worth offering as soon as any instance family runs short, because they turn a support escalation into a product.

As a customer, I'd use physical zone IDs in all automation, pre-provision enough capacity in each zone to lose one without launching anything, keep recovery off global control planes, and hold a capacity reservation for whatever can't wait for the next retry.

What would change this: a provider whose customers are mostly small sites (a web host, a VPS seller) gets more from cheap single locations, good backups to a second location and fast restores than from zones it would have to charge for; a provider whose regions are leased colocation may not be able to get three independent buildings in a metro and should then say so and offer two regions instead; and a provider selling into regulated sectors will be asked for a sovereign partition before it would choose to build one.

## How to Build It

The chapter maps zones to the `facilities` of [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it), records per-account zone names, adds cells and cell assignments, extends the core `quotas` table and adds `quota_requests`, and adds a `capacity_reservation` kind to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Placement within a zone, including rejections for quota and capacity, is `placement_decisions` from [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#how-to-build-it); hosts are `hardware_assets` from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it).

```sql
-- resources.kind gains 'capacity_reservation'

ALTER TABLE regions
  ADD COLUMN partition TEXT NOT NULL DEFAULT 'commercial';  -- its own control plane and identity:
                                         -- 'commercial', 'government', 'sovereign_eu', 'china'

ALTER TABLE zones                        -- zones.id is the physical ID ('use1-az4'), never an alias
  ADD COLUMN zone_type TEXT NOT NULL DEFAULT 'availability_zone'
    CHECK (zone_type IN ('availability_zone', 'local_zone', 'edge_zone', 'single_site')),
  ADD COLUMN parent_zone_id TEXT REFERENCES zones (id),     -- a local zone's parent zone
  ADD CONSTRAINT zones_local_parent CHECK ((zone_type = 'local_zone') = (parent_zone_id IS NOT NULL));

CREATE TABLE zone_facilities (           -- which buildings make up a zone, over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  zone_id       TEXT NOT NULL REFERENCES zones (id),
  facility_id   UUID NOT NULL REFERENCES facilities (id),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (facility_id WITH =, valid_during WITH &&)  -- a building is in one zone
);

CREATE TABLE zone_aliases (              -- the name each account sees for each physical zone
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  region_id     TEXT NOT NULL REFERENCES regions (id),
  alias         TEXT NOT NULL,           -- 'us-east-1a', logical zone '1', 'Uocm:PHX-AD-1'
  zone_id       TEXT NOT NULL REFERENCES zones (id),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, region_id WITH =, alias WITH =, valid_during WITH &&),
  EXCLUDE USING GIST (account_id WITH =, zone_id WITH =, valid_during WITH &&)
);

CREATE TABLE cells (                     -- a complete, independent copy of one service
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  service          TEXT NOT NULL,        -- 'object_index', 'vm_control', 'dns_edge'
  code             TEXT NOT NULL,        -- 'use1-objidx-007'
  region_id        TEXT REFERENCES regions (id),   -- null: a global service's cell
  zone_id          TEXT REFERENCES zones (id),     -- set for zonal cells
  max_partitions   INT NOT NULL,         -- the tested ceiling: accounts, resources or keys
  deploy_wave      SMALLINT NOT NULL,    -- order in staged rollouts of code and configuration
  state            TEXT NOT NULL CHECK (state IN ('provisioning', 'active', 'closed_to_new',
                     'draining', 'retired')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service, code),
  CHECK (zone_id IS NULL OR region_id IS NOT NULL)
);

CREATE TABLE cell_assignments (          -- which partition key a cell served, over time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  service          TEXT NOT NULL,
  partition_kind   TEXT NOT NULL CHECK (partition_kind IN ('account', 'project', 'resource')),
  partition_key    TEXT NOT NULL,        -- the account, project or resource id
  account_id       UUID NOT NULL REFERENCES accounts (id),
  cell_id          UUID NOT NULL REFERENCES cells (id),
  mode             TEXT NOT NULL CHECK (mode IN ('cell', 'shuffle_shard')),
  assigned_during  TSTZRANGE NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('initial', 'rebalance', 'migration',
                     'isolation', 'drain')),
  EXCLUDE USING GIST (service WITH =, partition_key WITH =, assigned_during WITH &&)
    WHERE (mode = 'cell')                -- one cell per key at a time; a shuffle shard has several
);

CREATE TABLE quota_requests (            -- every increase asked for, and what was decided
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID REFERENCES projects (id),
  quota_code       TEXT NOT NULL,
  region_id        TEXT REFERENCES regions (id),
  zone_id          TEXT REFERENCES zones (id),
  current_value    NUMERIC NOT NULL,     -- the effective limit when asked
  requested_value  NUMERIC NOT NULL CHECK (requested_value > 0),
  justification    TEXT,
  origin           TEXT NOT NULL CHECK (origin IN ('customer', 'auto_adjuster', 'sales',
                     'support')),
  status           TEXT NOT NULL CHECK (status IN ('submitted', 'in_review', 'approved',
                     'partially_approved', 'denied', 'cancelled')),
  granted_value    NUMERIC,
  decided_by       TEXT,                 -- typed actor: 'system:quota_rules@v12', a reviewer
  decision_reason  TEXT,                 -- 'payment_history', 'capacity', 'risk_score', 'prepay'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at       TIMESTAMPTZ,
  CHECK ((status IN ('approved', 'partially_approved')) = (granted_value IS NOT NULL)),
  CHECK (status <> 'partially_approved' OR granted_value < requested_value)
);

ALTER TABLE quotas                       -- zonal quotas: the core table's zone_id
  ADD COLUMN quota_type TEXT NOT NULL DEFAULT 'allocation'
    CHECK (quota_type IN ('allocation', 'rate', 'concurrent')),
  ADD COLUMN adjustable BOOLEAN NOT NULL DEFAULT TRUE,     -- false: a system limit
  ADD COLUMN quota_request_id UUID REFERENCES quota_requests (id);  -- the request it granted
-- The core exclusion constraint includes zone_id, so a zonal row doesn't collide with its
-- region's.

CREATE TABLE capacity_reservations (     -- side table: kind = 'capacity_reservation'
  resource_id       UUID PRIMARY KEY REFERENCES resources (id),   -- region and zone on resources
  instance_type     TEXT NOT NULL,
  platform          TEXT NOT NULL,       -- must match the image's platform to be consumed
  quantity          INT NOT NULL CHECK (quantity > 0),
  match_mode        TEXT NOT NULL CHECK (match_mode IN ('open', 'targeted')),
  starts_at         TIMESTAMPTZ NOT NULL,
  committed_until   TIMESTAMPTZ,         -- future-dated reservations; null: cancel any time
  state             TEXT NOT NULL CHECK (state IN ('assessing', 'scheduled', 'pending',
                      'active', 'expired', 'cancelled', 'failed',
                      'queued', 'undelivered'))  -- the last two: GPU pools, GPU & AI Clouds
);

-- usage_events.meter added by this chapter:
--   'capacity.reserved_unused_seconds'  reserved instances not running, billed at the
--                                       instance's on-demand SKU; {"instance_type": ...}
```

Notes on the sketch:

- **A zone is a set of buildings, and the set changes.** `zone_facilities` is effective-dated so a new building joining a zone, or a hall moving between zones, is history rather than an edit, and the exclusion constraint makes it impossible for one building to be in two zones at once. "Do any two zones in this region share a facility, a power utility or a fiber path?" becomes a join from zones to facilities and their contracts, the shared-fate audit a provider should run before calling two zones independent.
- **Physical IDs are the truth; names are per account.** `zones.id` is the physical identifier and `zone_aliases` holds what each account sees, so an incident affecting `use1-az4` resolves to every account's own name for it, and a customer's automation can be checked for aliases that point at a constrained zone.
- **Cells are assignments with history.** `cell_assignments` answers "which customers were in cell 7 between 14:02 and 15:10," which is the list for incident notices and SLA credits. Shuffle shards are several active rows per key with `mode = 'shuffle_shard'`; cells are one, enforced by the partial exclusion constraint. `deploy_wave` makes the rollout order of code and configuration data, not convention.
- **Quota decisions have reasons.** Each request records who or what decided, from what limit, to what, and why; an auto-adjuster's increase is a request with origin `auto_adjuster`. The granted limit is a new `quotas` row with source `applied` and the request's id, so the effective limit at any instant is still the most specific row in force, per the core model. Zonal quotas use the core table's `zone_id`, which its exclusion constraint includes.
- **Quota and capacity stay separate.** Quota lives in `quotas`; capacity shortfalls are `placement_decisions` with outcome `rejected_infeasible`; reservations are resources that count against quota and bill at the on-demand rate while unused. The `platform` column exists because a reservation only matches instances whose image platform matches it exactly.
- **Events:** `zone.status_changed` (to and from `constrained`), `zone.facility_added`, `cell.provisioned`, `cell.draining`, `cell.assignment_moved`, `quota.requested`, `quota.decided`, `quota.changed` (the core event), `capacity_reservation.activated`, `capacity_reservation.failed` and `capacity.insufficient` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the status page, notifications, capacity planning, sales and the fraud team.

## Auditing

- **What each zone was made of.** The facilities in every zone over time, with their operators and power and fiber contracts, because a claim that two zones are independent is checked against buildings and utilities, not names.
- **Which customers were where.** Cell and shuffle-shard assignments and per-account zone aliases over time, so the customers affected by an incident in one cell or one physical zone can be listed exactly for notices and credits.
- **Every quota decision.** Requests, outcomes, reasons and the actor or rule version that decided, because quotas ration scarce hardware and screen for fraud, and refusals are disputed ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Capacity refusals.** Insufficient-capacity rejections by zone and instance type, which are the evidence for capacity purchases and for any reservation SLA claim.
- **Configuration rollouts by cell.** Which configuration version reached which cell, zone and region when, since configuration pushes, not hardware, caused the widest outages on record ([Incident Response](/docs/operations/incident-response#the-postmortem)).

## What This Means for the System You Build

- **Name the boundaries you actually have:** one location, fault domains, zones or regions, and never sell one as another.
- **Use physical zone IDs internally and in incident notices,** and keep per-account names as aliases.
- **Keep control planes regional and data planes statically stable,** and keep every recovery path off global control planes.
- **Put per-customer services in cells** with a tested maximum size, at least two from the start, and record every assignment.
- **Shuffle-shard endpoints that take arbitrary customer traffic,** like DNS and API front doors.
- **Roll out configuration by cell, zone and region** with bake time and a kill switch, as carefully as code.
- **Return different errors for quota and capacity,** record every quota decision with its reason, and sell capacity reservations when a family runs short.

## References

**Papers and standards**

- [Brooker, Chen and Ping: Millions of Tiny Databases](https://www.usenix.org/conference/nsdi20/presentation/brooker), NSDI 2020, Physalia as EBS's configuration master, built from 2013
- [AWS Well-Architected: Reducing the Scope of Impact with Cell-Based Architecture](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html), September 20, 2023, and a decade of cells at AWS
- [AWS Well-Architected: What is a cell-based architecture?](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/what-is-a-cell-based-architecture.html), partition keys, the cell router and the 10-cell arithmetic
- [AWS Well-Architected: Cell sizing](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/cell-sizing.html), maximum cell size and the tradeoffs
- [AWS Whitepaper: Availability Zones](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html), what an Availability Zone is and how far apart
- [AWS Whitepaper: Control planes and data planes](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/control-planes-and-data-planes.html), definitions and relative failure rates
- [AWS Whitepaper: Static stability](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/static-stability.html), the definition and the EC2 example
- [AWS Whitepaper: Global services](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html), single-Region control planes and the recovery-path recommendations
- [Microsoft Learn: Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp), stamps, routing and their costs

**Provider documentation**

- [AWS: Global infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/), Regions, Availability Zones, Local Zones, Wavelength Zones and points of presence
- [AWS: Availability Zones](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html), AZ IDs, per-account mapping before November 2025 and constrained zones
- [AWS: Local Zones](https://aws.amazon.com/about-aws/global-infrastructure/localzones/), Local Zones as extensions of core services to metros
- [AWS: What is Service Quotas?](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html), default and applied quotas, request outcomes and global quotas
- [AWS: Amazon EC2 instance type quotas](https://docs.aws.amazon.com/ec2/latest/instancetypes/ec2-instance-quotas.html), default vCPU quotas by family and automatic increases
- [AWS: Troubleshoot Amazon EC2 instance launch issues](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/troubleshooting-launch.html), `InstanceLimitExceeded` and `InsufficientInstanceCapacity`
- [AWS: EC2 On-Demand Capacity Reservations](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html), scope, billing, quotas and limitations
- [Microsoft Azure: Products available by region](https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/table), "70+ announced regions"
- [Microsoft Learn: What are Azure availability zones?](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview), datacenters, distance, logical-to-physical mapping, update sequencing and zone-enabled regions
- [Microsoft Learn: vCPU quotas](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas), regional and family quotas and quota versus capacity
- [Microsoft Learn: On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview), pricing, SLA, supported series and limitations
- [Google Cloud: Locations](https://cloud.google.com/about/locations), regions, zones, edge locations and the three single-site exceptions
- [Google Cloud: Regions and zones](https://docs.cloud.google.com/compute/docs/regions-zones), zones, AI zones and resource scope
- [Google Cloud: Quotas overview](https://docs.cloud.google.com/docs/quotas/overview), quota types, scope, adjustments, the quota adjuster and system limits
- [Google Cloud: Troubleshooting resource availability errors](https://docs.cloud.google.com/compute/docs/troubleshooting/troubleshooting-resource-availability), `ZONE_RESOURCE_POOL_EXHAUSTED` and remedies
- [Oracle: Regions and availability domains](https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm), availability and fault domains, per-tenancy randomization and realms
- [DigitalOcean: Regional availability](https://docs.digitalocean.com/platform/regional-availability/), datacenters and regions
- [Hetzner Docs: Locations](https://docs.hetzner.com/cloud/general/locations/), locations, owned parks and network zones
- [Hetzner Docs: Cloud server FAQ](https://docs.hetzner.com/cloud/servers/faq/), the resource limit and the condition for raising it
- [OVHcloud: Regions](https://www.ovhcloud.com/en/about-us/global-infrastructure/regions/), 1-AZ and 3-AZ regions, Local Zones and SecNumCloud
- [Akamai: Distributed compute regions](https://techdocs.akamai.com/cloud-computing/docs/distributed-compute-regions), core versus distributed regions and their limits
- [Cloudflare: Network](https://www.cloudflare.com/network/), 348 cities and 8 regions
- [Vultr: Data center regions](https://www.vultr.com/features/datacenter-regions/), 34 cloud data center regions in 34 cities (viewed October 27, 2026)

**Announcements and release notes**

- [AWS: Announcing Elastic IP Addresses and Availability Zones for Amazon EC2](https://aws.amazon.com/about-aws/whats-new/2008/03/26/announcing-elastic-ip-addresses-and-availability-zones-for-amazon-ec2), March 26, 2008
- [Werner Vogels: On the Road to Highly Available EC2 Applications](https://www.allthingsdistributed.com/2008/03/on_the_road_to_highly_availabl.html), March 27, 2008
- [InfoQ: Azure Availability Zones generally available](https://www.infoq.com/news/2018/04/azure-availability-zones-ga), April 7, 2018, regions and the 99.99% VM SLA
- [Mike Furr: Static stability using Availability Zones](https://builder.aws.com/content/3K9SiqiJ369TGkkGzqPM95BuYWI/static-stability-using-availability-zones), December 5, 2019, Amazon Builders' Library
- [Amazon Builders' Library: Workload isolation using shuffle sharding](https://builder.aws.com/content/3F06NpJ8YeoIGP8VHTw4n81pFn8/workload-isolation-using-shuffle-sharding), December 5, 2019, Amazon Builders' Library
- [AWS News Blog: Opening the AWS European Sovereign Cloud](https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/), January 14, 2026

**In practice**

- [AWS: Summary of the Amazon EC2 and Amazon RDS service disruption](https://aws.amazon.com/message/65648/), April 2011
- [AWS: Summary of the Amazon S3 service disruption](https://aws.amazon.com/message/41926/), February 28, 2017
- [AWS: Summary of the AWS service event in us-east-1](https://aws.amazon.com/message/12721/), December 7, 2021
- [AWS: Summary of the DynamoDB and EC2 service disruption in us-east-1](https://aws.amazon.com/message/101925/), October 19 and 20, 2025
- [Google Cloud: Service Control incident report](https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW), June 12, 2025
- [Microsoft Azure: Azure Front Door post-incident review, YKYN-BWZ](https://azure.status.microsoft/en-us/status/history/?trackingId=YKYN-BWZ), October 29 and 30, 2025
- [Cloudflare: Post-mortem on the control plane and analytics outage](https://blog.cloudflare.com/post-mortem-on-cloudflare-control-plane-and-analytics-outage/), November 4, 2023
- [Cloudflare: Service outage on June 12, 2025](https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/), Workers KV and its third-party storage dependency
- [Slack Engineering: Slack's migration to a cellular architecture](https://slack.engineering/slacks-migration-to-a-cellular-architecture/), August 22, 2023, zones as drainable cells
