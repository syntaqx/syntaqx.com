+++
title = "Deposits, Returns & the Tax Calendar"
nav_title = "Deposits & Returns"
description = "The lookback period, monthly and semiweekly deposits, the $100,000 next-day rule, EFTPS, Forms 941, 944, 943 and 940, penalties, and the tax calendar as data."
category = "Workforce Industry"
order = 2614
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "deposits", "form-941", "eftps", "penalties"]
+++

A pay run creates tax liabilities on its check date, and from that moment a clock runs that the employer's own history set two years earlier. Federal employment taxes (income tax withheld plus both halves of Social Security and Medicare) are deposited monthly or semiweekly depending on what the employer reported in a lookback period, or by the next business day if a single day's liability reaches $100,000; they are reported quarterly on Form 941 (or annually on 944 or 943) with a record of when each liability arose; FUTA runs on its own quarterly schedule and annual Form 940; and every state and many cities run their own schedules on top. The IRS penalizes a deposit one day late, a deposit made the wrong way, and a return whose liability record doesn't match its total, and it charges the penalty on the employer even when a payroll provider was supposed to make the deposit.

This chapter covers the rules as a payroll system must compute them: determining the deposit schedule, the monthly and semiweekly due dates with the business day and holiday rules, the next-day rule and its permanent schedule change, payment with the return, the accuracy of deposits rule and makeup dates, EFTPS and its cutoffs, Forms 941, 944, 943 and 940 with Schedule B and a 941 reconciled line by line, the failure-to-deposit penalty tiers and how deposits are applied, state deposit schedules, and the payroll tax calendar as data. The rates and wage bases behind the liabilities are in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta); who is allowed to deposit and file for the employer, and who stays liable, is in [Who Runs Payroll: Agents & Liability](/books/workforce/who-runs-payroll); corrections to filed returns are in [Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts); how the money is collected from the employer before it is deposited is in the Moving the Money part.

## How the Platforms Do It

What embedded payroll APIs and tax filing services publish about deposits, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **ADP SmartCompliance Employment Tax** | Filing and remittance service | Outsourced post-payroll tax work for "payroll, ERP and in-house systems," with reports for "filings, deposits, amendments, and notices" and specialists for quarter- and year-end filing and remittance |
| **Check** | Embedded payroll API | A Tax Deposit is created "When a company approves a payroll," without a `due_date`; for deposits "due more often than quarterly," the due date is populated "within 1 business day," and for quarterly or annual ones "in the second week of the first month of the next quarter"; `funding_status` (funded, pending, failed) and `deposit_status` (deposited, pending) are separate, and "Check will only send out payments for a Tax Deposit if it is `funded`" |
| **Gusto Embedded** | Embedded payroll API | A company's federal tax details carry `deposit_schedule` ("Semiweekly" or "Monthly") and `filing_form` ("941" or "944") with an `effective_date`; state deposit schedules are effective-dated requirement sets whose options include Semi-weekly, Monthly and Quarterly |
| **MasterTax** (ADP) | Filing and remittance software | Payroll tax and compliance services "covering more than 10,000 tax jurisdictions," from in-house software to outsourcing a client's payroll tax function |

Two things stand out. **The deposit and the money are separate states.** Check never lets a deposit be `deposited` while its funding is `pending` or `failed`, which is the provider protecting itself: it won't pay the IRS with money the employer hasn't delivered. The employer still owes the deposit on its date, so a failed client debit becomes the employer's late deposit, which is why the funding chapters and this one share a calendar. **The schedule is an effective-dated attribute of the employer, decided by data.** Gusto stores the federal schedule and form with an effective date; the right value is computed from the lookback period and changed by the next-day rule mid-year, never typed in once at onboarding and forgotten. My rule is that the system computes the schedule each year from filed returns, stores the computation, and shows the employer the CP136 notice comparison when the IRS sends one.

## The Deposit Schedule

**What is deposited.** Federal income tax withheld and "both the employer and employee social security and Medicare taxes," all by electronic funds transfer: "You must use EFT to make all federal tax deposits." FUTA is separate and follows its own rule. Form 945 liabilities (backup withholding and other nonpayroll withholding) are never combined with 941 deposits, and an employer with farm and nonfarm workers treats 943 and 941 taxes separately for every deposit rule.

