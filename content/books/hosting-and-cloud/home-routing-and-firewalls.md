+++
title = "Home Routing, Firewalls & DNS"
description = "pfSense, OPNsense, OpenWrt and UniFi; VLANs for trusted, IoT, guest and lab; Pi-hole and AdGuard Home; IPv6, CGNAT and UPnP; WireGuard at the edge."
category = "Hosting & Cloud Industry"
order = 2109
part = "Homelab"
tags = ["homelab", "firewall", "opnsense", "pfsense", "openwrt", "vlan", "dns", "ipv6", "cgnat"]
+++

The router is the first piece of infrastructure a homelab replaces, and the one every later decision rests on. The box the ISP supplied does three jobs at once (NAT gateway, firewall, DNS forwarder) and does them for one flat network where the laptop, the smart plug, the guest's phone and the hypervisor all see each other. Replacing it is the household's version of what a provider builds at the edge of every region: a routed boundary, segments that can't reach each other unless a rule says so, a resolver the operator controls, and a decision about how the outside world gets in. The scale is small and the stakes are real: the lab will hold a NAS, a password vault and management interfaces that should never share a broadcast domain with a $15 camera.

This chapter covers the router and firewall distributions homelabs choose between (pfSense CE and Plus, OPNsense, OpenWrt, UniFi gateways), VLANs and segmentation, local DNS and ad blocking with Pi-hole and AdGuard Home, IPv6 and carrier-grade NAT, the port mapping protocols that punch holes in all of it, and WireGuard on the router. It adds no provider tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); a home VLAN is the self-hosted mirror of a VPC subnet, and its rules are a security group written by hand. The wider homelab is [The Homelab](/books/hosting-and-cloud/homelab); the cabling, Wi-Fi, bufferbloat and consumer failover under this router are [Home Networks: Ethernet, Wi-Fi & Cabling](/books/hosting-and-cloud/home-networks-and-cabling); letting anything in from outside is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services). The same ideas return at provider scale later in the book: segmentation as [Virtual Networks and VPCs](/books/hosting-and-cloud/data-center-networking#virtual-networks-and-vpcs), DNS as [DNS Hosting & DNSSEC](/books/hosting-and-cloud/dns-hosting-and-dnssec), and address scarcity and CGNAT from the ISP's side in [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#ip-addresses-and-ipv4-scarcity).

## How the Vendors Do It

| System | Owner | License | Base | Role at home | Cost (as of October 2026) |
| --- | --- | --- | --- | --- | --- |
| **pfSense CE** | Netgate | Apache-2.0 | FreeBSD, pf | Router and firewall on any x86 box | Free |
| **pfSense Plus** | Netgate | Proprietary build of the same project | FreeBSD, pf | Netgate's productized edition | Included on Netgate appliances; $129 a year (TAC Lite) per instance elsewhere |
| **OPNsense** | OPNsense project (Deciso B.V.) | BSD 2-clause | FreeBSD, pf | Router and firewall on any x86 box | Free |
| **OpenWrt** | OpenWrt project (SPI as legal umbrella) | Open source | Linux, nftables (fw4) | Replacement firmware for consumer routers | Free |
| **UniFi** | Ubiquiti | Proprietary | UniFi OS | Gateway, switches, APs and cameras under one controller | Hardware price |
| **Pi-hole** | Pi-hole project | Open source | Linux, FTL on dnsmasq | DNS sinkhole, optional DHCP | Free |
| **AdGuard Home** | AdGuard | GPL-3.0 | Go binary | DNS sinkhole with encrypted DNS built in, optional DHCP | Free |

Three patterns run through the table. **The firewall distributions are one family:** m0n0wall begat pfSense, pfSense begat OPNsense, and both run FreeBSD's packet filter, so their concepts (interfaces, aliases, first-match rules per interface, gateway groups) transfer almost one to one. **The commercial question is who pays for updates:** Netgate split a paid Plus edition off its open project, OPNsense stayed fully open, and Ubiquiti charges for the hardware and gives the controller away. **DNS filtering is a separate box,** or at least a separate service, because a resolver that blocks ads also becomes the house's single point of failure.

## How It Got Here

- **January 2011:** RFC 6092 recommends "simple security" for residential IPv6 gateways: unsolicited inbound traffic "is expected to be discarded or rejected," because IPv6 removes the accidental protection NAT gave IPv4.
- **April 2012:** RFC 6598 reserves 100.64.0.0/10 as Shared Address Space for carrier-grade NAT; the IESG calls it an operational expedient and says it remains "committed to the deployment of IPv6."
- **April 2013:** RFC 6887 defines the Port Control Protocol (PCP), letting a host ask a NAT, including a carrier-grade one, to open an inbound mapping; it falls back to NAT-PMP (RFC 6886) and lists a UPnP IGD interworking function as a client.
- **November 2013:** RFC 7084 sets the basic requirements for an IPv6 home router: DHCPv6 prefix delegation on the WAN and a separate /64 for each LAN.
- **January 2, 2015:** OPNsense 15.1 "Ascending Albatross," "the first release by the OPNsense project," based on FreeBSD 10 and forked from pfSense, itself a fork of m0n0wall.
- **February 15, 2015:** m0n0wall ends; its author points users to OPNsense as the project that "aims to continue the open source spirit of m0n0wall."
- **2016:** LEDE spins off from OpenWrt over too few active core developers, unreliable infrastructure and weak transparency.
- **January 2018:** OpenWrt and LEDE re-merge under the OpenWrt name, on LEDE's code base, with Software in the Public Interest as the legal umbrella.
- **May 2018:** RFC 8375 reserves `home.arpa.` for naming inside residential networks, replacing the unregistered `.home`.
- **January 21, 2021:** Netgate announces pfSense Plus (formerly Factory Edition); 21.02 is the first Plus release, based on CE 2.5, and the project code "will remain Apache licensed."
- **February 14, 2022:** Netgate opens a no-cost path from pfSense CE to pfSense Plus for home and lab use (Home+Lab).
- **October 26 and 30, 2023:** Netgate withdraws the free Home+Lab download, citing vendors that installed it on their own appliances and resold it, then, saying it "reacted too quickly," offers TAC Lite at $129 a year to keep Plus updates on third-party hardware.
- **March 28, 2026:** Google's measurement crosses 50% of access over native IPv6 for the first time (50.10%).

The arc is from one box doing everything toward separated jobs: the firewall distribution routes and filters, a resolver answers names, the switch and APs carry VLANs, and IPv6 turns "everything behind NAT" into "everything addressable, so the firewall has to mean it."

## pfSense and OPNsense

**How they work.** Both are FreeBSD distributions built around pf: Netgate's own announcement says pfSense CE and Plus "use the FreeBSD kernel and the packet filter module for the data path." Each physical port or VLAN is an interface; rules attach to the interface where traffic enters and are evaluated top to bottom, first match wins; aliases name sets of hosts, networks or ports so a rule says `IOT_NET` instead of a CIDR; NAT has port forward, one-to-one and outbound modes; gateways and gateway groups drive multi-WAN ([Redundant Lines](/books/hosting-and-cloud/homelab-to-colocation#redundant-lines) covers the failover settings). DNS is Unbound, which OPNsense has enabled by default since 17.7 as "a validating, recursive, caching DNS resolver," with host overrides, query forwarding, DNS over TLS and DNSBL blocklists under Services > Unbound DNS. Both run packages for WireGuard, IDS/IPS and the rest.

**The licensing split.** pfSense's history since 2021 is the reason many homelabs moved. Netgate renamed its productized build pfSense Plus in January 2021 and said CE "will continue on, just as it has," while most effort went to Plus. In February 2022 it opened a free Home+Lab path from CE to Plus; in October 2023 it withdrew it, and Home+Lab installs without a subscription "will not receive updates when they are released." As of October 2026 Netgate's software page lists pfSense Plus with TAC Lite at $129 a year per instance (complimentary on Netgate appliances), TAC Pro at $399 and TAC Enterprise at $799, CE at no charge, and no home or lab offer. CE remains Apache-licensed and Netgate committed to keeping it in step with Plus, but the edition with the vendor's attention is the paid one. How vendors move terms under their users, and what that does to trust, is a recurring story later in the book ([Open Source and the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#the-license-spectrum)).

**OPNsense** was the answer to that question before it was asked: forked in 2015, BSD 2-clause, with a fixed year.month release scheme (15.1 was January 2015), and m0n0wall's author endorsing it as the successor. Deciso B.V. holds the copyright and the documentation covers a separate Business Edition; the community edition is the full firewall without a paywall. For a new home build the two are interchangeable in capability, and the difference is governance.

## OpenWrt

OpenWrt is a Linux distribution for the router already in the house: replacement firmware for consumer devices listed in its Table of Hardware, which excludes 4 MB flash / 32 MB RAM and 8 MB / 64 MB devices from current releases. Configuration is UCI files under `/etc/config/`; the firewall in `/etc/config/firewall` groups interfaces into **zones** (`lan`, `wan`, and any you add), each with `input`, `output` and `forward` policies, and **forwardings** permit traffic from one zone to another in one direction only. The defaults are `input ACCEPT`, `output ACCEPT`, `forward REJECT`, with masquerading enabled on `wan`. Since 22.03 the backend is firewall4 (fw4) on nftables, accepting the same UCI syntax as the iptables-based fw3 before it.

Its history is a governance story too. In 2016 developers left to found LEDE over "long standing issues that were deemed unfixable from within the OpenWrt project"; in January 2018 the projects re-merged under the OpenWrt name on LEDE's code base and LEDE's rules. The strength is that a $100 Wi-Fi router becomes a real VLAN-aware firewall at a few watts; the weakness is the hardware list and Wi-Fi driver quality, which vary by chipset. Many homelabs end with both: an x86 firewall at the edge and OpenWrt on the access points.

## UniFi and Controller-Managed Networks

UniFi is the other model: one vendor's gateway, switches, access points and cameras, adopted by a controller that holds the configuration and pushes it to every device. Ubiquiti's 10-K for the fiscal year ended June 30, 2025 describes its professional products as "powered by our UISP and UniFi OS software platforms" and lists UniFi Cloud Gateway, WiFi, Switch, Access, Talk and Protect ("a powerful video surveillance platform offering private local storage") in its Enterprise Technology line. That line was $2,254.3 million of $2,573.5 million revenue (88%), up from 84% of $1,928.5 million a year earlier, against $319.3 million (12%) for Service Provider Technology. The business is now mostly the gear that ends up in offices and, increasingly, homelab racks.

The controller model is why people buy it: a VLAN is defined once and appears on every switch port profile and SSID, firmware is staged from one screen, and the camera system shares the network's view of devices. The cost is that the network's configuration lives in the vendor's software, the features are the vendor's roadmap, and some functions route through a vendor account. A UniFi network is easy to run and hard to leave; an OPNsense firewall with any managed switch is the reverse.

## VLANs and Segmentation

A VLAN is a broadcast domain carved out of shared switches by an 802.1Q tag in the Ethernet frame. The firewall has one or more VLAN interfaces on a parent port (on OPNsense, Interfaces > Devices > VLAN, a device such as `vlan0.30` with parent `igc0` and tag 30, then assigned like any interface); the link to the managed switch is a **trunk** carrying the tagged VLANs; ports facing devices that don't speak VLANs are **access** ports, where the switch adds the tag on ingress and strips it on egress. Access points get a trunk too, and map each SSID to a VLAN. OPNsense's own guidance is to not mix tagged and untagged VLANs on the firewall-to-switch trunk, and to park the native VLAN on a sacrificial ID if the switch can't remove it.

The segments most homes converge on:

- **Trusted:** the household's laptops and phones.
- **Lab or servers:** hypervisors, the NAS, the Docker hosts and the reverse proxy.
- **IoT:** plugs, TVs, speakers, appliances; internet access as needed, no reach into anything else.
- **Guest:** internet only, with client isolation on the AP.
- **Cameras:** no internet at all; only the NVR talks to them.
- **Management:** switch, AP and firewall interfaces, reachable only from an admin device.

Segmentation only means something with **inter-VLAN rules**, and those are the work. The default is deny between segments; the exceptions are the flows a household actually uses (the trusted VLAN reaching the lab's web proxy, Home Assistant in the lab reaching IoT devices, the NVR reaching cameras). Discovery protocols are the friction: casting and printer discovery use multicast that doesn't cross a router, so either the device sits with its users or an mDNS repeater bridges named services between two VLANs, which is a deliberate hole and should be the only one. Every rule has a direction: IoT devices should never initiate a connection into the lab, even when the lab may initiate into IoT.

## Local DNS and Ad Blocking

A resolver on the LAN does two jobs: answers names for the lab (`nas.home.arpa`, or an internal view of a real domain) and refuses names on blocklists, which removes ads and trackers for every device including the ones that can't run a blocker.

**Pi-hole** calls itself a network-level blocker that also caches answers; its engine, FTL, is built on dnsmasq and also serves DHCP (with optional IPv6) and a REST API. Its documented companion is Unbound as a local recursive resolver on `127.0.0.1#5335`, so queries go to authoritative servers rather than to a single upstream provider, at the cost of slower first lookups. **AdGuard Home** (GPL-3.0) does the same job as one Go binary and builds in what Pi-hole needs extra software for: encrypted upstreams (DNS-over-HTTPS, DNS-over-TLS, DNSCrypt) and serving DoH or DoT itself, by its own comparison table. Local answers are `$dnsrewrite` rules (`||nas.home.arpa^$dnsrewrite=10.0.10.30`), which take priority over every other rule. **Unbound on the firewall** does both without a separate box, with DNSBL blocklists on OPNsense or pfBlockerNG on pfSense.

**Names.** Use `home.arpa` (RFC 8375) for names that exist only inside the house, never an invented TLD that leaks to the root. For services that need publicly trusted certificates, use a subdomain of a real domain you own and answer it locally with private addresses (split horizon); the certificate is issued over DNS-01 without the service ever being public ([Certificates at Home](/books/hosting-and-cloud/exposing-home-services#certificates-at-home)). Resolvers should strip private addresses from public answers (Unbound's `private-address`, which guards against DNS rebinding), with an exception (`private-domain`) for the internal names.

**Run two.** A filtering resolver that is down takes the whole house with it, and a single Raspberry Pi is the classic outage. Two instances on different hardware, both handed out by DHCP, with their blocklists and local records kept in sync, turn a reboot into a non-event. Clients that hardcode public resolvers bypass all of it, which is why the firewall should redirect or block outbound port 53 from IoT and guest segments; OPNsense's DNS over TLS guidance recommends the same block to keep clients on the validated path.

## IPv6 and CGNAT

**Carrier-grade NAT.** When an ISP runs out of public IPv4 it numbers customer links from 100.64.0.0/10 (RFC 6598) and translates them at its own NAT. That space is "distinct from RFC 1918 private address space" and "MUST NOT be forwarded across Service Provider boundaries," so a router whose WAN address is 100.64.x.x to 100.127.x.x shares a public address with other customers and no port forward on it can ever work. The most cited measurement, Richter et al. at ACM IMC 2016, found CGN at 13.3% of non-cellular ASes, "17–18% of all Eyeball ASes," and "over 92%" of cellular networks. No more recent public measurement of the residential share turned up; on mobile and cellular-based home internet, CGNAT is close to universal. <!-- source-gap: cgnat-residential-share-2026 | missing | current share of residential ISPs that put subscribers behind CGNAT | closes with: a 2023-2026 measurement from APNIC, RIPE Labs, CAIDA or an IMC paper | checked: 2026-10-27 -->

**How to detect it.** Compare the WAN address the router shows with the address the outside world sees. If the router's WAN is in 100.64.0.0/10 or in RFC 1918 space (10/8, 172.16/12, 192.168/16, which means another NAT box upstream), and the outside address differs, inbound is closed. A traceroute whose second or third hop is in 100.64.0.0/10 says the same. The command is in [How to Build It](#how-to-build-it). The remedies, in order of preference for a homelab: IPv6, which gives every device a global address; asking the ISP for a public IPv4 (some do it free on request, some sell it); an outbound tunnel or overlay, which doesn't care ([Exposing Home Services](/books/hosting-and-cloud/exposing-home-services)); or a business plan with static addresses ([Static IPs, Business Plans and Residential AUPs](/books/hosting-and-cloud/homelab-to-colocation#static-ips-business-plans-and-residential-aups)). How ISPs size and run CGNAT, and the IPv4 market that makes it necessary, is [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#ip-addresses-and-ipv4-scarcity).

**Port mapping protocols, and why UPnP stays off.** Three protocols let a device open an inbound hole in the router without asking the owner: UPnP IGD, NAT-PMP and its successor PCP (RFC 6887, which can even request mappings from a carrier-grade NAT). pfSense's documentation is blunt: "By their very nature, these services are insecure," and letting any program on the network open inbound access is "a potential security nightmare." Its daemon, miniupnpd, listens on UDP 1900 (SSDP), TCP 2189 and UDP 5351 (PCP), and its allow/deny ACLs "only control access for IPv4 clients." The exposure is not theoretical: in January 2022 QNAP told NAS owners hit by DeadBolt to remove port forwards and turn off UPnP auto router configuration ([Exposing Home Services](/books/hosting-and-cloud/exposing-home-services#upnp-and-the-nas-that-opened-itself)). My rule is UPnP off on every router; if a game console truly needs it, enable it with default deny and one ACL entry for that console's address.

**IPv6 at home.** RFC 7084 (November 2013) is the contract a home router should meet: request a prefix with DHCPv6 prefix delegation (IA_PD), sized for "one /64 for each of its interfaces, rounded up to the nearest nibble," accept whatever size the ISP actually delegates, and assign "a separate /64 from its delegated prefix(es)" to each LAN. A /56 is 256 /64s, enough for every VLAN in this chapter with room to spare; a /60 is 16; a /64 alone can't be split across VLANs at all. Each VLAN gets a prefix ID (the lab's VLAN 10 takes `<prefix>:10::/64`, so the address plan reads the same in both families).

The firewall changes meaning. IPv4 hosts behind NAT were unreachable by accident; IPv6 hosts are reachable by design, and RFC 6092 recommends a stateful filter that drops unsolicited inbound traffic while allowing that a transparent mode "MAY be the default configuration." The router's IPv6 WAN policy is the first thing to check: inbound denied except replies, ICMPv6 allowed (neighbor discovery and path MTU discovery depend on it), and explicit pass rules for any host that should be reachable. A delegated prefix can change when the ISP renumbers, so DNS records and rules pinned to a literal prefix break; that is the IPv6 version of a dynamic IP.

**Why it matters now.** On March 28, 2026 Google measured 50.10% of its users arriving over native IPv6, the first time above half (the prior high was 49.56% in June 2025), with France at 73% and India at 72% against Italy at 17% and Spain at 10%; the Internet Society's Pulse puts the average across its sources at 43%. For a homelab behind CGNAT, IPv6 is often the only way to receive a direct inbound connection at all, and for one with public IPv4 it is a second, unfiltered front door unless the firewall says otherwise.

## VPN at the Edge

The router is the natural place for a WireGuard endpoint: it has the public address (when there is one), it already owns the firewall, and a tunnel there lands remote devices on a known segment. On OPNsense the pieces are an **instance** under VPN > WireGuard > Instances (a key pair, a listen port, 51820 or another unique port, and a tunnel address such as 10.0.70.1/24), a **peer** per client with its public key and an Allowed IPs of that client's own /32 or /128, an assigned interface so rules can use the tunnel network as an alias, a WAN rule passing UDP to the listen port, and MSS clamping (1380 for IPv4-only tunnels, 1360 with IPv6, from the default 1420 MTU). A client that sets `AllowedIPs = 0.0.0.0/0, ::/0` sends everything home; one that lists only the home prefixes splits the tunnel.

The limit is the same as any port forward: it needs a reachable endpoint. Behind CGNAT, or on a backup line that is ([Redundant Lines](/books/hosting-and-cloud/homelab-to-colocation#redundant-lines)), a WireGuard server on the router can't receive the first packet, and the answer is an overlay that connects outbound (Tailscale, Headscale) or a relay on a VPS, compared in [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services#the-alternatives). Either way the tunnel network gets its own interface and rules, like a VLAN: a remote phone belongs in the trusted policy, not in "any."

## The Alternatives

| Option | Model | Strengths | Failure modes | License and ownership | Cost (as of October 2026) |
| --- | --- | --- | --- | --- | --- |
| **OPNsense on x86** | pf firewall distribution, plugins | Fully open, Unbound with blocklists and WireGuard built in | FreeBSD NIC driver support; more to learn than a consumer router | BSD 2-clause; Deciso B.V. | Free; hardware |
| **pfSense CE** | Same family | Longest documentation and forum history | CE trails Plus; the 2021 to 2023 licensing churn | Apache-2.0; Netgate | Free; hardware |
| **pfSense Plus** | Netgate's edition | Vendor support, Plus-only features, appliances | Subscription for updates off Netgate hardware | Proprietary; Netgate | $129 a year (TAC Lite) or a Netgate appliance |
| **OpenWrt** | Linux firmware for consumer routers | Low power, runs on the router already owned, good as AP firmware | Hardware list; Wi-Fi driver quality by chipset; small flash | Open source; SPI | Free |
| **UniFi** | Controller-managed gateway, switches, APs, cameras | One pane for the whole network; VLANs defined once | Lock-in; features on the vendor's roadmap; vendor account | Proprietary; Ubiquiti | Hardware price |
| **ISP router, bridged or not** | All-in-one | Nothing to run | Flat network; firmware on the ISP's schedule; often no VLANs | ISP's | Rental |
| **Pi-hole (pair)** | DNS sinkhole on dnsmasq | Mature, large community, DHCP | Encrypted upstreams need extra software | Open source | Free |
| **AdGuard Home (pair)** | DNS sinkhole, one binary | DoH/DoT/DNSCrypt built in, per-client settings | Single point of failure if run alone | GPL-3.0; AdGuard | Free |

## My Default

My default is OPNsense on a small x86 box with at least two NICs whose chipset FreeBSD supports well (check before buying), a managed switch and standalone access points, which can be OpenWrt or the AP line of any vendor that takes 802.1Q. VLANs for trusted, lab, IoT, guest, cameras and management from the first day, because renumbering a house later is miserable. Unbound on the firewall as the recursive resolver, two AdGuard Home instances in front of it on different lab hosts, `home.arpa` for local-only names and split horizon for the real domain. IPv6 on, with a /56 requested and a /64 per VLAN, and the WAN's inbound policy checked rather than assumed. UPnP off. WireGuard on the router only if the WAN address is public; otherwise the overlay in [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services#my-default).

I'd pick UniFi instead when the person maintaining the network isn't the person who built it: the controller is easier to hand over than a firewall rule base. I'd pick OpenWrt alone for a small apartment where one good router is the whole network. I'd pick pfSense Plus on a Netgate appliance when vendor support matters and the subscription is someone's budget line. What would change this: an ISP that delegates only a /64 (the VLANs get IPv4 only, or the ISP gets a support ticket), or CGNAT with no public IPv4 for sale, which moves every inbound design to outbound tunnels.

## How to Build It

The core data model gets no provider tables from this chapter. The home equivalent of a provider's network inventory is a plan written down next to the lab's repository ([Infrastructure as Code for the Lab](/books/hosting-and-cloud/self-hosted-apps#infrastructure-as-code-for-the-lab)), using the same 10.0.10.0/24 lab network as [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home#how-to-build-it).

**The VLAN plan.** IPv4 per VLAN, IPv6 prefix ID matching the VLAN ID out of a delegated /56:

| VLAN | Name | IPv4 subnet | IPv6 | DHCP | DNS handed out | Allowed flows (default deny between VLANs) |
| --- | --- | --- | --- | --- | --- | --- |
| **10** | LAB | 10.0.10.0/24, gateway .1 | `<prefix>:10::/64` | Static and reservations | 10.0.10.2, 10.0.10.3 | Out to internet; to IOT and CAMERAS only from named hosts (Home Assistant, NVR) |
| **20** | TRUSTED | 10.0.20.0/24 | `<prefix>:20::/64` | Pool .100 to .250 | 10.0.10.2, 10.0.10.3 | Internet; LAB on 443 (the reverse proxy) and the DNS servers; SSH and hypervisor UI from ADMIN alias only |
| **30** | IOT | 10.0.30.0/24 | `<prefix>:30::/64` or none | Pool | 10.0.10.2, 10.0.10.3 | Internet (or allowlisted vendors); DNS to the resolvers only; nothing initiated into other VLANs |
| **40** | GUEST | 10.0.40.0/24 | `<prefix>:40::/64` | Pool, short leases | 10.0.10.2, 10.0.10.3 | Internet only; client isolation on the SSID |
| **50** | CAMERAS | 10.0.50.0/24 | None | Reservations | 10.0.10.2 | No internet; reachable from the NVR only |
| **60** | MGMT | 10.0.60.0/24 | None | Reservations | 10.0.10.2 | Switch, AP and firewall UIs; reachable from the ADMIN alias only |
| **n/a** | WG | 10.0.70.0/24 (tunnel) | `<prefix>:70::/64` | Static per peer | 10.0.10.2, 10.0.10.3 | Same policy as TRUSTED |
| **n/a** | COROSYNC | 10.0.99.0/24 | None | Static | None | Dedicated NIC between cluster nodes; not routed by the firewall |

The two DNS servers run on different lab hosts, so patching or rebooting one never takes names down, and every VLAN's DNS rule points at both.

**The rule base.** OPNsense names, first match wins per interface; aliases keep the rules readable. The IoT interface, the one that matters most:

```text
Firewall > Aliases
  RESOLVERS   host     10.0.10.2, 10.0.10.3
  PRIVATE     network  10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 100.64.0.0/10, fc00::/7
  ADMIN       host     10.0.20.10 (the admin laptop's reservation)
  HASS        host     10.0.10.45

Firewall > Rules > IOT          (evaluated top to bottom; first match wins)
  pass   IOT net  ->  RESOLVERS      TCP/UDP 53          local DNS only
  block  IOT net  ->  any            TCP/UDP 53, 853     no hardcoded resolvers, no DoT around them
  block  IOT net  ->  PRIVATE        any                 no reach into any other segment
  block  IOT net  ->  This Firewall  TCP 22, 80, 443     no GUI or SSH on the firewall
  pass   IOT net  ->  any            any                 internet

Firewall > Rules > LAB
  pass   HASS     ->  IOT net        any                 Home Assistant may initiate into IOT; replies return by state

Firewall > Rules > TRUSTED
  pass   ADMIN    ->  MGMT net, LAB net   TCP 22, 443, 8006   admin only (8006 is the Proxmox UI)
  pass   TRUSTED net -> 10.0.10.60   TCP 443               the reverse proxy
  pass   TRUSTED net -> RESOLVERS    TCP/UDP 53
  block  TRUSTED net -> PRIVATE      any
  pass   TRUSTED net -> any          any

Services > UPnP                 disabled
Firewall > Rules > WAN          no pass rules except the WireGuard listen port (UDP 51820), and only on a public WAN
```

Because every interface blocks `PRIVATE` before its internet rule, a new VLAN starts isolated and gains flows only by a rule above that line.

**Local zones.** The same records in Unbound (on the firewall, or a standalone resolver) and in AdGuard Home. Unbound's `static` zone answers only from local data and returns NXDOMAIN for anything else under it; `redirect` answers every name under the zone with the zone's own record, which makes a wildcard to the reverse proxy:

```text
# unbound.conf (server: clause), or Custom options on OPNsense
server:
  # Local-only names: home.arpa never leaves the house (RFC 8375).
  local-zone: "home.arpa." static
  local-data: "nas.home.arpa. IN A 10.0.10.30"
  local-data: "pve1.home.arpa. IN A 10.0.10.11"
  local-data-ptr: "10.0.10.30 nas.home.arpa"
  local-data-ptr: "10.0.10.11 pve1.home.arpa"

  # Split horizon: every *.home.example.com answers with the reverse proxy inside the house;
  # the public zone holds only the _acme-challenge records used for DNS-01.
  local-zone: "home.example.com." redirect
  local-data: "home.example.com. IN A 10.0.10.60"

  # DNS rebinding guard: private addresses are stripped from public answers,
  # except for the internal names above.
  private-address: 10.0.0.0/8
  private-address: 172.16.0.0/12
  private-address: 192.168.0.0/16
  private-address: fd00::/8
  private-domain: "home.arpa"
  private-domain: "home.example.com"
```

```text
# AdGuard Home: Filters > Custom filtering rules (both instances, kept identical)
||nas.home.arpa^$dnsrewrite=10.0.10.30
||pve1.home.arpa^$dnsrewrite=10.0.10.11
||home.example.com^$dnsrewrite=10.0.10.60
```

The `||home.example.com^` pattern matches the domain and its subdomains, so one rewrite covers every service behind the proxy. AdGuard Home's upstream is the Unbound resolver, so blocking happens in AdGuard and recursion in Unbound.

**The CGNAT check.** Run on any host in the house (the first command on the firewall's shell, or read the WAN address from its dashboard):

```sh
# 1. The address the router's WAN interface holds (OPNsense/FreeBSD; on OpenWrt: ip -4 addr show wan).
ifconfig igc1 | awk '/inet /{print $2}'

# 2. The address the internet sees, from a resolver that answers with the querier's address.
dig +short myip.opendns.com @resolver1.opendns.com

# 3. The path out: a hop in 100.64.0.0/10 is the carrier's NAT.
traceroute -n -m 5 1.1.1.1
```

| WAN address | Matches outside address | Meaning | Inbound options |
| --- | --- | --- | --- |
| Public | Yes | Direct public IPv4 | Port forward, WireGuard on the router |
| 100.64.0.0/10 | No | Carrier-grade NAT | IPv6, ask the ISP for public IPv4, outbound tunnel or overlay |
| RFC 1918 | No | Double NAT (ISP router in front) | Bridge the ISP router, or treat as CGNAT |
| Any IPv6 global prefix delegated | n/a | IPv6 available | Direct IPv6 with explicit firewall rules |

## What This Means for the System You Build

- **Replace the flat network first,** because every later service inherits whatever segment it lands on.
- **Default deny between VLANs** and add flows by direction: the lab may reach IoT, IoT may never reach the lab.
- **Keep management interfaces on their own segment,** reachable from one admin device.
- **Run two resolvers on different hardware,** and stop clients from going around them.
- **Use `home.arpa` for local names** and split horizon on a real domain for anything that needs a trusted certificate.
- **Turn UPnP off,** and treat any port mapping protocol as a device opening your firewall without asking.
- **Check for CGNAT before designing anything inbound,** and check the IPv6 inbound policy before trusting it.
- **Choose a firewall project by its governance as well as its features:** the license and update terms of the box at the edge can change under you.

## References

**Standards**

- [RFC 6092: Simple Security Capabilities in CPE for Residential IPv6](https://www.rfc-editor.org/rfc/rfc6092), January 2011, discarding unsolicited inbound traffic and transparent mode as a permitted default
- [RFC 6598: IANA-Reserved IPv4 Prefix for Shared Address Space](https://www.rfc-editor.org/rfc/rfc6598), April 2012, 100.64.0.0/10, the IESG note, and no forwarding across provider boundaries
- [RFC 6887: Port Control Protocol (PCP)](https://www.rfc-editor.org/rfc/rfc6887), April 2013, MAP and PEER, CGN deployment, NAT-PMP fallback and UPnP IGD interworking
- [RFC 7084: Basic Requirements for IPv6 Customer Edge Routers](https://www.rfc-editor.org/rfc/rfc7084), November 2013, DHCPv6 prefix delegation, the size hint and a /64 per LAN
- [RFC 8375: Special-Use Domain 'home.arpa.'](https://www.rfc-editor.org/rfc/rfc8375), May 2018, local naming and the deprecated `.home`

**Firewall distributions**

- [Netgate: Announcing pfSense Plus](https://www.netgate.com/blog/announcing-pfsense-plus), January 21, 2021, the rename, 21.02 on CE 2.5, CE's continuation, Apache license, FreeBSD and pf
- [Netgate: Addressing changes to pfSense Plus Home+Lab](https://www.netgate.com/blog/addressing-changes-to-pfsense-plus-homelab), October 26, 2023, the February 14, 2022 no-cost path and its withdrawal
- [Netgate: pfSense Plus TAC Lite available for $129 per year](https://www.netgate.com/blog/netgate-pfsense-plus-tac-lite-available-for-129-per-year), October 30, 2023, reselling, no updates without a subscription, appliances unaffected
- [Netgate: pfSense software types](https://www.netgate.com/pfsense-plus-software/software-types), TAC Lite, Pro and Enterprise prices and CE at no charge, as of October 2026
- [Netgate Docs: UPnP and NAT-PMP](https://docs.netgate.com/pfsense/en/latest/services/upnp.html), "insecure" by nature, miniupnpd ports, ACLs IPv4 only
- [OPNsense Docs: Introduction](https://docs.opnsense.org/intro.html), the project, Deciso B.V. as copyright holder and the Business Edition
- [OPNsense 15.1 release notes](https://docs.opnsense.org/releases/CE_15.1.html), January 2, 2015, first release, FreeBSD 10, BSD 2-clause, fork lineage
- [m0n0wall: End announcement](https://m0n0.ch/wall/end_announcement.php), February 15, 2015, the end of m0n0wall and OPNsense as its successor
- [OPNsense Docs: VLAN and LAGG setup](https://docs.opnsense.org/manual/how-tos/vlan_and_lagg.html), VLAN devices, trunks, access ports and the native VLAN advice
- [OPNsense Docs: Unbound DNS](https://docs.opnsense.org/manual/unbound.html), default since 17.7, overrides, blocklists, DNS over TLS and blocking port 53
- [OPNsense Docs: WireGuard road warrior setup](https://docs.opnsense.org/manual/how-tos/wireguard-client.html), instances, peers, Allowed IPs, WAN rule and MSS values

**OpenWrt and UniFi**

- [OpenWrt: About](https://openwrt.org/about), the 2016 LEDE split, the January 2018 re-merge and SPI
- [OpenWrt: Table of Hardware](https://openwrt.org/toh/start), supported devices and the 4/32 and 8/64 exclusions
- [OpenWrt: Firewall configuration](https://openwrt.org/docs/guide-user/firewall/firewall_configuration), zones, forwardings, defaults and fw4 on nftables since 22.03
- [Ubiquiti Inc. Form 10-K, fiscal 2025](https://www.sec.gov/Archives/edgar/data/1511737/000151173725000053/ubnt-20250630.htm), UniFi OS and product lines, revenue by product type for fiscal 2025 and 2024

**DNS**

- [Pi-hole](https://pi-hole.net/), network-level blocking, caching, DHCP with optional IPv6, REST API
- [Pi-hole Docs: FTLDNS](https://docs.pi-hole.net/ftldns/), FTL and its dnsmasq base
- [Pi-hole Docs: Unbound](https://docs.pi-hole.net/guides/dns/unbound/), recursion instead of forwarding and the `127.0.0.1#5335` upstream
- [GitHub: AdguardTeam/AdGuardHome](https://github.com/AdguardTeam/AdGuardHome), GPL-3.0, encrypted upstreams and the comparison with Pi-hole
- [AdGuard: DNS filtering rules syntax](https://adguard-dns.io/kb/general/dns-filtering-syntax/), `$dnsrewrite` and its priority
- [NLnet Labs: unbound.conf(5)](https://nlnetlabs.nl/documentation/unbound/unbound.conf/), `local-zone` types, `local-data`, `local-data-ptr`, `private-address` and `private-domain`

**Measurement**

- [Richter et al.: A Multi-perspective Analysis of Carrier-Grade NAT Deployment](https://arxiv.org/html/1605.05606), ACM IMC 2016, CGN shares of non-cellular, eyeball and cellular ASes
- [Internet Society Pulse: 18 years later, IPv6 reaches majority](https://pulse.internetsociety.org/en/blog/18-years-later-ipv6-reaches-majority/), April 21, 2026, Google's 50.10% on March 28, 2026, country figures and the 43% Pulse average
