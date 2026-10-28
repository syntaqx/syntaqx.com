+++
title = "Provider Architecture"
description = "How a provider's parts fit: control and data planes, provisioning, cells and blast radius, metering, billing, support and abuse, and public scale figures."
category = "Hosting & Cloud Industry"
order = 2206
part = "Running the Provider"
tags = ["architecture", "control-plane", "cells", "provisioning", "metering"]
+++

Every earlier chapter in this volume describes one part of a provider: a hypervisor, a registry connection, a rating engine, an abuse desk. This chapter puts them back together. A provider, at any size, is two systems sharing one set of records. One is the **data plane**: the running machines, volumes, buckets, DNS answers, proxies and message pipes customers pay for. The other is the **control plane**: the API that creates, changes and deletes those things, and the workflows, inventory, quotas, metering, billing, support tools and abuse tooling behind it. Customers see the first and talk to the second; almost every large public outage of the last fifteen years started in the second and spread to the first.

The shape is the same for a web host and a hyperscaler. A shared host's control plane is the panel, the billing system and the provisioning scripts between them; its data plane is Apache, PHP-FPM, MySQL and Exim on each server. A cloud's control plane is hundreds of regional services behind one API; its data plane is hosts, fabrics and storage nodes in each zone. The difference is scale and the number of things that can go wrong at once. This chapter maps the parts, shows what public write-ups say about how the largest providers build them (control and data planes, static stability, cells, shuffle sharding, constant work, long-running operations), gives the scale numbers providers have published, and ends with how the tables from every other chapter fit together on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

The general engineering belongs to the playbook, and this chapter links it rather than restating it: [Service Boundaries](/docs/architecture/service-boundaries) for when to split a system, [Multi-Tenancy](/docs/architecture/multi-tenancy) for isolation models and noisy neighbors, [Long-Running Operations](/docs/requests/long-running-operations) for the operation resource, [Retries & Timeouts](/docs/architecture/retries-and-timeouts) and [Admission Control](/docs/architecture/admission-control) for load, [Events & Async Messaging](/docs/architecture/events) for the outbox, and [Disaster Recovery](/docs/operations/disaster-recovery) for regions and restores. What happens when it fails is [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages).

## How the Providers Do It

Few providers publish their internals. What is public comes from whitepapers, conference papers, builder essays and post-mortems, and it is most complete for AWS, Google and Cloudflare:

