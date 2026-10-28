+++
title = "Exposing Home Services"
description = "Port forwards, UPnP and DDNS; DNS-01 certificates; Caddy, Traefik and NPM; Cloudflare Tunnel and its video terms; Tailscale, Headscale, WireGuard; ISP terms."
category = "Hosting & Cloud Industry"
order = 2111
part = "Homelab"
tags = ["homelab", "self-hosting", "reverse-proxy", "cloudflare-tunnel", "tailscale", "wireguard", "acme", "security"]
+++

Every self-hosted service eventually gets the same request: make it work from outside the house. That one decision turns a box in a closet into a small hosting provider, with a provider's problems and none of its staff. The service now has an attack surface, a certificate to renew, a DNS name that must follow a changing address, an ISP contract that may forbid it, and a patch cadence that matters, because the address space is scanned continuously. The ways to do it differ less in convenience than in who can reach the service: anyone on the internet, anyone a third party lets through, or only the household's own devices.

This chapter covers the methods in the order homelabs tend to try them: port forwarding and why carrier-grade NAT breaks it, UPnP and the NAS ransomware it enabled, dynamic DNS, certificates at home (HTTP-01 against DNS-01, wildcards, delegation, Caddy's local CA), reverse proxies (Caddy, Traefik, Nginx Proxy Manager), Cloudflare Tunnel and the history of its terms on video, overlays (WireGuard, Tailscale, Headscale) and a VPS relay; then the ISP terms that apply to all of them, and patching. It adds no provider tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); an exposed home service is a `site` whose origin happens to be a house. The router, VLANs and CGNAT detection underneath are [Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls); the apps being exposed are [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps); moving the public part out of the house is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation). Each piece returns at provider scale later in the book: certificates in [Web PKI](/books/hosting-and-cloud/web-pki) and [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale), the tunnel's other end in [The Edge Business](/books/hosting-and-cloud/edge-business), and what shields an origin in [DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation) and [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits).

## How the Providers Do It

| Method | Who runs it | Traffic path | Who can reach the service | Cost (as of October 2026) |
| --- | --- | --- | --- | --- |
| **Port forward plus DDNS** | You (router), a DDNS service for the name | Internet straight to the home's public IP | Anyone | Free (DuckDNS, No-IP's one free hostname) |
| **Cloudflare Tunnel** | Cloudflare, with `cloudflared` at home | Outbound from home to Cloudflare; visitors to Cloudflare | Anyone, or only those an Access policy admits | Tunnel free; Zero Trust free up to 50 users, then $7 per user per month |
| **Tailscale** | Tailscale (control plane), WireGuard between devices | Direct device to device, DERP relay as fallback | Tailnet members (Funnel aside) | Personal plan $0, up to 6 users, non-commercial |
| **Headscale** | You (control plane), Tailscale clients | Same as Tailscale | Tailnet members | Your server |
| **Plain WireGuard** | You | Device to router or server | Holders of a peer key | Free |
| **VPS relay** | You, on a rented VPS | Internet to VPS, tunnel to home | Anyone, or tunnel peers | VPS rent |

Three patterns run through the table. **Inbound or outbound is the first split:** a port forward needs the home to be reachable, while a tunnel or overlay dials out and works behind any NAT, including a carrier's. **Public or private is the second:** most homelab services have an audience of a few people, and a method that admits only known devices removes the internet from the threat model. **Every free tier has an owner with terms:** Cloudflare's on content, Tailscale's on commercial use, and the ISP's on the line itself.

## How It Got Here

- **January 2015 and September 2015:** the Caddy and Traefik projects start on GitHub; Caddy's selling point becomes HTTPS by default, Traefik's routing read from container labels.
- **June 2016:** eCh0raix ("QNAPCrypt") first surfaces against QNAP NAS boxes; it returns in large waves in June 2019 and June 2020.
- **April 5, 2018:** Cloudflare announces Argo Tunnel: `cloudflared` links a server to Cloudflare so that "Only Cloudflare can see the server and communicate with it," included at no extra cost for customers with Argo.
- **2019:** eCh0raix hits Synology devices by brute-forcing administrator credentials; from September 2020 one codebase targets both vendors.
- **March 29, 2020:** Linux 5.6 ships with WireGuard in mainline.
- **April 3, 2020:** Tailscale, founded in 2019 by four former Google engineers, launches on WireGuard with a $3 million seed round.
- **May 7, 2020:** Plex fixes CVE-2020-5741 in Plex Media Server 1.19.3.2764.
- **February 1, 2021:** Xfinity's acceptable use policy, revised, bars servers that provide content to anyone outside the home.
- **April 15, 2021:** Argo Tunnel becomes **Cloudflare Tunnel**, and "any organization can use the secure, outbound-only connection feature of the product at no cost."
- **June 2021:** Headscale v0.1.0, a self-hosted Tailscale control server.
- **August 10, 2021:** Palo Alto Networks' Cortex Xpanse counts "at least 250,000 Internet-exposed QNAP and Synology NAS devices."
- **January 26, 2022:** QNAP warns that DeadBolt "has been widely targeting all NAS exposed to the Internet without any protection"; Censys counts at least 3,687 encrypted devices, each ransomed for 0.03 bitcoin.
- **August to October 2022:** attackers reach a LastPass DevOps engineer's home computer through an unpatched media server; Plex tells press the fixed version was "roughly 75 versions ago."
- **May 16, 2023:** Cloudflare moves its content restriction from the self-serve agreement into CDN service-specific terms and drops "the antiquated HTML vs. non-HTML construct."
- **August 2026:** Charter closes its $34.5 billion purchase of Cox; Cox's acceptable use policy URL now redirects to Spectrum's.

