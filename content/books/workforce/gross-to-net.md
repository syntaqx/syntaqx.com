+++
title = "Gross-to-Net, Step by Step"
nav_title = "Gross-to-Net"
description = "Gross-to-net in order: earnings, pre-tax deductions, taxes, post-tax deductions, garnishments and net pay, the taxability matrix, rounding, gross-ups, arrears."
category = "Workforce Industry"
order = 2606
part = "Gross to Net"
tags = ["payroll", "gross-to-net", "withholding", "taxability", "deductions", "data-model"]
+++

Gross-to-net is the calculation every pay statement is: start from what the worker earned, take out what the worker chose to have taken out before tax, compute each tax on its own base, take out what the worker chose after tax and what a court or agency ordered, and pay the rest into the accounts the worker named. Every payroll engine does the same steps in the same order, and almost every payroll bug is one of them done out of order, on the wrong base or with the wrong date. A 401(k) deferral lowers the wages federal income tax is figured on but not the wages Social Security is figured on; a Section 125 medical premium lowers both; Pennsylvania taxes the 401(k) deferral anyway; group-term life coverage over $50,000 adds wages nobody was paid in cash; a child support order is limited by a number that only exists after taxes are computed; and the worker's net pay can come out negative and has to be fixed before the money moves.

So the engine is less a formula than a pipeline over typed lines, with one table deciding which line belongs in which base. This chapter works the order step by step, the taxability matrix that drives it, wage bases and caps, rounding, gross-ups and net-to-gross solving, negative net and arrears, and a full statement end to end, then the data model that makes each step reproducible. The steps' details live in the rest of the part: [Federal Withholding & the W-4](/books/workforce/federal-withholding) owns the income tax formula, [Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income) owns bonuses and imputed lines, and [Pre-Tax & Post-Tax Deductions](/books/workforce/deductions) owns what each deduction does to each base. Rates, wage bases and deposits for Social Security, Medicare, FUTA and SUTA are in the Payroll Tax part ([FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta), and [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns)); here they are inputs.

## How the Platforms Do It

Embedded payroll APIs and tax engines publish the shape of their calculation, which makes them the clearest public view of how the industry splits the work. As of November 2026, from their developer documentation:

| Platform | What it calculates | How earnings and deductions are typed | Gross-up | Notes |
| --- | --- | --- | --- | --- |
| **Check** | The full statement: earnings, benefits, post-tax deductions, garnishments, taxes, net pay | Earnings carry a `type` from a fixed list (`hourly`, `overtime`, `bonus`, `commission`, `cash_tips`, `paycheck_tips`, `group_term_life`, `other_imputed`, `clergy_housing` and others); benefits are pre- or post-tax, and "Deductions are always post-tax" | `POST /payroll_items/{payroll_item}/gross_up` on an off-cycle payroll returns "the smallest amount, to the cent, that yields net wages at least equal to" the target; in early preview, general release by November 19, 2026 | Child support runs before miscellaneous garnishments; equal priorities go oldest first; a deduction that would make net pay negative is skipped with a warning |
| **Gusto Embedded** | The full statement for partners' companies | Default earning types (Bonus, Cash Tips, Commission, Correction Payment, Minimum Wage Adjustment, Paycheck Tips, Severance) plus company-defined custom types; "Certain earning types are special because they have tax considerations" | `POST /v1/payrolls/{payroll_uuid}/gross_up` with a target `net_pay`, "only applicable to off-cycle unprocessed payrolls" | Garnishments carry `garnishment_type`, `pay_period_maximum`, `annual_maximum` and, for child support, a cap of 65% |
| **Symmetry Tax Engine** | Taxes only, statelessly: the caller supplies wages, benefits, elections and year-to-date totals | Wage types: Regular ("Standard period wages"), Supplemental ("Bonuses, commissions, and other non-regular pay"), plus FUTA and SUTA gross and custom types numbered 100 and up | `POST /v2/grossUp` computes "the gross wages required for desired net pay amount," with a per-wage supplemental method of `Annualized`, `Cumulative`, `Flat` or `None` | Rules are applied by pay date, so historical, retro and off-cycle runs reproduce |
| **Zeal** | The full statement | Earning components by tax treatment: regular (hourly, overtime, cash and charged tips, nondiscretionary bonus, break premiums), supplemental (commission, discretionary bonus), imputed (group-term life over $50,000, 2% S corporation health), non-taxable (reimbursement); deductions as pre-tax (Section 125, HSA, traditional 401(k), 403(b), dependent care) or post-tax (Roth, garnishment, miscellaneous) | A Gross Up earning component "calculates the gross pay needed to reach a desired net pay" | A Correction earning carries negative gross for prior overpayments |

