+++
title = "HL7 v2 & Interfaces"
description = "The pipe-delimited messages that still run hospitals: segments, ADT, orders, results, scheduling and charges, acknowledgments, MLLP and interface engines."
category = "Health Tech Industry"
order = 1907
part = "Records and Interoperability"
tags = ["health-tech", "hl7-v2", "interfaces", "mllp", "interface-engines", "adt"]
+++

When a patient is registered at a hospital's front desk, a text message leaves the registration system a fraction of a second later and fans out to the lab, radiology, pharmacy, the dietary system, the bed board, the billing system and a dozen outside vendors. It looks like `PID|1||000123456^^^GOODHEALTH^MR||Rivera^Ana^M||19850214|F`, it travels over a raw TCP socket, and it is HL7 Version 2, a standard whose oldest versions predate the web. The National Library of Medicine calls V2 "the most used health information exchange standard in the United States" and cites HL7's report that in 2024, 95% of US health care organizations and more than 35 countries were using it. FHIR is where new APIs go; v2 is where hospital events already flow, and any product that sells into a health system, or reads lab results, appointments or charges from a large EHR, connects to it.

This chapter covers how a v2 message is built, the message types that matter for practices and the vendors that serve them, acknowledgments, the MLLP transport, the interface engines that sit in the middle, and how to store and replay messages in your own system. The modern API side is [FHIR](/books/health-tech/fhir), and patient merges that arrive as v2 events are [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity).

## How the Platforms Do It

Nobody connects an EHR to forty systems point to point. A hospital or a vendor runs an **interface engine** that receives every feed, transforms it for each destination, routes it and keeps the messages. As of October 2026, from public pages:

| Product | Owner | What its public pages describe |
| --- | --- | --- |
| **Rhapsody Integration Engine** and **Corepoint Integration Engine** | Rhapsody (Hg-backed) | Two engines in one company since the July 2019 Rhapsody and Corepoint merger, plus the NextGate EMPI after the March 15, 2022 merger agreement |
| **Mirth Connect** | NextGen Healthcare | Open source for years; on March 19, 2025 NextGen moved to "a single commercial and proprietary Mirth Connect licensing model with Mirth Connect 4.6," with 4.5.2 "the last published open-source version" |
| **Iguana** | iNTERFACEWARE | A health care integration engine aiming to be "the one application our customers don't need to worry about" |
| **Infor Cloverleaf** | Infor | A health care integration platform that converts data across standards and moves it in real time |
| **Epic (as the source)** | Epic | A public catalog of HL7 v2 interfaces: incoming and outgoing patient administration, outgoing ancillary orders, incoming orders from CPOE systems, outgoing results, incoming results from lab instruments, scheduling, and incoming financial transactions "subject to charge entry checks" |

Two things in the table shape a vendor's strategy. **The EHR publishes the interface, the customer runs it.** Epic's catalog lists what its software sends and accepts, with downloadable specs, but each hospital decides which interfaces it licenses, builds and turns on, so "we integrate with Epic" means a project at every customer, not a switch. **Engine licensing moved.** Mirth Connect's open-source edition was a common free choice for small vendors and HIEs; after the 2025 license change, a team choosing an engine prices every option, Mirth included, as commercial software.

## Why v2 Still Runs Hospitals

V2 was designed for the problem hospitals have: many departmental systems inside one building that need to hear about the same events immediately. It is an **event notification** standard: something happened (a patient was admitted, an order was placed, a result was finalized) and here is the state that goes with it. It doesn't define queries in practice, a REST resource model, or authorization; the network was the hospital's own. Those gaps are why FHIR exists. They are also why v2 survives: every lab instrument, radiology system, pharmacy system and bed board in a hospital already speaks it, the events are exactly what departmental systems need, and replacing a working feed has no clinical benefit.

