+++
title = "Value-Based Care & Quality"
nav_title = "Value-Based Care"
description = "Paying for outcomes: MIPS, APMs, the Shared Savings Program, ACO REACH and LEAD, Medicare Advantage, risk adjustment, HEDIS and eCQMs, and what to capture."
category = "Health Tech Industry"
order = 1928
part = "Revenue Cycle"
tags = ["health-tech", "value-based-care", "mips", "aco", "risk-adjustment", "quality-measures", "data-model"]
+++

Fee for service pays for each thing done; value-based care pays, at least partly, for how patients do and what their care costs. In practice it is a set of programs layered on top of fee-for-service claims rather than a replacement for them. Medicare adjusts every clinician's fee schedule payments up or down by a quality score (MIPS). Groups of providers form accountable care organizations that share in savings when their patients' total cost comes in under a benchmark and their quality measures pass. Medicare Advantage plans, which now cover more than half of eligible Medicare beneficiaries, are paid a risk-adjusted amount per member, and pass some of that risk to the practices they contract with. Commercial payers run their own versions, scored on NCQA's HEDIS measures. A small practice may meet all of these in one year: a MIPS submission, an ACO's quality reporting, an MA plan's gap-closure list and a commercial bonus tied to HEDIS rates.

The software consequence is that the claim stops being the only output. Value-based programs are computed from data that claims carry badly or not at all: which patients a clinician is accountable for (attribution), whether a measure's numerator was met (a blood pressure under control, a screening done), how sick the patient population is (risk adjustment from documented diagnoses), and what the whole population cost. Each program defines its measures precisely, changes them every year, and audits the data behind them. This chapter covers MIPS and the Quality Payment Program, alternative payment models, the Shared Savings Program, ACO REACH and its successor, Medicare Advantage and risk adjustment, HEDIS and eCQMs, and what a system must capture. It extends `patients`, `conditions`, `encounters` and `observations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model); how the money flows under value-based arrangements in general is [Value-Based Payment and Capitation](/books/health-tech/health-tech-business#value-based-payment-and-capitation).

## How the Platforms Do It

As of October 2026, from CMS's and the measure stewards' pages:

| Program | Who participates | How it pays | Status |
| --- | --- | --- | --- |
| **MIPS** (Merit-based Incentive Payment System) | Eligible clinicians billing Medicare Part B | A positive, neutral or negative adjustment to Part B payments two years later, from a score across quality, cost, improvement activities and promoting interoperability | Performance threshold held at 75 points for the 2026, 2027 and 2028 performance periods |
| **Advanced APMs** | Clinicians in models with downside risk who meet participation thresholds (qualifying APM participants) | From 2026, a separate, higher conversion factor: $33.57 for qualifying participants versus $33.40 | In effect for 2026 |
| **Medicare Shared Savings Program** | ACOs of clinicians and hospitals, with traditional Medicare patients | Shared savings (and, in two-sided tracks, losses) against a benchmark, gated by quality | 511 ACOs with more than 700,000 providers and organizations and 12.6 million people in 2026 |
| **ACO REACH** | ACOs in a CMS Innovation Center model | Capitation and risk-sharing options | Final performance year 2026; 74 ACOs participating in 2026 |
| **LEAD** (Long-term Enhanced ACO Design) | ACOs | "a successor to the ACO REACH Model" | Announced; runs January 1, 2027 to December 31, 2036 |
| **Ambulatory Specialty Model** | Cardiologists for heart failure; several specialties for low back pain | Mandatory specialist accountability | January 1, 2027 to December 31, 2031 |
| **Medicare Advantage** | Private plans | Risk-adjusted payments per member; plans contract with providers in many ways | 35.2 million enrollees in 2026, 55% of eligible beneficiaries (KFF) |
| **HEDIS** (NCQA) | Health plans, measured on their members' care | Plan ratings, accreditation, and the measures commercial contracts pay on | "more than 90 measures" across six domains |

