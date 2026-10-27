+++
title = "Records, Privacy & Audits"
description = "Tenant data, FCRA disposal, state privacy laws, property-records data and publicity rights, retention schedules, legal holds, and regulatory and owner audits."
category = "Property Tech Industry"
order = 1734
part = "The Rules"
tags = ["property-tech", "privacy", "data-retention", "audits", "compliance"]
+++

A property platform holds more sensitive data per person than most consumer software. An applicant hands over a Social Security number, pay stubs, bank statements, a photo ID and sometimes a selfie, and the platform adds a credit report, a criminal and eviction history and a decision. A resident adds years of payments, repair requests with photos of their home, door-access events, messages, call recordings, and sometimes a request for accommodation that describes a disability or a certification that describes domestic violence. Owners are people too: an individual landlord's name, tax ID and bank account sit in the same system. And the records outlive the relationship, because programs, courts, auditors and the next screening decision ask for them years later.

So the rules here pull in two directions. Privacy and disposal law say keep less, for less time, and destroy it properly. Program rules, trust account regulations, litigation and audits say keep it, unaltered, and produce it on demand. This chapter covers the data itself, FCRA disposal, state privacy laws and who is the business and who the processor, property-records data products and the right of publicity, retention schedules resolved from law and legal holds that override them, and the audits that come to an operator: real estate commissions, housing programs, owners. The mechanics of retention, erasure and audit trails are in the playbook; this chapter is what property adds.

## How the Platforms Do It

Records features sit in three places in the suites, and a fourth line of business carries its own exposure:

