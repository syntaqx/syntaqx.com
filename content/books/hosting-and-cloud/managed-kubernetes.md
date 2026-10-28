+++
title = "Managed Kubernetes"
description = "EKS, GKE, AKS and the developer clouds: control-plane fees and SLAs, node pools and upgrades, release channels, forced upgrades, and extended support."
category = "Hosting & Cloud Industry"
order = 2127
part = "Kubernetes"
tags = ["kubernetes", "managed-kubernetes", "control-plane", "upgrades", "extended-support", "sla"]
+++

A managed Kubernetes service is a provider running the part of a cluster that customers least want to run: the API servers, etcd, the scheduler and the controllers, spread across zones, patched, backed up and upgraded, behind one endpoint the customer reaches with `kubectl`. The customer keeps the nodes, or rents them through the provider's node pools, and everything that runs on them. The split is clean on paper and leaky in practice. The control plane's version decides which APIs the customer's manifests may use, the nodes must stay within three minors of it, the add-ons that make a cluster usable (the network plugin, DNS, the storage driver) have versions of their own, and upstream Kubernetes patches each minor for only about fourteen months. A managed service therefore sells two things at once: someone else running etcd, and someone else deciding when the customer upgrades.

For the provider, that second part is the hard product. Every cluster is a fleet of components to keep on supported versions without breaking workloads the provider can't see, so the provider needs node pools that replace machines without dropping capacity, release channels that move clusters forward on a schedule, maintenance windows customers can steer, a policy for clusters that never upgrade, and a price for the ones that pay to stay behind. The market has converged on most of the answers: $0.10 per cluster-hour for a control plane with an SLA, about $0.60 for one on an old minor, forced upgrades at the end of support, and a node-less mode for customers who don't want node pools at all.

