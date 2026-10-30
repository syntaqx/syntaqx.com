+++
title = "Multi-Location Groups & Call Centers"
nav_title = "Multi-Location & Call Centers"
description = "DSOs and groups in software: location hierarchies over several PMSs, central scheduling and call centers, brand numbers, permissions, inboxes, reporting."
category = "Health Tech Industry"
order = 1941
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "dso", "multi-location", "call-center", "permissions", "reporting", "data-model"]
+++

Small practices are increasingly not small companies. A dental service organization (DSO) runs the business side of dozens or hundreds of dentist-owned offices; a management services organization (MSO) does the same for physician groups; corporate vet groups own thousands of hospitals; physical therapy and optometry roll-ups buy clinics city by city. Each acquisition arrives with its own practice management system (often a different one), its own phone numbers, its own brand that patients know, and its own front desk. The group then wants three things the software of a single practice never needed: one call center that can book any patient into any office, one view of performance across every office whatever system it runs, and one set of people and permissions that decides who sees which patients.

The engagement vendor's product changes shape when the customer is a group. The account is a tree, not a practice. A phone call can be answered by someone in another state for an office they've never seen. A patient may be in three locations' databases. And the reports have to add up across PMSs that define "production" differently. This chapter covers the group structures and why they constrain the data model, location hierarchies, central scheduling and the call center, brand and location numbers, permissions, shared inboxes, and enterprise reporting. The general machinery is elsewhere: tenant hierarchies in the playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies), the contact center in Field Operations' [The Contact Center](/books/field-operations/contact-center), and patient matching in [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity). This chapter extends `organizations`, `locations`, `practitioner_roles`, `patients`, `patient_identifiers` and `communications` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pages:

| System | Multi-location model | Notable |
| --- | --- | --- |
| **Open Dental** | Clinics: "multiple locations to be run from one database while keeping locations separate for reporting" | Operatories carry a clinic, so appointments in them do; users are restricted to clinics; claims take their clinic from their procedures and can't change it afterward |
| **Denticon** (Planet DDS) | Cloud PMS with "a single patient record" and centralized data | "Enterprise-level platform" reporting with production and collections analysis; implementation "8 weeks per location for DSOs" |
| **Dentrix Enterprise** (Henry Schein One) | An enterprise edition of Dentrix for groups | Named by engagement vendors as its own integration target (Weave's Bulk Collections lists "Dentrix Enterprise" separately from Eaglesoft and Fuse) |
| **ezyVet** (IDEXX) | Cloud PIMS with a Corporate Groups offering | "100+ certified integrations" shared across sites |
| **Dental Intelligence** | Analytics and engagement across practices | Integrates with Open Dental and "Open Dental Clinics," Eaglesoft, Dentrix, Dentrix Ascend and Denticon; sells by location count |
| **Field Operations' contact center suites** | For comparison: consolidators running shared centers for many brands | "The dialed number, not the caller, decides the brand" ([Who Answers](/books/field-operations/contact-center#who-answers)) |

Two patterns:

- **One database or many.** Open Dental's Clinics and Denticon's centralized record put every location in one PMS instance, so a patient is one record and a report is one query. A group that grew by acquisition usually has the other case: one PMS instance per office or per acquired group, on several products, and the engagement platform is where they first meet.
- **The location is set by the room.** Open Dental derives an appointment's clinic from its operatory, and a claim's clinic from its procedures. That's the right instinct: the location of a service is a fact about where it happened, not a field someone chooses, and it decides the billing entity, the provider's credentials and the report it lands in.

## Why Groups Are Shaped the Way They Are

Many states restrict who may own a medical, dental or veterinary practice or control clinical decisions ([Corporate practice doctrines](/books/health-tech/practice-business#corporate-practice-doctrines)), so a DSO or MSO usually manages professional entities that licensees own, under a management services agreement ([DSOs and MSOs](/books/health-tech/practice-business#dsos-and-msos)), and veterinary consolidators own hospitals outright where states allow it ([Veterinary consolidators](/books/health-tech/practice-business#veterinary-consolidators)). The engagement platform's customer is the DSO, but the data belongs to several legal entities:

- **Each practice entity is a covered entity** with its own tax ID, its own merchant account and its own payer contracts, and the DSO is its business associate. Patient data flows between offices of the same practice entity for treatment; between different practice entities it's a disclosure that needs a basis (treatment of the same patient, or the patient's authorization).
- **Money stays per entity.** Payments, deposits and refunds belong to the entity that provided the care ([Who Holds the Merchant Account](/books/health-tech/patient-payments#who-holds-the-merchant-account)).
- **Brands are not entities.** Ten offices may share a consumer brand while belonging to four practice entities; one entity may operate under two brands after an acquisition. Brand, entity and location are three different trees.

The engineering consequence: the hierarchy is a graph of typed organizations, and every record that carries patient data names the practice entity that holds it, not just the location.

## Location Hierarchies

The group's tree usually reads: group (the DSO or MSO) at the top, then regions, then practice entities, then locations, with brands as a separate attribute. The playbook's rules for tenant hierarchies apply directly ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)): configuration inherits down with explicit overrides, permissions are grants at a node covering its subtree, and reports roll up from leaf rows. What health adds:

- **Two parents.** A location sits under a region for operations and under a practice entity for legal and financial purposes. The region tree drives managers, permissions and operational reports; the entity tree drives billing, payer contracts and compliance. Model both, and stamp both on every row that needs them.
- **Settings that are clinical.** Reminder cadences, recall intervals and appointment types inherit down like any setting, but some are clinical decisions an owner dentist or medical director sets for their entity, not the DSO; the setting's owner is part of its definition.
- **Providers float.** A hygienist works Monday at one office and Thursday at another; a specialist rotates through five. A provider's role is per location (`practitioner_roles` already is), and their schedule is the union.
- **Acquisitions and divestitures are moves.** An office joining the group arrives with history in its own PMS; an office sold leaves with its patients' records under the new owner. Each entry stamps the entity and location it had when written, so history doesn't silently move with the node.

## Central Scheduling and the Call Center

A group's call center answers for every office: new patients finding the nearest one, existing patients rescheduling, overflow when an office's front desk is busy, and after-hours. Field Operations' [The Contact Center](/books/field-operations/contact-center) covers the general model (roles, routing, outcomes, QA); the practice twists:

- **Find the patient across locations first.** A caller's number is matched against patients in every location the agent may book for, and the agent sees the patient's home office, upcoming appointments, recall due, unscheduled treatment and balance in one screen. When the patient exists in several PMS instances (they moved, or two offices of the same brand each registered them), the screen shows the linked records, and booking happens in the instance of the office chosen.
- **Book into the office's real schedule.** Central scheduling only works when the agent sees each office's live availability by provider, operatory and appointment type, with that office's rules (new-patient slots, hygiene blocks, doctor's preferences). The agent books through the same API the online booking product uses (Scheduling & Online Booking), and writes into the office's PMS through the integration, never into a separate calendar the office doesn't see.
- **Insurance shapes the choice.** A new patient's plan may be in network at one office and not another (each practice entity has its own contracts), so the location finder filters by network participation, not just distance.
- **Clinical triage has scripts.** A caller with a dental emergency, a dog that ate something, or post-surgical pain is routed by a script to the right office's urgent slot or to emergency care, and the script version is recorded with the call ([Scripts and Triage](/books/field-operations/contact-center#scripts-and-triage)).
- **Minimum necessary still applies.** An agent booking a cleaning doesn't need the patient's clinical notes; the call center role sees schedule, demographics, coverage summary and balances, and the clinical record is a separate grant.
- **Recording and AI.** Calls are recorded with an announcement, and transcripts are PHI; Phones for Practices covers consent, and Practice Analytics & AI Front Desk covers AI agents beside the human ones.

### Measuring the Center

The center is measured the way a field operations center is (answer rate, abandonment, booking rate, handle time; [Measuring the Center](/books/field-operations/contact-center#measuring-the-center)), with practice outcomes added: new patients booked per location, appointments booked that were kept (a booked appointment that no-shows isn't a win), recall and treatment appointments booked from outbound lists, and booking rate per office, because a center that books every caller into the office with open chairs isn't serving the office the patient wanted.

## Brand Numbers and Location Numbers

A group has more phone numbers than offices: each office's long-standing local number, brand numbers on billboards and websites, tracking numbers per marketing campaign, a central new-patient line, and text-enabled numbers for each. The dialed number decides how a call is answered:

| Number | Who answers first | Greeting | Booking scope |
| --- | --- | --- | --- |
| **Office's local number** | That office's front desk; overflow to the center | The office's name | That office, then nearby offices of the brand |
| **Brand number** | The center | The brand | Any office of the brand |
| **Campaign tracking number** | The center or the office, per campaign | The brand or office | Per campaign, with attribution recorded |
| **Central new-patient line** | The center | The brand | Any office in network for the caller's plan |

Text messages follow the same rule in reverse: a patient replies to the number that texted them, so outbound texts go from the office's number, and the reply lands in that office's inbox (or the center's, by rule). Each number is registered for texting under the right brand and campaign (Two-Way Texting & Messaging and the Hosting & Cloud volume's [Texting Registration](/books/hosting-and-cloud/texting-registration)), and porting an acquired office's numbers is a project of its own ([Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting)).

## Permissions

Group permissions are grants at a node of the hierarchy covering its subtree ([Authorization](/docs/security/authorization)), with roles that reflect who does what:

| Role | Scope | Sees |
| --- | --- | --- |
| **Front desk** | One or a few locations | Schedules, demographics, coverage, balances, messages for those locations |
| **Office manager** | A location | The above, plus office reports and staff |
| **Call center agent** | Many locations | Scheduling and demographics across them; no clinical notes by default |
| **Billing office** | A practice entity or the group | Ledgers, claims, payments; clinical detail only as billing needs |
| **Clinician** | Locations where they practice | The clinical record of patients they treat |
| **Regional manager** | A region | Reports and operations for its locations |
| **Group executive** | The group | Aggregate reports; patient-level data only by explicit grant |

Rules that matter more in health care than elsewhere:

- **Patient-level access is logged and reviewable.** Every view of a patient record by a user outside that patient's location is an access event, and access reports by user are what a privacy officer reviews ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Aggregate isn't a backdoor.** A regional dashboard shows counts and dollars; drilling into a list of patients is a patient-level grant, checked and logged like any other.
- **Grants expire.** A floating hygienist's access to an office follows their schedule there, and a departed employee's grants end at termination in every location at once.

## Shared Inboxes

A group's messages (patient texts, web chat, emails, form submissions, voicemail transcripts) land in inboxes, and the question is whose:

- **An inbox per location** is the default: the office's number, the office's staff.
- **A central inbox** takes overflow and after-hours, and some message types by rule (new-patient inquiries, billing questions to the billing office).
- **Assignment and status** make it a queue rather than a feed: each conversation has an owner, a status (open, waiting on patient, closed), and an SLA; Field Operations' [Two-Way Texting and the Shared Inbox](/books/field-operations/customer-communications#two-way-texting-and-the-shared-inbox) has the general model.
- **Moving a conversation moves its scope.** When the center hands a conversation to an office, the office's staff gain it and the center's agents keep only what their role allows; the handoff is an event in the conversation's history.
- **The patient sees one thread.** Whoever answers, the patient's thread with the office's number is continuous, and every message records which user sent it.

## Enterprise Reporting Across PMSs

The group's question ("how are we doing, by office, this month?") meets a hard fact: the numbers live in several PMSs that define them differently. Production may be gross or net of write-offs; collections may include insurance payments posted to the month of service or the month received; a "new patient" may mean first visit ever or first visit at this office. Enterprise reporting is a translation layer:

- **Extract the facts, not the reports.** Sync the underlying records (procedures with fees and dates, payments, adjustments, appointments) from each PMS rather than its canned reports, so every office's numbers come from the same formula ([Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#metrics-defined-once) defines them).
- **Map codes and types.** Payment types, adjustment types and appointment types are each PMS's own definitions (Open Dental's payment types are the practice's own definition list); a mapping per instance to the group's categories is data someone owns and reviews.
- **Stamp location and entity at the source.** Each fact carries the location and practice entity it belonged to when it happened, so a moved office's history stays where it was.
- **Show freshness.** Each instance syncs on its own schedule (an on-premises server that's off at night syncs in the morning), so every report shows as-of per location, and a stale office is visible rather than a silent zero.
- **Reconcile to the PMS.** A location's monthly production in the group report should match the office's own PMS report under the same definition; the difference, when there is one, is a mapping bug to fix.

## How to Build It

The core model already carries most of the legal tree: `organizations` has a `kind` (`practice`, `group`, `dso`, `mso`) and a `parent_id`, every location belongs to the practice entity in `locations.organization_id`, and [The Practice Business](/books/health-tech/practice-business#how-to-build-it) adds `organization_affiliations` for who manages, owns or acquired whom, with dates. This chapter adds the operational tree (regions and brands as groups of locations), staff assignments, the meaning of each number, shared inboxes and the reporting mappings:

```sql
CREATE TABLE location_groups (               -- regions, brands and other operational groupings
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the group (DSO, MSO) that defines it
  kind            TEXT NOT NULL CHECK (kind IN ('region', 'district', 'brand', 'call_center_pool')),
  name            TEXT NOT NULL,
  parent_id       UUID REFERENCES location_groups (id),  -- districts inside regions
  path            LTREE NOT NULL           -- materialized path for subtree checks
);

CREATE TABLE location_group_members (
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  location_group_id UUID NOT NULL REFERENCES location_groups (id),
  location_id       UUID NOT NULL REFERENCES locations (id),
  valid_during      DATERANGE NOT NULL,    -- an office moving regions keeps its history
  PRIMARY KEY (location_group_id, location_id, valid_during)
);

ALTER TABLE locations
  ADD COLUMN pms_location_ref TEXT;        -- Open Dental clinic number, Denticon office ID: one
                                           -- integration can serve several locations

CREATE TABLE location_payer_networks (       -- in network where, for the location finder
  organization_id UUID NOT NULL REFERENCES organizations (id),
  location_id     UUID NOT NULL REFERENCES locations (id),
  plan_id         UUID NOT NULL REFERENCES plans (id),
  status          TEXT NOT NULL CHECK (status IN ('in_network', 'out_of_network', 'pending')),
  valid_during    DATERANGE NOT NULL,
  PRIMARY KEY (location_id, plan_id, valid_during)
);

ALTER TABLE phone_numbers                    -- Phones for Practices' table: what each number means
  ADD COLUMN number_kind    TEXT CHECK (number_kind IN ('location', 'brand', 'campaign', 'central')),
  ADD COLUMN brand_group_id UUID REFERENCES location_groups (id),
  ADD COLUMN campaign       TEXT,
  ADD COLUMN first_answer   TEXT CHECK (first_answer IN ('location', 'center', 'ai_agent')),
  ADD COLUMN greeting_as    TEXT,            -- the name callers hear
  ADD COLUMN booking_scope  TEXT CHECK (booking_scope IN ('location', 'brand', 'network', 'group'));

CREATE TABLE staff_assignments (             -- a role at a node, covering its subtree
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the tenant that granted it
  user_id         UUID NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('front_desk', 'office_manager', 'call_center',
                    'billing', 'clinician', 'regional_manager', 'executive', 'privacy_officer')),
  scope_kind      TEXT NOT NULL CHECK (scope_kind IN ('organization', 'location_group', 'location')),
  scope_id        UUID NOT NULL,
  clinical_access BOOLEAN NOT NULL DEFAULT FALSE,  -- notes and charts, separate from scheduling
  valid_during    TSTZRANGE NOT NULL,      -- floaters and departures end on time
  granted_by      UUID NOT NULL
);

CREATE TABLE cross_location_patient_links (  -- one person in several PMS instances or entities
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),  -- the group that holds the link
  person_key      UUID NOT NULL,           -- the group's identity for the person
  patient_id      UUID NOT NULL UNIQUE REFERENCES patients (id),  -- one instance's record
  linked_by       TEXT NOT NULL CHECK (linked_by IN ('rule', 'review', 'patient')),
  confidence      NUMERIC(4,3),
  linked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_at     TIMESTAMPTZ
);

CREATE TABLE shared_inboxes (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  kind            TEXT NOT NULL CHECK (kind IN ('location', 'central', 'billing', 'new_patient')),
  location_id     UUID REFERENCES locations (id),
  sla_minutes     INT
);

ALTER TABLE conversations                    -- Two-Way Texting & Messaging's table
  ADD COLUMN shared_inbox_id UUID REFERENCES shared_inboxes (id),
  ADD COLUMN assignee_id     UUID;

ALTER TABLE communications
  ADD COLUMN handled_by_user UUID,
  ADD COLUMN handled_from    TEXT CHECK (handled_from IN ('location', 'center', 'ai_agent'));

CREATE TABLE conversation_transfers (
  organization_id UUID NOT NULL REFERENCES organizations (id),
  conversation_id UUID NOT NULL REFERENCES conversations (id),
  from_inbox      UUID NOT NULL REFERENCES shared_inboxes (id),
  to_inbox        UUID NOT NULL REFERENCES shared_inboxes (id),
  by_user         UUID NOT NULL,
  reason          TEXT,
  at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pms_type_mappings (             -- each instance's codes to the group's categories
  organization_id UUID NOT NULL REFERENCES organizations (id),
  integration_id  UUID NOT NULL REFERENCES integrations (id),
  domain          TEXT NOT NULL CHECK (domain IN ('payment_type', 'adjustment_type',
                    'appointment_type', 'provider', 'fee_schedule')),
  source_code     TEXT NOT NULL,
  group_category  TEXT NOT NULL,
  reviewed_by     UUID,
  valid_during    DATERANGE NOT NULL,
  PRIMARY KEY (integration_id, domain, source_code, valid_during)
);
```

The access check for a patient's chart, in one indexed query:

```sql
-- May this user see the chart of a patient at this location? A clinical assignment on the
-- location, on any location group containing it, or on its practice entity or an ancestor.
SELECT EXISTS (
  SELECT 1
  FROM staff_assignments a
  JOIN locations l ON l.id = $2
  WHERE a.user_id = $1 AND a.clinical_access AND NOW() <@ a.valid_during
    AND (
      (a.scope_kind = 'location' AND a.scope_id = l.id)
      OR (a.scope_kind = 'location_group' AND EXISTS (
            SELECT 1 FROM location_group_members m
            JOIN location_groups g ON g.id = m.location_group_id
            JOIN location_groups ag ON ag.id = a.scope_id
            WHERE m.location_id = l.id AND CURRENT_DATE <@ m.valid_during
              AND g.path <@ ag.path))
      OR (a.scope_kind = 'organization' AND a.scope_id IN (
            WITH RECURSIVE up AS (
              SELECT id, parent_id FROM organizations WHERE id = l.organization_id
              UNION ALL
              SELECT o.id, o.parent_id FROM organizations o JOIN up ON o.id = up.parent_id)
            SELECT id FROM up))
    )
);
```

Design notes:

- **Two parents, stamped on facts.** The practice entity is `organization_id` on every row already; operational reports read `location_group_members` as of the fact's date, so an office that moved regions reports under the region it was in.
- **Links, not merges, across instances.** The same person in two PMS instances is two `patients` rows, often in different practice entities, joined by a `cross_location_patient_links` row. That is not a duplicate inside one chart, which [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity#merges-overlays-and-unmerges) handles with its own `patient_links` and merges; each instance remains the system of record for its office, and an unlink is reversible ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)). Showing a linked record from another practice entity is a disclosure, so the view checks the basis and, for a HIPAA covered entity, records it where the accounting rules require.
- **The number is the routing key.** The `phone_numbers` row decides greeting, first answer and booking scope; the call and text routing services read it, and the call's record stores the number dialed.
- **Mappings are reviewed data.** A new payment type in an acquired office's PMS lands as unmapped and shows up in a review queue before it can distort group reports.

## Auditing

- **Every grant, change and expiry,** by whom, and access reports per user across locations.
- **Patient record views outside the patient's location,** with the role and basis.
- **Every call and conversation** with the number dialed, who handled it, transfers and outcomes.
- **Every cross-entity link and view** of a linked record.
- **Every mapping change** and the reports it affected.

## What This Means for the System You Build

- **Model the group as typed organizations with two parents per location,** operational and legal, and stamp both on facts.
- **Treat each practice entity as its own covered entity:** its own merchant account, contracts and data, with the group as business associate.
- **Book centrally into each office's real PMS schedule** through the same API online booking uses, filtered by network participation.
- **Let the dialed number decide greeting, first answer and scope,** and reply from the number that texted.
- **Grant roles at nodes with expiry,** keep clinical access separate from scheduling, and log patient-level access.
- **Run inboxes as queues** with owners, statuses and recorded transfers.
- **Report from synced facts with reviewed mappings,** show freshness per location, and reconcile to each PMS.
- **Link patients across instances without merging them,** and treat cross-entity views as disclosures.

## References

**Vendors**

- [Open Dental: Clinics](https://www.opendental.com/manual/clinics.html), one database for multiple locations, clinic per operatory, user restrictions, claims' clinic from procedures
- [Planet DDS: Denticon](https://www.planetdds.com/denticon/), centralized patient record, enterprise reporting, DSO implementation per location
- [ezyVet](https://www.ezyvet.com/), corporate groups and certified integrations
- [Dental Intelligence](https://www.dentalintel.com/), PMS integrations including Open Dental Clinics, location-count sales
- [Weave: Payments](https://www.getweave.com/weave-payments/), Bulk Collections for Dentrix Enterprise, Fuse and Eaglesoft

**Playbook and other volumes**

- [Multi-Tenancy: Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies), settings inheriting down, grants on subtrees, reports rolling up, stamping paths
- [The Contact Center](/books/field-operations/contact-center), roles, routing, scripts and measurement for shared centers
