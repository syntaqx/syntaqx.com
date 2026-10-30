+++
title = "Digital Health Apps & Devices"
nav_title = "Digital Health & Devices"
description = "Wellness or device, FDA software rules and the 2026 CDS and wellness guidance, wearable and phone health data, the FTC breach rule and digital therapeutics."
category = "Health Tech Industry"
order = 1948
part = "Care Delivery"
tags = ["health-tech", "digital-health", "fda", "samd", "wearables", "ftc", "clinical-decision-support"]
+++

A step counter, a sleep score, a blood pressure trend from a watch, an app that teaches cognitive behavioral therapy, a model that flags a likely stroke on a CT scan and a glucose sensor sold without a prescription all run on the same phones and clouds, and the law treats them very differently. One question decides most of it: **what is the software intended to do?** If it is for maintaining a healthy lifestyle, it is a general wellness product and FDA doesn't regulate it as a device. If it is intended to diagnose, treat, mitigate or prevent disease, it is a medical device, and FDA's premarket review, quality and cybersecurity rules apply. If it supports a clinician's decision in a way the clinician can check, it may be excluded from the device definition entirely. The intended use is read from what the company says: the labeling, the marketing, the app store description and the screens.

The other questions follow from who holds the data. A wearable's readings in the consumer's own app are consumer health data, outside HIPAA, governed by the FTC and by state health privacy laws. The same readings sent to a practice for remote monitoring become part of the medical record, under HIPAA. This chapter covers the wellness and device line, FDA's software rules and the 2026 guidance changes, clinical decision support and its certification counterpart, wearables and the phone platforms' health data, the FTC Health Breach Notification Rule, and digital therapeutics and how they get paid. It extends `observations` and `integrations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). State consumer health data laws belong to [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy); AI governance generally to [AI in Health Tech](/books/health-tech/ai-in-health-tech) and the playbook's [AI Agents in the Product](/docs/architecture/ai-agents).

## How the Platforms Do It

As of October 2026, from each organization's own pages:

| Platform or product | What it is | What its public pages describe |
| --- | --- | --- |
| **Apple HealthKit (Health Records)** | The iPhone's health data store, including clinical records from providers | Clinical record types use `HKClinicalTypeIdentifier`, which "specifies the types of FHIR data supported by HealthKit"; "clinical records are read-only," so apps can't request to share them or create records; clinical types appear in "a separate permission sheet"; apps must enable the Clinical Health Records capability, give a usage string, and have "a valid Privacy Policy URL" |
| **Android Health Connect (medical records)** | Android's on-device health data store, adding clinical records | FHIR R4 and R4B; resources including AllergyIntolerance, Condition, Encounter, Immunization, Medication, MedicationRequest, MedicationStatement, Observation (laboratory, vital signs, social history, pregnancy), Patient, Practitioner and Procedure (plus Location, Organization and PractitionerRole); APIs in Jetpack Health Connect 1.1.0-beta02 requiring the Android 16 SDK, marked experimental, with the Play policy "still being developed" |
| **Dexcom Stelo** | An over-the-counter continuous glucose monitor | FDA cleared it March 5, 2024 as the first OTC CGM, for adults 18 and older who don't use insulin; not designed to alert to hypoglycemia; "Users should not make medical decisions based on the device's output without talking to their healthcare provider" |
| **FDA's AI-enabled device list** | The public list of authorized devices that use AI | Updated periodically; the newest decision date visible in October 2026 was June 29, 2026; FDA "will explore methods to identify and tag medical devices that incorporate foundation models" |

The patterns: **the phone platforms are the integration layer for consumer data,** and both now carry clinical records in FHIR alongside sensor data, with permission per data type and the platform's own review rules on top of the law. **The device line moved toward consumers.** A glucose sensor sold without a prescription and wellness products estimating physiologic values are the boundary cases FDA's 2026 wellness guidance addresses. **AI devices are counted publicly**, and FDA has signaled it will start tagging foundation-model devices, which makes "is our model a device" a question with a public answer once you're authorized.

## Wellness or Medical Device

The 21st Century Cures Act (section 3060) added section 520(o)(1) to the FD&C Act, excluding five kinds of software function from the device definition:

| Exclusion | What the statute excludes |
| --- | --- |
| (A) Administrative support | Software "for administrative support of a health care facility": scheduling, billing, inventory, practice management |
| (B) Healthy lifestyle | Software "for maintaining or encouraging a healthy lifestyle," unrelated to diagnosing, curing, mitigating, preventing or treating disease |
| (C) Electronic patient records | Software "to serve as electronic patient records," with conditions, as long as it isn't intended to interpret or analyze the records for diagnosis or treatment |
| (D) Lab data transfer and display | Software "for transferring, storing, converting formats, or displaying clinical laboratory test" data, unless it interprets or analyzes it |
| (E) Clinical decision support | Software that doesn't "acquire, process, or analyze a medical image" or a signal from a device, displays or analyzes medical information, supports a health care professional's recommendation, and lets the professional independently review the basis for it |

Most of this book's software sits in (A) and (C): a practice management system, a scheduling tool, a patient engagement platform, an EHR. They are not devices, and they become one only when a function crosses into diagnosis or treatment, such as an algorithm that reads an X-ray or a feature that tells a patient to change a dose.

**General wellness, as revised in January 2026.** FDA's final General Wellness guidance (issued January 6, 2026, superseding the 2019 version) keeps the core distinction and moves the line on wearables:

- Products using non-invasive sensing (optical sensing, for example) to estimate values like blood pressure, oxygen saturation or blood glucose can be wellness products when they are non-invasive and not implanted, and they may show "values, ranges, trends, baselines," but not values that mimic clinical measurements "unless validated." The guidance's example: a wrist-worn optical product reporting blood pressure is wellness "provided the product has validated values for blood pressure."
- A wellness product may tell the user that seeing a clinician could help, under conditions.
- A product used for "screening, diagnosis, monitoring, alerting, or management" of a disease is not a wellness product.

**Intended use is the product's copy.** Since the line runs through claims, the controls are editorial: every claim on the site, in the app store listing, in onboarding and in notifications is part of the intended use. My rule for wellness products: a claims register, versioned, reviewed before release, and enforced in code where the product generates text (a notification that says "your readings suggest hypertension" is a diagnostic claim the register never approved).

## FDA's Rules for Software That Is a Device

Software that is a device (software as a medical device, or a software function in a device) is reviewed through FDA's premarket pathways, by risk class: 510(k) clearance against a predicate, De Novo classification for novel low and moderate risk devices, or premarket approval for the highest risk. Then the device lives under quality system requirements, adverse event reporting and change control. The 2025 and 2026 guidance that changes how software teams work, as listed on FDA's digital health guidance page and each guidance's own page as of October 2026:

| Guidance | Status | What it does for software |
| --- | --- | --- |
| **Predetermined Change Control Plans for AI-enabled device software functions** | Final, dated August 18, 2025 | Lets a manufacturer get planned future model changes authorized up front, so retraining inside the plan doesn't need a new submission |
| **AI-Enabled Device Software Functions: Lifecycle Management and Marketing Submission Recommendations** | Draft, January 7, 2025 | What an AI device submission should contain across the lifecycle; the only draft on FDA's digital health list |
| **Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions** | Final, February 2026 (the digital health list still shows the June 27, 2025 version) | Supersedes the June 27, 2025 version; addresses "cyber devices" under FD&C section 524B |
| **Clinical Decision Support Software** | Final, January 29, 2026 | Below |
| **General Wellness: Policy for Low Risk Devices** | Final, January 6, 2026 | Above |

What changes in engineering practice: **releases are regulated events** for the device function (a change to the model or its intended use is assessed against the PCCP or for a new submission, and the assessment is a record); **cybersecurity is a premarket deliverable** for cyber devices, which means a software bill of materials, a vulnerability management plan and threat modeling that a reviewer reads ([Threat Modeling](/docs/security/threat-modeling)); and **the device function is separable**, because a platform that contains one device function (an AI read of images, say) alongside non-device functions (scheduling, messaging) wants the device boundary drawn tightly so the rest of the product isn't under device change control.

## Clinical Decision Support

CDS is where most health software teams meet FDA. A drug interaction alert, a sepsis risk score, a recommendation for a screening test, a dosing calculator: each can fall inside the (E) exclusion or outside it. FDA's final CDS guidance (issued January 29, 2026, superseding a version issued January 6, 2026) applies the statute's criteria and adds two notable positions:

- **One recommendation can still be non-device CDS.** "if only one option is clinically appropriate and the software function otherwise meets all criteria under section 520(o)(1)(E), FDA intends to exercise enforcement discretion."
- **The fourth criterion (independent review of the basis) weighs automation and time pressure.** The guidance considers the "level of software automation" and the "time-critical nature" of the decision, because a clinician can't independently review the basis of an alert that demands action in seconds.

In practice: CDS that shows its inputs, its logic or source, and its reasoning to a clinician with time to check it is likely outside the device definition; CDS that analyzes images or device signals, targets patients rather than clinicians, or drives time-critical action without a reviewable basis is likely a device.

**Certification has its own CDS rule.** ASTP/ONC's certification criterion for decision support interventions (45 CFR 170.315(b)(11)), introduced by HTI-1, required certified health IT to support source attributes that describe predictive and evidence-based interventions so users can judge them. HTI-5, published October 28, 2026 and effective December 28, 2026, "reduces the scope of the 'decision support interventions' certification criterion," removing the source attribute requirements in (b)(11)(iv) and (v); the criterion is revised, not removed, among 14 criteria removed and 7 revised. So as of October 2026, an EHR's obligation to expose model cards to its users is ending for certification purposes, while FDA's CDS criteria are unchanged. My default stays the same either way: every decision support intervention carries a record of its source, inputs, version, intended users and known limitations, because the FDA analysis, the customer's AI governance committee and any liability question all ask for it ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)). The certification detail belongs to [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification#the-certification-program).

## Wearables and Phone Health Data

Consumer health data reaches a practice or a platform three ways: the patient's app syncs from HealthKit or Health Connect to the vendor's server; a connected device (a cuff, a scale, a CGM) uploads through its maker's cloud; or the patient shares a summary in a portal message. Each has different rules:

- **Permission is per data type and revocable.** Both platforms ask the user per type (heart rate, steps, clinical records), and a sync has to handle revoked types without deleting what was already shared lawfully.
- **Clinical records from the phone are copies.** Apple's Health Records are read-only to apps; Health Connect's medical records are FHIR resources the user brought from providers. A platform reading them gets the patient's copy, useful for intake and medication lists, never authoritative over the source chart.
- **Readings are observations with provenance.** A blood pressure from a validated cuff for remote monitoring, a watch estimate under the wellness guidance, and a number the patient typed are different evidence. The raw reading records the device, its regulatory status for that measurement, how it arrived and when it was measured, and clinical rules (remote monitoring billing, alert thresholds) only accept the sources they're allowed to ([Remote Patient and Therapeutic Monitoring](/books/health-tech/telehealth#remote-patient-and-therapeutic-monitoring)).
- **Inside a covered entity's record it is PHI.** Once readings land in a practice's system for treatment, HIPAA applies to that copy; the consumer app's copy stays under the FTC and state law. A vendor that runs both the consumer app and the practice integration holds the same reading under two regimes and has to know which copy is which.

## The FTC Health Breach Notification Rule

The FTC's Health Breach Notification Rule (16 CFR part 318) covers "vendors of personal health records, PHR related entities, and third party service providers," and excludes HIPAA covered entities and anyone acting as a business associate of one. [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#the-ftc-health-breach-notification-rule) covers the rule as a sales question; this section covers the product. The FTC finalized amendments on April 26, 2024, effective July 29, 2024, that make its reach explicit:

- **Health apps are covered.** The amendments clarify that apps and similar technologies holding health information not covered by HIPAA are within the rule.
- **A breach includes an unauthorized disclosure,** not only a security intrusion. Sharing health data with an advertising platform without the consumer's authorization is a breach of security under the rule.
- **Notice is due "without unreasonable delay and in no case later than 60 calendar days after the discovery"** to affected individuals, and for breaches of 500 or more people, to the FTC at the same time.

The FTC's first action under the rule was GoodRx in 2023 ([Advertising and Privacy Enforcement](/books/health-tech/telehealth#advertising-and-privacy-enforcement)). For an engineer the operative fact is the disclosure definition: an SDK or pixel that sends health events to a third party without authorization is a breach, so the data inventory (what each SDK receives) and the consent record (what the consumer authorized) are the controls, and a change to either is reviewed like a security change ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)). HIPAA's own breach rules, for covered entities and business associates, are the playbook's ([The Three Rules](/docs/compliance/hipaa#the-three-rules)).

## Digital Therapeutics and How They Get Paid

A digital therapeutic is software that is itself the treatment: a CBT program for insomnia or depression, a game-based attention therapy, a substance use program. Those that are devices are authorized through 510(k) or De Novo and often labeled prescription-only, which means a clinician orders them and a payer has to be convinced to cover them. Reimbursement was the industry's problem for years; Medicare has started to build codes:

- **Digital mental health treatment.** The CY2025 Physician Fee Schedule finalized payment for digital mental health treatment devices "furnished incident to professional behavioral health services," used with ongoing treatment under a care plan, with three new HCPCS codes; the devices must be cleared under 510(k) or granted De Novo authorization. The CY2026 rule expanded the policy to devices "used in the treatment of Attention Deficit Hyperactivity Disorder (ADHD)."
- **Remote monitoring.** RPM and RTM pay for device-based monitoring, and the device "must meet the definition of a medical device defined by FDA," which is why wellness wearables can't be billed for RPM even when they measure the same thing.

The build consequence is that a digital therapeutic sits in both worlds: it is a device with a regulatory record, and it is an order with a prescriber, a patient, an activation, engagement data and a claim. The order and claim reuse the core records; the device side needs its own.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model): the devices and their regulatory status, the claims made about them, the decision support inventory, the consumer's app connections, and the raw readings that become `observations`. The record of each deployed AI model (its basis, review rule and evaluation) belongs to [AI in Health Tech](/books/health-tech/ai-in-health-tech#decision-support-transparency-and-nondiscrimination) (`ai_features`); HIPAA breach assessments to [HIPAA in Practice](/books/health-tech/hipaa-in-practice#breach-notification-and-the-wall-of-shame).

```sql
CREATE TABLE devices (                   -- a product or software function, by model
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  maker_org_id     UUID NOT NULL REFERENCES organizations (id),  -- kind 'vendor'
  name             TEXT NOT NULL,
  model            TEXT,
  kind             TEXT NOT NULL CHECK (kind IN ('hardware', 'software_function', 'app')),
  UNIQUE (maker_org_id, name, model)
);

