+++
title = "Minimum Wage as Data"
nav_title = "Minimum Wage as Data"
description = "Minimum wage tables by federal, state and city level with effective dates, tipped and youth rates, indexing, which rate applies, and the table as a product."
category = "Workforce Industry"
order = 2630
part = "Time and Wage-Hour"
tags = ["payroll", "minimum-wage", "wage-and-hour", "rules-as-data", "jurisdictions"]
+++

The federal minimum wage has been $7.25 an hour since July 24, 2009, and almost nobody's payroll is governed by it alone. As of November 5, 2026, the Department of Labor's state table shows most states above it, with Washington at $17.13 and the District at $18.40; Oregon has three rates by region, New York two, New Jersey two by employer size, and Ohio two by gross receipts. Cities and counties add their own (Seattle's is $21.30 for 2026 and already published at $22.14 for 2027; San Francisco's went to $19.61 on July 1, 2026). Most of them change every year, on January 1 or July 1, by a formula tied to inflation, and a few change on dates set in a ballot measure years ago. Tipped employees have a second table, youth and training wages a third, and the salary that keeps an employee exempt from overtime moves with the minimum wage in California.

So the minimum wage isn't a constant in the code. It's a table: every jurisdiction that sets one, every rate kind, every condition on who it covers, every effective date, the source each row came from, and the date someone checked it. A payroll or scheduling product that gets the table right on January 1 for 500 jurisdictions is doing a product job, with sources, review, release and customer notice, not a configuration job. This chapter covers the federal, state, county and city layers with effective dates, tipped minimums, youth and training wages, indexed increases, which rate applies to remote and traveling workers, the minimum wage check itself, and the table as a product with change management. The tipped minimum and tip credit mechanics are in [Tipped Employees](/books/workforce/tipped-employees); the exempt salary level is in [Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#exemptions-and-the-salary-level). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Payroll APIs either look the minimum wage up for the partner or leave it to them. As of November 2026:

| Platform | Lookup | The make-up line | Notes |
| --- | --- | --- | --- |
| **Check** | None; "it is critical to know the minimum wage requirements set by federal, state, local, city or union," and the partner computes the adjustment | Memo types `tip_credit_adjustment_to_minimum_wage` and `piece_adjustment_to_minimum_wage` | The partner owns the table |
| **Gusto Embedded** | `GET /v1/locations/{location_uuid}/minimum_wages` returns each applicable rate with its `authority` (City, State or Federal), `wage`, `wage_type`, `effective_date` and `notes`; the caller chooses which applies | `adjust_for_minimum_wage: true` on a compensation with the chosen `minimum_wages`, paid as a "Minimum Wage Adjustment" earning | Returns several rates for one address; tipped employees are the main use |
| **Homebase** | Compliance alerts by email when the minimum wage is increasing | | Scheduling and time side |
| **Paycor** | A public state table "effective 1/1/26 except as noted" (last updated December 4, 2025), noting that 63 localities have rates above their state's | | Published as a resource page, not an API; I wouldn't use it as a figure source, because its table and text disagree for some states |
| **Zeal** | Minimum wage rules by `workLocationID`, `companyID` and an `effectiveDate` that defaults to today, returning jurisdiction, effective date and rate | | No tipped rate or jurisdiction level in the response |

Two designs. **The provider owns the table** (Gusto, Zeal), keyed by location and date, and returns more than one rate because more than one applies; the caller or the engine picks the highest. **The partner owns the table** (Check) and sends the make-up as its own line. Either way, the make-up line is a named earning type, and the inputs to it (which rate, from which jurisdiction, effective when) belong in the record of the calculation.

## The Layers

### Federal

- **The rate.** "$7.25 an hour" (29 USC 206(a)(1)(C)), in effect since July 24, 2009, after increases to $5.85 on July 24, 2007 and $6.55 on July 24, 2008.
- **Youth opportunity wage.** An employer may pay a worker under 20 "not less than $4.25 an hour" during the first 90 consecutive calendar days of employment, and "No employer may take any action to displace employees" to do it (29 USC 206(g)). State law often doesn't allow it.
- **Tipped employees.** A cash wage of at least $2.13 with a tip credit of up to $5.12 ([Tipped Employees](/books/workforce/tipped-employees#the-tip-credit)).
- **Federal contractors.** Executive Order 14026's contractor minimum wage was revoked by Executive Order 14236 of March 14, 2025, and DOL says it "is no longer enforcing Executive Order 14026 or the implementing rule (29 CFR part 23)." Prevailing wage on public work is a different regime, in the Field Operations volume's [Prevailing Wage and Public Work](/books/field-operations/technician-workforce#prevailing-wage-and-public-work).

### State

DOL's consolidated table (updated November 5, 2026) is the most convenient national source, and every row in it still needs the state's own source behind it. Selected basic rates from it:

| State | Rate | Condition or tier |
| --- | --- | --- |
| District of Columbia | $18.40 | Indexed each July 1 |
| Washington | $17.13 | Indexed |
| New York | $17.00 | New York City, Nassau, Suffolk and Westchester |
| | $16.00 | Rest of the state |
| Connecticut | $16.94 | |
| California | $16.90 | Indexed; local and industry rates may be higher |
| Oregon | $16.80 | Portland metro |
| | $15.55 | Standard |
| | $14.55 | Nonurban counties; all three indexed each July 1 |
| New Jersey | $15.92 | General |
| | $15.23 | Employers with fewer than 6 employees and seasonal employees |
| Colorado | $15.16 | |
| Arizona | $15.15 | |
| Florida, Illinois, Maryland, Massachusetts | $15.00 | Illinois: employers of 4 or more, excluding family members; Florida indexing from January 1, 2028 |
| Michigan | $13.73 | Employers of 2 or more; $15.00 on January 1, 2027, then by formula |
| Virginia | $12.77 | Indexed |
| Nevada | $12.00 | |
| Minnesota | $11.41 | Indexed |
| Ohio | $11.00 | Employers with annual gross receipts of $405,000 or more; $7.25 for smaller |
| Georgia, Wyoming | $5.15 | The federal $7.25 applies to FLSA-covered employers |
| Alabama, Louisiana, Mississippi, South Carolina, Tennessee | None | The federal $7.25 applies to FLSA-covered employers |

The table shows the shapes a schema has to hold: rates by **region** within a state (New York, Oregon), by **employer size** in headcount (New Jersey, Illinois, Michigan) or gross receipts (Ohio), by **employee kind** (seasonal in New Jersey), and states below the federal rate, where the state rate binds only employers the FLSA doesn't cover. DOL's notes add the **linkages**: Maine raises its rate to match a higher federal rate, Massachusetts keeps its rate at least $0.50 above the federal one, and Vermont's is replaced by the federal rate if that is higher. And it lists the states that **index** annually by formula: California, the District of Columbia and Oregon (each July 1 for those two), Maine, Minnesota, Montana, New Jersey, South Dakota, Vermont, Virginia, Washington and Ohio.

One more shape: **sources disagree.** On the same days DOL's table showed Alaska at $14.00, the Alaska Department of Labor's own wage and hour page still said "The minimum wage shall be $13.00 per hour effective Jul. 1, 2025." One of them is stale, and a table built by scraping either one without a check would be wrong. <!-- source-gap: wf-alaska-min-wage | status | Alaska's 2026 minimum wage ($14.00 per DOL's November 5, 2026 table; $13.00 effective July 1, 2025 per the Alaska DOLWD page) | closes with: an Alaska DOLWD notice or regulation stating the current rate and its effective date | checked: 2026-11-10 --> I haven't resolved which is current, so the Alaska row of any real table needs the state's notice or regulation behind it.

### Local

Cities and counties set their own rates, almost always above the state's and almost always indexed. Two examples from the cities' own pages:

- **Seattle:** $21.30 an hour for 2026 and $22.14 for 2027, adjusted each January 1 by the Seattle-Tacoma-Bellevue CPI-W, with each year's increase announced by the fall; it applies to employees "working within city limits."
- **San Francisco:** $19.61 an hour effective July 1, 2026 ($17.35 for a small group of government-supported employees), adjusted each July 1 by the Consumer Price Index; it applies to employees performing work in San Francisco, including part-time and temporary employees.

California's DIR states the general rule for local rates: "employees must be paid the local wage where it is higher than the state or federal minimum wage rates." California also has industry minimums above the state rate (fast food since April 1, 2024, and certain health care workers), which the DIR's FAQ points to separately; they key on the employer's industry and size, not the address. <!-- source-gap: wf-ca-industry-min-wage | missing | California fast food and health care worker minimum wage amounts and schedules for 2026 | closes with: the DIR fast food and health care minimum wage FAQ pages (the fast food FAQ URL returned 404 on Nov 10, 2026) | checked: 2026-11-10 --> I didn't reach the DIR's pages with the amounts, so they're not stated here.

A city ordinance is the layer a table most often lacks. Paycor's resource page counted 63 localities above their state's rate as of its December 2025 update; each has its own effective date, index, coverage test and sometimes its own tipped and small-employer rates.

## Which Rate Applies

The rule is the higher of every minimum that covers the work, and coverage is about where the work is performed:

- **Higher wins.** Federal, state and local minimums all apply where they cover the employee, and the employee is owed the highest. DOL's notes show states that build this into their own laws (Delaware, Kentucky, Iowa, New Hampshire, New York and Vermont follow the federal rate when it is higher), and California's DIR says the local wage controls where it's higher.
- **Where the work is, not where the employer is.** Seattle's ordinance covers employees "working within city limits," San Francisco's covers employees performing work in the city. A company headquartered in Seattle with an employee working from home in Spokane owes that employee Washington's rate, not Seattle's; an employer in Tacoma whose employee spends Tuesday at a Seattle client site owes Seattle's rate for Tuesday's hours, subject to the ordinance's own coverage threshold.
- **Remote workers.** A remote employee's work location is their home ([Remote Employees in a New State](/books/workforce/multi-state-and-remote-work#remote-employees-in-a-new-state)), so `work_locations` with `kind = 'remote_home'` carries the jurisdictions whose minimums apply. A move is a new work location with a new effective date, and the minimum wage check reads it the same way the tax engine does.
- **Traveling workers.** For drivers, technicians and others who work in several cities in a week, the minimum is per hour by location, which means time entries need a location precise enough to find the jurisdiction. `time_entries.work_location_id` is the hook; an entry with no location is checked at the employee's assigned location, which is the cautious choice only if that's the highest rate they could have worked under.
- **The employer's attributes.** Headcount (New Jersey, Illinois, Michigan), gross receipts (Ohio), industry (California fast food) and FLSA coverage (Georgia, Wyoming) select the row, so the employer record needs them, by date.

Local coverage thresholds (a minimum number of hours worked in the city in a period before the ordinance applies) exist in several ordinances and differ by city; the two city pages I quote above don't state one, and a real table holds each ordinance's test from its text.

## The Minimum Wage Check

Under the FLSA, the workweek is the unit: "The workweek is to be taken as the standard in determining the applicability of the Act," and an employee's hours in a week "must be compensated for in accordance with the minimum wage and overtime pay provisions" (29 CFR 776.4). So the federal check is total wages for the workweek that count toward the minimum, divided by hours worked, against the rate. Pay excluded from the regular rate under section 7(e) can't be credited toward the minimum wage (29 USC 207(h)), so a holiday gift or a discretionary bonus doesn't rescue a short week.

California's DIR frames its rule as "employers must pay all employees at least the minimum wage per hour." <!-- source-gap: wf-ca-no-averaging | missing | California's rule that the minimum wage is owed for each hour worked rather than on a workweek average (Armenta v. Osmose and later cases) | closes with: the Armenta v. Osmose opinion (2005) 135 Cal.App.4th 314 or a DLSE manual section on averaging | checked: 2026-11-10 --> The case law on whether an employer may average across a week there isn't quoted in this chapter; my engine checks both the workweek total and each hour's pay where the state rule is per hour, which is also why California separately pays piece-rate workers for rest and nonproductive time ([Piece Rate in California](/books/field-operations/technician-workforce#piece-rate-in-california)).

### Worked Numbers: A Commission Week

An invented inside salesperson in a state with no minimum wage above the federal one is paid commissions only, and earns $250.00 of commissions in a 40-hour week. $250.00 ÷ 40 = $6.25 an hour, short of $7.25 by $1.00 an hour, so the employer owes a make-up of 40 × $1.00 = **$40.00** for the week, paid as a minimum wage adjustment line. The next week's $600.00 doesn't offset it: each workweek stands alone. If the same employee had worked 45 hours, the check would be 45 × $7.25 = $326.25 against the week's pay, and the overtime premium on the regular rate (now $7.25 after the make-up) would be owed on top ([Overtime & the Regular Rate](/books/workforce/overtime-and-the-regular-rate#the-regular-rate)).

### Worked Numbers: The January 1 Rollover

Michigan's minimum rises from $13.73 to $15.00 on January 1, 2027. An invented employee paid $14.00 an hour on a biweekly schedule has a pay period from Sunday, December 27, 2026 through Saturday, January 9, 2027, and works 8 hours a day on December 28 through 31 (32 hours) and on January 4 through 8 (40 hours), plus 8 hours on Saturday, January 2.

| Dates | Hours | Rate paid | Minimum | Shortfall |
| --- | --- | --- | --- | --- |
| December 28 to 31 | 32 | $14.00 | $13.73 | none |
| January 2 | 8 | $14.00 | $15.00 | 8 × $1.00 = $8.00 |
| January 4 to 8 | 40 | $14.00 | $15.00 | 40 × $1.00 = $40.00 |
| **Period** | 80 | | | **$48.00** |

The rate has to be applied by the date each hour was worked, not by the period's start or the check date, and the January 2 hours fall in the workweek of December 27 to January 2, which also holds 32 hours at the old rate. The right fix is not a make-up line every period forever but a raise effective January 1, which means the table has to be in the system before December's last schedule is built, and the employer needs to be told which employees fall under it ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)). If the table is updated late and the period has already paid, the shortfall is retro pay on the next run ([Retroactive Rate Changes](/books/workforce/retro-pay-voids-and-corrections#retroactive-rate-changes)).

## Tipped, Youth and Training Rates

Each rate kind is its own row with its own conditions:

- **Tipped cash wages and tip credits** are a separate table by state: DOL's tipped table (also November 5, 2026) lists Alaska, California, Guam, Minnesota, Montana, Nevada, Oregon and Washington as requiring the full state minimum before tips, Illinois at a 40% credit ($9.00 cash), Pennsylvania at a $2.83 cash wage, the District of Columbia at $10.30, and Hawaii allowing a $1.25 credit only when wages plus tips are at least $7.00 above the minimum. Mechanics are in [Tipped Employees](/books/workforce/tipped-employees#state-tip-credit-rules).
- **Youth and training wages** carry an age limit, a duration (the federal 90 consecutive days) and an anti-displacement rule, which means the check needs the date of birth (a required record for under-19s under 29 CFR 516.2(a)(3)) and the hire date.
- **Industry and occupation rates** key on the employer's industry or the job, not the place.

## The Table as a Product

A minimum wage table that a payroll provider or a scheduling product ships to thousands of employers is a product with releases. The work is the same whether it's sold or built in-house:

- **Sources per row.** Every rate carries the primary source it came from (the statute, the agency notice, the ordinance), the URL, the date retrieved, and the effective date the source states. A secondary table like DOL's or a vendor's is a cross-check, not a source, as the Alaska discrepancy shows.
- **A calendar of known changes.** Most changes are known months ahead: Seattle announces by the fall, Michigan's 2027 rate is in DOL's table already, indexed states publish their new rates before January 1 or July 1, and Florida's indexing starts in 2028. Each upcoming change is a future-dated row from the day it's announced, so schedules and payrolls built in December already see January ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Review before release.** A rate change is entered by one person and approved by another against the source, with a diff of every row that changed in the release.
- **Impact before the date.** Before a change takes effect, run it against every employer: which employees' pay rates fall below the new minimum, which tipped employees' cash wages do, which exempt salaries fall under a threshold tied to the minimum (California's $70,304 for 2026). Homebase's emails before an increase are the customer-facing form of this; the useful version names the employees.
- **Coverage tests as data.** Headcount, gross receipts, industry, hours thresholds and exemptions are columns on the row, evaluated against the employer's own dated attributes, never prose in a notes field.
- **Corrections are releases too.** A wrong rate found after payrolls ran produces a list of affected statements and a retro calculation for each, with the release that fixed it recorded on every retro line.

The core data model's [`tax_rates`](/books/workforce/fica-futa-and-suta#how-to-build-it) table holds statutory rates and bases for taxes; minimum wages get their own table because their selectors (employer size, industry, age, tipped status, local coverage tests) and their use (a floor checked per hour or per workweek, not a percentage of wages) are different.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Rates hang off `tax_jurisdictions` (the same rows the tax engine resolves from an address, including cities and counties); checks are written per worker per workweek per jurisdiction; `pay_rates` can track a minimum instead of a fixed amount; `employers` gets the attributes rates select on.

```sql
CREATE TABLE minimum_wage_rates (          -- one row per jurisdiction, kind and condition, dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  rate_kind           TEXT NOT NULL CHECK (rate_kind IN ('standard', 'tipped_cash',
                        'tip_credit_max', 'youth', 'training', 'industry', 'exempt_salary')),
  rate                NUMERIC(10, 4) NOT NULL,   -- per hour; per year for 'exempt_salary'
  conditions          JSONB NOT NULL DEFAULT '{}',   -- {"min_employees": 4},
                                             -- {"max_employees": 5}, {"min_gross_receipts": 40500000},
                                             -- {"industry": "fast_food"}, {"max_age": 19, "max_days": 90},
                                             -- {"flsa_covered": false}, {"region": "portland_metro"}
  condition_key       TEXT NOT NULL DEFAULT '',      -- canonical form of conditions, for uniqueness
  coverage_test       JSONB NOT NULL DEFAULT '{}',   -- local hours thresholds, from the ordinance
  linkage             TEXT,                  -- 'federal_plus_0_50' (MA), 'match_federal' (ME)
  index_rule          TEXT,                  -- 'cpi_w_seattle_tacoma_bellevue', 'statute_formula'
  source_url          TEXT NOT NULL,         -- the primary source
  source_retrieved_on DATE NOT NULL,
  announced_on        DATE,                  -- when the rate became known
  release_id          UUID NOT NULL,         -- the table release that shipped it
  approved_by         TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, rate_kind WITH =, condition_key WITH =,
    valid_during WITH &&)
);

ALTER TABLE employers                      -- attributes rates select on, by year
  ADD COLUMN minimum_wage_profile JSONB NOT NULL DEFAULT '{}';  -- {"2026": {"employees": 42,
                                             --  "gross_receipts": 310000000, "industry": "retail",
                                             --  "flsa_covered": true}}

ALTER TABLE pay_rates
  ADD COLUMN tracks_minimum_kind TEXT,       -- 'standard': the rate is "the minimum," re-dated
  ADD COLUMN minimum_premium     NUMERIC(10, 4);  -- e.g. minimum plus $1.00

CREATE TABLE minimum_wage_checks (         -- per worker, workweek and jurisdiction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  workweek_start      DATE NOT NULL,
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  test                TEXT NOT NULL CHECK (test IN ('workweek_average', 'per_hour')),
  hours               NUMERIC(7, 2) NOT NULL,   -- hours worked under this jurisdiction
  creditable_cents    BIGINT NOT NULL,       -- wages that count toward the minimum
  required_cents      BIGINT NOT NULL,       -- hours x the applicable rate(s), by date
  rate_ids            UUID[] NOT NULL,       -- the minimum_wage_rates rows applied
  shortfall_cents     BIGINT GENERATED ALWAYS AS (GREATEST(required_cents - creditable_cents, 0))
                        STORED,
  makeup_line_id      UUID REFERENCES pay_statement_lines (id),
  calculation_run_id  UUID REFERENCES calculation_runs (id),
  UNIQUE (worker_id, workweek_start, jurisdiction_id, test, calculation_run_id)
);
```

The applicable rate for an hour is a query, not a field: every `minimum_wage_rates` row of the right kind whose jurisdiction contains the hour's work location, whose `valid_during` contains the hour's date and whose conditions match the employer's profile for that year and the worker's attributes, then the maximum. A check runs per workweek for each jurisdiction the week's hours touched, and the make-up line pays the largest shortfall, not the sum. Pay rates that are "minimum wage" or "minimum plus a dollar" are stored as such (`tracks_minimum_kind`), and a table release that changes the minimum re-dates them automatically, with the impact report showing which ones moved.

Design notes:

- **More than one rate applies; store them all and pick at calculation time,** as Gusto's lookup does, and record which won.
- **Effective dates are by the hour worked,** across period and workweek boundaries.
- **Every row has a primary source and an approver;** a secondary table is a check against the rows, not a feed.
- **Future-date announced changes the day they're known,** and run the impact report before the date.

## Auditing

The minimum wage record answers a DOL investigation, a state audit and a customer asking why a rate changed:

- **Every check per worker per workweek** with the hours by jurisdiction, the wages credited, the rates applied and any make-up paid.
- **The table's history,** with each row's source, retrieval date, approver and release, and the diff of every release.
- **The employer's profile by year,** since headcount and receipts select rates.
- **Impact reports** run before each change, and the notices sent from them.
- **Corrections** traced from a fixed table row to every retro line it produced.

## What This Means for the System You Build

- **Model the minimum wage as effective-dated rows per jurisdiction and kind,** with conditions as data.
- **Resolve every applicable rate from the work location and date,** and pay the highest.
- **Check each workweek per jurisdiction,** and per hour where the state rule is per hour.
- **Store "pays the minimum" as a rule on the pay rate,** not a number someone has to update.
- **Source every row from the jurisdiction itself,** and treat secondary tables as cross-checks.
- **Ship table changes as reviewed releases,** future-dated when announced, with an impact report per employer.
- **Re-test exempt salaries and tipped cash wages** whenever a minimum they're tied to changes.

## References

**Law and regulation**

- [29 USC 206: Minimum wage](https://www.law.cornell.edu/uscode/text/29/206), $7.25 and the youth opportunity wage of $4.25 for 90 days with its displacement ban
- [29 USC 207: Maximum hours](https://www.law.cornell.edu/uscode/text/29/207), section 7(h): excluded sums not creditable toward minimum wage
- [29 CFR 776.4: Workweek standard](https://www.law.cornell.edu/cfr/text/29/776.4), the workweek as the standard for minimum wage and overtime
- [29 CFR 516.2: Employees subject to minimum wage or overtime](https://www.law.cornell.edu/cfr/text/29/516.2), date of birth for employees under 19
- [California Labor Code 515](https://california.public.law/codes/ca_lab_code_section_515), the exempt salary tied to the state minimum wage

**Agency guidance and forms**

- [DOL WHD: State minimum wage laws](https://www.dol.gov/agencies/whd/minimum-wage/state), the November 5, 2026 table, tiers, thresholds, indexing, linkages and scheduled increases
- [DOL WHD: Minimum wages for tipped employees](https://www.dol.gov/agencies/whd/state/minimum-wage/tipped), the November 5, 2026 tipped table
- [DOL WHD: History of federal minimum wage rates](https://www.dol.gov/agencies/whd/minimum-wage/history/chart), the 2007, 2008 and 2009 increases
- [DOL WHD: Executive Order 14026](https://www.dol.gov/agencies/whd/government-contracts/eo14026), revoked by Executive Order 14236 and no longer enforced
- [California DLSE: Minimum wage FAQ](https://www.dir.ca.gov/dlse/faq_minimumwage.htm), $16.90 for 2026, the local wage where higher, industry rates and the per-hour rule
- [Alaska Department of Labor: Wage and Hour Act](https://labor.alaska.gov/lss/whact.htm), the $13.00 rate stated effective July 1, 2025
- [Seattle Office of Labor Standards: Minimum wage](https://www.seattle.gov/laborstandards/ordinances/minimum-wage), $21.30 for 2026, $22.14 for 2027 and CPI-W indexing
- [San Francisco: Minimum Wage Ordinance](https://www.sf.gov/information/minimum-wage-ordinance), $19.61 from July 1, 2026 and annual CPI adjustment

**Vendor documentation**

- [Check: Working with piece rate pay](https://docs.checkhq.com/docs/working-with-piece-rate-pay.md), the partner's duty to know federal, state, local and union minimums
- [Check: Types of earnings](https://docs.checkhq.com/reference/types-of-earnings), tip credit and piece minimum wage adjustment memo types
- [Gusto Embedded: Adjust for minimum wage](https://docs.gusto.com/embedded-payroll/docs/adjust-for-minimum-wage.md), the location minimum wages endpoint, authorities, effective dates and the adjustment earning
- [Homebase: Labor law compliance](https://joinhomebase.com/labor-law-compliance/), alerts when minimum wage increases
- [Paycor: Minimum wage by state](https://www.paycor.com/resource-center/articles/minimum-wage-by-state/), the 2026 table and the count of 63 localities above their state
- [Zeal: Get minimum wage rules](https://docs.zeal.com/reference/embedded-hr/get-minimum-wage-rules.md), rules by work location and effective date
