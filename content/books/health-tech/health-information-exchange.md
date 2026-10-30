+++
title = "Networks & Exchange"
description = "How records move between organizations: HIEs, eHealth Exchange, CommonWell, Carequality, TEFCA and QHINs in October 2026, query vs push, individual access."
category = "Health Tech Industry"
order = 1911
part = "Records and Interoperability"
tags = ["health-tech", "hie", "tefca", "qhin", "carequality", "commonwell"]
+++

A patient's records are scattered across every organization that ever treated them, and no single system knows where they all are. **Health information exchange** is the set of networks, agreements and protocols that let one organization find and fetch another's records, or be told when something happened. It has three layers that grew at different times: **state and regional HIEs** that connect the hospitals and practices in an area; **national networks** run by vendor alliances and nonprofits (eHealth Exchange, CommonWell, the Carequality framework, Epic's Care Everywhere) that connect EHRs across the country; and **TEFCA**, the federal framework that since December 2023 connects those networks through designated Qualified Health Information Networks (QHINs) under one common agreement.

For a vendor the questions are practical: which network can my product join, and under which permitted purpose; how do I find a patient on a network that has no national identifier; what comes back (usually C-CDA documents); and what do I owe the network in return. This chapter covers the networks, the query, push and notification patterns, TEFCA's status as of October 2026, individual access, and how to model exchange; the documents that travel are [C-CDA, Documents & Images](/books/health-tech/documents-and-ccda), and finding the right patient is [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity).

## How the Platforms Do It

As of October 2026, from public pages:

| Network or platform | What it is | Scale and status it publishes |
| --- | --- | --- |
| **eHealth Exchange** | A "network of networks" for providers, HIEs, public health, payers and federal agencies; participants sign one legal agreement, the DURSA | 25 billion data exchanges a year, 300 million+ patients, 55 regional and state HIEs, 5 federal agencies (FDA, VA, IHS, DoD, SSA), 75% of hospitals; "one of the first" designated QHINs |
| **CommonWell Health Alliance** | A member alliance founded by EHR vendors; a master person index, record locator service, data broker and trust network | A designated QHIN; counts sites reachable through CommonWell, Carequality implementers and TEFCA |
| **Epic (Care Everywhere, Epic Nexus)** | Epic's exchange network, and its QHIN | 9.83 billion patient records exchanged a year, 54% with non-Epic organizations |
| **Health Gorilla** | "The national network, infrastructure, and APIs to access patient data," plus lab exchange | A designated QHIN |
| **Redox** | An integration platform linking EHRs and other systems and standardizing their data | A network of 12,000+ linked organizations |
| **Particle Health** | API access to patient records for developers, health systems, payers and value-based care organizations | |
| **Metriport** | Open-source platform aggregating records from HIE networks, ADT networks, pharmacies, labs and EHRs into FHIR | 750,000+ providers connected |

Two patterns. **Networks connect EHR vendors, not practices.** A practice joins through its EHR or HIE; a software vendor joins as a participant or subparticipant of a network (often through an aggregator such as the API platforms above), and inherits that network's rules about who may ask for what. **Aggregators are the vendor's on-ramp.** A startup that needs outside records rarely negotiates with every network; it buys API access from a platform that holds the network memberships, and its permitted purpose, contracts and audit obligations flow down from that platform.

## Kinds of Networks

**State and regional HIEs** are usually nonprofits or state-designated entities connecting the hospitals, labs, practices and public health agencies in a region. Their strength is local completeness: admissions at every hospital in the area, results from the regional labs, immunization registry access. Many also run **event notification**: they receive every hospital's ADT feed and notify a patient's primary care practice or care manager when the patient is admitted or discharged. eHealth Exchange lists 55 regional and state HIEs among its participants, which is how a regional HIE's data reaches national queries.

**National networks** connect EHRs across regions. They differ in structure:

- **eHealth Exchange** is a network whose participants (including the VA, DoD, SSA, IHS and FDA) sign the DURSA, a single multi-party data use agreement, and connect through one set of APIs.
- **CommonWell** is a service: members' EHRs connect to CommonWell's platform, which runs a master person index and a **record locator service** (which members have records for this person) and brokers queries.
- **Carequality** is a framework rather than a network: a common legal agreement, rules and technical specifications under which existing networks and EHR vendors ("implementers") exchange directly with each other, so a site on one vendor's EHR can query a site on another's. <!-- source-gap: carequality-scale | missing | Carequality's current implementer count, document volumes and governance details | closes with: carequality.org (blocked to automated fetching on 2026-10-29) | checked: 2026-10-29 --> Carequality's own pages were not readable for this chapter, so its current scale is left out here.
- **Vendor networks** such as Epic's Care Everywhere exchange among one vendor's customers and, through the frameworks above, with everyone else.

**TEFCA** sits above all of them, below.

## Query, Push and Notify

Exchange happens in three patterns, and a product usually needs more than one:

- **Query.** "Does anyone have records for this patient?" The requester runs **patient discovery** (send demographics; each responder matches against its own index and returns its local identifier if it finds one), then **document query** (list the documents for that identifier), then **document retrieve** (fetch the ones wanted, usually a CCD per encounter). These are the three request types TEFCA's IAS rules name. Query is how a new clinician gets a patient's history, and how aggregators build longitudinal records. It returns a pile of overlapping documents, so the consumer deduplicates.
- **Push.** "Here is a referral for this specific recipient." Direct secure messaging is the standard push ([C-CDA, Documents & Images](/books/health-tech/documents-and-ccda#direct-secure-messaging)), and fax is the fallback.
- **Notify.** "Your patient was just admitted." ADT-based event notifications from HIEs and networks, and FHIR Subscriptions where supported ([FHIR](/books/health-tech/fhir#subscriptions-being-told)). Notifications drive transitional care, readmission programs and care management.

Query has a cost for responders: each query makes them search their index, assemble documents and answer, often at volume. Networks therefore police **permitted purposes**. A query asserts a purpose (treatment, payment, health care operations, public health, individual access and others), and responders may answer only the purposes they are obliged or willing to answer. Treatment is the purpose every network answers; payment and operations queries from payers and analytics companies are where responders push back, and disputes between participants over whether queries asserted as treatment really were have reached the courts. <!-- source-gap: network-purpose-disputes | missing | court records for network permitted-purpose disputes (e.g. the 2024 Particle Health and Epic litigation) | closes with: the docket on a public court records site | checked: 2026-10-29 --> The court filings weren't reachable for this chapter, so the cases aren't detailed here.

## TEFCA as of October 2026

The 21st Century Cures Act directed ONC to create a trusted exchange framework and common agreement. Its parts:

- **The Trusted Exchange Framework** (principles), published in January 2022 and updated in November 2023.
- **The Common Agreement**, the contract QHINs sign with the Recognized Coordinating Entity, with flow-down terms of participation for participants and subparticipants. Versions 1.1, 2.0 and 2.1 are posted; the RCE dates version 2.1 to November 2024.
- **The Recognized Coordinating Entity (RCE)**: The Sequoia Project, under a five-year contract with ONC awarded in August 2023, which designates QHINs and maintains the SOPs and the QHIN Technical Framework (QTF; a version 2.1 draft is dated December 4, 2025).
- **QHINs**: the first were designated in December 2023, and "data began flowing among QHINs within days." As of October 2026 the RCE lists 11 designated QHINs: CommonWell Health Alliance, eClinicalWorks (PrismaNet), eHealth Exchange, Epic (Epic Nexus), Health Gorilla, Kno2, KONZA Health, MedAllies, Netsmart, Oracle Health and Surescripts, with more candidates onboarding.

**Exchange purposes.** TEFCA defines six: treatment, payment, health care operations, public health, government benefits determination, and individual access services, with each purpose's obligations in its own SOP (the Exchange Purposes SOP is at version 5.1, dated July 1, 2026; treatment's at 2.0, the same date). Which purposes a node must answer, and which it may decline, is per purpose and per participant type, which is why a query's purpose is part of the record.

**FHIR.** TEFCA's original exchange is document query and retrieve between QHINs. The RCE's FHIR roadmap moves it toward FHIR, and **facilitated FHIR** is designed to let participants "conduct transactions directly with other participants" once the QHINs have brokered discovery; as of October 2026 the RCE describes it as available once its draft SOP and related documents are finalized, so it is planned rather than live.

### Individual Access Services

**Individual access services (IAS)** let a person, through an approved app (an IAS provider), pull their own records from every TEFCA node that has them. Because there's no patient-side relationship with each responder, identity is the gate. Under the IAS SOP version 3.0, effective August 3, 2026:

- The IAS provider must use an approved **credential service provider (CSP)** that proofs the person to at least **NIST IAL2** under the then-latest SP 800-63A, verifies a defined set of demographics (first, middle and last name, suffix, birth date, street address, city, state, ZIP, email, mobile phone, and state ID or driver's license number), and issues a signed IAL2 claims token in OpenID Connect format carrying the verified demographics.
- Proofing happens before the person's first TEFCA use, when verified demographics change, and when they expire.
- The IAL2 claims token must accompany every IAS patient discovery, document query and document retrieval request.
- A responder that achieves "an acceptable, uniquely attributable demographics-based match" must respond with an identifier for document query, or with its TEFCA IAS FHIR endpoint so the person can authorize the app directly; and the IAS provider must run a **demographics double-check**, comparing its verified data with what the responder returned, and reject the response if they don't match.

The change was not smooth. The RCE reports that moving QHINs to the new identification approach on October 1, 2026 disrupted IAS connectivity through "implementation inconsistencies," including how QHINs verified the claims tokens; a compliance bulletin followed on October 13, and the RCE reports IAS volume restored as of October 26, 2026, with some QHINs still troubleshooting. The identity proofing side is [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity#identity-proofing-and-ial2).

## State Mandates

States add their own exchange obligations. California's Data Exchange Framework is the largest example: a single data sharing agreement that covered health care organizations sign through a CalHHS portal, with the framework's materials now maintained at a CalHHS site. Other states designate a state HIE and require hospitals to send ADT notifications to it. For a vendor, a state mandate is a customer requirement: a hospital or practice that must share data under state law needs its software to do so, and the participation terms flow down. <!-- source-gap: state-exchange-mandates | missing | California DxF signing deadlines and who must sign; a survey of state ADT notification mandates | closes with: CalHHS DxF FAQ and state statutes | checked: 2026-10-29 -->

## Joining as a Vendor

A software vendor reaching network data chooses a path:

1. **Through a customer's EHR.** The practice's EHR already participates; the vendor reads what the EHR received, under the practice's BAA. Cheapest, but limited to that EHR's integration surface.
2. **Through an aggregator or API platform.** The vendor becomes a subparticipant or customer of a platform with network memberships and gets query APIs and normalized results. Fast, but the vendor inherits the platform's permitted purposes and must prove its own (a treatment purpose requires a treating relationship).
3. **As a participant directly.** Signing a network's agreement, passing its onboarding and testing, and running the protocol stack. Expensive and slow; worth it for vendors whose product is exchange.

On every path, the vendor's obligations are a reciprocal duty to respond where the purpose requires it, honoring purposes and consent, auditing every query, and handling the PHI under BAAs or the network's terms. Network fees are set per network and per participant type and are rarely published. <!-- source-gap: network-fees | missing | published participation fees for eHealth Exchange, CommonWell, Carequality and QHINs | closes with: each network's fee schedule | checked: 2026-10-29 -->

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Each network membership is a `network_participations` row on an `integrations` connection; every query asserts a purpose and records every responder's answer; retrieved documents become `documents` with network provenance; disclosures to other participants are logged in `disclosures`.

```sql
CREATE TABLE network_participations (        -- a membership in one network, through one path
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  integration_id     UUID NOT NULL REFERENCES integrations (id),  -- system_kind = 'hie'
  network            TEXT NOT NULL,            -- 'tefca', 'carequality', 'commonwell', 'ehx', 'state_hie'
  via_qhin           TEXT,                     -- for TEFCA: which QHIN this participation is under
  participant_role   TEXT NOT NULL CHECK (participant_role IN ('qhin', 'participant',
                       'subparticipant', 'customer_of_aggregator')),
  permitted_purposes TEXT[] NOT NULL,          -- purposes this membership may assert
  home_community_id  TEXT,                     -- this node's identifier on the network
  agreement_version  TEXT NOT NULL,            -- the agreement and SOP versions signed
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE exchange_queries (                -- one outbound "who has records for this patient?"
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  participation_id UUID NOT NULL REFERENCES network_participations (id),
  patient_id       UUID NOT NULL REFERENCES patients (id),
  purpose          TEXT NOT NULL CHECK (purpose IN ('treatment', 'payment', 'operations',
                     'public_health', 'government_benefits', 'individual_access')),
  requested_by     UUID,                       -- the user, or null for a scheduled job
  treating_practitioner_id UUID REFERENCES practitioners (id),  -- required for treatment
  demographics_sent JSONB NOT NULL,            -- exactly what was sent for discovery
  ial2_token_ref   TEXT,                       -- individual access: the claims token used
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  CHECK (purpose <> 'treatment' OR treating_practitioner_id IS NOT NULL)
);

CREATE TABLE record_locations (                -- each responder's answer: where records are
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  query_id         UUID NOT NULL REFERENCES exchange_queries (id),
  responder_id     TEXT NOT NULL,              -- the responding community or organization
  responder_organization_id UUID REFERENCES organizations (id),
  outcome          TEXT NOT NULL CHECK (outcome IN ('matched', 'no_match', 'multiple_matches',
                     'declined_purpose', 'error', 'timeout', 'double_check_failed')),
  remote_patient_id TEXT,                      -- the responder's identifier, if matched
  documents_listed INT,
  documents_retrieved INT,
  responded_at     TIMESTAMPTZ
);

CREATE TABLE exchange_retrievals (             -- each document fetched, and what it became
  record_location_id UUID NOT NULL REFERENCES record_locations (id),
  remote_document_id TEXT NOT NULL,            -- the responder's unique document id
  document_id      UUID REFERENCES documents (id),     -- null: duplicate of one already held
  duplicate_of     UUID REFERENCES documents (id),
  retrieved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (record_location_id, remote_document_id)
);

CREATE TABLE exchange_inbound_requests (       -- queries other participants send us
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  participation_id UUID NOT NULL REFERENCES network_participations (id),
  requester_id     TEXT NOT NULL,
  purpose          TEXT NOT NULL,
  request_type     TEXT NOT NULL CHECK (request_type IN ('patient_discovery', 'document_query',
                     'document_retrieve')),
  matched_patient_id UUID REFERENCES patients (id),
  decision         TEXT NOT NULL CHECK (decision IN ('answered', 'no_match', 'declined_purpose',
                     'declined_consent', 'error')),
  disclosure_id    UUID REFERENCES disclosures (id),  -- when PHI was released
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design decisions:

- **Purpose is a column, not an assumption.** Every query asserts one, checked against the participation's `permitted_purposes`; treatment queries name the treating clinician, because a treatment purpose without a treating relationship is the classic network violation.
- **Send exactly what you record.** `demographics_sent` holds the discovery payload, so a wrong-patient response can be traced to the inputs ([Patient Matching & Identity](/books/health-tech/patient-matching-and-identity)).
- **Every responder's answer is kept,** including no-match and declined, because a clinician asking "did we check?" needs the list, and a pattern of declines is how a vendor learns its purpose is being questioned.
- **Retrieved documents are deduplicated.** The same encounter's CCD arrives from several networks; `exchange_retrievals` maps each remote document to the one stored copy.
- **Inbound requests are disclosures.** Answering another participant's query releases PHI; the decision, purpose and released documents are logged and linked to `disclosures`, the playbook's accounting shape ([HIPAA in Practice](/books/health-tech/hipaa-in-practice#the-other-rights-a-product-handles) in Part 3).
- **Consent applies on the way out.** A patient's opt-out of network exchange, or sensitive records under Part 2 or state law, is checked before answering ([State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy) and [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization) in Part 3).

## Auditing

- **Every outbound query:** purpose, requester, treating clinician, demographics sent, every responder's outcome and every document retrieved.
- **Every inbound request:** requester, purpose, match decision, what was released, and any consent or purpose that caused a decline.
- **Individual access:** the IAL2 claims token reference, the demographics double-check result and what was returned to the person's app.
- **Membership terms:** which network agreements and SOP versions governed each query, since purposes and obligations change by version ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).

## What This Means for the System You Build

- **Pick your on-ramp deliberately:** a customer's EHR, an aggregator, or direct participation, and inherit that path's purposes and obligations.
- **Assert a purpose on every query,** and prove it: a treating clinician for treatment, an IAL2-proofed person for individual access.
- **Expect documents back, in duplicate,** and deduplicate them to one stored copy with every source recorded.
- **Answer inbound queries as disclosures,** checking consent and purpose and logging what was released.
- **Use notifications where you need events,** and query where you need history.
- **Track TEFCA's SOP versions and status,** because its rules and live capabilities changed several times in 2026 alone.

## References

**Federal framework**

- [ASTP/ONC: Trusted Exchange Framework and Common Agreement](https://www.healthit.gov/topic/interoperability/policy/trusted-exchange-framework-and-common-agreement-tefca), framework published January 2022 and updated November 2023, Common Agreement versions, the RCE contract of August 2023, first QHINs in December 2023, exchange purposes (page updated September 3, 2026)
- [RCE: TEFCA](https://rce.sequoiaproject.org/tefca/), Common Agreement 2.1 in November 2024, TEFCA publication in January 2022, designated QHINs
- [RCE: Designated QHINs](https://rce.sequoiaproject.org/designated-qhins/), the 11 designated QHINs
- [RCE: TEFCA and RCE resources](https://rce.sequoiaproject.org/tefca-and-rce-resources/), Common Agreement, QTF 2.1 draft, Exchange Purposes SOP v5.1 and the purpose SOPs, FHIR roadmap
- [RCE: SOP, Exchange Purpose Implementation, Individual Access Services v3.0 (PDF)](https://rce.sequoiaproject.org/wp-content/uploads/2026/07/SOP-IAS-XP-v3_June2026_Clean_-5081.pdf), effective August 3, 2026, IAL2 via approved CSPs, verified demographics, claims tokens, response modes, demographics double-check
- [RCE: Current status of IAS SOP version 3.0](https://rce.sequoiaproject.org/current-status-of-ias-sop-version-3-0/), the October 1, 2026 transition, the October 13 bulletin and restored volume as of October 26
- [RCE: TEFCA on FHIR](https://rce.sequoiaproject.org/rce-tefca-on-fhir/), facilitated FHIR pending finalization of draft documents

**Networks and platforms**

- [eHealth Exchange](https://ehealthexchange.org/), network of networks, the DURSA, federal agencies and published scale, QHIN designation
- [CommonWell Health Alliance](https://www.commonwellalliance.org/), master person index, record locator service, data broker and trust network, QHIN designation
- [open.epic](https://open.epic.com/), Care Everywhere exchange volumes
- [Health Gorilla](https://www.healthgorilla.com/), national network, APIs and QHIN status
- [Redox](https://www.redoxengine.com/), integration platform and network size
- [Particle Health](https://www.particlehealth.com/), API access to patient records
- [Metriport](https://www.metriport.com/), open-source aggregation from HIE and ADT networks into FHIR

**States**

- [CalHHS CDII: Data Exchange Framework](https://www.cdii.ca.gov/committees-and-advisory-groups/data-exchange-framework/), the single data sharing agreement and signing portal
