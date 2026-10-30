+++
title = "Inside a Payer"
description = "How a health plan runs: enrollment, claims adjudication, accumulators, utilization management, appeals, CMS payer APIs, TiC files and fraud, waste and abuse."
category = "Health Tech Industry"
order = 1952
part = "Payers"
tags = ["health-tech", "payers", "adjudication", "utilization-management", "interoperability", "price-transparency", "data-model"]
+++

Every claim a practice sends ends up in a payer's core administrative processing system, a claims engine that has to answer, for one line on one date of service, five questions in order: is this person covered, is this provider in the network, is this service covered under this plan, what is it worth under the contract, and how much of it does the member owe given everything else they've had this year. Most claims are answered with no person looking; the rest pend for an examiner, a nurse or a fraud analyst. Around the engine sit the other payer operations: enrollment files from employers and governments, utilization management that decides on requests before care, member services, grievances and appeals, provider services, payment integrity, and since 2021 a growing list of federally required APIs and public price files.

This chapter is the payer's view of operations the [Revenue Cycle](/books/health-tech/revenue-cycle) part sees from the practice: the practice's claim is the payer's input, the payer's adjudication is the practice's remittance, and the payer's utilization review is the practice's prior authorization. [Claims](/books/health-tech/claims), [Remittance & Posting](/books/health-tech/remittance-and-payment-posting), [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals) and [Prior Authorization](/books/health-tech/prior-authorization) cover the provider workflow; this chapter covers what the payer must do and record. The kinds of payer and plan design are [Payers & Plans](/books/health-tech/payers-and-plans); the network data feeding adjudication is [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment); pharmacy claims run through a PBM in [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits).

## How the Platforms Do It

As of October 2026, from vendor pages and CMS:

| System | Vendor | What its public pages describe |
| --- | --- | --- |
| **Facets and QNXT** | Cognizant TriZetto | The core administration systems; reimbursement (NetworX Pricer and Modeler), government program modules (enrollment, encounter data, risk scores), care management including "Touchless Authorization Processing," FHIR prior authorization, a payer clearinghouse; "200 million+" members and "200+" health plans |
| **HealthRules Edge** (formerly HealthRules Payer) | HealthEdge | "A cloud-native solution that powers accurate, efficient claims administration," with AI in claims workflows aimed at auto-adjudication; add-ons for care management, payment accuracy and provider data |
| **Gainwell Enterprise** | Gainwell Technologies | Medicaid claims, encounters and financials; says it supports 70% of Medicaid and CHIP enrollees |
| **Medicare Administrative Contractors** | CMS contractors | Process Medicare Part A and B claims for 12 A/B jurisdictions; 4 DME MAC jurisdictions handle equipment and supplies |
| **Payment integrity vendors** | Many | Pre-pay and post-pay claim review, coordination of benefits recovery, data mining; sold as a percentage of savings |

Three patterns:

- **Configuration is the product.** A core system is generic; the plan's benefits, the network's contracts, the pricing rules and the edits are configuration loaded by the payer's own staff. A plan's correctness depends on that configuration matching the plan document, which is why benefit configuration is a job title.
- **The engine is old and the edges are new.** Core systems date from the 1990s and 2000s; around them payers have bolted portals, FHIR APIs, AI review tools and price transparency pipelines, each reading the same claims and membership data.
- **Government business adds its own modules.** Medicare Advantage and Medicaid plans submit encounter data and risk adjustment data back to CMS or the state, and their Star Ratings and quality measures depend on it, so TriZetto's government modules (enrollment reconciliation, encounter data, risk scores) exist as separate products.

## Enrollment and Membership

A payer learns who it covers from enrollment, not from claims:

