+++
title = "Clinical Trials"
description = "How trials run: phases and the IND, sponsors, CROs and sites, IRBs and informed consent, ClinicalTrials.gov under FDAAA 801, decentralized trials and eConsent."
category = "Health Tech Industry"
order = 1954
part = "Pharma and Clinical Trials"
tags = ["health-tech", "pharma", "clinical-trials", "fda", "informed-consent", "clinicaltrials-gov", "data-model"]
+++

A clinical trial is a regulated experiment in people, and almost every part of it is a record somebody will inspect. A sponsor (a drug or device company, an academic center, a government agency) writes a protocol, files it with the FDA, hires a contract research organization to run much of the work, and contracts with dozens or hundreds of sites (hospitals, academic centers, research clinics) whose investigators enroll patients. Each site's institutional review board approves the protocol and the consent form; each subject signs consent before anything happens to them; each visit's data flows into the sponsor's systems; every adverse event is assessed and some are reported to the FDA within days; and the trial is registered publicly before it starts and its results posted after it ends. The software that runs this is a separate industry from the clinical care software in the rest of this volume, with its own vendors and its own validation rules, but it touches the same patients and often the same EHRs.

This chapter covers the business and the rules: phases and the IND, sponsors, CROs and sites, IRBs and informed consent, ClinicalTrials.gov registration and results, decentralized elements and eConsent, recruitment, and diversity plans. The systems (EDC, CTMS, eTMF, randomization, ePRO, CDISC standards) and the electronic records rule they all answer to are [Trial Systems & 21 CFR Part 11](/books/health-tech/trial-systems-and-part-11); safety reporting and marketing applications are [Pharmacovigilance & Regulatory Submissions](/books/health-tech/pharmacovigilance-and-regulatory). It extends `patients` and `organizations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from filings and company pages:

| Company | Role | What its public record says |
| --- | --- | --- |
| **IQVIA** | Largest CRO and data company | 2025 revenue $16,310 million, R&D Solutions $8,896 million, contracted backlog $32.7 billion at year end; reorganized into Commercial Solutions and R&D Solutions from January 1, 2026 (10-K) |
| **Medpace** | Full-service CRO | 2025 revenue $2,530.2 million, backlog $3,027.2 million, about 6,200 employees in 46 countries (10-K) |
| **ICON** | Full-service CRO | "Clinical Research Organisation (CRO) for Drug Development," with full service outsourcing and flexible support for biotech |
| **Medidata** (Dassault Systèmes) | Trial software platform | "42 K+ clinical trials," "13 M+ patients," and "80% of FDA novel drug approvals used Medidata" |
| **Suvoda** | Randomization, eCOA, travel and patient payments | "6,000+" trials in "115+" countries |
| **Signant Health** | eCOA, randomization, eConsent | Supported trials associated with 25% of novel FDA and EMA approvals from 2020 to 2025 |

Three patterns:

- **The sponsor outsources the work, not the responsibility.** CROs run monitoring, data management, site management and safety for most industry trials, but FDA holds the sponsor accountable for anything not transferred in writing (below).
- **Sites are small businesses inside big institutions.** A research site runs dozens of studies from different sponsors, each with its own portal, EDC login, consent version and payment schedule; site-side software (study start-up, eRegulatory binders, site CTMS and payments) exists to survive that.
- **Platform vendors sell the whole chain.** Medidata, Veeva and Oracle sell EDC, randomization, ePRO, CTMS and eTMF on one platform, while specialists (Suvoda, Signant) compete on the patient-facing pieces.

## Phases and the IND

FDA describes drug development in phases (21 CFR 312.21):

- **Phase 1** "includes the initial introduction of an investigational new drug into humans," typically 20 to 80 subjects, to learn safety, metabolism and dosing.
- **Phase 2** are "controlled clinical studies conducted to evaluate the effectiveness of the drug" for a particular indication, usually "involving no more than several hundred subjects."
- **Phase 3** "usually include from several hundred to several thousand subjects," gathering the evidence of effectiveness and safety for a marketing application.
- **Phase 4** studies are conducted after approval, often as a condition of it.

A sponsor files an Investigational New Drug application before testing an unapproved drug in people; it goes into effect "Thirty days after FDA receives the IND, unless FDA notifies the sponsor" of a clinical hold (21 CFR 312.40), and an annual report is due "within 60 days of the anniversary date that the IND went into effect" (21 CFR 312.33). Devices follow a parallel path under an investigational device exemption. The IND is the anchor record: protocols, amendments, investigators, safety reports and annual reports all attach to it.

## Sponsors, CROs, Sites and Investigators

**Sponsor and CRO.** "A sponsor may transfer responsibility for any or all of the obligations set forth in this part," but "Any such transfer shall be described in writing," and "Any obligation not covered by the written description shall be deemed not to have been transferred." A CRO that assumes an obligation "shall be subject to the same regulatory action as a sponsor" (21 CFR 312.52). The transfer-of-obligations document is therefore data: which party owns monitoring, safety reporting, data management, IRB submission and registration for each study.

**Investigators and Form FDA 1572.** Before an investigator participates, the sponsor must obtain "A signed investigator statement (Form FDA-1572)," in which the investigator commits to personally conduct or supervise the study, follow the protocol, inform subjects the drug is investigational, meet consent and IRB requirements, report adverse experiences, read the investigator's brochure and ensure staff know their obligations; the form lists facilities, clinical labs, the IRB and subinvestigators (21 CFR 312.53). Investigators keep "adequate and accurate case histories" that "document that informed consent was obtained prior to participation," retained for "2 years following the date a marketing application is approved," or, if none is approved, "until 2 years after the investigation is discontinued and FDA is notified" (21 CFR 312.62). That retention clock depends on an event years away, so site systems retain trial records until the sponsor says the clock has started.

**IRBs.** An IRB has "at least five members," including a scientist, a nonscientist and "at least one member who is not otherwise affiliated with the institution" (21 CFR 56.107). Federally funded multisite research in the US "must rely upon approval by a single IRB" for its US sites under the revised Common Rule (45 CFR 46.114(b)(1)); industry trials commonly use a central commercial IRB as well. IRB approvals, continuing reviews and approved document versions are the records every consent and every site activation depends on.

## Informed Consent

FDA's consent regulation lists the basic elements every consent must contain: that the study is research, with its purpose, duration and procedures; foreseeable risks; benefits; alternatives; confidentiality, including that FDA may inspect records; compensation and treatment for injury when risk is more than minimal; whom to contact; and that participation is voluntary (21 CFR 50.25(a)). For applicable clinical trials, the form must include a fixed statement beginning "A description of this clinical trial will be available on http://www.ClinicalTrials.gov, as required by U.S. Law" (21 CFR 50.25(c)).

For research under the revised Common Rule, consent "must begin with a concise and focused presentation of the key information that is most likely to assist" a prospective subject, and for federally funded clinical trials one IRB-approved consent form must be posted on a public federal website "after the clinical trial is closed to recruitment" and "no later than 60 days after the last study visit by any subject" (45 CFR 46.116). FDA and OHRP issued a joint draft guidance on key information and facilitating understanding in March 2024; as of October 2026 it remains a draft. <!-- source-gap: key-information-guidance-status | status | whether the March 2024 FDA/OHRP draft guidance on key information in informed consent has been finalized | closes with: the FDA guidance page or hhs.gov/ohrp page showing final status (hhs.gov/ohrp returned 403) | checked: 2026-10-29 -->

Consent is not one signature. A subject re-consents when the IRB approves a revised form (a new risk, a protocol change), consents separately to optional parts (genetic testing, future use of samples), and may withdraw consent for some activities while staying in follow-up. A legally authorized representative may consent for an adult who can't; a child assents while a parent consents. The consent record is a sequence of versions, each tied to the IRB approval of the form signed.

## eConsent and Decentralized Elements

**eConsent.** FDA's *Use of Electronic Informed Consent: Questions and Answers* (December 2016, final) covers electronic consent, including remote consent, identity verification, comprehension aids and signatures, and is the reason eConsent systems exist as validated products; the signature itself must satisfy Part 11 ([Electronic Signatures](/books/health-tech/trial-systems-and-part-11#electronic-signatures)). An eConsent system records which version was presented, the time spent, any comprehension quiz answers, questions asked of study staff, and the signature with its meaning.

**Decentralized elements.** FDA's final guidance *Conducting Clinical Trials With Decentralized Elements* (September 2024) describes how "Decentralized elements allow trial-related activities to occur remotely at locations convenient for trial participants," through telehealth visits, in-home visits by mobile nurses and local health care providers. For software, a decentralized trial multiplies parties: the site investigator stays responsible, while a home health vendor, a local lab, a courier shipping drug to the home and a telehealth platform each create trial records that must reach the sponsor and be attributable. Telehealth mechanics are in [Telehealth](/books/health-tech/telehealth); here the point is that every remote activity names who performed it, under which site's delegation of authority, and where the source record lives.

## ClinicalTrials.gov

The FDA Amendments Act of 2007, section 801, and its regulation (42 CFR Part 11, not to be confused with 21 CFR Part 11) require registration and results reporting for applicable clinical trials:

- **Applicable clinical trials.** For trials initiated on or after January 18, 2017: an interventional drug or biologic trial whose "Study Phase is other than phase 1," or an interventional device trial whose "Primary Purpose" is "other than a feasibility study," of an FDA-regulated product, with a US site, a US-manufactured product for export, or an IND or IDE (42 CFR 11.22).
- **Registration.** "21 calendar days after the first human subject is enrolled" (42 CFR 11.24).
- **Results.** "no later than 1 year after the primary completion date," with delayed submission allowed for unapproved products under a certification, up to 2 years after the certification (42 CFR 11.44).
- **Penalties.** Civil money penalties under 21 U.S.C. 333(f)(3) are $15,107 per violation and $15,107 per day for violations not corrected within 30 days of notice, at the inflation-adjusted amounts last amended January 28, 2026 (45 CFR 102.3).
- **Enforcement in practice.** FDA's notices-of-noncompliance page, current as of October 22, 2026, lists 10 notices to 9 sponsors since 2021, the most recent two dated October 7, 2026, and no civil money penalty actions.

The record behind registration is the protocol's metadata (arms, interventions, outcomes, eligibility, sites, status), kept current: recruitment status and site lists must be updated as they change, and the results upload (participant flow, baseline, outcomes, adverse events) is a structured dataset derived from the study database. Registration also has to agree with the consent form statement above and with the WHO-registry or EU registration the same trial may need (the EU side is in [The EU](/books/health-tech/eu-health-data)).

## Recruitment and Diversity

Enrollment is the slowest part of most trials. Recruitment channels include site patient databases and EHR queries, referral networks, advertising (IRB-approved), registries and patient communities, and vendors that pre-screen online; each pre-screen collects health information about people who are not yet subjects, so privacy terms and IRB-approved materials govern what is asked and kept. Where a site uses its EHR to find candidates, the HIPAA research rules apply (preparatory to research reviews and waivers of authorization), which [De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use) covers.

**Diversity action plans.** The Food and Drug Omnibus Reform Act of 2022 requires sponsors of certain late-stage trials to submit diversity action plans. FDA's draft guidance (June 2024) was removed from FDA's site in January 2025 and restored under a court order, and the restored page carries an HHS banner rejecting its content; as of October 2026 it is still a draft marked "Not for implementation," and the Federal Register shows no final guidance. Because the statutory requirement applies to studies starting enrollment a set period after final guidance is published, the clock has not started; a sponsor's system should still be able to record a plan, enrollment targets and actual enrollment by demographic group.

## How to Build It

Trial software usually lives outside the care platform, but when a health system, a site network or a platform touching both connects them, the same patient appears in both, and the mapping must be explicit. The core `patients` (the person at the site), `organizations` (sponsor, CRO, site institution, IRB) and `consents` gain trial records:

```sql
CREATE TABLE studies (                   -- a protocol, under an IND or IDE
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),  -- the tenant: sponsor, CRO or site
  sponsor_org_id    UUID NOT NULL REFERENCES organizations (id),
  protocol_number   TEXT NOT NULL,
  phase             TEXT CHECK (phase IN ('1', '1_2', '2', '2_3', '3', '4', 'na')),
  ind_number        TEXT,
  ide_number        TEXT,
  nct_id            TEXT,                -- ClinicalTrials.gov identifier, once registered
  eu_ct_number      TEXT,                -- EU CTIS number, if run in the EU
  applicable_trial  BOOLEAN,             -- FDAAA 801: decides registration and results duties
  primary_completion_on DATE,            -- starts the 1-year results clock
  results_due_on    DATE,                -- computed, with any certification extension
  status            TEXT NOT NULL CHECK (status IN ('planning', 'startup', 'enrolling',
                      'active_not_recruiting', 'completed', 'terminated', 'suspended')),
  obligations       JSONB NOT NULL,      -- per obligation, sponsor or CRO, from the transfer document
  UNIQUE (sponsor_org_id, protocol_number)
);

