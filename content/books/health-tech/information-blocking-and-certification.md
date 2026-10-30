+++
title = "Cures Act, Information Blocking & Certification"
nav_title = "Information Blocking"
description = "Information blocking under the Cures Act: actors, EHI, the ten exceptions, penalties, ONC certification, HTI-1 through HTI-5 and USCDI, as of October 2026."
category = "Health Tech Industry"
order = 1915
part = "Rules of the Record"
tags = ["health-tech", "cures-act", "information-blocking", "onc", "certification", "uscdi"]
+++

HIPAA says when health information may be shared. The 21st Century Cures Act added a rule for when it **must** be: a provider, a certified EHR vendor or a health information network that interferes with the access, exchange or use of electronic health information, without fitting an exception, is information blocking. The rule turned years of "the EHR vendor won't give us an interface" and "the hospital releases results after the doctor calls" into a federal violation, with civil money penalties for vendors and networks and Medicare payment disincentives for providers.

The second half of this chapter is the machinery that gave the rule teeth: the ONC Health IT Certification Program. Certification is voluntary, but CMS programs require certified EHR technology, so nearly every EHR selling to physicians and hospitals is certified, and certification carries conditions: publish your APIs and their fees, don't restrict customers from talking about your product, test in the real world, attest twice a year that you don't block. The rules that set those conditions arrive as a numbered series (HTI-1 through HTI-5), and the series changed direction in 2025: HTI-5, finalized in October 2026, removed criteria rather than adding them.

Everything here is dated **as of October 2026**, because the regulator has proposed changes to the information blocking definitions and exceptions that are still pending.

## How the Platforms Do It

What certified EHR developers publish to meet the API condition, which requires public documentation, all terms and fees, and published service base URLs (as of October 2026):

| Developer | What its public developer pages say |
| --- | --- |
| **Epic** | "Epic is vendor-neutral, and no special relationship is required to develop or deploy an app"; patient-authorized apps have their own client ID options, and customer endpoints are listed for auto-distributed apps |
| **Oracle Health (Millennium)** | FHIR R4 and R4 Bulk Data APIs "in your SMART application," a page of R4 public endpoints for patients, a linked page on API access and fees for registering an app, and DSTU 2 retired: "Oracle no longer supports DSTU 2 FHIR APIs" |
| **Any certified developer** | The Certified Health IT Product List (CHPL) holds each certified product, its criteria, its real world testing plans and results, and its attestations; ONC's Conditions of Certification require a service base URL list published by December 31, 2024 |

The shape is the same for every certified EHR: a public FHIR endpoint per customer that a patient's app can reach without a business deal, a registration process for apps, and published fees for anything beyond patient access. FHIR and SMART on FHIR & App Platforms cover the APIs themselves. The dental, optometry, therapy and veterinary practice systems in Part 5 mostly sit outside certification, which matters below: the certification conditions don't bind them, but information blocking still binds the practices that use them.

## The Actors

Information blocking applies to three kinds of **actor** (45 CFR 171.102):

- **Health care providers,** broadly: every practice, hospital, lab and pharmacy.
- **Health IT developers of certified health IT:** a developer offering at least one module certified under the ONC program (a provider that builds health IT only for its own use is excluded).
- **Health information networks and exchanges (HINs/HIEs):** an entity that controls or administers the rules or agreements for exchange and enables more than two unaffiliated parties to exchange for treatment, payment or operations.

The knowledge standard differs by actor. For developers and HINs it's whether they **know or should know** a practice is likely to interfere; for providers it's whether they **know** the practice is unreasonable and likely to interfere. A practice's front desk policy of making patients wait for a doctor's review before releasing lab results is a provider practice; an EHR's per-connection fee that makes interfaces uneconomic is a developer practice.

What a patient engagement or PMS vendor needs to notice: **you may not be an actor, but your customer is.** A dental PMS that isn't certified isn't a "developer of certified health IT," yet the practice using it is a provider actor, and a contract that lets the vendor refuse a practice's request to export its own data puts the practice in a bad spot. A vendor that operates an exchange among unaffiliated practices can become a HIN by function, whatever its marketing says.

## What Counts as EHI

