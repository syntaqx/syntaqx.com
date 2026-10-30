+++
title = "Canada & the UK"
description = "Single-payer systems in software: provincial plans and OHIP billing, PHIPA and PIPEDA, Quebec's health law; NHS England, NHS login, DSPT, UK GDPR and Caldicott."
category = "Health Tech Industry"
order = 1958
part = "Beyond the US"
tags = ["health-tech", "canada", "uk", "nhs", "phipa", "uk-gdpr", "data-model"]
+++

Canada and the United Kingdom both pay for most care publicly, and both run it differently from each other and from the United States. In Canada each province and territory runs its own insurance plan under federal conditions, physicians bill the provincial plan by fee code, private insurance covers what the public plan doesn't (drugs, dental, vision, physiotherapy for many people), and privacy law is a mix of federal and provincial statutes with health-specific laws in several provinces. In the UK the NHS is a public service rather than an insurer: GP practices are contracted to it, hospitals are public trusts, national services hold the patient's identity and summary record, and a supplier selling software into it must pass national assurance and data protection rules before a practice can buy. For an American health tech company, both markets look familiar at the practice level and foreign at every layer above it.

This chapter covers each country's payer structure, the billing and identity infrastructure a vendor connects to, the privacy laws, and the assurance a supplier needs, with a data model that lets one platform hold a jurisdiction's rules as data. [The EU](/books/health-tech/eu-health-data), whose rules reach UK and Canadian vendors that serve EU patients, is [The EU](/books/health-tech/eu-health-data); the US payer structure these contrast with is [Payers & Plans](/books/health-tech/payers-and-plans). It extends `patient_identifiers` and `claims` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from public pages:

| System or vendor | Country | What its public pages say |
| --- | --- | --- |
| **OHIP** (Ontario Ministry of Health) | Canada | Publishes the Schedule of Benefits and machine-readable fee schedule master files "formatted for billing software"; a Health Card Validation web service |
| **Accuro** (QHR Technologies, Loblaw) | Canada | "25,000+ Providers across Canada use Accuro," 70,000+ users |
| **OSCAR Pro** (WELLSTAR) | Canada | 2,000+ clinics and 10,000+ providers |
| **TELUS Health** | Canada | CHR, Med Access and PS Suite, all OntarioMD-certified EMR offerings |
| **TPP SystmOne** | UK | Clinical systems for "7,800 NHS organisations" and "61 million electronic health records stored on our database" |
| **Enlivio Health** (formerly EMIS) | UK | EMIS Web and EMIS-X; "used by 100,000 healthcare professionals across 10,000 organisations" |
| **NHS login** | UK | Identity for patient-facing services, "based on OpenID Connect (OIDC)," with P0, P5 and P9 verification levels |

Two patterns:

- **Certification gates the market.** In Ontario, an EMR must be OntarioMD-certified, "certified for deployment in either a local or centrally hosted configuration or both"; in England, GP clinical systems and patient-facing apps pass national assurance before an NHS organisation can buy or connect them. Selling into either is a compliance project before it is a sales project.
- **National infrastructure is the integration.** A Canadian billing system integrates with each province's claims and eligibility services; a UK product integrates with national identity and record services rather than with each practice's system.

## Canada: Provincial Plans

The Canada Health Act sets the federal conditions: a province receives its full cash contribution only if its plan meets five criteria "throughout the fiscal year" (public administration, comprehensiveness, universality, portability and accessibility), and the plan must be "administered and operated on a non-profit basis by a public authority" (sections 7 and 8). Each province runs its own plan: British Columbia's Medical Services Plan "covers the cost of medically-necessary insured doctor services," administered by Health Insurance BC for the ministry; Ontario's is OHIP; Quebec's is administered by RAMQ.