CREATE TABLE study_sites (               -- a site's participation in a study
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  study_id           UUID NOT NULL REFERENCES studies (id),
  site_org_id        UUID NOT NULL REFERENCES organizations (id),
  location_id        UUID REFERENCES locations (id),
  principal_investigator_id UUID NOT NULL REFERENCES practitioners (id),
  irb_org_id         UUID NOT NULL REFERENCES organizations (id),
  form_1572_doc_id   UUID REFERENCES documents (id),   -- the signed investigator statement
  irb_approved_during DATERANGE,         -- current approval through continuing review
  site_number        TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('selected', 'activated', 'enrolling',
                       'closed_to_enrollment', 'closed')),
  UNIQUE (study_id, site_number)
);

CREATE TABLE study_subjects (            -- a person enrolled at a site; the link to the chart is explicit
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  study_site_id    UUID NOT NULL REFERENCES study_sites (id),
  subject_number   TEXT NOT NULL,        -- what the sponsor sees; never the MRN or name
  patient_id       UUID REFERENCES patients (id),  -- only in the site's own tenant
  status           TEXT NOT NULL CHECK (status IN ('prescreened', 'screening',
                     'screen_failed', 'enrolled', 'randomized', 'completed', 'withdrawn',
                     'lost_to_follow_up')),
  enrolled_on      DATE,
  withdrawn_scope  TEXT CHECK (withdrawn_scope IN ('treatment', 'all_procedures',
                     'all_data_collection')),
  UNIQUE (study_site_id, subject_number)
);

