+++
title = "GDPR & Privacy"
description = "GDPR as a design constraint: lawful bases, controllers and processors, data subject rights, transfers, 72-hour breach notice, and how each maps onto a system."
category = "Compliance"
order = 903
tags = ["compliance", "gdpr", "privacy", "data"]
+++

The GDPR rests on the idea that information about a person belongs, in a meaningful sense, to that person. It's framed as a fundamental right rather than consumer protection, which is why it reaches so far: it applies to any organization in the EU, and to any organization anywhere that offers goods or services to people in the EU or monitors their behavior. If Europeans use your product, it applies to you.

For engineering it comes down to four ideas. You need a **reason** for every piece of personal data you process. You must be able to **find** a person's data and act on it when they ask. You must **protect** it in proportion to the risk. And you must be able to **show your work**. Most of the cost is the second idea, because it requires knowing where data lives, and most systems don't.

This describes how the regulation shapes system design. It isn't legal advice; how it applies depends on what you process, why and where, which is a question for counsel.

## Lawful Bases

Processing personal data is unlawful unless one of six bases in Article 6 applies:

| Basis | When it fits |
| --- | --- |
| **Consent** | Freely given, specific, informed, unambiguous, and as easy to withdraw as to give. Right for optional things like marketing email |
| **Contract** | Necessary to perform a contract with the person, like using an address to ship an order |
| **Legal obligation** | Required by law, like keeping invoices for tax |
| **Vital interests** | Protecting someone's life; rare in software |
| **Public task** | Public authorities exercising official functions |
| **Legitimate interests** | Necessary for a legitimate interest and not overridden by the person's rights. Fraud prevention and security logging usually live here |

The common mistake is reaching for consent for everything. It's the most fragile basis: it can be withdrawn any time, and it isn't valid if the service is conditioned on it. Processing genuinely needed to run the product belongs under contract; security and fraud work under legitimate interests. Record the basis for each purpose, because it determines which rights apply: portability, for example, applies only to consent and contract.

## Controllers, Processors and the DPA

- **A controller** decides why and how personal data is processed: a business, for its customer and employee data.
- **A processor** processes it on a controller's behalf and instructions. An API platform storing its customers' end users' data is a processor for that data, and a controller for its own customers' account data.

A controller may only use processors under a contract with the terms Article 28 requires: process only on documented instructions, keep it confidential and secure, use subprocessors only with authorization and on the same terms, help with requests and breaches, and delete or return data at the end. That's the **data processing agreement (DPA)**. Expect every business customer to ask you to sign theirs or offer yours, and keep a published list of your **subprocessors**, updated before you add one.

## Data Subject Rights

People can **access** a copy of their data, **rectify** it, **erase** it, **restrict** or **object to** processing, and **port** it to another service in a machine-readable format. A controller must respond **within one month**, extendable by two more for complex or numerous requests if the person is told why within the first.

Each right is a feature, and they share one prerequisite: finding everything you hold about a person.

- **Access and portability** are an export: a job that walks every store keyed by the person's identifiers and produces a JSON or CSV bundle. Build it once as a real feature, not ad hoc queries per request.
- **Erasure** is the hard one, because data has copies: replicas, caches, search indexes, warehouses, logs, backups, and third parties. It doesn't apply where the law requires you to keep data, so the system has to know *why* each record is held. [Data Retention](/docs/architecture/data-retention) covers the mechanics, including letting backups age out instead of editing them.
- **Rectification and restriction** need a way to correct data everywhere it was copied, and a flag that stops processing without deleting.

## Privacy by Design and by Default

Article 25 makes good engineering a legal duty. **By design** means pseudonymization, minimization and security as architecture, not afterthoughts. **By default** means the defaults process only what each purpose needs: optional fields are optional, profiles aren't public unless the person makes them so, analytics collects what it needs rather than everything it can.

Two documents make the thinking visible:

- **Records of processing activities** (Article 30): what you process, why, about whom, shared with whom, transferred where, kept how long, and secured how. The under-250-employee exemption applies only to occasional, low-risk processing without special categories, which describes almost no software company. Generate it from a data inventory you actually maintain.
- **Data protection impact assessments** (Article 35), required before processing likely to pose high risk to people: large-scale sensitive data, systematic monitoring, profiling with machine learning. A DPIA is a [threat model](/docs/security/threat-modeling) whose victims are the data subjects rather than the company.

## International Transfers

Personal data may leave the European Economic Area only to a country the Commission has found adequate, or with appropriate safeguards. For the US, two mechanisms are in use:

- **The EU-US Data Privacy Framework (DPF),** the third attempt after Safe Harbor and Privacy Shield were struck down by the Court of Justice. US companies self-certify, and transfers to them are covered by the Commission's 2023 adequacy decision. In September 2025 the General Court dismissed a challenge to it (*Latombe v Commission*); an appeal is pending. It's valid as of 2026, but with two predecessors invalidated, a prudent design doesn't rest on it alone.
- **Standard Contractual Clauses (SCCs),** model contract terms plus a transfer impact assessment of the destination's laws. They survive if the DPF falls, which is why most DPAs include them anyway.

The engineering lever is **data residency**: data that doesn't need to leave the EU, stored and processed in an EU region, makes most transfer questions disappear. Know where each vendor processes data, including support tools and the observability stack.

## Breach Notification

A controller must notify its supervisory authority **without undue delay and, where feasible, within 72 hours** of becoming aware of a breach, unless it's unlikely to put people at risk. If the risk is high, the people must be told too, unless the data was unintelligible to the attacker, for example encrypted. A processor notifies its controller without undue delay.

72 hours is short. It's achievable only if detection, triage and the notification decision are already part of [Incident Response](/docs/operations/incident-response), and if logs say *whose* data was affected. "We can't tell which users were exposed" means notifying all of them.

A **data protection officer** is mandatory for public authorities and for organizations whose core activities are large-scale monitoring of people or large-scale processing of special categories (health, biometrics) or criminal records. Where required, the DPO is independent, reports to the highest level of management, and is involved from the start.

## Mapping It onto a System

| Obligation | Engineering practice |
| --- | --- |
| Know what you hold | A data inventory: each store's personal fields, purpose, lawful basis and retention, kept in code or schema annotations |
| Minimize | No field without a purpose; drop it when the purpose ends |
| Protect | Encryption, access control, pseudonymous IDs in analytics; [Sensitive Data](/docs/payments/sensitive-data) |
| Keep it out of logs | Redact at the logger, opaque IDs in traces and metrics; [Observability](/docs/operations/observability) |
| Honor rights | Export and delete as built features that walk every store, with an audit record per request |
| Control vendors | DPAs with every processor, a public subprocessor list, region pinning where possible |

## CCPA and CPRA

California's Consumer Privacy Act, amended by the California Privacy Rights Act, is the most significant US state law. It applies to for-profit businesses past thresholds of revenue or volume of Californians' data, and gives consumers rights to know, delete and correct their information, to opt out of its sale or sharing, and to limit use of sensitive data, enforced by a dedicated agency. It's built on notice and opt-out rather than lawful bases, but the engineering is nearly identical: a system that can find, export and delete a person's data and honor an opt-out flag everywhere satisfies most of both. More states have followed, so build the capability once rather than per jurisdiction.

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
