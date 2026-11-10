+++
title = "Multi-State, Reciprocity & Remote Work"
nav_title = "Multi-State Work"
description = "Resident and work states, reciprocity certificates, credits, New York's convenience rule, day thresholds, remote hires in new states and day-based allocation."
category = "Workforce Industry"
order = 2616
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "state-tax", "remote-work", "reciprocity", "multi-state"]
+++

A worker who lives and works in one state is one row of tax setup. Everyone else is a policy question with dates: an employee who lives in New Jersey and works in Pennsylvania, a salesperson based in Illinois who spends a third of the year in Indiana and Wisconsin, an engineer who moved from the company's New York office to a home in Connecticut and still has a desk in Manhattan, a new hire who lives in a state where the employer has never had anyone. Two states can each claim the same wages, one by residence and one by source, and the rules that sort it out (reciprocity agreements, credits for taxes paid to another state, the convenience-of-the-employer rule, day thresholds for travelers) are each state's own, published in its own place.

This chapter covers resident and work states and the default withholding pattern, reciprocity agreements and their certificates, the resident credit and how withholding reflects it, New York's convenience rule and its bona fide office test, mobile workforce day thresholds, the remote hire in a new state and the registration duty it triggers, unemployment localization for multi-state workers, and allocating wages by workdays, including stock compensation earned across states. Local taxes and the address lookup are in [State & Local Payroll Taxes](/books/workforce/state-and-local-tax); unemployment's localization tests are worked in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#which-state-gets-the-unemployment-wages); equity in payroll (the taxable event and its withholding) is in [Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income).

## How the Platforms Do It

What engines and embedded APIs publish about multi-state workers, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Symmetry Tax Engine** | Calculation engine | Handles "Multi-state, reciprocity, and nonresident scenarios" from the home and work location codes the caller supplies |
| **Vertex Payroll Tax** | Calculation engine | Assigns jurisdictions "based on home and work locations" |
| **Check** | Embedded payroll API | Employees work at `workplaces` and have residence addresses; employee tax parameters per jurisdiction are read and updated through tax parameter endpoints |
| **Gusto Embedded** | Embedded payroll API | Separate home address and work address webhooks and resources, and per-employee state tax answers (`state_taxes`) for each state the employee is set up in |

Two things stand out. **The engines decide from two addresses; the worker's days are yours.** Both engines take a home location and a work location and apply reciprocity and nonresident rules between them; neither knows that the worker spent 40 days at a client site in another state unless the payroll system allocates the wages by day and sends each portion with its work location. **The certificate is an input, not an inference.** Reciprocity relief depends on the employee filing the state's exemption certificate with the employer; without it, the employer withholds for the work state. My rule is that every multi-state worker has dated `worker_tax_locations` rows for each resident and work jurisdiction, the certificate that changes the default as a document, and, for anyone who travels, a day allocation built from time records.

## Resident State and Work State

States tax their residents on all income and nonresidents on income from sources in the state, and wages are generally sourced where the work is performed. The default withholding pattern that follows is:

- **Work state withholds first.** The employer withholds for the state where the employee performs services.
- **Resident state withholds the difference, if any.** When the resident state's tax is higher than the work state's and the resident state gives a credit for the work state's tax, an employer with a presence in the resident state commonly withholds the excess for the resident state.
- **No double withholding by default.** Without an agreement or a rule saying otherwise, an employer doesn't withhold the full amount for both states.

