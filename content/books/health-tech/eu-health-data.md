+++
title = "The EU"
description = "Health software in the EU: GDPR Article 9, the European Health Data Space timeline, MDR software rules and EUDAMED, the AI Act for medical AI, and national rules."
category = "Health Tech Industry"
order = 1959
part = "Beyond the US"
tags = ["health-tech", "eu", "gdpr", "ehds", "mdr", "ai-act", "data-model"]
+++

The European Union regulates health software through several laws at once, and none of them is a health privacy law in the HIPAA sense. The GDPR treats health data as a special category whose processing is prohibited unless an exception applies, and lets each member state add conditions. The European Health Data Space regulation, in force since March 2025 and applying in waves from 2027 to 2035, gives patients rights over their electronic records, sets requirements for EHR systems themselves, and builds a regime for reusing health data for research and policy. The Medical Device Regulation decides when software is a medical device and what it must prove. The AI Act adds obligations for medical AI. And each member state keeps its own health system, reimbursement and hosting rules, so a vendor selling into Germany and France meets two more certification regimes. A US vendor with EU customers or EU patients meets all of it.

This chapter covers GDPR's health rules, the EHDS and its timeline, MDR and IVDR for software and EUDAMED, the AI Act's application to medical AI, adjacent EU laws (NIS2, the Data Act, transfers to the US), and two national regimes vendors meet early (Germany's DiGA and cloud rules, France's HDS hosting certification). The playbook's [GDPR](/docs/compliance/gdpr) covers the regulation generally; this chapter covers the health twist. Canada and the UK are [Canada & the UK](/books/health-tech/canada-and-uk). It extends `consents` and `audit_events` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

The EU's systems are public infrastructure more than vendors. As of October 2026, from Commission and national pages:

| System | Run by | What its public pages say |
| --- | --- | --- |
| **MyHealth@EU** | Member states with the Commission | ePrescription and eDispensation and Patient Summaries "currently being introduced in all EU countries"; images, lab results and discharge reports planned "in the long term" |
| **HealthData@EU** | EHDS infrastructure | Cross-border secondary use through health data access bodies; third countries may apply to join from March 2035 |
| **EUDAMED** | European Commission | Four modules mandatory from May 28, 2026: actor registration, UDI and device registration, notified bodies and certificates, market surveillance |
| **DiGA directory** | BfArM (Germany) | Reimbursable digital health applications, listed through a fast-track procedure under section 139e SGB V; DiGA Guide version 3.6 (December 10, 2025) |
| **C5 attestation** | BSI (Germany) | "minimum requirements for secure cloud computing," required for cloud processing of health data by German statutory health insurance actors under section 393 SGB V |
| **HDS certification** | ANS (France) | Certification for hosting health data, with a public list of certified hosts; référentiel version 2.1 planned for October 2026 |

Two patterns:

- **Certification is national, rights are European.** The EHDS harmonizes patient rights and EHR requirements across the EU, but reimbursement and hosting stay national: a German DiGA listing and a French HDS certificate are separate projects.
- **Every regime has a registry.** EUDAMED for devices, the DiGA directory, the HDS list, and under the EHDS, registries of EHR systems and health data access bodies; being listed is how a product proves its status.

## GDPR and Health Data

"Data concerning health" is "personal data related to the physical or mental health of a natural person, including the provision of health care services, which reveal information about his or her health status" (Article 4(15)); genetic and biometric data have their own definitions. Processing health data "shall be prohibited" (Article 9(1)) unless an exception in Article 9(2) applies. The two that health care relies on:

- **Article 9(2)(h):** processing "necessary for the purposes of preventive or occupational medicine, for the assessment of the working capacity of the employee, medical diagnosis, the provision of health or social care or treatment or the management of health or social care systems and services on the basis of Union or Member State law or pursuant to contract with a health professional," by or under the responsibility of a professional "subject to the obligation of professional secrecy" (Article 9(3)).
- **Article 9(2)(i):** "public interest in the area of public health," such as cross-border health threats or the safety of medicinal products and devices, with "suitable and specific measures ... in particular professional secrecy."