This chapter covers how the providers sell and run it: what the provider operates, node pools and node upgrades, release channels and forced upgrades, maintenance windows and exclusions, SLAs and provisioned control planes, extended support as a priced product, node-less modes and hybrid nodes at the product level, managed add-ons, what the customer still owns once all of that is bought, and build versus buy. The machinery underneath (the control loop, the release cadence, the skew policy) is [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s, and pre-2014 scheduler history is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers). Node autoscaling and how node-less modes bill are [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#how-providers-bill-clusters)'s. The upgrade routine on the customer's side is the playbook's [Upgrades and Version Skew](/docs/operations/kubernetes#upgrades-and-version-skew). The chapter adds the `node_pools` side table, `cluster_upgrades` and its notices, and the control-plane and extended-support SKUs to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

## How the Providers Do It

| Provider | Control plane, as of October 2026 | Support window and the paid tail | When the customer doesn't upgrade | Control plane SLA | Node-less mode |
| --- | --- | --- | --- | --- | --- |
| **Amazon EKS** | $0.10 per cluster-hour; Provisioned Control Plane tiers XL $1.65, 2XL $3.40, 4XL $6.90, 8XL $13.90 per hour on top | 14 months standard, then 12 months extended at $0.60 per cluster-hour in total; extended on by default | Upgrade policy `STANDARD`: auto-upgraded at end of standard. At end of extended, the control plane is upgraded "at any time" without notice; nodes are not | 99.95% (5-minute intervals); 99.99% on Provisioned Control Plane (1-minute intervals) | Auto Mode; Fargate |
| **Google GKE** | $0.10 per cluster-hour for every cluster, billed per second; a $74.40 monthly credit per billing account covers one zonal or Autopilot cluster | Release channels Rapid, Regular (default), Stable and Extended; 14 months standard, up to 24 months on Extended at $0.50 per cluster-hour extra in the extended period | Control planes and nodes upgraded at end of support "regardless of release channel enrollment"; on Extended, "regardless of blocking issues" | Zonal 99.5%; regional and Autopilot 99.95%; Stockholm the only exception at 99.9% | Autopilot |
| **Azure AKS** | Free tier: no fee, no SLA, up to 1,000 nodes; Standard: $0.10 per hour; Premium (LTS): $0.60 per hour; AKS Automatic: $0.16 per hour plus per-vCPU management meters | Three most recent minors in community support; LTS adds a year on Premium, about 24 months in total | From June 1, 2027, platform-initiated upgrades after a 60-day grace period, outside maintenance windows and able to override PDBs | 99.95% with availability zones, 99.9% without, on Standard and Premium | AKS Automatic |
| **DigitalOcean DOKS** | Free; high-availability control plane $40 a month | Usually the three most recent minors | Upgraded to the next minor in the maintenance window 30 days after end of support, with emails 30, 7 and 1 days before | 99.95% per month, HA control plane only | None |
| **Akamai (Linode) LKE** | Free; HA control plane from $60 per cluster-month; LKE Enterprise $300 per cluster-month with a dedicated HA control plane | Versions deprecated periodically | Upgraded to the next minor at a scheduled time after email notice; control plane patches applied automatically | Not on the pricing page | None |
| **Oracle OKE** | Basic clusters free, with an SLO; enhanced clusters $0.10 per cluster-hour, with an SLA | Three versions for new clusters; the fourth stays supported for at least 30 days after a new one | The version "ceases to be supported"; no forced upgrade on the page opened | Financially backed SLA on enhanced clusters only | Virtual nodes, on enhanced clusters |
| **OVHcloud MKS** | Free plan with a 99.5% SLO, up to 100 nodes; Standard plan $0.099 per cluster-hour, up to 500 nodes, with a dedicated 8 GB etcd | Not covered here | Not covered here | Standard: 99.99% in 3-AZ regions, 99.9% in 1-AZ regions | None |

Three patterns run through the table:

- **The hyperscalers converged on $0.10 an hour, and the developer clouds give the control plane away.** EKS, GKE, AKS Standard and OKE enhanced all charge $0.10 per cluster-hour, and OVHcloud's Standard plan $0.099; DigitalOcean, Akamai, Azure's Free tier and OKE basic charge nothing and sell high availability or an SLA as the upgrade. The fee buys an SLA more than it buys etcd.
- **Staying behind costs six times as much.** EKS's extended support, GKE's Extended channel and AKS's LTS tier all land at $0.60 per cluster-hour, a price for the provider's own patching after upstream stops.
- **Every provider ends with a forced upgrade.** The paid tail is finite, and the date, the notice and whether maintenance windows and PodDisruptionBudgets still hold are where the providers differ.

## How Managed Kubernetes Got Here

Kubernetes was announced on June 10, 2014; what came before it, from Borg on, is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#how-it-got-here). The managed services followed in three waves: Google first, then the other hyperscalers and the developer clouds, then a long run of pricing and upgrade-policy changes.

| Step | When | What it solved | What it cost |
| --- | --- | --- | --- |
| Google Container Engine GA | August 26, 2015 | The first managed Kubernetes control plane, from the company that wrote Kubernetes | Before November 2017, a flat $0.15 an hour to manage clusters of six or more nodes |
| GKE drops its fee | November 28, 2017: "eliminated the cluster management fee... for any size cluster" | A free managed control plane at any size | Nothing financially backed for the control plane |
| Amazon EKS GA | June 5, 2018, in two regions; certified conformant, control plane across three Availability Zones | A managed control plane on AWS, with failed control plane nodes "monitored and replaced" | $0.20 per hour per cluster |
| AKS GA | June 13, 2018, in ten regions | Microsoft's managed service, with no charge "for our management infrastructure" | Free management, since split into a Free tier without an SLA and paid Standard and Premium tiers |
| DigitalOcean Kubernetes GA | May 21, 2019: "your master node is free", with scheduled automatic patch upgrades | Managed Kubernetes on a developer cloud at node prices only | High availability is a paid option today, $40 a month |
| Linode Kubernetes Engine open beta | November 19, 2019, control plane "for free" | The same offer on Linode | General availability was expected in early 2020 |
| EKS on Fargate | December 3, 2019 | Pods without nodes | Launch limits on pod size, storage and DaemonSets |
| EKS fee halved | January 21, 2020: "by 50% to $0.10 per hour for each Kubernetes cluster" | Small clusters stop costing $146 a month in control plane alone | |
| GKE fee returns | From June 6, 2020, $0.10 per cluster-hour, one free zonal cluster per billing account, with an SLA of 99.95% for regional and 99.5% for zonal clusters | A financially backed control plane on GKE | A fee on every cluster beyond the free zonal one |
| GKE Autopilot | February 24, 2021 | Google SREs manage the nodes | Less control over nodes, priced per pod |
| EKS extended support | Preview free from October 4, 2023; priced from April 1, 2024 at $0.60 per cluster-hour in total | A version can stay supported for 26 months | Six times the standard rate |
| GKE extended support | July 17, 2024: up to 24 months from 1.27, through the Extended channel | The same on GKE | $0.50 per cluster-hour on top in the extended period |
| EKS Auto Mode | December 1, 2024 | AWS runs compute, storage, load balancing and networking for the cluster | A per-instance management fee |
| AKS Automatic GA | Release notes of August 29, 2025 | A preconfigured cluster with managed nodes and a pod readiness SLA | $0.16 an hour plus per-vCPU meters |
| EKS Provisioned Control Plane | November 27, 2025, tiers XL to 4XL, later 8XL | Control plane capacity bought ahead of demand | $1.65 to $13.90 an hour on top of the cluster fee |
| GKE removes "No channel" | June 14, 2027: remaining clusters enrolled in Stable | Every GKE cluster on a release channel | No opt-out from the channel schedule |
| AKS platform-initiated upgrades | From June 1, 2027 | No AKS cluster stays on an unpatched version | Upgrades outside maintenance windows that can override PDBs |

The arc is a free control plane becoming a paid one with an SLA, then a paid one on a schedule. Every free offer was eventually split into a free tier without guarantees and a paid tier with them, and every "stay on your version" option was eventually priced and then bounded.

## What the Provider Runs

The control plane lives in the provider's account, not the customer's. EKS's launch post put it "in high-availability fashion across three AWS Availability Zones," with the API server and etcd as the control plane and failed nodes "monitored and replaced." AKS distributes the control plane across zones automatically in regions that have them, "regardless of whether the node pools are configured to use availability zones." GKE sells the choice: a zonal cluster has one control plane location and a 99.5% SLA, a regional cluster spreads it across the region's zones for 99.95% (what a zone promises is [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#what-a-zone-promises)). The customer never sees the machines; what it sees is an endpoint, a version and a bill.

The endpoint is the product's front door, and its access modes are a security decision. On EKS the API server endpoint is public by default, secured by IAM and Kubernetes RBAC, and can be limited to a list of public access CIDRs. Enabling private access adds a private hosted zone so that nodes reach the API server inside the VPC; disabling public access makes the API server reachable only from the VPC or a connected network. The cluster security group governs the private endpoint and the connections to the kubelet API that `kubectl exec`, `logs` and `port-forward` use. The control plane needs reachability in the other direction too, for admission webhooks and OIDC providers in the customer's VPC.

What the customer can't see, the provider is free to change. EKS's standard control plane "automatically scales up and down based on your workload demands" and supports up to 8 GB of etcd. GKE's maintenance documentation lists maintenance of a "Spanner-based cluster state database" among the work that maintenance windows don't block, which tells the customer that the state store behind a managed API need not be the etcd an upstream install runs. The API is the contract; the implementation is the provider's.

## Node Pools and Node Upgrades

A node pool is a set of nodes with one configuration (instance type, node image, Kubernetes version, labels and taints) that the provider creates, scales, repairs and replaces as a group. EKS calls it a managed node group, GKE and AKS a node pool, and under each sits the cloud's instance-group API: an EC2 Auto Scaling group, a managed instance group, a VM scale set. Node versions move separately from the control plane: upgrading an EKS control plane doesn't upgrade managed node groups, "these instances aren't automatically upgraded when you or Amazon EKS update your control plane," and AKS won't let a node pool run newer than its control plane, which may be up to three minors ahead.

Every provider replaces nodes rather than patching them, and the parameters that control it are the same nouns everywhere:

| Provider | Default strategy | Surge and unavailability | Drain and timing |
| --- | --- | --- | --- |
| **EKS managed node groups** | `default`: new nodes before old ones are terminated; `minimal` terminates first, for scarce capacity such as GPUs | `updateConfig` max unavailable, default one node, quota 100; scale-up adds the larger of twice the Availability Zones or the max unavailable | Each new node must bootstrap within 15 minutes; pods not drained in 15 minutes fail the upgrade with `PodEvictionFailure` unless forced; 60 seconds after eviction before termination |
| **GKE node pools** | Surge, `maxSurge=1`, `maxUnavailable=0`; blue-green and autoscaled blue-green (preview) | The sum of the two capped at 20 nodes on Autopilot, 100 on Standard | PDBs and graceful termination respected for up to one hour, then pods are forcefully evicted; blue-green soaks for one hour by default, drains in batches, and deletes the old pool without respecting PDBs |
| **AKS node pools** | Rolling with one surge node; `--max-surge` recommended at 33% for production | `--max-unavailable` default 0, for in-place upgrades without surge quota; not on system pools | `--drain-timeout` default 30 minutes (5 minutes to 24 hours); `--node-soak-duration` 0 to 30 minutes; on 1.35+, falls back to a surge of one when quota is short |
| **LKE** | Recycle all nodes on a rolling basis, "only a single node is down at any time" | Not configurable on the page opened | In-place and out-of-place upgrades are the alternatives |

The shapes are the playbook's [rolling](/docs/delivery/deployment-strategies#rolling) and [blue-green](/docs/delivery/deployment-strategies#blue-green) strategies applied to machines. Surge keeps capacity at the price of extra quota, which is why AKS warns that a 50% surge on 20 nodes needs 10 more nodes of compute and IP quota, and why both EKS and AKS offer a strategy that removes nodes first for customers who can't get more. Blue-green buys a rollback, which GKE allows in every phase except deleting the old pool, at the price of running both pools for the soak. The customer's side of the bargain is the playbook's [rollouts and disruptions](/docs/operations/kubernetes#rollouts-and-disruptions): PodDisruptionBudgets that allow progress, because a budget that blocks every eviction is the commonest reason a node upgrade fails ("Aggressive PDB," in EKS's list).

Node repair is the same replacement triggered by health instead of version. GKE repairs nodes that report `NotReady` or no status for about 10 minutes, or whose boot disk is full for about 30, by draining (waiting up to an hour) and recreating them, and it's on by default for new Standard node pools and always on in Autopilot. AKS reboots, then reimages, then (on Linux) redeploys a node that has stayed unhealthy for five minutes, retries the sequence up to three times within about an hour, and emits events such as `NodeRebootStart` from the `aks-auto-repair` source. DOKS replaces worker nodes that "stay unhealthy" through its data plane operator. Repair events matter to the customer for the same reason upgrades do: they are the provider evicting pods.

## Release Channels and Forced Upgrades

A release channel is a promise about when a cluster will be moved forward, and it is the provider's main tool for keeping a fleet on supported versions. GKE's are the reference design:

| GKE channel | New minors arrive | Become the auto-upgrade target |
| --- | --- | --- |
| Rapid | 1 to 2 weeks after upstream GA; excluded from the SLA | 1 to 2 months after release to Rapid |
| Regular (default) | About 2 months after Rapid | About 3 months after release to Regular |
| Stable | 3 to 4 months after Regular | About 2 months after release to Stable |
| Extended | Aligned with Regular | Aligned with Regular; may stay on a minor for up to 24 months |

Patch versions become auto-upgrade targets at least a week after they reach a channel, minors at least four weeks (Rapid) or eight weeks (Regular, Stable). Node auto-upgrade is on by default. "No channel," the old way to opt out, is deprecated, closed to new customers and removed on June 14, 2027, when remaining clusters are enrolled in Stable.

AKS splits the same idea in two. A cluster auto-upgrade channel (`none`, the default on AKS Standard; `patch`; `stable`, which tracks the latest patch of minor N-1; `rapid`; and the legacy `node-image`) moves Kubernetes, always control plane first and node pools after; AKS Automatic is fixed to `stable` on a weekly cadence. A separate node image auto-upgrade channel (`NodeImage`) moves node images. EKS has no channels: the customer upgrades, and the cluster's upgrade policy (`EXTENDED` by default, or `STANDARD`) decides what happens when support ends. DOKS and LKE apply patch upgrades for the customer and force minors at end of life.

How long a version lasts is the provider's calendar laid over upstream's. Kubernetes supports each patch series for "roughly fourteen (14) months," twelve months standard and two of maintenance mode ([Release Cadence and Support Windows](/books/hosting-and-cloud/kubernetes-architecture#release-cadence-and-support-windows) has the policy). The providers ship each minor weeks after upstream and keep it longer. One version, 1.34, shows the spread:

| | Released | End of standard support | End of the paid tail | Forced upgrade |
| --- | --- | --- | --- | --- |
| **Upstream** | August 27, 2025 | October 27, 2026 | | |
| **EKS** | October 2, 2025 | December 2, 2026 | December 2, 2027 | After end of extended, "at any time" |
| **AKS** | November 2025 | November 2026 | LTS end of life November 2027 | June 2027 without LTS; February 2028 with it |
| **DOKS** | November 19, 2025 | October 27, 2026 | | Upgrades begin November 26, 2026 |

The forced upgrade is where the providers' policies differ in substance:

- **EKS** auto-upgrades a cluster with policy `STANDARD` at the end of standard support. At the end of extended support it upgrades the control plane "through a gradual deployment process," with no specific time frame and "no notification before the update"; managed node groups and self-managed nodes stay on the old version, and a cluster upgraded this way can't use the 7-day rollback that in-place upgrades get. Standard-support end dates are announced at least 60 days ahead, through the AWS Health Dashboard about 12 months after a version's EKS release.
- **GKE** upgrades control planes and nodes at end of support regardless of channel, and on Extended "regardless of blocking issues," such as use of deprecated APIs that would otherwise pause an auto-upgrade.
- **AKS** gives a version 30 days' notice before removal and a 60-day platform support grace period after end of life. From June 1, 2027, a cluster still unsupported after the grace period gets a platform-initiated upgrade, one minor at a time, that "doesn't follow your maintenance window," "doesn't stop for deprecated API usage," and "can override a Pod Disruption Budget." Before that, AKS already moves clusters about to fall from N-3 to N-4 up to N-2.
- **DOKS** upgrades to the next minor in the cluster's maintenance window 30 days after the release becomes unsupported, "even if auto-upgrades are disabled," with emails 30, 7 and 1 days before; for serious vulnerabilities it may end a patch version with at least 7 days' notice.
- **LKE** emails ahead and upgrades "automatically... at the scheduled time" to the next consecutive minor, recycling the nodes.
- **OKE**'s version page says only that an old version "ceases to be supported."

## Maintenance Windows and Exclusions

Channels decide what a cluster upgrades to; maintenance windows decide when. GKE allows one recurring window per cluster and up to 20 exclusions, of three scopes: "no upgrades" (minor and patch, at most 90 days, at most three of them, and they must leave 48 hours of maintenance availability in any 92-day rolling window), "no minor upgrades," and "no minor or node upgrades." Exclusions can't run past the minor's end-of-support date, except a temporary emergency "no upgrades" exclusion of up to 90 days, which GKE doesn't recommend. Node pools can have one exclusion each on clusters enrolled in a channel. AKS starts cluster auto-upgrades in the planned maintenance window (`aksManagedAutoUpgradeSchedule`), which should be "four hours or more" to work properly.

What windows don't stop matters as much as what they do. GKE reserves "the right to override maintenance policies for critical security vulnerabilities" and doesn't hold control plane repairs, host maintenance or end-of-support upgrades for a window. AKS's platform-initiated upgrades ignore windows. A window is a preference the provider honors for routine work, and the customer's real control is upgrading before the provider has to.

## SLAs and Provisioned Control Planes

A control plane SLA promises that the API server answers, not that workloads run, and the providers measure it differently:

| Provider | Commitment, as of October 2026 | Measured | Credits |
| --- | --- | --- | --- |
| **EKS** | 99.95% monthly; 99.99% on Provisioned Control Plane | 5-minute intervals; 1-minute on Provisioned | 10% below the commitment, 25% below 99.0%, 100% below 95.0% |
| **GKE** | Zonal control plane 99.5%; regional and Autopilot control plane 99.95%; Autopilot pods across zones 99.9%; Stockholm 99.9% and 99.5% | Per the SLA page | Per the SLA page |
| **AKS** | API server 99.95% with availability zones, 99.9% without, on Standard and Premium; Free tier best effort; AKS Automatic adds a pod readiness SLA (99.9% of qualifying operations within five minutes) | Per the SLA page | Per the SLA page |
| **DOKS** | 99.95% per month, HA control plane only, from the billing period starting July 1, 2022 | Monthly | 10% below 99.95%, 25% below 99%, 100% below 95% |
| **OKE** | Financially backed SLA on enhanced clusters; basic clusters have an SLO | | |
| **OVHcloud MKS** | Standard 99.99% (3-AZ) or 99.9% (1-AZ); Free plan 99.5% SLO | | |

The SLA is also a version policy. GKE excludes Rapid channel versions from it; DOKS excludes downtime from maintenance and automated upgrades. A customer comparing SLAs compares the clauses, not the percentages.

EKS's Provisioned Control Plane turns control plane capacity into a SKU. A standard EKS control plane scales itself; a provisioned one is pinned to a tier with published limits that vary by Kubernetes version. On 1.34 and later:

| Tier | API request concurrency (seats) | Pod scheduling rate (pods/s) | etcd size | HPA sync concurrency | Price per hour, on top of the cluster fee |
| --- | --- | --- | --- | --- | --- |
| XL | 2,000 | 167 | 16 GB | 50 | $1.65 |
| 2XL | 4,000 | 283 | 16 GB | 100 | $3.40 |
| 4XL | 8,000 | 400 | 16 GB | 200 | $6.90 |
| 8XL | 16,000 | 400 | 16 GB | 200 | $13.90 |

Seats are API Priority and Fairness seats, so effective throughput depends on the mix of requests (lists cost more than gets). The tier doesn't scale itself, can be changed without API server downtime through an update of type `ScalingTierConfigUpdate`, and has an exit restriction: a cluster whose etcd grew past standard mode's 8 GB can't return until it shrinks. AWS's own advice is to load-test on 8XL and pick a tier from the utilization metrics. What it sells is predictability (capacity in place before a launch, a sale or a training job) and the 99.99% SLA and a control plane priced by capacity rather than by the cluster.

## Extended Support

Extended support is the providers' answer to upstream's fourteen months. A customer that can't upgrade three times a year either moves to a provider's long window or runs an unpatched API server, and the providers decided to sell the long window and to do the patching themselves: EKS backports "security patches that are applicable" and patches the VPC CNI, kube-proxy, CoreDNS, its node images and Fargate for extended versions; AKS backports security fixes during the LTS year, with help from the upstream LTS working group.

| | EKS extended support | GKE Extended channel | AKS long-term support |
| --- | --- | --- | --- |
| **Price, as of October 2026** | $0.60 per cluster-hour in total ($0.10 plus $0.50) | $0.50 per cluster-hour on top of $0.10, only once the extended period starts; included in GKE Enterprise when announced | $0.60 per hour for the Premium tier, the whole time the cluster is on it |
| **Length** | 14 months standard plus 12 extended: 26 months | 14 months standard plus about 10: up to 24 months, from 1.27 | One year of community support plus one of LTS: about 24 months |
| **How it starts** | Automatically: upgrade policy `EXTENDED` is the default for new and existing clusters; billing starts at the beginning of the UTC day standard support ends | Enrollment in the Extended channel; no extra charge during standard support | `--tier premium --k8s-support-plan AKSLongTermSupport`; Premium and LTS are enabled together |
| **How it ends** | Control plane auto-upgraded to the oldest supported version, at any time, without notice | Upgraded regardless of blocking issues | Platform-initiated upgrade to the next LTS version after a 60-day grace period |
| **Patches** | Control plane, core add-ons, EKS-optimized AMIs, Fargate | Security patches | Only the two most recent patch versions of each LTS minor |

At $0.50 an hour, the extended surcharge is about $365 a month per cluster for 730 hours, more than a small node pool, and that is the point. The price is high enough that customers upgrade unless they can't, and it pays the provider for maintaining a fork of an unsupported Kubernetes. The defaults differ in a way customers feel: EKS enrolls every cluster and bills it the day standard support ends, so a forgotten cluster costs six times as much, while GKE and AKS require the customer to choose the Extended channel or Premium. AKS's model also differs in shape: the $0.60 is the Premium tier's rate, charged while the cluster is on Premium, not from the day its version ages, so it is a tier rather than a surcharge.

DOKS, LKE, OKE and OVHcloud showed no paid tail on the pages opened. Their policy is the short one: upgrade on upstream's schedule, or be upgraded.

> [!WARNING] Extended support delays the upgrade; it doesn't remove it
> Every provider's tail ends in an automatic upgrade the customer doesn't schedule, and by then the cluster has two or more minors of removed APIs to cross. EKS upgrades only the control plane, leaving nodes and add-ons for the customer to catch up within the skew policy; GKE and AKS override the checks that would otherwise stop them. A cluster in extended support needs an upgrade plan with a date, not a budget line.

## Node-Less Modes, Hybrid Nodes and Arc

Node-less modes move the node pool itself to the provider, and at the product level they differ in how much of the cluster comes with it:

- **GKE Autopilot** (February 24, 2021): Google SREs manage the nodes; the customer sees pods and is billed for their requests. Since September 24, 2025, Autopilot workloads can run inside Standard clusters, starting with Rapid channel clusters on 1.33.1-gke.1107000 or later.
- **EKS Auto Mode** (December 1, 2024): AWS manages compute selection and scaling, OS patching, load balancing, block storage, pod and service networking, network policy, DNS and core add-ons, with those controllers running on AWS-owned infrastructure.
- **AKS Automatic** (GA in the release notes of August 29, 2025): a Standard-tier cluster preconfigured with node auto-provisioning, the `stable` upgrade channel, node auto-repair and up to 5,000 nodes, adding a pod readiness SLA.
- **EKS on Fargate** (December 3, 2019): each pod gets its own Fargate node selected by a Fargate profile; Fargate pods aren't upgraded with the control plane and must be restarted to pick up a new kubelet.
- **OKE virtual nodes**: serverless node pools, available on enhanced clusters only.

How each one bills, and who owns the packing, is [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#how-providers-bill-clusters)'s; how they scale nodes is in its node autoscaling section. For this chapter they matter because they change the upgrade bargain: the provider replaces nodes on its schedule, so the customer's PDBs and graceful shutdown are the only controls left.

Hybrid nodes run the other way: the provider's control plane, the customer's machines. **EKS Hybrid Nodes** attaches on-premises and edge machines to an EKS cluster, billed per vCPU-hour from $0.020 down to $0.006 by monthly volume; AWS runs the control plane and the customer manages the nodes, upgrades them, and keeps "a reliable connection" to AWS (disconnected sites are pointed at EKS Anywhere instead). **Azure Arc** projects Kubernetes clusters running anywhere into Azure Resource Manager and pushes configuration to them with Flux, with no charge for the Arc control plane itself. Both are [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud)'s subject; here they extend the control plane fee model to machines the provider doesn't own.

## Managed Add-Ons

A cluster isn't usable without the network plugin, kube-proxy and DNS, and every provider decides how much of that it owns. EKS installs the VPC CNI, kube-proxy and CoreDNS on every cluster, and its **EKS add-ons** manage a curated set: AWS add-ons "built and fully supported by AWS," AWS Marketplace add-ons supported by partners, and community add-ons such as Metrics Server that AWS packages and validates only for Kubernetes version compatibility. Add-ons are installed and updated through the EKS API, customers can still change fields EKS doesn't manage through server-side apply, and the provider's identity `eks:addon-manager` holds cluster-admin through a binding the customer can delete (at which point EKS stops managing add-ons). OKE draws the line by cluster type: only enhanced clusters let the customer choose add-on versions or opt into automatic updates by Oracle. AKS's LTS documentation lists add-ons whose lifecycles don't follow the Kubernetes version, so a cluster can be on a supported Kubernetes minor and an unsupported add-on.

For the provider, an add-on is a version matrix: each add-on version is compatible with some Kubernetes minors, the control plane upgrade can strand an add-on, and EKS's end-of-extended upgrade tells customers to "manually update cluster add-ons" afterward. The networking add-ons are [Cluster Networking](/books/hosting-and-cloud/cluster-networking)'s, storage drivers [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage)', and managed GitOps [Packaging & GitOps](/books/hosting-and-cloud/packaging-and-gitops)'.

## What You Still Own on a Managed Cluster

The providers publish where their half ends, and the three hyperscalers draw the line in nearly the same place. EKS takes "the Kubernetes control plane, which includes the control plane nodes and `etcd` database," and leaves the customer the data plane's security configuration, "the configuration of the nodes and the containers themselves," and "the node's operating system (including updates and security patches)." GKE hardens and patches the control plane and the node OS, and leaves the customer its workloads, RBAC and IAM policy, credential rotation, keeping Standard node pools enrolled in automatic upgrades, and monitoring, with the warning that without logging and monitoring enabled "support is available on a best-effort basis." AKS publishes a full matrix: as of October 2026, Microsoft owns the control plane, `etcd` backups and node auto-repair; upgrades, node OS patching, managed add-ons, the CNI and platform monitoring are shared, meaning "Microsoft provides and maintains a capability and you enable, configure, or schedule it"; and RBAC, secrets management, network policies, pod security, workload monitoring and cluster backup are the customer's alone.

Laid side by side, the control-plane fee leaves this list with the customer:

| Item | What the provider manages | What the customer owns | Source |
| --- | --- | --- | --- |
| **The upgrade treadmill** | New minors and patches, a support calendar, a paid tail, a forced upgrade at the end | Upgrading about three times a year inside a window of about fourteen months ([Release Cadence and Support Windows](/books/hosting-and-cloud/kubernetes-architecture#release-cadence-and-support-windows)), clearing removed APIs from its manifests first, or paying for [Extended Support](#extended-support) | AKS: the customer must "Trigger and schedule the upgrade" |
| **Node pools and the OS** | Node images; GKE patches the node OS when auto-upgrade or a release channel is on; AKS publishes images weekly and repairs unhealthy nodes | Pool shape (VM size, count, labels, taints), keeping auto-upgrade on, budgets that let a drain finish; on EKS, the node OS's "updates and security patches"; on AKS, applying images within 90 days | EKS, GKE and AKS responsibility pages |
| **Cluster add-ons** | A curated set: the CNI, kube-proxy, CoreDNS, CSI drivers, Metrics Server, the provider's own ingress | Enabling, configuring and upgrading them, and everything outside the set: the ingress or Gateway controller, cert-manager, external-dns, the node autoscaler ([Node Autoscaling](/books/hosting-and-cloud/autoscaling-and-cost#node-autoscaling-cluster-autoscaler-and-karpenter)) | AKS lists third-party ingress controllers as unsupported, including one "ceasing to work following a Kubernetes version upgrade," and application certificates as out of scope |
| **Secrets** | Encryption of the state store | Where secrets come from, who reads them, rotation ([Secrets](/docs/operations/kubernetes#secrets)) | AKS: "Secrets management," customer |
| **Policy** | Admission machinery; optional managed policy add-ons | RBAC, Pod Security Standards, network policies, the policy engine and its rules ([Policy Engines](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#policy-engines-kyverno-and-gatekeeper)) | AKS matrix; GKE: "Role-based access control (RBAC)/IAM policy" |
| **Backup** | Control plane state (AKS backs up `etcd` every 30 minutes, not available to the customer) | Workload, volume and cluster-configuration backup and the restore drill ([Backup and Restore](/books/hosting-and-cloud/kubernetes-storage#backup-and-restore)) | AKS: "Cluster backup and disaster recovery," customer |
| **Observability** | Control plane logs and metrics, exported when the customer turns them on; paid telemetry add-ons | Collecting, storing, graphing and alerting on everything the workloads emit | Below |

Observability is the item that catches teams out, because Kubernetes doesn't ship it. The project's logging documentation says so plainly: "Kubernetes does not provide a native storage solution for log data," and cluster-level logging architectures "require a separate backend to store, analyze, and query logs." The kubelet only rotates container log files on the node (10 MiB and five files by default), and `kubectl logs` returns only the latest file. Metrics are the same shape: the API server exposes Prometheus metrics, and something has to scrape, store, graph and alert on them. On a managed cluster that means one of two things. Either the customer assembles a stack (Prometheus or OpenTelemetry collectors, a log shipper such as Fluent Bit as a DaemonSet, a metrics and log store, dashboards, alert routing) and then upgrades it like any other add-on, or it turns on the provider's telemetry and pays for it by volume:

- **EKS:** control plane logs "aren't sent to CloudWatch Logs" by default; each log type is enabled per cluster and billed at CloudWatch Logs ingestion and storage rates. Workload metrics and logs come from CloudWatch Container Insights, a containerized CloudWatch agent, charged as custom metrics in its original version or per observation with enhanced observability, or from Amazon Managed Service for Prometheus and the AWS Distro for OpenTelemetry. EKS's own monitoring page lists each with a "Setup procedure."
- **GKE** goes furthest by default: system, audit and application logs go to Cloud Logging, system metrics to Cloud Monitoring, and clusters are configured to use Google Cloud Managed Service for Prometheus, all charged on "the amount of logs and metrics collected." Control plane, kube state and cAdvisor metrics are packages to enable, and application metrics need exporters the customer runs.
- **AKS:** control plane logs are Azure Monitor resource logs that need a diagnostic setting; container logs come from the containerized Azure Monitor agent (Container insights) and metrics from Azure Monitor managed service for Prometheus. The support matrix puts platform monitoring as shared ("Enable diagnostic settings and build alerts") and workload monitoring and alerting on the customer.

The managed container services start further along. ECS sends cluster and service metrics to CloudWatch "automatically... in 1-minute periods" at no charge, Fargate services get CPU and memory metrics without manual steps, and a task's stdout and stderr reach CloudWatch Logs through the `awslogs` log driver, a `logConfiguration` block in the task definition. Cloud Run sends request logs and container stdout and stderr to Cloud Logging automatically, without agents, and is "automatically integrated with Cloud Monitoring with no setup or configuration required," with no charge for metrics on the fully managed service. Fly.io has "Metrics automatically sent from every Fly app you deploy," into a managed Prometheus (about 15 days of retention) with a hosted Grafana, at no additional charge as of October 2026, and collects each Machine's stdout as logs that `fly logs` tails and Grafana search keeps for 7 days. None of that finishes the job (retention, SLO alerts and traces are still the customer's to design, per the playbook's [Observability](/docs/operations/observability)), but the baseline arrives with the deploy instead of being a project.

The list is a platform team's backlog. Every item has its own release cycle, must be checked against the control plane's version on every minor, and pages someone when it breaks, which is why the control-plane fee buys someone else running etcd and not much of the rest; [Staffing by Platform](/books/hosting-and-cloud/total-cost-of-ownership#staffing-by-platform) prices that backlog in engineer time. The [node-less modes](#node-less-modes-hybrid-nodes-and-arc) shorten the list by taking the nodes, OS patching and some add-ons; versions, secrets, backup and workload telemetry stay with the customer.

## The Alternatives

The choice is who runs the control plane and who decides when it upgrades:

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Hyperscaler managed control plane** (EKS, GKE, AKS Standard, OKE enhanced) | Provider runs the control plane across zones; customer or provider node pools | SLA, managed add-ons, extended support, the cloud's IAM and load balancers | Forced upgrades on the provider's calendar; add-ons and nodes still the customer's | Provider | $0.10 per cluster-hour, $0.60 on an old minor, plus nodes | Teams on that cloud with a platform owner |
| **Developer cloud managed control plane** (DOKS, LKE, OKE basic, OVHcloud Free) | Free control plane, paid HA | No control plane fee; simple node pricing | Short support windows, forced minors, no paid tail; SLA only with HA | Provider | Free; HA $40 to $60 a month, LKE Enterprise $300 | Small teams, development clusters |
| **Node-less mode** (Autopilot, Auto Mode, AKS Automatic, Fargate, virtual nodes) | Provider runs the control plane and the nodes | No node pools to upgrade or repair | Less hardware control; workload restrictions; the provider's eviction schedule | Provider | Cluster fee plus pod or management charges | Teams without a platform group |
| **Provisioned control plane** (EKS tiers) | Pinned control plane capacity | Predictable API and scheduler capacity; 99.99% SLA | A fixed tier to size and monitor; exit blocked above 8 GB of etcd | Provider | $1.65 to $13.90 an hour extra | Very large or bursty clusters, AI training |
| **Distribution with vendor support** (OpenShift, Rancher, Talos) | A vendor's tested stack on the customer's infrastructure | One stack across clouds and data centers | The customer runs etcd and upgrades, on the vendor's lifecycle | Vendor ([Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives)) | Subscription plus infrastructure | Enterprises on-premises or multi-cloud |
| **Cluster API** | A management cluster reconciling `Cluster`, `Machine`, `MachineDeployment` and `KubeadmControlPlane` objects through infrastructure, bootstrap and control plane providers | Clusters as declarative objects; any infrastructure with a provider; `MachineHealthCheck` remediation | A management cluster to run and upgrade; the customer owns etcd | Kubernetes SIG Cluster Lifecycle | Free; the machines | Platform teams and vendors building their own managed service |
| **kOps** | CLI provisioning HA clusters ("kubectl for clusters") | Production clusters on AWS and GCE (official), DigitalOcean, Hetzner and OpenStack (beta) | Everything after provisioning is the operator's | Kubernetes SIG project | Free; the machines | Self-managed clusters on supported clouds |
| **kubeadm** | Bootstraps "a minimum viable Kubernetes cluster that conforms to best practices" | The building block under other installers; supports upgrades | No machines, no day-2 lifecycle on its own | Part of Kubernetes | Free; the machines and the people | Installers, learning, bespoke platforms |

The playbook's [When Not to Run It](/docs/operations/kubernetes#when-not-to-run-it) states the buy rule ("use a managed control plane... running your own etcd is rarely where your advantage is"), and [When Not to Run Kubernetes](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#when-not-to-run-kubernetes) covers the products that skip the cluster entirely. Building only wins when the control plane is itself the product: a provider that sells managed Kubernetes is the one party for which Cluster API and kubeadm are the build.

## My Default

A managed control plane doesn't make Kubernetes free to own: the list in [What You Still Own on a Managed Cluster](#what-you-still-own-on-a-managed-cluster) is the job. So my default for a customer without a platform team starts one step further up, on the cloud's managed container service (ECS on Fargate, Cloud Run, Azure Container Apps), Fly Machines or a [PaaS](/books/hosting-and-cloud/paas-and-frontend-clouds), where upgrades, nodes and the telemetry baseline come with the product, and moves to managed Kubernetes when there are people to own that list and a reason the cluster earns; the stance and its triggers are in [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#my-default).

Once I do run a cluster, my default is the cloud's managed control plane on a release channel that moves it without being asked (GKE Regular, AKS `stable` with a maintenance window, EKS with upgrades scheduled before standard support ends), on the paid SLA tier for anything in production, with node pools upgraded by surge at max unavailable zero and PodDisruptionBudgets that allow progress. I'd treat extended support as insurance for a known blocker with a date to clear it, and on EKS I'd set the upgrade policy to `STANDARD` on every cluster that has no such blocker, because the default bills the forgotten cluster six times the normal rate. I'd turn on the provider's telemetry on day one rather than plan to build a stack later, pick a node-less mode for a team that needs the Kubernetes API but has no one to own nodes, and a provisioned control plane only after a load test shows the standard one throttling.

For a provider building the product, my default copies the convergence and fixes the parts customers resent: a $0.10-an-hour control plane with a financially backed SLA (or a free one without an SLA and HA as the upgrade), versions released within weeks of upstream, release channels with published timings, an extended tail priced as a surcharge that starts the day standard support ends and is opt-in rather than opt-out, and a forced-upgrade policy written down with its notice schedule (DOKS's 30, 7 and 1 days is a good one), what it overrides, and what it leaves for the customer. I'd upgrade nodes and add-ons with the control plane at the end of support, not leave them stranded three minors behind. The tradeoff that would change this is the customer base: a developer cloud selling to small teams wins on a free control plane and a short window, and a provider selling to regulated enterprises with quarterly change control should make long-term support the product rather than the penalty, the way AKS's Premium tier does.

## How to Build It

The chapter adds node pools, upgrades and their notices, maintenance policies, and the control-plane SKUs. Clusters are [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture#how-to-build-it)'s `clusters (resource_id)`, and offered versions with their support dates are its `kubernetes_versions`; nodes are resources of kind `virtual_machine` whose `parent_id` is the node pool; node autoscaling records and cost allocation are [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#how-to-build-it)'s; rating runs belong to [Metering & Rating](/books/hosting-and-cloud/metering-and-rating#rating-from-events-to-money).

```sql
CREATE TABLE node_pools (                -- side table: kind = 'node_pool', parent_id = the cluster
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  cluster_id         UUID NOT NULL REFERENCES clusters (resource_id),
  name               TEXT NOT NULL,      -- unique in the cluster
  management         TEXT NOT NULL CHECK (management IN ('managed', 'self_managed',
                       'virtual', 'hybrid')),
  instance_type      TEXT,               -- null for virtual and hybrid pools
  capacity_type      TEXT CHECK (capacity_type IN ('on_demand', 'spot')),  -- null: virtual, hybrid
  min_nodes          INT NOT NULL CHECK (min_nodes >= 0),
  max_nodes          INT NOT NULL,
  desired_nodes      INT NOT NULL,
  node_image         TEXT,               -- AMI id, node image version, image build
  kubelet_version    TEXT NOT NULL,      -- '1.36.4'; never newer than the control plane
  upgrade_strategy   TEXT NOT NULL CHECK (upgrade_strategy IN ('surge', 'blue_green',
                       'in_place')),       -- in_place: max unavailable only, no surge
  max_surge          TEXT CHECK (max_surge ~ '^[0-9]+%?$'),        -- '1', '33%'
  max_unavailable    TEXT CHECK (max_unavailable ~ '^[0-9]+%?$'),  -- '0', '5'
  drain_timeout      INTERVAL,           -- null: the provider's fixed timeout
  soak_duration      INTERVAL,           -- per node (AKS) or per pool (GKE blue-green)
  auto_upgrade       BOOLEAN NOT NULL,
  auto_repair        BOOLEAN NOT NULL,
  autoscaling_owner  TEXT NOT NULL CHECK (autoscaling_owner IN ('none', 'cluster_autoscaler',
                       'karpenter', 'provider')),
  labels             JSONB NOT NULL DEFAULT '{}',
  taints             JSONB NOT NULL DEFAULT '[]',
  UNIQUE (cluster_id, name),
  CHECK (min_nodes <= desired_nodes AND desired_nodes <= max_nodes),
  CHECK ((management IN ('virtual', 'hybrid')) = (instance_type IS NULL)),
  CHECK (upgrade_strategy <> 'surge' OR max_surge NOT IN ('0', '0%')),
  CHECK (upgrade_strategy <> 'in_place' OR max_unavailable NOT IN ('0', '0%'))
);

CREATE TABLE cluster_maintenance_policies (  -- windows and exclusions, over time
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  cluster_id     UUID NOT NULL REFERENCES clusters (resource_id),
  node_pool_id   UUID REFERENCES node_pools (resource_id),  -- null: the whole cluster
  kind           TEXT NOT NULL CHECK (kind IN ('window', 'exclusion')),
  scope          TEXT NOT NULL CHECK (scope IN ('all', 'no_minor', 'no_minor_or_node')),
  recurrence     TEXT,                   -- RFC 5545 RRULE, windows only
  window_length  INTERVAL,               -- e.g. at least 4 hours
  valid_during   TSTZRANGE NOT NULL,     -- an exclusion's span; a window's life
  CHECK ((kind = 'window') = (recurrence IS NOT NULL AND window_length IS NOT NULL)),
  CHECK (kind = 'exclusion' OR scope = 'all')
);

CREATE TABLE cluster_upgrades (          -- every version change, asked for or imposed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  cluster_id         UUID NOT NULL REFERENCES clusters (resource_id),
  component          TEXT NOT NULL CHECK (component IN ('control_plane', 'node_pool', 'add_on')),
  node_pool_id       UUID REFERENCES node_pools (resource_id),
  add_on_name        TEXT,               -- 'coredns', 'vpc-cni'
  kind               TEXT NOT NULL CHECK (kind IN ('requested', 'auto', 'forced')),
  trigger            TEXT NOT NULL CHECK (trigger IN ('customer', 'channel',
                       'end_of_support', 'security')),
  from_version       TEXT NOT NULL,      -- '1.33.6', a node image, an add-on version
  to_version         TEXT NOT NULL,
  is_minor           BOOLEAN NOT NULL,
  scheduled_during   TSTZRANGE,          -- the window it was placed in
  within_policy      BOOLEAN,            -- inside a window, outside every exclusion
  pdb_overridden     BOOLEAN NOT NULL DEFAULT FALSE,  -- pods evicted past their budget
  state              TEXT NOT NULL CHECK (state IN ('scheduled', 'in_progress', 'succeeded',
                       'failed', 'cancelled', 'rolled_back')),
  failure_reason     TEXT,               -- 'PodEvictionFailure', 'NodeCreationFailure', quota
  rolls_back_id      UUID REFERENCES cluster_upgrades (id),
  requested_by       TEXT NOT NULL,      -- typed actor: a member, 'system:channel'
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at         TIMESTAMPTZ,
  finished_at        TIMESTAMPTZ,
  CHECK ((component = 'node_pool') = (node_pool_id IS NOT NULL)),
  CHECK ((component = 'add_on') = (add_on_name IS NOT NULL)),
  CHECK ((kind = 'requested') = (trigger = 'customer')),
  CHECK (kind <> 'forced' OR trigger IN ('end_of_support', 'security')),
  CHECK (state <> 'failed' OR failure_reason IS NOT NULL)
);

CREATE INDEX cluster_upgrades_cluster_idx ON cluster_upgrades (cluster_id, requested_at);

CREATE TABLE cluster_upgrade_notices (   -- what the customer was told, and when
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  cluster_id    UUID NOT NULL REFERENCES clusters (resource_id),
  upgrade_id    UUID REFERENCES cluster_upgrades (id),  -- null: a warning before one exists
  notice_kind   TEXT NOT NULL CHECK (notice_kind IN ('end_of_standard_support',
                  'end_of_support', 'scheduled', 'started', 'completed', 'failed')),
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'console', 'health_event',
                  'api_event')),
  lead_time     INTERVAL,                -- 30, 7 and 1 days ahead
  sent_at       TIMESTAMPTZ NOT NULL
);
```

The control plane is one meter, `k8s.control_plane.hours`: one usage event per cluster per hour (split at the instant a cluster's version or tier changes), with `quantity` in hours as an exact fraction for a partial hour and three values copied from the cluster at measurement time into `dimensions`: `distribution` and `version_minor`, which locate the version's row in `kubernetes_versions`; `support_plan`, which is `standard` (upgrade at end of standard support, as EKS's `STANDARD` policy), `extended` (stay and pay, as EKS's `EXTENDED` policy or GKE's Extended channel) or `lts` (a flat tier, as AKS Premium); and `tier`, the provisioned control plane tier or null. The SKUs rate that one meter in different combinations. The rows below load EKS's public prices with their dated history, plus AKS's LTS rate, as a provider would load its own list; the LTS and 8XL rows start at the October 2026 as-of date because their launch dates aren't on the pages opened:

```sql
INSERT INTO products (code, name) VALUES ('kubernetes', 'Managed Kubernetes');

INSERT INTO skus (product_id, code, meter, unit, charge_kind)
SELECT p.id, v.code, 'k8s.control_plane.hours', 'cluster_hour', 'usage'
FROM products p,
  (VALUES ('k8s.control_plane.standard.hour'),
          ('k8s.control_plane.extended_surcharge.hour'),
          ('k8s.control_plane.lts.hour'),
          ('k8s.control_plane.tier.xl.hour'),
          ('k8s.control_plane.tier.2xl.hour'),
          ('k8s.control_plane.tier.4xl.hour'),
          ('k8s.control_plane.tier.8xl.hour')) AS v (code)
WHERE p.code = 'kubernetes';

INSERT INTO price_versions (sku_id, price_book, currency, unit_price, valid_during)
SELECT s.id, 'list', 'USD', v.cents, tstzrange(v.from_at, v.until_at)
FROM skus s JOIN (VALUES   -- unit_price in cents per cluster-hour
  ('k8s.control_plane.standard.hour',            20, '2018-06-05'::timestamptz, '2020-01-21'::timestamptz),
  ('k8s.control_plane.standard.hour',            10, '2020-01-21', NULL),
  ('k8s.control_plane.extended_surcharge.hour',   0, '2023-10-04', '2024-04-01'),  -- free preview
  ('k8s.control_plane.extended_surcharge.hour',  50, '2024-04-01', NULL),
  ('k8s.control_plane.lts.hour',                 60, '2026-10-01', NULL),  -- AKS Premium's rate
  ('k8s.control_plane.tier.xl.hour',            165, '2025-11-27', NULL),
  ('k8s.control_plane.tier.2xl.hour',           340, '2025-11-27', NULL),
  ('k8s.control_plane.tier.4xl.hour',           690, '2025-11-27', NULL),
  ('k8s.control_plane.tier.8xl.hour',          1390, '2026-10-01', NULL)   -- as-of date
) AS v (code, cents, from_at, until_at) ON v.code = s.code;

-- Rate control plane hours: the support phase in force at the hour decides the SKUs.
WITH hours AS (
  SELECT e.id, e.account_id, e.resource_id AS cluster_id, e.occurred_during, e.quantity,
         e.dimensions ->> 'support_plan' AS support_plan,
         e.dimensions ->> 'tier'         AS tier,
         CASE
           WHEN lower(e.occurred_during) < v.standard_support_ends_at THEN 'standard'
           WHEN lower(e.occurred_during) < v.extended_support_ends_at THEN 'extended'
           ELSE 'past_end'                -- still running: rate as extended, alarm
         END AS phase
  FROM usage_events e
  JOIN kubernetes_versions v
    ON v.distribution = e.dimensions ->> 'distribution'
   AND v.minor        = e.dimensions ->> 'version_minor'
  WHERE e.meter = 'k8s.control_plane.hours'
    AND lower(e.occurred_during) >= lower(:period)
    AND lower(e.occurred_during) <  upper(:period)
    AND NOT EXISTS (SELECT 1 FROM usage_events c WHERE c.corrects_id = e.id)
),
lines AS (
  SELECT h.*, s.code
  FROM hours h
  JOIN LATERAL (VALUES
    ('k8s.control_plane.standard.hour',           h.support_plan IN ('standard', 'extended')),
    ('k8s.control_plane.extended_surcharge.hour', h.support_plan = 'extended'
                                                    AND h.phase <> 'standard'),
    ('k8s.control_plane.lts.hour',                h.support_plan = 'lts'),
    ('k8s.control_plane.tier.' || h.tier || '.hour', h.tier IS NOT NULL)
  ) AS s (code, applies) ON s.applies
)
INSERT INTO rated_usage (account_id, resource_id, sku_id, price_version_id, rated_during,
                         quantity, currency, amount, rating_run_id)
SELECT l.account_id, l.cluster_id, k.id, pv.id, l.occurred_during,
       l.quantity, pv.currency, l.quantity * pv.unit_price, :run
FROM lines l
JOIN skus k ON k.code = l.code
JOIN price_versions pv
  ON pv.sku_id = k.id AND pv.price_book = 'list' AND pv.currency = 'USD'
 AND pv.valid_during @> lower(l.occurred_during);
```

Notes on the sketch:

- **The phase is derived, not reported.** The event carries the version and the plan; whether an hour is standard or extended comes from `kubernetes_versions` at rating time. EKS bills extended support "at the beginning of the day that the version reaches end of standard support," so `standard_support_ends_at` holds that UTC midnight, the hour boundary falls on it, and the first extended hour is the one that starts there. Provider calendars publish month-only dates as approximate until fixed, so a corrected date is a rerun and a diff, the foundation's rule for [usage](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time).
- **Extended is a surcharge, LTS is a tier.** The standard SKU rates every hour on the `standard` and `extended` plans, and the $0.50 surcharge adds to it only once the phase has passed standard, which is GKE's model and EKS's $0.10 plus $0.50. An `lts` cluster rates at the flat tier from the hour it joins, as AKS Premium does. A surcharge on its own SKU also lets a plan include it, the way GKE Enterprise did, through `plan_versions.included`, and lets free-tier credits such as GKE's $74.40 a month be `credit_grants` against the standard SKU.
- **A `standard` plan never pays the surcharge.** If the provider fails to upgrade a cluster whose policy was to upgrade at end of standard support, that is the provider's miss, not an extended hour. A `past_end` hour on the `extended` plan rates as extended, never higher, and raises `cluster.past_end_of_support` so the forced upgrade is queued rather than billed indefinitely.
- **A free control plane is a zero price, not a missing SKU.** A provider that gives the control plane away prices `k8s.control_plane.standard.hour` at zero and sells high availability as its own recurring SKU (DOKS's $40 and LKE's $60 a month), so cluster-hours are still counted for capacity planning and an SLA can be tied to the HA SKU.
- **Tiers rate on the same event.** A provisioned tier is a dimension, so a mid-hour tier change splits the event like a version change, and the tier hours add to the cluster fee as EKS bills them.
- **Node pools own the upgrade parameters.** `max_surge`, `max_unavailable`, the drain timeout and the soak are on the pool because every provider sets them per pool and they decide how much quota an upgrade needs: the surge quota check (pool size times `max_surge`) runs before the upgrade, as AKS's does.
- **Upgrades are rows, whoever started them.** A customer's upgrade, a channel's, and a forced one are all `cluster_upgrades`, with `kind` and `trigger` saying which; whether it ran inside the customer's window and whether it overrode PDBs are recorded, because those are what a forced upgrade is later disputed over. Add-on and node pool upgrades after a control plane upgrade are their own rows, so "control plane upgraded, nodes stranded" is a query.
- **Events:** `cluster.version_offered`, `cluster.standard_support_ending`, `cluster.extended_support_started`, `cluster.upgrade_scheduled`, `cluster.upgrade_started`, `cluster.upgrade_completed`, `cluster.upgrade_failed`, `cluster.past_end_of_support` and `node_pool.repaired` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing and support.

## Auditing

- **Every forced upgrade, with its notices.** For each `forced` row, the notices sent before it (kind, channel, lead time) and whether the schedule promised in the policy was met, because a customer whose workloads broke at 03:00 asks first whether they were told.
- **What the forced upgrade overrode.** Whether it ran outside the maintenance window, through an exclusion, or past a PodDisruptionBudget, and the policy clause that allowed it.
- **The first extended hour per cluster.** When each cluster entered extended support, on which plan, and which notice preceded it, since a default-on surcharge is the charge most likely to be disputed.
- **Version calendar changes.** Every edit to a version's support dates and the rating reruns it caused, so a changed end date can be traced to the invoices it moved.
- **Upgrade failures and rollbacks.** Which upgrades failed, on what (`PodEvictionFailure`, `NodeCreationFailure`, quota), and which were rolled back, per pool and provider region.
- **Skew after the control plane moves.** Clusters whose node pools or add-ons are behind the control plane, and for how long, because the skew policy's three minors is a deadline the provider's own forced upgrade can create.

## What This Means for the System You Build

- **Sell the control plane with an SLA, or give it away without one,** and make high availability the line between them.
- **Publish a release calendar per minor,** with standard and extended end dates in UTC, and ship new minors within weeks of upstream.
- **Put every cluster on a channel,** with published timings, and let maintenance windows steer routine upgrades but not end-of-support ones.
- **Write the forced-upgrade policy down,** with its notice schedule, what it overrides, and what it leaves for the customer, and record every forced upgrade against it.
- **Price extended support as a surcharge that starts the day standard ends,** opt-in, bounded, and ending in an upgrade the customer was warned about.
- **Upgrade nodes and add-ons with the control plane** when the provider forces a minor, instead of stranding them at the edge of the skew policy.
- **Keep upgrade parameters on the node pool,** with surge, unavailability, drain timeout and soak, and check quota before an upgrade starts.
- **Derive the billing phase from the version calendar,** never from a flag set by the metering pipeline, so a corrected date is a rerun.
- **Buy a managed control plane as a customer** unless the control plane is the product being sold.
- **Publish what the customer still owns,** item by item, and ship a telemetry baseline that works without a project, because that list is what customers underestimate.

## References

**Reference**

- [Kubernetes: Patch releases](https://kubernetes.io/releases/patch-releases/), roughly fourteen months of support per minor, twelve standard, monthly patch cadence
- [Cluster API: Introduction](https://cluster-api.sigs.k8s.io/introduction), declarative cluster lifecycle, SIG Cluster Lifecycle, kubeadm as the default bootstrap provider
- [Cluster API: Concepts](https://cluster-api.sigs.k8s.io/user/concepts), management and workload clusters, providers, `Machine`, `MachineDeployment`, `MachineHealthCheck`, `KubeadmControlPlane`
- [kOps](https://kops.sigs.k8s.io/), "kubectl for clusters," HA clusters, officially supported, beta and alpha clouds
- [Kubernetes: Creating a cluster with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/), a minimum viable conformant cluster, a building block for installers, upgrades
- [Kubernetes: Logging architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/), no native storage for log data, a separate backend for cluster-level logging, kubelet rotation defaults, `kubectl logs` showing the latest file

**Provider documentation**

- [Amazon EKS: Kubernetes version lifecycle](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html), 14 months standard and 12 extended, the `EXTENDED` default, auto-upgrade behavior and no notice, 7-day rollback, the release calendar, 60-day notices, extended support patch scope, node and Fargate upgrades
- [Amazon EKS: Understand each phase of node updates](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html), setup, scale-up, upgrade and scale-down phases, max unavailable default and quota, default and minimal strategies, 15-minute limits, `PodEvictionFailure` and `NodeCreationFailure`
- [Amazon EKS: Cluster API server endpoint](https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html), public by default, public access CIDRs, private access, the cluster security group, control plane egress
- [Amazon EKS add-ons](https://docs.aws.amazon.com/eks/latest/userguide/eks-add-ons.html), default add-ons, AWS, Marketplace and community add-ons, `eks:addon-manager`, Auto Mode capabilities on AWS-owned infrastructure
- [Amazon EKS Provisioned Control Plane](https://docs.aws.amazon.com/eks/latest/userguide/eks-provisioned-control-plane.html), standard and provisioned modes, tier limits by version, HPA sync concurrency, `ScalingTierConfigUpdate`, the 8 GB exit restriction, load-testing advice
- [Amazon EKS Hybrid Nodes overview](https://docs.aws.amazon.com/eks/latest/userguide/hybrid-nodes-overview.html), AWS-managed control plane with customer-managed nodes, connectivity requirement, EKS Anywhere for disconnected sites, billing from join to removal
- [Google Cloud: GKE release channels](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/release-channels), channel timings, Regular as default, Rapid outside the SLA, Extended up to 24 months, "No channel" removal on June 14, 2027, auto-upgrade minimums, end-of-support upgrades
- [Google Cloud: Node pool upgrade strategies](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies), surge defaults and caps, the one-hour PDB limit, blue-green phases, soak and batch settings, rollback
- [Google Cloud: Maintenance windows and exclusions](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/maintenance-windows-and-exclusions), one window, exclusion scopes and limits, the 92-day rule, end-of-support limits, security overrides, the Spanner-based cluster state database
- [Google Cloud: Node auto-repair](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/node-auto-repair), default on Standard and always on Autopilot, unhealthy criteria, drain and recreate, one-hour drain
- [Microsoft Learn: AKS pricing tiers](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers), Free, Standard and Premium, node limits, uptime SLA with and without zones, zonal control plane, AKS Automatic defaults and pod readiness SLA
- [Microsoft Learn: AKS long-term support](https://learn.microsoft.com/en-us/azure/aks/long-term-support), community support plus LTS, Premium and `AKSLongTermSupport`, two patch versions, add-on lifecycles, platform-initiated upgrades to the next LTS version
- [Microsoft Learn: Supported Kubernetes versions in AKS](https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions), N-2 support, N-3 platform support, the 60-day grace period, 30 days' notice, the release and LTS calendars, platform-initiated upgrade months
- [Microsoft Learn: Automatically upgrade an AKS cluster](https://learn.microsoft.com/en-us/azure/aks/auto-upgrade-cluster), upgrade channels, AKS Automatic on `stable`, N-3 to N-2 upgrades, platform-initiated upgrades from June 1, 2027, four-hour maintenance windows
- [Microsoft Learn: Upgrade the AKS control plane](https://learn.microsoft.com/en-us/azure/aks/upgrade-aks-control-plane), control-plane-only and full upgrades, sequential minors, three minors of node skew, LTS skipping
- [Microsoft Learn: Configure rolling upgrades for AKS node pools](https://learn.microsoft.com/en-us/azure/aks/upgrade-aks-node-pools-rolling), max surge default and 33% recommendation, quota example, max unavailable, drain timeout and soak limits, surge fallback on 1.35+
- [Microsoft Learn: AKS node auto-repair](https://learn.microsoft.com/en-us/azure/aks/node-auto-repair), detection rules, reboot, reimage and redeploy, three retries, events
- [Microsoft Learn: What is AKS Automatic?](https://learn.microsoft.com/en-us/azure/aks/intro-aks-automatic), preconfigured Standard tier, 5,000 nodes, pod readiness SLA
- [Microsoft Learn: Azure Arc overview](https://learn.microsoft.com/en-us/azure/azure-arc/overview), Kubernetes clusters projected into Azure Resource Manager, GitOps with Flux, no charge for the Arc control plane
- [DigitalOcean: Kubernetes supported releases](https://docs.digitalocean.com/products/kubernetes/details/supported-releases/), three recent minors, release timing, forced upgrades 30 days after end of support, 30, 7 and 1 day emails, the 1.34 to 1.37 calendar
- [DigitalOcean: Kubernetes features](https://docs.digitalocean.com/products/kubernetes/details/features/), managed control plane, automatic node remediation
- [Akamai: Upgrade a cluster to a newer Kubernetes version](https://techdocs.akamai.com/cloud-computing/docs/upgrade-a-cluster-to-a-newer-kubernetes-version), end-of-life upgrades at a scheduled time, control plane first, rolling recycle, automatic patch upgrades
- [Oracle: Supported Kubernetes versions](https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengaboutk8sversions.htm), three versions and the 30-day overlap, end of support, three minors of skew from 1.28
- [Oracle: Comparing enhanced with basic clusters](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengcomparingenhancedwithbasicclusters_topic.htm), virtual nodes, add-on management, workload identity, SLA versus SLO, upgrade to enhanced but not back
- [Amazon EKS: Security in Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/security.html), the shared responsibility split: AWS owns the control plane and etcd, the customer the data plane configuration, nodes, containers and node OS patches
- [Amazon EKS: Send control plane logs to CloudWatch Logs](https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html), control plane log types off by default, enabled per type, CloudWatch Logs rates
- [Amazon EKS: Monitor your cluster performance and view logs](https://docs.aws.amazon.com/eks/latest/userguide/eks-observe.html), API server metrics, Prometheus, Container Insights, ADOT and Fluent Bit, each with a setup procedure
- [Amazon CloudWatch: Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html), the containerized CloudWatch agent, EKS and ECS support, custom-metric versus per-observation charging
- [Google Cloud: GKE shared responsibility](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/shared-responsibility), what Google patches, the customer's workloads, RBAC and IAM, credentials, node pool auto-upgrade and monitoring, best-effort support without logging and monitoring
- [Google Cloud: GKE observability](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/observability), default logs and system metrics, Managed Service for Prometheus on by default, optional metrics packages, volume-based charges
- [Microsoft Learn: AKS support policies](https://learn.microsoft.com/en-us/azure/aks/support-policies), the division-of-responsibility matrix, shared areas, 30-minute etcd backups, weekly node images and the 90-day limit, unsupported ingress controllers and application certificates
- [Microsoft Learn: Kubernetes monitoring in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/kubernetes-monitoring-overview), managed Prometheus, container log collection by the Azure Monitor agent, control plane logs through a diagnostic setting
- [Amazon ECS: Monitor Amazon ECS using CloudWatch](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html), free cluster and service metrics in 1-minute periods, Fargate metrics without manual steps, Container Insights at extra cost
- [Amazon ECS: Send Amazon ECS logs to CloudWatch](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html), the `awslogs` log driver, stdout and stderr, `logConfiguration` in the task definition
- [Google Cloud: Logging and viewing logs in Cloud Run](https://docs.cloud.google.com/run/docs/logging), request and container logs sent to Cloud Logging automatically, no logging agents
- [Google Cloud: Monitoring health and performance in Cloud Run](https://docs.cloud.google.com/run/docs/monitoring), Cloud Monitoring with no setup, no charge for metrics on the fully managed service
- [Fly.io: Metrics on Fly.io](https://docs.fly.io/monitoring/metrics), metrics from every app, managed Prometheus with about 15 days of retention, hosted Grafana, no additional charge
- [Fly.io: Logging overview](https://docs.fly.io/monitoring/logging-overview), stdout collected from each Machine, `fly logs`, 7-day log search, the Fly Log Shipper

**Pricing and SLAs**

- [Amazon EKS pricing](https://aws.amazon.com/eks/pricing/), $0.10 standard and $0.60 extended per cluster-hour, Provisioned Control Plane tier prices, Hybrid Nodes per vCPU-hour tiers
- [Amazon EKS SLA](https://aws.amazon.com/eks/sla/), 99.95% and 99.99%, measurement intervals, credits, updated March 20, 2026
- [Google Kubernetes Engine pricing](https://cloud.google.com/kubernetes-engine/pricing), $0.10 per cluster-hour billed per second, the $74.40 credit for zonal and Autopilot clusters, the $0.50 extended fee
- [Google Kubernetes Engine SLA](https://cloud.google.com/kubernetes-engine/sla), zonal, regional and Autopilot commitments, the Stockholm exception
- [Azure Retail Prices API: Azure Kubernetes Service](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20'Azure%20Kubernetes%20Service'), Standard Uptime SLA $0.10 per hour, Long Term Support $0.60, AKS Automatic hosted control plane $0.16 and per-vCPU meters
- [DigitalOcean Kubernetes pricing](https://www.digitalocean.com/pricing/kubernetes), free control plane, $40 a month HA control plane
- [DigitalOcean: DOKS SLA](https://www.digitalocean.com/sla/doks), 99.95% for the HA control plane, exclusions, credits, effective July 1, 2022
- [Akamai: LKE pricing](https://www.akamai.com/cloud/pricing/kubernetes), free standard control plane, HA from $60 a month, LKE Enterprise $300 a month
- [Oracle Cloud price list API](https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD), OKE enhanced clusters at $0.10 per cluster-hour (part B96545), virtual nodes at $0.015 per node-hour
- [OVHcloud: Managed Kubernetes Service](https://www.ovhcloud.com/en/public-cloud/kubernetes/), Free and Standard plans, $0.099 per cluster-hour, SLO and SLAs, etcd and node limits

**Announcements and history**

- [Google Cloud Platform blog: Google Container Engine is Generally Available](https://cloudplatform.googleblog.com/2015/08/Google-Container-Engine-is-Generally-Available.html), August 26, 2015
- [Google Cloud blog: Cutting cluster management fees on Google Kubernetes Engine](https://cloud.google.com/blog/products/gcp/cutting-cluster-management-fees-on-google-kubernetes-engine), November 28, 2017, the fee eliminated and the earlier $0.15 an hour for six or more nodes
- [AWS News Blog: Amazon EKS now generally available](https://aws.amazon.com/blogs/aws/amazon-eks-now-generally-available/), June 5, 2018, two regions, three Availability Zones, conformance, $0.20 per hour
- [Azure blog: Azure Kubernetes Service (AKS) GA](https://azure.microsoft.com/en-us/blog/azure-kubernetes-service-aks-ga-new-regions-new-features-new-productivity/), June 13, 2018, ten regions, free management
- [DigitalOcean blog: DigitalOcean Kubernetes is now generally available](https://www.digitalocean.com/blog/doks-in-ga), May 21, 2019, free master node, scheduled patch upgrades
- [PRWeb: Linode launches managed Kubernetes engine](https://www.prweb.com/releases/linode-launches-managed-kubernetes-engine-848995007.html), November 19, 2019, open beta, free control plane, GA expected early 2020
- [AWS News Blog: Amazon EKS on AWS Fargate now generally available](https://aws.amazon.com/blogs/aws/amazon-eks-on-aws-fargate-now-generally-available/), December 3, 2019
- [AWS What's New: Amazon EKS announces price reduction](https://aws.amazon.com/about-aws/whats-new/2020/01/amazon-eks-announces-price-reduction/), January 21, 2020, 50% to $0.10 per hour
- [The Register: Google reintroduces management fee for Kubernetes clusters](https://www.theregister.com/2020/03/05/google_reintroduces_management_fee_for_kubernetes_clusters/), March 5, 2020, $0.10 per cluster-hour from June 6, 2020 per a Google spokesperson, the free zonal cluster, 99.95% and 99.5% SLAs
- [Google Cloud blog: Introducing GKE Autopilot](https://cloud.google.com/blog/products/containers-kubernetes/introducing-gke-autopilot/), February 24, 2021
- [AWS Containers blog: Amazon EKS extended support pricing](https://aws.amazon.com/blogs/containers/amazon-eks-extended-support-for-kubernetes-versions-pricing/), January 16, 2024, $0.60 in total from April 1, 2024, free preview
- [Google Cloud blog: Announcing GKE extended support](https://cloud.google.com/blog/products/containers-kubernetes/announcing-gke-extended-support), July 17, 2024, up to 24 months from 1.27, $0.50 on top during the extended period, included in GKE Enterprise
- [AWS News Blog: Amazon EKS Auto Mode](https://aws.amazon.com/blogs/aws/streamline-kubernetes-cluster-management-with-new-amazon-eks-auto-mode/), December 1, 2024, what AWS manages
- [Azure AKS release notes, 2025-08-29](https://github.com/Azure/AKS/releases/tag/2025-08-29), AKS Automatic generally available
- [Google Cloud blog: GKE Autopilot now available to all qualifying clusters](https://cloud.google.com/blog/products/containers-kubernetes/gke-autopilot-now-available-to-all-qualifying-clusters/), September 24, 2025, Autopilot in Standard clusters from 1.33.1-gke.1107000 on Rapid
- [AWS Containers blog: Amazon EKS introduces Provisioned Control Plane](https://aws.amazon.com/blogs/containers/amazon-eks-introduces-provisioned-control-plane/), November 27, 2025, XL, 2XL and 4XL at launch
