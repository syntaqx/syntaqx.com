+++
title = "Payroll by Industry"
nav_title = "Payroll by Industry"
description = "Industry payroll: restaurants, Davis-Bacon certified payroll, farms and H-2A, household employers, clergy, schools, 8 and 80, staffing and union shops."
category = "Workforce Industry"
order = 2612
part = "Gross to Net"
tags = ["payroll", "industries", "certified-payroll", "household-employers", "clergy", "union"]
+++

The gross-to-net pipeline is the same everywhere, but some industries change what goes into it. A restaurant's payroll is built around tips the employer never holds and service charges it does. A federal construction contractor files a certified payroll every week it works on a covered job, signed under the False Statements Act. A farm files Form 943 instead of Form 941, its seasonal hand harvesters may owe no Social Security at all, and its H-2A workers owe no FICA but do get a W-2. A family paying a nanny files Schedule H with its own tax return. A church's minister is an employee whose pay has no Social Security withheld, because ministers pay self-employment tax on it, and the church may have elected out of FICA for everyone else too. A school district pays ten months of work over twelve. A hospital can replace the workweek with a 14-day period. A union contractor sends a monthly report of hours to a pension fund for every covered employee.

Each of those is a set of rules and records the core model has to carry without a separate payroll product for each. This chapter covers restaurants and hospitality, construction and certified payroll, agriculture and H-2A, household employers, nonprofits and churches, schools, healthcare's 8 and 80 system, staffing and multiple worksite employers, and seasonal and union shops, and the tables that hold them. One change for 2026 sits under the agriculture section: Publication 51, the agricultural employer's guide, is discontinued, and "Pub. 15 is used by all employers, including agricultural employers and employers in the U.S. territories."

## Restaurants and Hospitality

Restaurant payroll is tip payroll, and [Tips & the 2025 Tax Law](/books/workforce/tips-and-the-2025-deductions) covers it in full. What the vertical adds:

- **Tip credit wages.** Under the FLSA, "An employer must pay a tipped worker at least $2.13 per hour," and "The maximum tip credit that an employer can currently claim is $5.12 per hour"; a tipped employee is one who customarily and regularly receives "more than $30 a month in tips." Many states set a higher cash wage or ban the credit. The engine has to check each workweek that cash wage plus tips reaches the minimum and pay a make-up line when it doesn't (Check's `tip_credit_adjustment_to_minimum_wage` and Gusto's Minimum Wage Adjustment earning types are that line). [Tipped Employees](/books/workforce/tipped-employees) owns the tip credit, pools and dual jobs.
- **Service charges as wages.** An automatic gratuity on a large party is not a tip under Rev. Rul. 2012-18, so its distribution to staff is regular wages, taxed at the regular rate's withholding and entering the regular rate for overtime; Toast's time entry keeps automatic gratuity service charges in their own fields for this reason.
- **Allocated tips and Form 8027** at establishments with more than 10 employees on a typical business day, and the section 45B credit, which for food or beverage uses the $5.15 minimum wage in effect on January 1, 2007.
- **Occupation codes.** From 2026, every tipped job needs a Treasury Tipped Occupation Code for W-2 box 14b: 101 bartenders, 102 wait staff, and the rest of the 101 to 110 group for food and beverage service; hotel roles are in hospitality and guest services, 301 to 304.

## Construction and Certified Payroll

A contractor on a federally funded or assisted construction project covered by the Davis-Bacon and Related Acts pays at least the prevailing wage and fringe rates in the project's wage determination and reports it weekly. The regulation (29 CFR 5.5(a)(3)(ii)) says the contractor "must submit weekly, for each week in which any DBA- or Related Acts-covered work is performed, certified payrolls," which "may be submitted using Optional Form WH-347 or in any other format desired." The requirements a payroll system has to meet:

- **Weekly, per project, per contract.** The report is for one project and one week, listing each worker by an individual identifier (the regulation allows the last four digits of the SSN rather than the full number), their classification, hours each day, rates, gross pay, deductions and net, for work on that project.
- **A signed Statement of Compliance.** Each payroll carries a statement, signed by the contractor or subcontractor, certifying that the payroll is correct and complete, that each worker was paid the full weekly wages earned with no improper deductions, and that each was paid at least the applicable wage and fringe rates. The DOL's WH-347 page says it "is subject to the penalties provided by 18 U.S.C. § 1001." Signatures may be handwritten or legally valid electronic signatures, and electronic submission is allowed "as long as the electronic system requires a legally valid electronic signature."
- **Fringe benefits.** The fringe portion of the prevailing rate can be met through contributions to bona fide benefit plans or paid in cash, and the statement says which; a cash fringe is wages, a plan contribution is a memo line and a liability to the plan.
- **Retention.** Payroll records are kept for three years after the prime contract is completed.
- **Form status.** The WH-347 carries "OMB Control No. 1235-0008, Expires 01/31/2028." The 2023 Davis-Bacon rule, "effective on October 23, 2023," restated the weekly certified payroll as "expressly required by 40 U.S.C. sec 3145"; a June 24, 2024 nationwide preliminary injunction in the Northern District of Texas blocked three of its provisions (material suppliers, truck drivers' onsite time and operation of law), none of them a payroll provision, and the DOL's construction page lists no WH-347 revision for 2025 or 2026 as of November 2026.

For payroll, certified payroll means three things the general engine doesn't have: hours by project and day for every worker on a covered job (a time entry with a project and a classification, not just a job), rates checked against the wage determination for the classification and county, and a weekly report generated from paid statements and signed. State prevailing wage laws, public works registration and the field side of prevailing wage are in Field Operations ([Prevailing Wage and Public Work](/books/field-operations/technician-workforce#prevailing-wage-and-public-work)).

## Agriculture and H-2A

Agricultural employers use Pub 15 from 2026 and file Form 943, "for the previous calendar year," instead of Form 941; tax can be paid with the return if the liability is under $2,500. The tests are different from other employers':

- **Social Security, Medicare and income tax withholding.** All cash farm wages are subject if either test is met: "You pay cash wages to an employee of $150 or more in a year for farmwork," a per-worker test, or "The total that you pay for farmwork (cash and noncash) to all your employees is $2,500 or more during the year." A seasonal hand-harvest farmworker paid under $150 a year is exempt even when the employer passes $2,500, though those wages count toward the $2,500 test; wages of a child under 18 working for a parent on the farm aren't subject to FICA. "Farm operators and crew leaders must withhold federal income tax from the wages of farmworkers if the wages are subject to social security and Medicare taxes."
- **FUTA.** The employer is subject if it paid "cash wages of $20,000 or more to farmworkers during any calendar quarter in 2025 or 2026," or employed "10 or more farmworkers during at least some part of a day ... during any 20 or more different weeks."
- **Noncash wages.** Commodity wages and other noncash pay are generally outside FICA for farmworkers unless the substance is a cash payment; Zeal's catalog has a Commodity earning component for in-kind wages such as hay or cattle.
- **H-2A workers.** Their wages count toward the FUTA test, but "wages paid to H-2A visa workers aren't subject to FUTA tax," and they aren't Social Security or Medicare wages. The employer reports compensation "of $600 or more paid in 2025 ($2,000 or more paid in 2026)" in box 1 of a W-2 but not in boxes 3 and 5. "An employer isn't required to withhold federal income tax from compensation paid to an H-2A worker ... but may withhold if the worker asks for withholding and the employer agrees," with a W-4; without a TIN, at $2,000 or more in 2026, the employer must backup withhold.
- **Crew leaders.** "If you're a crew leader, you're an employer of farmworkers," meaning a person who furnishes and pays workers to do farmwork for the farm operator; the farm operator records the crew leader's name, address and EIN. For FUTA, the workers are the farm operator's employees unless the crew leader is registered under the Migrant and Seasonal Agricultural Worker Protection Act or substantially all the workers operate machines the crew leader provides.

The engine needs an employer-level flag for Form 943, per-worker annual counters for the $150 test, an employer-level counter for the $2,500 test (which, once crossed, makes earlier wages that year subject), and a visa status on the worker that switches FICA and FUTA off and changes the W-2.

## Household Employers

A family that employs a nanny, housekeeper or caregiver is an employer, usually without an EIN until it needs one, and Pub 926 (for use in 2026) sets lighter rules:

- **FICA.** "Social security and Medicare taxes apply to the wages of household workers you pay $3,000 or more in cash wages in 2026," with Social Security wages capped at $184,500. Noncash wages aren't FICA wages. Wages paid to the employer's spouse, child under 21, parent (with a child-care exception) or "An employee who is under the age of 18 at any time during the year" don't count, unless household work is the under-18 employee's principal occupation (a student's isn't).
- **FUTA.** Applies if total cash wages to household employees are "$1,000 or more in any calendar quarter of 2025 or 2026," on the first $7,000 per employee.
- **Income tax.** "You should withhold federal income tax only if your household employee asks you to withhold it and you agree," with a W-4, and either side can end the agreement in writing.
- **Reporting.** "File Schedule H (Form 1040) with your 2026 federal income tax return," or alone if no return is required; a household employer that also has a business may report on its Forms 941, 944 or 943 and 940 instead. W-2s go to the employee and SSA by February 1, 2027, but "Don't send Form W-2 to the SSA if you didn't withhold federal income tax and the social security and Medicare wages were below $3,000 for 2026."

Household payroll services exist because each threshold is an annual counter that can flip mid-year: the $3,000 FICA test makes every 2026 cash wage to that worker subject once crossed, so the engine either withholds from the start (expecting to cross) or catches up when it does. State household employer rules (unemployment thresholds, paid leave programs) are state rows like any other.

## Nonprofits and Churches

**Ministers.** A minister is a dual-status worker. "If a congregation employs you and pays you a salary, you are generally a common-law employee and income from the exercise of your ministry is wages for income tax purposes," but ministerial earnings "are covered by social security and Medicare under SECA," the self-employment tax, not FICA. Pub 15-A: "Whether the minister is an employee or self-employed, the earnings of a minister aren't subject to federal income, social security, and Medicare tax withholding," but "you may agree with the minister to voluntarily withhold tax to cover the minister's liability for self-employment tax and federal income tax," which is withheld and reported as income tax. A housing allowance must be designated "before it makes the payment" and in "a definite amount"; it is excluded from box 1 (it may be shown in box 14) but included for self-employment tax. Check's earning catalog has `clergy_housing` and `reported_clergy_housing` types; Symmetry's wage types include a minister housing allowance "exempt from FIT but subject to SECA."

**Churches that elect out of FICA.** A church or qualified church-controlled organization opposed to Social Security for religious reasons can elect out by "filing two copies of Form 8274," and must file "before the first date on which a quarterly employment tax return (Form 941) ... would otherwise be due." Its non-minister employees then have no FICA withheld; they pay self-employment tax if paid $108.28 or more in a year. Employees of 501(c)(3) organizations are also exempt from FICA if paid under $100 in a year.

**FUTA.** "An organization that is exempt from federal income tax under section 501(c)(3) ... is also exempt from FUTA tax. This exemption can't be waived," though it doesn't cover wages the organization pays on behalf of a non-501(c)(3) employer. State unemployment rules for nonprofits are the state's own ([FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta) in the Payroll Tax part covers SUTA).

In data, a minister is a worker with a clergy election (FICA exempt, SECA by the worker, voluntary withholding agreement or not, housing allowance designation by year), and a church employer carries its Form 8274 election and 501(c)(3) status, each of which changes rows of the taxability matrix for that employer's workers.

## Schools

School employees who work ten months are often paid over twelve. The tax question is when the summer installments are wages, and the deferred compensation question is whether the election to spread pay is a 409A deferral. Treas. Reg. 1.409A-2(a)(14) answers the second: an election to annualize recurring part-year compensation "is considered to meet the requirements of this paragraph (a) if the election is made before the services" begin and "the election does not defer payment of any of the recurring part-year compensation to a date beyond the last day of the 13th month following the first date of the service period," for positions that "will continue on similar terms and conditions in subsequent years" with a service period under 12 months spanning two taxable years. The first follows from the general timing rules: income tax is withheld "from the employee's wages as and when paid, either actually or constructively" ([Treas. Reg. 31.3402(a)-1(b)](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-C/part-31/subpart-E/section-31.3402(a)-1)), and for FICA "wages are received by an employee at the time that they are paid by the employer to the employee" ([Treas. Reg. 31.3121(a)-2(a)](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-C/part-31/subpart-B/section-31.3121(a)-2)). Neither regulation names school pay; applying them, payroll systems withhold on each installment when it's paid, which is how the summer checks of a September-to-June year end up on two W-2s.

The engine models it as an election per employment and school year: earnings accrue each period of work and pay out in level installments over the pay year, with a deferred balance the employer holds. Termination mid-year pays out the balance; a change in the contract changes the installment from the next period. Each installment's taxes use the rules and wage bases in force on its check date.

## Healthcare

Hospitals and residential care establishments may use the 8 and 80 system under FLSA section 7(j) instead of the 40-hour workweek. The regulation (29 CFR 778.601) requires an agreement "arrived at between the employer and employee before performance of the work" (not necessarily written, but with a special record if not) and "a work period of 14 consecutive days" in place of the workweek; overtime at time and a half is owed for hours "in excess of 8 hours in any workday and in excess of 80 hours in such 14-day period," with daily overtime credited toward the 80-hour overtime so hours aren't paid twice. The DOL's Fact Sheet #54 adds that the period must be "a fixed and regularly recurring 14-day period," and that an employer may use different systems for different employees but not both for one employee; switching back and forth to reduce overtime isn't allowed.

For the engine, 8 and 80 is an overtime rule set on the employment, with its own period definition, and it changes what "FLSA-required overtime" means for the qualified overtime deduction: under 8 and 80, the section 7(j) daily and 14-day overtime is the required overtime, and the premium is computed on that period's regular rate ([The Overtime Premium as Payroll Must Track It](/books/workforce/tips-and-the-2025-deductions#the-overtime-premium-as-payroll-must-track-it)).

## Staffing and Multiple Worksite Employers

A staffing firm employs workers who work at clients' sites, and its payroll is driven by the assignment, not the worker. The worksite sets the work state and local jurisdictions for withholding, the state for unemployment localization, the minimum wage and the workers' compensation class (the premium side is in the Insurance volume's [Workers' Compensation](/books/insurance/workers-compensation) and [Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp)); a worker on two assignments in one period has two sets of time entries, rates and tax locations. The firm, not the client, is generally the employer for tax purposes when it hires, pays and directs the workers' employment terms, but the federal rules for who the employer is are the general ones; I haven't found an IRS or DOL page specific to staffing firms for this chapter, and [Worker Classification](/books/workforce/worker-classification) in the Contractors and Global part covers the tests.

