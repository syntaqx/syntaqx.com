+++
title = "Crop Insurance"
description = "Federal crop insurance: FCIC, RMA and AIPs, the 2027 SRA's risk sharing worked, subsidies, a revenue guarantee worked, and acreage reporting."
category = "Insurance Industry"
order = 2753
part = "Commercial and Specialty Lines"
tags = ["insurance", "crop-insurance", "agriculture", "federal-programs", "reinsurance", "commercial-lines"]
+++

US crop insurance is a federal program run through private insurers. The Federal Crop Insurance Corporation (FCIC), managed by USDA's Risk Management Agency (RMA, created in 1996), sets the policies, the rates, the subsidies and the rules; Approved Insurance Providers (AIPs) sell and service the policies through licensed agents in every state and Puerto Rico, adjust the claims, and share the underwriting gains and losses with FCIC under a contract called the Standard Reinsurance Agreement (SRA). The farmer pays a fraction of the premium (federal subsidy pays most of it), the AIP receives a federal payment for its administrative and operating costs, and the government reinsures most of the risk.

That makes the line unlike anything else in this volume. The product is not filed state by state; it is a federal regulation (the Common Crop Insurance Policy at 7 CFR 457.8 plus crop provisions and county special provisions) and an actuarial data file FCIC publishes. The calendar is set by crop: sales closing, acreage reporting, premium billing and final planting dates per crop and county. The price is often set by futures markets (revenue protection uses exchange prices at planting and at harvest). And the AIP's books are a monthly settlement with FCIC, not a quota share with a reinsurer. This chapter covers the parties, the 2027 SRA's risk sharing and expense payments with worked numbers, the plans and subsidies, a revenue guarantee worked, and acreage reporting and the data exchange. It extends `policies` and `risks` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `acreage_reports`.

## How the Platforms Do It

As of November 2026:

| Party | Role | What the public record says |
| --- | --- | --- |
| **FCIC and RMA** | Program owner and reinsurer | RMA manages FCIC, which offers the policies; AIPs sell and service them under the SRA |
| **Approved Insurance Providers** | Sell, service, adjust, share risk | Bound by the 2027 SRA, reinsurance year July 1, 2026 to June 30, 2027 |
| **Palomar** | AIP-affiliated crop writer | 2025 crop gross written premium of $247.5 million (12.2% of its total, up from $116.2 million), after buying Advanced AgProtection, a Texas MGA, in April 2025 to form Palomar Crop Insurance Services |
| **Skyward Specialty** | Agriculture division | Agriculture and Credit (Re)insurance is one of its nine underwriting divisions |

## The Program in Numbers

FCIC's Summary of Business as of November 9, 2026 (all plans except livestock):

| Crop year | Liability | Total premium | Subsidy | Indemnity | Loss ratio |
| --- | --- | --- | --- | --- | --- |
| 2023 | $181.62B | $18.11B | $11.33B | $17.79B | 0.98 |
| 2024 | $158.68B | $15.88B | $9.88B | $15.18B | 0.96 |
| 2025 | $159.36B | $16.83B | $10.59B | $11.61B | 0.69 |
| 2026 (to date) | $168.10B | $18.92B | $13.15B | $6.55B | 0.35 |

Subsidy was 63% of premium in 2025 and is about 70% of 2026 premium to date, reflecting the higher subsidy rates now in the statute (below). The 2026 indemnity is incomplete: claims for fall harvests are still being reported. The Summary is refreshed weekly, so every figure from it needs its as-of date.

## The Standard Reinsurance Agreement

The SRA is a cooperative financial assistance agreement under which FCIC provides "reinsurance and subsidies on eligible crop insurance contracts" to an AIP that is in good financial standing and complies with the state laws where it is domiciled and writes business. The 2027 SRA runs for the reinsurance year beginning July 1. Its key mechanics:

**Fund designation.** The AIP may designate each policy, by state, to the **Assigned Risk Fund**; everything else goes to the **Commercial Fund**. The AIP keeps a 20% interest in premium and losses in the Assigned Risk Fund and cedes the rest to FCIC, and Assigned Risk premium may not exceed 75% of the AIP's net book premium in a state. In the Commercial Fund it keeps at least 35%, chosen in 5% increments in its plan of operations, and cedes the rest.

**Gain and loss sharing on what it keeps.** On its retained net book premium, the AIP's share of underwriting gain or loss is set by bands of its loss ratio, by fund and by state group (State Group 1 is Illinois, Indiana, Iowa, Minnesota and Nebraska; Groups 2 and 3 are the rest). For the Commercial Fund:

| Loss ratio band | Company share, State Group 1 | Company share, State Groups 2 and 3 |
| --- | --- | --- |
| Gain: 65% to 100% | 75.0% | 97.5% |
| Gain: 50% to 65% | 40.0% | 40.0% |
| Gain: below 50% | 5.0% | 5.0% |
| Loss: 100% to 160% | 65.0% | 42.5% |
| Loss: 160% to 220% | 45.0% | 20.0% |
| Loss: 220% to 500% | 10.0% | 5.0% |
| Loss: above 500% | 0% (FCIC takes 100%) | 0% |

For the Assigned Risk Fund the loss shares are 7.5%, 6.0% and 3.0% in the three loss bands. Then the **net book quota share**: the AIP cedes 6.5% of its cumulative underwriting gain or loss to FCIC. Gains are paid at annual settlement, losses monthly. A share of FCIC's net gain on that quota share (1.5% of all AIPs' combined gains and losses) is paid back to AIPs in proportion to their State Group 3 premium.

**Expense payments.** FCIC pays A&O subsidy as a percentage of net book premium, after the AIP submits and FCIC accepts the acreage reports: 21.9% for most additional coverage policies and 18.5% for revenue plans that can increase liability when the harvest price exceeds the planting price, 12.0% for most area-based plans and the supplemental coverage option, 0% A&O but 6.0% CAT LAE for catastrophic coverage. The total A&O across all AIPs is capped by a formula tied to total liability and an inflation factor (1.1085), with a pro rata reduction if the cap binds.

### Worked SRA Settlement

The book is mine; the percentages are the 2027 SRA's. An AIP writes $10,000,000 of net book premium in Iowa (State Group 1), all designated to the Commercial Fund at the minimum 35% retention. Retained net book premium is $3,500,000.

**A good year, loss ratio 70%.** The loss ratio falls in the 65% to 100% gain band only.

| Step | Computation | Amount |
| --- | --- | --- |
| Gain, 65-100% band | $3,500,000 × (100% − 70%) × 75.0% | $787,500.00 |
| Net book quota share to FCIC | 6.5% × $787,500 | −$51,187.50 |
| Company's underwriting gain | | $736,312.50 |

**A drought year, loss ratio 180%.** The loss reaches the second loss band.

| Step | Computation | Amount |
| --- | --- | --- |
| Loss, 100-160% band | $3,500,000 × (160% − 100%) × 65.0% | $1,365,000.00 |
| Loss, 160-220% band | $3,500,000 × (180% − 160%) × 45.0% | $315,000.00 |
| Retained underwriting loss | | $1,680,000.00 |
| Net book quota share to FCIC | 6.5% × $1,680,000 | −$109,200.00 |
| Company's underwriting loss | | $1,570,800.00 |

Gross losses on the $10 million book at 180% are $18 million, of which $8 million is the underwriting loss on the whole book; the AIP bears $1.57 million of it and FCIC the rest. The A&O subsidy (21.9% or 18.5% of net book premium by plan, about $2 million here) is paid regardless, which is what funds agents' commissions and loss adjusting.

## Plans and Subsidy

The main plans of insurance, from the policy's own terms:

- **Yield protection** guarantees a number of bushels: the production guarantee per acre is "the approved yield per acre by the coverage level percentage you elect," where the approved yield comes from the farmer's actual production history (APH) database.
- **Revenue protection** guarantees revenue: "the production guarantee (per acre) by the greater of your projected price" or the harvest price, both set under the Commodity Exchange Price Provisions from futures prices. Production to count is valued at the harvest price.
- **Revenue protection with the harvest price exclusion** uses only the projected price in the guarantee.
- **Area plans** pay on a county's yield or revenue rather than the farm's, and the supplemental coverage option tops up an underlying policy on an area basis.
- **Catastrophic coverage (CAT)** covers losses beyond 50% of yield at 55% of the expected market price, with the premium paid in full by FCIC and a $655 administrative fee per crop per county.

The farmer chooses a coverage level (50% to 85% of the approved yield, in 5% steps) and a unit structure (basic, optional, enterprise). FCIC pays a percentage of the premium by coverage level under 7 USC 1508(e), as the statute stands in November 2026:

| Coverage level | Premium paid by FCIC |
| --- | --- |
| 50% to under 55% | 67% |
| 55% to under 65% | 69% |
| 65% to under 75% | 64% |
| 75% to under 80% | 60% |
| 80% to under 85% | 51% |
| 85% and above | 41% |

