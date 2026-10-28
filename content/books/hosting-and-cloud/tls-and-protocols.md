+++
title = "TLS & Protocols at the Edge"
description = "TLS termination at the edge, SNI and custom hostnames, edge-to-origin modes, origin pulls, HTTP/2, HTTP/3 and QUIC, ECH, post-quantum key agreement and pricing."
category = "Hosting & Cloud Industry"
order = 2176
part = "The Edge"
tags = ["tls", "http3", "quic", "edge", "certificates", "post-quantum"]
+++

An edge network can't cache, filter or route an HTTPS request it can't read, so the first thing it does with a connection is finish the TLS handshake itself. That puts the customer's private key (or a key the provider holds on its behalf) on servers in hundreds of cities, makes the provider the party a browser authenticates, and splits every request into two connections: visitor to edge, and edge to origin. The first is what the padlock describes; the second is configuration, and for years the default on some networks was to send it in plaintext.

For a provider, TLS and protocols are where the edge's costs and promises meet. Certificates for millions of hostnames have to be issued, deployed and selected by SNI on every server; protocol versions have to be retired without stranding old clients; HTTP/2 and HTTP/3 have to be terminated at the edge while origins keep speaking HTTP/1.1; and each new feature (encrypted client hello, post-quantum key agreement) ships first at the edge because the edge is where the client handshakes. This chapter covers termination and where the key lives, SNI and custom hostnames for SaaS platforms, edge-to-origin modes and authenticated origin pulls, minimum versions and cipher profiles, HTTP/2 and connection reuse, HTTP/3 and QUIC, ECH, post-quantum key agreement, and what's free versus paid, then extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with edge hostnames and zone TLS settings. How certificates are issued, validated, logged and renewed belongs to the Certificates part ([The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki#certificate-transparency); [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale); [Shorter Lifetimes, Revocation & Distrust](/books/hosting-and-cloud/certificate-lifetimes-and-distrust)); this chapter only uses them.

## How the Providers Do It

As of October 2026:

| Provider | Edge certificates | Custom hostnames for SaaS | Edge to origin | Origin authentication | HTTP/3 | Post-quantum |
| --- | --- | --- | --- | --- | --- | --- |
| **Cloudflare** | Universal SSL on all plans (apex and first-level subdomains); Advanced Certificate Manager as a paid add-on; custom uploads on Business and Enterprise | Cloudflare for SaaS: 100 hostnames included, $0.10 each after, up to 50,000 outside Enterprise | Off, Flexible, Full, Full (strict), Strict (SSL-only origin pull), or Automatic | Authenticated Origin Pulls on all plans: a shared provider certificate, or the customer's own per zone or hostname; Origin CA certificates for origins | All plans; not to the origin | Hybrid key agreement on essentially all domains; to origins rolling out |
| **Akamai** | Standard TLS (SNI, not for PCI traffic), Enhanced TLS (PCI, `edgekey.net`), a shared `akamaized.net` certificate | Through edge hostnames on the customer's certificates | Origin certificate trust: platform settings, or custom (standard CAs, custom CAs, pinned certificates) | mTLS Origin Keystore: client certificates the edge presents | Not covered on the pages opened | Not covered on the pages opened |
| **Fastly** | Fastly-managed TLS subscriptions (Certainly by default, Let's Encrypt, GlobalSign on paid accounts) or BYOC | Billed per domain activated at month end; five managed and five Let's Encrypt or BYOC certificates included | Per backend: `use_ssl`, `ssl_check_cert`, `ssl_cert_hostname`, `ssl_sni_hostname`, `ssl_ca_cert`, min and max TLS version | `ssl_client_cert` and `ssl_client_key` per backend | In the default TLS configuration, `HTTP/3 & TLS v1.3 +0RTT (t.sni)` | Not covered on the pages opened |
| **Amazon CloudFront** | ACM certificates (requested or imported in `us-east-1`) or IAM; SNI, or dedicated IPs at $600 a month per certificate | Multi-tenant distributions and distribution tenants | Origin protocol policy: HTTP Only, HTTPS Only, Match Viewer; invalid or self-signed origin certificates drop the connection | Not covered on the pages opened | No additional charge since 15 Aug 2022; HTTP/1.1 to origins | `X25519MLKEM768` and `SecP256r1MLKEM768`, TLS 1.3 only |
| **Google Cloud** (load balancer and Cloud CDN) | Certificate Manager: Google-managed with DNS or load balancer authorization, certificate maps by hostname | Certificate maps | HTTP/2 over TLS or H2C to backends | Backend mTLS documented separately | Between clients and the load balancer only; gQUIC removed April 2023 | `X25519MLKEM768` on the frontend; the `DEFAULT` setting disallowed it until October 2026 |
| **Bunny** | Free auto-renewing Let's Encrypt certificates per hostname; free wildcards on Bunny DNS; uploads for commercial certificates | Per hostname | Not covered on the pages opened | Not covered on the pages opened | Not covered on the pages opened | Not covered on the pages opened |

Three patterns run through the table:

- **The edge certificate became free; everything around it is sold.** Cloudflare since 2014, Bunny, CloudFront's free tier and Fastly's included subscriptions all issue certificates at no charge. What's paid is control (uploaded certificates, CA choice, cipher control), scale (SaaS hostnames past an allowance) and legacy reach (dedicated IPs for clients without SNI).
- **Edge-to-origin security is a setting, and the settings don't share names.** Every provider separates "use TLS to the origin" from "verify the origin's certificate," and the combinations have five names at one provider and three at another. The model below uses neutral columns and maps each provider onto them.
- **New protocols stop at the edge.** HTTP/3 and post-quantum key agreement terminate at the edge; CloudFront and Cloudflare fetch from origins without HTTP/3, and Google supports post-quantum key exchange "only for frontend TLS connections."

## How TLS and Protocols Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Feb 1995 | SSL 2.0, "The SSL Protocol" (K. Hickman, Netscape) | Encrypting HTTP for commerce | Flaws that RFC 6176 would later prohibit outright |
| 18 Nov 1996 | SSL 3.0, last published version (recorded as historic in RFC 6101, Aug 2011) | SSL 2.0's design weaknesses | CBC padding and RC4 problems that POODLE exploited; RFC 7568 (Jun 2015): "SSLv3 MUST NOT be used" |
| Jan 1999 | TLS 1.0 (RFC 2246), "based on the SSL 3.0 Protocol Specification as published by Netscape" | An IETF standard for the same protocol | Inherited SSL 3.0's construction |
| Jun 2003 | Server Name Indication (RFC 3546; RFC 6066, Jan 2011) | One IP address per certificate: the client now names the host it wants | Clients without SNI need a dedicated IP, which is why dedicated-IP certificates are still sold |
| Aug 2008 | TLS 1.2 (RFC 5246) | Modern cipher suites and hashes | Many optional features and cipher choices to misconfigure |
| 11 Nov 2009 | SPDY ("A 2x Faster Web," Chromium) | Page latency: multiplexed streams over one TLS connection, compressed headers; lab tests "up to 64%" faster | A Google-run protocol in a browser and a few servers |
| Mar 2011 | RFC 6176 prohibits SSL 2.0 | Downgrades to a broken protocol | Clients that only spoke it |
| 27 Jun 2013 | "Experimenting with QUIC" (Chromium) | TCP's head-of-line blocking and handshake latency | A UDP transport to deploy past middleboxes |
| 18 Sep 2014 | Keyless SSL (Cloudflare) | Banks that couldn't hand a CDN their private keys | A round trip to the customer's key server on handshakes |
| 29 Sep 2014 | Universal SSL: free certificates for every Cloudflare customer, including about 2 million free-plan sites | The cost of HTTPS for small sites | SNI-only (no Windows XP Internet Explorer, no Android before Ice Cream Sandwich); Flexible mode by default for origins without TLS |
| May 2015 | HTTP/2 (RFC 7540) | SPDY's ideas as a standard | One TCP connection carries every stream, so one lost packet stalls all of them |
| Apr 2016 | Alt-Svc (RFC 7838) | Telling a client an alternative endpoint exists | Discovery only after a first connection |
| Aug 2018 | TLS 1.3 (RFC 8446); Early Data in HTTP (RFC 8470, Sep 2018) | Round trips, static RSA and DH, cleartext handshake messages | 0-RTT data that can be replayed |
| Mar 2021 | RFC 8996 deprecates TLS 1.0 and 1.1 | Attack surface of four versions | Old clients cut off |
| May 2021 | QUIC (RFC 9000) | A standard transport over UDP with TLS 1.3 built in | UDP blocked on some networks; a new stack everywhere |
| Jun 2022 | HTTP/3 (RFC 9114); HTTP/2 revised (RFC 9113) | HTTP over QUIC, without TCP head-of-line blocking | Fallback logic for when UDP fails |
| 15 Aug 2022 | CloudFront HTTP/3, at no additional charge | | Viewer side only |
| Nov 2023 | SVCB and HTTPS DNS records (RFC 9460) | Advertising HTTP/3 (and ECH keys) before the first connection | A DNS record type resolvers and clients must support |
| 13 Aug 2024 | NIST FIPS 203 (ML-KEM), from CRYSTALS-Kyber | A standard post-quantum key encapsulation | Larger handshakes |
| 13 Sep 2024 | Chrome announces the move from hybrid Kyber to ML-KEM in Chrome 131 (codepoint `0x6399` to `0x11EC`) | A draft algorithm replaced by the standard | Servers had to support the new codepoint |
| 2025 | Post-quantum share of Cloudflare's TLS 1.3 traffic grows from 29% to 52%, driven in September by iOS 26 | Harvest-now, decrypt-later | |
| Mar 2026 | Encrypted Client Hello (RFC 9849) | The hostname visible in every handshake | Needs DNS-published keys and encrypted DNS to be effective |
| Aug 2026 | Hybrid key agreement groups for TLS 1.3 (RFC 10024) | A standard for `X25519MLKEM768` and two others | A 1,216-byte client key share |

## Termination at the Edge

Termination means the edge holds a key that completes the handshake for the customer's hostname. The provider's design decisions:

- **Where the private key lives.** Usually on the provider's servers, issued and renewed by the provider (Cloudflare Universal SSL, Fastly-managed subscriptions, Google-managed certificates, Bunny's Let's Encrypt certificates) or uploaded by the customer. ACM "doesn't release the private key" of certificates it issues; it is stored for use by integrated AWS services. Keyless SSL is the exception: the handshake's signing step runs on a key server in the customer's environment, so "the keys themselves do not leave your infrastructure," at the price of a call to that server during handshakes.
- **One certificate, many names, or one per name.** Cloudflare's Universal SSL covers the apex and first-level subdomains (each proxied subdomain gets its own under a partial CNAME setup); Advanced Certificate Manager allows up to 50 hostnames and deeper subdomains on one certificate; CloudFront allows one certificate per distribution and requires the certificate's SAN field to cover every alternate domain name, with up to 100 alternate names per distribution by default; Google-managed certificates allow up to 100 SAN domains with DNS authorization and five with load balancer authorization. Packing names into shared certificates reduces issuance and lets browsers reuse connections (below); it also tells anyone who reads the certificate which sites share it, which is why Akamai offers its shared `akamaized.net` certificate as a separate option from customer-branded certificates.
- **SNI or a dedicated address.** SNI (RFC 6066) lets clients reach "servers that host multiple 'virtual' servers at a single underlying network address," so the edge picks the certificate from the name in the ClientHello. Clients that don't send SNI need an IP address per certificate. CloudFront still sells that: $600 a month per custom certificate on dedicated IPs, prorated by the hour, with a default quota of two such certificates per account and no quota under SNI. Cloudflare's 2014 launch made the tradeoff explicit: free certificates were SNI-only, paid plans kept legacy clients, and over 80% of requests already came from SNI-capable browsers. Akamai's Standard TLS works only with SNI-capable clients. How the edge chooses addresses is [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#ip-addresses-and-ipv4-scarcity).
- **Per-hostname settings.** The certificate is chosen by SNI, and so can be the minimum TLS version and cipher suites: Cloudflare offers per-hostname minimum versions through Advanced Certificate Manager (API only); Google selects certificates by hostname through certificate maps.

Issuance itself (domain validation, CA choice, CAA, [CT logging](/books/hosting-and-cloud/web-pki#certificate-transparency), [renewal windows](/books/hosting-and-cloud/acme-at-scale#renewal-scheduling) and [shortening lifetimes](/books/hosting-and-cloud/certificate-lifetimes-and-distrust#the-sc-081-schedule)) is the Certificates part's subject. The edge-specific fact is that certificate work scales with hostnames, not customers, and that a hostname can be validated before traffic moves (DNS challenges) or only after (HTTP challenges): Fastly's HTTP challenge "can potentially point all end-user traffic to Fastly before you've completed TLS setup," which is why its default is a DNS challenge.

## Custom Hostnames for SaaS

A SaaS platform's customers bring their own domains (`shop.example.com` pointed at the platform), and the platform wants the edge to terminate TLS for all of them under its own account. The edge sells this as a product: Cloudflare for SaaS (100 hostnames included on Free, Pro and Business, $0.10 per additional hostname, a 50,000 maximum outside Enterprise), Fastly TLS (charges by fully qualified and wildcard domains "activated at the end of the month," regardless of certificate status), CloudFront multi-tenant distributions (a default quota of 1,000,000 distribution tenants per account, 100 aliases per tenant, and 10 tenants in the free tier), Google certificate maps.

The lifecycle is the same everywhere, in neutral terms:

1. **Claim.** The platform registers the hostname on its zone. The edge records who claimed it and when.
2. **Prove control of the name.** The end customer points the name at the platform (a CNAME) or publishes a token; until then the hostname is pending. Ownership proof is per hostname, separate from the certificate's own domain validation, though one DNS record can serve both.
3. **Issue and deploy.** A managed certificate is issued and pushed to every location, or the platform uploads the end customer's certificate (Cloudflare lets SaaS providers "maintain control over your TLS private keys by uploading your customers' own certificates").
4. **Serve and renew.** The certificate is selected by SNI; renewal repeats issuance, and fails if the end customer moved the CNAME away.
5. **Move or delete.** When the name stops pointing at the platform, the hostname must stop being served and its certificate stop renewing, or the platform keeps a certificate for a domain it no longer controls.

The billing unit is hostname-months, and the abuse unit is the hostname: a SaaS platform's custom hostname that serves phishing is one row on a shared zone, so actions must be per hostname, not per zone.

## Edge to Origin

The visitor sees the edge's certificate. Whether the second connection is encrypted, and whether the edge checks who answered, are two separate settings. In this book's neutral terms:

| Origin protocol | Origin certificate check | Meaning | Cloudflare | CloudFront | Fastly | Akamai |
| --- | --- | --- | --- | --- | --- | --- |
| Plaintext HTTP | None | Encrypted to the edge only | Flexible | HTTP Only | `use_ssl` false | Not covered on the pages opened |
| Match the visitor | None | HTTPS to origin when the visitor used HTTPS, unverified | Full | Not offered: HTTPS to origin is always verified | Not covered on the pages opened | Not covered on the pages opened |
| Match the visitor | Verified | As above, verified against a public or private CA | Full (strict) | Match Viewer | Not covered on the pages opened | Not covered on the pages opened |
| Always HTTPS | Verified | HTTPS to origin even for HTTP visitors | Strict (SSL-only origin pull) | HTTPS Only | `use_ssl` with `ssl_check_cert` | `verification_mode` `PLATFORM_SETTINGS` (Akamai's certificate store) |
| Always HTTPS | Pinned or private CA | Trust only a named CA or certificate | Full (strict) with Origin CA | Mozilla-included CAs only | `ssl_ca_cert` | `CUSTOM_CERTIFICATE_AUTHORITIES` or `CUSTOM_CERTIFICATES` |

Cloudflare's own docs describe Flexible as "traffic from Cloudflare to the origin server is not" encrypted and strongly recommend Full or Full (strict), and its Automatic mode lets a recommender raise a zone's mode gradually (starting at 1% of traffic) without ever lowering it. CloudFront is strict by construction: if an HTTPS origin "returns an invalid certificate or a self-signed certificate, CloudFront drops the TCP connection," a name mismatch returns 502, and origin certificates must come from a CA on Mozilla's list. Fastly separates the name it validates (`ssl_cert_hostname`) from the name it sends in SNI (`ssl_sni_hostname`), and returns a synthetic 503 when an origin can't meet the configured TLS versions or ciphers.

> [!WARNING]
> Plaintext-to-origin modes show visitors a valid padlock while the request crosses the internet unencrypted from the edge to the origin. Cloudflare's Universal SSL launch made Flexible the default for sites with no origin certificate. A provider offering such a mode should label it on every surface that shows the padlock's state, and should never apply it to a zone silently.

**Origin certificates.** A private CA run by the provider for the edge-to-origin leg removes the need for a public certificate on the origin: Cloudflare's Origin CA certificates "only encrypt traffic between Cloudflare and your origin server," work with Full (strict), and come with no expiry notifications, so tracking them is the customer's job. They are certificates like any other in the model below, with the provider's private CA as the issuer.

**Authenticated origin pulls.** Verification above proves the origin to the edge. The reverse proof, that a request reaching the origin came from the edge, is mutual TLS: the edge presents a client certificate and the origin rejects connections without it. Cloudflare's Authenticated Origin Pulls offer three scopes on all plans, and the scope matters: the global certificate is "shared across all accounts," so it "only proves a request came from the Cloudflare network," not from the customer's zone; zone-level and per-hostname certificates are exclusive to the account. Akamai's mTLS Origin Keystore lets the origin verify that the client is a deployed edge server, of a specific traffic class, presenting a certificate that belongs to the same account. Fastly attaches `ssl_client_cert` and `ssl_client_key` per backend. Without one of these, an origin reachable from the internet can be attacked around the edge, which [DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation#my-default) and [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits) both assume isn't possible.

## Minimum Versions and Cipher Profiles

RFC 8996 (March 2021) deprecated TLS 1.0 and 1.1 because "removing support for older versions from implementations reduces the attack surface." Edges still let customers choose, because some of their visitors' clients are old:

- **CloudFront** names each combination a security policy: `SSLv3`, `TLSv1`, `TLSv1_2016`, `TLSv1.1_2016`, `TLSv1.2_2018`, `TLSv1.2_2019`, `TLSv1.2_2021`, `TLSv1.2_2025` and `TLSv1.3_2025`, each fixing the minimum version and the allowed ciphers. The newest drop CBC and RSA key exchange suites; `TLSv1.3_2025` allows TLS 1.3 only.
- **Google Cloud** load balancers use SSL policies with `COMPATIBLE`, `MODERN`, `RESTRICTED`, `FIPS_202205` and `CUSTOM` profiles plus a minimum version; a minimum of 1.3 requires `RESTRICTED`, and with no policy attached a load balancer behaves as `COMPATIBLE` with a minimum of TLS 1.0.
- **Cloudflare** sets a zone minimum on all plans and per-hostname minimums with Advanced Certificate Manager, and controls cipher suites through advanced or custom certificates.
- **Fastly** sets versions per TLS configuration for visitors and per backend (`min_tls_version`, `max_tls_version`, `ssl_ciphers`) for origins.

A provider's default here is the real policy for most of its customers, because most never change it. HSTS (telling browsers never to use HTTP for a host) sits on top and is the playbook's [HSTS and Preload](/docs/security/security-headers#hsts-and-preload); at the edge it is a response header the zone can add, and a preload commitment the customer should make deliberately, since it outlives any provider change.

## HTTP/2 at the Edge

SPDY's whitepaper set the goal (a 50% cut in page load time, "up to 64%" in lab tests) by multiplexing streams over one TLS connection and compressing headers; HTTP/2 standardized it in May 2015 (RFC 7540) and was revised in June 2022 (RFC 9113), which deprecated RFC 7540's priority signaling and the cleartext `h2c` upgrade. Over TLS it is negotiated by ALPN as `h2`, requires TLS 1.2 or higher, requires clients to send SNI, and on TLS 1.2 requires compression and renegotiation to be off.

The edge-specific behavior is **connection reuse**, often called coalescing. RFC 9113 lets a client send requests for a different hostname over an existing connection when the server is authoritative for it: for `https`, the certificate must be valid for the new host. A shared certificate covering many customers' hostnames therefore invites browsers to send those customers' requests down one connection, which is efficient when the same edge serves them and wrong when it doesn't; a server that doesn't want a request on that connection answers **421 Misdirected Request**. HTTP/3 has the same rule: a connection can serve other origins only if the client validates the certificate for each one.

Edges terminate HTTP/2 from visitors and rarely speak it to origins: CloudFront forwards to custom origins over HTTP/1.1; Google supports HTTP/2 over TLS (and H2C) to backends. HTTP/2's stream multiplexing is also an attack surface; the edge's defense against stream-cancel floods is [HTTP/2 Rapid Reset](/books/hosting-and-cloud/ddos-mitigation#http-2-rapid-reset).

## HTTP/3 and QUIC

HTTP/2 fixed head-of-line blocking at the HTTP layer and kept it at the transport: on TCP, "a lost or reordered packet causes all active transactions to experience a stall" (RFC 9114). QUIC (RFC 9000, May 2021) moves streams into the transport, runs over UDP ("QUIC packets are carried in UDP datagrams"), builds TLS 1.3 into its handshake, and uses connection IDs so that "connections [can] transfer to a new network path" when a phone changes networks. HTTP/3 (RFC 9114, June 2022) maps HTTP onto it with the ALPN token `h3`.

What an edge has to build:

- **Discovery.** A client's first connection is usually TCP. The edge advertises HTTP/3 with `Alt-Svc` (RFC 7838; CloudFront's example answer is `alt-svc: h3=":443"; ma=86400`), and the alternative stays fresh for 24 hours unless `ma` says otherwise. An [HTTPS DNS record](/books/hosting-and-cloud/dns-hosting-and-dnssec#authoritative-dns) (RFC 9460) can advertise `alpn=h3` before the first connection, so a client can open QUIC directly; its AliasMode also solves CNAME-at-the-apex for edge hostnames.
- **Fallback.** UDP is blocked on some networks, and RFC 9114 says clients "SHOULD attempt to use TCP-based versions of HTTP in this case." The edge must keep serving HTTP/2 and HTTP/1.1 on TCP for every hostname with HTTP/3 enabled.
- **Amplification limits.** Because UDP source addresses can be forged, a QUIC server may send at most "three times as many bytes as the number of bytes they have received" to an address it hasn't validated, and can send a Retry packet to make the client prove its address before the server commits state. That is the same reflection problem [DDoS Mitigation](/books/hosting-and-cloud/ddos-mitigation#volumetric-attacks-and-reflection) describes, solved in the protocol.
- **Load balancing on connection IDs.** A QUIC connection survives an address change, so the edge's load balancers route by connection ID, not by the client's address and port.
- **0-RTT.** TLS 1.3 lets a returning client send data in its first flight; RFC 8446 says "the security properties for 0-RTT data are weaker," the data "is not forward secret," and it can be replayed across connections. RFC 8470 adds an `Early-Data: 1` request header that intermediaries must add when they forward early data, and a **425 Too Early** status for an origin that won't risk a replay; an origin that hasn't configured early data per resource must reject it or implement those techniques. Fastly's default TLS configuration includes 0-RTT, so origins behind it should know which requests may arrive as early data.

The providers stop at the edge. Cloudflare offers HTTP/3 on all plans and says "HTTP/3 connection to the origin is not yet supported"; CloudFront added it on 15 Aug 2022 on s2n-quic, its open-source Rust QUIC implementation, at "no additional charge," and fetches from origins over HTTP/1.1; Google supports it "for connections between clients and the load balancer," and removed Google QUIC (gQUIC) in April 2023. Adoption is real but not dominant: Cloudflare Radar counted 50% of 2025 requests over HTTP/2, 29% over HTTP/1.x and 21% over HTTP/3, "largely unchanged" from 2024.

## Encrypted Client Hello

TLS 1.3 encrypts almost the whole handshake, except the ClientHello, whose SNI names the site. Encrypted Client Hello (RFC 9849, March 2026) sends a public `ClientHelloOuter` carrying a `public_name` (the client-facing server, typically the edge provider) and an encrypted `ClientHelloInner` carrying the real SNI and ALPN list. The edge publishes the keys in the HTTPS DNS record's `ech` parameter, with RFC 9848 covering how configurations are advertised. The RFC is plain about the limits: the provider is still visible, the target may leak through plaintext DNS or the server's IP address, and encrypted DNS is needed for ECH to be effective.

For an edge, ECH changes two things. It makes shared IP addresses a privacy feature, because ECH "reveals the service provider but not which server in the anonymity set terminates the connection," so a large provider gives each site more cover than a dedicated address would. And it leaves networks between the visitor and the edge that filter by hostname with DNS and IP addresses instead of the handshake, which puts edge providers' shared addresses in the path of blocking orders (the [Conduits, Caches & Blocking Orders](/books/hosting-and-cloud/conduits-caches-and-blocking-orders#blocking-orders-in-europe) chapter).

## Post-Quantum Key Agreement

An attacker who records TLS traffic today could decrypt it once a large quantum computer breaks elliptic-curve key exchange ("harvest now, decrypt later"). The defense is in key agreement, so it can ship before certificates change. NIST published FIPS 203 (ML-KEM, from CRYSTALS-Kyber) on 13 Aug 2024 as "the primary standard for general encryption." Deployments use a hybrid that combines it with X25519, so the connection is safe if either half holds: Chrome had enabled hybrid Kyber for all desktop clients and announced on 13 Sep 2024 that Chrome 131 would switch to ML-KEM, changing the codepoint from `0x6399` to `0x11EC`. RFC 10024 (August 2026) standardized three hybrid groups: `X25519MLKEM768` (`0x11EC`, a 1,216-byte client share and 1,120-byte server share), `SecP256r1MLKEM768` and `SecP384r1MLKEM1024`.

As of October 2026, `X25519MLKEM768` is the default in Chrome 131 and later, Firefox 132 and later on desktop, and Safari 26 and later. At the edge, Cloudflare has enabled hybrid key agreement on essentially all domains it serves and is rolling it out to origins; CloudFront supports `X25519MLKEM768` and `SecP256r1MLKEM768` with TLS 1.3 only; Google Cloud load balancers support `X25519MLKEM768` for frontend connections, with a setting whose `DEFAULT` value disallowed it until October 2026 and enables it afterward, and a `DEFERRED` value that holds it off until October 2027. Cloudflare Radar's 2025 review shows how fast a client release moves the number: the post-quantum share of its TLS 1.3 traffic went from 29% at the start of 2025 to 52% in early December, with iOS 26 lifting post-quantum requests from iOS devices from under 2% to 11% within four days of its September release.

The edge's open work is the second connection. A visitor's request protected end to end needs the edge-to-origin leg to use hybrid key agreement too, which depends on the origin's TLS library, and on certificates and signatures, which are a later and larger migration owned by the Certificates part.

## What's Free and What's Paid

As of October 2026:

| Item | Free | Paid |
| --- | --- | --- |
| **Edge certificate for the customer's own hostname** | Cloudflare Universal SSL (all plans); CloudFront free SSL certificates; Fastly five managed Certainly and five Let's Encrypt or BYOC certificates per account; Bunny Let's Encrypt per hostname | Fastly subscriptions past the allowance and GlobalSign; Akamai by contract |
| **Control over the certificate** | | Cloudflare Advanced Certificate Manager (paid add-on on every plan: CA choice, validity, up to 50 hostnames, cipher control); Cloudflare custom uploads (Business and Enterprise); Fastly BYOC (paid account) |
| **SaaS custom hostnames** | Cloudflare's first 100 | Cloudflare $0.10 per additional hostname; Fastly per activated domain at month end |
| **Legacy clients without SNI** | | CloudFront dedicated IP certificates, $600 a month each, prorated hourly |
| **HTTP/3** | Cloudflare all plans; CloudFront no additional charge; Fastly default configuration | |
| **Origin authentication** | Cloudflare Authenticated Origin Pulls and Origin CA (all plans) | Not priced on the other pages opened |
| **Mutual TLS domains** | Fastly: two per account | Fastly: a flat fee per additional domain |
| **Post-quantum key agreement** | No separate price on the pages opened: on by default at Cloudflare, supported at CloudFront, a load balancer setting at Google | |

The pattern is the one the edge follows everywhere: the thing that grows the network (more HTTPS, more sites) is free, and the thing that costs the provider per unit (a dedicated address, a commercial CA's fee, a hostname's issuance and storage across every location) is metered. How those meters roll into the edge bill is [The Edge Business](/books/hosting-and-cloud/edge-business#how-cdn-pricing-works).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Provider-managed keys at the edge** | The provider issues, holds and renews keys for the customer's hostnames | No certificate work for the customer; fastest feature rollout (HTTP/3, ECH, post-quantum) | The provider can decrypt everything; a provider-side issuance failure hits many hostnames at once | Provider's CA relationships; the customer controls only DNS | Free to modest | Most websites on CDNs |
| **Customer-uploaded certificates** | The customer issues from its CA and uploads key and chain | CA choice, EV/OV or pinned roots; key portable between providers | Renewal is the customer's; expired uploads take sites down | The customer owns the key | Paid tier at most providers | Regulated firms, multi-CDN setups needing one certificate |
| **Remote signing (Keyless)** | The handshake's private-key operation runs on the customer's key server | The key never leaves the customer | Key-server availability and latency join the handshake path | Provider-specific protocol | Enterprise | Banks and others who can't hand over keys |
| **Dedicated IP certificates** | One address per certificate for clients without SNI | Reaches clients that predate SNI | IPv4 cost; a per-certificate monthly charge | Provider's address space | CloudFront $600 a month each | Long-tail device and legacy client support |
| **TLS terminated at the origin** (L4 pass-through) | The edge forwards TCP or QUIC without decrypting | Keys and plaintext stay with the customer | No caching, WAF or L7 DDoS defense at the edge | The customer's stack | Bandwidth only | Non-HTTP protocols, end-to-end requirements |

## My Default

My default is provider-managed certificates at the edge, served by SNI, with the edge-to-origin leg always HTTPS and verified, either against a public CA or the provider's origin CA, plus authenticated origin pulls with a certificate exclusive to the account (not a provider-wide one) and an origin that refuses connections without it. Minimum TLS 1.2 at the edge, TLS 1.3 preferred, HTTP/2 and HTTP/3 on, hybrid post-quantum key agreement on wherever the provider offers it, and 0-RTT off unless the origin understands `Early-Data` and answers 425 for anything not safe to replay.

For a SaaS platform I'd use the provider's custom-hostname product and treat hostnames as first-class rows: claimed, proven, issued, served, and stopped when the end customer's DNS moves away. The tradeoff that would change this is key custody: if the customer must hold its own key (regulation, contract), I'd upload certificates or use remote signing and accept owning renewal and the extra handshake hop; if visitors include clients without SNI, I'd pay for a dedicated address only for the hostnames those clients use.

## How to Build It

The chapter adds `edge_hostnames` and `zone_tls_settings`, and two origin TLS columns on `cdn_origins`, plus TLS meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Zones and origins are [The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it)'s `cdn_zones` and `cdn_origins` ([How to Build It](/books/hosting-and-cloud/edge-business#how-to-build-it)); certificates are the core `certificates` side table (resources of kind `'certificate'`), and their orders and validations belong to the Certificates part. Hostnames are `resource_identifiers` of kind `'hostname'`, so "which zone served `shop.example.com` on 3 May" is the same lookup an abuse desk already runs.

I keep TLS settings in an effective-dated table rather than columns on `cdn_zones`: a mode change (Full to Flexible, a minimum version raised) is the most common cause of origin errors after a change and the first fact an incident review or a compliance assessor asks for, and the core model's rule is that what changes meaning over time gets a validity range.

```sql
CREATE TABLE zone_tls_settings (         -- one zone's TLS and protocol settings over time
  id                          UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id                 UUID NOT NULL REFERENCES cdn_zones (resource_id),
  visitor_http_policy         TEXT NOT NULL CHECK (visitor_http_policy IN ('allow_http',
                                'redirect_to_https', 'https_only')),
  origin_protocol             TEXT NOT NULL CHECK (origin_protocol IN ('http', 'match_visitor',
                                'https')),
  origin_cert_verification    TEXT NOT NULL CHECK (origin_cert_verification IN ('none',
                                'public_ca', 'provider_origin_ca', 'custom_ca', 'pinned')),
  origin_pull_auth            TEXT NOT NULL DEFAULT 'none' CHECK (origin_pull_auth IN ('none',
                                'provider_shared', 'zone_certificate', 'per_hostname')),
  origin_client_certificate_id UUID REFERENCES certificates (resource_id),  -- zone-level mTLS
  min_tls_version             TEXT NOT NULL CHECK (min_tls_version IN ('1.0', '1.1', '1.2',
                                '1.3')),
  cipher_profile              TEXT NOT NULL,   -- the provider's named profile or 'custom'
  custom_ciphers              TEXT[],
  http2_enabled               BOOLEAN NOT NULL DEFAULT TRUE,
  http3_enabled               BOOLEAN NOT NULL DEFAULT FALSE,
  zero_rtt_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
  pq_key_agreement            TEXT NOT NULL DEFAULT 'visitor' CHECK (pq_key_agreement IN
                                ('off', 'visitor', 'visitor_and_origin')),
  ech_enabled                 BOOLEAN NOT NULL DEFAULT FALSE,
  hsts                        JSONB,           -- max_age, include_subdomains, preload
  valid_during                TSTZRANGE NOT NULL,
  changed_by                  TEXT NOT NULL,   -- typed actor: a member, 'system:recommender'
  CHECK (origin_protocol <> 'http' OR origin_cert_verification = 'none'),
  CHECK (origin_protocol <> 'http' OR origin_pull_auth = 'none'),
  CHECK ((origin_pull_auth = 'zone_certificate') = (origin_client_certificate_id IS NOT NULL)),
  CHECK ((cipher_profile = 'custom') = (custom_ciphers IS NOT NULL)),
  EXCLUDE USING GIST (cdn_zone_id WITH =, valid_during WITH &&)
);

CREATE TABLE edge_hostnames (            -- every hostname a zone terminates TLS for
  id                          UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id                 UUID NOT NULL REFERENCES cdn_zones (resource_id),
  resource_identifier_id      UUID NOT NULL REFERENCES resource_identifiers (id), -- 'hostname'
  hostname                    TEXT NOT NULL,   -- A-label, lowercase; '*.example.com' allowed
  origin_id                   UUID REFERENCES cdn_origins (id),  -- per-hostname origin (SaaS)
  saas_customer_ref           TEXT,            -- the platform's own customer, when SaaS
  ownership_status            TEXT NOT NULL CHECK (ownership_status IN ('pending', 'active',
                                'moved', 'blocked', 'deleted')),
  ownership_method            TEXT NOT NULL CHECK (ownership_method IN ('zone_member',
                                'dns_cname', 'dns_txt', 'http_token')),
  ownership_verified_at       TIMESTAMPTZ,
  ownership_lost_at           TIMESTAMPTZ,     -- the name stopped pointing here
  certificate_source          TEXT NOT NULL CHECK (certificate_source IN ('managed',
                                'uploaded', 'customer_saas', 'shared')),
  certificate_id              UUID REFERENCES certificates (resource_id),
  certificate_status          TEXT NOT NULL CHECK (certificate_status IN ('pending_validation',
                                'pending_issuance', 'pending_deployment', 'active',
                                'renewal_failed', 'expired', 'revoked')),
  serving                     TEXT NOT NULL DEFAULT 'sni' CHECK (serving IN ('sni',
                                'dedicated_ip')),
  dedicated_ip_identifier_id  UUID REFERENCES resource_identifiers (id),  -- 'ipv4'
  min_tls_version             TEXT CHECK (min_tls_version IN ('1.0', '1.1', '1.2', '1.3')),
  origin_client_certificate_id UUID REFERENCES certificates (resource_id), -- per-hostname mTLS
  sku_id                      UUID REFERENCES skus (id),  -- a billed SaaS or dedicated-IP unit
  valid_during                TSTZRANGE NOT NULL,
  created_by                  TEXT NOT NULL,
  CHECK ((serving = 'dedicated_ip') = (dedicated_ip_identifier_id IS NOT NULL)),
  CHECK (certificate_status NOT IN ('active', 'renewal_failed') OR certificate_id IS NOT NULL),
  CHECK (ownership_status <> 'active' OR ownership_verified_at IS NOT NULL),
  CHECK ((ownership_status = 'moved') = (ownership_lost_at IS NOT NULL)),
  EXCLUDE USING GIST (hostname WITH =, valid_during WITH &&)  -- one zone serves a name at a time
);

ALTER TABLE cdn_origins                  -- the name validated and the name sent, kept apart
  ADD COLUMN tls_cert_hostname TEXT,     -- checked against the origin certificate's SAN
  ADD COLUMN tls_sni_hostname  TEXT;     -- sent in the ClientHello to the origin
```

The meters, all `usage_events.meter` values with `resource_id` the zone and the hostname in `dimensions`:

| Meter | Unit | Counted when | Example price it rates |
| --- | --- | --- | --- |
| `tls.custom_hostnames` | hostname-month | Each SaaS hostname active on the zone during the month (or at month end, where the price book says so) | Cloudflare for SaaS: 100 included, then $0.10; Fastly: domains activated at month end |
| `tls.dedicated_ip_certificates` | certificate-hour | Each hour a certificate is served on dedicated addresses | CloudFront: $600 a month, prorated by the hour |
| `tls.advanced_certificates` | certificate-month | Each provider-managed certificate with customer-controlled CA, validity or ciphers | Cloudflare Advanced Certificate Manager |

HTTP/3, HTTP/2 and post-quantum key agreement add no meters; the delivery meters `cdn.requests` and `cdn.egress_bytes` carry a `protocol` dimension already (The Edge Business's), and this chapter's settings only add `http_version` (`1.1`, `2`, `3`) and `tls_version` values to it so adoption can be reported per zone.

The monthly rating of SaaS hostnames, counting each hostname active at any point in the month (a provider that counts only month-end state changes the `WHERE` clause, and says so on its pricing page):

```sql
-- SaaS hostname-months for an account ($1) and month ($2), less the plan's allowance.
WITH active AS (
  SELECT DISTINCT h.cdn_zone_id, h.hostname
  FROM edge_hostnames h
  JOIN resources z ON z.id = h.cdn_zone_id
  WHERE z.account_id = $1
    AND h.saas_customer_ref IS NOT NULL
    AND h.ownership_status IN ('active', 'moved')
    AND h.valid_during && $2::tstzrange
),
allowance AS (                           -- allowances ride on the plan, by SKU code
  SELECT COALESCE(SUM((pv.included ->> 'tls.custom_hostname')::int), 0) AS included
  FROM subscriptions s
  JOIN plan_versions pv ON pv.id = s.plan_version_id
  WHERE s.account_id = $1
    AND s.status IN ('active', 'past_due')
    AND s.current_term && $2::tstzrange
)
SELECT COUNT(*) AS hostname_months,
       GREATEST(COUNT(*) - (SELECT included FROM allowance), 0) AS billable
FROM active;
```

And the edge-to-origin rule is a report that should shrink to nothing:

```sql
-- Zones serving HTTPS visitors whose origin leg is plaintext or unverified, right now.
SELECT s.cdn_zone_id, s.origin_protocol, s.origin_cert_verification, s.origin_pull_auth,
       lower(s.valid_during) AS since, s.changed_by,
       COUNT(h.id) AS hostnames
FROM zone_tls_settings s
JOIN edge_hostnames h ON h.cdn_zone_id = s.cdn_zone_id
                     AND h.valid_during @> NOW()
                     AND h.certificate_status = 'active'
WHERE s.valid_during @> NOW()
  AND (s.origin_protocol = 'http' OR s.origin_cert_verification = 'none')
GROUP BY s.id;
```

Notes on the sketch:

- **Neutral columns, mapped per provider.** `origin_protocol` and `origin_cert_verification` express every mode in the Edge to Origin table; a provider's own mode names are a display mapping, not the schema, so a mode added later is a new combination, not a migration.
- **Hostnames are held, like addresses.** The exclusion constraint makes it impossible for two zones to terminate the same hostname at the same instant, the same rule `resource_identifiers` applies to IPs; a SaaS hostname claimed by a second platform waits until the first releases it or is marked `'moved'`.
- **Ownership and certificate are separate states.** A hostname can be proven and still lack a certificate, or have a certificate whose renewal failed because the CNAME moved; `ownership_lost_at` is what stops renewals for a name the platform no longer controls.
- **Shared origin-pull certificates are a different setting.** `'provider_shared'` and `'zone_certificate'` are distinct values because they prove different things, and a report can list every zone relying on the shared one.
- **Dedicated IPs are identifiers with a SKU.** A dedicated-IP certificate holds an `ipv4` identifier for its period, rated hourly through `tls.dedicated_ip_certificates`.
- **The cert hostname and the SNI hostname differ.** Fastly's split is general: an origin behind a shared load balancer needs one name in SNI and may present a certificate for another.
- **Events:** `tls.settings_changed`, `hostname.claimed`, `hostname.verified`, `hostname.moved`, `hostname.certificate_active`, `hostname.certificate_renewal_failed` and `hostname.released` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to provisioning, billing, the customer's notifications and the abuse desk.

## Auditing

- **Every TLS setting change, with its author.** Mode, minimum version, ciphers, HTTP/3, 0-RTT and origin authentication over time, including changes made by a recommender, because an origin outage after a change starts with "who changed the mode."
- **Which certificate served which hostname, when.** The hostname's identifier history, the certificate it presented and its source, for a mis-issuance report, a CT inquiry or an abuse complaint about a SaaS hostname.
- **Ownership proof for every SaaS hostname.** How and when control was proven, when it was lost, and that renewals stopped afterward.
- **Plaintext and unverified origin legs.** The report above, kept over time, so the provider can show how many zones still send visitor data to origins unencrypted or unverified.
- **Dedicated-IP and hostname billing from events.** Hostname-months and certificate-hours reproducible from `edge_hostnames` and `usage_events` for a disputed invoice.

## What This Means for the System You Build

- **Terminate at the edge, verify to the origin,** and make the origin refuse anything that didn't come through the edge with an account-exclusive certificate.
- **Name settings neutrally** (protocol, verification, authentication) and map provider modes onto them, so every combination is visible and auditable.
- **Treat hostnames as held identifiers** with ownership proof, certificate state and a release when DNS moves away.
- **Retire old protocol versions in the default,** because most customers never change it, and keep per-hostname overrides for the few who must.
- **Ship HTTP/3 with TCP fallback,** advertise it in `Alt-Svc` and HTTPS records, and keep 0-RTT off until the origin understands replay.
- **Turn on hybrid post-quantum key agreement** for visitors now, and plan the origin leg as the next step.
- **Meter only what costs per unit:** hostnames past an allowance, dedicated addresses, managed certificate control; keep basic HTTPS free.

## References

**Specifications**

- [RFC 6101: The Secure Sockets Layer (SSL) Protocol Version 3.0](https://www.rfc-editor.org/rfc/rfc6101.html), August 2011 historic record of SSL 3.0 as of 18 Nov 1996, and the Hickman SSL 2.0 reference of February 1995
- [RFC 6176: Prohibiting SSL Version 2.0](https://www.rfc-editor.org/rfc/rfc6176.html), March 2011
- [RFC 7568: Deprecating SSL Version 3.0](https://www.rfc-editor.org/rfc/rfc7568.html), June 2015, POODLE, CBC and RC4
- [RFC 2246: TLS 1.0](https://www.rfc-editor.org/rfc/rfc2246.html), January 1999, based on SSL 3.0
- [RFC 5246: TLS 1.2](https://www.rfc-editor.org/rfc/rfc5246.html), August 2008
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html), August 2018, changes from 1.2 and 0-RTT's weaker properties
- [RFC 8470: Using Early Data in HTTP](https://www.rfc-editor.org/rfc/rfc8470.html), September 2018, `Early-Data` and 425 Too Early
- [RFC 8996: Deprecating TLS 1.0 and TLS 1.1](https://www.rfc-editor.org/rfc/rfc8996.html), March 2021, BCP 195
- [RFC 3546: TLS Extensions](https://www.rfc-editor.org/rfc/rfc3546.html), June 2003, Server Name Indication
- [RFC 6066: TLS Extension Definitions](https://www.rfc-editor.org/rfc/rfc6066.html), January 2011, SNI for virtual servers at one address
- [RFC 7540: HTTP/2](https://www.rfc-editor.org/rfc/rfc7540.html), May 2015
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html), June 2022, deprecated priorities and `h2c` upgrade, connection reuse, 421 and TLS requirements
- [RFC 7838: HTTP Alternative Services](https://www.rfc-editor.org/rfc/rfc7838.html), April 2016, `Alt-Svc` and the 24-hour default
- [RFC 9000: QUIC](https://www.rfc-editor.org/rfc/rfc9000.html), May 2021, UDP, connection migration, the three-times amplification limit and Retry
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html), June 2022, head-of-line blocking, discovery, TCP fallback and connection reuse
- [RFC 9460: SVCB and HTTPS Resource Records](https://www.rfc-editor.org/rfc/rfc9460.html), November 2023, `alpn`, hints, AliasMode and the reserved `ech` key
- [RFC 9849: TLS Encrypted Client Hello](https://www.rfc-editor.org/rfc/rfc9849.html), March 2026, inner and outer ClientHello, `public_name` and limits
- [IETF Datatracker: draft-ietf-tls-esni](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/), its publication as RFC 9849
- [RFC 10024: Hybrid Key Agreement Mechanisms for TLS 1.3](https://www.rfc-editor.org/rfc/rfc10024.html), August 2026, the three groups, codepoints and share sizes
- [IETF Datatracker: draft-ietf-tls-ecdhe-mlkem](https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/), its publication as RFC 10024
- [NIST: Post-quantum encryption standards released](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards), FIPS 203, 204 and 205 on 13 Aug 2024

**History**

- [Chromium Blog: A 2x Faster Web](https://blog.chromium.org/2009/11/2x-faster-web.html), 11 Nov 2009
- [Chromium: SPDY whitepaper](https://www.chromium.org/spdy/spdy-whitepaper/), goals, multiplexing, header compression and the lab results
- [Chromium Blog: Experimenting with QUIC](https://blog.chromium.org/2013/06/experimenting-with-quic.html), 27 Jun 2013
- [Cloudflare: Announcing Keyless SSL](https://blog.cloudflare.com/announcing-keyless-ssl-all-the-benefits-of-cloudflare-without-having-to-turn-over-your-private-ssl-keys/), 18 Sep 2014, remote signing and the banks it was built for
- [Cloudflare: Introducing Universal SSL](https://blog.cloudflare.com/introducing-universal-ssl/), 29 Sep 2014, free certificates, the SNI caveat and the Flexible default
- [Google Security Blog: A new path for Kyber on the web](https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html?m=1), 13 Sep 2024, the Chrome 131 switch and codepoints

**Providers: certificates and hostnames**

- [Cloudflare: Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/), coverage, plans and certificate types
- [Cloudflare: Advanced Certificate Manager](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/), the paid add-on, 50 hostnames, CA, validity and cipher control
- [Cloudflare: Custom certificates](https://developers.cloudflare.com/ssl/edge-certificates/custom-certificates/), Business and Enterprise availability
- [Cloudflare for SaaS: Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/), included hostnames, the $0.10 price and the 50,000 maximum
- [Cloudflare for SaaS: Certificate management](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/), managed and uploaded customer certificates
- [Akamai: Edge hostname key concepts](https://techdocs.akamai.com/edge-hostnames/docs/edge-hn-terminology), Standard TLS, Enhanced TLS, `edgekey.net`, `edgesuite.net` and the shared certificate
- [Fastly: TLS with certificates Fastly manages](https://www.fastly.com/documentation/guides/getting-started/domains/securing-domains/setting-up-tls-with-certificates-fastly-manages/), CAs, challenges, the default TLS configuration and account allowances
- [Fastly: TLS service options](https://docs.fastly.com/products/tls-service-options), shared certificates, per-domain billing, mTLS and dedicated IPs
- [AWS: Requirements for using SSL/TLS certificates with CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html), `us-east-1`, key types and sizes, ACM key custody and SAN coverage
- [AWS: CloudFront quotas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html), dedicated-IP certificate quota, alternate names and distribution tenants
- [Google Cloud: Certificate Manager overview](https://docs.cloud.google.com/certificate-manager/docs/overview), managed certificates, authorization types, SAN limits and certificate maps
- [Bunny: SSL for custom domains](https://bunny.net/docs/cdn/ssl-setup), free Let's Encrypt certificates, wildcards on Bunny DNS and uploads

**Providers: origin, versions and protocols**

- [Cloudflare: Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/), Off, Flexible, Full, Full (strict), Strict and Automatic
- [Cloudflare: Origin CA certificates](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/), scope, Full (strict) and missing expiry notices
- [Cloudflare: Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/), global, zone and per-hostname scopes
- [Cloudflare: Minimum TLS version](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/), zone and per-hostname settings
- [Cloudflare: HTTP/3](https://developers.cloudflare.com/speed/optimization/protocol/http3/), plan availability and no HTTP/3 to origins
- [Akamai: Origin (Terraform)](https://techdocs.akamai.com/terraform/docs/origin), `verification_mode` and `origin_certs_to_honor`
- [Akamai: mTLS Origin Keystore](https://techdocs.akamai.com/mtls-origin-keystore/docs/welcome), client certificates the edge presents to origins
- [Fastly: Backend API](https://www.fastly.com/documentation/reference/api/services/backend/), TLS fields for origins and the synthetic 503
- [AWS: Request and response behavior for custom origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html), origin protocol policy, dropped connections on invalid certificates and HTTP/1.1 to origins
- [AWS: Supported protocols and ciphers between viewers and CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html), security policies and quantum-safe key exchanges
- [AWS News Blog: New HTTP/3 support for Amazon CloudFront](https://aws.amazon.com/blogs/aws/new-http-3-support-for-amazon-cloudfront/), 15 Aug 2022, s2n-quic, no additional charge and fallback
- [Google Cloud: SSL policies overview](https://docs.cloud.google.com/load-balancing/docs/ssl-policies-concepts), profiles, minimum versions, the default and the post-quantum setting
- [Google Cloud: External Application Load Balancer overview](https://docs.cloud.google.com/load-balancing/docs/https), HTTP/3 to clients, the end of gQUIC and HTTP/2 to backends

**Post-quantum and adoption**

- [Cloudflare: Post-quantum support](https://developers.cloudflare.com/ssl/post-quantum-cryptography/pqc-support/), browser defaults for `X25519MLKEM768`
- [Cloudflare Research: Post-quantum key agreement](https://pq.cloudflareresearch.com), hybrid key agreement on essentially all domains and the origin rollout
- [Cloudflare: Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/), HTTP version shares and the post-quantum share's growth with iOS 26

**Pricing**

- [AWS: CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), free SSL certificates, the $600 dedicated-IP certificate and the free tier
