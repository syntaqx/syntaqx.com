+++
title = "Home Networks: Ethernet, Wi-Fi & Cabling"
nav_title = "Home Networks & Cabling"
description = "Ethernet, cabling, PoE, optics and Wi-Fi standards and limits, home versus data center, the path to a colo cage, and how to build an immaculate home internet."
category = "Hosting & Cloud Industry"
order = 2108
part = "Homelab"
tags = ["homelab", "ethernet", "wi-fi", "cabling", "poe", "bufferbloat", "failover"]
+++

A home network is the smallest instance of the thing every later part of this book scales up: a physical layer of copper, glass and radio, a few switches, one router, one way out to the internet. It runs the same IEEE 802.3 standards, the same SFP optics and the same 802.1Q VLANs as a data center, and it fails in ways a data center never does: one ISP, one router, a mesh of wireless hops through plaster walls, a gateway the ISP owns, and a queue in that gateway that turns a fast line into a slow one the moment anyone uploads a file. Most homes with a fast plan still have a bad connection, and nearly every cause is fixable with standard parts and an afternoon.

This chapter is the reference for the physical and link layers at home: the standards and their limits in comparison tables (Ethernet speeds, cable categories and run lengths, PoE budgets, optics and DACs, Wi-Fi generations, ISP handoffs, switch classes), what changes past 10G, where home differs from the data center and where it doesn't, and how a home rack grows into a colo cage and then a leaf-spine fabric. It ends with the payoff: an immaculate home internet is achievable, and the section on it lists what it takes. Routing, firewalls, VLAN policy and DNS are [Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls); exposing services is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services); upload limits, business lines and BGP are [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation). The Stack part picks up the same layers at provider scale in [Data Center Networking](/books/hosting-and-cloud/data-center-networking) and [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation).

## How the Vendors Do It

Home networking is sold in four tiers, and most homes mix them without meaning to.

| Tier | Examples | What you control | Where it fails |
| --- | --- | --- | --- |
| **ISP-supplied gateway** | Xfinity wireless gateway, AT&T fiber gateway, fixed-wireless 5G gateways | Wi-Fi name and password; on cable, a bridge mode; on AT&T fiber, IP Passthrough | Firmware, queueing and Wi-Fi placement are the ISP's; bridge mode turns off the ISP's management features |
| **Consumer mesh** | eero, TP-Link Deco, Netgear Orbi, ASUS (Asuswrt) | An app; on some models dual WAN or a cellular backup | Wireless backhaul between nodes; feature sets vary by model and some depend on a subscription |
| **Prosumer, controller-managed** | Ubiquiti UniFi, OpenWrt on consumer hardware, OPNsense or pfSense on a small x86 box with standalone access points | VLANs, SQM, multi-WAN, per-port PoE, monitoring | Your own configuration; vendor cloud accounts on some lines |
| **Used enterprise** | Data center switches and routers bought secondhand | Everything, at line rate | Fan noise, heat and power: a 1U switch drawing 150 W around the clock costs about $239 a year at the August 2026 US average residential rate |

Three patterns run through the tiers. **The standards are the same everywhere:** a $30 unmanaged switch and a data center top-of-rack switch speak the same 802.3 PHYs, and a home access point and an office one speak the same 802.11. **What you pay for is control:** VLANs, queue management, failover and monitoring move from absent to vendor-limited to complete as you go down the table. **The ISP box is the variable you control least,** which is why bridge mode and IP Passthrough appear in every serious home setup.

## How It Got Here

