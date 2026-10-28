+++
title = "Conduits, Caches & Blocking Orders"
nav_title = "Conduits & Blocking Orders"
description = "DMCA 512(a) and (b), DSA conduit and caching, Cox v. Sony, and site-blocking orders against CDNs and resolvers in Italy, France, Germany, the UK and the US."
category = "Hosting & Cloud Industry"
order = 2200
part = "Abuse, Trust and the Law"
tags = ["copyright", "dmca", "dsa", "site-blocking", "dns", "cdn"]
+++

The law of hosting user content, the 512(c) notice-and-takedown regime, Section 230 and the DSA's hosting rules, is the [UGP volume's subject](/books/user-generated-platforms/hosting-liability). Infrastructure that doesn't store the content sits under different rules. A network that only carries packets, a cache that keeps temporary copies, and a resolver that answers lookups each have their own safe harbor, with conditions written for what they actually do, and none of them has a duty to take anything down on a private notice. What they do have, increasingly, is a duty to block: rights holders who can't reach a pirate site's operator, often offshore and behind a CDN, have turned to courts and regulators to order the intermediaries in front of it to stop resolving, proxying or routing to it. Since 2023 those orders have reached CDNs and public DNS resolvers, not just access ISPs, and in 2026 one resolver chose to leave a country rather than comply.

