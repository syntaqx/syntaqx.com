+++
title = "Selling Software into Health Care"
nav_title = "Selling into Health Care"
description = "What a vendor needs to sell into health care: business associate status, BAAs and their chains, HITRUST and SOC 2, reviews, state laws and the FTC breach rule."
category = "Health Tech Industry"
order = 1905
part = "The Business"
tags = ["health-tech", "hipaa", "baa", "hitrust", "compliance"]
+++

A health care customer buys the software last. Before a dental group signs, its compliance officer wants a business associate agreement; before a health system signs, its security team sends a questionnaire of several hundred questions, asks for a SOC 2 Type 2 report or a HITRUST certification, and checks the vendor's cyber insurance; before a payer signs, its procurement team wants all of that and a right to audit. A consumer health app with no provider customers skips HIPAA and lands under the FTC's Health Breach Notification Rule and a growing set of state consumer health data laws instead. None of it is the product, and all of it decides whether the product can be sold.

This chapter covers the vendor's side: when a vendor is a business associate, what its BAAs must say and how the chain runs, the assurance reports customers accept, security reviews and insurance, the state laws that stall deals, and the FTC rule for apps outside HIPAA. The playbook's [HIPAA](/docs/compliance/hipaa) covers the rules themselves and [SOC 2](/docs/compliance/soc-2) the report; HIPAA in Practice covers a practice's own obligations; the Hosting & Cloud volume's [Compliance Programs](/books/hosting-and-cloud/compliance-programs) covers the same assurances from an infrastructure provider's side.

## How the Platforms Do It

What health care customers ask a vendor for, and what each answers, as of October 2026:

| Ask | What it is | Who usually asks | What it proves |
| --- | --- | --- | --- |
| **BAA** | A contract required by HIPAA before a covered entity or business associate shares PHI with the vendor | Every covered entity and business associate customer | That the vendor has agreed to HIPAA's terms; nothing about whether it meets them |
| **SOC 2 Type 2** | An independent auditor's report on controls over a period ([Type 1 and Type 2](/docs/compliance/soc-2#type-1-and-type-2)) | Practices' groups, health systems, payers, other vendors | That stated controls operated over the period |
| **HITRUST e1, i1 or r2** | A certification against HITRUST's framework: e1 has 43 core controls and is valid for a year, i1 182 control requirements for a year, r2 a risk-based tailored assessment valid for two years with an interim review | Health systems and payers, especially for vendors with broad PHI access | That a defined control set was assessed by HITRUST's process |
| **ISO/IEC 27001** | A certified information security management system | International customers and some enterprises | That the management system was certified |
| **Security questionnaire** | The customer's own, or a standard one such as the CSA's CAIQ (v4.1, released January 2026) | Almost everyone above a small practice | The vendor's own answers, checked against the reports |
| **Cyber insurance certificate** | Evidence of a policy with stated limits | Health systems, payers, DSOs | That a breach has someone to pay for it |

There is no HIPAA certification ([There Is No HIPAA Certification](/docs/compliance/hipaa#there-is-no-hipaa-certification)), so the reports above are how customers judge a vendor's Security Rule compliance. A small practice signs a BAA and reads a trust page; an enterprise reads the reports and still sends the questionnaire.

## Being a Business Associate

HIPAA defines a business associate, "with respect to a covered entity," as a person who creates, receives, maintains or transmits protected health information on its behalf, or provides certain services involving it; the definition includes "a subcontractor that creates, receives, maintains, or transmits protected health information on behalf of the business associate" (45 CFR 160.103). A patient engagement platform reading a practice's PMS, a cloud PMS, a clearinghouse's downstream vendor, a transcription service and an AI scribe are business associates; so is their cloud host, their texting provider if messages identify patients, and their support tool if tickets contain PHI ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)).

Three points decide most vendor arguments:

- **Not seeing the data doesn't exempt you.** HHS's 2016 cloud computing guidance said a cloud service provider storing encrypted PHI is a business associate even without the key, and that a BAA is required even for "no-view services"; a cloud provider is not a mere conduit. <!-- source-gap: hhs-cloud-guidance | secondary | HHS OCR guidance on HIPAA and cloud computing (October 2016) | closes with: the HHS page, which refused automated fetching; cite it directly when it can be opened | checked: 2026-10-29 -->
- **Business associates are directly liable.** Since the 2013 omnibus rule, a business associate is liable on its own for Security Rule compliance, for notifying the covered entity of breaches, for impermissible uses and disclosures and for its subcontractor BAAs; HHS summarized the list in a 2019 fact sheet. <!-- source-gap: ba-direct-liability | secondary | HHS fact sheet on direct liability of business associates (May 2019) | closes with: the HHS fact sheet, which refused automated fetching | checked: 2026-10-29 -->
- **Payment processing is carved out.** Section 1179 exempts a financial institution's payment processing, so a processor authorizing and settling a card payment for a visit needs no BAA, but a product that shows procedure codes on a statement does ([HIPAA: When a Payments Provider Signs a BAA](/books/payments/payments-by-vertical#hipaa-when-a-payments-provider-signs-a-baa)).

