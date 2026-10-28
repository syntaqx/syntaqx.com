+++
title = "Shared Responsibility & Compliance Programs"
nav_title = "Compliance Programs"
description = "The shared responsibility model and the programs a provider holds for customers: SOC 2, ISO 27001, PCI DSS for hosts, FedRAMP 20x, GovRAMP, sovereign cloud."
category = "Hosting & Cloud Industry"
order = 2202
part = "Market Rules and Compliance"
tags = ["compliance", "soc-2", "iso-27001", "pci-dss", "fedramp", "sovereign-cloud"]
+++

A provider's customers have auditors, and those auditors ask about the provider. A bank running on a cloud must show its own SOC 2 or PCI assessor that the data center, the hypervisor and the network are controlled; a state agency buying a SaaS product needs the cloud under it to be authorized; a European hospital wants to know which country's law can reach its data and who has the keys. No provider can let every customer's auditor into its buildings, so the industry answers with a split and a stack of reports: the shared responsibility model says which controls the provider runs and which the customer runs, and the provider buys audits once (SOC 2, ISO 27001, PCI DSS, FedRAMP) and hands the reports to every customer under NDA. Sovereign cloud is the newest layer: legal entities, staff and operations arranged so that the provider's home government can't reach the data.

The playbook already owns each framework as an engineering discipline: [SOC 2](/docs/compliance/soc-2), [PCI DSS](/docs/compliance/pci-dss), [GDPR](/docs/compliance/gdpr) and [HIPAA](/docs/compliance/hipaa). This chapter covers what changes when the company being audited is the infrastructure: the model, the programs a provider carries for its customers, the US government's authorization programs, and sovereign structures. It adds `compliance_attestations` and `attestation_scopes`, and residency columns on `regions`, to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Program status is as of October 2026.

## How the Providers Do It

| Program | What it proves | Who issues it | What a provider hands customers |
| --- | --- | --- | --- |
| **SOC 2** | Controls against the AICPA Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) over a period (Type 2) or at a point (Type 1) | A CPA firm | The report under NDA, with the services and regions in scope and the complementary controls customers must run |
| **ISO/IEC 27001** | An information security management system certified against the standard; 27017 and 27018 add cloud and personal-data controls | An accredited certification body | The certificate and its scope statement |
| **PCI DSS** | The provider's part of protecting cardholder data; Appendix A1 for multi-tenant service providers | A Qualified Security Assessor | An Attestation of Compliance and a responsibility matrix |
| **FedRAMP** | Authorization for US federal agencies to use the service | The FedRAMP program, with agency sponsors under Rev5 or the 20x process | The authorization package to agencies |
| **GovRAMP** (formerly StateRAMP) | Verification for state and local governments | The non-profit GovRAMP | Status on its list |
| **Sovereign cloud** | Not an audit: a structure of entities, staff, locations and keys | The provider, sometimes with a national partner | Contractual and structural commitments |

The pattern is that each program certifies a **scope** (named services in named regions over a named period), not a company, and that each scope comes with obligations the customer keeps. A provider's compliance system is mostly the bookkeeping of scopes: which product in which region was in which report for which period, and which controls the customer must run for the report to mean anything.

## How It Got Here

- **2015:** ISO/IEC 27017 added a cloud code of practice.
- **2017 and 2022:** the AICPA issued the current Trust Services Criteria and revised their points of focus.
- **October 2022:** ISO/IEC 27001:2022 was published; certification bodies had to move clients to it by October 31, 2025.
- **February 14, 2025:** StateRAMP announced its rebrand to GovRAMP.
- **April 2025 to March 2026:** FedRAMP 20x piloted Low, then Moderate, certifications.
- **June 2025 to February 2026:** Microsoft announced its European sovereign offerings (June 16, 2025), AWS's European Sovereign Cloud became generally available (January 15, 2026), and Google described its sovereign portfolio (February 6, 2026).
- **November 2025:** the PCI Security Standards Council clarified in FAQ 1221 who counts as a multi-tenant service provider under Appendix A1.
- **June 11, 2027:** FedRAMP stops accepting new Rev5 certifications.

