+++
title = "Digital Intake, Forms & Consent"
nav_title = "Digital Intake & Forms"
description = "Intake packets, medical history, insurance cards and ID, e-signature and consent, writing forms back to the PMS, tablets and kiosks, accessibility, language."
category = "Health Tech Industry"
order = 1934
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "intake", "forms", "e-signature", "consent", "accessibility", "data-model"]
+++

Every new patient fills out the same packet, and most returning patients fill out part of it again: demographics, the guarantor and insurance, a medical history (conditions, medications, allergies, for a dental patient their last cleaning and any anxiety about treatment, for a pet its vaccination history), an acknowledgment of the notice of privacy practices, the practice's financial policy, consents for treatment, texting and photography, and for some visits procedure-specific consents. On paper this was a clipboard and a staff member retyping it into the practice management system (PMS). Digital intake moves it to the patient's phone before the visit or a tablet in the waiting room, and the value is in what happens next: whether the answers land in the right fields of the chart, whether the signatures hold up, whether the insurance card is good enough to verify, and whether the patient who reads Spanish or uses a screen reader can complete it at all.

This chapter covers digital intake: how the platforms do it, the intake packet, insurance cards and ID, signatures and consent, writing forms back to the PMS, kiosks and tablets versus the patient's own phone, and accessibility and language access. It extends `documents`, `consents` and `coverages` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The law of electronic signatures (ESIGN, UETA, consumer consent, the evidence to keep) is the playbook's [Electronic Signatures](/docs/compliance/electronic-signatures), and this chapter covers only the health care layer; verifying the coverage the card describes is this volume's [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) chapter, and the kinds of consent and who may give them (minors, guardians, proxies, pet owners) are its [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization) chapter.

## How the Platforms Do It

As of October 2026, from public product pages, filings and documentation:

| Platform | Where patients fill it in | Write-back | Notable mechanics |
| --- | --- | --- | --- |
| **Phreesia** (medical) | The patient's own device at home or in the office, PhreesiaPad tablets and on-site Arrivals Kiosks | Consent forms "sent directly to the PM or EHR system" | Insurance captured at check-in and eligibility verified automatically; consents tailored by appointment type; payments at check-in; about 180 million patient visits in fiscal 2026 |
| **NexHealth** | Online forms by link | Demographics, medications, allergies and conditions sync to structured chart fields "within seconds," plus a PDF in the document center | Dentrix (including Ascend and Enterprise), Open Dental (including Cloud) and Eaglesoft |
| **Open Dental eClipboard** (PMS) | Tablets and patient devices, $45 per location per month | Native to the PMS | Talks to the office's eConnector on the local network |
| **Dental Intelligence** | Online forms | For Dentrix Enterprise, a write-back service that "doesn't require Dentrix Enterprise to be open and logged in" (version 11.0.20.935 or later) | Part of its engagement product |
| **Yapi** (dental) | Online forms | "Fully integrated with your practice management software" | Bundled with insurance verification "across 200+ insurances" |
| **Luma Health** (medical) | "Intake, forms, consents, and payment in one checklist" | Through its EHR integrations | Eligibility checks before scheduling |
| **Jotform** (general) | Web forms | None to a PMS | HIPAA features on Gold or Enterprise plans with a signed BAA |

