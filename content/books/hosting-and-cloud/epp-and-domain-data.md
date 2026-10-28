+++
title = "The Domain Data Model & EPP"
description = "EPP's domain, host and contact objects, every status code, commands, result codes and extensions, and how a registrar runs and reconciles registry sessions."
category = "Hosting & Cloud Industry"
order = 2162
part = "Domains and DNS"
tags = ["domains", "epp", "registries", "data-model", "protocols"]
+++

A registrar's domain is two records that must agree. The registry holds the authoritative one: the name, who sponsors it, its expiry, its statuses, its nameservers and, depending on the registry, its contacts. The registrar holds everything else: the customer, the payment, the renewal setting, the history, and its own copy of the registry's fields so it can show them without asking. The protocol between them is the Extensible Provisioning Protocol (EPP), a stateful XML protocol over TLS in which the registrar is always the client and the registry always the server. Every create, renewal, transfer, lock, delete and DNSSEC change is an EPP command, and every one of them can succeed at the registry and fail to reach the registrar's database, or the other way round.

This chapter covers the data model EPP defines and how a registrar builds on it: how RRP gave way to EPP, the domain, host and contact objects, every status a domain can carry and who may set it, the commands, transaction identifiers and result codes, the extensions registrars rely on, and how to run registry sessions and keep two copies of the truth in step. It extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)'s `domains` side table with contacts, hosts, statuses and a transaction log.

## How the Providers Do It

EPP is one protocol with many operating rules: each registry sets its own session limits, access controls and policies on top of the RFCs, and each registrar or wholesaler decides how much of it to expose. As of October 2026:

| Registry or platform | Interface | Session and access rules | What it shows |
| --- | --- | --- | --- |
| **Verisign** (.com, .net) | EPP, with the .com registry agreement citing "EPP RFCs 5730-5734" for formatting | A Registry-Registrar Agreement whose payment security sets each registrar's credit limit | The protocol is in the contract; the money behind every command is too |
| **Nominet** (.uk and the other TLDs it runs) | EPP | Concurrent sessions limited per accreditation: 6 for .uk, 5 for its other registries; connections only from allow-listed IPs; 30-minute idle timeout; no per-session command limit, but abusive volumes can be restricted | Poll recommended over hello as a keepalive because it keeps the message queue current |
| **CZ.NIC** (FRED, .cz) | EPP | Parallel sessions limited per registrar; access controlled by IP ranges and certificates; SSL can be enforced | An optional credit system that "assigns a configurable cost to EPP operations" |
| **GoDaddy Registry** | EPP back end for about 170 TLDs | Per its registry agreements | One back end, one integration, many TLDs |
| **Tucows** (OpenSRS) | A reseller API, storefront and control panel over its own registry connections | Per its reseller agreement | Resellers never speak EPP; the wholesaler absorbs the per-registry differences |

The pattern: **EPP standardizes the objects and commands, not the operation.** Session counts, timeouts, allowed IPs, credit, rate limits and policy errors differ per registry and per back end, so a registrar's EPP client is one protocol implementation with a policy profile per back end, not one client per TLD.

## How It Got Here

**RRP: a thin protocol for one registry (2000).** The shared registry for .com, .net and .org started on the Registry Registrar Protocol, RFC 2832 (May 2000), written by two Network Solutions Registry engineers: a line-oriented text protocol with ten commands (ADD, CHECK, DEL, DESCRIBE, MOD, QUIT, RENEW, SESSION, STATUS, TRANSFER), sessions "encrypted using the Secure Socket Layer (SSL) v3.0 protocol" on TCP port 648, and two objects, domains and nameservers. It solved the immediate problem of letting competing registrars write to one registry. It cost a protocol tied to one registry's model, with no contacts and no way to extend it.

**EPP (2004 to 2009).** EPP was standardized as RFC 3730 in March 2004, revised as RFC 4930, and reached Internet Standard as STD 69 with RFC 5730 in August 2009, written by Scott Hollenbeck of VeriSign, alongside the object mappings for domains (RFC 5731), hosts (5732) and contacts (5733) and the TCP transport (5734). It solved extensibility: objects are XML namespaces, and anything a registry needs beyond them is an extension that doesn't change the core. It added contacts as registry objects, which let registries hold registrant data ("thick" registries), a choice later complicated by privacy law ([Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-it-got-here)).

