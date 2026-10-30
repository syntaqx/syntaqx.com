+++
title = "Optometry, PT & Other Specialties"
nav_title = "Optometry, PT & Specialties"
description = "What changes by specialty: eyewear and contact lens Rx release, optical, PT plans of care and the 8-minute rule, chiropractic, behavioral health, med spas."
category = "Health Tech Industry"
order = 1940
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "optometry", "physical-therapy", "chiropractic", "behavioral-health", "med-spa", "data-model"]
+++

The front desk of an optometry office, a physical therapy clinic, a chiropractor, a counseling practice and a med spa looks the same from the engagement vendor's side: appointments, reminders, texts, forms, reviews, payments. Underneath, each specialty has a rule that changes the software. An optometrist must hand every patient their eyeglass prescription and keep proof they did, because the same office sells glasses. A physical therapist bills Medicare in 15-minute units under an arithmetic rule, against a plan of care a physician must certify every 90 days, with a yearly spending threshold that changes what the claim must say. A chiropractor's Medicare coverage is one service. A substance use disorder program's records carry federal confidentiality rules stricter than HIPAA. A med spa sells retail services and medical procedures in the same visit.

This chapter goes specialty by specialty through what changes, and what the system must do about it. The shared machinery (scheduling, reminders, texting, intake, payments) is in the rest of this part; dental and veterinary practices have their own chapters ([Dental Practice](/books/health-tech/dental-practice), [Veterinary Practice](/books/health-tech/veterinary-practice)). The privacy law of substance use disorder records is State Health Privacy & Sensitive Data's, and therapy claims are Claims'. This chapter extends `procedures`, `encounters`, `documents`, `consents`, `orders` and `practitioner_roles` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages:

| Specialty | Systems | What the vendors emphasize |
| --- | --- | --- |
| **Optometry and ophthalmology** | Compulink, Crystal PM, RevolutionEHR, Eyefinity | Compulink: specialty EHR with one-page charting, an optical point of sale with inventory, job costing and "automatic transmission of lab orders," and a web store fed from the EHR's prescriptions |
| **Physical, occupational and speech therapy** | WebPT, Raintree, Prompt | WebPT: rehab documentation, scheduling, billing, digital intake, home exercise programs with "5,500+ exercises," and "built-in alerts ... and documentation support" for Medicare's 8-minute rule |
| **Chiropractic, behavioral health, med spas** | Specialty systems and general ambulatory EHRs | Chiropractic: visit-pattern billing; behavioral health: telehealth and segregated notes; med spas: retail point of sale, memberships and packages beside medical charting |

The pattern: specialty systems win on the rule that general systems get wrong. An optometry system has an optical lab order and a prescription release workflow; a rehab system counts minutes and tracks Medicare thresholds; neither is a feature a general EHR has by default.

## Optometry and Optical

Optometry is a clinical practice and a retail store. The exam produces a refraction and a prescription; the optical shop sells frames, lenses and contact lenses against it. The FTC's rules exist because the same practice benefits when the patient buys there, and both rules require the prescriber to release the prescription and prove it.

### The Eyeglass Rule

The Ophthalmic Practice Rules (16 CFR part 456), known as the Eyeglass Rule:

- **Release without being asked.** The prescriber must give the patient one copy of the prescription right after the refractive exam, before offering to sell eyewear, "whether or not the patient asks for it."
- **No conditions.** The prescriber can't condition the exam on buying eyewear, charge a fee to release the prescription, or require a liability waiver; it may withhold the copy until the exam is paid only if it would demand immediate payment from a patient who needed no glasses, and proof of insurance counts as payment.
- **Digital delivery needs consent.** The copy can be digital (text, email or portal) only with the patient's "verifiable affirmative consent," after the prescriber identifies the methods it will use, and consent records are kept for at least three years.
- **Confirmation of release.** For a paper copy, the prescriber asks the patient to "acknowledge receipt of the prescription by signing a separate statement," and notes a refusal; for a digital copy, it keeps evidence that the prescription was "sent, received, or made accessible, downloadable, and printable." Records are kept "for a period of not less than three years." A prescriber with no financial interest in eyewear sales is exempt from the confirmation.

### The Contact Lens Rule

The Contact Lens Rule (16 CFR part 315) does the same for contact lenses, with a verification system for online sellers:

- **Release and confirmation.** After a contact lens fitting, the prescriber gives the patient a copy "[w]hether or not requested by the patient," documents release in one of four ways (three by the patient's signed acknowledgment, one by evidence a digital copy was sent), and keeps the record for "not less than three years."
- **Requests from a patient's agent.** A copy goes to the patient's designee within "forty (40) business hours of receipt of the request."
- **Passive verification.** A seller may sell lenses on a prescription the prescriber confirms, corrects, or "fails to communicate with the seller within eight (8) business hours" after receiving the verification request; business hours are 9 a.m. to 5 p.m. weekdays in the prescriber's time zone, excluding federal holidays.
- **Expiration.** At least one year after issue unless state law sets a longer period, or a shorter one for documented medical reasons kept for three years.

For the system, prescription release is a workflow with a clock:

- **Release is an event at the end of the exam,** generated from the finalized refraction, delivered on paper or by the consented digital channel, and the confirmation (signature, refusal note, or delivery evidence) is stored with it.
- **Verification requests are a queue with a deadline.** A request from an online seller (by phone, fax, email or automated call) is matched to the patient's prescription, and the deadline (eight business hours, computed in the practice's time zone with its holiday calendar) is shown; silence approves the sale, so a request found too late is an approved one.
- **Expirations are data,** set from state law and the prescriber's documented reason, and they drive recall: an expiring contact lens prescription is the reason for the annual exam reminder.

### Optical Orders and Vision Plans

An eyewear order is a small manufacturing job: frame, lenses (material, design, coatings), measurements (pupillary distance, segment height), sent to a lab and tracked to pickup. The optical system tracks inventory by frame, job status, and the lab's return, and sends the "your glasses are ready" message. Vision benefits are usually separate from medical insurance (vision plans such as VSP and EyeMed cover exams and materials allowances), so one visit can bill a vision plan for the refraction and materials and the patient's medical insurance for a medical eye problem found during the exam. The encounter records which coverage each line goes to.

## Physical Therapy

Outpatient therapy is the specialty where Medicare's billing rules shape documentation minute by minute.

### Plan of Care and Certification

Medicare outpatient therapy is furnished under a plan of care, and 42 CFR 424.24(c) requires certification: the plan is certified "as soon as possible after the plan is established," signed by the physician or qualifying nonphysician practitioner who knows the case when a therapist establishes it, and recertified "at least every 90 days" by signing the medical record. The system:

- **Tracks the plan's certification as a document with a date and signer,** and its recertification due date, with a worklist of plans awaiting a physician's signature (a fax or portal send, a reminder, an escalation).
- **Blocks or flags visits outside a certified period,** because therapy furnished without a current certification is a denial waiting to happen.
- **Ties visits to the plan's goals.** Progress reports at intervals and a discharge summary close the plan.

### The 8-Minute Rule

Most therapy procedure codes are "timed," defined in 15-minute units of direct contact. The Medicare Claims Processing Manual (chapter 5, section 20.2) sets the arithmetic: a single timed service performed for less than 8 minutes isn't billed; "8 minutes through 22 minutes" is 1 unit, "23 minutes through 37 minutes" is 2 units, and so on in 15-minute steps; and when several timed services are performed in a day, "the total number of minutes of service ... determines the number of timed units billed," allocated across the codes by the manual's rules (two services of 7 minutes or less that total 8 or more bill one unit, for the service performed longest).

For the system, minutes are the record and units are computed:

- **Document minutes per timed service per visit,** plus total timed minutes and total treatment time, as the therapist enters them (or a timer captures them).
- **Compute units by the manual's rule,** never by asking the therapist to choose units, and show the result before the note is signed. WebPT's 8-minute-rule alerts are this.
- **Keep the rule's payer scope as data.** Medicare and payers that follow it use total minutes; some commercial payers bill each code's minutes separately (sometimes called the "substantial portion" method). The payer's method is a rule, versioned.

### Thresholds

Medicare doesn't cap therapy, but it requires a **KX modifier** on claims above an annual amount per beneficiary, attesting that the services are medically necessary. CMS lists the CY 2026 amounts as "$2,480 for PT and SLP services combined" and "$2,480 for OT services." Above $3,000 for PT and SLP combined, or for OT, claims may be selected for targeted medical review, a threshold CMS states for each year through 2028. Because the amounts accrue across every provider the patient sees in the year, the clinic can't know exactly where a patient stands from its own claims; it estimates from its own charges and Medicare's eligibility data, and the system warns as the threshold approaches so documentation supports the KX attestation.

### Direct Access

