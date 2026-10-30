+++
title = "Hospitals & Health Systems"
nav_title = "Hospitals & Health Systems"
description = "Inpatient versus ambulatory, ADT and bed management, the Epic-centered enterprise, Conditions of Participation, EMTALA, 340B, price transparency, selling in."
category = "Health Tech Industry"
order = 1947
part = "Care Delivery"
tags = ["health-tech", "hospitals", "adt", "emtala", "340b", "price-transparency", "epic"]
+++

A hospital is a building full of systems that agree on one thing: where every patient is right now. The emergency department registers a walk-in, a bed board shows which rooms are clean, the lab, pharmacy, radiology and dietary systems each need to know the patient was admitted to 4 West bed 12, and billing needs to know whether the stay is inpatient or outpatient, because Medicare pays them under different systems. A health system is several hospitals plus clinics, urgent care, imaging centers, labs and home health, usually on one enterprise EHR and a long tail of departmental systems connected to it. The AHA counts 6,100 US hospitals, 5,121 of them community hospitals, with 907,216 staffed beds and about 35.7 million admissions in its 2024 survey data.

For a vendor, a health system is the largest and slowest customer in the book: it buys through security review, integrates through the EHR vendor's programs, and runs under federal Conditions of Participation that reach into its software. This chapter covers inpatient versus ambulatory care and hospital at home, the ADT event stream, bed management, the Epic-centered enterprise and its peers, the Conditions of Participation, EMTALA, the 340B drug pricing program, hospital price transparency, and what a vendor must clear to sell in. It extends `encounters`, `locations` and `organizations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The HL7 v2 messages themselves belong to [HL7 v2 & Interfaces](/books/health-tech/hl7-v2); patient estimates and the No Surprises Act to [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience); security programs to [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture).

## How the Platforms Do It

As of October 2026, from each vendor's own pages:

| Vendor | What it is | What its public pages describe |
| --- | --- | --- |
| **Epic** | The enterprise EHR most associated with large health systems | open.epic lists "over 750 no-cost APIs and interfaces," "322 billion annual web service transactions," "over 50 playbooks," and US Core 8 and USCDI v5 support (its August 2026 release); Vendor Services gives developers integration technology, extra documentation, a larger sandbox and support; Showroom "helps you discover services and products for use with Epic" |
| **Oracle Health** | The Millennium EHR (formerly Cerner) | Millennium Platform APIs "allow you to use the HL7 FHIR standard in your SMART application"; "Oracle no longer supports DSTU 2 FHIR APIs" in favor of R4; app registration with a published access and fees page |
| **MEDITECH** | Expanse, an EHR across acute and other settings | Described as "cloud-native, highly scalable"; settings from acute and emergency to home care, behavioral health, oncology and post-acute; MEDITECH-as-a-Service cloud hosting; customers from HCA Healthcare (182 hospitals) to a rural critical access hospital and international systems |
| **TeleTracking** | Capacity and patient flow | The Operations IQ platform for inpatient access and throughput, transfer and command centers; says it covers "30% of hospital beds in the United States" and "34% of discharges processed," with 150+ health systems |

Three patterns. **The enterprise EHR is the platform.** Epic and Oracle each publish APIs, sandboxes and vendor programs, and a third-party product in a health system lives inside those programs (Epic's open.epic and Vendor Services, Oracle's app registration). **Departmental systems still exist and integrate by event.** Bed management, transfer centers, labs, imaging and dietary systems subscribe to the hospital's patient movement events; TeleTracking's footprint shows how much of the country's capacity runs through one non-EHR vendor. **Hosting moved to the vendor.** MEDITECH sells its EHR as a service, and hosted EHRs mean the hospital's integration points are network connections to the vendor's environment rather than a server room.

## Inpatient, Ambulatory and Hospital at Home

The encounter's **class** decides how it is paid and which rules apply:

