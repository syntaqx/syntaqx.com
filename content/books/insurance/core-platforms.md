+++
title = "Core Platforms"
description = "Guidewire, Duck Creek, Majesco, Sapiens, Socotra, EIS, Insurity, OneShield and the life platforms: figures from filings, how each models products, build vs buy."
category = "Insurance Industry"
order = 2772
part = "Running the Platform"
tags = ["insurance", "core-systems", "policy-administration", "vendors", "build-vs-buy", "saas"]
+++

A core platform is the software that holds an insurer's policies, bills and claims: the system of record that the law, the auditors and the reinsurers ultimately ask about. A small number of vendors sell most of them to property and casualty carriers, a different set sells to life and annuity carriers, and a long tail of carriers runs systems they built themselves, some of them decades old. The vendor market has consolidated into private equity ownership over the last six years, with Guidewire the one large independent public company left, and the products have converged on the same shape: separate policy, billing and claims applications, a configurable product model, a rating engine, APIs, and cloud delivery.

This chapter surveys the platforms with figures from filings and the vendors' own pages, as of November 2026; compares how each models a product; separates the property and casualty platforms from the life and annuity ones; covers what the filings say about implementation; and sets out how I decide between building and buying. The architecture every one of them implements is [Insurance System Architecture](/books/insurance/insurance-system-architecture); moving onto one is [Replacing a Core System](/books/insurance/replacing-a-core-system). The agency-side systems (Applied, Vertafore, comparative raters) are in [Comparative Raters & Agency Systems](/books/insurance/comparative-raters-and-agency-systems), and the market context is in [Core Vendors](/books/insurance/insurance-landscape#core-vendors).

## How the Platforms Do It

As of November 2026:

| Vendor | Lines and products | Ownership | Figures from filings and vendor pages |
| --- | --- | --- | --- |
| **DXC Technology** | Life and annuity: Assure Life+, Assure Life & Wealth, Assure Ingenium, Assure Cyberlife, Assure wmA, Assure Integral, Assure New Business, Assure Product Engine, GraphTalk; P&C and reinsurance software; business process services | Public (NYSE) | Insurance Software & Services is one of three reportable segments: revenue $1,279 million in fiscal 2026 (ended March 31, 2026), up 5.4%, segment profit $129 million, a 10.1% margin; its page claims "1,000+" customers including "21 out of 25" of the world's leading insurers |
| **Duck Creek** | P&C: Policy, Rating, Billing, Claims, Underwriting; Distribution Management, portals, Reinsurance; Integration Hub; cloud delivery | Vista Equity Partners, acquisition completed March 30, 2023 at $19.00 a share, about $2.6 billion; delisted from Nasdaq | Last 10-K (fiscal 2022): revenue $302.9 million, subscription $153.5 million, professional services 35% of revenue, "over 150 insurance customers worldwide," about 83 using SaaS products, 1,883 employees |
| **EIS** | EIS OneSuite / CoreGentic: policy, billing, claims and customer management for group benefits, P&C, protection, life and annuity, and pet | Acquired by Amdocs (completed, announced November 3, 2026) for "approximately $340 million in cash" plus possible performance-based consideration | Amdocs describes it as "an AI-native core platform" with "an established global customer base" |
| **Equisoft** | Life and annuity: equisoft/manage policy administration, plus planning, analytics, CRM and data migration | Not stated on its site | "35+" policy administration clients and "350+" data migrations and front-end tool implementations (its figures) |
| **FAST** | Life and annuity policy administration components | Verisk, which "expanded our offerings to also serve life insurance and annuities through our 2019 acquisition of FAST" | Verisk's 10-K for 2025 |
| **Guidewire** | P&C: InsuranceSuite (PolicyCenter, ClaimCenter, BillingCenter, PricingCenter, UnderwritingCenter), InsuranceNow (US and Canada), Guidewire Cloud Platform on AWS, data and analytics products | Public (NYSE) | Fiscal 2026 (ended July 31, 2026): revenue $1,475.4 million, of which subscription and support $970.9 million (66%), license $234.6 million, services $269.9 million; ARR $1,237 million, up 19%; about 550 customers in 44 countries; 4,174 employees |
| **Insurity** | P&C: Ratio Policy AI, Ratio Content & Rating Engine, Pro Suite, Marine Suite, Workers' Comp Suite, Billing-as-a-Service, Premium Audit, Loss Control, SpatialKey | Private | "500+ Customers," "22 of the Top 25 P&C Carriers," "12 of the Top 15 Lloyd's Managing Agencies," "7 of the Top 10 U.S. MGAs" (its figures) |
| **Majesco** | Intelligent Core for P&C and for life, annuity and health; CoreConnect for P&C MGAs; Intelligent V3locity for retirement and pensions (from Vitech) | Taken private by entities affiliated with Thoma Bravo in a merger that closed September 21, 2020 at $16.00 a share; CVC funds took a minority stake when Majesco closed the Vitech acquisition, January 8, 2026 | The closing announcement cites "1000+ implementations" and more than 350 insurers, reinsurers and MGAs on its platform |
| **OneShield** | P&C: OneShield Enterprise (policy, billing, rating, claims) and Market Solutions, a core system "delivered as a managed service" for commercial and specialty carriers and MGAs | Not stated | "45+ global clients," "60+ lines of business supported" (its figures) |
| **Sapiens** | P&C (CoreSuite in North America, IDITSuite elsewhere, PolicyPro, BillingPro, ClaimsPro), life, pension and annuities, reinsurance, decision management | Advent International; take-private closed December 17, 2025 at $43.50 a share, an equity value of about $2.5 billion; delisted from Nasdaq and the Tel Aviv Stock Exchange | 2024 revenue $542.4 million (2023: $514.6 million); about 4,850 employees; more than 600 customers; 41.6% of revenue from North America (20-F for 2024) |
| **Socotra** | P&C policy administration and billing, configured in code and JSON, with a Java rating plugin | Private | Public developer documentation for its product model, rating, financials, events and webhooks |