**Billing a provincial plan.** A physician in Ontario bills OHIP by fee code from the Schedule of Benefits, which sets "the fees and requirements for payment for insured services under OHIP." The ministry publishes machine-readable master files with record layouts, and the physician fee schedule master in force is effective October 1, 2026 (dental and lab schedules have their own dates), with the warning that "If your billing software has not been updated by your vendor, you are encouraged to do so at your earliest convenience." Claims are submitted electronically to the ministry under each physician's billing number: "All claims must be submitted through medical claims electronic data transfer (MCEDT)" (Regulation 552 under the Health Insurance Act, section 38.3), either through a web page for low-volume manual uploads, which "is not intended for use with automated programs or scripts," or through a web service that billing software integrates with. Claims are due within three months of the date of service (later ones are "stale dated"), "Submissions received by the 18th of the month will typically be processed for approval the following month," a Batch Edit Report accepts or rejects each batch within about 24 hours, and an Error Report within about 48 hours lists rejected claims, which drop out of the payment stream until corrected and resubmitted. A billing engine for Ontario therefore models batches, the monthly cycle and the reject-resubmit loop, not single claims.

**Eligibility.** Before billing, a clinic validates the patient's health card number and version code. Ontario's Health Card Validation web service "allows the provider up to five attempts to validate an individual health card number and version code," after which it returns response code 91 and blocks web validation for that number until the next day (Bulletin 241002, October 2024). Software should validate once per visit, cache the result with its timestamp, and never loop.

**Fee codes encode policy.** Ontario's virtual care framework, effective December 1, 2022, distinguishes comprehensive virtual care, where an "Existing/Ongoing Patient-Physician Relationship exists" (for example an insured in-person service in the prior 24 months or primary care enrolment), from limited virtual care where none exists, with codes A101A (video) and A102A (telephone) for limited care and modality indicators K300A and K301A; the billing brief's examples pay a comprehensive telephone service at 85% of the in-person rate. A billing engine needs the patient-physician relationship as data to choose the code.

**Private payers.** Supplementary benefits (drugs, dental, vision, paramedical services) are paid by private insurers and employer plans, often through electronic claims at the point of service; for a dental, physiotherapy or optometry PMS in Canada, private insurer claims are the US-like part of the business.

## Canada: Privacy Law

- **PIPEDA** covers "the collection, use and disclosure of personal information in the course of commercial activities," and still applies within provinces with their own laws to information "transferred across borders," to federal works and in the territories; the Privacy Commissioner says "Determining which law applies must be done on a case-by-case basis."
- **Provincial health laws deemed substantially similar** to PIPEDA for health information: New Brunswick, Newfoundland and Labrador, Nova Scotia and Ontario's PHIPA; "These laws apply to personal health information within their respective provinces." Alberta, British Columbia and Quebec have general private-sector laws deemed substantially similar.
- **Ontario's PHIPA** regulates health information custodians (physicians, hospitals, pharmacies and others who hold personal health information) and their agents, a person who "with the authorization of the custodian, acts for or on behalf of the custodian" (section 2). Software vendors have defined roles: anyone who provides goods or services enabling a custodian "to use electronic means to collect, use, modify, disclose, retain or dispose of personal health information" must meet prescribed requirements (section 10(4)), and a health information network provider, one serving two or more custodians "primarily to custodians to enable the custodians to use electronic means to disclose personal health information to one another," carries further duties (O. Reg. 329/04, section 6). A custodian receiving information for care may assume implied consent "unless the custodian that receives the information is aware that the individual has expressly withheld or withdrawn the consent" (section 20(2)); "circle of care" and "lockbox" are the common names for that implied consent and that withholding. A custodian must notify the individual of theft, loss or unauthorized use or disclosure and, where prescribed, the Information and Privacy Commissioner (section 12(2) and (3)). Since January 1, 2024 (O. Reg. 343/23) the Commissioner can order administrative penalties under section 61.1, capped for any number of contraventions at $50,000 for a natural person and $500,000 for anyone else, plus any economic benefit gained (O. Reg. 329/04, section 35).
- **Quebec** passed Bill 3, the Act respecting health and social services information, assented April 4, 2023 (S.Q. 2023, chapter 5). The consolidated Act (CQLR c. R-22.1) lets the Minister require by regulation that bodies acquire or use only a certified "technological product or service" (equipment, applications or services that collect, keep, use or communicate information), with certification criteria covering personal information protection, security, functionality and interoperability (section 92); a body may not then use a non-certified one (section 93), and a supplier of a certified product must keep the body compliant with the prescribed criteria (section 94). A body offering a technological product with privacy settings must set them to "the highest level of confidentiality by default" (section 104). Law-firm commentary dates most provisions from July 1, 2024 and describes privacy impact assessments before communicating information outside Quebec or acquiring systems, and logging of access, for health and social services bodies. <!-- source-gap: quebec-bill-3-text | secondary | in-force date (July 1, 2024) and the access-logging and impact-assessment obligations of Quebec's Act respecting health and social services information | closes with: the Act's commencement provision (S.Q. 2023, c. 5, final section) or a government in-force notice, and the logging sections, opened (the consolidated text on LégisQuébec was read for ss. 92 to 94 and 104) | checked: 2026-10-29 -->
- **Federal reform stalled.** Bill C-27, the Digital Charter Implementation Act, never got past committee before the session ended on January 6, 2025. Bill C-72, the Connected Care for Canadians Act, "An Act respecting the interoperability of health information technology," including a ban on health IT vendors blocking data, was at second reading when the same session ended. Neither is law as of October 2026.