| Provider | What is public about its architecture | Where it shows |
| --- | --- | --- |
| **AWS** | Services split into a regional control plane and zonal or global data planes; **static stability** as a design rule; cell-based architecture and shuffle sharding as published guidance; Physalia, a key-value store for control-plane configuration; Nitro moving virtualization to dedicated cards; Firecracker microVMs under Lambda and Fargate | The Fault Isolation Boundaries whitepaper, the Builders' Library, NSDI 2020 papers, post-event summaries |
| **Google Cloud** | Borg as the cluster manager; Service Control as the API policy and quota check every request passes; quota metadata held in Spanner and replicated globally | The Borg paper (EuroSys 2015) and the June 12, 2025 incident report |
| **Microsoft Azure** | Azure Resource Manager receives every request from the portal, CLI, SDKs and APIs, authenticates and authorizes it, and forwards it to the resource provider; a separate instance per region; Azure Front Door's control plane generating configuration metadata its data plane consumes | Resource Manager documentation; the Front Door post-incident review of October 2025 |
| **Cloudflare** | A global data plane (the proxy, Workers, DNS) on one network; control plane and analytics services in core data centers, moved toward high availability after a facility power loss in November 2023 | Its post-mortems |
| **OpenStack clouds** | Nova (compute), Swift (object storage) and the other projects as an open-source control plane a provider installs | Project documentation; launched by Rackspace and NASA in July 2010 |
| **Kubernetes-based platforms** | A declarative API server with controllers that reconcile desired against current state; used as the control plane for clusters, and through Crossplane for cloud resources | Kubernetes documentation; [Kubernetes as the Control Plane](/books/hosting-and-cloud/terraform-and-opentofu#kubernetes-as-the-control-plane-crossplane-and-ack) |
| **Web hosts on panels** | The control panel and its API as the control plane; per-server daemons as the data plane; billing systems calling the panel to create, suspend and terminate accounts | Panel documentation; [Before Plans](/books/hosting-and-cloud/terraform-and-opentofu#before-plans-scripts-against-a-panel-api) |

Three patterns run through the table:

- **The control plane fails more often, so the data plane must not depend on it.** AWS says so outright, and the post-mortems in the next part of this volume are mostly control-plane failures that reached the data plane through a dependency nobody had drawn.
- **Blast radius is designed, not discovered.** Regions, zones, cells and shuffle shards are all ways to make sure one bad deploy, one bad customer or one bad host reaches a known fraction of the fleet.
- **Configuration is the riskiest thing a control plane ships.** Code goes out through canaries; configuration, quota policy and threat rules often go everywhere at once. The 2025 outages at Google, Azure and Cloudflare were all configuration or metadata pushed globally ([The Global-Config Failure Pattern](/books/hosting-and-cloud/outages-and-status-pages#the-global-config-failure-pattern)).

## How Provider Architecture Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Mar 13 and Aug 25, 2006 | Amazon S3, then EC2 in beta | Storage and machines as API calls, billed by use | A control plane every customer talks to directly, with its quotas and limits |
| Jul 19, 2010 | OpenStack launched by Rackspace and NASA, from Rackspace's Cloud Files and Cloud Servers code and NASA's Nebula | An open control plane other providers could run | Integration and upgrade work at every operator |
| Apr 21 to 24, 2011 | AWS EBS event in US East: a network change in one zone, a re-mirroring storm, and a regional control plane starved of threads | Showed that a regional control plane could carry one zone's failure to the others | A design goal stated in the summary: make zones "indistinguishable from completely independent" |
| 2013 | Physalia started as the configuration master for EBS | Control-plane state that stays available for the keys each client needs | A purpose-built database |
| Jun 10, 2014 | Kubernetes announced | Declarative desired state reconciled by controllers | A new operational surface (the Kubernetes part) |
| 2015 | "Large-scale cluster management at Google with Borg" (EuroSys) | Public account of admission control, packing and over-commitment at fleet scale | |
| Nov 6, 2017 | Nitro-based C5 instances | Virtualization and I/O on dedicated cards, no operator shell on the host | Custom hardware |
| Feb 2020 | Firecracker and Physalia papers at NSDI | MicroVM isolation per function; control-plane storage design made public | |
| Feb 18, 2021 | "Reliability, constant work, and a good cup of coffee" | Systems that do the same work under stress as at rest | Work spent when nothing changes |
| Nov 2 to 4, 2023 | Cloudflare's control plane and analytics lose a core facility for about 40 hours; the data plane keeps serving | Showed services that existed in only one facility | A program to make the control plane highly available |
| 2025 | DynamoDB DNS race (AWS, October), Service Control quota policy (Google, June), Front Door metadata (Azure, October), Bot Management feature file (Cloudflare, November) | Each post-mortem named a control-plane path that reached the data plane | Remediations: fail open, flags off by default, staged config, velocity limits |

## The Parts and How They Fit

A provider has the same components whatever it sells. The table maps each one to what it owns, the tables this volume gives it and the chapter that owns them:

| Component | What it does | Tables | Chapters |
| --- | --- | --- | --- |
| **Identity and accounts** | Who the customer is, who may act for it, and its standing | `accounts`, `projects`, `account_holds`, organizations, members, roles, `api_credentials` | [The Hosting & Cloud Business](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it) |
| **Front door** | Authenticates, authorizes, rate-limits and checks quota on every API call | `quotas`, the request log; `control_plane_operations` below | This chapter; Regions, Zones, Cells & Quotas |
| **Catalog** | What can be bought, at what price, under which plan | `products`, `skus`, `price_versions`, `plans`, `plan_versions` | Core; Pricing Catalogs |
| **Provisioning** | Turns an accepted request into a running thing: placement, workflows, state | `resources` and side tables, `resource_identifiers`, `deployments`, `iac_states` | The Stack, Bottom to Top; [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it); [Provisioning: Terraform](/books/hosting-and-cloud/terraform-and-opentofu#how-to-build-it) |
| **Capacity** | What can be promised in each zone, cell and fabric | Cells and cell assignments; `gpu_capacity_pools`, `gpu_reservations` | Regions, Zones, Cells & Quotas; [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#how-to-build-it) |
| **Data plane** | The running thing: hosts, fabrics, storage, proxies, DNS, carriers | Side tables per kind; nothing in the hot path reads the control plane's database | Every layer chapter |
| **Metering** | Emits what each resource did, idempotently, in event time | `usage_events` | Core; Metering & Rating |
| **Rating and billing** | Prices usage, applies credits and commitments, issues invoices, collects | `rated_usage`, `credit_grants`, `commitments`, invoices and payments | Core; the Metering and Billing part; the [Payments](/books/payments/card-payments) volume |
| **Managed services** | Databases, queues, observability run as products on the same planes | `databases`, `caches`, `edge_stores`, `message_brokers`, `queues`, `topics`, `ingest_rules` | The Managed Services part |
| **Delivery for customers** | Pipelines, runners, registries, images and state the provider hosts | `ci_pipelines`, `runners`, `ci_runs`, `artifact_registries`, `image_builds`, `iac_runs` | The Deployment, CI/CD Platforms and Infrastructure as Code parts |
| **Support** | Tickets, delegated access to customer resources, credits | Tickets; support sessions; `credit_grants` of kind `goodwill` | [Customer Support](/docs/operations/customer-support), [Support Access](/docs/security/support-access) |
| **Trust and abuse** | Reports, cases, mitigations, holds, fraud signals, legal requests | `moderation_cases`, `reports`, `abuse_mitigations`, `account_holds` | The Abuse, Trust and the Law part; [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) |
| **Operations** | Status, incidents, metrics, sunsets | `status_components`, `incidents`, `metric_definitions`, `product_sunsets`, `data_exports` | [Outages](/books/hosting-and-cloud/outages-and-status-pages#how-to-build-it), [Operating Metrics](/books/hosting-and-cloud/operating-metrics#how-to-build-it), [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life#how-to-build-it) |

The joins that matter run through four keys. **`account_id`** connects every row to the tenant who pays and the standing that governs it. **`resource_id`** connects usage, abuse cases, incidents, identifiers and exports to the thing that ran. **`sku_id`** connects usage to price and price to the invoice. **Time ranges** (`exists_during`, `held_during`, `valid_during`) connect all of them to the instant a report, a bill or a court asks about. A provider that keeps those four consistent can answer "who ran what, where, when, at what price, under which terms" from one database; one that doesn't answers it by asking five teams.

## Control Plane and Data Plane

AWS's whitepaper on fault isolation gives the industry's working definitions. Control planes "provide the administrative APIs used to create, read/describe, update, delete, and list (CRUDL) resources": launching an instance means finding a host with capacity, allocating network interfaces, preparing a volume, generating credentials and adding security group rules, and "control planes tend to be complicated orchestration and aggregation systems." The data plane "is what provides the primary function of the service": the running instance, reads and writes to a volume, objects in a bucket, DNS answers. Data planes "are intentionally less complicated," which makes failures "statistically less likely to occur in the data plane versus the control plane."

From that follows **static stability**: systems "continue to operate as normal without the need to make changes during the failure or unavailability of dependencies." A launched EC2 instance "does not depend on any control plane APIs in order to stay running, or to start running again after a reboot," and the same holds for VPCs, buckets and volumes. The recovery advice is the same rule applied by customers: pre-provision the capacity to survive losing a zone rather than counting on launching it during the event, because "the most reliable recovery and mitigation mechanisms are the ones that require the fewest changes."

What this means for any provider, at any size:

- **The data plane holds its last good configuration.** A proxy, a DNS server or a hypervisor that can't reach the control plane keeps serving with what it has. It never blocks on a fetch to serve a request, and it never treats "no configuration" as "configuration that says do nothing."
- **No circular dependencies on the recovery path.** The 2025 AWS event is the case: EC2's host-management workflow depended on DynamoDB, so DynamoDB's outage stopped EC2 launches even after DynamoDB recovered, because the workflow had fallen into "congestive collapse" with no established recovery procedure. The dependency graph has to be drawn, and the recovery path tested with its dependencies down.
- **A web host has the same split.** The panel, billing and provisioning scripts are the control plane; the web, PHP, database and mail daemons are the data plane. A billing outage must not suspend sites, and a panel upgrade must not restart them.

The 2011 EBS event is the original public lesson. A mis-executed network change in one zone isolated storage nodes, which then tried to re-mirror at once; slow requests from that zone "resulted in thread starvation in the EBS control plane," which is regional, and it "began to fail API requests for other Availability Zones in that Region as well." The fixes named in the summary are the ones every provider since has had to learn: timeouts so one slow zone can't exhaust shared threads, zone-aware load shedding, and moving functions into per-cluster services in the same zone as the cluster they serve.

## Provisioning: From Request to Running Thing

A create request crosses the same steps at every provider:

1. **Authenticate and authorize** the credential and its role on the project ([Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys)).
2. **Check standing and quota.** An account hold of `no_new_resources` or stronger, or a quota at its limit, refuses the request before any work starts. Google's Service Control is this step as a shared service: the API policy and quota check every Google Cloud request passes, which is why its failure in June 2025 took down so much at once.
3. **Accept idempotently.** The request carries a client key; a retry with the same key returns the same resource rather than a twin (`resources.create_idempotency_key`, from [Provisioning: Terraform](/books/hosting-and-cloud/terraform-and-opentofu#generated-providers-and-what-a-provider-api-must-expose)).
4. **Return an operation.** Anything slower than a few seconds returns an operation the client polls. Google's AIP-151 gives the shape: an operation with a `name`, a `done` flag, `metadata` for progress and either a `response` or an `error`; its rule of thumb is to use one for methods that may take more than 10 seconds, and to let operations expire after about 30 days. The resource itself appears in list and get immediately, in a provisioning state ([Long-Running Operations](/docs/requests/long-running-operations#the-operation-resource)).
5. **Place.** A scheduler picks a zone, a cell and a host with capacity for the type, honoring placement groups, reservations and quotas.
6. **Run the workflow.** Allocate the volume, the interface, the address; program the fabric; boot. Each step is retryable and records its result, so a crashed workflow resumes rather than restarts.
7. **Converge and report.** The resource moves to `active`; `resource.provisioned` and `identifier.assigned` go through the outbox; metering starts.

Two models compete for step 6. The **workflow** model runs an explicit sequence with compensation on failure. The **reconciliation** model, which Kubernetes made familiar, declares desired state and lets controllers "move the current cluster state closer to the desired state," like a thermostat; it survives crashes and drift by design but makes "done" a question of observing convergence. Large providers use both: workflows for the create, controllers for keeping things as declared.

A third pattern, **constant work**, appears where reliability matters more than efficiency. AWS's Builders' Library describes Route 53 health checkers sending fixed-size result tables, padded to maximum capacity, to DNS servers every few seconds, and Hyperplane nodes reloading a configuration file from S3 every few seconds whether or not anything changed, a file that "is still as big as it will ever be." A failure changes which answers are chosen, not how much work is done, so the system has no mode that only appears during an incident. The cost is waste, which is why the same essay says elastic scaling is a better fit for compute that halves off-peak.

## Cells, Shards and Blast Radius

Regions and zones are failure domains the provider sells. Cells are failure domains it builds inside them. AWS's Well-Architected guidance describes the pattern: the workload is "partitioned by a partition key" that aligns with the service's grain ("customer ID, resource ID"); a cell "is independent, does not share state with other cells, and handles a subset of the overall workload"; a cell router, "the thinnest possible layer," sends each request to its cell; and a control plane provisions, deprovisions and migrates cells. "If a workload uses 10 cells to service 100 requests, when a failure occurs in one cell, 90% of the overall requests would be unaffected." Cells also contain the failures that are hardest to stop otherwise: a bad deploy rolled cell by cell, and "poison pill requests."

**Shuffle sharding** goes further. Instead of assigning each customer to one shard, it assigns each to a random combination of workers, so two customers rarely share all of them. AWS's example: eight workers in shards of two gives 28 combinations, so one bad customer affects about 1 in 28 others rather than 1 in 4 with plain sharding. Route 53 uses 2,048 virtual name servers with four per domain, about 730 billion possible shards.

**Physalia** applies the same idea to control-plane state. It is "a transactional key-value store, optimized for use in large-scale cloud control planes," started in 2013 as "the configuration master" for EBS, and offers "both high availability and strong consistency to millions of clients" by being "extremely available for only the keys it knows each client needs," rather than for every key at once.

What a provider takes from these:

- **Partition by account.** The account is the grain of billing, quotas, holds and abuse, so it is the natural partition key for control-plane state and for usage. Large accounts may need their own cells; the router keeps the mapping.
- **Deploy by cell, then by zone, then by region,** with bake time between, and make configuration follow the same path as code.
- **Keep the router dumb.** A router that does anything but map a key to a cell becomes the single point of failure the cells were meant to remove.
- **Put limits per cell on what one tenant can do,** the [noisy neighbor](/docs/architecture/multi-tenancy#noisy-neighbors) rule enforced where it can't spread.

## The Metering Pipeline

Metering is the seam between the data plane and money. Every data-plane component emits usage: hypervisors emit instance-seconds, storage nodes emit gigabyte-hours and requests, edges emit bytes by direction and region, gateways emit messages and segments, model servers emit tokens. Those records travel through collectors into `usage_events`, and rating prices them into `rated_usage` (the core model's [usage tables](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time); Metering & Rating owns the depth).

The architecture rules come from where the pipeline sits:

- **The data plane emits, never waits.** A hypervisor that can't reach the collector buffers locally and sends later; it never stops a VM because the meter is down. Usage is late more often than lost, so rating runs in event time and late events become adjustments on the next invoice.
- **Idempotent at every hop.** Each event carries the producer's key, unique per source, so replays and double-sends from collectors are no-ops ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Usage feeds controls, with a lag.** Spend caps, budgets, free-tier limits and fraud detection all read the same stream, and the delay shows in the providers' own documentation: Vercel checks usage "every few minutes" before acting on a budget ([Spend Caps and Pauses](/books/hosting-and-cloud/paas-and-frontend-clouds#spend-caps-and-pauses)). A design that promises a hard cap has to state its lag.
- **Reconcile against the data plane.** A daily count of running resources by kind, compared with the resources that emitted usage for the day, finds silent meters before customers find free compute.

## Billing, Support and Abuse on the Same Records

The components customers meet after the API are consumers of the same records:

- **Billing reads usage and writes holds.** An unpaid invoice adds an `account_holds` row; provisioning reads holds at the front door; a `stop_resources` hold fans out to the data plane as stop operations through the same workflow engine a customer's stop uses, never as a side channel ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)).
- **Support acts through the control plane.** A support engineer's action on a customer resource is a delegated, logged operation with a reason ([Support Access](/docs/security/support-access#delegation-not-impersonation)), not a shell on the host. Nitro, whose design AWS says "eliminates the possibility of administrator access to an EC2 server," is the extreme form.
- **Abuse resolves through identifiers.** A report names an IP, a hostname or a number at an instant; `resource_identifiers` resolves it to a resource and an account; the narrowest mitigation is applied through the control plane, and only then, if needed, a hold ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)).
- **Operations read everything.** Status components map to products and regions, incidents list the resources and accounts affected, and operating metrics are queries over usage, invoices and holds.

## Scale Numbers From Public Write-Ups

| System | Figure | As of | Source |
| --- | --- | --- | --- |
| Amazon S3 | "More than 500 trillion objects," "more than 200 million requests per second globally," "hundreds of exabytes" | March 2026 | AWS News Blog, twenty years of S3 |
| AWS footprint | 39 Regions and 123 Availability Zones | March 2026 | Same post |
| Amazon EBS | "Over 140 trillion daily operations" | August 2024 | All Things Distributed |
| Amazon DynamoDB | Peak of 89.2 million requests per second during Prime Day 2021 | 2021 | USENIX ATC 2022 paper |
| Amazon SQS | Peak of 47.7 million messages per second during Prime Day 2021 | 2021 | AWS (see [Managed Queues & Streaming](/books/hosting-and-cloud/managed-queues-and-streaming#sqs)) |
| Lambda and Fargate on Firecracker | "Millions of production workloads, and trillions of requests per month"; up to 150 microVMs per second per host | 2020 | NSDI 2020 paper |
| Route 53 | 2,048 virtual name servers, four per domain, about 730 billion shuffle shards | Current guidance | AWS Builders' Library |
| Borg | Clusters of up to tens of thousands of machines running hundreds of thousands of jobs | 2015 | EuroSys 2015 paper |
| Cloudflare | 348 cities | October 2026 | Cloudflare network page |

The numbers are marketing as well as engineering, and they are useful for one thing: sizing the parts of a provider's own system that must not be the bottleneck. A metering pipeline for a fleet a thousandth of S3's still has to absorb replays and backfills at many times its steady rate; a control plane must still survive every client retrying at once after an outage, which is the herd effect that slowed Google's largest region in June 2025.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Own control plane, built in house** | Service-per-resource behind one API, regional, cell-partitioned | Fits the product exactly; cells and static stability designed in | Years of work; every outage is yours to find | Yours | Hyperscalers, developer clouds, large PaaS and edge networks |
| **OpenStack** | Open-source services (compute, storage, network, identity) installed by the operator | A full IaaS control plane without writing one | Integration and upgrades across many projects; the operator owns every failure | Open source, foundation-governed; launched by Rackspace and NASA in 2010 | Private and regional public clouds |
| **Kubernetes as the control plane** | Declarative API and controllers; Crossplane or operators for non-cluster resources | Reconciliation, a common API shape, a large ecosystem | One API server and etcd per cluster as a shared dependency; scale limits per cluster | Open source (CNCF) | PaaS built on clusters, internal platforms |
| **Licensed panel and billing** | A control panel per server plus a billing system that drives it | Fast to launch; customers know the panel | Per-account license fees; scripted provisioning ([Before Plans](/books/hosting-and-cloud/terraform-and-opentofu#before-plans-scripts-against-a-panel-api)); the panel's roadmap is the vendor's (Control Panel Licensing & the Alternatives) | Commercial | Shared hosts and resellers |
| **Resell another provider's control plane** | White-label or wholesale on someone else's API | Nothing to build below the product | The underlay's outages, prices and terms are the customer's ([Who Resells Whom](/books/hosting-and-cloud/provider-landscape#who-resells-whom)) | Contract | PaaS on hyperscalers, registrar resellers, CPaaS resellers |

## My Default

My default for a new provider is a small control plane of its own in front of a data plane it doesn't write: KVM, standard storage and networking, or a hyperscaler's primitives, with the provider's value in the API, the catalog, metering, billing and trust. I'd build it with four rules from day one, because each is cheap at the start and nearly impossible to retrofit: the data plane is statically stable against the control plane; every create is idempotent and returns an operation; control-plane state and usage are partitioned by account so cells can come later without a migration; and configuration ships through the same staged path as code, with a kill switch.

I'd pick OpenStack only for a provider whose product is private or sovereign IaaS and who can staff its upgrades, and Kubernetes as the control plane where the product is containers anyway. What would change this: a provider whose whole product is one resource kind at very large scale (an object store, a DNS service) should design cells and constant-work propagation before anything else, because at that scale the blast radius is the product.

## How to Build It

The Extended-by table in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) lists every chapter's tables; the component map above shows how they group. This chapter adds what holds them together: partitioning of the two largest tables by account, and the control plane's own record of operations.

```sql
-- Partition usage and resources by account, so cells can follow later -------
-- usage_events grows fastest; partition by time for retention, then by account
-- hash so one large account doesn't make every partition hot. The unique key
-- must include the partition columns.

CREATE TABLE usage_events_partitioned (LIKE usage_events INCLUDING DEFAULTS)
  PARTITION BY RANGE (received_at);

CREATE TABLE usage_events_2026_10 PARTITION OF usage_events_partitioned
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01')
  PARTITION BY HASH (account_id);

CREATE TABLE usage_events_2026_10_h0 PARTITION OF usage_events_2026_10
  FOR VALUES WITH (MODULUS 16, REMAINDER 0);
-- ... remainders 1 to 15, created ahead of the month by a scheduled job

ALTER TABLE usage_events_partitioned
  ADD PRIMARY KEY (id, received_at, account_id),
  ADD UNIQUE (source, idempotency_key, received_at, account_id);
-- Idempotency across partitions: producers send events for one window together,
-- and the collector dedupes on (source, idempotency_key) before insert.

-- resources is read far more than written; hash by account only.
CREATE TABLE resources_partitioned (LIKE resources INCLUDING DEFAULTS)
  PARTITION BY HASH (account_id);

-- Which cell holds an account is the Regions, Zones, Cells & Quotas chapter's
-- cell_assignments; a partition is a storage unit, a cell is a failure domain,
-- and the mapping between them is deliberate, not equal by accident.

-- The control plane's record of what it was asked to do ---------------------

CREATE TABLE control_plane_operations (  -- one accepted mutating request
  id               UUID PRIMARY KEY DEFAULT uuidv7(),  -- the operation name clients poll
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID REFERENCES projects (id),
  resource_id      UUID REFERENCES resources (id),     -- set once the resource exists
  verb             TEXT NOT NULL CHECK (verb IN ('create', 'update', 'delete', 'start',
                     'stop', 'resize', 'attach', 'detach', 'suspend', 'resume')),
  resource_kind    TEXT NOT NULL,                      -- a resources.kind value
  region_id        TEXT REFERENCES regions (id),
  actor            TEXT NOT NULL,        -- typed: 'credential:<id>', 'support:<id>',
                                         -- 'system:dunning', 'system:abuse'
  reason_ref       TEXT,                 -- the hold, case, ticket or invoice behind a
                                         -- system or support action
  idempotency_key  TEXT,                 -- the client's key; a retry returns this row
  request          JSONB NOT NULL,       -- the accepted request, secrets removed
  state            TEXT NOT NULL CHECK (state IN ('accepted', 'running', 'succeeded',
                     'failed', 'cancelled')),
  error_code       TEXT,                 -- set when failed
  accepted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  UNIQUE (account_id, idempotency_key),
  CHECK ((state IN ('succeeded', 'failed', 'cancelled')) = (finished_at IS NOT NULL)),
  CHECK (state <> 'failed' OR error_code IS NOT NULL),
  CHECK (actor NOT LIKE 'system:%' OR reason_ref IS NOT NULL)
);

CREATE INDEX control_plane_operations_open
  ON control_plane_operations (region_id, state) WHERE finished_at IS NULL;
```

```sql
-- A hold fans out through the same path a customer's stop takes: every running
-- resource of the account gets a stop operation that names the hold.
INSERT INTO control_plane_operations (account_id, project_id, resource_id, verb,
  resource_kind, region_id, actor, reason_ref, idempotency_key, request, state)
SELECT r.account_id, r.project_id, r.id, 'stop', r.kind, r.region_id,
       'system:holds', h.id::text, 'hold:' || h.id || ':' || r.id, '{}', 'accepted'
FROM account_holds h
JOIN resources r ON r.account_id = h.account_id
WHERE h.id = $1
  AND h.effect IN ('stop_resources', 'full_suspension')
  AND r.state = 'active'
  AND r.kind IN ('virtual_machine', 'container_service', 'function', 'site')
ON CONFLICT (account_id, idempotency_key) DO NOTHING;   -- rerunnable
```

Notes on the sketch:

- **Operations are the audit of intent; resources are the record of fact.** A resource's state says what is; the operations against it say who asked for what, when and why, including system and support actors, which is the trail an abuse dispute, a billing complaint or a regulator needs.
- **System actions carry their reason.** The check that a `system:` actor has a `reason_ref` makes it impossible to suspend, stop or delete without naming the hold, case or invoice behind it.
- **Fan-out is idempotent.** The key `hold:<hold>:<resource>` means rerunning the fan-out after a crash creates no duplicates, and lifting the hold runs the mirror query with `resume`.
- **Partitions are not cells.** Hash partitions spread storage load; cells contain failures. Keeping the account as the key for both lets a provider move an account's partitions and its cell together later.
- **Events:** `operation.accepted`, `operation.succeeded`, `operation.failed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the customer's activity log, webhooks and the incident tooling, which watches failure rates per region and verb.

## Auditing

- **Every mutating request, with its actor and reason.** The operation log answers who created, stopped or deleted a resource, including support staff and automated systems, for as long as the resources' identifier history is kept ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Every hold's fan-out.** For a suspension, the list of operations it produced and their outcomes, so "you stopped my server" can be answered with the hold, the invoice or case, the time and the result.
- **The dependency map.** Which services each control-plane and data-plane component depends on, reviewed after every incident, because the post-mortems keep finding edges nobody drew.
- **Configuration pushes.** Every global configuration, policy or rule change with its author, its rollout stages and its kill switch, kept with the same weight as code deploys.

## What This Means for the System You Build

- **Separate the control plane from the data plane,** and make the data plane keep serving with its last good state when the control plane is down.
- **Draw the dependency graph** and keep the recovery path free of the systems it is recovering.
- **Make every create idempotent and every slow call an operation** with a name, a state, a result and an expiry.
- **Partition by account** in control-plane state and usage, so cells can be added without a migration.
- **Roll out by cell, zone and region,** with configuration on the same staged path as code and a kill switch on both.
- **Meter from the data plane without blocking it,** idempotently, in event time, and reconcile usage against what is running.
- **Route billing, support and abuse actions through the control plane** as logged operations with a reason, never as side channels.
- **Size for the herd,** not the average: replays, backfills and every client retrying at once after an outage.

## References

**Architecture guidance**

- [AWS: Control planes and data planes (Fault Isolation Boundaries whitepaper)](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/control-planes-and-data-planes.html), the CRUDL definition, launch steps, data planes intentionally less complicated
- [AWS: Static stability (Fault Isolation Boundaries whitepaper)](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/static-stability.html), the definition, the EC2 example, pre-provisioned capacity
- [AWS Well-Architected: What is a cell-based architecture?](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/what-is-a-cell-based-architecture.html), partition key, cells, the thinnest possible router, the 10-cell example, poison pills
- [AWS Builders' Library: Workload isolation using shuffle-sharding](https://builder.aws.com/content/3F06NpJ8YeoIGP8VHTw4n81pFn8/workload-isolation-using-shuffle-sharding), the 8-worker example and Route 53's 2,048 virtual name servers
- [AWS Builders' Library: Reliability, constant work, and a good cup of coffee](https://builder.aws.com/content/3F05oqNtNUWxHJ5r6L6I2HrH4rI/reliability-constant-work-and-a-good-cup-of-coffee), Route 53 health checks, Hyperplane configuration, the cost of waste, February 18, 2021
- [Google: AIP-151 Long-running operations](https://google.aip.dev/151), the operation fields, the 10-second rule of thumb, 30-day expiry
- [Kubernetes: Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), control loops and desired versus current state
- [Microsoft Learn: What is Azure Resource Manager?](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview), every request through one management layer, a separate instance per region
- [AWS: The Security Design of the AWS Nitro System](https://docs.aws.amazon.com/whitepapers/latest/security-design-of-aws-nitro-system/security-design-of-aws-nitro-system.html), Nitro Cards and hypervisor, no administrator access to EC2 servers

**Papers**

- [Brooker, Chen and Ping: Millions of Tiny Databases (NSDI 2020)](https://www.usenix.org/conference/nsdi20/presentation/brooker), Physalia, started in 2013 as the EBS configuration master
- [Agache et al.: Firecracker (NSDI 2020)](https://www.usenix.org/conference/nsdi20/presentation/agache), Lambda and Fargate workloads and request volume
- [Verma et al.: Large-scale cluster management at Google with Borg](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/), EuroSys 2015, cluster and job scale
- [Elhemali et al.: Amazon DynamoDB (USENIX ATC 2022)](https://www.usenix.org/conference/atc22/presentation/elhemali), Prime Day 2021 peak requests per second

**Post-mortems**

- [AWS: Summary of the Amazon EC2 and Amazon RDS service disruption in the US East Region](https://aws.amazon.com/message/65648/), April 2011, thread starvation in the regional EBS control plane and the stated design goal
- [AWS: Summary of the Amazon DynamoDB service disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/), October 2025, DWFM's dependency on DynamoDB and congestive collapse
- [Google Cloud: Service Health incident, June 12, 2025](https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW), Service Control as the API policy and quota check, the us-central1 herd effect
- [Cloudflare: Post-mortem on the control plane and analytics outage](https://blog.cloudflare.com/post-mortem-on-cloudflare-control-plane-and-analytics-outage/), November 2023, the data plane unaffected

**Scale and history**

- [AWS News Blog: Twenty years of Amazon S3](https://aws.amazon.com/blogs/aws/twenty-years-of-amazon-s3-and-building-whats-next/), objects, requests per second, Regions and Availability Zones, March 2026
- [All Things Distributed: Continuous reinvention, a brief history of block storage at AWS](https://www.allthingsdistributed.com/2024/08/continuous-reinvention-a-brief-history-of-block-storage-at-aws.html), EBS daily operations, August 2024
- [Cloudflare: Global network](https://www.cloudflare.com/network/), 348 cities, viewed October 27, 2026
- [Data Center Knowledge: Rackspace backs the open source cloud](https://datacenterknowledge.com/cloud/rackspace-backs-the-open-source-cloud), the OpenStack launch with Rackspace and NASA code, July 19, 2010
- [AWS: Announcing Amazon S3](https://aws.amazon.com/about-aws/whats-new/2006/03/13/announcing-amazon-s3---simple-storage-service/), March 13, 2006
- [AWS News Blog: Amazon EC2 Beta](https://aws.amazon.com/blogs/aws/amazon_ec2_beta/), August 25, 2006
- [AWS News Blog: Now available, compute-intensive C5 instances](https://aws.amazon.com/blogs/aws/now-available-compute-intensive-c5-instances-for-amazon-ec2/), the first Nitro-hypervisor instances, November 6, 2017
- [Google Open Source blog: An update on container support on Google Cloud Platform](https://opensource.googleblog.com/2014/06/an-update-on-container-support-on.html), Kubernetes announced, June 2014
