+++
title = "Federal Withholding & the W-4"
nav_title = "Federal Withholding"
description = "Federal income tax withholding: the 2020+ and legacy W-4, Pub 15-T 2026 percentage and wage bracket methods worked, exemptions, nonresidents and lock-ins."
category = "Workforce Industry"
order = 2607
part = "Gross to Net"
tags = ["payroll", "withholding", "w-4", "pub-15-t", "income-tax", "nonresident-alien"]
+++

Federal income tax withholding is the one tax on a pay statement with no rate. Social Security is 6.2%, Medicare 1.45%; income tax withheld is the output of a worksheet the IRS publishes every year in Publication 15-T, fed by a form the employee fills in (Form W-4), the wages of the period and how many periods the employer pays a year. The worksheet annualizes the period's wages, subtracts a standard amount unless the employee checked the multiple-jobs box, adds and subtracts what the employee wrote in Step 4, looks up a bracket in the year's table, divides back to the period, subtracts the credits from Step 3 and adds any extra withholding. It is deterministic, it changes every January, and it has to run correctly for W-4s signed in 2026 and W-4s signed in 2011 at the same time, because a Form W-4 stays in effect until the employee replaces it.

The 2020 redesign replaced withholding allowances with dollar amounts, and the employers' side never fully moved: Pub 15-T (2026) still carries tables and a computational bridge for "2019 or earlier" forms. 2026 adds its own changes, from P.L. 119-21's permanent rates and standard deduction to a new exemption checkbox and a W-4 that lets employees reduce withholding for the new tips and overtime deductions. This chapter covers the forms, the percentage and wage bracket methods worked with the 2026 tables, pay frequency and annualization, exempt claims, nonresident aliens, lock-in letters, invalid and missing forms, the state forms in brief, a withholding function, and the data model. Supplemental wages (bonuses, the 22% and 37% rates) are in [Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income), and the statement around the withholding line is in [Gross-to-Net, Step by Step](/books/workforce/gross-to-net).

## How the Platforms Do It

Withholding is the most standardized calculation in payroll, so vendors differ less in the formula than in how they take elections and override it. As of November 2026, from developer documentation:

| Platform | How W-4 data arrives | Method controls | Notes |
| --- | --- | --- | --- |
| **Check** | Employee tax parameters and tax elections per jurisdiction, through the API | Per payroll item `supplemental_tax_calc_method` and `tax_overrides`; off-cycle `force_supplemental_withholding` taxes "all earnings as supplemental earnings" | Bonus and commission earnings are withheld as supplemental; `non_hourly_regular` as regular |
| **Gusto Embedded** | Federal and state tax setup per employee | Off-cycle payrolls take a `withholding_pay_period` so a bonus run can withhold as if paid over a chosen period | Off-cycle reasons include Bonus, Correction and Dismissed employee |
| **Symmetry Tax Engine** | The caller passes W-4 elections, wages and year-to-date with each request | Supplemental calculation method per wage: `Annualized`, `Cumulative`, `Flat`, or `None`; its calculators describe annualizing as "Annualizes the gross pay, calculates tax on the annualized amount, and then converts the tax amount back" | Stateless; rules applied by pay date, so a 2025 correction uses 2025 tables |

The common shape: **the W-4 is data with an effective date,** the periodic method is the Pub 15-T percentage method, and the variants every vendor exposes are the supplemental method and the period a non-regular payment is withheld over.

## The Form W-4 Since 2020

"Form W-4 contains 5 steps," Pub 15-T says, and "Every Form W-4 employers receive from an employee in 2020 or later should show a completed Step 1 (name, address, social security number (SSN), and filing status) and a dated signature in Step 5." Steps 2 to 4 are optional, and each maps to one line of the employer's worksheet:

| Step | What the employee enters | What the employer does |
| --- | --- | --- |
| 1(c) | Filing status: single or married filing separately, married filing jointly, head of household | Picks the table |
| 2 | Multiple jobs or a working spouse: check the box, or put an extra amount in 4(c) | If checked, use the "Form W-4, Step 2, Checkbox" schedules and skip the standard amount |
| 3 | Annual credits (child tax credit, credit for other dependents, other credits) | Subtract the annual amount, divided by pay periods, from the tentative withholding; use the total "even if it is not equal to the sum of any amounts entered on the left" |
| 4(a) | Other annual income not from jobs | Add to annualized wages |
| 4(b) | Annual deductions beyond the standard deduction | Subtract from annualized wages |
| 4(c) | Extra withholding per pay period | Add after everything else |
| Below 4(c) | Exempt (a checkbox on the 2026 form) | Withhold no income tax, except on certain supplemental wages |

A W-4 from 2019 or earlier asked for marital status and a number of allowances, and it stays valid: "An employee who submitted Form W-4 in any year before 2020 isn't required to submit a new form merely because of the redesign." Employers can carry it two ways. They can use the 2019-or-earlier tables in Pub 15-T, where each allowance is worth $4,300 for 2026, or they can use the optional computational bridge, which converts the old form into new-form fields: treat "Single" or "Married, but withhold at higher single rate" as single or married filing separately and "Married" as married filing jointly (never head of household), enter $8,600 or $12,900 in Step 4(a), enter the allowances times $4,300 in Step 4(b), and carry line 6's extra withholding to Step 4(c). The bridge "applies only for Forms W-4 that were in effect on or before December 31, 2019," and the employer must stop using it once a new form arrives. In data, the bridge means one election schema with a `form` column instead of two calculation paths, which is the main reason to use it.

### The 2026 Form W-4

Pub 15-T (2026) lists the year's changes:

- **Tables for P.L. 119-21.** "The 2026 federal income tax withholding tables in this publication have been updated for changes made by P.L. 119-21," including "the permanent extension of individual tax rates, the permanent extension of the increased standard deduction, and the permanent termination of personal exemptions."
- **New deductions on the form.** The 2026 W-4 "has been updated for 2026 to account for new federal income tax deductions under P.L. 119-21 that are available to employees when they file their income tax returns." For qualified tips and qualified overtime, "Employers must use an employee's updated Form W-4, if one is submitted by the employee, and the federal income tax withholding procedures in this publication to allow the employee to account for their expected deduction and receive more money in each paycheck." Mechanically the expected deduction is an annual amount in Step 4(b); nothing new happens in the employer's worksheet.
- **An exemption checkbox.** "The 2026 Form W-4 was also updated to add a new checkbox below Step 4(c) for an employee to claim exemption from federal income tax withholding. Previously, the employee wrote 'Exempt' below Step 4(c)." An electronic W-4 must offer the checkbox "immediately below or after Step 4(c)" and state both conditions for exemption or link to them.

## Worksheet 1A, Worked

Worksheet 1A is the percentage method for automated payroll systems, and Pub 15-T says it "works for Forms W-4 for all prior, current, and future years" and "for any amount of wages." The 2026 annual tables (STANDARD schedules, used when the Step 2 box is unchecked or the form is from 2019 or earlier):

| Single or married filing separately: at least | But less than | Tax is | Plus | Of the excess over |
| --- | --- | --- | --- | --- |
| $0 | $7,500 | $0.00 | 0% | $0 |
| $7,500 | $19,900 | $0.00 | 10% | $7,500 |
| $19,900 | $57,900 | $1,240.00 | 12% | $19,900 |
| $57,900 | $113,200 | $5,800.00 | 22% | $57,900 |
| $113,200 | $209,275 | $17,966.00 | 24% | $113,200 |
| $209,275 | $263,725 | $41,024.00 | 32% | $209,275 |
| $263,725 | $648,100 | $58,448.00 | 35% | $263,725 |
| $648,100 | | $192,979.25 | 37% | $648,100 |

