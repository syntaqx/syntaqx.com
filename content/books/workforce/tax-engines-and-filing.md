+++
title = "Tax Engines & Filing Services"
nav_title = "Tax Engines & Filing"
description = "The calculation layer and the file-and-remit layer, Symmetry, Vertex, ADP and MasterTax, location codes, rate updates, engine testing, 94x e-file and rejects."
category = "Workforce Industry"
order = 2618
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "tax-engines", "e-file", "testing", "vendors"]
+++

Almost no one who runs payroll writes the tax rules themselves. The federal rules fit in a few publications, but there are thousands of state and local taxes, each with its own formula, rate table, supplemental method, wage base and effective dates, and they change every January, every July and whenever a city council votes. So the industry splits the problem in two layers, bought separately or together: a **calculation layer** (a tax engine) that turns wages, elections and addresses into tax amounts for one paycheck, and a **file-and-remit layer** (a tax filing service) that turns a quarter of paychecks into deposits, returns, wage reports and amendments with the agencies. Embedded payroll APIs bundle both behind one interface, and the largest providers run both in-house.

This chapter covers the split and why the line falls where it does, the vendors at each layer as they describe themselves, location codes and how an address becomes taxes, how rate and rule updates ship and how a platform adopts them safely, testing a tax engine, the bulk electronic filing formats for federal and state returns, and rejects and resubmission. The rules the engines encode are the rest of this part; the architecture of the pay run that calls the engine (deterministic, replayable runs with versioned rules) is in [Payroll Platform Architecture](/books/workforce/payroll-architecture).

## How the Platforms Do It

The two layers, as vendors describe their products, as of November 2026:

| Vendor | Layer | What it publishes |
| --- | --- | --- |
| **Symmetry Tax Engine (STE)** | Calculation | Calculates employee and employer withholding for the US and Canada (federal, state and local, including FICA, FUTA, state unemployment and disability, and "city, county, and school-district taxes") from addresses, wages and elections; rules "in effect for the pay date you supply"; "every call is fully self-contained, retaining no employee data or session between calculations," so the caller passes year-to-date totals; addresses become location codes through the Symmetry Location Service; hosted API or SDKs for Java, .NET and C/C++; "Symmetry keeps the underlying rates and rules current as tax law changes" |
| **Vertex Payroll Tax** | Calculation | Federal, state, provincial and local calculation for the US and Canada; address cleansing and jurisdiction assignment from home and work locations, with GeoAlign for withholding details at onboarding and address changes; "cloud, hosted, or on-premise"; REST and SOAP APIs; partners named include Oracle, NetSuite, Insperity and isolved |
| **ADP SmartCompliance Employment Tax** | File and remit | Outsourced post-payroll employment tax work for "payroll, ERP and in-house systems": filings, deposits, amendments and notices, new registrations through to an issued ID, and quarter- and year-end processing |
| **MasterTax** (ADP since 2010) | File and remit | Payroll tax and compliance "covering more than 10,000 tax jurisdictions in the U.S. and Canada," from in-house filing software to outsourcing a client's payroll tax function, for multinationals and payroll service providers |
| **Check** | Both, embedded | Calculates net pay, collects from the employer, pays employees, creates Tax Deposits at approval and files returns as Filings with a lifecycle, blockers and amendments |
| **Gusto Embedded** | Both, embedded | Tax setup by state requirement sets, tax liabilities and payments, company and employee forms |
| **Zeal** | Both, embedded | Embedded payroll that, by its documentation, files taxes in all 50 states |

Three things stand out. **The calculation layer is stateless; the filing layer is all state.** An engine that keeps "no employee data" can be called from any payroll and replayed for any date, but it can't know a wage base is exhausted unless told; a filing service is the opposite, a ledger of every liability, deposit, return, notice and account per employer. That's why the layers are separable and why most platforms buy the first and build or outsource the second. **Neither layer owns the data that decides the answer.** The engine needs the right addresses, elections and year-to-date amounts; the filing service needs the right registrations, account numbers and liabilities. A platform's correctness is mostly its own data, which is the core model's job. **The embedded APIs are proof the layers compose.** Check, Gusto and Zeal sell one interface over both, and their objects (a Tax with effective dates, a Tax Deposit with a due date and funding status, a Filing with blockers) are the seams between the layers made visible.

