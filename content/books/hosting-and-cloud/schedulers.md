+++
title = "Schedulers: Borg to Kubernetes"
nav_title = "Schedulers"
description = "Borg, Omega and Mesos to Swarm, Kubernetes, ECS and Nomad: how the orchestrator wars ended, and how placement, packing and preemption work."
category = "Hosting & Cloud Industry"
order = 2120
part = "The Stack, Bottom to Top"
tags = ["schedulers", "history", "kubernetes", "bin-packing", "orchestration"]
+++

A cloud is a scheduler with a billing system attached. Every VM, container, function slot and build job a provider sells has to be placed on a machine that has room for it, kept running there, moved or killed when a more important workload needs the room, and accounted for the whole time. How well the provider does that decides how many machines it has to buy for a given amount of customer work, and that ratio is most of its margin. Google's Borg paper opens with the claim: Borg "achieves high utilization by combining admission control, efficient task-packing, over-commitment, and machine sharing with process-level performance isolation." Those four phrases are a hosting business in miniature.

This chapter tells how cluster scheduling went from Google's internal systems to a public product: Borg, Omega and Mesos as the published designs; Marathon, Docker Swarm, Amazon ECS, Kubernetes and Nomad as the products; the orchestrator wars of 2014 to 2019 and how they ended; and the shift from schedulers customers run to schedulers customers rent without seeing (Fargate, Cloud Run, Lambda's placement service). Then it covers how a scheduler works at the depth a provider needs: admission and quota, filtering and scoring, bin packing against spreading, priorities and preemption, overcommit, and why pooling everything into big shared clusters is cheaper. Kubernetes itself has its own part, starting with [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture) and ending with [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives); this chapter covers only how it arrived and won. Running Kubernetes well is the playbook's [Kubernetes Operations](/docs/operations/kubernetes) doc.

## How the Providers Do It

| Scheduler | What it places | How it decides | Priority and preemption | Who runs it |
| --- | --- | --- | --- | --- |
| **Borg** (Google, internal) | Tasks and allocs in cells, median about 10,000 machines | Feasibility checking, then scoring with a hybrid model that minimizes stranded resources | Non-overlapping bands (monitoring, production, batch, best effort); higher priority preempts lower | Google, for "virtually all" its cluster workloads |
| **Mesos** (Apache) | Frameworks' tasks on shared nodes | Two-level: the master offers resources, frameworks accept or reject | Left to frameworks | Retired by the Apache board in August 2025 |
| **Kubernetes** (`kube-scheduler`) | Pods on nodes | "Filtering" finds feasible nodes, "scoring" ranks them, the highest wins with ties broken at random | A `PriorityClass` maps a name to an integer; the scheduler "tries to preempt (evict) lower priority Pods" | Every major cloud as a managed service (the Kubernetes part) |
| **Nomad** (HashiCorp, IBM) | Allocations of tasks for service, batch and system jobs | Evaluations produce plans; feasibility then ranking "primarily based on bin packing"; plans applied with optimistic concurrency | Preemption for jobs at least 10 priority points lower | Self-hosted; BSL-licensed since 2023 |
| **Amazon ECS** | Tasks on the customer's EC2 instances, or on Fargate | Requirements, then binding constraints, then best-effort strategies (`binpack`, `spread`, `random`); services default to spreading across Availability Zones | None documented in placement | AWS, as a managed control plane |
| **AWS Fargate, Google Cloud Run** | One task, pod or instance on provider capacity | Hidden; the customer declares size and gets an isolated instance | Spot variants are preempted by the provider | AWS, Google |
| **AWS Lambda placement** | Function slots on a worker fleet | A Placement service that keeps CPU, memory, network and storage use "even across the fleet" in under 20 ms typically | Slots recycled within 12 hours | AWS, internal |

Three patterns run through the table:

