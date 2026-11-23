+++
title = "Logistics Platform Architecture"
nav_title = "Platform Architecture"
description = "Bounded contexts across the volume, the event pipeline, tenants who are each other's counterparties, the partner integration layer and a reference build."
category = "Logistics & Supply Chain Industry"
order = 2866
part = "Running the Platform"
tags = ["logistics", "architecture", "events", "multi-tenancy", "integrations", "data-model"]
+++

Every earlier chapter of this volume ended with a How to Build It: a few tables, the queries that matter and the events they emit. This chapter puts them together as one system. A logistics platform is a dozen domains that each own a slice of a movement: the order that says what was wanted, the planner that turns it into shipments and loads, the rating engine that prices them, the tender that finds a carrier, dispatch that puts a driver on it, visibility that says where it is, the dock and the warehouse that receive it, customs that lets it cross, and the money that bills, audits and pays for it. None of them is the hard part. The seams are: one load seen by a shipper, a broker, a carrier and a factor, each in its own system or its own tenant; status arriving from four sources, late and out of order; a partner network of EDI, APIs, portals and PDFs that changes under you; and the rule that a shipper must never see what its broker paid the carrier.

The chapter covers how the platforms describe their own shape, the bounded contexts and which tables from this volume each owns, the event pipeline (facts reported in, decisions published out), multi-tenancy where shippers, brokers and carriers are tenants of one platform and counterparties of each other, the partner integration layer, and a reference build. The general engineering is the playbook's ([Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Integrations](/docs/building-blocks/integrations), [Webhooks](/docs/api-design/webhooks)). The Commerce volume's [Commerce Architecture](/books/commerce/commerce-architecture) is the same exercise for a store, and its order pipeline is upstream of this one. This chapter builds on every table in [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) and the playbook's `outbox_events`, and adds `tenants`, `network_identities`, `tenant_links`, `movement_links` and `cross_tenant_deliveries`.

## How the Platforms Do It