Three patterns:

- **Everything is a measure over a population.** Every program defines who is in the denominator, what counts in the numerator, and the exclusions, and changes them yearly.
- **Accountability needs attribution.** Shared savings, MA contracts and HEDIS all start by deciding which patients belong to which clinician or organization, from claims or enrollment, and the answer differs by program.
- **Diagnoses are money.** Risk adjustment pays more for sicker populations based on documented diagnoses, which makes diagnosis capture both a revenue line and an enforcement focus.

## MIPS and the Quality Payment Program

The Quality Payment Program (QPP), created by MACRA in 2015, has two tracks: MIPS for most clinicians, and the Advanced APM track for those in risk-bearing models.

**MIPS** scores each clinician (individually, as a group, or through an APM entity) in four performance categories: **quality** (measures the clinician selects and reports), **cost** (computed by CMS from claims), **improvement activities** (attested practice improvements) and **promoting interoperability** (use of certified EHR technology, measured by objectives such as e-prescribing and health information exchange). By regulation the categories weigh 30%, 30%, 15% and 25% of the final score, in that order, unless CMS reweights a category that can't be scored (42 CFR 414.1330, 414.1350, 414.1355 and 414.1375). The final score, compared with the performance threshold, sets a payment adjustment applied two years later. In the 2026 physician fee schedule rule, CMS kept the threshold "at 75 points for the 2028, 2029, and 2030 MIPS payment years," that is, the 2026, 2027 and 2028 performance periods.

**MIPS Value Pathways** (MVPs) are specialty-specific bundles of measures and activities meant to replace free choice from the whole catalog. CMS proposed six new MVPs for 2026 (diagnostic radiology, interventional radiology, neuropsychology, pathology, podiatry and vascular surgery), finalized through the rule's MVP inventory. From the 2027 performance period, MIPS adds an "Electronic Prior Authorization" measure under promoting interoperability ([CMS-0057-F](/books/health-tech/prior-authorization#cms-0057-f)).

**How data gets to CMS.** Quality measures can be reported as eCQMs (computed by certified EHRs from structured data), as MIPS clinical quality measures through a registry, as Medicare Part B claims measures for small practices, or as Medicare CQMs for ACOs. Promoting interoperability requires certified EHR technology. A practice's PMS or EHR either submits directly or exports to a registry, so the data model has to support the measure specifications the practice chose.

For specialty practices in this volume's priority part: physical therapists, occupational therapists and several other non-physician clinicians are MIPS-eligible clinician types, and small practices have lower-burden reporting options; dental and veterinary practices sit outside MIPS entirely, because MIPS adjusts Medicare Part B payments.

## Alternative Payment Models

An alternative payment model (APM) pays for a population or an episode rather than for each service. CMS's models come from the Innovation Center, and the ones with enough downside risk count as Advanced APMs. Since 2026, clinicians who meet the participation thresholds in an Advanced APM (qualifying APM participants) are paid from a separate, higher conversion factor than everyone else; CMS's 2026 rule sets $33.57 for qualifying participants and $33.40 for others, each up from $32.35.

The shapes, from mildest to most transformative:

- **Bundled and episode payments:** a target price for an episode (a joint replacement, a condition over a period), reconciled against actual spending.
- **Specialty accountability:** the Ambulatory Specialty Model, mandatory from January 1, 2027 to December 31, 2031, holds cardiologists accountable for heart failure care and anesthesiologists, pain specialists, neurosurgeons, orthopedic surgeons and physical medicine physicians for low back pain.
- **Population models:** ACOs, below, and primary care capitation.

## ACOs: The Shared Savings Program, REACH and LEAD

An accountable care organization is a group of providers that takes responsibility for the total cost and quality of care for an assigned population of traditional Medicare beneficiaries. The **Medicare Shared Savings Program** (MSSP) is the permanent program: "a voluntary program that encourages groups of doctors, hospitals, and other health care providers" to form ACOs, accountable for the "quality, cost, and experience of care" of their assigned patients, sharing in savings against a benchmark if they meet quality standards. For performance year 2026 it has 511 ACOs, up from 476 in 2025, with more than 700,000 providers and organizations serving 12.6 million people with traditional Medicare. Changes in the 2026 rule that reach software:

- **Collection types.** Several core quality measures (diabetes, depression screening, blood pressure control, breast cancer screening) can be reported as eCQMs, MIPS CQMs or Medicare CQMs for 2025 and 2026, and from 2027 only as eCQMs or Medicare CQMs, which pushes ACOs toward aggregating structured data across every participant's EHR.
- **Measure changes.** Colorectal cancer screening and a risk-standardized admissions measure phase in for 2026; the social drivers of health screening measure is removed from the APP Plus set; the health equity adjustment to quality scores ends from 2026.
- **Assignment.** Behavioral health integration and psychiatric collaborative care add-on services count as primary care for assignment from January 1, 2026.
- **Small ACOs.** For agreement periods from 2027, ACOs with fewer than 5,000 assigned beneficiaries face limits on track choice and caps on shared savings and losses.

**ACO REACH** is the Innovation Center model for ACOs taking more risk, including capitation; it runs performance years 2023 through 2026, with 74 ACOs in its final year. Its successor, **LEAD** (Long-term Enhanced ACO Design), is "a successor to the ACO REACH Model" announced to run from January 1, 2027 to December 31, 2036.

For a practice inside an ACO, the ACO is a second customer for the practice's data: it wants every attributed patient's visits, diagnoses, screenings and vitals, usually through a data feed or an integration with its population health platform, and sends back care gap lists. The practice's own system needs to know which patients are attributed to which ACO, since the ACO's quality score depends on those patients' measures.

## Medicare Advantage and Risk Adjustment

Medicare Advantage (MA) plans are private plans paid a monthly amount per member by CMS, risk-adjusted so that a plan enrolling sicker people is paid more. In 2026, 35.2 million people, 55% of eligible Medicare beneficiaries, were in MA plans, per KFF's analysis of CMS enrollment data. MA plans pay providers by fee schedule, by capitation, or through shared-risk arrangements, and they pass their quality incentives (the plan's star ratings, built partly on HEDIS) down to practices as gap-closure programs.

**Risk adjustment.** CMS computes each member's risk score from demographics and diagnoses grouped into hierarchical condition categories (HCCs). Diagnoses count only if documented in a face-to-face encounter by an acceptable provider type and submitted by the plan, and many count only once per year, so plans push practices to document every chronic condition annually. CMS completed its move to the 2024 CMS-HCC model for 2026: risk scores use "100% of the risk scores using only the 2024 CMS-HCC model," and CMS projected MA payments to rise 5.06%, more than $25 billion, in its 2026 rate announcement.

**Audits.** CMS's risk adjustment data validation (RADV) audits check that diagnoses behind payments are supported by medical records. On May 21, 2025 CMS announced it would audit "all eligible MA contracts for each payment year" (about 550), finish payment years 2018 to 2024 by early 2026, grow its medical coders from 40 to about 2,000 by September 1, 2025, and review 35 to 200 records per plan. Practices meet RADV as records requests from their MA plans ([Audits and Recoupments](/books/health-tech/denials-and-appeals#audits-and-recoupments)), and the False Claims Act meets diagnoses added without support: the $556 million Kaiser Permanente settlement of January 2026 concerned diagnosis addenda that raised MA payments ([Upcoding and Risk Adjustment](/books/health-tech/coding-and-documentation#the-false-claims-act)).

What this means for software: chronic conditions documented with their support (the assessment and plan, not just a problem list entry) at a qualifying visit each year; a gap list of conditions documented last year and not yet this year, presented to the clinician as a prompt to assess, never as diagnoses to add; and records retrievable for audit.

## HEDIS and eCQMs