Two federal arrangements change who the employer is for tax. Related corporations that pay a shared employee through a common paymaster "are considered to be a single employer," so the employee's wage bases don't restart at each. And a certified PEO "is generally treated for employment tax purposes as the employer of any individual who performs services for a customer," filing aggregate returns with Schedule R, while an employer that outsources payroll otherwise "will generally remain responsible for those duties, including liability for the taxes." [PEOs & Co-Employment](/books/workforce/peos-and-co-employment) in The Business part covers PEOs.

## Seasonal and Union Shops

**Seasonal employers** hire and release on a calendar. The ACA's applicable large employer test has a seasonal worker exception: an employer whose workforce exceeds 50 full-time employees "for 120 days or fewer during the calendar year" is not an ALE if "The employees in excess of 50 employed during such 120-day period are seasonal workers," such as "retail workers employed exclusively during holiday seasons." [The ACA Employer Mandate & 1095-C](/books/workforce/aca-employer-mandate) in the Benefits Administration part covers the counting. For payroll, seasonal work means frequent rehires on the same worker (accumulators continue, and Pub 15 treats a worker rehired in 2026 who doesn't furnish a new W-4 like any new employee without one, at the single default), and agricultural seasonal workers have the $150 test above.

**Union shops** run payroll under a collective bargaining agreement, which is a rule set with its own effective dates: wage rates by classification and step, overtime and premium rules beyond the FLSA (daily overtime, Saturday and Sunday rates, shift differentials), and fringe contributions per hour worked to multiemployer funds.

