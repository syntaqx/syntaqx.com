+++
title = "EHRs, PMSs & the Clinical Record"
nav_title = "EHRs, PMSs & the Record"
description = "What an EHR and a PMS each hold, the problem list, meds, allergies and notes, charting by specialty, the legal record, amendments and retention by state."
category = "Health Tech Industry"
order = 1906
part = "Records and Interoperability"
tags = ["health-tech", "ehr", "pms", "clinical-record", "dental-charting", "retention"]
+++

Two kinds of system hold a practice's records. A **practice management system (PMS)** runs the business: the schedule, patient demographics, insurance, charges, claims, payments and the patient ledger. An **electronic health record (EHR)** holds the clinical story: problems, medications, allergies, notes, orders, results and the plan. In a hospital they are separate products that share a patient index; in a small practice they are usually one product with two halves (a PM/EHR), and in dentistry, optometry, physical therapy and veterinary medicine the product calls itself practice management software even though it holds the chart, because those specialties never split the two. Every integration in this part starts by knowing which half of which product owns the record you want.

The clinical record is also a legal record. What is written, by whom, when it was signed, what was added later and why, and how long it is kept are governed by HIPAA, by Medicare's conditions and contracts, and by each state's licensing board, and the rules differ by profession. A note is never edited in place once signed; it is amended. A record is kept for the longest period any rule requires. And the chart a patient has a right to see is defined by regulation, not by the product's table list. This chapter covers what the record holds, how each specialty charts, and the rules of the legal record; the transport standards that move it are [HL7 v2 & Interfaces](/books/health-tech/hl7-v2) and [FHIR](/books/health-tech/fhir), and the codes inside it are [Terminologies & Code Sets](/books/health-tech/terminology-and-coding).

## How the Platforms Do It

EHR adoption among physicians is nearly universal: ASTP/ONC reports that as of 2024, 95% of US office-based physicians had adopted any EHR and 91% a certified one, up from 21% with any EHR in 2004. What differs is the shape of the product. As of October 2026, from each vendor's own public pages:

| Vendor | Setting | What its public pages describe |
| --- | --- | --- |
| **Epic** | Health systems, payers, post-acute and standalone specialties | One integrated suite with the MyChart patient experience; a public interface catalog (open.epic) with HL7 v2 and FHIR interfaces |
| **eClinicalWorks** | Ambulatory | Cloud EHR with telehealth, patient engagement, population health and revenue cycle; 180,000+ physicians and NPs and 110,000+ facilities |
| **ModMed** | Specialty medical practices | "Specialty EHR, PM & RCM Software" for specialty medical practices |
| **Dentrix (Henry Schein One)** | Dental | On-premises practice management, with Dentrix Ascend as the cloud counterpart |
| **Open Dental** | Dental | Highly customizable practice management running on MariaDB or MySQL on the practice's own server; procedure records carry tooth, surfaces, quadrant, sextant and arch |
| **Compulink** | Optometry and ophthalmology | Combined EHR and practice management for eye care |
| **WebPT** | Rehab therapy | EMR, scheduling and billing for physical, occupational and speech therapists |
| **ezyVet (IDEXX)** | Veterinary | Cloud practice management linking medical records, lab and imaging work, invoicing and client messaging |

Three patterns follow from the table. **The specialty decides the chart.** A dental product's core screen is a tooth chart; an eye care product's is a refraction and a prescription; a therapy product's is a plan of care with goals and visit counts; a general EHR's is a problem list and a note. **Small-practice software still runs on a server in the office.** Open Dental documents its own database server; Dentrix is on-premises with a cloud sibling; the integration consequences are in Integrating with Practice Management Systems in Part 5. **The PM half and the EHR half are one database in most ambulatory products,** so a scheduling integration and a clinical one are often the same connection with different permissions.

## EHR, PMS or Both

What lives where, in the vocabulary of [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model):

| Record | PMS | EHR | Notes |
| --- | --- | --- | --- |
| `patients`, `patient_identifiers`, `contacts` | Owns | Reads or shares | Registration happens at the front desk; the EHR's patient index is the PMS's in a combined product |
| `guarantors`, `coverages` | Owns | Reads | Insurance and who pays are business records |
| `appointments`, `schedules` | Owns | Reads | An encounter usually starts from an appointment |
| `encounters` | Shares | Owns the clinical content | The visit is the join between the money and the chart |
| `conditions`, `allergies`, `medication_requests`, `observations` | Rarely | Owns | Dental and vet products hold these in the "medical history" form |
| `procedures` | Owns the billable line | Owns the documentation | In dentistry the procedure is both the chart mark and the charge |
| `documents` | Attachments, forms | Notes, letters, results | The note is the legal center of the visit |
| `charges`, `claims`, `ledger_entries` | Owns | Never | |