Three patterns hold across them. **The tax treatment hangs on a type from a fixed catalog,** never on the customer's own name for a pay code: Check's earning `type`, Gusto's default earning types, Symmetry's wage types and Zeal's components all exist so that "Gym Membership Stipend" or "Q3 Spiff" inherits a known treatment. **The tax engine is a pure function of its inputs,** including year-to-date totals the caller supplies, which is why the statement lines and accumulators have to live with the payroll system and not the engine. **Gross-up is an off-cycle operation** at every vendor that documents it, because solving for gross with benefits and recurring deductions in play has more than one answer.

## The Calculation Order

Every engine runs the same seven steps. The order is not a convention; each step's output is the next step's base.

1. **Earnings.** Turn hours, rates, salaries, piece counts, bonuses and commissions into earning lines, each with its pay item type and the work period it was earned in. Overtime is computed here at the regular rate, which includes nondiscretionary pay ([Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate) owns the rule). Imputed income (group-term life over $50,000, personal use of a company car) is added as earning lines that increase taxable wages but pay no cash. Tips the worker reports are earning lines too, and cash tips the worker already holds are excluded from net pay.
2. **Pre-tax deductions.** Take out deductions that reduce one or more tax bases: Section 125 premiums, 401(k) and 403(b) deferrals, HSA and FSA contributions, qualified transportation. Each is "pre-tax" only for the taxes the taxability matrix says, so this step doesn't produce one number, it produces one adjusted base per tax.
3. **Employee taxes by jurisdiction.** For each tax the worker is subject to (federal income tax, Social Security, Medicare, Additional Medicare, state income tax, state disability and paid leave contributions, employee unemployment contributions in the few states that have them, local income taxes), compute the subject wages from the earnings and pre-tax deductions, apply any wage base left for the year, and apply the rate or formula. Income tax withholding uses the W-4 and the Pub 15-T tables; supplemental earnings may use a flat rate instead.
4. **Employer taxes.** In parallel, the employer's share of Social Security and Medicare, FUTA, SUTA and any employer-paid local or transit tax, each on its own base. They don't change net pay but they are liabilities from the same run and belong on the same statement as employer lines.
5. **Post-tax deductions.** Roth deferrals, after-tax insurance, union dues, charitable giving, loan repayments, advances. They come out of what's left after taxes and don't change any tax.
6. **Garnishments.** Orders to withhold are limited by disposable earnings, which the DOL defines as "the amount of earnings left after legally required deductions are made": taxes, the employee's Social Security, Medicare and state unemployment, and legally required retirement contributions, but generally not union dues, health or life insurance or voluntary assignments. That base only exists after step 3, so garnishments come late, and among themselves they run in priority order (child support first under federal law). [Child Support Withholding](/books/workforce/child-support-withholding#the-limits-50-to-65-percent) and [Garnishments & Levies](/books/workforce/garnishments-and-levies#priority-and-stacking) in the Moving the Money part own the limits and the stacking.
7. **Net pay and distributions.** Gross earnings paid in cash, less every deduction and employee tax, is net pay; it is split across the worker's accounts by fixed amounts, percentages and a remainder ([Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees) owns the splits).

One test catches most order errors: every base a step uses must be computable from lines that earlier steps produced. A garnishment computed before taxes, a 401(k) percentage computed on a gross that already had the deferral taken out, or a state tax computed on a federal taxable wage that included an exclusion the state doesn't allow are all violations of it.

## The Taxability Matrix