- **Dues check-off.** An employer may deduct union dues only with "a written assignment which shall not be irrevocable for a period of more than one year, or beyond the termination date of the applicable collective agreement, whichever occurs sooner" (29 USC 186(c)(4)); the assignment is a document with a revocation window on every dues election.
- **Fringe remittance reports.** Multiemployer pension, health and training funds bill contributions per hour, and the employer sends a monthly report of hours per covered employee. The Western Conference of Teamsters Pension Trust's employer bulletin is typical: "The total number of hours being reported for each employee must be recorded in the hours column," each record needs the "correct name, social security number, and local union number," electronic reports need the "Hourly Pension contribution rate," "Contributions are due even if you do not receive the form on time," and a report must be returned even when no covered employees were paid or the account is treated as delinquent. Contribution rates are set by agreement; the trust's guidelines set floors such as "not less than ten (10) cents per hour" for a limited period.

For the engine, the agreement's rates and rules are effective-dated rows by classification, contributions are memo lines (employer-paid, per hour, per fund) with liabilities to each fund, and the monthly report is a filing generated from paid hours, not from scheduled hours, because funds audit contributions against payroll records.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Most industry rules are rows in existing tables (taxability rules per employer type, overtime rule sets, deduction codes); four tables are new.

```sql
ALTER TABLE employers
  ADD COLUMN industry_profile   TEXT[] NOT NULL DEFAULT '{}',  -- 'restaurant', 'construction',
                                                               -- 'agriculture', 'household', ...
  ADD COLUMN exempt_501c3       BOOLEAN NOT NULL DEFAULT FALSE,  -- FUTA exempt
  ADD COLUMN fica_election_8274 BOOLEAN NOT NULL DEFAULT FALSE,  -- church elected out of FICA
  ADD COLUMN common_paymaster_group_id UUID;                     -- related corporations as one

ALTER TABLE workers
  ADD COLUMN visa_category      TEXT CHECK (visa_category IN ('h2a', 'other'));  -- H-2A: no FICA/FUTA

ALTER TABLE job_assignments
  ADD COLUMN overtime_rule_set  TEXT NOT NULL DEFAULT 'flsa_40'
    CHECK (overtime_rule_set IN ('flsa_40', 'flsa_7j_8_80', 'state_daily', 'cba')),
  ADD COLUMN cba_classification TEXT,                -- the agreement's job class and step
  ADD COLUMN project_ref        TEXT;                -- a covered project, for certified payroll

CREATE TABLE certified_payroll_reports (     -- one project, one week, one contractor
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  project_ref         TEXT NOT NULL,         -- the contract and project number
  wage_determination_ref TEXT NOT NULL,      -- the determination and modification in force
  week                DATERANGE NOT NULL,
  payroll_number      INT NOT NULL,          -- sequential per project; 'final' flagged below
  is_final            BOOLEAN NOT NULL DEFAULT FALSE,
  fringe_method       TEXT NOT NULL CHECK (fringe_method IN ('plans', 'cash', 'mixed')),
  lines               JSONB NOT NULL,        -- per worker: identifier, classification, daily hours,
                                             -- rates, gross, deductions, net, from paid statements
  statement_of_compliance_document_id UUID REFERENCES documents (id),  -- signed
  signed_by           TEXT,
  signed_at           TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,
  retention_until     DATE NOT NULL,         -- 3 years after the prime contract completes
  UNIQUE (employer_id, project_ref, week)
);

CREATE TABLE union_fringe_remittances (      -- a monthly contribution report to one fund
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  fund_ref            TEXT NOT NULL,         -- the trust and the employer's account number
  agreement_ref       TEXT NOT NULL,         -- the CBA and its rate schedule
  work_month          DATE NOT NULL,         -- first of the month reported
  lines               JSONB NOT NULL,        -- per worker: name, SSN token, local, hours, rate, amount
  total_hours         NUMERIC(10, 2) NOT NULL,
  total_amount        BIGINT NOT NULL,
  due_on              DATE NOT NULL,
  liability_id        UUID REFERENCES liabilities (id),
  status              TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'paid',
                        'delinquent', 'audited')),
  UNIQUE (employer_id, fund_ref, work_month)
);

CREATE TABLE household_employer_profiles (   -- a family as an employer
  employer_id         UUID PRIMARY KEY REFERENCES employers (id),
  filer_person_id     UUID NOT NULL REFERENCES persons (id),   -- whose Form 1040 carries Schedule H
  reports_on          TEXT NOT NULL CHECK (reports_on IN ('schedule_h', 'business_returns')),
  fica_threshold      BIGINT NOT NULL,       -- 300000 for 2026, by year in wage_bases
  futa_quarter_threshold BIGINT NOT NULL,    -- 100000
  income_tax_by_agreement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE clergy_elections (              -- a minister's dual status, by year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  tax_year            SMALLINT NOT NULL,
  voluntary_withholding BOOLEAN NOT NULL DEFAULT FALSE,   -- agreement to withhold for SE and income tax
  agreement_document_id UUID REFERENCES documents (id),
  housing_allowance   BIGINT,                -- the designated amount
  designated_on       DATE,                  -- must precede payment
  designation_document_id UUID REFERENCES documents (id),
  UNIQUE (worker_id, tax_year),
  CHECK (housing_allowance IS NULL OR designated_on IS NOT NULL)
);
```

