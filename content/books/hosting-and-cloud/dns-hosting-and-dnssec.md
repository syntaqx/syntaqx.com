+++
title = "DNS Hosting & DNSSEC"
description = "Authoritative DNS as a product: zones and records, metering and published prices, routing policies with health checks, and DNSSEC through the registrar."
category = "Hosting & Cloud Industry"
order = 2169
part = "Domains and DNS"
tags = ["domains", "dns", "dnssec", "metering", "routing", "epp"]
+++

Every hosted site, mailbox and API sits behind an authoritative DNS answer, and that answer is usually served by someone other than the customer: the registrar's free DNS, the host's name servers, a cloud's managed DNS, or a CDN that wants to answer for the zone so it can proxy the traffic. As a product, authoritative DNS is cheap to the point of free at the bottom and billed by the zone and the million queries at the top, with routing policies and health checks sold as premium query types. As infrastructure, it is the dependency nobody notices until it fails, and DNSSEC adds a failure mode that spans two companies: the DNS host signs the zone, but the registrar publishes the key's fingerprint at the registry, and if the two drift apart the domain disappears for every validating resolver.

This chapter covers how authoritative DNS got to its current shape, how a zone works for a host, how the providers meter and price it, the routing policies sold on top, and DNSSEC from signing through DS publication over EPP to the provider change that breaks it. Resolvers, caching and anycast networks in general belong to Networks, Peering & IP Addresses; attacks on DNS to DDoS Mitigation; certificate validation over DNS to The Web PKI & Certificate Transparency.

## How the Providers Do It

Published models as of October 2026:

| Provider | Price model | Routing | DNSSEC | Notes |
| --- | --- | --- | --- | --- |
| **Amazon Route 53** | $0.50 per hosted zone a month for the first 25, then $0.10; $0.40 per million standard queries for the first billion a month, then $0.20 | Weighted, latency, geolocation, geoproximity, IP-based, failover and multivalue, each priced as its own query type | Signing at no charge; the key-signing key lives in a customer-managed KMS key, billed by KMS | Alias queries to AWS resources are free |
| **Cloudflare** | DNS free on Free, Pro and Business plans with no query cap; on Enterprise, monthly query volume is a pricing input | Not part of DNS pricing | One click; prefers algorithm 13; adds the DS automatically for its own registrar | CNAME flattening at the apex |
| **Google Cloud DNS** | Managed zones billed hourly: about $0.20 a month each for the first 25, $0.10 up to 10,000, $0.03 beyond; $0.40 per million queries, then $0.20 above a billion | Routing policy queries at $0.70 per million, then $0.35 | Not priced separately on the pricing page | Health checks for routing policies billed hourly |
| **Azure DNS** | $0.50 per public zone a month for the first 25, then $0.10; $0.40 per million queries, then $0.20 above a billion | Not on the DNS price list | Not on the price list | Record sets over 10,000 in a zone at $0.0015 each a month, from July 2026 |
| **DigitalOcean** | "DNS management is free" | None | "DigitalOcean's name servers do not support domains with DNSSEC enabled" | Minimum TTL of 30 seconds |
| **IBM NS1 Connect** | Plans by included queries, records and monitors: Essentials from $99 a month (30 to 80 million queries, 1,000 records), Standard from $349 (50 million to 1 billion); Premium by quote | Traffic filter chains, monitors | Not on the plan page | Lists a "100% Uptime SLA" among its features |
| **Akamai Edge DNS** | Flat, by number of configured zones, with no query component, per Akamai's own comparison | Through its separate Global Traffic Management product | Not covered in that post | Akamai cites a 100% uptime SLA |

Three models sit in that table. **Metered** (Route 53, Google, Azure): a small per-zone fee and a per-million query price, with premium query types for routing. **Bundled** (Cloudflare, DigitalOcean, most registrars and hosts): DNS free as a way to win the zone for another product. **Flat or tiered enterprise** (Akamai, NS1): priced by zones or included volume, sold on availability. A host offering DNS to its customers is almost always in the second group, and pays a provider in the first or third for anything it doesn't run itself.

## How We Got Here

**The protocol (1983 to 1987).** RFC 882 and 883 described the DNS in 1983; Paul Mockapetris wrote the first working name server, Jeeves, in 1983 and 1984; graduate students at UC Berkeley wrote BIND under a DARPA grant soon after. RFC 1034 and RFC 1035 (November 1987) are still the definition: zones, delegation by NS records, a single SOA record and the name servers at the top of every zone, and the rule that every zone be available on at least two servers. It solved the hosts-file problem; it had no authentication of answers at all.

**Operating it (1996 to 2000).** Incremental zone transfer (RFC 1995) and NOTIFY (RFC 1996), both August 1996, let primaries push changes to secondaries instead of waiting for refresh timers; dynamic update (RFC 2136, April 1997) made zones editable by API rather than by file; RFC 2182 (July 1997) set out how to choose and run secondaries; RFC 2308 (March 1998) made the SOA MINIMUM field the negative-caching TTL. BIND 8, the first production-ready version, shipped in May 1997 and BIND 9, "a major rewrite", in September 2000. Together they made DNS operable by organizations that weren't universities.

**Anycast authoritative service (2002 to 2006).** RFC 3258 (April 2002) described serving authoritative name servers from shared unicast (anycast) addresses, and RFC 4786 (December 2006) made the operation of anycast services a best current practice. Anycast is what lets a DNS provider absorb attacks and answer from the nearest site, and it made authoritative DNS a network business rather than a software one.

**Signing the answers (2005 to 2010).** DNSSEC as deployed today is RFC 4033, 4034 and 4035 (March 2005); NSEC3 (RFC 5155, March 2008) stopped signed zones from being walkable by their denial records. The root zone was first signed on 15 July 2010 with KSK-2010. The EPP extension that carries DS records from registrar to registry is RFC 5910 (May 2010), and AXFR was finally specified on its own in RFC 5936 (June 2010). DNSSEC solved forged answers; its cost is operational: keys, rollovers, and a parent record that has to match.

