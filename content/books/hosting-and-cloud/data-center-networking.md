+++
title = "Data Center Networking"
description = "Three-tier trees to leaf-spine Clos, VPCs and overlays, SmartNICs and DPUs, and AI fabrics: InfiniBand, RoCE v2, EFA and SRD, NVLink and Ultra Ethernet."
category = "Hosting & Cloud Industry"
order = 2116
part = "The Stack, Bottom to Top"
tags = ["networking", "data-centers", "vpc", "infiniband", "rdma"]
+++

A data center network has three jobs, and the industry built a different network for each. The **fabric** connects every server in a building to every other at a known bandwidth, and it went from a tree of ever-larger routers to a mesh of identical small switches. The **virtual network** gives every customer a private address space, subnets, routes and firewall rules on top of the shared fabric, and it moved from the switches into software on each host and then into a card in each server that the customer can't touch. The **AI fabric** connects GPUs to each other for training jobs that stall if one packet is late, and it is a second, separate network in the same building, built from InfiniBand or from Ethernet tuned to behave like it. A provider sells all three without pricing most of them: the fabric is in every instance's price, the virtual network is free until traffic crosses a zone, a gateway or the internet, and the AI fabric comes bundled with the GPU instance.

This chapter covers the network inside and between a provider's buildings: how three-tier trees gave way to leaf-spine Clos fabrics built from merchant silicon (VL2, Google's Jupiter, Meta's fabric and F16, SONiC); how virtual networks and VPCs work (Andromeda, VXLAN and Geneve overlays, security groups and network ACLs, gateways and endpoints); how SmartNICs, DPUs and IPUs took the virtual switch off the host (Nitro, Azure Boost, Google's IPU, BlueField); and how AI fabrics work, at length: InfiniBand from its 2000 specification through Mellanox to NVIDIA, RDMA and RoCE v2 and the lossless Ethernet they need, Meta's operating record, AWS's EFA and SRD, NVLink and UALink, rail-optimized topologies, Spectrum-X and the Ultra Ethernet Consortium, and where the market stands as of October 2026. It adds networks, subnets, security groups and their rules, interconnects and placement groups to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The building and its cross-connects are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation); the servers and their management network are [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); how a provider lays out regions and zones is [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells); the network between providers (anycast, peering, IXPs, IP address markets) is the chapter [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses); Kubernetes networking above the VPC is [Cluster Networking](/books/hosting-and-cloud/cluster-networking); and the business of GPU capacity is [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds).

## How the Providers Do It

| Provider | General-purpose and virtual network (as published) | AI back-end fabric (as of October 2026) | What it shows |
| --- | --- | --- | --- |
| **AWS** | VPCs since 2009; security groups and network ACLs; the Nitro card for VPC encrypts instance-to-instance traffic transparently on its latest three versions; per-instance bandwidth tiers with a 5 Gbps single-flow cap outside cluster placement groups | Ethernet with EFA over SRD: 3,200 Gbps per P5 instance (8 H100s), 6.4 Tbps on p6-b300, 28.8 Tbps per p6e-gb200 UltraServer of up to 72 GPUs; EFA "at no additional cost" | A provider that built its own transport because it built its own card |
| **Microsoft Azure** | Host SDN with VFP, offloaded to FPGA SmartNICs (AccelNet) and now Azure Boost with the MANA NIC up to 200 Gbps | InfiniBand on ND-series: "400 Gb/s NVIDIA Quantum-2 CX7 InfiniBand per GPU with 3.2Tb/s per VM in a non-blocking fat-tree network"; Fairwater sites on a "two-tier, ethernet-based backend network" with 800 Gbps GPU-to-GPU links | A buyer moving its largest sites from InfiniBand to Ethernet |
| **Google Cloud** | Andromeda host SDN; Jupiter fabrics with optical circuit switches in place of the spine | RoCE on A3 Ultra and A4 (8 ConnectX-7 NICs, 3,200 Gbps of GPU traffic) in a dedicated RoCE VPC with MTU 8896, rail-aligned so a block is "a maximum of two network hops"; Google ships an NCCL build for its topology | The most published fabric, and RDMA delivered as its own kind of VPC |
| **Oracle (OCI)** | Virtual cloud networks | "RoCEv2 with ConnectX-7 NICs and ConnectX-8 SuperNICs or NVIDIA Quantum-2 InfiniBand" (September 2024); Zettascale10 on "Oracle Acceleron RoCE" for clusters of up to 800,000 GPUs, announced for the second half of 2026 | Both fabrics in one catalog |
| **CoreWeave** | GPU cloud | InfiniBand (Quantum-2, Quantum-X800) in a non-blocking fat-tree, "fully SHARP compliant"; Spectrum-X RoCE on GB300 instances | A neocloud running both, by GPU generation |
| **Nebius** | Its own cloud | InfiniBand at 400 Gbps per GPU, 3.2 Tbps per 8-GPU VM; clusters live in a named fabric and each gets its own InfiniBand partition key (P-Key) | Tenant isolation on InfiniBand is a partition |
| **Lambda** | GPU cloud | 1-Click Clusters "InfiniBand-connected," HGX B200 with Quantum-2 and SHARP, 16 to 2,000+ GPUs | InfiniBand as the default for mid-size clusters |
| **Meta** (operator, not a seller) | The 2014 four-plane fabric, then F16 on single-chip Tomahawk 3 planes | Two 24,576-GPU H100 clusters built in 2024, one RoCE and one InfiniBand, both at 400 Gbps per endpoint | The public operating record that made RoCE credible at scale |
| **Hetzner, OVHcloud** | Private L2 between dedicated servers: Hetzner vSwitch (VLAN IDs 4000 to 4091, up to 100 servers, MTU 1400 recommended); OVHcloud vRack (up to 4,000 VLANs, unmetered private traffic) | None publicly described | A VLAN as the bare-metal customer's VPC |

Four patterns run through the table. **Nobody prices the fabric separately:** EFA is free, InfiniBand comes with the ND or GPU instance, and what is sold is the instance size, a placement construct and reserved capacity in one fabric, while metered networking starts where traffic leaves the tenant's network (gateways, endpoints, zones, the internet). **The virtual network lives in the server's card,** not in the switches, at every hyperscaler. **AI back ends are a separate network** from the one the VPC rides on, with its own NICs, its own switches and often its own address space. **The choice between InfiniBand and Ethernet is live:** the same providers run both, and the largest buyers are moving to Ethernet.

## How It Got Here

### The tree and its oversubscription (to 2008)

The classic data center network was a tree: access (top-of-rack) switches under aggregation switches under a pair of core routers, with Spanning Tree blocking redundant links. Al-Fares, Loukissas and Vahdat's "A Scalable, Commodity Data Center Network Architecture" (SIGCOMM, August 2008) stated the problem: "progressively more specialized and expensive equipment moving up the network hierarchy," and a tree that might "only support 50% of the aggregate bandwidth available at the edge" even with the best switches. Typical oversubscription was "2.5:1 (400 Mbps) to 8:1 (125 Mbps)" per server; enterprise routers allowed "a maximum of 16-way ECMP"; and the paper's cost model priced a 48-port gigabit edge switch at $7,000 against $700,000 for a 128-port 10 GigE core, so full bandwidth for 20,000 hosts with traditional gear would cost "approximately $37M." Its answer was a k-ary fat-tree of identical commodity switches supporting k³/4 hosts: with 48-port switches, "full bandwidth to up 27,648 hosts." **What it solved:** the tree's ceiling. **What it cost:** many more switches and cables, and routing that had to spread traffic across all of them.

### Clos from merchant silicon (2009 to 2019)

Microsoft Research's VL2 (SIGCOMM 2009) built the idea: a Clos of "low-cost switch ASICs," Valiant Load Balancing that bounces each flow off a random intermediate switch, and application addresses separated from location addresses by IP-in-IP encapsulation in a host agent, with a directory service mapping one to the other. Its prototype "shuffles 2.7 TB of data among 75 servers in 395 seconds," at "94% of the maximum possible." Facebook's data center fabric, introduced November 14, 2014 and first deployed at Altoona, grouped 48 racks into **pods** served by four fabric switches, gave each top-of-rack switch 4 x 40G uplinks, and connected pods through **four spine planes** of up to 48 spines each; it started at 4:1 rack-to-rack oversubscription with 12 spines per plane, expandable to 1:1, with BGP4 as the only routing protocol and a central controller ("distributed control, centralized override"). The post never names it; the later F16 post calls it the "four-plane" design, and it is often called F4. Broadcom's Tomahawk, in September 2014 a 3.2 Tbps switch on one chip with 32 ports of 100GbE, made such fabrics buildable from identical boxes.

Google's "Jupiter Rising" (SIGCOMM 2015) described five generations of Clos fabrics over ten years, 100 times more capacity, "more than 1Pbps" of bisection bandwidth from "commodity switch silicon," under a "centralized control mechanism." RFC 7938, "Use of BGP for Routing in Large-Scale Data Centers" (August 2016), wrote down the industry's practice: a folded Clos, non-blocking when uplinks equal or exceed downlinks, with **eBGP as the only routing protocol**. Microsoft open-sourced its switch operating system, **SONiC**, at the OCP Summit in March 2016, after OCP accepted its Switch Abstraction Interface (SAI) in July 2015; SONiC moved to the Linux Foundation on April 14, 2022 and runs on "more than 100" switch models. Meta's **F16** (March 14, 2019) connected each rack to 16 planes, each a single Tomahawk 3 chip (12.8 Tbps, 128 x 100G), for "4x the capacity" of the four-plane design, chose mature 100G CWDM4 optics because 400G optics weren't available at scale, and cited **fixed regional power** among its reasons. **What it solved:** bandwidth that grows by adding identical switches, from many vendors, with an open operating system. **What it cost:** thousands of links to cable and monitor, and a routing design that has to keep ECMP balanced.