| Married filing jointly: at least | But less than | Tax is | Plus | Of the excess over |
| --- | --- | --- | --- | --- |
| $0 | $19,300 | $0.00 | 0% | $0 |
| $19,300 | $44,100 | $0.00 | 10% | $19,300 |
| $44,100 | $120,100 | $2,480.00 | 12% | $44,100 |
| $120,100 | $230,700 | $11,600.00 | 22% | $120,100 |
| $230,700 | $422,850 | $35,932.00 | 24% | $230,700 |
| $422,850 | $531,750 | $82,048.00 | 32% | $422,850 |
| $531,750 | $788,000 | $116,896.00 | 35% | $531,750 |
| $788,000 | | $206,583.50 | 37% | $788,000 |

Head of household starts its 10% bracket at $15,550, 12% at $33,250 ($1,770.00), 22% at $83,000 ($7,740.00), 24% at $121,250 ($16,155.00), 32% at $217,300, 35% at $271,750 and 37% at $656,150 ($191,171.00). The Step 2 checkbox schedules halve the brackets: single starts 10% at $8,050, 12% at $14,250 ($620.00), 22% at $33,250 ($2,900.00) and 24% at $60,900 ($8,983.00); married filing jointly starts 10% at $16,100.

The worksheet's steps, as lines: **1a** wages this period; **1b** periods per year; **1c** = 1a × 1b; **1d** Step 4(a); **1e** = 1c + 1d; **1f** Step 4(b); **1g** $12,900 if married filing jointly or $8,600 otherwise, or zero if the Step 2 box is checked; **1h** = 1f + 1g; **1i** = 1e − 1h, not below zero, the Adjusted Annual Wage Amount. Then **2a** to **2g** look up the row and compute the annual tentative amount, **2h** divides it by 1b, **3a** and **3b** divide Step 3 by 1b and **3c** subtracts it (not below zero), and **4a** and **4b** add Step 4(c). For a 2019-or-earlier form, lines 1j to 1l replace 1d to 1i: subtract allowances × $4,300 from 1c, with no standard amount.

Five examples of my own, each with invented round numbers:

**Single, biweekly, $2,000.00, nothing else.** 1c = $2,000.00 × 26 = $52,000.00; 1g = $8,600; 1i = $43,400.00. The row from $19,900 to $57,900: $1,240.00 + 12% × ($43,400.00 − $19,900.00) = $1,240.00 + $2,820.00 = $4,060.00. 2h = $4,060.00 / 26 = **$156.15**.

