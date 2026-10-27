+++
title = "Subsidized & Affordable Housing"
nav_title = "Affordable Housing"
description = "Owner and housing authority systems for subsidized housing: HAP contracts and TRACS, tax credit set-asides, certifications, HOTMA, inspections, and vouchers."
category = "Property Tech Industry"
order = 1719
part = "Rent and Resident Money"
tags = ["property-tech", "affordable-housing", "hud", "lihtc", "tracs", "public-housing"]
+++

In subsidized housing, the rent is computed, not set. A household's income, members, assets and expenses go in; a program's rules produce what the household pays and, often, what a government agency pays on its behalf. The owner must recertify the household every year and whenever its circumstances change, transmit the result to the agency in a prescribed format, bill the agency monthly for its share, keep the unit inside the program's rent limits, pass physical inspections, and keep every document for audits that can claw back years of subsidy. Many properties sit in more than one program at once (a tax credit property that also has project-based Section 8 units and a state loan), each with its own income limits and its own definition of income. On the other side of a voucher, a public housing authority runs its own system: waitlists, eligibility, landlords and their contracts, inspections and payments. This chapter covers both: the owner side (project-based assistance, tax credits and rural housing), certifications and income, the 2016 income and asset reforms known as HOTMA, inspections, and the housing authority side. Program rules move often, so dates here are as of October 2026.

## How the Platforms Do It

Affordable housing is a specialty edition in every major suite, and the feature lists converge on the same objects:

- **Entrata's** affordable edition lists TRACS transmissions, HAP requests, gross rent changes, repayment agreements and automated special claims; certifications and ledgers that update automatically when income is backdated or an interim certification overlaps an annual one; certifying one household or unit under multiple programs; automatic import of data sets released every April; and tax credit reporting with federal set-asides (20/50, 40/60 and 15/40) and custom programs.
- **Yardi Breeze Premier** supports tax credits, HUD 50059, Rural Development, HOME and local programs; generates and submits TRACS and MINC files; runs mass recertifications; manages set-asides; receives and distributes housing assistance payments; and manages waiting lists, from $3 per unit per month with a $400 minimum.
- **RealPage** lists HUD, tax credit, rural housing and 50058 public housing compliance, managed compliance services, and reporting of special claims, delinquency and prepaid rent "by subjournal": the resident's and the subsidy's portions of one ledger.

Several platforms (and specialists that sell only to housing authorities) also run the agency side: applications and waitlists, voucher issuance, landlord contracts and payments, inspections, and transmissions to HUD. The vocabulary below is the programs', because the programs' forms and file formats are the contract the software has to meet.

## The Owner Side

An owner of subsidized housing operates under one or more regulatory agreements, each with its own rules:

| Program | Who pays what | Owner's reporting | Who oversees |
| --- | --- | --- | --- |
| **Project-based Section 8** (and related HUD multifamily assistance) | The household pays a share computed from income; HUD pays the rest of the contract rent under a housing assistance payments (HAP) contract | Certifications on form HUD-50059 and monthly vouchers through TRACS | HUD and its contract administrators |
| **Housing Choice Voucher (tenant-based)** | The household pays its share; the housing authority pays the landlord the rest under a HAP contract for that unit | Lease and rent change paperwork to the authority; inspections | The local housing authority |
| **Low-Income Housing Tax Credit (LIHTC)** | The household pays a restricted rent; there's no subsidy payment, the owner's benefit is the tax credit | Income certifications and annual reports to the state allocating agency | State housing finance agencies and the IRS |
| **USDA Rural Development** (Section 515, rental assistance) | Household share plus rental assistance | MINC transmissions | USDA Rural Housing Service |
| **HOME, state and local programs** | Restricted rents, sometimes with assistance | Program-specific | Participating jurisdictions |

For the platform, three ideas carry across all of them.

**The unit is in programs, and the household is certified to them.** A building's regulatory agreements say which units are restricted to which income levels: a tax credit property elects a minimum set-aside, either 20% of units for households at or below 50% of area median income, 40% at or below 60%, or the average income test, where the designated limits of at least 40% of units average no more than 60% (26 U.S.C. 42(g)(1)), and its rents are restricted to 30% of the imputed income limit for the unit, with gross rent including the utility allowance (42(g)(2)). A unit can carry several designations at once, and every household in it must qualify under each.

