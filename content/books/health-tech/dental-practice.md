+++
title = "Dental Practice"
description = "Dental offices in software: CDT, perio charts, treatment plans and case acceptance, benefit rules and estimates, predeterminations, imaging, labs, AI."
category = "Health Tech Industry"
order = 1939
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "dental", "cdt", "treatment-plans", "insurance-estimates", "dental-ai", "data-model"]
+++

Dentistry is the largest market for practice software outside medicine, and the one patient engagement vendors grew up in. A general dental office runs two businesses on one schedule: hygiene, a recurring preventive visit every few months that fills half the chairs, and restorative and specialty treatment, diagnosed at those visits and sold as a treatment plan the patient has to accept and pay for. Dental insurance pays a share of both under rules that look nothing like medical insurance: annual maximums, frequency limits, waiting periods, downgrades to a cheaper alternative, and coinsurance by category of service. So the work the software does is mostly money: estimate what the plan will pay for each procedure on each tooth, present the plan with the patient's share, track what's accepted and unscheduled, and keep the hygiene recall loop full.

This chapter covers what's specific to dentistry: CDT codes and tooth-level charting, periodontal charting, treatment plans and case acceptance, insurance estimation, predeterminations, imaging and bridges, dental lab cases, DSOs, and dental AI. Recall and reactivation are Reminders, Confirmations & Recall's; booking chairs and operatories is Scheduling & Online Booking's; the dental claim (837D, the ADA claim form) is Claims'; dental eligibility and benefit breakdowns are Eligibility & Benefits'; and the charting model in general (the odontogram and tooth and surface coding as clinical records) is [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data#dental-teeth-surfaces-and-status)'s. This chapter extends `procedures`, `coverages`, `plans`, `practitioner_roles` and `documents` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages:

| System | What it is | Notable for this chapter |
| --- | --- | --- |
| **Dentrix, Dentrix Ascend, Dentrix Enterprise** (Henry Schein One) | Henry Schein One's dental PMS family: desktop, cloud (Ascend) and enterprise editions | Integrated by Pearl, Dental Intelligence and most engagement vendors; Dentrix's own payments post to its ledger (Payments in the Practice) |
| **Eaglesoft** (Patterson) | Patterson's dental PMS | A common sync target for engagement and payments vendors |
| **Open Dental** | Dental PMS with a public API | A Clinics feature that runs "multiple locations ... from one database while keeping locations separate for reporting"; a claim takes its clinic from its procedures |
| **Denticon** (Planet DDS) | Cloud dental PMS | "Tried and tested by more than 13,000+ dental practices"; built for DSOs and groups |
| **Curve** | Cloud dental PMS | One of the cloud alternatives to the desktop installed base |
| **Pearl** | Dental imaging AI | Second Opinion, FDA-cleared for 2D X-rays and 3D CBCT; "40+ Integrations" with imaging and PMS systems |
| **Overjet** | Dental imaging AI, payer and DSO analytics | "FDA-cleared vision AI x-ray analysis"; an insurance coordinator (Ivy), ambient visit documentation (Voice), and payer utilization review products |
| **Dental Intelligence** | Analytics and engagement | Integrates with Open Dental, Eaglesoft, Dentrix, Dentrix Ascend and Denticon; an AI receptionist and data Q&A |

The pattern is that every vendor's product is a view over the PMS's procedures, treatment plans and insurance data. A dental engagement or analytics product that can't read tooth-level procedures and treatment plan status can't do case acceptance, can't estimate, and can't count unscheduled treatment, which is why PMS integration (Integrating with Practice Management Systems) is the whole game.

## CDT and the Tooth

Dental procedures are coded in the **Code on Dental Procedures and Nomenclature (CDT)**, which the ADA publishes and maintains: its Code Maintenance Committee meets annually (its March 2026 meeting set changes for CDT 2027), and a new edition takes effect each year. CDT is licensed, like CPT: the codes and descriptors can't be shipped in software without a license from the ADA, so a PMS or engagement product either licenses CDT or reads codes from the PMS that does and never displays the official descriptors ([Licensing](/books/health-tech/terminology-and-coding#licensing) covers it).

