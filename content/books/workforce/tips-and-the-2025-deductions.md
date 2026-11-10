+++
title = "Tips & the 2025 Tax Law"
nav_title = "Tips & the 2025 Tax Law"
description = "Tips in payroll: reporting, allocation and Form 8027, FICA on tips and the 45B credit, the P.L. 119-21 tips and overtime deductions, and the 2026 W-2 codes."
category = "Workforce Industry"
order = 2610
part = "Gross to Net"
tags = ["payroll", "tips", "overtime", "obbba", "w-2", "fica"]
+++

Tips are wages the employer never pays. A server's cash tips go into the server's pocket; charged tips pass through the employer's card settlement and come out on the paycheck; and both are wages for income tax, Social Security and Medicare once the employee reports them. The employer has to collect tax on money it never held, from the cash it does pay, in a set order, and report what it couldn't collect. A restaurant with more than ten employees on a typical day has to compare what its servers reported against 8% of its food and drink sales and allocate the difference. And since July 4, 2025, the same tips feed a new federal income tax deduction that the employee claims on their return but the employer has to support with new W-2 boxes: total cash tips in box 12 with code TP, and the employee's occupation in box 14b as a Treasury Tipped Occupation Code. The same law created a deduction for qualified overtime, which makes the FLSA overtime premium, a number most payroll systems never stored on its own, a W-2 amount in box 12 with code TT from 2026.