Guidewire's 10-K names its P&C competitors as Duck Creek, Majesco, Origami Risk, Sapiens and DXC Technology, horizontal vendors SAP, Salesforce and ServiceNow, and customers' own systems. Duck Creek's last 10-K named Guidewire, Insurity, Majesco and Sapiens, Oracle, SAP and Pegasystems, outsourcers DXC, NTT Data and TCS, and in-house builds. The market is small enough that every vendor names the others.

## The Market in Filings

Guidewire is the only scaled P&C core vendor still filing a 10-K, and its numbers show the market's shift from license to subscription:

| Guidewire, fiscal year ended July 31 | 2026 | 2025 | Change |
| --- | --- | --- | --- |
| Subscription and support | $970.9M | $731.3M | +32.8% |
| License | $234.6M | $251.9M | −6.9% |
| Services | $269.9M | $219.2M | +23.1% |
| **Total revenue** | **$1,475.4M** | **$1,202.5M** | **+22.7%** |
| Subscription and support share | 65.8% | 60.8% | |
| Net income | $139.3M | $69.8M | |
| Revenue outside the US | $537.5M (36.4%) | $431.6M (35.9%) | |

The changes are my arithmetic from the 10-K's figures. Two derived numbers are worth having: revenue per customer is roughly $1,475.4 million ÷ 550 ≈ $2.7 million a year, and the ten largest customers were 21% of revenue (20% of ARR), so a typical InsuranceSuite customer is a carrier large enough to spend seven figures a year on its core before counting its own staff and its systems integrator. Services growing alongside subscription says the work of implementing and migrating (on-premises customers to cloud, in particular) is still a large part of the business.

The ownership changes, in order:

| Date | Event |
| --- | --- |
| September 21, 2020 | Majesco's take-private closes, $16.00 a share |
| March 30, 2023 | Vista Equity Partners completes its acquisition of Duck Creek, $19.00 a share, about $2.6 billion, a 64% premium to the 30-day volume-weighted average price |
| December 17, 2025 | Advent's acquisition of Sapiens closes, $43.50 a share, about $2.5 billion, about a 64% premium to the August 8, 2025 close |
| January 8, 2026 | Majesco closes its acquisition of Vitech (pension and benefits administration); CVC funds make a minority investment in Majesco |
| November 3, 2026 | Amdocs announces it has acquired EIS for about $340 million in cash plus possible earn-out |

For a buyer, a private owner means less disclosure (no 10-K risk factors, no revenue by product) and a different investment horizon; the contract's source code escrow, data export and exit terms carry more weight ([Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter)).

## How Each Models a Product

Every platform maps to the same core concepts ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)); the differences are in what is configuration and what is code.

