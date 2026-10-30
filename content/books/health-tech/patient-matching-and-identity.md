+++
title = "Patient Matching & Identity"
nav_title = "Patient Matching & Identity"
description = "Finding the right patient without a national ID: MPIs, matching algorithms, the appropriations rider, duplicates and overlays, merges, and IAL2 proofing."
category = "Health Tech Industry"
order = 1912
part = "Records and Interoperability"
tags = ["health-tech", "patient-matching", "mpi", "identity-proofing", "ial2", "record-linkage"]
+++

The United States has no national patient identifier. Every hospital, practice, lab, pharmacy and payer assigns its own number, and when records move between them, someone has to decide from names, birth dates, addresses and phone numbers whether two records describe the same person. When they get it wrong in one direction, a patient's history is split across duplicate charts and a clinician acts without it; in the other, two people's records are fused into one, and a clinician acts on someone else's allergies, results or orders. GAO's 2019 report on patient record matching cites a 2014 study finding that "as few as 50 percent of records are accurately matched when organizations exchange information," and the ECRI Institute's case of a patient in cardiac arrest who was not resuscitated because the care team followed the wrong patient's do-not-resuscitate order.

This chapter covers why there's no identifier, how a master patient index works, matching methods and their failure modes, merges and their reversals, and identity proofing for patients who reach their records themselves. The general engineering of linking records from many sources is the playbook's [Matching, Merging & Many Sources](/docs/architecture/record-linkage); this chapter is what health care adds: higher stakes, worse inputs, regulation, and a network that expects your matching to be right before it releases a record.

## How the Platforms Do It

As of October 2026, from public pages:

| Platform | Identity function |
| --- | --- |
| **NextGate (Rhapsody)** | "A pioneer in healthcare identity resolution and Enterprise Master Person Index (EMPI)," merged into Rhapsody under a March 15, 2022 agreement to pair the EMPI with its integration engines |
| **CommonWell Health Alliance** | A master person index and record locator service at the center of its network |
| **TEFCA individual access** | Requires IAL2 identity proofing by an approved credential service provider and a demographics double-check before records are released to a person's app |
| **HL7 FHIR** | `Patient/$match`, which asks an MPI to find patients matching a partial record, returning graded candidates with scores from 0 to 1 |
| **HL7 Identity Matching IG** | The Interoperable Digital Identity and Patient Matching guide (1.0.0 on June 2, 2023; 2.0.0 on December 10, 2025), profiling `$match` for cross-organization use and identity assurance |
| **CMS** | Medicare Beneficiary Identifiers: 11 random characters, replacing SSN-based claim numbers |

The pattern: **matching is a service, not a feature.** Health systems buy an EMPI next to their interface engine; networks run an MPI at their core; and certified APIs and TEFCA define how one system asks another's index for a match.

## No National Identifier

Providers have a national identifier (the NPI); patients don't, because Congress stopped it. As GAO reports HHS's statement, "since fiscal year 1999, Congress has prohibited the implementation of a national patient identifier": the restriction, first enacted in the Omnibus Consolidated and Emergency Supplemental Appropriations Act of 1999, bars HHS from using funds to "promulgate or adopt any final standard providing for, or providing for the assignment of, a unique health identifier for an individual" until legislation specifically approves the standard. GAO cites it as carried in the 2019 Labor-HHS appropriations act. <!-- source-gap: upi-rider-status | status | whether the unique patient identifier prohibition is carried in the FY2026 and FY2027 Labor-HHS appropriations | closes with: the enacted appropriations text on congress.gov | checked: 2026-10-29 --> Its current status for fiscal 2026 and 2027 couldn't be confirmed from enacted text for this chapter.

What fills the gap is a patchwork of identifiers, none universal:

- **Medical record numbers (MRNs)**, one per organization, sometimes one per facility within it.
- **Payer member ids**, which change when coverage changes. Medicare replaced SSN-based Health Insurance Claim Numbers with **Medicare Beneficiary Identifiers (MBIs)**: 11 characters of uppercase letters and digits, without S, L, O, I, B or Z, "randomly generated" with no embedded meaning, to be protected like an SSN; CMS accepted either identifier on claims from April 1, 2018 through December 31, 2019 and requires MBIs now.
- **Social Security numbers**, increasingly not collected, often wrong when they are, and a breach liability.
- **Network and vendor identifiers**: an MPI's enterprise id, a network's person id, a credential service provider's identifier for a proofed person.

