+++
title = "FHIR"
description = "FHIR from the integrator's side: resources and REST, search, R4 to R6, US Core and certification, Bulk Data export, Subscriptions, CDS Hooks and terminology."
category = "Health Tech Industry"
order = 1908
part = "Records and Interoperability"
tags = ["health-tech", "fhir", "us-core", "bulk-data", "cds-hooks", "interoperability"]
+++

FHIR (Fast Healthcare Interoperability Resources, said "fire") is HL7's web standard for health data: records as JSON resources with stable URLs, read and searched over HTTPS, with OAuth for authorization. Where [HL7 v2](/books/health-tech/hl7-v2) pushes events between systems inside a hospital, FHIR lets an outside application ask for a patient's allergies, a practice's schedule or a payer's claims and get back a typed, documented answer. US regulation made it the national API: ASTP/ONC's certification program requires certified EHRs to offer a FHIR API built on the US Core profiles, and CMS requires the payers it regulates to run FHIR APIs for patients, providers, other payers and prior authorization. A vendor building anything that reads clinical data from a modern EHR, or anything a payer must expose, builds on FHIR.

FHIR is also a toolkit more than a single specification. The base standard defines the resource types and their REST interactions, and almost nobody implements it raw: national and use-case **implementation guides** narrow it into profiles that say which elements must be present, which codes to use and which searches a server supports. This chapter covers the API, search, the versions, US Core and certification, Bulk Data, Subscriptions, CDS Hooks and terminology services; authorization and app launch are [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir), and the codes inside resources are [Terminologies & Code Sets](/books/health-tech/terminology-and-coding).

## How the Platforms Do It

Every certified EHR has a FHIR API; what differs is how much is free, which versions run, and what sits beyond the certified minimum. As of October 2026:

| Platform | What its public pages describe |
| --- | --- |
| **Epic** | Epic on FHIR, "a free resource for developers," with a testing sandbox, client registration, resources in R4, STU3 and DSTU2, and CDS Hooks; open.epic cites "over 750 no-cost APIs and interfaces," US Core 8 and USCDI v5 support, and 50+ APIs for the CMS-0057 rule |
| **Oracle Health (Millennium)** | FHIR R4 (4.0.1) over HTTPS in JSON, an open endpoint that returns the CapabilityStatement without credentials, a secured endpoint with SMART on FHIR, and SMART v1 and v2 scopes (`patient/`, `user/`, `system/`) |
| **Open Dental** | A proprietary API for third parties; its FHIR interface is "an older alternative to our API," at version 19.4, with development stopped |
| **Metriport** | An open-source platform that gathers records from many sources, normalizes them into one FHIR-based record, and serves it by API |
| **Payers under CMS-0057-F** | FHIR-based Provider Access, Payer-to-Payer and Prior Authorization APIs, primarily by January 1, 2027, building on the 2020 Patient Access rule |

The pattern: **hospital and ambulatory EHRs lead with FHIR, small-practice software often doesn't.** Certified EHRs must offer the US Core API, so Epic, Oracle Health and the ambulatory EHRs publish one. Dental, vet and many specialty PMSs aren't certified EHRs, carry no such obligation, and offer proprietary APIs or a server-side sync instead (Integrating with Practice Management Systems in Part 5). A vendor serving both worlds writes a FHIR client for one and a set of adapters for the other, and maps both into its own model.

## Resources and the REST API

A **resource** is a typed record: `Patient`, `Practitioner`, `Encounter`, `Condition`, `Observation`, `MedicationRequest`, `AllergyIntolerance`, `Appointment`, `Coverage`, `DocumentReference` and so on, each with an `id` assigned by the server, a `meta.versionId` and `meta.lastUpdated`, and references to other resources (`"subject": {"reference": "Patient/123"}`). The mapping from every core table in this volume to its resource is in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

The interactions, from the R4 RESTful API page:

- **Instance level:** `read` (`GET [base]/Patient/123`), `vread` (a specific version), `update` (`PUT`), `patch`, `delete`, `history`.
- **Type level:** `create` (`POST [base]/Patient`), `search`, `history`.
- **Whole system:** `capabilities` (`GET [base]/metadata`, which returns a CapabilityStatement listing the resource types and interactions the server supports), `batch` and `transaction` (a Bundle of requests posted to the base), `history`, `search`.

