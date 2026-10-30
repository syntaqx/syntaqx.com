+++
title = "E-Prescribing & Pharmacy"
description = "NCPDP SCRIPT and Surescripts, EPCS under DEA and CMS rules, PDMPs, DEA telemedicine prescribing status, pharmacy claims, embedded eRx and compounding."
category = "Health Tech Industry"
order = 1944
part = "Care Delivery"
tags = ["health-tech", "e-prescribing", "ncpdp", "epcs", "dea", "pharmacy", "pdmp"]
+++

A prescription is an order from a prescriber to a pharmacy to dispense a drug to a patient, and in the US almost all of them now travel as messages. The prescriber picks a drug in the EHR; the EHR builds a new-prescription message in the NCPDP SCRIPT standard and sends it through a network to the pharmacy the patient chose; the pharmacy system receives it, checks it, bills the patient's pharmacy benefit in real time over a different NCPDP standard, fills it and, if asked, reports back that it was picked up. Along the way the prescriber may pull the patient's medication history, check what the drug will cost under the patient's plan, request a prior authorization, and for a controlled substance sign with two-factor authentication and look the patient up in the state's prescription drug monitoring program. Each of those steps has its own standard, its own rule and often its own vendor.

The core record is `medication_requests` in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), FHIR's MedicationRequest. This chapter covers the SCRIPT transactions and the network, electronic prescribing of controlled substances (EPCS) under DEA's rule and CMS's Part D requirement, prescription drug monitoring programs, the status of DEA's telemedicine prescribing rules as of October 2026, pharmacy systems and claims, embedded e-prescribing for platforms that aren't EHRs, and compounding in the GLP-1 era. Formularies, rebates and the PBM business are [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits); electronic prior authorization for drugs is [Prior Authorization](/books/health-tech/prior-authorization#pharmacy-epa); telehealth visits themselves are [Telehealth](/books/health-tech/telehealth).

## How the Platforms Do It

As of October 2026, from each vendor's own pages:

| Vendor | Role | What its public pages describe |
| --- | --- | --- |
| **Surescripts** | The national e-prescribing network | 2.64 billion e-prescriptions filled and 32.9 million RxChange transactions in 2025; 99.998% network uptime; connects "virtually all" EHRs and "virtually all U.S. pharmacies"; a certification process for current NCPDP standards; applications sending controlled-substance prescriptions must first prove a successful third-party audit under DEA requirements; Medication History, Real-Time Prescription Benefit and Electronic Prior Authorization products |
| **DoseSpot** | Embedded e-prescribing for platforms that aren't full EHRs | "50M+ prescriptions are sent via DoseSpot each year"; "a fully customizable, cloud-based integration"; connections to "140+ APIs"; EPCS; described as a certified e-prescribing platform with an ONC certification page |
| **Bamboo Health PMP Gateway** | PDMP data inside clinical workflows | "One-Click PDMP Integration" of multi-state PDMP data into "existing clinical workflows"; connects to more than 500 EHRs, pharmacy systems and HIEs; "1M+ providers accessing PDMP information in clinical workflows" |
| **Hims & Hers** | A DTC telehealth company with its own pharmacies | Two licensed 503A pharmacies, a 503B outsourcing facility; most prescriptions for its medications filled through wholly owned pharmacies; compounded GLP-1 products filled only from 503A pharmacies |

The patterns: **one network carries nearly everything.** Surescripts is the switch between prescribers and pharmacies, and certification on it (for SCRIPT and, separately, for controlled substances) is a gate every prescribing product passes. **Platforms that aren't EHRs embed rather than build.** A telehealth app, a dental or vet system, or a specialty platform buys e-prescribing from a vendor like DoseSpot, because building it means network certification, EPCS audits, identity proofing and drug databases. **PDMP checks moved into the workflow.** The state database was a separate website; integration vendors put the result in the prescriber's screen, which is what makes a mandatory query practical.

## The SCRIPT Transactions

NCPDP SCRIPT is the message standard between prescribers and pharmacies. The transactions a system handles, by what they do:

| Transaction | Direction | What it carries |
| --- | --- | --- |
| **New prescription** | Prescriber to pharmacy | Patient, prescriber with NPI and, for controlled substances, DEA number; drug (with RxNorm and NDC where known), strength, quantity, days' supply, sig, refills, substitution allowed, diagnosis, notes |
| **Renewal request and response** | Pharmacy to prescriber and back | The pharmacy asks for more refills; the prescriber approves, denies or replaces |
| **Change request and response** | Pharmacy to prescriber and back | RxChange: a therapeutic substitution, a prior authorization need, a generic, a clarification; Surescripts counted 32.9 million in 2025 |
| **Cancel** | Prescriber to pharmacy | CancelRx: stop a prescription not yet dispensed (or its remaining refills) |
| **Fill status** | Pharmacy to prescriber | Dispensed, partially dispensed or not dispensed, the adherence signal |
| **Medication history** | Network to prescriber | What has been filled and claimed for the patient, from pharmacies and PBMs |
| **Errors and status** | Both | Acknowledgments and rejections; a message that wasn't verified isn't a prescription |

**Versions are federal rules.** HHS's certification standards adopt SCRIPT versions for health IT, and CMS's Part D rules require them for prescriptions to Medicare Part D beneficiaries. As of October 2026, 45 CFR 170.205(b) lists SCRIPT version 2017071, whose adoption "expires on January 1, 2028," and version 2023011 with no expiration; HTI-4 (published August 4, 2025) is the rule that brought electronic prescribing, real-time prescription benefit and electronic prior authorization criteria into certification. For Part D, 42 CFR 423.160 incorporates both SCRIPT versions and adds two dates: from January 1, 2027, Part D sponsors' real-time benefit tools must meet the standard in 170.205(c) (the NCPDP Real-Time Prescription Benefit standard, version 13), and formulary and benefit information must meet 170.205(u) (Formulary and Benefit version 60). A prescribing system therefore carries two SCRIPT versions through 2027, negotiated per trading partner on the network, and a cutover plan for January 1, 2028.

**Medication history and reconciliation.** History from the network is claims and fill data, not the patient's own list: it misses cash fills at pharmacies that don't report them and samples, and it includes drugs the patient stopped. Medication reconciliation is a clinician comparing the history, the patient's report and the chart, and the result is the chart's medication list; the history stays a source, recorded with its retrieval time and the consent that allowed it.

## EPCS: Controlled Substances

Controlled substances (Schedules II to V) can be prescribed electronically only under DEA's rules in 21 CFR part 1311, first issued as an interim final rule on March 31, 2010 and effective June 1, 2010. The rule regulates the application and the practitioner, not just the message:

- **Identity proofing.** Before a practitioner gets a credential, an approved credential service provider or certification authority verifies their identity at "Assurance Level 3 or above as specified in NIST SP 800-63-1" (21 CFR 1311.105), and the credential is delivered through two separate channels. The codified text still cites the old NIST revision.
- **Two-factor authentication at signing.** "Two of the following three factors": something you know, something you have, a biometric (1311.115). A hard token must be separate from the computer and meet at least FIPS 140-2 Security Level 1. The practitioner must keep sole possession of the token and "must not share the password or other knowledge factor" (1311.102).
- **Logical access control.** The registrant designates "at least two individuals to manage access control"; in an institution, one person enters a practitioner's permissions and a second must authenticate to execute them (1311.125, 1311.130). Staff may prepare a prescription; only the practitioner's two-factor signature completes it.
- **Third-party audit or certification** of the application before use, repeated whenever controlled-substance functionality changes "or every two years, whichever occurs first" (1311.300). Surescripts won't route controlled-substance messages from an application without proof of it.
- **Records.** Pharmacy applications back up records daily and archive them electronically for at least two years (1311.205).