This chapter covers the conduit and caching safe harbors in the US and the EU, the effect of *Cox v. Sony* on infrastructure, the blocking regimes that reach CDNs and resolvers, and the order intake a provider needs. It adds `blocking_orders` and `blocking_order_targets`, extending the UGP [`legal_notices`](/books/user-generated-platforms/hosting-liability#how-to-build-it) table, to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Which tier each product sits in is [Three Tiers of Service](/books/hosting-and-cloud/abuse-on-infrastructure#three-tiers-of-service).

## How the Providers Do It

| Provider | Role | How it handles blocking orders, as of October 2026 |
| --- | --- | --- |
| **Cloudflare** | CDN and reverse proxy; 1.1.1.1 resolver | Geoblocks pass-through sites in the ordering country (H2 2025: Belgium 6 orders and 94 domains, France 1 and 1,238, UK 7 and 457, Korea 1 and 1,002); in countries without blocking laws "may take steps to disable caching"; for 1.1.1.1 "pursued legal remedies before complying"; fined by Italy's AGCOM and appealing |
| **Google, Cisco** | Public resolvers (8.8.8.8, OpenDNS) | Subject to French sports-rights orders in 2024; Cisco made OpenDNS unavailable in France from June 28, 2024 |
| **Quad9** | Non-profit public resolver | Won in Germany in 2023; ordered to block in France in 2026, and says it will stop serving France on November 24, 2026 |
| **Akamai** | CDN | Reports under the DSA as a caching and hosting intermediary; its 2024 report lists Member State orders, all information requests |
| **Access ISPs** | Mere conduit | The traditional target: UK High Court orders, and the US proposals of 2025 and 2026 |

The pattern is that a CDN can comply narrowly, by country, because it decides per request; a resolver can't easily, because its users' location isn't what its anycast routing selects for, and a filter at its scale is the expensive part. Cloudflare told AGCOM that filtering about 200 billion daily resolver requests is "disproportionate and unreasonable."

## How It Got Here

- **1998:** the DMCA's 512(a) and (b) gave conduits and caches safe harbors without takedown duties, and 512(j) limited injunctions against conduits.
- **2023:** Italy's anti-piracy law created Piracy Shield. In Germany, Sony won a blocking order against Quad9 on March 1, 2023, reversed on appeal later that year.
- **May and June 2024:** French courts ordered public resolvers to block sports piracy domains; Cisco withdrew OpenDNS from France on June 28.
- **2025:** FADPA was introduced on January 28; AGCOM ordered Cloudflare to block more than 15,000 domains and IPs in February; the Block BEARD discussion draft appeared in July.
- **2026:** AGCOM's fine was notified on January 8; the Supreme Court decided *Cox v. Sony* on March 25; the Paris Court of Appeal upheld resolver blocking on March 27; the Lazio court upheld the Italian fine in a judgment published July 17; H.R. 10364 was introduced on September 14; a Paris court ordered Quad9 to block on October 21, and Quad9 plans to leave France on November 24.

## The Conduit and Caching Safe Harbors

The DMCA (1998) wrote four safe harbors by function, 17 U.S.C. 512(a) through (d); the UGP volume's [DMCA Safe Harbors](/books/user-generated-platforms/hosting-liability#dmca-safe-harbors) table lists them. The two for infrastructure have conditions that describe the service rather than a notice process:

- **512(a), transitory digital network communications.** The transmission is initiated by someone else; it is carried "through an automatic technical process without selection of the material"; the provider doesn't select recipients; no copy is "ordinarily accessible to anyone other than anticipated recipients" or kept longer than reasonably necessary; and the material is "transmitted through the system or network without modification of its content." There is no notice-and-takedown duty: a conduit has nothing to take down.
- **512(b), system caching.** The cache doesn't modify the material, follows the originator's refresh rules where they are industry standard, doesn't interfere with technology that reports hits back to the originator, and honors the originator's access conditions (paywalls, passwords). Its takedown duty is narrow: under (b)(2)(E) it must remove or disable cached material on a notice only if the material has already been removed from the originating site, or a court has ordered that, and the notice says so.
- **512(j), injunctions.** Even inside a safe harbor a court can enjoin. For a 512(a) conduit the relief is limited to terminating identified subscriber accounts and "reasonable steps ... to block access, to a specific, identified, online location outside the United States." That clause is the narrow statutory hook for US site blocking that the bills below try to widen.

All four harbors share the repeat-infringer policy and standard technical measures conditions of 512(i), which is why access ISPs, which fall under 512(a), still need a [repeat-infringer policy](/books/user-generated-platforms/copyright#repeat-infringers).

The EU's equivalents are Articles 4 and 5 of the Digital Services Act. Article 4 covers a mere conduit that doesn't initiate the transmission, select the receiver, or select or modify the information, including "automatic, intermediate and transient storage" for the transmission. Article 5 covers caching, "automatic, intermediate and temporary storage" performed to make onward transmission more efficient or secure, on conditions that mirror 512(b): no modification, compliance with access conditions and industry update rules, no interference with lawful usage-data technology, and expeditious removal once the source is removed or a court or authority has ordered it. Both articles keep the power of a court or authority to require the provider to terminate or prevent an infringement, which is the hook for EU blocking orders. Recital 29 places DNS services and resolvers, registries, registrars and certificate authorities under mere conduit, and "the sole provision of content delivery networks, reverse proxies or content adaptation proxies" under caching.

## Cox v. Sony and Infrastructure

The Supreme Court decided *Cox Communications v. Sony Music Entertainment* (No. 24-171) on March 25, 2026. The record: the labels' agent MarkMonitor sent Cox 163,148 infringement notices, and a jury found Cox liable and awarded $1 billion; Cox couldn't use the DMCA safe harbor because *BMG v. Cox* (4th Cir. 2018) had held its repeat-infringer policy wasn't reasonably implemented. Justice Thomas, for seven Justices, held that contributory liability requires intent, shown "only if the party induced the infringement or the provided service is tailored to that infringement," and Cox had done neither. Justice Sotomayor, joined by Justice Jackson, concurred in the judgment and wrote that the majority "consigns the safe harbor provision to obsolescence." The UGP volume treats the case itself in [Cox v. Sony (2026)](/books/user-generated-platforms/hosting-liability#cox-v-sony-2026).

The infrastructure consequence is twofold. A conduit or cache that receives notices and keeps serving the customer is no longer contributorily liable for that alone, so the private-notice route to pressure on ISPs, CDNs and resolvers has lost most of its force in the US. That pushes rights holders toward blocking statutes, where a court or regulator orders the intermediary directly and liability doesn't matter. And the safe harbors' conditions still apply to anyone who wants their certainty: a provider without a working repeat-infringer policy now defends on the merits under a friendlier standard, but still defends.

## Blocking Orders in Europe

| Jurisdiction | Regime | What happened, as of October 2026 |
| --- | --- | --- |
| **Italy** | Piracy Shield, AGCOM's platform under the 2023 anti-piracy law: domains and IPs reported by rights holders must be blocked within 30 minutes | A February 2025 order to Cloudflare covered more than 15,000 domains and IPs. AGCOM fined Cloudflare €14,247,698.56 (1% of global turnover; the law allows 2%) by resolution 333/25/CONS, notified January 8, 2026, for not blocking on 1.1.1.1 and its network. The Lazio Regional Administrative Court dismissed Cloudflare's challenge in judgment 13201/2026, published July 17, 2026; Cloudflare announced an appeal to the Council of State, with no ruling reported |
| **France** | Sport Code Article L. 333-10, sports-rights holders' dynamic blocking orders | Canal+ won two Paris Judicial Court orders in May 2024 (Premier League and Champions League, about 117 domains) requiring Google, Cloudflare and Cisco to block on their public resolvers; Cisco withdrew OpenDNS from France from June 28, 2024. The Paris Court of Appeal rejected the appeals in five orders of March 27, 2026: DNS blocking is "technically feasible and proportionate," the providers' "neutral and passive" role is irrelevant, circumvention "does not render the measures in question ineffective," and providers bear their own costs |
| **France, Quad9** | The same article, on behalf of beIN Sports | On October 21, 2026 the Paris Judicial Court ordered Quad9 to implement a May 2026 order (now 58 domains) or pay €1,000 per day (beIN had asked for €580,000 per day). Quad9 says it will stop serving France on November 24, 2026; an appeal is pending |
| **Germany** | Court-ordered blocking as a last resort against intermediaries | Sony obtained an order against Quad9 from the Leipzig Regional Court on March 1, 2023; the Dresden Higher Regional Court (14 U 503/23) reversed later in 2023, holding a resolver plays no significant role in the infringement, and didn't admit a further appeal |
| **United Kingdom** | High Court blocking injunctions | Cloudflare geoblocks UK sites under them: 7 orders covering 457 domains in H2 2025 |

The trend runs in one direction. The early orders bound access ISPs, which control their own subscribers' resolvers and could block with a DNS entry. The newer ones reach providers that serve the whole world from one anycast address, and courts in Italy and France have rejected the argument that a global, neutral service shouldn't be asked to filter for one country. Germany is the exception, on the facts of a resolver's role. A provider's options under such an order are to geoblock (comply where it can identify the country), to challenge (as Cloudflare did in Italy), or to exit (as Cisco did for OpenDNS and Quad9 plans to); paying a daily penalty is not a long-term option.

## Blocking Bills in the United States

No US statute today authorizes blocking orders beyond 512(j). Three proposals were live as of October 2026:

- **Foreign Anti-Digital Piracy Act (FADPA), H.R. 791.** Introduced January 28, 2025 by Representative Lofgren and referred to the House Judiciary Committee, with no further action. It would let courts order blocking of foreign piracy sites by access ISPs and, in the introduced text, DNS resolvers with more than $100 million in revenue.
- **Block BEARD Act.** A Senate discussion draft released in July 2025 by Senators Tillis, Coons, Blackburn and Schiff, not a formally introduced bill. It would authorize court orders directing ISPs to block "dedicated foreign online piracy operations"; it doesn't name resolvers, though its use of the DMCA's service-provider definition could reach them. Tillis and Lofgren were reported to be drafting a combined bill, with no text published.
- **American Copyright Protection Act of 2026, H.R. 10364.** Introduced September 14, 2026 by Representative Issa and referred to House Judiciary. It covers broadband ISPs, "providers of domain name resolution services" and VPNs, excludes root operators, TLD registries and providers with fewer than 100,000 monthly US users, and works in two steps: a court declares a "foreign piracy site," then issues a blocking order, with 14 to 30 days to take "commercially reasonable steps," shortened for live sports. It mandates no technique and doesn't mention CDNs.

## The Alternatives

| Response to an order | Model | Strengths | Failure modes | Who has done it |
| --- | --- | --- | --- | --- |
| **Geoblock on the proxy** | Refuse the listed hostnames to requests from the ordering country, with a 451 | Narrow; the rest of the world is unaffected | Needs reliable country detection; VPNs bypass it | Cloudflare under UK, Belgian, French and Korean orders |
| **Disable caching** | Stop storing the site's content, keep passing traffic | Removes the cache-provider role where no blocking law applies | Doesn't make the site unreachable | Cloudflare in countries without blocking laws |
| **Resolver block for one country** | Return no answer or a block page for queries from that country | Complies | Location is inferred from the query source; a global filter at resolver scale is expensive | Google and Cloudflare in France |
| **Challenge** | Litigate the order or the fine | Can establish limits (Germany) | Penalties accrue; courts have mostly upheld orders | Cloudflare in Italy, Quad9 in Germany and France |
| **Exit the market** | Stop serving the country | No ongoing liability there | Users lose the service; a precedent for others | Cisco OpenDNS (2024), Quad9 (November 2026) |

## My Default

My default for a CDN is to comply with authenticated orders from a court or a regulator that has the power to issue them, by geoblocking the listed hostnames in that jurisdiction only, with an HTTP 451 and a `blocked-by` link ([CDN Scanning](/books/user-generated-platforms/abuse-desks#cdn-scanning) covers RFC 7725), and to challenge orders that are global in effect, that lack judicial or regulatory review, or that list IP addresses shared with other customers. For a resolver, I'd treat a blocking order as a decision about whether to keep serving the country: comply only where per-country answers are feasible and the order is reviewed by a court, and otherwise challenge, and plan the exit. Private notices to a conduit or cache get forwarded to the customer and the origin host, and, for a cache, honored under 512(b)(2)(E) once the origin has removed the material.

What would change this: Piracy Shield's 30-minute clock and rights-holder-submitted lists make "review before blocking" impossible in Italy, so a provider serving Italy needs either automated compliance with a fast appeal path or a decision not to serve Italian resolver traffic. A provider with infrastructure in a country is far more exposed to its penalties than one serving it from abroad.

## How to Build It

A blocking order is a `legal_notices` row of kind `court_order` or `regulator_order` from [the UGP liability chapter](/books/user-generated-platforms/hosting-liability#how-to-build-it), with its clock, authenticity check and status. Blocking adds what that table doesn't hold: the order's technique and territory, its targets as they change (dynamic orders add domains for months), the penalty for non-compliance, and the challenge. The edge and resolver enforce `blocking_order_targets` that are in force.

```sql
CREATE TABLE blocking_orders (           -- a court or regulator order to block, on a legal notice
  legal_notice_id    UUID PRIMARY KEY REFERENCES legal_notices (id),
  regime             TEXT NOT NULL,      -- 'it_piracy_shield', 'fr_sport_l333_10',
                                         -- 'uk_high_court', 'de_court', 'us_512j'
  service_tier       TEXT NOT NULL CHECK (service_tier IN ('pass_through', 'core')),
  products           TEXT[] NOT NULL,    -- product codes bound: 'cdn', 'resolver', 'dns'
  technique          TEXT NOT NULL CHECK (technique IN ('geoblock', 'resolver_block',
                       'caching_disabled', 'ip_block', 'not_specified')),
  territories        CHAR(2)[] NOT NULL, -- where the block applies; never empty
  dynamic            BOOLEAN NOT NULL DEFAULT FALSE,  -- targets may be added after issue
  target_add_sla     INTERVAL,           -- e.g. 30 minutes under Piracy Shield
  valid_during       TSTZRANGE NOT NULL, -- the order's own term
  penalty_terms      TEXT,               -- '€1,000 per day', 'fine up to 2% of turnover'
  challenge_status   TEXT NOT NULL DEFAULT 'none' CHECK (challenge_status IN ('none',
                       'filed', 'pending', 'upheld', 'set_aside', 'withdrawn')),
  challenge_ref      TEXT,               -- court and case number
  market_exit        BOOLEAN NOT NULL DEFAULT FALSE  -- the provider chose to stop serving
);

CREATE TABLE blocking_order_targets (    -- each domain, hostname or IP, as added
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_notice_id    UUID NOT NULL REFERENCES blocking_orders (legal_notice_id),
  target_kind        TEXT NOT NULL CHECK (target_kind IN ('domain', 'hostname', 'ipv4',
                       'ipv6_prefix')),
  target             TEXT NOT NULL,      -- normalized: A-label, canonical address
  submitted_at       TIMESTAMPTZ NOT NULL,  -- the clock for dynamic additions starts here
  resource_id        UUID REFERENCES resources (id),  -- the customer zone, when the provider serves it
  shared_with_others INT NOT NULL DEFAULT 0,  -- other customers on that IP
  enforced_during    TSTZRANGE,          -- null until enforced
  refused_reason     TEXT CHECK (refused_reason IN ('shared_ip', 'not_served',
                       'outside_order', 'under_challenge')),
  CHECK (enforced_during IS NULL OR refused_reason IS NULL),
  UNIQUE (legal_notice_id, target_kind, target)
);
CREATE INDEX blocking_targets_in_force
  ON blocking_order_targets (target_kind, target) WHERE upper_inf(enforced_during);
```

The edge reads the targets in force for the request's country; the late-enforcement check is a query:

```sql
-- Dynamic additions not enforced within the order's SLA.
SELECT t.target, t.submitted_at, o.target_add_sla
FROM blocking_order_targets t
JOIN blocking_orders o ON o.legal_notice_id = t.legal_notice_id
WHERE o.dynamic
  AND t.refused_reason IS NULL
  AND (t.enforced_during IS NULL
       OR lower(t.enforced_during) > t.submitted_at + o.target_add_sla);
```

Notes on the sketch:

- **Territory is never empty.** A global block requires a deliberate entry of every country, so it can't happen by default.
- **Shared IPs are refused, not blocked.** An IP target that other customers share is recorded with the count and refused with a reason, because blocking it takes down unrelated sites; this is the overblocking Cloudflare raised in Italy.
- **Dynamic targets carry their own clock,** from submission, so the provider can prove compliance with a 30-minute rule or show where it failed.
- **The challenge is state.** Filing, pending and outcome sit on the order, so counsel, the edge team and the transparency report agree on which orders are being enforced under protest.
- **Events:** `blocking_order.received`, `blocking_order.target_added`, `blocking_order.target_enforced`, `blocking_order.challenged` and `blocking_order.market_exit` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the edge and resolver control planes, legal and the transparency job.

## Auditing

- **Every order with its authenticity check,** regime, territories and technique, because a forged order is as easy to send to a CDN as to a host ([Fraudulent Legal Requests](/books/user-generated-platforms/hosting-liability#fraudulent-legal-requests)).
- **Every target's timeline,** from submission to enforcement or refusal, against the order's clock.
- **Collateral,** the other customers on any IP named, and the refusals that protected them.
- **Penalties accrued and paid,** and the challenge record.
- **Transparency counts** by country, orders and domains, the figures Cloudflare publishes per half-year.

## What This Means for the System You Build

- **Know which safe harbor each product claims,** 512(a), (b) or (c), and DSA Article 4, 5 or 6, and meet its conditions.
- **Forward private notices from a conduit or cache;** remove cached copies only once the origin has.
- **Model blocking orders as legal notices** with technique, territories, dynamic targets and their clocks.
- **Geoblock narrowly and answer with 451,** never globally by default.
- **Refuse to block shared IPs** and record why.
- **Decide in advance what a resolver does** under an order it can't meet: challenge, comply per country, or leave.

## References

**Statutes and cases**

- [17 U.S.C. 512 (Cornell LII)](https://www.law.cornell.edu/uscode/text/17/512), the 512(a) and (b) conditions, (b)(2)(E), (i) and (j)
- [Digital Services Act, Article 4 (EUR-Lex, OJ L 277, 27.10.2022)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065#art_4), mere conduit
- [Digital Services Act, Article 5 (EUR-Lex)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065#art_5), caching and the preserved power to order
- [Digital Services Act, Recital 29 (EUR-Lex)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065#rct_29), conduit, caching and hosting examples
- [Supreme Court: Cox Communications v. Sony Music Entertainment, No. 24-171](https://www.supremecourt.gov/opinions/25pdf/24-171_bq7d.pdf), March 25, 2026, the intent standard, the record and the concurrence
- [Faegre Drinker: Supreme Court decides Cox v. Sony](https://www.faegredrinker.com/en/insights/publications/2026/3/supreme-court-decides-cox-communications-v-sony-music-entertainment), the 7-2 split on the rule
- [OLG Dresden: Judgment in Sony v. Quad9, 14 U 503/23](https://quad9.net/uploads/2023_12_06_OLG_Dresden_Urteil_quad9_geschwarzt_490c67518d.pdf), 2023, reversal and no further appeal admitted
- [netzpolitik.org: Success for Quad9](https://netzpolitik.org/2023/erfolg-fuer-quad9-dns-anbieter-doch-nicht-fuer-urheberrechtsverletzungen-verantwortlich/), the Leipzig order and the reversal

**Italy**

- [heise online: AGCOM fines Cloudflare](https://heise.de/-11136858), the fine, its basis in turnover, and the 200 billion daily requests argument
- [Digital Policy Alert: AGCOM and Cloudflare](https://digitalpolicyalert.org/change/17775), the Piracy Shield order and fine
- [Punto Informatico: TAR confirms the Cloudflare fine](https://www.punto-informatico.it/prima-vittoria-agcom-tar-conferma-sanzione-cloudflare/), resolution 333/25/CONS, the amount and the announced appeal
- [Diritto.it: TAR Lazio judgment 13201/2026](https://www.diritto.it/?p=251702), published July 17, 2026

**France and the UK**

- [TorrentFreak: OpenDNS leaves France](https://torrentfreak.com/?p=253822), the May 2024 orders and the June 28, 2024 exit
- [TorrentFreak: Paris Court of Appeal upholds DNS blocking](https://torrentfreak.com/?p=277758), the March 27, 2026 orders and their reasoning
- [TorrentFreak: Quad9 will leave France](https://torrentfreak.com/dns-resolver-quad9-will-leave-france-after-court-orders-piracy-blocking-penalty/), the October 21, 2026 order, the penalty and the November 24 exit
- [Cloudflare: Transparency report H2 2025, abuse](https://cf-assets.www.cloudflare.com/slt3lc6tev37/7IBPOyNLRJfQ7joWrmsVh0/d3947a86eb4d76801076094a85cf7ff7/2H_2025_Cloudflare_s_Transparency_Report_Abuse-v2.pdf), blocking orders by country, disabling caching, and the resolver approach

**United States bills**

- [GovInfo: H.R. 791, Foreign Anti-Digital Piracy Act](https://www.govinfo.gov/app/details/BILLS-119hr791ih), introduced January 28, 2025
- [Digital Music News: Block BEARD Act moves forward](https://www.digitalmusicnews.com/2025/07/30/block-beard-act-moves-forward/), the July 2025 discussion draft
- [TorrentFreak: Lawmakers work on a unified site-blocking bill](https://torrentfreak.com/u-s-lawmakers-work-on-unified-site-blocking-bill-to-counter-online-piracy/), the Tillis and Lofgren drafting
- [GovInfo: H.R. 10364, American Copyright Protection Act of 2026](https://www.govinfo.gov/app/details/BILLS-119hr10364ih), introduced September 14, 2026
- [TorrentFreak: Site-blocking bill adds VPNs](https://torrentfreak.com/u-s-site-blocking-bill-adds-vpns-to-the-list-of-blocking/), coverage, exclusions and the two-step process
