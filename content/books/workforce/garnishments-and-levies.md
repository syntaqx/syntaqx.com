+++
title = "Garnishments & Levies"
description = "Wage garnishment as payroll computes it: CCPA disposable earnings and limits, creditor orders, IRS levies and Pub 1494, student loans, bankruptcy and stacking."
category = "Workforce Industry"
order = 2625
part = "Moving the Money"
tags = ["payroll", "garnishment", "irs-levy", "ccpa", "student-loans", "compliance"]
+++

A garnishment turns the employer into a collector for someone else's debt. A judgment creditor, the IRS, a state tax agency, the Department of Education or a bankruptcy court serves an order, and from a stated pay period the employer must withhold an amount the law limits, send it to the payee, answer the court or agency on time, and keep the employee's job safe. Each kind of order has its own limit (25% of disposable earnings for an ordinary creditor, 15% for a federal agency or student loan, everything above an exempt amount for an IRS levy, whatever the order says for a Chapter 13 trustee) and its own priority, and the federal law that sets the main limit "contains no provisions controlling the priorities of garnishments," leaving them to state law and other federal statutes. An employer that ignores an order can owe the debt itself: for an IRS levy, the value not surrendered plus a 50% penalty.

This chapter covers the wage side: the Consumer Credit Protection Act's limits and disposable earnings, creditor garnishments by state, IRS levies with the Publication 1494 exempt amounts worked, state tax levies, federal agency and student loan garnishment and its 2026 status, bankruptcy orders, priority and stacking on one paycheck, employer fees, and answering the court. Child support, the order with the highest limits and first priority, is [Child Support Withholding](/books/workforce/child-support-withholding); where garnishments sit in the calculation order is [Gross-to-Net, Step by Step](/books/workforce/gross-to-net#the-calculation-order); and the same creditors and agencies reaching a bank account instead of a paycheck is Banking & Lending's [Levies, Garnishments & Legal Process](/books/banking-and-lending/legal-process).

## How the Platforms Do It

What payroll platforms and courts publish about garnishments, as of November 2026:

| Source | What it publishes |
| --- | --- |
| **Check** | Three post-tax deduction types: child support garnishments, miscellaneous garnishments and miscellaneous deductions; garnishments "are calculated on disposable income"; a miscellaneous garnishment without a `max_percent` defaults to "the lesser of 25% of disposable income," per the CCPA; each miscellaneous garnishment has a `priority` (1 is highest, ties to the oldest, unset last); child support always first; miscellaneous deductions skipped with a payroll item warning when net pay is insufficient |
| **Gusto Embedded** | Garnishment types `child_support`, `federal_tax_lien`, `state_tax_lien`, `student_loan`, `creditor_garnishment`, `federal_loan` and `other_garnishment`, with per-period and annual maximums and percentage or dollar deductions |
| **California courts** | The Earnings Withholding Order (WG-002) tells the employer to withhold the lesser of "20 percent of disposable earnings" or "40 percent of the amount by which the employee's disposable earnings that week exceed" a multiple of the minimum wage, the local one if higher; the Employer's Return (WG-005) is due "within 15 days" and ranks five kinds of order |

The vendor models agree on the essentials: **a garnishment is a deduction with a type, a limit rule and a priority,** calculated on disposable earnings after taxes, in priority order, and allowed to come up short when the paycheck can't cover it. What the vendors leave to the employer or the provider's operations team is the paperwork around it: the answer to the court, the levy's exemption statement, the release. My rule is that the order, the calculation and the answer are three records: the order says what was served, the calculation says what each paycheck could lawfully give, and the answer says what the employer told the issuer and when.

## Disposable Earnings and the CCPA Limits

Title III of the Consumer Credit Protection Act defines the base and the ceiling for every wage garnishment in the country:

- **Earnings** are "compensation paid or payable for personal services... whether denominated as wages, salary, commission, bonus, or otherwise," including periodic pension payments.
- **Disposable earnings** are what is left "after the deduction... of any amounts required by law to be withheld." The DOL's list: federal, state and local taxes, the employee's Social Security and Medicare, state unemployment and disability contributions, and legally required retirement. Not subtracted: "voluntary wage assignments," union dues, health and life insurance, charitable contributions, savings bonds, retirement contributions that aren't required, and repayments of advances or merchandise.
- **The ordinary limit** is the lesser of "25 per centum of his disposable earnings for that week" or the amount by which they "exceed thirty times the Federal minimum hourly wage."
- **The exceptions:** the limit doesn't apply to support orders (which have their own 50 to 65%), to "any order of any court of the United States having jurisdiction over cases under chapter 13 of title 11," or to "any debt due for any State or Federal tax."
- **One debt can't cost a job.** No employer may discharge an employee "by reason of the fact that his earnings have been subjected to garnishment... for any one indebtedness"; the DOL reads it as applying "regardless of the number of levies made or proceedings brought to collect that one debt." A willful violation is a crime, up to $1,000 and a year.
- **State law can only lower it.** The CCPA leaves in force state laws "prohibiting garnishments or providing for more limited garnishment," and "the law resulting in the lower amount of earnings being garnished must be observed."

