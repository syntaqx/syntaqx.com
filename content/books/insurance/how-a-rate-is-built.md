+++
title = "How a Rate Is Built"
description = "The filed rating algorithm: base rates, territories, class and deductible factors, loss costs and LCMs, rounding order, and a North Carolina auto premium."
category = "Insurance Industry"
order = 2719
part = "Rating and Underwriting"
tags = ["insurance", "rating", "rate-manuals", "loss-costs", "personal-auto", "rating-engine"]
+++

An insurance rate is a filed price list plus a filed recipe. The list is a set of tables: a base rate for each coverage in each territory, and factors (relativities) for the driver class, the vehicle, the limit, the deductible, the driving record and every discount. The recipe is the order in which those tables are read, multiplied, added and rounded. Both are part of the rate filing, and in most states charging anything other than what the filing produces is a violation, whether the difference is a wrong factor or a rounding step done in the wrong place. A market conduct examiner tests a rating engine by rerating a sample of policies by hand from the filed manual and comparing to the penny.

That makes a rating engine an unusual piece of software. Its logic is owned by actuaries and regulators, not engineers; it changes on a schedule set by filings, by state, with effective dates that apply to new business and renewals separately; and every result has to be explainable after the fact, step by step, for a policy quoted years ago. This chapter covers the rating algorithm as filed, the tables it reads, how advisory organizations' loss costs become a company's rates, the rounding order, a worked personal auto premium from a published North Carolina manual, and how rate changes get versioned and dated. What you may and may not rate on is What You May Rate On; the filing process itself (prior approval, file-and-use, SERFF, objections) is Filing Rates & Forms.

## How the Platforms Do It

Rating content comes from three places: an advisory organization or rating bureau that publishes manuals and loss costs, the insurer's own actuarial filing, and the software that executes it. As of November 2026:

| Source or platform | What it provides | How rating content is represented |
| --- | --- | --- |
| **North Carolina Rate Bureau (NCRB)** | A bureau rate for nonfleet private passenger auto that member companies charge, with deviations allowed by filing | A Personal Auto Manual (rules) plus rate pages by territory, published as spreadsheets of base rates for liability and physical damage effective October 1, 2025 |
| **Texas Automobile Insurance Plan Association (TAIPA)** | Texas's residual market for auto | A rate bulletin that is a pure territory by class matrix: bodily injury and property damage dollar rates at 30/60/25 for each class code in each territory, effective November 1, 2025 |
| **Verisk (ISO)** | Advisory prospective loss costs, rules and forms for most P&C lines; ISO Electronic Rating Content (ERC) for commercial lines | Rating data as CSV files and rules as XML organized by ISO rule, plus a hosted Rating-as-a-Service call; Verisk says it makes 3,000 to 4,000 commercial lines program changes a year |
| **Guidewire PolicyCenter** | Core policy system with rating inside the policy transaction | Rating runs when a job is quoted; a job can carry multiple quoted versions for side-by-side comparison, and rating overrides are a documented feature |
| **Socotra** | Cloud core policy system | Rating is a Java `RatePlugin` the insurer writes, returning a `RatingSet` of `RatingItem`s (element locator, charge type, rate); only one charge per charge type per element, and a successful run moves the quote or transaction to `priced` |

Two patterns cover nearly everyone. **Tables plus an algorithm** (bureaus, most personal lines carriers, ISO's content): the logic is a fixed sequence of lookups and arithmetic, and a change is a new table version. **Code as the algorithm** (Socotra's plugin, custom engines at direct writers): the rating step is a program, and the filing describes what the program does. Either way the filed manual is the specification and the engine is an implementation of it, which is why the worksheet (every input, every factor looked up, every intermediate result) is stored with each quote.

## What a Rate Manual Contains

A personal lines manual has the same parts whether a bureau or a carrier writes it. North Carolina's Personal Auto Manual, as its own index shows, is organized into general rules (eligibility, definitions, classifications, the Safe Driver Insurance Plan, model year rating, a minimum premium rule, policy period, changes, cancellation with pro rata and short rate tables, a whole dollar premium rule, physical damage base rates for symbols not shown, suspension), coverage rules (miscellaneous coverages, uninsured motorists, miscellaneous vehicle types) and territory pages. In order of how rating reads them:

- **Eligibility and definitions.** Who and what the manual applies to; anything outside goes to another program or the residual market.
- **Territories.** A mapping from garaging location (ZIP code, county, census block or a polygon) to a territory code. North Carolina's liability rate pages run from territory 110 to 490; TAIPA's run from 01 to 66 with gaps.
- **Base rates.** A dollar amount per coverage per territory at a base limit and deductible: the price of the reference risk.
- **Relativities.** Multiplicative factors for everything that differs from the reference risk: driver class (age, experience, use), vehicle (symbol, model year), limits (increased limits factors), deductibles, driving record, and discounts and surcharges.
- **Additive charges.** Flat amounts that don't scale with the base: an expense constant, a policy fee where allowed, a per-vehicle charge for a coverage like roadside assistance.
- **Rules of application.** Which rates apply to which policies (new business and renewals effective on or after a date), how midterm changes are rated, minimum premiums, rounding.

The North Carolina rate pages make the structure concrete. Effective October 1, 2025, territory 110's voluntary base rates are $213 for bodily injury at 50/100, $302 for property damage at $50,000 and $13 for medical payments at $500, with a note to refer to Rule 18 for other limits. Its physical damage page for model year 2026, symbol 11, prices comprehensive at $134 with full coverage and $103 with a $500 deductible, and collision at $647 with a $100 deductible and $602 with $500. The page prints the deductible factors that produce those rates: 0.77 for a $500 comprehensive deductible and 0.93 for a $500 collision deductible, against the full-coverage and $100 bases. And $134 × 0.77 = $103.18, printed as $103; $647 × 0.93 = $601.71, printed as $602. A rate page is itself the output of an algorithm, rounded to whole dollars at the point of printing.

## Territories

A territory is a geographic rating cell. Historically territories were groups of counties or ZIP codes defined in the manual; modern filings often rate at a finer grain (a census block group, a grid cell, a distance-to-coast band for wind) and present the result as a factor. Three things make them hard in software:

- **The address has to be resolved the way the filing says.** A ZIP code that straddles two territories, a rural route, a new subdivision. The filing defines the rule (the territory of the garaging address, the county of the ZIP centroid, a geocoded point inside a polygon) and the engine has to apply that rule, not a convenient geocoder default.
- **Territory definitions change with filings.** A new territory map is a new table version, effective for new business and renewals on its date. A policy rated in territory 140 last year may renew in territory 145; the old policy's worksheet must still show 140.
- **Midterm moves re-rate pro rata.** North Carolina's Rule 9 lets the premium be adjusted by endorsement when an auto moves to another rating territory, or moves temporarily for at least 30 consecutive days, charging "on a pro rata basis the rate or rates for the territories in which the auto is garaged during the remainder of the policy period."

Territory is also where rating meets fairness law. A territory factor built from loss experience can correlate with race or income, which is why some states restrict how territories are drawn and why the disparate impact debate in What You May Rate On reaches territories as well as credit.

## Loss Costs and Loss Cost Multipliers

Most commercial lines, homeowners in many states and workers' compensation are rated from **prospective loss costs**: an advisory organization (ISO, AAIS, NCCI or an independent bureau) files the expected losses and loss adjustment expense per unit of exposure, by class and territory, with no provision for the insurer's expenses or profit. Each insurer then files its own **loss cost multiplier** (LCM), and its rate is the loss cost times the multiplier. New Jersey's rule states the mechanics plainly: the insurer's final rates are the combination of the advisory organization's prospective loss costs and the LCM in its filed Reference Filing Adoption Form; the LCM stays in effect until withdrawn or revised and applies automatically to later loss cost revisions; an insurer that wants a different effective date or a new multiplier files within 30 days after the organization's effective date, and one that won't use a revision files a non-adoption form within the same 30 days (N.J.A.C. 11:13-8.4).

NAIC's model loss cost filing document (effective November 8, 2022) is the calculation every state's form follows:

1. **Loss cost modification factor.** The insurer's view of its own losses relative to the advisory loss costs: 0% is 1.00, -10% is 0.900, +15% is 1.150.
2. **Expense provisions** as a share of premium: commission and brokerage, other acquisition, general expenses, taxes, licenses and fees, and underwriting profit and contingencies (with consideration of investment income).
3. **Permissible loss ratio** = 100% minus total expenses; **expense multiplier** = 1.000 / permissible loss ratio.
4. **Additional adjustments** for LAE or assessments not in the loss costs, and the impact of expense constants and minimum premiums.
5. **Formula LCM** = (modification factor × expense multiplier) × (loading factor / expense constant and minimum premium impact), and a **selected LCM**, with any difference beyond rounding explained.

A worked example, mine, using the form's arithmetic: commission 12.0%, other acquisition 6.0%, general expenses 5.0%, taxes, licenses and fees 3.0%, and profit and contingencies 4.0% total 30.0%, so the permissible loss ratio is 70.0% and the expense multiplier is 1 / 0.700 = 1.4286. With a loss cost modification of -5% (0.950) and no other adjustments, the formula LCM is 0.950 × 1.4286 = 1.357. An advisory loss cost of $250.00 for a class and territory becomes a rate of $250.00 × 1.357 = $339.25. When the advisory organization revises the loss cost to $262.50 next year, an insurer that filed its LCM to apply to future revisions charges $262.50 × 1.357 = $356.21 from the organization's effective date without refiling. In software this means the loss cost table and the LCM are separate versioned tables, and the rate is computed, not stored: storing the product would lose the ability to adopt the next loss cost circular automatically.

Personal auto in most states is rated from the insurer's own filed rates rather than loss costs. North Carolina is a bureau-rate state: the NCRB files rates for nonfleet private passenger auto each year (its 2026 filing, a statutorily required rate review, proposed no rate level change), member companies use them, and deviations from bureau rates are filed separately and published by the bureau quarterly.

## The Rating Algorithm and Its Order

The algorithm is a sequence, and the sequence matters because multiplication commutes but rounding, minimums, caps and additive charges do not. A generic personal auto algorithm, per vehicle and coverage:

1. Look up the **base rate** for the coverage and territory.
2. Multiply by the **class or driver factor** for the assigned driver (or a composite of drivers, per the manual's assignment rule).
3. Multiply by **vehicle factors** (symbol or rating group, model year) for physical damage, and sometimes for liability.
4. Multiply by the **increased limits factor** or **deductible factor** for the selected limit or deductible.
5. Apply the **driving record** factor or surcharge.
6. Apply **discounts and surcharges** in the filed order (multi-car, multi-policy, safety equipment, telematics, paid in full), each sometimes capped in combination.
7. Add **additive charges** and apply the **minimum premium**.
8. **Round** at the step and to the unit the manual says.
9. Sum across coverages and vehicles; add policy-level fees.

Filings disagree on details that change the answer: whether discounts multiply (0.90 × 0.95 = 0.855) or add (1 - 0.10 - 0.05 = 0.85), whether a surcharge is a factor on the base (North Carolina's style, below) or on the running premium, whether rounding happens per factor, per coverage or only at the end, and whether a minimum applies per coverage or per policy. North Carolina's manual has a separate Whole Dollar Premium rule, and the rate pages show that printed rates are already rounded to whole dollars. A rating engine encodes the order as data (the step list with its operations) rather than as the order of lines in a function, so the next filing that moves a discount ahead of a cap is a table change, and the worksheet records which step list was used ([Stages and Ordered Rules](/docs/building-blocks/rules-as-data#stages-and-ordered-rules)).

### Driving Record Surcharges

North Carolina's Safe Driver Insurance Plan (SDIP) shows a surcharge built as a separate premium. The manual's rule for motorcycles spells out the steps the plan uses: determine the base premium for each coverage, determine the Driving Record Surcharge Premium "by multiplying the motorcycle base premium by the SDIP rating factor," then add the base premium and the surcharge premium. The Department of Insurance publishes the plan's points and percentages: 1 point is a 40% rate increase, 2 points 55%, 3 points 70%, 4 points 90%, 8 points 200%, 10 points 260% and 12 points 340%. A speeding conviction of 10 mph or less over a limit under 55 mph is 1 point, and an at-fault accident with total property damage of $2,300 or less is 1 point unless the accident-exemption conditions are met. For policies on or after July 1, 2025 the experience period for 4 or more points is five years before the application, and the surcharge lasts five policy years.

## A Worked Premium

A North Carolina personal auto premium, built from the bureau's published October 1, 2025 rate pages and the SDIP percentages. The policy: one 2026 car, symbol 11, garaged in territory 110, with the state's minimum liability limits as the rate page shows them (bodily injury 50/100, property damage $50,000), $500 medical payments, and $500 deductibles on comprehensive and collision; one driver with 1 SDIP point for a minor speeding conviction. Two simplifications, both mine: the primary classification factor is taken as 1.00 because the manual's classification factor table is distributed through the bureau's member portal rather than published, and uninsured and underinsured motorists coverage (required in North Carolina and priced from Rule 14's table) is left out.<!-- source-gap: ncrb-classification-factors | missing | the NCRB Personal Auto Manual's Primary Classification Rating Factor table and SDIP application to physical damage | closes with: a published copy of NC-GR-17 to NC-GR-19 (manual pages or a filing exhibit) | checked: 2026-11-09 -->

| Step | Bodily injury | Property damage | Medical payments | Comprehensive | Collision |
| --- | --- | --- | --- | --- | --- |
| Base rate, territory 110 | $213.00 | $302.00 | $13.00 | $134.00 (full) | $647.00 ($100 ded.) |
| Classification factor (1.00, assumed) | $213.00 | $302.00 | $13.00 | $134.00 | $647.00 |
| Deductible factor | | | | × 0.77 = $103.18 | × 0.93 = $601.71 |
| Rounded to whole dollars | $213 | $302 | $13 | $103 | $602 |
| SDIP surcharge, 1 point, 40% of base | $85.20 | $120.80 | $5.20 | | |
| Surcharge rounded | $85 | $121 | $5 | | |
| **Coverage premium** | **$298** | **$423** | **$18** | **$103** | **$602** |

The policy premium is $298 + $423 + $18 + $103 + $602 = **$1,444**. The SDIP surcharge is applied here to the coverages the quoted rule names (bodily injury, property damage and medical payments); how the plan applies to physical damage is in the manual's Rule 5, which I have not seen. Everything else is the bureau's published table or arithmetic on it, and an examiner could rerate it from the same pages.

Two things the example shows. First, the rounding position changes the answer: rounding the surcharge to $121 before adding gives $423, and adding $302.00 + $120.80 = $422.80 before rounding gives $423 too, but across thousands of policies and dozens of factors the two orders diverge, so the engine must do exactly what the manual says. Second, the residual market works the same way with fewer steps: TAIPA's bulletin prices class 1A in territory 01 at $729 for bodily injury and $568 for property damage at 30/60/25, a two-dimensional lookup with no further factors for those coverages.

The core of a rating step, applied to a coverage's running value from an ordered list of filed steps, keeping every intermediate result for the worksheet:

```go tab="Go"
type Step struct {
	Name   string // "base_rate", "class_factor", "deductible_factor", "round", ...
	Op     string // "lookup", "multiply", "add", "round_whole", "min"
	Table  string // rate table name and version, for the worksheet
	Value  decimal.Decimal
}

type Line struct {
	Step   string
	Table  string
	Factor decimal.Decimal
	Result decimal.Decimal
}

// Rate applies the filed steps in order and returns the premium and the worksheet.
func Rate(steps []Step) (decimal.Decimal, []Line) {
	v := decimal.Zero
	ws := make([]Line, 0, len(steps))
	for _, s := range steps {
		switch s.Op {
		case "lookup":
			v = s.Value
		case "multiply":
			v = v.Mul(s.Value)
		case "add":
			v = v.Add(s.Value)
		case "min":
			v = decimal.Max(v, s.Value)
		case "round_whole":
			v = v.Round(0) // half away from zero; the manual decides
		}
		ws = append(ws, Line{s.Name, s.Table, s.Value, v})
	}
	return v, ws
}
```

```rust tab="Rust"
use rust_decimal::{Decimal, RoundingStrategy};

pub enum Op { Lookup, Multiply, Add, Min, RoundWhole }

pub struct Step { pub name: String, pub op: Op, pub table: String, pub value: Decimal }

pub struct Line { pub step: String, pub table: String, pub factor: Decimal, pub result: Decimal }

/// Applies the filed steps in order and returns the premium and the worksheet.
pub fn rate(steps: &[Step]) -> (Decimal, Vec<Line>) {
    let mut v = Decimal::ZERO;
    let mut ws = Vec::with_capacity(steps.len());
    for s in steps {
        v = match s.op {
            Op::Lookup => s.value,
            Op::Multiply => v * s.value,
            Op::Add => v + s.value,
            Op::Min => v.max(s.value),
            Op::RoundWhole => v.round_dp_with_strategy(0, RoundingStrategy::MidpointAwayFromZero),
        };
        ws.push(Line { step: s.name.clone(), table: s.table.clone(), factor: s.value, result: v });
    }
    (v, ws)
}
```

Rating uses decimal arithmetic to the precision the manual implies and converts to integer minor units only for the premium that is written ([Rounding](/docs/money/amounts#rounding)); a binary float that turns $601.705 into $601.70 is a filing violation in a state that rounds half up.

## Rate Changes, Versions and Dates

A rate change is a new version of some tables (and sometimes of the step list), approved by a filing, effective on a date, with a rule of application that says which policies it reaches. The parts:

- **Effective dates differ for new business and renewals.** Filings commonly set one date for new business and a later one for renewals, so renewal notices can go out on the new rate with the lead time notice law requires (Cancellation, Nonrenewal & Notice Law). The foundation's `products` table carries both (`effective_from`, `renewal_from`).
- **The date that selects the version is the policy's effective date, not the processing date.** A quote run on September 28 for a policy effective October 2 uses the October 1 tables. North Carolina's form and rule changes in its April 1, 2026 circular apply "to all new and renewal policies becoming effective on or after October 1, 2026."
- **Midterm changes use inception rates or current rates, consistently.** NCRB's Rule 9 lets a company compute an added car, a transferred coverage or a changed limit or deductible "using the rates and rules in effect at the inception of the policy or at the time the change is made," but requires that the election "be applied consistently by the company and shall not be made on a policy by policy basis." That election is a product-level setting the engine reads, not a per-transaction choice.
- **Small adjustments have their own rule.** The same rule lets a premium adjustment of $2 or less be waived or made subject to a $2 minimum (with the actual return premium refunded on request), and lets a company skip charging or refunding an adjustment made within 30 days before the end of a six-month term or 60 days before the end of a longer one, except on the insured's request.
- **Rate pages arrive in waves.** The NCRB posts revised rate spreadsheets effective December 1, 2023, December 1, 2024, July 1, 2025 and October 1, 2025; ISO publishes circulars continuously. Each is a table version with its source document attached.

Rate versions are append-only: a new version is a new row with a validity window, and an old version is never edited after any quote has used it ([Versions, Not Edits](/books/banking-and-lending/product-configuration#versions-not-edits) states the same rule for bank products).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `products` (a filed product per line and state, with `effective_from`, `renewal_from`, `rate_filing_id`) and `quotes` (defined in Quote, Bind & Issue, holding the `rating_worksheet`). This chapter defines `rate_tables` and its entries, `territories`, the ordered rating algorithm, and `rating_steps`, the stored worksheet.

```sql
CREATE TABLE rate_tables (                 -- a versioned factor or rate table
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  name               TEXT NOT NULL,         -- 'bi_base_rate', 'coll_deductible', 'sdip', ...
  version            INT NOT NULL,
  dimensions         TEXT[] NOT NULL,       -- '{territory}', '{deductible}', '{points}', ...
  value_kind         TEXT NOT NULL CHECK (value_kind IN ('amount', 'factor', 'percent')),
  effective_from     DATE NOT NULL,         -- new business on or after
  renewal_from       DATE,                  -- renewals on or after, when different
  effective_to       DATE,
  source             TEXT NOT NULL,         -- 'NCRB rates eff. 2025-10-01', 'ISO circular ...'
  rate_filing_id     UUID,                  -- regulatory_filings (Filing Rates & Forms)
  locked_at          TIMESTAMPTZ,           -- set once any quote reads it; no edits after
  UNIQUE (product_id, name, version)
);

CREATE TABLE rate_table_entries (
  rate_table_id      UUID NOT NULL REFERENCES rate_tables (id),
  key                JSONB NOT NULL,        -- {"territory": "110"} or {"deductible": 500}
  value              NUMERIC(18, 6) NOT NULL,
  PRIMARY KEY (rate_table_id, key)
);

CREATE TABLE territories (                 -- the filed mapping from place to rating cell
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  version            INT NOT NULL,
  code               TEXT NOT NULL,         -- '110', '01'
  basis              TEXT NOT NULL CHECK (basis IN ('county', 'zip', 'census_block_group',
                       'polygon', 'distance_band')),
  match_values       TEXT[],                -- county FIPS or ZIP codes, when list-based
  boundary           GEOMETRY(MULTIPOLYGON, 4326),  -- when polygon-based
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  UNIQUE (product_id, version, code)
);

CREATE TABLE rating_algorithms (           -- the filed order of steps, per coverage
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  coverage_code      TEXT NOT NULL,
  version            INT NOT NULL,
  steps              JSONB NOT NULL,        -- [{"name","op","table","round"}...] in order
  midterm_rates      TEXT NOT NULL CHECK (midterm_rates IN ('inception', 'current')),
  effective_from     DATE NOT NULL,
  renewal_from       DATE,
  UNIQUE (product_id, coverage_code, version)
);

CREATE TABLE rating_steps (                -- the worksheet: one row per step per coverage
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  quote_id           UUID,                  -- quotes (Quote, Bind & Issue)
  transaction_id     UUID REFERENCES policy_transactions (id),
  risk_stable_key    UUID,
  coverage_code      TEXT NOT NULL,
  seq                INT NOT NULL,
  step               TEXT NOT NULL,         -- 'base_rate', 'sdip_surcharge', 'round', ...
  rate_table_id      UUID REFERENCES rate_tables (id),
  lookup_key         JSONB,                 -- the exact key read: {"territory": "110"}
  factor             NUMERIC(18, 6),
  result             NUMERIC(18, 6) NOT NULL,
  algorithm_id       UUID NOT NULL REFERENCES rating_algorithms (id),
  CHECK (quote_id IS NOT NULL OR transaction_id IS NOT NULL)
);
```

The version a quote reads is selected by the policy's effective date and whether it is new business or a renewal:

```sql
SELECT rt.id, rt.version
FROM rate_tables rt
WHERE rt.product_id = :product_id
  AND rt.name = :table_name
  AND CASE WHEN :is_renewal AND rt.renewal_from IS NOT NULL
           THEN rt.renewal_from ELSE rt.effective_from END <= :policy_effective_date
  AND (rt.effective_to IS NULL OR rt.effective_to > :policy_effective_date)
ORDER BY rt.version DESC
LIMIT 1;
```

Design choices that matter:

- **Rate from the stored worksheet, rerate from the tables.** The quote's premium is the sum of its final `rating_steps`; a rerate for an examiner or a regression test runs the same algorithm version against the same table versions and must reproduce every row.
- **Rating is a pure function** of inputs and table versions. Consumer reports, telematics scores and prefilled data are fetched before rating and passed in as inputs with their own records (Consumer Reports & Third-Party Data), so a rerate does not refetch anything.
- **Regression-test every filing.** Before a new table version goes live, rate a corpus of stored quotes on old and new versions and compare the distribution of changes to the filing's stated rate impact; a filed +6.5% that rates as +9% means a table or step is wrong.

## Auditing

- **Every quote and transaction has its full worksheet** with table versions, lookup keys and intermediate results, kept for the policy's life plus the retention period, so the premium can be explained to an examiner, a court or a customer asking why.
- **Every table version links to its filing** and is locked once used; a correction is a new version with its own filing or a documented error correction.
- **Rerates match.** A periodic job rerates a sample of in-force policies from their stored inputs and versions and alerts on any difference; a difference is either a code change that altered old results (a defect) or a table edited after use (a control failure).
- **The midterm rate election is recorded once per product** and every endorsement's worksheet shows which rates it used.

## What This Means for the System You Build

- **Treat the filed manual as the specification** and the engine as its implementation; encode the step order, rounding and minimums as data.
- **Version every table and territory map with effective dates for new business and renewals,** selected by the policy's effective date, never the processing date.
- **Keep loss costs and loss cost multipliers separate** so a new advisory circular flows through without refiling.
- **Store the worksheet** for every quote and transaction, and make rerating a routine test.
- **Use decimal arithmetic and the manual's rounding** at the manual's step; convert to minor units only for written premium.
- **Make the midterm rate election a product setting,** applied consistently, as the North Carolina rule requires.

## References

**Law and regulation**

- [N.J.A.C. 11:13-8.4](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-11-13-8-4), loss cost multipliers: final rates as loss costs combined with the filed LCM, automatic application to later loss cost filings, the 30-day filing windows and non-adoption

**Regulators and guidance**

- [North Carolina Department of Insurance: Safe Driver Incentive Plan](https://www.ncdoi.gov/consumers/auto-and-vehicle-insurance/safe-driver-incentive-plan), SDIP points and rate increase percentages, the offenses for each, and the five-year experience and surcharge periods for 4 or more points from July 1, 2025

**NAIC**

- [NAIC: Loss Cost Filing Document, Calculation of Company Loss Cost Multiplier (effective 11/08/2022) (PDF)](https://content.naic.org/sites/default/files/lcm-form-110822%20final.pdf), the loss cost modification factor, expense provisions, permissible loss ratio, expense multiplier and LCM formula

**Filings**

- [North Carolina Rate Bureau: Private Passenger Revised Rates Effective 10/1/25 (XLSX)](https://www.ncrb.org/Portals/0/ncrb/personal%20lines%20services/Rate%20Filings/2025/Voluntary%20Rates%20Effective%2010-1-25.xlsx?ver=uT7dll2lEgosKbpiwo_3uA%3d%3d), voluntary liability base rates by territory at 50/100, $50,000 and $500, and physical damage base rates and deductible factors for model year 2026 symbol 11
- [North Carolina Rate Bureau: Private Passenger Automobile Rate Filings](https://www.ncrb.org/ncrb/Private-Passenger-Automobile/Rate-Filings), the annual filings, reviews, settlement orders and revised rate pages by effective date
- [North Carolina Rate Bureau: Circular A-26-2, 2026 NC Personal Auto Rate Review and Program Changes (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), the 2026 rate review with no rate level change, the October 1, 2026 rule of application, the manual index, Rule 9 (changes) and the SDIP steps in the motorcycle rule
- [North Carolina Rate Bureau: 2026 Private Passenger Rate Review Package (PDF)](https://www.ncrb.org/Portals/0/ncrb/personal%20lines%20services/Rate%20Filings/2026/Auto%20Rate%20Review%20Package%202026.pdf?ver=i5ETnoaaK1uPB058bAIckw%3d%3d), the experience review exhibits behind the bureau rate, including increased limit factor calculations
- [Texas Department of Insurance: TAIPA Private Passenger Rate Bulletin, effective November 1, 2025 (PDF)](https://tdi.texas.gov/bulletins/2025/documents/0925pparatebull.pdf), residual market rates by territory and class at 30/60/25, including territory 01 class 1A

**Vendor documentation**

- [Verisk: ISO Electronic Rating Content (PDF)](https://www.verisk.com/494a3b/siteassets/media/downloads/iso/iso-electronic-rating-content-suite.pdf), rating data as CSV and rules as XML by ISO rule, Rating-as-a-Service, and 3,000 to 4,000 commercial lines program changes a year
- [Socotra: Rating plugin](https://docs.socotra.com/configuration/plugins/rating), the `RatePlugin` interface, `RatingSet` and `RatingItem`, one charge per charge type per element, and the `priced` state
- [Guidewire: Multi-version quoting (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-quoting/c_multi-version-quoting.html), multiple quoted versions within one policy transaction
