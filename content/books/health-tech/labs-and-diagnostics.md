+++
title = "Labs, Imaging & Diagnostics"
nav_title = "Labs & Diagnostics"
description = "Lab and imaging orders and results, CLIA and its report rules, Labcorp and Quest connectivity, at-home testing, critical values and results release under Cures."
category = "Health Tech Industry"
order = 1945
part = "Care Delivery"
tags = ["health-tech", "labs", "clia", "imaging", "results", "information-blocking"]
+++

A diagnostic test is an order that comes back as data. A clinician orders a lipid panel or a chest X-ray; a specimen is drawn or a patient is scanned; a laboratory or an imaging center performs the test and returns a result; the result lands in the chart, a clinician acts on it, and since the Cures Act, the patient usually sees it at about the same time. Each hop crosses an organization boundary: the ordering practice, a reference laboratory like Labcorp or Quest, a hospital lab, an imaging center, a consumer testing company. And each hop has its own identifiers (the order number, the requisition, the accession number, the specimen ID), its own standard (HL7 v2 messages in most interfaces, FHIR increasingly, DICOM for images) and its own rules (CLIA for the lab, HIPAA and information blocking for release).

The core records are `orders` (FHIR ServiceRequest), `observations` (Observation) and `documents` (DocumentReference) in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model); this chapter adds specimens, diagnostic reports, critical value notifications and release decisions. The message formats themselves belong to [HL7 v2 & Interfaces](/books/health-tech/hl7-v2) and [FHIR](/books/health-tech/fhir), imaging storage to [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda), and lab code systems to [Terminologies & Code Sets](/books/health-tech/terminology-and-coding). Here: the order-to-result loop, how labs connect, CLIA, at-home and consumer-initiated testing, imaging orders, critical values, and results release under information blocking.

## How the Platforms Do It

As of October 2026, from each company's own pages:

| Company | Role | What its public pages describe |
| --- | --- | --- |
| **Labcorp Link** | A reference lab's ordering and results portal | An "electronic health record (EHR) companion browser-based solution" that brings in orders from "electronic health records and online portals," takes add-on tests from "your EHR, Labcorp Link and manual requisitions," and lets users "view all orders in a single, unified interface, regardless of how the orders were placed" |
| **Labcorp OnDemand** | Consumer-purchased lab tests | Tests bought online by adults 18 or older; a physician reviews and orders the test, included in the price; Labcorp "does not bill your insurance company"; at-home kits or a Labcorp location; results in the Labcorp Patient account, with urgent results also by phone or mail; payment by card or HSA/FSA |
| **Everlywell** | At-home test kits | Kits shipped to the consumer; "Everlywell only uses CLIA-certified laboratories"; results reviewed by "a physician – from a partner physician network" before release, typically within 5 business days; a call for critical values; prescribing for certain positive sexual health results in 47 listed states |
| **Health Gorilla** | Lab ordering network and exchange | "Order labs from 120+ vendors electronically"; a TEFCA QHIN onboarding organizations, and "the nation's only dual-designated QHIN & QHIO" |

Three patterns. **The lab owns a portal even when the EHR is connected.** Labcorp's tool exists because orders arrive by interface, by portal and on paper, and the lab needs one view of them; practices without an interface still order and read results there. **Aggregators sell one connection to many labs.** An EHR or a telehealth platform that can't build an interface to every regional lab uses a network like Health Gorilla's. **Consumer testing keeps a physician in the loop.** Both Labcorp OnDemand and Everlywell put a physician between the consumer and the order or the result, because the test still needs an ordering or reviewing clinician and someone to call when a value is critical.

## The Order-to-Result Loop

The loop, with the identifiers each step adds:

1. **Order.** The clinician orders tests with a diagnosis for medical necessity, a priority (routine, stat), the performing lab, and the patient's coverage for billing. The order has the practice's order number (the placer number).
2. **Requisition and specimen.** The order prints or transmits as a requisition; the specimen is collected in the office, at a patient service center or at home, labeled, and sent. Each specimen gets an ID and a collection time; specimen type and source travel with it.
3. **Accession.** The lab receives the specimen and assigns its own number (the filler number or accession number). From here the lab's number is how it identifies the work.
4. **Result.** The lab returns results, often in parts: preliminary, then final, then corrected. Each result is a coded observation (LOINC for the test, with a value, units, a reference range and an abnormal flag), grouped into a report.
5. **Review and action.** A clinician reviews, signs off and acts: a message to the patient, a refill, a referral, a repeat test. Results that never get reviewed are the patient safety failure every results inbox is built to prevent.
6. **Release.** The patient sees the result through the portal or an app, under the rules below.

What makes this hard in software: **the order and the result are matched by two numbers from two systems,** and a result can arrive for an order the practice never sent electronically (a paper requisition, a lab-initiated reflex test, a test added by phone). **Results are revised:** a corrected result replaces a final one, and the chart has to show both, which one was current when a clinician acted, and who was told about the change. **Units and ranges come from the performing lab,** so the same test from two labs can't be graphed on one axis without care.

## How Labs Connect

Three connection styles coexist, often for the same practice:

- **A point-to-point interface** between the EHR and a lab, typically HL7 v2 order and result messages over a VPN or an interface engine, set up per lab and per practice with a compendium (the lab's test catalog with its codes, specimen requirements and ask-at-order-entry questions). This is how high-volume relationships run.
- **An aggregator network** (Health Gorilla's 120+ vendors is one) that normalizes ordering and results across labs behind one API, increasingly FHIR.
- **The lab's own portal** (Labcorp Link is one), used where there is no interface or as the lab's unified view.

Building it in:

- **The compendium is data per lab, versioned.** Orderable tests, their codes, required questions, specimen types and container rules change; an order built from a stale compendium is rejected or drawn in the wrong tube.
- **Map result codes, don't trust names.** The lab's local code maps to LOINC where the lab provides it; a result arriving without a known code is queued for mapping, not filed under a guess ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)).
- **Unsolicited results are normal.** A result with no matching order goes to a match queue keyed on patient identifiers and the lab's numbers, never auto-filed to a likely patient ([Match Before Create](/docs/architecture/record-linkage#match-before-create)). Patient matching across organizations is [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity)'s subject.
- **Billing follows the order.** Who bills the test (the lab bills the payer, the practice is billed by the lab, or the patient pays the lab) is decided at order time from the coverage and the lab's contracts, and recorded on the order.

## CLIA

The Clinical Laboratory Improvement Amendments of 1988 set the conditions "that all laboratories must meet to be certified to perform testing on human specimens" (42 CFR 493.1). CMS says CLIA "covers approximately 320,000 laboratory entities," which includes many physician offices that run a few tests. Requirements scale with test complexity ("The more complicated the test, the more stringent the requirements"), and 42 CFR 493.5 lists five certificate types: a certificate of registration, a certificate of waiver, a certificate for provider-performed microscopy (PPM) procedures, a certificate of compliance and a certificate of accreditation. CMS's application guidance adds the operating facts software needs:

- **Waived testing** is limited to "simple laboratory examinations and procedures" that are cleared by FDA for home use, have a negligible chance of error, or pose no reasonable risk of harm if done incorrectly (493.15). Every certificate type allows waived testing.
- **Non-waived testing** is "moderate and high complexity tests, including Provider-performed Microscopy (PPM)," and its laboratory directors must meet CLIA's education, training and experience requirements.
- A laboratory applies for "the certificate that matches the highest level of test complexity your facility performs," and certificates "Are effective for two years."
- State survey agencies enforce CLIA standards; accredited laboratories answer to their CMS-approved accreditation organization.

For software, CLIA matters in three places. **The practice's own certificate limits what it can result in-house:** a point-of-care test is only orderable as in-office if the location's certificate covers it, so the certificate (number, type, valid dates) belongs on the location and gates the test catalog. **The test report has required contents.** 42 CFR 493.1291(c) requires patient identification, "The name and address of the laboratory location where the test was performed," the report date, the test performed, the specimen source when appropriate, the result with units or interpretation, and the condition of unacceptable specimens. A system that reformats lab results for the chart or the patient has to keep every one of those, because the displayed result is still the lab's report. **Critical values must reach someone** (below).