- **Employer groups** send the X12 834 benefit enrollment file (or a spreadsheet, for small groups) with adds, changes and terminations; premium payments arrive as an 820 or a bank transfer.
- **Marketplace issuers** receive 834s from the exchange.
- **Medicare Advantage and Part D plans** enroll members and reconcile monthly with CMS, which pays a capitated amount per member adjusted for risk.
- **Medicaid managed care plans** receive the state's enrollment file and capitation. That is most of Medicaid: CMS counts 67.9 million of about 87 million Medicaid enrollees in comprehensive MCOs as of July 1, 2024, and over 73 million (84.8%) in some form of managed care.

Membership is retroactive by nature. An employer reports a termination dated two months ago; a Medicaid member's eligibility is redetermined backward; a newborn is added from the birth date. Every retroactive change can make paid claims unpayable (and recouped from the provider) or denied claims payable (and reprocessed), so enrollment is append-only history with effective ranges, never a current-state flag.

Member ID cards come from enrollment, and the member ID on the card is the key the practice's eligibility check and claim carry back. [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) covers the 270/271 from the practice's side; the payer answers it from the same membership and `plan_benefits` data the claims engine uses.

## Claims Adjudication

A claim arrives as an 837 (through a clearinghouse), is acknowledged (999, then 277CA), and enters adjudication. The stages, as configured in most core systems:

1. **Front-end edits.** Format and validity: member ID found, provider NPI and TIN found, codes valid for the date, required fields present. Failures reject to the submitter without a claim number.
2. **Eligibility.** Was the member covered on each line's date of service, under which plan and benefit period? Coordination of benefits: is there other coverage that pays first?
3. **Provider and network.** Is the rendering and billing provider enrolled and in the plan's network at that location and date? The answer chooses in- or out-of-network benefits and the pricing source.
4. **Benefits.** Is the service covered for this member, within limits (visits, frequencies), with prior authorization on file where required? This step reads the plan's benefit configuration.
5. **Clinical and coding edits.** National Correct Coding Initiative pairs and medically unlikely edits, modifiers, age and gender edits, the payer's own edits, and policy rules (an MA plan applies Medicare's coverage determinations).
6. **Pricing.** The allowed amount from the provider's contract (fee schedule, percentage of Medicare, case rate) or, out of network, the payer's out-of-network method; then any multiple-procedure reductions.
7. **Cost-sharing.** Deductible, copay and coinsurance applied against the member's accumulators, in the order claims are processed.
8. **Payment.** The payer's share is paid to the provider (or the member, for an out-of-network claim without assignment) in a payment cycle, with an 835 remittance and an explanation of benefits to the member.

**Auto-adjudication versus pend.** A claim that clears every step without a human is auto-adjudicated; one that hits a configured pend reason (a missing authorization, an unclear COB, a high dollar amount, a suspected duplicate, a code needing records) goes to a queue. Vendors sell higher auto-adjudication as their main metric because each pended claim costs examiner time and delays payment against prompt pay deadlines; HealthEdge, for instance, markets "99% accuracy in claims payment." State prompt pay laws set how fast a clean claim must be paid by a fully insured plan, with interest after the deadline, and the numbers differ by state. In New York, for example, an insurer or HMO pays an undisputed claim "within thirty days of receipt" if submitted electronically and within forty-five days for paper or fax, and owes interest at the greater of the rate the state's tax commissioner sets for corporate taxes or "twelve percent per annum" from the due date (Insurance Law 3224-a). A claims system stores the deadline and interest rule per state and line of business, and starts the clock at receipt.

**The member's claim clock.** For ERISA plans the claims procedure regulation sets decision deadlines: urgent care "not later than 72 hours after receipt of the claim by the plan," pre-service claims within 15 days, post-service claims within 30 days, each extendable once by 15 days; appeals within 72 hours (urgent), 30 days (pre-service, one level) and 60 days (post-service, one level) (29 CFR 2560.503-1). A "pre-service claim" is one where the plan's terms make the benefit depend on approval "in advance of obtaining medical care," which is how utilization management decisions fall under the same clock.

### Accumulators