**Married filing jointly, monthly, $8,000.00, Step 3 of $4,000 (two children), Step 4(c) of $50.00.** 1c = $96,000.00; 1g = $12,900; 1i = $83,100.00. Row $44,100 to $120,100: $2,480.00 + 12% × $39,000.00 = $7,160.00; 2h = $596.67; 3b = $4,000 / 12 = $333.33; 3c = $263.33 when carried at full precision ($263.34 if each line is rounded first); 4b = **$313.33**. This is where a rounding policy has to be stated, as [Gross-to-Net](/books/workforce/gross-to-net#rounding) covers.

**Single, biweekly, $2,000.00, Step 2 box checked.** 1g = 0, so 1i = $52,000.00. The checkbox single row from $33,250 to $60,900: $2,900.00 + 22% × $18,750.00 = $7,025.00; 2h = **$270.19**, about 73% more than the same wages without the box, which is the point: two jobs each withheld as if it were the only one would under-withhold.

**Single, biweekly, $2,000.00, expects $8,000 of qualified tips and enters it in Step 4(b).** 1h = $8,000 + $8,600 = $16,600; 1i = $35,400.00; $1,240.00 + 12% × $15,500.00 = $3,100.00; 2h = **$119.23**, $36.92 a period less than without the entry. The expected deduction changes only income tax withholding; Social Security and Medicare on the tips are unchanged ([Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions)).

**A legacy form: single, one allowance, biweekly, $2,000.00.** 1l = $52,000.00 − $4,300 = $47,700.00; $1,240.00 + 12% × $27,800.00 = $4,576.00; 2h = **$176.00**. Through the computational bridge the same form becomes Step 4(a) $8,600 and Step 4(b) $4,300, and Worksheet 1A's new-form path gives the same $47,700.00 and the same $176.00, which is the bridge's guarantee.

## The Wage Bracket Method

Manual payroll systems may look up the answer instead. The 2026 wage bracket tables cover 2020-or-later forms by pay frequency, filing status and Step 2 box, and "cover a limited amount of annual wages (generally, less than $100,000)"; above the last bracket, the employer uses the percentage method. Worksheet 2 adjusts the period's wages by Step 4(a) and 4(b) divided by the number of periods, looks up the tentative amount, and subtracts Step 3 per period. The brackets are wage ranges with a whole-dollar amount for each, so the single biweekly employee at $2,000.00 above gets $156 from the table where the percentage method gives $156.15. A system that implements both will see differences of a dollar or so by design, because one method rounds within a range and the other computes the exact wage. An automated system has no reason to use the bracket tables; I use them only as a cross-check that the loaded percentage tables are right.

## Pay Frequency and Annualization

The worksheet's 1b is the number of pay periods: semiannually 2, quarterly 4, monthly 12, semimonthly 24, biweekly 26, weekly 52, daily 260. Three cases make it more than a lookup:

- **A 27th biweekly payday or 53rd weekly one.** Some years have one more check date than the usual count; Pub 15-T's Table 3 lists 26 and 52 and has no row for 27 or 53, so the extra paycheck is withheld like the others, which slightly over-withholds for the year.
- **No regular payroll period.** Pub 15 says to "withhold the tax as if you paid wages for a daily or miscellaneous payroll period," counting the days (including Sundays and holidays) in the period the payment covers, and for payments not tied to a period (a commission paid on completing a sale), counting back to the latest of the last wage payment in the year, the start of employment that year, or January 1.
- **A period shorter than a week.** If an employee paid for less than a week signs a statement under penalties of perjury that they aren't working for another employer that week, the employer may withhold on a weekly period; if that changes, the employee must say so within 10 days and the employer moves to the daily or miscellaneous period.

The period count belongs to the pay schedule, not the employee, and a bonus on an off-cycle run is withheld either at the supplemental flat rate or aggregated with a regular period's wages, never annualized with a period count invented for the run ([Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income) covers the aggregate procedure).

## Exempt Claims and Renewal

An employee "may claim exemption from federal income tax withholding because they had no income tax liability last year and expect none this year," and an exempt employee's wages "are still subject to social security and Medicare taxes." An exemption is annual by rule: "A Form W-4 claiming exemption from withholding is effective when it is given to the employer and only for that calendar year. To continue to be exempt from withholding, an employee must give you a new Form W-4 by February 15." If the employee doesn't, the employer begins withholding "as if they had checked the box for Single or Married filing separately in Step 1(c) and made no entries in Step 2, Step 3, or Step 4," and a new exempt form given on February 16 or later applies to future wages only, with no refund of tax withheld in between. In data, every exempt election carries an expiry (February 15 of the next year), and a scheduled job converts expired exemptions to the default election on February 16; the job, not a person remembering, is the control.

Exemption interacts with supplemental pay. Pub 15-T says an exempt employee has no income tax withheld "except in the case of certain supplemental wages": the mandatory 37% on supplemental wages over $1 million applies "without regard to the employee's Form W-4."

## Nonresident Aliens

Nonresident aliens can't claim the standard deduction on their returns, so the employer adds an amount to their wages before running the worksheet, "solely for calculating federal income tax withholding." The amount "isn't included in any box on the employee's Form W-2," and it doesn't increase Social Security, Medicare or FUTA. For 2026, Table 2 (for a 2020-or-later W-4, or a worker first paid in 2020 or later) adds $309.60 weekly, $619.20 biweekly, $670.80 semimonthly, $1,341.70 monthly, $4,025.00 quarterly, $8,050.00 semiannually, $16,100.00 annually and $61.90 a day; Table 1 (an older form for a worker first paid before 2020) adds $226.90 weekly, $453.80 biweekly, $491.70 semimonthly and $983.30 monthly. Nonresident alien students and business apprentices from India aren't subject to the procedure, and it doesn't apply when the 22% or 37% flat rate is used on a supplemental payment.

The form has its own rules: nonresident aliens must not claim exemption, must request withholding as single "regardless of their actual filing status," must not claim the child tax credit or credit for other dependents in Step 3 (with exceptions for residents of Canada, Mexico and South Korea and students and business apprentices from India), and must write "Nonresident Alien" or "NRA" below Step 4(c), which an electronic system replaces with a field. A treaty exemption is claimed on Form 8233, not the W-4.

A worked example of my own: a nonresident alien paid $2,000.00 biweekly, single, 2026 form. Wages for the worksheet are $2,000.00 + $619.20 = $2,619.20; 1c = $68,099.20; 1i = $59,499.20; the row from $57,900: $5,800.00 + 22% × $1,599.20 = $6,151.82; 2h = **$236.61**, against $156.15 for a resident with the same pay. The W-2 shows $2,000.00 of wages per period, not $2,619.20.

## Lock-In Letters

When "a serious underwithholding problem is found to exist for a particular employee, the IRS may issue a lock-in letter to the employer specifying the employee's permitted filing status and providing withholding instructions for the specific employee." The rules are a small state machine with clocks:

- **Furnish the employee's copy** "within 10 business days of receipt if the employee is employed by you as of the date of the notice."
- **Don't act immediately.** "You must begin withholding tax on the basis of the notice for any wages paid after the date specified in the notice," a delay that gives the employee time to contact the IRS.
- **Ignore W-4s that lower withholding.** A new W-4 "claiming complete exemption from withholding or a completed Form W-4 that results in less withholding than would result under the IRS notice" is disregarded; one that results in more withholding is used.
- **Follow modification notices** from their effective dates.
- **Keep it across a gap.** The letter applies to an employee not currently working if the employer pays wages for prior services after the specified date, reasonably expects the employee back within 12 months, or the employee is on a leave of 12 months or less or has a right to reemployment; and if the employee is terminated and rehired within 12 months, the letter still applies.
- **Pre-2020 letters stand.** A lock-in received before 2020 continues for 2026 until a release letter, a modification notice, or a W-4 with more withholding.

In data a lock-in letter is a constraint over tax elections, not an election: the effective withholding is the greater of what the letter requires and what the current W-4 produces, computed every run.

## Invalid, Missing and Replacement Forms

- **No W-4 from a new hire.** Withhold as single or married filing separately with nothing in Steps 2 to 4; an employee paid wages before 2020 who never furnished one stays single with zero allowances.
- **Invalid forms.** "Any unauthorized change or addition to Form W-4 makes it invalid," including removing the certification language, and so does a form that clearly indicates it is false by the date it's given. An employer "may treat a Form W-4 as invalid if the employee wrote 'exempt' below Step 4(c) and checked the box in Step 2(c) or entered numbers for Steps 3 and 4." With an invalid form, ask for another, and meanwhile use the earlier valid form or, without one, the single default. An employee-developed substitute submitted after October 10, 2007 counts as no form at all.
- **Effective dates.** A new hire's form is effective with the first wage payment. A replacement takes effect "no later than the start of the first payroll period ending on or after the 30th day from the date when you received the replacement Form W-4," and the employer doesn't adjust withholding for earlier periods. A form that changes withholding for next year doesn't take effect in the current year. A 2025-or-earlier form stays in effect for 2026 unless replaced.
- **No side payments.** Employers must not "accept any withholding or estimated tax payments from your employees in addition to withholding based on their Form W-4"; extra withholding goes through Step 4(c).
- **Electronic W-4s.** A system that receives W-4s electronically must authenticate the signer, "provide exactly the same information as the paper form," take an e-signature as the final entry, furnish a hard copy on request, and "exactly replicate the text and instructions from the face of the paper Form W-4 beginning with Step 1(c) through Step 4(c)," with no pop-ups or hover boxes for required text and no Step 3 restricted to dollar increments per child. A new guideline without an effective date is effective immediately, and "In most cases, a reasonable amount of time won't extend beyond 90 days."

## State Forms in Brief

Most states with an income tax have their own certificate and their own formula, and a federal W-4 doesn't substitute for them unless the state says so. California is the common example: employees complete both, the W-4 for federal tax and Form DE 4 for California personal income tax, and without a properly completed DE 4 the employer withholds "as if the employee were single with zero withholding allowances." The state formulas, supplemental rates and local taxes are in [State & Local Payroll Taxes](/books/workforce/state-and-local-tax) in the Payroll Tax part; in this model a state certificate is another `tax_elections` row for the state jurisdiction, with `allowances` and whatever fields the state uses in its own columns.

## A Withholding Function

Worksheet 1A for a 2020-or-later W-4, in integer cents with rates in basis points; the caller picks the table by filing status and the Step 2 box and adds any nonresident amount to wages first. The annual tax is kept at full precision and rounded once:

```go tab="Go"
// Bracket is one row of an annual percentage method table, in cents and basis points.
type Bracket struct {
	Over int64 // column A: the row applies when the annual amount is at least this
	Base int64 // column C: tentative tax at Over
	BP   int64 // column D: rate on the excess, in basis points (12% = 1200)
}

type W4 struct {
	MultipleJobs bool  // Step 2 box
	Credits      int64 // Step 3, annual
	OtherIncome  int64 // Step 4(a), annual
	Deductions   int64 // Step 4(b), annual
	Extra        int64 // Step 4(c), per period
}

// Withhold runs Pub 15-T Worksheet 1A. std is 1_290_000 (MFJ) or 860_000 (otherwise).
func Withhold(wages, periods int64, w W4, table []Bracket, std int64) int64 {
	annual := wages*periods + w.OtherIncome - w.Deductions
	if !w.MultipleJobs {
		annual -= std
	}
	annual = max(annual, 0)
	row := table[0]
	for _, b := range table {
		if annual >= b.Over {
			row = b
		}
	}
	// Annual tax less credits, in 1/10,000 of a cent; divide by periods and round half up once.
	n := max(row.Base*10_000+(annual-row.Over)*row.BP-w.Credits*10_000, 0)
	d := periods * 10_000
	return (n+d/2)/d + w.Extra
}
```

```rust tab="Rust"
/// One row of an annual percentage method table, in cents and basis points.
pub struct Bracket {
    pub over: i64, // column A
    pub base: i64, // column C
    pub bp: i64,   // column D, 12% = 1200
}

pub struct W4 {
    pub multiple_jobs: bool, // Step 2 box
    pub credits: i64,        // Step 3, annual
    pub other_income: i64,   // Step 4(a), annual
    pub deductions: i64,     // Step 4(b), annual
    pub extra: i64,          // Step 4(c), per period
}

/// Pub 15-T Worksheet 1A. `std` is 1_290_000 (MFJ) or 860_000 (otherwise).
pub fn withhold(wages: i64, periods: i64, w: &W4, table: &[Bracket], std: i64) -> i64 {
    let mut annual = wages * periods + w.other_income - w.deductions;
    if !w.multiple_jobs {
        annual -= std;
    }
    let annual = annual.max(0);
    let row = table.iter().rev().find(|b| annual >= b.over).unwrap_or(&table[0]);
    // Annual tax less credits, in 1/10,000 of a cent; divide by periods and round half up once.
    let n = (row.base * 10_000 + (annual - row.over) * row.bp - w.credits * 10_000).max(0);
    let d = periods * 10_000;
    (n + d / 2) / d + w.extra
}
```

With the 2026 single table, `Withhold(200_000, 26, W4{}, single, 860_000)` returns 15,615 cents, the $156.15 above; the married example returns 31,333. The tables are data (`withholding_brackets` below), loaded per year and jurisdiction, and the tests are the worked examples above plus every wage bracket cell.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `tax_elections` already has the 2020 W-4 steps, allowances, exempt and nonresident flags; it gains the exemption's expiry, the bridge, and the lock-in link. Tables and lock-in letters are new.

```sql
ALTER TABLE tax_elections
  ADD COLUMN form_year          SMALLINT,             -- the revision signed: 2019, 2020, ..., 2026
  ADD COLUMN exempt_expires_on  DATE,                 -- February 15 of the next year when exempt
  ADD COLUMN bridged_from_id    UUID REFERENCES tax_elections (id),  -- computational bridge source
  ADD COLUMN lock_in            BOOLEAN NOT NULL DEFAULT FALSE,      -- a letter constrains this worker
  ADD COLUMN received_on        DATE,                 -- the 30-day replacement clock starts here
  ADD COLUMN validity           TEXT NOT NULL DEFAULT 'valid' CHECK (validity IN ('valid',
                                  'invalid', 'default_no_form')),
  ADD CONSTRAINT exempt_has_expiry CHECK (NOT exempt OR exempt_expires_on IS NOT NULL);

CREATE TABLE withholding_tables (           -- one schedule: jurisdiction x year x method x status
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  method              TEXT NOT NULL CHECK (method IN ('percentage_annual', 'wage_bracket',
                        'percentage_legacy', 'state_formula')),
  filing_status       TEXT NOT NULL,        -- 'single_or_mfs', 'mfj', 'head_of_household'
  schedule            TEXT NOT NULL CHECK (schedule IN ('standard', 'step2_checkbox')),
  pay_frequency       TEXT,                 -- wage bracket tables only
  standard_amount     BIGINT,               -- line 1g: 860000 or 1290000 for 2026
  allowance_value     BIGINT,               -- line 1k: 430000 for 2026
  source_ref          TEXT NOT NULL,        -- 'IRS Pub 15-T (2026), section 1'
  valid_during        DATERANGE NOT NULL,   -- applied by check date
  EXCLUDE USING GIST (jurisdiction_id WITH =, method WITH =, filing_status WITH =,
    schedule WITH =, (COALESCE(pay_frequency, '')) WITH =, valid_during WITH &&)
);

CREATE TABLE withholding_brackets (
  withholding_table_id UUID NOT NULL REFERENCES withholding_tables (id),
  at_least            BIGINT NOT NULL,      -- column A, cents
  less_than           BIGINT,               -- column B; null on the top row
  base_tax            BIGINT NOT NULL,      -- column C, cents
  rate_bp             INT NOT NULL,         -- column D, basis points
  PRIMARY KEY (withholding_table_id, at_least),
  CHECK (less_than IS NULL OR less_than > at_least)
);

CREATE TABLE nra_wage_additions (           -- Pub 15-T Tables 1 and 2
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  form_era            TEXT NOT NULL CHECK (form_era IN ('pre_2020', '2020_plus')),
  pay_frequency       TEXT NOT NULL,        -- 'weekly', 'biweekly', ..., 'daily'
  amount              BIGINT NOT NULL,      -- 61920 biweekly, 2020_plus, 2026
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (jurisdiction_id, form_era, pay_frequency, valid_during)
);

CREATE TABLE lock_in_letters (              -- an IRS instruction that overrides the W-4 floor
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('initial', 'modification', 'release')),
  supersedes_id       UUID REFERENCES lock_in_letters (id),
  notice_id           UUID REFERENCES notices (id),       -- the letter as received
  received_on         DATE NOT NULL,
  employee_copy_due   DATE NOT NULL,        -- 10 business days from receipt
  employee_copy_sent_on DATE,
  withhold_from       DATE,                 -- the date the letter specifies
  permitted_filing_status TEXT,
  instructions        JSONB NOT NULL,       -- the letter's withholding instruction as data
  status              TEXT NOT NULL CHECK (status IN ('received', 'furnished', 'in_effect',
                        'modified', 'released'))
);
```

Design notes:

- **The effective election is computed per run.** For each worker and jurisdiction: the valid election in force for the period (or the default when none is), converted through the bridge when it's a legacy form and the employer uses the bridge, then raised to the lock-in letter's floor when one is in effect. The result and the rows behind it go into the run's `calculation_steps` ([Gross-to-Net, How to Build It](/books/workforce/gross-to-net#how-to-build-it)).
- **Clocks are rows, not reminders.** The February 16 exemption expiry, the 30-day replacement deadline and the 10-business-day lock-in copy are computed from received dates and stored, so the job that enforces them and the audit that checks them read the same date ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Tables load as reviewed data.** Each January's Pub 15-T becomes rows with a `source_ref`, checked against the publication's examples and the wage bracket cells before the first 2026 check date, and never edited in place once a run has used them ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **The W-4 is a document first.** The signed form, paper or electronic with its e-signature evidence, is a `documents` row with the form's revision year, and the election points at it; a hard copy has to be producible on request.

## Auditing

Withholding is checked by the IRS through W-2 matching, by lock-in procedures, and by employees who were under-withheld:

- **Every election with its source.** Each W-4 as signed, its received date, its validity decision and the date it took effect, so the 30-day rule and the "don't adjust earlier periods" rule can be shown.
- **Exemptions and their expiry.** Who claimed exempt for which year, and the date the default replaced it.
- **Lock-in letters end to end.** Receipt, the employee copy and its date, the effective date, modifications, releases, and each later W-4 disregarded or applied, with the comparison.
- **The table used.** For every withholding line, the table and row, the annualized amount and the period count, so a disputed withholding can be recomputed by hand from Pub 15-T.
- **Electronic W-4 system evidence.** The access log and signature evidence the regulations require, retained as the paper form would be ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).

