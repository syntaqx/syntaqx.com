+++
title = "Regulatory & Statistical Reporting"
nav_title = "Regulatory Reporting"
description = "Statistical plans and agents, data calls and the MCAS, annual statement production, premium tax and retaliatory tax worked, and how reporting shapes the ledger."
category = "Insurance Industry"
order = 2774
part = "Running the Platform"
tags = ["insurance", "regulatory-reporting", "statistical-plans", "premium-tax", "mcas", "data"]
+++

An insurer reports the same business many times, to many recipients, in many shapes. The statutory statement reports it to the domiciliary regulator and the NAIC by statement line. The State Page reports it per state. Statistical plans report it, transaction by transaction, to a statistical agent who pools it with every other insurer's to build loss costs and rate reviews. The Market Conduct Annual Statement reports counts of policies, cancellations, claims and complaints to market regulators. Premium tax returns report it to state revenue departments. Workers' comp EDI reports claims to state agencies. Federal and state data calls ask for it again in whatever shape a new question needs. None of these reports can be produced from the general ledger alone, and none of them should be produced by a separate extract that drifts from the books.

This chapter covers each stream: statistical plans and agents, data calls and the MCAS, annual statement production, premium tax and retaliatory tax with Florida and Texas worked, and how the reporting obligations shape the ledger. The statement itself is owned by [Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting); surplus lines tax by [The Tax](/books/insurance/excess-and-surplus-lines#the-tax); workers' comp claims EDI by [EDI: Reporting to the State](/books/insurance/workers-comp-claims#edi-reporting-to-the-state) and its codes by [IAIABC Claims EDI](/books/insurance/acord-and-data-standards#iaiabc-claims-edi); what market conduct examiners ask for by [What Examiners Ask a System to Produce](/books/insurance/market-conduct#what-examiners-ask-a-system-to-produce).

## How the Platforms Do It

As of November 2026, the recipients and what each receives:

| Recipient | Report | Shape and timing |
| --- | --- | --- |
| **Domiciliary regulator and the NAIC** | Annual and quarterly statutory statements, RBC | By statement line and state; annual on or before March 1, quarterly within 45 days ([The Filing Calendar](/books/insurance/statutory-accounting#the-filing-calendar)) |
| **NAIC and participating states** | Market Conduct Annual Statement | Counts by line under each line's data call definitions; for data year 2025, due April 30, 2026 for most lines and May 31, 2026 for health, other health and short-term limited duration |
| **Statistical agents** (Verisk ISO, NISS and others) | Statistical plan records | Detailed premium and loss records; Verisk received about 3.6 billion in 2025 |
| **Rating bureaus** (NCCI and independent bureaus) | Workers' comp unit statistical data | Per policy, by class ([Workers' Compensation](/books/insurance/workers-compensation)) |
| **State revenue departments** | Premium tax returns and prepayments, retaliatory tax | Texas: annual return March 1, semiannual prepayments March 1 and August 1; Florida: annual payment on or before March 1 |
| **State workers' comp agencies** | Claims EDI | Per claim event, with acknowledgment |
| **Treasury's Federal Insurance Office** | Terrorism Risk Insurance Program data call | Annual; the 2026 call added a cyber-hybrid terrorism modeled-loss scenario |
| **Surplus lines stamping offices** | Placement filings and tax | Per policy item ([Stamping Offices and Filing](/books/insurance/excess-and-surplus-lines#stamping-offices-and-filing)) |

Every row is built from the same records: premium entries by transaction, coverage, state and statement line; claims, exposures, reserves and payments; policy transactions with their kinds and reasons; complaints. What differs is the grain, the code list, the date basis and the definition.

## Statistical Plans and Agents

States require P&C insurers to report premium and loss data under a statistical plan to a statistical agent the state designates, and advisory organizations and regulators build loss costs, rate reviews and market reports from the pooled data. Verisk's 10-K describes the scale: it is a statistical agent in all 50 states, Puerto Rico and DC; in 2025 "P&C insurers sent us approximately 3.6 billion detailed individual records of insurance transactions"; its database holds over 38.9 billion statistical records; and the same business provides "policy language, prospective loss costs, policy writing and rating rules" and processes about 2,000 regulatory filings a year ([Advisory Loss Costs and the Multiplier](/books/insurance/rate-and-form-filing#advisory-loss-costs-and-the-multiplier)). NISS publishes five plans (Auto Volume I, Auto Volume II, Commercial Lines, Homeowners and Other Than Auto) and reports issuing 8,884 annual compliance reports.

A statistical record differs from an accounting entry in four ways:

| | Accounting entry | Statistical record |
| --- | --- | --- |
| **Grain** | Account, entity, statement line, state, period | Policy transaction or claim transaction, by coverage, with the rating characteristics |
| **Codes** | Chart of accounts, statement lines | The plan's codes: line, subline, coverage, class, territory or ZIP, limits and deductible, construction and protection class for property, cause of loss |
| **Dates** | Accounting date | Policy effective date and accounting date for premium; accident date for losses, so data can be organized by policy year and accident year |
| **Purpose** | The books | Ratemaking: matching losses to the exposures and characteristics that produced them |

<!-- source-gap: stat-plan-layouts | missing | a statistical plan's record layout, required fields, reporting deadlines and data quality tolerances (ISO, NISS or AAIS plan manual) | closes with: a plan manual or a state's statistical plan regulation opened (Verisk, AAIS, WCIRB and TDI statistical plan pages returned errors) | checked: 2026-11-10 --> The plan manuals with exact record layouts, deadlines and error tolerances are distributed to reporting companies, and I couldn't open one, so the table describes the contents a plan asks for, not a specific layout.

What a statistical plan asks of the system:

- **Statistical codes live on the product.** Every coverage definition carries its plan code (the core's `coverage_definitions.statistical_code`, Products, Coverages & Forms), and every rating characteristic the plan reports is a stored rating input on the quote, not a value reconstructed later.
- **Premium transactions are reported as they happened.** A midterm endorsement reports its premium change with its own effective date; a cancellation reports the return premium; an out-of-sequence replay reports the reversals and reapplications, so the agent's policy-year premium matches the insurer's ([Out-of-Sequence Endorsements](/books/insurance/endorsements-and-renewals#out-of-sequence-endorsements)).
- **Losses are reported by accident date and coverage** from the exposure, with paid and outstanding amounts, and changes reported as they occur.
- **Edits run before submission.** Agents return records that fail validity and consistency edits, and the insurer corrects and resubmits within the plan's window; the system tracks each submission and its errors like any acknowledged exchange ([Data Models in Practice](/books/insurance/acord-and-data-standards#data-models-in-practice)).
- **Bordereau business is reported too.** Policies written by MGAs on the insurer's paper are the insurer's statistical data, reported from the bordereau ([The Bordereau](/books/insurance/mgas-programs-and-fronting#the-bordereau)).

States also designate data collection agents for other reporting: Texas's Division of Workers' Compensation receives its claims EDI through "its data collection agent, Verisk, Insurance Services Office, Inc.," and reporting to the agent "is the same as reporting to DWC" (28 TAC 124.102). The pattern (a regulator's data delivered to a contractor with the regulator's authority) is common enough that the recipient of a report is a configured party, not a hard-coded endpoint.

## Data Calls and the MCAS

A data call is a regulator's request for data the routine reports don't contain. Some are annual and standardized; others are one-time.

**The Market Conduct Annual Statement.** The MCAS is "a uniform system of collecting market-related information to help states monitor the market conduct of companies," collecting claims and underwriting data on 13 lines (private passenger auto, homeowners, life, annuity, long-term care, health, lender-placed, disability income, private flood, other health, pet, short-term limited duration health and travel), with 51 participating jurisdictions as of the 2024 data year ([The Market Conduct Annual Statement](/books/insurance/market-conduct#the-market-conduct-annual-statement)). For data year 2025, submissions were due April 30, 2026 for all lines except health, other health and short-term limited duration (May 31, 2026), with scorecards posted July 1 and August 1, 2026.

Each line has its own data call and definitions document. The homeowners call for 2025 (version 2025.0.3, reporting period January 1 to December 31, 2025, "Filing Deadline: April 30, 2026") asks for interrogatories (MGAs and TPAs used, digital claim settlement vendors, any block sold or moved), claims closed with and without payment by days-to-close band (0 to 30 days through more than 365), policies in force by form, direct premium written, company-initiated nonrenewals, cancellations by reason and timing (nonpayment, insured request, and company-initiated at under 60 days, 60 to 90 days and over 90 days in force), complaints and lawsuits. The definitions decide the counts: "if a policy cancels for non-pay three times," each cancellation is counted.

**Federal data calls.** Treasury's Federal Insurance Office runs an annual data call for the Terrorism Risk Insurance Program, and its 2026 call added a cyber-hybrid terrorism modeled-loss scenario; the program's 2026 insurance marketplace aggregate retention amount was set at $58,673,180,666 (FIO annual report, September 2026).

**Ad hoc calls.** After a catastrophe, during a market crisis or for a study, a regulator may ask for counts or records in a template of its own. These arrive with a deadline and a spreadsheet, and the insurer's ability to answer in days rather than months depends on whether the definitions can be expressed as queries over the core tables.

### Worked Numbers: One Policy, Three Cancellation Counts

My policy. A homeowners policy effective February 1, 2025 is cancelled for nonpayment on April 10 (68 days in force), reinstated, cancelled for nonpayment again on August 20, reinstated, and cancelled at the insured's request on November 30.

| Count | Definition (homeowners MCAS 2025) | This policy contributes |
| --- | --- | --- |
| Cancellations for nonpayment | Each cancellation counted, including repeats | 2 |
| Cancellations at the insured's request | | 1 |
| Company-initiated cancellations by days in force | Under 60, 60 to 90, over 90 days | 0 in each band (nonpayment and insured request are their own categories in this call) |
| Policies in force at year end | | 0 |

The policy's `policy_transactions` already hold every fact the call needs: kind (cancellation, reinstatement), reason (nonpayment, insured request), effective date and the term's start, so the counts are a versioned query. A reporting extract that kept only each policy's final status would report one cancellation, not three.

## Annual Statement Production

The statutory statement is the largest report, and producing it is a pipeline over the subledgers, not a spreadsheet exercise ([The Annual Statement](/books/insurance/statutory-accounting#the-annual-statement)):

1. **Close the period** in every subledger: premium, receivables, commissions, taxes, losses, reinsurance ([The Insurance Ledger](/books/insurance/insurance-system-architecture#the-insurance-ledger)).
2. **Map to statement lines** with the mappings in force for the reporting year ([How to Build It](/books/insurance/statutory-accounting#how-to-build-it) defines `statement_line_mappings`).
3. **Build the exhibits and schedules** from the entries: the underwriting and investment exhibit, Schedule P by accident year, Schedule F by reinsurer, and the State Page by state and line.
4. **Reconcile** each exhibit to the general ledger, and the State Page totals to the countrywide exhibit.
5. **Tie out the other reports to the same run:** premium tax returns from the State Page's direct premium, MCAS direct premium written by state, and statistical plan premium by state and line, each within its expected differences (statistical data is on a policy-year and accident-year basis; the statement on a calendar-year basis).

The fifth step is where reporting systems fail quietly: three reports of Florida homeowners direct written premium, each from its own extract, that differ by amounts nobody can explain.

## Premium Tax

States tax insurance premiums instead of (or in addition to) income, at rates set by statute per line and insurer type, with credits, prepayments and a retaliatory tax layered on top.

**Texas.** "All insurers and health maintenance organizations licensed by the Texas Department of Insurance must pay this tax": 1.6% for property and casualty insurers, 1.75% for life, accident and health insurers and HMOs, 1.35% for title, and 1.7% for reciprocal exchanges, with "a half tax rate of .875 percent" on the first $450,000 of life insurance or HMO premium. The annual return is due "March 1 following the end of the calendar year," with semiannual prepayments due "March 1 and August 1 of each year," and the payment method depends on the prior year's tax. The Comptroller administers alongside it maintenance taxes, TDI and DWC surcharges, the Motor Vehicle Crime Prevention Authority fee, the OPIC assessment, the Volunteer Fire Department Assistance Fund assessment and the retaliatory tax.

**Florida.** 1.75% of gross receipts on most premiums for risks in Florida and 1% on annuity considerations, due "on or before March 1 in each year" for the preceding calendar year (Fla. Stat. 624.509(1)). The tax is computed after deducting the firefighters' and police officers' pension taxes (ss. 175.101 and 185.08) and workers' comp assessments under s. 440.51. Two credits reduce it: corporate income tax paid under chapter 220, and 15% of salaries paid to Florida employees covered by the state's reemployment assistance law; together they "may not exceed 65 percent of the tax due" (624.509(4) to (6)). The 2026 amendments to the section apply to taxable years beginning on or after January 1, 2027.

**Retaliatory tax.** A foreign insurer pays the higher of the state's own burden and what its home state would charge a company from this state. Texas computes it "by comparing the aggregate taxes, surcharges, fees and assessments" of the home state with Texas's "based on the same amount of premium writings," due "March 1 for the previous calendar year."

### Worked Numbers: Florida Premium Tax and Texas Retaliation

My numbers, simplified to the statutory structure. A P&C insurer writes $100,000,000 of direct premium on Florida risks in 2026. Its Florida deductions (the pension taxes and workers' comp assessments) are $150,000, its Florida salaries $6,000,000, and its chapter 220 income tax $300,000.

| Florida step | Calculation | Amount |
| --- | --- | --- |
| Tax at 1.75% | $100,000,000 × 1.75% | $1,750,000 |
| After deductions for ss. 175.101, 185.08 and 440.51 | $1,750,000 − $150,000 | $1,600,000 |
| Salary credit | $6,000,000 × 15% | $900,000 |
| Income tax credit | | $300,000 |
| Credits claimed | $1,200,000, capped at 65% × $1,600,000 | $1,040,000 |
| **Premium tax due** | $1,600,000 − $1,040,000 | **$560,000** |

Now a Florida-domiciled P&C insurer writes $10,000,000 of direct premium in Texas. Texas tax at 1.6% is $160,000. Florida's burden on the same $10,000,000 at its 1.75% rate, ignoring Florida's credits and Texas's other charges to keep the example to one line, is $175,000. Because the home state's burden is higher, the insurer owes Texas a retaliatory tax of **$15,000** on top of the $160,000, for $175,000 in all. A Texas-domiciled insurer writing in Florida would see the comparison run the other way, and owe no retaliatory tax there on this line, because Texas's 1.6% is the lower rate. The real comparison aggregates every tax, fee and assessment on both sides, which is why the retaliatory computation needs each state's full charge schedule, not just its headline rate.

What premium tax asks of the system: direct premium by state and line on the statutory basis (the State Page), the state's rate and its base (written or received, what's deductible), the insurer's legal form and domicile, credits with their own evidence (salary records, income tax returns), prepayment schedules and amounts by state, and the home state's charges for retaliation. Rates and rules are dated rows in the rulebook (the core's `jurisdiction_rules` already uses `premium_tax_rate` as an example key, The State System).

## How Reporting Shapes the Ledger

Working back from the reports gives the ledger's requirements:

- **State and statement line on every premium, loss and expense entry,** at the time it is recorded, for the State Page, premium tax and market share.
- **Coverage and rating characteristics on every premium transaction,** stored with the quote, for statistical plans.
- **Accident date and coverage on every loss transaction,** for Schedule P and statistical plans.
- **Transaction kind and reason on every policy change,** for MCAS counts and examiners.
- **The insurer (legal entity) on everything,** because every report is per insurer, and a group's reports are sums of entities, never allocations.
- **Two date bases kept,** accounting date for the books and effective or accident date for stats and actuarial work ([Effective Dating and Bitemporal Records](/books/insurance/insurance-system-architecture#effective-dating-and-bitemporal-records)).
- **Definitions versioned by reporting year,** for data calls and the MCAS, so last year's submission can be reproduced.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). The statement is `statement_lines`, `statement_line_mappings`, `statement_values` and `annual_statement_runs` (Statutory Accounting); tax rates are `jurisdiction_rules` (The State System) and surplus lines taxes `sl_tax_rules` (Excess & Surplus Lines); claims EDI is `edi_reports` (Workers' Comp Claims); feed batches are `ledger_feeds` (Insurance System Architecture). This chapter adds statistical records, data calls and tax filings:

```sql
CREATE TABLE stat_records (                -- one record under one statistical plan
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  plan               TEXT NOT NULL,         -- 'iso_personal_auto', 'niss_homeowners', ...
  plan_version       TEXT NOT NULL,
  record_kind        TEXT NOT NULL CHECK (record_kind IN ('premium', 'loss')),
  transaction_id     UUID REFERENCES policy_transactions (id),  -- premium records
  exposure_id        UUID REFERENCES exposures (id),            -- loss records
  state              TEXT NOT NULL,
  coded              JSONB NOT NULL,        -- the plan's codes: line, coverage, class, territory...
  policy_effective   DATE,
  accident_date      DATE,
  accounting_date    DATE NOT NULL,
  amount             BIGINT NOT NULL,       -- premium, or paid or outstanding loss change
  submission_id      UUID,                  -- the batch it went in
  edit_status        TEXT NOT NULL CHECK (edit_status IN ('pending', 'accepted', 'error',
                       'corrected')),
  edit_errors        JSONB
);

CREATE TABLE data_calls (                  -- a request for data, with its definitions
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer             TEXT NOT NULL,         -- 'NAIC MCAS', 'Treasury FIO TRIP', 'US-FL OIR'
  name               TEXT NOT NULL,         -- 'MCAS Homeowners'
  definitions_version TEXT NOT NULL,        -- '2025.0.3'
  reporting_period   DATERANGE NOT NULL,
  due_on             DATE NOT NULL,
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  jurisdictions      TEXT[] NOT NULL,
  query_ref          TEXT NOT NULL,         -- the versioned query that produces each schedule
  submitted_at       TIMESTAMPTZ,
  result_ref         TEXT,                  -- what was filed, as filed
  attested_by        UUID
);

CREATE TABLE tax_filings (                 -- premium, retaliatory and related returns and prepayments
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  jurisdiction       TEXT NOT NULL,
  tax                TEXT NOT NULL,         -- 'premium', 'retaliatory', 'fire_marshal', 'maintenance'
  kind               TEXT NOT NULL CHECK (kind IN ('prepayment', 'annual_return', 'amended')),
  tax_year           INT NOT NULL,
  due_on             DATE NOT NULL,         -- TX: March 1 and August 1; FL: March 1
  base_premium       BIGINT NOT NULL,       -- from the statement run's State Page
  statement_run_id   UUID,                  -- annual_statement_runs (Statutory Accounting)
  computed           JSONB NOT NULL,        -- rate, deductions, credits, cap, retaliation comparison
  amount_due         BIGINT NOT NULL,
  rule_refs          TEXT[] NOT NULL,       -- 'Fla. Stat. 624.509(6)(a)'
  filed_at           TIMESTAMPTZ,
  paid_payment_ref   TEXT
);
```

Design choices that matter:

- **Statistical records are generated from transactions and exposures,** one or more per source row, and regenerated (with corrections reported) when a replay changes the source; the source link makes the agent's data reconcilable to the books.
- **Data calls are versioned queries** with a definitions version, so a filed MCAS can be reproduced and the next year's definitions changed without touching last year's.
- **Tax filings start from the statement run,** so the premium base on the return is the State Page's number, and the computation (rate, deductions, credits, cap, retaliation) is stored with its rule references.
- **Recipients are configuration:** a statistical agent, a data collection agent or a stamping office is a party with a role, not a code path.

## Auditing

- **Reports tie to each other:** direct written premium by state and line on the State Page, the premium tax returns, the MCAS and the statistical plan submissions reconcile within documented differences.
- **Statistical edits closed:** every rejected record corrected and resubmitted within the plan's window.
- **Data calls reproducible:** a filed submission rerun from its query and definitions version returns the same numbers.
- **Tax computed by rule:** each return's rate, deductions, credits, cap and retaliatory comparison trace to dated rules, and prepayments match the schedule.
- **Counts follow definitions:** a sample of MCAS counts traced to the policy transactions and claims that produced them.

## What This Means for the System You Build

- **Produce every report from the same entries,** keyed by insurer, state, statement line, coverage and both date bases.
- **Store rating characteristics and statistical codes at the transaction,** so statistical plans need no reconstruction.
- **Treat data calls as versioned queries** over the core tables, with the filed result kept.
- **Compute premium tax from the State Page,** with deductions, credits, caps and retaliation as dated rules.
- **Reconcile the reports to each other** every period, before a regulator does.

## References

**Law and regulation**

- [Fla. Stat. 624.509](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0624/Sections/0624.509.html), Florida premium tax rates, the March 1 due date, deductions, the income tax and salary credits and the 65% cap, and the 2027 effective note
- [Texas Comptroller: Insurance taxes](https://comptroller.texas.gov/taxes/insurance/), the taxes, fees and assessments administered
- [Texas Comptroller: Insurance premium tax, licensed insurers](https://comptroller.texas.gov/taxes/insurance/licensed.php), rates by insurer type, the half rate on the first $450,000, the March 1 return and the March 1 and August 1 prepayments
- [Texas Comptroller: Retaliatory tax](https://comptroller.texas.gov/taxes/insurance/ret-tax.php), who owes it, the aggregate comparison and the due date
- [Texas Claim EDI Release 3.1.4 Implementation Guide (PDF)](https://txdwcedi.info/documents/txedi31guide0723.pdf), the data collection agent and reporting to it as reporting to DWC

**NAIC**

- [NAIC: Market Conduct Annual Statement](https://content.naic.org/insurance-topics/market-conduct-annual-statement), purpose, the 13 lines and 51 jurisdictions
- [NAIC: MCAS 2025 data year](https://content.naic.org/mcas-2025.htm), the April 30 and May 31, 2026 due dates and scorecard dates
- [NAIC: MCAS Homeowners Data Call & Definitions 2025.0.3 (PDF)](https://content.naic.org/sites/default/files/inline-files/MCAS%20Instructions%20Homeowners%202025.0.3.pdf), the reporting period, deadline, schedules and counting rules

**Regulators and guidance**

- [U.S. Treasury FIO: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), the TRIP data call and its 2026 cyber-hybrid scenario, and the 2026 aggregate retention amount

**Filings**

- [Verisk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1442145/000143774926004452/vrsk20251231_10k.htm), statistical agent status, 3.6 billion records in 2025, 38.9 billion held, loss costs and regulatory filings

**Standards**

- [NISS](https://www.niss-stat.org/), its five statistical plans and annual compliance reports