Each pay item type has a treatment for each tax: subject, exempt or reported only. The matrix is not a policy choice; it is the law, read off IRS publications for the federal columns and each state's guidance for its own. A slice of the federal rows, as Pub 15 (2026) and Pub 15-B (2026) state them:

| Pay item type | Federal income tax | Social Security and Medicare | FUTA | Source |
| --- | --- | --- | --- | --- |
| Regular wages, overtime, bonuses, commissions | Subject | Subject | Subject | Pub 15 |
| Reported tips of $20 or more in a month | Subject (as supplemental) | Subject | Subject | Pub 15 section 6 |
| 401(k) elective deferral (traditional) | Exempt ("Generally exempt, but see section 402(g)") | Subject | Subject | Pub 15 section 15 |
| Designated Roth deferral | Subject | Subject | Subject | W-2 instructions (boxes 1, 3 and 5) |
| SIMPLE salary reduction | Exempt | Subject | Subject | Pub 15 section 15 |
| Section 125 accident and health premiums | Exempt | Exempt | Exempt | Pub 15-B Table 2-1 |
| HSA contribution through a Section 125 salary reduction | Exempt | Exempt | Exempt | Pub 15 section 5 |
| HSA contribution by payroll deduction outside a cafeteria plan | Subject | Subject | Subject | Pub 15 section 5 |
| Dependent care assistance, up to $7,500 | Exempt | Exempt | Exempt | Pub 15-B Table 2-1 |
| Qualified transportation, up to $340 a month | Exempt | Exempt | Exempt | Pub 15-B Table 2-1 |
| Group-term life cost over $50,000 | Exempt from withholding (optional) | Subject | Exempt | Pub 15-B Table 2-1 |
| Adoption assistance | Exempt (up to the limit) | Subject | Subject | Pub 15-B Table 2-1 |
| Severance pay | Subject | Subject | Subject | Pub 15 section 15 |
| Accountable plan reimbursement | Not wages | Not wages | Not wages | Pub 15 section 5 |

The states diverge from the federal columns, and the divergence is the reason taxability is per jurisdiction. Pennsylvania lists "Employee contributions to an eligible Pennsylvania retirement plan" among items always taxable as compensation and excludes cafeteria plan contributions for health coverage only "to the extent excluded for federal purposes," while dependent care and 401 plan contributions through a cafeteria plan are "not excludable from Pennsylvania-taxable compensation." New Jersey excludes "401(k) contributions up to the federal limit" but includes "Employee contributions to retirement plans other than a 401(k) in the year they are made," so a 403(b) or 457 deferral is New Jersey wages, as are non-excludable cafeteria contributions and section 129 dependent care benefits in box 16. [Pre-Tax & Post-Tax Deductions](/books/workforce/deductions) works through the deduction columns in full.