GAO's stakeholders saw a national identifier as one possible improvement and noted its limits: the funding prohibition, privacy concerns, and that a number can still be mistyped, shared, stolen or refused by the patient. So every system that exchanges records matches on demographics, and every identifier above is a crosswalk entry with its assigning authority ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)).

## The Master Patient Index

A **master patient index (MPI)** is the registry of every patient an organization knows, with every local identifier linked to one enterprise identity. An **enterprise MPI (EMPI)** does it across facilities and systems: a health system's hospitals, clinics, lab and billing each keep their own MRNs, and the EMPI links them. Inside a single small practice the MPI is just the patient table, but the same problems appear the moment a practice syncs with an EHR, receives network documents or merges with another practice.

An MPI does four jobs:

1. **Match on registration.** Before a new patient is created, search for an existing one. This is where most duplicates are born: a front desk under time pressure creates "Ana Rivera" because "Anna Rivera-Lopez" didn't come up.
2. **Link on arrival.** When a record arrives from another system (an HL7 v2 ADT, a FHIR read, a network document), match it to a local patient or queue it.
3. **Answer queries.** Other systems ask "do you have this person?" with demographics, through `$match`, network patient discovery or an interface.
4. **Merge and unmerge.** Fix duplicates and overlays, and tell every downstream system.

## Matching Methods

