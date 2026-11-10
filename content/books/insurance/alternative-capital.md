+++
title = "Cat Bonds, ILS & State Cat Funds"
nav_title = "Cat Bonds & State Funds"
description = "Cat bonds and their triggers worked, sidecars and collateralized reinsurance, market size, the Florida Hurricane Catastrophe Fund and TRIA, with the math."
category = "Insurance Industry"
order = 2742
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "cat-bonds", "insurance-linked-securities", "reinsurance", "fhcf", "tria"]
+++

The largest catastrophes are too big for the reinsurance industry's balance sheets alone, so the industry rents capital from investors who otherwise own bonds and equities. A pension fund that buys a catastrophe bond puts up the principal in a collateral account; if no hurricane exceeds the bond's trigger in three years, it gets the principal back plus a spread; if one does, the insurer keeps some or all of the principal to pay claims. A sidecar does the same for a slice of a reinsurer's book; collateralized reinsurance does it contract by contract. Investors like the risk because hurricanes don't correlate with stock markets; insurers like the capital because it is fully collateralized, so there is no credit risk on the recovery. Where even that capital won't go at a price the state accepts, governments step in: Florida runs a mandatory hurricane reinsurance fund, and the federal government shares terrorism losses above a deductible.

This chapter covers catastrophe bonds and their triggers with worked payouts, sidecars and collateralized reinsurance, the third-party capital vehicles reinsurers manage, market size and pricing, the Florida Hurricane Catastrophe Fund with its retention arithmetic, and the Terrorism Risk Insurance Program. The traditional contract shapes are [Reinsurance Structures](/books/insurance/reinsurance-structures); the NFIP's own flood program is [Flood & the NFIP](/books/insurance/flood-and-the-nfip).

## How the Platforms Do It

As of November 2026:

| Vehicle or program | Who uses it | Public detail |
| --- | --- | --- |
| **Catastrophe bonds** | Insurers, reinsurers, state entities and FEMA as sponsors; funds as investors | Artemis counts $65.4 billion of cat bond and related ILS risk capital outstanding and $19.7 billion issued in 2026; FIO reports record 2025 issuance of $25.6 billion and $61.3 billion outstanding at year-end |
| **FEMA's FloodSmart placements** | The NFIP | Three-year named storm cat bonds since 2018; the 2024 placement covers 10% of losses between $8 billion and $9 billion and 23.75% between $9 billion and $11 billion, for $88.43 million of first-year premium |
| **Sidecars** | Reinsurers and insurers sharing a book with investors | FIO cites estimated P&C sidecar capacity of $16 to $18 billion in 2025, up from $8 to $10 billion in 2024 and $5 to $7 billion in 2023 |
| **Managed third-party capital vehicles** | RenaissanceRe and other reinsurers | RenRe's DaVinci (property catastrophe and some casualty and specialty, RenRe owns 24.3%), Fontana (a whole account casualty and specialty quota share, 28.7%), Medici (cat bonds, 11.3%), Vermeer (high excess US property cat, 100% owned economically by a pension fund represented by PGGM), Upsilon (collateralized reinsurance, 12.9%), Top Layer (50% State Farm, with a $3.9 billion stop-loss from State Farm) |
| **Florida Hurricane Catastrophe Fund** | Every insurer writing covered residential property in Florida | Mandatory reimbursement contract, 45%, 75% or 90% of losses above a statutory retention plus 10% for LAE, capped at $17 billion per contract year with growth |
| **Terrorism Risk Insurance Program** | P&C insurers writing covered lines | Federal share of 80% above a 20% deductible, $200 million program trigger, $100 billion cap, authorized through December 31, 2027 |

## Catastrophe Bonds

A cat bond is reinsurance written as a security. The structure:

1. A **special purpose insurer** writes a reinsurance or retrocession contract to the **sponsor** (the cedent).
2. The vehicle issues **notes** to investors (the core of the market is Rule 144A property catastrophe bonds, the segment Artemis's dashboard is built on) and puts the proceeds in a **collateral trust** invested in high-quality short-term assets.
3. The sponsor pays a **premium** that, with the collateral's return, funds the investors' **coupon** (a risk spread over the money market yield).
4. If a qualifying event meets the **trigger**, the trust pays the sponsor and the notes' principal is reduced; otherwise principal is returned at maturity, a multi-year term (FEMA's placements run three years).

