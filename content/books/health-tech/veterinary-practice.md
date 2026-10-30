+++
title = "Veterinary Practice"
description = "Vet clinics in software: not HIPAA, state records law, the client and the animal, VCPR and telemedicine, prescriptions, labs, rabies certificates and booking."
category = "Health Tech Industry"
order = 1938
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "veterinary", "vcpr", "telemedicine", "prescriptions", "pims", "data-model"]
+++

A veterinary clinic runs the same front desk as a dental office (appointments, reminders, a phone that never stops, a ledger, a recall list) on a different legal and data foundation. The patient is an animal and the person paying, consenting and receiving every text is someone else: the client. There's almost no insurance in the workflow, because pet insurance reimburses the owner after they've paid the clinic. HIPAA doesn't apply, but state veterinary practice acts do, and they set confidentiality, records and prescribing rules of their own. The clinic is often a pharmacy, a lab and a surgical suite in one building, and increasingly part of a corporate group. And the relationship that lets a vet prescribe at all, the veterinarian-client-patient relationship (VCPR), is being rewritten state by state for telemedicine.

Vet software is called a practice information management system (PIMS) rather than a PMS, and the market has its own vendors: IDEXX's Cornerstone and ezyVet, Covetrus's AVImark, ImproMed and Pulse, and cloud entrants such as Shepherd and Digitail, with engagement vendors (PetDesk, Vetstoria, Weave and others) on top. This chapter covers what's different: privacy law, the client and patient model, the VCPR and telemedicine, prescriptions and pharmacy, controlled substances, labs, rabies certificates, reminders and booking, and the corporate groups. Pet care marketplaces (sitters, boarding, walkers) and their vet emergency guarantees are the User-Generated Platforms volume's [Services Marketplaces](/books/user-generated-platforms/services-marketplaces#the-vet-emergency). Wellness plans are in [In-Office Membership Plans & Cash Pay](/books/health-tech/membership-plans#vet-wellness-plans). This chapter extends `patients`, `guarantors`, `contacts`, `medication_requests` and `orders` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), where for vet the patient is the animal and the guarantor is the client.

## How the Platforms Do It

As of October 2026, from each vendor's own pages:

| Vendor | What it is | Deployment | Notable |
| --- | --- | --- | --- |
| **ezyVet** (IDEXX) | PIMS | Cloud | "100+ certified integrations," IDEXX VetConnect PLUS and Web PACS among them; diagnostics, imaging, payments and client communication "run natively"; a Corporate Groups offering for multi-location practices |
| **Cornerstone** (IDEXX) | PIMS | "Integrated, server-based veterinary software" | "Unmatched integration with the IDEXX diagnostics you use every day," plus third-party labs such as Antech and Heska; on Vetstoria's list as "Idexx-Cornerstone" |
| **Covetrus Pulse, AVImark, ImproMed** | PIMS family | Not stated on the page | Pulse is "a hub connected to all your tools, dashboards, and apps"; Covetrus also sells prescription management (online pharmacy and compounding) and supply distribution with "more than 450 suppliers" |
| **Shepherd** | PIMS | Cloud | Built around the visit's SOAP workflow; "Administering treatments automatically adds them to an invoice"; SummarizeAI, TranscribeAI and DiagnoseAI tools |
| **Vetstoria** | Online booking for clinics | Cloud, integrated with the PIMS | "Over 10,000 clinics," "more than 900,000 appointments every month," real-time integration with about 21 named PIMS, emergency keyword alerts, deposits at booking |
| **PetDesk** | Client app, reminders and payments | Cloud | Checkout and overdue invoice follow-up "through SMS, email, or the PetDesk App," syncing payments with the PIMS |

Two patterns:

- **The installed base is still on servers.** Cornerstone describes itself as server-based, and older PIMSs like it are reached the way Dentrix and Eaglesoft are: a sync agent on the server or a vendor's partner integration (Integrating with Practice Management Systems covers both). Vetstoria's list of about 21 PIMS, from AVImark to Cornerstone to OpenVPMS, is a map of how fragmented the market is, especially outside the US.
- **The lab company owns the software.** IDEXX sells reference lab testing, in-house analyzers and two PIMSs (Cornerstone and ezyVet); Covetrus sells distribution, pharmacy and PIMSs. A PIMS choice is also a lab and supply choice, though Cornerstone lists Antech and Heska among its lab integrations.

## Not HIPAA: State Law Instead

HIPAA protects health information about an "individual," which the rule defines as "the person who is the subject of protected health information," and "health care" means care "related to the health of an individual." An animal isn't an individual, so a vet clinic isn't a covered entity, and its vendors aren't business associates ([Who It Applies To](/docs/compliance/hipaa#who-it-applies-to)). That doesn't make vet records unregulated. State veterinary practice acts protect them, and Florida's is typical:

- **Confidentiality.** "Information disclosed to a veterinarian by a client in the course of the care and treatment of the patient is confidential" (Fla. Stat. 474.2165(5)), and records may not be furnished to anyone other than the client, the client's legal representative or treating veterinarians without the client's written authorization.
- **Exceptions.** Release to whoever arranged or provided the care with the client's consent, under a court subpoena with notice to the client, for research with identities protected, to law enforcement or animal control for suspected crimes such as cruelty, to the licensing board on a probable cause finding, and in malpractice proceedings.
- **Copies.** On request the clinic must furnish copies of "all reports and records," including X-rays, "in a timely manner, without delays for legal review," at no more than the actual cost of copying, and can't hold records hostage to an unpaid bill.
- **Transfer.** A vet who retires or relocates must notify clients and the board, and the new records owner must provide copies on request.

Other states differ in detail (California's Business and Professions Code § 4857 is the comparable section; its text was not readable for this chapter). <!-- source-gap: ca-bpc-4857 | missing | California Business and Professions Code 4857: veterinary records confidentiality and its exceptions | closes with: the section text on leginfo.legislature.ca.gov (blocked to fetchers) or another official copy | checked: 2026-10-29 --> The engineering rule is the same everywhere: treat client and patient records as confidential by default, release only to the client, their authorized representative or another treating vet, record every release with its basis, and keep the state exceptions as data. The client's own data is consumer personal data under state privacy laws where the clinic is large enough to be covered, so an engagement vendor still needs a data processing agreement with the clinic, even with no BAA.

What a vendor leaving HIPAA behind must not do is relax: the same platform usually serves dental and medical practices, and the cheapest correct design runs vet tenants under the same access controls, audit logs and support-access rules as health tenants ([Support Access](/docs/security/support-access)), without the BAA paperwork.

## The Client and the Animal

The core model holds: `patients` is the animal, `guarantors` the client. What vet adds:

- **One animal, several people.** A dog can have two owners in different households, a breeder still on the record, a pet sitter authorized to bring it in, and a rescue organization that owns it until adoption. Each is a person with a role on the animal: owner, co-owner, authorized agent, emergency contact, with a share of financial responsibility when owners split bills.
- **One client, many animals.** A household with three cats gets one reminder text listing all three, one statement, one appointment request for "the cats." Messaging groups by client; records stay per animal.
- **Animals change hands and die.** Transfers (sale, adoption, rehoming) move the animal to a new client with history intact and the old client's access ended. Deceased status stops every reminder at once, across every channel and vendor, because a vaccine reminder for a pet that died last week is the worst message a clinic sends. The PIMS's deceased flag has to sync to the engagement platform in minutes, not overnight.
- **Species, breed, sex and reproductive status, weight.** Weight drives dosing and changes visit to visit, so it's an observation with a date, not a profile field. Species and breed drive reminder protocols and reference ranges.
- **Identifiers belong to the animal.** Microchip numbers, rabies tag numbers and county license numbers are `patient_identifiers` of the animal; a client's phone number is not an animal identifier, though it's how the front desk finds the record.
- **Herds and groups.** Large-animal and production practices treat groups (a herd, a flock, a barn) as the unit for some records and prescriptions; the federal VCPR definition itself speaks of "(an) animal(s)." A group patient type with members keeps one model.

## The VCPR and Telemedicine

A veterinarian may prescribe only within a VCPR. The federal definition, which governs extralabel drug use under 21 CFR 530.3(i), requires that the veterinarian has assumed responsibility for medical judgments and the client has agreed to follow instructions, that the vet has "sufficient knowledge of the animal(s)" for at least a preliminary diagnosis, and that the vet is "readily available for followup," and says such a relationship "can exist only when the veterinarian has recently seen and is personally acquainted with the keeping and care of the animal(s) by virtue of examination of the animal(s), and/or by medically appropriate and timely visits to the premises." State practice acts have their own definitions, and most required an in-person exam to establish one.

That is changing. California's AB 1399 (2023) allowed a VCPR to be established by synchronous audio-video telehealth for some purposes, with limits on what may be prescribed and for how long; other states have moved in both directions. <!-- source-gap: vet-vcpr-telehealth-states | missing | California AB 1399 (Bus. & Prof. Code 4826.6) telehealth VCPR terms and limits, and the list of states that allow a VCPR to be established by telemedicine as of October 2026 | closes with: the California code section and each state's statute or board rule, or an AVMA or AAVSB state survey readable without a browser | checked: 2026-10-29 --> Because the federal definition still speaks of examination or premises visits, a state-law telehealth VCPR doesn't by itself satisfy federal rules for extralabel use.

For the system, the VCPR is a record, not an assumption:

- **A VCPR row per animal, veterinarian (or practice) and basis:** in-person exam, premises visit, or telehealth exam, with the date, the state whose law governs, and an expiry computed from that state's rule (states define how "recent" an exam must be differently, and the window is a rule, not a constant).
- **Prescribing checks it.** A refill request, a telehealth prescription or an online pharmacy approval checks for a current VCPR of a basis the drug and state permit, and the check's result is stored with the prescription.
- **Telehealth visits record their modality and location.** Synchronous video versus phone versus asynchronous messaging, and where the animal was, because the governing state is the animal's, not the vet's.
- **Triage isn't practice.** A general advice line or a chat that doesn't diagnose or prescribe doesn't need a VCPR, which is why the product draws a hard line in the UI between "general information" and a telehealth consult.

## Prescriptions and Pharmacy

A vet clinic dispenses most of what it prescribes from its own pharmacy, and competes with online and retail pharmacies for the rest. That makes prescriptions a revenue line, a compliance obligation and a messaging stream:

- **In-house dispensing** is an invoice line with a label, lot and expiry; refills are requests from the client (by app, text or phone) that a vet approves against the VCPR before staff fill them.
- **Outside pharmacies send authorization requests.** An online pharmacy can't fill a vet prescription without the prescriber's authorization, so it sends a request (by fax, phone or a portal) that the clinic approves or declines. A clinic sees dozens a week; the system should turn them into a queue matched to the animal, with the VCPR and the medical record one click away, and an answer sent back the same way. Many clinics run their own branded online store and home delivery through their distributor's pharmacy (Covetrus sells an online pharmacy and compounding), which keeps the sale in the clinic.
- **Written prescriptions on request.** Several states require a vet to provide a written prescription the client can fill elsewhere, and clinic policy often does it anyway; the system records the request, the release and the format. <!-- source-gap: vet-written-rx-states | missing | States that require veterinarians to provide written prescriptions on client request, and the AVMA policy on prescription release | closes with: state statutes or an AVMA policy page readable without a browser | checked: 2026-10-29 -->
- **Antimicrobials are prescription-only.** FDA's Guidance for Industry #263 (June 2021) asked sponsors to move medically important antimicrobials still sold over the counter for animals to prescription status, so a vet's oversight is required; in a production practice, that turned many feed-store purchases into prescriptions and veterinary feed directives that need a VCPR.
- **Compounding** for animals (flavored, reformulated or unavailable drugs) comes from compounding pharmacies under FDA's animal compounding policies and state pharmacy law; the prescription records that it's compounded and the reason.

## Controlled Substances

Veterinarians are "individual practitioners" under the DEA's rules ("a physician, dentist, veterinarian, or other individual licensed"), so a clinic that stocks ketamine, opioids, euthanasia solutions or anxiolytics holds a DEA registration per location and keeps the same inventories, dispensing logs and loss reports as any registrant; e-prescribing and EPCS mechanics are E-Prescribing & Pharmacy's. What differs:

- **Most controlled drugs are administered, not prescribed.** Sedation and euthanasia are administered in the clinic, and the record of each dose drawn, given and wasted (with a witness) is the controlled substance log, which the PIMS keeps per bottle.
- **Prescription monitoring varies.** Some states require vets to report dispensed controlled drugs to the state prescription drug monitoring program and others exempt them; the reporting rule belongs in data per state.
- **Diversion through the animal** (an owner seeking opioids prescribed for a pet) is a known pattern, so dispensing history per client across animals is a screen worth having.

## Labs and Diagnostics

Vet labs come in two forms, often from the same company: in-house analyzers (chemistry, hematology, urinalysis) that return results during the visit, and reference labs that pick up samples and post results hours or days later. ezyVet lists IDEXX VetConnect PLUS among its integrations, and the PIMS-lab integration does three things:

- **Orders go out from the visit,** with the animal's species, age and sex so reference ranges apply, and a charge is created when the test is ordered, not when the result returns, so the client pays at checkout.
- **Results come back to the record,** mapped to the animal and order, flagged against species reference ranges, and routed to the ordering vet's inbox.
- **Results go to the client after review.** Unlike human medicine's immediate-release rules, a vet clinic decides when a client sees results; the engagement layer sends "your pet's results are ready, Dr. Lee will call you" only after the vet marks them reviewed.

## Rabies Certificates and Licensing

Rabies vaccination is required by state or local law for dogs (and often cats and ferrets), and each vaccination produces a certificate: the animal, the owner, the vaccine's manufacturer, lot and expiry, the duration of immunity (by product label and local law), the tag number and the vet's signature. Many counties and cities require clinics to send vaccination records for pet licensing. For the system:

- **The certificate is a generated document** from the vaccination record, signed by the vet, with the tag number as an animal identifier, and reproducible exactly as issued.
- **Reporting is a feed per jurisdiction:** a file or portal upload of rabies vaccinations to the county, on its schedule and format, with a record of what was sent.
- **The due date drives the reminder.** The next rabies due date comes from the product's labeled duration and local law, and it's the most important reminder a clinic sends (Reminders, Confirmations & Recall has the cadence).

## Reminders, Booking and the Client App

Vet engagement is reminder-driven: vaccines, heartworm and parasite prevention, annual wellness exams, dental cleanings, senior bloodwork. Reminders are generated by the PIMS from protocols per species and product, and the engagement layer sends them, grouped per client across animals. Online booking needs vet-specific rules: Vetstoria lets clinics reserve slots for appointment types and set "alerts for emergency keywords, so urgent cases are directed to call or visit right away," and collect deposits at booking, because a new-client surgery slot is expensive to lose to a no-show. Scheduling & Online Booking covers the slot model; what vet adds is species and reason constraints (an exotic animal needs the vet who sees exotics; a euthanasia appointment needs a quiet room and a longer slot) and the emergency screen in front of the booking form.

## Corporate Groups

Vet medicine has consolidated into large corporate groups alongside independents ([Veterinary consolidators](/books/health-tech/practice-business#veterinary-consolidators)); Mars Veterinary Health alone describes "3,000 veterinary clinics worldwide" and "nearly 70,000" associates. For the software, a group means a mix of PIMSs from acquisitions, central call centers, group-wide reporting and a brand per hospital, which Multi-Location Groups & Call Centers covers. Two vet-specific notes: corporate groups often run their own wellness plans and pharmacy, and the corporate practice of veterinary medicine is restricted in some states, so who may own a clinic and who controls clinical decisions differs by state ([Corporate practice doctrines](/books/health-tech/practice-business#corporate-practice-doctrines)).

## How to Build It

The core model already gives an animal patient its `kind = 'animal'`, species, breed, `administrative_sex` and `deceased_at`, and lets a microchip or rabies tag be a `patient_identifiers` row; the client is a `guarantors` row. Vet adds the people around each animal, VCPRs, pharmacy authorizations, controlled substance logs, vaccinations and rabies certificates:

```sql
ALTER TABLE patients
  ADD COLUMN reproductive     TEXT CHECK (reproductive IN ('intact', 'neutered', 'spayed', 'unknown')),
  ADD COLUMN is_group         BOOLEAN NOT NULL DEFAULT FALSE;  -- a herd, flock or barn

CREATE TABLE patient_owners (               -- people and organizations with a role on an animal
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  guarantor_id      UUID NOT NULL REFERENCES guarantors (id),  -- the client record, person or shelter
  role              TEXT NOT NULL CHECK (role IN ('owner', 'co_owner', 'authorized_agent',
                      'emergency_contact', 'rescue', 'breeder')),
  financial_share   NUMERIC(5,2),             -- owners splitting bills
  may_consent       BOOLEAN NOT NULL DEFAULT FALSE,  -- treatment and euthanasia consent
  may_receive_records BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during      TSTZRANGE NOT NULL,       -- a transfer closes the old owner's range
  PRIMARY KEY (patient_id, guarantor_id, role, valid_during)
);

CREATE TABLE vcprs (                        -- the relationship that permits prescribing
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  practitioner_role_id UUID NOT NULL REFERENCES practitioner_roles (id),
  basis             TEXT NOT NULL CHECK (basis IN ('in_person_exam', 'premises_visit',
                      'telehealth_exam')),
  governing_state   TEXT NOT NULL,            -- ISO 3166-2, where the animal is
  established_on    DATE NOT NULL,
  expires_on        DATE NOT NULL,            -- from the state's recency rule, as data
  encounter_id      UUID NOT NULL REFERENCES encounters (id),
  rule_version      TEXT NOT NULL
);

ALTER TABLE medication_requests
  ADD COLUMN vcpr_id          UUID REFERENCES vcprs (id),
  ADD COLUMN vcpr_check       JSONB,          -- the check's result at prescribing time
  ADD COLUMN extralabel       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN compounded       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN dispensed_by     TEXT CHECK (dispensed_by IN ('clinic', 'clinic_online_store',
                                'outside_pharmacy', 'written_released'));

CREATE TABLE pharmacy_authorization_requests (  -- an outside pharmacy asking to fill
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  pharmacy          TEXT NOT NULL,
  received_via      TEXT NOT NULL CHECK (received_via IN ('fax', 'portal', 'phone', 'api')),
  patient_id        UUID REFERENCES patients (id),   -- null until matched
  requested         JSONB NOT NULL,           -- drug, strength, quantity, refills, as received
  document_id       UUID REFERENCES documents (id),  -- the fax, kept
  medication_request_id UUID REFERENCES medication_requests (id),
  decision          TEXT CHECK (decision IN ('approved', 'approved_modified', 'declined',
                      'needs_exam')),
  decided_by        UUID REFERENCES practitioner_roles (id),
  decided_at        TIMESTAMPTZ,
  response_sent_at  TIMESTAMPTZ
);

CREATE TABLE controlled_substance_log (     -- every dose drawn, given, wasted or dispensed
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  location_id       UUID NOT NULL REFERENCES locations (id),
  dea_registration  TEXT NOT NULL,
  product           TEXT NOT NULL,
  container_id      TEXT NOT NULL,            -- the bottle
  action            TEXT NOT NULL CHECK (action IN ('received', 'drawn', 'administered',
                      'wasted', 'dispensed', 'returned', 'loss', 'inventory_count')),
  quantity          NUMERIC(10,3) NOT NULL,
  unit              TEXT NOT NULL,
  patient_id        UUID REFERENCES patients (id),
  by_user           UUID NOT NULL,
  witness_user      UUID,                     -- required for waste
  balance_after     NUMERIC(10,3) NOT NULL,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (action <> 'wasted' OR witness_user IS NOT NULL)
);

CREATE TABLE vaccinations (                 -- every vaccine given, rabies or not
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  procedure_id      UUID NOT NULL REFERENCES procedures (id),  -- the administration
  vaccine_product   TEXT NOT NULL,
  manufacturer      TEXT NOT NULL,
  lot               TEXT NOT NULL,
  lot_expires       DATE NOT NULL,
  duration_months   SMALLINT NOT NULL CHECK (duration_months > 0),  -- label and local law
  next_due          DATE NOT NULL,            -- drives the reminder
  administered_by   UUID NOT NULL REFERENCES practitioner_roles (id)
);

CREATE TABLE rabies_certificates (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  vaccination_id    UUID NOT NULL UNIQUE REFERENCES vaccinations (id),
  tag_number        TEXT,                     -- also a patient_identifiers row, system 'rabies_tag'
  jurisdiction      TEXT NOT NULL,            -- the county or city it reports to
  signed_by         UUID NOT NULL REFERENCES practitioner_roles (id),
  document_id       UUID NOT NULL REFERENCES documents (id),  -- as issued and signed
  reported_at       TIMESTAMPTZ,
  report_batch      TEXT
);

CREATE TABLE record_releases (              -- every copy of a vet record given to anyone
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  recipient         TEXT NOT NULL,
  basis             TEXT NOT NULL CHECK (basis IN ('client_request', 'client_authorization',
                      'treating_veterinarian', 'subpoena', 'law_enforcement', 'board', 'research')),
  authorized_by     UUID REFERENCES guarantors (id),
  consent_id        UUID REFERENCES consents (id),  -- the client's written authorization
  document_ids      UUID[] NOT NULL,
  released_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **Messaging groups by client, records stay per animal.** The reminder job selects due items per animal, then groups them by the client whose `patient_owners` row is active and whose contact allows the message, and skips every animal with `deceased_at` set.
- **Deceased and transfers propagate as events.** `patient.deceased` and `patient.transferred` go out through the outbox to every vendor integration at high priority, and the engagement platform cancels queued messages on receipt.
- **The VCPR rule is per state, as data.** Basis allowed, recency window and drug limits per state, versioned, so a prescription's check can be reproduced ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Record releases are not HIPAA disclosures.** The core `disclosures` table is HIPAA's accounting, which doesn't apply to a clinic whose organization has `hipaa_role = 'not_covered'`; `record_releases` follows the state act instead, with the basis on each, and is the evidence a board asks for.

## Auditing

- **Every prescription's authority:** the VCPR it relied on, its basis and the check result.
- **Every outside pharmacy request:** as received, matched, decided by whom and answered when.
- **The controlled substance log,** reconcilable per bottle and per registration, with witnesses on waste.
- **Every record release** with its legal basis and recipient.
- **Rabies certificates and reports** as issued and as sent to each jurisdiction.
- **Ownership changes and deceased status,** with who recorded them and when every downstream system acknowledged.

## What This Means for the System You Build

- **Model the animal as the patient and every person by role on it,** with ownership ranges, so transfers, co-owners and agents work without duplicating records.
- **Propagate deceased status everywhere within minutes** and stop every reminder.
- **Run vet tenants under the same access controls and audit as health tenants,** and follow the state veterinary records act for releases, with the basis recorded.
- **Record the VCPR as data** with basis, governing state and expiry, and check it on every prescription and pharmacy approval.
- **Turn outside pharmacy requests into a matched queue** with the record and VCPR at hand.
- **Keep the controlled substance log per bottle,** with witnessed waste, per DEA registration.
- **Charge lab tests at order, release results to clients after vet review,** and route results to the ordering vet.
- **Generate rabies certificates as signed documents** and report them per jurisdiction.
- **Integrate the on-premises PIMSs the way you would a dental server,** because the installed base is still there.

## References

**Law and regulation**

- [eCFR: 45 CFR 160.103](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103), HIPAA's definitions of health care, individual and health care provider
- [eCFR: 21 CFR 530.3](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-E/part-530/subpart-A/section-530.3), the federal veterinarian-client-patient relationship definition
- [eCFR: 21 CFR 1300.01](https://www.ecfr.gov/current/title-21/chapter-II/part-1300/section-1300.01), veterinarians as individual practitioners under the DEA's rules
- [Florida Statutes § 474.2165](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0474/Sections/0474.2165.html), veterinary records: confidentiality, release limits, exceptions, copies and transfers
- [FDA: CVM GFI #263](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-263-recommendations-sponsors-medically-important-antimicrobial-drugs-approved-use-animals), moving medically important antimicrobials for animals to prescription status (June 2021)

**Vendors**

- [ezyVet](https://www.ezyvet.com/), cloud PIMS, certified integrations including IDEXX VetConnect PLUS, native diagnostics and payments, corporate groups
- [IDEXX: Cornerstone](https://software.idexx.com/products/cornerstone), server-based PIMS, IDEXX diagnostics integration, third-party labs
- [Mars Veterinary Health](https://www.marsveterinary.com/), clinic and associate counts
- [Covetrus](https://www.covetrus.com/), Pulse, AVImark and ImproMed, online pharmacy and compounding, distribution
- [Shepherd](https://www.shepherd.vet/), cloud PIMS, SOAP workflow, treatments to invoice, AI tools
- [Vetstoria](https://www.vetstoria.com/), online booking, clinic and appointment counts, integrated PIMS list, emergency keyword alerts, deposits
- [PetDesk: Payments](https://petdesk.com/product/feature/payments), checkout and overdue invoice follow-up by SMS, email and app
