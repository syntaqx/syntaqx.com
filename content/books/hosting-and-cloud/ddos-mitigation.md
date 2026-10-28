+++
title = "DDoS Mitigation"
description = "Volumetric and application-layer DDoS: reflection, SYN floods, HTTP/2 Rapid Reset, record attacks, per-PoP mitigation, scrubbing, blackholing and billing."
category = "Hosting & Cloud Industry"
order = 2177
part = "The Edge"
tags = ["ddos", "edge", "security", "bgp", "http2", "billing"]
+++

A denial-of-service attack doesn't break in; it uses up something the target needs to answer. The thing used up can be bandwidth (a link filled with UDP), packet processing (millions of small packets a second that each cost a lookup), connection state (half-open TCP handshakes that hold memory), or application work (HTTP requests that each run a database query). A distributed attack does it from many sources at once, so no single address can be blocked to stop it. Every provider in this book is a target, a shield or both: a host's customers are attacked, the host's own network is attacked to reach them, and an edge network sells protection by standing in front of the target and absorbing what's thrown.

What makes DDoS an industry topic and not only a security one is that the defense is capacity, and capacity is the provider's balance sheet. A 31.4 Tbps attack can't be filtered at the customer's router because it never fits through the customer's link; it has to be dropped somewhere with more than 31.4 Tbps of ingress, spread across enough locations that no one location melts. That favors networks that are already large for other reasons (CDNs, hyperscalers, scrubbing specialists), and it raises a billing question every provider has had to answer in public: who pays for traffic the customer never wanted? This chapter covers the attack families and why they work, the record attacks and what each taught, HTTP/2 Rapid Reset in depth, where mitigation happens (per-PoP automation, scrubbing centers, on-prem appliances, blackholing, BGP diversion), the billing rules, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `ddos_events`, `ddos_policies` and prefix protection records. Application-layer filtering that isn't flood defense (WAF rules, bot scoring, rate limits) is [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits); how anycast spreads traffic across locations is [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#anycast).

## How the Providers Do It

As of October 2026:

| Provider | Model | Layers | Attack traffic and the bill | Paid tier | Notes |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare** | Anycast reverse proxy; Magic Transit announces a customer's prefixes over BGP and returns clean traffic through tunnels | L3/4 and L7 | "Unmetered" since 25 Sep 2017: no extra charge or termination for attack size, on every plan | Higher plans add reporting, tuning tools and support, not more volumetric mitigation | Detection runs on every server; L3/4 and HTTP rules mitigate in "up to three seconds on average" |
| **Akamai (Prolexic)** | Scrubbing network: routed GRE (BGP for a /24 or larger), IP Protect for smaller space, Direct Connect; on-prem appliances (Corero) with cloud overflow | L3/4; L7 in App & API Protector | Contracted | Always-on or on-demand | 32 scrubbing centers, "20+ Tbps" dedicated capacity, a "zero-second SLA" (vendor claims) |
| **Fastly** | Anycast edge with adaptive L7 rules | L3/4 absorbed; non-HTTP traffic dropped; L7 adaptive | "Zero Attack Fees": billing "based on legitimate traffic," never attack spikes | DDoS Protection product | "578 Tbps as of March 31, 2026" (vendor figure) |
| **AWS Shield** | Standard on CloudFront, Route 53 and load balancers; Advanced per payer account | Standard L3/4; Advanced adds L7 auto-mitigation through AWS WAF | Advanced: service credits for attack-driven scaling charges, on request | Advanced: 1-year commitment; AWS's pricing examples use $3,000 a month | Shield Response Team needs a Business or Enterprise support plan |
| **Google Cloud Armor** | Protection in Google's edge in front of its load balancers | L3/4 automatic; L7 through security policies and Adaptive Protection | Not stated on the pages opened | Enterprise for always-on L3/4 and Adaptive Protection | Its own infrastructure absorbed the 398M rps Rapid Reset peak |
| **Azure DDoS Protection** | Per virtual network (Network Protection) or per public IP (IP Protection) | L3/4 only; L7 "you need to add" a WAF | Network Protection: "any scale out costs during a DDoS attack are covered" | IP Protection $199 a month per IP; Network Protection covers 100 public IPs | Network Protection includes Rapid Response and WAF discounts |
| **Bunny (Shield)** | CDN edge with WAF, rate limiting and bot detection in one product | L3/4 and L7 | Not stated on the page opened | Shield tiers | "200 Tbps+" across "119 global scrubbing centers" (vendor claim) |

Three patterns run through the table:

- **Protection follows the network.** Every product here is sold by a company whose network was already large; the DDoS product is that capacity, metered differently.
- **Basic volumetric protection is free and automatic; response and tuning are sold.** Shield Standard, Cloud Armor's automatic protection and Cloudflare's free plan cost nothing extra, and Azure applies default infrastructure-level protection to services outside a protected network. What's paid is a response team, cost protection, L7 tuning, prefix diversion and reporting.
- **Billing for attack traffic became a competitive line.** Cloudflare's "unmetered," Fastly's "zero attack fees," AWS's and Azure's cost credits all answer the same customer fear, in three different mechanisms covered below.

