+++
title = "The Health Tech Business"
description = "How health care works in software: the parties, how the money flows, the life of a visit, and the core data model every later chapter extends."
category = "Health Tech Industry"
order = 1901
part = "The Business"
tags = ["health-tech", "business-models", "data-model", "fhir", "revenue-cycle"]
+++

Health care is a patient, a clinician and a bill that someone else usually pays. A hygienist cleans a patient's teeth and the dental plan pays most of it twice a year; a physical therapist sees a patient after knee surgery and Medicare pays under a fee schedule after a threshold check; a veterinarian vaccinates a dog and the owner pays at the counter; a hospital admits a patient through the emergency department and the bill passes through a clearinghouse, a payer's adjudication engine and a remittance before anyone knows what the patient owes. Between them sit the systems that record the care (an EHR or a practice management system), the ones that move the money (clearinghouses, payers, payment processors), the ones that talk to the patient (reminders, texting, intake forms, portals), and the regulators that decide who may see any of it.

The software is hard because one visit lives in several systems at once, each speaking its own standard. An appointment booked online exists in the patient engagement platform that took it, the practice management system on a server in the back office that the front desk works from, the reminder that went out by text, the eligibility check sent to the payer as an X12 270, the clinical note in the EHR, the claim sent as an 837, the remittance that came back as an 835, the card payment for the patient's share and the ledger entry that posted it. Any of them can be wrong about the visit in a different way, and every one of them holds protected health information. This chapter is the map the rest of the volume uses: how to read it, the parties, how the money flows, the life of a visit, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/health-tech/glossary).

## How to Read This Volume

The volume follows a patient from the business that treats them to the platform that runs it, in ten parts plus a reference:

- **The Business.** This chapter; [The Health Tech Landscape](/books/health-tech/health-tech-landscape) (EHR and specialty practice management markets, patient engagement, revenue cycle, networks and telehealth, consolidation and the Change Healthcare attack); [The Practice Business](/books/health-tech/practice-business) (how a small practice runs and earns, production and collections, DSOs and MSOs, corporate practice doctrines); [Business Models for Health Software](/books/health-tech/health-tech-business-models) (per-location SaaS, percentage of collections, transaction fees, pharma-funded and direct-to-consumer models); and [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture) (business associates, BAAs, HITRUST and SOC 2, security reviews, state health privacy and the FTC's Health Breach Notification Rule).
- **Records and Interoperability.** [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data); [HL7 v2 & Interfaces](/books/health-tech/hl7-v2); [FHIR](/books/health-tech/fhir); [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir); [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda); [Networks & Exchange](/books/health-tech/health-information-exchange); [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity); and [Terminologies & Code Sets](/books/health-tech/terminology-and-coding).
- **Rules of the Record.** [HIPAA in Practice](/books/health-tech/hipaa-in-practice); [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification); [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy); [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization); and [Security for Health Data](/books/health-tech/health-records-security).
- **Revenue Cycle.** [The Revenue Cycle](/books/health-tech/revenue-cycle); [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits); [Claims](/books/health-tech/claims); [Clearinghouses](/books/health-tech/clearinghouses); [Remittance & Posting](/books/health-tech/remittance-and-payment-posting); [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals); [Prior Authorization](/books/health-tech/prior-authorization); [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience); [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation); and [Value-Based Care & Quality](/books/health-tech/value-based-care).
- **Practice Management and Patient Engagement.** The volume's deepest part: [Integrating with Practice Management Systems](/books/health-tech/pms-integration); [Scheduling & Online Booking](/books/health-tech/scheduling-and-online-booking); [Reminders, Confirmations & Recall](/books/health-tech/reminders-and-recall); [Phones for Practices](/books/health-tech/practice-phones); [Two-Way Texting & Messaging](/books/health-tech/patient-texting); [Digital Intake, Forms & Consent](/books/health-tech/digital-intake-and-forms); [Reviews & Reputation](/books/health-tech/reviews-and-reputation); [Payments in the Practice](/books/health-tech/patient-payments); [In-Office Membership Plans & Cash Pay](/books/health-tech/membership-plans); [Veterinary Practice](/books/health-tech/veterinary-practice); [Dental Practice](/books/health-tech/dental-practice); [Optometry, PT & Other Specialties](/books/health-tech/specialty-practices); [Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers); and [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai).
- **Care Delivery.** [Telehealth](/books/health-tech/telehealth); [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing); [Labs, Imaging & Diagnostics](/books/health-tech/labs-and-diagnostics); [Referrals & Care Coordination](/books/health-tech/referrals-and-care-coordination); [Hospitals & Health Systems](/books/health-tech/hospitals-and-health-systems); [Digital Health Apps & Devices](/books/health-tech/digital-health-and-devices); and [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access).
- **Payers.** [Payers & Plans](/books/health-tech/payers-and-plans); [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment); [Inside a Payer](/books/health-tech/payer-operations); and [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits).
- **Pharma and Clinical Trials.** [Clinical Trials](/books/health-tech/clinical-trials); [Trial Systems & 21 CFR Part 11](/books/health-tech/trial-systems-and-part-11); [Pharmacovigilance & Regulatory Submissions](/books/health-tech/pharmacovigilance-and-regulatory); and [Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial).
- **Beyond the US.** [Canada & the UK](/books/health-tech/canada-and-uk); and [The EU](/books/health-tech/eu-health-data).
- **Running the Platform.** [Health Tech Architecture](/books/health-tech/health-tech-architecture); [AI in Health Tech](/books/health-tech/ai-in-health-tech); [Operations, Support & Downtime](/books/health-tech/health-tech-operations); [Health Tech Metrics](/books/health-tech/health-tech-metrics); [Data Migration & Conversions](/books/health-tech/data-migration-and-conversions); and [De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use).
- **Reference.** A [Glossary](/books/health-tech/glossary) of every term the volume defines, grouped by part.

The volume covers what health care adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [HIPAA](/docs/compliance/hipaa), [Consumer Contact](/docs/compliance/consumer-contact), [Electronic Signatures](/docs/compliance/electronic-signatures), [Notifications](/docs/architecture/notifications), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Record Linkage](/docs/architecture/record-linkage), [Audit Trails](/docs/architecture/audit-trails), [Data Retention](/docs/architecture/data-retention), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Offline Sync](/docs/architecture/offline-sync), [Rules as Data](/docs/architecture/rules-as-data), [Support Access](/docs/security/support-access), [Authorization](/docs/security/authorization) and [Money & Amounts](/docs/payments/money). Other volumes own topics this one leans on: [Payments](/books/payments/payments-by-vertical#healthcare) for card rails, FSA and HSA cards and when a processor signs a BAA; [Hosting & Cloud](/books/hosting-and-cloud/texting-registration) for texting registration, voice platforms and compliance programs; [Field Operations](/books/field-operations/booking-appointments) for booking and reminders in service businesses; [Commerce](/books/commerce/subscription-commerce) for subscription billing; [Property Tech](/books/property-tech/senior-living#clinical-records-and-the-hipaa-boundary) for clinical records in senior living; and [User-Generated Platforms](/books/user-generated-platforms/services-marketplaces) for pet care marketplaces.

The volume is US-centric, with Canada, the UK and the EU where their rules bind. No single company is the model: the vocabulary and tables are the industry's, taken from the standards it shares (FHIR resources, X12 transactions, HIPAA's definitions) and benchmarked across EHRs (Epic, Oracle Health, MEDITECH, athenahealth, eClinicalWorks, NextGen, ModMed), practice management systems (Dentrix, Eaglesoft, Open Dental, Curve, Compulink, WebPT, Cornerstone, ezyVet, AVImark), patient engagement vendors (Weave, NexHealth, RevenueWell, Solutionreach, Podium, Phreesia, PetDesk), revenue cycle and clearinghouses (Availity, Waystar, Optum's Change Healthcare, Stedi) and the payers. A company's own product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Patients** | People receiving care; for a veterinarian, the animal, with the owner as the client who decides and pays | Appointments that hold, reminders that arrive, a bill they can understand, their records when they ask, and their information kept private |
| **Providers** | Practices (a dentist's office, an optometry clinic, a PT clinic, a vet hospital, a primary care group), dental service organizations and other groups, hospitals and health systems, labs, pharmacies, imaging centers | A schedule that's full, claims that get paid, a front desk that isn't drowning, and systems that keep working during a payer's or vendor's outage |
| **Practitioners** | The licensed people who deliver care: physicians, dentists, hygienists, optometrists, therapists, nurses, veterinarians and their technicians, each identified by a National Provider Identifier when they bill a health plan | Their schedule, their patients' charts, and orders and prescriptions that reach the pharmacy or lab |
| **Payers** | Medicare (federal, for people 65 and over and some disabled people), Medicaid and CHIP (state and federal, by income), commercial insurers (UnitedHealthcare, Elevance, Aetna, Cigna, the Blues), self-funded employer plans administered by those insurers or TPAs, dental and vision carriers, pet insurers | Clean claims in the standard format, the codes that justify them, eligibility checked before the visit, and prior authorization where they require it |
| **PBMs** | Pharmacy benefit managers that run drug benefits for payers and employers: formularies, pharmacy networks, rebates | Prescriptions priced and adjudicated in real time at the pharmacy counter |
| **Clearinghouses** | Companies that route transactions between providers and payers and check them on the way: Change Healthcare (Optum), Availity, Waystar, Trizetto, Office Ally, Claim.MD, Stedi, and dental clearinghouses such as Vyne Dental and DentalXChange | Payer connections, enrollment for each provider with each payer, and transactions that pass their edits |
| **Vendors** | EHR and PMS vendors, patient engagement platforms, revenue cycle companies, interoperability platforms (Redox, Health Gorilla, Particle), payment processors, telehealth platforms, the cloud and communications providers under them | Data access from the systems of record, a signed BAA with every customer and subcontractor, and a security review that passes |
| **Regulators** | HHS's Office for Civil Rights (HIPAA), CMS (Medicare, Medicaid and the HIPAA transaction and code set standards), ASTP/ONC (health IT certification and information blocking), the HHS Office of Inspector General (fraud and information blocking penalties), FDA (medical devices and software that is one), DEA (controlled substance prescribing), FTC (health apps outside HIPAA, advertising, competition), FCC (calls and texts), state boards, insurance departments and attorneys general | Records kept and produced, patients' rights honored, breaches reported on time, and claims that match the care |

Three splits shape the data model. **Organization versus location.** A dental service organization owns forty offices, each with its own address, hours, chairs, phone number and often its own billing NPI; a health system owns hospitals and clinics; a vet consolidator owns hundreds of hospitals under their original names. Schedules, phone numbers, fee schedules and where a claim says the service happened resolve at the location; ownership, contracts and the BAA resolve at the organization. **Patient versus guarantor.** The person treated is not always the person who pays: a child's parent, a dog's owner, a spouse who holds the insurance. A dental family account puts four patients under one guarantor's statement; a vet client has three pets. **Covered entity versus not.** A practice that bills a health plan electronically is a HIPAA covered entity, and its vendors handling that data are business associates ([Who It Applies To](/docs/compliance/hipaa#who-it-applies-to)); a cash-only vet clinic is not covered by HIPAA at all, though state veterinary records law applies, and a wellness app collecting data from a consumer directly answers to the FTC instead ([Selling Software into Health Care](/books/health-tech/vendor-compliance-posture)). One platform serves all three, which is why the model carries the organization's kind and the patient's kind rather than assuming.

## How the Money Flows

The US spent $5.3 trillion on health care in 2024, $15,474 per person and 18.0% of GDP, by CMS's National Health Expenditure accounts. By payer, private health insurance paid $1,644.6 billion (31%), Medicare $1,118.0 billion (21%), Medicaid $931.7 billion (18%) and patients out of pocket $556.6 billion (11%). By who ultimately financed it, the federal government carried 31%, households 28%, private businesses 18% and state and local governments 16%. Hospital care was $1,634.7 billion, physician and clinical services $1,109.7 billion and prescription drugs $467.0 billion. Medicaid and CHIP covered 73.2 million people in June 2026.

The parties and the payment model decide what the software has to record.

### Fee for service through insurance

The default for medicine, and for dental and vision where a plan pays. The provider bills each service at its charge, the payer prices it at the allowed amount its contract or fee schedule sets, and the patient owes the part the plan design assigns them. An illustrative commercial visit:

| Line | Amount | Who pays | Who receives | Recorded as |
| --- | --- | --- | --- | --- |
| Charge (the practice's fee) | $250 | | | A charge on the claim line |
| Contractual adjustment (charge minus allowed) | $90 | Nobody: the practice writes it off under its contract | | An adjustment on the remittance, group code CO |
| Allowed amount | $160 | Split between payer and patient | Practice | The payer's pricing |
| Deductible or coinsurance | $40 | Patient | Practice | Patient responsibility, group code PR, posted to the guarantor's ledger |
| Plan payment | $120 | Payer | Practice, by EFT with an 835 | A payment and remittance lines |

The claim goes out as an X12 837 (professional, institutional or dental), the payment comes back as an X12 835 remittance advice explaining every adjustment, and the patient's share is billed on a statement or collected at the front desk; HIPAA names those two transactions, the 270/271 eligibility inquiry, the 276/277 claim status, the 278 authorization and others as the standards health plans and providers must use ([The Life of a Visit](#the-life-of-a-visit) walks the loop). In Medicare's traditional program, the allowed amount comes from a published fee schedule; in commercial plans, from each payer's contract with the practice. A third of covered workers (33% in 2025) are in high-deductible plans with a savings option, so patient responsibility is often large and unknown until the claim adjudicates. Employers are the hidden payer: 67% of covered workers were in self-funded plans in 2025 by KFF's employer survey, meaning the employer bears the claims cost and an insurer or TPA administers it under federal ERISA rules rather than state insurance law, and the average family premium was $26,993.

### Value-based payment and capitation

Payers increasingly tie payment to cost and quality. Under the Medicare Shared Savings Program, groups of providers form accountable care organizations that stay paid fee for service but share in savings against a benchmark for their assigned Medicare patients; under capitation, a provider group or a dental HMO is paid a fixed amount per member per month whether the member comes in or not, and under Medicare Advantage the government pays a private plan per enrollee, adjusted for risk. The scale is large: CMS counts 511 Shared Savings Program ACOs serving 12.6 million people with traditional Medicare in 2026, and KFF counts 35.2 million people, 55% of eligible Medicare beneficiaries, in Medicare Advantage in 2026. For the software the twist is that the claim keeps flowing (it's how the payer learns what happened) while the money depends on attribution lists, quality measures and risk scores computed over a population. [Value-Based Care & Quality](/books/health-tech/value-based-care) covers the programs; the rule for the model is that a claim on a capitated plan is still a claim, priced at zero or a nominal amount, and its codes still matter.

### Cash pay, memberships and the patient-pay specialties

Dental, vision, veterinary and much of cosmetic, behavioral and direct primary care are paid by patients far more than medicine is. The ADA's Health Policy Institute put US dental spending at $189 billion in 2024, with private dental insurance and out-of-pocket payment the two large sources; dental plans pay against annual maximums that leave major work to the patient. Veterinary care is almost entirely client-paid: the North American Pet Health Insurance Association counted 7.6 million insured pets in North America at the end of 2025, and pet insurance reimburses the owner after the visit rather than paying the clinic. Practices answer with card-on-file, payment plans, third-party financing and in-office membership plans that bundle preventive care for a monthly fee ([In-Office Membership Plans & Cash Pay](/books/health-tech/membership-plans) covers the plans and the state insurance law on them). For the model, cash pay changes who is on the ledger, never whether there is one: every service is still a charge, every payment a payment, and an insured visit and a cash visit differ only in whether a claim sits between them.

### One rule for all of them

Every amount in health care is computed by someone else's rule (a fee schedule, a contract, a plan design, a membership's terms, a state's estimate law) and disputed later. My rule: store each charge, adjustment, payment and patient responsibility as its own row with the code that justified it, the rule or remittance that produced it and the party who pays, and compute every balance as a sum of entries on an append-only ledger. A balance stored without its entries can't be reposted when a payer recoups, explained to a patient disputing a statement, or produced for an auditor.

## The Life of a Visit

The same records move through every kind of practice; what differs is who pays and when the money arrives.

**A dental hygiene visit, insured.** Six months after the last cleaning, the practice management system's recall list puts the patient due; the patient engagement platform reading that list texts a recall reminder from the office's number, and the patient books online into an open hygiene slot on a chair, which writes back to the PMS as an appointment. Two days before, an eligibility check (270/271, or the payer's portal) confirms the dental plan is active and returns frequency limits and remaining maximum; the reminder asks the patient to confirm and fill in updated medical history on a form that writes back too. At check-in the front desk collects the estimated patient portion. The hygienist charts, the dentist examines, procedures are recorded with their CDT codes and, for restorative work, the tooth and surfaces; findings become a treatment plan the patient may accept today, later or never. The completed procedures become charges at the practice's fee, the dental claim goes out as an 837D through a dental clearinghouse with X-rays attached where the payer wants them, and weeks later the 835 posts the payment, the write-off to the PPO fee schedule and any patient balance, which a statement or a text-to-pay link collects. Unscheduled treatment goes on a follow-up list, and the patient goes back on recall.

**A primary care visit, insured.** The patient books, the practice verifies coverage and estimates the copay, and the visit is an encounter in the EHR: vitals as observations, a problem list of conditions coded in ICD-10-CM, a prescription sent through Surescripts as an NCPDP SCRIPT message, a lab order sent to a reference lab and its result returning as HL7 v2 or FHIR, and a note signed by the clinician. Coding turns the documentation into CPT and HCPCS procedure codes with modifiers and diagnosis pointers; the 837P goes out, the clearinghouse returns a 999 and a 277CA acknowledgment, the payer adjudicates, and the 835 explains each line with claim adjustment reason codes. A denial starts a correction or an appeal. If the patient asks for their records, the practice has a deadline under HIPAA's right of access; if it shares them, the Cures Act's information blocking rules apply.

**A veterinary wellness visit.** The client gets a vaccine reminder for their dog, books, and arrives; the patient is the dog, with its species, breed, weight and microchip number; the client is the owner, who consents to treatment and pays. The veterinarian examines, vaccinates (a rabies vaccination produces a certificate the state requires), and may prescribe a medication that an online pharmacy fills on the clinic's authorization. The invoice is paid at the counter; there is no claim, and if the owner has pet insurance they submit the invoice to their insurer themselves. HIPAA doesn't apply, but state law on veterinary records confidentiality does ([Veterinary Practice](/books/health-tech/veterinary-practice#not-hipaa-state-law-instead)).

**A telehealth visit.** The patient books a video visit; the encounter is virtual, the clinician must be licensed in the state where the patient is, the claim carries a place of service and modifiers that say it was telehealth, and the rules on prescribing controlled substances remotely and on what Medicare pays for at home depend on dated federal flexibilities ([Telehealth](/books/health-tech/telehealth#medicare-telehealth-status-as-of-october-2026)).

Across all of them, the appointment, the encounter, the procedure, the charge, the claim and the payment are separate records with separate lifecycles: an appointment can be cancelled without an encounter, an encounter can produce five procedures and one claim or one procedure and no claim, a claim can be paid, denied, corrected and paid again, and a payment can cover three claims or half of one. That is the split the data model is built on.

## The Core Data Model

Every system in this volume converges on the same concepts under different names: a Dentrix patient, an Epic patient, an ezyVet patient (the animal) and a FHIR `Patient` are all patients; an Open Dental guarantor, an ezyVet client and a FHIR `RelatedPerson` or the subscriber on a `Coverage` are guarantors; an operatory in a dental PMS, an exam room and a FHIR `Schedule` for a `Location` are schedules. FHIR gives the industry a shared vocabulary even where a system speaks HL7 v2, X12 or its own API, so the volume's tables are named for the records and mapped to the FHIR R4 resource each corresponds to, and every later chapter's How to Build It extends them rather than redefining them:

| Entity | Table | FHIR R4 resource | What it is |
| --- | --- | --- | --- |
| **organization** | `organizations` | Organization | A legal entity: a practice, a group, a DSO or MSO, a hospital or health system, a payer, a clearinghouse, a lab, a pharmacy, a vendor; `kind` says which |
| **location** | `locations` | Location | A place care is delivered or work is done: an office, a hospital, a lab, a virtual clinic |
| **practitioner** | `practitioners` | Practitioner | A licensed person who delivers care, with their NPI where they have one |
| **practitioner role** | `practitioner_roles` | PractitionerRole | A practitioner at an organization and location, with specialty and taxonomy code |
| **patient** | `patients` | Patient | The person receiving care, or for a veterinarian the animal |
| **patient identifier** | `patient_identifiers` | Patient.identifier | An MRN or chart number per organization, a payer member ID, a PMS or EHR ID, a microchip |
| **guarantor** | `guarantors` | RelatedPerson, Account.guarantor | Who is responsible for the bill: the patient, a parent, a spouse, a vet client |
| **contact** | `contacts` | ContactPoint (on Patient, RelatedPerson) | A phone number or email for a patient or guarantor, with what it may be used for |
| **payer** | `payers` | Organization (payer) | An insurer, government program or plan administrator that pays claims |
| **plan** | `plans` | InsurancePlan | A payer's product: a PPO, an HMO, Medicare Part B, a dental PPO, a vision plan |
| **coverage** | `coverages` | Coverage | A patient's insurance under a plan: member ID, subscriber, relationship, order |
| **schedule** | `schedules` | Schedule | A bookable resource's calendar: a practitioner, a chair or operatory, a room, a device |
| **appointment slot** | `appointment_slots` | Slot | A time on a schedule, free or busy |
| **appointment** | `appointments` | Appointment | A booking for a patient at a time with a practitioner and resources |
| **encounter** | `encounters` | Encounter | A visit that happened, in person or virtual, where care was delivered |
| **condition** | `conditions` | Condition | A diagnosis or problem, coded in ICD-10-CM or SNOMED CT |
| **observation** | `observations` | Observation | A measurement or finding: vitals, a lab result, a periodontal pocket depth |
| **procedure** | `procedures` | Procedure | A service planned or performed, with its CPT, CDT, HCPCS or local code |
| **medication request** | `medication_requests` | MedicationRequest | A prescription or medication order |
| **allergy** | `allergies` | AllergyIntolerance | An allergy or intolerance |
| **document** | `documents` | DocumentReference | A clinical note, a form, a consent, an insurance card image, an X-ray reference, a statement, kept as created |
| **order** | `orders` | ServiceRequest | A lab, imaging, referral or procedure order sent to someone else to perform |
| **charge** | `charges` | ChargeItem | A billable line from a procedure, at the practice's fee |
| **claim** | `claims` | Claim | A bill to a payer for one patient's services under one coverage |
| **claim line** | `claim_lines` | Claim.item | One service on a claim, tied to its charge |
| **remittance** | `remittances` | PaymentReconciliation | A payer's payment and its explanation (an 835), across claims |
| **remittance line** | `remittance_lines` | ClaimResponse, ExplanationOfBenefit | What the payer did with one claim line: allowed, paid, adjusted, with CARC and RARC codes |
| **patient statement** | `patient_statements` | Invoice | A bill to a guarantor for their balance |
| **payment** | `payments` | PaymentNotice, PaymentReconciliation | Money received from a patient, guarantor or payer |
| **ledger entry** | `ledger_entries` | Account (balances) | An append-only posting to a guarantor's and patient's account |
| **consent** | `consents` | Consent | A permission given or refused: to treat, to bill, to text, to disclose, to a proxy |
| **disclosure** | `disclosures` | AuditEvent (disclosure) | A HIPAA-accountable disclosure of a patient's information to someone outside the practice |
| **audit event** | `audit_events` | AuditEvent | Who read, changed, exported or disclosed which patient's record, when and why |
| **communication** | `communications` | Communication | Every message or call to or from a patient or guarantor |
| **integration** | `integrations` | Endpoint | A connection to an external system: a PMS, an EHR, a clearinghouse, a lab |
| **sync cursor** | `sync_cursors` | | How far a sync has read or written on an integration, per resource |

Eight splits matter in every chapter:

- **Organization versus location.** Ownership, contracts, BAAs and tenancy resolve at the organization; schedules, phone numbers, hours, place of service and time zone at the location. A DSO is an organization whose children are practices whose locations are offices; a payer is an organization too, which is how a payer and a provider can both be customers of a clearinghouse.
- **Practitioner versus practitioner role.** A dentist who works Mondays at one office and Thursdays at another, or a physician employed by a group and credentialed at a hospital, is one practitioner with several roles. The NPI belongs to the practitioner; the specialty, taxonomy code, location and schedule belong to the role, and a claim names the rendering role.
- **Patient versus guarantor versus subscriber.** The patient is treated, the guarantor gets the statement, the subscriber holds the insurance. They are often the same person and frequently aren't: a child is the patient, a parent the guarantor, the other parent the subscriber on the dental plan. In veterinary practice the patient is an animal and the client is the guarantor.
- **Appointment versus encounter.** The appointment is the plan (booked, confirmed, cancelled, no-show); the encounter is what happened. A walk-in has an encounter without an appointment; a no-show has an appointment without one. Reminders and recall run on appointments; claims and the clinical record run on encounters.
- **Procedure versus charge versus claim line.** The procedure is clinical (what was done, to which tooth, by whom); the charge is financial (the fee for it, to whom it's billed); the claim line is what one payer was asked to pay. A treatment-planned procedure has no charge yet; a charge may go to two payers in turn (primary, then secondary) as two claim lines; a cash patient's charge never reaches a claim.
- **Claim versus remittance.** A claim is a request; a remittance is a payer's answer and payment, arriving later, often for many claims at once, often paying less than asked or reversing an earlier payment. They meet at the remittance line, never by overwriting the claim.
- **Ledger entries versus balances.** Every charge, payment, adjustment, write-off and refund is an entry; a balance is a sum. Recoupments, transfers between guarantors and reposted remittances are new entries, never edits.
- **Clinical record versus engagement data.** Conditions, observations, medications and notes are the legal medical record, owned by the EHR or PMS and amended, never overwritten; appointments, contacts, communications and consents are what a patient engagement platform mostly works with. Most vendors in Part 5 hold the second and only read the first, and the line between them is a minimum-necessary decision ([The Three Rules](/docs/compliance/hipaa#the-three-rules)).

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer cents ([Money & Amounts](/docs/payments/money)). Every row that holds a practice's data carries the `organization_id` of the tenant that owns it ([`tenant_id` Everywhere](/docs/architecture/multi-tenancy#tenant-id-everywhere)); columns each chapter owns (tooth and surface, fee schedules, payer IDs per clearinghouse, recall intervals) are added there:

```sql
CREATE TABLE organizations (             -- a legal entity in health care
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_id     UUID REFERENCES organizations (id),  -- a practice under a DSO, a clinic under a system
  kind          TEXT NOT NULL CHECK (kind IN ('practice', 'group', 'dso', 'mso', 'health_system',
                  'hospital', 'payer', 'clearinghouse', 'lab', 'pharmacy', 'vendor', 'other')),
  legal_name    TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  npi           CHAR(10),                -- type 2 (organization) NPI, if it bills
  tin_ref       TEXT,                    -- tax ID, held in the secrets vault, not in the row
  hipaa_role    TEXT NOT NULL CHECK (hipaa_role IN ('covered_entity', 'business_associate',
                  'hybrid', 'not_covered')),  -- a cash-only vet clinic is 'not_covered'
  status        TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (                 -- where care is delivered
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('office', 'hospital', 'lab', 'pharmacy',
                     'imaging_center', 'virtual', 'mobile')),
  name             TEXT NOT NULL,
  npi              CHAR(10),             -- some groups bill each location under its own NPI
  address_id       UUID,                 -- the playbook's addresses table; null for 'virtual'
  time_zone        TEXT NOT NULL,        -- IANA; reminders and quiet hours resolve here
  country          CHAR(2) NOT NULL,
  subdivision      TEXT,                 -- ISO 3166-2; state law resolves here
  status           TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind = 'virtual' OR address_id IS NOT NULL)
);

CREATE TABLE practitioners (             -- a licensed person who delivers care
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the tenant keeping this record
  npi              CHAR(10),             -- type 1 NPI; null for veterinarians, who have none
  given_name       TEXT NOT NULL,
  family_name      TEXT NOT NULL,
  credentials      TEXT,                 -- 'DDS', 'RDH', 'MD', 'OD', 'DPT', 'DVM'
  status           TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  external_refs    JSONB NOT NULL DEFAULT '{}',  -- PMS and EHR provider IDs, keyed by integration
  UNIQUE (organization_id, npi)
);

CREATE TABLE practitioner_roles (        -- a practitioner at an organization and location
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  practitioner_id  UUID NOT NULL REFERENCES practitioners (id),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  location_id      UUID REFERENCES locations (id),  -- null: all of the organization's locations
  role             TEXT NOT NULL CHECK (role IN ('physician', 'dentist', 'hygienist',
                     'dental_assistant', 'optometrist', 'therapist', 'nurse', 'nurse_practitioner',
                     'physician_assistant', 'veterinarian', 'vet_technician', 'other')),
  taxonomy_code    CHAR(10),             -- NUCC provider taxonomy, e.g. a general dentist
  specialty        TEXT,
  valid_during     DATERANGE NOT NULL,
  accepts_new_patients BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE patients (                  -- the person, or animal, receiving care
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),  -- whose chart this is
  kind                TEXT NOT NULL CHECK (kind IN ('human', 'animal')),
  given_name          TEXT NOT NULL,     -- for an animal, its name
  family_name         TEXT,              -- for an animal, usually the client's surname
  preferred_name      TEXT,
  birth_date          DATE,
  administrative_sex  TEXT CHECK (administrative_sex IN ('female', 'male', 'other', 'unknown')),
  species             TEXT,              -- animals only: 'canine', 'feline', 'equine'
  breed               TEXT,
  guarantor_id        UUID,              -- guarantors, below: who is billed by default
  primary_location_id UUID REFERENCES locations (id),
  preferred_language  TEXT,              -- BCP 47; forms and messages resolve from it
  deceased_at         TIMESTAMPTZ,       -- stops reminders and recall immediately
  status              TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'merged')),
  merged_into_id      UUID REFERENCES patients (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'animal') = (species IS NOT NULL)),
  CHECK ((status = 'merged') = (merged_into_id IS NOT NULL))
);

CREATE TABLE patient_identifiers (       -- every ID a patient is known by
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  system              TEXT NOT NULL,     -- 'mrn', 'chart_number', 'payer_member', 'pms', 'ehr',
                                         -- 'microchip', 'rabies_tag'
  issuer              TEXT NOT NULL,     -- the organization, payer or integration that assigned it
  value               TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL DEFAULT DATERANGE(CURRENT_DATE, NULL),
  UNIQUE (system, issuer, value)         -- the same MRN can't point at two patients
);

CREATE TABLE guarantors (                -- who is responsible for the bill
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID REFERENCES patients (id),  -- set when the guarantor is also a patient
  kind             TEXT NOT NULL CHECK (kind IN ('person', 'organization')),  -- a shelter, an employer
  name             TEXT NOT NULL,
  birth_date       DATE,
  address_id       UUID,
  status           TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'collections')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE patients ADD FOREIGN KEY (guarantor_id) REFERENCES guarantors (id);

CREATE TABLE contacts (                  -- a phone number or email, and what it may be used for
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID REFERENCES patients (id),
  guarantor_id     UUID REFERENCES guarantors (id),
  kind             TEXT NOT NULL CHECK (kind IN ('mobile', 'landline', 'email')),
  value            TEXT NOT NULL,        -- E.164 for phones, lowercased for email
  is_primary       BOOLEAN NOT NULL DEFAULT FALSE,
  text_ok          BOOLEAN NOT NULL DEFAULT FALSE,  -- cached from consents; the ledger decides
  voice_ok         BOOLEAN NOT NULL DEFAULT FALSE,
  email_ok         BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  status           TEXT NOT NULL CHECK (status IN ('active', 'invalid', 'removed')),
  CHECK (patient_id IS NOT NULL OR guarantor_id IS NOT NULL)
);

CREATE TABLE payers (                    -- who pays claims
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID REFERENCES organizations (id),  -- the payer as an organization, if modeled
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('commercial', 'medicare', 'medicare_advantage',
                     'medicaid', 'medicaid_managed_care', 'tricare', 'va', 'workers_comp', 'auto',
                     'dental', 'vision', 'pet_insurance', 'other')),
  status           TEXT NOT NULL CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE plans (                     -- a payer's product
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_id      UUID NOT NULL REFERENCES payers (id),
  name          TEXT NOT NULL,
  product_type  TEXT NOT NULL,           -- 'ppo', 'hmo', 'epo', 'hdhp', 'dppo', 'dhmo', 'part_b'
  funding       TEXT CHECK (funding IN ('fully_insured', 'self_funded', 'government')),
  group_number  TEXT,
  employer_name TEXT
);

CREATE TABLE coverages (                 -- a patient's insurance under a plan
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id            UUID NOT NULL REFERENCES patients (id),
  plan_id               UUID NOT NULL REFERENCES plans (id),
  member_id             TEXT NOT NULL,
  subscriber_name       TEXT NOT NULL,
  subscriber_birth_date DATE,
  relationship          TEXT NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'other')),
  priority              SMALLINT NOT NULL CHECK (priority BETWEEN 1 AND 3),  -- primary, secondary
  valid_during          DATERANGE NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'entered_in_error')),
  verified_at           TIMESTAMPTZ,      -- the last eligibility response that confirmed it
  card_document_id      UUID              -- documents, below: the card images
);

CREATE TABLE schedules (                 -- a bookable resource's calendar
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id          UUID NOT NULL REFERENCES locations (id),
  resource_kind        TEXT NOT NULL CHECK (resource_kind IN ('practitioner', 'operatory', 'room',
                         'equipment')),
  practitioner_role_id UUID REFERENCES practitioner_roles (id),
  name                 TEXT NOT NULL,    -- 'Op 3', 'Hygiene 1', 'Dr. Patel'
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK ((resource_kind = 'practitioner') = (practitioner_role_id IS NOT NULL))
);

CREATE TABLE appointment_slots (         -- a time on a schedule
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  schedule_id  UUID NOT NULL REFERENCES schedules (id),
  during       TSTZRANGE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('free', 'busy', 'busy_tentative', 'blocked')),
  EXCLUDE USING gist (schedule_id WITH =, during WITH &&)  -- needs btree_gist
);

CREATE TABLE appointments (              -- a booking
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id          UUID NOT NULL REFERENCES locations (id),
  patient_id           UUID REFERENCES patients (id),  -- null: a new patient not yet created
  practitioner_role_id UUID REFERENCES practitioner_roles (id),
  schedule_id          UUID REFERENCES schedules (id),  -- the chair or room
  during               TSTZRANGE NOT NULL,
  appointment_type     TEXT NOT NULL,    -- 'new_patient_exam', 'hygiene', 'wellness', 'follow_up'
  status               TEXT NOT NULL CHECK (status IN ('proposed', 'booked', 'confirmed',
                         'arrived', 'checked_in', 'fulfilled', 'cancelled', 'no_show',
                         'entered_in_error')),
  source               TEXT NOT NULL CHECK (source IN ('front_desk', 'online', 'phone', 'ai_agent',
                         'sync')),
  external_ref         TEXT,             -- the PMS's appointment ID
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE encounters (                -- a visit where care was delivered
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id          UUID NOT NULL REFERENCES locations (id),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  appointment_id       UUID REFERENCES appointments (id),  -- null: a walk-in
  practitioner_role_id UUID REFERENCES practitioner_roles (id),
  class                TEXT NOT NULL CHECK (class IN ('ambulatory', 'virtual', 'home',
                         'emergency', 'inpatient')),
  status               TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'finished',
                         'cancelled', 'entered_in_error')),
  period               TSTZRANGE NOT NULL
);

CREATE TABLE conditions (                -- a diagnosis or problem
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id    UUID NOT NULL REFERENCES patients (id),
  encounter_id  UUID REFERENCES encounters (id),
  code_system   TEXT NOT NULL CHECK (code_system IN ('icd10cm', 'snomed', 'local')),
  code          TEXT NOT NULL,
  display       TEXT NOT NULL,           -- snapshot of the code's text as recorded
  clinical_status TEXT NOT NULL CHECK (clinical_status IN ('active', 'recurrence', 'inactive',
                  'resolved')),
  onset_on      DATE,
  abated_on     DATE,
  recorded_by   UUID REFERENCES practitioner_roles (id),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE observations (              -- a measurement or finding
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id    UUID NOT NULL REFERENCES patients (id),
  encounter_id  UUID REFERENCES encounters (id),
  code_system   TEXT NOT NULL CHECK (code_system IN ('loinc', 'snomed', 'local')),
  code          TEXT NOT NULL,
  value_quantity NUMERIC,
  unit          TEXT,                    -- UCUM, e.g. 'mm[Hg]', 'kg'
  value_text    TEXT,
  effective_at  TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('preliminary', 'final', 'amended',
                  'entered_in_error'))
);

CREATE TABLE procedures (                -- a service planned or performed
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  encounter_id         UUID REFERENCES encounters (id),  -- null while only treatment-planned
  practitioner_role_id UUID REFERENCES practitioner_roles (id),
  code_system          TEXT NOT NULL CHECK (code_system IN ('cpt', 'hcpcs', 'cdt', 'icd10pcs',
                         'snomed', 'local')),
  code                 TEXT NOT NULL,
  modifiers            TEXT[] NOT NULL DEFAULT '{}',
  body_site            TEXT,             -- generic; dental tooth and surface are added later
  status               TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed',
                         'not_done', 'entered_in_error')),
  performed_on         DATE,
  CHECK ((status = 'completed') = (performed_on IS NOT NULL))
);

CREATE TABLE medication_requests (       -- a prescription or medication order
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  encounter_id         UUID REFERENCES encounters (id),
  prescriber_role_id   UUID NOT NULL REFERENCES practitioner_roles (id),
  rxnorm_code          TEXT,
  ndc                  TEXT,
  display              TEXT NOT NULL,
  dosage_text          TEXT NOT NULL,    -- the sig, as written
  quantity             NUMERIC,
  refills              SMALLINT NOT NULL DEFAULT 0,
  status               TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed',
                         'cancelled', 'stopped', 'entered_in_error')),
  authored_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE allergies (                 -- an allergy or intolerance
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id      UUID NOT NULL REFERENCES patients (id),
  code_system     TEXT NOT NULL CHECK (code_system IN ('rxnorm', 'snomed', 'local')),
  code            TEXT,
  display         TEXT NOT NULL,         -- 'penicillin', 'latex'; free text where uncoded
  category        TEXT CHECK (category IN ('medication', 'food', 'environment', 'biologic')),
  criticality     TEXT CHECK (criticality IN ('low', 'high', 'unable_to_assess')),
  reaction_text   TEXT,
  clinical_status TEXT NOT NULL CHECK (clinical_status IN ('active', 'inactive', 'resolved')),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (                 -- notes, forms, images, kept as created
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  patient_id       UUID REFERENCES patients (id),
  encounter_id     UUID REFERENCES encounters (id),
  kind             TEXT NOT NULL CHECK (kind IN ('clinical_note', 'form', 'consent_form',
                     'insurance_card', 'identity_document', 'image', 'lab_report',
                     'referral_letter', 'statement', 'x12', 'correspondence', 'other')),
  mime_type        TEXT NOT NULL,
  content_ref      TEXT NOT NULL,        -- object storage key, encrypted at rest
  content_sha256   TEXT NOT NULL,
  supersedes_id    UUID REFERENCES documents (id),  -- an amendment points at what it amends
  status           TEXT NOT NULL CHECK (status IN ('current', 'superseded', 'entered_in_error')),
  authored_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE coverages ADD FOREIGN KEY (card_document_id) REFERENCES documents (id);

CREATE TABLE orders (                    -- a service someone else is asked to perform
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  patient_id            UUID NOT NULL REFERENCES patients (id),
  encounter_id          UUID REFERENCES encounters (id),
  requester_role_id     UUID NOT NULL REFERENCES practitioner_roles (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('lab', 'imaging', 'referral', 'procedure',
                          'equipment')),
  code_system           TEXT,            -- 'loinc', 'cpt', 'snomed', 'local'
  code                  TEXT,
  display               TEXT NOT NULL,
  performer_org_id      UUID REFERENCES organizations (id),  -- the lab, imaging center, specialist
  priority              TEXT NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent',
                          'asap', 'stat')),
  status                TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'revoked',
                          'entered_in_error')),
  authored_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE charges (                   -- a billable line, at the practice's fee
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  patient_id           UUID NOT NULL REFERENCES patients (id),
  guarantor_id         UUID NOT NULL REFERENCES guarantors (id),
  procedure_id         UUID REFERENCES procedures (id),  -- null: a product sold, a missed-appt fee
  encounter_id         UUID REFERENCES encounters (id),
  rendering_role_id    UUID REFERENCES practitioner_roles (id),
  code_system          TEXT NOT NULL,
  code                 TEXT NOT NULL,    -- snapshot from the procedure
  modifiers            TEXT[] NOT NULL DEFAULT '{}',
  units                NUMERIC(8, 2) NOT NULL DEFAULT 1 CHECK (units > 0),
  fee                  BIGINT NOT NULL CHECK (fee >= 0),  -- the practice's full fee, cents
  service_on           DATE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('pending', 'billed', 'self_pay', 'on_hold',
                         'void')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE claims (                    -- a bill to one payer, for one patient, under one coverage
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id        UUID NOT NULL REFERENCES organizations (id),
  patient_id             UUID NOT NULL REFERENCES patients (id),
  coverage_id            UUID NOT NULL REFERENCES coverages (id),
  billing_location_id    UUID NOT NULL REFERENCES locations (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('professional', 'institutional', 'dental')),
  frequency              TEXT NOT NULL DEFAULT 'original' CHECK (frequency IN ('original',
                           'replacement', 'void')),
  replaces_claim_id      UUID REFERENCES claims (id),
  patient_control_number TEXT NOT NULL,  -- the practice's ID, echoed back on every response
  payer_claim_number     TEXT,           -- the payer's ID, from the first acknowledgment
  total_charge           BIGINT NOT NULL CHECK (total_charge >= 0),
  status                 TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'submitted',
                           'accepted', 'rejected', 'adjudicated', 'closed', 'void')),
  submitted_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, patient_control_number),
  CHECK ((frequency = 'original') = (replaces_claim_id IS NULL))
);

CREATE TABLE claim_lines (               -- one service on a claim
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id             UUID NOT NULL REFERENCES claims (id),
  charge_id            UUID NOT NULL REFERENCES charges (id),
  line_number          SMALLINT NOT NULL,
  code                 TEXT NOT NULL,
  modifiers            TEXT[] NOT NULL DEFAULT '{}',
  units                NUMERIC(8, 2) NOT NULL,
  charge_amount        BIGINT NOT NULL CHECK (charge_amount >= 0),
  diagnosis_codes      TEXT[] NOT NULL DEFAULT '{}',  -- ICD-10-CM, in pointer order
  UNIQUE (claim_id, line_number)
);

CREATE TABLE remittances (               -- a payer's payment and explanation, across claims
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  payer_id         UUID NOT NULL REFERENCES payers (id),
  trace_number     TEXT NOT NULL,        -- the 835's TRN02: the check or EFT trace
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('ach', 'check', 'virtual_card',
                     'none')),          -- 'none': an all-denial or zero-pay remittance
  payment_amount   BIGINT NOT NULL,
  paid_on          DATE,
  document_id      UUID NOT NULL REFERENCES documents (id),  -- the 835 as received
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payer_id, trace_number)
);

CREATE TABLE remittance_lines (          -- what the payer did with one claim line
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  remittance_id          UUID NOT NULL REFERENCES remittances (id),
  claim_id               UUID REFERENCES claims (id),       -- null until matched
  claim_line_id          UUID REFERENCES claim_lines (id),
  payer_claim_number     TEXT NOT NULL,
  charge_amount          BIGINT NOT NULL,
  allowed_amount         BIGINT,
  paid_amount            BIGINT NOT NULL,   -- negative on a reversal
  patient_responsibility BIGINT NOT NULL DEFAULT 0,
  adjustments            JSONB NOT NULL DEFAULT '[]',  -- [{"group": "CO", "carc": "45", "amount": 9000}]
  remark_codes           TEXT[] NOT NULL DEFAULT '{}',  -- RARCs
  claim_status_code      TEXT NOT NULL      -- processed as primary, secondary, denied, reversed
);

CREATE TABLE patient_statements (        -- a bill to a guarantor
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  guarantor_id     UUID NOT NULL REFERENCES guarantors (id),
  statement_on     DATE NOT NULL,
  balance_due      BIGINT NOT NULL,      -- computed from ledger_entries at statement time
  due_on           DATE NOT NULL,
  delivery         TEXT NOT NULL CHECK (delivery IN ('mail', 'email', 'text', 'portal')),
  document_id      UUID REFERENCES documents (id),  -- the statement as sent
  status           TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'returned', 'superseded'))
);

CREATE TABLE payments (                  -- money received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  source           TEXT NOT NULL CHECK (source IN ('patient', 'guarantor', 'payer', 'financing')),
  guarantor_id     UUID REFERENCES guarantors (id),
  remittance_id    UUID REFERENCES remittances (id),
  method           TEXT NOT NULL CHECK (method IN ('card', 'hsa_fsa_card', 'ach', 'cash', 'check',
                     'eft', 'virtual_card', 'financing')),
  amount           BIGINT NOT NULL CHECK (amount > 0),
  processor_ref    TEXT,                 -- pointer into the Payments volume's records
  status           TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded',
                     'voided')),
  received_at      TIMESTAMPTZ NOT NULL,
  CHECK ((source = 'payer') = (remittance_id IS NOT NULL))
);

CREATE TABLE ledger_entries (            -- append-only postings; balances are sums
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  guarantor_id        UUID NOT NULL REFERENCES guarantors (id),
  patient_id          UUID REFERENCES patients (id),
  kind                TEXT NOT NULL CHECK (kind IN ('charge', 'patient_payment',
                        'insurance_payment', 'contractual_adjustment', 'adjustment', 'write_off',
                        'refund', 'transfer', 'recoupment')),
  amount              BIGINT NOT NULL,   -- positive raises the balance, negative lowers it
  charge_id           UUID REFERENCES charges (id),
  payment_id          UUID REFERENCES payments (id),
  remittance_line_id  UUID REFERENCES remittance_lines (id),
  reverses_id         UUID REFERENCES ledger_entries (id),
  posted_on           DATE NOT NULL,     -- the accounting date; closed periods don't move
  created_by          TEXT NOT NULL,     -- a typed actor: user, sync, auto-posting
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE disclosure_texts (          -- the playbook's versioned disclosures table, renamed here
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL,         -- 'notice_of_privacy_practices', 'texting_consent',
                                         -- 'financial_policy', 'telehealth_consent'
  locale          TEXT NOT NULL,
  version         TEXT NOT NULL,
  content_sha256  TEXT NOT NULL,
  storage_key     TEXT NOT NULL,
  effective_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (kind, locale, version)
);

CREATE TABLE consents (                  -- a permission given or refused
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID REFERENCES patients (id),
  guarantor_id        UUID REFERENCES guarantors (id),
  contact_id          UUID REFERENCES contacts (id),  -- for a texting or calling consent
  kind                TEXT NOT NULL CHECK (kind IN ('treatment', 'financial',
                        'npp_acknowledgment', 'hipaa_authorization', 'texting', 'calling',
                        'email', 'marketing', 'telehealth', 'recording', 'proxy_access',
                        'sud_part2', 'research')),
  decision            TEXT NOT NULL CHECK (decision IN ('permit', 'deny')),
  scope               JSONB NOT NULL DEFAULT '{}',  -- recipients, purposes, data classes, expiry
  granted_by          TEXT NOT NULL CHECK (granted_by IN ('patient', 'representative', 'owner')),
  representative_name TEXT,
  disclosure_text_id  UUID REFERENCES disclosure_texts (id),  -- the exact wording shown
  document_id         UUID REFERENCES documents (id),         -- the signed form, if any
  captured_via        TEXT NOT NULL CHECK (captured_via IN ('paper', 'web_form', 'tablet', 'sms',
                        'phone', 'portal', 'sync')),
  effective_at        TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  CHECK (patient_id IS NOT NULL OR guarantor_id IS NOT NULL)
);

CREATE TABLE disclosures (               -- HIPAA accounting of disclosures (45 CFR 164.528)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  patient_id          UUID NOT NULL REFERENCES patients (id),
  recipient_name      TEXT NOT NULL,
  recipient_address   TEXT,              -- if known
  description         TEXT NOT NULL,     -- what was disclosed, briefly
  purpose             TEXT NOT NULL,     -- the reason, or a reference to the written request
  basis               TEXT NOT NULL CHECK (basis IN ('required_by_law', 'public_health',
                        'abuse_report', 'health_oversight', 'judicial', 'law_enforcement',
                        'decedent', 'research', 'serious_threat', 'workers_comp', 'other')),
  request_document_id UUID REFERENCES documents (id),
  series_id           UUID,              -- repeated disclosures to one recipient for one purpose
  disclosed_at        TIMESTAMPTZ NOT NULL,
  recorded_by         TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_events (              -- append-only; reads matter as much as writes
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_kind       TEXT NOT NULL CHECK (actor_kind IN ('user', 'patient', 'representative',
                     'support', 'integration', 'service', 'ai_agent')),
  actor_id         TEXT NOT NULL,
  action           TEXT NOT NULL CHECK (action IN ('read', 'create', 'update', 'delete', 'export',
                     'print', 'disclose', 'merge', 'break_glass', 'sign_in')),
  entity_type      TEXT NOT NULL,
  entity_id        UUID,
  patient_id       UUID,                 -- the subject, so a patient's access report is one query
  purpose          TEXT CHECK (purpose IN ('treatment', 'payment', 'operations',
                     'patient_request', 'support', 'legal')),
  request_id       TEXT,
  source_ip        INET,
  detail           JSONB NOT NULL DEFAULT '{}',
  prev_hash        TEXT                  -- hash chain for tamper evidence
);

CREATE TABLE communications (            -- every message or call to or from a patient
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  location_id         UUID REFERENCES locations (id),  -- whose number it came from
  patient_id          UUID REFERENCES patients (id),
  guarantor_id        UUID REFERENCES guarantors (id),
  contact_id          UUID REFERENCES contacts (id),
  channel             TEXT NOT NULL CHECK (channel IN ('sms', 'mms', 'voice', 'email', 'portal',
                        'fax', 'letter', 'push')),
  direction           TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  purpose             TEXT NOT NULL CHECK (purpose IN ('appointment_reminder', 'confirmation',
                        'recall', 'billing', 'intake', 'clinical', 'review_request', 'marketing',
                        'general')),
  appointment_id      UUID REFERENCES appointments (id),
  body_ref            TEXT,              -- content in the PHI store; never in this row's logs
  contains_phi        BOOLEAN NOT NULL,
  provider_message_id TEXT,              -- the carrier's or email provider's ID
  status              TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed',
                        'received', 'blocked')),  -- 'blocked': stopped by consent or quiet hours
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE integrations (              -- a connection to an external system
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  location_id      UUID REFERENCES locations (id),  -- an on-prem PMS serves one office, often
  system_kind      TEXT NOT NULL CHECK (system_kind IN ('pms', 'ehr', 'clearinghouse', 'payer',
                     'lab', 'pharmacy', 'imaging', 'hie', 'payments', 'phone', 'other')),
  vendor           TEXT NOT NULL,        -- 'open_dental', 'dentrix', 'ezyvet', 'athenahealth', 'epic'
  method           TEXT NOT NULL CHECK (method IN ('sync_agent', 'vendor_api', 'fhir', 'hl7v2',
                     'x12', 'sftp', 'portal')),
  credentials_ref  TEXT,                 -- the secrets vault, never the row
  status           TEXT NOT NULL CHECK (status IN ('pending', 'active', 'degraded',
                     'disconnected', 'revoked')),
  last_success_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sync_cursors (              -- how far each sync has read or written
  integration_id  UUID NOT NULL REFERENCES integrations (id),
  resource        TEXT NOT NULL,         -- 'patients', 'appointments', 'procedures', 'ledger'
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  cursor          TEXT,                  -- the source's own position: a timestamp, an ID, a token
  high_water_at   TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (integration_id, resource, direction)
);
```

Design notes:

- **The organization is the tenant.** A practice, a group or a DSO is the unit of scope; every patient, charge and message carries its `organization_id`, and a DSO sees its practices through `parent_id` exactly as [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) describes. Patients belong to the organization whose chart they are in. The same person treated by two unrelated practices is two patient rows, linked if at all by matching ([Record Linkage](/docs/architecture/record-linkage)), never by a global person table both tenants can read.
- **The PMS or EHR is usually the system of record.** A patient engagement vendor holds copies of patients, appointments and balances synced from the practice's system, and writes back only what that system's API allows. `external_ref`, `external_refs` and `patient_identifiers` carry the source's IDs, `integrations` and `sync_cursors` carry where each sync stands, and [Integrating with Practice Management Systems](/books/health-tech/pms-integration) builds the rest. A vendor that is the system of record (a cloud PMS) uses the same tables with no inbound sync.
- **`entered_in_error` is a status, not a delete.** Clinical and financial records are amended or marked in error and kept, because the legal medical record and the ledger must show what was believed at the time. Deletion is for data the retention schedule says has expired ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).
- **Codes are snapshots.** A condition, procedure, charge and claim line store the code and, where shown, its display text as recorded, because code sets are versioned each year and a claim from last year must reproduce exactly. [Terminologies & Code Sets](/books/health-tech/terminology-and-coding) owns the code system tables these point at, and the licensed descriptors (CPT's from the AMA, CDT's from the ADA) are loaded under license, not typed into fixtures.
- **Two tables called disclosures.** The playbook's `disclosures` table holds versioned legal text shown to a person (renewal terms, messaging consent wording). In this volume `disclosures` is the HIPAA accounting of disclosures, the list a patient may request of who outside the practice received their information for purposes other than treatment, payment and operations, going back six years. The playbook's table is kept with the same columns under the name `disclosure_texts`, and consents point at it.
- **Consent is a ledger; contact flags are a cache.** `contacts.text_ok` lets a sender check quickly; the `consents` row with its wording and capture channel is the evidence, and a revocation is a new row that clears the flag ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)).
- **Money is the Payments model.** `payments.processor_ref` points at the [Payments](/books/payments/card-payments#the-core-data-model) volume's records; a refund, a dispute or a payout is that volume's object. What this volume adds is posting: every payment becomes ledger entries against charges, and every remittance line becomes an insurance payment, a contractual adjustment and a patient responsibility.
- **Emit life-cycle events.** `appointment.booked`, `appointment.cancelled`, `encounter.finished`, `charge.created`, `claim.submitted`, `remittance.received`, `ledger_entry.posted`, `consent.revoked` and `patient.merged` are what reminders, recall, statements, analytics and integrations subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine. The tables each one adds:

| Chapter | Extends | Adds |
| --- | --- | --- |
| [The Health Tech Landscape](/books/health-tech/health-tech-landscape#how-to-build-it) | `organizations`, `integrations` | `health_it_products` |
| [The Practice Business](/books/health-tech/practice-business#how-to-build-it) | `organizations`, `charges`, `ledger_entries` | `organization_affiliations`, `fee_schedules`, `fee_schedule_items` |
| [Business Models for Health Software](/books/health-tech/health-tech-business-models#how-to-build-it) | `organizations`, `locations`, `payments` | `vendor_contracts`, `contract_fees`, `usage_records` |
| [Selling Software into Health Care](/books/health-tech/vendor-compliance-posture#how-to-build-it) | `organizations`, `integrations` | `business_associate_agreements`, `phi_systems`, `security_reviews`, `assurance_reports` |
| [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data) | `conditions`, `observations`, `procedures`, `documents` | `clinical_notes`, `tooth_findings`, `amendment_requests`, `record_retention_rules` |
| [HL7 v2 & Interfaces](/books/health-tech/hl7-v2) | `integrations` | `interface_channels`, `hl7_messages`, `hl7_acks`, `hl7_message_effects` |
| [FHIR](/books/health-tech/fhir) | every clinical table | `fhir_resource_versions`, `bulk_export_jobs`, `fhir_subscriptions` |
| [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir) | `integrations` | `smart_apps`, `oauth_grants`, `smart_launches` |
| [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda) | `documents` | `ccda_sections`, `document_filing_history`, `direct_addresses`, `direct_messages`, `imaging_studies` |
| [Networks & Exchange](/books/health-tech/health-information-exchange) | `integrations`, `patient_identifiers` | `network_participations`, `exchange_queries`, `record_locations`, `exchange_retrievals`, `exchange_inbound_requests` |
| [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity) | `patients`, `patient_identifiers` | `match_candidates`, `patient_links`, `identity_verifications` |
| [Terminologies & Code Sets](/books/health-tech/terminology-and-coding) | every coded column | `code_systems`, `concepts`, `value_sets`, `value_set_members`, `concept_maps` |
| [HIPAA in Practice](/books/health-tech/hipaa-in-practice) | `disclosures`, `audit_events`, `consents` | `access_requests`, `privacy_requests`, `breach_cases`, `breach_notices` |
| [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification) | `documents`, `audit_events` | `ehi_requests`, `blocking_exception_determinations`, `result_release_holds` |
| [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy) | `conditions`, `documents`, `consents` | `privacy_rule_sets`, `consumer_health_data_requests` |
| [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization) | `consents`, `guarantors` | `personal_representatives` |
| [Security for Health Data](/books/health-tech/health-records-security) | `audit_events` | `emergency_access_grants`, `access_review_cases`, `downtime_events`, `restore_tests` |
| [The Revenue Cycle](/books/health-tech/revenue-cycle) | `claims`, `ledger_entries` | `edi_transactions`, `rcm_work_items`, `ar_snapshots` |
| [Eligibility & Benefits](/books/health-tech/eligibility-and-benefits) | `coverages`, `plans` | `eligibility_checks`, `benefit_details`, `plan_procedure_rules` |
| [Claims](/books/health-tech/claims) | `claims`, `claim_lines`, `charges` | `claim_submissions`, `claim_edits`, `claim_attachments` |
| [Clearinghouses](/books/health-tech/clearinghouses) | `integrations`, `payers` | `payer_connections`, `edi_enrollments` |
| [Remittance & Posting](/books/health-tech/remittance-and-payment-posting) | `remittances`, `remittance_lines`, `payments`, `ledger_entries` | `provider_adjustments`, `bank_deposits`, `eft_reassociations`, `posting_rules`, `posting_runs` |
| [Denials, Appeals & Claim Status](/books/health-tech/denials-and-appeals) | `claims`, `remittance_lines` | `claim_status_checks`, `denials`, `appeals`, `records_requests`, `overpayment_investigations` |
| [Prior Authorization](/books/health-tech/prior-authorization) | `orders`, `coverages`, `procedures` | `authorization_requirements`, `gold_card_exemptions`, `prior_authorizations`, `prior_auth_events` |
| [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience) | `patient_statements`, `ledger_entries`, `guarantors` | `good_faith_estimates`, `estimate_lines`, `payment_plans`, `medical_debt_rules`, `collection_placements` |
| [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation) | `procedures`, `conditions`, `claim_lines` | `em_support`, `documentation_queries`, `coverage_waivers`, `coding_reviews` |
| [Value-Based Care & Quality](/books/health-tech/value-based-care) | `patients`, `conditions`, `encounters` | `value_programs`, `patient_attributions`, `quality_measures`, `measure_results`, `risk_scores` |
| [Integrating with Practice Management Systems](/books/health-tech/pms-integration) | `integrations`, `sync_cursors`, every synced table | `sync_agents`, `sync_runs`, `external_records`, `writeback_requests`, `sync_conflicts` |
| [Scheduling & Online Booking](/books/health-tech/scheduling-and-online-booking) | `schedules`, `appointment_slots`, `appointments` | `appointment_types`, `schedule_templates`, `booking_rules`, `booking_requests`, `waitlist_entries` |
| [Reminders, Confirmations & Recall](/books/health-tech/reminders-and-recall) | `appointments`, `communications` | `recall_types`, `patient_recalls`, `reminder_rules`, `confirmations` |
| [Phones for Practices](/books/health-tech/practice-phones) | `communications`, `contacts`, `locations` | `phone_numbers`, `call_routes`, `call_records`, `emergency_locations` |
| [Two-Way Texting & Messaging](/books/health-tech/patient-texting) | `communications`, `contacts`, `consents` | `sender_registrations`, `message_templates`, `conversations`, `opt_outs`, `confidential_communication_requests` |
| [Digital Intake, Forms & Consent](/books/health-tech/digital-intake-and-forms) | `documents`, `consents`, `coverages` | `form_templates`, `form_submissions`, `form_answers` |
| [Reviews & Reputation](/books/health-tech/reviews-and-reputation) | `communications`, `locations` | `listing_profiles`, `review_requests`, `reviews`, `review_replies` |
| [Payments in the Practice](/books/health-tech/patient-payments) | `payments`, `ledger_entries` | `payment_methods`, `card_on_file_consents`, `payment_requests`, `payment_plan_runs`, `financing_applications` |
| [In-Office Membership Plans & Cash Pay](/books/health-tech/membership-plans) | `guarantors`, `charges`, `ledger_entries` | `membership_plans`, `membership_plan_benefits`, `memberships`, `membership_terms`, `membership_benefit_uses` |
| [Veterinary Practice](/books/health-tech/veterinary-practice) | `patients` (animal), `guarantors` (client) | `patient_owners`, `vcprs`, `pharmacy_authorization_requests`, `controlled_substance_log`, `vaccinations`, `rabies_certificates`, `record_releases` |
| [Dental Practice](/books/health-tech/dental-practice) | `procedures`, `coverages`, `observations` | `perio_exams`, `perio_measurements`, `treatment_plans`, `treatment_plan_items`, `treatment_plan_presentations`, `benefit_rules`, `insurance_estimates`, `lab_cases`, `ai_findings` |
| [Optometry, PT & Other Specialties](/books/health-tech/specialty-practices) | `procedures`, `encounters`, `documents` | `vision_prescriptions`, `rx_releases`, `contact_lens_verifications`, `plans_of_care`, `plan_certifications`, `therapy_thresholds` |
| [Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers) | `organizations`, `locations` | `location_groups`, `location_group_members`, `location_payer_networks`, `staff_assignments`, `cross_location_patient_links`, `shared_inboxes`, `conversation_transfers`, `pms_type_mappings` |
| [Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai) | every table, `communications` | `ai_call_sessions`, `ai_actions` |
| [Telehealth](/books/health-tech/telehealth) | `encounters`, `observations` | `virtual_visits`, `rpm_enrollments`, `rpm_periods`, `rpm_readings`, `rpm_time_entries` |
| [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing) | `medication_requests` | `pharmacies`, `erx_messages`, `epcs_enrollments`, `epcs_signings`, `pdmp_checks` |
| [Labs, Imaging & Diagnostics](/books/health-tech/labs-and-diagnostics) | `orders`, `observations`, `documents` | `clia_certificates`, `specimens`, `diagnostic_reports`, `critical_value_events`, `result_releases` |
| [Referrals & Care Coordination](/books/health-tech/referrals-and-care-coordination) | `orders`, `documents` | `referrals`, `referral_events`, `fax_documents`, `exchange_endpoints`, `care_programs`, `care_program_time` |
| [Hospitals & Health Systems](/books/health-tech/hospitals-and-health-systems) | `encounters`, `locations` | `encounter_class_history`, `beds`, `bed_states`, `bed_assignments`, `adt_events`, `ed_arrivals`, `price_transparency_files` |
| [Digital Health Apps & Devices](/books/health-tech/digital-health-and-devices) | `observations`, `integrations` | `devices`, `device_regulatory_records`, `device_claims`, `decision_support_interventions`, `app_connections`, `device_readings`, `hbnr_assessments` |
| [Patient Portals & Patient Access Apps](/books/health-tech/patient-portals-and-access) | `patients`, `communications`, `consents` | `portal_accounts`, `portal_access`, `portal_messages`, `e_visits` |
| [Payers & Plans](/books/health-tech/payers-and-plans) | `payers`, `plans`, `coverages` | `plan_benefits`, `networks`, `network_contracts` |
| [Credentialing, Enrollment & Provider Data](/books/health-tech/credentialing-and-enrollment) | `practitioners`, `practitioner_roles` | `practitioner_licenses`, `credential_verifications`, `credentialing_applications`, `payer_enrollments`, `directory_attestations` |
| [Inside a Payer](/books/health-tech/payer-operations) | `claims`, `coverages` | `member_enrollments`, `adjudications`, `accumulator_entries`, `utilization_reviews` |
| [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits) | `medication_requests`, `coverages`, `plans` | `formularies`, `formulary_entries`, `pharmacy_claims`, `benefit_checks` |
| [Clinical Trials](/books/health-tech/clinical-trials) | `patients`, `organizations` | `studies`, `study_sites`, `study_subjects`, `econsents` |
| [Trial Systems & 21 CFR Part 11](/books/health-tech/trial-systems-and-part-11) | `audit_events`, `documents` | `study_forms`, `form_entries`, `electronic_signatures`, `validation_records` |
| [Pharmacovigilance & Regulatory Submissions](/books/health-tech/pharmacovigilance-and-regulatory) | `observations`, `documents` | `adverse_events`, `adverse_event_versions`, `safety_reports`, `regulatory_submissions` |
| [Pharma Commercial & Patient Support](/books/health-tech/pharma-commercial) | `practitioners`, `organizations` | `hcp_profiles`, `sample_distributions`, `transfers_of_value`, `hub_cases` |
| [Canada & the UK](/books/health-tech/canada-and-uk) | `patient_identifiers`, `claims` | `jurisdiction_profiles`, `provincial_claims` |
| [The EU](/books/health-tech/eu-health-data) | `consents`, `audit_events` | `processing_records`, `ehds_access_requests` |
| [Health Tech Architecture](/books/health-tech/health-tech-architecture) | every table, `fhir_resource_versions`, the playbook's `outbox_events` | `inbound_messages`, `sensitivity_labels` |
| [AI in Health Tech](/books/health-tech/ai-in-health-tech) | `documents`, `communications` | `ai_features`, `ai_outputs` |
| [Operations, Support & Downtime](/books/health-tech/health-tech-operations) | `audit_events`, the playbook's support sessions | `practice_notices`, `data_corrections` |
| [Health Tech Metrics](/books/health-tech/health-tech-metrics) | `appointments`, `charges`, `ledger_entries`, `communications` | `metric_definitions`, `metric_values` |
| [Data Migration & Conversions](/books/health-tech/data-migration-and-conversions) | `integrations`, every table | `conversion_projects`, `legacy_archives` |
| [De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use) | `patients`, `observations` | `data_use_agreements`, `expert_determinations`, `data_releases` |

Three decisions keep the map one model rather than several:

- **Names that look alike are different records.** `orders` are clinical service requests (a lab, an X-ray, a referral), never purchases; a membership plan's renewal is a `charges` row, not an order. `documents` are the patient's paper trail and the 835s and 837s as exchanged; an amendment is a new document that supersedes, never an overwrite. `disclosures` are HIPAA accountings, `disclosure_texts` are versioned wording.
- **One concept, one table, reused.** A texting consent, a HIPAA authorization, a telehealth consent and a proxy grant are all `consents` rows with a `kind`, and the chapters that own each add columns or a child table, not a parallel consent store. A conversion's crosswalk from old IDs to new is `patient_identifiers` and `external_refs` with the old system as the issuer. An AI agent's booking is an `appointments` row with `source = 'ai_agent'`, audited like any other actor.
- **Financial records reach the patient through the guarantor.** Statements, payments and ledger entries carry the `guarantor_id`; `patient_id` on a ledger entry says whose care it was for. A family's balance is one query over the guarantor; a patient's share of it is a filter, and a vet client's three pets roll up the same way.

## Auditing

The records in this chapter are the ones patients, payers, regulators, auditors and courts ask about later:

- **Who saw which patient.** Every read, change, export, print and disclosure of a patient's record, with the actor, the purpose and the time, so an access report for one patient or one employee is a query ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **What was disclosed outside the practice.** Every accountable disclosure, retrievable for six years, so a patient's request for an accounting can be answered inside HIPAA's 60 days.
- **What was done and what was billed.** Every procedure with its code and performer, every charge with its fee, every claim and claim line as submitted and every remittance line as received, so a payer audit or a recoupment can be traced from the clinical record to the money.
- **Every money movement.** Every payment, adjustment, write-off, refund and transfer as an append-only ledger entry, with the remittance or processor record behind it.
- **What the patient agreed to and was told.** Every consent with the exact wording shown, the channel and the time, and every communication with its purpose and delivery status.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Separate organization from location,** and resolve ownership, contracts and tenancy at the organization, and schedules, numbers, hours and place of service at the location.
- **Separate patient, guarantor and subscriber,** and let a vet's patient be an animal whose client pays.
- **Keep appointments and encounters apart,** and procedures, charges and claim lines apart, so planning, care and billing can each change without rewriting the others.
- **Post everything to an append-only ledger** and compute balances; never overwrite a claim with its remittance.
- **Snapshot codes** on every clinical and billing row, and mark errors instead of deleting.
- **Assume you are not the system of record,** and carry every external ID and sync position explicitly.
- **Record every read and every disclosure,** not just writes, and keep consents with the words that were shown.
- **Point at the Payments model** for cards and payouts, and the playbook for HIPAA basics, consent and audit mechanics.
- **Emit life-cycle events** for appointments, encounters, claims, remittances, ledger postings and consents, and let reminders, statements and analytics consume them.

## References

**Spending and coverage**

- [CMS: National Health Expenditure fact sheet](https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/nhe-fact-sheet), 2024 spending, per person, share of GDP, spending by payer and service, and financing shares
- [Medicaid.gov: Medicaid and CHIP enrollment report highlights](https://www.medicaid.gov/medicaid/program-information/medicaid-and-chip-enrollment-data/report-highlights), 73,167,389 enrolled in June 2026
- [KFF: 2025 Employer Health Benefits Survey](https://www.kff.org/health-costs/2025-employer-health-benefits-survey/), self-funded share of covered workers, HDHP/SO enrollment and average premiums
- [ADA Health Policy Institute: National dental expenses](https://www.ada.org/resources/research/health-policy-institute/dental-care-market/national-dental-expenses), $189 billion of dental spending in 2024 and its sources
- [NAPHIA: Industry data](https://naphia.org/industry-data/), 7.6 million insured pets in North America at the end of 2025
- [CMS: Shared Savings Program, about](https://www.cms.gov/medicare/payment/fee-for-service-providers/shared-savings-program-ssp-acos/about), accountable care organizations in Medicare
- [CMS: 2026 Medicare ACO initiatives participation highlights](https://www.cms.gov/newsroom/fact-sheets/2026-medicare-accountable-care-organization-initiatives-participation-highlights), 511 Shared Savings Program ACOs serving 12.6 million people in 2026 (February 4, 2026)
- [KFF: Medicare Advantage enrollment update and key trends](https://www.kff.org/medicare/medicare-advantage-enrollment-update-and-key-trends/), 35.2 million enrollees, 55% of eligible beneficiaries, in 2026

**Rules and standards**

- [CMS: Adopted standards and operating rules](https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/adopted-standards-operating-rules), the HIPAA transaction standards (837, 835, 270/271, 276/277, 278, 834, 820, NCPDP D.0)
- [45 CFR 162.406: Standard unique health identifier for health care providers](https://www.law.cornell.edu/cfr/text/45/162.406), the NPI as a 10-position numeric identifier with a check digit
- [45 CFR 164.528: Accounting of disclosures](https://www.law.cornell.edu/cfr/text/45/164.528), the six-year period, the exceptions, each entry's contents and the 60-day deadline
- [NUCC: Health Care Provider Taxonomy code set](https://www.nucc.org/index.php/code-sets-mainmenu-41/provider-taxonomy-mainmenu-40), ten-character taxonomy codes
- [HL7 FHIR R4: Resource index](https://hl7.org/fhir/R4/resourcelist.html), the resources mapped in the core data model
- [ONC: About ONC](https://www.healthit.gov/topic/about-onc), certification, information blocking, USCDI and TEFCA
