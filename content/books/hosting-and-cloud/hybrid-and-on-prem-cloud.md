+++
title = "Hybrid & On-Prem Cloud"
description = "The cloud's control plane in the customer's building: Outposts, Azure Local and Arc, Google Distributed Cloud, Cloud@Customer, Satellite, OpenStack and Oxide."
category = "Hosting & Cloud Industry"
order = 2125
part = "The Stack, Bottom to Top"
tags = ["hybrid-cloud", "on-premises", "private-cloud", "sovereignty", "edge"]
+++

Hybrid cloud, as the providers sell it, is a cloud's control plane reaching into a building the provider doesn't own. The customer has a reason the workload can't sit in a public region: a factory floor that must keep running when the internet link drops, a trading system that needs single-digit milliseconds to an exchange, a regulator that wants data and operators inside a border, or a data center already paid for. The provider's answer is to ship its own hardware into that building and run it as part of a region, to sell its software for the customer's hardware with the provider's portal on top, or to project machines and clusters the customer already runs into the provider's API so they can be inventoried, governed and deployed to like cloud resources. A fourth answer comes from outside the hyperscalers: buy the cloud's hardware model outright and run it yourself.

Each of these moves the line between what the provider operates and what the customer operates, and that line decides everything else: who pays for power and floor space, who fixes a failed server, who holds the keys to the disks, what keeps working when the link to the parent region goes down, and how the thing is priced when the provider can't sell more capacity by the second because the rack in the customer's cage is all there is. This chapter covers the offerings as published in October 2026, how they got here, what the provider and customer each operate, the link back to the region and what fails without it, ordering and pricing, and sovereignty as a driver. It adds `outpost_sites` and regions whose underlay is a customer site to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), building on [facilities](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it) and [hardware assets](/books/hosting-and-cloud/dedicated-servers#how-to-build-it). The decision to leave the cloud for owned hardware altogether is [Repatriation](/books/hosting-and-cloud/repatriation#how-the-numbers-work); the regional footprint these sites hang off is [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells).

## How the Providers Do It

| Offering | Hardware | Who operates it | Link to the provider | Pricing model (as of October 2026) |
| --- | --- | --- | --- | --- |
| **AWS Outposts racks** | AWS-owned 42U racks of servers, switches, patch panel and power shelf; an ACE rack aggregates networking once a site has four or more compute racks | AWS installs, monitors, maintains and upgrades; the customer provides the site, power, network and physical security | A "service link" of encrypted VPN connections to the parent Region; "not designed for disconnected operations" | Configurations on 1, 3 or 5-year terms, all, partial or no upfront; the price covers EC2 and EBS capacity, other services bill hourly |
| **AWS Outposts servers** | AWS-owned 1U (Graviton2, 64 vCPUs) or 2U (Intel, up to 128 vCPUs) servers for a standard 19-inch rack | AWS maintains and patches; the customer installs the server and packs it for return | Service link to the parent Region | Term pricing per server configuration |
| **AWS Dedicated Local Zones** | AWS infrastructure "built for exclusive use by you or your community" and "placed in a location or data center specified by you" | AWS ("fully managed by AWS") | Part of a parent Region, like a Local Zone | Local Zones' pay-as-you-go model |
| **Azure Stack Hub** | Integrated systems of 4 to 16 servers from hardware partners | The customer's own operator runs an administrator portal and sells plans and offers to tenants | Connected or fully disconnected (AD FS identity when disconnected) | Pay-as-you-use or capacity models, announced July 10, 2017 |
| **Azure Local** (formerly Azure Stack HCI) | Customer-owned validated hardware from partner catalogs and bills of materials | The customer, with Azure Arc as the control plane; Microsoft supplies the software | Connected, or "disconnected operations" with a local control plane on a dedicated management cluster | Per physical core per month plus consumed Azure services; a 60-day free trial; Windows Server guest licensing at $23.3 per physical core per month |
| **Azure Arc** | Anything: servers, VMs, Kubernetes clusters and SQL Server outside Azure, on premises or in other clouds | The customer; Arc projects the resources "into Azure Resource Manager" | Resources appear in Azure Resource Manager; indirectly connected mode retired in September 2025 | Control plane functions free; Azure services used on the resources billed as usual |
| **Google Distributed Cloud connected** | "Dedicated hardware certified by Google" installed on premises; the customer is "responsible for procuring, maintaining, troubleshooting and repairing" it | Google remotely maintains the software, including the Kubernetes control plane | Survivability mode: workloads "continue to run for up to 7 days" without the connection | Not published on the pages opened |
| **Google Distributed Cloud air-gapped** | "Google-engineered hardware and software," as racks, ruggedized appliances or a hardware-free sandbox | Inside the customer's "sovereign perimeter" | "Completely disconnected from the public internet and Google Cloud" | Not published on the pages opened |
| **GKE Enterprise / GDC software only** | The customer's bare metal or existing VMware | The customer, with Google's Kubernetes software | Fleet management from Google Cloud | A premium GKE edition |
| **Oracle Compute Cloud@Customer** | An Oracle rack "installed in your data center" | "Fully managed by Oracle": upgrades, patching, incidents and monitoring; the customer sets upgrade windows | A persistent connection to the customer's OCI tenancy; interruptions "are treated as faults" | OCI's consumption model, as announced in 2022 |
| **OCI Dedicated Region** | "A complete cloud region" with "more than 100 OCI public cloud services" in the customer's data center, from as few as 3 racks up to 450 | "Oracle installs, operates, supports, and upgrades the region"; the customer hosts it | Its own region | "Pricing starts at only $500K per month" at launch (July 8, 2020); an entry price reported at about $1 million a year for a typical customer after the July 2022 announcement |
| **IBM Cloud Satellite** | The customer's hosts, in its data center, an edge site or another cloud | IBM runs the location's control plane from an IBM Cloud multizone metro; the customer supplies the hosts, and other software that modifies them can't be installed | Satellite Link; on disconnection "existing location workloads continue to run uninterrupted" but changes and updates are blocked | Estimated per location and cluster; underlying infrastructure isn't in IBM's estimate |
| **Oxide cloud computer** | A rack sold to the customer: up to 32 first-generation or 24 second-generation compute sleds, up to 4,608 cores, 12.8 Tbit/s of switching | The customer, with Oxide's open-source system software included | None required; a web console, API and CLI run on the rack | Bought, with "no separate licensing to manage or pay for" |

Five patterns run through the table. **There are three operating models, not one.** The provider operates its own hardware in the customer's building (Outposts, Dedicated Local Zones, Compute Cloud@Customer, Dedicated Region); the provider ships software and a control plane for hardware the customer owns and runs (Azure Local, Stack Hub, GDC connected, Satellite, GKE Enterprise); or the customer owns and runs everything and the vendor sells the product once (Oxide, and the private-cloud stacks in [The Alternatives](#the-alternatives)). Arc and GKE's fleet features are a fourth thing, a control plane over resources that were never the provider's at all. **Disconnection is the line between products.** The provider-operated racks treat a lost link as a fault; the sovereign products are built to run without one; and the middle ground states a limit, Google's 7 days being the clearest. **Capacity is fixed and sold by the term.** A rack in a customer cage can't borrow from the next hall, so the price is a term commitment for a configuration, not a per-second rate for elastic capacity. **The customer always owns the building.** Power, cooling, floor loading, physical access and the network to the rack are the customer's on every row, and the provider's site survey is a gate before any order ships. **The vocabulary is the cloud's.** Every offering sells the same APIs, portal and identity as the public regions, which is the whole point and the main lock-in.

## How It Got Here

### Private cloud as software (2010 to 2017)

The first answer to "a cloud in my own building" was software. OpenStack's first release, Austin, came out on October 21, 2010, and the project has shipped on roughly six-month cycles since; its 2026.2 release, Hibiscus, came out on September 30, 2026. The other path was VMware's commercial stack on the customer's own hosts (its history is [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps#how-it-got-here)). **What it solved:** a cloud's self-service model on owned hardware, with no provider in the loop. **What it cost:** the customer ran the cloud: upgrades, storage, networking, capacity and the control plane, with none of the public cloud's services and none of its APIs.

### The cloud's software in a box (2017)

Microsoft made the first hyperscaler offer to put its own cloud's software in a customer building. "Microsoft Azure Stack is ready to order now" (July 10, 2017) opened orders for integrated systems from Dell EMC, HPE and Lenovo, with Cisco and Huawei to follow, first shipments in September, availability in 46 countries, and pricing for pay-as-you-use and capacity-based models. Azure Stack Hub, as it's now called, is a scale unit of 4 to 16 servers built by a hardware partner, managed through separate instances of Azure Resource Manager, and able to run fully disconnected. **What it solved:** Azure's APIs, portal and IaaS services on premises, including where no network reached. **What it cost:** a subset of Azure's services, partner hardware the customer bought and housed, and an operator team inside the customer's organization running what amounted to a small Azure region.

### The provider's hardware on the customer's floor (2018 to 2022)

AWS announced Outposts on November 28, 2018 ("native AWS services, infrastructure, and operating models to virtually any data center") and made it generally available on December 3, 2019 as AWS-run racks in the customer's data center. Jeff Barr's launch post gave the shape that every later product copied: a rack 80 inches tall, 24 wide and 48 deep weighing up to 2,000 pounds, installed by AWS technicians, "connected to and controlled by a specific AWS Region," with up to 16 racks at one location as a single capacity pool; EC2, EBS, VPC, ECS, EKS and EMR at launch with RDS in preview; a three-year term, with all, partial or no upfront payment covering EC2 and EBS, and AWS Enterprise Support required. The same day AWS opened its first Local Zone in Los Angeles, "a logical part of the US West (Oregon) Region" built for single-digit-millisecond latency, which is the same idea placed in an AWS-run metro building instead of the customer's. Outposts came down to 1U and 2U servers on November 30, 2021.

Oracle took the idea to a whole region: by July 2022 it was announcing a Dedicated Region needing 60 to 75% less space and power than before, with an entry price around $1 million a year for a typical customer, alongside a smaller rack-scale Compute Cloud@Customer, as reported at the time. **What it solved:** the public cloud's services and operations, with the provider fixing the hardware, inside the customer's walls. **What it cost:** a term commitment for fixed capacity, a dependency on the link to the parent region, and a site the customer must make fit the provider's rack.

### One control plane over anything (2019 to 2023)

The other direction was to leave the hardware alone and extend the control plane. Google announced Anthos, renamed from Cloud Services Platform, at Next on April 9, 2019, running on GKE and GKE On-Prem with AWS and Azure "coming soon." Microsoft previewed Azure Arc on November 4, 2019, to manage servers and Kubernetes clusters anywhere from Azure ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#node-less-modes-hybrid-nodes-and-arc) covers Arc and hybrid nodes for clusters). IBM Cloud Satellite reached general availability on March 1, 2021, running IBM Cloud services on hosts the customer supplies in "locations" managed from an IBM Cloud region. On August 29, 2023 Google folded Anthos into [GKE Enterprise](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#how-the-providers-do-it), "bringing together the best of GKE and Anthos," with on-premises support through Google Distributed Cloud. **What it solved:** one inventory, policy, identity and deployment path across the customer's data centers, edge sites and other clouds. **What it cost:** the provider's control plane became a dependency for resources it didn't run, and the per-core or per-resource fees for the managed services layered on top.

### Sovereign, disconnected and bought (2023 to 2026)

The newest products answer a regulator or a balance sheet rather than latency. AWS announced Dedicated Local Zones on August 23, 2023: infrastructure "fully managed by AWS," "built for exclusive use by you or your community" and "placed in a location or data center specified by you." Oxide announced general availability of its rack-scale "cloud computer" for sale, not rent, on October 26, 2023, alongside a $44 million Series A, arguing that the computers running the cloud should be purchasable. Broadcom completed its acquisition of VMware on November 22, 2023 and on December 11, 2023 ended the sale of perpetual licenses and of support renewals for them, "beginning today (effective dates will vary)" ([Licensing Disputes](/books/hosting-and-cloud/licensing-disputes#broadcom-and-vmware)). At Ignite in November 2024 Microsoft introduced Azure Local as "replacing the Azure Stack product family," with existing Azure Stack HCI customers upgraded automatically. On October 31, 2025 Broadcom told cloud partners it was ending its VMware Cloud Service Provider program and, in the EEA, the white-label model, with no renewals after January 26, 2026, as reported, citing the goal to "enable increased adoption of VMware Cloud Foundation as the core private cloud platform." **What it solved:** clouds that run inside a border, without the provider's network, or without the provider at all. **What it cost:** fewer services than the public regions, higher minimum footprints for the disconnected variants, and for VMware estates a price set by a new owner.

## Who Operates What

The responsibilities split along the same lines in every product, and the contract is where the customer finds out which side of each line it's on. Reading across the providers' documentation:

| Responsibility | Provider-operated rack (Outposts, Compute Cloud@Customer) | Provider software, customer hardware (Azure Local, Stack Hub, GDC connected, Satellite) | Bought rack (Oxide) |
| --- | --- | --- | --- |
| Building, power, cooling, floor loading | Customer | Customer | Customer |
| Physical security and access to the rack | Customer ("customers own the responsibility for physical security and access controls around the Outpost") | Customer | Customer |
| Network to the rack, addressing, BGP | Customer, to the provider's specification | Customer | Customer |
| Hardware ownership | Provider | Customer | Customer |
| Hardware repair and replacement | Provider (AWS replaces modules; it doesn't service hosts or switches on site) | Customer or its systems integrator (Google: "procuring, maintaining, troubleshooting and repairing") | Customer, with vendor support |
| Platform software, patching, upgrades | Provider, in a window the customer can schedule (Oracle) | Provider ships it; who applies it varies (Google maintains GDC connected software remotely, including the Kubernetes control plane) | Vendor ships it, customer applies it |
| Control plane | The parent region | Parent cloud, or a local one when disconnected | On the rack |
| Monitoring and incident response | Provider | Shared | Customer |
| Data destruction at return | Provider (Outposts removes the Nitro Security Key so content is "crypto shredded") | Customer | Customer |

The provider-operated column has a consequence the others don't: the provider's staff need a way into the customer's building. Outposts installation is an appointment with the customer's data center team; Oracle has the customer manage Oracle's own access to Compute Cloud@Customer through Operator Access Control. For the provider, every one of these sites is a facility it doesn't own and can't enter at will, with the same remote-hands problem as [colocation](/books/hosting-and-cloud/data-centers-and-colocation#remote-hands) but without a colocation contract behind it.

## The Link to the Parent Region

A provider-operated site is an extension of a region over a WAN, and the WAN is the product's weakest part.

**What the link carries.** On Outposts, the service link "leverages an encrypted set of VPN connections" to the Region and carries both customer VPC traffic between the Outpost and the Region and management traffic: resource management, monitoring, and firmware and software updates. Establishment "is always initiated from the Outpost." Oracle describes Compute Cloud@Customer as connected "over an uninterruptible network" with IAM resources "regularly and securely cached" on the rack. Satellite Link is "the primary gateway to IBM Cloud."

**What the link needs.** AWS requires redundant connectivity of "at least 500 Mbps for each compute rack and a maximum of 175 ms round trip latency," a 1,500-byte MTU to the service link endpoints (instance traffic to the Region gets 1,300 bytes after overhead), a /26 per Outpost advertised as two /27s, and BGP from the customer's routers to each Outpost network device. Satellite tells the customer to pick the managing region "closest to your compute hosts to minimize round-trip latency." These figures make site selection a network question first: a remote site on a single circuit doesn't meet them.

**What fails without it.** The providers are explicit, and their answers differ:

| Offering | Keeps working when disconnected | Stops |
| --- | --- | --- |
| Outposts racks | Running instances and volumes | Control-plane operations; the racks "are not designed for disconnected operations" |
| Oracle Compute Cloud@Customer | Access to and lifecycle of cloud resources on the system, OCPU scaling, direct instance management with OS tools | IAM lifecycle operations, infrastructure management, Oracle monitoring including security monitoring, Oracle's operations access |
| IBM Cloud Satellite | "Existing location workloads continue to run uninterrupted" | Configuration changes and update rollouts |
| Google Distributed Cloud connected | Workloads for up to 7 days, with local image caching so crashed workloads restart; offline credentials for local access | gcloud, kubectl and the Edge Container API management path, software updates, SLOs and hardware repair; a rebooted node can't rejoin until reconnection unless an offline reboot window is configured |
| Azure Local with disconnected operations, Azure Stack Hub disconnected, GDC air-gapped, Oxide | Everything the local control plane offers | Nothing by design; the services offered are the subset that runs locally |

Two lessons follow for a provider building this. First, the data plane and the control plane have to be separable at the site, the same split [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells) draws inside a region: a site that stops serving traffic when it can't reach the region is worse than no site. Second, the limit has to be stated, like Google's 7 days, because the customer's continuity plan depends on it, and the playbook's [disaster recovery strategies](/docs/operations/disaster-recovery#strategies) need a number to plan against.

## Ordering, Capacity and Pricing

**Ordering is a site review.** Outposts orders start with a site: the address, environmental conditions (temperature, humidity, airflow), loading dock capacity, a clear path to the rack position, then power and network configuration, before choosing a configuration (18 standard ones at launch, or a custom one) and submitting; AWS reviews it, may call, ships, and installs with the customer's operations team. After the order, AWS collects VLAN, IP, BGP and infrastructure subnet details, and the service link configuration can't be changed once the order is complete. AWS's current FAQ gives the power envelope: 10 to 30 kVA for a compute rack and 8.89 kVA for a network rack, with 10, 40 or 100 Gbps uplinks. Oxide's launch post described its rack as drawing about 15 kW. These are cabinet densities the [colocation chapter's power section](/books/hosting-and-cloud/data-centers-and-colocation#power) treats as ordinary-to-high, and many enterprise server rooms can't deliver them without work.

**Capacity is a configuration, not a pool.** The rack holds what was ordered. AWS lets the customer reconfigure an Outpost's capacity across instance types ("self-service capacity management") and add racks from the catalog, but a single-rack Outpost "can't scale out by adding racks": growth beyond it is a new subscription or a multi-rack deployment, and four or more compute racks require an ACE networking rack. The minimum single-rack configuration is 576 vCPUs and 20 TB of EBS on three- and five-year terms. Oxide's sled counts and Azure Stack Hub's 4-to-16-server scale units are the same constraint stated as hardware: elasticity ends at the rack, so the customer plans capacity the way a data center owner does, and bursts to the public region.

**Pricing follows who owns the hardware.**

- **Provider hardware, term commitment.** Outposts racks are priced per configuration for a term, with all, partial or no upfront payment; the price includes delivery, installation, maintenance, patches and upgrades, and rack removal. At the end of a term the customer renews or returns the racks, and without notice they renew monthly at the no-upfront rate. The customer is also billed "for shared resources and any data transfer from the AWS Region to the Outpost," including transfers AWS performs to maintain availability and security. Outposts servers exclude installation, which is the customer's.
- **Provider software, per-core subscription.** Azure Local charges a host fee per physical core per month plus the Azure services consumed, rolled into the customer's Azure subscription; its pricing page lists tiers L1 (hyperconverged), L2 (multi-rack or external storage) and L3 (disconnected operations, priced by an account representative), a 60-day free trial, Windows Server guest licensing at $23.3 per physical core per month, an Azure Hybrid Benefit that waives both fees for Datacenter licenses with Software Assurance, and AKS at no extra charge from the 2402 release on. Per-core pricing makes the customer's hardware choice a licensing decision: more cores per server raises the software bill whether or not they're used.
- **Control plane over foreign resources, priced by what runs on it.** Arc's inventory, tagging, Resource Graph, RBAC and templates are free for Arc-enabled servers, and VM lifecycle on vCenter and SCVMM through Arc is free; Defender, Monitor and the other services used on those resources bill at their normal rates. Satellite's console estimates cost per location and cluster, and IBM notes that some charges, such as underlying infrastructure, aren't in the estimate.
- **Bought hardware.** Oxide sells the rack with all system software included and "no separate licensing," so the cost is capital plus support, and the economics are [Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning)'s.

Disconnected variants cost more to start: Microsoft's disconnected operations require an eligible enterprise agreement (not the online subscription program), a Standard or higher support plan, a stated business need, staff or a partner to operate it, Premier Solutions hardware and a dedicated management cluster to host the local control plane, with approval decided within 10 business days of the qualification form.

## Sovereignty as a Driver

Most new hybrid products since 2023 are sold on sovereignty: who can access the hardware, which country's law reaches the operator, and whether the provider can be compelled to act on a workload. The product answers, as published:

- **AWS European Sovereign Cloud** became generally available on January 14, 2026 (Amazon's press release followed on January 15), with its first region in Brandenburg, Germany, under a new parent company with three German GmbH subsidiaries led by EU citizens, "operated exclusively by EU residents," with planned investment of more than €7.8 billion and sovereign Local Zones planned in Belgium, the Netherlands and Portugal. Dedicated Local Zones are the on-premises version of the same pitch.
- **Microsoft** announced on June 16, 2025 a Sovereign Public Cloud across its European regions, a Sovereign Private Cloud on Azure Local (in preview), and national partner clouds (Bleu in France, Delos Cloud in Germany), with external key management among the controls. Azure Local's disconnected operations are documented as for "sovereign requirements and compliance" where "data, operations, and control remain within your organization's boundaries."
- **Google** described its Sovereign Cloud portfolio on February 6, 2026 as Data Boundary, Dedicated (partner-operated, such as S3NS in France, where the partner can block Google updates and run up to 12 months disconnected) and Air-Gapped, where "Google cannot remotely access or shut down customer workloads."
- **Azure Stack Hub** states the property directly: deployed disconnected, "no data that is stored on the appliance is sent to Microsoft," and the customer owns and controls the appliance and its data.

The pattern is a ladder of the same three levers: where the hardware is, who operates it, and whether the provider's control plane can reach it. Data residency law itself, the certification schemes and what a regulator accepts belong to the later chapter [Shared Responsibility & Compliance Programs](/books/hosting-and-cloud/compliance-programs); what matters here is that each rung costs services. The further down the ladder, the smaller the catalog: disconnected Azure Local lists a portal, Resource Manager, RBAC, managed identity, Arc-enabled servers, VMs, AKS, Container Registry, Key Vault and Policy, a small fraction of a public region.

## The Alternatives

| Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Provider-operated rack** (Outposts, Compute Cloud@Customer, Dedicated Local Zones) | The cloud's APIs and services locally; the provider fixes hardware and patches | Not designed to run disconnected; fixed capacity; the provider's staff need site access | Provider owns hardware; term subscription | Term commitment per configuration, plus region transfer | Low-latency and data-local workloads already on that cloud |
| **Full dedicated region** (OCI Dedicated Region) | More than 100 of the public cloud's services on site | Large minimum footprint and spend | The provider's cloud in the customer's building | Reported at about $1 million a year at entry (2022) | Governments, regulated large enterprises |
| **Provider software on customer hardware** (Azure Local, Stack Hub, GDC connected, Satellite) | Uses validated hardware the customer chooses; can run connected or disconnected | Customer repairs hardware; per-core fees scale with hardware; disconnected variants have a short catalog | Customer owns hardware; subscription to software | Per physical core or per location, plus services | Retail, manufacturing, edge fleets, Microsoft and Google estates |
| **Control plane over existing resources** (Arc, GKE Enterprise fleets) | No new hardware; one inventory and policy across clouds | Governs but doesn't run anything; a dependency on the provider's control plane | Nothing changes hands | Free projection; paid services on top | Multicloud and acquired estates |
| **VMware Cloud Foundation** | The incumbent enterprise private cloud; skills and tooling everywhere | Price and partner terms set by Broadcom since 2023; perpetual licenses ended | Subscription only since December 2023 | Per-core subscription | Existing vSphere estates |
| **Nutanix** | Its own cloud platform software on customer hardware, and the same software on cloud bare metal (NC2 on AWS, Azure, Google Cloud and OVHcloud) with portable licenses | Migration takes time; one vendor's stack | Software subscription; customer owns hardware | Subscription | VMware leavers: Nutanix reported 29,290 customers and over 2,700 new ones in fiscal 2025, with the CEO counting about 200,000 VMware customers yet to move |
| **OpenStack** | Open source, no license fee, every layer replaceable; releases every six months | The customer operates every service; upgrade and integration work is the cost | Open source | Staff, hardware and optional vendor support | Telecoms, research clouds, providers building their own clouds |
| **Bought rack-scale computer** (Oxide) | Hardware and software designed together; no license; API and console from day one | One vendor's hardware; the customer runs everything | Customer owns | Capital plus support | Organizations that want cloud ergonomics on owned hardware |
| **Public region plus a fast interconnect** | Full catalog and elasticity, nothing on site | Latency floor of the distance; no residency inside the customer's building | Rented | Usage plus interconnect | Most workloads that think they need hybrid |

## My Default

My default is the last row: a public region in the right metro with a dedicated interconnect, because every product above trades away elasticity, services and often money for latency, locality or control, and most workloads that ask for hybrid need a closer region rather than a rack in the building. When the workload truly can't leave the site, I'd pick by what has to happen when the link fails. If the site can tolerate losing the control plane for a while and the workload already lives on one cloud, a provider-operated rack from that cloud is the least operational work, and I'd buy the smallest term that fits, because fixed capacity bought for five years is a forecast I'd rather not make. If the site must keep operating indefinitely without the link, I want a product built for disconnection, documented service by service, and I'd plan for its catalog to be what runs, not the public region's. If the goal is owning the cost curve rather than renting it, I'd look at a bought rack or OpenStack on owned hardware and treat it as the repatriation decision it is.

For a provider building a hybrid product of its own, my default is to keep the data plane on site fully independent of the link, publish the disconnection limit as a number, and price fixed capacity by the term with a stated renewal rate, which is what every row in the survey converges on. What would change it: a regulator that names the operator rather than the location (then only a partner-operated or air-gapped model qualifies), or a fleet of hundreds of small sites, where the per-site minimums of rack products don't fit and a control plane over customer hardware does.

## How to Build It

The chapter adds a customer-site operator to [facilities](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it), regions whose underlay is a customer site, and `outpost_sites` for provider-operated capacity in a customer facility, run as part of a parent region, to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Hardware the provider owns at those sites is ordinary [hardware assets](/books/hosting-and-cloud/dedicated-servers#how-to-build-it) whose facility is the customer's.

```sql
-- facilities.operator gains 'customer': a building the customer owns or leases where the
-- provider places, or only manages, equipment
-- resources.kind gains 'outpost_site'

-- A dedicated region is a regions row whose underlay is the customer's building, with its
-- facilities pointing at it (facilities.region_id):
--   regions (id 'acme-fra-dr1', underlay 'customer_site:acme-fra-1', country 'DE')

CREATE TABLE outpost_sites (             -- side table: kind = 'outpost_site'; resources.region_id
                                         -- is the parent region, account_id the ordering customer
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  facility_id        UUID NOT NULL REFERENCES facilities (id),  -- operator = 'customer'
  site_zone_id       TEXT NOT NULL UNIQUE REFERENCES zones (id), -- the site's own zone in the parent
                                         -- region, so placement and status work unchanged
  anchor_zone_id     TEXT NOT NULL REFERENCES zones (id),       -- the zone whose control plane it extends
  form_factor        TEXT NOT NULL CHECK (form_factor IN ('rack', 'multi_rack', 'server',
                       'appliance')),
  operating_model    TEXT NOT NULL CHECK (operating_model IN ('provider_hardware',
                       'customer_hardware')),           -- who owns and repairs the machines
  connectivity_mode  TEXT NOT NULL CHECK (connectivity_mode IN ('connected', 'survivable',
                       'disconnected')),
  max_disconnected   INTERVAL,            -- the published limit; null: none stated or none needed
  link_min_mbps      INTEGER,             -- the site's contracted requirement, per rack
  link_max_rtt_ms    INTEGER,
  site_survey_ref    TEXT NOT NULL,       -- power, cooling, floor loading, access path, accepted
  operator_access    TEXT NOT NULL CHECK (operator_access IN ('customer_approved',
                       'cleared_personnel', 'none')),  -- how the provider's staff get in
  term_ends_at       TIMESTAMPTZ,         -- from the subscription; null for customer hardware
  end_of_term        TEXT CHECK (end_of_term IN ('renew', 'return', 'monthly_rollover')),
  state              TEXT NOT NULL CHECK (state IN ('site_review', 'ordered', 'shipping',
                       'installing', 'active', 'returning', 'returned', 'cancelled')),
  CHECK (connectivity_mode <> 'survivable' OR max_disconnected IS NOT NULL)  -- a stated limit
);

CREATE TABLE outpost_capacity (          -- what the site is configured to offer, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  outpost_site_id UUID NOT NULL REFERENCES outpost_sites (resource_id),
  slot_kind       TEXT NOT NULL,          -- an instance type, or a storage class
  slots           INTEGER NOT NULL CHECK (slots >= 0),
  valid_during    TSTZRANGE NOT NULL,     -- a reconfiguration closes one row and opens another
  EXCLUDE USING GIST (outpost_site_id WITH =, slot_kind WITH =, valid_during WITH &&)
);

CREATE TABLE outpost_link_events (       -- the link's state as observed, append-only
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  outpost_site_id UUID NOT NULL REFERENCES outpost_sites (resource_id),
  link_state      TEXT NOT NULL CHECK (link_state IN ('up', 'degraded', 'down')),
  observed_during TSTZRANGE NOT NULL,
  rtt_ms          INTEGER,
  cause           TEXT,                   -- 'customer_circuit', 'provider_endpoint', 'unknown'
  EXCLUDE USING GIST (outpost_site_id WITH =, observed_during WITH &&)
);

-- Sites running on a link outage longer than their published limit, for support and SLA:
SELECT o.resource_id, f.code AS facility, e.observed_during, o.max_disconnected
FROM outpost_link_events e
JOIN outpost_sites o ON o.resource_id = e.outpost_site_id
JOIN facilities f    ON f.id = o.facility_id
WHERE e.link_state = 'down'
  AND o.max_disconnected IS NOT NULL
  AND COALESCE(upper(e.observed_during), NOW()) - lower(e.observed_during) > o.max_disconnected;
```

Notes on the sketch:

- **The site is a resource the customer holds and a zone the provider schedules into.** The `outpost_site` resource carries the account, the subscription for the term and any holds; its `site_zone_id` is an ordinary zone in the parent region, so virtual machines and volumes placed there are ordinary resources with that zone, and the scheduler's placement records from [Schedulers](/books/hosting-and-cloud/schedulers#how-to-build-it) check `outpost_capacity` instead of a regional pool. In the terms of [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells), the site's zone is a `single_site` zone mapped to the customer facility in `zone_facilities`; the zone whose control plane it extends is `anchor_zone_id` here, not a local zone's parent, because the site isn't the provider's building.
- **The underlay tells the truth.** A dedicated region's `regions.underlay` names the customer's facility, the same field [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#how-to-build-it) uses for a PaaS on a hyperscaler, so a status page, an incident notice and a residency answer can say the region runs in the customer's building.
- **Hardware the provider owns is an asset in someone else's building.** `hardware_assets.facility_id` points at the customer facility; `customer_hardware` sites have no provider assets at all, which is how the model tells an Outposts-style rack from an Azure Local-style instance. Returning a rack at the end of a term is a [reimage job](/books/hosting-and-cloud/dedicated-servers#reimaging-and-sanitization) with `trigger = 'release'` and `sanitize_method = 'crypto_erase'`, matching the key-removal practice the providers describe, followed by the asset's move to `decommissioning` and its shipment out.
- **Term capacity is a subscription, usage is still usage.** The site's configuration is a plan version with a 12, 36 or 60-month term and the capacity in `included`; instance seconds on the site are still `usage_events`, rated to zero against the allowance, so the customer's cost reports and the provider's utilization reports see the same data as in a region. Region-to-site transfer is metered (`egress.bytes` with a `direction` dimension), because the providers bill it.
- **The link is a fact with history.** `outpost_link_events` makes the disconnection limit enforceable: support knows when a site passes its published window, [SLA claims](/books/hosting-and-cloud/slas-and-service-credits#exclusions-and-sole-remedy) exclude periods when the customer's circuit was down, and capacity planning sees how often the site ran alone.
- **Events:** `outpost_site.surveyed`, `outpost_site.installed`, `outpost_site.capacity_changed`, `outpost_link.down`, `outpost_link.restored`, `outpost_site.disconnect_limit_exceeded`, `outpost_site.term_ending` and `outpost_site.returned` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to field operations, support, billing and the customer's notifications.

## Auditing

- **Who entered the site and touched the hardware.** Every provider visit, module replacement and operator access approval, with the customer's approval where the product requires one, because the building and its access log are the customer's ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **The link's history.** Outages with cause and duration, kept as long as SLA claims and the customer's own continuity reviews can reach back.
- **Capacity and term changes.** Each reconfiguration and each renewal or return decision, with notice dates, because a monthly rollover at a different rate is a billing dispute waiting to happen.
- **Data destruction at return.** The key removal or erasure per asset and the job that recorded it, before the hardware leaves the customer's building.
- **Where the control plane ran.** For disconnected and sovereign deployments, the record that management stayed local, which is the claim the customer's regulator will test.

## What This Means for the System You Build

- **Pick the operating model first:** provider hardware, provider software on customer hardware, a control plane over foreign resources, or a bought rack; everything else follows from it.
- **Keep the site's data plane independent of the link,** and publish how long the site runs without it.
- **Treat the customer's building as a facility you don't control,** with a site survey before the order and an access process for every visit.
- **Sell fixed capacity by the term,** with the renewal and return terms stated up front, and meter usage anyway.
- **Record the underlay of every region,** including when it's the customer's own building.
- **Destroy data before the hardware leaves,** and keep the record.
- **Count the catalog you lose** at each step toward sovereignty or disconnection before you promise the public region's services.

## References

**Provider documentation**

- [AWS: What is AWS Outposts?](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html), racks, ACE racks, servers, the service link, local gateway, supported resources and what pricing includes
- [AWS: Connectivity through service link](https://docs.aws.amazon.com/outposts/latest/userguide/service-links.html), encrypted VPN connections, traffic carried, MTU, 500 Mbps and 175 ms requirements and setup steps
- [AWS: Outposts rack FAQs](https://aws.amazon.com/outposts/rack/faqs/), power, terms, end-of-term options, single-rack limits, module replacement, crypto shredding and disconnection
- [AWS: Local Zones](https://aws.amazon.com/about-aws/global-infrastructure/localzones/), Local Zones as extensions of core services in more metros
- [Microsoft Learn: What is Azure Local?](https://learn.microsoft.com/en-us/azure/azure-local/overview), customer-owned hardware, Arc as control plane, connected or disconnected, per-core pricing
- [Microsoft Learn: Disconnected operations for Azure Local](https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-overview), the local control plane, supported services and eligibility criteria
- [Microsoft Azure: Azure Local pricing](https://azure.microsoft.com/en-us/pricing/details/azure-local/), host fee tiers, the 60-day trial, Windows Server guest pricing, Azure Hybrid Benefit and AKS, as of October 2026
- [Microsoft Learn: Azure Stack Hub overview](https://learn.microsoft.com/en-us/azure-stack/operator/azure-stack-overview), 4 to 16 server scale units, connected and disconnected models, operators and data residency
- [Microsoft Learn: Azure Arc overview](https://learn.microsoft.com/en-us/azure/azure-arc/overview), resource types, free control plane functions and the retirement of indirectly connected mode
- [Google Cloud: Google Distributed Cloud documentation](https://docs.cloud.google.com/distributed-cloud/docs), air-gapped, connected and software-only offerings
- [Google Cloud: Overview of connected deployments of Google Distributed Cloud](https://docs.cloud.google.com/distributed-cloud/edge/latest/docs/overview), customer-procured certified hardware and remote software maintenance
- [Google Cloud: Survivability mode](https://docs.cloud.google.com/distributed-cloud/edge/latest/docs/survivability), up to 7 days disconnected and what stops
- [Oracle: Overview of Compute Cloud@Customer](https://docs.oracle.com/en-us/iaas/compute-cloud-at-customer/ccc/overview-of-compute-cloud-at-customer.htm), Oracle-managed racks, the persistent connection, the disconnected state and Operator Access Control
- [IBM Cloud: Satellite FAQs](https://cloud.ibm.com/docs/satellite?topic=satellite-faqs), locations, customer hosts, the control plane and behavior on disconnection
- [Nutanix: NC2](https://www.nutanix.com/products/nutanix-cloud-clusters), Nutanix on cloud bare metal and portable licenses
- [OpenStack: Releases](https://releases.openstack.org/), Austin on October 21, 2010, the six-month cycle and 2026.2 Hibiscus
- [Oxide: Specifications](https://oxide.computer/product/specifications), sleds, cores and switching capacity

**Announcements and release notes**

- [Microsoft Azure: Microsoft Azure Stack is ready to order now](https://azure.microsoft.com/en-us/blog/microsoft-azure-stack-is-ready-to-order-now/), July 10, 2017, partners, shipping, 46 countries and pricing models
- [AWS: Announcing AWS Outposts](https://aws.amazon.com/about-aws/whats-new/2018/11/announcing-aws-outposts/), November 28, 2018
- [AWS: General availability of AWS Outposts](https://aws.amazon.com/about-aws/whats-new/2019/12/announcing-general-availability-of-aws-outposts/), December 3, 2019
- [AWS News Blog: AWS Outposts now available](https://aws.amazon.com/blogs/aws/aws-outposts-now-available-order-your-racks-today/), December 3, 2019, rack size and weight, ordering, launch services and the three-year term
- [AWS News Blog: AWS now available from a Local Zone in Los Angeles](https://aws.amazon.com/blogs/aws/aws-now-available-from-a-local-zone-in-los-angeles/), December 3, 2019
- [AWS: Outposts in two smaller form factors](https://aws.amazon.com/about-aws/whats-new/2021/11/aws-outposts-form-factors/), November 30, 2021, the 1U and 2U servers
- [AWS: Announcing AWS Dedicated Local Zones](https://aws.amazon.com/about-aws/whats-new/2023/08/aws-dedicated-local-zones), August 23, 2023
- [Google Cloud: Next '19 day 1 recap](https://cloud.google.com/blog/topics/inside-google-cloud/next19-recap-day1), Anthos, April 9, 2019
- [Microsoft Azure: Announcing Azure Arc](https://azure.microsoft.com/en-us/blog/azure-services-now-run-anywhere-with-new-hybrid-capabilities-announcing-azure-arc/), November 4, 2019
- [IEEE ComSoc Technology Blog: IBM's Cloud Satellite service in generally available orbit](https://techblog.comsoc.org/2021/03/01/ibms-cloud-satellite-service-in-generally-available-orbit/), March 1, 2021
- [Google Cloud: Introducing the next evolution of container platforms](https://cloud.google.com/blog/products/containers-kubernetes/whats-new-with-gke-at-google-cloud-next), August 29, 2023, GKE Enterprise and Anthos
- [Oxide: The cloud computer](https://oxide.computer/blog/the-cloud-computer), general availability on October 26, 2023, the Series A, included software and power draw
- [VMware by Broadcom: Business transformation (Wayback copy)](http://web.archive.org/web/20231216021905/https://news.vmware.com/company/vmware-by-broadcom-business-transformation), December 11, 2023, the end of perpetual licenses and SnS renewals
- [Broadcom: Form 8-K exhibit 99.1 (November 2023)](https://www.sec.gov/Archives/edgar/data/1730168/000114036123054354/ef20015100_ex99-1.htm), completion of the VMware acquisition on November 22, 2023
- [Microsoft: Ignite 2024 Book of News](https://news.microsoft.com/ignite-2024-book-of-news/), Azure Local replacing the Azure Stack product family
- [Microsoft: Announcing comprehensive sovereign solutions](https://blogs.microsoft.com/blog/2025/06/16/announcing-comprehensive-sovereign-solutions-empowering-european-organizations/), June 16, 2025
- [Amazon: AWS launches AWS European Sovereign Cloud](https://press.aboutamazon.com/aws/2026/1/aws-launches-aws-european-sovereign-cloud-and-announces-expansion-across-europe), January 15, 2026
- [Google Cloud: Delivering a secure, open, sovereign digital world](https://cloud.google.com/blog/products/identity-security/delivering-a-secure-open-sovereign-digital-world), February 6, 2026, Data Boundary, Dedicated and Air-Gapped

**In practice**

- [Oracle: OCI Dedicated Region](https://www.oracle.com/cloud/cloud-at-customer/dedicated-region/), Oracle installs, operates, supports and upgrades the region, 3 to 450 racks
- [Oracle: Dedicated Region Cloud@Customer launch](https://www.oracle.com/corporate/pressrelease/oracle-dedicated-region-cloud-at-customer-070820.html), July 8, 2020, "fully-managed cloud region," pricing from $500K per month
- [DBTA: Oracle Cloud Infrastructure introduces OCI Dedicated Regions to more customers](https://www.dbta.com/Editorial/News-Flashes/Oracle-Cloud-Infrastructure-Introduces-OCI-Dedicated-Regions-to-Bring-the-Full-Public-Cloud-to-More-Customers-153754.aspx), July 6, 2022, the smaller footprint, the reported entry price and Compute Cloud@Customer
- [The Register: Broadcom culls VMware cloud partners](https://www.theregister.com/2026/01/31/broadcom_vmware_cloud_partners/), January 31, 2026, the VCSP and white-label phase-out and the January 26, 2026 renewal cutoff
- [Blocks & Files: Nutanix's fourth fiscal 2025 quarter](https://blocksandfiles.com/2025/08/28/nutanix-nails-its-fourth-fy2025-quarter/), August 28, 2025, customer counts and VMware migration comments
</content>
</invoke>