### Virtual networks (2009 to 2020)

AWS launched Amazon VPC on August 25, 2009 as a limited beta in one zone: an IPsec VPN back to the customer's network was the only path out, ranges were /28 to /18, a VPC could have up to 20 subnets, and there were no Elastic IPs or security groups yet; accounts created after December 4, 2013 have been VPC-only. Google announced **Andromeda**, the SDN under its cloud's firewalls, routing and load balancing, on April 2, 2014. VXLAN was published as RFC 7348 in August 2014, a 24-bit segment ID for "up to 16 M VXLAN segments" over UDP port 4789, written to escape the 4,094-VLAN limit, Spanning Tree's blocked links and top-of-rack MAC table exhaustion. AWS PrivateLink arrived on November 8, 2017 and Transit Gateway on November 26, 2018. Geneve, RFC 8926 (November 2020), became the Standards Track encapsulation with variable-length options. **What it solved:** a private network per customer on shared switches, created by an API call. **What it cost:** encapsulation overhead, per-packet work on every host, and a control plane that must program millions of flows.

### The card becomes the boundary (2013 to 2023)

AWS moved network processing into hardware on C3 instances in 2013 and storage on C4 in 2014, acquired Annapurna Labs in early 2015, and launched C5 on November 6, 2017 with "all networking and storage functionality ... implemented in hardware" on the full Nitro System. Azure put FPGA SmartNICs on all new servers from late 2015 (AccelNet, customer-facing from 2016, reported at NSDI 2018 at "<15μs VM-VM TCP latencies and 32Gbps throughput"). Google announced C3 machines with an IPU co-designed with Intel on October 11, 2022, and opened its **Falcon** hardware transport at the OCP Global Summit on October 17, 2023. Azure Boost, from Ignite 2023, offloads networking and storage with the MANA NIC. **What it solved:** host CPUs sold whole to customers, line-rate encryption, and an isolation boundary the guest can't reach. **What it cost:** a custom card per generation, and for everyone without one, the choice of buying it from NVIDIA, AMD or Intel.

### HPC fabrics come to the cloud (2000 to 2020)

The InfiniBand Trade Association was founded in 1999, merging the Future I/O and NGIO efforts; its steering companies in 2001 were Compaq, Dell, Hewlett-Packard, IBM, Intel, Microsoft and Sun. The first InfiniBand specification was "completed in October 2000," with links "starting at data rates of 2.5 Gbps." Mellanox carried it through HPC generations, introducing in-network reduction (SHARP) in its Switch-IB 2 switches, announced in November 2015 and called "the world's first smart switches" in July 2016, and unveiling 200 Gb/s HDR in November 2016. The IBTA published RDMA over Converged Ethernet (RoCE) in April 2010 for one Layer 2 subnet and **RoCE v2** on September 16, 2014, adding "L3 routing through the use of UDP headers." NVIDIA completed its $7 billion acquisition of Mellanox on April 27, 2020. AWS made EFA generally available on April 29, 2019 and published SRD, its own transport, in IEEE Micro in 2020. **What it solved:** microsecond, CPU-bypassing communication for tightly coupled jobs. **What it cost:** a second network to run, and for InfiniBand, effectively one vendor.

### AI fabrics (2022 on)

Google's "Jupiter Evolving" (SIGCOMM 2022) reported replacing the spine with optical circuit switches, cutting capex by 30% and power by 41%. AWS made P5 instances generally available on July 26, 2023 with 3,200 Gbps of EFA per instance, "8 times" P4d. NVIDIA launched Spectrum-X on May 28, 2023; the Ultra Ethernet Consortium was announced on July 19, 2023; Meta published its two 24,576-GPU clusters on March 12, 2024 and its RoCE paper at SIGCOMM in August 2024; NVIDIA announced 800 Gb/s Quantum-X800 InfiniBand on March 18, 2024; the UALink promoters announced on May 30, 2024 and ratified UALink 200G 1.0 on April 8, 2025; UEC 1.0 was published on June 11, 2025 and revised to 1.1 on October 12, 2026; Broadcom shipped the 102.4 Tbps Tomahawk 6 on June 3, 2025. By Dell'Oro's count, Ethernet switch sales in AI back ends were more than double InfiniBand's in 2025, from a baseline two years earlier in which InfiniBand had "nearly 80%." **What it solved:** clusters of tens to hundreds of thousands of GPUs. **What it cost:** a network that can be a large share of the cluster's cost and power, and a design space still moving every year.

## How a Fabric Works

### Leaf-spine and oversubscription

A leaf-spine (folded Clos) fabric has two layers in a small building and three or more in a large one. Each **leaf** (top-of-rack switch) connects its servers downward and every spine upward; each **spine** connects every leaf. Any server reaches any other in leaf-spine-leaf, three switch hops, and the fabric grows by adding leaves until spine ports run out, then by adding a layer (pods of leaves and fabric switches under spine planes, as Facebook built). **Oversubscription** is the ratio of a leaf's downlink bandwidth to its uplink bandwidth: 1:1 is non-blocking, so every server can send at line rate at once; general-purpose fabrics have run oversubscribed (2.5:1 to 8:1 in the trees Al-Fares surveyed, 4:1 at day one in Facebook's 2014 fabric) because most servers aren't sending at once; AI back ends run 1:1 or better, because a training job's servers all send at once. Meta's AI back end started at **1:2 undersubscription**, twice the uplink capacity needed, to work around routing collisions, and later brought it to 1:1.125 with traffic engineering.

### ECMP, BGP and their failure mode

Every leaf has many equal-cost paths to every other leaf, and **ECMP** (equal-cost multipath) picks one per flow by hashing its five-tuple, so packets of one flow stay in order on one path. RFC 7938's design runs **eBGP** on every link: private ASNs (64512 to 65534, or 4-byte ASNs), one ASN shared by all spines, one per set of tier-2 switches in a cluster, one per top-of-rack (reused across clusters with "Allowas-in"), private ASNs stripped at the WAN edge, BGP "multipath relax" for ECMP across ASNs, fan-out typically half a switch's ports (32 on a 64-port switch), BFD or fast fallover for sub-second convergence, and no summarizing of server subnets inside the Clos, which would black-hole traffic after a single link failure. eBGP won over link-state IGPs because it runs over TCP, floods less, and AS_PATH loop detection limits path hunting.

ECMP's failure mode is **collisions**. Hashing spreads many small flows evenly; it spreads a few large flows badly, and two elephant flows that hash to the same uplink each get half of it while other links sit idle. General-purpose traffic is many small flows. AI training traffic is a few large, synchronized ones, which is why every AI fabric below changes how paths are chosen.

### Central control and optical switching

Hyperscalers add a controller above the distributed protocol: Facebook's BGP controller overrides routes, and Google's Jupiter pushes global configuration from a "centralized control mechanism" and borrows traffic engineering from its B4 WAN (Orion). Google then removed the spine. Its MEMS optical circuit switches (Apollo), integrated over eight years by 2022, are data-rate and wavelength agnostic, so they don't need replacing when electrical speeds rise, and they "now form the basis for the vast majority" of its data center networks: aggregation blocks of different generations are meshed directly through the OCS layer, 60% of traffic takes a direct block-to-block path and the rest one transit block, an average path of 1.4 blocks, with fabric reconfiguration three times faster than a patch-panel Clos. Google claims about 30% lower cost and 40% lower power than the best known alternatives. TPU v4 uses the same switches to reconfigure 4,096 chips into a 3D torus, at "<5% of system cost and <3% of system power."

### Merchant silicon

The fabric is affordable because the switch chip is a merchant product sold to every vendor. Broadcom's Tomahawk line is the reference, and its own Tomahawk 5 release says it has doubled bandwidth "approximately every two years":

| Chip | Capacity | Date |
| --- | --- | --- |
| Tomahawk | 3.2 Tbps, 32 x 100GbE | September 2014 |
| Tomahawk II | 6.4 Tbps, 64 x 100GbE, 16 nm | October 11, 2016 |
| Tomahawk 3 | 12.8 Tbps, 256 x 50G PAM4 SerDes, 16 nm | Shipping December 19, 2017 |
| Tomahawk 4 | 25.6 Tbps, 512 x 50G PAM4, 7 nm | Shipping December 9, 2019 |
| Tomahawk 5 | 51.2 Tbps, one 5 nm die | Shipping August 16, 2022; production volume March 15, 2023 |
| Tomahawk 6 | 102.4 Tbps, 100G or 200G SerDes, co-packaged optics option | Shipping June 3, 2025; production volume March 12, 2026 |

Broadcom's Jericho line is the deep-buffer counterpart: Jericho3-AI (April 18, 2023) for "32,000 GPUs, each with 800Gbps, in a single cluster," and Jericho4 (August 4, 2025) for "lossless RoCE across 100km+" between buildings. NVIDIA's Spectrum-4 (May 2023) is its 51 Tb/s Ethernet switch for AI. **Shallow-buffer** chips at the leaf and **deep-buffer** chips where many flows converge is a standing design choice: Meta's AI zones use shallow shared buffers in the rack switch and deep buffers, statically carved per ingress port, in the spine.

## Virtual Networks and VPCs

### The tenant's model