A vendor whose customers include practices that aren't covered entities (a cash-only vet clinic, a wellness business) isn't a business associate to them, but the same software serves both. My rule, as for senior living operators ([Clinical Records and the HIPAA Boundary](/books/property-tech/senior-living#clinical-records-and-the-hipaa-boundary)): run every tenant as if a BAA applied, because the controls are the same and a customer can become covered by billing one claim electronically.

## What a BAA Must Say

The Privacy Rule lists what a BAA must contain (45 CFR 164.504(e)(2)), and the Security Rule adds its own terms (164.314(a)). A BAA must:

- Establish the permitted and required uses and disclosures of PHI, and bar any others.
- Require appropriate safeguards, including compliance with the Security Rule for electronic PHI.
- Require the vendor to report any use or disclosure not provided for by the contract, including breaches of unsecured PHI under 164.410, and "any security incident of which it becomes aware".
- Require the vendor to ensure its subcontractors agree to the same restrictions.
- Make PHI available for the patient's rights of access (164.524), amendment (164.526) and accounting of disclosures (164.528).
- Make the vendor's books and records available to HHS.
- At termination, return or destroy the PHI if feasible, and extend protections to anything kept.
- Let the covered entity terminate if the vendor violates a material term.

Everything else is negotiated, and the negotiation is where deals slow down: breach notice deadlines shorter than HIPAA's 60 days (health systems often ask for days, not weeks), indemnification and liability caps, cyber insurance minimums, offshore access restrictions, de-identification rights (whether the vendor may de-identify and use data for its own products), and audit rights. A vendor with its own BAA template, a list of positions it will and won't accept, and a clause-by-clause history of what each customer signed sells faster than one that negotiates from the customer's paper each time.

"Any security incident of which it becomes aware" is broad: read literally it includes every blocked port scan. BAAs commonly settle it with language that treats unsuccessful attempts as reported in aggregate and requires specific notice only for successful incidents; the vendor should know which version each customer signed.

## The BAA Chain

The chain runs downward: covered entity to vendor, vendor to each subcontractor that touches PHI, and on down. The vendor owes its customer a subcontractor BAA with every such subcontractor before PHI reaches it (164.308(b), 164.502(e)), and it must know which of its services those are. In practice that means an inventory of every system PHI can reach (databases, backups, the cloud provider's specific services, the texting and email providers, the error tracker and logs, the data warehouse, the support desk, the AI model provider, contractors with production access), each mapped to its BAA or to a control that keeps PHI out of it. Cloud providers sign BAAs only for listed services, so a new managed service is a compliance change, not just an architecture one.

Customers increasingly ask for the list. A subprocessor page (the services, their purpose, their location) and a commitment to notify before adding one is now a common enterprise ask in health care, borrowed from GDPR practice.

## Enforcement Against Business Associates

HHS OCR resolves HIPAA cases against business associates as well as covered entities, with settlements and corrective action plans: a hospital management company after a 2014 hack exposing six million people's data, a wellness vendor under OCR's risk analysis initiative in 2025, an accounting firm after a ransomware attack. The recurring finding is the same as for providers: no accurate, thorough risk analysis of where the vendor held electronic PHI. <!-- source-gap: ocr-ba-settlements | missing | OCR resolution agreements with business associates (CHSPSC 2020, Health Fitness Corporation 2025, BST & Co. CPAs 2025) with amounts | closes with: the HHS resolution agreements pages, which refused automated fetching | checked: 2026-10-29 --> HIPAA in Practice covers OCR's enforcement in depth.

## Reports and Certifications

A SOC 2 Type 2 report is the most common ask from practices' groups and other vendors; HITRUST is common from health systems and payers. HITRUST's tiers let a vendor start smaller: the e1 assessment covers 43 core controls and is valid for one year; the i1 covers 182 control requirements, also for a year, with a lighter year-two recertification; the r2 is risk-based and tailored to the vendor's environment, valid for two years with an interim assessment. A vendor whose cloud provider holds its own reports inherits physical and infrastructure controls from them, and its report names that provider as a subservice organization ([SOC 2 and ISO 27001 for a Provider](/books/hosting-and-cloud/compliance-programs#soc-2-and-iso-27001-for-a-provider)).

My default for a vendor selling to small and mid-size practices: a SOC 2 Type 2 first, mapped to the HIPAA Security Rule in the system description, because it serves the broadest set of customers; HITRUST when health systems or payers become a meaningful share of the pipeline and ask for it by name. Neither replaces the risk analysis the Security Rule requires, which the auditor will ask to see anyway.

## Security Reviews and Questionnaires

Enterprise health care customers review vendors before signing and periodically after. The review usually combines a questionnaire (the customer's own spreadsheet or a standard one such as the CSA's Consensus Assessments Initiative Questionnaire, whose v4.1 was released January 27, 2026 and maps yes/no questions to the Cloud Controls Matrix), the vendor's reports, a penetration test summary, architecture and data flow diagrams, and an interview. The Health Sector Coordinating Council publishes supply chain guidance for health care organizations doing these reviews (its Health Industry Cybersecurity Supply Chain Risk Management guide, version 2 in October 2023) and model contract language for medical device cybersecurity (MC2). Health systems buying apps that connect to their EHR add their own integration review on top (Hospitals & Health Systems).

What shortens reviews: a trust page with the reports behind a nondisclosure click-through, a prepared answer set kept current, a data flow diagram showing exactly which PHI fields the product reads and where they go, single sign-on and role-based access ready to configure, audit logs the customer can export, and a named security contact. What lengthens them: PHI in places the vendor didn't list, offshore support with production access, and a product that asks for more data from the EHR or PMS than its features need.

## Cyber Insurance

Health care customers ask vendors for cyber liability coverage with a stated minimum, and insurers in turn ask vendors (and practices) for controls before they'll write it: multi-factor authentication, endpoint detection, tested backups and patching are the common conditions in insurers' applications. HHS's 405(d) program publishes guides on cyber insurance for small and for medium and large health care organizations alongside its Health Industry Cybersecurity Practices (HICP), and HHS's voluntary Healthcare and Public Health Cybersecurity Performance Goals are aligned with HICP and CISA's goals. <!-- source-gap: cyber-insurance-requirements | missing | a public insurer or regulator source listing the controls cyber insurers require of health care organizations | closes with: an insurer's published underwriting requirements or the 405(d) cyber insurance guide's text | checked: 2026-10-29 --> After the Change Healthcare attack, health systems also ask vendors how they would keep a customer working during the vendor's own outage (Operations, Support & Downtime).

## State Health Privacy Laws as Sales Blockers

HIPAA doesn't preempt stricter state law, and a wave of state consumer health data laws reaches data that HIPAA doesn't cover: a consumer app, a wellness program, a marketing pixel on a practice's website, the parts of a vendor's data that aren't PHI.

- **Washington's My Health My Data Act** applies to consumer health data broadly, with consent requirements for collection and sharing; regulated entities had to comply with its core sections from March 31, 2024 (small businesses from June 30, 2024), its geofencing ban applied from July 23, 2023, and a violation is a per se violation of the state Consumer Protection Act, enforceable by the attorney general and through private actions.
- **Nevada's SB 370** took effect March 31, 2024, with similar consumer health data rules, enforced by the attorney general only.
- **Connecticut** added consumer health data to its consumer privacy law in 2023, requiring consent to process and sell it and restricting geofencing near health facilities. <!-- source-gap: ct-consumer-health-data | secondary | Connecticut Public Act 23-56 consumer health data provisions and their effective date (July 1 or October 1, 2023) | closes with: the CGA bill text or OLR summary, which the fetcher couldn't extract | checked: 2026-10-29 -->
- **New York's Health Information Privacy Act**, passed by the legislature in January 2025, was vetoed by the governor; a revised bill was introduced in 2026 and its status as of October 2026 is unresolved. <!-- source-gap: ny-hipa-status | status | New York HIPA veto date (December 2025) and the 2026 successor bill's status | closes with: the NY Senate bill page for the 2026 bill and the governor's veto memo | checked: 2026-10-29 -->

They block sales in two ways. A customer asks whether the vendor's product collects consumer health data outside HIPAA (a website chat widget, a booking page with tracking pixels, a marketing list) and the vendor can't answer; and a private right of action in Washington makes the customer's counsel cautious about any data the vendor shares with advertising platforms. State Health Privacy & Sensitive Data covers the laws in depth, including Part 2, reproductive health and minors' records.

## The FTC Health Breach Notification Rule

A health app or service that isn't a HIPAA covered entity or business associate answers to the FTC. The Health Breach Notification Rule (16 CFR Part 318) applies to vendors of personal health records ("an entity, other than a HIPAA-covered entity" that offers or maintains a personal health record drawing information from multiple sources) and to related entities and their service providers. The FTC finalized amendments on April 26, 2024, effective July 29, 2024, that confirmed the rule covers health apps and similar technologies, and that a "breach of security" includes an unauthorized disclosure, such as sharing data with an advertiser without authorization, not just a hack.

Its deadlines resemble HIPAA's: notice to individuals "without unreasonable delay and in no case later than 60 calendar days after the discovery"; notice to the FTC at the same time when 500 or more people are affected, and within 60 days after the end of the year otherwise; notice to prominent media when 500 or more residents of one state are affected; and a third-party service provider must notify its client. Violations carry civil penalties of up to $53,088 each as of October 2026.

The enforcement record is about advertising. GoodRx agreed on February 1, 2023 to a $1.5 million civil penalty in the FTC's first action under the rule, for sharing users' health information with advertising platforms; the ovulation-tracking app Premom's developer agreed in May 2023 to a $100,000 penalty under the rule (and $100,000 to three states) for sharing data with analytics and advertising firms through software development kits; and BetterHelp's 2023 order, finalized July 14, 2023, required $7.8 million for consumer refunds over sharing health data for advertising. For a vendor, the lesson is that third-party pixels and SDKs on any page or app that knows a person's health condition are a disclosure, under HIPAA or under the FTC rule, whichever applies (Digital Health Apps & Devices).

## How to Build It

A vendor's compliance posture is records too, and keeping them in the product's database (rather than in a folder of PDFs) lets sales, security and engineering answer the same questions from the same rows. It extends `organizations` (the customer, and each subcontractor as an organization with `kind = 'vendor'`) and `integrations`:

```sql
CREATE TABLE business_associate_agreements (  -- every BAA, in both directions
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  direction            TEXT NOT NULL CHECK (direction IN ('upstream', 'downstream')),
                                         -- upstream: with a customer; downstream: with a subcontractor
  counterparty_id      UUID NOT NULL REFERENCES organizations (id),
  template             TEXT NOT NULL CHECK (template IN ('ours', 'theirs')),
  version              TEXT NOT NULL,
  breach_notice_days   SMALLINT NOT NULL,  -- the contracted deadline, often shorter than 60
  incident_reporting   TEXT NOT NULL CHECK (incident_reporting IN ('successful_only',
                         'aggregate_unsuccessful', 'all')),
  deidentification_ok  BOOLEAN NOT NULL DEFAULT FALSE,
  offshore_access_ok   BOOLEAN NOT NULL DEFAULT FALSE,
  document_id          UUID NOT NULL REFERENCES documents (id),  -- the signed agreement
  valid_during         DATERANGE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('negotiating', 'signed', 'terminated'))
);

CREATE TABLE phi_systems (               -- every system PHI can reach, and why that's allowed
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,     -- 'primary database', 'SMS provider', 'error tracker'
  provider_id         UUID REFERENCES organizations (id),
  services            TEXT[] NOT NULL DEFAULT '{}',  -- the provider's specific services in use
  phi_fields          TEXT[] NOT NULL DEFAULT '{}',  -- what reaches it: names, phones, codes
  baa_id              UUID REFERENCES business_associate_agreements (id),
  control             TEXT,              -- if no BAA: how PHI is kept out (scrubbing, tokenization)
  data_region         TEXT,
  reviewed_on         DATE NOT NULL,
  CHECK (baa_id IS NOT NULL OR (control IS NOT NULL AND cardinality(phi_fields) = 0))
);

CREATE TABLE security_reviews (          -- each customer review, with what was sent
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),  -- the customer reviewing
  kind               TEXT NOT NULL CHECK (kind IN ('questionnaire', 'caiq', 'interview',
                       'integration_review', 'annual_reassessment')),
  questionnaire_document_id UUID REFERENCES documents (id),
  answers_document_id       UUID REFERENCES documents (id),
  findings           JSONB NOT NULL DEFAULT '[]',  -- [{"item": "...", "commitment": "...", "due": "..."}]
  opened_on          DATE NOT NULL,
  closed_on          DATE,
  outcome            TEXT CHECK (outcome IN ('approved', 'approved_with_conditions', 'rejected'))
);

CREATE TABLE assurance_reports (         -- reports and certificates the vendor can share
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('soc2_type1', 'soc2_type2', 'hitrust_e1',
                     'hitrust_i1', 'hitrust_r2', 'iso_27001', 'pen_test_summary',
                     'bridge_letter', 'insurance_certificate')),
  period           DATERANGE NOT NULL,   -- the audit period, or the policy term
  valid_until      DATE,                 -- certifications expire; report periods age
  scope            TEXT NOT NULL,        -- the products and environments covered
  document_id      UUID NOT NULL REFERENCES documents (id),
  shareable        TEXT NOT NULL CHECK (shareable IN ('public', 'nda', 'internal'))
);

-- Systems that hold PHI without a downstream BAA: must return no rows
SELECT name, phi_fields
FROM phi_systems
WHERE baa_id IS NULL AND cardinality(phi_fields) > 0;
```

- **The inventory is the BAA chain.** Every `phi_systems` row either points at a downstream BAA or states the control that keeps PHI out; the check above runs in CI against the inventory, and a new vendor or a new field fails it until someone decides.
- **Contract terms are data.** A breach notice deadline of five days for one customer and 60 for another must reach the incident runbook, so `breach_notice_days` is what incident response reads, not a clause someone remembers ([Breach notification](/docs/compliance/hipaa#the-three-rules) is the HIPAA floor).
- **Reports expire.** A SOC 2 period ages, a HITRUST certificate lapses, an insurance policy renews; `valid_until` drives the reminder and the bridge letter.
- **Documents as signed.** Agreements, questionnaires and answers are `documents` rows, kept as exchanged, because a commitment made in a security review is a contract term in practice.

## Auditing

- **Every BAA, upstream and down,** with its version, negotiated terms and signed copy, and the date PHI first flowed under it.
- **The PHI inventory's history,** so the vendor can show which systems held PHI on the date of an incident and under which agreement.
- **Every security review,** the answers given and the commitments made, with their due dates and completion.
- **Every report and certificate shared,** with whom and under which nondisclosure terms.

## What This Means for the System You Build

- **Assume you're a business associate** to any customer that bills health plans, and design every tenant to that standard.
- **Keep a PHI inventory that is the BAA chain,** checked automatically, and treat a new service as a compliance change.
- **Bring your own BAA template** and a record of what each customer negotiated, especially breach notice deadlines.
- **Get a SOC 2 Type 2 mapped to the Security Rule first,** and HITRUST when health systems and payers ask for it.
- **Prepare for security reviews** with a trust page, current answers, a data flow diagram and exportable audit logs.
- **Keep pixels and SDKs off anything health-related,** because the FTC and state laws treat that sharing as a breach or a violation.

## References

**Regulations**

- [45 CFR 160.103: Definitions](https://www.law.cornell.edu/cfr/text/45/160.103), business associate and subcontractor
- [45 CFR 164.502: Uses and disclosures](https://www.law.cornell.edu/cfr/text/45/164.502), disclosures to business associates and subcontractors on satisfactory assurance
- [45 CFR 164.504: Uses and disclosures, organizational requirements](https://www.law.cornell.edu/cfr/text/45/164.504), required BAA contents in 164.504(e)(2)
- [45 CFR 164.308: Administrative safeguards](https://www.law.cornell.edu/cfr/text/45/164.308), business associate contracts under the Security Rule
- [45 CFR 164.314: Organizational requirements](https://www.law.cornell.edu/cfr/text/45/164.314), reporting security incidents and subcontractor terms
- [16 CFR 318.2: Definitions (Health Breach Notification Rule)](https://www.law.cornell.edu/cfr/text/16/318.2), vendor of personal health records and related entities

**FTC**

- [FTC: Finalizes changes to the Health Breach Notification Rule](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule), April 26, 2024 amendments and notice deadlines
- [FTC: Health Breach Notification Rule, the basics for business](https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business), the July 29, 2024 effective date
- [FTC: Complying with the Health Breach Notification Rule](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0), FTC and media notice and the civil penalty amount
- [FTC: Enforcement action against GoodRx](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), the first HBNR action and $1.5 million penalty
- [FTC: Premom barred from sharing health data for advertising](https://www.ftc.gov/news-events/news/press-releases/2023/05/ovulation-tracking-app-premom-will-be-barred-sharing-health-data-advertising-under-proposed-ftc), the $100,000 HBNR penalty and SDK sharing
- [FTC: Final order banning BetterHelp from sharing health data for advertising](https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-gives-final-approval-order-banning-betterhelp-sharing-sensitive-health-data-advertising), $7.8 million for refunds

**States**

- [Washington Attorney General: Protecting Washingtonians' personal health data](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy), My Health My Data compliance dates and enforcement
- [Brownstein: Nevada's new consumer health data law explained](https://www.bhfs.com/insight/nevada-s-new-consumer-health-data-law-explained/), SB 370's effective date and attorney general enforcement
- [New York Senate: Statement on the veto of the Health Information Privacy Act](https://www.nysenate.gov/newsroom/press-releases/2025/liz-krueger/statement-senator-liz-krueger-and-assemblymember-linda), the governor's veto

**Assurance and guidance**

- [HITRUST: e1 assessment](https://hitrustalliance.net/assessments-and-certifications/e1), 43 core controls, valid for one year
- [HITRUST: i1 assessment](https://hitrustalliance.net/assessments-and-certifications/i1), 182 control requirements, valid for one year
- [HITRUST: r2 assessment](https://hitrustalliance.net/assessments-and-certifications/r2), risk-based and tailored, valid for two years
- [Cloud Security Alliance: CAIQ v4](https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4), the questionnaire and its January 2026 v4.1 release
- [Health Sector Coordinating Council: HIC-SCRiM v2](https://healthsectorcouncil.org/?p=4524), supply chain risk management for health care organizations
- [Health Sector Coordinating Council: Model contract language for medtech cybersecurity (MC2)](https://healthsectorcouncil.org/model-contract-language-for-medtech-cybersecurity-mc2/), provider and manufacturer contract terms
- [HHS 405(d): Cybersecurity resources](https://hhscyber.hhs.gov/), HICP, the cyber insurance guides and the HPH Cybersecurity Performance Goals

**Secondary**

- [Mintz: HHS publishes guidance on HIPAA and cloud computing](https://www.mintz.com/insights-center/viewpoints/2146/2016-10-19-hhs-publishes-guidance-hipaa-and-cloud-computing), encrypted storage without the key and no-view services
- [Bricker Graydon: HHS fact sheet on direct liability of business associates](https://www.bricker.com/insights/publications/HHS-publishes-fact-sheet-on-direct-liability-of-business-associates-under-HIPAA), the May 2019 fact sheet