**Which schedule.** "Before the beginning of each calendar year, you must determine which of the two deposit schedules you're required to use," from the total taxes reported on Form 941 line 12 during the lookback period. For a 941 filer the lookback period for 2026 is July 1, 2024 through June 30, 2025. "If you reported $50,000 or less of taxes for the lookback period, you're a monthly schedule depositor; if you reported more than $50,000, you're a semiweekly schedule depositor." The schedule "isn't determined by how often you pay your employees." For Form 943 and 944 filers (or a 941 filer that filed a 944 in either lookback year), the lookback period is the second preceding calendar year, 2024 for 2026. New employers' lookback quarters before the business existed count as zero, so they are monthly depositors for their first calendar year (941 filers) or first two (943, 944 and 945 filers), subject to the next-day rule.

**Adjustments don't count.** "Adjustments made on Form 941-X... don't affect the amount of tax liability for previous periods for purposes of the lookback rule." Pub 15's example is an employer that reported $45,000 and later found a $10,000 understatement in a lookback quarter: it stays monthly, because the lookback uses "the amounts originally reported."

### Worked Numbers: Determining the Schedule

An invented 941 filer reported these line 12 totals:

| Quarter | Form 941 line 12 | In the 2026 lookback? | In the 2027 lookback? |
| --- | --- | --- | --- |
| Q3 2024 | $11,000 | Yes | |
| Q4 2024 | $12,500 | Yes | |
| Q1 2025 | $13,000 | Yes | |
| Q2 2025 | $14,000 | Yes | |
| Q3 2025 | $10,500 | | Yes |
| Q4 2025 | $12,000 | | Yes |
| Q1 2026 | $13,000 | | Yes |
| Q2 2026 | $14,000 | | Yes |
| **Total** | | **$50,500: semiweekly for 2026** | **$49,500: monthly for 2027** |

Two traps sit in this table. The 2026 determination is $500 over the line, so a single quarter's $1,000 late filing or amendment can't flip it; only originally reported amounts count. And the 2027 schedule is knowable on July 1, 2026, not January 1, 2027: the system can compute it as soon as the Q2 2026 return is filed and tell the client in the fall. The IRS sends a CP136 notice when an employer's deposit requirements for the next year "may differ"; the employer is told to compare the notice's amounts with its own records and, if they differ, to "determine the correct deposit schedule yourself." A notice showing zero for a quarter means the IRS has no record of that return.

## When Deposits Are Due

**Monthly.** "Deposit employment taxes on payments made during a month by the 15th day of the following month." Monthly depositors report their liability by month on Form 941 line 16.

**Semiweekly.** "Deposit employment taxes for payments made on Wednesday, Thursday, and/or Friday by the following Wednesday. Deposit taxes for payments made on Saturday, Sunday, Monday, and/or Tuesday by the following Friday." The deposit periods are Wednesday through Friday and Saturday through Tuesday, and semiweekly depositors file Schedule B (Form 941) with daily liabilities. If one semiweekly period has pay dates in two quarters, each quarter's liability is a separate deposit: Pub 15's example has paydays on Wednesday, September 30, 2026 and Friday, October 2, 2026, two deposits, both due Wednesday, October 7, 2026.

**Liability is cash basis.** "Your tax liability is based on the dates payments were made or wages were paid," not when wages were earned or accrued. The check date of a pay run is the liability date; a run approved on Monday with a Friday check date creates a Friday liability.

**Business days and holidays.** "If a deposit is required to be made on a day that isn't a business day, the deposit is considered timely if it is made by the close of the next business day," where a business day excludes Saturdays, Sundays and legal holidays, and "legal holiday" means a legal holiday in the District of Columbia; "a statewide legal holiday doesn't delay the due date of federal tax deposits." Semiweekly depositors get one more rule: they "have at least 3 business days following the close of the semiweekly period," so each legal holiday in the three weekdays after the period adds a day. Pub 15 lists the 2026 legal holidays, including DC Emancipation Day on April 16, Juneteenth, Independence Day observed on July 3, Thanksgiving on November 26 and Christmas on December 25.

![A two-week timeline of semiweekly deposit periods. Paydays Wednesday to Friday form one deposit period, due the following Wednesday; paydays Saturday to Tuesday form the next, due the following Friday. A Thanksgiving week example shows a Saturday to Tuesday period whose Friday due date moves to Monday because Thursday is a legal holiday, and a $100,000 day due the next business day.](/diagrams/wf-semiweekly-deposits.svg "Semiweekly deposits run on fixed weekly periods, not paydays. Each period gets at least three business days after it closes, so a holiday in those days pushes the due date out, and a $100,000 day overrides the period entirely.")

