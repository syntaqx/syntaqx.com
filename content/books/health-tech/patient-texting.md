+++
title = "Two-Way Texting & Messaging"
description = "Practices texting patients: the practice number, registration, the TCPA health care exemption, STOP, HIPAA and texting, portals versus SMS, email, the inbox."
category = "Health Tech Industry"
order = 1933
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "sms", "tcpa", "hipaa", "messaging", "consent", "data-model"]
+++

Texting is how most practices now talk to patients, and how most patients prefer to be reached. The reminders, recall messages, forms links, payment links and review requests of the other chapters in this part all travel by text, and patients answer them: "running 10 min late," "can I move to Thursday," "is it normal for my gums to bleed after a deep cleaning," a photo of a rash, a photo of an insurance card. A practice's texting system is therefore three things at once: an outbound notification channel under telemarketing and carrier rules, a two-way conversation with a covered entity's patients under HIPAA, and a shared inbox the front desk works all day. Each has rules that the other two don't, and the hard cases (a patient who asked for no texts about a sensitive visit, a STOP sent in reply to a review request, a parent texting about a teenager) sit where they meet.

This chapter covers the practice use of texting: sending from the practice's number, registration for health senders, the TCPA health care exemption, revocation and STOP, HIPAA and texting (patient preference, minimum necessary, marketing), portals and secure messaging versus SMS, email, and the shared inbox. It extends `communications`, `contacts` and `consents` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The mechanics it builds on live elsewhere: carrier registration in [Business Texting Registration](/books/hosting-and-cloud/texting-registration), segments, throughput and delivery in [Sending a Text](/books/hosting-and-cloud/sending-a-text), and TCPA consent, revocation, quiet hours and CTIA's carrier rules in the playbook's [Calls, Texts & Email](/docs/compliance/consumer-contact). This chapter covers only the health care layer on top, plus what the HIPAA basics in the playbook's [HIPAA](/docs/compliance/hipaa) mean for a text.

## How the Platforms Do It

As of October 2026, from public product pages:

| Vendor | Two-way texting | What's distinctive |
| --- | --- | --- |
| **Weave** | Texting from the practice number, in the desktop and mobile apps beside phones | Reply sentiment on reminders; missed call text; reviews and payments in the same thread |
| **Solutionreach** | "Handle quick questions, confirmations, and patient follow-up by text instead of adding more calls to the front desk" | Reminders, recall and texting for 50,000+ practices |
| **Podium** | One inbox for texts, calls, web chat and reviews | An "AI Employee" that continues conversations and books |
| **PetDesk** (veterinary) | A comms inbox for texts and missed-call replies | A client app beside SMS |
| **Luma Health** (medical) | "Multichannel, multilingual communication to one patient or many" | AI inbound and outbound, SMS and RCS |
| **Open Dental** (PMS) | Integrated Texting at $5 a month access plus $0.04 per outgoing US message, per location | Texting inside the PMS, with landline texting as an add-on to eConfirmations |
| **Phreesia** (medical) | Patient messaging inside intake and payments | Its 10-K lists TCPA claims over its calling and texting as a risk, and lists among drivers of its results "the extent to which they opt-in to such communications" |

The common shape is a dedicated or text-enabled practice number per location, a shared inbox with assignment, templates for common replies, and every automated message (reminders, recall, payments, reviews) landing in the same thread as the conversation. That last point is what makes texting hard to build well: the thread has messages from five products with five purposes, and consent, opt-outs and minimum necessary have to be right for each.

## Texting From the Practice Number

Patients recognize the practice's main number and reply to it; texts from an unfamiliar number get ignored or reported as spam. So the industry texts from the number on the sign: an existing landline or VoIP number text-enabled through the messaging provider, with calls still ringing the phone system. The mechanics (text enablement as a separate record from voice service, 10DLC registration for local numbers, verification for toll-free ones) are in [Business Texting Registration](/books/hosting-and-cloud/texting-registration). For a practice the consequences are:

- **Each practice is its own brand.** A vendor texting for thousands of practices is an ISV registering each customer separately, with campaigns for its use cases ([Registering Your Customers: the ISV Model](/books/hosting-and-cloud/texting-registration#registering-your-customers-the-isv-model)). A dental group with ten offices may be one brand with ten numbers; ten independent offices are ten brands.
- **Campaigns describe the use.** Appointment reminders, recall and two-way patient conversation register as notification and customer care use cases; review requests and promotions need a campaign that says so, and a reminders campaign that starts sending promotions risks suspension.
- **Throughput is small and that's fine.** A practice sends hundreds of texts a day, not thousands a minute. The constraint that bites is the per-brand daily cap on T-Mobile for unvetted brands ([Vetting and Trust Scores](/books/hosting-and-cloud/texting-registration#vetting-and-trust-scores)) when a group sends recall to its whole list on one morning, so recall campaigns are paced.
- **Segments cost money.** A reminder with an emoji or a long practice name turns into several billable segments ([Segments and Encoding](/books/hosting-and-cloud/sending-a-text#segments-and-encoding)); Open Dental says "a text message segment is 160 characters" and charges for each additional one, and the TCPA health care exemption's 160-character limit (below) makes short templates a legal matter as well as a cost.

## The TCPA Healthcare Exemption

The TCPA requires prior express consent for autodialed or prerecorded calls and texts to mobile numbers, and prior express written consent when they're telemarketing; the playbook's [TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent) has the general rules. Health care has two carve-outs that practices rely on, and both are narrower than they're usually described.

**The exemption for health care messages to mobile numbers,** 47 CFR 64.1200(a)(9)(iv). The FCC's (a)(9) exemptions apply only if the call or text "is not charged to the called person or counted against the called person's plan limits on minutes or texts," and (iv) covers calls "made by, or on behalf of, healthcare providers, which include hospitals, emergency care centers, medical physician or service offices, poison control centers, and other healthcare professionals," when every one of these conditions holds:

| Condition | What it requires |
| --- | --- |
| **(A) The patient's number** | Only to the wireless number the patient provided |
| **(B) Identification** | The provider's name and contact information |
| **(C) Purposes** | Strictly appointment and exam confirmations and reminders, wellness checkups, hospital pre-registration instructions, pre-operative instructions, lab results, post-discharge follow-up intended to prevent readmission, prescription notifications and home health care instructions |
| **(D) Exclusions** | No telemarketing, solicitation or advertising; no accounting, billing, debt collection or other financial content; must comply with HIPAA privacy rules |
| **(E) Length** | Concise: generally one minute or less for voice, 160 characters or less for texts |
| **(F) Frequency** | One message a day per patient, at most three a week |
| **(G) Opt-out** | An easy opt-out in every message; for texts, replying STOP, which the rule calls "the exclusive means" of opting out |
| **(H) Honoring** | Opt-outs honored immediately |

**The HIPAA "health care message" exception for prerecorded calls,** 47 CFR 64.1200(a)(2) and (a)(3)(v): a prerecorded call delivering a "health care" message made by or for a HIPAA covered entity or business associate doesn't need prior express written consent to a mobile number, or consent to a residential line, limited to one call a day and three a week per residential line.

What this means for building a practice product:

- **The exemption covers less than the product sends.** Balance-due texts and payment links are "financial content" excluded by (D); review requests, promotions and newsletters are outside (C); a recall text arguably falls under "wellness checkups" or appointment reminders, but nobody should add an offer to it. Each template's purpose decides whether the exemption can apply, so purpose is set on the template when it's written.
- **The frequency budget is per patient across every product.** One a day and three a week counts the confirmation, the reminder, the forms link and the arrival text together. A family of four booked on one day can't get four separate reminders under the exemption; aggregate them.
- **It isn't clearly available to every practice.** Veterinary clinics aren't HIPAA covered entities, and (D) requires HIPAA compliance; I wouldn't rely on the exemption for a vet clinic. Med spas and wellness businesses that aren't health care providers in the ordinary sense have the same problem.
- **Courts now read it themselves.** In *McLaughlin Chiropractic Associates v. McKesson Corp.* (June 20, 2025), the Supreme Court held that district courts in enforcement proceedings aren't bound by the FCC's interpretation of the TCPA and owe it only "appropriate respect." The codified conditions above still bind; the FCC's looser statements about what they mean can be relitigated.

My rule: get the patient's express consent to texts at registration and in intake, recorded per purpose in the consent ledger ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)), and treat the health care exemption as a backstop for informational messages to patients whose consent can't be shown, never as the product's legal basis. Consent at intake costs one checkbox and makes the frequency, length and purpose limits a matter of policy rather than law.

## Revocation and STOP

The general revocation rules, including FCC 26-67 (adopted September 30, 2026, effective November 25, 2026), which lets a sender treat a revocation in reply to an informational message as applying only to that category, are in [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent), and the platform side is [STOP at the Platform](/books/hosting-and-cloud/sending-a-text#stop-at-the-platform). The health care specifics:

- **Exempt messages honor STOP immediately.** The (a)(9)(iv)(H) condition is "immediately," stricter than the general ten business days, so a practice relying on the exemption processes STOP in the same transaction as receipt, before anything else is sent.
- **Scope is a real choice.** Under FCC 26-67, a STOP in reply to a review request could stop only review requests, leaving reminders flowing. For a patient with appointments on the books that's arguably kinder, and it's also a patient who asked a practice to stop texting and keeps getting texts. My default for practices: STOP stops every automated text from that practice to that number, with an easy way to opt back in to reminders, and the template it answered recorded. Practices that want category scoping should get it as configuration with the FCC's disclosure requirements met.
- **Two systems, one STOP.** Many practices text from their PMS and an engagement vendor, or a vendor and a reputation tool. The patient sees one practice. Opt-outs must sync both ways in near real time ([Two-Way Texting and the Shared Inbox](/books/field-operations/customer-communications#two-way-texting-and-the-shared-inbox) covers the same problem in field service).
- **Staff hear opt-outs too.** "Please stop texting me" said at the front desk is a revocation by reasonable means; the front desk needs a one-click way to record it.

## HIPAA and Texting

HIPAA doesn't prohibit texting patients. It requires reasonable safeguards, respect for the patient's choices about how they're contacted, and the minimum necessary information in each message. Two HHS statements frame it. HHS's FAQ on email says the Privacy Rule "allows covered health care providers to communicate electronically, such as through e-mail, with their patients, provided they apply reasonable safeguards," that it "does not prohibit the use of unencrypted e-mail for treatment-related communications," and that if a patient initiates email the provider "can assume (unless the patient has explicitly stated otherwise) that e-mail communications are acceptable"; I found no separate OCR guidance specific to SMS with patients, and practices apply the same reasoning to texts. And the Security Rule still applies to the systems that store the messages ([The Three Rules](/docs/compliance/hipaa#the-three-rules)): the texting vendor stores PHI, signs a BAA, encrypts at rest and logs access.

### Patient Preference and Confidential Communications

Patients have a right to ask for communications "by alternative means or at alternative locations," and a provider must accommodate reasonable requests without requiring an explanation (45 CFR 164.522(b)). HHS's example is a patient who wants appointment reminders by email instead of a postcard; the converse matters more for texting: a patient who doesn't want texts to a shared family phone, or wants nothing sent to the number on file for a sensitive visit, or wants messages only through the portal. The FAQ adds that if unencrypted email is unacceptable to a patient requesting confidential communications, "other means of communicating with the patient, such as by more secure electronic methods, or by mail or telephone, should be offered and accommodated."

A confidential communications request is not a consent flag. It's an instruction that overrides defaults per patient, per channel and sometimes per subject ("no texts about this visit"), and it must reach every system that sends: the PMS, the reminder vendor, the billing vendor, the call center. Store it on the patient, sync it, and check it at send time.

### Minimum Necessary in a Text

A text can be read on a lock screen, by a spouse, on a work phone. The practice-wide rule I'd build in:

- **Notifications say who, when and where, not why.** "Reminder: appointment with Dr. Lee at Elm Street Dental, Tue 9:00 a.m. Reply C to confirm" is fine. "Reminder: your root canal" or "your HIV follow-up" isn't, unless the patient has chosen that level of detail.
- **Detail lives behind a login.** Results, treatment details and forms go through a link to an authenticated page, not in the body; the link carries a token that opens nothing without the patient verifying (birth date at least), and never puts PHI in the URL ([What It Means for a System](/docs/compliance/hipaa#what-it-means-for-a-system)).
- **Specialty matters.** A practice name can itself disclose: a psychiatric practice, an addiction treatment program, a fertility clinic. Such practices can use a neutral sender name in templates; substance use disorder records add 42 CFR Part 2's stricter rules, covered in this volume's [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy#part-2-substance-use-disorder-records) chapter.
- **Patients can choose more.** A patient who texts a photo of their stitches has chosen the channel for that conversation; staff can reply in kind, still without volunteering more than the question needs.

### Marketing Versus Treatment

Under 45 CFR 164.501, a communication about the practice's own treatment of the patient, or describing health-related products and services the practice provides, isn't marketing unless the practice receives financial remuneration from a third party for sending it. That covers reminders, recall, treatment follow-up and new-service announcements from the practice itself. It changes when someone else pays: a manufacturer sponsoring a reminder about its product, or a practice handing its patient list to someone else. OCR's settlement with Northcutt Dental-Fairhope ($62,500) arose from a dental practice that disclosed patients' PHI to a campaign manager and a marketing company for a state senate campaign. The lesson for a texting platform is that a patient list exported for "a newsletter" is a disclosure, and the platform's permissions should make bulk sends to non-treatment purposes a deliberate, logged act. The TCPA draws its own line separately: anything promotional is telemarketing there, whatever HIPAA calls it.

## Portals and Secure Messaging

Patient portals and practice apps offer secure messaging: authenticated, encrypted, kept in the record. SMS is none of those and is read far more. Practices use both, and the division that works:

| Content | Channel |
| --- | --- |
| Reminders, confirmations, recall, "your forms are ready," "your results are available" | SMS with a link |
| Two-way scheduling and logistics ("running late," "can I move to Thursday") | SMS |
| Clinical questions, results, images, anything a clinician answers | Secure messaging or a call; SMS replies point there |
| Records requests and anything with documents | Portal |

When a patient texts a clinical question, the practice's reply can move it ("I've sent you a secure message link so the doctor can answer") and the inbox should make that one click. Portal messages a clinician answers may be billable as e-visits in medicine (this volume's [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access#portal-messaging-and-e-visits) chapter), which is one more reason they belong in a system that records who answered.

## Email

Email carries the long messages: forms packets, statements, treatment plans, newsletters. The HIPAA analysis is the same as above (HHS's FAQ is about email); CAN-SPAM governs commercial email ([Email: CAN-SPAM](/docs/compliance/consumer-contact#email-can-spam)), and deliverability is a platform problem covered in [Email Sending Platforms](/books/hosting-and-cloud/email-sending-platforms). Two practice specifics: send transactional and marketing mail on separate streams so a newsletter complaint doesn't bury next week's reminders ([Email: Authentication and Streams](/docs/architecture/notifications#email-authentication-and-streams)), and send each practice's mail from its own domain, authenticated, so "Elm Street Dental" arrives as itself rather than as the vendor.

## The Shared Inbox

The inbox is where the front desk spends its day, and its design decides whether texting saves time or creates it.

- **Thread by the pair of numbers,** practice line and patient number, and show every patient on that number. A parent texting "can we move Emma to Friday" from a number shared by three children has to have the right child picked by staff, never inferred from the latest appointment; the Field Operations volume's [One Number, Several Accounts](/books/field-operations/customer-communications#one-number-several-accounts) gives the same rule.
- **Assignment and status.** Each thread has an owner (front desk, billing, clinical) and a state (open, waiting on patient, closed), so a question about a bill isn't answered by three people or by none.
- **Keywords first.** STOP, HELP and opt-in keywords are processed before routing, and the revocation is written before anything acknowledges it.
- **Clinical triage.** Messages that look clinical ("swelling," "bleeding," "can't breathe," "emergency") are flagged to a clinician, and the practice's after-hours auto-reply says what to do in an emergency. An unanswered text about a post-surgical complication at 9 p.m. is a patient safety problem, not an inbox metric.
- **Attachments are records.** A photo of an insurance card belongs on the coverage; a photo of a wound belongs in the chart as a document; neither should live only in a text thread ([documents](/books/health-tech/health-tech-business#the-core-data-model) in the core model).
- **Minors and proxies.** A teenager's texts and a parent's texts about the teenager are different conversations with different rights, which this volume's [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization#minors-proxies-and-personal-representatives) chapter covers; the inbox has to show who the sender is to the patient.
- **No personal phones.** Clinicians texting patients from personal phones bypasses the log, the consent ledger and the BAA. Give them the practice number in an app.
- **AI replies** drafted or sent by a model go through the same consent, purpose and audit gates as a person's; this part's [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#the-ai-receptionist) chapter covers the AI front desk.

## How to Build It

Every text is a `communications` row with its `purpose`, `contact_id` and `status`, and every texting permission is a `consents` row of kind `texting` (or `marketing`) pointing at the exact wording shown in `disclosure_texts` ([The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model)). The chapter adds sender registrations, conversations and opt-outs, plus two records the gate needs, message templates and confidential communications requests:

```sql
CREATE TABLE sender_registrations (              -- what each text-enabled number sends under
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  phone_number_id     UUID NOT NULL REFERENCES phone_numbers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('10dlc_campaign', 'toll_free_verification')),
  brand_ref           TEXT,                      -- the registry's brand id for the practice
  campaign_ref        TEXT,                      -- or the verification id
  use_cases           TEXT[] NOT NULL,           -- as registered: notifications, customer care, marketing
  status              TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE message_templates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  name                TEXT NOT NULL,
  purpose             TEXT NOT NULL,             -- the communications.purpose values
  tcpa_exemption_eligible BOOLEAN NOT NULL,      -- purpose is in (a)(9)(iv)(C), not excluded by (D)
  body                TEXT NOT NULL,
  max_segments        SMALLINT NOT NULL DEFAULT 1,
  detail_level        TEXT NOT NULL DEFAULT 'logistics' CHECK (detail_level IN ('logistics',
                        'service_named', 'clinical')),
  neutral_sender      BOOLEAN NOT NULL DEFAULT FALSE,
  version             INT NOT NULL,
  approved_by         UUID NOT NULL,
  CHECK (NOT tcpa_exemption_eligible OR purpose IN ('appointment_reminder', 'confirmation', 'recall'))
);

CREATE TABLE conversations (                     -- one thread per practice number and patient number
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  phone_number_id     UUID NOT NULL REFERENCES phone_numbers (id),
  remote_e164         TEXT NOT NULL,
  assigned_to         UUID,                      -- staff user or team
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'waiting', 'closed')),
  flagged_clinical_at TIMESTAMPTZ,
  UNIQUE (phone_number_id, remote_e164)
);

CREATE TABLE opt_outs (                          -- STOP and its equivalents, per number
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  remote_e164         TEXT NOT NULL,
  channel             TEXT NOT NULL CHECK (channel IN ('sms', 'voice', 'email')),
  scope               TEXT NOT NULL CHECK (scope IN ('purpose', 'all_automated')),
  purposes            TEXT[],                    -- when scope = 'purpose'
  words_received      TEXT,                      -- 'STOP', 'please stop texting me'
  in_reply_to_communication_id UUID REFERENCES communications (id),
  received_via        TEXT NOT NULL CHECK (received_via IN ('keyword', 'staff', 'portal', 'carrier')),
  received_at         TIMESTAMPTZ NOT NULL,
  ended_at            TIMESTAMPTZ,               -- an opt-in keyword or a new consent
  ended_by_consent_id UUID REFERENCES consents (id)
);

CREATE TABLE confidential_communication_requests (   -- 45 CFR 164.522(b)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  instruction         TEXT NOT NULL CHECK (instruction IN ('no_sms', 'no_voicemail', 'no_email',
                        'portal_only', 'alternate_contact', 'no_mail_to_home')),
  alternate_contact_id UUID REFERENCES contacts (id),
  scope_encounter_id  UUID REFERENCES encounters (id),  -- null = all communications
  received_via        TEXT NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL,
  ended_at            TIMESTAMPTZ
);

ALTER TABLE communications
  ADD COLUMN conversation_id UUID REFERENCES conversations (id),
  ADD COLUMN template_id UUID REFERENCES message_templates (id),
  ADD COLUMN template_version INT,
  ADD COLUMN legal_basis TEXT CHECK (legal_basis IN ('express_consent', 'written_consent',
                         'tcpa_healthcare_exemption', 'patient_initiated', 'none_required')),
  ADD COLUMN consent_id UUID REFERENCES consents (id),
  ADD COLUMN segments SMALLINT,
  ADD COLUMN blocked_reason TEXT;                -- 'opted_out', 'confidential_request', 'budget',
                                                 -- 'quiet_hours', 'stale_subject', ...

ALTER TABLE contacts
  ADD COLUMN line_type_checked_at TIMESTAMPTZ;    -- kind re-verified against a line-type lookup

CREATE VIEW exemption_budget AS                  -- (a)(9)(iv)(F): one a day, three a week
SELECT patient_id,
       count(*) FILTER (WHERE occurred_at >= date_trunc('day', NOW())) AS today,
       count(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '7 days') AS last_7_days
FROM communications
WHERE legal_basis = 'tcpa_healthcare_exemption' AND direction = 'outbound'
  AND status IN ('sent', 'delivered')
GROUP BY patient_id;
```

Notes on the sketch:

- **One outbound gate.** Every product (reminders, recall, payments, reviews, staff replies) sends through one gate that checks, in order: an open `opt_outs` row for the number, open confidential communications requests for the patient, a permitting `consents` row for the template's purpose (or exemption eligibility and budget), quiet hours in the location's time zone, and segment count ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)). A refusal is a `communications` row with `status = 'blocked'` and its `blocked_reason`.
- **The legal basis is recorded per message,** with the consent row it relied on, so a TCPA claim is answered message by message: this one under written consent captured at intake with this wording, that one under the exemption within budget.
- **Opt-outs belong to the number,** not the patient: a STOP from a parent's phone stops texts about every child on it. The core `contacts.text_ok` flag is cleared as a cache; `opt_outs` is the evidence, with the words and the message they answered.
- **The budget view is illustrative.** In production the check runs inside the send transaction with a lock per patient, so two products can't both send the third message of the week.
- **Templates carry purpose, eligibility and detail level,** with a constraint that a billing or review template can never be marked exemption-eligible.
- **Confidential requests are their own records,** dated, scoped and synced to every sending system, not a column on the contact.
- **Inbound first writes, then routes.** An inbound message is stored, keywords are processed (an `opt_outs` row written), the conversation is updated, clinical flags are raised, and only then does it reach a person or a model.
- **Events:** `message.received`, `consent.revoked`, `opt_out.recorded`, `conversation.flagged_clinical` and `confidential_request.recorded` fan out to every system that sends.

## Auditing

- **Every message with its template, version, purpose and legal basis,** and every suppression with its reason.
- **Every consent and revocation with the words received, the channel and the message it answered,** including opt-outs told to staff.
- **Confidential communications requests,** when received and what they covered, and evidence each sending system honored them.
- **Who chose the patient on a shared number,** since a reply applied to the wrong child is a disclosure.
- **Bulk sends and exports of patient contact lists,** with who approved them and for what purpose.
- **Access to message content** by staff and support, per [Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes).

## What This Means for the System You Build

- **Text from the practice's own number,** registered as the practice's own brand, with campaigns that match what's sent.
- **Collect express consent to texts at registration and intake,** per purpose, and treat the TCPA health care exemption as a backstop with its purposes, length, frequency and immediate-STOP limits enforced in code.
- **Never mark billing, review or marketing templates as exemption-eligible.**
- **Process STOP before anything else,** sync it to every system that texts, and decide revocation scope deliberately.
- **Honor confidential communications requests** as dated, scoped instructions checked at send time by every product.
- **Keep texts to logistics;** put clinical detail behind an authenticated link with no PHI in the URL, and use neutral sender names where the practice's name discloses.
- **Treat patient lists as PHI;** bulk sends for non-treatment purposes are deliberate, approved and logged.
- **Move clinical conversations to secure messaging,** flag urgent texts to clinicians, and file attachments into the record.
- **Thread by number pair, show every patient on the number, and make staff choose.**

## References

**Regulation and courts**

- [Cornell LII: 47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), the (a)(9) no-charge condition, the (a)(9)(iv) health care exemption's conditions, the (a)(2) and (a)(3)(v) health care message exception, and revocation in (a)(10) and (a)(12)
- [FCC 26-67: Report and Order and Further Notice of Proposed Rulemaking (PDF)](https://docs.fcc.gov/public/attachments/FCC-26-67A1.pdf), scoped revocation for informational messages and designated revocation methods
- [Supreme Court: McLaughlin Chiropractic Associates v. McKesson Corp. (2025)](https://www.law.cornell.edu/supremecourt/text/23-1226), district courts not bound by FCC interpretations in enforcement proceedings
- [Cornell LII: 45 CFR 164.522](https://www.law.cornell.edu/cfr/text/45/164.522), confidential communications by alternative means or locations
- [Cornell LII: 45 CFR 164.501](https://www.law.cornell.edu/cfr/text/45/164.501), the marketing definition and its treatment and remuneration exceptions
- [HHS: Does HIPAA permit providers to use email with patients?](https://www.hhs.gov/hipaa/for-professionals/faq/570/does-hipaa-permit-health-care-providers-to-use-email-to-discuss-health-issues-with-patients/index.html), reasonable safeguards, unencrypted email, patient-initiated email and alternatives for confidential communications
- [HHS OCR: Northcutt Dental-Fairhope enforcement action](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/northcutt/index.html), $62,500 for disclosing patient PHI for a state senate campaign

**Vendors and filings**

- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), TCPA claims as a risk and patient opt-in as a driver of results
- [Open Dental: Fees](https://opendental.com/site/fees.html), Integrated Texting access and per-message prices
- [Open Dental: Recall setup](https://www.opendental.com/manual/recallsetup.html), texts billed per 160-character segment
- [Weave: Phones](https://www.getweave.com/phones/), texting and missed call text beside phones
- [Weave: Reminders](https://www.getweave.com/weave-reminders/), reply sentiment on texts
- [Solutionreach](https://www.solutionreach.com/), two-way texting
- [Podium: Phones](https://www.podium.com/phones/), the AI Employee in conversations
- [PetDesk: Phones](https://petdesk.com/phones/), the comms inbox
- [Luma Health](https://www.lumahealth.io/), multichannel and multilingual messaging
