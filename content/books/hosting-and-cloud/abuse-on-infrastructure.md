+++
title = "Abuse on Infrastructure"
description = "Hosted, pass-through and core services as abuse tiers, AUPs, voluntary terminations, automated action and the narrowest effective response."
category = "Hosting & Cloud Industry"
order = 2197
part = "Abuse, Trust and the Law"
tags = ["abuse", "trust-and-safety", "aup", "cdn", "termination"]
+++

Every infrastructure provider carries other people's abuse. A web host stores the phishing kit, a cloud runs the scanner, a CDN proxies the scam site, a DNS resolver answers the query that finds it, and a registrar holds the name it lives under. What differs is what each of them can actually do about it. A host can delete a file. A proxy can only stop proxying, which leaves the site online at its origin. A resolver can refuse to answer, but only for its own users and only everywhere at once. The abuse desk's operating model (intake, attribution, the layered actions from a file to a null route, notice and appeal) belongs to the [UGP volume's abuse desks chapter](/books/user-generated-platforms/abuse-desks); this chapter covers what renting out infrastructure adds: which tier of service a resource sits in, what the acceptable use policy says for each, when a provider drops a customer whose content is lawful but hateful, and how automation lets a desk keep up with millions of reports.

It adds a service tier to `resources`, a versioned AUP category catalog and a termination review record to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), and points the UGP abuse tables at them. The law behind each tier is the next chapters' subject: Free-Tier Fraud & Stolen Keys for abuse that is really fraud against the provider, [Conduits, Caches & Blocking Orders](/books/hosting-and-cloud/conduits-caches-and-blocking-orders) for the liability rules, [Sanctions, Exports & Bulletproof Hosts](/books/hosting-and-cloud/sanctions-and-bulletproof-hosts) for customers the law forbids, and [Law Enforcement at Infrastructure Providers](/books/hosting-and-cloud/law-enforcement-at-providers) for data requests.

## How the Providers Do It

| Provider | How it splits services | What it says it acts on | Published volumes, latest |
| --- | --- | --- | --- |
| **Cloudflare** | Hosting products (Pages, R2, Stream, Images) under an Acceptable Hosting Policy; security and CDN services that pass traffic through; core services (authoritative DNS, the 1.1.1.1 resolver, WARP) | Hosted content: removal for child sexual abuse material, IP infringement, malware and similar. Pass-through: generally not content, but sanctioned parties, content illegal in the US, and legal orders applied in the jurisdiction concerned. Core services: a higher bar still | H2 2025: 258,592 phishing reports on hosted products, 177,864 actioned, 89% of phishing reports resolved automatically; 0 voluntary terminations |
| **AWS** | One AUP across services | Illegal or fraudulent use, violating others' rights, violence and terrorism, child exploitation, security violations, unsolicited mass email; AWS "may remove or disable access to any content or resource" | No abuse volumes published |
| **Akamai** | Reports under the EU Digital Services Act as a caching and a hosting intermediary | Member State orders; its report for 17 February to 31 December 2024 lists 16 orders, all information requests | DSA report dated February 28, 2025 |
| **Hosts and registrars** | Hosting, registration and DNS as separate services | The UGP chapter's intake table covers GoDaddy, Hetzner, Namecheap, Newfold, OVHcloud and DigitalOcean | [Intake](/books/user-generated-platforms/abuse-desks#intake) |

The pattern is that the bar for acting rises as the provider moves away from storing the content. A host is closest to the content and acts on its own terms every day. A pass-through service acts on law and its own safety, rarely on content. A core service that underpins reachability (a resolver, an authoritative DNS service) treats a block as a global act and resists it. Cloudflare's 10-K names the cost of getting this wrong in either direction: customer content "may cause adverse political, business, and reputational consequences," and it lists the Daily Stormer termination and the 2022 Kiwi Farms block as decisions that drew "significant adverse feedback."

## How It Got Here

