+++
title = "HIPAA in Practice"
description = "HIPAA where health software meets it: who is covered, TPO and minimum necessary, right of access, marketing, texting and email, breaches and OCR enforcement."
category = "Health Tech Industry"
order = 1914
part = "Rules of the Record"
tags = ["health-tech", "hipaa", "privacy", "right-of-access", "breach-notification", "ocr"]
+++

HIPAA is the rule every health tech engineer has heard of and few have read. The playbook's [HIPAA](/docs/compliance/hipaa) covers the parts that apply to any system: who is a covered entity or a business associate, the BAA chain, the three rules, what the Security Rule asks of a design, breach deadlines and de-identification. This chapter is the industry depth on top of it: how the rules land on the products health software actually ships (scheduling, reminders, texting, intake, portals, billing), where practices and their vendors get it wrong, and what the regulator has actually enforced.

Three facts frame everything below. **HIPAA is mostly permission, not prohibition.** A provider may use and disclose PHI for treatment, payment and health care operations without asking the patient, which is why a reminder text, a claim and a recall list are all lawful without an authorization; the rule bites at the edges (marketing, sale, other purposes) and on the patient's rights. **The patient's rights are where small practices get fined.** The most common enforcement action OCR has announced since 2019 isn't a hack; it's a practice that took months to hand a patient their own records. **The vendor is in the blast radius.** A patient engagement platform, a forms vendor or a clearinghouse is a business associate, directly liable under the Security Rule and for the breaches it causes, and the one that holds the data of thousands of practices at once.

## How the Platforms Do It

What the infrastructure under health software publishes about BAAs, as of October 2026. These are the agreements every vendor in this book signs upstream, so their limits become the vendor's product limits:

| Provider | How the BAA is offered | What it covers | What it leaves to the customer |
| --- | --- | --- | --- |
| **Microsoft** | "Available through the Microsoft Online Services Data Protection Addendum by default" to customers who are covered entities or business associates; Microsoft won't sign a customer's own BAA | A published list of in-scope services (Azure, Office 365 services including Exchange Online and Teams, Dynamics 365, Power Platform and others) | "Using Microsoft services doesn't on its own achieve HIPAA compliance" |
| **Google Workspace** | Accepted electronically in the Admin console by a super admin, with "the same legal effect" as paper | Only services on the HIPAA Included Functionality list; third-party add-ons and Additional Google Services are outside it | Deciding whether HIPAA applies; no PHI in Workspace without the BAA; sharing settings |
| **Twilio** | A Business Associate Addendum to its terms, requiring the Security or Enterprise Edition | "HIPAA Eligible Products and Services" only; other products only where no PHI can flow | A "shared responsibility": its architecture guide lists the customer's side |
| **Weave** | Its security page says the product "has been designed with features to support you in complying with HIPAA" | TLS 1.2+ in transit; data "encrypted at rest using AES-128-bit symmetric encryption keys or better"; hosted on Google Cloud, whose ISO 27001 and SOC 2 Type 2 assessments it cites | The practice's own policies, per its HIPAA help article |

The pattern repeats down the chain: **the BAA covers a list, not a company.** A messaging vendor whose SMS provider signs only for eligible products, whose email provider covers only listed services, and whose analytics or AI tool has no BAA at all must keep PHI out of everything off the list, which is the playbook's inventory rule ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)). Being a business associate, what a BAA must say and the questionnaire every practice group sends are [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#being-a-business-associate).

## Covered, Associate, or Neither