**Laboratory developed tests.** FDA's final rule treating laboratory developed tests as devices (published May 6, 2024) was vacated by a federal district court on March 31, 2025, and FDA published a rule on September 19, 2025 implementing the vacatur by restoring the prior definition of in vitro diagnostic products. As of October 2026, LDTs are regulated under CLIA, not FDA premarket review, which is why a lab's test catalog carries tests with no FDA clearance.

## At-Home and Consumer-Initiated Testing

Consumer testing comes in two shapes, and both keep a clinician in the record:

- **Consumer-initiated, clinician-ordered.** The consumer buys the test; a physician (often from a network the company contracts) reviews and orders it; the specimen is collected at a patient service center or at home; the result goes to the consumer's account. Labcorp OnDemand works this way and doesn't bill insurance.
- **At-home kits.** The consumer collects a sample (a finger-prick card, a swab) and mails it to a CLIA-certified lab; a physician reviews results before release; a critical value triggers a phone call; a positive result may lead to treatment by a network clinician in states where that's allowed, as Everlywell describes for 47 states.

The data model is the same order and result with three differences: **the ordering clinician isn't the consumer's own doctor**, so the order records the network clinician and whether a copy goes anywhere else; **the consumer is the payer**, often with HSA or FSA funds ([FSA and HSA Cards at the Counter](/books/payments/payments-by-vertical#fsa-and-hsa-cards-at-the-counter)); and **the follow-up duty is the company's**, which means a critical value workflow with phone outreach, not just a portal notification.

## Imaging Orders

An imaging order is an order for a procedure performed on the patient rather than a specimen: a modality (X-ray, ultrasound, CT, MRI, nuclear medicine, mammography), a body part, contrast or not, a clinical indication, and often a prior authorization from the payer for advanced imaging ([Prior Authorization](/books/health-tech/prior-authorization) owns that). The imaging center schedules it, performs it, stores the images in a PACS under DICOM with an accession number that ties images to the order, and a radiologist dictates a report. The chart gets the report as a document and structured findings where available, and a link or viewer for the images; the images themselves rarely live in the ordering practice's system. Dental and optometry images are captured in the office and are covered in [Dental Practice](/books/health-tech/dental-practice#imaging-and-bridges) and [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda#dental-imaging-and-bridges).

The record consequences: the imaging order's status runs through scheduling and performance as well as resulting, so it has more states than a lab order (scheduled, arrived, performed, preliminary read, final read, addended); the accession number is the join key to images; and an addendum to a report is a revision with the same audit needs as a corrected lab result.

## Critical Values

42 CFR 493.1291(g) requires the lab to "immediately alert the individual or entity requesting the test and, if applicable, the individual responsible for using the test results when any test result indicates an imminently life-threatening condition, or panic or alert values." The lab calls; the practice's software has to make sure the call results in a human acting:

- **A critical value is an event with an owner,** not a flag on a result. It is assigned to the ordering clinician or a covering clinician, with an acknowledgment deadline set by the practice's policy, and escalates when unacknowledged.
- **Phone calls are recorded as communications.** Who at the lab called, who at the practice took it, read-back, time, and what was done ([Communications](/books/health-tech/health-tech-business#the-core-data-model)).
- **After hours is the design case.** A critical value at 2 a.m. for a practice that is closed goes to the on-call clinician or the lab's own escalation; the software's job is a reachable on-call roster and a record of each attempt.

## Results Release Under Cures

The 21st Century Cures Act's information blocking rules made immediate release the default. ONC's FAQs, as updated in September 2025, are blunt: delaying release of results "in order to allow an ordering clinician to review the results" would likely be an interference, and so is electronic health information that is not available "for any period of time" through the portal. A blanket delay doesn't qualify for the Preventing Harm exception: "Blanket delays that affect a broad array of routine results do not qualify." The exception requires a risk "determined on an individualized basis in the exercise of professional judgment by a licensed health care professional who has a current or prior clinician-patient relationship with the patient," or one arising from misidentified or erroneous data (45 CFR 171.201). And ONC's FAQ on patient choice says following "an individual patient's" request to delay is likely not interference, as long as the delay is "for no longer than necessary to fulfill each patient's request."

HIPAA sets a different, slower clock for a patient's request for records: a covered entity must act "no later than 30 days after receipt of the request," with one extension (45 CFR 164.524). CLIA has its own patient-access rule since the 2014 rule effective April 7, 2014: a laboratory may give completed test reports directly to a patient or their personal representative on request, once its authentication process identifies the report as the patient's (493.1291(l)). In practice the portal's release rule is information blocking's, because it is the strictest.

What a release engine looks like:

| Decision | Who can make it | What's recorded |
| --- | --- | --- |
| **Release now** | The default for every result and report | The release time, matched to the result's final or corrected time |
| **Patient-requested delay** | The patient or representative, in advance, per category (for example, "let my doctor call me first about biopsies") | The request, its scope, its end condition, and when it ended |
| **Individualized harm hold** | A licensed clinician with a relationship to the patient, for that patient and that result | The clinician, the reason under the exception's terms, and a review date |
| **Data quality hold** | The system or a staff member, for a result suspected misfiled or erroneous | The suspicion, the investigation, and the release or correction |

Holds are rare by design and visible in reports. An engine whose most common path is a hold, or whose hold rules apply to a test type rather than a patient, is the blanket delay ONC describes. The policy depth (actors, exceptions, penalties) belongs to [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification); the portal side is [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access#results-release-and-open-notes).

## How to Build It

The core `orders` row already carries `kind` (lab, imaging, referral), the performer organization, priority and status, and `observations` carries the code, value, unit and status ([The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model)). This chapter adds the identifiers, specimens, reports, critical values and release decisions:

```sql
ALTER TABLE orders
  ADD COLUMN placer_number      TEXT,          -- our order number
  ADD COLUMN filler_number      TEXT,          -- the performer's accession or order number
  ADD COLUMN compendium_version TEXT,          -- the lab catalog version the order was built from
  ADD COLUMN bill_to            TEXT CHECK (bill_to IN ('payer', 'practice', 'patient')),
  ADD COLUMN ordered_via        TEXT CHECK (ordered_via IN ('interface', 'network',
                                  'lab_portal', 'paper', 'consumer')),
  ADD COLUMN status_detail      TEXT;          -- imaging: scheduled, arrived, performed, read

CREATE TABLE clia_certificates (         -- what a location may test in-house
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id   UUID NOT NULL REFERENCES locations (id),
  clia_number   TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('registration', 'waiver', 'ppm', 'compliance',
                  'accreditation')),
  valid_during  DATERANGE NOT NULL,          -- certificates run two years
  EXCLUDE USING GIST (location_id WITH =, valid_during WITH &&)
);

CREATE TABLE specimens (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  order_id         UUID NOT NULL REFERENCES orders (id),
  specimen_type    TEXT NOT NULL,        -- coded
  source_site      TEXT,
  collected_at     TIMESTAMPTZ,
  collected_by     TEXT CHECK (collected_by IN ('practice', 'lab_psc', 'patient_at_home',
                     'other')),
  container_label  TEXT,                 -- the barcode on the tube or kit
  received_at      TIMESTAMPTZ,          -- at the lab
  condition        TEXT                  -- hemolyzed, insufficient: an unacceptable specimen
);

CREATE TABLE diagnostic_reports (        -- FHIR DiagnosticReport: the lab's or radiologist's report
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  order_id            UUID REFERENCES orders (id),   -- null until matched
  patient_id          UUID REFERENCES patients (id), -- null until matched
  performer_org_id    UUID NOT NULL REFERENCES organizations (id),
  performing_lab_clia TEXT,               -- the performing location, required on the report
  filler_number       TEXT NOT NULL,
  version             INT NOT NULL DEFAULT 1,
  status              TEXT NOT NULL CHECK (status IN ('preliminary', 'final', 'corrected',
                        'amended', 'cancelled')),
  issued_at           TIMESTAMPTZ NOT NULL,
  document_id         UUID REFERENCES documents (id), -- the report as received, kind 'lab_report'
  match_status        TEXT NOT NULL DEFAULT 'matched' CHECK (match_status IN ('matched',
                        'pending_review', 'unmatched')),
  reviewed_by         UUID REFERENCES practitioner_roles (id),
  reviewed_at         TIMESTAMPTZ,
  UNIQUE (organization_id, performer_org_id, filler_number, version)
);

ALTER TABLE observations
  ADD COLUMN diagnostic_report_id UUID REFERENCES diagnostic_reports (id),
  ADD COLUMN local_code       TEXT,       -- the lab's own code, always kept beside LOINC
  ADD COLUMN reference_range  TEXT,       -- from the performing lab
  ADD COLUMN interpretation   TEXT CHECK (interpretation IN ('normal', 'low', 'high',
                                'critical_low', 'critical_high', 'abnormal')),
  ADD COLUMN supersedes_id    UUID REFERENCES observations (id);  -- a correction points back

CREATE TABLE critical_value_events (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  observation_id    UUID NOT NULL REFERENCES observations (id),
  received_via      TEXT NOT NULL CHECK (received_via IN ('phone', 'interface', 'portal')),
  communication_id  UUID REFERENCES communications (id),   -- the lab's call, with read-back
  assigned_to       UUID NOT NULL REFERENCES practitioner_roles (id),
  acknowledge_by    TIMESTAMPTZ NOT NULL,                   -- from the practice's policy
  acknowledged_at   TIMESTAMPTZ,
  escalated_to      UUID REFERENCES practitioner_roles (id),
  action_taken      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE result_releases (           -- every release decision, immediate or held
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  diagnostic_report_id UUID REFERENCES diagnostic_reports (id),  -- null: a standing preference
  scope                TEXT,              -- a patient preference's category, e.g. 'pathology'
  decision             TEXT NOT NULL CHECK (decision IN ('released', 'patient_request',
                         'individualized_harm', 'data_quality')),
  decided_by           UUID,              -- null for the automatic release; else the person
  reason               TEXT,
  review_on            DATE,
  released_at          TIMESTAMPTZ,       -- when the patient could see it
  CHECK (decision = 'released' OR reason IS NOT NULL),
  CHECK (decision IN ('released', 'patient_request') OR diagnostic_report_id IS NOT NULL)
);
```

Design decisions:

- **Two numbers per order.** The placer number is ours, the filler number is theirs; a report is unique per performer, filler number and version, so a resend is idempotent and a correction is a new version.
- **Reports and observations are separate.** The report is what the lab issued, kept as received with its required elements; observations are the coded values for graphs, rules and decision support, each pointing back to its report and, for corrections, to what it superseded.
- **Unmatched is a status.** A result that can't be matched to an order and patient waits in review rather than filing to a guess.
- **Critical values are owned events** with a deadline and escalation, linked to the communication that delivered them.
- **Release is a default with recorded exceptions.** Every report gets a `result_releases` row; a clinician's hold is per patient and per result by constraint; a patient preference can cover a category; each hold has a reason and an end. Hold rates are reportable.
- **CLIA certificates gate in-house tests** per location and date.
- **Events:** `order.sent`, `specimen.received`, `report.received`, `report.corrected`, `result.critical`, `result.released`, `report.reviewed`, through the [outbox](/docs/architecture/events#the-transactional-outbox) to inboxes, the portal and notifications.

## Auditing

- **Order to result.** For every order, its numbers, specimens, each report version, who reviewed it and when, and what was released to the patient and when; unreviewed results by age are a daily report, not an audit finding.
- **Corrections.** Each corrected or amended result with the version it replaced, whether a clinician had acted on the earlier one, and who was notified of the change.
- **Critical values.** Receipt, assignment, acknowledgment time against the deadline, escalations and action, because a missed critical value is a patient safety event and a liability claim.
- **Release decisions.** Every hold with its kind, author, reason and duration, and the share of results released immediately, which is the number an information blocking complaint will test ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Mapping changes.** Who changed a local-to-LOINC mapping and when, since one wrong mapping reclassifies every result filed under it.

## What This Means for the System You Build

- **Carry both order numbers** and make report versions idempotent, so resends and corrections never duplicate or overwrite.
- **Store the lab's report as issued** with its CLIA-required elements, and derive coded observations from it, keeping local codes beside LOINC.
- **Queue unsolicited and unmatched results** for review instead of filing them to a likely patient.
- **Version each lab's compendium** and build orders from the current one.
- **Model critical values as owned, timed events** with escalation and a recorded phone call.
- **Release results immediately by default;** allow holds only for a patient's own request, an individualized clinician judgment, or a data problem, each recorded with a reason and an end.
- **Gate in-house testing on the location's CLIA certificate** and dates.
- **Treat consumer testing as the same order with a network clinician,** cash payment and a company-owned follow-up duty.

## References

**Regulations**

- [42 CFR 493.1 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=493&section=493.1), CLIA's scope for laboratories testing human specimens
- [42 CFR 493.5 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=493&section=493.5), the five certificate types
- [42 CFR 493.15 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=493&section=493.15), what makes a test waived
- [42 CFR 493.1291 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=493&section=493.1291), required report contents, critical value alerts, patient access to completed reports
- [Federal Register: CLIA Program and HIPAA Privacy Rule, Patients' Access to Test Reports (February 6, 2014)](https://www.federalregister.gov/api/v1/documents/2014-02280.json), effective April 7, 2014
- [45 CFR 164.524 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=164&section=164.524), 30 days to act on an access request, one extension
- [45 CFR 171.201 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=171&section=171.201), the Preventing Harm exception's individualized determination and data-quality grounds
- [Federal Register: Medical Devices, Laboratory Developed Tests (May 6, 2024)](https://www.federalregister.gov/documents/2024/05/06/2024-08935/medical-devices-laboratory-developed-tests), the LDT final rule
- [Federal Register: Laboratory Developed Tests, Implementation of Vacatur (September 19, 2025)](https://www.federalregister.gov/documents/2025/09/19/2025-18239/regulation-identification-number-0910-aj05-medical-devices-laboratory-developed-tests-implementation), the March 31, 2025 vacatur and the restored definition

**Agencies**

- [CMS: Clinical Laboratory Improvement Amendments](https://www.cms.gov/medicare/quality/clinical-laboratory-improvement-amendments), about 320,000 laboratory entities, requirements by complexity, state survey agencies and accreditation organizations
- [CMS: Apply for a CLIA certificate](https://www.cms.gov/medicare/health-safety-standards/clinical-laboratory-improvement-amendments-clia/getting-started-clia/apply-clia-certificate), non-waived testing including PPM, applying at the highest complexity performed, two-year certificates that all allow waived testing
- [ASTP/ONC FAQ: When would a delay be interference?](https://healthit.gov/faq/when-would-delay-fulfilling-request-access-exchange-or-use-ehi-be-considered-interference-under/), delays for clinician review and portal unavailability as likely interference (September 12, 2025)
- [ASTP/ONC FAQ: Blanket delays and the Preventing Harm exception](https://healthit.gov/faq/would-preventing-harm-exception-cover-blanket-several-day-delay-release-laboratory-or-other/), blanket delays don't qualify (September 14, 2025)
- [ASTP/ONC FAQ: A patient's request to delay results](https://healthit.gov/faq/can-actor-grant-patients-request-delay-release-patients-test-results-eg-laboratory-or-image/), honoring a patient's request, no longer than necessary (September 12, 2025)

**Companies**

- [Labcorp Link](https://www.labcorp.com/labcorp-link), the EHR companion portal and unified order view
- [Labcorp OnDemand](https://www.labcorp.com/patients/labcorp-ondemand), consumer purchase, physician order, no insurance billing, results and urgent result contact
- [Everlywell: How it works](https://www.everlywell.com/how-it-works/), CLIA-certified labs, partner physician review, critical value calls, prescribing in 47 states
- [Health Gorilla](https://www.healthgorilla.com/), lab ordering with 120+ vendors, QHIN and QHIO designation