### Worked Numbers: Due Dates in November and December 2026

Invented paydays for a semiweekly depositor, with the 2026 calendar:

| Payday | Deposit period | Rule | Due |
| --- | --- | --- | --- |
| Friday, November 13 | Wed Nov 11 to Fri Nov 13 | Following Wednesday | Wednesday, November 18 |
| Friday, November 20 | Wed Nov 18 to Fri Nov 20 | Following Wednesday | Wednesday, November 25 |
| Tuesday, November 24 | Sat Nov 21 to Tue Nov 24 | Following Friday; Thursday November 26 is a legal holiday inside the three weekdays, so one more day | Monday, November 30 |
| Wednesday, December 23 | Wed Dec 23 to Fri Dec 25 | Following Wednesday; the three weekdays after Friday (Dec 28 to 30) have no holiday | Wednesday, December 30 |

For a monthly depositor, October 2026's liabilities are due November 15, a Sunday, so the deposit is timely on Monday, November 16. Veterans Day, Wednesday November 11, is a legal holiday, and a monthly deposit due on a holiday moves the same way.

## The $100,000 Next-Day Rule

"If you accumulate $100,000 or more in taxes on any day during a monthly or semiweekly deposit period..., you must deposit the tax by the next business day," measured "before you consider any reduction of your liability for nonrefundable credits." Three mechanics:

- **Accumulation stops at the period boundary.** A semiweekly depositor with $95,000 on a Tuesday and $10,000 on Wednesday doesn't trigger the rule, because Wednesday starts a new period; it deposits $95,000 by Friday and $10,000 by the next Wednesday.
- **After a trigger, accumulation restarts the next day.** Pub 15's Fir Co. accumulates $110,000 on Monday (due Tuesday) and $30,000 on Tuesday, which isn't added to the $110,000 and follows the regular semiweekly rule (due Friday).
- **A monthly depositor that triggers it changes schedule.** It "become[s] a semiweekly schedule depositor on the next day and remain[s] so for at least the rest of the calendar year and for the following calendar year." Pub 15's Elm, Inc. starts business on May 4, 2026, accumulates $40,000 on Wednesday, May 6 and $60,000 on Friday, May 8, hits $100,000 on May 8, deposits by Monday, May 11, and is semiweekly from May 9 through 2027.

### Worked Numbers: A Monthly Depositor's Bonus Month

An invented monthly depositor pays regular payroll every Friday in December 2026, with about $18,000 of federal taxes each, and a year-end bonus run on Tuesday, December 15 with $85,000 of taxes.

| Date | Liability | Accumulated in December | Consequence |
| --- | --- | --- | --- |
| Friday, December 4 | $18,000 | $18,000 | Monthly: due January 15, 2027 |
| Friday, December 11 | $18,000 | $36,000 | Monthly |
| Tuesday, December 15 | $85,000 | $121,000 | $100,000 reached: deposit $121,000 by Wednesday, December 16; semiweekly from December 16 |
| Friday, December 18 | $18,000 | | Semiweekly: due Wednesday, December 23 |

For a monthly depositor the deposit period is the month, so the bonus day's accumulation includes the earlier December paydays; the whole $121,000 is due the next business day. From December 16 the employer is semiweekly for the rest of 2026 and all of 2027, files Schedule B for Q4 2026, and the system must re-date every open December liability. A bonus run scheduled without this check is the most common way a small employer gets its first failure-to-deposit penalty.

## Paying With the Return, and the Accuracy of Deposits Rule

**Payment with the return** is allowed instead of depositing when the quarter's line 12 liability (or the prior quarter's) is less than $2,500 and no next-day obligation arose in the quarter; when a monthly depositor makes a payment under the accuracy of deposits rule (which "may be $2,500 or more"); and for annual filers under parallel rules (Form 944 has a fourth-quarter variant). "If you're unsure that your total tax liability for the current quarter will be less than $2,500," the advice is to deposit anyway.

**Accuracy of deposits.** Employers must deposit 100% of the liability, but no penalty applies to a shortfall that "doesn't exceed the greater of $100 or 2% of the amount of taxes otherwise required to be deposited" and is made up by the makeup date. For monthly depositors, that is the return's due date. For semiweekly depositors, the earlier of "the first Wednesday or Friday (whichever comes first) that falls on or after the 15th day of the month following the month in which the shortfall occurred" or the return's due date.

### Worked Numbers: A Shortfall