The resident state's credit is what makes this work: a resident who paid tax to a work state claims a credit on the resident return, usually limited to the resident state's tax on the same income. Wisconsin's guidance shows the limitation and its exceptions: the cap of the credit at the Wisconsin tax on the income taxed by the other state "does not apply to income that is taxed by Minnesota, Illinois, Iowa, or Michigan." The credit is the employee's to claim; the employer's job is to withhold in a pattern that doesn't leave the employee with a large balance due in the resident state.
Two resident states' guides I opened show the range. Wisconsin's Withholding Tax Guide (Publication W-166, January 2026) says wages paid to Wisconsin residents "are subject to Wisconsin withholding, whether paid for services performed entirely in Wisconsin, partly in and partly outside Wisconsin, or entirely outside Wisconsin," with a special arrangement under which Wisconsin withholding isn't required on a resident's Minnesota wages that are subject to Minnesota withholding. Illinois's Publication 130 (February 2026) works the other way in its examples: a Missouri-based employer whose Illinois-resident employee works in Illinois fewer than 31 days isn't required to withhold Illinois tax, Illinois gives the employee a credit for the other state's tax, and if that doesn't cover the Illinois liability the employee "may need to make estimated income tax payments to Illinois."
<!-- source-gap: wf-resident-credit-withholding | missing | the resident-state withholding rule for states other than Wisconsin and Illinois when the work state's tax is lower | closes with: each resident state's employer withholding guide | checked: 2026-11-10 --> I haven't opened the other resident states' guides, so beyond those two the excess-withholding rule is a per-state row to fill from each state's guide.

## Reciprocity Agreements

A reciprocity agreement between two states says each will not tax the other's residents on wages earned in it, so the employee pays only the resident state and the employer withholds only for it, once the employee files the work state's certificate. Agreements cover wages only: Wisconsin's reciprocity applies only to employee income "such as wages, salaries, commissions, and fees." They are pairwise and published by each state:

- **New Jersey and Pennsylvania.** "Compensation paid to Pennsylvania residents employed in New Jersey is not subject to New Jersey Income Tax." A Pennsylvania resident working in New Jersey files Form NJ-165, the "Employee's Certificate of Nonresidence in New Jersey," with the employer to stop New Jersey withholding; a New Jersey resident working in Pennsylvania files Pennsylvania's "REV-419EX, Employee's Nonwithholding Application Certificate."
- **Wisconsin** has reciprocity with Illinois, Indiana, Kentucky and Michigan. Minnesota "isn't a reciprocity state" with Wisconsin.
- **Illinois** exempts residents of Iowa, Kentucky, Michigan and Wisconsin under its reciprocal agreements, on Form IL-W-5-NR, "Employee's Statement of Nonresidence in Illinois."
- **Indiana** has agreements with Kentucky, Michigan, Ohio, Pennsylvania and Wisconsin, on Form WH-47, Certificate of Residence; the agreements don't cover Indiana's county income taxes, which the employer still withholds.
- **Kentucky's** Form 42A809, Certificate of Nonresidence, covers residents of Illinois, Indiana, Michigan, West Virginia and Wisconsin, residents of Virginia who commute daily, and residents of Ohio who aren't 20% or greater S corporation shareholder-employees.
- **Minnesota** has reciprocity with Michigan and North Dakota; the employee gives the employer Form MWR "each year."
- **Virginia** has reciprocity with the District of Columbia, Kentucky (daily commuters with only wage income), and Maryland, Pennsylvania and West Virginia (183 days or less, no abode, only wage income), certified on Form VA-4.
- **West Virginia's** Form IT-104NR, Certificate of Nonresidence, covers residents of Kentucky, Maryland, Ohio, Pennsylvania and Virginia whose only West Virginia income is wages.

The agreements aren't always symmetric on their terms (Virginia's daily-commute condition for Kentucky, Kentucky's S corporation exception for Ohio), so each direction is its own rule row. I didn't open the District of Columbia's, Maryland's, Michigan's, Montana's, North Dakota's, Ohio's or Pennsylvania's own pages beyond the New Jersey agreement, so their certificates and any agreements not named above aren't stated here, and the list changes when a state ends an agreement.
<!-- source-gap: wf-reciprocity-list | missing | reciprocity agreements and exemption certificates as published by DC, Maryland, Michigan, Montana, North Dakota, Ohio and Pennsylvania | closes with: each of those revenue departments' reciprocity pages or certificates, opened (Michigan's 2026 withholding guide 403, Ohio's and North Dakota's guessed pages 404 and Maryland's knowledge base page returned no text on Nov 10, 2026) | checked: 2026-11-10 -->