**DNS as a cloud product (December 2010).** Amazon launched Route 53 in beta in December 2010 and declared it generally available in May 2011, with a "100% availability" service level, alias records that could map the zone apex to a load balancer at no query charge, and weighted round robin. That launch set the metered model in the table above: per zone, per query, and routing as a premium.

**Automating the parent (2014 to 2026).** CDS and CDNSKEY records (RFC 7344, September 2014) let a child zone tell its parent which DS records to publish; RFC 8078 (March 2017) added ways to bootstrap the first DS and a signal to delete them. The root's first KSK rollover, from KSK-2010 to KSK-2017, happened on 11 October 2018. Algorithm guidance (RFC 8624, June 2019) was replaced in December 2025 by RFC 9904, which moved the recommendations into IANA's registries, alongside RFC 9905 deprecating the SHA-1 algorithms. Multi-signer models (RFC 8901, September 2020) let two providers serve one signed zone. Authenticated bootstrapping from the DNS operator's own signed zone (RFC 9615) followed in July 2024, generalized DNS notifications (RFC 9859) in September 2025, and the operational best practice for DS automation (RFC 10026, BCP 246) in July 2026. The root rolled to KSK-2024 on 11 October 2026.

**DNSSEC reaches certificates (2025 to 2026).** CA/Browser Forum ballot SC-085v2 (vote ended 18 June 2025) requires CAs to validate DNSSEC, when present, for CAA and domain validation lookups from the primary network perspective, effective 15 March 2026. Ballot SC100 (vote ended 6 August 2026) consolidated those requirements into section 4.2.2.2 of the Baseline Requirements without changing them. A broken signed zone now blocks certificate issuance as well as resolution.

## Authoritative DNS