- **Document management.** RealPage lists Document Management as a property management product for "consistent workflows, standardized forms and corporate-approved documents" across a portfolio; every suite stores leases, applications, notices and inspection photos against the resident and unit. Retention controls are not described on the public pages, which is typical: the market sells storage and templates, and leaves the schedule to the operator.
- **Audit trails on automated work.** Entrata's AI Admin, announced in September 2026, "maintains an audit trail of AI interactions" (the model, the answer, the sources and the reasoning), exportable for audit, and breaks down AI costs by property and owner for third-party managers. As agents take actions on leases and ledgers, that trail becomes part of the operator's record ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Program and audit readiness.** Vendors pitch audit readiness for the regulated parts: RealPage describes an AI finance agent that "supports audit readiness" and OneSite support for housing compliance; affordable housing editions across vendors produce the files HUD and state housing agencies review ([Subsidized & Affordable Housing](/books/property-tech/affordable-housing#auditing)).
- **Property-records data products.** Some vendors also sell data about properties and their owners. Yardi owns PropertyShark, a property-records database, and in July 2024 two Ohio residents filed a proposed class action, LaFleur v. Yardi Systems (No. 1:24-cv-01262), alleging that PropertyShark used Ohio residents' identities in its property reports and owner search results to advertise paid subscriptions without consent, under Ohio's right-of-publicity statute. No outcome had been reported in the sources I opened as of October 2026.

What the market leaves to the operator, and this chapter builds, is the policy layer: what each record is, how long the law says to keep it, what holds it, who asked for it, and when and how it was destroyed.

## Tenant Data

Classify by what the law attaches to the data, not by the table it sits in. The categories that need different handling:

| Category | Examples | What attaches |
| --- | --- | --- |
| **Identity** | Name, date of birth, SSN or ITIN, ID document images, selfies and liveness checks | Breach notification laws; state biometric laws for face geometry ([Biometric Privacy](/books/property-tech/applications-and-screening#biometric-privacy)) |
| **Consumer reports** | Credit, criminal, eviction and rental-history reports, scores, and anything derived from them | FCRA permissible purpose and the [disposal rule](#fcra-disposal) |
| **Financial** | Bank statements, pay stubs, account and routing numbers, card data | Breach laws; [PCI DSS](/docs/compliance/pci-dss) for card data; Payments volume for tokens |
| **Program data** | Household income and assets, family composition, race and ethnicity collected for HUD programs | Program confidentiality and retention ([Certifications and Income](/books/property-tech/affordable-housing#certifications-and-income)); kept out of decisions ([Fair Housing](/books/property-tech/fair-housing#protected-classes)) |
| **Disability and accommodation** | Verification letters, the accommodation case | Confidentiality under the HUD and DOJ joint statement; restricted access ([Fair Housing](/books/property-tech/fair-housing#reasonable-accommodations-and-modifications)) |
| **Domestic violence** | VAWA certifications and supporting documents | On HUD properties, a separate file in a separate secure location, never in a shared database |
| **Home and movement** | Access events, camera footage, smart-device data, unit photos from work orders | Resident expectations of privacy in the home ([Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#resident-privacy)) |
| **Communications** | Emails, texts, chat logs, call recordings and transcripts | Consent and recording law ([Calls, Texts & Email](/docs/compliance/consumer-contact#recording-calls)); recordings are personal data ([AI Agents in the Product](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)) |
| **Owner and vendor people** | Individual owners' tax IDs and bank accounts, vendor contacts | Tax and payout rules; state privacy laws that cover business contacts |

Two of these are stricter than teams expect. HUD's occupancy handbook requires owners of HUD-assisted properties to keep documentation of domestic violence, dating violence or stalking "in a separate file that is kept in a separate secure location from other tenant files," confidential, and not "entered into any shared database," with narrow exceptions (written consent, an eviction proceeding, or other law). In software terms that is a separate store with its own grants, not a tag on a document. Accommodation verification needs the same treatment for the same reason.

My rule for the whole table: classify at the column and document type, attach the category to every copy (search indexes, exports, the warehouse, AI context windows), and enforce access by category and purpose, with reads logged for the sensitive ones ([Classifying Personal Data](/docs/data/data-governance#classifying-personal-data), [Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## FCRA Disposal

The FTC's Disposal Rule (16 CFR 682) requires anyone who maintains or possesses consumer information for a business purpose to dispose of it by "taking reasonable measures to protect against unauthorized access to or use of the information." The FTC's guidance lists landlords among those covered, along with service providers that hold consumer report information for covered organizations, which is the platform. Consumer information means consumer reports and information derived from them, including residential or tenant history.

The rule gives three examples of reasonable measures: policies requiring "the burning, pulverizing, or shredding of papers"; policies for the "destruction or erasure of electronic media" so the information can't practicably be read or reconstructed; and contracting with a records-destruction business after due diligence and monitoring its compliance. For a platform the electronic one is the work:

- **Find every copy.** A screening report exists as the vendor's response, a rendered PDF, extracted fields on the application, a decision record, a search index entry, a warehouse row and a backup. Disposal that deletes the PDF and leaves the extracted fields hasn't disposed of anything ([Retention and Deletion Through the Warehouse](/docs/data/data-governance#retention-and-deletion-through-the-warehouse)).
- **Keep the decision, drop the report.** The adverse action decision, the criteria version and the fact that a report was obtained are records an operator needs to keep for disputes and fair housing claims; the full report usually isn't. Splitting them at ingestion makes disposal possible without destroying evidence.
- **Backups age out.** Backups are disposed of by expiry, not by editing them, so the backup retention period is part of the disposal schedule ([Backups](/docs/architecture/data-retention#backups)).
- **Record the disposal.** What was destroyed, under which schedule, by what method, when, and by which job; that's what an auditor or a plaintiff asks for.

## State Privacy Laws

There is no federal comprehensive privacy law in the US. As of February 2026, twenty states had comprehensive consumer privacy laws (counting Florida's narrower one), with Indiana, Kentucky and Rhode Island taking effect January 1, 2026. Each sets its own applicability thresholds, rights and exemptions, so the platform resolves them per resident and per operator the way it resolves landlord-tenant law.

**Who is the business, who is the processor.** Under the California Consumer Privacy Act a "business" includes a for-profit entity with annual gross revenue above $26,625,000 (the threshold as adjusted from $25 million effective January 1, 2025), among other tests. A large operator with California residents is a business; the property management software vendor is normally its service provider or processor, acting on its instructions under a contract, and the other states use the controller and processor vocabulary that [Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa) describes. The vendor stops being a mere processor where it uses resident data for its own purposes: its own screening database, its own marketplace offers, its own model training, its own benchmarking product. Those uses need their own legal basis and disclosures, and the contract with the operator has to say which they are.

**Employees and business contacts.** California's temporary exemptions for employee and business-to-business data expired January 1, 2023, so site staff, applicants for jobs, and contacts at vendors and owner entities have the same rights as residents in California. Colorado, Connecticut, Utah and Virginia exclude employment contexts from their laws. For a platform that holds the operator's staff accounts, technicians' location data and vendor contacts, California is the binding case ([CCPA and CPRA](/docs/compliance/gdpr#ccpa-and-cpra)).

**Rights requests against records that must be kept.** A resident can ask to know, correct or delete. Deletion collides with everything else in this chapter: the lease and ledger, trust account records, program files and records under legal hold must be kept, so each law's exceptions for records kept to meet legal obligations are part of the rule data. The workable answer is the one in [Erasure Requests](/docs/architecture/data-retention#erasure-requests): delete what isn't required (marketing profiles, prospect records past their schedule, old chat logs), restrict what is, and tell the person which records were kept and why. A request is a case with a deadline, logged, and fulfilled across every store, including the vendor's subprocessors.

**Breach notification.** Every state, plus the District of Columbia, Puerto Rico, Guam and the Virgin Islands, has a breach notification law, generally requiring notice to affected residents "without unreasonable delay," some with fixed deadlines and many with notice to the attorney general or consumer reporting agencies. The platform's job is to know, for any incident, which people in which states had which data categories, which is the classification above applied to an incident's scope ([Breach Notification](/docs/compliance/gdpr#breach-notification)).

## Property-Records Data and Publicity

Deeds, mortgages, tax assessments and permits are public records, and an industry turns them into products: ownership lookups, comparable sales, owner contact data, lead lists for acquisitions. Property platforms consume this data to resolve owners and parcels ([Matching, Merging & Many Sources](/docs/architecture/record-linkage)) and some vendors sell it. Public doesn't mean free of rules:

- **Right of publicity.** Ohio's statute says "a person shall not use any aspect of an individual's persona for a commercial purpose" without consent, with exceptions for news, public affairs and sports accounts and political campaigns. Displaying a deed record and using a person's name to sell a subscription are different acts, and the PropertyShark suit above turns on the second. Other states have their own statutes and common law.
- **Licensed data terms.** Data vendors restrict redistribution, display and retention, and those terms bind the platform ([Licensed Data](/docs/architecture/record-linkage#licensed-data)).
- **People in the data.** An individual owner, an LLC's registered agent and a resident named in a court record are natural persons, and state privacy laws, the FCRA (if the data is used for eligibility) and publicity statutes can all apply.

My rules for a platform that touches this data: never use a person's name or likeness in marketing, search pages or teaser results without consent; keep source, license and retrieval date on every imported record; and treat any feature that assembles a profile of an individual (owner, resident or applicant) from public sources as a privacy decision that needs review, not a data enrichment ticket.

## Retention and Legal Holds

Retention is law resolved per record type and property, the same way as deposit limits. Some sources of minimums an operator faces:

| Record | Minimum | Source |
| --- | --- | --- |
| HUD-assisted applicant removed from the waiting list | Application, rejection notice, reply and supporting documents for three years | HUD Handbook 4350.3, 4-22 |
| HUD-assisted tenant file | Application kept for the tenancy and three years after the tenant leaves | HUD Handbook 4350.3, 4-22 |
| LIHTC owner records | At least six years after the tax return due date for each year; first-year records six years past the end of the compliance period | 26 CFR 1.42-5(b)(2) |
| California broker trust records | A columnar record of all trust funds received and disbursed, reconciled monthly; receipts for certain small third-party checks kept three years | 10 CCR 2831, 2831.2 |
| Consumer reports | No federal minimum; disposal must be secure when kept no longer | 16 CFR 682 |

Each is a `legal_rules` row of type `record_retention` ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix)), with `params` naming the record type, the trigger (removed from waiting list, move-out, end of compliance period) and the period. The operator's `retention_schedules` choose a period at least as long as the longest applicable rule and at most as long as privacy law and policy allow; the engine checks both bounds. Other chapters own record-specific rules that feed this one: eviction record sealing and what screening may consider ([Eviction Filings](/books/property-tech/delinquency-and-eviction#eviction-filings); [Criminal History and Fair-Chance Laws](/books/property-tech/applications-and-screening#criminal-history-and-fair-chance-laws)), unclaimed property for uncashed refunds and deposits ([Unclaimed Property](/books/property-tech/trust-accounting#unclaimed-property)), and owner record rights under management agreements ([The Management Agreement](/books/property-tech/owners-and-management-agreements#the-management-agreement)).

Retention runs from an event, so the schedule stores a trigger and the job computes each record's disposal date when the trigger fires, the way [Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) describes. A lease file's clock starts at move-out, not at signing; a rejected applicant's starts when they leave the waiting list.

A **legal hold** suspends disposal for records in scope until it's released. Holds come from fair housing complaints, eviction and collection suits, deposit disputes, injury claims, subpoenas, regulatory inquiries and owner disputes, and the scope is usually a property or a person over a period rather than a list of documents. The disposal job never deletes a record covered by an active hold, and the hold, its scope, who placed it and who released it are themselves kept ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records) covers the interaction with immutable ledgers).

## Regulatory and Commission Audits

An operator is audited by people who each want a different cut of the same records. The platform's job is to produce them consistently, as of a date, with proof they weren't altered:

- **Real estate commissions.** State licensing rules set the trust records a broker who manages property must keep, and those records are what an examiner asks for. California's regulations require a chronological, columnar record of every trust fund received and disbursed with a daily balance, a separate record per beneficiary or transaction, and a written monthly reconciliation of the two identifying the account, the date and the broker's liability to each principal. That is three-way reconciliation, which [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#three-way-reconciliation) builds; this chapter's job is to produce it for any month on request.
- **Housing programs.** HUD or its contract administrator reviews HUD-assisted properties in on-site monitoring reviews, and the handbook requires owners to show documentation of affirmative fair housing marketing during compliance reviews. Tax credit properties face state housing agency inspections at least once every three years, with units and files for review selected at random from a minimum sample set by a table in 26 CFR 1.42-5 (for example 21 units for an 82-to-101-unit project), on reasonable notice that is generally no more than 15 days. Fifteen days is the time the platform has to assemble tenant files, certifications and income documentation. [Subsidized & Affordable Housing](/books/property-tech/affordable-housing#auditing) owns the program rules.
- **Owners and investors.** Owners audit the manager's books for their properties under the terms of their management agreements, typically management fee calculations, reimbursed payroll, vendor invoices and trust balances ([Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#auditing)).
- **Lenders and agencies.** Rent rolls, operating statements and reserve records in the lender's format.
- **The vendor itself.** Operators ask their software vendor for a SOC 2 report and evidence of controls over their data ([SOC 2](/docs/compliance/soc-2)).

An audit is a request with a scope, a deadline and a production. Treat it as one: record who asked, under what authority, for which properties, people and periods; place a legal hold on the scope; produce from the system of record with the as-of date and a manifest of what was delivered and its hash; and log who reviewed the production before it left ([Producing Records](/docs/architecture/audit-trails#producing-records)).

## How to Build It

This extends the [core data model](/books/property-tech/property-business#the-core-data-model) and resolves retention minimums from `legal_rules` (rule type `record_retention`, defined in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it)). Every table carries `tenant_id`.

```sql
CREATE TABLE retention_schedules (        -- the operator's schedule, checked against law
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  record_type      TEXT NOT NULL,          -- 'applicant_file', 'tenant_file', 'consumer_report',
                                           -- 'trust_record', 'call_recording', 'access_event',
                                           -- 'prospect', 'accommodation_verification'
  property_id      UUID REFERENCES properties (id),  -- null: tenant-wide default
  trigger_event    TEXT NOT NULL,          -- 'move_out', 'waitlist_removal', 'decision',
                                           -- 'created', 'compliance_period_end'
  keep_for         INTERVAL NOT NULL,
  legal_rule_ids   UUID[] NOT NULL DEFAULT '{}',  -- the minimums this satisfies
  disposal_method  TEXT NOT NULL CHECK (disposal_method IN ('hard_delete', 'crypto_shred',
                     'anonymize', 'archive_then_delete')),
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING GIST (tenant_id WITH =, record_type WITH =,
    (COALESCE(property_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    valid_during WITH &&)
);

CREATE TABLE record_disposal_dates (      -- computed when the trigger fires
  tenant_id      UUID NOT NULL,
  record_type    TEXT NOT NULL,
  record_id      UUID NOT NULL,
  schedule_id    UUID NOT NULL REFERENCES retention_schedules (id),
  triggered_on   DATE NOT NULL,
  dispose_on     DATE NOT NULL,
  PRIMARY KEY (tenant_id, record_type, record_id)
);

CREATE TABLE record_scope (               -- what a record is about, for hold matching
  tenant_id    UUID NOT NULL,
  record_type  TEXT NOT NULL,
  record_id    UUID NOT NULL,
  property_id  UUID REFERENCES properties (id),
  person_ids   UUID[] NOT NULL DEFAULT '{}',
  lease_id     UUID REFERENCES leases (id),
  period       DATERANGE NOT NULL,         -- the dates the record concerns
  PRIMARY KEY (tenant_id, record_type, record_id)
);

CREATE TABLE legal_holds (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('fair_housing_complaint', 'litigation',
                     'subpoena', 'regulatory_inquiry', 'audit', 'owner_dispute',
                     'deposit_dispute', 'insurance_claim')),
  matter_ref       TEXT,                   -- complaint id, case number, request id
  property_ids     UUID[],                 -- scope: any combination
  person_ids       UUID[],
  lease_ids        UUID[],
  record_types     TEXT[],                 -- null: all types
  covers_period    DATERANGE NOT NULL,
  placed_by        UUID NOT NULL REFERENCES users (id),
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_by      UUID REFERENCES users (id),
  released_at      TIMESTAMPTZ
);

CREATE TABLE privacy_requests (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  person_id        UUID REFERENCES people (id),   -- null until identity is matched
  requester_kind   TEXT NOT NULL CHECK (requester_kind IN ('resident', 'applicant',
                     'prospect', 'staff', 'owner', 'vendor_contact', 'authorized_agent')),
  right            TEXT NOT NULL CHECK (right IN ('know', 'access', 'correct', 'delete',
                     'opt_out_sale_share', 'limit_sensitive', 'portability')),
  jurisdiction_id  UUID NOT NULL REFERENCES jurisdictions (id),  -- whose law applies
  received_at      TIMESTAMPTZ NOT NULL,
  identity_verified_at TIMESTAMPTZ,
  respond_by       DATE NOT NULL,          -- from the applicable law
  status           TEXT NOT NULL CHECK (status IN ('received', 'verifying', 'in_progress',
                     'fulfilled', 'partially_fulfilled', 'denied', 'withdrawn')),
  kept_records     JSONB,                  -- what was retained and the legal reason
  closed_at        TIMESTAMPTZ
);

CREATE TABLE disposal_events (            -- append-only proof of destruction
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  record_type      TEXT NOT NULL,
  record_count     INT NOT NULL,
  record_ids_hash  TEXT NOT NULL,          -- hash of the sorted ids, not the ids themselves
  cause            TEXT NOT NULL CHECK (cause IN ('schedule', 'privacy_request',
                     'vendor_offboarding')),
  schedule_id      UUID REFERENCES retention_schedules (id),
  privacy_request_id UUID REFERENCES privacy_requests (id),
  method           TEXT NOT NULL,
  stores           TEXT[] NOT NULL,        -- 'primary', 'search', 'warehouse', 'object_store',
                                           -- 'subprocessor:<name>'
  run_by           UUID NOT NULL REFERENCES users (id),  -- staff, or the job's service user
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_requests (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  requester_kind   TEXT NOT NULL CHECK (requester_kind IN ('real_estate_commission', 'hud',
                     'contract_administrator', 'housing_finance_agency', 'owner', 'investor',
                     'lender', 'court', 'attorney_general', 'other')),
  requester_name   TEXT NOT NULL,
  authority        TEXT,                   -- statute, agreement section, subpoena number
  scope            JSONB NOT NULL,         -- properties, periods, record types, sample units
  received_on      DATE NOT NULL,
  due_on           DATE NOT NULL,
  legal_hold_id    UUID REFERENCES legal_holds (id),
  status           TEXT NOT NULL CHECK (status IN ('open', 'producing', 'produced',
                     'findings', 'closed')),
  findings         TEXT
);

CREATE TABLE audit_productions (          -- what left the building, and its fingerprint
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  audit_request_id UUID NOT NULL REFERENCES audit_requests (id),
  as_of            TIMESTAMPTZ NOT NULL,
  manifest         JSONB NOT NULL,         -- each file: record type, ids, sha256
  reviewed_by      UUID NOT NULL REFERENCES users (id),
  delivered_at     TIMESTAMPTZ NOT NULL,
  delivered_via    TEXT NOT NULL
);
```

The disposal job's core is a guarded query: due records, minus everything any active hold covers.

```sql
SELECT d.record_type, d.record_id
FROM record_disposal_dates d
WHERE d.tenant_id = $1
  AND d.dispose_on <= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1
    FROM legal_holds h
    JOIN record_scope s ON s.tenant_id = d.tenant_id
                       AND s.record_type = d.record_type
                       AND s.record_id = d.record_id
    WHERE h.tenant_id = d.tenant_id
      AND h.released_at IS NULL
      AND (h.record_types IS NULL OR d.record_type = ANY (h.record_types))
      AND h.covers_period && s.period
      AND (s.property_id = ANY (h.property_ids)
           OR s.person_ids && h.person_ids
           OR s.lease_id = ANY (h.lease_ids)));
```

Design decisions:

- **Schedules are checked against law in both directions.** Saving a schedule shorter than any applicable `record_retention` rule fails; saving one longer than tenant policy's privacy ceiling warns. Each schedule records the rule ids it satisfies, so a change in law shows which schedules to revisit ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Disposal dates are computed at the trigger.** Move-out, waitlist removal and decision events write `record_disposal_dates`; a change of schedule recomputes future dates, never past disposals.
- **Holds win.** Disposal skips anything in a hold's scope, and placing a hold is a cheap, frequent action available to compliance staff, not an engineering ticket. A fair housing complaint opens one automatically ([Enforcement](/books/property-tech/fair-housing#enforcement)).
- **Crypto-shredding for documents and backups.** Sensitive documents are encrypted with per-record or per-person keys, so destroying the key disposes of every copy, including those in backups that can't be edited ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **The ledger is never deleted.** Charges, payments and trust entries are kept for the longest applicable rule; erasure on the resident ledger means replacing identity fields with a stable pseudonym after the retention period, not removing entries ([Privacy Erasure and the Audit Store](/docs/architecture/audit-trails#privacy-erasure-and-the-audit-store)).
- **Restricted stores for the most sensitive files.** VAWA documentation and accommodation verification live in a separate store with separate grants and read logging, as HUD's handbook requires for the former and confidentiality requires for the latter.
- **Productions are reproducible.** An audit production is generated as of a timestamp from the system of record, with a manifest of hashes, so the same production can be regenerated and compared if it's challenged.

## Auditing

- **Disposal.** Records past their disposal date and not destroyed, by type and reason (hold, failed job); disposal events by month with counts and stores covered. A disposal event that didn't cover every store the record type lives in is an exception.
- **Holds.** Active holds by age and matter, and holds whose matter is closed but which were never released.
- **Privacy requests.** Open requests by age against their deadlines, outcomes, and what was kept with which legal reason.
- **Access to sensitive categories.** Reads of consumer reports, accommodation verification and VAWA files, by user and purpose, reviewed periodically.
- **Audit requests.** Open requests against due dates, productions with their manifests, and findings with follow-up.
- **Schedules against law.** Schedules whose referenced `legal_rules` were superseded or retired since the schedule was last reviewed.

## What This Means for the System You Build

- **Classify data by what the law attaches to it,** carry the classification to every copy, and log reads of the sensitive categories.
- **Keep the decision, dispose of the report:** split consumer report contents from the decision record at ingestion.
- **Know whether you're the business or the processor** for each use of resident data, and put that in the contract.
- **Resolve retention minimums from rules,** compute disposal dates at the trigger, and check every schedule against law and privacy ceilings.
- **Let legal holds override disposal,** cheaply and automatically from complaints and audits.
- **Use crypto-shredding** so disposal reaches backups and every derived copy.
- **Never use a person's name or likeness to sell** without consent, even when the record is public.
- **Treat every audit as a scoped request** with a hold, a deadline and a reproducible, hashed production.

## References

**Regulations and statutes**

- [16 CFR 682.3: Proper disposal of consumer information](https://www.law.cornell.edu/cfr/text/16/682.3), the disposal standard and its three examples
- [26 CFR 1.42-5: Monitoring compliance with low-income housing credit requirements](https://www.law.cornell.edu/cfr/text/26/1.42-5), six-year record retention, agency inspections every three years, random selection, minimum sample table, 15 days' notice
- [10 CCR 2831: Trust fund records to be maintained](https://www.law.cornell.edu/regulations/california/10-CCR-2831), California brokers' columnar trust records and the three-year receipt rule
- [10 CCR 2831.2: Trust account reconciliation](https://www.law.cornell.edu/regulations/california/10-CCR-2831.2), monthly reconciliation and its written record
- [Ohio Revised Code 2741.02: Use of persona for commercial purposes](https://codes.ohio.gov/ohio-revised-code/section-2741.02), the consent requirement and its exceptions
- [HUD Handbook 4350.3 REV-1, Chapter 4 (PDF)](https://www.hud.gov/sites/documents/43503c4hsgh.pdf), record-keeping for applicants and tenants (4-22), VAWA documentation in a separate secure file, affirmative marketing records for compliance reviews

**Agencies and guidance**

- [FTC: Disposing of Consumer Report Information? Rule Tells How](https://www.ftc.gov/business-guidance/resources/disposing-consumer-report-information-rule-tells-how), landlords and service providers covered, tenant history as consumer information
- [California Privacy Protection Agency: 2025 increases for CCPA thresholds, fines and penalties](https://cppa.ca.gov/announcements/2024/20241217.html), the $26,625,000 revenue threshold effective January 1, 2025
- [Kutak Rock: CCPA employee and B2B exemptions set to expire](https://www.kutakrock.com/newspublications/publications/2022/12/ccpa-employee-and-b2b-exemptions-set-to-expire), the January 1, 2023 expiry and the Colorado, Connecticut, Utah and Virginia employment exclusions
- [MultiState: All of the comprehensive privacy laws that take effect in 2026](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026), twenty states with comprehensive laws and the 2026 effective dates (February 4, 2026)
- [Jackson Lewis: State data breach notification laws](https://www.jacksonlewis.com/insights/state-data-breach-notification-laws-overview-patchwork), every state and territory, timing and regulator notice

**Cases**

- [ClassAction.org: PropertyShark uses Ohio residents' personal data without permission, class action says](https://www.classaction.org/news/real-estate-platform-propertyshark-uses-ohio-residents-personal-data-without-permission-class-action-says), LaFleur v. Yardi Systems, No. 1:24-cv-01262, filed July 24, 2024

**In practice**

- [RealPage: Property management software](https://www.realpage.com/property-management-software/), Document Management, audit-readiness and housing compliance claims
- [Entrata: Entrata introduces Entrata Pro at Summit 2026](https://www.entrata.com/press/entrata-introduces-entrata-pro-at-summit-2026-giving-new-ai-capability-across-the-entrata-os), AI Admin's exportable audit trail and AI cost by property and owner
