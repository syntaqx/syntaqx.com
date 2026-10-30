+++
title = "Patient Portals & Patient Access Apps"
nav_title = "Portals & Patient Access"
description = "Portals and proxy access, payer Patient Access APIs, certified APIs and phone records, open notes, results release and portal messages billed as e-visits."
category = "Health Tech Industry"
order = 1949
part = "Care Delivery"
tags = ["health-tech", "patient-portals", "patient-access", "fhir", "proxy-access", "e-visits"]
+++

A patient portal is the practice's or hospital's website and app for patients: see results and notes, message the care team, book and pay, fill forms, renew prescriptions, download records. Behind it sit three obligations that grew up separately and now meet in the same screens: HIPAA's right of access, the Cures Act's information blocking rules (which made immediate, electronic access the default), and CMS's API rules for payers, which give members their claims and clinical data through apps of their choice. A patient in 2026 reaches their record through a provider's portal, a payer's app, an app on their phone that pulls from both through FHIR APIs, or several of these at once.

The scale is now ordinary. ASTP's analysis of the 2024 Health Information National Trends Survey found that more than three in four individuals were offered online access to their records by a provider or insurer and 65% accessed them at least once in the past year; proxy and caregiver access more than doubled, "from 24% in 2020 to 51% in 2024"; app-based access rose from 38% in 2020 to 57% in 2024; and 59% had multiple portals, while fewer than 1 in 10 used a third-party app to combine them. This chapter covers what portals do and who builds them, proxy access, the payer Patient Access API, certified patient APIs and phone-based records, open notes and results release, portal messaging and its billing as e-visits, and CMS's 2025 to 2026 health tech ecosystem push. It extends `patients`, `communications` and `consents` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Identity proofing at enrollment belongs to Patient Matching & Identity; the proxy and personal representative model to Consent, Authorization & Proxies; app authorization to SMART on FHIR & App Platforms.

## How the Platforms Do It

As of October 2026, the channels a patient uses to reach their record, from the operators' own pages and rules:

| Channel | Who runs it | What the public pages and rules describe |
| --- | --- | --- |
| **The provider's portal** | The EHR or PMS vendor, branded for the practice or health system | ASTP's data brief notes patients "overwhelmingly utilize patient portal apps from EHR developers (e.g., Epic's MyChart), health care organizations, and insurers"; primary care portals are the most common (68%) |
| **A lab's own account** | The reference lab | Labcorp's consumer service delivers results to a Labcorp Patient account, with urgent results also by phone or mail |
| **Certified patient API** | Every certified EHR, under 45 CFR 170.315(g)(10) | Must "Respond to requests for a single patient's data" (and for groups, for population services) using US Core, SMART App Launch and Bulk Data; refresh tokens valid for at least three months |
| **Payer Patient Access API** | Medicare Advantage, Medicaid, CHIP and federal exchange plans, under CMS rules | Claims and clinical data for dates of service from January 1, 2016, through a FHIR API since January 1, 2021; prior authorization information from January 1, 2027; annual usage reporting to CMS from 2026 |
| **Apple Health Records** | Apple, on iPhone | Read-only clinical records from providers in HealthKit, shown to apps through a separate permission sheet |
| **Android Health Connect medical records** | Google, on Android | FHIR R4 and R4B records on device, in beta with the Android 16 SDK |
| **CMS Aligned Networks and the Medicare App Library** | Networks and apps that pledged to CMS's framework | FHIR APIs, IAL2-or-equivalent identity, a Medicare App Library and a "Kill the Clipboard" check-in launched April 9, 2026 |

The patterns: **the portal is the EHR's product, not the practice's.** Most practices don't build a portal; they configure the one their EHR or PMS ships, and patient engagement vendors build around it (booking, payments, messaging) rather than replacing it. **APIs turned the portal into one client among many.** The same record a portal shows must be available through the certified API to any app the patient authorizes, and payers must expose theirs. **Patients collect portals.** With 59% holding several and few using an aggregator, the user experience problem is fragmentation, which is what CMS's 2025 ecosystem pledges and phone platforms are trying to solve.