Every cloud gives the customer the same objects under different names. A **network** (VPC, VNet, VCN) is a private address space in a region; **subnets** divide it, usually one or more per zone; **route tables** say where traffic for each prefix goes; **gateways** connect it to the internet (an internet gateway for public addresses, a NAT gateway for outbound-only private instances), to on-premises networks (VPN, dedicated interconnects) and to other networks (peering, a transit hub); **endpoints** expose a service privately inside the customer's network. AWS's default VPC today is one per region with a public subnet in each zone, an internet gateway and DNS. PrivateLink endpoints "appear as Elastic Network Interface (ENI) with private IPs in your VPCs," first for AWS services and from November 28, 2017 for customers' own services behind a Network Load Balancer; Transit Gateway was launched as a hub for up to 5,000 VPCs, with up to 50 Gbps bursty per attachment and multiple route tables for separate inspection and isolation domains.

Two kinds of filter control traffic, and AWS's own comparison states the difference every cloud implements:

| | Security group | Network ACL |
| --- | --- | --- |
| Attached to | An instance's interface | A subnet |
| Rules | Allow only | Allow and deny |
| Evaluation | All rules | In ascending order until one matches |
| State | Stateful: return traffic is allowed | Stateless: return traffic needs its own rule |
| Role | "The primary mechanism" | "Stateless, coarse-grain" guard rails and defense in depth |

A security group rule can name another security group as its source, which is what makes them the unit of a tiered application (the web tier's group may reach the database tier's group on 5432) without listing addresses.

### Overlays and host SDN

Under the tenant's model, the provider's hosts encapsulate. A VM's packet is wrapped in an outer header addressed to the destination host and carried across the fabric as ordinary IP: VXLAN adds 50 bytes over IPv4 (outer Ethernet 14, IP 20, UDP 8, VXLAN 8) and carries a 24-bit segment ID; Geneve carries a fixed header plus variable-length options so the provider can attach metadata; VL2 did the same in 2009 with IP-in-IP. Encapsulation is why tenant MTUs are smaller than the fabric's, or the fabric runs jumbo frames, and why the segment ID, not a VLAN, is the tenant boundary.

The virtual switch that encapsulates, filters and routes runs on every host, and three public designs show the range:

- **Software with OS bypass (Google Andromeda).** The NSDI 2018 paper describes a host Fast Path with a 300-nanosecond per-packet CPU budget, an Open vSwitch-derived user-space dataplane, one physical core reserved, and 32.8 Gb/s on a single core. **Hoverboards** are gateways that carry the long tail of idle flows, while the control plane programs direct host-to-host rules only for hot ones: offloading about 50,000 flows, under 0.1% of possible flows, cut Hoverboard peak load below 1% of cluster bandwidth, and a 40,000-VM network programmed 1.5 million flows in 1.9 seconds. Google chose software over SR-IOV so **live migration** works across different NICs, with a median migration blackout of 65 ms and a 99th percentile of 388 ms, and upgrades the dataplane weekly without disruption.
- **A programmable virtual switch, then offloaded (Azure VFP and AccelNet).** VFP (NSDI 2017) ran host SDN policy on more than a million hosts for over four years; AccelNet moved its fast path into FPGA SmartNICs.
- **A card that owns all I/O (AWS Nitro).** The Nitro Card for VPC exposes the Elastic Network Adapter (ENA) to the instance over PCIe as SR-IOV virtual functions, and the Nitro Hypervisor has no networking stack at all.

### What the tenant sees and pays for

Bandwidth is a property of the instance size. AWS counts bandwidth in each direction at once, scales it with vCPUs (an m5.8xlarge 10 Gbps, an m5.16xlarge 20 Gbps), gives sizes of 4xlarge and below a baseline plus network I/O credits for bursts of "5 to 60 minutes," caps a single flow at 5 Gbps (10 Gbps inside a cluster placement group, 25 Gbps with ENA Express in one zone), limits traffic through an internet gateway to 5 Gbps under 32 vCPUs and 50% of the instance's bandwidth above, and enforces packets-per-second and tracked-connection allowances. Google allows egress of "generally 2 Gbps per vCPU" with per-series caps and higher **Tier_1** limits, 3 Gbps per flow and 7 Gbps per VM to outside the VPC, and 30 Gbps or 1.8 million packets per second of inbound traffic from outside. Azure limits egress only, per VM regardless of NIC count, and supports at least 500,000 inbound and 500,000 outbound flows on every size.

**Placement groups** are the network's other customer-facing control. AWS offers cluster (one zone, a "high-bisection bandwidth segment," not one rack; launch all at once with the same type; not supported with Capacity Blocks), partition (up to seven partitions per zone on separate racks), spread (at most seven running instances per zone per group) and precision-time groups with a PTP hardware clock. ENA Express (November 28, 2022) runs SRD under ordinary TCP and UDP within one zone, raising single-flow bandwidth from 5 to 25 Gbps at no additional charge.

Most of the network is free; the meters sit at boundaries. AWS's list prices as of October 2026: a NAT gateway at $0.045 per hour plus $0.045 per GB processed, public IPv4 at $0.005 per hour whether in use or idle, cross-zone VPC peering at $0.01 per GB in each direction, Transit Gateway at $0.05 per attachment-hour plus $0.02 per GB, and PrivateLink interface endpoints at $0.01 per hour per zone plus $0.01 per GB for the first petabyte. Internet egress pricing and the switching rules around it belong to the chapter [Egress & Switching](/books/hosting-and-cloud/egress-and-switching).

Bare-metal providers sell the simplest version: a VLAN between the customer's servers. Hetzner's vSwitch carries VLAN IDs 4000 to 4091 over the server's existing uplink, up to 100 servers per vSwitch and five vSwitches per server, MTU 1400 recommended, with cross-location traffic free and public subnet traffic beyond 1 TB at €1 per TB. OVHcloud's vRack is a private Layer 2 across all its regions, up to 4,000 VLANs, with unmetered private bandwidth and public exposure through billed gateway tiers.

## SmartNICs, DPUs and IPUs

A SmartNIC, DPU (data processing unit) or IPU (infrastructure processing unit) is a network card with its own processors that runs the provider's infrastructure (virtual switch, storage client, encryption, management) so that the host's CPUs belong entirely to the customer and the provider's control point sits outside the customer's reach.

| Card | What's public | Since |
| --- | --- | --- |
| **AWS Nitro Cards** | Controller, VPC, EBS and local NVMe cards designed by Annapurna Labs; the Nitro Controller is the "exclusive gateway" between the server and the EC2, EBS and VPC control planes; transparent AES-256-GCM encryption of instance-to-instance VPC traffic on the last three VPC card versions; SRD implemented in the card | Network offload on C3 (2013), EBS on C4 (2014), full Nitro on C5 (November 6, 2017) |
| **Azure AccelNet and Boost** | FPGA SmartNICs on all new servers from late 2015; Azure Boost with the MANA NIC up to 200 Gbps, active/active to the top-of-rack, DPDK; storage offload up to 14 GBps and 750K IOPS remote, 36 GBps and 6.6M IOPS local; Cerberus root of trust; Rust for new Boost code | AccelNet 2015; Boost at Ignite 2023 |
| **Google IPU** | Co-designed with Intel, "200 Gbps low-latency networking" and line-rate PSP encryption on C3; Falcon hardware transport "first available in the Intel IPU E2000 series," with hardware RTT measurement, per-flow shaping, fast retransmit and multipath, carrying RDMA verbs and NVMe | C3 preview October 11, 2022, GA May 22, 2023; Falcon October 17, 2023 |
| **NVIDIA BlueField** | BlueField-3 at 400 Gb/s and BlueField-4 at 800 Gb/s, offloading SDN, storage and security, programmed with the DOCA SDK | BlueField-3 sampling May 2022 |

The cards are also where AI networking and cloud networking meet: BlueField-3 is half of Spectrum-X, and the Nitro card is where SRD runs.

## AI Fabrics

### Scale-up and scale-out

A GPU cluster has two networks for GPU traffic, at very different scales:

- **Scale-up** connects GPUs inside a node or a rack with dedicated GPU-to-GPU links. NVIDIA's NVLink gives each Hopper GPU 900 GB/s over 18 links (A100 had 600 GB/s), each Blackwell GPU 1,800 GB/s, and Vera Rubin 3,000 GB/s over 36 links (preliminary); the NVLink 5 Switch builds a 72-GPU domain at 130 TB/s for GB200 NVL72, and NVLink 6 a 216 TB/s NVL72. **UALink**, the open alternative, published its 200G 1.0 specification on April 8, 2025 for "up to 1,024 accelerators within an AI computing pod"; its board then comprised Alibaba, AMD, Apple, Astera Labs, AWS, Cisco, Google, HPE, Intel, Meta, Microsoft and Synopsys.
- **Scale-out** connects nodes or racks across the building at 400 to 800 Gb/s per GPU, over InfiniBand or Ethernet, with one NIC per GPU.

Moving the scale-up boundary from 8 GPUs to 72 moved what a provider sells: AWS reports 28.8 Tbps of EFA per GB200 UltraServer of up to 72 GPUs in one NVLink domain, rather than per instance.

### Front end, back end and rails

An AI cluster has several networks, and NVIDIA's DGX SuperPOD reference architecture names four: a compute fabric, a storage fabric, an in-band Ethernet management network and an out-of-band management network. Meta's paper gives the reason for keeping training traffic separate: a **frontend** network carries data ingestion, checkpointing and logging, and a **backend** network carries training traffic so it can evolve on its own schedule, with one RDMA NIC per GPU and GPUDirect.