- **Two steps, everywhere.** Borg, Kubernetes and Nomad all split placement into a filter (which machines can take this) and a score (which of those is best), because that's the only shape that scales to tens of thousands of machines and keeps policy pluggable.
- **The scheduler moved out of sight.** The products launched since 2017 (Fargate, Cloud Run, Lambda's placement service) don't expose a scheduler at all. The customer declares a size and the provider packs, which turns packing efficiency from the customer's cost into the provider's margin.
- **Kubernetes won the API, not the scheduler.** The scheduler is the least distinctive part of Kubernetes; what won was the declarative API and the controllers around it. Borg's paper already described its own master as "the kernel of a distributed system" with scheduling split off as one service among many.

## How It Got Here

### Borg, the published baseline

Google ran Borg for more than a decade before describing it in "Large-scale cluster management at Google with Borg" (Verma et al., EuroSys 2015), and by then "virtually all of Google's cluster workloads" ran on it. Its design is the vocabulary everyone after it used. A **cell** is a set of machines managed as one unit (median about 10,000 machines). A **job** is a set of identical **tasks**; an **alloc** reserves resources on a machine for one or more tasks to share. The **Borgmaster** is "logically a single process but is actually replicated five times," with state in a Paxos-based store and failover in about 10 seconds; a **Borglet** on every machine starts and stops tasks and reports state when polled. Every job has a **priority**, and **quota** decides admission before scheduling ever happens. Tasks run in a chroot and a cgroup-based resource container on a shared kernel.

**What it solved:** one pool of machines for serving and batch work, packed tightly enough to pay for itself. **What it cost:** a system only Google could run, about 230 job parameters aimed at power users, and one IP address per machine, which forced Borg to schedule ports as a resource. Its lessons became Kubernetes' design: labels instead of fixed jobs, an IP per pod, and the pod as the alloc.

### Mesos and Marathon: two-level scheduling (2011 to 2025)

Hindman and colleagues at UC Berkeley presented Mesos at NSDI 2011 as "a platform for sharing commodity clusters between multiple diverse cluster computing frameworks, such as Hadoop and MPI." Its mechanism was the **resource offer**: "Mesos decides how many resources to offer each framework, while frameworks decide which resources to accept and which computations to run on them," with filters so a framework can decline what it never wants. Mesos scaled to 50,000 emulated nodes in the paper. Mesosphere, the company built around Mesos, made **Marathon**, "a production-proven Apache Mesos framework for container orchestration" (repository created June 25, 2013), and the DC/OS distribution.

**What it solved:** many schedulers sharing one cluster without one scheduler having to understand all their policies. **What it cost:** each framework sees only what it's offered, so global policies (fairness across frameworks, preemption, packing) are hard, which is the criticism Omega's authors made. Mesosphere renamed itself D2iQ in August 2019 with Kubernetes products at the center; DC/OS support ended October 31, 2021; Nutanix acquired D2iQ's Kubernetes Platform, announced January 25, 2024; Marathon's repository was archived on October 23, 2024; and the Apache board retired Mesos in August 2025.

### Omega: shared state (2013)

Schwarzkopf, Konwinski, Abd-El-Malek and Wilkes's "Omega: flexible, scalable schedulers for large compute clusters" (EuroSys 2013) named the three architectures. **Monolithic** schedulers use "a single, centralized scheduling algorithm for all jobs" (Borg's at the time). **Two-level** schedulers have one resource manager offering resources to independent frameworks (Mesos), but "their conservative resource-visibility and locking algorithms limit both" flexibility and parallelism. Omega's answer was **shared state**: several schedulers each see the whole cluster and commit placements as transactions with lock-free optimistic concurrency, retrying on conflict. The paper found interference low in practice. Borg absorbed the idea by splitting its scheduler into replicas that work on cached state and propose assignments the master accepts unless they're stale, "quite similar in spirit to the optimistic concurrency control used in Omega."

### Swarm, ECS, Kubernetes and Nomad (2014 to 2016)

Four products arrived within 18 months, each aimed at running Docker containers across many machines:

- **Kubernetes**, announced June 10, 2014 by Eric Brewer, who said Google launched over 2 billion containers a week; 1.0 was released July 21, 2015, with the Cloud Native Computing Foundation formed alongside it. Google offered it as a service in Google Container Engine, generally available August 26, 2015.
- **Docker Swarm**, announced December 4, 2014 at DockerCon Europe with Machine and Compose: "Clustering is defining a pool of resources across multiple hosts to schedule where the containers will run." Docker 1.12 (released July 28, 2016) built **swarm mode** into the engine, with `docker swarm init` and `join`.
- **Amazon ECS**, previewed November 13, 2014 and generally available April 9, 2015, scheduled Docker containers across a cluster of the customer's own EC2 instances with no charge for the scheduler.
- **Nomad**, announced September 28, 2015 as a single binary with no external coordination store, region-level scheduling across datacenters, drivers for Docker, QEMU VMs, Java and plain executables, and a design "based on Google Borg and Omega."

**What they solved:** running containers on many machines without writing a scheduler. **What they cost:** a control plane to operate, an overlay network, and a bet on which one would survive.

### How the orchestrator wars ended (2017 to 2025)

The contest was decided by the clouds and by Docker itself:

| Date | Event |
| --- | --- |
| October 17, 2017 | Docker announces native Kubernetes support alongside Swarm at DockerCon Europe |
| November 29, 2017 | AWS launches Fargate, containers without managing EC2 instances |
| June 5, 2018 | Amazon EKS generally available |
| June 13, 2018 | Azure Kubernetes Service generally available |
| August 2019 | Mesosphere renamed D2iQ, with Kubernetes products at the center |
| November 13, 2019 | Mirantis acquires Docker's Enterprise Platform business, expecting to support Swarm "for at least two years" and naming Kubernetes "the primary orchestrator going forward" |
| November 14, 2019 | Google Cloud Run generally available |
| August 10, 2023 | HashiCorp moves future releases, Nomad included, to the Business Source License |
| January 25, 2024 | Nutanix announces it acquired D2iQ's Kubernetes Platform |
| February 27, 2025 | IBM completes its acquisition of HashiCorp |
| August 2025 | Apache board retires Mesos (to the Attic by October 2025) |

Two things ended it. Once AWS, Microsoft and Google all sold managed Kubernetes, a customer choosing an orchestrator was also choosing portability between clouds, and only one option had it. And Docker, whose own Swarm was the main rival, shipped Kubernetes in its product. What survived alongside Kubernetes was not a competing open orchestrator but the clouds' own schedulers hidden behind products (ECS, Fargate, Cloud Run, Lambda), plus Nomad and Swarm for teams that wanted something smaller. Those alternatives today belong to [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives).

### The scheduler becomes the product (2017 on)

Fargate, Cloud Run and Lambda inverted the arrangement. With ECS on EC2 or a self-managed Kubernetes cluster, the customer rents machines and its scheduler packs containers onto them, so idle capacity on those machines is the customer's waste. With Fargate ("Each Fargate task has its own isolation boundary") or Cloud Run, the customer rents the container's declared size and the provider packs many customers' containers onto its own fleet. The Firecracker paper describes the provider side for Lambda: a Placement service optimizes slot placement "across the worker fleet, ensuring that the utilization of resources including CPU, memory, network, and storage is even across the fleet and the potential for correlated resource allocation on each individual worker is minimized," leasing slots to a Worker Manager that routes invocations, with each slot recycled within 12 hours. The provider now earns the packing efficiency the customer used to lose, which is why serverless containers price above the VM they'd otherwise run on.

## How a Scheduler Works

### Admission and quota

The first decision is whether a request runs at all, and it isn't the scheduler's. Borg checks quota at admission: quota is "a vector of resource quantities (CPU, RAM, disk, etc.) at a given priority, for a period of time (typically months)," and "jobs with insufficient quota are immediately rejected upon submission." Production-priority quota is limited to what the cell actually has, so a job within its prod quota can expect to run, and quota is oversold at lower priorities ("every user has infinite quota at priority zero"). A cloud's service quotas are the same mechanism with a sales process: a default per account and region, an applied override after review, and rejection at the API before placement ([Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#quotas-as-protection) covers quotas as protection; the core model's `quotas` table holds them).