## How DDoS Mitigation Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Sept 1996 | SYN floods in the wild after a Phrack write-up; an ISP's mail servers go down; CERT Advisory CA-1996-21 | (The attack) half-open TCP state exhausted with few packets | SYN cookies and SYN caches in every TCP stack |
| May 2000 | RFC 2827 (BCP 38): ingress filtering of spoofed source addresses | Spoofed floods, at the source network | Works only where deployed; the deployer protects others, not itself |
| Mar 2013 | Spamhaus attack: about 120 Gbps at Cloudflare, more than 300 Gbps reported upstream, from open DNS resolvers | (The attack) amplification at scale | Congestion at LINX, AMS-IX, DE-CIX, HKIX and tier 1 networks |
| Sept 2016 | KrebsOnSecurity hit with about 620 Gbps from hacked IoT devices; Akamai calls it nearly double its largest | (The attack) botnets of routers, cameras and DVRs | Defenders size for a new class of source |
| Oct 2016 | RFC 7999: the BLACKHOLE community, 65535:666 | A standard signal to drop traffic to an attacked prefix | The target goes dark; the attack achieves its goal |
| 1 Dec 2016 | AWS Shield: Standard free, Advanced with "DDoS cost protection" | Bill spikes after an attack | A paid tier for the credit |
| Sept 2017 | Google absorbs 2.5 Tbps of spoofed CLDAP, DNS and SNMP reflection (disclosed Oct 2020) | (The attack) state-sponsored scale reflection | Capacity planned for terabits |
| 25 Sep 2017 | Cloudflare announces "Unmetered Mitigation" on all plans | Surge pricing and termination of attacked customers | Capacity cost carried by the provider |
| 27 Feb to 1 Mar 2018 | Memcached reflection (amplification "up to 51,000"); GitHub hit with 1.35 Tbps on 28 Feb | (The attack) a UDP service with no checks, exposed by default | GitHub reroutes to Akamai over BGP; minutes of downtime |
| Mid-2019 | Cloudflare's dosd detects and mitigates on every edge server | Central detection too slow and too far from the traffic | Per-server mitigation logic to keep correct everywhere |
| 13 Aug 2019 | Magic Transit described: customer prefixes announced on anycast, GRE back to the customer | Whole-network protection without a scrubbing center | Customer's routing depends on the provider |
| Q1 2020 | AWS reports a 2.3 Tbps CLDAP reflection attack | (The attack) | |
| 10 Oct 2023 | HTTP/2 Rapid Reset (CVE-2023-44487) disclosed: 201M rps at Cloudflare, 398M rps at Google | Protocol-level request floods | Server patches across the industry; connection-level policing |
| Q2 to Q4 2025 | Cloudflare reports 7.3 Tbps (45 seconds), then 29.7 Tbps (Aisuru), then 31.4 Tbps (35 seconds) | (The attacks) hyper-volumetric bursts too short for humans | Mitigation must be autonomous |
| H1 2026 | Cloudflare counts 935 network-layer attacks over 1 Tbps, 805 of them in Q2 | | |

## Volumetric Attacks and Reflection

