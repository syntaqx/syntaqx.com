+++
title = "Networks, Peering & IP Addresses"
nav_title = "Networks, Peering & IPs"
description = "How requests find a PoP: DNS steering and anycast, PoP counts, transit, peering and IXPs, embedded caches, route security, and IPv4 scarcity, charges and reuse."
category = "Hosting & Cloud Industry"
order = 2174
part = "The Edge"
tags = ["anycast", "bgp", "peering", "ipv4", "ipv6", "rpki", "edge"]
+++

Every edge product in this part assumes that a visitor's packets arrive at a nearby location and that the location can reach the origin and the visitor's network cheaply. Both are network facts, not software ones. The first depends on how the provider steers requests (by DNS, by anycast routing, or both) and on where it has put machines; the second depends on how it connects to the thousands of other networks that make up the internet: by paying for transit, by peering at exchanges, by private cables to large networks, or by putting its caches inside those networks. Underneath both sit IP addresses, which the provider has to hold, route, secure and reuse, and the IPv4 kind ran out years ago.

For a provider the twist is that each of these is a cost line and a trust line at once. Transit is a bill that grows with traffic; peering is a negotiation that lowers it; an embedded cache is free capacity in exchange for operating hardware in someone else's building. Address space is an asset bought on a market, a monthly charge passed to customers, and a reputation that follows each address from one customer to the next, which is why the core model treats addresses as identifiers held over time. This chapter covers how a request finds a PoP, anycast, what PoP counts mean, transit, peering and interconnection, embedded caches, route security, egress addressing, IPv4 exhaustion and the RIR rules after it, the transfer and lease markets, provider IPv4 charges, BYOIP, IPv6 adoption and reputation on reused addresses, then extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `edge_locations`, `edge_interconnects`, `ip_blocks` and the public IPv4 meter. The network inside a data center (leaf-spine fabrics, BGP between racks) is the [Data Center Networking](/books/hosting-and-cloud/data-center-networking#how-a-fabric-works) chapter's; the business the network serves is [The Edge Business](/books/hosting-and-cloud/edge-business).

## How the Providers Do It

As of October 2026, from each provider's own pages and filings:

| Provider | Request steering | Footprint claim | Inside other networks | Capacity claim |
| --- | --- | --- | --- | --- |
| **Cloudflare** | Anycast for ingress; soft-unicast for egress | 348 cities; 13,000+ network interconnections | Not stated on the pages opened | No readable figure on its network page |
| **Akamai** | Not stated on the pages opened | "More than 4,300 edge points-of-presence in over 130 countries and approximately 700 cities" (10-K) | "Roughly 1,200 network partners"; in 1999, 1,475 servers across 55 networks | Not stated in the 10-K |
| **Fastly** | Not stated on the pages opened | About 114 live cities on its network map, "fewer, more powerful POPs" | Not stated | "622 Tbps of connected global capacity" (data dated 30 Jun 2026) |
| **Amazon CloudFront** | DNS routes each request to the POP "that can best serve the request" | 750+ POPs in 100+ cities in 50+ countries; 15 regional edge caches | 1,140+ embedded POPs in 300+ cities, inside ISP networks | "Hundreds of terabits of deployed capacity" |
| **Google Cloud CDN** | Global anycast addresses on the external Application Load Balancer; requests go to the closest Google Front End | No edge count in the overview opened | Google Global Cache nodes in ISP networks (a separate ISP program) | Not stated |
| **Bunny** | Not stated on the pages opened | 119 PoPs (standard network), 10 (volume network) | Not stated | Not stated |

Three patterns run through the table:

