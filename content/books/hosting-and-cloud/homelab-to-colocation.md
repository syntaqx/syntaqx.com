+++
title = "From Homelab to Colocation"
description = "Deploying from home, the upload problem, static IPs and AUPs, dual WAN and BGP, power and uptime math, published colo prices and a hybrid home, colo and cloud."
category = "Hosting & Cloud Industry"
order = 2154
part = "Homelab"
tags = ["homelab", "colocation", "self-hosted-runners", "multi-wan", "bgp", "ups", "broadband"]
+++

A homelab becomes a hosting problem the day something on it has users other than its owner. Building and deploying from home is easy now: runners, registries and GitOps controllers all reach out to the internet instead of waiting for it to reach in, so a cluster behind NAT can run a delivery loop as complete as a provider's. Serving from home is a different matter. The limits are an upload link sized for consuming, an address the ISP can change, a residential contract written against commercial use, one line and one power feed, and a house that loses power for hours a year. Every one of those has a fix, and each fix costs about what a slice of a colocation rack costs. This chapter is about where that crossover sits, and it closes the Homelab part: the next chapter, [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#what-a-facility-sells), opens The Stack inside the building the crossover leads to.

It covers running your own deployments from home (self-hosted runners, a LAN registry, GitOps against a home cluster, staging and production on home hardware); home internet speeds and why upload is the constraint; static IPs, business plans and residential acceptable use policies; redundant lines and BGP from home with your own ASN; UPS sizing and the uptime math of a residence; when colocation starts, with published prices; and a hybrid of home, colo and cloud on one overlay network, with my default for each stage. It adds no tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): a home server and a colo server are both `server` resources in different regions, and the colocation kinds (cabinets, cross-connects, power circuits) belong to [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold). The wider homelab is [The Homelab](/books/hosting-and-cloud/homelab); cabling and the home network's own scale-up path are [Home Networks: Ethernet, Wi-Fi & Cabling](/books/hosting-and-cloud/home-networks-and-cabling); publishing a service through tunnels and overlays is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services).

## How the Providers Do It

Two kinds of provider set the terms for this chapter: the ISP that sells the line into the house, and the colocation provider that sells the space a server moves to. Neither sells "graduation"; each sells units, and the units are what to compare. ISP plans, as of October 2026:

| Plan type | What it sells | Inbound and addressing | Contract terms that matter | Examples |
| --- | --- | --- | --- | --- |
| **Residential cable or fiber** | Download-weighted speed tiers; caps on some legacy plans | Dynamic public IPv4 on most wired plans; no static | AUP limits use to personal, non-commercial; some name servers outright | Xfinity, Spectrum, AT&T Fiber |
| **Business cable or fiber** | The same plant with business support | Static IPv4 blocks for a monthly fee | Commercial use allowed | AT&T static blocks of 8 to 64 addresses |
| **Fixed wireless (5G home)** | Cellular capacity to a home gateway | Typically behind CGNAT | Deprioritized under congestion | Verizon 5G Home, T-Mobile Home Internet, AT&T Internet Air |
| **Low-earth-orbit satellite** | Satellite capacity, standby tiers for backup | Typically behind CGNAT | Usage tiers and standby modes | Starlink |
| **Backup line** | A low-rate or low-cap line kept for failover | Typically behind CGNAT | Small data buckets or speed ceilings | Starlink Standby, cellular backup plans |

And colocation, at the retail end where a homelab first lands, with prices as published in October 2026:

| Provider | Unit and price | Power included | Bandwidth included | Remote hands | Note |
| --- | --- | --- | --- | --- | --- |
| **HostColor** (US) | 1U $99, 2U $119, 3U $139, 4U $159 a month, 1-year term | 1 A, extra $25 a month per amp | 30 TB, 95th percentile burst, 1 to 10 Gbps port; /30 IPv4 and a /64 | $250 an hour | Free installation |
| **RackNerd** (New York default) | 1U to 4U $179; quarter rack (10U) $599; half rack (20U) $999 a month | 1 A, 10 A, 20 A at 120 V | 10, 30, 100 TB on a 1 Gbps port; /29, /27, /26 IPv4 | Basic tasks free, advanced $32.50 per 15 minutes | Promotional page; month-to-month; announces customer IPs at no charge |
| **InfoBunker** (Iowa) | Full rack $875 a month, $750 each at 3 or more | One 20 A 120 V circuit; extra 20 A 120 V or 10 A 240 V circuit $175 | 10 Mbps of Cogent transit | $100 an hour | Cross-connects $50 a month |
| **Hurricane Electric** (Fremont, San Jose) | 42U cabinet with 1 Gbps, $600 a month | Included | 1 Gbps | Not on the page | Promotion, one per customer |
| **Hetzner** (Germany, Finland) | 1/3 rack (14U) from €100 a month plus €199 setup | Metered: €0.33/kWh in Germany, €0.22/kWh in Finland | Traffic €1 per TB beyond the allowance | €21 per 15 minutes | Not accepting colocation "until further notice" |
| **Netwise** (London) | 1U £49, 2U £69, 4U £99 a month | 0.5 A, £35 per extra 0.5 A | 1 TB on 1 Gbps, extra TB £25 | Not on the page | 10 Gbps port £100 a month |

The pattern across both tables: the ISP sells download and forbids or ignores the server, and the colo provider sells space, amps, bandwidth and hands, with the server as the whole point. Everything between them (a business line, a static block, a second WAN, a tunnel to a VPS) is a way to buy one of colo's units without leaving the house.

