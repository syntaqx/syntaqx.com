+++
title = "Trial Systems & 21 CFR Part 11"
nav_title = "Trial Systems & Part 11"
description = "EDC, CTMS, eTMF, randomization and ePRO; CDISC CDASH, SDTM and ADaM; 21 CFR Part 11, Annex 11, ICH E6(R3) and validating software for trials."
category = "Health Tech Industry"
order = 1955
part = "Pharma and Clinical Trials"
tags = ["health-tech", "pharma", "clinical-trials", "part-11", "cdisc", "validation", "data-model"]
+++

Trial software is held to a standard most software never meets: a regulator may ask, years later, who entered a value, what it was before, why it changed, who signed the page and what the signature meant, and the system must answer from records nobody could have quietly altered. That standard is 21 CFR Part 11 in the United States and EU GMP Annex 11 in Europe, applied through the good clinical practice guideline ICH E6, and it shapes every system in a trial: electronic data capture where sites enter visit data, the clinical trial management system where sponsors and CROs run operations, the electronic trial master file where every essential document lives, randomization and trial supply, and electronic patient-reported outcomes on a subject's phone. The data those systems produce has to be delivered to the FDA in CDISC standards.

This chapter covers the system types and their vendors, the data standards from collection to submission, Part 11 and Annex 11 in engineering terms, ICH E6(R3), and validation. The trial business (phases, sites, consent, registration) is [Clinical Trials](/books/health-tech/clinical-trials); safety databases and submissions are [Pharmacovigilance & Regulatory Submissions](/books/health-tech/pharmacovigilance-and-regulatory). The playbook's general rules for e-signatures and audit trails are [Electronic Signatures & Records](/docs/compliance/electronic-signatures) and [Audit Trails](/docs/architecture/audit-trails); Part 11 is stricter than both.

## How the Platforms Do It

As of October 2026, from vendor pages and filings:

| Vendor | Products | What its public record says |
| --- | --- | --- |
| **Medidata** (Dassault Systèmes) | Rave EDC, randomization, eCOA, CTMS and more | "the leading Electronic Data Capture (EDC)," 38,000+ studies and 1.8M+ users; acquired by Dassault Systèmes, closing October 28, 2019 at $92.25 a share in cash |
| **Veeva** | Veeva Development Cloud: EDC, Clinical Data Management, CTMS, eTMF, Safety, RIM | FY2026 revenue $3,195 million and 1,552 customers (10-K); its clinical data products put EDC, data quality, eCOA and RTSM in one flow; eTMF is "the leading trial master file application" |
| **Oracle Health Sciences** | Clinical One | Documentation describes a Clinical One Cloud Service with Randomization and Supplies, Study Design and Study Conduct modules |
| **Suvoda** | RTSM, eCOA, travel and payments | "agentic RTSM: from kickoff to UAT in as little as two weeks" |
| **Signant Health** | eCOA and ePRO, RTSM, eConsent | Patient-facing technology across trials associated with a quarter of recent novel approvals |

Three patterns:

- **Platforms converge on one study build.** Vendors sell EDC, randomization, ePRO and CTMS sharing a study definition, because rebuilding visits and forms in four systems is where trial start-up spends its weeks.
- **Validation is part of the product.** Every vendor ships validation documentation for its releases, and sponsors still validate their own configuration of each study; a release cadence is a negotiation with customers' validation teams.
- **Data standards are a deliverable.** The output of the study is not the EDC database but SDTM and ADaM datasets with a define.xml; tools that map collection to submission are a market of their own.

## The Systems

- **EDC (electronic data capture).** Sites enter data from the source (the chart, a lab report, a questionnaire) into electronic case report forms (eCRFs) organized by visit; edit checks fire queries; monitors verify against source and data managers clean; the database is locked for analysis. Every value has an audit trail and investigator signatures attest to casebooks.
- **CTMS (clinical trial management).** Study and site milestones, enrollment tracking, monitoring visit reports, site payments, issue management. Veeva describes CTMS as "an enterprise trial management system that provides end-to-end study management."
- **eTMF (electronic trial master file).** Every essential document: protocol versions, IRB approvals, 1572s, CVs, training, monitoring reports, correspondence. Organized by the TMF Reference Model, which "provides standardized taxonomy and metadata and outlines a reference definition of TMF content" and has been maintained by CDISC since June 2022 (it began as a DIA group).
- **RTSM or IRT (randomization and trial supply management).** Assigns a randomized subject to an arm and a kit number without revealing the arm to blinded users, manages drug supply to sites and depots, tracks expiry and temperature excursions, and supports emergency unblinding.
- **eCOA and ePRO.** Patient-reported outcomes, clinician-reported outcomes and diaries on a provisioned device or the subject's own phone. FDA's PRO guidance (December 2009, final) governs using such measures to support labeling claims, which is why instruments are licensed and their electronic versions validated against the paper.
- **Safety, coding and lab systems.** Adverse events feed the safety database; medical terms are coded (MedDRA for events, WHODrug for medications); central labs send data transfers.
- **Clinical data repositories and analytics.** Pull EDC, eCOA, lab and other sources into one review layer.