Where the two halves are separate products, the boundary runs through the encounter and the procedure: the EHR documents what was done and codes it, the PMS turns the coded procedure into a charge. That handoff is where most billing integrations break (a charge without documentation, documentation without a charge), and it is the DFT message in HL7 v2 terms ([HL7 v2 & Interfaces](/books/health-tech/hl7-v2#the-messages-that-run-a-practice)).

## What the Clinical Record Holds

The federal floor for what an EHR must be able to exchange is the **United States Core Data for Interoperability (USCDI)**, a list of data classes and elements that ASTP/ONC versions yearly (v1 July 2020, v3 October 2022, v5 July 2024, v6 July 24, 2025). HTI-1 made USCDI v3 the certification baseline: by December 31, 2025, certified modules had to exchange its classes, and USCDI v1 expired for certification on January 1, 2026. Its classes are a fair map of a chart: patient demographics, problems, medications, allergies and intolerances, immunizations, laboratory, vital signs, procedures, clinical notes, assessment and plan of treatment, goals, health concerns, care team members, encounter information, unique device identifiers for implants, smoking status, and newer classes for health insurance information, health status assessments and orders.

The core lists, and what each must carry to be useful:

- **The problem list** is the patient's current and past conditions, each with a code (SNOMED CT for clinical meaning, ICD-10-CM for billing), an onset, a clinical status (active, resolved, inactive) and who recorded it. Encounter diagnoses are different: they are the reasons for one visit, coded for the claim, and they don't all belong on the long-term list. My rule: keep both as `conditions` rows with a `category` of `problem_list_item` or `encounter_diagnosis`, the FHIR distinction, so a billing code chosen for one claim never silently becomes a lifelong diagnosis.
- **The medication list** is what the patient takes, which is not the same as what was prescribed here. Prescriptions written in this practice are `medication_requests`; medications the patient reports, or that another prescriber wrote, are statements with a source. Reconciliation (comparing lists at a transition of care and deciding what's current) is a clinical act the system records, never a merge it performs.
- **Allergies and intolerances** carry the substance (coded), the reaction, severity, criticality and a verification status (unconfirmed, confirmed, refuted). "No known allergies" is an assertion with a date and a recorder, not an empty list; an empty list means nobody asked.
- **Observations** are vitals, lab results and assessments, each a code (usually LOINC), a value with units, a time, and a status (preliminary, final, corrected).
- **Notes** are the narrative: the history, the exam, the reasoning and the plan. They are `documents`, and the legal weight of the record sits in them.

### Notes and Signatures

The dominant note shape is **SOAP**: Subjective (what the patient reports), Objective (exam findings, vitals, results), Assessment (the clinician's interpretation and diagnoses) and Plan (orders, prescriptions, follow-up). Dental, therapy and veterinary notes use it as much as medicine does; a vet SOAP note's subjective section is the owner's account. Templates and macros generate most of the text, which is why the auditable facts are not the words but the lifecycle around them:

1. **Draft.** The note is being written, often by a scribe, an assistant or now an AI scribe (Practice Analytics & AI Front Desk in Part 5 covers ambient documentation).
2. **Signed.** The responsible clinician authenticates it. Medicare's hospital conditions of participation require every entry to be "legible, complete, dated, timed, and authenticated" by the person responsible (42 CFR 482.24(c)(1)), and the same expectation runs through payer audits everywhere. Open Dental's procedure screen shows the mechanics at small-practice scale: editing a signed note or changing its user clears the electronic signature and raises an alert, and a preference can block signing until template prompts are complete.
3. **Locked.** After signing, the note doesn't change. Corrections are new entries.
4. **Amended or addended.** An **addendum** adds information (a late result, a phone call) under a new date and signature; a **correction** marks an error and supplies the right text, leaving the original visible as struck through; an **amendment** in the HIPAA sense is the patient's request to change the record (below).
5. **Co-signed.** Supervised clinicians (residents, physician assistants in some states, hygienists in some settings) have notes co-signed, and the co-signature is its own dated act.

Electronic signatures in the clinical record are the general e-signature rules plus the profession's: who may sign, what a signature attests, and that it is bound to the content it signed ([Electronic Signatures & Records](/docs/compliance/electronic-signatures)).

## Charting by Specialty

The core model holds every specialty, but each charts with its own vocabulary, and an integration that ignores it loses the meaning.

### Dental: Teeth, Surfaces and Status

Dentistry charts on an **odontogram**, a diagram of the mouth, and every finding and procedure attaches to a tooth, a surface, a quadrant, a sextant or an arch. Open Dental supports four tooth numbering systems: **Universal**, common in the US, numbers permanent teeth 1 through 32 and primary teeth with the letters A through T; **FDI/ISO** (international) uses two digits, 11 to 48 for permanent teeth and 51 to 85 for primary ones, where the first digit is the quadrant; Haderup and Palmer are the others. Surfaces are letters: M (mesial), O or I (occlusal for back teeth, incisal for front), D (distal), B or F (buccal or facial), L (lingual) and V (a cervical surface). A two-surface filling on a lower molar is "tooth 30, MO"; in FDI the same tooth is 46.

The dental chart also carries a **status** on every procedure, which is what makes it a chart and not a list of charges. Open Dental's statuses are a good public example of the set: treatment planned, complete, complete (in process), existing by the current provider, existing by another provider, referred out, condition, treatment planned inactive, and deleted. "Existing other" is a crown the patient arrived with; "condition" is a finding (a fracture, decay) that isn't a procedure; "treatment planned" is a proposal waiting for case acceptance and is the inventory a practice's recall and treatment follow-up chase. Each status draws differently on the tooth chart, and each matters to the business: only complete procedures become charges, treatment planned ones drive estimates, and existing ones drive insurance frequency limits (a crown placed elsewhere four years ago can make a new one unpayable).

The procedure code is CDT, and the code's **treatment area** decides which location field is required: Open Dental requires a tooth number when the area is tooth, surfaces when it is surface, a quadrant (UR, UL, LR, LL), a sextant (1 to 6 in the US) or an arch (U or L) otherwise. Periodontal charting (six pocket depths per tooth, bleeding, recession, mobility) and treatment plans and case acceptance belong to Dental Practice in Part 5.

### Optometry: The Prescription Is the Product

An eye exam produces a refraction, and the refraction produces a prescription the patient may take anywhere. The FTC's Eyeglass Rule defines a prescription as "the written specifications for lenses for eyeglasses which are derived from a refractive eye examination" (16 CFR 456.1), and the Contact Lens Rule requires a contact lens prescription to carry the patient's name, the exam date, the issue and expiration dates, the prescriber's name, postal address, phone and fax, the lens power, material or manufacturer or both, the base curve, and the diameter when appropriate (16 CFR 315.2). A spectacle prescription is structured per eye: sphere, cylinder, axis, an add for near, prism and base, and pupillary distance where the state requires it. The record is per eye, effective-dated, and must be releasable to the patient; the release obligations themselves (automatic release, confirmations of receipt) are Optometry, PT & Other Specialties in Part 5.

### Physical Therapy: The Plan of Care

Therapy charts around a **plan of care**: a diagnosis, goals, and the type, amount, frequency and duration of treatment, established before treatment by a physician, the treating therapist, or an NP or PA (42 CFR 410.61). Medicare requires a physician, NP, PA or CNS to certify it, and **recertification at least every 90 days**; when a therapist establishes the plan, the therapist must have evidence it was delivered to the certifying practitioner within 30 days of the initial evaluation (42 CFR 424.24(c)). So a PT record is a plan with an effective range and a certification state, visits counted against it, progress reports at intervals, and a discharge summary. A visit outside a certified plan is a billing problem before it is a clinical one.

### Veterinary: The Patient Is the Animal

In a vet record the patient is the animal and the client is the owner, the split the core model already makes (`patients` for the animal, with `kind = 'animal'`, and `guarantors` for the client who owns and pays). State veterinary boards set the record contents: Florida's rule, for example, requires the owner's or agent's name, patient identification, vaccinations given, the reason for the visit, history, physical exam findings including weight, temperature, pulse and respiration (or why any weren't taken), a note when the exam was by telehealth, current illness or injury, and a provisional diagnosis, plus lab reports, radiographs, treatment and medications with route, strength, dosage and time where applicable (Florida Administrative Code 61G18-18.002). Vet records are generally outside HIPAA and governed by state confidentiality rules, which Veterinary Practice in Part 5 covers.

## The Legal Medical Record

Two definitions decide what the record is for the patient and for a court.

**The designated record set** is HIPAA's term for what a patient can see and ask to amend: for a provider, "the medical records and billing records about individuals," plus any other records "used, in whole or in part, by or for the covered entity to make decisions about individuals," where a record is any item or grouping that includes PHI and is maintained, collected, used or disseminated by or for the entity (45 CFR 164.501). Two consequences for a product: billing records are in it as much as notes are, and so is anything a clinician relied on, including an outside record that was incorporated. Draft notes, internal quality reviews and audit logs are usually not, but that is a policy each covered entity documents, not a property of a table. The right of access to that set (timing, fees, formats) belongs to HIPAA in Practice in Part 3.

**The legal health record** is the narrower set the organization produces as its business record for legal proceedings and release, defined by its own policy. In a product, the practical question is the same either way: can the system reproduce, for a date in the past, exactly what the chart said, who wrote and signed each entry, and what was added later? If it can't, the practice can't defend its record.

### Amendments

A patient may ask a covered entity to amend information in the designated record set. The entity must act within **60 days of receipt**, with one extension of no more than 30 days if it tells the patient in writing within the first 60 (45 CFR 164.526(b)(2)). It may deny the request if it didn't create the record, the information isn't part of the designated record set, it wouldn't be available for inspection, or it "is accurate and complete." An accepted amendment must be appended or linked to the affected records, and the entity must make reasonable efforts to send it to people the patient names and to anyone, business associates included, who may have relied on the old information. A denial lets the patient file a statement of disagreement, which the entity may limit in length, and the request, denial, statement and any rebuttal must be appended or linked to the disputed record.

Every one of those steps is a record. The amendment never overwrites the original; it is linked to it and travels with it in future disclosures, which is the playbook's [Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite) with a regulatory deadline attached.

## Retention by State

There is no single federal retention period for medical records. HIPAA requires its *documentation* (policies, procedures, authorizations and other required records) to be kept six years from creation or last effective date (45 CFR 164.530(j)), but leaves medical record retention to the states and to other federal programs. The rules that bind a practice stack:

| Rule | Who | Period |
| --- | --- | --- |
| **Florida Board of Medicine** (64B8-10.002) | Physicians | At least five years from the last patient contact, with a four-week newspaper notice when a practice closes or relocates |
| **Florida Board of Veterinary Medicine** (61G18-18.002) | Veterinarians | At least three years after the date of last entry |
| **Medicare hospital conditions of participation** (42 CFR 482.24(b)(1)) | Hospitals | At least five years, in original or legally reproduced form |
| **Medicare Advantage contracts** (42 CFR 422.504(d)) | MA organizations, and by flow-down their contracted providers | Ten years for books, records and documents |

Florida's physician rule makes the point explicitly: the board says its periods "may well be less than the length of time necessary for protecting the physician," and suggests consulting counsel or the malpractice insurer about keeping records longer. Some rules measure a minor's record from the age of majority rather than the last visit, which makes the patient's birth date an input, and a practice keeps records for the longest of its state board's rule, its payer contracts, the statute of limitations its insurer cares about, and any litigation hold. Texas repealed and replaced its physician record rule effective January 9, 2025, which is a reminder that these periods are versioned data. The retention schedule itself is the playbook's [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type); what health adds is the profession and the patient's age at the time of service as inputs. What happens to records after a practice switches software is Data Migration & Conversions in Part 10.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The core already gives conditions and allergies a clinical status and criticality, and documents a content hash and a `supersedes_id`; this chapter adds the FHIR distinctions the lists still lack (category, verification status, source), a note lifecycle with signatures, the dental location fields on procedures and the findings that aren't procedures, the amendment workflow and retention rules. The specialty records sketched above (eyewear prescriptions as `vision_prescriptions`, therapy `plans_of_care`) are built in Optometry, PT & Other Specialties in Part 5.

```sql
ALTER TABLE conditions
  ADD COLUMN category            TEXT NOT NULL DEFAULT 'problem_list_item'
                                   CHECK (category IN ('problem_list_item',
                                   'encounter_diagnosis', 'health_concern')),
  ADD COLUMN verification_status TEXT CHECK (verification_status IN ('unconfirmed',
                                   'provisional', 'differential', 'confirmed', 'refuted',
                                   'entered_in_error')),
  ADD COLUMN source_integration_id UUID REFERENCES integrations (id);  -- null: charted here

ALTER TABLE allergies
  ADD COLUMN assertion           TEXT NOT NULL DEFAULT 'allergy'
                                   CHECK (assertion IN ('allergy', 'no_known_allergies',
                                   'no_known_drug_allergies')),
  ADD COLUMN verification_status TEXT CHECK (verification_status IN ('unconfirmed',
                                   'confirmed', 'refuted', 'entered_in_error')),
  ADD COLUMN recorded_by         UUID REFERENCES practitioner_roles (id),
  ADD COLUMN source_integration_id UUID REFERENCES integrations (id);

CREATE TABLE clinical_notes (            -- a note's lifecycle; the signed text is a document
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  encounter_id      UUID REFERENCES encounters (id),
  note_type         TEXT NOT NULL,       -- LOINC document type code
  format            TEXT NOT NULL DEFAULT 'soap' CHECK (format IN ('soap', 'narrative',
                      'template', 'dictated')),
  author_role_id    UUID NOT NULL REFERENCES practitioner_roles (id),
  drafted_by        TEXT NOT NULL DEFAULT 'author' CHECK (drafted_by IN ('author', 'scribe',
                      'assistant', 'ai_scribe')),
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'signed', 'entered_in_error')),
  draft_content     JSONB,               -- editable until signed; cleared at signing
  document_id       UUID REFERENCES documents (id),  -- the signed rendering, immutable
  signed_by_role_id UUID REFERENCES practitioner_roles (id),
  signed_at         TIMESTAMPTZ,
  relates_to_id     UUID REFERENCES clinical_notes (id),
  relation          TEXT CHECK (relation IN ('addendum', 'correction', 'cosignature',
                      'patient_amendment', 'statement_of_disagreement', 'rebuttal')),
  CHECK (status <> 'signed' OR (document_id IS NOT NULL AND signed_by_role_id IS NOT NULL
                                AND signed_at IS NOT NULL)),
  CHECK ((relates_to_id IS NULL) = (relation IS NULL))
);

ALTER TABLE procedures                   -- the dental location fields
  ADD COLUMN tooth_system   TEXT CHECK (tooth_system IN ('universal', 'fdi')),
  ADD COLUMN tooth          TEXT,        -- '30', 'K', '46': text, the systems differ
  ADD COLUMN surfaces       TEXT CHECK (surfaces ~ '^[MODBLFIV]*$'),  -- 'MO', 'MODBL'
  ADD COLUMN quadrant       TEXT CHECK (quadrant IN ('UR', 'UL', 'LR', 'LL')),
  ADD COLUMN sextant        SMALLINT CHECK (sextant BETWEEN 1 AND 6),
  ADD COLUMN arch           TEXT CHECK (arch IN ('U', 'L')),
  ADD COLUMN referred_out   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD CONSTRAINT procedures_tooth_has_system CHECK (tooth IS NULL OR tooth_system IS NOT NULL);

CREATE TABLE tooth_findings (            -- what's on the chart that this practice didn't do
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  kind              TEXT NOT NULL CHECK (kind IN ('condition', 'existing_current_provider',
                      'existing_other_provider', 'missing', 'primary_retained',
                      'supernumerary')),
  code_system       TEXT CHECK (code_system IN ('cdt', 'snomed', 'local')),
  code              TEXT,                -- the existing restoration's CDT code, or the finding
  display           TEXT NOT NULL,
  tooth_system      TEXT NOT NULL CHECK (tooth_system IN ('universal', 'fdi')),
  tooth             TEXT NOT NULL,
  surfaces          TEXT CHECK (surfaces ~ '^[MODBLFIV]*$'),
  placed_on         DATE,                -- existing work: when, if known (frequency limits)
  recorded_by       UUID REFERENCES practitioner_roles (id),
  status            TEXT NOT NULL DEFAULT 'current'
                      CHECK (status IN ('current', 'resolved', 'entered_in_error')),
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE amendment_requests (        -- the patient's request, 45 CFR 164.526
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  patient_id         UUID NOT NULL REFERENCES patients (id),
  received_at        TIMESTAMPTZ NOT NULL,
  requester          TEXT NOT NULL CHECK (requester IN ('patient', 'personal_representative')),
  requester_name     TEXT,               -- the representative; authority is a consents row
  target_ids         UUID[] NOT NULL,    -- the records it concerns
  request_text       TEXT NOT NULL,
  due_on             DATE NOT NULL,      -- received + 60 days
  extended_to        DATE,               -- at most once, at most 30 more days
  extension_notice_sent_at TIMESTAMPTZ,
  decision           TEXT CHECK (decision IN ('accepted', 'accepted_in_part', 'denied')),
  denial_basis       TEXT CHECK (denial_basis IN ('not_created_here', 'not_in_drs',
                       'not_accessible', 'accurate_and_complete')),
  decided_by         UUID REFERENCES practitioner_roles (id),
  decided_at         TIMESTAMPTZ,
  amendment_note_id  UUID REFERENCES clinical_notes (id),
  CHECK (extended_to IS NULL OR extended_to <= due_on + 30)
);

CREATE TABLE record_retention_rules (    -- rules as data, by jurisdiction and profession
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction     TEXT NOT NULL,        -- 'US-FL', 'US' for federal programs
  profession       TEXT NOT NULL,        -- 'physician', 'dentist', 'veterinarian', 'hospital'
  record_type      TEXT NOT NULL,        -- 'medical_record', 'radiograph', 'contract'
  years_after      INT NOT NULL,
  measured_from    TEXT NOT NULL CHECK (measured_from IN ('last_contact', 'last_entry',
                     'service_date', 'age_of_majority', 'contract_end')),
  citation         TEXT NOT NULL,        -- '64B8-10.002'
  valid_during     DATERANGE NOT NULL
);
```

Design decisions:

- **Clinical lists keep their statuses.** A refuted allergy, a resolved problem and an entered-in-error medication stay in the record with their status; deleting them would erase what a clinician once relied on. `entered_in_error` is a status, never a `DELETE`, as the core already decides.
- **Imported is not charted.** `source_integration_id` says a problem or allergy came from an outside record or a sync, so reconciliation and the designated record set know which entries this practice made.
- **A signature binds to a document.** While a note is a draft its content lives in `clinical_notes`; signing renders it to a `documents` row, whose `content_sha256` is what the signature attests to, and clears the draft. The signed document never changes. Addenda, corrections, co-signatures and amendments are new notes that point at the original through `relates_to_id`, each with its own signed document.
- **Who drafted is recorded.** `drafted_by` separates a clinician's own note from a scribe's, an assistant's or an AI scribe's draft that the clinician signed, which payers and boards increasingly ask about.
- **The dental chart is procedures plus findings.** Planned, in-progress and completed work are `procedures` rows (the core's statuses), with tooth, surfaces, quadrant, sextant and arch; conditions, existing restorations and missing teeth are `tooth_findings`, because they are on the chart but were never this practice's procedure and never become a charge. Only completed procedures become charges. Tooth numbers are text because Universal uses letters for primary teeth and FDI uses two digits, and conversion between them is a lookup, not arithmetic.
- **Amendment deadlines are columns.** `due_on` and `extended_to` are computed on receipt, and the constraint enforces the one 30-day extension; a representative's authority to ask is evidenced by a `consents` row (Consent, Authorization & Proxies in Part 3).
- **Retention is rules, resolved per record.** The longest applicable rule wins, and the evaluation is stored with the record ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Auditing

The record is evidence for patients, payers, boards and courts, and each asks a different question:

- **What did the chart say on a given date?** Every version of every note and list entry, with author, signer and times ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)).
- **Who signed what, and was it changed after?** Signatures with content hashes, co-signatures, and every addendum and correction linked to its original.
- **Who looked?** Reads of clinical records, not just writes, because HIPAA access reports and privacy investigations need them ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Amendment requests,** with receipt dates, deadlines, extensions, decisions, denial bases, statements of disagreement and the notices sent to people who relied on the record.
- **Where each entry came from:** charted here, imported from a document, synced from a PMS, or written by an AI scribe and signed by a clinician.
- **Retention and destruction:** which rule kept a record and when it became eligible for destruction, and any hold that overrode it.

## What This Means for the System You Build

- **Know which half owns the record.** Map every record you read or write to the PMS or EHR half of the vendor's product, and expect most small-practice products to be both in one database.
- **Keep FHIR's shapes for clinical lists:** categories, clinical and verification statuses, recorders and sources, so problems, allergies and medications map without translation and are never deleted.
- **Separate the problem list from encounter diagnoses,** so a billing code for one claim doesn't become a lifelong condition.
- **Treat notes as signed, locked documents,** with addenda, corrections, co-signatures and amendments as linked new records and signatures bound to the content's hash.
- **Model specialty charts natively:** teeth, surfaces and chart status for dental, per-eye prescriptions for optometry, certified plans of care for therapy, owner and animal for vet.
- **Build the amendment workflow with its deadlines,** from receipt through decision, notices and statements of disagreement.
- **Load retention as versioned rules** by jurisdiction, profession and record type, and keep every record for the longest rule that applies.

## References

**Regulations and rules**

- [45 CFR 164.501: Definitions (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.501), the designated record set and record definitions
- [45 CFR 164.530: Administrative requirements (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.530), HIPAA documentation retained six years
- [45 CFR 164.526: Amendment of protected health information (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.526), 60 days, one 30-day extension, denial grounds, statements of disagreement, informing people who relied on the record
- [42 CFR 482.24: Medical record services (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/482.24), hospital retention of at least 5 years, entries legible, complete, dated, timed and authenticated
- [42 CFR 422.504: Contract provisions (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/422.504), Medicare Advantage records kept 10 years
- [42 CFR 410.61: Plan of treatment requirements for outpatient rehabilitation services (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/410.61), diagnosis, goals, type, amount, frequency and duration, who establishes the plan
- [42 CFR 424.24: Requirements for medical and other health services (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/424.24), certification of therapy plans, recertification at least every 90 days, delivery within 30 days of the initial evaluation
- [16 CFR 456.1: Eyeglass Rule definitions (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/456.1), the definition of an eyeglass prescription
- [16 CFR 315.2: Contact Lens Rule definitions (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/315.2), required elements of a contact lens prescription
- [Florida Administrative Code 64B8-10.002: Medical records retention (Cornell LII)](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-64B8-10-002), five years from last contact, closure notices, the board's advice to keep longer
- [Florida Administrative Code 61G18-18.002: Veterinary medical records (Cornell LII)](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-61G18-18-002), required contents and three-year retention
- [22 Texas Administrative Code 165.1 (Cornell LII)](https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-165-1), the physician record rule repealed effective January 9, 2025

**Agencies and standards**

- [ASTP/ONC: Office-based physician EHR adoption](https://www.healthit.gov/data/quickstats/office-based-physician-electronic-health-record-adoption), 95% any EHR and 91% certified EHR as of 2024, 21% in 2004
- [ASTP/ONC: United States Core Data for Interoperability](https://isp.healthit.gov/united-states-core-data-interoperability-uscdi), USCDI versions and release dates, data classes
- [ASTP/ONC: HTI-1 Final Rule Overview and Key Dates (PDF, October 2025)](https://www.healthit.gov/sites/default/files/2024-03/Overview-and-Key-Dates-2024_508.pdf), USCDI v3 by December 31, 2025 and USCDI v1 expiring January 1, 2026

**In practice**

- [Epic: Software](https://www.epic.com/software), settings served and MyChart
- [eClinicalWorks](https://www.eclinicalworks.com/), cloud EHR scope and user counts
- [ModMed](https://www.modmed.com/), specialty EHR, PM and RCM
- [Dentrix](https://www.dentrix.com/), on-premises practice management and Dentrix Ascend
- [Open Dental](https://www.opendental.com/), customizable dental practice management
- [Open Dental: Database management systems](https://www.opendental.com/manual/databasemanagementsystems.html), MariaDB or MySQL
- [Open Dental: Graphical tooth chart](https://www.opendental.com/manual/graphicaltoothchart.html), Universal, FDI/ISO, Haderup and Palmer numbering
- [Open Dental: Procedure](https://www.opendental.com/manual/procedureedit.html), tooth, surfaces, quadrant, sextant and arch fields, procedure statuses, signatures cleared on edit
- [Compulink](https://www.compulinkadvantage.com/), eye care EHR and practice management
- [WebPT](https://www.webpt.com/), rehab therapy EMR, scheduling and billing
- [ezyVet](https://www.ezyvet.com/), cloud veterinary practice management, IDEXX