Enterprise and whole farm units may receive a higher share, at up to 80% of the premium; beginning and veteran farmers get 10 more percentage points, and beginning farmers further points in their first four years; the supplemental coverage option gets 80%. Additional coverage carries a $30 administrative fee per crop per county.

### Worked Revenue Guarantee

The yields and prices are mine and illustrative. A farmer insures 500 acres of corn as a basic unit under revenue protection at 80% coverage, with an approved yield of 180 bushels per acre, a projected price of $4.60 and a total premium of $30.00 per acre.

| Step | Computation | Result |
| --- | --- | --- |
| Production guarantee | 180 bu × 80% | 144 bu per acre |
| Premium | $30.00 × 500 acres | $15,000.00 |
| FCIC subsidy at 80% coverage | 51% × $15,000 | $7,650.00 |
| Farmer pays | $15,000 − $7,650 + $30 administrative fee | $7,380.00 |

Harvest: the farm produces 120 bushels per acre, 60,000 bushels.

| | Harvest price $4.20 | Harvest price $5.10 | $5.10 with harvest price exclusion |
| --- | --- | --- | --- |
| Guarantee per acre | 144 × max($4.60, $4.20) = $662.40 | 144 × max($4.60, $5.10) = $734.40 | 144 × $4.60 = $662.40 |
| Guarantee, 500 acres | $331,200.00 | $367,200.00 | $331,200.00 |
| Revenue to count | 60,000 × $4.20 = $252,000.00 | 60,000 × $5.10 = $306,000.00 | $306,000.00 |
| Indemnity | $79,200.00 | $61,200.00 | $25,200.00 |

The upward harvest price is the feature the SRA singles out: revenue plans "that can increase liability whenever the market price at the time of harvest exceeds the market price at the time of planting" are paid A&O at 18.5% rather than 21.9%.

The calculation in code is a few lines; the inputs (approved yield, prices, production to count) are what take a season to establish:

```go tab="Go"
type RPInputs struct {
	Acres          decimal.Decimal
	ApprovedYield  decimal.Decimal // bu per acre, from the APH database
	CoverageLevel  decimal.Decimal // 0.80
	ProjectedPrice decimal.Decimal // per bu, Commodity Exchange Price Provisions
	HarvestPrice   decimal.Decimal
	ProductionToCount decimal.Decimal // bu, appraised plus harvested
	HarvestPriceExclusion bool
}

// RPIndemnity returns the guarantee and indemnity for a unit, in dollars.
func RPIndemnity(in RPInputs) (guarantee, indemnity decimal.Decimal) {
	price := in.ProjectedPrice
	if !in.HarvestPriceExclusion && in.HarvestPrice.GreaterThan(price) {
		price = in.HarvestPrice
	}
	perAcre := in.ApprovedYield.Mul(in.CoverageLevel).Mul(price)
	guarantee = perAcre.Mul(in.Acres)
	revenue := in.ProductionToCount.Mul(in.HarvestPrice)
	indemnity = decimal.Max(decimal.Zero, guarantee.Sub(revenue))
	return guarantee, indemnity
}

// 500 ac, 180 bu, 80%, $4.60 / $4.20, 60,000 bu: guarantee 331200, indemnity 79200
```

```rust tab="Rust"
use rust_decimal::Decimal;

pub struct RpInputs {
    pub acres: Decimal,
    pub approved_yield: Decimal,      // bu per acre, from the APH database
    pub coverage_level: Decimal,      // 0.80
    pub projected_price: Decimal,     // per bu, Commodity Exchange Price Provisions
    pub harvest_price: Decimal,
    pub production_to_count: Decimal, // bu, appraised plus harvested
    pub harvest_price_exclusion: bool,
}

/// Guarantee and indemnity for a unit, in dollars.
pub fn rp_indemnity(i: &RpInputs) -> (Decimal, Decimal) {
    let price = if i.harvest_price_exclusion {
        i.projected_price
    } else {
        i.projected_price.max(i.harvest_price)
    };
    let guarantee = i.approved_yield * i.coverage_level * price * i.acres;
    let revenue = i.production_to_count * i.harvest_price;
    (guarantee, (guarantee - revenue).max(Decimal::ZERO))
}

// 500 ac, 180 bu, 80%, $4.60 / $4.20, 60,000 bu: guarantee 331200, indemnity 79200
```

## The Crop Calendar

Every federal policy runs on dates in the crop provisions and county special provisions, and the system needs them per crop, county and crop year:

- **Sales closing date:** "A date contained in the Special Provisions by which an application must be filed," and the last date to change coverage for the crop year.
- **Cancellation date:** the date on which coverage "will automatically renew"; either party may cancel in writing before it. Federal crop policies are continuous: they renew every year until cancelled.
- **Acreage reporting date:** the date by which the annual acreage report is due.
- **Premium billing date:** the premium "is earned and payable at the time coverage begins," and billed no earlier than the billing date in the special provisions.
- **Final planting and late planting dates, end of insurance period, and notice of loss deadlines,** from the crop provisions.

## Acreage Reporting and the Data Exchange

The acreage report is the policy's exposure declaration. "An annual acreage report must be submitted to us on our form for each insured crop in the county," on or before the acreage reporting date (7 CFR 457.8 section 6(a)): every field's acres, crop, type and practice, planting date and the insured's share. Liability and premium are computed from it, so until it is filed the policy has a guarantee in principle and no amount.

Misreporting has defined consequences (section 6(g)). If the report understates liability, "the production guarantee or amount of insurance on the unit will be reduced to an amount consistent with the reported information"; if it overstates, the report is corrected to the right information. A share reported too low is used as reported for claims; a share reported too high is corrected to the share the insurer determines.

The AIP reports everything to FCIC: applications, acreage, production and claims flow to FCIC's systems as data, and the SRA ties money to them. A&O subsidy is paid only after FCIC accepts the acreage reports, starting with the September monthly settlement after the reinsurance year ends; underwriting gains and losses are settled monthly and annually from the same data. The SRA's appendices cover the AIP's regulatory duties, its plan of operations (fund designations and retentions, by state), quality assurance and program integrity. The actuarial data (rates, prices, dates, yields by county) comes from FCIC's published files and is the only source of those numbers; the AIP's own rating system can't vary them.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). A crop policy is a continuous `policies` row with one `policy_terms` row per crop year; each insured unit is a `risks` row of kind `other` with crop, county, plan and unit structure; the acreage report fills in the exposure. FCIC is the reinsurer under a `reinsurance_contracts` row per reinsurance year and state, with fund designations.

```sql
CREATE TABLE crop_dates (                  -- the calendar from the special provisions
  crop_year          INT NOT NULL,
  crop_code          TEXT NOT NULL,         -- FCIC commodity code
  state_county_fips  TEXT NOT NULL,
  sales_closing      DATE NOT NULL,
  cancellation       DATE NOT NULL,
  acreage_reporting  DATE NOT NULL,
  premium_billing    DATE NOT NULL,
  final_planting     DATE,
  end_of_insurance   DATE,
  source             TEXT NOT NULL,         -- FCIC actuarial data release identifier
  PRIMARY KEY (crop_year, crop_code, state_county_fips)
);

CREATE TABLE acreage_reports (             -- one per policy, crop, county and crop year
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  crop_code          TEXT NOT NULL,
  state_county_fips  TEXT NOT NULL,
  version            INT NOT NULL,          -- revisions are new versions
  signed_at          TIMESTAMPTZ NOT NULL,
  due_on             DATE NOT NULL,         -- crop_dates.acreage_reporting
  fcic_accepted_at   TIMESTAMPTZ,           -- gates A&O subsidy
  revision_reason    TEXT,                  -- 'insured_correction', 'misreport_6g', ...
  document_id        UUID NOT NULL,
  UNIQUE (policy_term_id, crop_code, state_county_fips, version)
);

CREATE TABLE acreage_report_lines (        -- each field or planted unit
  acreage_report_id  UUID NOT NULL REFERENCES acreage_reports (id),
  line_no            INT NOT NULL,
  unit_number        TEXT NOT NULL,
  field_ref          TEXT,                  -- FSA farm, tract and field
  acres              NUMERIC(10, 2) NOT NULL,
  crop_type          TEXT,
  practice           TEXT,                  -- 'irrigated', 'non_irrigated', ...
  planted_on         DATE,
  share              NUMERIC(6, 5) NOT NULL, -- 0.50000 for a 50% landlord share
  approved_yield     NUMERIC(10, 2),
  coverage_level     NUMERIC(4, 2) NOT NULL,
  plan_code          TEXT NOT NULL,         -- yield, revenue, revenue with HPE, area, CAT
  liability          BIGINT NOT NULL,       -- computed, minor units
  premium            BIGINT NOT NULL,
  subsidy            BIGINT NOT NULL,
  PRIMARY KEY (acreage_report_id, line_no)
);

CREATE TABLE sra_designations (            -- plan of operations: fund and retention by state
  reinsurance_year   INT NOT NULL,          -- year containing June
  state              TEXT NOT NULL,
  policy_term_id     UUID REFERENCES policy_terms (id),  -- null for the state default
  fund               TEXT NOT NULL CHECK (fund IN ('commercial', 'assigned_risk')),
  retention_pct      NUMERIC(5, 2) NOT NULL, -- 20 for assigned risk; 35-100 by 5 commercial
  designated_at      TIMESTAMPTZ NOT NULL,
  CHECK (fund <> 'commercial' OR (retention_pct >= 35 AND MOD(retention_pct, 5) = 0)),
  CHECK (fund <> 'assigned_risk' OR retention_pct = 20)
);
```

