+++
title = "Referrals & Care Coordination"
nav_title = "Referrals & Coordination"
description = "Referral management and closed loops, the fax that still carries them, Direct messaging, discharge and ADT notifications, care management codes and post-acute."
category = "Health Tech Industry"
order = 1946
part = "Care Delivery"
tags = ["health-tech", "referrals", "care-coordination", "direct-messaging", "fax", "care-management"]
+++

A referral is one clinician asking another to take part in a patient's care: a primary care physician sending a patient to a cardiologist, a dentist to an oral surgeon, a hospital to a skilled nursing facility, an optometrist to a retina specialist. It is an order, like a lab test, but the performer is a person with a schedule, the result is a consult note, and the loop only closes if somebody on each side does their part: the sender sends enough information, the receiver schedules the patient, the patient shows up, and the specialist's findings come back. Each gap is a patient who didn't get care someone thought they needed.

The surprising part for an engineer is the transport. Much of this still moves by fax, alongside Direct secure messaging, HIE networks, payer portals and phone calls. A referral system's real job is to run a loop across organizations that don't share a system, from documents that arrive in whatever form the other side could send. This chapter covers referral management and the closed loop, the fax reality and how software works with it, Direct messaging, hospital discharge and event notifications, care management programs and their billing, and post-acute handoffs. It extends `orders`, `documents` and `communications` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Query-based exchange networks and TEFCA belong to Networks & Exchange; C-CDA documents to C-CDA, Documents & Images; payer referral and authorization requirements to Prior Authorization.

## How the Platforms Do It

As of October 2026, from each organization's own pages and filings:

| Organization | Role | What its public pages or filings describe |
| --- | --- | --- |
| **Kno2** | Multi-channel exchange for referrals and documents | Eight connectivity channels including "Referral Networks & 360X," "Direct Secure Messaging" and "Cloud Faxing"; a Communication API with Send, Receive and Find; a Carequality implementer and "among the first organizations to receive federal QHIN designation under TEFCA"; HITRUST R2 |
| **Consensus Cloud Solutions (eFax)** | Cloud fax and document intake | Fax as "a ubiquitous electronic document exchange protocol for highly sensitive and legally binding documents," and health care "continues to rely heavily on fax"; healthcare its largest vertical; eFax Unite to choose among protocols, eFax Clarity to turn unstructured documents into "structured actionable data" (with clinical documentation and prior authorization applications), eFax Conductor as an interface engine with HL7, FHIR and Direct |
| **DirectTrust** | The trust network for Direct messaging | "1.894+ billion Direct Secure Messages" exchanged in 2025, up 42%, an average of over 157 million a month; more than 3.1 million trusted Direct addresses and 196,517 organizations served by accredited HISPs in Q4 2025; growth driven by electronic case reporting |
| **Health Gorilla** | Network and QHIN | A TEFCA QHIN onboarding organizations; clinical data exchange beside its lab network |

The patterns: **every vendor sells every channel.** Kno2 and Consensus both put fax, Direct and API exchange behind one interface, because a practice can't choose the channel its referral partner uses. **The product is turning documents into data.** Consensus sells intelligent extraction for exactly the inbound faxes a referral coordinator reads by hand. **Direct is large and growing**, but much of its recent growth is public health reporting, not referrals.

## The Referral Loop

The closed loop, from the sender's side:

1. **Order.** A clinician orders a referral with a specialty or a named receiver, a reason, urgency, and the clinical question. It is an `orders` row with `kind = 'referral'`.
2. **Authorization.** If the patient's plan requires a referral or prior authorization, staff obtain it and record the number and visit limits; Prior Authorization covers the payer side.
3. **Send.** The referral packet goes to the receiver: the order, a summary of care (problems, medications, allergies, recent results), the relevant notes and images, and the insurance. Channel: Direct, an EHR-to-EHR network, a referral platform, the receiver's portal, or fax.
4. **Receive and triage.** The receiving office reviews the packet, asks for missing information, accepts or declines, and schedules.
5. **Schedule and visit.** The patient is booked and seen; a no-show is a loop that needs a call, not a closed referral.
6. **Close.** The specialist sends a consult note back; the sender's clinician reviews it and files it to the referral. Only then is the loop closed.