- **1998:** the DMCA wrote separate safe harbors for conduits, caches and hosts (17 U.S.C. 512(a) to (c)), the first legal statement that the tiers are different.
- **August 16, 2017:** Cloudflare dropped the Daily Stormer, and its CEO published the due-process argument against doing it again.
- **August 5, 2019:** Cloudflare terminated 8chan after the El Paso shooting.
- **August 31, 2022:** Cloudflare published its tiered abuse policy (hosted, pass-through, core), and on September 3 blocked Kiwi Farms under an emergency exception to it.
- **2022:** the EU's Digital Services Act (Regulation (EU) 2022/2065) restated conduit, caching and hosting, with Recital 29 naming which infrastructure falls where.
- **2025 to 2026:** automation took over the volume: in the second half of 2025, 89% of Cloudflare's phishing reports were resolved automatically, and the policy post was revised on July 15, 2026.

## Three Tiers of Service

The European Union wrote the tiers into law. Recital 29 of the Digital Services Act (Regulation (EU) 2022/2065) gives examples for each liability category: "mere conduit" covers "internet exchange points, wireless access points, virtual private networks, DNS services and resolvers, top-level domain name registries, registrars, certificate authorities that issue digital certificates, voice over IP and other interpersonal communication services"; "caching" covers "the sole provision of content delivery networks, reverse proxies or content adaptation proxies"; "hosting" covers "cloud computing, web hosting, paid referencing services or services enabling sharing information and content online, including file storage and sharing." US copyright law draws the same lines in 17 U.S.C. 512(a), (b) and (c). The liability consequences are [Conduits, Caches & Blocking Orders](/books/hosting-and-cloud/conduits-caches-and-blocking-orders); the operational consequence is that one provider sells products in all three tiers, so the tier is a property of the product and the resource, not of the company. A registrar's own abuse duties, which ICANN contracts set, are [DNS Abuse at the Registrar](/books/hosting-and-cloud/dns-abuse).

| Tier | Examples | What the provider can do | What it can't do | Who is better placed |
| --- | --- | --- | --- | --- |
| **Hosted** | Shared hosting, VMs, object storage, a static site platform, a managed database | Remove or quarantine the file, suspend the site or VM, terminate the account | Nothing it can't; it holds the bytes | The provider, after the customer |
| **Pass-through** | CDN, reverse proxy, WAF, DDoS protection, load balancer in front of a customer origin | Show an interstitial, stop caching, stop proxying, geoblock under an order | Remove the content: the origin keeps serving it, and the customer can point DNS elsewhere in minutes | The origin's host |
| **Core** | Authoritative DNS, public resolvers, a registry, a registrar, an IP transit network | Remove records, place a hold, refuse resolution, null-route | Act narrowly: a resolver block applies to every user of the resolver; a domain hold takes down every subdomain and mailbox | The host, then the registrar |

Cloudflare's stated policy (first published August 31, 2022, modified July 15, 2026) is the clearest public version of the reasoning. Its security services generally don't terminate customers over objectionable content: "Just as the telephone company doesn't terminate your line if you say awful, racist, bigoted things," it looks "to legal process, not popular opinion," because "organizations closest to content are best at determining when the content is abusive." It does act on pass-through customers for sanctions, for content illegal in the US (child sexual abuse material, FOSTA), and on legal orders, which it generally applies only in the jurisdiction concerned; it generally challenges orders that would impose a global restriction through a core service. Its transparency report shows what that means in practice: in the second half of 2025, Cloudflare took 427,125 phishing and technical-abuse actions (interstitial warnings) on sites using its non-hosted, non-registrar services, against 177,864 actioned phishing reports on hosted products, and its 1.1.1.1 team "pursued legal remedies before complying" with resolver blocking orders because a resolver block is global.

