+++
title = "Transportation Management Systems"
nav_title = "TMS"
description = "What a TMS does for a shipper, a broker and a carrier, the order-to-invoice pipeline every one of them runs, the vendors, and the records that hold it."
category = "Logistics & Supply Chain Industry"
order = 2828
part = "Planning and Execution"
tags = ["logistics", "tms", "transportation-management", "planning", "execution", "data-model"]
+++

A transportation management system (TMS) is the software that turns demand to move goods into executed, paid freight: it takes orders, groups them into shipments and loads, prices them, offers them to carriers, follows them to delivery, and checks and pays (or sends) the bill. The same three letters name three different products. A **shipper's TMS** plans its own freight and buys capacity from carriers. A **broker's TMS** sells capacity to shippers and buys it from carriers, so every load has two prices and a margin. A **carrier's TMS** sells capacity from its own trucks and drivers, so its center is dispatch, equipment and settlements rather than carrier selection. A 3PL running managed transportation operates a shipper-style TMS on a client's behalf, often on the client's license.

It is hard because the pipeline crosses companies at every step and each crossing has its own format, clock and failure mode. An order comes from an ERP; a carrier answers a tender by EDI, API, portal or phone; status comes back from an ELD feed, a visibility platform or a driver's app; the invoice arrives as an X12 210 or a PDF; payment leaves through a bank or a freight payment provider. Each step can be reversed or redone by someone outside the system: an order changes after a load is built, a carrier accepts and then drops a load, a receiver refuses a pallet, an invoice bills a stop the plan didn't have. A TMS is mostly the state of each record and the rules for what may happen to it next.

This chapter covers the three kinds of TMS and how they differ, the order-to-invoice pipeline step by step, the vendors, and the records that hold the pipeline's state. It extends `orders`, `shipments` and `loads` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Each step has its own chapter: [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials), [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides), [Tendering & Acceptance](/books/logistics/tendering), [Load Planning & Optimization](/books/logistics/load-planning) and [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations); messages are Transportation EDI and Logistics APIs & Standards; tracking is Visibility & Tracking; invoices and payment are Freight Invoicing & Settlement and Freight Audit & Payment.

## How the Platforms Do It