At the $7.25 federal minimum wage the 30-times rule gives these thresholds, from the DOL's table:

| Pay period | Nothing may be garnished at or below | The full 25% applies at or above |
| --- | --- | --- |
| Weekly | $217.50 | $290.00 |
| Biweekly | $435.00 | $580.00 |
| Semimonthly | $471.25 | $628.33 |
| Monthly | $942.50 | $1,256.66 |

For periods longer than a week the regulation multiplies the weekly figure by the number of workweeks, counting a month as 4⅓ workweeks, and "the date wages are paid or payable controls," not the date of the order. Between the two thresholds the garnishment is disposable earnings minus the protected amount: a biweekly worker with $500.00 of disposable earnings can be garnished $65.00 ($500.00 − $435.00), not $125.00.

## Creditor Garnishments by State

A judgment creditor garnishes wages under state procedure, and states differ in the percentage, the protected floor, the paperwork and the deadlines. Three examples with primary text:

- **California.** The Earnings Withholding Order withholds the lesser of 20% of disposable earnings or 40% of the amount by which weekly disposable earnings exceed 48 times the applicable minimum wage (a local minimum wage counts if higher), with matching multipliers for other pay periods on the form. The employer returns the Employer's Return within 15 days of service ("Failure to do so may subject you to payment of attorney's fees and other civil penalties"), gives the employee their copy within 10 days, and pays the levying officer "by the 15th day of the next month after each payday." The order ends after 180 days with nothing withheld (two years if a higher-priority order was the reason).
- **New York.** An income execution takes installments "of not more than ten percent" of income, nothing at all unless disposable earnings exceed "the greater of thirty times the federal minimum hourly wage" or the applicable state or local minimum wage, and never more than 25% of disposable earnings less any support already deducted. The debtor has 20 days to start paying voluntarily before the sheriff levies on the employer, and executions are paid "in the order in which the executions are delivered."
- **Washington.** The exempt amount is the larger of a minimum-wage multiple or a share of disposable earnings, and the numbers differ by debt: 35 times the federal minimum wage or 75% of disposable earnings in general, 35 times the state minimum wage or 80% for consumer debt, and 50 times the state minimum wage or 85% for private student loans. A continuing lien may charge a garnishee fee not to exceed $20 for the first answer and $10 at the second, and an employer that doesn't answer faces default judgment for the debt.

Some states bar or nearly bar creditor wage garnishment. Texas's constitution says "No current wages for personal service shall ever be subject to garnishment, except for the enforcement of court-ordered" child support or spousal maintenance (art. XVI, sec. 28). Pennsylvania exempts wages "while in the hands of the employer" from "any attachment, execution or other process" except for divorce, support, board for four weeks or less, residential landlord judgments within limits, state higher education loan obligations, and criminal restitution, costs and fines (42 Pa.C.S. 8127). South Carolina lets a judge apply a debtor's property to a judgment "except that the earnings of the debtor for his personal services cannot be so applied" (S.C. Code 15-39-410). North Carolina's statute protects earnings "within 60 days next preceding the order" when "necessary for the use of a family supported wholly or partly by his labor." A provider serving employers in every state needs each state's percentage, floor, multiplier, deadlines and fee as effective-dated rules, applied by the state whose law governs the order.

## IRS Levies

A notice of levy on wages (Form 668-W) is the IRS's own process, not a court's, and it works differently from every other order:

- **It is continuous.** A levy on salary or wages "shall be continuous from the date such levy is first made until such levy is released," so it reaches every paycheck until a release arrives.
- **It takes everything above an exempt amount.** Instead of a percentage, the employee keeps an exempt amount of take-home pay set by filing status, pay period and dependents, from Publication 1494; the rest goes to the IRS. The CCPA's 25% limit doesn't apply to tax debts, but its protection against discharge does, and the IRS's manual warns that firing an employee over a levy may violate it.
- **The employee claims the exemption within three days.** The employer gets the levy with its parts for the employee, who completes a Statement of Dependents and Filing Status; "The employer gives the statement to the taxpayer to complete and return within three days." If it isn't returned, "the exempt amount is figured as if the taxpayer is married filing separate with no dependents (zero)." People 65 or older or blind claim an additional amount per box.
- **Take-home pay keeps the deductions already in place.** The IRS's policy is that "a levy only attaches the taxpayer's usual take home pay": deductions in effect when the levy is served generally continue, but "employers should not allow new voluntary deductions after receiving the levy" without IRS approval.
- **Prior support is exempt, if paid.** Child support ordered before the levy is exempt, but "The taxpayer is not entitled to the support exemption unless the support is being paid."
- **Bonuses go to the IRS in full.** Wages include "fees, commissions, bonuses," and the exemption is per pay period, so a separately paid bonus generally gets no additional exemption.
- **Ignoring it is expensive.** An employer that fails to surrender is "liable in his own person and estate" for the value not surrendered, up to the tax, plus costs and interest, and "a penalty equal to 50 percent" without reasonable cause. Honoring it discharges the employer's obligation to the employee for the amount paid.

### Worked Numbers: Publication 1494 for 2026

The exempt amounts in the 2026 edition (Rev. 12-2025):

| Pay period | Single, 0 | Single, 1 | Single, 2 | MFJ, 0 | MFJ, 2 | Head of household, 0 | Each added dependent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Weekly | $309.62 | $411.54 | $513.46 | $619.23 | $823.07 | $464.42 | $101.92 |
| Biweekly | $619.23 | $823.08 | $1,026.93 | $1,238.46 | $1,646.16 | $928.85 | $203.85 |
| Semimonthly | $670.83 | $891.66 | $1,112.49 | $1,341.67 | $1,783.33 | $1,006.25 | $220.83 |
| Monthly | $1,341.67 | $1,783.34 | $2,225.01 | $2,683.33 | $3,566.67 | $2,012.50 | $441.67 |

The additional amount for each 65-or-older or blind box is $78.85 biweekly for single or head of household filers and $63.46 for any other status. The table is a formula. The statute's exempt amount is the standard deduction plus an amount per dependent, divided by 52 for a week and prorated for other periods, the per-dependent figure having replaced personal exemptions after 2017 and indexed since. By my arithmetic the 2026 table follows from a $16,100 single standard deduction ($16,100 / 26 = $619.23), $32,200 for joint filers ($1,238.46), $24,150 for heads of household ($928.85) and about $5,300 per dependent ($5,300 / 26 = $203.85). An engine should store the published table and test it against the formula each year, not compute it alone, because the IRS's published numbers are the ones the employee is shown.

The publication's own examples are tests: a single taxpayer paid weekly with three dependents has $615.38 exempt, $654.80 at 65 or older ($615.38 + $39.42); a married couple filing jointly, paid biweekly, with two dependents has $1,646.16, and $1,773.08 when the taxpayer is over 65 and the spouse blind ($1,646.16 + $126.92).

## State Tax Levies

States collect unpaid income and other taxes by administrative wage withholding orders under their own statutes, outside the CCPA's 25% limit, which excludes "any debt due for any State or Federal tax." Priority among orders is state law: California's employer's return ranks an Earnings Withholding Order for Taxes third, behind the two kinds of support order and ahead of elder abuse and ordinary creditor orders. The percentage, the exemptions and the employer's duties come from each state's statute and the order itself, and the system models a state tax levy as its own order type with its state's limit rule. California's shows the shape: under Code of Civil Procedure 706.074 the state issues the order itself, the order "shall specify the total amount required to be withheld" (unpaid tax, penalties, accrued interest and costs), and unless the order names a lesser amount the employer withholds "the amount required to be withheld under Section 1673(a)" of the CCPA, the 25% and 30-times rule, which the section says "is not subject to the exception provided in Section 1673(b)." So California's tax order, unlike the federal levy, is capped by the ordinary federal formula. I read the section from a republished copy because the legislature's site and the Franchise Tax Board's employer pages refused automated reading.

## Federal Agency and Student Loan Garnishment

Federal agencies collect non-tax debts, and the Department of Education collects defaulted federal student loans, by **administrative wage garnishment** (AWG): an order from the agency, not a court.