Most states let patients see a physical therapist without a physician's referral, with conditions (time limits, visit limits, or a referral after a period) that vary by state; payers, Medicare included, may still require the physician's certification to pay. <!-- source-gap: pt-direct-access-states | missing | State-by-state direct access to physical therapy (APTA summary) and its conditions | closes with: APTA's direct access summary or each state's practice act, readable without a browser | checked: 2026-10-29 --> The intake flow records whether a referral exists and the payer's referral rule, and the scheduler knows when a self-referred patient needs a referral before the next visit.

### Home Exercise and Engagement

Therapy outcomes depend on what the patient does between visits, so rehab engagement includes home exercise programs (videos and instructions assigned per patient, as WebPT's library shows), adherence check-ins and visit-frequency reminders. A plan of care that calls for two visits a week for six weeks is the schedule the reminder and reactivation logic works from: a patient who stops booking mid-plan is the PT equivalent of unscheduled dental treatment.

## Chiropractic

Medicare Part B "only covers adjustments of the spine by a chiropractor to correct a subluxation," done by hand or with an activator device, and "Medicare doesn't cover other services or tests a chiropractor orders, including X-rays, massage therapy, and acupuncture." So a chiropractic visit for a Medicare patient often has a covered spinal manipulation and non-covered services in the same encounter, and the non-covered ones need the patient's acknowledgment of liability before they're billed to the patient (the advance notice workflow Coding, Documentation & Compliance covers). Chiropractic care is otherwise visit-pattern based: a series of visits under a treatment plan, often sold as packages or memberships to cash-pay patients, which In-Office Membership Plans & Cash Pay covers.

## Behavioral Health

Behavioral health practices (therapists, psychologists, psychiatrists, counseling groups) carry the most sensitive records in ambulatory care, and some carry records under a separate federal regime. A program that holds itself out as providing substance use disorder (SUD) treatment and is federally assisted is a **Part 2 program** under 42 CFR part 2. HHS's 2024 final rule (published February 16, 2024, effective April 16, 2024) aligned Part 2 more closely with HIPAA: a patient may now give a single consent for all future uses and disclosures for treatment, payment and health care operations, valid "until such time as the patient revokes such consent in writing," and a HIPAA covered entity or business associate receiving records under that consent may redisclose them under HIPAA, "except for uses and disclosures for civil, criminal, administrative, and legislative proceedings against the patient." State Health Privacy & Sensitive Data covers the rule; what it means for the practice software:

- **Part 2 records are flagged at the record level,** not the practice level, because a general practice may hold a few. The flag travels with every disclosure and export.
- **Consent is a record with a scope and a revocation,** checked before a disclosure (Consent, Authorization & Proxies has the model).
- **Engagement messages say less.** A reminder that names a counseling practice or an SUD program discloses something on a lock screen; behavioral health tenants default to generic sender names and content.
- **Psychotherapy notes are separate.** HIPAA gives psychotherapy notes kept separately from the record extra protection; systems store them apart, excluded from the patient portal's default release and from general exports.
- **Telehealth is the default channel** for much of behavioral health, with its own consent and licensure rules (Telehealth).

## Med Spas

A med spa sells cosmetic medical procedures (injectables, laser treatments, IV therapy, weight management) alongside retail and spa services, often as packages and memberships. The software looks like a salon's point of sale with a medical chart attached, and the medical part brings the rules: medical procedures are performed under a licensed medical director's supervision with an assessment (often called a good-faith exam) before treatment, under state medical, nursing and corporate practice rules that vary widely and are being tightened in several states. <!-- source-gap: med-spa-state-rules | missing | State rules on med spa supervision, good-faith exams and IV therapy (for example Texas's 2025 IV therapy law) and corporate practice of medicine for med spas | closes with: state statutes or medical board rules readable without a browser | checked: 2026-10-29 --> For the system:

- **Retail and medical lines are different records.** A product sale is commerce; an injection is a procedure with a lot number, a dose, a site, a provider and the supervising physician, documented in the chart.
- **The assessment gates the procedure.** The schedule can book the appointment, but the chart requires a current assessment by a qualified practitioner before the injection is documented.
- **Photos are clinical records.** Before-and-after photos are PHI; using them in marketing needs the patient's HIPAA authorization, separate from consent to treat.
- **HSA and FSA cards generally don't pay for cosmetic services,** and receipts must itemize so patients can tell ([HSA and FSA Cards](/books/health-tech/patient-payments#hsa-and-fsa-cards)).

## How to Build It

The specialties add a few records each to the core model:

```sql
-- Optometry: prescriptions and their release, verification requests
CREATE TABLE vision_prescriptions (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  encounter_id      UUID NOT NULL REFERENCES encounters (id),
  prescriber_id     UUID NOT NULL REFERENCES practitioner_roles (id),
  kind              TEXT NOT NULL CHECK (kind IN ('eyeglasses', 'contact_lenses')),
  rx                JSONB NOT NULL,      -- sphere, cylinder, axis, add, prism; lens brand, BC, diameter
  issued_on         DATE NOT NULL,
  expires_on        DATE NOT NULL,       -- state law, or shorter with a documented reason
  short_expiry_reason TEXT,
  document_id       UUID NOT NULL REFERENCES documents (id)
);

CREATE TABLE rx_releases (                -- 16 CFR 456.4 and 315.3: proof of release
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  prescription_id   UUID PRIMARY KEY REFERENCES vision_prescriptions (id),
  method            TEXT NOT NULL CHECK (method IN ('paper', 'digital')),
  digital_consent_id UUID REFERENCES consents (id),  -- required for digital
  confirmation      TEXT NOT NULL CHECK (confirmation IN ('patient_signed', 'patient_refused_noted',
                      'delivery_evidence', 'exempt_no_financial_interest')),
  evidence_document_id UUID REFERENCES documents (id),
  released_at       TIMESTAMPTZ NOT NULL,
  retain_until      DATE NOT NULL,       -- at least three years
  CHECK (method <> 'digital' OR digital_consent_id IS NOT NULL)
);

CREATE TABLE contact_lens_verifications (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  seller            TEXT NOT NULL,
  received_via      TEXT NOT NULL CHECK (received_via IN ('phone', 'fax', 'email', 'automated_call',
                      'portal')),
  received_at       TIMESTAMPTZ NOT NULL,
  deadline_at       TIMESTAMPTZ NOT NULL, -- 8 business hours, practice zone and holidays
  prescription_id   UUID REFERENCES vision_prescriptions (id),
  response          TEXT CHECK (response IN ('confirmed', 'corrected', 'invalid', 'none')),
  responded_at      TIMESTAMPTZ,
  recording_ref     TEXT                 -- automated calls: the recording, kept
);

-- Therapy: plans of care, certification and timed minutes
CREATE TABLE plans_of_care (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  therapist_id      UUID NOT NULL REFERENCES practitioner_roles (id),
  discipline        TEXT NOT NULL CHECK (discipline IN ('pt', 'ot', 'slp')),
  goals             JSONB NOT NULL,
  frequency         TEXT NOT NULL,       -- '2x/week for 6 weeks'
  starts_on         DATE NOT NULL,
  referral_status   TEXT NOT NULL CHECK (referral_status IN ('referred', 'direct_access')),
  status            TEXT NOT NULL CHECK (status IN ('draft', 'active', 'discharged'))
);

CREATE TABLE plan_certifications (
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  plan_id           UUID NOT NULL REFERENCES plans_of_care (id),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL CHECK (period_end <= period_start + 90),  -- recertify at least every 90 days
  signer_id         UUID REFERENCES practitioner_roles (id),
  signed_at         TIMESTAMPTZ,         -- null: awaiting signature
  document_id       UUID REFERENCES documents (id),
  PRIMARY KEY (plan_id, period_start)
);

ALTER TABLE procedures
  ADD COLUMN timed_minutes    SMALLINT,  -- direct one-on-one minutes for a timed code
  ADD COLUMN units_computed   SMALLINT,  -- from the payer's unit rule, never typed
  ADD COLUMN unit_rule_version TEXT;

ALTER TABLE encounters
  ADD COLUMN total_timed_minutes     SMALLINT,
  ADD COLUMN total_treatment_minutes SMALLINT,
  ADD COLUMN plan_of_care_id         UUID REFERENCES plans_of_care (id);

-- Medicare therapy amounts accrued per beneficiary and year, against the year's thresholds
CREATE TABLE therapy_thresholds (
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  year              SMALLINT NOT NULL,
  service_group     TEXT NOT NULL CHECK (service_group IN ('pt_slp', 'ot')),
  kx_threshold      BIGINT NOT NULL,     -- the year's amount, as data ($2,480 in 2026)
  review_threshold  BIGINT NOT NULL,     -- targeted medical review ($3,000)
  accrued_here      BIGINT NOT NULL DEFAULT 0,  -- this practice's allowed amounts
  accrued_elsewhere BIGINT,              -- from Medicare eligibility data, when known
  as_of             TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (organization_id, patient_id, year, service_group)
);

-- Med spas: supervision and product lots on the procedure
ALTER TABLE procedures
  ADD COLUMN supervising_id   UUID REFERENCES practitioner_roles (id),  -- med spa medical director
  ADD COLUMN product_lot      TEXT;      -- injectables and implants
```

The Medicare unit computation for a visit, in the manual's terms:

```sql
-- Total timed units for a visit from total timed minutes (8-22 = 1, 23-37 = 2, ...):
SELECT CASE WHEN total_timed_minutes < 8 THEN 0
            ELSE (total_timed_minutes + 7) / 15 END AS total_units
FROM encounters WHERE id = $1;
```

Allocating those units across codes follows the manual's examples (the most minutes first, small remainders to the service performed longest) and is a function with tests per example, not a query.

Design notes:

- **Deadlines are computed and stored.** The contact lens verification deadline and the plan recertification due date are computed once, from the rule in force and the practice's calendar, and stored, so the worklist sorts by them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Sensitivity is a label on the record,** a `sensitivity_labels` row ([Health Tech Architecture](/books/health-tech/health-tech-architecture#how-to-build-it) defines it) such as `part2_sud` or `mental_health`, and every export, portal release, message template and support view checks it.
- **Specialty rules are payer and state data:** unit methods, direct access conditions, threshold amounts per year, supervision rules.

## Auditing

- **Prescription releases and their proof,** retained at least three years, and every contact lens verification with its deadline and response.
- **Plan of care certifications,** sent, signed and late, and visits furnished in each period.
- **Timed minutes and computed units,** with the rule version, so an audit of units billed can be reproduced from minutes documented.
- **Threshold tracking** and the KX attestations it supported.
- **Disclosures of sensitive records** with the consent that allowed each.
- **Med spa procedures** with supervising physician, assessment and product lot.

## What This Means for the System You Build

- **Make eyewear prescription release an automatic end-of-exam event** with stored confirmation, and run contact lens verifications as a deadline queue in business hours.
- **Set prescription expirations from state law** and use them to drive recall.
- **Track plan of care certification periods** and flag visits outside them.
- **Record minutes, compute units** by the payer's rule, and show units before the note is signed.
- **Warn on Medicare therapy thresholds** with the year's amounts as data.
- **Flag sensitivity per record** (Part 2, psychotherapy notes) and check it everywhere data leaves.
- **Separate retail and medical lines in med spas,** with supervision and assessment gating procedures.

## References

**Regulation**

- [eCFR: 16 CFR part 456, Ophthalmic Practice Rules (Eyeglass Rule)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-456), release after the exam, prohibited conditions, digital delivery consent, confirmation of release and three-year retention
- [eCFR: 16 CFR part 315, Contact Lens Rule](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-315), release and confirmation, 40 business hours for designees, 8 business hours passive verification, business hours, expiration
- [eCFR: 42 CFR 424.24](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-B/section-424.24), certification of outpatient therapy plans of care and recertification at least every 90 days
- [CMS: Medicare Claims Processing Manual, chapter 5 (PDF)](https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c05.pdf), section 20.2: timed 15-minute units, the 8-minute threshold, the unit table and total-minutes counting
- [CMS: Therapy Services](https://www.cms.gov/medicare/coding-billing/therapy-services), the CY 2026 KX modifier thresholds and the $3,000 targeted medical review threshold
- [Medicare.gov: Chiropractic services](https://www.medicare.gov/coverage/chiropractic-services), coverage limited to spinal manipulation to correct a subluxation
- [Federal Register: Confidentiality of Substance Use Disorder Patient Records (2024 final rule)](https://www.federalregister.gov/api/v1/documents/2024-02544.json), publication February 16, 2024, effective April 16, 2024, alignment with HIPAA
- [eCFR: 42 CFR 2.33](https://www.ecfr.gov/current/title-42/chapter-I/subchapter-A/part-2/subpart-C/section-2.33), single consent for treatment, payment and operations, and HIPAA redisclosure except proceedings against the patient

**Vendors**

- [Compulink](https://www.compulinkadvantage.com/), specialty EHR, optical POS and lab order transmission, web store integration, patient self-service
- [WebPT](https://www.webpt.com/), rehab EMR, scheduling, billing, home exercise programs, 8-minute rule alerts
