+++
title = "The Homelab"
description = "Why people run infrastructure at home, the community, enterprise servers vs mini PCs vs NAS boxes, power in watts and dollars, noise, racks and UPS."
category = "Hosting & Cloud Industry"
order = 2146
part = "Homelab"
tags = ["homelab", "self-hosting", "mini-pc", "out-of-band-management", "power", "ups"]
+++

A homelab is a hosting provider with one customer, run by that customer. It has servers, storage, a network with an edge, an inventory, a power budget and an uptime problem, the same layers a provider sells, scaled down to a closet, a shelf or a short rack. Nothing about the engineering is toy: the hypervisors, filesystems, routers and orchestrators are the ones providers run. What changes is the economics. The hardware is bought once, the electricity arrives on a household bill, the operator's time is free and unbilled, and nobody files a ticket when a service is down except the person who will fix it.

That makes the homelab the natural start of this book's scaling story. Everything that follows (the data center and colocation, dedicated servers, data center networking, virtualization, containers, schedulers, storage, regions and cells, then Kubernetes, managed services, deploys, CI/CD and infrastructure as code) is a layer a homelab operator has already touched by hand, built for many customers instead of one. This chapter covers why people run infrastructure at home, the communities and lists around it, how the hardware got from a closet server to used enterprise racks to clusters of mini PCs, the hardware classes compared, power draw and its cost in dollars, noise, racks and the UPS, and how the book's core data model still applies when the operator and the customer are the same person. It adds no tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The rest of the Homelab part takes each layer in turn; the map is in [How This Part Reads](#how-this-part-reads).

## How the Vendors Do It

Nobody sells "a homelab". Four kinds of hardware end up in one, each sold for some other buyer, and the vendors' own spec sheets are what to compare:

| Class | Who it was built for | What the vendor publishes | Examples | Management |
| --- | --- | --- | --- | --- |
| **Used enterprise rack servers** | Data centers, until their refresh | SPECpower results, spec sheets, rack depth | Dell PowerEdge R730, HPE ProLiant DL380 Gen9 era | A BMC on its own port: Dell iDRAC, HPE iLO, IPMI |
| **Mini PCs and 1-liter business desktops** | Offices, signage, edge appliances | CPU spec (TDP, memory channels), ports | Intel N100 boxes, the NUC line now under ASUS, HP Elite Mini, Lenovo Tiny, Dell Micro | None on consumer boxes; Intel AMT KVM on vPro-branded business models |
| **NAS appliances** | Small offices and homes that want storage without an operating system to run | Power in access and hibernation, noise in dB(A), drive bays | Synology, QNAP, TerraMaster, UGREEN | The vendor's web UI |
| **DIY towers** | Whoever assembles them | Component specs only | Consumer CPUs with an iGPU, an HBA for more drives | IPMI only on server-class boards |

The pattern: each class is a different trade between power, noise, expandability and management. Enterprise gear gives the most of everything except quiet and low watts; mini PCs give the fewest watts and almost nothing else; the NAS appliance trades flexibility for not having to administer it; the tower is the middle ground built to order.

## Why Run Infrastructure at Home

People state four motives, and most labs run on a mix of them. I found no rigorous survey that ranks them, so they are motives here, not shares.

- **Learning on real hardware.** A hypervisor cluster, a VLAN plan, a ZFS pool or a Kubernetes control plane teaches more when it can be broken without a bill or a change ticket. Free tiers of hypervisors and community repositories decide which tools a generation learns, which is why their licensing changes get attention far beyond the home ([Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home)).
- **Self-hosting services otherwise rented.** Photos, media, passwords, files and home automation, run on owned hardware instead of a SaaS subscription ([Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps)).
- **Privacy and control.** Data that never leaves the house is not subject to a provider's terms, retention, pricing changes or shutdown. The price is that the owner becomes the security team and the only backup operator.
- **Repatriation in miniature.** A homelab swaps metered rent for a fixed cost: hardware bought once, electricity, and the owner's hours. It is the same calculation providers' customers make at scale when they move workloads out of the cloud, with the same traps (pricing the rented side at list, forgetting that the owned side's labor is real), which [Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) works through at company scale.

## The Community

Two Reddit communities are the public square: **r/homelab**, about hardware, racks, networking and the lab itself, and **r/selfhosted**, about the software people run on it. Both are large; I give no member counts because the counts couldn't be read from the pages themselves.

The reference catalog is **awesome-selfhosted**, "a list of Free Software network services and web applications which can be hosted on your own server(s)". The scope is deliberate: non-free software is listed on a separate Non-Free page, the HTML site at awesome-selfhosted.net is the primary version, and the Markdown list on GitHub is labeled legacy. The list is generated from a separate machine-readable repository, awesome-selfhosted-data, which held 1,358 software entries as of October 27, 2026 (the count includes the entries rendered on the non-free page), organized under the 95 tags the site lists. That structure is the same move a provider makes with its catalog: the data is the source of truth, and every page is rendered from it.

## How We Got Here

**The closet server.** The first homelab was whatever machine a household had left over: a retired desktop running Linux as a file server, a router, a game server. It cost nothing but its idle watts and taught the basics, but it had no remote management, no redundancy and consumer parts.

**Used enterprise racks.** Data centers replace servers on a refresh cycle, and the retired machines reach the secondhand market at a fraction of their original price. A two-socket 2U server of the Dell PowerEdge R730 generation brought what the closet server lacked: many cores, many memory slots, redundant power supplies, hot-swap bays and a baseboard management controller. Its costs are the ones the data center absorbed. Dell's SPECpower_ssj2008 result for an R730 (published February 2015; two 18-core Xeon E5-2699 v3, 64 GB, one 750 W supply) measured 46.9 W at active idle and 272 W at full target load, a benchmark-tuned floor with no spinning disks. The Register's February 2016 review of an R730 with two 12-core E5-2690 v3, 64 GB and two 7200 rpm drives put it at "about 150W" at idle, with six fans pushing air through the chassis, and called Dell's iDRAC "probably the R730's key selling point". Both figures are for a full-depth 2U chassis that needs a real rack.

**Mini PC clusters.** Low-power x86 changed the default. Intel's Processor N100 launched in Q1 2023 with four cores, four threads, a 6 W TDP, one memory channel and 16 GB of maximum memory. ServeTheHome's June 2023 review of fanless N100 and N200 firewall boxes measured them at about 10.5 to 12 W idle and the N100 at 22 to 23 W peak, and noted that an HP Elite Mini 600 G9 (a 1-liter business desktop with a 35 W TDP part and a fan) idled under 8 W. The NUC line, Intel's own mini PC, changed hands the same summer: on July 18, 2023 Intel announced a term sheet giving ASUS "a non-exclusive license to Intel's NUC systems product line designs" for the 10th to 13th generation systems, with the right to develop future designs through a new ASUS NUC business unit, as Intel stopped investing in the product. Three such boxes make a quorum for a hypervisor cluster at a fraction of one rack server's watts, which is why the three-node mini PC cluster became the default build ([Clustering at Home](/books/hosting-and-cloud/hypervisors-at-home#clustering-at-home)).

**The appliance NAS kept pace.** Storage moved the other way, into appliances that hide the operating system. Synology announced the DS925+ on April 23, 2025: an AMD Ryzen V1500B with four cores and eight threads, 4 GB of DDR4 ECC memory, two 2.5GbE ports, four bays and two M.2 slots, rated at 37.91 W in access, 12.33 W with drives hibernated and 20.5 dB(A) at idle. The appliance and the filesystem choices behind it are [NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage).

## How This Part Reads

The Homelab part comes right after The Business, which sets out the industry and [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), and right before The Stack. It takes the lab one layer at a time, each chapter hands off to the next, and each layer points forward to the chapter that runs it at provider scale:

| Chapter | The layer at home | Where it continues at provider scale |
| --- | --- | --- |
| **The Homelab** (this chapter) | Why, the hardware, power, noise, racks and UPS | [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#what-a-facility-sells) (space, power and cooling sold as units) |
| [NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage) | Pools, parity, snapshots, ECC | [Storage: Block, File & Object](/books/hosting-and-cloud/storage#how-the-providers-do-it) |
| [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home) | Proxmox VE and peers, clusters, passthrough | [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps#how-a-hypervisor-shares-a-host); [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud#who-operates-what) |
| [Home Networks: Ethernet, Wi-Fi & Cabling](/books/hosting-and-cloud/home-networks-and-cabling) | Ethernet, Wi-Fi, cabling, bufferbloat, consumer failover | [Data Center Networking](/books/hosting-and-cloud/data-center-networking#how-a-fabric-works) |
| [Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls) | The edge router, VLANs, local DNS, IPv6 and CGNAT | [Virtual Networks and VPCs](/books/hosting-and-cloud/data-center-networking#virtual-networks-and-vpcs) |
| [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps) | Compose, the apps, k3s and GitOps, backups | [From chroot to Containers](/books/hosting-and-cloud/containers#how-the-providers-do-it), [Schedulers](/books/hosting-and-cloud/schedulers#how-a-scheduler-works), [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture#the-control-loop), [Managed Databases](/books/hosting-and-cloud/managed-databases#how-a-managed-relational-database-works) |
| [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services) | Port forwards, proxies, tunnels, overlays | The hosting, certificate and edge parts later in the book |
| [AI at Home](/books/hosting-and-cloud/ai-at-home) | Open-weight models on home hardware | Where AI Runs: Home, Colo, Cloud or Frontier |
| [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation) | Deploying from home, upload, redundant lines, power, leaving the house | [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold); [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#provisioning-power-console-and-boot) |

The last chapter, [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation), hands off to [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation), where The Stack picks the layers up at provider scale from the building upward, through [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#what-a-zone-promises), the failure domains a house has exactly one of. Kubernetes follows ([Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#lightweight-and-immutable) covers k3s and Talos as products), then managed services, deploys ([Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#gitops-the-deploy-as-a-pull)), CI/CD ([Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#hosted-hybrid-and-self-hosted), where a home runner is one case) and infrastructure as code ([Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu#how-terraform-works-core-providers-and-the-graph)). The eras of that history are [From Bare Metal to Cloud: The Timeline](/books/hosting-and-cloud/bare-metal-to-cloud#the-map); the companies are [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#how-the-providers-do-it).

## Hardware Classes

**Used enterprise servers.** The reasons to buy one are capacity and management. A two-socket server takes far more memory than any mini PC, has PCIe slots for NICs, HBAs and GPUs, and has a baseboard management controller (BMC): a small computer on the motherboard with its own network port that can power the server on and off, read its sensors, choose its boot device and give a remote console, whatever state the operating system is in. Dell's is iDRAC and HPE's is iLO. That is the same out-of-band control, over IPMI or Redfish, a dedicated-server provider builds its automation on ([Provisioning: Power, Console and Boot](/books/hosting-and-cloud/dedicated-servers#provisioning-power-console-and-boot)), and the same rule applies at home: the BMC port belongs on a management VLAN nobody else reaches, because whoever reaches it owns the machine. The costs are power (46.9 W benchmark floor, about 150 W idle as reviewed with drives), fan noise, and depth: a full-depth 2U chassis won't fit a shallow cabinet or a wall-mount rack.

**Mini PCs and 1-liter business desktops.** The reasons are watts and silence: 8 to 12 W idle in the measurements above, fanless or near-silent, small enough for a shelf. The limits are memory, storage and NICs. The N100 has one memory channel and 16 GB of maximum memory per Intel, there are one or two drive slots, and the NICs are whatever the board carries. Out-of-band management is mostly absent. The exception is Intel's vPro-branded business desktops, the only Intel AMT devices that support AMT's KVM feature, which gives remote keyboard, video and mouse "even if the OS isn't running" once AMT is provisioned. A cluster of three of these is the low-power way to get high availability ([Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home#my-default)).

**NAS appliances.** Storage first, low effort: a vendor operating system, drive bays, a published power figure, and the vendor's rules about which drives it supports ([Synology and QNAP](/books/hosting-and-cloud/nas-and-home-storage#synology-and-qnap)). The DS925+ class runs 12 to 38 W by the vendor's figures, depending on whether the disks are spinning.

**DIY towers.** A consumer CPU with an integrated GPU for media transcoding, an HBA for more SATA ports, room for a GPU: the build when one box must be NAS, hypervisor and app host at once. Its power and noise sit between a mini PC and a rack server and depend entirely on the parts, so measure it rather than estimate it.

| Class | Idle power (sourced example) | Noise | Expandability | Out-of-band management | Failure modes | Best for |
| --- | --- | --- | --- | --- | --- | --- |
| **Used 2U enterprise** (R730 class) | 46.9 W SPEC floor; about 150 W reviewed with 2 HDDs | Loud | High: memory, PCIe, bays | iDRAC, iLO, IPMI | Power bill, noise, depth; aging parts | Learning enterprise gear, memory-heavy labs |
| **Mini PC** (N100, 1-liter business PCs) | About 10.5 to 12 W (N100 boxes); under 8 W (HP Elite Mini 600 G9) | Silent to quiet | Low: 16 GB max on the N100, 1 to 2 drives | None, or AMT KVM on vPro models | Memory ceiling; NIC quality | Always-on services, three-node clusters |
| **NAS appliance** (DS925+ class) | 12.33 W hibernated; 37.91 W in access | 20.5 dB(A) idle (vendor) | Bays, limited PCIe | Vendor UI | Vendor drive policy; vendor OS lifecycle | Storage first, low effort |
| **DIY tower** | Depends on parts; measure | Quiet with care | High | IPMI only on server boards | The builder | NAS plus apps plus transcoding |

## Power and the Electricity Bill

Watts are the homelab's metered rent. The arithmetic: one watt drawn all year is 8.76 kWh (8,760 hours), and at the EIA's US average residential price of 18.16 cents per kWh for August 2026 (preliminary, up from 17.57 cents a year earlier) that is about **$1.59 a year per watt**. State rates differ widely in the same table: 29.75 cents in California, 47.18 in Hawaii, 12.87 in Louisiana. Use your own state's rate, or better, the rate on your own bill.

The sourced figures above, run all year:

| Box (source) | Watts | kWh a year | US average, 18.16¢ | California, 29.75¢ | Louisiana, 12.87¢ |
| --- | --- | --- | --- | --- | --- |
| R730, SPEC active idle, no disks | 46.9 | 411 | $75 | $122 | $53 |
| R730, review idle with 2 HDDs | 150 | 1,314 | $239 | $391 | $169 |
| N100 fanless box, idle (upper figure) | 12 | 105 | $19 | $31 | $14 |
| HP Elite Mini 600 G9, idle (under) | 8 | 70 | $13 | $21 | $9 |
| DS925+, in access (vendor) | 37.91 | 332 | $60 | $99 | $43 |
| DS925+, drives hibernated (vendor) | 12.33 | 108 | $20 | $32 | $14 |

Three things follow. **The always-on box decides the bill:** a rack server idling at 150 W costs about as much a year as twelve N100 boxes. **Idle is the number that matters,** because a homelab spends most hours idle; peak matters for sizing the UPS and the circuit, not the bill. **Benchmarks are floors:** the SPEC figure is a tuned, diskless configuration, and a real server with drives, extra NICs and fans at default curves draws more, which is why the only number to budget with is one measured at the wall. A plug-in power meter or a smart plug measures one box; a UPS that reports `ups.realpower` (NUT's variable for "current value of real power (Watts)") measures everything behind it.

> [!TIP]
> Price the electricity before the hardware. A used server's purchase price is paid once; its idle watts are paid every month, at a rate that rose year over year in the EIA's figures.

Local inference is the exception to "idle decides": a GPU under load draws hundreds of watts, and its power and heat are [AI at Home](/books/hosting-and-cloud/ai-at-home#power-and-heat).

## Noise, Racks and the UPS

**Noise.** Rack servers are designed for data-center airflow, where nobody sits next to them, and their fans run fast to push air through a dense 1U or 2U chassis. Appliance vendors publish noise; Synology lists the DS925+ at 20.5 dB(A) idle. I found no published idle noise figure for the used enterprise generations homelabs buy, so the practical test is to hear one before deciding where it lives.

<!-- source-gap: enterprise-server-idle-dba | missing | an idle dB(A) figure for Dell R730 or HPE DL380 Gen9 class servers | closes with: a Dell or HPE acoustics spec or an independent measurement, opened | checked: 2026-10-27 -->

**Racks.** The rack follows the hardware. A full-depth 2U server needs a four-post rack deep enough for it and its rails. Mini PCs, a firewall, switches and a patch panel fit a short-depth or wall-mount rack, or a shelf. Rack units are the same U a colocation provider sells space in ([How Colocation Is Sold](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold)), so a lab built into a rack is already measured in the unit it will be priced in if it moves. The cabling, patch panels and switches in the rack are [Home Networks: Ethernet, Wi-Fi & Cabling](/books/hosting-and-cloud/home-networks-and-cabling).

**The UPS and NUT.** A UPS rides out flickers and buys time for a clean shutdown; it does not carry a lab through a long outage. Network UPS Tools (NUT), GPL software that supports UPSes, PDUs and similar power devices through one protocol and lists at least 201 manufacturers and 1,441 device models as compatible (v2.8.5, released April 7, 2026), turns one UPS into a coordinated shutdown of every host on it. Sizing, runtime math, the shutdown order and the uptime of a residence are [Power and the Uptime of a Residence](/books/hosting-and-cloud/homelab-to-colocation#power-and-the-uptime-of-a-residence).

## The Operator Is the Customer

The [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) is written from a provider's side: accounts, the resources they hold, the usage they generate and the money that follows. A homelab collapses the provider and the customer into one person, and the model still applies; what falls away is the money, not the structure.

- **One account.** The household is an account of one. `projects` still earn their place: the lab you break on purpose and the services the household depends on are different blast radii, the home version of staging and production.
- **One region, one zone.** A house is a region with exactly one failure domain: one power feed, one ISP line, one roof. Every redundancy inside it (a second node, a mirror, a UPS) protects against component failure, never against the house. The second zone arrives with an offsite copy or a colo box, which is where [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#hybrid-home-colo-and-cloud-on-one-network) ends and [What a Zone Promises](/books/hosting-and-cloud/regions-zones-and-cells#what-a-zone-promises) begins.
- **Resources without invoices.** Servers, VMs, volumes, buckets, domains and certificates are the same `resources` rows with the same kinds; `subscription_id` is null because nothing renews them but the owner. The domain and the certificate are the exceptions that do have an outside provider and a renewal date.
- **Usage at a price of zero.** Every meter still exists (watts, bytes, tokens), and recording them as `usage_events` is how a lab can be compared with what it replaces. There is no rating and no invoice inside the lab; the bill comes from the utility, priced per kWh.
- **Quotas are physical.** A provider's quota is a row; a homelab's quotas are the UPS's watt rating, the circuit's amps, the memory slots and the upload speed of the line.

## The Alternatives

| Option | Cost model | Strengths | Failure modes | Who it suits |
| --- | --- | --- | --- | --- |
| **Used enterprise server** | Low purchase price, high idle power | Capacity, BMC, redundant parts | Power, noise, depth, aging parts | Learning enterprise gear, memory-heavy labs |
| **Mini PC cluster** | Low purchase and power | Watts, silence, quorum with three nodes | Memory ceiling, few drives, little out-of-band control | Always-on services |
| **NAS appliance** | Mid purchase price, low power | Least administration, vendor support | Vendor policies and OS lifecycle | Storage first |
| **DIY tower** | Varies with parts | One box for storage, apps and transcoding | Everything on one machine | NAS plus apps on a budget |
| **Cloud VPS** (for contrast) | Metered rent, no hardware | No home power or ISP limits, public addresses, provider console | Rent forever; egress; the provider's terms | Public-facing services, anything that needs uptime the house can't give ([The VPS as a Product](/books/hosting-and-cloud/virtualization-and-vps#the-vps-as-a-product)) |

## My Default

My default is one to three low-power mini PCs (new N100-class boxes or used 1-liter business desktops, vPro models where remote console matters) for the always-on services, a separate NAS for bulk storage (an appliance, or a DIY box running ZFS per [NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage#my-default)), a managed switch and a real firewall, all behind one line-interactive UPS monitored by NUT, in a short-depth rack or on a shelf. I'd measure every box at the wall on the day it arrives, write the watts into the inventory, and price the lab at my own utility rate before adding anything to it.

I'd buy a used enterprise server only when the goal is to learn that hardware and its BMC, or when the lab needs memory or PCIe slots no mini PC has, and then I'd put it where its noise doesn't matter and run it only when I'm using it. What would change this: electricity at Louisiana rather than California prices, which makes a rack server's idle bill tolerable; a workload that needs a GPU, which makes a tower the main node; or services that need to be public and up, which belong on a VPS or in colocation from the start.

## How to Build It

The core data model gets no tables from this chapter. The homelab's hardware inventory is a section of the same `inventory.yaml` that lists the apps in [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps#how-to-build-it), with node names matching the cluster in [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home#how-to-build-it). It records what a provider's asset system records: what each machine is, what it does, how to reach it out of band, what it draws and which UPS it is on.

```yaml
# inventory.yaml: the hardware layer; apps live under `apps:` in the same file.
site:
  name: home
  power:
    tariff_cents_per_kwh: 18.16   # replace with the rate on your own bill
    tariff_source: "EIA US average residential, Aug 2026 (preliminary)"
  ups:
    - name: ups1
      nut_primary: nas            # the host the UPS's USB cable is on; it shuts down last
      rated_w: 900                # from the UPS datasheet; size on watts, not VA

nodes:
  - name: fw1
    class: mini-pc                # enterprise | mini-pc | nas-appliance | diy-tower | network
    role: [firewall, dns]
    oob: none
    ups: ups1
    measured_idle_w: 11
    measured_on: 2026-10-01
  - name: sw1
    class: network
    role: [switch]
    oob: none
    ups: ups1
    measured_idle_w: 10
    measured_on: 2026-10-01
  - name: pve1
    class: mini-pc
    role: [hypervisor]
    oob: { type: intel-amt-kvm, address: 10.0.98.11 }   # vPro model; management VLAN only
    ups: ups1
    measured_idle_w: 9
    measured_on: 2026-10-01
  - name: pve2
    class: mini-pc
    role: [hypervisor]
    oob: { type: intel-amt-kvm, address: 10.0.98.12 }
    ups: ups1
    measured_idle_w: 9
    measured_on: 2026-10-01
  - name: pve3
    class: diy-tower
    role: [hypervisor, gpu, storage-vm]
    oob: none
    ups: ups1
    measured_idle_w: 45
    measured_on: 2026-10-01
  - name: pbs
    class: mini-pc
    role: [backup]
    oob: none
    ups: ups1
    measured_idle_w: 8
    measured_on: 2026-10-01
  - name: nas
    class: nas-appliance
    role: [storage, nut-primary]
    oob: vendor-ui
    ups: ups1
    measured_idle_w: 38
    measured_on: 2026-10-01
```

The watts are one example lab's readings, not benchmarks; the point of the field is that it holds a measurement and a date. From them, the power budget:

| Node | Class | Idle watts (measured) | kWh a year | $ a year at 18.16¢ |
| --- | --- | --- | --- | --- |
| fw1 | Mini PC | 11 | 96 | $17.50 |
| sw1 | Switch | 10 | 88 | $15.91 |
| pve1 | Mini PC | 9 | 79 | $14.32 |
| pve2 | Mini PC | 9 | 79 | $14.32 |
| pve3 | DIY tower with GPU | 45 | 394 | $71.59 |
| pbs | Mini PC | 8 | 70 | $12.73 |
| nas | NAS appliance | 38 | 333 | $60.45 |
| **Total** | | **130** | **1,139** | **$206.81** (about $17 a month) |

A 130 W idle load is about 14% of the 900 W UPS rating in the inventory, which leaves room for the GPU node's peaks; whether it leaves enough runtime is the arithmetic in [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#power-and-the-uptime-of-a-residence). The same lab with one 150 W rack server in place of the two mini PC hypervisors and the tower would idle at about 217 W, with only one hypervisor left.

**The same records in the core model.** For a lab that wants history (watts over time, not one reading), the nodes are `resources` rows of kind `server` in a `home` region, and power readings are `usage_events` with no price attached. A small collector polls the UPS's `ups.realpower` through NUT, or each smart plug's API, and inserts one event per node per interval:

```sql
-- The house is one region with one failure domain.
INSERT INTO regions (id, name, country, status) VALUES ('home', 'Home', 'US', 'available');

-- A node is a server resource; nothing renews it, so subscription_id stays null.
INSERT INTO resources (account_id, kind, region_id, external_ref, state, exists_during)
VALUES (:home_account, 'server', 'home', 'pve1', 'active', tstzrange('2026-10-01', NULL));

-- One power reading: average watts over five minutes, recorded as watt-hours.
INSERT INTO usage_events (source, idempotency_key, account_id, resource_id, meter, quantity,
                          dimensions, occurred_during)
VALUES ('nut@nas', 'pve1:2026-10-27T10:00Z', :home_account, :pve1_id, 'power.watt_hours',
        9.2 * 5 / 60.0,                       -- 9.2 W for 5 minutes
        '{"method": "smart_plug", "ups": "ups1"}',
        tstzrange('2026-10-27 10:00Z', '2026-10-27 10:05Z'));

-- The month's electricity per node, priced at the tariff as a parameter, not a SKU.
SELECT r.external_ref AS node,
       sum(u.quantity) / 1000                      AS kwh,
       round(sum(u.quantity) / 1000 * :cents_per_kwh / 100, 2) AS dollars
FROM usage_events u
JOIN resources r ON r.id = u.resource_id
WHERE u.account_id = :home_account
  AND u.meter = 'power.watt_hours'
  AND u.occurred_during && tstzrange('2026-10-01', '2026-11-01')
GROUP BY r.external_ref
ORDER BY kwh DESC;
```

No `rated_usage`, `price_versions` or invoice rows follow, because nobody bills the household but the utility. The zero-price meters are still worth keeping: priced at a provider's rates instead of the tariff, the same rows show what the lab would cost to rent, which is the comparison that [Repatriation](/books/hosting-and-cloud/repatriation#a-cost-model-for-owning) makes at company scale and the book's Operating Metrics chapter makes for a provider's own fleet.

## What This Means for the System You Build

- **Treat the homelab as a provider with one customer:** the same layers, the same inventory, and a model where only the money falls away.
- **Budget watts as dollars:** about $1.59 a year per watt at the US average, scaled to your own rate, with idle as the number that sets the bill.
- **Measure at the wall** and record the reading with a date; spec sheets and benchmarks are floors.
- **Pick the hardware class by what the always-on load needs,** not by what a used server's price tag suggests: mini PCs for services, a NAS for storage, enterprise gear for learning it.
- **Keep out-of-band management on its own network,** whether it is a BMC or AMT, because it controls the machine below the operating system.
- **Remember the house is one failure domain:** redundancy inside it protects components, and only an offsite copy or a second site protects the data.
- **Put everything on a monitored UPS** and let NUT decide the shutdown, sized for a clean stop rather than ride-through.
- **Rack in the unit you'd be priced in later,** so a move to colocation is a list of U and watts you already know.

## References

**Hardware and power**

- [SPEC: SPECpower_ssj2008 result, Dell PowerEdge R730](https://www.spec.org/power_ssj2008/results/res2015q1/power_ssj2008-20150203-00686.html), 46.9 W active idle and 272 W at 100% load; two E5-2699 v3, 64 GB, one 750 W supply; published February 2015
- [The Register: Dell PowerEdge R730 review](https://www.theregister.com/2016/02/09/dell_r730/), February 9, 2016, about 150 W idle with two E5-2690 v3, 64 GB and two 7200 rpm drives; six fans; iDRAC
- [Intel: Processor N100 specifications](https://www.intel.com/content/www/us/en/products/sku/231803/intel-processor-n100-6m-cache-up-to-3-40-ghz/specifications.html), Q1 2023 launch, 4 cores and 4 threads, 6 W TDP, one memory channel, 16 GB maximum memory
- [ServeTheHome: Fanless Intel N100 firewall and virtualization appliance review](https://www.servethehome.com/fanless-intel-n100-firewall-and-virtualization-appliance-review/4/), June 8, 2023, 10.5 to 12 W idle, N100 peak 22 to 23 W, HP Elite Mini 600 G9 under 8 W idle
- [ServeTheHome: ASUS and Intel agree on deal for a NUC future](https://www.servethehome.com/asus-and-intel-agree-on-deal-for-a-nuc-future/), July 18, 2023, the term sheet, the non-exclusive license for 10th to 13th gen NUC designs, the ASUS NUC BU, Intel ending NUC investment
- [Intel: Active Management Technology developer guide, KVM](https://www.intel.com/content/www/us/en/docs/active-management-technology/developer-guide/2021/kvm.html), KVM over IP when the OS isn't running; vPro-branded devices only; introduced in AMT 6.0
- [Synology: DS925+ specifications](https://www.synology.com/en-us/products/DS925+#specs), CPU, ECC memory, ports, bays, 37.91 W in access, 12.33 W hibernated, 20.5 dB(A) idle
- [Synology: Synology announces DiskStation DS925+ and DX525 expansion unit](https://www.synology.com/en-global/company/news/article/DS925p_DX525), April 23, 2025
- [EIA: Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), average residential price by state, August 2026 (preliminary) and August 2025: US 18.16 and 17.57 cents per kWh; California, Hawaii and Louisiana

**UPS monitoring**

- [Network UPS Tools](https://networkupstools.org/), supported power devices, 201 manufacturers and 1,441 device models, v2.8.5 released April 7, 2026, GPL
- [NUT Developer Guide: Variables](https://networkupstools.org/docs/developer-guide.chunked/apas02.html), `ups.realpower`, `ups.load`, `battery.runtime` and `battery.charge` definitions

**Community**

- [awesome-selfhosted](https://awesome-selfhosted.net/), the list's scope (Free Software network services and web applications), the Non-Free page, the legacy Markdown version, 95 tags
- [GitHub: awesome-selfhosted/awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data), the machine-readable data the site and list are generated from; CC BY-SA 3.0
- [GitHub API: awesome-selfhosted-data tree](https://api.github.com/repos/awesome-selfhosted/awesome-selfhosted-data/git/trees/master?recursive=1), 1,358 software entries under `software/` as of October 27, 2026