Concurrency is HTTP's: servers should return an `ETag` matching the version id, a client sends `If-Match: W/"23"` on an update, and a mismatch returns `412 Precondition Failed`; servers may refuse updates without `If-Match`. A client asks for what comes back with `Prefer: return=minimal`, `return=representation` or `return=OperationOutcome`. Errors come back as an **OperationOutcome** resource with issues, severities and codes, which is what a client logs and shows. A `404` on `/metadata` means the FHIR version isn't served at that URL.

Two things trip up integrators. **Ids are the server's.** `Patient/123` at one hospital and at another are different people, and an id can change after a merge; the stable link is an `identifier` with a `system` (an MRN with the hospital's assigning authority). **Writes are rare.** Most EHR FHIR APIs are read-heavy; create and update exist for a few resources (appointments, documents, some observations), each separately approved, and an integration that needs to write usually needs a vendor-specific API or an HL7 v2 interface for it.

## Search

Search is where FHIR earns its keep and where most client code lives. A search is `GET [base]/[type]?param=value` or a form-encoded `POST [base]/[type]/_search`, and returns a Bundle of type `searchset` with matches, paging links and optionally a `total`. The parameter types:

- **token** for codes and identifiers: `code=http://loinc.org|4548-4` matches system and code, a bare code matches any system, and `identifier=http://hospital.example/mrn|000123456` finds a patient by MRN.
- **reference** for links: `subject=Patient/123`, and `:identifier` searches by the referenced resource's identifier.
- **date** with prefixes: `date=ge2026-01-01&date=le2026-06-30`; a partial date matches the whole period.
- **string**, case and accent insensitive, matching the start by default, with `:contains` and `:exact`.
- **Chaining** filters on a referenced resource (`subject.name=peter`), and `_include` and `_revinclude` pull referenced or referring resources into the same Bundle (`_include=MedicationRequest:medication`).
- `_count` sets the page size; `_count=0` returns only the total. `_total` may be `none`, `estimate` or `accurate`, and servers may ignore it.

A typical clinical read, the patient's active problems, with tabs for Go and the shell:

```go tab="Go"
req, _ := http.NewRequestWithContext(ctx, http.MethodGet,
	base+"/Condition?patient="+url.QueryEscape(patientID)+
		"&category=problem-list-item&clinical-status=active&_count=100", nil)
req.Header.Set("Accept", "application/fhir+json")
req.Header.Set("Authorization", "Bearer "+token)

for req != nil {
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	var bundle fhir.Bundle // a generated R4 Bundle type
	err = json.NewDecoder(resp.Body).Decode(&bundle)
	resp.Body.Close()
	if err != nil {
		return err
	}
	for _, e := range bundle.Entry {
		if err := handleCondition(e.Resource); err != nil {
			return err
		}
	}
	req = nextPage(ctx, bundle, token) // follows the Bundle's "next" link, or nil
}
```

```sh tab="Shell"
curl -s "$BASE/Condition?patient=$PATIENT_ID&category=problem-list-item&clinical-status=active&_count=100" \
  -H "Accept: application/fhir+json" \
  -H "Authorization: Bearer $TOKEN"
```

What a server supports is in its CapabilityStatement and its implementation guide, not the base spec. A server may support `patient` and `category` on Condition but not `onset-date`; a client that sends an unsupported parameter may get it silently ignored, which returns more than asked. My rule: **read the server's CapabilityStatement at connection time, store it, and refuse to send search parameters it doesn't declare.**

## Versions

FHIR's releases, from HL7's version history and package list:

| Release | Version | Published | Status |
| --- | --- | --- | --- |
| DSTU2 | 1.0.2 | October 24, 2015 | Draft standard for trial use |
| STU3 | 3.0.2 | Release 3 dated February 21, 2017 | Standard for trial use |
| **R4** | 4.0.1 | Release 4 dated December 27, 2018; 4.0.1 packaged October 30, 2019 | First normative content plus trial use |
| R4B | 4.3.0 | May 28, 2022 | Trial use, a narrow update to R4 |
| R5 | 5.0.0 | March 26, 2023 | Trial use; the current published release |
| R6 | 6.0.0 | Five ballots from December 19, 2023 to July 17, 2026, and a first snapshot on July 17, 2026 | Not yet published as of October 2026 |