## Deploying From Home

The delivery loop runs fine behind NAT because every piece of it is a client. The playbook's [CI & Continuous Deployment](/docs/delivery/ci-pipelines#secure) owns pipeline rules; this section is the home topology.

**Self-hosted runners poll; they don't listen.** GitHub's runner application needs only outbound HTTPS on port 443 to github.com, api.github.com and the Actions service hosts; no inbound port is opened, which is why it works behind CGNAT. A job matched to a runner that doesn't pick it up within 60 seconds is re-queued, and a job queued for more than 24 hours fails. The runner software is free to use with GitHub Actions and registers at repository, organization or enterprise scope; the owner maintains the operating system. GitHub announced and then postponed a per-minute fee on self-hosted use in December 2025 ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#github-s-2026-change-and-the-self-hosted-fee)). **GitLab Runner** (MIT) registers with a token, connects to GitLab and waits for jobs, with shell, Docker, Kubernetes, SSH and autoscaling executors; GitLab lists private runners as a way to reduce compute-minute use. **Gitea Actions** shipped as a preview in Gitea 1.19 (March 20, 2023) with GitHub-style workflow syntax and `act_runner` as the agent, so a forge and its CI can both live on the LAN.

**Ephemeral runners, and never on public repositories.** GitHub's security guidance says self-hosted runners "should almost never be used for public repositories" because a runner can be "persistently compromised by untrusted code", and recommends just-in-time runners that take one job and are removed. At home that matters twice: a persistent runner on the LAN is a machine that runs strangers' pull requests next to the NAS. Actions Runner Controller runs ephemeral runner pods on a home Kubernetes cluster; the isolation tradeoffs (container versus VM boundary, Docker-in-Docker) are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#ephemeral-runners-and-autoscaling).

> [!WARNING]
> A self-hosted runner attached to a public repository will run code from any fork pull request that a workflow lets through, on your home network. Keep home runners on private repositories, make them ephemeral, and put them in a network segment that can reach only the registry and the internet.