The standard has been revised for decades: versions run 2.1 through 2.9 and 2.9.1, and new versions mostly add fields and events while keeping old messages valid. In practice, US interfaces mostly sit on the older 2.x releases that public health and federal specifications cite (CDC's immunization code guidance, for example, names HL7 2.3.1 and 2.5.1 messages), not the newest one. The version in `MSH-12` is a hint, not a contract: the real contract is the interface specification the two sides agreed, field by field.

## Anatomy of a Message

A v2 message is lines of text called **segments**, each starting with a three-letter code, with fields separated by `|`. A registration:

```hl7
MSH|^~\&|REGADT|GOODHEALTH|IFENG|DENTAL|202610291412||ADT^A04^ADT_A01|MSG00001|P|2.5.1|||AL|NE
EVN|A04|202610291412
PID|1||000123456^^^GOODHEALTH^MR~X12345^^^AETNA^MB||Rivera^Ana^M||19850214|F|||12 Main St^^Tampa^FL^33602||^PRN^PH^^^813^5550142
PV1|1|O|CLINIC1^^^MAIN||||1234567890^Lee^Sam^^^^^^NPI
```

The delimiters are declared in the first segment itself. HL7 2.5.1 suggests `|` as the field separator, `^` for components, `~` for repetitions, `\` as the escape character and `&` for subcomponents, and the segment terminator is a carriage return (hex 0D) that implementers can't change. So `PID-3` above is a repeating field holding two identifiers, each with components: an MRN assigned by the hospital (`MR`) and a payer member id (`MB`). `PID-5` is the name, family name first. Fields are numbered from 1, and `MSH-1` is the field separator itself, which is why every parser has an off-by-one special case for MSH.

The segments a practice-facing integration meets most:

| Segment | Holds |
| --- | --- |
| **MSH** | Message header: sender and receiver applications and facilities, time, message type and trigger event, control id (`MSH-10`), processing id, version, acknowledgment modes |
| **EVN** | The trigger event and when it happened |
| **PID** | Patient identification: identifiers, name, birth date, sex, address, phones |
| **PV1** | Patient visit: class (inpatient, outpatient, emergency), location, attending provider, visit number |
| **IN1 / IN2** | Insurance: payer, plan, member id, subscriber |
| **ORC / OBR** | Common order and observation request: order control, placer and filler order numbers, the test ordered |
| **OBX** | One observation: a code, a value with its type and units, a status |
| **SCH / AIS / AIG / AIL / AIP** | Scheduling: the appointment, then the service, general resource, location and personnel resources |
| **FT1** | Financial transaction: a charge, payment or adjustment line |
| **MSA / ERR** | Acknowledgment and error detail |
| **Z segments** | Anything local: HL7 lets users "develop Z segments and add them to Z messages," and a Z message may be entirely Z segments after its MSH |

Z segments are where every real interface keeps its exceptions: the hospital's financial class, a flag the scheduling system needs, a field the standard didn't have when the interface was built. They are why two "ADT feeds" from the same EHR at two hospitals are different interfaces.

## The Messages That Run a Practice

Each message type has trigger events, written `TYPE^EVENT`. The ones that matter outside the hospital walls:

**ADT (admission, discharge and transfer).** The patient administration feed, and the one every vendor wants first, because it carries demographics, insurance and visits. HL7 2.5.1 names the events: **A01** admit/visit notification, **A02** transfer, **A03** discharge/end visit, **A04** register a patient, **A05** pre-admit, **A08** update patient information, **A11** cancel admit, **A13** cancel discharge, **A28** add person, **A31** update person, **A40** merge patient (patient identifier list), and **A47** change patient identifier list. An outpatient registration is usually A04, a demographics change A08. The merge and identifier events are the dangerous ones: an A40 tells you two of your records are now one, and a consumer that ignores it keeps charting on a retired MRN. Epic's own outgoing patient administration interface notes it "does not send final coded diagnoses, procedures, or DRGs after a hospital account is coded," a reminder that an ADT feed is not a billing feed.

**SIU (scheduling).** Appointment notifications from the scheduling system (the filler) to everyone else: **S12** new appointment booked, **S13** rescheduled, **S14** modified, **S15** cancelled, **S17** deleted because it was entered in error, and **S26** no-show, which "can set a status for statistics" and frees resources. The SCH segment is required in each, and the services and resources ride in AIS, AIG, AIL and AIP. Reminder and patient engagement vendors read SIU from systems that don't offer a scheduling API, and the difference between S15 (the visit won't happen) and S17 (it never existed) decides whether a cancellation counts in no-show metrics.

**ORM and OML (orders).** Orders from the ordering system to the performing one, with an ORC carrying order control (`NW` new order, `CA` cancel) and a detail segment such as OBR. In 2.5, ORM^O01 is "left for backward compatibility only," and HL7 recommends OML for laboratory and OMG for general orders, but ORM is still what many lab and imaging interfaces send.

**ORU (results).** "The ORU message is for transmitting laboratory results to other systems": an OBR for the report and one OBX per atomic observation, each with a value type, a code (LOINC for labs), units, a reference range, an abnormal flag and a result status. Preliminary, final and corrected results arrive as separate messages for the same order, so a consumer updates by filler order number and observation code, never by appending. Labs and results release rules are Labs, Imaging & Diagnostics in Part 6.

**DFT (charges).** DFT^P03 posts detail financial transactions: ancillary systems posting charges to billing, or registration posting a deposit. Its FT1 segments carry "the detail data necessary to post charges, payments, adjustments." This is the bridge between a separate EHR and PMS in [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data#ehr-pms-or-both), and Epic's incoming financial transactions are run through its charge entry checks before they post. **BAR** (P01 add account, P05 update account) maintains the billing accounts the charges post to.

**MDM (documents)** carries notes and transcribed reports, and immunization messages to state registries carry CDC's CVX vaccine codes in HL7 2.3.1 or 2.5.1, which matters to any practice that vaccinates.

## Acknowledgments

Every v2 message expects an answer. In **original mode** (when `MSH-15` and `MSH-16` are both empty), the receiver returns an application acknowledgment: `AA` accept, `AE` error, `AR` reject, in `MSA-1`, with the original control id in `MSA-2`:

```hl7
MSH|^~\&|IFENG|DENTAL|REGADT|GOODHEALTH|202610291412||ACK^A04^ACK|ACK00001|P|2.5.1
MSA|AA|MSG00001
```

**Enhanced mode** separates two questions. An **accept acknowledgment** (commit) says the receiver has safely stored the message: `CA` commit accept, `CE` commit error, `CR` commit reject. An **application acknowledgment** says it processed it, later. `MSH-15` and `MSH-16` say which of each the sender wants: `AL` always, `NE` never, `ER` on error or reject only, `SU` on success only. Original mode is equivalent to enhanced mode with `MSH-15 = NE` and `MSH-16 = AL`. The sample registration above asks for a commit acknowledgment always and no application acknowledgment.

The meaning that matters to an engineer: **an ACK is the receiver taking custody.** The sender may discard or advance once it has an `AA` or `CA`; until then it must resend. So a receiver must make the message durable before it acknowledges, and must treat a resend of the same control id as a duplicate, not a second registration. An `AE` or `AR` stops the queue at most sites: v2 feeds are ordered, and an interface that skips a rejected A08 and applies the next one can leave a patient's record in a state no single message described. Interface teams spend their days on that stopped queue.

## MLLP: The Transport

V2 over a network almost always rides the **Minimal Lower Layer Protocol**: a long-lived TCP connection where each message is wrapped in a start block byte `0x0B` and ended by `0x1C` followed by a carriage return `0x0D`, as HL7's MLLP implementation technology specification defines. That is the whole protocol. It has no length prefix, no checksum, no authentication and no encryption, and nothing in it acknowledges delivery: reliability comes from the HL7 ACK above, and security from what's underneath.

In practice that means **MLLP runs inside a VPN or TLS.** Vendor connections to hospitals are site-to-site IPsec tunnels or TLS-wrapped MLLP, one per customer, each with firewall rules and a change ticket at the hospital. The other transports are files (batch files of messages over SFTP, common for nightly charge and result feeds) and, increasingly, HTTPS posts of v2 payloads to a vendor endpoint. A cloud product that receives v2 runs a listener per customer connection or terminates the tunnels at an engine and forwards over HTTPS; either way, the listener's job is the same: frame, persist, ACK, then process.

## Interface Engines

An engine does four jobs: **receive** on many connections, **transform** (map fields, translate codes, split or merge messages, drop what a destination doesn't want), **route** to destinations by message type and content, and **store** every message with its status so anything can be searched and resent. The vendors' differences are licensing, scripting language and the operations tooling around queues and alerts. Rhapsody's March 2022 NextGate agreement shows where the category went: identity resolution (an EMPI) next to the engine, because matching patients across feeds is the hard part.

A vendor selling into health systems meets the engine as the customer's front door. The hospital's interface team receives your specification, maps their EHR's feed to it in their engine, and sends only what you need, often with filters (one clinic's appointments, one order type). A vendor at scale runs its own engine too, to normalize hundreds of slightly different feeds into one internal shape. My default for a product team: **write the normalizer as code you own, and put an engine in front of it only for transport and per-site mapping.** The engine is good at sockets, queues and field maps; your product's meaning of an appointment belongs in your code and tests.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Every v2 connection is an `integrations` row with `method = 'hl7v2'` and one or more interface channels; every message in or out is kept raw, parsed into a header index, acknowledged, and processed separately, with its effect on core records traceable.

```sql
CREATE TABLE interface_channels (              -- one feed on one connection
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  integration_id       UUID NOT NULL REFERENCES integrations (id),
  direction            TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_types        TEXT[] NOT NULL,        -- {'ADT^A04', 'ADT^A08', 'ADT^A40'}
  hl7v2_version        TEXT NOT NULL,          -- the agreed version, e.g. '2.5.1'
  spec_ref             TEXT NOT NULL,          -- the interface specification both sides signed
  transport            TEXT NOT NULL CHECK (transport IN ('mllp_tls', 'mllp_vpn', 'sftp_batch',
                         'https')),
  sending_facility     TEXT,                   -- MSH-4 expected on this channel
  identifier_issuer    TEXT,                   -- PID-3 assigning authority for this site's MRNs
  mapping_version      TEXT NOT NULL,          -- field map and code translations in force
  status               TEXT NOT NULL CHECK (status IN ('testing', 'live', 'held', 'retired'))
);

CREATE TABLE hl7_messages (                    -- every message, as received or sent
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  channel_id       UUID NOT NULL REFERENCES interface_channels (id),
  control_id       TEXT NOT NULL,              -- MSH-10
  message_type     TEXT NOT NULL,              -- 'ADT'
  trigger_event    TEXT NOT NULL,              -- 'A08'
  message_time     TIMESTAMPTZ,                -- MSH-7
  sequence_number  BIGINT NOT NULL,            -- receive or send order on this channel
  raw              BYTEA NOT NULL,             -- exactly the bytes, encrypted at rest
  raw_sha256       BYTEA NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT NOT NULL DEFAULT 'received'
                     CHECK (status IN ('received', 'processed', 'filtered', 'error',
                     'held', 'replayed')),
  mapping_version  TEXT,                       -- the channel's mapping that processed it
  error            TEXT,
  duplicate_of     UUID REFERENCES hl7_messages (id),
  UNIQUE (channel_id, control_id, raw_sha256),
  UNIQUE (channel_id, sequence_number)
);

CREATE INDEX hl7_messages_pending_idx
  ON hl7_messages (channel_id, sequence_number)
  WHERE status IN ('received', 'error', 'held');

CREATE TABLE hl7_acks (                        -- the acknowledgment sent or received for a message
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  message_id       UUID NOT NULL REFERENCES hl7_messages (id),
  kind             TEXT NOT NULL CHECK (kind IN ('accept', 'application')),
  code             TEXT NOT NULL CHECK (code IN ('AA', 'AE', 'AR', 'CA', 'CE', 'CR')),
  raw              BYTEA NOT NULL,
  error_detail     JSONB,                      -- ERR segments, parsed
  at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, kind)
);

