+++
title = "C-CDA, Documents & Images"
nav_title = "C-CDA, Documents & Images"
description = "Clinical documents and images: C-CDA templates, Direct secure messaging, fax and scans, DICOM, PACS and DICOMweb, and dental imaging bridges."
category = "Health Tech Industry"
order = 1910
part = "Records and Interoperability"
tags = ["health-tech", "c-cda", "direct-messaging", "dicom", "pacs", "documents"]
+++

Much of health care's exchange is still documents, not resources. When a patient is referred, discharged or seen somewhere new, what travels is a **summary document**: an XML file in the Consolidated Clinical Document Architecture (C-CDA) with a header naming the patient, author and custodian, a human-readable narrative, and coded entries for problems, medications, allergies and results. Epic alone reports 9.83 billion patient records exchanged a year through its Care Everywhere network, 54% of them with non-Epic organizations, and the national networks' core pattern is document query and retrieve ([Networks & Exchange](/books/health-tech/health-information-exchange)). Next to the XML sit the documents nobody structured: faxed referrals, scanned insurance cards and consent forms, PDFs from outside labs. And next to both sit images, which are their own standard, their own servers and the largest files in the record.

This chapter covers C-CDA, the Direct secure messaging that pushes documents between providers, fax and scanned documents, DICOM and PACS, and how dental practices bridge to imaging software. Claim attachments (the X12 275 and dental attachment services) belong to [Claims](/books/health-tech/claims#attachments) in Part 4, and the FHIR `DocumentReference` that indexes all of these is in [FHIR](/books/health-tech/fhir).

## How the Platforms Do It

As of October 2026:

| Platform | Documents and images, from public pages |
| --- | --- |
| **Epic** | Care Everywhere: 9.83 billion patient records exchanged annually, 54% to non-Epic organizations; outgoing imaging results and orders over HL7 v2 |
| **ASTP/ONC certified EHRs** | Must create and receive C-CDA transitions of care documents (CCD, Referral Note, and for inpatient settings Discharge Summary) and send and receive them over Direct (45 CFR 170.315(b)(1), (h)(1)) |
| **Open Dental** | "Program Links" to imaging software, including Carestream, Dexis, Schick CDR DICOM, Sirona Sidexis, Trophy and Planmeca bridges, launched by command line or an output file, with custom bridges for anything unlisted |
| **DICOM Standards Committee** | DICOM, "the international standard for medical images and related information," first published in 1993, recognized by ISO as 12052, with NEMA as secretariat; DICOMweb as RESTful services |

The table shows the split. **Medical documents are federal-standard:** certification fixes C-CDA and Direct for every certified EHR. **Images are vendor-specific at the small-practice edge:** a dental practice's X-rays live in the imaging vendor's software and database, and the practice management system launches it with the patient's id rather than holding the images itself.

## C-CDA

CDA (Clinical Document Architecture) is HL7's XML standard for clinical documents; **C-CDA** is the US library of CDA templates that consolidated earlier HL7, IHE and HITSP specifications. A C-CDA document has three layers:

- **The header**, constrained by the US Realm Header template: the document type (a LOINC code), the patient, author, custodian organization, the encounter it documents, legal authenticator and dates. A Patient Generated Document header covers documents a patient authors.
- **Sections**, each a template with a LOINC code and a human-readable `text` narrative: problems, medications, allergies, results, vital signs, immunizations, procedures, plan of treatment, social history and others.
- **Entries** inside sections, the coded, computable data: a problem observation with a SNOMED CT code, a medication activity with an RxNorm code, a result observation with LOINC and units.

The document types, from the C-CDA 5.0.0 implementation guide: Care Plan, Consultation Note, **Continuity of Care Document (CCD)**, Discharge Summary, History and Physical, Operative Note, Procedure Note, Progress Note, **Referral Note**, Transfer Summary, and Unstructured Document (a wrapper for a PDF or scanned image with a CDA header). The CCD is the workhorse: a summary of the patient's current state that networks return when asked for "the record."

**Versions.** Certification references C-CDA Release 2.1 with a companion guide: under HTI-1, modules certified to criteria that reference it had to move to Companion Guide Release 4.1, which supports USCDI v3, by December 31, 2025. HL7 has since published the guide as a web-based IG with yearly releases aligned to USCDI: 3.0.0 on May 18, 2024, 4.0.0 on June 20, 2025 and 5.0.0 on June 13, 2026, the last built on CDA R2 with FHIR R5 structure definitions for its templates. Certification criteria that reference C-CDA include transitions of care, clinical information reconciliation, and view, download and transmit; HTI-5 (effective December 28, 2026) revises those three and removes the care plan and C-CDA creation performance criteria ([The HTI Rules](/books/health-tech/information-blocking-and-certification#the-hti-rules)).

**Using a received document.** Three things make a C-CDA hard to consume well:

- **The narrative is the legal content.** CDA's rule is that the human-readable text is what was attested; entries are the computable version of it and may be incomplete. A system that discards the narrative and keeps only entries can lose the clinician's meaning.
- **Entries need reconciliation, not import.** A received medication list is another organization's statement. Certification's clinical information reconciliation criterion exists because incorporating outside problems, medications and allergies is a clinician's decision, which [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data#what-the-clinical-record-holds) models as imported entries with a source.
- **Quality varies by sender.** Templates allow null flavors, missing codes and free text; the same CCD template from two EHRs can differ in what's populated. A consumer validates against the templates, keeps what fails as a document, and never assumes a section is complete because it is present.

FHIR is the direction (C-CDA on FHIR maps the templates to FHIR Composition and resources), but every certified EHR and every national network still produces and consumes C-CDA, and a vendor reading records from networks reads C-CDA for years to come.

## Direct Secure Messaging

**Direct** is encrypted email for health care: a provider's Direct address (it looks like `dr.lee@direct.example-clinic.org`) sends a message with a C-CDA attached to another provider's Direct address, through a **HISP** (health information service provider) on each side. The certification transport standards are ONC's Applicability Statement for Secure Health Transport version 1.2, the XDR and XDM for Direct Messaging specification, and the Implementation Guide for Direct Edge Protocols (45 CFR 170.202). Certified health IT must send and receive under the Applicability Statement as a "wrapped" message and support the Delivery Notification in Direct standard (45 CFR 170.315(h)(1)), and the transitions of care criterion requires sending and receiving referral summaries through an edge protocol to a Direct service ((b)(1)). HTI-5 removes the standalone Direct criteria, (h)(1) and (h)(2), effective December 28, 2026, while the transitions of care criterion stays (revised from January 1, 2030), so Direct transport remains part of certification through (b)(1).

Underneath, Direct is S/MIME over SMTP: each address or domain has an X.509 certificate, and HISPs trust each other's certificates through shared trust bundles. Its strengths are that it's push (a referral goes to a specific recipient), addressable (a directory lookup finds the specialist) and universal among certified EHRs. Its weaknesses are the same as email's: a message lands in an inbox someone must triage, attachments vary in quality, and finding the right Direct address for a small practice is often the hardest step. [Referrals & Care Coordination](/books/health-tech/referrals-and-care-coordination#direct-messaging) in Part 6 covers how referral workflows use it, and how often they fall back to fax. DirectTrust, which accredits HISPs and publishes the trust bundles, reports about 3.2 million Direct addresses, 200,000 organizations served, 480 million messages sent and received in the last quarter and 9.6 billion cumulative messages as of October 2026; members of a trust bundle avoid one-off trust negotiations with each other. <!-- source-gap: directtrust-stats | status | DirectTrust's 3.2 million addresses, 200,000 organizations, 480 million quarterly and 9.6 billion cumulative messages | closes with: a fresh read of directtrust.org (behind a Cloudflare JavaScript challenge for fetchers on 2026-10-29, so the figures could not be re-read) | checked: 2026-10-29 -->

## Fax and Scanned Documents

Fax is still a clinical transport. ASTP/ONC's 2023 hospital interoperability brief found 70% of non-federal acute care hospitals engaged in all four domains of electronic exchange (send, find, receive, integrate) at least sometimes, and its definitions of sending and receiving exclude eFax, which tells you how much of the remaining exchange is not electronic in ONC's sense. Small practices receive referrals, records requests, prior authorization decisions and lab results by fax daily, and send them the same way.

A faxed or scanned page enters the record as a **document**: an image or PDF with a type, a date, a patient and an author (often unknown), filed to a chart by a person or by software. The work is in the filing:

- **Indexing:** which patient (matched on the cover sheet's name and birth date, which is [patient matching](/books/health-tech/patient-matching-and-identity) with worse inputs), which document type, which encounter or order it answers.
- **Extraction:** OCR and, increasingly, AI models turn a faxed lab result or referral into structured fields for a person to confirm. Extracted data is a proposal; the scanned page remains the source.
- **Routing:** a result goes to the ordering clinician's inbox, a records request to the release-of-information queue, an authorization to the billing team.

Misfiled documents are a privacy incident (one patient's records in another's chart) and a safety one, so filing is audited and correctable: a document moved from the wrong chart keeps the history of where it was and who saw it there.

## DICOM, PACS and DICOMweb

**DICOM** (Digital Imaging and Communications in Medicine) is the standard for medical images, first published in 1993 and recognized by ISO as ISO 12052. A DICOM object is pixel data plus a header of tagged attributes: patient, study, series, modality, equipment, acquisition parameters. The hierarchy is **patient, study** (one imaging exam, identified by a Study Instance UID), **series** (one acquisition within it) and **instance** (one image or object), and every level has a globally unique UID. Equipment sends images to a **PACS** (picture archiving and communication system), which stores them and serves them to viewers; a **VNA** (vendor neutral archive) holds images across departments and PACS vendors under one archive.

Classic DICOM networking (C-STORE, C-FIND, C-MOVE between application entities on known ports) predates the web. **DICOMweb** is the RESTful version, the one a cloud product uses:

| Service | Does |
| --- | --- |
| **QIDO-RS** | Query for studies, series or instances matching criteria |
| **WADO-RS** | Retrieve objects, metadata or rendered frames |
| **STOW-RS** | Store objects to a server |
| **UPS-RS** | Manage worklist items |

Images connect to the rest of the record through orders and reports. An imaging order travels to the radiology system (HL7 v2 or FHIR ServiceRequest), the modality worklist tells the equipment which patient is on the table, the study is stored in the PACS, and the radiologist's report comes back as an HL7 v2 result or a document with a link to the study ([HL7 v2 & Interfaces](/books/health-tech/hl7-v2#the-messages-that-run-a-practice)). The EHR usually holds the report and a pointer, not the pixels. Imaging orders and results release are [Labs, Imaging & Diagnostics](/books/health-tech/labs-and-diagnostics#imaging-orders) in Part 6.

## Dental Imaging and Bridges

Imaging is routine in dentistry: bitewings at hygiene visits, periapicals, panoramic films, intraoral photos and, in some offices, cone beam CT. The images come from sensors and cameras driven by imaging software (Carestream, Dexis, Sidexis, Planmeca and others), which keeps its own database, usually on the practice's server next to the PMS.

The PMS and the imaging software meet through a **bridge**. Open Dental's Program Links window lists "all the program bridges that can be linked," and a bridge either passes the patient on the command line when it launches the imaging program's executable or writes an output file the other program reads; a program not on the list can be set up as a custom bridge. The effect for the practice: click the imaging button in the patient's chart, and the imaging software opens on the same patient. The effect for an integrator: the PMS knows that images exist but often not what they are; the images are in another vendor's store, sometimes DICOM, sometimes proprietary, and reaching them means integrating with the imaging vendor or reading exports. Dental AI products that read radiographs integrate at this layer, covered in [Dental Practice](/books/health-tech/dental-practice#dental-ai) in Part 5.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Every document, structured or not, is a `documents` row: the core already gives it a `kind`, `mime_type`, an object storage `content_ref` and a `content_sha256`, and this chapter adds its format and provenance, a parsed index of C-CDA sections, and the Direct and imaging records that point at documents and patients.

```sql
ALTER TABLE documents
  ADD COLUMN format            TEXT NOT NULL DEFAULT 'pdf'
                                 CHECK (format IN ('ccda', 'cda_unstructured', 'pdf', 'image',
                                 'fhir_bundle', 'text', 'dicom_sr')),
  ADD COLUMN ccda_document_type TEXT,          -- LOINC document type code from the header
  ADD COLUMN ccda_template_ids TEXT[],          -- templateId roots and extensions as received
  ADD COLUMN byte_size         BIGINT NOT NULL,
  ADD COLUMN received_via      TEXT CHECK (received_via IN ('created_here', 'direct', 'network_query',
                                 'fax', 'scan', 'patient_upload', 'api', 'hl7v2')),
  ADD COLUMN source_organization_id UUID REFERENCES organizations (id),
  ADD COLUMN filing_status     TEXT NOT NULL DEFAULT 'filed'
                                 CHECK (filing_status IN ('unfiled', 'filed', 'misfiled_moved',
                                 'rejected')),
  ADD COLUMN filed_by          UUID,           -- the user who indexed it to this chart
  ADD COLUMN validation_errors JSONB;          -- template validation results for C-CDA

CREATE TABLE ccda_sections (                  -- an index over a received C-CDA, never a replacement
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  document_id      UUID NOT NULL REFERENCES documents (id),
  section_code     TEXT NOT NULL,              -- LOINC section code
  template_id      TEXT NOT NULL,              -- root and extension as received
  title            TEXT,
  narrative_sha256 BYTEA NOT NULL,             -- the attested text, by hash
  entry_count      INT NOT NULL,
  null_flavor      TEXT,                       -- the sender said "no information"
  imported         BOOLEAN NOT NULL DEFAULT FALSE,  -- entries offered for reconciliation
  UNIQUE (document_id, template_id, section_code)
);

CREATE TABLE document_filing_history (        -- every move between charts, kept
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  document_id   UUID NOT NULL REFERENCES documents (id),
  from_patient_id UUID REFERENCES patients (id),
  to_patient_id UUID REFERENCES patients (id),
  moved_by      UUID NOT NULL,
  reason        TEXT NOT NULL,
  moved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE direct_addresses (               -- addresses this tenant sends from and receives at
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  address         TEXT NOT NULL UNIQUE,
  practitioner_id UUID REFERENCES practitioners (id),  -- null: an organizational address
  location_id     UUID REFERENCES locations (id),
  hisp_integration_id UUID NOT NULL REFERENCES integrations (id),
  certificate_not_after TIMESTAMPTZ,          -- the S/MIME certificate's expiry
  status          TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'retired'))
);

CREATE TABLE direct_messages (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address    TEXT NOT NULL,
  to_addresses    TEXT[] NOT NULL,
  message_id      TEXT NOT NULL,              -- RFC 5322 Message-ID
  subject         TEXT,
  patient_id      UUID REFERENCES patients (id),     -- null until matched
  document_ids    UUID[] NOT NULL DEFAULT '{}',
  delivery_status TEXT CHECK (delivery_status IN ('sent', 'processed', 'dispatched', 'failed')),
  delivery_notified_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, direction, message_id)
);

CREATE TABLE imaging_studies (                -- a pointer to images held elsewhere
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  patient_id         UUID NOT NULL REFERENCES patients (id),
  order_id           UUID REFERENCES orders (id),
  study_instance_uid TEXT NOT NULL,           -- DICOM UID; text, never parsed
  modality           TEXT,                    -- 'CR', 'DX', 'IO', 'PX', 'CT'
  started_at         TIMESTAMPTZ,
  archive_integration_id UUID NOT NULL REFERENCES integrations (id),  -- PACS, VNA or imaging app
  retrieve_url       TEXT,                    -- WADO-RS base for the study, if DICOMweb
  report_document_id UUID REFERENCES documents (id),
  UNIQUE (organization_id, study_instance_uid)
);
```

Design decisions:

- **Bytes go to object storage, hashes stay in the row.** A document's content is immutable once stored; a corrected document is a new row. The hash proves which file a clinician saw or a disclosure sent ([Keep Bytes Off the Application](/docs/architecture/file-uploads#keep-bytes-off-the-application)).
- **Every document records how it arrived.** `received_via` and `source_organization_id` decide trust, reconciliation and, for a disclosure accounting, where the information came from.
- **C-CDA is stored as received.** Template ids and validation results are kept with the original XML; `ccda_sections` indexes what each section holds (and says when the sender sent a null flavor rather than data), and parsed entries become imported clinical rows with the document as their source, never replacements for it.
- **Filing is reversible and audited.** Unfiled documents sit in a queue, and moving a document between charts writes `document_filing_history`, because a misfile is an incident that someone will investigate.
- **Images stay in the archive.** `imaging_studies` holds the UID, modality, order, report and where to retrieve it; the pixels stay in the PACS, VNA or dental imaging software, which is the system of record for them.
- **Direct is a channel, not a store.** A Direct message points at documents; its delivery status follows the Delivery Notification standard so a referral that never arrived is visible.

## Auditing

- **Every document's provenance:** how it arrived, from whom, when, its hash, and who filed it to which chart.
- **Misfiles and moves,** with who moved a document, from which chart, and who viewed it before it moved, because that list is the scope of a privacy incident.
- **Direct traffic:** messages sent and received, recipients, attachments by hash and delivery notifications.
- **Document disclosures:** which documents left the organization, to whom, by which channel, feeding the accounting of disclosures where it applies ([HIPAA in Practice](/books/health-tech/hipaa-in-practice#the-other-rights-a-product-handles) in Part 3).
- **Image access** through your product, even when the pixels live in another system ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Read C-CDA for years:** keep the original XML and narrative, validate templates, and import entries only as reconcilable outside data.
- **Support Direct** where you send or receive referrals, with addresses per clinician or location and delivery status tracked.
- **Assume fax and scans,** and build a filing queue with patient matching, extraction proposals and reversible, audited filing.
- **Store documents by hash in object storage,** immutable, with provenance on every row.
- **Point at images, don't copy them:** study UIDs, retrieval endpoints and reports, with the archive as system of record.
- **Integrate dental imaging through the imaging vendor,** knowing the PMS bridge only launches it.

## References

**Standards and regulation**

- [HL7: C-CDA 5.0.0 implementation guide](https://hl7.org/cda/us/ccda/), template library, document types, headers, sections and entries, USCDI alignment
- [HL7: C-CDA package list](https://hl7.org/cda/us/ccda/package-list.json), 3.0.0, 4.0.0 and 5.0.0 publication dates
- [45 CFR 170.202: Transport standards (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/170.202), Applicability Statement for Secure Health Transport v1.2, XDR and XDM, Direct Edge Protocols
- [45 CFR 170.315: Certification criteria (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/170.315), (b)(1) transitions of care documents and transport, (h)(1) wrapped Direct messages and delivery notification
- [ASTP/ONC: HTI-5 final rule removals or revisions of certification criteria (October 26, 2026)](https://healthit.gov/resources/hti-5-final-rule-removals-or-revisions-of-certification-criteria/), care plan, C-CDA creation performance and the Direct criteria removed; transitions of care, reconciliation and view, download and transmit revised
- [ASTP/ONC: HTI-1 Final Rule Overview and Key Dates (PDF, October 2025)](https://www.healthit.gov/sites/default/files/2024-03/Overview-and-Key-Dates-2024_508.pdf), C-CDA Companion Guide Release 4.1 by December 31, 2025 and the criteria that reference C-CDA
- [DICOM: About](https://www.dicomstandard.org/about), the international standard for medical images, 1993, ISO 12052, NEMA as secretariat
- [DICOM: DICOMweb](https://www.dicomstandard.org/using/dicomweb), QIDO-RS, WADO-RS, STOW-RS and UPS-RS

**Agencies**

- [ASTP/ONC: Interoperable exchange of patient health information among US hospitals, 2023](https://www.healthit.gov/data/data-briefs/interoperable-exchange-patient-health-information-among-us-hospitals-2023), 70% of hospitals in all four domains, eFax excluded from electronic exchange

**In practice**

- [DirectTrust](https://directtrust.org/), Direct addresses, organizations served, quarterly and cumulative message counts
- [DirectTrust: Trust bundles overview](https://directtrust.org/trust-bundles), the Accredited Trust Anchor Bundle and why bundles replace one-off negotiations
- [open.epic](https://open.epic.com/), Care Everywhere's 9.83 billion annual record exchanges, 54% to non-Epic organizations
- [Epic: HL7v2 interfaces (open.epic)](https://open.epic.com/Interface/HL7v2), outgoing imaging results and orders
- [Open Dental: Program Links](https://www.opendental.com/manual/programlinks.html), bridges by command line or output file, custom bridges
- [Open Dental: Manual index](https://www.opendental.com/manual/manual.html), Carestream, Dexis, Schick CDR DICOM, Sirona Sidexis, Trophy and Planmeca bridges
