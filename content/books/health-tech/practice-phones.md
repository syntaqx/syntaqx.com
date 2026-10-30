+++
title = "Phones for Practices"
description = "The practice phone system: VoIP for small offices, call pop from the PMS, routing and hours, missed-call text-back, 911 duties, recording consent, analytics."
category = "Health Tech Industry"
order = 1932
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "voip", "phones", "e911", "call-recording", "hipaa", "data-model"]
+++

A small practice runs on its phone. New patients call to book, existing ones call to reschedule, ask about a bill or a prescription, or report that their dog ate a sock; insurance companies, labs and referring offices call too, and the front desk that answers them is also checking in the patient standing at the counter ([How a Small Practice Runs](/books/health-tech/practice-business#how-a-small-practice-runs)). A missed call during lunch is often a new patient who calls the next practice on the list. That's why patient engagement vendors sell phones: Weave, Dental Intelligence, PetDesk, Podium and Mango Voice all sell phone systems with practice data beside the call. A phone system that knows who is calling, what they owe and when they're due is worth more to a practice than one that's merely cheaper.

This chapter covers the practice side of voice: what a practice phone system is, call pop with patient context, routing and hours, missed calls and text-back, 911 duties for a multi-line system, call recording consent and recordings as PHI, call analytics, and the hardware and number. It adds phone numbers, call records, routing and emergency locations, extending `communications` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The carrier and platform mechanics are in the Hosting & Cloud volume, and this chapter links them rather than repeating them: [Voice Platforms](/books/hosting-and-cloud/voice-platforms) for SIP trunking, STIR/SHAKEN and call labeling, [Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting) for keeping the practice's number, and [911, CPNI & Telecom Duties](/books/hosting-and-cloud/telecom-duties) for the provider's 911 obligations. Call centers serving many locations are this part's [Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers) chapter; AI receptionists are its [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai) chapter.

## How the Platforms Do It

As of October 2026, from each vendor's public pages:

| Vendor | Practice data on the screen | Missed calls | Recording and analytics |
| --- | --- | --- | --- |
| **Weave Phones** | Call Pop: caller name, upcoming appointments, when due for an appointment, overdue balances, tasks and notes | Missed Call Text sends an automatic, customizable text | "Secure call recordings & text records"; Phone Analytics on total, placed, missed and answered calls, number dialed, and whether the caller is a current customer; AI Receptionist and Call Intelligence listed |
| **Mango Voice** | "Patient caller ID appears the moment the phone rings," from Dentrix, Eaglesoft, Denticon, Curve and Open Dental | A missed-call dashboard for callbacks | Recording included; "reporting and call analytics built in"; Mango AI transcripts, summaries and sentiment |
| **PetDesk Phones** (veterinary) | Client and pet details, upcoming appointments, vaccine status and recent visits before answering, from 25+ practice management systems | Missed-call text back, replies in the PetDesk inbox | Recording, analytics, AI call summaries written back to the PIMS and editable |
| **Podium Phones** | Integrations including Nextech, Boulevard and Mindbody | Missed-call text-back with an "AI Employee" continuing the conversation | Calls recorded and transcribed automatically; AI summaries; live reporting |
| **Dental Intelligence Voice** | "Data-powered VoIP keeps your phones and workflows connected" | Not detailed publicly | Not detailed publicly |

The pattern: the phone system is sold as a front end to the PMS. The dial tone is a commodity bought from a carrier or CPaaS ([Owned Network Versus Aggregator](/books/hosting-and-cloud/cpaas-business#owned-network-versus-aggregator)); the product is the screen that appears when it rings and what happens to calls nobody answers.

## What a Practice Phone System Is

Technically, a practice phone system is a hosted PBX: a cloud service that owns the practice's numbers, rings desk phones, softphones and mobile apps over the internet, and connects to the public network through SIP trunks ([SIP Trunking](/books/hosting-and-cloud/voice-platforms#sip-trunking)). Practices differ from other small offices in four ways:

- **Few lines, many roles.** A dental office may have five phones and three people who answer, each also doing something else. Ring groups, hunt order and overflow matter more than seat count.
- **Several locations, one brand.** A group with three offices wants each office's number answered locally, overflow to the others, and one main number for marketing (brand and location numbers are covered in this part's [Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers#brand-numbers-and-location-numbers) chapter).
- **After-hours duty.** Medical, dental and veterinary practices route after-hours calls to an answering service, an on-call clinician or an emergency hospital, and the routing is a patient safety matter, not a convenience.
- **PHI on the line.** Calls, voicemails, transcripts and recordings contain health information, which makes the hosted phone vendor a business associate (below).

## Call Pop and Patient Context

Call pop is a lookup: the caller's number (ANI) against the phone numbers in the PMS, then a card with what the person answering needs. The lookup is harder than it sounds.

- **One number, many patients.** A mother's mobile is on her record and her three children's; a veterinary client's number is on every pet. The match is a household, and the card has to show the family and let staff pick, never guess. Showing the most recently seen patient as "the caller" is how a receptionist greets the wrong person by name.
- **Many numbers, one patient.** Mobile, home, work, a spouse's phone. The match runs against every number in `contacts`, normalized to E.164 at sync time, not at call time.
- **Stale copies.** Call pop reads the synced PMS copy; a patient registered at the front desk an hour ago may not be there yet. Show "unknown caller" honestly and let staff link the number after the call.
- **Blocked and spoofed caller ID.** Many calls arrive with no number or a number the caller doesn't own. A match on caller ID identifies a phone, not a person, so call pop is a convenience for staff, never authentication. Before discussing records, staff still verify identity the way the practice's policy says.

**Minimum necessary applies to the screen.** HIPAA's minimum necessary standard ([The Three Rules](/docs/compliance/hipaa#the-three-rules)) shapes what a card shows: name, family members, next appointment, recall due date and balance are what front desk staff use; diagnoses and clinical notes aren't. Weave's and PetDesk's cards (appointments, balances, due dates, vaccine status) follow that line. A card visible on a monitor facing the waiting room is a disclosure risk too, so the softphone window should be easy to hide and should time out.

## Routing, Hours and Voicemail

A practice's call flow is configuration that changes weekly: lunch closures, holidays, a doctor out, a snow day. Model it as rules with effective dates rather than as a diagram someone edits live ([Rules as Data](/docs/architecture/rules-as-data)):

- **Hours per location,** with holidays and one-off closures, in the location's time zone.
- **Ring groups and order:** front desk first, then the back office, then overflow to another location or an answering service.
- **Menus with few options.** Practices that ask callers to "press 1 for appointments, 2 for billing, 3 for prescriptions" do it because the people behind each option differ. Every extra level loses callers.
- **After hours,** a message with the emergency instruction (for a medical practice, to call 911 in an emergency; for a vet clinic, the nearest emergency hospital's number), then the answering service or on-call route.
- **Emergency overrides** that a manager can set from a phone ("closed today, calls to the Elm Street office").

**Voicemail is PHI.** A patient's voicemail about a symptom, a transcript of it, and the email or text that notifies staff of it are all PHI in the hosted system; notifications should say "new voicemail from (555) 123-4567" and link into the authenticated app, never paste the transcript into an email. Leaving voicemails for patients raises the opposite question (what a practice may say on a patient's answering machine), which is a minimum necessary judgment: name, practice, a callback number, and nothing about the reason for the visit unless the patient asked for messages to include it ([Patient Preference and Confidential Communications](/books/health-tech/patient-texting#patient-preference-and-confidential-communications)).

## Missed Calls and Text-Back

Missed-call text-back sends the caller a text when nobody answered: "Sorry we missed your call, this is Elm Street Dental. Reply here or book at...". Weave, PetDesk and Podium all sell it, Weave claiming it saves "up to two hours a day" per office. It works because many callers prefer texting once they're offered it, and because the text arrives before they've dialed the next practice.

It's also a text sent to a number the practice may not have consent to text. The caller dialed the practice; whether that's consent to an automated text back is a question I couldn't find the FCC answering directly. <!-- source-gap: missed-call-text-back-consent | missing | an FCC ruling or court decision on whether calling a business is prior express consent to an automated text reply to that number | closes with: an FCC declaratory ruling or appellate decision on missed-call text-back | checked: 2026-10-29 --> The health care exemption doesn't obviously cover it either, since a callback text isn't one of the listed purposes ([The TCPA Healthcare Exemption](/books/health-tech/patient-texting#the-tcpa-healthcare-exemption)). My rule: one text per missed call, purely informational, naming the practice and saying how to stop, never marketing, never sent to a number that has opted out, and never to a landline (look up the line type before sending). The reply opens a thread in the shared inbox like any other ([The Shared Inbox](/books/health-tech/patient-texting#the-shared-inbox)).

## 911 From the Practice

A practice's phone system is a multi-line telephone system (MLTS), and two federal rules bind it. The provider-side detail is in [Kari's Law and Hosted Phone Systems](/books/hosting-and-cloud/telecom-duties#kari-s-law-and-hosted-phone-systems) and [911 for VoIP](/books/hosting-and-cloud/telecom-duties#911-for-voip); the practice-side points:

- **Direct dialing.** Under 47 CFR 9.16(a), an MLTS must let a user dial 911 directly, with no prefix such as 9, even if one is needed for other calls. That applies to systems installed, sold or leased after February 16, 2020 (47 CFR 9.17(b)).
- **Notification.** Under 9.16(b)(2), the system's installer, manager or operator must configure it to notify a central location (the front desk, a manager's phone) when someone dials 911, if it can do so without new hardware or software, without delaying the call, and where a person is likely to see or hear it. In a practice the notification goes to the front desk and the office manager, who can meet paramedics at the door.
- **Dispatchable location.** Fixed phones must send an automated dispatchable location (street address plus suite, floor or room) since January 6, 2021, and non-fixed and off-premises devices automated location where technically feasible, or a manually updated or alternative location, since January 6, 2022 (9.16(b)(3)). A practice's softphones are the hard case: a therapist taking calls on a laptop at home, a veterinarian on call with the mobile app. Each needs a registered location, updated when it moves.
- **Responsibility.** An MLTS manager who fails to comply with 9.16(b) "is presumed responsible" (9.17(a)). For a hosted system, the vendor configures and the practice manages; the contract and the setup screens should say who maintains each device's location.

## Recording Calls

The general law, one-party and all-party consent and the announcement that satisfies both, is in the playbook's [Recording Calls](/docs/compliance/consumer-contact#recording-calls); its default (announce recording at the start of every call and capture the announcement) is the right one for practices. Health care adds three points.

**States verified for this chapter, beyond the playbook's examples.** Florida requires that "all of the parties to the communication have given prior consent" (Fla. Stat. 934.03(2)(d)), and a violation of the interception prohibition is a third-degree felony. Maryland (Cts. & Jud. Proc. 10-402(c)(3)) and New Hampshire (RSA 570-A:2) require all parties' consent; Massachusetts (G.L. c. 272, s. 99) prohibits secretly recording without all parties' authority and gives a civil remedy of the greater of $100 a day or $1,000. Montana (45-8-213) prohibits hidden recording without all parties' knowledge, with exceptions for parties warned of the recording and for "a health care facility" recording a health care emergency call made to it. A multi-location group crossing state lines should treat all-party consent as the rule.

**Recordings are PHI.** HIPAA's definition of protected health information covers information "transmitted or maintained in any other form or medium" (45 CFR 160.103), so a recording of a patient describing symptoms, a transcript, an AI summary and the voicemail are PHI held by the practice and by its phone vendor. A vendor that only transmits data without routine access might sit outside the business associate definition, but a vendor that stores recordings, voicemails and transcripts plainly needs routine access and is a business associate under a BAA ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)). Recordings then follow the practice's retention schedule, access controls and right-of-access obligations, and a patient's request for their records may reach their recorded calls if the practice uses them to make decisions about the patient (this volume's [HIPAA in Practice](/books/health-tech/hipaa-in-practice#the-right-of-access) chapter covers the designated record set).

**Record less.** My rule: record only what someone will review (coaching, disputes, quality), keep it for a defined period rather than forever, restrict playback to roles that need it, and log every playback. A recording nobody listens to is pure liability.

## Call Analytics

The numbers practices watch:

| Metric | Definition | Why it matters |
| --- | --- | --- |
| **Answer rate** | Answered calls over inbound calls, by hour and location | Lunch and the first hour after opening are where calls die |
| **Missed new-patient calls** | Unanswered calls from numbers not matched to any patient | The most expensive missed call; Weave reports whether the caller is a current customer |
| **Callback time** | Time from a missed call to a return call or text | Shorter wins the patient |
| **Booking rate** | Calls that end in an appointment over calls that could have | The front desk's conversion metric |
| **Hold and abandon** | Time on hold; callers who hang up waiting | Staffing |

Booking rate needs a call outcome recorded per call, by staff or by a model reading the transcript; the Field Operations volume's [Call Outcomes and Booking Rate](/books/field-operations/contact-center#call-outcomes-and-booking-rate) covers the measurement for call centers, and the same rules (define the denominator, sample and audit model-scored outcomes) apply here.

## Hardware and the Number

- **Phones.** Desk phones at the front desk, cordless handsets for clinical staff walking between rooms, softphones on workstations, a mobile app for on-call. Each device is a 911 location (above).
- **The number.** A practice's number is often decades old and printed on everything; switching vendors means porting it, with a letter of authorization and a firm order commitment date ([Porting In](/books/hosting-and-cloud/phone-numbers-and-porting#porting-in)). A vendor that controls the practice's number controls the practice, so the contract should say the number belongs to the practice and how a port-out is handled ([Porting Out and Number Takeover](/books/hosting-and-cloud/phone-numbers-and-porting#porting-out-and-number-takeover)).
- **Texting on the same number.** Practices want to text from their main number, which means text-enabling a landline number and registering it ([Texting From the Practice Number](/books/health-tech/patient-texting#texting-from-the-practice-number)).
- **Outbound reputation.** Reminder calls and callbacks from a practice's number get labeled "spam likely" when its signing and volume look wrong; [STIR/SHAKEN](/books/hosting-and-cloud/voice-platforms#stir-shaken-signing-and-attestation) and [Call Labeling and Branded Calling](/books/hosting-and-cloud/voice-platforms#call-labeling-and-branded-calling) cover the mechanics.
- **Fax.** Health care still faxes (referrals, records requests, prior authorizations). Practices keep fax numbers on the same system, delivered to an inbox; inbound faxes are PHI and belong in the document workflow, which this volume's [Referrals & Care Coordination](/books/health-tech/referrals-and-care-coordination#the-fax-reality) chapter covers.

## How to Build It

Calls are `communications` rows with `channel = 'voice'` ([The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model)); the chapter adds the practice's numbers, routing rules, a call record per call and an emergency location per device:

```sql
CREATE TABLE phone_numbers (                      -- the practice's numbers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID REFERENCES locations (id),  -- null for a group's main number
  e164               TEXT NOT NULL UNIQUE,
  purpose            TEXT NOT NULL CHECK (purpose IN ('main', 'location', 'tracking', 'fax',
                       'after_hours', 'department')),
  text_enabled       BOOLEAN NOT NULL DEFAULT FALSE,  -- registration lives in sender_registrations
  ported_in_at       TIMESTAMPTZ,
  owned_by_practice  BOOLEAN NOT NULL DEFAULT TRUE,
  status             TEXT NOT NULL CHECK (status IN ('porting', 'active', 'ported_out', 'released'))
);

CREATE TABLE call_routes (                         -- routing as dated rules
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  phone_number_id    UUID NOT NULL REFERENCES phone_numbers (id),
  version            INT NOT NULL,
  hours              JSONB NOT NULL,              -- per weekday, in the location's time zone
  closures           JSONB NOT NULL DEFAULT '[]', -- holidays and one-off closures
  ring_plan          JSONB NOT NULL,              -- groups, order, timeouts, overflow
  after_hours_plan   JSONB NOT NULL,              -- message, answering service, on-call, ER number
  recording_policy   TEXT NOT NULL CHECK (recording_policy IN ('none', 'announced_all',
                       'announced_inbound')),
  effective_from     TIMESTAMPTZ NOT NULL,
  approved_by        UUID NOT NULL,
  UNIQUE (phone_number_id, version)
);

CREATE TABLE call_records (                        -- one per voice communication
  communication_id   UUID PRIMARY KEY REFERENCES communications (id),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  phone_number_id    UUID NOT NULL REFERENCES phone_numbers (id),
  remote_e164        TEXT,                        -- null when caller ID was withheld
  matched_contact_ids UUID[] NOT NULL DEFAULT '{}',  -- every contact on that number
  route_version      INT,
  answered_by        UUID,                        -- staff user, or null
  outcome            TEXT CHECK (outcome IN ('answered', 'missed', 'voicemail', 'abandoned',
                       'after_hours', 'transferred')),
  disposition        TEXT,                        -- 'booked', 'rescheduled', 'billing', 'clinical'
  disposition_source TEXT CHECK (disposition_source IN ('staff', 'model')),
  started_at         TIMESTAMPTZ NOT NULL,
  answered_at        TIMESTAMPTZ,
  ended_at           TIMESTAMPTZ,
  is_emergency_call  BOOLEAN NOT NULL DEFAULT FALSE,
  recording_document_id  UUID REFERENCES documents (id),  -- call audio, kept as created
  voicemail_document_id  UUID REFERENCES documents (id),
  transcript_document_id UUID REFERENCES documents (id),
  announcement_captured  BOOLEAN,
  text_back_communication_id UUID REFERENCES communications (id)
);

CREATE TABLE emergency_locations (                 -- dispatchable location per device, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID REFERENCES locations (id),  -- null for an off-premises device
  device_ref         TEXT NOT NULL,               -- desk phone MAC, softphone install id
  device_kind        TEXT NOT NULL CHECK (device_kind IN ('fixed', 'non_fixed', 'off_premises')),
  dispatchable_location JSONB NOT NULL,           -- address plus suite, floor, room
  source             TEXT NOT NULL CHECK (source IN ('provisioned', 'user_updated', 'detected')),
  notify_user_ids    UUID[] NOT NULL DEFAULT '{}',  -- who hears about a 911 call from it
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (device_ref WITH =, valid_during WITH &&)
);
```

Notes on the sketch:

- **A match is a list, identification is a choice.** `matched_contact_ids` holds every contact on the number; the core `communications.patient_id` and `guarantor_id` are set only when staff pick, which is what makes call history attach to the right chart.
- **Routing is versioned.** Every call records the route version that handled it, so "why did my after-hours call go to voicemail?" has an answer, and closures are scheduled, not toggled.
- **Recordings are documents.** Audio, voicemail and transcripts are `documents` rows (encrypted, hashed, kept as created), so they follow the same retention schedule, legal holds and access logging as every other piece of the record ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)). Playback is a `read` in `audit_events`.
- **Emergency locations are effective-dated,** one per device at a time, and a softphone that can't confirm its location prompts the user before it's used.
- **911 calls notify.** A call flagged `is_emergency_call` notifies the device's `notify_user_ids` in the same moment, and the event is kept for compliance.
- **Text enablement is a registration.** A `phone_numbers` row with `text_enabled` has a `sender_registrations` row ([Two-Way Texting & Messaging](/books/health-tech/patient-texting#how-to-build-it)) that says which campaign or verification it sends under.
- **Events:** `call.missed`, `call.ended`, `voicemail.received`, `call.emergency_dialed` and `recording.played` feed text-back, the inbox, analytics and the audit trail.

## Auditing

- **Every call with its route version, outcome and who answered,** for staffing questions and disputes about unanswered calls.
- **Every recording and voicemail playback,** with the user and reason, since recordings are PHI ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Recording announcements,** that the greeting played and was captured, for consent disputes.
- **Device location history and 911 notifications,** to show the MLTS met its notification and location duties.
- **Who linked a caller to a patient,** since a wrong link puts a call on the wrong chart.

## What This Means for the System You Build

- **Sell the screen, not the dial tone:** call pop from the synced PMS with the household, next appointment, recall and balance, and nothing clinical.
- **Treat caller ID as a hint,** show every match, and let staff identify the patient.
- **Version routing and hours** as dated rules per location, with closures scheduled ahead and the route recorded on every call.
- **Keep PHI out of notifications;** voicemail alerts link into the app.
- **Send one informational text-back per missed call,** to mobile numbers that haven't opted out, with the practice named and STOP honored.
- **Configure direct 911, front-desk notification and a dispatchable location for every device,** including softphones off premises.
- **Announce recording on every call,** record only what will be reviewed, set retention at creation and log playback; sign a BAA with any vendor that stores recordings.
- **Measure answer rate, missed new-patient calls, callback time and booking rate** by hour and location.
- **Keep the practice's number the practice's,** in the contract and in the porting runbook.

## References

**Regulation and statutes**

- [Cornell LII: 47 CFR 9.16](https://www.law.cornell.edu/cfr/text/47/9.16), direct 911 dialing, notification and dispatchable location for MLTS, with compliance dates
- [Cornell LII: 47 CFR 9.17](https://www.law.cornell.edu/cfr/text/47/9.17), the February 16, 2020 compliance date, enforcement and the presumption against MLTS managers
- [Cornell LII: 45 CFR 160.103](https://www.law.cornell.edu/cfr/text/45/160.103), PHI "in any other form or medium" and business associates providing data transmission services
- [Florida Statutes 934.03](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0900-0999/0934/Sections/0934.03.html), all-party consent and the felony penalty
- [Maryland Courts and Judicial Proceedings 10-402](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcj&section=10-402&enactments=false), all-party consent
- [Massachusetts General Laws c. 272, s. 99](https://malegislature.gov/Laws/GeneralLaws/PartIV/TitleI/Chapter272/Section99), secret interception without all parties' authority and civil damages
- [New Hampshire RSA 570-A:2](https://gc.nh.gov/rsa/html/LVIII/570-A/570-A-2.htm), all-party consent
- [Montana Code 45-8-213](https://mca.legmt.gov/bills/mca/title_0450/chapter_0080/part_0020/section_0130/0450-0080-0020-0130.html), hidden recording, the warning exception and the health care facility emergency call exception

**Vendors**

- [Weave: Phones](https://www.getweave.com/phones/), call pop contents, missed call text, recordings and phone analytics
- [Weave: Phone system](https://www.getweave.com/phone-system/), AI Receptionist and Call Intelligence
- [Mango Voice](https://www.mangovoice.com/), patient caller ID from dental PMSs, missed-call dashboard, recording and analytics
- [PetDesk: Phones](https://petdesk.com/phones/), client and pet details on answer, missed-call text back, AI summaries written to the PIMS
- [Podium: Phones](https://www.podium.com/phones/), missed-call text-back with an AI agent, recording, transcription and integrations
- [Dental Intelligence](https://www.dentalintel.com/), its VoIP product