## The Shared Responsibility Model

AWS's statement is the one the industry quotes: AWS is responsible for security "of the cloud" (the hardware, software, networking and facilities that run the services), and the customer for security "in the cloud." The line moves with the service. On EC2 the customer owns the guest operating system and its patches, the software it installs and the security group configuration; on S3 or DynamoDB the provider runs the infrastructure, operating system and platform, and the customer owns its data, the encryption options and IAM. AWS sorts controls into inherited (the customer takes them wholesale, like physical security), shared (both sides do part, like patching or configuration) and customer-specific.

The model is a contract boundary more than a security design, and it's where the disputes are. Commenters to the FTC's 2023 cloud RFI said it "often lacks clarity"; the FTC's summary of what it heard (November 16, 2023) lists security and responsibility clarity among the themes alongside egress fees and licensing. The provider's fix is to publish the split per service in the same vocabulary the reports use, so the customer's auditor can map each control to "inherited from the provider's SOC 2, section X" or "ours."

## SOC 2 and ISO 27001 for a Provider

The playbook covers what the [Trust Services Criteria](/docs/compliance/soc-2#the-trust-services-criteria) are, the difference between [Type 1 and Type 2](/docs/compliance/soc-2#type-1-and-type-2), and how the two frameworks relate ([SOC 2 and ISO 27001](/docs/compliance/soc-2#soc-2-and-iso-27001)). The AICPA's current criteria are the 2017 Trust Services Criteria with revised points of focus (2022). The current ISO edition is ISO/IEC 27001:2022, published in October 2022; certification bodies had to finish moving their clients to it by October 31, 2025. ISO/IEC 27017:2015 is the cloud code of practice, adding seven cloud-specific controls; ISO/IEC 27018 covers protection of personal data in public clouds.

What a provider adds, using the terms the playbook's [What Auditors Test](/docs/compliance/soc-2#what-auditors-test) and [Type 1 and Type 2](/docs/compliance/soc-2#type-1-and-type-2) sections define:

- **Scope is per service and region,** and new services enter the report after a period of operation. Customers read the scope list first; a service not in scope inherits nothing.
- **Complementary user entity controls.** Every provider report lists controls its customers must run (access reviews of their own users, configuration of their own encryption) for the provider's controls to achieve their objectives. These are the "in the cloud" half of the model, written into the audit.
- **Subservice organizations.** A PaaS on a hyperscaler names the hyperscaler as a subservice organization and usually carves it out, relying on its report, the [underlay](/books/hosting-and-cloud/provider-landscape#who-resells-whom) showing up in the audit.
- **Bridge letters** cover the gap between the end of a report's period and the next report, because customers' audit periods don't line up with the provider's.
- **Evidence is engineering.** Configuration-management and policy tools produce control evidence continuously, as [Chef's InSpec results](/books/hosting-and-cloud/chef#how-to-build-it) do in `compliance_control_results`; the playbook's [Engineering Is the Evidence](/docs/compliance/soc-2#engineering-is-the-evidence) section is the general rule.

## PCI DSS for Hosts

A host whose customers take card payments is a third-party service provider to them under PCI DSS whenever its systems can affect the security of their cardholder data environment. The playbook's [What a Service Provider Adds](/docs/compliance/pci-dss#what-a-service-provider-adds) covers the duties; for hosting, the twist is Appendix A1, "Additional PCI DSS Requirements for Multi-Tenant Service Providers." The PCI Security Standards Council's FAQ 1221 (November 2025) says A1 "applies to service providers with customers in shared services environments," and that "It is not the intent that all or even most TPSPs are categorized as multi-tenant service providers": a colocation provider that only supplies space and power, or one that gives a customer dedicated servers, isn't one. A shared host or a cloud where customers' environments share systems is. A1 requires the provider to protect and separate each customer's environment and data, and to support logging and incident response for each customer.

The deliverable that customers actually use is the responsibility matrix: for each PCI DSS requirement, whether the provider, the customer or both are responsible, per service. It is the shared responsibility model again, in PCI's vocabulary, and it must match the provider's Attestation of Compliance.

## FedRAMP 20x and GovRAMP

FedRAMP authorizes cloud services for US federal agencies. The traditional path is Rev5. FedRAMP 20x replaces it with automated validation of Key Security Indicators and certification classes, built in public phases:

- **Phase 1** piloted Low (April to September 2025), and **Phase 2** piloted Moderate (November 2025 to March 2026).
- As of October 2026 the 20x page says classes A (pilot), B (Low) and C (Moderate) are available, and that the Consolidated Rules for 2026 "are now finalized for Class A, Class B, and Class C." Class D (High) isn't available yet; a pilot is planned in Phase 4, estimated for the first half of fiscal 2027.
- FedRAMP will stop accepting new Rev5 certifications on June 11, 2027.

For a provider, 20x changes the evidence from documents to machine-readable indicators produced continuously, which favors providers whose controls are already code. The Rev5 cutoff means a provider starting today should plan on 20x, and one holding a Rev5 authorization should plan its move.

GovRAMP is the state and local counterpart. StateRAMP announced on February 14, 2025 that it would rebrand as GovRAMP, to reflect that the voluntary program is used by local governments, educational institutions, hospitals and others as well as states; Nextgov reported it in use in 27 states, and the two names are used interchangeably where state law still names StateRAMP.

## Sovereign Cloud

Sovereignty answers a question the audits don't: whose law can compel the provider. The CLOUD Act lets US authorities compel a US provider to produce data in its "possession, custody, or control" wherever it is stored ([International Requests](/books/user-generated-platforms/law-enforcement-requests#international-requests)), so European customers asked for structures that put the data, the operations and the keys outside a US company's control. As of October 2026 the three hyperscalers had each answered differently:

| Offering | Structure | Status |
| --- | --- | --- |
| **AWS European Sovereign Cloud** | A new parent company with three German GmbHs led by EU citizens, operated exclusively by EU residents, with an advisory board of EU citizens or residents; first Region in Brandenburg, Germany; more than €7.8 billion of investment; sovereign Local Zones planned in Belgium, the Netherlands and Portugal | Generally available January 15, 2026 |
| **Microsoft** | Sovereign Public Cloud across its European regions; Sovereign Private Cloud on Azure Local; National Partner Clouds operated by local companies (Bleu in France, Delos Cloud in Germany); Data Guardian, External Key Management and Regulated Environment Management | Announced June 16, 2025, with the public offering in preview at announcement |
| **Google Cloud** | Data Boundary; Dedicated, operated by a local partner (S3NS in France, with SecNumCloud 3.2), where the partner can block Google updates and run disconnected for up to 12 months; Air-Gapped, where "Google cannot remotely access or shut down customer workloads" | Portfolio described February 6, 2026 |

Sovereignty is a spectrum: data location (a region in the country), operational control (who has admin access and from where), key control (customer-held or externally managed keys), legal control (a local entity and local staff) and survivability (operating disconnected). A provider headquartered in the jurisdiction answers legal control by what it is; the hyperscalers build the other combinations into separate offerings. Data residency as such, where personal data may be transferred, is the GDPR's [International Transfers](/docs/compliance/gdpr#international-transfers) question.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Third-party reports, shared under NDA** | Audit once, give the report to every customer | Scales to any number of customers' auditors | Scope gaps and stale periods; customers miss the complementary controls | Audit fees and continuous evidence work | Every large provider |
| **Customer audits on request** | Let customers or their auditors inspect | Direct assurance | Doesn't scale; security risk in the facilities | Very high per customer | Colocation, private cloud contracts |
| **Responsibility matrix per framework** | Publish who does each requirement, per service | Makes the shared model usable | Drifts from the actual reports if maintained by hand | Low if generated | PCI and FedRAMP practice |
| **Government authorization** | FedRAMP 20x or Rev5, GovRAMP | Required for the public sector market | Long and costly; 20x still in phases | High | Providers selling to government |
| **Sovereign structure** | Local entities, staff, keys and disconnected operation | Answers CLOUD Act and national-security concerns | Feature lag; higher prices; still the same parent in some designs | Very high | AWS, Microsoft, Google Cloud in Europe |
| **Regional provider** | Buy from a provider headquartered in the jurisdiction | Simplest sovereignty answer | Smaller catalog | Varies | European-headquartered providers such as OVHcloud and Hetzner |

## My Default

My default for a provider is SOC 2 Type 2 and ISO 27001 from the first enterprise customer, with the scope list, the complementary user entity controls and the per-service responsibility split generated from the same control catalog and published together; PCI DSS as a service provider only for services where customers' cardholder data environments run (and A1 if those are shared); and FedRAMP 20x only when a federal customer will sponsor or the market demands it, planned around the June 11, 2027 Rev5 cutoff. Sovereign structures are a business decision, not a compliance one: worth building when a regulated market requires local operations and keys, and otherwise answered with region choice, customer-managed keys and a clear statement of which law reaches the data.

What would change this: a provider whose customers are mostly small businesses may not need SOC 2 until its first enterprise deal asks for it, and a provider headquartered in the EU already answers the sovereignty question its US competitors pay to build.

## How to Build It

Two tables record what has been attested and for which scope, and the core `regions` table gains the facts customers ask about residency and sovereignty. Control evidence itself comes from the systems that produce it ([Chef's `compliance_control_results`](/books/hosting-and-cloud/chef#how-to-build-it), the policy evaluations in [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#how-to-build-it)).

```sql
CREATE TABLE compliance_attestations (   -- a report, certificate or authorization the provider holds
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  program          TEXT NOT NULL CHECK (program IN ('soc2_type1', 'soc2_type2', 'soc1_type2',
                     'iso_27001', 'iso_27017', 'iso_27018', 'pci_dss_service_provider',
                     'fedramp_rev5', 'fedramp_20x', 'govramp', 'national_scheme')),
  program_detail   TEXT,                 -- 'Class C', 'Moderate', 'SecNumCloud 3.2'
  issuer           TEXT NOT NULL,        -- the CPA firm, certification body, QSA, agency
  period           TSTZRANGE NOT NULL,   -- the audit period; for a certificate, its validity
  issued_at        DATE NOT NULL,
  report_ref       TEXT NOT NULL,        -- the document in the trust portal
  nda_required     BOOLEAN NOT NULL DEFAULT TRUE,
  supersedes_id    UUID REFERENCES compliance_attestations (id),
  status           TEXT NOT NULL CHECK (status IN ('in_force', 'expired', 'superseded',
                     'withdrawn'))
);

CREATE TABLE attestation_scopes (        -- which product in which region an attestation covers
  attestation_id   UUID NOT NULL REFERENCES compliance_attestations (id),
  product_id       UUID NOT NULL REFERENCES products (id),
  region_id        TEXT REFERENCES regions (id),  -- null: all regions of the product
  subservice_org   TEXT,                 -- the underlay, when carved out
  customer_controls TEXT[] NOT NULL DEFAULT '{}', -- complementary user entity control ids
  PRIMARY KEY (attestation_id, product_id, region_id)
);

ALTER TABLE regions
  ADD COLUMN operating_entity    TEXT,     -- the legal entity that runs the region
  ADD COLUMN operator_residency  TEXT,     -- 'eu_residents_only', 'any'
  ADD COLUMN key_control         TEXT CHECK (key_control IN ('provider', 'customer_managed',
                                   'external_hsm')),
  ADD COLUMN disconnected_ops    INTERVAL, -- how long it can run cut off, if designed to
  ADD COLUMN sovereign_partition TEXT;     -- 'aws_european_sovereign_cloud', a partner cloud
```

The question every customer's auditor asks, answered as a query: is this product in this region covered by an in-force report for my audit period, and what must I do?

```sql
SELECT a.program, a.program_detail, a.period, a.report_ref, s.customer_controls
FROM attestation_scopes s
JOIN compliance_attestations a ON a.id = s.attestation_id
WHERE s.product_id = $1
  AND (s.region_id IS NULL OR s.region_id = $2)
  AND a.status = 'in_force'
  AND a.period && $3::tstzrange          -- the customer's audit period
ORDER BY a.program, upper(a.period) DESC;
```

Notes on the sketch:

- **Scope is rows, not prose.** A trust portal, a sales answer and a responsibility matrix all read `attestation_scopes`, so they agree.
- **Gaps are a query.** Products sold in a region without an in-force attestation for the programs a customer's contract requires are listed before the customer finds them.
- **Customer controls travel with scope.** The complementary controls for each scope are part of what the customer receives.
- **Sovereignty is regional data.** Operating entity, operator residency, key control and disconnected operation are facts about a region, so a contract, a data processing agreement and a placement policy can reference them.
- **Events:** `attestation.issued`, `attestation.expiring` (ahead of the period end, to trigger a bridge letter), `attestation_scope.changed` and `region.sovereignty_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the trust portal, sales and customer notices.

## Auditing

- **Every attestation with its scope history,** so the coverage of any product, region and date can be shown.
- **Who downloaded which report,** under which NDA, since reports describe the provider's controls in detail ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Control evidence by control,** from configuration and policy runs, retained for the audit period plus the auditor's sampling window.
- **Changes to sovereignty facts** on regions, because contracts promise them.

## What This Means for the System You Build

- **Publish the responsibility split per service,** in the vocabulary of the reports.
- **Record each attestation's scope as product and region rows** with the customer's complementary controls.
- **Treat A1 as the PCI test for shared environments,** not for colocation or dedicated servers.
- **Plan government work on FedRAMP 20x,** with Rev5 closing to new certifications on June 11, 2027.
- **Model sovereignty as region facts:** entity, operator residency, key control, disconnected operation.
- **Generate evidence from the systems that enforce controls,** never from screenshots.

## References

**Frameworks**

- [AWS: Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/), security of and in the cloud, the EC2 and S3 split, inherited, shared and customer-specific controls
- [FTC: Cloud computing RFI, what we heard and learned](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2023/11/cloud-computing-rfi-what-we-heard-learned), November 16, 2023, the shared responsibility clarity theme
- [AICPA: 2017 Trust Services Criteria with revised points of focus (2022)](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022), the five categories
- [INAB: Transition requirements for ISO/IEC 27001:2022](https://www.inab.ie/inab-documents/notifications/transition-requirements-for-iso-27001-2022.pdf), publication in October 2022 and the October 31, 2025 transition deadline
- [Microsoft Learn: ISO/IEC 27017](https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-iso-27017), the cloud code of practice and its added controls
- [PCI SSC: FAQ 1221](https://www.pcisecuritystandards.org/faqs/1221/), Appendix A1, who is a multi-tenant service provider and who isn't

**Government programs**

- [FedRAMP: 20x](https://www.fedramp.gov/20x/), phases, classes, the finalized Consolidated Rules and the June 11, 2027 Rev5 cutoff
- [Nextgov: StateRAMP to rebrand later this year](https://www.nextgov.com/acquisition/2025/02/exclusive-stateramp-rebrand-later-year/403042/), February 14, 2025, GovRAMP, who uses it and the 27 states

**Sovereign cloud**

- [Amazon: AWS launches AWS European Sovereign Cloud](https://press.aboutamazon.com/aws/2026/1/aws-launches-aws-european-sovereign-cloud-and-announces-expansion-across-europe), January 15, 2026, structure, Region, investment and Local Zones
- [Microsoft: Announcing comprehensive sovereign solutions](https://blogs.microsoft.com/blog/2025/06/16/announcing-comprehensive-sovereign-solutions-empowering-european-organizations/), June 16, 2025
- [Google Cloud: Delivering a secure, open, sovereign digital world](https://cloud.google.com/blog/products/identity-security/delivering-a-secure-open-sovereign-digital-world), February 6, 2026, Data Boundary, Dedicated and Air-Gapped