### Filtering

Filtering finds the feasible machines: enough unreserved CPU, memory and disk, the right architecture and features (a GPU, local SSD, an external IP), the requested zone, and every hard constraint satisfied (affinity, anti-affinity, taints and tolerations in Kubernetes' terms). Borg counts resources held by lower-priority tasks as available, because they can be evicted. Kubernetes' documentation is plain about the empty case: if no node survives filtering, the pod "remains unscheduled until the scheduler is able to place it." For a provider, a pending request that never places is a capacity alarm, not a customer error.

### Scoring: packing against spreading

Scoring picks among feasible machines, and the central trade is between packing and spreading:

- **Spread ("worst fit").** Borg originally scored with a variant of E-PVM, which "ends up spreading load across all the machines, leaving headroom for load spikes" at the cost of fragmentation: large tasks that need most of a machine find no machine empty enough.
- **Pack ("best fit").** Filling machines as tightly as possible leaves whole machines free for large tasks, but "the tight packing penalizes any mis-estimations in resource requirements," which hurts bursty applications and batch jobs that request little (20% of Borg's non-prod tasks asked for less than 0.1 cores).
- **Hybrid.** Borg's later model "tries to reduce the amount of stranded resources," capacity that can't be used because another resource on the same machine is fully allocated (spare CPU on a machine with no memory left), and gained about 3 to 5% packing efficiency over best fit.

Nomad's scoring is "primarily based on bin packing" with affinities and anti-affinities layered on. ECS lets the customer chain strategies: services spread across Availability Zones by default, and `binpack` places tasks "so as to leave the least amount of unused CPU or memory." Scores also carry soft goals: Borg prefers machines that already hold the task's packages (startup took a median of about 25 seconds, 80% of it package installation), spreads a job's tasks across power and failure domains, and mixes high- and low-priority tasks on a machine so the high-priority ones can expand into a spike.

Stranding is the number a provider should watch ([Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#bin-packing-and-the-request-gap) measures the same gap inside a cluster). Selling VM shapes in fixed CPU-to-memory ratios is partly a stranding defense: if every shape uses memory and CPU in the host's own proportion, a full host has nothing left over.

### Priority and preemption

When the best machine doesn't have room, a scheduler with priorities makes room. Borg "preempts (kills) lower-priority tasks, from lowest to highest priority, until it does," and puts them back in the pending queue rather than migrating them; tasks can ask for a SIGTERM before the SIGKILL, and notice arrived about 80% of the time. Nomad preempts only allocations from jobs at least 10 priority points lower, lowest first. In Kubernetes, if a pod can't be scheduled, "the scheduler tries to preempt (evict) lower priority Pods."

Preemption is how providers sell interruptible capacity. Spot instances, Fargate Spot ("interrupted with a two-minute warning"), ACI Spot containers and preemptible VMs are low-priority work admitted onto capacity that higher-priority (on-demand) work can reclaim, priced lower because the customer carries the eviction. The scheduler's preemption order is the product's terms of service.

### Overcommit and reclamation

Reserved isn't used. Borg's prod jobs in a representative cell were allocated about 70% of CPU but used about 60%, and allocated 55% of memory while using 85% of it. Borg reclaims the difference: each task's **reservation** starts at its limit and, after 300 seconds, "decays slowly towards the actual usage plus a safety margin," and the gap between reservation and limit is lent to batch work that tolerates lower-quality resources. About 20% of a median cell's workload ran in reclaimed resources. When the bet loses, compressible resources (CPU, I/O) are throttled and non-compressible ones (memory, disk) are recovered by killing tasks "from lowest to highest priority." Lambda makes the same bet at the slot level: memory is about 40% of a modern server's capital cost, so idle slots should cost 40% of busy ones, which requires CPU to be soft-allocated and oversubscribed against a compliance goal (99.99% in the paper's example) for how often a slot gets everything it asks for.

### Scale

Scheduling a whole cell is expensive. Borg made it tractable with three techniques: **score caching** until a machine or task changes; **equivalence classes**, scoring one task per group of identical tasks; and **relaxed randomization**, examining machines in random order until "enough" feasible ones are found. With them, scheduling a cell's entire workload from scratch "typically took a few hundred seconds, but did not finish after more than 3 days when the above techniques were disabled," and an online pass over the pending queue took under half a second. A provider's VM placement service faces the same problem across regions with hundreds of thousands of hosts, and the same shortcuts apply.

### Concurrency: one scheduler or many

Monolithic schedulers are simple and consistent but become the bottleneck and the place every team's policy has to land. Two-level schedulers (Mesos) parallelize but hide the global view. Shared-state schedulers (Omega, Borg's scheduler replicas, Nomad) let many schedulers work in parallel and resolve conflicts at commit: Nomad's leader keeps a **plan queue** that "allows Nomad to handle concurrency races," rejecting plans that collide. A provider usually ends up with the shared-state shape: separate placement logic for VMs, containers, functions and GPUs, all committing against one inventory of hosts.

## Why Pools Are Cheaper

The economic argument for one big shared fleet is quantified in the Borg paper, and it's the argument for being a cloud at all:

| Experiment on Borg cells | Extra machines needed |
| --- | --- |
| Segregating production and non-production work into separate cells | 20 to 30% in the median cell |
| Giving each large user (over 10 TiB or 100 TiB of memory) its own cell | 20 to 150% |
| Splitting cells into smaller ones | Significantly more, rising with the number of partitions |
| Disabling resource reclamation | Many more; about 20% of the median cell's workload ran on reclaimed resources |

Prod jobs reserve for rare spikes and leave the reservation idle most of the time, so the batch work that fills those gaps is nearly free. The Firecracker paper gives the same effect from the multi-tenancy side: the ratio of high-percentile to mean resource use "naturally drops approximately with N when running N uncorrelated workloads," and workloads stay uncorrelated only if they're unrelated, so "multiple workloads from the same application, and to an extent from the same customer or industry, behave as a single workload."

Two consequences for a provider. First, dedicated hosts, single-tenant clusters and per-customer cells cost real capacity, and their price should say so ([Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding) weighs that against blast radius). Second, a fleet dominated by a few large correlated customers loses the pooling benefit; diversity of tenants is an input to utilization, not just to revenue.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Kubernetes** | Declarative API, controllers, filter-and-score scheduler with plugins | The industry API; every cloud sells it; huge ecosystem | Operational weight; misconfigured requests waste capacity; control plane to upgrade | Apache 2.0, CNCF | Control plane plus nodes; managed fees vary ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)) | Most container platforms |
| **Nomad** | Single binary, evaluations and plans, optimistic concurrency | Simple to run; schedules containers, VMs and binaries | Smaller ecosystem; license change limits hosted resale | Business Source License since August 10, 2023; owned by IBM since February 27, 2025 | Self-hosted, enterprise edition by contract | Teams wanting one scheduler for mixed workloads |
| **Docker Swarm mode** | Built into Docker Engine | Minimal setup, Docker-native | Small feature set; little momentum | Apache 2.0 (SwarmKit); enterprise support from Mirantis | Free; support by contract | Small clusters, existing Docker shops |
| **Amazon ECS** | AWS-managed control plane over EC2 or Fargate | No control plane to run; deep AWS integration | AWS only | Proprietary, AWS | No control-plane fee; pay for EC2 or Fargate | AWS-native teams |
| **Serverless containers** (Fargate, Cloud Run, Container Instances) | Provider-owned scheduler; customer declares size | No capacity planning; per-second billing; a VM or sandbox per instance | Premium over VMs; limits on size, duration and networking; provider-specific | Proprietary | Per vCPU and memory over time | Services and jobs without a platform team |
| **Mesos and Marathon** | Two-level resource offers | Multi-framework sharing | Retired: Mesos in August 2025, Marathon archived October 2024 | Apache 2.0, archived | Migration cost | Legacy DC/OS estates |

