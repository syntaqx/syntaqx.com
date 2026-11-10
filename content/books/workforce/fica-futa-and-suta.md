+++
title = "FICA, FUTA & SUTA"
description = "Social Security and Medicare with the 2026 wage base, Additional Medicare, FUTA and credit reduction states, SUTA wage bases, rates and successor rules."
category = "Workforce Industry"
order = 2613
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "fica", "futa", "suta", "unemployment-insurance"]
+++

Income tax withholding is a guess at what a worker will owe; Social Security, Medicare and unemployment taxes are exact. They are flat rates on a defined wage, up to a wage base, by calendar year and per employer, and an employer pays some of them on top of wages. That makes them the part of payroll tax most like accounting: every dollar has a rate, a base, an accumulator and a date, and every error shows up later as a mismatch between the quarterly return, the W-2 and the agency's own arithmetic. FICA (the Federal Insurance Contributions Act) funds Social Security and Medicare, split between employee and employer; FUTA (the Federal Unemployment Tax Act) is paid by the employer alone and mostly refunded to it as a credit for state unemployment contributions; SUTA, or state unemployment insurance (SUI), is the state contribution that earns the credit, with its own wage base and a rate the state assigns each employer from its layoff history.

This chapter covers the rates, the bases and the mechanics: crossing the Social Security wage base mid-year, the Additional Medicare threshold, the FUTA credit and what a credit reduction state costs per employee, SUTA wage bases, experience rates, rate notices and voluntary contributions, the successor rules that carry a wage base across an acquisition, and which state a worker's unemployment wages belong to when they work in several. Withholding methods are in Federal Withholding & the W-4, and how a wage base is applied inside the calculation order is in Gross-to-Net, Step by Step. When the money is due is the next chapter, [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns). State disability and paid family leave contributions are payroll taxes too, but they belong to the Leave part's State Paid Family & Medical Leave. Workers' compensation is insurance, not a tax, though payroll is its exposure base: payroll by class code feeds the carrier's premium audit and pay-as-you-go billing, which the Insurance volume's Workers' Compensation chapters cover.

## How the Platforms Do It

What tax engines and embedded payroll APIs publish about FICA, FUTA and SUI, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Check** | Embedded payroll API | Each Tax object carries its `jurisdiction` (`fed` or a state code, with localities under their state), `payer` (employee or employer), whether it is `supported` and `remittable`, and `effective_from` and `effective_to`; employers "register, pay, and file with agencies," never with a jurisdiction |
| **Gusto Embedded** | Embedded payroll API | State tax requirements come back as effective-dated sets (`registrations`, `taxrates`, `depositschedules`); the Georgia example's SUI "Total Tax Rate" is validated between 0.0004 and 0.081 and is `payroll_blocking`, so a payroll can't run without it, and a reimbursable-employer flag removes the rate |
| **Symmetry Tax Engine** | Calculation engine | Calculates "income tax, FICA, FUTA, state unemployment and disability programs" by the rules in effect on the pay date; stateless, so the caller passes year-to-date wages on every call |
| **Vertex Payroll Tax** | Calculation engine | Federal, state, provincial and local calculation for the US and Canada, with address cleansing and jurisdiction assignment from home and work locations |

Two things stand out. **The engine never owns the wage base.** Symmetry says it keeps "no employee data or session between calculations," so the Social Security base, the Additional Medicare threshold and every state UI base are applied against year-to-date totals the payroll system supplies; a wrong accumulator gives a wrong tax with a correct engine. **The SUI rate is the employer's data, not the engine's.** Federal rates are the same for everyone, but each employer's SUI rate comes from its own state notice, which is why Gusto makes it a blocking requirement with an effective date and Check models taxes with effective ranges. My rule is that the rate a run used is a row with a `valid_during` range and the notice behind it, never a field someone overwrote in January.

## Social Security and Medicare