The playbook's rule is that the data's path, not its content, decides ([Who It Applies To](/docs/compliance/hipaa#who-it-applies-to)). In this industry that produces some cases worth knowing by name:

- **Practices that bill insurance electronically are covered entities.** A dental, optometry, PT or physician office that sends a single electronic claim or eligibility check is a covered health care provider for everything it does, including its cash patients. Almost every practice in Part 5 is one.
- **Veterinary clinics are not.** HIPAA covers human health care; a vet's records are protected by state veterinary confidentiality law instead (California's Business and Professions Code section 4857 bars a veterinarian from disclosing information about an animal patient or its client except under listed circumstances, starting with the client's written or witnessed verbal consent). The pet owner's card number, phone and address are still personal data under general privacy and payment rules. Veterinary Practice owns the details.
- **Cash-only and direct-to-consumer care can fall outside HIPAA,** if the provider sends no standard electronic transactions, and then lands under state consumer health data laws and the FTC instead ([State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy)). Senior living shows the same split for assisted living operators ([Clinical Records and the HIPAA Boundary](/books/property-tech/senior-living#clinical-records-and-the-hipaa-boundary)).
- **The patient engagement vendor is a business associate,** because it receives appointments, names and balances from the practice's PMS to send reminders on the practice's behalf. So are the PMS vendor hosting a cloud database, the clearinghouse (which is also a covered entity in its own right), the forms vendor, the call recording service and the AI scribe.
- **An app the patient chooses is neither,** even when it holds the same record. When a patient directs their records to an app through a portal or API, the provider is fulfilling the right of access; once the app holds the data, HIPAA no longer governs it, and the FTC's Health Breach Notification Rule and state laws do ([The FTC Health Breach Notification Rule](/books/health-tech/vendor-compliance-posture#the-ftc-health-breach-notification-rule)).

My rule for a vendor: **assume every tenant is a covered entity and every byte from its systems is PHI,** including the vet clinics, because one codebase serves all of them and state law asks for most of the same controls anyway.

## TPO, Minimum Necessary and Incidental Disclosures

A covered entity may use and disclose PHI for its own **treatment, payment and health care operations** without the patient's authorization, and may disclose to another provider for that provider's treatment (45 CFR 164.506). Nearly everything a practice platform does lives here: appointment reminders and confirmations, recall, eligibility checks, claims and statements, quality reporting, and the business associate work that supports them.

**Minimum necessary** (45 CFR 164.502(b)) narrows it: covered entities and business associates must make reasonable efforts to limit PHI to the minimum necessary for the purpose. It doesn't apply to disclosures to a provider for treatment, to the individual, under an authorization, to HHS, or as required by law. For software the consequences are concrete:

- **A reminder carries the appointment, not the reason.** "You have an appointment with Dr. Lee on Tuesday at 2:00" serves treatment; "your follow-up for your positive biopsy" adds nothing the reminder needs.
- **Roles see what their job needs.** Front desk staff need schedules, demographics and balances; billing staff need codes and payer data; neither needs psychotherapy notes, which have their own authorization rule ([Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization#authorization-under-hipaa)).
- **Integrations take fields, not tables.** A reminder vendor syncing the whole chart because the PMS export was easier is the integration version of over-disclosure.

**Incidental disclosures,** such as a patient overhearing the front desk or seeing a name on a sign-in sheet, aren't violations if reasonable safeguards and minimum necessary were applied. The software equivalent is a waiting room display that shows first names and initials, not full names and procedures.

## The Right of Access

A patient has a right to inspect and get a copy of the PHI in their **designated record set**: the medical and billing records a provider maintains, and any other records used to make decisions about them (45 CFR 164.501). Under 45 CFR 164.524:

- **Timing.** The provider must act no later than 30 days after receiving the request, with one extension of up to 30 more days if it tells the patient in writing, within the first 30, why and when.
- **Form and format.** The copy comes in the form and format the patient asks for if it is readily producible; an electronic copy of electronic records in the electronic form requested if readily producible, otherwise an agreed electronic format.
- **To a third party.** The provider must send the copy to a person the patient designates, on a signed written request that clearly identifies the recipient and where to send it.
- **Fees.** Only a reasonable, cost-based fee for the labor of copying, supplies, postage and an agreed summary. Searching and retrieving records isn't billable.
- **Exclusions.** Psychotherapy notes and information compiled for litigation are outside the right; some denials are reviewable by a licensed professional who wasn't involved.

The third-party rule was narrowed in court. In *Ciox Health v. Azar* (D.D.C., January 23, 2020), the court held that HHS had impermissibly applied the access fee limit to copies sent to third parties at the patient's direction; HHS didn't appeal, so the cost-based fee limit applies to the patient's own copy, and a release to a law firm or another company can be priced under state law ([2021 NPRM, 86 FR 6446](https://www.federalregister.gov/documents/2021/01/21/2020-27157/proposed-modifications-to-the-hipaa-privacy-rule-to-support-and-remove-barriers-to-coordinated-care-and-individual-engagement)). The same January 21, 2021 proposed rule would shorten the response time to 15 calendar days, require posted fee schedules, and let patients photograph their records during inspection. **As of October 2026 it is still a proposed rule**: HHS held a tribal consultation on it on February 6, 2026, and no final rule has been published.

OCR has enforced access harder than anything else. Its Right of Access Initiative began with a first settlement on September 9, 2019; by March 6, 2025 OCR counted 53 enforcement actions, that one a $200,000 civil money penalty against Oregon Health & Science University. They keep coming and they hit small practices: a $70,000 penalty against Gums Dental Care (October 2024), three dental practice settlements in one September 2022 announcement, and on August 27, 2026 a $50,000 settlement with Azul Vision, an optometry and ophthalmology group with 31 California clinics, which received a request on January 9, 2023 and fulfilled it on January 6, 2025. Its corrective action plan is a specification for software: policies covering the cost-based fee, workforce training, and every 90 days a report to HHS of each access request with the date received, date completed, format requested, format provided, pages and cost.

The Cures Act made the same right faster in practice. A patient who asks through a certified API or portal gets the data as soon as it exists, and a practice that delays release without an exception is information blocking, a separate violation ([Information Blocking & Certification](/books/health-tech/information-blocking-and-certification#the-actors)).

## The Other Rights a Product Handles

- **Restrictions for self-pay.** A provider must agree to a patient's request not to disclose to a health plan, for payment or operations, information about an item or service the patient paid for in full out of pocket (45 CFR 164.522(a)(1)(vi)). That is a flag on the encounter or charge that the claim pipeline must honor, and it's the one restriction a provider can't refuse.
- **Confidential communications.** A provider must accommodate reasonable requests to receive communications by alternative means or at alternative locations, and can't require a reason (45 CFR 164.522(b)). "Text my cell, never call home" is a HIPAA right, not a preference, and it belongs on the contact record the reminder engine reads.
- **Amendment.** A patient can ask to amend their record (45 CFR 164.526); the provider may deny with a written reason, and an amendment is an appended record, never an overwrite (EHRs, PMSs & the Clinical Record covers the legal record).
- **Accounting of disclosures.** A patient can ask for an accounting of disclosures in the prior six years, excluding TPO, disclosures to the patient, disclosures under an authorization and several others; each entry carries the date, recipient, a description and the purpose, and the first accounting in any 12 months is free, due within 60 days with one 30-day extension (45 CFR 164.528). The disclosures that remain (to public health, to law enforcement, in response to a subpoena, impermissible ones found later) are exactly the ones a system forgets to log.

## Marketing

HIPAA defines **marketing** as a communication about a product or service that encourages the recipient to buy or use it, and requires an authorization for it (45 CFR 164.501, 164.508(a)(3)). The definition's exclusions are what make practice software possible:

- **Refill reminders** and communications about a drug currently prescribed, if any payment the provider receives for sending them is reasonably related to the cost of sending.
- **Treatment and operations communications**: recommending treatments, therapies, providers or settings of care; describing the provider's own health-related products and services; case management and care coordination.

Both exclusions disappear when the provider receives **financial remuneration** from a third party whose product is described. A hygiene recall text is treatment; a text about the practice's own whitening special describes its own service; a text about a manufacturer's aligner promotion, paid for by the manufacturer, is marketing that needs a signed authorization stating that remuneration is involved. Face-to-face communications and promotional gifts of nominal value are exempt from the authorization requirement.

Two other rules sit next to it. A **sale of PHI**, any disclosure in exchange for remuneration, needs an authorization stating that remuneration is involved (45 CFR 164.502(a)(5)(ii), 164.508(a)(4)); a vendor that monetizes practice data with third parties needs to know this before the product manager does. And HIPAA marketing rules are separate from **TCPA** consent for texts and calls: a message can be HIPAA treatment and still need TCPA consent, or the reverse. Two-Way Texting & Messaging owns the healthcare exemption; the general rules are in [TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent).

## Texting, Email and Tracking

HIPAA has no rule that says "no texting." OCR's FAQ says the Privacy Rule allows providers to communicate with patients by email if they apply reasonable safeguards, such as checking the address and limiting the amount or type of information in an unencrypted message, and that it doesn't prohibit unencrypted email for treatment-related communications. For copies of records, the 2013 Omnibus Rule went further: a provider may send unencrypted email if it has advised the patient of the risk and the patient still prefers it, and isn't responsible for interception in transit once it has. What follows for a product:

- **Patient-preferred channels are lawful with safeguards.** Ordinary SMS isn't encrypted end to end, so the content stays at minimum necessary: who, when, where, and a link to a secure page for anything clinical.
- **The warning and the preference are records.** If a patient opts into unencrypted email for their records, store that the risk was explained, when, and in which words.
- **Workforce texting is different.** Clinicians texting each other about a patient on personal phones is a Security Rule problem (device control, audit, retention), not a patient preference question; secure messaging apps exist for that.
- **Every hop is a business associate.** The SMS provider, the email service and the voicemail transcription engine all see the message; each needs a BAA or the message carries no PHI.

**Tracking technologies** are the 2020s version of the same mistake. OCR's bulletin on online tracking technologies (December 2022, updated March 2024) says a covered entity's pixels and analytics SDKs on authenticated pages and apps disclose PHI to the tracking vendor. On June 20, 2024, in *American Hospital Association v. Becerra*, the Northern District of Texas vacated the bulletin to the extent it said HIPAA is triggered when a technology connects an IP address with a visit to an unauthenticated public page about specific health conditions or providers; HHS's page says it is evaluating next steps. Authenticated portals, booking flows and apps remain squarely covered. My default is no third-party tracking on any page or screen a patient reaches after identifying themselves, and server-side, de-identified analytics everywhere else.

## Breach Notification and the Wall of Shame

The deadlines are the playbook's ([The Three Rules](/docs/compliance/hipaa#the-three-rules)): individuals within 60 days of discovery, HHS and the media for 500 or more, smaller breaches logged and reported annually, and a business associate notifying its covered entity within 60 days. What the industry adds:

- **OCR posts every breach of 500 or more** on its breach portal, which the industry calls the wall of shame: entity, state, type, count and breach type. The posting is public within weeks and stays there.
- **Counts change after posting.** Change Healthcare's report, filed July 19, 2024, first listed 500 individuals, the minimum that triggers a posting; Change told OCR on October 22, 2024 that about 100 million notices had gone out, on January 24, 2025 that about 190 million individuals were affected, and on July 31, 2025 about 192.7 million. A vendor's breach can therefore be reported by its customers, by the vendor on their behalf, or both, and the vendor's contracts decide who notifies.
- **Late notice is its own violation.** OCR's July 29, 2026 settlement with OSF HealthCare ($552,250) cited, besides the missing risk analysis, notifying 53,907 patients and HHS on October 1, 2021 after discovering ransomware on April 23 and confirming the theft on August 24.

For a vendor, the BAA's breach clause is the operative rule: how fast it must tell each affected practice (often far shorter than 60 days), what it must hand over, and who pays for notices. Security for Health Data covers the incident side ([Health Records Security](/books/health-tech/health-records-security#ransomware-and-the-sector)).

## OCR Enforcement

OCR's enforcement summary, as of October 31, 2024: more than 374,321 HIPAA complaints since April 2003, 99% resolved; 31,191 cases resolved with required corrective action or technical assistance; 152 cases settled or penalized for a total of $144,878,972; 2,419 referrals to the Department of Justice for criminal investigation. The issues most often alleged, in order, are impermissible uses and disclosures, lack of safeguards, lack of patient access, lack of administrative safeguards for ePHI, and disclosing more than the minimum necessary.

Penalties are tiered by culpability (42 U.S.C. 1320d-5, 45 CFR 160.404). In the annual inflation adjustment HHS published on January 28, 2026, each violation costs from $145 to $73,011 where the entity didn't know, from $1,461 where there was reasonable cause, from $14,602 for willful neglect corrected within 30 days, and from $73,011 up to $2,190,294 for willful neglect not corrected, with a calendar-year cap of $2,190,294 per identical provision. Since April 30, 2019, as enforcement discretion pending rulemaking, HHS applies lower annual caps to the lower tiers.

What the resolution agreements say about where the industry fails, in the cases most relevant to software:

| Case | Date | Amount | What it was about |
| --- | --- | --- | --- |
| **Anthem** | October 15, 2018 | $16,000,000 | The record settlement, after what OCR called the largest health data breach in history |
| **Elite Dental Associates** | October 2, 2019 | $10,000 | Disclosing patients' PHI in replies on social media review pages |
| **Manasa Health Center** | June 5, 2023 | $30,000 | Disclosing four patients' PHI in replies to their negative Google reviews |
| **Solara Medical Supplies** | January 14, 2025 | $3,000,000 | Phishing attack |
| **Warby Parker** | February 20, 2025 | $1,500,000 civil money penalty | Hacking that reached nearly 200,000 people's PHI |
| **Oregon Health & Science University** | March 6, 2025 | $200,000 civil money penalty | Untimely access; the 53rd right of access action |
| **OSF HealthCare** | July 29, 2026 | $552,250 | Ransomware, no accurate risk analysis, late notification |
| **Azul Vision** | August 27, 2026 | $50,000 | Access fulfilled two years after the request |
| **Ambry Genetics** | September 17, 2026 | $700,000 | Phishing attack exposing 225,000 patients' data |

Two threads stand out. Since 2024 OCR has announced a steady run of ransomware and hacking settlements whose corrective action plans start with the same item: an accurate and thorough risk analysis, submitted to HHS for approval, with a complete inventory of the systems that touch ePHI. And replying to a review with a patient's details keeps producing actions, which is why Reviews & Reputation treats the reply box as a disclosure channel. The pending Security Rule overhaul would turn more of this into explicit requirements; as of October 2026 it is still the proposed rule of January 6, 2025 ([The Pending Security Rule Update](/docs/compliance/hipaa#the-pending-security-rule-update)).

## The Notice of Privacy Practices

Every covered provider gives patients a **notice of privacy practices** (45 CFR 164.520) and, for direct treatment relationships, makes a good-faith effort to get a written acknowledgment. Notices had to be updated by **February 16, 2026** for changes made alongside the Part 2 rule, and those changes survived the 2025 court decision that vacated most of the reproductive health privacy rule (only 164.520(b)(1)(ii)(F), (G) and (H) were vacated; [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy#the-reproductive-health-rule-and-its-vacatur)). For an intake product, the notice is a versioned document and the acknowledgment is a signed record pointing at the version shown ([Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization#consent-to-treat-and-the-paperwork-packet)).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) (`patients`, `contacts`, `communications`, `documents`, `disclosures`, `audit_events`). The core `disclosures` table already is the 45 CFR 164.528 accounting, with recipient, description, purpose and basis; this chapter adds how impermissible disclosures join it, and the records for access requests, privacy requests and breaches.

```sql
ALTER TABLE disclosures                -- core: the 164.528 accounting (recipient, description, purpose, basis)
  ADD COLUMN impermissible    BOOLEAN NOT NULL DEFAULT FALSE,  -- found later; still accountable
  ADD COLUMN breach_case_id   UUID,                -- breach_cases, below, when impermissible
  ADD COLUMN source_record    TEXT;                -- the release, report or response that made it

CREATE TABLE access_requests (         -- the right of access, 45 CFR 164.524
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  representative_id UUID,                           -- personal_representatives (Consent chapter), if not self
  received_at      TIMESTAMPTZ NOT NULL,
  channel          TEXT NOT NULL CHECK (channel IN ('portal', 'api', 'email', 'mail', 'fax',
                     'in_person', 'phone')),
  scope            TEXT NOT NULL,                    -- 'all', or the date range and record types
  format_requested TEXT NOT NULL,                    -- 'pdf', 'ccda', 'fhir', 'paper', 'images_dicom'
  deliver_to       TEXT NOT NULL CHECK (deliver_to IN ('patient', 'designated_third_party')),
  third_party_name TEXT,                             -- from the signed written direction
  signed_direction_document_id UUID REFERENCES documents (id),
  due_at           TIMESTAMPTZ NOT NULL,             -- received_at + 30 days, from the rule row
  extended_to      TIMESTAMPTZ,                      -- one extension, with the letter sent
  extension_notice_communication_id UUID REFERENCES communications (id),
  status           TEXT NOT NULL CHECK (status IN ('received', 'in_progress', 'fulfilled',
                     'partially_denied', 'denied', 'withdrawn')),
  format_provided  TEXT,
  pages            INT,
  fee_amount       BIGINT,                           -- minor units; cost-based for patient copies
  fee_basis        JSONB,                            -- labor minutes, supplies, postage
  fulfilled_at     TIMESTAMPTZ,
  denial_reason    TEXT,
  CHECK (deliver_to = 'patient' OR signed_direction_document_id IS NOT NULL),
  CHECK (extended_to IS NULL OR extended_to <= due_at + INTERVAL '30 days')
);

CREATE TABLE privacy_requests (        -- restrictions, confidential communications, amendments
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  patient_id    UUID NOT NULL REFERENCES patients (id),
  kind          TEXT NOT NULL CHECK (kind IN ('restriction', 'self_pay_restriction',
                  'confidential_communication', 'amendment')),
  detail        JSONB NOT NULL,        -- e.g. {"contact_id": ..., "only": "sms"} or the encounter ids
  encounter_id  UUID REFERENCES encounters (id),     -- self-pay restrictions attach to the visit
  decision      TEXT NOT NULL CHECK (decision IN ('pending', 'agreed', 'denied', 'terminated')),
  decided_by    UUID,                  -- the workforce member
  decided_at    TIMESTAMPTZ,
  denial_reason TEXT,
  valid_during  TSTZRANGE NOT NULL,
  CHECK (kind <> 'self_pay_restriction' OR decision <> 'denied')   -- must be agreed
);

ALTER TABLE contacts
  ADD COLUMN unencrypted_email_ok_at TIMESTAMPTZ,   -- risk explained and accepted
  ADD COLUMN unencrypted_email_text_id UUID REFERENCES disclosure_texts (id);  -- the warning shown

CREATE TABLE breach_cases (            -- one incident assessed under 45 CFR 164.402
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID REFERENCES organizations (id),  -- null when a vendor incident spans tenants
  discovered_at      TIMESTAMPTZ NOT NULL,   -- known, or would have been with reasonable diligence
  description        TEXT NOT NULL,
  phi_unsecured      BOOLEAN NOT NULL,       -- encrypted per HHS guidance means false
  risk_assessment    JSONB NOT NULL,         -- the four factors and the conclusion
  is_breach          BOOLEAN NOT NULL,
  individuals_count  INT,
  by_state           JSONB,                  -- {"US-CA": 812, ...} for media thresholds
  ba_notified_ce_at  TIMESTAMPTZ,            -- when the vendor told each practice (per BAA)
  hhs_reported_at    TIMESTAMPTZ,
  media_notified_at  TIMESTAMPTZ,
  individuals_due_at TIMESTAMPTZ NOT NULL,   -- discovered_at + 60 days
  closed_at          TIMESTAMPTZ
);

CREATE TABLE breach_notices (          -- every notice sent, to whom, how
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  breach_case_id  UUID NOT NULL REFERENCES breach_cases (id),
  patient_id      UUID REFERENCES patients (id),
  recipient_kind  TEXT NOT NULL CHECK (recipient_kind IN ('individual', 'next_of_kin',
                    'substitute_notice', 'media', 'hhs', 'covered_entity', 'state_ag')),
  communication_id UUID REFERENCES communications (id),
  sent_at         TIMESTAMPTZ NOT NULL
);
```

Design decisions:

- **Disclosures are logged where they happen, not reconstructed.** Every path that sends PHI to someone for an accountable purpose (a public health report, a subpoena response, a report to an oversight agency) writes a `disclosures` row in the same transaction; disclosures that aren't accountable (TPO, to the patient, under an authorization) are `audit_events` with action `disclose`. An impermissible disclosure found later is added with `impermissible = TRUE` and its breach case, so the accounting is complete.
- **Access requests are deadlines, computed and stored.** `due_at` comes from a rule row (30 days federally today; the pending 2021 proposal or a state rule would change it), stored with the rule that set it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). The columns are the Azul Vision corrective action report: received, completed, format requested and provided, pages and cost.
- **Requests the patient makes are records with a decision.** A self-pay restriction is checked by the claim builder before any line for that encounter goes to a payer; a confidential communication request is read by the outbound gate before any message is sent ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)).
- **Breach math is stored, not recomputed.** The four-factor assessment, the discovery date and the per-state counts that decide media notice are kept as decided, because the case will be reviewed by OCR, a customer's counsel and possibly a court years later.
- **Notices point at messages.** Each notice is a `communications` row, so the content, channel and delivery evidence are the same records the platform keeps for every message.

## Auditing

- **Every access request** with its timestamps, extension letter, format, pages and fee: OCR's corrective action plans ask for exactly this list every quarter.
- **Every accountable disclosure** for six years, producible as a 164.528 accounting per patient.
- **Who viewed which patient,** reads included, so an inappropriate access complaint can be answered ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); the security chapter covers review ([Access Reports and Audit Review](/books/health-tech/health-records-security#access-reports-and-audit-review)).
- **Privacy requests and their decisions,** including terminated restrictions and the reason.
- **Breach cases:** the assessment, every notice, every deadline met or missed.
- **Documentation retention:** HIPAA requires policies, procedures and required documentation be kept six years from creation or last effective date (45 CFR 164.530(j)); the risk analysis and its updates are part of it.

## What This Means for the System You Build

- **Treat every tenant as a covered entity** and every vendor in your path as needing a BAA for the specific services you use; keep PHI out of anything off those lists.
- **Design messages for minimum necessary:** who, when and where in the text, anything clinical behind a secure link, and the patient's confidential communication choices enforced at the send gate.
- **Make the right of access a workflow with a clock,** cost-based fees for patient copies, third-party directions on file, and a fulfillment report you could hand OCR tomorrow.
- **Log disclosures as they happen,** with the basis that decides whether they're accountable.
- **Separate HIPAA marketing from TCPA consent,** and flag any communication that a third party pays for.
- **Keep third-party trackers off authenticated pages and apps** and out of booking and intake flows.
- **Store breach assessments, deadlines and notices as records,** and write your BAA notification commitments into the incident runbook.
- **Version the notice of privacy practices** and record which version each patient acknowledged.

## References

**Regulations**

- [eCFR: 45 CFR Part 164, Subpart E (Privacy Rule)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E), the current sections including 164.509 as still printed
- [LII: 45 CFR 164.501, Definitions](https://www.law.cornell.edu/cfr/text/45/164.501), marketing and its exclusions, financial remuneration, psychotherapy notes, designated record set
- [LII: 45 CFR 164.502, Uses and disclosures: general rules](https://www.law.cornell.edu/cfr/text/45/164.502), minimum necessary and its exceptions, sale of PHI, business associates, personal representatives, confidential communications cross-reference
- [LII: 45 CFR 164.508, Authorization required](https://www.law.cornell.edu/cfr/text/45/164.508), marketing and sale authorizations, face-to-face and nominal gift exceptions
- [LII: 45 CFR 164.522, Rights to request privacy protection](https://www.law.cornell.edu/cfr/text/45/164.522), the mandatory self-pay restriction and confidential communications
- [LII: 45 CFR 164.524, Access of individuals](https://www.law.cornell.edu/cfr/text/45/164.524), 30 days and one extension, form and format, third-party directions, cost-based fees, exclusions, denial review
- [LII: 45 CFR 164.528, Accounting of disclosures](https://www.law.cornell.edu/cfr/text/45/164.528), six years, exclusions, contents, 60 days, free first accounting
- [Federal Register: Omnibus HIPAA final rule (January 25, 2013)](https://www.federalregister.gov/documents/2013/01/25/2013-01073/modifications-to-the-hipaa-privacy-security-enforcement-and-breach-notification-rules-under-the), unencrypted email at the individual's request after a risk warning; subsidized treatment communications as marketing
- [Federal Register: Proposed Modifications to the HIPAA Privacy Rule (January 21, 2021)](https://www.federalregister.gov/documents/2021/01/21/2020-27157/proposed-modifications-to-the-hipaa-privacy-rule-to-support-and-remove-barriers-to-coordinated-care-and-individual-engagement), the 15-day proposal, posted fee schedules, inspection, and the Ciox decision
- [Federal Register: Tribal consultation on proposed modifications to the HIPAA Privacy Rule](https://www.federalregister.gov/documents/2026/01/14/2026-00561/tribal-consultation-on-proposed-modifications-to-the-hipaa-privacy-rule), the February 6, 2026 consultation on the still-pending 2021 proposal
- [Federal Register: Annual civil monetary penalties inflation adjustment (January 28, 2026)](https://www.federalregister.gov/documents/2026/01/28/2026-01688/annual-civil-monetary-penalties-inflation-adjustment), HIPAA penalty tiers and the calendar-year cap
- [Federal Register: Notification of enforcement discretion regarding HIPAA civil money penalties (April 30, 2019)](https://www.federalregister.gov/documents/2019/04/30/2019-08530/notification-of-enforcement-discretion-regarding-hipaa-civil-money-penalties), lower annual caps per tier
- [California Business and Professions Code section 4857](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4857), veterinary records confidentiality and client consent

**HHS and OCR**

- [HHS: Resolution agreements and civil money penalties](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html), the dated list of every settlement and penalty, including the first right of access settlement (September 9, 2019), Gums Dental Care, the September 2022 dental access settlements, Anthem, Solara, Ambry Genetics and the 2024 to 2026 ransomware actions
- [HHS: Elite Dental Associates settlement](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/elite/index.html), $10,000 for social media disclosures
- [HHS: Manasa Health Center resolution agreement](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/manasa-ra-cap/index.html), $30,000 for disclosing four patients' PHI in replies to Google reviews
- [HHS: OHSU $200,000 penalty for failure to provide timely access (March 6, 2025)](https://www.hhs.gov/about/news/2025/03/06/hhs-office-civil-rights-imposes-200000-penalty-against-oregon-health-science-university-failure-provide-timely-access-patient-records.html), the 53rd right of access enforcement action
- [HHS: Warby Parker $1,500,000 civil money penalty (February 20, 2025)](https://www.hhs.gov/about/news/2025/02/20/hhs-imposes-1500000-penalty-against-warby-parker-hipaa-hacking.html), nearly 200,000 individuals
- [HHS: Azul Vision resolution agreement and corrective action plan](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/ra-cap-with-azul-vision/index.html), the January 2023 request fulfilled in January 2025, $50,000, quarterly access request reporting
- [HHS: OSF HealthCare resolution agreement and corrective action plan](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/ra-cap-with-osf-healthcare-system/index.html), ransomware, risk analysis, late notification, $552,250
- [HHS: Enforcement highlights](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/data/enforcement-highlights/index.html), complaint, resolution, penalty and referral totals as of October 31, 2024
- [HHS: Change Healthcare cybersecurity incident FAQs](https://www.hhs.gov/hipaa/for-professionals/special-topics/change-healthcare-cybersecurity-incident-frequently-asked-questions/index.html), the July 2024 report and the 100, 190 and 192.7 million updates
- [HHS: Use of online tracking technologies](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/hipaa-online-tracking/index.html), the bulletin and the June 20, 2024 vacatur note
- [HHS FAQ: May providers use email to discuss health issues with patients?](https://www.hhs.gov/hipaa/for-professionals/faq/does-hipaa-permit-health-care-providers-to-use-email-to-discuss-health-issues-with-patients/index.html), reasonable safeguards and unencrypted treatment email
- [HHS: HIPAA regulatory initiatives](https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/index.html), the reproductive health rule vacatur, surviving NPP changes due February 16, 2026, the Security Rule NPRM
- [HHS: HIPAA FAQs for professionals](https://www.hhs.gov/hipaa/for-professionals/faq/index.html), the marketing, refill reminder, personal representative and access FAQ sets
- [Federal Register: HIPAA Security Rule NPRM (January 6, 2025)](https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information), still proposed as of October 2026

**In practice**

- [Microsoft: HIPAA and the HITECH Act](https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech), the BAA in the Data Protection Addendum by default and the in-scope services
- [Google: HIPAA compliance with Google Workspace and Cloud Identity](https://knowledge.workspace.google.com/admin/compliance/hipaa-compliance-with-google-workspace-and-cloud-identity), Admin console acceptance and Included Functionality
- [Twilio: HIPAA](https://www.twilio.com/en-us/hipaa), the Business Associate Addendum, Security or Enterprise Edition, eligible products, shared responsibility
- [Weave: Security](https://www.getweave.com/security/), HIPAA support statement, encryption in transit and at rest, Google Cloud hosting