Because the full limit sits in trust from day one, a cat bond has no reinsurer credit risk, which matters for credit for reinsurance ([Reinsurance Operations](/books/insurance/reinsurance-operations)): the collateral is the security. The tradeoff is the trigger.

### Triggers

| Trigger | Pays on | Strength | Weakness |
| --- | --- | --- | --- |
| **Indemnity** | The sponsor's own losses from the event, as a reinsurance contract would | No basis risk: recovery matches the sponsor's loss | Slowest to settle (the sponsor's claims develop for months); investors need to trust the sponsor's data and claims handling |
| **Industry index** | An industry loss estimate (US events: Verisk PCS) for the event, usually with a sponsor-specific weighting by state or line | Fast, transparent, the sponsor's book is not disclosed | Basis risk: the sponsor's loss can differ from its share of the industry |
| **Parametric** | A measured physical parameter (wind speed at locations, earthquake magnitude and depth in a box) | Fastest; no loss adjustment | Most basis risk |
| **Modeled loss** | A model run of the event's parameters against a fixed notional portfolio | Between index and parametric | Depends on the model and the reference portfolio |

PCS's methodology paper names cat bonds and industry loss warranties as uses of its estimates, which is why the preliminary estimate (about 15 days after designation) and the 60-day resurveys set the timing of index-trigger settlements ([Catastrophe Events](/books/insurance/catastrophes)). An **industry loss warranty** is the same idea as a reinsurance contract: the Federal Insurance Office describes ILWs as instruments that "allow an entity to gain coverage based on the total insured loss experienced by the entity's industry rather than the entity's own losses."

### Worked Payouts

**Indemnity, from a public structure.** FEMA's 2024 FloodSmart placement (March 7, 2024 to March 7, 2027, named storms only) covers two layers of NFIP losses: 10% of losses between $8 billion and $9 billion, and 23.75% of losses between $9 billion and $11 billion. The maximum recovery is 10% × $1 billion + 23.75% × $2 billion = $100 million + $475 million = **$575 million**. Suppose, as an illustration of mine, a named storm produces $10.2 billion of NFIP losses:

| Layer | Losses in the layer | Share | Recovery |
| --- | --- | --- | --- |
| $8B to $9B | $1.0 billion | 10% | $100 million |
| $9B to $11B | $1.2 billion | 23.75% | $285 million |
| **Total** | | | **$385 million** |

FEMA's page states that since the 2017 hurricane season no qualifying events occurred under its existing reinsurance agreements; its earlier bonds, from 2018 to 2021, matured without a covered event.

**Industry index, mine.** A Florida insurer sponsors a $200 million bond that pays pro rata as the PCS industry loss for a single Florida hurricane rises from $30 billion (attachment) to $40 billion (exhaustion). PCS's final reported estimate is $34 billion: the payout is (34 − 30) / (40 − 30) = 40% of principal, **$80 million**. If the sponsor's own losses from the storm were $150 million above its other reinsurance, its basis risk shortfall is $70 million; if its book was lightly hit, it may recover more than it lost. That mismatch is what the sponsor accepts for faster settlement and for not disclosing its portfolio.

**Parametric, mine.** A $50 million bond pays 25% if the maximum sustained wind at a named reference point reaches 111 mph, 50% at 130 mph and 100% at 157 mph. A storm measured at 135 mph pays **$25 million**, the 50% step, whatever the sponsor's actual losses; payment can follow within weeks of the official measurement.

The payout function for a linear (pro rata) index trigger:

```go tab="Go"
// IndexPayout returns the principal paid for an index value between
// attachment and exhaustion, pro rata, capped at the principal.
func IndexPayout(principal, index, attach, exhaust int64) int64 {
	switch {
	case index <= attach:
		return 0
	case index >= exhaust:
		return principal
	default:
		return principal * (index - attach) / (exhaust - attach)
	}
}
```

```rust tab="Rust"
/// Principal paid for an index value between attachment and exhaustion,
/// pro rata, capped at the principal.
pub fn index_payout(principal: i64, index: i64, attach: i64, exhaust: i64) -> i64 {
    if index <= attach {
        0
    } else if index >= exhaust {
        principal
    } else {
        principal * (index - attach) / (exhaust - attach)
    }
}
```

Use 128-bit intermediates or scale the index to billions when principal is in cents, since the product overflows `int64` for large deals; the bond's offering terms name the rounding.

## Sidecars and Collateralized Reinsurance

**Collateralized reinsurance** is an ordinary reinsurance contract whose limit is fully funded in a trust by investors, usually through a segregated account of a transformer vehicle; the cedent sees a reinsurance contract, the investor sees a fund. RenRe's Upsilon RFO, a risk-bearing entity whose segregated accounts enter collateralized reinsurance arrangements, is one public example.

A **sidecar** is a separate vehicle that takes a quota share of a reinsurer's or insurer's book for a period, funded by investors' equity and debt. FIO describes sidecars as entities created "to share risks with investors in exchange for a percentage of the insurer's premiums," usually fully collateralized, and reports their growth in P&C (to $16 to $18 billion in 2025, mostly property catastrophe, with casualty sidecars also increasing) and in life and annuity business (reserves ceded to sidecars or similar entities of $90.7 billion in 2025, up from $63.9 billion; [Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital) covers the life side).

**Managed vehicles** let a reinsurer write more than its own capital supports and earn fees on the rest. RenRe's filing shows the pattern: its underwriting manager writes for each vehicle, RenRe keeps an economic stake (from none in Vermeer to 50% in Top Layer), and it earns management fees from all of them and performance fees from DaVinci, Fontana and Upsilon, which "may be negative in a particular period" if large losses occur. For the system of the reinsurer, each vehicle is a separate insurer record with its own contracts and capital; for the cedent, the vehicle is a reinsurer on the slip like any other.

## Market Size and Pricing

The figures differ by source and scope, as of their dates:

- **Outstanding:** $65.4 billion of cat bond and related ILS risk capital on the Artemis dashboard as fetched in November 2026 (covering 144A property cat bonds, other cat bond-like deals and private deals Artemis knows of); $61.3 billion of cat bonds at year-end 2025 per FIO.
- **Issuance:** $25.6 billion in 2025, about 45% above 2024 and a record, per FIO; $19.7 billion so far in 2026 per Artemis.
- **ILS capacity overall:** about $120 billion at the end of 2025, per FIO, which cites Aon's estimate that alternative reinsurance capital grew 18% to $136 billion.
- **Cyber:** a growing but small segment, with $450 million of cyber cat bonds in the fourth quarter of 2025 and cyber capacity of $1.24 billion at year-end, per FIO.
- **Parametric insurance** more broadly: one estimate FIO cites puts the global parametric market at $16.2 billion in 2024.

Third-party capital competes with traditional reinsurance on price, and the price is falling: Guy Carpenter's US property catastrophe rate-on-line index fell 16% through the June and July 2026 renewals, its largest annual decline since 2014 ([Reinsurance Operations](/books/insurance/reinsurance-operations)). Cat bond pricing is quoted as a spread against the modeled expected loss; the ratio of the two (the multiple) is the same comparison the worked layer in [Catastrophe Models & Their Regulators](/books/insurance/catastrophe-models) makes.

## The Florida Hurricane Catastrophe Fund

The **FHCF**, Fla. Stat. 215.555 (latest amendment ch. 2022-132; as of November 2026 the 2026 Florida Statutes show it in force), is a state-run reinsurer that every insurer writing covered residential property policies in Florida must contract with, as "a condition of doing business." Its mechanics:

- **Coverage election.** Each insurer chooses 45%, 75% or 90% reimbursement of its covered losses above its retention, plus a loss adjustment expense add-on of 10% of reimbursed losses (from June 1, 2019; 5% before). Citizens and similar entities must elect 90%.
- **Contract year** June 1 to May 31, which is why Florida's reinsurance renews on June 1.
- **Retention.** The insurer's reimbursement premium times a retention multiple. The base multiple was set as $4.5 billion divided by the fund's estimated reimbursement premium for the 2005 contract year, adjusted for exposure growth since, then by coverage level: 100% of the base for the 90% election, 120% for 75%, and 200% for 45%.
- **Events.** The full retention applies to each of the insurer's two largest covered events in the year; for every other event, one-third of it.
- **Capacity.** The fund's obligation is capped at its claims-paying capacity, up to $17 billion per contract year, rising with a formula tied to its fund balance.
- **Premium.** Actuarially indicated, set per $1,000 of insured value by ZIP code or other area with construction, deductible and coverage factors, using the Florida Commission's accepted hurricane models where feasible, plus a 25% cash build-up factor (since the 2013-2014 contract year).
- **Reporting.** Insured values by ZIP code as of June 30, filed by September 1.
- **Emergency assessments.** When the fund borrows, the Office of Insurance Regulation levies assessments on direct premium for most P&C lines including surplus lines (excluding workers' compensation, medical malpractice, accident and health and NFIP policies): at most 6% of premium for one contract year's obligations and 10% in aggregate.

A worked reimbursement, mine: an insurer elected 90%, and its retention for the year (its reimbursement premium times the adjusted multiple) is $150 million. A hurricane causes $400 million of covered losses.

| Step | Amount |
| --- | --- |
| Losses above retention | $400M − $150M = $250M |
| Reimbursement at 90% | $225.0M |
| LAE add-on at 10% of reimbursed losses | $22.5M |
| **FHCF reimbursement** | **$247.5M**, subject to the insurer's share of the fund's capacity |

A second hurricane in the same year with $200 million of losses is the insurer's second largest event, so the full $150 million retention applies again: 90% × $50 million = $45 million plus $4.5 million, $49.5 million. A third event, if it is not among the two largest, carries a $50 million retention (one-third). The insurer's private towers are built around these numbers: Universal disclosed about $1.390 billion of FHCF coverage for its main insurer at 90%; HCI elected 45% ([Reinsurance Structures](/books/insurance/reinsurance-structures)). Florida's temporary layer below the FHCF retention, created after 2022, is covered in [Stressed & Residual Markets](/books/insurance/stressed-markets).

## The Terrorism Risk Insurance Program

Terrorism losses were made a shared public and private risk by the **Terrorism Risk Insurance Act** of 2002 (Pub. L. 107-297), reauthorized in 2005, 2007, 2015 and most recently by the Terrorism Risk Insurance Program Reauthorization Act of 2019 (Pub. L. 116-94, signed December 20, 2019), which extended the program through **December 31, 2027**, per Treasury. The Act's terms, in the note to 15 U.S.C. 6701:

- **Make available.** Every insurer in the program must make terrorism coverage available in its property and casualty policies on terms that don't differ materially from other events (section 103(c)).
- **Certification.** Losses count only from an act the Secretary of the Treasury certifies; an act can't be certified unless insured losses exceed $5,000,000 in aggregate (section 102(1)).
- **Program trigger.** No federal payment unless aggregate insured losses from certified acts exceed $200,000,000 in a calendar year (for 2020 and later; section 103(e)(1)(B)).
- **Insurer deductible.** 20% of the insurer's direct earned premium for covered lines in the preceding calendar year (section 102(7)).
- **Federal share.** 80% of the insurer's losses above its deductible (for 2020 and later; section 103(e)(1)(A)).
- **Cap.** No federal or insurer liability for aggregate insured losses above $100,000,000,000 in a calendar year (section 103(e)(2)).
- **Recoupment.** Federal payments are recouped through surcharges on policyholders, mandatorily up to the industry's aggregate retention (which rose to $37.5 billion and now equals the average of insurer deductibles over the prior three years), at 140% of the mandatory recoupment amount (section 103(e)(6) and (7)).

A worked loss, mine: an insurer's direct earned premium in covered lines last year was $2.0 billion, so its deductible is $400 million. A certified act causes it $1.0 billion of insured losses (and the industry well over $200 million).

| Step | Amount |
| --- | --- |
| Insurer losses | $1,000M |
| Deductible (20% of $2,000M) | $400M |
| Losses above deductible | $600M |
| Federal share (80%) | $480M |
| Insurer co-share (20%) | $120M |
| **Insurer retains** | **$520M** |

The system consequences: covered-line direct earned premium by year has to be computable exactly (it sets the deductible); every policy records the terrorism offer and the insured's acceptance or rejection under section 103(c); claims carry the certified act; and the recoupment surcharge, if imposed, is a premium entry on policies in force when Treasury sets it.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and [Reinsurance Structures](/books/insurance/reinsurance-structures): a cat bond, ILW, collateralized contract, sidecar quota share, FHCF reimbursement contract or TRIA participation is a `reinsurance_contracts` row (form `cat_xol`, `quota_share` or `state_fund_reimbursement`) with layers and participations. This chapter adds `ils_instruments` (the securities side of a cat bond or ILW), `ils_trigger_observations` (the index or parameter values that decide a payout) and `state_fund_terms` (each year's statutory retention and election).

```sql
CREATE TABLE ils_instruments (             -- a cat bond class, ILW or collateralized deal
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  contract_id        UUID NOT NULL REFERENCES reinsurance_contracts (id),
  issuer_name        TEXT NOT NULL,         -- the special purpose insurer
  class              TEXT NOT NULL,         -- 'Class A'
  kind               TEXT NOT NULL CHECK (kind IN ('cat_bond', 'ilw',
                       'collateralized_re', 'sidecar')),
  trigger_kind       TEXT NOT NULL CHECK (trigger_kind IN ('indemnity',
                       'industry_index', 'parametric', 'modeled_loss')),
  index_source       TEXT,                  -- 'PCS', a measuring agency
  attachment         BIGINT NOT NULL,       -- in the trigger's unit
  exhaustion         BIGINT NOT NULL,
  payout_curve       JSONB,                 -- steps for parametric triggers
  principal          BIGINT NOT NULL,
  risk_period        DATERANGE NOT NULL,
  spread_bp          INT,                   -- over the collateral yield
  collateral_account TEXT NOT NULL,         -- the trust, for credit and audit
  status             TEXT NOT NULL CHECK (status IN ('outstanding', 'triggered',
                       'partially_paid', 'matured', 'extended'))
);

CREATE TABLE ils_trigger_observations (    -- every value that could decide a payout
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id      UUID NOT NULL REFERENCES ils_instruments (id),
  cat_event_id       UUID REFERENCES cat_events (id),
  observed_on        DATE NOT NULL,
  kind               TEXT NOT NULL,         -- 'pcs_preliminary', 'pcs_resurvey',
                                            -- 'sponsor_loss_report', 'wind_speed'
  value              BIGINT NOT NULL,
  is_determination   BOOLEAN NOT NULL DEFAULT FALSE,  -- the one the terms use
  source_ref         TEXT NOT NULL
);

CREATE TABLE state_fund_terms (            -- FHCF and similar, one row per year
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  contract_id        UUID NOT NULL REFERENCES reinsurance_contracts (id),
  contract_year      DATERANGE NOT NULL,    -- [2026-06-01, 2027-06-01)
  coverage_pct_bp    INT NOT NULL CHECK (coverage_pct_bp IN (4500, 7500, 9000)),
  lae_pct_bp         INT NOT NULL,          -- 1000 = 10%
  reimbursement_premium BIGINT NOT NULL,
  retention_multiple NUMERIC(10, 6) NOT NULL,
  full_retention     BIGINT NOT NULL,       -- premium × multiple
  other_event_fraction NUMERIC(6, 5) NOT NULL DEFAULT 0.33333,
  coverage_limit     BIGINT,                -- the insurer's share of capacity
  exposure_snapshot_id UUID REFERENCES exposure_snapshots (id)
);
```

TRIA's deductible is a query: covered-line direct earned premium for the prior calendar year from `premium_entries`, times 20%, stored per year with the line list used. Design choices that matter:

- **The determination value is explicit.** An index bond's terms name which estimate counts; the observation flagged `is_determination` is the one the payout uses, and every earlier observation stays for the record.
- **Collateral is data.** Each instrument's trust account and its balance feed the credit for reinsurance calculation the same way a letter of credit does.
- **Statutory programs are computed, not negotiated.** FHCF retention and reimbursement come from the year's premium, multiple and election by formula; the system recomputes them when the fund publishes final premiums.

## Auditing

- **Every ILS payout reproduces** from the instrument's terms and its determination observation.
- **Collateral balances reconcile** to trustee statements at each statement date.
- **FHCF reimbursements tie** to covered losses by event, the event's rank among the insurer's events (full or one-third retention), the election and the LAE percentage; the September 1 exposure report ties to the policy system as of June 30.
- **TRIA deductibles tie** to prior-year direct earned premium in covered lines, and every policy has a recorded terrorism offer and election.

## What This Means for the System You Build

- **Model cat bonds, ILWs, sidecars and collateralized deals as reinsurance contracts** with an instrument record for the securities side.
- **Record every trigger observation** with its date and source, and mark the one the terms use.
- **Compute statutory programs by formula:** FHCF retention by event rank and election; TRIA deductible from prior-year premium.
- **Treat collateral as part of the recoverable,** tracked by account and date.
- **Keep basis risk visible:** for index and parametric covers, report the recovery next to the sponsor's actual loss for the event.

## References

**Law and regulation**

- [Fla. Stat. 215.555](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0215/Sections/0215.555.html), the Florida Hurricane Catastrophe Fund: mandatory participation, coverage elections, the 10% LAE add-on, the retention formula and multiples, full and one-third retentions, the $17 billion capacity cap, premium by ZIP code, the cash build-up factor, the September 1 exposure report and emergency assessments
- [15 U.S.C. 6701 and note (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/6701), the Terrorism Risk Insurance Act: certification threshold, insurer deductible, program trigger, federal share, $100 billion cap, make-available requirement, aggregate retention and 140% recoupment

**Regulators and guidance**

- [US Treasury: Terrorism Risk Insurance Program](https://home.treasury.gov/policy-issues/financial-markets-financial-institutions-and-fiscal-service/federal-insurance-office/terrorism-risk-insurance-program), the program's history and the 2019 reauthorization through December 31, 2027
- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), alternative risk transfer definitions (cat bonds, collateralized reinsurance, sidecars, ILWs), 2025 cat bond issuance and outstanding, ILS capacity, cyber cat bonds, sidecar capacity and life sidecar reserves, and the parametric market estimate
- [FEMA: NFIP reinsurance program](https://www.fema.gov/flood-insurance/work-with-nfip/reinsurance), the FloodSmart capital markets placements by year, their terms, layers and first-year premiums, named storm scope, and no qualifying events since 2017

**Standards**

- [Verisk: PCS Consolidated Methodology Paper (PDF)](https://www.verisk.com/siteassets/media/pcs/pcs-consolidated-methodology-paper.pdf), PCS estimates as the reference for industry loss warranties and cat bonds, and their timing

**Filings**

- [RenaissanceRe: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/913144/000091314426000012/rnr-20251231.htm), DaVinci, Fontana, Medici, Vermeer, Upsilon, Top Layer and Medici UCITS: what each writes, RenRe's economic ownership and the management and performance fees
- [Universal Insurance Holdings: Form 8-K, May 28, 2026](https://www.sec.gov/Archives/edgar/data/891166/000089116626000053/uve-20260528.htm), estimated FHCF coverage at the 90% election

**In practice**

- [Artemis: Catastrophe bond and ILS market dashboard](https://www.artemis.bm/dashboard/), $65.4 billion outstanding and $19.7 billion of 2026 issuance, and the dashboard's scope
- [Artemis: Guy Carpenter US Property Catastrophe Rate-on-Line Index](https://www.artemis.bm/us-property-cat-rate-on-line-index/), the 16% decline through mid-2026
