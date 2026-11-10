+++
title = "Sick Leave & PTO Engines"
description = "Paid sick leave laws as rules (accrual, caps, carryover, frontloading, waiting periods), PTO policies, California vacation as wages, payout and the ledger."
category = "Workforce Industry"
order = 2644
part = "Leave"
tags = ["paid-sick-leave", "pto", "leave", "accruals", "california", "wage-and-hour"]
+++

No federal law requires private employers to give paid sick days or vacation. States and cities do, for sick time, and each writes the same handful of rules differently: California requires at least 40 hours or five days a year, accrued at one hour per 30 worked, usable after 90 days, with the balance on every pay stub; Washington accrues one hour per 40 worked with no annual accrual cap and a 40-hour carryover; Michigan allows employers to cap use at 72 hours a year; New York scales the amount to employer size and makes it unpaid for the smallest employers; Minnesota requires the available and used hours to be shown at the end of each pay period. Vacation and general PTO are mostly the employer's own policy, until California treats vested vacation as wages that can never be forfeited and must be paid out at the final rate when employment ends.

A leave engine turns those rules into a ledger: accrual entries computed from hours worked or paid on each pay run, usage entries from approved time off, carryover and forfeiture at the year boundary, payouts at separation, and a balance that is always a sum, never a typed number. The rules are data keyed by jurisdiction and effective date, the employer's policy is a second layer that must meet or beat each law that applies to the worker, and the balance has to be reproducible for any past pay date because it's printed on statements that are records. This chapter covers the laws as rules, the PTO layer, California vacation, payout at separation, balances on statements, and the ledger and its engine. Protected leave under the FMLA is in [FMLA Administration](/books/workforce/fmla) and state wage replacement programs in [State Paid Family & Medical Leave](/books/workforce/state-paid-leave). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Payroll APIs expose leave as policies with an accrual method and a few limits, applied when a payroll runs. As of November 2026:

| Platform | What the public documentation exposes |
| --- | --- |
| **Gusto Embedded** | Policy types vacation, sick and holiday; accrual methods `unlimited`, `per_pay_period`, `per_calendar_year`, `per_anniversary_year`, `per_hour_worked`, `per_hour_worked_no_overtime`, `per_hour_paid` and `per_hour_paid_no_overtime`; fields `accrual_rate`, `accrual_rate_unit`, `max_hours`, `max_accrual_hours_per_year`, `carryover_limit_hours`, `accrual_waiting_period_days` and `paid_out_on_termination` (defaulting to false); an endpoint that calculates accruing hours for a payroll |
| **Check** | Earning types `pto` ("time for which an employee is paid, but during which they did not work") and `sick`; the balances are the partner's to keep |
| **Merge (unified HRIS API)** | `TimeOff` and `TimeOffBalance` common models read from the underlying HR systems |

Gusto's field list is a good summary of the rule dimensions every engine needs, and its method names show the subtle one: whether overtime hours accrue. Its documentation also shows what such a schema leaves to the employer: nothing in a policy object says which state's law the policy must satisfy, so the check that a policy meets California's 40 hours or Michigan's carryover is outside the API. That check is most of what this chapter builds.

## Sick Leave Laws as Rules

The laws I opened, as of November 2026:

| Rule | California | New York | Washington | Michigan | Minnesota |
| --- | --- | --- | --- | --- | --- |
| **Amount** | At least 40 hours or 5 days a year, whichever is more (since January 1, 2024) | 100+ employees: up to 56 hours paid; 5 to 99: up to 40 paid; 4 or fewer: 40 paid if net income over $1 million, otherwise 40 unpaid | Accrual-based, no annual accrual cap stated | Use cap of 72 hours a year (small businesses 40), unless the employer selects more | At least 48 hours a year |
| **Accrual** | 1 hour per 30 hours worked | At least 1 hour per 30 worked | At least 1 hour per 40 worked | 1 hour per 30 worked | 1 hour per 30 worked |
| **Frontload** | Full amount at the start of the year; new hires 24 hours by day 120 and 40 by day 200 | The full annual amount at the start of the year, "not subject to later revocation or reduction" | | At least 72 hours (small businesses 40) at the start of a year | |
| **Accrual or balance cap** | May cap at 80 hours or 10 days | | | | |
| **Carryover** | Carries over, subject to the cap; use may be limited to 40 hours or 5 days a year | Use may be limited to 40 or 56 hours | Up to 40 hours | Up to 72 hours (small businesses 40); no carryover or year-end payout required if frontloaded | |
| **Waiting period** | 90 days of employment before use | | 90 calendar days | Up to 120 days for employees hired after the 2025 amendment | |
| **Increments** | Employer may set a minimum of up to 2 hours | | | | |
| **Pay** | Nonexempt: the regular, non-overtime rate; paid by the next regular payday | | | | Same base rate as when working |
| **On the statement** | Available leave on the pay stub; records kept three years | | | | Available and used hours at the end of each pay period |
| **At separation** | Not paid out unless the employer's policy provides; restored if rehired within 12 months, unless paid out under a PTO policy | | Not paid out generally; reinstated if rehired within 12 months, unless paid out | | |

