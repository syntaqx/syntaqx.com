+++
title = "State & Local Payroll Taxes"
nav_title = "State & Local Taxes"
description = "State withholding methods, flat and no-tax states, local income taxes from Pennsylvania to Oregon, registrations, and the jurisdiction lookup from an address."
category = "Workforce Industry"
order = 2615
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "state-tax", "local-tax", "jurisdictions", "geocoding"]
+++

Federal payroll tax is one set of rules. Below it sit 41 states and the District of Columbia that tax wages, each with its own withholding method, form and calendar, and below them thousands of local taxing jurisdictions: Pennsylvania's earned income tax collected by school district and municipality, Philadelphia's wage tax, Ohio's municipal income taxes and school district income taxes, New York City and Yonkers, Maryland's county income tax, Indiana's county tax set by residence on January 1, Kentucky's occupational license taxes, Michigan's city income taxes, the Kansas City and St. Louis earnings taxes, and Oregon's transit taxes. A payroll system that gets federal tax right and local tax wrong still sends a wrong W-2, and the local agencies send notices like everyone else.

This chapter covers state withholding methods (formula, wage bracket and flat-rate states, supplemental rates), the states without a wage income tax, the local taxes that matter in volume, registering with each agency, and the hardest data problem in the part: turning an address into the list of jurisdictions that tax the wages earned or the person living there. Where a worker lives in one state and works in another, and the reciprocity, credit and convenience rules that decide who withholds, is the next chapter, [Multi-State, Reciprocity & Remote Work](/books/workforce/multi-state-and-remote-work). State unemployment is in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta), state disability and paid leave contributions in the Leave part's [State Paid Family & Medical Leave](/books/workforce/state-paid-leave), and the engines that encode all of this in [Tax Engines & Filing Services](/books/workforce/tax-engines-and-filing).

## How the Platforms Do It

What engines and embedded APIs publish about state and local jurisdictions, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Check** | Embedded payroll API | Jurisdictions are `fed` or a lowercased state code, and localities share their state's code ("`pa` covers Pennsylvania's state-level *and* local entries"); taxes are administered by agencies such as the IRS or a local collector like Berkheimer, and "Employers never transact with a jurisdiction directly; they register, pay, and file with agencies"; work locations are `workplaces` |
| **Gusto Embedded** | Embedded payroll API | Per-state tax requirements: registrations (a Georgia withholding number with mask `#######-^^`, a DOL account number), tax rates and deposit schedules, effective-dated; per-employee state tax answers through `state_taxes` |
| **Symmetry Tax Engine** | Calculation engine | Home and work addresses become location codes through the Symmetry Location Service, and the engine uses those codes to find the applicable taxes, each with a unique tax ID; covers "city, county, and school-district taxes," and the codes are recomputed "only when an address changes" |
| **Vertex Payroll Tax** | Calculation engine | Address cleansing and jurisdiction assignment from home and work locations; its GeoAlign product provides "jurisdiction-specific state & local tax withholding details" at onboarding and address changes |

Two things stand out. **The address lookup is a product of its own.** Both engines separate turning an address into jurisdictions (a location code, a geocode) from calculating tax, and both run the lookup at onboarding and on address change, not on every payroll. **Jurisdiction and agency are different records.** Check's model, where a jurisdiction levies a tax and an agency administers it, is right because one agency (a Pennsylvania tax collection district, Ohio's RITA) collects for many jurisdictions, and the registration, the payment and the return go to the agency. My rule follows both: resolve the jurisdictions from the address once and store them with the address's dates; resolve the agency from the jurisdiction and tax; and never let the calculation call a geocoder.

## States Without a Wage Income Tax

As of 2026, Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas and Wyoming "levy no individual income tax at all," and Washington "taxes capital gains income only," per the Tax Foundation's 2026 table. Employers in those states withhold no state income tax, but they still register for unemployment insurance, and some have other payroll taxes (state paid leave contributions, for instance, which the Leave part covers). The list is data: a state's status changes by statute, and the absence of a tax is a row (`income_withholding`, not applicable, effective from a date), not a missing row.
<!-- source-gap: wf-no-tax-states | secondary | the list of states without a wage income tax for 2026 | closes with: each state revenue department's statement, or a primary compilation | checked: 2026-11-09 -->