Explicit consent (Article 9(2)(a)) is the usual basis for consumer health apps and research outside a legal mandate. Every processing also needs an Article 6 lawful basis ([Lawful Bases](/docs/compliance/gdpr#lawful-bases)).

Three consequences for software:

- **Member states add rules.** "Member States may maintain or introduce further conditions, including limitations, with regard to the processing of genetic data, biometric data or data concerning health" (Article 9(4)). National health data laws, professional secrecy rules and hosting requirements are therefore per country, which is why the jurisdiction profile in [Canada & the UK](/books/health-tech/canada-and-uk#how-to-build-it) applies here too.
- **DPIAs are routine.** A data protection impact assessment is required for "processing on a large scale of special categories of data referred to in Article 9(1)" (Article 35(3)(b)); a health platform does one per product and updates it on change.
- **Controller and processor roles map loosely to HIPAA's.** A clinic is a controller; its software vendor is usually a processor under an Article 28 contract, the counterpart of a BAA ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). A vendor that uses customer data for its own purposes (training a model, benchmarking) becomes a controller for that use and needs its own basis.

## The European Health Data Space

The EHDS regulation (Regulation (EU) 2025/327) "was officially published in the Official Journal" on March 5, 2025 and entered into force on March 26, 2025. It does three things:

- **Primary use: patient rights.** Patients get "fast and free access" to their electronic health data and can see who accessed it; they can restrict access by health professionals to all or part of their data exchanged through EHDS infrastructure; and member states "may offer an opt-out option for the cross-border exchange." Priority categories are Patient Summaries, ePrescriptions and eDispensations, medical images, lab results and hospital discharge reports, exchanged across borders through MyHealth@EU.
- **EHR systems.** The regulation sets "a harmonised legal and technical framework for electronic health record (EHR) systems," with "strict security and interoperability criteria for EHR systems, requiring manufacturers to certify their compliance," under "a comprehensive pre- and post-market compliance framework." For a vendor, an EHR system sold in the EU becomes a regulated product with conformity documentation, much as a medical device is. <!-- source-gap: ehds-ehr-mechanics | missing | EHDS EHR system essential requirements, the European interoperability and logging components, EU declaration of conformity and marking, labelling of wellness apps, and Article 105 application dates per provision | closes with: the regulation's text on EUR-Lex (rendered empty to fetchers) or the Commission's EHDS Q&A PDF, opened | checked: 2026-10-29 -->
- **Secondary use.** Reuse for research, innovation and policy is allowed only for purposes the regulation lists, on "a permit issued by a health data access body," in secure processing environments from which no personal data may be downloaded, with pseudonymized data only where anonymized data won't do, re-identification forbidden, and use for decisions detrimental to individuals or for marketing prohibited. People can opt out of secondary use "in a simple and reversible way," though their data "may still be used for certain important public interest purposes" under safeguards.

**The timeline**, from the Commission's EHDS page as of October 2026:

| Date | What applies |
| --- | --- |
| March 26, 2025 | Entry into force |
| March 2027 | Deadline for the Commission to adopt key implementing acts |
| March 2029 | Key parts apply: primary-use exchange of Patient Summaries and ePrescriptions/eDispensations; secondary use for most data categories, such as EHR data |
| March 2031 | Primary use extends to medical images, lab results and discharge reports; secondary use to remaining categories, such as genomic data |
| March 2035 | Third countries and international organisations may apply to join HealthData@EU |

For a US vendor with EU customers, the planning horizon is 2029: an EHR product needs its conformity process, its export of priority categories in the European format, and its access-log view for patients ready by then, and data it holds will be requestable through health data access bodies.

## MDR and IVDR for Software

Software can be a medical device under the Medical Device Regulation (Regulation (EU) 2017/745) or an in vitro diagnostic device under the IVDR (Regulation (EU) 2017/746, applicable since May 26, 2022) when its intended purpose is medical: diagnosis, prevention, monitoring, prediction, prognosis or treatment. MDR's classification rule for software (Rule 11) puts software that informs diagnostic or therapeutic decisions into class IIa or higher, which needs a notified body, so most clinical decision software is not self-certified. <!-- source-gap: mdr-rule-11 | missing | MDR Annex VIII Rule 11 text and class thresholds; MDR transition deadlines under Regulation (EU) 2023/607 | closes with: the MDR text on EUR-Lex, opened (rendered empty) | checked: 2026-10-29 -->

Current guidance and infrastructure, as of October 2026:

- **MDCG 2019-11 rev.1** (June 2025), *Qualification and classification of software*, is the Commission-endorsed guidance for deciding whether software is a device and in which class, and **MDCG 2025-6** (June 2025) answers questions on the interplay between MDR/IVDR and the AI Act.
- **EUDAMED** became partly mandatory on May 28, 2026: actor registration, UDI and device registration, notified bodies and certificates, and market surveillance, after a Commission decision published November 27, 2025 started a six-month transition under Regulation (EU) 2024/1860; the clinical investigation and vigilance modules are not yet mandatory.
- **Notified body requirements** continue to be refined; an implementing regulation on conformity assessment requirements (Regulation (EU) 2026/977) was adopted in May 2026.

Wellness and administrative software (scheduling, billing, general fitness tracking) is generally not a device; the line, and the FDA's equivalent in the US, is Digital Health Apps & Devices.

## The AI Act and Medical AI

The AI Act (Regulation (EU) 2024/1689) entered into force on August 1, 2024; prohibitions and AI literacy obligations applied from February 2, 2025, general-purpose AI obligations from August 2, 2025, and general application from August 2, 2026. AI that is a medical device requiring third-party conformity assessment under MDR or IVDR is a high-risk system through the Act's product-safety annex.

The dates for high-risk systems moved. The AI omnibus, adopted by the Commission on November 19, 2025 and politically agreed on May 7, 2026, entered into force on July 27, 2026: high-risk rules for the Annex III use cases now apply from December 2, 2027, and for AI embedded in regulated products under Annex I (which includes medical devices) from August 2, 2028. A medical AI manufacturer therefore plans for one conformity assessment covering both MDR and the AI Act's high-risk requirements (risk management, data governance, logging, transparency, human oversight, accuracy and robustness) by August 2028, using MDCG 2025-6 for how they interact. Patient-facing chatbots that are not devices still owe transparency to users that they are talking to an AI; the playbook's [The Law, at a Pointer Level](/docs/architecture/ai-agents#the-law-at-a-pointer-level) summarizes. AI in Health Tech owns the cross-jurisdiction comparison.

## Adjacent EU Laws

- **NIS2.** "Member States had until 17 October 2024 to transpose the NIS2 Directive into national law"; health care, already covered under the first directive, is among its sectors, so hospitals and many health entities have national cybersecurity and incident reporting duties that flow to their suppliers through contracts.
- **The Data Act.** In force January 11, 2024 and applicable from September 12, 2025: access to data from connected products by design, sharing with third parties at the user's request, cloud switching between "providers of data-processing services," and limits on unfair data contract terms. A connected medical or wellness device sold in the EU must let users get their data.
- **Transfers to the US.** The EU-US Data Privacy Framework is the adequacy route for transfers to certified US companies; the General Court dismissed an action for its annulment in September 2025 (case T-553/23). Without certification, transfers rely on standard contractual clauses and transfer assessments ([International Transfers](/docs/compliance/gdpr#international-transfers)). Health customers often require EU hosting regardless ([Sovereign Cloud](/books/hosting-and-cloud/compliance-programs#sovereign-cloud)).

## National Regimes: Germany and France

**Germany.** Statutory health insurance bodies and providers may process social and health data "auch im Wege des Cloud-Computing-Dienstes" (also by cloud computing) only in Germany, an EU member state, an equivalent state or an adequate third country with a branch in Germany, and only with "ein aktuelles C5-Testat" covering the C5 basic criteria; a C5 Type 1 attestation sufficed until June 30, 2025, and from July 1, 2025 a current Type 2 attestation is required, with an 18-month Type 1 grace period for systems first marketed after that date (section 393 SGB V). The BSI's C5 catalogue specifies "minimum requirements for secure cloud computing." Digital health applications (DiGA) prescribable and reimbursed under statutory insurance are assessed by BfArM and listed in its directory through the fast-track procedure under section 139e SGB V, with rules on processing outside Germany. <!-- source-gap: diga-count | missing | the number of DiGA listed (permanent and provisional) as of October 2026 | closes with: the BfArM DiGA directory, readable without a browser | checked: 2026-10-29 -->

**France.** Hosting personal health data for others requires HDS (hébergeur de données de santé) certification, which "encadre leur hébergement et définit les exigences de sécurité applicables aux acteurs concernés" (governs that hosting and sets the security requirements), granted by accredited independent certifiers against a référentiel; the public list of certified hosts filters by référentiel V1.1 and V2.0, and a version 2.1 is planned for October 2026. A US vendor hosting French patients' data either certifies, or hosts on an HDS-certified provider and confirms its own role is covered. <!-- source-gap: hds-v2-dates | missing | publication date of HDS référentiel V2.0, its EEA-hosting requirement and the transition deadline for V1.1 certificates | closes with: the ANS HDS référentiel document or announcement, opened | checked: 2026-10-29 -->

## How to Build It

The core `consents` (with a `kind`) and `audit_events` (reads included) already carry most of what GDPR and the EHDS ask. This chapter adds a record of processing per purpose and a record of EHDS-style access requests, and points both at the core tables:

```sql
CREATE TABLE processing_records (        -- GDPR Article 30 record, one per purpose, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),  -- controller or processor tenant
  role               TEXT NOT NULL CHECK (role IN ('controller', 'processor',
                       'joint_controller')),
  purpose            TEXT NOT NULL,          -- 'provision_of_care', 'appointment_reminders',
                                             -- 'product_analytics', 'model_training'
  article6_basis     TEXT NOT NULL,          -- 'contract', 'legal_obligation', 'legitimate_interests'
  article9_condition TEXT CHECK (article9_condition IN ('explicit_consent', 'art9_2_h',
                       'art9_2_i', 'art9_2_j', 'none')),  -- 'none': no special category data
  national_basis     TEXT,                   -- the member state law relied on under 9(2)(h) or 9(4)
  data_categories    TEXT[] NOT NULL,
  recipients         TEXT[] NOT NULL,
  transfers          JSONB NOT NULL DEFAULT '[]',  -- destination, mechanism (DPF, SCCs), assessment ref
  retention          TEXT NOT NULL,
  dpia_document_id   UUID REFERENCES documents (id),
  valid_during       TSTZRANGE NOT NULL
);

ALTER TABLE consents
  ADD COLUMN processing_record_id UUID REFERENCES processing_records (id),  -- which purpose it covers
  ADD COLUMN ehds_scope           TEXT CHECK (ehds_scope IN ('restriction', 'cross_border_opt_out',
                                    'secondary_use_opt_out'));

CREATE TABLE ehds_access_requests (      -- a patient's or an access body's request against the record
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  requester_kind     TEXT NOT NULL CHECK (requester_kind IN ('patient', 'proxy',
                       'health_professional', 'health_data_access_body', 'myhealth_eu')),
  patient_id         UUID REFERENCES patients (id),       -- primary use
  permit_ref         TEXT,                                -- secondary use: the access body's permit
  kind               TEXT NOT NULL CHECK (kind IN ('access', 'export', 'access_log',
                       'restriction', 'rectification', 'secondary_use_extract')),
  categories         TEXT[] NOT NULL,     -- 'patient_summary', 'eprescription', 'lab_results'
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at             TIMESTAMPTZ NOT NULL,  -- computed from the applicable rule
  fulfilled_at       TIMESTAMPTZ,
  output_document_id UUID REFERENCES documents (id),
  pseudonymized      BOOLEAN               -- secondary use: never identifiable unless the permit says so
);
```

Design notes:

- **Purpose is the key.** Every use of health data maps to a `processing_records` row with its Article 6 basis, Article 9 condition and any national law; a new use (training a model on customer data) is a new row and a DPIA update before it ships.
- **Access logs are a patient-facing product.** The EHDS right to see who accessed one's data turns `audit_events` reads into something a patient can request; reads must be attributable to a person and a role, not a service account ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Restrictions are enforced at query time.** A patient's restriction on part of their record is a `consents` row that the authorization layer evaluates on every read, with the emergency override (where national law allows) logged ([Authorization](/docs/security/authorization)).
- **Secondary use is an extract, not access.** Requests from a health data access body produce a pseudonymized or anonymized dataset delivered to a secure processing environment under a permit; the platform never grants the body live access to tenant data.
- **Jurisdiction stays data.** Member state conditions, hosting rules (C5, HDS) and opt-out availability are rows in the jurisdiction profile per country, effective-dated, as in [Canada & the UK](/books/health-tech/canada-and-uk#how-to-build-it).

## Auditing

- **Processing records and DPIAs** with their versions and the date each purpose started.
- **Access and restriction history** per patient, viewable by the patient where the EHDS applies.
- **Secondary-use releases:** permit, dataset definition, pseudonymization method and delivery, for each request.
- **Device and AI conformity:** classification rationale under MDCG 2019-11, notified body certificates, EUDAMED registrations, and the AI Act technical documentation and logs as they become due.
- **Hosting attestations:** C5 Type 2 and HDS certificates with their scope and expiry, for every service in the data path ([Data Retention & Deletion](/docs/architecture/data-retention)).

## What This Means for the System You Build

- **Map every use of health data to an Article 9 condition and any national law,** and keep the record of processing as data.
- **Plan EHR products for the EHDS by 2029:** conformity, priority-category export, patient access logs and restrictions.
- **Classify software early under MDCG 2019-11** and expect a notified body for clinical decision software.
- **Register in EUDAMED** where the mandatory modules apply, and track the modules still to come.
- **Plan medical AI conformity for August 2028** under the amended AI Act timeline, combined with MDR.
- **Treat Germany and France as separate certifications:** C5 Type 2 for German statutory health cloud use, HDS for hosting French health data.
- **Choose a transfer mechanism deliberately** and expect EU hosting requirements from health customers anyway.

## References

**EU law and Commission pages**

- [GDPR Article 4: Definitions (gdpr-info.eu reproduction)](https://gdpr-info.eu/art-4-gdpr/), data concerning health and genetic data
- [GDPR Article 9: Processing of special categories (gdpr-info.eu reproduction)](https://gdpr-info.eu/art-9-gdpr/), the prohibition, 9(2)(h) and (i), professional secrecy, member state conditions
- [GDPR Article 35: Data protection impact assessment (gdpr-info.eu reproduction)](https://gdpr-info.eu/art-35-gdpr/), large-scale special category processing
- [European Commission: European Health Data Space Regulation](https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en), publication and entry into force, primary use rights, EHR framework, secondary use, timeline
- [European Commission: Electronic cross-border health services](https://health.ec.europa.eu/ehealth-digital-health-and-care/electronic-cross-border-health-services_en), MyHealth@EU services and plans
- [European Commission: New regulations on medical devices](https://health.ec.europa.eu/medical-devices-sector/new-regulations_en), IVDR applicable May 26, 2022, Implementing Regulation (EU) 2026/977
- [European Commission: MDCG endorsed guidance](https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en), MDCG 2019-11 rev.1 and MDCG 2025-6 (June 2025)
- [European Commission: EUDAMED overview](https://health.ec.europa.eu/medical-devices-eudamed/overview_en), four modules mandatory from May 28, 2026, the transition and remaining modules
- [European Commission: AI Act regulatory framework](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), application dates and the AI omnibus in force July 27, 2026 with December 2, 2027 and August 2, 2028 high-risk dates
- [European Commission: NIS2 Directive](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive), transposition by October 17, 2024 and covered sectors
- [European Commission: Data Act](https://digital-strategy.ec.europa.eu/en/policies/data-act), entry into force, application from September 12, 2025, its obligations
- [CJEU press release 106/25: General Court on the EU-US data privacy framework](https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250106en.pdf), dismissal of the annulment action in T-553/23

**Germany and France**

- [Section 393 SGB V: Cloud use in health care](https://www.gesetze-im-internet.de/sgb_5/__393.html), permitted locations, the C5 attestation, Type 1 until June 30, 2025 and Type 2 from July 1, 2025
- [BSI: C5 criteria catalogue](https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Empfehlungen-nach-Angriffszielen/Cloud-Computing/Kriterienkatalog-C5/kriterienkatalog-c5_node.html), minimum requirements for secure cloud computing
- [BfArM: Digital health applications (DiGA)](https://www.bfarm.de/EN/Medical-devices/Tasks/DiGA-and-DiPA/Digital-Health-Applications/_node.html), the directory, the fast-track procedure under section 139e SGB V, the DiGA Guide v3.6
- [ANS: Certification HDS](https://esante.gouv.fr/produits-services/hds), what the certification governs, its basis and the planned version 2.1
- [ANS: List of certified HDS hosts](https://esante.gouv.fr/produits-services/hds/liste-des-hebergeurs-certifies), the public list by référentiel version
