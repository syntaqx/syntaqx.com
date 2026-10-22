+++
title = "GDPR & Privacy"
description = "GDPR as a design constraint: lawful bases, controllers and processors, data subject rights, transfers, 72-hour breach notice, and how each maps onto a system."
category = "Compliance"
order = 903
tags = ["compliance", "gdpr", "privacy", "data"]
+++

The GDPR exists because Europe decided that information about a person belongs, in a meaningful sense, to that person. It's not framed as consumer protection or security. It's framed as a fundamental right, and that framing explains why it reaches so far: it applies to any organization in the EU, and to any organization anywhere that offers goods or services to people in the EU or monitors their behavior. If Europeans use your product, it applies to you.

For engineering, the GDPR's demands come down to four ideas. You need a **reason** for every piece of personal data you process. You must be able to **find** a person's data and act on it when they ask. You must **protect** it in proportion to the risk. And you must be able to **show your work**. Most of the cost of compliance is the second idea, because it requires knowing where data lives, and most systems don't.

This page describes how the regulation shapes system design. It isn't legal advice; how it applies depends on what you process, why and where, and that's a question for counsel and, if you have one, your data protection officer.

## Lawful Bases

Processing personal data is unlawful unless one of six bases in Article 6 applies:

| Basis | When it fits |
| --- | --- |
| **Consent** | Freely given, specific, informed and unambiguous, and as easy to withdraw as to give. The right basis for optional things like marketing email |
| **Contract** | Necessary to perform a contract with the person, like processing an address to ship an order |
| **Legal obligation** | Required by law, like keeping invoices for tax |
| **Vital interests** | Protecting someone's life; rare in software |
| **Public task** | For public authorities exercising official functions |
| **Legitimate interests** | Necessary for your or a third party's legitimate interest, and not overridden by the person's rights. Fraud prevention and security logging usually live here |

The common mistake is reaching for consent for everything. Consent is the most fragile basis: it can be withdrawn at any time, and it isn't valid if the service is conditioned on it. Processing that's genuinely necessary to run the product belongs under contract; security and fraud work belongs under legitimate interests. Record the basis for each purpose, because it determines which rights apply. Portability, for example, applies only to processing based on consent or contract.

## Controllers, Processors and the DPA

- **A controller** decides why and how personal data is processed. A business is the controller of its customer and employee data.
- **A processor** processes personal data on a controller's behalf and on its instructions. An API platform that stores its customers' end users' data is a processor for that data, and a controller for its own customers' account data.

A controller may only use processors that provide sufficient guarantees, under a contract with the terms Article 28 requires: process only on documented instructions, keep it confidential, secure it, use subprocessors only with authorization and on the same terms, help with data subject requests and breaches, and delete or return data at the end. That contract is the **data processing agreement (DPA)**. Expect every business customer to ask you to sign theirs or to offer your own, and to keep a published list of your **subprocessors** that you update before adding one.

## Data Subject Rights

People have rights to **access** a copy of their data, **rectify** it, **erase** it, **restrict** or **object to** processing, and **port** it to another service in a structured, machine-readable format. A controller must respond **within one month** of the request, extendable by two further months for complex or numerous requests if the person is told why within the first month.

Each right is a feature, and they share one prerequisite: you must be able to find everything you hold about a person.

- **Access and portability** are an export: a job that walks every store keyed by the person's identifiers and produces a JSON or CSV bundle. Build it once, as a real feature, instead of answering requests with ad hoc queries.
- **Erasure** is the hard one, because data has copies: replicas, caches, search indexes, analytics warehouses, logs, backups, and third parties you sent it to. Erasure doesn't apply when you must keep data for a legal obligation, so the system needs to know *why* each record is held. [Data Retention](/docs/architecture/data-retention) covers designing deletion in from the start, including letting backups age out rather than editing them.
- **Rectification and restriction** need a way to correct data everywhere it was copied, and a flag that stops processing without deleting.

## Privacy by Design and by Default

Article 25 turns good engineering into a legal duty. **By design** means building data protection into the system from the start: pseudonymization, minimization and security as architecture, not afterthoughts. **By default** means the default settings process only the personal data necessary for each purpose: optional fields really are optional, profiles aren't public unless the person makes them so, analytics collects what it needs and not everything it can.

Two documents make the thinking visible:

- **Records of processing activities** (Article 30): what you process, for what purposes, about whom, shared with whom, transferred where, kept for how long, and how it's secured. Organizations under 250 employees are exempt only if their processing is occasional, unlikely to create risk, and excludes special categories, which in practice describes almost no software company. Generate it from a data inventory you actually maintain, not a spreadsheet written once for an audit.
- **Data protection impact assessments** (Article 35): required before processing likely to result in a high risk to people, such as large-scale processing of sensitive data, systematic monitoring, or new technologies like profiling with machine learning. A DPIA is a structured version of a [threat model](/docs/security/threat-modeling) whose victims are the data subjects rather than the company.

## International Transfers

Personal data may leave the European Economic Area only to a country the Commission has found adequate, or with appropriate safeguards. For transfers to the US, the two mechanisms in use are:

- **The EU-US Data Privacy Framework (DPF)**, the third attempt at a transatlantic framework after Safe Harbor and Privacy Shield were struck down by the Court of Justice. US companies self-certify to the Department of Commerce, and transfers to certified companies are covered by the Commission's 2023 adequacy decision. In September 2025 the EU General Court dismissed a challenge to that decision (*Latombe v Commission*); an appeal to the Court of Justice is pending. The DPF is valid as of 2026, but with a history of two predecessors invalidated, a prudent design doesn't rest on it alone.
- **Standard Contractual Clauses (SCCs)**, model contract terms adopted by the Commission, combined with a transfer impact assessment of the destination's laws. They're the fallback that survives if the DPF falls, which is why most DPAs include them anyway.