**The ledger has two payers.** In assisted units, rent is split: the tenant rent the household owes, and the assistance payment the agency owes. They post as separate charges, the household's with `ledger_party = 'resident'` and the agency's with `ledger_party = 'subsidy'` ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)). Late fees, aging, notices and evictions run only on the resident's portion; Colorado, for one, forbids late fees on any portion of rent a subsidy provider is responsible for, and Minnesota limits them to the tenant's portion under HAP contracts ([Late Fees](/books/property-tech/charges-and-resident-ledgers#late-fees)). The subsidy portion is reconciled against what the agency actually paid.

**Retroactive changes are normal.** An interim certification for a job lost in March, processed in May, changes tenant rent and assistance from April. The ledger reverses and re-posts both portions for the affected months, and the next voucher to HUD carries the adjustment. Entrata advertises ledgers that "self-correct" when income is backdated; the mechanism underneath is reversal and re-posting, never edits ([Recurring Charges and the Posting Run](/books/property-tech/charges-and-resident-ledgers#recurring-charges-and-the-posting-run)). When the household owes money because it under-reported income, the owner signs a **repayment agreement**, an installment plan against a separate receivable that isn't rent.

### Vouchers and TRACS

Every month, an owner with project-based assistance requests the subsidy for the coming month: a **HAP voucher** listing assistance by unit from current certifications, plus **adjustments** for retroactive changes, move-ins and move-outs, and **special claims** for unpaid rent, damages and vacancy losses where the contract allows. Certifications and vouchers go to HUD's Tenant Rental Assistance Certification System. HUD's April 2026 system of records notice describes TRACS as managing rental assistance contracts, tenant and owner information and subsidy payments, running edit checks, validating tenant income and contract funding against other HUD systems, and submitting voucher requests for payment; owners, management agents, housing authorities and contract administrators submit data through its iMAX module. The same notice sets retention: HUD-50059 tenant data is permanent, tenant archives are deleted 25 years after move-out, and voucher data 25 years after the last voucher. Yardi Breeze describes generating and submitting TRACS files for the same flow, and MINC files for USDA's.

The software contract is the file format. TRACS defines record layouts and validation rules by release, and a release change (the one implementing HOTMA among them) changes the certification itself. My rule: the transmission is a generated artifact from immutable certification records, versioned by the format release that produced it, with every HUD response (accepted, rejected with errors, paid) stored against it, so a disputed voucher can be rebuilt as sent.

### Rents, limits and allowances

Programs constrain rents from both sides. Assisted contract rents change by HUD-approved adjustments (gross rent changes), which reprice the whole property at once and flow into every household's certification. Tax credit rents are capped by limits derived from area income. **Income limits** and the tax credit's multifamily tax subsidy project limits are published annually by HUD by area and household size; Entrata's import of "data sets released every April" is the annual load, and it has to keep every prior year, because a household certified last year was tested against last year's limits. **Utility allowances** reduce what the household pays when it pays utilities directly, and they're part of gross rent under the tax credit rules, so changing an allowance changes the maximum rent ([Resident Utility Billing](/books/property-tech/utilities-and-energy#resident-utility-billing) covers the billing side).

### Inspections

Assisted and public housing is inspected under HUD's National Standards for the Physical Inspection of Real Estate (NSPIRE). Compliance dates have moved program by program: in September 2025 HUD extended the NSPIRE compliance date for the voucher, project-based voucher and moderate rehabilitation programs to January 31, 2027 (the third extension), and for CPD programs to October 1, 2026; in September 2026 it sought comment on revised NSPIRE scoring procedures. RealPage markets NSPIRE tools (inspection scheduling and audit-ready reports) in its maintenance product. For the platform, an inspection is a dated record with findings by unit and area, each finding with a severity and a deadline, each deficiency a work order with proof of repair (Maintenance & Work Orders owns the repair; [Proof of Service](/books/field-operations/proof-of-service) the evidence).

## Certifications and Income

A certification is the household's eligibility and rent, computed at a point in time, signed and kept. Its kinds:

- **Move-in (initial):** eligibility under every program the unit is in, income against the limits, rent computed.
- **Annual recertification:** on the anniversary, with notices sent months ahead on a schedule the program sets, and consequences if the household doesn't respond.
- **Interim:** when income or household composition changes between annuals, under thresholds the program sets.
- **Unit transfer, gross rent change, termination:** other events that produce a new record.

Each certification captures the household's members (head, spouse, co-head, dependents, live-in aides, foster members), each member's income sources and assets, deductions (dependents, elderly or disabled household, medical and child care expenses), the computation (annual income, adjusted income, total tenant payment, tenant rent, utility allowance, assistance payment), and the program tests. Then:

- **The certification is immutable.** A correction is a new certification, often with an earlier effective date; the old one stays, because HUD, the state and the auditor all ask "what did you know and when?" ([Effective Dating & History](/docs/database/temporal-data#recorded-time-and-corrections)).
- **The computation is reproducible.** Store the inputs, the rule version and the outputs, not just the outputs, because program rules change and a 2023 certification must still compute under 2023 rules ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Verification is evidence.** Third-party verification of income and assets, and HUD's own **Enterprise Income Verification** system, which checks reported income for tenants in HUD rental assistance programs; HUD's June 2026 system of records notice replaces EIV's Income Discrepancy Report with an Income Validation Tool. Each source document is attached to the member and the income it verifies. Applications & Screening covers verification vendors; this chapter only needs the result and its evidence.
- **Multi-program certifications run every test at once.** A household in a tax credit unit with project-based assistance is tested against both limits, with both programs' definitions of income where they differ.
- **Deadlines are computed and tracked.** Recertification notices go out on the program's schedule, and a missed annual changes rent (often to market) on a date the rules set; the platform computes and stores those dates when the cycle opens ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

Rent-setting rules may change again: HUD proposed in March 2026 to let housing authorities and owners in public housing, vouchers, project-based vouchers and project-based rental assistance adopt work requirements of up to 40 hours a week and term limits of at least two years for non-elderly, non-disabled families, with supportive services, hardship policies and three months' notice. As of October 2026 it's a proposed rule. A platform that treats eligibility conditions as effective-dated rules per program can absorb that kind of change; one with eligibility in code can't.

## HOTMA

The Housing Opportunity Through Modernization Act of 2016 changed how income and assets are counted, and HUD's implementing rule for sections 102, 103 and 104 (published February 14, 2023, effective January 1, 2024) touches nearly every field of a certification:

- **Assets.** Families with net assets over $100,000 (adjusted annually for inflation) are ineligible, and ownership of real property suitable for residence also restricts eligibility. Imputed income from assets counts only when net family assets exceed $50,000 (inflation-adjusted), and non-necessary personal property worth $50,000 or less is excluded.
- **Interim reexaminations** are required when a change raises adjusted income by ten percent or more, with exceptions.
- **Deductions.** The threshold for medical and attendant care expenses rises from 3% to 10% of income, phased in with hardship relief, and dependent deductions adjust annually for inflation.
- **Over-income families** in public housing are defined against 2.4 times the very low-income limit, with rent policies and annual reports the authority must keep.

Compliance has been staged and extended as HUD's own systems were updated. For CPD programs (HOME, HTF, HOPWA, CDBG, ESG, CoC), HUD extended the compliance date to January 1, 2025, then to January 1, 2026, then, in December 2025, to January 1, 2027, citing system updates. Compliance for public housing, vouchers and multifamily assisted housing has been set by HUD notices to those programs and has also moved with system readiness (the TRACS release that carries HOTMA fields among them), so the platform has to know, per program and per property, which rule set applied to each certification's effective date. Yardi Breeze's affordable page points customers to its "latest HOTMA compliance updates", which is the honest state of the market: the rules are written, and their effective dates per program are still a moving schedule as of October 2026.

The design lesson is the same as for state law in [Late Fees](/books/property-tech/charges-and-resident-ledgers#late-fees): income rules are effective-dated rule sets per program, chosen by the certification's effective date and the program's compliance date, with the version recorded on every certification.

## The Housing Authority Side

A public housing authority runs a different system with overlapping data. It administers public housing it owns (where it's the landlord, using most of the owner-side model) and Housing Choice Vouchers (where it pays private landlords). Its components:

- **Applications and waitlists.** Preferences (local residency, veterans, homelessness, disability), ordering rules, purges and reopening; each applicant's position and every change to it, because waitlist order is a fair housing and audit question. HUD's 2025 and 2026 information collection notices add HOTMA-required waiting list and over-income reporting.
- **Eligibility and certifications.** The same income computations, recorded on form HUD-50058 and transmitted to HUD's Inventory Management System / PIC and Housing Information Portal, which HUD's September 2026 system of records notice describes as a national data repository through which authorities submit information on assisted families and properties.
- **Voucher issuance and leasing.** A voucher with a size and an expiry; a family's chosen unit; a request for tenancy approval from the landlord; rent reasonableness against comparable units and the payment standard (which the authority sets, without HUD approval, anywhere from 90% to 110% of HUD's Fair Market Rent for the unit size, published each year effective October 1); an inspection; then a HAP contract with the landlord for that unit.
- **Landlord management and payments.** Landlords as vendors, with tax identification, bank accounts and a portal for contracts, inspections and payment statements; monthly HAP payments to thousands of landlords, with abatements when a unit fails inspection and isn't repaired in time, and adjustments when a family's share changes. That's a payout operation ([Vendor Payouts](/books/payments/vendor-payouts)), with the change-of-bank-account fraud controls every payout operation needs ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)).
- **Inspections** of voucher units under NSPIRE (compliance date for voucher programs January 31, 2027, as of October 2026), scheduled, conducted on mobile devices, and tied to abatement.
- **Case management** for family self-sufficiency and other programs, with escrow accounts that grow as earned income rises.

For a platform that serves both sides, the boundary is where the owner's system meets the authority's: a landlord renting to a voucher holder receives the authority's HAP payment as a `ledger_party = 'subsidy'` payment and the family's share as a resident payment, and the authority's portal and the owner's ledger have to agree on both. Source-of-income laws that bar refusing voucher holders are Applications & Screening's and Fair Housing's.

## How to Build It

The core model's `households`, `people` and `leases` carry the household; the ledger chapter's `ledger_party` splits rent between resident and subsidy. This chapter adds programs, certifications, limits and vouchers, and the authority-side tables:

```sql
CREATE TABLE property_programs (         -- regulatory agreements and unit designations
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  program           TEXT NOT NULL CHECK (program IN ('section_8_pbra', 'pbv', 'lihtc',
                      'usda_rd', 'home', 'public_housing', 'state', 'local')),
  agreement_number  TEXT NOT NULL,       -- HAP contract, LURA, loan or grant number
  set_aside         TEXT,                -- '20_50', '40_60', 'average_income'
  unit_designations JSONB NOT NULL,      -- unit_id to income limit percent and rent limit
  oversight_agency  TEXT NOT NULL,
  valid_during      DATERANGE NOT NULL   -- the compliance or contract period
);

CREATE TABLE income_limits (             -- every year kept; certifications test against their year
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  area_code      TEXT NOT NULL,          -- HUD area
  program_basis  TEXT NOT NULL CHECK (program_basis IN ('hud', 'mtsp')),
  effective_on   DATE NOT NULL,
  household_size SMALLINT NOT NULL,
  percent_ami    SMALLINT NOT NULL,      -- 30, 50, 60, 80
  amount         BIGINT NOT NULL,
  UNIQUE (area_code, program_basis, effective_on, household_size, percent_ami)
);

CREATE TABLE utility_allowances (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  bedrooms     SMALLINT NOT NULL,
  amount       BIGINT NOT NULL,
  source       TEXT NOT NULL,            -- the allowance schedule or study
  valid_during DATERANGE NOT NULL
);

CREATE TABLE household_certifications (  -- immutable; corrections are new rows
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  household_id          UUID NOT NULL REFERENCES households (id),
  lease_id              UUID NOT NULL REFERENCES leases (id),
  program_ids           UUID[] NOT NULL,   -- every program this certifies to
  kind                  TEXT NOT NULL CHECK (kind IN ('move_in', 'annual', 'interim',
                          'unit_transfer', 'gross_rent_change', 'termination')),
  effective_on          DATE NOT NULL,
  supersedes_id         UUID REFERENCES household_certifications (id),
  rule_set_version      TEXT NOT NULL,     -- e.g. HOTMA or pre-HOTMA, by program
  annual_income         BIGINT NOT NULL,
  adjusted_income       BIGINT NOT NULL,
  net_family_assets     BIGINT NOT NULL,
  total_tenant_payment  BIGINT,
  tenant_rent           BIGINT NOT NULL,
  utility_allowance     BIGINT NOT NULL DEFAULT 0,
  assistance_payment    BIGINT NOT NULL DEFAULT 0,
  program_tests         JSONB NOT NULL,    -- each limit tested, with the limit row used
  form_snapshot         JSONB NOT NULL,    -- the 50059 or 50058 as generated
  status                TEXT NOT NULL CHECK (status IN ('draft', 'signed', 'transmitted',
                          'accepted', 'rejected', 'corrected')),
  signed_at             TIMESTAMPTZ
);

CREATE TABLE certification_members (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  certification_id UUID NOT NULL REFERENCES household_certifications (id),
  person_id        UUID NOT NULL REFERENCES people (id),
  relationship     TEXT NOT NULL,          -- 'head', 'spouse', 'co_head', 'dependent', 'live_in_aide'
  is_elderly       BOOLEAN NOT NULL,
  is_disabled      BOOLEAN NOT NULL,
  is_student       BOOLEAN NOT NULL
);

CREATE TABLE income_sources (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  certification_id UUID NOT NULL REFERENCES household_certifications (id),
  person_id        UUID NOT NULL REFERENCES people (id),
  kind             TEXT NOT NULL,          -- 'wages', 'social_security', 'pension', 'asset_income'
  annual_amount    BIGINT NOT NULL,
  is_excluded      BOOLEAN NOT NULL DEFAULT FALSE,
  verification     JSONB NOT NULL          -- method, source, document ids, EIV match
);

CREATE TABLE household_assets (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  certification_id UUID NOT NULL REFERENCES household_certifications (id),
  person_id        UUID REFERENCES people (id),
  kind             TEXT NOT NULL,
  cash_value       BIGINT NOT NULL,
  actual_income    BIGINT NOT NULL DEFAULT 0,
  is_real_property_suitable_for_residence BOOLEAN NOT NULL DEFAULT FALSE,
  verification     JSONB NOT NULL
);

CREATE TABLE subsidy_vouchers (          -- one monthly request per contract
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  program_id      UUID NOT NULL REFERENCES property_programs (id),
  month           DATE NOT NULL,          -- first of the month requested
  regular_amount  BIGINT NOT NULL,
  adjustments     BIGINT NOT NULL,        -- retroactive changes, signed
  special_claims  BIGINT NOT NULL DEFAULT 0,
  lines           JSONB NOT NULL,         -- per unit and certification
  format_release  TEXT NOT NULL,          -- the TRACS or MINC release used
  status          TEXT NOT NULL CHECK (status IN ('draft', 'transmitted', 'accepted',
                    'rejected', 'paid', 'short_paid')),
  amount_paid     BIGINT,
  agency_response JSONB,
  UNIQUE (program_id, month)
);

CREATE TABLE repayment_agreements (      -- unreported income owed back; not rent
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  program_id     UUID NOT NULL REFERENCES property_programs (id),
  amount_owed    BIGINT NOT NULL,
  installments   JSONB NOT NULL,
  signed_at      TIMESTAMPTZ NOT NULL
);

-- The housing authority side
CREATE TABLE waitlist_entries (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,             -- the authority
  waitlist      TEXT NOT NULL,             -- 'hcv', a public housing site, a PBV property
  household_id  UUID NOT NULL REFERENCES households (id),
  applied_at    TIMESTAMPTZ NOT NULL,
  preferences   TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL CHECK (status IN ('active', 'selected', 'removed', 'housed')),
  status_reason TEXT
);

CREATE TABLE hcv_vouchers (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  household_id   UUID NOT NULL REFERENCES households (id),
  bedroom_size   SMALLINT NOT NULL,
  issued_on      DATE NOT NULL,
  expires_on     DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('searching', 'leased', 'expired', 'ended'))
);

CREATE TABLE hap_contracts (             -- the authority's contract with a landlord for a unit
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  voucher_id          UUID NOT NULL REFERENCES hcv_vouchers (id),
  landlord_vendor_id  UUID NOT NULL REFERENCES vendors (id),
  unit_address        TEXT NOT NULL,      -- a unit outside the authority's own properties
  contract_rent       BIGINT NOT NULL,
  hap_amount          BIGINT NOT NULL,
  family_share        BIGINT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  abated_from         DATE                -- set when a failed inspection stops payments
);

CREATE TABLE unit_inspections (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  unit_id        UUID REFERENCES units (id),
  hap_contract_id UUID REFERENCES hap_contracts (id),
  standard       TEXT NOT NULL,           -- 'NSPIRE', 'NSPIRE-V', a state standard
  inspected_on   DATE NOT NULL,
  result         TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'inconclusive')),
  findings       JSONB NOT NULL,          -- deficiency, severity, location, cure deadline
  CHECK (unit_id IS NOT NULL OR hap_contract_id IS NOT NULL)
);
```

Decisions behind it:

- **Programs attach to properties with unit designations,** so a unit can sit in several and every certification knows which tests apply.
- **Certifications are immutable and versioned by rule set,** with a `supersedes_id` chain, and charges for both ledger parties are posted from them; a correction reverses and re-posts.
- **Limits are reference data kept forever,** keyed by area, basis, year, household size and percentage.
- **Vouchers are generated, transmitted and reconciled,** with the format release and the agency's response, and a short payment becomes a receivable on the subsidy ledger party.
- **The authority side reuses vendors and payouts** for landlords, and inspections tie to HAP contracts for abatement.

## Auditing

Subsidized housing has the most demanding audit trail in the book:

- **The tenant file.** Every certification, its inputs and verification documents, signatures and notices, kept for the program's retention period; HUD's TRACS notice treats 50059 data as permanent and keeps tenant archives 25 years after move-out.
- **Every transmission and response.** TRACS and MINC files as sent, error reports and resubmissions, and every voucher's payment.
- **Rent compliance by unit and month.** For tax credit units, the gross rent including utility allowance against the limit in force, because one overcharged month is a finding.
- **Program reporting** to state agencies and HUD on their schedules, and management reviews.
- **Waitlist history** at an authority: every application, preference, selection and removal, which is what a fair housing complaint asks for (Fair Housing; Records, Privacy & Audits).

## What This Means for the System You Build

- **Attach programs to properties and units,** let a unit carry several, and test every household against all of them.
- **Split the ledger into resident and subsidy portions,** run fees and notices on the resident's only, and reconcile the subsidy against what the agency paid.
- **Make certifications immutable, effective-dated and rule-versioned,** with inputs, outputs, verification and the form as generated.
- **Load income limits, utility allowances and payment standards as annual reference data** and keep every year.
- **Treat HOTMA and its compliance dates as rule sets selected by program and effective date,** not a code switch.
- **Generate TRACS and MINC files from records,** store the release used and the agency's response, and correct by adjustment.
- **On the authority side, treat landlords as payees** with payout fraud controls, and link inspections to payments.

## References

**Statutes and rules**

- [26 U.S.C. 42](https://www.law.cornell.edu/uscode/text/26/42), tax credit minimum set-asides, the average income test, rent restriction to 30% of the imputed income limit, utility allowances in gross rent
- [HUD: HOTMA final rule, sections 102, 103 and 104 (2023)](https://www.federalregister.gov/documents/2023/02/14/2023-01617/housing-opportunity-through-modernization-act-of-2016-implementation-of-sections-102-103-and-104), asset limits, imputed asset income, interim reexaminations, deductions, over-income families, effective January 1, 2024
- [HUD: HOTMA, further extension of compliance date for CPD programs (2025)](https://www.federalregister.gov/documents/2025/12/30/2025-23989/housing-opportunity-through-modernization-act-implementation-of-sections-102-and-104-further), the January 1, 2027 date and the earlier extensions
- [HUD: HOTMA, extension of compliance date and safe harbor implementation (2024)](https://www.federalregister.gov/documents/2024/12/31/2024-31401/housing-opportunity-through-modernization-act-implementation-of-sections-102-103-and-104-extension), system update delays
- [HUD: NSPIRE compliance date extension for voucher programs (2025)](https://www.federalregister.gov/documents/2025/09/30/2025-19070/economic-growth-regulatory-relief-and-consumer-protection-act-implementation-of-national-standards), January 31, 2027 for HCV, PBV and Mod Rehab
- [HUD: NSPIRE compliance date extension for CPD programs (2025)](https://www.federalregister.gov/documents/2025/09/30/2025-18988/economic-growth-regulatory-relief-and-consumer-protection-act-implementation-of-national-standards), October 1, 2026 for ESG, CoC, HOME and HTF
- [HUD: NSPIRE Scoring Notice (2026)](https://www.federalregister.gov/documents/2026/09/29/2026-19881/national-standards-for-the-physical-inspection-of-real-estate-scoring-notice), proposed scoring revisions
- [HUD: Establishing Flexibility for Implementation of Work Requirements and Term Limits (proposed, 2026)](https://www.federalregister.gov/documents/2026/03/02/2026-04095/establishing-flexibility-for-implementation-of-work-requirements-and-term-limits), optional work requirements and term limits
- [24 CFR 982.503](https://www.ecfr.gov/current/title-24/subtitle-B/chapter-IX/part-982/subpart-K/section-982.503), payment standards from 90% to 110% of the Fair Market Rent
- [HUD: Fair Market Rents for FY 2027](https://www.federalregister.gov/documents/2026/09/01/2026-17891/fair-market-rents-for-the-housing-choice-voucher-program-moderate-rehabilitation-single-room), annual publication effective October 1

**Systems**

- [HUD: TRACS system of records notice (2026)](https://www.federalregister.gov/documents/2026/04/24/2026-07999/privacy-act-of-1974-system-of-records), contracts, tenant and voucher data, iMAX, edit checks, retention
- [HUD: EIV system of records notice (2026)](https://www.federalregister.gov/documents/2026/06/05/2026-11295/privacy-act-of-1974-system-of-records), income verification for rental assistance, the Income Validation Tool
- [HUD: IMS/PIC and Housing Information Portal system of records notice (2026)](https://www.federalregister.gov/documents/2026/09/30/2026-20042/privacy-act-of-1974-system-of-records), the national repository for housing authority submissions
- [HUD: HOTMA public housing waiting list data collection (2026)](https://www.federalregister.gov/documents/2026/06/18/2026-12338/30-day-notice-of-proposed-information-collection-housing-opportunity-through-modernization-act-of), over-income and waiting list reporting

**In practice**

- [Entrata: Affordable](https://www.entrata.com/solutions/affordable), TRACS, HAP requests, special claims, repayment agreements, self-correcting ledgers, multi-program certification, tax credit set-asides
- [Yardi Breeze: Affordable housing features](https://www.yardibreeze.com/affordable-housing-features/), programs supported, TRACS and MINC files, mass recertifications, subsidy payments, pricing
- [RealPage: Affordable](https://www.realpage.com/affordable/), HUD, tax credit, rural housing and 50058 compliance, compliance services, reporting by subjournal
- [RealPage: Maintenance management](https://www.realpage.com/property-management-software/maintenance-management/), NSPIRE inspection scheduling and audit-ready reports
