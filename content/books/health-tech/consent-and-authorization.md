+++
title = "Consent, Authorization & Proxies"
nav_title = "Consent & Proxies"
description = "The many consents of health care: HIPAA authorizations, consent to treat, financial and telehealth consent, Part 2, personal representatives, minors and pet owners."
category = "Health Tech Industry"
order = 1917
part = "Rules of the Record"
tags = ["health-tech", "consent", "authorization", "proxies", "minors", "data-model"]
+++

"Did the patient consent?" has no single answer in health care, because the word covers at least seven different legal acts, each with its own law, form, signer and lifespan. A new patient at a dental office in one visit signs a consent to treat, acknowledges the notice of privacy practices, accepts the financial policy and assigns insurance benefits to the practice, opts in to text reminders, and perhaps authorizes the practice to send records to a specialist's office that isn't treating them yet. A teenager's mother signs some of those for her, but may not be the one who signs for certain services. A daughter with a health care power of attorney signs for her father. A dog's owner signs for the dog.

Most of what a practice does with records needs **no** consent under HIPAA, because treatment, payment and operations are permitted ([TPO, Minimum Necessary and Incidental Disclosures](/books/health-tech/hipaa-in-practice#tpo-minimum-necessary-and-incidental-disclosures)). The consents that remain are the ones the law, the payer, the state or the clinician require, and they fail in software in predictable ways: one checkbox standing in for five consents, a signature with no record of who signed or in what capacity, an expired authorization still honored, a revoked one still in the outbound queue, and a parent's proxy seeing what a state says only the minor may see. This chapter sorts the kinds, then builds the record that holds them.

## How the Platforms Do It

How intake and forms vendors describe consent capture, as of October 2026:

| Vendor | What its public pages describe |
| --- | --- |
| **Phreesia** | "Customize consent forms by appointment type and capture electronic signatures," with forms sent to the PM or EHR system; registration, medical history, demographics and consents completed from the patient's own device |
| **Dental Intelligence** | Forms by text or email link, mobile app or in-office kiosk, sent automatically to the patients who need them before the appointment; staff can countersign after submission; data syncs to the practice management system, though "write-back capabilities vary across PMS integrations" |
| **Jotform** | "HIPAA-enabled forms" with encrypted submissions and a signed BAA for customers who enable HIPAA features (pointing to its Gold or Enterprise plans), consent forms signed by drawing or typing a signature |

Two patterns. **Consent is attached to the appointment type,** because a new patient exam, a surgical procedure and a telehealth visit need different forms, so the forms engine keys off the schedule (the forms themselves are Digital Intake, Forms & Consent; this chapter is the consent records they produce). **Write-back is the weak link.** A signed form usually lands in the PMS or EHR as a scanned document, not as structured consent, so the system of record knows a PDF exists, not what it permits; the vendor that captured it holds the only structured version.

## The Kinds of Consent

| Kind | Governing law | Who signs | Lifespan | What a system does with it |
| --- | --- | --- | --- | --- |
| **Consent to treat** (general) | State law and professional standards | Patient or personal representative | Per practice policy, often renewed periodically | Gate for scheduling the first visit |
| **Informed consent** for a procedure | State law, clinical standard of care | Patient or representative, with the clinician | Per procedure | A clinical document; the system stores and retrieves it |
| **Notice of privacy practices acknowledgment** | 45 CFR 164.520 | Patient or representative | Until the notice materially changes | Good-faith effort to obtain; record the version |
| **Financial policy and assignment of benefits** | Contract law, payer rules | Guarantor or patient | Until revoked or policy changes | Lets the practice bill the payer and collect the balance |
| **HIPAA authorization** | 45 CFR 164.508 | Individual or personal representative | Expiration date or event | Gate for any use or disclosure outside TPO and other permissions |
| **Part 2 consent** | 42 CFR 2.31 | Patient (with state-law rules for minors) | Expiration date or event, "end of treatment" or "none" for TPO | Gate for SUD records |
| **Telehealth consent** | State law (for example California) | Patient | Per state rule | Gate for a video or phone visit |
| **Communication consent** | TCPA, CAN-SPAM, carrier rules | The contact | Until revoked | Gate for texts and calls ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)) |
| **Consumer health data consent** | Washington, Nevada, Connecticut laws | The consumer | Until withdrawn; Washington sale authorizations one year | Gate for collection, sharing and sale outside HIPAA ([Consumer Health Data Laws](/books/health-tech/state-health-privacy#consumer-health-data-laws)) |
| **Research consent** | Common Rule, FDA | Subject or legally authorized representative | Study duration | Clinical Trials covers eConsent |

HIPAA also permits, but doesn't require, a covered entity to obtain the individual's consent for its own TPO uses (45 CFR 164.506(b)); a practice that does so has a policy choice, not a legal requirement, and the system should label it that way so nobody mistakes it for an authorization.

## Authorization Under HIPAA

An **authorization** is the patient's signed permission for a use or disclosure HIPAA doesn't otherwise allow: sending records to a life insurer or an employer, a marketing communication paid for by a third party, a sale of PHI, most uses of psychotherapy notes, and disclosures to a lawyer who isn't acting under a subpoena or the patient's access right. Its rules (45 CFR 164.508) are specific enough to validate in code:

- **Core elements:** a specific description of the information; who may disclose it; who may receive it; each purpose ("at the request of the individual" suffices when the patient initiates it and gives no other); an expiration date or event; and the signature and date, with the representative's authority described if a representative signs.
- **Required statements:** that the patient may revoke in writing and how; whether treatment, payment, enrollment or eligibility may be conditioned on signing (generally they may not); and that information disclosed may be redisclosed by the recipient and no longer protected.
- **Plain language,** and the patient gets a copy of the signed form.
- **No compound authorizations:** an authorization can't be combined with another document (with narrow research exceptions), so it can't be clause 14 of the intake packet.
- **No conditioning** of treatment, payment, enrollment or eligibility on signing, with narrow exceptions.
- **Revocation** in writing at any time, effective except where the entity already acted in reliance on it.
- **Special cases:** psychotherapy notes need their own authorization for almost any use; a marketing authorization must say if third-party remuneration is involved; a sale authorization must say the disclosure will result in remuneration.

The third-party release is where practices meet authorizations most, and where it overlaps the right of access: a patient directing their records to another person under 164.524 is exercising access (cost-based fee limits apply to their own copy, not to third-party releases after *Ciox*), while a lawyer or insurer presenting a signed authorization is requesting a disclosure the practice may make ([The Right of Access](/books/health-tech/hipaa-in-practice#the-right-of-access)). Both produce records: an access request in one case, an authorization plus an accounting-exempt disclosure in the other.

## Consent to Treat and the Paperwork Packet

The first visit's packet bundles documents with different laws and lifespans, and the software should keep them apart even when the patient signs them on one tablet:

- **Consent to treat** authorizes the practice to examine and provide routine care. State law and professional standards govern it; **informed consent** for a specific procedure (an extraction, a surgery, a sedation) is a clinical conversation documented by the clinician, and the system's job is to store and retrieve the signed form against the procedure, not to stand in for the conversation.
- **The notice of privacy practices acknowledgment** records that the patient received the current notice. A covered provider makes a good-faith effort to get it in writing; its absence doesn't block treatment, and the record must say which version was acknowledged, because notices changed by February 16, 2026 ([The Notice of Privacy Practices](/books/health-tech/hipaa-in-practice#the-notice-of-privacy-practices)).
- **The financial policy and assignment of benefits** commit the guarantor to the balance and direct the payer to pay the practice. They are signed by the person who pays, who may not be the patient (a parent, a spouse, the owner of a pet), and the revenue cycle part reads them.
- **Telehealth consent** is state law. California, for example, requires the provider initiating telehealth to inform the patient about it and obtain verbal or written consent before delivering care that way, and to document it (Business and Professions Code 2290.5). Verbal consent is valid there, so the record type must allow a staff attestation of a verbal consent, not only a signature.

Electronic signatures carry these documents. The general rules (ESIGN and UETA, the evidence a signature needs, embedded vs remote signing) are the playbook's ([What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds)); the health care twist is that each document in the packet is its own signature event, with its own form version and signer capacity, so a kiosk session that signs five documents produces five records. A new version of a form doesn't invalidate signatures on the old one unless the practice's policy or the law says so ([Re-acceptance on Change](/docs/compliance/electronic-signatures#re-acceptance-on-change)).

## Part 2 Consent

SUD records from a Part 2 program need written consent for most disclosures, and the 2024 rule made that consent workable for ordinary care: one consent can cover all future treatment, payment and operations, with recipients described as a class, and an expiration of "end of the treatment" or "none" ([Part 2: Substance Use Disorder Records](/books/health-tech/state-health-privacy#part-2-substance-use-disorder-records)). The elements (42 CFR 2.31) map to fields: patient name; who may disclose; a specific description of the information; recipients; purpose; the right to revoke and how; expiration; signature (electronic signatures allowed where other law permits); date; and, for a TPO consent, statements about redisclosure and the consequences of refusing. SUD counseling notes need a separate consent that can only be combined with other counseling-note consents.

Two things make Part 2 consent different in software. **The consent travels with the data:** each disclosure must carry the federal notice and a copy of the consent or a clear explanation of its scope (2.32). And **a minor's consent may be the only one that counts:** where a minor may obtain SUD treatment alone under state law, only the minor may consent to disclosure, even to a parent for payment (2.14).

## Minors, Proxies and Personal Representatives

HIPAA's **personal representative** is someone with authority under applicable law to make health care decisions for the individual, and a covered entity treats them as the individual for the purposes of that authority (45 CFR 164.502(g)). Who that is:

- **Adults:** a health care power of attorney or proxy, or a court-appointed guardian. A financial power of attorney alone isn't health care authority. A family member with no legal authority may still be told information relevant to their involvement in care in limited cases, which is a disclosure rule, not representation. Senior living has the same split between financial and health authority ([Families, Representatives and the Portal](/books/property-tech/senior-living#families-representatives-and-the-portal)).
- **Minors:** generally a parent or guardian, but not for services a minor may lawfully consent to alone, where state or other law decides whether the parent may see the information (164.502(g)(3)). Texas now requires covered entities to give parents complete and unrestricted access to a minor's electronic record unless law or a court order restricts it ([Minors and Their Records](/books/health-tech/state-health-privacy#minors-and-their-records)).
- **Deceased patients:** an executor, administrator or other person authorized to act for the estate.
- **Exceptions for safety:** a covered entity may decline to treat someone as a personal representative if it reasonably believes the person has abused or neglected the patient or could endanger them, and judges that recognizing them isn't in the patient's best interest (164.502(g)(5)).

Portal **proxy access** is how most representatives meet the system. The common design gives a parent full proxy access to a young child's record, narrows it at an adolescent age threshold (scheduling, billing and immunizations, without confidential encounters), and ends it at majority unless the now-adult patient grants it again; adult proxies are granted by the patient or by a verified legal document. The thresholds and categories vary by state and organization, which is why they are rules, not constants. Patient Portals & Patient Access Apps covers the portal itself.

**Veterinary practices** invert the model: the patient is an animal and the **client** (owner) is the person who consents, pays and controls disclosure. California's veterinary confidentiality statute lets a veterinarian disclose information about an animal patient or its client on the client's written or witnessed verbal authorization, or an authorization the client sends electronically (Business and Professions Code 4857). The core model's `guarantors` row is the client, and consent records point at the client, never at the animal.

## The Consent Record

Across all of these kinds, a usable consent record answers the same questions: **what** was agreed (the form and version, its scope), **who** agreed and **in what capacity** (patient, parent, health care agent, guardian, executor, owner), **for whom** (the patient), **for what purposes and recipients**, **when** it starts and ends, **how** it was captured (signature, verbal with a staff attestation, portal click), and **whether it's still in force** (revoked, expired, superseded). Systems that model consent as a boolean on the patient can't answer four of those, and the missing ones are the ones an auditor, a court or a parent asks.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) (`patients`, `guarantors`, `contacts`, `consents`, `disclosure_texts`, `documents`, `disclosures`). The core `consents` row already holds the kind, decision, scope, who granted it, the exact wording shown (`disclosure_text_id`), the signed form, how it was captured, and its effective, expiry and revocation times. This chapter adds the kinds the core list lacks, the signer's capacity and the grant behind it, the authorization fields HIPAA and Part 2 require, and the representatives themselves.

```sql
ALTER TABLE disclosure_texts             -- core: versioned wording; consent forms are versions here
  ADD COLUMN organization_id UUID REFERENCES organizations (id),  -- null: a platform-wide text
  ADD COLUMN name            TEXT,       -- 'New patient consent', 'Records release'
  ADD COLUMN jurisdiction    TEXT;       -- ISO 3166-2 for state-specific forms (telehealth, minors)

ALTER TABLE consents
  DROP CONSTRAINT consents_kind_check,
  ADD CONSTRAINT consents_kind_check CHECK (kind IN ('treatment', 'informed_consent', 'financial',
    'assignment_of_benefits', 'npp_acknowledgment', 'hipaa_authorization', 'texting', 'calling',
    'email', 'marketing', 'telehealth', 'recording', 'proxy_access', 'sud_part2',
    'sud_counseling_notes', 'consumer_health_data', 'research')),
  ADD COLUMN signer_contact_id  UUID REFERENCES contacts (id),   -- who actually signed
  ADD COLUMN signer_capacity    TEXT NOT NULL DEFAULT 'self' CHECK (signer_capacity IN ('self',
                                  'parent', 'guardian', 'health_care_agent', 'executor',
                                  'client_owner', 'guarantor', 'other_legal')),
  ADD COLUMN representative_id  UUID,                            -- personal_representatives, below
  ADD COLUMN attested_by        UUID,                            -- staff member, for verbal consent
  ADD COLUMN recipients         JSONB,                           -- named, or a class ("my treating providers")
  ADD COLUMN purposes           TEXT[],
  ADD COLUMN remuneration_disclosed BOOLEAN,                     -- marketing and sale authorizations
  ADD COLUMN expires_on_event   TEXT,                            -- 'end_of_treatment', 'none'
  ADD COLUMN revocation_document_id UUID REFERENCES documents (id),  -- the written revocation
  ADD COLUMN superseded_by      UUID REFERENCES consents (id),
  ADD CONSTRAINT authorization_expires CHECK (kind NOT IN ('hipaa_authorization', 'sud_part2',
    'sud_counseling_notes') OR expires_at IS NOT NULL OR expires_on_event IS NOT NULL);

CREATE TABLE personal_representatives (  -- who may act for a patient, how far, on what evidence
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  representative_contact_id UUID NOT NULL REFERENCES contacts (id),
  guarantor_id      UUID REFERENCES guarantors (id),  -- when the representative also pays
  authority         TEXT NOT NULL CHECK (authority IN ('parent', 'guardian', 'health_care_poa',
                      'health_care_proxy', 'executor', 'patient_granted_proxy', 'client_owner')),
  scopes            TEXT[] NOT NULL,      -- 'clinical', 'billing', 'scheduling', 'messaging'
  excluded_categories TEXT[] NOT NULL DEFAULT '{}',  -- sensitivity categories hidden by rule
  evidence_document_id UUID REFERENCES documents (id), -- the POA, court order, birth certificate
  verified_by       UUID,
  verified_at       TIMESTAMPTZ,
  rule_evaluation_id UUID,                -- the state rule that set the scopes (age thresholds)
  status            TEXT NOT NULL CHECK (status IN ('active', 'suspended_safety', 'ended')),
  valid_during      TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (patient_id WITH =, representative_contact_id WITH =, authority WITH =,
    valid_during WITH &&)
);
```

Design decisions:

- **One row per legal act.** Five documents signed in one kiosk session are five `consents` rows, each pointing at its own `disclosure_texts` version and signed `documents` row; nothing derives "consented" from a different document.
- **Verbal consent is a capture method, not a missing signature.** Where state law accepts it (California's telehealth consent), `captured_via = 'phone'` with `attested_by` names the staff member who documented it.
- **Capacity is a column, and authority is a record.** A signature by a parent, an agent or an executor points at the `personal_representatives` grant it relied on, verified against a document, so "who signed for this patient, and could they?" is a join.
- **Validation lives in the form kind.** A HIPAA authorization without an expiration, a purpose or the required statements can't be saved; a Part 2 counseling-notes consent can't share a form with anything else; a self-pay or marketing authorization records whether remuneration was disclosed.
- **Revocation and expiry are checked at use, not at signing.** The disclosure path (a records release, an outbound message, an API grant) asks for an in-force consent at the moment of use and records which one it relied on in the `audit_events` row for the disclosure (authorized disclosures aren't in the 164.528 accounting) ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **Representative scopes come from rules.** Adolescent thresholds, confidential categories and state parental access mandates set `scopes` and `excluded_categories`; when a patient turns the threshold age, a scheduled job ends one grant and opens another, rather than editing it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Pet owners are clients, not patients.** In veterinary tenants the signer is the client, who is also the `guarantors` row, with `signer_capacity = 'client_owner'` and the core's `granted_by = 'owner'`, and the patient is the animal.

## Auditing

- **Every consent with its exact form version,** signer, capacity, capture method, evidence and dates, and every revocation with the written request.
- **Every disclosure that relied on a consent,** with the consent it relied on and whether it was in force.
- **Representative grants** with their evidence, verifier, scopes, the rule that set them, suspensions for safety and their reasons.
- **Proxy access** by each representative, logged like any other read ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Form versions** as published, so a dispute about what a patient was told resolves to the text on that date.
- **Retention:** HIPAA keeps signed authorizations six years (45 CFR 164.530(j)); state medical record retention often runs longer for consents filed in the chart.

## What This Means for the System You Build

- **Model consent as many kinds of record,** never one checkbox, each with its own law, signer, scope and lifespan.
- **Validate HIPAA authorizations and Part 2 consents** against their required elements before they can be saved, and keep them out of the intake packet's other documents.
- **Store who signed and in what capacity,** backed by a verified representative grant.
- **Check consent at the moment of use,** honoring expiry and revocation, and record which consent each disclosure relied on.
- **Drive proxy access from rules** per state and sensitivity category, with scheduled transitions at age thresholds.
- **Let verbal consent be recorded** where state law allows it, with the staff attestation.
- **Treat pet owners as the consenting party** in veterinary tenants.

## References

**Regulations and statutes**

- [LII: 45 CFR 164.508, Authorization required](https://www.law.cornell.edu/cfr/text/45/164.508), core elements, required statements, plain language, copy, compound authorizations, conditioning, revocation, psychotherapy notes, marketing and sale
- [LII: 45 CFR 164.502, Uses and disclosures: general rules](https://www.law.cornell.edu/cfr/text/45/164.502), personal representatives, minors and state law, the abuse and endangerment exception
- [LII: 45 CFR 164.524, Access of individuals](https://www.law.cornell.edu/cfr/text/45/164.524), directing copies to a third party
- [eCFR: 45 CFR Part 164, Subpart E (Privacy Rule)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E), 164.506 TPO and optional consent, 164.520 notice and acknowledgment, 164.530 documentation retention
- [LII: 42 CFR 2.31, Consent requirements](https://www.law.cornell.edu/cfr/text/42/2.31), Part 2 consent elements, the single TPO consent, SUD counseling notes
- [LII: 42 CFR 2.32, Notice and copy of consent to accompany disclosure](https://www.law.cornell.edu/cfr/text/42/2.32), the notice and the consent copy with each disclosure
- [LII: 42 CFR 2.14, Minor patients](https://www.law.cornell.edu/cfr/text/42/2.14), consent by the minor alone or with a parent per state law
- [California Business and Professions Code 2290.5](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=2290.5), telehealth consent, verbal or written, documented
- [California Business and Professions Code 4857](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4857), veterinary records disclosure on the client's written, witnessed verbal or electronic authorization
- [Texas SB 1188 (89th Legislature), enrolled text](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), parental access to minors' electronic health records

**In practice**

- [Phreesia: Patient intake](https://www.phreesia.com/solutions/patient-intake/), consent forms by appointment type, electronic signatures, forms sent to the PM or EHR
- [Dental Intelligence: Online dental forms](https://www.dentalintel.com/online-dental-forms/), delivery by link, app or kiosk, staff countersignature, PMS sync with write-back varying by integration
- [Jotform: HIPAA compliant forms](https://www.jotform.com/hipaa/), encrypted submissions, BAA with HIPAA features, e-signed consent forms