| Date | Milestone | What it solved, and what it cost |
| --- | --- | --- |
| 22 May 1973 | Metcalfe's Xerox PARC memo on the "Ether" | A shared medium for many machines; collisions on that medium for the next two decades |
| 28 Sep 1990 | IEEE 802.3i, 10BASE-T | Ethernet over unshielded twisted pair, star-wired to a hub instead of coax |
| 14 Jun 1995 | IEEE 802.3u, Fast Ethernet (100BASE-TX over two pairs of Cat 5) | 10x speed on the same star wiring; the Cat 5 standard most houses were later wired with |
| Jun 1999 | IEEE 802.3ab, 1000BASE-T | Gigabit over all four pairs of copper |
| Mar 2000 | IEEE 802.3ad, link aggregation (LACP), now maintained as 802.1AX | Bundling links for capacity and redundancy |
| Jun 2002 | IEEE 802.3ae, 10 Gb/s Ethernet (fiber) | 10G, at first only over glass |
| Jun 2003 / Sep 2009 | PoE: 802.3af, then 802.3at | Power and data on one cable for phones, cameras and access points |
| 8 Jun 2006 | IEEE 802.3an, 10GBASE-T | 10G over copper, at the price of new cable (Cat 6A) and hot PHYs |
| Jun 2010 | IEEE 802.3ba, 40 and 100 Gb/s | The data center's next steps, which reach homes as used gear a decade later |
| 30 Jun 2016 | IEEE 802.3by, 25 Gb/s; 802.3bq, 25G/40GBASE-T | 25G as the server link; copper at 25/40G only over very short runs |
| Jul 2016 | Category 8 published in ANSI/TIA-568-C.2-1 (CommScope's date) | Copper for 25/40GBASE-T, limited to 30 m |
| 22 Sep 2016 | IEEE 802.3bz, 2.5GBASE-T and 5GBASE-T | Multi-gig over the Cat 5e and Cat 6 already in the walls |
| 27 Sep 2018 | IEEE 802.3bt, four-pair PoE (Types 3 and 4) | Up to 71.3 W at the device |
| 3 Oct 2018 | Wi-Fi Alliance generational names: Wi-Fi 4, 5 and 6 | Buyers could compare 802.11n, ac and ax without reading amendments |
| 3 Jan 2020 | Wi-Fi 6E named | Wi-Fi 6 in the 6 GHz band |
| 23 Apr 2020 | FCC 20-51 opens 5.925 to 7.125 GHz for unlicensed use | 1,200 MHz of new spectrum, with low-power indoor use allowed across the whole band |
| 8 Jan 2024 | Wi-Fi CERTIFIED 7 | 320 MHz channels in 6 GHz, Multi-Link Operation, 4K QAM |
| 22 Jul 2025 | IEEE 802.11be-2024 published | The standard behind Wi-Fi 7 |

The same years shaped the queues. CoDel and FQ-CoDel were published as RFC 8289 and RFC 8290 in January 2018; RFC 8034 (February 2017) records that DOCSIS 3.1 requires cable modems to implement an active queue management algorithm, DOCSIS-PIE; the CAKE queue discipline shipped in Linux 4.19 on 22 October 2018, described by its developers as targeting home routers; and the L4S architecture (RFC 9330 to 9332, January 2023) became Comcast's Low Latency DOCSIS trials in June 2023 and its "ultra-low lag" launch in six markets on 29 January 2025. The physical layer got fast in the 2000s; the queueing got good in the 2010s; most home equipment still ships with the second half switched off.

## Copper: Speeds, Categories and Run Lengths

Twisted-pair Ethernet is a stack of PHY standards, each with a minimum cable it needs. The speed a run supports depends on the category of the whole channel (cable, jacks, patch cords) and its length.

| Category | Rated to | 1000BASE-T | 2.5G / 5GBASE-T (802.3bz) | 10GBASE-T | 25/40GBASE-T |
| --- | --- | --- | --- | --- | --- |
| **Cat 5e** | 100 MHz | 100 m | 2.5G to at least 100 m; 5G to 100 m on "defined use cases" | Not supported | No |
| **Cat 6** | 250 MHz | 100 m | 5G to at least 100 m | Up to 37 m reliably; 37 to 55 m depending on alien crosstalk; past 55 m "may require mitigation" (TIA TSB-155) | No |
| **Cat 6A** | 500 MHz | 100 m | 100 m | 100 m | No |
| **Cat 8** | 2,000 MHz | Yes | Yes | Yes | 30 m channel, at most two connectors, shielded only |

The table carries the two decisions that matter at home. **Existing Cat 5e is worth keeping:** 802.3bz was designed to run 2.5G and, in most cases, 5G over the installed base, and its objectives required support for PoE including 802.3bt. **New runs should be Cat 6A,** because it is the only category rated for 10GBASE-T at the full 100 m. Cat 8 is not a better house cable: its 30 m, two-connector reach targets top-of-rack and end-of-row server links. CommScope's view is that Cat 7 needs non-RJ45 connectors and heavy shielding without significant gains over Cat 6A, and that shielded systems should be grounded at both ends while unshielded ones need no grounding.

**The channel model.** TIA-568, as Fluke explains it, allows a 90 m permanent link of solid cable plus up to 10 m of patch cords, 100 m in all. Stranded cable is for cords: at 24 AWG it has about 20% more attenuation than solid and at 26 AWG about 50%, and a channel with more than 10 m of cords must be shortened by a de-rating factor (0.2 for 24 AWG, 0.5 for 26 AWG). PoE heats cable and stranded cords degrade more, so Fluke advises keeping stranded cords in ceilings to about 5 m. The practical shape is the one every structured cabling job uses: solid cable punched down at a jack in the room and at a patch panel at the rack, with short stranded cords at each end.

**Never copper-clad aluminum (CCA).** The Communications Cable and Connectivity Association's alert (4 March 2011) cites NEC 800.179, which requires conductors in communications cables other than coax to be copper, and UL 444, which requires copper conductors, so CCA cable cannot carry a valid CM, CMR or CMP listing; TIA-568-C.2 points to specifications requiring commercially pure annealed copper. Cheap "Cat 6" in a box is often CCA, and it fails worst exactly where homes use it: long runs carrying PoE.

## Power over Ethernet

PoE puts an access point or camera on one cable and lets the switch's UPS power the whole edge. The budget is set by type and class, as the Ethernet Alliance summarizes IEEE 802.3bt-2018:

| Type (standard) | Classes | Power sourcing equipment output | Powered device receives | Pairs | Typical home load |
| --- | --- | --- | --- | --- | --- |
| Type 1 (802.3af, 2003) | 1 to 3 | 4 / 7 / 15.4 W | 3.84 / 6.49 / 13 W | 2 | Phones, simple cameras |
| Type 2 (802.3at, 2009) | 4 | 30 W | 25.5 W | 2 | Wi-Fi 6 access points, pan-tilt-zoom cameras |
| Type 3 (802.3bt, 2018) | 5, 6 | 45 / 60 W | 40 / 51 W | 2 or 4 (4 for class 5 and up) | Wi-Fi 7 access points, small powered switches |
| Type 4 (802.3bt, 2018) | 7, 8 | 75 / 90 W | 62 / 71.3 W | 4 | Displays, heated outdoor equipment |

Two numbers decide a PoE plan: the class each device needs, from its datasheet, and the switch's total PoE budget across all ports, a separate per-model figure. A 16-port PoE switch rarely powers 16 class 6 devices at once. Heat is the third: CommScope's example has 400 mA raising a Cat 5 bundle about 10 °C against about 6 °C for Cat 6A.

## Fiber, DACs and SFP Form Factors

Past 10G, and between rooms at 10G, glass and twinax beat copper on power, heat and reach. The pluggable cages are the same ones the data center uses: SFP (1G), SFP+ (10G), SFP28 (25G), QSFP+ (40G) and QSFP28 (100G).

| Medium | Reach (Cisco datasheets) | Power per end | Home use |
| --- | --- | --- | --- |
| 10G passive DAC (twinax) | 1 to 5 m | 0.1 W | Inside the rack: server to switch |
| 10G active DAC | 7 or 10 m | 1 W | Adjacent racks |
| 10G active optical cable | 1 to 10 m | 1 W | Thin, light runs |
| 10GBASE-SR, 850 nm multimode | 33 m OM1, 82 m OM2, 300 m OM3, 400 m OM4 | 1 W | Runs inside the house |
| 10GBASE-LR, 1310 nm single-mode | 10 km | 1 W | Long house runs; the usual colo handoff |
| 10GBASE-T SFP+ (RJ45) | About 30 m (Cisco SFP-10G-T-X; MikroTik's measured link) | 2.5 W (Cisco), 2.7 W average (MikroTik) | Reusing existing copper, sparingly |
| 100G SR4 (MPO-12) | 70 m OM3, 100 m OM4 | Not stated | Rare at home |
| 100G SR1.2 BiDi (duplex LC) | 70 m OM3, 100 m OM4, 150 m OM5 | Not stated | 100G over existing duplex multimode |
| 100G CWDM4 / LR4 (single-mode) | 2 km / 10 km | Not stated | Colo and campus |
| 100G passive DAC / AOC | 1 to 5 m / 1 to 30 m | Not stated | Inside the rack |

**RJ45 SFP+ modules run hot.** MikroTik's guidance for its S+RJ10 module is to put one in every second cage, one per block of four, never side by side, or to add airflow; the module body can reach about 90 °C. In a fanless home switch, a DAC or a fiber optic is the cooler answer for every port that doesn't have to be copper.

**Coding and lock-in.** Some enterprise switches read the vendor fields in a module's EEPROM and refuse optics they don't recognize; a third-party explainer documents Cisco Catalyst's default rejection and the hidden override, with the warning that support may be withheld. Third-party optics sold "coded" for a given vendor exist for this reason. Home and prosumer switches mostly accept generic optics, which is one more reason they suit a lab.

## Wi-Fi 6, 6E and 7

| Generation | IEEE | Bands | Widest channel | What matters at home |
| --- | --- | --- | --- | --- |
| Wi-Fi 4 | 802.11n | 2.4, 5 GHz | Not covered here | MIMO; the floor for anything still connected |
| Wi-Fi 5 | 802.11ac | 5 GHz | Not covered here | The installed base of older laptops and TVs |
| Wi-Fi 6 | 802.11ax | 2.4, 5 GHz | 160 MHz | OFDMA: many small clients sharing airtime |
| Wi-Fi 6E | 802.11ax | adds 6 GHz | 160 MHz | 14 more 80 MHz and 7 more 160 MHz channels, free of legacy clients |
| Wi-Fi 7 | 802.11be | 2.4, 5, 6 GHz | 320 MHz (6 GHz only) | Multi-Link Operation across bands; 4K QAM, about 20% over 1024 QAM |

<!-- source-gap: wifi-4-5-channel-widths | missing | widest channel widths for Wi-Fi 4 and 5 | closes with: the IEEE 802.11n/ac amendment pages or a vendor design guide | checked: 2026-10-27 -->

The 6 GHz band is the reason to buy 6E or 7: in the US, FCC 20-51 lets low-power indoor access points use the whole 5.925 to 7.125 GHz band without an automated frequency coordination system (standard-power and outdoor use need one, in U-NII-5 and U-NII-7). The cost is range: 6 GHz is absorbed by walls faster than 5 GHz, so it rewards more access points, not stronger ones.

**Design for capacity, not coverage.** Ubiquiti's published design guidance is the clearest vendor statement of what works: "a wired backhaul is always recommended when available"; plan about one access point per 1,000 square feet (95 m²) because walls cut range, even though an AP covers 1,000 to 2,000 square feet in the open; expect 50 to 100 active clients per radio; overlap neighboring cells at about -70 dBm so clients roam; deploy denser than coverage alone needs at 6 GHz; and prefer narrower channels, which are more predictable. A ceiling-mounted AP radiates down and out over the room it serves; one on a shelf behind a TV radiates into the TV.

## Mesh, MoCA and Powerline

**Mesh** links access points to each other over radio. Every wireless hop spends airtime twice, once to the client and once to the parent, which is why RTINGS measured wired backhaul as significantly better in speed and consistency on the same UniFi hardware. Mesh is the right tool for the one room you can't cable, not for the house.

**MoCA** reuses coax. MoCA 2.5 (approved 13 April 2016) claims up to 2.5 Gbps actual data rates and interoperates with MoCA 2.0 and 1.1. A house wired for cable TV often has a coax outlet in the rooms that lack Ethernet, and a pair of MoCA adapters turns it into a wired backhaul for an access point.

**Powerline** adapters (HomePlug AV2, G.hn) carry Ethernet over the electrical wiring. They are the last resort before mesh; their throughput depends on the circuit, and I have no vendor-neutral measurement to cite.

<!-- source-gap: powerline-throughput | missing | measured powerline (HomePlug AV2, G.hn) throughput and latency in homes | closes with: an independent lab test or the HomePlug/HomeGrid specifications | checked: 2026-10-27 -->

## ISP Handoffs

| Technology | Line rate | Standard | What it means at home |
| --- | --- | --- | --- |
| GPON | 2.48832 Gb/s down, usually 1.24416 Gb/s up | ITU-T G.984 (first version March 2003) | Gigabit plans; shared across a splitter |
| XG-PON | 9.95328 down / 2.48832 up | ITU-T G.987 | Asymmetric 10G PON |
| XGS-PON | 9.95328 Gb/s symmetric | ITU-T G.9807.1 (first version June 2016) | Symmetric multi-gig plans |
| 50G-PON | 49.7664 down; 49.7664, 24.8832 or 12.4416 up | ITU-T G.9804 | The next step |
| DOCSIS 3.1 | Shipping modems up to 5 Gbps down, 1.5 Gbps up (CableLabs) | CableLabs | Fast down, limited up |
| DOCSIS 4.0 | Up to 10 Gbps down, 6 Gbps up | CableLabs | Symmetric-leaning cable, rolling out |

A PON is a shared tree: the 10G of XGS-PON is split among the homes on one splitter. A multi-gig plan also needs a 2.5G or 10G LAN port on the optical network terminal or gateway and on the router behind it; a gigabit router behind a 2 Gbps plan delivers a gigabit. The upload half of every row is what limits serving from home, and [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#the-upload-problem) covers it with the FCC's benchmarks.

## Switches: Unmanaged to Layer 3

| Class | What you get | Example power (datasheet) |
| --- | --- | --- |
| Unmanaged | Ports; no VLANs, no visibility | Varies by model |
| Smart or web-managed | 802.1Q VLANs, LACP, basic QoS | Varies by model |
| Managed layer 2 / layer 3 | CLI or API, monitoring, static and dynamic routing on L3 | UniFi USW-Aggregation (8x SFP+): 36 W maximum including modules; USW-Pro-Aggregation (28x SFP+, 4x SFP28, 760 Gbps): 100 W maximum |
| Used enterprise or data center | Every feature, at line rate | Often 100 W or more; loud |

The decision is power and noise more than features. A fanless 36 W aggregation switch costs about $57 a year to run at 18.16 cents per kWh; a 150 W used 1U switch about $239, with fans built for a data center aisle. A smart switch with VLANs is the minimum for a segmented home; layer 3 on the switch matters only once inter-VLAN traffic outgrows the router, which at home is usually storage traffic between a hypervisor and a NAS.

## Past 10G: 25 and 100GbE, RDMA and NVMe-oF

Faster links at home are almost always about storage. A used dual-port 25GbE card such as NVIDIA's (Mellanox) ConnectX-4 Lx (10/25 GbE on SFP28 or 40/50 GbE on QSFP28, PCIe Gen3 x8) supports RoCE over layer 2 and layer 3 and NVMe over Fabrics target offload. The protocols are the data center's: NVMe over Fabrics 1.0 was released on 9 June 2016 with RDMA and Fibre Channel transports; iSCSI dates to RFC 3720 (April 2004), now RFC 7143. RoCE v2 wants a lossless or congestion-managed fabric with PFC and ECN, which is why a home lab with two hosts on one switch is the easy case and anything larger is [Data Center Networking](/books/hosting-and-cloud/data-center-networking#rdma-and-roce-v2) territory. NVMe over TCP and iSCSI avoid the lossless requirement and are where I'd start.

## Where Home Differs From the Data Center

| The same as the data center | Different at home |
| --- | --- |
| The 802.3 PHYs, optics, DACs and SFP form factors in the tables above | Wi-Fi is the primary medium for most clients; a data center hall has none |
| 802.1Q VLANs and trunks | The ISP's gateway, ONT or cable modem sits in the path and you don't control it; bridge mode or passthrough is the escape |
| LACP (802.3ad, now 802.1AX) | Mesh with wireless backhaul, which no data center uses |
| Layer 3 routing and inter-VLAN firewalling; even BGP with your own ASN | A living space's noise, heat and power budget: a fanless 36 W switch beats a 150 W 1U one |
| Cross-connect thinking: the demarc is a patch panel port | Single everything: one ISP, one router, one switch, one power feed, no redundant uplinks unless you add them |

The left column is why a home lab is real training: every skill in it transfers. The right column is the list of things the rest of this chapter, and the Stack part after it, removes one by one.

## From Home Rack to Leaf-Spine

A home network grows into a provider network in three steps, and the parts carry over.

1. **The home rack.** An SFP+ aggregation switch at the core, DACs inside the rack, OM3/OM4 multimode or OS2 single-mode fiber with LC duplex connectors to distant rooms, Cat 6A to access points and cameras. The router and the core switch sit on a UPS.
2. **The colo cabinet or cage.** The facility hands you single-mode fiber. Equinix's April 2026 policy names single-mode fiber "the global standard media type" for cross connects, with copper allowed for existing copper switches; Expedient's documentation offers single-mode (1310 nm) and multimode (850 nm) with LC or SC, ordered with a letter of authorization; Hurricane Electric's IP transit hands off on single-mode fiber via SFP, SFP+, QSFP, QSFP28 or QSFP-DD ports from 1G to 400G, with free BGP, IPv4 and IPv6 on one port and a 9,000-byte MTU. A lab that standardized on SFP+ or SFP28 and LC fiber takes its optics and its habits into the cage. What colo adds is the first redundancy home lacked: two transit ports, two cross-connects, two BGP sessions or an LACP bundle. Cross-connects and remote hands as a facility sells them are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#cross-connects-and-interconnection).
3. **Leaf-spine.** Past a few racks, a single core switch becomes the bottleneck and the single point of failure, and the fabric becomes a Clos leaf-spine with equal-cost multipath between every leaf. [Data Center Networking](/books/hosting-and-cloud/data-center-networking#leaf-spine-and-oversubscription) takes it from there, including [BGP and ECMP's failure modes](/books/hosting-and-cloud/data-center-networking#ecmp-bgp-and-their-failure-mode).

When to make each move is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough).

## An Immaculate Home Internet

A home connection can be as good as an office one: low latency under load, wired where it matters, segmented, powered through an outage, failing over to a second line, and watched. None of it needs enterprise gear. Each step below fixes one specific failure, and the measurement at the end proves it.

### Fiber Where Available

The FCC's 13th Measuring Broadband America report (data from September and October 2022) measured idle latency by ISP at 7 to 14 ms on fiber, 12 to 24 ms on cable and 23 to 34 ms on DSL, and it was the first report to measure latency under load, which it found "generally significantly higher than idle", worst on DSL. Fiber is the best starting point on every axis that matters here: lowest idle latency, usually symmetric, no shared coax upstream. Where fiber isn't available, cable on a DOCSIS 3.1 or newer modem is next; DOCSIS 3.1 modems must run DOCSIS-PIE queue management (RFC 8034), and on Comcast's network the Low Latency DOCSIS rollout began in six markets on 29 January 2025 with the stated goal of reaching every Xfinity Internet customer.

### One Router: Bridge Mode or Passthrough

Two routers in a row mean double NAT, two firewalls, two queues and two sets of Wi-Fi fighting for the same channels. The ISP box should be a modem and nothing else.

- **Xfinity Bridge Mode** turns off the gateway's router and private Wi-Fi and keeps the modem. It also disables xFi management, Wi-Fi extenders and xFi CyberSecure, and only one device can connect; the Xfinity WiFi home hotspot stays on. It is set in the Admin Tool at 10.0.0.1.
- **AT&T IP Passthrough** exists because AT&T's fiber gateways can't fully bridge: the gateway hands its WAN address to one device, by DHCP with the device's MAC fixed (the recommended mode), dynamically, or manually, and that device loses the gateway's firewall, so it must be a real firewall.
- **Fixed-wireless 5G and satellite lines** typically sit behind carrier-grade NAT ([IPv6 and CGNAT](/books/hosting-and-cloud/home-routing-and-firewalls#ipv6-and-cgnat)), so inbound connections can't reach them whatever the gateway's mode. They work best as a backup line behind your own router.

### Wired Backhaul to Ceiling Access Points

Run Cat 6A to each access point, mount it on the ceiling, and power it from the PoE switch: about one AP per 1,000 square feet, overlapping at about -70 dBm, per the Wi-Fi design guidance above. Where a cable can't reach, use MoCA on existing coax before a wireless mesh hop. Turn off the ISP gateway's Wi-Fi so it doesn't compete with your APs (bridge mode does this on Xfinity).

### Bufferbloat, SQM and Measuring It

A connection that tests fast and feels slow almost always has bufferbloat: in bufferbloat.net's words, "undesirable latency that comes from a router or other network equipment buffering too much data." When an upload or a download fills the link, packets queue in the slowest device's oversized buffer, and every call, game and page load waits behind them. CoDel, fq_codel and CAKE cut the induced delay to roughly 20 ms by bufferbloat.net's account.

The fix is **smart queue management (SQM)** on your router: shape the traffic slightly below the ISP's rate, so the queue forms in your router, where a fair-queueing AQM manages it, instead of in the modem or the ISP's equipment, where it doesn't.

| Platform | How to do it | Rate to start from |
| --- | --- | --- |
| **OpenWrt** | `luci-app-sqm`: queueing discipline **cake** with `piece_of_cake.qos` (fq_codel is faster on weak CPUs); set the link-layer overhead for the medium (DOCSIS below 760 Mbps: overhead 22, MPU 64; at or above 760 Mbps: 42/84; fiber or Ethernet: 44/84; unsure: 44/96, since it's better to overestimate). Disable hardware flow offloading; software offloading is fine | 90% of measured download and upload |
| **OPNsense** | Firewall, Shaper: two pipes with the FQ_CoDel scheduler (ECN on download), two queues and two WAN rules; quantum equal to the WAN MTU (the docs call the "300 per 100 Mbit" folklore wrong); limit about 1,000 below 10 Gbit/s | About 85% of advertised, then tune upward |
| **pfSense** | Limiters WANDown and WANUp with Tail Drop and FQ_CODEL, ECN on, queue length about 1,000 (3,000 to 5,000 at 1 Gbit/s and above), a floating rule on WAN out; one limiter set per WAN | The speed-tested bandwidth; target grade A or better |
| **Variable links (LTE, 5G, Starlink)** | cake-autorate adjusts CAKE's rate from measured latency | Adaptive |

The cost of shaping is 5 to 15% of headline speed and CPU for software queueing at gigabit rates. On symmetric multi-gig fiber the bottleneck often moves into Wi-Fi, which is the problem the Make-Wi-Fi-Fast work on airtime fairness addresses.

**Measure before and after.** Waveform's bufferbloat test grades the latency increase under load over unloaded latency: A+ under 5 ms, A under 30 ms, B under 60 ms, C under 200 ms, D under 400 ms, F at 400 ms or more. Flent's RRUL test runs four TCP downloads and four uploads to saturate the link while probing round-trip time with ICMP and UDP, and it "reliably" exposes bufferbloat. The FCC's own method is a model for continuous measurement: idle latency from 2,000 UDP packets an hour, latency under load at 10 packets a second during speed tests, a packet counted lost after 3 seconds without a reply. My target is an A or A+ on Waveform and a flat latency line through an RRUL run.

### Segmented VLANs

Put the house on separate VLANs (trusted, IoT, guest, lab, cameras) trunked from the router to the switch and the access points, with firewall rules between them. The plan, the rules and the DNS are [Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls#vlans-and-segmentation).

### A UPS on the Network Core

The ONT or modem, the router, the core switch and the PoE budget for the access points go on one UPS. The load is small, tens of watts plus PoE, so a modest line-interactive unit carries it for a long time, and a backup line only helps during a power cut if its own equipment is powered too. Sizing, runtime math, NUT and the uptime of a residence are [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#power-and-the-uptime-of-a-residence).

### Failover and Backup Lines

A second line on a different medium turns an ISP outage into a slower afternoon. The router decides when to fail over and when to fail back, and consumer routers now do it.

| Router | Failover method | Failback | Backup sources | Gotchas |
| --- | --- | --- | --- | --- |
| **ASUS (Asuswrt) Dual WAN** | Failover, or Load Balance by session with per-device routing rules; detects loss by DNS queries or pings to the gateway or an address you set | Optional "Allow Failback" | WAN port, USB, or a LAN port as WAN; primary and secondary must be different types | IPv4 only; DDNS and port forwarding may break in Load Balance; can't combine with WAN Aggregation |
| **Netgear Orbi 5G (NBR750)** | Built-in 5G modem; Internet Connection Mode "Use Ethernet as Primary and failover to Mobile Network" | Returns to wired when it's back (wired is the default; mobile is used only while wired is down) | SIM in the router | No failover if set to wired-only or mobile-only |
| **TP-Link Deco** | Hybrid Mesh Backup: a 4G/5G Deco with an active SIM as a satellite backs up the whole network; offline detection by DNS lookup or DNS plus ping | "Once the main connection is restored, the network switches back automatically." | A 4G/5G Deco (for example Deco X50-5G) | Supported models change with firmware |
| **eero Internet Backup** | Fails over to a backup network | Automatic | A phone hotspot or another Wi-Fi network | Offered to eero Plus subscribers and select ISP customers, not every owner |
| **GL.iNet (OpenWrt based)** | Multi-WAN Failover (default) or Load Balance by connection ratio; ping tracking with Normal, Low Data or Strict modes | Returns to the higher-priority link | Ethernet, Wi-Fi repeater, USB tethering, cellular (by model) | Without tracking only the physical link is checked |
| **pfSense, OPNsense, UniFi** | Gateway groups and tiers, trigger levels on loss and latency | Configurable | Any | One SQM limiter set per WAN; covered in [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#redundant-lines) |

The backup line itself, in the US as of October 2026:

| Backup line | Terms | Gotchas |
| --- | --- | --- |
| **5G home internet** (for example AT&T Internet Air) | From $55 a month with AutoPay and paperless billing, no annual contract, no caps, but AT&T may "greatly reduce speeds for at least 30 minutes" on a line contributing to congestion | Carrier-grade NAT; deprioritized under congestion |
| **Verizon 5G Home** | Published 25th to 75th percentile speeds (six months to 28 February 2026): 25 to 85 down / 5 to 10 up on mid-band, more on mmWave; latency 35 to 70 ms | Carrier-grade NAT; not a server line |
| **Starlink Standby Mode** | $5 a month for unlimited data at about 500 kbps, replacing the free pause (August 2025) and extended to Residential plans | A Residential plan on standby doesn't keep its spot; in a congested cell it may not reactivate to a full plan |
| **Phone hotspot** | The phone plan's hotspot allowance; eero, Deco and GL.iNet can use it as an automatic backup | The phone must stay home and charged |

> [!CAUTION]
> A cellular or satellite backup line is almost always behind carrier-grade NAT, so inbound connections stop working the moment the house fails over. Anything you reach from outside should already go through a tunnel or overlay ([Exposing Home Services](/books/hosting-and-cloud/exposing-home-services)), or it goes dark exactly when you need it.

Three more traps. A backup router placed in front of a mesh creates double NAT unless the mesh runs in access-point or bridge mode. Load balancing breaks sessions that care about the source address (banking, some VPNs); failover doesn't. SQM must be configured for each WAN separately, at that line's rate.

### Monitoring Latency and Loss

Speed is the wrong thing to watch. Latency and loss over time, to the first hop and to two outside targets, show the problems people feel.

| Tool | What it watches | Since |
| --- | --- | --- |
| **SmokePing** | Latency and loss distribution over time to many targets: the classic "smoke" graph | On GitHub since 5 October 2011; the tool is older |
| **Prometheus blackbox_exporter** | ICMP, HTTP, DNS and TCP probes as metrics for Grafana and alerting (Apache-2.0) | 5 September 2015 |
| **Uptime Kuma** | HTTP, ping, DNS and port checks with notifications, self-hosted (MIT) | 3 July 2021; 2.5.8 on 26 October 2026 |
| **LibreNMS** | SNMP monitoring of switches, access points and router interfaces | 28 October 2013 |
| **Flent, IRTT** | On-demand load tests and precise round-trip time | Flent repository 9 October 2012 |

Alert on loss and latency, not on speed tests: a probe to the ISP's first hop that loses 2% of packets is an outage in the making, and a speed test at 3 a.m. won't show it.

## The Alternatives

| Approach | Strengths | Failure modes | Cost (as of October 2026) | Best for |
| --- | --- | --- | --- | --- |
| **ISP gateway only** | Zero setup; ISP support | Bufferbloat, no VLANs, poor AP placement, no failover | Included or rented | Nobody who reads this chapter |
| **Consumer mesh, wireless backhaul** | Easy; covers a house without cable | Airtime halved per hop; vendor-limited features; some backup features need a subscription | Hardware, sometimes a subscription | Rentals and homes you can't cable |
| **Consumer mesh with wired backhaul** | Most of the benefit with an app | Limited SQM and VLANs on many models | Hardware | A good house with little interest in networking |
| **Prosumer: own router, managed switch, ceiling APs** | SQM, VLANs, multi-WAN, monitoring; standard parts | Your configuration is the risk | Hardware; no subscription required | A homelab |
| **Used enterprise switching** | Every feature, cheap to buy | Noise, heat, power (about $239 a year per 150 W) | Electricity | Garages and basements; learning a specific vendor |

## My Default

- **Cabling:** Cat 6A solid copper for every new run to an access point, camera and desk, never CCA, punched down to jacks and a patch panel with short cords. Existing Cat 5e stays and runs 2.5G.
- **Between rooms and racks:** SFP+ or SFP28, DACs inside the rack, LC duplex fiber (OM4 or OS2) between rooms; at most one or two RJ45 SFP+ modules, spaced apart.
- **Wi-Fi:** ceiling-mounted Wi-Fi 7 (or 6E) access points on PoE+ or 802.3bt with wired backhaul, about one per 1,000 square feet; MoCA where coax exists; mesh only for a room cable can't reach.
- **Switching:** one fanless managed switch with 802.1Q VLANs and enough PoE budget for every AP and camera at its class.
- **Internet:** fiber where available, XGS-PON if offered, with a 2.5G or 10G port at the ONT and the router; the ISP box in bridge mode or IP Passthrough; SQM with CAKE or FQ_CoDel at 85 to 90% of measured rates, retested until Waveform shows A or A+.
- **Resilience:** one UPS for the ONT, router, core switch and PoE; a second line on a different medium (5G home internet, or Starlink Standby where 5G is weak) into a router that fails over and fails back; remote access through an overlay so the backup line's CGNAT doesn't matter.
- **Monitoring:** SmokePing or blackbox_exporter probing the first hop and two outside targets, Uptime Kuma for the services, alerts on loss and latency.
- **Past 10G:** only when storage traffic needs it, with a used 25G card and NVMe over TCP or iSCSI before RoCE.

What would change it: a rental or a house that can't be cabled moves Wi-Fi to a mesh with as few hops as possible; a household that will never touch a router config is better served by a consumer mesh with wired backhaul and its vendor's failover than by a prosumer setup nobody maintains.

## How to Build It

The core data model gets no tables from this chapter: the operator and the customer are the same person, and a home network bills nobody. What a home network needs is a written plan, kept in the same Git repository as the lab's other configuration, so that a failed switch or a new access point is a lookup and not an archaeology project.

**A cable schedule.** Every run, labeled at both ends, with its tested result:

| Label | From (patch panel port) | To (room, jack) | Cable | Length | Tested | Use | VLAN / profile | PoE class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PP1-01 | Rack, PP1 port 1 | Hall ceiling, J1 | Cat 6A solid, plenum where required | 18 m | 10GBASE-T pass | AP-hall | Trunk (all SSID VLANs) | 6 |
| PP1-02 | Rack, PP1 port 2 | Office, J2 | Cat 6A solid | 22 m | 10GBASE-T pass | Desk | 20 trusted | None |
| PP1-03 | Rack, PP1 port 3 | Front door soffit, J3 | Cat 6A solid, outdoor-rated | 27 m | 1000BASE-T pass | Camera | 50 cameras | 4 |
| FO-01 | Rack, SFP+ 1 | Garage rack, SFP+ 1 | OS2 single-mode, LC duplex | 35 m | Link at 10GBASE-LR | Uplink | Trunk | None |

**A PoE budget.** Sum the class power at the switch, not the device's typical draw:

| Port | Device | Class | Budget at the switch |
| --- | --- | --- | --- |
| 1 to 3 | Wi-Fi 7 access points | 6 | 3 x 60 W = 180 W |
| 4 to 6 | Cameras | 4 | 3 x 30 W = 90 W |
| | **Total** | | **270 W, against the switch's published PoE budget** |

**The network inventory,** as YAML beside the lab's other inventory files:

```yaml
# network.yaml: the physical layer of the home lab
wan:
  - name: fiber
    medium: xgs-pon
    handoff: { device: ont, port_speed: 10G }
    isp_box_mode: passthrough         # bridge | passthrough | router
    sqm: { qdisc: cake, down_mbps: 1800, up_mbps: 1800, overhead: 44, mpu: 84 }
    priority: 1
  - name: backup-5g
    medium: fixed-wireless-5g
    cgnat: true                       # inbound won't work on failover
    sqm: { qdisc: cake, adaptive: cake-autorate }
    priority: 2
switches:
  - name: sw-core
    class: managed-l2
    poe_budget_w: 400                 # from the datasheet
    ups: ups1
access_points:
  - { name: ap-hall, mount: ceiling, standard: wifi7, backhaul: wired, port: sw-core/1, poe_class: 6 }
  - { name: ap-den,  mount: ceiling, standard: wifi7, backhaul: moca,  port: sw-core/7, poe_class: 6 }
monitoring:
  probes:
    - { target: first-hop, every_s: 1 }
    - { target: 1.1.1.1,  every_s: 1 }
    - { target: 9.9.9.9,  every_s: 1 }
  alert_on: { loss_pct_over_5m: 1, p95_latency_ms_over_5m: 50 }
```

**SQM on OpenWrt,** as the LuCI settings the OpenWrt guide documents, for a fiber line measured at 2,000/2,000 Mbps:

| Setting | Value |
| --- | --- |
| Interface | The WAN device |
| Download / Upload | 1,800,000 / 1,800,000 kbit/s (90% of measured) |
| Queueing discipline | cake |
| Queue setup script | piece_of_cake.qos |
| Link layer | Ethernet, overhead 44, MPU 84 |
| Firewall | Hardware flow offloading off; software offloading allowed |

Then measure with Waveform and an RRUL run, raise the rates in small steps until latency under load starts to climb, and back off one step.

**Probes as metrics.** A blackbox_exporter module and the Prometheus job that drives it:

```yaml
# blackbox.yml
modules:
  icmp_v4:
    prober: icmp
    timeout: 2s
    icmp:
      preferred_ip_protocol: ip4

# prometheus.yml (excerpt)
scrape_configs:
  - job_name: wan-latency
    scrape_interval: 15s
    metrics_path: /probe
    params: { module: [icmp_v4] }
    static_configs:
      - targets: ["192.0.2.1", "1.1.1.1", "9.9.9.9"]   # first hop, then two outside targets
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox:9115
```

Alert on `probe_success` falling below 99% over five minutes and on the 95th percentile of `probe_duration_seconds` rising above the baseline; graph both through a deliberate saturation test to see SQM working.

## What This Means for the System You Build

- **The standards are the curriculum.** The same 802.3 PHYs, SFP optics, VLANs and LACP run from a closet to a hyperscale hall; a home lab built on SFP+ and LC fiber is practice for the Stack part, not a toy version of it.
- **Copper has a category and a length, not just a speed.** Cat 5e for 2.5G, Cat 6A for 10G at 100 m, never CCA, and the 90 m plus 10 m channel model for every run.
- **Wire the access points.** Every wireless backhaul hop costs airtime; ceiling APs on PoE with wired backhaul are the single biggest Wi-Fi improvement in most houses.
- **Latency under load is the metric.** Fix bufferbloat with SQM on your own router, shaped just under the line rate, and prove it with Waveform and RRUL; the ISP's AQM (DOCSIS-PIE, L4S) helps but isn't yours to configure.
- **One router owns the edge.** The ISP's box goes to bridge mode or passthrough so NAT, firewall and the queue live in one place.
- **Redundancy starts at home with a UPS and a second line,** on a different medium, with failback and with CGNAT accepted on the backup; the data center adds the second of everything else.
- **Measure what users feel.** Continuous latency and loss probes, not speed tests, are the home network's monitoring, and the same probes become a provider's synthetic checks later in the book.

## References

**Ethernet and cabling standards**

- [Digibarn: Metcalfe's Ethernet memo](https://digibarn.com/collections/diagrams/ethernet-original/index.html), 22 May 1973
- [IEEE 802.3i-1990](https://standards.ieee.org/ieee/802.3i/1068/), 10BASE-T, approved 28 September 1990
- [IEEE 802.3u-1995](https://standards.ieee.org/ieee/802.3u/1079/), Fast Ethernet, approved 14 June 1995
- [IEEE 802.3ab](https://www.ieee802.org/3/ab/), 1000BASE-T, June 1999
- [IEEE 802.3ad](https://www.ieee802.org/3/ad/), link aggregation, March 2000, now 802.1AX
- [IEEE 802.3ae](https://www.ieee802.org/3/ae/), 10 Gb/s Ethernet, June 2002
- [IEEE 802.3an](https://www.ieee802.org/3/an/), 10GBASE-T, approved 8 June 2006
- [IEEE 802.3ba](https://www.ieee802.org/3/ba/), 40 and 100 Gb/s, June 2010
- [IEEE 802.3by](https://www.ieee802.org/3/by/) and [802.3bq](https://www.ieee802.org/3/bq/), 25 Gb/s and 25G/40GBASE-T, 30 June 2016
- [IEEE 802.3bz](https://www.ieee802.org/3/bz/), 2.5G/5GBASE-T, approved 22 September 2016
- [IEEE 802.3bz objectives, March 2015](https://www.ieee802.org/3/bz/ngeabt_objectives_802.3WG_approved_0315.pdf), reach over Cat 5e and Cat 6, PoE including 802.3bt, auto-negotiation
- [Fluke Networks: Stranded vs solid cable](https://www.flukenetworks.com/blog/cabling-chronicles/considerations-choosing-stranded-vs-solid-cable), the 90 m plus 10 m channel, stranded attenuation and de-rating, PoE in ceilings
- [Fluke Networks: 10GBASE-T field testing requirements](https://www.flukenetworks.com/knowledge-base/applicationstandards-articles-copper/10gbase-t-field-testing-requirements), Cat 6 at 37 and 55 m, TSB-155
- [CommScope: Category 6A](https://www.commscope.com/cat-6a/), category bandwidths, shielding and grounding, Cat 7, PoE heating
- [CommScope: Category 8 cabling white paper](https://www.commscope.com/globalassets/digizuite/2158-cat8-cabling-supporting-applications-beyond-10gb-s-wp-110474-en.pdf), July 2016 publication, 30 m and two connectors, shielded RJ45
- [CCCA: Copper-clad aluminum alert](https://cccassoc.org/?p=718), 4 March 2011, NEC 800.179, UL 444 and TIA-568-C.2 conductor requirements

**Power over Ethernet**

- [IEEE 802.3af](https://www.ieee802.org/3/af/), [802.3at](https://www.ieee802.org/3/at/) and [802.3bt](https://www.ieee802.org/3/bt/), 2003, 2009 and 27 September 2018
- [Ethernet Alliance: Overview of 802.3bt](https://ethernetalliance.org/wp-content/uploads/2019/12/WP_EA_Overview8023bt_V2p1_FINAL.pdf), types, classes and power at each end

**Optics and switching**

- [Cisco: 10GBASE SFP+ modules data sheet](https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/data_sheet_c78-455693.html), DAC, AOC, SR, LR and 10GBASE-T reach and power
- [Cisco: 100GBASE QSFP modules data sheet](https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/datasheet-c78-736282.html), SR4, SR1.2 BiDi, CWDM4, LR4, DAC and AOC reach
- [MikroTik: S+RJ10 general guidance](https://help.mikrotik.com/docs/spaces/ROS/pages/240156916/S+RJ10+general+guidance), power, heat, 30 m and cage spacing
- [Firewall.cx: Cisco switches and third-party SFPs](https://www.firewall.cx/cisco/cisco-switches/cisco-switches-3rd-party-sfp.html), module coding checks and the override (third-party explainer)
- [Ubiquiti: USW-Aggregation tech specs](https://techspecs.ui.com/unifi/switching/usw-aggregation), 8x SFP+, 36 W maximum
- [Ubiquiti: USW-Pro-Aggregation tech specs](https://techspecs.ui.com/unifi/switching/usw-pro-aggregation), 28x SFP+ and 4x SFP28, 100 W, 760 Gbps
- [NVIDIA: ConnectX-4 Lx introduction](https://networking-docs.nvidia.com/connectx4lxhw/Introduction), speeds, PCIe, RoCE and NVMe-oF offload
- [NVM Express: NVMe over Fabrics specification released](https://nvmexpress.org/nvm-express-over-fabrics-specification-released/), 9 June 2016
- [RFC 3720](https://www.rfc-editor.org/info/rfc3720), iSCSI, April 2004, obsoleted by RFC 7143

**Wi-Fi, coax and spectrum**

- [Wi-Fi Alliance: Wi-Fi 6 and generational names](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-6), 3 October 2018
- [Wi-Fi Alliance: Wi-Fi 6E](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-brings-wi-fi-6-into-6-ghz), 3 January 2020, additional 80 and 160 MHz channels
- [Wi-Fi Alliance: Wi-Fi CERTIFIED 7](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7), 8 January 2024, 320 MHz, MLO, 4K QAM
- [IEEE 802.11 working group](https://www.ieee802.org/11/), 802.11be-2024 published 22 July 2025
- [FCC 20-51](https://docs.fcc.gov/public/attachments/FCC-20-51A1.pdf), 6 GHz unlicensed use, low-power indoor and AFC, adopted 23 April 2020
- [Ubiquiti Academy: Fundamentals of UniFi WiFi design](https://academy.ui.com/topics/fundamentals-of-unifi-wifi-design), wired backhaul, AP density, clients per radio, -70 dBm overlap, 6 GHz density
- [RTINGS: Wired vs wireless backhaul](https://www.rtings.com/router/learn/wired-vs-wireless-backhaul), measured on UniFi hardware
- [MoCA: MoCA 2.5 approved](https://mocalliance.org/news/rm_160416_moca-approved-specification-moca-2-5/), 13 April 2016

**ISP access and handoffs**

- [ITU-T: PON overview flyer](https://www.itu.int/en/ITU-T/studygroups/2017-2020/15/Documents/flyers/Flyer_ITU-T_PON_Overview.pdf), GPON, XG-PON, XGS-PON and 50G-PON line rates
- [ITU-T G.984.1](https://www.itu.int/rec/T-REC-G.984.1) and [G.9807.1](https://www.itu.int/rec/T-REC-G.9807.1), GPON (2003) and XGS-PON (2016)
- [CableLabs: DOCSIS 4.0 technology](https://www.cablelabs.com/technologies/docsis-4-0-technology), DOCSIS 3.1 modem speeds and DOCSIS 4.0 rates
- [Xfinity: Enable or disable bridge mode](https://www.xfinity.com/support/articles/wireless-gateway-enable-disable-bridge-mode), what bridge mode disables
- [AT&T: IP Passthrough](https://www.att.com/support/smallbusiness/article/internet/KM1188700/), modes and the loss of the gateway firewall

**Colocation handoffs**

- [Equinix Community: Cross connects policy](https://community.equinix.com/product-and-policy-changes-64/equinix-cross-connects-1103), 22 April 2026, single-mode fiber as the standard media
- [Expedient: Cross connects](https://kb.expedient.com/docs/cross-connects), fiber types, connectors, LOA and lead time
- [Hurricane Electric: IP transit](https://he.net/ip_transit.html), port speeds, single-mode handoff optics, BGP, MTU

**Bufferbloat, queueing and measurement**

- [bufferbloat.net: Projects](https://www.bufferbloat.net/projects/), definition, CoDel, fq_codel and CAKE, Make-Wi-Fi-Fast, cake-autorate (updated 16 February 2026)
- [RFC 8289](https://www.rfc-editor.org/rfc/rfc8289.json) and [RFC 8290](https://www.rfc-editor.org/info/rfc8290), CoDel and FQ-CoDel, January 2018
- [RFC 8033](https://www.rfc-editor.org/info/rfc8033) and [RFC 8034](https://www.rfc-editor.org/info/rfc8034), PIE and DOCSIS-PIE, February 2017; DOCSIS 3.1 requires AQM
- [RFC 9330](https://www.rfc-editor.org/info/rfc9330), [RFC 9331](https://www.rfc-editor.org/rfc/rfc9331.json) and [RFC 9332](https://www.rfc-editor.org/rfc/rfc9332.json), L4S, January 2023
- [KernelNewbies: Linux 4.19](https://kernelnewbies.org/Linux_4.19), CAKE, released 22 October 2018
- [Comcast: Low Latency DOCSIS field trials](https://corporate.comcast.com/stories/comcast-kicks-off-industrys-first-low-latency-docsis-field-trials), 16 June 2023
- [Comcast: Ultra-low lag Xfinity internet](https://corporate.comcast.com/press/releases/comcast-introduces-nations-first-ultra-low-lag-xfinity-internet-experience-with-meta-nvidia-and-valve), 29 January 2025, six markets
- [FCC: 13th Measuring Broadband America Fixed report](https://data.fcc.gov/download/measuring-broadband-america/2023/2023-Fixed-Measuring-Broadband-America-Report.pdf), idle and working latency by technology, methodology
- [OpenWrt: SQM](https://openwrt.org/docs/guide-user/network/traffic-shaping/sqm), cake, piece_of_cake.qos, overhead and MPU by medium, 90% rates, flow offloading
- [OPNsense: Fighting bufferbloat with FQ_CoDel](https://docs.opnsense.org/manual/how-tos/shaper_bufferbloat.html), pipes, queues, rules, quantum and limit
- [Netgate: Configuring CoDel limiters](https://docs.netgate.com/pfsense/en/latest/recipes/codel-limiters.html), limiters, queue length, per-WAN limiters
- [GitHub: lynxthecat/cake-autorate](https://github.com/lynxthecat/cake-autorate), adaptive CAKE for variable links
- [Waveform: Bufferbloat test](https://www.waveform.com/tools/bufferbloat), grade bands (opened in a browser, 27 October 2026)
- [Flent: Tests](https://flent.org/tests.html), RRUL

**Failover and backup lines** (as of October 2026)

- [ASUS: Dual WAN](https://www.asus.com/support/faq/1011719/), failover, load balance, failback, detection and limitations
- [Netgear: Orbi 5G WiFi Mesh System user manual](https://www.downloads.netgear.com/files/GDC/NBK752/NBK752_UM_EN.pdf), August 2021, automatic failover (pp. 24 to 25)
- [TP-Link: Deco Internet Backup](https://www.tp-link.com/uk/support/faq/4246/), Hybrid Mesh Backup, offline detection, automatic switch-back
- [Amazon: eero announcement](https://www.aboutamazon.com/news/devices/amazon-eero-announcement), Internet Backup for eero Plus subscribers and select ISP customers
- [GL.iNet: Multi-WAN](https://docs.gl-inet.com/router/en/4/interface_guide/multi-wan/), failover, load balance, tracking modes
- [AT&T: Internet Air](https://www.att.com/internet/internet-air/), price, no caps, congestion management
- [Verizon: Network performance](https://www.verizon.com/about/our-company/network-performance), 5G Home speed and latency ranges
- [SatelliteInternet.com: Starlink Standby Mode](https://www.satelliteinternet.com/resources/starlink-pause-standby-mode/), 13 August 2025, $5, 500 kbps, Residential reactivation caveat

**Monitoring**

- [GitHub: oetiker/SmokePing](https://github.com/oetiker/SmokePing), repository since 5 October 2011
- [GitHub: prometheus/blackbox_exporter](https://github.com/prometheus/blackbox_exporter), since 5 September 2015
- [GitHub: louislam/uptime-kuma](https://github.com/louislam/uptime-kuma), since 3 July 2021
- [GitHub: librenms/librenms](https://github.com/librenms/librenms), since 28 October 2013
- [GitHub: tohojo/flent](https://github.com/tohojo/flent), since 9 October 2012

**Electricity**

- [EIA: Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), US average residential price 18.16 cents per kWh, August 2026 (preliminary)