An invented semiweekly depositor owes $40,000 for a November 2026 payday and deposits $39,300, a $700 shortfall. The tolerance is the greater of $100 or 2% of $40,000 ($800), so $700 qualifies. The makeup date is the first Wednesday or Friday on or after December 15, 2026, a Tuesday, so Wednesday, December 16, which is before the Q4 return's due date. A $900 shortfall exceeds the tolerance and is a late deposit of $900 from the original due date. The tolerance is per deposit, so the system computes it per liability, not per quarter.

## How Deposits Are Made: EFTPS

Deposits are made through EFTPS, IRS Direct Pay or the IRS business tax account, or by "your tax professional, financial institution, payroll service, or other trusted third party." A new employer that indicated a federal tax obligation when it got its EIN is pre-enrolled in EFTPS and receives a PIN by mail, and Pub 15 tells it to tell its provider about the enrollment. Each successful payment gets an EFT Trace Number, which "can be used as a receipt or to trace the payment."

The cutoffs are what a scheduler has to respect: EFTPS "accepts same day payments of $1 million or less if the payment is submitted before 3:00 p.m. Eastern time on a business day," and a payment over $1 million "must" be submitted "by 8:00 p.m. Eastern time the day before the date the deposit is due." A third party "may have different cutoff times." When an EFTPS deadline is missed, the fallback is a same-day wire through the Federal Tax Collection Service, arranged with the employer's bank ahead of time. Overpayments are taken on the return, refunded (now by direct deposit) or applied to the next return; employers shouldn't "ask EFTPS to request a refund."

For a provider depositing for thousands of employers, the practical schedule is: liabilities computed at approval, due dates computed from each employer's schedule and the federal holiday calendar, payments initiated the business day before the due date for anything over $1 million and by early afternoon Eastern on the due date otherwise, with the EFT number stored on the `remittances` row and matched to the liabilities it satisfies. EFTPS enrollment, and how an employer verifies the deposits a provider makes for it, are covered in [Who Runs Payroll: Agents & Liability](/books/workforce/who-runs-payroll).

## The Returns

**Form 941** is filed quarterly by every employer that pays wages subject to withholding or FICA, "even if you have no taxes to report," unless it has filed a final return, has written notice to file Form 944, or is a seasonal employer with no wages in a quarter (which checks line 18 on every return it files). It is due the last day of the month after the quarter (April 30, July 31, October 31, January 31), or the 10th of the second month if every deposit was made on time. One return per EIN per quarter: "Employers with multiple locations or divisions must file only one Form 941 per quarter." The March 2026 revision adds an "Aggregate Return Filers Only" section that section 3504 agents, CPEOs and other third parties complete, and refunds now go by direct deposit.

**Form 944** is the annual return for the smallest employers, filed only with "written notice from the IRS"; an employer whose expected annual employment taxes are $1,000 or less may request it during the first calendar quarter, and a 944 filer may ask to file 941s instead the same way. **Form 943** is the annual return for farmworkers' wages, required beginning with the first year an employer pays $2,500 or more for farmwork or a farmworker meets the $150 test. Forms 943, 944 and 945 for 2025 were due February 2, 2026, or February 10 if all deposits were timely. **Form 940** reports FUTA annually with the same February dates for 2025, and Schedule A for credit reduction and multi-state employers ([FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#futa)).

**The record of liability.** Monthly depositors enter their liability by month on line 16; semiweekly depositors complete Schedule B with liabilities on the dates employees were paid. The IRS checks this record against the deposits to compute penalties, and if it's missing or wrong for an employer whose line 12 is $2,500 or more, it may assess an "averaged" penalty of 2% to 10% by spreading the quarter's liability "equally throughout the tax period" and applying deposits in date order. Pub 15's checklist is a test suite for any return generator: report liabilities, not deposits; the line 16 or Schedule B total must equal line 12; no negative amounts; and prior-period errors go on Form 941-X, not into this quarter's Schedule B. A CP207 notice says a Schedule B or line 16 "contains missing or incorrect information" and asks for a corrected record within 45 days.

**Penalties on returns.** Failure to file is 5% of the unpaid tax per month or part of a month, up to 25%; failure to pay is 0.5% per month, also capped at 25%; when both apply in a month, the failure-to-file penalty is reduced by the failure-to-pay penalty.

### Worked Numbers: A 941 Reconciled Line by Line

An invented employer's fourth quarter of 2026. Its records: $300,000 of gross wages, of which $15,000 are 401(k) deferrals (out of income tax wages, in FICA wages); $10,000 of the quarter's wages belong to employees already past the Social Security base; one executive's wages over $200,000 this quarter total $20,000; income tax withheld of $36,000; and the per-payment rounding of employee FICA came to $1.12 less than the quarter's wages times the rates.