Accumulators are the member's running totals for the benefit period: deductible met, out-of-pocket spent, visits used, dental maximum consumed, per individual and per family, in network and out. Three properties make them hard:

- **Order matters.** Two claims for the same member processed in a different order produce different payer and member shares, because the deductible is consumed by whichever adjudicates first. The engine processes by receipt, and a later reprocessing (a corrected claim, a retro enrollment change) has to replay the accumulator.
- **They are shared across vendors.** The medical plan, the PBM and sometimes a behavioral health carve-out each adjudicate their own claims, and a plan with a combined deductible must exchange accumulator updates between them, usually in daily files. A stale exchange is why a member's pharmacy copay can be wrong for days.
- **They reset.** The period boundary (January 1 or the plan year date) resets them, except for carryover features some dental plans have.

My rule: accumulators are a ledger of entries per claim line, and the running total is a sum, exactly like a patient ledger ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)). A replay is reversing entries and new entries, never an edited total.

## Utilization Management

Utilization management is the payer deciding whether care is medically necessary and covered before or after it happens: prior authorization (pre-service), concurrent review (during an inpatient stay) and retrospective review. The provider's half of prior authorization (the 278, Da Vinci, ePA in pharmacy, gold carding) is [Prior Authorization](/books/health-tech/prior-authorization); the payer's half is a clinical review operation with its own rules.