CREATE TABLE hl7_message_effects (             -- which core records a message created or changed
  message_id       UUID NOT NULL REFERENCES hl7_messages (id),
  record_table     TEXT NOT NULL,              -- 'patients', 'appointments', 'charges'
  record_id        UUID NOT NULL,
  action           TEXT NOT NULL CHECK (action IN ('created', 'updated', 'merged',
                     'cancelled', 'ignored')),
  PRIMARY KEY (message_id, record_table, record_id)
);
```

The sync position for a feed is a `sync_cursors` row per integration, with `resource` naming the channel and `cursor` the last processed `sequence_number`, so processing can stop on an error and resume in order.

Design decisions:

- **Persist, then acknowledge, then process.** The listener writes `raw` and returns the commit or application ACK only after the row is durable; processing runs from the table. A crash after the ACK loses nothing, and a crash before it makes the sender resend ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox) is the outbound twin).
- **Raw bytes are the record.** Parsed fields are an index, not a replacement. When a mapping bug is found months later, the fix is a reprocess of the stored messages under a new `mapping_version`, and a payer or court question about what a system sent is answered with the bytes.
- **Duplicates are expected.** Senders resend on timeouts with the same control id; the unique key and `duplicate_of` turn a resend into a no-op ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Order is per channel.** `sequence_number` and the pending index let a feed stop on an error and hold everything behind it, which is how interface teams expect a feed to behave. Different channels never block each other.
- **Acknowledgments are their own rows.** Enhanced mode can produce a commit and an application ACK for one message, and an outbound message's ACK arrives later from the other side; `hl7_acks` keeps both with their raw bytes and error detail.
- **Identifiers carry their issuer.** A `PID-3` MRN is stored in `patient_identifiers` with `issuer` set to the channel's assigning authority, because MRN 000123456 at two hospitals is two patients ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)).
- **Merges are events, not overwrites.** An A40 or A47 becomes a merge or identifier change in the patient index with its source message, reversible like any other merge ([Patient Matching & Identity](/books/health-tech/patient-matching-and-identity#merges-overlays-and-unmerges)).
- **Effects are recorded.** `hl7_message_effects` answers "which message created this appointment?" and "what did this A08 change?", the two questions every support ticket about a feed starts with.
- **Messages are PHI.** The table is encrypted, access to raw messages is a logged read, and retention follows the integration's contract and the customer's record rules ([Data Retention & Deletion](/docs/architecture/data-retention)).

## Auditing

- **Every message and its ACK,** byte for byte, with receive time, sequence and status, kept for the period the customer contract and the record rules require.
- **What each message did:** the core records it created, changed, merged or cancelled, and messages filtered out with the rule that filtered them.
- **Errors, holds and replays:** who released a held queue, who replayed which messages, and why. A replay is an act with an operator, not a silent rerun.
- **Mapping versions:** which version of a site's field map and code translations processed each message, so a historical result can be explained.
- **Access to raw messages,** because a message log is a PHI store that support staff will want to search ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Expect v2 at every health system,** and treat each customer's feed as its own interface with its own specification, Z segments and quirks.
- **Ask for the narrowest feed you need** (ADT for demographics and visits, SIU for appointments, ORU for results, DFT for charges) and filters at the customer's engine.
- **Persist before you acknowledge,** and treat a resent control id as a duplicate.
- **Process each connection in order,** stop on errors, and give operators a held queue and a replay with an audit trail.
- **Keep raw messages and parse them into an index,** so mapping fixes are reprocessing, not data surgery.
- **Store identifiers with their assigning authority** and handle merge and identifier-change events as merges.
- **Run MLLP only inside TLS or a VPN,** one connection per customer, with the listener as small as possible.

## References

**Standards**

- [HL7 v2.5.1, Chapter 2: Control (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch02.html), delimiters and the fixed segment terminator, acknowledgment codes, original and enhanced modes, MSH-15 and MSH-16 values, Z segments
- [HL7 v2.5.1, Chapter 3: Patient Administration (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch03.html), ADT trigger events A01 through A47
- [HL7 v2.5.1, Chapter 4: Order Entry (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch04.html), ORM kept for backward compatibility, OML and OMG recommended, ORC order control
- [HL7 v2.5.1, Chapter 6: Financial Management (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch06.html), DFT^P03, FT1, P01 and P05 account events
- [HL7 v2.5.1, Chapter 7: Observation Reporting (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch07.html), ORU^R01, OBR and OBX
- [HL7 v2.5.1, Chapter 10: Scheduling (HL7 Europe)](https://www.hl7.eu/HL7v2x/v251/std251/ch10.html), SIU events S12 through S26, SCH, AIS, AIG, AIL and AIP
- [HL7 Version 2.9 index (HL7 Europe)](https://www.hl7.eu/HL7v2x/v29/hl7v29.htm), versions 2.1 through 2.9 and 2.9.1
- [HL7v2 for Elixir: MLLP](https://hl7v2.hexdocs.pm/HL7v2.MLLP.html), the 0x0B, 0x1C and 0x0D framing bytes from HL7's MLLP specification (library documentation)
- [NLM: Health Data Standards and Terminologies tutorial, HL7](https://www.nlm.nih.gov/oet/ed/healthdatastandards/03-300.html), V2 as the most used exchange standard in the US, 95% of organizations and 35+ countries in 2024
- [CDC: IIS code set, CVX](https://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx), immunization messages in HL7 2.3.1 and 2.5.1

**In practice**

- [Epic: HL7v2 interfaces (open.epic)](https://open.epic.com/Interface/HL7v2), the published catalog of patient administration, order, result, scheduling and financial interfaces
- [NextGen: A new era for Mirth Connect](https://www.nextgen.com/blog/industry-news/a-new-era-for-mirth-connect-by-nextgen-healthcare), the March 19, 2025 move to commercial licensing with 4.6, 4.5.2 the last open-source version
- [Rhapsody: Rhapsody and Corepoint merge](https://rhapsody.health/blog/rhapsody-and-corepoint-merge-to-advance-interoperability-in-healthcare/), the July 10, 2019 announcement and Hg as investor
- [Rhapsody: Lyniate and NextGate announce merger agreement](https://rhapsody.health/blog/lyniate-and-nextgate-announce-merger-agreement-advancing-healthcare-interoperability-leadership/), March 15, 2022, the EMPI and the two engines
- [iNTERFACEWARE: Iguana](https://www.interfaceware.com/), the Iguana integration engine
- [Infor: Cloverleaf](https://www.infor.com/products/cloverleaf), the Cloverleaf integration platform