**Deterministic matching** requires exact agreement on chosen fields (last name, first name, birth date, sex, perhaps ZIP). It is fast and explainable and misses every typo, nickname, hyphenated name and moved patient. **Probabilistic matching** weighs each field's agreement by how informative it is (agreement on a rare surname means more than agreement on "Smith"; agreement on birth date means more than on sex) and scores the pair; the Fellegi-Sunter model in the playbook's [Probabilistic Linkage](/docs/architecture/record-linkage#probabilistic-linkage) is the classic form, and most EMPIs implement a version tuned to their population. **Referential matching** uses third-party data from outside health care, such as credit bureaus, to help decide, so a patient who moved can still be recognized; GAO notes Pew's caution about patient and provider reservations and its limits for children. Many products combine them: deterministic rules for certain matches, probabilistic scoring for the rest, and a reference source for hard cases.

Whatever the method, the output is a score and a decision in **review bands** ([Review Bands](/docs/architecture/record-linkage#review-bands)): link automatically above an upper threshold, queue for a person between thresholds, create a new patient below. FHIR's `$match` exposes the same shape: results are ordered by a score from 0 to 1 with a match-grade extension (such as `certain` or `possible`), and `onlyCertainMatches=true` asks the server to return nothing rather than several candidates.

Health care's inputs make every method worse than it is elsewhere:

- **Inconsistent formats.** GAO found matching problems arise from "inaccurate, incomplete, or inconsistently formatted demographic information," including names with hyphens that systems store differently.
- **Families share almost everything.** Twins share birth date, address, phone and surname; a parent and child named Jr. and Sr. share a name; a family shares one email and one mobile number.
- **People change.** Names change with marriage, divorce and gender transition; addresses and phones change often; payers change.
- **Data entry is rushed.** Registration happens at a front desk, on a phone call, or in an emergency department with an unidentified patient registered under a placeholder name.

Standardizing inputs helps more than a better algorithm. GAO describes 23 Texas providers that adopted common standards for recording names, addresses and other data in 2017; three hospitals estimated that manual review to resolve matching issues dropped by about 90%. Address standardization is the cheapest win: normalize to postal standards before comparing. Phone numbers belong in E.164 and emails lowercased, exactly as the playbook's [Match Before Create](/docs/architecture/record-linkage#match-before-create) describes.

## Duplicates, Overlays and Overlaps

The three error types have different costs:

- **Duplicate:** one person, two records in the same system. History is split; the clinician sees half of it; claims may go to the wrong coverage. Fixed by a merge.
- **Overlay:** two people, one record. One patient's information was written onto another's chart. This is the dangerous one, because it looks complete and is wrong: results, allergies, medications and orders attached to the wrong person. Fixed by an unmerge and a clinical review of everything written while they were fused.
- **Overlap:** one person, records in two systems that aren't linked (an EMPI failure across facilities). The cross-system version of a duplicate.

My rules for a product: **err toward duplicates over overlays.** A duplicate is a missed opportunity; an overlay is a safety event. So auto-link thresholds are set high, gates veto matches with conflicting strong evidence (different birth dates, different sex with no documented change, different MBIs), and twins and family members sharing contact details are flagged rather than linked. And **never auto-merge two records that both have clinical history.** Link them for review; a person decides, with the evidence shown field by field.

## Merges, Overlays and Unmerges

A merge in health care is a clinical event as much as a data one. When two charts become one, every downstream system must hear about it: HL7 v2 carries it as an **A40** (merge patient, patient identifier list) or **A47** (change patient identifier list), and FHIR servers report a merged patient's old id as replaced. The playbook's rules for recorded, reversible merges ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)) all apply, with health care's additions:

- **Keep the retired identifier resolving.** Lab results, claims, network queries and patient portal accounts will arrive for the old MRN for years; the old id redirects to the survivor.
- **Re-point, don't copy.** Encounters, documents, orders, results, appointments, charges and ledger entries are re-pointed to the survivor with the list recorded, so an unmerge can put them back.
- **Unmerge is a clinical review.** After an overlay is split, someone reviews what was charted, ordered, prescribed and disclosed while the records were fused, and corrects each, because the record of care for both people was wrong.
- **Merges propagate.** Send the merge to every system that holds the patient: the PMS, the EHR, the patient engagement platform, the clearinghouse, the portal. A reminder platform that never processed an A40 keeps texting a retired record.
- **Merges are disclosures risks.** An overlay may have shown one patient's data to another through the portal or a statement; that is a potential breach to assess (HIPAA in Practice in Part 3).

## Identity Proofing and IAL2

Matching asks which record a set of demographics belongs to; **identity proofing** asks whether the person presenting those demographics is really that person. It matters whenever a patient reaches records without a clinician in the room: creating a portal account, connecting an app, or querying networks for their own records.

NIST's Digital Identity Guidelines, SP 800-63-4 (final July 2025, superseding 800-63-3 of March 2020), define three **identity assurance levels**. **IAL1** supports "the real-world existence of the claimed identity," with core attributes from evidence or self-asserted and validated against authoritative or credible sources. **IAL2** "requires collecting additional evidence and more rigorous processes" for validating evidence and verifying the person is its rightful owner, remotely or on site. **IAL3** adds a trained proofing agent in an attended, on-site session and at least one biometric. Evidence itself is rated fair, strong or superior, with strong evidence carrying a facial image or other biometric.

Health care has settled on **IAL2** as the bar for a person reaching their records across organizations. TEFCA's IAS SOP v3.0 requires proofing to at least NIST IAL2 by an approved credential service provider before a person's first use, re-proofing when verified demographics change or expire, and the verified demographics (name, birth date, address, email, mobile phone and state ID number) carried in a signed claims token on every request ([Networks & Exchange](/books/health-tech/health-information-exchange#individual-access-services)). The HL7 identity matching guide states the reason directly: verifying a person at a specific assurance level improves match input quality, and matching on a unique digital identifier is preferred over demographics alone.

Inside one practice, a patient portal usually proofs more lightly: an activation code handed out at the desk or printed on a statement, a match on name, birth date and a recent visit, or a link sent to a phone already on file. That is a business decision with a privacy cost, and proxy access (a parent, a caregiver, an adult child) adds its own proofing and authority questions, covered in Consent, Authorization & Proxies in Part 3.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Identifiers carry their authority and lifetime; matching is candidates with scores, bands and decisions; merges are recorded and reversible; identity proofing is its own record.

```sql
ALTER TABLE patient_identifiers         -- the core's system, issuer, value and valid_during stay
  ADD COLUMN issuer_uri         TEXT,            -- the issuer as a FHIR identifier system URI or OID
  ADD COLUMN retired_reason     TEXT CHECK (retired_reason IN ('merged', 'replaced', 'entered_in_error')),
  ADD COLUMN source_integration_id UUID REFERENCES integrations (id),
  ADD CONSTRAINT patient_identifiers_retired_closed
    CHECK (retired_reason IS NULL OR NOT upper_inf(valid_during));

CREATE TABLE match_candidates (          -- a pair someone or something must decide
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_a_id     UUID NOT NULL REFERENCES patients (id),
  patient_b_id     UUID REFERENCES patients (id),   -- null: incoming record not yet a patient
  incoming_ref     TEXT,                         -- the message, document or query that raised it
  method           TEXT NOT NULL CHECK (method IN ('deterministic', 'probabilistic',
                     'referential', 'manual')),
  algorithm_version TEXT NOT NULL,
  score            NUMERIC(5,4) NOT NULL CHECK (score BETWEEN 0 AND 1),
  band             TEXT NOT NULL CHECK (band IN ('auto_link', 'review', 'no_match')),
  field_evidence   JSONB NOT NULL,               -- per field: both values, comparison, weight
  gates_failed     TEXT[] NOT NULL DEFAULT '{}', -- 'birth_date_conflict', 'twin_flag'
  decision         TEXT CHECK (decision IN ('same_person', 'not_same_person', 'deferred')),
  decided_by       UUID,
  decided_at       TIMESTAMPTZ,
  CHECK (patient_b_id IS NOT NULL OR incoming_ref IS NOT NULL)
);

CREATE TABLE patient_links (                    -- merges, and links short of a merge
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('merge', 'same_person_unmerged')),
  survivor_id      UUID NOT NULL REFERENCES patients (id),
  retired_id       UUID NOT NULL REFERENCES patients (id),  -- merge: patients.merged_into_id = survivor
  trigger          TEXT NOT NULL CHECK (trigger IN ('review', 'hl7v2_a40', 'hl7v2_a47',
                     'fhir_replaced', 'mpi', 'import')),
  source_ref       TEXT,                         -- interface message id, MPI event, review id
  candidate_id     UUID REFERENCES match_candidates (id),
  repointed        JSONB NOT NULL,               -- {"encounters": [...], "documents": [...]}
  merged_by        UUID,
  merged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unmerged_at      TIMESTAMPTZ,
  unmerge_reason   TEXT,                         -- 'overlay' triggers clinical review
  clinical_review_completed_at TIMESTAMPTZ,
  CHECK (survivor_id <> retired_id)
);

CREATE TABLE identity_verifications (            -- proofing a person who reaches records themselves
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID REFERENCES patients (id),
  subject          TEXT NOT NULL CHECK (subject IN ('patient', 'proxy')),
  assurance_level  TEXT NOT NULL CHECK (assurance_level IN ('ial1', 'ial2', 'ial3',
                     'practice_activation')),
  method           TEXT NOT NULL,                -- 'csp_remote', 'in_office_id_check', 'activation_code'
  csp              TEXT,                         -- the credential service provider
  csp_subject_id   TEXT,                         -- the CSP's identifier for the person
  verified_demographics_sha256 BYTEA,            -- what was verified, not the evidence itself
  verified_at      TIMESTAMPTZ NOT NULL,
  expires_at       TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ
);
```

Design decisions:

- **An identifier is meaningless without its issuer.** The core's `system` (MRN, payer member id, PMS id) and `issuer` (who assigned it) are both required and unique together; `issuer_uri` is the same issuer as the identifier system FHIR and the networks use. A retired MRN stays in the table with `retired_reason = 'merged'` and a closed `valid_during`, so it keeps resolving.
- **Candidates keep their evidence.** `field_evidence` shows each field's values and weights, which is what a reviewer needs and what an investigator asks for after an overlay. "Not the same person" decisions are kept so the pair isn't asked again.
- **Gates beat scores.** A high score with a failed gate goes to review, never to auto-link, which is how the system errs toward duplicates.
- **Algorithms are versioned.** A tuning change is a new `algorithm_version`; sampling auto-links per version estimates the false merge rate ([Review Bands](/docs/architecture/record-linkage#review-bands)).
- **Merges keep the re-pointing list.** A merge sets the core's `patients.status = 'merged'` and `merged_into_id` on the retired row, and the `patient_links` row keeps who, why, from which trigger and every re-pointed record, so an unmerge restores both patients, and an overlay unmerge opens a clinical review that must be completed and timestamped.
- **External merges are inputs, not commands.** An A40 from a hospital's EHR is recorded with its source message and applied to that hospital's identifiers; whether two local patients merge is still this system's decision, because the hospital's MPI and yours may disagree.
- **Proofing stores outcomes, not documents.** The verification records level, provider, the provider's subject id and a hash of the verified demographics; driver's license images and selfies stay with the credential service provider, which is built to hold them.

## Auditing

- **Every match decision:** automatic or human, with score, band, evidence, gates and algorithm version.
- **Every merge and unmerge:** who, when, why, the trigger message, the re-pointed records and the clinical review after an overlay.
- **Identifier history:** every identifier a patient has held, from which authority, when it was retired and why ([Survivorship Per Field](/docs/architecture/record-linkage#survivorship-per-field) records which source won each demographic).
- **Match quality over time:** duplicate rates, review queue size and age, sampled false-link rates per algorithm version.
- **Identity proofing:** level, provider and dates for every person who accessed records through self-service, and every proxy grant.
- **Overlay exposure:** for each overlay, who saw the fused record, what was disclosed from it and to whom, to support the breach assessment.

## What This Means for the System You Build

- **Assume no shared identifier:** store every identifier with its assigning authority and lifetime, and match on standardized demographics.
- **Match before you create,** at registration and on every inbound record, with review bands and gates that veto risky links.
- **Err toward duplicates over overlays,** and never auto-merge two records with clinical history.
- **Make merges recorded, reversible and propagated,** and treat an overlay unmerge as a clinical review.
- **Process merge events from other systems** (A40, A47, replaced FHIR ids) as inputs to your own decision.
- **Standardize addresses, phones and names before comparing;** it buys more than a better algorithm.
- **Proof patients to IAL2 for cross-organization access,** through a credential service provider, and store outcomes rather than evidence.

## References

**Government**

- [GAO-19-197: Health Information Technology, Approaches and Challenges to Electronically Matching Patients' Records across Providers](https://www.gao.gov/products/gao-19-197), released January 15, 2019
- [GAO-19-197 (PDF)](https://www.gao.gov/assets/gao-19-197.pdf), as few as 50% of records accurately matched (2014 study), the ECRI DNR case, the FY1999 prohibition on a unique patient identifier, inconsistent formats, the Texas standards and 90% less manual review, referential matching, views on a national identifier
- [CMS: New Medicare card (MBI)](https://www.cms.gov/medicare/new-medicare-card), MBI format, excluded letters, random characters, the April 1, 2018 to December 31, 2019 transition
- [NIST: SP 800-63-4, Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final), final July 2025, superseding 800-63-3
- [NIST: SP 800-63A-4, Identity Proofing and Enrollment](https://pages.nist.gov/800-63-4/sp800-63a.html), IAL1, IAL2 and IAL3, evidence strength

**Standards and networks**

- [HL7 FHIR R4: Patient $match](https://hl7.org/fhir/R4/patient-operation-match.html), matching against an MPI, scores from 0 to 1, match grades, onlyCertainMatches
- [HL7: Interoperable Digital Identity and Patient Matching IG](https://hl7.org/fhir/us/identity-matching/), cross-organization $match, identity assurance and digital identifiers
- [HL7: Identity Matching IG package list](https://hl7.org/fhir/us/identity-matching/package-list.json), 1.0.0 and 2.0.0 dates
- [HL7 v2.5.1, Chapter 3: Patient Administration (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch03.html), A40 merge and A47 change identifier events
- [RCE: SOP, Individual Access Services v3.0 (PDF)](https://rce.sequoiaproject.org/wp-content/uploads/2026/07/SOP-IAS-XP-v3_June2026_Clean_-5081.pdf), IAL2 via approved CSPs, verified demographics, claims tokens and the demographics double-check

**In practice**

- [Rhapsody: Lyniate and NextGate announce merger agreement](https://rhapsody.health/blog/lyniate-and-nextgate-announce-merger-agreement-advancing-healthcare-interoperability-leadership/), NextGate's EMPI, March 15, 2022
- [CommonWell Health Alliance](https://www.commonwellalliance.org/), the master person index and record locator service