**Grace periods as protocol (2004).** The Redemption Grace Period that ICANN had introduced in .com and .net in January 2003 got its EPP mapping in RFC 3915 (September 2004), also from VeriSign: the grace-period statuses and the restore command ([The Domain Lifecycle](/books/hosting-and-cloud/domain-lifecycle#how-it-got-here)).

**Extensions for each new problem (2010 to 2022).** DNSSEC delegation data (RFC 5910), launch phases for new TLDs (RFC 8334, March 2018), notification of changes the registry made itself (RFC 8590, May 2019), premium fees (RFC 8748, 2020), login security (RFC 8807, 2020), registry data escrow formats (RFC 9022, 2021) and secure, short-lived authorization codes (RFC 9154, 2022). The core protocol hasn't changed since 2009; the work moved to extensions, which is both EPP's strength and the reason two registries' "EPP" can still need different code.

## The Objects

EPP defines three object types. Each has a server-assigned Repository Object Identifier (ROID), a sponsoring client (`clID`), creating and updating clients, timestamps in UTC with no offsets, and a status set.

**Domain (RFC 5731).** The attributes a registrar maps into its own tables:

| Element | What it is | Registrar's copy |
| --- | --- | --- |
| `name`, `roid` | The fully qualified name and the registry's object ID | `domains.name`, `domains.registry_roid` |
| `status` | One or more status values ([Statuses](#statuses)) | `domain_statuses` rows |
| `registrant`, `contact` (`admin`, `billing`, `tech`) | Contact object IDs, where the registry holds contacts | `domain_contacts` |
| `ns` | Nameservers, as `hostObj` references to host objects or `hostAttr` names with optional addresses; a server "MUST use one name server specification form consistently" | `domains.nameservers` |
| `host` | Subordinate host objects under the domain | `domain_hosts` |
| `clID`, `crID`, `upID` | Sponsoring, creating and last-updating registrar | `domains.sponsoring_registrar_iana_id` |
| `crDate`, `upDate`, `exDate`, `trDate` | Created, updated, expires, last transferred | `domains.expires_at` mirrors `exDate` |
| `authInfo` | The transfer authorization code; password-based in the base mapping | Never stored in clear ([Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#the-transfer-flow)) |

Periods are in years (`y`) or months (`m`), from 1 to 99 units, and a server may set a lower maximum; in practice gTLD registries cap a registration at ten years, as the base agreement and the .com specification do. Renewal requires the current expiry date (`curExpDate`), which guards against a retried renew adding a second year.

**Host (RFC 5732).** A nameserver with a name, a ROID, statuses and zero or more IPv4 and IPv6 addresses. An **external** host has a name outside the registry's namespace (a `.net` nameserver used by a `.com` domain at a registry that doesn't serve `.net`); an **internal** host is subordinate to a domain in the registry, and "the superordinate domain of the host MUST be known to the server before the host object can be created." Addresses are "REQUIRED only as needed to produce DNS glue records", so only internal hosts used for delegation carry them. A host linked to a domain carries the `linked` status and "SHOULD NOT be deleted", which is the most common surprise when a customer deletes a domain whose name others use for their nameservers: the delete fails with `2305` until the other domains stop pointing at the host or the registry renames it.

**Contact (RFC 5733).** A person or organization with a client-chosen ID, up to two `postalInfo` forms (`int`, restricted to a 7-bit ASCII subset, and `loc`, any UTF-8), voice and fax numbers in `+CC.number` form, an email address, an `authInfo`, and a `disclose` element by which the client asks the server to publish or withhold fields, rejected with `2308` where it conflicts with the server's data policy. A contact referenced by a domain is `linked`; `ok` may combine only with `linked`. Which contacts a registry accepts, and whether the registrar sends any at all, is now a data-protection question: the Registration Data Policy lets registrars send registrant data to a registry only with a legal basis and an agreement in place ([The Registration Data Policy](/books/hosting-and-cloud/registration-data-and-rdap#the-registration-data-policy)).

## Statuses

A domain's statuses are the registry's state machine and its lock model at once. RFC 5731 defines seventeen; RFC 3915 adds the grace-period states, carried in the `rgp` extension. The `client` prefix means the sponsoring registrar sets and clears it; `server` means only the registry can:

| Status | Set by | What it means | Typical cause |
| --- | --- | --- | --- |
| `ok` | Registry | Nothing pending, nothing prohibited; never combined with another status | The default |
| `inactive` | Registry | No nameserver delegation, so the name isn't in the DNS | Registered without nameservers |
| `pendingCreate`, `pendingRenew`, `pendingTransfer`, `pendingUpdate`, `pendingDelete` | Registry | An operation received and not yet complete; at most one pending state at a time | Registries that process asynchronously; a transfer awaiting the losing registrar; a deletion in progress |
| `clientHold` | Registrar | Not published in the DNS | Non-payment, abuse suspension, unverified registrant data, a dispute, pending deletion |
| `serverHold` | Registry | Not published in the DNS | Registry action on abuse, a court order, a registry policy breach |
| `clientTransferProhibited` | Registrar | Transfer requests rejected | Registrar lock, on by default at many registrars; abuse transfer lock |
| `clientUpdateProhibited`, `clientDeleteProhibited`, `clientRenewProhibited` | Registrar | Updates, deletion or renewal rejected | Account protection; disputes; a name being deleted |
| `serverTransferProhibited`, `serverUpdateProhibited`, `serverDeleteProhibited`, `serverRenewProhibited` | Registry | The same, enforced by the registry | Registry lock; UDRP and court orders; names in redemption |
| `addPeriod`, `renewPeriod`, `autoRenewPeriod`, `transferPeriod` | Registry (RGP) | Inside a grace period in which a delete earns the registrar a credit | Just created, renewed, auto-renewed or transferred |
| `redemptionPeriod` | Registry (RGP) | Deleted, restorable for 30 days in gTLDs | The registrar deleted it |
| `pendingRestore` | Registry (RGP) | A restore was requested; the registry awaits the restore report | Recovery from redemption |
| `pendingDelete` (alone) | Registry (RGP) | Redemption ended without restore; purge follows in days | Release to the open market |

Three rules from RFC 5731 make the set a valid state machine: `ok` is exclusive; a pending state can't coexist with the matching prohibition (`pendingDelete` with `clientDeleteProhibited` or `serverDeleteProhibited`, and likewise for renew, transfer and update); and the five pending states exclude each other. Registrars build two things on top. **Locks** are combinations: a registrar lock is `clientTransferProhibited` plus usually `clientUpdateProhibited` and `clientDeleteProhibited`, and a registry lock is the `server` trio set by the registry after an out-of-band check ([Registrar Lock and Registry Lock](/books/hosting-and-cloud/transfers-and-locks#registrar-lock-and-registry-lock)). **Holds** are the DNS switch: `clientHold` is the registrar's suspension lever for non-payment and abuse ([From Intake to Mitigation](/books/hosting-and-cloud/dns-abuse#from-intake-to-mitigation)), and lifting it takes effect only as resolvers' caches expire.

Statuses are also what customers see in RDAP and what support is asked about, so the registrar has to know why each one is there. A `clientHold` the billing system set and a `clientHold` the abuse desk set are the same bit at the registry and two different decisions in the registrar's records, which is why statuses are rows with a reason and an origin, not a column of flags ([How to Build It](#how-to-build-it)).

## Commands and Responses

EPP is a request-response protocol. After the TLS connection opens, the server sends a `<greeting>` listing its versions, languages, object namespaces, extensions and data collection policy; the client sends `<login>` with its credentials and the namespaces and extensions it will use; `<hello>` asks for a fresh greeting, and `<logout>` ends the session.

| Kind | Commands | What a registrar uses them for |
| --- | --- | --- |
| Query | `<check>`, `<info>`, `<poll>`, `<transfer op="query">` | Availability at search, reading the registry's current record, the message queue, transfer status |
| Transform | `<create>`, `<delete>`, `<renew>`, `<update>`, `<transfer>` with `op` of `request`, `approve`, `reject` or `cancel` | Registering, deleting, renewing, changing nameservers, contacts, statuses and DNSSEC data, and both sides of a transfer |
| Extension | The `rgp` restore inside `<update>`; fee, launch and DNSSEC elements inside other commands | Restoring from redemption; confirming a premium price; sunrise applications; DS records |

**Transaction identifiers.** Each command may carry a client transaction ID (`<clTRID>`) from the client's own namespace, and each response carries the server's `<svTRID>`, unique at that server; the pair is the transaction's identity, and RFC 5730 says both SHOULD be logged and retained. **Result codes** are four digits: the first is success (`1`) or failure (`2`), the second the category. The ones a registrar's code must branch on:

| Code | Meaning | What the registrar does |
| --- | --- | --- |
| `1000` | Command completed successfully | Commit the local change |
| `1001` | Command completed successfully; action pending | Record the pending state; wait for the poll message that completes it (transfers) |
| `1300`, `1301` | No messages; ack to dequeue | Poll loop control |
| `1500` | Ending session | Reconnect |
| `2003`, `2004`, `2005` | Required parameter missing; parameter value range or syntax error | A bug or a validation gap: fix the request, don't retry |
| `2104` | Billing failure | The payment security or registry credit is exhausted: alert finance; every further create will fail |
| `2105`, `2106` | Not eligible for renewal or transfer | Explain to the customer (expiry window, a recent transfer, a lock) |
| `2201`, `2202` | Authorization error; invalid authorization information | Not the sponsor, or a wrong auth code |
| `2302`, `2303` | Object exists; object does not exist | Taken at create; drifted local record at update |
| `2304`, `2305` | Object status or association prohibits the operation | A lock or hold; a linked host or contact |
| `2306`, `2308` | Parameter value policy error; data management policy violation | Registry policy, such as a disallowed `disclose` or an ineligible registrant |
| `2400` | Command failed | Registry-side failure: retry with backoff, then reconcile |
| `2500`, `2501`, `2502` | Command failed, authentication error or session limit exceeded, and the server is closing the connection | Reconnect within the session budget |

**The ambiguous outcome.** RFC 5730 is explicit that if no response arrives, or the response is malformed, "Command success or failure MUST NOT be assumed." A create that timed out may have registered the name and debited the registrar's credit. The safe sequence is to reconnect and `<info>` (or `<check>`) the object, compare the registry's state with the intended one, and only then retry or roll back locally. Retrying blindly is safe for some commands and not others: a repeated create returns `2302`, which is fine; a repeated renew is stopped by `curExpDate`; a repeated update that adds a status is usually harmless; a repeated delete of a name that has since been re-registered is not (the playbook's [What Is Safe to Retry](/docs/architecture/retries-and-timeouts#what-is-safe-to-retry)).

**The poll queue.** The registry tells the registrar about things it didn't do itself through a message queue: `<poll op="req"/>` returns the oldest message with a `<msgQ>` count and ID, and `<poll op="ack" msgID="...">` dequeues it. Transfer requests from other registrars, completed and auto-approved transfers, registry-side status changes and, with RFC 8590's change poll extension, the object's resulting state and who changed it and why, all arrive here. A registrar that stops polling loses outbound transfer deadlines ([The Transfer Flow](/books/hosting-and-cloud/transfers-and-locks#the-transfer-flow)) and silently drifts from the registry.

## Extensions

EPP extends in three places: whole new objects (namespaces), new elements inside an existing command or response (the `<extension>` element), and protocol-level additions. Each must be announced in the greeting and named at login. The ones a gTLD registrar can't avoid, as of October 2026:

| Extension | RFC | What it carries | Registrar use |
| --- | --- | --- | --- |
| Grace period mapping (`rgp`) | 3915 (2004) | The grace-period statuses; `restore` with `op="request"` or `op="report"`, the report's pre- and post-deletion data, deletion and restore times, reason and two statements | Recovering names from redemption ([Redemption and Pending Delete](/books/hosting-and-cloud/domain-lifecycle#redemption-and-pending-delete)) |
| DNSSEC (`secDNS-1.1`) | 5910 | DS records or key data on a domain | Publishing a customer's DS at the parent ([DNSSEC Operations](/books/hosting-and-cloud/dns-hosting-and-dnssec#dnssec-operations)) |
| Launch phase | 8334 (2018) | Applications and registrations during sunrise and other launch phases, with trademark claims | Selling a new TLD before general availability ([Launch Phases](/books/hosting-and-cloud/new-gtlds-and-cctlds#launch-phases)) |
| Change poll | 8590 (2019) | The object's state after a server-side change, optionally its prior state, and what changed, when, by whom and why | Learning about registry actions (holds, locks, auto-renewals) without polling `<info>` |
| Registry fee | 8748 (2020) | Fees and credits for a command, queried at `<check>` and confirmed on the transform | Premium and promotional pricing: the registrar asserts the fee it expects, and the registry rejects the command if the fee differs |
| Login security | 8807 (2020) | Longer passwords and security events (password expiry, weak ciphers) at login | Credential rotation for registry accounts |
| Secure authorization information | 9154 (2022) | Random, short-lived, single-use auth codes stored hashed at the registry | The model the Transfer Policy Review adopts ([The Transfer Policy Review](/books/hosting-and-cloud/transfers-and-locks#the-transfer-policy-review)) |
| Registry data escrow (DNRD) | 9022 (2021) | The escrow deposit format for domain registries | Registries, not registrars; registrars escrow under RAA 3.6 |

Registries add their own proprietary extensions for local rules (eligibility data, local-presence attestations, IDN tables), and ccTLD registries in particular do; the registrar's policy profile per back end records which ones each requires.

## Registry Integration

Running EPP is running a set of long-lived, rate-limited, authenticated connections to dozens of servers that each own part of the registrar's data.

**Sessions.** RFC 5734 maps EPP onto TCP port 700 with TLS that "MUST be used to provide integrity, confidentiality, and mutual strong client-server authentication": the registrar presents a client certificate, the registry checks it and usually an IP allow-list, then the login. Each data unit is a 32-bit length header followed by the XML. A client may pipeline commands on a session but "MUST NOT distribute commands from a single EPP session over multiple TCP connections." Registries cap concurrent sessions per registrar (Nominet allows 5 or 6) and close idle ones (Nominet after 30 minutes), so the client is a small pool per back end, kept warm by polling, with a session budget shared across every worker that needs the registry.

**Credit.** Every billable command draws on the registrar's credit at that registry. The client should know the balance (from the registry's portal or reports), refuse to send creates it knows will fail, and treat `2104` as an incident rather than a per-order error.

**Ordering with payment.** A registration is two commitments in two systems. My order is: authorize the customer's payment, send the create, capture on `1000`, and on a failed capture delete within the Add Grace Period for a credit, within the registry's monthly limit ([Grace Periods](/books/hosting-and-cloud/domain-lifecycle#grace-periods)). The command and its outcome are recorded before and after sending, so a crash between the two leaves a row that says "sent, outcome unknown" for reconciliation to resolve.

**Testing.** Registries run test environments; Nominet's OT&E testbed, for example, is reached from registered IPs and doesn't replicate live data. A registrar certifies there before it gets production credentials, and keeps the test profile current because extensions and policies change.

**Reconciliation.** The registry is authoritative for what it holds: sponsorship, expiry, statuses, nameservers, DNSSEC data. The registrar is authoritative for everything else. A reconciliation job compares the two on a schedule (with `<info>` for changed or suspicious names, and registry-provided reports where available) and treats every difference as a finding with an owner: a name the registry shows as sponsored that the registrar has no record of, a status the registrar didn't set, an expiry that moved, a missed transfer. Mirrored fields are overwritten from the registry; registrar decisions that the registry doesn't reflect (a hold recorded but never sent) are resent.

**Records the contracts require.** The RAA requires registration and transaction records for the term of the agreement plus two years (3.4) and escrow deposits on ICANN's schedule and format (3.6); the transaction log below is the first of those.

## Integration Options

| Approach | What it gives | What it costs | Fits |
| --- | --- | --- | --- |
| **Direct EPP per back end** | Full control of every command, extension and timing; registry prices | Accreditation, a session pool and policy profile per back end, certification, credit at each registry, an on-call integration | Accredited registrars with volume in the TLDs they connect to |
| **One wholesale registrar's API** (OpenSRS and its peers) | One integration for hundreds of TLDs; the wholesaler handles sessions, credit, certification and quirks | Wholesale prices; the wholesaler's lifecycle timings, error mapping and feature lag (a registry extension the wholesaler doesn't expose doesn't exist for you) | Hosts and platforms that sell domains alongside other products |
| **Hybrid** | Direct EPP for the few TLDs that carry most volume, wholesale for the long tail | Two integrations and one internal model that hides the difference | Registrars growing out of wholesale |
| **Open-source EPP toolkits** | A protocol client to build on | Still one policy profile per registry, and the operational work is the same | Teams building direct EPP |

## My Default

My default is the hybrid: direct EPP for the handful of back ends that carry most of the names (for most registrars, Verisign for .com and .net, then the two or three largest registry service providers), and a wholesale registrar for everything else, behind one internal domain model that doesn't care which path a name took. The internal model is the part I'd never compromise on. Statuses as rows with origins, contacts as role assignments over versioned registrant data, every command as a logged transaction with both identifiers, and a reconciliation job that runs whether or not anything looks wrong. The tradeoff that would change the split is volume: a registrar whose names are spread thinly across hundreds of TLDs gets little from direct connections, and one that lives in .com gets most of the value from a single integration.

## How to Build It

The core `domains` side table holds the name, TLD, registry ROID, mirrored expiry and role, and [ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#how-to-build-it) adds the sponsor and reseller. This chapter adds the EPP objects and the transaction log. Contact data itself lives in [Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-to-build-it)'s `registrant_data`, versioned and never updated in place; contacts here are the assignment of a version to a role on a domain.

```sql
ALTER TABLE domains
  ADD COLUMN nameservers  TEXT[] NOT NULL DEFAULT '{}',  -- the delegation as the registry holds it
  ADD COLUMN registry_synced_at TIMESTAMPTZ;             -- last successful <info> or poll update

CREATE TABLE epp_transactions (          -- every command sent, and what came back
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tld             TEXT NOT NULL REFERENCES registries (tld),
  cl_trid         TEXT NOT NULL UNIQUE,  -- the client transaction id, generated before sending
  sv_trid         TEXT,                  -- the registry's; null until a response arrives
  command         TEXT NOT NULL CHECK (command IN ('check', 'info', 'create', 'renew',
                    'update', 'delete', 'transfer_request', 'transfer_approve',
                    'transfer_reject', 'transfer_cancel', 'transfer_query', 'restore_request',
                    'restore_report', 'poll_req', 'poll_ack')),
  object_type     TEXT NOT NULL CHECK (object_type IN ('domain', 'host', 'contact', 'message')),
  object_key      TEXT NOT NULL,         -- the name, host name, contact id or poll message id
  domain_id       UUID REFERENCES domains (resource_id),
  extensions      TEXT[] NOT NULL DEFAULT '{}',  -- namespaces used: rgp, secDNS, fee, launch
  request_digest  TEXT NOT NULL,         -- hash of the XML sent; auth codes never stored
  request_summary JSONB NOT NULL,        -- the fields that matter, redacted
  fee_asserted    NUMERIC(14,4),         -- minor units, when the fee extension was used
  outcome         TEXT NOT NULL DEFAULT 'sent' CHECK (outcome IN ('sent', 'succeeded',
                    'pending', 'failed', 'unknown', 'reconciled')),
  result_code     SMALLINT CHECK (result_code BETWEEN 1000 AND 2502),
  result_msg      TEXT,
  initiated_by    TEXT NOT NULL,         -- typed actor: 'customer:...', 'system:renewal', staff
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  reconciles_id   UUID REFERENCES epp_transactions (id),  -- the ambiguous one this resolved
  CHECK ((sv_trid IS NULL) = (responded_at IS NULL) OR outcome = 'unknown'),
  CHECK (outcome NOT IN ('succeeded', 'pending', 'failed') OR result_code IS NOT NULL)
);
CREATE INDEX epp_transactions_unresolved ON epp_transactions (tld, sent_at)
  WHERE outcome IN ('sent', 'unknown');

CREATE TABLE domain_statuses (           -- what the registry shows, and why it is there
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id              UUID NOT NULL REFERENCES domains (resource_id),
  status                 TEXT NOT NULL CHECK (status IN ('ok', 'inactive',
                           'pendingCreate', 'pendingDelete', 'pendingRenew', 'pendingTransfer',
                           'pendingUpdate', 'clientDeleteProhibited', 'clientHold',
                           'clientRenewProhibited', 'clientTransferProhibited',
                           'clientUpdateProhibited', 'serverDeleteProhibited', 'serverHold',
                           'serverRenewProhibited', 'serverTransferProhibited',
                           'serverUpdateProhibited', 'addPeriod', 'autoRenewPeriod',
                           'renewPeriod', 'transferPeriod', 'redemptionPeriod',
                           'pendingRestore')),
  origin                 TEXT NOT NULL CHECK (origin IN ('client', 'server', 'rgp')),
  reason                 TEXT,           -- why the registrar set it: 'non_payment', 'abuse', 'lock', ...
  set_by_transaction_id  UUID REFERENCES epp_transactions (id),  -- the registrar's update, or the poll
                                                                 -- or info that revealed it
  valid_during           TSTZRANGE NOT NULL,
  CHECK ((origin = 'client') = (status LIKE 'client%')),
  CHECK (origin <> 'client' OR set_by_transaction_id IS NOT NULL),
  EXCLUDE USING GIST (domain_id WITH =, status WITH =, valid_during WITH &&)
);

CREATE TABLE domain_hosts (              -- host objects the registrar created under its names
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tld            TEXT NOT NULL REFERENCES registries (tld),
  host_name      TEXT NOT NULL,          -- A-label, lowercase
  superordinate_domain_id UUID REFERENCES domains (resource_id),  -- null: external host
  registry_roid  TEXT,
  addresses      INET[] NOT NULL DEFAULT '{}',  -- glue; only for internal hosts
  linked         BOOLEAN NOT NULL DEFAULT FALSE, -- mirrored 'linked' status
  exists_during  TSTZRANGE NOT NULL,
  CHECK (superordinate_domain_id IS NOT NULL OR cardinality(addresses) = 0),
  EXCLUDE USING GIST (tld WITH =, host_name WITH =, exists_during WITH &&)
);

CREATE TABLE domain_contacts (           -- which registrant data version fills which role
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  domain_id            UUID NOT NULL REFERENCES domains (resource_id),
  role                 TEXT NOT NULL CHECK (role IN ('registrant', 'admin', 'tech', 'billing')),
  registrant_data_id   UUID NOT NULL REFERENCES registrant_data (id),  -- immutable version
  registry_contact_id  TEXT,             -- the EPP contact id, if this registry takes contacts
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (domain_id WITH =, role WITH =, valid_during WITH &&)
);

-- What the registry should show, from the reasons on record, versus what it does show.
CREATE VIEW domain_status_drift AS
SELECT s.domain_id, s.status, s.origin, s.reason
FROM domain_statuses s
WHERE s.valid_during @> NOW() AND s.origin = 'client' AND s.set_by_transaction_id IN (
  SELECT id FROM epp_transactions WHERE outcome IN ('sent', 'unknown', 'failed'));
```

Notes on the sketch:

- **Log before sending.** An `epp_transactions` row with its `cl_trid` is written first, in `sent`; the response moves it to `succeeded`, `pending` or `failed`. A row left in `sent` or `unknown` after a timeout is the reconciliation queue: a later `<info>` resolves it and records a new transaction pointing at it through `reconciles_id`. The client transaction ID is unique, so a worker that crashes and restarts can't send the same command twice under two identities.
- **Never store secrets in the log.** Auth codes, passwords and full XML bodies with personal data stay out; a digest proves what was sent and a redacted summary says what mattered. The log is a record the RAA's retention clause covers, and it is read by support and Compliance.
- **Statuses are rows with an origin and a reason.** The registry's status set is one of the facts the registrar mirrors; the reason is the registrar's own. A `clientHold` for non-payment and one for abuse are separate rows from separate decisions; lifting one leaves the other, the same rule the core model uses for account holds. Registry-set statuses arrive from poll messages or `<info>` and carry the transaction that revealed them.
- **Locks and holds sit above statuses.** [Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks#how-to-build-it)'s `domain_locks` records why a name is locked; the statuses here are the effect. [DNS Abuse at the Registrar](/books/hosting-and-cloud/dns-abuse#how-to-build-it) points each registry-side mitigation at the transaction that applied it.
- **Contacts are assignments, not copies.** A change of registrant data is a new `registrant_data` version and a new `domain_contacts` range, so "who was the registrant on 3 March" is one query, which UDRP providers, courts and transfer disputes ask.
- **Host objects exist only for sponsored names.** External nameservers are just names in `domains.nameservers`; host objects exist for internal hosts with glue. The `linked` flag explains a failed delete before the customer asks.
- **Mirrors carry their sync time.** `registry_synced_at` tells support and reconciliation how stale the local copy is; the registry's `exDate` overwrites `domains.expires_at`, never the reverse.
- **Events:** `epp.command_failed`, `epp.outcome_unknown`, `epp.poll_message_received`, `domain.status_changed`, `domain.nameservers_changed`, `domain.registry_drift_found` and `registry.billing_failure` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to support, the abuse desk, transfers, finance and the reconciliation job.

## Auditing

- **Every command and its identifiers.** The client and server transaction IDs, the result code, the actor and the times, so any change at the registry can be traced to a person or job and a registry's own logs can be matched line for line.
- **Every unresolved outcome and how it was resolved.** Timeouts, the `<info>` that settled them, and the action taken, because a double registration or a phantom renewal is a billing and a compliance problem.
- **Why each status was set.** Origin, reason, the transaction and the decision behind it (a dunning step, an abuse case, a lock request, a dispute), so "why is my domain on hold" has an answer.
- **Drift findings.** Every difference reconciliation found between the registry and the registrar, what was overwritten or resent, and who reviewed it.
- **Registry credentials and certificates.** Who can log in to which registry, rotation dates and login security events, because a stolen registry credential can move or delete every name the registrar sponsors.

## What This Means for the System You Build

- **Treat the registry as authoritative** for sponsorship, expiry, statuses, nameservers and DNSSEC data, and mirror them with a sync time.
- **Log every EPP command before sending it,** with a unique client transaction ID, and resolve every timeout by asking the registry.
- **Branch on result codes,** not messages: billing failure, policy errors and status prohibitions each have their own path.
- **Keep statuses as rows with an origin and a reason,** so locks, holds and suspensions from different decisions don't overwrite each other.
- **Poll the message queue continuously;** it carries transfer deadlines and registry actions.
- **Run sessions as a pool per back end** with a policy profile for each registry's limits and extensions.
- **Reconcile on a schedule,** whether or not anything looks wrong.

## References

**Specifications**

- [RFC 5730: Extensible Provisioning Protocol (EPP)](https://www.rfc-editor.org/rfc/rfc5730), STD 69 (August 2009), greeting, login, query and transform commands, transaction identifiers, result codes and their meanings, "MUST NOT be assumed" on no response, the poll queue, extension mechanisms
- [RFC 5731: EPP Domain Name Mapping](https://www.rfc-editor.org/rfc/rfc5731), domain attributes, the seventeen status values and their combination rules, hostObj and hostAttr, periods of 1 to 99 units, curExpDate on renew
- [RFC 5732: EPP Host Mapping](https://www.rfc-editor.org/rfc/rfc5732), internal and external hosts, glue addresses, the linked status
- [RFC 5733: EPP Contact Mapping](https://www.rfc-editor.org/rfc/rfc5733), postalInfo int and loc, disclose, contact statuses and linked
- [RFC 5734: EPP Transport over TCP](https://www.rfc-editor.org/rfc/rfc5734), port 700, mutual TLS authentication, length-prefixed data units, one session per connection, pipelining
- [RFC 3915: Domain Registry Grace Period Mapping for EPP](https://www.rfc-editor.org/rfc/rfc3915), the grace-period statuses, restore request and report (September 2004)
- [RFC 3730: EPP](https://www.rfc-editor.org/info/rfc3730), the first EPP standard (March 2004), obsoleted by RFC 4930
- [RFC 2832: NSI Registry Registrar Protocol (RRP) Version 1.1.0](https://www.rfc-editor.org/rfc/rfc2832), the ten RRP commands, SSL on port 648, domains and nameservers only (May 2000)
- [RFC 8334: Launch Phase Mapping for EPP](https://www.rfc-editor.org/info/rfc8334), applications and registrations during launch phases (March 2018)
- [RFC 8590: Change Poll Extension for EPP](https://www.rfc-editor.org/info/rfc8590), notification of server-side changes with state and metadata (May 2019)
- [RFC 8748: Registry Fee Extension for EPP](https://www.rfc-editor.org/info/rfc8748), fees and credits for billable commands (2020)
- [RFC 8807: Login Security Extension for EPP](https://www.rfc-editor.org/info/rfc8807), longer passwords and security events at login (2020)
- [RFC 9022: Domain Name Registration Data (DNRD) Objects Mapping](https://www.rfc-editor.org/info/rfc9022), registry data escrow deposits (2021)

**Contracts and policies**

- [ICANN: EPP status codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en), what each status means and who sets it, the 30-day redemption period and the restore window
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), submission of data to the registry (3.2), record retention (3.4), data escrow (3.6)
- [SEC: Third Amendment to the .com Registry Agreement (27 March 2020)](https://www.sec.gov/Archives/edgar/data/1014473/000101447320000010/vrsn8-k32720xex101.htm), the EPP RFCs cited in Appendix 5A and the registry-registrar payment security

**Registries and platforms**

- [Nominet: Connections, sessions and poll commands](https://registrars.nominet.uk/dragon/epp/session/), session limits per accreditation, allow-listed IPs, 30-minute idle timeout, poll as keepalive, no per-session command limit
- [Nominet: EPP OT&E and testbed](https://registrars.nominet.uk/?p=6087), test access from registered IPs without live data
- [CZ.NIC: FRED registrar overview](https://fred.nic.cz/documentation/html/Overview/Registraroverview.html), per-registrar session limits, IP and certificate access controls, the credit system for EPP operations
- [SEC: GoDaddy Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), GoDaddy Registry as operator or back end for about 170 TLDs
- [OpenSRS: Become a domain reseller](https://opensrs.com/become-a-domain-reseller/), the reseller storefront, control panel and API