CREATE TABLE device_regulatory_records ( -- regulatory status per intended use and period
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  device_id          UUID NOT NULL REFERENCES devices (id),
  intended_use       TEXT NOT NULL,      -- the claim as labeled, verbatim
  status             TEXT NOT NULL CHECK (status IN ('not_device_520o', 'general_wellness',
                       'enforcement_discretion', '510k', 'de_novo', 'pma')),
  exclusion          TEXT CHECK (exclusion IN ('a_admin', 'b_lifestyle', 'c_records',
                       'd_lab_data', 'e_cds')),
  submission_number  TEXT,               -- K, DEN or P number when authorized
  measures           TEXT[] NOT NULL DEFAULT '{}',  -- what it may report: 'blood_pressure', ...
  validated_measures TEXT[] NOT NULL DEFAULT '{}',
  pccp_ref           TEXT,               -- authorized change control plan, if any
  rationale_ref      TEXT NOT NULL,      -- the analysis or authorization behind the status
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE device_claims (             -- every public statement of what the product does
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  device_id            UUID NOT NULL REFERENCES devices (id),
  surface              TEXT NOT NULL,    -- 'website', 'app_store', 'onboarding', 'notification'
  text                 TEXT NOT NULL,
  regulatory_record_id UUID NOT NULL REFERENCES device_regulatory_records (id),
  approved_by          UUID NOT NULL,
  approved_at          TIMESTAMPTZ NOT NULL,
  retired_at           TIMESTAMPTZ
);

CREATE TABLE decision_support_interventions (  -- every alert, score or recommendation
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID REFERENCES organizations (id),  -- null for vendor-supplied
  name                 TEXT NOT NULL,
  kind                 TEXT NOT NULL CHECK (kind IN ('rule', 'predictive', 'evidence_based')),
  version              TEXT NOT NULL,
  intended_users       TEXT NOT NULL,    -- clinicians, staff, patients
  inputs               JSONB NOT NULL,   -- what data it reads
  source               TEXT NOT NULL,    -- the guideline, model card or developer
  known_limits         TEXT,
  regulatory_record_id UUID REFERENCES device_regulatory_records (id),
  active_during        TSTZRANGE NOT NULL,
  UNIQUE (organization_id, name, version)
);

CREATE TABLE app_connections (           -- a consumer's grant from HealthKit, Health Connect
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  platform         TEXT NOT NULL CHECK (platform IN ('healthkit', 'health_connect',
                     'device_cloud', 'manual')),
  device_id        UUID REFERENCES devices (id),  -- for a device maker's cloud
  data_types       TEXT[] NOT NULL,      -- as granted; revocations update this
  consent_id       UUID NOT NULL REFERENCES consents (id),
  last_synced_at   TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ
);

CREATE TABLE device_readings (           -- raw readings as received, before they are clinical
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  connection_id    UUID NOT NULL REFERENCES app_connections (id),
  device_id        UUID REFERENCES devices (id),
  serial_ref       TEXT,                 -- which unit, when known
  measure          TEXT NOT NULL,        -- 'blood_pressure', 'glucose', 'steps'
  value            JSONB NOT NULL,       -- {"systolic": 128, "diastolic": 82, "unit": "mm[Hg]"}
  source_kind      TEXT NOT NULL CHECK (source_kind IN ('device_medical', 'device_wellness',
                     'patient_reported', 'phone_platform')),
  regulatory_record_id UUID REFERENCES device_regulatory_records (id),  -- status when measured
  measured_at      TIMESTAMPTZ NOT NULL, -- device time
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observation_id   UUID REFERENCES observations (id),  -- set once filed to the chart
  UNIQUE (connection_id, measure, measured_at)        -- resends are idempotent
);

CREATE TABLE hbnr_assessments (          -- non-HIPAA products: a breach under 16 CFR 318?
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  device_id           UUID NOT NULL REFERENCES devices (id),  -- the app or product
  discovered_at       TIMESTAMPTZ NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('intrusion', 'unauthorized_disclosure')),
  recipients          TEXT[] NOT NULL,   -- the SDKs, partners or attackers involved
  people_affected     INT,
  notice_due_by       TIMESTAMPTZ NOT NULL,  -- 60 calendar days from discovery
  ftc_notice_required BOOLEAN NOT NULL,      -- 500 or more
  decided_by          UUID NOT NULL,
  decision            TEXT NOT NULL CHECK (decision IN ('breach', 'not_breach')),
  notified_at         TIMESTAMPTZ
);
```

Design decisions:

- **Regulatory status is per intended use and date.** A product can be wellness for one claim and a cleared device for another; the record holds the exact claim, the status, the authorization or exclusion analysis, and what it may report, validated or not.
- **Claims are data tied to status.** Every public statement links to the regulatory record that permits it, so a new notification template that implies diagnosis fails review against the register.
- **Decision support is inventoried** with source, inputs, version, users and limits, whether or not certification still requires it, and links to its FDA analysis.
- **Readings arrive raw and become clinical deliberately.** `device_readings` keeps what came in with its source class and regulatory status at the time; only readings a rule permits are filed as `observations`, and remote monitoring counts them through `rpm_readings` ([Telehealth](/books/health-tech/telehealth#how-to-build-it)). No RPM claim from a wellness reading, no clinical alert from an unvalidated estimate.
- **Phone-platform grants are revocable connections,** synced per granted type; the patient's copy of their clinical records is a source for intake, not a replacement for the chart.
- **Non-HIPAA products run an HBNR clock** from discovery, with the disclosure-as-breach definition built in.

## Auditing

- **Regulatory history.** Each product's status over time, with the claim, the analysis or authorization, and the release in which each changed; a reviewer asking "what did you say it did in March?" gets the claims register for March.
- **Device-function releases.** For a regulated software function, each release with its change assessment against the PCCP or the decision to submit, plus the cybersecurity artifacts.
- **Decision support in use.** Which intervention version fired, on what inputs, for whom, and what the user did, for clinical review and liability ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Data flows.** Every SDK and partner receiving health data, what it receives and under which consent, with changes reviewed; HBNR assessments and notices with their deadlines.
- **Source of every reading** used in a claim or a clinical alert.

## What This Means for the System You Build

- **Decide the intended use first** and write it down per product and claim; it determines wellness, exclusion or device.
- **Keep a versioned claims register** and enforce it on every surface that generates text, including notifications.
- **Draw the device boundary tightly** around regulated functions so the rest of the platform isn't under device change control.
- **Inventory decision support** with source, inputs, version and limits, regardless of HTI-5 narrowing the certification requirement from December 28, 2026.
- **Store readings with provenance** and let only permitted sources drive billing and alerts.
- **Treat phone-platform health data as revocable, per-type grants** and clinical records from phones as patient copies.
- **Run the FTC breach rule for non-HIPAA products,** where an unauthorized disclosure to an SDK is a breach with a 60-day clock.
- **Bill digital therapeutics through the codes that exist,** with the device's regulatory record attached to the order.

## References

**Statutes, rules and guidance**

- [21 USC 360j (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360j), section 520(o)(1)'s five software exclusions from the device definition
- [FDA: Clinical Decision Support Software guidance (January 29, 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software), superseding the January 6, 2026 version, enforcement discretion for a single recommendation, automation and time-critical decisions
- [FDA: General Wellness, Policy for Low Risk Devices (January 6, 2026)](https://www.fda.gov/media/90652/download), non-invasive estimates, validated values, notifications to see a clinician, the screening and diagnosis line
- [FDA: Guidances with digital health content](https://www.fda.gov/medical-devices/digital-health-center-excellence/guidances-digital-health-content), the AI-enabled lifecycle draft, the PCCP final guidance, the section 3060 guidance
- [FDA: Cybersecurity in Medical Devices (February 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket), cyber devices under section 524B, superseding June 27, 2025
- [FDA: Artificial intelligence-enabled medical devices list](https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/list-artificial-intelligence-enabled-medical-devices), periodic updates and foundation model tagging
- [Federal Register: HTI-5 final rule (October 28, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-10-28/html/2026-21943.htm), the reduced decision support interventions criterion, 14 criteria removed and 7 revised, effective December 28, 2026
- [16 CFR 318.1 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-16?part=318&section=318.1), the Health Breach Notification Rule's scope and HIPAA exclusion
- [Federal Register: Health Breach Notification Rule amendments (May 30, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-05-30/html/2024-10855.htm), effective July 29, 2024
- [FTC: Health Breach Notification Rule changes finalized (April 26, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule), health apps covered, unauthorized disclosure as breach, 60-day and 500-person notice rules

**Agencies**

- [FDA: First over-the-counter continuous glucose monitor cleared (March 5, 2024)](https://www.fda.gov/news-events/press-announcements/fda-clears-first-over-counter-continuous-glucose-monitor), Dexcom Stelo's intended users and limits
- [CMS: CY2025 Physician Fee Schedule final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2025-medicare-physician-fee-schedule-final-rule), digital mental health treatment devices incident to behavioral health services, three HCPCS codes, 510(k) or De Novo
- [CMS: CY2026 Physician Fee Schedule final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2026-medicare-physician-fee-schedule-final-rule-cms-1832-f), digital mental health treatment expanded to ADHD devices
- [CMS MLN901705: Telehealth and remote patient monitoring](https://www.cms.gov/files/document/mln901705-telehealth-remote-monitoring.pdf), remote monitoring devices must meet FDA's device definition

**Platforms**

- [Apple Developer: Accessing health records](https://developer.apple.com/documentation/healthkit/accessing-health-records), clinical types, read-only records, the separate permission sheet, capability, usage string and privacy policy
- [Android Developers: Health Connect medical records data format](https://developer.android.com/health-and-fitness/health-connect/medical-records/data-format), FHIR R4 and R4B and supported resources
- [Android Developers: Health Connect medical records](https://developer.android.com/health-and-fitness/health-connect/medical-records), the beta library, Android 16 SDK, experimental annotation and Play policy status