| Line | What | Computation | Amount |
| --- | --- | --- | --- |
| 2 | Wages, tips and other compensation | $300,000 − $15,000 deferrals | $285,000.00 |
| 3 | Federal income tax withheld | from statement lines | $36,000.00 |
| 5a | Taxable Social Security wages | $300,000 − $10,000 over the base, × 0.124 | $35,960.00 |
| 5c | Taxable Medicare wages and tips | $300,000 × 0.029 | $8,700.00 |
| 5d | Wages subject to Additional Medicare | $20,000 × 0.009 | $180.00 |
| 5e | Total Social Security and Medicare | 5a + 5b + 5c + 5d | $44,840.00 |
| 6 | Total taxes before adjustments | 3 + 5e + 5f | $80,840.00 |
| 7 | Fractions of cents | withheld less than computed | −$1.12 |
| 10 | Total taxes after adjustments | 6 + 7 + 8 + 9 | $80,838.88 |
| 11 | Nonrefundable credits | none | $0.00 |
| 12 | Total taxes after adjustments and credits | 10 − 11 | $80,838.88 |
| 13 | Total deposits | from `remittances` | $80,838.88 |
| 14 | Balance due | | $0.00 |
| Schedule B | Total liability for the quarter | sum of daily liabilities | $80,838.88 |

Every amount comes from a sum over `pay_statement_lines` for the quarter's check dates: line 2 from income tax wages, line 3 from income tax lines, 5a and 5c from `taxable_wages` on Social Security and Medicare lines, and Schedule B from the same lines grouped by check date. Three checks fail loudly when something is wrong. Line 2 lower than 5c is expected (deferrals); line 5a over 12.4% of the wage base times the headcount is impossible. Line 5c's tax isn't twice the Medicare withheld, because 5d has no employer half. And the Schedule B total equals line 12 only if the record of liability includes the fractions-of-cents adjustment: Pub 15 says current period adjustments don't change the record, because the record already reflects "the actual amounts you withheld," so the daily liabilities sum to $80,838.88 when they are built from actual withholding, and to $80,840.00 if they were built from line 6. Building Schedule B from the same rounded tax lines that were deposited is what makes the two agree by construction.

## Failure-to-Deposit Penalties

For amounts "not properly or timely deposited," the penalty rates are:

| Penalty | Charged for |
| --- | --- |
| 2% | Deposits made 1 to 5 days late |
| 5% | Deposits made 6 to 15 days late |
| 10% | Deposits made 16 or more days late, but before 10 days from the date of the first IRS notice asking for the tax |
| 10% | Amounts that should have been deposited but were paid directly to the IRS or with the return |
| 15% | Amounts still unpaid more than 10 days after the first notice, or the day notice and demand for immediate payment is received, whichever is earlier |

Days are "calendar days, starting from the due date of the liability." Penalties don't apply for reasonable cause and not willful neglect; the IRS may also waive them for an inadvertent failure in the first quarter an employer had to deposit, or the first deposit after its frequency changed, for employers within the net worth and size limits of section 7430 (for businesses, net worth up to $7 million and no more than 500 employees), and the first time an employer sends a deposit to the IRS instead of by EFT. Abatement requests and first-time abatement are in [Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts#penalty-relief). Behind all of it sits the trust fund recovery penalty, "100% of the unpaid trust fund tax," on responsible persons who acted willfully.

**How deposits are applied.** "Deposits are generally applied to the most recent tax liability within the quarter." That rule turns one missed deposit into a cascade unless the employer acts: Pub 15's Cedar, Inc. skips a $1,000 deposit due April 15 and deposits $2,000 on May 15 against a $1,500 May liability; $1,500 goes to May and $500 to April, so $500 of April stays undeposited and keeps accruing tiers. On receiving a penalty notice, the employer "may designate how your deposits are to be applied in order to minimize the amount of the penalty if you do so within 90 days of the date of the notice" (Rev. Proc. 2001-58, which Pub 15 cites).

### Worked Numbers: Penalty Tiers

An invented $20,000 semiweekly deposit due Wednesday, November 25, 2026:

| Deposited | Calendar days late | Rate | Penalty |
| --- | --- | --- | --- |
| Monday, November 30 | 5 | 2% | $400 |
| Thursday, December 3 | 8 | 5% | $1,000 |
| Monday, December 14 | 19 | 10% | $2,000 |
| Paid with the Q4 Form 941 | n/a | 10% | $2,000 |
| Unpaid 10 days after the first notice | n/a | 15% | $3,000 |

A provider that runs one day behind on a large client's deposit costs the client 2% of it immediately. Interest and the failure-to-pay penalty are separate, and the penalties attach to the employer's account whatever its service agreement says, so the provider's contract has to say who pays them.

## State Deposit Schedules and Returns

States and localities run their own calendars for income tax withholding, unemployment, disability and local taxes, often keyed to the federal schedule or to the size of the employer's withholding. Two examples show the range:

- **California.** Personal income tax and disability withholding are deposited on schedules that depend on the employer's withholding; "You may be required to submit deposits more frequently if you withhold more than $350 in Personal Income Tax." California's 2026 monthly deposit (DE 88) dates are January 15, February 17, March 16, April 15, May 15, June 15, July 15, August 17, September 15, October 15, November 16 and December 15, and the quarterly reports (DE 9 and DE 9C) are delinquent if not filed by February 2, April 30, July 31 and November 2, 2026 and February 1, 2027.
- **Philadelphia.** Wage tax is paid quarterly under $350 a month of withholding, monthly from $350 to $16,000, and semi-monthly or weekly at $16,000 or more, and "The Wage Tax must be filed quarterly."

Most states also require quarterly unemployment wage reports by worker, annual withholding reconciliations and their own W-2 filing, which [Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s) covers; state and local rates and registrations are in [State & Local Payroll Taxes](/books/workforce/state-and-local-tax). The schedule each agency assigned an employer is one more `tax_registrations.deposit_frequency` with a `valid_during`, and Gusto's requirement sets show the same: a Georgia deposit schedule with two effective-dated entries in one year.
<!-- source-gap: wf-state-deposit-thresholds | missing | California's semiweekly and next-banking-day deposit thresholds and their tie to the federal schedule | closes with: California EDD DE 44 employer guide, deposit requirements table | checked: 2026-11-09 -->

## The Tax Calendar as Data

Every date in this chapter is computable from four inputs: the employer's schedules by agency and year, the check date of each run, the business day and holiday calendar of each agency, and the rule. The tax calendar is therefore not a spreadsheet the operations team maintains but a projection: liabilities generate deposit events, quarter and year ends generate return events, the lookback generates a schedule determination event each July, and each event carries the rule that dated it. The scheduler then works backward from each event to its operational deadlines: the client debit that must settle before the deposit ([Check Date Math and Holidays](/books/workforce/funding-a-payroll#check-date-math-and-holidays)), the EFTPS submission cutoff, and the return's review window. A schedule change re-dates only open events; a filed return's events are history.

The calendar also has to answer "what will be due" for runs that haven't happened: a client planning a bonus needs to know whether it will trigger next-day deposit and a schedule change, and the system can answer by running the deposit rules over the planned liabilities before approval.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `employers.deposit_schedule` and `deposit_schedule_year` stay as the current value for display; the authority is a determination per year with its inputs. Liabilities are dated by the rule and carry it in `rule_ref`; deposit events and return events share one calendar table; penalties are their own rows because they are assessed, designated and abated separately from the tax.

