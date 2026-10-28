+++
title = "Total Cost of Ownership"
description = "What each stage from homelab to cloud and back really costs: the bill, the people, upgrades, exits and depreciation, with a worked TCO and a model in SQL."
category = "Hosting & Cloud Industry"
order = 2212
part = "Running the Provider"
tags = ["tco", "cost-model", "finops", "staffing", "kubernetes", "repatriation"]
+++

Total cost of ownership is everything a workload costs to run for a period, not just what its provider invoices. The invoice is the sticker price: compute, storage, transfer out, a support plan. Around it sit costs no provider bills: the people who keep the thing running and answer its pages, the upgrades a provider's calendar forces, the observability and security tools bought from other vendors, the migration in and the exit out, commitments that bill whether or not the workload is still there, and, for owned hardware, capital spent up front and written down over a useful life. Two placements with the same bill can differ by multiples in total cost, and the cheaper bill is often the more expensive placement.

This volume reads as one scaling story: a homelab, a server in colocation, rented dedicated machines, virtual machines in a cloud, managed services and platforms, Kubernetes, and for some companies a return to owned metal. Each earlier chapter priced its own layer. This one adds them up, stage by stage, against the savings people claim at each step: what the bill contains, what it leaves out, how to count the people, and how the two best-documented public cases ([Dropbox and 37signals](#the-evidence-what-the-published-numbers-include)) look once you ask what they counted. It ends with a worked comparison of one workload across four placements at published prices, and a model over the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) that puts the bill and the off-bill costs in one query. The decision to leave the cloud for owned hardware, and its own cost model, is the next and final chapter, [Repatriation](/books/hosting-and-cloud/repatriation).

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
- **Depreciation and useful life against opex.** Rented capacity is operating expense, paid as used. Owned hardware is capital: cash leaves at purchase, and the income statement sees it as depreciation over the useful life. The assumption moves the answer: Amazon extended its servers' useful life from five to six years in 2024 and shortened it back to five for a subset in 2025 (the [Repatriation](/books/hosting-and-cloud/repatriation#how-the-numbers-work) chapter cites the filing). A model should carry both views, the depreciation for the comparison and the cash for whether the company can afford it.

## Counting People

People cost is where TCO models are most often wrong, in both directions: models that sell the cloud count a whole data-center team the company never had, and models that sell owning count none. My method:

1. **Count only the change.** Price the people each placement needs minus the people the company has regardless. If the team exists and stays the same size, the people term is zero, which is what 37signals reported, and it is still worth writing down so the assumption can be checked.
2. **Express it as a fraction of a full-time engineer (FTE) per placement.** List the recurring work each placement leaves to the customer (patching, upgrades, capacity, on-call share, hardware tickets, cost reviews) and estimate hours per month for each; divide by working hours. The estimate is a parameter, stated and dated, not a fact.
3. **Price an FTE fully loaded.** Salary is only part of what an employee costs. A public baseline: the BLS put the median annual wage of network and computer systems administrators at $99,130 in May 2025, and its Employer Costs for Employee Compensation for June 2026 put wages and salaries at 70.0% of private-industry compensation costs, with benefits the other 30.0%. Dividing the wage by 0.70 gives about $141,600 a year, about $11,800 a month, before recruiting, tools, training and management. A company should use its own loaded cost; this one is a public placeholder, and the 70% share is an all-industry average, not one for engineers.
4. **Keep on-call as its own line.** A pager rotation has a minimum size whatever the workload, so the first service that needs 24-hour response pays for a rotation and the tenth shares it. Count the share, and count the rotation in full when a placement creates one that didn't exist.
5. **Rerun it when the team changes.** A placement that was cheap with an existing platform team gets expensive when that team leaves, which is a reason to revisit the model, not just the bill.

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

The FTE fractions are mine and are the column to argue with: about a quarter of an engineer for a VM fleet's images, patching and scaling; a tenth for a container service where the provider owns everything below the task; half for a cluster's upgrades, add-ons and node pools on top of the same VMs; a third for two dedicated servers with their own failover, OS and hardware tickets. Fargate's observability is left at zero because per-task pricing wasn't priced here, which flatters column B.

What the table shows:

- **The cheapest bill is the second most expensive placement.** Dedicated servers bill a quarter of what Fargate does, and cost about twice as much to own at this size, because the people line is fixed while the bill is small.
- **Kubernetes costs the most at this size,** not because of the $73 control plane but because the cluster is a platform to run for one workload. It earns its cost when one platform team serves many services and the people line is shared.
- **The order changes with size.** Holding the people estimates fixed, each additional block of 16 vCPUs and 64 GB costs about $742 a month more on Fargate (with support) and about $130 on dedicated (a server, its setup and its host agent), so dedicated catches up at about five blocks (80 vCPUs and 320 GB), before counting transfer out, which moves the crossover lower. VMs overtake Fargate much later, at about twelve blocks, because per-host observability eats most of their compute saving.
- **The sticker price misleads every time it's used alone.** The bill is between 5% and 44% of the total here; a migration justified by the bill alone is justified by the smallest term.

The model in [How to Build It](#how-to-build-it) stores exactly these rows, so the comparison can be rerun when a price, a rate or an FTE estimate changes.

## The Evidence: What the Published Numbers Include

Two companies have published enough to check. Both are cited for what they saved; both are more useful for what they counted.

**37signals (2023 to 2025).** The February 21, 2023 model counted hardware (about $600,000 amortized over five years) and about $60,000 a month for eight racks of colocation, bandwidth and power, about $840,000 a year, against about $2.3 million of non-S3 cloud spend. It left out S3 (about $1 million a year, handled in a later move), the people ("without changing the size of our ops team"), the migration itself (covered by a $500,000 reserve for unforeseen expenses rather than itemized) and the refresh after five years. The rented baseline wasn't list price: on September 15, 2023 Hansson wrote that "the only way to get pricing in the cloud down from obscene to merely offensive is through reserved instances," that those commitments were why the bill didn't fall immediately, and that non-S3 spend had fallen from about $180,000 a month to under $80,000 with "our ops team stayed the same." So the comparison was against committed rates, with a zero people delta for a team that already existed. It shows what owning costs a team that already exists, not what it costs to build one.

**Dropbox (2016 to 2017).** The S-1's $39.5 million net decrease in infrastructure costs for 2016 is already net of the owned side: a $92.5 million drop in payments to its third-party provider offset by $53.0 million more "depreciation, facilities, and support expense related to our infrastructure." Its cost of revenue includes employee costs "for employees whose primary responsibilities relate to supporting our infrastructure," so operating staff are inside the comparison. Research and development, which "consist primarily of employee-related costs for our engineering, product, and design teams," is a separate line, and the filing doesn't break out how much of it built Magic Pocket, so the engineering that made the saving possible isn't netted against it. The cash also doesn't match the income statement: the S-1 says Dropbox financed "some of our equipment and datacenters" through leasing arrangements. It is an audited result for operating cost at exabyte scale, not a full TCO.

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

My default is to price every placement as bill plus people plus the off-bill stack, with the FTE estimates written down, and to let the people line decide for small workloads and the bill decide for large ones. For a team without a platform group, that means a managed container service first: ECS on Fargate, Cloud Run or Fly Machines, on the provider's database. I like Kubernetes and I'd still not start there: even a managed cluster leaves upgrades three times a year, the add-on matrix and the observability stack with the customer, and without a team to own those, the cluster costs more than the workloads on it. I'd move to Kubernetes when there are enough services that one platform team's cost is shared across them, and to rented dedicated or owned metal when a steady load is large enough that the bill difference pays for the people difference with margin, by the arithmetic in [A Worked TCO](#a-worked-tco), and then follow [Repatriation](/books/hosting-and-cloud/repatriation#my-default) for the move itself.

For CI I'd follow the same ladder: GitHub's hosted runners until the minutes bite (and indefinitely for open source, where they're free), then self-hosted runners on GitHub's orchestrator for private repositories, and only then an Actions-style forge off GitHub (Gitea or Forgejo with their runners), accepting the workflow tweaks and a forge to run.

What would change it: a team that already exists and already runs servers, where the people delta is zero and the cheaper bill wins at any size, as it did for 37signals; a regulated or residency requirement that rules out a placement before price matters; or a load so spiky that only per-second billing fits, which keeps it on managed services however large it gets.

## How to Build It

The bill is already in the core model: a provider's own `rated_usage` for its customers, or, for a company that runs on a cloud, its underlay bill loaded as `usage_events` and rated under its internal account, the convention [Repatriation](/books/hosting-and-cloud/repatriation#how-to-build-it) sets. What the model lacks is everything not on the bill. This chapter adds one table for it, `ownership_costs`: effective-dated rows of off-bill cost per workload and scenario, with the assumption that produced each. Candidate placements that have no bill yet carry their estimated bill as a row too, so current and candidates are compared in one query.

```sql
CREATE TABLE ownership_costs (           -- costs not on the provider's bill, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),   -- the internal account, or a customer's
  project_id      UUID REFERENCES projects (id),            -- the workload; null: the whole account
  scenario        TEXT NOT NULL,          -- 'current', or a candidate: 'fargate', 'dedicated-ax42'
  category        TEXT NOT NULL CHECK (category IN (
                    'bill_estimate',       -- a candidate's bill, priced from published rates
                    'people', 'on_call', 'observability', 'security', 'licenses',
                    'support_plan', 'hardware_depreciation', 'facility',
                    'migration', 'exit', 'training')),
  basis           TEXT NOT NULL CHECK (basis IN ('monthly', 'fte', 'one_time')),
  fte             NUMERIC(6,3),           -- for basis 'fte': the fraction of an engineer
  amount          BIGINT NOT NULL CHECK (amount >= 0),  -- minor units: per month, per FTE-year,
                                          -- or the one-time total
  currency        CHAR(3) NOT NULL,
  amortize_months SMALLINT CHECK (amortize_months > 0), -- for 'one_time': months to spread it over
  valid_during    TSTZRANGE NOT NULL,     -- when the estimate applies; a one-time cost's range
                                          -- is its amortization window
  assumption      TEXT NOT NULL,          -- the source or reasoning: 'BLS OOH May 2025 / ECEC 0.70'
  recorded_by     TEXT NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((basis = 'fte') = (fte IS NOT NULL)),
  CHECK ((basis = 'one_time') = (amortize_months IS NOT NULL)),
  CHECK (scenario <> 'current' OR category <> 'bill_estimate')  -- the current bill is rated_usage
);

CREATE INDEX ownership_costs_lookup
  ON ownership_costs USING GIST (account_id, project_id, scenario, valid_during);
```

```sql
-- Monthly total cost of ownership per scenario for one workload.
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
           WHEN 'one_time' THEN oc.amount::numeric / oc.amortize_months
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

- **One table, three kinds of row.** Monthly costs (a Datadog contract, a colo invoice the bill doesn't carry), people as FTE fractions times a loaded annual cost, and one-time costs (a migration, an exit, setup fees) spread over a stated number of months. Each column of the worked TCO above is a handful of rows of this table.
- **The current bill is never estimated.** The `CHECK` keeps `bill_estimate` rows to candidates, so the current placement is always priced from `rated_usage` at the effective rate after commitments, which is the comparison [FinOps](/books/hosting-and-cloud/finops-and-surprise-bills#cost-exports-cur-and-focus) data supports and list-price models skip.
- **Account-level charges need an owner.** A support plan or tax line rated to the account rather than a resource has no `resource_id` and drops out of the project's bill; allocate it with the playbook's [owner rule](/docs/operations/cost-and-finops#every-dollar-has-an-owner) or carry it as a `support_plan` row, but not both.
- **Effective dating is the history.** A changed estimate closes the old row's `valid_during` and opens a new one, so last year's decision can be rerun with last year's assumptions; rows are never updated in place, per [Effective Dating & History](/docs/database/temporal-data#effective-dated-rows).
- **Owned hardware is depreciation, not cash.** A `hardware_depreciation` row is purchase price over useful life per month, from `hardware_assets` and the depreciation schedule [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it) keeps; the cash view is a separate report, and the rent-versus-own sizing query is [Repatriation](/books/hosting-and-cloud/repatriation#how-to-build-it)'s.
- **It is the same comparison as other placement queries.** [Where AI Runs](/books/hosting-and-cloud/where-ai-runs#how-to-build-it) compares tiers per million tokens from `rated_usage`; this adds the costs that never reach `rated_usage`.
- **Events:** a new or superseded `ownership_costs` row emits `ownership_cost.recorded`, and a rerun of the comparison is a decision record kept with the [cost review](/docs/operations/cost-and-finops#cost-in-design-reviews) that acts on it.

## Auditing

- **Every estimate's source.** The `assumption` text and who recorded it, because the FTE fractions and the loaded cost are what a later review will challenge, and an unsourced number can't be defended or corrected.
- **The comparison as run.** The query output, the parameters, the date and the decision, so a placement change can be traced to the numbers that justified it.
- **Price dates.** The rate card or price list version behind every `bill_estimate` row, because published prices change (Hetzner's 2026 increases are the recent case) and an estimate priced at an old rate is a wrong estimate.
- **Commitment end dates** beside any move, so the comparison never assumes an exit that a commitment still bills.

## What This Means for the System You Build

- **Price the total, not the bill:** bill, people, observability and security, migration and exit, commitments, depreciation.
- **Count people as a stated fraction** of a fully loaded engineer, and count only the change.
- **Expect the order to change with size:** people dominate small workloads, the bill dominates large ones.
- **Start small teams on managed containers,** move to Kubernetes when a platform team's cost is shared across many services, and to dedicated or owned metal when the bill difference pays for the people difference.
- **Compare against effective rates** from the bill, never list prices, and against commitments' end dates.
- **Read published cases for what they counted,** and vendor studies as marketing.
- **Keep the estimates as effective-dated rows** so the comparison can be rerun, and rerun it when prices or the team change.
- **Then decide on owned metal** with [Repatriation](/books/hosting-and-cloud/repatriation)'s model.

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
- [ECB: Euro foreign exchange reference rates, US dollar](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html), 1.1150 dollars per euro on October 27, 2026

**Statistics**

- [EIA: Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), the August 2026 US average residential price of 18.16 cents per kWh
- [BLS Occupational Outlook Handbook: Network and Computer Systems Administrators](https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm), median annual wage of $99,130 in May 2025
- [BLS: Employer Costs for Employee Compensation](https://www.bls.gov/news.release/ecec.nr0.htm), June 2026, wages and salaries at 70.0% and benefits at 30.0% of private-industry compensation costs

**Filings**

- [Dropbox: Form S-1 (February 2018)](https://www.sec.gov/Archives/edgar/data/0001467623/000119312518055809/d451946ds1.htm), the Infrastructure Optimization components, what cost of revenue and research and development consist of, and equipment financed through leases
- [Amazon: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1018724/000101872425000004/amzn-20241231.htm), server useful lives from five to six years and back to five for a subset

**Provider documentation**

- [GitHub Docs: GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), free self-hosted and public-repository usage, included minutes
- [GitHub: 2026 pricing changes for GitHub Actions](https://github.com/resources/insights/2026-pricing-changes-for-github-actions), the platform charge and its postponement
- [Gitea Docs: Actions overview](https://docs.gitea.com/usage/actions/overview), "similar and mostly compatible to GitHub Actions" and the runner forked from nektos/act
- [Forgejo: Forgejo Actions user guide](https://forgejo.org/docs/latest/user/actions/overview/), familiar to GitHub Actions users but "not designed to be compatible"

**Announcements**

- [37signals: Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0), October 19, 2022, the managed-service spend and the unchanged operations team
- [37signals: We stand to save $7m over five years from our cloud exit](https://world.hey.com/dhh/we-stand-to-save-7m-over-five-years-from-our-cloud-exit-53996caa), February 21, 2023, what the model counted and left out
- [37signals: Our cloud exit has already yielded $1m/year in savings](https://world.hey.com/dhh/our-cloud-exit-has-already-yielded-1m-year-in-savings-db358dea), September 15, 2023, reserved instances, the monthly spend before and after, and the same ops team

**Vendor-commissioned studies**

- [Forrester Consulting: The Total Economic Impact of Google Cloud Consulting](https://tei.forrester.com/go/google/gcc), July 2025, commissioned by Google Cloud Consulting: the ROI, NPV, composite organization and disclosures
- [Network World: Dell rolls out private cloud package](https://www.networkworld.com/article/3993333/dell-rolls-out-private-cloud-package-bolsters-ai-offerings-for-on-prem-progress.html), May 22, 2025, Dell's ESG-based on-premises TCO claim
