+++
title = "Claims"
description = "Billing the payer: 837P, 837I and 837D, the CMS-1500, UB-04 and ADA forms, scrubbing and NCCI edits, modifiers, attachments, acknowledgments, timely filing."
category = "Health Tech Industry"
order = 1921
part = "Revenue Cycle"
tags = ["health-tech", "claims", "x12-837", "ncci", "dental-claims", "attachments", "data-model"]
+++

A claim is the practice's bill to a payer: who was treated, under which coverage, by whom, where, for what diagnoses, which services on which dates, and what the practice charges for each. It is built from the charges of one encounter (or, for a hospital stay, of an admission), checked against the payer's rules, sent as an X12 837 through a clearinghouse, acknowledged twice, and then adjudicated into a remittance weeks later. Medicare requires initial claims to be electronic, with exceptions for small providers, and the 837 has a version for each of the three kinds of provider: professional (physicians, therapists, most practices), institutional (hospitals, nursing facilities, home health) and dental.

What makes claims software hard is that a claim can be valid X12, accepted by the clearinghouse, accepted by the payer and still wrong, and each of those is a different check with a different response. The file can fail syntax (a 999 says so within minutes); the claim can fail the payer's front-end edits (a 277CA rejects it within a day, and it never entered adjudication, so it must be fixed and resent, not appealed); and the claim can be adjudicated and denied for coding, coverage or documentation (an 835 says so weeks later). A product that conflates "rejected" with "denied" sends the wrong work to the wrong person. This chapter covers the three 837s and the paper forms they replaced, building the claim from charges, scrubbing and the NCCI edits, modifiers, dental claims, attachments, submission and acknowledgments, corrected claims, and timely filing. It extends `claims`, `claim_lines` and `charges` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The route the claim takes is [Clearinghouses](/books/health-tech/clearinghouses); what comes back is [Remittance & Posting](/books/health-tech/remittance-and-payment-posting) and [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals).

## How the Platforms Do It

As of October 2026, from each vendor's or contractor's documentation:

| Platform | Claim types | How claims go in | Acknowledgments | Notable mechanics |
| --- | --- | --- | --- | --- |
| **Medicare (CGS 837P companion guide, v10.0, August 2026)** | 837P, 837I | X12 from a submitter, directly or through a clearinghouse | TA1, 999 and 277CA; "Medicare has adopted three acknowledgement transactions" | A test file of at least 25 claims must earn "an accepted 999 and 277CA" before production; amounts over 99,999.99 rejected; only 20 characters of the claim identifier stored |
| **Stedi** | 837P, 837I, 837D | JSON shaped like the CMS-1500, an X12-shaped JSON, or raw X12 | Receives and processes payer 277CAs and 835s automatically; for dental, an initial 277CA from Stedi's own edits in the synchronous response | Returns HTTP 201 even for a rejected claim, with errors in the body, and a rejected claim never reaches the payer; the CMS-1500 JSON doesn't support secondary claims, the X12 shapes do; idempotency keys reusable for 24 hours |
| **Claim.MD** | Claims for small practices and billing services | Upload, PMS integration, direct entry | Claim responses and ERAs | Paper claims printed and mailed for $1.00, attachments $0.60 |
| **Office Ally** | Claims for small practices | Upload, direct entry, PMS integration | Reports in the Service Center | Attachments $0.55 |
| **Vyne Dental (Trellis)** | Dental | From the PMS | Claim tracking | "Unlimited electronic claims and attachments" |
| **DentalXChange (ClaimConnect)** | Dental | From the PMS, or a direct-entry claim started from an eligibility result | Claim status by 276/277 | Patient data from the eligibility search fills the claim form |

Three patterns:

- **Acknowledgments are layered.** A clearinghouse checks the file and the claim against its own edits, then the payer checks again. Stedi's dental endpoint returns its own 277CA at once and the payer's later; Medicare returns a 999 for syntax and a 277CA for acceptance. Each layer has its own rejection codes and the claim's status is the latest of them.
- **A rejected claim is not a denied claim.** Stedi states it plainly: a rejected claim "never goes to the payer." Medicare rejects only files out of compliance with 5010 at the 999 stage. Rejections are fixed and resent; denials are appealed or corrected.
- **Dental needs attachments.** Stedi notes that "Dental payers typically require attachments to support most claims," and the dental clearinghouses sell attachments as a core feature.