Each step is a status with a timestamp and a responsible party, and the gaps are measurable: sent but never acknowledged, accepted but never scheduled, scheduled but no-show, seen but no report back. **Leakage**, the share of referrals that go outside the sender's network or never happen, is the metric health systems watch, both as quality and as revenue.

**Inbound referrals are the receiver's intake.** For a specialist, a referral is a new patient arriving with documents attached: demographics, insurance, the referring clinician (who gets the report later) and the reason. The intake becomes a patient, a coverage and an appointment, matched against existing records rather than duplicated ([Match Before Create](/docs/architecture/record-linkage#match-before-create)).

**Closed-loop standards exist and are uneven.** Kno2 lists 360X, a closed-loop referral pattern, as one of its channels; HL7's Bidirectional Services eReferrals (BSeR) implementation guide defines FHIR referral and feedback for services such as community programs. Most loops still close by a document coming back, matched to the referral by people.

## The Fax Reality

Fax persists because it works between any two offices with no onboarding and the receiving side needs nothing but a number; Consensus, which sells eFax, calls it "a ubiquitous electronic document exchange protocol for highly sensitive and legally binding documents." The federal data shows how slowly it recedes. ASTP's analysis of the AHA IT Supplement survey, the share of hospitals that "often" use each method to send or receive summary of care records:

| Method | Often send, 2018 | Often send, 2023 | Often send, 2025 | Often receive, 2023 | Often receive, 2025 |
| --- | --- | --- | --- | --- | --- |
| Mail or fax | 40% | 30% | 40% | 35% | 35% |
| Direct (via a HISP) | | | 53% | | 38% |
| State, regional or local HIE | | | 60% | | 53% |

In 2025, another 46% of hospitals "sometimes" received records by mail or fax. Those are hospitals, the best-connected providers; small practices, home health agencies and many specialists rely on fax more.

Software that lives with fax:

- **Inbound fax is a document queue.** Every inbound fax becomes a `documents` row with the sending number, page count, received time and the raw image, in a queue a person (or an extraction model, then a person) classifies: referral, records request response, lab result, prior authorization decision, prescription renewal request, junk.
- **Classify and attach, never retype silently.** The classified document is attached to a patient and, where it closes something, to the referral, order or request it answers. Extracted fields (patient name, date of birth, referring provider) are suggestions confirmed by staff, and the confirmation is recorded ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Outbound fax is a disclosure.** The fax number is verified against the receiving organization's directory entry, the cover sheet carries the confidentiality notice, and the send is logged with what was sent to whom. A misdialed fax is a breach, and HIPAA's rules on disclosures are the playbook's ([What It Means for a System](/docs/compliance/hipaa#what-it-means-for-a-system)).
- **The fax is the fallback, not a separate workflow.** A referral that can go by Direct goes by Direct; when the receiver has no Direct address, the same packet renders to fax, and the referral's status machine doesn't care which channel carried it.

## Direct Messaging

Direct is secure email for health care: messages with attachments between addresses like `dr.lee@direct.example-clinic.org`, encrypted and signed with certificates, sent through health information service providers (HISPs) accredited in DirectTrust's trust framework. It became a common push channel for summaries of care, referrals and transitions. DirectTrust's 2025 numbers (nearly 1.9 billion messages, 3.1 million addresses, 196,517 organizations) show the scale; the same report says growth was driven by electronic case reporting to public health, not only by provider-to-provider exchange.

What Direct gives a referral system: a push channel with delivery receipts, an attachment format (usually a C-CDA document plus PDFs) and an address directory. What it doesn't: a referral status, a structured accept or decline, or a guarantee the receiver reads the inbox. The address lookup is the weak point, because directories are incomplete and an address can belong to a person, a department or a practice; the referral system stores the address with the organization and practitioner role it reaches and when it was last verified.

## Hospital Discharge and Event Notifications

Two Medicare hospital Conditions of Participation make transitions an obligation:

- **Discharge planning.** 42 CFR 482.43(b) requires the hospital to send "all necessary medical information pertaining to the patient's current course of illness and treatment, post-discharge goals of care, and treatment preferences, at the time of discharge, to the appropriate post-acute care service providers and suppliers, facilities, agencies, and other outpatient service providers and practitioners." Paragraph (a)(8) requires sharing quality measure data on home health agencies, skilled nursing facilities, inpatient rehabilitation facilities and long-term care hospitals to help patients choose one.
- **Electronic event notifications.** 42 CFR 482.24(d) applies to hospitals whose systems conform to the HL7 v2.5.1 ADT standard: notifications with at least the patient's name, the treating practitioner's name and the sending institution's name go out at emergency department registration and inpatient admission, and "immediately prior to, or at the time of" discharge or transfer, to post-acute providers and to the patient's established primary care practitioner or group. Critical access hospitals have the same requirement in 485.638.