## My Default

My default for a provider is to build its own shared-state placement service for the products it sells (VMs, microVMs, function slots, GPU nodes), with one inventory of hosts and separate schedulers per product committing against it, and to offer Kubernetes to customers as a product rather than use it as the provider's own placement layer. The facts above support the split. The clouds that run the most capacity schedule their own products with internal placement services (Borg, Lambda's Placement service) and sell Kubernetes on top; Kubernetes' scheduler places pods on nodes a cluster already has, not VMs on a provider's fleet; and Borg's numbers say the provider's margin lives in packing, reclamation and preemption policy, which is worth owning.

For a customer choosing what to run, I'd pick a serverless container service until there are enough services, or enough custom networking and scheduling needs, to justify a cluster, and managed Kubernetes after that. Nomad is the choice I'd make for a small team that schedules VMs, binaries and containers together on its own hardware and can live with the BSL.

What would change this: a provider small enough that a second placement system is a cost it can't carry should run its products on Kubernetes with sandboxed runtimes and accept the density it gets; and a provider whose customers mostly want Kubernetes anyway may find that managed node pools are the product, with the provider's own scheduler reduced to placing those nodes.

## How to Build It

The chapter adds `placement_decisions`, a record of where every placeable resource was put, by which scheduler, under what constraints and why, to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Physical hosts are `hardware_assets` rows from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); nodes in a customer cluster are themselves `virtual_machines` resources. Where a VM then ran over time, including live migrations, is occupancy rather than a decision, and lives in `vm_host_history` from [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps); each `placed` or `migrated` decision here opens a row there.