A blank cell means the page I opened didn't state the rule, not that the state has none. Michigan's 2025 amendment let small businesses delay accrual, frontloading and tracking until October 1, 2025. California adds uses beyond illness (preventive care, family members, certain acts of violence, and from 2025 jury duty and court appearances), bars requiring medical certification in general, and lets more generous local ordinances control. Washington's law exempts certain doctors, lawyers, dentists and executives and pays certain construction workers their balance at separation.

A few more state laws I opened show how the set keeps moving:

- **Colorado:** the Wage Protection Rules give the Healthy Families and Workplaces Act's regular rate as "one hour per 30 worked, up to a maximum of 48 per benefit year," with added hours on the declaration of a public health emergency.
- **Illinois:** the Paid Leave for All Workers Act "went into effect on January 1, 2024," for employers of all sizes, at "at least 1 hour of paid time off for every 40 hours worked, up to 40 hours in a 12-month period"; Chicago and Cook County employees are covered by their own ordinances instead.
- **Nebraska:** the voter-initiated law as amended by LB 415 starts paid sick time on October 1, 2025, accruing 1 hour per 30 worked after 80 hours of consecutive employment, up to 40 hours a year at a small business and 56 at other employers.
- **Missouri:** the Revisor lists section 290.600, the first section of the voter-approved earned paid sick time law, as repealed by H.B. 567 effective August 28, 2025.
- **Oregon:** at least 1 hour per 30 worked, up to 40 hours a year, paid at employers with 10 or more Oregon employees (six or more with a Portland location) and unpaid but protected below that.