**CMS made EPCS mandatory for Part D.** Under section 2003 of the SUPPORT Act, 42 CFR 423.160(a)(5) requires that from January 1, 2021 prescribers send at least 70 percent of their Schedule II to V prescriptions for Part D drugs electronically, with compliance actions on or after January 1, 2023. As of October 2026, CMS's program page lists the exceptions: prescribers with 100 or fewer qualifying Part D controlled-substance prescriptions in a measurement year, prescribers in declared disaster areas, and CMS-approved waivers (the window for measurement year 2025 runs September 16 to November 18, 2026). Prescriptions for beneficiaries in long-term care facilities don't count "until January 1, 2028 at the earliest," and CMS says non-compliance may feed fraud, waste and abuse reviews. State laws can require EPCS independently of Medicare, with their own exceptions, so the requirement is a rule row per state as well as per payer. <!-- source-gap: state-epcs-mandates | missing | the number of states with their own EPCS mandates and their effective dates | closes with: a primary compilation from a state agency, NABP or DEA, or the statutes themselves | checked: 2026-10-29 -->

What this means for a product: **EPCS is a separate product surface** with its own enrollment (identity proofing, token issuance), its own signing ceremony, its own permissions administered by two people, its own audit cycle and its own reports, and a prescriber who can e-prescribe non-controlled drugs may not be enabled for controlled ones.

## Prescription Drug Monitoring Programs

A PDMP is a state database of controlled-substance dispensing, reported by pharmacies, that prescribers and pharmacists query before prescribing or dispensing. Each state runs its own program with its own rules on who must query, when, which schedules, and what counts as a query, and interstate sharing lets a query return other states' data. Bamboo Health's PMP Gateway is one of the integration routes that put a multi-state result in the EHR or pharmacy system with one click. Building it in:

- **The query is a record.** Who queried, for which patient, which states responded, when, and what was shown. State mandates are checked against these rows, and the record proves the check happened before the signature.
- **Gate the signature, not the order.** The check belongs between "prescription ready" and "signed," so a mandatory query can block signing for a controlled substance in a state that requires it, with a recorded override reason where the state allows exceptions.
- **The result is sensitive data.** PDMP data is controlled by state law and integration agreements that can restrict storage and redisclosure; store the fact and time of the check and a reference, and let the integration's terms decide whether the report itself is kept.

## DEA Telemedicine Prescribing Status

The Ryan Haight Online Pharmacy Consumer Protection Act of 2008 generally requires an in-person medical evaluation before a practitioner prescribes a controlled substance by means of the internet, with a telemedicine exception DEA was to implement by a special registration. DEA's pandemic-era flexibilities waived the in-person requirement and have been extended since. As of October 2026:

| Rule | Federal Register | Status as of October 2026 |
| --- | --- | --- |
| **Fourth Temporary Extension of COVID-19 Telemedicine Flexibilities** | 90 FR 61301 (December 31, 2025), joint DEA and HHS | In force January 1 to December 31, 2026, with the full set of third-extension flexibilities; the third extension (89 FR 91253) ran through December 31, 2025 |
| **Special Registrations for Telemedicine and Limited State Telemedicine Registrations** | 90 FR 6541 (January 17, 2025), proposed rule | Still a proposal; no final rule in the Federal Register as of October 19, 2026 |
| **Expansion of Buprenorphine Treatment via Telemedicine Encounter** | 90 FR 6504 (January 17, 2025), adds 21 CFR 1306.51 | Final; effective date delayed twice and in effect from December 31, 2025 |
| **Continuity of Care via Telemedicine for Veterans Affairs Patients** | 90 FR 6523 (January 17, 2025), adds 21 CFR 1306.52 | Final; in effect from December 31, 2025 |

The fourth extension cites the scale: about 16% of roughly 44.6 million controlled-substance prescriptions in 2024, more than 7 million, were issued without a prior in-person evaluation. Unless DEA publishes a fifth extension or a final special registration rule, the general flexibilities end with December 31, 2026, and the buprenorphine and VA rules continue on their own terms. <!-- source-gap: dea-telemedicine-2027 | status | whether DEA extends the telemedicine flexibilities past December 31, 2026 or finalizes the special registration rule | closes with: a Federal Register notice from DEA in November or December 2026 | checked: 2026-10-29 -->