The backend is **rail-optimized.** In NVIDIA's reference, GPU *n* in every node connects to leaf switch *n*, its "rail," so traffic between GPUs of the same rank across a 32-node scalable unit is one switch hop, and only cross-rail traffic climbs to the spine; four scalable units make 127 nodes and 1,016 GPUs on 32 leaf and 16 spine switches. Google exposes the same structure as sub-blocks (one hop through a top-of-rack) and blocks ("a maximum of two network hops") with placement metadata; Meta calls its unit an **AI Zone**, a two-stage Clos of rack switches (copper in the rack, shallow buffers) and cluster switches (deep buffers, single-mode fiber and 400G pluggables), joined across a building by an aggregation layer that is oversubscribed by design, so the scheduler places jobs to minimize traffic across zones ([Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#scoring-packing-against-spreading)). Topology-aware placement is part of the network design, not an afterthought.

### Why AI traffic breaks ordinary Ethernet

Training runs collectives (all-reduce, all-gather, all-to-all) through a library such as NCCL, in lockstep: every GPU waits for the slowest. That produces exactly the traffic ordinary fabrics handle worst: few, large, synchronized flows with little entropy for ECMP's hash, incast when many senders converge on one receiver, and a job whose speed is set by its tail latency. AWS's SRD paper makes the bulk-synchronous point directly: one late packet stalls the whole computation. Three families of answers exist: a lossless fabric with switch-computed routes (InfiniBand), lossless Ethernet with congestion control (RoCE v2), and a lossy fabric with packet spraying and reliability in the NIC (SRD, Falcon, Spectrum-X, Ultra Ethernet, MRC).

### InfiniBand