- **The limit is 15%.** For student loans, garnishment "may not exceed 15 percent of disposable pay" without the borrower's written consent, and the statute applies "Notwithstanding any provision of State law." Treasury's rule for agency debts withholds the lesser of the order's amount, up to 15% of disposable pay, and the CCPA amount.
- **Disposable pay is defined more broadly.** Treasury's rule computes it "after the deduction of health insurance premiums and any amounts required by law to be withheld," so health premiums reduce the base for AWG while they don't for a creditor garnishment. The same paycheck has two disposable figures, and the engine has to know which order uses which.
- **Notice and hearing come first.** The borrower gets written notice "a minimum of 30 days prior to the initiation of proceedings" and a right to a hearing.
- **Reemployment protection.** No AWG against someone involuntarily separated until they have 12 months of continuous reemployment.
- **Priority:** "family support shall have priority"; with other orders already in place, the AWG amount is limited to "25% of the debtor's disposable pay less the amount(s) withheld under the withholding order(s) with priority."
- **Employer duties:** certify the employment and pay information on the agency's form within the time its instructions give, start within the period the order states, and don't discharge or discipline; an agency "may sue any employer" for amounts it failed to withhold, and the student loan statute adds fees, costs and possibly punitive damages.

**Status in 2026.** Federal student loan collections were paused during and after the pandemic. On April 21, 2025, the Department of Education announced that the Treasury Offset Program would restart "on Monday, May 5, 2025," and that "Later this summer, FSA will send required notices beginning administrative wage garnishment." News coverage reports a January 16, 2026 Department release delaying involuntary collections, AWG and Treasury offset included, which I couldn't open (ed.gov refused automated access), so I could not confirm from a primary source whether AWG for federal student loans was in effect, paused or resumed as of November 2026; the newest related federal rule I found, the May 1, 2026 final regulations implementing P.L. 119-21's loan changes, addresses a second loan rehabilitation, not garnishment timing. A payroll system should treat an AWG order from the Department or a guaranty agency like any other: honor it as served, at up to 15%, behind support.
<!-- source-gap: wf-student-loan-awg-2026 | status | Whether the Department of Education's administrative wage garnishment of defaulted federal student loans was in effect, paused or resumed as of November 2026 | closes with: a 2026 Department of Education or Federal Student Aid press release or announcement on AWG | checked: 2026-11-10 -->

## Bankruptcy Orders

A bankruptcy filing changes the garnishments in place:

- **The automatic stay stops collection.** Filing stays "the commencement or continuation, including the issuance or employment of process," "the enforcement... of a judgment," and "any act to collect, assess, or recover a claim against the debtor." An employer notified of a filing stops creditor garnishments for that debtor.
- **Support keeps going.** The stay doesn't reach "the collection of a domestic support obligation from property that is not property of the estate," or withholding of income for a domestic support obligation, so a child support order continues through bankruptcy.
- **Chapter 13 can garnish for the trustee.** After confirmation "the court may order any entity from whom the debtor receives income... to pay all or any part of such income to the trustee," and the CCPA limits don't apply to that order.

In the data model a bankruptcy notice suspends the affected orders from the filing date (a status change with the case number and court), and a Chapter 13 wage order is its own garnishment with `order_type = 'bankruptcy'`.

## Priority and Stacking

When several orders reach one paycheck, three rules decide who gets what:

1. **Priority among them is not the CCPA's.** It "is determined by State law or other Federal laws": support first under federal law, federal agency garnishments behind support and earlier orders, creditors by the order of service or delivery in most states, and California's five-level ranking where it applies.
2. **The aggregate is capped.** Whatever the order of priority, the total for ordinary garnishments "in no event may" exceed the CCPA percentage, and the DOL's regulation works the combinations: if a support garnishment with priority takes 25% or more, the Act "does not permit the withholding of any additional amounts pursuant to an ordinary garnishment"; if an ordinary garnishment with priority takes 25%, support is limited to the gap between 25% and its own cap. The DOL's Fact Sheet example is the same rule in dollars: support of $140 on $370 of disposable earnings, so "no additional garnishment for the defaulted consumer debt may be made."
3. **Tax levies and bankruptcy orders sit outside the 25% but not outside priority.** An IRS levy takes take-home pay above the exempt amount after prior support; a later creditor gets what the law leaves.

### Worked Numbers: Three Orders on One Paycheck