For 2026 the Social Security tax is 6.2% each for the employer and the employee, 12.4% in all, on wages up to the wage base of **$184,500**; Medicare is 1.45% each, 2.9% in all, with "no wage base limit." The base was $176,100 for 2025 and $168,600 for 2024. On October 14, 2026 the Social Security Administration announced a 2027 base of **$192,300**, as reported in the trade press (SSA's own pages refuse automated fetches). The base is per employee per employer per calendar year: an employee with two unrelated employers pays Social Security to both and recovers the excess on their own return, and neither employer gets anything back.

Three details decide whether the numbers tie out:

- **The base caps wages, not tax.** Taxable Social Security wages for the year stop at the base; the tax is the rate times taxable wages. A W-2 box 3 over $184,500 is an error the W-2 instructions call out ("Box 3 is capped at the 2026 social security wage base"), and Pub 15 lists it among the steps that reduce W-2 to 941 discrepancies.
- **Rounding happens per payment, so the quarter drifts by cents.** Employers withhold "by multiplying each payment by the employee tax rate," rounded to the cent, while Form 941 computes the tax as total wages times the combined rate. The difference is reported as a "fractions-of-cents" adjustment on line 7, which Pub 15 defines by multiplying the quarter's wages by 6.2%, 1.45% and 0.9% and comparing with what was withheld.
- **Taxability is per item.** A 401(k) deferral reduces income tax wages but stays in Social Security and Medicare wages: "Elective deferrals are reported in box 3 even though they are not in box 1." The taxability matrix that decides each item is the subject of Gross-to-Net, Step by Step; this chapter assumes `subject_wages` on each tax line is already right.

**Who is covered.** Household workers are subject to FICA if paid $3,000 or more in cash wages in 2026, election workers if paid $2,500 or more, and farmworkers if either the $150 test (one worker) or the $2,500 test (all farmworkers) is met. Payroll by Industry covers household, agricultural and clergy rules.

### Worked Numbers: Crossing the Wage Base

An invented employee earns $10,000 every two weeks, $260,000 over 26 biweekly paydays in 2026, all subject to Social Security and Medicare.

| Paydays | Year-to-date wages before | Social Security wages this payday | Employee Social Security | Employer Social Security |
| --- | --- | --- | --- | --- |
| 1 to 18 | $0 to $170,000 | $10,000.00 each | $620.00 each | $620.00 each |
| 19 | $180,000 | $4,500.00 | $279.00 | $279.00 |
| 20 to 26 | $190,000 and up | $0.00 | $0.00 | $0.00 |
| **Year** | | **$184,500.00** | **$11,439.00** | **$11,439.00** |

After payday 18 the year-to-date is $180,000, so payday 19 has only $184,500 − $180,000 = $4,500 of room. From payday 19 the employee's net pay rises by $620 a payday, which generates "why did my pay go up" tickets in October and "why did my pay go down" tickets every January; a provider that shows the base crossing on the pay statement answers both.

The base is easy at $10,000; at $10,416.67 a payday (a $250,000 salary paid semimonthly) it shows the rounding problem. Rounded per payment, 17 paydays of $645.83 plus a final partial of $459.83 sum to $11,438.94, six cents short of 6.2% of $184,500. Engines handle this one of two ways: compute each payday's tax on its own and let the quarter's fractions-of-cents adjustment absorb the drift, or compute the tax cumulatively (round year-to-date taxable wages times the rate, minus tax already withheld), which lands exactly on $11,439.00 at the base. Either is defensible; what isn't defensible is a system that can't say which one it used for a given statement.

**Rehires, transfers and acquisitions.** The base follows the employer, not the employment, so a worker rehired in the same year continues the base where it left off, which is why the core model keys the accumulator on the worker ([The Workforce Business](/books/workforce/workforce-business#the-core-data-model)). Transfers between two EINs of the same company restart the base unless a successor rule applies, which surprises clients who think of themselves as one employer. When an acquisition qualifies, "wages paid by the predecessor are treated as if paid by the successor" for the Social Security base and the Additional Medicare threshold; Pub 15's example is an employee paid $2,000 before an asset purchase, whose new employer owes Social Security on only the first $182,500. Successor rules are below.

## Additional Medicare Tax

On top of 1.45%, the employer must withhold 0.9% Additional Medicare Tax "from wages you pay to an employee in excess of $200,000 in a calendar year," starting "in the pay period in which you pay wages in excess of $200,000" and continuing to the end of the year. "There is no employer share." The threshold is about wages this employer pays; the employee's actual liability depends on filing status and other wages and is settled on the employee's own return, which is why prior-year Additional Medicare withholding errors can't be adjusted except for administrative errors (Pub 15 section 13).

The same invented employee at $10,000 biweekly:

| Payday | Year-to-date before | Year-to-date after | Wages over $200,000 this payday | Additional Medicare (0.9%) |
| --- | --- | --- | --- | --- |
| 20 | $190,000 | $200,000 | $0 | $0.00 |
| 21 | $200,000 | $210,000 | $10,000 | $90.00 |
| 22 to 26 | | | $10,000 each | $90.00 each |
| **Year** | | **$260,000** | **$60,000** | **$540.00** |

Payday 20 reaches exactly $200,000, which is not "in excess of" it, so the first 0.9% is on payday 21. A system that tests `>=` instead of `>` withholds $0 too early on payday 20 only when the boundary lands on a cent, which is precisely the case nobody tests. On Form 941, line 5d multiplies wages subject to Additional Medicare by 0.009 in column 2, and because the tax has no employer share, the Medicare total on the 941 "won't be twice the amount of the Medicare tax withheld" on the W-3; Pub 15 names this as a valid reason for a mismatch, and the reconciliation in [Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s) has to know it.

Third-party sick pay and tips count toward the threshold: when the employer's and a third-party payer's wages together exceed $200,000, the employer reports the Additional Medicare Tax on line 5d, and the same applies to tips reported by an employee (Pub 15 section 13).

## FUTA

**Who pays.** An employer is subject to FUTA in 2026 if it paid $1,500 or more in wages in any calendar quarter of 2025 or 2026, or had an employee for some part of a day in 20 or more weeks in either year; household employers at $1,000 of cash wages in a quarter; agricultural employers at $20,000 of cash wages in a quarter or 10 farmworkers in 20 weeks. "Only the employer pays FUTA tax; it isn't withheld from the employee's wages."

**The rate and the credit.** "For 2026, the FUTA tax rate is 6.0%," on "the first $7,000 you pay to each employee as wages during the year." Employers get a credit of up to 5.4% for state unemployment contributions, so "the FUTA tax rate after credit is 0.6%," or $42 per employee per year. The full credit requires that the employer "paid your state unemployment taxes in full, on time, and on all the same wages as are subject to FUTA tax," and that the state isn't a credit reduction state. Form 940 encodes each exception:

- **Wages excluded from state unemployment tax.** Some states exclude pay that FUTA taxes, such as wages of corporate officers, certain union sick pay and some fringe benefits; on those wages the employer gets no credit. If all FUTA wages were excluded from state tax, line 9 is line 7 times 0.054, and the employer pays the full 6.0%.
- **Late state payments.** State unemployment tax paid after the 940 due date earns a reduced credit, figured on the line 10 worksheet.
- **Credit reduction states.** Line 11 carries the total from Schedule A.

**Credit reduction.** A state that borrows from the federal unemployment trust fund to pay benefits and doesn't repay it loses part of its employers' credit. The Department of Labor's rule is that employers in a state with an outstanding Title XII advance on January 1 of two or more consecutive years face a credit reduction for that year "if the advances are not all repaid before November 10," with larger reductions after the third and fifth such January 1. The reduction is a tax on every FUTA wage in the state, owed by employers who never borrowed anything, and it is owed in one lump: credit reduction liability is included "with your fourth quarter deposit," recorded as incurred in the fourth quarter, though an employer may deposit it during the year.

For 2025, Schedule A lists **California at 1.2%** and the **U.S. Virgin Islands at 4.5%**. For 2026, the Department of Labor's January 15, 2026 list of potential reductions showed California at 1.5% (5.3% with a 3.8% benefit cost rate add-on unless the state obtained a waiver) and the Virgin Islands at 4.8%; the Virgin Islands then paid off its outstanding loans and, as PayrollOrg reported in June 2026, will not face a 2026 reduction if it carries no balance on November 10. The final 2026 list follows the November 10, 2026 repayment deadline, so as of this writing (November 9, 2026) the 2026 California figure is potential.
<!-- source-gap: wf-futa-cr-2026 | status | 2026 FUTA credit reduction for California (potential 1.5%, 5.3% with BCR add-on) and whether the BCR waiver was granted | closes with: DOL's final 2026 credit reduction list or the 2026 Schedule A (Form 940) | checked: 2026-11-09 -->

### Worked Numbers: What a Credit Reduction Costs

FUTA is $7,000 times a rate, so the cost per employee is easy to state and easy to underestimate in aggregate:

| Case | FUTA rate after credit | FUTA per employee (wage base $7,000) | Extra over a normal state |
| --- | --- | --- | --- |
| Normal state, full credit | 0.6% | $42 | $0 |
| California 2025 (reduction 1.2%) | 1.8% | $126 | $84 |
| California 2026, potential 1.5% | 2.1% | $147 | $105 |
| California 2026, potential 5.3% (no BCR waiver) | 5.9% | $413 | $371 |
| All FUTA wages excluded from state tax | 6.0% | $420 | $378 |

An invented employer with 200 California employees who each earned over $7,000 owed $16,800 of credit reduction for 2025 ($84 times 200), on top of $8,400 of ordinary FUTA. Schedule A's own example, State A at 0.012 on $21,000 of FUTA wages, gives $252.00. The calculation is per state on the FUTA wages paid in that state, which means FUTA wages have to be allocated to states (Schedule A has a box per state, and multi-state employers check line 1b and attach it), and that allocation follows the SUI state of the wages, not the worker's residence.

Deposits are quarterly: compute FUTA "quarterly," deposit when the liability is over $500 (carrying $500 or less forward) by the last day of the month after the quarter, and pay the fourth quarter (with any credit reduction) by January 31. The 2025 Form 940 was due February 2, 2026, or February 10 if all FUTA tax was deposited when due. [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns) has the calendar.

## SUTA: State Unemployment Insurance

Every state finances unemployment benefits with employer payroll taxes, "commonly called 'contributions,'" and every state must be able to assign "a maximum contribution rate of 5.4 percent or higher" so employers can get the full FUTA credit. Beyond that, each state sets its own wage base, rate schedule, new employer rate, filing calendar and account rules.

**Wage bases.** "Almost all states have adopted a higher taxable wage base" than FUTA's $7,000, and most include only remuneration subject to FUTA. The Department of Labor's summary of state laws effective July 2026 shows the spread:

| State | Wages subject to tax, July 2026 |
| --- | --- |
| California | $7,000 (experience rates 1.5% to 6.2%, new employers 3.4%) |
| Alabama | $8,000 |
| Texas | $9,000 |
| New Jersey | $44,800 |
| Washington | $78,200 |

The summary's rate columns exclude "surtaxes, penalties, surcharges, or applicable non-UI taxes," its new employer rate is "the base rate," with industry rules in some states, and in one state the rate year runs from July 1 while "All other states have a rate year of January 1 through December 31." California's Employment Development Department adds the Employment Training Tax at 0.1% of the same $7,000, collected with UI. The spread is the point: the same worker exhausts California's base in the first paycheck and Washington's in the eighth.
<!-- source-gap: wf-suta-rates-table | secondary | experience rate ranges and new employer rates for states other than California, as read from the DOL summary's multi-line cells | closes with: each state agency's 2026 rate page | checked: 2026-11-09 -->

**Employee contributions.** "Alaska, New Jersey, and Pennsylvania require payment of UI taxes by workers," deducted by the employer and forwarded with its own contributions; in Pennsylvania employee contributions are on total gross covered wages rather than the wage base. The DOL comparison (2023 edition) gives Alaska's employee rate as 27% of the average benefit cost rate, between 0.5% and 1.0%, New Jersey's as 0.425%, and Pennsylvania's as 0.0% to 0.08% depending on the fund. These are employee tax lines in the statement, with their own wage bases, and a payroll that models SUI as employer-only gets all three wrong.

**Experience rating.** "Federal law requires that states use a system of experience rating," and a state may give an employer a rate based on its experience only after enough history: three years by federal default, reducible by state law to no less than one, with new employers on a rate assigned "on a 'reasonable basis,' but not less than 1.0 percent." Four formula families exist: reserve-ratio, benefit-ratio, benefit-wage-ratio and payroll variation. The reserve ratio, still the most common, is "(contributions minus benefits charged) divided by payroll": an employer whose account holds contributions of $90,000 against benefits charged of $60,000 since it became subject, on average taxable payroll of $1,000,000, has a reserve ratio of 3.0%, and the state's schedule maps that ratio to a rate; the higher the ratio, the lower the rate, and a state fund that falls below its trigger moves everyone to a higher schedule. The arithmetic belongs to the state; what payroll owns is that the rate arrives once a year on a notice, applies from a date, and may be revised.

**Rate notices.** States mail or post each employer's rate for the coming year, usually around year-end, and often revise it after protests, late reports or voluntary contributions. The notice is a document with a received date, a rate, an effective date and sometimes a reserve balance and a protest deadline; it updates `tax_registrations` and must be kept with the rate, so that a run in March using last year's rate because the notice arrived late can be corrected by a retro adjustment with an audit trail. A new rate effective January 1 that arrives in February means January's and February's SUI liabilities were wrong; the correction is an amended state wage report or an adjustment on the next one, by state rule.

**Voluntary contributions.** "About half of the states allow employers to obtain lower rates by making voluntary contributions," paid no later than 120 days after the rate year begins (some states earlier). In a reserve-ratio state the payment raises the reserve enough to drop the employer into a lower bracket that saves more than the payment; in a benefit-ratio state it cancels benefit charges. Because federal law limits refunds to erroneous payments, "if a voluntary contribution does not lead to a reduced rate," the money is gone. A platform that offers the calculation needs the state's schedule, the employer's reserve balance from the notice, and next year's projected taxable payroll; it is a decision the employer signs, not an automatic payment.

**Reimbursing employers.** Governments, certain nonprofits and federally recognized tribes may elect "payments in lieu of contributions," reimbursing the state for benefits actually paid instead of paying a rate. Gusto's requirement set models this as a reimbursable flag that removes the rate field; in the data model it is a registration with no rate and a different liability source (the state's benefit bill, not the pay run).

### Worked Numbers: SUTA on One Employee

The same invented employee earning $260,000, in two states for comparison, using each state's 2026 base:

| State and rate | Wage base | SUI per employee | Year-to-date when the base is reached |
| --- | --- | --- | --- |
| California, new employer 3.4%, plus ETT 0.1% | $7,000 | $238 plus $7 | Payday 1 |
| Washington, illustrative 1.0% | $78,200 | $782 | Payday 8 (year-to-date $80,000) |

In California the base is reached in the first paycheck; in Washington it takes eight. A state's SUI line on the statement stops on a different payday from FUTA and from Social Security, and each needs its own accumulator.

## Successor Employers and Wage Base Transfers

**Federal.** When an acquisition meets the requirements of Treasury Regulation 31.3121(a)(1)-1(b) and Rev. Proc. 2004-53, the successor treats the predecessor's wages as its own for the Social Security base and the Additional Medicare threshold, and may file Schedule D (Form 941) to explain the W-2 and 941 differences the acquisition causes. For FUTA, a successor may count wages a predecessor paid "to the employees who continue to work for you," but only if the predecessor was required to file Form 940. Rev. Proc. 2004-53 also offers the standard procedure (each employer reports what it paid) and the alternate procedure (the successor reports both employers' wages and withholding on one W-2); Changing Providers Mid-Year covers the procedures, and the core point here is narrow: a transfer of wages is a row with a source, a worker, an amount per tax, and the acquisition it came from, loaded into the successor's accumulators as prior wages that are not the successor's statement lines.

**State.** State UI laws have successor rules too, and since the SUTA Dumping Prevention Act of 2004, federal law requires them to do two things (42 USC 503(k)). When a business transfers to an employer under "substantially common ownership, management, or control," its unemployment experience must transfer with it, so a company can't shed a bad rate by moving its workers to a fresh entity. And a person who was not already an employer and acquired a business "solely or primarily for the purpose of obtaining a lower rate of contributions" may not take the seller's experience. States must impose "meaningful civil and criminal penalties" on people who knowingly violate these rules or advise others to. The DOL comparison also notes that states may bar voluntary contributions in the year of a common-control transfer and the year after. For payroll that means a SUI rate isn't just a number to type in after an acquisition: it can be the predecessor's, a combination, or a new employer rate, by state determination, and whether the state's wage base counts the predecessor's wages is a state rule too.
<!-- source-gap: wf-sui-successor-base | missing | which states let a successor count the predecessor's wages toward the SUI wage base, and under what conditions | closes with: a state-by-state table from the DOL Comparison of State UI Laws, financing chapter | checked: 2026-11-09 -->

## Which State Gets the Unemployment Wages

A worker who works in one state is covered there. A worker who works in several for the same employer is covered by exactly one state's UI law for all of that work, by "localization of work" provisions that the Department of Labor developed as model legislation and every state adopted in the 1940s, with telecommuting addressed in UIPL 20-04. The tests run in order:

1. **Localization.** Is the service localized in one state (all there, or the work elsewhere is temporary or incidental)?
2. **Base of operations.** If not, does the worker perform some service in the state of the base of operations, "the place from which the individual starts work and to which the individual customarily returns in order to receive instructions from the employer"?
3. **Direction and control.** If not, do they perform any service in the state from which the work is directed or controlled?
4. **Residence.** If not, do they perform any service in the state where they live?

When none of the tests settles it, most states allow a reciprocal coverage arrangement among the employer, the employees and the states involved, covering all the worker's services in a state where some service is performed, the state of residence, or a state where the employer has a place of business. Most states also allow electing coverage for work performed entirely outside the state if no other state or federal law covers it.

Two consequences for the system. First, the SUI state is a property of the worker and period, determined once by the test and stored, not recomputed from each day's location; it changes when the facts change (a move, a new base of operations), effective from a date. Second, the SUI state need not be the income tax work state: a salesperson based in one state who spends most days in three others owes income tax withholding by the rules of [Multi-State, Reciprocity & Remote Work](/books/workforce/multi-state-and-remote-work) and unemployment contributions to one state. When the SUI state changes mid-year, whether the new state counts wages already reported to the prior state toward its own base is again each state's rule; the same gap marker above applies.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Rates, bases and thresholds are rules as data with effective ranges ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)); the employer's own SUI rate lives on `tax_registrations` and comes from a `notices` row; wage base consumption is a query over `accumulators`, and an acquired predecessor's wages are a separate input to it.