## The Paper Forms

Every 837 has a paper ancestor, and the forms still matter: payers that don't accept electronic claims, secondary claims some payers want on paper, and patients who ask for a form to file themselves. The forms also explain the JSON shapes many clearinghouses use.

| Form | Maintained by | Used for | Electronic twin |
| --- | --- | --- | --- |
| **1500 Health Insurance Claim Form** (the CMS-1500), version 02/12 | National Uniform Claim Committee (NUCC); in use since April 1, 2014 | Professional claims: physicians, therapists, labs, ambulance, suppliers | 837P |
| **UB-04** (CMS-1450) | National Uniform Billing Committee (NUBC), with the "Official UB-04 Data Specifications Manual" copyrighted by the American Hospital Association | Institutional claims: hospitals, skilled nursing, home health, hospice | 837I |
| **ADA Dental Claim Form**, 2024 version | American Dental Association (prepared by ADA Practice Institute staff, with contributions from its Council on Dental Benefit Programs) | Dental claims and predeterminations | 837D |

The forms differ in what they center. The 1500 is a list of service lines, each with a date, place of service, procedure code, up to four modifiers, a pointer to the diagnoses, a charge and units. The UB-04 adds revenue codes (the department that provided each line), type of bill, admission and discharge data, occurrence and value codes, and the attending and operating physicians. The ADA form adds tooth numbers and surfaces, the area of the mouth, prosthesis replacement dates, orthodontic treatment months and a place to say whether X-rays or models are enclosed.

## The 837 Claim

An 837 is a hierarchy: submitter and receiver, then the **billing provider** (the organization paid, by NPI and tax ID), then the **subscriber** (the policyholder and payer), then the **patient** if not the subscriber, then the **claim** (one per encounter) with its **service lines**. An illustrative professional claim, written for this chapter from the structure described in Medicare contractor companion guides (not taken from an implementation guide):

```
HL*1**20*1~
NM1*85*2*HARBOR PHYSICAL THERAPY*****XX*1234567893~
HL*2*1*22*0~
SBR*P*18*GRP4471******CI~
NM1*IL*1*RIVERA*ANA****MI*W123456789~
NM1*PR*2*EXAMPLE HEALTH PLAN*****PI*60054~
CLM*PT20261014A*270***11:B:1*Y*A*Y*Y~
REF*G1*AUTH55821~
HI*ABK:M5450*ABF:M6281~
NM1*82*1*CHEN*LI****XX*1987654320~
LX*1~
SV1*HC:97161*120*UN*1***1:2~
DTP*472*D8*20261014~
LX*2~
SV1*HC:97110:GP*90*UN*2***1~
DTP*472*D8*20261014~
LX*3~
SV1*HC:97140:GP*60*UN*1***1~
DTP*472*D8*20261014~
```

What each part carries:

- **`NM1*85`**, the billing provider and its NPI. **`SBR`** says this payer is primary (`P`), the subscriber is the patient (`18`), and the claim filing indicator (`CI`, commercial).
- **`CLM`**: the patient control number (`PT20261014A`, the practice's own identifier, which the payer echoes on every response), the total charge, the place of service (`11`, office) and claim frequency (`1`, original), and the provider's signature, assignment and release-of-information indicators.
- **`REF*G1`**, the prior authorization number ([Prior Authorization](/books/health-tech/prior-authorization)).
- **`HI`**, the diagnoses (ICD-10-CM, principal first), and **`NM1*82`**, the rendering provider who performed the services, distinct from the billing organization.
- **`SV1`** per line: procedure code with modifiers (`97110:GP`), charge, unit basis and count, and diagnosis pointers (`1:2` means diagnoses 1 and 2 support this line).

The institutional 837I replaces `SV1` with `SV2` (revenue code, procedure, charge, units) and adds the type of bill and admission data; the dental 837D uses `SV3` and tooth segments ([Dental Claims](#dental-claims), below).

## From Charges to a Claim

A claim is assembled, not typed. The steps a PMS or billing system runs:

1. **Collect the encounter's charges.** Every completed procedure for the visit has a `charges` row with code, modifiers, units, diagnosis pointers and fee. Charges not yet reviewed (a coder's queue, a missing diagnosis) hold the claim.
2. **Pick the coverage.** The primary `coverages` row on the date of service decides the payer, subscriber and filing indicator ([Coordination of Benefits](/books/health-tech/eligibility-and-benefits#coordination-of-benefits)).
3. **Resolve providers.** The billing provider is the organization; the rendering provider is who did the work; for some services a referring or supervising provider is required too. Each needs the NPI the payer has on file, which for group practices means the provider is enrolled with that payer under that group ([Clearinghouses](/books/health-tech/clearinghouses#enrollment)).
4. **Split where the payer requires.** One encounter can yield several claims: services by different rendering providers that a payer wants separately, lines for a different payer (a lab test billed to a lab benefit manager), or too many lines for one claim.
5. **Price.** Each line carries the practice's full fee, not the expected payment. The contracted rate is the payer's to apply and the practice's to check afterward ([Underpayments](/books/health-tech/denials-and-appeals#underpayments-and-contracts)).
6. **Scrub,** then **submit**.

The patient control number is the claim's identity across every system, so it is generated once, never reused, short enough for the payer to store (CGS keeps only 20 characters; Stedi recommends 17 or fewer), and unique across resubmissions of the same claim, with the payer's own claim number recorded once it is assigned.

## Scrubbing and Edits

A scrubber runs the checks a payer will run, before the payer runs them. Edits come from four sources:

- **Syntax and the implementation guide:** required fields, valid code values, field lengths. These are what a 999 would catch.
- **Payer front-end edits:** the payer's companion guide rules, the member and provider on file, valid payer IDs. These produce 277CA rejections.
- **Coding edits,** most importantly CMS's **National Correct Coding Initiative** (NCCI). Procedure-to-procedure (PTP) edits "prevent improper payment when incorrect code combinations are reported," pairs of codes that shouldn't be billed together on the same day for the same patient by the same provider unless a modifier says why; **medically unlikely edits** (MUEs) cap the units of a code a provider would report for one patient on one day. CMS updates both quarterly and can issue replacement files between updates (an October 14, 2025 PTP replacement file for the fourth quarter of 2025, for example). Medicaid programs use NCCI too, and many commercial payers license similar edit sets.
- **Medical necessity and coverage:** the diagnosis supports the service under Medicare's national and local coverage determinations, frequency rules, age and sex edits ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#medical-necessity-ncds-and-lcds)).

A scrubber is a rules engine with dated rule sets: NCCI quarterly files, payer-specific edits, practice-specific rules learned from past denials. Each finding is stored with the rule and its version, so "why did this claim hold?" has an answer and a rule that was wrong can be traced to every claim it touched ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Modifiers

A modifier is a two-character code on a line that changes what the code means: who did it, where, which side of the body, or that it is distinct from another service on the same day. They are the most common reason an NCCI edit does or doesn't fire, and the most audited.

- **25** marks an evaluation and management service that is "significant and separately identifiable" from a procedure on the same day (CMS Claims Processing Manual, chapter 12).
- **59** and its subsets **XE** (separate encounter), **XS** (separate structure or organ), **XP** (separate practitioner) and **XU** (unusual non-overlapping service) mark a procedure as distinct from another it would normally bundle with. CMS's NCCI guidance says they "may be used only if no other appropriate modifier describes the service."
- **Therapy modifiers** (GP for physical therapy, GO occupational, GN speech) identify the plan of care a therapy service belongs to, and payment and caps follow them.
- **Telehealth and place of service** codes (place of service `02` and `10` for telehealth, and payer-specific telehealth modifiers) mark how a service was delivered; their rules change with the telehealth flexibilities covered in Part 6's [Telehealth](/books/health-tech/telehealth#medicare-telehealth-status-as-of-october-2026) chapter.
- **Laterality and anatomy** (RT, LT, finger and toe modifiers) and **professional and technical components** (26, TC) split one code into the parts actually performed.

My rule for software: never add a modifier automatically to make an edit pass. A scrubber can say "these codes bundle; a distinct-service modifier applies only if the documentation shows a separate site or session," and route the claim to a person. A modifier added by software to clear an edit is a false claim waiting for an audit ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation)).

## Dental Claims

The 837D (005010X224) and the ADA claim form carry what medical claims don't:

- **CDT procedure codes** (published by the ADA, licensed, updated each year), in an `SV3` segment with the `AD` qualifier.
- **Tooth and surfaces:** a `TOO` segment with the tooth number in the universal system and the surfaces treated (mesial, occlusal, distal, buccal, lingual, incisal).
- **Oral cavity area** for procedures that apply to a quadrant or arch rather than a tooth.
- **Tooth status** (a `DN2` segment): teeth missing or to be extracted, which matters for bridges and missing tooth clauses.
- **Prosthesis dates:** for a crown, bridge or denture, whether it is an initial placement or a replacement, and the prior placement date, because frequency limits run per tooth.
- **Orthodontic data:** treatment start date, months of treatment and months remaining.

An illustrative dental line, an extraction of tooth 3 (Stedi's dental example uses the same code):

```
CLM*DX20261021B*832***11:B:1*Y*A*Y*Y~
DN2*3*E~
PWK*RB*EL***AC*VYN2026102100017~
LX*1~
SV3*AD:D7140*832****1~
TOO*JP*3~
DTP*472*D8*20261021~
```

`DN2*3*E` marks tooth 3 as to be extracted; `PWK` says a radiograph (`RB`) is being sent electronically with an attachment control number that ties it to the claim; `SV3` carries the CDT code and fee; `TOO*JP*3` names the tooth in the universal numbering system. A filling would add surfaces to `TOO` (`TOO*JP*3*M:O` for mesial and occlusal).

Dental has two more claim types:

- **Predetermination** (pre-treatment estimate): the same 837D or ADA form, marked as a request for a pre-treatment estimate, so the payer replies with what it would pay before the work is done. It isn't a guarantee and it isn't a prior authorization, but for crowns, implants and orthodontics it is what the treatment plan conversation rests on.
- **Medical claims for dental work:** some oral surgery, sleep apnea appliances and trauma are billed to the patient's medical plan on an 837P with CPT and ICD-10-CM, so a dental PMS that serves oral surgeons needs both claim types.

Downgrades and alternate benefits (the payer pays a composite filling at the amalgam rate) are applied by the payer at adjudication and come back on the 835; the claim always carries the procedure actually performed.

## Attachments

Attachments are the documents that support a claim: X-rays, periodontal charts and narratives for dental; operative notes, therapy plans of care and medical records for medical. Today they move three ways:

- **Unsolicited, by reference.** The claim's `PWK` segment says what is being sent and how, with a control number, and the document follows through the clearinghouse's attachment service or a payer portal. Stedi's support for unsolicited 275 attachments is "currently limited to a subset of available dental payers"; dental clearinghouses' attachment networks are the most mature path.
- **Solicited.** The payer pends the claim and asks for documentation, by letter, portal or a 277 request, and the practice responds.
- **Paper and fax,** still common.

A federal standard is coming. CMS-0053-F adopts the X12N 275 (006020X314) to carry attachments and the X12N 277 (006020X313) for a payer's request for additional information, with HL7 C-CDA document guides and the HL7 attachments implementation guide (the March 2022 version), effective May 26, 2026 with compliance required by May 26, 2028. The final rule left prior authorization attachments out, citing possible misalignment with the 278 and the FHIR prior authorization APIs of CMS-0057-F ([Prior Authorization](/books/health-tech/prior-authorization)). CMS projects savings of "$781.98 million annually." For software this means a two-year build: attachment records with types and control numbers, C-CDA document generation from the chart, and 275 transport through the clearinghouse, alongside the dental networks practices already use. C-CDA itself is the Part 2 chapter [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda#c-cda).

## Submission and Acknowledgments

A claim's statuses before adjudication, and what moves it:

| Status | Set by | Meaning | Next |
| --- | --- | --- | --- |
| `ready` | Scrubber passed | Built and clean | Batch for submission |
| `submitted` | Sent to the clearinghouse | In flight | Wait for the 999 |
| `rejected` (by syntax) | 999 or TA1 rejection | The file or transaction set was invalid; nothing reached the payer | Fix the builder, resend |
| `rejected` (by the clearinghouse) | Clearinghouse 277CA | Failed the clearinghouse's edits | Fix and resend |
| `rejected` (by the payer) | Payer 277CA with a rejection status | Failed the payer's front-end edits; not adjudicated | Fix and resend as an original, not a correction |
| `accepted` | Payer 277CA acceptance | In adjudication, with a payer claim number | Wait for the 835; check status if it doesn't come ([Claim Status](/books/health-tech/denials-and-appeals#claim-status-276-and-277)) |
| `adjudicated` | 835 | Paid, partly paid or denied | Post ([Remittance & Posting](/books/health-tech/remittance-and-payment-posting)) |

Rules that keep the statuses honest:

- **Correlate every acknowledgment.** A 999 answers a file (by its control numbers); a 277CA answers a claim (by patient control number and, per line, the line item control number). An acknowledgment that matches nothing is itself an alert.
- **No acknowledgment is a status.** A claim submitted with no 277CA in two business days goes on a queue; the clearinghouse may have lost it, or the payer may need enrollment.
- **Resubmission is idempotent.** A retry after a timeout reuses the same claim identity and idempotency key, so a payer never sees two originals ([Idempotency](/docs/payments/idempotency)).

## Corrected and Voided Claims

Once a payer has adjudicated a claim, changing it means sending a new claim that references the old one, with the claim frequency code saying what kind:

- **Replacement** (frequency `7`) replaces the original entirely: a wrong code, a missed line, a changed diagnosis. It carries the payer's original claim number.
- **Void** (frequency `8`) cancels the original: billed to the wrong patient or payer. Money already paid will be recouped.

A corrected claim isn't an appeal; it fixes the practice's own error. Payers set their own windows for corrections, and a replacement sent for a claim the payer rejected (never adjudicated) is itself rejected, which is why the status table distinguishes the two.

## Timely Filing

Every payer sets a deadline from the date of service to receive a claim, and a claim filed late is denied without appeal for cause. Medicare's is in regulation: for services on or after January 1, 2010, a claim must be filed "no later than the close of the period ending 1 calendar year after the date of service" (42 CFR 424.44), with exceptions for errors by CMS or its contractors and for retroactive entitlement or disenrollment. Commercial and Medicaid deadlines are set by contract and state law and are often much shorter. Secondary claims usually have a deadline that runs from the primary's remittance date.

Software has to compute each claim's deadline from the payer's rule when the charge is created, store it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)), and surface claims approaching it, because the cost of a missed deadline is the whole claim. Proof of timely filing is the acknowledgment: a 999 and accepting 277CA with dates, kept with the claim, is what wins the argument when a payer says it never received the claim.

Medicare also requires electronic claims. Under 42 CFR 424.32(d), "An initial Medicare claim may be paid only if submitted as an electronic claim," except for, among others, "A provider of services with fewer than 25 full-time equivalent employees" and "A physician, practitioner, facility, or supplier with fewer than 10 full-time equivalent employees." Many small practices qualify for paper and file electronically anyway because it is faster and cheaper.

## How to Build It

The core `charges`, `claims` and `claim_lines` hold the billable services and the bill, with the claim's kind, frequency, control numbers and status. This chapter adds dental and diagnosis detail, routing and deadline fields, each submission and its acknowledgments, scrubber findings and attachments:

```sql
ALTER TABLE charges                      -- code, modifiers, units, fee and service_on are core
  ADD COLUMN diagnosis_codes  TEXT[] NOT NULL DEFAULT '{}',   -- ICD-10-CM, in pointer order
  ADD COLUMN tooth            TEXT,                           -- dental: universal numbering
  ADD COLUMN surfaces         TEXT[],                         -- 'M', 'O', 'D', 'B', 'L', 'I'
  ADD COLUMN oral_area        TEXT,                           -- quadrant or arch
  ADD COLUMN review_status    TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN
                                ('pending', 'reviewed', 'held'));

ALTER TABLE claims                       -- kind, frequency, replaces_claim_id, the control and payer
                                         -- claim numbers, coverage_id and status are core
  ADD COLUMN purpose           TEXT NOT NULL DEFAULT 'claim' CHECK (purpose IN ('claim',
                                 'predetermination')),
  ADD COLUMN cob_order         SMALLINT NOT NULL DEFAULT 1,   -- the coverage's priority when billed
  ADD COLUMN rendering_role_id UUID REFERENCES practitioner_roles (id),
  ADD COLUMN place_of_service  TEXT NOT NULL,
  ADD COLUMN prior_auth_number TEXT,
  ADD COLUMN rejected_by       TEXT CHECK (rejected_by IN ('syntax', 'clearinghouse', 'payer')),
  ADD COLUMN timely_filing_due DATE NOT NULL;                 -- computed from the payer's rule

ALTER TABLE claim_lines                  -- charge_id, code, modifiers, units, charge and diagnoses are core
  ADD COLUMN line_control_number TEXT NOT NULL,               -- echoed on 277CA and 835 lines
  ADD COLUMN revenue_code     TEXT,                           -- 837I
  ADD COLUMN tooth            TEXT,
  ADD COLUMN surfaces         TEXT[],
  ADD COLUMN prosthesis       TEXT CHECK (prosthesis IN ('initial', 'replacement')),
  ADD COLUMN prior_placement  DATE;

CREATE TABLE claim_submissions (         -- each time a claim is sent, and what answered it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id         UUID NOT NULL REFERENCES claims (id),
  attempt          SMALLINT NOT NULL,
  idempotency_key  TEXT NOT NULL UNIQUE,
  outbound_txn_id  UUID NOT NULL REFERENCES edi_transactions (id),
  ack_999_txn_id   UUID REFERENCES edi_transactions (id),
  ack_277ca_txn_id UUID REFERENCES edi_transactions (id),
  ack_source       TEXT CHECK (ack_source IN ('clearinghouse', 'payer')),
  ack_status       TEXT CHECK (ack_status IN ('accepted', 'rejected')),
  ack_codes        JSONB,                  -- claim status category and code pairs
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at  TIMESTAMPTZ,
  UNIQUE (claim_id, attempt)
);

CREATE TABLE claim_edits (               -- scrubber findings
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id         UUID NOT NULL REFERENCES claims (id),
  claim_line_id    UUID REFERENCES claim_lines (id),
  rule_source      TEXT NOT NULL CHECK (rule_source IN ('syntax', 'payer', 'ncci_ptp', 'ncci_mue',
                     'coverage', 'practice')),
  rule_id          TEXT NOT NULL,
  rule_version     TEXT NOT NULL,          -- e.g. the NCCI quarter
  severity         TEXT NOT NULL CHECK (severity IN ('error', 'warning')),
  message          TEXT NOT NULL,
  resolved_by      UUID,
  resolution       TEXT CHECK (resolution IN ('fixed', 'overridden', 'not_applicable')),
  resolved_note    TEXT,                   -- required for an override
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE claim_attachments (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id          UUID NOT NULL REFERENCES claims (id),
  document_id       UUID NOT NULL REFERENCES documents (id),
  report_type       TEXT NOT NULL,         -- PWK01: radiograph, perio chart, narrative, notes
  transmission      TEXT NOT NULL CHECK (transmission IN ('electronic', 'fax', 'mail', 'portal')),
  control_number    TEXT NOT NULL,         -- PWK06, ties the document to the claim
  solicited         BOOLEAN NOT NULL DEFAULT FALSE,
  sent_txn_id       UUID REFERENCES edi_transactions (id),  -- a 275, where supported
  sent_at           TIMESTAMPTZ
);
```

Design notes:

- **Claims are built from charges and never edited after submission.** A change after acceptance is a replacement claim that references the original; the original row stays as sent.
- **Overrides need a reason.** A scrubber error a person overrides records who and why; overrides of NCCI edits are reviewed in compliance audits.
- **Rule sets are versioned by date.** A claim is scrubbed against the NCCI quarter in effect on its date of service, and the version is recorded.
- **Status is derived from the latest acknowledgment,** with `rejected_by` saying which layer rejected, with the history kept in `claim_submissions`; a claim's display status never goes backward without a new submission.
- **Events:** `claim.ready`, `claim.submitted`, `claim.rejected`, `claim.accepted` and `claim.adjudicated` feed the work queues of [The Revenue Cycle](/books/health-tech/revenue-cycle#how-to-build-it).

## Auditing

- **What was billed:** each claim as sent, with the raw 837, the charges it came from and the documentation those charges rest on.
- **Every edit and override,** with the rule version and the person, because coding overrides are what auditors sample.
- **Proof of timely filing:** submission timestamps and acknowledgments, kept with the claim.
- **Corrections and voids,** linked to originals, so a claim's full history is one chain.
- **Attachments sent,** with control numbers and dates, so "we never received the X-ray" can be answered.

## What This Means for the System You Build

- **Build claims from reviewed charges** and treat a submitted claim as immutable; correct with replacement and void claims that point at the original.
- **Model the three 837s,** with dental's teeth, surfaces, areas, prosthesis dates and predeterminations as first-class fields, and keep paper form output for the payers and patients who need it.
- **Scrub with dated rule sets:** syntax, payer edits, NCCI PTP and MUE quarters, coverage rules, and the practice's own denial history.
- **Never add modifiers to clear an edit;** route to a person with the documentation.
- **Separate rejected from denied,** and track 999, clearinghouse 277CA and payer 277CA as distinct acknowledgments.
- **Compute timely filing deadlines when the charge is created** and keep acknowledgments as proof.
- **Plan for the 275 attachment standard** by May 2028 while supporting the dental attachment networks practices use today.

## References

**Regulations and federal programs**

- [42 CFR 424.44: Time limits for filing claims](https://www.law.cornell.edu/cfr/text/42/424.44), one calendar year after the date of service and its exceptions
- [42 CFR 424.32: Basic requirements for all claims](https://www.law.cornell.edu/cfr/text/42/424.32), electronic initial claims and the small provider exceptions
- [45 CFR 162.1102: Standards for health care claims](https://www.law.cornell.edu/cfr/text/45/162.1102), the 837P, 837I and 837D versions
- [CMS: NCCI edits](https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits), PTP edits, MUEs, quarterly updates and replacement files
- [CMS: Medicare NCCI FAQ library](https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-faq-library), modifiers 59, XE, XP, XS, XU and 25
- [CMS: Claims attachments final rule fact sheet (CMS-0053-F)](https://www.cms.gov/files/document/nsg-attachments-final-rule-fact-sheet.pdf), the 275 and 277 standards, C-CDA and attachment guides, prior authorization attachments dropped, projected savings
- [X12: Final rule advancing standardized claims attachments](https://x12.org/news-and-events/news/x12-applauds-final-rule-advancing-standardized-health-care-claims-attachments), the effective date
- [MGMA: Electronic claims attachment transaction standards](https://www.mgma.com/federal-policy-resources/april-20-2026-electronic-claims-attachment-transaction-standards), the May 26, 2028 compliance date

**Forms**

- [NUCC: 1500 Claim Form](https://www.nucc.org/index.php/1500-claim-form-mainmenu-35), version 02/12 in use since April 1, 2014
- [NUBC](https://www.nubc.org/), the UB-04 and its official data specifications manual
- [ADA: Dental Claim Form](https://www.ada.org/publications/cdt/ada-dental-claim-form), the 2024 version and who maintains it

**Companion guides and vendor documentation**

- [CGS Medicare: 837P companion guide](https://www.cgsmedicare.com/pdf/edi/837p_compguide.pdf), the TA1, 999 and 277CA, testing requirements, amount and identifier limits
- [CMS: Medicare fee-for-service companion guides](https://www.cms.gov/medicare/coding-billing/electronic-billing/medicare-fee-for-service-compainion-guides), every Medicare contractor's guides
- [Stedi: Submit professional claims](https://www.stedi.com/docs/healthcare/submit-professional-claims), the CMS-1500 JSON shape, rejected claims and 201 responses, automatic 277CA and 835 processing, idempotency
- [Stedi: Submit dental claims](https://www.stedi.com/docs/healthcare/submit-dental-claims), the 837D, tooth and surface fields, attachments, the synchronous 277CA, control number length
- [Claim.MD: Pricing](https://www.claim.md/pricing), paper claim and attachment fees
- [Office Ally: Pricing](https://cms.officeally.com/products/pricing), attachment fees
- [Vyne Dental: Vyne Trellis](https://vynedental.com/blog/unlock-the-potential-of-vyne-trellis/), dental claims and attachments
- [DentalXChange: Real-Time](https://help.dentalxchange.com/DentalXChangeHelp/RealTime.htm), direct-entry claims from eligibility results