| Core concept | Guidewire PolicyCenter | Socotra | Notes |
| --- | --- | --- | --- |
| Policy transaction | A job: Submission, Renewal, Policy Change, Cancellation, Reinstatement, Rewrite; "A policy can be created or modified only through the context of a policy transaction" | Transactions: issuance, change, cancellation, renewal, reversal; out-of-sequence handled by `aggregate` | Both make the transaction the only way to change a policy ([Endorsements, Renewals & the Policy Transaction Model](/books/insurance/endorsements-and-renewals)) |
| Product structure | Policy line, coverables, coverages, modifiers and questions, with LOB-specific generated API endpoints | Element hierarchy: `product`, `policyLine`, `exposureGroup`, `exposure`, `coverage`, with coverage terms as named types with options | [Products, Coverages & Forms](/books/insurance/products-and-coverages) |
| Risk | Coverable (vehicle, location, building) | Exposure | The core model's `risks` |
| Custom fields | Extensions in configuration | Data extensions per entity, each property "declared with a data type," with quantifiers `?`, `+` and `*` and validation (min, max, length, regex, options); transaction data changeable only in `draft` | |
| Forms | Form patterns, inferred by rule, never added directly | Configured documents | |
| Rating | Rating inside the job, multi-version quoting, rating overrides; PricingCenter as a separate application | A Java `RatePlugin` returning a `RatingSet` of charges per element and charge type | [How a Rate Is Built](/books/insurance/how-a-rate-is-built) |
| Configuration delivery | Product and code configuration in releases ("multiple releases each year" for InsuranceSuite) | A zip with a top-level `config.json`, optionally split into directories that "the system will merge ... into a single logical datamodel" | |
| Billing link | BillingCenter, a separate application | Charges sliced into installments by billing settings; a double-entry ledger | [Billing & Premium Finance](/books/insurance/billing-and-premium-finance) |

Duck Creek describes its Policy product as "business-led configuration and automated policy workflows" and Billing as "automated financial operations"; its developer-level product model isn't in documentation I could open, so I don't compare it at that level. <!-- source-gap: core-product-models | missing | public developer documentation of the product model for Duck Creek, Majesco, Sapiens, EIS, Insurity and OneShield at the level of Guidewire's and Socotra's | closes with: each vendor's public developer portal or product documentation opened (Guidewire's docs site also failed to render for this chapter; its terms come from pages cited in earlier chapters) | checked: 2026-11-10 --> The same is true of Majesco, Sapiens, EIS, Insurity and OneShield; their public pages describe modules, not models.

The useful distinction when evaluating any of them is **where the product lives**:

- **Configuration in a vendor tool,** edited by business analysts and deployed as releases: fast for changes the tool anticipates, slow and expensive for changes it doesn't.
- **Configuration as code and files,** versioned in the carrier's own repository and deployed by its pipeline (Socotra's model): reviewable and testable like software, but it needs engineers.
- **Content subscriptions,** where bureau forms and loss costs arrive as machine-readable content (Insurity's "Ratio Content & Rating Engine," ISO's electronic rating content): fewer manual circular updates, but a dependency on the content vendor's release timing ([Loss Costs and the Multiplier](/books/insurance/rate-and-form-filing#advisory-loss-costs-and-the-multiplier)).

## Life and Annuity Platforms