Three implementation consequences:

- **Reciprocity is conditional on the certificate.** Until the employee files it, the employer withholds for the work state; the certificate's date is the date withholding switches, and it is a `documents` row referenced by `worker_tax_locations.certificate_document_id`.
- **Reciprocity is state income tax only.** Local taxes in the work state (a Pennsylvania EIT, an Ohio municipal tax) are separate, and a reciprocity certificate doesn't stop them.
- **An agreement is a pair of jurisdictions with dates.** Model it as a row, not a code branch, so an agreement ending on a date changes the next payroll without a release.

### Worked Numbers: A Missing Certificate

An invented employee lives in New Jersey and starts work at a Pennsylvania office on March 2, 2026, paid $4,000 biweekly. Pennsylvania's flat rate is 3.07% (per the Tax Foundation's 2026 table). Without a REV-419EX, the employer withholds Pennsylvania tax of $122.80 a payday ($4,000 × 3.07%). The employee files the certificate on May 11; from the next payday, Pennsylvania withholding stops and the employer withholds New Jersey tax by New Jersey's method. The Pennsylvania tax withheld for the paydays before the certificate isn't refunded by the employer (it was correctly withheld on the facts it had); the employee recovers it from Pennsylvania. The record that makes this explainable is the certificate's received date against the pay dates.

## The Convenience of the Employer Rule

New York sources a nonresident employee's wages by days: the New York portion is "that proportion of his total compensation... which the total number of working days employed within New York State bears to the total number of working days employed both within and without New York State" (20 NYCRR 132.18(a), quoted in TSB-M-06(5)I). The twist is in the next sentence: an allowance for days worked outside New York "must be based upon the performance of services which of necessity, as distinguished from convenience, obligate the employee to out-of-state duties." That is the convenience of the employer test. For a nonresident whose primary office is in New York, "your days telecommuting are considered days worked in the state" unless the employer has established "a bona fide employer office at your telecommuting location."

TSB-M-06(5)I sets the test for a bona fide employer office at home: it must meet "a) the primary factor, or b) at least 4 of the secondary factors and 3 of the other factors." The primary factor is that the home office "contains or is near specialized facilities" the work requires. The six secondary factors include that the home office is a requirement or condition of employment, that the employer has a bona fide business purpose for it, that the employee performs core duties there, meets clients there regularly, has no designated office space at the employer, and is reimbursed for home office expenses. The ten other factors include a separate business phone line and listing, an exclusive business area, records or inventory kept there, signage, advertising, business insurance, a home office deduction and that "The employee is not an officer of the company." The memo also applies the rule to Yonkers nonresidents.

Other states have similar rules, and some apply them only to residents of states that have one:

- **Connecticut** includes in a nonresident's Connecticut income "income from days worked outside this state for such person's convenience," but only "if such person's state of domicile uses a similar test" (Conn. Gen. Stat. 12-711(b)(2)(C)).
- **New Jersey** enacted the same retaliatory shape in P.L.2023, c.125 (July 21, 2023), "retroactive to January 1, 2023." Its Division of Taxation says "The new law only applies to nonresident employees working for a New Jersey employer" who live in states with a similar test, "such as Delaware, Nebraska, and New York," that "this list may change accordingly," that it doesn't apply to Pennsylvania residents because of the reciprocal agreement, and that it excuses remote work "due to the necessity of the employer."
- **Pennsylvania's** regulation allows days worked outside the state only for services "which, of necessity, obligate the employe" to out-of-state duties "in the service of his employer" (61 Pa. Code 109.8).

So the rule set is a pair of jurisdictions again: the work state's test, and for Connecticut and New Jersey, whether the employee's home state has one. I didn't open Delaware's or Nebraska's own text, so their rules here rest on New Jersey's characterization. <!-- source-gap: wf-convenience-states | secondary | Delaware's and Nebraska's convenience-of-the-employer rules, from their own statute or guidance | closes with: Delaware Division of Revenue and Nebraska Department of Revenue guidance or statute text, opened | checked: 2026-11-10 -->