Design notes:

- **Industry rules are taxability and overtime rows, not branches.** H-2A, 501(c)(3), Form 8274, clergy and household thresholds each change specific `taxability_rules` or `wage_bases` rows for specific employers or workers, effective-dated, so the pipeline in [Gross-to-Net](/books/workforce/gross-to-net#how-to-build-it) stays one pipeline.
- **Threshold tests are accumulators that can flip retroactively.** The farm $150 and $2,500 tests and the household $3,000 test make earlier wages in the year subject once crossed; the engine either withholds prospectively from the first dollar or writes catch-up lines when the counter crosses, and records which.
- **Reports are built from paid statements.** Certified payrolls and fund reports read paid hours and pay by project or fund; a report generated from schedules or timesheets that later changed won't match the payroll records an auditor compares it to.
- **Signatures are evidence.** The Statement of Compliance and the clergy designations are documents with signer, time and version, because the first is a certification under 18 USC 1001 and the second has to predate payment ([Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds)).

## Auditing

Each vertical has its own auditor: DOL Wage and Hour for Davis-Bacon and the 8 and 80 system, fund auditors for multiemployer contributions, the IRS for agricultural and household thresholds and clergy, and state agencies for prevailing wage:

- **Certified payrolls** with their wage determinations, the paid statements behind each line, signed statements and submission dates, kept for three years after completion.
- **Fund reports** tied to paid hours by worker and to the agreement's rates, with every month accounted for, including zero-employee months.
- **Threshold crossings** for farm and household employers, with the date and the catch-up decision.
- **Clergy elections and housing designations** before the payments they cover; Form 8274 and 501(c)(3) evidence on the employer.
- **8 and 80 agreements** and the special record where the agreement isn't written; the work period definition and any changes.

## What This Means for the System You Build

- **Express industries as data on the core model:** employer profiles, worker visa status, overtime rule sets and taxability rows, not separate payrolls.
- **Carry project, classification and day on time entries** where certified payroll or a CBA needs them.
- **Generate certified payrolls and fund reports from paid statements,** with signatures as documents.
- **Implement threshold tests as accumulators,** with a stated rule for wages before the crossing.
- **Model ministers' dual status and housing designations by year,** and churches' FICA election on the employer.
- **Let the overtime rule set change the period,** so 8 and 80 and CBA overtime compute correctly and feed code TT.
- **Drive staffing payroll from the assignment's worksite** for tax, unemployment, minimum wage and workers' compensation class.

## References

**Law and regulation**

- [29 CFR 5.5](https://www.law.cornell.edu/cfr/text/29/5.5), Davis-Bacon contract clauses: weekly certified payrolls, the Optional Form WH-347, individual identifiers, the Statement of Compliance, electronic signatures and submission, and three-year retention
- [Federal Register: Updating the Davis-Bacon and Related Acts Regulations (August 23, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-08-23/html/2023-17221.htm), the October 23, 2023 effective date and weekly certified payrolls under 40 USC 3145
- [29 CFR 778.601](https://www.law.cornell.edu/cfr/text/29/778.601), the 8 and 80 system for hospitals and residential care establishments
- [26 CFR 1.409A-2](https://www.law.cornell.edu/cfr/text/26/1.409A-2), paragraph (a)(14), elections to annualize recurring part-year compensation
- [29 USC 186](https://www.law.cornell.edu/uscode/text/29/186), the dues check-off exception and its written assignment

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15.pdf), the discontinuation of Pub 51, farmworker FICA and withholding tests, Form 943, the farmworker FUTA test, H-2A workers and crew leaders, and CPEOs and outsourced payroll in section 16
- [IRS: Publication 15-A (2026), Employer's Supplemental Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p15a.pdf), ministers and voluntary withholding, the parsonage allowance on the W-2, Form 8274 elections, the $108.28 and $100 thresholds, the 501(c)(3) FUTA exemption and common paymasters
- [IRS: Publication 517 (2025), Social Security and Other Information for Members of the Clergy (PDF)](https://www.irs.gov/pub/irs-pdf/p517.pdf), ministers as employees for income tax and SECA for Social Security, the housing allowance designation and churches that elect out
- [IRS: Publication 926 (2026), Household Employer's Tax Guide (PDF)](https://www.irs.gov/pub/irs-pdf/p926.pdf), the $3,000 FICA and $1,000 FUTA thresholds, family member exceptions, income tax by agreement, Schedule H and W-2 filing
- [IRS: Internal Revenue Bulletin 2012-26 (Rev. Rul. 2012-18)](https://www.irs.gov/irb/2012-26_IRB), tips and service charges
- [IRS: Determining if an employer is an applicable large employer](https://www.irs.gov/affordable-care-act/employers/determining-if-an-employer-is-an-applicable-large-employer), the seasonal worker exception
- [IRS: Treasury Tipped Occupation Codes](https://www.irs.gov/tippedoccupations), food and beverage and hospitality codes
- [DOL WHD: Fact Sheet #15, Tipped Employees Under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa), the $2.13 cash wage, the $5.12 tip credit and the $30 test
- [DOL WHD: Form WH-347](https://www.dol.gov/agencies/whd/forms/wh347), weekly submission, the Statement of Compliance and 18 USC 1001, fringe benefits and the OMB control number
- [DOL WHD: Construction and Davis-Bacon](https://www.dol.gov/agencies/whd/government-contracts/construction), the June 24, 2024 preliminary injunction and the provisions it covers
- [DOL WHD: Fact Sheet #54, the Health Care Industry and Calculating Overtime Pay](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime), the fixed 14-day period, the prior agreement and one system per employee

**Vendor documentation**

- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings.md), tip credit adjustment and clergy housing earning types
- [Gusto Embedded: Get earning types](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-earning_types.md), Minimum Wage Adjustment
- [Symmetry: Wage types](https://docs.symmetry.com/ste/core-concepts/wage-types.md), the minister housing allowance wage type
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), automatic gratuity service charges
- [Zeal: Earning components](https://docs.zeal.com/docs/earning-components.md), commodity wages

**In practice**

- [Western Conference of Teamsters Pension Trust: Monthly pension reporting requirements](https://www.wctpension.org/employers/employer-bulletins/monthly-pension-reporting-requirements/), hours per employee, identifying fields, contribution rates, due dates and delinquency
- [Western Conference of Teamsters Pension Trust: Contribution guidelines](https://www.wctpension.org/local-unions/bargaining-party-info/trustee-policy-employer-contributions-contribution-guidelines/contribution-guidelines/), per-hour contributions and the ten-cent floor
