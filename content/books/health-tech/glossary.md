+++
title = "Health Tech Glossary"
nav_title = "Glossary"
description = "Every health tech term by part: business, records and interoperability, privacy, revenue cycle, practices, care delivery, payers, pharma and platform."
category = "Health Tech Industry"
order = 1999
part = "Reference"
tags = ["health-tech", "glossary", "reference"]
+++

Health care borrows its words from medicine, insurance, law and a dozen standards bodies, and the same word shifts with context: a claim is a bill to a payer and an assertion in a FHIR resource, an encounter is a visit to a clinician and a row a billing system can't post without, and a patient is a person to a physician and an animal to a veterinarian (whose client is the owner). Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea. The volume's own names for the core records are the ones in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## The Business

- **Accounting of disclosures:** the list a patient may request of who outside the practice received their information for purposes other than treatment, payment and operations, over the past six years, answered within 60 days; the `disclosures` table ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Allowed amount:** what a payer's contract or fee schedule says a service is worth; the payer and the patient split it, and the rest of the charge is written off ([The Health Tech Business](/books/health-tech/health-tech-business#fee-for-service-through-insurance)).
- **Appointment:** a booking for a patient at a time with a practitioner and resources; the plan, as distinct from the encounter that happened ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **BAA (business associate agreement):** the contract HIPAA requires before PHI is shared with a business associate, listing permitted uses, safeguards, breach reporting, subcontractor terms and return or destruction at termination ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#what-a-baa-must-say)).
- **Business associate:** a person or company that creates, receives, maintains or transmits PHI on behalf of a covered entity, including its subcontractors that do the same ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#being-a-business-associate)).
- **Capitation:** a fixed payment per member per month to a provider or plan, whether or not the member receives care ([The Health Tech Business](/books/health-tech/health-tech-business#value-based-payment-and-capitation)).
- **Charge:** a billable line from a procedure at the practice's fee, billed to a payer or the guarantor ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Claim:** a bill to one payer for one patient's services under one coverage, sent as an X12 837 ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Clearinghouse:** a company that routes and checks claims, eligibility checks, claim status and remittances between providers and payers ([The Health Tech Landscape](/books/health-tech/health-tech-landscape#revenue-cycle-and-clearinghouses)).
- **Collection ratio:** collections over net production for a period; how much of what the practice earned it actually received ([The Practice Business](/books/health-tech/practice-business#production-and-collections)).
- **Collections:** payments received from patients and payers, summed from the ledger ([The Practice Business](/books/health-tech/practice-business#production-and-collections)).
- **Contractual adjustment:** the write-off of the difference between a practice's charge and a payer's allowed amount, agreed by contract (group code CO) ([The Health Tech Business](/books/health-tech/health-tech-business#fee-for-service-through-insurance)).
- **Corporate practice doctrine:** state law barring lay corporations from practicing medicine, dentistry or veterinary medicine or employing licensees to do it, the reason MSOs and DSOs exist ([The Practice Business](/books/health-tech/practice-business#corporate-practice-doctrines)).
- **Coverage:** a patient's insurance under a plan, with member ID, subscriber, relationship and order (primary, secondary) ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Covered entity:** a health plan, a clearinghouse, or a provider that conducts HIPAA standard transactions such as claims electronically ([The Health Tech Business](/books/health-tech/health-tech-business#who-s-who)).
- **DSO (dental service organization):** a company that provides business services to dental practices under management agreements, with licensed dentists owning the clinical entities ([The Practice Business](/books/health-tech/practice-business#dsos-and-msos)).
- **Encounter:** a visit where care was delivered, in person or virtual; what claims and the clinical record run on ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Fee schedule:** a set of fees by procedure code: the practice's own office fees, or a payer's contracted or published amounts ([The Practice Business](/books/health-tech/practice-business#how-to-build-it)).
- **Guarantor:** the person or organization responsible for a patient's bill: the patient, a parent, a spouse, or for a veterinarian the client ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **HBNR (Health Breach Notification Rule):** the FTC rule (16 CFR Part 318) requiring vendors of personal health records outside HIPAA to notify people, the FTC and sometimes the media of breaches, including unauthorized sharing ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#the-ftc-health-breach-notification-rule)).
- **HITRUST:** a security assessment and certification framework common in health care, in e1, i1 and r2 tiers ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#reports-and-certifications)).
- **Ledger entry:** an append-only posting of a charge, payment, adjustment, write-off, refund or transfer to a guarantor's account; balances are sums of entries ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **MSO (management services organization):** a company providing the business side of a medical practice under a management agreement while licensees own the practice ([The Practice Business](/books/health-tech/practice-business#dsos-and-msos)).
- **NPI (National Provider Identifier):** the 10-digit identifier with a check digit that HIPAA assigns to health care providers, type 1 for individuals and type 2 for organizations ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Patient:** the person receiving care, or for a veterinarian the animal ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Patient responsibility:** the part of an allowed amount the patient owes under the plan design (deductible, copay, coinsurance), group code PR on the remittance ([The Health Tech Business](/books/health-tech/health-tech-business#fee-for-service-through-insurance)).
- **Payer:** an insurer, government program or plan administrator that pays claims ([The Health Tech Business](/books/health-tech/health-tech-business#who-s-who)).
- **Percentage of collections:** a revenue cycle vendor's fee computed as a share of the payments it collects for the customer ([Business Models for Health Software](/books/health-tech/health-tech-business-models#percentage-of-collections-and-outsourced-rcm)).
- **PHI (protected health information):** individually identifiable health information held by a covered entity or business associate ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#being-a-business-associate)).
- **PMPM (per member per month):** a fee or payment computed on the number of covered members each month, as in enterprise telehealth access fees and capitation ([Business Models for Health Software](/books/health-tech/health-tech-business-models#enterprise-and-consumer-telehealth)).
- **Practitioner:** a licensed person who delivers care; the NPI belongs to them ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Practitioner role:** a practitioner at an organization and location, with specialty and taxonomy code; claims name the rendering role ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Procedure:** a service planned or performed, with its CPT, CDT, HCPCS or local code; clinical, as distinct from its charge ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Production:** the practice's fees for completed procedures in a period, gross or net of PPO write-offs and adjustments ([The Practice Business](/books/health-tech/practice-business#production-and-collections)).
- **QHIN (Qualified Health Information Network):** a network designated to exchange records under TEFCA ([The Health Tech Landscape](/books/health-tech/health-tech-landscape#networks-and-exchange)).
- **Recall:** the recurring visit a patient is due for (a cleaning, an annual exam, a vaccine), with a due date computed from the last completed procedure ([The Practice Business](/books/health-tech/practice-business#recall-is-the-revenue-loop)).
- **Remittance:** a payer's payment and explanation across claims, sent as an X12 835 ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Scheduled production:** the fees of treatment-planned procedures attached to scheduled appointments; what the schedule is worth if everyone shows ([The Practice Business](/books/health-tech/practice-business#production-and-collections)).
- **Self-funded plan:** an employer health plan where the employer bears the claims cost and an insurer or TPA administers it under ERISA ([The Health Tech Business](/books/health-tech/health-tech-business#fee-for-service-through-insurance)).
- **Subscriber:** the person who holds the insurance policy a patient is covered under ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **Taxonomy code:** a ten-character NUCC code describing a provider's type and specialty ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).

## Records and Interoperability

- **EHR (electronic health record):** the system that holds a patient's clinical record (problems, medications, allergies, notes, orders, results), often combined with practice management ([The Health Tech Landscape](/books/health-tech/health-tech-landscape#the-ehr-market)).
- **FHIR (Fast Healthcare Interoperability Resources):** HL7's standard of resources and a REST API for health data; the volume's tables map to its R4 resources ([The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model)).
- **HL7 v2:** HL7's pipe-delimited messaging standard (admissions, orders, results, scheduling) that still runs most hospital interfaces ([The Health Tech Business](/books/health-tech/health-tech-business#the-life-of-a-visit)).
- **PMS (practice management system):** the system a practice's front desk runs on: schedule, patients, ledger, insurance and claims, and in dental and veterinary practice the clinical chart too ([The Health Tech Landscape](/books/health-tech/health-tech-landscape#specialty-practice-management)).
- **X12:** the standards body and format for HIPAA's administrative transactions: 837 claims, 835 remittances, 270/271 eligibility, 276/277 claim status, 278 authorizations ([The Health Tech Business](/books/health-tech/health-tech-business#fee-for-service-through-insurance)).

## References

**Reference**

- [HL7 FHIR R4: Resource index](https://hl7.org/fhir/R4/resourcelist.html), the FHIR resources the core data model maps to
- [CMS: Adopted standards and operating rules](https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/adopted-standards-operating-rules), the HIPAA transaction standards
- [45 CFR 160.103: Definitions](https://www.law.cornell.edu/cfr/text/45/160.103), covered entity, business associate and protected health information
