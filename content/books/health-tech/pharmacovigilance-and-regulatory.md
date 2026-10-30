+++
title = "Pharmacovigilance & Regulatory Submissions"
nav_title = "Safety & Submissions"
description = "Drug safety and filings: adverse event clocks, MedWatch and FDA AEMS, E2B(R3), safety databases, eCTD v4.0 and ESG NextGen, REMS and real-world evidence."
category = "Health Tech Industry"
order = 1956
part = "Pharma and Clinical Trials"
tags = ["health-tech", "pharma", "pharmacovigilance", "e2b", "ectd", "fda", "data-model"]
+++

Once a drug is in people, every report of harm starts a clock. A subject in a trial has a serious unexpected reaction, a physician calls a manufacturer's medical information line about a patient's rash, a consumer posts about side effects on a company's social channel, a published case report names the product: each is a potential individual case safety report, and the company must capture it, assess it, code it, decide whether it's reportable, and submit it to every regulator that requires it within days. Pharmacovigilance is that operation plus the signal detection and periodic reporting built on top of it. Its sibling is regulatory operations: assembling the electronic submissions (INDs, marketing applications, supplements, annual reports) that a regulator reviews, in a dossier format that has been standard for two decades and is now being replaced.

This chapter covers safety reporting rules for trials and marketed products, the forms and electronic formats (MedWatch, E2B(R3)), FDA's adverse event system, safety databases and coding, the electronic common technical document and FDA's submission gateway, REMS, product labeling and identifiers, and real-world evidence. Trials are [Clinical Trials](/books/health-tech/clinical-trials); trial systems and Part 11 are [Trial Systems & 21 CFR Part 11](/books/health-tech/trial-systems-and-part-11); medical devices' own reporting and software as a device are Digital Health Apps & Devices. It extends `observations` and `documents` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages and documentation:

| Vendor | Product | What its public pages describe |
| --- | --- | --- |
| **Oracle Health Sciences** | Argus Safety | "Use Argus Safety to enter and intake adverse event cases, code medical and product terms, perform medical and quality assessments, and generate expedited and periodic reports"; release 2026.1.01 documented |
| **ArisGlobal** | LifeSphere | "the only unified, next-generation SaaS safety platform in production," with "More than 220 organizations" as customers |
| **Veeva** | Vault Safety, SafetyDocs, Safety Signal; Vault RIM | Safety is "a modern individual case safety report (ICSR) management system" with "Built-in gateway connections and reporting rules"; RIM covers registrations, submissions, publishing and archive |
| **FDA** | ESG NextGen, AEMS, Safety Reporting Portal | The agency side: the submission gateway, the adverse event system (renamed from FAERS) and a portal for companies without E2B capability |
| **EMA** | EudraVigilance | "the system for managing and analysing information on suspected adverse reactions to medicines" in the EEA, using E2B(R3) |

Two patterns:

- **Reporting rules are the product's core.** Every safety database sells a rules engine that decides, per case and per regulator, whether a report is due, in what format and by when; the rules are per jurisdiction, product, approval status and case seriousness.
- **The gateway is a transport, not a judge.** Companies submit through FDA's ESG and EMA's gateway; acknowledgments say a file arrived and parsed, and the regulator's review of it happens later. Submission systems track both.

## Safety Reporting Clocks

**During a trial (IND safety reports).** The sponsor must report a suspected adverse reaction that is both serious and unexpected, and certain other findings, "in no case later than 15 calendar days after the sponsor determines that the information qualifies," and unexpected fatal or life-threatening suspected adverse reactions within 7 calendar days of initial receipt, "in a narrative format or on FDA Form 3500A," with foreign reports allowed on a CIOMS I form (21 CFR 312.32). As of April 1, 2026, FDA requires electronic IND safety reports to use E2B(R3).

**After approval (drugs).** An applicant submits 15-day alert reports for serious and unexpected adverse experiences "as soon as possible but no later than 15 calendar days from initial receipt of the information by the applicant," periodic reports "at quarterly intervals, for 3 years from the date of approval of the application, and then at annual intervals," and reports "in an electronic format that FDA can process, review, and archive" (21 CFR 314.80).

**After approval (biologics).** The same 15-day rule, with quarterly periodic reports for 3 years from licensure due "within 30 days of the close of the quarter," then annual reports "within 60 days of the anniversary date" (21 CFR 600.80).

