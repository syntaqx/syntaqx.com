+++
title = "Total Cost of Ownership"
description = "What each stage from homelab to cloud and back really costs: the bill, staffing by platform, buying servers, a five-year model, and the SQL to run it."
category = "Hosting & Cloud Industry"
order = 2214
part = "Running the Provider"
tags = ["tco", "cost-model", "finops", "staffing", "kubernetes", "repatriation"]
+++

Total cost of ownership is everything a workload costs to run for a period, not just what its provider invoices. The invoice is the sticker price: compute, storage, transfer out, a support plan. Around it sit costs no provider bills: the people who keep the thing running and answer its pages, the upgrades a provider's calendar forces, the observability and security tools bought from other vendors, the migration in and the exit out, commitments that bill whether or not the workload is still there, and, for owned hardware, capital spent up front and written down over a useful life. Two placements with the same bill can differ by multiples in total cost, and the cheaper bill is often the more expensive placement.

This volume reads as one scaling story: a homelab, a server in colocation, rented dedicated machines, virtual machines in a cloud, managed services and platforms, Kubernetes, and for some companies a return to owned metal. Each earlier chapter priced its own layer. This one adds them up, stage by stage, against the savings people claim at each step: what the bill contains, what it leaves out, how to count the people, and how the two best-documented public cases ([Dropbox and 37signals](#the-evidence-what-the-published-numbers-include)) look once you ask what they counted. It builds headcount for nine platforms from the work each leaves the customer, compares one workload across four placements at published prices, prices buying the servers, runs owning against renting year over year to a break-even month, and ends with a model over the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) that puts the bill and the off-bill costs in one query. The decision to leave the cloud for owned hardware, and its own cost model, is the next and final chapter, [Repatriation](/books/hosting-and-cloud/repatriation).

## How the Providers Do It

Every stage bills some costs and leaves the rest to the customer. The line between them is the product:

| Stage | What the provider bills | What it leaves to you | Where the bill is priced |
| --- | --- | --- | --- |
| **Homelab** | Nothing; the utility bills watts and the ISP bills the line | Hardware, spares, every upgrade, every outage, your own hours | [Power and the Electricity Bill](/books/hosting-and-cloud/homelab#power-and-the-electricity-bill) |
| **Colocation** | Space, power, a port or transit, cross-connects, remote hands | The hardware, its spares and refresh, the OS and everything above, trips to the building | [When the House Isn't Enough](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough), [How Colocation Is Sold](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold) |
| **Rented dedicated and bare metal** | The machine by the month, setup fees, traffic beyond an allowance, remote hands | The OS and everything above, failover between machines, the load balancer | [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-the-providers-do-it) |
| **IaaS virtual machines** | Instance-seconds, disks, transfer out, load balancers, a support plan as a percentage of the bill | The OS image and its patching, scaling, observability, security tooling | [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#applying-a-savings-plan-a-worked-hour), [Egress & Switching](/books/hosting-and-cloud/egress-and-switching#how-the-providers-do-it) |
| **Managed services and PaaS** | A premium per unit for the service, extended support on old versions | The application, its data model, the vendor's upgrade calendar | [Managed Databases](/books/hosting-and-cloud/managed-databases#the-meters), [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds#what-a-platform-resells) |
| **Managed Kubernetes** | A control-plane fee per cluster-hour, nodes at VM prices, a surcharge for old minors | Node pools, add-ons, three upgrades a year, observability, policy, the platform team | [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-the-providers-do-it), [How Providers Bill Clusters](/books/hosting-and-cloud/autoscaling-and-cost#how-providers-bill-clusters) |
| **Self-run Kubernetes** | Nothing beyond the machines | The control plane, etcd, upgrades, every add-on, the on-call rotation | [Release Cadence and Support Windows](/books/hosting-and-cloud/kubernetes-architecture#release-cadence-and-support-windows) |
| **Owned metal again** | Colocation, transit, hardware support contracts | Capital, procurement lead time, spares, the people, the platform on top | [A Cost Model for Owning](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) |

Three patterns run through the table. **Moving up the stack moves cost from people to the bill.** A homelab bills almost nothing and takes every hour you have; a managed container service bills a premium on every vCPU-second and takes almost none. **The bill grows a percentage tax as it grows.** AWS's support plans are priced as a share of monthly charges (Business Support+ is the greater of $29 a month per account or 9% of the first $10,000, 7% to $80,000, 5% to $250,000 and 3% above; Enterprise Support has a $5,000 monthly minimum and starts at 10%, as of October 2026), so every dollar of compute carries a support dollar fraction with it. **Kubernetes is the exception to the pattern.** A managed cluster moves the control plane to the bill but leaves most of the operating work with the customer, which is why it sits higher on the stack than VMs and still costs more people than they do.

The providers also sell TCO as an argument, and both sides commission it. Google Cloud Consulting commissioned a Forrester Total Economic Impact study (July 2025) reporting a 101% three-year risk-adjusted ROI and $37.9 million NPV for a composite enterprise of about $15.7 billion in revenue, built from interviews and a survey of 159 respondents; the study says it was "commissioned by GCC," that GCC reviewed it, and that it "is not meant to be used as a competitive analysis." On the other side, Dell pointed to an Enterprise Strategy Group report on inference costs, and its products SVP claimed "up to 75% more cost effective TCO when running on prem with the Dell AI Factory than the public cloud" (Network World, May 22, 2025). I treat both as marketing: each picks the composite customer, the baseline and the period that make its product win, and none of them is a model of your workload.

## The Stages, Priced

Each stage below is the sticker price as the earlier chapter found it, then the costs that chapter's bill doesn't show. Prices are as of October 2026 and cited where they were first used.

### Homelab

**The bill.** Watts and a line. One watt drawn all year costs about $1.59 at the EIA's August 2026 US residential average of 18.16 cents per kWh; [the three-node lab in The Homelab](/books/hosting-and-cloud/homelab#how-to-build-it) idles at 130 W, about $207 a year. The hardware is bought once, often used.

**Off the bill.** Everything else is the owner's time: the owner is the customer, the operator and the on-call rotation at once ([The Operator Is the Customer](/books/hosting-and-cloud/homelab#the-operator-is-the-customer)). There is no SLA, the residence's power and upload are the ceiling ([From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#power-and-the-uptime-of-a-residence)), and a residential plan's acceptable use policy can rule out serving the public at all ([Static IPs, Business Plans and Residential AUPs](/books/hosting-and-cloud/homelab-to-colocation#static-ips-business-plans-and-residential-aups)). **The savings claimed** ("it costs me $17 a month") are real for the bill and leave out the hours, which a hobby can fairly price at zero and a business can't.

### Colocation

**The bill.** Retail colocation starts at a single server: $99 to $179 a month for 1U to 4U (HostColor, RackNerd), a quarter rack around $600, a full rack $750 to $875, plus remote hands from €21 per 15 minutes to $250 an hour. Power is the line that grows fastest ([How Colocation Is Sold](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold)).

**Off the bill.** The hardware itself (capital, depreciated over its life), spares sized from failure rates ([Spares, Inventory and Failure](/books/hosting-and-cloud/dedicated-servers#spares-inventory-and-failure)), the drive to the building or the remote-hands hours instead, IP space and transit decisions, and a contract term that outlives the workload if the workload shrinks. **The saving claimed** against the cloud is usually the bill against a cloud bill at list price; the hardware and the people sit outside it.

### Rented dedicated servers and bare metal

**The bill.** A machine by the month with no capital. Hetzner's AX42 (an eight-core AMD Ryzen 7 PRO 8700GE with simultaneous multithreading, 64 GB of DDR5 ECC and two 512 GB NVMe drives) is listed from €79 to €99 a month, the product page showing €99, plus a €49 setup fee, excluding VAT, with a 1 Gbit/s port and unlimited traffic; servers with 10 Gbit uplinks include 20 TB and bill €1 per TB beyond it. Bandwidth, the hyperscalers' most contested line, nearly disappears.

**Off the bill.** The provider swaps failed parts; everything from the OS up is the customer's, including the redundancy a cloud region gives for free (two machines, a floating IP or a load balancer, replication). The price is set by one provider and moves: Hetzner raised prices on existing products from April 1, 2026 and setup fees again in April 2026 ([Cost per Unit](/books/hosting-and-cloud/operating-metrics#cost-per-unit)). The location is the provider's too: Hetzner's own data centers are in Nuremberg, Falkenstein and Helsinki, which is a latency and residency fact for a US audience, not a price.

### IaaS virtual machines

**The bill.** An m7i.large (2 vCPUs, 8 GiB) is $0.1008 an hour on demand in US East (N. Virginia) and $0.07406 under a one-year, no-upfront Compute Savings Plan; transfer out is $0.09 per GB after the first 100 GB a month; a support plan adds its percentage. Commitments are the main lever and the main risk: [a plan sized above the baseline costs more than no plan at all](/books/hosting-and-cloud/commitments-and-marketplaces#applying-a-savings-plan-a-worked-hour), and an enterprise commitment's shortfall is billed whatever runs ([Enterprise Commitments and Shortfalls](/books/hosting-and-cloud/commitments-and-marketplaces#enterprise-commitments-and-shortfalls)).

**Off the bill.** The image and its patching, the autoscaling policy, the observability agent on every host (Datadog's infrastructure tier is $15 a host a month on an annual plan, [priced per host](/books/hosting-and-cloud/observability-platforms#pricing-by-host-gigabyte-and-cardinality)), and the security tooling. **The saving claimed** for a move into VMs is usually against owned hardware's capital; the people who ran the hardware mostly stay, because the OS and everything above it didn't move.

### Managed services and PaaS

**The bill.** A premium per unit for someone else running the software. AWS Fargate bills $0.000011244 per vCPU-second and $0.000001235 per GB-second for Linux on x86 in US East, about $0.0405 per vCPU-hour and $0.0044 per GB-hour, against $0.1008 for the m7i.large's 2 vCPUs and 8 GiB. A managed database's Multi-AZ rate is double its Single-AZ rate, and staying on an old engine version bills extended support (RDS: $0.100 per vCPU-hour in years one and two, $0.200 in year three; [Extended Support and Forced Upgrades](/books/hosting-and-cloud/managed-databases#extended-support-and-forced-upgrades)).

**Off the bill.** Less than anywhere else on the stack: no OS, no nodes, no control plane. What remains is the vendor's upgrade calendar, its limits, and the exit: the more of the platform a workload uses, the more of the migration is a rewrite ([Migration and Lock-In](/books/hosting-and-cloud/managed-databases#migration-and-lock-in)). The premium is visible on the bill and the saving isn't, which is why managed services are the line FinOps reviews cut first and teams regret cutting.

### Kubernetes, managed and self-run

**The bill.** A managed control plane is $0.10 per cluster-hour on EKS, GKE, AKS Standard and OKE enhanced ($73 a month), $0.60 on a minor past standard support ($438 a month), plus nodes at VM prices ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#extended-support)). Self-run, the control plane costs only the machines it runs on.

**Off the bill.** This is where the bill understates the cost most. Upstream ships three minors a year with about fourteen months of patches each, so a cluster is never more than about fourteen months from a forced upgrade ([Release Cadence and Support Windows](/books/hosting-and-cloud/kubernetes-architecture#release-cadence-and-support-windows)); a managed control plane upgrades itself, but node pools and add-ons stay the customer's, and an add-on's version matrix can strand a cluster on a supported minor with an unsupported add-on ([Managed Add-Ons](/books/hosting-and-cloud/managed-kubernetes#managed-add-ons)). Observability, policy, ingress, certificates, secrets and GitOps are assembled, not included, and the nodes carry their own overhead and packing waste before any workload runs ([Bin Packing and the Request Gap](/books/hosting-and-cloud/autoscaling-and-cost#bin-packing-and-the-request-gap)). The CNCF's January 2026 survey put the top challenges as culture, training and security, not price ([When Not to Run Kubernetes](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#when-not-to-run-kubernetes)): the cost is people. Self-run adds the control plane, etcd and its backups, and certificate rotation to that list.

### Back to owned metal

**The bill.** Colocation, transit, hardware support contracts, and capital: 37signals' published model put its owned compute at about $840,000 a year against about $2.3 million rented ([Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) has the full model and its terms).

**Off the bill.** Capital up front and its cost, procurement lead times that make capacity a forecast, and the platform on top: a company that ran on managed services and Kubernetes now runs its own databases and its own cluster or deploy tool, which is the staff line that decides whether owning wins. The published cases where it won had the team already ([the evidence below](#the-evidence-what-the-published-numbers-include)).

## The Costs Not on the Bill

The off-bill costs repeat across every stage, in different sizes:

- **People and on-call.** The largest term for any workload smaller than a few racks. A service that must be answered around the clock needs a rotation, not a person: the playbook's [on-call rotations](/docs/operations/on-call#rotations) put round-the-clock coverage at one site at about eight engineers. A rotation is shared across many systems, so a workload's share is the fraction of that rotation's time it consumes, which is how [Counting People](#counting-people) prices it.
- **Upgrades and version treadmills.** Every layer has a support calendar: Kubernetes minors, managed database engines, OS releases, control panels, runtimes. Staying behind bills a surcharge where the provider offers one (Kubernetes and RDS extended support above) and a risk where it doesn't. The cost is the engineering time per upgrade times the upgrades per year, for every layer the customer owns.
- **The observability and security stack.** Bought per host, per GB or per series from other vendors ([Observability Platforms](/books/hosting-and-cloud/observability-platforms#pricing-by-host-gigabyte-and-cardinality)), plus scanning, secrets and policy tools. It isn't on the provider's bill, it scales with the shape of the deployment (per-host pricing punishes many small hosts), and it moves with the workload, so it belongs in the comparison, not after it.
- **Migration and exit.** A move costs engineering time twice (build the target, then move) plus a period of running both; leaving a cloud has data transfer out, which the exit waivers now remove for customers who leave ([Exit Waivers, 2024](/books/hosting-and-cloud/egress-and-switching#exit-waivers-2024)), and the work of [getting the data out](/books/hosting-and-cloud/migrations-and-end-of-life#data-export-and-getting-out). [Backups & Migrations](/books/hosting-and-cloud/backups-and-migrations) covers the mechanics; here it is a one-time cost amortized over the period the new placement must last to pay it back.
- **Commitments and shortfall risk.** A commitment lowers the rate and adds a liability: it bills the committed amount whether the workload grows, shrinks or leaves. In a TCO model it is a discount on the expected path and a cost on every other path, and its end date is the earliest date a move is free ([Leaving: Egress, Commitments and Licenses](/books/hosting-and-cloud/repatriation#leaving-egress-commitments-and-licenses)).
- **Opportunity cost.** An engineer upgrading a cluster isn't building the product. It has no invoice and it is the reason most small teams should pay a premium for a managed service: the premium buys back time the company would otherwise spend on infrastructure it doesn't sell.
- **Depreciation and useful life against opex.** Rented capacity is operating expense, paid as used. Owned hardware is capital: cash leaves at purchase, and the income statement sees it as depreciation over the useful life. The assumption moves the answer: Amazon extended its servers' useful life from five to six years in 2024 and shortened it back to five for a subset in 2025 ([Buying the Servers](#buying-the-servers) cites the filing). A model should carry both views, the depreciation for the comparison and the cash for whether the company can afford it.

## Counting People

People cost is where TCO models are most often wrong, in both directions: models that sell the cloud count a whole data-center team the company never had, and models that sell owning count none. My method:

1. **Count only the change.** Price the people each placement needs minus the people the company has regardless. If the team exists and stays the same size, the people term is zero, which is what 37signals reported, and it is still worth writing down so the assumption can be checked.
2. **Express it as a fraction of a full-time engineer (FTE) per placement.** List the recurring work each placement leaves to the customer (patching, upgrades, capacity, on-call share, hardware tickets, cost reviews) and estimate hours per month for each; divide by working hours. The estimate is a parameter, stated and dated, not a fact; [Staffing by Platform](#staffing-by-platform) does it for nine platforms.
3. **Price an FTE fully loaded.** Salary is only part of what an employee costs. A public baseline: the BLS put the median annual wage of network and computer systems administrators at $99,130 in May 2025, and its Employer Costs for Employee Compensation for June 2026 put wages and salaries at 70.0% of private-industry compensation costs, with benefits the other 30.0%. Dividing the wage by 0.70 gives about $141,600 a year, about $11,800 a month, before recruiting, tools, training and management. A company should use its own loaded cost; this one is a public placeholder, and the 70% share is an all-industry average, not one for engineers.
4. **Keep on-call as its own line.** A pager rotation has a minimum size whatever the workload, so the first service that needs 24-hour response pays for a rotation and the tenth shares it. Count the share, and count the rotation in full when a placement creates one that didn't exist.
5. **Rerun it when the team changes.** A placement that was cheap with an existing platform team gets expensive when that team leaves, which is a reason to revisit the model, not just the bill.

## Staffing by Platform

No provider, survey or standards body publishes a figure for people per cluster, and the ones that circulate are vendor claims. So I build headcount from the work: list the recurring tasks, mark which ones each platform's provider takes on, put hours on what's left, and divide.

**What the providers say they manage**, in their own documentation:

- **EKS:** "AWS is responsible for managing of the EKS managed Kubernetes control plane. This includes the Kubernetes control plane nodes, the ETCD database," while the customer is "largely responsible" for IAM, pod security, runtime security and network security. AWS keeps the EKS-optimized AMI patched, but customers on managed node groups "are responsible for upgrading their Nodegroups to the latest AMI," and "unlike Fargate, MNGs will not automatically scale your infrastructure"; with Fargate, "AWS becomes responsible for securing the underlying instance/runtime used to run your Pods."
- **GKE:** Google hardens and patches the control plane and the node operating system and upgrades its managed components with the node version; the customer must "keep Standard node pools enrolled in automatic upgrades," "monitor the cluster and applications and respond to any alerts and incidents," and "ensure Logging and Monitoring are enabled on clusters."
- **ECS:** "a fully managed container orchestration service" run "without the complexity of managing a control plane." On EC2 capacity, "you choose the instance type, the number of instances, and manage the capacity"; on ECS Managed Instances, "AWS handles provisioning, patching, scaling, and maintenance of the underlying infrastructure"; on Fargate, "you don't need to manage servers, handle capacity planning, or isolate container workloads," and AWS patches by starting new tasks on a patched platform revision and retiring tasks on a vulnerable one.
- **Cloud Run:** "a fully managed application platform"; "you don't have to create a cluster or manage infrastructure," and "Cloud Logging automatically ingests container logs." App Runner and Container Apps are sold on the same pattern, a container product with no control plane in view ([The Orchestrators That Aren't Kubernetes](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#the-orchestrators-that-aren-t-kubernetes)).

The calendar behind the upgrade rows is public: upstream Kubernetes ships three minors a year with about fourteen months of patches each; EKS supports a minor for 14 months standard plus 12 extended, GKE for 14 months or up to 24 on its Extended channel ([Release Channels and Forced Upgrades](/books/hosting-and-cloud/managed-kubernetes#release-channels-and-forced-upgrades)).

**Who does each recurring task** (P: the provider absorbs it; S: shared, the provider runs it and the customer configures, tests or schedules it; C: the customer):

| Task | Self-run Kubernetes | Managed Kubernetes | ECS on EC2 | ECS on Fargate | Cloud Run and peers | Fly or a PaaS | VMs | Dedicated | Owned in colo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Control-plane and node upgrades | C | S | P | P | P | P | n/a | n/a | n/a |
| OS patching and images | C | S | C | P | P | P | C | C | C |
| Add-ons (CNI, ingress or Gateway, cert-manager, external-dns, CSI, autoscaler) | C | S | S | P | P | P | C | C | C |
| Observability stack | C | C | C | S | S | S | C | C | C |
| Security and policy | C | C | C | S | S | S | C | C | C |
| Capacity and cost tuning | C | C | C | S | S | S | C | C | C |
| Infrastructure incidents and on-call | C | S | S | S | S | S | S | C | C |
| Backups and DR tests | C | C | C | C | C | C | C | C | C |
| Hardware: failures, remote hands, refresh | P | P | P | P | P | P | P | S | C |

Self-run Kubernetes here means kubeadm or Talos on rented VMs or servers, so the hardware row belongs to whoever rents them. Backups and DR tests stay with the customer everywhere: no provider restores data it doesn't know matters.

**Hours a month for a small estate** (one to three services, the worked workload's 16 vCPUs and 64 GB, one region, one production environment). These are my estimates, not measurements, divided by 140 productive hours an engineer-month (also my assumption, after meetings and leave):

| Task, hours a month | Self-run Kubernetes | Managed Kubernetes | ECS on EC2 | ECS on Fargate | Cloud Run and peers | Fly or a PaaS | VMs | Dedicated | Owned in colo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Control-plane and node upgrades | 16 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| OS patching and images | 6 | 4 | 6 | 0 | 0 | 0 | 8 | 8 | 8 |
| Add-on lifecycle | 18 | 14 | 3 | 1 | 0 | 0 | 3 | 6 | 6 |
| Observability stack | 14 | 12 | 8 | 4 | 3 | 3 | 8 | 8 | 8 |
| Security and policy | 12 | 10 | 6 | 4 | 3 | 3 | 6 | 8 | 8 |
| Capacity and cost tuning | 6 | 6 | 5 | 2 | 1 | 1 | 4 | 2 | 4 |
| Infrastructure incidents | 16 | 10 | 6 | 2 | 2 | 2 | 5 | 10 | 10 |
| Backups and DR tests | 8 | 6 | 4 | 1 | 1 | 1 | 1 | 4 | 4 |
| Hardware | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 16 |
| **Total** | **96** | **70** | **38** | **14** | **10** | **10** | **35** | **49** | **64** |
| **FTE** | **0.69** | **0.50** | **0.27** | **0.10** | **0.07** | **0.07** | **0.25** | **0.35** | **0.46** |

The upgrade rows follow the calendar: three Kubernetes minors a year at about two days each for a managed cluster (test, control plane, node pools, the add-ons that follow), and about twice that self-run, where etcd, its backups, certificate rotation and the control plane are also the customer's. The add-on row is six or so add-ons, each with its own releases and a compatibility matrix against the minor.

**FTE ranges by estate size**, my estimates for platform work only (application development and the application's own pager are excluded):

| Platform | Small: 1 to 3 services, 16 to 64 vCPUs | Medium: 10 to 30 services, about 800 vCPUs | Large: 100+ services, 10,000+ vCPUs, several regions |
| --- | --- | --- | --- |
| Self-run Kubernetes | 0.6 to 1.0 | 2.5 to 4 | 8 to 15 |
| Managed Kubernetes | 0.4 to 0.75 | 1.5 to 3 | 5 to 10 |
| ECS on EC2 | 0.2 to 0.35 | 1 to 1.5 | 3 to 5 |
| ECS on Fargate | 0.1 to 0.2 | 0.5 to 1 | 2 to 4 |
| Cloud Run and peers | 0.05 to 0.15 | 0.4 to 0.8 | 1.5 to 3 |
| Fly or a PaaS | 0.05 to 0.15 | 0.4 to 0.8 | 1.5 to 3, where the platform's limits allow that size at all |
| VMs | 0.2 to 0.35 | 1 to 2 | 4 to 6 |
| Dedicated servers | 0.3 to 0.5 | 1.5 to 2.5 | 4 to 8 |
| Owned metal in colo | 0.5 to 1 | 2 to 3.5 | 6 to 12, plus the platform run on it |

The scaling rule behind the columns: per-cluster work (upgrades, add-ons) grows with clusters and environments, not with nodes; per-host work (patching, agents) grows with hosts until it is automated; per-service work (alerts, dashboards, policy) grows with services on every platform. That is why Kubernetes looks expensive small and reasonable large, and why a managed container service stays cheapest in people at every size it fits.

**The on-call floor.** The ranges are hours of work; a pager is a headcount. Google's SRE book puts the minimum for a single-site team carrying a 24-hour rotation at eight engineers, and at six per site for two sites, so that no one spends more than 25% of their time on call: with a primary and a secondary on one-week shifts, eight people put each engineer on primary one week in eight and on secondary one week in eight. A company whose infrastructure needs someone awake at 3 a.m. needs about eight people able to answer it, whether or not the work fills their week. With fewer, the honest choices are business-hours coverage for infrastructure, or a platform whose infrastructure pages its provider rather than its customer, which is most of what the P column above buys.

**Public anchors.** None of these gives a people-per-platform figure; they bound the estimates:

- **37signals** doesn't publish its operations headcount. It did say three times that leaving the cloud didn't change it: "without changing the size of the operations team at all" (June 23, 2023), "we didn't change the team composition after our cloud exit" (December 19, 2023) and "the team managing everything is still the same" (October 17, 2024). It racks through "a white-glove data center service provider called Deft," and its ops team "basically never set foot in our data centers," so its hardware row is bought, not staffed.
- **The CNCF's survey** released January 20, 2026 put the top Kubernetes challenges as cultural change with the development team (47%), training and security (36% each) and complexity (34%), all people costs ([When Not to Run Kubernetes](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#when-not-to-run-kubernetes)).
- **Spectro Cloud's State of Production Kubernetes 2025**, a vendor survey of 455 respondents, reports enterprises that "already run >20 clusters and >1,000 nodes," four in five respondents claiming a mature platform-engineering function, and "cost is the biggest pain across the board." The publisher sells Kubernetes management, and the respondents are enterprises with platform teams, which is the point: Kubernetes at that scale comes with one.

What would change my estimates: automation already in place (an image pipeline and GitOps cut the patching and add-on rows sharply), node-less modes (GKE Autopilot and EKS Auto Mode move node upgrades toward P), compliance regimes that add evidence work to every row, the number of clusters and environments rather than nodes, and skills the team already has, which make the first year on a familiar platform cheaper.

## A Worked TCO

One workload, four placements, priced at published rates as of October 2026. The workload is a steady service that needs 16 vCPUs and 64 GB of memory around the clock and sends 2,000 GB a month to the internet, observed for a year with no seasonal peak. A database is left out, so the comparison is compute only; a managed database's premium and extended-support terms add to the cloud columns in the same way. Months are 730 hours; the FTE is priced at $11,801 a month from [Counting People](#counting-people); the euro is converted at the ECB reference rate of 1.1150 dollars on October 27, 2026; Hetzner's prices exclude VAT.

The four placements:

- **A. VMs:** 8 × m7i.large on a one-year, no-upfront Compute Savings Plan ($0.07406 an hour each), US East.
- **B. Managed containers:** ECS on Fargate, 16 vCPUs and 64 GB at the Linux x86 rates, on demand.
- **C. Managed Kubernetes:** EKS with 9 × m7i.large nodes on the same plan (one node's worth of headroom for system pods, DaemonSets and packing waste) and the $0.10 control plane.
- **D. Rented dedicated:** 2 × Hetzner AX42 at €99 (one server carries the load; the second is the redundancy a cloud region would otherwise provide), setup fees spread over 12 months.

| Line, per month | A. VMs | B. Fargate | C. EKS | D. Dedicated |
| --- | --- | --- | --- | --- |
| Compute | $432.51 | $680.50 | $486.57 | $220.77 |
| Control plane or setup | | | $73.00 | $9.11 |
| Transfer out (1,900 GB billable) | $171.00 | $171.00 | $171.00 | $0 (unlimited) |
| Support plan (Business Support+, 9%) | $54.32 | $76.64 | $65.75 | None |
| **Provider bill** | **$657.83** | **$928.14** | **$796.32** | **$229.88** |
| Observability ($15 a host) | $120.00 | Not counted | $135.00 | $30.00 |
| People (FTE, my estimate) | 0.25: $2,950 | 0.10: $1,180 | 0.50: $5,901 | 0.35: $4,130 |
| **Total cost of ownership** | **$3,727.83** | **$2,108.14** | **$6,832.32** | **$4,389.88** |
| **A year** | **$44,734** | **$25,298** | **$81,988** | **$52,679** |
| Bill as a share of TCO | 18% | 44% | 12% | 5% |

The FTE fractions are the small-estate totals from [Staffing by Platform](#staffing-by-platform), my estimates and the row to argue with: a quarter of an engineer for a VM fleet's images, patching and scaling; a tenth for a container service where the provider owns everything below the task; half for a cluster's upgrades, add-ons and node pools on top of the same VMs; about a third for two dedicated servers with their own failover, OS and hardware tickets. Fargate's observability is left at zero because per-task pricing wasn't priced here, which flatters column B.

What the table shows:

- **The cheapest bill is the second most expensive placement.** Dedicated servers bill a quarter of what Fargate does, and cost about twice as much to own at this size, because the people line is fixed while the bill is small.
- **Kubernetes costs the most at this size,** not because of the $73 control plane but because the cluster is a platform to run for one workload. It earns its cost when one platform team serves many services and the people line is shared.
- **The order changes with size.** Holding the people estimates fixed, each additional block of 16 vCPUs and 64 GB costs about $742 a month more on Fargate (with support) and about $130 on dedicated (a server, its setup and its host agent), so dedicated catches up at about five blocks (80 vCPUs and 320 GB), before counting transfer out, which moves the crossover lower. VMs overtake Fargate much later, at about twelve blocks, because per-host observability eats most of their compute saving.
- **The sticker price misleads every time it's used alone.** The bill is between 5% and 44% of the total here; a migration justified by the bill alone is justified by the smallest term.

The model in [How to Build It](#how-to-build-it) stores exactly these rows, so the comparison can be rerun when a price, a rate or an FTE estimate changes.

## Buying the Servers

Owning means paying for the fleet before it runs, then paying to keep it running. [Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) sets out when that is worth deciding; this section prices the lines, and [Year over Year](#year-over-year) runs them.

- **Servers.** The one public price at fleet scale is 37signals': twenty Dell R7625s, each with "two AMD EPYC 9454 CPUs running at 2.75GHz with 48 cores / 96 threads," together "almost 4,000 vCPUs," 7,680 GB of RAM and 384 TB of Gen 4 NVMe across Chicago and Ashburn (April 6, 2023), bought for "about half a million dollars" (June 23, 2023): about $25,000 a server for 192 threads and 384 GB. By October 17, 2024 Hansson put the Dell hardware at "about $700,000 in the end." These are 2023 prices won by a buyer of twenty, and memory and SSD prices rose in 2026 (Hetzner cited both for its increases), so I use $25,000 a server as a dated reference point, not a quote.
- **Storage.** 37signals' second purchase was storage: about $1.5 million of Pure Storage for 18 PB across its two data centers, plus "a bit under $1 million" of support over five years (March 26, 2025, in [Repatriation](/books/hosting-and-cloud/repatriation#37signals-leaves-2022-to-2026)). Support is a recurring line, there about 13% of the purchase a year.
- **Network gear.** Top-of-rack switches, routers or firewalls, and out-of-band management. I found no list price I could open and date, so the model carries it as a parameter.
- **Spares and failure.** Sized from failure rates ([Spares, Inventory and Failure](/books/hosting-and-cloud/dedicated-servers#spares-inventory-and-failure)). The largest public drive dataset, Backblaze's, reported a 1.41% lifetime annualized failure rate across 354,415 drives at Q2 2026 (1.73% for the quarter), published September 29, 2026; those are hard drives in a storage fleet, but the arithmetic carries: 160 drives at 1.41% expect about two failures a year, which a spare pool of drives and a server per site covers.
- **Colocation rent and power.** All-in per committed kilowatt, around $250 a month in Inflect's 2026 example, or metered energy plus a space charge; retail cabinets run about $600 to $1,000 for a quarter to half rack and $750 to $875 for a full one ([How Colocation Is Sold](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold), [When the House Isn't Enough](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough)). 37signals paid about $60,000 a month for eight racks in two data centers through Deft's white-glove service, with bandwidth and power included. I found no published average draw for this server, so the model assumes 0.5 kW a server plus 1 kW of network per site; a reading at the PDU replaces it.
- **Transit.** Priced per site per port or commit; Hurricane Electric's promotional $600 cabinet with 1 Gbps is a floor, not a market rate. The model carries $1,000 a month per site, my assumption.
- **Remote hands.** From €21 per 15 minutes (Hetzner) to $250 an hour (HostColor), or included in a white-glove contract like 37signals'.
- **People.** The same FTE method as everywhere else: 2 to 3.5 FTE for owned metal in colo at a medium estate, or the change from today's team, which is zero when the team that ran VMs runs servers.
- **Refresh.** At the end of the useful life the fleet is bought again. It is year six of a five-year model, and it is why a five-year saving isn't a permanent one.

**Cash, financing or leasing.** Paying cash puts the whole purchase in month zero. Vendor financing or a lease spreads it into payments that include interest, payment = P × r ÷ (1 − (1 + r)^−n) for principal P, monthly rate r and n months, so the total paid exceeds P. Dropbox's S-1 says it financed "some of our equipment and datacenters" through leasing arrangements. Financing moves the cash break-even earlier and the total cost up; a TCO compares the options with the interest in.

**Depreciation and useful life.** The income statement spreads the purchase straight-line over a useful life. Amazon extended its servers' useful life from five to six years effective January 1, 2024, then shortened it to five for a subset of servers and networking equipment effective January 1, 2025, citing the pace of AI and machine learning; CoreWeave went from five to six ([Cost per Unit](/books/hosting-and-cloud/operating-metrics#cost-per-unit)). A hyperscaler's six years rest on fleet-scale spares, repair and redeployment; an owner of twenty servers should assume five for general compute, as 37signals' model did ("servers lasting five years," with some of its boxes running seven to eight), and less for accelerators.

## Year over Year

The model, for each workload: Year 0 is the purchase at the start; Years 1 to 5 are the run-rate; the cloud side is the cheapest cloud TCO for that size from the published prices above, held flat. No growth and no price changes, because each is a sensitivity below rather than an assumption baked in.

### The worked workload

Against Fargate's $25,298 a year from [A Worked TCO](#a-worked-tco), owning means two servers in colocation. At the $25,000 reference server (far larger than 16 vCPUs need, but the only dated price in the record), Year 0 is $50,000. The run-rate: 0.46 FTE ($65,142), two single-server colo slots at RackNerd's $179 ($4,296; its 1 A allotment won't carry a dual-socket server, so power above it is extra), an hour of remote hands a month at $250 ($3,000) and two host agents ($360), $72,798 a year.

| Year | Fargate | Owned | Saving | Cumulative |
| --- | --- | --- | --- | --- |
| 0 | $0 | $50,000 | -$50,000 | -$50,000 |
| 1 | $25,298 | $72,798 | -$47,500 | -$97,500 |
| 2 | $25,298 | $72,798 | -$47,500 | -$145,000 |
| 3 | $25,298 | $72,798 | -$47,500 | -$192,500 |
| 4 | $25,298 | $72,798 | -$47,500 | -$240,000 |
| 5 | $25,298 | $72,798 | -$47,500 | -$287,500 |

It never breaks even, and no hardware price fixes it: the owned people line alone is 2.6 times Fargate's whole cost.

### A larger fleet

A steady 800 vCPUs and 3,200 GB (50 of the worked blocks), sending 10,000 GB a month out. At this size VMs beat Fargate on TCO ($512,933 against $556,936 a year), so the cloud side is EC2 on the one-year Compute Savings Plan at the m7i.large rate: compute $259,506, transfer out $10,692, Business Support+ $21,314 (9% of the first $10,000 a month and 7% above), observability at 50 host-equivalents $9,000, and 1.5 FTE $212,421.

The owned side is the 37signals shape: 20 servers at $25,000 ($500,000) plus network gear and spares at 15% ($75,000, my assumption), $575,000 in Year 0, in two sites of ten, each able to carry the whole workload (800 of 1,920 threads and 3,200 of 3,840 GB on failover). The run-rate: 12 kW at $250 ($36,000), transit at $1,000 a site a month ($24,000), two hours of remote hands a site a month ($12,000), 20 host agents ($3,600), and hardware support from Year 4 after a three-year warranty at 5% of the server price ($25,000, my assumption). People are the fork: 1.5 FTE if the team that runs the VMs runs the servers, as at 37signals, or 2.75 FTE ($389,439) if it has to be hired.

| Year | Cloud (EC2) | Owned, team exists | Cumulative | Owned, team hired | Cumulative |
| --- | --- | --- | --- | --- | --- |
| 0 | $0 | $575,000 | -$575,000 | $575,000 | -$575,000 |
| 1 | $512,933 | $288,021 | -$350,088 | $465,039 | -$527,106 |
| 2 | $512,933 | $288,021 | -$125,176 | $465,039 | -$479,212 |
| 3 | $512,933 | $288,021 | $99,736 | $465,039 | -$431,318 |
| 4 | $512,933 | $313,021 | $299,648 | $490,039 | -$408,424 |
| 5 | $512,933 | $313,021 | $499,560 | $490,039 | -$385,530 |
| **Five years** | **$2,564,665** | **$2,065,105** | | **$2,950,195** | |

With the team in place, owning saves $224,912 a year in Years 1 to 3, breaks even in month 31, and saves $499,560 over five years, 19% of the cloud total. With the team hired, it saves $47,894 a year and never recovers the purchase. On the income statement, with the $575,000 depreciated over five years ($115,000 a year), the team-in-place case costs $403,021 a year in Years 1 to 3 against $512,933.

What changes the answer:

- **Staff you already have.** The two owned columns differ only by 1.25 FTE, $885,090 over five years, which is more than the whole hardware purchase. This is the term the published cases set to zero.
- **Utilization.** Two full sites each able to carry everything means the fleet runs at about 21% of threads and 42% of memory. Three sites at N+1, or one owned site with the cloud as the standby, changes the capex more than any price negotiation.
- **Growth.** Growth inside the owned headroom costs nothing extra; on the cloud it bills from the first hour. Growth past the headroom is a purchase with a lead time.
- **Egress.** At 10 TB a month it is $10,692 a year here; at the volumes of 37signals' or Dropbox's storage, transfer out is the line that decides it ([Egress & Switching](/books/hosting-and-cloud/egress-and-switching#how-the-providers-do-it)).
- **Discounts the cloud gives at that size.** A customer spending $260,000 a year on compute can buy three-year plans or negotiate a private rate ([Enterprise Commitments and Shortfalls](/books/hosting-and-cloud/commitments-and-marketplaces#enterprise-commitments-and-shortfalls)); compare against that rate, not the one-year plan.
- **Hardware prices.** Every 20% on the server price adds $100,000 to Year 0 and about five months to the break-even.

## The Evidence: What the Published Numbers Include

Two companies have published enough to check. Both are cited for what they saved; both are more useful for what they counted.

The 37signals record, year over year:

| Date | What was published | Kind |
| --- | --- | --- |
| February 21, 2023 | About $1.5 million a year saved, about $7 million over five years after a $500,000 reserve | Projection |
| June 23, 2023 | "About half a million dollars" of Dell servers, amortized over five years; "we'll save at least $1.5 million per year" | Projection |
| September 15, 2023 | Non-S3 cloud spend down from about $180,000 a month to under $80,000, "down by 60% already" | Reported |
| October 17, 2024 | Bill from a $3.2 million to a $1.3 million run rate, "almost two million dollars per year"; Dell hardware "about $700,000 in the end"; "well over ten million dollars over five years," about $4 million of it projected from leaving S3 | Reported, plus projection |
| March 26, 2025 | S3 "just shy of $1.5 million/year"; Pure Storage about $1.5 million plus a bit under $1 million of support over five years | Plan |
| October 20, 2025 | "We finally NUKED our entire AWS account," after compute and databases in 2023 and S3 that summer, posted by Hansson on X | Reported |
| January 8, 2026 | The S3 transfer complete: about 10 PB, in under 10 days | Reported |

**37signals (2023 to 2025).** The February 21, 2023 model counted hardware (about $600,000 amortized over five years) and about $60,000 a month for eight racks of colocation, bandwidth and power, about $840,000 a year, against about $2.3 million of non-S3 cloud spend. It left out S3 (about $1 million a year, handled in a later move), the people ("without changing the size of our ops team"), the migration itself (covered by a $500,000 reserve for unforeseen expenses rather than itemized) and the refresh after five years. The rented baseline wasn't list price: on September 15, 2023 Hansson wrote that "the only way to get pricing in the cloud down from obscene to merely offensive is through reserved instances," that those commitments were why the bill didn't fall immediately, and that non-S3 spend had fallen from about $180,000 a month to under $80,000 with "our ops team stayed the same." So the comparison was against committed rates, with a zero people delta for a team that already existed. The later figures keep the same frame: the October 2024 "ten million" adds a projected S3 saving to two years of actuals, counts the Pure Storage purchase and its "modest service contracts," and says itself that the comparison "is never fully apples-to-apples," since a company without existing racks would also pay for space. None of it is audited, and none of it prices the people. It shows what owning costs a team that already exists, not what it costs to build one.

**Dropbox (2016 to 2017).** The S-1's $39.5 million net decrease in infrastructure costs for 2016 is already net of the owned side: a $92.5 million drop in payments to its third-party provider offset by $53.0 million more "depreciation, facilities, and support expense related to our infrastructure." A further $35.1 million decrease followed in 2017, $74.6 million over the two years, the only year-over-year saving in the record that an auditor signed. Its cost of revenue includes employee costs "for employees whose primary responsibilities relate to supporting our infrastructure," so operating staff are inside the comparison. Research and development, which "consist primarily of employee-related costs for our engineering, product, and design teams," is a separate line, and the filing doesn't break out how much of it built Magic Pocket, so the engineering that made the saving possible isn't netted against it. The cash also doesn't match the income statement: the S-1 says Dropbox financed "some of our equipment and datacenters" through leasing arrangements. It is an audited result for operating cost at exabyte scale, not a full TCO.

**Vendor-commissioned studies** belong in a separate pile. A Forrester TEI or an ESG economic validation is a composite customer chosen and reviewed with the sponsor; the disclosure is in the study, and I read the result as the sponsor's best case.

## CI on the Same Ladder

Build infrastructure climbs the same stages and has the same crossover, at a smaller size. GitHub Actions' hosted runners are free for public repositories on standard runners, and private repositories pay per minute after an included allowance ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#github-s-2026-change-and-the-self-hosted-fee)); the bill is the whole cost, because nothing is left to operate. When minutes become the largest line for private repositories, self-hosted runners registered with GitHub keep the orchestration, the workflow syntax and the UI and move the machines to hardware the team runs; GitHub's documentation, as of October 2026, still lists self-hosted usage as free after it postponed a per-minute platform charge. That moves the cost from minutes to the people line: images, autoscaling, isolation for untrusted code ([Hosted, Hybrid and Self-Hosted](/books/hosting-and-cloud/runners-and-build-infrastructure#hosted-hybrid-and-self-hosted)). The last step leaves GitHub's orchestrator: Gitea Actions describes itself as "similar and mostly compatible to GitHub Actions," with a runner built on a hard fork of nektos/act, and Forgejo Actions says it "is designed to be familiar to users of GitHub Actions, but it is not designed to be compatible," so workflows need "some minimal tweaking." That step trades a fee and a dependency for a forge to run, which is the same trade as the rest of this chapter.

## The Alternatives

The stages side by side, for a steady workload a small team runs:

| Stage | Bill | People | Upgrades | Exit cost | Capital | Best for |
| --- | --- | --- | --- | --- | --- | --- |
| **Homelab** | Lowest: power and a line | All of it, unpaid | All of it | Low: it's yours | Small, owned | Learning, private services |
| **Colocation, owned hardware** | Low per unit at steady load | High: hardware and everything above | All of it | Hardware stranded on a shrink | Owned, depreciated | Steady load with an existing ops team |
| **Rented dedicated** | Low; transfer mostly included | Medium: OS up and failover | OS and above | Low: monthly terms | None | Steady load, cost-sensitive, few machines |
| **IaaS VMs** | Medium; transfer and support add up | Medium: images, patching, scaling | OS and above | Egress (waived on exit), commitments | None | Variable load, teams that want hosts |
| **Managed services and PaaS** | Highest per unit | Lowest | The vendor's calendar | Rewrite of what depends on the service | None | Small teams, unknown load |
| **Managed Kubernetes** | VMs plus a fee | High: node pools, add-ons, platform | Three minors a year | Portable manifests, non-portable add-ons | None | Many services and a platform team |
| **Self-run Kubernetes** | Machines only | Highest: control plane too | All of it | Portable | Owned or rented | Owned metal with a platform team |
| **Owned metal again** | Lowest per unit at scale | High, unless the team exists | All of it | Hardware and colo terms | Large, depreciated | Steady load at scale with the team in place |

## My Default

My default is to price every placement as bill plus people plus the off-bill stack, with the FTE estimates written down, and to let the people line decide for small workloads and the bill decide for large ones. For a team without a platform group, that means a managed container service first: ECS on Fargate, Cloud Run or Fly Machines, on the provider's database. I like Kubernetes and I'd still not start there: even a managed cluster leaves upgrades three times a year, the add-on matrix and the observability stack with the customer, and without a team to own those, the cluster costs more than the workloads on it. I'd move to Kubernetes when there are enough services that one platform team's cost is shared across them, and to rented dedicated or owned metal when a steady load is large enough that the bill difference pays for the people difference with margin, by the arithmetic in [A Worked TCO](#a-worked-tco) and [Year over Year](#year-over-year). I'd buy servers only with the team already in place or a plan that still pays back inside the useful life with the hires counted, since that one line decides whether the larger fleet saves half a million dollars over five years or loses nearly $400,000, and then follow [Repatriation](/books/hosting-and-cloud/repatriation#my-default) for the move itself.

For CI I'd follow the same ladder: GitHub's hosted runners until the minutes bite (and indefinitely for open source, where they're free), then self-hosted runners on GitHub's orchestrator for private repositories, and only then an Actions-style forge off GitHub (Gitea or Forgejo with their runners), accepting the workflow tweaks and a forge to run.

What would change it: a team that already exists and already runs servers, where the people delta is zero and the cheaper bill wins at any size, as it did for 37signals; a regulated or residency requirement that rules out a placement before price matters; or a load so spiky that only per-second billing fits, which keeps it on managed services however large it gets.

## How to Build It

The bill is already in the core model: a provider's own `rated_usage` for its customers, or, for a company that runs on a cloud, its underlay bill loaded as `usage_events` and rated under its internal account, the convention [Repatriation](/books/hosting-and-cloud/repatriation#how-to-build-it) sets. What the model lacks is everything not on the bill. This chapter adds one table for it, `ownership_costs`: effective-dated rows of off-bill cost per workload and scenario, including capex with its useful life, with the assumption that produced each. Candidate placements that have no bill yet carry their estimated bill as a row too, so current and candidates are compared in one query.

```sql
CREATE TABLE ownership_costs (           -- costs not on the provider's bill, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),   -- the internal account, or a customer's
  project_id      UUID REFERENCES projects (id),            -- the workload; null: the whole account
  scenario        TEXT NOT NULL,          -- 'current', or a candidate: 'fargate', 'dedicated-ax42'
  category        TEXT NOT NULL CHECK (category IN (
                    'bill_estimate',       -- a candidate's bill, priced from published rates
                    'people', 'on_call', 'observability', 'security', 'licenses',
                    'support_plan', 'hardware', 'hardware_support', 'facility', 'power',
                    'transit', 'remote_hands', 'migration', 'exit', 'training')),
  basis           TEXT NOT NULL CHECK (basis IN ('monthly', 'fte', 'one_time', 'capex')),
  fte             NUMERIC(6,3),           -- for basis 'fte': the fraction of an engineer
  amount          BIGINT NOT NULL CHECK (amount >= 0),  -- minor units: per month, per FTE-year,
                                          -- or the one-time or purchase total
  currency        CHAR(3) NOT NULL,
  spread_months   SMALLINT CHECK (spread_months > 0),  -- 'one_time': months to amortize over;
                                          -- 'capex': the useful life, depreciated straight-line
  valid_during    TSTZRANGE NOT NULL,     -- when the estimate applies; for 'one_time' and 'capex'
                                          -- it starts in the month paid and spans spread_months
  assumption      TEXT NOT NULL,          -- the source or reasoning: 'BLS OOH May 2025 / ECEC 0.70'
  recorded_by     TEXT NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((basis = 'fte') = (fte IS NOT NULL)),
  CHECK ((basis IN ('one_time', 'capex')) = (spread_months IS NOT NULL)),
  CHECK (scenario <> 'current' OR category <> 'bill_estimate')  -- the current bill is rated_usage
);

CREATE INDEX ownership_costs_lookup
  ON ownership_costs USING GIST (account_id, project_id, scenario, valid_during);
```

```sql
-- Monthly total cost of ownership per scenario for one workload, on the income-statement
-- view: capex appears as straight-line depreciation over its useful life.
-- :account_id, :project_id, :month (first day), :currency
WITH m AS (
  SELECT :month::timestamptz AS starts, :month::timestamptz + INTERVAL '1 month' AS ends
),
bill AS (                                -- the current placement's real bill
  SELECT 'current'::text AS scenario, 'bill'::text AS category, SUM(ru.amount) AS monthly
  FROM rated_usage ru
  JOIN resources r ON r.id = ru.resource_id
  CROSS JOIN m
  WHERE ru.account_id = :account_id
    AND r.project_id = :project_id
    AND ru.currency = :currency
    AND lower(ru.rated_during) >= m.starts
    AND lower(ru.rated_during) <  m.ends
),
off_bill AS (                            -- everything else, normalized to a month
  SELECT oc.scenario,
         CASE WHEN oc.category = 'bill_estimate' THEN 'bill' ELSE oc.category END AS category,
         CASE oc.basis
           WHEN 'monthly'  THEN oc.amount::numeric
           WHEN 'fte'      THEN oc.fte * oc.amount / 12.0
           ELSE oc.amount::numeric / oc.spread_months  -- amortized, or depreciated
         END AS monthly
  FROM ownership_costs oc
  CROSS JOIN m
  WHERE oc.account_id = :account_id
    AND oc.project_id IS NOT DISTINCT FROM :project_id
    AND oc.currency = :currency
    AND oc.valid_during @> m.starts
),
all_costs AS (
  SELECT * FROM bill WHERE monthly IS NOT NULL
  UNION ALL
  SELECT * FROM off_bill                 -- 'current' rows here are the current placement's
)
SELECT scenario,
       SUM(monthly) FILTER (WHERE category = 'bill')                        AS provider_bill,
       SUM(monthly) FILTER (WHERE category IN ('people', 'on_call'))        AS people,
       SUM(monthly) FILTER (WHERE category NOT IN ('bill', 'people', 'on_call')) AS other_off_bill,
       SUM(monthly)                                                         AS tco,
       ROUND(SUM(monthly) FILTER (WHERE category = 'bill')
             / NULLIF(SUM(monthly), 0), 2)                                  AS bill_share
FROM all_costs
GROUP BY scenario
ORDER BY tco;
```

```sql
-- Five years of cash: a candidate placement against the current one, by year, with the
-- cumulative saving and the break-even month. The current bill is projected flat at its
-- trailing twelve months of rated_usage; month 0 is the purchase month before :start.
-- :account_id, :project_id, :candidate, :start (first day of month 1, UTC), :currency
WITH months AS (
  SELECT g AS month_no,
         :start::timestamptz + (g - 1) * INTERVAL '1 month' AS starts
  FROM generate_series(0, 60) AS g
),
current_bill AS (                        -- the run-rate the candidate would replace
  SELECT COALESCE(SUM(ru.amount), 0) / 12.0 AS monthly
  FROM rated_usage ru
  JOIN resources r ON r.id = ru.resource_id
  WHERE ru.account_id = :account_id
    AND r.project_id = :project_id
    AND ru.currency = :currency
    AND lower(ru.rated_during) >= :start::timestamptz - INTERVAL '12 months'
    AND lower(ru.rated_during) <  :start::timestamptz
),
cash AS (                                -- off-bill cash per scenario and month
  SELECT oc.scenario, m.month_no,
         SUM(CASE oc.basis
               WHEN 'monthly' THEN oc.amount::numeric
               WHEN 'fte'     THEN oc.fte * oc.amount / 12.0
               ELSE oc.amount::numeric   -- one_time and capex: the whole amount, once
             END) AS amount
  FROM ownership_costs oc
  JOIN months m
    ON CASE WHEN oc.basis IN ('one_time', 'capex')
            THEN date_trunc('month', lower(oc.valid_during)) = m.starts
            ELSE m.month_no >= 1 AND oc.valid_during @> m.starts
       END
  WHERE oc.account_id = :account_id
    AND oc.project_id IS NOT DISTINCT FROM :project_id
    AND oc.currency = :currency
    AND oc.scenario IN ('current', :candidate)
  GROUP BY oc.scenario, m.month_no
),
ledger AS (
  SELECT m.month_no,
         CASE WHEN m.month_no >= 1 THEN cb.monthly ELSE 0 END
           + COALESCE(cur.amount, 0)                         AS current_cash,
         COALESCE(cand.amount, 0)                            AS candidate_cash
  FROM months m
  CROSS JOIN current_bill cb
  LEFT JOIN cash cur  ON cur.month_no  = m.month_no AND cur.scenario  = 'current'
  LEFT JOIN cash cand ON cand.month_no = m.month_no AND cand.scenario = :candidate
),
running AS (
  SELECT month_no, current_cash, candidate_cash,
         SUM(current_cash - candidate_cash) OVER (ORDER BY month_no) AS cumulative_saving
  FROM ledger
)
SELECT CEIL(month_no / 12.0)::int                                    AS year,  -- 0: purchase
       ROUND(SUM(current_cash))                                      AS current_cash,
       ROUND(SUM(candidate_cash))                                    AS candidate_cash,
       ROUND(SUM(current_cash - candidate_cash))                     AS saving,
       ROUND(SUM(SUM(current_cash - candidate_cash))
             OVER (ORDER BY CEIL(month_no / 12.0)))                  AS cumulative_saving,
       (SELECT MIN(month_no) FROM running
        WHERE month_no >= 1 AND cumulative_saving >= 0)              AS break_even_month
FROM running
GROUP BY CEIL(month_no / 12.0)
ORDER BY year;
```

```sql
-- Assumptions due for review: open-ended estimates older than a year, and people
-- estimates with no source written down beyond a name.
SELECT scenario, category, basis, fte, amount, currency, assumption, recorded_by, recorded_at
FROM ownership_costs
WHERE account_id = :account_id
  AND upper_inf(valid_during)
  AND (recorded_at < NOW() - INTERVAL '12 months'
       OR (category IN ('people', 'on_call') AND length(assumption) < 20))
ORDER BY recorded_at;
```

Notes on the sketch:

- **One table, four kinds of row.** Monthly costs (a Datadog contract, colocation, transit, remote hands), people as FTE fractions times a loaded annual cost, one-time costs (a migration, an exit, setup fees) amortized over stated months, and capex (servers, storage, network gear, a refresh) with its useful life. Each column of the worked TCO and each owned column of [Year over Year](#year-over-year) is a handful of rows: the larger fleet's owned side is one `capex` row of $575,000 with `spread_months = 60`, monthly rows for power, transit, remote hands and agents, a `hardware_support` row whose `valid_during` starts in month 37, and an `fte` row.
- **Two views of the same rows.** The monthly query spreads capex as depreciation, which is what the income statement shows; the five-year query puts it in the month paid, which is what the bank account shows. A refresh is a second `capex` row dated at the end of the first one's life, so a model run past five years sees it.
- **Break-even is the first crossing.** `break_even_month` is the first month the cumulative saving reaches zero; a model with a refresh or a support step can cross back, so read the yearly rows, not just that column.
- **The current bill is never estimated.** The `CHECK` keeps `bill_estimate` rows to candidates, so the current placement is always priced from `rated_usage` at the effective rate after commitments, which is the comparison [FinOps](/books/hosting-and-cloud/finops-and-surprise-bills#cost-exports-cur-and-focus) data supports and list-price models skip.
- **Account-level charges need an owner.** A support plan or tax line rated to the account rather than a resource has no `resource_id` and drops out of the project's bill; allocate it with the playbook's [owner rule](/docs/operations/cost-and-finops#every-dollar-has-an-owner) or carry it as a `support_plan` row, but not both.
- **Effective dating is the history.** A changed estimate closes the old row's `valid_during` and opens a new one, so last year's decision can be rerun with last year's assumptions; rows are never updated in place, per [Effective Dating & History](/docs/database/temporal-data#effective-dated-rows).
- **Capex rows come from the asset register once the hardware exists.** Before purchase a `capex` row is a quote; after it, the amount and date should match `hardware_assets` and the depreciation schedule [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it) keeps. Sizing the owned fleet from the cloud bill's demand profile is [Repatriation](/books/hosting-and-cloud/repatriation#how-to-build-it)'s query.
- **It is the same comparison as other placement queries.** [Where AI Runs](/books/hosting-and-cloud/where-ai-runs#how-to-build-it) compares tiers per million tokens from `rated_usage`; this adds the costs that never reach `rated_usage`.
- **Events:** a new or superseded `ownership_costs` row emits `ownership_cost.recorded`, and a rerun of the comparison is a decision record kept with the [cost review](/docs/operations/cost-and-finops#cost-in-design-reviews) that acts on it.

## Auditing

- **Every estimate's source.** The `assumption` text and who recorded it, because the FTE fractions and the loaded cost are what a later review will challenge, and an unsourced number can't be defended or corrected.
- **The comparison as run.** The query output, the parameters, the date and the decision, so a placement change can be traced to the numbers that justified it.
- **Price dates.** The rate card or price list version behind every `bill_estimate` row, because published prices change (Hetzner's 2026 increases are the recent case) and an estimate priced at an old rate is a wrong estimate.
- **Commitment end dates** beside any move, so the comparison never assumes an exit that a commitment still bills.
- **Capex against the asset register.** Every `capex` row's amount and date reconciled to purchases and the depreciation schedule once the hardware is bought, so the model's owned side is what was actually spent.

## What This Means for the System You Build

- **Price the total, not the bill:** bill, people, observability and security, migration and exit, commitments, depreciation.
- **Count people as a stated fraction** of a fully loaded engineer, built from the tasks each platform leaves you, and count only the change.
- **Respect the on-call floor:** a 24-hour infrastructure pager needs about eight people, so a small team should buy a platform that pages its provider.
- **Model owning year over year,** with capex in month zero, a five-year life, the refresh after it, and the break-even month, never a single year's saving.
- **Expect the order to change with size:** people dominate small workloads, the bill dominates large ones.
- **Start small teams on managed containers,** move to Kubernetes when a platform team's cost is shared across many services, and to dedicated or owned metal when the bill difference pays for the people difference.
- **Compare against effective rates** from the bill, never list prices, and against commitments' end dates.
- **Read published cases for what they counted,** and vendor studies as marketing.
- **Keep the estimates as effective-dated rows** so the comparison can be rerun, and rerun it when prices or the team change.
- **Then decide on owned metal** with [Repatriation](/books/hosting-and-cloud/repatriation)'s model.

Every stage in this chapter rents more than the one below it, and the totals say when that stops paying. For a company whose load has gone steady, whose team already runs servers and whose bill has outgrown the people it saves, the last placement decision is the one this volume began with: owning the hardware. That move, its history and its exit costs are [Repatriation](/books/hosting-and-cloud/repatriation), the chapter that closes the volume.

## References

**Prices and rate cards**

- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), m7i.large at $0.1008 an hour in US East (N. Virginia) and the 100 GB monthly free data transfer out
- [AWS Price List: Compute Savings Plans, US East (N. Virginia), published October 27, 2026](https://pricing.us-east-1.amazonaws.com/savingsPlan/v1.0/aws/AWSComputeSavingsPlan/20261027220835/us-east-1/index.json), the one-year no-upfront m7i.large rate of $0.07406
- [AWS Price List: AWS Data Transfer, US East (N. Virginia), published September 16, 2026](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json), $0.09 per GB for the first 10 TB a month beyond the free tier
- [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/), per vCPU-second and GB-second rates for Linux on x86 in US East
- [AWS Support: Plan pricing](https://aws.amazon.com/premiumsupport/pricing/), Business Support+ and Enterprise Support minimums and percentage tiers, as of October 2026
- [Amazon EKS pricing](https://aws.amazon.com/eks/pricing/), $0.10 standard and $0.60 extended per cluster-hour
- [Amazon RDS for MySQL pricing](https://aws.amazon.com/rds/mysql/pricing/), Multi-AZ rates and Extended Support charges
- [Datadog: Pricing](https://www.datadoghq.com/pricing/), infrastructure monitoring at $15 a host a month on an annual plan
- [Hetzner: Dedicated server matrix, AX line](https://www.hetzner.com/dedicated-rootserver/matrix-ax/), AX42 from €79 to €99 a month and the €49 setup fee, excluding VAT
- [Hetzner: AX42](https://www.hetzner.com/dedicated-rootserver/ax42/), CPU, memory, drives, €99 a month, the 1 Gbit/s port and unlimited traffic
- [Hetzner Docs: Traffic](https://docs.hetzner.com/robot/general/traffic/), unlimited traffic on 1 Gbit uplinks, 20 TB included on 10 Gbit and €1 per TB beyond
- [Hetzner: Price list for additional products](https://docs.hetzner.com/robot/general/pricing/price-list-for-additional-products), Remote Hands at €21 per 15 minutes
- [HostColor: 1U to 4U colocation](https://www.hostcolor.com/colocation/colo1u), single-server colocation prices and remote hands
- [RackNerd: Colocation](https://bf2021.racknerd.com/colocation), single server and quarter rack prices
- [Inflect: Colocation pricing in 2026](https://inflect.com/blog/colocation-pricing-what-to-expect-for-racks-cabinets-and-cages-in-2026), the all-in price per committed kilowatt in its example
- [Hurricane Electric: Colocation](https://he.net/colocation.html), the $600 cabinet with 1 Gbps, one per customer
- [ECB: Euro foreign exchange reference rates, US dollar](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html), 1.1150 dollars per euro on October 27, 2026

**Statistics**

- [EIA: Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), the August 2026 US average residential price of 18.16 cents per kWh
- [BLS Occupational Outlook Handbook: Network and Computer Systems Administrators](https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm), median annual wage of $99,130 in May 2025
- [BLS: Employer Costs for Employee Compensation](https://www.bls.gov/news.release/ecec.nr0.htm), June 2026, wages and salaries at 70.0% and benefits at 30.0% of private-industry compensation costs
- [Backblaze: Drive Stats for Q2 2026](https://backblaze.com/blog/backblaze-drive-stats-for-q2-2026), September 29, 2026, 1.73% quarterly and 1.41% lifetime annualized failure rates across 354,415 drives
- [Google SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/), eight engineers for a single-site rotation, six per site for two, and the 25% on-call limit
- [CNCF: Kubernetes established as the de facto operating system](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system), January 20, 2026, the top challenges
- [Spectro Cloud: State of Production Kubernetes 2025](https://www.spectrocloud.com/state-of-kubernetes-2025), a vendor survey of 455 respondents: cluster and node counts, platform-engineering maturity, cost as the top pain

**Filings**

- [Dropbox: Form S-1 (February 2018)](https://www.sec.gov/Archives/edgar/data/0001467623/000119312518055809/d451946ds1.htm), the Infrastructure Optimization components, what cost of revenue and research and development consist of, and equipment financed through leases
- [Amazon: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1018724/000101872425000004/amzn-20241231.htm), server useful lives from five to six years and back to five for a subset

**Provider documentation**

- [Amazon EKS Best Practices: Security, the shared responsibility model](https://docs.aws.amazon.com/eks/latest/best-practices/security.html), what AWS manages for the control plane, managed node groups and Fargate
- [GKE: Shared responsibility](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/shared-responsibility), what Google patches and upgrades and what the customer keeps
- [Amazon ECS: What is Amazon ECS?](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html), no control plane to manage, EC2 capacity, Managed Instances and Fargate
- [Amazon ECS: Architect for AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html), no servers or clusters to manage, platform version patching and task retirement
- [Cloud Run: What is Cloud Run](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run), a fully managed platform with no cluster and automatic log ingestion
- [GitHub Docs: GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), free self-hosted and public-repository usage, included minutes
- [GitHub: 2026 pricing changes for GitHub Actions](https://github.com/resources/insights/2026-pricing-changes-for-github-actions), the platform charge and its postponement
- [Gitea Docs: Actions overview](https://docs.gitea.com/usage/actions/overview), "similar and mostly compatible to GitHub Actions" and the runner forked from nektos/act
- [Forgejo: Forgejo Actions user guide](https://forgejo.org/docs/latest/user/actions/overview/), familiar to GitHub Actions users but "not designed to be compatible"

**Announcements**

- [37signals: Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0), October 19, 2022, the managed-service spend and the unchanged operations team
- [37signals: We stand to save $7m over five years from our cloud exit](https://world.hey.com/dhh/we-stand-to-save-7m-over-five-years-from-our-cloud-exit-53996caa), February 21, 2023, what the model counted and left out
- [37signals: The hardware we need for our cloud exit has arrived](https://world.hey.com/dhh/the-hardware-we-need-for-our-cloud-exit-has-arrived-99d66966), April 6, 2023, twenty R7625s, their CPUs, vCPUs, memory and NVMe, and the two sites
- [37signals: We have left the cloud](https://world.hey.com/dhh/we-have-left-the-cloud-251760fb), June 23, 2023, about half a million dollars of servers, five-year amortization and the unchanged operations team
- [37signals: Our cloud exit has already yielded $1m/year in savings](https://world.hey.com/dhh/our-cloud-exit-has-already-yielded-1m-year-in-savings-db358dea), September 15, 2023, reserved instances, the monthly spend before and after, and the same ops team
- [37signals: The Big Cloud Exit FAQ](https://world.hey.com/dhh/the-big-cloud-exit-faq-20274010), December 19, 2023, the unchanged team composition, Deft's white-glove service and server lifetimes
- [37signals: Our cloud-exit savings will now top ten million over five years](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd), October 17, 2024, the $1.3 million run rate, about $700,000 of Dell hardware, the projection and its caveats
- [37signals: It's five grand a day to miss our S3 exit](https://world.hey.com/dhh/it-s-five-grand-a-day-to-miss-our-s3-exit-b8293563), March 26, 2025, S3 cost and the Pure Storage purchase and support
- [37signals Dev: Moving Mountains of Data off S3](https://dev.37signals.com/moving-mountains-of-data-off-s3/), January 8, 2026, the completed transfer in under 10 days
- [DHH on X: the 37signals AWS account deleted](https://x.com/dhh/status/1980406035543388259), October 20, 2025

**Vendor-commissioned studies**

- [Forrester Consulting: The Total Economic Impact of Google Cloud Consulting](https://tei.forrester.com/go/google/gcc), July 2025, commissioned by Google Cloud Consulting: the ROI, NPV, composite organization and disclosures
- [Network World: Dell rolls out private cloud package](https://www.networkworld.com/article/3993333/dell-rolls-out-private-cloud-package-bolsters-ai-offerings-for-on-prem-progress.html), May 22, 2025, Dell's ESG-based on-premises TCO claim