```sql
-- Statutory rates, bases and thresholds, by tax and jurisdiction, effective-dated.
CREATE TABLE tax_rates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL,         -- 'social_security', 'medicare', 'additional_medicare',
                                             -- 'futa', 'sui_employer', 'sui_employee', 'ett', ...
  payer               TEXT NOT NULL CHECK (payer IN ('employee', 'employer')),
  rate                NUMERIC(8, 6),         -- 0.062000; null where the employer's own rate applies
  wage_base           BIGINT,                -- cents per worker per year; null = no limit
  threshold           BIGINT,                -- cents; tax applies to wages in excess of it
  rate_source         TEXT NOT NULL CHECK (rate_source IN ('statute', 'employer_registration')),
  source_ref          TEXT NOT NULL,         -- 'Pub 15 (2026) s.9', 'DOL sigpros July 2026', ...
  valid_during        DATERANGE NOT NULL,    -- by pay date
  EXCLUDE USING GIST (jurisdiction_id WITH =, tax_type WITH =, payer WITH =,
    valid_during WITH &&)
);

-- Seeds, for illustration (amounts in cents).
-- ('US', 'social_security', 'employee', 0.062, 18450000, NULL, 'statute', '[2026-01-01,2027-01-01)')
-- ('US', 'social_security', 'employee', 0.062, 19230000, NULL, 'statute', '[2027-01-01,2028-01-01)')
-- ('US', 'additional_medicare', 'employee', 0.009, NULL, 20000000, 'statute', '[2013-01-01,)')
-- ('US', 'futa', 'employer', 0.060, 700000, NULL, 'statute', ...)
-- ('US-CA', 'sui_employer', 'employer', NULL, 700000, NULL, 'employer_registration', ...)

-- FUTA credit reductions: one row per state per year, potential until final.
CREATE TABLE credit_reduction_states (
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_year            SMALLINT NOT NULL,
  reduction_rate      NUMERIC(6, 4) NOT NULL,      -- 0.0120 for California 2025
  bcr_add_on_rate     NUMERIC(6, 4) NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('potential', 'final', 'avoided')),
  source_ref          TEXT NOT NULL,         -- DOL notice, Schedule A revision
  determined_on       DATE,                  -- after November 10 for final
  PRIMARY KEY (jurisdiction_id, tax_year)
);

-- A state rate notice as received, and what it set.
CREATE TABLE sui_rate_notices (
  notice_id           UUID PRIMARY KEY REFERENCES notices (id),
  tax_registration_id UUID NOT NULL REFERENCES tax_registrations (id),
  rate_year           DATERANGE NOT NULL,    -- January to January, or July to July in Texas
  total_rate          NUMERIC(8, 6) NOT NULL,
  components          JSONB NOT NULL DEFAULT '{}',  -- experience, surtaxes, ETT and the like
  reserve_balance     BIGINT,                -- cents, when the notice states it
  taxable_payroll_basis BIGINT,              -- the payroll the ratio was computed on
  protest_by          DATE,
  revises_notice_id   UUID REFERENCES sui_rate_notices (notice_id),
  voluntary_contribution_by DATE             -- computed from the state rule, when allowed
);

-- Wages a predecessor paid, carried into the successor's bases.
CREATE TABLE successor_wage_transfers (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  successor_employer_id UUID NOT NULL REFERENCES employers (id),
  predecessor_ein     CHAR(9) NOT NULL,
  worker_id           UUID NOT NULL REFERENCES workers (id),
  tax_year            SMALLINT NOT NULL,
  tax_type            TEXT NOT NULL,         -- 'social_security', 'additional_medicare', 'futa',
                                             -- 'sui_employer', ...
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  wages               BIGINT NOT NULL,       -- cents counted toward the base or threshold
  basis               TEXT NOT NULL,         -- 'reg_31.3121(a)(1)-1(b)', 'predecessor_filed_940',
                                             -- 'state_successor_determination', ...
  acquisition_date    DATE NOT NULL,
  document_id         UUID REFERENCES documents (id),
  UNIQUE (successor_employer_id, worker_id, tax_year, tax_type, jurisdiction_id)
);

-- The worker's SUI state, decided by the localization tests, over time.
ALTER TABLE worker_tax_locations
  DROP CONSTRAINT IF EXISTS worker_tax_locations_role_check,
  ADD CONSTRAINT worker_tax_locations_role_check
    CHECK (role IN ('resident', 'work', 'sui')),
  ADD COLUMN sui_test TEXT CHECK (sui_test IN ('localized', 'base_of_operations',
    'direction_and_control', 'residence', 'reciprocal_election', 'elected_coverage'));

-- Remaining room under a wage base for one worker, as of a pay run.
-- $1 = worker, $2 = employer, $3 = tax type, $4 = jurisdiction, $5 = tax year.
SELECT GREATEST(r.wage_base
         - COALESCE(SUM(a.taxable_wages), 0)
         - COALESCE((SELECT SUM(t.wages) FROM successor_wage_transfers t
                     WHERE t.successor_employer_id = $2 AND t.worker_id = $1
                       AND t.tax_type = $3 AND t.jurisdiction_id = $4
                       AND t.tax_year = $5), 0), 0) AS room
FROM tax_rates r
LEFT JOIN accumulators a
  ON a.worker_id = $1 AND a.employer_id = $2 AND a.tax_year = $5
 AND a.key LIKE '%:' || $3 || ':' || $4::TEXT
WHERE r.jurisdiction_id = $4 AND r.tax_type = $3 AND r.payer = 'employee'
  AND r.valid_during @> make_date($5, 12, 31)
GROUP BY r.wage_base;
```

