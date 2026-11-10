+++
title = "Pre-Tax & Post-Tax Deductions"
nav_title = "Deductions"
description = "Payroll deductions: Section 125, 401(k) and Roth with 2026 limits, HSA, FSA and commuter benefits, state quirks, after-tax items, ordering, arrears, memos."
category = "Workforce Industry"
order = 2609
part = "Gross to Net"
tags = ["payroll", "deductions", "section-125", "401k", "hsa", "state-tax"]
+++

A deduction is money taken from a worker's pay for someone else: a carrier, a plan, a custodian, a union, a charity, the employer itself. "Pre-tax" and "post-tax" are shorthand that hides the real question, which is: pre-tax for which tax? A traditional 401(k) deferral is excluded from federal income tax wages and included in Social Security and Medicare wages. A Section 125 medical premium is excluded from both. An HSA contribution is excluded from both when it runs through a cafeteria plan and from neither when it doesn't. Pennsylvania taxes the 401(k) deferral; New Jersey doesn't, but taxes a 403(b) deferral. Every deduction is a set of answers, one per tax and jurisdiction, plus a limit, an order and a rule for what happens when the paycheck is too small to take it.

This chapter covers the deductions payroll takes most often, from the calculation side: Section 125 cafeteria plans, 401(k) and Roth deferrals with 2026 limit enforcement worked mid-year, HSAs and FSAs, qualified transportation, the state departures, after-tax deductions (union dues, loans and advances), deduction ordering, arrears and catch-up, and employer contributions as memo lines. Plan design and remittance are in the Benefits Administration part (Enrollment & Life Events, 401(k) Deferrals & Remittance, HSAs, FSAs & HRAs), and 401(k) recordkeeping is in Investing & Digital Assets ([401(k) Recordkeeping in Brief](/books/investing-and-digital-assets/retirement-accounts#401-k-recordkeeping-in-brief)). Garnishments are deductions too, with their own limits and order, and are in Child Support Withholding and Garnishments & Levies in the Moving the Money part; where every deduction lands in the calculation is in [Gross-to-Net, Step by Step](/books/workforce/gross-to-net).

## How the Platforms Do It

As of November 2026, from developer documentation:

| Platform | How deductions are typed | Limits and order | Notes |
| --- | --- | --- | --- |
| **Check** | Benefits (pre-tax or post-tax, tied to a benefit type) are separate from post-tax deductions: "Deductions are always post-tax"; garnishments are post-tax deductions with an `agency`, case `external_id`, `amount` or `percent`, `total_amount`, `annual_limit` and `priority` | Child support before miscellaneous garnishments; equal priority oldest first | A deduction that would make net pay negative is skipped with a warning |
| **Gusto Embedded** | Benefits with effective dating per employee; garnishments with `garnishment_type` (`child_support`, `federal_tax_lien`, `state_tax_lien`, `student_loan`, `creditor_garnishment`, `federal_loan`, `other_garnishment`) | `pay_period_maximum`, `annual_maximum`, `times`, `recurring`; child support percentages can't exceed 65 | Off-cycle payrolls can set `skip_regular_deductions` to "Block regular deductions and contributions for this payroll" |
| **Zeal** | Pre-tax: Section 125, HSA, Traditional 401(k), SIMPLE IRA, 403(b), Employer Sponsored Health Coverage, Dependent Care; post-tax: Roth 401(k), Roth IRA, Garnishment, Miscellaneous | Not stated in its deduction types page | Zeal's employer debit doesn't include deductions other than garnishments |

The pattern: **a deduction's tax treatment comes from its type, not from a "pre-tax" checkbox,** and limits are attributes of the election (a period maximum, an annual maximum, a goal) that the engine enforces against accumulators. Who remits differs by vendor, which is why every deduction line needs a payee and a liability even when the provider isn't the one paying it.

## Section 125 Cafeteria Plans

A cafeteria plan lets employees choose between cash and qualified benefits, and the benefits chosen are paid with pre-tax salary reductions. The Pub 15 (2026) treatment table says: "If employee chooses cash or other taxable benefit, subject to all employment taxes. If employee chooses a nontaxable benefit, the treatment is the same as if the benefit was provided outside the plan." For the benefits most plans offer, that means exempt from income tax withholding, Social Security, Medicare and FUTA: accident and health benefits (medical, dental, vision premiums), dependent care assistance up to $7,500 ($3,750 married filing separately) for 2026, HSA contributions, and health FSA contributions up to $3,400 for plan years beginning in 2026.

What a payroll engine has to get right:

- **The plan document governs.** A premium is pre-tax only if the employer has a written cafeteria plan that covers it; a deduction coded "Section 125" without a plan behind it is a taxable deduction with the wrong taxability. The deduction code should point at the `benefit_plans` row, and the plan at its document.
- **Elections are annual and sticky.** Treas. Reg. 1.125-4 lets (doesn't require) a plan allow mid-year changes for a change in status, HIPAA special enrollment, a court order, Medicare or Medicaid entitlement, significant cost or coverage changes and FMLA leave; outside those, the election stands for the plan year. Enrollment & Life Events in the Benefits Administration part owns the rules; payroll's job is to apply the new amount from the effective date the event produces, including retroactively for a birth.
- **Cash is wages.** An opt-out payment or flex dollars taken as cash are taxable wages in every column.

## 401(k) and Roth Deferrals

A traditional 401(k) deferral is excluded from income tax withholding and box 1 but taxed for Social Security, Medicare and FUTA ("Generally exempt, but see section 402(g) for limitation" for income tax; "Taxable" for the other two, per Pub 15's table). A designated Roth deferral is taxed in every column, reported "in boxes 1, 3, and 5" with its own box 12 code (AA for a 401(k)). A 403(b) salary reduction follows the same federal pattern; a SIMPLE salary reduction is income tax exempt and FICA taxable.

The deferral is usually a percentage of plan compensation, and plan compensation is a plan definition: some plans include bonuses and some don't, some exclude imputed income, and none include amounts already over the 401(a)(17) compensation limit, which is $360,000 for 2026. The engine needs the plan's definition as a list of pay item types (the same structure as a tax base), not a hard-coded "gross."

The 2026 limits the payroll engine enforces, from IR-2025-111 and Notice 2025-67:

| Limit | 2026 | What payroll does |
| --- | --- | --- |
| Elective deferral, 402(g) | $24,500 | Stops traditional and Roth deferrals combined at the limit for the plan |
| Catch-up, age 50 or older | $8,000 | Continues deferrals past $24,500 for employees who are 50 by year end, up to $32,500 |
| Catch-up, age 60 to 63 | $11,250 | Replaces the $8,000 for employees who turn 60, 61, 62 or 63 in the year |
| Roth catch-up wage threshold, 414(v)(7) | $150,000 of 2025 FICA wages | Forces catch-up contributions to Roth for employees whose prior-year Social Security wages from the employer exceeded it |
| Annual additions, 415(c) | $72,000 | Caps employee plus employer contributions; usually enforced by the recordkeeper with payroll stopping the match |
| Compensation limit, 401(a)(17) | $360,000 | Caps the pay a percentage deferral or match is computed on |
| SIMPLE deferral | $17,000 (catch-up $4,000) | The same mechanics for a SIMPLE plan |

The 402(g) limit is the individual's, across every plan they defer to; an employer's payroll can enforce it only for its own plans, and an employee with two jobs who over-defers fixes it with the plan, not the payroll.

**A worked example of my own: the limit mid-year.** An employee who is 52 at the end of 2026 earns $12,000.00 semimonthly ($288,000 a year, under the $360,000 compensation limit) and defers 10%, $1,200.00 a period. Their 2025 Social Security wages from this employer were $280,000, over $150,000, so any catch-up must be Roth.

| Periods | Traditional deferral | Roth catch-up | Year to date |
| --- | --- | --- | --- |
| 1 to 20 | $1,200.00 each | | $24,000.00 traditional |
| 21 | $500.00 | $700.00 | $24,500.00 traditional, $700.00 catch-up |
| 22 to 24 | | $1,200.00 each | $4,300.00 catch-up |

Period 21 splits: the first $500.00 reaches the 402(g) limit and the remaining $700.00 of the 10% election spills into catch-up, which the Roth rule makes a Roth deferral, so it is income tax wages that period. The year ends with $28,800.00 deferred, under the $32,500.00 ceiling for a 52-year-old. If the employee were 61, the catch-up ceiling would be $11,250. If the plan didn't allow spillover, deferrals would stop in period 21 and the employee would need a separate catch-up election. Two things make this hard in an engine: the Roth determination reads last year's FICA wages from the same employer (an accumulator for a prior year, which a mid-year migration has to load), and the split within one period produces two lines with different taxability.

The match is a memo line computed by the plan's formula on plan compensation, and a plan that matches per period can under-match an employee who hits the limit early; the true-up is a plan feature computed after year end. 401(k) Deferrals & Remittance in the Benefits Administration part covers matches, true-ups and remittance timing.

## HSAs and FSAs Through Payroll

**HSAs.** For 2026, the HSA contribution limit is $4,400 for self-only and $8,750 for family coverage, and a high deductible health plan must have a deductible of at least $1,700 or $3,400 and out-of-pocket expenses no more than $8,500 or $17,000 (Rev. Proc. 2025-19). The tax treatment depends on the route: "Employee contributions to their HSAs or MSAs through a payroll deduction plan must be included in wages and are subject to social security, Medicare, and FUTA taxes, and federal income tax withholding. However, HSA contributions made under a salary reduction arrangement in a section 125 cafeteria plan aren't wages and aren't subject to employment taxes or withholding." Employer contributions, including employee salary reductions through the cafeteria plan, are reported in box 12 with code W. The annual limit covers employee and employer contributions together, so the engine's limit check includes the employer's memo lines and any seed contribution.

**Health FSAs.** The salary reduction limit is $3,400 for plan years beginning in 2026, and it applies per plan year, which may not be the calendar year; the limit's accumulator is keyed on the plan year from `benefit_plans.plan_year`.

**Dependent care.** Up to $7,500 ($3,750 married filing separately) is exempt for 2026, an annual limit on the calendar year that the engine enforces per employee.

## Qualified Transportation

For 2026, "the monthly exclusion for qualified parking is $340 and the monthly exclusion for commuter highway vehicle transportation and transit passes is $340." The limits are monthly, not annual: a $400 transit deduction in one month is $340 exempt and $60 taxable that month, and an unused $340 in March doesn't carry to April. The engine's limit is keyed on the calendar month of the benefit, which a biweekly payroll has to map from periods (two or three checks a month) to months. New Jersey excludes commuter transportation benefits "up to a certain limit"; Pennsylvania lists employer-provided parking among its nontaxable fringes.

## State Departures

The federal columns are the default; these states differ in the rows that matter most:

| Item | Federal income tax | Pennsylvania | New Jersey |
| --- | --- | --- | --- |
| Traditional 401(k) deferral | Exempt | Taxable: "Employee contributions to an eligible Pennsylvania retirement plan" are always compensation | Exempt: "401(k) contributions up to the federal limit" |
| 403(b) or 457 deferral | Exempt | Taxable | Taxable: "Employee contributions to retirement plans other than a 401(k) in the year they are made" |
| Section 125 health premiums | Exempt | Exempt "to the extent excluded for federal purposes" | Exempt only for plans that require a portion of benefit dollars to buy certain benefits; other cafeteria contributions are "Non-excludable" and reported in box 16 |
| Dependent care through Section 125 | Exempt up to $7,500 | Taxable: "not excludable from Pennsylvania-taxable compensation" | Section 129 dependent care benefits are included in box 16 |
| Group-term life cost over $50,000 | Exempt from withholding, taxable income | Employer-paid premiums never taxable | Not on NJ-WT's lists; check the state's guidance |

Two consequences. **State wages are their own base,** computed from the matrix's state rows, and box 16 of the W-2 differs from box 1 for the same employee. **Local taxes have their own columns too:** Pennsylvania's local earned income tax follows its own definition of compensation (State & Local Payroll Taxes in the Payroll Tax part covers it), so a deduction's treatment is per jurisdiction at every level, which is what `taxability_rules.jurisdiction_id` is for ([The Taxability Matrix](/books/workforce/gross-to-net#the-taxability-matrix)).

## After-Tax Deductions

After-tax deductions don't change any tax base, but each has its own law.

- **Roth deferrals and after-tax insurance** are ordinary post-tax lines; the insurance premium for a policy the employer doesn't sponsor under a cafeteria plan (supplemental life, accident, critical illness on an after-tax basis) is a payee and a deduction code.
- **Union dues.** Federal labor law allows an employer to deduct dues only with "a written assignment which shall not be irrevocable for a period of more than one year, or beyond the termination date of the applicable collective agreement, whichever occurs sooner" (29 USC 186(c)(4)). The authorization is a document with a revocation window, and the deduction election points at it. Payroll by Industry covers union shops' fringe remittances ([Seasonal and Union Shops](/books/workforce/payroll-by-industry#seasonal-and-union-shops)).
- **Loans and advances.** A pay advance or an employer loan repaid by deduction is a post-tax line with a goal amount. Federal wage law limits it: wages must be paid "finally and unconditionally or 'free and clear,'" and a deduction for the employer's benefit can't cut into required minimum wage or overtime pay in a workweek (29 CFR 531.35). States add consent, notice and amount rules, which are rules-as-data keyed by the worker's work state. A 401(k) plan loan repayment is a different thing: an after-tax deduction remitted to the plan, not the employer.
- **Charitable giving** and other voluntary deductions are post-tax lines with a payee.
- **Earned wage access recovery** is a deduction to the EWA provider set by its instructions to the payroll processor ([Payroll Integration](/books/banking-and-lending/earned-wage-access#payroll-integration) in Banking & Lending).

## Deduction Ordering

The order matters because each step changes the base for the next and because a short paycheck has to decide what not to take. A default order, consistent with the calculation order in [Gross-to-Net](/books/workforce/gross-to-net#the-calculation-order) and the vendor behavior above:

| Order | Group | Why here |
| --- | --- | --- |
| 1 | Section 125 premiums (medical, dental, vision), HSA and FSA through the plan, dependent care | They reduce every federal base, so they must come before any tax |
| 2 | Traditional retirement deferrals (401(k), 403(b), 457) | They reduce income tax wages only; computed on plan compensation |
| 3 | Qualified transportation | Reduces bases up to the monthly limit |
| 4 | Employee taxes | Computed on the bases steps 1 to 3 produced |
| 5 | Garnishments by legal priority | Limited by disposable earnings, which exist only after taxes |
| 6 | Roth deferrals, after-tax insurance, union dues, plan loan repayments | Post-tax; order among them by employer policy |
| 7 | Employer loans and advances, charitable giving, other voluntary | Lowest priority; most likely to be skipped on a short check |

Two refinements. Garnishments sit after taxes but before most voluntary post-tax deductions, because an order the employer could have honored and didn't is the employer's liability, while a missed charitable deduction is not. And ordering among pre-tax items matters only when cash runs out: a medical premium usually outranks a 401(k) deferral because the coverage continues whether or not the premium is collected.

## Arrears and Catch-Up

When a deduction can't be taken (unpaid leave, a short week, a large garnishment), the election's arrears rule decides what happens: nothing (most retirement deferrals, because a percentage of pay not paid is zero), catch up the next period, or spread the catch-up over several periods. A worked example of my own: an employee on unpaid leave for a biweekly period has $60.00 of gross pay and a $140.00 medical premium. The engine takes $60.00 of the premium (taxes on $0.00 of taxable wages are $0.00) and records $80.00 of arrears with `arrears_rule = 'next_period'`. On the next statement, the premium is $140.00 plus $80.00 of arrears, both pre-tax under the cafeteria plan for the year the coverage applied to, and the arrears balance goes to zero. If the leave runs longer, the plan's policy (and COBRA or FMLA rules for continued coverage, covered in the Leave and Benefits Administration parts) decides whether the employee pays by other means. Arrears crossing a calendar year raise a taxability question (a 2026 pre-tax premium collected from 2027 pay), which is a plan and tax counsel decision the engine records, not one it guesses.

## Employer Contributions as Memo Lines

Employer contributions appear on the statement but not in net pay: the 401(k) match, an HSA seed, the employer's share of premiums, an employer-paid life policy. They are `line_type = 'memo'` lines because they create liabilities (the plan, the custodian, the carrier), feed W-2 boxes (code W for HSA contributions; code DD for "Cost of employer-sponsored health coverage," which "is not taxable"; code TA from July 4, 2026 for Trump account contributions up to $2,500), enter limits (the HSA annual limit and 415(c) annual additions include them) and drive taxability where a contribution is taxable (an employer contribution to a non-qualified plan, or a benefit over its exclusion). A memo line with a payee and a liability is how the employer's invoice reconciliation, the W-2 and the plan's remittance all read from one row.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `deduction_codes` points at the plan; `deduction_elections` already carries the amount or percent, goal, annual limit and arrears rule; new tables hold ordering, statutory and plan limits as data, and loans as their own records.

```sql
ALTER TABLE deduction_codes
  ADD COLUMN benefit_plan_id    UUID REFERENCES benefit_plans (id),  -- the plan that makes it pre-tax
  ADD COLUMN authorization_kind TEXT CHECK (authorization_kind IN ('cafeteria_election',
                                  'plan_election', 'dues_assignment', 'written_consent',
                                  'court_order', 'none')),
  ADD COLUMN compensation_item_types TEXT[];    -- plan compensation: which pay item types count

ALTER TABLE deduction_elections
  ADD COLUMN roth_catch_up_required BOOLEAN NOT NULL DEFAULT FALSE,  -- from prior-year FICA wages
  ADD COLUMN spillover_to_code_id UUID REFERENCES deduction_codes (id), -- catch-up after 402(g)
  ADD COLUMN authorization_document_id UUID REFERENCES documents (id);

CREATE TABLE deduction_order_rules (           -- the order the engine takes deductions in
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID REFERENCES companies (id),      -- null: the volume default
  pay_item_type       TEXT NOT NULL REFERENCES pay_item_types (code),
  rank                SMALLINT NOT NULL,       -- lower first
  partial_allowed     BOOLEAN NOT NULL,        -- take what fits, or all or nothing
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST ((COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::UUID)) WITH =,
    pay_item_type WITH =, valid_during WITH &&)
);

CREATE TABLE deduction_limits (                -- statutory and plan limits, as data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  limit_kind          TEXT NOT NULL CHECK (limit_kind IN ('402g', 'catch_up_50', 'catch_up_60_63',
                        'roth_catch_up_threshold', '415c', '401a17', 'hsa_self', 'hsa_family',
                        'health_fsa', 'dependent_care', 'transit_monthly', 'parking_monthly',
                        'plan_specific')),
  benefit_plan_id     UUID REFERENCES benefit_plans (id),  -- for plan-specific limits
  amount              BIGINT NOT NULL,         -- cents: 2450000, 800000, 1125000, 15000000, ...
  period_basis        TEXT NOT NULL CHECK (period_basis IN ('calendar_year', 'plan_year',
                        'calendar_month')),
  applies_to_item_types TEXT[] NOT NULL,       -- which deduction and memo types count toward it
  source_ref          TEXT NOT NULL,           -- 'IR-2025-111', 'Notice 2025-67', 'Rev. Proc. 2025-19'
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE employee_loans (                  -- an employer loan or advance repaid by deduction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('advance', 'loan', 'equipment', 'other')),
  principal           BIGINT NOT NULL CHECK (principal > 0),
  disbursed_on        DATE NOT NULL,
  money_movement_id   UUID REFERENCES money_movements (id),   -- the disbursement, if paid by payroll
  deduction_election_id UUID NOT NULL REFERENCES deduction_elections (id),  -- goal = principal
  consent_document_id UUID NOT NULL REFERENCES documents (id),
  work_state_rule_ref TEXT NOT NULL,           -- the state rule applied to amounts and final pay
  status              TEXT NOT NULL CHECK (status IN ('open', 'repaid', 'written_off',
                        'forgiven'))           -- forgiven principal is wages
);
```

The limit check is a query against the accumulator before each deferral line is written; a sketch for 402(g):

```sql
SELECT GREATEST(dl.amount - COALESCE(SUM(a.amount), 0), 0) AS room_left
FROM deduction_limits dl
LEFT JOIN accumulators a
  ON a.worker_id = $worker_id
 AND a.employer_id = ANY($plan_employer_ids)
 AND a.tax_year = EXTRACT(YEAR FROM $check_date::DATE)
 AND split_part(a.key, ':', 1) = ANY(dl.applies_to_item_types)   -- 'pretax_401k', 'roth_401k'
WHERE dl.limit_kind = '402g'
  AND dl.valid_during @> $check_date::DATE
GROUP BY dl.amount;
```

Design notes:

- **Limits are rows with sources,** read as of the check date, so January's new limits need a data load, not a release, and a 2025 correction uses 2025 limits ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Accumulators must include in-flight statements.** A bonus run and a regular run on the same day both read room left; the engine serializes per worker or reserves the room, or the second over-defers ([Gross-to-Net, How to Build It](/books/workforce/gross-to-net#how-to-build-it)).
- **A split is two lines.** When a deferral crosses a limit within a period, the engine writes the traditional part and the spillover part as separate lines with their own pay item types and taxability, which is what the W-2's box 12 codes D and AA need.
- **Forgiven loans are wages.** Writing off an employee loan is not just a status change; the forgiven principal is taxable compensation and needs an earning line.
- **Every pre-tax deduction names its authority:** the plan for cafeteria and retirement items, the assignment for dues, the consent for loans, the order for garnishments. The engine refuses a pre-tax treatment without a plan.

## Auditing

Deductions are audited by plan auditors (Form 5500 audits test deferrals against elections and remittances), the DOL (late deposits of participant contributions), state wage agencies (unauthorized deductions) and the IRS (cafeteria plan qualification):

- **Every election with its authority and effective date,** and every change with the life event or form that caused it.
- **Every limit decision:** the limit row, the room left, the split, and the Roth catch-up determination with the prior-year wages it used.
- **Arrears and skipped deductions** with reasons, and their recovery lines.
- **State treatment by line,** so box 16 can be rebuilt from the state's own rows.
- **Employer contributions tied to liabilities and remittances,** so the plan's records, the carrier's invoice and the W-2 agree. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds).

## What This Means for the System You Build

- **Answer "pre-tax for which tax" per deduction type and jurisdiction** in `taxability_rules`, never with a single flag.
- **Tie every pre-tax deduction to a plan,** and every after-tax deduction to its authorization.
- **Define plan compensation as a list of pay item types,** with the 401(a)(17) cap.
- **Keep 2026 limits as data:** $24,500, $8,000, $11,250, the $150,000 Roth catch-up threshold, $4,400 and $8,750, $3,400, $7,500 and $340 a month, each on its own period basis.
- **Split a deferral that crosses a limit into two lines,** and read the Roth catch-up rule from last year's wages.
- **Take deductions in a stated order** that puts taxes before garnishments and garnishments before voluntary items.
- **Record arrears as balances,** and recover them by rule.
- **Write employer contributions as memo lines with liabilities,** feeding limits and W-2 codes.

## References

**Law and regulation**

- [29 USC 186](https://www.law.cornell.edu/uscode/text/29/186), the dues check-off exception and the written assignment irrevocable for no more than one year
- [29 CFR 531.35](https://www.law.cornell.edu/cfr/text/29/531.35), "free and clear" wages and deductions that cut into minimum wage or overtime
- [26 CFR 1.125-4](https://www.law.cornell.edu/cfr/text/26/1.125-4), permitted mid-year election changes under a cafeteria plan

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), the treatment table for cafeteria plans, dependent care, 401(k), 403(b) and SIMPLE contributions, and HSA contributions inside and outside a cafeteria plan
- [IRS: Publication 15-B (2026), Employer's Tax Guide to Fringe Benefits (PDF)](https://www.irs.gov/pub/irs-pdf/p15b.pdf), the $3,400 health FSA limit, $7,500 dependent care, $340 parking and transit, Table 2-1
- [IRS: 401(k) limit increases to $24,500 for 2026 (IR-2025-111, November 13, 2025)](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500), the 2026 deferral, catch-up, age 60 to 63 and SIMPLE limits
- [IRS: Notice 2025-67 (PDF)](https://www.irs.gov/pub/irs-drop/n-25-67.pdf), the $150,000 Roth catch-up wage threshold, the $72,000 415(c) limit and the $360,000 401(a)(17) limit for 2026
- [IRS: Rev. Proc. 2025-19 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-19.pdf), 2026 HSA limits and HDHP thresholds
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), box 12 codes D, W, DD and TA and designated Roth contributions
- [Pennsylvania Department of Revenue: PA Personal Income Tax Guide, Gross Compensation](https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/gross-compensation), retirement contributions as always taxable, cafeteria plan rules and nontaxable fringes
- [New Jersey Division of Taxation: NJ-WT (September 2025, PDF)](https://www.nj.gov/treasury/taxation/pdf/current/njwt.pdf), the 401(k) exclusion, other retirement plan contributions as taxable, cafeteria plans, commuter benefits and box 16 contents

**Vendor documentation**

- [Check: Post-tax deductions](https://docs.checkhq.com/docs/post-tax-deductions.md), benefits and post-tax deductions, garnishment fields, priority and negative net
- [Gusto Embedded: Create a garnishment](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees-employee_id-garnishments.md), garnishment types and maximums
- [Gusto Embedded: Create an off-cycle payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls.md), `skip_regular_deductions`
- [Zeal: Deduction types](https://docs.zeal.com/docs/deductions-types.md), pre-tax and post-tax deduction types
- [Zeal: Employee checks guide](https://docs.zeal.com/docs/employee-checks-guide.md), deductions other than garnishments not debited by Zeal