## Data Standards: CDASH, SDTM, ADaM and Define-XML

CDISC standards carry trial data from collection to submission:

- **CDASH** "establishes a standard way to collect data consistently across studies and sponsors," with "clear traceability of submission data into" SDTM. It shapes the eCRF.
- **SDTM** "provides a standard for organizing and formatting data to streamline processes in collection, management, analysis and reporting": domains such as demographics (DM), adverse events (AE), concomitant medications (CM), vital signs (VS) and labs (LB). The current model is SDTM v2.1 with SDTMIG v3.4. FDA and Japan's PMDA require it.
- **ADaM** supports "efficient generation, replication, and review of clinical trial statistical analyses" and "traceability among analysis results, analysis data, and data represented in" SDTM; ADSL, the subject-level analysis dataset, is its anchor.
- **Define-XML** "transmits metadata that describes any tabular dataset structure"; v2.1 is current.

FDA requires these standards for study data in NDAs, ANDAs and certain BLAs for studies that started after December 2016, and in commercial INDs for studies after December 2017, through its Data Standards Catalog and Study Data Technical Conformance Guide. <!-- source-gap: fda-study-data-dates | secondary | FDA study data standards required for studies starting after December 17, 2016 (NDAs, ANDAs, certain BLAs) and December 17, 2017 (commercial INDs) | closes with: the FDA Data Standards Catalog or the binding guidance "Providing Regulatory Submissions in Electronic Format: Standardized Study Data," opened (only search snippets of FDA PDFs were read) | checked: 2026-10-29 -->

For software, the standards are a mapping problem with traceability: each SDTM variable should trace back to an eCRF field and forward to the ADaM variables derived from it, and the mapping specification is itself a versioned, validated document.

## 21 CFR Part 11

Part 11 applies to electronic records and signatures that FDA regulations require or that are submitted to FDA. For closed systems, section 11.10 requires controls including:

- **(a)** validation "to ensure accuracy, reliability, consistent intended performance, and the ability to discern invalid or altered records";
- **(b)** accurate and complete copies in human-readable and electronic form for inspection;
- **(c)** protection of records for their retention period;
- **(d)** limiting access to authorized individuals;
- **(e)** "secure, computer-generated, time-stamped audit trails" recording operator entries and actions that create, modify or delete records, without obscuring prior entries, retained as long as the records;
- **(f)** operational checks enforcing permitted sequencing of steps;
- **(g)** authority checks;
- **(h)** device checks;
- **(i)** training of the people who build, maintain and use the system;
- **(j)** written policies holding people accountable for actions under their signatures;
- **(k)** controls over system documentation.

**Enforcement discretion and the 2024 Q&A.** FDA's 2003 guidance *Part 11, Electronic Records; Electronic Signatures, Scope and Application* (September 2003) says FDA intends "to exercise enforcement discretion with respect to certain part 11 requirements" (validation, audit trail, record retention, record copying and legacy systems) while enforcing the predicate rules and a narrowed scope. Its October 2024 final guidance *Electronic Systems, Electronic Records, and Electronic Signatures in Clinical Investigations: Questions and Answers* applies to clinical investigations of medical products and others, and treats such records and signatures as trustworthy and reliable and generally equivalent to paper when the controls are in place, with a risk-based approach to validation and attention to IT service providers.

### Electronic Signatures

Part 11's signature rules are concrete:

- **Manifestation.** A signed record shows "The printed name of the signer," "The date and time when the signature was executed," and "The meaning (such as review, approval, responsibility, or authorship) associated with the signature" (11.50).
- **Linking.** Signatures "shall be linked to their respective electronic records" so they can't be removed, copied or transferred to falsify a record (11.70).
- **Uniqueness.** "Each electronic signature shall be unique to one individual and shall not be reused by, or reassigned to, anyone else" (11.100(a)), and the organization certifies to FDA, on paper with a handwritten signature, that its electronic signatures are "intended to be the legally binding equivalent of traditional handwritten signatures" (11.100(c)).
- **Two components.** Non-biometric signatures "Employ at least two distinct identification components such as an identification code and password"; within one continuous session the first signing uses all components and later signings at least one known only to the signer, and outside a session every signing uses all (11.200).
- **Controls on credentials.** Unique ID and password combinations, periodic checks and password aging, deactivation of lost tokens, safeguards against unauthorized use with immediate reporting of attempts, and testing of tokens and cards (11.300).

The playbook's [What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds) describes evidence for ESIGN-style consumer signatures; a Part 11 signature adds the meaning, re-authentication at signing, the link to the exact record version and the organizational certification.

## EU Annex 11 and ICH E6(R3)

**Annex 11.** EU GMP Annex 11 ("Computerised Systems," revision January 2011) is the EU counterpart for GMP systems and is widely applied to clinical systems. The Commission consulted on a revision of Annex 11, a revised Chapter 4 on documentation and a new Annex 22 on artificial intelligence from July 7 to October 7, 2025; as of October 2026 EudraLex Volume 4 still lists the 2011 Annex 11 and no Annex 22, so the revision has not been adopted.

**ICH E6(R3).** The revised good clinical practice guideline "incorporates flexible, risk-based approaches and embraces innovations in trial design, conduct, and technology." FDA published it as final guidance in September 2025. In the EU, the principles and Annex 1 took legal effect on July 23, 2025, and Annex 2 was adopted by ICH on June 3, 2026 and by the CHMP on June 25, 2026, effective January 15, 2027. For system builders, E6(R3) moves from "validate everything the same way" to risk-proportionate quality: critical-to-quality factors, data governance across the data life cycle, and computerized systems validated to the risk they carry.

## Validation

Validation is documented evidence that a system does what it is intended to do in its intended use. The traditional computer system validation pattern (validation plan, user requirements, risk assessment, installation, operational and performance qualification scripts, traceability matrix, summary report) is now being replaced by risk-based approaches:

- **GAMP 5 Second Edition** (ISPE, July 2022) stresses "critical thinking" by subject-matter experts, discusses FDA's computer software assurance approach and "fully supports iterative and incremental methods."
- **Computer Software Assurance.** FDA's CSA guidance for production and quality system software was first finalized in September 2025 and superseded by a February 2026 final guidance tied to the QMSR (21 CFR 820). It is written for device manufacturing software, but its emphasis (test what matters to patient safety and product quality, use unscripted testing where risk is lower, keep records proportionate) is how many sponsors now validate clinical systems too.

What a SaaS vendor must provide in practice: a documented software development life cycle, release notes with impact assessments, the vendor's own testing evidence, an audit right or audit report, a change notification period, and configuration that is itself versioned so each study's build can be validated and locked. FDA's 2024 Q&A addresses IT service providers directly, which is why sponsors write those expectations into quality agreements.

## How to Build It

The core `audit_events` (who did what to which record) and `documents` (kept as created) are necessary and not sufficient: Part 11 needs every value's history with reasons, signatures tied to exact record versions, and evidence that the system was validated for the version in use. This chapter adds study forms, form entries, electronic signatures and validation records:

```sql
CREATE TABLE study_forms (               -- an eCRF definition in one study build version
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the sponsor or CRO tenant
  study_id        UUID NOT NULL REFERENCES studies (id),
  build_version   TEXT NOT NULL,         -- the validated study build this belongs to
  visit_code      TEXT NOT NULL,         -- 'SCREEN', 'W4'
  form_code       TEXT NOT NULL,         -- 'VS', 'AE'
  definition      JSONB NOT NULL,        -- fields, CDASH names, edit checks, SDTM mapping
  validated_by    UUID,                  -- validation_records, below
  UNIQUE (study_id, build_version, visit_code, form_code)
);

CREATE TABLE form_entries (              -- every value ever entered, append-only
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  study_subject_id  UUID NOT NULL REFERENCES study_subjects (id),
  study_form_id     UUID NOT NULL REFERENCES study_forms (id),
  item              TEXT NOT NULL,       -- the field, e.g. 'VSORRES.SYSBP'
  repeat_key        TEXT NOT NULL DEFAULT '',  -- log-line forms (AEs, con meds)
  value             TEXT,                -- as entered; null records a deletion
  version           INT NOT NULL,        -- 1, 2, 3 for this item
  reason            TEXT,                -- required for every version after 1
  entered_by        UUID NOT NULL,       -- a unique user, never a shared account
  entered_role      TEXT NOT NULL,       -- 'site_coordinator', 'investigator', 'data_manager'
  entered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- server time, never the client's
  source            TEXT NOT NULL CHECK (source IN ('site_entry', 'epro', 'lab_transfer',
                      'ehr_to_edc', 'migration')),
  UNIQUE (study_subject_id, study_form_id, item, repeat_key, version),
  CHECK (version = 1 OR reason IS NOT NULL)
);

CREATE TABLE electronic_signatures (     -- a Part 11 signature bound to an exact record state
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  signer_id        UUID NOT NULL,
  signer_name      TEXT NOT NULL,        -- printed name, as shown on the record
  meaning          TEXT NOT NULL CHECK (meaning IN ('authorship', 'review', 'approval',
                     'responsibility', 'consent')),
  record_kind      TEXT NOT NULL,        -- 'casebook', 'form', 'econsent', 'document'
  record_id        UUID NOT NULL,
  record_digest    BYTEA NOT NULL,       -- hash of the exact record version signed
  components_used  TEXT[] NOT NULL,      -- {'user_id', 'password'} or {'password'} in-session
  session_id       UUID NOT NULL,
  signed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invalidated_at   TIMESTAMPTZ,          -- a later change to the record breaks the signature
  invalidated_by_entry UUID REFERENCES form_entries (id)
);

CREATE TABLE validation_records (        -- evidence that a release or a study build is fit for use
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  subject         TEXT NOT NULL CHECK (subject IN ('platform_release', 'study_build',
                    'integration', 'report')),
  subject_ref     TEXT NOT NULL,         -- release number or study build version
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
  approach        TEXT NOT NULL CHECK (approach IN ('scripted', 'unscripted',
                    'vendor_evidence', 'mixed')),
  requirements_doc_id UUID REFERENCES documents (id),
  evidence_doc_ids UUID[] NOT NULL,      -- test results, traceability, summary report
  approved_signature_id UUID REFERENCES electronic_signatures (id),
  effective_at    TIMESTAMPTZ NOT NULL
);
```

The current value of an item is the highest version; the audit trail is the table itself:

```sql
SELECT DISTINCT ON (item, repeat_key) item, repeat_key, value, version, entered_by, entered_at
FROM form_entries
WHERE study_subject_id = $1 AND study_form_id = $2
ORDER BY item, repeat_key, version DESC;
```

Design notes:

- **Append-only by construction.** `form_entries` has no update path; a correction is a new version with a reason, and the prior value stays visible, as 11.10(e) requires ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)). Tamper evidence (hash chains or a write-once store) makes the guarantee checkable ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **Signatures bind to a digest.** The signature stores a hash of the exact record version; any later entry on a signed casebook invalidates the signature and requires re-signing, which is how the "cannot be transferred to falsify" rule is enforced.
- **Re-authenticate at signing.** The signing ceremony asks for the password (and the ID outside a continuous session), records the components used, and states the meaning on screen before the signer commits.
- **Server time is the record's time.** Audit timestamps come from a synchronized server clock in UTC with the time zone shown, never the browser.
- **Builds are versioned and validated.** A study build change (a new form, an edit check) is a new `build_version` with its own validation record before it reaches production; data entered under each version stays attributable to it.
- **Blinding is authorization.** RTSM arm assignments are readable only by unblinded roles, and every unblinding is a logged, reasoned event ([Authorization](/docs/security/authorization)).

## Auditing

- **Every data point's history:** value, version, reason, user, role and time, viewable and exportable in human-readable form for an inspector (11.10(b)).
- **Signatures:** who signed what, with what meaning, when, and whether a later change invalidated it.
- **Access:** account provisioning and removal, role changes, and reads of unblinded data.
- **Validation:** for the release and study build in use on any date, the validation record and its approval.
- **Retention:** trial records, audit trails and signatures kept for the predicate rule's period, in a form that stays readable after the system is retired ([Data Retention & Deletion](/docs/architecture/data-retention)).

## What This Means for the System You Build

