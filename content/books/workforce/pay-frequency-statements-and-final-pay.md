+++
title = "Pay Frequency, Pay Statements & Final Pay"
nav_title = "Paydays & Final Pay"
description = "State payday rules, required pay statement contents, final pay deadlines by state and separation type, waiting time penalties and PTO payout."
category = "Workforce Industry"
order = 2634
part = "Time and Wage-Hour"
tags = ["payroll", "final-pay", "pay-statements", "pay-frequency", "california", "wage-and-hour"]
+++

The FLSA says how much, not when. It sets no payday frequency, requires no pay stub, and, in DOL's words, "Employers are not required by federal law to give former employees their final paycheck immediately." The states fill all three gaps, differently. New York requires manual workers to be paid weekly, within seven days of the week's end. California requires pay at least twice a month on dates it fixes, a nine-item wage statement with every payment, and a fired employee's final wages, accrued vacation included, at the moment of termination, with a day's wages added for each day they're late, up to 30. Oregon gives the employer until the end of the next business day and computes its penalty as eight hours a day at the employee's rate. Texas allows six days. Washington allows until the end of the pay period.

For the payroll system, these are three rule sets keyed by state, worker class and separation type, and each one produces a date or a document that can be late or wrong. This chapter covers state payday frequency laws, the pay statement's required contents, electronic statements, final pay timing by state and separation type, waiting time penalties with worked numbers, PTO payout at separation, deductions from final pay, and the final pay workflow. Off-cycle runs are in [Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections#off-cycle-runs); paychecks, direct deposit and pay cards are in [Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees) in the Moving the Money part; the separation workflow around final pay (benefits end dates, COBRA, access) is in [Terminations, Offboarding & WARN](/books/workforce/terminations-and-warn) in the Hiring and HR Records part. This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Payroll APIs expose final pay as an off-cycle run and the statement as a rendered document. As of November 2026:

| Platform | Final pay | Pay statement |
| --- | --- | --- |
| **Check** | "An off-cycle payroll is the recommended way to pay an employee after their last day"; payroll type `off_cycle` with options such as `force_supplemental_withholding`, `apply_benefits` and `apply_post_tax_deductions`; keep the employee active until post-termination payments are done; a `severance` earning type | "Paystubs become available as soon as a payroll is approved"; PDF or JSON; "State regulations generally require that all of the information in the paystub JSON response is rendered"; up to 15 custom `paystub_info` keys |
| **Gusto Embedded** | A Dismissal payroll, "the most guided option," covering the last regular period through the termination date; `run_termination_payroll`; off-cycle reasons including "Dismissed employee"; a flag for whether the payroll is a terminated employee's final payroll; its guide notes "Some states require employees to receive their final wages within 24 hours (unless they consent otherwise)" | Pay stubs with check date, gross, net, check amount and payment method, and a PDF endpoint |
| **Zeal** | | Pay stub PDF, link and report endpoints |

None of them computes the state deadline for the partner in its public documentation: Check's off-cycle guide gives no state deadlines, and Gusto's dismissal flow is the run, not the clock. The deadline is the platform's or the employer's to compute, which is the main thing this chapter builds.

## Pay Frequency

DOL's state payday table (last revised January 1, 2023) groups states by the frequencies they require. Selected rules, with the states' own sources where I opened them:

| State | Rule |
| --- | --- |
| **California** | At least twice each calendar month: wages earned on the 1st through 15th by the 26th, the 16th through month end by the 10th of the next month; weekly and biweekly periods within 7 calendar days of the period's end; overtime by the next regular payday; exempt executive, administrative and professional employees may be paid monthly (Labor Code 204, 207) |
| **New York** | Manual workers weekly, "not later than seven calendar days after the end of the week in which the wages are earned," unless the commissioner authorizes semimonthly for a qualifying large employer; clerical and other workers "not less frequently than semi-monthly"; commission salespersons at least monthly (Labor Law 191) |
| **Massachusetts** | "Hourly employees must be paid either weekly or biweekly"; salaried employees semimonthly, or monthly if they agree |
| **Texas** | Employees exempt from FLSA overtime at least monthly; others at least twice a month (Labor Code 61.011) |
| **Illinois** | Semimonthly; monthly for executive, administrative and professional employees |
| **Washington** | Monthly |
| **Oregon** | Regular paydays no more than 35 days apart (ORS 652.120) |
| **Alabama, Florida** | No requirement specified |