**Data residency.** Residency rules are mostly public-sector. British Columbia's 2021 FIPPA amendments "removed the requirement to maintain data residency in Canada" for public bodies, replacing it with rules on disclosure outside Canada; Nova Scotia's PIIDPA still requires public bodies and their service providers to keep personal information in Canada, accessed and disclosed only in Canada, unless the head of the body allows otherwise and reports it. Hospitals and health authorities write residency into contracts even where the law doesn't, so Canadian-hosted infrastructure is a sales requirement more often than a legal one ([Sovereign Cloud](/books/hosting-and-cloud/compliance-programs#sovereign-cloud)).

**E-prescribing.** Canada Health Infoway's national e-prescribing service, PrescribeIT, was scheduled to close on May 29, 2026, after reaching fewer than 5% of prescriptions, according to trade press reporting of Infoway's announcement; Infoway said the national e-prescribing standard would continue. <!-- source-gap: prescribeit-closure | secondary | PrescribeIT wind-down on May 29, 2026 and adoption below 5% | closes with: Infoway's or PrescribeIT's own closure announcement, opened (Infoway's announcements list for 2025 and 2026 has no closure notice; prescribeit.ca now only links the national standard) | checked: 2026-10-29 --> Infoway's own pages, as of October 2026, show the aftermath: prescribeit.ca points only to the national ePrescribing standard through a standards working group, and on July 17, 2026 Infoway announced an agreement with Santé Québec under which Québec maintains existing services and continues Prescription Québec, "Built on the digital prescribing infrastructure established through the PrescribeIT® platform," while Infoway supports e-prescribing elsewhere "through the national open standards model."

## UK: How the NHS Is Organised

NHS England, the arm's-length body that commissions and runs much of the national digital infrastructure, is being abolished, with its functions moving into the Department of Health and Social Care; the government's May 2026 Health Bill fact sheet describes DHSC's oversight "once NHS England has been abolished," and HMRC guidance of October 2026 says it will be abolished in 2027. Scotland, Wales and Northern Ireland run their own NHS bodies and systems. GP practices are independent contractors to the NHS, using a GP clinical system from an assured supplier, such as TPP SystmOne or Enlivio Health's EMIS Web, and hospitals are NHS trusts with their own EPRs.

National services sit above the practices: the Personal Demographics Service, holding the NHS number and demographics for everyone registered; the Spine, the messaging and record infrastructure linking national services; the Electronic Prescription Service; the Summary Care Record; GP Connect, giving other care settings access to GP records and appointments; and the NHS App and NHS login for patients. <!-- source-gap: nhs-digital-services | missing | NHS number and PDS, Spine, EPS, Summary Care Record, GP Connect capabilities, DTAC version, DCB0129 and DCB0160, the National Data Opt-out | closes with: NHS England digital service pages (digital.nhs.uk returned 403 to fetchers and a bot-verification page in a browser; england.nhs.uk rendered empty to fetchers; the GP Connect GitHub Pages site is retired) | checked: 2026-10-29 -->

**NHS login.** NHS login is "a way for people to prove who they are online," built on OpenID Connect. Its identity verification levels are P0 (verified email and mobile number), P5 (details checked against a record on PDS) and P9 (identity verification including "a physical comparison of their photographic ID"), combined with authentication components into vectors of trust such as P9.Cp.Cd (password plus a registered device); a service requests the vectors it needs, and the default is P9. An app that shows GP records needs P9; one that books a non-clinical service may accept P5.

## UK: Data Protection and Confidentiality

- **UK GDPR and the Data Protection Act 2018.** Health data is special category data. The DPA 2018 condition for health and social care processing is met "if the processing is necessary for health or social care purposes" (preventive or occupational medicine, working capacity, diagnosis, care or treatment, social care, and managing systems) (Schedule 1, paragraph 2), with the secrecy safeguard satisfied when processing is done "by or under the responsibility of a health professional or a social work professional, or ... by another person who in the circumstances owes a duty of confidentiality under an enactment or rule of law" (section 11). The playbook's [Lawful Bases](/docs/compliance/gdpr#lawful-bases) covers Article 6; health processing needs both.
- **The Data (Use and Access) Act 2025** (2025 c. 18, Royal Assent June 19, 2025) amends data protection law and, in section 121 and Schedule 15, makes provision about information standards for health and adult social care in England "and information technology"; section 121 commenced on February 5, 2026. Schedule 15 amends the Health and Social Care Act 2012 so information standards can apply to "relevant IT providers" (anyone marketing, supplying or making available IT or IT services used for health or adult social care in England, paid or free) and can cover design, quality, capabilities, functionality, connectivity, interoperability, portability and security, and the contracts under which technology is supplied (new section 250A). The Secretary of State can give a provider a notice requiring compliance and evidence of it within at least 28 days (section 251ZB), publish a statement that a provider is not complying (section 251ZC), and set up an accreditation scheme for health and care IT by regulations (section 251ZE); the schedule has no monetary penalties. For a supplier, published information standards become product requirements.
- **The common law duty of confidentiality and Caldicott.** Confidentiality in the NHS rests on common law as well as statute, and the National Data Guardian's eight Caldicott Principles (December 8, 2020) guide every use: justify the purpose, use confidential information only when necessary, use the minimum necessary, need-to-know access, everyone aware of their responsibilities, comply with the law, "The duty to share information for individual care is as important as the duty to protect patient confidentiality," and inform patients and service users how their information is used.

## UK: Supplier Assurance

- **DSPT.** The Data Security and Protection Toolkit is an "online self-assessment tool" against the National Data Guardian's 10 data security standards, and "All organisations that have access to NHS patient data and systems must use this toolkit," suppliers included; the toolkit's site now publishes CAF-aligned (Cyber Assessment Framework) audit guidance.
- **DTAC and clinical safety.** NHS buyers assess digital health technologies against the Digital Technology Assessment Criteria (clinical safety, data protection, technical security, interoperability, usability and accessibility), and clinical risk management standards require manufacturers and deploying organisations to run a clinical safety process with a named clinical safety officer, hazard log and safety case (see the source gap above).
- **Medical devices.** Software that is a medical device must be registered with the MHRA "before they can be placed on the market in Great Britain," through the Device Online Registration System, and a manufacturer outside the UK "must appoint a single UK Responsible Person"; CE-marked devices continue to be accepted in Great Britain for defined periods. Since May 28, 2026, devices for Northern Ireland register on the EU's EUDAMED instead of with the MHRA (custom-made devices excepted). New post-market surveillance requirements (SI 2024/1368, made December 16, 2024) came into force six months after they were made.

## How to Build It

A platform serving several countries needs the jurisdiction to be data: identifiers, payer programs, consent model, breach rules, residency and assurance status per country and province. The core `patient_identifiers` (an OHIP number with version code, an NHS number) and `claims` (a claim to a provincial plan) are reused; this chapter adds jurisdiction profiles and provincial claims:

```sql
CREATE TABLE jurisdiction_profiles (     -- the rules a tenant operates under, per country and subdivision
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  country            CHAR(2) NOT NULL,       -- 'CA', 'GB', 'US'
  subdivision        TEXT,                   -- ISO 3166-2: 'CA-ON', 'CA-QC', 'GB-ENG'
  privacy_regime     TEXT NOT NULL,          -- 'PHIPA', 'PIPEDA', 'QC_HEALTH_INFO', 'UK_GDPR'
  consent_model      TEXT NOT NULL CHECK (consent_model IN ('implied_circle_of_care',
                       'express', 'tpo_permitted', 'lawful_basis')),
  breach_notify      JSONB NOT NULL,         -- who must be told, and when, with citations
  residency          TEXT NOT NULL CHECK (residency IN ('in_country', 'in_province',
                       'contractual', 'none')),
  patient_id_kind    TEXT,                   -- 'ohip', 'ramq', 'nhs_number'
  public_payer_org_id UUID REFERENCES organizations (id),  -- OHIP, MSP, RAMQ
  assurance          JSONB NOT NULL DEFAULT '{}',  -- {"ontariomd": "certified", "dspt": "2025-26 standards met"}
  valid_during       DATERANGE NOT NULL,
  EXCLUDE USING GIST (country WITH =, subdivision WITH =, valid_during WITH &&)
);

ALTER TABLE patient_identifiers
  ADD COLUMN version_code     TEXT,          -- Ontario health card version
  ADD COLUMN validated_at     TIMESTAMPTZ,   -- last HCV or PDS check
  ADD COLUMN validation_result TEXT;         -- e.g. HCV response code, PDS trace outcome

CREATE TABLE provincial_claims (         -- a claim to a provincial plan, beside the core claim
  claim_id          UUID PRIMARY KEY REFERENCES claims (id),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  jurisdiction_id   UUID NOT NULL REFERENCES jurisdiction_profiles (id),
  billing_number    TEXT NOT NULL,          -- the physician's provincial billing number
  fee_code          TEXT NOT NULL,          -- 'A101A'
  modality_code     TEXT,                   -- 'K300A' video, 'K301A' telephone
  relationship_basis TEXT,                  -- why comprehensive virtual care applied
  fee_schedule_version TEXT NOT NULL,       -- the master file in force on the service date
  batch_ref         TEXT,                   -- the submission batch
  remittance_ref    TEXT,                   -- the province's remittance advice
  status            TEXT NOT NULL CHECK (status IN ('ready', 'submitted', 'accepted',
                      'rejected', 'paid', 'adjusted'))
);
```

Design notes:

- **Jurisdiction is configuration with dates.** Consent model, breach clocks, residency and assurance are rows keyed by country and subdivision with effective ranges, so a new province is data, not a branch ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). Tenants carry their jurisdiction through their locations' `country` and `subdivision`.
- **The fee schedule is versioned reference data.** Provincial fee masters change several times a year; each claim records the version it was priced under.
- **Validate identity against the national service, sparingly.** Health card validation and PDS lookups are rate-limited and audited; cache results with their time and result code, and never retry in a loop.
- **Residency is enforced in placement.** A tenant whose profile says `in_province` gets storage, backups, logs and support access pinned accordingly, which is an infrastructure property, not an application check.
- **US assumptions are not defaults.** HIPAA's treatment, payment and operations permission doesn't exist in PHIPA or UK GDPR; code paths that disclose by default for "TPO" must resolve the jurisdiction's consent model first.