As of November 2026, from filings and vendor pages (each company's description of itself is its own claim):

| Platform | What it is | Shape, as described | Network, as claimed |
| --- | --- | --- | --- |
| **C.H. Robinson** (Navisphere) | A broker's and forwarder's own platform | "our global, multimodal transportation management system," proprietary; "Navisphere is also integrated into 44 third-party transportation management systems"; "more than 30 AI agents" integrated with it | "connects 75,000 customers and 450,000 contract carriers" |
| **CargoWise** (WiseTech Global) | Forwarding, customs and warehouse software | "single global database"; "All modes. All borders. One platform."; forwarding, customs and warehouse as modules of one system | "over 17,000 organizations," 193 countries |
| **Descartes Systems Group** | Logistics, customs and trade software on a shared network | The Global Logistics Network is "our technology foundation" and "manages the real-time flow of commercial, logistics, customs and product information"; "a shared-services environment"; sold "on subscription, transactional or perpetual license basis" | "spans more than 160 countries and connects hundreds of thousands of organizations" |
| **Manhattan Associates** (Manhattan Active) | Warehouse, transportation and order management suites | "built on a shared, cloud-native, microservices platform"; "versionless," with new capability "on a quarterly basis" and "all customers are running on a single fully up-to-date codebase"; the server side "runs exclusively on Google Cloud Platform" | Not stated as a network |
| **project44** (Movement) | Visibility, TMS and yard products on one data platform | "the Decision Intelligence Platform"; agents running on "the world's largest, most accurate and real-time logistics data graph" | "285K carriers connected globally," over 1 million facilities, "over 700 million logistics events daily" (its home page shows two different carrier counts) |
| **SPS Commerce** | Retail EDI network | "Our cloud-service model treats all customers as logically separate tenants within a shared virtual infrastructure"; cloud products "allow multiple customers to share information maps with a retailer" | Customers "connect once and immediately transact with thousands of trading partners" |

Four patterns run through the table:

- **The network is the product.** Every company above sells connections as much as software: Navisphere's carriers and the 44 TMSs it plugs into, Descartes' network, SPS's trading partners, project44's carriers. A logistics platform's value grows with the partners already mapped, which is why the integration layer is a first-class context, not a plugin.
- **One codebase, many tenants.** Manhattan's single versionless codebase, SPS's "logically separate tenants within a shared virtual infrastructure" and CargoWise's single database are the same choice: every customer on the same version, separated by data, not by deployment.
- **Partner maps are shared, tenant data is not.** SPS's shared information maps are the key move: a retailer's or carrier's specification is the same for every customer that trades with it, so the platform maintains it once, and each tenant's documents run through it.
- **Suites absorb neighbors.** Forwarding, customs and warehouse on one database (CargoWise), TMS plus visibility plus yard (project44), WMS plus TMS plus order management (Manhattan). Contexts that used to be separate products end up as modules, and the boundaries between them are what keeps the suite maintainable.

## Bounded Contexts

A context owns its data, its vocabulary and its invariants; other parts reach it only through its interface and its events ([Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)). The contexts this volume's tables fall into, with the chapters that define them (chapters not yet published are named by title):

| Context | Owns (tables from this volume) | Invariant it guards | Chapter |
| --- | --- | --- | --- |
| **Parties and network** | `parties`, `party_roles`, `carriers`, `network_identities`, `carrier_authorities`, `insurance_filings`, carrier onboarding cases | One organization, many roles; a carrier is tendered only while qualified | [The Logistics Business](/books/logistics/logistics-business#the-core-data-model), [Operating Authority & Registration](/books/logistics/operating-authority#how-to-build-it), Carrier Onboarding & Vetting |
| **Orders and planning** | `orders`, `order_lines`, `shipments`, `shipment_lines`, `handling_units`, `loads`, `load_shipments`, `stops`, `stop_shipments`, `load_plan_runs` | Order, shipment and load stay three records; a shipment line never exceeds its order line | [Transportation Management Systems](/books/logistics/transportation-management#how-to-build-it), [Load Planning & Optimization](/books/logistics/load-planning#how-to-build-it) |
| **Rating and procurement** | `rate_agreements`, `lane_rates`, `accessorial_rates`, `fuel_surcharge_schedules`, `freight_bids`, `routing_guides` | A charge is priced from the agreement in force on the pickup date | [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#how-to-build-it), [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides#how-to-build-it) |
| **Tendering and coverage** | `tenders`, `tender_events`, `tender_waterfalls`, load postings and offers | One accepted tender per load at a time | [Tendering & Acceptance](/books/logistics/tendering#how-to-build-it), Load Boards & Digital Freight Matching |
| **Execution and dispatch** | `drivers`, `equipment_units`, `dispatch_legs`, `driver_settlements`, `hos_duty_periods`, `eld_events` | A driver is dispatched only with hours available; a settlement is the sum of its lines | [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations#how-to-build-it), [Hours of Service](/books/logistics/hours-of-service#how-to-build-it), [ELDs & Telematics](/books/logistics/electronic-logging-devices#how-to-build-it) |
| **Visibility** | `shipment_events`, tracking sessions, geofences, stop ETAs, shipment exceptions | Events are append-only with occurred and received times; a stop's actual times come from the event that proved them | Visibility & Tracking, ETAs & Exception Management |
| **Facilities, yards and warehouses** | `facilities`, warehouse locations, LPNs and balances, receipts, dock appointments, yard visits | Inventory moves only by movement; one trailer is in one place | Warehouse Management Systems, Yard Management & Dock Scheduling |
| **Freight money** | `freight_charges`, `freight_invoices`, `freight_invoice_lines`, audit runs, carrier payments, assignment notices | Totals are sums over lines; a billed line never changes; the payee follows the notice of assignment | Freight Invoicing & Settlement, Freight Audit & Payment, Paying Carriers, Quick Pay & Factoring |
| **Safety and compliance** | `cargo_claims`, `hazmat_shipment_papers`, `roadside_inspections`, `driver_qualification_items` | Regulated records are complete before the movement they govern | [Cargo Liability & Claims](/books/logistics/cargo-claims#how-to-build-it), [Hazardous Materials in Transport](/books/logistics/hazmat-in-transport#how-to-build-it), [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa#how-to-build-it) |
| **Customs and trade** | `customs_entries`, `customs_entry_lines`, `customs_bonds`, `export_filings`, `restricted_party_screenings` | An entry is filed under a valid bond and power of attorney; a screened party is screened again when lists change | [Import Entry & ACE](/books/logistics/import-entry#how-to-build-it), [Export Compliance & Screening](/books/logistics/export-compliance#how-to-build-it) |
| **Manufacturing** | `lots`, work orders, BOMs, production confirmations, equipment state events | A finished lot records the input lots it consumed | ERP, MES & ISA-95, MRP, Scheduling & Work Orders |
| **Integration** | `documents`, EDI interchanges and partner maps, partner code maps, partner connections, inbound webhook deliveries, `tenant_links`, `movement_links` | Every message is kept as exchanged and applied once | Transportation EDI, Logistics APIs & Standards |

Three boundaries are the ones teams get wrong:

- **Rating is not tendering.** A rate is what a lane costs under an agreement; a tender is an offer to one carrier, with an expiry, at an amount that may differ from the rate (a spot premium, a negotiated bump). Storing the tender's amount on the lane rate, or recomputing the tender from today's rates, loses what was actually offered.
- **Visibility is not the load.** The visibility context owns what partners reported; the load owns what the system decided. A 214 that says delivered sets the stop's `arrived_at` through a decision (the event the system trusts), never by the parser writing to `stops` directly, because a second source may contradict it an hour later ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model): events are append-only and deduplicated).
- **Freight money is not execution.** Dispatch knows a stop took five hours; billing knows whether detention is owed, at what rate, to whom, and whether the proof exists. A detention charge is created by the money context from the stop's times and the agreement, not typed into the load by the dispatcher.

My default is one database and one deployable with these contexts as modules: each module owns its tables, no module writes another's, and cross-module reads go through an interface or an event. The transactions that must be atomic (a tender acceptance and the load's carrier, a delivery and the accrual it triggers, a state change and its outbox row) stay inside one database ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)). The first contexts worth splitting out are the ones with a different scaling profile: visibility ingestion, which takes positions every few minutes from every truck whether or not anything is decided, and the integration layer, whose load follows partners' batch windows rather than users ([When to Split](/docs/architecture/service-boundaries#when-to-split)).

## The Event Pipeline

Two streams cross the platform, and they are different things:

- **Facts reported in.** A carrier's 214, an ocean carrier's DCSA event, an ELD position, a geofence crossing, a terminal's gate-out, a driver app's photo. They arrive at least once, out of order, late (a 14:05 arrival reported at 17:20) and sometimes wrong. They land as `shipment_events` rows with `occurred_at`, `received_at`, `source` and `dedupe_key`, and the raw message stays in `documents` or the integration tables. Nothing about them is a decision yet.
- **Decisions published out.** `tender.accepted`, `stop.arrived`, `shipment.delivered`, `freight_charge.accrued`, `freight_invoice.approved`: what this system concluded, written in the same transaction as the state change into `outbox_events` and relayed to the broker ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

The path from one to the other is a short pipeline, the same for every source:

1. **Receive and keep.** Store the message as received, with its hash, before parsing it; acknowledge the transport (an AS2 receipt, an HTTP 2xx) only after it's stored.
2. **Parse and map.** Turn it into normalized events with the partner's codes mapped to the volume's (`AT7` to `delivered`, a DCSA `DISC` to `discharged`), keeping `source_code` as received. An unmapped code is a mapping task, not a dropped event.
3. **Match.** Find the shipment, load, stop or equipment by identifiers plus dates (the carrier's PRO, the 204's shipment ID, the container number within its trip), never by the partner's key alone ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)). Unmatched events wait in a queue with a retry, because the 214 often beats the tender acceptance it refers to.
4. **Decide.** The visibility context applies its trust rules (which source wins for an arrival, whether a position contradicts a reported delivery) and, when a stop's state changes, writes the stop and the outbox event in one transaction.
5. **Fan out.** Billing listens for `shipment.delivered` and a POD to release the invoice; accounting for accruals; notifications for exceptions; metrics for everything. Each consumer is idempotent by event ID ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).

Ordering is per movement: partition the broker by load ID (or shipment ID where no load exists yet), so one load's events are consumed in order while thousands of loads proceed in parallel, and carry the load's version on each event so a consumer can drop a stale one after a replay ([Ordering](/docs/architecture/events#ordering)). Never partition by carrier or customer: a large carrier's burst of 214s at midnight then blocks every other load it hauls.

Replays are routine. A carrier resends a day of 214s; an ELD vendor backfills positions after an outage; a mapping fix means last week's unmapped codes can now be applied. The pipeline handles all three the same way: `dedupe_key` drops exact repeats, the decide step is a function of the events known so far (so re-running it is safe), and a decision that changes (a delivery time corrected by a later, more trusted source) publishes a new event with a higher version rather than editing the old one.

## Multi-Tenancy When Everyone Is a Counterparty

Three shapes of system appear in this volume, and only two need tenants:

- **One company's own system.** A shipper's TMS, a carrier's dispatch system, a broker's platform built in-house. `owner_party_id` already says whose record each row is; no tenant is needed above it.
- **SaaS for many companies of one kind.** A TMS or WMS vendor serving hundreds of shippers or warehouses. Each customer is a tenant with `tenant_id` on every row it owns, row-level security enforcing it ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)), and its own parties, facilities and agreements. Two shippers that both use the same carrier each have their own party row for it, as the core model's tenancy note says.
- **A network platform.** A vendor whose tenants trade with each other on the platform: a shipper tenders to a broker, the broker covers with a carrier, the carrier's driver app reports the status, and all three are customers. Descartes' network, SPS's trading partners and Navisphere's 44 integrated TMSs are the public examples of the pattern. This is where logistics departs from ordinary SaaS.

On a network platform the same truck is one load to the shipper, one to the broker and one to the carrier, and the three records must stay separate even though they're in one database:

- **Each tenant keeps its own copy.** The shipper's load, the broker's load and the carrier's order are three rows in three tenants, linked by a `movement_links` row created when the tender is accepted. A shared row would be readable by all three, and the sell rate, the buy rate and the carrier's driver pay are each confidential to someone.
- **What crosses is an event, projected.** When the carrier's stop arrives, the platform delivers a projected copy of `stop.arrived` into the broker's tenant (and the broker's own decision then flows to the shipper). The projection drops fields the receiver may not see: no buy rate to the shipper, no sell rate to the carrier, no driver identity to anyone who isn't the carrier unless the carrier shared it. A shipper tracking its freight sees positions only while the load is in transit under an authority the carrier gave (Logistics APIs & Standards covers authority documents).
- **Links are agreements.** `tenant_links` records that two tenants agreed to exchange: which topics, which fields, from when, under which document. A broker that stops working with a carrier ends the link, and nothing more crosses. Without the row, the platform knowing both companies is not permission to connect them.
- **Identity is shared, data is not.** A carrier is the same legal entity to every tenant: one USDOT number, one SCAC. `network_identities` holds the platform's verified identity (the identifier, the registry check, when), and each tenant's party row may point at it. Verification done once benefits every tenant, and fraud signals about an identity (a changed bank account, a hijacked authority) can be raised to every tenant that points at it without disclosing who else trades with whom (Freight Fraud & Cargo Theft covers those signals).
- **The broker's record has its own reviewers.** Under 49 CFR 371.3 "each party to a brokered transaction has the right to review the record of the transaction," which includes the broker's compensation. That is a regulated disclosure between counterparties, produced on request from the broker's tenant, not a reason to share its tables ([The Logistics Business](/books/logistics/logistics-business#auditing) lists what the record holds).
- **Noisy neighbors are partners.** A large shipper's Monday tender wave, an ocean carrier's daily event dump and a carrier's resent day of 214s all land on shared ingestion. Queues and rate limits are partitioned by tenant and by partner connection ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)), and a partner's backlog delays only the tenants trading with it.

Inside one tenant, the hierarchy is the [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) pattern: a 3PL tenant has clients, each with its own facilities, agreements and billing; a carrier tenant has terminals and fleets; a manufacturer has plants. Rules (fuel schedules, accessorial rates, routing guides) inherit down, and reports roll up from the same rows.

## The Partner Integration Layer

Every context talks to partners, and none of them should talk to partners directly. The integration layer is one context with five channels:

| Channel | Examples in this volume | Inbound shape | Outbound shape | What fails |
| --- | --- | --- | --- | --- |
| **EDI** | 204, 990, 214, 210 with carriers; 856 and 810 with retailers; 315 with ocean carriers; 830 and 862 with suppliers | Interchanges over a VAN, AS2 or SFTP, acknowledged by 997 or 999 | Rendered per partner map and version | A partner's map changes with a memo; control numbers collide; acknowledgements stop |
| **APIs** | Carrier rating and booking APIs, DCSA booking and track and trace, ONE Record, ELD vendor APIs, visibility networks | Polled feeds with cursors, or responses to calls | Calls with credentials per connection, inside the provider's rate limit | Tokens expire, versions are retired, limits change |
| **Webhooks** | Visibility network events, ELD position pushes, marketplace notifications | Signed deliveries, verified and stored before processing | Signed deliveries to partners subscribed to this platform's events | Signatures rotate, deliveries arrive out of order or twice |
| **Portals** | Carrier portals for tenders and invoices, dock scheduling portals, terminal appointment systems | A person's action, recorded with who did it | A screen the partner uses | Nobody checks it; the deadline passes |
| **Documents and email** | Rate confirmations, BOLs, PODs, lumper receipts, commercial invoices as PDFs or photos | Files kept as received, then extracted ([AI in Logistics](/books/logistics/ai-in-logistics)) | Generated documents | Extraction errors, missing pages, the wrong load |

The rules for the layer:

- **One partner, many channels.** A carrier may tender over EDI, track through an ELD API, invoice by email and be paid through a factor's portal. The partner is one party; each channel is a connection with its own credentials, map, status and health ([A Connection Is a Record](/docs/building-blocks/integrations#a-connection-is-a-record)).
- **Maps belong to the partner, not the tenant.** A carrier's 214 specification is the same for every shipper and broker that trades with it. On a network platform, the map is maintained once at the platform level and used by every tenant's connection to that carrier, which is SPS's shared information maps in its own words. Tenant-specific overrides are exceptions on top of it.
- **Raw first, then parsed.** The interchange, the webhook body and the PDF are kept as exchanged with a hash; parsed rows reference them. A dispute, a replay or a mapping fix all start from the raw message.
- **Outbound is a consumer of the outbox.** A tender becomes a 204 because the EDI renderer consumes `load.tendered` for a carrier whose channel is EDI, not because the tendering code knows about X12. Changing a carrier from EDI to API changes its connection, not the tendering context.
- **Standards where they exist.** X12 for North American transportation and retail, DCSA for ocean carriers' booking, bill of lading and track and trace, IATA ONE Record for air: adopting the standard's names and codes inside the platform makes each new partner on the standard cheaper than the last.
- **Health is visible.** Every connection shows its last success, last error, backlog and acknowledgement lag, and a stalled feed alerts before the customer notices missing statuses ([Connection Health and Reconnect](/docs/building-blocks/integrations#connection-health-and-reconnect)).

## A Reference Architecture

Built yourself, for one company or as a platform, the system this volume describes is a short list of parts. Each is the owning chapter's tables behind a module interface:

- **A transactional core.** One relational database holding the contexts as modules: parties, orders and planning, rating, tendering, execution, freight money, compliance and customs. The tender acceptance, the load's carrier, the estimated payables and the outbox row commit together.
- **An ingestion tier.** Receivers for EDI, webhooks, polled APIs and documents, writing raw messages and normalized `shipment_events` at whatever rate partners send. It scales with trucks and partners, not users, and it is the first thing to split out.
- **An outbox, a relay and a broker.** Every module's decisions go out through `outbox_events`, partitioned by load or shipment, to internal consumers, outbound renderers and cross-tenant delivery.
- **Workers.** Waterfalls and tender expiry, ETA recomputation, accrual runs, audit runs, invoice release on POD, settlement, screening reruns, metric computation and retention purges ([Background Jobs](/docs/architecture/background-jobs)).
- **Optimizers as services.** Load planning, routing and network design are compute-heavy, run in batches, and call solvers; they read a snapshot and return a plan the core accepts or rejects ([Load Planning & Optimization](/books/logistics/load-planning)).
- **A document store.** Object storage for every BOL, POD, rate confirmation, EDI interchange and photo, keyed from `documents`, with retention by kind ([Data Retention](/docs/building-blocks/data-retention)).
- **An analytics copy.** Change data capture into a warehouse where metrics are computed from versioned definitions, never queries against the core at month end ([Logistics Metrics](/books/logistics/logistics-metrics), [Change Data Capture](/docs/data/data-pipelines#change-data-capture)).

What I buy rather than build, even when building the rest: the EDI translation and VAN or AS2 connectivity (the maps and the partner network are someone's full-time job), carrier identity and insurance monitoring, mileage and routing engines, visibility network access for carriers without APIs, and customs filing connectivity to ACE through a certified provider. Each is a connected system with a contract and a connection row, not a module.

## How to Build It

The deltas add the platform tenant, the verified network identity, the agreements between tenants and the links between their copies of one movement, and the delivery of projected events across them. A single-company system needs none of this and stops at the core model and the outbox.

```sql
CREATE TABLE tenants (                   -- a customer of the platform
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  name           TEXT NOT NULL,
  party_id       UUID NOT NULL REFERENCES parties (id),  -- the tenant's own party row, in its tenant
  kind           TEXT NOT NULL CHECK (kind IN ('shipper', 'broker', 'carrier', 'forwarder',
                   'third_party_logistics', 'warehouse_operator', 'customs_broker',
                   'manufacturer')),  -- primary business; roles stay on party_roles
  region         TEXT NOT NULL,          -- the data region it is pinned to
  status         TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended', 'closed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE network_identities (        -- one legal entity as the platform verified it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  scheme           TEXT NOT NULL CHECK (scheme IN ('usdot', 'scac', 'fmc_org', 'iata_cass',
                     'gln', 'lei', 'ein', 'cbp_importer', 'eori', 'other')),
  identifier       TEXT NOT NULL,
  legal_name       TEXT NOT NULL,        -- as the registry shows it
  verified_at      TIMESTAMPTZ NOT NULL,
  verified_source  TEXT NOT NULL,        -- 'fmcsa_registry', 'nmfta', 'gs1', ...
  flags            TEXT[] NOT NULL DEFAULT '{}',  -- 'authority_revoked', 'payment_change_review'
  UNIQUE (scheme, identifier)
);

CREATE TABLE tenant_links (              -- two tenants agreed to exchange
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  from_tenant_id    UUID NOT NULL REFERENCES tenants (id),  -- the publisher
  to_tenant_id      UUID NOT NULL REFERENCES tenants (id),  -- the receiver
  relationship      TEXT NOT NULL CHECK (relationship IN ('shipper_to_carrier',
                      'shipper_to_broker', 'broker_to_carrier', 'carrier_to_factor',
                      'client_to_3pl', 'importer_to_customs_broker', 'other')),
  topics            TEXT[] NOT NULL,     -- 'stop.arrived', 'shipment.delivered', 'document.pod'
  field_policy      JSONB NOT NULL,      -- per topic: fields allowed, never a deny list
  authority_document_id UUID REFERENCES documents (id),  -- the agreement or letter of authority
  valid_during      TSTZRANGE NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('proposed', 'active', 'paused', 'ended')),
  CHECK (from_tenant_id <> to_tenant_id),
  EXCLUDE USING gist (from_tenant_id WITH =, to_tenant_id WITH =, relationship WITH =,
                      valid_during WITH &&)  -- btree_gist; one live link per relationship
);

CREATE TABLE movement_links (            -- one movement, as two tenants each hold it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_link_id   UUID NOT NULL REFERENCES tenant_links (id),
  from_kind        TEXT NOT NULL CHECK (from_kind IN ('load', 'shipment')),
  from_id          UUID NOT NULL,        -- the publisher's load or shipment
  to_kind          TEXT NOT NULL CHECK (to_kind IN ('load', 'shipment', 'carrier_order')),
  to_id            UUID NOT NULL,        -- the receiver's own row
  established_by   TEXT NOT NULL CHECK (established_by IN ('tender_acceptance', 'edi_204',
                     'api_booking', 'manual_match')),
  tender_id        UUID REFERENCES tenders (id),  -- the publisher's tender that created it
  established_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,          -- a cancelled or reassigned load stops sharing
  UNIQUE (tenant_link_id, from_kind, from_id, to_id)
);

CREATE TABLE cross_tenant_deliveries (   -- one projected event into another tenant
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  outbox_event_id  UUID NOT NULL,        -- the publisher's event
  movement_link_id UUID NOT NULL REFERENCES movement_links (id),
  to_tenant_id     UUID NOT NULL REFERENCES tenants (id),
  topic            TEXT NOT NULL,
  projected        JSONB NOT NULL,       -- exactly what the receiver was given
  policy_version   INT NOT NULL,         -- the field policy that produced it
  delivered_at     TIMESTAMPTZ,
  UNIQUE (outbox_event_id, movement_link_id)
);
```

Every owner-scoped table in the volume takes a `tenant_id`, added to a live database in the order [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) sets out: the nullable column, a backfill from `owner_party_id`, a `NOT VALID` check, validation, then the policy. For `loads`; the same five steps run for `parties`, `facilities`, `items`, `orders`, `shipments`, `rate_agreements`, `tenders`, `freight_charges`, `freight_invoices`, `shipment_events`, `documents` and each chapter's tables:

```sql fragment
ALTER TABLE loads ADD COLUMN tenant_id UUID;
-- backfill in batches: tenant_id from the tenant whose party owns the load
ALTER TABLE loads ADD CONSTRAINT loads_tenant_id_not_null
  CHECK (tenant_id IS NOT NULL) NOT VALID;
ALTER TABLE loads ADD CONSTRAINT loads_tenant_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants (id) NOT VALID;
CREATE INDEX CONCURRENTLY loads_tenant_number_idx ON loads (tenant_id, number);
ALTER TABLE loads VALIDATE CONSTRAINT loads_tenant_id_not_null;
ALTER TABLE loads VALIDATE CONSTRAINT loads_tenant_fkey;

ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loads
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

ALTER TABLE parties ADD COLUMN network_identity_id UUID;
ALTER TABLE parties ADD CONSTRAINT parties_network_identity_fkey
  FOREIGN KEY (network_identity_id) REFERENCES network_identities (id) NOT VALID;
ALTER TABLE parties VALIDATE CONSTRAINT parties_network_identity_fkey;

ALTER TABLE outbox_events
  ADD COLUMN tenant_id     UUID,         -- whose decision it is
  ADD COLUMN partition_key TEXT,         -- the load or shipment ID
  ADD COLUMN subject_version BIGINT;     -- lets consumers drop stale events
```

`network_identities`, `tenant_links`, `movement_links` and `cross_tenant_deliveries` are platform tables, outside row-level security, and only the cross-tenant delivery worker and platform tooling read them ([Tenant Context](/docs/architecture/multi-tenancy#tenant-context): cross-tenant operations are separate code paths with their own audit trail).

The cross-tenant worker consumes each outbox event, finds active links for its subject, and projects it under the link's field policy. Allowed fields only: a field the policy doesn't name never crosses, so adding `buy_rate` to an event later can't leak it.

```go tab="Go"
type FieldPolicy map[string][]string // topic -> allowed top-level fields

type Projection struct {
	ToTenantID string
	ToID       string // the receiver's own load or shipment
	Payload    map[string]any
}

// Project returns what one linked tenant may see of an event, or ok=false when
// the link doesn't carry this topic or has ended.
func Project(ev OutboxEvent, link TenantLink, ml MovementLink, now time.Time) (Projection, bool) {
	if link.Status != "active" || !link.ValidDuring.Contains(now) || ml.EndedAt != nil {
		return Projection{}, false
	}
	allowed, ok := link.Policy[ev.Type]
	if !ok || !slices.Contains(link.Topics, ev.Type) {
		return Projection{}, false
	}
	out := make(map[string]any, len(allowed)+2)
	for _, f := range allowed {
		if v, present := ev.Payload[f]; present {
			out[f] = v
		}
	}
	// Identifiers are rewritten to the receiver's records; the publisher's IDs never cross.
	out["subject_id"] = ml.ToID
	out["subject_version"] = ev.SubjectVersion
	return Projection{ToTenantID: link.ToTenantID, ToID: ml.ToID, Payload: out}, true
}
```

```rust tab="Rust"
pub fn project(
    ev: &OutboxEvent,
    link: &TenantLink,
    ml: &MovementLink,
    now: DateTime<Utc>,
) -> Option<Projection> {
    if link.status != LinkStatus::Active || !link.valid_during.contains(now) || ml.ended_at.is_some() {
        return None;
    }
    if !link.topics.iter().any(|t| t == &ev.event_type) {
        return None;
    }
    let allowed = link.policy.get(&ev.event_type)?;
    let mut out = serde_json::Map::new();
    for f in allowed {
        if let Some(v) = ev.payload.get(f) {
            out.insert(f.clone(), v.clone());
        }
    }
    // Identifiers are rewritten to the receiver's records; the publisher's IDs never cross.
    out.insert("subject_id".into(), json!(ml.to_id));
    out.insert("subject_version".into(), json!(ev.subject_version));
    Some(Projection { to_tenant_id: link.to_tenant_id, to_id: ml.to_id, payload: out })
}
```

What one broker load shared with its shipper, and what wasn't, reads from the deliveries:

```sql
SELECT d.topic, d.projected, d.policy_version, d.delivered_at
FROM movement_links m
JOIN cross_tenant_deliveries d ON d.movement_link_id = m.id
WHERE m.from_kind = 'load' AND m.from_id = $1
ORDER BY d.delivered_at;
```

Design notes:

- **Copies, not shared rows.** Each tenant's load is its own; `movement_links` connects them. A receiver applies a projected `stop.arrived` to its own stop through its own decide step, so its records stay consistent with its own trust rules and its own audit trail.
- **Allow lists, versioned.** `field_policy` names what may cross per topic; a change is a new policy version, and every delivery records the version that produced it, so "what did we show the shipper on March 3" has an answer.
- **The publisher's IDs never cross.** Projections carry the receiver's subject ID; the publisher's load ID, its carrier's party ID and its internal codes stay home. A receiver that holds another tenant's IDs can probe for them.
- **Identity checks run once.** A carrier's authority, insurance and identity are checked against `network_identities`, and a flag on the identity (authority revoked, bank change under review) raises an event to every tenant whose party points at it, carrying nothing about the other tenants.
- **Partition by movement, not by partner.** `partition_key` is the load or shipment, so a partner's burst slows its own loads at worst.
- **Everything still works single-tenant.** With one tenant and no links, the tables are empty and the core model behaves as in every earlier chapter.

## Auditing

- **Who could see what.** Every tenant link with its topics, field policy versions, validity and authority document, and every cross-tenant delivery with exactly what was projected, so a dispute over what a shipper was told, or a claim that a broker leaked a buy rate, is answered from rows.
- **What was decided from what.** Every stop time, delivery and accrual traces to the events and messages it was decided from, with their sources and received times ([Audit Trails](/docs/building-blocks/audit-trails#automated-and-ai-decisions) covers recording automated decisions).
- **Messages as exchanged.** Raw interchanges, webhook bodies and documents, hashed, retained by kind.
- **Platform access.** Every cross-tenant operation by platform staff or tooling, with the reason, outside tenant code paths ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Draw the contexts first,** and keep rating, tendering, visibility and freight money apart even inside one database.
- **Separate facts reported in from decisions published out,** and let only the decide step turn the first into the second.
- **Partition events by movement,** carry a version, and make every consumer idempotent and replay-safe.
- **On a network platform, give each tenant its own copy** of the movement, link the copies, and move projected events across allow-listed fields only.
- **Share identity, not data:** verify a carrier once for the platform and let each tenant point at it.
- **Make the integration layer one context** with connections per partner and channel, shared partner maps, raw messages kept first, and outbound rendering as a consumer of the outbox.
- **Buy the network plumbing** (EDI connectivity, identity monitoring, mileage, ACE connectivity) and build the contexts that are your business.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), Navisphere as its multimodal TMS, integration into 44 third-party TMSs, AI agents, and customer and carrier counts
- [Descartes Systems Group: Annual information form, Form 40-F exhibit 99.1 (fiscal 2026)](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), the Global Logistics Network as its technology foundation, its reach, the shared-services environment and pricing models
- [Manhattan Associates: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1056696/000119312526037138/manh-20251231.htm), the cloud-native microservices platform, versionless updates, a single codebase and Google Cloud hosting
- [SPS Commerce: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1092699/000109269926000012/spsc-20251231.htm), logically separate tenants on shared infrastructure, shared information maps, and connect once to trading partners

**Regulations**

- [49 CFR 371.3: Records to be kept by brokers](https://www.law.cornell.edu/cfr/text/49/371.3), each party's right to review the record of a brokered transaction

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the transportation and retail sets the integration layer exchanges
- [DCSA: Standards](https://dcsa.org/standards), booking, bill of lading and track and trace standards for ocean carriers

**Vendors**

- [CargoWise](https://www.cargowise.com/), a single global database across forwarding, customs and warehouse, and its organization and country counts
- [project44](https://www.project44.com/), the Movement platform, its data graph and agents, and its carrier, facility and event counts
