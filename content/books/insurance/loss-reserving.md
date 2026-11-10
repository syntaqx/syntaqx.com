+++
title = "Loss Reserving & Development"
nav_title = "Loss Reserving"
description = "Case reserves and IBNR, loss triangles, chain ladder and Bornhuetter-Ferguson worked, LAE, Schedule P, the actuarial opinion, and development in 10-Ks."
category = "Insurance Industry"
order = 2737
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "loss-reserving", "ibnr", "schedule-p", "actuarial", "property-and-casualty"]
+++

An insurer's largest liability is a guess about the past. On December 31 it owes money on claims that happened during the year and before: some reported, adjusted and reserved claim by claim, some reported but not yet understood, and some that haven't been reported at all because the injured party hasn't sued yet or the water damage is still behind a wall. The **loss reserve** (statutory: losses and loss adjustment expenses unpaid) is the insurer's estimate of all of it. It is the line on the balance sheet that moves earnings most, the one regulators test hardest, and the one that most often turns a profitable year into a restated one when, three years later, the estimate proves short.

Reserving is a data problem before it is an actuarial one. Every method in this chapter reads the same raw material: the history of case reserves and payments by claim, grouped by when the loss happened and observed at successive dates. If the claims system overwrites reserves, loses the accident date, mixes defense costs into indemnity or can't say what a claim's reserve was on last December 31, no method can recover it. This chapter covers what a reserve contains, the development triangle, the chain ladder and Bornhuetter-Ferguson methods worked on one triangle, loss adjustment expense, Schedule P, the statement of actuarial opinion, how reserve development shows up in a 10-K, and adverse development covers. Case reserves themselves, set by adjusters on each exposure, are in [Exposures, Reserves & Payments](/books/insurance/reserves-and-payments); how reserves sit in the statutory statement is in [Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting).

## How the Platforms Do It

Reserving runs on three layers of software, as of November 2026: the claims system that records case reserves and payments, a data warehouse that builds triangles from that history, and actuarial tools that apply methods and produce selections.

| Layer | Examples | What it holds or does |
| --- | --- | --- |
| **Claims system** | Core claims suites and in-house systems ([Core Platforms](/books/insurance/core-platforms) surveys them) | Reserves and payments per exposure and cost type, each change a dated transaction |
| **Triangle builder** | The insurer's warehouse, actuarial data marts | Accident year by development age arrays of paid, reported (paid plus case), claim counts and earned premium, as of each valuation date |
| **Actuarial methods** | The CAS reference text (Friedland), commercial reserving packages, spreadsheets and R or Python code | Development factors, expected claims, Bornhuetter-Ferguson, Cape Cod, frequency-severity, Berquist-Sherman adjustments, selections and ranges |
| **Statutory output** | Annual statement software | Schedule P by line and accident year, the statement of actuarial opinion and its exhibits |
| **Public disclosure** | 10-K loss development tables | Incurred and paid development by accident year, net of reinsurance, and the prior-year development line in the reserve rollforward |

The constant across all of them is the cell: one accident year, one line of business, one valuation date, one measure. Every method is arithmetic on those cells, which is why the data model's job is to rebuild any cell as of any date.

## What a Reserve Contains

The CAS text, Jacqueline Friedland's *Estimating Unpaid Claims Using Basic Techniques*, splits the unpaid claims estimate into five components:

1. **Case outstanding**: the reserves adjusters have set on reported claims.
2. **Future development on known claims**: the amount by which case reserves on reported claims will prove too low or too high (IBNER, incurred but not enough reported).
3. **Reopened claims**: closed claims that will reopen.
4. **Pure IBNR**: claims that have happened but not been reported.
5. **Claims in transit**: reported but not yet recorded in the system.

Components 2 through 5 together are **broad IBNR**, and it is the actuary's number: the total unpaid estimate minus case reserves. The text uses the broad definition throughout, and so does this chapter. A claims system owns case outstanding; IBNR is never a claim-level record, it is an estimate held at the level of a line, accident year and (for statutory reporting) company, booked as a bulk reserve.

Three time axes organize the data, and mixing them is the commonest error:

- **Accident year** (or accident period): when the loss happened. Most P&C reserving uses it.
- **Report year**: when it was reported, used for claims-made lines ([Professional & Management Liability](/books/insurance/professional-and-management-liability)).
- **Policy year**: when the policy incepted, used where premium and exposure tie to the policy (workers' compensation audits, some reinsurance).

The fourth axis is the **valuation date**: when you looked. A triangle is accident year on one axis and age (months from the start of the accident year to the valuation date) on the other.

## The Development Triangle

A worked example, mine, in thousands of dollars: reported losses (paid plus case outstanding) for one line, accident years 2021 to 2025, valued each December 31. Accident year 2021 at 12 months is its value on December 31, 2021; at 60 months, December 31, 2025.

| Accident year | 12 months | 24 months | 36 months | 48 months | 60 months | Earned premium |
| --- | --- | --- | --- | --- | --- | --- |
| 2021 | 1,000 | 1,500 | 1,725 | 1,811 | 1,847 | 2,500 |
| 2022 | 1,100 | 1,628 | 1,888 | 1,982 | | 2,700 |
| 2023 | 1,200 | 1,800 | 2,034 | | | 2,900 |
| 2024 | 1,300 | 1,989 | | | | 3,100 |
| 2025 | 1,400 | | | | | 3,300 |

Each row is an accident year; each diagonal is a valuation date (the bottom-left to top-right diagonal is December 31, 2025, the latest). Reading down a column compares accident years at the same age; reading along a row shows one year maturing. The triangle is itself a diagnostic: Friedland gives it two chapters, one on building it and one on reading it for changes in claim settlement speed, case reserve adequacy or mix, because every projection method assumes the past pattern repeats.

The same triangle exists for paid losses, for reported and closed claim counts, and for average severities. Paid develops slower and is free of case reserve philosophy; reported develops faster and depends on how adjusters reserve. An actuary runs both and investigates when they disagree.

## Chain Ladder

The **development technique** (chain ladder) assumes that losses at each age grow by the same ratio as they did for earlier accident years. Volume-weighted age-to-age factors from the triangle above:

| Age to age | Calculation | Factor |
| --- | --- | --- |
| 12 to 24 | (1,500 + 1,628 + 1,800 + 1,989) / (1,000 + 1,100 + 1,200 + 1,300) = 6,917 / 4,600 | 1.504 |
| 24 to 36 | (1,725 + 1,888 + 2,034) / (1,500 + 1,628 + 1,800) = 5,647 / 4,928 | 1.146 |
| 36 to 48 | (1,811 + 1,982) / (1,725 + 1,888) = 3,793 / 3,613 | 1.050 |
| 48 to 60 | 1,847 / 1,811 | 1.020 |
| 60 to ultimate (tail) | selected, mine | 1.000 |

The **cumulative development factor** (CDF) to ultimate at each age is the product of the factors from that age onward: 1.020 at 48 months, 1.050 × 1.020 = 1.071 at 36, 1.146 × 1.071 = 1.227 at 24, and 1.504 × 1.227 = 1.846 at 12. Ultimate equals reported times CDF; IBNR is ultimate minus reported:

| Accident year | Reported | CDF | Ultimate | IBNR | Ultimate loss ratio |
| --- | --- | --- | --- | --- | --- |
| 2021 | 1,847 | 1.000 | 1,847 | 0 | 73.9% |
| 2022 | 1,982 | 1.020 | 2,022 | 40 | 74.9% |
| 2023 | 2,034 | 1.071 | 2,178 | 144 | 75.1% |
| 2024 | 1,989 | 1.227 | 2,441 | 452 | 78.7% |
| 2025 | 1,400 | 1.846 | 2,584 | 1,184 | 78.3% |
| **Total** | **9,252** | | **11,072** | **1,820** | |

The method's weakness is visible in the last row: accident year 2025's estimate is 1,400 multiplied by 1.846, so every dollar of noise in its first valuation becomes 1.85 dollars of ultimate. A large claim reported early in 2025 inflates IBNR; a slow reporting quarter deflates it. For immature years the chain ladder is too responsive.

## Bornhuetter-Ferguson

Bornhuetter and Ferguson's 1972 paper, "The Actuary and IBNR," answers that weakness by not letting the immature year's own losses drive its IBNR. The **Bornhuetter-Ferguson** (BF) estimate of IBNR is an *a priori* expected loss times the share of ultimate not yet reported:

> BF IBNR = expected losses × (1 − 1 / CDF); BF ultimate = reported + BF IBNR

The expected losses come from outside the triangle: earned premium times an expected loss ratio from pricing, the rate filing or prior studies. With an expected loss ratio of 75%, mine:

| Accident year | Expected losses (75% × EP) | Share unreported (1 − 1/CDF) | BF IBNR | BF ultimate | BF loss ratio |
| --- | --- | --- | --- | --- | --- |
| 2021 | 1,875 | 0.00% | 0 | 1,847 | 73.9% |
| 2022 | 2,025 | 1.96% | 40 | 2,022 | 74.9% |
| 2023 | 2,175 | 6.63% | 144 | 2,178 | 75.1% |
| 2024 | 2,325 | 18.50% | 430 | 2,419 | 78.0% |
| 2025 | 2,475 | 45.83% | 1,134 | 2,534 | 76.8% |
| **Total** | | | **1,748** | **11,000** | |

For mature years the two methods agree (the share unreported is near zero); for 2025 BF says 1,134 of IBNR against the chain ladder's 1,184, because it trusts the expected loss ratio for the 45.83% not yet seen. BF is a credibility weighting: the chain ladder gives full weight to the year's own experience, the **expected claims technique** gives none, and BF weights by how mature the year is. Its weakness is the mirror image: if the expected loss ratio is wrong, BF is wrong for years, and slow to show it. Here the older years run at 74% to 79%, so a 75% a priori is defensible. Had pricing assumed 65%, BF IBNR would be 2,145 × 0.4583 = 983 for 2025 and 2,015 × 0.1850 = 373 for 2024, together 208 short of the 75% figures, and the gap would close only as the years matured.

The **Cape Cod** (Stanard-Bühlmann) technique, Friedland chapter 10, derives the expected loss ratio from the triangle itself: total reported losses divided by total "used-up" premium (premium times 1/CDF for each year), then applies BF with that ratio. **Frequency-severity**, **case outstanding development** and **Berquist-Sherman** adjustments (for changes in case reserve adequacy or settlement speed) round out the text's toolkit. In practice an actuary runs several methods on paid and reported data, compares, and **selects** an ultimate per accident year with documented reasoning; the selection, not any one method's output, is what gets booked.

The core of a volume-weighted chain ladder, on cumulative rows (a row's length is its number of valuations):

```go tab="Go"
// Factors returns volume-weighted age-to-age factors from a cumulative
// triangle; rows[i][j] is accident year i at development age j.
func Factors(rows [][]float64) []float64 {
	ages := len(rows[0])
	f := make([]float64, ages-1)
	for j := 0; j < ages-1; j++ {
		var num, den float64
		for _, r := range rows {
			if len(r) > j+1 {
				num += r[j+1]
				den += r[j]
			}
		}
		f[j] = num / den
	}
	return f
}

// Ultimate projects each row to ultimate with the product of the
// remaining factors and a tail factor.
func Ultimate(rows [][]float64, f []float64, tail float64) []float64 {
	out := make([]float64, len(rows))
	for i, r := range rows {
		cdf := tail
		for j := len(r) - 1; j < len(f); j++ {
			cdf *= f[j]
		}
		out[i] = r[len(r)-1] * cdf
	}
	return out
}
```

```rust tab="Rust"
/// Volume-weighted age-to-age factors from a cumulative triangle;
/// rows[i][j] is accident year i at development age j.
pub fn factors(rows: &[Vec<f64>]) -> Vec<f64> {
    let ages = rows[0].len();
    (0..ages - 1)
        .map(|j| {
            let (num, den) = rows
                .iter()
                .filter(|r| r.len() > j + 1)
                .fold((0.0, 0.0), |(n, d), r| (n + r[j + 1], d + r[j]));
            num / den
        })
        .collect()
}

/// Projects each row to ultimate with the remaining factors and a tail.
pub fn ultimate(rows: &[Vec<f64>], f: &[f64], tail: f64) -> Vec<f64> {
    rows.iter()
        .map(|r| {
            let cdf: f64 = f[r.len() - 1..].iter().product::<f64>() * tail;
            r[r.len() - 1] * cdf
        })
        .collect()
}
```

Actuarial projections are estimates, so binary floating point is acceptable inside the method; the booked IBNR is rounded to the reporting unit and stored as an integer amount with the selection that produced it ([Money & Amounts](/docs/money/amounts#rounding)).

## Loss Adjustment Expense

Claim costs other than the payment itself are reserved too. Historically insurers split them into allocated (ALAE, assignable to a claim: defense counsel, experts) and unallocated (ULAE, the claims department's payroll, rent and systems). For US statutory reporting the NAIC replaced that split, effective January 1, 1998, with **defense and cost containment** (DCC: all defense litigation and medical cost containment, whether internal or external) and **adjusting and other** (A&O: all other claim adjusting expense, internal or external), as Friedland notes. The core data model's `cost_type` column (`indemnity`, `dcc`, `ao`) follows that split.

DCC is reserved with the same triangle methods as losses, often as a ratio to losses. A&O is mostly the cost of running the claims operation, so it is estimated from the ratio of paid A&O to paid losses and an assumption about how much work remains on open and unreported claims (Friedland chapter 17 covers the classical and Kittel methods). For the system, the requirement is that every expense payment carries its cost type and its claim at the moment it is paid; a defense invoice coded to indemnity, or adjusting staff time never captured, makes both triangles wrong.

## Schedule P

Schedule P is the reserving part of the statutory annual statement. Friedland quotes Sholom Feldblum: "Schedule P is the actuarial portion of the Annual Statement and is critical to monitoring the solvency of insurers." It holds a ten-year summary, by line, of earned premium, loss and expense payments and unpaid amounts, and development schedules by line for incurred net losses, paid net losses, and bulk and IBNR reserves. Because each year's Schedule P shows ten accident years at ten valuation dates, a regulator, rating agency or investor can rebuild the insurer's triangles from its public filings and test its reserves without asking.

What that requires of the ledger is in [Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting); the reserving-specific points:

- **Net of reinsurance, and gross.** Schedule P is largely net, so ceded reserves by accident year (from the cessions in [Reinsurance Operations](/books/insurance/reinsurance-operations)) must be computable for the same cells.
- **Lines are statement lines,** not product codes: every claim maps to a Schedule P line through its policy's line of business.
- **Prior valuations are frozen.** The 2025 Schedule P's 2022 column has to equal what was reported in the 2022 statement for that cell, so the build reads the reserve and payment history as recorded on each valuation date, not as corrected later ([Temporal Data](/docs/database/temporal-data#recorded-time-and-corrections)).

## The Statement of Actuarial Opinion

Every P&C insurer files, with page 1 of its annual statement, a **Statement of Actuarial Opinion** from its **Appointed Actuary** on its reserves. The NAIC's 2026 instructions as exposed (the actuarial opinion section of the Annual Statement Instructions, Property and Casualty) set the main rules:

- **Appointment.** The board of directors appoints the actuary by December 31 of the year opined on; the company notifies the domiciliary commissioner within five business days of an initial appointment, with a statement that the person is a Qualified Actuary.
- **Scope.** The opinion covers whether the carried reserves "make a reasonable provision for all unpaid loss and loss adjustment expense obligations."
- **Type of opinion,** coded in Exhibit B: R (reasonable), I (inadequate or deficient), E (excessive or redundant), Q (qualified) or N (no opinion), each with defined conditions.
- **Risk of material adverse deviation.** The actuary states a materiality standard, discloses it in dollars in Exhibit B, and says whether there are significant risks that could produce material adverse deviation.
- **The Actuarial Report.** A confidential report and workpapers supporting the opinion, available by May 1 of the following year or within two weeks of a commissioner's request, kept for seven years.

The opinion is why reserving data is examination material. An actuary who can't reconcile the triangles to the annual statement's carried reserves can't sign, and an examiner who can't rebuild the actuary's triangles from the claims system will ask why.

## Reading Reserve Development in a 10-K

Public insurers disclose reserves two ways in their 10-Ks: a rollforward of the liability for unpaid losses and LAE (beginning balance, incurred for the current year, incurred for prior years, paid, ending balance) and incurred and paid development tables by accident year. The line to read is **incurred related to prior years**: positive means prior estimates were too low (adverse development, a charge to this year's income), negative means they were too high (favorable development, a release).

Everest Group's 10-K for 2025 shows the scale. Prior-year development increased loss reserves by $657 million pre-tax and net of reinsurance in 2025, attributed to "elevated loss experience in excess casualty and U.S. liability lines primarily on accident years 2022-2024," after $1,337 million of adverse development in 2024 and $5 million favorable in 2023. Across the industry the direction was the opposite: the Federal Insurance Office's September 2026 annual report, citing NAIC full-year results, found P&C reserve development "significantly favorable in 2025, much greater than in 2024 and greater than in any year over the past 10 years," which contributed to personal lines' improved combined ratio.

Three patterns to read for, as a reader of filings:

- **Development by accident year,** not in total. Favorable development on old years can mask adverse development on recent ones; the development tables show which.
- **Lines with long tails,** where liability and litigation claims emerge years after the policy year (the excess casualty and liability lines in the Everest example). [Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation) covers what the filings say drives them.
- **Reserve actions paired with reinsurance,** which is the next section.

## Adverse Development Covers and Loss Portfolio Transfers

An insurer that wants to cap its exposure to further development on old years can buy reinsurance on the reserves themselves. A **loss portfolio transfer** (LPT) cedes existing reserves (and the assets backing them) to a reinsurer, which takes over paying them. An **adverse development cover** (ADC) is excess of loss on reserves: the reinsurer pays if losses on specified accident years develop beyond an attachment point.

Everest's cover, effective October 1, 2025, is a public example. Everest Re and Bermuda Re entered agreements with State National Insurance Company and MS Transverse Insurance Company, supported on a retrocessional basis by Longtail Re, an affiliate of Stone Ridge Capital. The subject business is accident years 2024 and prior for substantially all North American liabilities in the Insurance and Other segments, with $5.4 billion of carried reserves at September 30, 2025 ($5.0 billion at December 31, 2025). It has three layers: an "in the money" first layer, a second layer of $700 million in excess of $5.4 billion, and a third layer of $500 million. Everest transferred $1,250 million of in-the-money reserves for the first two layers, paid about $122 million for the third, and co-participates for $100 million in each of the upper two. At December 31, 2025, covered losses ceded to State National were $1,253 million.

For the system, an ADC is a reinsurance contract whose subject is reserves on a set of accident years, not policies written in a period: its cessions are computed from the development of those cells, which is one more reason the triangles have to be rebuildable exactly ([Reinsurance Structures](/books/insurance/reinsurance-structures) covers the contract shapes).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `reserves` (every case reserve change by exposure and `cost_type`, never updated) and `claim_payments` already hold the raw history. This chapter adds `loss_triangles` (a stored, frozen triangle per valuation), its cells, and `ibnr_estimates` (the booked selection). `statement_lines` ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting)) maps lines; `cessions` ([Reinsurance Operations](/books/insurance/reinsurance-operations)) supplies ceded amounts.

```sql
CREATE TABLE reserving_segments (          -- the grain actuaries reserve at
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  statement_line     TEXT NOT NULL,         -- Schedule P line
  segment            TEXT NOT NULL,         -- 'ho_cat', 'ho_noncat', 'ppa_liab', ...
  basis              TEXT NOT NULL CHECK (basis IN ('accident_year', 'report_year',
                       'policy_year')),
  UNIQUE (insurer_id, statement_line, segment, basis)
);

CREATE TABLE loss_triangles (              -- one frozen build per valuation
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  segment_id         UUID NOT NULL REFERENCES reserving_segments (id),
  valuation_date     DATE NOT NULL,
  measure            TEXT NOT NULL CHECK (measure IN ('paid', 'reported', 'case',
                       'reported_count', 'closed_count', 'dcc_paid', 'ao_paid')),
  net_of_reinsurance BOOLEAN NOT NULL,
  recorded_as_of     TIMESTAMPTZ NOT NULL,  -- the recorded-time cut the build used
  built_by           TEXT NOT NULL,         -- job version, for reproducibility
  UNIQUE (segment_id, valuation_date, measure, net_of_reinsurance)
);

CREATE TABLE loss_triangle_cells (
  triangle_id        UUID NOT NULL REFERENCES loss_triangles (id),
  origin_period      INT NOT NULL,          -- accident year 2025
  age_months         INT NOT NULL,          -- 12, 24, ...
  amount             BIGINT NOT NULL,       -- minor units (counts for count measures)
  PRIMARY KEY (triangle_id, origin_period, age_months)
);

CREATE TABLE ibnr_estimates (              -- the booked selection, never edited
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  segment_id         UUID NOT NULL REFERENCES reserving_segments (id),
  valuation_date     DATE NOT NULL,
  origin_period      INT NOT NULL,
  cost_type          TEXT NOT NULL CHECK (cost_type IN ('indemnity', 'dcc', 'ao')),
  method_results     JSONB NOT NULL,        -- {"cl": 2584000, "bf": 2534000, ...}
  selected_ultimate  BIGINT NOT NULL,
  case_outstanding   BIGINT NOT NULL,       -- from reserves as of valuation_date
  paid_to_date       BIGINT NOT NULL,
  ibnr               BIGINT NOT NULL,       -- selected - paid - case
  gross_or_net       TEXT NOT NULL CHECK (gross_or_net IN ('gross', 'ceded', 'net')),
  rationale          TEXT NOT NULL,
  selected_by        UUID NOT NULL,
  supersedes_id      UUID REFERENCES ibnr_estimates (id),
  CHECK (ibnr = selected_ultimate - paid_to_date - case_outstanding)
);
```

A reported-loss triangle cell is a sum over the reserve and payment history with two date cuts: the loss date picks the accident year, the valuation date picks what had been recorded by then.

```sql
SELECT EXTRACT(YEAR FROM c.loss_at)::INT AS accident_year,
       SUM(p.paid) + SUM(r.case_os)    AS reported
FROM claims c
JOIN exposures e ON e.claim_id = c.id
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(cp.amount), 0) AS paid
  FROM claim_payments cp
  WHERE cp.exposure_id = e.id AND cp.cost_type = 'indemnity'
    AND cp.status IN ('issued', 'cleared') AND cp.issued_at <= :valuation_end
) p ON TRUE
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(rv.change), 0) AS case_os
  FROM reserves rv
  WHERE rv.exposure_id = e.id AND rv.cost_type = 'indemnity'
    AND rv.recorded_at <= :valuation_end
) r ON TRUE
WHERE c.insurer_id = :insurer_id
  AND c.loss_at < :valuation_end
GROUP BY 1;
```

Design choices that matter:

- **Build triangles from history, store them frozen.** Each valuation's triangle is computed once with a recorded-time cut and stored; a rebuild that disagrees with the stored one is a data change someone has to explain, not a refresh.
- **Voided payments and reserve corrections are new rows** with their own recorded time, so last year's cell stays what it was and this year's shows the correction as development.
- **Selections are versioned with their reasoning.** The booked IBNR per cell, the method results it chose among and who chose them, kept for the seven years the opinion's workpapers require.
- **Gross, ceded and net are three rows,** computed from the same claim history and the cessions to each contract, never net figures typed in.

## Auditing

- **Triangles reconcile to the books.** The latest diagonal of the reported triangle equals paid to date plus case outstanding in the general ledger and the annual statement, per line and accident year, gross and net.
- **Prior diagonals never move.** A stored triangle for a past valuation is immutable; Schedule P columns for prior years match what was filed.
- **Every IBNR booking traces to a selection** with method results, rationale and approver, and the total booked reserve equals case plus the selections.
- **Cost types are right at the source.** A sample of DCC and A&O payments is checked against invoices and timesheets, because miscoded expense distorts both the loss and the LAE triangles.
- **The actuary can rebuild it.** The Appointed Actuary's data request is answered from the same tables the system uses, with the recorded-time cut stated.

## What This Means for the System You Build

- **Keep reserves and payments as dated, typed history by exposure,** never as balances, so any cell is rebuildable as of any valuation date.
- **Record loss date, report date and policy inception on every claim,** because reserving needs all three axes.
- **Freeze each valuation's triangles** and treat later corrections as development, not as edits to the past.
- **Store IBNR as a selection with its methods and reasoning,** per segment, accident year, cost type and gross or net.
- **Code DCC and A&O at payment time,** in the NAIC's split, not reconstructed later.
- **Compute ceded and net reserves from cessions** so Schedule P, reinsurance recoveries and adverse development covers read the same numbers.

## References

**NAIC**

- [NAIC: 2026 P&C Actuarial Opinion Instructions, exposure draft (PDF)](https://content.naic.org/sites/default/files/inline-files/027_Property_2026_Actuarial_Opinion%20-%20Exposure%20Draft.pdf), the Appointed Actuary's appointment by December 31 and five-business-day notice, the reasonable provision scope, opinion types R, I, E, Q and N, the materiality standard in Exhibit B, the risk of material adverse deviation, and the Actuarial Report by May 1 with workpapers kept seven years

**Regulators and guidance**

- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), P&C reserve development in 2025 significantly favorable and the largest in ten years, and its contribution to personal lines results

**Standards**

- [Casualty Actuarial Society: Friedland, Estimating Unpaid Claims Using Basic Techniques, version 3, July 2010 (PDF)](https://www.casact.org/sites/default/files/database/studynotes_friedland_estimating.pdf), the five components of unpaid claims and broad IBNR, the development triangle, development, expected claims, Bornhuetter-Ferguson, Cape Cod, frequency-severity and Berquist-Sherman techniques, the 1998 DCC and A&O split, ULAE methods, and Feldblum's description of Schedule P

**Filings**

- [Everest Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1095073/000109507326000006/eg-20251231.htm), prior-year development of $657 million adverse in 2025, $1,337 million adverse in 2024 and $5 million favorable in 2023, and the October 1, 2025 adverse development cover: parties, subject reserves, layers, consideration, co-participation and losses ceded