- **Counts are marketing units, not a shared measure.** A Cloudflare city, an Akamai point of presence, a CloudFront embedded POP and a Fastly POP are different things (a data center with many servers, a rack in an ISP, a cache appliance in a carrier's building), and the denominators (cities, countries, PoPs) differ too.
- **The largest networks put capacity inside access networks.** Akamai has done it since 1999, CloudFront counts more embedded POPs than its own, and the largest content companies (Netflix, Google) run their own embedded programs.
- **Anycast ingress and DNS steering coexist.** Cloudflare and Google's load balancer announce the same addresses everywhere; CloudFront's documentation describes DNS choosing the POP. Each choice has its failure modes, covered next.

## How Networks and Addresses Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Jan 2006 | RFC 4271, BGP-4: "an inter-Autonomous System routing protocol," over TCP port 179 | One protocol for routing between networks | Trust in every neighbor's announcements |
| Dec 2006 | RFC 4786 (BCP 126), "Operation of Anycast Services" | Running one service address from many locations | Transactions that can land on two nodes |
| 24 Feb 2008 | Pakistan Telecom (AS17557) announces a /24 inside YouTube's /22; PCCW Global (AS3491) propagates it for about two hours | (The failure) a more specific route wins everywhere | The case for origin validation and filtering |
| 3 Feb 2011 | IANA's IPv4 free pool depleted; each RIR receives a final /8 | | Every network's growth from then on is transfers, NAT or IPv6 |
| 15 Apr 2011 | APNIC reaches its final /8; at most a /22 per account holder | | The first RIR into rationing |
| Feb 2012 | RFC 6480: the RPKI and Route Origin Authorizations | Cryptographic proof of who may originate a prefix | Certificates and repositories to run |
| Jun 2012 | Netflix announces Open Connect: caches installed in ISPs, or peering at exchanges, both free to the ISP | Delivery at a scale where buying a CDN cost more than building one | Hardware, operations and ISP relationships |
| 2012 | RIPE NCC reaches its last /8 and starts /22 allocations | | |
| Jan 2013 | RFC 6811: Valid, Invalid and NotFound origin validation | Routers that can reject an unauthorized origin | ROA hygiene becomes routing hygiene |
| 24 Sep 2015 | ARIN issues the last addresses in its free pool | | A waiting list and a transfer market |
| 25 Nov 2019 | RIPE NCC runs out of IPv4; a waiting list for a single /24 per new LIR | | |
| 14 Jan 2020 | AFRINIC enters Phase 2 of exhaustion; pending requests over /22 reduced to /22 | | |
| Aug 2020 | LACNIC reserves its last available IPv4 block; recovered space quarantined for six months | | |
| 25 Nov 2022 | Cloudflare describes soft-unicast: one egress /32 per data center, shared by port slicing | Egress addressing without an address per server | A custom routing layer |
| 1 Feb 2024 | AWS charges $0.005 per public IPv4 address-hour | Passing the cost of scarce addresses to users | Bills for addresses that were free |
| 20 Nov 2024 to Oct 2026 | DE-CIX Frankfurt peaks at 18.11 Tbps, then 21.47 Tbps during Champions League streaming (announced 14 Oct 2026, with global DE-CIX traffic at 32.10 Tbps) | | Exchange capacity sized for live events |

## How a Request Finds a PoP

Two mechanisms put a visitor on a location, and most networks use some of each.

**DNS-based steering.** The provider's authoritative DNS answers each lookup with the address of a location chosen for the resolver that asked. CloudFront documents it in one line: "DNS routes the request to the CloudFront POP (edge location) that can best serve the request, typically the nearest CloudFront POP in terms of latency." Steering by DNS lets the provider choose per lookup on measured latency, load and cost, drain a location by changing answers, and send different customers to different sets of locations. Its limits are the resolver (the choice is made for the resolver's location, not the visitor's) and caching (an answer lives for its TTL, so a drained location keeps receiving traffic from resolvers that cached it).

**Anycast.** Every location announces the same addresses in BGP, and the internet's routing picks the location for each packet. RFC 4786 defines it as "making a particular Service Address available in multiple, discrete, autonomous locations," and says plainly that "The routing system decides which node is used for each request." The details are in [Anycast](#anycast) below.

**Inside the location**, a load balancer spreads connections across servers; Cloudflare's Unimog does it at L4 in XDP, and the caching chapter's [Request Collapsing](/books/hosting-and-cloud/caching-and-invalidation#request-collapsing) covers how a location then decides which server holds an object.

## Anycast

BGP is the protocol that makes anycast work. RFC 4271 describes it as "an inter-Autonomous System routing protocol": each network (autonomous system, AS) tells its neighbors which prefixes it can reach and the path of ASes behind each, sessions run over TCP port 179, and each router picks one best path per prefix by policy and path attributes, not by measured latency. When a hundred locations announce the same prefix, every network on the internet picks one of them for its own reasons: the shortest AS path, a cheaper link, a peering preference. That is why anycast is fast to fail over (a location that withdraws its announcement disappears from routing, and traffic flows to the next one networks prefer) and why it absorbs attacks: a distributed botnet's traffic lands at the locations nearest each bot, the property [Where Mitigation Happens](/books/hosting-and-cloud/ddos-mitigation#where-mitigation-happens) relies on.

The costs are in the same sentence of RFC 4786. Because routing decides, the provider doesn't: a visitor in one city can be routed to a location across a continent because of an upstream network's policy, and the fix is a routing negotiation, not a configuration change. And routing can change mid-conversation. RFC 4786 warns that packets of one transaction can reach different nodes, which matters for anything stateful: a TCP connection whose packets move to another location there finds no connection and is reset. Operators manage it by keeping announcements stable, by making locations self-sufficient (each terminates TLS and holds its own caches, so a new connection anywhere works), and by moving long-lived or stateful sessions to unicast addresses. Fly.io gives each app "unlimited Anycast IPv6 addresses" at no charge; Google's global external Application Load Balancer offers "Global Anycast external IP addresses" with requests "routed to the GFE that is closest to the client on the internet."

**Egress can't be anycast.** An edge that fetches from origins or sends traffic on a customer's behalf needs replies to come back to the server that sent the request, and on anycast they would arrive at whichever location routing chose. Cloudflare's answer, described on 25 Nov 2022, is **soft-unicast**: one IPv4 /32 per data center for egress, shared by its servers through port slicing (each server owns a range of source ports; a 2,048-port slice lets one address serve 31 servers), with egress ranges still announced by anycast and an internal layer forwarding return packets over the backbone to the right data center and server. It exists because an address per server per egress purpose (per country, per trust level) would cost too much IPv4, which is the subject of the second half of this chapter.

## PoP Counts and Why They Don't Compare

Every provider publishes a footprint, dated and marketed, and they measure different things:

| Provider | Claim | Unit | Viewed |
| --- | --- | --- | --- |
| Cloudflare | 348 cities | Cities with at least one data center | 27 Oct 2026 |
| Akamai | 4,300+ PoPs, ~700 cities, 130+ countries | Points of presence, many inside partner networks | FY2025 10-K |
| CloudFront | 750+ POPs; 15 RECs; 1,140+ embedded POPs in 300+ cities | Own POPs, regional caches and caches inside ISPs, counted separately | 27 Oct 2026 |
| Fastly | About 114 live cities; 622 Tbps | Cities on the map; capacity at 30 Jun 2026 | 27 Oct 2026 |
| Bunny | 119 PoPs (standard), 10 (volume) | PoPs per network tier | 27 Oct 2026 |

Three things make the numbers incomparable. **The unit:** a city can hold one rack or several data centers, and an embedded appliance in an ISP's building serves only that ISP's customers. **The design:** Fastly says it places "fewer, more powerful POPs at strategic markets," so a smaller count can mean more capacity per location and more cache per object; Akamai's count is high because so much of it sits inside access networks. **The claim:** capacity figures ("connected" capacity, "deployed" capacity) are self-reported and undefined on the pages, and none of these is audited. What matters to a customer is measurable instead: latency and throughput from its visitors' networks, cache hit ratio per location, and which locations its price tier actually uses (Bunny's volume network is 10 of its locations).

## Transit, Peering and Interconnection

A network reaches the rest of the internet in three ways, and the mix is the cost structure of an edge business:

- **Transit.** A provider pays an upstream network to carry its traffic to every destination on the internet. It is universal and simple, and it is billed by capacity used, so it grows with traffic.
- **Peering.** Two networks exchange traffic between their own customers directly, usually without payment ("settlement-free"), because both save transit. Public peering happens at an internet exchange point (IXP), a shared switching fabric where many networks connect once and peer with many; private peering is a dedicated cable between two networks' routers in the same building, a **private network interconnect (PNI)**, used when the traffic between them is large enough to fill ports.
- **Embedded capacity.** The content network puts its servers inside the access network, so the traffic never crosses an interconnect at all (next section).

The economics show in the filings and in the exchanges. Limelight's 2022 combination with Edgecast projected $30 to 35 million a year of savings in "colocation and internet peering" costs, the costs that don't fall when per-gigabyte prices do. Netflix's Open Connect page describes the same menu from the content side: settlement-free interconnection "through direct private interconnects or IXP-based peering," and notes that "peering alone can be beneficial." Exchanges have become very large: DE-CIX Frankfurt peaked at 18.11 Tbps on 20 Nov 2024 and at 21.47 Tbps on an evening of UEFA Champions League streaming reported on 14 Oct 2026, with about 1,100 networks connected there and 32.10 Tbps across DE-CIX's exchanges worldwide. The peak is an event, not an average, which is why exchange and peering capacity is sized for the biggest live broadcast of the year.

The directory everyone uses is **PeeringDB**, "a freely available and public tool" run by volunteers, where networks publish their ASNs, peering policies, the exchanges and facilities they are present in, and contacts. When viewed on 27 Oct 2026 it listed 1,332 exchanges, 35,771 networks, 5,885 facilities, 66,544 network-to-exchange connections and 62,664 network-to-facility connections. A provider's PeeringDB record is part of its product: it is how an access network decides to peer with it. Cloudflare's filing counts interconnections with over 13,000 networks.

## Embedded Caches in Access Networks

The cheapest interconnect is the one that doesn't exist. An embedded cache is a content network's server installed inside an ISP, filled overnight or on demand, serving that ISP's subscribers without crossing a peering link:

- **Netflix Open Connect**, announced in June 2012 with ISPs offered appliances in their data centers or peering at exchanges, both free of charge; Netflix still provides embedded appliances "to qualifying ISP partners at no charge," with the ISP supplying rack space, power, connectivity and BGP configuration, and works with "over a thousand ISPs." In 2012 Netflix said it would keep using commercial CDNs "for the next few years" while about 5% of its data was already served by Open Connect.
- **Google Global Cache**: Google provides the hardware, the ISP provides space, power, a connection and a BGP feed, and Google operates the cache remotely; Google says "Typically between 70-90% of cacheable traffic can be served from GGC."
- **Akamai** has deployed its servers across other companies' networks from the start (its 1999 prospectus counts 1,475 servers across 55 telecommunications networks) and now counts about 1,200 network partners.
- **CloudFront** counts 1,140+ embedded POPs in 300+ cities "located inside ISP networks, closest to end viewers," separately from its 750+ POPs.

The deal works because both sides save: the ISP carries less traffic over its paid upstream links, and the content network gets capacity and proximity without colocation fees. The costs are operational (hardware in hundreds of buildings the provider doesn't control) and commercial (only networks with enough traffic to an ISP get a rack in it). For the data model, an embedded location is a location like any other with a host network attached, because which ISP's building a cache sits in decides who may be served from it.

## Route Security

BGP accepts what neighbors announce, so a mistaken or malicious announcement can redirect traffic for someone else's addresses. Two failure types recur: a **hijack**, where a network originates a prefix it doesn't hold, and a **leak**, where a network passes on routes it should have kept to itself. The 2008 YouTube incident was both in one: Pakistan Telecom announced 208.65.153.0/24, a more specific part of YouTube's 208.65.152.0/22, and PCCW Global passed it to the rest of the internet; because routers prefer the most specific route, YouTube traffic worldwide went to Pakistan from 18:47 UTC until PCCW withdrew the routes at 21:01. YouTube's own response was to announce the /24 and then two /25s, which won by the same longest-prefix rule.

The defenses are now standard:

- **RPKI and ROAs** (RFC 6480, Feb 2012). The address holder signs a Route Origin Authorization: "an explicit authorization for a single AS to originate routes to one or more prefixes," with an optional maximum length.
- **Route origin validation** (RFC 6811, Jan 2013). Routers check each announcement against the validated ROAs and mark it Valid (an authorization matches its origin and length), Invalid (an authorization covers the prefix but none matches) or NotFound (no authorization covers it), and networks that drop Invalid routes stop the plain hijack. A ROA with a loose maximum length invites the more-specific attack it was meant to stop.
- **MANRS**, a routing-security initiative supported by the Global Cyber Alliance, with four actions: filtering (ensure the correctness of your own announcements and your customers'), anti-spoofing (source address validation), coordination (current contact information) and global validation (publish routing data so others can validate it). It runs programs for network operators, exchanges, CDN and cloud providers, and vendors.

For a provider these become records: every prefix it announces has a ROA naming the ASes allowed to originate it, checked regularly; every customer prefix it announces on the customer's behalf (BYOIP, DDoS diversion) has a letter of authorization and a matching ROA before the first announcement. When an incident happens, a coincident hijack is not proof of cause: Cloudflare's write-up of its 14 Jul 2025 1.1.1.1 outage found the cause in its own configuration and reported a coincident BGP hijack of the resolver prefix as unrelated. Writing incidents up is the [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages) chapter's subject.

## IP Addresses and IPv4 Scarcity

IPv4 has about 4.3 billion addresses, and the free supply ran out region by region, each date in the registry's own announcement:

| Registry | Event | Date |
| --- | --- | --- |
| IANA | Free pool depleted; final /8 to each RIR | 3 Feb 2011 |
| APNIC (Asia-Pacific) | Final /8 reached; at most a /22 per account holder | 15 Apr 2011 |
| RIPE NCC (Europe, Middle East) | Last /8 reached, /22 allocations | 2012 |
| ARIN (North America) | Free pool reaches zero | 24 Sep 2015 |
| RIPE NCC | Final allocation; waiting list for one /24 per LIR that never had one | 25 Nov 2019 |
| AFRINIC (Africa) | Phase 2 of exhaustion; requests over /22 cut to /22 | 14 Jan 2020 |
| LACNIC (Latin America, Caribbean) | Last available block reserved; recovered space quarantined six months | Aug 2020 |

After exhaustion an RIR hands out only recovered space, slowly, to a queue. ARIN's waiting list, as of October 2026: the most an organization may qualify for at once is a /22; organizations already holding more than a /20 equivalent are ineligible; a recipient waits 90 days after a distribution before applying again; and waiting-list space "cannot be transferred to another organization for 60 months." Its last distribution was on 7 Oct 2026 and the next is "on or about" 4 Jan 2027. Holding space has its own fee: ARIN's smallest service category (3X-Small: IPv4 up to a /24, IPv6 up to a /40, one to three ASNs) is $275 a year from 1 Jan 2026.

**Transfers** are how address space moves now, and each registry's rules are part of the price:

- **ARIN NRPM 8.3 and 8.4.** A source must be the registered holder, not in dispute, and not have received a transfer, allocation or assignment from ARIN in the previous 12 months; it can't apply to the waiting list for 36 months after. Inter-RIR transfers (8.4) happen only between RIRs with "reciprocal, compatible needs-based policies." Recipients must document use of at least half the block within 24 months, and the minimum transfer is a /24.
- **RIPE NCC.** IPv4 is "restricted from being transferred for 24 months after they have been received," whether it came from the RIPE NCC, another organization or a restructuring, with no minimum size and partial blocks allowed; requests are checked against the EU sanctions list.

**The market.** Brokers publish the only price data. A broker's report for H1 2026 (IPv4.Center, published on CircleID on 6 Jul 2026) counts 596 transactions moving 5,016,064 addresses at an average of $20.04 per address, down 35.7% from H1 2025; $18.95 at ARIN and $20.95 at RIPE, where the report credits the 24-month restriction for supporting prices; leases at about $0.59 per address a month, so buying pays back against leasing in about 34 months. These are broker-published figures, not registry statistics, and the broker runs a marketplace.

### Provider IPv4 Charges

Scarcity reached the bill. AWS announced on 28 Jul 2023, and began on 1 Feb 2024, a charge of $0.005 per public IPv4 address per hour (about $3.65 a month at 730 hours) for every public IPv4 address, attached or idle, across its services in every Region including China and GovCloud, saying "the cost to acquire a single public IPv4 address has risen more than 300% over the past 5 years." Addresses brought through BYOIP aren't charged, and EC2's free tier includes 750 hours a month for the first 12 months. As of October 2026:

| Provider | IPv4 | IPv6 |
| --- | --- | --- |
| **AWS** | $0.005 per address-hour, in use or idle | Not part of the charge announced |
| **Fly.io** | Shared IPv4 free; dedicated IPv4 $2 a month | "Unlimited Anycast IPv6 addresses" free |
| **Hetzner** | Cloud primary IPv4 €0.50 a month; dedicated server primary IPv4 €1.70 a month; a /24 for a dedicated server €435.20 a month plus €659.00 setup (ex VAT) | Cloud primary IPv6 free |

The pattern is that the shared or IPv6 path is free and the address a customer holds alone is charged, and edge networks price the same way: certificates served by SNI share addresses for free, while a certificate on dedicated addresses for clients without SNI is a monthly charge ([Termination at the Edge](/books/hosting-and-cloud/tls-and-protocols#termination-at-the-edge)).

### BYOIP

A customer that holds its own space (even a lab announcing its own prefix, as in [BGP From Home](/books/hosting-and-cloud/homelab-to-colocation#bgp-from-home)) can have a provider announce it, and every provider demands proof first:

| Provider | Smallest prefix | Proof of control | Notes |
| --- | --- | --- | --- |
| **AWS (EC2)** | /24 IPv4; /48 IPv6 if advertised, /60 if not | A self-signed X.509 certificate in the RIR's RDAP record, or a DNS TXT record through VPC IPAM; a ROA for advertised ranges, legacy space included | ARIN, RIPE or APNIC registrations to a business, not a person; five ranges per Region by default; AWS may reject a range with "an IP address that has a poor reputation" |
| **Google Cloud** | /24 for advertised IPv4 prefixes on Premium Tier (/16 to /24) | ROA and reverse DNS validation | Two to four weeks before external prefixes are advertised; no overlapping announcements |
| **Cloudflare** | /24 IPv4, /48 IPv6 | A letter of authorization (generated or uploaded), an IRR `route` object with origin AS13335, and accurate ROAs | Enterprise only; announced from every location; at least five hours to provision |

The /24 and /48 minimums aren't the providers' choice: networks don't accept longer prefixes across the internet, which is also why DDoS diversion needs a /24 ([Where Mitigation Happens](/books/hosting-and-cloud/ddos-mitigation#where-mitigation-happens)). The letter of authorization is the legal half of the ROA: announcing someone else's space without one is a hijack, whatever the routers accept.

### IPv6 Adoption

IPv6 has enough addresses that none of the above applies, and adoption is partial. Cloudflare Radar's 2025 review counts IPv6 on 29% of requests from dual-stack clients. Google publishes the share of its users reaching it over IPv6 as a chart without a figure in text, so no Google number is given here. The partial adoption is why every provider still sells IPv4: a service reachable only over IPv6 misses most visitors, and the cost of the transition sits with whoever still needs the IPv4 address.

### Reputation Follows the Address

A reused address carries its last holder's history. An address that sent spam, hosted phishing or ran a botnet sits on blocklists and in reputation databases after the customer is gone, and the next customer inherits the blocks. Providers treat it as a supply-chain problem: AWS requires BYOIP ranges to "have a clean history" and may reject them; LACNIC quarantines recovered space for six months before reassignment. A provider's own version is a cooling-off period between holders, a reputation check before reassigning, and the attribution record that answers "who held 203.0.113.7 at 14:02," which is the core model's `resource_identifiers` exclusion constraint ([The Core Data Model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)). The abuse desk's side of that lookup is UGP's [How to Build It](/books/user-generated-platforms/abuse-desks#how-to-build-it); the provider's AUP and blocklist handling is the [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure) chapter's, and identifier lookups for legal process are the [Law Enforcement at Infrastructure Providers](/books/hosting-and-cloud/law-enforcement-at-providers#resolving-the-identifier) chapter's.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Anycast ingress** | Same prefixes announced from every location | Fast failover; attacks spread across locations; no DNS dependency | Routing picks the location; mid-connection shifts on route changes | Own ASN and prefixes, or the provider's | Address space plus peering work | Cloudflare, Google's load balancer, Fly.io |
| **DNS steering to unicast addresses** | Authoritative DNS picks a location per lookup | Per-lookup control on measured data; easy draining | Resolver location, not visitor's; TTL lag on changes | Provider's DNS | DNS infrastructure and measurement | CloudFront |
| **Transit only** | Pay upstreams for everything | Simple, universal | Cost grows with traffic; congestion is someone else's | Contracts | Per capacity used | Small networks, new locations |
| **Peering at IXPs and PNIs** | Settlement-free exchange with other networks | Lower cost, shorter paths | Negotiation; ports and cross-connects to run; peers can refuse | Bilateral agreements | Ports, cross-connects, colocation | Every large edge and access network |
| **Embedded caches** | Content network's servers inside ISPs | No interconnect; nearest possible location | Hardware in other people's buildings; only for networks big enough to be wanted | Program terms with each ISP | Hardware and operations | Netflix, Google, Akamai, CloudFront |
| **Leased IPv4** | Rent addresses from a holder | No capital; flexible | Lessor's history becomes yours; lease ends | Lease contract; the lessor stays registrant | About $0.59 per address a month (broker data) | New providers, short-lived needs |
| **Bought IPv4** | Transfer space through an RIR | Owned; amortizes in about three years against leasing (broker data) | RIR rules and lockups; price risk | Registrant of record | About $20 per address (broker data) plus RIR fees | Established providers |
| **IPv6-first with shared IPv4** | IPv6 everywhere, IPv4 only shared or by SNI | Removes most address cost | Clients without IPv6 need the shared path | | Shared IPv4 only | Fly.io's default; every SNI-only edge |

## My Default

My default for an edge network is anycast for every visitor-facing address, with each location self-sufficient (its own TLS termination, caches and mitigation) so that a route change costs a reconnect, not an error, and with DNS steering kept as a second lever for draining or for customers whose traffic needs a specific set of locations. I'd peer at the large exchanges and with the access networks that carry most of my traffic before buying more transit, and offer embedded caches only to networks large enough to fill them. Every prefix gets a ROA with a tight maximum length, and no customer prefix is announced before its letter of authorization and ROA are on file.

For addresses, my default is IPv6 everywhere, IPv4 shared by SNI for visitors, and dedicated IPv4 sold as a charged, metered add-on, with released addresses held in a cooling-off period and checked against blocklists before reuse. I'd buy space rather than lease it once the need is stable for more than about three years, which is roughly where the broker data puts payback. The tradeoff that would change this is a customer base of devices or protocols without SNI or IPv6: then dedicated IPv4 becomes the product, and its price has to carry the market cost of the address.

## How to Build It

The chapter adds `edge_locations`, `edge_interconnects`, `ip_blocks` and `ip_quarantines`, an `ip_block_id` on `resource_identifiers`, and the public IPv4 meter, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Locations are what the caching, DDoS and WAF chapters reference for tiers, attack landings and rule stages; `ip_blocks` is where every address in a `resource_identifiers` row comes from, including the customer prefixes [DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation#how-to-build-it)'s `prefix_protections` announces.

```sql
CREATE TABLE edge_locations (            -- every place the edge serves from
  id             TEXT PRIMARY KEY,        -- e.g. 'fra1'
  city           TEXT NOT NULL,
  country        CHAR(2) NOT NULL,        -- ISO 3166-1
  kind           TEXT NOT NULL CHECK (kind IN ('pop', 'embedded', 'regional_cache')),
  status         TEXT NOT NULL CHECK (status IN ('planned', 'testing', 'active',
                   'draining', 'disabled', 'retired')),
  price_region   TEXT NOT NULL,           -- the region_class its delivery bills under
  networks       TEXT[] NOT NULL DEFAULT '{standard}',  -- which network tiers use it
  host_asn       BIGINT,                  -- the ISP whose building holds an embedded cache
  serves_only_host BOOLEAN NOT NULL DEFAULT FALSE,  -- embedded: only that ISP's users
  facility_ref   TEXT,                    -- PeeringDB facility id or the colo's name
  region_id      TEXT REFERENCES regions (id),  -- a regional cache inside a cloud region
  announces_anycast BOOLEAN NOT NULL DEFAULT TRUE,
  valid_during   TSTZRANGE NOT NULL,      -- from first traffic to decommission
  CHECK ((kind = 'embedded') = (host_asn IS NOT NULL)),
  CHECK (NOT serves_only_host OR kind = 'embedded')
);

CREATE TABLE edge_interconnects (        -- how a location reaches other networks
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  edge_location_id  TEXT NOT NULL REFERENCES edge_locations (id),
  kind              TEXT NOT NULL CHECK (kind IN ('transit', 'ixp_peering', 'pni',
                      'embedded_uplink')),
  peer_asn          BIGINT,               -- null for route-server sessions at an IXP
  ixp_ref           TEXT,                 -- PeeringDB exchange id
  capacity_gbps     NUMERIC NOT NULL CHECK (capacity_gbps > 0),
  settlement        TEXT NOT NULL CHECK (settlement IN ('paid', 'settlement_free')),
  commit_gbps       NUMERIC,              -- a transit or paid-peering commitment
  contract_ref      TEXT,
  valid_during      TSTZRANGE NOT NULL,
  CHECK ((kind = 'ixp_peering') = (ixp_ref IS NOT NULL)),
  CHECK (kind <> 'transit' OR settlement = 'paid'),
  CHECK (kind IN ('ixp_peering') OR peer_asn IS NOT NULL)
);

CREATE TABLE ip_blocks (                 -- prefixes the provider holds or announces
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  prefix             CIDR NOT NULL,
  rir                TEXT NOT NULL CHECK (rir IN ('arin', 'ripe', 'apnic', 'lacnic',
                       'afrinic')),
  source             TEXT NOT NULL CHECK (source IN ('allocated', 'transferred',
                       'leased_in', 'byoip', 'legacy')),
  registry_handle    TEXT,                -- the RIR's object: NetHandle, inetnum
  account_id         UUID REFERENCES accounts (id),  -- the customer, for BYOIP
  loa_ref            TEXT,                -- the holder's letter of authorization
  contract_ref       TEXT,                -- the transfer or lease agreement
  purpose            TEXT NOT NULL CHECK (purpose IN ('customer_assignable',
                       'anycast_service', 'egress', 'infrastructure')),
  origin_asns        BIGINT[] NOT NULL,   -- the ASes the ROA authorizes
  roa_max_length     SMALLINT,
  roa_status         TEXT NOT NULL CHECK (roa_status IN ('valid', 'invalid',
                       'not_found')),     -- RFC 6811 state of the provider's announcement
  roa_checked_at     TIMESTAMPTZ,
  transfer_locked_until TIMESTAMPTZ,      -- RIPE's 24 months, ARIN waitlist's 60
  held_during        TSTZRANGE NOT NULL,  -- from registration or lease start to release
  CHECK ((source = 'byoip') = (account_id IS NOT NULL)),
  CHECK (source <> 'byoip' OR loa_ref IS NOT NULL),
  CHECK (source NOT IN ('transferred', 'leased_in') OR contract_ref IS NOT NULL),
  CHECK (roa_max_length IS NULL OR roa_max_length >= masklen(prefix)),
  EXCLUDE USING GIST (prefix inet_ops WITH &&, held_during WITH &&)
                                          -- no address in two blocks at once
);

ALTER TABLE resource_identifiers          -- every address comes from a block
  ADD COLUMN ip_block_id UUID REFERENCES ip_blocks (id);

CREATE TABLE ip_quarantines (            -- released addresses not yet reassignable
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  ip_block_id           UUID NOT NULL REFERENCES ip_blocks (id),
  address               CIDR NOT NULL,    -- a /32, a /128 or a customer-sized prefix
  released_identifier_id UUID REFERENCES resource_identifiers (id),
  reason                TEXT NOT NULL CHECK (reason IN ('cooling_off', 'abuse_history',
                          'blocklisted', 'recovered_space')),
  quarantined_during    TSTZRANGE NOT NULL,
  cleared_by            TEXT,             -- 'system:reputation_check', 'staff:<id>'
  EXCLUDE USING GIST (address inet_ops WITH &&, quarantined_during WITH &&)
);
```

A public address held by a customer is a `resource_identifiers` row of kind `'ipv4'` (or `'ipv6_prefix'`), held by a resource of kind `'ip_address'` for a reservable address or by the VM or load balancer itself for an ephemeral one, with `held_during` and the block it was carved from. Containment is checked when the row is written:

```sql
CREATE FUNCTION resource_identifier_in_block() RETURNS trigger AS $$
BEGIN
  IF NEW.kind IN ('ipv4', 'ipv6_prefix') AND NOT EXISTS (
       SELECT 1 FROM ip_blocks b
       WHERE b.id = NEW.ip_block_id
         AND NEW.value::cidr <<= b.prefix          -- inside the block
         AND b.held_during @> NEW.held_during)     -- for the whole holding
  THEN
    RAISE EXCEPTION 'identifier % is outside block % for part of its holding',
      NEW.value, NEW.ip_block_id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER resource_identifiers_in_block
  BEFORE INSERT OR UPDATE ON resource_identifiers
  FOR EACH ROW EXECUTE FUNCTION resource_identifier_in_block();
```

Releasing an address closes its identifier's `held_during` and opens a quarantine (seven days of `'cooling_off'` by default, longer with `'abuse_history'` when the last holder was suspended for abuse). The allocator then prefers addresses that were never used, then the ones idle longest:

```sql
-- Next assignable IPv4 address in an active customer block, as of now.
SELECT b.id AS ip_block_id, a.addr
FROM ip_blocks b
CROSS JOIN LATERAL (
  SELECT host(b.prefix + g) AS addr
  FROM generate_series(0, (2 ^ (32 - masklen(b.prefix)))::bigint - 1) AS g
) a
WHERE b.purpose = 'customer_assignable'
  AND family(b.prefix) = 4
  AND b.held_during @> NOW()
  AND b.roa_status = 'valid'
  AND NOT EXISTS (SELECT 1 FROM resource_identifiers ri       -- held now or later
                  WHERE ri.kind = 'ipv4' AND ri.value::cidr >>= a.addr::inet
                    AND ri.held_during && tstzrange(NOW(), NULL))
  AND NOT EXISTS (SELECT 1 FROM ip_quarantines q
                  WHERE q.address >>= a.addr::inet AND q.quarantined_during @> NOW())
ORDER BY (SELECT MAX(upper(ri.held_during)) FROM resource_identifiers ri
          WHERE ri.kind = 'ipv4' AND ri.value::cidr >>= a.addr::inet) NULLS FIRST
LIMIT 1;
```

Two allocators racing for one address both pass this query, and the core exclusion constraint on `resource_identifiers` rejects the second insert, which retries; in production the address is a typed `inet` column with an index rather than a cast per row.

The public IPv4 meter, a `usage_events.meter` with `resource_id` the holding resource:

| Meter | Unit | Counted when | Example price it rates |
| --- | --- | --- | --- |
| `ip.public_ipv4_hours` | hour | Each hour (or part, pro rata) a public IPv4 identifier is held, attached or idle, from a non-BYOIP block | AWS: $0.005 per address-hour; SKU `ip.public_ipv4.hour` with `unit_price` 0.5 (cents) |

The meter's producer derives hours from the identifiers themselves, so the bill and the attribution record can't disagree:

```sql
-- Public IPv4 address-hours for an account ($1) over a window ($2), BYOIP excluded.
SELECT ri.resource_id, ri.value,
       EXTRACT(EPOCH FROM upper(ri.held_during * $2::tstzrange)
                        - lower(ri.held_during * $2::tstzrange)) / 3600 AS address_hours
FROM resource_identifiers ri
JOIN resources r ON r.id = ri.resource_id
JOIN ip_blocks b ON b.id = ri.ip_block_id
WHERE r.account_id = $1
  AND ri.kind = 'ipv4'
  AND ri.held_during && $2::tstzrange
  AND b.source <> 'byoip';
```

Each row becomes a `usage_events` row; a free tier of 750 hours a month is an `included` allowance on the free plan version (`{"ip.public_ipv4.hour": 750}`), applied before pricing.

Notes on the sketch:

- **Blocks are held like identifiers.** The exclusion constraint on `ip_blocks` makes it impossible to record one address in two blocks at the same time; a leased block's `held_during` ends with the lease, and the trigger then refuses any customer holding past it.
- **BYOIP is a block with an owner.** `account_id` and `loa_ref` are required for `'byoip'`, the customer's addresses are carved from it like any other, and the IPv4 meter skips them, as AWS does. DDoS Mitigation's `prefix_protections` points at the `resource_identifiers` row for the customer prefix, which in turn names its block.
- **ROA state is the provider's own announcement's.** `roa_status` records how the provider's announcement validates under RFC 6811; a block that turns `'invalid'` after a ROA change is an outage in waiting, and the allocator stops using it.
- **Transfer locks are dates.** RIPE's 24 months and ARIN's 60-month waitlist lock are `transfer_locked_until`, so selling or moving space is checked before a broker is called.
- **Embedded locations name their host.** `host_asn` and `serves_only_host` keep a cache inside one ISP from being used to serve another network's visitors, and DNS steering reads them.
- **Prices come from locations.** `price_region` is the source of the `region_class` dimension on the delivery meters ([The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it)).
- **Events:** `edge_location.status_changed`, `interconnect.changed`, `ip_block.acquired`, `ip_block.released`, `ip_block.roa_invalid`, `identifier.assigned`, `identifier.released` and `ip.quarantine_cleared` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to routing automation, billing and the abuse desk.

## Auditing

- **Who held each address, when.** For any public address and instant, the holding resource and account, from `resource_identifiers` with its block, for an abuse report, a subpoena or a reputation dispute.
- **Every block's provenance.** How each prefix was obtained (allocation, transfer, lease, BYOIP, legacy), the agreement or letter of authorization behind it, its RIR handle and its transfer lock.
- **Announcements against authority.** For each prefix announced, the ROA, its origin ASes and maximum length, and the validation state over time; for a customer prefix, the letter of authorization dated before the first announcement.
- **Quarantine before reuse.** Each released address's cooling-off period, any reputation hold and who cleared it, so a customer complaining about an inherited blocklisting can be answered.
- **Address-hours from identifiers.** `ip.public_ipv4_hours` reproducible from identifier ranges, with BYOIP excluded and free hours applied.
- **Footprint claims from location rows.** Published city, PoP and embedded counts computed from `edge_locations` with a written definition, as of a date.

## What This Means for the System You Build

- **Make every location self-sufficient** so anycast route changes cost a reconnect, not an error.
- **Treat PoP counts as claims,** and measure latency, throughput and hit ratio from your own visitors' networks instead.
- **Peer before buying transit,** publish an accurate PeeringDB record, and size exchange ports for the biggest live event.
- **Sign a ROA for every prefix** with a tight maximum length, and never announce a customer prefix without a letter of authorization.
- **Record every address's block and holder** over time, and check containment when it is assigned.
- **Cool addresses off before reuse** and check reputation, because the next customer inherits the last one's history.
- **Charge for exclusive IPv4,** keep shared IPv4 and IPv6 free, and derive the meter from the attribution record.

## References

**Specifications**

- [RFC 4271: A Border Gateway Protocol 4 (BGP-4)](https://www.rfc-editor.org/rfc/rfc4271.html), January 2006, inter-AS routing, AS paths and TCP port 179
- [RFC 4786: Operation of Anycast Services](https://www.rfc-editor.org/rfc/rfc4786.html), December 2006, BCP 126, the definition and the transaction-splitting risk
- [RFC 6480: An Infrastructure to Support Secure Internet Routing](https://www.rfc-editor.org/rfc/rfc6480.html), February 2012, the RPKI and Route Origin Authorizations
- [RFC 6811: BGP Prefix Origin Validation](https://www.rfc-editor.org/rfc/rfc6811.html), January 2013, Valid, Invalid and NotFound

**Providers: footprint and steering**

- [Cloudflare: Network](https://www.cloudflare.com/network/), 348 cities and network interconnections (viewed 27 Oct 2026)
- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), interconnection with over 13,000 networks
- [Akamai: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1086222/000108622226000022/akam-20251231.htm), points of presence, countries, cities and network partners
- [Akamai: Prospectus (Form 424B1), October 1999](https://www.sec.gov/Archives/edgar/data/0001086222/000095013599004929/0000950135-99-004929.txt), 1,475 servers in 24 countries across 55 networks
- [Fastly: Network map](https://www.fastly.com/network-map/), connected capacity dated 30 Jun 2026, listed cities and "fewer, more powerful POPs"
- [AWS: CloudFront features](https://aws.amazon.com/cloudfront/features/), POPs, regional edge caches, embedded POPs and capacity
- [AWS: How CloudFront delivers content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html), DNS routing to the best POP
- [Google Cloud: External Application Load Balancer overview](https://docs.cloud.google.com/load-balancing/docs/https), GFEs and global anycast addresses
- [Bunny: CDN pricing](https://bunny.net/pricing/cdn/), PoP counts per network tier
- [Cloudflare: Cloudflare servers don't own IPs anymore](https://blog.cloudflare.com/cloudflare-servers-dont-own-ips-anymore/), 25 Nov 2022, soft-unicast, port slicing and Unimog

**Peering and embedded caches**

- [PeeringDB: About](https://www.peeringdb.com/about), what it is and its counts (viewed 27 Oct 2026)
- [DE-CIX: New traffic record at DE-CIX Frankfurt, 18.11 Tbps](https://www.de-cix.net/en/about-de-cix/news/new-traffic-record-at-de-cix-frankfurt-18-11-tbps), the 20 Nov 2024 peak
- [DE-CIX: Frankfurt breaks the 21-terabit mark](https://www.de-cix.net/en/about-de-cix/media/press-releases/de-cix-frankfurt-breaks-the-21-terabit-mark-while-global-traffic-exceeds-32-terabits-per-second), 14 Oct 2026, 21.47 Tbps, the cause, the global figure and networks connected
- [Netflix: Open Connect](https://openconnect.netflix.com/en/), embedded appliances at no charge, settlement-free interconnection and partner count
- [Light Reading: Netflix touts new content delivery network](https://www.lightreading.com/network-automation/netflix-touts-new-content-delivery-network), 5 Jun 2012, the announcement, free ISP options and the 5% share
- [Google: Google Global Cache](https://support.google.com/interconnect/answer/9058809), how ISPs host it and the 70 to 90% figure
- [Edgio: Edgecast completion press release (Form 8-K exhibit), 16 Jun 2022](https://www.sec.gov/Archives/edgar/data/1391127/000119312522175232/d339796dex991.htm), colocation and peering savings

**Route security**

- [RIPE NCC: YouTube hijacking, a RIPE NCC RIS case study](https://www.ripe.net/publications/news/industry-developments/youtube-hijacking-a-ripe-ncc-ris-case-study), the 24 Feb 2008 timeline
- [MANRS: About](https://www.manrs.org/about/), the four actions, programs and support
- [Cloudflare: 1.1.1.1 incident on July 14, 2025](https://blog.cloudflare.com/cloudflare-1-1-1-1-incident-on-july-14-2025/), the coincident hijack that was not the cause

**Registries**

- [NRO: IPv4 free pool depleted](https://www.nro.net/ipv4-free-pool-depleted), 3 Feb 2011 and the final /8s
- [APNIC: IPv4 address pool reaches final /8](https://mailman.apnic.net/mailing-lists/apnic-announce/archive/2011/04/msg00002.html), 15 Apr 2011 and the /22 maximum
- [ARIN: IPv4 free pool reaches zero](https://www.arin.net/vault/announcements/20150924/), 24 Sep 2015
- [RIPE NCC: The RIPE NCC has run out of IPv4 addresses](https://www.ripe.net/publications/news/about-ripe-ncc-and-ripe/the-ripe-ncc-has-run-out-of-ipv4-addresses), 25 Nov 2019, the 2012 last /8 and the /24 waiting list
- [AFRINIC: Phase 2 of IPv4 exhaustion has begun](https://lists.afrinic.net/pipermail/community-discuss/2020-January/003443.html), 14 Jan 2020 and the /22 reduction
- [LACNIC: IPv4 exhaustion, the last remaining block](https://blog.lacnic.net/en//ipv4-exhaustion-lacnic-has-assigned-the-last-remaining-address-block), August 2020, the reserved block and six-month quarantine
- [ARIN: Waiting list for unmet IPv4 requests](https://www.arin.net/resources/guide/ipv4/waiting_list/), limits, the 60-month lock and distribution dates
- [ARIN: Number Resource Policy Manual](https://www.arin.net/participate/policy/nrpm/), sections 8.3, 8.4 and 8.5
- [ARIN: Fee schedule](https://www.arin.net/resources/fees/fee_schedule/), the 3X-Small category from 1 Jan 2026
- [RIPE NCC: Transfers in the RIPE NCC service region](https://www.ripe.net/manage-ips-and-asns/resource-transfers-and-mergers/transfer-of-ip-addresses-and-as-numbers/transfers-in-the-ripe-ncc-service-region/), the 24-month restriction, sizes and sanctions checks

**Market and charges**

- [CircleID: IPv4 market in H1 2026](https://circleid.com/posts/ipv4-market-in-h1-2026-a-price-reset-not-a-market-collapse), 6 Jul 2026, broker-published transactions, prices, lease rate and payback
- [AWS: New AWS public IPv4 address charge](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/), 28 Jul 2023, the charge from 1 Feb 2024, scope, BYOIP exemption, free tier and stated reason
- [Fly.io: Pricing](https://docs.fly.io/about/pricing), dedicated IPv4 and free IPv6
- [Hetzner: IP prices](https://docs.hetzner.com/general/infrastructure-and-availability/ipv4-pricing), cloud and dedicated server IPv4, subnets and IPv6

**BYOIP**

- [AWS: Bring your own IP addresses to Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-byoip.html), prefix sizes, RDAP and ROA, quotas and reputation
- [Google Cloud: Bring your own IP addresses](https://docs.cloud.google.com/vpc/docs/bring-your-own-ip), prefix sizes, ROA and reverse DNS validation, timing
- [Cloudflare: BYOIP](https://developers.cloudflare.com/byoip/), Enterprise availability and services
- [Cloudflare: BYOIP get started](https://developers.cloudflare.com/byoip/get-started/), prefix sizes, LOA, IRR objects, ROAs and provisioning time

**Adoption**

- [Cloudflare: Radar 2025 year in review](https://blog.cloudflare.com/radar-2025-year-in-review/), IPv6 share of dual-stack requests