## The Calculation Layer

A tax engine call takes one worker's one payment and returns tax lines. Its inputs:

- **Who and where:** the work location and home location as location codes (or addresses the engine resolves), and the worker's tax elections per jurisdiction (the W-4 steps, a state form's allowances, exemption certificates).
- **What:** the earnings and deductions on the payment, each with its type (regular or supplemental, pre-tax for which taxes), and the pay frequency and pay date.
- **History:** year-to-date (and sometimes quarter-to-date) wages and taxes per tax, so wage bases and thresholds apply correctly.
- **The employer's own parameters:** its SUI rate, any local options, its supplemental method choice.

Its outputs are tax amounts per tax ID with subject and taxable wages, which become `pay_statement_lines` with `tax_type`, `jurisdiction_id`, `subject_wages` and `taxable_wages`. The engine is a pure function of its inputs and the rules in force on the pay date, and the system should treat it as one: same inputs and rule version, same outputs. That is what makes a retro calculation possible (call the engine with the old period's inputs and the old pay date) and what lets a platform test it.

A minimal stateless calculation, Social Security only, shows the shape: rules by date, year-to-date from the caller, cumulative rounding so the year lands on the cent:

```go tab="Go"
// SocialSecurity computes one payment's employee Social Security tax.
// Amounts are cents. The caller supplies year-to-date wages and tax for this
// worker and employer; the rule (rate, base) is resolved by pay date.
type SSRule struct {
	RateMicros int64 // 62000 = 6.2%
	WageBase   int64 // 18450000 = $184,500.00
}

type SSResult struct {
	Subject, Taxable, Tax int64
}

func SocialSecurity(r SSRule, subject, ytdTaxable, ytdTax int64) SSResult {
	room := r.WageBase - ytdTaxable
	if room < 0 {
		room = 0
	}
	taxable := min(subject, room)
	// Cumulative: tax on all taxable wages to date, rounded half up, minus tax already withheld.
	total := ((ytdTaxable+taxable)*r.RateMicros + 500_000) / 1_000_000
	return SSResult{Subject: subject, Taxable: taxable, Tax: total - ytdTax}
}
```

```rust tab="Rust"
/// One payment's employee Social Security tax. Amounts are cents; the caller
/// supplies year-to-date wages and tax; the rule is resolved by pay date.
pub struct SsRule {
    pub rate_micros: i64, // 62_000 = 6.2%
    pub wage_base: i64,   // 18_450_000 = $184,500.00
}

pub struct SsResult {
    pub subject: i64,
    pub taxable: i64,
    pub tax: i64,
}

pub fn social_security(r: &SsRule, subject: i64, ytd_taxable: i64, ytd_tax: i64) -> SsResult {
    let room = (r.wage_base - ytd_taxable).max(0);
    let taxable = subject.min(room);
    // Cumulative: tax on all taxable wages to date, rounded half up, minus tax already withheld.
    let total = ((ytd_taxable + taxable) * r.rate_micros + 500_000) / 1_000_000;
    SsResult { subject, taxable, tax: total - ytd_tax }
}
```

On the $250,000 semimonthly example from [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#worked-numbers-crossing-the-wage-base), this returns $645.83 or $645.84 a payday as the cumulative rounding catches up, and $11,439.00 for the year. The engine is simple because everything hard (the year-to-date, the rule by date, which earnings are subject) arrives as input.

## Location Codes and the Address Problem

Engines don't take free-text addresses at calculation time; they take a code that already names the taxing jurisdictions. Symmetry's flow is explicit: convert home and work addresses into location codes with its location service, then call the engine with the codes, and repeat the conversion "only when an address changes." Vertex assigns jurisdictions from home and work locations and offers GeoAlign for onboarding and address changes. The lookup itself (normalize, geocode, intersect with boundaries, map to codes) is in [State & Local Payroll Taxes](/books/workforce/state-and-local-tax#from-an-address-to-jurisdictions). For the integration, three points:

- **Store the vendor's code with the address version** (`address_geocodes.provider_location_code`), never recompute it in the pay run, so a run is reproducible after the vendor updates its boundaries.
- **Keep the jurisdictions too, not only the code.** The filing layer, the W-2 and the registration check need jurisdictions in the platform's own terms; a vendor code is an input to one vendor's engine.
- **Plan for two vendors.** Platforms change engines, or run a second one for comparison; a `tax_jurisdictions` table with a `code_scheme` per vendor is what makes that a mapping instead of a migration.

## Rate Tables and How Updates Ship

Tax rules change on dates the agencies choose: January 1 for most federal and state tables, July 1 for some local rates (Philadelphia's 2026 wage tax change) and county notices mid-year (Indiana's October 1, 2026 county rates). Wage bases arrive in October (the 2027 Social Security base was announced October 14, 2026); credit reduction states are final after November 10; SUI rate notices arrive per employer around year-end. A hosted engine updates its rules on its side, and Symmetry describes updates arriving "without changes to your integration code"; an on-premise engine ships updates as releases the platform installs.

Either way, a platform needs three controls:

- **Pin the version a run used.** Record the engine version and rule set on the calculation, so a statement can be explained and recomputed. A hosted engine that changes under you still needs its version echoed back and stored.
- **Stage before effective.** Rule updates for January 1 arrive in December; install them, run the next year's projected first payroll for a sample of employers against old and new rules, and review the differences before the date.
- **Separate the platform's own tables.** Employer SUI rates, local options and taxability choices the platform stores (`tax_registrations`, `taxability_rules`) aren't the engine's; a January engine release doesn't load them, and a run that uses a new engine with last year's SUI rate is wrong in a way the engine can't see.

## Testing a Tax Engine

A tax engine is tested like any pure function, with three sources of expected answers:

- **Agency worked examples.** Publications include worked examples whose answers are authoritative. Pub 15-T's nonresident alien example (a married nonresident alien paid $300 weekly, a 2019 W-4 with single status and one allowance, the $226.90 Table 1 amount added for $526.90) gives "$31 in federal income tax" by the wage bracket method; Indiana's Departmental Notice 1 works an $800 weekly employee to $13.96 of state tax and $4.73 of county tax. Each becomes a test case pinned to its publication's year.
- **Hand-built boundary cases.** The cases agencies don't publish: a payment that reaches the Social Security base to the cent, wages of exactly $200,000 for Additional Medicare, a rate change effective on a pay date, an Indiana employee who moved on January 2, an Ohio worker on their 20th and 21st days, a Yonkers resident whose surcharge depends on the state line, a supplemental payment in a state that requires the aggregate method. Rounding rules count: Pub 15-T says withheld amounts "should be rounded to the nearest whole dollar by dropping amounts under 50 cents" when an employer chooses to round.
- **Differential tests.** Run the same population through the old and new engine version (or through two vendors) and review every difference above a cent. Most differences are rule changes; the rest are bugs on one side.

Golden files for a year (every employee type, every jurisdiction the platform serves, a full year of payments) are the regression suite. They are data, versioned with the rules they assume, and rerun on every engine release.

## The File-and-Remit Layer

The filing layer owns everything after the pay run: liabilities and their due dates, deposits and their confirmations, returns and wage reports, amendments, notices and agency accounts. Its objects in the embedded APIs map onto the core model directly: Check's Tax Deposit is a deposit event over `liabilities` satisfied by a `remittances` row; its Filing is a `filings` row, with `amends` and `amended_by` as `amends_filing_id`; its blockers are the reasons a `filings` row can't move. The filing service's state machine is Check's: `pending` (being prepared), `blocked` (something prevents filing, including an agency rejection), `submitted` (sent), `filed` (acknowledged), and `inapplicable` (no longer required). Check closes a filing's processing "after processing all unblocked companies," and notes the agency uses the submitted date to decide timeliness, so `submitted_at` is the date that matters, not `filed_at`.

The layer's core loop each quarter is: lock the period's statement lines, build every return and wage report from them, validate against the registrations (account numbers, rates), hold the ones with blockers, submit the rest in bulk to each agency's channel, process acknowledgments and rejects, and reconcile deposits to liabilities per return. [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns) has the deposit rules; [Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts) the amendments and notices.

## Bulk Filing Formats

**Federal returns (94x e-file).** Forms 940, 941, 943, 944 and 945, and corrected Forms 941-X, 943-X and 945-X, can be e-filed (and Form 940 amended electronically) through IRS-approved software or an authorized e-file provider, on the IRS's Modernized e-File (MeF) platform. A self-filing employer signs with a 94x Online Signature PIN ("Allow at least 45 days to receive your PIN") or by attaching a scanned Form 8453-EMP; reporting agents file for groups of employers under the Pub 3112 and Rev. Proc. 2007-40 program. Acknowledgments come back "within 24 hours." CPEOs must e-file 941 and 940 with Schedule R. A provider that files thousands of 941s submits them as MeF XML in batches and matches each acknowledgment to its `filings` row by submission ID.

**W-2s to SSA (EFW2).** Annual W-2 Copy A goes to the Social Security Administration in its EFW2 format (Publication 42-007 for tax year 2026) through Business Services Online, with W-2c in EFW2C; [Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s#efw2-and-bso) covers the records and the 2026 changes.

**State returns and wage reports.** States accept withholding returns, SUI wage reports and annual reconciliations through their online accounts and bulk upload formats, many derived from the EFW2 layout for W-2 data and from a shared record format for quarterly wage reports, each with state-specific fields. A filing service maintains a format per state per form per year, which is much of what the vendors above sell.
<!-- source-gap: wf-state-bulk-formats | missing | the bulk upload formats states accept for SUI quarterly wage reports and withholding reconciliations (record layouts, shared standards such as ICESA, and which states use them) | closes with: state employer e-file specifications for the largest payroll states | checked: 2026-11-09 -->

**Information returns (IRIS).** Forms 1099 move to the IRS's Information Returns Intake System, which replaces FIRE starting with tax year 2026 filings; [Contractors & 1099s](/books/workforce/contractors-and-1099s) covers it.

## Rejects and Resubmission

A submission can fail at three points, and each needs a different response:

- **Transport or schema.** The file didn't parse or failed validation at the agency's gateway. Nothing was filed; fix the generator and resubmit. Check describes this case: a "validation issue with the submission file" returns the filing to `pending` and resubmits without action from the customer.
- **Business rule reject.** The agency processed the submission and rejected the return (a name and EIN mismatch, an account number not found, totals that don't foot, a duplicate). The return isn't filed; fix the data, often with the client's help, and resubmit before the due date. Check returns these to `blocked` with `blocked_reasons` describing the next steps.
- **Accepted, then disputed.** The return was accepted and later produces a notice. That isn't a reject; it's a case.

A reject before the due date costs nothing if the resubmission is timely; the same reject discovered after the due date is a late return. The reject queue is therefore a deadline queue, and the first thing it shows is the time remaining.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `taxability_rules` and `tax_jurisdictions` exist; [State & Local Payroll Taxes](/books/workforce/state-and-local-tax#how-to-build-it) added geocodes with vendor location codes. This chapter adds the engine versions a run used, the rule updates the platform adopted, each submission of a filing, and each reject.

```sql
-- An engine version as deployed (vendor or in-house), and when it was in use.
CREATE TABLE tax_engine_versions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor              TEXT NOT NULL,         -- 'in_house' or the vendor's name
  engine_version      TEXT NOT NULL,         -- as the engine reports it
  rule_set_version    TEXT,                  -- the tax data release, if separate
  deployment          TEXT NOT NULL CHECK (deployment IN ('hosted', 'on_premise', 'embedded')),
  deployed_at         TIMESTAMPTZ NOT NULL,
  retired_at          TIMESTAMPTZ,
  golden_suite_run_id TEXT,                  -- the regression run that approved it
  UNIQUE (vendor, engine_version, rule_set_version)
);

ALTER TABLE pay_runs ADD COLUMN tax_engine_version_id UUID REFERENCES tax_engine_versions (id);

-- A rule change the platform adopted, with what it changed and how it was reviewed.
CREATE TABLE tax_rate_updates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  tax_type            TEXT NOT NULL,
  change_kind         TEXT NOT NULL CHECK (change_kind IN ('rate', 'wage_base', 'threshold',
                        'table', 'formula', 'new_tax', 'repeal', 'boundary', 'location_codes')),
  effective_on        DATE NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('engine_release', 'platform_table',
                        'agency_notice')),
  source_ref          TEXT NOT NULL,         -- the publication, notice or release note
  tax_engine_version_id UUID REFERENCES tax_engine_versions (id),
  tax_rate_id         UUID REFERENCES tax_rates (id),        -- for platform-owned rows
  impact_preview      JSONB,                 -- differential test summary before the date
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  retro_required      BOOLEAN NOT NULL DEFAULT FALSE          -- announced after its effective date
);

-- Every attempt to file a return or report, by channel.
CREATE TABLE filing_submissions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_id           UUID NOT NULL REFERENCES filings (id),
  attempt             SMALLINT NOT NULL,
  channel             TEXT NOT NULL CHECK (channel IN ('mef_94x', 'ssa_bso_efw2', 'iris',
                        'state_bulk', 'state_portal', 'local_portal', 'paper')),
  batch_ref           TEXT,                  -- the transmission or batch this went in
  payload_ref         TEXT NOT NULL,         -- the exact file sent, stored
  payload_sha256      CHAR(64) NOT NULL,
  submitted_at        TIMESTAMPTZ NOT NULL,  -- the timeliness date
  agency_submission_id TEXT,
  ack_status          TEXT CHECK (ack_status IN ('pending', 'accepted', 'rejected',
                        'accepted_with_errors')),
  ack_received_at     TIMESTAMPTZ,
  ack_document_id     UUID REFERENCES documents (id),
  UNIQUE (filing_id, attempt)
);

-- Each reject reason, with what it blocks and how it was cleared.
CREATE TABLE filing_rejects (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_submission_id UUID NOT NULL REFERENCES filing_submissions (id),
  stage               TEXT NOT NULL CHECK (stage IN ('transport', 'schema', 'business_rule')),
  agency_code         TEXT,                  -- the agency's error or rule number
  message             TEXT NOT NULL,
  blocker_type        TEXT,                  -- normalized: 'invalid_tax_id', 'name_ein_mismatch', ...
  needs_client_action BOOLEAN NOT NULL DEFAULT FALSE,
  due_on              DATE NOT NULL,         -- the filing's due date, for the queue
  cleared_at          TIMESTAMPTZ,
  cleared_by_submission_id UUID REFERENCES filing_submissions (id)
);

-- The reject queue, by time left before the due date.
SELECT r.id, f.employer_id, f.form, f.period, r.blocker_type, r.due_on,
       r.due_on - CURRENT_DATE AS days_left
FROM filing_rejects r
JOIN filing_submissions s ON s.id = r.filing_submission_id
JOIN filings f ON f.id = s.filing_id
WHERE r.cleared_at IS NULL
ORDER BY days_left, f.employer_id;
```

Design notes:

- **The engine version is part of the run's identity.** A recalculation of a paid run uses the version it used, unless the point is to see what changed; store `tax_engine_version_id` on the run and the inputs sent with the calculation ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Keep the exact payload of every submission.** What was sent, with its hash and the acknowledgment, is the answer to "what did you file," and the only defense when an agency says it received something else ([What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
- **Rate updates announced late are retro events.** A rule published after its effective date (a mid-year local change, a late notice) sets `retro_required`, and the platform recomputes affected runs and liabilities by the corrections process.
- **Normalize reject reasons into blocker types.** Each agency's codes map to a short list the operations team and the client can act on, the same list the pre-filing validation checks, so a reject that happened once becomes a check that runs before every filing.
- **Buy the engine, own the inputs.** Whatever vendor calculates, the platform owns addresses, elections, year-to-date and employer parameters, and tests them as hard as the engine ([Testing Rules](/docs/building-blocks/rules-as-data#testing-rules)).

## Auditing

Engines and filing services are what a SOC 1 auditor and an agency examiner both ask about, from different directions. Keep:

- **Engine versions and their approval**: the golden suite results and differential reviews that cleared each release.
- **Per run, the engine version and the inputs sent,** so any statement can be recomputed.
- **Rule updates adopted**, with source, effective date, preview and approver.
- **Every submission's payload, timestamp and acknowledgment,** and every reject with how it was cleared.
- **Location codes per address version** and the vendor release that produced them.

## What This Means for the System You Build

- **Split calculation from file-and-remit** in the design even if one vendor provides both; they fail and change differently.
- **Call the engine as a pure function** with addresses already coded, elections, year-to-date and the pay date, and store its version on the run.
- **Resolve addresses to location codes outside the pay run,** on address change, and keep the platform's own jurisdictions beside the vendor code.
- **Stage rule updates before their effective date** with differential tests and an approval, and treat late announcements as retro work.
- **Test with agency worked examples, boundary cases and golden years,** versioned with the rules.
- **Keep every submission's exact payload and acknowledgment,** and run the reject queue by days left to the due date.
- **Turn every new reject reason into a pre-filing check.**

## References

**Agency guidance and forms**

- [IRS: Employment tax e-file](https://www.irs.gov/employmentefile), forms that can be e-filed, signature options, the 45-day PIN lead time and 24-hour acknowledgments
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), e-filing by reporting agents (Pub 3112, Rev. Proc. 2007-40) and CPEOs (Schedule R)
- [IRS: Publication 15-T (2026), Federal Income Tax Withholding Methods](https://www.irs.gov/publications/p15t), Worksheet 1A for automated payroll, the nonresident alien worked example and rounding to whole dollars
- [Indiana Department of Revenue: Departmental Notice 1](https://www.in.gov/dor/files/dn01.pdf), the state and county worked example and rates effective October 1, 2026
- [Social Security Administration: Specifications for filing Forms W-2 and W-2c electronically](https://www.ssa.gov/employer/EFW2&EFW2C.htm), EFW2 Publication 42-007 and EFW2C Publication 42-014 for tax year 2026

**Vendor documentation**

- [Symmetry: What is the Symmetry Tax Engine](https://docs.symmetry.com/ste/overview/what-is-the-ste), scope, pay-date rules, stateless calls, location codes, deployment and updates
- [Vertex: Payroll tax](https://www.vertexinc.com/solutions/tax-type/payroll-tax), scope, jurisdiction assignment, GeoAlign, deployment, APIs and partners
- [ADP: SmartCompliance Employment Tax](https://apps.adp.com/en/apps/623571/adp-smartcompliance-employment-tax), filings, deposits, amendments, notices, registrations and quarter- and year-end processing
- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), deposits created at approval with due dates and funding status
- [Check: Tax filings](https://docs.checkhq.com/docs/tax-filings.md), the filing lifecycle, blockers, rejections, resubmission and the submitted date
- [Check: The filing object](https://docs.checkhq.com/reference/the-filing-object.md), fields, statuses and amendment links
- [Gusto Embedded: Documentation index](https://docs.gusto.com/embedded-payroll/llms.txt), tax requirements, liabilities, payments and forms
- [Zeal: Documentation](https://docs.zeal.com/), embedded payroll and tax filing in all 50 states

**In practice**

- [Sovos: SSA releases 2026 specifications for filing Forms W-2 and W-2c electronically](https://sovos.com/regulatory-updates/trr/ssa-releases-2026-specifications-for-filing-forms-w-2-and-w-2c-electronically-efw2-efw2c/), IRIS replacing FIRE from tax year 2026
- [Accounting Today: ADP acquires MasterTax (October 8, 2010)](https://www.accountingtoday.com/news/adp-acquires-mastertax), MasterTax's jurisdictions, offerings and clients