InfiniBand is a complete network stack, not just a link. The IBTA describes "a channel-based, switched fabric" with reliable messaging and RDMA "without software intervention in the data movement path," measured end-to-end delays of 600 ns, and "fully redundant and lossless I/O fabrics" with link-layer multipathing: flow control at the link layer keeps switches from dropping packets under congestion. A **subnet manager** (OpenSM is the open implementation) must run for each subnet to "scan the IB fabric, initialize it, and sweep occasionally for changes," and computes forwarding with a routing engine chosen for the topology (`minhop` by default, `updn` for fabrics that aren't pure fat-trees, `ftree` for symmetrical fat-trees). **Partitions**, each identified by a partition key (P_Key) in `/etc/opensm/partitions.conf`, group ports for isolation on a shared fabric, which is how Nebius gives each cluster its own partition.

The speed generations, from the IBTA's roadmaps (per-lane signaling, and 4x port bandwidth per direction; years are read off the roadmap charts, so they are approximate):

| Generation | Per lane | 4x port | About |
| --- | --- | --- | --- |
| SDR | 2.5 Gb/s | 10 Gb/s signaling | 2000 (first specification) |
| DDR | 5 Gb/s | 20 Gb/s | 2005 |
| QDR | 10 Gb/s | 40 Gb/s | 2008 |
| FDR | 14 Gb/s | 56 Gb/s | 2011 |
| EDR | 26 Gb/s signaling | 100 Gb/s data | 2014 |
| HDR | | 200 Gb/s | 2018 (Quantum switches unveiled November 2016) |
| NDR | | 400 Gb/s | 2021 (announced November 16, 2020; Quantum-2 November 9, 2021) |
| XDR | | 800 Gb/s | 2024 (Quantum-X800, March 18, 2024) |
| GDR | | 1.6 Tb/s | about 2027 (roadmap) |
| LDR | | 3.2 Tb/s | about 2030 (roadmap) |

Mellanox's HDR Quantum switch offered 40 ports of 200G (or 80 of 100G), 16 Tb/s, at a stated 90 ns latency; NVIDIA's Quantum-2 switch offers "64 ports at 400Gbps or 128 ports at 200Gbps"; Quantum-X800 pairs the Q3400 switch with the ConnectX-8 SuperNIC at "end-to-end 800Gb/s," with Azure, OCI and CoreWeave named as adopters.

**SHARP** (Scalable Hierarchical Aggregation and Reduction Protocol) moves reductions into the switches: instead of every GPU exchanging its partial sums, switches add them as they pass through and return the result, cutting the data each endpoint sends. It first shipped in Switch-IB 2 (EDR, 7 Tb/s, 90 ns port-to-port), introduced in 2015 to 2016; NVIDIA's XDR generation claims 9x the in-network compute of the previous one (14.4 TFLOPS) with SHARPv4 and FP8 support through NCCL. CoreWeave describes its InfiniBand fabrics as "fully SHARP compliant."

The IBTA, whose steering committee is now HPE, IBM, Intel and NVIDIA, "defines and maintains the InfiniBand and RoCE specifications." In practice InfiniBand switches and NICs come from NVIDIA, which is both its strength (one tested stack, short lead times on NVIDIA hardware, SHARP included) and its main risk.

### RDMA and RoCE v2

RDMA lets a NIC read and write another machine's memory directly, bypassing both kernels, which is how GPUs exchange buffers (GPUDirect RDMA) without involving the CPU. **RoCE v2** carries the InfiniBand transport over UDP and IP, so it routes across an ordinary Layer 3 Ethernet fabric. Its transport assumes the network almost never drops packets, because its recovery from loss is expensive, so RoCE fabrics are made **lossless**:

- **PFC** (Priority Flow Control) lets a switch tell its upstream neighbor to pause one traffic class when a buffer fills. It prevents drops and causes head-of-line blocking (a paused class stops every flow in it, not only the congested one), congestion spreading upstream, unfairness and, in rare topologies, deadlock.
- **ECN** marks packets at a congested switch instead of dropping them, and the receiver tells the sender to slow down.
- **DCQCN** (SIGCOMM 2015, Microsoft and Mellanox) is end-to-end ECN-based congestion control for RoCE v2, implemented in Mellanox NICs and deployed at Microsoft, so that senders slow down before PFC has to pause links.
- A **PFC watchdog** breaks pause storms: Meta's trips on pauses longer than 200 ms.

AWS explained in its SRD paper why it didn't adopt RoCE: PFC "is not feasible on large-scale networks, because it creates head-of-the-line blocking, congestion spreading, and occasional deadlocks," published fixes "relied on datacenter size significantly smaller than that of AWS datacenters," and RoCE would still suffer ECMP collisions.

### Meta's RoCE at scale

Meta's SIGCOMM 2024 paper, "RDMA over Ethernet for Distributed AI Training at Meta Scale," is the most complete public operating record of a large RoCE fabric, and its two 24,576-GPU H100 clusters (March 2024) put a RoCE fabric (Arista 7800 with Wedge400 and Minipack2 rack switches) beside an InfiniBand one (NVIDIA Quantum-2), both at 400 Gbps per endpoint, used for Llama 3. Small clusters reached more than 90% communication utilization out of the box; large ones started between 10% and 90% and returned above 90% after scheduler, routing and NCCL work. Meta's reasons for RoCE: the RDMA verbs its training code already used, reuse of its Clos designs and tools, and open standards with several vendors.

What it took, from the paper:

- **Routing.** Default ECMP performed poorly on low-entropy traffic, and pinning paths hurt by more than 30% under partial allocation, so Meta first built the backend at 1:2 undersubscription, then hashed on the RoCE destination queue pair with **QP scaling** in the collective library (up to 40% faster all-reduce) and reduced capacity to 1:1.125 with traffic engineering.
- **Congestion.** DSCP-based PFC with a single lossless queue. Meta ran DCQCN at 200G and **dropped it at 400G** because tuning was hard and it hit firmware and congestion-notification counting issues, running over a year on PFC alone plus NCCL's receiver-driven clear-to-send admission control, with a high-priority queue for those control packets; it saw no persistent PFC from cluster switches to rack switches in four years.
- **Libraries.** NCCL tuning (tree or rail-based all-to-all, the LL128 protocol) and eliminating the zero-byte messages that Ethernet switches don't support but InfiniBand does.

### AWS EFA and SRD

The Elastic Fabric Adapter, previewed at re:Invent 2018 and generally available on April 29, 2019, is ENA plus OS bypass through **libfabric**, first on c5n.18xlarge and p3dn.24xlarge, for MPI (Open MPI 3.1.3+) and NCCL (2.3.8+ with the OFI plugin); AWS reported 15.5 µs one-way MPI latency in a cluster placement group at launch. Underneath is **SRD** (Scalable Reliable Datagram), described by Shalev, Ayoub, Bshara and Sabbag in IEEE Micro in 2020. SRD is reliable but **out of order**, leaving ordering to upper layers because "strict in-order delivery is often not necessary"; the sender **sprays** packets of even a single flow across many ECMP paths by varying the encapsulation, measures each path's round-trip time and steers away from overloaded ones; and it runs in the Nitro card to minimize jitter. The paper's numbers set the scale: a data center's best-case round trip "could be as good as 25 µs," while TCP latency outliers under congestion or link faults run "between 50 ms and several seconds," with a 50 ms minimum retransmission timeout, and routing-update convergence takes "2–3 orders of magnitude longer" than SRD's path steering. Because reliability lives in the NIC, the fabric doesn't need PFC. EFA is offered "at no additional cost" on supported instances.

### Spectrum-X, Ultra Ethernet and MRC

**Spectrum-X** (May 28, 2023) is NVIDIA's Ethernet answer to its own InfiniBand: Spectrum-4 switches tightly coupled with BlueField-3 SuperNICs, with adaptive routing that sprays packets and the NIC reordering them in host memory; NVIDIA claims "1.7x better overall AI performance and power efficiency" against an unnamed baseline, and storage read-bandwidth gains of 20% to 48% over RoCE v2 in its own tests (vendor benchmarks). Spectrum-X800 (SN5600, 800G) was announced on March 18, 2024.

The **Ultra Ethernet Consortium** was announced on July 19, 2023 as a Joint Development Foundation project at the Linux Foundation, founded by AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta and Microsoft with physical, link, transport and software working groups. Its Ultra Ethernet Transport (UET), described in an August 2024 update, uses **packet spraying** with congestion feedback, profiles named AI Base, AI Full and HPC, sender-window congestion control on RTT, ECN and loss with optional **receiver-granted credits** for incast, **Link Level Retry** negotiated through LLDP, and **ephemeral connections** with no handshake, with software "based on libfabric v2.0 APIs." Specification 1.0 was published on June 11, 2025, followed by 1.0.1 (September 5, 2025), 1.0.2 (January 28, 2026), 1.0.3 (July 16, 2026) and **1.1 (October 12, 2026)**, the current version. As of October 2026 the UEC has no compliance or certification program: its FAQ says only that it "may also pursue compliance and interop programs," and its specification page names no compliant products. So no NIC is "UEC compliant." AMD calls its Pensando Pollara 400 (October 10, 2024) "the industry's first UEC-ready AI NIC," and "UEC-ready" is the accurate term.

**MRC** (Multipath Reliable Connection) extends RoCE v2 with per-packet multipath and sender-based congestion control over best-effort Ethernet, announced by OpenAI on May 5, 2026, which released it through the Open Compute Project with AMD, Broadcom, Intel, Microsoft and NVIDIA as partners, and described in an arXiv paper of June 2026; NVIDIA wrote on May 6, 2026 that Microsoft's Fairwater and OCI's Abilene site rely on it. Microsoft's own Fairwater post (November 12, 2025) describes "packet trimming, packet spray and high-frequency telemetry" on SONiC without naming the protocol.

The direction is the same in every Ethernet design since SRD: accept loss and reordering in the fabric, spray packets across all paths, and put reliability and congestion control in the NIC. Google's Falcon does it in the IPU; AWS did it in Nitro in 2019.

### Who uses which

Dell'Oro reported on March 10, 2026 that in 2025 Ethernet switch sales in AI back-end networks more than tripled, were "over two-thirds" of data center switch sales in AI clusters, and more than doubled InfiniBand's, with Celestica and NVIDIA about half of AI Ethernet combined, Arista third, 800G the large majority, and 1.6T switches expected in the second half of 2026. Two years before, by Dell'Oro's December 2025 account, InfiniBand "accounted for nearly 80% of the data center switch sales in AI back-end networks." NVIDIA's filings show the scale of the business without splitting fabrics: networking revenue was $31,376 million in fiscal 2026 (up 142%), about 16% of its data center revenue, driven by the "NVLink compute fabric for GB200 and GB300 systems" and "the growth of Ethernet and InfiniBand platforms," so the figure includes scale-up NVLink switches and isn't a scale-out market number.

### Optics and power

At these speeds the transceivers are a power line item. At GTC on March 19, 2025, Jensen Huang put six pluggable transceivers per GPU at about 180 W and $6,000, and "a million GPUs [need] 6 million transceivers [consuming] 180 megawatts." NVIDIA's answer is co-packaged optics in its Quantum-X Photonics and Spectrum-X Photonics switches (announced March 18, 2025, with vendor claims of 3.5x better power efficiency); Broadcom offers a co-packaged option on Tomahawk 6; Google's optical circuit switches survive speed upgrades; Meta keeps copper inside the rack. Meta's F16, designed under fixed regional power with 100G optics, was the 2019 version of the same constraint, and power and cooling are the building's limit before they are the network's ([The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation)).

## The Alternatives

Fabric topologies:

| | Electrical leaf-spine Clos | Optical circuit switched (Google) | Rail-optimized fat-tree (AI back end) |
| --- | --- | --- | --- |
| Optimizes | Uniform any-to-any bandwidth, simple ECMP | Capex and power; rate-agnostic upgrades | Same-rank collectives in one hop |
| Requires | Merchant silicon, eBGP, ECMP | Traffic and topology engineering, central SDN | Topology-aware scheduler and collective library |
| Failure modes | ECMP collisions; spines and optics scale with bisection | Custom hardware and control software only one operator has published | Cost of full scalable units even when partly used; one job per rail set |
| Ownership | Many vendors and open NOS (SONiC) | In-house | NVIDIA reference designs, provider variants |
| Who uses it | Nearly every provider | Google | NVIDIA, Google, Meta, CoreWeave and others |

AI transports:

| | InfiniBand | RoCE v2 on lossless Ethernet | AWS EFA and SRD | Ultra Ethernet (UET) |
| --- | --- | --- | --- | --- |
| Loss model | Lossless by link-level flow control | Lossless by PFC, with ECN and DCQCN | Lossy fabric; the NIC retransmits | Lossy, or Link Level Retry; reliability in the NIC |
| Multipath | Adaptive routing in switches | ECMP hash with QP scaling, or vendor adaptive routing (Spectrum-X) | Per-packet spraying by the sender | Packet spraying by design |
| Ordering | In order | In order | Out of order, reordered above | Per profile and delivery mode |
| In-network compute | SHARP | Vendor-specific | None | Not a 1.0 feature on public pages |
| Tenancy | Partitions (P-Keys) | VPC or VRF; Google uses a dedicated RoCE VPC | VPC-native | Ethernet and IP native |
| Vendors | Effectively NVIDIA | Many NICs and switches | AWS only | Many members; specification at 1.1, no compliance program, "UEC-ready" NICs |
| Public record | Azure ND, CoreWeave, Nebius, Lambda, Meta's IB cluster | Meta (SIGCOMM 2024), Google A3 Ultra and A4, OCI | AWS since 2019 | Little yet |

Virtual network dataplanes:

| | Software virtual switch on host cores | Programmable switch with SmartNIC offload | Dedicated card owns all I/O |
| --- | --- | --- | --- |
| Example | Google Andromeda | Azure VFP and AccelNet | AWS Nitro |
| Strengths | Upgradable weekly; live migration across NICs | Software policy, hardware speed | Host CPU entirely the customer's; hypervisor has no network stack; bare metal possible |
| Costs | Host cores reserved for the provider | FPGA or ASIC development | A custom card per generation |
| Available to others as | Open vSwitch and DPDK | Commercial SmartNICs | Commercial DPUs (BlueField, Pensando, Intel IPUs) |

## My Default

My default for a provider that isn't a hyperscaler is a merchant-silicon leaf-spine fabric with eBGP and ECMP as RFC 7938 describes, running SONiC or a commercial network operating system, at 2:1 or 3:1 oversubscription for general-purpose racks; VXLAN or Geneve overlays with the virtual switch offloaded to a DPU on every new host, so host cores are sellable and the tenant boundary sits outside the guest; and stateful, allow-only security groups as the tenant's primary control, with stateless subnet ACLs as an optional guard rail. Bare-metal customers get a VLAN-based private network, as Hetzner and OVHcloud sell it, until there is demand for more.

For GPU clusters, I'd build a physically separate, non-blocking, rail-optimized back end per scalable unit with one NIC per GPU. I'd pick InfiniBand for multi-tenant clusters of up to a few thousand GPUs on NVIDIA hardware, because P-Key isolation, SHARP and a tested stack come with it and that is what the mid-size GPU clouds above publicly run. I'd pick Ethernet (RoCE v2 today, with a NIC that sprays and reorders, and UET as "UEC-ready" NICs and specification revisions mature) when the operator already runs an Ethernet fabric and tooling, wants more than one vendor, or plans to train across buildings, which is where Meta, Google, OCI and Microsoft have gone. I wouldn't design my own transport without designing my own NIC, as AWS and Google did. I'd read Dell'Oro's 2025 shift as evidence that Ethernet is now the default for the largest buyers, not that InfiniBand is wrong for a mid-size GPU cloud.

What would change it: a customer base that is all training at the largest scale (Ethernet, built like Meta's), a fleet small enough that one vendor's turnkey stack is worth its premium (InfiniBand end to end, including the front end where the vendor supports it), or a hyperscaler's volume, at which point the custom card and transport pay for themselves.

## How to Build It

The chapter adds side tables for networks, subnets, security groups, interconnects and placement groups to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), and one new kind, `security_group`. The core already has `network`, `subnet`, `interconnect`, `placement_group` and `ip_address` kinds and `resource_identifiers` for addresses; physical cross-connects are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it)'s, and the switches themselves are `hardware_assets` of class `switch` from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it).