For a prescribing system this is the hardest rule set to keep current, because its expiry date has moved every year. My rule: **controlled-substance prescribing after a telehealth encounter is gated by a rule evaluation** that takes the schedule, whether an in-person evaluation by this practitioner (or a qualifying referral, if a rule recognizes one) is on record, the patient's and practitioner's states, and the DEA rule in force on that date; the evaluation is stored on the medication request. When a flexibility expires, the gate starts refusing on the right day without a deploy, and the patients affected are a query over medication requests and encounters, so practices can be told in advance who needs an in-person visit.

## Pharmacy Systems and Claims

A pharmacy management system receives the prescription, runs drug utilization review (interactions, duplicates, dose), bills the patient's pharmacy benefit, dispenses and records the fill. The claim is real time: the pharmacy sends it at the counter, the PBM adjudicates in seconds, and the response gives the patient's copay or a rejection with a reason (not covered, prior authorization required, refill too soon). The HIPAA standard for retail pharmacy drug claims is the NCPDP Telecommunication Standard: 45 CFR 162.1102 lists version D.0 for March 17, 2009 through August 14, 2027, and version F6 from August 14, 2027 onward, so pharmacy systems, switches and PBMs face a version migration in 2027, as prescribers do with SCRIPT in 2028.

Two consequences for software outside the pharmacy:

- **Cost at the point of prescribing comes from real-time benefit checks,** the RTPB standard that Part D sponsors must support from January 1, 2027. A prescriber who sees the patient's cost and covered alternatives before signing avoids the change request that would otherwise come back from the pharmacy.
- **Fill status closes the loop.** A prescription sent is not a prescription picked up; fill status messages and medication history are how an EHR or a care management program learns which patients never started a drug.

## Embedded E-Prescribing

A platform that isn't an EHR (telehealth, DTC, dental, behavioral health, vet for human-pharmacy prescriptions) usually embeds an e-prescribing vendor rather than certifying its own. What changes in the build:

- **The vendor holds the network relationship**, the drug database, the SCRIPT version handling and, for EPCS, the audited signing flow and identity proofing; the platform passes the patient, the prescriber and the order and receives status back by webhook or polling.
- **The prescriber is enrolled twice:** once in the platform and once with the vendor, with NPI, DEA registrations by state, state licenses and, for EPCS, the identity-proofing result and token. Enrollment state is the platform's to track, because a prescriber who can't sign today is a scheduling problem.
- **The platform still owns the record.** The vendor's prescription ID maps to the platform's `medication_requests` row through a crosswalk ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)); the vendor's events update status; the platform's audit trail records who ordered what and when, not only the vendor's.
- **Veterinary prescribing to human pharmacies** uses the same pipes with a different patient (the animal) and the owner as the person picking up; that boundary belongs to [Veterinary Practice](/books/health-tech/veterinary-practice#prescriptions-and-pharmacy).

## Compounding and the GLP-1 Era

Compounding is a pharmacy preparing a drug for a patient rather than dispensing a manufactured product. Section 503A of the FD&C Act covers traditional pharmacy compounding for individual prescriptions; 503B covers outsourcing facilities registered with FDA. During a drug shortage, compounders may make copies of an approved drug; when the shortage ends, that permission winds down. GLP-1 weight-loss drugs made this a telehealth story, because DTC companies sold compounded semaglutide and tirzepatide by subscription. FDA's timeline, as stated on its compounding page:

| Drug | Shortage resolved | 503B enforcement discretion ended | 503A |
| --- | --- | --- | --- |
| **Tirzepatide** | Final determination December 19, 2024 | March 19, 2025 | Discretion has ended |
| **Semaglutide** | Announced February 21, 2025 | May 22, 2025 | Discretion has ended |

As of April 2026, neither drug was on FDA's shortage list. FDA's page for telehealth companies promoting compounded drugs (current as of June 15, 2026) says not to present a compounded drug as "generic" or the same as an approved drug, not to claim it is FDA-approved or clinically proven equivalent, and not to imply an FDA-approved pharmacy ("FDA does not approve or license any facility"), and says FDA "has issued warning letters to telehealth companies." Its page on unapproved GLP-1 drugs (current as of October 1, 2026) lists telehealth red flags for consumers and warning letters over retatrutide and "research purposes" semaglutide and tirzepatide.

For a platform, three things follow. **Product claims are regulated copy:** the drug's name, description and comparison language on every page and message are reviewed against FDA's guidance and versioned. **The order records what was dispensed:** a compounded product is not the approved drug, and the medication request, the pharmacy and the label say which it was. **Supply rules change by date:** the shortage status that allowed a product is a dated fact, and a subscription that refills it has to stop or switch when it changes, with notice to the patient.

## How to Build It

The core `medication_requests` row already holds the prescriber's role, RxNorm and NDC codes, the sig as `dosage_text`, quantity, refills and status ([The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model)). This chapter adds what e-prescribing needs around it:

```sql
ALTER TABLE medication_requests
  ADD COLUMN compounded           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN dea_schedule         TEXT CHECK (dea_schedule IN ('II', 'III', 'IV', 'V')),
  ADD COLUMN quantity_unit        TEXT,
  ADD COLUMN days_supply          INT,
  ADD COLUMN substitution_allowed BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN pharmacy_id          UUID,          -- pharmacies, below
  ADD COLUMN transmission         TEXT NOT NULL DEFAULT 'electronic' CHECK (transmission IN
                                    ('electronic', 'print', 'fax', 'phone')),
  ADD COLUMN status_reason        TEXT,          -- why cancelled, changed or not sent
  ADD COLUMN external_ref         TEXT,          -- the embedded vendor's prescription ID
  ADD COLUMN prescribing_rule_evaluation_id UUID;  -- DEA telemedicine and state rules applied

CREATE TABLE pharmacies (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID REFERENCES organizations (id),  -- kind 'pharmacy', when known as one
  ncpdp_id            TEXT UNIQUE,              -- the pharmacy's NCPDP provider ID
  npi                 CHAR(10),
  name                TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('retail', 'mail_order', 'specialty',
                        'long_term_care', 'compounding_503a', 'outsourcing_503b')),
  address_id          UUID,
  services            TEXT[] NOT NULL DEFAULT '{}',  -- 'epcs', 'cancel', 'change', 'fill_status'
  directory_synced_at TIMESTAMPTZ
);

ALTER TABLE medication_requests
  ADD FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id);

CREATE TABLE erx_messages (              -- every SCRIPT message in or out, as sent
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id       UUID NOT NULL REFERENCES organizations (id),
  medication_request_id UUID REFERENCES medication_requests (id),
  integration_id        UUID NOT NULL REFERENCES integrations (id),  -- the network or vendor
  direction             TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  message_type          TEXT NOT NULL CHECK (message_type IN ('new', 'renewal_request',
                          'renewal_response', 'change_request', 'change_response', 'cancel',
                          'cancel_response', 'fill_status', 'status', 'error', 'verify')),
  script_version        TEXT NOT NULL,       -- '2017071', '2023011'
  network_message_id    TEXT NOT NULL,
  relates_to_id         TEXT,                -- the message this answers
  pharmacy_id           UUID REFERENCES pharmacies (id),
  payload_ref           TEXT NOT NULL,       -- the message bytes in the PHI store
  status                TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'verified',
                          'error', 'received', 'processed')),
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (integration_id, direction, network_message_id)
);

CREATE TABLE epcs_enrollments (          -- a prescriber enabled for controlled substances
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  practitioner_id     UUID NOT NULL REFERENCES practitioners (id),
  dea_number_ref      TEXT NOT NULL,       -- held in the secrets vault
  dea_subdivision     TEXT NOT NULL,       -- DEA registrations are per state
  schedules           TEXT[] NOT NULL,     -- '{II,III,IV,V}'
  identity_proofed_by TEXT NOT NULL,       -- the credential service provider
  identity_proofed_at TIMESTAMPTZ NOT NULL,
  token_kind          TEXT NOT NULL CHECK (token_kind IN ('hard_token', 'soft_token',
                        'biometric')),
  access_granted_by   UUID NOT NULL,       -- first access-control administrator
  access_approved_by  UUID NOT NULL,       -- the second; never the same person
  valid_during        DATERANGE NOT NULL,
  CHECK (access_granted_by <> access_approved_by)
);

CREATE TABLE epcs_signings (             -- each two-factor signing event
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  medication_request_id UUID NOT NULL REFERENCES medication_requests (id),
  enrollment_id         UUID NOT NULL REFERENCES epcs_enrollments (id),
  factors               TEXT[] NOT NULL,   -- two of 'knowledge', 'possession', 'biometric'
  signed_at             TIMESTAMPTZ NOT NULL,
  signed_payload_sha256 TEXT NOT NULL,     -- what was signed, for the audit
  CHECK (cardinality(factors) >= 2)
);

CREATE TABLE pdmp_checks (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id       UUID NOT NULL REFERENCES organizations (id),
  patient_id            UUID NOT NULL REFERENCES patients (id),
  practitioner_role_id  UUID NOT NULL REFERENCES practitioner_roles (id),
  medication_request_id UUID REFERENCES medication_requests (id),
  states_queried        TEXT[] NOT NULL,
  states_responded      TEXT[] NOT NULL,
  report_ref            TEXT,              -- kept only where the integration terms allow
  override_reason       TEXT,              -- where the state allows signing without a check
  checked_at            TIMESTAMPTZ NOT NULL
);
```

The signing gate for a controlled substance, in order: an active `epcs_enrollments` row for the prescriber's DEA registration in the right state and schedule; a `pdmp_checks` row inside the state's window, or an allowed override; a prescribing rule evaluation that passes the DEA telemedicine rule in force today if the encounter was virtual; then the two-factor signing, recorded, then transmission.

Design decisions:

- **The medication request is the order; messages are its history.** Every SCRIPT message is stored as sent, with its version and network ID, so a change request answers the right prescription and "did the pharmacy get it?" has a verified answer.
- **Two SCRIPT versions coexist** until the 2017071 adoption expires on January 1, 2028; the version is a property of each message and each trading partner, not a global setting.
- **EPCS is enrollment plus signing.** Identity proofing, token, two administrators and the signing event are rows; separation of duties is a check constraint, and the audit cycle (every two years or on change) is tracked against the application release that changed controlled-substance code.
- **Rules decide controlled-substance prescribing,** with the DEA rule, state EPCS and PDMP mandates, and payer requirements as effective-dated rows, and the evaluation stored on the request.
- **Embedded vendors are crosswalked** through `external_ref` and the integration, never trusted as the only record.
- **Events:** `prescription.signed`, `prescription.transmitted`, `prescription.error`, `prescription.change_requested`, `prescription.cancelled`, `prescription.filled`, through the [outbox](/docs/architecture/events#the-transactional-outbox) to clinician worklists and patient notifications.

## Auditing

- **Every prescription's path.** The request, each message with its version and status, the pharmacy, and fill status, so a "the pharmacy never got it" call is answered from rows.
- **Controlled-substance signing.** Enrollment with identity proofing, the two administrators who granted access, each signature with its factors, and the PDMP check before it; DEA's rule expects the application to produce reports of controlled-substance prescriptions and access changes for the registrant to review.
- **Rule evaluations.** For each controlled-substance prescription after a virtual encounter, the DEA rule version and inputs that allowed it, because the rule's dates have changed every year.
- **Part D EPCS compliance.** The share of a prescriber's qualifying controlled-substance prescriptions sent electronically per measurement year, with exceptions, against CMS's 70% threshold.
- **Access.** Who viewed medication histories and PDMP results, including reads ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Treat a prescription as an order with a message history,** stored as sent, with version and network IDs, and close the loop with fill status.
- **Plan two migrations:** SCRIPT 2017071's adoption expires January 1, 2028, and pharmacy claims move from Telecommunication D.0 to F6 on August 14, 2027; both are per-partner cutovers.
- **Build EPCS as its own surface:** identity proofing, tokens, two-person access control, a two-factor signing ceremony, audits every two years or on change, and reports.
- **Gate controlled-substance signatures** on enrollment, the PDMP check and a stored rule evaluation that includes the DEA telemedicine rule in force on that date.
- **Watch the DEA calendar:** the general flexibilities run through December 31, 2026 and the special registration rule is still a proposal as of October 2026; be able to list affected patients before a deadline.
- **Embed e-prescribing unless prescribing is the product,** and keep your own record and crosswalk to the vendor's.
- **Show cost before signing** with real-time benefit checks, which Part D sponsors must support from January 1, 2027.
- **Review compounded-drug copy against FDA's guidance** and record on each order whether the product was compounded and where.

## References

**Rules and standards**

- [21 CFR part 1311 (2025 edition, govinfo)](https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol9/xml/CFR-2025-title21-vol9-part1311.xml), identity proofing at Assurance Level 3 under NIST SP 800-63-1, two-factor authentication and FIPS 140-2 Level 1 tokens, sole possession, two access-control administrators, third-party audits every two years or on change, two-year pharmacy archives
- [Federal Register: Electronic Prescriptions for Controlled Substances (March 31, 2010)](https://www.federalregister.gov/api/v1/documents/2010-6687.json), the interim final rule at 75 FR 16236, effective June 1, 2010
- [42 CFR 423.160 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=423&section=423.160), SCRIPT 2017071 and 2023011 for Part D, RTPB and formulary and benefit standards from January 1, 2027, EPCS from January 1, 2021 at 70% with compliance actions from January 1, 2023 and long-term care from January 1, 2028
- [45 CFR 170.205 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=170&section=170.205), SCRIPT 2017071 adoption expiring January 1, 2028, SCRIPT 2023011, RTPB version 13
- [45 CFR 162.1102 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=162&section=162.1102), NCPDP Telecommunication D.0 through August 14, 2027 and F6 from August 14, 2027
- [ASTP/ONC: HTI rules](https://healthit.gov/regulations/hti-rules/), HTI-4 on electronic prescribing, real-time prescription benefit and electronic prior authorization, published August 4, 2025
- [Federal Register: Fourth Temporary Extension of COVID-19 Telemedicine Flexibilities (December 31, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-12-31/html/2025-24123.htm), 2026 coverage, the third extension's history, the buprenorphine and VA rules' effective dates, the 2024 prescription data
- [Federal Register API: DEA telemedicine documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=telemedicine&conditions[agencies][]=drug-enforcement-administration&order=newest&per_page=10), the special registration proposal of January 17, 2025 and no final rule or fifth extension through October 19, 2026

**Agencies**

- [CMS: EPCS program](https://www.cms.gov/medicare/e-health/eprescribing/cms-eprescribing-for-controlled-substances-program), SUPPORT Act section 2003, the 70% threshold, exceptions, the measurement year 2025 waiver window, long-term care from 2028 at the earliest
- [FDA: Policies for compounders as GLP-1 supply stabilizes](https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize), tirzepatide and semaglutide shortage resolution and enforcement discretion dates
- [FDA: Telehealth companies, what to know when promoting compounded drugs](https://www.fda.gov/drugs/human-drug-compounding/fda-telehealth-companies-what-know-when-promoting-compounded-drugs), prohibited comparisons and approval claims, warning letters to telehealth companies
- [FDA: Concerns with unapproved GLP-1 drugs used for weight loss](https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss), telehealth red flags and warning letters over retatrutide and research-use products

**Vendors**

- [Surescripts: E-prescribing](https://surescripts.com/what-we-do/e-prescribing), 2025 volumes, RxChange count, uptime, certification and EPCS audit requirement, products
- [DoseSpot](https://www.dosespot.com/), 50M+ prescriptions a year, cloud integration, EPCS, ONC certification
- [Bamboo Health: PMP Gateway](https://bamboohealth.com/solutions/pmp-gateway/), PDMP integration into 500+ systems, 1M+ providers
- [Hims & Hers Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1773751/000177375126000022/hims-20251231.htm), 503A pharmacies and 503B facility, wholly owned fulfillment, compounded GLP-1 from 503A pharmacies
