+++
title = "HSAs, FSAs & HRAs"
description = "2026 HSA, FSA and HRA limits, HDHP rules and the 2025 law, payroll contributions and seed money, carryover and grace, dependent care, QSEHRA and ICHRA."
category = "Workforce Industry"
order = 2650
part = "Benefits Administration"
tags = ["benefits", "hsa", "fsa", "hra", "ichra", "qsehra"]
+++

Three account-based benefits look alike on a pay statement and behave differently everywhere else. A **health savings account** (HSA) is the employee's own account at a custodian, funded by the employee and employer, portable when the job ends, and allowed only for someone covered by a high deductible health plan and nothing disqualifying. A **health flexible spending arrangement** (FSA) is the employer's plan, funded by salary reduction, with the whole year's election available on the first day and forfeited if unspent, apart from a carryover or a grace period. A **health reimbursement arrangement** (HRA) is funded by the employer alone, with no salary reduction at all, and comes in variants that integrate with group coverage, reimburse individual market premiums (the ICHRA), or serve small employers with no group plan (the QSEHRA). Dependent care FSAs are a fourth thing with a confusingly similar name.

For payroll, they share a shape: a pre-tax deduction or employer memo line with an annual limit on a period basis that may not be the calendar year, a payee that isn't the employer, and rules that decide who may contribute in which months. For benefits administration, they differ in eligibility, notices and what happens at termination. This chapter covers the 2026 limits, HSA eligibility and the high deductible plan rules with the 2025 law's changes, payroll contributions and employer seed money with comparability, the HSA month-by-month limit worked, FSA uniform coverage, carryover and grace periods, dependent care, HRAs, QSEHRA and ICHRA mechanics and notices, and mid-year changes. The tax treatment of these deductions line by line is in [HSAs and FSAs Through Payroll](/books/workforce/deductions#hsas-and-fsas-through-payroll).

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform | What it shows | Notes |
| --- | --- | --- |
| **Check** | Benefit types `hsa`, `fsa_medical` and `fsa_dependent_care`, all pre-tax; an HSA carries an `hsa_contribution_limit` of `single` or `family` "depending on the health plan"; catch-up applied automatically for HSAs at the qualifying age | The limit tier follows the medical enrollment |
| **WEX** | HSAs, FSAs, HRAs, lifestyle spending accounts and commuter benefits as benefit accounts, ICHRAs among the account types it administers, a single "benefits card," and benefits administration that synchronizes enrollment, payroll and benefits data | Custodian and administrator; contributions arrive from the employer's payroll |

The pattern: **payroll computes and remits the contribution; a custodian (HSA) or administrator (FSA, HRA) holds the account, pays claims and substantiates them,** typically through a debit card whose swipes the administrator matches to eligible expenses or asks receipts for. Payroll never sees a claim, but it does have to know the account's limit tier and period, which come from the benefits record.

## The 2026 Limits

| Item | 2026 | Source |
| --- | --- | --- |
| HSA contribution, self-only | $4,400 | Rev. Proc. 2025-19 |
| HSA contribution, family | $8,750 | Rev. Proc. 2025-19 |
| HSA catch-up, age 55 or older | $1,000 (statutory, not indexed) | 26 USC 223(b)(3) |
| HDHP minimum deductible | $1,700 self-only, $3,400 family | Rev. Proc. 2025-19 |
| HDHP out-of-pocket maximum | $8,500 self-only, $17,000 family | Rev. Proc. 2025-19 |
| Health FSA salary reduction | $3,400 | Rev. Proc. 2025-32 |
| Health FSA maximum carryover | $680 | Rev. Proc. 2025-32 |
| Dependent care assistance | $7,500 ($3,750 married filing separately), up from $5,000 | Pub 15-B (2026) |
| QSEHRA maximum | $6,450 self-only, $13,100 family | Rev. Proc. 2025-32 |
| Excepted benefit HRA, newly available | $2,200 for plan years beginning in 2026 | Rev. Proc. 2025-19 |

The period basis differs and is the source of most engine bugs: HSA limits are per calendar year (the person's tax year), health FSA limits per plan year (which may start July 1), dependent care per calendar year, QSEHRA per year of the arrangement. Each goes into `deduction_limits` with its own `period_basis` ([Pre-Tax & Post-Tax Deductions](/books/workforce/deductions#how-to-build-it)).

## HSA Eligibility and the HDHP

An **eligible individual** must be covered by an HDHP on the first day of the month, have no other disqualifying health coverage, not be enrolled in Medicare, and not be claimable as someone else's dependent (Pub 969). Each condition is a fact payroll doesn't own:

- **The HDHP** is the medical enrollment's plan, with the year's deductible and out-of-pocket thresholds. A plan that fails them for 2026 makes everyone on it ineligible, whatever their election says.
- **Other coverage** includes a spouse's general-purpose health FSA, which is why limited-purpose (dental and vision) FSAs exist alongside HDHPs; Pub 969 notes that coverage during a grace period by a general purpose health FSA is allowed only if the prior-year balance is zero. Disregarded coverage, which doesn't disqualify, includes dental, vision, disability, long-term care and, permanently after the 2025 law, telehealth and other remote care (26 USC 223(c)(1)(B)).
- **Medicare.** The limit "is zero starting with the first month" of Medicare entitlement (223(b)(7)). An employee past 65 who enrolls in Part A, sometimes automatically when claiming Social Security, has to stop contributions from that month; the engine needs the Medicare date from the employee.

**The 2025 law.** P.L. 119-21 amended section 223 in three ways the IRS summarized in Notice 2026-05 (IR-2025-119, December 9, 2025): from January 1, 2026, bronze and catastrophic plans "available through an Exchange are considered HSA-compatible," and "do not have to be purchased through an Exchange" to qualify; from January 1, 2026, people in certain direct primary care arrangements may contribute to an HSA and pay the periodic fees from it, with the statute's limit of $150 a month for one individual and $300 for more (indexed after 2026); and the telehealth safe harbor became permanent for plan years beginning on or after January 1, 2025.

## Payroll Contributions, Seed Money and Comparability

Employee HSA contributions through a cafeteria plan are excluded from income tax, Social Security, Medicare and FUTA; outside a cafeteria plan they are wages, and the employee deducts them on their return ([HSAs and FSAs Through Payroll](/books/workforce/deductions#hsas-and-fsas-through-payroll) has the Pub 15 language). Employer contributions, including cafeteria plan salary reductions, go in W-2 box 12 with code W, and the annual limit covers employee and employer money together.

Employers that contribute outside a cafeteria plan must make **comparable contributions**: each month, the same dollar amount or the same percentage of the deductible for every comparable participating employee "with the same category of coverage," testing self-only and family separately and full-time and part-time separately, with family tiers allowed to differ only upward (26 CFR 54.4980G-4). A match is generally not comparable. But "The comparability rules do not apply to HSA contributions that an employer makes through a section 125 cafeteria plan," including matching contributions, which are tested under the cafeteria plan nondiscrimination rules instead (54.4980G-5). That is why seed money and matches usually run through the cafeteria plan, and why the engine records which route each employer contribution took.

A worked example of my own: an employer seeds $1,000.00 in January for family HDHP enrollees and lets employees contribute the rest. An employee under 55 with family coverage all year can contribute $8,750.00 − $1,000.00 = $7,750.00; at 24 semimonthly periods that is $322.92 a period (the last period absorbing the rounding to land exactly on $7,750.00). If the employee had elected $8,750.00 without the engine knowing about the seed, the year ends $1,000.00 over the limit, an excess contribution the employee must withdraw or pay excise tax on.

## The HSA Limit Month by Month

The HSA limit is monthly: one-twelfth of the annual amount for each month the person is eligible on the first day, with the **last-month rule** as an exception. Someone eligible on December 1 "is treated as eligible all year," but if they then lose eligibility during the **testing period** (through the end of the following year), the excess over the monthly amount "is included in income and subject to a 10% additional tax," unless the loss is from death or disability (26 USC 223(b)(8); Pub 969).

A worked example of my own: an employee who turns 56 in 2026 is hired and enrolls in family HDHP coverage effective July 1.

| Approach | Computation | 2026 limit |
| --- | --- | --- |
| Monthly (6 eligible months) | ($8,750.00 + $1,000.00) × 6 ÷ 12 | $4,875.00 |
| Last-month rule (eligible December 1) | $8,750.00 + $1,000.00 | $9,750.00 |
| Last-month rule, then switches to a non-HDHP plan in March 2027 | $9,750.00 − $4,875.00 = $4,875.00 included in 2027 income | Plus $487.50 additional tax |

Payroll's part is to enforce the annual figure the employee chose and the plan allows. Many employers cap payroll at the prorated monthly amount for a mid-year enrollee and let the employee contribute more directly to the custodian if they intend to rely on the last-month rule, because payroll can't know whether the employee will stay eligible through the testing period. The deadline for the employee's own contributions for a year is April 15 of the next year (Pub 969), after the W-2 is filed, which is why the custodian, not the W-2, has the final contribution figure.

## Health FSAs: Uniform Coverage, Carryover and Grace

A health FSA election is an annual promise. Under **uniform coverage**, the maximum elected "is available at any time during the coverage period, regardless of amounts already contributed" (Pub 969). The employer carries the risk of an employee who spends early and leaves: a worked example of my own, an employee elects $3,400.00 for the 2026 plan year, contributes $141.67 a semimonthly period ($3,400.00 ÷ 24, with the last period absorbing the rounding), incurs a $2,500.00 claim in February, and is reimbursed $2,500.00; if they leave at the end of February, after four contributions totaling $566.68, the plan has paid $1,933.32 more than it collected. In the other direction, money unspent at the end of the plan year is forfeited, except for one of two features (a plan may have one, not both: "A plan adopting a carryover provision is not permitted to also provide a grace period with respect to health FSAs"):

- **Carryover** of unused amounts up to $680 into the 2027 plan year (Rev. Proc. 2025-32 for 2026 plan years), or a lower plan limit; the rest is forfeited.
- **Grace period** of "up to 2 1/2 months after the end of the plan year" during which new expenses can be paid from the old year's balance.

Separately, most plans allow a **run-out period** after year end to submit claims for expenses already incurred; it is a claims deadline, not more time to spend. For payroll, the FSA limit is the plan year's salary reduction, not the reimbursements: a carryover doesn't raise the next year's $3,400 limit on new contributions, and a plan year that isn't the calendar year needs its accumulator keyed on the plan year.

**Dependent care FSAs** are a different benefit under section 129: an exclusion of up to $7,500 for 2026 ($3,750 married filing separately), raised from $5,000, on the calendar year, reported in W-2 box 10 ([The W-2, Box by Box](/books/workforce/year-end-and-w2s#the-w-2-box-by-box)). Whether reimbursements can run ahead of contributions, as uniform coverage requires for health FSAs, is a plan term to model, not an assumption to carry over.

## HRAs

An HRA is funded only by the employer, and employees may not contribute to it (Pub 969). Unused amounts carry forward if the plan says so: "Some, but not all, HRAs permit amounts that remain at the end of the year to be carried to the next year." Payroll touches an HRA lightly, because there is no deduction: the allowance is a benefit plan record, reimbursements are paid by the administrator and are tax-free when the HRA follows its rules, and the employer funds the administrator's claims, not a per-period contribution. The variants that matter for administration:

- **Integrated HRAs** sit beside the employer's group health plan and reimburse its deductibles and copays.
- **Excepted benefit HRAs** may make up to $2,200 newly available for plan years beginning in 2026 (Rev. Proc. 2025-19), alongside a group plan the employee may decline.
- **QSEHRAs** and **ICHRAs** reimburse individual market coverage, below.

## QSEHRA

A qualified small employer HRA is for employers that are not applicable large employers and offer no group health plan "to any employees" (26 USC 9831(d)). It must be provided on the same terms to all eligible employees (varying only by age or family size under the same policy), funded by the employer alone, paid only after proof of coverage, and limited for 2026 to $6,450 a year, or $13,100 with family members, prorated for partial years. The employer must give written notice "at least 90 days before the year begins," or by the date an employee first becomes eligible, stating the benefit amount, advising the employee to give it to any exchange where they seek premium assistance, and explaining the tax consequences of not having minimum essential coverage. The employer reports the amount the employee is entitled to in W-2 box 12 with code FF, "without regard to the amount of payments or reimbursements actually received": Pub 15-B's example reports $3,000 for an employee reimbursed $2,000.

A worked example of my own: a 12-employee company offers a QSEHRA of $500.00 a month for family coverage ($6,000.00 a year, under $13,100) for calendar 2027. Its notice goes out by October 3, 2026 (90 days before January 1, 2027). An employee hired April 1, 2027 is entitled to 9 × $500.00 = $4,500.00, which is the W-2 code FF amount whether they claim all of it or not, and gets the notice by the date they become eligible.

## ICHRA

An individual coverage HRA, under rules in effect for plan years beginning on or after January 1, 2020 (26 CFR 54.9802-4), reimburses individual health insurance or Medicare premiums and expenses for employees who are enrolled in that coverage every month they are covered by the HRA. The conditions an employer's system enforces:

- **No choice.** An employer can't offer both an ICHRA and a traditional group health plan to the same class of employees.
- **Classes,** set before each plan year: full-time, part-time, salaried, hourly, seasonal, collectively bargained, employees in a waiting period, employees in a rating area, nonresident aliens, and others the rule lists.
- **Minimum class size** when some employees get a group plan and others an ICHRA: at least 10 for an employer with fewer than 100 employees, 10% of employees (rounded down) for 100 to 200, and 20 for more than 200; a new hire subclass is exempt from the minimum.
- **Same terms within a class,** with variation allowed for family size and age, where the oldest may get no more than three times the youngest.
- **Opt-out** once a plan year, so an employee can claim a premium tax credit instead if the ICHRA is unaffordable.
- **Substantiation** of individual coverage at enrollment and with each reimbursement request.
- **Notice** "at least 90 days before" each plan year, or by the date a new participant first becomes eligible.

A worked example of my own: an employer with 150 employees offers its group plan to salaried staff and an ICHRA to hourly staff in one state. The hourly class must have at least 15 employees (10% of 150), and if the allowance is $400.00 a month for the youngest employees, the oldest can receive at most $1,200.00.

For an applicable large employer, the ICHRA is the employer's offer of coverage for the mandate. Affordability compares the employee's cost of the lowest-cost silver plan, after the HRA, with the 9.96% required contribution percentage for 2026, and the 1095-C reports the offer with codes `1L` to `1U`: an affordable offer by who is covered and whether affordability used the employee's residence ZIP code or the primary employment site ZIP code, `1R` for one that is not affordable and `1S` for an offer to someone who wasn't full-time ([Forms 1094-C and 1095-C](/books/workforce/aca-employer-mandate#forms-1094-c-and-1095-c)). I didn't open the regulation text for the ICHRA affordability safe harbors themselves. <!-- source-gap: wf-ichra-affordability-safe-harbors | missing | the ICHRA affordability computation and its location and calendar year safe harbors under 26 CFR 54.4980H-5(e)(4) and 1.36B-2 | closes with: the regulation text on Cornell LII or the eCFR, or an IRS ICHRA page, opened | checked: 2026-11-10 -->

## Mid-Year Changes

Health FSA elections follow the cafeteria plan's change rules, with one exclusion: significant cost or coverage changes "do not apply to health FSA elections" (26 CFR 1.125-4(f)), so a health FSA election can change mid-year only on a change in status or other permitted event, prospectively ([The Three Windows](/books/workforce/enrollment-and-life-events#the-three-windows)). HSA salary reductions are different in practice: plans commonly let employees change them prospectively during the year, because the HSA is the employee's account and the eligibility test is monthly; I couldn't open the regulation that permits it. <!-- source-gap: wf-hsa-election-changes | missing | cafeteria plans may permit prospective HSA salary reduction election changes at least monthly (Prop. Treas. Reg. 1.125-2) | closes with: the proposed regulation text or an IRS publication stating the rule, opened | checked: 2026-11-10 --> Dependent care elections change with a change in status and the other events the plan permits. A termination ends contributions and, for the health FSA, ends eligibility for new expenses (with COBRA for the health FSA, by the administrator), while the HSA stays with the employee.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `benefit_plans` already has `hsa`, `fsa` and `dependent_care` kinds, `deduction_elections` carries the per-period amount, and `deduction_limits` holds the 2026 figures; this chapter adds the account plan's rules, the annual election, and HRA allowances.

```sql
CREATE TABLE spending_account_plans (      -- the rules of an HSA program, FSA or dependent care plan
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL UNIQUE REFERENCES benefit_plans (id),
  account_type        TEXT NOT NULL CHECK (account_type IN ('hsa', 'health_fsa',
                        'limited_purpose_fsa', 'dependent_care_fsa')),
  administrator       TEXT NOT NULL,         -- custodian or TPA
  plan_year           DATERANGE NOT NULL,
  limit_basis         TEXT NOT NULL CHECK (limit_basis IN ('calendar_year', 'plan_year')),
  carryover_max       BIGINT,                -- cents; 68000 for 2026, null for none
  grace_period_ends   DATE,                  -- up to 2.5 months after year end; never with carryover
  runout_ends         DATE,
  through_cafeteria_plan BOOLEAN NOT NULL,   -- employer HSA money: 125 rules or comparability
  employer_seed       JSONB,                 -- {"self_only": 50000, "family": 100000, "timing": "january"}
  requires_hdhp_plan_ids UUID[],             -- HSAs: the medical plans that make an employee eligible
  CHECK (carryover_max IS NULL OR grace_period_ends IS NULL)
);

CREATE TABLE spending_account_elections (  -- the annual choice behind the per-period deduction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  spending_account_plan_id UUID NOT NULL REFERENCES spending_account_plans (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  annual_election     BIGINT NOT NULL,       -- cents, the employee's choice for the year
  coverage_tier       TEXT CHECK (coverage_tier IN ('self_only', 'family')),   -- HSA limit tier
  catch_up            BOOLEAN NOT NULL DEFAULT FALSE,   -- HSA, age 55 by year end
  eligible_months     DATE[],                -- HSA: firsts of months eligible, from enrollment
  last_month_rule     BOOLEAN NOT NULL DEFAULT FALSE,
  medicare_entitled_on DATE,                 -- the HSA limit is zero from this month
  life_event_id       UUID REFERENCES life_events (id),   -- for a mid-year change
  deduction_election_id UUID REFERENCES deduction_elections (id),   -- per-period amount
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (worker_id WITH =, spending_account_plan_id WITH =, valid_during WITH &&)
);

CREATE TABLE hra_allowances (              -- an employer's HRA offer to a class, and its terms
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  hra_type            TEXT NOT NULL CHECK (hra_type IN ('integrated', 'excepted_benefit', 'qsehra',
                        'ichra')),
  employee_class      TEXT NOT NULL,         -- 'all', 'hourly', 'salaried', 'rating_area:...', ...
  class_size_at_start INT,                   -- ICHRA minimum class size check
  monthly_amounts     JSONB NOT NULL,        -- by tier and age band; oldest <= 3x youngest for ICHRA
  annual_cap          BIGINT,                -- QSEHRA: 645000 / 1310000 for 2026
  carryover           BOOLEAN NOT NULL DEFAULT FALSE,
  notice_due_on       DATE NOT NULL,         -- 90 days before the plan year
  notice_document_id  UUID REFERENCES documents (id),
  w2_code             TEXT,                  -- 'FF' for a QSEHRA
  valid_during        DATERANGE NOT NULL     -- the plan year
);
```

The HSA limit for a worker is a function of eligible months, tier, age and the employer's own contributions:

```sql
SELECT e.worker_id,
       CASE WHEN e.last_month_rule
            THEN dl_tier.amount + CASE WHEN e.catch_up THEN 100000 ELSE 0 END
            ELSE (dl_tier.amount + CASE WHEN e.catch_up THEN 100000 ELSE 0 END)
                 * cardinality(e.eligible_months) / 12
       END                                         AS annual_limit,
       COALESCE(SUM(a.amount), 0)                  AS contributed_ytd   -- employee and employer
FROM spending_account_elections e
JOIN spending_account_plans p ON p.id = e.spending_account_plan_id AND p.account_type = 'hsa'
JOIN deduction_limits dl_tier
  ON dl_tier.limit_kind = CASE e.coverage_tier WHEN 'family' THEN 'hsa_family' ELSE 'hsa_self' END
 AND dl_tier.valid_during @> $check_date::DATE
LEFT JOIN accumulators a
  ON a.worker_id = e.worker_id
 AND a.tax_year = EXTRACT(YEAR FROM $check_date::DATE)
 AND split_part(a.key, ':', 1) IN ('hsa_employee', 'hsa_employer')
WHERE e.worker_id = $worker_id AND e.valid_during @> $check_date::DATE
GROUP BY e.worker_id, e.last_month_rule, e.catch_up, dl_tier.amount, e.eligible_months;
```

Design notes:

- **Eligibility comes from the medical enrollment,** month by month: an HSA election whose worker isn't on a listed HDHP on the first of a month gets no contribution that month, and the custodian is told.
- **One limit, two payers.** The HSA limit check sums employee deductions and employer memo lines (seed, match), and the employer's route (cafeteria plan or not) is recorded because it decides comparability.
- **Plan year accumulators for FSAs,** calendar year for HSAs and dependent care; the key carries the period, and a July plan year never resets in January ([Gross-to-Net, How to Build It](/books/workforce/gross-to-net#how-to-build-it)).
- **Carryover or grace, never both,** enforced by a constraint, and carryover amounts held by the administrator, not added to the new year's salary reduction limit.
- **Notices are rows with due dates,** 90 days before the plan year for QSEHRAs and ICHRAs, generated and kept as sent ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Classes are effective-dated and checked,** with the minimum class size computed from the employer's headcount at the start of the plan year, and the ICHRA offer written to the ACA monthly results for the 1095-C.
- **Contribution files equal remittances.** Each pay run's HSA and FSA contributions are liabilities to the custodian or administrator with a remittance and a file per account holder, the same shape as the recordkeeper file in 401(k) Deferrals & Remittance.

## Auditing

Account-based benefits are audited by the IRS (HSA excess contributions, cafeteria plan qualification, W-2 codes W, FF and box 10), the DOL for ERISA-covered FSAs and HRAs, and the administrators' own reconciliations:

- **Every election** with its tier, eligible months, catch-up, last-month rule, Medicare date and the life event behind a change.
- **Every contribution** by payer and route, and every limit check with the amounts it read.
- **Plan documents** with carryover or grace terms, plan years and HRA terms by class, as versions.
- **Notices** (QSEHRA and ICHRA, 90 days) as sent, with dates.
- **Remittances and files to custodians and administrators,** tied to the pay runs. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Keep 2026 figures as data with their period basis:** HSA $4,400 and $8,750 plus $1,000 at 55, health FSA $3,400 with $680 carryover, dependent care $7,500, QSEHRA $6,450 and $13,100, excepted benefit HRA $2,200.
- **Derive HSA eligibility monthly** from the HDHP enrollment, other coverage and the Medicare date, and stop contributions the month eligibility ends.
- **Count employer money in the HSA limit,** and record whether it ran through the cafeteria plan, which decides comparability.
- **Prorate mid-year HSA limits by month,** and treat the last-month rule as an election with a testing period.
- **Model FSA uniform coverage, carryover or grace, and run-out** as plan rules, with plan-year accumulators.
- **Keep dependent care separate,** calendar-year and without uniform coverage.
- **Enforce QSEHRA and ICHRA rules as data:** eligibility, classes, minimum class sizes, the 3:1 age ratio, opt-out, substantiation and 90-day notices.
- **Feed ICHRA offers into the ACA record,** so the 1095-C codes come from the same rows.

## References

**Law and regulation**

- [26 USC 223](https://www.law.cornell.edu/uscode/text/26/223), HSAs: the age 55 catch-up, Medicare, the last-month rule and testing period, disregarded coverage including telehealth, bronze and catastrophic plans, direct primary care
- [26 USC 4980G](https://www.law.cornell.edu/uscode/text/26/4980G), the comparability requirement for employer HSA contributions
- [26 CFR 54.4980G-4](https://www.law.cornell.edu/cfr/text/26/54.4980G-4), comparable contributions by category of coverage, testing groups and matching contributions
- [26 CFR 54.4980G-5](https://www.law.cornell.edu/cfr/text/26/54.4980G-5), comparability doesn't apply to contributions through a cafeteria plan
- [26 USC 9831](https://www.law.cornell.edu/uscode/text/26/9831), QSEHRAs: eligible employers, same terms, employer funding, limits and the 90-day notice
- [26 CFR 54.9802-4](https://www.law.cornell.edu/cfr/text/26/54.9802-4), ICHRAs: integration conditions, classes, minimum class sizes, the new hire subclass, same terms, opt-out, substantiation and notice
- [26 CFR 1.125-4](https://www.law.cornell.edu/cfr/text/26/1.125-4), permitted election changes, and cost or coverage changes excluded for health FSAs

**Agency guidance and forms**

- [IRS: Rev. Proc. 2025-19 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-19.pdf), 2026 HSA limits, HDHP thresholds and the excepted benefit HRA amount
- [IRS: Rev. Proc. 2025-32 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf), the 2026 health FSA limit and carryover, and the QSEHRA limits
- [IRS: Publication 969 (2025), Health Savings Accounts and Other Tax-Favored Health Plans](https://www.irs.gov/publications/p969), HSA eligibility, the last-month rule, comparability, the contribution deadline, FSA uniform coverage, grace periods and carryover, HRAs
- [IRS: Publication 15-B (2026)](https://www.irs.gov/publications/p15b), the dependent care increase to $7,500, the health FSA limit, and QSEHRA reporting with code FF
- [IRS: Treasury, IRS provide guidance on new tax benefits for health savings account participants (IR-2025-119)](https://www.irs.gov/newsroom/treasury-irs-provide-guidance-on-new-tax-benefits-for-health-savings-account-participants-under-the-one-big-beautiful-bill), Notice 2026-05 on bronze and catastrophic plans, direct primary care and telehealth

**Vendor documentation**

- [Check: Types of benefits](https://docs.checkhq.com/reference/types-of-benefits.md), HSA and FSA benefit types, HSA limit tiers and automatic catch-up
- [WEX: Employee benefits](https://www.wexinc.com/products/employee-benefits/), benefit accounts, the benefits card, ICHRA administration and benefits administration integration