```sql
-- One determination per employer, return family and year, with its evidence.
CREATE TABLE deposit_schedule_determinations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  return_family       TEXT NOT NULL CHECK (return_family IN ('941', '943', '944', '945')),
  schedule_year       SMALLINT NOT NULL,
  lookback_period     DATERANGE NOT NULL,    -- [2024-07-01,2025-07-01) for a 2026 941 filer
  lookback_total      BIGINT NOT NULL,       -- cents, as originally reported (no X-form adjustments)
  lookback_filing_ids UUID[] NOT NULL,       -- the filings summed
  schedule            TEXT NOT NULL CHECK (schedule IN ('monthly', 'semiweekly')),
  reason              TEXT NOT NULL CHECK (reason IN ('lookback', 'new_employer',
                        'next_day_trigger', 'irs_notice')),
  effective_during    DATERANGE NOT NULL,    -- a trigger starts mid-year and runs through next year
  trigger_liability_id UUID REFERENCES liabilities (id),   -- the $100,000 day, when that's why
  notice_id           UUID REFERENCES notices (id),        -- a CP136 compared against
  determined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING GIST (employer_id WITH =, return_family WITH =, effective_during WITH &&)
);

-- Every dated obligation: deposits, returns, reports, determinations.
CREATE TABLE tax_calendar_events (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  kind                TEXT NOT NULL CHECK (kind IN ('deposit', 'return', 'wage_report',
                        'reconciliation', 'schedule_determination', 'voluntary_contribution')),
  tax_type            TEXT,                  -- 'federal_941', 'futa', 'sui', 'state_withholding', ...
  period              DATERANGE NOT NULL,    -- the deposit period or return period covered
  due_on              DATE NOT NULL,
  rule_ref            TEXT NOT NULL,         -- 'semiweekly_sat_tue+holiday', 'next_day', 'monthly_15th', ...
  operational_deadline_at TIMESTAMPTZ,       -- e.g. EFTPS submission cutoff for this amount
  amount              BIGINT,                -- for deposits: sum of the liabilities in it
  filing_id           UUID REFERENCES filings (id),
  status              TEXT NOT NULL CHECK (status IN ('open', 'satisfied', 'late', 'waived',
                        'canceled')),
  satisfied_at        TIMESTAMPTZ
);

CREATE TABLE tax_calendar_event_liabilities (   -- which liabilities a deposit event covers
  event_id            UUID NOT NULL REFERENCES tax_calendar_events (id),
  liability_id        UUID NOT NULL REFERENCES liabilities (id),
  PRIMARY KEY (event_id, liability_id)
);

-- A penalty as assessed or computed, separate from the tax.
CREATE TABLE deposit_penalties (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  event_id            UUID NOT NULL REFERENCES tax_calendar_events (id),
  source              TEXT NOT NULL CHECK (source IN ('projected', 'assessed')),
  days_late           INT,                   -- calendar days from the due date
  tier                TEXT NOT NULL CHECK (tier IN ('2pct', '5pct', '10pct', '10pct_not_deposited',
                        '15pct', 'averaged')),
  base_amount         BIGINT NOT NULL,       -- cents not timely deposited
  penalty_amount      BIGINT NOT NULL,
  notice_id           UUID REFERENCES notices (id),
  designation_due_on  DATE,                  -- 90 days from the notice date
  responsible_party   TEXT CHECK (responsible_party IN ('employer', 'provider', 'shared')),
  status              TEXT NOT NULL CHECK (status IN ('projected', 'assessed', 'designated',
                        'abatement_requested', 'abated', 'paid'))
);

-- The $100,000 check: accumulated liability within each deposit period, by day.
-- Run before approving a run, over open plus planned liabilities.
WITH daily AS (
  SELECT li.employer_id,
         CASE WHEN d.schedule = 'monthly'
              THEN daterange(date_trunc('month', r.check_date)::DATE,
                             (date_trunc('month', r.check_date) + INTERVAL '1 month')::DATE)
              ELSE semiweekly_period(r.check_date)   -- helper: the Wed-Fri or Sat-Tue range
         END AS deposit_period,
         r.check_date,
         SUM(li.amount) AS day_amount
  FROM liabilities li
  JOIN pay_runs r ON r.id = li.pay_run_id
  JOIN deposit_schedule_determinations d
    ON d.employer_id = li.employer_id AND d.return_family = '941'
   AND d.effective_during @> r.check_date
  WHERE li.tax_type = 'federal_941' AND li.status <> 'canceled'
  GROUP BY 1, 2, 3
)
SELECT employer_id, deposit_period, check_date,
       SUM(day_amount) OVER (PARTITION BY employer_id, deposit_period
                             ORDER BY check_date) AS accumulated
FROM daily;
-- The first row where accumulated >= 10000000 (cents) triggers next-day; a real
-- implementation restarts the running sum the day after each trigger.
```

Design notes:

- **Compute the due date at approval and store it with its rule.** `liabilities.due_on` and the deposit event's `rule_ref` let an operator explain any date, and a schedule change re-dates open liabilities only ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **The holiday calendar is data, by agency.** Federal deposits use DC legal holidays; states and cities have their own. Load each year's holidays as rows and test the three-business-day rule against them; an engine that hard-codes "next Wednesday" fails Thanksgiving week.
- **Split liabilities that cross a quarter inside one deposit period.** The deposit event is per quarter per period, so the Wednesday-September and Friday-October paydays become two events with the same due date.
- **The next-day rule is a running sum that resets.** Reset at each deposit period boundary and after each trigger day; then promote the employer with a new determination effective the next day through the end of the following year.
- **One deposit, many liabilities, one EFT number.** A `remittances` row satisfies the event's liabilities; store the EFT Trace Number and reconcile the deposit amount to the sum of the liabilities, including partial deposits under the accuracy rule.
- **Generate Schedule B from the tax lines, not from deposits.** Daily liabilities by check date, from the same rounded lines that were deposited, so Schedule B equals line 12 by construction.
- **Project penalties before they are assessed.** When a deposit misses its date, write a projected penalty with the tier the calendar implies; when the notice arrives, match it, compute the best designation within 90 days, and decide who pays under the service agreement ([Reconciliation](/docs/money/payment-states#reconciliation)).

## Auditing

Deposit and return records are what the IRS compares, what penalty notices dispute, and what a client asks for when a provider fails. Keep:

- **Each year's schedule determination** with the lookback filings and totals, and every mid-year change with the liability that triggered it.
- **Every liability's due date and rule**, and every re-dating with the reason.
- **The remittance for each deposit**: initiated time, amount, EFT Trace Number, settlement, and the liabilities it satisfied.
- **The record of liability as filed** (line 16 or Schedule B) and the statement lines it was built from.
- **Penalty notices, projections, designations and abatement requests**, with who bore the cost.
- **The holiday calendars** used, per agency and year, so a due date can be recomputed.

## What This Means for the System You Build

- **Compute the deposit schedule every year from originally reported 941 line 12 totals,** store the determination, and compare it with the CP136 when one arrives.
- **Date liabilities by check date, schedule and an agency holiday calendar,** with the three-business-day rule for semiweekly depositors, and store the rule with the date.
- **Run the $100,000 test before approving any run,** including planned bonuses, and promote the employer the next day through the following year.
- **Keep funding and deposit status separate,** but tie both to the same due date so a failed debit surfaces as a deposit at risk.
- **Respect EFTPS cutoffs by amount:** before 3:00 p.m. Eastern on the due date up to $1 million, by 8:00 p.m. Eastern the day before above it.
- **Build Schedule B from the deposited tax lines** so it equals line 12, and reconcile every 941 line to a query over statement lines.
- **Project penalties and designate deposits within 90 days** of a notice; make the contract say who pays.
- **Model state and local schedules as effective-dated registrations,** with their own calendars and thresholds.

## References

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), deposit schedules and the lookback period, new employers, semiweekly periods spanning quarters, business days and 2026 legal holidays, the $100,000 next-day rule and its examples, payment with return, the accuracy of deposits rule and makeup dates, EFTPS and same-day wire, failure-to-deposit tiers and waivers, order of application, averaged penalties, the trust fund recovery penalty, Forms 941, 943, 944 and 945, return penalties and current period adjustments
- [IRS: Instructions for Form 941 (Rev. March 2026)](https://www.irs.gov/instructions/i941), lines 1 to 18, due dates, the $2,500 and line 16 rules, the aggregate filer section and 2026 changes
- [IRS: Instructions for Form 940 (2025)](https://www.irs.gov/instructions/i940), FUTA return due dates and Schedule A
- [IRS: Understanding your CP136 notice](https://www.irs.gov/individuals/understanding-your-cp136-notice), next year's deposit schedule from the lookback period and missing returns
- [IRS: Understanding your CP207 notice](https://www.irs.gov/individuals/understanding-your-cp207-notice), a record of federal tax liability with missing or incorrect information, and 45 days to correct it
- [California EDD: Payroll tax due dates calendar](https://edd.ca.gov/en/payroll_taxes/Due_Dates_Calendar/), the $350 threshold, 2026 DE 88 deposit dates and DE 9 and DE 9C delinquency dates
- [City of Philadelphia: Wage Tax for employers](https://www.phila.gov/services/payments-assistance-taxes/business-taxes/wage-tax-employers/), payment frequency by monthly withholding and quarterly filing

**Vendor documentation**

- [ADP: SmartCompliance Employment Tax](https://apps.adp.com/en/apps/623571/adp-smartcompliance-employment-tax), filings, deposits, amendments, notices and quarter- and year-end processing
- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), creation at approval, due date rules, funding and deposit status, and voids
- [Gusto Embedded: Get a company's federal tax details](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-federal_tax_details.md), deposit schedule, filing form and effective date
- [Gusto Embedded: Get tax requirements for a state](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_uuid-tax_requirements-state.md), effective-dated state deposit schedules

**In practice**

- [Accounting Today: ADP acquires MasterTax (October 8, 2010)](https://www.accountingtoday.com/news/adp-acquires-mastertax), MasterTax's scope and clients