```sql
-- resources.kind gains 'security_group'

CREATE TABLE networks (                  -- side table: kind = 'network'
  resource_id    UUID PRIMARY KEY REFERENCES resources (id),
  network_type   TEXT NOT NULL CHECK (network_type IN ('vpc', 'private_vlan', 'rdma_backend',
                   'ib_partition')),
  scope          TEXT NOT NULL CHECK (scope IN ('zonal', 'regional', 'global')),
  ipv4_cidrs     CIDR[],                 -- null for an InfiniBand partition
  ipv6_prefix    CIDR,
  encapsulation  TEXT NOT NULL CHECK (encapsulation IN ('vxlan', 'geneve', 'ip_in_ip', 'vlan',
                   'infiniband', 'none')),
  segment_id     BIGINT NOT NULL,        -- VNI, VLAN ID or P-Key; never shown to the customer
  mtu            SMALLINT NOT NULL,      -- tenant MTU after encapsulation overhead
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (network_type <> 'ib_partition' OR encapsulation = 'infiniband')
);
CREATE UNIQUE INDEX networks_segment_unique ON networks (encapsulation, segment_id);
-- per fabric in practice; one global index is the simple version

CREATE TABLE subnets (                   -- side table: kind = 'subnet', parent_id = the network
  resource_id    UUID PRIMARY KEY REFERENCES resources (id),
  network_id     UUID NOT NULL REFERENCES resources (id),
  cidr           CIDR NOT NULL,          -- inside one of the network's ranges
  egress_mode    TEXT NOT NULL CHECK (egress_mode IN ('internet_gateway', 'nat', 'none')),
  network_acl    JSONB,                  -- ordered stateless rules; optional guard rail
  EXCLUDE USING GIST (network_id WITH =, cidr inet_ops WITH &&)  -- no overlapping subnets
);

CREATE TABLE security_groups (           -- side table: kind = 'security_group'
  resource_id    UUID PRIMARY KEY REFERENCES resources (id),
  network_id     UUID NOT NULL REFERENCES resources (id),
  name           TEXT NOT NULL,
  UNIQUE (network_id, name)
);

CREATE TABLE security_group_rules (      -- allow-only, stateful; effective-dated, never edited
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  security_group_id   UUID NOT NULL REFERENCES resources (id),
  direction           TEXT NOT NULL CHECK (direction IN ('ingress', 'egress')),
  protocol            TEXT NOT NULL CHECK (protocol IN ('tcp', 'udp', 'icmp', 'icmpv6', 'all')),
  ports               INT4RANGE,         -- null for 'all' or ICMP
  remote_cidr         CIDR,
  remote_group_id     UUID REFERENCES resources (id),  -- another security group
  description         TEXT,
  valid_during        TSTZRANGE NOT NULL,
  created_by          TEXT NOT NULL,     -- typed actor: user, API key, provider abuse action
  CHECK (num_nonnulls(remote_cidr, remote_group_id) = 1)
);

CREATE TABLE security_group_attachments (  -- which interfaces a group applies to, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  security_group_id  UUID NOT NULL REFERENCES resources (id),
  target_id          UUID NOT NULL REFERENCES resources (id),  -- a VM, server or load balancer
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (security_group_id WITH =, target_id WITH =, valid_during WITH &&)
);

CREATE TABLE interconnects (             -- side table: kind = 'interconnect'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  interconnect_type TEXT NOT NULL CHECK (interconnect_type IN ('peering', 'transit_attachment',
                     'private_endpoint', 'vpn', 'dedicated_port', 'hosted_connection')),
  network_id       UUID NOT NULL REFERENCES resources (id),
  peer_ref         TEXT NOT NULL,        -- the other network, hub, service or customer site
  peer_account_id  UUID REFERENCES accounts (id),  -- when the peer is another tenant
  bandwidth_mbps   INT,
  cross_connect_id UUID REFERENCES resources (id), -- kind = 'cross_connect', for a dedicated port
  status           TEXT NOT NULL CHECK (status IN ('requested', 'pending_acceptance', 'active',
                     'down', 'deleted'))
);

CREATE TABLE placement_groups (          -- side table: kind = 'placement_group'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  strategy         TEXT NOT NULL CHECK (strategy IN ('cluster', 'partition', 'spread',
                     'precision_time', 'gpu_fabric')),
  partition_count  SMALLINT,             -- partition strategy
  max_per_failure_domain SMALLINT,       -- spread strategy
  fabric_ref       TEXT,                 -- the back-end fabric or scalable unit, for gpu_fabric
  ib_partition_id  UUID REFERENCES resources (id), -- the tenant's InfiniBand partition network
  rail_aligned     BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK ((strategy = 'partition') = (partition_count IS NOT NULL))
);
```

Notes on the sketch:

- **The segment ID is the tenant boundary.** A VNI, VLAN ID or P-Key maps exactly one tenant network; the unique index makes it impossible to hand the same segment to two networks, and the value never leaves the provider's side of the API.
- **Rules are rows with ranges.** A security group rule is never edited: a change ends one row's range and starts another, so "was port 22 open to the internet on this instance at 03:10" is a query over rules and attachments, which is what an incident review or an abuse complaint asks. The stateless subnet ACL is kept as ordered JSON because order is its semantics and it is evaluated as a whole.
- **Interconnects cross tenants.** Peering and endpoints can join two accounts' networks; `peer_account_id` and `pending_acceptance` make the second party's consent a state, and a dedicated port points at the physical cross-connect it rides on.
- **AI fabrics are networks and placements.** An InfiniBand partition is a `network` of type `ib_partition` with its P-Key as the segment; a GPU cluster is a `placement_group` of strategy `gpu_fabric` naming the scalable unit and partition, which is how GPU instances join a fabric only at creation. Capacity reservations in a fabric are [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#buying-capacity)' commitments.
- **Meters sit at the boundaries.** `usage_events` meters for this chapter are `network.nat_processed_bytes`, `network.cross_zone_bytes`, `network.transit_processed_bytes`, `network.endpoint_processed_bytes` and `ipv4.address_hours`, alongside the core's `egress.bytes`; traffic inside a network and on the AI back end produces none.
- **Events:** `network.created`, `subnet.created`, `security_group.rule_added`, `security_group.rule_removed`, `security_group.attached`, `interconnect.requested`, `interconnect.accepted`, `interconnect.down` and `placement_group.capacity_unavailable` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the dataplane programmer, billing, the customer's audit log and the abuse desk.

## Auditing

- **Every rule and attachment, with its range and actor.** The firewall a customer had at any instant, reconstructable from rows, because a breach investigation starts with "what was exposed" ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Every cross-tenant connection.** Who requested and who accepted each peering, endpoint or attachment, because joining two customers' networks is a decision both made.
- **Who held which address on which network.** Private and public addresses in `resource_identifiers`, since abuse and law enforcement requests name an IP and a time.
- **Provider-side changes to tenant networks.** An abuse mitigation that blocks a port or detaches a group is a provider action on the customer's resource and belongs in the case record with the rule rows it created.

## What This Means for the System You Build

- **Build the fabric from identical merchant-silicon switches** with eBGP and ECMP, and treat oversubscription as a priced design choice.
- **Give every tenant network its own segment ID,** never shared, never shown to the customer.
- **Make security groups allow-only, stateful and effective-dated,** with group references instead of addresses, and keep subnet ACLs as an optional stateless layer.
- **Move the virtual switch into a card the guest can't reach** when the fleet is large enough, so host CPUs are sellable and isolation is out of band.
- **Meter at the boundaries** (NAT, cross-zone, transit, endpoints, IPv4) and leave intra-network and back-end traffic free.
- **Keep the AI back end physically separate,** rail-optimized and non-blocking, with one NIC per GPU, and treat job placement as part of the network.
- **Choose InfiniBand or Ethernet deliberately,** by cluster size, vendor tolerance and cross-building ambition, and describe Ultra Ethernet hardware as "UEC-ready," not compliant.

## References

**Papers and standards**

- [Al-Fares, Loukissas and Vahdat: A Scalable, Commodity Data Center Network Architecture](https://www.cs.princeton.edu/courses/archive/fall10/cos597B/papers/fattree-sigcomm08.pdf), SIGCOMM 2008, tree oversubscription, the switch cost model and the fat-tree
- [Greenberg et al.: VL2: A Scalable and Flexible Data Center Network](https://www.microsoft.com/en-us/research/publication/vl2-a-scalable-and-flexible-data-center-network/), SIGCOMM 2009, Valiant Load Balancing, address separation and the 2.7 TB shuffle
- [Singh et al.: Jupiter Rising](https://research.google/pubs/jupiter-rising-a-decade-of-clos-topologies-and-centralized-control-in-googles-datacenter-network/), SIGCOMM 2015, five generations and more than 1 Pbps
- [Poutievski et al.: Jupiter Evolving](https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/), SIGCOMM 2022, OCS, 30% capex and 41% power reductions and direct block paths
- [Jouppi et al.: TPU v4](https://arxiv.org/abs/2304.01433), ISCA 2023, OCS-reconfigured tori and their share of cost and power
- [RFC 7938: Use of BGP for Routing in Large-Scale Data Centers](https://www.rfc-editor.org/rfc/rfc7938.html), August 2016, folded Clos, eBGP-only routing and the ASN plan
- [RFC 7348: VXLAN](https://www.rfc-editor.org/rfc/rfc7348.html), August 2014, the 24-bit VNI, UDP 4789 and its motivation
- [RFC 8926: Geneve](https://www.rfc-editor.org/rfc/rfc8926.html), November 2020, Standards Track encapsulation with options
- [Dalton et al.: Andromeda](https://www.usenix.org/conference/nsdi18/presentation/dalton), NSDI 2018, the Fast Path budget, Hoverboards, flow programming and migration blackouts
- [Firestone: VFP](https://www.usenix.org/conference/nsdi17/technical-sessions/presentation/firestone), NSDI 2017, host SDN on more than a million hosts
- [Firestone et al.: Azure Accelerated Networking](https://www.usenix.org/conference/nsdi18/presentation/firestone), NSDI 2018, FPGA SmartNICs since late 2015, latency and throughput
- [Zhu et al.: Congestion Control for Large-Scale RDMA Deployments (DCQCN)](https://www.microsoft.com/en-us/research/publication/congestion-control-for-large-scale-rdma-deployments/), SIGCOMM 2015, PFC's problems and ECN-based control
- [Gangidi et al.: RDMA over Ethernet for Distributed AI Training at Meta Scale](https://engineering.fb.com/wp-content/uploads/2024/08/sigcomm24-final246.pdf), SIGCOMM 2024, AI Zones, routing, undersubscription, PFC without DCQCN and NCCL changes
- [Shalev et al.: A Cloud-Optimized Transport Protocol for Elastic and Scalable HPC (SRD)](https://www.amazon.science/publications/a-cloud-optimized-transport-protocol-for-elastic-and-scalable-hpc), IEEE Micro 2020, out-of-order reliable delivery, spraying and the case against RoCE; [full text](https://cdn.amazon.science/a6/34/41496f64421faafa1cbe301c007c/a-cloud-optimized-transport-protocol-for-elastic-and-scalable-hpc.pdf) for the 25 µs and 50 ms figures
- [MRC: Multipath Reliable Connection (arXiv)](https://arxiv.org/abs/2606.18170), June 2026
- [InfiniBand Trade Association: About InfiniBand](https://infinibandta.org/about-infiniband/), switched fabric, RDMA, 600 ns end-to-end and lossless fabrics with link-layer multipathing
- [opensm(8)](https://manpages.org/opensm/8), the subnet manager's role, partitions and routing engines
- [InfiniBand Trade Association: About](https://www.infinibandta.org/about-the-ibta/), founding in 1999, the steering committee and stewardship of the InfiniBand and RoCE specifications
- [IBTA FAQ, 2001 (Wayback copy)](http://web.archive.org/web/20010627141414/http://www.infinibandta.org:80/faq/index.html), the FIO and NGIO promoters and the seven steering companies
- [IBTA, 2002 (Wayback copy)](http://web.archive.org/web/20020311212440/http://www.infinibandta.org:80/ibta/), the specification completed in October 2000 at data rates starting at 2.5 Gbps
- [IBTA: InfiniBand roadmap, 2011 (Wayback copy)](http://web.archive.org/web/20120205182452/http://www.infinibandta.org/content/pages.php?pg=technology_overview), per-lane rates from SDR to EDR
- [IBTA: InfiniBand roadmap (current)](https://www.infinibandta.org/wp-content/uploads/2024/07/IBTA-roadmap-10_02_23_future_No-Confidential-Notice.jpg), EDR to LDR port bandwidths
- [IBTA: RoCE v2 specification released](https://infinibandta.org/infiniband-trade-association-releases-updated-specification-for-remote-direct-memory-access-over-converged-ethernet-roce/), September 16, 2014, and RoCE in April 2010
- [IBTA: RoCE v2 announcement deck](https://www.slideshare.net/slideshow/ibta-ro-cev2-announcementpress-deckfinal20140911/39155402), Layer 3 routing through UDP headers
- [Ultra Ethernet Consortium: Specification](https://ultraethernet.org/specification), versions 1.0 to 1.1 and their dates
- [Ultra Ethernet Consortium](https://ultraethernet.org/), the FAQ's wording on compliance programs
- [Ultra Ethernet Consortium: UET update (August 2024)](https://ultraethernet.org/?p=800), packet spraying, profiles, congestion control, Link Level Retry, ephemeral connections and libfabric
- [UALink 200G 1.0 specification release](https://ualinkconsortium.org/wp-content/uploads/2025/04/UALink-1.0-Specification-PR_FINAL.pdf), April 8, 2025, 1,024 accelerators and the board members

**Filings**

- [NVIDIA: CFO commentary, Q4 and fiscal 2026 (8-K)](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000019/q4fy26cfocommentary.htm), networking revenue and its drivers

**Provider documentation**

- [AWS: Default VPCs](https://docs.aws.amazon.com/vpc/latest/userguide/default-vpc.html), one per region with a public subnet per zone
- [AWS: Infrastructure security in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html), security groups compared with network ACLs
- [AWS: EC2 instance network bandwidth](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html), bandwidth by size, burst credits, single-flow caps and gateway limits
- [AWS: Placement strategies](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html), cluster, partition, spread and precision-time groups
- [AWS: The components of the Nitro System](https://docs.aws.amazon.com/whitepapers/latest/security-design-of-aws-nitro-system/the-components-of-the-nitro-system.html), Nitro Cards, the Nitro Controller, ENA and VPC encryption
- [AWS: The Nitro System journey](https://docs.aws.amazon.com/whitepapers/latest/security-design-of-aws-nitro-system/the-nitro-system-journey.html), the full Nitro System with C5
- [AWS: Elastic Fabric Adapter](https://aws.amazon.com/hpc/efa/), no additional cost and NCCL support
- [AWS: P5 instances](https://aws.amazon.com/ec2/instance-types/p5/), 3,200 Gbps EFA, NVSwitch bandwidth and UltraClusters
- [AWS: P6 instances](https://aws.amazon.com/ec2/instance-types/p6/), p6-b300 at 6.4 Tbps and the 28.8 Tbps p6e-gb200 UltraServer
- [AWS: VPC pricing](https://aws.amazon.com/vpc/pricing/), NAT gateway, public IPv4 and cross-zone peering prices
- [AWS: Transit Gateway pricing](https://aws.amazon.com/transit-gateway/pricing/), attachment-hours and data processing
- [AWS: PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/), interface endpoint hours and data processing
- [Microsoft Learn: Azure Boost overview](https://learn.microsoft.com/en-us/azure/azure-boost/overview), MANA, storage offload, Cerberus and Rust
- [Microsoft Learn: ND H100 v5 series](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/ndh100v5-series), a dedicated 400 Gbps InfiniBand connection per GPU and 3.2 Tbps per VM
- [Microsoft Learn: Virtual machine network throughput](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-machine-network-throughput), egress-only limits and flow counts
- [Google Cloud: Network bandwidth](https://docs.cloud.google.com/compute/docs/network-bandwidth), per-vCPU egress, Tier_1, per-flow and inbound limits
- [Google Cloud: GPU network bandwidth](https://docs.cloud.google.com/compute/docs/gpus/gpu-network-bandwidth), A3 Ultra, A4 and A4X NICs and bandwidth, the RoCE VPC and MTU
- [Google Cloud: AI Hypercomputer networking overview](https://docs.cloud.google.com/ai-hypercomputer/docs/networking-overview), rail alignment, sub-blocks and blocks
- [NVIDIA: DGX SuperPOD H100 network fabrics](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/network-fabrics.html), four networks, rail-optimized scalable units and switch counts
- [NVIDIA: NVLink and NVLink Switch](https://www.nvidia.com/en-us/data-center/nvlink/), per-GPU bandwidth by generation and NVL72 domains
- [NVIDIA: A100](https://www.nvidia.com/en-us/data-center/a100/), 600 GB/s NVLink
- [NVIDIA: BlueField DPUs](https://www.nvidia.com/en-us/networking/products/data-processing-unit/), BlueField-3 and BlueField-4 bandwidth and offloads
- [CoreWeave: HPC interconnect](https://docs.coreweave.com/products/networking/hpc-interconnect/about-hpc-interconnect), InfiniBand fat-trees, SHARP and Spectrum-X on GB300
- [Lambda: 1-Click Clusters](https://lambda.ai/1-click-clusters), InfiniBand-connected B200 clusters
- [Nebius: GPU clusters](https://docs.nebius.com/compute/clusters/gpu), fabrics and per-cluster InfiniBand partition keys
- [Nebius: Compute](https://www.nebius.com/services/compute), 400 Gbps InfiniBand per GPU
- [Hetzner: vSwitch](https://docs.hetzner.com/robot/dedicated-server/network/vswitch/), VLAN IDs, limits, MTU and traffic pricing
- [OVHcloud: vRack](https://www.ovhcloud.com/en/network/vrack/), private Layer 2 across regions and VLAN count

**Announcements and release notes**

- [AWS News Blog: Introducing Amazon VPC](https://aws.amazon.com/blogs/aws/introducing-amazon-virtual-private-cloud-vpc/), August 25, 2009, the beta's limits
- [AWS News Blog: EC2-Classic is retiring](https://aws.amazon.com/blogs/aws/ec2-classic-is-retiring-heres-how-to-prepare/), VPC-only accounts after December 4, 2013
- [AWS: PrivateLink for AWS services](https://aws.amazon.com/about-aws/whats-new/2017/11/introducing-aws-privatelink-for-aws-services/), November 8, 2017
- [AWS News Blog: PrivateLink for your own services](https://aws.amazon.com/blogs/aws/aws-privatelink-update-vpc-endpoints-for-your-own-applications-services/), November 28, 2017
- [AWS News Blog: Transit Gateway](https://aws.amazon.com/blogs/aws/new-use-an-aws-transit-gateway-to-simplify-your-network-architecture/), November 26, 2018, scale and attachments
- [AWS News Blog: C5 instances](https://aws.amazon.com/blogs/aws/now-available-compute-intensive-c5-instances-for-amazon-ec2/), November 6, 2017, networking and storage in hardware
- [All Things Distributed: Reinventing virtualization with Nitro](https://www.allthingsdistributed.com/2020/09/reinventing-virtualization-with-nitro.html), C3 in 2013, C4 in 2014 and Annapurna in early 2015
- [AWS News Blog: Elastic Fabric Adapter available](https://aws.amazon.com/blogs/aws/now-available-elastic-fabric-adapter-efa-for-tightly-coupled-hpc-workloads/), April 29, 2019, libfabric, first instances and MPI latency
- [AWS News Blog: ENA Express](https://aws.amazon.com/blogs/aws/new-ena-express-improved-network-latency-and-per-flow-performance-on-ec2/), November 28, 2022, SRD under TCP and UDP
- [AWS: P5 generally available](https://aws.amazon.com/about-aws/whats-new/2023/07/amazon-ec2-p5-instances-generative-ai-hpc-generally-available), July 26, 2023
- [AWS News Blog: P5 instances](https://aws.amazon.com/blogs/aws/new-amazon-ec2-p5-instances-powered-by-nvidia-h100-tensor-core-gpus-for-accelerating-generative-ai-and-hpc-applications/), 3,200 Gbps, eight times P4d
- [Google Cloud: Enter the Andromeda zone](https://cloud.google.com/blog/products/gcp/enter-andromeda-zone-google-cloud-platforms-latest-networking-stack), April 2, 2014
- [Google Cloud: The evolution of Google's Jupiter data center network](https://cloud.google.com/blog/topics/systems/the-evolution-of-googles-jupiter-data-center-network), August 2022, Apollo OCS replacing the spine and Google's comparative claims
- [Google Cloud: C3 machines with Google's custom Intel IPU](https://cloud.google.com/blog/products/compute/introducing-c3-machines-with-googles-custom-intel-ipu), October 11, 2022
- [Google Cloud: Introducing Falcon](https://cloud.google.com/blog/topics/systems/introducing-falcon-a-reliable-low-latency-hardware-transport/), October 17, 2023, the hardware transport and the E2000 IPU
- [Meta: Introducing data center fabric](https://engineering.fb.com/2014/11/14/production-engineering/introducing-data-center-fabric-the-next-generation-facebook-data-center-network/), November 14, 2014, pods, four planes and BGP
- [Meta: Reinventing Facebook's data center network (F16)](https://engineering.fb.com/2019/03/14/data-center-engineering/f16-minipack/), March 14, 2019, 16 planes on Tomahawk 3 and fixed regional power
- [Meta: Building Meta's GenAI infrastructure](https://engineering.fb.com/2024/03/12/data-center-engineering/building-metas-genai-infrastructure/), March 12, 2024, two 24,576-GPU clusters
- [Meta: RoCE networks for distributed AI training at scale](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/), August 5, 2024
- [Microsoft Azure: OCP 2016](https://azure.microsoft.com/en-us/blog/?p=4877), March 9, 2016, SONiC open-sourced and SAI accepted in July 2015
- [Linux Foundation: SONiC moves to the Linux Foundation](https://www.linuxfoundation.org/press/press-release/software-for-open-networking-in-the-cloud-sonic-moves-to-the-linux-foundation), April 14, 2022
- [Microsoft Azure: ND H100 v5 preview](https://azure.microsoft.com/en-us/blog/azure-previews-powerful-and-scalable-virtual-machine-to-help-customers-accelerate-ai/), March 13, 2023, InfiniBand per GPU in a non-blocking fat-tree
- [Microsoft: Infinite scale, the Azure AI superfactory](https://blogs.microsoft.com/blog/2025/11/12/infinite-scale-the-architecture-behind-the-azure-ai-superfactory/), November 12, 2025, Fairwater's Ethernet back end
- [OpenAI: MRC supercomputer networking](https://openai.com/index/mrc-supercomputer-networking/), May 5, 2026, Multipath Reliable Connection, its release through OCP and the partners
- [NVIDIA blog: MRC](https://blogs.nvidia.com/?p=92837), May 6, 2026, Fairwater and OCI Abilene
- [Oracle: OCI Zettascale cluster (Wayback copy)](http://web.archive.org/web/20251109203408/https://www.oracle.com/news/announcement/ocw24-oracle-offers-first-zettascale-cloud-computing-cluster-2024-09-11/), September 11, 2024, RoCE v2 or InfiniBand superclusters
- [Oracle: OCI Zettascale10 (Wayback copy)](http://web.archive.org/web/20260713070719/https://www.oracle.com/news/announcement/ai-world-oracle-unveils-next-generation-oci-zettascale10-cluster-for-ai-2025-10-14/), October 14, 2025, Acceleron RoCE and availability
- [Data Center Knowledge: Broadcom introduces Tomahawk](https://www.datacenterknowledge.com/business/broadcom-intros-strataxgs-tomahawk-switches-for-scale-out-data-centers), September 2014
- [Broadcom: Tomahawk II (press copy)](https://www.einpresswire.com/article/348858074/broadcom-first-to-deliver-64-ports-of-100ge-with-tomahawk-ii-6-4tbps-ethernet-switch), October 11, 2016
- [Broadcom: ships Tomahawk 3 (Wayback copy)](http://web.archive.org/web/20210307014500/https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawkr-3-industrys-highest-bandwidth-0), December 19, 2017
- [Broadcom: ships Tomahawk 4 (Wayback copy)](http://web.archive.org/web/20230908173129/https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-4-industrys-highest-bandwidth-ethernet), December 9, 2019
- [Broadcom: ships Tomahawk 5 (Wayback copy)](http://web.archive.org/web/20240613064153/https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-5-industrys-highest-bandwidth-switch), August 16, 2022, and the two-year doubling
- [Broadcom: Now shipping world's first 51.2 Tbps switch in production volume](https://investors.broadcom.com/news-releases/news-release-details/broadcom-now-shipping-worlds-first-512-tbps-switch-production), March 15, 2023
- [Broadcom: ships Tomahawk 6 (Wayback copy)](http://web.archive.org/web/20250725084830/https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-6-worlds-first-1024-tbps-switch), June 3, 2025
- [Broadcom: Tomahawk 6 in production volume (press copy)](https://mfn.se/all/a/broadcom/broadcom-now-shipping-worlds-first-102-4-tbps-switch-in-production-volume-efdafd93), March 12, 2026
- [Broadcom: Jericho3-AI (Wayback copy)](http://web.archive.org/web/20240913015640/https://investors.broadcom.com/news-releases/news-release-details/broadcom-unveils-industrys-highest-performance-fabric-ai), April 18, 2023
- [Broadcom: ships Jericho4 (Wayback copy)](http://web.archive.org/web/20250823131132/https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-jericho4-enabling-distributed-ai-computing-across), August 4, 2025
- [NVIDIA: Spectrum-X launch](https://nvidianews.nvidia.com/news/nvidia-launches-accelerated-ethernet-platform-for-hyperscale-generative-ai), May 28, 2023, Spectrum-4, BlueField-3 and the vendor claim
- [NVIDIA Developer: Accelerating AI storage with Spectrum-X](https://developer.nvidia.com/blog/accelerating-ai-storage-by-up-to-48-with-nvidia-spectrum-x-networking-platform-and-partners), February 4, 2025, the vendor benchmark
- [NVIDIA: Quantum-X800 and Spectrum-X800](https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Announces-New-Switches-Optimized-for-Trillion-Parameter-GPU-Computing-and-AI-Infrastructure/default.aspx), March 18, 2024, 800 Gb/s and SHARPv4
- [NVIDIA: Quantum-2](https://nvidianews.nvidia.com/news/nvidia-quantum-2-takes-supercomputing-to-new-heights-into-the-cloud), November 9, 2021, switch ports and ConnectX-7 and BlueField-3 sampling
- [NVIDIA: completes acquisition of Mellanox](https://nvidianews.nvidia.com/news/nvidia-completes-acquisition-of-mellanox-creating-major-force-driving-next-gen-data-centers), April 27, 2020
- [NVIDIA: Spectrum-X Photonics co-packaged optics](https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Announces-Spectrum-X-Photonics-Co-Packaged-Optics-Networking-Switches-to-Scale-AI-Factories-to-Millions-of-GPUs/), March 18, 2025
- [Mellanox: Switch-IB 2 (Business Wire copy)](https://www.businesswirechina.com/en/news/32931.html), July 2016, "the world's first smart switches" and SHArP
- [insideHPC: Mellanox announces Switch-IB 2](https://insidehpc.com/2015/11/slidecast-mellanox-announces-switch-ib2-on-the-road-to-exascale/), November 2015
- [TOP500: Mellanox unveils HDR InfiniBand](https://www.top500.org/news/mellanox-unveils-hdr-infiniband-lineup/), November 2016, Quantum switch ports and capacity
- [StorageReview: Mellanox unveils 200Gb/s HDR InfiniBand](https://www.storagereview.com/news/mellanox-unveils-200gb-s-hdr-infiniband-solutions), November 14, 2016, the 90 ns latency
- [ServeTheHome: NVIDIA Mellanox NDR 400Gbps InfiniBand announced](https://www.servethehome.com/nvidia-mellanox-ndr-400gbps-infiniband-announced/), November 16, 2020
- [Linux Foundation: Announcing the Ultra Ethernet Consortium](https://www.linuxfoundation.org/press/announcing-ultra-ethernet-consortium-uec), July 19, 2023, founders and working groups
- [Linux Foundation: UEC launches specification 1.0](https://www.linuxfoundation.org/press/uec-launches-spec-1.0), June 11, 2025
- [AMD: Instinct MI325X, Pensando Salina and Pollara 400](https://ir.amd.com/news-events/press-releases/detail/1220/amd-delivers-leadership-ai-performance-with-amd-instinct), October 10, 2024, "the industry's first UEC-ready AI NIC"
- [UALink Consortium: News](https://ualinkconsortium.org/news/), the May 30, 2024 promoter group and October 29, 2024 incorporation
- [optics.org: NVIDIA's plan to scale AI factories with co-packaged optics](https://www.optics.org/news/nvidia-reveals-plan-to-scale-ai-factories-with-co-packaged-optics), March 2025, transceiver power and cost per GPU

**In practice**

- [Dell'Oro: Ethernet more than doubles InfiniBand in AI scale-out networks in 2025](https://www.delloro.com/news/ethernet-more-than-doubles-size-of-infiniband-as-the-leading-fabric-for-ai-scale-out-networks-in-2025/), March 10, 2026
- [Dell'Oro: 2026 predictions for data center switching](https://www.delloro.com/2026-predictions-data-center-switch-frontend-ai-backed-networks/), December 2025, the "nearly 80%" InfiniBand baseline
</content>
</invoke>