Design notes:

- **The wage base query reads paid lines only.** `accumulators` counts statements in `paid` runs; a run being calculated adds its own lines in memory. Two runs for the same worker calculated at once (an off-cycle bonus and the regular run) must serialize on the worker, or both will spend the same room under the base; a lock per worker per employer for the calculation phase is the simplest correct fix.
- **Compare with `>`, compute cumulatively, store both wages.** `subject_wages` is everything subject before the base; `taxable_wages` is what the tax was computed on. Additional Medicare's threshold test is on year-to-date wages strictly greater than $200,000. If the engine computes cumulatively, store the method on the calculation so a later recalculation reproduces it.
- **Credit reduction is a year-end liability with an estimate during the year.** Accrue the potential rate on each quarter's FUTA wages so the client sees the cost, and true it up when the reduction is final; the deposit is due with the fourth quarter regardless ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **A SUI rate change is a retro event.** A notice that revises the rate back to January 1 re-dates nothing but re-prices every SUI liability since then; compute the difference by quarter and route it to the state's amendment or adjustment process. The notice row, its revision chain and the registration's `valid_during` are what let the system explain the number.
- **Map each tax to the 941 and 940 lines at the line level.** Social Security, Medicare and Additional Medicare lines feed 941 lines 5a to 5d by their `taxable_wages`; FUTA lines feed 940 by state for Schedule A. Keep the mapping in data with the form revision, since lines move ([The Shape of a Rule](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)).