The matrix belongs in data, not code ([What Belongs in Data](/docs/building-blocks/rules-as-data#what-belongs-in-data)), because three things change it: a new law (P.L. 119-21 made employer student loan payments under educational assistance permanent and moved several limits), a new jurisdiction (a city adopts a wage tax), and a new pay item type (a provider adds a Trump account contribution for the W-2 code TA that starts in 2026). Each is a new row with a `valid_during` range and a `source_ref`, and none is a deploy.

## Wage Bases and Caps

A tax with a wage base taxes only the first dollars of the year. Social Security's 2026 base is $184,500, FUTA's is $7,000, each state sets its own unemployment base, and some state programs cap contributions instead of wages (New York's paid family leave has an annual maximum contribution). Additional Medicare is the inverse: 0.9% withheld only on wages over $200,000 paid by the employer in the calendar year. The rates and the 2027 figures are in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#social-security-and-medicare); what gross-to-net needs is the mechanic, which is the same for all of them:

- **Subject wages** are the period's wages that the tax applies to, after the taxability matrix and pre-tax deductions.
- **Taxable wages** are the part of subject wages under what is left of the base this year, for this worker at this employer.
- **What is left** comes from the accumulator: year-to-date taxable wages for that tax, from paid statement lines.

A worked example of my own: a worker has $183,900.00 of year-to-date Social Security wages when a biweekly statement brings $2,502.31 more. The base has $600.00 left, so taxable wages are $600.00, the employee tax is 6.2% of $600.00 = $37.20, and the remaining $1,902.31 of subject wages is recorded on the same line as subject but not taxable. Storing both on the line (`subject_wages` and `taxable_wages`) is what lets the W-2's box 3 and the 941's line 5a come from one sum and lets a later correction re-run the cap correctly. The cap is per employer: the Social Security base restarts for a worker who changes employers, and the worker recovers any excess on their own return, while a rehire at the same employer continues the year's accumulator, which is why the core model keys it on the worker, not the employment ([The Core Data Model](/books/workforce/workforce-business#the-core-data-model)). Successor employer rules that let an acquirer continue a predecessor's base are in [Changing Providers Mid-Year](/books/workforce/changing-providers).

## Rounding

Pub 15-T allows two simplifications and requires one discipline. "To figure the income tax to withhold, you may reduce the last digit of the wages to zero, or figure the wages to the nearest dollar," and "You may also round the tax for the pay period to the nearest dollar. If rounding is used, it must be used consistently," with half a dollar rounding up ("$2.30 becomes $2 and $2.50 becomes $3"). Most automated systems round to the cent instead, and the rule that matters is the same: **round once, at the line, by a stated rule.** Social Security on $2,502.31 is $155.1432, which is $155.14 on the statement; computing it on the run total and allocating back to workers produces a run total that doesn't equal the sum of its statements, and the 941 has a line (fractions of cents) because employer and employee halves rounded separately drift by pennies across a quarter. The generic rules for half-up versus banker's rounding and where to round are in [Rounding](/docs/money/amounts#rounding); payroll's specific rule is that each tax line rounds half up to the cent, the employee and employer halves round independently, and the drift is reported, not hidden.

Annualizing is the other rounding trap. The percentage method multiplies the period's wages by the number of periods, applies the annual table and divides back; carrying full precision through those steps and rounding once at the end gives a different cent from rounding at each worksheet line. Both are defensible; switching between them between runs is not, because a correction then can't reproduce the original.

## Worked Statement, End to End

An example of my own, with invented round numbers: an hourly, nonexempt employee in a state with no income tax is paid biweekly for the period ending Saturday, November 14, 2026, check date Friday, November 20. The 2026 Form W-4 is single with nothing in Steps 2 through 4. The employee worked 80 regular hours and 6 overtime hours at $30.00 an hour (no bonus this period, so the regular rate is $30.00), defers 6% of gross pay to a traditional 401(k), pays $120.00 for medical and $50.00 to an HSA through the Section 125 plan, $8.00 for after-tax accident insurance, and has a child support order for $250.00 a period. The employer provides $100,000 of group-term life coverage at no cost to the employee, who is 42 at the end of the year; Table 2-2 in Pub 15-B gives $0.10 per $1,000 a month at 40 through 44, so $50,000 of excess coverage costs $5.00 a month, $60.00 a year, imputed as $2.31 a period ($60.00 / 26). Year-to-date wages are under the Social Security base and over FUTA's $7,000.

**Step 1, earnings.**

| Line | Hours | Rate | Amount |
| --- | --- | --- | --- |
| Regular | 80.00 | $30.00 | $2,400.00 |
| Overtime | 6.00 | $45.00 | $270.00 |
| Group-term life over $50,000 (imputed, no cash) | | | $2.31 |
| **Gross earnings paid in cash** | | | **$2,670.00** |

**Step 2, pre-tax deductions.** 401(k) 6% of $2,670.00 = $160.20 (plan compensation is a plan definition; this plan uses cash gross); Section 125 medical $120.00; HSA through Section 125 $50.00. The bases follow from the matrix:

| Base | Calculation | Amount |
| --- | --- | --- |
| Federal income tax wages | $2,670.00 + $2.31 − $160.20 − $120.00 − $50.00 | $2,342.11 |
| Social Security and Medicare wages | $2,670.00 + $2.31 − $120.00 − $50.00 | $2,502.31 |

The 401(k) deferral stays in the Social Security and Medicare base; the cafeteria items come out of both.

**Step 3, employee taxes.** Federal income tax by the Pub 15-T percentage method (Worksheet 1A, worked in [Federal Withholding & the W-4](/books/workforce/federal-withholding#worksheet-1a-worked)): $2,342.11 × 26 = $60,894.86; less $8,600 = $52,294.86; the 2026 single table row from $19,900 to $57,900 gives $1,240 + 12% of $32,394.86 = $5,127.38 a year; divided by 26, **$197.21**. Social Security 6.2% of $2,502.31 = **$155.14**. Medicare 1.45% of $2,502.31 = **$36.28**.

**Step 4, employer taxes.** Social Security $155.14 and Medicare $36.28, matching the employee's; FUTA nothing (the worker is past $7,000); SUI at the employer's assigned rate only if the worker is under the state's base. The employer's 401(k) match and its share of the medical premium are memo lines: they appear on the statement and in the liabilities, not in net pay.

**Step 5, post-tax deductions.** Accident insurance $8.00.

**Step 6, garnishment.** Disposable earnings = $2,670.00 − $197.21 − $155.14 − $36.28 = $2,281.37; the 401(k), medical, HSA and accident deductions are voluntary and aren't subtracted. Half of that, $1,140.68, is the limit if the worker supports another spouse or child; the order's $250.00 fits under it, so all of it is withheld.

**Step 7, net pay.**

| | Amount |
| --- | --- |
| Gross earnings paid in cash | $2,670.00 |
| 401(k), Section 125 medical, HSA | −$330.20 |
| Federal income tax | −$197.21 |
| Social Security | −$155.14 |
| Medicare | −$36.28 |
| Accident insurance | −$8.00 |
| Child support | −$250.00 |
| **Net pay** | **$1,693.17** |

The imputed $2.31 raised two tax bases and is subtracted nowhere, because it was never paid. With a $200.00 fixed split to savings and the remainder to checking, the distributions are $200.00 and $1,493.17. The statement produces liabilities for federal taxes of $580.05 ($197.21 + 2 × $155.14 + 2 × $36.28), the 401(k) plan for $160.20 plus the match, the HSA custodian for $50.00, the state disbursement unit for $250.00, and the accident carrier for $8.00.

## Gross-Up and Net-to-Gross

A gross-up solves backward: the employer wants the worker to receive a stated net (a $1,000 bonus "after tax," a relocation payment, the tax on imputed income it decided to cover), so the engine finds the gross that produces it. When every tax is a flat percentage, the algebra is one line. A worked example of my own: a $1,000.00 net bonus paid alone, federal flat supplemental rate 22%, Social Security 6.2% and Medicare 1.45% (worker under the base, no state tax):

gross = 1,000.00 / (1 − 0.22 − 0.062 − 0.0145) = 1,000.00 / 0.7035 = $1,421.46

Checking with per-line rounding: 22% is $312.72, Social Security $88.13, Medicare $20.61, and $1,421.46 − $421.46 = $1,000.00. $1,421.45 nets $999.99, which is why Check defines its answer as the smallest gross, to the cent, whose net is at least the target.

Real gross-ups aren't flat. A wage base crossed mid-payment, a state with brackets, Additional Medicare starting at $200,000, a percentage deduction or a garnishment with a disposable earnings limit all make net a piecewise function of gross. The robust method is the one the vendors describe: start from the flat estimate, run the full calculation, and search (bisect or step to the cent) until the smallest gross whose net meets the target is found, with the solve run against the same as-of snapshot as the statement. Two rules keep it sane: gross-ups run on their own off-cycle statement with recurring benefits and deductions off (Check requires `apply_benefits` and `apply_post_tax_deductions` false; Gusto allows gross-up only on off-cycle payrolls), and the stored output is the gross, never the target net, so a replay doesn't re-solve.

## Negative Net and Arrears

Net pay can go negative: a worker on unpaid leave for most of a period still has a medical premium due, a reversal of a prior overpayment exceeds this period's gross, or a garnishment and taxes on a large imputed amount exceed the cash. The engine never sends a negative credit; it has to decide what not to take. My rule, which matches what the vendors document:

- **Taxes come first and are never skipped.** They're owed on the wages paid. Pub 15 sets the ordering when tips leave too little cash: "Withhold on regular wages and other compensation," then "social security and Medicare taxes on tips," then "income tax on tips," and what can't be collected by the 10th of the following month is reported as uncollected ([Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions) covers the W-2 codes).
- **Garnishments next, up to their limits.** An order the employer could have honored and didn't is an employer liability.
- **Then voluntary deductions in a stated order,** each taken in full or not at all, or partially if its rule says so. Check skips "Deductions that would make net pay negative" with a warning; a well-run engine records each skipped or short amount.
- **Arrears per the deduction's rule.** A missed medical premium is usually owed (the coverage continued), so its election carries `arrears_rule = 'next_period'` or `'spread'`, and the next statements take the catch-up amount before the regular one. A missed 401(k) deferral usually isn't caught up, because the plan's deferral is a percentage of pay actually paid, and a catch-up would defer pay from a period it wasn't earned in.

Negative net from a correction is different: it means the worker owes the employer money, which is an overpayment with its own recovery rules ([Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections) covers it in [Overpayments and Recovery](/books/workforce/retro-pay-voids-and-corrections#overpayments-and-recovery)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `taxability_rules` gets the columns the matrix needs to apply partial treatments; `pay_item_types` gets the flags the pipeline sorts by; `pay_statement_lines` already carries `subject_wages` and `taxable_wages`. New tables record each calculation as a replayable run of steps, the wage bases as data, and arrears as their own balance.

```sql
ALTER TABLE pay_item_types
  ADD COLUMN pipeline_step     SMALLINT NOT NULL DEFAULT 1   -- 1 earnings ... 7 distributions
    CHECK (pipeline_step BETWEEN 1 AND 7),
  ADD COLUMN pays_cash         BOOLEAN NOT NULL DEFAULT TRUE, -- false for imputed lines and cash tips held
  ADD COLUMN w2_box12_code     TEXT;                          -- 'C', 'D', 'W', 'TP', 'TT', 'TA', ...

ALTER TABLE taxability_rules
  ADD COLUMN annual_limit      BIGINT,              -- exempt only up to this, e.g. dependent care
  ADD COLUMN monthly_limit     BIGINT,              -- e.g. qualified transportation
  ADD COLUMN limit_key         TEXT;                -- the accumulator key the limit reads

CREATE TABLE wage_bases (                           -- caps and thresholds as data, by tax and year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tax_type            TEXT NOT NULL,                -- 'social_security', 'futa', 'sui', 'pfml', ...
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  kind                TEXT NOT NULL CHECK (kind IN ('wage_cap', 'contribution_cap',
                        'threshold_start')),       -- threshold_start: Additional Medicare
  amount              BIGINT NOT NULL,              -- cents: 18450000, 700000, 20000000, ...
  source_ref          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,           -- the calendar or program year
  EXCLUDE USING GIST (tax_type WITH =, jurisdiction_id WITH =, kind WITH =,
    valid_during WITH &&)
);

CREATE TABLE calculation_runs (                     -- one engine run for one statement
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_statement_id    UUID NOT NULL REFERENCES pay_statements (id),
  attempt             SMALLINT NOT NULL,            -- a recalculation before approval is a new attempt
  as_of_period        DATERANGE NOT NULL,           -- what the effective-dated reads used
  as_of_check_date    DATE NOT NULL,                -- tax rules are read as of the check date
  engine_version      TEXT NOT NULL,
  inputs_hash         CHAR(64) NOT NULL,            -- hash of every row read, for replay checks
  status              TEXT NOT NULL CHECK (status IN ('ok', 'warnings', 'failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pay_statement_id, attempt)
);

CREATE TABLE calculation_steps (                    -- what each step read, computed and decided
  calculation_run_id  UUID NOT NULL REFERENCES calculation_runs (id),
  seq                 SMALLINT NOT NULL,
  step                SMALLINT NOT NULL CHECK (step BETWEEN 1 AND 7),
  tax_type            TEXT,                         -- for base and tax steps
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),
  base_amount         BIGINT,                       -- the base this step computed on
  result_amount       BIGINT,
  rule_ids            UUID[] NOT NULL DEFAULT '{}', -- taxability_rules, wage_bases, tables used
  decision            TEXT,                         -- 'taken', 'capped', 'skipped_negative_net', ...
  detail              JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (calculation_run_id, seq)
);

CREATE TABLE deduction_arrears (                    -- what a deduction couldn't take, and its recovery
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  deduction_election_id UUID NOT NULL REFERENCES deduction_elections (id),
  origin_statement_id UUID NOT NULL REFERENCES pay_statements (id),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  recovered           BIGINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('open', 'recovered', 'waived')),
  CHECK (recovered <= amount)
);
```

The pipeline reads `taxability_rules` once per statement as of the check date and builds, for every tax the worker is subject to, the list of pay item types that enter its base. A sketch of the base query, for the statement's Social Security subject wages:

```sql
SELECT SUM(CASE WHEN pit.kind = 'earning' THEN l.amount ELSE -l.amount END) AS subject_wages
FROM pay_statement_lines l
JOIN pay_item_types pit ON pit.code = l.pay_item_type
JOIN taxability_rules tr
  ON tr.pay_item_type = l.pay_item_type
 AND tr.tax_type = 'social_security'
 AND tr.jurisdiction_id = $federal_id
 AND tr.valid_during @> $check_date::DATE
WHERE l.pay_statement_id = $statement_id
  AND l.line_type IN ('earning', 'deduction')
  AND ((pit.kind = 'earning'   AND tr.treatment = 'subject')
    OR (pit.kind = 'deduction' AND tr.treatment = 'exempt'));
```

An earning is in the base when it is subject; a deduction comes out of the base when the deduction is exempt from that tax (a Section 125 premium is `exempt` for Social Security, a traditional 401(k) deferral is `subject`). The taxable wages are then `LEAST(subject_wages, base_amount - ytd_taxable)` from `wage_bases` and the accumulator, floored at zero.

Design notes:

- **Every rule a run used is recorded with the run.** `calculation_steps.rule_ids` lists the taxability rows, wage bases and withholding tables, so "why was this taxed" is a lookup, and a rule change shows which statements it would have changed ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Replay must match.** Re-running a paid statement against its `as_of_period` and `as_of_check_date` must produce identical lines; `inputs_hash` makes a mismatch detectable before a correction relies on it ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Year-to-date is read, not stored, at calculation time.** The run reads the accumulator for the worker and employer as of the check date, excluding the statement being computed; two runs in flight for the same worker (a regular run and an off-cycle bonus) must be serialized per worker or the second double-counts the base.
- **Arrears are balances with lines.** A recovery is a deduction line that names the `deduction_arrears` row; the arrears balance is the amount less the sum of those lines, never a stored counter.
- **The engine stays a function.** Whether the calculation is in-house or a tax engine like Symmetry's, it takes inputs and returns lines; persistence, accumulators and approvals are the payroll system's job ([Tax Engines & Filing Services](/books/workforce/tax-engines-and-filing) in the Payroll Tax part covers the split).

## Auditing

A statement is the record the DOL, the IRS, a state, a plan auditor and the worker will ask about:

- **Every line with its type, base and rule.** For each tax line, the subject and taxable wages and the rules that produced them, so a W-2 box or a 941 line can be traced to statement lines and from those to the rules in force on the check date.
- **The calculation as run.** The run's as-of dates, engine version, inputs hash and steps, kept with the statement for as long as the statement is kept.
- **What wasn't taken.** Skipped deductions, short garnishments and uncollected taxes with the reason, because an employer that failed to withhold a support order is liable for it and an employee shown a deduction that didn't happen will ask.
- **Gross-ups with their target.** The target net and the solved gross as an audit detail of the off-cycle statement, so the employer's decision to cover the tax is documented even though the target isn't an input on replay.
- **Federal recordkeeping fields.** The FLSA's 29 CFR 516.2 list (hours each workday and workweek, straight-time earnings, the overtime premium separately, additions and deductions each pay period, total wages, pay date and period) is a subset of what the statement lines carry; the Time and Wage-Hour part covers it. The audit mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds).

## What This Means for the System You Build

- **Run the seven steps in order,** and test that every step's base is computable from lines earlier steps produced.
- **Drive every base from `taxability_rules` by pay item type and jurisdiction,** effective-dated with a source, never from company codes or code branches.
- **Store subject and taxable wages on every tax line** so caps, W-2 boxes and corrections are sums.
- **Round once, at the line, half up to the cent,** and report the employer and employee drift instead of forcing it to zero.
- **Read year-to-date from paid lines as of the check date,** and serialize concurrent runs per worker.
- **Solve gross-ups by search on an off-cycle statement** and store the gross, not the target.
- **Never pay a negative net:** take taxes, then garnishments, then voluntary deductions by rule, and keep arrears as balances with recovery lines.
- **Record every run's inputs and rules** so a paid statement replays exactly.

## References

**Law and regulation**

- [29 CFR 531.35](https://www.law.cornell.edu/cfr/text/29/531.35), wages paid "free and clear" and the kickback rule
- [29 CFR 516.2](https://www.law.cornell.edu/cfr/text/29/516.2), the FLSA's required payroll record fields

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), the 2026 Social Security wage base, tips and the tip withholding order, supplemental wages, the section 15 table of special payments (401(k), SIMPLE, cafeteria plans, dependent care, severance), HSA contributions inside and outside a cafeteria plan, and reimbursements
- [IRS: Publication 15-T (2026), Federal Income Tax Withholding Methods (PDF)](https://www.irs.gov/pub/irs-pdf/p15t.pdf), Worksheet 1A, the 2026 annual percentage method tables and the rounding rule
- [IRS: Publication 15-B (2026), Employer's Tax Guide to Fringe Benefits (PDF)](https://www.irs.gov/pub/irs-pdf/p15b.pdf), Table 2-1 treatments, the $7,500 dependent care and $340 transportation limits, and Table 2-2 group-term life costs
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), designated Roth contributions in boxes 1, 3 and 5, and the new TP, TT and TA codes
- [DOL WHD: Fact Sheet #30, the Federal Wage Garnishment Law](https://www.dol.gov/agencies/whd/fact-sheets/30-cppa), disposable earnings and what can and can't be subtracted, the 25% and 30-times rules and the support percentages
- [Pennsylvania Department of Revenue: PA Personal Income Tax Guide, Gross Compensation](https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/gross-compensation), retirement plan contributions as always taxable and the cafeteria plan rules
- [New Jersey Division of Taxation: NJ-WT, New Jersey Income Tax Withholding Instructions (September 2025, PDF)](https://www.nj.gov/treasury/taxation/pdf/current/njwt.pdf), compensation subject and not subject to withholding, the 401(k) exclusion and box 16 contents

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), the earning `type` catalog, tips and imputed types
- [Check: Gross-up payments](https://docs.checkhq.com/docs/gross-up-payments.md), the gross-up endpoint, off-cycle requirements, supplemental treatment and the smallest-gross rule
- [Check: Post-tax deductions](https://docs.checkhq.com/docs/post-tax-deductions.md), post-tax deductions, garnishment fields, priority and skipped deductions on negative net
- [Gusto Embedded: Get earning types](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-earning_types.md), default and custom earning types
- [Gusto Embedded: Calculate gross up](https://docs.gusto.com/embedded-payroll/reference/post-payrolls-gross-up-payroll_uuid.md), gross-up on off-cycle unprocessed payrolls
- [Gusto Embedded: Create a garnishment](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees-employee_id-garnishments.md), garnishment types, maximums and the child support cap
- [Symmetry: What is the Symmetry Tax Engine](https://docs.symmetry.com/ste/overview/what-is-the-ste), a stateless engine with year-to-date supplied by the caller and rules effective by pay date
- [Symmetry: Wage types](https://docs.symmetry.com/ste/core-concepts/wage-types.md), regular, supplemental and custom wage types
- [Symmetry: Calculate a gross-up payment](https://docs.symmetry.com/ste/api-reference/payroll-calculations/calculate-a-gross-up-payment.md), the gross-up endpoint and supplemental calculation methods
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), earning components by tax treatment, gross-up and correction earnings
- [Zeal: Deduction types](https://docs.zeal.com/docs/deductions-types.md), pre-tax and post-tax deduction types