## What a Portal Does

A practice portal's functions, and the record each touches:

| Function | Records | Rule that shapes it |
| --- | --- | --- |
| View results, notes, problems, medications, allergies, immunizations | The clinical record, read-only | Information blocking: available without delay unless an exception applies |
| Message the care team | `communications` with channel `portal` | Response expectations and billing (below) |
| Book, confirm, cancel | `appointments` | Scheduling & Online Booking |
| Pay a balance, set up a plan | `payments`, `ledger_entries` | Payments in the Practice |
| Fill intake forms, sign consents | `documents`, `consents` | Digital Intake, Forms & Consent |
| Request a refill | `medication_requests` | [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing#the-script-transactions) |
| Download or send records | `documents`, `disclosures` | HIPAA's right of access, 30 days at most (45 CFR 164.524) |
| Connect an app | OAuth grants | The certified API and SMART |

Two design consequences. **The portal is a view, not a store.** It reads from the record of truth (the EHR or PMS) and writes requests back to it; a portal that keeps its own copy of results drifts, and a stale copy shown to a patient is an information blocking problem as well as a safety one. **Every function is per account and per patient.** One login may reach several patients (a parent and three children, an adult child and an aging parent), so authorization is checked per patient per request, never per login ([Where Checks Belong](/docs/security/authorization#where-checks-belong)).

## Proxy Access

Proxy access is one person using a portal for another: a parent for a child, an adult child for a parent, a spouse, a caregiver. HINTS counts it as accessing the portal of "a person for whom they are providing care or making health care decisions," and its doubling since 2020 makes it a core feature, not an edge case. What a proxy may see depends on the legal relationship and on state law, and the data model for it (personal representatives, scoped grants, minors' confidential services) belongs to Consent, Authorization & Proxies. What the portal must do with that model:

- **Separate logins, never shared credentials.** The proxy has their own account and a grant to the patient's record; a parent logging in with a child's password is the failure the grant exists to prevent, because it leaves no record of who acted.
- **Scope by function.** Billing and scheduling without clinical notes, or results without messaging, are common grants; each portal function checks the grant's scopes.
- **Age transitions are dated events.** Adolescent confidentiality rules change what a parent proxy may see at an age set by state law, and full adulthood ends parental access unless the adult grants it again. These are computed from the patient's birth date and the state's rule and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Show the patient who has access.** The patient (or their representative) sees every active proxy and can revoke where the law allows, and every proxy action is logged as that proxy.

## The Payer Patient Access API

CMS's Interoperability and Patient Access final rule (CMS-9115-F, published May 1, 2020) required impacted payers to offer members a FHIR API. For Medicare Advantage, 42 CFR 422.119 requires it "beginning January 1, 2021," covering data "With a date of service on or after January 1, 2016": claims and encounter data, clinical data the plan holds, and formulary information for drug plans. The Interoperability and Prior Authorization final rule (CMS-0057-F, released January 17, 2024, effective April 8, 2024) adds to it, as of October 2026:

- **Prior authorization information** must be available through the Patient Access API "Beginning January 1, 2027."
- **Usage metrics:** "Beginning in 2026, by March 31 following any calendar year," plans report the total number of unique enrollees whose data were transferred through the API and the number transferred more than once.
- **Standards:** the API must conform to the certification program's API standards in 45 CFR 170.215 (US Core, SMART App Launch, Bulk Data and related specifications).
- **Faster decisions behind the data:** from January 1, 2026, standard prior authorization decisions for Medicare Advantage are due within 7 calendar days of the request (42 CFR 422.568).

A follow-on proposal (CMS-0062-P, April 14, 2026) would add drug prior authorization, API endpoint and usage reporting, and FHIR for HIPAA transactions; as of October 2026 it is a proposed rule. Payer APIs from the payer's side (provider access, payer-to-payer) belong to Inside a Payer; the patient-facing consequence is that an app can now show a member's claims, prior authorizations and clinical data from the plan beside what the provider's portal shows.

## Certified Patient APIs and Phone-Based Records

Every certified EHR must support the standardized API criterion, 45 CFR 170.315(g)(10): respond to requests for a single patient's data and for groups of patients, using US Core, SMART App Launch and Bulk Data, with refresh tokens valid for at least three months. That criterion is what lets a patient connect an app to their provider's EHR without the provider building anything. As of October 2026, ASTP's HTI-5 final rule (published October 28, 2026, effective December 28, 2026) removes 14 certification criteria and revises 7; I didn't confirm from the rule text whether it revises (g)(10). <!-- source-gap: hti5-g10 | status | whether HTI-5 revises 45 CFR 170.315(g)(10) or its refresh token requirement | closes with: the HTI-5 regulation text for 170.315(g)(10) in the Federal Register or the updated eCFR after December 28, 2026 | checked: 2026-10-29 -->

The phone platforms are the most visible clients:

- **Apple Health Records** pulls records from connected providers into HealthKit, where third-party apps can read them only with a separate, per-type permission and "clinical records are read-only."
- **Android Health Connect** stores FHIR R4 and R4B medical records on device (allergies, conditions, encounters, immunizations, medications, observations, procedures and the people and places behind them), with the APIs in beta and Google's Play policy still being written.

For a provider or vendor, the consequences are concrete. **Your API is part of your portal.** A result available in the portal but not through the API, or available later, is the kind of difference information blocking rules care about. **Third-party apps are authorized by the patient.** What a provider may do about an app it distrusts (warn the patient, refuse, or neither) is an information blocking question that Cures Act, Information Blocking & Certification owns; the portal's job is to show the patient what each app can reach. **Every grant is a record:** which app, which scopes, when granted, when refreshed, when revoked, so a patient can see and revoke their connections from the portal.

## Results Release and Open Notes

The Cures Act made clinical notes and results part of the electronic health information patients can access without delay, and the movement for open notes became a rule. OpenNotes, now an academic lab at Beth Israel Deaconess, describes "the U.S. 21st Century Cures Act requirement for open notes." The release rules for results are set out in [Results Release Under Cures](/books/health-tech/labs-and-diagnostics#results-release-under-cures): immediate release by default, holds only for a patient's own request, an individualized clinician judgment under the Preventing Harm exception, or a data problem, each recorded.

What the portal adds:

- **Release is visible.** The portal shows when each result and note became available and whether the clinician has reviewed it, so a patient who sees an abnormal value before a call knows the call is coming.
- **Patient preferences are set in the portal.** A patient who wants to hear about pathology from their doctor first can say so in advance, per category, and change it; that preference is what ONC's FAQ says can justify a delay "for no longer than necessary to fulfill each patient's request."
- **Notes are the legal record, shown as written.** Amendments the patient requests go through HIPAA's amendment process and are shown as amendments, never silent edits.
- **Sensitive data follows its own rules.** Substance use disorder records under Part 2, notes a clinician has segmented, and adolescent confidential services change what is released and to whom; State Health Privacy & Sensitive Data owns those rules.

## Portal Messaging and E-Visits

Portal messages are the largest unpaid workload in many practices, and Medicare has codes for the part of it that is real care. CMS's 2020 fact sheet describes three kinds of brief communication technology-based services:

| Service | Codes | What CMS describes |
| --- | --- | --- |
| **E-visit** | 99421 to 99423 | "patient-initiated online evaluation and management conducted via a patient portal"; "Online digital evaluation and management service, for an established patient, for up to 7 days," by cumulative time |
| **Virtual check-in** | G2012 | A brief communication technology-based service, 5 to 10 minutes, for an established patient |
| **Remote evaluation of recorded images or video** | G2010 | Review of a video or image the patient sent |

Billing a message turns it into a service with rules. For an e-visit, "the patient must generate the initial inquiry," they are established, and the clinician's cumulative time across the 7-day window is counted. A virtual check-in applies only when the communication is "not related to a medical visit within the previous 7 days" and doesn't lead to a visit within the next 24 hours or the soonest appointment, with the patient's verbal consent. For both, CMS says the Medicare coinsurance and deductible apply. That last point is why practices that bill portal messages tell patients first: a patient who didn't expect a bill for a message will stop sending messages, or dispute the charge.

Building it in:

- **A message thread can become an episode.** When a clinician decides a thread is evaluation and management, the system opens an e-visit episode on that date, counts the clinician's time on the thread for 7 days, and produces the charge at close with the code the time supports.
- **Not every message is billable.** Scheduling, refill requests, results questions and follow-ups within a visit's window are triaged by staff and never become episodes; the triage decision is recorded.
- **Tell the patient before they're billed.** The portal states, when a message is sent, that a clinical question may be billed, with the patient's choice to request a visit instead, and the notice shown is recorded with the message ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data) is the same pattern for subscriptions).
- **Response expectations are policy, not promises.** The portal shows the practice's stated response time and routes urgent symptoms to a call or emergency message rather than an inbox ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model) applies to AI triage of the same inbox).

## CMS's Health Tech Ecosystem

In July 2025 CMS launched a voluntary health technology ecosystem: on July 30, 2025 it announced that more than 60 companies had pledged to deliver results by the first quarter of 2026, that "21 networks pledged to meet the CMS Interoperability Framework criteria and become CMS Aligned Networks," and that seven EHRs committed to help "kill the clipboard." On April 9, 2026 CMS launched the first wave of tools, saying more than 700 organizations had pledged, with a Medicare App Library and a phone-based "Kill the Clipboard" check-in. Its Interoperability Framework (last modified August 6, 2026) asks networks to "provide or facilitate access to data using FHIR APIs" and to use identity credentials at "IAL2 or equivalent," with criteria 13 to 16 "In effect as of July 4th, 2026." Participation is voluntary, and CMS's pages don't publish a count of live aligned networks.

For a portal or app builder the framework points the same direction as the rules: FHIR APIs, strong identity at enrollment, and patient-directed sharing at check-in. An intake flow that can pull a patient's medications and insurance from their phone instead of a clipboard is the use case the pledges name (Digital Intake, Forms & Consent owns intake).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Proxy grants and personal representatives are `proxy_grants` and `personal_representatives`, owned by Consent, Authorization & Proxies; app authorizations are `oauth_grants`, owned by SMART on FHIR & App Platforms; identity verification is `identity_verifications`, owned by Patient Matching & Identity. The portal reads them all.

```sql
CREATE TABLE portal_accounts (           -- a person's login, which may reach several patients
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  person_patient_id   UUID REFERENCES patients (id),  -- set when the account holder is a patient
  login_ref           TEXT NOT NULL,       -- the identity provider's subject
  identity_verification_id UUID,           -- identity_verifications; IAL2 or equivalent
  status              TEXT NOT NULL CHECK (status IN ('invited', 'active', 'locked',
                        'deactivated')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, login_ref)
);

CREATE TABLE portal_access (             -- which patients an account may reach, and why
  account_id          UUID NOT NULL REFERENCES portal_accounts (id),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  basis               TEXT NOT NULL CHECK (basis IN ('self', 'proxy')),
  proxy_grant_id      UUID,                -- proxy_grants (Consent, Authorization & Proxies)
  scopes              TEXT[] NOT NULL,     -- 'results', 'notes', 'messages', 'billing', 'scheduling'
  valid_during        DATERANGE NOT NULL,  -- ends at an age transition or a revocation
  PRIMARY KEY (account_id, patient_id, valid_during),
  CHECK (basis = 'self' OR proxy_grant_id IS NOT NULL)
);

CREATE TABLE portal_messages (           -- a portal message, on top of its communications row
  communication_id    UUID PRIMARY KEY REFERENCES communications (id),
  thread_id           UUID NOT NULL,
  sent_by_account_id  UUID REFERENCES portal_accounts (id),  -- null: staff or clinician
  on_behalf_of        UUID REFERENCES patients (id),        -- the patient the message is about
  routed_to           TEXT NOT NULL,       -- the pool: front desk, nurse, provider, billing
  triage              TEXT CHECK (triage IN ('administrative', 'refill', 'results_question',
                        'clinical', 'urgent_redirected')),
  billing_notice_shown BOOLEAN NOT NULL DEFAULT false,
  e_visit_id          UUID,                -- e_visits, below, if the thread became one
  responded_at        TIMESTAMPTZ
);

CREATE TABLE e_visits (                  -- a portal thread billed as online E/M
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  practitioner_role_id UUID NOT NULL REFERENCES practitioner_roles (id),
  thread_id           UUID NOT NULL,
  opened_on           DATE NOT NULL,
  time_window         DATERANGE NOT NULL,  -- the 7 days the time counts within
  cumulative_minutes  INT NOT NULL DEFAULT 0,
  code                TEXT CHECK (code IN ('99421', '99422', '99423')),  -- set at close
  charge_id           UUID REFERENCES charges (id),
  status              TEXT NOT NULL CHECK (status IN ('open', 'closed_billed',
                        'closed_not_billed', 'converted_to_visit')),
  UNIQUE (thread_id)
);

ALTER TABLE portal_messages
  ADD FOREIGN KEY (e_visit_id) REFERENCES e_visits (id);
```

Every portal read of a patient's record writes an `audit_events` row naming the account, the patient and the basis (self or proxy), because a proxy reading an adolescent's note is exactly the access a patient will ask about ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

Design decisions:

- **An account is not a patient.** One login reaches many patients through dated, scoped access rows; authorization checks the row for this patient and this function on every request.
- **Proxy access derives from the consent model,** never stored as a copy of it; when a grant ends (an age transition, a revocation, a guardianship order), access ends on the same date.
- **The portal reads the record of truth** and writes requests back; it keeps messages and its own account data, not copies of results.
- **Messages carry routing and triage,** so response times and workload are measurable by pool and the billable minority is visible.
- **E-visits are episodes with a window,** time counted per thread, the code set at close from the time, and the billing notice recorded on the message that started it.
- **Events:** `portal.account_activated`, `portal.access_granted`, `portal.access_ended`, `portal.message_received`, `portal.message_responded`, `e_visit.closed`, through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Who saw what.** Every portal and API read, by account or app, with the patient and the basis, so a patient's access report lists proxies and apps as well as staff.
- **Grants over time.** Every proxy access row and app grant with its dates, scopes and the event that ended it.
- **Release timing.** For each result and note, when it was available in the portal and through the API, matched to the release decisions in [Labs, Imaging & Diagnostics](/books/health-tech/labs-and-diagnostics#auditing).
- **Message handling.** Received, routed, triaged, responded, with times; e-visits with their windows, minutes, codes, notices and charges.
- **Records requests.** Each download or send-to request with its fulfillment time against HIPAA's 30-day limit and what was sent ([Audit Trails](/docs/architecture/audit-trails#producing-records)).

## What This Means for the System You Build

- **Treat the portal as one client of the record,** with the certified API and payer APIs as others that must show the same data on the same schedule.
- **Separate accounts from patients** and authorize every request against dated, scoped access rows derived from the consent model.
- **Make proxy access first-class:** separate logins, scoped functions, age transitions computed from state rules, and a patient-visible list of who has access.
- **Release results and notes immediately by default** and let patients set their own delay preferences in the portal.
- **Record every app connection** with scopes and dates, and let patients revoke from the portal.
- **Triage portal messages, and bill only the clinical minority** as e-visits with a 7-day window, counted time and a notice shown before the patient is billed.
- **Plan for the payer side:** prior authorization data in the Patient Access API from January 1, 2027, and annual usage reporting from 2026.
- **Build toward phone-based, FHIR-based check-in** with IAL2-level identity, the direction CMS's ecosystem framework points.

## References

**Rules**

- [45 CFR 170.315 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=170&section=170.315), the (g)(10) standardized API for single patients and groups, refresh tokens of at least three months
- [42 CFR 422.119 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=422&section=422.119), the Medicare Advantage Patient Access API from January 1, 2021, data from January 1, 2016, prior authorization information from January 1, 2027, usage reporting from 2026, 170.215 standards
- [42 CFR 422.568 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-42?part=422&section=422.568), 7-day standard prior authorization decisions from January 1, 2026
- [45 CFR 164.524 (eCFR)](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-45?part=164&section=164.524), the 30-day right of access
- [Federal Register: HTI-5 final rule (October 28, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-10-28/html/2026-21943.htm), 14 criteria removed and 7 revised, effective December 28, 2026
- [Federal Register: CMS-0062-P (April 14, 2026)](https://www.federalregister.gov/api/v1/documents/2026-07205.json), proposed drug prior authorization, API reporting and FHIR for HIPAA transactions

**Agencies and data**

- [CMS: Interoperability and Patient Access final rule (CMS-9115-F)](https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-patient-access-final-rule-cms-9115-f), published May 1, 2020
- [CMS: Interoperability and Prior Authorization final rule (CMS-0057-F)](https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), released January 17, 2024, provisions in 2026 and 2027
- [ASTP Data Brief 77: Individuals' access to online medical records, 2024](https://healthit.gov/wp-content/uploads/2025/07/2024-HINTS-Patient-Access-DB77_508.pdf), offered and accessed shares, proxy access from 24% to 51%, app-based access, multiple portals and aggregator use
- [CMS: Medicare telemedicine provider fact sheet (March 17, 2020)](https://www.cms.gov/newsroom/fact-sheets/medicare-telemedicine-health-care-provider-fact-sheet), e-visits 99421 to 99423 and patient initiation, virtual check-ins G2012 with the 7-day and 24-hour limits and verbal consent, remote evaluation G2010, coinsurance and deductible
- [CMS: Health tech ecosystem launch (July 30, 2025)](https://www.cms.gov/newsroom/press-releases/white-house-tech-leaders-commit-create-patient-centric-healthcare-ecosystem), company, network and EHR pledges
- [CMS: First wave of health tech ecosystem tools (April 9, 2026)](https://www.cms.gov/newsroom/press-releases/cms-launches-first-wave-healthtech-ecosystem-tools-fast-tracking-fully-digital-patient-centered), 700+ organizations, the Medicare App Library, Kill the Clipboard check-in
- [CMS: Interoperability Framework](https://www.cms.gov/initiatives/health-technology-ecosystem/overview/interoperability-framework), aligned networks, FHIR APIs, IAL2 identity, criteria in effect July 4, 2026
- [ASTP/ONC FAQ: A patient's request to delay results](https://healthit.gov/faq/can-actor-grant-patients-request-delay-release-patients-test-results-eg-laboratory-or-image/), delays no longer than necessary

**Platforms**

- [Apple Developer: Accessing health records](https://developer.apple.com/documentation/healthkit/accessing-health-records), read-only clinical records and the separate permission sheet
- [Android Developers: Health Connect medical records data format](https://developer.android.com/health-and-fitness/health-connect/medical-records/data-format), FHIR versions and resources
- [Labcorp OnDemand](https://www.labcorp.com/patients/labcorp-ondemand), results in the Labcorp Patient account
- [OpenNotes Lab](https://opennoteslabs.org/), the academic lab and the Cures Act open notes requirement