```sql
CREATE TABLE placement_decisions (       -- every attempt to place a resource, kept
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  resource_id        UUID NOT NULL REFERENCES resources (id),  -- VM, container_service
                                         -- instance, function slot, node
  scheduler          TEXT NOT NULL,      -- 'vm_placement', 'microvm', 'function_slot',
                                         -- 'gpu', a customer cluster's scheduler
  scheduler_version  TEXT NOT NULL,      -- policies change; decisions are replayable
  region_id          TEXT NOT NULL REFERENCES regions (id),
  zone_id            TEXT REFERENCES zones (id),
  host_asset_id      UUID REFERENCES hardware_assets (id),  -- the physical host
  node_resource_id   UUID REFERENCES resources (id),        -- or a node VM in a cluster
  priority           INT NOT NULL,       -- the band it was admitted at
  purchase_option    TEXT NOT NULL CHECK (purchase_option IN ('on_demand', 'spot',
                       'reserved', 'internal')),
  requested          JSONB NOT NULL,     -- {"vcpu": 2, "memory_mb": 4096, "gpu": 0}
  constraints        JSONB NOT NULL DEFAULT '{}',  -- zone, affinity, anti-affinity, features
  feasible_count     INT,                -- how many hosts passed filtering
  score              NUMERIC,            -- the winner's score, in this scheduler's units
  reason             TEXT,               -- 'best_score', 'package_cached', 'spread_domain'
  outcome            TEXT NOT NULL CHECK (outcome IN ('placed', 'pending', 'rejected_quota',
                       'rejected_infeasible', 'preempted', 'migrated', 'released')),
  preempted_by       UUID REFERENCES placement_decisions (id),  -- the placement that evicted it
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((outcome IN ('placed', 'migrated'))
         = (host_asset_id IS NOT NULL OR node_resource_id IS NOT NULL))
);                                       -- append-only: a new decision, never an update

CREATE INDEX ON placement_decisions (resource_id, decided_at);
CREATE INDEX ON placement_decisions (host_asset_id, decided_at);
```

Notes on the sketch:

- **Decisions are separate from occupancy.** A decision is an immutable fact about one attempt; occupancy (which resources were on host H between 02:10 and 02:40, for a hardware fault, a noisy-neighbor complaint or a side-channel disclosure) is the ranged history the decisions open and close, `vm_host_history` for VMs. Keeping both means "why is it there" and "who was there" are each one query.
- **Failures are rows.** A request rejected for quota or left pending for lack of a feasible host is recorded with its constraints, so capacity planning sees demand the fleet couldn't serve, not only what it placed.
- **Preemption is traceable.** `preempted_by` links an evicted spot instance or low-priority task to the placement that displaced it, which is what a customer disputing an interruption, and an SLA calculation that excludes spot, both need.
- **Decisions are replayable.** `scheduler_version`, `requested`, `constraints` and `feasible_count` are enough to rerun a decision in a simulator after a policy change, the use Borg's Fauxmaster served.
- **Events:** `placement.placed`, `placement.pending`, `placement.preempted`, `placement.migrated` and `placement.released` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing (a placement starts and stops metering), the abuse desk and capacity planning.

## Auditing

- **Who shared a host with whom, when.** The occupancy history the placement decisions produce, kept as long as security disclosures and abuse investigations can reach back, because a cross-tenant incident is investigated by co-residency.
- **Every preemption and its notice.** When a spot or low-priority resource was evicted, by what, and how much warning it got, against the notice the product promises.
- **Policy changes.** Each scheduler version and the date it went live, so a change in packing or spread can be tied to a change in incidents or complaints ([Audit Trails](/docs/architecture/audit-trails)).
- **Unmet demand.** Pending and rejected placements by region, shape and reason, which is the evidence for a capacity purchase and for quota decisions.

## What This Means for the System You Build

- **Split admission from placement:** quota decides whether something runs; the scheduler decides where.
- **Filter, then score,** with stranded resources as the number the score minimizes.
- **Sell preemption explicitly:** spot and low-priority products are the scheduler's eviction order with a price on it.
- **Overcommit with a stated bet:** reserve at the request, reclaim toward usage, and throttle CPU before you kill for memory.
- **Pool aggressively and price isolation:** every dedicated host or private cell costs capacity the shared pool would have saved.
- **Record every placement decision and the occupancy it produces,** so both "why there" and "who was there" are queries, not investigations.

## References

**Papers and standards**