The arc runs from opening ports toward dialing out. A decade ago exposing a service meant a port forward and a dynamic DNS name; the ransomware waves of 2019 to 2022 showed what an exposed management interface costs, and free outbound tunnels and WireGuard overlays made it unnecessary for most services to accept a single inbound packet.

## Port Forwarding and Its CGNAT Failure

A port forward is a destination NAT rule on the router: TCP 443 arriving on the WAN address goes to 10.0.10.60:443. It is the oldest method, the cheapest, and the only one in which nothing sits between the internet and the service. That is its whole risk: whatever listens on the forwarded port is now an internet-facing application, scanned continuously, and its next vulnerability is a remote one.

It also fails in the most common modern case. Behind carrier-grade NAT the router's WAN address is in 100.64.0.0/10, shared with other customers, and a forward on it never receives a packet; the same happens on a cellular or satellite backup line after failover ([Redundant Lines](/books/hosting-and-cloud/homelab-to-colocation#redundant-lines)). How to tell is the check in [IPv6 and CGNAT](/books/hosting-and-cloud/home-routing-and-firewalls#ipv6-and-cgnat). IPv6 removes the NAT but not the decision: a host with a global address is reachable only if the router's IPv6 rules pass the traffic, and a rule that does is a port forward by another name.

If a forward is the answer, it should be one port (443) to one reverse proxy, never a forward per app, and never to a management interface.

## UPnP and the NAS That Opened Itself

UPnP IGD, NAT-PMP and PCP let a device on the LAN create a port forward without asking anyone, and NAS vendors used them to make "remote access" work out of the box. The result was the NAS ransomware era. eCh0raix hit QNAP in waves from 2016 and Synology in 2019, where attackers brute-forced administrator credentials, and later exploited CVE-2021-28799, which BleepingComputer described as access to hard-coded credentials, "aka a backdoor account." DeadBolt in January 2022 encrypted at least 3,687 QNAP devices by Censys's count. QNAP's guidance named the cause: remove router port forwards for the NAS management ports (8080 and 443 by default), turn off UPnP in myQNAPcloud's Auto Router Configuration, update QTS, and use its relay service instead of open ports.