**R4 is the US production version.** US Core, the certification program, CMS's payer APIs, Bulk Data and SMART are all built on R4, and Epic and Oracle Health's public R4 endpoints are the ones apps use (Epic still lists STU3 and DSTU2 resources for older apps). R4 was the first release with normative content, which HL7 commits to keep stable, and that is a large part of why US regulation pinned it. R5 added topic-based Subscriptions, which reached R4 servers through a backport guide (below), and R6 aims to make most of the standard normative. My default: **build for R4, read R4B and R5 features through backport guides, and keep resource handling version-aware at the edges** so a future R6 endpoint is a new adapter, not a rewrite.

## Profiles, US Core and Implementation Guides

A **profile** constrains a resource: which elements are required, which are **must support** (the server must return them if it has them, the client must handle them), which value sets bind each code, and which extensions are allowed. An **implementation guide** (IG) packages profiles, search requirements, examples and a CapabilityStatement for a use case. **Extensions** carry what the base resource lacks, each defined by a URL; US Core's race and ethnicity extensions are the familiar example.

**US Core** is the US national IG, the FHIR expression of USCDI. Its releases track USCDI versions:

| US Core | Published | Enables |
| --- | --- | --- |
| 3.1.1 | June 30, 2020 | USCDI v1 |
| 5.0.1 | June 22, 2022 | USCDI v2 |
| **6.1.0** | June 30, 2023 | USCDI v3 |
| 7.0.0 | May 8, 2024 | USCDI v4 |
| 8.0.0 | June 10, 2025 | USCDI v5 updates (balloted December 2024) |
| 9.0.0 | May 31, 2026 | USCDI v6 |

Certification pins one. Under HTI-1, health IT certified to the standardized API criterion, 45 CFR 170.315(g)(10), had to update to US Core 6.1.0 and SMART App Launch 2.0.0 by December 31, 2025; the criterion requires responses for a single patient against the US Core server CapabilityStatement and for "multiple patients' data as a group," and the authorization server must revoke an app's access within one hour of a patient's request. Developers may move to newer approved versions under ONC's Standards Version Advancement Process, which is how Epic advertises US Core 8 and USCDI v5. ASTP/ONC finalized its HTI-5 deregulatory rule in late October 2026, removing 14 of the program's 60 criteria and revising 7 others, with many changes effective 60 days after Federal Register publication. <!-- source-gap: hti5-criteria | status | which certification criteria HTI-5 removed or revised, and whether (g)(10) or its US Core version changed | closes with: the HTI-5 final rule in the Federal Register or ASTP/ONC's HTI-5 page | checked: 2026-10-29 --> Which criteria changed was not yet in a primary source this chapter could open as of October 29, 2026; the certification program as a whole is Cures Act, Information Blocking & Certification in Part 3.

Beyond US Core, the IGs a health tech vendor meets: **CARIN Blue Button** for payer claims data to consumers, the **Da Vinci** guides for payer and provider exchange (coverage requirements, documentation templates, prior authorization), **Bulk Data**, **SMART App Launch**, and the **Interoperable Digital Identity and Patient Matching** guide in [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity). A server's CapabilityStatement lists the IGs it claims in `implementationGuide`, and a client validates resources against the profiles it depends on, not against the base spec.

## Bulk Data: $export

Reading a population one patient at a time doesn't scale, so the **Bulk Data Access** IG (2.0.0 published November 26, 2021; 3.0.0 on December 11, 2025; a 4.0.0 ballot on August 7, 2026) defines an asynchronous export. The flow, from the 2.0.0 export spec:

1. **Kick off** with `GET [base]/Patient/$export` (all patients), `GET [base]/Group/[id]/$export` (a defined cohort, the common case for a payer's members or a practice's attributed panel), or `GET [base]/$export` (the whole system), with `Prefer: respond-async`, the only value supported. `_type` filters resource types, and `_since` returns only resources changed after an instant, by `meta.lastUpdated`.
2. **Receive** `202 Accepted` with a `Content-Location` header: the status URL.
3. **Poll** the status URL with exponential backoff, honoring `Retry-After`. In progress returns `202`, optionally with an `X-Progress` header; an error returns `4xx` or `5xx` with an OperationOutcome.
4. **On completion** receive `200` with a JSON manifest: `transactionTime`, `request`, `requiresAccessToken`, and an `output` array of `{type, url}` files, plus `error` files and an `Expires` header for how long the files stay.
5. **Download** each file, NDJSON (`application/fhir+ndjson`, one resource per line, one resource type per file).
6. **Cancel** with `DELETE` on the status URL if needed; later polls return `404`.

