+++
title = "Integrating with Practice Management Systems"
nav_title = "PMS Integration"
description = "Reading and writing a practice's PMS: sync agents on the office server, vendor APIs and partner programs, write-back, fees, gatekeeping, drift and conflicts."
category = "Health Tech Industry"
order = 1929
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "pms", "integration", "sync", "dental", "veterinary", "data-model"]
+++

Every product a small practice buys beside its practice management system (PMS) lives or dies on one integration. Reminders need tomorrow's appointments, online booking needs open time and somewhere to write the booking, call pop needs the caller's family and balance, forms need to land in the chart, payments need to post to the ledger, analytics needs all of it. The PMS is the system of record for all of those things, and in dentistry, veterinary medicine, optometry and much of outpatient medicine it often isn't in the cloud. It's a Windows application with its database on a server in the back office, upgraded on the practice's schedule, sold by a vendor that may also sell the product you're competing with. Weave's 10-K says its platform "integrates with more than 90 practice management systems," that those integrations are "typically structured as commercial and technical partnership agreements" with payments to the PMS partners, and lists as a risk that PMS providers may "modify their technologies, standards, or terms of use in a manner that degrades the functionality" of its products. Phreesia's 10-K carries the same risk from the medical side. Integration is the moat and the liability of the whole patient engagement category.

This chapter covers how that integration works: where the data lives, the sync agent on the practice's server, the vendor APIs and partner programs, writing back, the fees and the gatekeeping fights, the unified APIs that sit in the middle, and how to keep a copy of someone else's database honest. It extends `integrations` and `sync_cursors` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). The records being synced are covered where they're used: [Scheduling & Online Booking](/books/health-tech/scheduling-and-online-booking), [Reminders, Confirmations & Recall](/books/health-tech/reminders-and-recall), [Digital Intake, Forms & Consent](/books/health-tech/digital-intake-and-forms), and in this part's second half, [Payments in the Practice](/books/health-tech/patient-payments) for ledger posting. The general engineering of matching external records and keeping crosswalks is the playbook's [Record Linkage](/docs/architecture/record-linkage); this chapter is the practice-software version.

## How the Platforms Do It

There are two sides: the systems of record, and the engagement vendors that read and write them. As of October 2026, from public documentation:

| System | Deployment | How third parties connect | What's published |
| --- | --- | --- | --- |
| **Open Dental** | Windows client, MySQL database on the office server; Open Dental Cloud option | REST API in three modes (Local, API Service, Remote through the office's eConnector), keys per developer and per customer | Full API reference, permission tiers and per-location fees paid by the developer, throttles, polling webhooks |
| **Dentrix, Dentrix Enterprise, Dentrix Ascend** (Henry Schein One) | Dentrix and Enterprise on premises; Ascend in the cloud | The API Exchange: application, security review, agreement and a program fee | Program pages and partner announcements; fees and API reference not public |
| **Eaglesoft** (Patterson) | On premises | No public developer program found | Version support appears only in integrators' docs |
| **Denticon** (Planet DDS) | Cloud | An "API Program" with sandbox and beta access | Partner list; no fees or auth model |
| **ezyVet** (IDEXX) | Cloud | OAuth 2.0 client credentials per clinic database; Commercial Partnership or Private Integration tracks | Full API reference, rate limits, webhooks |
| **Cornerstone** (IDEXX) | On premises | Named partner integrations | A partner list (PetDesk, Vetstoria, Weave, AllyDVM, IDEXX's own Vello); no API or terms |
| **athenahealth, eClinicalWorks, ModMed, NextGen Office** | Cloud | Vendor APIs and marketplaces (ModMed's is a Salesforce-hosted "Synapsys Marketplace"); integrators often connect with a dedicated user per practice | Varies; much of it behind partner sign-up |

And the vendors that connect to them:

| Integrator | How it reads | How it writes | What's published |
| --- | --- | --- | --- |
| **NexHealth** | A Synchronizer agent on the office server reading the PMS database; for cloud systems, a dedicated user and a Chrome extension kept signed in at the office | Asynchronous: the API accepts a write, the agent applies it later, a webhook reports the outcome | Hardware and OS table, database roles per PMS, ports and folders, sync-status thresholds, write lifecycle |
| **Sikka** | Sikka Platform Cloud agent "installed on the server where the practice management data resides" | Through its API, per PMS | Agent requirements (Windows 10, 11 or Server 2022 and later, .NET Framework 4.7.2) |
| **Dental Intelligence** (including Modento) | An Analytics Sync Client on the database machine and an Engagement "Bridge" | Forms write-back through a service for Dentrix Enterprise | A PMS support matrix with minimum versions and exclusions |
| **Weave** | A Data Sync App on the practice server, installed remotely by Weave | Through partner integrations where they exist | 90+ PMS integrations in its 10-K; install details in its help center |
| **PetDesk** | Reads client, patient and appointment data from the PIMS "without manual data exports" | Bookings write back ("all scheduling is automatically updated in Cornerstone") | A compatible-PIMS list |
| **Vetstoria** | "A direct, approved link to your PMS" per system, 29 listed | Confirms and writes bookings in real time | An integration table (Cornerstone, AVImark, ezyVet, Neo, Provet Cloud, Vetspire and others) |

<!-- source-gap: weave-data-sync-app | secondary | Weave's Data Sync App installed on the practice server by its install team and configured against the PMS database (from search snippets of weavehelp.com, which renders empty to fetch) | closes with: a fetchable Weave help center article on the Data Sync App's requirements and scope | checked: 2026-10-29 -->
<!-- source-gap: eaglesoft-api-program | missing | whether Patterson runs a developer or partner API program for Eaglesoft, and its terms | closes with: a Patterson or Eaglesoft partner page | checked: 2026-10-29 -->

The pattern across both tables: the cloud systems publish APIs and the on-premises systems mostly don't, so the engagement industry built its own access layer, a fleet of agents on practice servers, and the PMS vendors have spent the last few years pulling that access back into programs they control.

## Where the Data Lives

A practice's records sit in one of three places, and each dictates the integration:

- **A database on a server in the office.** Dentrix, Dentrix Enterprise, Eaglesoft, Open Dental (self-hosted), Cornerstone, AVImark and many optometry and orthodontic systems. The server is a Windows machine the practice or its IT provider owns, often a desktop in a closet, sometimes doubling as the front desk workstation. Dental Intelligence's sync client "must be installed on the same machine" as the PMS database and the machine "must remain powered on"; Open Dental's eConnector "should always be on and awake." When the office loses power at night, every cloud product beside it goes stale until morning.
- **A vendor-hosted database the practice can't reach directly.** Dentrix Ascend, Denticon, Curve, ezyVet, athenahealth, ModMed. There's no server to install on; access is through the vendor's API under the vendor's terms, or, where there isn't one, through a user account and the vendor's web screens.
- **A hosted copy of the on-premises product.** Open Dental Cloud runs the same software on a hosted virtual machine; its API Service runs on that VM and "the Cloud Client relays requests." Dental Intelligence lists Open Dental Cloud as "not compatible" with its sync. Hosted versions of desktop products are their own integration target.

The practical consequence is that an integration is a portfolio. Weave's 90-plus systems, NexHealth's 15 ("read and write across 15 health record systems through one API"), Vetstoria's 29 and Sikka's list are each a set of per-system connectors with their own version floors, quirks and contracts, behind one internal model.

## The Sync Agent

For on-premises systems the industry's answer is a Windows service installed on the server, reading the PMS database directly and talking out to the vendor's cloud.

### What It Takes to Install

NexHealth publishes the most complete requirements, as of its April 2025 help article: Windows Server 2016, 2019, 2022 or 2025, or Windows 10 or 11 ("running unsupported versions of Windows is a security and compliance risk"); a quad-core 64-bit CPU recommended (dual-core minimum), 16 GB of RAM with 2 GB free (8 GB with 1 GB free minimum), an SSD, and a wired connection. The database credentials show what the agent does: Dentrix Enterprise needs a SQL login with `db_datareader` and `db_datawriter`, Open Dental a MySQL user with "Full" permissions, Orthotrac `db_owner`. An agent with write roles on the PMS database is writing into it directly, not only reading. Sikka's agent asks for Windows 10, 11 or Server 2022 and later, 8 to 16 GB of RAM and .NET Framework 4.7.2, and warns that "the Xeon family of processors are known to have performance issue pulling data." Dental Intelligence asks for Windows 11 or Server 2016 with current security updates.

Two design points generalize. **The agent dials out.** NexHealth's firewall list (ports 4505 and 4506, plus 443, and a Salt Project folder) matches SaltStack's model, in which minions connect outbound to the master and "no inbound firewall changes" are needed on them; nothing listens on the practice network. **Installation is a service visit.** NexHealth's engineers install remotely over ConnectWise, Weave's install team does the same, and the agent needs administrator rights and specific runtimes. Each install is a support case, and every PMS upgrade, server replacement or antivirus update is a chance for the agent to stop.

### Reading: Polling, Timestamps and Cursors

Desktop PMS databases weren't designed to publish changes, so reading is incremental polling. Open Dental shows the pattern from the vendor's own side: its API filters appointments by `DateTStamp`, a last-modified timestamp, and its API Events "poll at `Subscription.PollingSeconds` for rows changed since `DateTimeStart`," batch up to 1,000 elements, hold `DateTimeStart` on failure and resend up to the last three days of changes. Deletes need their own signal, so its watch tables include `AppointmentDeleted` and `ScheduleDeleted` beside `Appointment` and `Schedule`. Events "only run while OpenDental.exe or OpenDentalAPIService.exe runs."

That's the shape any agent ends up with:

- **A cursor per table,** the last timestamp (or row version) successfully shipped, advanced only after the cloud acknowledges the batch. That's `sync_cursors`.
- **A watermark overlap.** Clocks on practice servers drift and transactions commit out of order, so each poll re-reads a few minutes behind the cursor and deduplicates by key and version.
- **Delete detection.** Either a deleted-rows table the PMS keeps, or a periodic full key scan that compares the set of keys against the copy.
- **A full resync** on install, after a long outage and on demand, because incremental sync accumulates errors.

NexHealth says changes in the PMS can take "several minutes to show up in the API," and its sync status reports `read_status` red when the last read is older than 150 minutes (configurable). Those two numbers bracket what a practice can expect: minutes when healthy, hours before anyone notices when not.

### Writing Back

Writing to the PMS is harder than reading, and NexHealth's documentation is the clearest public statement of why. A `POST /appointments` success means "NexHealth accepted the record... It is not in the health record system yet"; the record's `foreign_id` (the PMS's key) and `last_sync_time` stay null until the agent writes it; a webhook reports `appointment_insertion.complete`, `.failed` or `.timed_out` (timed out meaning the agent couldn't reach the PMS before the appointment start), with similar events for payments, adjustments, documents and form responses; and NexHealth "does not retry failed writes automatically." Its `write_status` goes red when the agent hasn't checked in for 25 minutes, so writes are pulled by the agent polling the cloud, not pushed into the practice. A cloud system has the same shape when the only access is a browser session: NexHealth's cloud sync goes offline "when nobody at the office is logged in to both the NexHealth Chrome extension and the EHR."

So a write-back is a job with a lifecycle, not a request. The patient who booked online at 11 p.m. has a booking in your system and nothing in the PMS until the server wakes, and the front desk opening the schedule at 7:30 may have already given the slot away. Design for it: show the patient a confirmation that is true ("requested" or "booked, pending"), let the practice see pending writes, re-check the slot when the write is applied, and turn a conflict into a task for a person rather than a silent failure.

What gets written back varies by vendor and by PMS: appointments and confirmation statuses most often, then patients (new patients from online booking and forms), form responses and documents, payments and adjustments, and least often clinical data. Dental Intelligence's matrix lists some systems as "analytics only" and others as "engagement only"; NexHealth syncs demographics, medications, allergies and conditions from forms into structured fields and saves a PDF to the document center. Each write-back type is a separate capability per PMS, and the product has to know which ones a given practice's system supports.

## Vendor APIs and Partner Programs

Where a PMS vendor publishes an API, the agent can be replaced by a contract, a key and a rate limit.

### Open Dental

Open Dental's API is the most open in dentistry, and the most completely documented. Resources "generally map 1:1 to database tables" (Appointments, AppointmentTypes, Patients, ProcedureLogs, Recalls, RecallTypes, Schedules, Operatories, Claims, Payments and more), and it says developers should have a BAA with their customers. Authentication is a header pairing two keys, `Authorization: ODFHIR {DeveloperKey}/{CustomerKey}`: the developer key identifies the vendor, and the customer key is generated by the developer for one office and pasted by the office into Setup, where the office can enable, disable and inspect it but not change its permissions. Developer Portal access comes by emailing vendor relations with the resources and permissions needed; "requests take one to three business days."

It runs three ways:

| Mode | Where it runs | Notes |
| --- | --- | --- |
| **Local** | On a workstation, `http://localhost:30222/api/v1/` | Starts with Open Dental after login, closes with it |
| **API Service** | On the database server, port 30223 | Installed with the eConnector; needs an inbound firewall rule |
| **Remote** | `https://api.opendental.com/api/v1/` | "OpenDental validates credentials and then routes request to the correct office" through its eConnector |

Local and Service validate credentials remotely once, valid for six hours, and can then run without internet; Open Dental recommends cascading Local, then Service, then Remote. Fees are per location per month, "paid by the developer," as of October 2026: Free for Read All (GET only, one request per five seconds), $15 adding communications, documents, simple insurance, setup and queries (one a second), $30 for everything but payments, payment plans and special permissions, $35 for all but special; clinics in a shared database count as separate locations, and Enterprise (Remote) throttles drop to 500 milliseconds. A read-only integration costs nothing; a write integration costs the vendor $30 to $35 per location per month, which is a line in the vendor's unit economics.

### Henry Schein One: Dentrix and Ascend

Henry Schein One took the opposite path. It announced the Dentrix Ascend API Exchange on July 13, 2023 as "an information marketplace for software vendors," open to "all vendors who follow approved security and safety standards," and the old Dentrix Developer Program address now redirects to it. As of October 2026 its vendor page says the Exchange is "trusted by 140+ vendors serving Dentrix and Ascend practices" and that "all integrated software vendors are SOC2 Type II and OAuth2.0 certified," and its customer page says "APIs are the only way to ensure data stays secure when it flows from Dentrix to a third party, and back again." A September 2025 Dentrix blog post says approved vendors pass a security test, sign an agreement and pay a program fee, and warns that unauthorized vendors can "put your data at risk" and "mess up your system." The fee amounts aren't public. <!-- source-gap: dentrix-api-exchange-fees | secondary | one-time READ and WRITE fees and monthly per-category royalties for the Dentrix API Exchange (a third-party report gives $5,000 each for READ and WRITE, citing a Dentrix FAQ that renders empty to fetch) | closes with: Henry Schein One's own program terms or FAQ text | checked: 2026-10-29 --> Henry Schein One also owns Lighthouse 360, a patient engagement brand, so the program's owner competes with some of the vendors it admits.

### Veterinary and Medical Systems

The cloud systems look like ordinary SaaS APIs. ezyVet uses OAuth 2.0 client credentials (`POST /v1/oauth/access_token` with a `partner_id`, `client_id`, `client_secret`, scope and the clinic's `site_uid`), limits most endpoints to about 60 calls a minute with a global default of 180 per database per partner, returns `x-ratelimit-*` headers, and offers webhooks and calendar endpoints (`/v4/calendar/availability`, `/v4/calendar/booking`). It separates a Commercial Partnership (one integration sold to many clinics) from a Private Integration (one practice's own use). Its documentation gives the token lifetime as 12 hours while its sample response shows 14 days, so read `expires_in` and refresh on 401 rather than trusting either. IDEXX's Cornerstone, on premises, publishes a partner list instead of an API. Medical cloud systems (athenahealth, eClinicalWorks, ModMed, NextGen Office) are reached through vendor marketplaces and partner APIs; NexHealth notes that eClinicalWorks support is cloud-only ("the on-premises version is not supported") and that for cloud systems "the practice creates a dedicated user for NexHealth." The FHIR APIs that certified EHRs must expose are a separate path, covered in this volume's [FHIR](/books/health-tech/fhir) and [SMART on FHIR](/books/health-tech/smart-on-fhir) chapters, and that certification program is built around human-health EHRs: veterinary systems sit outside it, and a dental PMS is inside it only if its vendor sought certification.

## Gatekeeping, Fees and the Law

Who may read a practice's database is a commercial fight, and in dentistry a public one.

**The practice owns its data; the vendor owns the software.** The engagement vendors' position is that a practice may authorize anyone to read its own records. The PMS vendors' position is that their software, schema and license terms govern how the database is accessed, and that unvetted agents writing into it are a security and integrity risk. Both have a point: a sync agent with `db_datawriter` on a production dental database is exactly what a security review would flag, and a PMS vendor that charges for API access while competing with the vendors it charges has an obvious conflict.

**The Vyne Dental dispute.** Vyne Dental, a dental claims clearinghouse, has published a series of statements since March 2025 on Henry Schein One's changes to Dentrix: "Official Statement RE: Henry Schein One, Dentrix Supportability" (March 28, 2025), statements in August 2025 on "Recent Henry Schein One Communications and Dentrix Compatibility" and on the Cures Act's information blocking regulations, and a page dated April 14, 2026 saying HSO describes the changes as "security-driven," that the API Exchange lacks the data elements claims submission needs, that joining "would force Vyne to discontinue its claim submission services for Dentrix customers entirely," and that Vyne offered to fund the missing APIs. Vyne's information blocking page cites 45 CFR part 171. Whether a dental PMS vendor is an "actor" under those rules depends on, among other things, whether it develops certified health IT (this volume's [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification#the-actors) chapter covers actors and exceptions), and I found no regulator decision on this dispute as of October 2026. <!-- source-gap: hso-vyne-information-blocking | status | whether any regulator (ASTP/ONC, OIG) or court has ruled on Henry Schein One's Dentrix access changes or Vyne Dental's information blocking claims | closes with: an OIG or ASTP/ONC statement, a complaint, or a court docket | checked: 2026-10-29 -->

**Antitrust history.** The distributors behind the two largest dental PMS brands have been in front of the FTC before, over supplies rather than software. The FTC's Part 3 complaint of February 12, 2018 alleged that Benco, Henry Schein and Patterson conspired "to refuse to provide discounts to or otherwise serve buying groups." An administrative law judge's initial decision of October 16, 2019 was announced by the FTC as partially ruling in favor of its complaint, and on November 8, 2019 the FTC announced that Benco and Patterson declined to appeal, making the decision final. Separately, the FTC's 2016 order against Henry Schein Practice Solutions (proposed January 5, final May 23, 2016) resolved charges that the Dentrix maker misled customers about the encryption of patient data. That case is the one integration teams should remember: what a PMS vendor says about security in a gatekeeping dispute is a claim, and claims about encryption have been enforced against this industry before.

**The fees.** Integration costs show up three ways: per-location API fees paid by the integrator (Open Dental's tiers), program fees and royalties (the API Exchange), and revenue-sharing partnership agreements (the structure Weave's 10-K describes). Whichever applies, it's a cost per location per month that scales with the integrator's customer count, so pricing for an engagement product starts from the integration bill of the PMS mix it sells into.

My rule for an integrator: use the vendor's sanctioned path wherever one exists and covers the data, even when it costs more than an agent; keep the agent for systems with no API, and document for every PMS which path is used, under what agreement, with what permissions. A practice will eventually ask, and so will a PMS vendor's lawyer.

## Unified APIs and Middlemen

Between the PMSs and the apps sits a layer that sells integration itself. NexHealth's developer API ("read and write across 15 health record systems through one API") puts an Institution (a group of practices, identified by a `subdomain`), a Sync ("one sync for each database") and a Location under every request, exchanges an API key for a bearer token at `POST /authenticates`, requires a `Nex-Api-Version` header, and offers webhook endpoints and subscriptions. Sikka sells the same kind of access behind its agent. For an app builder, a unified API trades control for coverage: one schema and one contract instead of fifteen, at the price of the middleman's latency, its data model's lowest common denominator, and its relationship with each PMS vendor. In medicine the equivalent layer is the interface engines and integration networks covered in [HL7 v2 & Interfaces](/books/health-tech/hl7-v2) and [Networks & Exchange](/books/health-tech/health-information-exchange) elsewhere in this volume.

My default: build direct connectors for the two or three systems that make up most of your customers, and buy a unified API for the long tail, keeping the internal model your own so a connector can be swapped without touching the product.

## Drift, Conflicts and Health Checks

A sync is a copy of someone else's database, and copies drift. The sources of drift in practice software are specific:

- **The PMS is edited directly.** The front desk drags an appointment, merges two duplicate patients, changes a recall interval. Your copy learns on the next poll, and anything you sent in between (a reminder, a booking) may have been against the old state.
- **Merges and renumbering.** A patient merge in the PMS retires one key; Open Dental's `PatNum` or Dentrix's patient ID that your records point at stops existing. The crosswalk has to follow the merge, not create a new patient ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)).
- **Upgrades and schema changes.** Dental Intelligence supports Dentrix G7 and later "excluding 23.1 to 23.5"; NexHealth and Dental Intelligence give different minimum versions for the same systems. A practice's upgrade can silently break a connector, so the agent reports the PMS version it sees on every check-in.
- **Local time and DST.** PMS appointment times are wall-clock times in the office's zone; store the location's IANA zone and convert at the edge ([Future Wall-Clock Times](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)).
- **The server is off.** Reads stop, writes queue, and a reminder job running at 6 a.m. against a copy last refreshed at 6 p.m. reminds patients of appointments cancelled in between.

The defenses:

- **Know how fresh each copy is.** Every synced record carries when it was last seen from the source; every integration carries its last successful read and write check-in. NexHealth's red thresholds (150 minutes for reads, 25 for writes) are a reasonable starting point.
- **Gate outbound actions on freshness.** A reminder, a booking offer or a balance text sent from stale data is worse than none. If the copy for a location is older than a threshold, hold time-sensitive sends and alert.
- **The PMS wins, except for what you own.** For records the PMS owns (appointments, patients, ledger), the PMS version is authoritative and a conflict means your pending change is re-validated or dropped. For records you own (a message thread, a form submission before write-back), your version is. Write that ownership down per field ([Survivorship Per Field](/docs/architecture/record-linkage#survivorship-per-field)).
- **Reconcile on a schedule.** A nightly comparison of counts and key sets per table catches missed deletes and stuck cursors before a practice does.
- **Alert the practice, not just yourself.** The people who can turn the server back on are at the front desk, so a stale sync is a message to the office as well as a page to your support team.

## How to Build It

The chapter extends `integrations` (one row per connection from a practice to an external system, with its `method`, `vendor` and, from [The Health Tech Landscape](/books/health-tech/health-tech-landscape#how-to-build-it), `product_id` and `product_version`) and `sync_cursors` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), and adds the agent fleet, sync runs, a crosswalk for every synced record, write-back requests and conflicts:

```sql
ALTER TABLE integrations
  ADD COLUMN agreement_ref    TEXT,                -- partner agreement or program enrollment it runs under
  ADD COLUMN permissions      TEXT[] NOT NULL DEFAULT '{}',  -- as granted: 'read_all', 'appointments_write'
  ADD COLUMN capabilities     TEXT[] NOT NULL DEFAULT '{}',  -- what this PMS and method support:
                                                   -- 'appointment_write', 'patient_write',
                                                   -- 'form_writeback', 'payment_post'
  ADD COLUMN last_read_at     TIMESTAMPTZ,
  ADD COLUMN last_write_check_in_at TIMESTAMPTZ,
  ADD COLUMN fee_contract_fee_id UUID;             -- per-location integration fee, if any

CREATE TABLE sync_agents (                         -- one per installed service on a practice server
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  integration_id    UUID NOT NULL REFERENCES integrations (id),
  host_fingerprint  TEXT NOT NULL,                 -- machine identity, re-keyed on server replacement
  os_version        TEXT,
  agent_version     TEXT NOT NULL,
  db_role           TEXT,                          -- the role it was granted: 'db_datareader', 'mysql_full'
  installed_by      TEXT,                          -- support ticket or installer
  installed_at      TIMESTAMPTZ NOT NULL,
  last_check_in_at  TIMESTAMPTZ,
  retired_at        TIMESTAMPTZ
);

ALTER TABLE sync_cursors
  ADD COLUMN overlap_seconds   INT NOT NULL DEFAULT 300,   -- re-read window behind the cursor
  ADD COLUMN last_full_scan_at TIMESTAMPTZ;

CREATE TABLE sync_runs (                           -- one poll, full scan or resync
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  integration_id    UUID NOT NULL REFERENCES integrations (id),
  agent_id          UUID REFERENCES sync_agents (id),
  kind              TEXT NOT NULL CHECK (kind IN ('incremental', 'key_scan', 'full_resync')),
  resource          TEXT NOT NULL,
  cursor_from       TEXT,
  cursor_to         TEXT,
  rows_seen         INT NOT NULL DEFAULT 0,
  rows_changed      INT NOT NULL DEFAULT 0,
  deletes_detected  INT NOT NULL DEFAULT 0,
  product_version_seen TEXT,                       -- the PMS version the agent saw this run
  started_at        TIMESTAMPTZ NOT NULL,
  finished_at       TIMESTAMPTZ,
  error_detail      TEXT
);

CREATE TABLE external_records (                    -- crosswalk: our row <-> their key, per integration
  integration_id    UUID NOT NULL REFERENCES integrations (id),
  resource          TEXT NOT NULL,                 -- 'appointments', 'patients', 'schedules', 'recalls'
  external_id       TEXT NOT NULL,                 -- PatNum, AptNum, the PIMS's id
  local_id          UUID NOT NULL,
  source_version    TEXT,                          -- DateTStamp, row version or content hash last seen
  last_seen_at      TIMESTAMPTZ NOT NULL,
  deleted_at_source TIMESTAMPTZ,                   -- from a deleted-rows signal or a key scan
  merged_into_external_id TEXT,                    -- the surviving key after a PMS merge
  PRIMARY KEY (integration_id, resource, external_id)
);

CREATE TABLE writeback_requests (                  -- every change we ask the PMS to make
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  integration_id    UUID NOT NULL REFERENCES integrations (id),
  resource          TEXT NOT NULL,
  local_id          UUID NOT NULL,
  operation         TEXT NOT NULL CHECK (operation IN ('create', 'update', 'cancel', 'attach_document',
                      'post_payment', 'set_confirmation')),
  payload           JSONB NOT NULL,                -- exactly what was sent
  idempotency_key   TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('queued', 'claimed', 'written', 'failed',
                      'timed_out', 'conflict', 'cancelled')),
  deadline_at       TIMESTAMPTZ,                   -- e.g. the appointment start; after it, give up
  claimed_by_agent  UUID REFERENCES sync_agents (id),
  external_id       TEXT,                          -- the PMS key once written
  error_detail      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMPTZ,
  UNIQUE (integration_id, idempotency_key)
);

CREATE TABLE sync_conflicts (                      -- a person decides
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  integration_id    UUID NOT NULL REFERENCES integrations (id),
  writeback_request_id UUID REFERENCES writeback_requests (id),
  resource          TEXT NOT NULL,
  local_id          UUID,
  external_id       TEXT,
  kind              TEXT NOT NULL CHECK (kind IN ('slot_taken', 'record_changed', 'record_deleted',
                      'patient_ambiguous', 'merge_detected', 'permission_denied')),
  ours              JSONB,
  theirs            JSONB,
  resolution        TEXT CHECK (resolution IN ('applied_ours', 'kept_theirs', 'manual', 'dropped')),
  resolved_by       UUID,
  resolved_at       TIMESTAMPTZ
);
```

Notes on the sketch:

- **The crosswalk is the integration.** `external_records` maps every local row to its PMS key and the version last seen. Patients also get a `patient_identifiers` row (`system = 'pms'`, the integration as issuer) per PMS key, because a patient's identity across systems is a core record; the crosswalk tracks sync state for every resource. Appointments keep their `external_ref` as the quick lookup.
- **`method` says how, `capabilities` says what.** The core `integrations.method` (`sync_agent`, `vendor_api`, `fhir`, ...) records the access path; `capabilities` gates features, so a practice on an analytics-only connector never sees "book online," and `agreement_ref` and `permissions` record what the access rests on.
- **Agents are fleet members.** `sync_agents` is what support looks at first: which version runs where and when it last checked in, while `sync_runs` records what each poll saw, including the PMS version, which is how a silent upgrade shows up. A server replacement retires one agent row and installs another; it doesn't silently reuse the identity.
- **Writes are jobs.** `writeback_requests` has a deadline, an idempotency key and a terminal status, mirroring the asynchronous write lifecycle the agents impose. The API that queued the write returns `202 Accepted` with the request's ID ([Accepting the Work](/docs/requests/long-running-operations#accepting-the-work)), and the outcome is an event.
- **Conflicts are tasks.** A `slot_taken` conflict on an online booking creates a task for the front desk and a message to the patient that the time needs confirming, never a silent drop.
- **The integration's status is derived.** The core `integrations.status` moves to `degraded` when `last_read_at` or `last_write_check_in_at` passes its threshold, and back to `active` when they recover.
- **Events:** `integration.read_stale`, `integration.write_stale`, `writeback_request.written`, `writeback_request.failed`, `sync_conflict.opened` and `pms.version_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to alerts, the practice's dashboard and support.

Support engineers will need to look at a practice's synced data to diagnose a connector; that access is PHI access and follows [Support Access](/docs/security/support-access#read-only-by-default): read-only by default, a reason per session, time-boxed and logged.

## Auditing

- **What access each integration had, under what agreement,** from `integrations.method`, `agreement_ref` and `permissions` over time. A PMS vendor's audit or a practice's question ("who can read our database?") is answered from it.
- **Every write to the PMS, as sent and as resolved,** from `writeback_requests`, because a wrong appointment, a payment posted twice or a form attached to the wrong chart is traced to the write that did it.
- **Every conflict and who resolved it.**
- **Agent installs, upgrades and retirements,** with the support ticket, since an agent is software with database credentials on a covered entity's server.
- **Reads of PHI by your own staff,** through support tooling, per [Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes).

## What This Means for the System You Build

- **Treat integration as a portfolio of connectors** behind one internal model, each with a version floor, an access path, an agreement and a capability list.
- **Use the vendor's sanctioned API where it exists and covers the data;** keep agents for systems with none, and document which is which per PMS.
- **Make the agent dial out,** run as a service with the least database role that works, report its version and the PMS version on every check-in, and survive restarts with cursors acknowledged by the cloud.
- **Poll with cursors, an overlap window and delete detection,** and keep a full resync for install and recovery.
- **Model write-back as a job** with a deadline, idempotency key, terminal status and a webhook or event; show patients and staff the truth while it's pending.
- **Gate time-sensitive sends on freshness,** and alert the practice when a sync stops.
- **Let the PMS win for records it owns,** follow merges in the crosswalk, and route conflicts to people.
- **Budget integration fees per location** into pricing from day one.

## References

**Filings and regulators**

- [Weave Communications: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609151/000160915126000016/weav-20251231.htm), more than 90 PMS integrations, partnership agreements with payments to partners, the risk of PMS providers changing terms, 39,625 locations
- [Phreesia: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm), the risk of EHR and PM providers amending or terminating integration contracts
- [FTC: Benco, Schein, Patterson matter (Docket 9379)](https://www.ftc.gov/legal-library/browse/cases-proceedings/151-0190-bencoscheinpatterson-matter), the February 12, 2018 complaint, the October 16, 2019 initial decision and the November 8, 2019 decision not to appeal
- [FTC: Henry Schein Practice Solutions matter](https://www.ftc.gov/legal-library/browse/cases-proceedings/142-3161-henry-schein-practice-solutions-inc-matter), charges of misleading customers about encryption of patient data, proposed January 5 and final May 23, 2016

**PMS vendors**

- [Open Dental: API specification](https://www.opendental.com/site/apispecification.html), resources mapping to tables, BAAs, PUT semantics
- [Open Dental: API setup](https://www.opendental.com/site/apisetup.html), developer and customer keys, the ODFHIR header, portal requests in one to three business days
- [Open Dental: API permissions and fees](https://www.opendental.com/site/apipermissions.html), tiers, throttles and per-location fees paid by the developer
- [Open Dental: Local and Service API](https://www.opendental.com/site/apilocal.html), ports 30222 and 30223, the Remote API through the eConnector, six-hour validation, Open Dental Cloud
- [Open Dental: API events](https://www.opendental.com/site/apievents.html), polling subscriptions, watch tables including deletes, batching and resend on failure
- [Open Dental: Appointments API](https://www.opendental.com/site/apiappointments.html), the `DateTStamp` filter
- [Open Dental: eConnector](https://www.opendental.com/manual/econnector.html), one per office, always on, Windows only
- [Henry Schein One: Dentrix Ascend API Exchange announcement](https://investor.henryschein.com/news-releases/news-release-details/2023/Henry-Schein-One-Announces-Dentrix-Ascend-API-Exchange-07-13-2023/default.aspx), July 13, 2023
- [Henry Schein One: API Exchange for vendors](https://www.henryscheinone.com/dental-solutions/api-exchange/api-exchange-vendors/), 140+ vendors, SOC 2 Type II and OAuth 2.0
- [Henry Schein One: API Exchange for customers](https://www.henryscheinone.com/dental-solutions/api-exchange/api-exchange-customer), "APIs are the only way" statement
- [Dentrix: Your guide to API integrations (September 18, 2025)](https://www.dentrix.com/insights/blogs/your-guide-to-api-integrations/), security test, agreement and program fee
- [Lighthouse 360](https://www.lh360.com/), a Henry Schein One brand
- [Planet DDS: Partners](https://www.planetdds.com/partners/), the Denticon API Program
- [ezyVet: Developer documentation](https://developers.ezyvet.com/), OAuth client credentials, token lifetimes, rate limits and headers, calendar and webhook endpoints
- [ezyVet: Apply for API access](https://developers.ezyvet.com/apply.html), Commercial Partnership and Private Integration
- [IDEXX: Cornerstone integrations](https://software.idexx.com/cornerstone-integrations), named communication and booking partners
- [ModMed: Marketplace](https://www.modmed.com/marketplace/), redirecting to the Synapsys Marketplace

**Integrators**

- [NexHealth: FAQs for on-premise health record systems](https://help.nexhealth.com/en/articles/10046556-faqs-for-on-premise-based-server-health-record-systems), OS and hardware requirements, minimum PMS versions and database roles
- [NexHealth: Troubleshooting installs](https://docs.nexhealth.com/docs/troubleshooting-installs), ports, domains, folders and Windows services
- [NexHealth: Supported health record systems](https://docs.nexhealth.com/docs/supported-health-record-systems.md), cloud and server systems, dedicated users for cloud systems, eClinicalWorks cloud only
- [NexHealth: Institutions, syncs and locations](https://docs.nexhealth.com/docs/institutions-syncs-and-locations.md), one sync per database, the Chrome extension for cloud systems
- [NexHealth: How a write reaches the EHR](https://docs.nexhealth.com/docs/how-a-write-reaches-the-ehr.md), accepted versus written, `foreign_id`, insertion webhooks, no automatic retries, minutes of latency
- [NexHealth: Get sync status](https://docs.nexhealth.com/reference/getsyncstatus.md), read and write status thresholds
- [NexHealth: API introduction](https://docs.nexhealth.com/reference/introduction), 15 health record systems through one API
- [NexHealth: Authenticate](https://docs.nexhealth.com/reference/postauthenticates.md), API key exchange and the version header
- [NexHealth: Online forms](https://www.nexhealth.com/features/online-forms), structured write-back and a PDF copy
- [Salt Project: Opening the firewall](https://docs.saltproject.io/en/latest/topics/tutorials/firewall.html), ports 4505 and 4506 and outbound-only minions
- [Sikka: SPC minimum requirements](https://help.sikka.ai/minimum-system-requirements-recommendations-for-sikka-platform-cloud-spc), agent placement and requirements
- [Dental Intelligence: System requirements](https://intercom.help/dental-intel/en/articles/6170750-dental-intelligence-system-requirements), sync client placement and the PMS support matrix
- [PetDesk: Cornerstone](https://petdesk.com/compatible-pims/cornerstone), reading the PIMS and writing bookings back
- [Vetstoria](https://www.vetstoria.com/?p=99416), "a direct, approved link" and its integration table

**Disputes**

- [Vyne Dental: Statements on Henry Schein One](https://vynedental.com/?p=25613), the dated statement series and the April 14, 2026 page
- [Vyne Dental: Information blocking regulations](https://vynedental.com/21st-century-cares-act-information-blocking-regulations/), the 45 CFR part 171 argument