The tier also decides what a report is for. A report about a hosted resource opens a case the provider decides. A report about a pass-through resource is mostly forwarded: the provider names the origin host to the reporter, if it can, and passes the complaint to the host and the customer ([forwarding is a disposition](/books/user-generated-platforms/abuse-desks#how-to-build-it)). The narrow actions a pass-through provider has of its own are the interstitial (a warning page in front of a known phishing or malware URL) and stopping caching, which Cloudflare says it "may" do in countries without blocking laws; neither removes anything.

## The Acceptable Use Policy

The AUP is the contract term every action rests on. M3AAWG's hosting practice, covered in the UGP chapter, asks hosts to cite the specific term a customer breached, which keeps the action defensible. The AUPs across providers share a skeleton:

- **Illegal content and activity,** with child sexual abuse material and terrorism named separately because they carry reporting and removal duties of their own ([Child Safety](/books/user-generated-platforms/child-safety), [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content)).
- **Infringing others' rights,** handled through [DMCA for Hosts](/books/user-generated-platforms/abuse-desks#dmca-for-hosts) for copyright.
- **Security violations against third parties:** AWS's AUP bars using the services to "violate the security, integrity, or availability of any user, network, computer or communications system," which covers scanning, intrusion, botnet command and control and denial of service.
- **Network abuse:** unsolicited mass email, open relays and proxies, forged headers. Residential ISP terms carry the same list (open SMTP, open proxies) for the home lab case.
- **Abuse of the provider itself:** fraud, evading limits, multiple accounts to farm free tiers, and on most clouds cryptocurrency mining without permission. Google Cloud's terms bar using the services "to engage in cryptocurrency mining without Google's prior written approval" and its free trial bars mining outright; GitHub's terms for Actions list "Cryptomining" among prohibited uses. These are Free-Tier Fraud & Stolen Keys.
- **The remedy clause:** AWS "may remove or disable access to any content or resource" that violates the policy, and customers must "cooperate with us to remedy any violation." Google Cloud's terms give the customer notice and 24 hours to correct an AUP violation before suspension, with immediate suspension reserved for protecting the services ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)).

Two choices separate AUPs that work from ones that don't. The first is whether the categories are the same list the abuse desk files reports under, so that a report category maps to the clause it would breach and the action it allows; otherwise reviewers translate by hand and the transparency report counts something different from what the desk did. The second is whether the AUP says which tier it binds: a pass-through customer's site content isn't the provider's to police in the same way, and an AUP that reads as if it were invites demands the provider has already decided not to meet.

## Voluntary Terminations

Three decisions by one company define the debate over whether a pass-through provider should drop a customer for lawful but abhorrent content.

| Customer | Date | What Cloudflare did | The reasoning it published |
| --- | --- | --- | --- |
| **The Daily Stormer** | August 16, 2017 | Stopped proxying and DNS | The tipping point was the site's claim that Cloudflare secretly supported it; the CEO wrote that "Due Process requires that decisions be public and not arbitrary," and worried about the precedent for government pressure |
| **8chan** | August 5, 2019 | Terminated service after the El Paso shooting | The site was "lawless by design"; "we've solved our own problem, but we haven't solved the Internet's," predicting it would return through other providers |
| **Kiwi Farms** | September 3, 2022 | Blocked the site across its infrastructure | An "unprecedented emergency and immediate threat to human life," with legal process too slow; "Hard cases make bad law," and the policy published the prior week stood |

The three posts make the same argument from three directions: a pass-through provider removing a customer doesn't remove the content (8chan returned, as predicted), it sets a precedent that the next government or campaign will cite, and the decision is only defensible if it follows a stated rule. Cloudflare reported zero voluntary terminations in the second half of 2025. Hosts face the question differently, because a host's removal does take the content down, but the governance point carries over: an action outside the AUP's ordinary categories needs a written threshold, a named decision-maker above the desk, and a public record of the reason.

## Automation and Scale

At infrastructure scale most actions are automated, and the published numbers show where. In the second half of 2025 Cloudflare actioned 67,941 copyright reports on hosted products, 64,161 of them by automated means; terminated the R2 services of 59,843 related accounts by automated means; and resolved 89% of phishing reports automatically. Its phishing actions on its own initiative (237,822) exceeded the reports it actioned (177,864). The mechanisms behind numbers like these:

- **Structured intake.** Reports from trusted reporters, blocklists and scanners arrive as structured feeds ([Intake](/books/user-generated-platforms/abuse-desks#intake)), so a match to a known phishing kit or malware hash can be actioned without a reviewer.
- **Related-account fan-out.** A fraud ring opens many accounts; once one is confirmed, accounts sharing its payment instrument, device, contact or infrastructure are actioned together. This is the single most effective control against throwaway accounts and the most dangerous when the linking signal is weak, so the link and its strength must be recorded (Free-Tier Fraud & Stolen Keys owns `account_links`).
- **Own-initiative detection.** Scanning hosted content for known-bad hashes and phishing kits, and watching compute for mining and scanning patterns, finds abuse before anyone reports it.
- **Human review for the rest.** Disputed reports, legitimate customers with a compromised site, and anything touching speech go to people, and the [penalty ladder](/docs/security/trust-and-safety#penalties-and-escalation-ladders) applies.

The failure mode of automation is acting on the wrong customer or the wrong layer at machine speed. Attribution by the reported instant ([who held this IP at this time](/books/hosting-and-cloud/hosting-and-cloud-business#one-resource-table)) and the narrowest-layer rule ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)) are what keep an automated null route on a shared IP from taking down hundreds of bystanders.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- |
| **Tiered policy** | Act on content only where the provider hosts it; on pass-through act on law, safety and its own abuse; resist global blocks on core services | Predictable; places action where it works; defensible against pressure | Seen as indifference when abhorrent sites stay online behind the provider | Cloudflare's published approach |
| **One AUP for everything** | The same rules for hosted and pass-through customers | Simple to state and enforce | Pass-through enforcement doesn't remove content; invites campaigns to drop customers | Most hyperscaler AUPs as written |
| **Content-based discretion** | Terminate any customer whose content the provider finds unacceptable | Responsive to harm and to public pressure | Arbitrary in practice; precedent for governments; content moves elsewhere | Common at small hosts, case by case |
| **Forward only** | Pass reports to the host and customer, take no action of its own | Cheapest; no speech decisions | Leaves phishing and malware live behind the provider's network and IPs | Pass-through providers without an abuse team |
| **Order-driven only** | Act only on court or regulator orders | Clear legal footing | Too slow for phishing, malware and attacks | Some resolvers and transit networks |

## My Default

My default is the tiered policy, written down per product: hosted products enforce the AUP on content; pass-through products forward content complaints to the origin host and act on their own for phishing and malware (interstitial first), for attacks launched through them, for sanctions, for content illegal where the provider operates, and on orders applied only where they bind; core services act on orders only after legal review and challenge global effects. Voluntary termination outside those categories needs a written threshold (an imminent threat to life, as in the Kiwi Farms post), sign-off above the abuse desk, and a published explanation. Automation handles structured reports and known-bad matches; anything that touches speech or a shared resource gets a person.

What would change this: a provider whose only product is hosting doesn't need the tiers, and one selling to a single regulated market may have to treat every order as global for that market. A provider whose brand is the customers it refuses (some managed hosts market curated customers) can choose content-based discretion, but should then publish the standard and apply it to everyone.

## How to Build It

The chapter adds a service tier to `resources`, a versioned catalog of AUP categories that reports, decisions and transparency counts share, and a review record for terminations outside the ordinary ladder. Cases, reports and mitigations are the [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) tables, already pointed at `resources` by the core model.

```sql
ALTER TABLE resources
  ADD COLUMN service_tier TEXT NOT NULL DEFAULT 'hosted'
    CHECK (service_tier IN ('hosted', 'pass_through', 'core'));
    -- a CDN zone and a WAF policy are 'pass_through'; a dns_zone on authoritative DNS
    -- and a domain held by a registrar are 'core'; set by kind, overridable per product

CREATE TABLE aup_categories (            -- the AUP as rules as data; versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  code             TEXT NOT NULL,        -- 'phishing', 'malware', 'csam', 'copyright',
                                         -- 'spam', 'scanning', 'ddos_origin', 'cryptomining',
                                         -- 'free_tier_abuse', 'sanctioned_party', 'illegal_content'
  version          INT NOT NULL,
  aup_clause       TEXT NOT NULL,        -- the clause cited in the notice to the customer
  applies_to_tiers TEXT[] NOT NULL,      -- which service tiers the provider acts on
  default_action   JSONB NOT NULL,       -- per tier: {"hosted": "file_quarantined",
                                         --  "pass_through": "interstitial", "core": "forward"}
  automatable      BOOLEAN NOT NULL DEFAULT FALSE,  -- may a structured match act without review
  owning_path      TEXT,                 -- 'child_safety', 'copyright', 'legal': leaves this desk
  dsa_category     TEXT,                 -- the statement-of-reasons category it reports under
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (code, version),
  EXCLUDE USING GIST (code WITH =, valid_during WITH &&)
);

ALTER TABLE reports
  ADD COLUMN aup_category_id UUID REFERENCES aup_categories (id);
ALTER TABLE abuse_mitigations
  ADD COLUMN aup_category_id UUID REFERENCES aup_categories (id),
  ADD COLUMN service_tier    TEXT NOT NULL DEFAULT 'hosted'
    CHECK (service_tier IN ('hosted', 'pass_through', 'core')),  -- copied at action time
  ADD COLUMN automated       BOOLEAN NOT NULL DEFAULT FALSE;
-- abuse_mitigations.action gains 'interstitial', 'caching_disabled', 'proxy_disabled'
-- and 'geoblocked' for pass-through layers.

CREATE TABLE termination_reviews (       -- terminations outside the AUP's ordinary ladder
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id          UUID NOT NULL REFERENCES moderation_cases (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  service_tier     TEXT NOT NULL CHECK (service_tier IN ('hosted', 'pass_through', 'core')),
  threshold        TEXT NOT NULL CHECK (threshold IN ('imminent_threat_to_life',
                     'provider_safety', 'legal_advice', 'other')),
  rationale        TEXT NOT NULL,        -- the written reason, as it will be published
  decided_by       TEXT NOT NULL,        -- typed actor above the abuse desk
  decided_at       TIMESTAMPTZ NOT NULL,
  outcome          TEXT NOT NULL CHECK (outcome IN ('terminated', 'declined')),
  published_at     TIMESTAMPTZ,          -- the public explanation, when made
  publication_ref  TEXT
);
```

The narrowest-action rule as a query: pass-through mitigations that went past an interstitial or a forward without an order or a review behind them.

```sql
SELECT m.id, m.case_id, m.action, c.code
FROM abuse_mitigations m
JOIN aup_categories c ON c.id = m.aup_category_id
LEFT JOIN moderation_cases mc ON mc.id = m.case_id
LEFT JOIN termination_reviews t ON t.case_id = m.case_id
WHERE m.service_tier = 'pass_through'
  AND m.action IN ('proxy_disabled', 'account_terminated')
  AND mc.legal_notice_id IS NULL         -- no order
  AND t.id IS NULL                       -- no recorded review
  AND c.code NOT IN ('phishing', 'malware', 'ddos_origin', 'sanctioned_party', 'csam');
```

Notes on the sketch:

- **The tier lives on the resource,** because one account holds a hosted bucket and a proxied zone, and the same report category leads to different actions on each.
- **The AUP is data.** Report categories, the clause a notice cites, the default action per tier, whether automation may act, and the DSA reporting category are one versioned row ([Rules as Data](/docs/architecture/rules-as-data#what-belongs-in-data)), so the desk, the notice and the transparency report agree.
- **Automation is marked.** `automated` on each mitigation separates machine actions from reviewed ones, for the transparency report and for audits of false positives.
- **Exceptions are rare and recorded.** A termination outside the ladder needs a `termination_reviews` row with a threshold, a decider and the text that will be published.
- **Events:** `abuse_mitigation.applied` (with tier and automated flag), `termination_review.decided` and `aup_category.versioned` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the edge and DNS control planes, support and the transparency job.

## Auditing

- **Every action with its tier, category and clause,** so a customer, a regulator or a court sees which rule applied and why a pass-through customer was treated differently from a hosted one.
- **Automated versus reviewed,** with the false-positive rate from lifted mitigations, because automation is only defensible if its errors are measured.
- **Related-account actions,** with the link that justified each, so a fan-out can be unwound when a link proves wrong.
- **Termination reviews,** complete with the published rationale.
- **Transparency counts as queries** over these rows ([Making the Report a Query](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query)).

## What This Means for the System You Build

- **Classify every product as hosted, pass-through or core,** and record the tier on the resource.
- **Write the AUP as the abuse desk's category list,** with the clause, the default action per tier and whether automation may act.
- **On pass-through, forward content complaints** to the origin host and act yourself only for phishing, malware, attacks, sanctions, illegal content and orders.
- **Treat a core-service block as global** and challenge orders that would make it so.
- **Put voluntary terminations behind a written threshold,** a decider above the desk and a public reason.
- **Automate structured matches and related-account fan-out,** and measure the errors.
- **Attribute by the reported instant and act at the narrowest layer,** as the UGP abuse desks chapter describes.

## References

**Provider policies and reports**

- [Cloudflare: Cloudflare's abuse policies and approach](https://blog.cloudflare.com/cloudflares-abuse-policies-and-approach/), August 31, 2022 (modified July 15, 2026), hosted, pass-through and core services, the telephone analogy, legal process over popular opinion
- [Cloudflare: Transparency report H2 2025, abuse](https://cfl.re/h2-2025-transparency-report-abuse), hosted-product reports and actions, automated actioning, related R2 accounts, interstitials, resolver orders, voluntary terminations
- [Cloudflare: Why we terminated Daily Stormer](https://blog.cloudflare.com/why-we-terminated-daily-stormer/), August 16, 2017
- [Cloudflare: Terminating service for 8chan](https://blog.cloudflare.com/terminating-service-for-8chan/), August 5, 2019
- [Cloudflare: Blocking Kiwifarms](https://blog.cloudflare.com/kiwifarms-blocked/), September 3, 2022
- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), risk factors on customer content and the two decisions named
- [AWS: Acceptable Use Policy](https://aws.amazon.com/aup/), prohibited uses, security violations, the remedy clause and cooperation
- [Akamai: EU DSA transparency report](https://akamai.com/site/en/documents/corporate/2025/akamai-dsa-transparency-report.pdf), February 28, 2025, caching and hosting status and Member State orders
- [Google Cloud: Free cloud features and trial](https://docs.cloud.google.com/free/docs/free-cloud-features), no cryptocurrency mining during the free trial
- [Google Cloud: Terms of Service (July 1, 2025 version)](https://cloud.google.com/legal/archive/terms/index-20250701), cryptocurrency mining without prior written approval
- [Spectrum: Residential Internet use policy](https://www.spectrum.com/policies/internet-use-policy), open SMTP and open proxies listed as abuse of resources
- [GitHub: Terms for additional products and features](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features), cryptomining among prohibited Actions uses

**Law**

- [Digital Services Act, Recital 29 (Official Journal text, springlex mirror)](https://www.springlex.eu/en/packages/dsa/dsa-regulation/recital-29/), examples of mere conduit, caching and hosting services
- [17 U.S.C. 512 (Cornell LII)](https://www.law.cornell.edu/uscode/text/17/512), the conduit, caching and hosting safe harbors