As of November 2026, from vendor product pages and filings (each vendor's claims are its own):

| Vendor | Product | Built for | What it says it does |
| --- | --- | --- | --- |
| **Alvys** | Alvys TMS | Carriers, brokers and hybrids | "Sourcing & Dispatching," "Driver management and settlement," "Carrier and Driver Settlement," "Accounting & Payments," "130+ different integrations" with native EDI and an open API; "3,000+ trucking companies," by its own count |
| **Blue Yonder** | Transportation Management | Shippers and logistics providers | "Optimization and Planning," "intelligent optimization and load planning," "Transportation Procurement" with bid management "across every mode" |
| **Descartes Systems Group** | Several TMS lines, including 3GTMS | Shippers, brokers and 3PLs | Acquired 3GTMS, "a leading provider of transportation management solutions," on March 24, 2025 for about $112.7 million net of cash |
| **e2open** (WiseTech Global) | Transportation management within e2open's network | Shippers and logistics providers | Taken private by WiseTech on August 3, 2025 at US$3.30 a share, an enterprise value of US$2.1 billion |
| **Infios** (formerly Körber Supply Chain Software) | Infios Transportation Management | Supply chain execution customers, "5,000+ customers in 70+ countries" by its own count | Transportation management that handles carrier selection, rerouting and appointment updates within a customer's business rules; Körber's joint venture with KKR completed its acquisition of MercuryGate, "a provider of transportation management systems (TMS)," announced October 1, 2024; "Körber Supply Chain Software is now Infios" |
| **Manhattan Associates** | Manhattan Active Transportation Management | Shippers, often alongside its WMS | "Optimize loads, routes, modes, carriers, and constraints together"; "Tender freight to carriers, manage acceptance, and coordinate dock appointments"; "Audit transportation charges against contracted rates"; private fleet and common carriers "in the same optimization run" with its Dispatch product |
| **Rose Rocket** | Rose Rocket TMS | Transportation operations teams (dispatch, operations, finance); its review ratings come from carriers and brokers | "Quote Management," "Dispatch Workflows," "Freight Audit & Pay"; "$3B+ Processed in 2025" |
| **SAP** | SAP S/4HANA Transportation Management | Shippers and logistics providers | Carrier selection by priority, lowest cost, business shares and allocations; four tendering types, peer-to-peer (response required or not) and broadcast (best offer or first acceptable offer); strategic freight procurement around a "freight agreement master RFQ" |
| **Trimble** | TMW.Suite, TruckMate, Trimble TMS for Carriers and for Shippers | Truckload carriers, brokers and private fleets (TMW.Suite); LTL and intermodal carriers (TruckMate) | TMW.Suite is "our enterprise level TMS solution"; TruckMate a "dispatch, operations and accounting system" from "order entry to settlement" |
| **Uber Freight** (Uber Technologies segment) | Brokerage and managed transportation | Shippers and carriers | "Powers a managed transportation and logistics network and connects Shippers and Carriers in a digital marketplace"; carriers get "transportation management and other logistics services"; $5,099 million of 2025 revenue |

Oracle Transportation Management, Blue Yonder, e2open, Manhattan and SAP are the large shipper-side suites (Oracle's online help is rendered by script and couldn't be read, so it is named without its own description, as in [Tendering & Acceptance](/books/logistics/tendering#how-the-platforms-do-it)); McLeod, Trimble, Alvys and Rose Rocket serve carriers and brokers. McLeod Software's site refused automated fetches, so its products (LoadMaster for carriers, PowerBroker for brokers, by industry usage) are named here without its own description. <!-- source-gap: logistics-tms-mcleod | missing | McLeod LoadMaster and PowerBroker product scope | closes with: McLeod's product pages or a published customer filing naming them | checked: 2026-11-22 -->

Four patterns:

- **The market consolidated into suites and rollups from 2024 to 2025.** MercuryGate went to Körber (now Infios), 3GTMS to Descartes, e2open to WiseTech. A TMS bought today is often one product line of several under one owner, and its roadmap and integrations follow the owner's.
- **Shipper suites sell planning; carrier and broker products sell throughput.** Manhattan and Blue Yonder lead with optimization; Alvys, Rose Rocket and TruckMate lead with dispatch, settlement and accounting. The data model is the same spine; where each product puts its depth differs.
- **Every product claims EDI, APIs and an integration count.** Alvys' "130+ integrations" and Manhattan's appointment agent are the same claim from opposite ends: the TMS is the hub between ERP, carriers, visibility, docks and payment.
- **Audit and payment sit inside or next to the TMS.** Manhattan audits charges "against contracted rates and executed shipment data"; Rose Rocket lists freight audit and pay; Trimble sells "Sourcing & Settlement" separately. Where audit lives decides whether the rated lines and the billed lines are in the same database.

## Three Kinds of TMS

| | Shipper TMS | Broker TMS | Carrier TMS |
| --- | --- | --- | --- |
| **Starts from** | Sales, purchase and transfer orders from the ERP | A customer's tender or a quote request | A customer's or broker's tender |
| **The central record** | The shipment and the load it is planned onto | The load, with a customer side and a carrier side | The load and the trip a driver and tractor run |
| **Main decision** | Mode, consolidation and carrier choice at the lowest cost that meets service | Which carrier, at what buy rate, against a known sell rate | Which driver and tractor, and which load next |
| **Prices** | Payable only (and accruals) | Receivable and payable on every load | Receivable, plus driver and owner-operator pay |
| **Carrier relationship** | Contract carriers in a routing guide, spot when it fails | Thousands of carriers, vetted, mostly spot or short contract | Its own fleet, plus brokered-out loads it can't cover |
| **Distinct records** | Orders, routing guides, freight audit | Carrier onboarding and compliance, rate confirmations, margin | Drivers, equipment, hours of service, maintenance, settlements |

The spine is shared, which is why the core model works for all three: `owner_party_id` on orders, shipments and loads says whose copy a row is, and `rate_agreements.side` and `freight_charges.side` separate what a party is owed from what it owes. A broker's load and the shipper's load for the same truck are two rows in two tenants' data, linked by the identifiers in the tender (the shipper's shipment ID, the broker's load number), never by a shared key ([Tenancy Follows the Owner](/books/logistics/logistics-business#the-core-data-model)).

## The Order-to-Invoice Pipeline

Every TMS runs the same pipeline; the three kinds enter it at different steps and own different ones:

1. **Order intake.** Orders arrive from the ERP (or a customer's 204 or portal entry for a broker or carrier) with ship-from, ship-to, lines, requested dates and a delivery term. The term decides who books the freight: under a collect or buyer-arranged term the buyer's TMS plans it; under a prepaid or seller-arranged term the seller's does. Order changes after this step are the commonest source of rework, so each order carries a version.
2. **Release and shipment building.** Orders (or lines of them) become shipments when they are ready to ship: inventory allocated, dates firm, credit cleared. One order can become several shipments; one shipment can carry lines from several orders to the same consignee. Vendors name the result differently (an Oracle order release, an SAP freight unit), and the core model maps both to shipments ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)). The point where demand becomes freight is a state change with a reason, not a batch job's side effect.
3. **Planning.** Shipments are assigned a mode and either rated individually (parcel, LTL) or grouped into loads (truckload, multi-stop, pool) with stops and appointments ([Load Planning & Optimization](/books/logistics/load-planning)). A carrier's TMS skips this for most freight: the tender it receives is already a load.
4. **Rating.** Each shipment or load is priced against agreements in force, producing estimated charges on the relevant side ([Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#the-rating-engine)).
5. **Carrier selection and tendering.** The routing guide ranks carriers for the lane; the load is tendered down the waterfall until one accepts, or goes to the spot market ([Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides#routing-guides), [Tendering & Acceptance](/books/logistics/tendering#the-tender-state-machine)). Acceptance sets `loads.carrier_party_id`.
6. **Appointments and documents.** Dock appointments are booked at pickup and delivery; the bill of lading and, for brokered loads, the rate confirmation are issued.
7. **Dispatch.** The carrier assigns a driver, tractor and trailer ([Carrier Dispatch & Asset Management](/books/logistics/carrier-operations)). The shipper and broker see this only as a status and, sometimes, a driver's phone number and tracking link.
8. **Execution and visibility.** Pickup, in-transit positions, arrival and delivery arrive as events with event and received time; exceptions (late, refused, damaged) open their own workflows.
9. **Proof of delivery and event accessorials.** The signed delivery receipt or photo is captured; detention, layover and other event charges are computed from stop times.
10. **Invoicing and audit.** The carrier invoices (or the broker bills the shipper); the invoice is matched line by line to the rated charges and the events that justify accessorials, approved, disputed or short-paid.
11. **Settlement and payment.** Approved payables are paid on terms, by quick pay or to a factor; receivables are collected; month end accrues purchased transportation for delivered loads not yet invoiced.

The steps overlap in time and repeat: a load can be re-tendered after a carrier drops it at step 7, re-planned when an order changes at step 3, and re-rated after a reweigh at step 10. A pipeline that assumes each step runs once corrupts its own history the first time one repeats.

## States, Not Steps

Each record in the pipeline has a state and a set of allowed transitions, and the TMS is correct when every transition is guarded, recorded and idempotent ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit)). The core model's status columns carry the current state; what a TMS needs on top is the history and the rules:

- **Shipment:** `draft` to `planned` (on a load) to `tendered` to `booked` (carrier accepted) to `picked_up`, `in_transit`, `delivered`; `exception` and `cancelled` from most states. Un-planning a shipment (an order change) moves it back to `draft` and releases it from its load.
- **Load:** `planning` to `tendered` to `covered` to `dispatched` to `in_transit` to `delivered` to `closed` (billed and paid). A carrier dropping a covered load returns it to `planning` or straight to `tendered` with the next carrier, and the history must show both carriers.
- **Who may move what.** A shipper's planner un-plans; a carrier's acceptance covers; an ELD event or a check call moves a load in transit; a POD delivers. Each transition records its actor (a user, a partner message, a rule) and the message or event that caused it, so a status that changed at 03:12 can be traced to the 214 that changed it ([Typed Actors](/docs/building-blocks/audit-trails#typed-actors)).
- **Partner messages are commands with retries.** A 990 or an API acceptance can arrive twice, late or out of order; applying it twice must be harmless ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)), and applying an acceptance to a tender that already expired is a decision the tender's rules make, not a silent overwrite.

Every transition also emits an event (`shipment.planned`, `load.tendered`, `tender.accepted`, `load.dispatched`, `stop.arrived`, `shipment.delivered`) through the outbox, and the downstream steps (visibility, customer notification, accruals, invoicing) subscribe rather than poll ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Where the TMS Ends

A TMS sits between systems that own the neighboring records, and the boundaries are where integrations fail:

- **ERP.** Owns the order, the customer and vendor masters, and the general ledger. The TMS receives orders and sends back shipment confirmations, freight cost accruals and approved payables. Order changes flowing after planning are the boundary's hardest case.
- **WMS.** Owns inventory and the dock. The TMS tells the WMS what ships on which load and when; the WMS tells the TMS what was actually loaded, which handling units and weights, which may differ from the plan. Manhattan's pitch of TMS and WMS on "the same real-time information" is a claim about this boundary.
- **Yard and dock scheduling.** Owns appointments and gate events, the evidence for detention (Yard Management & Dock Scheduling).
- **Visibility platforms and ELDs.** Own positions and many status events (Visibility & Tracking; [ELDs & Telematics](/books/logistics/electronic-logging-devices)).
- **Freight audit and payment.** Often a separate provider that receives invoices and pays carriers for the shipper (Freight Audit & Payment).

My rule at each boundary: the TMS stores the partner's identifiers and message as received, maps them to its own records explicitly, and never assumes the partner's state is its own ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).

## How to Build It

The core model has the three records and their current status. The TMS adds what drives the pipeline: on orders, who arranges the freight and the order's version; on shipments, release and hold state; on shipment lines, the order version each was built from; on loads, how the plan was made and approved. New tables hold the transition history of shipments and loads and how each carrier connects for each pipeline function. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE orders
  ADD COLUMN freight_arranged_by TEXT,   -- 'buyer' or 'seller', from the delivery term
  ADD COLUMN version             INT NOT NULL DEFAULT 1,  -- bumped on every change from the ERP
  ADD COLUMN source_ref          TEXT;   -- the ERP's document number and line set
ALTER TABLE orders ADD CONSTRAINT orders_freight_arranged_by_check
  CHECK (freight_arranged_by IS NULL OR freight_arranged_by IN ('buyer', 'seller')) NOT VALID;

ALTER TABLE shipments
  ADD COLUMN ready_at           TIMESTAMPTZ,  -- released for planning
  ADD COLUMN hold_reason        TEXT,   -- 'credit', 'inventory', 'order_change', 'customs'
  ADD COLUMN planned_load_count SMALLINT NOT NULL DEFAULT 0;  -- legs planned, for multi-leg moves
ALTER TABLE shipments ADD CONSTRAINT shipments_hold_reason_check
  CHECK (hold_reason IS NULL OR hold_reason IN ('credit', 'inventory', 'order_change',
    'customs', 'customer_request', 'other')) NOT VALID;

ALTER TABLE shipment_lines              -- a shipment can carry lines from several orders
  ADD COLUMN order_version INT;          -- the order version this line was built from

ALTER TABLE loads
  ADD COLUMN planned_by     TEXT,        -- 'manual', 'optimizer', 'customer_tender', 'carrier'
  ADD COLUMN approved_at    TIMESTAMPTZ, -- released for tendering
  ADD COLUMN approved_by    TEXT,
  ADD COLUMN customer_ref   TEXT;        -- the shipper's shipment ID on a received tender
ALTER TABLE loads ADD CONSTRAINT loads_planned_by_check
  CHECK (planned_by IS NULL OR planned_by IN ('manual', 'optimizer', 'customer_tender',
    'carrier')) NOT VALID;

CREATE TABLE shipment_transitions (      -- every status change, append-only
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id  UUID NOT NULL REFERENCES shipments (id),
  from_status  TEXT,                     -- null for the first
  to_status    TEXT NOT NULL,
  actor_kind   TEXT NOT NULL CHECK (actor_kind IN ('user', 'partner', 'rule', 'system')),
  actor_ref    TEXT NOT NULL,            -- user ID, partner party ID, rule name
  reason       TEXT,
  caused_by_document_id UUID REFERENCES documents (id),  -- the 990, 214 or POD
  caused_by_event_id    UUID REFERENCES shipment_events (id),
  occurred_at  TIMESTAMPTZ NOT NULL,     -- when the change happened in the world
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON shipment_transitions (shipment_id, recorded_at);

CREATE TABLE load_transitions (          -- the same for loads, including carrier changes
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id      UUID NOT NULL REFERENCES loads (id),
  from_status  TEXT,
  to_status    TEXT NOT NULL,
  carrier_party_id UUID REFERENCES parties (id),  -- the carrier at the time
  tender_id    UUID REFERENCES tenders (id),
  actor_kind   TEXT NOT NULL CHECK (actor_kind IN ('user', 'partner', 'rule', 'system')),
  actor_ref    TEXT NOT NULL,
  reason       TEXT,
  caused_by_document_id UUID REFERENCES documents (id),
  occurred_at  TIMESTAMPTZ NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON load_transitions (load_id, recorded_at);

CREATE TABLE carrier_channel_profiles (  -- how one carrier connects for each function
  owner_party_id   UUID NOT NULL REFERENCES parties (id),  -- whose TMS
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  function         TEXT NOT NULL CHECK (function IN ('rate_quote', 'tender', 'tender_response',
                     'status', 'appointment', 'document', 'invoice', 'remittance')),
  channel          TEXT NOT NULL CHECK (channel IN ('edi', 'api', 'portal', 'email',
                     'load_board', 'phone')),
  connection_ref   TEXT,                 -- the integration connection record
  partner_ids      JSONB NOT NULL DEFAULT '{}',  -- ISA and GS IDs, API account, portal user
  valid_during     TSTZRANGE NOT NULL,
  PRIMARY KEY (owner_party_id, carrier_party_id, function, valid_during)
);

CREATE INDEX CONCURRENTLY shipments_ready_idx ON shipments (owner_party_id, ready_at)
  WHERE status = 'draft' AND hold_reason IS NULL;
```

The planner's work queue, shipments released and not yet on a load, oldest first:

```sql
SELECT s.id, s.bol_number, s.origin_facility_id, s.destination_facility_id,
       s.pickup_window, s.ready_at
FROM shipments s
WHERE s.owner_party_id = $1
  AND s.status = 'draft'
  AND s.ready_at IS NOT NULL
  AND s.hold_reason IS NULL
  AND NOT EXISTS (SELECT 1 FROM load_shipments ls WHERE ls.shipment_id = s.id)
ORDER BY lower(s.pickup_window), s.ready_at;
```

And the loads that changed carrier after being covered, the input to a carrier scorecard and to the broker's re-cover cost:

```sql
SELECT t.load_id, count(DISTINCT t.carrier_party_id) AS carriers
FROM load_transitions t
WHERE t.to_status = 'covered'
  AND t.recorded_at >= $1
GROUP BY t.load_id
HAVING count(DISTINCT t.carrier_party_id) > 1;
```

Design notes:

- **One function moves each record's state.** Status columns change only through a transition function that checks the allowed transition, writes the transition row and the outbox event in the same transaction ([One Function Moves the State](/docs/building-blocks/workflows#one-function-moves-the-state)).
- **Order versions travel with shipments.** A shipment line built from order version 3 that sees version 4 arrive flags its shipment for re-planning instead of being silently edited; the planner decides whether the load changes.
- **Partner state is input, not truth.** A 990 or 214 is stored as a document and applied through the same transition function as a user's click, with the document as the cause.
- **Channels are per function and per carrier.** A carrier can accept tenders by EDI, send status by API and invoice by PDF; `carrier_channel_profiles` routes each function, and a change of channel is a new validity range, so in-flight loads finish on the old one.
- **The TMS emits, others subscribe.** Accruals, notifications and visibility read the outbox; none of them is called inline from a transition.

## Auditing

- **Every status transition** of every shipment and load, with actor, reason, cause and both times, so a disputed delivery time or a carrier swap can be reconstructed.
- **Every order version** and which shipments and loads were built from it.
- **Every partner message** that changed a record, as received, linked from the transition it caused.
- **Every carrier channel** with its validity, so a tender sent to a retired endpoint can be explained.
- **Plan approvals:** who released a load for tendering and when, and whether an optimizer or a person built it.

## What This Means for the System You Build

- **Decide which TMS you are building:** shipper, broker or carrier. The spine is the same; the depth goes to planning, to two-sided pricing, or to dispatch and settlements.
- **Model the pipeline as states with guarded transitions,** and keep the transition history as rows with actors and causes.
- **Expect every step to repeat:** re-plan after order changes, re-tender after drops, re-rate after reweighs, and keep each attempt.
- **Treat partner messages as commands,** idempotent and applied through the same transition rules as users.
- **Version orders and carry the version onto shipment lines,** so a late change is a visible decision.
- **Route each function per carrier,** because carriers connect differently for tenders, status and invoices.
- **Draw the boundaries with the ERP, WMS, yard and payment systems explicitly,** storing their identifiers and messages as received.

## References

**Filings and announcements**

- [Descartes Systems Group: Form 6-K exhibit on the 3GTMS acquisition (2025)](https://www.sec.gov/Archives/edgar/data/1050140/000092963825002172/exhibit99-2.htm), the March 24, 2025 acquisition and its price
- [WiseTech Global: Completes strategic acquisition of e2open (August 2025)](https://www.wisetechglobal.com/news/wisetech-global-completes-strategic-acquisition-of-e2open/), completion date, price per share and enterprise value
- [Modern Materials Handling: Körber Supply Chain Software completes acquisition of TMS provider MercuryGate (October 1, 2024)](https://www.mmh.com/article/koerber_supply_chain_software_completes_acquisition_of_tms_provider_mercurygate/software_tech), MercuryGate as a TMS provider and the Körber and KKR joint venture
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), the Freight segment's description and revenue

**Vendors**

- [Alvys](https://alvys.com/), modules for carriers and brokers, integrations and customer count
- [Blue Yonder: Transportation management](https://blueyonder.com/solutions/transportation-management), optimization, load planning and procurement
- [Infios](https://www.infios.com/), Infios Transportation Management, its customer count and the rename from Körber Supply Chain Software
- [Manhattan Associates: Transportation management](https://www.manh.com/solutions/supply-chain-management-software/transportation-management), joint optimization, tendering, audit and private fleet planning
- [Rose Rocket](https://www.roserocket.com/), quote management, dispatch workflows and freight audit and pay
- [SAP Learning: Carrier selection in SAP S/4HANA Transportation Management](https://learning.sap.com/courses/planning-and-execution-in-sap-s-4hana-transportation-management/carrier-selection), selection strategies, allocations and business shares
- [SAP Learning: Understanding strategic freight procurement](https://learning.sap.com/courses/charges-and-settlement-in-sap-s-4hana-transportation-management/understanding-strategic-freight-procurement), the freight agreement master RFQ
- [SAP Documentation: Tendering profile](https://help.sap.com/saphelp_tm91/helpdata/en/43/01feea1b5241e1be095e05e5c9072d/content.htm), the four tendering types
- [Trimble: Transportation management](https://transportation.trimble.com/en/solutions/transportation-management), TMW.Suite, TruckMate and Trimble TMS for carriers and shippers