This chapter covers tips and service charges, tip reporting, cash and charged tips, FICA on tips and the withholding order, allocated tips and Form 8027, the section 45B credit, the qualified tips and overtime deductions under P.L. 119-21 (new IRC sections 224 and 225), what employers report for 2025 and 2026, and the overtime premium as payroll must track it. Tip credit, tip pools and the wage-hour side are in [Tipped Employees](/books/workforce/tipped-employees), and the regular rate is in [Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#the-regular-rate); restaurants as a payroll vertical are in [Payroll by Industry](/books/workforce/payroll-by-industry#restaurants-and-hospitality).

## How the Platforms Do It

Point-of-sale systems capture tips; payroll systems tax and report them. As of November 2026, from developer documentation:

| Platform | Role | How tips are modeled | Notes |
| --- | --- | --- | --- |
| **Check** | Payroll API | Earning types `cash_tips` ("taxed normally but excluded from net pay") and `paycheck_tips` (taxed and included in net pay); `tip_credit_adjustment_to_minimum_wage` as a memo-hours type | The split between tips the employee holds and tips the employer pays is in the type itself |
| **Gusto Embedded** | Payroll API | Default earning types Cash Tips and Paycheck Tips, plus Minimum Wage Adjustment | Custom earning types are returned separately from the defaults |
| **Square** | Point of sale and payroll | Timecards carry `declared_cash_tip_money`, "The cash tips declared by the team member for this timecard"; its Labor API is described as able to "Track declared cash tips" | Declared cash tips flow from the clock-out screen to payroll |
| **Toast** | Point of sale and payroll | Time entries carry `declaredCashTips`, `nonCashTips`, `nonCashTipsRoundingLoss`, `tipsWithheld` (a percentage withheld from card tips), and `cashGratuityServiceCharges` and `nonCashGratuityServiceCharges`, "Service charges applied as automatic gratuities" | Automatic gratuities are a separate field from tips, which matters because they're wages, not tips |
| **Zeal** | Payroll API | Earning components Cash Tips (excluded from net pay) and Charged Tips (included) | |

The common shape: **declared cash tips arrive from the time or point-of-sale record per shift, charged tips arrive from card settlement, and automatic gratuities arrive separately because they aren't tips at all.**

## Tips and Service Charges

The IRS's test for a tip comes from Rev. Rul. 2012-18, which lists four factors whose absence "creates a doubt as to whether a payment is a tip": "(1) the payment must be made free from compulsion; (2) the customer must have the unrestricted right to determine the amount; (3) the payment should not be the subject of negotiation or dictated by employer policy; (4) generally, the customer has the right to determine who receives the payment." The ruling's example is the one every restaurant meets: a menu that says "an 18% charge will be added to all bills for parties of 6 or more customers" makes that charge "not a tip." The IRS's tip page puts it in one line, "A payment is a tip only if the customer voluntarily decides to pay it and determines the amount," and its examples of service charges include digital payment prompts that require a tip greater than zero.

The difference drives everything downstream. "Service charges distributed to employees must be treated as wages to those employees": they are regular wages for withholding (Pub 15: "Service charges aren't tips; therefore, withhold taxes on service charges as you would on regular wages"), they don't count toward the 45B credit, they aren't "qualified tips" for the new deduction ("Mandatory service charges added to the bill are not qualified tips"), and under wage-hour law they belong to the employer and enter the regular rate when paid out. A point-of-sale field that separates automatic gratuities from tips, like Toast's, is the input a payroll system needs; a POS that lumps them together forces a manual split.

## Tip Reporting

Employees report tips to the employer, and the employer withholds on what's reported:

- **Monthly, by the 10th.** An employee reports the month's tips by the 10th of the following month; no report is required for a month with less than $20 of tips from one employer. Pub 531 notes the 10th moves when it falls on a weekend or legal holiday.
- **Contents.** The statement includes "The employee's name, address, and SSN," the employer's name and address, the month or period covered, and "The total of tips received during the month or period."
- **Forms are gone, the rule isn't.** Pub 531 says "Form 4070 and Form 4070A are historical": the Employee's Report of Tips to Employer and the daily tip record were withdrawn with Publication 1244, and the steps now live in Pub 531. Employers may set up electronic tip reporting (Treas. Reg. 31.6053-1(d)), which in practice means declared tips entered at clock-out and attested by the employee.
- **Timing for tax.** "Tips are considered to be paid at the time the employee reports them to you," so the report date, not the shift date, puts the tips in a pay period, a quarter and a year. A December tip reported on January 8 is next year's wages for withholding (Pub 531 addresses the W-2 for tips reported after year end but by January 10).
- **Noncash tips** (tickets, goods) aren't reported to the employer; they are the employee's to report on their return.

A daily declaration at clock-out satisfies the monthly rule more than adequately and gives the engine shift-level data the new W-2 occupation codes need. My rule is to store the declaration per shift and job, with the employee's attestation, and roll it up to the report.

## Cash and Charged Tips

**Cash tips** are already in the employee's hands. They are wages on the statement (`pays_cash = false` for the line), they raise every tax base, and their tax comes out of the employee's other pay. **Charged tips** (card tips, and tips through a pool the employer distributes) are collected by the employer through settlement and paid out on the paycheck or, in some restaurants, as cash at the end of the shift; on the statement they are a cash-paying earning line. For section 224, "cash tips" means both: the statute counts "tips paid in cash or charged" and, for employees, tips received under a tip-sharing arrangement, and Pub 15-T says the same. The distinction that matters for payroll is not cash versus card, it's whether the employer pays the tip through payroll (charged) or the employee already holds it (declared cash).

## FICA on Tips and the Withholding Order

Reported tips are wages for every federal employment tax, with a twist on collection. "You must collect federal income tax ..., employee social security tax, and employee Medicare tax on the employee's tips," and Additional Medicare applies once wages and tips exceed $200,000. The employer collects "from the employee's wages (excluding tips) or from other funds they make available," stops Social Security when wages and tips for 2026 reach $184,500, and owes its own Social Security and Medicare on the tips as if it had paid them. Tips of $20 or more a month reported in writing are also FUTA wages.

When the cash isn't enough, Pub 15 sets the order. "If, by the 10th of the month after the month for which you received an employee's report on tips, you don't have enough employee funds available to deduct the employee tax, you no longer have to collect it," and when funds are short:

1. "Withhold on regular wages and other compensation."
2. "Withhold social security and Medicare taxes on tips."
3. "Withhold income tax on tips."

Social Security and Medicare the employer couldn't collect go on the W-2 in box 12 with code A (Social Security) and code B (Medicare), are excluded from boxes 4 and 6, and appear as a negative adjustment on Form 941, line 9 (line 6 of Form 944); uncollected Additional Medicare isn't shown in box 12. Box 7 shows "the tips that the employee reported to you even if you did not have enough employee funds to collect," with box 3 plus box 7 capped at the 2026 base.

Income tax on tips is supplemental withholding: the employer may use 22% or aggregate if it withheld from the employee's regular wages in the current or prior year, or aggregate otherwise, and it may instead treat tips as regular wages. It never withholds from the tips themselves ("Don't withhold the income tax due on tips from employee tips").

A worked example of my own: a server in a state that allows the federal tip credit is paid a $2.13 cash wage for 70 hours in a biweekly period, $149.10, and reports $1,100.00 of cash tips; $900.00 of charged tips are paid through payroll. Wages for FICA are $149.10 + $1,100.00 + $900.00 = $2,149.10; Social Security $133.24 and Medicare $31.16, $164.40 in all. With flat 22% on the $2,000.00 of tips and a single W-4 producing $0.00 on $149.10 of regular wages, income tax is $440.00. The cash the employer pays is $149.10 + $900.00 = $1,049.10, so all $604.40 of tax is collectible and net pay is $444.70. If the server had no charged tips, the cash would be only $149.10, and the order decides what's collected: income tax on the regular wages is $0.00 and Social Security and Medicare on them are $9.24 and $2.16, leaving $137.70; Social Security and Medicare on the $1,100.00 of tips are $68.20 and $15.95, leaving $53.55; and only $53.55 of the $242.00 of income tax on the tips can be withheld, with net pay of $0.00 unless the server gives the employer cash by the 10th. With larger tips the Social Security and Medicare on tips run out of cash too, and the shortfall becomes the box 12 codes A and B amounts. The point of the order is that Social Security and Medicare are collected before income tax, because uncollected FICA has to be reported in box 12 and uncollected income tax simply isn't withheld.

## Allocated Tips and Form 8027

A large food or beverage establishment, one in the 50 states or DC that provides food or beverages for consumption on the premises, where tipping is customary, "and where there were normally more than 10 employees on a typical business day during the preceding year," files Form 8027 and allocates tips when reported tips fall short. Pub 531 gives the arithmetic: the tips allocated are the employee's share of "an amount figured by subtracting the reported tips of all employees from 8% (or an approved lower rate) of food and drink sales (other than carryout sales and sales with a service charge of 10% or more)," shared by "a method provided by an employer-employee agreement or a method provided by IRS regulations based on employees' sales or hours worked." Pub 15 names the three methods: "hours worked, gross receipts, or good-faith agreement."

Allocated tips are reported, not taxed by the employer: "don't withhold income, social security, or Medicare tax on allocated tips," and they go in box 8, not in boxes 1, 3, 5 or 7. The employee reports them on their return (with Form 4137 for Social Security and Medicare) unless they have records showing less.

A worked example of my own: a restaurant has $1,000,000.00 of qualifying food and drink sales for the year and its directly tipped employees reported $60,000.00 of tips. 8% of sales is $80,000.00, so $20,000.00 is allocated among the employees by the method the establishment uses (hours worked, gross receipts or a good-faith agreement), which Pub 15 points to the Instructions for Form 8027 for. The allocation is a period-end calculation over tip reports, sales and hours, with the method recorded, and it produces box 8 amounts and Form 8027 lines, not statement lines.

The Tip Rate Determination and Education Program offers voluntary agreements (TRDA and TRAC, and GITCA for casinos) that set tip rates and reporting procedures with the IRS; an employer in one has its agreement's terms as a rule set.

## The Section 45B Credit

Employers in tipped industries get some of their Social Security and Medicare on tips back as a business credit. Section 45B allows a credit equal to the "excess employer social security tax": the employer's section 3111 tax on tips deemed paid under section 3121(q), to the extent the tips exceed the amount by which the employee's non-tip wages for the month fall short of the minimum wage. The minimum wage is the FLSA section 6(a)(1) rate, determined without the tip credit, "and in the case of food or beverage establishments, as in effect on January 1, 2007," which was $5.15. P.L. 119-21 extended the credit beyond food and beverage service to "barbering and hair care, nail care, esthetics, and body and spa treatments," for taxable years beginning after December 31, 2024; those establishments use the current minimum wage, $7.25. An amount used for the credit can't also be deducted, and the employer may elect out for a year. The employer claims it on Form 8846.

A worked example of my own, for the server above over one month (two such periods): 140 hours at a $2.13 cash wage is $298.20 against $5.15 × 140 = $721.00, a $422.80 shortfall the tips are treated as filling. Of $4,000.00 of tips, $3,577.20 exceed it, and the credit is the employer's 7.65% on that, $273.66. For a nail salon technician with the same hours and tips, the reference rate is $7.25, so the shortfall is $1,015.00 − $298.20 = $716.80, the creditable tips $3,283.20, and the credit $251.16. Payroll's job is to supply per-employee, per-month tips, non-tip wages and hours by establishment type; the credit itself is computed for the employer's return.

## The Qualified Tips Deduction

Section 224, added by P.L. 119-21 section 70201, allows an individual a deduction for qualified tips "up to $25,000," reduced by $100 for each $1,000 of modified adjusted gross income over $150,000 ($300,000 on a joint return), for taxable years beginning after December 31, 2024 and not after December 31, 2028. The individual needs a valid SSN on the return, married individuals must file jointly, and the tips must appear on a statement the employer or payer furnishes (or on Form 4137); "An individual is not eligible to claim the tip deduction under section 224 if the individual is not furnished such a statement," as Notice 2025-62 puts it.

Qualified tips are cash tips received in an occupation that "customarily and regularly received tips on or before December 31, 2024," and only if the payment is voluntary with no consequence for nonpayment, isn't negotiated, is determined by the payor, and isn't received in a specified service trade or business (an employee is treated as in an SSTB if the employer's business is one). The deduction is income tax only: "Tips are still generally subject to both the employer share and employee share of social security tax and Medicare tax." Employees can reduce withholding for the expected deduction through Step 4(b) of the 2026 W-4 ([Worksheet 1A, Worked](/books/workforce/federal-withholding#worksheet-1a-worked)).

## The Qualified Overtime Deduction

Section 225, added by section 70202, allows a deduction for qualified overtime compensation up to $12,500 ($25,000 joint), with the same $100 per $1,000 phase-out above $150,000 ($300,000 joint) and the same years. Qualified overtime compensation is "overtime compensation paid to an individual required under section 7 of the Fair Labor Standards Act of 1938" that exceeds the regular rate: the premium, not the whole overtime pay. The IRS's Q&A gives the boundaries:

- **Only the FLSA-required premium.** "the 'half' in 'one and one-half times'" is qualified. Pay to someone who isn't eligible for FLSA overtime doesn't qualify, even if a collective bargaining agreement or another law requires it.
- **Not more than the FLSA requires.** If an employer pays double time, only the half-time portion the FLSA requires counts.
- **Not tips.** Qualified tips aren't qualified overtime compensation.
- **Still wages.** "Overtime compensation is still generally subject to both the employer share and employee share of social security tax and Medicare tax."

Worked examples of my own, for a nonexempt employee whose regular rate is $20.00:

| Situation | Paid for the hours | Qualified overtime |
| --- | --- | --- |
| 10 hours over 40 in a workweek at time and a half | 10 × $30.00 = $300.00 | 10 × $10.00 = **$100.00** |
| The same 10 hours at double time by company policy | 10 × $40.00 = $400.00 | **$100.00** (only the FLSA half) |
| 4 hours over 8 in a day in California, in a 36-hour week | 4 × $30.00 = $120.00 | **$0.00** (required by state law, not FLSA section 7) |
| A week of 44 hours with 2 California daily overtime hours on one day | 4 hours over 40 and 2 daily hours overlap | Only the hours over 40 count, at $10.00 each |
| A $500 nondiscretionary quarterly bonus raises the regular rate by $0.80 for weeks with overtime | Retro overtime of $0.40 × overtime hours in each week | The retro premium is qualified, paid when the bonus is paid |

The last row is why this is hard: the FLSA premium depends on the regular rate, which includes nondiscretionary bonuses, shift differentials and other pay (see [The Overtime Premium as Payroll Must Track It](#the-overtime-premium-as-payroll-must-track-it) below, and [Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate)). A system that stores only "overtime pay" can't produce code TT.

## What Employers Report

**For 2025, transition relief.** Notice 2025-62 (November 5, 2025) says the IRS "will not impose a penalty under section 6721 or 6722" for 2025 if an employer fails to report separately "the total amount of cash tips reported by the employee under section 6053(a) or the occupation described in section 224(d)(1)," or a payer fails to separately account for cash tips and occupations on Forms 1099 and 1099-K, provided the return is otherwise complete and correct (the tips are still in total wages). The IRS "has already announced that Forms W-2 and 1099 for taxable year 2025 will not be updated." For overtime, "employers and other payers are not required to report qualified overtime compensation separately" for 2025, and may use box 14, an online portal or a separate statement.

**For 2026, the new W-2.** The 2026 General Instructions for Forms W-2 and W-3 add:

- **Box 12, code TP:** "Report the total amount of cash tips reported to the employer," with an occupation code in box 14b.
- **Box 12, code TT:** total qualified overtime compensation, only "the 'half' portion" of time and a half required under FLSA section 7.
- **Box 12, code TA:** employer contributions to a Trump account; "Beginning July 4, 2026, employers may contribute up to $2,500 a year, toward the $5,000 contribution limit."
- **Box 14 split.** "Box 14 has been split into box 14a and box 14b"; 14a is the old "Other," and 14b holds "the Treasury Tipped Occupation Code(s) if cash tips are reported in box 12 with code TP." "Enter up to two code(s) based on the occupation(s) that the tips were received in," any two if there were more, and "If any tips were received in a nonqualifying occupation, then '000' must be input as one of the occupation code(s)."

The Treasury Tipped Occupation Codes are three digits in eight groups (page last updated June 28, 2026): beverage and food service 101 to 110 (101 bartenders, 102 wait staff), entertainment and events 201 to 211, hospitality and guest services 301 to 304, home services 401 to 409, personal services 501 to 510, personal appearance and wellness 601 to 611 (603 barbers, hairdressers, hairstylists and cosmetologists), recreation and instruction 701 to 706, and transportation and delivery 801 to 810 (802 taxi and rideshare drivers and chauffeurs, 804 goods delivery people).

The occupation is per job, not per worker. A restaurant employee who tends bar some shifts (101) and waits tables others (102) needs both codes; one who also works a nonqualifying role where they received tips needs 000 as one of the two. That means `job_assignments` carries a tipped occupation code, tips are attributed to the job they were received in, and the W-2 build picks the codes from the year's tip lines. Payers reporting nonemployee tips on 1099s have the parallel requirement under sections 6041 and 6050W.

## The Overtime Premium as Payroll Must Track It

To produce code TT, the engine has to compute, for every workweek, the overtime that FLSA section 7 required, at the regular rate, separately from overtime paid for any other reason. The pieces:

- **The FLSA workweek and hours over 40,** separate from state daily or seventh-day overtime and from contractual overtime (after 8 in a day, on Sundays, on holidays).
- **The regular rate,** total includable compensation for the workweek divided by total hours, including nondiscretionary bonuses, shift differentials, commissions and the like, with the 29 USC 207(e) exclusions.
- **The premium,** half the regular rate times FLSA overtime hours (the straight-time part of overtime is regular pay), with retroactive premium when a bonus is later allocated back to the weeks it was earned in.
- **The weekly maximum,** so overtime paid at a higher multiple or for non-FLSA reasons isn't counted.

A worked example of my own: a week of 46 hours, 4 of them over 8 on Saturday under a union contract, at $22.00 with a $1.00 night differential for 10 hours. Includable pay is 46 × $22.00 + 10 × $1.00 = $1,022.00; the regular rate is $1,022.00 / 46 = $22.2174; FLSA overtime is 6 hours over 40, and the qualified premium is 6 × $11.1087 = $66.65. The contract's Saturday overtime overlaps those hours; whatever the contract pays above time and a half on them is not qualified. The engine stores, per workweek, FLSA overtime hours, the regular rate, the required premium and the premium paid, and code TT is the year's sum of the required premium actually paid. [Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#the-regular-rate) owns the regular rate rules; the healthcare 8 and 80 system, which replaces the workweek with a 14-day period, is in [Payroll by Industry](/books/workforce/payroll-by-industry#healthcare).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `job_assignments` gets the occupation code; `time_entries` can carry a shift's declared tips; new tables hold tip reports, allocations, the occupation catalog and the weekly overtime premium.

```sql
CREATE TABLE tipped_occupation_codes (      -- Treasury Tipped Occupation Codes
  code                CHAR(3) PRIMARY KEY,  -- '101', '102', ..., '000' for nonqualifying
  group_name          TEXT NOT NULL,        -- 'Beverage and food service', ...
  title               TEXT NOT NULL,
  soc_code            TEXT,                 -- the 2018 SOC code each maps to
  valid_during        DATERANGE NOT NULL
);

ALTER TABLE job_assignments
  ADD COLUMN tipped_occupation_code CHAR(3) REFERENCES tipped_occupation_codes (code),
  ADD COLUMN establishment_kind TEXT CHECK (establishment_kind IN ('food_beverage',
                                'beauty_services', 'other'));   -- the 45B reference wage

ALTER TABLE time_entries
  ADD COLUMN declared_cash_tips BIGINT,     -- cents, from the clock-out declaration
  ADD COLUMN charged_tips       BIGINT,     -- from card settlement, if allocated per shift
  ADD COLUMN auto_gratuities    BIGINT;     -- service charges: wages, never tips

CREATE TABLE tip_reports (                  -- the employee's report, as made
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  job_assignment_id   UUID NOT NULL REFERENCES job_assignments (id),
  tip_period          DATERANGE NOT NULL,   -- the shift, day or month the tips were received in
  reported_on         DATE NOT NULL,        -- the date tips are treated as paid
  cash_tips           BIGINT NOT NULL DEFAULT 0,
  charged_tips        BIGINT NOT NULL DEFAULT 0,
  tip_share_received  BIGINT NOT NULL DEFAULT 0,   -- from a tip-sharing arrangement
  source              TEXT NOT NULL CHECK (source IN ('pos_declaration', 'electronic_form',
                        'paper', 'import')),
  attestation_document_id UUID REFERENCES documents (id),
  pay_statement_id    UUID REFERENCES pay_statements (id)   -- the run that taxed it
);

CREATE TABLE tip_allocations (              -- Form 8027 allocations at a large establishment
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  establishment_ref   TEXT NOT NULL,        -- the Form 8027 establishment
  period              DATERANGE NOT NULL,   -- the year or payroll period allocated
  qualifying_sales    BIGINT NOT NULL,      -- food and drink, excluding carryout and 10%+ charges
  tip_rate_bp         INT NOT NULL DEFAULT 800,     -- 8%, or an approved lower rate
  reported_tips       BIGINT NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('hours_worked', 'gross_receipts',
                        'good_faith_agreement')),
  agreement_document_id UUID REFERENCES documents (id),
  shortfall           BIGINT GENERATED ALWAYS AS
                        (GREATEST(qualifying_sales * tip_rate_bp / 10000 - reported_tips, 0)) STORED,
  per_worker          JSONB NOT NULL        -- worker id to allocated cents, feeding W-2 box 8
);

CREATE TABLE qualified_overtime_amounts (   -- the FLSA premium per workweek, for code TT
  worker_id           UUID NOT NULL REFERENCES workers (id),
  workweek_start      DATE NOT NULL,
  flsa_overtime_hours NUMERIC(7, 2) NOT NULL,   -- hours over 40 (or the 7(j) period's rule)
  regular_rate        NUMERIC(12, 4) NOT NULL,
  required_premium    BIGINT NOT NULL,      -- half the regular rate x FLSA overtime hours
  premium_paid        BIGINT NOT NULL,      -- what the statements actually paid as premium
  qualified_amount    BIGINT GENERATED ALWAYS AS (LEAST(required_premium, premium_paid)) STORED,
  pay_statement_line_ids UUID[] NOT NULL,   -- including later retro premium lines
  calculation_run_id  UUID REFERENCES calculation_runs (id),
  PRIMARY KEY (worker_id, workweek_start)
);
```

The W-2 build reads them: box 12 TP is the year's sum of `tip_reports` cash and charged tips taxed in the year; box 14b is the distinct `tipped_occupation_code` values of the jobs those tips were reported under, two at most, with `000` forced when any job's code is nonqualifying; box 12 TT is the sum of `qualified_amount` for workweeks whose premium was paid in the year; box 8 comes from `tip_allocations.per_worker`. Year-End, W-2s & Wage Reporting in the Payroll Tax part owns the rest of the W-2.

Design notes:

- **Tips belong to a job and a report date.** Attribution by job is what makes occupation codes correct for multi-role workers; the report date is what puts the tips in a pay period and a year.
- **Service charges are never tips in the schema.** A separate column and pay item type for automatic gratuities stops them reaching TP, the 45B credit, or the qualified tips deduction.
- **The withholding order is a rule over lines.** The engine applies Pub 15's order when cash is short, writes what it collected, and records uncollected Social Security and Medicare on tips as memo lines that feed box 12 codes A and B and the 941's line 9 adjustment.
- **The premium is computed, not inferred.** `qualified_overtime_amounts` is written by the overtime calculation per workweek, with retro lines appended when a bonus is allocated back, so TT is a sum, not an estimate.

## Auditing

Tips are a perennial IRS examination topic, and the new deductions add a second reader (the employee's return) for each W-2 box:

- **Every tip report as made,** with its date, source and attestation, and the statement that taxed it.
- **The withholding order applied** on short-cash statements, and the uncollected amounts with codes A and B.
- **Form 8027 inputs:** qualifying sales, reported tips, the rate, the method and the allocation per employee.
- **Occupation codes by job and date,** and the W-2 codes chosen from them.
- **The overtime premium per workweek** with its regular rate and hours, so TT can be recomputed, and the distinction between FLSA, state and contractual overtime.
- **For 2025, what was furnished voluntarily** (portal statements, box 14 notes) under Notice 2025-62's encouragement, since employees will rely on it ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).

## What This Means for the System You Build

- **Separate tips from service charges at intake,** and keep automatic gratuities as wages forever after.
- **Store tip declarations per shift and job** with the report date that makes them wages.
- **Apply Pub 15's withholding order on short cash,** and carry uncollected FICA to box 12 codes A and B.
- **Compute allocated tips as a period-end calculation** with its method, feeding box 8, never statement lines.
- **Give every job a tipped occupation code** and build box 14b from the jobs tips were received in, with 000 when required.
- **Compute the FLSA overtime premium per workweek** on the regular rate, separately from state and contractual overtime, and sum it into code TT.
- **Feed the 45B credit** with monthly tips, wages and hours by establishment kind.

## References

**Law and regulation**

- [26 USC 224](https://www.law.cornell.edu/uscode/text/26/224), the qualified tips deduction: $25,000, the phase-out, qualified tips, the SSTB exclusion, the SSN and joint return requirements and the end after 2028
- [26 USC 225](https://www.law.cornell.edu/uscode/text/26/225), the qualified overtime deduction: $12,500 and $25,000, the phase-out, FLSA section 7 overtime, the tips exclusion and the end after 2028
- [26 USC 45B](https://www.law.cornell.edu/uscode/text/26/45B), the credit for employer Social Security and Medicare on tips, the January 1, 2007 minimum wage for food or beverage, the beauty services added by P.L. 119-21, denial of double benefit and the election out

**Agency guidance and forms**

- [IRS: Notice 2025-62 (PDF)](https://www.irs.gov/pub/irs-drop/n-25-62.pdf), the new reporting requirements under sections 6041, 6041A, 6050W and 6051, and 2025 transition penalty relief
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), box 7, box 8, box 12 codes A, B, TP, TT and TA, and boxes 14a and 14b
- [IRS: Treasury Tipped Occupation Codes](https://www.irs.gov/tippedoccupations), the code groups and codes
- [IRS: Questions and answers about the new deduction for qualified overtime compensation](https://www.irs.gov/newsroom/questions-and-answers-about-the-new-deduction-for-qualified-overtime-compensation), the FLSA section 7 premium, double time, ineligible workers and 2025 reporting
- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), tips: reporting, collecting taxes, the ordering rule, allocated tips and large food or beverage establishments, FUTA on tips, tips as supplemental wages, service charges as regular wages, and Rev. Rul. 2012-18
- [IRS: Publication 15-T (2026), Federal Income Tax Withholding Methods (PDF)](https://www.irs.gov/pub/irs-pdf/p15t.pdf), withholding on qualified tips and overtime, mandatory service charges and continued FICA
- [IRS: Publication 531 (Rev. December 2024), Reporting Tip Income (PDF)](https://www.irs.gov/pub/irs-pdf/p531.pdf), Forms 4070 and 4070A as historical, reporting by the 10th, the $20 rule and the 8% allocation
- [IRS: Internal Revenue Bulletin 2012-26 (Rev. Rul. 2012-18)](https://www.irs.gov/irb/2012-26_IRB), the four tip factors and service charges as wages
- [IRS: Tip recordkeeping and reporting](https://www.irs.gov/businesses/small-businesses-self-employed/tip-recordkeeping-and-reporting), the one-line tip test and service charges as wages
- [DOL WHD: History of federal minimum wage rates](https://www.dol.gov/agencies/whd/minimum-wage/history/chart), $5.15 in effect on January 1, 2007

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), `cash_tips`, `paycheck_tips` and the tip credit memo type
- [Gusto Embedded: Get earning types](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-earning_types.md), Cash Tips, Paycheck Tips and Minimum Wage Adjustment
- [Square: Timecard object](https://developer.squareup.com/reference/square/objects/Timecard), `declared_cash_tip_money`
- [Square: Labor API overview](https://developer.squareup.com/docs/labor-api/what-it-does), tracking declared cash tips for payroll
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), declared cash tips, noncash tips, tips withheld and automatic gratuity service charges
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), Cash Tips and Charged Tips