**Electronic health information** is electronic PHI that would be in a designated record set, excluding psychotherapy notes and information compiled for litigation (45 CFR 171.102). It isn't limited to a data standard: HTI-1 (January 9, 2024) removed the paragraph that had limited EHI to the USCDI data elements for the rule's first period, so today the scope is the whole designated record set, in whatever system holds it, including billing records and images.

A **practice** is anything an actor does or doesn't do that is likely to interfere with access, exchange or use: delays, fees, contract terms, technical choices, a policy of not enabling a feature the system has. Delayed release of results to the patient portal is the case providers met first; Labs, Imaging & Diagnostics covers immediate release.

## The Ten Exceptions

A practice that meets every condition of an exception isn't information blocking. As of October 2026, 45 CFR Part 171 has ten, in three subparts:

| Exception | Section | What it allows, briefly |
| --- | --- | --- |
| **Preventing harm** | 171.201 | Withholding to substantially reduce a risk of harm, determined individually by a licensed professional or arising from known or suspected erroneous data; under a written policy or a documented case-by-case decision |
| **Privacy** | 171.202 | Withholding where a privacy law precondition isn't met (a missing consent), at the patient's request, or as HIPAA access denials allow |
| **Security** | 171.203 | Practices that are directly related to safeguarding EHI, tailored to the risk, and consistent across requests |
| **Infeasibility** | 171.204 | Not fulfilling a request because of uncontrollable events, inability to segment restricted data, a third party's request to modify EHI, an exhausted manner exception, or documented infeasibility under the circumstances; written response within ten business days |
| **Health IT performance** | 171.205 | Temporary unavailability for maintenance or to stop a third-party app degrading the system |
| **Protecting care access** | 171.206 | Limiting EHI to reduce the risk of legal action over lawful reproductive health care, with patient protection and care access conditions (added December 2024) |
| **Manner** | 171.301 | Fulfilling in the requested manner, or in an alternative manner in a set order: certified technology, then published standards, then an agreed machine-readable format (renamed from "content and manner" by HTI-1) |
| **Fees** | 171.302 | Charging fees that are objective, reasonably related to costs and not based on competition, with listed prohibited fees |
| **Licensing** | 171.303 | Licensing interoperability elements on reasonable, non-discriminatory terms |
| **TEFCA manner** | 171.403 | Requiring that a request between TEFCA participants go through TEFCA (added by HTI-1) |

Three that a vendor's support and product teams meet weekly:

- **Infeasibility** is where "we can't build that interface" lives, and it has rules. The actor must have offered at least two alternative manners (one using certified technology or published standards) before claiming the manner exception is exhausted, can't weigh whether the request would reduce its fees or help a competitor, and must answer in writing within ten business days.
- **Manner** means the requestor's ask comes first. If the actor fulfills the request the way it was asked, fees and licenses don't need to meet the fee and licensing exceptions; if it can't, it walks the alternative order and the fee and licensing exceptions apply.
- **Privacy and preventing harm** cover what clinicians most want to withhold, and both require a documented basis: a policy applied consistently, or a decision recorded for the individual case.

### Pending Changes to the Exceptions

The HTI-5 proposed rule (December 29, 2025) proposed to bring automated and AI-driven access within "access" and "use," remove the infeasibility exception's third party modification condition, revise or remove its manner-exhausted condition, tighten the manner exception against contracts that aren't market rate or are contracts of adhesion, and remove the TEFCA manner exception and Subpart D entirely. The final rule published October 28, 2026 amended only Parts 170 and 172; HHS's announcement says the comments on the information blocking proposals "remain under consideration." **As of October 2026, all ten exceptions above are in force as written,** and the pending changes would narrow what actors can refuse, not widen it.

## Penalties and Enforcement