**HEDIS** (Healthcare Effectiveness Data and Information Set) is NCQA's measure set for health plans, "more than 90 measures" across six domains: effectiveness of care, access, experience, utilization and others. Plans compute HEDIS from claims, pharmacy data, lab results and medical record review, and pay practices (in commercial and MA contracts) for closing gaps: a diabetic patient's HbA1c control, a mammogram, a well-child visit. NCQA describes HEDIS as transitioning to "full digitization," with digital measures built on FHIR-enabled clinical data.

**eCQMs** (electronic clinical quality measures) are measures specified to be computed automatically from structured EHR data: the specifications (in CQL, Clinical Quality Language, against standard data elements) are published on the eCQI Resource Center with an annual update cycle, and certified EHRs must compute and export them. MIPS, the Shared Savings Program and hospital programs all accept eCQMs, and CMS's direction is toward digital quality measures on FHIR.

A measure's anatomy is always the same: an **initial population** (patients of an age with a qualifying visit in the period), a **denominator**, **exclusions** and **exceptions** (hospice, a documented medical reason), and a **numerator** (the screening done, the value in range). Whether a patient is in the numerator depends on a coded fact: a LOINC-coded lab result, a CPT II or HCPCS quality code on a claim, a SNOMED-coded finding, a blood pressure observation. A system that stores "BP looked fine" in a note has no numerator.

## What the Software Must Capture

Collected from the programs above, the data a practice system needs for value-based care:

- **Structured clinical facts:** vitals as observations with units and times, lab results with LOINC codes, screenings as coded procedures or observations, problems as coded conditions with onset and status, and medications.
- **Diagnoses with support,** documented at a qualifying encounter, every year for chronic conditions.
- **Quality codes on claims** where a program uses claims reporting (CPT Category II codes, G-codes).
- **Attribution:** which patients each program, ACO or payer contract assigns to which clinician, for which period, from the payer's roster or the program's methodology.
- **Exclusions with reasons:** a patient in hospice, a documented reason a measure doesn't apply, recorded as data.
- **Measure versions:** the specification year each result was computed against.
- **Patient-reported data** where measures need it (depression screening scores, functional status in therapy).