## Auditing

FICA, FUTA and SUI are audited by arithmetic: the IRS compares the 941s with the W-2s, the state compares wage reports with its own rate and base, and a SUI auditor tests whether workers were reported to the right state. Keep:

- **The rate, base and threshold behind every tax line**, by `tax_rates` row and source, so a statement can be recomputed years later.
- **Each employer's SUI rate notices** with their received dates, revisions and the runs that used each rate.
- **The fractions-of-cents adjustment each quarter** and how it was computed, since Pub 15 asks employers to "prepare and retain a brief supporting statement" for current period adjustments.
- **Successor wage transfers** with the acquisition documents, the predecessor's EIN and the basis for counting them.
- **The SUI state determination per worker**: which localization test decided it, when, and any reciprocal coverage election.
- **Voluntary contribution decisions**: the projection, the approval and the payment confirmation.

## What This Means for the System You Build

- **Put every rate, base and threshold in an effective-dated table** with its source, and resolve them by pay date.
- **Key wage bases on the worker and employer, not the employment,** and load predecessor wages separately with their basis.
- **Test the exact boundary:** $184,500 reached to the cent and $200,000 reached exactly, where the next cent is the first taxed (or untaxed) one.
- **Choose per-payment or cumulative rounding deliberately,** record it, and reconcile the difference on 941 line 7 every quarter.
- **Accrue potential FUTA credit reductions during the year** and settle them with the fourth quarter.
- **Make the SUI rate a blocking, notice-backed registration value,** never a default, and treat a revised notice as a retro adjustment.
- **Decide the SUI state with the localization tests and store the result,** separate from income tax work states.
- **Model employee UI contributions** (Alaska, New Jersey, Pennsylvania) as employee tax lines with their own bases.