<!-- source-gap: wf-sick-leave-50-state | missing | a primary 50-state and city list of paid sick leave laws with effective dates, including Alaska's ballot measure, New Jersey, Arizona, Massachusetts and city ordinances | closes with: each state's labor agency page or statute, opened (Alaska's statute site 403 and its sick leave page 404, Arizona's ICA and mass.gov 403, and New Jersey's page returned no rule text on Nov 10, 2026) | checked: 2026-11-10 --> I didn't verify Alaska, New Jersey, Arizona, Massachusetts or any city ordinance, and I haven't found a primary-source list of every state and city law, so the table is five states and the list above five more rather than a national list. The design doesn't depend on the list being complete; it depends on every law being a row.

### The Rule Dimensions

Read across the table, every law is a combination of the same dimensions:

1. **Basis.** Hours worked (California, Washington, Michigan, Minnesota), hours worked excluding or including overtime (Gusto's `per_hour_worked_no_overtime` exists for policies that exclude it), or a frontloaded grant.
2. **Rate.** One hour per 30 or per 40.
3. **Grant amount** for frontloading, with new-hire milestones (California's 24 by day 120 and 40 by day 200).
4. **Accrual cap** (California's 80 hours) and **annual use cap** (California's 40, Michigan's 72, New York's 40 or 56).
5. **Carryover cap** (Washington's 40, Michigan's 72).
6. **Waiting period** before use (90 days, 120 days).
7. **Minimum increment** of use (California's up to 2 hours).
8. **Pay rate** for an hour used (the regular rate, the base rate).
9. **Statement display** (balance on the stub; available and used).
10. **Separation and rehire** (no payout; reinstatement within 12 months).
11. **Employer size tiers** (New York's three, Michigan's small businesses), counted by a rule of the state's.

Each is a column or a JSON key on a dated rule row, and the employer's policy is checked against every law that applies to the worker's work location for the period. A worker who works in two jurisdictions accrues under each law for hours worked there, which means the accrual basis is hours by location from `time_entries`, not total hours.

### Worked Numbers: One Worker Under Three Laws

An invented part-time employee works 25 hours a week for 52 weeks, 1,300 hours, with no overtime. Under the three accrual rules:

| Law | Rate | Accrued in the year | Usable | Carried into next year |
| --- | --- | --- | --- | --- |
| **California** | 1 per 30 | 1,300 / 30 = 43.33 hours | 40 hours if the employer caps use | Up to the 80-hour cap |
| **Washington** | 1 per 40 | 1,300 / 40 = 32.50 hours | All of it after 90 days | Up to 40 hours |
| **Michigan** | 1 per 30 | 43.33 hours | Up to 72 hours a year | Up to 72 hours |

The fractional hours are real: a ledger that rounds each pay period's accrual down to whole hours loses up to 26 x 0.99 hours a year on a biweekly payroll, enough to fall below a statutory minimum. Accrue in exact decimals and carry the remainder, as the engine below does.

### Worked Numbers: One National Policy

An employer with workers in all five states wants a single sick leave policy that satisfies each law in the table. Taking the most generous requirement on each dimension:

| Dimension | The binding law | Superset policy |
| --- | --- | --- |
| Accrual rate | California, Michigan, Minnesota, New York (1 per 30) | 1 hour per 30 hours worked, overtime included |
| Annual use allowed | Michigan (72) | At least 72 hours a year |
| Accrual cap | Washington (no annual accrual cap stated) | No annual accrual cap, or a balance cap no lower than the largest carryover |
| Carryover | Michigan (72) | At least 72 hours |
| Waiting period | California, Washington (90 days) | 90 days or less |
| Minimum increment | California (employer may set up to 2 hours) | 2 hours or less |
| Pay rate | California and Minnesota | The regular, non-overtime rate |
| Statement | California and Minnesota | Available and used hours on every statement |
| Rehire | California, Washington (12 months) | Restore balances on rehire within 12 months |

A superset policy is simpler to run and easy to explain, and it costs more: it gives every worker the most generous rule. The alternative, policy per jurisdiction, is a `leave_policies` row per location group with eligibility by work location. Either way, the engine must check the policy against each applicable law row for each period, because laws change and a policy that complied in January may not in July.

## Frontloading Versus Accrual

Frontloading grants the year's hours on day one (or on a schedule, for new hires) instead of earning them hour by hour. It's simpler for the employee and the ledger, and it changes the year-end rules: Michigan doesn't require carryover, accrual tracking or a year-end payout of frontloaded time, and New York says frontloaded leave "is not subject to later revocation or reduction." California's frontload must meet the new-hire milestones of 24 hours by the 120th day and 40 hours by the 200th, so a frontload for a new hire is really three grants on three dates. In the ledger a frontload is an `accrual` entry dated the grant date with a reason, and the waiting period still gates usage.

## PTO Policies

Above the statutory floor, the employer writes its own policy: vacation and sick as separate banks, a combined PTO bank, holidays, or "unlimited" time off. The engine treats each as a `leave_policies` row with `rules`, and three cases need care:

- **Combined PTO used to satisfy a sick leave law.** A PTO bank can meet a sick leave law if it gives at least as much time, usable for the same purposes on the same terms; the waiting period, increment and pay rules of the sick law still apply to the hours, and in California a combined PTO plan is treated as vacation, so it vests and is paid out.
- **Unlimited time off.** There is no balance to accrue, but sick leave laws still apply: California allows "unlimited" to be shown on the stub, and the employer still needs records of use. Gusto's `unlimited` method excludes rate, caps, carryover and payout fields.
- **Accrual on hours paid versus worked.** A policy that accrues on hours paid (Gusto's `per_hour_paid`) accrues during paid leave itself; one on hours worked doesn't. The statutory sick leave laws in the table accrue on hours worked.

## California Vacation as Wages

California treats vacation differently from every other benefit, in the Labor Commissioner's words, relying on the state Supreme Court's 1982 *Suastez* decision: vacation "is considered wages, and vacation time is earned, or vests, as labor is performed." Consequences, per the DLSE:

- **No use-it-or-lose-it.** Vested vacation "cannot be forfeited, even upon termination of employment, regardless of the reason."
- **Caps are allowed.** A policy may stop accrual at a reasonable cap, so an employee at the cap accrues nothing until they use some; the cap stops future accrual, it never takes away what's vested.
- **Payout at the final rate.** At separation, all vested vacation is paid at the final rate of pay (Labor Code 227.3), in the final paycheck, on the final pay deadline ([Final Pay](/books/workforce/pay-frequency-statements-and-final-pay#final-pay)).
- **Combined PTO is vacation.** A PTO plan that can be used for vacation follows the same rules.
- **No recovery of advanced vacation.** An employer can't deduct unearned vacation it advanced from the final paycheck.

So a California vacation policy's year-end process has no `forfeiture` entries, only `carryover` and, at the cap, a stop on accrual; and the final pay calculation reads the vacation balance as owed wages.

### Worked Numbers: The Cap and the Payout

An invented California employee accrues 4.0 hours of vacation per biweekly period under a policy that caps the balance at 120 hours. On the check dated October 2, 2026 the balance is 118.0; the October 2 accrual adds only 2.0 hours (to the cap), and the October 16 accrual adds none. The employee takes 16 hours on October 20, the balance falls to 104.0, and the October 30 accrual adds 4.0 (108.0). The employee resigns with 72 hours' notice effective November 13, 2026, after one more accrual on November 13 (112.0), at a final rate of $31.25 an hour: the final paycheck owes 112.0 x $31.25 = $3,500.00 in vacation wages, at the time of quitting.

## Payout at Separation

Whether unused leave is paid at separation is the employer's policy unless a law says otherwise, and the laws in this chapter point both ways: California vacation and combined PTO must be paid; California and Washington sick leave generally needn't be, though both restore the balance on rehire within 12 months unless it was paid out; Washington pays certain construction workers' sick balances. Five other states' rules I opened also treat earned vacation as owed at separation:

- **Colorado:** the Wage Protection Rules (7 CCR 1103-7, Rule 2.17, effective February 1, 2026) quote the Wage Act's requirement to "pay upon separation from employment all vacation pay earned and determinable," define vacation pay as leave "regardless of its label" usable at the employee's discretion, and bar forfeiting any earned vacation while allowing a cap of a year's worth.
- **Illinois:** the Department of Labor's wage payment FAQ lists "the monetary equivalent of earned vacations and earned holidays" in final compensation, due no later than the next regularly scheduled payday; the same FAQ says a separated employee isn't entitled to sick pay.
- **Massachusetts:** General Laws chapter 149, section 148 counts "any holiday or vacation payments due an employee under an oral or written agreement" as wages, and a discharged employee is paid in full on the day of discharge.
- **Nebraska:** section 48-1229 counts fringe benefits as wages and leaves paid leave out of the wages due at separation, except "earned but unused vacation leave," unless the parties specifically agreed otherwise.
- **Louisiana:** R.S. 23:631 makes accrued, untaken vacation an amount due under the employer's stated policy, bars forfeiting vacation pay actually earned, and sets the deadline at the next regular payday or 15 days after discharge, whichever comes first.

<!-- source-gap: wf-pto-payout-by-state | missing | vacation payout at separation rules for Montana and states beyond the six named here | closes with: Montana's statute or rule (ARM 24.16.1522 is cited in secondary sources), and each other state's statute or labor agency guidance, opened (Montana's rule site returned no text on Nov 10, 2026) | checked: 2026-11-10 --> I didn't verify Montana's rule, which secondary summaries describe as treating earned vacation as wages, or any other state's, so they're left out rather than stated from a vendor table.

Two federal rules frame the payout. A payout of unused leave is excluded from the FLSA regular rate ([The Regular Rate](/books/workforce/overtime-and-the-regular-rate#the-regular-rate)), and for withholding it's wages, usually supplemental ([Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income)). The ledger records the payout as a `payout` entry tied to the statement line that paid it, so a rehire within 12 months can tell a paid-out balance (not restored) from an unpaid one (restored).

## Balances on Pay Statements

California requires available sick leave on the pay stub or a same-day document, and Minnesota requires available and used hours at the end of each pay period. Because a statement is a record kept for years ([Pay Statements](/books/workforce/pay-frequency-statements-and-final-pay#pay-statements)), the balance printed on it must be reproducible: the ledger sum as of the statement's check date, over entries recorded by then. A retro accrual correction posts a new entry dated today, never an edit to an old one, so the old statement's figure stays explainable and the next statement shows the corrected balance ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).

## The Accrual Ledger and Engine

The core model's `leave_ledger` is append-only, and a balance is a sum. On each pay run the engine, per worker and policy:

1. **Reads the worked hours by location** for the period from `time_entries`, and the hours paid if the policy accrues on paid hours.
2. **Picks every law row** for the work locations in force on the period's dates, and the employer's policy.
3. **Computes the accrual** at the policy's rate, which must be at least each law's, carrying the fractional remainder forward, and stops at the cap.
4. **Posts usage** for approved time off paid on the run, checking the waiting period, the increment and the annual use cap, and writes the earning line at the law's pay rate.
5. **Writes the balance to the statement** as the ledger sum as of the check date.

At the year boundary (calendar, anniversary or the policy's own year), it posts `carryover` and, where the law and policy allow, `forfeiture`. At separation it posts `payout` where owed. The accrual itself is small:

```go tab="Go"
// Accrue returns the hours to credit for a period: worked/per, limited so the
// balance doesn't pass the cap (a cap of 0 means none). Amounts are exact
// decimals in hundredths of an hour to avoid float drift; the remainder below
// a hundredth carries to the next period.
func Accrue(workedHundredths, per, balanceHundredths, capHundredths int64, carry *int64) int64 {
	num := workedHundredths + *carry
	earned := num / per
	*carry = num % per
	if capHundredths > 0 && balanceHundredths+earned > capHundredths {
		earned = max(0, capHundredths-balanceHundredths)
	}
	return earned
}
```

```rust tab="Rust"
/// Hours to credit for a period, in hundredths of an hour: worked / per,
/// limited so the balance doesn't pass the cap (0 means no cap). The
/// remainder below a hundredth carries to the next period.
pub fn accrue(worked: i64, per: i64, balance: i64, cap: i64, carry: &mut i64) -> i64 {
    let num = worked + *carry;
    let mut earned = num / per;
    *carry = num % per;
    if cap > 0 && balance + earned > cap {
        earned = (cap - balance).max(0);
    }
    earned
}
```

With hours in hundredths, 80 hours worked at one per 30 is `Accrue(8000, 30, ...)`: 266 hundredths (2.66 hours) with a carry of 20, which the next period adds back before dividing, so over a year no fraction is lost. (A capped period loses its excess by design: at the cap, nothing accrues.)

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). The core's `leave_policies` holds the employer's policy and `leave_ledger` every entry; this chapter adds the statutory law rows, structured accrual rules for each policy, and payouts.

```sql
CREATE TABLE sick_leave_laws (             -- one row per jurisdiction's rule set, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),   -- state, county or city
  employer_size_min   INT NOT NULL DEFAULT 0,   -- New York's and Michigan's tiers
  employer_size_max   INT,
  paid                BOOLEAN NOT NULL DEFAULT TRUE,   -- New York's smallest tier is unpaid
  accrual_per_hours   NUMERIC(6, 2),         -- 30, 40; null where only frontloading is allowed
  annual_minimum_hours NUMERIC(6, 2),        -- California 40 (or 5 days), Minnesota 48
  frontload_rule      JSONB,                 -- {"grant": 40, "new_hire": [{"day": 120, "hours": 24},
                                             --   {"day": 200, "hours": 40}]}
  accrual_cap_hours   NUMERIC(6, 2),         -- the lowest cap the law allows (California 80)
  use_cap_hours       NUMERIC(6, 2),         -- the lowest use cap allowed (Michigan 72)
  carryover_min_hours NUMERIC(6, 2),         -- Washington 40, Michigan 72
  waiting_days        SMALLINT,              -- 90, 120
  max_min_increment_hours NUMERIC(4, 2),     -- California: employer may require up to 2
  pay_rate_rule       TEXT,                  -- 'regular_non_ot', 'base_rate'
  statement_display   TEXT CHECK (statement_display IN ('none', 'balance', 'available_and_used')),
  rehire_restore_months SMALLINT,            -- 12
  payout_required     BOOLEAN NOT NULL DEFAULT FALSE,
  local_more_generous BOOLEAN NOT NULL DEFAULT TRUE,   -- local ordinances may add rules
  source_url          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE accrual_rules (               -- the structured form of a policy's rules
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  leave_policy_id     UUID NOT NULL REFERENCES leave_policies (id),
  method              TEXT NOT NULL CHECK (method IN ('per_hour_worked', 'per_hour_worked_no_ot',
                        'per_hour_paid', 'per_pay_period', 'frontload_calendar',
                        'frontload_anniversary', 'unlimited')),
  rate_hours          NUMERIC(8, 4),         -- hours earned per basis unit
  per_hours           NUMERIC(6, 2),         -- the basis unit (30 hours worked)
  balance_cap_hours   NUMERIC(6, 2),
  annual_accrual_cap_hours NUMERIC(6, 2),
  annual_use_cap_hours NUMERIC(6, 2),
  carryover_cap_hours NUMERIC(6, 2),
  waiting_days        SMALLINT NOT NULL DEFAULT 0,
  min_increment_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
  year_basis          TEXT NOT NULL CHECK (year_basis IN ('calendar', 'anniversary', 'fixed')),
  vests_as_wages      BOOLEAN NOT NULL DEFAULT FALSE,  -- California vacation and combined PTO
  paid_out_on_termination BOOLEAN NOT NULL DEFAULT FALSE,
  satisfies_law_ids   UUID[] NOT NULL DEFAULT '{}',    -- sick_leave_laws this policy is used for
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (leave_policy_id WITH =, valid_during WITH &&),
  CHECK (NOT vests_as_wages OR paid_out_on_termination)
);

ALTER TABLE leave_ledger
  ADD COLUMN law_id                 UUID REFERENCES sick_leave_laws (id),  -- the law accrued under
  ADD COLUMN work_location_id       UUID REFERENCES work_locations (id),   -- hours by location
  ADD COLUMN basis_hours            NUMERIC(8, 2),   -- worked or paid hours behind an accrual
  ADD COLUMN carry_remainder        NUMERIC(10, 6),  -- fraction carried to the next period
  ADD COLUMN pay_run_id             UUID REFERENCES pay_runs (id),
  ADD COLUMN recorded_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();  -- as-of for statements

CREATE TABLE leave_payouts (               -- separation and policy cash-outs
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  leave_policy_id     UUID NOT NULL REFERENCES leave_policies (id),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  reason              TEXT NOT NULL CHECK (reason IN ('separation', 'cash_out', 'policy_change')),
  hours               NUMERIC(8, 2) NOT NULL,
  rate                NUMERIC(10, 4) NOT NULL,   -- the final rate for California vacation
  amount_cents        BIGINT NOT NULL,
  required_by         TEXT CHECK (required_by IN ('law', 'policy', 'agreement')),
  leave_ledger_id     UUID NOT NULL REFERENCES leave_ledger (id),       -- the payout entry
  pay_statement_line_id UUID NOT NULL REFERENCES pay_statement_lines (id),
  final_pay_deadline_id UUID REFERENCES final_pay_deadlines (id)        -- when at separation
);
```

Saving a policy validates its `accrual_rules` against every `sick_leave_laws` row for the locations it covers, for the policy's dates, and refuses one that falls below a minimum. A pay run posts accruals and usage as above; a statement's balance is `SUM(hours)` over `leave_ledger` with `occurred_on <= check_date AND recorded_at <= statement finalized time`. A separation reads `accrual_rules.paid_out_on_termination` and `vests_as_wages`, posts the payout, and adds the amount to the final pay calculation. A rehire within a law's `rehire_restore_months` posts an `adjustment` restoring the balance not paid out.

Design notes:

- **Laws and policies are separate rows,** and a policy is validated against every law that applies to its workers' locations.
- **Accrue on hours by location,** in exact decimals with a carried remainder.
- **Balances are ledger sums as of a date,** so every printed statement is reproducible.
- **California vacation never forfeits,** and its payout is part of final pay.
- **Record payouts with the statement line that paid them,** so rehire restoration knows what was paid.

## Auditing

A sick leave or vacation claim asks:

- **Every accrual with its basis hours,** location, law and rate, and the carried remainder.
- **Every use** with its date, hours, increment, the waiting period check and the rate paid.
- **Every balance printed on a statement,** reproducible from the ledger as of that date.
- **The policy against each law** for each period, with the validation result.
- **Year-end carryover and forfeiture entries,** and proof that no California vacation was forfeited.
- **Separation payouts and rehire restorations,** with the statements behind them.

## What This Means for the System You Build

- **Encode each sick leave law as a dated rule row** with the eleven dimensions, by jurisdiction and employer size.
- **Validate employer policies against every applicable law** when saved and when a law changes.
- **Accrue from hours worked by location** with exact decimals and a carried remainder.
- **Gate usage on waiting periods, increments and use caps,** and pay it at the law's rate.
- **Print balances from the ledger as of the check date,** in the form each state requires.
- **Never forfeit California vacation,** and pay it out at the final rate on the final pay deadline.
- **Tie payouts to statement lines** and restore unpaid balances on rehire within 12 months.

## References

**Law and regulation**

- [Colorado Wage Protection Rules, 7 CCR 1103-7 (PDF)](https://www.sos.state.co.us/CCR/GenerateRulePdf.do?ruleVersionId=12405&fileName=7+CCR+1103-7), Rule 2.17: vacation pay at separation, its definition, no forfeiture and the one-year cap; Rule 3: HFWA accrual at 1 per 30 up to 48 hours
- [Massachusetts General Laws chapter 149, section 148](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXI/Chapter149/Section148), holiday and vacation payments as wages and pay on the day of discharge
- [Nebraska Revised Statutes 48-1229](https://nebraskalegislature.gov/laws/statutes.php?statute=48-1229), wages including fringe benefits and earned but unused vacation at separation
- [Louisiana Revised Statutes 23:631](https://www.legis.la.gov/Legis/Law.aspx?d=83945), the final pay deadline and accrued vacation as an amount due
- [Nebraska Revised Statutes 48-3803](https://nebraskalegislature.gov/laws/statutes.php?statute=48-3803), accrual after 80 hours at 1 per 30, the 40-hour and 56-hour caps and the October 1, 2025 start
- [Missouri Revised Statutes 290.600](https://revisor.mo.gov/main/OneSection.aspx?section=290.600), repealed by H.B. 567 effective August 28, 2025
- [Michigan Compiled Laws 408.963: Earned sick time](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-408-963), accrual at 1 per 30, the 72-hour and 40-hour use caps, carryover, frontloading, the 120-day wait and the small business delay to October 1, 2025

**Agency guidance and forms**

- [California Labor Commissioner: Paid Sick Leave FAQ](https://www.dir.ca.gov/dlse/Paid_Sick_Leave.htm), 40 hours or 5 days, accrual, caps, frontloading milestones, the 90-day wait, the 2-hour increment, pay, pay stub balances, rehire and local ordinances
- [California Labor Commissioner: Vacation FAQ](https://www.dir.ca.gov/dlse/faq_vacation.htm), vacation as vested wages, no forfeiture, caps, payout at the final rate, combined PTO and no recovery of advanced vacation
- [Illinois Department of Labor: Wage Payment FAQ](https://labor.illinois.gov/faqs/wage-payment-faq.html), earned vacation in final compensation, the next-payday deadline and no sick pay at separation
- [Illinois Department of Labor: Paid Leave for All Workers Act FAQ](https://labor.illinois.gov/faqs/paidleavefaq), the January 1, 2024 start, 1 hour per 40 up to 40 hours, all employer sizes and the Chicago and Cook County carve-out
- [Oregon BOLI: Sick time](https://www.oregon.gov/boli/workers/pages/sick-time.aspx), 1 hour per 30 up to 40 hours, paid at 10 or more employees (six with a Portland location)
- [New York State: Paid Sick Leave](https://www.ny.gov/new-york-paid-sick-leave/new-york-paid-sick-leave), size tiers, 40 and 56 hours, accrual at 1 per 30 and frontloading
- [Washington L&I: Paid Sick Leave](https://lni.wa.gov/workers-rights/leave/paid-sick-leave/), accrual at 1 per 40, the 40-hour carryover, the 90-day wait, exemptions, rehire and payout
- [Minnesota DLI: Earned Sick and Safe Time](https://www.dli.mn.gov/sick-leave), accrual at 1 per 30, 48 hours a year, the base rate and statement display

**Vendor documentation**

- [Gusto Embedded: Accrual methods](https://docs.gusto.com/embedded-payroll/docs/accrual-methods.md), the eight methods and the rate, cap, carryover, waiting period and payout fields
- [Gusto Embedded: Time off policies](https://docs.gusto.com/embedded-payroll/docs/time-off-policies.md), vacation, sick and holiday policy types
- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), the `pto` and `sick` earning types
- [Merge: Unified API index](https://docs.merge.dev/merge-unified/llms.txt), the `TimeOff` and `TimeOffBalance` common models