Design notes:

- **The actuarial data is reference data with a release.** Rates, prices, dates and county yields are loaded from FCIC's releases with their identifiers, never typed, and every line records the release it was rated on.
- **The acreage report is versioned.** Revisions are new versions with a reason, so a section 6(g) correction after a claim shows what was reported, when, and what changed.
- **Liability and premium are computed per line** and summed to the unit and policy; the insured's premium is net of subsidy, and subsidy is a separate `premium_entries` kind so the settlement with FCIC reconciles.
- **Settlement is a ledger with FCIC.** Monthly and annual settlement reports produce entries for ceded premium, ceded losses, A&O subsidy and gains or losses per fund and state, computed by the SRA's bands as a pure function of the period's data.

## Auditing

- **Every acreage report version,** with signing, due date, FCIC acceptance and any revision under section 6(g).
- **Rating inputs by release:** the actuarial data release, approved yield and APH records, coverage level, plan and prices used on every line.
- **Fund designations and retentions** per state and reinsurance year, against the plan of operations, with their timestamps.
- **Settlement calculations:** each month's and year's gain or loss by fund, state group and band, the quota share and the A&O subsidy, reproducible from the underlying policy data.

## What This Means for the System You Build

- **Load FCIC's actuarial data by release** and rate only from it.
- **Drive the policy year from the crop calendar** per crop and county: sales closing, acreage reporting, billing, cancellation.
- **Treat the acreage report as the exposure,** versioned, with the section 6(g) consequences applied as rules.
- **Separate insured premium from subsidy** so the FCIC settlement reconciles.
- **Compute SRA gains and losses by fund, state group and band,** then the 6.5% quota share, as a reproducible function.
- **Gate A&O expectations on FCIC's acceptance** of acreage reports.

## References

**Law and regulation**

- [7 USC 1508](https://www.law.cornell.edu/uscode/text/7/1508), premium subsidy by coverage level, enterprise and whole farm units, beginning and veteran farmer assistance, CAT coverage at 50% and 55% with its $655 fee, and the $30 fee for additional coverage
- [7 CFR 457.8](https://www.law.cornell.edu/cfr/text/7/457.8), the Common Crop Insurance Policy Basic Provisions: production and revenue protection guarantees, the harvest price exclusion, projected and harvest prices, sales closing and cancellation dates, the acreage report and its misreporting rules, and premium earned when coverage begins

**Regulators and guidance**

- [USDA RMA: About RMA](https://www.rma.usda.gov/about-rma), RMA's creation in 1996, its management of FCIC and AIPs selling in every state and Puerto Rico
- [USDA RMA: Reinsurance agreements](https://www.rma.usda.gov/policy-procedure/reinsurance-agreements), the SRA and LPRA as cooperative financial assistance agreements and the 2027 reinsurance year
- [USDA RMA: 2027 Standard Reinsurance Agreement (PDF)](https://www.rma.usda.gov/sites/default/files/2026-03/SRA_2027.pdf), the reinsurance year, fund designations and retentions, gain and loss bands by state group, the 6.5% net book quota share, A&O subsidy and CAT LAE rates and the A&O cap
- [FCIC: Summary of Business, as of November 9, 2026 (PDF)](https://pubfs-rma.fpac.usda.gov/pub/sob/current_week/sobrpt2023-2026.pdf), liability, premium, subsidy, indemnity and loss ratio for crop years 2023 to 2026

**Filings**

- [Palomar Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1761312/000119312526067364/plmr-20251231.htm), crop gross written premium and the Advanced AgProtection acquisition
- [Skyward Specialty: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1519449/000151944926000015/skwd-20251231.htm), the Agriculture and Credit (Re)insurance division
