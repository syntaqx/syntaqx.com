+++
title = "Practice Analytics & AI Front Desk"
nav_title = "Analytics & AI Front Desk"
description = "Practice KPIs defined once, dashboards and huddles, AI receptionists under disclosure and recording law, ambient scribes, accuracy and liability."
category = "Health Tech Industry"
order = 1942
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "analytics", "kpis", "ai-receptionist", "ambient-scribe", "voice-agents", "data-model"]
+++

A practice owner looks at a handful of numbers every morning: what the office produced yesterday, what it collected, how many hygiene patients left without their next appointment, how much diagnosed treatment is sitting unscheduled, how many calls went unanswered. Engagement and analytics vendors sell those numbers as dashboards and morning huddle reports, and now sell the next step: software that acts on them. An AI receptionist answers the calls the front desk missed and books them; an outbound agent works the unscheduled treatment list; an ambient scribe listens to the visit and drafts the note. Each moves a task from a person to a model, inside rules written for people: disclosure laws for talking to an AI, the FCC's treatment of AI voices, two-party recording consent, HIPAA for the transcript, and professional responsibility for whatever ends up in the chart.

This chapter covers both halves: the practice KPIs with one definition each, dashboards and huddles, and then the AI front desk and the AI in the operatory, with the law and the records each needs. The general engineering of AI agents is the playbook's [AI Agents in the Product](/docs/architecture/ai-agents) and [AI Security](/docs/security/ai-security); where models run and the data terms of model providers are the Hosting & Cloud volume's [Where AI Runs](/books/hosting-and-cloud/where-ai-runs); clinical AI more broadly (coding AI, prior authorization AI, clinical decision support rules, FDA's device list) is [AI in Health Tech](/books/health-tech/ai-in-health-tech). This chapter extends `procedures`, `appointments`, `payments`, `ledger_entries` and `communications` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages:

| Vendor | Analytics | AI at the front desk | AI in the visit |
| --- | --- | --- | --- |
| **Weave** | Not described on the AI page | AI Receptionist: answers calls, texts and website chats "24/7" with "a friendly, human-like AI voice"; captures appointment requests for staff, and for "qualified dental practice management systems" books and reschedules "right to your calendar"; hands off with a conversation summary | Not described on the page |
| **Dental Intelligence** | Analytics and Morning Huddle; integrates with Open Dental, Eaglesoft, Dentrix, Dentrix Ascend and Denticon | AI Receptionist: "Answer every patient call, even when your team can't" | Data Q&A: "Ask your practice's data any question" |
| **Overjet** | DSO analytics | Ivy, "an AI insurance coordinator" that verifies benefits and estimates patient costs | Voice: ambient AI that documents, monitors and analyzes patient visits; imaging AI (Dental Practice) |
| **Shepherd** (vet) | Integrated reports | Not described | SummarizeAI, TranscribeAI and DiagnoseAI, "trained on real clinical cases" |
| **Abridge** | Not applicable | Not applicable | Ambient documentation for health systems: "trusted by 300+ health systems," "100M+ Conversations" a year, pre-visit, in-visit and post-visit workflows |
| **WebPT** (rehab) | Compliance insights | Not described | "AI-assisted note creation" in its documentation |

Three patterns:

- **AI is sold as recovered revenue.** Every front-desk AI is pitched on missed calls and unbooked patients, which is a claim the practice can measure only if the analytics define a missed call and a booking the same way before and after.
- **Booking authority depends on the integration.** Weave's receptionist books directly only for qualified dental PMSs and captures requests elsewhere; the AI can do no more than the PMS integration lets it write (Integrating with Practice Management Systems).
- **The scribe is moving down market.** Ambient documentation started in health systems (Abridge's figures are health-system scale) and is now in dental (Overjet Voice), vet (Shepherd) and rehab (WebPT) products.

## Metrics Defined Once

The core practice measures (production, collections, collection rate, no-show and confirmation rates, hygiene reappointment, recall due and unscheduled, new patients) are defined in [Health Tech Metrics: Practice Metrics](/books/health-tech/health-tech-metrics#practice-metrics), with the miscount each invites, and production and collections as ledger sums are [Production and Collections](/books/health-tech/practice-business#production-and-collections). An analytics product and an AI front desk add measures of their own, which need the same discipline:

| Metric | Definition | Traps |
| --- | --- | --- |
| **Case acceptance** | Value (or count) of treatment accepted over treatment presented, by presentation date | Counting diagnosed but never presented treatment; acceptance versus scheduling versus completion |
| **Unscheduled treatment** | Value of accepted or presented treatment with no appointment ([Dental Practice](/books/health-tech/dental-practice#treatment-plans-and-case-acceptance)) | Stale plans years old; estimates computed on old fees |
| **Schedule utilization** | Booked chair or provider time over available time, per provider and operatory | Blocks held for emergencies; double booking |
| **Answer rate** | Inbound calls answered by a person or agent over inbound calls, during open hours and after | Hang-ups in the first seconds; calls answered by voicemail |
| **AI containment** | AI sessions resolved without a transfer over AI sessions, by agent version | A caller who hung up counted as resolved |
| **AI booking rate** | AI sessions that booked or rescheduled over sessions with a booking intent | Requests staff later declined counted as bookings |
| **AI-booked production** | Production from completed procedures on appointments an AI booked and the patient kept | Counting scheduled production, or appointments that would have booked anyway |
| **Scribe edit rate** | Edit distance from draft to signed note over draft length, by clinician and section | Clinicians who sign without reading look perfect |

Rules for computing them:

- **One definition, versioned, in code.** Each measure is a `metric_definitions` row with its filters, date basis and version; a dashboard, a huddle report, an AI's answer and a vendor's "you recovered $12,000" claim all call the same definition. Data Q&A products (Dental Intelligence's "Ask your practice's data any question") are only as good as the definitions underneath; a model writing ad hoc SQL against PMS tables will define production a new way each time.
- **Compute from facts, not from PMS reports.** Completed procedures, adjustments, payments and appointments synced from the PMS are the inputs; each PMS's own report uses its own definitions, and in a group with several PMSs they won't agree ([Enterprise Reporting Across PMSs](/books/health-tech/multi-location-and-call-centers#enterprise-reporting-across-pmss)).
- **Show as-of and freshness.** A PMS that syncs nightly makes "today" yesterday; every number carries when its data was last synced.
- **Attribute carefully.** "Appointments booked by the AI receptionist" is a count of appointments whose creating session was the AI's; "revenue recovered" adds the production of those appointments that were kept and completed. Anything else is a marketing number.

## Dashboards and the Morning Huddle

The morning huddle is a short meeting where the team walks through the day: who's coming, who has unscheduled treatment or recall due, who has a balance, who needs a pre-medication note or a lab case back, and where the schedule has holes to fill. Analytics vendors generate it from the PMS. What makes it work:

- **It's per appointment, not per metric.** The huddle is today's schedule annotated with opportunities and risks: "Mrs. Diaz, 9:00 hygiene, $1,840 of unscheduled treatment, insurance renews in January, $120 balance." Each annotation is a query over the same facts the KPIs use.
- **It respects roles.** Clinical notes go to clinicians, balances to the front desk; a huddle printed and left at the front desk is PHI on paper.
- **Yesterday's results close the loop.** Production and collections against goal, reappointment rate, and what happened to yesterday's opportunities (was the treatment scheduled?), so the huddle measures the team on things it controls.

## The AI Receptionist

An AI receptionist answers the practice's phone (overflow, after hours, or first), talks to the caller, and books, reschedules, takes messages or transfers. The agent design is the playbook's: tools rather than database access, typed results, decisions in code, identity before account actions, emergencies that skip the model, and human handoff as a feature ([AI Agents in the Product](/docs/architecture/ai-agents)). Field Operations' [AI Agents Beside the CSRs](/books/field-operations/contact-center#ai-agents-beside-the-csrs) covers the contact-center pattern. What a practice adds:

- **The emergency script comes first.** A caller describing chest pain, a dental abscess with facial swelling, a pet that was hit by a car, or a suicidal statement is routed out of the model's flow immediately: emergency instructions, a transfer to a person or the on-call clinician, and a record that it happened ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model)). The trigger list is a clinical decision the practice owns, versioned.
- **No clinical advice.** The receptionist schedules, answers logistics (hours, directions, what to bring, which insurance the office takes) and relays messages. Whether a symptom can wait is a clinical question; the agent's answer is to book the earliest urgent slot or transfer, never to reassure.
- **Identity before PHI.** Confirming an appointment time to whoever calls from the patient's number is low risk; reading a balance, discussing results or changing a guarantor needs identity verification (date of birth and name, a one-time code to the number on file), and a caller who is a parent, spouse or caregiver needs a proxy relationship on file before the agent discusses the patient ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions)).
- **Booking through the same rules staff use.** The agent books through the scheduling API with the office's appointment types, provider rules, new-patient slots and insurance checks; when the integration can't write to the PMS, it creates a request for staff to confirm, as Weave's does for systems outside its qualified list, and tells the caller it's a request.
- **Handoff with context.** A transfer or callback carries a summary, so the patient doesn't repeat themselves; Weave's receptionist routes to staff "with a conversation summary."

### Disclosure, AI Voices and Recording

The rules, at the level a practice's system needs them:

- **Say it's an AI.** State laws differ in trigger and scope (California's bot law, Utah's AI law with its "high-risk" interactions, others); one behavior satisfies them: the agent says it's an AI at the start of every interaction, answers honestly when asked, and the system records which greeting played ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)). Utah's high-risk category includes collecting sensitive data, which a health call always does. California also requires health care providers that use generative AI to write patient communications about clinical information to carry a disclaimer and tell the patient how to reach a human, unless a licensed provider reviewed the message. <!-- source-gap: ca-ab-3030 | missing | California AB 3030 (Health and Safety Code 1339.75): disclaimer and human-contact instructions on generative AI patient communications about clinical information, exemption when a licensed provider reviews, effective January 1, 2025 | closes with: the code section on leginfo.legislature.ca.gov (blocked to fetchers) or a California agency page quoting it | checked: 2026-10-29 -->
- **Outbound AI calls are artificial-voice calls.** The FCC's February 2024 ruling (FCC 24-17) brought AI-generated voices within the TCPA's "artificial or prerecorded voice," so an AI agent calling patients (recall, unscheduled treatment, balances) needs the consent those calls need, and the TCPA's healthcare exemption covers only the message types and limits it names; marketing calls need prior express written consent ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)). Two-Way Texting & Messaging covers the exemption.
- **Announce recording on every call.** Several states require every party's consent to record, and an AI receptionist records by nature (it needs the audio to work); the greeting announces recording and the announcement is in the recording ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)).

### Transcripts Are PHI

A call with a patient about their appointment, their bill or their symptoms is PHI, and so is its recording and transcript. The AI vendor and its model provider are business associates (and subcontractors) of the practice, under BAAs whose terms cover retention, training on the data and where it's processed ([Privacy and Compliance](/books/hosting-and-cloud/where-ai-runs#privacy-and-compliance)). Transcripts get a retention period tied to the records they support, are redacted of card numbers and identifiers that aren't needed, and are included in the practice's right-of-access and accounting obligations like any other PHI ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).

## Outbound Agents

The same agents work lists: unscheduled treatment, overdue recall, unconfirmed appointments, balances. Every outbound contact runs through the consent and contact rules for its channel and purpose before it's placed, and the list itself is a minimum-necessary decision: an agent calling about overdue recall needs the patient's name, office, recall due date and available slots, not their chart. The playbook's [Decide in Code](/docs/architecture/ai-agents#decide-in-code) applies: who gets called, when, how often and about what is decided by rules the practice configured, and the model handles the conversation.

## Ambient Scribes

An ambient scribe records the clinical conversation, transcribes it, and drafts a note (a SOAP note, a perio chart narrative, a PT daily note, a vet visit summary) for the clinician to review and sign. The architecture (evidence links, audio lifetime, drafts as provenance, codes as suggestions) is [AI in Health Tech: Ambient Scribes](/books/health-tech/ai-in-health-tech#ambient-scribes); this chapter owns the consent law and what changes in a small practice. The record and the liability stay with the clinician.

- **Consent to record.** Patients are told the visit is recorded for documentation and may decline; the consent (or refusal) is recorded per encounter, and in all-party consent states it's a legal requirement, not a courtesy. A recording made of a minor, a patient with a proxy, or a visit with a family member present needs every party's consent.
- **The draft is not the note,** in a dental operatory or a vet exam room as much as a hospital; a practice without a coder or a compliance officer relies on the signature step more, not less.
- **Accuracy is measured, not assumed.** Omissions (a symptom mentioned but not documented), hallucinations (an exam finding never performed) and misattributions (who said what) are the failure modes; a practice evaluating a scribe samples drafts against recordings and tracks edit rates by clinician and note section ([Evals](/docs/architecture/ai-agents#evals)).
- **Coding suggestions are the riskiest part.** A scribe that suggests billing codes from the conversation moves toward documentation that supports a higher code than the work did; codes are the clinician's and the coder's decision, and a suggestion accepted without review is the kind of pattern False Claims Act cases are made from (Coding, Documentation & Compliance).
- **Retention of audio is a choice.** Many products delete audio after the note is signed; keeping it gives an evidence trail and creates a PHI store. Decide, state it in the consent, and apply it ([Data Retention](/docs/architecture/data-retention)).

## Accuracy and Liability

Whoever answers the phone or drafts the note, the practice is responsible for what it says and does: "The AI's promises are the business's promises" ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)). In a practice that means:

- **An AI's booking is the practice's booking,** at the price and terms the agent quoted.
- **An AI's statement about coverage or cost is an estimate the practice gave,** so the agent quotes from the estimate engine with its caveats, never from the model's general knowledge.
- **A clinical statement by an AI is practice of the profession by the practice,** which is why the receptionist doesn't make them and the scribe's drafts are signed by a clinician.
- **Vendor contracts allocate some of it,** but not the practice's professional and regulatory responsibility; the logs are what let the practice show what happened.

## How to Build It

The metric store is [Health Tech Metrics](/books/health-tech/health-tech-metrics#how-to-build-it)': it defines `metric_definitions` (a keyed, versioned definition with its numerator, denominator, business date, source of truth and owner) and `metric_values` (computed values per tenant, location and period, frozen when reported). The practice KPIs in this chapter's table are rows in `metric_definitions`, computed per location into `metric_values`, and every dashboard, huddle and AI answer reads them. This chapter adds the AI front desk's side: call and chat sessions and their actions. Each deployed agent and scribe is an `ai_features` row, and each scribe draft an `ai_outputs` row, both from [AI in Health Tech](/books/health-tech/ai-in-health-tech#how-to-build-it), with the signed note pointing back at its draft. Recording consent is a core `consents` row of kind `recording`, with the wording that played as a `disclosure_texts` version and the parties and audio retention in its `scope`:

```sql
CREATE TABLE ai_call_sessions (            -- one call, chat or text thread an AI handled
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  location_id     UUID REFERENCES locations (id),
  agent           TEXT NOT NULL,           -- 'receptionist', 'outbound_recall', 'benefits'
  ai_feature_id   UUID REFERENCES ai_features (id),  -- AI in Health Tech: the deployed agent
  agent_version   TEXT NOT NULL,           -- prompt, tools and model, as one version
  vendor          TEXT,
  channel         TEXT NOT NULL CHECK (channel IN ('voice_inbound', 'voice_outbound', 'sms', 'chat')),
  communication_id UUID REFERENCES communications (id),
  patient_id      UUID REFERENCES patients (id),  -- once identified
  identity_level  TEXT NOT NULL DEFAULT 'none' CHECK (identity_level IN ('none', 'number_match',
                    'verified', 'proxy_verified')),
  greeting_text_id UUID NOT NULL REFERENCES disclosure_texts (id),  -- the AI and recording disclosure
  recording_consent_id UUID REFERENCES consents (id),
  emergency_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  outcome         TEXT CHECK (outcome IN ('booked', 'rescheduled', 'request_created', 'message',
                    'transferred', 'emergency_routed', 'abandoned', 'resolved')),
  handoff_summary TEXT,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ
);

CREATE TABLE ai_actions (                  -- every tool call the agent made
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  session_id      UUID NOT NULL REFERENCES ai_call_sessions (id),
  tool            TEXT NOT NULL,           -- 'find_slots', 'book', 'verify_identity', 'transfer'
  input           JSONB NOT NULL,
  result          JSONB NOT NULL,          -- typed result, as returned
  decided_by_rule TEXT,                    -- the code rule that allowed or refused it
  appointment_id  UUID REFERENCES appointments (id),
  at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE appointments                   -- source 'ai_agent' is already a core value
  ADD COLUMN ai_call_session_id UUID REFERENCES ai_call_sessions (id);

ALTER TABLE ai_outputs                     -- AI in Health Tech's record of each generation
  ADD COLUMN recording_consent_id UUID REFERENCES consents (id);  -- kind 'recording': every party
```

Attribution for an AI vendor's recovered-revenue claim, from facts: appointments the AI booked, the encounters they became, and the charges for completed procedures:

```sql
-- Production from appointments an AI booked, kept and completed in a period:
SELECT SUM(c.fee * c.units) AS production
FROM appointments a
JOIN encounters e ON e.appointment_id = a.id AND e.status = 'finished'
JOIN charges c ON c.encounter_id = e.id AND c.status <> 'void'
JOIN procedures p ON p.id = c.procedure_id AND p.status = 'completed'
WHERE a.location_id = ANY($3)
  AND a.source = 'ai_agent'
  AND p.performed_on BETWEEN $1 AND $2;
```

Design notes:

- **Metrics are definitions with versions,** and each value names the version, so a number in last quarter's board deck can be recomputed exactly; the KPI table above is the content, Health Tech Metrics is the store.
- **Agents act through tools whose rules are in code;** `ai_actions` records each call and the rule that allowed it, which is what a practice, a vendor or a regulator reconstructs from ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)), and each action also writes an `audit_events` row with `actor_kind = 'ai_agent'`.
- **The draft and the signature are separate records:** the `ai_outputs` draft, the signed `documents` note pointing at it, and the `consents` row the recording relied on.
- **AI-created records are marked at creation** (`appointments.source = 'ai_agent'` and the session ID), so measurement, review and rollback can find them.

## Auditing

- **Metric definitions and their changes,** and which version each report used.
- **Every AI session** with its agent version, greeting, identity level, emergency triggers, outcome and handoff.
- **Every AI action** with input, result and the rule that allowed it.
- **Recording consents** per call and encounter, with every party's answer and the retention chosen.
- **Every scribe draft** against the signed note, with edits, suggested codes and who signed.

## What This Means for the System You Build

- **Define each KPI once, in versioned code,** compute it from synced facts, and show freshness on every number.
- **Generate the huddle per appointment** from the same facts, respecting roles.
- **Route emergencies out of the AI's flow** by a practice-owned, versioned trigger list.
- **Keep the AI receptionist off clinical advice,** verify identity before PHI, and book only through the scheduling rules staff use.
- **Disclose AI and recording at the start of every call,** record the greeting version, and get the TCPA consent outbound AI calls need.
- **Treat recordings and transcripts as PHI** under BAAs with retention and no training by default.
- **Keep scribe drafts separate from signed notes,** measure accuracy, and never auto-apply suggested codes.
- **Mark AI-created records** and attribute outcomes from completed, kept work, not from vendor counters.

## References

**Vendors**

- [Weave: AI Receptionist](https://www.getweave.com/ai-receptionist/), calls, texts and chat 24/7, booking for qualified dental PMSs, requests elsewhere, handoff with a summary
- [Dental Intelligence](https://www.dentalintel.com/), analytics, Morning Huddle, AI receptionist, data Q&A, PMS integrations
- [Overjet](https://www.overjet.com/), Ivy benefit verification, Voice ambient documentation, DSO analytics
- [Shepherd](https://www.shepherd.vet/), SummarizeAI, TranscribeAI and DiagnoseAI in a vet PIMS
- [Abridge](https://www.abridge.com/), ambient documentation for health systems and its published scale
- [WebPT](https://www.webpt.com/), AI-assisted rehab documentation and compliance insights

**Playbook and other volumes**

- [Consumer Contact](/docs/compliance/consumer-contact), FCC 24-17 on AI voices, AI disclosure laws, recording consent
- [AI Agents in the Product](/docs/architecture/ai-agents), tools, decisions in code, identity, emergencies, handoff, evals and auditing
- [Where AI Runs](/books/hosting-and-cloud/where-ai-runs), model providers' data terms and compliance