Dental and veterinary practices sit outside most of this. Dental has its own quality measure work (the Dental Quality Alliance) used by Medicaid and some plans, and veterinary has none of the federal programs; for them, the same structured capture pays off in practice analytics instead ([Practice Business](/books/health-tech/practice-business#production-and-collections)).

## How to Build It

The core `conditions`, `observations`, `procedures` and `encounters` hold the clinical facts. This chapter adds program attribution, measures and their results, risk scores, and the gap lists that tie them to visits:

```sql
CREATE TABLE value_programs (            -- a program or contract the organization participates in
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('mips', 'mssp_aco', 'reach_aco', 'lead_aco',
                     'asm', 'ma_contract', 'commercial_vbc', 'medicaid_vbc')),
  counterparty_org_id UUID REFERENCES organizations (id),   -- the ACO, plan or payer
  payer_id         UUID REFERENCES payers (id),
  performance_year SMALLINT NOT NULL,
  terms_doc_id     UUID REFERENCES documents (id)
);

CREATE TABLE patient_attributions (      -- who is accountable for which patient, per program and period
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  program_id       UUID NOT NULL REFERENCES value_programs (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  practitioner_id  UUID REFERENCES practitioners (id),
  source           TEXT NOT NULL CHECK (source IN ('payer_roster', 'cms_assignment', 'computed',
                     'voluntary_alignment')),
  valid_during     DATERANGE NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX patient_attributions_patient_idx ON patient_attributions (patient_id, valid_during);

CREATE TABLE quality_measures (          -- a measure specification, versioned by year
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  steward          TEXT NOT NULL,          -- CMS, NCQA, a specialty society
  identifier       TEXT NOT NULL,          -- the program's measure ID, e.g. a MIPS quality ID or eCQM ID
  version          TEXT NOT NULL,          -- specification year or version
  collection_type  TEXT NOT NULL CHECK (collection_type IN ('ecqm', 'mips_cqm', 'medicare_cqm',
                     'claims', 'hedis', 'contract')),
  higher_is_better BOOLEAN NOT NULL DEFAULT TRUE,
  logic_ref        TEXT NOT NULL,          -- CQL library or spec document
  UNIQUE (steward, identifier, version, collection_type)
);

CREATE TABLE measure_results (           -- one patient's status on one measure for one period
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  measure_id       UUID NOT NULL REFERENCES quality_measures (id),
  program_id       UUID REFERENCES value_programs (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  period           DATERANGE NOT NULL,
  in_denominator   BOOLEAN NOT NULL,
  excluded         BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason TEXT,
  in_numerator     BOOLEAN NOT NULL DEFAULT FALSE,
  evidence         JSONB NOT NULL DEFAULT '[]',   -- the observation, procedure or condition ids that decided it
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (measure_id, program_id, patient_id, period)
);

CREATE TABLE risk_scores (               -- risk adjustment, per patient, model and year
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  model            TEXT NOT NULL,          -- 'cms_hcc_2024', a commercial model
  payment_year     SMALLINT NOT NULL,
  score            NUMERIC(8,4),           -- the plan's figure if supplied, or an estimate
  categories       JSONB NOT NULL,         -- HCCs and the condition ids supporting each
  source           TEXT NOT NULL CHECK (source IN ('plan_supplied', 'computed_estimate')),
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Open care gaps for a day's schedule, the list a front desk and clinician see before the visit:

```sql
SELECT a.patient_id, m.identifier, m.steward, mr.period
FROM appointments a
JOIN locations l ON l.id = a.location_id AND l.organization_id = $1
JOIN measure_results mr
  ON mr.patient_id = a.patient_id
 AND mr.organization_id = l.organization_id
 AND mr.in_denominator AND NOT mr.excluded AND NOT mr.in_numerator
 AND mr.period @> lower(a.during)::date
JOIN quality_measures m ON m.id = mr.measure_id
WHERE lower(a.during)::date = $2
  AND a.status IN ('booked', 'confirmed')
ORDER BY lower(a.during), m.identifier;
```

Design notes:

- **Measures are versioned specifications, computed, never typed.** Results are recomputed from clinical data when it changes, with the evidence that decided each patient kept, so a measure score can be explained patient by patient.
- **Attribution comes from the program,** loaded from payer rosters and CMS assignment files with their periods; a patient can be attributed to several programs at once, with different clinicians.
- **Gaps prompt care, not codes.** A care gap is a reminder to do or document something clinically appropriate; a risk adjustment gap is a prompt to assess a condition, never a diagnosis to add ([Documentation Integrity](/books/health-tech/coding-and-documentation#documentation-integrity)).
- **Program data leaves through exports with logs:** eCQM files, registry submissions, ACO data feeds, each a disclosure for payment or operations under a business associate agreement where one applies ([Who It Applies To](/docs/compliance/hipaa#who-it-applies-to)).

## Auditing

- **Every submission** to CMS, a registry, an ACO or a plan: what was sent, for which period, computed against which measure versions.
- **Measure evidence:** for each numerator and exclusion, the clinical records that decided it, retrievable for validation audits.
- **Diagnosis support** for every condition that feeds a risk score, with the encounter and documentation, kept for the plan's RADV and the government's audits.
- **Attribution files** as received, since disputes about who owned a patient are settled by them.

## What This Means for the System You Build

- **Capture clinical facts as coded, structured data:** vitals, labs with LOINC, screenings, conditions with support, exclusions with reasons.
- **Model attribution per program and period,** loaded from rosters and assignment files, with a patient in several programs at once.
- **Version measure specifications by year** and compute results with stored evidence.
- **Support every collection type a practice may use:** eCQM, registry CQMs, claims-based quality codes, ACO feeds, payer gap files.
- **Keep risk adjustment honest:** annual documentation of chronic conditions with support, gap prompts that ask for assessment, records ready for RADV.
- **Track the program calendar:** MIPS threshold of 75 through the 2028 performance period, the ePA measure from 2027, MSSP collection type changes in 2027, REACH ending in 2026, LEAD and the Ambulatory Specialty Model starting in 2027.

## References

**Medicare programs and rules**

- [Federal Register: CY 2026 physician fee schedule final rule](https://www.federalregister.gov/documents/full_text/text/2025/11/05/2025-19787.txt), the MIPS performance threshold, proposed MVPs, QPP updates
- [CMS: CY 2026 physician fee schedule final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2026-medicare-physician-fee-schedule-final-rule-cms-1832-f), the two conversion factors for qualifying and nonqualifying APM participants
- [CMS: CY 2026 PFS final rule, Medicare Shared Savings Program fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2026-medicare-physician-fee-schedule-final-rule-cms-1832-f-medicare-shared-savings), quality and collection type changes, assignment, BASIC track limits
- [CMS: 2026 Medicare ACO initiatives participation highlights (February 4, 2026)](https://www.cms.gov/newsroom/fact-sheets/2026-medicare-accountable-care-organization-initiatives-participation-highlights), 511 Shared Savings Program ACOs (476 in 2025), more than 700,000 providers and organizations, 12.6 million people; 74 ACO REACH ACOs
- [eCFR: 42 CFR 414.1330 to 414.1375, MIPS performance categories](https://www.ecfr.gov/current/title-42/section-414.1330), quality at 30% in 414.1330(b)(5); cost at 30% (414.1350(d)), improvement activities at 15% (414.1355(b)) and promoting interoperability at 25% (414.1375(a)) in the following sections
- [CMS: About the Shared Savings Program](https://www.cms.gov/medicare/payment/fee-for-service-providers/shared-savings-program-ssp-acos/about), what the program is
- [CMS: ACO REACH](https://www.cms.gov/priorities/innovation/innovation-models/aco-reach), performance years and 2026 participation
- [CMS: LEAD model](https://www.cms.gov/priorities/innovation/innovation-models/lead), the successor model and its dates
- [CMS: Ambulatory Specialty Model](https://www.cms.gov/priorities/innovation/innovation-models/asm), dates, conditions, specialties, mandatory participation
- [CMS: CMS-0057-F fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), the MIPS electronic prior authorization measure

**Medicare Advantage and risk adjustment**

- [KFF: Medicare Advantage in 2026, enrollment update and key trends](https://www.kff.org/medicare/medicare-advantage-in-2026-enrollment-update-and-key-trends/), 35.2 million enrollees and 55% of eligible beneficiaries in 2026
- [CMS: 2026 Medicare Advantage and Part D rate announcement](https://www.cms.gov/newsroom/fact-sheets/2026-medicare-advantage-and-part-d-rate-announcement), full use of the 2024 CMS-HCC model and the projected payment change
- [CMS: Strategy to enhance and accelerate Medicare Advantage audits (May 21, 2025)](https://www.cms.gov/newsroom/press-releases/cms-rolls-out-aggressive-strategy-enhance-and-accelerate-medicare-advantage-audits), RADV scope, timeline and staffing
- [DOJ: Kaiser Permanente affiliates pay $556M](https://www.justice.gov/opa/pr/kaiser-permanente-affiliates-pay-556m-resolve-false-claims-act-allegations), the risk adjustment settlement

**Measures**

- [NCQA: The future of HEDIS](https://www.ncqa.org/hedis/the-future-of-hedis/), the measure count and domains and the move to digital measures
- [NCQA: Digital quality transition](https://www.ncqa.org/digital-quality-transition/), HEDIS "transitions to full digitization" and FHIR-enabled digital quality measurement
- [eCQI Resource Center](https://ecqi.healthit.gov/), eCQM specifications and digital quality measure resources
