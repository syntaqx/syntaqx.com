+++
title = "Tipped Employees"
nav_title = "Tipped Employees"
description = "Tipped employees: the tip credit and state bans, tip pools and the manager rule, service charges, dual jobs, card fee deductions, payouts and records."
category = "Workforce Industry"
order = 2632
part = "Time and Wage-Hour"
tags = ["payroll", "tips", "tip-credit", "flsa", "restaurants", "wage-and-hour"]
+++

A tipped employee's wage is a sum the employer computes but doesn't fully pay. Under the FLSA, an employer may pay a server as little as $2.13 an hour in cash and count up to $5.12 an hour of the server's tips toward the $7.25 minimum, as long as the tips are really there, the employer told the server in advance, the server keeps all their tips except through a lawful pool, and the employer makes up any shortfall each workweek. Every one of those conditions is a record. Seven states and Guam don't allow the credit at all; others allow a smaller one; Hawaii allows $1.25 only if the employee's wages and tips together clear the minimum by $7.00. Meanwhile, a manager who takes a share of the pool breaks the rule for everyone in it, a mandatory service charge that looks like a tip is wages that enter the regular rate, and a server's hours rolling silverware may or may not be hours in the tipped occupation depending on a regulation that changed twice in four years.

This chapter covers who is a tipped employee, the tip credit and its notice, state rules and bans, overtime for tipped employees, dual jobs and the 80/20 history, tip pools and the manager rule, service charges, credit card fee deductions, tip payouts and the records. Taxes on tips (reporting, FICA, Form 8027, the section 45B credit and the 2025 qualified tips deduction) are in [Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions); restaurants as a payroll vertical are in [Payroll by Industry](/books/workforce/payroll-by-industry#restaurants-and-hospitality). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Point-of-sale and scheduling products collect and pool tips; payroll products tax them and check the credit. As of November 2026:

| Platform | Tip intake | Pooling | Wage-hour hooks |
| --- | --- | --- | --- |
| **Check** | `cash_tips`, "Tips that an employee has already received in cash," and `paycheck_tips`, "Tips that an employee has not yet received" | | Memo type `tip_credit_adjustment_to_minimum_wage`; the partner computes it |
| **Fourth** | | | Workforce management that "automates overtime calculations, tip credits," noting employers "must closely track tipped versus untipped labor to ensure compliance with tip credit rules" |
| **Gusto Embedded** | Cash Tips and Paycheck Tips earning types | | A Minimum Wage Adjustment earning, with tipped employees as the main use |
| **Homebase** | POS sync with Clover, Toast and Square, manual cash tips | "Evenly distribute tips based on hours tracked on your time clock and tips earned on your POS"; "Tip outs are automatically added to timesheets" | "Keep records of your tipping history and policy changes in case of wage disputes" |
| **7shifts** | Tip sources `CASH`, `CREDIT_CARD`, `DECLARED`, `AUTO_GRATUITY`, `TOTAL_PAYMENT` | Contribution by `POS_PERCENT_TIPS_AND_SALES` or `MANUAL_ENTRY`; distribution by `HOURS_WORKED`, `ROLE_PERCENT_HOURS_WORKED` or `POINTS`; stakeholders by role or department as contributors or recipients | Summary and detailed tip pool reports |
| **Square** | `declared_cash_tip_money` on each timecard; `tip_eligible` on the timecard's wage | | |
| **Toast** | `declaredCashTips`, `nonCashTips`, `tipsWithheld` (withheld from card tips), and automatic gratuity service charges in their own fields | | |
| **Zeal** | Cash Tips (taxed, not in net pay) and Charged Tips (taxed and in net pay) | | |

Two things stand out. 7shifts' sources list `AUTO_GRATUITY` beside tips, which is the right place to catch service charges before they're pooled as if they were tips; and its stakeholder model (roles and departments as contributors or recipients) is where the manager rule and the traditional-pool rule have to be enforced, because the law cares who is in the pool. Tip eligibility on the job (Square's `tip_eligible`) is the hook for dual jobs.

## Who Is a Tipped Employee

A tipped employee is "any employee engaged in an occupation in which he customarily and regularly receives more than $30 a month in tips" (29 USC 203(t)). The regulation adds that the test is the employee's own receipts in the occupation, full or part time; the month can be any recurring monthly period, not just a calendar month; and a new hire doesn't qualify just because others in the job do (29 CFR 531.56(a) to (c)). The $30 test is a gate for taking a tip credit, not a measure of its size (531.56(d)). Several states set a different threshold: DOL's tipped table shows more than $20 a month in Texas and Massachusetts and $135 a month in Pennsylvania.

## The Tip Credit

Section 3(m)(2)(A) sets the employer's cash wage for a tipped employee at "not less than the cash wage required to be paid such an employee on August 20, 1996," which DOL states as $2.13 an hour, and lets the employer count tips for the rest of the minimum: "The maximum tip credit that an employer can currently claim is $5.12 per hour" (Fact Sheet 15). Four conditions come with it:

- **Notice before the credit.** The employer must inform the employee of the cash wage, the tip credit amount (no more than $5.12), that the credit can't exceed the tips actually received, that the employee keeps all tips except through a valid pool among employees who customarily and regularly receive tips, and that the credit doesn't apply unless the employee has been told these things. Notice can be oral or written; my default is written, signed and stored as a document, because the employer has to prove it.
- **The credit can't exceed tips received.** The credit taken for a week is the smaller of the maximum credit for the hours and the tips the employee actually received.
- **The workweek is the test.** If cash wages plus tips don't reach $7.25 an hour for the workweek, "the employer must make up the difference."
- **The employee keeps the tips.** Section 3(m)(2)(B): "An employer may not keep tips received by its employees for any purposes," including allowing managers or supervisors to keep any portion, whether or not it takes a tip credit.

### Worked Numbers: Two Weeks

An invented server in a state that follows the federal rules works 30 hours a week at a $2.13 cash wage.

| | A good week | A slow week |
| --- | --- | --- |
| Minimum owed: 30 × $7.25 | $217.50 | $217.50 |
| Cash wage: 30 × $2.13 | $63.90 | $63.90 |
| Tips received | $180.00 | $120.00 |
| Maximum credit: 30 × $5.12 | $153.60 | $153.60 |
| Credit taken: the smaller of the maximum and tips | $153.60 | $120.00 |
| Cash wage plus credit | $217.50 | $183.90 |
| **Make-up owed** | **$0.00** | **$33.60** |

In the slow week the employer pays $63.90 + $33.60 = $97.50 in cash, which with $120.00 of tips is exactly $217.50. The make-up is its own earning line (Check's `tip_credit_adjustment_to_minimum_wage`, Gusto's Minimum Wage Adjustment), computed per workweek and never netted across weeks, and it's wages for tax like any other ([FICA on Tips and the Withholding Order](/books/workforce/tips-and-the-2025-deductions#fica-on-tips-and-the-withholding-order)).

### Overtime for Tipped Employees

A tipped employee's regular rate is the cash wage plus the tip credit taken (and any other includable pay), divided by hours worked; "Any tips received by the employee in excess of the tip credit need not be included in the regular rate" (29 CFR 531.60). The tip credit itself is capped at the minimum wage minus the cash wage, so it doesn't grow in overtime hours. For a server at $2.13 with the full $5.12 credit, the regular rate is $7.25, time and a half is $10.875, and the employer pays $10.875 − $5.12 = $5.755, about $5.76, in cash for each overtime hour. An engine that multiplies the $2.13 cash wage by 1.5 pays $3.20 an overtime hour and underpays $2.56 on every one.

## State Tip Credit Rules

States set their own cash wage and credit, and many ban the credit. From DOL's tipped table (November 5, 2026):

| State | Minimum | Max credit | Cash wage | Notes |
| --- | --- | --- | --- | --- |
| Alaska, California, Minnesota, Montana, Nevada, Oregon, Washington (and Guam) | State minimum | None | Full state minimum | No tip credit |
| District of Columbia | $18.40 | $8.10 | $10.30 | |
| Hawaii | $16.00 | $1.25 | $14.75 | Only if cash wage plus tips are at least $7.00 above the minimum |
| Illinois | $15.00 | 40% ($6.00) | $9.00 | |
| Massachusetts | $15.00 | $8.25 | $6.75 | Tipped at more than $20 a month |
| Arizona | $15.15 | $3.00 | $12.15 | |
| Colorado | $15.16 | $3.02 | $12.14 | More than $30 a month |
| Florida | $15.00 | $3.02 | $11.98 | More than $30 a month |
| Pennsylvania | $7.25 | $4.42 | $2.83 | $135 a month |
| Texas | $7.25 | $5.12 | $2.13 | More than $20 a month |

Hawaii's rule is the one that breaks a simple model, because the condition isn't the credit's size but the employee's total. A worked example of my own: a Hawaii server works 30 hours at the $14.75 cash wage and receives $150.00 in tips. The condition is cash wage plus tips of at least $16.00 + $7.00 = $23.00 an hour, so $690.00 for the week; $442.50 + $150.00 = $592.50 falls short, so no credit is allowed and the employer owes the full $16.00, a make-up of 30 × $1.25 = $37.50. With $300.00 of tips the total is $742.50, the condition holds, and the $1.25 credit stands. Local ordinances add more rows: cities with their own minimums often set their own tipped rates and phase-outs, and each is a row in the minimum wage table ([Minimum Wage as Data](/books/workforce/minimum-wage-as-data#tipped-youth-and-training-rates)).

## Dual Jobs and the 80/20 History

An employee can be a tipped employee in one job and not in another. The regulation's examples: a maintenance worker who also serves as a waiter "is a tipped employee only with respect to his employment as a waiter," and "no tip credit can be taken for his hours of employment in his occupation of maintenance man"; by contrast, a waitress "who spends part of her time cleaning and setting tables" is still in her tipped occupation, because related duties "need not by themselves be directed toward producing tips" (29 CFR 531.56(e)).

The hard question has always been how much non-tip-producing work a server can do before it stops being "related" and becomes a second job. The "80/20" rule, a limit on the share of a tipped employee's time spent on related duties that DOL applied in enforcement, was that line for years, and DOL's 2021 Dual Jobs Rule wrote limits on related duties into the regulation itself. <!-- source-gap: wf-80-20-history | missing | The 80/20 enforcement guidance's text and the 2021 Dual Jobs Rule's specific limits (20 percent of the workweek, 30 continuous minutes) | closes with: DOL Field Operations Handbook 30d00(f) history and the 2021 Dual Jobs final rule (86 FR, 2021) opened | checked: 2026-11-10 --> I haven't quoted the guidance or the 2021 rule's numbers here. A federal appeals court vacated the 2021 text on October 29, 2024, and DOL's technical amendment, "Tip Regulations Under the Fair Labor Standards Act (FLSA); Restoration of Regulatory Language" (89 FR 101884, published and effective December 17, 2024), restored the prior text as "a technical amendment accounting for changes in the law which have already occurred." The current 531.56(e) contains no percentage or time limit; its only numeric test is the $30 a month.

For a time system, that leaves two durable rules and one judgment:

- **Clock into the job.** Hours in a non-tipped occupation (the host shift, the maintenance shift, a cook's shift) are punched to that job, get no tip credit and are paid the full minimum or more in cash. Square's `tip_eligible` flag on the wage and job codes per time entry are the mechanism.
- **Weighted overtime across both jobs.** A server-and-cook week has two rates and one regular rate ([Two Rates in One Week](/books/workforce/overtime-and-the-regular-rate#two-rates-in-one-week)).
- **Related duties are a classification of the job's tasks,** decided by the employer with counsel under current law and state rules, and some states have their own limits. I would record the classification and its basis per job rather than build a timer that pretends the 2021 limits are still law.

## Tip Pools and the Manager Rule

Tip pooling is allowed; who's in the pool depends on whether the employer takes a tip credit:

- **With a tip credit (a traditional pool).** A required pool "may include only employees who 'customarily and regularly receive tips'" (29 CFR 531.54(c)(1)): servers, bussers, bartenders, bellhops. The employer "may not retain any of the employees' tips for any other purpose," and "must notify its employees of any required tip pool contribution amount" (531.54(c)(2)).
- **Without a tip credit (a nontraditional pool).** The pool may include "dishwashers, cooks, or other employees" outside tipped occupations, but only if every participant is paid at least the full minimum wage in cash (531.54(d); Fact Sheet 15).
- **Never the employer, managers or supervisors.** Employers, managers and supervisors may not receive tips from the pool in either case. A manager for this purpose is someone whose primary duty is managing, who "customarily and regularly directs the work of at least two or more other full-time employees," and who can hire or fire or whose recommendations carry particular weight; owners with at least a 20 percent equity interest who actively manage are covered too (Fact Sheet 15).- **Distributed by payday.** An employer that collects and redistributes tips must distribute them no later than the regular payday for the workweek in which they were collected, or as soon as practicable when the amount can't be known before payroll runs (531.54(b)(2)).

### Worked Numbers: An Hours-Based Pool

An invented restaurant takes a tip credit and requires servers to contribute 3% of their sales to a pool for bussers and bartenders, distributed by hours. In one week, servers' sales are $20,000.00, so the pool is $600.00. Recipients worked 100 hours: busser A 30, busser B 20 and the bartender 50.

| Recipient | Hours | Share at $6.00 an hour |
| --- | --- | --- |
| Busser A | 30 | $180.00 |
| Busser B | 20 | $120.00 |
| Bartender | 50 | $300.00 |
| **Total** | 100 | **$600.00** |

The servers' tips received for the credit are their tips net of the contribution, the recipients' tips include their shares, and each recipient's tip credit for the week is limited by their own tips received. Adding the kitchen manager, or a line cook while the restaurant takes a tip credit, invalidates the pool and the credit with it. Points-based distribution (7shifts' `POINTS`) or role weights (`ROLE_PERCENT_HOURS_WORKED`) are just different weights; the rules about who's in are the same.

## Service Charges Are Wages

A compulsory service charge "is not considered a tip under the FLSA" (Fact Sheet 15), whatever the receipt calls it: an 18% charge added to parties of eight, a delivery fee, a banquet charge. When the employer distributes it to staff, the distribution is wages paid by the employer: it counts toward the minimum wage and overtime, and "it must be included in the regular rate." The IRS reaches the same result for tax under Rev. Rul. 2012-18 ([Tips and Service Charges](/books/workforce/tips-and-the-2025-deductions#tips-and-service-charges)). An extra tip the customer adds on top of a service charge is still a tip, and still counts toward whether the employee is a tipped employee.

For the system, the service charge has to be separated at intake (Toast's automatic gratuity fields, 7shifts' `AUTO_GRATUITY` source), allocated to employees by the employer's stated method, and paid as a wage earning that is includable in the regular rate. Pooling it with tips and running it through a tip-credit calculation is the classic error, because it counts employer wages as the employee's tips.

## Credit Card Fees

When a tip is paid by card, the employer may deduct the processing fee's share of it, but the deduction "cannot reduce the amount of tips paid to the employee by any amount greater than the transactional fee," it can't push wages below the minimum, and the employee must be paid the tip by the regular payday; some states prohibit the deduction entirely (Fact Sheet 15). A worked example of my own: a customer pays a $200.00 check with a $40.00 tip on a card whose processor charges 3% of the transaction. The fee on the tip is 3% of $40.00 = $1.20, so the employer may pay the server $38.80 of the tip. Deducting a flat 5% "processing charge" from all card tips when the actual fee is 3% keeps employee tips, which section 3(m)(2)(B) forbids.

## Tip Payouts

Tips reach employees two ways. **Cash tips** are already in the employee's hands; payroll records them for tax and for the tip credit test but pays nothing (Check's `cash_tips`, Zeal's Cash Tips). **Charged tips** pass through the employer's card settlement and are paid out, either on the paycheck (Check's `paycheck_tips`, "Tips that an employee has not yet received") or in cash or on a pay card at the end of the shift and then recorded as already received. Either way the employee gets the full tip, net only of a lawful card fee share, by the regular payday for the workweek. A same-day payout program is a money movement with its own records: who was paid, how much, by what method, against which shift's tips. Pay cards and their wage-law rules are in [Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees) in the Moving the Money part.

## Tip Records

Employers taking a tip credit keep more than the standard 29 CFR 516.2 record. Fact Sheet 15 lists the additions: identification of each tipped employee, the tips each reports, the amount by which wages are deemed increased by tips (the credit taken), and hours worked and pay for both tipped and non-tipped work. Add the notice each employee received, the pool rules and contribution amounts in force, each pool's distribution with its inputs, and each service charge allocation. Homebase's advice to keep "your tipping history and policy changes in case of wage disputes" is the vendor version of the same list.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) and the tip tables in [Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions#how-to-build-it) (`tip_reports`, `tip_allocations` and the occupation codes). Tip credit rules are dated per jurisdiction; pools and shares record every distribution; service charge allocations keep employer wages out of tips. `job_assignments` gets tip eligibility and the notice.

```sql
CREATE TABLE tip_credit_rules (            -- per jurisdiction, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  credit_allowed      BOOLEAN NOT NULL,
  min_cash_wage       NUMERIC(10, 4),        -- $2.13 federal; null where no credit
  max_credit          NUMERIC(10, 4),        -- $5.12 federal
  max_credit_percent  NUMERIC(5, 2),         -- Illinois: 40%
  monthly_tip_threshold BIGINT,              -- cents: 3000 federal, 2000 TX and MA, 13500 PA
  total_above_minimum NUMERIC(10, 4),        -- Hawaii: wages plus tips at least $7.00 over
  card_fee_deduction  TEXT NOT NULL CHECK (card_fee_deduction IN ('actual_fee', 'prohibited')),
  source_url          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

ALTER TABLE job_assignments
  ADD COLUMN tip_eligible             BOOLEAN NOT NULL DEFAULT FALSE,  -- a tipped occupation
  ADD COLUMN tip_credit_notice_doc_id UUID REFERENCES documents (id),  -- the five-item notice
  ADD COLUMN related_duties_basis     TEXT;  -- the employer's classification of the job's tasks

CREATE TABLE tip_pools (                   -- a pool policy, with who may be in it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  work_location_id    UUID REFERENCES work_locations (id),
  pool_kind           TEXT NOT NULL CHECK (pool_kind IN ('traditional', 'nontraditional')),
  contribution_rule   JSONB NOT NULL,        -- {"basis": "sales", "percent": 3.0}
  distribution_rule   JSONB NOT NULL,        -- {"by": "hours"} or {"by": "points", ...}
  eligible_job_codes  TEXT[] NOT NULL,       -- checked: no managers; traditional = tip_eligible
  notice_document_id  UUID REFERENCES documents (id),   -- the contribution amount, as notified
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE tip_pool_shares (             -- one distribution, every input kept
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tip_pool_id         UUID NOT NULL REFERENCES tip_pools (id),
  workweek_start      DATE NOT NULL,
  pool_period         TSTZRANGE NOT NULL,    -- the shift, day or week pooled
  worker_id           UUID NOT NULL REFERENCES workers (id),
  role                TEXT NOT NULL CHECK (role IN ('contributor', 'recipient')),
  basis_value         NUMERIC(12, 2) NOT NULL,   -- sales, hours or points
  amount_cents        BIGINT NOT NULL,       -- negative for contributors
  pay_by              DATE NOT NULL,         -- the regular payday for the workweek
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  CHECK ((role = 'contributor') = (amount_cents <= 0))
);

CREATE TABLE service_charge_allocations (  -- employer wages, never tips
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  source_ref          TEXT NOT NULL,         -- the check or event the charge came from
  charge_cents        BIGINT NOT NULL,
  retained_cents      BIGINT NOT NULL,       -- what the employer kept, which it may
  worker_id           UUID NOT NULL REFERENCES workers (id),
  allocated_cents     BIGINT NOT NULL,
  method              TEXT NOT NULL,         -- the employer's stated allocation method
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id)  -- a wage line, in the regular rate
);
```

Each workweek the engine computes, per tipped worker: hours by job, tip-eligible hours, tips received (reports, net pool shares), the credit allowed by the rule (the smaller of the maximum for tip-eligible hours and tips received, with Hawaii's condition), cash wages paid, and the make-up line if cash plus credit falls short of the minimum for those hours. Non-tipped hours are checked against the full minimum with no credit. The regular rate reads cash wages, the credit taken and service charge wages, and never tips above the credit.

Design notes:

- **The pool's membership is validated when it's defined and when it's run:** no job code with a managerial assignment, and only tip-eligible jobs in a traditional pool.
- **Tips and service charges are different types from intake onward,** and only one of them can ever reach a tip credit.
- **The credit is computed, never configured as a fixed rate,** because it depends on tips received each week.
- **Notices are documents with versions,** and a worker without one on file gets no credit.

## Auditing

Tip audits ask about the credit, the pool and the money:

- **The tip credit per worker per workweek** with tip-eligible hours, tips received, the credit taken, cash wages and any make-up.
- **The notice each worker received,** with its date and version, before the first credit taken.
- **Pool definitions and every distribution,** with the inputs, the members and their jobs, and proof no manager or supervisor received a share.
- **Card fee deductions** against the processor's actual fee.
- **Service charge allocations** paid as wages and included in the regular rate.
- **Payout timing** against the regular payday for each workweek.

## What This Means for the System You Build

- **Compute the tip credit weekly** as the smaller of the maximum for tip-eligible hours and tips received, with a make-up line for any shortfall.
- **Keep the tip credit rules as dated data per jurisdiction,** including bans, percentages and Hawaii's total test.
- **Punch every hour to a job,** and give non-tipped jobs no credit.
- **Validate pool membership** against the credit and the manager rule every time a pool runs.
- **Separate service charges at intake** and pay them as wages in the regular rate.
- **Deduct card fees only at the actual rate** and pay tips by the regular payday.
- **Store the five-item notice** before taking any credit.

## References

**Law and regulation**

- [29 USC 203: Definitions](https://www.law.cornell.edu/uscode/text/29/203), section 3(m)(2)(A) and (B) on the tip credit and tips kept by employers, and 3(t) the tipped employee
- [29 CFR 531.54: Tip pooling](https://www.law.cornell.edu/cfr/text/29/531.54), traditional and nontraditional pools, notice of contribution amounts and distribution by the regular payday
- [29 CFR 531.56: More than $30 a month in tips](https://www.law.cornell.edu/cfr/text/29/531.56), the monthly test and dual jobs
- [29 CFR 531.60: Overtime payments](https://www.law.cornell.edu/cfr/text/29/531.60), the tip credit in the regular rate and tips beyond it excluded
- [Federal Register: Tip Regulations Under the FLSA; Restoration of Regulatory Language (89 FR 101884)](https://www.federalregister.gov/api/v1/documents/2024-29798.json), the October 29, 2024 vacatur and the December 17, 2024 technical amendment

**Agency guidance and forms**

- [DOL WHD: Fact Sheet 15, Tipped employees under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa), the cash wage and credit, the notice, pools, managers, card fees, service charges, dual jobs and records
- [DOL WHD: Minimum wages for tipped employees](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped), state cash wages, credits and thresholds as of November 5, 2026

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings), cash and paycheck tips and the tip credit adjustment
- [Fourth: Workforce management](https://www.fourth.com/solutions/workforce-management/), tip credit automation and tracking tipped and untipped labor
- [Gusto Embedded: Adjust for minimum wage](https://docs.gusto.com/embedded-payroll/docs/adjust-for-minimum-wage.md), the minimum wage adjustment for tipped employees
- [Gusto Embedded: Get earning types](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-earning_types.md), Cash Tips and Paycheck Tips
- [Homebase: Tip manager](https://joinhomebase.com/tip-manager/), hours-based distribution, POS sync, tip outs on timesheets and history for disputes
- [7shifts: Get tip pool settings](https://developers.7shifts.com/reference/gettippoolsettings.md), contribution and distribution types, stakeholders and tip sources
- [Square: Create timecard](https://developer.squareup.com/reference/square/labor-api/create-timecard), declared cash tips and tip eligibility on the wage
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), declared and noncash tips, tips withheld and automatic gratuity service charges
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), Cash Tips and Charged Tips
