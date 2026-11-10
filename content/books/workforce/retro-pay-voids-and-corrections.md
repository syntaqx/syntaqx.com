+++
title = "Retro Pay, Voids & Corrections"
nav_title = "Retro Pay & Corrections"
description = "Correcting payroll: off-cycle runs, retro raises and overtime, voids, reversals, manual checks, overpayment recovery, and fixes across quarters and years."
category = "Workforce Industry"
order = 2611
part = "Gross to Net"
tags = ["payroll", "corrections", "retro-pay", "overpayments", "941-x", "w-2c"]
+++

Every payroll is wrong sometimes. A raise was approved after the period it took effect in; a terminated employee was paid for a period they didn't work; a bonus was keyed twice; a timesheet was approved with a missing week; a direct deposit went to an account that closed. The rule that keeps a payroll system honest is the one the core model already states: a paid statement is never edited. A correction is a new statement that pays more, reverses some or all of an old one, or records money that moved outside the system, and it is taxed and reported according to when it's paid, which quarter and year the original fell in, and whether the worker or the employer ends up owing.

The tax law around corrections is stricter than it looks. Back pay is "taxed as ordinary wages in the year paid," so a retro raise for December paid in January is next year's wages. An employee who repays a prior-year overpayment repays the gross, not the net, because the income tax withheld last year was the employee's and can't be recovered by the employer. Overtime on a retroactive raise is owed "no matter what the agreement of the parties may be." And every quarter a correction touches may need a Form 941-X, every prior-year W-2 a W-2c. This chapter covers off-cycle runs, retroactive rate changes and retro overtime, voids, reversals and adjustments, manual checks, overpayments and their recovery under federal and state limits, and corrections that cross a quarter or a year, with the filing side summarized and owned by the Payroll Tax part (Tax Notices, Amendments & Agency Accounts for Form 941-X; Year-End, W-2s & Wage Reporting for W-2c).

## How the Platforms Do It

As of November 2026, from developer documentation:

| Platform | Off-cycle | Void and reversal | Corrections to history |
| --- | --- | --- | --- |
| **Check** | Payroll `type: off_cycle`, with `off_cycle_options` (`force_supplemental_withholding`, `apply_benefits`, `apply_post_tax_deductions`, all false by default); listed uses include bonuses, early pay, "correcting an underpayment" and paying a terminated employee | A void creates "a payroll that exactly zero out an existing payroll item" (`POST /payrolls/{id}/void`), with `is_void: true` and negated amounts; a separate reversal reverses a paid ACH credit while `can_reverse` and before `reversal_deadline`, for a reason of `duplicate`, `incorrect_amount` or `incorrect_receiving_account`, with an `X-Idempotency-Key` | A correction is "a bundle of changes to a company's pay history that is previewed, approved, and fulfilled as a single unit," with a `year`, `settlement_date`, `status` (draft, pending, processing, settled, failed), `totals.cash_requirement` and `agency_refundable` |
| **Gusto Embedded** | `off_cycle_reason` of Adhoc, Benefit reversal, Bonus, Correction, Dismissed employee, Hired employee, Wage correction, Tax reconciliation, Reversal, Disability insurance distribution or Transition from old pay schedule; `skip_regular_deductions` | A payroll can be cancelled back to unprocessed only before "4pm PT on the `payroll_deadline`"; payroll reversals carry `reversed_payroll_uuid`, `reversal_payroll_uuid`, a `reason` and a `category` | Off-cycle Correction and Wage correction payrolls |
| **Zeal** | Employee checks batched by `check_date` | | A Correction earning type carries negative gross for prior overpayments |

The common shape: **cancel only before money moves; after that, every fix is a new payroll** (an off-cycle that adds, a void that negates, a correction bundle that re-states history), and a reversal of a bank credit is a separate action on the money, not the statement.

## Off-Cycle Runs

An off-cycle run is any pay run outside the regular schedule: a bonus, a final paycheck on termination, a missed new hire, a correction of an underpayment, a reimbursement batch. It has a check date, a run type and a reason, and three decisions the regular run doesn't make:

- **Withholding method.** Off-cycle wages are usually supplemental (bonuses, commissions, back pay, retroactive increases), withheld at 22% flat or aggregated with a regular period ([Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income#flat-and-aggregate-worked)). Wages that are regular pay paid late (a missed week of hours) can be withheld as the period they belong to, which is what Gusto's `withholding_pay_period` and Check's `force_supplemental_withholding` let a caller choose.
- **Recurring deductions.** A bonus run usually skips medical premiums and other per-period deductions (they were taken on the regular run), but may take a 401(k) deferral if the plan's compensation includes bonuses; Check defaults `apply_benefits` and `apply_post_tax_deductions` to false, Gusto offers `skip_regular_deductions`. Garnishments are different: an order applies to earnings when paid, so an off-cycle bonus is subject to it.
- **Funding and deposit.** An off-cycle run has its own debit and its own tax liabilities, due on the employer's deposit schedule for its check date; a correction run that refunds tax creates a negative liability that offsets the next deposit or becomes a 941-X item, depending on the quarter (below).

## Retroactive Rate Changes

A retroactive raise is pay for work already paid at the old rate. The engine recomputes each affected period as of the new rate and pays the difference on a current check:

- **By work period.** Each affected period's earning lines are recomputed with the new `pay_rates` row (which carries the effective date the raise was approved for, in `valid_during`), and the difference per line is a retro line whose `work_period` is the original period ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Including overtime.** A retroactive increase "operates to increase the regular rate of pay of the employees for the period of its retroactivity," and a lump sum "must be prorated back over the hours of the period to which it is allocable." The regulation's example: a 10-cent retroactive raise owes "a retroactive increase of 15 cents for each overtime hour" (29 CFR 778.303).
- **Taxed when paid.** "Back pay, including retroactive wage increases (but not amounts paid as liquidated damages), is taxed as ordinary wages in the year paid." Pub 15 lists retroactive pay increases among supplemental wages, so the retro line is withheld as supplemental, its Social Security and Medicare apply against this year's wage base, and it appears on this quarter's 941 and this year's W-2.

A worked example of my own: an hourly employee's raise from $25.00 to $26.00 is approved effective with the period starting Sunday, September 20, 2026, and reaches payroll after three biweekly periods have been paid at the old rate. The employee worked 80 regular hours each period and 4, 0 and 6 overtime hours.

| Period | Regular hours × $1.00 | Overtime hours × $1.50 | Retro |
| --- | --- | --- | --- |
| September 20 to October 3 | 80 × $1.00 = $80.00 | 4 × $1.50 = $6.00 | $86.00 |
| October 4 to October 17 | $80.00 | 0 | $80.00 |
| October 18 to October 31 | $80.00 | 6 × $1.50 = $9.00 | $89.00 |
| **Total** | | | **$255.00** |

Paid on the November 20 check as one supplemental retro earning with three work periods underneath it: income tax at 22% is $56.10, Social Security $15.81, Medicare $3.70. If the 401(k) plan's compensation includes retro pay, the deferral percentage applies to the $255.00 too, and if a garnishment is active, the $255.00 is part of this period's earnings for it. Had the raise been effective in December and paid in January 2027, it would be 2027 wages on the 2027 W-2, even though the work was done in 2026.

### Retro Overtime from Bonuses

A nondiscretionary bonus earned over several workweeks raises the regular rate in each of them, and once it's determinable it "must be apportioned back over the workweeks of the period during which it may be said to have been earned," with extra overtime of half the per-hour bonus for each overtime hour in each week (29 CFR 778.209(a)); if it can't be tied to weeks, a reasonable equitable method such as an equal amount per week is allowed. A worked example of my own: a $520.00 quarterly attendance bonus over 13 weeks is $40.00 a week; in a 45-hour week, that adds $40.00 / 45 = $0.8889 to the regular rate, and the retro overtime is 5 × $0.4444 = $2.22 for that week. The engine has to find every overtime week in the bonus period, compute each week's premium, and pay the sum with the bonus, and since that premium is FLSA-required, it is also qualified overtime for box 12 code TT ([The Overtime Premium as Payroll Must Track It](/books/workforce/tips-and-the-2025-deductions#the-overtime-premium-as-payroll-must-track-it)). Overtime & the Regular Rate in the Time and Wage-Hour part owns the inclusion rules.

## Voids, Reversals and Adjustments

Three words get used loosely; they are different records with different effects.

| | What it is | Money | Statement | Tax and filings |
| --- | --- | --- | --- | --- |
| **Cancel** | Undo a run before money moves | None moved, none moves | The draft or approved statements are discarded | Nothing reported |
| **Void** | Negate a paid statement, usually because the payment never reached the worker (an uncashed check, a credit stopped or returned) or was issued in error | The check is stopped or the credit returned or reversed | A new statement with every line negated and `reverses_statement_id` set | The negation lands in the void's quarter if the original's quarter is still open; otherwise it's a prior-quarter correction |
| **Reversal of a payment** | Pull back a bank credit already sent (a duplicate, a wrong amount, a wrong account) | An ACH reversal entry within the network's window | Usually paired with a void or adjustment statement | As the paired statement |
| **Adjustment** | Change part of a paid statement: add a missed earning, correct a deduction, fix a tax | A supplemental payment, or an amount owed back | A new statement with the difference lines only | In the adjustment's quarter, or a prior-quarter correction |

The decision tree is short: if money hasn't moved, cancel; if it moved and the worker didn't get it, void (and stop or reverse the payment); if the worker got it and it was wrong, adjust, and if the adjustment is negative, it's an overpayment. ACH reversals have network rules about permissible reasons and timing that the payroll side inherits; Payments covers them in [Reversals](/books/payments/ach#reversals), and Check's API mirrors them with its three reasons and a `reversal_deadline`. A reversal can fail (the worker has spent the money), at which point it's an overpayment to recover.

A void of a check paid in a prior year needs care. The wages were reported on last year's W-2 and last year's 941s; voiding now means the employer reports a correction to that year (W-2c and 941-X), not a negative line on this year's statement. The engine has to ask which year the original's check date fell in before it writes anything.

## Manual Checks

A manual check is a payment made outside the run, typically a handwritten or printed check for a terminated employee's final pay due today, or an emergency payment while a run is blocked, and recorded afterward. The record has to be complete: the gross, every tax and deduction computed as the engine would have (or as the person writing it did), the check number and date, the bank account it was drawn on, and the statement it belongs to. Two failure modes are common. A manual check recorded with gross only leaves its taxes off the liabilities and off the 941, which surfaces at the quarter's reconciliation. A manual check recorded twice (once by hand and once when the regular run also paid the period) is a duplicate payment, which the system should catch by refusing a second statement for the same worker, period and earnings without an explicit link. In this model a manual check is a statement on an off-cycle run whose money movement is `rail = 'check'`, already issued, with the check details in `manual_checks`.

## Overpayments and Recovery

An overpayment is wages paid that the worker wasn't owed. Recovering it has three layers of law: federal tax law decides how the correction is reported and taxed, federal wage law limits deductions, and state wage law decides whether the employer may deduct at all, how much, and with what notice.

**Tax: same year versus prior year.** Pub 15 is direct: "If an employee repays you for wages received in error, don't offset the repayments against current year wages unless the repayments are for amounts received in error in the current year." A worked example of my own: in March 2026 an employee is paid a $1,000.00 bonus twice in error. The duplicate had $220.00 of income tax (22%), $62.00 of Social Security and $14.50 of Medicare withheld, so the employee received $703.50 of it.

- **Discovered and repaid in 2026.** The employee repays the net, $703.50 (or the employer deducts it where state law allows), and the employer records a negative adjustment statement for the $1,000.00 with its $296.50 of taxes negated. The employee's 2026 W-2 will be right because it hasn't been issued. If the duplicate was in the first quarter and the repayment in the second, Pub 15 says: "If you receive repayments for wages paid during a prior quarter in the current year, report adjustments on Form 941-X to recover income tax withholding and social security and Medicare taxes for the repaid wages."
- **Discovered in 2027.** The W-2 instructions say "Prior-year repayments made in the current year must be repaid gross, not net." The employee repays $1,000.00. The employer can't recover the $220.00 of income tax ("You can't make an adjustment for income tax withholding because the wages were income to the employee for the prior year"), and it can't adjust Additional Medicare, but it recovers Social Security and Medicare on Form 941-X for the first quarter of 2026: its own $76.50 and the employee's $76.50, which it repays or credits to the employee with the written statement the 941-X instructions require for "refunds of employee social security and Medicare taxes overcollected in prior years." It files a W-2c that corrects boxes 3 to 6 only ("Don't correct wages (box 1) on Form W-2c for the amount paid in error"), and tells the employee the wages stay taxable for 2026; for repayments over $3,000 the employee may be entitled to a deduction or credit on their return (Pub 525 covers it).

So the employee who repays in the same year gives back what they got; the one who repays the next year gives back more than they got and recovers the difference, if at all, through their own return. That asymmetry is why a system should detect overpayments fast and why the year of discovery is a field on every overpayment record.

**Federal wage law.** Recovery by deduction is a deduction for the employer's benefit, and wages must be paid "free and clear": a recovery deduction can't cut into the minimum wage or required overtime for the workweek (29 CFR 531.35). An overpayment recovery is safest as a repayment the employee makes, or a deduction sized to stay above the minimum wage floor every week.

**State wage law.** States differ in consent, notice and amount. New York's rule for overpayment deductions (12 NYCRR 195-5.1) is a good example of the shape a rules table needs:

- **Look-back.** The employer may recover only overpayments made in the eight weeks before it issues notice.
- **Notice.** At least three weeks' notice before deductions start (three days if the whole amount comes out of the next wage payment), stating the total overpaid, the amount per pay period and how to contest it.
- **Amount.** When recovery exceeds net wages after other permitted deductions, a deduction "may not exceed 12.5 percent of the gross wages earned in that wage payment," and can't bring the effective hourly wage below the state minimum.
- **Dispute.** The employee may respond within a week of the notice; the employer replies within a week, offers a meeting within a week after that, and gives a written final determination within a week of the meeting. Without that process, a contested deduction is presumed impermissible.

<!-- source-gap: wf-ca-overpayment-recovery | missing | California's limits on recovering wage overpayments by deduction (Labor Code 221 and 224 and DLSE positions) | closes with: the Labor Code sections and a DLSE opinion letter or manual section opened | checked: 2026-11-09 --> Other states, California among them, restrict recovery by deduction more tightly; I haven't confirmed California's rule from a primary source for this chapter, and a system shouldn't deduct an overpayment in California without that rule configured. In data, each state's rule is a row keyed by the worker's work state: whether deduction is allowed, consent required, notice days, look-back, per-payment cap, the floor, and the dispute steps, so the recovery plan is computed and the notice is generated from it ([The Shape of a Rule](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)). Recovery from final pay is a harder case in most states (Pay Frequency, Pay Statements & Final Pay in the Time and Wage-Hour part).

## Corrections That Cross a Quarter or a Year

Where a correction lands depends on the original's check date and the correction's:

| Original paid in | Corrected in | What the system does |
| --- | --- | --- |
| The current quarter | The same quarter | Correction statements in the same quarter; the 941 is filed with the right totals |
| A prior quarter of this year | This quarter | Correction statements dated now, tagged with the original quarter; Form 941-X for the original quarter; the W-2 is right when issued |
| A prior year | This year | Social Security and Medicare corrected on Form 941-X for the original quarter; prior-year income tax withholding only for administrative errors; W-2c and W-3c for the employee |

Form 941-X's rules shape the data:

- **Adjustment or claim.** For overreported tax, the employer chooses "the adjustment process" (a credit on a later return) or "the claim process" (a refund), and a claim is required in the last 90 days of the limitations period.
- **Employee statements and consents.** To adjust or claim the employee share of overcollected Social Security and Medicare for prior years, the employer must have repaid the employee and have written statements, or, for a claim without repayment, the employee's consent. These are documents, stored and linked to the correction.
- **Prior-year income tax.** "For prior years, you may only correct administrative errors to federal income tax withholding," and "Only transposition or math errors involving the inaccurate reporting of the amount withheld are administrative errors"; using the wrong table is not one.
- **Interest-free underpayments.** Correcting an underreported amount is interest-free when filed by the due date of the return for the quarter the error was discovered and paid with it, with the discovery date recorded, and not after an IRS examination or notice.

Tax Notices, Amendments & Agency Accounts in the Payroll Tax part covers 941-X filing in full, and Year-End, W-2s & Wage Reporting covers W-2c and W-3c. The engine's job is to produce, for every correction, the original period, the discovery date, the corrected amounts by tax and quarter, and the employee documents, so those filings are generated, not reconstructed.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `pay_runs.run_type` already has `off_cycle`, `correction`, `void` and `reversal`; `pay_statements.reverses_statement_id` and `pay_statement_lines.work_period` carry the link and the period. New tables record retro calculations, overpayments and their recovery, and manual checks.

```sql
ALTER TABLE pay_runs
  ADD COLUMN off_cycle_reason   TEXT CHECK (off_cycle_reason IN ('bonus', 'termination', 'new_hire',
                                  'underpayment', 'retro', 'reimbursement', 'manual_check',
                                  'tax_reconciliation', 'other')),
  ADD COLUMN withholding_mode   TEXT CHECK (withholding_mode IN ('supplemental', 'regular_period')),
  ADD COLUMN apply_recurring_deductions BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE pay_statements
  ADD COLUMN correction_kind    TEXT CHECK (correction_kind IN ('void', 'adjustment', 'retro',
                                  'overpayment_reversal')),
  ADD COLUMN original_quarter   DATE,      -- the quarter start the corrected wages were reported in
  ADD COLUMN discovered_on      DATE;      -- the date the error was found, for 941-X

CREATE TABLE retro_calculations (           -- one retro recompute of past periods
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  trigger             TEXT NOT NULL CHECK (trigger IN ('rate_change', 'bonus_allocation',
                        'timesheet_change', 'deduction_change')),
  trigger_ref         UUID NOT NULL,          -- the pay_rates row, bonus line or timesheet
  affected_periods    DATERANGE NOT NULL,
  original_statement_ids UUID[] NOT NULL,
  difference          BIGINT NOT NULL,        -- cents, positive owed to the worker
  detail              JSONB NOT NULL,         -- per period and line: old, new, difference
  paid_on_statement_id UUID REFERENCES pay_statements (id),
  calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE overpayments (                 -- wages paid in error
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  source_statement_id UUID NOT NULL REFERENCES pay_statements (id),
  gross               BIGINT NOT NULL CHECK (gross > 0),
  taxes_withheld      JSONB NOT NULL,         -- by tax type: what the original withheld on it
  net                 BIGINT NOT NULL,
  paid_year           SMALLINT NOT NULL,
  discovered_on       DATE NOT NULL,
  recovery_basis      TEXT NOT NULL CHECK (recovery_basis IN ('net', 'gross')),  -- same or prior year
  state_rule_ref      TEXT NOT NULL,          -- the work state's recovery rule applied
  notice_document_id  UUID REFERENCES documents (id),
  status              TEXT NOT NULL CHECK (status IN ('identified', 'noticed', 'disputed',
                        'recovering', 'recovered', 'written_off')),
  CHECK ((recovery_basis = 'gross') = (EXTRACT(YEAR FROM discovered_on) > paid_year))
);

CREATE TABLE overpayment_recoveries (       -- each repayment or deduction against it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  overpayment_id      UUID NOT NULL REFERENCES overpayments (id),
  method              TEXT NOT NULL CHECK (method IN ('payroll_deduction', 'employee_payment',
                        'reversal', 'offset_final_pay')),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  money_movement_id   UUID REFERENCES money_movements (id),
  employee_statement_document_id UUID REFERENCES documents (id),  -- for 941-X
  recovered_on        DATE NOT NULL
);

CREATE TABLE manual_checks (                -- a payment made outside the run, recorded after
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_statement_id    UUID NOT NULL UNIQUE REFERENCES pay_statements (id),
  check_number        TEXT NOT NULL,
  drawn_on_bank_account_id UUID NOT NULL REFERENCES bank_accounts (id),
  issued_on           DATE NOT NULL,
  issued_by           TEXT NOT NULL,
  taxes_computed_by   TEXT NOT NULL CHECK (taxes_computed_by IN ('engine', 'entered')),
  UNIQUE (drawn_on_bank_account_id, check_number)
);
```

Design notes:

- **The original is read as it was.** A retro or correction recomputes the old period from the as-of snapshot the original used, with only the changed input replaced, so the difference is the change and nothing else ([As-Of Queries](/docs/database/temporal-data#as-of-queries)); a recompute that also picks up an unrelated table update since then is a second, silent correction.
- **Quarter and year are computed, not chosen.** `original_quarter` comes from the original's check date; the filing that a correction produces (none, 941-X, W-2c) is derived from it and the correction's check date.
- **Recovery is a plan from rules.** The state rule produces the notice, the start date, the per-payment cap and the floor; each deduction line is checked against them when written.
- **Money and statements stay separate.** A payment reversal is a `money_movements` row with its own status; the void statement records the wage effect. Either can fail without the other ([Payment States & Ledgers](/docs/money/payment-states#reconciliation)).
- **Idempotent corrections.** Each correction carries an idempotency key derived from what it corrects, so a retried retro job never pays the difference twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).

## Auditing

Corrections are where an auditor tests whether the system's history can be trusted:

- **Every correction linked to what it corrects,** with the reason, who approved it, the discovery date and the original quarter.
- **Retro calculations with old and new values** by period and line, and the regular rate effect on overtime.
- **Overpayments with their notices, disputes and recoveries,** the state rule applied, and each deduction's check against the cap and floor.
- **941-X support:** employee statements and consents as documents, and corrected amounts by quarter and tax.
- **Manual checks reconciled** to the bank and to the statements, with no orphan checks and no duplicate periods ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).

## What This Means for the System You Build

- **Never edit a paid statement:** cancel before money moves, and void, adjust or re-run after.
- **Recompute retro from the original's snapshot,** by work period, including overtime on the new regular rate.
- **Tax back pay and retro pay in the year paid,** as supplemental wages.
- **Keep payment reversals and wage corrections as separate records** that can fail independently.
- **Record manual checks with full tax detail** and block duplicate periods.
- **Treat overpayments by year of discovery:** net recovery in the same year, gross in a later one, with 941-X and W-2c support generated.
- **Make state recovery rules data:** look-back, notice, caps, floors and dispute steps by work state.
- **Derive the filing consequences** of every correction from the original's quarter and year.

## References

**Law and regulation**

- [29 CFR 778.303](https://www.law.cornell.edu/cfr/text/29/778.303), retroactive wage increases raise the regular rate and owe retroactive overtime
- [29 CFR 778.209](https://www.law.cornell.edu/cfr/text/29/778.209), apportioning a bonus back over the workweeks it was earned in
- [29 CFR 531.35](https://www.law.cornell.edu/cfr/text/29/531.35), "free and clear" wages and the kickback rule
- [12 NYCRR 195-5.1](https://www.law.cornell.edu/regulations/new-york/12-NYCRR-195-5.1), New York's rules for deductions to recover overpayments: look-back, notice, the 12.5% cap and the dispute procedure

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), back pay taxed in the year paid, retroactive pay increases as supplemental wages, and wage repayments in the current and prior years
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), repayments of wages received in error, gross repayment of prior-year amounts, W-2c corrections and the $3,000 note
- [IRS: Instructions for Form 941-X](https://www.irs.gov/instructions/i941x), adjustment and claim processes, interest-free adjustments, employee statements and consents, and administrative errors in prior-year income tax withholding
- [IRS: Publication 525 (2025), Taxable and Nontaxable Income](https://www.irs.gov/publications/p525), repayments of income included in a prior year

**Vendor documentation**

- [Check: Off-cycle payroll](https://docs.checkhq.com/docs/off-cycle-payroll.md), off-cycle options and use cases
- [Check: Correcting pay history](https://docs.checkhq.com/docs/correcting-pay-history.md), voids and the correction object
- [Check: Reverse a payment](https://docs.checkhq.com/reference/reverse-a-payment.md), `can_reverse`, `reversal_deadline`, the three reasons and the idempotency key
- [Gusto Embedded: Create an off-cycle payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls.md), off-cycle reasons and `skip_regular_deductions`
- [Gusto Embedded: Cancel a payroll](https://docs.gusto.com/embedded-payroll/reference/put-api-v1-companies-company_id-payrolls-payroll_id-cancel.md), cancellation before 4pm PT on the payroll deadline
- [Gusto Embedded: Get payroll reversals](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-payroll_reversals.md), reversal records, reasons and categories
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), the Correction earning with negative gross