A volumetric attack fills a link or a router's packet budget. The simplest is a **UDP flood**: UDP has no handshake, so a botnet can send packets with any payload to any port, and the target's link carries them whether or not anything listens. Measured in bits per second it fills pipes; measured in packets per second it exhausts the per-packet work of routers and kernels, which is why record reports give both (7.3 Tbps and 4.8 billion packets per second in Cloudflare's Q2 2025 record). **Carpet bombing** spreads the flood across many destination addresses or ports so per-target thresholds don't trip: the 29.7 Tbps Aisuru attack hit "an average of about 15,000 destination ports per second."

**Reflection and amplification** use other people's servers. The attacker sends small UDP requests with the victim's address forged as the source; the servers send their larger answers to the victim. Two properties make it work: UDP services that answer without verifying the sender (QUIC builds that check into the protocol: [HTTP/3 and QUIC](/books/hosting-and-cloud/tls-and-protocols#http-3-and-quic)), and networks that let packets with forged source addresses leave. The amplification factor is the ratio of response to request, and CISA's table of bandwidth amplification factors shows why some protocols dominate:

| Protocol | Bandwidth amplification factor (CISA) |
| --- | --- |
| DNS | 28 to 54 |
| NTP | 556.9 |
| SSDP | 30.8 |
| SNMPv2 | 6.3 |
| CLDAP | 56 to 70 |
| CharGEN | 358.8 |
| Memcached | 10,000 to 51,000 |

The 2013 Spamhaus attack was DNS reflection through open recursive resolvers: about 120 Gbps reached Cloudflare and one tier 1 provider reported more than 300 Gbps, from attackers with "only about 1/100th" of that capacity, and when Cloudflare's peers filtered it the load moved upstream to congest tier 1 networks and Internet exchanges. Memcached was worse because the service was exposed by default: "By default memcached listens on INADDR_ANY and runs with UDP support ENABLED," Cloudflare wrote on 27 Feb 2018 after seeing 260 Gbps from port 11211 and a 15-byte request return a 750 kB response. The next day GitHub took 1.35 Tbps and 126.9 million packets per second from the same technique. Google's 2.5 Tbps in September 2017 spoofed 167 million packets per second to 180,000 exposed CLDAP, DNS and SNMP servers; AWS's 2.3 Tbps in Q1 2020 was CLDAP reflection. In the first half of 2026 Cloudflare said "the attack-vector center of gravity shifted from botnet floods to reflection and amplification," with CLDAP floods up 580% quarter over quarter.

The fix at the source is **BCP 38** (RFC 2827, May 2000): a network drops packets leaving it whose source address isn't one of its own prefixes, so "the problem of source address spoofing can be virtually eliminated" for that network's customers. It has been the standard for a quarter century and reflection still works, because the incentive is backwards: the network that filters protects everyone else's victims, not its own customers, and one unfiltered network anywhere is enough for an attacker. CISA's advice to defenders lists BCP 38 first, then flow monitoring, stateful UDP inspection, RTBH with upstream coordination and hardening of amplifiers (disabling unneeded UDP services, DNS response rate limiting). For a provider, the hardening half is a duty to others: a cloud or host whose customers run open resolvers, memcached on UDP or exposed CLDAP is running amplifiers, and scanning for and closing them is part of the [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure) chapter's work.

## SYN Floods and SYN Cookies

A TCP server that receives a SYN allocates state for the half-open connection and waits for the client's ACK. A **SYN flood** sends SYNs (usually spoofed) and never completes the handshake, filling the backlog so real clients can't connect. RFC 4987 dates the attack's arrival: a Phrack write-up with an exploit tool in July 1996, attacks in the wild by September 1996 including one on an ISP's mail servers, then CERT Advisory CA-1996-21. It was serious because it "targets end-host resources, which require fewer packets to deplete."

The durable defense is the **SYN cookie**, credited by RFC 4987 to D. J. Bernstein: the server allocates nothing for a half-open connection and instead encodes what it needs (a time counter, an index into a small table of MSS values, and a keyed hash of the addresses and ports) in the initial sequence number of its SYN-ACK. A real client's ACK echoes that number plus one; the server recomputes the cookie, and only a match creates the connection. The cost is that the cookie has room for little: only a few MSS values fit, and options that need state, such as window scaling and SACK, are limited while cookies are in use. The **SYN cache** alternative keeps a small hashed table of half-open entries and evicts the oldest per bucket. RFC 4987 also lists what doesn't work well: bigger backlogs (implementations don't scale), shorter timers (drop legitimate slow clients) and recycling the oldest entry (fails at high rates).

At provider scale, SYN floods are handled before the kernel's TCP stack: Cloudflare runs L4Drop, a group of XDP programs that apply rules from earlier attacks to packets as they arrive and send samples to the detector, and mitigates L3/4 attacks with eBPF programs inside it. The principle is the same as the cookie's: spend no state on a packet you haven't verified.

## Application-Layer Floods

An application-layer (L7) flood sends requests that look valid: completed TCP handshakes, completed TLS handshakes, well-formed HTTP. Each one costs the target far more than a packet does (a TLS handshake, a cache miss, a database query), so a much smaller attack in bits does as much damage. They're measured in requests per second, and the records climbed from 2.7 million rps against YouTube in March 2014 (by JavaScript injected into websites) and a 6 million rps attack on a Google Cloud customer, to 46 million rps (Google's record before 2023), 201 million rps in Cloudflare's Rapid Reset peak, 398 million at Google, and 205 million rps in Cloudflare's "Night Before Christmas" campaign of late 2025.

L7 floods can't be stopped by dropping packets, because the packets are fine; the request has to be classified. The techniques (anomaly detection against a learned baseline, fingerprints of the attacking client's TLS and HTTP behavior, challenges, per-client rate limits, and rules generated on the fly from attack signatures) are the same machinery as the WAF, bot and rate-limit chapter's, run automatically and at higher volume. Akamai sells this inside App & API Protector ("powered by the new Behavioral DDoS Engine"), AWS as Shield Advanced's automatic application-layer mitigation (it "enforces AWS WAF rate limiting on requests from known DDoS sources" and adds custom rules during an attack, in count or block), Google as Cloud Armor Adaptive Protection (which "can suggest or automatically apply mitigating rules" and requires Enterprise), Azure as an HTTP DDoS ruleset in its Front Door WAF, and Fastly as an Adaptive Threat Engine that builds "tailored rules" per attack. Azure says it plainly: its DDoS Protection covers layers 3 and 4, and "for web applications protection at layer 7, you need to add protection at the application layer using a WAF offering."

## HTTP/2 Rapid Reset

HTTP/2 multiplexes many requests (streams) over one TCP connection. A server limits how many may be open at once with `SETTINGS_MAX_CONCURRENT_STREAMS` ("The specification recommends that a server offer no fewer than 100 streams"), and that limit was what kept one connection from asking for unlimited work. Rapid Reset defeats it. The client sends a `HEADERS` frame with `END_STREAM`, which opens a request, and immediately sends `RST_STREAM` to cancel it. A cancelled stream is closed, and closed streams don't count against the concurrency limit, so the client can open the next one at once. The server has already begun the work of each request (parsing, routing, often dispatching to a backend) before it sees the cancel. In Cloudflare's proof of concept the server advertised 100 streams and the client sent 525 requests in one packet without waiting for a single response. As Cloudflare put it, "stream concurrency on its own cannot mitigate rapid reset."

The campaign showed what a protocol feature does at botnet scale. Cloudflare first saw it on 25 Aug 2023 and measured a peak just above 201 million rps, nearly three times its previous record of 71 million, from a botnet of about 20,000 machines, roughly 100 machines per million requests per second, far more efficient than a classic flood. Google measured 398 million rps, about 7.5 times its previous record of 46 million, with a peak lasting two minutes. The disclosure was coordinated: Cloudflare, Google and AWS worked with server and proxy vendors and published together on 10 Oct 2023, when the issue became CVE-2023-44487 (rated high, CVSS 7.5, in Google's post), so that patches for open-source and commercial HTTP/2 implementations shipped with the announcement rather than after it.

The mitigations are worth knowing because they generalize to any protocol whose cheap client action triggers expensive server work:

- **Count the cheap action per connection.** Cloudflare counted stream resets per connection and closed connections over a threshold with `GOAWAY`, noting that "Legitimate clients might make one or two mistakes in a connection and that is acceptable."
- **Stop the work early.** It moved the blocking to the TLS proxy at the start of its HTTPS pipeline, so abusive connections cost less before being dropped.
- **Punish the client across the network.** IP Jail was extended so a jailed address was blocked from the attacked property and barred from using HTTP/2 on any other Cloudflare domain for a period.
- **Tune concurrency carefully.** Lowering the stream limit to 64 disconnected legitimate clients, so it went back to 100; the limit isn't the defense.
- **Patch the server.** Every HTTP/2 implementation needed changes to account for reset streams, which is why disclosure waited for vendors.

## Botnets

Who sends the traffic changed twice. **Reflection** made the attacker's own capacity almost irrelevant: open resolvers are "like bazookas," the 2013 post said, because they sit on large servers with high-bandwidth links. **IoT botnets** then made the sources real devices that complete handshakes. Mirai, studied over seven months in a 2017 USENIX Security paper, reached "a peak of 600k infections," "composed primarily of embedded and IoT devices," and hit "several high-profile targets" in late 2016; the 2016 Krebs attack was traced to routers, IP cameras and DVRs "protected by weak or hard-coded passwords," and its traffic was SYN, GET and POST floods plus a large share of GRE packets, none of it reflection.

The 2025 records came from the same lineage at larger scale. Cloudflare estimates the Aisuru botnet (and its Aisuru-Kimwolf variant) at "1-4 million infected hosts," the latter "mainly infected Android TVs," with "chunks" rented out as botnets-for-hire for "a few hundred to a few thousand U.S. dollars"; it says Aisuru caused "widespread collateral Internet disruption" because its traffic crossed ISPs that weren't targets. Cloud virtual machines are the third source: Cloudflare first attributed its 11.5 Tbps attack of early September 2025 mostly to Google Cloud, then corrected it to "a combination of several IoT and cloud providers." For a cloud provider, that makes DDoS an outbound problem too: a fleet of rented VMs on fast links is a botnet if the accounts are fraudulent or the instances compromised, which is the [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#free-tier-farming) and [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure) chapters' business.

## Where Mitigation Happens

Attack traffic has to be dropped somewhere with more capacity than the attack, and before it reaches anything that would fail. There are five places to do it, and providers combine them.

**Per-PoP, autonomous, on an anycast network.** On an [anycast](/books/hosting-and-cloud/networks-peering-and-ip-addresses#anycast) network every location announces the same addresses, so a distributed botnet's traffic lands at whichever locations are nearest each bot, and the attack is divided by the number of locations before anyone acts. Each location then has to drop its share alone, fast, because hyper-volumetric attacks are over before a human could join a call: 45 seconds for 7.3 Tbps, 35 seconds for 31.4 Tbps. Cloudflare's design is the public reference. A daemon, dosd, runs on every server in every data center, samples packets and HTTP requests out of the traffic path ("so they can asynchronously detect DDoS attacks without causing latency"), runs heuristic rules, and on a match generates a signature in real time from whichever fields carry signal (a widely distributed attack won't use source IP). The signature becomes a mitigation rule pushed to the cheapest point in the stack (XDP or eBPF for L3/4, IP Jails that drop L7 attackers at L4), and the rule is ephemeral: it "expire[s] shortly after the attack has ended." Each server "can make decisions on its own without seeking a centralized consensus"; a core system (Gatebot) handles distributed attacks that need a view across locations. Cloudflare reported that dosd detected 98.6% of L3/4 attacks and, after its L7 expansion, mitigated 81% of L7 attacks, and its docs give "up to three seconds on average" to mitigate. It averaged 5,376 automatically mitigated attacks an hour in 2025.

**Scrubbing centers.** A smaller number of large locations, each with filtering capacity, receive the customer's traffic, clean it, and forward the remainder. Akamai's Prolexic is the long-running example: 32 scrubbing centers, "20+ Tbps of dedicated DDoS defense capacity" on a network of "1+ Pbps" (vendor figures), with always-on routing (all traffic, all the time) or on-demand routing (only during an attack, which the customer's network team triggers). The tradeoff is latency and capacity concentration against simplicity: traffic detours through a scrubbing site, and the site's capacity is the ceiling.

**BGP diversion of the customer's prefix.** For a customer that has its own address space (a hosting provider, a game company, a bank), the protector announces the customer's prefix from its own network so all traffic for those addresses arrives there first. Clean traffic goes back to the customer through tunnels, because the customer can no longer receive it directly: Magic Transit announces the prefix "to transit providers, peers, and Internet exchanges in each data center," then sends clean packets through anycast GRE (or IPsec, or a private interconnect), with return traffic leaving the customer's network directly (direct server return) or also through the protector. Prolexic's routed GRE needs "an advertisable IPv4 /24 or larger (or IPv6 /48)," because longer prefixes aren't accepted across the Internet. GitHub's 2018 recovery is the on-demand version in practice: at 17:26 UTC it withdrew its announcements from transit providers and announced AS36459 only over links to Akamai, and the site was back by 17:30; its write-up concluded that being "less dependent upon human involvement requires better automated intervention."

**On-premises appliances.** A box at the customer's edge filters what arrives. It sees traffic in detail and costs no detour, but it can't filter what doesn't fit through the link in front of it, so it is sold as a tier for small, frequent attacks with cloud scrubbing behind it for large ones (Akamai offers "on-prem scrubbing (Corero)" paired with cloud overflow).

**Remotely triggered blackholing (RTBH).** The cheapest tool, and a blunt one. The attacked network announces the target address with the BLACKHOLE community (RFC 7999, Oct 2016: `65535:666`), and neighbors that honor it discard all traffic to that address. RFC 7999 says blackhole prefixes are "as specific as possible, /32 for IPv4 or /128 for IPv6," should stay local with `NO_EXPORT` or `NO_ADVERTISE`, and should never take effect without explicit operator configuration; it warns that an adversary adding the community "may cause a denial-of-service attack based on denial of reachability." The cost is the obvious one: the target is unreachable, which is what the attacker wanted. RTBH protects everyone sharing the link and the upstream from the attack, at the price of the one address. Hosting providers use it to save a shared network when one customer is hit, and the UGP book's [suspension versus takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown) discussion of collateral on shared infrastructure applies.

## Attack Traffic and the Bill

Before 2017 a customer on a usage-billed network paid for attack traffic like any other, and some protection services charged more as attacks grew. Cloudflare's 25 Sep 2017 announcement named the practice "surge pricing," called it "barely a step above extortion," and committed to three things on every plan: no termination for attack size (it had previously removed customers from its network during large attacks, which it called "FINTing"), no bill increase after an attack, and volumetric mitigation "officially unlimited and unmetered." It claimed "more than 15 terabits per second" of mitigation capacity at the time.

The industry now uses three mechanisms, and they differ in who carries the risk and how much paperwork the customer does:

| Mechanism | Example | How it works | What the customer does |
| --- | --- | --- | --- |
| **Never metered** | Cloudflare plans | Attack size doesn't affect price; bandwidth isn't the plan's meter | Nothing |
| **Excluded at metering** | Fastly DDoS Protection | "billing based on legitimate traffic that your business wants, never for the attack spikes"; volumetric attacks aren't billed for delivery or egress | Nothing; the exclusion happens before rating |
| **Credited after the fact** | AWS Shield Advanced, Azure DDoS Network Protection | Charges are billed, then credited for the attack's share on request | Files a claim; meets prerequisites |

AWS's terms show what a credit model asks of the customer. Credits cover Shield Advanced data transfer out, CloudFront requests and data transfer, Route 53 queries, Global Accelerator data transfer, Application Load Balancer capacity units and EC2 instances "created by an auto-scaling policy in response to the attack." The resource must have been protected before the attack, CloudFront and ALB resources must have a web ACL with a rate-based rule in block mode, the customer must follow AWS's DDoS resiliency practices, and the claim must arrive "within the 15 day period immediately following the billing month in which the attack occurred," subject to the Shield Response Team confirming that an attack happened and that protected resources scaled because of it. Credits apply only to Shield Advanced usage and are valid for 12 months. Azure's Network Protection promises "data-transfer and application scale-out service credit for resource costs incurred as a result of documented DDoS attacks," and its IP Protection tier differs precisely in lacking cost protection, rapid response support and WAF discounts.

> [!WARNING]
> Cost protection on a credit model covers only resources protected before the attack began: AWS says "Protected resources added during an attack are not eligible for cost protection." Enabling the subscription doesn't protect individual resources either; each has to be added.

A provider building this needs one decision written down: whether mitigated traffic is ever a billable event. My rule is that it isn't, ever, and that served traffic inside an attack window is billed only up to a baseline. The model below makes both rules part of rating, not a support ticket.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Always-on anycast edge** (Cloudflare, Fastly, CloudFront with Shield, Cloud Armor, Bunny) | Traffic always flows through a proxy network that announces the addresses | Attack divided across locations before mitigation; seconds to mitigate; no detour | Only protects what's proxied (HTTP, or prefixes onboarded); a provider-wide bug becomes the customer's outage | Proprietary services | Plan or usage, attack traffic excluded or credited | Websites and APIs of every size |
| **BGP-diverted scrubbing, always-on** (Magic Transit, Prolexic) | Provider announces the customer's prefix and tunnels clean traffic back | Whole network protected, any protocol | Tunnel MTU and routing complexity; needs a /24 or larger; depends on the provider's routing | Proprietary; the customer keeps its addresses | Contract, often by clean bandwidth | Hosts, ISPs, game networks, banks |
| **BGP-diverted, on demand** | Traffic diverted only during an attack | No detour in peacetime | Minutes of outage before diversion (GitHub: about 5 minutes to reroute); humans in the loop | Proprietary | Lower retainer, per-event | Networks with rare attacks |
| **On-prem appliance** | Filter at the customer edge | Detailed visibility, no detour | Can't stop what exceeds the link | Vendor hardware and license | Capital plus support | Networks combining it with cloud overflow |
| **RTBH at upstreams** | Drop all traffic to the target address | Free, fast, protects shared links | Target fully offline; abuse of the community | RFC 7999 practice | Free | Hosting providers and ISPs as a last resort |
| **Do nothing special** (cloud default protection only) | Provider's automatic L3/4 protection | No cost, no setup | No L7 defense; attack-driven scaling billed | The cloud's terms | Usage, including attack-driven scaling | Most small cloud workloads |

## My Default

For anything served over HTTP, my default is to put it behind an always-on anycast edge whose plan doesn't bill attack traffic, with L7 DDoS rules on and in their default action, and to keep the origin reachable only from that edge so the attacker can't go around it. That buys protection that scales with someone else's network, mitigation in seconds without a person awake, and a bill that doesn't depend on the attacker. The tradeoff is concentration: the edge provider's own outage is mine, and its global config mistakes are mine too, which the WAF chapter's rollout section and the [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#the-edge-outages) chapter deal with.

For a provider with its own address space and non-HTTP traffic (a host, a game network, a VPS cloud), I'd run BGP-diverted protection always-on rather than on demand, because hyper-volumetric attacks last less time than a human takes to divert, and keep RTBH as the last resort for one address when the shared network is at risk. I'd build on-demand diversion only if attacks were rare and the detour latency mattered more than a few minutes of outage. On a credit-model cloud, I'd enroll every internet-facing resource before an attack, because protection added during one isn't covered.

## How to Build It

The chapter adds `ddos_events`, `ddos_event_locations`, `ddos_policies` and `prefix_protections`, plus mitigation meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). A protected website is a `cdn_zones` row from [The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it); a protected customer prefix is a `resource_identifiers` row (kind `'ipv4'` holding a CIDR, or `'ipv6_prefix'`); a location is an `edge_locations` row from [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#how-to-build-it).

```sql
CREATE TABLE prefix_protections (        -- a customer prefix the provider announces
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id              UUID NOT NULL REFERENCES accounts (id),
  resource_identifier_id  UUID NOT NULL REFERENCES resource_identifiers (id),
  mode                    TEXT NOT NULL CHECK (mode IN ('always_on', 'on_demand')),
  return_path             TEXT NOT NULL CHECK (return_path IN ('gre', 'ipsec',
                            'private_interconnect')),
  egress                  TEXT NOT NULL CHECK (egress IN ('direct_server_return',
                            'via_provider')),
  loa_ref                 TEXT NOT NULL,   -- the customer's authorization to announce it
  announced_during        TSTZRANGE,       -- null while on demand and not diverted
  valid_during            TSTZRANGE NOT NULL
);

CREATE TABLE ddos_policies (             -- per-target overrides of the managed defaults
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id              UUID NOT NULL REFERENCES accounts (id),
  cdn_zone_id                 UUID REFERENCES cdn_zones (resource_id),
  prefix_protection_id    UUID REFERENCES prefix_protections (id),
  layer                   TEXT NOT NULL CHECK (layer IN ('l3_l4', 'l7')),
  rule_ref                TEXT,            -- null: the whole managed ruleset
  sensitivity             TEXT NOT NULL CHECK (sensitivity IN ('default', 'high',
                            'medium', 'low', 'off')),
  action                  TEXT NOT NULL CHECK (action IN ('default', 'block',
                            'challenge', 'log')),
  valid_during            TSTZRANGE NOT NULL,
  created_by              TEXT NOT NULL,   -- typed actor: a user, 'support:<case>'
  CHECK (num_nonnulls(cdn_zone_id, prefix_protection_id) = 1)
);

CREATE TABLE ddos_events (               -- one attack as the provider observed it
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id              UUID REFERENCES accounts (id),  -- null: an attack on the provider
  cdn_zone_id                 UUID REFERENCES cdn_zones (resource_id),
  resource_identifier_id  UUID REFERENCES resource_identifiers (id),  -- address or prefix
  layer                   TEXT NOT NULL CHECK (layer IN ('l3_l4', 'l7')),
  vectors                 TEXT[] NOT NULL, -- 'udp_flood', 'syn_flood', 'dns_reflection',
                                           -- 'cldap_reflection', 'memcached_reflection',
                                           -- 'http_flood', 'http2_rapid_reset', 'carpet_bomb'
  peak_bps                BIGINT,
  peak_pps                BIGINT,
  peak_rps                BIGINT,
  active_during           TSTZRANGE NOT NULL,      -- open upper bound while ongoing
  detected_at             TIMESTAMPTZ NOT NULL,
  mitigated_by            TEXT NOT NULL CHECK (mitigated_by IN ('edge_autonomous',
                            'global_detection', 'scrubbing', 'rtbh', 'manual_rule',
                            'not_mitigated')),
  signature               JSONB,           -- the generated fingerprint, for analysis
  billing_excluded        BOOLEAN NOT NULL DEFAULT TRUE,
  confirmed_by            TEXT             -- 'system' or the analyst; credits need it
);                                       -- zone and identifier both null: the provider's own edge

CREATE INDEX ddos_events_window ON ddos_events USING GIST (active_during);

CREATE TABLE ddos_event_locations (      -- where it landed and how much each absorbed
  ddos_event_id           UUID NOT NULL REFERENCES ddos_events (id),
  edge_location_id        TEXT NOT NULL REFERENCES edge_locations (id),
  peak_bps                BIGINT,
  peak_pps                BIGINT,
  PRIMARY KEY (ddos_event_id, edge_location_id)
);
```

The meters, all `usage_events.meter` values. The edge meters `cdn.egress_bytes` and `cdn.requests` are [The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it)'s; this chapter adds a rating rule for them and two meters that are recorded but never rated:

| Meter | Unit | Counted when | Rated |
| --- | --- | --- | --- |
| `cdn.egress_bytes`, `cdn.requests` | byte, request | Served traffic, per zone | Yes, with the attack-window rule below |
| `ddos.mitigated_bytes` | byte | Sampled bytes dropped by mitigation rules, scaled by the sample rate | No: reporting only |
| `ddos.mitigated_requests` | request | Requests dropped, challenged or jailed by DDoS rules | No: reporting only |

Mitigated traffic never produces a billable event at all, because the edge counts it on a separate meter with no SKU. Served traffic during an attack is the harder case: an L7 flood that passes the filters still costs egress and requests, and under a zero-attack-fee rule it shouldn't be billed above what the zone normally serves. A sketch of that rule at rating time, taking the same hour of the week over the previous four weeks as the baseline:

```sql
-- Billable edge usage per zone and hour for an account's billing period ($2):
-- above-baseline traffic inside a billing-excluded attack window isn't billed.
WITH hourly AS (
  SELECT u.resource_id AS cdn_zone_id, u.meter,
         date_trunc('hour', lower(u.occurred_during)) AS hour,
         SUM(u.quantity) AS qty
  FROM usage_events u
  WHERE u.account_id = $1
    AND u.meter IN ('cdn.egress_bytes', 'cdn.requests')
    AND u.occurred_during && $2::tstzrange
  GROUP BY 1, 2, 3
),
baseline AS (
  SELECT h.cdn_zone_id, h.meter, h.hour,
         (SELECT AVG(p.qty) FROM (
            SELECT SUM(u.quantity) AS qty
            FROM usage_events u
            WHERE u.resource_id = h.cdn_zone_id AND u.meter = h.meter
              AND date_trunc('hour', lower(u.occurred_during))
                  IN (h.hour - interval '7 days', h.hour - interval '14 days',
                      h.hour - interval '21 days', h.hour - interval '28 days')
            GROUP BY date_trunc('hour', lower(u.occurred_during))) p) AS typical
  FROM hourly h
)
SELECT h.cdn_zone_id, h.meter, h.hour, h.qty AS measured,
       CASE WHEN e.id IS NULL THEN h.qty
            ELSE LEAST(h.qty, COALESCE(b.typical, 0)) END AS billable,
       e.id AS ddos_event_id
FROM hourly h
JOIN baseline b USING (cdn_zone_id, meter, hour)
LEFT JOIN LATERAL (
  SELECT d.id FROM ddos_events d
  WHERE d.cdn_zone_id = h.cdn_zone_id AND d.billing_excluded
    AND d.active_during && tstzrange(h.hour, h.hour + interval '1 hour')
  LIMIT 1) e ON TRUE;
```

In production the baseline is a precomputed table, not a correlated subquery, but the shape is the point. Notes on the sketch:

- **The exclusion is a rating rule, not an edit.** `usage_events` stays append-only. Because rating is a deterministic function of events, price versions and `ddos_events`, an attack confirmed after the invoice closed is handled by rerating the period and issuing the difference as an adjustment, the core model's rule for late facts.
- **A credit model is the same data, later.** A provider that bills first and credits on claim computes the same excess and writes a `credit_grants` row with `source_ref` pointing at the `ddos_events.id`; the core model has no dedicated credit kind for this yet, so it is `'goodwill'` until the [Metering & Rating](/books/hosting-and-cloud/metering-and-rating) chapter adds one.
- **Events are evidence.** `confirmed_by`, `signature`, the vectors and per-location peaks are what a credit claim, an SLA dispute or a law enforcement referral needs; an automatically mitigated attack is confirmed by `'system'`.
- **Attacks on the provider are events too.** `account_id` is null when the target is the provider's own infrastructure, so capacity planning and threat reports read from the same table.
- **Prefix announcements need authority.** `loa_ref` records the customer's letter of authorization (and the route objects behind it) before the provider announces someone else's address space; announcing a prefix without it is a hijack.
- **Events:** `ddos.attack_started`, `ddos.attack_ended`, `ddos.policy_changed`, `prefix.diverted` and `prefix.withdrawn` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, analytics and billing.

## Auditing

- **Every attack, with what mitigated it.** Start, end, vectors, peaks per location, the generated signature and the mitigation layer, kept long enough to answer a credit claim, an SLA claim ([SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits#claims-and-deadlines)) or a referral.
- **Every policy override and who made it.** A customer who lowered sensitivity to stop false positives and was then flooded will ask; the override, its author and its validity range answer.
- **Billing exclusions reproducible from events.** For each attack window, measured versus billed quantities per meter, so the "you won't pay for attack traffic" promise can be shown, and rerating after a late confirmation is diffable.
- **Prefix announcements and their authority.** When each customer prefix was announced or withdrawn, on what letter of authorization, and who triggered on-demand diversion.
- **Blackholes.** Every RTBH announcement, the address, the reason, the duration and the customer notice, since a blackhole is a full outage the provider chose.

## What This Means for the System You Build

- **Treat capacity as the defense,** and put HTTP services behind a network bigger than any attack, with the origin reachable only from it.
- **Make mitigation autonomous at each location;** attacks of 35 to 45 seconds don't wait for an on-call engineer.
- **Count the cheap client action** in every protocol you serve (resets, handshakes, retries) and police it per connection.
- **Close your own amplifiers:** no open resolvers, no UDP memcached, no exposed CLDAP on customer machines, and filter spoofed sources leaving your network.
- **Write down whether attack traffic is billable,** make the rule part of rating, and keep attack events as the evidence.
- **Keep RTBH for the last resort,** with a notice to the customer whose address went dark.
- **Enroll before the attack** on any credit model, because protection added during one doesn't count.

## References

**Specifications and advisories**

- [RFC 2827: Network Ingress Filtering (BCP 38)](https://www.rfc-editor.org/rfc/rfc2827.html), source-address validation, May 2000, and its limits
- [RFC 4987: TCP SYN Flooding Attacks and Common Mitigations](https://www.rfc-editor.org/rfc/rfc4987.html), the 1996 attacks and CERT CA-1996-21, SYN cookies and Bernstein's credit, SYN caches and what doesn't work
- [RFC 7999: BLACKHOLE Community](https://www.rfc-editor.org/rfc/rfc7999.html), 65535:666, prefix lengths, NO_EXPORT and the abuse risk, Oct 2016
- [CISA: UDP-Based Amplification Attacks (TA14-017A)](https://www.cisa.gov/news-events/alerts/2014/01/17/udp-based-amplification-attacks), bandwidth amplification factors and mitigation advice

**Record attacks and threat reports**

- [Cloudflare: The DDoS That Almost Broke the Internet](https://blog.cloudflare.com/the-ddos-that-almost-broke-the-internet/), the March 2013 Spamhaus attack, open resolvers and IXP congestion
- [KrebsOnSecurity: KrebsOnSecurity Hit With Record DDoS](https://krebsonsecurity.com/2016/09/krebsonsecurity-hit-with-record-ddos/), the September 2016 attack, Akamai's figures and IoT sources
- [USENIX Security 2017: Understanding the Mirai Botnet](https://www.usenix.org/conference/usenixsecurity17/technical-sessions/presentation/antonakakis), 600k peak infections, IoT composition and authorship
- [Google Cloud: Exponential growth in DDoS attack volumes](https://cloud.google.com/blog/products/identity-security/identifying-and-protecting-against-the-largest-ddos-attacks), the 2.5 Tbps attack of September 2017, packet-rate records and the 2014 HTTP record
- [Cloudflare: Memcrashed](https://blog.cloudflare.com/memcrashed-major-amplification-attacks-from-port-11211/), memcached reflection, 27 Feb 2018, defaults and amplification
- [GitHub: February 28th DDoS Incident Report](https://github.blog/news-insights/company-news/ddos-incident-report/), 1.35 Tbps, the BGP reroute to Akamai and the timeline
- [AWS Security Blog: AWS Shield Threat Landscape report is now available](https://aws.amazon.com/blogs/security/aws-shield-threat-landscape-report-now-available/), the 2.3 Tbps CLDAP reflection attack in Q1 2020
- [Cloudflare: DDoS threat report for 2025 Q2](https://blog.cloudflare.com/ddos-threat-report-for-2025-q2/), 7.3 Tbps and 4.8 Bpps, as short as 45 seconds
- [Cloudflare: DDoS threat report for 2025 Q3](https://blog.cloudflare.com/ddos-threat-report-2025-q3/), 29.7 Tbps carpet bombing, Aisuru's size and rental market
- [Cloudflare: DDoS threat report for 2025 Q4](https://blog.cloudflare.com/ddos-threat-report-2025-q4/), 31.4 Tbps in 35 seconds, 205M rps, 47.1 million attacks and 5,376 an hour in 2025, Aisuru-Kimwolf
- [Cloudflare: DDoS threat report for 2026 H1](https://blog.cloudflare.com/ddos-threat-report-2026-h1), 935 attacks over 1 Tbps, the shift to reflection and CLDAP growth
- [Cloudflare on X: the 11.5 Tbps attack](https://x.com/Cloudflare/status/1962559687368593552), the early attribution to Google Cloud
- [Cloudflare on X: correction](https://x.com/Cloudflare/status/1962953494459252843), "a combination of several IoT and cloud providers"

**HTTP/2 Rapid Reset**

- [Cloudflare: HTTP/2 Rapid Reset, deconstructing the record-breaking attack](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/), the mechanism, 201M rps, 20,000 machines, coordinated disclosure and mitigations
- [Google Cloud: Google mitigated the largest DDoS attack to date, peaking above 398 million rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps), 398M rps, the previous 46M record, CVSS 7.5 and Cloud Armor guidance

**Mitigation architecture**

- [Cloudflare: A deep-dive into Cloudflare's autonomous edge DDoS protection](https://blog.cloudflare.com/deep-dive-cloudflare-autonomous-edge-ddos-protection/), dosd, Gatebot, L4Drop, sampling and detection rates
- [Cloudflare DDoS Protection: How DDoS protection works](https://developers.cloudflare.com/ddos-protection/about/how-ddos-protection-works/), out-of-path sampling, signatures, ephemeral rules and time to mitigate
- [Cloudflare: Magic Transit, network functions at Cloudflare scale](https://blog.cloudflare.com/magic-transit-network-functions/), prefix announcement, anycast GRE and per-customer namespaces, 13 Aug 2019
- [Cloudflare Magic Transit: About](https://developers.cloudflare.com/magic-transit/about/), ingress and egress modes, tunnel types and direct server return
- [Akamai: Prolexic](https://www.akamai.com/products/prolexic-solutions), scrubbing centers, capacity, deployment modes, prefix requirements and SLA claims
- [Akamai: App & API Protector](https://www.akamai.com/products/app-and-api-protector), the Behavioral DDoS Engine for L7
- [Bunny: Shield](https://bunny.net/docs/shield), the bundled DDoS, WAF, rate limiting and bot detection, and capacity claims
- [Google Cloud Armor: Overview](https://docs.cloud.google.com/armor/docs/cloud-armor-overview), automatic protection, Enterprise and Adaptive Protection
- [Microsoft Learn: Azure Web Application Firewall on Azure Front Door](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/afds-overview), the HTTP DDoS ruleset evaluated before custom rules
- [Microsoft Learn: Azure DDoS Protection overview](https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview), tiers, L3/L4 scope, auto-tuned policies and the cost guarantee

**Billing and protection tiers**

- [Cloudflare: Unmetered Mitigation](https://blog.cloudflare.com/unmetered-mitigation/), the 25 Sep 2017 commitments, surge pricing and FINTing
- [Fastly: DDoS Protection](https://www.fastly.com/products/ddos-protection), zero attack fees, adaptive rules and capacity
- [AWS: Shield pricing](https://aws.amazon.com/shield/pricing/), Standard at no charge, the 1-year Advanced commitment, the $3,000 examples and payer-account billing
- [AWS News Blog: AWS Shield, protect your applications from DDoS attacks](https://aws.amazon.com/blogs/aws/aws-shield-protect-your-applications-from-ddos-attacks/), the 1 Dec 2016 launch and cost protection
- [AWS Shield Advanced: Capabilities and options](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-advanced-summary-capabilities.html), WAF coverage, automatic L7 mitigation, the SRT and support-plan requirement
- [AWS Shield Advanced: Requesting a credit after an attack](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-request-service-credit.html), eligible charges, prerequisites, the 15-day window and 12-month validity
- [Azure: DDoS Protection pricing](https://azure.microsoft.com/en-us/pricing/details/ddos-protection/), IP Protection per IP, the 100-IP Network Protection plan and cost protection