What makes a dental procedure different from a medical one is where it is (a tooth, surfaces, a quadrant, a sextant or an arch, as the code's treatment area requires) and its chart status (planned, completed, existing by this or another provider, referred), which [Dental: Teeth, Surfaces and Status](/books/health-tech/ehr-and-pms-data#dental-teeth-surfaces-and-status) covers with the numbering systems; existing work and conditions are `tooth_findings` there.

A single tooth's history is a sequence: a two-surface filling in 2019, a crack noted in 2024, a crown planned in 2025, completed in 2026. That history drives insurance estimates (a crown on a tooth that had one five years ago may not be covered), clinical decisions, and the AI products that read the chart.

## Periodontal Charting

A perio exam records, for each tooth, probing depths at several sites around the tooth, bleeding on probing, recession, mobility, furcation involvement and attachment loss. It's done at intervals and compared over time, because the change is the diagnosis. For the system:

- **It's a dated measurement set, not a field.** One exam is many observations per tooth and site; a perio chart is the table of them, and the comparison between exams is the clinical value.
- **Voice entry is the norm.** The hygienist calls out numbers while probing; PMSs and add-ons support voice perio charting, and ambient AI is moving into the same workflow (Practice Analytics & AI Front Desk).
- **It drives billing and recall.** Periodontal maintenance and scaling and root planing are justified by the chart, and payers ask for it as an attachment; a patient on periodontal maintenance moves to a shorter recall interval.

## Treatment Plans and Case Acceptance

A treatment plan is the list of procedures the dentist recommends, by tooth and phase, with fees, the insurance estimate and the patient's portion. Case acceptance (how much of the diagnosed treatment patients agree to and schedule) is the number a dental practice's growth depends on, and the one engagement vendors sell against.

The plan's lifecycle:

| State | Meaning | What the system does |
| --- | --- | --- |
| **Diagnosed** | Procedures charted as treatment planned | Estimates computed per procedure |
| **Presented** | Shown to the patient, with options (crown or onlay, now or phased) | The version presented is kept, with estimates as shown |
| **Accepted** | The patient agreed, often by signature, with a financial arrangement | Signed document; payment plan or financing linked |
| **Scheduled** | Appointments booked for accepted procedures | Linked appointments |
| **Completed** | Procedures done | Charges posted; estimates replaced by claims |
| **Declined or expired** | Patient said no, or never scheduled | Into the unscheduled treatment list for follow-up |

Rules:

- **Present versions, not live data.** The estimate a patient accepted on March 3 is a document; when the plan's benefits or fees change, a new version is presented, not the old one silently recomputed. That's the record that answers "you told me my share would be $412."
- **Phases and alternatives are first-class.** A plan with "phase 1: urgent, phase 2: elective" and "option A: implant, option B: bridge" is how dentists present; the acceptance is per phase or option.
- **Unscheduled treatment is the revenue list.** Accepted or presented procedures with no appointment are what engagement campaigns chase ("You have treatment your dentist recommended..."), and the count and value of it is a core KPI (Practice Analytics & AI Front Desk). Messages that name the procedure are PHI going to a phone; minimum necessary applies (Two-Way Texting & Messaging).
- **Benefits renew, so timing is money.** Plans with calendar-year maximums make "use your benefits before December 31" campaigns a fixture of the fall, and a phased plan may deliberately split treatment across two benefit years. The estimate per phase has to use the right year's remaining maximum.

## Insurance Estimation

Dental insurance is mostly a defined-benefit product with a small annual maximum, so the estimate is a calculation over many rules, and getting it wrong is how a practice ends up billing patients for amounts it said insurance would pay. The rules an estimate engine applies to each procedure:

- **Category and coinsurance.** Plans group procedures into categories (commonly preventive, basic and major) with a coinsurance percentage each (a plan paying 100% for preventive, 80% for basic and 50% for major is the familiar shape, not a standard), and the category of a given code is plan-specific.
- **Fee basis.** The plan pays its percentage of an allowed amount: the in-network fee schedule for a participating office, or a usual-and-customary amount out of network, not the office's full fee. The patient's portion depends on whether the office must write off the difference.
- **Deductible.** A per-person and per-family deductible, often waived for preventive services.
- **Annual maximum.** The plan's yearly cap, with what's already been used this benefit year (by this office and others), which the practice learns from eligibility responses or payer portals and which goes stale as claims process elsewhere.
- **Frequency limits.** A plan might allow two cleanings per benefit year or one every six months, bitewings once a year, a full-mouth series every few years, and one crown per tooth in a multi-year window; the numbers are the plan's. The limit has a basis (per calendar or benefit year, or per rolling period since the last service) and requires the history, including procedures done at other offices.
- **Age limits.** Sealants and fluoride to a stated age; orthodontics to an age, with a separate lifetime maximum.
- **Downgrades (alternate benefit).** The plan pays for a cheaper procedure than the one performed: a tooth-colored filling on a back tooth paid as if it were amalgam, a crown paid as a filling. The patient owes the difference, so the estimate shows the downgrade explicitly.
- **Waiting periods and missing tooth clauses.** No major services for a stated period after enrollment; no payment for replacing a tooth lost before coverage began.
- **Coordination of benefits.** With two dental plans, the secondary pays under its own rules (some never pay more than they would as primary, some pay up to the primary's remainder), which Eligibility & Benefits covers.

The engine's inputs are a coverage, a plan's benefit rules (from the eligibility response's breakdown, the payer's documents, or staff entry), the patient's history, and the procedure; its output is an estimate with every rule that applied, so staff can see why the number is what it is. My rule: an estimate is never a single number; it's a line with the fee, the allowed amount, each reduction and its reason, the insurance estimate and the patient portion, so the front desk can explain it and the practice can correct the rule that was wrong.

Rule data is the hard part. Eligibility responses carry some of it (maximums, deductibles, coinsurance by service type), payer portals carry more, and frequency and downgrade rules often live only in a plan document or a phone call. Engagement and AI vendors now sell benefit verification as a service (Overjet's Ivy "verifies benefits and estimates patient costs"); whatever the source, each rule records where it came from and when it was verified.

## Predeterminations

A predetermination (pre-treatment estimate) is a claim submitted before treatment, asking the plan what it would pay. It's not a guarantee (the patient's eligibility, maximum and the procedure's details can change before the work is done), and it adds weeks, but for crowns, implants, periodontal surgery and orthodontics it's the best evidence the practice can get. The system:

- **Submits it as a claim with predetermination status** on the same 837D and ADA form machinery (Claims has the mechanics), with the X-rays and perio chart attached.
- **Stores the response against the treatment plan items,** with its date and the plan's caveats, and uses it in place of the computed estimate while it's current.
- **Flags drift.** If the procedure performed differs from the one predetermined (a different tooth, more surfaces), the predetermined amount no longer applies.

## Imaging and Bridges

Dental imaging (bitewings, periapicals, panoramic films, intraoral photos, and cone-beam CT) is produced by sensor and imaging software from many vendors, and connected to the PMS by **bridges**: an integration where the PMS launches the imaging program with the patient context, and the images stay in the imaging system's own database. The result is an office where the "chart" is split: procedures in the PMS, images in one or more imaging programs, linked by patient ID and a launcher.

For the software around it:

- **Images are the evidence.** Claims for crowns, root canals and perio need X-rays as attachments, and an AI product needs the images themselves, so integrations reach into the imaging store, not just the PMS. Pearl's partner list spans imaging and PMS systems for this reason.
- **Formats vary.** DICOM for CBCT and increasingly for 2D, proprietary formats and plain image files elsewhere; [DICOM, PACS and DICOMweb](/books/health-tech/documents-and-ccda#dicom-pacs-and-dicomweb) covers DICOM, and [Dental Imaging and Bridges](/books/health-tech/documents-and-ccda#dental-imaging-and-bridges) the bridge mechanics.
- **Patient matching across systems** is by the PMS ID the bridge passed, which breaks when someone creates the patient in the imaging program by hand.

## Dental Lab Cases

Crowns, bridges, dentures, night guards and aligners are made by dental labs from impressions or intraoral scans, and a lab case is a small supply chain inside the visit: prescription to the lab, case sent (physical impression or digital scan), due date, return, seat appointment. The PMS or a lab-case tool tracks:

- **The case and its prescription:** tooth, material, shade, the lab, the due date, and the seat appointment it must arrive before.
- **The schedule dependency.** A seat appointment without a returned case is a wasted chair hour; the system warns when a case's due date is after its appointment.
- **The cost.** Lab fees are the practice's cost of goods, tracked per case for profitability, and some payer contracts and claims (for a crown, the date it was seated) depend on the dates.

## DSOs and Groups

Dental service organizations provide the business side to dentist-owned practices under management services agreements ([DSOs and MSOs](/books/health-tech/practice-business#dsos-and-msos)), because many states restrict who may own a dental practice or control clinical decisions ([Corporate practice doctrines](/books/health-tech/practice-business#corporate-practice-doctrines)). For the software, a DSO is a hierarchy of separately owned practices with central operations: one PMS instance or several from acquisitions, a central call center and billing office, and group reporting across all of it. Open Dental's Clinics feature and Denticon's DSO focus ("8 weeks per location for DSOs" to implement) are two answers to the same need. The structure, the permissions and the reporting are Multi-Location Groups & Call Centers'.

## Dental AI

Dental imaging is one of the most active areas of FDA-cleared AI. FDA's list of AI-enabled devices includes, among many others, Pearl's Second Opinion family (Second Opinion CC on January 16, 2025, a periapical radiolucency product on April 11, 2025, and pediatric, 3D, CS and panoramic versions through November 14, 2025), VideaHealth's Videa Dental AI (September 19, 2025), Diagnocat (January 15, 2026), Overjet's CBCT Assist (December 5, 2025) and Iris imaging system (April 10, 2026), and products from Dentsply Sirona, 3Shape and others. Pearl describes "26+" clearances; Overjet describes its vision AI as "FDA-cleared vision AI x-ray analysis that detects and outlines disease and anatomy."

What the products do and what that means for the system:

- **Detection on images.** Caries, calculus, bone level, periapical radiolucencies and existing restorations outlined on X-rays, as a second reader for the dentist and a visual for the patient. The clearance covers specific indications on specific image types; a product used outside its indications is outside its clearance.
- **Case acceptance.** An annotated X-ray is a persuasive picture, and vendors sell AI as a case acceptance tool. The finding is decision support for the dentist, not a diagnosis, and the treatment plan stays the dentist's (Practice Analytics & AI Front Desk covers liability).
- **Payers use it too.** Overjet sells utilization review and provider analytics to insurers, and a claim's X-ray may be read by a payer's AI as well as the dentist; consistent findings and good images matter on both ends.
- **Findings are records.** An AI finding on an image, its model version, whether the dentist confirmed, rejected or ignored it, and what was charted as a result, is clinical decision support output that belongs in the record with its provenance ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## How to Build It

The location in the mouth is already on `procedures` (`tooth_system`, `tooth`, `surfaces`, `quadrant`, `sextant`, `arch`), and work done elsewhere is in `tooth_findings`, both from [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data#how-to-build-it). Dental practice adds perio exams, treatment plans, benefit rules, estimates, lab cases and AI findings:

```sql
CREATE TABLE perio_exams (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  patient_id      UUID NOT NULL REFERENCES patients (id),
  encounter_id    UUID NOT NULL REFERENCES encounters (id),
  examined_by     UUID NOT NULL REFERENCES practitioner_roles (id),
  examined_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE perio_measurements (
  organization_id UUID NOT NULL REFERENCES organizations (id),
  exam_id         UUID NOT NULL REFERENCES perio_exams (id),
  tooth           TEXT NOT NULL,           -- in the patient's tooth_system
  site            TEXT NOT NULL,           -- 'DB', 'B', 'MB', 'DL', 'L', 'ML'
  probing_mm      SMALLINT,
  recession_mm    SMALLINT,
  bleeding        BOOLEAN,
  suppuration     BOOLEAN,
  mobility        SMALLINT,                -- per tooth; repeated on its sites
  furcation       SMALLINT,
  PRIMARY KEY (exam_id, tooth, site)
);

CREATE TABLE treatment_plans (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  patient_id      UUID NOT NULL REFERENCES patients (id),
  diagnosed_by    UUID NOT NULL REFERENCES practitioner_roles (id),
  status          TEXT NOT NULL CHECK (status IN ('diagnosed', 'presented', 'accepted',
                    'partially_accepted', 'completed', 'declined', 'expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE treatment_plan_items (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  plan_id         UUID NOT NULL REFERENCES treatment_plans (id),
  procedure_id    UUID NOT NULL REFERENCES procedures (id),  -- the planned procedure
  phase           SMALLINT NOT NULL DEFAULT 1,
  option_group    TEXT,                    -- alternatives: 'A' implant, 'B' bridge
  priority        TEXT CHECK (priority IN ('urgent', 'recommended', 'elective')),
  accepted        BOOLEAN,
  appointment_id  UUID REFERENCES appointments (id)       -- null and accepted: unscheduled
);

CREATE TABLE treatment_plan_presentations (  -- each version shown to the patient
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  plan_id         UUID NOT NULL REFERENCES treatment_plans (id),
  version         INT NOT NULL,
  snapshot        JSONB NOT NULL,          -- items, fees, estimates and portions as shown
  document_id     UUID REFERENCES documents (id),  -- signed acceptance, if signed
  presented_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (plan_id, version)
);

CREATE TABLE benefit_rules (                 -- one plan's rules, each with its source
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  plan_id         UUID NOT NULL REFERENCES plans (id),
  kind            TEXT NOT NULL CHECK (kind IN ('category', 'coinsurance', 'deductible', 'maximum',
                    'frequency', 'age_limit', 'downgrade', 'waiting_period', 'missing_tooth',
                    'exclusion')),
  applies_to      TEXT[] NOT NULL,         -- codes or a category name
  params          JSONB NOT NULL,          -- {"count":2,"per":"benefit_year"}, {"to_code":"..."}
  source          TEXT NOT NULL CHECK (source IN ('eligibility_271', 'payer_portal', 'plan_document',
                    'phone', 'vendor_verification', 'predetermination')),
  benefit_detail_id UUID,                 -- benefit_details, from Eligibility & Benefits, when parsed from a 271
  verified_at     TIMESTAMPTZ NOT NULL,
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE insurance_estimates (           -- one procedure, one coverage, at an instant
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  procedure_id    UUID NOT NULL REFERENCES procedures (id),
  coverage_id     UUID NOT NULL REFERENCES coverages (id),
  fee             BIGINT NOT NULL,
  allowed         BIGINT NOT NULL,
  steps           JSONB NOT NULL,          -- [{"rule": id, "effect": "downgrade", "amount": -9000}...]
  insurance_est   BIGINT NOT NULL,
  patient_est     BIGINT NOT NULL,
  write_off_est   BIGINT NOT NULL DEFAULT 0,
  basis           TEXT NOT NULL CHECK (basis IN ('computed', 'predetermination')),
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lab_cases (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  patient_id      UUID NOT NULL REFERENCES patients (id),
  procedure_id    UUID NOT NULL REFERENCES procedures (id),
  lab             TEXT NOT NULL,
  prescription    JSONB NOT NULL,          -- tooth, material, shade, instructions
  sent_via        TEXT CHECK (sent_via IN ('physical', 'scan')),
  sent_at         TIMESTAMPTZ,
  due_on          DATE NOT NULL,
  received_at     TIMESTAMPTZ,
  seat_appointment_id UUID REFERENCES appointments (id),
  lab_fee         BIGINT
);

CREATE TABLE ai_findings (                   -- decision support output on an image
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  patient_id      UUID NOT NULL REFERENCES patients (id),
  document_id     UUID NOT NULL REFERENCES documents (id),  -- the image
  vendor          TEXT NOT NULL,
  model_version   TEXT NOT NULL,
  clearance       TEXT,                    -- the FDA submission number it runs under
  finding         TEXT NOT NULL,           -- 'caries', 'calculus', 'bone_loss', 'radiolucency'
  tooth           TEXT,
  region          JSONB,                   -- the outline on the image
  confidence      NUMERIC(4,3),
  review          TEXT CHECK (review IN ('confirmed', 'rejected', 'not_reviewed')),
  reviewed_by     UUID REFERENCES practitioner_roles (id),
  charted_procedure_id UUID REFERENCES procedures (id)
);
```

The unscheduled treatment list is a query, not a table:

```sql
SELECT p.patient_id, SUM(e.patient_est + e.insurance_est) AS value, MIN(tp.created_at) AS since
FROM treatment_plan_items i
JOIN treatment_plans tp ON tp.id = i.plan_id
JOIN procedures p ON p.id = i.procedure_id AND p.status = 'planned'
LEFT JOIN LATERAL (SELECT * FROM insurance_estimates x WHERE x.procedure_id = p.id
                   ORDER BY computed_at DESC LIMIT 1) e ON TRUE
WHERE i.accepted IS NOT FALSE AND i.appointment_id IS NULL
GROUP BY p.patient_id;
```

Design notes:

- **Estimates are append-only snapshots.** Every recomputation is a new row with its steps; a presentation points at the snapshot it showed. Rules change; history doesn't.
- **Benefit rules carry their source and verification date,** and the estimate engine prefers a current predetermination over a computed estimate, and a verified rule over an assumed one.
- **The PMS is the system of record for procedures and plans.** When the PMS owns treatment plans, these tables are a synced, read-mostly copy keyed by the PMS's IDs (`patient_identifiers` and the integration's cursor), and the engagement product writes back only what the integration allows.

## Auditing

- **Every estimate as shown,** with the rules applied and their sources, linked to the presentation and the patient's acceptance.
- **Every treatment plan version** presented, accepted or declined, with the signed document.
- **Benefit rule changes,** who entered or verified each rule and from what source.
- **AI findings and their review,** with model version and clearance, so a finding's influence on a chart can be reconstructed.
- **Lab cases** sent, due and received against their seat appointments.

## What This Means for the System You Build

- **Code every procedure with tooth, surfaces and area,** and keep the tooth's history; estimates and AI depend on it.
- **Store perio exams as dated measurement sets per tooth and site,** and compare them.
- **Version treatment plan presentations** with the estimates as shown, and track phases, alternatives and acceptance per item.
- **Make unscheduled treatment a first-class list,** and chase it with minimum-necessary messages.
- **Estimate with explicit rules** (category, coinsurance, deductible, maximum, frequency, age, downgrade, waiting period), each with a source and a verification date, and show every step.
- **Use predeterminations when they're current** and flag drift from the procedure performed.
- **Link images by the bridge's patient ID,** and reach the imaging store for claims attachments and AI.
- **Track lab cases against seat appointments.**
- **Record AI findings as decision support with provenance** and the dentist's review, inside the product's cleared indications.

## References

**Standards and regulators**

- [ADA: CDT, Code on Dental Procedures and Nomenclature](https://www.ada.org/publications/cdt), the ADA's code, the Code Maintenance Committee's annual meeting, the March 2026 meeting for CDT 2027
- [FDA: Artificial Intelligence-Enabled Medical Devices list](https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/list-artificial-intelligence-enabled-medical-devices), dental AI clearances from Pearl, Overjet, VideaHealth, Diagnocat, Dentsply Sirona, 3Shape and others, with decision dates

**Vendors**

- [Pearl](https://www.hellopearl.com/), Second Opinion's 2D and 3D clearances, the "26+" clearances figure, integrations
- [Overjet](https://www.overjet.com/), FDA-cleared vision AI, Ivy benefit verification, Voice documentation, payer products
- [Open Dental: Clinics](https://www.opendental.com/manual/clinics.html), multiple locations in one database, clinic assignment from operatories, claims taking their clinic from procedures
- [Planet DDS: Denticon](https://www.planetdds.com/denticon/), cloud PMS, practice count, DSO implementation time
- [Dental Intelligence](https://www.dentalintel.com/), PMS integrations, AI receptionist and data Q&A