Life and annuity administration is a different market with different vendors (DXC's Assure family, FAST, Equisoft, Majesco's life suite, Sapiens' life, pension and annuity suite, EIS) because the record is different. A P&C policy is a one-year contract repriced at renewal; a life policy or annuity is a decades-long account with cash values, loans, riders, tax tests and beneficiary designations, computed monthly and valued for statutory reserves ([Life Products as Data](/books/insurance/life-products), [In-Force Administration](/books/insurance/in-force-administration)). The platform's job is as much a calculation engine as a record keeper, and its integrations are industry utilities: ACORD TXLife messages and DTCC position, activity and commission feeds ([ACORD & Data Standards](/books/insurance/acord-and-data-standards)).

The other difference is age. DXC's product list carries heritage names (Cyberlife, Ingenium, Integral) alongside "cloud evolution" versions, and Equisoft leads with data migration counts: the life market's core problem is blocks of policies sold decades ago on systems that still have to pay the death claim, which is why replacement there is usually conversion by block or consolidation onto an outsourcer ([Replacing a Core System](/books/insurance/replacing-a-core-system)).

## What the Filings Say About Implementation

The vendors' own risk disclosures are the most candid public statements about what a core implementation takes:

| Vendor | Statement |
| --- | --- |
| **Guidewire** (10-K fiscal 2026) | Implementation and testing "typically lasts six to 24 months or longer and unexpected implementation delays and difficulties can occur"; consequences "could include, and have included, monetary credits"; some services engagements "are based on a fixed fee"; sales cycles are "lengthy and unpredictable"; relies on systems integrators "certified on our software" for "deployment, migration, and on-going services" |
| **Sapiens** (20-F for 2024) | "Our solutions are delivered over periods of time ranging from several months to a few years"; the sales cycle for new customers "is typically one to two years"; fixed-price contracts "where our delivery requirements sometimes span more than one year" |
| **Duck Creek** (10-K fiscal 2022) | A sales cycle of "approximately twelve to fifteen months" for a core system; "Unexpected delays and difficulties can occur as customers implement and test our solutions"; 23 systems integrator partners including Accenture, Capgemini, Cognizant and EY |

Read together: a year to choose, six months to several years to implement, a systems integrator in the middle, and fixed-fee contracts that put margin at risk on both sides. A carrier's plan that assumes less than that has to explain why.

## Build or Buy

My rule: buy the system of record for a standard line in a standard regime, build what differentiates, and own the data either way.

| Factor | Points to buy | Points to build |
| --- | --- | --- |
| Lines and states | Many standard lines across many states, bureau forms and loss costs | One or two lines, or a product nobody else sells |
| Change rate | Changes follow filings and bureau circulars | Pricing or underwriting that changes weekly and is the business |
| Regulatory surface | Many states' notice, cancellation and claim clock rules already modeled | A narrow surface the team can model itself |
| Team | Configuration analysts and an integrator market exist for the vendor | A strong engineering team that will still be there in ten years |
| Life and annuity | Almost always: decades of calculations, tax tests and valuations | Rarely |

A company that builds its own core is betting that the product and the channel are the advantage and that no vendor's model will fit them. A carrier buying a platform is betting that its advantage is elsewhere: underwriting, claims, distribution or capital. Either way, three things stay with the carrier, outside any vendor's database: the product catalog and its filings ([Filing Rates & Forms](/books/insurance/rate-and-form-filing)), the state rulebook as data ([The Rulebook as Data](/books/insurance/the-state-system#the-rulebook-as-data)), and a copy of every policy, transaction and claim in its own warehouse in its own model, because that copy is what makes the next replacement possible.

## How to Build It

The core model's extended-by table lists no new tables for this chapter; a platform is where the core tables live, not a new entity. What a carrier adds when a vendor platform is the system of record is the mapping between the vendor's identifiers and its own, kept outside the vendor:

```sql
ALTER TABLE policies
  ADD COLUMN system_of_record TEXT NOT NULL DEFAULT 'core',  -- 'guidewire_pc', 'legacy_as400', ...
  ADD COLUMN external_ref     TEXT;          -- the platform's own policy identifier

ALTER TABLE claims
  ADD COLUMN system_of_record TEXT NOT NULL DEFAULT 'core',
  ADD COLUMN external_ref     TEXT;

CREATE UNIQUE INDEX CONCURRENTLY policies_external ON policies (system_of_record, external_ref)
  WHERE external_ref IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY claims_external ON claims (system_of_record, external_ref)
  WHERE external_ref IS NOT NULL;
```

The full crosswalk for a migration, with field-level mappings and batches, is `conversion_mappings` in [Replacing a Core System](/books/insurance/replacing-a-core-system#how-to-build-it). Design choices that matter:

- **The carrier's model is the warehouse's model.** Vendor data is mapped into the core model's tables nightly or by event, never queried in the vendor's schema by analysts and reports.
- **System of record per policy and claim,** because during a replacement two platforms are each the record for part of the book.
- **Vendor IDs are attributes, not keys,** so moving vendors doesn't rekey history.

## Auditing

- **Every policy and claim names its system of record** on every date, including during conversion.
- **Warehouse totals reconcile to the platform:** policies in force, written premium and open reserves by entity and state.
- **Exit terms are tested:** a full data export in a documented format has actually been produced and loaded somewhere else.
- **Vendor releases are versioned in the product catalog,** so a change in rating or forms behavior is traceable to a release.

## What This Means for the System You Build

- **Expect policy, billing and claims as separate applications** from any vendor, and design the integrations as such.
- **Compare products by where the product model lives:** vendor tool, code and files, or content subscription.
- **Plan for a year to choose and six months to years to implement,** with a systems integrator, as the vendors' own filings say.
- **Separate life and annuity platform choices** from P&C; they are different markets with different calculation engines.
- **Keep the catalog, the rulebook and a full copy of the data outside the vendor,** in your own model.

## References

**Filings**

- [Guidewire Software: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), products, revenue by type, ARR, customers, employees, competitors, implementation duration, credits, fixed fees and systems integrators
- [Duck Creek Technologies: Form 10-K for fiscal 2022](https://www.sec.gov/Archives/edgar/data/1160951/000095017022020470/dct-20220831.htm), products, revenue, customers, SaaS, sales cycle, implementation risk, competitors and systems integrators
- [Duck Creek: Form 8-K exhibit, January 9, 2023](https://www.sec.gov/Archives/edgar/data/1160951/000119312523004161/d442317dex991.htm), the Vista agreement at $19.00 a share and the premium
- [Duck Creek: Form 8-K exhibit, March 30, 2023](https://www.sec.gov/Archives/edgar/data/1160951/000114036123014664/brhc10050562_ex99-1.htm), completion and delisting
- [Majesco: Form 8-K, September 21, 2020](https://www.sec.gov/Archives/edgar/data/1626853/000121390020027486/ea127128-8k_majesco.htm), the merger with Thoma Bravo affiliates closing at $16.00 a share
- [Sapiens International: Form 6-K exhibit, August 13, 2025](https://www.sec.gov/Archives/edgar/data/885740/000121390025075257/ea025288001ex99-1_sapiens.htm), the Advent agreement, price, equity value and customers
- [Sapiens International: Form 6-K exhibit, December 17, 2025](https://www.sec.gov/Archives/edgar/data/885740/000121390025122732/ea026966501ex99-1_sapiens.htm), closing and delisting
- [Sapiens International: Form 20-F for 2024](https://www.sec.gov/Archives/edgar/data/885740/000101376225003193/ea0235334-20f_sapiens.htm), revenue, employees, customers, regions, products, delivery periods and sales cycle
- [Amdocs: Form 6-K exhibit, November 3, 2026](https://www.sec.gov/Archives/edgar/data/1062579/000119312526445966/d28441dex991.htm), the acquisition of EIS
- [DXC Technology: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1688568/000168856826000022/dxc-20260331.htm), the Insurance Software & Services segment, revenue and profit
- [Verisk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1442145/000143774926004452/vrsk20251231_10k.htm), FAST and life and annuities

**Vendor documentation**

- [Duck Creek: Products](https://www.duckcreek.com/products/), core products, platform and Integration Hub
- [Majesco: Newsroom](https://www.majesco.com/newsroom/), current product names and the Vitech announcement
- [Majesco: Majesco closes acquisition of Vitech, January 8, 2026](https://www.majesco.com/press/majesco-closes-acquisition-of-vitech/), Vitech's business, implementations and CVC's minority investment
- [EIS](https://www.eisgroup.com/), OneSuite modules and lines, now part of Amdocs
- [Insurity: About](https://www.insurity.com/about-us/), customers and products
- [OneShield: About](https://www.oneshield.com/about/), Enterprise and Market Solutions, clients and lines
- [DXC: Life and annuity](https://dxc.com/us/en/industries/insurance/life-annuity), the Assure products and customer claims
- [Equisoft](https://www.equisoft.com/), equisoft/manage and migration counts
- [Socotra: Policy elements](https://docs.socotra.com/features/policy-management/policy-elements), the element hierarchy and coverage terms
- [Socotra: Data extensions](https://docs.socotra.com/configuration/data-extensions/overview), typed properties, quantifiers and validation
- [Socotra: Deployment](https://docs.socotra.com/docs/configuration/general-topics/deployment), configuration as a zip merged into one data model
- [Socotra: Rating plugin](https://docs.socotra.com/configuration/plugins/rating), the Java rating plugin
- [Socotra: Transactions and billing](https://docs.socotra.com/learning/transactions-and-billing), transaction types and billing
- [Guidewire: Overview of modifying jobs (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/123-PCpolicies/00-overview-of-modifying-jobs/c_overview_of_modifying_jobs.html), jobs as the only way to change a policy and the LOB-specific endpoints