- **Inpatient.** A formal admission by a physician's order. For Medicare, 42 CFR 412.3(d)(1) is the two-midnight rule: an admission is "generally appropriate for payment under Medicare Part A when the admitting physician expects the patient to require hospital care that crosses two midnights."
- **Outpatient and observation.** A patient in a hospital bed under observation is an outpatient, paid under the outpatient system, even if they stay overnight. Whether a stay is inpatient or observation is a recorded decision with a time, because it changes the patient's cost sharing and the hospital's payment, and it can change during the stay.
- **Emergency.** An ED visit is an outpatient encounter that may become an admission; EMTALA governs the start of it (below).
- **Ambulatory.** Clinic visits, including in hospital-owned practices, under the health system's outpatient and professional billing.
- **Hospital at home.** Medicare's Acute Hospital Care at Home waiver lets approved hospitals provide inpatient-level care in the patient's home. As of October 2026, section 6210 of the Consolidated Appropriations Act, 2026 extends it to September 30, 2030 and requires an HHS study and report by September 30, 2029. The encounter is an inpatient-level stay whose location is a home (the core's `home` class), which breaks every bed board that assumes a bed is a room in a building.
- **Rural emergency hospital.** A Medicare provider type that offers emergency, observation and outpatient care where "the annual per patient average length of stay does not exceed 24 hours," with no inpatient services except a distinct-part skilled nursing facility (42 CFR 485.502). Its encounters are outpatient by definition.

My rule: **class and status are effective-dated on the encounter**, never a single column overwritten when the order changes. An ED visit that became observation and then inpatient has three intervals, each with the order that started it, and billing reads the history.

## ADT: The Hospital's Event Stream

ADT (admit, discharge, transfer) is the stream of patient movement and registration events every departmental system subscribes to. In most hospitals it is HL7 v2 messages from the EHR's registration module through an interface engine to dozens of downstream systems: registration, pre-admission, admission, transfer between units or beds, leave of absence, discharge, cancellations of each of those, demographic and insurance updates, and patient merges. The federal certification standard for these notifications is HL7 v2.5.1 ADT, which is what triggers the Conditions of Participation's notification requirement: a hospital whose system conforms must notify post-acute providers and the patient's primary care practitioner at ED registration, admission, discharge and transfer (42 CFR 482.24(d)), the receiving side of which is [Referrals & Care Coordination](/books/health-tech/referrals-and-care-coordination#hospital-discharge-and-event-notifications).

What consuming ADT teaches:

- **Events are corrections as often as facts.** A transfer is cancelled, a discharge is undone, an admit is backdated; the consumer applies cancels and updates to its own state and keeps the history, rather than treating each message as a new truth.
- **Merges are the dangerous message.** Two patient records combined in the EHR must be combined downstream, and an unmerge has to split them again; the consumer records the merge with both identifiers ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)).
- **Order is per patient, and imperfect.** Messages for one patient must be applied in order, and interface engines can reorder or replay; consumers key on the message control ID, process idempotently and detect gaps ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent), [Ordering](/docs/architecture/events#ordering)).
- **The location is a hierarchy.** Facility, building, unit, room and bed, each with its own identifiers, and the bed is the leaf every downstream system cares about.

## Bed Management and Patient Flow

Capacity is the hospital's daily operating problem: patients waiting in the ED for an inpatient bed, beds occupied by patients ready for discharge, rooms dirty and waiting for environmental services, and transfers requested from other hospitals. Bed management software keeps a live board of every bed's state, assigns patients to beds, dispatches cleaning, tracks pending discharges and runs the transfer center that accepts patients from outside. TeleTracking's figures (30% of US beds) show it is often a separate system from the EHR, fed by ADT and feeding assignments back.

A bed has its own state machine, separate from the patient's: available, assigned, occupied, pending discharge, dirty, cleaning, blocked (isolation, maintenance, staffing). Assignment is a hold on a resource with a short life, and two patients assigned to one bed is the double booking every reservation system prevents ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)). The metrics hospitals run on (ED boarding time, discharge-order-to-departure, bed turnaround, transfer acceptance time) are all intervals between events, so they come from the event history, not from the board's current state.

## The Epic-Centered Enterprise

A large health system typically runs one enterprise EHR for clinical documentation, orders, results, scheduling, registration and billing across hospitals and clinics, plus specialized systems where the EHR's module isn't used. For a vendor, that changes integration in four ways:

- **Integration goes through the EHR vendor's program.** Epic publishes no-cost APIs on open.epic and offers Vendor Services for deeper integration and a larger sandbox; Oracle Health publishes FHIR R4 APIs and app registration. The program's terms, the APIs in scope and any fees are the vendor's, and the health system still has to approve and configure each connection. [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir#getting-an-app-into-an-ehr) covers the app programs in depth.
- **The health system's interface team owns the connection.** Even with a published API, a hospital's integration team schedules the build, maps codes and tests in their environment; a vendor's timeline is the interface team's queue.
- **One EHR, many instances.** Each health system's EHR is configured differently: order codes, locations, departments, workflows. A vendor that integrates with "Epic" integrates with each customer's Epic, and the mapping is per customer data.
- **The EHR vendor's directory is a sales channel.** Showroom lists products for use with Epic; being listed is a discovery path, not an integration.

## Conditions of Participation

A hospital that bills Medicare must meet the Conditions of Participation in 42 CFR part 482, surveyed by state agencies or accrediting organizations. The part's structure is a map of what a hospital is: subpart B administration (governing body, patient's rights), subpart C basic hospital functions (quality assessment, medical staff, nursing, medical record services, pharmacy, radiology, laboratory, food and dietetics, utilization review, infection control, discharge planning, and others from 482.21 to 482.45), subpart D optional services (surgery, anesthesia, rehabilitation, emergency services and others), and subpart E specialty hospitals including transplant programs.