The lesson generalizes to every appliance: a device that can open the firewall will, and its management interface was never designed to face the internet. UPnP stays off on the router ([Home Routing, Firewalls & DNS](/books/hosting-and-cloud/home-routing-and-firewalls#ipv6-and-cgnat)), and NAS and hypervisor management stays on a management VLAN reachable only from the inside.

## Dynamic DNS

A residential IPv4 address changes, so a name that points at it needs updating. **DuckDNS** is free dynamic DNS hosted on AWS and funded by donations; a client calls `https://www.duckdns.org/update?domains=...&token=...&ip=` and, with `ip` blank, DuckDNS uses the caller's address. It cannot detect IPv6 (its AWS load balancer setup lacks it), so an IPv6 address has to be passed explicitly. **No-IP**'s free plan gives one hostname on its own domains; a custom domain is its paid Plus Managed DNS from $3.49 a month (as of October 2026). Most firewall distributions include a DDNS client for both and for DNS hosts with APIs.

A dynamic DNS name is the address book for a port forward, nothing more: it changes nothing about who can connect. With a domain already on a DNS host that has an API, the same update can be done against your own zone (and the zone's provider is chosen as in [DNS Hosting & DNSSEC](/books/hosting-and-cloud/dns-hosting-and-dnssec#authoritative-dns)), which also gives the API that DNS-01 certificates need.

## Certificates at Home

Every browser now expects HTTPS, and a password vault or photo app over plain HTTP is not an option even on a LAN. Let's Encrypt offers three challenge types, and the home picks between two.

**HTTP-01** places a token at `/.well-known/acme-challenge/` and Let's Encrypt fetches it over port 80: it "can only be done on port 80," residential ISPs sometimes block that port, and it "cannot be used to issue wildcard certificates." It also requires the service, or at least port 80, to be reachable from the internet, which defeats the purpose for anything private.

**DNS-01** proves control by writing a TXT record at `_acme-challenge.<name>`. It works for hosts that are never on the public internet and is the only way to a wildcard (`*.home.example.com`), so one certificate covers every service behind the proxy and no hostname appears in Certificate Transparency logs except the wildcard. The cost is that the proxy holds DNS API credentials, and Let's Encrypt warns that "putting your full DNS API credentials on your web server significantly increases the impact if that web server is hacked." Two mitigations: a token scoped to one zone with only DNS edit rights (Caddy's Cloudflare plugin asks for `Zone.Zone:Read` and `Zone.DNS:Edit`), and **delegation**, where `_acme-challenge.home.example.com` is a CNAME into a separate zone that exists only for challenges, so a stolen token can't rewrite the main zone. TLS-ALPN-01 exists for port 443 but, in Let's Encrypt's words, "is not suitable for most people."

**Caddy's automatic HTTPS** is why it is the common choice: it serves "all sites over HTTPS" by default, redirects HTTP, renews automatically, and tries ZeroSSL if Let's Encrypt fails. For DNS-01 it needs a build with the provider's `caddy-dns` plugin (an `xcaddy build --with` or the `caddy:<version>-builder` Docker stage), then `tls { dns cloudflare {env.CF_API_TOKEN} }`. For names no public CA will sign (`localhost`, `nas.home.arpa`), `tls internal` uses Caddy's own local CA, whose root Caddy tries to install into the system trust store; every other device must be told to trust that root by hand. On-demand TLS, which issues certificates at handshake time, must be gated by an `ask` endpoint or anyone can make the proxy request certificates for arbitrary names.

My rule: a real domain with DNS-01 wildcards for anything a phone or a family member will open, the local CA only for machine-to-machine names. How CAs, Certificate Transparency and ACME work at provider scale is [Web PKI](/books/hosting-and-cloud/web-pki#certificate-transparency) and [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale).

## Reverse Proxies

One proxy terminates TLS for every service, routes by hostname, and is the only process that publishes ports on the host ([Running Apps: Compose and Its Front Ends](/books/hosting-and-cloud/self-hosted-apps#running-apps-compose-and-its-front-ends) sets up the shared network). It is the home version of a provider's load balancer and ingress ([Ingress to Gateway API](/books/hosting-and-cloud/cluster-networking#ingress-to-gateway-api) is the cluster form).

**Caddy** is configured in a Caddyfile, a site block per name or one wildcard block with `host` matchers per service, and handles certificates itself.

**Traefik** reads routes from Docker labels. Its Docker provider's `exposedByDefault` is `true`, meaning every container on the host is routed unless excluded; set it to `false` and opt in with `traefik.enable=true` per container. Its documentation is direct about the price of label discovery: "Accessing the Docker API without any restriction is a security concern," since a compromised Traefik could reach the host, and it recommends a socket proxy that filters which Docker API calls Traefik may make. Mounting `/var/run/docker.sock` with `:ro` doesn't help: the flag applies to the socket file, not to the API calls made through it.

**Nginx Proxy Manager** is nginx with a web UI in a Docker image: proxy hosts, built-in Let's Encrypt, and users who manage their own hosts, aimed at people who want a form rather than a config file. The tradeoff is the same as any UI-first tool: the configuration lives in its database, not in Git.

Whichever proxy, the rules are the same: one entry point, `exposedByDefault=false` or its equivalent, an allowlist (`remote_ip private_ranges` in Caddy) on anything not meant for the internet, and authentication at the proxy for apps that have weak or no login of their own.

## Cloudflare Tunnel

**How it works.** `cloudflared` runs at home and "initiates an outbound connection through your firewall from the origin to the Cloudflare global network." The origin needs no public IP and no inbound rule, so it works behind CGNAT and on a backup line; "you can then block all inbound traffic to the origin." Each running `cloudflared` is a **connector**, several connectors on one tunnel act as replicas, and each sends traffic to the nearest Cloudflare data center. A locally managed tunnel is a `config.yml` naming the tunnel UUID and credentials file, and a list of **ingress rules**: `hostname`, optional `path` regex, and `service` (`http://localhost:8080`, `ssh://localhost:22`, `tcp://...`, `unix:...` or `http_status:404`). The file "must always include a catch-all rule that concludes the file," and `cloudflared tunnel ingress validate` checks it.

**Access in front.** A public hostname on a tunnel is public. Cloudflare Access puts an identity check in front: a self-hosted application on the hostname, where "all Access applications are deny by default," an Allow policy naming the people let in, and an identity provider or one-time PIN by email (the PIN expires in 10 minutes, and Cloudflare "only sends the email if the user is allowed by an Access policy"). Zero Trust's free plan covers up to 50 users, then $7 per user per month (as of October 2026). The result is a service reachable from any browser that never accepts a connection from anyone Cloudflare hasn't authenticated.

**The cost** is position: Cloudflare terminates TLS, sees the plaintext, and can suspend the hostname under its terms. For a status page or a share link that is a good trade; for a password vault it is a third party inside the trust boundary.

## Cloudflare's Terms and Video

The terms history is why media servers don't belong on the tunnel. Before May 2023, section 2.8 of Cloudflare's Self-Serve Subscription Agreement was a content restriction built on an HTML versus non-HTML distinction, which Cloudflare later described as limiting the CDN to web pages. On May 16, 2023 it removed "the antiquated HTML vs. non-HTML construct, which was far too broad," moved the restriction into CDN-specific service terms, allowed video and large files when hosted on a Cloudflare service "like Stream, Images, or R2," and said "Video and large files hosted outside of Cloudflare will still be restricted on our CDN."

As of October 2026 the Service-Specific Terms (updated September 28, 2026) say that, unless you are an Enterprise customer, Cloudflare offers Paid Services "that you must use in order to serve video and other large files via the CDN," and that it "reserves the right to disable or limit your access to or use of the CDN" if you serve "video or a disproportionate percentage of pictures, audio files, or other large files" without them, with reasonable efforts at notice. The terms don't name Tunnel; a tunnel's public hostname is served through the same proxy as any other Cloudflare site, so I read the CDN restriction as applying to it. Streaming a Plex or Jellyfin library through a tunnel is the case the restriction describes, and the remote viewers belong on the overlay instead ([Media Servers: Plex, Jellyfin and Emby](/books/hosting-and-cloud/self-hosted-apps#media-servers-plex-jellyfin-and-emby)).

## Tailscale, Headscale and WireGuard

**WireGuard** is the protocol under all three. Jason Donenfeld's patch describes it as "a layer 3 secure networking tunnel made specifically for the kernel," and it has been in mainline Linux since 5.6 (March 29, 2020). A peer is a key pair and a list of Allowed IPs; there is no session negotiation to configure and nothing listening that answers an unauthenticated packet. Its limits are operational: keys are distributed by hand, and at least one side needs a reachable endpoint, which is the router setup in [VPN at the Edge](/books/hosting-and-cloud/home-routing-and-firewalls#vpn-at-the-edge) and fails behind CGNAT.

**Tailscale** adds a coordination server that distributes keys, NAT traversal so devices behind different NATs connect directly, and **DERP** relays as the last resort when "hard NAT, firewalls" prevent a direct path; relayed traffic stays end to end encrypted, and "it's impossible for a DERP server to decrypt your traffic." Devices get 100.x.y.z addresses and IPv6 from `fd7a:115c:a1e0::/48`. A **subnet router** (`tailscale set --advertise-routes=10.0.10.0/24`, with IP forwarding enabled and the route approved or auto-approved) puts a whole VLAN on the tailnet without a client on each device. Access is a policy file of `groups`, `tagOwners` and **grants** (`src`, `dst`, `ip`), with `tests` that fail a policy change that would break an expected path. The Personal plan, as of October 2026: $0, up to 6 users, unlimited user devices, 50 tagged resources then $1 a month each, 3 ACL groups, and "only suitable for non-commercial use." **Funnel** is the exception to private-only: it routes public internet traffic to a tailnet device on ports 443, 8443 or 10000 only, under "non-configurable bandwidth limits," and is in beta on all plans.

**Headscale** is "an open source, self-hosted implementation of the Tailscale control server" (BSD-3-Clause) for "a single Tailscale network (tailnet), suitable for a personal use." It is "not associated with Tailscale Inc," though one maintainer is employed there. The official clients connect to it, so the devices behave as on Tailscale and only the control plane moves home. Its README says the maintainers "do not support nor encourage the use of reverse proxies and container to run Headscale," and the control server needs a public address the clients can reach, which usually means a small VPS.

The choice among them is who holds the control plane. Tailscale's is a company's, with its plan terms; Headscale's is yours, with its upkeep; plain WireGuard has none, which is fine for three peers and tedious for thirty.

## A VPS Relay

When the home can't receive connections and the service must be public without a third party terminating TLS, the relay is a rented VPS ([The VPS as a Product](/books/hosting-and-cloud/virtualization-and-vps#the-vps-as-a-product)). The home dials a WireGuard tunnel to the VPS; the VPS has the public address, accepts 443, and forwards it down the tunnel to the reverse proxy at home, either as raw TCP (so TLS still terminates at home and the VPS sees only ciphertext) or through a proxy on the VPS. The same VPS can announce your own prefix with BGP ([BGP From Home](/books/hosting-and-cloud/homelab-to-colocation#bgp-from-home)). The cost is a few dollars a month and another internet-facing machine to patch, and the VPS's bandwidth allowance becomes the service's.

## ISP Terms on Servers

Every method above runs over a residential line, and the contract applies whatever the transport ([Static IPs, Business Plans and Residential AUPs](/books/hosting-and-cloud/homelab-to-colocation#static-ips-business-plans-and-residential-aups) compares business plans). As of October 2026:

- **Xfinity** is explicit: its policy (revised February 1, 2021) bars "dedicated, stand-alone equipment or servers from the Premises that provide network content" to anyone outside the home, with email, web hosting, file sharing and proxy services as examples, and allows serving only for "personal and non-commercial residential use."
- **AT&T**'s acceptable use policy has a server clause, but only "with respect to dial-up accounts," which bars "using such account for the purpose of operating a server of any type"; the page shows no effective date.
- **Spectrum**'s residential policy has no explicit server clause: it bars using the service "to operate any type of business or commercial enterprise" (work from home is permitted), forbids configuring "a static IP address or use any protocol other than DHCP," and lists open mail relays, open proxies and unsecured Wi-Fi as abuse. Residential plans like this bar commercial use and static addressing rather than self-hosting as such.
- **Cox** customers now land on Spectrum's policy: after Charter closed its $34.5 billion purchase of Cox in August 2026, Cox's acceptable use policy URL redirects to Spectrum's internet use policy.

A tunnel hides the open port, not the use: a public, revenue-earning service on a residential line is the case these policies are written against, by port forward or by tunnel. A personal service for the household and its friends is the case most of them allow.

## Security and Patching

An exposed service is patched on the schedule of an internet-facing product, because that is what it is. The LastPass breach of 2022 is the reference case for why a home server is part of someone's attack surface: per the press account, attackers used a vulnerability in third-party media software to plant a keylogger on a DevOps engineer's home computer and capture credentials to the company's cloud storage; Plex said the flaw was CVE-2020-5741, a deserialization bug in Plex Media Server on Windows (CVSS 7.2, exploitable by an authenticated attacker to run Python as the server's user), fixed in 1.19.3.2764 on May 7, 2020, and that "the LastPass employee never upgraded their software to activate the patch." LastPass's own incident notice does not name Plex.

What follows for a homelab:

- **Inventory what is reachable,** by which method, from where; the inventory in [How to Build It](#how-to-build-it) is the minimum.
- **Patch on a cadence by exposure:** public services within days of a release, tailnet-only services monthly, LAN-only on the regular cycle. The playbook's [Remediation Targets](/docs/security/vulnerability-management#remediation-targets) are the business version of the same rule.
- **Put authentication in front of weak apps:** Access, an identity-aware proxy, or the overlay itself, with [MFA](/docs/security/authentication#multi-factor-authentication) on whatever account controls the tunnel or tailnet, because that account is now the front door.
- **Draw the system before opening it:** where traffic enters, what it can reach, and what a compromise of the proxy gives away ([Draw the System](/docs/security/threat-modeling#draw-the-system)).
- **Keep the exposed hosts off the trusted segment:** a compromised media server should land in the lab VLAN, not next to the laptops ([VLANs and Segmentation](/books/hosting-and-cloud/home-routing-and-firewalls#vlans-and-segmentation)).

What an attacker does with a compromised home server once it is turned against others (scanning, spam, proxying) is the subject of [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure).

## The Alternatives

| Method | Works behind CGNAT | Public to anyone | Cost (as of October 2026) | Main risk |
| --- | --- | --- | --- | --- |
| **Port forward plus DDNS plus proxy** | No | Yes | Free | Every exposed app's next CVE (DeadBolt, eCh0raix, CVE-2020-5741); ISP terms |
| **IPv6 with a pass rule** | Yes, if the ISP delegates a prefix | Yes, over IPv6 only | Free | Same as a port forward; IPv4-only visitors can't connect |
| **Cloudflare Tunnel** | Yes | Yes, or behind Access | Free; Access free to 50 users | Cloudflare terminates TLS; CDN terms on video and large files |
| **Cloudflare Tunnel plus Access** | Yes | Only admitted identities | Same | Account takeover of the Cloudflare login |
| **Tailscale** | Yes (direct or DERP) | No, tailnet only (Funnel aside) | Free to 6 users, non-commercial | Third-party control plane; plan terms |
| **Tailscale Funnel** | Yes | Yes, ports 443, 8443, 10000 | Included, beta | Bandwidth limits; public like a port forward |
| **Headscale plus Tailscale clients** | Yes | No | A small VPS | You run and patch the control plane |
| **Plain WireGuard on the router** | No (needs a reachable endpoint) | No | Free | Key distribution by hand |
| **VPS relay (WireGuard)** | Yes | Yes | VPS rent | Another internet-facing box; VPS bandwidth caps |

## My Default

My default is to expose nothing by default. Private access goes over Tailscale, with a subnet router for the lab VLAN and grants that give the household the reverse proxy and the admin the rest; I'd move to Headscale when the tailnet outgrows the Personal plan's terms or I want no third-party control plane, accepting a VPS to run it on. Inside, Caddy terminates TLS with a DNS-01 wildcard for `*.home.example.com`, through a delegated `_acme-challenge` zone, so every service has a real certificate without a public name. The few things that must be public to people without the app (a status page, a file share link, a form) go through Cloudflare Tunnel with an Access policy in front, and never video: remote media viewers get a tailnet invitation. NAS and hypervisor management are never forwarded, tunneled or funneled, UPnP is off, and the exposure inventory below is updated whenever a method changes.

I'd pick a port forward to one reverse proxy instead when the home has a public IPv4, the service must be public without a third party in the path, and I'm prepared to patch it like a product; and a VPS relay for the same need behind CGNAT. What would change this: a service that earns money or carries real traffic, which belongs on a business line, a VPS or colocation ([When the House Isn't Enough](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough)) rather than a residential line by any transport.

## How to Build It

The core data model gets no provider tables from this chapter. The home equivalent of a provider's site and certificate inventory is the `exposure` field in the lab's `inventory.yaml` ([How to Build It](/books/hosting-and-cloud/self-hosted-apps#how-to-build-it)), the proxy config and the tailnet policy, all in Git.

**The proxy: Caddy with a DNS-01 wildcard.** A Caddy image built with the Cloudflare DNS plugin, one wildcard site, a `host` matcher per service, and an allowlist on everything not meant for outside:

```dockerfile
# proxy/Dockerfile: Caddy with the caddy-dns/cloudflare plugin.
FROM caddy:2-builder AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

```text
# proxy/Caddyfile
# CF_API_TOKEN: scoped to the challenge zone only, Zone.Zone:Read and Zone.DNS:Edit.
# Public zone: _acme-challenge.home.example.com CNAME to the challenge zone (delegation).
*.home.example.com {
	tls {
		dns cloudflare {env.CF_API_TOKEN}
	}

	# Not the LAN, the VLANs or the tailnet (Tailscale's 100.x addresses sit in 100.64.0.0/10).
	@outside not remote_ip private_ranges 100.64.0.0/10

	@vault host vault.home.example.com
	handle @vault {
		respond @outside 403                 # Caddy orders respond before reverse_proxy
		reverse_proxy vaultwarden:80
	}

	@photos host photos.home.example.com
	handle @photos {
		respond @outside 403
		reverse_proxy immich-server:2283
	}

	@status host status.home.example.com
	handle @status {
		reverse_proxy uptime-kuma:3001       # public via the tunnel, behind Access
	}

	handle {
		abort                                # unknown names get nothing
	}
}
```

Inside the house, the split-horizon zone in [How to Build It](/books/hosting-and-cloud/home-routing-and-firewalls#how-to-build-it) answers `*.home.example.com` with the proxy's 10.0.10.60, so these names never resolve to anything public.

**The tunnel: `cloudflared` for the one public service.** A locally managed tunnel with ingress rules; only the listed hostname is routed, and everything else gets a 404:

```yaml
# /etc/cloudflared/config.yml
tunnel: 6ff42ae2-765d-4adf-8112-31c55c1551ef
credentials-file: /etc/cloudflared/6ff42ae2-765d-4adf-8112-31c55c1551ef.json

ingress:
  # The public status page, served by Caddy so TLS and routing stay in one place.
  - hostname: status.example.com
    service: https://status.home.example.com     # split-horizon DNS resolves this to Caddy, 10.0.10.60
    originRequest:
      httpHostHeader: status.home.example.com    # the Host Caddy routes on; the certificate name
                                                 # cloudflared verifies defaults to the service's host
  # Required catch-all: anything else is refused.
  - service: http_status:404
```

```sh
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://status.example.com   # shows which rule matches
```

Requests through the tunnel reach Caddy from `cloudflared`'s own LAN address, so the `@outside` allowlist can't tell them from household traffic; the ingress list is therefore the real boundary, and it names only the public hostname. Before the hostname goes live, Zero Trust > Access controls > Applications gets a self-hosted application for `status.example.com` with an Allow policy (the household's emails, one-time PIN as the login method), because Access applications are deny by default and a tunnel hostname without one is open to the internet. A truly public page skips Access; a family file share never does. Nothing here carries video.

**The tailnet policy.** Groups, tags, grants and tests; the subnet router advertises the lab VLAN and is auto-approved:

```json
{
  "groups": {
    "group:family": ["alex@example.com", "sam@example.com"],
    "group:admins": ["alex@example.com"]
  },
  "tagOwners": {
    "tag:subnet-router": ["group:admins"]
  },
  "autoApprovers": {
    "routes": { "10.0.10.0/24": ["tag:subnet-router"] }
  },
  "grants": [
    // The household reaches the reverse proxy and DNS, nothing else in the lab.
    { "src": ["group:family"], "dst": ["10.0.10.60"], "ip": ["tcp:443"] },
    { "src": ["group:family"], "dst": ["10.0.10.2", "10.0.10.3"], "ip": ["53"] },
    // Admins reach the whole lab VLAN, including the hypervisor and NAS UIs.
    { "src": ["group:admins"], "dst": ["10.0.10.0/24"], "ip": ["*"] }
  ],
  "tests": [
    { "src": "sam@example.com", "proto": "tcp", "accept": ["10.0.10.60:443"], "deny": ["10.0.10.30:443", "10.0.10.11:8006"] },
    { "src": "alex@example.com", "proto": "tcp", "accept": ["10.0.10.11:8006"] }
  ]
}
```

```sh
# On the subnet router (a small VM or LXC in the lab VLAN), after enabling IP forwarding.
sudo tailscale up --advertise-tags=tag:subnet-router
sudo tailscale set --advertise-routes=10.0.10.0/24
```

The tests are the point: a later edit that would let a family member reach the NAS UI (10.0.10.30) or Proxmox (10.0.10.11:8006) fails to save.

**The exposure inventory.** One row per service, using the `exposure` classes from `inventory.yaml` (`none | lan | proxy-allowlist | public`), with how it is reached, who authenticates it and how fast it is patched:

| Service | Exposure class | Method | Authentication | Patch cadence | Notes |
| --- | --- | --- | --- | --- | --- |
| **Vaultwarden** | proxy-allowlist | Tailscale to Caddy | App login with 2FA; tailnet identity | Within 7 days of a release | Never on the tunnel or Funnel |
| **Immich** | proxy-allowlist | Tailscale to Caddy | App login; tailnet identity | Monthly | Mobile app backs up over the tailnet |
| **Jellyfin** | proxy-allowlist | Tailscale to Caddy | App login; tailnet identity | Monthly | Video: never through Cloudflare's CDN |
| **Status page** | public | Cloudflare Tunnel to Caddy | None (read-only) or Access | Within 7 days | The only public hostname |
| **Home Assistant** | proxy-allowlist | Tailscale to Caddy | App login with MFA | Monthly | IoT VLAN reached from the lab, not the reverse |
| **Proxmox, NAS UI, switch, firewall** | lan | Admin grant on the tailnet; MGMT VLAN | Local accounts with MFA where offered | On release for security fixes | Never forwarded, tunneled or funneled |
| **Kiwix** | lan | LAN only | None | Quarterly | Read-only reference |

The dates belong in the inventory next to `restore_tested`: a service whose last update is older than its cadence is the first thing to fix or to stop exposing.

## What This Means for the System You Build

- **Default to no exposure,** and add each method per service with a reason.
- **Prefer outbound methods** (overlay, tunnel, relay): they work behind CGNAT and accept no unsolicited packets.
- **Use DNS-01 wildcards with a scoped, delegated token** so private services get real certificates without public names.
- **Run one reverse proxy** with `exposedByDefault=false` or its equivalent, and an allowlist on everything not meant for outside.
- **Put an identity check in front of anything public** that has a weak login, and protect the account that controls the tunnel or tailnet.
- **Keep video off Cloudflare's CDN** unless it is on a Cloudflare media product.
- **Never expose NAS, hypervisor or network management,** and keep UPnP off.
- **Read the residential contract:** a tunnel changes the transport, not what the line may be used for.
- **Patch exposed services like products,** on a cadence written next to each one.

## References

**History and incidents**

- [Cloudflare: Argo Tunnel](https://blog.cloudflare.com/argo-tunnel/), April 5, 2018, origins visible only to Cloudflare and inclusion with Argo
- [Cloudflare: Tunnel for everyone](https://blog.cloudflare.com/tunnel-for-everyone/), April 15, 2021, the rename and the free outbound-only connection
- [BleepingComputer: eCh0raix now targets both QNAP and Synology](https://www.bleepingcomputer.com/news/security/ech0raix-ransomware-now-targets-both-qnap-and-synology-nas-devices/), August 10, 2021, the 2016 start, the 2019 Synology campaign, CVE-2021-28799 and 250,000 exposed devices
- [QNAP: Stop your NAS from exposing to the Internet](https://www.qnap.com/en-us/security-news/2022/take-immediate-actions-to-stop-your-nas-from-exposing-to-the-internet-and-update-qts-to-the-latest-available-version-fight-against-ransomware-together), January 26, 2022, DeadBolt, management ports, UPnP and myQNAPcloud Link
- [The Hacker News: QNAP warns of DeadBolt ransomware](https://thehackernews.com/2022/01/qnap-warns-of-deadbolt-ransomware.html), January 28, 2022, 0.03 bitcoin per device and Censys's count of 3,687
- [The Hacker News: LastPass hack, engineer's failure to update Plex](https://thehackernews.com/2023/03/lastpass-hack-engineers-failure-to.html), March 7, 2023, the home computer, CVE-2020-5741, the May 7, 2020 fix and Plex's statement
- [LastPass: Notice of recent security incident](https://blog.lastpass.com/posts/notice-of-recent-security-incident), the company's own account, which does not name the media software
- [Light Reading: Charter-Cox deal is a wrap](https://www.lightreading.com/cable-technology/charter-cox-deal-is-a-wrap-with-spectrum-brand-to-take-over-within-a-year), August 20, 2026, the $34.5 billion close and the Spectrum brand in Cox markets

**Certificates and proxies**

- [Let's Encrypt: Challenge types](https://letsencrypt.org/docs/challenge-types/), HTTP-01 on port 80, DNS-01 wildcards, API credential risk, CNAME delegation and TLS-ALPN-01
- [Caddy: Automatic HTTPS](https://caddyserver.com/docs/automatic-https), defaults, ZeroSSL fallback, the local CA and trust store, the DNS challenge and on-demand TLS
- [Caddy: tls directive](https://caddyserver.com/docs/caddyfile/directives/tls), `tls internal` and `dns <provider>`
- [Caddy: Common Caddyfile patterns](https://caddyserver.com/docs/caddyfile/patterns), the wildcard site with `host` matchers and `abort`
- [Caddy: Request matchers](https://caddyserver.com/docs/caddyfile/matchers), `remote_ip`, `client_ip` and `private_ranges`
- [Caddy: Build from source](https://caddyserver.com/docs/build), `xcaddy build --with` and the builder image
- [GitHub: caddy-dns/cloudflare](https://github.com/caddy-dns/cloudflare), the token syntax and its `Zone.Zone:Read` and `Zone.DNS:Edit` permissions
- [Traefik: Docker provider](https://doc.traefik.io/traefik/reference/install-configuration/providers/docker/), `exposedByDefault`, the Docker API warning and the socket proxy
- [Nginx Proxy Manager](https://nginxproxymanager.com/), the Docker image, built-in Let's Encrypt and multi-user hosts
- [GitHub: caddyserver/caddy](https://github.com/caddyserver/caddy), the project, started January 2015
- [GitHub: traefik/traefik](https://github.com/traefik/traefik), the project, started September 2015

**Dynamic DNS**

- [DuckDNS: FAQ](https://www.duckdns.org/faqs.jsp), the update URL, IP detection, IPv6 limitation and funding
- [No-IP: Free Dynamic DNS](https://www.noip.com/free), one free hostname and Plus Managed DNS pricing as of October 2026

**Cloudflare Tunnel and terms**

- [Cloudflare Docs: Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/), outbound-only connections, connectors and replicas
- [Cloudflare Docs: Configuration file](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/), ingress rules, the catch-all and `ingress validate`
- [Cloudflare Docs: Origin parameters](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/cloudflared-parameters/origin-parameters/), `httpHostHeader` and `originServerName`
- [Cloudflare Docs: Add a self-hosted public application](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/), deny by default, policies and identity providers
- [Cloudflare Docs: One-time PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/), PIN expiry and policy-gated email
- [Cloudflare: SASE and Zero Trust plans](https://www.cloudflare.com/plans/sase-zero-trust.md), the 50-user free plan and $7 per user pay-as-you-go, as of October 2026
- [Cloudflare: Updated terms of service](https://blog.cloudflare.com/updated-tos/), May 16, 2023, section 2.8, the HTML construct dropped, the move to CDN terms and Stream, Images and R2
- [Cloudflare: Service-Specific Terms, Application Services](https://www.cloudflare.com/service-specific-terms-application-services/), updated September 28, 2026, the CDN video and large-file restriction

**Overlays**

- [Kernel Newbies: Linux 5.6](https://kernelnewbies.org/Linux_5.6), March 29, 2020, WireGuard in mainline
- [GitHub: torvalds/linux commit e7096c1](https://github.com/torvalds/linux/commit/e7096c131e5161fa3b8e52a650d7719d2857adfd), "net: WireGuard secure network tunnel"
- [BetaKit: Tailscale launches with $3 million seed round](https://betakit.com/tailscale-launches-remote-work-network-access-technology-with-3-million-seed-round/), April 3, 2020, the founders, 2019 founding and WireGuard
- [Tailscale: Pricing](https://tailscale.com/pricing), the Personal plan's users, devices, tagged resources, groups and non-commercial terms, as of October 2026
- [Tailscale Docs: DERP servers](https://tailscale.com/kb/1232/derp-servers), relays as last resort and end-to-end encryption
- [Tailscale Docs: IP and DNS addresses](https://tailscale.com/kb/1033/ip-and-dns-addresses), 100.x.y.z and `fd7a:115c:a1e0::/48`
- [Tailscale Docs: Subnet routers](https://tailscale.com/kb/1019/subnets), IP forwarding, `--advertise-routes`, approval and `autoApprovers`
- [Tailscale Docs: Grants](https://tailscale.com/kb/1324/grants), `src`, `dst`, `ip` and `app`, and grants alongside ACLs
- [Tailscale Docs: Grants syntax](https://tailscale.com/kb/1538/grants-syntax), CIDR destinations and `ip` port forms
- [Tailscale Docs: Policy syntax](https://tailscale.com/kb/1337/policy-syntax), `groups`, `tagOwners` and `tests`
- [Tailscale Docs: Funnel](https://tailscale.com/kb/1223/funnel), public routing, ports 443, 8443 and 10000, bandwidth limits and beta status
- [GitHub: juanfont/headscale](https://github.com/juanfont/headscale), scope, BSD-3-Clause, the Tailscale employee maintainer and the reverse proxy warning
- [GitHub: Headscale v0.1.0](https://github.com/juanfont/headscale/releases/tag/v0.1.0), the first release, June 2021

**ISP terms**

- [Xfinity: Acceptable Use Policy](https://www.xfinity.com/corporate/customers/policies/highspeedinternetaup), revised February 1, 2021, the server clause and personal non-commercial use
- [AT&T: Acceptable Use Policy](https://www.att.com/legal/terms.aup.html), the dial-up-only server clause, no effective date shown
- [Spectrum: Internet Use Policy](https://www.spectrum.com/policies/internet-use-policy), viewed October 27, 2026, commercial use, static IP and DHCP, abuse of resources and work from home; also the destination of Cox's former policy URL