## What This Means for the System You Build

- **Implement Worksheet 1A once,** for every W-4 era, with the computational bridge mapping legacy forms into the same fields.
- **Load Pub 15-T as data each year,** tested against its own examples and every wage bracket cell.
- **Round once and say how,** and keep the wage bracket method out of automated runs except as a test.
- **Give every exempt election an expiry** and convert it on February 16 automatically.
- **Treat nonresident aliens' additions as calculation-only amounts** that never reach a W-2 box.
- **Model lock-in letters as a floor over the W-4,** with their furnishing and effective-date clocks.
- **Keep the signed form, its received date and its validity** with every election, and apply replacements from the right period.
- **Keep state certificates as separate elections** with their own defaults.

## References

**Agency guidance and forms**

- [IRS: Publication 15-T (2026), Federal Income Tax Withholding Methods (PDF)](https://www.irs.gov/pub/irs-pdf/p15t.pdf), the 2026 changes for P.L. 119-21, the exemption checkbox, the tips and overtime W-4 guidance, the five steps, the computational bridge and the $4,300 allowance, nonresident alien Tables 1 and 2, electronic and substitute W-4 requirements, Worksheet 1A, the 2026 percentage method tables, Worksheet 2, wage bracket coverage and rounding
- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), section 8 payroll periods, section 9 Form W-4 rules (effective dates, the 30-day replacement rule, exemption and February 15, nonresident alien forms, Form 8233, lock-in letters and modification notices, invalid and substitute forms) and the $1 million supplemental rule
- [California EDD: Rates and withholding](https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/), Form W-4 and Form DE 4 and the default without a DE 4

**Vendor documentation**

- [Check: Off-cycle payroll](https://docs.checkhq.com/docs/off-cycle-payroll.md), `force_supplemental_withholding` and off-cycle options
- [Check: Gross-up payments](https://docs.checkhq.com/docs/gross-up-payments.md), `supplemental_tax_calc_method` and `tax_overrides` on payroll items
- [Gusto Embedded: Create an off-cycle payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls.md), `off_cycle_reason` values and `withholding_pay_period`
- [Symmetry: Calculation methods](https://docs.symmetry.com/cbs/core-concepts/calc-methods.md), annualized, flat and current aggregation methods
- [Symmetry: Calculate a gross-up payment](https://docs.symmetry.com/ste/api-reference/payroll-calculations/calculate-a-gross-up-payment.md), the per-wage `calcMethodSupplementalWages` values