**The zone.** A zone is a contiguous part of the namespace served from one set of name servers. Its apex carries a single SOA record (primary server, contact, serial, refresh, retry, expire and minimum) and NS records for every authoritative server. The parent zone (the TLD registry, for a registered domain) holds matching NS records and, where a name server is inside the zone it serves, glue addresses; at the registry those are EPP host objects ([The Objects](/books/hosting-and-cloud/epp-and-domain-data#the-objects)). A host that serves a customer's zone but isn't the registrar depends on the customer changing the NS at another company, and its "zone added" and "zone delegated" are two different states.

**Records and TTLs.** The working set is A, AAAA, CNAME, MX, TXT, CAA, SRV and the newer HTTPS and SVCB types, each with a TTL that sets how long resolvers may cache it. A short TTL makes changes and failover fast and costs more queries (which a metered provider bills); a long one is cheap and slow to change. Negative answers are cached for the lesser of the SOA's TTL and its MINIMUM field (RFC 2308), which is why a record added right after someone looked it up can stay invisible for that long. Providers bound TTLs: DigitalOcean requires at least 30 seconds; Cloudflare's automatic TTL for proxied records is five minutes; Route 53 caps TTLs at one week in a DNSSEC-signed zone.

**The apex CNAME problem.** RFC 1034 says that if a CNAME is present at a node, "no other data should be present", and the apex must hold the SOA and NS records, so a customer can't point `example.com` itself at a load balancer's or CDN's hostname with a CNAME. Every provider sells a workaround that answers with addresses resolved from a target name: Route 53's alias records (which, unlike a CNAME, can sit at the apex, and are free when they point at AWS resources), Cloudflare's CNAME flattening (which follows the chain and returns the final address, and can be turned on for every CNAME, at the cost of breaking third-party verifications that expect to see the CNAME), and similar ALIAS or ANAME records elsewhere. None of these is in the DNS standards; each is the provider resolving on the customer's behalf, so the answer's freshness depends on that provider's resolution.

**Primaries, secondaries and transfers.** Running zones on two providers is the classic availability design: one primary, the other a secondary that pulls the zone by AXFR (full) or IXFR (incremental) when the primary sends a NOTIFY, with TSIG keys authenticating transfers. Proprietary features break this: alias records, flattening, routing policies and health-checked answers don't transfer, because they aren't zone data. Route 53, for one, doesn't support multi-vendor configurations with DNSSEC signing at all. Multi-provider DNS for a modern zone is usually two providers fed by the same change pipeline through their APIs, not zone transfer.

**APIs and change batches.** Every provider exposes zones and record sets over an API, and customers increasingly manage them as code ([Infrastructure as Code](/docs/delivery/infrastructure-as-code#declarative-beats-imperative)). The provider's job is atomic change batches (a record set replaced, not deleted then added), a serial increment per change, and propagation to every anycast site, with the change visible to the customer as pending until it is everywhere.

## Metering and Pricing

What the metered providers bill, and how they differ, from their pricing pages as of October 2026:

| Item | Route 53 | Google Cloud DNS | Azure DNS |
| --- | --- | --- | --- |
| **Zone, first tier** | $0.50 a month, first 25 | About $0.20 a month (billed hourly), first 25 | $0.50 a month, first 25 |
| **Zone, next tier** | $0.10 | About $0.10 to 10,000 zones, $0.03 beyond | $0.10 |
| **Large zones** | $0.0015 a month per record over 10,000 | Contact Google | $0.0015 a month per record set over 10,000 |
| **Standard queries** | $0.40 per million, $0.20 above a billion | $0.40 per million, $0.20 above a billion | $0.40 per million, $0.20 above a billion |
| **Routing queries** | Latency $0.60, geo and geoproximity $0.70, IP-based $0.80 per million, each halved above a billion | $0.70 per million, $0.35 above a billion | Not on the DNS price list |
| **Free queries** | Alias queries to AWS resources; private zone queries | | |
| **Health checks** | $0.50 a month for an AWS endpoint, $0.75 for others, plus $1.00 or $2.00 per optional feature | External fast checks about $2 a month, premium about $4 | Not on the DNS price list |
| **DNSSEC** | No charge for signing; KMS key charges apply | | |

Things a provider's meter has to get right:

- **Queries are counted by type of answer, not just by count.** A latency or geo answer costs more than a standard one at Route 53 and Google, so the meter records the policy that produced each answer. A CNAME to another record in Route 53 is charged as two queries, one for the CNAME and one for its target; an alias to an AWS resource is free.
- **Zones bill by time held.** Google prorates zones by the hour; Route 53 and Azure bill a monthly zone fee. A zone created for a migration test and deleted the same day is still a charge, which is a support ticket waiting to happen if the customer can't see it.
- **Tiers are per account per month.** The billion-query break and the 25-zone break apply to the account's monthly total, so rating has to sum before pricing, not price per event (the foundation's [rating rules](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time); Metering & Rating owns the pipeline).
- **Attack traffic is still traffic.** A query flood against a customer's zone, or random-subdomain queries that all return NXDOMAIN, show up in a per-query meter. Whether those are billed, capped or credited is a pricing policy the provider should write down before the first bill shock; Cloudflare's "never limits or caps DNS queries" and Akamai's zone-only pricing are the answers that remove the question. DDoS Mitigation covers the attacks; Cost Data, FinOps & Surprise Bills covers the forgiveness side.

## Routing Policies

Route 53's documented list is the industry's vocabulary:

| Policy | Answers with | Use |
| --- | --- | --- |
| **Simple** | The record set as written | One resource |
| **Weighted** | Records chosen in proportion to assigned weights | Canary releases, gradual migration, unequal capacity |
| **Latency** | The record for the region with the lowest measured latency to the resolver | Multi-region applications |
| **Geolocation** | The record for the user's location | Content or legal localization |
| **Geoproximity** | The record for the nearest resource, with an adjustable bias to shift traffic | Moving load between regions |
| **IP-based** | The record mapped to the client's IP range | Routing by the customer's own knowledge of networks |
| **Failover** | The primary while its health check passes, else the secondary | Active-passive disaster recovery |
| **Multivalue answer** | Up to eight healthy records chosen at random | Simple client-side load spreading |

**Health checks decide failover.** Route 53's checkers run from locations around the world at a 10- or 30-second interval, and an endpoint counts as healthy if more than 18% of checkers say so, a threshold AWS chose so that checkers in multiple regions agree and one isolated location can't fail an endpoint. An HTTP or HTTPS check must connect within four seconds and get a 2xx or 3xx within two more; HTTPS checks don't validate certificates; a string-matching check looks for the string in the first 5,120 bytes of the body. Checks can also be calculated from up to 255 child checks or from a CloudWatch alarm's data stream. Google Cloud DNS's routing policies use health checks for external endpoints and internal load balancers, billed by the hour.

**DNS failover is bounded by caching.** A resolver that cached the primary's address keeps using it until the TTL expires, and some clients hold addresses longer than the TTL. Failover by DNS is therefore minutes, not seconds, and health-checked records need short TTLs that a metered provider bills for. Location-based answers depend on where the resolver is, or on the client subnet the resolver passes along (Route 53 documents its use of EDNS0 for this), so a user on a distant public resolver can be routed as if they were somewhere else.

## DNSSEC Operations

**The chain.** A signed zone publishes DNSKEY records and signs every record set with RRSIG records; denial of existence is proven with NSEC, NSEC3 or the compact denial method of RFC 9824 (September 2025). The parent publishes a DS record, a hash of the child's key-signing key, and signs it with its own keys, up to the root. A validating resolver accepts an answer only if that chain holds. If the parent has a DS but the child's keys don't match it, the answer is bogus and validating resolvers return SERVFAIL; if the parent has no DS, the zone is simply insecure.

**Keys.** The classic split is a key-signing key (KSK), which signs only the DNSKEY set and whose hash is the DS at the parent, and a zone-signing key (ZSK), which signs everything else and can be rolled without touching the parent; a combined signing key (CSK) does both. Providers that sign for customers split the work: Route 53 manages the ZSK and makes each KSK from a customer-managed asymmetric KMS key with the ECC_NIST_P256 key spec in US East (N. Virginia), so the customer owns and rotates the KSK; Cloudflare signs with its own keys and prefers algorithm 13.

**Algorithms.** Since RFC 9904 (December 2025), the recommendations live in IANA's DNSSEC registries rather than in an RFC. As of that document, ECDSA P-256 with SHA-256 (algorithm 13) and RSA/SHA-256 (algorithm 8) are MUST implement and RECOMMENDED to use for signing, Ed25519 (15) is RECOMMENDED, and SHA-256 is the recommended DS digest, with SHA-1 a MUST NOT for new DS records. RFC 9905 says RSASHA1 (5) and RSASHA1-NSEC3-SHA1 (7) "MUST NOT be used when creating DNSKEY and RRSIG records", while validators keep supporting them for zones that still use them. A provider signing customer zones should be on 13 (or 15) by default and have a path to move legacy zones off 5, 7 and 8.

**Publishing the DS through the registrar.** The DS reaches the registry through the registrar, over EPP's secDNS-1.1 extension (RFC 5910). A registry uses one of two interfaces: the DS data interface, where the registrar sends `secDNS:dsData` with key tag, algorithm, digest type and digest (optionally with the key data for checking), or the key data interface, where it sends `secDNS:keyData` (flags, protocol, algorithm, public key) and the registry computes the DS. An update can remove specific entries or all of them and add new ones, with removals processed first, and may be flagged `urgent`. The registrar's systems need to know which interface each registry uses ([Extensions](/books/hosting-and-cloud/epp-and-domain-data#extensions)).

**How registrars expose it**, as of October 2026:

| Registrar | Own DNS | Customer's external DNS |
| --- | --- | --- |
| **Cloudflare Registrar** | One-click DNSSEC; the DS is submitted through CDS/CDNSKEY scanning, which can take one to two days | The customer adds the DS from their provider |
| **GoDaddy** | GoDaddy signs the zone; five free DNSSEC credits per account, more with Premium DNS | Manual DS entry; some domains, such as certain ccTLDs, don't support DNSSEC |
| **Namecheap** | Not covered in the DS article | DS fields (key tag, algorithm, digest type, digest) behind a toggle; changes take up to 60 minutes |
| **Porkbun** | A "Porkbun DNSSEC" toggle creates the record | Manual entry under "Registry DNSSEC" |
| **Squarespace** | A DNS Security Extensions toggle on its default name servers, whose DNS runs on IBM's NS1 Connect platform | Switching to custom name servers prompts the customer to disable DNSSEC; third-party protection by adding DS or DNSKEY records |
| **Tucows (OpenSRS)** | Not covered | "OpenSRS does not generate or sign your keys"; it forwards the DS from the customer's DNS provider to the registry |
| **IONOS** | Not covered in that article | Email the DS and key data to IONOS to have it set up; Domain Guard must be turned off first |

**Automating the parent.** CDS and CDNSKEY let the child publish, in its own signed zone, the DS it wants the parent to hold; the parent (registry or registrar) scans for them and updates the DS when they change, under RFC 7344's "old signs new" rule. RFC 8078 adds policies for accepting the first DS (after a period of observation, with a challenge, or from inception for a new name) and a delete signal: `CDS 0 0 0 0` or `CDNSKEY 0 3 0 0` tells the parent to remove the DS. RFC 9615 bootstraps the first DS from signals in the DNS operator's own signed zone. Cloudflare's registrar uses scanning for its own customers. Parent-side automation runs at several ccTLDs (.ch, .cr, .cz, .li, .se, .uz and .za, per a February 2026 APNIC post), and gTLD registries need ICANN approval first. RFC 10026 (July 2026) is the operational best practice: consistency checks across name servers, short DS TTLs during changes, notices to the technical contact when DNSSEC is turned on or off, and locks that don't block authenticated DS maintenance.

**Rollovers.** A ZSK rollover is internal to the zone: pre-publish the new key, wait out the DNSKEY TTL, sign with it, wait out the signatures' TTL, remove the old key (RFC 7583 sets out the timing). A KSK rollover adds the parent: publish the new KSK, get its DS to the parent (by EPP or CDS), wait for the old DS's TTL, then retire the old key. A KSK rollover without the parent step is how signed zones go dark on schedule.

**The failure that crosses companies.** The most common DNSSEC outage isn't a cryptographic failure; it's a stale DS. A customer moves the zone to a new DNS provider, or transfers the domain to a new registrar and resets its name servers, while the registry still holds a DS for the old provider's key. Every validating resolver now sees a DS that matches no key and returns SERVFAIL. Cloudflare's documented safe path is the general one: remove the DS at the registrar, wait for its TTL to expire (often 24 to 48 hours), change name servers, wait for the NS TTL, then enable signing at the new provider and add the new DS; or, where both providers support it, use multi-signer DNSSEC (RFC 8901), where each provider's keys are imported into the other's DNSKEY set and the zone stays signed throughout. Squarespace's prompt to disable DNSSEC before switching to custom name servers is the same safeguard. Transfers are the hard case: the DS stays at the registry through the transfer, and once the domain has left, only the new registrar can change it. Transfers are [The Transfer Flow](/books/hosting-and-cloud/transfers-and-locks#the-transfer-flow); a registrar should check for a DS that doesn't match the zone's current keys before and after every name-server change.

**Adoption.** About 40.0% of users worldwide sat behind validating resolvers over the 30 days to 25 October 2026, with another 8.9% partially validating, in APNIC Labs' measurement. Signing is far rarer: secure delegation was about 7% in 2025, against validation of about 36% that year, per the February 2026 APNIC post. Resolvers check; most zones give them nothing to check.

## The Alternatives

| Option | Model | Strengths | Failure modes | Cost |
| --- | --- | --- | --- | --- |
| **Run your own authoritative servers** (BIND, under MPL 2.0, or another server) | Software on your own anycast or unicast network | Full control; standard zone transfer; no per-query bill | You own DDoS absorption, anycast and 24/7 operation | Network and staff |
| **Managed cloud DNS** (Route 53, Cloud DNS, Azure DNS) | Metered zones and queries | APIs, routing policies, health checks, integration with the cloud's load balancers | Per-query bills under attack; proprietary features don't move | Cents per zone, cents per million queries |
| **CDN DNS** (Cloudflare) | Bundled with the proxy | Free, fast, signing in one click, apex flattening | The zone and the proxy are tied together; proprietary records | Free to Enterprise |
| **Enterprise DNS** (NS1, Akamai Edge DNS) | Tiered or flat contracts | Uptime SLAs, traffic steering, support | Contract minimums | Tens to thousands of dollars a month |
| **Registrar or host DNS** | Free with the domain or hosting plan | Zero setup for small customers; registrar can publish DS itself | Feature-poor; signing varies (DigitalOcean doesn't support it) | Free |
| **Two providers** | Primary and secondary by transfer, or two APIs fed by one pipeline | Survives one provider's outage | Proprietary features and DNSSEC need multi-signer or one signer | Double |

## My Default

For a host or registrar serving customer zones, my default is to run DNS on an anycast authoritative platform (owned or rented), offer it free and unmetered to customers whose domains or sites it already serves, and sign every zone it can with algorithm 13 by default, publishing the DS itself when it is also the registrar. Free and unmetered removes the attack-traffic billing question; signing by default is cheap when the same company holds both the zone and the registration, because the stale-DS failure becomes an internal consistency check rather than a support case.

For a cloud selling DNS to developers, I'd meter the way Route 53 and Google do (per zone hour and per query by answer type), but with written handling for attack traffic before launch. What would change the signing default is the registrar side: where the customer's registrar is someone else and doesn't automate DS updates, I'd still offer signing but require the customer to confirm the DS is published before showing the zone as secure, and I'd warn on every name-server change while a DS exists.

## How to Build It

A zone is a resource of kind `dns_zone` ([The Core Data Model](/books/hosting-and-cloud/hosting-and-cloud-business#one-resource-table)), linked to the domain when the provider also holds the registration. Records are effective-dated rows; keys are rows with their own lifecycle; queries are usage events.

```sql
CREATE TABLE dns_zones (                 -- side table: kind = 'dns_zone'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  apex               TEXT NOT NULL,      -- A-label, lowercase, no trailing dot
  domain_id          UUID REFERENCES domains (resource_id),  -- set when registered here
  zone_role          TEXT NOT NULL CHECK (zone_role IN ('primary', 'secondary')),
  primary_sources    INET[],             -- secondary: where AXFR and IXFR come from
  notify_targets     INET[],             -- primary: secondaries to NOTIFY
  transfer_key_ref   TEXT,               -- TSIG secret, a reference to the secret store
  nameservers        TEXT[] NOT NULL,    -- the set this provider assigned the zone
  soa_serial         BIGINT NOT NULL CHECK (soa_serial BETWEEN 0 AND 4294967295),
  soa_refresh        INT NOT NULL,       -- seconds
  soa_retry          INT NOT NULL,
  soa_expire         INT NOT NULL,
  soa_minimum        INT NOT NULL,       -- the negative-caching TTL (RFC 2308)
  dnssec_mode        TEXT NOT NULL DEFAULT 'unsigned' CHECK (dnssec_mode IN ('unsigned',
                       'signed', 'multi_signer', 'unsigning')),
  delegation_state   TEXT NOT NULL DEFAULT 'pending' CHECK (delegation_state IN ('pending',
                       'delegated', 'secure', 'bogus', 'lame', 'moved_away')),  -- observed
  delegation_checked_at TIMESTAMPTZ,
  CHECK ((zone_role = 'secondary') = (primary_sources IS NOT NULL))
);
-- Many accounts may add the same apex; the one that holds it is the active
-- resource_identifiers row (kind 'hostname'), so a zone is served for one holder at a time.

CREATE TABLE dns_health_checks (         -- endpoints that decide failover and routing
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  protocol           TEXT NOT NULL CHECK (protocol IN ('http', 'https', 'tcp', 'calculated')),
  target             TEXT,               -- address or hostname; null when calculated
  port               INT,
  path               TEXT,
  search_string      TEXT,               -- must appear early in the body
  interval_seconds   SMALLINT NOT NULL CHECK (interval_seconds IN (10, 30)),
  failure_threshold  SMALLINT NOT NULL DEFAULT 3,
  child_check_ids    UUID[],             -- calculated checks
  healthy_quorum_pct NUMERIC(5,2) NOT NULL DEFAULT 18,  -- share of checkers that must agree
  sku_id             UUID NOT NULL REFERENCES skus (id),
  valid_during       TSTZRANGE NOT NULL,
  CHECK ((protocol = 'calculated') = (child_check_ids IS NOT NULL))
);

CREATE TABLE dns_records (               -- record sets, one version per row
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  zone_id            UUID NOT NULL REFERENCES dns_zones (resource_id),
  owner_name         TEXT NOT NULL,      -- A-label, fully qualified
  rr_type            TEXT NOT NULL CHECK (rr_type IN ('A', 'AAAA', 'CNAME', 'MX', 'TXT',
                       'NS', 'SRV', 'CAA', 'HTTPS', 'SVCB', 'PTR', 'TLSA', 'DS')),
  ttl                INT NOT NULL CHECK (ttl >= 30),   -- the provider's floor
  rdata              TEXT[],             -- presentation format, one per record
  alias_target       TEXT,               -- flattened or alias answer, resolved by us
  routing_policy     TEXT NOT NULL DEFAULT 'simple' CHECK (routing_policy IN ('simple',
                       'weighted', 'latency', 'geolocation', 'geoproximity', 'ip_based',
                       'failover', 'multivalue')),
  set_identifier     TEXT NOT NULL DEFAULT '',  -- distinguishes routed variants
  weight             INT CHECK (weight >= 0),
  region_id          TEXT REFERENCES regions (id),   -- latency and geoproximity
  location_code      TEXT,               -- geolocation: continent, ISO 3166 country or subdivision
  failover_role      TEXT CHECK (failover_role IN ('primary', 'secondary')),
  health_check_id    UUID REFERENCES dns_health_checks (id),
  change_batch_id    UUID NOT NULL,      -- the atomic change that produced this version
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (zone_id WITH =, owner_name WITH =, rr_type WITH =,
    set_identifier WITH =, valid_during WITH &&),
  CHECK ((rdata IS NULL) <> (alias_target IS NULL)),
  CHECK (routing_policy <> 'weighted' OR weight IS NOT NULL),
  CHECK (routing_policy <> 'failover' OR failover_role IS NOT NULL),
  CHECK (routing_policy = 'simple' OR set_identifier <> '')
);

CREATE TABLE dnssec_keys (               -- signing keys and the DS that points at them
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  zone_id            UUID NOT NULL REFERENCES dns_zones (resource_id),
  role               TEXT NOT NULL CHECK (role IN ('ksk', 'zsk', 'csk')),
  algorithm          SMALLINT NOT NULL CHECK (algorithm IN (8, 13, 14, 15, 16)),
  key_tag            INT NOT NULL CHECK (key_tag BETWEEN 0 AND 65535),
  public_key         TEXT NOT NULL,
  private_key_ref    TEXT,               -- KMS or HSM reference; null for an imported key
  signer             TEXT NOT NULL DEFAULT 'self',  -- another provider, for multi-signer
  state              TEXT NOT NULL CHECK (state IN ('generated', 'published', 'active',
                       'retired', 'removed')),
  published_during   TSTZRANGE,          -- in the DNSKEY set
  signing_during     TSTZRANGE,          -- producing RRSIGs
  ds_digest_type     SMALLINT CHECK (ds_digest_type IN (2, 4)),  -- SHA-256, SHA-384
  ds_digest          TEXT,
  ds_epp_transaction_id UUID REFERENCES epp_transactions (id),  -- secDNS add, when also the registrar
  ds_seen_at_parent  TSTZRANGE,          -- observed in the parent zone
  CHECK (role = 'zsk' OR signer <> 'self' OR ds_digest IS NOT NULL OR state = 'generated'),
  CHECK (signer = 'self' OR private_key_ref IS NULL)
);

-- Signed zones whose parent DS matches no key the zone publishes: the stale-DS outage, found
-- before customers do.
CREATE VIEW dnssec_parent_mismatch AS
SELECT z.resource_id, z.apex, z.delegation_state
FROM dns_zones z
WHERE z.delegation_state = 'bogus'
   OR (z.dnssec_mode = 'unsigned' AND EXISTS (
         SELECT 1 FROM dnssec_keys k
         WHERE k.zone_id = z.resource_id AND upper_inf(k.ds_seen_at_parent)));

-- Queries are usage, rated per account per month by the answer type that produced them.
INSERT INTO skus (product_id, code, meter, unit, charge_kind) VALUES
  ((SELECT id FROM products WHERE code = 'dns'), 'dns.zone.hour',     'dns.zone_hours', 'hour',  'usage'),
  ((SELECT id FROM products WHERE code = 'dns'), 'dns.query.standard', 'dns.queries',   'query', 'usage'),
  ((SELECT id FROM products WHERE code = 'dns'), 'dns.query.routed',   'dns.queries',   'query', 'usage'),
  ((SELECT id FROM products WHERE code = 'dns'), 'dns.health_check.hour', 'dns.health_check_hours', 'hour', 'usage');
-- usage_events: meter 'dns.queries', resource_id the zone, dimensions
--   {"policy": "standard" | "latency" | "geolocation" | "ip_based" | "alias_free",
--    "rcode": "NOERROR" | "NXDOMAIN", "pop": "fra1"}
```

Notes on the sketch:

- **Zones are held, records are versioned.** A zone is a resource with an owner over time; each record set version is a row with `valid_during` ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)), so "what did `www` resolve to at 14:02 last Tuesday" is a query, which abuse desks and incident reviews both ask. A change batch closes the old versions and opens the new ones in one transaction and bumps `soa_serial`.
- **CNAME exclusivity is a trigger, not a constraint.** RFC 1034's "no other data" rule spans rows (a CNAME at a name forbids any other type there, and none at the apex), so it is enforced in the change-batch code or a trigger; flattened and alias answers use `alias_target` and are resolved by the provider.
- **Delegation is observed, not assumed.** `delegation_state` comes from querying the parent: pending until the NS at the registry point here, secure when a DS matches an active KSK, bogus when one doesn't, moved away when the NS point elsewhere. A zone that moved away stops counting as active for billing and abuse attribution.
- **Keys carry their DS.** For a KSK or CSK, the DS digest, the EPP transaction that published it ([Extensions](/books/hosting-and-cloud/epp-and-domain-data#extensions)) when the provider is also the registrar, and when the DS was actually seen at the parent. Private keys never sit in the table, only references to the KMS or HSM ([KMS or HSM](/docs/security/encryption-at-rest#kms-or-hsm)); imported keys from another signer have none.
- **Rollovers are state changes with times.** Published, active and retired ranges follow RFC 7583's timing, so a job can refuse to retire a KSK whose replacement's DS hasn't been seen at the parent for at least the DS TTL.
- **The mismatch view runs before every name-server change.** A registrar that also hosts DNS checks for a DS that would go stale (a signed zone leaving, or an unsigned zone with a DS still at the parent) before it sends the EPP update, and offers to remove the DS first.
- **Meters record the answer type.** One `dns.queries` meter with the policy as a dimension lets rating apply the right SKU and tier, keeps free alias answers visible, and lets support separate NXDOMAIN floods from real traffic when a bill is disputed. Tiers by monthly account volume live in `price_versions.tiers`.
- **Events:** `dns_zone.created`, `dns_zone.delegated`, `dns_zone.delegation_changed`, `dns_records.batch_applied`, `dnssec.key_published`, `dnssec.ds_submitted`, `dnssec.ds_seen_at_parent`, `dnssec.parent_mismatch_detected` and `dns_health_check.state_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the anycast publishing pipeline, the EPP client, the customer notice service and billing.

## Auditing

- **Every record change.** Who changed which record set, in which batch, through which credential, with the before and after, because a hijacked DNS account is how phishing and certificate misissuance start ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).
- **Delegation history.** When each zone's NS and DS at the parent changed and what the provider observed, so an outage can be placed on the provider, the registrar or the customer.
- **Key lifecycle.** Generation, publication, activation, retirement and removal of every key, the DS submissions and when each was seen at the parent, and every use of the KMS or HSM key behind it.
- **Health check decisions.** Each failover flip with the checker results behind it, so a customer disputing an outage or a false failover can be shown the data.
- **Query metering.** Raw query counts by zone and answer type per period, reconciled against rated usage, with any attack-traffic credits and the policy that granted them.

## What This Means for the System You Build

- **Model zones as held resources and records as versions:** atomic change batches, serials, and history you can query by time.
- **Track delegation from the parent's point of view:** pending, delegated, secure, bogus or moved away, checked on a schedule.
- **Meter queries by answer type:** routing policies and alias answers price differently, and attack traffic needs a written policy before the first bill.
- **Treat failover as bounded by TTLs:** health checks decide the answer, caches decide when users see it.
- **Sign by default when you hold both zone and registration,** with algorithm 13 and the DS published by your own EPP client.
- **Check for a stale DS on every name-server change and transfer:** remove or replace it first, or use multi-signer when both providers support it.
- **Keep private keys in a KMS or HSM:** the table holds references, tags and digests, never the key.
- **Expect DNSSEC to gate certificates:** since 15 March 2026 a broken signed zone fails the CA's lookups too.

## References

**Specifications**

- [RFC 1034: Domain Names, Concepts and Facilities (November 1987)](https://www.rfc-editor.org/rfc/rfc1034.html), zones, SOA and NS at the top node, two servers per zone, the CNAME rule
- [RFC 1035: Domain Names, Implementation and Specification (November 1987)](https://www.rfc-editor.org/rfc/rfc1035.html), record formats and the zone file
- [RFC 1995: Incremental Zone Transfer in DNS (August 1996)](https://www.rfc-editor.org/rfc/rfc1995.html), IXFR
- [RFC 1996: A Mechanism for Prompt Notification of Zone Changes (August 1996)](https://www.rfc-editor.org/rfc/rfc1996.html), NOTIFY
- [RFC 2136: Dynamic Updates in the DNS (April 1997)](https://www.rfc-editor.org/rfc/rfc2136.html), DNS UPDATE
- [RFC 2182: Selection and Operation of Secondary DNS Servers (July 1997)](https://www.rfc-editor.org/rfc/rfc2182.html), secondaries as a best current practice
- [RFC 2308: Negative Caching of DNS Queries (March 1998)](https://www.rfc-editor.org/rfc/rfc2308.html), the negative TTL from SOA MINIMUM and the SOA TTL
- [RFC 3258: Distributing Authoritative Name Servers via Shared Unicast Addresses (April 2002)](https://www.rfc-editor.org/rfc/rfc3258.html), anycast authoritative service
- [RFC 4786: Operation of Anycast Services (December 2006)](https://www.rfc-editor.org/rfc/rfc4786.html), anycast as a best current practice
- [RFC 4033: DNS Security Introduction and Requirements (March 2005)](https://www.rfc-editor.org/rfc/rfc4033.html), with RFC 4034 and 4035, DNSSEC as deployed
- [RFC 5155: DNSSEC Hashed Authenticated Denial of Existence (March 2008)](https://www.rfc-editor.org/rfc/rfc5155.html), NSEC3
- [RFC 5910: DNS Security Extensions Mapping for EPP (May 2010)](https://www.rfc-editor.org/rfc/rfc5910.html), secDNS-1.1, the DS and key data interfaces, update semantics, `urgent`, maxSigLife
- [RFC 5936: DNS Zone Transfer Protocol (AXFR) (June 2010)](https://www.rfc-editor.org/rfc/rfc5936.html), AXFR
- [RFC 7344: Automating DNSSEC Delegation Trust Maintenance (September 2014)](https://www.rfc-editor.org/rfc/rfc7344.html), CDS and CDNSKEY
- [RFC 7583: DNSSEC Key Rollover Timing Considerations (October 2015)](https://www.rfc-editor.org/rfc/rfc7583.html), rollover timing
- [RFC 8078: Managing DS Records from the Parent via CDS/CDNSKEY (March 2017)](https://www.rfc-editor.org/rfc/rfc8078.html), bootstrap acceptance policies and the delete signal
- [RFC 8624: Algorithm Implementation Requirements and Usage Guidance for DNSSEC (June 2019)](https://www.rfc-editor.org/rfc/rfc8624.html), the earlier algorithm guidance, obsoleted by RFC 9904
- [RFC 8901: Multi-Signer DNSSEC Models (September 2020)](https://www.rfc-editor.org/rfc/rfc8901.html), the two models and the key imports each requires
- [RFC 9615: Automatic DNSSEC Bootstrapping Using Authenticated Signals from the Zone's Operator (July 2024)](https://www.rfc-editor.org/rfc/rfc9615.html), authenticated DS bootstrapping
- [RFC 9824: Compact Denial of Existence in DNSSEC (September 2025)](https://www.rfc-editor.org/rfc/rfc9824.html), compact denial
- [RFC 9859: Generalized DNS Notifications (September 2025)](https://www.rfc-editor.org/rfc/rfc9859.html), the child nudging the parent
- [RFC 9904: DNSSEC Cryptographic Algorithm Recommendation Update Process (December 2025)](https://www.rfc-editor.org/rfc/rfc9904.html), recommendations moved to the IANA registries; current signing and DS digest recommendations
- [RFC 9905: Deprecating the Use of SHA-1 in DNSSEC Signature Algorithms (December 2025)](https://www.rfc-editor.org/rfc/rfc9905.html), algorithms 5 and 7 not to be used for signing
- [RFC 10026: Operational Recommendations for DNSSEC DS Automation (July 2026)](https://www.rfc-editor.org/rfc/rfc10026.html), BCP 246

**Root zone, history and certificates**

- [IANA: Root zone trust anchors](https://www.iana.org/dnssec/files), KSK-2010 signing from 15 July 2010, the 11 October 2018 rollover to KSK-2017, KSK-2024 signing from 11 October 2026, KSK-2017 revocation and removal dates
- [BIND 9: A Brief History of the DNS and BIND](https://bind9.readthedocs.io/en/latest/history.html), RFC 882 and 883, Jeeves, BIND at Berkeley under a DARPA grant, BIND 8 in May 1997, BIND 9 in September 2000
- [ISC: BIND 9](https://www.isc.org/bind/), the MPL 2.0 license and current versions
- [AWS News Blog: Moving ahead with Amazon Route 53 (24 May 2011)](https://aws.amazon.com/blogs/aws/moving-ahead-with-amazon-route-53/), the December 2010 beta, general availability, the 100% availability SLA, alias records and weighted round robin
- [CA/Browser Forum: Ballot SC-085v2, Require Validation of DNSSEC (when present) for CAA and DCV Lookups](https://cabforum.org/2025/06/18/ballot-sc-085v2-require-validation-of-dnssec-when-present-for-caa-and-dcv-lookups), the vote and the 15 March 2026 effective date
- [CA/Browser Forum: Ballot SC100, DNSSEC Clarification and Consolidation](https://cabforum.org/2026/08/06/ballot-sc100-dnssec-clarification-and-consolidation/), consolidation into section 4.2.2.2, primary perspective only, no effective date
- [APNIC Labs: Use of DNSSEC validation for the world](https://stats.labs.apnic.net/dnssec/XA), the validation share of users (data via its JSON time series, 30-day window to 25 October 2026)
- [APNIC Blog: Towards an industry best practice for DNSSEC automation (25 February 2026)](https://blog.apnic.net/2026/02/25/towards-an-industry-best-practice-for-dnssec-automation/), validation and secure delegation rates in 2025, ccTLDs running DS automation, gTLDs needing ICANN approval

**DNS providers**

- [Amazon Route 53: Pricing](https://aws.amazon.com/route53/pricing/), zone, query, routing, health check and DNSSEC prices
- [Amazon Route 53: Choosing a routing policy](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html), the eight routing policies and EDNS0
- [Amazon Route 53: How health checks determine health](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover-determining-health-of-endpoints.html), intervals, the 18% rule, response timings, calculated and CloudWatch checks
- [Amazon Route 53: Choosing between alias and non-alias records](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html), apex aliases, free alias queries, CNAMEs charged as two queries
- [Amazon Route 53: Configuring DNSSEC signing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-configuring-dnssec.html), KSK and ZSK split, the one-week TTL cap, no multi-vendor signing
- [Amazon Route 53: Customer managed keys for DNSSEC](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-configuring-dnssec-cmk-requirements.html), ECC_NIST_P256 in US East (N. Virginia), KMS charges
- [Google Cloud DNS: Pricing](https://cloud.google.com/dns/pricing), hourly zone pricing, query and routing policy prices, health checks
- [Azure Retail Prices API: Azure DNS](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Azure%20DNS%27), public zone, query and record set prices
- [Cloudflare: DNS FAQ](https://developers.cloudflare.com/dns/troubleshooting/faq/), no query charges on Free, Pro and Business, no query caps, query volume as an Enterprise pricing input, five-minute automatic TTL for proxied records
- [Cloudflare: CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/), apex CNAMEs, flattening all CNAMEs and its verification side effect
- [Cloudflare: DNSSEC](https://developers.cloudflare.com/dns/dnssec/), algorithm 13, automatic DS for its registrar via CDS/CDNSKEY scanning, multi-signer migration, the safe migration sequence and SERVFAIL risk
- [DigitalOcean: DNS pricing](https://docs.digitalocean.com/products/networking/dns/details/pricing/), free DNS management
- [DigitalOcean: DNS limits](https://docs.digitalocean.com/products/networking/dns/details/limits/), no DNSSEC, the 30-second minimum TTL
- [IBM: NS1 Connect pricing](https://www.ibm.com/products/ns1-connect/pricing), plans by queries, records and monitors
- [IBM: Support for Squarespace customers](https://www.ibm.com/docs/en/SSSYGZ/getting_started/support_for_squarespace_customers.html), Squarespace's DNS on NS1 Connect
- [Akamai: Distinguishing among DNS services, part 2, the economics (7 December 2020)](https://www.akamai.com/blog/trends/distinguishing-among-dns-services-part-2-the-economics), zone-based flat pricing and the 100% uptime SLA

**Registrars**

- [Cloudflare: Registrar](https://www.cloudflare.com/products/registrar/), free one-click DNSSEC
- [GoDaddy: What is DNSSEC?](https://www.godaddy.com/help/dnssec-faq-6135), signing on GoDaddy name servers, five credits, Premium DNS, manual DS for external DNS, unsupported domains
- [Namecheap: Managing DNSSEC for domains pointed to custom DNS](https://www.namecheap.com/support/knowledgebase/article.aspx/9722/2232/managing-dnssec-for-domains-pointed-to-custom-dns/), DS fields and the 60-minute application time
- [Porkbun: How to enable Porkbun's Cloudflare DNSSEC](https://kb.porkbun.com/article/216-how-to-enable-porkbuns-cloudflare-dnssec), the DNSSEC toggle and Registry DNSSEC records
- [Squarespace Help: Nameservers and DNSSEC for Squarespace-managed domains](https://support.squarespace.com/hc/en-us/articles/4404183898125-Nameservers-and-DNSSEC-for-Squarespace-managed-domains), the DNSSEC toggle, the disable prompt for custom name servers, third-party DS or DNSKEY
- [OpenSRS: Configuring DNSSEC](https://support.opensrs.com/support/solutions/articles/201000063087-configuring-dnssec), keys from the DNS provider, DS forwarded to the registry
- [IONOS: DNSSEC with external name servers](https://www.ionos.com/help/domains/using-your-own-name-servers/dnssec-with-external-name-servers), the emailed DS request and Domain Guard