The split that matters is between products that write **structured data** into the chart (NexHealth's medication and allergy fields) and those that file a **document** (a PDF of the signed form). A PDF satisfies the record-keeping need and leaves the front desk to retype the allergies; structured write-back saves the typing and takes on the risk of putting a wrong answer in the clinical record. Most mature products do both, which is the right answer.

## The Intake Packet

A packet is a set of forms chosen by appointment type, patient status and location: a new adult dental patient gets demographics, insurance, medical and dental history, the notice of privacy practices acknowledgment, the financial policy and consent to treatment; a returning patient gets "has anything changed?" with last year's answers prefilled; a child gets a guardian section; a veterinary client gets a pet history and a release for vaccines. Phreesia tailors consents "by appointment type"; the same rule decides every form.

Design points for the packet:

- **Prefill from the chart, and show what's on file.** A returning patient confirms a medication list rather than retyping it. Prefill shows the patient their own PHI, so the link that opens a prefilled form needs a second factor (birth date at least) before showing anything, and its token expires ([Minimum Necessary in a Text](/books/health-tech/patient-texting#minimum-necessary-in-a-text)).
- **Ask once per fact.** Demographics, insurance and history appear on several paper forms; the digital packet asks once and fills every form that needs the answer.
- **Version every form.** A form's questions and wording change; a submission records exactly which version was answered, because a medical history taken on last year's form is evidence of what the practice asked.
- **Send it early, not too early.** A packet sent at booking for an appointment six months out will be stale; the common pattern is a link with the confirmation a few days before, and a reminder the day before for anything incomplete ([Confirmations and Reminder Cadences](/books/health-tech/reminders-and-recall#confirmations-and-reminder-cadences)).
- **Mark completeness for the front desk.** The schedule shows who has finished, who has started and who will need a tablet at the desk.

## Insurance Cards and ID

The insurance card photo is the most valuable thing in the packet: it gives the payer, plan, member ID, group number and the payer's phone numbers, and its front and back are what the billing staff check when an eligibility response looks wrong. Phreesia captures insurance at check-in and verifies eligibility automatically; Yapi sells verification beside its forms.

- **Capture both sides at good resolution,** with guidance on glare and framing, and store them as a `documents` row of kind `insurance_card` linked from `coverages.card_document_id`.
- **Extract, then confirm.** OCR proposes the payer, member ID and group number; the patient or staff confirms; the confirmed values become the coverage. A guessed member ID that goes straight into an eligibility request just produces a rejection with a delay. How extraction and the eligibility check work is this volume's [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits#capturing-the-card) chapter.
- **Ask who the subscriber is.** The card names the subscriber, who is often not the patient (a child on a parent's dental plan), so the form asks the relationship and the subscriber's birth date, which the core `coverages` row needs.
- **Photo ID** checks that the patient is who they say, and helps with medical identity theft; a driver's license image is an identity document (`documents.kind = 'identity_document'`) with its own retention and access rules. It is not identity proofing in the NIST sense, which is this volume's [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity#identity-proofing-and-ial2) chapter.

## Signatures and Consent

Intake is where most of a practice's signatures happen: the privacy notice acknowledgment, the financial policy, consent to treatment, texting and email consent, photography consent, and for some visits procedure-specific informed consent. The general law and evidence are in the playbook ([The Law: ESIGN and UETA](/docs/compliance/electronic-signatures#the-law-esign-and-ueta), [What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds)): under ESIGN, a signature or record "may not be denied legal effect" solely because it's electronic (15 USC 7001(a)), and where a law requires information to be given to a consumer in writing, an electronic copy satisfies it only after the consumer's affirmative consent with the disclosures 15 USC 7001(c) lists ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)). The health care specifics:

- **Different documents, different weights.** The privacy notice acknowledgment isn't a consent: a provider must "make a good faith effort to obtain a written acknowledgment" of the notice and, if it isn't obtained, document the effort and the reason (45 CFR 164.520(c)(2)(ii)), so a refusal is recorded, not a barrier to care. A HIPAA authorization (to release records to a lawyer, to use a testimonial) has required elements and must be specific. Informed consent to a procedure is a clinical and state-law matter whose substance is the conversation, with the form as evidence. A texting consent is TCPA evidence ([The TCPA Healthcare Exemption](/books/health-tech/patient-texting#the-tcpa-healthcare-exemption)). Each is a `consents` row of its own `kind`, pointing at the exact wording in `disclosure_texts`, never one "I agree to everything" checkbox.
- **Who signed.** A parent signs for a child, a guardian for an adult in their care, an owner for a pet. The form captures the signer's name and relationship and the consent records `granted_by` and the representative (this volume's [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization#minors-proxies-and-personal-representatives) chapter covers who may sign for whom; the core model keeps `representative_name` on `consents`).
- **Whose device.** A signature on the patient's own phone and a signature on the practice's tablet are different ceremonies with different evidence ([Embedded or Remote: Whose Device](/docs/compliance/electronic-signatures#embedded-or-remote-whose-device)): on a shared tablet the practice must show that the right person was holding it.
- **Render and keep.** The signed form is rendered to a fixed document (the form version, the answers, the signature, the time, the device) and hashed, so what was signed can be shown years later, even if the form has changed since.

## Writing Forms Back to the PMS

Getting answers into the chart is an integration problem with a clinical edge. The mechanics of write-back (jobs with deadlines, conflicts, capabilities per PMS) are in [Writing Back](/books/health-tech/pms-integration#writing-back); what's specific to forms:

- **Demographics and insurance update the patient and coverage.** These are the PMS's records; the submission proposes changes and the write-back applies them, with the PMS winning conflicts. An address change from a form should not overwrite one the front desk entered an hour later.
- **Medical history is clinical data.** Medications, allergies and conditions written into structured fields become part of the legal medical record ([Clinical record versus engagement data](/books/health-tech/health-tech-business#the-core-data-model) in the core model). My rule: patient-reported answers go into the chart as patient-reported and are reviewed by a clinician before they're treated as reconciled; NexHealth's "within seconds" structured sync is convenient, and the review step is what keeps a patient's typo ("penicilin, mild?") from becoming the allergy record.
- **Every form also files as a document.** The rendered PDF goes to the PMS's document store whatever the structured write-back did, because it's the record of what the patient said, in their words.
- **Mapping is per PMS.** A medication field in Dentrix, Open Dental and Eaglesoft differ; the template's field maps per integration say where each answer goes, and fields with no mapping file only in the document.

## Kiosks, Tablets and Home

Three places, three sets of risks:

| Where | Strengths | Risks | Design |
| --- | --- | --- | --- |
| **The patient's phone, before the visit** | No waiting-room time; the patient has their cards and medication bottles at home | Links forwarded or opened by the wrong person; abandoned halfway | Second factor before prefill, save progress, completion reminders |
| **A practice tablet in the waiting room** | Works for patients who didn't finish at home | Shared device, PHI left on screen, cleaning between patients, theft | Kiosk mode, a session per patient, automatic reset on timeout, nothing cached, device management and remote wipe |
| **A kiosk at arrival** | Check-in, payment and forms in one stop (Phreesia's Arrivals Kiosks) | Same as tablets, plus a public location | As tablets, plus a privacy screen and placement away from the waiting room |

Phreesia's 10-K says its PhreesiaPads and kiosks are built and maintained by a contract manufacturer; for a smaller vendor, a practice's own iPads under a device-management profile are the usual answer. Either way the tablet is an endpoint holding PHI during each session, and the Security Rule's device and media controls apply ([What It Means for a System](/docs/compliance/hipaa#what-it-means-for-a-system)).

## Accessibility and Language Access

A patient who can't complete the intake can't get through the front door, so accessibility and language are part of the product, and for practices that take federal health care money, part of the law.

**Section 504 web accessibility.** HHS's Section 504 rule requires recipients of its federal financial assistance to make web content and mobile apps, including those "provided through contracts," conform to WCAG 2.1 Level A and AA (45 CFR 84.84). As the CFR text reads in October 2026, compliance is due by May 11, 2027 for recipients with 15 or more employees and May 10, 2028 for smaller ones. A vendor's intake forms are the practice's web content for this purpose, so practices will ask vendors for conformance evidence. Public hospitals and clinics also fall under the Justice Department's ADA Title II web rule (28 CFR 35.200), whose dates moved by a year to April 26, 2027 and 2028 under an April 2026 order.

**Section 1557 language access.** The 2024 Section 1557 rule requires covered health programs to give a notice of the availability of free language assistance and auxiliary aids, in English and at least the 15 most common languages spoken by people with limited English proficiency in the state, with specified communications that include "application and intake forms," consent forms and the notice of privacy practices (45 CFR 92.11), due by July 5, 2025 (92.1). Machine translation of text that is "critical to the rights, benefits, or meaningful access" of a patient, or where accuracy is essential, "must be reviewed by a qualified human translator" (92.201(c)(3)). As of October 2026, a federal court has vacated the rule's provisions on gender identity (*Tennessee v. Kennedy*, S.D. Miss., October 22, 2025), and HHS published a notice of that vacatur on June 2, 2026; the language access provisions remain in the CFR. For a forms product that means:

- **Forms in the patient's language,** chosen from `patients.preferred_language`, with the tagline notice attached to intake communications.
- **Human-reviewed translations** of consent forms and anything clinical, recorded per form version with who reviewed them; machine translation alone is a draft.
- **Accessible controls:** labels, keyboard and screen reader support, error messages that say what's wrong, no time limits that log a slow patient out mid-form without warning, and signature methods that don't depend on drawing with a finger.

## How to Build It

The chapter adds form templates, submissions and answers. Rendered forms are `documents`, signatures are `consents` with their wording in `disclosure_texts`, insurance becomes `coverages`, and write-back goes through `writeback_requests` ([How to Build It](/books/health-tech/pms-integration#how-to-build-it)):

```sql
CREATE TABLE form_templates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  key                 TEXT NOT NULL,             -- 'adult_medical_history', 'financial_policy'
  version             INT NOT NULL,
  locale              TEXT NOT NULL,             -- BCP 47
  kind                TEXT NOT NULL CHECK (kind IN ('demographics', 'insurance', 'medical_history',
                        'dental_history', 'pet_history', 'npp_acknowledgment', 'financial_policy',
                        'consent', 'questionnaire')),
  fields              JSONB NOT NULL,            -- questions, types, validation, conditions
  field_maps          JSONB NOT NULL DEFAULT '{}',  -- per PMS vendor: field key -> PMS field
  consent_kind        TEXT,                      -- the consents.kind a signature on it creates
  disclosure_text_id  UUID REFERENCES disclosure_texts (id),  -- the wording a signer agrees to
  translation_of_id   UUID REFERENCES form_templates (id),
  translation_reviewed_by TEXT,                  -- the qualified human reviewer, for 92.201(c)(3)
  wcag_reviewed_at    TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  UNIQUE (organization_id, key, version, locale)
);

CREATE TABLE form_submissions (                  -- one form, requested and answered
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID REFERENCES patients (id),       -- null for a not-yet-created new patient
  appointment_id      UUID REFERENCES appointments (id),
  form_template_id    UUID NOT NULL REFERENCES form_templates (id),
  packet_id           UUID NOT NULL,             -- the forms sent together
  status              TEXT NOT NULL CHECK (status IN ('requested', 'in_progress', 'submitted',
                        'reviewed', 'filed', 'expired')),
  where_completed     TEXT CHECK (where_completed IN ('patient_device', 'practice_tablet', 'kiosk',
                        'staff_entered')),
  signer_name         TEXT,
  signer_relationship TEXT,                      -- 'self', 'parent', 'guardian', 'owner'
  signature_evidence  JSONB,                     -- method, time, device, session, IP
  rendered_document_id UUID REFERENCES documents (id),     -- the fixed, hashed copy
  consent_id          UUID REFERENCES consents (id),       -- when the form is a consent
  submitted_at        TIMESTAMPTZ,
  reviewed_by         UUID,                      -- clinician review of history answers
  reviewed_at         TIMESTAMPTZ
);

CREATE TABLE form_answers (                      -- one answer, and where it went
  submission_id       UUID NOT NULL REFERENCES form_submissions (id),
  field_key           TEXT NOT NULL,
  value               JSONB NOT NULL,
  prefilled_value     JSONB,                     -- what the chart said when shown
  changed_by_patient  BOOLEAN NOT NULL,
  target              TEXT,                      -- 'patients.preferred_language', 'allergies', 'coverages'
  applied_status      TEXT NOT NULL DEFAULT 'pending' CHECK (applied_status IN ('pending',
                        'applied', 'needs_review', 'rejected', 'document_only')),
  writeback_request_id UUID REFERENCES writeback_requests (id),
  PRIMARY KEY (submission_id, field_key)
);
```

Notes on the sketch:

- **Templates are versioned per locale,** with translations linked to their source and the human reviewer recorded, so "which Spanish consent did this patient sign, and who checked the translation?" is one query.
- **Consent forms point at their wording.** A template that creates a consent names the `disclosure_texts` row a signer agrees to; signing writes a `consents` row (with `captured_via = 'web_form'` or `'tablet'`, `granted_by` and the representative) and a rendered document, and links both from the submission.
- **Answers keep the prefill.** Storing what the chart said beside what the patient answered is what makes "changed by patient" reviewable and lets the write-back send only real changes.
- **Clinical answers wait for review.** History fields map to `allergies`, `conditions` and `medication_requests` targets with `applied_status = 'needs_review'` until a clinician reconciles them; demographics and insurance apply directly, subject to PMS conflicts.
- **Every submission files a document,** the fixed rendering with its hash, regardless of what structured fields were applied.
- **Insurance answers create coverages,** with the card images as an `insurance_card` document and the eligibility check as the next step.
- **Events:** `form_packet.sent`, `form.submitted`, `form.reviewed`, `consent.recorded` and `coverage.captured` feed reminders for incomplete packets, the front desk's schedule view, eligibility checks and the PMS write-back.

## Auditing

- **What each patient was asked and answered, as rendered and signed,** with the form version and locale, for disputes, malpractice defense and payer audits.
- **Signature evidence:** who signed, in what relationship, on whose device, when, and the consent and wording it created.
- **Where each answer went:** applied to which field, written back by which request, or left for review, and who reviewed it.
- **Translation and accessibility reviews** per template version, which practices will need for Section 1557 and Section 504 questions.
- **Access to submissions and card images,** which are PHI and identity documents ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Choose the packet by appointment type, patient status and location,** ask each fact once, and prefill from the chart behind a second factor.
- **Version forms per locale** and record the exact version answered.
- **Make each kind of signature its own consent** with its own wording, signer and relationship, never one blanket checkbox.
- **Render and hash every signed form,** and file it as a document in the PMS whatever else is written back.
- **Write demographics and insurance back as proposals the PMS can refuse,** and hold patient-reported clinical answers for clinician review.
- **Capture both sides of the insurance card,** extract and confirm, and record subscriber and relationship.
- **Run tablets as kiosks:** a session per patient, reset on timeout, nothing cached, under device management.
- **Build to WCAG 2.1 AA** and offer forms in patients' languages with human-reviewed translations of consents and clinical content.

## References

**Law and regulation**

- [Cornell LII: 45 CFR 164.520](https://www.law.cornell.edu/cfr/text/45/164.520), the good faith effort to obtain a written acknowledgment of the privacy notice
- [Cornell LII: 15 USC 7001](https://www.law.cornell.edu/uscode/text/15/7001), ESIGN's legal effect rule and consumer consent requirements
- [Cornell LII: 45 CFR 84.84](https://www.law.cornell.edu/cfr/text/45/84.84), WCAG 2.1 AA for web content and apps of HHS recipients, including through contracts, and the compliance dates
- [Cornell LII: 28 CFR 35.200](https://www.law.cornell.edu/cfr/text/28/35.200), the ADA Title II web rule and its amended dates
- [Cornell LII: 45 CFR 92.11](https://www.law.cornell.edu/cfr/text/45/92.11), the notice of availability of language assistance, the 15 languages and the communications it accompanies
- [Cornell LII: 45 CFR 92.1](https://www.law.cornell.edu/cfr/text/45/92.1), compliance dates for the 2024 Section 1557 rule
- [Cornell LII: 45 CFR 92.201](https://www.law.cornell.edu/cfr/text/45/92.201), human review of machine translation and interpreter rules
- [LeadingAge: HHS no longer enforcing gender identity provisions](https://leadingage.org/hhs-no-longer-enforcing-prohibition-against-gender-identity-discrimination/), *Tennessee v. Kennedy* (October 22, 2025) and the June 2, 2026 notice of vacatur

**Vendors and filings**

- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), PhreesiaPads and Arrivals Kiosks, the contract manufacturer, about 180 million patient visits
- [Phreesia: Patient intake](https://www.phreesia.com/patient-intake/), intake on patient devices, insurance capture and eligibility, consents by appointment type sent to the PM or EHR
- [NexHealth: Online forms](https://www.nexhealth.com/features/online-forms), structured write-back of history and a PDF copy, supported PMSs
- [Open Dental: Fees](https://opendental.com/site/fees.html), eClipboard's price
- [Open Dental: eConnector](https://www.opendental.com/manual/econnector.html), the eServices Listener for eClipboard on the local network
- [Dental Intelligence: System requirements](https://intercom.help/dental-intel/en/articles/6170750-dental-intelligence-system-requirements), forms write-back for Dentrix Enterprise
- [Yapi](https://yapiapp.com/), forms integrated with the PMS and insurance verification
- [Luma Health](https://www.lumahealth.io/), the intake checklist
- [Jotform: HIPAA](https://www.jotform.com/hipaa/), HIPAA features by plan and BAAs
