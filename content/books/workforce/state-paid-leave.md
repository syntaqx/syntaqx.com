+++
title = "State Paid Family & Medical Leave"
nav_title = "State Paid Leave"
description = "State disability and paid leave programs as payroll runs them: 2026 rates and wage bases, splits, small employer rules, private plans, wage reports and taxes."
category = "Workforce Industry"
order = 2643
part = "Leave"
tags = ["paid-leave", "pfml", "state-disability", "payroll-tax", "leave", "state-programs"]
+++

The FMLA guarantees a job, not a paycheck. A growing list of states pays the paycheck: a worker on family or medical leave draws a weekly benefit from a state fund (or a private plan standing in for it), and the fund is financed by a payroll contribution the employer withholds, sometimes matches, reports by worker every quarter and remits on a schedule. California (State Disability Insurance, which includes Paid Family Leave), New York, New Jersey and Rhode Island run long-standing disability and family leave programs; Washington, Massachusetts, Connecticut, Oregon, Colorado, Delaware, Minnesota and Maine run newer paid family and medical leave (PFML) programs, the last three paying their first benefits in 2026; and Maryland's contributions are now set to begin January 1, 2027. Each has its own rate, wage base, split between employer and employee, small employer rule, private plan option and report.

For the payroll system each program is a tax that looks like a deduction. It is computed per pay period on a wage base, with an employee share that is withheld and an employer share that is a memo line; it stops at a cap that may be the state's own, the Social Security wage base or none at all; it is registered, reported and remitted like unemployment insurance; and from 2025 its federal tax treatment has a revenue ruling behind it. Benefits are paid by the state, not the payroll, but medical leave benefits come back to payroll as third-party sick pay. This chapter covers the programs one by one with 2026 figures, the splits and small employer rules with worked numbers, private and equivalent plans, wage reporting, the federal tax treatment under Rev. Rul. 2025-4, and benefit coordination and job protection. Unpaid federal leave is in [FMLA Administration](/books/workforce/fmla); private insurance that substitutes for a state program, as the carrier sees it, is in the Insurance volume's [State Disability and Paid Leave: Private Plans](/books/insurance/group-life-and-disability#state-disability-and-paid-leave-private-plans). This is a description of the rules for engineers, not legal advice.

## The Programs at a Glance

Contribution rules as of November 2026, from each program's own pages or statute where I could open them:

| State | Program | 2026 contribution | Wage base | Who pays |
| --- | --- | --- | --- | --- |
| **California** | SDI (includes Paid Family Leave) | 1.3%; 1.4% for 2027 | No limit since January 1, 2024 (SB 951) | Employee |
| **New York** | Paid Family Leave | 0.432% of gross wages per pay period | Annual maximum contribution $411.91 | Employee |
| **New York** | Disability Benefits (DBL) | Up to one-half of one percent of wages, at most 60 cents a week | Weekly cap | Employee share; employer secures the coverage |
| **New Jersey** | Temporary Disability Insurance | Workers 0.19% (maximum $325.09) | First $171,100 | Worker and employer (employer rate not on the page I opened) |
| **New Jersey** | Family Leave Insurance | Workers 0.23% (maximum $393.53) | First $171,100 | Workers only: "Employers do not contribute" |
| **Rhode Island** | TDI and Temporary Caregiver Insurance | Not stated here (agency page blocked) | Not stated here | Employee |
| **Washington** | Paid Family and Medical Leave | 1.13% total; 1.2% for 2027, employers 29.3% and employees 70.7% | Social Security wage base | Split; under 50 employees, no employer share |
| **Massachusetts** | Paid Family and Medical Leave | Not stated here (agency site blocked) | Social Security wage base | Split by employer size |
| **Connecticut** | CT Paid Leave | 0.5%, and 0.5% again for 2027 | Social Security wage base | Employee |
| **Oregon** | Paid Leave Oregon | 1%, never more than 1% | $184,500 | 25 or more employees: employer 40%, employee 60%; under 25: employee only |
| **Colorado** | FAMLI | 0.88%, down from 0.9% (secondary source) | Not stated here | Split |
| **Delaware** | Delaware Paid Leave | "Less than 1%" of wages | Not stated here | Employer may pass up to half to employees; coverage tiers by size |
| **Minnesota** | Minnesota Paid Leave | 0.7% from January 1, 2026; small employers 75% of the rate | Social Security wage base | Employer at least 50% (small employers at least 25%) |
| **Maine** | Paid Family and Medical Leave | 1.0% combined | Social Security wage base | Employer may deduct up to 50%; under 15 employees remit only 50% |
| **Maryland** | FAMLI | Contributions from January 1, 2027 (secondary source) | Not yet set | To be set by the Secretary |

<!-- source-gap: wf-pfml-ri-ma-rates | missing | 2026 contribution rates and wage bases for Rhode Island TDI/TCI and Massachusetts PFML, and New Jersey's employer TDI rate | closes with: dlt.ri.gov and mass.gov rate pages (both 403 to automated fetches on Nov 10, 2026) or a state rate notice, opened | checked: 2026-11-10 --> <!-- source-gap: wf-pfml-co-md-status | secondary | Colorado FAMLI 2026 premium of 0.88% and Maryland FAMLI contribution start of January 1, 2027 and benefits from January 3, 2028 | closes with: famli.colorado.gov and labor.maryland.gov pages or the enacted bills, opened (CO 403, MD 404 on Nov 10, 2026) | checked: 2026-11-10 --> Rhode Island's and Massachusetts's agency pages and New Jersey's employer TDI rate weren't reachable from the sources I opened, so the table leaves them blank rather than repeating a vendor blog; Colorado's 2026 rate and Maryland's dates come from a law firm's October 30, 2025 summary, not the agencies. Where a program's cap is the Social Security wage base, it's $184,500 for 2026 ([Social Security and Medicare](/books/workforce/fica-futa-and-suta#social-security-and-medicare)), the same table row the payroll engine already uses for OASDI.

The table is the reason this chapter's model reuses the shared `tax_rates` table for each program's per-payer rate and wage base and adds a program table for everything that doesn't fit a rate row: splits that depend on headcount, annual maximums that aren't a wage base, coverage tiers and private plan options.

## Program by Program

**California SDI and Paid Family Leave.** One contribution funds both: 1.3% of wages in 2026, 1.4% in 2027, withheld from employees. Senate Bill 951 "removes the taxable wage limit and maximum withholdings for each employee subject to SDI contributions," effective January 1, 2024, so a $400,000 salary contributes $5,200.00 in 2026. California's unemployment insurance ($7,000 wage base, employer rates from 1.5% to 6.2%) and the Employment Training Tax (0.1% of $7,000) are separate taxes on the same payroll ([SUTA: State Unemployment Insurance](/books/workforce/fica-futa-and-suta#suta-state-unemployment-insurance)). An employer can replace SDI with a state-approved Voluntary Plan that must provide every SDI benefit and at least one better and can't cost employees more than SDI.

**New York PFL and DBL.** Paid Family Leave is funded by employees at 0.432% of gross wages per pay period up to an annual maximum of $411.91 in 2026, and pays 67% of the employee's average weekly wage up to $1,228.53 a week (67% of the 2026 New York State Average Weekly Wage of $1,833.63) for up to 12 weeks of job-protected leave. The annual maximum is the rate times the NYSAWW times 52: 0.00432 x $1,833.63 x 52 = $411.91. Disability Benefits are insured rather than state-run: the employer secures DBL and PFL coverage through an authorized carrier, the State Insurance Fund or approved self-insurance, and may collect up to one-half of one percent of wages, at most 60 cents a week, toward DBL.

**New Jersey TDI and FLI.** For 2026, workers contribute 0.19% to Temporary Disability Insurance and 0.23% to Family Leave Insurance, each on the first $171,100 of covered wages, for maximums of $325.09 and $393.53; the maximum weekly benefit is $1,119. FLI "is financed 100% by worker payroll deductions." Employers may cover TDI with the state plan or a private insurer.

**Washington PFML.** The 2026 premium is 1.13% of wages up to the Social Security wage base, rising to 1.2% on January 1, 2027, when "Employers will pay 29.3% of the total premium and employees will pay 70.7%." Employers with fewer than 50 employees don't owe the employer share but "must still collect the employee premium or pay the employees' premiums on their behalf." Once an employee meets the Social Security cap, "you must stop collecting premiums but continue to report their wages." From August 1, 2026, penalties apply to past-due reports and interest to overdue premiums. 2SHB 2345 changes how contributions divide between the family and medical premiums from 2027 "without affecting how the total premium is divided between employees and employers." <!-- source-gap: wf-wa-2026-split | missing | Washington PFML 2026 employer and employee shares of the 1.13% premium | closes with: a paidleave.wa.gov premium rates page for 2026, opened (the premiums page 404 on Nov 10, 2026) | checked: 2026-11-10 --> The page I opened gives the 2027 split but not 2026's, so I don't state one.

**Connecticut.** "Employers deduct 0.5% from an employee's pay," and employees contribute "until they reach the Social Security contribution limit"; the Authority's board voted to keep the rate at 0.5% for 2027. Contributions are employee-funded, and sole proprietors may opt in. As of September 30, 2026 the program reported 152,000 registered employers and $1.9 billion in benefits paid.

**Oregon.** Paid Leave Oregon's contribution is 1% of gross wages up to $184,500 for 2026, and the rate "may change yearly" but will "never be more than 1%." Employers with 25 or more employees pay 40% and employees 60%; smaller employers don't pay the employer share but must still withhold, report and pay the employees'. Benefits cover up to 12 weeks (14 for pregnancy-related conditions) in a 52-week period.

**Colorado FAMLI.** The total premium dropped from 0.9% to 0.88% of wages on January 1, 2026, per a law firm summary; the program's site wasn't reachable from the sources I opened.

**Delaware.** Payroll deductions began January 1, 2025; the first quarterly Hours & Wage Report was due April 30, 2025 and first contributions July 30, 2025; claims began January 1, 2026. The program is funded by "less than 1% of an employee's weekly salary," and employers can require employees to pay up to half. Coverage is tiered by size: 1 to 9 employees exempt, 10 to 24 covered for parental leave only, 25 or more fully covered. Benefits pay up to 80% of wages, capped at $900 a week: up to 12 weeks a year for a new child, and up to 6 weeks in 24 months each for a family member's or the employee's own serious health condition or a military deployment, with 12 weeks combined a year.

**Minnesota.** The statute sets the rate "beginning January 1, 2026" at 0.7% for employers in both the family and medical programs, with lower rates for employers that have an approved private plan for one of them (0.4% and 0.3%), and caps the annual rate at 1.1%. Employers pay at least 50% and employees "the remaining portion, if any," and employers can't deduct the employer share. A small employer (30 or fewer employees and an average wage at or below 150% of the state average) pays 75% of the annual rate and must pay at least 25% of it. Premiums apply to wages up to the Social Security maximum, are computed by the state from the employer's wage detail report and are due by the last day of the month after each calendar quarter; from July 31, 2026, the commissioner sets the next year's rate each July 31 (Minn. Stat. 268B.14). Benefits began January 1, 2026.

**Maine.** Beginning January 1, 2025 the combined premium is 1.0% of wages up to the Social Security base, remitted quarterly. An employer with 15 or more employees may deduct up to 50% from wages and remits 100%; one with fewer than 15 may deduct up to 50% and remits only 50%. The department sets the rate each year by October 1, starting with 2028 (26 M.R.S. 850-F). Benefits began May 1, 2026.

**Maryland.** Contributions are now scheduled to begin January 1, 2027 and benefits January 3, 2028, with the Secretary of Labor setting the 2027 rate, per the same law firm summary.

## Worked Numbers: Splits, Caps and Small Employers

Invented employees, 2026 figures from the table:

| State and case | Wages | Program cost | Employee withheld | Employer pays |
| --- | --- | --- | --- | --- |
| **Oregon,** 25+ employees, one biweekly check | $3,000.00 | 1% = $30.00 | 60% = $18.00 | 40% = $12.00 |
| **Oregon,** under 25 employees | $3,000.00 | Employee share only | $18.00 | $0.00 |
| **Minnesota,** standard employer, employee charged the maximum | $2,000.00 | 0.7% = $14.00 | 50% = $7.00 | $7.00 |
| **Minnesota,** small employer, employer pays the minimum | $2,000.00 | 0.525% = $10.50 | 75% = $7.875, rounded once by the stated rule | 25% = $2.625 |
| **Maine,** 15+ employees, maximum deduction | $2,000.00 | 1% = $20.00 | $10.00 | $10.00 (remits $20.00) |
| **Maine,** under 15 employees, maximum deduction | $2,000.00 | Remits 50% = $10.00 | $10.00 | $0.00 |
| **Connecticut,** salary of $200,000 | $200,000.00 a year | 0.5% to $184,500 = $922.50 | $922.50 | $0.00 |
| **Washington, 2027,** 50+ employees | $2,000.00 | 1.2% = $24.00 | 70.7% = $16.97 | 29.3% = $7.03 |

**The New York cap mid-year.** An invented New York employee earns $5,000 a week. PFL is 0.432% x $5,000 = $21.60 a week; 19 weeks contribute $410.40, week 20 contributes the last $1.51 to reach $411.91, and nothing is withheld after that. The cap is a dollar maximum, not a wage base, so it has to be tracked as a year-to-date contribution in `accumulators`, not as taxable wages.

**The New Jersey caps together.** An invented New Jersey employee earning $200,000 contributes 0.19% and 0.23% on the first $171,100: $325.09 + $393.53 = $718.62, both stopping on the check where year-to-date covered wages cross $171,100, with the crossing check prorated exactly as the Social Security crossover is ([Worked Numbers: Crossing the Wage Base](/books/workforce/fica-futa-and-suta#worked-numbers-crossing-the-wage-base)).

Three rules fall out. Splits are percentages of the premium, not of wages, so the engine computes the premium, then splits it, and rounds each side once, by a stated rule ([Rounding](/docs/money/amounts#rounding)). The employer's headcount, which decides the split in Oregon, Washington, Maine and Minnesota and the coverage tier in Delaware, is itself an effective-dated fact with its own counting rule per state, stored and dated rather than recounted on each check. And an employer that chooses to pay the employee share (Washington's "or pay the employees' premiums on their behalf") creates taxable wages under the federal rules below.

## Private and Equivalent Plans

Most programs let an employer substitute its own plan, and the payroll consequences differ:

- **California Voluntary Plan.** It must provide all SDI benefits and at least one better and can't cost employees more than SDI; employees in it aren't eligible for SDI ([State Disability and Paid Leave: Private Plans](/books/insurance/group-life-and-disability#state-disability-and-paid-leave-private-plans)). Payroll withholds the plan's contribution instead of SDI.
- **New York.** DBL and PFL are always insured or self-insured: the "plan" is the employer's carrier, and the employee contribution is withheld for it.
- **New Jersey.** "Employers may choose an insurance plan offered by the state or by a private insurance company" for TDI.
- **Oregon equivalent plans.** An employer plan that offers the same or greater benefits, covers all employees and is approved by the Oregon Employment Department replaces the state contribution.
- **Minnesota private plans.** An employer with an approved private plan for family or medical leave pays a reduced state rate for the other program (0.4% or 0.3%).
- **Washington, Massachusetts, Connecticut, Colorado, Delaware and Maine** also allow approved private plans or exemptions; the details are in each program's rules, not stated here.

A private plan changes three things in payroll: the deduction code (the plan's, not the state's), the liability's payee (a carrier or the employer's own plan instead of the state), and the report, which most states still require in some form. The approval has an effective date and usually an expiry, and a lapsed approval switches the employer back to the state program from that date, which is why approvals are effective-dated rows that the deduction rules read.

## Wage Reporting and Remittance

Every program collects a per-worker wage report, usually quarterly, beside or inside the state's unemployment insurance report:

- **Minnesota** computes the premium from the employer's wage detail report and bills it; premiums are due by the last day of the month after each quarter, and an adjusted wage report produces a recomputed premium and an assessment or credit.
- **Delaware** requires a quarterly Hours & Wage Report: hours, not just wages, because benefit eligibility depends on them.
- **Washington** requires wages to keep being reported after the employee's premiums stop at the Social Security cap.
- **Maine** requires quarterly contribution reports and premiums.

The engine's job is the same as for SUI: a `tax_registrations` row of type `paid_leave` or `sdi` per employer and state, a `liabilities` row per run with the due date from the program's quarter rule, and a `filings` row per quarter whose lines are per-worker wages (and hours where the state asks). The difference from SUI is the wage definition, which each program sets, and the cap, which may be the Social Security base, the state's own figure or nothing; the engine reads both from `tax_rates` and `taxability_rules` ([Tax Engines & Filing Services](/books/workforce/tax-engines-and-filing#the-file-and-remit-layer)).

## Federal Tax Treatment: Rev. Rul. 2025-4

The IRS settled the federal treatment of state PFML contributions and benefits in Rev. Rul. 2025-4, effective for payments made on or after January 1, 2025. Its holdings, from the ruling's own summary tables:

| Item | Federal treatment |
| --- | --- |
| **Employer contribution** | The employer deducts it as an excise tax under section 164; it isn't in the employee's gross income |
| **Employee contribution** | Included in the employee's gross income as wages and on Form W-2; the employee may deduct it as a state income tax if itemizing, within the SALT limit |
| **Employer pick-up of the employee contribution** | Deductible by the employer under section 162, and additional wages to the employee on Form W-2 |
| **Family leave benefits** | Gross income to the employee, not wages; the state reports them on a Form 1099 |
| **Medical leave benefits attributable to employer contributions** | Gross income and wages, except as section 105 provides; "These payments are third-party payments (by a party that is not an agent of the employer) of sick pay," so the sick pay reporting rules apply |
| **Medical leave benefits attributable to employee contributions** | Excluded from gross income |

The ruling's own example is a 60/40 program at 1%: an employee with $104,000 of weekly wages over 2025 has $1,040 remitted, $624 withheld and $416 paid by the employer; the $624 is wages, the $416 isn't. Calendar year 2025 was a transition period: states and employers weren't required to follow the third-party sick pay withholding and reporting rules, or FICA and FUTA, on medical benefits attributable to employer contributions paid in 2025, and an employer pick-up wasn't required to be treated as wages for federal employment taxes for 2025. Notice 2026-6 extended the first two parts of that relief for an "additional transition period": for medical leave benefits a state pays in calendar year 2026, the portion attributable to employer contributions still needn't follow the third-party sick pay withholding and reporting rules, or FICA and FUTA, and no penalties apply. It didn't extend the third part, so from 2026 an employer pick-up of the employee contribution is wages for federal employment taxes.

For payroll that means three things. The employee contribution is a post-tax deduction for federal purposes: it doesn't reduce federal taxable wages. An employer pick-up is a taxable earning (gross it up if the employer means the employee to be whole). And medical leave benefits funded by employer contributions are third-party sick pay that the state pays and the employer must account for once the transition ends (after 2026, unless extended again): FICA on the employer-funded share, and the sick pay in W-2 wages, using the same mechanics as any third-party sick pay, which the core model's `pay_runs.run_type` of `third_party_sick` exists to record. The state's report of what it paid, by worker, becomes an input file, and the employer's 941 and W-2 must reflect it ([Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s)). State income tax treatment varies by state and isn't covered by the ruling.

## Benefit Coordination and Job Protection

The state pays the benefit; the employer's systems decide what else happens around it:

- **FMLA runs concurrently.** Where leave qualifies under both, "the leave used counts against the employee's entitlement under both laws" ([The ADA, Paid Leave and State Leave](/books/workforce/fmla#the-ada-paid-leave-and-state-leave)). The `leave_cases` rows for the FMLA case and the state program case point at each other.
- **Job protection differs by program.** New York's 12 weeks of PFL are job-protected. Oregon protects the job of an employee who has worked for the employer "more than 90 consecutive days." Washington extended job protection to employees of employers with 25 or more employees in 2026 and cut the minimum claimable time in a week from 8 consecutive hours to 4. Delaware's eligibility requires one year and 1,250 hours with a single employer. Where a state program doesn't protect the job, the FMLA or a separate state leave law may.
- **Benefits and pay.** Whether an employer may or must let employees top up a state benefit with PTO is a state rule; where it's allowed, the top-up is wages on the payroll and the state benefit isn't. The payroll needs the leave dates, the state's benefit amount where the employer is told it, and the PTO election, to avoid paying more than 100% of wages where the program forbids it.
- **Eligibility often depends on payroll's own data.** Programs determine eligibility from wages (and, in Delaware, hours) the employer reported in prior quarters, so a late or wrong wage report can deny a benefit; that's a reason to reconcile filed wage reports to statement lines every quarter.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Each program's per-payer rate and wage base is a row in the shared `tax_rates` table from [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#how-to-build-it); this chapter adds the program, its year's parameters that aren't rates, private plan approvals and the wage report.

```sql
CREATE TABLE pfml_programs (               -- one per state program
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  code                TEXT NOT NULL UNIQUE,  -- 'ca_sdi', 'ny_pfl', 'ny_dbl', 'nj_tdi', 'nj_fli',
                                             -- 'wa_pfml', 'or_plo', 'mn_pl', 'me_pfml', ...
  kind                TEXT NOT NULL CHECK (kind IN ('disability', 'family', 'family_and_medical')),
  administered_by     TEXT NOT NULL CHECK (administered_by IN ('state', 'insured', 'state_or_private')),
  report_cadence      TEXT NOT NULL CHECK (report_cadence IN ('quarterly', 'annual', 'with_ui')),
  reports_hours       BOOLEAN NOT NULL DEFAULT FALSE,   -- Delaware's Hours & Wage Report
  report_after_cap    BOOLEAN NOT NULL DEFAULT TRUE,    -- Washington: keep reporting wages
  source_url          TEXT NOT NULL
);

CREATE TABLE pfml_rates (                  -- a program year's parameters that aren't a rate row
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pfml_program_id     UUID NOT NULL REFERENCES pfml_programs (id),
  total_rate          NUMERIC(8, 6) NOT NULL,   -- 0.011300 for Washington 2026
  wage_base_rule      TEXT NOT NULL CHECK (wage_base_rule IN ('none', 'ss_wage_base', 'state_fixed',
                        'annual_max_contribution')),
  wage_base           BIGINT,                -- cents, for 'state_fixed' (NJ $171,100)
  annual_max_cents    BIGINT,                -- New York PFL $411.91
  weekly_max_cents    BIGINT,                -- New York DBL 60 cents
  split_rule          JSONB NOT NULL,        -- [{"min_employees": 25, "employer_share": 0.40},
                                             --  {"min_employees": 0,  "employer_share": 0.0}]
  employee_share_max  NUMERIC(6, 5),         -- the most an employer may withhold (0.5 in MN, ME)
  coverage_tiers      JSONB,                 -- Delaware: 1-9 exempt, 10-24 parental, 25+ full
  headcount_rule      TEXT NOT NULL,         -- how the state counts employees for the split
  private_plan_rates  JSONB,                 -- Minnesota: one program privately covered
  tax_rate_ids        UUID[] NOT NULL,       -- the per-payer tax_rates rows generated from this
  source_ref          TEXT NOT NULL,         -- 'Minn. Stat. 268B.14 subd. 6', 'EDD 2026 rates'
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (pfml_program_id WITH =, valid_during WITH &&)
);

CREATE TABLE employer_program_sizes (      -- the headcount that picked the split, dated
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pfml_program_id     UUID NOT NULL REFERENCES pfml_programs (id),
  employee_count      INT NOT NULL,
  counted_by_rule     TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, pfml_program_id WITH =, valid_during WITH &&)
);

CREATE TABLE private_plan_approvals (      -- a voluntary, equivalent or private plan in force
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pfml_program_id     UUID NOT NULL REFERENCES pfml_programs (id),
  covers              TEXT NOT NULL CHECK (covers IN ('family', 'medical', 'both', 'disability')),
  carrier_name        TEXT,                  -- null for a self-insured plan
  approval_number     TEXT,
  employee_rate       NUMERIC(8, 6),         -- what the plan withholds, if anything
  deduction_code_id   UUID NOT NULL REFERENCES deduction_codes (id),
  document_id         UUID REFERENCES documents (id),
  valid_during        DATERANGE NOT NULL,    -- a lapse returns the employer to the state plan
  EXCLUDE USING GIST (employer_id WITH =, pfml_program_id WITH =, valid_during WITH &&)
);

CREATE TABLE pfml_wage_reports (           -- one per employer, program and quarter
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_id           UUID NOT NULL REFERENCES filings (id),   -- the report as filed
  pfml_program_id     UUID NOT NULL REFERENCES pfml_programs (id),
  quarter             DATERANGE NOT NULL,
  subject_wages       BIGINT NOT NULL,       -- cents, the program's wage definition
  employee_premium    BIGINT NOT NULL,
  employer_premium    BIGINT NOT NULL,
  hours_reported      NUMERIC(10, 2),        -- where the state asks
  state_billed_cents  BIGINT,                -- Minnesota computes and bills
  variance_cents      BIGINT GENERATED ALWAYS AS
                        (COALESCE(state_billed_cents, employee_premium + employer_premium)
                         - (employee_premium + employer_premium)) STORED
);

ALTER TABLE leave_cases
  ADD COLUMN pfml_program_id        UUID REFERENCES pfml_programs (id),
  ADD COLUMN concurrent_case_id     UUID REFERENCES leave_cases (id),  -- the FMLA case beside it
  ADD COLUMN state_claim_number     TEXT,
  ADD COLUMN topup_policy           TEXT CHECK (topup_policy IN ('none', 'employee_elects',
                                      'employer_requires', 'prohibited'));
```

A pay run reads the employer's `employer_program_sizes` for the period, the program's `pfml_rates` and the generated `tax_rates` rows; computes the premium on the program's wages up to its cap (or annual maximum from `accumulators`); splits it; and writes an `employee_tax` line for the withheld share and an `employer_tax` line for the rest, each with a `liabilities` row to the program or the private plan's payee. A private plan approval in force swaps the deduction code and payee for its dates. The quarterly report is generated from statement lines, and a state bill (Minnesota) is reconciled against it.

Design notes:

- **Reuse the shared rate table for rates and wage bases,** and keep splits, tiers and annual maximums in the program's year row.
- **Store the headcount that picked the split,** dated, with the state's counting rule.
- **Track annual maximum contributions as year-to-date amounts,** not as wage bases.
- **Effective-date private plan approvals** and fall back to the state program when one lapses.
- **Treat employee contributions as federal wages** and employer pick-ups as taxable earnings under Rev. Rul. 2025-4, with no pick-up relief after 2025.
- **Import state-paid medical benefits as third-party sick pay** for FICA and the W-2.

## Auditing

A state program audit or a benefit appeal asks:

- **Every check's premium:** the wages, the cap or annual maximum, the rate and split in force, and the headcount that chose the split.
- **Quarterly wage reports as filed,** reconciled to statement lines and to any state bill, with corrections and their dates.
- **Private plan approvals** with their dates, carriers and the deduction that replaced the state's.
- **Remittances** against each quarter's liability, with interest or penalties where late.
- **Third-party sick pay** imported from the state, with the FICA and W-2 treatment applied.
- **Leave cases** that ran concurrently with FMLA, with the dates and the top-up decisions.

## What This Means for the System You Build

- **Model each state program as a tax with a split,** computed on the program's own wage definition and cap.
- **Handle three kinds of cap:** none (California), a wage base (New Jersey, Oregon, the Social Security base) and an annual maximum contribution (New York).
- **Recompute splits from dated headcounts,** per state counting rule, for Oregon, Washington, Maine, Minnesota and Delaware.
- **Support private and equivalent plans** as dated replacements of the state deduction and payee.
- **File the quarterly report from statement lines,** with hours where the state asks, and reconcile to state bills.
- **Apply Rev. Rul. 2025-4:** employee contributions in wages, employer pick-ups taxable, employer-funded medical benefits as third-party sick pay.
- **Link state program cases to FMLA cases** and record top-up decisions with the payroll lines they produced.

## References

**Law and regulation**

- [Minnesota Statutes 268B.14: Premiums](https://www.revisor.mn.gov/statutes/cite/268B.14), the 0.7% rate from January 1, 2026, private plan rates, the 1.1% cap, the 50% employer minimum, small employer rules, the Social Security wage cap and quarterly due dates
- [Maine Revised Statutes 26 §850-F: Premiums](https://legislature.maine.gov/statutes/26/title26sec850-F.html), the 1.0% combined rate from January 1, 2025, the 50% deduction, the under-15 rule, the Social Security cap and annual rate setting
- [29 CFR 825.701: Interaction with State laws](https://www.law.cornell.edu/cfr/text/29/825.701), concurrent counting under FMLA and state law

**Agency guidance and forms**

- [California EDD: Rates and withholding](https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/), SDI 1.3% for 2026 and 1.4% for 2027 with no wage limit (SB 951), UI and ETT
- [New York Paid Family Leave: 2026 updates](https://paidfamilyleave.ny.gov/2026), 0.432% with a $411.91 maximum, 67% of the NYSAWW of $1,833.63, a $1,228.53 weekly maximum and 12 weeks
- [New Jersey: Family Leave Insurance](https://www.nj.gov/labor/myleavebenefits/labor/myleavebenefits/worker/fli/), 0.23% on the first $171,100, a $393.53 maximum, no employer contribution and a $1,119 weekly maximum
- [New Jersey: Temporary Disability Insurance](https://www.nj.gov/labor/myleavebenefits/labor/myleavebenefits/worker/tdi/), 0.19% on the first $171,100, a $325.09 maximum and private plans
- [Washington Paid Leave: Updates](https://paidleave.wa.gov/updates/), 1.13% for 2026, 1.2% for 2027 with a 29.3%/70.7% split, the small employer rule, the Social Security cap, late fees and job protection changes
- [Paid Leave Oregon: Employers](https://paidleave.oregon.gov/employers/), 1% up to $184,500, the 40/60 split at 25 or more employees, equivalent plans, benefit weeks and 90-day job protection
- [CT Paid Leave: Contributions](https://www.ctpaidleave.org/how-ct-paid-leave-works/contributions), 0.5% to the Social Security limit and 0.5% for 2027
- [CT Paid Leave: Home](https://ctpaidleave.org/s/employers), program statistics as of September 30, 2026
- [Delaware Department of Labor: Delaware Paid Leave](https://labor.delaware.gov/delaware-paid-leave/), the contribution, size tiers, benefits, leave limits and key dates
- [IRS: Revenue Ruling 2025-4 (PDF)](https://www.irs.gov/pub/irs-drop/rr-25-04.pdf), federal treatment of state PFML contributions, pick-ups and benefits, third-party sick pay and the 2025 transition period
- [IRS: Notice 2026-6 (PDF)](https://www.irs.gov/pub/irs-drop/n-26-06.pdf), the transition period for employer-funded medical leave benefits extended through calendar year 2026

**In practice**

- [Epstein Becker Green: 2026 Family and Medical Leave Law Updates (October 30, 2025)](https://www.ebglaw.com/insights/publications/2026-family-and-medical-leave-law-updates-what-employers-in-seven-states-need-to-know), Colorado's 0.88% rate, Maryland's delayed dates, Minnesota's and Maine's launches