An invented employee is paid $2,400.00 biweekly, single with one dependent, with a 401(k) deferral of $120.00 and a Section 125 medical premium of $100.00 elected before any order. Required deductions: federal income tax $190.00, Social Security $142.60 and Medicare $33.35 (6.2% and 1.45% of the $2,300.00 left after the FICA-exempt premium), and state income tax $80.00, $445.95 in all. Three orders arrive in this order: a child support order of $650.00 per period (the employee doesn't support another family; arrears are older than 12 weeks), then an IRS levy whose exemption statement claims single with one dependent, then a judgment creditor's garnishment.

| Step | Rule | Computation | Amount |
| --- | --- | --- | --- |
| Disposable earnings | Subtract only required deductions | $2,400.00 − $445.95 | $1,954.05 |
| Support cap | 65% of disposable | 0.65 x $1,954.05 | $1,270.13 |
| Child support | Ordered, under the cap; first priority | | **$650.00** |
| Take-home pay for the levy | Gross less taxes and deductions in place before the levy, less support ordered before it | $2,400.00 − $445.95 − $120.00 − $100.00 − $650.00 | $1,084.05 |
| Levy exempt amount | Pub 1494, single, 1 dependent, biweekly | | $823.08 |
| IRS levy | Take-home pay above the exempt amount | $1,084.05 − $823.08 | **$260.97** |
| Creditor cap | 25% of disposable, or disposable less $435.00, the lesser | $488.51 vs $1,519.05 | $488.51 |
| Creditor garnishment | Support alone already exceeds 25% of disposable | $650.00 > $488.51 | **$0.00** |
| Net pay | | $2,400.00 − $445.95 − $220.00 − $650.00 − $260.97 | **$823.08** |

![A dimensional drawing of one $2,400 biweekly paycheck as a bar: taxes T1, voluntary deductions V1 and V2, child support S1, the IRS levy L1 and net pay N1 equal to the levy exempt amount X1. Above the bar, disposable earnings D1 and the 65% support cap C1 and 25% creditor cap C2 are measured from the end of the taxes. The table gives disposable earnings of $1,954.05, support of $650.00 under a $1,270.13 cap, a levy of $260.97 above an $823.08 exempt amount, and nothing for the creditor because support alone exceeds the $488.51 cap.](/diagrams/wf-garnishment-stack.svg "Orders take their turns by priority, each under its own limit. Support fits under 65%, the levy takes everything above the exempt amount, and the creditor gets nothing because support alone already used the 25% that ordinary garnishments share.")

The employee takes home exactly the levy's exempt amount, which is what an IRS levy is designed to do. The creditor's order is still valid and still served: the employer answers the court that nothing can be withheld this period and why, and withholds when the support or the levy ends. If there were no levy and the support order were $300.00, the creditor would get $488.51 − $300.00 = $188.51, the gap support left under the 25% aggregate.

## Employer Fees and Answering the Court

**Fees.** States decide whether the employer may charge for its trouble and how much. Washington lets a garnishee charge up to $20 for the first answer and $10 at the second on a continuing lien; child support fees are separate and set by each state ([Child Support Withholding](/books/workforce/child-support-withholding#remitting-to-the-state-disbursement-unit)). A fee is taken from the employee's pay only where the law allows and is a record of its own, so it can be shown on the statement and refunded if the order is quashed.

**Answers.** A writ of garnishment asks the employer, as garnishee, to tell the court whether it employs the debtor, what it owes them and what it will withhold, by a deadline: California's Employer's Return is due within 15 days, Washington's answer is due as the writ instructs. An employer that doesn't answer risks a default judgment for the whole debt (Washington's statute provides for one after notice), and New York lets the sheriff levy directly on the employer after the debtor's 20-day period. The answer is generated from the same data as the calculation: employment status, pay frequency, disposable earnings and the orders with priority ahead of this one, so "nothing withheld because of prior orders" is a documented answer, not a guess.

**The bank-side twin.** The same judgment can reach the debtor's bank account, where a bank applies different protections (the 31 CFR 212 benefit review, state exemptions for deposited wages) ([Protected Federal Benefits: 31 CFR 212](/books/banking-and-lending/legal-process#protected-federal-benefits-31-cfr-212)). The orders share an issuer, a case number and a served date; a garnishment order in payroll and a legal order at a bank are two records of one creditor's collection, and neither limit accounts for the other.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `garnishment_orders` holds each order with its type, priority, `amount_rule` and `limit_rule`; this chapter adds a per-paycheck calculation record, the IRS exempt amount table, answers to issuers, and fees.

```sql
-- What each order could lawfully take from one statement, and why.
CREATE TABLE garnishment_calculations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_statement_id    UUID NOT NULL REFERENCES pay_statements (id),
  garnishment_order_id UUID NOT NULL REFERENCES garnishment_orders (id),
  priority_rank       SMALLINT NOT NULL,     -- position among this statement's orders
  base_kind           TEXT NOT NULL CHECK (base_kind IN ('ccpa_disposable', 'awg_disposable',
                        'irs_take_home', 'order_amount')),
  base_amount         BIGINT NOT NULL,       -- disposable earnings or take-home pay used
  ordered_amount      BIGINT NOT NULL,       -- what the order asks for this period
  cap_amount          BIGINT,                -- the limit after state law and prior orders
  exempt_amount       BIGINT,                -- IRS levy: Pub 1494 row used
  prior_orders_amount BIGINT NOT NULL DEFAULT 0,   -- taken by higher-priority orders
  withheld            BIGINT NOT NULL,
  shortfall_reason    TEXT CHECK (shortfall_reason IN ('limit', 'prior_orders', 'net_pay',
                        'below_floor', 'suspended')),
  rule_refs           TEXT[] NOT NULL,       -- '15 USC 1673(a)', '29 CFR 870.11', 'WA RCW 6.27.150', ...
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  UNIQUE (pay_statement_id, garnishment_order_id),
  CHECK (withheld <= ordered_amount AND (cap_amount IS NULL OR withheld <= cap_amount))
);

-- The published IRS exempt amounts, by year, status, period and dependents.
CREATE TABLE levy_exempt_amounts (
  tax_year            SMALLINT NOT NULL,
  publication_rev     TEXT NOT NULL,         -- 'Pub 1494 (Rev. 12-2025)'
  filing_status       TEXT NOT NULL CHECK (filing_status IN ('single_or_mfs', 'mfj',
                        'head_of_household')),
  pay_period          TEXT NOT NULL CHECK (pay_period IN ('daily', 'weekly', 'biweekly',
                        'semimonthly', 'monthly')),
  base_amount         BIGINT NOT NULL,       -- 0 dependents
  per_dependent       BIGINT NOT NULL,
  per_age_blind_box   BIGINT NOT NULL,
  PRIMARY KEY (tax_year, filing_status, pay_period)
);

ALTER TABLE garnishment_orders
  ADD COLUMN levy_statement     JSONB,       -- filing status, dependents, age/blind boxes as returned
  ADD COLUMN levy_statement_due DATE,        -- 3 days after the employee is given it
  ADD COLUMN suspended_during   DATERANGE,   -- bankruptcy stay, IRS release pending, ...
  ADD COLUMN governing_state    CHAR(2),     -- whose garnishment law applies
  ADD COLUMN released_on        DATE;        -- Form 668-D, a court release, satisfaction

-- What the employer told the court or agency, and when.
CREATE TABLE garnishment_answers (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  garnishment_order_id UUID NOT NULL REFERENCES garnishment_orders (id),
  kind                TEXT NOT NULL CHECK (kind IN ('employer_return', 'garnishee_answer',
                        'awg_certification', 'termination_notice', 'release_ack')),
  due_on              DATE NOT NULL,         -- 15 days for a CA WG-005, per the writ elsewhere
  submitted_on        DATE,
  content             JSONB NOT NULL,        -- employment status, pay, prior orders, amounts
  document_id         UUID REFERENCES documents (id),
  notice_id           UUID REFERENCES notices (id)   -- the order as received, in the inbox
);

-- Fees the employer is allowed to take, per order and event.
CREATE TABLE garnishment_fees (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  garnishment_order_id UUID NOT NULL REFERENCES garnishment_orders (id),
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  rule_ref            TEXT NOT NULL,         -- 'WA RCW 6.27.095 first answer'
  amount              BIGINT NOT NULL,
  refunded            BOOLEAN NOT NULL DEFAULT FALSE
);
```

```go tab="Go"
// CreditorCap returns the most an ordinary garnishment may take this period:
// the lesser of 25% of disposable earnings and disposable earnings above 30x the
// federal minimum wage for the period, less what higher-priority orders took
// toward the same aggregate, never below zero. All amounts in cents.
func CreditorCap(disposable, protectedFloor, priorTaken int64) int64 {
	quarter := disposable / 4
	aboveFloor := max(disposable-protectedFloor, 0)
	return max(min(quarter, aboveFloor)-priorTaken, 0)
}

// LevyAmount returns an IRS wage levy for the period: take-home pay (gross less
// taxes, deductions in place before the levy and prior support) above the
// Publication 1494 exempt amount.
func LevyAmount(takeHome, exempt int64) int64 {
	return max(takeHome-exempt, 0)
}
```

```rust tab="Rust"
/// The most an ordinary garnishment may take this period: the lesser of 25% of
/// disposable earnings and disposable earnings above 30x the federal minimum wage
/// for the period, less what higher-priority orders took toward the same
/// aggregate, never below zero. All amounts in cents.
pub fn creditor_cap(disposable: i64, protected_floor: i64, prior_taken: i64) -> i64 {
    let quarter = disposable / 4;
    let above_floor = (disposable - protected_floor).max(0);
    (quarter.min(above_floor) - prior_taken).max(0)
}

/// An IRS wage levy for the period: take-home pay (gross less taxes, deductions
/// in place before the levy and prior support) above the Publication 1494
/// exempt amount.
pub fn levy_amount(take_home: i64, exempt: i64) -> i64 {
    (take_home - exempt).max(0)
}
```

With the worked numbers in cents, `CreditorCap(195405, 43500, 65000)` returns 0 (the quarter is 48,851, less 65,000 of support), and `LevyAmount(108405, 82308)` returns 26,097.

Design notes:

- **Compute in priority order and carry what each took.** Each order's calculation reads the base and `prior_orders_amount` from the ones ahead of it, so stacking is a fold over the sorted orders, and the record shows why a later order came up short ([Stages and Ordered Rules](/docs/building-blocks/rules-as-data#stages-and-ordered-rules)).
- **Two disposable figures.** The CCPA base subtracts only required deductions; Treasury's AWG base also subtracts health premiums; the IRS uses take-home pay. Store `base_kind` with every calculation so an audit can redo it.
- **The exempt table is published data.** Load each year's Publication 1494 as rows with its revision and test the publication's own examples; the employee's statement is stored as returned, with the three-day default applied if it isn't.
- **Suspensions and releases are dated.** A bankruptcy stay, a satisfaction, an IRS release: each closes or pauses the order from a date, so a retro run applies the order to the periods it covered ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Answers are generated from calculations.** The employer's return and the garnishee answer read the same rows, so the court is told what the paycheck actually did.
- **Map the bank-side twin.** The issuer, case number and served date match Banking & Lending's `legal_orders`, so a creditor's collection can be traced across payroll and the bank ([How to Build It](/books/banking-and-lending/legal-process#how-to-build-it)).

## Auditing

Garnishment records decide whether the employer owes a creditor or the IRS what it didn't withhold, and whether it owes the employee what it withheld wrongly:

- **Every order as served,** with its service date, governing state, version, suspensions and release.
- **Every paycheck's calculation per order:** base, cap, exempt amount, prior orders, withheld and the reason for any shortfall, with the rules applied.
- **The levy statement** as returned by the employee, or the default applied when it wasn't.
- **Every answer and certification** with its deadline and submission date, and every remittance to the payee.
- **Fees** with their legal basis.
- **No discipline:** terminations of employees with open orders, with the documented reason, because one debt can't be the reason.

## What This Means for the System You Build

- **Compute disposable earnings from required deductions only,** and keep the other bases (AWG disposable pay, IRS take-home pay) as named alternatives per order type.
- **Apply the CCPA ceiling and the governing state's lower limit,** with the 30-times floor per pay period.
- **Stack orders in legal priority** with support first, and cap ordinary garnishments at 25% in aggregate including what support took.
- **Run IRS levies from the published Publication 1494 table,** the three-day statement and its default, prior support, deductions in place, and full bonuses.
- **Hold AWG at 15% behind support** and treat its status as something to check, not assume.
- **Suspend creditor orders on a bankruptcy filing** but keep support, and run a Chapter 13 wage order as its own order.
- **Answer every writ on time from the calculation records,** and take only the fees the state allows.
- **Never let a garnishment decide an employment action** for one debt.

## References

**Law and regulation**

- [15 USC 1672](https://www.law.cornell.edu/uscode/text/15/1672), earnings, disposable earnings and garnishment defined
- [15 USC 1673](https://www.law.cornell.edu/uscode/text/15/1673), the 25% and 30-times limits, the support limits and the exceptions for Chapter 13 orders and tax debts
- [15 USC 1674](https://www.law.cornell.edu/uscode/text/15/1674), no discharge for garnishment for any one indebtedness, and the penalty
- [15 USC 1677](https://www.law.cornell.edu/uscode/text/15/1677), more protective state laws stay in force
- [29 CFR 870.10](https://www.law.cornell.edu/cfr/text/29/870.10), the limits for longer pay periods and the payday rule
- [29 CFR 870.11](https://www.law.cornell.edu/cfr/text/29/870.11), priority left to state and other federal law, and the aggregate limit across support, tax and ordinary garnishments
- [26 USC 6331](https://www.law.cornell.edu/uscode/text/26/6331), the continuous levy on salary and wages
- [26 USC 6332](https://www.law.cornell.edu/uscode/text/26/6332), employer liability for failing to surrender, the 50% penalty and discharge of the employer's obligation
- [26 USC 6334](https://www.law.cornell.edu/uscode/text/26/6334), the exempt amount from the standard deduction and dependents, and the married-filing-separately default
- [20 USC 1095a](https://www.law.cornell.edu/uscode/text/20/1095a), student loan wage garnishment: 15%, notice, hearing, reemployment, employer liability and no discharge
- [31 CFR 285.11](https://www.law.cornell.edu/cfr/text/31/285.11), Treasury administrative wage garnishment: disposable pay, 15%, priority, certification and employer liability
- [11 USC 362](https://www.law.cornell.edu/uscode/text/11/362), the automatic stay and the domestic support exceptions
- [11 USC 1325](https://www.law.cornell.edu/uscode/text/11/1325), Chapter 13 orders to pay income to the trustee
- [California Code of Civil Procedure 706.074](https://california.public.law/codes/ca_civ_proc_section_706.074), the state's withholding order for taxes, its total and the 1673(a) amount
- [New York CPLR 5231](https://www.nysenate.gov/legislation/laws/CVP/5231), income executions: 10%, the minimum-wage floor, the 25% cap less support, the 20-day period and priority by delivery
- [Washington RCW 6.27.150](https://app.leg.wa.gov/RCW/default.aspx?cite=6.27.150), exempt earnings by kind of debt
- [Washington RCW 6.27.095](https://app.leg.wa.gov/RCW/default.aspx?cite=6.27.095), garnishee answer fees on continuing liens
- [Washington RCW 6.27.200](https://app.leg.wa.gov/RCW/default.aspx?cite=6.27.200), default judgment against a garnishee that fails to answer
- [Texas Constitution art. XVI](https://tcss.legis.texas.gov/resources/CN/htm/CN.16.htm), sec. 28: current wages not subject to garnishment except for child support and spousal maintenance
- [42 Pa.C.S. 8127](https://www.legis.state.pa.us/WU01/LI/LI/CT/HTM/42/00.081.027.000..HTM), wages exempt from attachment except for listed actions
- [South Carolina Code 15-39-410](https://www.scstatehouse.gov/code/t15c039.php), earnings for personal services cannot be applied to a judgment
- [North Carolina G.S. 1-362](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_1/GS_1-362.html), earnings needed for a family's support

**Agency guidance and forms**

- [DOL WHD: Fact Sheet #30, the Federal Wage Garnishment Law](https://www.dol.gov/agencies/whd/fact-sheets/30-cppa), disposable earnings, deductions that are and aren't subtracted, the dollar table, priority, the support and consumer debt example, federal non-tax debts and state law
- [IRS: Publication 1494 (Rev. 12-2025)](https://www.irs.gov/pub/irs-pdf/p1494.pdf), the 2026 exempt amount tables, the additional amounts and the worked examples
- [IRS: Internal Revenue Manual 5.11.5](https://www.irs.gov/irm/part5/irm_05-011-005), the three-day statement and default, take-home pay, deductions in place and new ones, prior support and bonuses
- [IRS: Information about wage levies](https://www.irs.gov/businesses/small-businesses-self-employed/information-about-wage-levies), the statement, the default exemption, support ordered before the levy and bonuses as wages
- [Judicial Council of California: Earnings Withholding Order (WG-002)](https://www.courts.ca.gov/documents/wg002.pdf), the 20% and 40% rule, the employee's copy, payment by the 15th and the 180-day rule
- [Judicial Council of California: Employer's Return (WG-005)](https://www.courts.ca.gov/documents/wg005.pdf), the 15-day return, penalties and the priority of orders
- [US Department of Education: Begin federal student loan collections (April 21, 2025)](https://www.ed.gov/about/news/press-release/us-department-of-education-begin-federal-student-loan-collections-other-actions-help-borrowers-get-back-repayment), the May 5, 2025 restart of Treasury offset and planned AWG notices
- [Federal Register: Reimagining and Improving Student Education final regulations (May 1, 2026)](https://www.federalregister.gov/d/2026-08556), P.L. 119-21 loan changes and second rehabilitation

**Vendor documentation**

- [Check: Post-tax deductions](https://docs.checkhq.com/docs/post-tax-deductions.md), garnishments on disposable income, the 25% default, priority and skipped deductions
- [Gusto Embedded: Create a garnishment](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees-employee_id-garnishments.md), garnishment types and maximums
