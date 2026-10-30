+++
title = "Health Tech Architecture: Building It Yourself"
nav_title = "Health Tech Architecture"
description = "Tenancy by practice and group, PHI segmentation, the sync and integration layer, events, a FHIR facade over your model, audit everywhere and a reference build."
category = "Health Tech Industry"
order = 1960
part = "Running the Platform"
tags = ["health-tech", "architecture", "multi-tenancy", "fhir", "integration", "audit"]
+++

Every chapter of this volume ended with a How to Build It: a few tables extending the core model, the queries that matter and the events they emit. This chapter is where those pieces become one system. A health tech platform is unusual in three ways that shape everything else. Most of its data isn't born in it: the patient, the appointment and the ledger usually live first in someone else's system (a practice management system on a Windows server in the back office, a hospital's EHR, a payer's adjudication engine), and the platform holds a synchronized copy that must not drift. Almost all of its data is protected health information, so every store, log, queue, cache and vendor is inside a regulated boundary or must be kept out of it. And the outside world talks to it in four or five standards at once (HL7 v2, FHIR, X12, NCPDP, C-CDA), none of which is the shape of its own tables.

The chapter covers how the platforms draw those lines, tenancy for practices, groups and DSOs, segmenting PHI by sensitivity and by who may see it, the sync and integration layer, events, a FHIR facade over the volume's own model rather than a FHIR server as the model, audit as a first-class store, and a reference build. The general engineering is the playbook's ([Multi-Tenancy](/docs/architecture/multi-tenancy), [Events & Async Messaging](/docs/architecture/events), [Audit Trails](/docs/architecture/audit-trails), [HIPAA](/docs/compliance/hipaa#what-it-means-for-a-system)); the same exercise for other industries is [Commerce Architecture](/books/commerce/commerce-architecture) and [Platform Architecture](/books/property-tech/platform-architecture) for property management. It adds `inbound_messages`, `fhir_resource_versions` and `sensitivity_labels` to the core data model in The Health Tech Business, and extends `audit_events`, `integrations` and `sync_cursors`.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Platform | Shape | How data gets in and out | Tenancy and limits |
| --- | --- | --- | --- |
| **Open Dental** | On-premises practice management system with its database on the office's own server | An API in three modes: Remote requests go to Open Dental, which "routes request to the correct office," where the eConnector "accesses the database"; Local (port 30222) and Service (port 30223) run inside the office network | One database per practice or group; remote calls throttled to one per five seconds with read-only permission, one per second otherwise, 429 with `Retry-After` when a customer key's queue is full; 100 rows per page remotely, 1,000 locally; a 60-second limit; direct write queries "strictly forbidden" and actively blocked |
| **NexHealth** | A cloud platform that synchronizes with practices' own systems | The Synchronizer reads and writes "directly to your health record system without having to rely on the API" of that system, "often in seconds" | Its public status page lists the Synchronizer as a group of 16 components, one per supported system family, beside scheduling and communications |
| **Epic** | One instance per health system, run by the customer, by Epic or by a host | FHIR APIs in DSTU2, STU3 and R4 published on open.epic, plus Bulk FHIR export (kick-off, status, file and delete requests), HL7 v2 interfaces for the rest | The organization's own instance is the tenant; integrations are per customer |
| **Medplum** | Open-source, FHIR-native backend for building clinical apps | FHIR R4 API, subscriptions, bots | A Project is the tenant: projects "create a hard boundary between FHIR resources" and reference nothing across it; project linking shares read-only resources by type |
| **AWS HealthLake** | Managed FHIR R4 data store | FHIR REST, SMART on FHIR, Bulk Data export, import from S3, EventBridge events, Athena SQL; a data transformation agent (preview) converts C-CDA and CSV to FHIR | A data store per use; a HIPAA eligible service |
| **Google Cloud Healthcare API** | Managed FHIR, HL7 v2 and DICOM stores | FHIR stores "exist inside datasets"; changes published to Pub/Sub and streamed to BigQuery; DSTU2, STU3 and R4 | Dataset and store per tenant or per use, chosen by the builder |
| **Azure Health Data Services** | Managed FHIR, DICOM and de-identification services in one workspace | FHIR service with SMART on FHIR and role-based access; the older Azure API for FHIR was deprecated September 30, 2026 | Workspace per deployment |
| **Redox** | Integration network between vendors and provider organizations | Normalizes what each EHR sends; claims "12,200+" connected organizations and "14,900+" live integrations | One connection per customer organization, managed by the network |

Four patterns run through the table:

- **The data lives somewhere else first.** For anything that sells to existing practices or hospitals, the system of record for the patient and the schedule is the customer's PMS or EHR, and the platform is a synchronized consumer that writes back. Open Dental's routed API, NexHealth's synchronizer and Redox's network are three answers to the same problem: reaching a database the vendor doesn't run.
- **The tenant is the customer's organization, enforced below the API.** Medplum makes the project a hard reference boundary, the managed FHIR services make it a store or a dataset, and Epic makes it a whole instance. Nobody relies on a query filter alone.
- **FHIR is the interface, not necessarily the model.** The managed services store FHIR natively; most practice-facing products keep their own relational model and publish FHIR at the edge. Both work; the choice is about who owns the business rules (below).
- **Limits come from the weakest system in the chain.** A cloud platform syncing with an office server inherits that server's throttles, its uptime and its maintenance windows, and has to say so on its status page.

## Tenancy: Practices, Groups and DSOs

The customer that signs the contract and the business associate agreement is the tenant: a single dental office, a multi-specialty group, a dental service organization with hundreds of offices, a veterinary consolidator, a health system. Inside it sits a tree of `organizations` and `locations` (the practice's legal entities, the offices, the departments), and three things move through that tree the way [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) describes: settings inherit down (appointment types, reminder cadences, fee schedules), grants scope down (a regional manager sees the region's offices, a hygienist sees one office's schedule), and reports roll up from the same leaf rows. Multi-Location Groups & Call Centers covers the business side.

The health twists:

- **The tenant is the covered entity, or a set of them.** A DSO's offices may be separate legal entities, each a covered entity, under one management company that is their business associate; a group practice may be one covered entity with many locations. Who may see which patient across offices is a question of who the covered entity is and what the BAA says, not of the org chart. Record the legal entity on each location and decide cross-location visibility per tenant, as a setting with a recorded basis, not as a default.
- **One patient, several tenants.** The same person is a patient at a dental office and a physical therapy clinic that both use your platform. They are two `patients` rows in two tenants, never merged, because each practice's record is its own designated record set. Linking them for the person's convenience (one sign-in across both) is an identity on top, with the person's authorization, never a shared row ([Observations, Not Overwrites](/docs/architecture/record-linkage#observations-not-overwrites)).
- **Enforce it in the database.** Every PHI table carries `tenant_id`, and row-level security or a scoped connection turns a missing filter into an error instead of a breach ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)). A cross-tenant leak of PHI is a breach for every affected covered entity, with the 60-day clocks in [HIPAA](/docs/compliance/hipaa#the-three-rules).
- **Isolation models by size.** Pooled tables with `tenant_id` suit thousands of small practices; a schema or database per tenant suits a DSO or health system whose contract asks for it, whose data volume is large, or whose region differs ([Isolation Models](/docs/architecture/multi-tenancy#isolation-models)). Epic's instance-per-customer is the far end; the managed FHIR services let you choose per tenant.
- **Where the data sits is now law in places.** Texas SB 1188 (effective September 1, 2025) requires a covered entity to keep electronic health records "physically maintained in the United States or a territory," including records at a cloud provider, for storage from January 1, 2026; a platform with offshore replicas, support or backups has to know which tenants that binds and keep their data, backups included, in US regions.
- **Vet clinics are tenants too, with different rules.** A veterinary practice isn't a HIPAA covered entity; its records are confidential under state veterinary law, and its patient is an animal whose client is the owner. The same platform carries both by making the regime a property of the tenant, not a fork of the code (Veterinary Practice).

## Segmenting PHI

HIPAA treats PHI as one category, but a platform holds data at several levels of sensitivity and with several audiences, and the architecture has to keep them apart:

| Segment | Examples | Who may see it | How it's kept apart |
| --- | --- | --- | --- |
| **Operational PHI** | Name and phone beside an appointment, a reminder, a balance | Front desk, billing, the patient engagement features | The default tenant-scoped tables, minimum necessary by role |
| **Clinical PHI** | Notes, problem lists, medications, images | Clinicians and the patient; not the marketing or review features | Separate tables and storage paths, role checks, field-level masking in support tools |
| **Specially protected** | Substance use disorder records under 42 CFR Part 2, reproductive, mental health, HIV and genetic data under state law | Narrower roles and consent-dependent disclosure | A sensitivity label on the record, checked on every read and every outbound message (the law is State Health Privacy & Sensitive Data) |
| **Identifiers only** | Internal IDs, hashed tokens | Analytics, error tracking, vendors without a BAA | Scrubbed at the boundary; the playbook's rule that "no BAA" means "PHI must never get here" ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)) |
| **De-identified** | Safe Harbor or expert-determined data sets | Analytics, product research, model training | Produced by a governed release, outside the PHI boundary ([De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use)) |

Three rules make segmentation real rather than a diagram:

- **Label records, not tables.** A note written in a Part 2 program is clinical and specially protected; a note from the same clinician in a general practice isn't. The label belongs to the record (and is inherited by the documents, messages and claims derived from it), set at creation from the source program, the encounter type or the code. The sensitivity labels in HL7's security labeling vocabulary are the standard words for it, and FHIR carries them in `meta.security`. ONC's certification program had criteria for sending and receiving security tags on summary-of-care documents; the HTI-5 final rule, published October 28, 2026, removes both (§ 170.315(b)(7) and (b)(8)), so certified EHRs won't reliably send labels to you. A platform that receives sensitive data has to label it itself, from what it knows about the source.
- **Check the label on the way out.** Every outbound path (a reminder text, a FHIR read, an export, a support view, an AI prompt) is a disclosure, and each one consults the label and the patient's consents before sending. A reminder for a substance use treatment appointment that names the program in the text is the failure this prevents.
- **Keep the analytics copy outside.** The warehouse, the product analytics and the model-training sets read de-identified or tokenized data produced by a governed job, never a replica of the PHI tables ([Keep Analytics Off Production](/docs/architecture/data-pipelines#keep-analytics-off-production)). The smallest PHI boundary is the cheapest one to defend.

Encryption is the floor under all of it: HIPAA's technical safeguards make encryption of ePHI addressable rather than required, and the playbook's position is to treat it as required for any cloud system ([The Three Rules](/docs/compliance/hipaa#the-three-rules)). Per-tenant keys add the option of [crypto-shredding](/docs/security/encryption-at-rest#crypto-shredding) a tenant's data at contract end, after the retention the practice owes has been handed back to it.

## The Sync and Integration Layer

Most health platforms are integration platforms with a product on top. The layer that talks to practice management systems, EHRs, clearinghouses, labs and pharmacies is where reliability is won or lost, and it has the same shape for every connection:

- **One `integrations` row per connection.** The external system, the tenant and location it serves, the method (an on-premises agent, a vendor API, an HL7 v2 feed over MLLP, a FHIR endpoint, an SFTP drop, a network like Redox), the credentials by reference, the API version and the rate-limit state. Integrating with Practice Management Systems owns the PMS specifics; this is the shape every connector shares.
- **A cursor per object per connection.** `sync_cursors` holds how far each stream has read (a last-modified timestamp, a change sequence, a FHIR `_since`, an HL7 message control ID), so a restart resumes and a backfill is a cursor reset, not a code change.
- **Store what arrived before acting on it.** Every inbound HL7 message, FHIR notification, X12 file and webhook lands in `inbound_messages` as received, unique on the sender's ID, then is parsed and applied ([Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)). An argument with an interface about what it sent is settled by the stored bytes, and a parser bug is fixed by reprocessing.
- **Agents in the closet are a fleet.** A sync agent on a practice's Windows server is software you operate on hardware you don't: it needs versioned releases, signed updates, a heartbeat, a last-successful-sync time per object the practice can see, and an alert when it stops. The commonest support ticket in this industry is that reminders stopped because the sync stopped, and the platform should know before the practice does.
- **Write-back is a command with a receipt.** Booking an appointment into the PMS, posting a payment to its ledger or saving a form to its chart is a command sent to the agent or API with an idempotency key, acknowledged with the PMS's own ID, and reconciled if no receipt comes ([Commands vs Events](/docs/architecture/events#commands-vs-events)). Open Dental blocks direct write queries outright, so every write goes through an API the vendor controls.
- **Drift is measured, not assumed.** A daily reconciliation compares counts and checksums per object (appointments in the next 14 days, active patients, open balances) between the PMS and the platform's copy, and a difference opens a ticket before a patient gets a reminder for an appointment that was cancelled.
- **Respect the weakest link's limits.** A remote API throttled to one call per second per office makes a full patient resync an overnight job; the design is incremental cursors, priority for near-term appointments, and backoff on 429 with `Retry-After` ([Handling a 429](/docs/requests/rate-limiting#handling-a-429)).

Translation lives in this layer and nowhere else. The connector maps the PMS's provider codes, appointment types, procedure codes and payer IDs to the platform's records through crosswalks ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)), and the core never sees an Eaglesoft column name or an HL7 segment.

## Events

The platform's own state changes go out through an outbox, as in every volume ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)): `appointment.booked`, `appointment.confirmed`, `appointment.cancelled`, `patient.updated`, `form.submitted`, `payment.posted`, `claim.submitted`, `remittance.received`, `message.received`, `consent.revoked`. Three health-specific rules:

- **Events carry IDs, not PHI.** An event says `appointment.cancelled` with the appointment ID, the tenant and the version; a consumer that needs the patient's name fetches it under its own access check. The broker, its retention and its dead-letter queue then hold no PHI, and a misrouted event discloses nothing. FHIR's topic-based Subscriptions offer the same choice to outside consumers, with `id-only` notifications beside `full-resource` ones.
- **Order per patient and per appointment.** Partition by the entity so a confirmation never overtakes the booking it confirms, and carry a version so a stale event is dropped ([Ordering](/docs/architecture/events#ordering)).
- **Inbound and outbound share a vocabulary.** An appointment confirmed by text on the platform and one confirmed at the PMS's front desk both become `appointment.confirmed` once applied, with the source recorded, so a reminder workflow doesn't care where the confirmation happened.

## A FHIR Facade Over Your Model

Two architectures sell, and they differ in where the business rules live:

- **FHIR as the model.** Store FHIR resources natively (Medplum, HealthLake, the Google and Azure services), put the product's logic in application code and bots, and get standards compliance for free. It suits clinical apps whose world is FHIR-shaped, and it makes US Core conformance a configuration problem.
- **Your model, FHIR at the edge.** Keep the relational model this volume builds (appointments with operatories and chairs, ledgers with guarantors, recall rules, claims with lines and adjustments) and publish FHIR as a facade. It suits practice management and revenue cycle products, whose invariants (a ledger balances, a slot is booked once, a claim's lines sum) are relational and whose concepts FHIR represents loosely or across several resources.

My default for anything practice-facing is the second. The facade is a module with its own rules:

- **One mapping per resource, versioned.** `patients` to Patient, `practitioners` and `practitioner_roles` to Practitioner and PractitionerRole, `appointments` to Appointment, `appointment_slots` to Slot, `coverages` to Coverage, `claims` to Claim, `remittances` to ExplanationOfBenefit, `consents` to Consent, `audit_events` to AuditEvent, following the mapping column in The Health Tech Business. The mapping is code in version control, tested against the US Core profiles the API claims.
- **Stable logical IDs and real versions.** A FHIR client expects `Patient/123` to mean the same patient forever and `meta.versionId` to change when the content does. `fhir_resource_versions` records each published version's ID and hash, so `_history`, `_since` and ETags work from the facade's own record instead of from whichever row changed underneath.
- **Search is a product decision.** Each supported search parameter is an index and a query plan; publish a capability statement that lists only what is supported and fast, as every EHR's FHIR documentation does.
- **Bulk export reads a snapshot.** Bulk Data (`$export`, now at STU3 of its implementation guide) produces NDJSON files per resource type for a group or a whole system; build it from a consistent read replica or the analytics copy's PHI-zone extract, never by paging the primary database for hours ([Bulk Operations](/docs/requests/bulk-operations)).
- **Authorization is SMART, scoped to the tenant.** Every token is issued by the tenant's authorization server or carries the tenant, and patient-level scopes narrow it to one patient's compartment (SMART on FHIR & App Platforms covers scopes and launch).
- **Writes go through the domain.** A FHIR `POST Appointment` is translated into the same booking command the product's UI uses, with the same slot check and the same events; the facade never writes tables directly.

## Audit Everywhere

HIPAA's audit control standard asks for mechanisms "that record and examine activity in information systems" that contain or use ePHI (45 CFR 164.312(b)), and the playbook's audit store is the shape ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)). The health version adds three requirements:

- **Reads are audited, by patient.** The question a privacy officer asks is "who looked at this patient's record," so every read of PHI (a chart view, a search result opened, a FHIR read, an export, a support session) writes an access event keyed by patient, not only writes ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)). FHIR's AuditEvent resource and IHE's Basic Audit Log Patterns (BALP 1.1.4, built on AuditEvent) define a patient-centric shape that can be published to a customer's own monitoring.
- **Machines are actors.** Sync agents, interface engines, scheduled jobs, AI features and support staff each act under a typed identity ([Typed Actors](/docs/architecture/audit-trails#typed-actors)), so "the PMS sync changed the appointment" and "a hygienist changed it" are distinguishable years later.
- **Disclosures are their own record.** Releases outside treatment, payment and operations go to the `disclosures` table the core model reuses from the playbook, because a patient may ask for an accounting of them; the audit store isn't a substitute.

ONC's certification criteria for auditable events, audit reports and auditing actions on health information (§ 170.315(d)(2), (d)(3) and (d)(10)) apply to certified EHR modules, and HTI-5's list of removed and revised criteria leaves them in place; a platform that isn't certified still meets its customers' expectations by producing the same reports.

## A Reference Architecture

Built yourself, the system this volume describes is a short list of parts, each the owning chapter's tables behind a module interface:

- **A transactional core.** One relational database per pool of tenants, holding patients, scheduling, communications, forms, ledgers, claims and consents as modules, with the outbox in the same database so state and event commit together ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)).
- **An integration tier.** Connectors per external system, the on-premises agent fleet, an interface engine for HL7 v2, a clearinghouse connection for X12, and `inbound_messages` as the landing zone.
- **A communications tier.** Texting, voice, email and fax through providers under BAAs, with consent and quiet-hours checks in front ([Notifications](/docs/architecture/notifications)); Two-Way Texting & Messaging and Phones for Practices own the practice versions.
- **A FHIR facade and an API.** The standards face for EHRs, apps and partners, with SMART authorization.
- **An audit store.** Append-only, tamper-evident, queryable by patient and by actor ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **A document and image store.** Object storage for forms, attachments and images, encrypted, with access through the core's checks and signed, short-lived URLs ([File Uploads](/docs/architecture/file-uploads)).
- **A de-identified analytics zone.** Fed by governed release jobs, never by replication of PHI tables.
- **Workers.** Reminders, recall, statement runs, claim submission, eligibility checks, reconciliation and purges, each idempotent and per tenant ([Background Jobs](/docs/architecture/background-jobs)).

What I buy rather than build, even when building the rest: the clearinghouse connection, e-prescribing, card processing, telephony carriers and the managed FHIR store if the product is FHIR-native. Each is a vendor with a BAA and an entry in the PHI inventory.

## How to Build It

The core model's `integrations` and `sync_cursors` carry every connection; this chapter adds the landing zone for what arrives, the facade's version record and record-level sensitivity, and extends the audit store:

```sql
ALTER TABLE integrations
  ADD COLUMN agent_version     TEXT,            -- on-premises sync agent build, null for cloud APIs
  ADD COLUMN last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN rate_limit_state  JSONB,           -- remaining budget, reset time, last Retry-After
  ADD COLUMN status            TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'degraded', 'disconnected', 'retired'));

ALTER TABLE sync_cursors
  ADD COLUMN last_success_at   TIMESTAMPTZ,     -- shown to the practice per object
  ADD COLUMN last_reconciled_at TIMESTAMPTZ,
  ADD COLUMN drift_count       INT;             -- differences found by the last reconciliation

CREATE TABLE inbound_messages (              -- everything external systems send, as received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  standard         TEXT NOT NULL CHECK (standard IN ('hl7v2', 'fhir', 'x12', 'ncpdp', 'ccda',
                     'vendor_api', 'webhook')),
  message_type     TEXT NOT NULL,             -- 'SIU^S12', 'Appointment', '835', 'appointment.updated'
  sender_message_id TEXT NOT NULL,            -- MSH-10, a notification ID, ISA13, a webhook ID
  body_ref         TEXT NOT NULL,             -- encrypted object storage key; PHI never in this row
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at       TIMESTAMPTZ,
  outcome          TEXT CHECK (outcome IN ('applied', 'stale', 'duplicate', 'rejected', 'failed')),
  ack_sent         TEXT,                      -- the ACK, 999 or HTTP status returned
  UNIQUE (integration_id, sender_message_id)
);

CREATE TABLE fhir_resource_versions (        -- what the facade has published, per resource
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  resource_type    TEXT NOT NULL,             -- 'Patient', 'Appointment', 'Coverage'
  logical_id       TEXT NOT NULL,             -- stable FHIR id, never reused
  version_id       BIGINT NOT NULL,           -- meta.versionId
  source_table     TEXT NOT NULL,
  source_id        UUID NOT NULL,
  content_sha256   BYTEA NOT NULL,            -- a new version only when the rendering changes
  mapping_version  TEXT NOT NULL,             -- the facade code that rendered it
  last_updated     TIMESTAMPTZ NOT NULL,      -- meta.lastUpdated, drives _since
  deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (tenant_id, resource_type, logical_id, version_id)
);
CREATE INDEX fhir_resource_versions_since
  ON fhir_resource_versions (tenant_id, resource_type, last_updated);

CREATE TABLE sensitivity_labels (            -- record-level labels beyond ordinary PHI
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  record_table     TEXT NOT NULL,             -- 'documents', 'encounters', 'conditions', 'communications'
  record_id        UUID NOT NULL,
  label            TEXT NOT NULL,             -- 'part2_sud', 'reproductive', 'mental_health', 'hiv', 'genetic'
  basis            TEXT NOT NULL,             -- 'source_program', 'code_value_set', 'manual'
  inherited_from   UUID,                      -- the record this label was propagated from
  set_by           TEXT NOT NULL,             -- typed actor
  set_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, record_table, record_id, label)
);

ALTER TABLE audit_events
  ADD COLUMN patient_id      UUID,            -- whose record was touched, for access reports
  ADD COLUMN action          TEXT,            -- 'C', 'R', 'U', 'D', 'E' as in AuditEvent.action
  ADD COLUMN purpose         TEXT,            -- 'treatment', 'payment', 'operations', 'support', 'export'
  ADD COLUMN labels_seen     TEXT[];          -- sensitivity labels on what was read
CREATE INDEX audit_events_by_patient ON audit_events (tenant_id, patient_id, occurred_at);
```

The outbound check, for any path that sends a record outside the tenant's clinical users:

```sql
-- A message or export may include this record only if no label on it blocks the purpose,
-- or an active consent covers the label for this recipient.
SELECT r.record_id
FROM unnest($1::uuid[]) AS r(record_id)
WHERE NOT EXISTS (
  SELECT 1 FROM sensitivity_labels l
  WHERE l.tenant_id = $2 AND l.record_table = $3 AND l.record_id = r.record_id
    AND NOT EXISTS (
      SELECT 1 FROM consents c
      WHERE c.tenant_id = $2 AND c.patient_id = $4
        AND c.status = 'active' AND l.label = ANY (c.covers_labels)
        AND c.recipient_ref = $5));
```

Design notes:

- **PHI never sits in a queue row.** `inbound_messages.body_ref` and the outbox's payloads point at encrypted objects or carry IDs only; the tables operators query during an incident hold metadata.
- **`tenant_id` references the contracting organization.** It is the top of the `organizations` tree for that customer, and row-level security keys on it; location and department scoping is a second check inside it.
- **`consents.covers_labels` and `consents.recipient_ref`** are columns this check assumes on the core model's `consents`; Consent, Authorization & Proxies owns their meaning.
- **A FHIR version is minted only when the rendering changes.** The hash comparison keeps `_since` queries and subscriptions from firing on internal column changes a client can't see.
- **Labels propagate, and the propagation is recorded.** A claim built from a labeled encounter inherits the label with `inherited_from`, so removing the source label is a reviewable event, not a silent cascade.
- **Emit `integration.degraded`, `integration.disconnected`, `sync.drift_detected` and `sensitivity_label.set`,** which operations and the practice's own dashboard consume.

## Auditing

- **Every access to a patient's record,** read or write, by any actor, queryable by patient for an access report and by actor for an investigation.
- **Every inbound message as received,** with the acknowledgment returned, so a missing result or a duplicated appointment traces to what arrived.
- **Every write-back to a customer's system,** with the command, the key, the receipt and the external ID.
- **Every label set or removed,** with its basis and who set it.
- **Every connector's health,** heartbeat, version and last successful sync per object, kept as history so "when did the sync stop" has an answer.

## What This Means for the System You Build

- **Make the contracting organization the tenant,** enforce it in the database, and never merge a patient across tenants.
- **Segment PHI by record-level labels** and check them on every outbound path; don't rely on senders to label for you.
- **Treat integration as the core product:** a row per connection, a cursor per stream, raw messages stored before processing, write-back as receipted commands and daily drift checks.
- **Run on-premises agents as a fleet** with heartbeats the practice can see.
- **Emit events with IDs, not PHI,** partitioned per patient and appointment.
- **Keep your relational model and publish FHIR as a facade** for practice and revenue cycle products, with stable IDs, real versions and writes through the domain.
- **Audit reads by patient,** type every actor, and keep disclosures separate from audit.
- **Keep analytics outside the PHI boundary,** fed by governed de-identification.

## References

**Regulation**

- [45 CFR 164.312: Technical safeguards (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.312), audit controls, emergency access and encryption as addressable
- [Federal Register: HTI-5 final rule (October 28, 2026)](https://www.federalregister.gov/d/2026-21943), removal of the security tag criteria and the effective dates
- [Texas Legislature: SB 1188, enrolled text (89th Legislature)](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), US storage of electronic health records from January 1, 2026, effective September 1, 2025
- [ASTP/ONC: HTI-5 final rule removals or revisions of certification criteria (October 26, 2026)](https://healthit.gov/resources/hti-5-final-rule-removals-or-revisions-of-certification-criteria/), the criteria removed and revised

**Standards**

- [HL7 FHIR R4: AuditEvent](https://hl7.org/fhir/R4/auditevent.html), the security audit record and its elements
- [IHE: Basic Audit Log Patterns (BALP)](https://profiles.ihe.net/ITI/BALP/), patient-centric AuditEvent patterns, version 1.1.4
- [HL7: Bulk Data Access IG](https://hl7.org/fhir/uv/bulkdata/), the current STU3 release
- [HL7: Subscriptions R5 Backport IG, notifications](https://hl7.org/fhir/uv/subscriptions-backport/notifications.html), id-only and full-resource payloads

**Platforms**

- [Open Dental: API modes](https://www.opendental.com/site/apilocal.html), remote routing through the eConnector and the local and service ports
- [Open Dental: API implementation](https://www.opendental.com/site/apiimplementation.html), throttling, pagination, the 60-second limit and blocked direct writes
- [NexHealth: How the NexHealth Synchronizer works](https://nexhealth.com/resources/how-the-nexhealth-synchronizer-works), direct read and write and sync speed
- [NexHealth: Status page](https://status.nexhealth.com/), the Synchronizer component group
- [Epic: open.epic FHIR specifications](https://open.epic.com/Interface/FHIR), DSTU2, STU3 and R4 APIs and Bulk FHIR operations
- [Medplum: Projects](https://www.medplum.com/docs/access/projects), projects as hard boundaries and project linking
- [AWS: What is AWS HealthLake?](https://docs.aws.amazon.com/healthlake/latest/devguide/what-is.html), FHIR R4, SMART, bulk export, events and HIPAA eligibility
- [Google Cloud: FHIR concepts](https://docs.cloud.google.com/healthcare-api/docs/concepts/fhir), datasets, stores, versions and Pub/Sub
- [Microsoft Learn: What is Azure Health Data Services?](https://learn.microsoft.com/en-us/azure/healthcare-apis/healthcare-apis-overview), the services and the Azure API for FHIR deprecation
- [Redox](https://www.redoxengine.com/), connected organizations and live integrations
