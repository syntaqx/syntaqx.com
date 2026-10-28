+++
title = "New gTLDs & ccTLDs"
description = "How top-level domains multiplied, the 2026 application round, registry economics from Verisign's filings, ccTLD rules outside ICANN, and the .ai and .io cases."
category = "Hosting & Cloud Industry"
order = 2168
part = "Domains and DNS"
tags = ["domains", "gtlds", "cctlds", "icann", "registries", "pricing"]
+++

A registrar sells names in hundreds of top-level domains, and each one is a separate supplier with its own contract, price list, launch calendar and rules about who may register. The generic ones (.com, .shop, .xyz, a bank's brand) sit under ICANN's registry agreements and inherit the same baseline: accredited registrars only, the same rights protection mechanisms, the same abuse duties. The country-code ones (.de, .uk, .ai, .io) sit outside ICANN's contracts entirely and run on national rules, their own registrar accreditation and their own dispute policies. To the customer they are all a dropdown in a search box; to the registrar they are integrations and policies that each have to be modeled.

This chapter covers where the TLDs came from, the 2026 application round that is under way as of October 2026, the economics of running a registry (with Verisign's filings as the only fully public set of numbers), how country-code TLDs differ for a registrar, and the two ccTLDs whose fortunes show the risks: .ai, which became a national revenue source, and .io, which could be retired with its country code. The contracts themselves are in [ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#the-contracts); the per-transaction fee stack is [The Fee Stack](/books/hosting-and-cloud/icann-registries-and-registrars#the-fee-stack).

## How the Providers Do It

Registries and the registrars that resell them, as of October 2026:

| Operator | Role | Scale | What shapes it |
| --- | --- | --- | --- |
| **Verisign** | Registry for .com and .net under its own agreements, not the base agreement | 173.5 million .com and .net names at 31 December 2025, 176.1 million at the end of the first quarter of 2026 | Wholesale price caps negotiated with ICANN and the US Department of Commerce; operates two of the thirteen root servers |
| **GoDaddy Registry** | Registry operator and back-end provider | "Approximately 170 registry TLDs", including ccTLDs such as .us and .tv, city TLDs such as .nyc and .sydney, and gTLDs such as .club, .health and .design | Back end for other operators' TLDs as well as its own; the same company is the largest registrar, with about 81 million domains under management |
| **Identity Digital** | Registry manager and service provider for ccTLDs | Manages .ai sales for Anguilla under an October 2024 agreement; registry service provider for .io through its UK subsidiary Internet Computer Bureau | Works under each government's or manager's terms, not an ICANN registry agreement |
| **DENIC** | Registry for .de, a cooperative | The second-largest ccTLD in Verisign's top ten | Registrars are DENIC members; a holder outside Germany must name a German recipient for service on request |
| **EURid** | Registry for .eu | One of the top ten ccTLDs | Eligibility tied to EU and EEA residence, extended to EU citizens living anywhere from 19 October 2019 |
| **Registry Services** (the .us administrator) | Registry for .us | Run within GoDaddy Registry's portfolio | US Nexus Requirements, enforced by spot checks that ask for documentary evidence |
| **Cloudflare Registrar** | Registrar | "Over 430 top-level domains" | Sells at "at or below what registries and ICANN charge us", so registry price changes reach the customer unmodified |

The table carries the chapter's main point: a registrar's catalog is a federation. A wholesale price set by Verisign under a federal cooperative agreement, a .Brand registry that sells to nobody, a cooperative that admits members, and a government that outsources sales to a US company all appear in the same search results, and only the first three have anything to do with ICANN.

## How It Got Here

**The first TLDs (October 1984).** RFC 920 set the initial top-level domains: GOV, EDU, COM, MIL and ORG as category domains, two-letter country codes from ISO 3166, ARPA as a temporary domain for existing hosts, and room for large "multiorganizations". Basing country codes on ISO 3166 solved the question of what counts as a country by deferring to an outside standard; the cost is that a TLD's existence depends on a list ICANN doesn't control, which is the .io problem forty years later.

**ccTLD delegation (March 1994).** RFC 1591 described the structure and the delegation rules: a designated manager is a "trustee" for the domain with "a duty to serve the community", significantly interested parties should agree on the manager, and a transfer of the trusteeship needs both the old and new organizations to assure IANA it is agreed. It is still the root of why ccTLDs answer to their communities and governments rather than to ICANN contracts.

**The first expansion (November 2000).** ICANN, formed in 1998, took 47 applications by its 2 October 2000 deadline and on 16 November 2000 selected seven for negotiation: .biz (JVTeam), .info (Afilias), .name (Global Name Registry), .pro (RegistryPro), .museum, .aero (SITA) and .coop. It solved nothing about .com's dominance, and it established that each new TLD is a negotiated contract.

**Sponsored TLDs (December 2003 to March 2004).** A request for proposals for sponsored TLDs, each tied to a defined community, ran from 15 December 2003 to 16 March 2004 and drew ten applications for nine strings: .asia, .cat, .jobs, .mail, .mobi, .post, .tel (two applicants), .travel and .xxx. Sponsorship gave each TLD an eligibility rule and a community to answer to; the cost was a registrar integration per TLD for a small market each.

**The 2012 round.** On 13 June 2012 ICANN revealed 1,930 applications: 911 from North America, 675 from Europe, 303 from Asia-Pacific, 24 from Latin America and the Caribbean and 17 from Africa, 116 of them for internationalized domain names. The round produced more than 1,200 new gTLDs, all on a common base registry agreement with standard specifications for rights protection, abuse, data and the registry code of conduct, plus a later Specification 13 for brand TLDs. It made a TLD a product category rather than an event, and it moved registrar engineering from a few integrations to hundreds.

**The 2026 round.** ICANN's Board approved a pre-evaluation program for registry service providers with a USD 92,000 fee on 28 June 2024, and the application window ran from 30 April to 12 August 2026 ([The 2026 Round](#the-2026-round)). Pre-evaluating back ends solves the 2012 round's repeated technical evaluation of the same few providers; prohibiting private auctions closes the market in contention settlements the 2012 round produced.

**Where it stands (June 2026).** Verisign's industry brief counted 401.6 million registrations across all TLDs at the end of the second quarter of 2026, up 2.3% on the quarter and 8.1% on the year: 166.6 million in .com and 12.5 million in .net, 148.6 million in ccTLDs, and 52.9 million in new gTLDs, which were 13.2% of all registrations. There were 1,265 gTLD extensions delegated in the root zone, including IDNs.

## The 2026 Round

As of October 2026 the round is between publication and evaluation:

| Milestone | Date | What happens |
| --- | --- | --- |
| Application window | 30 April to 12 August 2026 | Applications submitted in ICANN's TLD Application Management System (TAMS); IDNs available in 27 scripts |
| Paid applications | Confirmed 22 September 2026 | 1,616 paid applications proceed |
| Reveal Day | 7 October 2026, 18:00 UTC | ICANN publishes applied-for strings, applicants, public portions of applications and contention sets |
| Replacement period | 8 to 21 October 2026 | Applicants with an eligible second-choice string may switch |
| String Confirmation Day | 17 November 2026 | Final string list and contention sets; the community input and objections period opens |
| Withdrawal refund | Requests by 27 November 2026 | 65% of the evaluation fee |
| Community input and objections | 17 November 2026 to 16 March 2027 | Legal Rights and String Confusion objections administered by WIPO, Limited Public Interest and Community objections by the ICC |
| Prioritization draw | First half of 2027, not yet scheduled | Sets evaluation order; string evaluation results and contention resolution are not yet scheduled |

ICANN's round statistics, last published on 7 October 2026, count 481 applicants and 1,615 applications, all active; by applicant region, 198 from North America, 156 from Asia and the Pacific, 111 from Europe, 9 from Latin America and the Caribbean and 7 from Africa. Unique strings, contention sets and the split by TLD type (.Brand, community, geographic, IDN) were not yet published there as of October 2026. ICANN says the final numbers and types will be confirmed on String Confirmation Day.

**The fee.** The gTLD evaluation fee is USD 227,000 per application, with conditional evaluations (.Brand designation, geographic names, reserved names, registry commitments), objections and appeals charged on top; supported applicants pay reduced fees. ICANN announced 227,000 as the "expected" fee in September 2024, and the applicant materials of January 2026 state it as the fee applicants must pay.

**Contention.** Unlike 2012, private auctions and other private resolutions are not permitted: from Reveal Day until contention is resolved, applicants in the same set may not discuss settlements or post-auction transfers. Contention ends in ICANN's own auction or Community Priority Evaluation.

What a registrar does with this: nothing until delegation, then a launch. Each new TLD that reaches the root arrives with a sunrise period for trademark holders, a claims period, and general availability, and each is a new integration under the same base agreement ([Launch Phases](#launch-phases)). The 333 .Brand applications mostly won't sell to the public at all.

## Registry Economics

Verisign is the only registry with full public financials, and its 2025 Form 10-K is the best view of what a large registry is:

| Measure | Figure |
| --- | --- |
| .com and .net names, 31 December 2025 | 173.5 million, up 2.6% |
| New .com and .net registrations | 41.7 million in 2025, 37.4 million in 2024 |
| Renewal rate | 75.4% in the third quarter of 2025, against 72.2% a year earlier; final rates take 45 days after quarter end to measure |
| Revenue | $1,656.6 million in 2025, up 6% |
| Operating income | $1,121.0 million, up 6%, about 68% of revenue |
| Employees | 928 at 31 December 2025 |

**The price is regulated.** The .com wholesale fee rose from $9.59 to $10.26 on 1 September 2024. On 23 April 2026 Verisign announced a rise to $10.97 effective 1 November 2026. The rule behind it is Amendment 35 to Verisign's cooperative agreement with the Department of Commerce (26 October 2018): Verisign and ICANN may raise the .com maximum price by up to 7% over the prior year's highest price in each of the last four years of every six-year period (2020 to 2023, 2026 to 2029, and so on), and the current period began 26 October 2024. The .com registry agreement must be renewed by 30 November 2030. For .net the fee rose from $9.92 to $10.91 on 1 February 2024, and that agreement allows increases of 10% a year through 30 June 2029. A registrar sees each of these as a new registry price version with notice ([How to Build It](#how-to-build-it)).

**ICANN's cut.** Verisign pays ICANN $0.2575 for each annual .com registration, quarterly, and remits $0.75 per annual .net registration that it collects from registrars. Registries on the base agreement pay a fixed USD 6,250 a calendar quarter plus USD 0.25 per transaction (each annual increment of a registration, renewal or transfer), the transaction fee applying once a TLD exceeds 50,000 transactions in a quarter or in any four consecutive quarters. Registrars pay ICANN their own per-name fee on top ([The Fee Stack](/books/hosting-and-cloud/icann-registries-and-registrars#the-fee-stack)).

**New gTLDs renew far worse.** Verisign's industry brief for the second quarter of 2026 puts the preliminary .com and .net renewal rate at 75.2%, legacy gTLDs at 67.2% and new gTLDs at 31.0%, with .xyz at 17.5% and .shop at 14.2% among the largest. New gTLD registrations grew 34.0% year on year, so volume is real, but much of it is one-year, low-price or promotional registrations that don't renew. For a registrar that means first-year prices far below renewal prices, renewal notices that have to show the real renewal price, and churn that looks like abandonment rather than transfer.

**Back ends are a separate business.** Most TLDs are operated technically by a registry service provider rather than the brand on the contract: GoDaddy Registry runs or provides the back end for about 170 TLDs. The 2026 round's RSP pre-evaluation is the formal recognition of that layer. For a registrar, the back end decides the integration: TLDs on the same back end usually share an EPP endpoint style, extensions and quirks, which is why the `registries` table records `backend_operator` separately from `operator`.

### Launch Phases

Every TLD under the base agreement launches through the Trademark Clearinghouse requirements in Specification 7:

- **Sunrise.** Registration restricted to trademark holders with a Signed Mark Data file from the Clearinghouse: at least 30 days before general registration for a start-date sunrise (with 30 days' notice before it starts), at least 60 days for an end-date sunrise.
- **Claims.** For at least the first 90 days of general registration, anyone trying to register a name matching a Clearinghouse mark gets a claims notice, and the mark holder is told if they go ahead; the sunrise and claims periods must not overlap. The registry may run claims longer, and may not shorten it once started.
- **General availability,** often preceded by an early-access period with declining premium prices, which the registry sets.

A .Brand TLD under Specification 13 is exempt from sunrise but must still run claims, and may not register names to third parties before the claims period starts.

### Code of Conduct and .Brand TLDs

Specification 9, the registry code of conduct, bars a registry and its affiliates from favoring particular registrars, from registering names in their own right except through an accredited registrar, from front-running searches, and from letting an affiliated registrar misuse registrant data. A registry can get an exemption if all registrations are for its own or its affiliates' exclusive use and the code isn't needed to protect the public interest.

Specification 13 makes that exemption automatic for a .Brand TLD: one whose string matches a registered trademark the operator owns and uses in a business other than registry services, where only the operator, its affiliates or trademark licensees register names and control their DNS, and which is not a generic string. It may designate up to three accredited registrars as its exclusive registrars, must certify its .Brand status to ICANN every year, and, if the agreement ends, ICANN can't delegate the string to a successor for two years without the operator's consent unless the public interest requires it. For a registrar, a .Brand is a corporate-services deal, not a retail TLD.

## ccTLDs

Country-code TLDs are the other 148.6 million names. At the end of June 2026 there were 316 ccTLD extensions delegated in the root zone, including IDNs; the top ten (.cn, .de, .uk, .ru, .nl, .br, .fr, .au, .in and .eu) held 57.2% of all ccTLD registrations, with recent quarterly renewal estimates from 82.5% for .eu to 72.7% for .ru.

What changes for a registrar:

| | gTLD under ICANN contract | ccTLD |
| --- | --- | --- |
| **Authority** | ICANN registry agreement and consensus policies | The manager's own rules and national law; RFC 1591's trusteeship |
| **Who may sell** | Any ICANN-accredited registrar that signs the registry-registrar agreement | Whoever the registry accredits: DENIC sells through its members, and other registries run their own accreditation |
| **Who may register** | Anyone, unless the TLD is restricted | Often a presence rule: .eu for EU and EEA residents and, since 19 October 2019, EU citizens anywhere; .us under nexus requirements with documentary spot checks; .de requires a non-German holder to name a German recipient for service within two weeks of DENIC's request |
| **Abuse duties** | RAA 3.18 and Specification 6 ([DNS Abuse at the Registrar](/books/hosting-and-cloud/dns-abuse#what-the-amendments-require)) | The registry's own policy |
| **Disputes** | UDRP and URS ([Domain Disputes](/books/hosting-and-cloud/domain-disputes#the-udrp)) | The ccTLD's own policy, which may or may not follow the UDRP |
| **Transfers, data, lifecycle** | ICANN's Transfer Policy, Registration Data Policy, ERRP | Local: transfer codes, data publication, grace periods and deletion rules differ per registry |
| **ICANN fees** | Per-name fees through registry and registrar | None per name |

Each of these differences is a branch in the registrar's code: an eligibility question at checkout, a document upload when a spot check arrives, a different transfer flow, a different expiry clock. The data model handles that by making the rules attributes of the registry, not code paths per TLD ([How to Build It](#how-to-build-it)).

## .ai and .io

The two ccTLDs that technology companies adopted as generic show both sides of building on a country's code.

**.ai (Anguilla).** Identity Digital has managed .ai registration sales under a five-year memorandum of understanding signed in October 2024, with the registry moved to its platform in January 2025; a former premier said the company would charge "a small percentage" of registration costs. Anguilla's .ai revenue reached EC$230.5 million (US$85.3 million) in 2025, according to Ministry of Finance figures reported by Anguilla Focus, against 86.83 million in 2023 and 104.25 million in 2024 (the paper gives those two without a currency), and above every projection in the draft 2025 estimates. In September 2025 the technology minister said the domain was expected to produce "nearly half" of government revenue that year; that was a projection, not an outturn. Registrations passed one million in January 2026. The lesson for registrars is concentration: a single government's policy, price and operator choice now set the terms for a TLD a large share of AI companies sit on.

**.io (British Indian Ocean Territory).** On 3 October 2024 the UK and Mauritius announced a treaty transferring sovereignty over the Chagos Archipelago. ICANN's position, as reported then, is that it "relies on the ISO 3166-1 standard" to decide what is an eligible ccTLD and that removal of the code "would trigger a 5-year retirement process"; the ISO record for IO had not changed since 2018. The ccNSO's retirement policy, sent to the ICANN Board in September 2021, starts on deletion of the alpha-2 code from ISO 3166-1, removes the ccTLD from the root five years after the manager is notified, and lets the manager request an extension with a Retirement Plan acceptable to the IANA functions operator. The treaty was signed and laid before Parliament on 22 May 2025, and the Parliament treaty record shows scrutiny concluded on 3 July 2025 and ministerial statements on the implementing bill on 13 and 14 April 2026, with no ratification or entry into force recorded. In the Commons on 13 April 2026 the minister said the UK "could not let the treaty enter into force without the support of the United States," that the US position "appears to have changed," and so "we cannot ratify the treaty"; the Diego Garcia Military Base and British Indian Ocean Territory Bill was shelved. As of October 2026 I found no public record of the IO code being deleted from ISO 3166-1, which is the event that would start the clock.

For a registrar, .io is a contingency to plan for rather than an event: names that would need migrating, customers to notify years ahead, and renewals sold beyond a possible removal date.

## The Alternatives

For a provider deciding where its own and its customers' names live:

| Option | Cost and effort | Control | Risk |
| --- | --- | --- | --- |
| **.com or another legacy gTLD** | A registry fee of about $11 a year for .com from November 2026 | None over the TLD; full portability across registrars | Regulated price rises of up to 7% a year in four of every six years |
| **A new gTLD** | Usually cheap to start; renewal prices vary widely | None; registry sets premium and renewal prices | Low renewal rates signal weak attachment; if a registry fails, the agreement's Continued Operations Instrument and an ICANN emergency operator keep the TLD running |
| **A ccTLD** | Varies; presence rules may exclude customers | None; national rules can change | Policy, operator or even the country code can change: .io |
| **Apply for a .Brand** | USD 227,000 evaluation fee per application, conditional evaluation fees, a back-end contract, ICANN's quarterly fee | Full: the operator decides every registration | A decade-long operating commitment; next chance is the next round |
| **Apply for a generic TLD to sell** | The same fees, plus marketing a registry business and possible ICANN auctions | Full over policy within the base agreement | New gTLD economics: high volume, low renewal |

## My Default

My default for a host or registrar is to sell broadly and own nothing at the TLD level: offer the gTLDs your customers ask for through one or two back-end-aware integrations, add ccTLDs only where you can actually meet the presence rules and local transfer flows, and pass registry prices through as versioned prices with the notice the registry gave you. I'd put a provider's own infrastructure names on .com or another legacy gTLD with registry lock, because portability and predictable pricing matter more than branding for names customers' DNS depends on.

I'd consider a .Brand application only for a company whose brand is the product and that wants names it can trust by construction (no third-party registrations, no typosquats inside the TLD), and that can carry a ten-year operating commitment for a string it won't sell. What would change the default for ccTLDs is a customer base concentrated in one country, where the national TLD is what customers expect and the presence rule is something the provider can verify at sign-up.

## How to Build It

The registry is already a row in `registries` ([ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#how-to-build-it)), and its wholesale prices are `tld_pricing` rows. This chapter adds the policy that decides who may register, when and through whom.

```sql
ALTER TABLE registries
  ADD COLUMN iso3166_code         CHAR(2),  -- ccTLDs: the ISO 3166-1 alpha-2 element it rests on
  ADD COLUMN eligibility          TEXT NOT NULL DEFAULT 'open' CHECK (eligibility IN ('open',
                                    'presence_required', 'community', 'brand_exclusive')),
  ADD COLUMN presence_rule        TEXT CHECK (presence_rule IN ('residence_or_citizenship',
                                    'nexus', 'local_recipient_on_request')),
  ADD COLUMN presence_check       TEXT CHECK (presence_check IN ('attestation',
                                    'documents_at_registration', 'spot_check')),
  ADD COLUMN policy_url           TEXT,     -- the registry's own rules
  ADD COLUMN dispute_policy       TEXT NOT NULL DEFAULT 'udrp_urs' CHECK (dispute_policy IN
                                    ('udrp_urs', 'udrp_only', 'registry_own')),
  ADD COLUMN code_of_conduct_exempt BOOLEAN NOT NULL DEFAULT FALSE,  -- Spec 13 or Spec 9 s.6
  ADD COLUMN exclusive_registrar_ids INT[],  -- Spec 13 s.5(ii): at most three, IANA ids
  ADD COLUMN sunrise_kind         TEXT CHECK (sunrise_kind IN ('start_date', 'end_date')),
  ADD COLUMN sunrise_during       TSTZRANGE,  -- >= 30 days (start-date) or 60 (end-date)
  ADD COLUMN claims_during        TSTZRANGE,  -- >= first 90 days of general availability
  ADD COLUMN general_availability_at TIMESTAMPTZ,
  ADD COLUMN retirement_notice_at TIMESTAMPTZ,  -- ccTLD retirement: the IANA notice
  ADD COLUMN removal_due_at       TIMESTAMPTZ,  -- five years on, or the agreed plan's date
  ADD CONSTRAINT registries_cctld_code
    CHECK ((tld_type = 'cctld') = (iso3166_code IS NOT NULL)),
  ADD CONSTRAINT registries_presence_complete
    CHECK ((eligibility = 'presence_required') = (presence_rule IS NOT NULL)),
  ADD CONSTRAINT registries_brand_terms
    CHECK (tld_type <> 'brand_gtld' OR (eligibility = 'brand_exclusive'
           AND code_of_conduct_exempt AND sunrise_during IS NULL)),
  ADD CONSTRAINT registries_exclusive_registrars
    CHECK (exclusive_registrar_ids IS NULL OR cardinality(exclusive_registrar_ids) <= 3),
  ADD CONSTRAINT registries_launch_order
    CHECK (claims_during IS NULL OR sunrise_during IS NULL
           OR upper(sunrise_during) <= lower(claims_during)),
  ADD CONSTRAINT registries_retirement_order
    CHECK (removal_due_at IS NULL OR retirement_notice_at < removal_due_at);

-- A registry price change is a new tld_pricing version with the notice date, never an
-- edit: the .com rise announced on 23 April 2026, effective 1 November 2026 04:00 UTC.
INSERT INTO tld_pricing (tld, operation, price_tier, currency, amount, sku_id,
                         valid_during, announced_at)
SELECT 'com', op, 'standard', 'USD', 1097, s.id,
       tstzrange('2026-11-01 04:00:00+00', NULL), '2026-04-23 00:00:00+00'
FROM unnest(ARRAY['create', 'renew', 'auto_renew', 'transfer']) AS op
CROSS JOIN skus s
WHERE s.code = 'domain.com.registry_fee';
```

Notes on the sketch:

- **Rules are attributes, not branches.** Eligibility, presence, dispute policy and launch dates are columns the checkout, transfer and renewal flows read, so adding a TLD is a row and a back-end integration, not new code. Rules that change (a presence rule tightened, a claims period extended) are edits recorded in the audit trail, and a change that affects existing registrations (a new presence rule) queues re-verification of the affected names.
- **Evidence of presence belongs to the registrant.** The attestation or document that satisfies a presence rule is part of the registrant's immutable data in [Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-to-build-it); a spot check from a registry is a request with a deadline against that record.
- **Launch phases gate creation.** A create during `sunrise_during` requires a Signed Mark Data file; during `claims_during` the registrar must show the claims notice and record acceptance before the EPP create; before `general_availability_at` only sunrise or early-access orders go through. These are checks in the create path, with the claims acceptance stored on the order.
- **.Brand constraints are enforced in data.** A brand TLD can't be marked open, can't have a sunrise, and can name at most three exclusive registrars; a registrar not in `exclusive_registrar_ids` never shows the TLD.
- **Prices follow the registry's notice.** The `tld_pricing` row carries `announced_at` from the registry's notice, and the customer-facing renewal price version derives from it, so customers' notice periods are measured from the right date (the playbook's [Subscriptions](/docs/payments/subscriptions#plan-changes-and-proration) for the plan side; [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice) for price-change notice). Amounts are minor units: 1097 is $10.97.
- **Retirement is a clock.** When a ccTLD gets a retirement notice, `retirement_notice_at` and `removal_due_at` drive customer notices years ahead and stop renewals past the removal date.
- **Events:** `registry.policy_changed`, `registry.price_announced`, `registry.launch_phase_started`, `registry.retirement_noticed` and `domain.presence_check_requested` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the storefront, the renewal notice service, the registrant data service and support.

## Auditing

- **Registry prices and their notice.** Every wholesale price version with the registry's announcement date and the customer price derived from it, since registrars are reconciled by registries and customers measure notice from what they were told.
- **Launch-phase registrations.** Every sunrise registration's Signed Mark Data reference and every claims notice shown and accepted, with timestamps, because these are what a trademark holder will ask about.
- **Presence evidence.** What each registrant attested or supplied for a restricted TLD, when, and how each registry spot check was answered.
- **Policy changes per TLD.** When eligibility, dispute or launch rules changed, who changed them, and which existing names were re-verified.
- **Retirement notices.** For any ccTLD under a retirement clock, every customer notice sent and every renewal refused past the removal date.

## What This Means for the System You Build

- **Treat each TLD as a supplier:** contract, back end, price list, launch calendar and policy are data on the registry row.
- **Gate creates on launch phases:** sunrise needs a mark file, claims needs a shown and accepted notice, before general availability.
- **Check eligibility at checkout and keep the evidence:** presence rules are verified against the registrant record and re-verified when a rule changes.
- **Pass registry prices through as versions:** with the registry's notice date, so a .com rise on 1 November 2026 reaches renewal notices correctly.
- **Expect new gTLDs not to renew:** show the real renewal price at sign-up and plan for churn.
- **Plan for ccTLD risk:** policy, operator or the country code itself can change; a retirement clock is years of customer notices.
- **Don't apply for a TLD by default:** a .Brand is a long operating commitment that suits only companies whose brand is the product.

## References

**Standards, contracts and policies**

- [RFC 920: Domain Requirements (October 1984)](https://www.rfc-editor.org/rfc/rfc920.html), the initial top-level domains and ISO 3166 country codes
- [RFC 1591: Domain Name System Structure and Delegation (March 1994)](https://www.rfc-editor.org/rfc/rfc1591.txt), ccTLD managers as trustees, interested parties, transfer of trusteeship
- [ICANN: Base gTLD Registry Agreement (as amended, 21 January 2024)](https://itp.cdn.icann.org/en/files/registry-agreements/base-registry-agreement-21-01-2024-en.html), Article 6.1 fees (USD 6,250 a quarter, USD 0.25 per transaction over 50,000), Specification 7 rights protection, Specification 9 code of conduct and exemption
- [ICANN: Specification 13, .Brand TLD Provisions](https://newgtlds.icann.org/sites/default/files/agreements/agreement-approved-specification-13-31jul17-en.pdf), the .Brand definition, code of conduct exemption, sunrise exemption with claims, up to three exclusive registrars, annual certification, two-year redelegation bar, the Continued Operations Instrument and emergency operator
- [ICANN: Trademark Clearinghouse Rights Protection Mechanism Requirements](https://newgtlds.icann.org/sites/default/files/rpm-requirements-14may14-en.pdf), sunrise minimums of 30 and 60 days, the 90-day claims period, non-overlap
- [ICANN: ccNSO Proposed Policy on the Retirement of ccTLDs](https://www.icann.org/en/public-comment/proceeding/ccnso-proposed-policy-on-the-retirement-of-cctlds-22-11-2021), the ISO 3166-1 deletion trigger, five-year removal, Retirement Plan extensions, transmission to the Board in September 2021
- [SEC: Verisign Amendment 35 to the Cooperative Agreement](https://www.sec.gov/Archives/edgar/data/1014473/000101447318000042/exhibit101-amendment35.htm), the 26 October 2018 effective date and the 7% rule in the last four years of each six-year period

**ICANN programs and announcements**

- [ICANN: Board preliminary report, 16 November 2000](https://www.icann.org/en/board-activities-and-meetings/materials/preliminary-report-organizational-meeting-of-the-icann-board-marina-del-rey-16-11-2000-en), 47 applications and the seven proposals selected
- [ICANN: Progress in process for introducing new sponsored top-level domains (19 March 2004)](https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en), the ten applications and RFP dates
- [ICANN: New gTLD Reveal Day, applied-for strings (13 June 2012)](https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en), 1,930 applications by region and 116 IDNs
- [ICANN: Approved resolutions, special Board meeting, 28 June 2024](https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-special-meeting-of-the-icann-board-28-06-2024-en), the RSP evaluation program and its USD 92,000 fee
- [ICANN: Expected evaluation fee for new gTLD applications (25 September 2024)](https://www.icann.org/en/blogs/details/icann-sets-expected-evaluation-fee-for-new-gtld-applications-in-the-next-round-25-09-2024-en), USD 227,000 as the expected fee
- [ICANN: 2026 Round Applicant Journey Overview (27 January 2026)](https://newgtldprogram.icann.org/sites/default/files/documents/2026-round-applicant-journey-27jan26-en.pdf), the USD 227,000 evaluation fee and conditional evaluations
- [ICANN: Application window opens for new gTLDs (30 April 2026)](https://www.icann.org/en/announcements/details/icann-opens-application-window-for-new-generic-top-level-domains-30-04-2026-en), window dates, TAMS, 27 scripts, more than 1,200 gTLDs from 2012, ICANN's formation in 1998
- [ICANN: 2026 Round applications revealed (7 October 2026)](https://www.icann.org/en/announcements/details/icann-reveals-2026-round-applications-for-new-generic-top-level-domains-07-10-2026-en), Reveal Day and the later milestones
- [ICANN: New gTLD Program statistics](https://newgtldprogram-aps.icann.org/statistics), last published 7 October 2026, 481 applicants and 1,615 applications, applicants by region, type and contention figures not yet published
- [Greenberg Traurig: ICANN announces Reveal Day and key deadlines (6 October 2026)](https://www.gtlaw.com/ar/insights/2026/10/icann-reveal-day-2026-new-gtld-application-deadlines), 1,616 paid applications, replacement window, refund, objection grounds and administrators, the private auction prohibition

**Registries and the market**

- [SEC: Verisign Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1014473/000101447326000006/vrsn-20251231.htm), domain base, new registrations, renewal rate, revenue, operating income, employees, .com and .net prices and caps, ICANN fees, root servers
- [SEC: Verisign first quarter 2026 results (23 April 2026)](https://www.sec.gov/Archives/edgar/data/0001014473/000101447326000019/q12026earningsrelease.htm), the .com rise to $10.97 effective 1 November 2026 and the 176.1 million domain base
- [DNIB: The Domain Name Industry Brief, Q2 2026](https://www.dnib.com/media/downloads/reports/domain-name-report-Q22026.pdf), 401.6 million registrations, gTLD and ccTLD counts, delegated extensions, top ten ccTLDs, renewal estimates
- [SEC: GoDaddy Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), about 170 registry TLDs and about 81 million domains under management
- [Cloudflare: Registrar](https://www.cloudflare.com/products/registrar/), at-cost pricing and over 430 TLDs

**ccTLDs**

- [DENIC: Domain Terms and Conditions](https://transit.secure.denic.de/fileadmin/documents/DENIC-Domainbedingungen_EN.pdf), registration through DENIC members and the German recipient for service within two weeks of a request
- [EURid: New eligibility criteria](https://eurid.eu/en/news/new-eligibility-criteria/), EU citizens anywhere eligible from 19 October 2019
- [Registry Services: Evidence Accepted for usTLD Nexus Checks](https://www.about.us/documents/policies/Evidence_Accepted_for_usTLD_Nexus_Checks.pdf), spot checks and documentary evidence per nexus category
- [Anguilla Focus: .ai domain surge brings EC$230m windfall (25 March 2026)](https://anguillafocus.com/ai-domain-surge-brings-ec230m-windfall-to-anguilla-in-2025/), 2023 to 2025 revenue, the projection, Identity Digital's agreement and migration, one million registrations
- [The Register: What happens to .io (10 October 2024)](https://www.theregister.com/2024/10/10/io_domain_uk_mauritius/), the treaty announcement, ICANN's reliance on ISO 3166-1, the five-year retirement process, Identity Digital as service provider
- [GOV.UK: UK/Mauritius Agreement concerning the Chagos Archipelago (CS Mauritius No.1/2025)](https://www.gov.uk/government/publications/ukmauritius-agreement-concerning-the-chagos-archipelago-including-diego-garcia-cs-mauritius-no12025), publication and presentation to Parliament in May 2025
- [Hansard: Diego Garcia Military Base and British Indian Ocean Territory Bill (13 April 2026)](https://hansard.parliament.uk/Commons/2026-04-13/debates/AFA6A427-7E20-4EBF-86D2-86BB3388B9FA/DiegoGarciaMilitaryBaseAndBritishIndianOceanTerritoryBill), the statement that the UK cannot ratify the treaty without US support and the shelved Bill
- [UK Parliament: Treaty record, CP 1334](https://api.parliament.uk/view/treaty/Qnu21Bgc), signed and laid 22 May 2025, scrutiny ended 3 July 2025, April 2026 statements, no ratification recorded
