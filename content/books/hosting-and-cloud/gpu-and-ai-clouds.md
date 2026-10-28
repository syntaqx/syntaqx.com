+++
title = "GPU & AI Clouds"
description = "Renting GPUs: hyperscaler instances and capacity blocks, neoclouds and take-or-pay contracts, marketplaces, serverless GPU, rack power and export controls."
category = "Hosting & Cloud Industry"
order = 2208
part = "Running the Provider"
tags = ["gpu", "ai", "neoclouds", "capacity-reservations", "export-controls"]
+++

A GPU cloud rents accelerators by the hour, by the block of days, or by the multi-year contract. On paper it is the same business as renting virtual machines: a catalog of instance types, a meter, a placement decision and an invoice. In practice almost every assumption of the general-purpose cloud breaks. The unit is an eight-GPU server or a 72-GPU rack, not a slice of a host; the network between servers is a second, dedicated fabric that matters as much as the GPUs; a single rack draws more power than a row of ordinary racks and needs liquid cooling; supply is scarce enough that providers ration it with reservations, queues and prices that change with demand; and the chips themselves are export-controlled, so who may rent them, and from where, is a licensing question.

The market has four kinds of seller. The hyperscalers (AWS, Azure, Google Cloud, Oracle) sell GPU instances next to everything else they sell, and invented time-boxed reservation products to ration them. The neoclouds (CoreWeave, Nebius, Lambda, Crusoe, Together AI and others) do little but GPUs, financed by multi-year take-or-pay contracts with a few very large customers. Marketplaces and community clouds (Vast.ai, RunPod's Community Cloud) rent other people's machines at host-set prices. And serverless GPU and inference platforms (Modal, Replicate, fal, Cloudflare Workers AI) sell GPU-seconds or outputs (an image, a second of video, a million tokens) instead of machines. Web hosts sit at the far end, selling AI site builders metered in credits on top of someone else's models.

This chapter owns GPU hourly prices and the neocloud business. It covers how GPU clouds got here, how a GPU instance and cluster work, how capacity is bought, the dated prices, the neocloud financing model, serverless and per-output pricing, rack power, export controls on chips and remote access, the AI products web hosts sell, and the tables that model GPU reservations on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Where a model should run, given these prices, is the next chapter, [Where AI Runs: Home, Colo, Cloud or Frontier](/books/hosting-and-cloud/where-ai-runs). The fabrics themselves (InfiniBand, RoCE, NVLink) are [Data Center Networking](/books/hosting-and-cloud/data-center-networking#ai-fabrics)'s, and the general commitment math (Savings Plans, committed use discounts, spot) is [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#gpu-capacity-reservations)'. Idle GPU waste as a cost line is the playbook's [Cost & FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total) and [Compute Isolation and Cost](/docs/data/data-science-platforms#compute-isolation-and-cost).

## How the Providers Do It

| Provider | Kind | How it sells GPUs, as of October 2026 | Fabric, as publicly described |
| --- | --- | --- | --- |
| **AWS** | Hyperscaler | On-demand and Savings Plans; EC2 Capacity Blocks for ML: 1 to 64 instances for up to six months, booked up to eight weeks ahead, at dynamic prices | Ethernet with EFA and the SRD transport; 3,200 Gbps per 8-GPU P5 instance, 28.8 Tbps per GB200 UltraServer |
| **Azure** | Hyperscaler | Pay-as-you-go, reservations and Savings Plans; on-demand capacity reservations, but not for ND-series or NCads H100 v5 | InfiniBand on ND-series: a 400 Gbps Quantum-2 link per GPU, 3.2 Tbps per VM |
| **Google Cloud** | Hyperscaler | On-demand, committed use; Dynamic Workload Scheduler: Flex Start (queued) and Calendar mode (fixed blocks up to 90 days) | RoCE on A3 Ultra and A4 (8 ConnectX-7 NICs, 3,200 Gbps for GPU traffic), rail-aligned blocks |
| **Oracle** | Hyperscaler | Superclusters: orders opened in September 2024 for up to 131,072 Blackwell GPUs; Zettascale10 clusters of up to 800,000 GPUs announced for the second half of 2026 | RoCEv2 or InfiniBand; Acceleron RoCE on Zettascale10 |
| **CoreWeave** | Neocloud, public | Multi-year take-or-pay contracts with prepayments; over 98% of 2025 revenue was committed | InfiniBand fat-tree with SHARP; Spectrum-X RoCE on GB300 |
| **Nebius** | Neocloud, public | Dedicated multi-year capacity for a few large buyers (Microsoft, Meta); GPU clusters inside named fabrics | InfiniBand, 400 Gbps per GPU; one partition key per cluster |
| **Lambda** | Neocloud, private | On-demand per GPU-hour; 1-Click Clusters of 16 to 2,000+ GPUs for two weeks to a year; reserved through sales | InfiniBand-connected clusters with SHARP |
| **Crusoe** | Neocloud and campus developer, private | Builds and operates AI campuses; a 900 MW Abilene campus for Microsoft announced March 2026 | Not detailed here |
| **Together AI** | Neocloud plus inference API | GPU clusters on-demand or reserved in 3 to 180-day bands; serverless inference per token | Not detailed here |
| **DigitalOcean** | Developer cloud | GPU Droplets per second with a 5-minute minimum; reserved on 12-month contracts | Not detailed here |
| **RunPod** | Community and datacenter tiers | Pods per hour in Community Cloud (third-party hosts) or Secure Cloud; serverless per second | Not detailed here |
| **Vast.ai** | Marketplace | Host-set prices per offer: on-demand, reserved, or interruptible by bid | Whatever the host has |
| **Modal, Replicate, fal** | Serverless GPU | Per GPU-second, or per output (image, second of video, megapixel) | Abstracted |
| **Cloudflare Workers AI** | Serverless inference | "Neurons", an abstract unit, plus per-model token prices | Abstracted |

Four patterns run through the table:

- **The hyperscalers ration, the neoclouds contract.** AWS, Google and Lambda sell time-boxed blocks because the large GPUs are too scarce to promise on demand; Azure's capacity reservations explicitly exclude its training SKUs. The neoclouds sell most of their capacity years in advance to a handful of buyers, and finance the GPUs against those contracts.
- **The fabric is bundled.** None of these providers prices the InfiniBand or EFA network separately. What is sold is the instance size, the cluster or placement construct, and reserved capacity inside one fabric.
- **Capacity is now counted in power.** CoreWeave and Nebius report megawatts active and gigawatts contracted rather than GPU counts, because power and cooled floor space are what limit growth.
- **The further from the metal, the more abstract the unit.** A neocloud contract is GPU-years; a Capacity Block is instance-hours; a serverless platform is GPU-seconds; an inference API is tokens or images; Workers AI is Neurons; a web host's AI builder is credits.

## How GPU Clouds Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 29 Apr 2019 | AWS Elastic Fabric Adapter generally available, with OS bypass through libfabric and NCCL support | Tightly coupled HPC and ML on a cloud's Ethernet | A provider-specific transport (SRD) instead of InfiniBand |
| 27 Apr 2020 | NVIDIA completes its $7 billion Mellanox acquisition | One vendor for GPUs, NVLink and InfiniBand | Concentration of the AI fabric in one supplier |
| 13 Mar 2023 | Azure previews ND H100 v5: a 400 Gb/s InfiniBand link per GPU, 3.2 Tb/s per VM, non-blocking fat-tree | Supercomputer-class networks rented by the VM | VMs that can't live-migrate |
| 26 Jul 2023 | AWS P5 (8 H100s, 3,200 Gbps EFA) generally available | The first H100 generation on a hyperscaler | Scarcity: capacity, not price, became the constraint |
| 6 Dec 2023 | Google announces Dynamic Workload Scheduler, Flex Start and Calendar mode | Rationing scarce GPUs by queue and by booked block | Customers plan training runs around a calendar |
| 12 Mar 2024 | Meta describes two 24,576-GPU H100 clusters, one on RoCE and one on InfiniBand | Showing Ethernet could carry training at scale | Scheduler, routing and NCCL work before large clusters reached 90%+ utilization |
| 14 Feb 2025 | Fly.io, "We Were Wrong About GPUs" | (A PaaS learning that developers want models, not GPUs) | Months lost to virtualized GPUs in a microVM hypervisor |
| March 2025 | CoreWeave lists on Nasdaq | Public capital for a GPU-only cloud | Disclosure of its concentration and debt |
| 13 May 2025 | BIS says it will not enforce the AI Diffusion Rule, due 15 May | (Reversing a worldwide tiered licensing scheme) | Uncertainty: no replacement rule as of October 2026 |
| 1 Jun 2025 | AWS cuts on-demand GPU prices: P4d and P4de 33%, P5 44%, P5en 25%; Savings Plans up to 45% for P5 | Cheaper Hopper-generation capacity as Blackwell arrived | |
| 8 Sep 2025 | Nebius signs a five-year Microsoft capacity contract of about $17.4 billion | A hyperscaler renting capacity from a neocloud | Delivery dates with termination rights |
| 30 Oct 2025 | Core Scientific terminates its merger with CoreWeave after shareholders vote it down | (Buying powered sites instead of leasing them) | |
| 17 Nov 2025 | Cloudflare announces Replicate is joining it, with the catalog moving to Workers AI | Serverless inference consolidating into an edge network | |
| 15 Jan 2026 | BIS rule 91 FR 1684 moves H200 and MI325X-class exports to China to case-by-case review | A licensed path to China, under volume and KYC conditions | Third-party testing of every shipment, remote-access screening |
| Jan and Jul 2026 | AWS raises Capacity Block prices: about 15% on H200 blocks in January, about 20% from 1 July | Demand for Blackwell-class blocks outrunning supply | Reservation buyers pay the market rate at purchase |
| 10 Jul 2026 | BIS final rule 91 FR 43034 moves the UAE to Country Group A:5 | License-free advanced computing for approved UAE users | |

The arc is short. Until 2023 a cloud GPU was an instance type like any other; the H100 generation made accelerators the scarcest thing a cloud sells, turned reservations into the product, and created a class of provider whose whole balance sheet is GPUs pledged against customer contracts. Prices fell in 2025 as supply arrived and rose again in 2026 for the newest chips: there is no single trend, only a market that reprices each generation.

## How a GPU Instance Works

The unit is a server, not a slice. A hyperscaler GPU instance is normally a whole 8-GPU HGX board (AWS `p5.48xlarge`, `p6-b200.48xlarge`, Azure's ND H100 v5), with the GPUs joined inside the server by NVLink and NVSwitch: 900 GB/s per GPU on Hopper's NVLink 4, 1,800 GB/s on Blackwell's NVLink 5. Smaller sizes exist (AWS sells a one-H100 `p5.4xlarge`), but training and large-model inference rent the whole board, because the NVLink domain is the fastest network the model can use.

Rack-scale systems move the NVLink domain up a level. NVIDIA's GB200 NVL72 joins 72 Blackwell GPUs and 36 Grace CPUs in one 130 TB/s NVLink domain with 13.4 TB of HBM3E, liquid-cooled; AWS sells it as the `p6e-gb200` UltraServer and Azure as ND GB200 v6, whose VM is one tray of four GPUs. The customer rents a rack, or a share of one, and the rack is the failure domain.

Every serious GPU server has two networks:

- **The back-end (scale-out) fabric** carries GPU-to-GPU traffic between servers: InfiniBand on Azure ND, CoreWeave, Lambda and Nebius; RoCE on Google's A3 Ultra and A4, Oracle and Meta's RoCE cluster; EFA with SRD on AWS. The common shape is one 400 Gbps NIC per GPU (3.2 Tbps per 8-GPU server), rail-optimized so each GPU's NIC reaches the same-numbered GPU in other servers in one hop. Google's documentation describes sub-blocks one hop apart through a top-of-rack switch and blocks a maximum of two hops apart; NVIDIA's DGX SuperPOD reference uses 32-node scalable units.
- **The front-end network** carries everything else: storage, checkpoints, logging, the customer's VPC. Azure's ND H100 v5 lists a separate 80,000 Mbps Ethernet front end across eight NICs; Meta's paper separates front end (ingest, checkpoint, logging) from back end (training).

Placement is where the fabric becomes a product. A training job needs its servers in the same fabric, ideally the same block, so providers sell cluster constructs: AWS EC2 UltraClusters and cluster placement groups (Capacity Blocks are placed in UltraClusters), Lambda's 1-Click Clusters, Nebius's GPU clusters. Nebius documents the mechanics most plainly: clusters live in a named fabric (`fabric-2` through `fabric-7`), one GPU platform per fabric; a VM joins a cluster only at creation; and each cluster gets its own InfiniBand partition key (P-Key), the fabric's tenant isolation. The fabrics, their congestion control and their history are [Data Center Networking](/books/hosting-and-cloud/data-center-networking#ai-fabrics)'s.

Isolation is the other hard part. Fly.io's account of its GPU product is the clearest public record of what goes wrong for a provider whose isolation is a microVM: GPU Machines were Docker containers in hardware-virtualized VMs with GPUs passed through, months went into failing to get virtualized GPUs working in Cloud Hypervisor, the dedicated GPU servers sat at low utilization, and the conclusion was that "developers don't want GPUs... They want LLMs"; only the L40S sold steadily. A community forum thread reports a customer notice that Fly GPUs would be deprecated as of 31 July 2026; Fly.io staff have not confirmed it on that thread. [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms) covers the isolation layer.

## Power, Cooling and the Rack

A GPU rack is a different building load. SemiAnalysis puts an NVL72 at about 120 kW per rack, 123.6 kW total draw including AC-to-DC losses, against about 40 kW for the densest air-cooled H100 racks; Supermicro's NVL72 rack lists 132 kW total power, eight 33 kW power shelves, and an in-rack coolant distribution unit (CDU) of 250 kW or an in-row CDU of 1.3 MW, with liquid-to-air options of 180 or 240 kW for sites without facility water. Typical colocation racks are a fraction of that, which is why the move to rack-scale systems is also a move to direct-to-chip liquid cooling and to new buildings. [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#power) owns the facility side; [Where AI Runs](/books/hosting-and-cloud/where-ai-runs#gpus-in-colocation) covers what that density means for a customer putting GPUs in colocation.

For a GPU provider, power is the binding constraint and the unit of disclosure. CoreWeave reported more than 850 MW active and about 3.1 GW contracted at the end of 2025, then 1.5 GW active and about 3.7 GW contracted at the end of June 2026. Nebius raised its year-end 2026 contracted power target to 5 GW, and quotes large deals at an annual contract value of $20 to 25 million per MW. Crusoe reports over 6 GW of gross contracted capacity and 1 GW operational (September 2026). A provider's capacity plan is a power plan first and a GPU order second.

## Buying Capacity

GPU capacity is sold in six shapes, and most providers offer several:

| Shape | How it works | Examples, as of October 2026 | Who carries the idle risk |
| --- | --- | --- | --- |
| **On-demand** | Per second or hour, no commitment, if capacity exists | AWS, Azure, Google; Lambda per GPU-hour; DigitalOcean per second with a 5-minute minimum | Provider |
| **Capacity reservation** | Capacity held in a region or zone, billed at the on-demand rate whether used or not | Azure on-demand capacity reservation, with a capacity SLA, excluding ND-series and NCads H100 v5 | Customer |
| **Time-boxed block** | A fixed number of instances for fixed dates, bought ahead at a price set at purchase | AWS Capacity Blocks (up to six months, up to eight weeks ahead); Google DWS Calendar mode (up to 90 days); Lambda 1-Click Clusters (two weeks to a year); Together reserved bands | Customer, for the block |
| **Queued** | Ask for N GPUs for up to a duration; the job starts when capacity frees | Google DWS Flex Start (up to seven days), used through GKE queued provisioning and Kueue | Shared: the customer waits |
| **Multi-year take-or-pay** | Dedicated capacity for years, prepaid in part, paid whether used or not | CoreWeave (about five-year average), Nebius (Microsoft, Meta), Lambda (Microsoft) | Customer |
| **Interruptible or spot** | Cheaper capacity the provider can reclaim | Vast.ai interruptible by bid; RunPod spot; DigitalOcean B300 spot | Customer, as interruption |

The mechanics that matter in each:

- **AWS Capacity Blocks** reserve P6e-GB200, P6-B300, P6-B200, P5en, P5e, P5, P4d and Trainium instances, from 1 to 64 instances (up to 512 GPUs), in EC2 UltraClusters, shareable across accounts. Prices "are dynamic and change based on available supply and demand"; a block "is charged at the prevailing rate at the time of purchase," and the October 2026 page says prices are "scheduled to be updated next in January, 2027."
- **Google DWS Calendar mode** reserves resources "for a duration of up to 90 days," shows availability up to 60 days ahead for GPUs (120 for TPUs), and needs a minimum lead time of 87 hours for GPU VMs. It is built on Compute Engine future reservations: at the end, the VMs are terminated and the reservation deleted.
- **Azure on-demand capacity reservations** carry a capacity SLA with service credits (Microsoft's worked example: 55 minutes unavailable is 99.87% and earns a 10% credit). Reservations and Savings Plans apply on top. The training SKUs are excluded, so ND capacity is sales-led; the Retail Prices API does list one- and three-year reservation prices for ND GB200 v6.
- **Neocloud contracts** are the opposite of on-demand. CoreWeave's 10-K says customers buy "a specified amount of capacity on a take-or-pay basis over the contract term," with weighted-average prepayments of 15% to 25% of total contract value. Nebius's Microsoft agreement lets Microsoft terminate a GPU service if delivery dates are missed after a grace period and no alternative capacity is offered, and its obligations started only once Nebius confirmed financing for the build. Delivery dates are the provider's risk; utilization is the customer's.
- **Marketplaces** put the price in the host's hands. Vast.ai says "Pricing is set by the host and is specific to each offer," with separate charges for the rental per hour, storage per GB-hour (billed even when stopped) and bandwidth per TB. Its rental types are on-demand (the host's fixed price), reserved (prepaid, up to 50% off) and interruptible (a bid; a higher bid stops you; 50% to 80% cheaper). RunPod splits Community Cloud (third-party hosts) from Secure Cloud (data centers) at different prices for the same GPU.

The scheduling rule underneath is the same everywhere: a block or reservation is a promise against a specific pool (an instance type in a zone, inside one fabric), and the provider can only sell what that pool will have on those dates after earlier promises. That is why blocks are booked ahead with lead times, why they end hard, and why the price is fixed at purchase rather than at use.

## GPU Prices, Dated

List prices per GPU-hour, as of October 2026. Where a provider quotes per instance, the per-GPU figure is the provider's own (AWS) or my division (Azure):

| GPU | AWS Capacity Block, US East (N. Virginia) | Azure, East US | Lambda on-demand | Together on-demand / 91 to 180 days | DigitalOcean on-demand | RunPod Community / Secure | Modal (serverless) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A100 80 GB | $2.546 (`p4de`) | | $2.79 | | | $1.39 / $1.79 (SXM) | about $2.50 |
| H100 | $5.970 (`p5.48xlarge`) | | $3.99 to $4.29 (SXM) | $3.99 / $3.19 | $4.41 | $2.69 / $3.99 (SXM) | about $3.95 |
| H200 | $7.895 (`p5en`) | | | $5.99 / $3.99 | $4.47 | $3.59 / $5.29 | about $4.54 |
| B200 | $14.208 (`p6-b200`) | | $6.69 to $6.99 | $8.19 / $6.79 | | $5.98 / $7.99 | about $6.25 |
| B300 | $16.146 (`p6-b300`) | | | | $7.94 reserved, $6.17 spot | | |
| GB200 | $761.904 per UltraServer-hour (Dallas Local Zone table) | $27.04 (ND GB200 v6, $108.16 per 4-GPU VM-hour) | | Reserved only | | | |

Notes on reading it:

- **The rows are not like for like.** An AWS Capacity Block is a reserved, clustered, EFA-connected block; a Lambda on-demand GPU is a single VM; a RunPod Community GPU is a third party's machine; a Modal price is per second with no minimum (Modal lists B200 at $0.001736 and H100 at $0.001097 per second, which I convert to hours). The cluster premium shows inside one provider: Lambda's B200 is $6.69 on demand but $9.86 to $8.87 per GPU-hour in a 1-Click Cluster.
- **Azure's reservation discount is steep.** ND GB200 v6 lists $108.16 an hour pay-as-you-go (Linux), a one-year reservation of $606,388 per VM (about $69.2 an hour) and a three-year reservation of $1,250,676 (about $47.6 an hour). The API lists the Spot meter at the same $108.16.
- **AWS Capacity Block rates moved up three times in 2026.** H200 blocks rose about 15% in January (US West `p5e`/`p5en` from $43.26 to $49.75 per instance-hour, as reported by the press; AWS said prices "vary based on supply and demand patterns"); blocks rose about 20% from 1 July (press: P5 $5.191, P5en $6.865, P6-B200 $12.355 and P6-B300 $14.04 per accelerator-hour in the US); and the October US East table sits about 15% above those July figures. AWS has published no announcement for the July-to-October change.
- **The 2025 direction was down.** AWS cut on-demand P5 prices 44% from 1 June 2025, and P4d, P4de and P5en by 33% and 25%. DigitalOcean's on-demand H100 went the other way in 2026: $3.39 per GPU-hour in an archived March 2026 copy of its pricing page, $4.41 in October; its 12-month reserved H100 went from $2.50 to $3.26.

My rule for a provider's catalog: a GPU price is a dated price version with the purchase option, the region and the cluster construct as dimensions, never a single number per GPU model. The same H100 has at least five prices at one provider, and the reservation price that applies is the one in effect when the block was bought.

## The Neocloud Business

The neoclouds are utilities financed like infrastructure projects. CoreWeave's 2025 10-K is the most complete public description:

| Measure | CoreWeave | Source period |
| --- | --- | --- |
| Revenue | $5,131 million, up from $1,915 million | 2025 |
| Committed contracts as a share of revenue | Over 98% (96% in 2024, 88% in 2023) | 2025 |
| Weighted-average contract duration | About five years | 2025 |
| Prepayments | 15% to 25% of total contract value, weighted average | 2025 |
| Largest customer | "approximately 67% of our revenue from our top customer, Microsoft" | 2025 |
| Remaining performance obligations | $60.7 billion, up from $15.1 billion; 43% recognized within 24 months, 38% in months 25 to 48, the rest in months 49 to 84 | 31 Dec 2025 |
| Footprint | 43 data centers, over 850 MW active, about 3.1 GW contracted | 31 Dec 2025 |
| Total indebtedness | $21.6 billion, plus $5.2 billion of OEM and equipment financing and $8.2 billion of operating lease liabilities | 31 Dec 2025 |
| Technology equipment useful life | Six years (changed from five, effective 1 January 2023) | 2025 |
| Named contracts | OpenAI up to about $11.9 billion through October 2030 and a further up to about $6.5 billion through May 2031; Meta up to about $14.2 billion through December 2031 | As disclosed |
| Quarter to 30 Jun 2026 | Revenue $2,575 million; interest expense $640 million; net loss $626 million; adjusted operating income $128 million; property and equipment purchases $6,422 million; backlog about $104 billion | Q2 2026 |

Four things in that table define the model:

- **Contracts are the collateral.** The 10-K describes asset-level debt "supported by take-or-pay customer contracts," in a series of delayed-draw term loan facilities (DDTL 1.0, 2.0, 2.1 and 3.0) alongside notes, convertibles and a revolver. A neocloud's real product is a financing structure that turns a customer's five-year promise into a GPU order today.
- **Concentration is the disclosed risk.** Microsoft was about 67% of CoreWeave's 2025 revenue. The 10-K's "Customer A" was 62% in 2024 and 35% in 2023, but the filing warns that the letters may denote different customers in different periods, so the 2024 figure cannot be read as Microsoft's without that caveat.
- **Interest competes with margin.** In the second quarter of 2026 CoreWeave's interest expense ($640 million) was five times its adjusted operating income ($128 million). The business works if contracted revenue arrives on schedule and the GPUs earn for longer than the debt runs; depreciation over six years is a bet on the second.
- **Powered land is the scarce input.** CoreWeave's attempt to buy Core Scientific, a crypto miner with powered sites, failed when Core Scientific's shareholders voted 203,451,498 against to 20,752,327 for, and Core Scientific terminated the agreement on 30 October 2025.

The other neoclouds show the same shape at different stages. Nebius disclosed a five-year Microsoft agreement worth about $17.4 billion through 2031 (up to about $19.4 billion with additional services) and a Meta agreement of about $3 billion over five years; in the second quarter of 2026 it reported revenue of $582.3 million, AI cloud revenue of $575 million, ARR of $3.0 billion (defined as the last month's AI cloud revenue times twelve), a 50% adjusted EBITDA margin for AI cloud, and $5,657.4 million of capital spending in the quarter, with over $9 billion of customer prepayments expected in 2026. Lambda announced a "multibillion-dollar agreement" with Microsoft on 3 November 2025 without a value or term; it has filed no public S-1 as of 27 October 2026. Crusoe, private, raised a $1.375 billion Series E at over $10 billion (24 October 2025) and a $3.9 billion Series F at $30.9 billion post-money (17 September 2026), and announced a 900 MW campus in Abilene, Texas for Microsoft next to its existing 1.2 GW site (27 March 2026).

The pattern a hyperscaler buyer creates is worth naming: Microsoft is CoreWeave's largest customer and has contracted capacity from Nebius and Lambda, so a neocloud's capacity is often a hyperscaler's capacity under another name, and its customers' customers sit on the hyperscaler's bill. Who resells whom is [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#who-resells-whom)'s map.

## Serverless GPU and Per-Output Pricing

Above the machine, platforms sell GPU time in seconds or sell outputs, and the differences are in what idle time costs:

| Platform | Unit | Example prices, as of October 2026 | Idle and cold starts |
| --- | --- | --- | --- |
| **Modal** | GPU-second, plus CPU per physical core-second and memory per GiB-second | B200 $0.001736/s, H100 $0.001097/s, L4 $0.000222/s; region pinning 1.15x to 1.75x; non-preemptible 3x | Billed while containers run; plans include monthly credits ($30 Starter, $100 Team) |
| **Replicate** | Hardware-second, or per output for official models | H100 $0.001525/s; flux-1.1-pro $0.04 per image; wan-2.1-i2v-720p $0.25 per second of video | Public models bill processing time only; private models bill all online time, setup and idle included |
| **fal** | Per output for its model API; GPU-hour for custom deployments | FLUX.1 [schnell] $0.003 per megapixel; B200 $7.99/h list, "as low as" $5.49 | Not detailed here |
| **RunPod Serverless** | Per-second workers | H100 about $4.79/h, B200 $8.64/h equivalents | Not detailed here |
| **Cloudflare Workers AI** | Neurons, $0.011 per 1,000 above 10,000 free a day, plus per-model token prices | llama-3.2-1b $0.027 per million input tokens, $0.201 output | Free allowance resets at 00:00 UTC |
| **Together AI** | Per million tokens | gpt-oss-120b $0.15 input, $0.60 output | Serverless; dedicated endpoints per hour |

Two lessons for anyone building one. The premium over a reserved GPU (Modal's H100 at about $3.95 an hour against Together's 91-to-180-day $3.19) pays for scale to zero; it is cheap at low utilization and expensive at high. And the meter decides who pays for the cold start: Replicate's split between public models (processing time only) and private ones (all online time) is the clearest statement of a rule every serverless GPU platform has to make. Token-priced inference across tiers, and when renting GPUs beats paying per token, is [Where AI Runs](/books/hosting-and-cloud/where-ai-runs#the-economics).

## Export Controls on Chips and Remote Access

Advanced GPUs are export-controlled under the US Export Administration Regulations, and a GPU cloud is both an exporter (when it ships hardware to its own data centers abroad) and a channel for remote access (when a customer in a country of concern rents the chips). The status, as of October 2026:

| Measure | Status | What it requires of a provider |
| --- | --- | --- |
| **AI Diffusion Rule** (worldwide tiered licensing) | Not enforced: BIS announced on 13 May 2025 that it would not enforce the rule due 15 May and would issue a replacement; no replacement or formal rescission in the Federal Register through 27 October 2026 | Nothing new; BIS guidance warns that using certain Huawei Ascend chips risks violating the EAR, and lists diversion red flags |
| **H200 and MI325X to China and Macau** (91 FR 1684, effective 15 Jan 2026) | In force: case-by-case review instead of a presumption of denial, for chips with TPP below 21,000 and total DRAM bandwidth below 6,500 GB/s | Aggregate TPP shipped to China and Macau no more than 50% of the aggregate TPP shipped to US customers for US end use; consignee KYC against unauthorized remote access; every shipment reviewed by a qualified third-party lab; the applicant lists intended IaaS remote end users in the named countries of concern |
| **UAE** (91 FR 43034, published 14 Jul 2026, effective 10 Jul 2026) | In force: UAE moved from Country Groups D:3 and D:4 to A:5 | License-free access to advanced computing items for the UAE Government and approved commercial entities |
| **Remote access by Chinese firms in third countries** | Pending: a draft Commerce rule reported in August 2026; nothing in the Federal Register as of 27 October 2026 | None yet |
| **Remote Access Security Act, H.R. 2683** | Pending: passed the House 369 to 22 on 12 January 2026; in Senate Banking as of October 2026 | None yet |
| **IaaS customer identification rule** (RIN 0694-AJ35) | Withdrawn: proposed January 2024 (89 FR 5698), listed as withdrawn on 16 December 2025 in the Unified Agenda | None under that rule |

The H200 rule writes remote access into a chip license's conditions: the exporter must know its consignee's customers well enough to prevent unauthorized remote use, and must name the IaaS end users it intends to serve in countries of concern. For a provider that means export compliance reaches into the account model: which accounts in which countries use which instance types, provable later. Sanctions screening, the broader export rules and know-your-customer for infrastructure are [Sanctions, Exports & Bulletproof Hosts](/books/hosting-and-cloud/sanctions-and-bulletproof-hosts#ai-chips-and-hosted-capacity)'.

## AI Inside Hosting Plans

At the far end of the stack, web hosts sell AI as a feature of a plan, built on frontier or hosted models they don't run:

| Host | Product, as publicly described | How it's metered |
| --- | --- | --- |
| **Hostinger** | One AI Builder combining Horizons and the website builder, with Manual (drag-and-drop) and Agentic ("vibe coding") modes and a built-in back end; "Hostinger Agent" AI support chatbot | Credits: a simple page 250 to 500, a complex app 750 or more; live AI features such as chatbots also draw credits; base allowances of 250, 500 or 1,000 by plan. Expired plans' projects are permanently deleted |
| **GoDaddy** | Airo, launched 26 February 2024 (a domain name from a description, logo, site, email and marketing content), extended to new and existing domain purchases in English-speaking markets by the second quarter of 2024; agentic Airo.ai in beta with six agents (13 November 2025); Airo for WordPress (11 May 2026) | Included with domain purchases |
| **Bluehost** | Bluehost AI Website Creator, part of WonderSuite, shown at WordCamp Europe in June 2024; Bluehost AI Website Builder (post first published 27 May 2026), whose agent asks "up to 5 guided clarifying questions" | 14-day free trial, no credit card |

The engineering is simple and the billing is the interesting part. A credit is a plan allowance in a unit the host defines, drawn down by actions whose model cost varies, which lets the host reprice the underlying tokens without changing the plan; the lifecycle rule (Hostinger's "permanently deleted" on expiry) matters more than usual, because the customer's site may exist only inside the builder. How hosts bundle and upsell is [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business#upsells-and-attach)'s.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Hyperscaler on-demand** | Per second, if available | Next to the customer's data, IAM and VPC; one bill | The large GPUs often aren't available; highest list price | Highest per hour, no commitment | Inference and experiments inside an existing cloud estate |
| **Hyperscaler block or calendar reservation** | Fixed dates, price set at purchase | Guaranteed capacity for a training run in a known fabric | Hard end date; rates rose through 2026; lead times | Paid for the whole block | Training runs and launches with a date |
| **Neocloud on-demand or cluster** | Per GPU-hour, or two weeks to a year | Lower list prices, InfiniBand clusters on request | Fewer regions and managed services; data egress back to the main cloud | Lower per hour, clusters at a premium | AI startups, fine-tuning, research |
| **Neocloud multi-year take-or-pay** | Dedicated capacity for years, partly prepaid | Price and capacity certainty at scale | Paid whether used or not; tied to one provider's delivery and financing | Lowest per hour, largest commitment | Model labs and hyperscalers |
| **Marketplace or community** | Host-set prices, bid-based interruption | Cheapest consumer and older GPUs | Unknown hosts, interruption, data on a stranger's machine | Lowest, variable | Hobbyists, batch jobs that tolerate eviction |
| **Serverless GPU** | Per second or per output | Scale to zero, no capacity planning | Cold starts; expensive at high utilization | Premium per hour, zero when idle | Spiky inference, image and video generation |
| **Own GPUs** | Buy, colocate, depreciate | Lowest cost at steady high utilization; control | Power density, liquid cooling, refresh cycles, financing | Capital plus colocation | Steady large workloads; see [Where AI Runs](/books/hosting-and-cloud/where-ai-runs#gpus-in-colocation) |

## My Default

For a customer, my default is to rent the smallest commitment that guarantees the capacity the work actually needs: serverless or on-demand for inference and experiments, a time-boxed block for a training run with a date, and a multi-year contract only when utilization above roughly two thirds is already proven on rented capacity. I'd pick a neocloud cluster over a hyperscaler block when the job is pure training and the data can move, and the hyperscaler when the model serves traffic next to data and services that already live there.

For a provider building a GPU product, my default is to sell three shapes from day one (on-demand, time-boxed blocks priced at purchase, and committed contracts) from one capacity model, because each one is a promise against the same pools and overselling one starves the others. I'd treat the fabric as part of the pool rather than a feature, price every reservation as a dated price version, and build export-control screening into account and instance-type eligibility before the first large customer abroad. The tradeoff that would change it is scale: a provider that sells only to two or three labs is a contract and financing business, and should be modeled as one.

## How to Build It

The core model already has the pieces: `commitments` of kind `'resource'` for the promise to pay for capacity, SKUs with unit `'gpu_hour'`, and `usage_events` for what ran. [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#how-to-build-it) owns reservations: resources of kind `'capacity_reservation'` with the `capacity_reservations` side table. A GPU block, calendar booking or capacity contract is one of those reservations; this chapter extends that table with what GPUs add (the pool and fabric, the shape, the price at purchase, the partition key), and adds the capacity pools reservations draw from, and the meters. Reservations follow the playbook's [Reservations & Holds](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory) pattern for pooled inventory: a hold on a finite pool for a time range, checked atomically.

```sql
CREATE TABLE gpu_capacity_pools (        -- what can be promised: one instance type in one fabric
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  region_id        TEXT NOT NULL REFERENCES regions (id),
  zone_id          TEXT REFERENCES zones (id),
  fabric_ref       TEXT NOT NULL,         -- the scale-out domain: 'fabric-3', an UltraCluster
  instance_type    TEXT NOT NULL,         -- 'p5.48xlarge', 'nd-gb200-v6', '8x-h100-sxm'
  gpus_per_unit    SMALLINT NOT NULL CHECK (gpus_per_unit > 0),  -- 8 for a board, 72 for a rack
  units            INT NOT NULL CHECK (units >= 0),  -- installed and sellable
  valid_during     TSTZRANGE NOT NULL,    -- from energization to retirement
  UNIQUE (region_id, fabric_ref, instance_type, valid_during)
);

-- GPU blocks and contracts are capacity_reservations (Regions, Zones, Cells & Quotas),
-- extended with what a GPU reservation adds. starts_at and committed_until are that
-- table's dates; reserved_during is derived from them for the overlap check.
ALTER TABLE capacity_reservations
  ADD COLUMN pool_id          UUID REFERENCES gpu_capacity_pools (id),  -- null: not a GPU pool
  ADD COLUMN shape            TEXT CHECK (shape IN ('capacity_reservation', 'block',
                                'calendar', 'queued', 'contract')),
  ADD COLUMN commitment_id    UUID REFERENCES commitments (id),  -- kind = 'resource'
  ADD COLUMN price_version_id UUID REFERENCES price_versions (id), -- the price at purchase
  ADD COLUMN purchased_at     TIMESTAMPTZ,
  ADD COLUMN partition_key    TEXT,       -- fabric tenant isolation, e.g. an InfiniBand P-Key
  ADD COLUMN end_action       TEXT CHECK (end_action IN ('terminate', 'convert_on_demand')),
  ADD COLUMN reserved_during  TSTZRANGE GENERATED ALWAYS AS
                                (tstzrange(starts_at, committed_until)) STORED,
  ADD CONSTRAINT capacity_reservations_gpu_pool
    CHECK (pool_id IS NULL OR (shape IS NOT NULL AND price_version_id IS NOT NULL
                               AND purchased_at IS NOT NULL AND end_action IS NOT NULL)),
  ADD CONSTRAINT capacity_reservations_contract_commitment
    CHECK ((shape = 'contract') = (commitment_id IS NOT NULL));
-- The states 'queued' and 'undelivered' are in that table's state list.
-- quantity counts instances (units of gpus_per_unit GPUs) for a GPU pool.

-- Placement: instances launched inside a reservation point at it.
ALTER TABLE virtual_machines
  ADD COLUMN capacity_reservation_id UUID REFERENCES resources (id);  -- kind = 'capacity_reservation'
```

Selling a block is a check against everything already promised from the pool over the same dates, run under a lock on the pool row so two sales can't both take the last units ([Preventing Double-Booking](/docs/architecture/reservations-and-holds#preventing-double-booking)):

```sql
-- Units still free in a pool for a requested window. The pool row is locked FOR UPDATE
-- first. Overlap peaks at some reservation's start, so checking each start is enough.
WITH held AS (
  SELECT quantity AS units, reserved_during
  FROM capacity_reservations
  WHERE pool_id = :pool_id
    AND state IN ('scheduled', 'active')
    AND reserved_during && :window
), points AS (
  SELECT lower(:window) AS t
  UNION
  SELECT lower(reserved_during) FROM held WHERE lower(reserved_during) <@ :window
)
SELECT p.units - COALESCE(MAX(load.units_held), 0) AS units_free
FROM gpu_capacity_pools p
LEFT JOIN LATERAL (
  SELECT pt.t, SUM(h.units) AS units_held
  FROM points pt
  JOIN held h ON h.reserved_during @> pt.t
  GROUP BY pt.t
) load ON TRUE
WHERE p.id = :pool_id
GROUP BY p.units;
```

The meters are `usage_events.meter` values rated by core SKUs:

| Meter | Unit | SKU example | Notes |
| --- | --- | --- | --- |
| `gpu.instance_seconds` | second | `gpu.p5-48xlarge.on_demand.second` | Dimensions: purchase option, reservation id; usage inside a block rates at zero against it |
| `gpu.reservation_hours` | gpu_hour | `gpu.block.h200.us-east.gpu_hour` | Emitted for the whole reserved range, used or not; the price version is the one at purchase |
| `gpu.serverless_seconds` | second | `gpu.serverless.h100.second` | Per running container; whether idle counts is a SKU property |
| `inference.outputs` | image, video_second, megapixel | `inference.flux-pro.image` | Per-output models; quantity per output unit |
| `inference.abstract_units` | neuron | `workers-ai.neuron.thousand` | Included daily allowance on the plan version |
| `ai_builder.credits` | credit | `hosting.ai-builder.credit` | Drawn from `plan_versions.included`; never cash |

Notes on the sketch:

- **A pool is an instance type inside one fabric,** because a reservation that spans fabrics can't run one job. `fabric_ref` is what makes a block of 64 instances a cluster rather than 64 machines.
- **The price is fixed at purchase.** `price_version_id` is chosen when the block is bought, so a later rate change (AWS's 2026 increases) never reprices a block already sold, and a dispute can be answered with the rate card in effect on the purchase date.
- **Undelivered is a state.** A contract whose capacity didn't arrive on its delivery date (the clause in Nebius's Microsoft agreement) is `undelivered`, which drives credits or termination rights under [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits); capacity SLA credits on reservations are `credit_grants` of kind `'sla'`.
- **Export eligibility is data.** Which instance types an account may hold, by country, is a `quotas` row with `source = 'risk'` (zero for a restricted country and instance type), set by the screening process that [Sanctions, Exports & Bulletproof Hosts](/books/hosting-and-cloud/sanctions-and-bulletproof-hosts#how-to-build-it) owns, so a licence condition can be proved from the records.
- **Events:** `capacity_reservation.activated` and `capacity_reservation.failed` (the Regions chapter's), plus `capacity_reservation.purchased`, `capacity_reservation.ending_soon`, `capacity_reservation.ended` and `capacity_reservation.undelivered` for GPU pools, go through the [outbox](/docs/architecture/events#the-transactional-outbox), because a block that ends terminates its instances and the customer needs the warning before their checkpoint window.

## Auditing

- **Every reservation and its price.** Pool, units, dates, the price version and purchase time, so an invoice for a block is traceable to the rate card on the day it was bought, not the day it ran.
- **Delivery against contract.** Delivery dates promised, units energized, and any `undelivered` periods, because termination rights and credits depend on them, and lenders and auditors read them as revenue risk.
- **Who used which accelerators from where.** Account country, instance type and the time range of every GPU instance, so the remote-access conditions of an export licence can be shown to have been met.
- **Isolation assignments.** Which fabric partition each cluster held and when, because a tenant-isolation question about a shared fabric is answered from that history.

## What This Means for the System You Build

- **Model GPU capacity as pools inside a fabric,** and sell every shape (on-demand, blocks, contracts) against the same pools.
- **Fix reservation prices at purchase** as dated price versions with region, purchase option and cluster as dimensions.
- **Bill reservations for the whole reserved range,** used or not, and rate instance usage inside them at zero.
- **Make block ends hard and announced,** with events early enough for customers to checkpoint.
- **Record delivery against contract** for committed capacity, with `undelivered` as a state that drives credits.
- **Decide who pays for idle and cold starts** as a SKU property, not a code path.
- **Treat export eligibility as account data:** country, instance type and remote end user, provable later.
- **Report capacity in power as well as GPUs,** because megawatts are what limit what you can sell next year.

## References

**Filings**

- [CoreWeave: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1769628/000176962826000104/crwv-20251231.htm), take-or-pay contracts, duration, prepayments, committed share, Microsoft's share and the Customer A caveat, RPO and its timing, footprint, indebtedness, useful life, named contracts
- [CoreWeave: fourth quarter and fiscal 2025 results (8-K copy)](https://last10k.com/sec-filings/crwv/0001769628-26-000094.htm), 2025 and 2024 revenue
- [CoreWeave: second quarter 2026 results](https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/), quarterly revenue, interest expense, net loss, adjusted operating income, capital spending, backlog, active and contracted power
- [Core Scientific: Form 8-K, 31 October 2025](https://www.sec.gov/Archives/edgar/data/1839341/000114036125040020/ef20058085_8k.htm), the shareholder vote and termination of the CoreWeave merger
- [Nebius: Form 6-K, 8 September 2025](https://www.sec.gov/Archives/edgar/data/1513845/000110465925088312/tm2525580d1_6k.htm), the Microsoft agreement's value, term, delivery and termination terms
- [Nebius: Meta agreement, 6-K exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1513845/000110465925109806/tm2530882d1_ex99-1.htm), about $3 billion over five years
- [Nebius: second quarter 2026 results, 6-K exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1513845/000110465926094568/tm2622968d1_ex99-1.htm), revenue, AI cloud revenue, ARR and its definition, margin, capital spending
- [Nebius: second quarter 2026 shareholder letter, 6-K exhibit 99.2](https://www.sec.gov/Archives/edgar/data/1513845/000110465926094568/tm2622968d1_ex99-2.htm), contracted power target, contract value per MW, expected prepayments

**Provider pricing and documentation**

- [AWS: EC2 Capacity Blocks for ML](https://aws.amazon.com/ec2/capacityblocks/), instance families, sizes, duration, lead time, UltraClusters, dynamic pricing
- [AWS: Capacity Blocks pricing](https://aws.amazon.com/ec2/capacityblocks/pricing/), US East per-instance and per-accelerator rates, the Dallas Local Zone UltraServer rate, the rate at purchase, the January 2027 update
- [AWS News Blog: up to 45% price reduction for GPU instances](https://aws.amazon.com/blogs/aws/announcing-up-to-45-price-reduction-for-amazon-ec2-nvidia-gpu-accelerated-instances/), the June 2025 cuts
- [AWS: P5 instances](https://aws.amazon.com/ec2/instance-types/p5/), EFA bandwidth, NVSwitch, UltraClusters
- [AWS What's New: P5 generally available](https://aws.amazon.com/about-aws/whats-new/2023/07/amazon-ec2-p5-instances-generative-ai-hpc-generally-available), 26 July 2023
- [AWS: P6 instances](https://aws.amazon.com/ec2/instance-types/p6/), P6 network bandwidth and the GB200 UltraServer
- [AWS News Blog: Elastic Fabric Adapter now available](https://aws.amazon.com/blogs/aws/now-available-elastic-fabric-adapter-efa-for-tightly-coupled-hpc-workloads/), EFA general availability in April 2019
- [Microsoft Learn: On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview), billing, capacity SLA example, supported and excluded GPU series
- [Azure Retail Prices API: ND GB200 v6, East US](https://prices.azure.com/api/retail/prices?$filter=armSkuName%20eq%20'Standard_ND128isr_NDR_GB200_v6'%20and%20armRegionName%20eq%20'eastus'), pay-as-you-go, reservation and Spot meters
- [Microsoft Learn: ND H100 v5 series](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/ndh100v5-series), InfiniBand per GPU, Ethernet front end
- [Azure Blog: ND H100 v5 preview](https://azure.microsoft.com/en-us/blog/azure-previews-powerful-and-scalable-virtual-machine-to-help-customers-accelerate-ai/), the March 2023 preview and fabric
- [Google Cloud Blog: Introducing Dynamic Workload Scheduler](https://cloud.google.com/blog/products/compute/introducing-dynamic-workload-scheduler), Flex Start and Calendar mode, December 2023
- [Google Cloud: Calendar mode future reservations](https://docs.cloud.google.com/compute/docs/instances/future-reservations-calendar-mode-overview), 90-day duration, look-ahead and lead time
- [Google Cloud: GPU network bandwidth](https://docs.cloud.google.com/compute/docs/gpus/gpu-network-bandwidth), RoCE NICs and bandwidth per machine type
- [Google Cloud: AI Hypercomputer networking overview](https://docs.cloud.google.com/ai-hypercomputer/docs/networking-overview), rail-aligned sub-blocks and blocks
- [Oracle: Zettascale cloud cluster announcement, September 2024 (archived)](http://web.archive.org/web/20251109203408/https://www.oracle.com/news/announcement/ocw24-oracle-offers-first-zettascale-cloud-computing-cluster-2024-09-11/), orders for up to 131,072 Blackwell GPUs, RoCEv2 or InfiniBand
- [Oracle: Zettascale10 announcement (archived)](http://web.archive.org/web/20260713070719/https://www.oracle.com/news/announcement/ai-world-oracle-unveils-next-generation-oci-zettascale10-cluster-for-ai-2025-10-14/), Acceleron RoCE, cluster size, availability
- [CoreWeave: HPC interconnect](https://docs.coreweave.com/products/networking/hpc-interconnect/about-hpc-interconnect), InfiniBand, SHARP, Spectrum-X on GB300
- [Nebius: GPU clusters](https://docs.nebius.com/compute/clusters/gpu), fabrics, cluster membership at creation, partition keys
- [Lambda: Pricing](https://lambda.ai/pricing), on-demand and 1-Click Cluster prices and terms
- [Lambda: 1-Click Clusters](https://lambda.ai/1-click-clusters), InfiniBand-connected clusters and sizes
- [Lambda: Microsoft agreement](https://lambda.ai/blog/lambda-announces-multibillion-dollar-agreement-with-microsoft-to-deploy-ai-infrastructure-powered-by-tens-of-thousands-of-nvidia-gpus), the November 2025 announcement without value or term
- [Together AI: Pricing](https://www.together.ai/pricing), GPU cluster prices by term and serverless token prices
- [DigitalOcean: GPU Droplets pricing](https://www.digitalocean.com/pricing/gpu-droplets), October 2026 prices, minimum billing, reserved and spot
- [DigitalOcean: GPU Droplets pricing, archived March 2026](http://web.archive.org/web/20260306095551/https://www.digitalocean.com/pricing/gpu-droplets), the earlier H100 prices
- [RunPod: Pricing](https://www.runpod.io/pricing), Community and Secure Cloud and serverless prices
- [Vast.ai: Billing](https://docs.vast.ai/documentation/reference/billing), host-set prices and charges
- [Vast.ai: Rental types](https://docs.vast.ai/documentation/reference/faq/rental-types), on-demand, reserved and interruptible
- [Modal: Pricing](https://modal.com/pricing), per-second GPU, CPU and memory prices, multipliers, plan credits
- [Replicate: Pricing](https://replicate.com/pricing), hardware per second, per-output prices, public versus private idle billing
- [fal: Pricing](https://fal.ai/pricing), per-output and GPU-hour prices
- [Cloudflare: Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), Neurons, free allowance and token prices
- [Cloudflare Blog: Replicate joins Cloudflare](https://blog.cloudflare.com/replicate-joins-cloudflare/), the catalog moving to Workers AI

**Engineering**

- [Fly.io: We Were Wrong About GPUs](https://fly.io/blog/wrong-about-gpu/), GPU passthrough in microVMs, utilization, the L40S
- [Fly.io blog feed](https://fly.io/blog/feed.xml), the post's 14 February 2025 publication date
- [Fly.io Community: GPU deprecation thread](https://community.fly.io/t/gpu-migration-fly-io-gpus-will-be-deprecated-as-of-july-31-2026/27110), the user-reported deprecation notice
- [Meta Engineering: Building Meta's GenAI infrastructure](https://engineering.fb.com/2024/03/12/data-center-engineering/building-metas-genai-infrastructure/), the two 24,576-GPU clusters
- [Gangidi et al., RDMA over Ethernet for Distributed AI Training at Meta Scale (SIGCOMM 2024)](https://engineering.fb.com/wp-content/uploads/2024/08/sigcomm24-final246.pdf), front-end and back-end networks, one NIC per GPU
- [NVIDIA: NVLink](https://www.nvidia.com/en-us/data-center/nvlink/), NVLink bandwidth by generation and the NVL72 domain
- [NVIDIA: GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), rack composition, NVLink domain, memory, liquid cooling
- [NVIDIA: DGX SuperPOD H100 network fabrics](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/network-fabrics.html), rail-optimized scalable units
- [NVIDIA: Mellanox acquisition completed](https://nvidianews.nvidia.com/news/nvidia-completes-acquisition-of-mellanox-creating-major-force-driving-next-gen-data-centers), April 2020
- [Supermicro: GB200 NVL72 rack](https://supermicro.com/en/products/system/gpu/48u/srs-gb200-nvl72), rack power, power shelves and CDU capacities
- [SemiAnalysis: GB200 hardware architecture](https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component), NVL72 rack power against air-cooled H100 racks

**Regulation**

- [BIS: Rescission of the AI Diffusion Rule](https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related), non-enforcement, the planned replacement, the Huawei Ascend guidance
- [Federal Register: BIS final rules from 16 January 2026](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=industry-and-security-bureau&conditions[publication_date][gte]=2026-01-16&conditions[type][]=RULE), no replacement or formal rescission published
- [Federal Register: Revision to License Review Policy for Advanced Computing Commodities (91 FR 1684)](https://www.federalregister.gov/documents/2026/01/15/2026-00789/revision-to-license-review-policy-for-advanced-computing-commodities), thresholds, the 50% aggregate TPP limit, KYC, testing, IaaS end users
- [BIS: Revised license review policy for China](https://www.bis.gov/press-release/department-commerce-revises-license-review-policy-semiconductors-exported-china), the case-by-case policy and its conditions
- [Federal Register: Enhanced Favorable Treatment for the United Arab Emirates (91 FR 43034)](https://www.federalregister.gov/api/v1/documents/2026-14132.json), the move to Country Group A:5 and its dates
- [House Clerk: Roll call 13, 12 January 2026](https://clerk.house.gov/evs/2026/roll013.xml), H.R. 2683 passing the House
- [Reginfo.gov: RIN 0694-AJ35](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202510&RIN=0694-AJ35), the IaaS rule proposed in 2024 and withdrawn on 16 December 2025

**In practice**

- [SDxCentral: AWS raises H200 Capacity Block prices](https://www.sdxcentral.com/news/aws-quietly-increases-prices-for-h200-ec2-instances-by-15/), the January 2026 increase and AWS's statement
- [Converge Digest: AWS raises GPU reservation prices about 20%](https://convergedigest.com/aws-raises-ec2-prices-by-about-20-for-ai-gpu-reservations/), the July 2026 rates
- [AI Weekly: Commerce drafts rule on remote AI chip access](https://aiweekly.co/alerts/commerce-drafts-rule-to-shut-chinas-remote-ai-chip-access), the reported draft rule
- [Crusoe: Series E](https://www.crusoe.ai/resources/newsroom/crusoe-announces-series-e-funding), October 2025 funding and valuation
- [Crusoe: Series F](https://www.crusoe.ai/resources/newsroom/crusoe-announces-series-f-funding), September 2026 funding, valuation, contracted and operational capacity
- [Crusoe: 900 MW Abilene campus for Microsoft](https://www.crusoe.ai/resources/newsroom/crusoe-announces-new-900-mw-ai-factory-campus-in-abilene-texas-to-support-microsoft-ai-infrastructure), the March 2026 announcement
- [Hostinger: Horizons](https://www.hostinger.com/horizons), the AI Builder modes, credits and deletion of expired projects
- [Marketing Dive: GoDaddy Airo](https://www.marketingdive.com/news/godaddy-airo-generative-ai-tool-small-business-campaign/708453/), the February 2024 launch
- [GoDaddy: Q2 2024 results (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1609711/000160971124000132/gddyex991-20240630xq2earni.htm), Airo on new and existing domain purchases
- [GoDaddy: Airo.ai launch (wire copy)](https://www.placera.se/pressmeddelanden/godaddy-godaddy-brings-agentic-ai-to-small-businesses-with-launch-of-airo-ai-20251113), the agentic beta with six agents
- [GoDaddy: Airo for WordPress](https://aboutus.godaddy.net/newsroom/news-releases/press-release-details/2026/GoDaddys-Airo-for-WordPress-Delivers-AI-that-Builds-Grows-and-Continuously-Improves-Websites/default.aspx), May 2026
- [Newfold Digital: Bluehost AI Website Creator](https://newfold.com/newsroom/let-bluehost-ai-create-your-wordpress-website-in-minutes), the WordCamp Europe 2024 showing
- [Bluehost Blog: AI Website Builder](https://www.bluehost.com/blog/?p=270831), clarifying questions and the 14-day trial