## State Withholding Methods

Each income-tax state publishes its own method, usually a formula and a table, keyed to its own form or to the federal W-4. They fall into three shapes.

**Formula and wage bracket states.** California is the standard example of a state with its own form and two methods. Its new-hire form, the DE 4, is "used for California Personal Income Tax"; without a valid DE 4, the employer withholds as single with zero allowances. Method A "provides a quick and easy way to select the appropriate withholding amount, based on the payroll period, filing status, and number of withholding allowances," with the standard deduction and exemption credit built into wage bracket tables, and "It cannot be used with your computer." Method B, the exact calculation, "may be used to calculate withholding amounts either manually or by computer" and gives "an exact amount of tax to withhold," through the 2026 tables. Payroll software implements Method B. A state that keeps an allowance-based form while the federal W-4 moved to dollar amounts is why `tax_elections` holds a row per jurisdiction rather than one W-4 for everything.

**Flat-rate states** apply a single rate to wages after an exemption or deduction allowance. Illinois has taxed "4.95 percent of net income" since July 1, 2017. North Carolina's rate "For Taxable Years after 2025" is 3.99%, down from 4.25% for 2025, with "Additional rate changes" possible from 2027 under triggers in session law 2023-134. Indiana's state rate for 2026 is 2.95%. A flat state is simpler arithmetic, not simpler data: the exemption allowances, the effective dates of each rate cut and the county taxes on top are still tables.

**Supplemental rates.** Many states set a flat supplemental rate or an aggregate method for bonuses and commissions, some with a different rate for stock options, mirroring the federal choice [Supplemental Wages & Imputed Income](/books/workforce/supplemental-wages-and-imputed-income) covers. California is the example of the split: the EDD's [supplemental wage information sheet](https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de231ps.pdf) (DE 231PS) says that "For stock options and bonuses that were paid on or after November 1, 2009, the flat rate is 10.23 percent," and "For other types of supplemental wage payments," 6.6 percent. Each is a `tax_rates` row for the state's supplemental tax type, effective-dated; the engine's job is to pick the method the state allows for the employer's choice.

### Worked Numbers: Indiana State and County Withholding

Indiana's Departmental Notice 1 works one example through state and county tax together, and it shows why a flat state still needs tables. An employee paid $800 weekly claims five personal exemptions plus three additional dependent exemptions, one first-time additional dependent exemption and two adopted-child dependent exemptions, and is subject to a county rate of 0.01:

| Step | Amount |
| --- | --- |
| Deduction constant, Table A (five exemptions) | $96.15 |
| Table B (additional dependents) | +$86.54 |
| Table B (first-time additional dependent) | +$28.85 |
| Table C (adopted dependents) | +$115.38 |
| Total deduction constant | $326.92 |
| Taxable income ($800.00 − $326.92) | $473.08 |
| State tax ($473.08 × 0.0295) | $13.96 |
| County tax ($473.08 × 0.01) | $4.73 |

The same taxable income feeds both taxes, so the county line is a second tax on the state's base, with its own rate by county and its own liability. Marion County's rate on the notice's table is 2.02% and Lake County's 1.5%, and the notice reissued rates effective October 1, 2026 from the January 1 notice, so county rates change mid-year.

## Local Income Taxes

Local taxes are where the jurisdiction lookup earns its keep. The systems differ in who levies the tax (city, county, school district, transit district), whom it reaches (residents, people working there, or both), who collects it, and which date decides.