**The review.** A request arrives by portal, fax, phone, 278 or FHIR API; intake checks eligibility and whether the service needs authorization at all; a nurse reviewer applies medical necessity criteria (commercial criteria sets such as InterQual or MCG, or the payer's own); approvals can be made by nurses, but a denial for medical necessity generally goes to a physician or appropriate clinical reviewer; the decision goes back with a reason and appeal rights.

**Medicare Advantage limits.** CMS's 2024 rule (CMS-4201-F, issued April 5, 2023) requires MA plans to follow Traditional Medicare coverage rules including "national coverage determinations (NCD), local coverage determinations (LCD)," to use internal criteria only where Medicare's are not fully established and base them on "current evidence in widely used treatment guidelines" made publicly available, to use prior authorization only to confirm diagnoses or medical criteria and medical necessity, to keep an approved course of treatment valid "as long as medically reasonable and necessary," to give a minimum 90-day transition during which a new plan may not require prior authorization for an active course of treatment, and to have a "Utilization Management Committee" review policies annually.

**CMS-0057-F decision times.** From January 1, 2026, impacted payers (Medicare Advantage, Medicaid and CHIP fee for service and managed care) must send prior authorization decisions within 72 hours for expedited requests and seven calendar days for standard requests, give a specific denial reason however the request was submitted, and publicly post prior authorization metrics annually, the first set due by March 31, 2026. Marketplace issuers on the federal exchange are subject to the reason and API rules but not the decision timeframes.

**Drugs next.** On April 14, 2026, CMS proposed extending the electronic prior authorization requirements to drugs for the same payers (Exchange QHP issuers included), with FHIR implementation guides and API reporting; as of October 2026 it is a proposed rule.

**State laws.** Many states regulate prior authorization for fully insured plans (decision deadlines, gold carding, reviewer qualifications, limits on AI-only denials); [Industry Commitments and Gold Carding](/books/health-tech/prior-authorization#industry-commitments-and-gold-carding) covers them. They don't reach self-funded ERISA plans, which is why a rules engine needs `plans.funding` ([Payers & Plans](/books/health-tech/payers-and-plans#how-to-build-it)).

## Member Services, Grievances and Appeals

Member services answers calls and messages about coverage, claims, ID cards and network status; under the No Surprises Act a network status question must be answered in writing within 1 business day ([Provider Directories](/books/health-tech/credentialing-and-enrollment#provider-directories)). Two kinds of complaint have separate legal tracks:

- **A grievance** is a complaint about service or quality (a rude call, a long wait).
- **An appeal** asks the plan to reverse an adverse benefit determination (a denied claim or authorization). ERISA plans decide appeals on the clocks above, with full and fair review; ACA rules add external review by an independent reviewer for non-grandfathered plans; Medicare Advantage has its own levels, from plan reconsideration to an independent review entity and beyond, which [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals) covers from the provider's side.

Every appeal file has to be reproducible: the claim as adjudicated, the benefits and criteria used, the clinical records reviewed, who decided and when, and every notice sent.

## Payer APIs

CMS rules have made the payer a FHIR API publisher. As of October 2026:

| API | Rule | Who must offer it | What it carries | Date |
| --- | --- | --- | --- | --- |
| **Patient Access** | CMS-9115-F (2020) | MA, Medicaid and CHIP (FFS and managed care), QHP issuers on the federal exchange | "claims and encounter information, including cost," and clinical data (USCDI), to apps the patient chooses | January 1, 2021; prior authorization data added from January 1, 2027 (CMS-0057-F); usage metrics reported from 2026 |
| **Provider Directory** | CMS-9115-F | MA, Medicaid and CHIP (not exchange QHPs, which already publish machine-readable directories) | Public directory data, no authentication | January 1, 2021 |
| **Provider Access** | CMS-0057-F (2024) | The same impacted payers | Claims and encounter data (without remittances or cost-sharing), USCDI data and prior authorization information, to in-network providers with a treatment relationship; patients may opt out | January 1, 2027 |
| **Payer-to-Payer** | CMS-0057-F | The same impacted payers | Claims, encounter, USCDI and prior authorization data within five years, when a member opts in, from previous to new payer | January 1, 2027 (the 2020 rule's earlier payer-to-payer exchange began January 1, 2022) |
| **Prior Authorization** | CMS-0057-F | The same impacted payers | Covered items and services, documentation requirements, requests and responses with approval, denial reason or request for information | January 1, 2027 |

Two implementation consequences. First, **attribution** becomes a data product: the Provider Access API needs a list of which providers have a treatment relationship with which members, kept current and honoring opt-outs. Second, **HIPAA and FHIR coexist**: HHS said it will use enforcement discretion so a payer with an all-FHIR Prior Authorization API that doesn't use the X12 278 is not penalized under HIPAA administrative simplification, while X12-only transactions remain allowed. The FHIR profiles and app authorization are the subject of [FHIR](/books/health-tech/fhir) and [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir).

## Transparency in Coverage Files

Since July 1, 2022, most group health plans and issuers must post "machine-readable files" on a public website: in-network rates for covered items and services, and allowed amounts and historical billed charges for out-of-network providers (CMS). The files are large enough that, in CMS's words, specific technology may be needed to read them, and the Departments "play no active role in publishing the files." A consumer cost estimator for members (the price comparison tool) is part of the same rule.

A new Transparency in Coverage final rule was published October 6, 2026 and takes effect December 7, 2026. It adds data elements (product type, provider network name and identifier) and contextual files, changes the aggregation level and reduces the reporting cadence for the in-network and out-of-network files, lengthens the out-of-network reporting period and lowers its claims threshold, improves findability of every file "including the prescription drug file" with a text file and footer links, and requires pricing information to be available by phone. CMS's page says the "Price Transparency" or "Transparency in Coverage" footer link becomes required starting October 1, 2027.

For a payer, the TiC pipeline is a monthly batch over contracts and claims that produces terabytes of JSON; for everyone else, the files are a data source (rate benchmarking, network analysis, the hospital-side files compared in [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience)). For a practice, the published rates are its own contracts made public.

## Fraud, Waste and Abuse

Payers run special investigation units and payment integrity programs because a claims engine pays what is billed if it passes the edits. The work:

- **Pre-pay edits and review**: coding edits, duplicate detection, provider flags, records requests on suspect claims.
- **Post-pay review and recovery**: data mining for outliers, audits, overpayment recoveries (recoupments, which reach the practice as negative remittance lines).
- **Exclusion screening**: payments for items or services furnished, ordered or prescribed by a party on the OIG's List of Excluded Individuals/Entities are not payable by federal health care programs, and contracting with an excluded party exposes the plan to penalties, so payers screen providers against the LEIE and state lists continuously.
- **Program integrity duties** for Medicare Advantage and Medicaid plans, written into CMS rules and state contracts, including reporting and compliance programs.

The provider's half (upcoding enforcement, the False Claims Act, compliance programs) is [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation).

## How to Build It

On a payer platform the payer organization is the tenant: `organization_id` on every row is the plan's own. The core `coverages` row is the member's coverage under a plan; this chapter adds enrollment history, adjudication results with their accumulator effects, and utilization reviews:

```sql
CREATE TABLE member_enrollments (        -- enrollment history behind a coverage, from 834s and CMS files
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the payer
  coverage_id     UUID NOT NULL REFERENCES coverages (id),
  sponsor_org_id  UUID REFERENCES organizations (id),  -- the employer group, the state, CMS
  action          TEXT NOT NULL CHECK (action IN ('add', 'change', 'term', 'reinstate',
                    'audit')),
  effective_on    DATE NOT NULL,          -- often in the past: retro changes are normal
  source          TEXT NOT NULL CHECK (source IN ('x12_834', 'cms_mmr', 'state_file',
                    'portal', 'manual')),
  source_ref      TEXT NOT NULL,          -- file name and line, or transaction ID
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE adjudications (             -- one adjudication of one received claim; reprocessing adds a row
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  claim_id         UUID NOT NULL REFERENCES claims (id),  -- the claim as received from the provider
  sequence         SMALLINT NOT NULL,     -- 1 for the original, 2+ for reprocessing
  reason           TEXT NOT NULL CHECK (reason IN ('original', 'corrected_claim', 'appeal',
                     'retro_eligibility', 'contract_update', 'recovery')),
  status           TEXT NOT NULL CHECK (status IN ('pended', 'paid', 'denied', 'partial',
                     'reversed')),
  pend_reasons     TEXT[] NOT NULL DEFAULT '{}',
  auto_adjudicated BOOLEAN NOT NULL,
  network_tier     TEXT CHECK (network_tier IN ('preferred', 'in_network', 'out_of_network')),
  contract_id      UUID REFERENCES network_contracts (id),  -- what priced it
  lines            JSONB NOT NULL,        -- per line: allowed, plan paid, member share by bucket,
                                          -- CARC/RARC, the plan_benefits row and edits applied
  decided_by       TEXT NOT NULL,         -- typed actor: engine version, examiner, clinical reviewer
  decided_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (claim_id, sequence)
);

CREATE TABLE accumulator_entries (       -- the member's running totals, as a ledger
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  coverage_id      UUID NOT NULL REFERENCES coverages (id),
  family_key       TEXT NOT NULL,         -- subscriber and plan: family totals sum on this
  period           DATERANGE NOT NULL,    -- the benefit period it counts toward
  bucket           TEXT NOT NULL CHECK (bucket IN ('deductible', 'oop', 'visits',
                     'annual_max', 'lifetime')),
  network_tier     TEXT NOT NULL,
  amount           BIGINT NOT NULL,       -- cents, or units for visit buckets; negative reverses
  adjudication_id  UUID REFERENCES adjudications (id),
  source           TEXT NOT NULL CHECK (source IN ('medical', 'pbm', 'carve_out',
                     'prior_carrier', 'manual')),  -- PBM and carve-out files feed it too
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX accumulator_entries_member_idx
  ON accumulator_entries (coverage_id, bucket, network_tier, period);

CREATE TABLE utilization_reviews (       -- a pre-service, concurrent or retrospective review
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  coverage_id       UUID NOT NULL REFERENCES coverages (id),
  requesting_npi    CHAR(10) NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('prior_auth', 'concurrent', 'retrospective')),
  urgency           TEXT NOT NULL CHECK (urgency IN ('expedited', 'standard')),
  channel           TEXT NOT NULL CHECK (channel IN ('x12_278', 'fhir_pas', 'portal', 'fax',
                      'phone')),
  services          JSONB NOT NULL,       -- codes, units, dates requested
  received_at       TIMESTAMPTZ NOT NULL,
  due_at            TIMESTAMPTZ NOT NULL, -- computed: 72 hours or 7 days, or the state's or ERISA's clock
  due_rule_ref      TEXT NOT NULL,        -- which rule set due_at
  criteria_ref      TEXT,                 -- the criteria set and version applied
  status            TEXT NOT NULL CHECK (status IN ('intake', 'pended_info', 'clinical_review',
                      'physician_review', 'approved', 'partially_approved', 'denied',
                      'withdrawn')),
  decision_reason   TEXT,                 -- required for denials, whatever the channel
  decided_by        TEXT,                 -- the reviewer, with credentials
  decided_at        TIMESTAMPTZ,
  valid_during      DATERANGE,            -- approved course of treatment
  provider_request_ref TEXT               -- the provider side's prior authorization ID, echoed
);
```

The running deductible for a member, and the replay of one claim:

```sql
-- Deductible met so far, in network, this period.
SELECT COALESCE(SUM(amount), 0)
FROM accumulator_entries
WHERE coverage_id = $1 AND bucket = 'deductible' AND network_tier = 'in_network'
  AND period @> $2::date;

-- Reprocessing: reverse the previous adjudication's entries, then post the new ones.
INSERT INTO accumulator_entries (organization_id, coverage_id, family_key, period, bucket,
  network_tier, amount, adjudication_id, source)
SELECT organization_id, coverage_id, family_key, period, bucket, network_tier, -amount, $2,
  source
FROM accumulator_entries
WHERE adjudication_id = $1;               -- $1 the superseded adjudication, $2 the new one
```

Design notes:

- **Adjudication is a version, never an edit.** A reprocessed claim gets a new `adjudications` row with its reason; the 835 to the provider carries the reversal and the new result, and the practice's remittance posting sees both.
- **Every line records what decided it:** the benefit row, the contract, the edits and the engine version, so an appeal or a regulator can reproduce the decision ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Clocks are computed and stored.** `utilization_reviews.due_at` comes from the strictest applicable rule (CMS-0057-F, a state law for insured plans, ERISA's claims regulation) with the rule recorded, and the annual public metrics are a query over these rows ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Automated decisions are attributed.** An auto-adjudicated denial or an AI-assisted review records the model or rule version and the human, if any, who confirmed it ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **APIs read the same records.** The Patient Access, Provider Access and Payer-to-Payer APIs are FHIR views over `adjudications`, `utilization_reviews` and clinical data, with attribution and opt-in or opt-out recorded as `consents` rows.

## Auditing

- **Decision reproducibility:** each adjudication with its inputs, configuration versions and actor; each utilization review with criteria, records reviewed, reviewer credentials, timestamps against its clock, and the notice sent.
- **Access to member data:** reads by staff, vendors and API clients, with the client application and the member's consent or opt-out state at the time ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Enrollment history** with each file and line that changed it, because retroactive terminations drive recoupments and disputes.
- **Published files:** each TiC file version with its generation date and inputs, and each prior authorization metrics posting.

## What This Means for the System You Build

- **Run adjudication as a staged pipeline** (edits, eligibility, network, benefits, coding, pricing, cost-sharing) and record which stage and rule decided every line.
- **Keep accumulators as a ledger** fed by medical, PBM and carve-out claims, with replay by reversal.
- **Treat enrollment as retroactive history,** and reprocess claims when it changes.
- **Compute utilization management clocks from the applicable rule** (federal program, state insured market, ERISA) and require a specific reason on every denial.
- **Build the CMS APIs over the operational records,** with provider attribution and member opt-in or opt-out as data.
- **Treat TiC files as a regulated publication** with versions, inputs and a schedule, and plan for the December 2026 changes.
- **Screen providers against exclusion lists continuously** and route suspect claims to payment integrity before payment, not only after.

## References

**Regulations and rules**

- [CMS: Interoperability and Prior Authorization final rule fact sheet (CMS-0057-F)](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), impacted payers, Patient Access, Provider Access, Payer-to-Payer and Prior Authorization APIs, 72-hour and 7-day decision times from 2026, denial reasons, metrics by March 31, 2026, X12 278 enforcement discretion
- [CMS: Interoperability and Patient Access fact sheet (CMS-9115-F)](https://www.cms.gov/newsroom/fact-sheets/interoperability-and-patient-access-fact-sheet), Patient Access and Provider Directory APIs from January 1, 2021, payer-to-payer exchange from January 1, 2022
- [CMS: 2024 Medicare Advantage and Part D final rule fact sheet (CMS-4201-F)](https://www.cms.gov/newsroom/fact-sheets/2024-medicare-advantage-and-part-d-final-rule-cms-4201-f), Traditional Medicare coverage criteria, public internal criteria, prior authorization limits, course-of-treatment validity, 90-day transition, UM committee
- [29 CFR 2560.503-1: Claims procedure (Cornell LII)](https://www.law.cornell.edu/cfr/text/29/2560.503-1), ERISA decision and appeal deadlines, pre-service and post-service claim definitions
- [New York Insurance Law 3224-a: Standards for prompt, fair and equitable settlement of claims](https://www.nysenate.gov/legislation/laws/ISC/3224-A), 30 days electronic and 45 days paper, interest at the greater of the commissioner's corporate tax rate or 12% a year
- [Federal Register: Interoperability Standards and Prior Authorization for Drugs, proposed rule (April 14, 2026)](https://www.federalregister.gov/documents/2026/04/14/2026-07205/medicare-and-medicaid-programs-patient-protection-and-affordable-care-act-interoperability-standards), electronic prior authorization for drugs, API reporting, FHIR implementation guides
- [Federal Register: Transparency in Coverage final rule (October 6, 2026)](https://www.federalregister.gov/documents/2026/10/06/2026-20447/transparency-in-coverage), new data elements and contextual files, aggregation and cadence changes, findability, phone access alongside the existing online self-service tool, effective December 7, 2026
- [CMS: Use pricing information published under the Transparency in Coverage final rule](https://www.cms.gov/priorities/healthplan-price-transparency/overview/use-pricing-information-published-under-transparency-coverage-final-rule), machine-readable files since July 1, 2022, the Departments' role, the footer link from October 1, 2027

**Agencies**

- [CMS: Who are the MACs](https://www.cms.gov/medicare/coding-billing/medicare-administrative-contractors-macs/who-are-macs), A/B and DME MAC jurisdictions
- [HHS OIG: Exclusions](https://oig.hhs.gov/exclusions/), the LEIE, the effect of exclusion, CSV and monthly supplements
- [Medicaid.gov: Medicaid Managed Care Enrollment and Program Characteristics, 2024 (Winter 2026)](https://www.medicaid.gov/medicaid/managed-care/downloads/2024-medicaid-managed-care-enrollment-report.pdf), about 87 million enrollees, over 73 million (84.8%) in managed care and 67.9 million in comprehensive MCOs as of July 1, 2024

**In practice**

- [Cognizant TriZetto](https://www.cognizant.com/us/en/trizetto), Facets and QNXT, reimbursement, government program and care management modules, members and plans served
- [HealthEdge](https://healthedge.com/), HealthRules Edge claims administration and add-ons
- [Gainwell Technologies](https://www.gainwelltechnologies.com/), Medicaid claims, encounters and financials