CREATE TABLE econsents (                 -- each consent version a subject signed, or declined
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  study_subject_id    UUID NOT NULL REFERENCES study_subjects (id),
  consent_id          UUID REFERENCES consents (id),  -- the core consent ledger row
  form_document_id    UUID NOT NULL REFERENCES documents (id),  -- the IRB-approved version shown
  irb_approval_ref    TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('main', 'optional_genetic',
                        'optional_future_use', 'assent', 'reconsent', 'withdrawal')),
  signer_role         TEXT NOT NULL CHECK (signer_role IN ('subject', 'lar', 'parent',
                        'witness', 'investigator')),
  remote              BOOLEAN NOT NULL,
  identity_check_ref  TEXT,             -- how a remote signer was verified
  presented_at        TIMESTAMPTZ NOT NULL,
  signed_at           TIMESTAMPTZ,      -- null: declined
  signature_id        UUID,             -- electronic_signatures (Trial Systems & 21 CFR Part 11)
  comprehension       JSONB             -- quiz answers and questions raised
);
```

Design notes:

- **The subject number is the boundary.** Sponsors, CROs and EDC see `subject_number`; only the site's tenant maps it to `patient_id`. A platform serving both sides keeps the link in the site's tenant and never lets the sponsor tenant join to it ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).
- **Consent is versioned and gating.** No study procedure may be recorded for a subject before a signed main consent on the IRB-approved version current at the time; a reconsent requirement blocks visits until it is signed.
- **Obligations are data.** Who registers, who reports safety, who monitors: stored per study from the transfer-of-obligations document, so reminders and audits route to the right party.
- **Deadlines are computed.** Registration (21 days after first enrollment), results (1 year after primary completion), IND annual reports (60 days after the anniversary) and retention (2 years after approval or discontinuation) are stored with the rule that set them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

FDA inspects sites (bioresearch monitoring) and sponsors; the questions are always about attributable, contemporaneous records:

- **Consent before procedures:** for every subject, the consent version, its IRB approval, the signature time and the first procedure time.
- **Delegation and qualification:** the 1572, the delegation of authority log, training records and CVs for everyone who performed study tasks, including decentralized vendors.
- **IRB history:** approvals, amendments, continuing reviews and the documents approved.
- **Registration and results:** what was posted to ClinicalTrials.gov and when, against the deadlines.
- **Retention:** trial records held until the retention clock has run, regardless of the site's ordinary medical record schedule ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## What This Means for the System You Build

- **Model sponsor, CRO, site, investigator and IRB as separate organizations and roles,** with the transfer of obligations stored per study.
- **Gate every study activity on a valid, current consent version** tied to its IRB approval.
- **Keep the subject number as the only identifier the sponsor sees,** with the link to the medical record held by the site.
- **Compute ClinicalTrials.gov, IND and retention deadlines** and keep registration data in sync with the study's real status.
- **Attribute decentralized activities** to the vendor and person who performed them, under the site's delegation.
- **Record diversity targets and enrollment by group** even while FDA's guidance is a draft.

## References

**Regulations**

- [21 CFR 312.21: Phases of an investigation (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/312.21), phase 1, 2 and 3 definitions and typical sizes
- [21 CFR 312.40: General requirements for use of an investigational new drug (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.40), the IND in effect 30 days after receipt unless on clinical hold
- [21 CFR 312.33: Annual reports (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.33), due within 60 days of the IND anniversary
- [21 CFR 312.52: Transfer of obligations to a contract research organization (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.52), written transfer, untransferred obligations, CRO subject to the same actions
- [21 CFR 312.53: Selecting investigators and monitors (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.53), Form FDA 1572 and its commitments
- [21 CFR 312.62: Investigator recordkeeping and record retention (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.62), case histories documenting consent, 2-year retention
- [21 CFR 56.107: IRB membership (eCFR)](https://www.ecfr.gov/current/title-21/part-56/section-56.107), at least five members, scientific, nonscientific and unaffiliated members
- [21 CFR 50.25: Elements of informed consent (eCFR)](https://www.ecfr.gov/current/title-21/part-50/section-50.25), the basic elements and the ClinicalTrials.gov statement
- [45 CFR 46.116: General requirements for informed consent (eCFR)](https://www.ecfr.gov/current/title-45/part-46/section-46.116), key information first, posting of consent forms within 60 days
- [45 CFR 46.114: Cooperative research (eCFR)](https://www.ecfr.gov/current/title-45/part-46/section-46.114), single IRB for US cooperative research
- [42 CFR 11.22: Applicable clinical trials (eCFR)](https://www.ecfr.gov/current/title-42/part-11/section-11.22), drug and device criteria for trials from January 18, 2017
- [42 CFR 11.24: Registration deadline (eCFR)](https://www.ecfr.gov/current/title-42/part-11/section-11.24), 21 days after first enrollment
- [42 CFR 11.44: Results submission deadline (eCFR)](https://www.ecfr.gov/current/title-42/part-11/section-11.44), 1 year after primary completion, delayed submission
- [45 CFR 102.3: Civil monetary penalty adjustments (eCFR)](https://www.ecfr.gov/current/title-45/part-102/section-102.3), $15,107 per violation and per day for ClinicalTrials.gov violations

**FDA**

- [FDA: ClinicalTrials.gov notices of noncompliance](https://www.fda.gov/science-research/fdas-role-clinicaltrialsgov-information/clinicaltrialsgov-notices-noncompliance), 10 notices to 9 sponsors, no civil money penalties (current as of October 22, 2026)
- [FDA: Conducting Clinical Trials With Decentralized Elements (September 2024)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/conducting-clinical-trials-decentralized-elements), final guidance and the definition of decentralized elements
- [FDA: Use of Electronic Informed Consent, Questions and Answers (December 2016)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/use-electronic-informed-consent-clinical-investigations-questions-and-answers), the final eConsent guidance
- [FDA: Diversity Action Plans draft guidance (June 2024)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/diversity-action-plans-improve-enrollment-participants-underrepresented-populations-clinical-studies), draft status, the court-ordered restoration banner
- [Federal Register API: documents on diversity action plans](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22diversity+action+plans%22), no final guidance notice through October 2026

**Filings and companies**

- [IQVIA: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1478242/000162828026008322/iqv-20251231.htm), revenue by segment, backlog, 2026 segment change
- [Medpace: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1668397/000166839726000006/medp-20251231.htm), revenue, backlog, employees and countries
- [ICON](https://www.iconplc.com/), full-service CRO
- [Medidata](https://www.medidata.com/en/), trials, patients and the share of novel approvals
- [Suvoda](https://www.suvoda.com/), RTSM, eCOA, travel and payments, trials and countries
- [Signant Health](https://www.signanthealth.com/), eCOA, RTSM and eConsent, share of novel approvals supported