## Auditing

- **Every identity validation call** with the result code and who triggered it.
- **Claims with the fee schedule version and the relationship basis** for virtual care codes, because provincial audits recover payments billed under the wrong code.
- **Access to health information** by staff and vendors, with the lockbox or express instructions that applied ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Assurance evidence:** DSPT submissions, DTAC and clinical safety documents, OntarioMD certification and MHRA registration, each with its date and version.
- **Breach notifications** made under each jurisdiction's rule.

## What This Means for the System You Build

- **Model jurisdictions as effective-dated profiles** covering privacy regime, consent model, breach clocks, residency, identifiers and assurance.
- **Bill provincial plans from versioned fee masters,** with the patient-physician relationship stored where codes depend on it.
- **Validate health cards and NHS identities through the national services** within their limits, caching results.
- **Don't import HIPAA defaults:** treatment-based disclosure, consent and breach rules differ by province and in the UK.
- **Plan certification and assurance** (OntarioMD, DSPT, DTAC, clinical safety, MHRA registration) as product work with owners and renewal dates.
- **Pin data placement per tenant** where law or contract requires residency.
- **Watch the reforms:** NHS England's abolition, DUAA standards for suppliers, and any reintroduction of Canada's federal privacy and interoperability bills.

## References

**Canada**

- [Canada Health Act](https://laws-lois.justice.gc.ca/eng/acts/c-6/page-1.html), the five criteria and public administration
- [OPC: Provincial laws deemed substantially similar to PIPEDA](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/legislation-related-to-pipeda/provincial-legislation-deemed-substantially-similar-to-pipeda/), PIPEDA's scope, cross-border transfers, the substantially similar health and general laws
- [LEGISinfo: Bill C-27 (44-1)](https://www.parl.ca/legisinfo/en/bill/44-1/c-27), at committee when the session ended January 6, 2025
- [LEGISinfo: Bill C-72 (44-1)](https://www.parl.ca/legisinfo/en/bill/44-1/c-72), the Connected Care for Canadians Act at second reading
- [British Columbia: Medical Services Plan](https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp), coverage and administration by Health Insurance BC
- [Ontario: OHIP Schedule of Benefits and Fees](https://www.ontario.ca/page/ohip-schedule-benefits-and-fees), the schedules, master files for billing software, effective dates
- [Ontario: Claims submission, resources for physicians](https://www.ontario.ca/document/resources-for-physicians/claims-submission), MCEDT required under Regulation 552 s. 38.3, web page and web service, three-month window, the 18th-of-month cycle, Batch Edit and Error Reports
- [Ontario: Bulletin 241002, Health Card Validation technical update](https://www.ontario.ca/document/ohip-infobulletins-2024/bulletin-241002-update-health-card-validation-technical), five attempts, response code 91
- [Ontario: Virtual Care 1 billing brief](https://www.ontario.ca/document/education-and-prevention-committee-billing-briefs/virtual-care-1-comprehensive-and-limited), comprehensive and limited virtual care, codes and modality indicators, December 1, 2022
- [Ontario e-Laws: Personal Health Information Protection Act, 2004](https://www.ontario.ca/laws/statute/04p03), agents (s. 2), electronic service providers (s. 10(4)), breach notice (s. 12), implied consent and express withholding (s. 20(2)), administrative penalties (s. 61.1)
- [Ontario e-Laws: O. Reg. 329/04](https://www.ontario.ca/laws/regulation/040329), health information network providers (s. 6), penalty caps of $50,000 and $500,000 (s. 35)
- [Ontario e-Laws: O. Reg. 343/23](https://www.ontario.ca/laws/regulation/r23343), the penalty amounts, in force January 1, 2024
- [National Assembly of Quebec: Bill 3](https://www.assnat.qc.ca/en/travaux-parlementaires/projets-loi/projet-loi-3-43-1.html), passage, assent April 4, 2023, S.Q. 2023 c. 5
- [LégisQuébec: Act respecting health and social services information (CQLR c. R-22.1)](https://www.legisquebec.gouv.qc.ca/en/document/cs/R-22.1), technological products or services, certification (ss. 92 to 94), highest-confidentiality defaults (s. 104)
- [Blakes: Quebec's comprehensive health information privacy law comes into force](https://www.blakes.com/insights/quebec-s-comprehensive-health-information-privacy-law-comes-into-force/), July 1, 2024 and the bodies' obligations (secondary)
- [UBC Privacy Matters: Bill 22](https://privacymatters.ubc.ca/bill22), BC FIPPA's removal of data residency in 2021
- [Nova Scotia: PIIDPA questions and answers](https://novascotia.ca/just/iap/piidpaquest.asp), in-Canada storage and access for public bodies and exceptions
- [Canadian Healthcare Technology: Infoway pulls the plug on PrescribeIT (February 18, 2026)](https://www.canhealth.com/2026/02/18/infoway-pulls-the-plug-on-prescribeit/), the May 29 closure and adoption below 5% (secondary)
- [Canada Health Infoway: Welcomes the Government of Québec's continued commitment to ePrescribing (July 17, 2026)](https://www.infoway-inforoute.ca/en/news-events/announcements/news/2026-announcements/canada-health-infoway-welcomes-the-government-of-quebecs-continued-commitment-to-eprescribing-in-the-province), Prescription Québec on PrescribeIT infrastructure, the national open standards model
- [PrescribeIT](https://prescribeit.ca/), access to the national ePrescribing standard through the standards working group
- [OntarioMD: Certified EMRs](https://www.ontariomd.ca/emr-certification/certified-emrs), certified offerings and hosting configurations
- [Accuro](https://corporate.accuroemr.com/), providers, users and ownership
- [OSCAR Pro](https://www.oscarpro.ca/), clinics and providers

**United Kingdom**

- [GOV.UK: Health Bill, oversight of the health system fact sheet (May 19, 2026)](https://www.gov.uk/government/publications/health-bill-oversight-of-the-health-system-fact-sheet), DHSC oversight once NHS England is abolished
- [GOV.UK: VAT changes following the abolition of NHS England](https://www.gov.uk/government/publications/vat-changes-following-the-abolition-of-nhs-england), abolition in 2027, functions to DHSC
- [Data (Use and Access) Act 2025](https://www.legislation.gov.uk/ukpga/2025/18/contents), 2025 c. 18, Royal Assent June 19, 2025
- [Data (Use and Access) Act 2025, section 121](https://www.legislation.gov.uk/ukpga/2025/18/section/121), information standards for health and adult social care, commenced February 5, 2026
- [Data (Use and Access) Act 2025, Schedule 15](https://www.legislation.gov.uk/ukpga/2025/18/schedule/15), IT providers under information standards, compliance notices, public censure, accreditation, in force February 5, 2026 (SI 2026/82)
- [Data Protection Act 2018, Schedule 1](https://www.legislation.gov.uk/ukpga/2018/12/schedule/1), the health or social care purposes condition
- [Data Protection Act 2018, section 11](https://www.legislation.gov.uk/ukpga/2018/12/section/11), the professional secrecy safeguard
- [GOV.UK: The Caldicott Principles (December 8, 2020)](https://www.gov.uk/government/publications/the-caldicott-principles), the eight principles
- [NHS login: Vectors of trust](https://nhsconnect.github.io/nhslogin/vectors-of-trust/), P0, P5 and P9, authentication components, allowed vectors and the default
- [NHS login developer documentation](https://nhsconnect.github.io/nhslogin/), OpenID Connect and verification step-up
- [Data Security and Protection Toolkit](https://www.dsptoolkit.nhs.uk/), the self-assessment, who must use it, CAF-aligned audit guidance
- [GOV.UK: Register medical devices to place on the market](https://www.gov.uk/guidance/register-medical-devices-to-place-on-the-market), MHRA registration, UK Responsible Person, DORS, Northern Ireland and EUDAMED from May 28, 2026
- [The Medical Devices (Post-market Surveillance Requirements) Regulations 2024 (SI 2024/1368)](https://www.legislation.gov.uk/uksi/2024/1368/made), made December 16, 2024, in force six months later
- [TPP](https://tpp-uk.com/), SystmOne, NHS organisations and records
- [Enlivio Health](https://www.enliviohealth.com/), formerly EMIS, products and reach