**A LAN registry.** Images built at home should be pushed to a registry at home, not pulled across the uplink from a public one on every deploy. Distribution (the CNCF project that was Docker Registry, Apache-2.0, v3.0.0 on April 3, 2025) is the minimal one; Harbor (CNCF graduated June 23, 2020) adds projects with role-based access, vulnerability scanning, signing and replication, which is how a home registry mirrors to a colo or cloud one later. Registry operation in general is [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries#how-a-registry-works-for-the-operator).

**GitOps pulls.** Flux and Argo CD reconcile a cluster from Git, so the cluster needs outbound access to the Git host and the registry and nothing inbound ([GitOps: The Deploy as a Pull](/books/hosting-and-cloud/platform-deploys#gitops-the-deploy-as-a-pull)). With runners polling, a LAN registry and a pull-based controller, the whole loop from push to running pod needs no port forward. Only the users of the service need a way in, which is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services).

**Staging and production on home hardware.** A home cluster usually splits them as namespaces on one cluster or as a second small cluster. Namespaces share the control plane, the storage and the uplink, so a staging load test competes with production for the same 20 or 40 Mbps of upload; a second cluster (even one node) is the cheaper way to test upgrades of the cluster itself. Either way the limits that make home "staging" rather than "production" are the line and the power, not the tooling. The environment model is the playbook's [Environments](/docs/operations/environments#the-environments).

## The Upload Problem

The FCC raised its fixed broadband benchmark from 25/3 Mbps to 100/20 Mbps in its 2024 Section 706 Report (FCC 24-27, adopted March 14, 2024), set a long-term goal of 1 Gbps down and 500 Mbps up, and found about 24 million Americans without 100/20 terrestrial service as of its December 2022 data. The ratio in the benchmark is the homelab's problem: a line that meets it can still offer only 20 Mbps up, which is a few small sites or one video stream.

Access technologies differ mostly in the upstream:

| Technology | Upstream as published | Addressing | Source of the figure |
| --- | --- | --- | --- |
| **Cable, DOCSIS 3.1** | CableLabs: current modems up to 5 Gbps down and 1.5 Gbps up (its own comparison table says 1 to 2 Gbps up); deployed plans offer far less | Public IPv4, dynamic | CableLabs |
| **Cable, DOCSIS 4.0** | Up to 10 Gbps down and 6 Gbps up, via Full Duplex DOCSIS or Extended Spectrum DOCSIS (to 1.8 GHz, still in development) | Same | CableLabs |
| **Fiber** | Commonly sold symmetric | Public IPv4, dynamic on residential | Fiber Broadband Association (reach) |
| **5G fixed wireless** | Verizon 5G Home on mid-band: 5 to 10 Mbps up (25th to 75th percentile); Home Ultimate on mmWave: 25 to 75 Mbps up | Typically CGNAT | Verizon network performance disclosure, six months to February 28, 2026 |
| **Starlink** | US median 16.91 Mbps up in Ookla's 2025 data, below the 20 Mbps benchmark | Typically CGNAT | Ookla, as reported by Telecompetitor |

Fiber's reach is the swing factor. The Fiber Broadband Association (an industry association, citing RVA research) counted 98.3 million US fiber passings at the end of 2025, "over 60%" of households, and "nearly 100 million" passings in April 2026; those are industry figures, not the FCC's map. Where fiber reaches the house, upload stops being the constraint; where it doesn't, cable upstream, fixed wireless and satellite all sit near the benchmark, and the last two add CGNAT.

**Data caps** are fading but not gone. Xfinity's 1.2 TB monthly plan applies only to legacy plans, with one courtesy month in twelve and then $10 per 50 GB up to $100 a month; new Xfinity plans include unlimited data. Charter closed its acquisition of Cox on August 20, 2026, with Cox customer services rebranding to Spectrum and no immediate changes to existing Cox plans. A homelab that backs up offsite or serves media should check its plan's cap before it checks its speed.

## Static IPs, Business Plans and Residential AUPs

Residential contracts are where serving from home is decided, and they differ in what they forbid.

- **Xfinity** names servers: its acceptable use policy bars "dedicated, stand-alone equipment or servers ... that provide network content or any other services to anyone outside of your Premises local area network", with email and web hosting as examples, and allows connected devices for "personal and non-commercial residential use".
- **Spectrum** has no explicit server clause. Its residential policy limits service to a single household's residential use, bars using the service "to operate any type of business or commercial enterprise" (work-from-home use is permitted), forbids configuring "a static IP address or use any protocol other than DHCP", lists open mail relays and open proxies as abuse, and prohibits traffic "beyond typical individual, non-commercial usage". Residential plans like this bar commercial use and static addressing rather than self-hosting as such.
- **AT&T** sells static blocks on its fiber and U-verse service: 8 addresses (5 usable), 16 (13), 32 (29) or 64 (61); the price isn't on the support page.

Business plans exist to remove these limits: commercial use is allowed and static blocks are sold, at prices that often aren't on the public page (AT&T's static block page lists none). A business line plus a static block is the house's version of a colo port with a /29.

> [!IMPORTANT]
> A reverse proxy or tunnel doesn't change what the contract says. If the residential AUP bars servers for people outside the household or commercial use, a public, revenue-earning service on that line is a terms violation whether the traffic arrives by port forward or by tunnel. Read the policy for the plan actually on the account.

## Redundant Lines

A second line protects remote access and outbound work; it protects inbound services only if both lines can receive them.

**Failover and load balancing.** pfSense and OPNsense both group WAN gateways into tiers: gateways on the same tier load-balance, gateways on different tiers fail over, and pfSense allows up to five tiers with weights within a tier. OPNsense sets the trigger per group (Member Down, Packet Loss, High Latency, or Packet Loss or High Latency), monitors each gateway against its own monitor IP, applies the group through a policy-routing firewall rule on the LAN, and can kill states on failover and failback so a metered backup stops carrying traffic once the primary returns. Load balancing breaks sessions that depend on a stable source address (banking sites, some VPNs); failover doesn't, which is why failover is the common home choice.

**Path diversity.** Netgate's guidance is to use links of different types over different cable paths, because links from the same provider tend to fail together. The usable pairs at home are fiber or cable with a fixed wireless or satellite backup. The consumer side (dual-WAN routers, mesh systems with cellular backup, and the backup lines themselves) is [Failover and Backup Lines](/books/hosting-and-cloud/home-networks-and-cabling#failover-and-backup-lines); in short, a backup line can be as cheap as Starlink's $5 a month Standby Mode at 500 kbps, as reported by SatelliteInternet.com, or AT&T Internet Air from $55 a month, unlimited but subject to reduced speeds during congestion.

> [!CAUTION]
> A fixed wireless or satellite backup is usually behind CGNAT, so on failover the home's public IPv4 address disappears and port forwards stop working, even though outbound traffic (runners, GitOps, backups) keeps flowing. Anything inbound must ride a tunnel or overlay that reconnects over the backup line; CGNAT itself is covered in [Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls#ipv6-and-cgnat).

## BGP From Home

The way to keep one address across two ISPs, or across home, colo and cloud, is to own the address and announce it. Residential ISPs don't take BGP from customers, so home BGP almost always means announcing from a VPS or colo box and tunneling the traffic home.

**Getting an ASN and addresses from ARIN.** Under ARIN's policy manual any organization can be issued a single ASN on request; more than one needs a unique routing policy. An end user's initial IPv6 assignment is a /48 when one criterion is met, such as being multihomed with a global ASN. New IPv4 comes only through the waitlist, which caps a request at a /22 (a requester may accept down to a /24), and an organization holding more than a /20 is ineligible. ARIN's fee schedule effective January 1, 2026 puts an organization with IPv4 of a /24 or smaller, IPv6 of a /40 or smaller and one to three ASNs in the 3X-Small category at $275 a year; a waiver lets 3X-Small holders keep up to a /36 of IPv6 at that fee until December 31, 2026, and a new schedule takes effect January 1, 2027. IPv4 markets, transfers and leasing are Networks, Peering & IP Addresses.

**Minimum routable prefixes.** Vultr's BGP documentation states the global rule plainly: at minimum a /24 of IPv4 or a /48 of IPv6, because "smaller subnets are not routable on the internet." Vultr accepts a customer's own ASN or assigns a private one, asks for verification of ASN and prefix ownership, and peers with a fixed neighbor address on each VPS. A homelab that wants its own IPv4 therefore wants a whole /24.

**What it costs.** An ASN and a /48 fit inside the $275 a year 3X-Small fee. IPv4 for someone without space means leasing: IPXO's co-founder put the 2025 90-day average at $0.40 per IP per month and forecast $0.38 to $0.45 for most of 2026 (a leasing vendor's view), which makes a /24 about $102 a month. Add the VPS. The tunnel from the VPS home is WireGuard or GRE; the VPS announces the prefix and forwards it down the tunnel, so the home's ISP sees only encrypted traffic to one VPS address, and the prefix survives a change of ISP, a failover to a CGNAT backup, or a move to colo. The sketch is in [How to Build It](#how-to-build-it).

## Power and the Uptime of a Residence

**The utility.** The EIA reported (December 1, 2025) that the average US electricity customer was without power for about 11 hours in 2024, nearly double the prior decade's average, with interruptions from major events averaging nearly nine hours; interruptions not triggered by major events routinely average about two hours a year, and customers averaged 1.5 interruptions. Against 8,760 hours in a year:

| Case | Hours down a year | Availability | Nines it beats |
| --- | --- | --- | --- |
| 2024 average, with major events | ~11 | 99.87% | Below 99.9% (8.76 hours) |
| Typical year without major events | ~2 | 99.98% | Above 99.9%, below 99.99% (52.6 minutes) |
| Colocation target | Facility-dependent | Set by the facility's design and SLA | [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#what-a-facility-sells) |

That is power alone. ISP outages add to it, and there is no public national outage-duration measure for residential broadband to add; an operator has to measure its own line. A home without battery backup is a two-to-three-nines site on power, before the ISP, the router or the operator are counted. Error budgets against targets like these are the playbook's [SLOs](/docs/operations/slos#terms).

**The UPS buys a clean shutdown.** UPS ratings come in volt-amperes and watts; size on watts. APC's Back-UPS Pro BR1500MS2, a typical home unit, is rated 1500 VA and 900 W, line-interactive with sine-wave output and AVR, with a 233 VAh battery listed on its datasheet. Rough runtime is stored energy times inverter efficiency over load: at an assumed 80% efficiency and 100 W, 233 × 0.8 / 100 ≈ 1.9 hours. Treat that as an upper bound: lead-acid capacity falls at higher draw, full-load runtime is minutes, and the manufacturer's runtime chart governs. A UPS rides out flickers and buys time to shut down in order; it doesn't carry a lab through a multi-hour outage, and the ISP's node down the street needs power too.

**NUT orders the shutdown.** Network UPS Tools runs a driver per UPS, `upsd` serves its state over the network, and `upsmon` runs on every host: the primary is the host attached to the UPS, which shuts down last and tells the UPS to cut power; secondaries shut down first when the battery is low. The order follows the dependencies: VMs and workloads, then the hypervisors and cluster nodes, then the NAS they mount, then the primary.

**Riding through.** Ride-through takes a home battery or a generator. Tesla's Powerwall 3 datasheet lists 13.5 kWh of energy and 11.5 kW continuous output, with a seamless transition to backup through its gateway or backup switch. At a 200 W lab load that is many hours of runtime on paper, but a home battery serves the house, not the rack, and the house's load comes first.

**What power costs.** A 200 W box running all month uses 144 kWh. At the EIA's August 2026 average US residential price of 18.16 cents per kWh that is about $26 a month at home; at Hetzner's €0.33 per kWh in Germany the same 144 kWh is €47.52. Colocation doesn't make power cheaper; it makes it reliable, and it bills for it as a line item that grows faster than space.

## When the House Isn't Enough

The triggers for leaving home, each a limit from the sections above:

- **Upload.** A public service needs more upstream than the residential line has, or its traffic competes with the household's.
- **Addressing.** It needs static IPs or its own prefix without a VPS in front.
- **Contract.** It earns money or serves the public on a residential plan whose AUP bars it.
- **Uptime.** Its target is above what 2 to 11 hours a year of power loss plus unmeasured ISP outages allow.
- **The house.** Noise, heat and the power bill of the rack become household problems.

The first step is small. A single server at $99 to $179 a month (HostColor, RackNerd) or £49 (Netwise) buys a facility's power and a real port. A quarter rack around $600 (RackNerd) makes sense once several servers and the owner's own switch go together; a full rack starts around $750 to $875 (InfoBunker) or a $600 promotional cabinet (Hurricane Electric).

**Reading a colo quote.** Five units recur:

- **Space** in rack units (U), or a fraction of a rack: quarter, third, half, full.
- **Power** in amps at a voltage: kilowatts are amps times volts, so RackNerd's 1 A at 120 V is 120 W, its quarter rack's 10 A is 1.2 kW, and InfoBunker's 20 A 120 V circuit is 2.4 kW nameplate (as is its 10 A 240 V option). Hetzner meters kilowatt-hours instead. Power is the unit a homelab outgrows first: one 1 A allotment won't run a dual-socket server.
- **Bandwidth** as a flat port, a monthly transfer allotment, or a commit billed on the **95th percentile**: the provider samples traffic every five minutes in each direction, discards the top 5% of samples, and bills the higher of ingress and egress at the remaining peak, with the commit billed regardless and overage per Mbps.
- **Remote hands**, per hour or per 15 minutes (from €21 per 15 minutes to $250 an hour in the table above; RackNerd includes basic tasks such as power cycles). It is the price of not driving to the facility.
- **Cross-connects**, a monthly fee per cable to another customer, carrier or rack ($50 a month at InfoBunker; the large interconnection operators charge more and mostly don't publish it). They matter once the server needs a carrier other than the provider's.

**Blended or single-carrier transit.** Retail colo usually sells blended bandwidth: the provider buys transit from several carriers and routes over them, so one carrier's outage is the provider's problem. Single-carrier transit, such as InfoBunker's included Cogent, is cheaper and has one upstream to fail. Announcing one's own prefix (RackNerd says it does this at no charge) is what makes moving between providers an address-free change.

## Hybrid: Home, Colo and Cloud on One Network

The end state for most homelabs isn't a move; it is a split. Production that needs uptime and upload goes to colo or a VPS; development, bulk storage and anything private stays home; the cloud takes bursty or global work. What joins them is one overlay network. Tailscale's subnet routers make a whole LAN or cloud VPC reachable on the tailnet without a client on each device, several routers can advertise the same routes for high availability, and devices behind a subnet router don't count toward device limits. A subnet router at home and one in colo put the home NAS, the colo server and a cloud VPC on one private address plan; backups cross between them in both directions, which is the offsite copy the playbook's [Disaster Recovery](/docs/operations/disaster-recovery#backups) asks for. The same pattern works with plain WireGuard or self-hosted Headscale ([Exposing Home Services](/books/hosting-and-cloud/exposing-home-services)); with an ASN and a /48, the public addresses move with the workload too.

## The Alternatives

| Option | Monthly cost (as of October 2026) | Inbound reachability | Uptime set by | Failure modes | Best for |
| --- | --- | --- | --- | --- | --- |
| **Home on a residential line plus a tunnel** | The ISP plan | Through a tunnel or overlay; CGNAT is fine | Home power and one ISP | AUP exposure for public use; upload | Learning, private services |
| **Home on a business line with static IPs** | Business plan plus static block, mostly unpublished | Direct | Home power and one ISP | Power; one line | Small public services |
| **Home with dual WAN** | Two plans; a standby line from $5 | Direct on the primary, CGNAT on the backup | Home power | Inbound lost on failover without a tunnel | Keeping remote access through ISP outages |
| **Home with BGP through a VPS tunnel** | VPS, ARIN $275 a year, a leased /24 about $100 | Own prefix, from anywhere | VPS and home | Two things to run; the tunnel is a single path | Learning BGP; portable addresses |
| **1U to 4U colocation** | About $99 to $179, or £49 | Direct, provider IPs | The facility | Power allotment; remote hands cost | One or two production servers |
| **Quarter to half rack** | About $600 to $1,000 | Direct; own IPs announced | The facility | Power and contract term | Several servers and own network gear |
| **Cloud or VPS** | Varies | Direct | The provider | Egress and per-hour cost | Bursty or small public workloads |
| **Hybrid on one overlay** | The sum | Overlay through subnet routers | Each part | More moving parts | Production in colo or cloud, development and storage at home |

## My Default

My default for each stage:

- **Deploying from home:** ephemeral self-hosted runners (Actions Runner Controller pods, GitLab Runner or `act_runner`) on private repositories only, a Harbor registry on the LAN, Flux or Argo CD pulling from Git, staging as a separate namespace until cluster upgrades need a second cluster. Nothing in the delivery loop gets a port forward.
- **The line:** fiber if it reaches the house, because upload is the constraint everything else works around. On cable or fixed wireless I'd keep every public service off the home line from the start.
- **Exposure:** private services over an overlay; public ones only on a plan whose AUP allows them, which on a residential plan means behind a VPS or not at home at all.
- **Redundancy:** a second WAN of a different medium in a failover group (not load balancing) once remote access during an outage matters, accepting that inbound rides the overlay during failover.
- **Power:** a line-interactive UPS on the network core and the servers, NUT with every host a secondary and the NAS last, sized for a clean shutdown rather than ride-through.
- **BGP:** an ASN and a /48 only when I want addresses that move across home, colo and cloud; a leased /24 only if IPv4 reachability on my own prefix is the point, since a provider /29 is cheaper.
- **Leaving home:** a single 1U or 2U in colo with blended bandwidth the moment a public service needs static addressing, more upload or better than home uptime; a quarter rack when the second and third servers arrive with a switch.

What would change this: symmetric multi-gigabit fiber on a business plan with a static block, which removes the upload and addressing triggers and leaves only power; or a workload whose users are all on the overlay, which never needs to leave home.

## How to Build It

**The stage-by-stage inventory.** What each stage adds, so the next stage is a move of a known list rather than a rebuild:

| Stage | Compute | Network | Addresses | Power | Delivery |
| --- | --- | --- | --- | --- | --- |
| **1. Home lab** | Mini PCs or a small cluster, a NAS | One ISP, router owns NAT and firewall | Dynamic IPv4, ISP IPv6 prefix | UPS with NUT | Ephemeral runners, LAN registry, GitOps |
| **2. Home serving** | Same | Overlay or tunnel; business line if public | Static block on a business plan | Same | Same |
| **3. Redundant home** | Same | Second WAN of another medium, failover group | Primary static, backup CGNAT | UPS on the ONT, router and backup gear too | Same |
| **4. Own addresses** | A VPS with BGP | WireGuard tunnel from the VPS home | ASN, /48, optionally a /24 | Same | Same |
| **5. Colo plus home** | 1U to quarter rack | Subnet routers at home and colo on one overlay | Provider block or own prefix announced from colo | The facility's | Registry replicated home to colo; GitOps per cluster |

**A gateway group.** On pfSense or OPNsense the dual-WAN configuration is a gateway group selected by a LAN rule. The settings, by the names in the OPNsense and pfSense docs:

```text
System > Gateways > Configuration
  WAN_FIBER   interface WAN    monitor IP 1.1.1.1   (a distinct outside target per gateway)
  WAN_5G      interface OPT1   monitor IP 9.9.9.9

System > Gateways > Group   "FAILOVER"
  WAN_FIBER   Tier 1
  WAN_5G      Tier 2                       (same tier on both would load-balance instead)
  Trigger     Packet Loss or High Latency  (Member Down alone misses a degraded line)

Firewall > Rules > LAN
  pass  source LAN net  destination any  gateway FAILOVER
        (keep a rule above it that sends traffic for local and VPN subnets to the default
         gateway, so tunnels don't follow the group)

Firewall > Settings > Advanced
  kill states on gateway failure, and on failback, so the metered backup is released
```

**A NUT shutdown order.** The host attached to the UPS is the primary; every other host monitors it over the network as a secondary and shuts down first:

```ini
# /etc/nut/ups.conf on the primary (the host with the USB cable)
[rack]
  driver = usbhid-ups
  port = auto

# /etc/nut/upsd.users on the primary: one user per role
[monprimary]
  password = <primary password>
  upsmon primary
[monuser]
  password = <secondary password>
  upsmon secondary

# /etc/nut/upsmon.conf on the primary: shuts down last and cuts UPS power
MONITOR rack@localhost 1 monprimary <primary password> primary
SHUTDOWNCMD "/sbin/shutdown -h +0"

# /etc/nut/upsmon.conf on each hypervisor, cluster node and the NAS: shut down first
MONITOR rack@nut-primary.lan 1 monuser <secondary password> secondary
SHUTDOWNCMD "/sbin/shutdown -h +0"
```

Workloads stop with their hosts. Secondaries all act on the same low-battery signal, so if the NAS serves the hypervisors' storage, use `upssched` timers to start the hypervisors' shutdown on battery earlier than the NAS's.

**BGP on a VPS with a tunnel home.** The VPS announces the prefix to the provider and forwards it over WireGuard; the home router routes traffic sourced from the prefix back up the tunnel. The ASNs and prefixes below are placeholders from the documentation ranges; the neighbor addresses are the ones Vultr's BGP page gives for a VPS, and the provider's ASN, password and session details come from its setup instructions. Values in angle brackets are secrets to fill in.

```text
# /etc/bird.conf on the VPS (BIRD 2)
define MY_AS       = 64496;            # your ARIN ASN
define PROVIDER_AS = 64511;            # placeholder: the provider's ASN from its BGP page
router id 198.51.100.10;               # the VPS's public IPv4

protocol device {}

protocol static own4 {                 # originate the /24; traffic is routed by wg0 below
  ipv4;
  route 203.0.113.0/24 blackhole;
}
protocol static own6 {
  ipv6;
  route 2001:db8:100::/48 blackhole;
}

protocol bgp provider4 {
  local as MY_AS;
  neighbor 169.254.169.254 as PROVIDER_AS;   # the provider's IPv4 neighbor
  multihop 2;                                # if the provider's instructions call for it
  password "<from the provider>";
  ipv4 { import none; export where net = 203.0.113.0/24; };
}
protocol bgp provider6 {
  local as MY_AS;
  neighbor 2001:19f0:ffff::1 as PROVIDER_AS; # the provider's IPv6 neighbor
  multihop 2;
  password "<from the provider>";
  ipv6 { import none; export where net = 2001:db8:100::/48; };
}
```

```ini
# /etc/wireguard/wg0.conf on the VPS: wg-quick installs routes for AllowedIPs,
# which are more specific in the kernel than BIRD's blackhole (BIRD exports nothing to it)
[Interface]
Address = 10.255.0.1/31
ListenPort = 51820
PrivateKey = <vps private key>
PostUp = sysctl -w net.ipv4.ip_forward=1 net.ipv6.conf.all.forwarding=1

[Peer]                                  # the home router
PublicKey = <home public key>
AllowedIPs = 10.255.0.0/31, 203.0.113.0/24, 2001:db8:100::/48

# /etc/wireguard/wg0.conf on the home router: dials out, so CGNAT and failover don't matter
[Interface]
Address = 10.255.0.0/31
PrivateKey = <home private key>
Table = off                             # don't make the tunnel the default route
# the /24 and /48 are assigned to a DMZ VLAN on this router; replies from them go up the tunnel
PostUp = ip rule add from 203.0.113.0/24 table 200; ip route add default dev wg0 table 200
PostUp = ip -6 rule add from 2001:db8:100::/48 table 200; ip -6 route add default dev wg0 table 200
PostDown = ip rule del from 203.0.113.0/24 table 200; ip -6 rule del from 2001:db8:100::/48 table 200

[Peer]
PublicKey = <vps public key>
Endpoint = 198.51.100.10:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

Confirm with the provider that traffic sourced from the announced prefix is accepted from the VPS, and size the VPS's bandwidth allowance for everything the prefix serves, since all of it crosses the VPS twice.

**The lab in the core model.** The homelab is its own account, as in [The Homelab](/books/hosting-and-cloud/homelab); each site is a region with its underlay, servers are `server` resources, the overlay and tunnel are `network` and `interconnect` resources, and owned prefixes are `ip_address` resources whose identifiers are held over time, so a move from home to colo is a change of `region_id`, not of identity:

```sql
-- Sites as regions: the underlay says whose building and line it is.
INSERT INTO regions (id, name, country, underlay, status) VALUES
  ('home',     'Home',              'US', 'residential fiber, UPS',  'available'),
  ('colo-nyc', 'Colo, 1U New York', 'US', 'retail colo, 1 A 120 V', 'available'),
  ('vps-bgp',  'BGP VPS',           'US', 'cloud VPS with BGP',      'available');

-- The owned prefixes, announced from the VPS today and from colo later.
WITH p AS (
  INSERT INTO resources (account_id, kind, region_id, state, exists_during)
  VALUES (:lab_account, 'ip_address', 'vps-bgp', 'active', tstzrange(NOW(), NULL))
  RETURNING id
)
INSERT INTO resource_identifiers (resource_id, kind, value, held_during)
SELECT id, k, v, tstzrange(NOW(), NULL)   -- the /24 is recorded in CIDR form
FROM p, (VALUES ('ipv4', '203.0.113.0/24'), ('ipv6_prefix', '2001:db8:100::/48')) AS ids (k, v);
```

The trigger that matters most, upload, is measurable with the same meters a colo provider bills by. Five-minute upstream samples from the router as `usage_events`, read the way a 95th-percentile bill reads them:

```sql
-- Monthly 95th percentile of upstream Mbps per site, against the line's upload.
SELECT r.region_id, date_trunc('month', lower(e.occurred_during)) AS month,
       percentile_disc(0.95) WITHIN GROUP (ORDER BY e.quantity * 8 / 300 / 1e6) AS p95_up_mbps
FROM usage_events e
JOIN resources r ON r.id = e.resource_id
WHERE e.meter = 'egress.bytes'
  AND e.dimensions->>'interval' = '5m'
  AND e.account_id = :lab_account
GROUP BY 1, 2
ORDER BY 2, 1;
```

When the home site's 95th percentile sits near the plan's upload, or an outage log shows hours a year of downtime against a target in minutes, the next row in the inventory is due. That row is the next chapter: [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-colocation-is-sold) takes the same quote from the facility's side, from the power, cooling and space it sells to [cross-connects](/books/hosting-and-cloud/data-centers-and-colocation#cross-connects-and-interconnection) and [remote hands](/books/hosting-and-cloud/data-centers-and-colocation#remote-hands).

## What This Means for the System You Build

- **Make the delivery loop outbound-only:** polling runners, a LAN registry and pull-based GitOps need no inbound port, so NAT and CGNAT stop mattering for deploys.
- **Keep home runners ephemeral and private:** never attach a self-hosted runner on the home network to a public repository.
- **Plan around upload, not download:** a 100/20 line is a 20 Mbps server, and fixed wireless and satellite add CGNAT.
- **Read the AUP for the plan on the account:** residential terms bar servers, commercial use or static addressing, and a tunnel doesn't change the contract.
- **Fail over, don't load-balance,** on a second line of a different medium, and expect inbound to need the overlay while on backup.
- **Own addresses when portability is the point:** an ASN and a /48 cost $275 a year; IPv4 means a whole /24.
- **Size the UPS for a clean shutdown** and let NUT shut hosts down in dependency order; ride-through is a battery or generator decision.
- **Do the uptime math:** a residence is two to three nines on power alone, before the ISP.
- **Read colo quotes in units:** U, amps at a voltage, bandwidth model, remote hands and cross-connects; power is the line that grows.
- **End hybrid on one overlay,** with production where the uptime is and storage where the disks are.

## References

**Deploying from home**

- [GitHub Docs: About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners), free runner software, scopes, owner-maintained OS
- [GitHub Docs: Self-hosted runners reference](https://docs.github.com/en/actions/reference/runners/self-hosted-runners), outbound HTTPS on 443, required hosts, the 60-second re-queue and 24-hour queue limit
- [GitHub Docs: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use), self-hosted runners and public repositories, just-in-time runners
- [GitLab Docs: GitLab Runner](https://docs.gitlab.com/runner/), MIT agent, registration and executors
- [GitLab Docs: Compute minutes](https://docs.gitlab.com/ci/pipelines/compute_minutes/), private runners to reduce compute-minute use
- [Gitea: Gitea 1.19.0 is released](https://blog.gitea.com/release-of-1.19.0/), Gitea Actions as a preview with `act_runner`, March 20, 2023
- [GitHub: distribution v3.0.0](https://github.com/distribution/distribution/releases/tag/v3.0.0), Distribution 3.0.0, April 3, 2025
- [CNCF: Harbor graduation](https://www.cncf.io/announcements/2020/06/23/cloud-native-computing-foundation-announces-harbor-graduation/), June 23, 2020, Harbor's access control, scanning, signing and replication
- [OpenGitOps](https://opengitops.dev/), the pull-based GitOps principles

**Broadband and ISP terms** (as of October 2026)

- [FCC: 2024 Section 706 Report (FCC 24-27)](https://docs.fcc.gov/public/attachments/FCC-24-27A1_Rcd.txt), the 100/20 benchmark, the 1 Gbps/500 Mbps goal and the unserved count
- [CableLabs: DOCSIS 4.0 technology](https://www.cablelabs.com/technologies/docsis-4-0-technology), DOCSIS 3.1 and 4.0 capacities, Full Duplex and Extended Spectrum
- [Fiber Broadband Association: historic fiber deployment highs](https://fiberbroadband.org/2025/12/16/fiber-broadband-association-reports-historic-fiber-deployment-highs/), 98.3 million passings and over 60% of households, December 16, 2025 (industry association figure)
- [Fiber Broadband Association: total passings reach 100M](https://fiberbroadband.org/2026/04/15/u-s-fiber-broadband-total-passings-reach-100m-mark/), April 15, 2026 (industry association figure)
- [Verizon: Network performance](https://www.verizon.com/about/our-company/network-performance), 5G Home and Home Ultimate upload ranges, six months to February 28, 2026
- [Telecompetitor: Starlink median speeds short of federal minimums](https://www.telecompetitor.com/starlink-median-u-s-speeds-still-short-of-federal-minimums-ookla-report/), Ookla's 2025 Starlink medians
- [Xfinity: Data usage plan](https://www.xfinity.com/support/articles/data-usage-plan), the legacy 1.2 TB plan, overage and unlimited data on new plans
- [Fierce Network: Charter closes its Cox acquisition](https://www.fierce-network.com/broadband/charter-closes-its-cox-acquisition-elaborates-immediate-plans), August 20, 2026, the Spectrum rebrand and unchanged plans
- [Xfinity: Acceptable Use Policy](https://www.xfinity.com/corporate/customers/policies/highspeedinternetaup), the servers clause and personal, non-commercial use
- [Spectrum: Residential Internet Use Policy](https://www.spectrum.com/policies/internet-use-policy), residential and non-commercial use, no static IP configuration, abuse of resources (viewed October 27, 2026)
- [AT&T: Static IP address blocks](https://www.att.com/support/article/u-verse-high-speed-internet/KM1002300/), blocks of 8, 16, 32 and 64 and usable counts
- [AT&T: Internet Air](https://www.att.com/internet/internet-air/), price, unlimited data and congestion management
- [SatelliteInternet.com: Starlink pause and Standby Mode](https://www.satelliteinternet.com/resources/starlink-pause-standby-mode/), Standby Mode at $5 a month and 500 kbps

**Multi-WAN and BGP**

- [Netgate: Multiple WAN connections](https://docs.netgate.com/pfsense/en/latest/multiwan/index.html), gateway groups and path diversity
- [Netgate: Load balancing and failover](https://docs.netgate.com/pfsense/en/latest/multiwan/load-balance-and-failover.html), tiers, weights and the five-tier limit
- [OPNsense: Multi WAN](https://docs.opnsense.org/manual/how-tos/multiwan.html), trigger levels, monitor IPs, policy routing and state handling on failover and failback
- [ARIN: Number Resource Policy Manual](https://www.arin.net/participate/policy/nrpm/), single ASN on request, IPv4 waitlist limits, end-user IPv6 /48 criteria
- [ARIN: Fee schedule](https://www.arin.net/resources/fees/fee_schedule/), 3X-Small at $275 a year from January 1, 2026, the /36 waiver to December 31, 2026, the 2027 schedule
- [Vultr Docs: Configuring BGP on Vultr](https://docs.vultr.com/configuring-bgp-on-vultr), own or private ASN, /24 and /48 minimums, ownership verification and neighbor addresses
- [CircleID: 2025 IPv4 price trends and 2026 predictions](https://www.circleid.com/posts/2025-ipv4-price-trends-2026-predictions), IPXO co-founder's lease prices and forecast, September 11, 2025 (vendor view)

**Power and reliability**

- [EIA: US electricity customers averaged about 11 hours of interruptions in 2024](https://www.eia.gov/todayinenergy/detail.php?id=66744), December 1, 2025, major-event and non-event durations and frequency
- [EIA: Electric Power Monthly, Table 5.6.A](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), average residential price, August 2026
- [APC: Back-UPS Pro BR1500MS2](https://www.se.com/us/en/product/BR1500MS2/), VA and watt ratings, topology and battery
- [Network UPS Tools: User manual overview](https://networkupstools.org/docs/user-manual.chunked/Overview.html), drivers, `upsd`, and `upsmon` primary and secondary roles
- [Tesla: Powerwall 3 datasheet](https://digitalassets.tesla.com/tesla-contents/image/upload/powerwall-3-datasheet-na-en.pdf), energy, continuous power and backup transition

**Colocation pricing** (as of October 2026)

- [HostColor: 1U to 4U colocation](https://www.hostcolor.com/colocation/colo1u), prices, power, 95th-percentile transfer, addresses and remote hands
- [RackNerd: Colocation](https://bf2021.racknerd.com/colocation), single server, quarter and half rack plans, remote hands and own-IP announcement
- [InfoBunker: Rack cost](https://infobunker.com/rack_cost.shtml), full rack, circuits, Cogent bandwidth, cross-connects and remote hands
- [Hurricane Electric: Colocation](https://he.net/colocation.html), the $600 cabinet with 1 Gbps, one per customer
- [Hetzner: Colocation](https://www.hetzner.com/colocation/), rack prices, kWh power pricing, remote hands, traffic and the pause on new colocation
- [Netwise: 1U, 2U and 4U colocation](https://netwise.co.uk/solutions/1u-2u-4u-colocation), prices, power and bandwidth
- [Zenlayer: Burstable 95th percentile billing](https://docs.console.zenlayer.com/welcome/pricing/network-billing/burstable-95th), five-minute samples, discarded top 5% and the higher direction

**Hybrid**

- [Tailscale: Subnet routers](https://tailscale.com/kb/1019/subnets), advertising LAN and VPC routes, high availability and device limits