**Pennsylvania (Act 32).** "Employers with worksites located in Pennsylvania are required to withhold and remit the local Earned Income Tax (EIT)," and the state's Department of Community and Economic Development publishes the Political Subdivision (PSD) codes and rates, the "Residency Certification Form (Addendum to Federal W-4 Form)" each employee completes, the Local Services Tax (LST) exemption and refund forms, and the list of "Act 32 Certified Earned Income Tax Collectors." Worksites include a home-based employee's residence. The EIT is collected by tax collection district, so the employer registers with and remits to the collector for each district where it has a worksite, reporting each employee's PSD codes for residence and work location. Which rate applies is a comparison: DCED's [Act 32 FAQ](https://dced.pa.gov/local-government/local-income-tax-information/act32-faq/) says employers "withhold the higher of the employee's resident earned income tax amount" and "the employee's municipal non-resident earned income tax amount," so a 0.5% resident rate against a 1.0% work-location rate withholds 1.0%, and a 1.6% resident rate against 1.3% withholds 1.6%. The LST is a flat per-person tax by the work location, withheld per pay period: per DCED's [LST page](https://dced.pa.gov/local-government/local-income-tax-information/local-services-tax/), the total "remains limited to $52" a year however many places a person works, subdivisions levying more than $10 must exempt taxpayers whose earned income and net profits there are "less than $12,000," and "a $52 tax would be collected at $1 per week for taxpayers paid weekly." The PSD code is the key that makes Pennsylvania computable; `tax_jurisdictions.code_scheme = 'psd'` exists for it.

**Philadelphia.** The City's Wage Tax from July 1, 2026 is 3.735% for residents and 3.425% for non-residents working in the city, filed quarterly, with payment frequency by monthly withholding: quarterly under $350, monthly from $350 to $16,000, and semi-monthly or weekly above $16,000. Paper returns are no longer accepted. The rate changed mid-year, so a payroll dated June 30 and one dated July 1 use different rates; engines that resolve rules "in effect for the pay date," as Symmetry's does, get this right without code changes.

**Ohio municipal and school district taxes.** Ohio cities and villages levy municipal income taxes, administered by each municipality or by a regional agency (the Regional Income Tax Agency, RITA, and others), so the employer withholds for the municipality where the employee works and sometimes the one where they live. Ohio Revised Code 718.011 limits the work-location duty: no withholding is required for an employee who worked in a municipality "twenty or fewer days in a calendar year," unless it is the employee's "principal place of work," defined as "the fixed location to which an employee is required to report for employment duties on a regular and ordinary basis." Small employers withhold on all qualifying wages and remit "only to the municipal corporation in which the employer's fixed location is located." Separately, school districts may levy an income tax on residents, and ORC 5747.06 requires employers to ask each employee for their school district of residence and withhold for it; if the employee doesn't answer, the employer "is not required to withhold." That last rule is a design requirement: the school district is an onboarding question with a recorded answer, not something to infer from a ZIP code.
<!-- source-gap: wf-ohio-hb96 | missing | changes to Ohio municipal withholding and refund rules after 2025 (HB 96) and RITA's current member count | closes with: Ohio Department of Taxation municipal pages and RITA's employer guidance | checked: 2026-11-10 -->

**New York City and Yonkers.** New York State publishes separate withholding tables for the state (NYS-50-T-NYS), New York City (NYS-50-T-NYC) and Yonkers (NYS-50-T-Y), with 2026 changes applying "to payrolls made on or after January 1, 2026" (the NYC tables had "no changes"). New York City taxes residents only. Yonkers taxes residents with a surcharge figured by multiplying the state withholding "by 16.75% (0.1675)," and nonresidents who work there with an earnings tax; the supplemental rates are 1.95975% for Yonkers residents and 0.50% for nonresidents. A Yonkers resident's local line is therefore a function of the state line, which constrains the calculation order.

**Maryland counties.** Every Maryland county (and Baltimore City) levies a local income tax as a percentage of Maryland taxable income, between 2.25% and 3.30% under Tax-General 10-106, and since 2022 a county may use brackets. Employers withhold the county tax by the employee's county of residence. Nonresidents who work in Maryland pay a special nonresident rate "equal to the lowest county income tax rate set by any Maryland county" (10-106.1). The county rate list is therefore a table that moves whenever any county changes its rate, and the nonresident rate is derived from it, not entered.

**Indiana counties.** Indiana's county tax is set by where the employee lived and worked on January 1: "Withholding agents should withhold county tax based on the employee's Indiana county of residence as of Jan. 1 of the tax year," and for an employee living out of state on January 1 with a principal place of work in an Indiana county, the county of work. An employee who moves in March keeps their January 1 county for the year, which is exactly the opposite of Philadelphia, where the date that matters is the pay date. The rule belongs in data as `determined_as_of = 'january_1'`.

**Michigan cities.** Michigan's City Income Tax Act lets cities levy income taxes, and for cities over 600,000 people (Detroit), rates of "not more than 2.40% on resident individuals and 1.20% on nonresident individuals" since January 1, 2013, falling to 2.20% and 1.10% once its lighting authority bonds are paid.

**Missouri cities.** St. Louis's "one percent earnings tax" applies to city residents wherever they work and to nonresidents working in the city; employer withholding is reported quarterly (January 31, April 30, July 31 and October 31). Kansas City levies a similar earnings tax; its Revenue Division pages refused automated reading when I checked, so I don't state its rate or rules here.
<!-- source-gap: wf-kc-earnings-tax | missing | Kansas City earnings tax rate and employer withholding rules | closes with: City of Kansas City Revenue Division employer page | checked: 2026-11-10 -->

**Oregon transit taxes.** Oregon's statewide transit tax is "one-tenth of 1 percent or .001," withheld from "Wages of Oregon residents (regardless of where the work is performed)" and "Wages of nonresidents who perform services in Oregon." Separately, TriMet's transit tax is "0.8237% of the wages paid by an employer" in its district, "paid by employers," and Lane Transit District's rate "is 0.80% of the wages paid by an employer" for services performed within its boundary (LTD, as of November 2026). The statewide tax is an employee line; TriMet's is an employer line on the same wages.

**Kentucky.** Kentucky cities and counties levy occupational license taxes on wages earned within them, administered locally, so an employer with Kentucky worksites registers with each taxing district. Louisville Metro shows the shape: its [Form W-1 instructions](https://louisvilleky.gov/sites/default/files/2022-12/W-1_instructions_20221201.pdf) (December 2022) tax employees "who work and live in Louisville Metro" at "2.2% (.0220)" (Louisville Metro 1.25%, Transit Authority 0.2% and School Boards Tax 0.75%) and non-residents working there at "1.45% (.0145)," without the school tax. Returns are quarterly, due the last day of the month after the quarter, and larger withholders deposit monthly, "due 15 days after the month end." Residence splits the rate even inside one district, so the lookup needs both addresses.

### What the Local Systems Have in Common

| Tax | Levied by | Reaches | Date that decides | Rate shape |
| --- | --- | --- | --- | --- |
| Pennsylvania EIT | Municipality and school district, collected by district | Residents and workers at PA worksites | Pay date, by PSD codes | Percent of wages |
| Pennsylvania LST | Municipality of work | People working there | Pay period | Flat amount |
| Philadelphia Wage Tax | City | Residents and nonresidents working in the city | Pay date | Two percents |
| Ohio municipal | City or village, often through RITA or similar | Work location after 20 days; residents by municipal ordinance | Day count in the year | Percent of wages |
| Ohio school district | School district | Residents | Employee's answer | Percent |
| New York City | City | Residents | Pay date | Tables |
| Yonkers | City | Residents (surcharge) and nonresidents | Pay date | Percent of state tax; percent of wages |
| Maryland county | County | Residents; nonresidents at the lowest county rate | Pay date | Percent, optionally brackets |
| Indiana county | County | Residents; out-of-state residents by work county | January 1 | Percent |
| Michigan city | City | Residents and nonresidents working there | Pay date | Two percents |
| Oregon statewide transit | State | Residents everywhere, nonresidents for Oregon work | Pay date | 0.1% employee |
| TriMet | Transit district | Wages paid in the district | Pay date | Employer percent |

The columns are the schema. A local tax is a jurisdiction, an agency, a reach rule (resident, work, both), a deciding date rule, a rate shape and a threshold; every row in this table fits it.

## Registrations

Before the first payroll that touches a jurisdiction, the employer needs an account with its agency: a state withholding account, a state UI account, and each local account. Registration takes days to weeks, and states issue the account number after the first wages in some cases, so the first runs happen with the registration pending. The data model already has `tax_registrations.status = 'pending'`; the operational rule is that a pending registration accrues liabilities with no account number, and the filing service holds them. Check names this exactly: a filing is `blocked` with reason `applied_for_tax_id` until the number exists, and other blockers include `invalid_tax_id`, `inactive_account` and `fein_tax_id_mismatch`. Gusto's requirement sets return the fields each state needs (a withholding number, a UI account number, a rate, a deposit schedule), with masks that validate the format and `payroll_blocking` on the ones a run can't proceed without.

The trigger for a registration is the jurisdiction lookup: when a new hire's work location or home address resolves to a jurisdiction where the employer has no active registration for a tax that applies, the system opens a registration task. ADP's SmartCompliance service sells the same step as a service, handling "the new registration process from start to updated registration ID completion." Remote workers make this daily work, which is why [Multi-State, Reciprocity & Remote Work](/books/workforce/multi-state-and-remote-work#remote-employees-in-a-new-state) treats the registration duty as the first consequence of a remote hire.

## From an Address to Jurisdictions

A street address doesn't name its taxing jurisdictions. ZIP codes cross city, county and school district lines; a mailing city ("Pittsburgh") isn't the municipality (one of dozens of boroughs and townships); and Ohio's municipal and school district boundaries, Pennsylvania's PSDs and transit districts don't follow anything else. The lookup has four steps:

1. **Normalize** the address to a deliverable form (USPS standardization, ZIP+4).
2. **Geocode** it to a point, ideally rooftop or parcel rather than ZIP centroid, and record the precision.
3. **Intersect** the point with jurisdiction boundaries (state, county, municipality, school district, transit district, special districts), each boundary effective-dated because annexations move them.
4. **Map** each jurisdiction to the vendor or agency code the calculation needs (a PSD code, a location code, a GNIS or FIPS code) and to the taxes it levies.

Commercial engines bundle the four (Symmetry's location codes, Vertex's jurisdiction assignment). A platform that builds its own needs boundary data with effective dates and a review queue for low-precision results; field service software faces the same address problem for a different purpose ([Addresses for Service Work](/books/field-operations/customers-and-properties#addresses-for-service-work)), and sales tax engines solve it for rooftop sales tax ([Tax Engines and Filing](/books/commerce/sales-tax-vat-and-duties#tax-engines-and-filing)). Three rules hold regardless of who does it:

- **Store the result with the address, not with the payroll.** `work_locations.jurisdiction_ids` and the person's address history carry the resolved jurisdictions for the address's `valid_during`, so a 2026 correction uses the 2026 result even if the boundary moved in 2027.
- **Ask the employee where the law makes them the source.** Ohio's school district and Pennsylvania's residency certification are the employee's answers; the lookup suggests, the employee attests, and the attestation is a `documents` row.
- **Treat a low-precision geocode as unresolved.** A ZIP-centroid match in a ZIP split by a municipal boundary goes to review before the first payroll, not after the first notice.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `tax_jurisdictions` and `work_locations` exist; this chapter adds boundaries, geocodes and local tax rules. State and local rates use `tax_rates` from [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#how-to-build-it) where the shape fits (a percent of wages) and `local_tax_rates` where it doesn't (a percent of another tax, a flat amount, a resident/nonresident pair, a deciding date).

```sql
-- Boundaries, effective-dated (annexations and new districts move them).
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE jurisdiction_boundaries (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  boundary            GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  source              TEXT NOT NULL,         -- vendor dataset or agency file, with its release
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, valid_during WITH &&)
);
CREATE INDEX ON jurisdiction_boundaries USING GIST (boundary);

-- One geocoding result per address version; work locations and home addresses both use it.
CREATE TABLE address_geocodes (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  address_hash        CHAR(64) NOT NULL,     -- of the normalized address
  normalized_address  JSONB NOT NULL,
  point               GEOMETRY(POINT, 4326),
  precision           TEXT NOT NULL CHECK (precision IN ('rooftop', 'parcel', 'street',
                        'zip4', 'zip', 'unresolved')),
  provider            TEXT NOT NULL,         -- the engine's location service or a geocoder
  provider_location_code TEXT,               -- e.g. an engine location code
  jurisdiction_ids    UUID[] NOT NULL DEFAULT '{}',
  review_status       TEXT NOT NULL DEFAULT 'auto' CHECK (review_status IN ('auto',
                        'needs_review', 'confirmed', 'overridden')),
  reviewed_by         TEXT,
  resolved_as_of      DATE NOT NULL,         -- the boundary date used
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (address_hash, resolved_as_of, provider)
);

ALTER TABLE work_locations   ADD COLUMN address_geocode_id UUID REFERENCES address_geocodes (id);
ALTER TABLE person_addresses ADD COLUMN address_geocode_id UUID REFERENCES address_geocodes (id);

-- Local tax rules that don't fit a plain percent of wages.
CREATE TABLE local_tax_rates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL,         -- 'local_income', 'eit', 'lst', 'wage_tax',
                                             -- 'school_district', 'transit', 'occupational', ...
  agency_ref          TEXT NOT NULL,         -- the collector or administrator to register with
  payer               TEXT NOT NULL CHECK (payer IN ('employee', 'employer')),
  reach               TEXT NOT NULL CHECK (reach IN ('resident', 'work', 'both')),
  resident_rate       NUMERIC(8, 6),
  nonresident_rate    NUMERIC(8, 6),         -- or derived: see rate_basis
  rate_basis          TEXT NOT NULL CHECK (rate_basis IN ('wages', 'state_taxable_income',
                        'state_tax', 'flat_per_period', 'flat_per_year')),
  flat_amount         BIGINT,                -- cents, for per-person taxes
  annual_cap          BIGINT,
  exemption_threshold BIGINT,                -- annual earnings under which the tax doesn't apply
  determined_as_of    TEXT NOT NULL DEFAULT 'pay_date' CHECK (determined_as_of IN ('pay_date',
                        'january_1', 'employee_attestation', 'day_count')),
  day_threshold       SMALLINT,              -- e.g. 20 for Ohio occasional entrants
  derived_from        TEXT,                  -- 'lowest_county_rate' for Maryland nonresidents
  source_ref          TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, tax_type WITH =, payer WITH =,
    valid_during WITH &&)
);

-- Which local taxes apply to a worker on a pay date: resident jurisdictions from the home
-- address, work jurisdictions from the work location, filtered by reach.
SELECT ltr.*
FROM worker_tax_locations wtl
JOIN local_tax_rates ltr ON ltr.jurisdiction_id = wtl.jurisdiction_id
WHERE wtl.worker_id = $1
  AND wtl.valid_during @> $2::DATE                       -- pay date
  AND ltr.valid_during @> $2::DATE
  AND (ltr.reach = 'both' OR ltr.reach = wtl.role::TEXT);
```

Design notes:

- **Resolve the January 1 rules once a year.** For `determined_as_of = 'january_1'` (Indiana counties), snapshot each worker's resident and work counties on January 1 into `worker_tax_locations` rows valid for the year, so a March move doesn't change the county until the next January.
- **Day-count rules need time data.** Ohio's 20-day rule and the multi-state thresholds count days worked in a jurisdiction; the counts come from `time_entries` with a work location, which the next chapter adds as `work_day_allocations`.
- **A rate derived from other rates is a view.** Maryland's nonresident rate is the minimum county rate in effect; compute it from the county rows by date rather than storing a copy that drifts.
- **Registration tasks come from set differences.** For each employer and pay date, the jurisdictions its workers resolve to minus the jurisdictions with an active or pending `tax_registrations` row, by tax type, is the list of registrations to open; run it on every hire, address change and work location change.
- **Version the boundaries and the vendor codes.** When an engine ships new location codes or a boundary moves, existing addresses keep their old geocode until re-resolved on purpose, with the change reviewed like a rate change ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

## Auditing

State and local agencies audit by matching what was withheld for their residents and workers against their own records and by checking registrations. Keep:

- **Each address's geocode result**, precision, the boundary date used and any manual override with who made it.
- **Employee attestations**: residency certifications, school district answers and nonresident certificates, as signed documents.
- **The local rate rows in effect on each pay date** and their sources.
- **Registrations with their dates**: applied, pending, number issued, active, closed, and the first payroll that needed each.
- **The January 1 snapshots** for rules decided on that date.

## What This Means for the System You Build

- **Separate the address lookup from the calculation,** run it on address and location changes, and store the jurisdictions with the address's dates.
- **Model jurisdiction, tax and agency as three things,** registering and remitting to the agency.
- **Keep a tax election per jurisdiction,** because state forms differ from the federal W-4 and some still use allowances.
- **Encode each local tax's reach, deciding date, rate shape and threshold as data,** using the comparison table above as the schema test.
- **Ask the employee for what the law makes them answer,** such as Ohio's school district and Pennsylvania's residency, and keep the answer.
- **Open registration tasks automatically** whenever workers resolve to a jurisdiction with no account, and let pending registrations accrue liabilities.
- **Resolve rates by pay date** so mid-year changes such as Philadelphia's July 1 rate need no code change.

## References

**Law and regulation**

- [Ohio Revised Code 718.011](https://codes.ohio.gov/ohio-revised-code/section-718.011), the twenty-day exception, principal place of work and small employers
- [Ohio Revised Code 5747.06](https://codes.ohio.gov/ohio-revised-code/section-5747.06), employer withholding of school district income tax and the employee's duty to report their district
- [Maryland Tax-General 10-106](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gtg&section=10-106&enactments=false), county income tax rates between 2.25% and 3.30% and brackets
- [Maryland Tax-General 10-106.1](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gtg&section=10-106.1&enactments=false), the nonresident rate equal to the lowest county rate
- [Michigan Compiled Laws 141.503](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-141-503), maximum city income tax rates for cities over 600,000

**Agency guidance and forms**

- [California EDD: Rates and withholding](https://edd.ca.gov/en/payroll_taxes/rates_and_withholding/), the DE 4 and withholding without a valid DE 4
- [California EDD: 2026 Method B, exact calculation method](https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf), Method A and Method B
- [Illinois Department of Revenue: Income tax rates](https://tax.illinois.gov/research/taxrates/income.html), 4.95% since July 1, 2017
- [North Carolina Department of Revenue: Tax rate schedules](https://www.ncdor.gov/taxes-forms/tax-rate-schedules), 3.99% for taxable years after 2025 and possible changes from 2027
- [Indiana Department of Revenue: Departmental Notice 1](https://www.in.gov/dor/files/dn01.pdf), the 2.95% state rate, county rates by January 1 residence and work, the worked example and the 30-day rule
- [Pennsylvania DCED: Local income tax information](https://dced.pa.gov/local-government/local-income-tax-information/), EIT withholding at PA worksites, PSD codes, the residency certification and certified collectors
- [City of Philadelphia: Wage Tax for employers](https://www.phila.gov/services/payments-assistance-taxes/business-taxes/wage-tax-employers/), rates from July 1, 2026, quarterly filing and payment frequency
- [New York State: Withholding tax rates and publications](https://www.tax.ny.gov/bus/wt/rate.htm), NYS-50-T-NYS, NYS-50-T-NYC and NYS-50-T-Y for 2026
- [New York State: NYS-50-T-Y, Yonkers withholding](https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_y.pdf), the 16.75% resident surcharge and supplemental rates
- [City of St. Louis: Earnings tax](https://www.stlouis-mo.gov/government/departments/collector/earnings-tax/index.cfm), the one percent earnings tax and quarterly employer due dates
- [Oregon Department of Revenue: Statewide transit tax](https://www.oregon.gov/dor/programs/businesses/Pages/Statewide-Transit-Tax.aspx), 0.1% on residents' and nonresidents' Oregon wages
- [TriMet: Transit tax information](https://trimet.org/taxinfo/), the 0.8237% employer rate
- [Lane Transit District: Payroll and self-employment tax information](https://www.ltd.org/about/transit-tax/), the 0.80% employer rate on wages for services within the district

**Vendor documentation**

- [Check: Taxes, agencies and jurisdictions](https://docs.checkhq.com/docs/taxes-and-agencies.md), jurisdictions, taxes and agencies
- [Check: Tax filings](https://docs.checkhq.com/docs/tax-filings.md), filing blockers including applied-for and invalid tax IDs
- [Gusto Embedded: Get tax requirements for a state](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_uuid-tax_requirements-state.md), registrations, masks and blocking requirements
- [Symmetry: What is the Symmetry Tax Engine](https://docs.symmetry.com/ste/overview/what-is-the-ste), location codes and local taxes
- [Vertex: Payroll tax](https://www.vertexinc.com/solutions/tax-type/payroll-tax), address cleansing, jurisdiction assignment and GeoAlign
- [ADP: SmartCompliance Employment Tax](https://apps.adp.com/en/apps/623571/adp-smartcompliance-employment-tax), new registrations through to an issued ID

**In practice**

- [Tax Foundation: State individual income tax rates and brackets, 2026](https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/), states without a wage income tax
