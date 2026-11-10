+++
title = "401(k) Deferrals & Remittance"
nav_title = "401(k) Deferrals"
description = "2026 deferral limits, the Roth catch-up rule, auto-enrollment, matches and true-ups, plan compensation, deposit deadlines, VFCP and the recordkeeper file."
category = "Workforce Industry"
order = 2649
part = "Benefits Administration"
tags = ["benefits", "401k", "retirement", "roth-catch-up", "remittance", "erisa"]
+++

A 401(k) deferral is the employee's money from the moment it leaves the paycheck. Payroll computes it from the plan's definition of compensation and the employee's election, stops it at the year's limits, splits it into traditional and Roth by rules that changed for 2026, computes the employer's match, and then holds money that is, under ERISA, already a plan asset. The Department of Labor's rule is that participant contributions become plan assets on "the earliest date on which such contributions ... can reasonably be segregated from the employer's general assets," and depositing them late is a prohibited use of plan assets with lost earnings to restore, whether the employer or its payroll provider was slow.

So the payroll side of a 401(k) is three jobs. Calculate the right deferral and match each period against limits that span the year and the plan's own rules; send the money to the trust quickly, with a file the recordkeeper can apply to the right accounts; and correct the errors the way the IRS and DOL programs require. This chapter covers the 2026 limits as payroll enforces them, the Roth catch-up rule's final regulations, the age 60 to 63 catch-up, automatic enrollment for new plans, plan compensation, matches and true-ups worked, remittance timing worked, late deposits and the Voluntary Fiduciary Correction Program, and the payroll-to-recordkeeper file. The per-period deferral calculation and a mid-year limit split are in [Pre-Tax & Post-Tax Deductions](/books/workforce/deductions#401-k-and-roth-deferrals); the recordkeeper's participant ledger is [Investing & Digital Assets'](/books/investing-and-digital-assets/retirement-accounts#401-k-recordkeeping-in-brief); deferral write-back from recordkeepers through unified APIs is in [Deduction Write-Back](/books/workforce/unified-hr-apis#deduction-write-back).

## How the Platforms Do It

How payroll platforms and the industry describe the payroll-to-plan link, as of November 2026:

| Source | What it shows | Notes |
| --- | --- | --- |
| **Check** | Benefit types `401k`, `403b`, `457` (pre-tax) and `roth_401k`, `roth_403b`, `roth_457`, `roth_simple_ira` (post-tax); catch-up applied automatically "when an employee reaches catch-up age during the contribution's calendar year"; recordkeeper integrations where Vestwell "will also automatically sync deductions to Check" and loan repayments appear as a recordkeeper-managed post-tax deduction | Recordkeepers integrate as partners (Vestwell, Human Interest and others) |
| **Gusto Embedded** | A "Section 603 high earner status" per employee and `effective_year`, for "employees aged 50 or older whose prior-year FICA wages exceed the IRS threshold," with `is_high_earner` that "Can be null if the status has not yet been determined"; year-to-date benefit amounts from a different company; contribution exclusions for 401(k) and Roth 401(k) | Guideline is its 401(k) partner product |
| **Finch** | Recordkeeper product that "automates the flow of contribution and election data between payroll and an employer's retirement plan recordkeeper" (private beta); a matching guide using "100% of the first 3% of compensation deferred, plus 50% of the next 2%" | A unified API between many payrolls and many recordkeepers |
| **SPARK Institute** | API recommendations for payroll-recordkeeper data, written because "every company in the industry defines payroll integration differently" | Contribution sources, pay period, hours and compensation per period and year to date, loans, and indicative data |

The pattern: **payroll owns the per-period calculation and the money; the recordkeeper owns the participant's account and the elections; each tells the other what changed.** The Roth catch-up rule made the boundary sharper, because payroll has to know last year's FICA wages to decide whether a 2026 catch-up can be pre-tax, and the recordkeeper has to know which source the money went to.

## The 2026 Limits

From IR-2025-111 and Notice 2025-67:

| Limit | 2026 | Applies to | Payroll's job |
| --- | --- | --- | --- |
| Elective deferrals, 402(g) | $24,500 (up from $23,500) | The person, across all plans | Stop at the limit for the employer's plans; the person fixes excess across employers |
| Catch-up, age 50 or older | $8,000 (up from $7,500) | Age 50 by year end | Continue past $24,500, to $32,500 |
| Catch-up, ages 60 to 63 | $11,250 | Those who "attain age 60, 61, 62, or 63 in 2026" | Replaces $8,000 for that year |
| Roth catch-up wage threshold, 414(v)(7) | $150,000 of 2025 FICA wages (up from $145,000) | Prior-year Social Security wages from the employer | Make catch-ups Roth for those above it |
| Annual additions, 415(c) | $72,000 (up from $70,000) | Employee plus employer contributions | Stop the match or flag; usually tested by the recordkeeper |
| Compensation limit, 401(a)(17) | $360,000 (up from $350,000) | Pay a deferral or match is computed on | Cap plan compensation for the year |
| Highly compensated employee, 414(q) | $160,000 (unchanged) | Prior-year compensation | Feed nondiscrimination testing |
| SIMPLE deferral | $17,000 ($18,100 for certain plans); catch-up $4,000 ($3,850 for certain plans); ages 60 to 63, $5,250 | SIMPLE IRAs and SIMPLE 401(k)s | The same mechanics, different numbers |

Three enforcement details. **Age is by year end,** so an employee who turns 50 on December 30 is catch-up eligible from January 1, and one who turns 64 during the year is back to $8,000; the age 60 to 63 rule covers those who would attain 60 through 63 "but not 64" before year end (TD 10033). **402(g) is the person's limit,** and an employer can enforce it only against its own plans and whatever prior-employer amounts the employee reports; the IRS's fix is distribution of "the excess amount plus allocable earnings ... by April 15 of the year following the year of deferral," and late, the excess is taxed twice. **The limits are rows,** read as of the check date, in the `deduction_limits` table [Pre-Tax & Post-Tax Deductions](/books/workforce/deductions#how-to-build-it) defines; this chapter doesn't add a second limits table.

## The Roth Catch-Up Rule

SECURE 2.0 section 603 requires that catch-up contributions of higher earners be Roth. Treasury's final regulations, TD 10033 (90 FR 44527, September 16, 2025, effective November 17, 2025), set the mechanics:

- **The test.** A participant whose FICA wages "from the employer sponsoring the plan" in the prior calendar year exceeded the threshold (initially $145,000, indexed; $150,000 for 2026 determinations from 2025 wages) may make catch-ups only as Roth. Only Social Security wages count (W-2 box 3, not box 5), and a participant with no FICA wages from that employer, such as a partner with only self-employment income, isn't subject to it.
- **Applicability.** The regulations apply to contributions in "taxable years beginning after December 31, 2026"; for 2026, a "reasonable, good faith interpretation" of the statute applies, and the plan amendment deadline is December 31, 2026, later for collectively bargained and governmental plans.
- **Deemed Roth election.** A plan may treat an affected participant as having designated catch-ups as Roth, if the plan says so and the participant has "an effective opportunity" to make a different election, and the deemed election must stop within a reasonable period after the participant is no longer subject to the rule.
- **Aggregation.** Employers sharing a common paymaster may be aggregated for the wage test, controlled group members may be if the plan lists them, and a successor employer may rely on the predecessor's W-2 under Rev. Proc. 2004-53 ([Changing Providers Mid-Year](/books/workforce/changing-providers#rev-proc-2004-53-standard-and-alternate-procedures)).
- **Correction.** A pre-tax catch-up that should have been Roth is fixed by the **W-2 method** (moved to the Roth account and reported as Roth on the year's W-2, available only before that W-2 "has already been filed or furnished") or the **in-plan Roth rollover method** (rolled to Roth and reported on a 1099-R for the rollover year), both adjusted for earnings.

What it means for payroll: before the first 2026 check, each employee who will be 50 or older needs a determination from 2025 box 3 wages at this employer (or its aggregated group), stored with the source. The determination is null until computed, which is Gusto Embedded's model exactly, and a mid-year hire whose prior-year wages came from a predecessor needs those wages loaded. The split itself, a traditional deferral reaching $24,500 and the rest spilling into Roth catch-up within one period, is worked in [401(k) and Roth Deferrals](/books/workforce/deductions#401-k-and-roth-deferrals). Correction by the W-2 method has a hard deadline in payroll's own calendar: the W-2 (Year-End, W-2s & Wage Reporting).

## Automatic Enrollment for New Plans

SECURE 2.0 section 101 added IRC 414A: a 401(k) or 403(b) arrangement must be an "eligible automatic contribution arrangement" to qualify, with a default contribution in the first year of at least 3% and at most 10%, rising by one percentage point each plan year after a completed year of participation to at least 10% and at most 15%, permissible withdrawals, and a default investment under the DOL's qualified default investment rules. It applies to plan years beginning after December 31, 2024, and not to arrangements established before December 29, 2022, governmental and church plans, SIMPLE plans, employers in existence less than 3 years, or employers that "normally employed 10 or fewer employees." Treasury proposed regulations on January 14, 2025 (90 FR 3092); a search of the Federal Register on November 10, 2026 shows no final rule.

A worked example of my own, for a plan established in 2025 with a 3% default and 1% annual increases, plan year equal to the calendar year: an employee becomes a participant on March 1, 2026 and makes no election. Deferrals run at 3% from the first payroll after the plan's notice period. Under a plan that counts only full plan years of participation, the rate stays at 3% on January 1, 2027 (the 2026 participation was partial) and becomes 4% on January 1, 2028, and so on to the plan's cap; a plan that counts the partial year steps up a year earlier. How the first partial year counts is a plan document point the final regulations may settle, so it belongs in the plan's rule, not in code. An employee who elects 0% stops; one who elects 6% stays at 6%, unaffected by the escalation. The payroll engine needs the default rate, the escalation schedule per participant, the date of each participant's first participation, and the opt-out, all as data with the plan's notice dates, because the escalation date and the "completed year" rule differ by plan.

## Plan Compensation

The deferral percentage and the match are computed on the plan's definition of compensation, which is a plan document choice (W-2 wages, wages subject to withholding, a safe harbor definition, with or without bonuses, overtime, commissions or imputed income) capped at $360,000 for 2026. Getting it wrong is third on the IRS's list of common 401(k) mistakes, and its examples are payroll examples: Employer Z's plan excluded bonuses but deferrals and matches were taken on them; Employer Y's plan included overtime but payroll left it out. Excess deferrals are distributed with earnings and the related match forfeited; missed deferrals are fixed with a corrective contribution "equal to 50% of the missed deferral" (25% under some conditions), plus the missed match. The IRS's advice for avoiding it: "Try to simplify your plan's definition of compensation and use the same definition for multiple purposes."

In the engine, plan compensation is a list of pay item types per plan, the same structure as a tax base ([deduction_codes.compensation_item_types](/books/workforce/deductions#how-to-build-it)), with the annual cap enforced against a plan-year accumulator. Two consequences. A bonus run must read the plan's list, not the regular run's settings, or every bonus is a correction. And the cap is per plan year: an employee earning $480,000 reaches $360,000 of plan compensation in the ninth month, after which neither deferrals by percentage nor the match accrue.

## Matches and True-Ups

A match is the employer's contribution computed from the employee's deferral by the plan's formula. The common shapes are a single tier (50% of deferrals up to 6% of compensation), a tiered formula ("100% of the first 3% of compensation deferred, plus 50% of the next 2%," Finch's example), and discretionary or profit-sharing contributions computed annually. Safe harbor plans' employer contributions "must ... be fully vested when made" and require a notice "at least 30 days and not more than 90 days before the beginning of each plan year" (IRS 401(k) plan overview).

The trap is the period. A plan whose formula is annual, computed per payroll for convenience, under-matches employees who front-load their deferrals: the IRS warns that when the match is calculated per payroll period "the sum of these amounts may not comply with the terms of the plan," and its fix is "a corrective contribution ... plus earnings." The **true-up** is the year-end computation that pays the difference.

A worked example of my own: an employee earns $240,000 a year, paid $10,000.00 semimonthly, defers 25% and is under 50. The plan matches 100% of the first 3% plus 50% of the next 2% of compensation (a 4% maximum), computed per payroll with an annual true-up.

| Periods | Deferral | Per-period match | Year to date |
| --- | --- | --- | --- |
| 1 to 9 | $2,500.00 each (25%) | $400.00 each (4% of $10,000.00) | $22,500.00 deferred, $3,600.00 matched |
| 10 | $2,000.00 (reaches $24,500.00) | $400.00 (20% deferred, still over 5%) | $24,500.00, $4,000.00 |
| 11 to 24 | $0.00 | $0.00 | $24,500.00, $4,000.00 |
| True-up | | Annual: 4% × $240,000.00 = $9,600.00, less $4,000.00 | $5,600.00 more |

The employee who spread the same $24,500.00 over 24 periods ($1,020.83 each, 10.2%) would have received $400.00 a period, $9,600.00, with no true-up. The plan's document decides whether the true-up exists; if it does, the computation needs the whole year's plan compensation and deferrals by period, after year end, and the contribution goes to the recordkeeper as an employer source with its own deposit. With a match formula as data, the computation is short:

```go tab="Go"
package retirement

// Tier is one band of a match formula: Rate of deferrals between
// FromPct and ToPct of compensation (percentages in basis points).
type Tier struct{ FromBP, ToBP, RateBP int64 }

// Match returns the match in cents on comp and deferred for one period or
// a whole year: per period sums tiers per period; a true-up calls it once
// with annual totals and subtracts what was paid.
func Match(comp, deferred int64, tiers []Tier) int64 {
	var m int64
	for _, t := range tiers {
		lo, hi := comp*t.FromBP/10000, comp*t.ToBP/10000
		in := min(max(deferred-lo, 0), hi-lo)
		m += in * t.RateBP / 10000
	}
	return m
}
```

```rust tab="Rust"
/// One band of a match formula: `rate_bp` of deferrals between
/// `from_bp` and `to_bp` of compensation (basis points).
pub struct Tier { pub from_bp: i64, pub to_bp: i64, pub rate_bp: i64 }

/// The match in cents on `comp` and `deferred` for a period or a year; a
/// true-up calls it with annual totals and subtracts what was paid.
pub fn matched(comp: i64, deferred: i64, tiers: &[Tier]) -> i64 {
    tiers.iter().map(|t| {
        let (lo, hi) = (comp * t.from_bp / 10_000, comp * t.to_bp / 10_000);
        (deferred - lo).max(0).min(hi - lo) * t.rate_bp / 10_000
    }).sum()
}
```

With tiers `{0, 300, 10000}` and `{300, 500, 5000}`, a period of $10,000.00 compensation and $2,500.00 deferred matches $300.00 + $100.00 = $400.00; the year's $240,000.00 and $24,500.00 match $7,200.00 + $2,400.00 = $9,600.00, and the true-up is $9,600.00 less the $4,000.00 paid.

## Remittance Timing

Deferrals and loan repayments are plan assets as of the earliest date they can reasonably be segregated, with two bright lines in 29 CFR 2510.3-102:

- **Small plan safe harbor.** For a plan with fewer than 100 participants at the beginning of the plan year, a deposit by the 7th business day after the day the employer received the amount, or the day it would have been paid to the employee in cash, is treated as meeting the general rule.
- **Outer limit.** For pension plans, never later than the 15th business day of the month after the month the amounts were withheld; for SIMPLE IRAs, 30 calendar days after that month; welfare plans, 90 days. A business day is any day other than a Saturday, Sunday or federal holiday. An employer may extend the pension plan limit by 10 business days for a month by giving notices and posting a bond, at most twice a plan year.

The outer limit isn't a target. For a plan of 100 or more participants there is no safe harbor, and the general rule asks how quickly this employer can segregate the money; an employer that pays net pay the same day it runs payroll will have trouble explaining why deferrals took two weeks.

Worked with a check date of Friday, November 20, 2026 (invented payroll, real calendar; Thanksgiving is Thursday, November 26):

| Plan | Deadline | Date |
| --- | --- | --- |
| 30 participants, safe harbor | 7th business day after November 20: November 23, 24, 25, 27, 30, December 1, 2 | Wednesday, December 2, 2026 |
| 600 participants | As soon as reasonably segregable; a provider that impounds the deferral with the payroll debit can usually send it in a day or two | Policy, documented |
| Any pension plan, outer limit | 15th business day of December 2026 | Monday, December 21, 2026 |

The deposit is a remittance against the run's liability to the plan, with the trust's confirmation; the due date is computed from the plan's size class and the rule, stored on the liability with its `rule_ref`, like a tax deposit ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Late Deposits and VFCP

A late deposit is a prohibited transaction (the employer had the use of plan assets) and an operational failure the plan reports on its Form 5500. The correction is to deposit the principal, restore lost earnings, and, through the DOL's Voluntary Fiduciary Correction Program, get relief from civil enforcement; the related class exemption, PTE 2002-51, conditionally relieves the excise tax. The 2025 update (90 FR 4192 and 90 FR 3667, January 15, 2025, effective March 17, 2025) added a **Self-Correction Component**: an employer may self-correct delinquent participant contributions and loan repayments where lost earnings are "$1,000 or less (excluding any excise tax amounts paid to the plan under the related class exemption PTE 2002-51)" and the contributions were "remitted to the plan within 180 calendar days from the date of withholding," filing a notice "electronically to EBSA using a new online VFC Program web tool" and keeping the documents on the SCC Retention Record Checklist. The DOL provides an online calculator for lost earnings.

A worked example of my own: a payroll of a 600-participant plan withholds $40,000.00 of deferrals on a check date and, through a funding error, deposits them 21 days late. Lost earnings at an illustrative 8% a year are $40,000.00 × 8% × 21 ÷ 365 = $184.11, under $1,000, and the deposit was well within 180 days, so self-correction is available: deposit the $184.11 (the DOL calculator gives the actual figure), file the SCC notice, keep the checklist documents. The same failure found 200 days later is outside self-correction and goes through full VFCP.

For a payroll provider the lesson is a reconciliation: every deferral withheld is a liability to the plan with a due date, every liability is matched to a remittance, and any liability open past its date opens a correction record the day it happens, not when the auditor finds it.

## The Payroll-to-Recordkeeper File

The money and the file travel together. The recordkeeper needs to know whose money each dollar is, by source, so the trust's deposit can be allocated to participant accounts; and it needs census data for eligibility, vesting and testing. SPARK's recommendations describe the minimum, "After payroll is reviewed and audited for accuracy and eligibility, the final contributions for each employee must be submitted to the Record Keeper":

| Group | Fields |
| --- | --- |
| **Employee** | Contract number, division, recordkeeper identifier, employee ID, SSN, name, date of birth |
| **Contribution** | Pay period, period hours, period gross compensation, year-to-date hours and compensation |
| **Contribution detail** | Type (employee deferral, Roth, after-tax, safe harbor nonelective, employer match, safe harbor match, student loan match, QNEC, profit sharing and others), recordkeeper type code, fund, amount |
| **Loan payment** | Loan number, payment amount, more than one loan |
| **Indicative** | Original hire date, rehire date, eligibility date, termination date, employee status |
| **Acknowledgment** | "a unique identifier will be returned with the status of acceptance," at first possibly only "Received" |

In the other direction, the recordkeeper sends deferral elections (pre-tax, Roth, after-tax, as a percentage or an amount) back to payroll, which is the write-back in [Unified HR & Payroll APIs](/books/workforce/unified-hr-apis#deduction-write-back). What makes the file hard:

- **It must equal the money.** The file's total by source equals the remittance, and each detail ties to pay statement lines; a file that is corrected after the deposit means the trust holds money the recordkeeper can't allocate.
- **Corrections flow too.** A voided check, a retro deferral, a true-up and a late deposit's lost earnings are each contributions with a source and a pay period, sent as adjustments, not as edits of the earlier file.
- **Hours and compensation are plan facts.** Eligibility (hours of service toward entry and vesting) and testing read them from the same file, so the plan compensation definition has to be computed, not approximated from gross.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `deduction_elections` holds deferral elections, `accumulators` year-to-date deferrals, `liabilities` and `remittances` the deposit to the trust; limits are rows in the existing `deduction_limits` ([Pre-Tax & Post-Tax Deductions](/books/workforce/deductions#how-to-build-it)) rather than a new table. This chapter adds the plan, its match formula, the catch-up determination, the recordkeeper file and late deposit corrections.

```sql
CREATE TABLE retirement_plans (            -- a 401(k), 403(b) or SIMPLE plan as payroll sees it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL UNIQUE REFERENCES benefit_plans (id),
  plan_type           TEXT NOT NULL CHECK (plan_type IN ('401k', 'safe_harbor_401k', '403b',
                        'governmental_457b', 'simple_401k', 'simple_ira')),
  plan_year           TEXT NOT NULL,         -- 'calendar' or the start month and day
  participants_at_year_start INT NOT NULL,   -- under 100: the 7-business-day safe harbor applies
  compensation_item_types TEXT[] NOT NULL,   -- the plan's definition of compensation
  roth_allowed        BOOLEAN NOT NULL,
  deemed_roth_catch_up BOOLEAN NOT NULL DEFAULT FALSE,
  auto_enroll_rate    NUMERIC(5, 2),         -- 414A: 3 to 10 percent
  auto_escalate_step  NUMERIC(5, 2),         -- 1 point a year
  auto_escalate_cap   NUMERIC(5, 2),         -- 10 to 15 percent
  recordkeeper        TEXT NOT NULL,
  trust_account_ref   TEXT NOT NULL,         -- where deposits go, as a reference
  established_on      DATE NOT NULL,         -- before December 29, 2022 exempts it from 414A
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE match_formulas (              -- tiers, period basis and true-up
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  retirement_plan_id  UUID NOT NULL REFERENCES retirement_plans (id),
  source              TEXT NOT NULL CHECK (source IN ('match', 'safe_harbor_match',
                        'nonelective', 'safe_harbor_nonelective', 'profit_sharing')),
  tiers               JSONB NOT NULL,        -- [{"from_bp":0,"to_bp":300,"rate_bp":10000}, ...]
  computation_period  TEXT NOT NULL CHECK (computation_period IN ('pay_period', 'month',
                        'quarter', 'plan_year')),
  true_up             BOOLEAN NOT NULL DEFAULT FALSE,
  vesting_schedule    TEXT NOT NULL,         -- 'immediate', '3_year_cliff', '6_year_graded', ...
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE catch_up_determinations (     -- section 603: Roth catch-up, per worker and year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  retirement_plan_id  UUID NOT NULL REFERENCES retirement_plans (id),
  for_year            SMALLINT NOT NULL,
  prior_year_fica_wages BIGINT,              -- W-2 box 3 from the employer or aggregated group
  wage_source         TEXT CHECK (wage_source IN ('our_w2', 'aggregated_group', 'predecessor_w2',
                        'none')),
  threshold           BIGINT NOT NULL,       -- 15000000 for 2026
  roth_required       BOOLEAN,               -- null until determined
  catch_up_limit      BIGINT NOT NULL,       -- 800000, or 1125000 for ages 60 to 63
  determined_at       TIMESTAMPTZ,
  UNIQUE (worker_id, retirement_plan_id, for_year)
);

CREATE TABLE recordkeeper_files (          -- what was sent with each deposit, and the answer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  retirement_plan_id  UUID NOT NULL REFERENCES retirement_plans (id),
  pay_run_id          UUID REFERENCES pay_runs (id),     -- null for a true-up or correction
  kind                TEXT NOT NULL CHECK (kind IN ('contribution', 'true_up', 'correction',
                        'lost_earnings', 'census')),
  pay_period          DATERANGE,
  totals_by_source    JSONB NOT NULL,        -- {"ee_deferral": 4000000, "ee_roth": .., "er_match": ..}
  remittance_id       UUID REFERENCES remittances (id),  -- the deposit it describes
  storage_ref         TEXT NOT NULL,
  sent_at             TIMESTAMPTZ,
  recordkeeper_ref    TEXT,                  -- the identifier returned
  status              TEXT NOT NULL CHECK (status IN ('built', 'sent', 'received', 'accepted',
                        'rejected', 'superseded'))
);

CREATE TABLE late_deposit_corrections (     -- a deferral liability paid after its due date
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  liability_id        UUID NOT NULL REFERENCES liabilities (id),
  withheld_on         DATE NOT NULL,
  due_on              DATE NOT NULL,
  deposited_on        DATE,
  principal           BIGINT NOT NULL,
  lost_earnings       BIGINT,                -- from the DOL calculator, as computed
  calculator_ref      TEXT,                  -- the calculator output document
  program             TEXT CHECK (program IN ('scc', 'vfcp', 'none')),  -- SCC: <= $1,000, <= 180 days
  excise_paid_to_plan BIGINT,                -- under PTE 2002-51
  notice_ref          TEXT,                  -- the SCC notice or VFCP application
  document_ids        UUID[] NOT NULL DEFAULT '{}',   -- the retention checklist
  status              TEXT NOT NULL CHECK (status IN ('detected', 'deposited', 'earnings_restored',
                        'filed', 'closed'))
);
```

Finding late deposits is a query over liabilities the plan is owed:

```sql
SELECT l.id, l.pay_run_id, l.amount, l.due_on, r.settlement_date,
       r.settlement_date - l.due_on AS days_late
FROM liabilities l
LEFT JOIN remittances r ON r.id = l.remittance_id
WHERE l.payee_type = 'plan'
  AND l.employer_id = $employer_id
  AND (r.settlement_date > l.due_on OR (r.id IS NULL AND l.due_on < CURRENT_DATE))
  AND NOT EXISTS (SELECT 1 FROM late_deposit_corrections c WHERE c.liability_id = l.id);
```

Design notes:

- **Determine catch-up treatment before the year's first check,** from stored prior-year box 3 wages, and keep the determination null until computed so the engine refuses a pre-tax catch-up rather than guessing.
- **One limits table,** `deduction_limits`, with each 2026 figure and its source; this chapter's rows are 402(g), both catch-ups, the Roth threshold, 415(c) and 401(a)(17) ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **The match is a memo line per period and a true-up per year,** both computed from `match_formulas` and plan compensation, both with liabilities to the plan.
- **Due dates come from the plan's size class,** recomputed each plan year from `participants_at_year_start`, and late deposits open a correction record automatically.
- **The file equals the deposit.** A recordkeeper file and its remittance share totals by source, and a correction is a new file, never an edit ([Reconciliation](/docs/money/payment-states#reconciliation)).
- **Map, don't duplicate, the recordkeeper.** A `recordkeeper_files` detail line is the payroll side of a contribution in Investing & Digital Assets' participant ledger; the recordkeeper's account is the truth for balances, payroll's statement lines for what was withheld.

## Auditing

401(k) payroll records are audited by the plan's independent auditor (for large plans), the DOL (late deposits), the IRS (limits, compensation, Roth catch-up) and participants:

- **Every deferral and match line** with the election, plan compensation and limits it read, and the catch-up determination.
- **Every liability to the plan** with its due date rule and the remittance that paid it, and every late one with its correction record.
- **Every recordkeeper file** with totals that tie to the deposit and the statement lines, and its acknowledgment.
- **Plan document versions** for the compensation definition, match formula and auto-enrollment terms, and the notices given.
- **Corrections** (402(g) distributions by April 15, missed deferral contributions, Roth catch-up corrections) with dates and methods. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Enforce the 2026 limits as data:** $24,500, $8,000 or $11,250 for ages 60 to 63, $72,000, $360,000, and the $150,000 Roth catch-up threshold on 2025 box 3 wages.
- **Determine Roth catch-up status per worker and year before the first check,** with the wage source stored.
- **Model auto-enrollment as a default, an escalation schedule and an opt-out** per participant, for plans 414A covers.
- **Compute on plan compensation,** a list of pay item types capped at $360,000, the same in regular and bonus runs.
- **Compute the match per period and true it up per year** when the plan's formula is annual.
- **Date every deposit from the plan's size class:** 7 business days as the small plan safe harbor, as soon as segregable otherwise, never past the 15th business day of the next month.
- **Detect late deposits the day they happen,** and route them to self-correction (lost earnings $1,000 or less, within 180 days) or VFCP.
- **Send the recordkeeper a file that equals the deposit,** by source, with corrections as new files.

## References

**Law and regulation**

- [29 CFR 2510.3-102](https://www.law.cornell.edu/cfr/text/29/2510.3-102), participant contributions as plan assets, the 7-business-day small plan safe harbor, the 15th-business-day outer limit, SIMPLE and welfare plan limits, business days
- [26 USC 414A](https://www.law.cornell.edu/uscode/text/26/414A), automatic enrollment for new 401(k) and 403(b) arrangements: rates, escalation, exceptions and effective date
- [Treasury: Catch-Up Contributions, TD 10033, 90 FR 44527 (Federal Register API)](https://www.federalregister.gov/api/v1/documents/2025-17865.json), publication and effective dates of the final Roth catch-up regulations
- [Treasury: Catch-Up Contributions, full text (Federal Register)](https://www.federalregister.gov/documents/full_text/html/2025/09/16/2025-17865.html), applicability dates and good faith, the FICA wage test, deemed Roth elections, aggregation, correction methods, and the age 60 to 63 catch-up
- [Treasury: Automatic Enrollment Requirements Under Section 414A, proposed rule, 90 FR 3092 (Federal Register API)](https://www.federalregister.gov/api/v1/documents/2025-00501.json), the proposed regulations and comment dates
- [Federal Register search: documents on section 414A automatic enrollment since January 2025](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22automatic+enrollment%22+414A&conditions%5Bpublication_date%5D%5Bgte%5D=2025-01-01&fields%5B%5D=title&fields%5B%5D=citation&fields%5B%5D=publication_date&fields%5B%5D=document_number&fields%5B%5D=type&fields%5B%5D=effective_on), no final rule as of November 10, 2026
- [DOL: Voluntary Fiduciary Correction Program, 90 FR 4192 (full text)](https://www.federalregister.gov/documents/full_text/html/2025/01/15/2025-00327.html), the Self-Correction Component's $1,000 and 180-day conditions, the online notice and the retention checklist

**Agency guidance and forms**

- [IRS: 401(k) limit increases to $24,500 for 2026 (IR-2025-111)](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500), 2026 deferral, catch-up and SIMPLE limits
- [IRS: Notice 2025-67 (PDF)](https://www.irs.gov/pub/irs-drop/n-25-67.pdf), 415(c), 402(g), catch-ups, the $150,000 Roth catch-up threshold, SIMPLE limits, 414(q) and 401(a)(17) for 2026
- [IRS: 401(k) plan overview](https://www.irs.gov/retirement-plans/plan-sponsor/401k-plan-overview), safe harbor contributions fully vested and the 30-to-90-day notice
- [IRS: 401(k) plan fix-it guide, 402(g) excess deferrals](https://www.irs.gov/retirement-plans/401k-plan-fix-it-guide-elective-deferrals-werent-limited-to-the-amounts-under-irc-section-402g-for-the-calendar-year-and-excesses-werent-distributed), distribution by April 15 and double taxation
- [IRS: 401(k) plan fix-it guide, plan definition of compensation](https://www.irs.gov/retirement-plans/401k-plan-fix-it-guide-you-didnt-use-the-plan-definition-of-compensation-correctly-for-all-deferrals-and-allocations), the bonus and overtime examples, the 50% missed deferral correction and prevention
- [IRS: 401(k) plan fix-it guide, matching contributions](https://www.irs.gov/retirement-plans/401k-plan-fix-it-guide-employer-matching-contributions-werent-made-to-all-appropriate-employees), per-payroll matching against annual plan terms and corrective contributions
- [DOL EBSA: Voluntary Fiduciary Correction Program](https://www.dol.gov/agencies/ebsa/employers-and-advisers/plan-administration-and-compliance/correction-programs/vfcp), the 2025 update, PTE 2002-51, effective March 17, 2025, self-correction and the calculator
- [Federal Register search: VFCP and PTE 2002-51 documents](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22Voluntary+Fiduciary+Correction+Program%22&conditions%5Bpublication_date%5D%5Bgte%5D=2024-12-01&fields%5B%5D=title&fields%5B%5D=citation&fields%5B%5D=publication_date&fields%5B%5D=document_number&fields%5B%5D=type&fields%5B%5D=effective_on), 90 FR 4192 and 90 FR 3667, January 15, 2025

**Standards and specifications**

- [SPARK Institute: API Industry Standard Recommendations (May 2025, PDF)](https://www.sparkinstitute.org/wp-content/uploads/2025/05/API-Recommendation-for-SPARK-5-22-25-FINAL.pdf), payroll-to-recordkeeper contribution, loan, indicative and acknowledgment fields

**Vendor documentation**

- [Check: Types of benefits](https://docs.checkhq.com/reference/types-of-benefits.md), retirement benefit types and automatic catch-up
- [Check: Vestwell 401(k) integration guide](https://docs.checkhq.com/docs/check-vestwell-integration-guide.md), recordkeeper-managed deductions synced to payroll and loan repayments
- [Gusto Embedded: Create a Section 603 high earner status](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees-employee_uuid-section603_high_earner_statuses-1.md), the high earner status fields
- [Gusto Embedded: documentation index](https://docs.gusto.com/llms.txt), contribution exclusions, year-to-date amounts from another company and the 401(k) partner
- [Finch: Recordkeeper overview](https://developer.tryfinch.com/products/recordkeeper/Overview.md), contribution and election data between payroll and recordkeepers
- [Finch: Tiered employer matching](https://developer.tryfinch.com/developer-resources/Tiered-Employer-Matching.md), the 100% of 3% plus 50% of the next 2% example
