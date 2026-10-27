+++
title = "Revenue Management & Pricing"
description = "Asking rents, lease-term and renewal pricing, market data, rent caps in the engine, and the algorithmic pricing cases and laws as design constraints."
category = "Property Tech Industry"
order = 1710
part = "Leasing"
tags = ["property-tech", "revenue-management", "pricing", "antitrust", "rent-control", "renewals"]
+++

Every vacant unit has a price on every day, for every lease term and every move-in date, and every expiring lease needs a renewal offer months before it ends. A 300-unit community with a dozen lease terms and a 60-day move-in window has tens of thousands of possible quotes, and most of them change daily as applications arrive, notices are given and units come back from make-ready. Revenue management is the software that turns that into numbers an agent can quote and a website can show: a recommended asking rent per unit, term and date; a premium or discount that steers lease expirations away from months that are hard to re-lease; and a renewal offer per household, priced against the likelihood that they stay. Small portfolios price by hand from comparables; large operators mostly run software, and that software is now the subject of a federal antitrust case, renter class actions against two vendors and their customers, a run of state attorney general suits and more than a dozen state and city laws.

That record is the reason this chapter is built around constraints. What the law has objected to is not pricing software but pricing software that pools competitors' nonpublic data, pulls competitors' prices toward one another, or makes it costly for an operator to deviate. The terms a court entered against the largest vendor in May 2026 read like a design specification, and I treat them as one: where a pricing engine may get its data, how old training data must be, how narrow a model's geography may be, who sets the bounds and the auto-accept rules, and what has to be logged so a monitor can check it. This chapter covers what gets priced, lease-term and renewal pricing, the inputs and the market data business, the antitrust record dated as of October 2026, the state and city laws, the controls an operator owes on its own side, and rent caps encoded in the engine. Where the quote goes next is [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing) (the advertised price), [Applications & Screening](/books/property-tech/applications-and-screening) (the income test against it) and [The Lease](/books/property-tech/the-lease) (the signed rent and the renewal). Nothing here is legal advice, and the legal status of every case and law below is as of October 2026.

## How the Platforms Do It

The large suites and a few specialists sell pricing, and their public pages now lead with data sources and control as much as with revenue:

| Vendor | What it sells | What its page says about inputs and control |
| --- | --- | --- |
| **Entrata** | Revenue Intelligence: rate and lease-term recommendations, renewal pricing with predicted likelihood to renew, a rent control feature | The analysis "relies exclusively on your property's data and publicly available information"; operators can remove competitors "or other inputs" from suggestions; each recommendation carries "explainable reasoning tied back to your forecast and configuration inputs" |
| **RealPage** | AI Revenue Management: new-lease and renewal pricing, lease-ups, concessions strategy; works with most property management systems | "You have the final say on apartment pricing recommendations"; "built on a clear federal compliance framework"; a customer-reported claim of revenue outperformance "by up to 7%" |
| **AppFolio** | Leasing Signals, an add-on or part of its top plan, with automated suggestions for units and renewals | "Automatically aggregate public information on comparable units," and public-data features "are not available in all jurisdictions" |
| **Yardi** | Revenue IQ (formerly RENTmaximizer), the product at issue in the Duffy case below | Yardi's public position is that the software does not use confidential competitor data in its recommendations |

Two things stand out. First, every vendor now describes its inputs as **own data plus public data**, which is the line the Final Judgment and several statutes draw; the 2026 marketing is the antitrust record restated as features. Second, AppFolio's note that public-data features aren't available everywhere shows the next line: some jurisdictions restrict algorithms that use competitor data whether or not it's public, so the inputs a property may use depend on where it sits. A platform that treats "which data may price this unit" as configuration per jurisdiction can follow both.

