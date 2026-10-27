+++
title = "Operating Metrics"
description = "One definition per property metric: occupancy, leased %, exposure, trade-out, renewals, delinquency, turns, work orders, NOI, funnel and benchmarks."
category = "Property Tech Industry"
order = 1738
part = "Running the Platform"
tags = ["property-tech", "metrics", "occupancy", "noi", "benchmarking", "antitrust"]
+++

Property management runs on a dozen numbers, and every one of them has at least two definitions in common use. Occupancy is physical or economic, a point in time or a daily average, divided by total units or by rentable units, counted by unit or by bed or by square foot. Trade-out is new leases or renewals or blended, gross or net of concessions. Turnover is move-outs over units, or over expiring leases. An owner comparing two managers, a lender testing a covenant, an asset manager reading a reforecast and a site team chasing a bonus all read the same words and compute different things, and the platform is usually where the difference is created: one report uses rentable units, another total units, a third the snapshot from the first of the month.

This chapter owns the volume's metric definitions. Earlier chapters store the inputs (leases and unit status periods, renewal offers, guest cards, turns, work orders, utility billing runs) and point here for the formulas. The general practice for metric definitions (one definition per metric with its version, grain and business date, frozen periods, reconciliation to source) is in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); RealPage states the same principle for its AI suite as "every metric carries one governed definition." What follows is the property-specific content: the definitions, where the industry disagrees, and why sharing these numbers with competitors is an antitrust question.

## Why the Same Metric Disagrees

Four choices change every number in this chapter, and each definition below states all four:

