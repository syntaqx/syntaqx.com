+++
title = "Telehealth"
description = "Video, audio-only and asynchronous visits, remote monitoring codes, Medicare telehealth status as of October 2026, licensure compacts and DTC enforcement."
category = "Health Tech Industry"
order = 1943
part = "Care Delivery"
tags = ["health-tech", "telehealth", "remote-patient-monitoring", "medicare", "licensure", "ftc"]
+++

Telehealth is care delivered when the clinician and the patient are not in the same room. To a patient it is a video call, a phone call, a questionnaire answered at midnight and reviewed in the morning, or a blood pressure cuff that uploads readings without anyone touching a keyboard. To the software it is an encounter like any other, with three facts the in-person visit never had to record: where the patient was, where the clinician was, and how they were connected. Those three facts decide whether the visit can be billed, which state's license the clinician needed, which prescribing rules apply, and which modifier the claim carries. Getting them wrong is not a display bug; it is a denied claim or a clinician practicing without a license.

The industry runs on four modalities: **synchronous video**, **audio-only** (a phone call that counts as a visit under some payers' rules), **asynchronous** or store-and-forward care (a form, photos or a message reviewed later), and **remote monitoring** (devices that send physiologic or therapeutic data over weeks, billed as monthly services rather than visits). Portal messages billed as online evaluation and management sit beside them and belong to [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access#portal-messaging-and-e-visits). This chapter covers the modalities, the Medicare rules and their status as of October 2026, remote monitoring codes, licensure and the compacts, direct-to-consumer telehealth and the enforcement that followed its advertising, and the records you add to [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model): `encounters`, `observations` and `communications` carry most of it. Prescribing controlled substances over telehealth is [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing#dea-telemedicine-prescribing-status).

## How the Platforms Do It

As of October 2026, from each company's own pages and filings:

| Company | What it is | What its public pages or filings describe |
| --- | --- | --- |
| **Doxy.me** | Browser-based video room for clinicians | A free plan "for providers who are just getting started"; a Premium plan per user per month billed annually with "HIPAA compliant" and "BAA included," a "Virtual waiting room and patient queue," and group calls of up to 25 participants |
| **Zoom (healthcare)** | General video platform with a health edition | Executes a Business Associate Agreement; says it "integrates with major EHR platforms," lists "over 200 healthcare integrations" and an AI Clinical Note that syncs documentation to the EHR |
| **Amwell** | Telehealth platform sold to payers and health systems | "a single technology-based care platform" for payers and health systems; Amwell Medical Group with about 2.2K active providers; about 50 health plan clients and about 90M members with Amwell as a covered benefit; digital behavioral health (SilverCloud); Defense Health Agency work |
| **Teladoc Health** | Employer and payer telehealth plus a cash-pay therapy brand | 17.1 million telehealth visits in 2025; about 102 million US members with access to one or more services at December 31, 2025; 83% of consolidated revenue from access fees, the rest mainly visit fees and hospital hardware and services; BetterHelp users paying out of pocket weekly or monthly, with insurance coverage rolling out |
| **Hims & Hers** | Direct-to-consumer subscription telehealth | Care by Affiliated Medical Groups owned by licensed physicians, with the company as "the exclusive administrative services provider"; two licensed 503A pharmacies plus a 503B outsourcing facility; offerings sold on subscription; notes that "some states specifically require synchronous (or 'live') communications" |

Three patterns run through the table. **The video is the cheap part.** A HIPAA-eligible video room with a waiting room is a commodity sold free or per seat; Zoom's pitch is the EHR integration and the AI note, not the call. **Telehealth companies sell access, not visits.** Teladoc's revenue is mostly per-member-per-month access fees paid by employers and plans whether or not anyone calls; Amwell sells its platform to the plans and health systems that offer the benefit. **Direct-to-consumer telehealth is a pharmacy business with a clinic in front.** Hims & Hers fills most prescriptions from its own pharmacies and sells treatment as a subscription, and its corporate structure (a company that may not employ physicians, contracting with physician-owned medical groups) is the corporate practice of medicine doctrine described in [Corporate practice doctrines](/books/health-tech/practice-business#corporate-practice-doctrines).

## Modalities and What Each Records

| Modality | What happens | What the record needs |
| --- | --- | --- |
| **Video visit** | Real-time audio and video between patient and clinician | Platform, session start and end, both locations, participants (interpreter, caregiver), connection failures and any fallback to audio |
| **Audio-only** | A phone call that the payer accepts as a visit | That video was offered or not possible where a payer's rule requires it, the patient's consent or choice, call duration |
| **Asynchronous** | A questionnaire, photos or a message reviewed later | What the patient submitted and when, who reviewed it and when, the decision, and whether a live visit was required by state law |
| **Remote monitoring** | A device sends readings over a 30-day period | Device, enrollment and consent, each reading with its timestamp, days with data per period, management minutes and who spent them |
| **E-visit** | A patient-initiated portal exchange billed as online E/M | Covered in [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access#portal-messaging-and-e-visits) |

The asynchronous row is where state law bites hardest. Hims & Hers' 10-K notes that some states require live communication before treatment, and that the UK and Canada restrict online questionnaires for weight management and certain high-risk medicines. A platform that sells questionnaire-based care has to know, per state and per service, whether a questionnaire alone is enough or a synchronous visit must come first, and the answer is a rule keyed by the patient's location at the time of care ([Rules as Data](/docs/architecture/rules-as-data#what-belongs-in-data)).

**The patient's location is captured, not assumed.** The address on file is where the patient lives; the visit happens wherever they are when they join. My rule: ask at check-in ("Where are you right now?"), store the state as a fact of the encounter, and run the license and prescribing checks against it. A patient on vacation in another state is the most common way a clinician ends up treating someone where they hold no license.

## Medicare Telehealth: Status as of October 2026

Medicare telehealth is defined by section 1834(m) of the Social Security Act, which historically limited it to patients in a medical facility (the originating site) in a rural area, with a short list of practitioner types. The pandemic waivers lifted those limits, and Congress has extended them in short increments since. The sequence matters to software because claims are adjudicated against the rule in force on the date of service, and a billing system replaying a month of claims has to know which rule applied on which day:

| Law | Enacted | Effect on the telehealth waivers |
| --- | --- | --- |
| Full-Year Continuing Appropriations and Extensions Act, 2025 (P.L. 119-4) | March 15, 2025 | Extended from March 31, 2025 to September 30, 2025 |
| None | October 1, 2025 | The waivers lapsed during the government shutdown |
| P.L. 119-37 | November 12, 2025 | Restored and extended to January 30, 2026; CMS paid claims "as if there hadn't been a temporary lapse" |
| Consolidated Appropriations Act, 2026 (P.L. 119-75), section 6209 | February 3, 2026 | Extended to December 31, 2027 |

As of October 2026, the current state, from the law and CMS's telehealth FAQ (updated October 8, 2026):

- **Anywhere in the country through December 31, 2027.** "Through December 31, 2027, beneficiaries can receive Medicare telehealth services anywhere in the United States and territories." From January 1, 2028, except for behavioral health, beneficiaries will generally need to be in a medical facility in a rural area again, unless Congress acts.
- **The expanded practitioner list, FQHC and RHC distant-site billing, and audio-only** all run to the same date under section 6209.
- **The in-person requirement for tele-mental health is delayed to January 1, 2028.** After that, patients who began home tele-mental health on or before December 31, 2027 are treated as established and need at least one in-person visit every 12 months.
- **RHCs and FQHCs changed codes on October 1, 2026.** They billed telehealth with a single code, G2025, through September 30, 2026; from October 1, 2026 they bill the individual CPT or HCPCS codes with the telehealth modifier. A billing system serving clinics has a code mapping that changed mid-year.
- **New modifiers from January 1, 2027.** Section 6209(g) requires codes or modifiers for telehealth furnished through a telehealth virtual platform under a contract or payment arrangement, and for telehealth furnished incident to a practitioner's service; CMS's FAQ names them BB and BC, "required beginning January 1, 2027," with no payment implications.
- **Acute hospital care at home runs to September 30, 2030** under section 6210 ([Hospitals & Health Systems](/books/health-tech/hospitals-and-health-systems#inpatient-ambulatory-and-hospital-at-home)).

The days between January 30 and February 3, 2026, when the statutory date had passed and the extension was not yet law, are the kind of gap a claims engine has to represent; CMS's FAQ addresses the October 2025 lapse explicitly, and I found no CMS statement on how claims for those four days were handled. <!-- source-gap: medicare-telehealth-feb-2026-gap | missing | how Medicare processed telehealth claims for dates of service January 31 to February 2, 2026, between the P.L. 119-37 sunset and enactment of P.L. 119-75 | closes with: a CMS MLN Connects notice or FAQ entry on claims for those dates | checked: 2026-10-29 -->

**The CY2026 Physician Fee Schedule** (CMS-1832-F, effective January 1, 2026) made several flexibilities permanent regardless of Congress: it removed "the distinction between provisional and permanent services" on the telehealth list, limiting review to whether a service can be furnished by two-way audio-video; it made virtual direct supervision permanent through "real-time audio and visual interactive telecommunications (excluding audio-only)," except for services with a 010 or 090 global surgery indicator; and it permanently removed the frequency limits on subsequent inpatient visits, subsequent nursing facility visits and critical care consultations furnished by telehealth. The CY2027 rule had been proposed (July 14, 2026) but not finalized as of this writing. <!-- source-gap: cy2027-pfs-final | status | the CY2027 Physician Fee Schedule final rule's telehealth and remote monitoring provisions | closes with: the CMS CY2027 PFS final rule fact sheet, expected around November 1, 2026 | checked: 2026-10-29 -->

What this means for a system: **telehealth eligibility is a dated rule set, not a flag.** Originating site, geography, practitioner type, audio-only, the mental health in-person rule, the RHC and FQHC coding and the new modifiers each have effective dates in statute, and each may move again at the end of 2027. Store them as rule rows with effective ranges and citations, evaluate claims against the date of service, and record which rule version decided ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). Commercial payers and Medicaid programs set their own telehealth policies on top, so the same row shape keys by payer and state.

## Remote Patient and Therapeutic Monitoring

Remote monitoring is not a Medicare telehealth service: CMS's booklet on telehealth and remote monitoring says the non-face-to-face services fall outside section 1834(m), so the telehealth waivers' sunset doesn't touch them. They are monthly services built from device data and management time. **Remote physiologic monitoring (RPM)** covers measurements like blood pressure, weight, glucose and oxygen saturation; **remote therapeutic monitoring (RTM)** covers therapy adherence and response, such as musculoskeletal or respiratory therapy. The code family, as of October 2026:

CMS describes three components, each building on the one before: patient education and device setup, device supply (connecting the device and how often the patient uses it), and treatment management (reviewing the data to improve outcomes). The codes map onto them:

| Component | RPM codes | What decides which code |
| --- | --- | --- |
| Education and setup | 99453 | Once, at the start |
| Device supply | 99454; 99445 (new for 2026) | Days with data in the 30-day period: 16 or more, or fewer than 16 (2 to 15) for the new code |
| Treatment management | 99457 and its add-on 99458; 99470 (new for 2026) | Management time in the month; the new code covers less than the 20 minutes the existing first code requires |
| RTM | 98975 onward; 98984 and 98985 (device, new for 2026); 98979 (management, new for 2026) | The same split for therapeutic data |

The descriptors are the AMA's licensed text and aren't reproduced here. CMS's booklet (December 2025) sets the rules a system has to enforce:

- RPM requires an established patient; RTM does not. RPM requires patient consent at the time the services are provided, and auxiliary personnel may furnish the services under the billing practitioner's general supervision.
- Data must be collected for "2-15 or 16+ days out of 30 days, depending on the code descriptor," which doesn't apply to the management codes.
- "Only 1 practitioner can bill for remote monitoring per patient in a 30-day period."
- RPM and RTM can't be billed together for the same patient.
- The device "must meet the definition of a medical device defined by FDA," which is where [Digital Health Apps & Devices](/books/health-tech/digital-health-and-devices#wellness-or-medical-device) begins.

The CY2027 proposed rule would tighten the program: RTM only for established patients, a separately reportable initiating visit, payment only when the services are performed by clinical staff employed by the practice rather than contractors, revalued codes because devices may cost less than first estimated, and possibly four new bundled HCPCS codes. A vendor that sells RPM as an outsourced nursing service to practices is the business the contractor proposal targets, and its status belongs on the same source-gap as the final rule above.

The engineering consequences are concrete. **Days with data are counted per 30-day period, per patient,** from readings that arrive with device timestamps, often late and in batches; the count is computed from the readings, never incremented. **Minutes are logged per staff member per management period** with any interactive communication the code requires, because an auditor will ask for both. **The device period and the management period are separate clocks in the code descriptors**, so both are stored as periods rather than derived from each other. **Exclusivity is enforced at enrollment:** a second practice enrolling the same patient is a conflict the system can't see across organizations, so the enrollment records the patient's attestation that no one else is billing.

## Licensure and the Compacts

A clinician needs authority to practice in the state where the patient is, and each profession has its own board in every state. Interstate compacts reduce the friction without creating a national license:

| Compact | Profession | How it works | Status |
| --- | --- | --- | --- |
| **Interstate Medical Licensure Compact (IMLC)** | Physicians | An expedited pathway to separate full licenses in member states, issued by each state's board | "44 member states and 2 U.S. territories," information as of September 30, 2026; Alaska, New Mexico and Rhode Island implementing |
| **Nurse Licensure Compact (NLC)** | RNs and LPN/VNs | One multistate license from the home state, with the privilege to practice in other member states | "43 jurisdictions are currently part of the NLC"; Guam, Massachusetts and the US Virgin Islands enacted and awaiting implementation |
| **PSYPACT** | Psychologists | An Authority to Practice Interjurisdictional Telepsychology (APIT) and a Temporary Authorization to Practice (TAP) in member states | Iowa and Alaska passed legislation in 2026; the commission's member count was not readable for this chapter |

<!-- source-gap: psypact-member-count | missing | the number of PSYPACT participating jurisdictions as of October 2026 | closes with: the PSYPACT map page or 2025 annual report, readable without a script-heavy viewer | checked: 2026-10-29 -->

The data model consequence: a practitioner holds **licenses per jurisdiction** (`practitioner_licenses`, owned by [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment)), each a full license, a compact multistate privilege or a compact-issued authority, each with a number, a type, an expiry and a source of verification. Scheduling and visit start both check that the clinician holds a valid authorization for the patient's location at that moment, and the check result is stored on the encounter. Primary-source verification is that chapter's job; telehealth adds the per-visit check.

Medicare's rule on where the practitioner is also changed: through CY2025 CMS let practitioners furnishing telehealth from home report their enrolled practice location instead of their home address, so the practitioner's location at the visit is a second fact to record.

## Direct-to-Consumer Telehealth

A direct-to-consumer (DTC) telehealth company sells treatment to consumers who pay cash, usually by subscription: hair loss, erectile dysfunction, birth control, dermatology, therapy, and weight loss with GLP-1 drugs. The business has four parts, and each has its own rules:

- **The medical group.** In states with a corporate practice of medicine doctrine, the company can't employ physicians, so it contracts as an administrative services provider with physician-owned medical groups. Hims & Hers describes these arrangements as having initial ten-year terms with renewal options; in the UK and Ireland, with no equivalent prohibition, it employs physicians directly.
- **The care protocol.** A questionnaire or a short visit, a clinician's decision, and a prescription, with the state's synchronous-visit requirements decided per service.
- **The pharmacy.** The company's own or a partner's mail-order pharmacy fills the prescription, and compounded products bring FDA's compounding rules into the advertising ([Compounding and the GLP-1 Era](/books/health-tech/e-prescribing#compounding-and-the-glp-1-era)). Hims & Hers says it received two of the warning letters FDA sent to about 50 companies in September 2025, and that it was directly named in a February 2026 FDA statement on restricting GLP-1 active ingredients for non-approved compounded drugs.
- **The subscription.** Recurring billing, renewal notices and cancellation follow ordinary consumer law ([Subscription Commerce](/books/commerce/subscription-commerce#renewal-billing-and-stored-credentials), [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law)); the health twist is that a renewal is also a refill, so a cancelled subscription has to stop the pharmacy too.

### Advertising and Privacy Enforcement

DTC telehealth grew on performance marketing, and the FTC's health privacy cases are mostly about the pixels:

| Case | Year | What the FTC said | Outcome |
| --- | --- | --- | --- |
| **GoodRx** | 2023 | Shared health information with advertising platforms; the FTC's first action under the Health Breach Notification Rule | $1.5 million civil penalty and a ban on sharing health data for advertising |
| **BetterHelp** | 2023 | Revealed consumers' data, including mental health information, to Facebook and others for advertising | $7.8 million for partial refunds, the first FTC action returning money to consumers whose health data was compromised |
| **Monument** | 2024 | An alcohol addiction treatment service disclosed health data for advertising | Banned from disclosing health data for advertising; a $2.5 million civil penalty suspended for inability to pay |
| **Cerebral** | 2024 | Gave sensitive information of nearly 3.2 million consumers to LinkedIn, Snapchat, TikTok and others through tracking tools, and hid its cancellation terms in violation of ROSCA; DOJ filed for the FTC in the Southern District of Florida | A proposed order permanently banning use or disclosure of personal and health information to third parties for most marketing or advertising, nearly $5.1 million for refunds, and a $10 million civil penalty suspended after $2 million; the former CEO did not settle, and the FTC's case page lists the case as pending |

The lesson for an engineer: **a tracking pixel on a telehealth intake page is a disclosure.** Whether the company is a HIPAA covered entity (a medical group that bills insurance is) or not (a cash-pay app often isn't), the FTC treats sharing health data with advertisers without express consent as unfair or a breach, and the Health Breach Notification Rule's 2024 amendments made clear it covers health apps outside HIPAA ([The FTC Health Breach Notification Rule](/books/health-tech/digital-health-and-devices#the-ftc-health-breach-notification-rule)). My default: no third-party marketing tags on any page that reveals a condition, a treatment or an intake answer; server-side conversion events that carry no health data, under a written review; and the HIPAA side follows the playbook ([What It Means for a System](/docs/compliance/hipaa#what-it-means-for-a-system)). The industry depth on HIPAA and marketing belongs to [HIPAA in Practice](/books/health-tech/hipaa-in-practice#marketing).

## How to Build It

Telehealth extends `encounters` and `observations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), whose `encounters.class` already distinguishes `virtual` and `home` visits, and adds the connection, the monitoring enrollment and the readings that count toward it. Licenses and compact privileges per state are `practitioner_licenses`, owned by [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment); telehealth only checks them.

```sql
ALTER TABLE encounters
  ADD COLUMN modality            TEXT CHECK (modality IN ('video', 'audio_only',
                                   'asynchronous')),  -- null: in person
  ADD COLUMN patient_subdivision TEXT,          -- ISO 3166-2 where the patient was, asked at check-in
  ADD COLUMN patient_site        TEXT CHECK (patient_site IN ('home', 'facility', 'other')),
  ADD COLUMN practitioner_subdivision TEXT,     -- where the clinician was
  ADD COLUMN practitioner_license_id UUID,      -- the practitioner_licenses row checked at start
  ADD COLUMN telehealth_rule_evaluation_id UUID; -- the payer and date rule that decided billability

CREATE TABLE virtual_visits (            -- each connection, separate from the clinical encounter
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  encounter_id     UUID NOT NULL REFERENCES encounters (id),
  platform         TEXT NOT NULL,         -- the video vendor, under a BAA
  external_room    TEXT,                  -- the vendor's room or meeting ID
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  fell_back_to     TEXT CHECK (fell_back_to IN ('audio_only', 'rescheduled', 'in_person')),
  participants     JSONB NOT NULL DEFAULT '[]', -- [{"role": "interpreter"}, {"role": "caregiver"}]
  consent_id       UUID REFERENCES consents (id),  -- telehealth consent, where required
  recording_ref    TEXT                     -- null unless recording was consented
);

CREATE TABLE rpm_enrollments (           -- a patient on RPM or RTM with one billing practice
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  program          TEXT NOT NULL CHECK (program IN ('rpm', 'rtm')),
  ordering_role_id UUID NOT NULL REFERENCES practitioner_roles (id),
  device_id        UUID NOT NULL,         -- devices (Digital Health Apps & Devices)
  consent_id       UUID NOT NULL REFERENCES consents (id),
  sole_biller_attested BOOLEAN NOT NULL,  -- the patient says no one else bills monitoring
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING GIST (patient_id WITH =, valid_during WITH &&)  -- one program at a time here
);

CREATE TABLE rpm_periods (               -- the two clocks: device periods and management periods
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id     UUID NOT NULL REFERENCES rpm_enrollments (id),
  kind              TEXT NOT NULL CHECK (kind IN ('device', 'management')),
  period            DATERANGE NOT NULL,
  days_with_data    INT,                  -- computed from rpm_readings at close
  management_minutes INT,                 -- summed from rpm_time_entries at close
  interactive_contact BOOLEAN,            -- the qualifying communication happened
  billed_code       TEXT,                 -- '99454', '99445', '99457', '99470', ...
  charge_id         UUID REFERENCES charges (id),
  closed_at         TIMESTAMPTZ,
  UNIQUE (enrollment_id, kind, period)
);

CREATE TABLE rpm_readings (              -- which device readings an enrollment counted
  enrollment_id     UUID NOT NULL REFERENCES rpm_enrollments (id),
  device_reading_id UUID NOT NULL,        -- device_readings (Digital Health Apps & Devices)
  observation_id    UUID REFERENCES observations (id),  -- the chart entry, once filed
  measured_on       DATE NOT NULL,        -- in the patient's zone; drives days with data
  PRIMARY KEY (enrollment_id, device_reading_id)
);

CREATE TABLE rpm_time_entries (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  period_id        UUID NOT NULL REFERENCES rpm_periods (id),
  staff_role_id    UUID NOT NULL REFERENCES practitioner_roles (id),
  employed_by_practice BOOLEAN NOT NULL,  -- the CY2027 proposal turns on this
  minutes          INT NOT NULL CHECK (minutes > 0),
  activity         TEXT NOT NULL,
  communication_id UUID REFERENCES communications (id),  -- the interactive contact, if this was it
  occurred_at      TIMESTAMPTZ NOT NULL
);
```

Days with data for a device period is a query, not a counter:

```sql
SELECT COUNT(DISTINCT r.measured_on) AS days_with_data
FROM rpm_readings r
WHERE r.enrollment_id = $1
  AND r.measured_on <@ $2::daterange;   -- the period being closed
```

Design decisions:

- **The visit is not the connection.** A dropped call reconnected twice is three `virtual_visits` rows and one encounter; a visit that fell back to audio-only is billed differently from one that didn't, and the fallback is a fact of the connection.
- **Locations are encounter facts.** The patient's state and site and the clinician's state are captured at the visit and drive the license check, the billing rule and the prescribing rules; the address on the patient record never substitutes.
- **The license check is stored.** The encounter records which `practitioner_licenses` row (a full license, an IMLC-issued license, an NLC multistate privilege or a PSYPACT authority) allowed it, so "was she licensed in Ohio on March 3" is a lookup.
- **Monitoring is periods, not visits.** Raw readings land as `device_readings` with device time; the enrollment links the ones it counts, files clinically relevant ones as `observations`, and closes periods by counting days and summing minutes. One enrollment per patient per program, and the period that billed points at its charge.
- **Payer telehealth policy is rules.** Medicare's statutory dates, the CY2026 permanent changes, each commercial payer's and Medicaid program's policy, and state synchronous-visit requirements are rule rows with effective ranges, and the encounter stores the evaluation that decided ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Events:** `encounter.started`, `virtual_visit.connected`, `virtual_visit.dropped`, `encounter.finished`, `rpm_period.closed`, sent through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing and to the clinician's worklist.

## Auditing

- **Where everyone was.** For every telehealth encounter, the patient's and the clinician's location, how each was captured, and the license checked, because licensure complaints and payer audits both start there.
- **How they connected.** Sessions with platform, start, end and fallback, matched to the modality billed; an audio-only claim with no record that video was offered or declined is the finding.
- **Which rule allowed the bill.** The telehealth rule evaluation stored on the encounter, including the statutory period in force on the date of service.
- **Monitoring periods.** Readings by device time, days with data, minutes by staff member with employment status, the qualifying interactive communication and the code billed, reproducible from rows ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).
- **Third-party tags.** An inventory of every script and server-side event on intake and treatment pages, with what each sends and the review that approved it.

## What This Means for the System You Build

- **Record three facts on every visit:** the patient's location, the clinician's location and the modality, captured at the visit, never inferred from the chart.
- **Check authority to practice at scheduling and at visit start** against per-jurisdiction, effective-dated licenses that include compact privileges.
- **Treat Medicare telehealth as a dated rule set** that expires at the end of 2027 unless extended, with the CY2026 permanent changes, the October 2026 clinic coding change and the January 2027 modifiers as rows, and every claim evaluated against its date of service.
- **Separate connections from encounters** so drops, reconnections and audio fallbacks are visible and billed correctly.
- **Build remote monitoring as two clocks:** 30-day device periods counted from device-timestamped observations, and management time logged per staff member per period with the qualifying contact.
- **Decide synchronous versus asynchronous per state and service** before an asynchronous protocol prescribes.
- **Keep advertising tags off anything that reveals health information,** whether or not HIPAA applies, because the FTC's cases are about exactly that.
- **Stop the pharmacy when the subscription stops** in DTC models, since a renewal is also a refill.

## References

**Statutes and rules**

- [Consolidated Appropriations Act, 2026 (P.L. 119-75, H.R. 7148 enrolled)](https://www.congress.gov/119/bills/hr7148/BILLS-119hr7148enr.pdf), section 6209 extending the telehealth waivers to December 31, 2027, the tele-mental health in-person delay to January 1, 2028, the virtual platform and incident-to modifiers; section 6210 extending hospital at home to September 30, 2030
- [P.L. 119-75 as enacted](https://www.congress.gov/119/plaws/publ75/PLAW-119publ75.pdf), enactment on February 3, 2026
- [P.L. 119-37](https://www.congress.gov/119/plaws/publ37/PLAW-119publ37.pdf), enacted November 12, 2025, section 6208 extending the waivers to January 30, 2026
- [P.L. 119-4](https://www.congress.gov/119/plaws/publ4/PLAW-119publ4.pdf), enacted March 15, 2025, section 2207 extending the waivers to September 30, 2025
- [Federal Register: CY2026 Physician Fee Schedule final rule (November 5, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-05/html/2025-19787.htm), remote monitoring codes 99445 and 99470, RTM 98984, 98985 and 98979, effective January 1, 2026

**Agencies**

- [CMS: Telehealth FAQ (updated October 8, 2026)](https://www.cms.gov/files/document/telehealth-faq-updated-02-04-2026.pdf), the retroactive cure of the October 2025 lapse, anywhere-in-the-US through December 31, 2027, the mental health in-person rule, G2025 through September 30, 2026, modifiers BB and BC from January 1, 2027, virtual supervision
- [CMS: CY2026 Physician Fee Schedule final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2026-medicare-physician-fee-schedule-final-rule-cms-1832-f), the streamlined telehealth list, permanent virtual direct supervision, frequency limits removed, digital mental health treatment for ADHD devices
- [CMS: CY2025 Physician Fee Schedule final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2025-medicare-physician-fee-schedule-final-rule), enrolled practice location instead of home address through CY2025
- [CMS: CY2027 Physician Fee Schedule proposed rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2027-medicare-physician-fee-schedule-proposed-rule), proposed RTM established-patient rule, initiating visit, employed clinical staff, revaluation and bundled G-codes (July 14, 2026)
- [CMS MLN901705: Telehealth and remote patient monitoring (December 2025)](https://www.cms.gov/files/document/mln901705-telehealth-remote-monitoring.pdf), established patients, 2-15 or 16+ days, one practitioner per 30 days, no RPM with RTM, FDA device definition, remote monitoring outside 1834(m)
- [FTC: GoodRx enforcement action (February 1, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), the first Health Breach Notification Rule action and the $1.5 million penalty
- [FTC: BetterHelp order (March 2, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook), $7.8 million for refunds, the first return of funds for compromised health data
- [FTC: Monument (April 11, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/alcohol-addiction-treatment-firm-will-be-banned-disclosing-health-data-advertising-settle-ftc), the advertising ban and the suspended $2.5 million penalty
- [FTC: Proposed order against Cerebral (April 15, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data), the tracking-pixel and ROSCA allegations, the advertising ban, the $5.1 million refunds and the suspended $10 million penalty
- [FTC: Cerebral, Inc. and Kyle Robertson, U.S. v.](https://www.ftc.gov/legal-library/browse/cases-proceedings/222-3067-cerebral-inc-kyle-robertson-us-v), case 1:24-cv-21376 (S.D. Fla.), the amended complaint and the pending status

**Compacts**

- [Interstate Medical Licensure Compact](https://imlcc.com/), 44 member states and 2 territories as of September 30, 2026, states implementing
- [Nurse Licensure Compact](https://www.nursecompact.com/), 43 jurisdictions, states awaiting implementation
- [PSYPACT](https://psypact.gov/), APIT and TAP, Iowa and Alaska legislation in 2026

**Companies**

- [Doxy.me: Pricing](https://doxy.me/en/pricing/), the free plan, Premium with BAA, waiting room and 25-participant group calls
- [Zoom: Healthcare](https://www.zoom.com/en/industry/healthcare/), the BAA, EHR integrations, 200+ healthcare integrations, AI Clinical Note
- [Amwell: Business](https://business.amwell.com/), the platform for payers and health systems, Amwell Medical Group, payer clients and members
- [Teladoc Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477449/000147744926000012/tdoc-20251231.htm), 17.1 million visits, about 102 million US members, 83% access fees, BetterHelp payment
- [Hims & Hers Health: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1773751/000177375126000022/hims-20251231.htm), affiliated medical groups and the administrative services role, ten-year terms, own pharmacies, synchronous-visit state rules, FDA warning letters and the February 2026 statement