### Worked Numbers: Telecommuting Days Under the Convenience Rule

An invented employee lives in Connecticut, is assigned to the employer's New York office, earns $230,000 and has 230 working days in 2026 (nonworking days such as weekends, holidays, illness and vacation don't count): 150 in the Manhattan office, 70 at home in Connecticut, and 10 at a client in Massachusetts the employer required.

| Day type | Days | New York days, no bona fide home office | New York days, bona fide home office |
| --- | --- | --- | --- |
| In the New York office | 150 | 150 | 150 |
| At home (Connecticut), by convenience | 70 | 70 | 0 |
| At a client (Massachusetts), by necessity | 10 | 0 | 0 |
| **Total** | **230** | **220** | **150** |
| **New York source wages** | | **$220,000** (220/230) | **$150,000** (150/230) |

Under the convenience rule, the 70 home days are New York days, so New York sources $220,000 rather than $150,000. The employer's withholding for New York should follow the same allocation, which means the payroll system needs a day count by type, not just a home and a work address. The home state's credit then determines how much the employee recovers from Connecticut, under Connecticut's own rules; that is the gap marker above.

## Mobile Workforce Thresholds

A traveling employee who works a few days in a state technically earns wages sourced there. Many states set a threshold below which neither the employer must withhold nor the employee owes tax, but the thresholds differ in units (days, dollars, both) and in what counts as a day.

- **Indiana.** If the employer has "a time and attendance system where employees are required to record the employee's out-of-state work location on a contemporaneous basis" and uses it to allocate pay, it need not withhold Indiana state and county tax for an employee "reasonably expected to work in Indiana for 30 days or less" in the year. If the employee then works more than 30 days, the employer must "withhold the tax that otherwise would have been withheld for the first 30 days" and on everything after; it may increase withholding in any reasonable way to catch up, reporting the catch-up in the month withheld. Days worked in Indiana for a previous employer count toward the 30. An employee can also file Form WH-4AFF, relieving the employer until the employee passes 30 days. Professional athletes, entertainers and public figures are excluded.
- **Ohio municipalities.** The 20-day occasional entrant rule of ORC 718.011 works the same way at the city level: no withholding for a municipality where the employee works 20 or fewer days in the year unless it is their principal place of work.
- **Other states** set their own thresholds. A federal Mobile Workforce State Income Tax Simplification Act has been introduced in several Congresses; in the 119th it is S. 1443, introduced April 10, 2025, which would let a state tax a nonresident's wages only for work there "for more than 30 days" and ties withholding and reporting to the same test. Its only action in the govinfo bill status record (updated September 22, 2026) is the day of introduction, when it was "Read twice and referred to the Committee on Finance."
<!-- source-gap: wf-mobile-thresholds | missing | each state's 2026 nonresident withholding threshold in days or dollars | closes with: each state's withholding guide | checked: 2026-11-10 -->

### Worked Numbers: Crossing Indiana's 30 Days

An invented Illinois-based technician is expected to spend 20 days in Indiana in 2026 and has an employer with a contemporaneous time system, so the employer withholds nothing for Indiana. By September 30 the technician has 34 Indiana days, earning $300 a day. The employer must now withhold the Indiana tax that would have applied to the first 30 days ($9,000 of wages) plus the tax on days 31 to 34 and after. At Indiana's 2.95% state rate, before exemptions, the catch-up is about $265.50 for the first 30 days, plus county tax by the January 1 rule (for an out-of-state resident, the county of principal work in Indiana as of January 1, if any). Indiana lets the employer collect it over the remaining paydays "in any manner reasonably intended to make up for the tax not previously withheld," reported when actually withheld. The system needs to know the count is 34 the day it becomes 31, which only time records with a work location can tell it.