The conditions that reach directly into software:

- **Medical record services (482.24),** including the electronic event notifications above, and the requirement that records be accurate, promptly completed, authenticated and retained.
- **Patient's rights (482.13),** including access to records and the notice of rights at admission, which registration workflows deliver and record.
- **Discharge planning (482.43),** with the information transfer to post-acute providers and the quality data for patient choice.
- **Laboratory services (482.27),** which ties hospital labs to CLIA ([Labs, Imaging & Diagnostics](/books/health-tech/labs-and-diagnostics#clia)).

A vendor's product doesn't hold a Condition of Participation itself, but it is evidence during a survey: if the hospital uses your software for discharge information or notifications, your logs are how the hospital proves compliance.

## EMTALA

The Emergency Medical Treatment and Labor Act (42 USC 1395dd) requires a hospital with an emergency department to "provide for an appropriate medical screening examination within the capability of the hospital's emergency department" to anyone who comes and requests care, and to stabilize an emergency medical condition or arrange an appropriate transfer. The regulation, 42 CFR 489.24, applies to everyone "(whether or not eligible for Medicare benefits and regardless of ability to pay)." The statutory civil money penalty is up to $50,000 per violation, or $25,000 for a hospital with fewer than 100 beds, adjusted for inflation by regulation.

EMTALA is a registration and payment rule as much as a clinical one, and that's where software is involved. 42 CFR 489.24(d)(4):

- A hospital "may not delay providing an appropriate medical screening examination" or further treatment "in order to inquire about the individual's method of payment or insurance status."
- It may not seek, or direct the patient to seek, authorization from the patient's insurer for screening or stabilizing treatment until the screening exam is done and stabilizing treatment has begun.
- "Reasonable registration processes" that ask about insurance are allowed if they don't delay screening or treatment, and they "may not unduly discourage individuals from remaining for further evaluation."

So in an ED, **eligibility checks, estimates and point-of-service collections are gated behind the screening exam**, not in front of it. A patient engagement product that sends a "pay your copay" text at ED arrival, or an eligibility bot that runs a real-time check before triage and shows a cost, is building the delay the rule prohibits. The ED arrival time, the screening start time and the first financial interaction are three timestamps an EMTALA investigation will compare.

## 340B

The 340B program (42 USC 256b) requires drug manufacturers to offer covered outpatient drugs to covered entities "at or below the applicable ceiling price," a price derived from the average manufacturer price less a rebate percentage. Covered entities include federally qualified health centers, certain grantees, and qualifying disproportionate share, children's, free-standing cancer, critical access, rural referral and sole community hospitals. Two prohibitions shape the software: **no duplicate discounts** (a covered entity may not seek Medicaid payment for a drug that is also subject to a rebate to the state) and **no diversion** (the drugs may go only to the entity's own patients).

That makes 340B a data problem. A prescription filled at a contract pharmacy or dispensed in a hospital outpatient department qualifies only if the patient is the covered entity's patient for that prescription, the prescriber is eligible, the drug and location are registered, and the claim isn't also generating a Medicaid rebate. 340B administrators reconcile prescriptions, encounters, dispenses and claims after the fact to decide which qualify and replenish inventory at the 340B price. The audit trail is the encounter that made the patient eligible and the rule that matched it.

**The rebate model pilot.** HHS proposed letting manufacturers pay 340B discounts as rebates after the sale instead of upfront prices: an application notice was published August 1, 2025, HRSA issued a request for information on February 17, 2026, and a revised notice on August 3, 2026 set manufacturer plan submissions "no later than August 24, 2026" for "an effective date of January 1, 2027." Under a rebate model the covered entity buys at a higher price and submits claims data to receive the difference, which moves the reconciliation burden and the cash flow; a system serving covered entities has to support both models by manufacturer from that date.

## Hospital Price Transparency

45 CFR part 180 requires every hospital to publish its standard charges two ways:

- **A machine-readable file** with gross charges, discounted cash prices, payer-specific negotiated charges with payer and plan names, and de-identified minimum and maximum negotiated charges, in a CMS template layout, updated at least once annually, with a `.txt` file at the website's root pointing to it and a footer link labeled "Price Transparency." From January 1, 2026, the file carries an attestation that the data is complete and accurate and names the senior official responsible, and hospitals must encode the 10th percentile, median and 90th percentile allowed amounts (180.50).
- **A consumer-friendly list** of at least 300 shoppable services, including as many of the "70 CMS-specified shoppable services" as the hospital provides, or an internet-based price estimator tool that needs no registration (180.60).

Penalties scale with beds: up to $300 a day for 30 or fewer beds, $10 per bed per day for 31 to 550 beds, and up to $5,500 a day above 550, as 2022 base amounts adjusted yearly for inflation (180.90). As of June 2026, CMS's enforcement page listed 28 hospitals with civil money penalty notices. The CY2026 outpatient rule (effective January 1, 2026) updated the requirements, and the CY2027 proposed rule (July 7, 2026) asks for input on standardizing them further.

For software: the machine-readable file is generated from the contract management and chargemaster systems, so **every negotiated rate in it needs a source row** (payer, plan, contract version, code, setting, rate methodology), and the attestation means someone signs for the generation. Percentile allowed amounts come from paid claims, which ties the file to remittance data ([Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience#estimates) owns the patient estimate side).

## Selling into a Health System

What a vendor has to clear before a health system signs, in roughly the order it happens:

1. **Security review.** A questionnaire, often hundreds of questions, evidence of a security program (SOC 2 or HITRUST reports), penetration test results, and answers on encryption, access control, logging, incident response and subprocessors ([Security Reviews and Questionnaires](/books/health-tech/vendor-compliance-posture#security-reviews-and-questionnaires), [Compliance Programs](/books/hosting-and-cloud/compliance-programs)).
2. **The BAA.** If the product touches PHI, a business associate agreement on the health system's paper, with breach notification timelines often shorter than HIPAA's ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)).
3. **Integration approval.** The EHR integration through the vendor's program and the health system's interface team, including which APIs, scopes and data elements.
4. **Identity.** Single sign-on through the health system's identity provider, and user provisioning tied to their workforce directory ([SSO and Federation](/docs/security/sso-and-federation)).
5. **Clinical and legal review.** For anything clinical, a clinical committee; for AI, a governance review; for anything that touches patients, a review of consent and messaging.
6. **Procurement.** Contract terms, insurance requirements (cyber coverage limits), and a supplier onboarding process.

The engineering consequence: **design for one health system to be many tenants.** A system with several hospitals has one contract, one BAA and one identity provider, and many facilities with different EHR instances, codes and workflows; tenancy and configuration hierarchy follow the organization tree ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). A health system is an `organizations` tree (`health_system` over `hospital` and `practice` children), and `encounters.class` holds the current class; this chapter keeps its history, the beds, the ADT stream and the EMTALA clock. Raw HL7 v2 messages are `hl7_messages`, owned by [HL7 v2 & Interfaces](/books/health-tech/hl7-v2); `adt_events` is the movement each message means once parsed.

```sql
CREATE TABLE encounter_class_history (   -- class over time, never overwritten
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  encounter_id    UUID NOT NULL REFERENCES encounters (id),
  class           TEXT NOT NULL CHECK (class IN ('emergency', 'observation', 'inpatient',
                    'ambulatory', 'home')),  -- 'home' with a hospital location: hospital at home
  order_id        UUID REFERENCES orders (id),   -- the admission or observation order
  ordered_by      UUID REFERENCES practitioner_roles (id),
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (encounter_id WITH =, valid_during WITH &&)
);

CREATE TABLE beds (                      -- the leaf of the location hierarchy
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id     UUID NOT NULL REFERENCES locations (id),  -- the hospital
  unit_code       TEXT NOT NULL,         -- as ADT names it
  room_code       TEXT NOT NULL,
  bed_code        TEXT NOT NULL,
  kind            TEXT NOT NULL,         -- med-surg, ICU, telemetry, virtual (hospital at home)
  UNIQUE (location_id, unit_code, room_code, bed_code)
);

CREATE TABLE bed_states (                -- the bed's own state machine, as intervals
  bed_id          UUID NOT NULL REFERENCES beds (id),
  state           TEXT NOT NULL CHECK (state IN ('available', 'assigned', 'occupied',
                    'pending_discharge', 'dirty', 'cleaning', 'blocked')),
  reason          TEXT,                  -- isolation, maintenance, staffing
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (bed_id WITH =, valid_during WITH &&)
);

CREATE TABLE bed_assignments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  bed_id          UUID NOT NULL REFERENCES beds (id),
  encounter_id    UUID NOT NULL REFERENCES encounters (id),
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (bed_id WITH =, valid_during WITH &&),        -- one patient per bed
  EXCLUDE USING GIST (encounter_id WITH =, valid_during WITH &&)   -- one bed per patient
);

CREATE TABLE adt_events (                -- every movement, applied in order per patient
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  integration_id       UUID NOT NULL REFERENCES integrations (id),
  message_control_id   TEXT NOT NULL,     -- idempotency key from the sender
  event_kind           TEXT NOT NULL CHECK (event_kind IN ('preadmit', 'register', 'admit',
                         'transfer', 'leave', 'return', 'discharge', 'cancel_admit',
                         'cancel_transfer', 'cancel_discharge', 'update', 'merge', 'unmerge')),
  patient_identifier   TEXT NOT NULL,     -- the sender's MRN
  encounter_identifier TEXT,              -- the sender's visit number
  patient_id           UUID REFERENCES patients (id),     -- once matched
  encounter_id         UUID REFERENCES encounters (id),
  event_time           TIMESTAMPTZ NOT NULL, -- when it happened, which may be backdated
  received_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_message_ref   TEXT NOT NULL,     -- the hl7_messages row or raw payload in the PHI store
  applied_at           TIMESTAMPTZ,
  apply_error          TEXT,
  UNIQUE (integration_id, message_control_id)
);

CREATE TABLE ed_arrivals (               -- the EMTALA clock
  encounter_id           UUID PRIMARY KEY REFERENCES encounters (id),
  arrived_at             TIMESTAMPTZ NOT NULL,
  screening_started_at   TIMESTAMPTZ,
  stabilizing_started_at TIMESTAMPTZ,
  first_financial_at     TIMESTAMPTZ,     -- first eligibility check, estimate or collection
  disposition            TEXT CHECK (disposition IN ('discharged', 'admitted', 'observation',
                           'transferred', 'left_without_being_seen', 'left_against_advice')),
  CHECK (first_financial_at IS NULL OR screening_started_at IS NOT NULL)
);

CREATE TABLE price_transparency_files (  -- each published machine-readable file
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the hospital
  template_version TEXT NOT NULL,          -- CMS template version used
  generated_at     TIMESTAMPTZ NOT NULL,
  source_snapshot  TEXT NOT NULL,          -- the contract and chargemaster versions read
  attested_by      TEXT NOT NULL,          -- the senior official named in the file
  published_url    TEXT NOT NULL,
  content_sha256   TEXT NOT NULL
);
```

The check on `ed_arrivals` makes EMTALA's ordering a constraint: the application can't record a financial interaction before screening has started, so the eligibility bot and the copay text have nothing to hang on until it has.

Design decisions:

- **Class is an interval history.** Observation-to-inpatient conversions keep each interval with its order, so billing and the two-midnight determination read the record rather than a guess; `encounters.class` is the current value.
- **Beds have their own states,** and assignment is exclusive in both directions by constraint; the board is a query over intervals, and flow metrics are intervals between events.
- **ADT is stored as received and applied idempotently,** keyed by message control ID, with cancels and merges as first-class events and errors visible.
- **EMTALA's order is enforced** by putting the screening time before any financial interaction.
- **Published files are reproducible** from recorded source versions, with the attesting official, because the file is a legal statement.
- **A health system is an organization tree** with facilities as children, each with its own integration, codes and configuration under one contract.

## Auditing

- **Patient movement.** Every ADT message as received, how it was applied, and the resulting class, location and bed intervals, so "where was this patient at 3 a.m.?" has a provable answer.
- **EMTALA timelines.** Arrival, screening, stabilization, financial interactions and disposition for every ED encounter, including patients who left without being seen.
- **Notifications sent.** For hospitals using your software for 482.24(d), each notification with its trigger event, recipients and delivery.
- **340B determinations.** For each qualifying prescription or dispense, the encounter, prescriber and rule that made it eligible, and the Medicaid status that ruled out a duplicate discount.
- **Price transparency.** Each published file, its source versions, its attestation and its hash, kept as long as the hospital may be asked about it ([Audit Trails](/docs/architecture/audit-trails#make-it-tamper-evident)).

## What This Means for the System You Build

- **Record encounter class as effective-dated intervals** with the order behind each, including observation and hospital at home.
- **Consume ADT idempotently, in order per patient,** with cancels, backdated events and merges handled as first-class messages.
- **Give beds their own state machine** and make double assignment impossible in the schema.
- **Integrate through the EHR vendor's program and each customer's interface team,** with mapping as per-customer data.
- **Put every ED financial interaction behind the screening exam** and keep the timestamps that prove it.
- **Treat 340B as a reconciliation of encounters, prescriptions and claims,** ready for a rebate model from January 1, 2027.
- **Generate price transparency files from source rows** with recorded versions and the attesting official.
- **Expect security review, a BAA, SSO and committee approvals,** and model a health system as one contract over many facilities.

## References

**Statutes and regulations**

- [42 CFR part 482 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=482), the Conditions of Participation and their subparts
- [42 CFR 482.24 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=482&section=482.24), medical record services and electronic event notifications under the HL7 v2.5.1 ADT standard
- [42 CFR 412.3 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=412&section=412.3), the two-midnight benchmark for inpatient admission
- [Medicare.gov: Outpatient hospital services](https://www.medicare.gov/coverage/outpatient-hospital-services), observation services as outpatient services that may include an overnight stay
- [42 CFR 485.502 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=485&section=485.502), rural emergency hospital services and the 24-hour average length of stay
- [42 USC 1395dd (govinfo)](https://www.govinfo.gov/link/uscode/42/1395dd?link-type=html), EMTALA's screening and stabilization duties and statutory penalties
- [42 CFR 489.24 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=489&section=489.24), application regardless of ability to pay, no delay for payment inquiries or authorization, reasonable registration
- [42 USC 256b (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/256b), 340B ceiling prices, covered entities, duplicate discount and diversion prohibitions
- [45 CFR part 180 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=180), the machine-readable file, the 2026 attestation and percentile allowed amounts, the 300 shoppable services and estimator alternative
- [45 CFR 180.90 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=180&section=180.90), penalty amounts by bed count
- [Consolidated Appropriations Act, 2026 (H.R. 7148 enrolled)](https://www.congress.gov/119/bills/hr7148/BILLS-119hr7148enr.pdf), section 6210 extending hospital at home to September 30, 2030

**Agencies and federal notices**

- [CMS: Hospital price transparency enforcement actions](https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency/enforcement-actions), civil money penalty notices (page modified June 11, 2026)
- [Federal Register: CY2026 OPPS and ASC final rule](https://www.federalregister.gov/api/v1/documents/2025-20907.json), price transparency updates effective January 1, 2026
- [Federal Register: CY2027 OPPS and ASC proposed rule (July 7, 2026)](https://www.federalregister.gov/documents/2026/07/07/2026-13656/medicare-program-hospital-outpatient-prospective-payment-and-ambulatory-surgical-center-payment), request for input on standardizing price transparency
- [Federal Register: 340B Rebate Model Pilot application process (August 1, 2025)](https://www.federalregister.gov/documents/2025/08/01/2025-14619/340b-program-notice-application-process-for-the-340b-rebate-model-pilot-program), the original pilot notice
- [Federal Register: Notice regarding the 340B Rebate Model Pilot (August 3, 2026)](https://www.federalregister.gov/api/v1/documents/2026-15633.json), plans due August 24, 2026 for a January 1, 2027 effective date
- [AHA: Fast Facts on US hospitals, 2026](https://www.aha.org/statistics/fast-facts-us-hospitals), 6,100 hospitals, 5,121 community hospitals, staffed beds and admissions

**Vendors**

- [open.epic](https://open.epic.com/), 750+ no-cost APIs, annual web service transactions, playbooks, US Core 8 and USCDI v5
- [Epic Vendor Services and Showroom](https://vendorservices.epic.com/), integration technology, documentation, sandbox and support, product discovery
- [Oracle Health: Millennium Platform APIs](https://docs.oracle.com/en/industries/health/millennium-platform-apis/), FHIR R4 for SMART apps, DSTU 2 retired, app registration and fees
- [MEDITECH Expanse](https://ehr.meditech.com/ehr-solutions/meditech-expanse), settings, MEDITECH-as-a-Service, customers
- [TeleTracking](https://www.teletracking.com/), Operations IQ, transfer and command centers, share of US beds and discharges
