+++
title = "Payers & Plans"
description = "Who pays for US care: commercial, self-funded ERISA, Medicare and Advantage, Medicaid managed care, TPAs, dental and vision carriers, plan design and networks."
category = "Health Tech Industry"
order = 1950
part = "Payers"
tags = ["health-tech", "payers", "insurance", "medicare", "medicaid", "erisa", "data-model"]
+++

A payer is whoever pays a claim for care someone else received, and in the United States that is a crowd. An employer's plan run by a national insurer, the same insurer administering a different employer's self-funded plan under its own name, Medicare paying through a regional contractor, a Medicare Advantage plan paid a monthly amount per member by Medicare, a state Medicaid agency, the managed care company the state pays to run Medicaid in one county, a dental carrier, a vision plan, a workers' compensation insurer and the patient themselves. A practice's software sees all of them as a row in `payers` and a member ID on a card. A payer's software sees the opposite side: the plan document, the network contract, the benefit year and the member's running totals against a deductible.

This part of the book is the payer's side; the parties and the money between them are introduced in [Who's Who](/books/health-tech/health-tech-business#who-s-who) and [How the Money Flows](/books/health-tech/health-tech-business#how-the-money-flows). The provider's side of the same transactions (checking eligibility, sending claims, posting remittances, chasing denials and prior authorizations) is the [Revenue Cycle](/books/health-tech/revenue-cycle) part, especially [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits), [Claims](/books/health-tech/claims) and [Prior Authorization](/books/health-tech/prior-authorization); this chapter and [Inside a Payer](/books/health-tech/payer-operations) describe what happens at the other end of those wires. This chapter covers the kinds of payer, who regulates each, how a plan is designed, how networks work, and how the core `payers`, `plans` and `coverages` records should be shaped to hold all of it. Credentialing and enrollment, which put a practitioner into a network, are [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment); drug benefits, which usually run through a separate company, are [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits).

## How the Platforms Do It

The payer world is concentrated at the top and fragmented underneath. As of October 2026, from public filings, regulator pages and the companies' own sites:

| Payer or system | What it is | Public figures | Notes for software |
| --- | --- | --- | --- |
| **UnitedHealth Group** | National insurer (UnitedHealthcare), Optum services, Optum Rx PBM | 26% of Medicare Advantage enrollment in 2026 (9.3 million) per KFF | Insurer, PBM, clearinghouse owner (Change Healthcare) and provider group in one company |
| **Humana** | Insurer concentrated in Medicare | 20% of Medicare Advantage enrollment in 2026 (7 million) per KFF | Gained about 1.3 million MA members from 2025 to 2026 |
| **CVS Health (Aetna)**, **Cigna**, **Elevance**, **Centene** | National and regional insurers; Cigna and CVS own PBMs (Express Scripts, Caremark) | Named by the FTC among the vertically integrated PBM owners | Centene is mostly Medicaid and Marketplace |
| **Medicare fee for service** | Federal program paying claims through Medicare Administrative Contractors | 12 A/B MAC jurisdictions and 4 DME MAC jurisdictions | A practice's "Medicare" payer is a MAC jurisdiction, chosen by geography |
| **State Medicaid** | Federal-state program run by each state, largely through managed care | Capitation per member per month to contracted MCOs | Gainwell says it supports 70% of Medicaid and CHIP enrollees |
| **Delta Dental** | National association of independent dental carriers | 39 independent companies | Several plan types (PPO, Premier, DeltaCare USA) with different networks under one brand |
| **Core admin vendors** | Claims and benefits engines payers run on | Cognizant TriZetto (Facets, QNXT) cites 200 million+ members; HealthEdge sells HealthRules Edge | Covered in [Inside a Payer](/books/health-tech/payer-operations#how-the-platforms-do-it) |

Three patterns matter to anyone building on either side:

- **The name on the card is often not the risk-bearer.** KFF's 2025 employer survey found 67% of covered workers in self-funded plans: the employer pays claims from its own money and hires an insurer or third-party administrator to run the network and process claims. The card says Aetna or Blue Cross; the money and much of the plan design belong to the employer.
- **Government money flows through private plans.** In 2026, 55% of eligible Medicare beneficiaries (about 35.2 million) are in Medicare Advantage, per KFF, and Medicaid states contract with managed care organizations paid by capitation. A claim for a Medicare patient is as likely to go to UnitedHealthcare as to a MAC.
- **One company plays every role.** The largest insurers own PBMs, specialty pharmacies, clearinghouses and provider groups; the FTC's 2024 interim report describes the largest PBMs as "vertically integrated with the nation's largest health insurers." A software vendor's customer, competitor and data source can be the same parent.

## The Kinds of Payer

| Kind | Who bears the risk | Main regulator | What changes for software |
| --- | --- | --- | --- |
| **Fully insured commercial** | An insurer, paid premiums | State insurance department; ACA federal rules | State mandates apply; prompt pay laws apply; plan is a filed insurance product |
| **Self-funded employer (ERISA)** | The employer, often with stop-loss insurance | US Department of Labor (EBSA) under ERISA | State insurance law largely preempted; claims and appeals under 29 CFR 2560.503-1; an insurer or TPA administers |
| **Marketplace (ACA exchange)** | An insurer | State and CMS | Metal levels, the annual out-of-pocket limit, CMS interoperability rules for issuers on the federal exchange |
| **Medicare fee for service** | The federal government | CMS, through MACs | Parts A and B billed to the MAC; national and local coverage determinations |
| **Medicare Advantage (Part C)** | A private plan paid per member by CMS | CMS | Network plan rules, prior authorization limits, CMS API rules, Star Ratings |
| **Medicare Part D** | A private drug plan sponsor | CMS | Formulary rules and an annual out-of-pocket cap; see [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits) |
| **Medicaid fee for service** | The state (with federal matching) | State Medicaid agency, CMS | State's own claims system, often run by a vendor |
| **Medicaid managed care** | A managed care organization paid capitation | State contract, 42 CFR Part 438 | Plan rules set in the state contract; CMS API rules apply |
| **Dental and vision carriers** | A carrier or the employer | State insurance law, ERISA when employer-sponsored | Frequency limits, annual maximums, materials allowances; mostly separate from medical |
| **Workers' comp, auto, liability** | An insurer under a claim number | State workers' comp boards, state law | Claim is tied to an injury and an adjuster, not a member year |
| **Self-pay** | The patient | Price transparency and good faith estimate rules | No payer row at all, or a sentinel "self-pay" payer; see [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience) |

**ERISA is the dividing line.** ERISA "sets minimum standards for most voluntarily established retirement and health plans in private industry," requires "a grievance and appeals process," and excludes governmental and church plans (DOL). Its preemption clause supersedes state laws that "relate to any employee benefit plan," while a saving clause keeps state laws that regulate insurance, and the deemer clause stops a state from treating the plan itself as an insurer (29 U.S.C. 1144). The practical consequence: a state law that mandates coverage of a service, caps a cost, or regulates prior authorization usually reaches the fully insured plan and not the self-funded plan sitting on the same insurer's network. A rules engine that asks "does this state's law apply to this coverage?" needs to know the plan's funding, not only its state.

**Medicare is several programs.** Part A (hospital) and Part B (medical) are traditional Medicare, paid by MACs that "process Medicare Part A and Medicare Part B claims for a defined geographic area" (CMS). Part C is Medicare Advantage, private plans that replace A and B for members who choose them; KFF counts about 8.2 million members in special needs plans in 2026, 23% of MA enrollment, most of them dual-eligible for Medicaid. Part D is drug coverage. A person on traditional Medicare often adds a Medigap supplement, a secondary payer that fills Medicare's cost-sharing; a Medicare Advantage member generally has the plan's own cost-sharing instead. One beneficiary can therefore appear as three coverages (Part B primary, Medigap secondary, a Part D drug plan) or as one MA plan that bundles all three.

**Medicaid is one program per state.** Each state and territory runs its own, with its own fee schedule, rules and claims system, and most deliver care through managed care: the state contracts with MCOs that receive "a fixed per-member, per-month (capitation) payment" (Medicaid.gov) under 42 CFR Part 438. A practice billing Medicaid in one state may face the state's fee-for-service program and four MCOs, each with its own payer ID, portal and prior authorization rules.

**Third-party administrators and carve-outs.** A TPA processes claims for a self-funded employer without bearing risk; a national insurer acting as an "administrative services only" vendor is the same role. Employers also carve benefits out to specialists: behavioral health to a behavioral health company, pharmacy to a PBM, dental to a dental carrier. A member's single employer plan can be four payers in a practice's system, each with its own card.

**Dental and vision.** Dental benefits run on a different shape from medical: preventive services at or near 100%, basic and major services at lower percentages, an annual maximum the plan will pay (the reverse of a medical out-of-pocket maximum), and frequency limits such as two cleanings a year. Delta Dental alone is "39 independent Delta Dental companies" with several plan types. Vision plans pay an exam and a materials allowance. The dental practice's view of this, including breakdowns and frequency checks, is [Insurance Estimation](/books/health-tech/dental-practice#insurance-estimation) and [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits); vision plans are in [Optometry and Optical](/books/health-tech/specialty-practices#optometry-and-optical).

## Plan Design

A plan is a contract: what is covered, at what share, inside which network, for which year. Its parts:

- **Premium.** What the employer or member pays per month to be covered. KFF's 2025 survey puts average annual premiums at $9,325 for single coverage and $26,993 for family coverage, with workers contributing $1,440 and $6,850 on average.
- **Deductible.** What the member pays before the plan pays, per year, often separate for in-network and out-of-network and individual versus family (embedded or aggregate). KFF: an average single deductible of $1,886 among workers with one.
- **Copay.** A fixed amount per service type: a primary care visit, a specialist visit, an emergency room visit. Often not subject to the deductible.
- **Coinsurance.** A percentage of the allowed amount after the deductible: the member pays 20%, the plan 80%.
- **Out-of-pocket maximum.** The most a member pays in a year for in-network covered care. For 2026 Marketplace plans the limit is "No more than $10,600 for an individual or $21,200 for a family" (HealthCare.gov), and premiums, non-covered services, out-of-network care and amounts over the allowed amount don't count toward it.
- **Network tier.** In-network, out-of-network, sometimes a preferred tier. An HMO generally pays nothing out of network except emergencies; a PPO pays less out of network. KFF puts 46% of covered workers in PPOs and 12% in HMOs; 33% are in high-deductible plans with a savings option (HSA or HRA).
- **Covered services and exclusions.** Lists by service category, with limits (visit counts, day counts, age limits) and prior authorization requirements.
- **Plan year and accumulators.** The deductible and out-of-pocket maximum reset on a date, calendar or plan year, and every claim moves the member's running totals ("accumulators"). Which claim was processed first decides who pays what, which is why accumulators are the payer's most contested numbers ([Accumulators](/books/health-tech/payer-operations#accumulators)).

**The allowed amount is the price.** For an in-network claim, the payer pays from its contracted rate (the allowed amount), not the provider's billed charge; the provider writes off the difference and may not bill the patient for it. Out of network, the allowed amount is the payer's own determination, and the provider can balance bill the patient for the rest unless a law forbids it, which the No Surprises Act now does for emergency care and for many out-of-network services at in-network facilities. Every patient responsibility figure a practice shows depends on the allowed amount, which is why price transparency rules require payers to publish their rates ([Transparency in Coverage](/books/health-tech/payer-operations#transparency-in-coverage-files)).

**Medical loss ratio.** Commercial insurers must spend "at least 80% or 85% of premium dollars on medical care" (the percentage depends on the market segment) or pay rebates, which CMS says has applied since 2012. It is one reason insurers integrate vertically: money paid to an owned provider or pharmacy counts as medical spend.

## Networks

A network is the set of providers who signed a contract with the payer to accept its rates. The network is a product of three records, and they drift apart constantly:

- **The contract.** Between the payer and a provider organization (or an independent practice association, or a hospital system), with rate schedules: a percentage of Medicare, a fee schedule by code, per diems, case rates, capitation. The provider side of comparing payments to contracts is [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals).
- **The participation.** Which practitioners at which locations are in which networks of that payer, from which date. A payer may have a dozen networks (commercial PPO, an exchange narrow network, Medicare Advantage HMO, Medicaid) and a practitioner can be in some and not others. Getting a new practitioner into them is credentialing and enrollment.
- **The directory.** What members see. The No Surprises Act requires plans to verify directory information "not less frequently than once every 90 days," update it within 2 business days of receiving changes, and answer a member's network question in writing within 1 business day, and it protects members who relied on a wrong directory from out-of-network cost-sharing (42 U.S.C. 300gg-115). [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment#provider-directories) covers directory accuracy.

**Network adequacy.** Regulators require networks to have enough providers within time and distance standards (Medicare Advantage, Marketplace plans and Medicaid managed care each have their own). Adequacy filings are a payer's reason to keep accurate locations and specialties, and a reason it pays vendors to clean provider data.

**Rental networks and wraps.** A small TPA plan may rent a national PPO network, so the card shows the network's logo beside the administrator's. The practice's contract is with the network, the claim goes to the administrator, and the payment comes from the employer's account. A practice system that records only "the payer" loses which contract priced the claim.

## Coordination of Benefits

A person can have more than one coverage: two employer plans through two spouses, an employer plan and Medicare, Medicare and Medicaid. Coordination of benefits rules decide which pays first. The commercial rules come from the National Association of Insurance Commissioners model regulation adopted by most states (the birthday rule for dependent children, employee before dependent, active before COBRA), and Medicare Secondary Payer rules decide when Medicare pays second (for example behind a large employer's group plan for a working beneficiary). The provider workflow for primary and secondary claims is in [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) and [Remittance & Posting](/books/health-tech/remittance-and-payment-posting); the payer side is that each payer must know about the other coverage to coordinate, which is what the coverage order on `coverages` records. <!-- source-gap: cob-rules | missing | NAIC coordination of benefits model regulation (birthday rule, order of benefit determination) and Medicare Secondary Payer conditions | closes with: NAIC Model Regulation 120 text and CMS Medicare Secondary Payer manual chapter, opened | checked: 2026-10-29 -->

## How to Build It

The core model already has `payers` (with `kind`), `plans` (with `product_type` and `funding`) and `coverages` (with `relationship` and `priority`) from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). On the provider side they are reference data a practice keeps about other companies. A payer platform turns them into its own operating records, with the payer organization as the tenant: the plan has benefit periods, benefits and a network, and the coverage is a member's enrollment ([Inside a Payer](/books/health-tech/payer-operations#how-to-build-it) adds `member_enrollments`). Both sides need the same few facts made explicit:

```sql
ALTER TABLE payers
  ADD COLUMN jurisdiction      TEXT;     -- MAC jurisdiction ('JF') or ISO 3166-2 state for Medicaid

ALTER TABLE plans
  ADD COLUMN erisa             BOOLEAN,  -- private employer plan; decides whether state insurance law reaches it
  ADD COLUMN sponsor_org_id    UUID REFERENCES organizations (id),  -- the employer, for group plans
  ADD COLUMN administrator_id  UUID REFERENCES payers (id),  -- TPA or ASO insurer, if not the payer
  ADD COLUMN situs_state       TEXT,     -- ISO 3166-2: the state whose insurance law applies
  ADD COLUMN market            TEXT CHECK (market IN ('individual', 'small_group',
                                 'large_group', 'medicare', 'medicaid', 'other')),
  ADD COLUMN network_id        UUID;     -- networks, below: what prices the in-network tier

ALTER TABLE coverages
  ADD COLUMN source            TEXT CHECK (source IN ('card', 'eligibility_271',
                                 'enrollment_834', 'manual', 'payer_api')),
  ADD COLUMN cob_basis         TEXT;      -- why this priority: 'birthday_rule', 'msp_working_aged'

CREATE TABLE plan_benefits (             -- one plan's cost-sharing for one benefit period
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the tenant keeping this record
  plan_id          UUID NOT NULL REFERENCES plans (id),
  period           DATERANGE NOT NULL,   -- calendar or plan year; accumulators reset at its start
  service_category TEXT NOT NULL,        -- '*' for plan-level amounts, else 'primary_care',
                                         -- 'specialist', 'er', 'preventive', 'dental_basic',
                                         -- 'dental_major', 'vision_materials'
  network_tier     TEXT NOT NULL CHECK (network_tier IN ('preferred', 'in_network',
                     'out_of_network')),
  deductible_ind   BIGINT,               -- plan-level rows, in cents
  deductible_fam   BIGINT,
  deductible_mode  TEXT CHECK (deductible_mode IN ('embedded', 'aggregate')),
  oop_max_ind      BIGINT,
  oop_max_fam      BIGINT,
  annual_max       BIGINT,               -- dental: the most the plan pays per year
  copay            BIGINT,               -- service rows
  coinsurance_bps  INT CHECK (coinsurance_bps BETWEEN 0 AND 10000),  -- member share
  deductible_applies BOOLEAN,
  limit_kind       TEXT CHECK (limit_kind IN ('visits', 'days', 'units', 'frequency',
                     'dollars')),
  limit_value      INT,
  limit_period     TEXT,                 -- 'plan_year', 'rolling_12m', '6_months', 'lifetime'
  prior_auth       BOOLEAN NOT NULL DEFAULT FALSE,
  covered          BOOLEAN NOT NULL DEFAULT TRUE,
  document_ref     TEXT NOT NULL,        -- the plan document or SBC this row was built from
  EXCLUDE USING GIST (plan_id WITH =, service_category WITH =, network_tier WITH =,
    period WITH &&)
);

CREATE TABLE networks (                  -- a payer's network product
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  payer_id           UUID NOT NULL REFERENCES payers (id),
  name               TEXT NOT NULL,      -- 'Choice Plus', 'Exchange Narrow', 'MA HMO'
  rented_from_org_id UUID REFERENCES organizations (id)  -- a rental PPO
);

CREATE TABLE network_contracts (         -- a provider organization's contract into a network
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the tenant: payer or practice
  network_id       UUID NOT NULL REFERENCES networks (id),
  provider_org_id  UUID NOT NULL REFERENCES organizations (id),  -- the practice, group or IPA
  rate_basis       TEXT NOT NULL CHECK (rate_basis IN ('fee_schedule', 'pct_of_medicare',
                     'pct_of_charges', 'per_diem', 'case_rate', 'capitation')),
  rate_terms       JSONB NOT NULL,       -- {"pct_of_medicare": 115, "year": 2026}
  fee_schedule_id  UUID,                 -- fee_schedules (The Practice Business), for fee schedule rates
  document_id      UUID REFERENCES documents (id),  -- the signed contract
  valid_during     DATERANGE NOT NULL
);
```

Design notes:

- **Funding beside the state.** `plans.funding`, `erisa` and `situs_state` decide which laws apply to a coverage: a state prior authorization or mandate rule is a rule row keyed on state and filtered on funding, never a hard-coded state check ([What Belongs in Data](/docs/architecture/rules-as-data#what-belongs-in-data)).
- **The administrator is not the payer.** A self-funded plan has a sponsor (the employer), an administrator (the TPA or insurer) and a network (possibly rented); the claim routes to the administrator and the contract that priced it hangs off the network. Collapsing them breaks contract lookups and appeals.
- **Benefit periods are versions.** A plan changes every January; cost-sharing is keyed to its period, never edited in place, so last year's claims reprocess under last year's rules.
- **Benefits are rows, not prose.** `plan_benefits` is the structured form of a summary of benefits and coverage. The payer's adjudication engine reads it; a practice platform holds the same shape when it caches what [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) returned from a 271. Where only prose exists (a scanned plan document), the row carries `document_ref` and a person verifies it.
- **The contract is a record on both sides.** The payer loads `network_contracts` to price claims; the practice loads the same contract to check remittances against it in [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals).
- **Coverage order is a fact with a reason.** `coverages.priority` orders primary and secondary; `cob_basis` records why, so a coverage change (a spouse retires onto Medicare) re-evaluates the order instead of guessing.

## Auditing

- **Which benefits priced a claim.** Every adjudicated claim points at the `plan_benefits` rows and contract that applied, so a member appeal or an external review can see the cost-sharing as it was.
- **Coverage history.** Effective dates, terminations, retroactive changes and their source (an 834 enrollment file, a 271, a manual change), because retroactive terminations recoup paid claims months later.
- **Network status at the date of service.** A provider's participation as of the date of service, not today, decides in- or out-of-network; the record keeps the history ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## What This Means for the System You Build

- **Model payer kind, plan funding and situs explicitly,** because ERISA preemption and state insurance law turn on them.
- **Separate sponsor, administrator, network and payer:** the card's logo, the claim's destination and the contract that priced it can be three different companies.
- **Version benefits by period** and store cost-sharing as structured rows with their source document.
- **Treat Medicare and Medicaid as many payers:** MAC jurisdictions, MA plans, each state's program and its MCOs each get their own row and payer ID.
- **Keep dental and vision benefit shapes** (annual maximums, frequencies, allowances) as first-class rule types, not medical rules with odd values.
- **Record network status by date** and the directory's claims about it, because members are protected when the directory is wrong.

## References

**Statutes and regulations**

- [29 U.S.C. 1144: Other laws (Cornell LII)](https://www.law.cornell.edu/uscode/text/29/1144), ERISA preemption, the insurance saving clause and the deemer clause
- [42 U.S.C. 300gg-115: Provider directory information (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/300gg-115), 90-day verification, 2-business-day updates, 1-business-day responses, cost-sharing protection

**Agencies**

- [US Department of Labor: ERISA](https://www.dol.gov/general/topic/health-plans/erisa), what ERISA covers, the grievance and appeals requirement, excluded governmental and church plans
- [CMS: Who are the MACs](https://www.cms.gov/medicare/coding-billing/medicare-administrative-contractors-macs/who-are-macs), A/B MACs by jurisdiction, 12 A/B and 4 DME MAC jurisdictions
- [Medicaid.gov: Managed care](https://www.medicaid.gov/medicaid/managed-care), managed care as capitated contracts with MCOs, 42 CFR Part 438
- [HealthCare.gov: Out-of-pocket maximum/limit](https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/), the 2026 limit of $10,600 and $21,200 and what counts toward it
- [CMS: Medical loss ratio](https://www.cms.gov/marketplace/private-health-insurance/medical-loss-ratio), the 80% or 85% standard and rebates since 2012
- [FTC: Interim staff report on prescription drug middlemen (July 9, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-releases-interim-staff-report-prescription-drug-middlemen), PBMs vertically integrated with the largest insurers

**Market data**

- [KFF: 2025 Employer Health Benefits Survey](https://www.kff.org/health-costs/report/2025-employer-health-benefits-survey/), premiums, worker contributions, 67% self-funded, 33% HDHP/SO, PPO and HMO shares, average deductible
- [KFF: Medicare Advantage in 2026, enrollment update and key trends](https://www.kff.org/medicare/medicare-advantage-in-2026-enrollment-update-and-key-trends/), 35.2 million enrollees and 55% penetration, UnitedHealth and Humana shares, SNP and group enrollment (June 5, 2026)

**In practice**

- [Delta Dental: About us](https://www.deltadental.com/us/en/about-us.html), 39 independent companies and the plan types
- [Cognizant TriZetto](https://www.cognizant.com/us/en/trizetto), Facets and QNXT, 200 million+ members served
- [Gainwell Technologies](https://www.gainwelltechnologies.com/), Medicaid enterprise systems, 70% of Medicaid and CHIP enrollees supported
