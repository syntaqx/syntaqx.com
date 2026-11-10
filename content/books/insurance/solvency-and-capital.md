+++
title = "Solvency & Capital"
description = "Risk-based capital and its action levels worked, trend tests, IRIS ratios, ORSA, holding company rules, dividend limits, group capital and rating agencies."
category = "Insurance Industry"
order = 2711
part = "Regulation and Solvency"
tags = ["insurance", "solvency", "risk-based-capital", "iris-ratios", "orsa", "holding-company"]
+++

An insurer sells promises it will keep years from now, and the regulator's central job is to see that it still can. The tools are layered. Statutory surplus, measured conservatively ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting)), is the cushion. Risk-based capital (RBC) sizes the cushion the company's particular risks call for and ties regulatory action to fixed multiples of it: a plan at 200%, an order at 150%, the right to take control at 100%, a duty to at 70%. Ratio screens (IRIS and the NAIC's analytical tools) flag companies whose numbers move outside normal ranges before capital runs out. The company's own risk assessment (ORSA) shows the regulator how management sees its risks. Holding company laws stop capital from leaving the insurer through dividends or affiliate deals, and group capital and liquidity tests look at the whole group. Outside the regulatory system, rating agencies grade financial strength, and lenders and mortgagees decide which insurers' policies they'll accept on that basis.

For a system, solvency regulation is a set of computations on statutory data, run at least annually and in practice monthly or quarterly by the insurer's own finance and actuarial teams, with legally defined outcomes and deadlines. This chapter works through RBC and its action levels and trend tests, the IRIS ratios with 2025 industry medians, ORSA, holding company rules (dividends, change of control, affiliate transactions, group capital), and rating agencies, and what to keep so each computation can be rerun and explained. When the tools fail and an insurer is taken over is [When Insurers Fail](/books/insurance/when-insurers-fail).

## How the Platforms Do It

Carriers disclose the outputs of these regimes in careful terms, because the RBC model law restricts how RBC may be publicized. As of the 10-Ks for fiscal 2025 and NAIC documents current in November 2026:

| Source | What it shows |
| --- | --- |
| **Progressive** | "At December 31, 2025, our RBC ratios were in excess of minimum requirements"; $28.4 billion of statutory surplus and a 2.9 to 1 premium-to-surplus ratio against a 3 to 1 regulatory benchmark (3.5 to 1 permitted for its personal vehicle subsidiaries in two states); holding company laws "impose prior approval requirements for certain transactions between insurers and their affiliates" |
| **NAIC P&C RBC instructions** | When no action level is triggered, the company is not subject to regulatory attention under the RBC model, and "98.5% of insurers usually fit into this category" |
| **NAIC 2025 IRIS results** | 13 P&C ratios computed for 2,647 companies and 12 life ratios for 721 companies, with means and medians published |
| **NAIC accreditation standards** | The group capital calculation and liquidity stress test from the 2020 holding company model revisions, effective January 1, 2026 |
| **Demotech** | Its Financial Stability Ratings are accepted by "the secondary mortgage marketplace" and "virtually all mortgage lenders," which is what a homeowners writer needs its rating for |

## Risk-Based Capital

RBC was the NAIC's response to the insolvencies of the 1980s: a 1992 GAO report it cites counted 176 life and health insurer insolvencies from 1975 to 1990. The life formula was adopted in 1992 for year-end 1993; the property-casualty formula followed in 1994, health in 1998. The Risk-Based Capital for Insurers Model Act (#312) was adopted in 1993 for life and health insurers and extended to property and casualty insurers later that year; the NAIC lists 2012 as its latest revision, and states have enacted their own versions.

### The Formula

The formula applies factors to statement values to produce a capital requirement for each risk category, then combines them. The NAIC's RBC Preamble (adopted June 18, 2026) describes the life formula's four categories (asset risk, insurance risk, interest rate risk and all other business risk) combined "through a covariance adjustment that recognizes that problems in all risk categories are unlikely to occur simultaneously," and the P&C and health formulas' focus on asset risk, underwriting risk, credit risk and business risk. The P&C formula's components include a credit risk charge (R3, which carries the factors for reinsurance credit risk by reinsurer rating category), underwriting risk charges, and a catastrophe charge (Rcat), to which wildfire (2021) and severe convective storm (2023) were added for information only; the NAIC removed an embedded 2% operational risk load from R3 in 2021. The result of the formula is the **Authorized Control Level RBC (ACL)**, and the insurer's capital measure is **Total Adjusted Capital (TAC)**, essentially statutory surplus with prescribed adjustments. The **RBC ratio** is TAC / ACL.

The Preamble is emphatic about what the ratio is for: RBC sets "threshold levels of capitalization rather than a target level," and "it may not be meaningful to use the RBC formula to compare the RBC ratio developed by one insurance company to the RBC ratio developed by another." Model #312 makes that a legal rule: an advertisement or public statement about an insurer's RBC levels by "any insurer, agent, broker or other person engaged in any manner in the insurance business would be misleading and is therefore prohibited" (except to rebut a materially false published statement), and RBC reports and plans may not be used in ratemaking.

### The Action Levels

Model #312 defines the levels as multiples of ACL and attaches mandatory consequences:

| Level | TAC as a multiple of ACL | What happens |
| --- | --- | --- |
| **No action** | 3.0 or more; or 2.0 to 3.0 without a trend test trigger | None |
| **Company Action Level** | 1.5 to 2.0; or 2.0 to 3.0 with a trend test trigger | The insurer files an RBC plan within 45 days identifying the causes, corrective actions, and projections for the current year and at least four succeeding years with and without them; the commissioner responds within 60 days |
| **Regulatory Action Level** | 1.0 to 1.5 (or failure to file the RBC report) | The insurer files a plan within 45 days; the commissioner examines or analyzes the insurer and issues a corrective order |
| **Authorized Control Level** | 0.7 to 1.0 | The commissioner may take the regulatory action level steps or place the insurer under regulatory control |
| **Mandatory Control Level** | Below 0.7 | The commissioner must place the insurer under regulatory control (for a P&C insurer writing no business, a supervised runoff is allowed; for a life insurer, action may be deferred up to 90 days if the event is reasonably expected to be eliminated) |

RBC reports are due with the annual statement, on or before March 1, and a commissioner can adjust an inaccurate report, which starts the clocks from the adjusted figures (with a right to a confidential hearing). Each "event" can also be triggered by the commissioner's notice of an adjusted report or by failing to follow an accepted plan, so the system's record of an RBC level is the computed one plus any regulatory determination.

### The Trend Tests

Between 200% and 300%, a company with a deteriorating trend is treated as if it were at the Company Action Level:

- **Property and casualty:** "A company whose RBC ratio is greater than or equal to 200 percent and less than 300 percent and combined ratio is greater than 120 percent could trigger a Company Action Level RBC regulatory action per the Trend Test."
- **Life:** the trend test projects the margin forward. It takes the decrease in the margin (TAC minus ACL) from the first prior year, and one third of the decrease from the third prior year, uses the greater as the "marginal difference," subtracts it from current TAC, and triggers the Company Action Level if the result falls below 1.9 times ACL. The NAIC's Capital Adequacy Task Force adopted revisions to these instructions on May 15, 2025 (proposal 2025-07-CA, modified).

### Worked Numbers: Two RBC Results

An illustration, my numbers, run through the model's thresholds.

**A P&C insurer after a bad catastrophe year.** TAC $410 million, ACL $160 million, combined ratio 123%.

| Step | Computation | Result |
| --- | --- | --- |
| RBC ratio | 410 / 160 | 256% |
| Band | 200% to 300%, so the trend test applies | |
| Trend test | Combined ratio 123% > 120% | Triggered |
| Level | Company Action Level (trend test) | RBC plan due within 45 days of filing the RBC report; the commissioner's response within 60 days of receiving it |

If adverse reserve development a year later cuts TAC to $220 million against the same ACL, the ratio is 220 / 160 = 137.5%, below 1.5 but at or above 1.0: a Regulatory Action Level event, with a plan due in 45 days and a corrective order to follow. At $105 million (65.6%) the commissioner would be required to place the company under control.

**A life insurer with a shrinking margin.** ACL $100 million throughout, TAC $240 million (ratio 240%, inside the trend test band), first prior year TAC $300 million against ACL $95 million, third prior year TAC $320 million against ACL $90 million.

| Line | Computation | $ millions |
| --- | --- | --- |
| Current margin | 240 - 100 | 140 |
| First prior year margin | 300 - 95 | 205 |
| Third prior year margin | 320 - 90 | 230 |
| Decrease from first prior year | 205 - 140 | 65 |
| Average decrease over three years | (230 - 140) / 3 | 30 |
| Marginal difference | greater of 65 and 30 | 65 |
| TAC less marginal difference | 240 - 65 | 175 |
| Trigger level | 1.9 × 100 | 190 |
| Result | 175 < 190 | Company Action Level (trend test) |

The classification itself is a few comparisons, and worth implementing exactly as the model states it so it can be tested against the NAIC's own worksheet logic:

```go tab="Go"
type Level string

const (
	None            Level = "none"
	CompanyAction   Level = "company_action_level"
	CompanyTrend    Level = "company_action_level_trend_test"
	RegulatoryAction Level = "regulatory_action_level"
	AuthorizedControl Level = "authorized_control_level"
	MandatoryControl Level = "mandatory_control_level"
)

// RBCLevel classifies total adjusted capital against Authorized Control Level
// RBC under NAIC Model #312. trendTriggered is the P&C combined ratio test
// (above 120%) or the life margin test, computed separately.
func RBCLevel(tac, acl float64, trendTriggered bool) Level {
	switch {
	case tac < 0.7*acl:
		return MandatoryControl
	case tac < 1.0*acl:
		return AuthorizedControl
	case tac < 1.5*acl:
		return RegulatoryAction
	case tac < 2.0*acl:
		return CompanyAction
	case tac < 3.0*acl && trendTriggered:
		return CompanyTrend
	default:
		return None
	}
}

// PCTrendTest is the P&C trend test: ratio from 200% to under 300% and a
// combined ratio above 120%.
func PCTrendTest(tac, acl, combinedRatio float64) bool {
	r := tac / acl
	return r >= 2.0 && r < 3.0 && combinedRatio > 1.20
}
```

```rust tab="Rust"
#[derive(Debug, PartialEq)]
pub enum Level {
    None,
    CompanyAction,
    CompanyActionTrendTest,
    RegulatoryAction,
    AuthorizedControl,
    MandatoryControl,
}

/// Classifies total adjusted capital against Authorized Control Level RBC
/// under NAIC Model #312. `trend_triggered` is the P&C combined ratio test
/// or the life margin test, computed separately.
pub fn rbc_level(tac: f64, acl: f64, trend_triggered: bool) -> Level {
    if tac < 0.7 * acl {
        Level::MandatoryControl
    } else if tac < 1.0 * acl {
        Level::AuthorizedControl
    } else if tac < 1.5 * acl {
        Level::RegulatoryAction
    } else if tac < 2.0 * acl {
        Level::CompanyAction
    } else if tac < 3.0 * acl && trend_triggered {
        Level::CompanyActionTrendTest
    } else {
        Level::None
    }
}

/// The P&C trend test: ratio from 200% to under 300% and a combined ratio
/// above 120%.
pub fn pc_trend_test(tac: f64, acl: f64, combined_ratio: f64) -> bool {
    let r = tac / acl;
    (2.0..3.0).contains(&r) && combined_ratio > 1.20
}
```

The amounts in the real computation are statutory dollars from the annual statement, and the inputs should be stored with the run that produced them; floating point is fine for a ratio classification, never for the amounts themselves ([Money & Amounts](/docs/money/amounts)).

## IRIS Ratios

The Insurance Regulatory Information System is the NAIC's oldest screen: a fixed set of ratios computed from every insurer's annual statement and published with industry means and medians, so a regulator (or anyone) can see where a company sits. The NAIC's 2025 P&C IRIS publication (data year 2025, dated May 19, 2026) covers 2,647 companies and these 13 ratios; the medians shown are those computed excluding default and extreme values (-99, 0 and 999), in percent:

| # | Ratio | 2025 median |
| --- | --- | --- |
| 1 | Gross premium to surplus | 144.0 |
| 2 | Net premium to surplus | 75 |
| 3 | Change in net writings | 5 |
| 4 | Surplus aid to surplus | 5 |
| 5 | Two-year overall operating ratio | 88 |
| 6 | Investment yield | 3.40 |
| 7 | Gross change in surplus | 6.0 |
| 8 | Net change in adjusted policyholders' surplus | 5 |
| 9 | Liabilities to liquid assets | 59 |
| 10 | Agents' balances to surplus | 8 |
| 11 | One-year reserve development to surplus | -1 |
| 12 | Two-year reserve development to surplus | -2 |
| 13 | Estimated current reserve deficiency to surplus | -2 |

The life, accident and health set (721 companies in 2025) has 12 ratios, from net change in capital and surplus through change in reserving ratio. The NAIC warns that small and new companies push the statistics toward extremes and the means "diverge from what would be considered normal." Each ratio also has a "usual range" in the NAIC's IRIS manual, and a company with several ratios outside their ranges draws analyst attention; I have not been able to open the current manual's ranges, so the system should load them as data from the edition the insurer uses rather than from this chapter.<!-- source-gap: iris-usual-ranges | missing | NAIC IRIS P&C and life usual ranges for each ratio (current manual edition) | closes with: the NAIC IRIS Ratios Manual or a state publication reproducing it | checked: 2026-11-09 -->

### Worked Numbers: One Insurer Against the Medians

An illustration, my numbers, for a fast-growing homeowners writer at year-end 2025, in $ millions: gross premiums written 900, net premiums written 600 (a third ceded), prior-year net premiums written 480, policyholders' surplus 300, and prior-year reserves that developed adversely by 21 against prior-year surplus of 280.

| Ratio | Computation | Result | 2025 median |
| --- | --- | --- | --- |
| Gross premium to surplus | 900 / 300 | 300% | 144% |
| Net premium to surplus | 600 / 300 | 200% | 75% |
| Change in net writings | (600 - 480) / 480 | 25% | 5% |
| One-year reserve development to surplus | 21 / 280 | 7.5% | -1% |

Each of these is well above the industry midpoint: twice the leverage of the median company on a net basis, five times the growth, and reserves developing adversely where the median company released them. None is a violation of anything, and the net premium to surplus ratio is still under the 3 to 1 benchmark Progressive cites, but together they describe the profile (rapid growth, heavy reinsurance dependence, reserves catching up) that financial analysts look for before capital runs short. An insurer's own finance team should compute these quarterly on the same definitions, because the regulator will.

## ORSA

The Risk Management and Own Risk and Solvency Assessment Model Act (#505, adopted 2012) requires insurers above a size threshold to maintain a risk management framework, conduct an Own Risk and Solvency Assessment ("a confidential internal assessment" of the material risks of its current business plan and the sufficiency of capital to support them), and file an ORSA Summary Report with the lead state "no more than once each year" on request. The thresholds, from section 6: an insurer is exempt if it has less than $500 million of annual direct written and unaffiliated assumed premium and its group less than $1 billion, both excluding business reinsured with the Federal Crop Insurance Corporation and the federal flood program. If the insurer is under $500 million but the group is over $1 billion, the group's report must cover every insurer in it; the commissioner can require an ORSA anyway for unique circumstances, including the insurer's RBC level. The report is confidential by statute, and reviewing it is part of the accreditation standards for financial analysis. Unlike RBC, ORSA is the insurer's own model: stress scenarios, risk appetite and limits, capital projections, in a form the regulator can challenge.

## Holding Companies and Groups

Most insurers belong to groups, and the holding company act (based on NAIC Models #440 and #450, both accreditation standards) controls the boundary between the regulated insurer and everyone else in the group.

**Change of control.** No one may acquire control of a domestic insurer without the domiciliary regulator's approval. Florida's version (Fla. Stat. 628.461) applies to acquiring "10 percent or more of the outstanding voting securities of a domestic stock insurer or of a controlling company": a notice within 5 days of an acquisition without a tender offer, a full statement within 30 days of the triggering event, and approval deemed unless the office disapproves "within 90 days" of the filing; a person can rebut the presumption of control with a disclaimer.

**Affiliate transactions.** Material transactions between the insurer and affiliates (loans, reinsurance, service and cost-sharing agreements, asset sales) need prior notice to the regulator, who can disapprove; Progressive describes the requirement in its 10-K as "prior approval requirements for certain transactions between insurers and their affiliates."

**Dividends.** Ordinary dividends may be paid within a formula; extraordinary ones need approval. Florida's (Fla. Stat. 628.371) is one of the more detailed: dividends come only from surplus "derived from realized net operating profits" and realized capital gains, and without prior approval may not exceed the largest of (a) the lesser of 10% of surplus or net income (excluding realized gains) plus a two-year carryforward for P&C insurers, (b) 10% of surplus limited to unassigned funds less 25% of unrealized gains, or (c) the lesser of 10% of surplus or net investment income plus a three-year carryforward, similarly limited. Alternatively an insurer may pay up to the greater of 10% of surplus or the prior year's net operating profits and realized gains if surplus afterward is at least "115 percent of the minimum required statutory surplus," on 10 business days' notice with an officer's certification.

**Group capital and liquidity.** The 2020 revisions to #440 and #450 added a group capital calculation (GCC), aggregating RBC-style capital across the group's insurers and non-insurers, and a liquidity stress test (LST) for groups within its scope, both accreditation standards from January 1, 2026 (risk retention groups are subject to the GCC but not the LST, and the commissioner may exempt groups meeting the criteria in section 21 of #450).

### Worked Numbers: Florida's Dividend Limit

An illustration, my numbers, for a Florida-domiciled P&C insurer: policyholders' surplus $400 million (unassigned funds $250 million, unrealized gains $40 million), net income excluding realized gains $30 million, net investment income $18 million, and no carryforward.

| Test | Computation | Limit |
| --- | --- | --- |
| (a) lesser of 10% of surplus or net income | min(40, 30) | $30.0 million |
| (b) 10% of surplus, capped at unassigned funds less 25% of unrealized gains | min(40, 250 - 10) | $40.0 million |
| (c) lesser of 10% of surplus or net investment income, same cap | min(40, 18) | $18.0 million |
| Ordinary dividend without prior approval | largest of the three | **$40.0 million** |

Anything above $40 million is extraordinary and needs the office's approval, which weighs liquidity, premium-to-surplus and the effect on the insurer's financial condition. The holding company's cash plan therefore depends on a statutory computation in each insurer's domicile, each with its own formula, so the dividend capacity is computed per entity from its statutory figures and the domicile's rule row, never assumed.

## Rating Agencies

Regulators decide whether an insurer may operate; rating agencies decide, in effect, who will do business with it. AM Best is the agency most associated with insurer financial strength ratings, alongside S&P, Moody's and Fitch; Demotech, which rates property insurers among others, says its Financial Stability Ratings are accepted by "the secondary mortgage marketplace" and "virtually all mortgage lenders," along with agents' errors and omissions carriers, umbrella markets and premium finance companies. That acceptance is why a rating matters as much as RBC to a homeowners insurer: a mortgage requires hazard insurance from an insurer meeting the investor's rating requirements, so a downgrade below the threshold forces the insurer's mortgaged policyholders to replace their coverage, and the business can disappear faster than the capital does.<!-- source-gap: gse-insurer-rating-minimums | missing | mortgage investors' (Fannie Mae, Freddie Mac) minimum hazard insurer ratings by agency | closes with: Fannie Mae Selling Guide B7-3 insurer rating section opened | checked: 2026-11-09 --> Fronting carriers, reinsurers and commercial buyers have their own minimums, usually stated as a rating in their contracts (MGAs, Programs & Fronting covers fronting).

For a system the rating is a dated attribute of the insurer with its agency, scale and outlook, and the contractual minimums (in reinsurance contracts, fronting agreements, lender requirements, commercial contract certificates) are rules that reference it, so a downgrade can be evaluated against every agreement that names a floor.

## How to Build It

This chapter adds capital snapshots per insurer and period, the RBC calculation with its inputs and determination, IRIS results, ratings and dividend capacity:

```sql
CREATE TABLE capital_snapshots (           -- statutory capital measures per entity and period
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  period_end          DATE NOT NULL,
  statement_run_id    UUID REFERENCES annual_statement_runs (id),
  basis               TEXT NOT NULL CHECK (basis IN ('filed', 'internal_estimate',
                        'projection')),
  policyholders_surplus BIGINT NOT NULL,    -- minor units
  total_adjusted_capital BIGINT,
  gross_premiums_written BIGINT NOT NULL,
  net_premiums_written   BIGINT NOT NULL,
  combined_ratio_bp   INT,                  -- basis points, trade basis
  UNIQUE (insurer_id, period_end, basis)
);

CREATE TABLE rbc_calculations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  snapshot_id         UUID NOT NULL REFERENCES capital_snapshots (id),
  formula             TEXT NOT NULL CHECK (formula IN ('pc', 'life', 'health', 'fraternal')),
  instructions_year   INT NOT NULL,         -- the RBC instructions edition used
  components          JSONB NOT NULL,       -- {"R0": ..., "R3": ..., "R4": ..., "Rcat": ...}
  acl_rbc             BIGINT NOT NULL,
  rbc_ratio_bp        INT NOT NULL,         -- TAC / ACL in basis points
  trend_test          JSONB,                -- inputs and the triggered flag
  computed_level      TEXT NOT NULL,        -- the Model #312 classification
  regulatory_level    TEXT,                 -- after an adjusted report or determination
  plan_due_on         DATE,                 -- 45 days from the event
  plan_filed_on       DATE,
  confidential        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE iris_results (
  snapshot_id         UUID NOT NULL REFERENCES capital_snapshots (id),
  ratio_number        INT NOT NULL,         -- 1..13 for P&C, 1..12 for life
  value_bp            INT NOT NULL,
  usual_range         INT4RANGE,            -- from the manual edition loaded as data
  outside_range       BOOLEAN GENERATED ALWAYS AS
                        (usual_range IS NOT NULL AND NOT usual_range @> value_bp) STORED,
  PRIMARY KEY (snapshot_id, ratio_number)
);

CREATE TABLE insurer_ratings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  agency              TEXT NOT NULL,        -- 'am_best', 'demotech', 'sp', 'moodys', 'fitch'
  rating              TEXT NOT NULL,
  outlook             TEXT,
  effective           DATERANGE NOT NULL
);

CREATE TABLE dividend_capacity (           -- ordinary dividend limit per entity and year
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  year                INT NOT NULL,
  rule_ref            UUID NOT NULL REFERENCES jurisdiction_rules (id),  -- the domicile's formula
  inputs              JSONB NOT NULL,       -- surplus, net income, NII, unassigned funds, ...
  ordinary_limit      BIGINT NOT NULL,
  paid_to_date        BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (insurer_id, year)
);
```

Notes:

- **Projections use the same tables.** `basis = 'projection'` holds the RBC plan's projections (current year plus four succeeding years under Model #312) and ORSA scenarios, so the plan's numbers and the actuals can be compared later.
- **The computed level and the regulatory level are separate columns,** because an adjusted report or a commissioner's determination can set the level that counts.
- **RBC records are confidential by law.** Access control and audit on `rbc_calculations` follow from Model #312's confidentiality section, and nothing from it should flow into marketing or rating systems.

## Auditing

- **Every RBC calculation reproducible:** the statement run, the instructions edition, the components and the trend test inputs, with the level computed and the level the regulator determined.
- **RBC plans and their deadlines,** filed, accepted or revised, with projections kept beside actual results.
- **IRIS ratios each period** with the usual-range edition used and which ratios fell outside.
- **Dividend computations per entity per year,** with the domicile rule applied and every dividend paid against the ordinary limit or an approval.
- **Change-of-control and affiliate transaction filings** with their deemed-approval dates.
- **Ratings history** and every contract minimum it was evaluated against when it changed.

## What This Means for the System You Build

- **Compute RBC, IRIS and premium-to-surplus quarterly on statutory data** with the same definitions regulators use, and store every input.
- **Implement the Model #312 thresholds and trend tests exactly,** and keep the regulator's determination separate from the computed level.
- **Treat RBC results as confidential records** with restricted access, never as marketing.
- **Compute dividend capacity per entity from its domicile's formula,** and block upstream payments that would exceed it without an approval on file.
- **Keep ratings as dated attributes** and contract rating floors as rules, so a downgrade is evaluated against every agreement at once.
- **Store projections and ORSA scenarios beside actuals,** so plans can be checked against what happened.

## References

**Law and regulation**

- [Fla. Stat. 628.371](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0628/Sections/0628.371.html), dividend sources, the three ordinary dividend tests, the 115% minimum surplus alternative with 10 business days' notice, and approval above the limit
- [Fla. Stat. 628.461](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0628/Sections/0628.461.html), acquisition of 10% or more of voting securities, the 5-day notice and 30-day statement, the 90-day deemed approval and disclaimers of control

**NAIC**

- [NAIC: Risk-Based Capital for Insurers Model Act (#312, PDF)](https://content.naic.org/sites/default/files/model-law-312.pdf), the RBC levels as multiples of ACL, the events, the 45-day plans and 60-day response, corrective orders, regulatory control, the March 1 filing, confidentiality, and the prohibition on RBC publicity and ratemaking use
- [NAIC: Risk-based capital](https://content.naic.org/insurance-topics/risk-based-capital), the 300%, 200% and 70% thresholds, the GAO count of 176 insolvencies, and the 1992 life formula, updated June 30, 2026
- [NAIC: RBC Preamble, adopted June 18, 2026 (PDF)](https://content.naic.org/sites/default/files/inline-files/rbcpreamble.pdf), the risk categories and covariance adjustment, the 1994 and 1998 formulas, thresholds not targets, and limits on comparing RBC ratios
- [NAIC: RBC Proposal 2025-07-CA (modified), adopted May 15, 2025 (PDF)](https://content.naic.org/sites/default/files/inline-files/2025-07-CA_0.pdf), the life trend test calculation, the P&C 120% combined ratio trend test, the action level descriptions and the 98.5% note
- [NAIC: Capital Adequacy (E) Task Force](https://content.naic.org/capital_adequacy_task_force.htm), adopted RBC proposals including the R3 operational risk removal and the informational wildfire and convective storm catastrophe charges
- [NAIC: RBC Proposal 2021-14-P (PDF)](https://content.naic.org/sites/default/files/inline-files/2021-14-P%20webposting.pdf), removal of the embedded 2% operational risk from the R3 credit risk component, with R3 and R4 impact figures
- [NAIC: 2025 IRIS ratios, industry means and medians (PDF)](https://content.naic.org/sites/default/files/publication-iris-means-median-2025.pdf), the 13 P&C and 12 life ratios, 2,647 and 721 companies, and medians with and without default values
- [NAIC: Risk Management and Own Risk and Solvency Assessment Model Act (#505, PDF)](https://content.naic.org/sites/default/files/model-law-505.pdf), the ORSA definition, annual filing on request, confidentiality, and the $500 million and $1 billion thresholds
- [NAIC: Financial Regulation Standards and Accreditation Committee](https://content.naic.org/cmte_f.htm), GCC and LST effective January 1, 2026, the RRG treatment and #450 exemptions, and ORSA review in financial analysis standards

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), RBC above minimums, statutory surplus, the premium-to-surplus benchmark, and affiliate transaction approvals

**In practice**

- [Demotech: Financial Stability Ratings](https://www.demotech.com/insurance-carriers/financial-stability-ratings), acceptance by the secondary mortgage marketplace and virtually all mortgage lenders