## References

**Law and regulation**

- [42 USC 503](https://www.law.cornell.edu/uscode/text/42/503), subsection (k): mandatory experience transfer under common ownership, no transfer to acquirers seeking a lower rate, and required penalties

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), Social Security and Medicare rates and the $184,500 base, Additional Medicare withholding, household, election and farmworker thresholds, the successor employer example, FUTA tests, rate, credit, deposits and credit reduction timing, fractions-of-cents adjustments, prior-year wage bases and W-2 reconciliation steps
- [IRS: Instructions for Form 940 (2025)](https://www.irs.gov/instructions/i940), credit reduction states defined, lines 9 to 11, successor wages and Schedule A for multi-state employers, and the February 2, 2026 due date
- [IRS: Schedule A (Form 940) for 2025](https://www.irs.gov/pub/irs-pdf/f940sa.pdf), California at 0.012 and the U.S. Virgin Islands at 0.045, and the State A example
- [IRS: Instructions for Form 941 (Rev. March 2026)](https://www.irs.gov/instructions/i941), lines 5a to 5d and the 2026 rates
- [IRS: General Instructions for Forms W-2 and W-3 (2026)](https://www.irs.gov/instructions/iw2w3), box 3 capped at $184,500 and elective deferrals in box 3
- [U.S. Department of Labor: FUTA credit reductions](https://oui.doleta.gov/unemploy/futa_credit.asp), consecutive January 1 balances, the November 10 repayment deadline and further reductions
- [U.S. Department of Labor: Significant Provisions of State UI Laws, effective July 2026](https://oui.doleta.gov/unemploy/content/sigpros/2020-2029/July2026.pdf), taxable wage bases, rate ranges, new employer rates and rate years
- [U.S. Department of Labor: Comparison of State UI Laws 2023, Coverage](https://oui.doleta.gov/unemploy/pdf/uilawcompar/2023/coverage.pdf), localization of work, base of operations, reciprocal coverage arrangements and elected coverage
- [U.S. Department of Labor: Comparison of State UI Laws 2023, Financing](https://oui.doleta.gov/unemploy/pdf/uilawcompar/2023/financing.pdf), the 5.4% maximum rate, employee contributions in Alaska, New Jersey and Pennsylvania, experience rating and the reserve ratio, new employer rates, voluntary contributions and reimbursing employers
- [California EDD: Rates and withholding](https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/), the $7,000 UI wage base, the 3.4% new employer rate and the 0.1% Employment Training Tax

**Vendor documentation**

- [Check: Taxes, agencies and jurisdictions](https://docs.checkhq.com/docs/taxes-and-agencies.md), jurisdictions, the Tax object's payer and effective dates, and agencies
- [Gusto Embedded: Get tax requirements for a state](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_uuid-tax_requirements-state.md), effective-dated requirement sets, the blocking SUI rate and the reimbursable flag
- [Symmetry: What is the Symmetry Tax Engine](https://docs.symmetry.com/ste/overview/what-is-the-ste), taxes covered, pay-date rules and stateless calls with caller-supplied year-to-date
- [Vertex: Payroll tax](https://www.vertexinc.com/solutions/tax-type/payroll-tax), calculation scope and jurisdiction assignment

**In practice**

- [Journal of Accountancy: Social Security wage base and COLA announced for 2027 (October 14, 2026)](https://www.journalofaccountancy.com/news/2026/oct/social-security-wage-base-and-cola-announced-for-2027/), the $192,300 base for 2027
- [PayrollOrg: California and Virgin Islands may face credit reduction for 2026 (April 7, 2026)](https://payroll.org/news-resources/news/news-detail/2026/04/07/california-and-virgin-islands-may-face-credit-reduction-for-2026), DOL's potential 2026 rates and the BCR add-on
- [PayrollOrg: U.S. Virgin Islands pays off outstanding UI loans (June 26, 2026)](https://payroll.org/news-resources/news/news-detail/2026/06/26/u.s.-virgin-islands-pays-off-outstanding-ui-loans), no 2026 reduction if no balance on November 10
