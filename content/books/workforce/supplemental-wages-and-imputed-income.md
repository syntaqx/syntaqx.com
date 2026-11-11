+++
title = "Supplemental Wages & Imputed Income"
nav_title = "Supplemental & Imputed"
description = "Bonuses and commissions under the 22% flat and aggregate methods, the $1 million 37% rule, group-term life over $50,000, vehicles, other fringes and stock pay."
category = "Workforce Industry"
order = 2608
part = "Gross to Net"
tags = ["payroll", "supplemental-wages", "bonus", "imputed-income", "fringe-benefits", "stock-compensation"]
+++

Two kinds of pay break the regular withholding formula. Supplemental wages are cash the worker is paid outside the regular rhythm (a bonus, a commission, severance, back pay, a retroactive raise), and the IRS lets employers withhold on them either at a flat 22% or by folding them into a regular period and running the tables, with a mandatory 37% once a worker's supplemental pay for the year passes $1 million. Imputed income is value the worker received that wasn't cash at all (group-term life insurance coverage over $50,000, personal use of a company car, a taxable fringe), and it has to be added to taxable wages, taxed, and reported, while net pay doesn't change except by the tax taken from other cash. Both are where payroll engines go wrong quietly: a bonus withheld at the wrong method is a W-2 surprise in April, and imputed income left off is a payroll tax underpayment found on audit.

This chapter covers what counts as supplemental, the flat and aggregate methods worked from Pub 15 (2026), the $1 million rule, imputed income for group-term life with Table 2-2 worked, vehicles under the 2026 rates, other fringes and their timing rules from Pub 15-B (2026), stock compensation in payroll at the level public sources state, and the data model. The periodic withholding formula is in [Federal Withholding & the W-4](/books/workforce/federal-withholding); where these lines sit in the statement is in [Gross-to-Net, Step by Step](/books/workforce/gross-to-net). Group-term life and disability as insurance products are covered in the Insurance volume's [Group Life & Disability](/books/insurance/group-life-and-disability); this chapter covers the payroll side.

## How the Platforms Do It

Vendors encode supplemental and imputed treatment in their earning catalogs. As of November 2026, from developer documentation:

| Platform | Supplemental earnings | Imputed earnings | Method controls |
| --- | --- | --- | --- |
| **Check** | `bonus`, `commission`, `severance` ("taxed differently than regular earnings"), `nqdc_distribution` (supplemental, income tax only) | `group_term_life` (W-2 box 12 code C), `other_imputed` ("Income imputed from sources other than group term life insurance"), `2_percent_shareholder_benefits`, `2_percent_shareholder_hsa` | `supplemental_tax_calc_method` per item; off-cycle `force_supplemental_withholding` |
| **Gusto Embedded** | Default types Bonus, Commission, Severance, Correction Payment | Company-defined custom types alongside the defaults | Off-cycle `withholding_pay_period`; off-cycle reasons include Bonus |
| **Symmetry Tax Engine** | Supplemental wage type: "Bonuses, commissions, and other non-regular pay" | Imputed income as an input to the calculation | `calcMethodSupplementalWages`: `Annualized`, `Cumulative`, `Flat`, `None`; its calculators describe current aggregation as using "the current period paycheck amount to apply the correct withholding rates to special wage payments" |
| **Zeal** | Commission ("taxed at a jurisdiction's supplemental rate when applicable"), Discretionary Bonus | Group Term Life Insurance Cost Over 50000, 2% S-Corp Health Insurance; Commodity (in-kind) wages | Treatment set by the wage type, with no separate flag |

The shared design: **supplemental is a property of the pay item type, overridable per payment,** and imputed income is an earning type that adds to tax bases without adding to cash.

## What Counts as Supplemental

Pub 15 (2026) defines supplemental wages as "wage payments to an employee that aren't regular wages," including "bonuses, commissions, overtime pay ..., payments for accumulated sick leave, severance pay, awards, prizes, back pay, reported tips ..., retroactive pay increases, and payments for nondeductible moving expenses," plus "taxable fringe benefits and expense allowances paid under a nonaccountable plan." Two of those are optional: "employers have the option to treat overtime pay and tips as regular wages instead of supplemental wages," and most engines do for overtime, which is paid every period. Vacation pay is regular unless it's paid in addition to regular wages for the period, such as "an annual lump-sum payment for unused vacation leave," which is supplemental.