- **Developers, HINs and HIEs:** civil money penalties from the HHS Office of Inspector General of up to $1 million per violation, under OIG's final rule posted June 27, 2023. HHS's inflation adjustment of January 28, 2026 lists the per-violation amount at $1,327,209. OIG's stated priorities are conduct that caused or risked patient harm, significantly impacted a provider's ability to care for patients, was of long duration, caused financial loss to federal programs or others, or was done with actual knowledge.
- **Providers:** disincentives in CMS programs under the rule effective July 31, 2024. An eligible hospital found to have blocked isn't a meaningful EHR user and can't earn the three quarters of its annual market basket increase; a critical access hospital's payment drops from 101 to 100 percent of reasonable costs; a MIPS eligible clinician gets a zero in the Promoting Interoperability category; and an ACO, participant or supplier may be barred from the Shared Savings Program for at least a year. OIG investigates and refers; CMS applies the disincentive; Part 171 Subpart K provides for posting information about actors found to have blocked.
- **Certified developers** also risk their certification: not information blocking is itself a Condition of Certification, so a developer that blocks is out of conformance with the program as well as liable to OIG.

The enforcement posture hardened in 2025. On September 3, 2025, HHS announced a "crackdown" on health data blocking, with the Secretary directing more resources to it, and OIG and ONC issued a joint enforcement alert the same month. As of October 2026, OIG's information blocking page lists no resolved penalty case, so the first published OIG determination is still ahead. <!-- source-gap: info-blocking-nonconformity-letters | secondary | ONC letters of potential nonconformity sent to certified EHR developers in February 2026 over API performance and possible information blocking | closes with: an ONC or HHS announcement or CHPL nonconformity entries naming the action | checked: 2026-10-29 -->

## The Certification Program

ONC sets the criteria; **ONC-Authorized Certification Bodies** test and certify products; each certified product is listed on the **CHPL** with its criteria, version and status. A product is certified module by module (a "Health IT Module"), and CMS programs define which modules make up certified EHR technology. Certification stopped using year-themed editions with HTI-1: there is one set of "ONC Certification Criteria for Health IT," revised in place.

The **Conditions and Maintenance of Certification** are the ongoing obligations:

- **Information blocking:** don't.
- **Assurances:** comply with the criteria, don't inhibit customers' access to EHI, and certify to EHI export if you store EHI; keep records ten years.
- **Communications:** don't prohibit customers from discussing usability, interoperability, security, business practices or user experiences; tell customers annually that contract terms that do are unenforceable.
- **APIs:** publish APIs that give access "without special effort," complete public documentation, all terms and fees, permitted fees only, and service base URLs.
- **Real world testing:** annual plans and results on the CHPL.
- **Attestations:** every six months.
- **Insights:** report interoperability measures, phased in from July 2027 as HTI-1 wrote it; HTI-5 cut the measures back to the use of FHIR bulk data access.

### The HTI Rules

The "Health Data, Technology, and Interoperability" rules, in order:

| Rule | Published | What it did |
| --- | --- | --- |
| **HTI-1** | January 9, 2024 (effective February 8, 2024) | USCDI v3 as the baseline, with v1 expiring January 1, 2026; edition-less certification; the decision support interventions criterion with source attributes for predictive DSIs; the Insights Condition; SMART App Launch 2.0 and US Core 6.1.0; EHI's USCDI limit removed; new infeasibility conditions and the TEFCA manner exception |
| **HTI-2 (TEFCA)** | December 16, 2024 | TEFCA provisions in Part 172 and TEFCA definitions in Part 171 |
| **HTI-3 (Protecting Care Access)** | December 17, 2024 | The protecting care access exception |
| **HTI-4** | August 4, 2025, inside the FY 2026 hospital inpatient payment rule (effective October 1, 2025) | Updated electronic prescribing, a real-time prescription benefit criterion, and electronic prior authorization criteria (Prior Authorization covers the workflow) |
| **HTI-5** | Proposed December 29, 2025; final October 28, 2026 (effective December 28, 2026, some changes January 1, 2027) | Removed 14 of the 60 criteria in effect and revised seven (39 unchanged), against a proposal to remove 34; among them the security tags criteria (b)(7) and (b)(8) and the care plan criterion (b)(9); narrowed decision support interventions (b)(11) by removing its source attribute ("model card") and intervention risk management requirements; descoped real world testing; reduced Insights to the bulk FHIR measure; retained the privacy and security criteria in 170.315(d) and the implantable device list criterion it had proposed to remove; information blocking proposals still pending |