The selectors are the worker's class (manual, clerical, exempt, commission), not just the state, and New York's class is the one that matters most: Labor Law 190(4) defines a manual worker only as "a mechanic, workingman or laborer," and the [NY DOL's pay frequency FAQ](https://dol.ny.gov/frequency-pay-faq) adds the working test: "individuals who spend more than 25% of working time engaged in 'physical labor'" are manual workers, with "physical labor" read "broadly." A biweekly payroll for one is a violation every other week. New York changed the remedy in 2025: where an employer paid on a regular payday "no less frequently than semi-monthly," a first violation now yields "no more than one hundred percent of the lost interest found to be due for the delayed payment of wages," not liquidated damages equal to the wages (Labor Law 198(1-a), revised May 16, 2025).

### Worked Numbers: Paydays in November 2026

**California, semimonthly.** Wages for November 1 through 15 are due by Thursday, November 26, which is Thanksgiving. Paying earlier is always within "by the 26th," so a schedule with a previous-business-day holiday rule pays Wednesday, November 25. Wages for November 16 through 30 are due by Thursday, December 10. Overtime worked in the November 9 through 15 workweek but not computable in time may go on the next regular payday.

**California, biweekly.** A period ending Saturday, November 14 must be paid by Saturday, November 21, seven calendar days later; a Friday, November 20 check date complies, and a check date 10 days after the period end doesn't.

**New York, a manual worker paid weekly.** The week ending Saturday, November 14 must be paid by Saturday, November 21. The same worker on a biweekly schedule paid Friday, November 27 for November 8 through 21 would be paid 13 days late for the first week.

The core model's `pay_schedules` and `pay_periods` hold the schedule and its check dates; what this chapter adds is a rule that computes the latest lawful check date for each period and each worker class, and a check that every scheduled check date meets it before the schedule is saved.

## Pay Statements

The FLSA doesn't require a pay stub. The states that do decide what's on it.

**California (Labor Code 226(a))** requires, with each payment, "a detachable part of the check" or a separate writing showing nine items: gross wages earned; total hours worked (except for salaried exempt employees); piece-rate units earned and the piece rates; all deductions (those made on the employee's written orders may be aggregated); net wages; the inclusive dates of the pay period; the employee's name and only the last four digits of the Social Security number or an employee ID; the name and address of the legal entity that is the employer; and "all applicable hourly rates in effect during the pay period" with the hours worked at each. Employers keep a copy "for at least three years" and must let current and former employees inspect or copy records within 21 calendar days of a request. An employee injured by a "knowing and intentional failure" recovers the greater of actual damages or $50 for the first pay period with a violation and $100 for each later one, up to $4,000, plus costs and fees (226(e)). California adds piece-rate lines under 226.2 ([Piece Rate in California](/books/field-operations/technician-workforce#piece-rate-in-california)) and break premiums are wages that must appear (*Naranjo*; [The Premium](/books/workforce/breaks-and-premiums#the-premium)).

**New York (Labor Law 195)** requires a written wage notice at hire, in English and the employee's identified primary language, and a statement with every payment showing the dates of work covered, names and contact details, rates and basis, gross and net wages, deductions and allowances, and for nonexempt employees the regular and overtime rates and hours. Payroll records are kept six years. The damages are per workday: $50 a day up to $5,000 for wage notice violations and $250 a day up to $5,000 for wage statement violations (198(1-b), (1-d)).

The superset approach works: render every field any state requires on every statement, label earnings by kind (regular hours by rate, overtime by tier, each premium, each bonus, tips, service charges), and show hours and rates beside each hourly line. Check's guidance that "all of the information in the paystub JSON response" be rendered is the same rule from the provider's side. A statement that says "Overtime $139.00" without the hours and rate fails California's ninth item, and one that folds meal premiums into "Other" fails its first and fourth.

**Electronic statements.** Most employers deliver statements through a portal, and the states' rules on electronic delivery, consent and printing access differ. <!-- source-gap: wf-electronic-pay-statements | missing | State rules on electronic delivery of wage statements (consent, opt-out, printing access) for California, New York and other states | closes with: DLSE and NY DOL guidance on electronic wage statements, opened | checked: 2026-11-10 --> California's statute speaks of a detachable part of the check or a separate writing and allows a retained "copy" to be "a computer-generated record," but I haven't found its agency's or New York's guidance on electronic delivery among the sources I opened, so I state no rule here. My default: let the employee choose paper, keep proof of each delivery or posting, keep access for former employees, and render the same fields in both.

## Final Pay

Final pay deadlines depend on the state, the separation type, and sometimes the notice the employee gave and the time of day:

| State | Discharge or layoff | Quit with notice | Quit without notice | Source |
| --- | --- | --- | --- | --- |
| **California** | "immediately at the time of termination," including accrued vacation | With 72 hours' notice: "at the time of quitting" | "within 72 hours of quitting" | Labor Code 201, 202 (DLSE) |
| **Nevada** | "due and payable immediately" | By the regular payday or within 7 days, "whichever is earlier" | Same | NRS 608.020, 608.030 |
| **New York** | "not later than the regular pay day for the pay period during which the termination occurred" | Same | Same | Labor Law 191(3) |
| **Oregon** | By the end of the first business day after termination | With at least 48 hours' notice (excluding weekends and holidays): immediately | Within five business days or by the next regular payday, whichever comes first | ORS 652.140 |
| **Texas** | Not later than the sixth day after discharge | By the next regularly scheduled payday | Same | Labor Code 61.014 |
| **Washington** | "at the end of the established pay period" | Same | Same | RCW 49.48.010 |

California adds details that change the workflow: final pay by mail is allowed for a quitting employee who asks, and "The date of mailing will be considered the date of payment"; "The place of the final wage payment for employees who are terminated (or laid off) is the place of termination"; and seasonal workers in curing, canning or drying perishable fruit, fish or vegetables are paid within 72 hours of layoff. Oregon moves a weekend or holiday termination's deadline to the end of the first business day after. Gusto's note that some states require final wages within 24 hours reflects the same compression. <!-- source-gap: wf-final-pay-other-states | secondary | Final pay deadlines for states beyond CA, NV, NY, OR, TX and WA (for example Illinois, Massachusetts, Colorado, Minnesota) from primary sources | closes with: each state's statute or labor agency page (Illinois ilga.gov certificate error, mass.gov and CDLE 403 on Nov 9-10, 2026) | checked: 2026-11-10 --> I've only stated states whose statutes or agency pages I opened; vendor tables cover the rest but aren't sources.

## Waiting Time Penalties

Late final pay carries penalties measured in days of wages:

- **California (Labor Code 203).** If an employer willfully fails to pay, "the wages of the employee shall continue as a penalty from the due date thereof at the same rate until paid," but "shall not continue for more than 30 days." The DLSE describes it as "an amount equal to the employee's daily rate of pay for each day the wages remain unpaid," up to 30 calendar days. No penalty applies where "a good faith dispute exists concerning the amount of the wages due," but the employer must still pay what isn't disputed without demanding a release (Labor Code 206). An employee who hides to avoid payment gets no penalty for that time.
- **Oregon (ORS 652.150).** On a willful failure, wages continue "at the same hourly rate for eight hours per day until paid," for no more than 30 days. Without a written notice of nonpayment from the employee, the penalty "may not exceed 100 percent of the employee's unpaid wages"; with one, the cap applies only if the employer pays in full within 12 days of receiving it. The caps don't apply to an employer that violated the final pay rules in the prior year or terminated other employees on the same date.
- **Nevada (NRS 608.040).** Wages continue at the same rate until paid "or for 30 days, whichever is less."

### Worked Numbers: California

An invented California employee earns $25.00 an hour on a regular 8-hour day, a daily rate of $200.00, and is discharged on Friday, November 6, 2026. All wages, including accrued vacation, are due that day.

| Final check paid | Days late | Penalty |
| --- | --- | --- |
| Friday, November 6 | 0 | $0.00 |
| Friday, November 13 | 7 | 7 × $200.00 = $1,400.00 |
| Sunday, December 6 or later, or never | 30 (the cap) | 30 × $200.00 = $6,000.00 |

The penalty doesn't depend on how much was owed: a final check short by $45.00 of unpaid meal premiums, made up a week late, can carry the same $1,400.00 as a missing check if the failure was willful, because premiums are wages subject to the same timing rules (*Naranjo*). That's why the final pay calculation has to include every open premium event, unapproved timesheet and accrued vacation hour before the check is cut.

### Worked Numbers: Oregon

An invented Oregon employee paid $20.00 an hour is discharged on Monday, November 2, 2026; final wages of $300.00 are due by the end of Tuesday, November 3, and are paid on Friday, November 13, ten days late.

| Scenario | Penalty |
| --- | --- |
| Uncapped: 10 days × 8 hours × $20.00 | $1,600.00 |
| No written notice from the employee: capped at 100% of unpaid wages | $300.00 |
| Written notice received, and the employer still hadn't paid 12 days later | $1,600.00 (up to 30 days, $4,800.00) |
| The employer violated the final pay rules in the prior year | $1,600.00 |

## PTO Payout at Separation

Whether unused paid time off is paid at separation is mostly a matter of the employer's policy and state law, and California is the strict end: vacation "is considered wages, and vacation time is earned, or vests, as labor is performed," vested vacation "cannot be forfeited, even upon termination of employment, regardless of the reason," and it's paid at the final rate of pay, typically in the final paycheck (Labor Code 227.3, per the DLSE). Combined PTO plans are treated the same way; caps that stop accrual are allowed, use-it-or-lose-it isn't; and an employer can't recover unearned advanced vacation from the final paycheck. A worked example of my own: a California employee with 37.5 hours of accrued vacation and a final rate of $26.00 an hour is owed 37.5 × $26.00 = $975.00 in the final check, and leaving it out willfully exposes the employer to the waiting time penalty at the full daily rate, not a share of the $975.00. Accrual rules and other states' payout rules are in [Sick Leave & PTO Engines](/books/workforce/sick-leave-and-pto#payout-at-separation) in the Leave part. The federal regular rate excludes the payout ([The Regular Rate](/books/workforce/overtime-and-the-regular-rate#the-regular-rate)).

## Deductions From Final Pay

Final pay is where employers try to recover what's owed to them (an unreturned laptop, a loan balance, an advance), and the rules are tight:

- **Federal.** Wages must be paid "finally and unconditionally" or "free and clear," and a deduction for the employer's benefit, like a required tool or uniform, is a violation in any workweek when it "cuts into the minimum or overtime wages" owed (29 CFR 531.35). A deduction can't take the final week below the minimum wage for its hours.
- **State.** Many states go further. Washington makes it "unlawful for any employer to withhold or divert" wages except deductions required by law, agreed to by the employee under RCW 49.48.160, or for medical care under a rule (RCW 49.48.010). California bars recovering advanced vacation from final pay.
- **Overpayments.** Recovering an overpayment from final pay follows the same state limits, and some states allow none without written authorization ([Overpayments and Recovery](/books/workforce/retro-pay-voids-and-corrections#overpayments-and-recovery)).
- **Garnishments and benefits.** Court-ordered garnishments and active benefit deductions still apply to the final check according to their own rules; the off-cycle run has to decide which to apply (Check's `apply_benefits` and `apply_post_tax_deductions` flags).

The safe design treats every employer-benefit deduction on a final check as needing a written authorization on file, valid in that state, and a minimum wage check after it.

## The Final Pay Workflow

A termination starts a clock, and the payroll system owns it:

1. **The separation is recorded with its facts:** type (discharge, layoff, quit), the time it took effect, the last day worked, the notice the employee gave and when, the work location, and any request to receive pay by mail.
2. **The deadline is computed** from the state's rule for those facts, as a timestamp with the rule that set it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). California discharge: the termination itself. Oregon discharge on a Friday: the end of Monday.
3. **Everything owed is gathered:** unpaid hours (timesheets force-closed and approved), overtime and retro premium, break and scheduling premiums, commissions earned, accrued vacation where payable, and reimbursements.
4. **The run is chosen to meet the deadline.** A regular run if its check date is early enough; otherwise an off-cycle run (Gusto's dismissal payroll, Check's off-cycle), paid by a method that lands in time: a check handed over at termination, an instant payment, or same-day funds. A next-day ACH credit doesn't meet "immediately."
5. **Delivery is evidence.** The time the check was handed over, mailed (California counts mailing as payment for a quitting employee who asked) or the funds arrived, recorded against the deadline.
6. **Late is measured, not guessed.** If the deadline passes, the system computes days late and the penalty exposure under the state's rule, so the employer can pay the penalty voluntarily where the law expects it.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Payday rules check `pay_schedules`; statement requirements drive rendering and validation of `pay_statements`; final pay rules and computed deadlines hang off `employments`.

```sql
CREATE TABLE payday_rules (                -- the latest lawful check date, by state and class
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  worker_class        TEXT NOT NULL CHECK (worker_class IN ('any', 'manual', 'clerical',
                        'exempt', 'commission', 'hourly', 'salaried')),
  min_frequency       TEXT NOT NULL CHECK (min_frequency IN ('weekly', 'biweekly',
                        'semimonthly', 'monthly', 'every_35_days', 'none')),
  lag_rule            JSONB NOT NULL,        -- {"days_after_period_end": 7} or
                                             -- {"semimonthly": [{"earned": "1-15", "by_day": 26},
                                             --   {"earned": "16-end", "by_day": 10, "next_month": true}]}
  overtime_rule       TEXT,                  -- 'next_regular_payday'
  source_url          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE pay_statement_requirements (  -- what a statement must show, by state
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  field_code          TEXT NOT NULL,         -- 'gross', 'total_hours', 'piece_units',
                                             -- 'deductions', 'net', 'period_dates',
                                             -- 'employee_id_last4', 'employer_legal_name_address',
                                             -- 'rates_and_hours', 'overtime_rate', 'sick_balance', ...
  applies_to          TEXT NOT NULL DEFAULT 'all',   -- 'nonexempt', 'piece_rate', ...
  retention_years     SMALLINT,
  valid_during        DATERANGE NOT NULL,
  UNIQUE (jurisdiction_id, field_code, applies_to, valid_during)
);

ALTER TABLE pay_statements
  ADD COLUMN rendered_document_id   UUID REFERENCES documents (id),  -- what the employee received
  ADD COLUMN delivery_method        TEXT CHECK (delivery_method IN ('paper', 'portal', 'email')),
  ADD COLUMN delivered_at           TIMESTAMPTZ,
  ADD COLUMN requirements_checked   JSONB;   -- field codes required and present at render

ALTER TABLE employments
  ADD COLUMN separation_type        TEXT CHECK (separation_type IN ('discharge', 'layoff',
                                      'quit', 'mutual', 'death', 'end_of_assignment')),
  ADD COLUMN separation_effective_at TIMESTAMPTZ,
  ADD COLUMN notice_given_at        TIMESTAMPTZ,   -- the employee's notice of quitting
  ADD COLUMN pay_by_mail_requested  BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE final_pay_rules (             -- by state and separation facts, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  separation_type     TEXT NOT NULL,
  notice_condition    TEXT NOT NULL DEFAULT 'any' CHECK (notice_condition IN ('any',
                        'with_notice', 'without_notice')),
  notice_hours        SMALLINT,              -- 72 in CA, 48 business hours in OR
  deadline_rule       JSONB NOT NULL,        -- {"immediate": true}, {"business_days": 1},
                                             -- {"calendar_days": 6}, {"next_regular_payday": true},
                                             -- {"earliest_of": [...]}, {"end_of_pay_period": true}
  includes_vacation   BOOLEAN NOT NULL,
  penalty_rule        JSONB,                 -- {"per_day": "daily_rate", "max_days": 30} or
                                             -- {"per_day_hours": 8, "max_days": 30,
                                             --  "cap": "100pct_unpaid_unless_notice_unpaid_12d"}
  source_url          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE final_pay_deadlines (         -- computed once per separation, never typed
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employment_id       UUID NOT NULL REFERENCES employments (id),
  final_pay_rule_id   UUID NOT NULL REFERENCES final_pay_rules (id),
  due_at              TIMESTAMPTZ NOT NULL,
  pay_run_id          UUID REFERENCES pay_runs (id),     -- the regular or off-cycle run used
  paid_at             TIMESTAMPTZ,           -- handed over, mailed or funds available
  payment_method      TEXT,
  days_late           INT GENERATED ALWAYS AS
                        (GREATEST(0, CEIL(EXTRACT(EPOCH FROM (paid_at - due_at)) / 86400)::INT))
                        STORED,
  dispute_note        TEXT,                  -- a good-faith dispute, with the undisputed amount paid
  penalty_cents       BIGINT,                -- computed from the rule, paid or reserved
  written_notice_at   TIMESTAMPTZ,           -- Oregon's notice of nonpayment
  UNIQUE (employment_id)
);
```

Saving a pay schedule runs every period's check date against `payday_rules` for each worker class on it. Rendering a statement checks `pay_statement_requirements` for the work location's jurisdictions and refuses to finalize a statement missing a required field. Recording a separation computes `final_pay_deadlines.due_at` from the matching rule and the separation facts, and a monitor alerts as the deadline nears with the run, method and amount still open.

Design notes:

- **Deadlines are computed from facts and stored with their rule,** never typed by an administrator.
- **The final calculation sweeps everything open:** timesheets, premiums, retro, commissions and vacation.
- **Pick the payment method by the deadline,** and record when the money was actually available.
- **Render every field any state requires,** and check before release.
- **Deductions on a final check need authorization valid in that state** and a minimum wage check after them.

## Auditing

Pay timing and statement audits ask:

- **Every check date against the latest lawful date** for the period and the worker's class, and any late payment with its interest or damages.
- **Every statement as rendered and delivered,** with the requirements checked and the delivery evidence, kept for the longest applicable period (six years in New York).
- **Every separation's facts, computed deadline, run, method and paid time,** and the days late and penalty for any miss.
- **Disputes and undisputed amounts paid** where a good-faith dispute was claimed.
- **Final check deductions** with their authorizations and the minimum wage check.
- **Vacation payouts** at the final rate where the state requires them.

## What This Means for the System You Build

- **Validate every pay schedule against payday rules** by state and worker class, including New York's manual workers.
- **Render a superset statement** with hours and rates on every hourly line and premiums as their own lines.
- **Record separation facts precisely:** type, effective time, notice and location.
- **Compute the final pay deadline from those facts** and run an off-cycle payroll when the regular one is too late.
- **Sweep every open earning into the final check,** including premiums and vested vacation.
- **Measure lateness and penalty exposure automatically** under each state's rule.
- **Gate employer-benefit deductions on final pay** behind state-valid authorizations.

## References

**Law and regulation**

- [California Labor Code 203](https://california.public.law/codes/ca_lab_code_section_203), waiting time penalty wages for up to 30 days and the employee who avoids payment
- [California Labor Code 226](https://california.public.law/codes/ca_lab_code_section_226), the nine wage statement items, three-year retention, 21-day inspection and penalties up to $4,000
- [New York Labor Law 191: Frequency of payments](https://www.nysenate.gov/legislation/laws/LAB/191), weekly pay for manual workers, semimonthly for clerical and others, and final pay by the regular payday
- [New York Labor Law 195: Notice and record-keeping requirements](https://www.nysenate.gov/legislation/laws/LAB/195), the wage notice, the statement with each payment and six-year records
- [New York Labor Law 198: Costs, remedies](https://www.nysenate.gov/legislation/laws/LAB/198), liquidated damages, the lost-interest remedy for a first frequency violation, and notice and statement damages
- [Oregon Revised Statutes chapter 652](https://www.oregonlegislature.gov/bills_laws/ors/ors652.html), 652.120 paydays, 652.140 final pay and 652.150 penalty wages and caps
- [Nevada Revised Statutes chapter 608](https://www.leg.state.nv.us/nrs/nrs-608.html), 608.020 and 608.030 final pay and 608.040 the 30-day penalty
- [Texas Labor Code chapter 61](https://statutes.capitol.texas.gov/Docs/LA/htm/LA.61.htm), 61.011 payday frequency and 61.014 final pay
- [RCW 49.48.010: Payment of wages due to employee ceasing work](https://app.leg.wa.gov/RCW/default.aspx?cite=49.48.010), final pay at the end of the pay period and limits on deductions
- [29 CFR 531.35: "Free and clear" payment; "kickbacks"](https://www.law.cornell.edu/cfr/text/29/531.35), deductions that cut into minimum or overtime wages

**Agency guidance and forms**

- [DOL: Last paycheck](https://www.dol.gov/general/topic/wages/lastpaycheck), no federal requirement for immediate final pay
- [DOL WHD: State payday requirements](https://www.dol.gov/agencies/whd/state/payday), frequencies by state, revised January 1, 2023
- [California DLSE: Paydays, pay periods and final wages FAQ](https://www.dir.ca.gov/dlse/faq_paydays.htm), semimonthly due dates, final pay by separation type, waiting time penalties, mailing, place of payment and seasonal workers
- [California DLSE: Vacation FAQ](https://www.dir.ca.gov/dlse/faq_vacation.htm), vacation as vested wages, no forfeiture, payout at the final rate and no recovery of advanced vacation
- [California DLSE: Overtime FAQ](https://www.dir.ca.gov/dlse/faq_overtime.htm), overtime due by the next regular payday

**Courts and enforcement**

- [Supreme Court of California: Naranjo v. Spectrum Security Services, S258966 (PDF)](https://www4.courts.ca.gov/opinions/archive/S258966.PDF), break premiums as wages subject to timing and statement rules

**Vendor documentation**

- [Check: Paystubs](https://docs.checkhq.com/docs/paystubs.md), availability at approval, PDF and JSON, rendering all fields and custom info
- [Check: Off-cycle payroll](https://docs.checkhq.com/docs/off-cycle-payroll.md), final pay after the last day and its options
- [Gusto Embedded: Terminate a W-2 employee](https://docs.gusto.com/embedded-payroll/docs/terminate-a-w2-employee.md), the dismissal payroll and the 24-hour note
- [Gusto Embedded: Create an off-cycle payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls.md), off-cycle reasons and the final payroll flag
- [Gusto Embedded: Get an employee's pay stubs](https://docs.gusto.com/embedded-payroll/reference/get-v1-employees-employee_uuid-pay_stubs.md), pay stub fields
- [Zeal: API reference index](https://docs.zeal.com/llms.txt), pay stub PDF, link and report endpoints