How to withhold depends on two facts the engine has to know before it computes anything:

1. **Is the supplemental amount identified separately?** If supplemental wages are paid "with regular wages but don't specify the amount of each," the employer withholds "as if the total were a single payment for a regular payroll period." If they're paid separately, or combined with the amounts specified, the methods below apply.
2. **Was income tax withheld from this employee's regular wages in the current or immediately preceding calendar year?** If yes, the employer may choose the flat 22% ("no other percentage allowed") or the aggregate procedure. If no, the aggregate procedure is required.

Regardless of method, supplemental wages are subject to Social Security, Medicare and FUTA like any other wages.

## Flat and Aggregate, Worked

**The flat method** is 22% of the supplemental payment, without regard to the W-4. Pub 15's own Example 3: a $1,000 bonus, "You withhold 22% of $1,000, or $220."

**The aggregate procedure** adds the supplemental payment to regular wages and withholds as if the total were one regular payment, less what was withheld from the regular wages. If paid with regular wages, aggregate with those; if not, aggregate with "either the regular wages paid or to be paid for the current payroll period or the regular wages paid for the preceding payroll period," and earlier supplemental payments in the same period are aggregated too. Pub 15's Examples 2 and 4, for a monthly-paid single employee with a 2026 W-4 and $65 withheld from a $2,000 salary on May 1: a $1,000 bonus on May 15 is figured on $3,000 ($179 from the wage bracket tables), so $179 − $65 = $114 is withheld; a second bonus of $2,000 on May 29 is figured on $5,000 ($419), so $419 − $65 − $114 = $240 is withheld.

