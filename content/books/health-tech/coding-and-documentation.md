+++
title = "Coding, Documentation & Compliance"
nav_title = "Coding & Compliance"
description = "What a claim may say: E/M guidelines, documentation integrity, coverage policy, compliance programs, the False Claims Act, Anti-Kickback and Stark."
category = "Health Tech Industry"
order = 1927
part = "Revenue Cycle"
tags = ["health-tech", "medical-coding", "e-m", "false-claims-act", "anti-kickback", "stark", "compliance"]
+++

A claim is a statement of fact: this patient received these services, for these reasons, documented in this record. Coding turns the record into the codes the claim carries (CPT and HCPCS for what was done, CDT for dental, ICD-10-CM for why), and the record has to support every code. When it doesn't, the payer may deny the claim or take the money back, and for government programs a pattern of unsupported claims can be fraud. Software sits in the middle of all of it: it suggests codes from documentation, prompts for missing elements, assembles claims, and, in the worst cases, has been the mechanism by which providers billed for more than they did. The Department of Justice recovered more than $6.8 billion under the False Claims Act in fiscal 2025, just over $5.7 billion of it in health care.

This chapter is about the rules a system has to respect when it touches codes, documentation and money: how evaluation and management levels are chosen, what documentation integrity work does, how medical necessity and coverage policy decide what Medicare pays, what a compliance program contains, and the three federal laws that most constrain health software and its business models (the False Claims Act, the Anti-Kickback Statute and the physician self-referral law, called Stark). The code sets themselves (their structure, owners, licenses and update cycles) are Part 2's [Terminologies & Code Sets](/books/health-tech/terminology-and-coding) chapter. It builds on `procedures`, `documents`, `charges` and `claims` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from regulators' and standards owners' pages:

| Source | What it governs | What it says |
| --- | --- | --- |
| **AMA CPT** | Procedure codes and E/M guidelines | CPT is "Copyright American Medical Association. All rights reserved."; most changes take effect January 1; office E/M levels by medical decision making or total time since 2021, extended to other E/M categories in 2023 |
| **CMS coverage** | National and local coverage determinations | NCDs set national Medicare coverage; LCDs apply "In the absence of a national coverage policy," issued by Medicare contractors |
| **CMS ABN (CMS-R-131)** | Notice to traditional Medicare patients | Used "in situations where Medicare payment is expected to be denied" |
| **CMS NCCI** | Code pair and unit edits | Quarterly PTP and MUE files ([Scrubbing and Edits](/books/health-tech/claims#scrubbing-and-edits)) |
| **HHS OIG** | Compliance program guidance | General Compliance Program Guidance (November 6, 2023), with industry-specific guidance for Medicare Advantage (February 3, 2026) and nursing facilities (November 20, 2024) |
| **DOJ** | False Claims Act enforcement | Fiscal 2025 recoveries over $6.8 billion, the highest ever; 1,297 qui tam suits filed, a record |
| **42 CFR 1001.952 and 411.357** | Anti-Kickback safe harbors and Stark exceptions | EHR donations allowed if the recipient pays 15% of the donor's cost; cybersecurity donations allowed under their own safe harbor and exception |

Three patterns:

- **The documentation is the evidence.** Every rule above ends at the record: the E/M level must be supported by the documented decision making or time, the coverage policy by the documented diagnosis, the claim by the note.
- **Licensed codes, public rules.** The AMA and ADA own CPT and CDT and license them; the rules for using them (Medicare's coverage, edits and payment policy) are public.
- **Enforcement is large and growing.** Record recoveries and record whistleblower filings mean a software feature that inflates codes is a liability for its customers and its maker.

## Evaluation and Management

Evaluation and management (E/M) codes bill visits: office visits, hospital care, consultations, nursing facility and home visits, each in levels. The level is the single largest coding decision in outpatient medicine, and the rules changed fundamentally in 2021.

**Office and outpatient visits since 2021.** The AMA's guidelines, adopted by CMS for Medicare, "Eliminate history and physical as elements for code selection": the clinician performs a "medically appropriate history and/or examination," and the level is chosen by either **medical decision making** (MDM: the number and complexity of problems addressed, the data reviewed and analyzed, and the risk of patient management) or **total time** on the date of the encounter, whichever the clinician documents. Time "is minimum time, not typical time."

**Other settings since 2023.** The CPT Editorial Panel extended the same approach to the rest of the E/M section: observation codes were deleted and merged into hospital care codes, consultation guidelines were simplified, nursing facility and home visit families were consolidated (domiciliary codes 99334 to 99340 merged into the home visit codes 99341 to 99350), and the old direct-contact prolonged service codes (99354 to 99357) were deleted. Emergency department levels kept the principle that "time cannot be used as a key criterion."

What it means for software:

- **Capture what the level rests on.** For MDM, the problems addressed, data reviewed (and by whom), and risk; for time, the total minutes on the date and what they included. A note template that records these as structured fields makes the level defensible.
- **Suggest, never assign.** A system can compute the level the documentation supports and show the gap ("time documented supports level 3; MDM elements support level 4"), and the clinician chooses. Auto-assigning the highest supportable level, or defaulting to a level, is the classic upcoding pattern.
- **Time is per date.** Total time counts the clinician's time on the date of the visit, which a timer or attestation captures; time on other dates doesn't count toward that visit's level.

## Documentation Integrity

Clinical documentation integrity (CDI, also clinical documentation improvement) is the work of making sure the record says what was actually done and why, specifically enough to code. A CDI specialist reviews records (concurrently, during a hospital stay, or retrospectively before billing) and sends the clinician a **query**: a question asking for clarification, such as whether the documented anemia is acute blood loss anemia, or whether a lab finding is clinically significant.

The rule for queries is that they must not lead. A query presents the clinical indicators in the record and asks the clinician to document a conclusion, with options including "other" and "unable to determine," never a suggestion of the code that pays more. For software:

- **Queries are records,** with the indicators shown, the options offered, the clinician's answer and the resulting documentation amendment, linked to the note ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **AI suggestions are queries, not edits.** A model that finds an undocumented condition in the chart produces a question for the clinician with its evidence, never a diagnosis added to the claim. The rules for AI-generated documentation are Part 10's [AI in Health Tech](/books/health-tech/ai-in-health-tech#ambient-scribes) chapter.
- **Diagnoses drive risk payments.** In Medicare Advantage and value-based contracts, diagnoses raise payments directly, so CDI in those settings is a compliance focus of its own ([Risk Adjustment](/books/health-tech/value-based-care#medicare-advantage-and-risk-adjustment)).

## Medical Necessity, NCDs and LCDs

Medicare pays only for services that are reasonable and necessary, and coverage policy says what that means for specific services:

- **National coverage determinations** (NCDs) are made by CMS "through an evidence-based process, with opportunities for public participation," and apply nationwide. A completed request is decided within six or nine months, with a 30-day comment period on the proposed decision.
- **Local coverage determinations** (LCDs) are made by Medicare administrative contractors for their jurisdictions, "In the absence of a national coverage policy." They typically list the diagnosis codes that support a service, frequency limits, and documentation requirements, often with billing articles that give the code lists.

A claim whose diagnosis isn't on the policy's list is denied as not medically necessary. A scrubber checks diagnosis and procedure pairs against the NCDs and LCDs in effect for the practice's contractor and date of service; the policy text and code lists are public in CMS's Medicare Coverage Database and change on their own schedule, so the rule set is dated data.

**The advance beneficiary notice.** When a provider expects traditional Medicare to deny a service as not reasonable and necessary, it gives the patient an ABN (form CMS-R-131) before the service, used "in situations where Medicare payment is expected to be denied." A signed ABN lets the provider bill the patient if Medicare denies; without it, the provider generally can't. The claim then carries a modifier saying an ABN is on file. For software: the ABN is generated from the coverage check, signed before the service, kept as a document, and linked to the claim line; and the patient's choice (receive the service and be billed, or decline) is recorded. Commercial plans have their own waiver rules, often in the provider contract.

## Compliance Programs

OIG's General Compliance Program Guidance (November 6, 2023) describes the elements of an effective compliance program for any health care entity, from a small practice to a health system or a vendor, with industry-specific guidance layered on (Medicare Advantage in February 2026, nursing facilities in November 2024). The elements are the familiar ones: written policies and procedures; a compliance officer and committee with authority; training and education; open lines of communication including a way to report concerns anonymously; enforcing standards consistently, with discipline; risk assessment, auditing and monitoring; and responding to detected offenses with corrective action. For a coding and billing system the operational parts are:

- **Audits by sample.** Periodic review of a sample of claims per provider against the documentation, with results and error rates by provider and code, and education for outliers.
- **Monitoring for patterns.** E/M level distributions by provider against peers, modifier rates (25 and 59 especially), and code frequencies that shift suddenly.
- **Overpayment handling.** Findings that show overpayments start the 60-day clock ([Overpayments: The 60-Day Rule](/books/health-tech/denials-and-appeals#overpayments-the-60-day-rule)).
- **Exclusion screening.** Federal programs won't pay for services by excluded individuals; staff and providers are checked against OIG's exclusion list at hire and periodically.

A vendor's compliance program covers its own conduct, and when the vendor bills on behalf of providers (an RCM company) or builds coding features, the program covers those features too.

## The False Claims Act

The False Claims Act makes it unlawful to knowingly submit, or cause to be submitted, a false claim for payment to the federal government. Health care is most of its use. The parts that matter for software:

- **"Knowingly" includes reckless disregard and deliberate ignorance.** Not knowing that a system inflates codes isn't a defense if the warning signs were ignored. The same knowledge standard now defines when an overpayment is "identified" under Medicare's overpayment rule (42 CFR 401.305).
- **Penalties are per claim.** Civil penalties of $14,308 to $28,619 per claim for penalties assessed after July 3, 2025 (28 CFR 85.5), plus treble damages. A coding pattern across thousands of claims multiplies quickly.
- **Whistleblowers bring most cases.** A qui tam relator (often an employee) files under seal and shares in the recovery; 1,297 qui tam suits were filed in fiscal 2025, a record.
- **Software makers can be defendants.** Causing false claims to be submitted is enough, so a vendor whose product generates them can be liable, which is why the cases involving EHR vendors (settlements over certification and over features that encouraged billing) are required reading for anyone building coding tools.

**Upcoding and risk adjustment.** Upcoding is billing a higher-paying code than the documentation supports. In Medicare Advantage the equivalent is adding diagnoses that raise risk scores. On January 14, 2026, DOJ announced that Kaiser Permanente affiliates agreed to pay $556 million to resolve allegations that they added diagnoses through addenda to medical records from 2009 to 2018 to increase Medicare Advantage payments, with $95 million to the relators and no determination of liability. A diagnosis added after the visit, in bulk, prompted by a payer or vendor and not by the clinician's own care, is exactly the pattern enforcement targets.

## Anti-Kickback and Stark for Software

Two laws decide which business models health software can have:

**The Anti-Kickback Statute** (AKS) makes it a crime to offer, pay, solicit or receive anything of value to induce or reward referrals of items or services paid by federal health care programs. It applies to anyone, not only providers. Regulatory **safe harbors** (42 CFR 1001.952) protect arrangements that meet every condition. **The physician self-referral law** (Stark) bars a physician from referring Medicare patients for designated health services to an entity with which the physician has a financial relationship, unless an exception applies (42 CFR 411.357); it is strict liability, so intent doesn't matter.

What that means for software business models:

- **Donated EHRs and cybersecurity.** A hospital or lab giving physicians free software is remuneration. The EHR safe harbor and Stark exception allow donated EHR items and services if, among other conditions, "The recipient pays 15 percent of the donor's cost," the donor doesn't finance it, and the donation isn't tied to referral volume. Cybersecurity technology and services have their own safe harbor (1001.952(jj)) and exception (411.357(bb)), with no cost-sharing requirement but no referral-based terms and a signed writing. A vendor selling into a donation arrangement has to support the cost-share invoicing and the documentation.
- **Referral fees.** A platform that charges a lab, pharmacy, imaging center or device supplier per referral or per order sent through it, where federal program business is involved, is paying or receiving remuneration for referrals; fixed, fair-market-value fees for a service, not varying with referral volume, are the usual structure that fits a safe harbor. Patient-directed marketplaces and lead generation for health services need the same analysis. Part 1's [Business Models for Health Software](/books/health-tech/health-tech-business-models) chapter covers the models; the rule here is to get counsel before any fee varies with orders or referrals.
- **Free items to patients and providers.** Free services that could induce program business (free transportation, waived copays advertised as a feature) raise AKS and the civil monetary penalty law's beneficiary inducement rules; routine waiver of copays is a classic problem.
- **Payment tied to codes.** A billing company paid a percentage of collections is common and allowed; the concern arises when the arrangement rewards inflating claims, which compliance monitoring of the vendor addresses.

## How to Build It

This chapter adds the records that make coding defensible: E/M support captured with the note, documentation queries, ABNs and coding audits.

```sql
CREATE TABLE em_support (                -- what an E/M level rests on, captured at documentation time
  encounter_id      UUID PRIMARY KEY REFERENCES encounters (id),
  basis             TEXT NOT NULL CHECK (basis IN ('mdm', 'time')),
  problems          JSONB,                 -- addressed problems and their complexity
  data_reviewed     JSONB,                 -- tests, documents, independent historian, discussion
  risk              TEXT,                  -- risk of patient management, as documented
  total_minutes     SMALLINT,              -- on the date of the encounter
  supported_level   TEXT,                  -- computed suggestion
  chosen_code       TEXT NOT NULL,         -- the clinician's choice
  chosen_by         UUID NOT NULL REFERENCES practitioners (id),
  chosen_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documentation_queries (     -- CDI questions to the clinician
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  encounter_id     UUID NOT NULL REFERENCES encounters (id),
  document_id      UUID REFERENCES documents (id),
  raised_by        TEXT NOT NULL,          -- typed: cdi_specialist, coder, model
  indicators       JSONB NOT NULL,         -- the clinical evidence shown
  options          TEXT[] NOT NULL,        -- must include other and unable to determine
  response         TEXT,
  responded_by     UUID REFERENCES practitioners (id),
  amendment_doc_id UUID REFERENCES documents (id),
  status           TEXT NOT NULL CHECK (status IN ('open', 'answered', 'declined', 'expired')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at      TIMESTAMPTZ
);

CREATE TABLE coverage_waivers (          -- ABNs and commercial equivalents
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  coverage_id      UUID NOT NULL REFERENCES coverages (id),
  kind             TEXT NOT NULL CHECK (kind IN ('abn_cms_r_131', 'payer_waiver')),
  procedure_codes  TEXT[] NOT NULL,
  reason           TEXT NOT NULL,          -- the coverage rule expected to deny
  estimated_cost   BIGINT,
  patient_choice   TEXT NOT NULL CHECK (patient_choice IN ('receive_and_bill', 'receive_no_bill',
                     'decline')),
  signed_doc_id    UUID NOT NULL REFERENCES documents (id),
  signed_at        TIMESTAMPTZ NOT NULL
);

ALTER TABLE claim_lines
  ADD COLUMN waiver_id UUID REFERENCES coverage_waivers (id);   -- drives the ABN modifier

CREATE TABLE coding_reviews (             -- compliance program sampling
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  claim_line_id    UUID NOT NULL REFERENCES claim_lines (id),
  practitioner_id  UUID NOT NULL REFERENCES practitioners (id),
  review_period     DATERANGE NOT NULL,
  billed_code      TEXT NOT NULL,
  supported_code   TEXT,                   -- the auditor's finding
  finding          TEXT NOT NULL CHECK (finding IN ('supported', 'overcoded', 'undercoded',
                     'unsupported', 'modifier_error')),
  overpayment      BIGINT,                 -- opens an overpayment investigation if > 0
  auditor          UUID NOT NULL,
  audited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

A monitoring query for the compliance program, E/M level distribution by provider against the practice:

```sql
SELECT ch.rendering_role_id, l.code,
       COUNT(*) AS n,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY ch.rendering_role_id), 1) AS pct
FROM claims c
JOIN claim_lines l ON l.claim_id = c.id
JOIN charges ch    ON ch.id = l.charge_id
WHERE c.organization_id = $1
  AND c.submitted_at >= NOW() - INTERVAL '90 days'
  AND l.code IN ('99202', '99203', '99204', '99205', '99211', '99212', '99213', '99214', '99215')
GROUP BY ch.rendering_role_id, l.code
ORDER BY ch.rendering_role_id, l.code;
```

Design notes:

- **The clinician chooses the code;** the system records the support and its own suggestion separately, so an audit can see both.
- **Queries and AI suggestions never write to the claim.** They produce questions and, if the clinician agrees, an amendment to the record, from which the code follows.
- **Coverage rules are dated data** (NCDs, LCDs, payer policies), checked before the service so an ABN can be offered, and again at scrubbing.
- **Audit findings feed overpayments,** opening the 60-day investigation automatically.

## Auditing

- **Code selection:** who chose each code, with the documented support and any system suggestion, at the time of billing.
- **Every query** with its indicators and response, every amendment with its author and date relative to the claim.
- **Every ABN,** signed before the service, linked to the line it covers.
- **Compliance audits and monitoring results,** with corrective actions, retained as evidence of an effective compliance program.
- **Contracts and fee structures** with referral sources, reviewed against the AKS and Stark, since a fee that varies with referrals is a finding in itself.

## What This Means for the System You Build

- **Capture E/M support as structured data:** MDM elements or total time on the date, and let the clinician choose the level.
- **Never assign or default codes, add diagnoses or add modifiers to raise payment;** suggest with evidence and route to a person.
- **Make documentation queries non-leading records,** and treat AI findings as queries.
- **Check coverage policy before the service** so ABNs are offered, signed and linked to claim lines.
- **Support a compliance program:** sampling audits, level and modifier monitoring, exclusion screening, and overpayment workflows.
- **Design business models with the AKS and Stark in view:** fixed fair-market-value fees, cost-sharing for donated EHRs, no fees that vary with referrals of federal program business.

## References

**Coding and coverage**

- [AMA: CPT evaluation and management](https://www.ama-assn.org/practice-management/cpt/cpt-evaluation-and-management), the 2021 office visit changes and the 2023 extension to other E/M categories
- [AMA: CPT code process](https://www.ama-assn.org/about/cpt-editorial-panel/cpt-code-process), copyright and the January 1 effective date
- [CMS: Medicare coverage determination process](https://www.cms.gov/medicare/coverage/determination-process), NCDs and LCDs, timelines and comment periods
- [CMS: Advance beneficiary notice of noncoverage (ABN)](https://www.cms.gov/medicare/medicare-general-information/bni/abn), form CMS-R-131 and when it's used
- [CMS: NCCI edits](https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits), PTP and MUE edits

**Compliance and enforcement**

- [HHS OIG: Compliance guidance](https://oig.hhs.gov/compliance/compliance-guidance/), the General Compliance Program Guidance and industry-specific guidance dates
- [28 CFR 85.5: Civil monetary penalty inflation adjustments](https://www.law.cornell.edu/cfr/text/28/85.5), False Claims Act per-claim penalties
- [DOJ: False Claims Act settlements and judgments exceed $6.8B in fiscal year 2025](https://www.justice.gov/opa/pr/false-claims-act-settlements-and-judgments-exceed-68b-fiscal-year-2025), recoveries, the health care share and qui tam filings
- [DOJ: Kaiser Permanente affiliates pay $556M](https://www.justice.gov/opa/pr/kaiser-permanente-affiliates-pay-556m-resolve-false-claims-act-allegations), the Medicare Advantage diagnosis addenda settlement
- [42 CFR 401.305: Reporting and returning overpayments](https://www.law.cornell.edu/cfr/text/42/401.305), "identified" defined by the False Claims Act's knowledge standard

**Anti-Kickback and Stark**

- [42 CFR 1001.952: Anti-Kickback Statute safe harbors](https://www.law.cornell.edu/cfr/text/42/1001.952), the EHR safe harbor's 15% cost share and the cybersecurity safe harbor
- [42 CFR 411.357: Stark exceptions](https://www.law.cornell.edu/cfr/text/42/411.357), the EHR and cybersecurity exceptions