- [Verma et al.: Large-scale cluster management at Google with Borg](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/), EuroSys 2015: cells, Borgmaster, priorities, quota, scoring, preemption, reclamation, pooling experiments and lessons for Kubernetes
- [Schwarzkopf et al.: Omega: flexible, scalable schedulers for large compute clusters](https://research.google/pubs/omega-flexible-scalable-schedulers-for-large-compute-clusters/), EuroSys 2013: monolithic, two-level and shared-state schedulers
- [Hindman et al.: Mesos: A Platform for Fine-Grained Resource Sharing in the Data Center](https://www.usenix.org/conference/nsdi11/mesos-platform-fine-grained-resource-sharing-data-center), NSDI 2011: resource offers and two-level scheduling
- [Burns et al.: Borg, Omega, and Kubernetes](https://research.google/pubs/borg-omega-and-kubernetes/), ACM Queue, 2016
- [Agache et al.: Firecracker: Lightweight Virtualization for Serverless Applications](https://www.usenix.org/conference/nsdi20/presentation/agache), NSDI 2020: Lambda's Placement service, slot leases and the economics of oversubscription

**Provider documentation**

- [Kubernetes: Kubernetes Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/), filtering, scoring and unschedulable pods
- [HashiCorp: Nomad scheduling](https://developer.hashicorp.com/nomad/docs/concepts/scheduling/scheduling), evaluations, plans, the plan queue, feasibility and bin-packing ranking
- [HashiCorp: Nomad preemption](https://developer.hashicorp.com/nomad/docs/concepts/scheduling/preemption), preemption for service, batch and system jobs and the priority delta
- [Kubernetes: Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/), priority, PriorityClass and preemption
- [AWS: Amazon ECS task placement strategies](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement-strategies.html), binpack, spread and random, and the default spread across Availability Zones
- [Microsoft Learn: Azure Container Instances overview](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview), Spot containers that may be preempted
- [AWS: Architect for AWS Fargate for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html), per-task isolation and Fargate Spot's two-minute warning
- [GitHub: mesosphere/marathon](https://github.com/mesosphere/marathon), Marathon's description, DC/OS end of support and archival on October 23, 2024
- [Apache Attic: Mesos](https://attic.apache.org/projects/mesos.html), retired in August 2025

**Announcements and release notes**

- [Google Open Source blog: An update on container support on Google Cloud Platform](https://opensource.googleblog.com/2014/06/an-update-on-container-support-on.html), Kubernetes and 2 billion containers a week, June 2014
- [Google Cloud Platform blog: Kubernetes V1 released](https://cloudplatform.googleblog.com/2015/07/Kubernetes-V1-Released.html), July 21, 2015
- [TechCrunch: Google's Container Engine is now generally available](https://techcrunch.com/2015/08/26/googles-container-engine-for-running-docker-containers-on-its-cloud-platform-is-now-generally-avaiable/), August 26, 2015
- [TechCrunch: Docker launches its first commercial product and gets into orchestration tools](https://techcrunch.com/2014/12/04/docker-launches-its-first-commercial-product-and-gets-into-orchestration-tools/), Swarm, Machine and Compose, December 4, 2014
- [GitHub: moby/moby v1.12.0](https://github.com/moby/moby/releases/tag/v1.12.0), swarm mode in Docker Engine, July 28, 2016
- [AWS News Blog: EC2 Container Service](https://aws.amazon.com/blogs/aws/cloud-container-management/), preview on November 13, 2014
- [AWS: Amazon EC2 Container Service is now generally available](https://aws.amazon.com/about-aws/whats-new/2015/04/amazon-ec2-container-service-is-now-generally-available/), April 9, 2015
- [HashiCorp: Nomad announcement](https://www.hashicorp.com/en/blog/nomad-announcement), September 28, 2015, based on Borg and Omega
- [TechCrunch: Docker gives into inevitable and offers native Kubernetes support](https://techcrunch.com/2017/10/17/docker-gives-into-invevitable-and-offers-native-kubernetes-support/), October 17, 2017
- [AWS News Blog: AWS Fargate](https://aws.amazon.com/blogs/aws/aws-fargate/), November 29, 2017
- [AWS News Blog: Amazon EKS now generally available](https://aws.amazon.com/blogs/aws/amazon-eks-now-generally-available/), June 5, 2018
- [Microsoft Azure: Azure Kubernetes Service (AKS) GA](https://azure.microsoft.com/en-us/blog/azure-kubernetes-service-aks-ga-new-regions-new-features-new-productivity/), June 13, 2018
- [DevClass: Mesosphere is dead, long live D2iQ](https://devclass.com/2019/08/06/mesosphere-is-dead-long-live-d2iq), the rename and Kubernetes focus, August 2019
- [Mirantis: Mirantis acquires Docker Enterprise Platform business](https://www.mirantis.com/company/press-center/company-news/mirantis-acquires-docker-enterprise/), November 13, 2019
- [Mirantis: What we announced today and why it matters](https://www.mirantis.com/blog/mirantis-acquires-docker-enterprise-platform-business/), Swarm support for at least two years and Kubernetes as the primary orchestrator
- [Google Cloud: Cloud Run is GA](https://cloud.google.com/blog/products/serverless/knative-based-cloud-run-services-are-ga), November 14, 2019
- [HashiCorp: HashiCorp adopts the Business Source License](https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license), August 10, 2023
- [Nutanix: Acquisition of D2iQ Kubernetes Platform](https://www.nutanix.com/blog/acquisition-of-d2iq-platform), January 25, 2024
- [IBM: IBM completes acquisition of HashiCorp](https://newsroom.ibm.com/2025-02-27-ibm-completes-acquisition-of-hashicorp,-creates-comprehensive,-end-to-end-hybrid-cloud-platform), February 27, 2025