The engineering lever is **data residency**: if data that doesn't need to leave the EU is stored and processed in an EU region, many transfer questions disappear. Know which of your vendors process data where, including support tools and the observability stack.

## Breach Notification

A controller must notify its supervisory authority of a personal data breach **without undue delay and, where feasible, within 72 hours** of becoming aware of it, unless the breach is unlikely to result in a risk to people. If the risk to people is high, they must be told directly as well, unless the data was rendered unintelligible to anyone unauthorized, for example by encryption. A processor must notify its controller without undue delay.

72 hours is short. It's achievable only if detection, triage and the decision about who to notify are already part of [Incident Response](/docs/operations/incident-response), and if logs let you say *whose* data was affected. "We can't tell which users were exposed" means notifying all of them.

## Data Protection Officers

A **DPO** is mandatory for public authorities, and for organizations whose core activities involve large-scale, regular and systematic monitoring of people, or large-scale processing of special categories of data (health, biometrics and others) or criminal records. Many companies that aren't required to appoint one still name a privacy lead. Where a DPO is required, they must be independent, report to the highest level of management, and be involved in data protection issues from the start.

## Mapping It onto a System

| Obligation | Engineering practice |
| --- | --- |
| Know what you hold | A data inventory: every store, its personal fields, purpose, lawful basis and retention, kept in code or schema annotations |
| Minimize | Don't collect fields without a purpose; drop them when the purpose ends |
| Protect | Encryption, access control, pseudonymous identifiers in analytics; [Sensitive Data](/docs/payments/sensitive-data) |
| Keep personal data out of logs | Redact at the logger, use opaque IDs in traces and metrics; [Observability](/docs/operations/observability) |
| Honor rights | Export and delete as built features that walk every store, with an audit record of each request |
| Retain only as needed | TTLs and scheduled deletion per data class; [Data Retention](/docs/architecture/data-retention) |
| Control vendors | DPAs with every processor, a public subprocessor list, region pinning where possible |
| Detect and notify | Breach detection, incident runbooks with a 72-hour clock, logs that identify affected people |

## A Note on CCPA and CPRA

California's Consumer Privacy Act, as amended by the California Privacy Rights Act, is the most significant US state law. It applies to for-profit businesses that meet thresholds of revenue or volume of California consumers' data, and gives consumers rights to know, delete and correct their information, to opt out of its sale or sharing, and to limit the use of sensitive personal information. The CPRA created a dedicated enforcement agency, the California Privacy Protection Agency. It's built on notice and opt-out rather than the GDPR's lawful bases, but the engineering is nearly identical: a system that can find, export and delete a person's data and honor an opt-out flag everywhere satisfies most of both. More states have passed similar laws, so build the capability once rather than per jurisdiction.

## References

**Specifications**

- [EUR-Lex: Regulation (EU) 2016/679 (General Data Protection Regulation)](https://eur-lex.europa.eu/eli/reg/2016/679/oj), the official text
- [European Commission: Standard contractual clauses (SCC)](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en), the model clauses for international transfers
- [Data Privacy Framework Program](https://www.dataprivacyframework.gov/), US self-certification and the list of participating companies

**Reference**

- [GDPR-Info: Article 6, Lawfulness of processing](https://gdpr-info.eu/art-6-gdpr/), the six lawful bases
- [GDPR-Info: Article 12, Transparent information and modalities](https://gdpr-info.eu/art-12-gdpr/), the one-month deadline and its extension
- [GDPR-Info: Article 17, Right to erasure](https://gdpr-info.eu/art-17-gdpr/), when erasure applies and its exceptions
- [GDPR-Info: Article 20, Right to data portability](https://gdpr-info.eu/art-20-gdpr/), portability limited to consent and contract
- [GDPR-Info: Article 25, Data protection by design and by default](https://gdpr-info.eu/art-25-gdpr/), the design duty
- [GDPR-Info: Article 28, Processor](https://gdpr-info.eu/art-28-gdpr/), the required terms of a data processing agreement
- [GDPR-Info: Article 30, Records of processing activities](https://gdpr-info.eu/art-30-gdpr/), the record and the narrow under-250 exemption
- [GDPR-Info: Article 33, Notification to the supervisory authority](https://gdpr-info.eu/art-33-gdpr/), the 72-hour rule and processor duties
- [GDPR-Info: Article 35, Data protection impact assessment](https://gdpr-info.eu/art-35-gdpr/), when a DPIA is required
- [GDPR-Info: Article 37, Designation of the data protection officer](https://gdpr-info.eu/art-37-gdpr/), when a DPO is mandatory
- [CJEU: Press release No 106/25, General Court dismisses action against the EU-US framework (PDF)](https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250106en.pdf), the September 2025 Latombe judgment
- [California Attorney General: California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa), CCPA rights as amended by the CPRA

**In practice**

- [EDPB: Guidelines 4/2019 on Article 25, Data Protection by Design and by Default](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-42019-article-25-data-protection-design-and_en), what regulators expect by design and by default to look like
- [ICO: UK GDPR guidance and resources](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/), practical guidance on lawful bases, rights and DPIAs from the UK regulator