HTI-2's other proposals were partly withdrawn when HTI-5 was proposed. The agency itself changed names along the way: the HTI-5 proposal was issued by "ASTP/ONC" and the final rule by "ONC."

**Decision support transparency** is the clearest reversal. HTI-1 required certified EHRs supplying predictive decision support to expose source attributes (how a model was trained, validated and should be used) and gave users a way to see and modify them, plus intervention risk management practices for the developer; HTI-5 removed both the model card and the risk management requirements while keeping the decision support criterion itself. A vendor shipping AI inside a certified EHR now meets lighter federal certification duties, while state AI laws and FDA device rules may still apply ([Decision Support Transparency and Nondiscrimination](/books/health-tech/ai-in-health-tech#decision-support-transparency-and-nondiscrimination)).

### USCDI

The **United States Core Data for Interoperability** is the floor of data elements certified APIs and exports must support: patient demographics, problems, medications, allergies, labs, vital signs, notes, procedures, care team, insurance and more, versioned yearly. As of October 2026 ONC has published v1 through v6 (v5 on July 16, 2024 and v6 on July 24, 2025) and a v7 draft. HTI-1 made v3 the certification baseline from January 1, 2026; later versions reach products through the Standards Version Advancement Process, under which a developer may voluntarily certify to a newer approved version. A system that maps its records to US Core FHIR profiles is mapping to a USCDI version (the FHIR chapter owns the profiles).

## How to Build It

A practice platform needs information blocking records for two reasons: its customers are provider actors who must document why they withheld anything, and if it is certified or runs a network, it is an actor itself. The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) (`patients`, `documents`, `integrations`, `audit_events`):

```sql
CREATE TABLE ehi_requests (               -- every request to access, exchange or use EHI
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  actor_role        TEXT NOT NULL CHECK (actor_role IN ('provider', 'developer', 'hin')),
  requestor_kind    TEXT NOT NULL CHECK (requestor_kind IN ('patient', 'patient_app',
                      'provider', 'payer', 'hie', 'vendor', 'other')),
  requestor_name    TEXT NOT NULL,
  patient_id        UUID REFERENCES patients (id),       -- null for population or bulk requests
  integration_id    UUID REFERENCES integrations (id),   -- the connection used or asked for
  received_at       TIMESTAMPTZ NOT NULL,
  manner_requested  TEXT NOT NULL,       -- 'fhir_r4_us_core', 'ccda', 'bulk_fhir', 'csv', 'hl7v2_feed'
  scope             JSONB NOT NULL,      -- data classes, date range
  outcome           TEXT NOT NULL CHECK (outcome IN ('pending', 'fulfilled_as_requested',
                      'fulfilled_alternative', 'partially_fulfilled', 'not_fulfilled')),
  manner_provided   TEXT,
  fee_amount        BIGINT,             -- minor units; must satisfy 171.302 unless as requested
  fee_schedule_version TEXT,
  responded_at      TIMESTAMPTZ,
  written_response_due_at TIMESTAMPTZ   -- infeasibility: 10 business days from receipt
);

CREATE TABLE blocking_exception_determinations (  -- why anything was withheld or delayed
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  ehi_request_id    UUID REFERENCES ehi_requests (id),   -- null for standing practices
  exception         TEXT NOT NULL CHECK (exception IN ('preventing_harm', 'privacy', 'security',
                      'infeasibility', 'health_it_performance', 'protecting_care_access',
                      'manner', 'fees', 'licensing', 'tefca_manner')),
  condition         TEXT NOT NULL,      -- e.g. 'uncontrollable_events', 'segmentation',
                                        -- 'manner_exhausted', 'patient_request', 'individual_determination'
  basis             TEXT NOT NULL CHECK (basis IN ('organizational_policy', 'case_by_case')),
  policy_document_id UUID REFERENCES documents (id),  -- the written policy applied
  determined_by     UUID,                -- a licensed professional for individual harm determinations
  rationale         TEXT NOT NULL,
  alternatives_offered TEXT[],           -- the manners offered before claiming exhaustion
  written_response_communication_id UUID REFERENCES communications (id),
  rule_version      TEXT NOT NULL,       -- the Part 171 text in force, e.g. '2024-12-17'
  determined_at     TIMESTAMPTZ NOT NULL,
  valid_during      TSTZRANGE NOT NULL   -- harm holds and outages end
);

CREATE TABLE result_release_holds (       -- delayed release to the patient, each with its exception
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  document_id       UUID NOT NULL REFERENCES documents (id),   -- the result or note
  determination_id  UUID NOT NULL REFERENCES blocking_exception_determinations (id),
  held_at           TIMESTAMPTZ NOT NULL,
  released_at       TIMESTAMPTZ
);
```

Design decisions:

- **A hold without a determination can't exist.** The foreign key from `result_release_holds` to a determination is the rule in schema form: any delay in making a result or note available to the patient names the exception and condition it relies on, and the default is immediate release.
- **Policies are documents, decisions are rows.** Organization-wide practices (a security policy that blocks unregistered apps, a preventing harm policy for certain results) point at the written policy; individual decisions record who decided and why, and for individual harm determinations that person is a licensed professional.
- **Record the rule version.** The exceptions have changed with HTI-1 and HTI-3 and may change again with the pending HTI-5 provisions; a determination is judged against the text in force when it was made ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Fees and manners are data.** The fee schedule version and the manner requested and provided are what an investigator compares, and the manner exception turns on whether the request was fulfilled as asked.
- **Requests from apps are first-class.** A patient app's FHIR connection is an `ehi_requests` row the first time and an `integrations` row after; throttling it under the health IT performance exception is a determination with an end date, not a silent rate limit.

## Auditing

- **Every withheld or delayed release** with its exception, condition, basis, decider and dates.
- **Every refused or altered request,** with the manners offered, the written response and when it was sent.
- **Fee schedules by version,** and which version applied to each request.
- **For certified developers:** API documentation and fee pages as published on each date, real world testing plans and results, the semiannual attestations, and the annual customer notice under the communications condition.
- **Contract terms** that touch data export, interfaces or speech about the product, with their effective dates.

## What This Means for the System You Build

- **Default to release.** Results, notes and records go to the patient and their apps as soon as they exist, and any hold names its exception.
- **Know whether you're an actor,** and remember that your customers are: never build a product or contract that makes a practice the one blocking its own data.
- **Answer infeasible requests in writing within ten business days,** after offering alternative manners, and keep the record.
- **Publish your APIs, documentation and fees** if you're certified, and treat the CHPL listing, real world testing and attestations as product deliverables.
- **Track the rule text by date.** HTI-5's information blocking proposals were still pending in October 2026; the next final rule could narrow the exceptions your determinations rely on.
- **Map to USCDI versions explicitly,** v3 as the floor and newer versions as SVAP options.

## References

**Statute and regulations**

- [eCFR: 45 CFR Part 171, Information Blocking](https://www.ecfr.gov/current/title-45/subtitle-D/subchapter-D/part-171), the current subparts and the ten exceptions, disincentives and transparency subparts
- [LII: 45 CFR 171.102, Definitions](https://www.law.cornell.edu/cfr/text/45/171.102), actor, EHI and its exclusions, HIN/HIE, developer of certified health IT, access, exchange and use
- [LII: 45 CFR 171.201, Preventing harm exception](https://www.law.cornell.edu/cfr/text/45/171.201), reasonable belief, types of risk, licensed professional determination, policy or case-by-case
- [LII: 45 CFR 171.204, Infeasibility exception](https://www.law.cornell.edu/cfr/text/45/171.204), the five conditions and the ten business day written response
- [LII: 45 CFR 171.206, Protecting care access exception](https://www.law.cornell.edu/cfr/text/45/171.206), threshold, patient protection and care access conditions
- [LII: 45 CFR 171.301, Manner exception](https://www.law.cornell.edu/cfr/text/45/171.301), manner requested and the alternative manner order
- [Federal Register: HTI-1 final rule (January 9, 2024)](https://www.federalregister.gov/documents/2024/01/09/2023-28857/health-data-technology-and-interoperability-certification-program-updates-algorithm-transparency-and), USCDI v3, editions, DSI, Insights, API changes, EHI scope, TEFCA manner exception
- [Federal Register: HTI-2 TEFCA final rule (December 16, 2024)](https://www.federalregister.gov/documents/2024/12/16/2024-29163/health-data-technology-and-interoperability-trusted-exchange-framework-and-common-agreement-tefca), TEFCA provisions and definitions
- [Federal Register: Protecting Care Access final rule (December 17, 2024)](https://www.federalregister.gov/documents/2024/12/17/2024-29683/health-data-technology-and-interoperability-protecting-care-access), the protecting care access exception
- [Federal Register: Disincentives for health care providers that have committed information blocking (July 1, 2024)](https://www.federalregister.gov/documents/2024/07/01/2024-13793/21st-century-cures-act-establishment-of-disincentives-for-health-care-providers-that-have-committed), effective July 31, 2024, the hospital, CAH, MIPS and Shared Savings disincentives
- [Federal Register: HTI-5 proposed rule (December 29, 2025)](https://www.federalregister.gov/documents/2025/12/29/2025-23896/health-data-technology-and-interoperability-astponc-deregulatory-actions-to-unleash-prosperity), the 34 proposed removals and the Part 171 proposals, comments due February 27, 2026
- [Federal Register: HTI-5 final rule (October 28, 2026)](https://www.federalregister.gov/documents/2026/10/28/2026-21943/health-data-technology-and-interoperability-onc-deregulatory-actions-to-unleash-prosperity), effective December 28, 2026, 14 removals and 7 revisions, DSI model card removal, real world testing and Insights descoped, Parts 170 and 172 only
- [Federal Register: Annual civil monetary penalties inflation adjustment (January 28, 2026)](https://www.federalregister.gov/documents/2026/01/28/2026-01688/annual-civil-monetary-penalties-inflation-adjustment), the information blocking per-violation amount

**Agencies**

- [HHS: HHS finalizes HTI-5 deregulatory rule (October 26, 2026)](https://www.hhs.gov/press-room/hhs-finalizes-hti-5-deregulatory-rule.html), the information blocking proposals remaining under consideration
- [ONC: HTI-5 final rule overview](https://healthit.gov/resources/health-data-technology-and-interoperability-onc-deregulatory-actions-to-unleash-prosperity-hti-5-final-rule/), 14 removed, 7 revised and 39 retained criteria, real world testing and Insights reductions
- [ONC: HHS proposes HTI-5 (December 22, 2025)](https://healthit.gov/news/hti-5-press-release/), the proposal and the withdrawal of unfinalized HTI-2 proposals
- [HHS OIG: Information blocking](https://oig.hhs.gov/reports/featured/information-blocking/), up to $1 million per violation, the June 27, 2023 final rule, enforcement priorities, no resolved cases listed
- [ONC: HHS announces crackdown on health data blocking (September 3, 2025)](https://healthit.gov/news/hhs-announces-crackdown-on-health-data-blocking), more resources and active enforcement
- [ONC: Information blocking](https://healthit.gov/information-blocking/), actors and knowledge standards, the September 2025 enforcement alert
- [ONC: Conditions and Maintenance of Certification](https://healthit.gov/topic/certification-ehrs/conditions-maintenance-certification), the seven conditions, service base URLs by December 31, 2024, attestation cadence, Insights phase-in
- [ONC: HTI-4 final rule](https://healthit.gov/regulations/hti-rules/hti-4-final-rule/), e-prescribing, real-time prescription benefit and electronic prior authorization criteria
- [ONC: HTI rules](https://healthit.gov/regulations/), the HTI-1 through HTI-5 series
- [ONC: USCDI](https://isp.healthit.gov/united-states-core-data-interoperability-uscdi), versions 1 through 6 with v5 (July 16, 2024) and v6 (July 24, 2025), and the v7 draft
- [CHPL: Certified Health IT Product List](https://chpl.healthit.gov/), certified products and their listings

**In practice**

- [Epic: Interoperability guide (open.epic)](https://open.epic.com/Home/InteroperabilityGuide), vendor-neutral app development and patient-authorized apps
- [Oracle Health: Millennium Platform APIs](https://docs.oracle.com/en/industries/health/millennium-platform-apis/), FHIR R4 and Bulk Data, R4 public endpoints for patients, the API access and fees page, DSTU 2 retired