- **The denominator.** Total units, rentable units (excluding units in a down, model, employee or office period), or units available to lease. On a 100-unit property with a model and an office, 95 occupied units is 95% of total or 96.9% of rentable ([Unit Status and Its History](/books/property-tech/portfolios-properties-and-units#unit-status-and-its-history)). Lenders publish their own rule: Fannie Mae's multifamily guide counts only "tenants who physically occupy the unit, and have commenced paying rent," and lets non-revenue units "such as management units, employee occupied units, maintenance units, and model units" be included.
- **Point in time or average.** Occupancy on the last day of the month, or the average of daily occupancy over it. MAA defines average physical occupancy as "the average of the daily physical occupancy for an applicable period." A month that ends with a wave of move-ins looks better at month end than on average.
- **The basis: units, beds, square feet or dollars.** Physical occupancy counts space; economic occupancy counts money. Student housing counts beds, storage counts square feet, senior living counts residents as well as units ([Census](/books/property-tech/senior-living#census)).
- **The population.** All properties, or a same-store set owned and stabilized for both periods compared. MAA calls a community stabilized when "achieving 90% average physical occupancy for 90 days"; a lease-up in the average drags every number.

My rule: a metric definition is a row with its formula, denominator, basis, timing and population, versioned; every report and every data share names the definition and version it used; and a period that has been reported to an owner or a lender is frozen as reported, with restatements as new versions ([Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods)).

## How the Platforms Report

The suites sell reporting libraries and BI on their own data, and increasingly benchmarks against other operators' data. Entrata's BI offers dashboards that drill down to lead, lease and unit, and its Data Share puts the data in the customer's warehouse; RealPage's Lumina principles promise one governed definition per metric; and RealPage's Performance Analytics with Benchmarking "allows landlords to compare the performance of their properties and floor plans... to their competitors," in the Justice Department's description. The last kind is where this chapter ends: benchmarking against competitors' nonpublic data is an information exchange question (Benchmarking as an Information-Exchange Risk, below).

## Occupancy, Leased and Exposure

All of these derive from leases, unit status periods and, for students, bed assignments; none is a stored column ([The Life of a Unit](/books/property-tech/property-business#the-life-of-a-unit)).

| Metric | Definition | Notes |
| --- | --- | --- |
| **Rentable units** (on a date) | Units whose status period on that date is `rentable` | The default denominator; total units is the alternative, and reports say which |
| **Physical occupancy** (unit) | Units with a current lease whose move-in has happened and move-out hasn't, ÷ rentable units | Point in time on a date, or the average of daily values over a period |
| **Economic occupancy** | Rent actually earned ÷ gross potential rent for the period | AvalonBay: "total possible Residential revenue less vacancy loss as a percentage of total possible Residential revenue"; Fannie Mae's economic vacancy adds concessions and bad debt to physical vacancy |
| **Leased %** | Rentable units with a current or future signed lease, net of units on notice without a pre-lease, ÷ rentable units | NAA's quick guide: "Leased Units ÷ Total Units" (note its denominator) |
| **Exposure** | Vacant unleased units + units on notice without a pre-lease, over a horizon | The pricing and marketing input ([Revenue Management & Pricing](/books/property-tech/revenue-management), [Exposure-driven spend](/books/property-tech/listings-and-marketing#exposure-driven-spend)); report the horizon (30, 60 or 90 days) |
| **Exposure %** | Exposure ÷ rentable units | The same horizon as exposure |
| **Pre-leased %** (for a future date or term) | Rentable units (or beds) with a signed lease starting by that date ÷ rentable units (or beds) | The student metric; also used for lease-ups |

Physical and economic occupancy answer different questions. A property 96% physically occupied with two months' free rent on new leases and a delinquency problem might be 85% economically occupied; the owner's income follows the second number. Lenders use both: Fannie Mae's guide requires "85% physical occupancy; and 70% economic occupancy" on the commitment date and for the preceding three months, and HUD's MAP Guide requires average physical occupancy of at least 85% and caps underwritten economic occupancy for market-rate properties at 93%.

**By bed.** Student housing reports occupancy, leased percentage and pre-leasing by bed, with rentable beds as the denominator and unassigned signed leases counting toward pre-leasing by bed type ([Occupancy Counted by Bed](/books/property-tech/student-housing#occupancy-counted-by-bed)). American Campus Communities' 10-K computed average occupancy "based on the average number of occupied beds for the year... divided by total beds," and noted that for shorter lease terms the average includes summer's lower occupancy. Report the unit figure beside the bed figure; only the bed figure says what the property earns.

**By square foot.** Storage reports occupancy by occupied square feet ÷ net rentable square feet, and revenue per occupied and per available square foot: Public Storage computes "Realized annual rent per occupied square foot" from rental income "before late charges and administrative fees" divided by "weighted average occupied square feet," and "REVPAF" by dividing by "total available net rentable square feet" ([Self Storage](/books/property-tech/self-storage#unit-inventory)). Commercial property also measures by area, and separates leased from occupied: BXP's occupancy counts "signed leases for which revenue recognition has commenced," and its leased percentage adds "signed leases for vacant space with future commencement dates" ([Measuring Space](/books/property-tech/commercial-property#measuring-space)).

**By resident.** Senior living reports occupancy by care setting (units) and census (residents by care level and payer), snapshotted nightly as reported ([Census](/books/property-tech/senior-living#census)). Welltower's supplement defines a seniors housing community as stable at "the earliest of 90% occupancy, NOI at or above the underwritten target or 12 months past the underwritten stabilization date."

**By night.** Short-term rentals use hotel measures: occupancy as nights sold ÷ nights available, average daily rate as room revenue ÷ nights sold, and revenue per available night as room revenue ÷ nights available, with owner nights and blocked nights excluded from availability and the exclusion stated ([Short-Term Rentals](/books/property-tech/short-term-rentals)).

## Rent: GPR, Loss to Lease and Effective Rent

The operating statement starts at gross potential rent ([The Property's Money](/books/property-tech/property-business#the-property-s-money)):

- **Gross potential rent (GPR).** Every unit at its rent for the full period. Fannie Mae's line definition is income "as if all units were 100% occupied," including model, office, employee and other non-revenue units, with loss or gain to lease "added/subtracted from GPR"; NAA's quick guide uses "Total # of Units x Average Market Rent." State whether GPR is at market rent (with loss to lease below it) or at lease rent for occupied units and market for vacant.
- **Loss (gain) to lease.** Market rent minus in-place lease rent, summed over occupied units: the income the rent roll leaves on the table at today's market. It is a statement about the market rent the operator chose, so the market rent source and date are part of the record.
- **Effective rent.** Rent net of concessions, with a free month spread over the term ([Concessions](/books/property-tech/charges-and-resident-ledgers#concessions)). MAA's average effective rent per unit is gross rent "after the effect of leasing concessions for occupied units plus prevalent market rates asked for unoccupied units, divided by the total number of units," and it says this "does not represent actual rental revenue collected per unit."
- **Vacancy loss, concessions and bad debt** are their own lines below GPR, never netted into it, so economic occupancy can be decomposed.

## Trade-Out

**Trade-out** compares the rent on a lease with the rent on the lease it replaces, for the same unit (new leases) or the same household (renewals). MAA's definitions are typical: effective new lease rate growth is "the growth in gross rent amounts after the effect of leasing concessions for new leases... that were effective during the applicable period as compared to the prior lease," renewal growth the same for renewals, and blended "the combined weighted average" of the two.

```text
new lease trade-out      = (effective rent of new lease ÷ effective rent of prior lease on the unit) − 1
renewal trade-out        = (effective rent of renewal ÷ effective rent of the expiring lease) − 1
blended trade-out        = count-weighted (or rent-weighted, stated) average of the two
```

Every choice matters: **effective or gross** (net of concessions, or not); **lease start or signing** (which period a lease belongs to; MAA uses leases "effective during the applicable period"); **like-term or any term** (a 15-month lease replacing a 12-month one at a lower monthly rent can be a better deal); **the prior lease** (for a unit vacant for months, the prior rent is stale, and some definitions exclude long vacancies); and **weighting**. The inputs are records the pricing chapter already keeps: the quote, the renewal offer with its current and offered rent, and the signed lease ([Renewal Pricing](/books/property-tech/revenue-management#renewal-pricing)). A renewal held down by a rent cap counts at the capped rent, and the cap is visible in the drill-down.

## Renewals and Turnover

- **Renewal rate.** Expiring leases in a period that renewed (a signed renewal lease for the same household, any unit transfer counted separately) ÷ leases expiring in the period. Exclude leases that ended for reasons the household didn't choose (eviction, casualty, a notice the operator served) or report them separately, and say which ([Renewals and Retention](/books/property-tech/resident-experience#renewals-and-retention)).
- **Turnover.** Move-outs ÷ a base, and the base differs by source. MAA uses "resident move outs excluding transfers within the Same Store Portfolio as a percentage of expiring leases on a trailing twelve month basis"; AvalonBay, "the annualized number of units turned over during the period, divided by the total number of apartment homes"; NAA's quick guide, "Total Number of Move-Outs ÷ Total Number of Units." The first measures retention of expiring leases; the others, churn of the building.
- **Notice reasons.** Move-out reasons coded at notice (purchase, relocation, price, service, eviction), reported with renewal rate, because price-driven move-outs and service-driven ones need different fixes.

## Delinquency and Bad Debt

Delinquency is measured on the resident portion of balances, never on subsidy owed by an agency, and in charge categories, because only rent supports an eviction in many states ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)):

- **Delinquency %.** Resident-owed balances past due on a date, for current residents, ÷ the period's billed charges (or ÷ GPR, stated). Split by aging bucket (1 to 30, 31 to 60, 61 to 90, over 90 days) and by category (rent, fees, utilities).
- **Collections rate.** Payments applied to a period's charges by a day after the due date (the fifth, the end of month) ÷ the period's charges. The ledger's application order decides which charges a payment paid ([Payment Application Order](/books/property-tech/charges-and-resident-ledgers#payment-application-order)).
- **Bad debt.** Write-offs of former residents' balances in the period, less recoveries on previously written-off balances, ÷ GPR or ÷ billed revenue. Fannie Mae's line definition is "the aggregate amount of unpaid rental income due from non-paying tenants determined to be uncollectable." Bad debt depends on the write-off policy (when a balance is written off), so the policy version is part of the definition ([Collections After Move-Out](/books/property-tech/delinquency-and-eviction#collections-after-move-out)).
- **Holds and plans.** Balances under a payment plan, awaiting rental assistance, in bankruptcy or under an SCRA hold are reported as their own buckets, because they aren't actionable the same way ([Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction)).

## Turns and Maintenance

From `unit_turns` and `work_orders` ([Make-Ready Turns](/books/property-tech/maintenance-and-work-orders#make-ready-turns)):

- **Turn time.** Ready date − vacated date, in calendar days, for standard turns; renovation turns reported separately.
- **Days vacant.** Next move-in − vacated date: turn time plus days waiting for a resident. The two together say whether vacancy is a maintenance or a leasing problem.
- **Cost per turn.** Labor, materials, vendor invoices and capitalized replacements linked to the turn, with capital items shown separately ([Capital or Repair](/books/property-tech/budgets-and-capital-projects#capital-or-repair)).
- **Work order response and completion.** For each priority, the share of work orders first responded to by `respond_by` and completed by `complete_by`, the deadlines stored on the work order from the rule or policy that set them ([Habitability and Repair Deadlines](/books/property-tech/maintenance-and-work-orders#habitability-and-repair-deadlines)); and the median and 90th percentile times. Report exclusions (waiting on parts, resident declined entry, vendor scheduled at resident request) as reasons with time, never by deleting the work order from the denominator.
- **Repeat work orders.** Work orders for the same unit and category within 30 days of a completed one, ÷ completed work orders: the first-time fix rate's inverse ([Service Delivery](/books/field-operations/operating-metrics#service-delivery)).

Service standards are often contractual. In privatized military housing, installations publish response times under the tenant bill of rights: West Point's briefing lists an initial response within 30 minutes in business hours or one hour after hours for emergencies, within four hours for urgent habitability issues, and routine work completed within two business days "depending on parts," while Carlisle Barracks lists two hours, 24 hours and five business days. Different installations, different numbers: the SLA is data per property and priority, and the metric measures against whichever applies ([Oversight and the Tenant Bill of Rights](/books/property-tech/military-and-specialty-housing#oversight-and-the-tenant-bill-of-rights)).

## The Leasing Funnel

From guest cards, tours, applications and leases ([Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours)):

- **Leads.** Deduplicated guest cards created in the period, by first-touch source.
- **Tour rate, application rate, approval rate.** Tours completed ÷ leads; applications ÷ tours (or ÷ leads, stated); approved ÷ decided applications.
- **Lead-to-lease conversion.** Guest cards created in a cohort period that reached `leased` ÷ guest cards in the cohort, measured after a fixed window (60 or 90 days). A cohort definition is required: leases signed this month ÷ leads this month mixes cohorts.
- **Cost per lease.** Marketing spend for a source in a period ÷ leases attributed to that source under the named attribution model, with per-lease ILS fees reconciled to the operator's own attribution ([Lead Sources and Attribution](/books/property-tech/leads-crm-and-tours#lead-sources-and-attribution)).
- **Speed to lead.** Time from a lead's first contact to the first response by a person or agent, median and 90th percentile, by channel and language: a sales metric and a fair housing parity check ([Fair Housing in Every Response](/books/property-tech/leads-crm-and-tours#fair-housing-in-every-response)).

## NOI and Expense Ratios

- **Net operating income.** Total property revenue − property operating expenses, before debt service, capital spending, depreciation and corporate costs. AvalonBay's definition is "total property revenue less direct property operating expenses (including property taxes) and excluding corporate-level income"; MAA's same-store NOI excludes depreciation and amortization and, in its case, storm-related expenses. NOI is a non-GAAP measure, and its exclusions are part of its definition, so the owner's chart-of-accounts mapping decides which lines are in it ([The Chart of Accounts](/books/property-tech/trust-accounting#the-chart-of-accounts)).
- **Same-store NOI growth.** NOI change for properties in the same-store set for both periods; the set's rule (owned and stabilized since a date) is versioned.
- **Operating expense ratio.** NAA's quick guide: "OE ÷ EGI = OER. The percentage of revenue used to pay operating expenses." NAA's own expense survey instead presents expenses "as a percent of GPR" and per unit and per square foot. State the denominator.
- **Expenses per unit,** by category (payroll, repairs and maintenance, turnover, utilities, insurance, taxes, management fee, marketing), with the management fee and reimbursed payroll identified because owners compare managers on them ([Management Fees](/books/property-tech/owners-and-management-agreements#management-fees)).
- **Controllable expenses.** Expenses excluding taxes, insurance and utilities: what a manager can affect, and the usual base for manager incentives.

## Utilities and Ancillary Revenue

- **Utility recovery.** Utility costs billed back to residents ÷ recoverable utility expense, by property and service, with vacant-unit and common-area shares shown as the owner's absorbed cost. From `utility_billing_runs`: `billed_to_residents ÷ billable_amount` for the run's service period, and the property's total utility expense as a second denominator ([Resident Utility Billing](/books/property-tech/utilities-and-energy#resident-utility-billing)). No industry body publishes a standard recovery definition; NAA's expense survey segments utilities by recovery system (submeter, RUBS, flat fee), which is the right grouping for comparisons.
- **Ancillary revenue per occupied unit.** Other income (fees, parking, storage, pet rent, services, revenue shares) ÷ occupied unit-months, split into mandatory charges that are part of the advertised price and optional services, because fee transparency law treats them differently ([Fee Transparency and All-In Pricing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing), [Disclosure and Revenue Share](/books/property-tech/resident-financial-products#disclosure-and-revenue-share)).

## Owner-Reporting Metrics

Owners and asset managers read these numbers against the budget and against other managers ([Owner Reporting](/books/property-tech/owners-and-management-agreements#owner-reporting), [Asset Management](/books/property-tech/investors-and-asset-management#asset-management)):

- **Budget variance.** Actual − budget (and − reforecast) by line and period, with explanations required above a threshold ([Reforecasts and Variance](/books/property-tech/budgets-and-capital-projects#reforecasts-and-variance)).
- **Distributions and cash.** Distributions paid, reserves held against requirements, and the trust reconciliation status for the period ([Three-Way Reconciliation](/books/property-tech/trust-accounting#three-way-reconciliation)).
- **Occupancy cost ratio (retail).** Tenant occupancy costs ÷ tenant sales. Macerich compares minimum rent, percentage rent and recoverable expenses with tenant sales "to present tenant occupancy costs as a percentage of tenant sales"; a rising ratio flags tenants at risk ([Percentage Rent](/books/property-tech/commercial-property#percentage-rent)).
- **Manager scorecards.** The same definitions computed from every manager's submission, after mapping charts and checking submissions, never from each manager's own labels ([Data from Third-Party Managers](/books/property-tech/investors-and-asset-management#data-from-third-party-managers)).

## Benchmarking as an Information-Exchange Risk

A benchmark compares a property with others. When the others are the operator's own properties or public data, it's management. When the others are competitors and the data is their nonpublic rents, occupancy and lease terms, it's an information exchange, and that is what the pricing cases were about.

**The record, as of October 2026.** The Justice Department's complaint against RealPage describes its benchmarking product as allowing landlords "to compare the performance of their properties and floor plans... to their competitors," and alleges that landlords using its property management, Business Intelligence and benchmarking products agree "to share its proprietary data with RealPage" for use in pricing recommendations. The Final Judgment with RealPage governs revenue management products, defined as software "that generates rental prices or rental pricing recommendations"; in its September 30, 2026 opinion the court noted that the judgment doesn't reach the property management system or benchmarking products alleged to carry the exchange, and let the states' claims proceed ([United States v. RealPage](/books/property-tech/revenue-management#united-states-v-realpage)). The Greystar Final Judgment bars it, "as part of setting rental prices," from exchanging nonpublic data through surveys, spreadsheets, industry meetings or any "information-exchange service."

**The safe harbors are gone.** For decades, information exchanges were judged against old safety zones from agency policy statements, as a 2001 Justice Department business review letter applied them: data "more than three months old," at least five participants on any statistic, and no participant's data at 25 percent or more. The Justice Department withdrew the health care statements containing those zones in February 2023, and on December 11, 2024 the FTC and the Justice Department withdrew the Antitrust Guidelines for Collaborations Among Competitors, saying they "no longer provide reliable guidance." In February 2026 the agencies asked for public comment on new guidance for business collaborations, naming "algorithmic pricing, information and data sharing"; comments closed May 21, 2026, and no new guidance had issued as of October 2026. There is no safe harbor to design to.

My rules for any benchmark the platform produces or ingests:

- **Know the source of every number.** Each benchmark dataset carries its provenance: the operator's own portfolio, public listing data, licensed survey data, or contributed nonpublic data from other operators; how old it is; how aggregated; and the license ([Market Data and Benchmarks](/books/property-tech/investors-and-asset-management#market-data-and-benchmarks)).
- **Keep competitors' nonpublic data out of operations.** A benchmark built from other operators' nonpublic data never feeds pricing, renewal offers or the people who set them, and isn't shown at a property or floor-plan grain that identifies competitors. The pricing chapter's guard on data sources applies to the reports beside it ([Inputs: Own, Public and Pooled Data](/books/property-tech/revenue-management#inputs-own-public-and-pooled-data)).
- **Prefer own and public data for comparisons.** The operator's own portfolio, public listings and public filings answer most management questions without any exchange.
- **Treat a data share as a possible exchange.** A warehouse share or an AI analytics agent that combines several operators' data, or that a vendor uses across customers, is reviewed like a benchmark product ([Data Out](/books/property-tech/platform-architecture#data-out)).
- **Record who saw which benchmark.** Benchmark views by user, role and property are logged, because the question in litigation is who had the information when they set prices.

## How to Build It

This chapter adds metric definitions, frozen metric values, benchmark datasets with provenance and one column for work order response to the model. Inputs come from the tables the earlier chapters own: `leases`, `unit_status_periods`, `beds` and `bed_assignments`, `renewal_offers`, `rent_quotes`, `guest_cards`, `unit_turns`, `work_orders`, `delinquency_cases`, `charges` and `payment_applications`, `utility_billing_runs`, ledger accounts by entity, and `census_snapshots`.

```sql
CREATE TABLE metric_definitions (        -- platform templates and tenant variants
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID REFERENCES tenants (id),      -- null: the platform's definition
  key            TEXT NOT NULL,          -- 'physical_occupancy', 'renewal_trade_out'
  version        INT NOT NULL,
  basis          TEXT NOT NULL CHECK (basis IN ('unit', 'bed', 'square_foot', 'resident',
                   'night', 'dollar', 'count', 'duration')),
  denominator    TEXT NOT NULL,          -- 'rentable_units', 'total_units', 'gpr', 'billed'
  timing         TEXT NOT NULL CHECK (timing IN ('point_in_time', 'daily_average',
                   'period_total', 'cohort')),
  population     TEXT NOT NULL,          -- 'all', 'same_store@v2', 'stabilized'
  formula_ref    TEXT NOT NULL,          -- the SQL or transformation, in version control
  description    TEXT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  approved_by    UUID REFERENCES users (id),
  UNIQUE NULLS NOT DISTINCT (tenant_id, key, version)
);

CREATE TABLE metric_values (             -- computed and frozen as reported
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  definition_id    UUID NOT NULL REFERENCES metric_definitions (id),
  property_id      UUID REFERENCES properties (id),  -- null for portfolio or entity rollups
  scope_type       TEXT NOT NULL CHECK (scope_type IN ('property', 'portfolio',
                     'legal_entity', 'tenant')),
  scope_id         UUID NOT NULL,
  period           DATERANGE NOT NULL,     -- a single day for point-in-time metrics
  numerator        NUMERIC NOT NULL,
  denominator      NUMERIC,
  value            NUMERIC NOT NULL,
  computed_at      TIMESTAMPTZ NOT NULL,
  frozen_at        TIMESTAMPTZ,            -- reported to an owner or lender
  supersedes_id    UUID REFERENCES metric_values (id),  -- restatements are new rows
  UNIQUE (definition_id, scope_type, scope_id, period, computed_at)
);

CREATE TABLE benchmark_datasets (        -- every external or pooled comparison
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  source           TEXT NOT NULL,          -- 'own_portfolio', 'public_listings', vendor name
  data_kind        TEXT NOT NULL CHECK (data_kind IN ('own', 'public', 'licensed_survey',
                     'contributed_nonpublic')),
  data_as_of       DATE NOT NULL,          -- the newest observation in it
  min_contributors INT,                    -- for pooled data
  grain            TEXT NOT NULL,          -- 'submarket', 'property_class', 'property'
  license_ref      TEXT,
  allowed_uses     TEXT[] NOT NULL,        -- 'asset_management', never 'pricing' for pooled
  external_dataset_id UUID REFERENCES external_datasets (id),
  CHECK (data_kind <> 'contributed_nonpublic' OR NOT ('pricing' = ANY (allowed_uses)))
);

ALTER TABLE work_orders
  ADD COLUMN first_responded_at TIMESTAMPTZ;  -- first contact by staff, vendor or agent
```

Occupancy on a date, by unit, on the rentable-units denominator; the same query over a series of dates gives the daily average:

```sql
SELECT u.property_id,
       COUNT(*) AS rentable_units,
       COUNT(l.id) AS occupied_units,
       ROUND(COUNT(l.id)::numeric / NULLIF(COUNT(*), 0), 4) AS physical_occupancy
FROM units u
JOIN unit_status_periods s
  ON s.unit_id = u.id AND s.superseded_at IS NULL
 AND s.valid_during @> $2::date AND s.status = 'rentable'
LEFT JOIN leases l
  ON l.unit_id = u.id
 AND l.moved_in_on <= $2::date
 AND (l.moved_out_on IS NULL OR l.moved_out_on > $2::date)
WHERE u.tenant_id = $1
GROUP BY u.property_id;
```

Renewal trade-out for a period, from the offers the pricing chapter already stores (effective rents, concessions netted by the lease's concession records, are a refinement on the same join):

```sql
SELECT l.property_id,
       COUNT(*) AS renewals,
       AVG(o.offered_rent::numeric / NULLIF(o.current_rent, 0) - 1) AS renewal_trade_out
FROM renewal_offers o
JOIN leases r ON r.renewal_of_lease_id = o.lease_id AND r.status <> 'cancelled'
JOIN leases l ON l.id = o.lease_id
WHERE o.tenant_id = $1
  AND o.status = 'accepted'
  AND r.starts_on <@ $2::daterange
GROUP BY l.property_id;
```

Design decisions behind it:

- **Definitions are rows with versions,** and a tenant may adopt a variant (an owner's lender wants total units) as its own version, never by editing the platform's.
- **Values are frozen when reported.** An owner statement or lender report points at `metric_values` rows, and a late correction to a lease or a unit status creates a restatement row that supersedes the old one, keeping both ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).
- **Every input carries the property's business date,** assigned once, so a move-out at 11 PM local time lands on the right day in every metric ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).
- **Benchmarks carry provenance and allowed uses,** and pooled nonpublic data can't be marked for pricing.
- **Response time is a fact, not a status.** `first_responded_at` is set by the first contact event, so response SLAs are measured from records rather than from when someone moved a status.

## Auditing

- **Which definition, which version, which numbers.** Every reported value with its definition version, inputs' as-of time and restatements, so a lender's covenant test or an owner's dispute can be recomputed.
- **Inputs that move metrics.** Unit status periods (who took a unit down and why), lease date corrections, write-off policy changes and same-store set changes, each with who and when; long-running down units are a known way to flatter occupancy ([Portfolios, Properties & Units](/books/property-tech/portfolios-properties-and-units#auditing)).
- **Benchmark provenance and access.** Each benchmark dataset's source, age, aggregation and license, and who viewed which benchmark at which grain.
- **Incentives tied to metrics.** Where site or manager compensation depends on occupancy, renewal rate or delinquency, the definition version used for each payout.

## What This Means for the System You Build

- **Define each metric once,** with its basis, denominator, timing and population, versioned, and name the definition on every report and share.
- **Derive occupancy, leased and exposure from leases and status periods,** by unit, bed, square foot, resident or night as the segment requires.
- **Separate physical from economic occupancy** and keep vacancy, concessions and bad debt as their own lines below GPR.
- **Compute trade-out on effective rents,** new and renewal separately, with the lease-dating rule stated.
- **State the turnover base** and code move-out reasons at notice.
- **Measure delinquency on the resident portion,** by bucket and category, with plans, assistance and holds separated.
- **Measure work orders against stored deadlines,** with exclusions as reasons, not deletions.
- **Freeze values when reported** and restate as new versions.
- **Keep competitors' nonpublic data out of operations,** record every benchmark's provenance, and assume no safe harbor.

## References

**Lenders and industry bodies**

- [Fannie Mae Multifamily Selling and Servicing Guide, Part II (PDF)](https://mfguide.fanniemae.com/fnmf-pdf/download/6161), 85% physical and 70% economic occupancy minimums and how physical occupancy is counted (effective October 26, 2026)
- [Fannie Mae Multifamily Selling and Servicing Guide, Part III (PDF)](https://mfguide.fanniemae.com/fnmf-pdf/download/4296), economic vacancy as physical vacancy, concessions and bad debt; gross potential rent
- [Fannie Mae: Form 4254.DEF line item definitions (PDF)](https://mfguide-acpt.fanniemae.com/system/files/11-17-22-03-48-51-PM/Form%204254.DEF%20%28Redline%29.pdf), gross potential rent, gain and loss to lease, bad debt and concessions
- [HUD: MAP Guide 4430.G (PDF)](https://www.hud.gov/sites/dfiles/OCHCO/documents/4430GHSGG.pdf), 85% average physical occupancy and the 93% economic occupancy cap for market-rate properties (March 19, 2021)
- [NAA: CAM Financial Terms and Formulas Quick Guide (PDF)](https://www.naahq.org/sites/default/files/naa-documents/education/Candidates/cam_financial_terms_and_formula_quick_guide_june_2017.pdf), leased percentage, GPR, operating expense ratio and turnover ratio (June 2017)
- [NAA: 2021 Survey of Operating Income & Expenses, executive summary (PDF)](https://naahq.org/sites/default/files/2021_ies_executive_summary_final.pdf), expenses per unit, per square foot and as a percent of GPR; segmentation by utility recovery system

**Filings**

- [MAA: Second quarter 2026 earnings release and supplemental (PDF)](https://s1.q4cdn.com/498755859/files/doc_financials/2026/q2/MAA-EarningsRelease-Supplemental-2Q26-FINAL.pdf), average physical occupancy, effective new, renewal and blended lease rate growth, resident turnover, average effective rent, same-store NOI and stabilization
- [AvalonBay: Second quarter 2026 release, Exhibit 99.1](https://www.sec.gov/Archives/edgar/data/0000915912/000091591226000018/q22026ex-991.htm), economic occupancy, NOI and same store definitions (July 22, 2026)
- [AvalonBay: Second quarter 2026 supplemental, Exhibit 99.2](https://www.sec.gov/Archives/edgar/data/0000915912/000091591226000018/q22026ex-992.htm), annualized turnover over total apartment homes
- [American Campus Communities: Form 10-K for 2021](https://www.sec.gov/Archives/edgar/data/1283630/000128363022000031/acc-20211231.htm), average occupancy by occupied beds over total beds
- [Public Storage: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1393311/000162828026007696/psa-20251231.htm), realized annual rent per occupied square foot and REVPAF
- [BXP: Third quarter 2025 supplemental](https://www.sec.gov/Archives/edgar/data/1037540/000103754025000010/q32025supplemental.htm), occupancy versus leased percentage
- [Macerich: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/912242/000091224226000016/mac-20251231.htm), occupancy cost as a percentage of tenant sales
- [Welltower: Third quarter 2023 supplement (PDF)](https://welltower.com/wp-content/uploads/2023/10/3Q23-Supplement.pdf), seniors housing occupancy and stabilization

**Antitrust**

- [Justice Department: Complaint, United States v. RealPage (PDF)](https://www.justice.gov/atr/media/1365471/dl), the benchmarking and business intelligence products and data sharing (August 23, 2024)
- [Justice Department: Proposed Final Judgment, United States v. RealPage (PDF)](https://www.justice.gov/atr/media/1419451/dl), the definition of revenue management products and the nonpublic data terms
- [Justice Department: Final Judgment as to Greystar (PDF)](https://www.justice.gov/atr/media/1430091/dl), no exchange of nonpublic data as part of setting rents, including through surveys and information-exchange services (entered March 2, 2026)
- [Justice Department: Business review letter (2001) (PDF)](https://www.justice.gov/atr/public/busreview/215818.pdf), the three-month, five-participant and 25 percent safety zone conditions
- [Justice Department: Justice Department withdraws outdated enforcement policy statements](https://www.justice.gov/archives/opa/pr/justice-department-withdraws-outdated-enforcement-policy-statements), the February 3, 2023 withdrawal of the health care statements
- [FTC: FTC and DOJ withdraw guidelines for collaboration among competitors](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-doj-withdraw-guidelines-collaboration-among-competitors), withdrawal and the statement that they no longer provide reliable guidance (December 11, 2024)
- [FTC: FTC and DOJ seek public comment on guidance for business collaborations](https://www.ftc.gov/news-events/news/press-releases/2026/02/federal-trade-commission-department-justice-seek-public-comment-guidance-business-collaborations), the inquiry naming algorithmic pricing and data sharing (February 23, 2026)
- [FTC: FTC and DOJ extend deadline for public comment](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-doj-extend-deadline-public-comment-guidance-business-collaborations), comments to May 21, 2026

**In practice**

- [RealPage: RealPage introduces Lumina AI Suite](https://www.realpage.com/news/realpage-introduces-lumina-ai-suite/), "every metric carries one governed definition" (August 10, 2026)
- [Entrata: Business Intelligence](https://www.entrata.com/products/business-intelligence), dashboards with drill-down and data access through Snowflake
- [U.S. Army Garrison West Point: Tenant Bill of Rights plain language briefing (PDF)](https://home.army.mil/westpoint/application/files/2615/9602/5127/National_Defense_Authorization_Act_-_Tenant_Bill_of_Rights_wRosel.pdf), emergency, urgent and routine work order response times
- [Carlisle Barracks: Plain language briefing (PDF)](https://home.army.mil/carlisle/application/files/1615/9622/4117/PLB_for_CBPA_23_Jul_2020.pdf), a different installation's response times (July 23, 2020)