A comparison of my own, using the biweekly employee from [the worked statement](/books/workforce/gross-to-net#worked-statement-end-to-end): federal income tax wages of $2,342.11 and $197.21 withheld for the period, and a $5,000.00 bonus paid separately on the same check date.

| | Flat | Aggregate |
| --- | --- | --- |
| Base | $5,000.00 | $2,342.11 + $5,000.00 = $7,342.11 for the period |
| Annualized | | $7,342.11 × 26 = $190,894.86; less $8,600 = $182,294.86 |
| Annual tax | | $17,966.00 + 24% × $69,094.86 = $34,548.77 |
| Period tax | | $34,548.77 / 26 = $1,328.80 |
| Withheld on the bonus | 22% = **$1,100.00** | $1,328.80 − $197.21 = **$1,131.59** |

The two are close here because 24% marginal is near 22%. They diverge for a low earner (aggregate withholds less, because the annualized amount stays in a low bracket) and for a single large bonus (aggregate annualizes as if the employee earned that much every period, which pushes it into a high bracket). Annualizing a bonus is what makes employees think bonuses are "taxed at 40%"; the over-withholding comes back on the return, but it's the employer's method that caused it. My default for automated systems is flat 22% for separately paid bonuses and commissions when the employee had withholding, aggregate when the rule requires it, and the choice recorded on each line.

## The $1 Million Rule

"If a supplemental wage payment, together with other supplemental wage payments made to the employee during the calendar year, exceeds $1 million, the excess is subject to withholding at 37% (or the highest rate of income tax for the year). Withhold using the 37% rate without regard to the employee's Form W-4." Two details make it an engineering problem:

- **It aggregates across employers under common control.** "In determining supplemental wages paid to the employee during the year, include payments from all businesses under common control." The accumulator has to be keyed across every employer in the controlled group, not one EIN, which is the one place in federal withholding where the company (or a defined group of employers) matters more than the employer.
- **It splits a payment.** A payment that crosses the threshold is withheld at the optional method up to $1 million and at 37% above it.

A worked example of my own: an executive has $900,000.00 of supplemental wages year to date across the group and receives a $250,000.00 bonus. The first $100,000.00 brings the year to $1 million and is withheld at 22% ($22,000.00); the remaining $150,000.00 is withheld at 37% ($55,500.00); total income tax withheld on the bonus is $77,500.00. An exempt W-4 doesn't change it: Pub 15-T says exempt employees have no withholding "except in the case of certain supplemental wages."

## Imputed Income

Imputed income is the taxable value of something the worker received in kind. Pub 15-B (2026) says the employer "must determine the value of taxable noncash fringe benefits no later than January 31 of the next year," and may "reasonably estimate the value of the fringe benefits for purposes of withholding and depositing on time" before then. On the statement it is an earning line with `pays_cash = false`: it enters every base its taxability rules say, its taxes come out of the cash the worker is paid, and it is never subtracted from net because it was never added to cash.

Timing is flexible and that flexibility needs rules in code:

- **Choice of period.** Taxable noncash fringes can be treated as paid "on a pay period, quarter, semiannual, annual, or other basis," but "no less frequently than annually," and a single benefit can be spread over several dates in the year ("a fringe benefit valued at $1,000 in one pay period during 2026, you can treat it as made in four payments of $250").
- **The special accounting rule.** The value of benefits "provided during the last 2 months of the calendar year, or any shorter period within the last 2 months," can be treated as paid in the next year, but only benefits actually provided in those months, and not for transfers of property held for investment or real property. If the employer uses it for a benefit, it uses it for every employee receiving that benefit, and it must notify affected employees "on or near the date you give the Form W-2, but not earlier than with the employee's last paycheck of the calendar year."
- **Recovering the tax.** An employer that deposited the right tax but withheld less "can recover from the employee the social security, Medicare, or income tax" it paid on the employee's behalf, but "must recover the income taxes before April 1 of the following year."
- **Paying the employee's share.** An employer that pays the employee's Social Security and Medicare on a fringe instead of withholding it must add that payment to the employee's wages, which is a gross-up ([Gross-Up and Net-to-Gross](/books/workforce/gross-to-net#gross-up-and-net-to-gross)).

## Group-Term Life Over $50,000

"You can generally exclude the cost of up to $50,000 of group-term life insurance coverage from the wages of an insured employee," for income tax and for Social Security and Medicare, and the employer need not withhold income tax or pay FUTA on any of it. Coverage over the limit is wages: "You must include in your employee's wages the cost of group-term life insurance beyond $50,000 worth of coverage, reduced by the amount the employee paid toward the insurance," in boxes 1, 3 and 5 and in box 12 with code C. It is "subject to social security and Medicare taxes, and you may, at your option, withhold federal income tax."

The cost isn't the premium; it's Table 2-2 (the uniform premiums of Treas. Reg. 1.79-3), per $1,000 of coverage a month, by the employee's age "on the last day of the employee's tax year":

| Age | Under 25 | 25 to 29 | 30 to 34 | 35 to 39 | 40 to 44 | 45 to 49 | 50 to 54 | 55 to 59 | 60 to 64 | 65 to 69 | 70 and older |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Monthly cost per $1,000 | $0.05 | $0.06 | $0.08 | $0.09 | $0.10 | $0.15 | $0.23 | $0.43 | $0.66 | $1.27 | $2.06 |

The calculation: thousands of dollars of coverage over $50,000 ("figured to the nearest $100"), times the monthly cost, times months of coverage at that cost (prorated for partial months), less what the employee paid after tax. Pub 15-B's example: $200,000 of coverage at age 45, the employee pays $100 a year, so $0.15 × 150 × 12 = $270, less $100, is $170 in boxes 1, 3, 5 and 12 code C.

A worked example of my own: an employee who turns 52 this year has coverage of twice a $90,000 salary, $180,000, and pays $60 a year after tax toward it. Excess coverage is $130,000; $0.23 × 130 × 12 = $358.80 a year; less $60.00 is $298.80 of imputed income. Spread over 26 biweekly periods it's $11.49 a period (the last period absorbs the rounding), and the Social Security and Medicare on it is $298.80 × 7.65% = $22.86 for the year from each side. If the salary changes mid-year, the coverage and the monthly amount change from that month; if the employee turns 55 on December 30, the whole year uses the 55 to 59 rate, because the age is the one on the last day of the year, which means a December birthday can raise the imputed amount retroactively for every month and a true-up line in the last period is the usual fix.

Three special cases:

- **Former employees and retirees.** For coverage over $50,000 after separation, "the employee share of social security and Medicare taxes on that period of coverage is paid by the former employee with their tax return and isn't collected by the employer," but the employer still pays its share, and the uncollected amounts go in box 12 with codes M and N.
- **Key employees in a discriminatory plan.** If the plan favors key employees (for 2026, an officer with annual pay over $235,000, a 5% owner, or a 1% owner with pay over $150,000), the exclusion is lost for them and the cost is the greater of the premiums paid and the Table 2-2 cost.
- **Dependent coverage.** Employer-paid coverage on a spouse or dependent "may be excludable from income as a de minimis fringe benefit if the face amount isn't more than $2,000"; above that, only if the excess cost is so small that accounting for it is unreasonable.

Pennsylvania lists employer-paid premiums for group-term life among items never taxable as compensation, so the state column of the taxability matrix is not the federal one ([The Taxability Matrix](/books/workforce/gross-to-net#the-taxability-matrix)).

## Personal Use of a Vehicle

An employer-provided vehicle used for personal driving is a taxable fringe valued by the general valuation rule (fair market value) or one of three special rules: cents-per-mile, commuting, and lease value.

- **Cents-per-mile.** Value = "the standard mileage rate by the total miles the employee drives the vehicle for personal purposes." The IRS's 2026 business rate is 72.5 cents a mile for January 1 to June 30, 2026 (IR-2025-128) and 76 cents for July 1 to December 31, 2026 (IR-2026-29). The rule applies only to a vehicle reasonably expected to be regularly used in the business or meeting the mileage test, and not to an automobile whose value when first provided is over the year's maximum automobile value; once chosen it must continue for the vehicle in later years. A worked example of my own: 3,000 personal miles in the first half and 2,000 in the second is 3,000 × $0.725 + 2,000 × $0.76 = $2,175.00 + $1,520.00 = $3,695.00 of imputed income.
- **Commuting.** Where the employer requires the employee to commute in the vehicle for bona fide noncompensatory business reasons, the value is each one-way commute "by $1.50," per employee in the vehicle; the unsafe conditions commuting rule uses the same $1.50. A worked example of my own: 230 workdays of round trips is 460 one-way commutes, $690.00.
- **Lease value.** The annual lease value comes from the Table 3-1 lease value table by the vehicle's fair market value when first made available, refigured each four-year period, and prorated for partial-year availability.

Vehicles have their own withholding election: "You can choose not to withhold income tax on the value of an employee's personal use of a highway motor vehicle you provided," per employee, by written notice "by January 31 of the election year or within 30 days after a vehicle is first provided to the employee, whichever is later," and by including the value in boxes 1, 3, 5 and 14 on a timely W-2. Social Security and Medicare are still withheld. If 100% of a vehicle's annual lease value is included in income, it must be reported in box 14a or a separate statement.

The data a payroll system needs from fleet or expense systems is mileage by period and vehicle, not a dollar amount, so the valuation rule and its rate are applied (and re-applied on correction) by the payroll engine, not typed in by an administrator. Mileage reimbursement for a worker's own car under an accountable plan is a different thing, a non-taxable reimbursement ([Mileage](/books/banking-and-lending/reimbursements-and-per-diem#mileage) in Banking & Lending).

## Other Taxable Fringes

Pub 15-B's Table 2-1 is the catalog. The rows that create imputed lines most often:

- **Exclusions with limits,** where only the excess is taxable: dependent care over $7,500, educational assistance over $5,250, qualified transportation over $340 a month, achievement awards over $1,600 (qualified plan) or $400, employee discounts over the gross profit percentage (merchandise) or 20% (services).
- **Benefits taxable for some employees:** exclusions that "don't apply to S corporation employees who are 2% shareholders," to "certain highly compensated employees under a program that favors those employees," or to key employees in a favoring plan; Pub 15-B tells employers to treat a 2% shareholder "as you would a partner in a partnership" for these benefits, which is why Check and Zeal carry 2% shareholder health coverage as its own earning type.
- **Moving expenses.** P.L. 119-21 "permanently eliminates the exclusion for qualified moving expense reimbursements," except for a member of the Armed Forces on active duty moving under a permanent change of station, so a relocation payment is supplemental wages for everyone else.
- **Adoption assistance,** excluded from income tax up to the limit but subject to Social Security, Medicare and FUTA, reported in box 12 with code T.
- **Cash in place of a benefit,** always wages: a cafeteria plan election of cash, a gift card, a cash award, however small.

## Stock Compensation in Payroll

Equity becomes payroll when it becomes wages. Pub 15-B (2026) states the federal treatment of options, and the payroll mechanics follow from treating the income as supplemental wages paid in property:

- **Nonstatutory (nonqualified) stock options.** At exercise, the employer "must report the excess of the FMV of stock received upon exercise of a nonstatutory stock option over the amount paid for the stock option on Form W-2 in boxes 1, 3 (up to the social security wage base limit), and 5, and in box 12 using code V." The spread is wages for income tax, Social Security and Medicare.
- **Incentive stock options and employee stock purchase plans.** Wages for Social Security, Medicare and FUTA "don't include remuneration resulting from the exercise of an incentive stock option or an employee stock purchase plan option, or from any disposition of stock acquired by exercising such an option," and income tax withholding isn't required on a disqualifying disposition, but the spread on a disqualifying disposition and the discount on a qualifying ESPP disposition go in box 1.
- **Restricted stock and RSUs.** Property received for services is income when it vests unless the employee makes a section 83(b) election, which must be filed "no later than 30 days after the date the property was transferred" and can't be made for a nonstatutory option; Pub 525 mentions RSUs in its discussion of section 83(i) elections, which let qualified employees of private corporations "defer income taxation for up to 5 years from the date of vesting." Payroll treats RSU shares delivered at vesting as supplemental wages at their fair market value. Social Security and Medicare can come earlier than income tax for RSUs that settle after vesting. [Treas. Reg. 31.3121(v)(2)-1](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-C/part-31/subpart-B/section-31.3121(v)(2)-1) says an amount deferred under a nonqualified deferred compensation plan "is required to be taken into account as wages" at the later of when the services are performed or when the right stops being subject to a substantial risk of forfeiture; restricted property by itself is no deferral, but a plan giving a legally binding right to receive property in a future year can be one. The regulation doesn't name RSUs; reading an RSU that settles after vesting as such a right, its FICA is due at vesting, and providers apply it from their tax engine's rules.

A worked example of my own for an NSO exercise with sell-to-cover: an employee exercises 1,000 options at a $10.00 strike when the stock is $40.00, so the spread is $30,000.00 of supplemental wages. Withholding at the flat rate is 22% = $6,600.00, Social Security 6.2% = $1,860.00 (if under the base), Medicare 1.45% = $435.00, $8,895.00 in all. The employer, through its stock plan administrator, sells enough shares to cover it: $8,895.00 / $40.00 = 222.4 shares, so 223 shares are sold for $8,920.00, the $25.00 excess is paid to the employee as cash (or credited, by plan rule), and the employee keeps 777 shares. On the statement this is an earning line for the $30,000.00 with `pays_cash = false` (the employee received stock), tax lines for $8,895.00, and a cash receipt of $8,920.00 from the broker that funds them, which has to arrive before the deposit is due. The stock plan administrator's report is an input file with its own reconciliation: shares, price, date and proceeds must tie to the lines.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Supplemental and imputed are attributes of `pay_item_types`; the method used is recorded on the line; valuations get their own tables so the engine, not an administrator, computes the amounts.

```sql
ALTER TABLE pay_item_types
  ADD COLUMN imputed           BOOLEAN NOT NULL DEFAULT FALSE;   -- adds to bases, not to cash

ALTER TABLE earning_codes
  ADD COLUMN supplemental_override BOOLEAN,         -- null: inherit from pay_item_types.supplemental
  ADD COLUMN default_supplemental_method TEXT,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT earning_codes_default_supplemental_method_check
    CHECK (default_supplemental_method IN
        ('flat', 'aggregate_current', 'aggregate_prior', 'regular')) NOT VALID;

ALTER TABLE pay_statement_lines
  ADD COLUMN supplemental_method TEXT,
  ADD COLUMN aggregated_with_statement_id UUID REFERENCES pay_statements (id),  -- aggregate base
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT pay_statement_lines_supplemental_method_check
    CHECK (supplemental_method IN ('flat', 'aggregate_current',
        'aggregate_prior', 'mandatory_37', 'regular')) NOT VALID;

CREATE TABLE supplemental_groups (            -- employers under common control, for the $1M rule
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  employer_ids        UUID[] NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE gtl_premium_rates (              -- Pub 15-B Table 2-2, per $1,000 per month
  age_from            SMALLINT NOT NULL,
  age_to              SMALLINT,               -- null: and older
  monthly_rate        NUMERIC(6, 2) NOT NULL, -- 0.23 for 50 to 54
  source_ref          TEXT NOT NULL,          -- 'Treas. Reg. 1.79-3(d)(2); Pub 15-B (2026) Table 2-2'
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (age_from, valid_during)
);

CREATE TABLE fringe_valuations (              -- how a noncash benefit is valued, per worker or asset
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('gtl', 'vehicle', 'discount', 'award',
                        'other')),
  rule                TEXT NOT NULL CHECK (rule IN ('table_2_2', 'cents_per_mile', 'commuting',
                        'lease_value', 'general_fmv', 'other')),
  asset_ref           TEXT,                   -- vehicle or policy
  withhold_income_tax BOOLEAN NOT NULL DEFAULT TRUE,   -- vehicle election not to withhold
  election_notice_document_id UUID REFERENCES documents (id),
  special_accounting  BOOLEAN NOT NULL DEFAULT FALSE,  -- Nov-Dec treated as next year
  treated_paid        TEXT NOT NULL CHECK (treated_paid IN ('each_period', 'quarterly',
                        'semiannual', 'annual')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE imputed_income_items (           -- one valuation for one period, before it becomes a line
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  fringe_valuation_id UUID NOT NULL REFERENCES fringe_valuations (id),
  benefit_period      DATERANGE NOT NULL,     -- when the benefit was provided
  treated_paid_on     DATE NOT NULL,          -- the check date it is taxed on
  inputs              JSONB NOT NULL,         -- coverage and age, or miles and rate, ...
  value               BIGINT NOT NULL,        -- cents, before employee contributions
  employee_paid       BIGINT NOT NULL DEFAULT 0,  -- after-tax amounts that reduce it
  is_estimate         BOOLEAN NOT NULL DEFAULT FALSE,  -- before the January 31 final value
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  trues_up_id         UUID REFERENCES imputed_income_items (id)
);

CREATE TABLE equity_events (                  -- an exercise, vest or disposition that is wages
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('nso_exercise', 'rsu_vest', 'rsu_settle',
                        'rsa_vest', 'iso_disqualifying', 'espp_disqualifying',
                        'espp_qualifying')),
  event_date          DATE NOT NULL,
  shares              NUMERIC(18, 6) NOT NULL,
  fmv_per_share       NUMERIC(18, 6) NOT NULL,
  price_paid_per_share NUMERIC(18, 6) NOT NULL DEFAULT 0,
  income              BIGINT NOT NULL,        -- cents: the spread or the value delivered
  shares_withheld_or_sold NUMERIC(18, 6),     -- net settlement or sell-to-cover
  cover_proceeds      BIGINT,                 -- cash from the broker for the taxes
  administrator_ref   TEXT NOT NULL,          -- the stock plan administrator's record
  pay_statement_id    UUID REFERENCES pay_statements (id)
);
```

Design notes:

- **The $1 million test reads the group's accumulator.** Year-to-date supplemental wages are summed across `supplemental_groups.employer_ids` for the worker's person, and a crossing payment becomes two tax lines, one per method, so the W-2 and an audit both see the split.
- **Valuation is computed, then posted.** An imputed item is calculated from its inputs and rule, stored with `is_estimate`, and turned into a statement line on its treated-paid date; the January true-up is a new item with `trues_up_id`, never an edit ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **GTL follows coverage and age by month.** The engine reads the coverage from `benefit_enrollments` and the date of birth from `persons`, computes monthly cost by Table 2-2 for the age at year end, and posts the period's share; a year-end age band change or a coverage change produces a true-up line.
- **Equity needs cash before taxes are due.** An `equity_events` row without `cover_proceeds` received is a liability the employer funds from its own cash or by collecting from the employee; the deposit schedule doesn't wait for the broker ([Funds held equal liabilities open](/books/workforce/workforce-business#the-core-data-model)).

## Auditing

Supplemental and imputed lines are where an IRS employment tax examination looks first, because each one is a judgment the employer made:

- **The method for every supplemental line,** whether income tax was withheld from regular wages in the current or prior year (the eligibility for flat), and the aggregation base for aggregate lines.
- **The $1 million group and accumulator** at each crossing, with the 37% line.
- **Every imputed item with its inputs:** coverage, age and Table 2-2 rate; miles, rate and rule; the vehicle notice and its date; estimates and their January true-ups.
- **Equity events tied to the administrator's records,** shares, prices, proceeds and the W-2 code V or box 1 amounts.
- **Special accounting rule use and the employee notices,** by benefit and year. The general mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you).

## What This Means for the System You Build

- **Make supplemental a pay item type attribute,** overridable per payment, and record the method used on every line.
- **Check flat-rate eligibility from withholding history,** current and prior year, before offering 22%.
- **Aggregate the $1 million test across the controlled group,** and split the crossing payment.
- **Model imputed income as non-cash earning lines** that enter tax bases and never net pay.
- **Value fringes from inputs and rules** (coverage and age, miles and rates), not typed amounts, and true them up by January 31.
- **Apply Table 2-2 by the age at year end,** with true-ups for birthdays and coverage changes.
- **Treat equity as supplemental wages paid in property,** reconciled to the plan administrator and funded before the deposit date.

## References

**Law and regulation**

- [26 CFR 1.79-3](https://www.law.cornell.edu/cfr/text/26/1.79-3), the uniform premium table for group-term life insurance

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), section 7 supplemental wages: the definition, overtime and tips as regular, combined and separate payments, the 22% flat rate, the aggregate procedure and its examples, the $1 million 37% rule across businesses under common control, and vacation pay
- [IRS: Publication 15-T (2026), Federal Income Tax Withholding Methods (PDF)](https://www.irs.gov/pub/irs-pdf/p15t.pdf), exempt employees and certain supplemental wages, and the 2026 annual tables used in the aggregate example
- [IRS: Publication 15-B (2026), Employer's Tax Guide to Fringe Benefits (PDF)](https://www.irs.gov/pub/irs-pdf/p15b.pdf), Table 2-1, group-term life (the exclusion, coverage over the limit, Table 2-2 and its example, former employees, key employees and dependent coverage), employee stock options, the cents-per-mile, commuting and lease value rules, the election not to withhold on vehicles, valuation by January 31, the choice of period, the special accounting rule and recovery of taxes before April 1
- [IRS: Standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates), 72.5 cents for January to June 2026 and 76 cents for July to December 2026
- [IRS: Publication 525 (2025), Taxable and Nontaxable Income](https://www.irs.gov/publications/p525), restricted property, the 30-day section 83(b) election and section 83(i) qualified equity grants
- [IRS: 2026 General Instructions for Forms W-2 and W-3](https://www.irs.gov/instructions/iw2w3), box 12 codes C, M, N and V and box 14a for vehicle lease value
- [Pennsylvania Department of Revenue: PA Personal Income Tax Guide, Gross Compensation](https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/gross-compensation), group-term life premiums never taxable

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), supplemental, imputed and 2% shareholder earning types
- [Check: Off-cycle payroll](https://docs.checkhq.com/docs/off-cycle-payroll.md), `force_supplemental_withholding`
- [Gusto Embedded: Get earning types](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-earning_types.md), default and custom earning types
- [Gusto Embedded: Create an off-cycle payroll](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls.md), off-cycle reasons and `withholding_pay_period`
- [Symmetry: Wage types](https://docs.symmetry.com/ste/core-concepts/wage-types.md), regular and supplemental wage types
- [Symmetry: Calculation methods](https://docs.symmetry.com/cbs/core-concepts/calc-methods.md), annualized, flat and current aggregation
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), supplemental, imputed and commodity earning components