## Remote Employees in a New State

A remote hire in a state where the employer has no one else creates obligations the day wages are paid: state income tax withholding (if the state has one), state unemployment (the localization tests usually point to the state where a fully remote employee works), local taxes for the home address, and often state paid leave or disability contributions. Each needs a registration with that state's agencies before the first payroll, or as soon as the state allows; registering late means returns and deposits that the employer owes but can't file. The registration task comes from the same set difference [State & Local Payroll Taxes](/books/workforce/state-and-local-tax#registrations) describes: jurisdictions the workers resolve to, minus jurisdictions with a registration.

Three rules follow for the system:

- **The home address is the work location for a fully remote employee.** `work_locations.kind = 'remote_home'`, with its own geocode and dates, not the company headquarters.
- **A move is an effective-dated event with tax consequences.** A remote employee who moves states mid-year changes resident state, work state, SUI state and local taxes from the move date; wages before and after split by pay date, and the employee needs new state forms.
- **Temporary remote work is still work in the state.** A worker spending a month at a relative's home in another state is a mobile workforce case: the days count toward that state's threshold, and the employer withholds if the threshold is crossed.

## Unemployment for Multi-State Workers

State unemployment insurance doesn't split wages by days the way income tax does: one state covers all of a worker's services, chosen by the localization, base of operations, direction and control, and residence tests in order, with reciprocal coverage arrangements when none decides ([FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#which-state-gets-the-unemployment-wages)). The consequence for a multi-state worker is three different answers on the same payday: income tax split by days between work states, SUI to one state, and local taxes by each jurisdiction's own reach. The SUI state is stored as a `worker_tax_locations` row with role `sui` and the test that decided it.

## Allocating Wages by Day, Including Equity

Day-based allocation (New York's formula is the model) needs a day ledger: for each working day, where the employee worked and whether the day counts as a working day and as worked in the state. Pay that is earned over a period longer than a pay period, chiefly stock compensation and some bonuses, needs the ledger over its earning period, not the payday. Equity is the common case: restricted stock that vests after four years was earned over the four years, and a state that sources it by the workdays in the state over the grant-to-vest period taxes a share of it even if the employee left the state years before vesting. The payroll system records the taxable event in the vest year and needs the employee's work-state history back to the grant date to allocate it.

New York writes the periods down (20 NYCRR 132.24). The New York share is a fraction whose numerator is "the number of days worked within New York State for the grantor" during the allocation period and whose denominator is "the number of days worked both within and without New York State" in it. The period depends on the instrument:

- **Statutory options, nonstatutory options without a readily ascertainable fair market value, and stock appreciation rights:** "the period of time from the date of grant to the date on which all service-related conditions" for exercise are satisfied.
- **Nonstatutory options with a readily ascertainable fair market value, and restricted stock with a section 83(b) election:** "the same period of time that applies to regular, non-stock-based remuneration from the grantor."
- **Restricted stock without an 83(b) election:** from "the date that the stock was received" to the earliest of substantial vesting, the end of services or sale.

California's rules are in FTB Publication 1004, which I couldn't open (ftb.ca.gov refused automated access), so they aren't stated here. <!-- source-gap: wf-equity-allocation | missing | California's allocation rules for stock options and restricted stock earned across states | closes with: California FTB Publication 1004, opened | checked: 2026-11-10 -->

### Worked Numbers: Allocating a Vest

An invented employee was granted restricted stock on January 2, 2023 that vests on January 2, 2027 with a value of $120,000. Their working days over the grant-to-vest period, from the day ledger: 690 in State A (where they worked until mid-2025) and 230 in State B (where they live and work since). Under a grant-to-vest workday allocation (illustrative, by each state's rule):

| State | Working days, grant to vest | Share | Allocated wages |
| --- | --- | --- | --- |
| State A | 690 | 75% | $90,000 |
| State B | 230 | 25% | $30,000 |
| **Total** | **920** | **100%** | **$120,000** |

State A, where the employee no longer lives or works, sources $90,000 of a 2027 payday. The W-2 for 2027 shows wages in both states' boxes, and the employer may owe withholding to a state where it no longer has the employee on payroll, which is why the registration in State A can't be closed when the employee moves.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `worker_tax_locations` already carries resident and work rows with certificates, and [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#how-to-build-it) added the `sui` role. This chapter adds the agreements as data, a day ledger, and thresholds.

```sql
-- Pairwise state agreements, effective-dated.
CREATE TABLE reciprocity_agreements (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  work_jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  resident_jurisdiction_id UUID NOT NULL REFERENCES tax_jurisdictions (id),
  covers              TEXT NOT NULL DEFAULT 'state_income_tax_wages',
  certificate_form    TEXT NOT NULL,         -- 'NJ-165', 'REV-419EX', ...
  source_ref          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (work_jurisdiction_id WITH =, resident_jurisdiction_id WITH =,
    valid_during WITH &&)
);

-- Thresholds below which a nonresident isn't withheld for (state or local).
CREATE TABLE nexus_thresholds (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL,         -- 'state_income', 'municipal_income', ...
  day_threshold       SMALLINT,              -- 30 for Indiana, 20 for an Ohio municipality
  wage_threshold      BIGINT,                -- cents, where the rule is in dollars
  counts_prior_employers BOOLEAN NOT NULL DEFAULT FALSE,   -- Indiana counts them
  requires_time_system BOOLEAN NOT NULL DEFAULT FALSE,
  catch_up_rule       TEXT NOT NULL CHECK (catch_up_rule IN ('from_day_one', 'after_threshold',
                        'none')),
  excluded_occupations TEXT[] NOT NULL DEFAULT '{}',
  source_ref          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

-- The day ledger: one row per worker per working day per jurisdiction worked.
CREATE TABLE work_day_allocations (
  worker_id           UUID NOT NULL REFERENCES workers (id),
  work_date           DATE NOT NULL,
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  fraction            NUMERIC(4, 3) NOT NULL DEFAULT 1 CHECK (fraction > 0 AND fraction <= 1),
  day_kind            TEXT NOT NULL CHECK (day_kind IN ('office', 'remote_home',
                        'travel_required', 'client_site')),
  convenience         BOOLEAN NOT NULL DEFAULT FALSE,   -- worked there for the employee's convenience
  is_working_day      BOOLEAN NOT NULL DEFAULT TRUE,    -- false for weekends, PTO, illness
  source              TEXT NOT NULL CHECK (source IN ('time_entries', 'travel_log',
                        'attestation', 'default_location')),
  time_entry_ids      UUID[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (worker_id, work_date, jurisdiction_id)
);

-- Days in a jurisdiction this year, for threshold tests (including prior employers when
-- the rule says so, loaded from the employee's attestation).
SELECT w.worker_id, w.jurisdiction_id, SUM(w.fraction) AS days
FROM work_day_allocations w
WHERE w.is_working_day
  AND w.work_date >= date_trunc('year', $1::DATE) AND w.work_date <= $1::DATE
GROUP BY 1, 2;

-- Sourced share for a convenience-rule state over a period: days in the state, with
-- convenience days counted to the assigned office's state.
SELECT SUM(CASE WHEN w.jurisdiction_id = $2 OR (w.convenience AND $3) THEN w.fraction END)
       / NULLIF(SUM(w.fraction), 0) AS state_share
FROM work_day_allocations w
WHERE w.worker_id = $1 AND w.is_working_day AND w.work_date <@ $4::DATERANGE;
-- $2 = the state, $3 = whether the worker's assigned office is in it and no bona fide
-- home office applies, $4 = the year or the grant-to-vest period.
```

Design notes:

- **Default from addresses, refine from days.** Most workers need no ledger; the payroll uses the work location. Workers flagged as traveling or hybrid get a ledger from time entries with a work location, and their pay is split by the ledger at calculation.
- **Run threshold checks daily, not at payroll.** The day a worker crosses Indiana's 30 or an Ohio city's 20, open a task: start withholding, compute the catch-up, and open a registration if there isn't one.
- **The certificate switches the default on its received date.** Store the received date and apply it to the next pay date; never backdate withholding changes to before it was received.
- **Keep the day ledger as long as equity is outstanding.** Grant-to-vest allocation reads days years old, so retention for `work_day_allocations` follows the longest vesting schedule plus the return statute.
- **Moves are effective-dated across every role.** A state move closes resident, work, SUI and local rows and opens new ones on the same date, in one transaction, with the triggering address change linked ([Changing a Value](/docs/database/temporal-data#changing-a-value)).

## Auditing

Nonresident audits are day-count audits: a state asks for the days worked in it and the employer's evidence. Keep:

- **The day ledger** with its sources (time entries, travel logs, attestations) and every manual change.
- **Certificates** (reciprocity, nonresidence, Indiana's WH-4AFF) with received dates and the payrolls they affected.
- **Bona fide office determinations** for convenience-rule states: the factors claimed and the evidence.
- **Threshold crossings** and the catch-up withholding computed and collected.
- **Registrations opened** because of remote hires and moves, with the triggering worker and date.

## What This Means for the System You Build

- **Withhold for the work state first,** apply reciprocity only with the employee's certificate on file, and keep local taxes separate from state reciprocity.
- **Model agreements and thresholds as dated rows,** not code, with their certificates and sources.
- **Build a day ledger for travelers and hybrid workers** from time records with locations, and allocate pay by it.
- **Treat New York's convenience rule as a day classification,** with the bona fide office test recorded per worker.
- **Watch thresholds daily** and start withholding with catch-up the day a worker crosses one.
- **Register in a new state before the first remote payroll,** and keep registrations open while allocated wages, such as equity, can still be sourced there.
- **Keep SUI on one state per worker,** decided by the localization tests, separate from income tax allocation.

## References

**Law and regulation**

- [New York State: TSB-M-06(5)I, Application of the convenience of the employer test to telecommuters and others (May 15, 2006)](https://www.tax.ny.gov/pdf/memos/income/m06_5i.pdf), the 20 NYCRR 132.18(a) day allocation, normal work days at home, and the bona fide employer office factors
- [Ohio Revised Code 718.011](https://codes.ohio.gov/ohio-revised-code/section-718.011), the twenty-day municipal threshold and principal place of work
- [20 NYCRR 132.24](https://www.law.cornell.edu/regulations/new-york/20-NYCRR-132.24), New York's allocation periods and workday fraction for stock options, SARs and restricted stock
- [Connecticut General Statutes 12-711](https://www.cga.ct.gov/current/pub/chap_229.htm#sec_12-711), subsection (b)(2)(C): convenience days for nonresidents whose home state uses a similar test
- [61 Pa. Code 109.8](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/061/chapter109/s109.8.html), out-of-state days allowed only when duties of necessity require them
- [govinfo: Bill status for S. 1443, 119th Congress (XML)](https://www.govinfo.gov/bulkdata/BILLSTATUS/119/s/BILLSTATUS-119s1443.xml), introduction and referral to the Committee on Finance on April 10, 2025 as the only actions
- [S. 1443, Mobile Workforce State Income Tax Simplification Act of 2025 (introduced)](https://www.govinfo.gov/content/pkg/BILLS-119s1443is/html/BILLS-119s1443is.htm), the 30-day threshold and the withholding tie

**Agency guidance and forms**

- [New York State: Nonresident and part-year resident FAQs](https://www.tax.ny.gov/pit/file/nonresident-faqs.htm), telecommuting days as New York days unless a bona fide employer office exists
- [New Jersey Division of Taxation: Reciprocal agreement with Pennsylvania](https://www.nj.gov/treasury/taxation/njit25.shtml), Pennsylvania residents working in New Jersey, NJ-165 and REV-419EX
- [New Jersey Division of Taxation: Convenience of the employer rule](https://nj.gov/treasury/taxation/conveniencerule.shtml), P.L.2023, c.125, enacted July 21, 2023 and retroactive to January 1, 2023
- [New Jersey Division of Taxation: Convenience of the employer rule FAQ](https://nj.gov/treasury/taxation/conveniencerulefaq.shtml), the retaliatory rule, the trigger states, the Pennsylvania exclusion and the necessity exception (updated October 30, 2025)
- [Wisconsin Department of Revenue: Working in another state](https://www.revenue.wi.gov/Pages/FAQS/pcs-work.aspx), reciprocity with Illinois, Indiana, Kentucky and Michigan, wages only, and the credit limitation exceptions
- [Illinois Department of Revenue: Publication 130, Who is Required to Withhold Illinois Income Tax (February 2026, PDF)](https://tax.illinois.gov/content/dam/soi/en/web/tax/research/publications/pubs/documents/pub-130.pdf), residents working out of state, the credit and estimated payments
- [Wisconsin Department of Revenue: Publication W-166, Withholding Tax Guide (January 2026, PDF)](https://www.revenue.wi.gov/dor%20publications/pb166.pdf), withholding on residents' wages earned outside Wisconsin and the Minnesota arrangement
- [Illinois Department of Revenue: Form IL-W-5-NR (PDF)](https://tax.illinois.gov/content/dam/soi/en/web/tax/forms/withholding/documents/currentyear/il-w-5-nr.pdf), reciprocity for residents of Iowa, Kentucky, Michigan and Wisconsin
- [Indiana Department of Revenue: Information Bulletin 33, Withholding Requirements for Nonresident Employees (December 2024, PDF)](https://www.in.gov/dor/files/ib33.pdf), reciprocity with Kentucky, Michigan, Ohio, Pennsylvania and Wisconsin, Form WH-47 and county taxes
- [Kentucky Department of Revenue: Form 42A809, Certificate of Nonresidence (PDF)](https://revenue.ky.gov/forms/42a809.pdf), the reciprocal states and the Virginia and Ohio conditions
- [Minnesota Department of Revenue: Reciprocity](https://www.revenue.state.mn.us/reciprocity), Michigan and North Dakota, and Form MWR each year
- [Virginia Tax: Reciprocity](https://www.tax.virginia.gov/reciprocity), DC, Kentucky, Maryland, Pennsylvania and West Virginia, their conditions and Form VA-4
- [West Virginia Tax Division: Form IT-104 and IT-104NR (March 2023, PDF)](https://tax.wv.gov/Documents/Withholding/it104.pdf), the certificate of nonresidence for Kentucky, Maryland, Ohio, Pennsylvania and Virginia residents
- [Indiana Department of Revenue: Departmental Notice 1](https://www.in.gov/dor/files/dn01.pdf), the 30-day rule, contemporaneous time systems, catch-up withholding, WH-4AFF and county rules by January 1
- [U.S. Department of Labor: Comparison of State UI Laws 2023, Coverage](https://oui.doleta.gov/unemploy/pdf/uilawcompar/2023/coverage.pdf), localization of work for multi-state workers

**Vendor documentation**

- [Symmetry: What is the Symmetry Tax Engine](https://docs.symmetry.com/ste/overview/what-is-the-ste), multi-state, reciprocity and nonresident scenarios from home and work location codes
- [Vertex: Payroll tax](https://www.vertexinc.com/solutions/tax-type/payroll-tax), jurisdiction assignment from home and work locations
- [Check: Documentation index](https://docs.checkhq.com/llms.txt), workplaces and employee tax parameters
- [Gusto Embedded: Documentation index](https://docs.gusto.com/embedded-payroll/llms.txt), home and work addresses and employee state taxes

**In practice**

- [Tax Foundation: State individual income tax rates and brackets, 2026](https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/), Pennsylvania's 3.07% flat rate