Around the pricing engines sit the **market data businesses**: Yardi Matrix, which builds property-level data from "original field research" plus "aggregated & anonymized operating data from the Yardi property management platform," and RealPage Market Analytics, which describes "30+ year historical data" updated daily and "publicly available property data" (asking rents, concessions) gathered daily, with five-year forecasts. Market data is a legitimate input and a normal product, and asset managers buy it too ([Market Data and Benchmarks](/books/property-tech/investors-and-asset-management#market-data-and-benchmarks)); whether a particular feed is public, licensed or pooled from competitors' operations is the question the rest of this chapter keeps asking. Student housing prices by the bed against an academic-year pre-leasing curve, which [Student Housing](/books/property-tech/student-housing#per-bed-pricing-and-the-pre-leasing-curve) covers.

## What Gets Priced

The unit of pricing is a **quote**: one unit, one lease term, one move-in date, one amount, valid until a stated time. Everything else is a rollup or a rule:

- **Base rent by unit.** A floor plan's base price adjusted by unit amenities (view, floor, renovation level, end unit) as premiums. Amenity premiums are data on the unit, so a renovated unit's price change is explainable as "the premium changed," not "the model moved."
- **Lease-term pricing.** A 12-month lease is the reference; shorter and longer terms carry premiums or discounts. The purpose is less the term itself than the **expiration month** it produces: a lease that would expire in December, when few people move, is priced up so the household picks a term that ends in a busier month.
- **Move-in date.** A unit available today and one available in six weeks have different prices because the vacancy days differ. The quote fixes the date it was priced for.
- **Concessions.** A free month or a discount to sign. The industry compares rents on a **net effective** basis (the concession spread over the term; [Rent: GPR, Loss to Lease and Effective Rent](/books/property-tech/operating-metrics#rent-gpr-loss-to-lease-and-effective-rent)), and the listing, the lease and the ledger all have to agree on whether a number is gross or net. Fee-transparency rules on advertising concessions are in [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing); the concession terms are in [The Lease](/books/property-tech/the-lease#concessions) and the postings in [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#concessions).
- **Renewals.** A per-household offer, priced separately (below).

**Exposure** drives most of it: the units vacant or on notice and not yet leased over a horizon of weeks, as [Occupancy, Leased and Exposure](/books/property-tech/operating-metrics#occupancy-leased-and-exposure) defines it. When exposure rises, recommended prices fall; when a floor plan is nearly full, they rise. That forecast is also what marketing uses to decide where to spend ([Exposure-Driven Spend](/books/property-tech/listings-and-marketing#exposure-driven-spend)), and it is the same model, under the same data rules, whichever team reads it.

A quote is a hold-like promise: an agent quotes a price, the prospect applies two days later, and the application's income test is a ratio to that rent. My rule: the quote is a row with an expiry, and the application and the lease carry its id, so "what were they quoted, and was it still valid" is a join, not a recollection ([Reservations & Holds](/docs/architecture/reservations-and-holds#hold-lifetimes-are-policy)).

## Renewal Pricing

A renewal offer prices the household that already lives there. The models estimate how likely the household is to renew at a given increase, and the offer weighs the increase against the cost of a turn (vacancy days, make-ready, leasing cost; [Renewals and Turnover](/books/property-tech/operating-metrics#renewals-and-turnover)). The constraints are mostly legal and procedural:

- **The cap comes first.** Where a rent cap or rent stabilization applies, the offer is clamped to the legal maximum before the household sees it (below).
- **The notice period sets the deadline.** Offers have to reach the household before the notice period for an increase begins, and several states key that period to the size of the increase or the length of the tenancy; [The Lease](/books/property-tech/the-lease#renewals) has the table. The pricing run therefore works backwards from each expiration: compute the notice deadline, price before it, send before it.
- **Good cause laws make the offer evidence.** Where a landlord needs cause not to renew, a reasonable offer the household refused can itself be the cause, so the offer, its amount and its delivery are records ([Good Cause Laws](/books/property-tech/the-lease#good-cause-laws)).
- **Several terms, one decision.** Operators commonly offer a menu (say 6, 12 and 15 months) with different increases. Each is an offer row; the household's acceptance points at one.

The operating measure is **trade-out**: the new rent against the rent it replaces, for new leases and renewals separately. [Trade-Out](/books/property-tech/operating-metrics#trade-out) defines it; this chapter's job is to store the inputs so trade-out can be computed from records rather than spreadsheets.

## Inputs: Own, Public and Pooled Data

A pricing engine's data falls into four kinds, and the law treats them differently:

| Kind | Examples | Where the law has drawn lines |
| --- | --- | --- |
| **The operator's own data** | Its leases, renewals, applications, traffic, notices, concessions | Freely usable for its own prices |
| **Public data** | Asking rents and concessions posted on listing sites and property websites | Allowed by the Final Judgment, Connecticut and several ordinances; not distinguished from nonpublic data by California's AB 325 or New York's S.7882 |
| **Licensed market data** | Surveys, field research, aggregated datasets from a data vendor | Depends on how it was built: field research of public facts differs from aggregated operating data contributed by competitors |
| **Pooled nonpublic data** | Competitors' executed rents, lease terms, occupancy, traffic | The core of every case below; barred at runtime by the Final Judgment and by most of the laws |

The difference between asking and executed rent matters most. An asking rent on a website is what a competitor is willing to publish; an executed rent, with its concession and term, is what it actually agreed, and that is the data the M.D.N.C. complaint describes landlords contributing "effective rents net of discounts, lease terms, lease status, occupancy, unit characteristics, and information on prospective renters," with the pool alleged to reach over 16 million units, including many that do not use the pricing product (allegations, not findings). Benchmarking dashboards that compare a property with its competitors run on the same kind of data, which is why the court treated the property management system and the benchmarking products as part of the alleged exchange; [Operating Metrics](/books/property-tech/operating-metrics#benchmarking-as-an-information-exchange-risk) covers benchmarking as an information-exchange risk.

**Market surveys** deserve their own line. A survey (a "call-around") is staff phoning or emailing competing properties for their current rents and concessions. The Final Judgment bars the vendor from conducting new ones for use in its pricing products. An operator's own leasing staff checking competitors' public websites is a different act from collecting their nonpublic numbers by phone, and my rule is to record which one each survey row was.

## The Antitrust Record, as of October 2026

### United States v. RealPage

The Department of Justice and eight states sued RealPage on August 23, 2024 in the Middle District of North Carolina (No. 1:24-cv-00710), under Sections 1 and 2 of the Sherman Act, and later added landlords as defendants. Washington withdrew on February 25, 2025 to file its own case. On November 24, 2025 the Antitrust Division filed a proposed settlement with RealPage, with no fine and no admission; RealPage said it "codifies product modifications" it had begun implementing more than a year earlier. Under the Tunney Act, the proposed Final Judgment (Doc. 159-1) was published in the Federal Register on December 5, 2025 for public comment, and the United States filed its response to eight comments on April 30, 2026, saying it would then move for entry. The court's September 30, 2026 opinion records that it entered the **Final Judgment on May 19, 2026** (Doc. 194); as of October 2026 the Antitrust Division's case page posts only the proposed version, so the terms below are quoted from the proposed judgment and its Competitive Impact Statement. The judgment expires seven years after entry, and after four the United States may end it by notice to the court.

The Final Judgment resolves only the United States' claims against RealPage. In an opinion of September 30, 2026 (Doc. 223), the court denied RealPage's motion to dismiss and the remaining landlords' motions, holding that the complaint states claims under Sections 1 and 2 and the related state laws, and that the Final Judgment does not moot the states' claims: it lapses on a fixed date, it reaches only products that generate prices (not the property management system or benchmarking products alleged to carry the exchange), and it gives the states no relief. The United States and the states had entered final judgments with Cortland, Greystar and LivCor; the United States had entered consent decrees with Pinnacle and Willow Bridge that the court had not yet adopted. What remains is the states' case against RealPage and Pinnacle and all plaintiffs' claims against Camden and Willow Bridge.

### The Final Judgment as a checklist

The terms bind one vendor, but they are the most detailed public statement of what a lawful pricing product looks like, and an engine built to them is easier to defend under every law below. From the Competitive Impact Statement, by paragraph of the judgment:

| Area | Term | What it means for the system |
| --- | --- | --- |
| **Runtime** (IV.A.1, IV.B) | No competing properties' nonpublic data in runtime operation, the generation of a price for a floor plan or unit; the ceiling and floor may not use it either; covers competitor data a landlord enters itself from another source | Every recommendation records the data sources it read, and a guard rejects any source not cleared for runtime use |
| **Notice** (IV.A.2) | Tell landlords the vendor is not seeking competitors' nonpublic data | A product disclosure, versioned like any other |
| **Training age** (IV.A.3) | Nonpublic data in training only if at least 12 months old and not from active leases; data aged at least 16 months is deemed not from an active lease | Each training run records its data cutoff, and the cutoff is checked against the run date |
| **Price data in training** (IV.A.4) | No rental price data in training, including nonpublic "market rent" or "market rank," except renewal offers for the model that predicts renewal after an offer | Feature lists per model, reviewed |
| **Geography** (IV.A.5, IV.A.6) | The three existing models may use no geographic variable narrower than a state; future models trained on nonpublic data, none narrower than the nation; retrain if needed | Training geography is a recorded attribute of each model version |
| **Surrogate data** (IV.C) | Another owner's nonpublic data only for a property with under two years of its own history whose owner has no comparable property, only from a different CBSA, and never the same surrogate for different owners in one CBSA | A rule with inputs, and an audit trail of each use |
| **Surveys** (IV.D, IV.E) | No new market surveys; limited use of survey data collected before September 30, 2024 | A source type that can be retired by date |
| **Auto-accept** (V.A.1) | Any feature that applies recommendations automatically must be configured individually by each licensee or user | Auto-accept settings belong to a named user or licensee, never a vendor default |
| **Target leases, sold-out guardrail** (V.A.3, V.A.4) | No artificial cuts to the target number of leases; the guardrail that raises prices when a floor plan is full may not use competitor data | Guardrails are own-data rules, documented |
| **Symmetric bounds** (V.B) | Prices may go below the floor by the same percentage they may exceed the ceiling, and the landlord sets the percentage | One band percentage, set and owned by the landlord, applied both ways |
| **No compulsion** (V.C) | No requirement or incentive to accept recommendations; no impeding overrides | Overrides are one click with a reason; nothing in pricing, commissions or reports penalizes them |
| **New features** (V.D) | No new features relying on competitors' nonpublic data | A design review gate |
| **People** (VI.A, VI.B) | Pricing advisors may not disclose other owners' data; no discussion of nonpublic-data market trends or pricing strategy at user meetings | Advisory notes are records; user-group agendas are reviewed |
| **Oversight** (VII to IX) | A monitor chosen by the United States, at the vendor's expense, for three years from the workplan, extendable by up to 18 months; a compliance officer who audits features and surrogate data; annual certification; access to documents, training methods and source code | Everything above must be provable from logs, years later |

The decree also matters for operators: the court noted it runs to "persons in active concert or participation" with RealPage who receive notice, which is contempt exposure, not a separate injunction. Operators' own obligations come from their own settlements, below.

### State attorney general suits

The states' claims continue against RealPage in the federal case, and several states sued on their own: the District of Columbia (Camden among 14 owners or operators plus RealPage), Arizona (Camden among 12 plus RealPage), Washington (filed April 3, 2025 in King County against RealPage and twelve landlord entities) and Maryland (amended June 5, 2026 to add defendants including Camden), according to Camden's second-quarter 2026 10-Q and the Washington Attorney General. Greystar settled with nine states for $7 million: no revenue management product that uses external nonpublic data, uses Greystar's nonpublic data to price for others, or was trained on nonpublic data; no product with a rent floor or limit or a requirement to accept recommendations; no use of the then-current RealPage product unless RealPage settles with the states or a monitor certifies it; notice to the states of products adopted; a compliance program; five years. In October 2025, Kentucky, Maryland and New Jersey (and the District of Columbia, under seal) filed statements of interest in the class action below, warning that private settlements should not weaken their public enforcement.

### The class actions: MDL 3071

*In re RealPage, Inc., Rental Software Antitrust Litigation (No. II)*, M.D. Tenn. No. 3:23-md-3071, consolidates renter class actions. Landlords settled in two sets, $141.8 million preliminarily approved in November 2025 and $218.125 million in May 2026, for $359.925 million across 37 settlements and 41 settling owner and manager defendants; the court entered final approval on October 15, 2026, and the claims deadline is January 29, 2027. RealPage has not settled, and the claims against it continue. The settlements carry nonmonetary terms: Camden's 10-Q describes its $53.0 million settlement as including "provisions relating to the disclosure and use of non-public data" and other business-practice commitments.

### Duffy and Mach v. Yardi

*Duffy v. Yardi Systems*, W.D. Wash. No. 2:23-cv-01391-RSL (Judge Lasnik), alleges that Yardi's Revenue IQ exchanged nonpublic data among landlords. The court denied the motion to dismiss in December 2024, finding plausible per se allegations ("as technology has evolved, so too have methods of price fixing"), dismissed claims against ten nonresident property managers for lack of personal jurisdiction in March 2026, and on October 13, 2026 denied Yardi's motion for summary judgment and lifted the stay of discovery against landlords, expressing "no view on the ultimate merits." Yardi says its software does not use confidential competitor data and that it will continue to defend the case.

*Mach v. Yardi Systems*, a California state case under the Cartwright Act, went the other way: on October 20, 2025 the court granted summary judgment for the defendants, the first algorithmic price-fixing case to reach that stage. Discovery showed owners' data was used only for the owners' own recommendations, not to price competitors, and the court followed the Ninth Circuit's *Gibson v. Cendyn Group* (hotel revenue software), which held that common use of the same software is not by itself an agreement; *Gibson* was affirmed at 148 F.4th 1069 (9th Cir. 2025) and certiorari denied in 2026. Together the two Yardi cases state the defense precedent in design terms: an engine that can prove, from its own records, that one customer's data never priced another's is the strongest position a vendor has.

### What the agencies say

On March 1, 2024 the DOJ and FTC filed a statement of interest in *Duffy* stating that "it is per se illegal for competing landlords to jointly delegate key aspects of their pricing to a common algorithm, even if the landlords retain some authority to deviate from the algorithm's recommendations," and that competitors may not fix a starting point of pricing even if final prices vary. The agencies made the same points in a hotel case later that month. The implication for design is that "the operator has the final say" is necessary but not sufficient: if the inputs are pooled, the freedom to override doesn't cure them.

## State and City Laws

Legislatures moved faster than courts. As of October 2026:

| Jurisdiction | Instrument | Effective | Data covered | Remedy |
| --- | --- | --- | --- | --- |
| **California** | AB 325, amending the Cartwright Act | Signed October 6, 2025 | A "common pricing algorithm" used by two or more persons that uses competitor data; public and nonpublic not distinguished; bars use or distribution as part of a restraint, or to coerce adoption of its price | Cartwright Act; complaints need not allege facts excluding independent action |
| **New York** | S.7882, amending the Donnelly Act (signed October 16, 2025) | December 15, 2025; **preliminarily enjoined** | Setting rents or lease terms on recommendations from software performing a "coordinating function"; historical data included; public not distinguished | Up to $1 million for corporations; enforcement on hold |
| **Connecticut** | HB 8002, amending the Antitrust Act | January 1, 2026 | Revenue management devices using **nonpublic** competitor data; public data, aggregate reports that don't recommend rents, and affordable-limit tools excluded | Up to $1 million for a corporation; state or private action |
| **New Jersey** | FAIR Act (signed July 20, 2026) | July 1, 2027 | Coordinators using shared nonpublic metrics; "parallel pricing coordination" including manual workarounds | Violation of the New Jersey Antitrust Act; an AG complaint portal |
| **San Francisco** | Admin. Code 37.10C | October 2024 | Nonpublic competitor information | Up to $1,000 per violation; each month per unit may be a separate violation |
| **San Diego** | Mun. Code 98.1101 to 98.1104 | June 2025 | Similar to San Francisco | Up to $1,000 per violation, per month and property |
| **Philadelphia** | Code 9-813 | February 2025 | Algorithmic rent-setting services | $2,000 per violation or treble damages |
| **Seattle; King County; Spokane** | SMC ch. 7.34; KCC ch. 12.23; SMC 10.57.180 | July 2025; October 2025; January 2026 | Coordinating services | Up to $7,500; up to $7,500; up to $5,000 |
| **Minneapolis** | Code 244.2070 | March 1, 2026 | Nonpublic competitor data | Tenant civil action |
| **Providence; Jersey City; Hoboken** | Code ch. 13 art. X; Code 218-12; Code ch. 158-2 | May, June, July 2025 | Rent-setting algorithms; Hoboken also lease terms and occupancy | Up to $500 a day (city enforcement); up to $2,000 a day |
| **Berkeley; Portland; Santa Ana; Rockville** | Code ch. 13.63; Code 30.01.088; Ord. NS-3090; Code 18-148 | January 2026; February 2026; April 2, 2026; January 1, 2027 | Coordinated pricing; Rockville also fees and other terms | Per-unit, per-month private remedies (Berkeley, Santa Ana); treble or $1,000 for owners of 16+ units (Portland) |

New York's law is the one to watch for design. RealPage sued in the Southern District of New York (No. 1:25-cv-9847), and in late September 2026 the court granted a preliminary injunction, finding that algorithmically informed price recommendations are commercial speech and that the law "expressly" regulates their communication, and denied the state's motion to dismiss; the First Amendment challenge continues. RealPage's First Amendment suit against Berkeley ended in a voluntary dismissal with prejudice on January 14, 2026. Colorado's governor vetoed a statewide ban in May 2025. Private suits under the ordinances are already pending in San Francisco, San Diego, Seattle and Philadelphia, and Providence brought the first city enforcement action under its ordinance.

The laws vary along four axes, and each is a column in the platform's rules, not a branch in code ([Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule)):

1. **Public versus nonpublic.** San Francisco, Minneapolis, Connecticut and the Final Judgment reach nonpublic data; California's AB 325 and New York's S.7882 don't distinguish. A feature that scrapes public comparables can be lawful in one city and not the next, which is AppFolio's "not available in all jurisdictions."
2. **What is regulated.** Using software, selling it, or coordinating: some laws bind landlords, some vendors, some both; Rockville and Hoboken reach fees, lease terms and occupancy as well as rent.
3. **Remedy per unit per month.** Exposure scales with the portfolio and the time a feature stays on, so the date a setting changed is evidence.
4. **Enforceability.** A law can be in force, enjoined, or pending, and the status changes by court order; the rule row carries it with an effective date.

## Operator-Side Controls

Most of the money in this record was paid by operators, and most of the prospective commitments bind them. Greystar's state settlement and Camden's class settlement both commit the operator to rules about disclosing and using nonpublic data, and Greystar's adds product choice, notice of products adopted and a compliance program. Whatever vendor an operator uses, the controls on its side are the same:

- **No contributing or receiving competitors' nonpublic data** through the pricing product, benchmarking, surveys or staff networks, and a record of every data set the operator holds that came from a competitor.
- **Independent settings.** The operator, not the vendor, sets bands, auto-accept rules and strategy, per property, by a named person.
- **Overrides without friction.** Leasing staff can deviate from a recommendation with a reason; no commission plan or KPI rewards acceptance rates. The complaint in the North Carolina case alleged that advisory clients agreed to restructure leasing-agent commissions to reward revenue growth, which is exactly the kind of incentive V.C bars the vendor from creating.
- **Product inventory.** Which pricing, benchmarking and market data products each property uses, from when, under which version, so a settlement's notice duties and an ordinance's per-month exposure can be answered.
- **Meetings and advisors.** Notes of vendor advisory calls and user-group sessions, because conduct outside the software is part of every decree.

## Rent Limits in the Engine

Some prices are capped by law, and the cap belongs inside the pricing engine, not in a reviewer's head. Two statewide examples, as of October 2026:

- **California's Tenant Protection Act** (Civil Code 1947.12) limits increases over any 12 months to the lower of 5% plus the change in the cost of living or 10% total, with exemptions that include single-family homes not owned by a corporation or REIT, units under a stricter local rent control law, units with a certificate of occupancy issued within the last 15 years, deed-restricted affordable housing and dormitories. The landlord sets the initial rent when a unit turns over. Local rent control ordinances can be stricter.
- **Washington** (RCW 59.18.700, enacted 2025 and effective May 7, 2025) limits increases in any 12-month period to the lower of 7% plus CPI (the June change in the Seattle-area index) or 10%, bars increases in the first 12 months of a tenancy, and has the Department of Commerce publish the annual maximum; the section expires July 1, 2040. Exemptions are in RCW 59.18.710.

Oregon has its own statewide cap and notice rules, and New York's Good Cause law makes increases above the local rent standard presumptively unreasonable; [The Lease](/books/property-tech/the-lease#good-cause-laws) carries both because they shape renewal notices. Affordable programs cap rent by program limits instead, which [Subsidized & Affordable Housing](/books/property-tech/affordable-housing#rents-limits-and-allowances) owns. The pattern for all of them is the same:

- **Coverage is per unit and per date.** Whether a cap applies depends on the unit's certificate of occupancy date, the owner's entity type, the program restrictions and the local ordinance, all inputs recorded with the determination. [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#a-worked-example-an-oregon-rent-increase) owns the determination.
- **The limit is a computed number.** For each lease, the maximum rent for the next increase given the rent history in the lookback window, the published index value and the rule version.
- **The engine clamps, then explains.** A recommendation above the legal maximum is reduced to it, and the record says so; a manual override above it is blocked, not warned.
- **Turnover resets where the law says so.** California lets the landlord set the initial rent on turnover; local vacancy-control rules may not. The rule, not the engine, decides.

## How to Build It

This chapter extends the [core data model](/books/property-tech/property-business#the-core-data-model) with the pricing pipeline: data sources, models, landlord settings, recommendations, decisions, quotes, renewal offers, rent limits and jurisdictional restrictions on pricing tools. Other chapters reference two of these: applications and leases carry `rent_quote_id`, and renewal leases and notices carry `renewal_offer_id` ([Applications & Screening](/books/property-tech/applications-and-screening#how-to-build-it), [The Lease](/books/property-tech/the-lease#how-to-build-it)). Staff are users from [Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants), referenced as `user_id`. Rules are effective-dated rows ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

```sql
CREATE TABLE pricing_data_sources (      -- every feed a model or recommendation may read
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('own_transactions', 'own_traffic',
                       'public_listings', 'licensed_market_data', 'pooled_nonpublic',
                       'market_survey', 'surrogate')),
  provider           TEXT,               -- null for the operator's own data
  is_public          BOOLEAN NOT NULL,   -- published by the competitor itself
  is_competitor_data BOOLEAN NOT NULL,
  collection_method  TEXT,               -- 'website scrape', 'field research', 'phone survey'
  license_ref        TEXT,               -- terms the data is used under
  allowed_runtime    BOOLEAN NOT NULL,   -- may feed a live recommendation
  allowed_training   BOOLEAN NOT NULL,
  min_training_age   INTERVAL,           -- e.g. '12 months' for nonpublic data
  retired_on         DATE,               -- surveys after a cutoff, a vendor dropped
  CHECK (kind = 'surrogate'             -- the one rule-gated exception (IV.C)
         OR NOT (is_competitor_data AND NOT is_public AND allowed_runtime))
);

CREATE TABLE pricing_models (            -- one row per trained version
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  name                  TEXT NOT NULL,   -- 'demand', 'renewal_likelihood', 'optimizer'
  version               TEXT NOT NULL,
  vendor                TEXT,            -- null when built in-house
  trained_at            TIMESTAMPTZ NOT NULL,
  training_data_through DATE NOT NULL,   -- newest record in the training set
  training_geography    TEXT NOT NULL CHECK (training_geography IN ('nation', 'state',
                          'cbsa', 'property')),
  training_source_ids   UUID[] NOT NULL, -- pricing_data_sources
  feature_list_ref      TEXT NOT NULL,   -- reviewed list; no competitor rent features
  approved_by           UUID REFERENCES users (id),
  approved_at           TIMESTAMPTZ,
  retired_at            TIMESTAMPTZ,
  UNIQUE (tenant_id, name, version)
);

CREATE TABLE pricing_settings (          -- the landlord's own choices, per property
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id               UUID NOT NULL,
  property_id             UUID NOT NULL REFERENCES properties (id),
  band_pct                NUMERIC(5, 2) NOT NULL CHECK (band_pct >= 0),  -- one number,
                                         -- applied below the floor and above the ceiling
  auto_accept             BOOLEAN NOT NULL DEFAULT FALSE,
  auto_accept_max_change_pct NUMERIC(5, 2),  -- per day, per unit
  allowed_source_ids      UUID[] NOT NULL,   -- what this property may read at runtime
  set_by                  UUID NOT NULL REFERENCES users (id),  -- a named person at the operator,
                                             -- never the vendor
  valid_during            TSTZRANGE NOT NULL,
  CHECK (NOT auto_accept OR auto_accept_max_change_pct IS NOT NULL),
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

CREATE TABLE price_recommendations (     -- what the engine suggested, and from what
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  unit_id             UUID REFERENCES units (id),        -- null for a floor-plan price
  floor_plan_id       UUID REFERENCES floor_plans (id),
  lease_term_months   INT NOT NULL CHECK (lease_term_months > 0),
  move_in_on          DATE NOT NULL,
  amount              BIGINT NOT NULL,   -- minor units
  currency            CHAR(3) NOT NULL,
  floor_amount        BIGINT,            -- own-data or public-data bounds only
  ceiling_amount      BIGINT,
  model_ids           UUID[] NOT NULL,   -- pricing_models used
  source_ids          UUID[] NOT NULL,   -- pricing_data_sources read at runtime
  settings_id         UUID NOT NULL REFERENCES pricing_settings (id),
  rent_limit_id       UUID REFERENCES rent_limits (id),  -- (below): the cap applied, if any
  clamped_by_limit    BOOLEAN NOT NULL DEFAULT FALSE,
  explanation         JSONB NOT NULL,    -- drivers: exposure, amenity premiums, term premium
  business_date       DATE NOT NULL,     -- the property's date
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE price_decisions (           -- what a person (or their auto-accept rule) did
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  recommendation_id   UUID NOT NULL REFERENCES price_recommendations (id),
  outcome             TEXT NOT NULL CHECK (outcome IN ('accepted', 'auto_accepted',
                        'overridden', 'rejected')),
  amount              BIGINT,            -- the price put in effect
  decided_by          UUID REFERENCES users (id),  -- null only for auto_accepted
  settings_id         UUID REFERENCES pricing_settings (id),  -- the rule that auto-accepted
  reason              TEXT,
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (outcome <> 'auto_accepted' OR settings_id IS NOT NULL),
  CHECK (outcome = 'auto_accepted' OR decided_by IS NOT NULL),
  CHECK (outcome <> 'overridden' OR reason IS NOT NULL)
);

CREATE TABLE rent_quotes (               -- the price a prospect was given
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  property_id        UUID NOT NULL REFERENCES properties (id),
  unit_id            UUID NOT NULL REFERENCES units (id),
  lease_term_months  INT NOT NULL CHECK (lease_term_months > 0),
  move_in_on         DATE NOT NULL,
  amount             BIGINT NOT NULL,    -- base rent per month, minor units
  currency           CHAR(3) NOT NULL,
  concession         JSONB,              -- terms of any concession offered with it
  price_decision_id  UUID REFERENCES price_decisions (id),  -- null for a manual price
  guest_card_id      UUID REFERENCES guest_cards (id),      -- who it was quoted to, if known
  quoted_by          UUID REFERENCES users (id),  -- staff, or the AI agent's user; null
                                         -- when the website quoted it
  valid_until        TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rent_limits (               -- each period's computed cap: a typed slice of a
                                         -- 'rent_cap' legal rule; shared, so no tenant_id
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_rule_id      UUID NOT NULL REFERENCES legal_rules (id),  -- source, review, versions
  jurisdiction_id    UUID NOT NULL REFERENCES jurisdictions (id),  -- 'US-CA', 'US-WA', a city
  name               TEXT NOT NULL,      -- 'Tenant Protection Act'
  formula            TEXT NOT NULL,      -- 'min(5% + CPI, 10%)'
  max_increase_pct   NUMERIC(5, 2) NOT NULL,  -- the computed maximum for this period
  lookback_months    INT NOT NULL,       -- 12
  index_series       TEXT,               -- the CPI series the formula names
  index_value        NUMERIC(6, 3),
  coverage_rule_ref  TEXT NOT NULL,      -- exemptions, resolved per unit elsewhere
  valid_during       DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, name WITH =, valid_during WITH &&)
);

CREATE TABLE renewal_offers (            -- one row per term offered to a household
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL REFERENCES leases (id),  -- the expiring lease
  lease_term_months  INT NOT NULL CHECK (lease_term_months > 0),
  current_rent       BIGINT NOT NULL,
  offered_rent       BIGINT NOT NULL,
  currency           CHAR(3) NOT NULL,
  renewal_likelihood NUMERIC(4, 3),      -- the model's estimate at the offered rent
  price_decision_id  UUID REFERENCES price_decisions (id),
  rent_limit_id      UUID REFERENCES rent_limits (id),
  rule_evaluation_id UUID REFERENCES rule_evaluations (id),  -- the rent_cap and notice evaluation
  limit_amount       BIGINT,             -- the legal maximum, computed when offered
  notice_due_by      DATE NOT NULL,      -- from the notice rule for this increase
  sent_at            TIMESTAMPTZ,
  expires_on         DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted',
                       'declined', 'expired', 'withdrawn')),
  CHECK (limit_amount IS NULL OR offered_rent <= limit_amount)
);

CREATE TABLE pricing_restrictions (      -- which tools and data a jurisdiction allows: a typed
                                         -- slice of 'pricing_tool_restriction' legal rules
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_rule_id              UUID NOT NULL REFERENCES legal_rules (id),
  jurisdiction_id            UUID NOT NULL REFERENCES jurisdictions (id),
  instrument                 TEXT NOT NULL,   -- 'S.F. Admin. Code 37.10C'
  public_competitor_data     BOOLEAN NOT NULL,  -- may a pricing tool use it
  nonpublic_competitor_data  BOOLEAN NOT NULL,
  covers                     TEXT[] NOT NULL,  -- 'rent', 'fees', 'lease_terms', 'occupancy'
  enforcement_status         TEXT NOT NULL CHECK (enforcement_status IN ('in_force',
                               'enjoined', 'pending', 'repealed')),
  valid_during               DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, instrument WITH =, valid_during WITH &&)
);
```

Two queries carry most of the compliance weight. The runtime guard runs before a recommendation is saved, and the same query runs nightly over the day's output, because a guard that only runs in the write path can be bypassed by a backfill:

```sql
-- Recommendations that read a source the property's settings or jurisdiction don't allow
SELECT r.id, r.property_id, s.name AS source
FROM price_recommendations r
JOIN pricing_settings ps ON ps.id = r.settings_id
JOIN properties p ON p.id = r.property_id
CROSS JOIN LATERAL unnest(r.source_ids) AS src(id)
JOIN pricing_data_sources s ON s.id = src.id
WHERE NOT s.allowed_runtime
   OR NOT (s.id = ANY (ps.allowed_source_ids))
   OR (s.is_competitor_data AND EXISTS (
         SELECT 1 FROM pricing_restrictions pr
         JOIN property_jurisdictions pj               -- Landlord-Tenant Law as Data
           ON pj.jurisdiction_id = pr.jurisdiction_id
          AND pj.property_id = p.id
          AND pj.valid_during @> r.business_date
         WHERE pr.enforcement_status = 'in_force'
           AND pr.valid_during @> r.business_date
           AND (NOT pr.public_competitor_data AND s.is_public
                OR NOT pr.nonpublic_competitor_data AND NOT s.is_public)));

-- Model versions trained on nonpublic data that is too fresh or too local
SELECT m.name, m.version
FROM pricing_models m
WHERE EXISTS (
  SELECT 1 FROM unnest(m.training_source_ids) AS src(id)
  JOIN pricing_data_sources s ON s.id = src.id
  WHERE NOT s.is_public AND s.is_competitor_data
    AND (m.training_data_through > (m.trained_at - s.min_training_age)::date
         OR m.training_geography IN ('cbsa', 'property')));
```

Design decisions behind it:

- **Sources are first-class.** Every input is a row with its publicness, provenance and allowed uses, and a recommendation stores the ids it read. That turns "did a competitor's nonpublic data price this unit" from a forensic exercise into a query, which is the evidence that won *Mach*.
- **One band, owned by the landlord.** `band_pct` is a single number applied both ways, so asymmetric bounds can't be configured, and `set_by` records who chose it.
- **Auto-accept is a setting with an owner.** An auto-accepted decision points at the settings row that allowed it; changing auto-accept is a new effective-dated row, so the history of who turned it on, where and when is intact.
- **Recommendations and decisions are separate rows.** The recommendation is the engine's; the decision is a person's. Override rates per property and per user come from `price_decisions`, and nothing downstream reads them as a performance measure for staff.
- **The cap is enforced in the schema.** `renewal_offers.offered_rent <= limit_amount` is a constraint, and the recommendation records that it was clamped, so the engine can't silently produce an unlawful offer.
- **Restrictions are dated data.** An injunction, a new ordinance or a repeal is a row with a `valid_during`, resolved from the property's jurisdiction; the code never names a city ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Limits and restrictions are slices of the shared rules catalog.** Each `rent_limits` and `pricing_restrictions` row belongs to an approved `legal_rules` row ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it)), which carries the source, the two-person review and the version history; the slice adds the typed columns the pricing engine and its constraints read.
- **Events.** `price.recommended`, `price.decided`, `quote.issued`, `renewal_offer.sent` and `renewal_offer.accepted` feed listings, the leasing screen, notices and metrics ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Pricing records get read by monitors, attorneys general, class counsel and city enforcement, often years after the fact:

- **Lineage of every price.** For any quote or renewal offer: the recommendation, its models and versions, its runtime sources, the settings in force, the decision and who made it. This is the automated-decision record of [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions), applied to rent.
- **Training runs.** For each model version: the data sources, the cutoff date, the geography, the feature list and the approval, retained for the life of any decree or settlement plus its tail.
- **Settings history.** Bands, auto-accept, allowed sources and strategy changes per property, effective-dated, with the user. Per-unit-per-month remedies make the dates as important as the values.
- **Overrides and acceptance.** Override counts and reasons, kept as records, with commission and incentive plans retained beside them to show that nothing rewarded acceptance.
- **Caps applied.** For each capped offer: the rule version, index value, lookback rent history and the computed maximum.
- **Conduct outside the software.** Survey rows with their collection method, advisory call notes, user-group materials and the product inventory per property.

Retention follows the longest of the decree terms, the settlement terms and the statute of limitations, which [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds) schedules.

## What This Means for the System You Build

- **Price quotes, not units:** one row per unit, term and move-in date with an expiry, carried by the application and the lease.
- **Make every data source a row** with its publicness, provenance and allowed uses, and store the sources each recommendation read.
- **Build to the Final Judgment's checklist** even if you're not bound by it: no competitors' nonpublic data at runtime, aged and nationally scoped training data, symmetric landlord-set bounds, user-configured auto-accept, no incentives to accept.
- **Keep recommendation and decision separate,** with overrides one step away and a reason on each.
- **Resolve pricing restrictions by jurisdiction and date,** including laws that reach public data and laws that are enjoined.
- **Clamp to the legal cap in the engine** and enforce it in the schema, with coverage determined per unit.
- **Work renewals backwards from the notice deadline,** and keep offers as evidence.
- **Give operators their own controls:** settings owned by named people, a product inventory, survey provenance, and records of conduct outside the software.
- **Keep the lineage for the life of the longest decree,** because pricing is audited by people who arrive years later.

## References

**Court records and agencies**

- [DOJ: Justice Department requires RealPage to end the sharing of competitively sensitive information](https://www.justice.gov/opa/pr/justice-department-requires-realpage-end-sharing-competitively-sensitive-information-and), the November 24, 2025 proposed settlement, runtime and training data limits, state-level geography, the monitor, cooperation
- [DOJ: Competitive Impact Statement, United States v. RealPage, No. 1:24-cv-00710 (M.D.N.C.), Doc. 160 (PDF)](https://www.justice.gov/atr/media/1419471/dl), the Final Judgment's terms by paragraph: runtime and training rules, 12- and 16-month aging, geography, surrogate data and CBSAs, surveys, auto-accept, target leases, sold-out guardrail, symmetric bounds, advisors and meetings, the monitor and compliance terms
- [DOJ: Proposed Final Judgment as to RealPage, Inc., Doc. 159-1 (November 24, 2025) (PDF)](https://www.justice.gov/atr/media/1419451/dl), the definition of revenue management products (II.EE) and the seven-year term with termination by notice after four (XIV)
- [DOJ Antitrust Division: U.S. and Plaintiff States v. RealPage, Inc. case page](https://www.justice.gov/atr/case/us-and-plaintiff-states-v-realpage-inc), the filings posted as of October 2026, which list the RealPage judgment only as proposed
- [Federal Register: United States et al. v. RealPage, Inc. et al.; Response to Public Comments, 91 FR 25373 (May 8, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-05-08/html/2026-09147.htm), the December 5, 2025 publication at 90 FR 56286, eight comments, the April 30, 2026 response and the intent to move for entry
- [United States v. RealPage, Memorandum Opinion and Order, Doc. 223 (September 30, 2026) (PDF)](https://www.courthousenews.com/wp-content/uploads/2026/10/usdc-north-carolina-rent-software-antitrust-opinion.pdf), entry of the Final Judgment on May 19, 2026 (Doc. 194), its seven-year term, mootness, landlord resolutions, the alleged data pool, motions denied, *Gibson v. Cendyn* citation history
- [DOJ and FTC: Statement of Interest in Duffy v. Yardi Systems, No. 2:23-cv-01391-RSL (March 1, 2024) (PDF)](https://www.ftc.gov/system/files/ftc_gov/pdf/YardiSOI-filed%28withattachments%29_0.pdf), joint delegation of pricing to a common algorithm as per se illegal even with discretion to deviate
- [FTC: FTC and DOJ file statement of interest in hotel room algorithmic price-fixing case](https://www.ftc.gov/news-events/news/press-releases/2024/03/ftc-doj-file-statement-interest-hotel-room-algorithmic-price-fixing-case), the agencies' positions on starting prices and algorithms (March 28, 2024)
- [Washington Attorney General: RealPage rental housing litigation](https://www.atg.wa.gov/realpage-rental-housing-litigation), Washington's April 3, 2025 King County suit and its withdrawal from the federal case
- [Washington State Legislature: RCW 59.18.700](https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.700), the 7% plus CPI or 10% cap, first-year bar, 2025 enactment and expiry
- [California Attorney General: Landlord-tenant issues](https://oag.ca.gov/consumers/general/landlord-tenant-issues), the Tenant Protection Act cap and its exemptions

**Filings**

- [Camden Property Trust: Form 10-Q for the quarter ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/0000906345/000162828026051327/cpt-20260630.htm), its $53.0 million class settlement with non-public data provisions, the DC, Arizona and Maryland attorney general suits

**Analysis and reporting**

- [Morgan Lewis: Algorithmic rent pricing litigation expands under new state and local laws (August 2026)](https://morganlewis.com/pubs/2026/08/algorithmic-rent-pricing-litigation-expands-under-new-state-and-local-laws), city and county ordinances with citations, effective dates and remedies, the Berkeley dismissal, private suits and the Providence enforcement action
- [Arnold & Porter: Algorithmic pricing bans go coast to coast](https://www.arnoldporter.com/en/perspectives/advisories/2025/10/algorithmic-pricing-bans-go-coast-to-coast), California AB 325 and New York S.7882: dates, definitions, data scope, penalties, the Colorado veto
- [Baker McKenzie: Connecticut passes state antitrust statute](https://www.bakermckenzie.com/en/insight/publications/2026/01/us-connecticut-passes-state-antitrust-statute), HB 8002's nonpublic-data rule, exclusions and fines
- [Greenberg Traurig: New Jersey enacts algorithmic rent-setting law](https://www.gtlaw.com/en/insights/2026/8/new-jersey-enacts-algorithmic-rent-setting-law), the FAIR Act's signing, effective date and scope
- [Multifamily Dive: RealPage wins injunction against New York algorithmic rent-setting ban](https://www.multifamilydive.com/news/realpage-injunction-new-york-algorithmic-rent-setting-ban/832045/), the preliminary injunction, commercial speech reasoning and denial of the motion to dismiss
- [Kelley Drye: State AGs continue actions against RealPage landlords; multistate settles for $7 million](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/state-ags-continue-actions-against-realpage-landlords-multistate-settles-for-7-million.md), the Greystar state settlement terms and the states' statements of interest in the MDL
- [WRE News: RealPage rent pricing class action, $359 million final approval](https://wrenews.com/realpage-rent-pricing-class-action-359-million-final-approval-landlords-2026/), the MDL 3071 settlement sets, totals, final approval, class period and claims deadline
- [Multifamily Dive: Judge denies Yardi summary judgment in rent price-fixing case](https://www.multifamilydive.com/news/judge-denies-yardi-summary-judgement-rent-price-fixing-case/833392/), the October 13, 2026 ruling, the discovery stay, the March 2026 jurisdictional dismissals
- [Multifamily Dive: Yardi revenue management antitrust lawsuit survives dismissal](https://www.multifamilydive.com/news/yardi-revenue-management-algorithmic-pricing-antitrust-lawsuit/735271/), the December 2024 denial of the motion to dismiss and per se allegations
- [Covington: California court rejects first algorithmic price-fixing case to reach summary judgment](https://www.covingtonblogs.com/2025/11/03/california-court-rejects-first-algorithmic-price-fixing-case-to-reach-summary-judgment/), *Mach v. Yardi*: owners' data used only for their own recommendations, reliance on *Gibson v. Cendyn*

**Platforms**

- [Entrata: Revenue Intelligence](https://www.entrata.com/products/revenue-intelligence), own and public data, removable competitor inputs, explainable recommendations, renewals and likelihood to renew, rent control
- [RealPage: AI Revenue Management](https://www.realpage.com/insights-analytics/revenue-management/), final say, compliance framework, renewals, lease-ups and concessions, the customer-reported outperformance claim
- [RealPage: RealPage reaches settlement with US Department of Justice](https://www.realpage.com/news/realpage-reaches-settlement-with-us-department-of-justice/), no admission or payment, modifications already implemented, the monitor
- [AppFolio: Marketing and leasing](https://www.appfolio.com/property-manager/marketing-leasing), Leasing Signals, public comparable data and its jurisdictional limits, bulk renewals
- [Yardi Matrix](https://www.yardimatrix.com/), field research and aggregated, anonymized platform operating data
- [RealPage: Market Analytics](https://www.realpage.com/insights-analytics/market-analytics/), historical data, daily public asking rents and concessions, five-year forecasts