**Day zero.** Every clock starts at initial receipt by anyone in the company or its agents (a sales rep, a call center vendor, a social media monitor) of the minimum information: an identifiable patient, an identifiable reporter, a suspect product and an event. Software therefore timestamps receipt at the first touch, not when the safety team opens the case, and a vendor contract that delays forwarding moves the company's deadline, not the vendor's.

**MedWatch forms.** Form 3500 is "Designed for use by healthcare professionals," 3500B is "A consumer/patient-friendly version," and 3500A is the mandatory form for manufacturers, IND researchers, distributors, importers and user facilities when electronic submission isn't required.

## E2B(R3) and FDA's Adverse Event System

ICH E2B(R3) is the international message standard for individual case safety reports (ISO 27953-2), an HL7 v3-based XML message carrying the case: patient, reporter, products, reactions coded in MedDRA, narrative and causality. FDA's adoption, as of October 2026:

- FDA began accepting E2B(R3) postmarketing ICSRs on January 16, 2024.
- IND safety reports submitted electronically must use E2B(R3) as of April 1, 2026.
- FDA accepted E2B(R2) postmarketing ICSRs "through September 30, 2026"; "Beginning October 1, 2026, all ICSRs submitted via the ESG NextGen must be submitted" in E2B(R3), confirmed in a Federal Register notice of April 6, 2026.
- Companies without E2B capability may use the Safety Reporting Portal, and FDA publishes a regional implementation guide for E2B(R3).

FDA's adverse event database is now the **FDA Adverse Event Monitoring System (AEMS)**, "Formerly FDA Adverse Event Reporting System (FAERS)," intended to "consolidate multiple disparate reporting systems." Its public dashboard is a "highly interactive web-based tool," with the warnings that "Existence of a report does not establish causation" and "Rates of occurrence cannot be established with reports"; quarterly data files of raw, non-cumulative data are published in ASCII or SGML. In the EEA, EudraVigilance receives E2B(R3) reports and publishes public data at adrreports.eu.

## Inside a Safety Database

The case life cycle every vendor implements:

1. **Intake.** From EDC (trial SAEs), call centers, email, literature searches, partners under safety data exchange agreements, social listening and regulator downloads. Duplicate detection runs first.
2. **Triage.** Valid case (the four minimum elements)? Serious? Expected against the reference safety information (the investigator's brochure in trials, the label after approval)? This sets the clock.
3. **Data entry and coding.** Reactions and history coded in MedDRA, products in a drug dictionary; MedDRA is licensed through its maintenance organization. <!-- source-gap: meddra-licensing | missing | MedDRA licensing terms and release cadence from the MSSO | closes with: meddra.org subscription page readable without JavaScript (returned an empty page) | checked: 2026-10-29 -->
4. **Medical review.** Causality, narrative, follow-up questions to the reporter.
5. **Reporting rules.** Which regulators, partners, ethics committees and investigators get the case, in which format, by when.
6. **Submission and acknowledgment.** E2B over the gateway, with the regulator's acknowledgment recorded; follow-up information creates a new version of the same case.
7. **Aggregate reporting and signals.** Periodic reports, development safety update reports in trials, and statistical signal detection across cases.

The record is a case with versions: initial, then each follow-up, each submitted where required. A case is never edited after submission; a correction is a follow-up version.

## eCTD Submissions and ESG NextGen

The electronic common technical document is the dossier format for applications: five modules (regional administrative information, summaries, quality, nonclinical and clinical study reports) in a folder structure with an XML backbone, submitted as sequences that add, replace or delete documents in the application's lifecycle. As of October 2026, from FDA:

- eCTD is required for NDAs, ANDAs, BLAs, commercial INDs and master files, and optional for noncommercial INDs.
- "Electronic submissions must use a version of eCTD currently supported by FDA, either v3.2.2 or v4.0." FDA announced support for eCTD v4.0 in September 2024, supports moving a v3.2.2 application onto v4.0 (forward compatibility) beginning October 16, 2026, and says it "will provide advance notice of when the Agency will begin supporting electronic submission only in eCTD v4.0"; no v4.0-only date has been announced.
- New validation rejection criteria for v3.2.2 and v4.0 were noticed October 16, 2026.

**ESG NextGen** is "the FDA's modernized platform for securely receiving and processing electronic regulatory submissions," offering a Unified Submission Portal (replacing the legacy WebTrader), APIs that enable programmatic submissions, and AS2 for system-to-system transfer. Regulatory information management systems (Veeva RIM among them) publish sequences, validate them against FDA's rules, submit through the gateway and track acknowledgments and agency correspondence.

The study data inside the clinical module is CDISC ([Data Standards](/books/health-tech/trial-systems-and-part-11#data-standards-cdash-sdtm-adam-and-define-xml)); labeling is structured product labeling.

## REMS, Labeling and Product Identifiers

**REMS.** "A Risk Evaluation and Mitigation Strategy (REMS) is a drug safety program" FDA can require for drugs with serious risks, under section 505-1 of the FD&C Act; FDA lists approved programs at REMS@FDA. The statute's elements to assure safe use include prescribers with particular training or certification, specially certified pharmacies or settings, dispensing limited to certain settings, evidence of safe-use conditions such as lab results before dispensing, patient monitoring and a patient registry (21 U.S.C. 355-1(f)(3)), which makes a REMS a software system in its own right: certification lookups at the pharmacy, enrollment records and dispensing authorizations, often run by a vendor for a group of manufacturers. The REMS document itself is submitted in structured product labeling.

**Structured product labeling.** SPL is "a document markup standard approved by Health Level Seven (HL7)" used for labeling, establishment registration and drug listing, and for REMS documents.

**NDC.** The National Drug Code is a three-segment number identifying labeler, product and package; FDA's NDC Directory is built from SPL listing files and updated daily. A final rule "adopts a uniform, 12-digit format for the national drug code (NDC)" that "takes effect March 7, 2033," so every system storing NDCs (pharmacy claims, formularies, eRx, inventory) has a format migration ahead; [Terminologies & Code Sets](/books/health-tech/terminology-and-coding) covers NDC normalization.

## Real-World Evidence

FDA defines real-world data as "data relating to patient health status and/or the delivery of health care" and real-world evidence as "the clinical evidence about the usage and potential benefits or risks of a medical product" derived from it; the 21st Century Cures Act "was designed to accelerate medical product development," and FDA "created a Framework in 2018" for using RWE in regulatory decisions. FDA's Sentinel Initiative, launched in May 2008 in response to FDAAA, with the full system launched in February 2016, is "the largest multisite distributed database in the world dedicated to medical product safety," querying data that stays at partner organizations.

For health tech, RWE is where the care platforms of this volume meet pharma: EHR and claims data, de-identified or under data use agreements, linked by tokens, become the evidence. The privacy machinery is [De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use); the data provenance machinery (where each value came from, under what terms) has to be built in from the start, because a regulator assessing RWE asks the same attributability questions as for trial data.

## How to Build It

A safety system is a case store with versioned submissions; a regulatory system is a document store with lifecycle sequences. The core `observations` (a recorded reaction in a care setting) and `documents` (kept as created) are the sources; this chapter adds adverse events, safety reports and regulatory submissions:

```sql
CREATE TABLE adverse_events (            -- a safety case, from first receipt
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the marketing authorization holder or sponsor
  case_number      TEXT NOT NULL,         -- the company's worldwide unique case ID
  source           TEXT NOT NULL CHECK (source IN ('clinical_trial', 'spontaneous_hcp',
                     'spontaneous_consumer', 'literature', 'partner', 'regulator',
                     'social_media', 'patient_support_program')),
  study_subject_id UUID REFERENCES study_subjects (id),  -- trial cases
  received_at      TIMESTAMPTZ NOT NULL,  -- first receipt anywhere in the company: day zero
  valid_at         TIMESTAMPTZ,           -- when the four minimum elements were present
  serious          BOOLEAN,
  expected         BOOLEAN,               -- against the reference safety information version below
  rsi_version      TEXT,
  status           TEXT NOT NULL CHECK (status IN ('intake', 'triage', 'data_entry',
                     'medical_review', 'ready', 'closed', 'invalid', 'duplicate')),
  duplicate_of     UUID REFERENCES adverse_events (id),
  UNIQUE (organization_id, case_number)
);

CREATE TABLE adverse_event_versions (    -- initial and every follow-up, immutable once submitted
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  adverse_event_id UUID NOT NULL REFERENCES adverse_events (id),
  version          SMALLINT NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL,  -- receipt of this follow-up resets reportable clocks
  content          JSONB NOT NULL,        -- patient, products, reactions (MedDRA), narrative, causality
  meddra_version   TEXT NOT NULL,
  locked_at        TIMESTAMPTZ,
  UNIQUE (adverse_event_id, version)
);

CREATE TABLE safety_reports (            -- one submission of one case version to one recipient
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  case_version_id    UUID NOT NULL REFERENCES adverse_event_versions (id),
  recipient          TEXT NOT NULL,       -- 'FDA', 'EMA', a partner, an ethics committee
  report_type        TEXT NOT NULL CHECK (report_type IN ('ind_7_day', 'ind_15_day',
                       'postmarket_15_day', 'periodic', 'non_expedited', 'partner')),
  format             TEXT NOT NULL CHECK (format IN ('e2b_r3', 'e2b_r2', 'form_3500a',
                       'cioms_i', 'portal')),
  due_at             TIMESTAMPTZ NOT NULL,  -- computed from day zero and the rule
  due_rule_ref       TEXT NOT NULL,
  submitted_at       TIMESTAMPTZ,
  gateway_message_id TEXT,
  ack_status         TEXT CHECK (ack_status IN ('pending', 'accepted', 'rejected')),
  ack_at             TIMESTAMPTZ,
  UNIQUE (case_version_id, recipient, report_type)
);

CREATE TABLE regulatory_submissions (    -- an eCTD sequence in an application's lifecycle
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  application      TEXT NOT NULL,         -- 'IND 123456', 'NDA 212345'
  sequence         TEXT NOT NULL,         -- '0000', '0001', ...
  ectd_version     TEXT NOT NULL CHECK (ectd_version IN ('3.2.2', '4.0')),
  submission_type  TEXT NOT NULL,         -- original, amendment, supplement, annual report, safety
  documents        JSONB NOT NULL,        -- module, node, operation (new, replace, delete), document id
  validation_ref   TEXT,                  -- the validation report against FDA's criteria
  gateway          TEXT NOT NULL CHECK (gateway IN ('esg_portal', 'esg_api', 'esg_as2')),
  submitted_at     TIMESTAMPTZ,
  acks             JSONB NOT NULL DEFAULT '[]',  -- each gateway and center acknowledgment
  UNIQUE (application, sequence)
);
```

Design notes:

- **Day zero is captured at the edge.** Every intake channel (call center, patient support program, social monitoring) stamps `received_at` when the company first had the information, and the clock is computed from it, never from case creation ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Cases version, never edit.** A follow-up is a new `adverse_event_versions` row; a submitted version is locked, and corrections are follow-ups.
- **Reporting rules are data per recipient.** Seriousness, expectedness, product approval status and jurisdiction select the report type and due time; the rule is recorded on the report ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Formats are per recipient and date.** `format` lets E2B(R2) and R3 coexist for partners while FDA is R3-only from October 1, 2026.
- **Every program is an intake channel.** Patient support programs, nurse educators and hub services in [Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial) must forward adverse events within the contractual window, so their systems have a "report an adverse event" path that creates the case with its receipt time.

## Auditing

- **Clock compliance:** for each case, day zero, triage decisions, due times and submission times, so late reports can be counted and explained, as inspectors and partners audit.
- **Case versions:** every version with who entered and reviewed it, MedDRA version and the locked content submitted.
- **Gateway evidence:** message IDs and acknowledgments for every safety report and eCTD sequence.
- **Vendor handoffs:** receipt and forwarding times from every third party that can receive adverse event information.
- **Part 11 controls** on all of it: audit trails, signatures on medical review and submission approval ([21 CFR Part 11](/books/health-tech/trial-systems-and-part-11#21-cfr-part-11)).

## What This Means for the System You Build

- **Stamp day zero at the first company touch** and compute every reporting deadline from it.
- **Version cases** and lock what was submitted; treat follow-ups as new versions with their own clocks.
- **Encode reporting rules per regulator, product and case attributes** with the rule recorded on each report.
- **Move to E2B(R3)** for all FDA safety reporting, keeping R2 only where a partner still needs it.
- **Track eCTD sequences and gateway acknowledgments** and plan for v4.0 while v3.2.2 remains accepted.
- **Give every patient-facing program an adverse event intake path.**
- **Plan the NDC 12-digit migration** wherever NDCs are stored.

## References

**Regulations**

- [21 CFR 312.32: IND safety reporting (eCFR)](https://www.ecfr.gov/current/title-21/part-312/section-312.32), 15-day and 7-day reports, Form 3500A and CIOMS I
- [21 CFR 314.80: Postmarketing reporting of adverse drug experiences (eCFR)](https://www.ecfr.gov/current/title-21/part-314/section-314.80), 15-day alert reports, quarterly then annual periodic reports, electronic format
- [21 CFR 600.80: Postmarketing reporting of adverse experiences (eCFR)](https://www.ecfr.gov/current/title-21/part-600/section-600.80), biologics 15-day and periodic report timing
- [Federal Register API: Postmarketing ICSRs must use adopted data standards from October 1, 2026 (April 6, 2026)](https://www.federalregister.gov/api/v1/documents/2026-06660.json), the E2B(R3) transition notice

**FDA**

- [FDA: MedWatch forms for FDA safety reporting](https://www.fda.gov/safety/medical-product-safety-information/medwatch-forms-fda-safety-reporting), Forms 3500, 3500B and 3500A
- [FDA: AEMS electronic submissions](https://www.fda.gov/drugs/fda-adverse-event-monitoring-system-aems/fda-adverse-event-monitoring-system-aems-electronic-submissions), E2B(R3) dates for postmarketing and IND reports, the Safety Reporting Portal
- [FDA: AEMS public dashboard](https://www.fda.gov/drugs/fda-adverse-event-monitoring-system-aems/fda-adverse-event-monitoring-system-aems-public-dashboard), the FAERS rename, consolidation, causation and rates caveats
- [FDA: AEMS quarterly data files](https://www.fda.gov/drugs/fda-adverse-event-monitoring-system-aems/fda-adverse-event-monitoring-system-aems-latest-quarterly-data-files), raw non-cumulative data in ASCII or SGML
- [FDA: Electronic Common Technical Document](https://www.fda.gov/drugs/electronic-regulatory-submission-and-review/electronic-common-technical-document-ectd), required submission types, v3.2.2 and v4.0, forward compatibility from October 16, 2026, no v4.0-only date
- [FDA: ESG NextGen](https://www.fda.gov/industry/electronic-submissions-gateway-next-generation-esg-nextgen), Unified Submission Portal, APIs and AS2
- [21 U.S.C. 355-1: Risk evaluation and mitigation strategies (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/355-1), elements to assure safe use in subsection (f)(3)
- [FDA: Risk Evaluation and Mitigation Strategies](https://www.fda.gov/drugs/drug-safety-and-availability/risk-evaluation-and-mitigation-strategies-rems), REMS as a drug safety program, REMS@FDA
- [FDA: Structured Product Labeling resources](https://www.fda.gov/industry/fda-data-standards-advisory-board/structured-product-labeling-resources), SPL as an HL7 standard, uses including REMS documents
- [FDA: National Drug Code Directory](https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory), daily updates from SPL, the three-segment number, the 12-digit format effective March 7, 2033
- [FDA: Real-World Evidence](https://www.fda.gov/science-research/science-and-research-special-topics/real-world-evidence), RWD and RWE definitions, the Cures Act and the 2018 framework
- [FDA: Sentinel Initiative](https://www.fda.gov/safety/fdas-sentinel-initiative), launched May 2008 under FDAAA, full system February 2016, distributed database

**EU and vendors**

- [EMA: EudraVigilance](https://www.ema.europa.eu/en/human-regulatory-overview/research-development/pharmacovigilance-research-development/eudravigilance), the EEA system, E2B(R3) ICSRs, public data at adrreports.eu
- [Oracle: Argus Safety documentation](https://docs.oracle.com/en/industries/life-sciences/argus-safety/index.html), case intake, coding, assessment, expedited and periodic reports
- [ArisGlobal](https://www.arisglobal.com/), LifeSphere safety platform and customer count
- [Veeva: Vault Safety](https://www.veeva.com/products/vault-safety/), ICSR management, gateway connections and reporting rules
- [Veeva: Vault RIM](https://www.veeva.com/products/vault-rim/), registrations, submissions, publishing and archive