Bulk export is authorized with SMART Backend Services, a server-to-server credential with `system/` scopes ([SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir#backend-services)). The engineering consequences: an export of a health system's population can take hours and produce gigabytes, so the client is a background job with resumable downloads ([Background Jobs](/docs/architecture/background-jobs)), the next export uses the previous `transactionTime` as `_since`, and deletions don't appear in an incremental export unless the server reports them, so a full refresh on a schedule is the only way to find records that left a group.

## Subscriptions: Being Told

Polling a FHIR server for changes is slow and expensive; **Subscriptions** let a server notify a client. R5 rebuilt them around **SubscriptionTopic**: the server defines topics (an encounter starting, a result finalized, an appointment changing), and a client subscribes to a topic with filters. A Subscription declares a channel (`rest-hook`, an HTTPS POST to the client's endpoint; `websocket`; `email`; or `message`), a `content` level (`empty`, `id-only` or `full-resource`), and an optional `heartbeatPeriod` for keep-alive notifications. Notifications are Bundles of type `subscription-notification`. The **Subscriptions R5 Backport** IG brings a subset of this to R4 and R4B servers.

Two design rules follow. **Prefer `id-only`.** A notification that carries the resource is PHI pushed to an endpoint; an id-only notification tells the client what changed and lets it read the resource with its own authorization. **Treat notifications as hints, not a ledger.** A missed notification must be recoverable, so a subscriber keeps a periodic catch-up read (by `_lastUpdated`) next to the subscription, exactly as the playbook's [Webhooks](/docs/api-design/webhooks#delivery-guarantees) advises for any push. Support varies by EHR and by customer configuration; many integrations still get their events from an HL7 v2 feed and read the details over FHIR.

## CDS Hooks

**CDS Hooks** (current published version 2.0.1, STU 2 Release 2, on FHIR R4) lets an EHR call an outside decision support service at points in the clinician's workflow. A service is discoverable at `{baseUrl}/cds-services`, which lists each service's hook, description, id and prefetch templates. The EHR invokes the service on a **hook** (`patient-view` when a chart opens, `order-select` when a clinician picks a medication, `order-sign` with the draft orders about to be signed), sends context and prefetched FHIR data, and gets back **cards** (information, suggestions to accept or reject, or a link to launch a SMART app). It shares SMART's security framework, but the EHR must hand the service an access token automatically and fast, inside the clinician's click.

For a vendor, CDS Hooks is how a third party appears inside the EHR's workflow without the clinician opening another app: a prior authorization requirement on `order-select` (Da Vinci's coverage requirements discovery uses it), a drug cost on `order-sign`, a care gap on `patient-view`. Latency is the constraint. A service that takes two seconds is a service clinicians learn to ignore, so prefetch is the default and the service answers from what it was sent.

## Terminology Services

FHIR defines a terminology API so clients don't embed every code system: `ValueSet/$expand` returns the codes in a value set (optionally filtered by text, which is how a type-ahead problem picker works), `ValueSet/$validate-code` checks a code against a value set, `CodeSystem/$lookup` returns a code's display and properties, `CodeSystem/$subsumes` tests whether one concept is a kind of another, `ConceptMap/$translate` maps a code between systems, and `ConceptMap/$closure` maintains a subsumption table. A terminology server (NLM's VSAC offers a FHIR API for its value sets) answers these. Which code systems are licensed, versioned and mapped how is [Terminologies & Code Sets](/books/health-tech/terminology-and-coding).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Each FHIR server is an `integrations` row with its discovered capabilities; each local record linked to a remote resource keeps the remote id and version; exports and subscriptions are tracked jobs.

```sql
ALTER TABLE integrations
  ADD COLUMN fhir_base_url       TEXT,
  ADD COLUMN fhir_version        TEXT CHECK (fhir_version IN ('4.0.1', '4.3.0', '5.0.0')),
  ADD COLUMN capability_statement JSONB,       -- as fetched from /metadata
  ADD COLUMN capability_fetched_at TIMESTAMPTZ,
  ADD COLUMN implementation_guides TEXT[] NOT NULL DEFAULT '{}';  -- canonical URLs with versions

CREATE TABLE fhir_resource_versions (             -- a local row and the remote resource it mirrors
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  resource_type    TEXT NOT NULL,              -- 'Condition'
  remote_id        TEXT NOT NULL,              -- the server's id, as text
  remote_version   TEXT,                       -- meta.versionId last seen
  remote_updated_at TIMESTAMPTZ,               -- meta.lastUpdated last seen
  local_table      TEXT NOT NULL,              -- 'conditions'
  local_id         UUID NOT NULL,
  linked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_at      TIMESTAMPTZ,                -- the remote resource was deleted or merged away
  PRIMARY KEY (integration_id, resource_type, remote_id, linked_at)
);

CREATE UNIQUE INDEX fhir_resource_versions_open_idx
  ON fhir_resource_versions (integration_id, resource_type, remote_id) WHERE unlinked_at IS NULL;

CREATE TABLE bulk_export_jobs (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  level            TEXT NOT NULL CHECK (level IN ('patient', 'group', 'system')),
  group_id         TEXT,                       -- remote Group id for group-level exports
  types            TEXT[] NOT NULL,            -- _type
  since            TIMESTAMPTZ,                -- _since: the previous job's transaction_time
  status_url       TEXT,                       -- Content-Location from the kick-off
  status           TEXT NOT NULL CHECK (status IN ('kicked_off', 'in_progress', 'complete',
                     'downloading', 'loaded', 'failed', 'cancelled')),
  transaction_time TIMESTAMPTZ,                -- from the manifest
  manifest         JSONB,
  files_expire_at  TIMESTAMPTZ,                -- from the Expires header
  error            TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  CHECK (level <> 'group' OR group_id IS NOT NULL)
);

CREATE TABLE fhir_subscriptions (              -- subscriptions this platform holds on remote servers
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  integration_id   UUID NOT NULL REFERENCES integrations (id),
  remote_id        TEXT,                       -- the Subscription's id on the server
  topic_url        TEXT NOT NULL,              -- SubscriptionTopic canonical
  filters          JSONB NOT NULL DEFAULT '{}',
  channel          TEXT NOT NULL CHECK (channel IN ('rest-hook', 'websocket')),
  content          TEXT NOT NULL DEFAULT 'id-only'
                     CHECK (content IN ('empty', 'id-only', 'full-resource')),
  heartbeat_seconds INT,
  status           TEXT NOT NULL CHECK (status IN ('requested', 'active', 'error', 'off')),
  last_event_number BIGINT,                    -- to detect gaps
  last_notified_at TIMESTAMPTZ,
  catch_up_cursor_id UUID REFERENCES sync_cursors (id)   -- the polling backstop
);
```

Design decisions:

- **Capabilities are data.** The CapabilityStatement is fetched and stored per connection, and the client builds queries from it; a server upgrade that drops a parameter shows up as a diff, not as silently wrong results.
- **Remote ids are links, not keys.** A local `conditions` row has its own UUID; the remote id and version live in `fhir_resource_versions`, and patients link through `patient_identifiers` with the server's identifier systems. A merge on the server closes the old link and opens a new one ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)).
- **Versions make reads cheap.** `remote_version` and `remote_updated_at` let an incremental sync skip unchanged resources and detect a conflicting write before sending `If-Match`.
- **Exports are resumable jobs.** The status URL, manifest and expiry are stored so a worker restart resumes polling or downloading instead of kicking off a new hours-long export; `transaction_time` becomes the next job's `since`.
- **Subscriptions have a backstop.** Every subscription points at a catch-up cursor; a gap in event numbers or a missed heartbeat triggers the catch-up read.
- **The FHIR facade is separate.** Exposing your own model as FHIR (to customers, payers or apps) is a different job from consuming it, covered in Health Tech Architecture in Part 10.

## Auditing

- **Every request to a remote FHIR server:** who or what asked (a user under a SMART grant, or a backend credential), for which patient or group, which resources and parameters, and what came back (status, counts, OperationOutcomes), because a disclosure investigation starts with "what did this app read about this patient?"
- **Every resource stored,** with the remote id and version it came from and the time it was read, so a clinical decision made on stale data can be reconstructed.
- **Bulk exports,** with kick-off parameters, manifests, file counts and load results, and when the downloaded files were deleted.
- **Writes back to an EHR,** with the `If-Match` version, the response and the resulting remote id, tied to the user who caused them.
- **Capability changes per connection** over time, so a broken integration can be traced to the server change that broke it.

## What This Means for the System You Build

- **Build on R4 and US Core,** with version-aware adapters at the edges for R4B, R5 and eventually R6.
- **Discover before you query:** store each server's CapabilityStatement and IGs, and send only declared search parameters.
- **Link by identifier, not by id:** keep remote ids and versions as links, and patients as identifiers with their systems.
- **Use Bulk Data for populations,** as resumable jobs with `_since` increments and periodic full refreshes.
- **Treat Subscriptions as hints** with `id-only` payloads and a polling backstop.
- **Meet clinicians in the workflow with CDS Hooks** where it fits, and answer from prefetch fast.
- **Expect small-practice software to lack FHIR,** and design the integration layer so a proprietary API or sync agent feeds the same model.

## References

**Specifications**

- [HL7 FHIR: Version history](https://hl7.org/fhir/history.html), DSTU1 through R5 and their dates
- [HL7 FHIR: Package list](https://hl7.org/fhir/package-list.json), 4.0.1 normative and trial use, R5 as current, R6 ballots 1 through 5 and the July 17, 2026 snapshot
- [HL7 FHIR R4: RESTful API](https://hl7.org/fhir/R4/http.html), interactions, ETag and If-Match, the Prefer header, capabilities
- [HL7 FHIR R4: Search](https://hl7.org/fhir/R4/search.html), parameter types, chaining, _include and _revinclude, _count and _total
- [HL7 FHIR R5: Subscription](https://hl7.org/fhir/R5/subscription.html), topics, channels, content levels, heartbeats
- [HL7: Subscriptions R5 Backport IG](https://hl7.org/fhir/uv/subscriptions-backport/), R5 subscriptions on R4 and R4B servers
- [HL7 FHIR R4: Terminology service](https://hl7.org/fhir/R4/terminology-service.html), $expand, $validate-code, $lookup, $subsumes, $translate and $closure
- [HL7: US Core package list](https://hl7.org/fhir/us/core/package-list.json), US Core versions, dates and the USCDI version each enables
- [HL7: Bulk Data Access package list](https://hl7.org/fhir/uv/bulkdata/package-list.json), 2.0.0, 3.0.0 and the 4.0.0 ballot
- [HL7: Bulk Data Access 2.0.0, Export](https://hl7.org/fhir/uv/bulkdata/STU2/export.html), kick-off, polling, manifest, NDJSON, _since, _type, cancellation
- [HL7: CDS Hooks](https://cds-hooks.hl7.org/), version 2.0.1, hooks, cards, discovery, prefetch and the SMART relationship

**Regulation**

- [45 CFR 170.315: Certification criteria (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/170.315), (g)(10) single-patient and group responses against US Core, one-hour revocation
- [ASTP/ONC: HTI-1 Final Rule Overview and Key Dates (PDF, October 2025)](https://www.healthit.gov/sites/default/files/2024-03/Overview-and-Key-Dates-2024_508.pdf), US Core 6.1.0 and SMART App Launch 2.0.0 for (g)(10) by December 31, 2025
- [ASTP/ONC: HTI-1 Final Rule](https://healthit.gov/regulations/hti-rules/hti-1-final-rule/), USCDI v3 baseline and the HTI-5 finalization notice
- [Healthcare Dive: ONC final rule cuts health IT certification criteria](https://www.healthcaredive.com/news/onc-final-rule-cuts-health-it-certification-criteria/872876/), HTI-5's 14 removed and 7 revised criteria and effective dates (October 27, 2026)
- [CMS: Interoperability and Prior Authorization final rule (CMS-0057-F)](https://www.cms.gov/priorities/burden-reduction/overview/interoperability/policies-regulations/cms-interoperability-prior-authorization-final-rule-cms-0057-f), FHIR APIs for impacted payers primarily by January 1, 2027

**In practice**

- [Epic on FHIR](https://fhir.epic.com/), free developer resource, sandbox, client registration, R4, STU3 and DSTU2 resources
- [open.epic](https://open.epic.com/), 750+ no-cost APIs and interfaces, US Core 8 and USCDI v5, CMS-0057 APIs
- [Oracle Health: Millennium FHIR R4 overview](https://docs.oracle.com/en/industries/health/millennium-platform-apis/mfrap/r4_overview.html), R4 4.0.1, open and secured endpoints, SMART v1 and v2 scopes
- [Open Dental: API setup](https://www.opendental.com/manual/fhir.html), the proprietary API, FHIR as an older alternative stopped at 19.4
- [Metriport](https://www.metriport.com/), open-source normalization of records into FHIR