For an ambulatory practice or a care management vendor, the ADT notification is the most valuable signal in the system: your patient is in the ED right now, or was discharged this morning. Receiving it means being on the hospital's or the HIE's notification list with a patient roster, matching each notification to a patient, and routing it to a worklist with a clock, because the follow-up codes below start counting at discharge. The hospital side of ADT belongs to [Hospitals & Health Systems](/books/health-tech/hospitals-and-health-systems#adt-the-hospital-s-event-stream).

## Care Management Programs

Medicare pays for care coordination between visits through monthly and episodic codes, and those codes shape what care management software records. From CMS's MLN booklets:

| Program | Codes | What CMS describes |
| --- | --- | --- |
| **Transitional care management** | 99495, 99496 | After discharge: contact "within 2 business days of discharge"; a face-to-face visit "within 14 calendar days" with at least moderate medical decision making (99495), or "within 7 calendar days" with high complexity (99496); both can be furnished by telehealth |
| **Chronic care management** | 99490 (+99439), 99491 (+99437), 99487 (+99489) | Clinical staff time (99490, first 20 minutes, add-on per additional 20), practitioner time (99491, first 30 minutes), and complex CCM (99487, first 60 minutes) per month |
| **Principal care management** | 99424 to 99427 | For "a single, high-risk chronic condition expected to last at least 3 months," at least 30 minutes a month |
| **Advanced primary care management** | G0556, G0557, G0558 | From January 1, 2025, one code per patient per month combining elements of principal, transitional and chronic care management and communication technology-based services |

The software requirements follow directly. **TCM is two deadlines from a discharge date:** the 2-business-day contact and the 7- or 14-day visit, computed from the ADT discharge time in the practice's business calendar and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). **CCM is minutes by person by month,** against a care plan the patient consented to, the same shape as remote monitoring time in [Telehealth](/books/health-tech/telehealth#remote-patient-and-therapeutic-monitoring) (CMS's remote monitoring booklet allows the two concurrently if time isn't counted twice). **One program per patient per period** is enforced where the codes exclude each other, and the program enrollment records who bills.

## Post-Acute Handoffs

Post-acute care is where patients go after a hospital: home health, skilled nursing facilities, inpatient rehabilitation, long-term care hospitals, hospice. The handoff is a referral with a deadline (the discharge), a patient choice requirement (the quality data under 482.43), and an acceptance decision by a facility that checks insurance, clinical fit and bed availability. A discharge planner may send packets to several facilities at once and place the patient with one that accepts and has a bed, so the system has to make that broadcast and its responses visible. Assisted living sits beside this as a residential setting with its own HIPAA boundary ([Senior Living](/books/property-tech/senior-living#clinical-records-and-the-hipaa-boundary)).

The record model is the referral loop with a fan-out: one discharge, several outbound referrals, accept and decline responses with reasons, the patient's choice recorded, one placement, and the others withdrawn so the facilities stop holding beds ([Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). A referral starts as an `orders` row with `kind = 'referral'`; Direct transport itself is `direct_messages`, owned by C-CDA, Documents & Images, and outbound disclosures outside treatment, payment and operations land in `disclosures`.

```sql
CREATE TABLE referrals (                 -- the loop around an order, across organizations
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  order_id             UUID REFERENCES orders (id),     -- null for an inbound referral
  direction            TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  patient_id           UUID REFERENCES patients (id),   -- inbound: null until matched
  referring_role_id    UUID REFERENCES practitioner_roles (id),
  receiving_org_id     UUID REFERENCES organizations (id),
  receiving_role_id    UUID REFERENCES practitioner_roles (id),
  specialty            TEXT,
  reason               TEXT NOT NULL,
  urgency              TEXT NOT NULL CHECK (urgency IN ('routine', 'urgent', 'emergent')),
  authorization_ref    TEXT,               -- payer referral or prior authorization number
  authorized_visits    INT,
  parent_referral_id   UUID REFERENCES referrals (id),  -- post-acute fan-out from one discharge
  status               TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'acknowledged',
                         'more_info_requested', 'accepted', 'declined', 'scheduled',
                         'no_show', 'seen', 'report_received', 'closed', 'withdrawn')),
  status_changed_at    TIMESTAMPTZ NOT NULL,
  appointment_id       UUID REFERENCES appointments (id),
  closing_document_id  UUID REFERENCES documents (id),  -- the consult note that closed it
  closed_by            UUID REFERENCES practitioner_roles (id)
);

CREATE TABLE referral_events (           -- every step, append-only
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  referral_id      UUID NOT NULL REFERENCES referrals (id),
  kind             TEXT NOT NULL,        -- 'sent', 'delivered', 'declined', 'patient_chose', ...
  channel          TEXT CHECK (channel IN ('direct', 'network', 'referral_platform', 'portal',
                     'fax', 'phone', 'in_person')),
  communication_id UUID REFERENCES communications (id),
  document_id      UUID REFERENCES documents (id),  -- the packet sent or the reply received
  reason           TEXT,                 -- decline reason, information requested
  actor            TEXT NOT NULL,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fax_documents (             -- every fax in or out, and its intake
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  document_id      UUID NOT NULL REFERENCES documents (id),  -- the image, kept as received or sent
  direction        TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  remote_number    TEXT NOT NULL,        -- sender or recipient fax number
  endpoint_id      UUID,                 -- exchange_endpoints, below; verified before sending
  pages            INT NOT NULL,
  provider_ref     TEXT,                 -- the fax service's job ID
  intake_status    TEXT CHECK (intake_status IN ('new', 'classified', 'attached', 'rejected')),
  classified_as    TEXT,                 -- 'referral', 'consult_note', 'lab_result', ...
  extracted        JSONB,                -- suggested fields from extraction, never authoritative
  confirmed_by     UUID,                 -- who confirmed classification and patient
  attached_to      JSONB,                -- {"referral_id": ...} or {"order_id": ...}
  occurred_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE exchange_endpoints (        -- where to send for a given organization or role
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),  -- the receiver
  practitioner_role_id UUID REFERENCES practitioner_roles (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('direct', 'fax', 'network', 'portal')),
  address              TEXT NOT NULL,
  verified_at          TIMESTAMPTZ,
  verified_how         TEXT,             -- directory, phone confirmation, prior receipt
  preferred            BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (organization_id, kind, address)
);

ALTER TABLE fax_documents
  ADD FOREIGN KEY (endpoint_id) REFERENCES exchange_endpoints (id);

CREATE TABLE care_programs (             -- TCM, CCM, PCM, APCM enrollment for one billing practice
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  program              TEXT NOT NULL CHECK (program IN ('tcm', 'ccm', 'pcm', 'apcm')),
  billing_role_id      UUID NOT NULL REFERENCES practitioner_roles (id),
  consent_id           UUID REFERENCES consents (id),
  care_plan_document_id UUID REFERENCES documents (id),
  trigger_encounter_id UUID REFERENCES encounters (id),  -- TCM: the inpatient stay
  discharged_at        TIMESTAMPTZ,                     -- TCM: from the ADT notification
  contact_due_by       TIMESTAMPTZ,                     -- 2 business days, computed
  visit_due_by         DATE,                            -- 7 or 14 calendar days, computed
  valid_during         DATERANGE NOT NULL
);

CREATE TABLE care_program_time (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id        UUID NOT NULL REFERENCES care_programs (id),
  staff_role_id     UUID NOT NULL REFERENCES practitioner_roles (id),
  staff_kind        TEXT NOT NULL CHECK (staff_kind IN ('practitioner', 'clinical_staff')),
  minutes           INT NOT NULL CHECK (minutes > 0),
  activity          TEXT NOT NULL,
  service_month     DATE NOT NULL,       -- first of the month the time counts toward
  counted_elsewhere BOOLEAN NOT NULL DEFAULT false,  -- never count the same time twice
  occurred_at       TIMESTAMPTZ NOT NULL
);
```

Design decisions:

- **The referral is a loop object over an order.** The order is what the clinician asked for; the referral holds the cross-organization status, the receiver, the authorization and the closing document. Inbound referrals have no order on our side and start unmatched.
- **Channel is a property of each step, not of the referral.** Sent by Direct, more information requested by phone, report back by fax: the events record each channel, and the status machine is channel-blind.
- **Every fax goes through intake,** with extraction as suggestions and a person's confirmation recorded before it attaches to a patient; the image itself is a `documents` row kept as received.
- **Endpoints are verified data** per organization and role, with how and when they were verified, because a wrong fax number is a breach.
- **Care programs compute their deadlines** from the triggering discharge and store them, and time entries say which month and which person, so the monthly claim is a query.
- **Events:** `referral.sent`, `referral.accepted`, `referral.declined`, `referral.scheduled`, `referral.no_show`, `referral.closed`, `fax.received`, `adt.notification_received`, through the [outbox](/docs/architecture/events#the-transactional-outbox) to coordinator worklists.

## Auditing

- **Every loop.** Each referral's status history with channels and actors, so open loops by age and stage are a report and a closed one shows the document that closed it.
- **Every disclosure.** What was sent to whom, by which channel and endpoint, including faxes, for HIPAA accounting where required ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).
- **Every inbound document.** Received, classified, confirmed, attached or rejected, with who decided, because a misfiled document is a privacy incident and a missed result.
- **Care program billing.** Enrollment, consent, deadlines and whether they were met, time by person and month, and the claim, reproducible for a payer audit.

## What This Means for the System You Build

- **Model the referral as a loop with explicit states** from sent to closed, and measure every gap between them.
- **Make channels interchangeable:** Direct, network, platform, portal and fax all carry the same packet and record the same events.
- **Treat inbound fax as a document intake queue** with classification, patient matching and attachment confirmed by a person.
- **Verify every outbound endpoint** and log every send as a disclosure.
- **Subscribe to ADT notifications** for your patient roster and route them to worklists with clocks.
- **Compute care management deadlines from the discharge** and log time by person and month against a consented plan, never counting the same minutes twice.
- **Fan out post-acute referrals** and withdraw the losers so facilities stop holding beds.

## References

**Regulations and federal data**

- [42 CFR 482.43 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=482&section=482.43), discharge information to post-acute and outpatient providers, post-acute quality data for patient choice
- [42 CFR 482.24 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=482&section=482.24), electronic event notifications at ED registration, admission, discharge and transfer
- [42 CFR 485.638 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=485&section=485.638), the same notification requirement for critical access hospitals
- [ASTP/ONC Quick Stat: Methods used by hospitals for interoperable exchange](https://healthit.gov/data/quickstats/methods-used-hospitals-engage-interoperable-exchange/), mail or fax, Direct and HIE shares for 2018, 2023 and 2025
- [CMS: 2026 MIPS Promoting Interoperability, HIE Bi-Directional Exchange measure](https://qpp.cms.gov/docs/pi_specifications/Measure%20Specifications/2026-MIPS-Promoting-Interoperability-HIE-Bi-Directional-Exchange-Measure.pdf), the HIE objective's alternatives including the referral loop measures and TEFCA
- [CMS MLN908628: Transitional care management services (August 2025)](https://www.cms.gov/files/document/mln908628-transitional-care-management-services.pdf), 99495 and 99496 contact and visit deadlines, telehealth
- [CMS MLN909188: Chronic care management services (June 2025)](https://www.cms.gov/files/document/chroniccaremanagement.pdf), CCM codes and minutes, principal care management
- [CMS: Advanced primary care management services](https://www.cms.gov/medicare/payment/fee-schedules/physician-fee-schedule/advanced-primary-care-management-services), G0556 to G0558 from January 1, 2025

**Standards and networks**

- [DirectTrust: Record exchange activity in 2025 (February 10, 2026)](https://directtrust.org/blog/news/directtrust-reports-record-high-exchange-activity-in-2025-with-nearly-1-9-billion-direct-exchange-transactions), message volume, addresses, organizations and electronic case reporting
- [HL7: Bidirectional Services eReferrals (BSeR)](https://www.hl7.org/fhir/us/bser/), the FHIR referral and feedback implementation guide

**Companies**

- [Kno2](https://www.kno2.com/), referral networks and 360X, Direct, cloud fax, Communication API, QHIN designation
- [Consensus Cloud Solutions: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1866633/000186663326000004/ccs-20251231.htm), health care's reliance on fax, healthcare as the largest vertical, eFax Unite, Clarity and Conductor
- [Health Gorilla](https://www.healthgorilla.com/), QHIN onboarding and exchange