- **Make every regulated record append-only** with a required reason for each change and server-side timestamps.
- **Implement Part 11 signatures fully:** printed name, time, meaning, two components, re-authentication, a link to the record digest, invalidation on change.
- **Version the study build** and validate each version proportionate to risk, keeping the evidence.
- **Design for CDISC from the eCRF up,** with traceable mappings from CDASH fields to SDTM and ADaM.
- **Treat blinding as an authorization boundary** with logged unblinding.
- **Give customers what their validation needs:** release impact assessments, testing evidence, change notice and audit rights.
- **Track the EU Annex 11 revision and ICH E6(R3) Annex 2** dates as configuration of your quality system, not as one-off projects.

## References

**Regulations and guidance**

- [21 CFR Part 11: Electronic records; electronic signatures (eCFR)](https://www.ecfr.gov/current/title-21/part-11), 11.10 controls, 11.50 manifestations, 11.70 linking, 11.100 uniqueness and certification, 11.200 components, 11.300 controls
- [FDA: Part 11, Scope and Application (September 2003)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application), enforcement discretion areas
- [FDA: Electronic Systems, Electronic Records, and Electronic Signatures in Clinical Investigations, Q&A (October 2024)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/electronic-systems-electronic-records-and-electronic-signatures-clinical-investigations-questions), final guidance, scope and equivalence to paper
- [FDA: E6(R3) Good Clinical Practice (September 2025)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e6r3-good-clinical-practice-gcp), final guidance and its risk-based approach
- [EMA: ICH E6 good clinical practice scientific guideline](https://www.ema.europa.eu/en/ich-e6-good-clinical-practice-scientific-guideline), effective July 23, 2025 for principles and Annex 1, Annex 2 adoption and January 15, 2027 effective date
- [European Commission: Consultation on EudraLex Volume 4 Chapter 4, Annex 11 and Annex 22](https://health.ec.europa.eu/consultations/stakeholders-consultation-eudralex-volume-4-good-manufacturing-practice-guidelines-chapter-4-annex_en), July 7 to October 7, 2025, closed
- [European Commission: EudraLex Volume 4](https://health.ec.europa.eu/medicinal-products/eudralex/eudralex-volume-4_en), Annex 11 still at its January 2011 revision
- [FDA: Computer Software Assurance for Production and Quality Management System Software (February 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computer-software-assurance-production-and-quality-management-system-software), current final guidance superseding the September 2025 version
- [FDA: Patient-Reported Outcome Measures guidance (December 2009)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/patient-reported-outcome-measures-use-medical-product-development-support-labeling-claims), PROs supporting labeling claims
- [ISPE: GAMP 5 Guide, 2nd Edition](https://ispe.org/publications/guidance-documents/gamp-5-guide-2nd-edition), published July 2022, critical thinking, CSA, iterative methods

**Standards**

- [CDISC: SDTM](https://www.cdisc.org/standards/foundational/sdtm), purpose, versions, FDA and PMDA requirement
- [CDISC: ADaM](https://www.cdisc.org/standards/foundational/adam), analysis datasets and traceability
- [CDISC: CDASH](https://www.cdisc.org/standards/foundational/cdash), standard collection and traceability to SDTM
- [CDISC: Define-XML](https://www.cdisc.org/standards/data-exchange/define-xml), dataset metadata, v2.1
- [CDISC: TMF Reference Model](https://www.cdisc.org/tmf), taxonomy and metadata, origin at DIA, part of CDISC since June 2022

**Vendors and filings**

- [Medidata: Rave EDC](https://www.medidata.com/en/clinical-trial-products/clinical-data-management/edc-systems/), studies and users
- [Medidata: Form 8-K on the merger (October 2019)](https://www.sec.gov/Archives/edgar/data/1453814/000114036119019146/form8k.htm), closing October 28, 2019, Dassault Systèmes, $92.25 a share
- [Veeva: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1393052/000139305226000014/veev-20260131.htm), revenue, customers, Development Cloud products
- [Veeva: Clinical data management](https://www.veeva.com/products/clinical-data-management/), EDC, data quality, eCOA and RTSM
- [Veeva: eTMF](https://www.veeva.com/products/vault-etmf/), the trial master file application
- [Veeva: CTMS](https://www.veeva.com/products/vault-ctms/), end-to-end study management
- [Oracle: Clinical One documentation](https://docs.oracle.com/en/industries/life-sciences/clinical-one/index.html), Randomization and Supplies, Study Design and Study Conduct
- [Suvoda](https://www.suvoda.com/), RTSM and eCOA
- [Signant Health](https://www.signanthealth.com/), eCOA, RTSM and eConsent
