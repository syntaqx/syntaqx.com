+++
title = "ERP, MES & ISA-95"
description = "How a plant's systems divide the work: the ISA-95 levels, what ERP, MES, SCADA and PLCs each own, OPC UA and MQTT on the floor, and the vendors."
category = "Logistics & Supply Chain Industry"
order = 2856
part = "Manufacturing"
tags = ["logistics", "manufacturing", "erp", "mes", "isa-95", "opc-ua", "mqtt", "data-model"]
+++

A plant runs on a stack of systems that each see the same production at a different speed. The ERP sees a sales order, a planned order and a purchase order, and plans in days and weeks; the manufacturing execution system (MES) sees a work order released to a line, the operator who started it, the components scanned in and the quantity reported good, in minutes; the supervisory layer (SCADA, a historian) sees a machine's states and tag values in seconds; and the programmable logic controllers (PLCs) close control loops in milliseconds. Freight touches every layer: the inbound truck that carries resin is a purchase order receipt in the ERP, a material lot staged to a line in the MES, a silo level on a SCADA screen, and the finished pallets that leave on Thursday are a work order's output, an ASN and a shipment.

It is hard because the boundary between these systems is a contract nobody wrote down. Which system creates the work order, which one owns the lot number, which one decides that a component was consumed, which one's clock counts when a machine went down, and what happens to the ERP's plan when the floor makes 940 of 1,000: every plant answers differently, and two plants of the same company often answer differently from each other. The standard that names the layers, ISA-95, describes the information exchange and deliberately leaves the product choices open; the products themselves overlap (an ERP with shop-floor screens, an MES with scheduling, a SCADA with batch records), so the same function can live in two systems with two answers.

This chapter covers the ISA-95 levels and what each owns, the ERP's role in a manufacturer, the MES and the manufacturing operations it runs, the plant-floor protocols (OPC UA, MQTT and Sparkplug) that carry machine data upward, the integration between levels 3 and 4, and the vendors, with figures from their filings. It extends `facilities`, `items` and `orders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). A merchant's ERP sync (orders, inventory and accounting between a storefront and an ERP) is Commerce's [ERP & Integrations](/books/commerce/erp-and-integrations#what-an-erp-owns); this chapter is the manufacturer's ERP and the plant beneath it. Bills of materials are [BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change); planning and work orders are [MRP, Scheduling & Work Orders](/books/logistics/production-planning).

## How the Platforms Do It

As of November 2026, from vendor documentation, product pages and filings:

| Vendor | Product (layer) | What the vendor says it does | Public figure |
| --- | --- | --- | --- |
| **AVEVA** | MES (level 3) | "execute workorders," "Track the transformation of materials into finished products," statistical process control, "Measure and monitor OEE KPIs and schedule adherence in real time" | Not public in this pass |
| **Dassault Systèmes** | DELMIA Apriso (level 3); ENOVIA and CATIA (PLM, design) | Apriso is an "advanced Manufacturing Operations Management (MOM) solution"; MOM "includes all capabilities traditionally considered part of MES" | FY2025 revenue €6,239.6 million, flat as reported and up 4% in constant currency; Industrial Innovation software (CATIA, ENOVIA, SIMULIA, DELMIA and others) €3.13 billion, 56% of software revenue |
| **ERPNext** (Frappe) | ERP with work orders and job cards (level 4, some 3) | "A Work Order is a document given to the manufacturing shop floor by the Production Planner"; job cards track operations; optional capacity planning | Open source |
| **Microsoft** | Dynamics 365 Supply Chain Management (level 4, with an MES terminal) | Production orders, batch orders and kanbans in "mixed mode"; job scheduling with finite capacity; an "MES Terminal" for reporting progress | Not broken out in Microsoft's filings |
| **Oracle** | Fusion Cloud Manufacturing (level 4) | A work definition "defines the manufacturing process for a product," a "template to create a work order," combining "an item structure and routing into a single view" | Not broken out |
| **PTC** | Windchill, Arena (PLM); Creo, Onshape (CAD) | Windchill "manages all aspects of the product development lifecycle"; Kepware and ThingWorx (industrial connectivity and IoT) divested in fiscal Q2 2026 | FY2026 (to September 30, 2026) revenue $2,733.4 million; ARR $2.51 billion; about 95% recurring; on October 4, 2026 agreed to become a wholly owned subsidiary of Schneider Electric (pending as of November 2026) |
| **Rockwell Automation** | FactoryTalk, Plex Systems, Fiix (levels 1 to 4) | Software & Control: "control and visualization software and hardware, digital twin, simulation and information software" | FY2026 (to September 30, 2026) sales $8,989 million: Intelligent Devices $4,185 million, Software & Control $2,818 million, Lifecycle Services $2,071 million, less an $85 million unallocated tariff refund estimate; about 27,000 employees |
| **Siemens** | Opcenter (level 3), Teamcenter (PLM), automation | Opcenter is "a unified manufacturing operations management (MOM) solutions portfolio," MOM being "the real-time software layer that links product lifecycle management (PLM) to automation"; Opcenter APS for scheduling | FY2026 group revenue €83.4 billion; Digital Industries software revenue €7.2 billion, up 13% comparable |
| **Tulip** | Frontline operations platform (level 3) | "a secure, governed, composable platform" where apps are built "without writing any code" and machines, sensors and operator entries "connect to the same data model" | Private |

The other common ERPs (SAP S/4HANA, Epicor, Infor, IFS, QAD, Acumatica, NetSuite) and MES products (SAP Digital Manufacturing among them) are in the same categories; their product pages weren't readable for this chapter, so no claim about them is made here.

Four patterns:

- **MES has become MOM.** Siemens, Dassault and AVEVA all describe their level-3 products as manufacturing operations management, which adds quality, materials handling and maintenance to execution. The scope of "the MES" in a given plant is a decision, and the integration has to say which of those functions it owns.
- **ERPs reach down, MES products reach up.** Dynamics 365 ships an MES terminal and finite job scheduling; ERPNext has job cards and capacity planning; Opcenter has a scheduler and a quality system. The overlap is why a plant's system-of-record map (who owns which object) has to be explicit, per plant.
- **Automation vendors own the floor and are buying the layers above.** Rockwell sells controllers, FactoryTalk software and the Plex cloud MES and ERP; Siemens sells automation, Opcenter and Teamcenter. PTC went the other way in fiscal 2026, selling its connectivity and IoT businesses to concentrate on PLM and CAD, and then agreed to be acquired by Schneider Electric.
- **Composable platforms are the low-code alternative.** Tulip's apps on a shared data model compete with configured MES for plants that need operator workflows faster than an MES project delivers them.

## The ISA-95 Levels

ISA-95 (also published as ANSI/ISA-95 and IEC 62264) is "an international set of standards aimed at integrating logistics systems with manufacturing control systems." It builds on the Purdue model's levels and gives "an abstract model for information exchange among manufacturing control functions and business functions," and "primarily deals with the interface between levels 3 and 4":

| Level | What it is | Typical systems (my mapping) | Time scale (my rule of thumb) |
| --- | --- | --- | --- |
| **4: Business planning and logistics** | Orders, plans, purchasing, inventory value, shipping | ERP, supply planning, TMS, WMS | Days, weeks, months |
| **3: Manufacturing operations management** | Dispatching work, tracking production, quality, materials on the floor, maintenance | MES, MOM, historian, LIMS (ISA lists SCADA here too) | Shifts, hours, minutes |
| **2: Monitoring and supervisory control** | Monitoring and supervising the process | PLCs, DCSs, HMIs, SCADA | Seconds |
| **1: Sensing and manipulating** | Sensors, smart devices, valves | Instruments, drives | Milliseconds |
| **0: The physical process** | The machinery and assets on the floor | | |

The standard has eight parts: Models and Terminology; Objects and Attributes for Enterprise-Control System Integration; Activity Models of Manufacturing Operations Management; Objects and Attributes for Manufacturing Operations Management Integration; Business-to-Manufacturing Transactions; Messaging Service Model; Alias Service Model; and Information Exchange Profiles. The OPC Foundation's "OPC UA for ISA-95 Common Object Model" companion specification, first released in early 2013, models its physical asset, equipment, and personnel and material handling models.

What the levels mean for a system design:

- **Each level owns its own truth, at its own grain.** The ERP's work order says 1,000 units due Friday; the MES's records say 940 good and 22 scrapped across three shifts on two lines; the historian says line 2 stopped for 47 minutes at 03:12. None is wrong. Integration passes summaries up (quantities, consumption, status) and instructions down (orders, recipes, schedules), never the raw grain of the other level.
- **The 3/4 boundary is where logistics meets production.** Material arriving on a truck becomes plant inventory at level 4 and is staged to a line at level 3; finished goods are reported at level 3 and become a shipment at level 4. Lots and handling units cross the boundary, and their identifiers must survive it.
- **The lower levels are a separate network for a reason.** Control networks are segmented from business networks for safety and security; data leaves levels 1 and 2 through gateways, historians or brokers, not by an ERP polling a PLC.

## What the ERP Owns in a Plant

In a manufacturer the ERP is the planning and money system. Its objects, with the chapters that cover each:

- **Items and their make or buy decision,** units of measure, costs, and the plant each is planned at. A purchased item comes from a supplier on a purchase order; a manufactured item comes from a work order; some items are both, by plant.
- **Bills of materials and routings,** the structure and the steps. Engineering usually authors the structure in PLM and releases it to the ERP ([BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change)).
- **Demand and the plan:** sales orders, forecasts, the master production schedule, MRP's planned orders and the work orders and purchase orders they become ([MRP, Scheduling & Work Orders](/books/logistics/production-planning)), and above them the demand and supply plan ([Demand & Supply Planning](/books/logistics/supply-chain-planning)).
- **Supplier commitments:** purchase orders, scheduling agreements and the releases sent against them ([Supplier Schedules, JIT & Automotive EDI](/books/logistics/supplier-schedules)).
- **Inventory value and cost:** standard or actual cost, work-in-process, variances. Dynamics 365 supports "both actual cost (first in, first out [FIFO]; last in, first out [LIFO]; moving average; and periodic weighted average) and standard cost methods," and lean manufacturing "is implemented based on the backflush costing principle."
- **Shipping and invoicing:** the outbound order, the shipment and the bill, where this volume's freight records begin.

The manufacturing principle chosen per item decides how much the ERP plans ahead. Dynamics 365's list is the common vocabulary: make to stock ("produced for stock, based on forecast or minimum stock refill"), make to order, configure to order (the variant "is created at the time of order entry, based on the configuration model"), and engineer to order, which is "typically addressed by a project and usually start[s] with the engineering phase."

## What the MES Owns

The MES runs what happens between a work order's release and its completion:

- **Dispatching:** which order runs on which line, in which sequence, this shift, with the work instructions and the recipe or program version.
- **Material on the floor:** what was staged, scanned and consumed, by lot, and the containers moved between operations.
- **Production reporting:** good and scrap quantities per operation, labor and machine time, and the output lot.
- **Quality on the floor:** in-process checks, sampling plans and holds; AVEVA lists "quality sample plan execution" and statistical process control. Quality systems in depth are [Quality Systems](/books/logistics/quality-management).
- **Performance:** machine states, downtime reasons and OEE; AVEVA's MES measures "OEE KPIs and schedule adherence in real time."
- **The record of how each unit or lot was made,** which traceability and recalls later read ([Lot & Serial Traceability](/books/logistics/lot-traceability) is where that genealogy is modeled).

Dynamics 365's production life cycle shows the hand-offs the two levels share, whichever system runs them: created (manually or by "firming planned orders"), estimated (material and resource consumption calculated), scheduled ("operations scheduling" for a "rough, long-term plan" or "job scheduling" for "a detailed plan" with finite capacity), released (after a material availability check, which in Dynamics also releases the BOM lines to warehouse management), picked, started (where consumption can be posted automatically, "known as preflushing, forward flushing, or autoconsumption"), reported as finished (where unreported consumption can be "automatically allocated through back-flushing"), quality assessment, put away, and ended (estimated costs "reversed and replaced with actual costs").

## Plant-Floor Protocols

Machine data reaches level 3 through a small set of protocols:

- **OPC UA** is "a platform independent service-oriented architecture," released in 2008, whose information modeling "turns data into information": a server exposes typed objects (a machine, its states, its counters) rather than bare register addresses. Clients and servers are "identified through X509 certificates" and sessions are encrypted; a PubSub mode is "optimized for many-to-many configurations," with transports from a binary protocol to JSON over WebSockets.
- **MQTT** is "an OASIS standard messaging protocol for the Internet of Things (IoT)," "an extremely lightweight publish/subscribe messaging transport." Devices publish to a broker; consumers subscribe; neither knows the other.
- **Sparkplug** (Eclipse, version 3.0, upgraded from 2.2) adds what bare MQTT lacks for industrial data: a defined payload and state awareness, in which "birth and death certificates provide subscribing clients confidence in data validity." A subscriber knows when a node came online, what it publishes, and when it went silent, so a stale value is distinguishable from a steady one.

The common architecture in 2026 is a broker or gateway between levels 2 and 3, with OPC UA servers on machines or gateways and MQTT/Sparkplug carrying data to the MES, the historian and the cloud. Whatever the transport, two rules carry over from the rest of this volume: every machine event has its own occurrence time and the time it was received, because a gateway buffers through a network outage and replays ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)); and consumers are idempotent, because brokers redeliver ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).

## Between Levels 3 and 4

The integration that matters most for logistics is the exchange between ERP and MES. Its content, which ISA-95 Part 5 calls business-to-manufacturing transactions, comes down to a handful of flows:

| Direction | What | When |
| --- | --- | --- |
| ERP to MES | Work orders (item, quantity, due date, BOM and routing version) | On release |
| ERP to MES | Item, BOM and routing masters | On engineering release or change |
| ERP to MES | Material availability and lot status | On receipt, quality release, hold |
| MES to ERP | Operation confirmations: good and scrap quantities, labor and machine time | Per operation or at close |
| MES to ERP | Material consumption, by lot | As consumed, or backflushed at report |
| MES to ERP | Output receipts: quantity, output lot, handling units | At report as finished |
| MES to ERP | Order status (started, held, completed) | On change |

Three decisions make or break it:

- **The grain of confirmation.** Per operation confirmations give the ERP accurate WIP and cost but put many messages on the wire; one confirmation at completion is simple but leaves WIP blind for a long-running order. Dynamics 365 notes that actual-cost methods "require accurate reporting on the job level, whereas periodic costing methods allow for less granular reporting."
- **Who assigns identifiers.** Lots and serials are usually assigned where the unit is made (the MES) and handling-unit labels where it is packed; the ERP must accept identifiers it didn't create, keyed by their issuer, as every outside identifier in this volume is.
- **What happens on disagreement.** The MES reports 940; the ERP expected 1,000. The order stays open, is short-closed, or the shortfall is rescheduled, by rule, and the rule is the planner's, not the integration's. MRP's next run sees whichever it is ([MRP, Scheduling & Work Orders](/books/logistics/production-planning#work-orders)).

The playbook's [Integrations](/docs/building-blocks/integrations#mapping-their-schema-to-yours) covers the mapping and [Events & Async Messaging](/docs/architecture/events#the-transactional-outbox) the delivery.

## How to Build It

Plants are already `facilities` rows of kind `plant`. The deltas: the plant's code in its ERP, a work center hierarchy beneath it, a record of which system owns which object at each plant, the manufacturing principle on orders, the make or buy basis on items, and machine state events.

```sql fragment
ALTER TABLE facilities
  ADD COLUMN erp_plant_code TEXT;        -- the ERP's plant, site or organization code

-- items.base_uom, the unit inventory, BOMs and MRP count in, comes from Warehouse Management Systems.
ALTER TABLE items
  ADD COLUMN procurement_type TEXT;      -- the default; plants override in item_plant_settings
ALTER TABLE items ADD CONSTRAINT items_procurement_type_check
  CHECK (procurement_type IN ('make', 'buy', 'make_or_buy', 'subcontract')) NOT VALID;

ALTER TABLE orders
  ADD COLUMN fulfillment_policy TEXT;    -- sales orders: how the goods are produced for it
ALTER TABLE orders ADD CONSTRAINT orders_fulfillment_policy_check
  CHECK (fulfillment_policy IN ('make_to_stock', 'make_to_order', 'configure_to_order',
    'engineer_to_order', 'ship_from_stock')) NOT VALID;
ALTER TABLE items VALIDATE CONSTRAINT items_procurement_type_check;
ALTER TABLE orders VALIDATE CONSTRAINT orders_fulfillment_policy_check;

CREATE TABLE item_plant_settings (       -- an item as one plant makes or buys it
  item_id          UUID NOT NULL REFERENCES items (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),  -- a plant
  procurement_type TEXT NOT NULL CHECK (procurement_type IN ('make', 'buy', 'subcontract',
                     'transfer')),       -- transfer: supplied from another plant
  supplying_facility_id UUID REFERENCES facilities (id),     -- for 'transfer'
  planner_code     TEXT,                 -- who plans it
  status           TEXT NOT NULL CHECK (status IN ('active', 'phase_out', 'blocked')),
  PRIMARY KEY (item_id, facility_id),
  CHECK ((procurement_type = 'transfer') = (supplying_facility_id IS NOT NULL))
);

CREATE TABLE work_centers (              -- the plant's places of work, as a hierarchy
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id       UUID NOT NULL REFERENCES facilities (id),
  parent_id         UUID REFERENCES work_centers (id),
  level             TEXT NOT NULL CHECK (level IN ('area', 'line', 'cell', 'machine',
                      'storage_zone')),
  code              TEXT NOT NULL,       -- as the ERP and MES both know it
  name              TEXT NOT NULL,
  capacity_uom      TEXT CHECK (capacity_uom IN ('hours', 'units', 'kg', 'liters')),
  parallel_capacity SMALLINT NOT NULL DEFAULT 1 CHECK (parallel_capacity > 0),  -- machines or crews
  external_refs     JSONB NOT NULL DEFAULT '{}',  -- ERP resource, MES equipment, OPC UA node IDs
  status            TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  UNIQUE (facility_id, code),
  CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE TABLE plant_system_roles (        -- which system owns which object at a plant
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id  UUID NOT NULL REFERENCES facilities (id),
  object       TEXT NOT NULL CHECK (object IN ('item_master', 'bom', 'routing', 'work_order',
                 'schedule', 'material_consumption', 'output_receipt', 'lot_number',
                 'serial_number', 'quality_result', 'machine_state', 'inventory_balance')),
  system_kind  TEXT NOT NULL CHECK (system_kind IN ('erp', 'mes', 'plm', 'wms', 'scada',
                 'historian', 'qms', 'aps', 'this_platform')),
  product      TEXT NOT NULL,            -- the product and version, as deployed at this plant
  valid_during TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  EXCLUDE USING gist (facility_id WITH =, object WITH =, valid_during WITH &&)
);                                       -- one owner per object per plant at any time (btree_gist)

CREATE TABLE equipment_state_events (    -- machine states as reported from the floor
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  work_center_id  UUID NOT NULL REFERENCES work_centers (id),
  state           TEXT NOT NULL CHECK (state IN ('running', 'idle', 'setup', 'planned_stop',
                    'unplanned_stop', 'offline')),
  reason_code     TEXT,                  -- the plant's downtime reason, when coded
  occurred_at     TIMESTAMPTZ NOT NULL,  -- the edge's clock
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL CHECK (source IN ('opc_ua', 'mqtt_sparkplug', 'mqtt', 'mes',
                    'manual')),
  source_seq      BIGINT,                -- the publisher's sequence, for dedup and gaps
  source_node     TEXT NOT NULL,         -- the gateway or node that published it
  UNIQUE (source_node, source_seq)
);
CREATE INDEX equipment_state_events_wc_idx ON equipment_state_events (work_center_id, occurred_at);
```

Notes on the choices:

- **Plant settings are per item per plant.** One company makes a part at one plant and buys it at another, or transfers it between plants; `items.procurement_type` is only the default, and MRP reads `item_plant_settings`.
- **The work center hierarchy is the plant's, not a standard's.** ISA-95's equipment model is the reference, but plants name levels differently; the level column holds the few distinctions scheduling and reporting need, and `external_refs` maps each node to the ERP's resource, the MES's equipment and the machine's OPC UA node.
- **System ownership is data.** `plant_system_roles` answers "which system is right about lot numbers at this plant" before an integration is built, and its validity ranges record a migration from one MES to another without losing who owned what when ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Machine events keep the edge's clock and the server's.** A gateway that buffered through an outage replays with old `occurred_at` and new `received_at`; downtime and OEE run on the first, data latency on the second. `(source_node, source_seq)` deduplicates replays; a gap in the sequence is a data gap, not a running machine.

Downtime, as minutes per state per work center per shift, is a query over consecutive events:

```sql
SELECT work_center_id, state,
       SUM(LEAST(next_at, $2) - GREATEST(occurred_at, $1)) AS duration
FROM (
  SELECT work_center_id, state, occurred_at,
         LEAD(occurred_at, 1, $2) OVER (PARTITION BY work_center_id ORDER BY occurred_at)
           AS next_at
  FROM equipment_state_events
  WHERE occurred_at < $2
    AND occurred_at >= $1 - INTERVAL '1 day'   -- the state in force at the shift's start
) s
WHERE next_at > $1
GROUP BY work_center_id, state;
```

## Auditing

- **Who owned what, when.** The system-of-record map with its validity, so a disputed lot number or a consumption figure can be traced to the system that was authoritative on that date.
- **Every message across the 3/4 boundary,** as sent and as received, with its identifiers, so an ERP's WIP and an MES's production record can be reconciled order by order.
- **Machine events with both times and their source,** so downtime reported to a customer or used in a maintenance claim can be reproduced.
- **Master data versions in force at execution:** which BOM and routing version a work order used, which [BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change#auditing) keeps.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds).

## What This Means for the System You Build

- **Name the level each function lives at,** and keep planning (level 4), execution (level 3) and control (levels 1 and 2) in separate records at their own grain.
- **Write down which system owns each object at each plant,** as data with validity, before building the integration.
- **Pass summaries up and instructions down:** confirmations, consumption and receipts to the ERP; orders, masters and lot status to the MES.
- **Accept identifiers from the system that issues them,** scoped by issuer, and carry lots and handling units across the boundary unchanged.
- **Keep the edge's clock and the server's on every machine event,** deduplicate by publisher sequence, and treat a gap as missing data.
- **Plan per item per plant:** make, buy, subcontract or transfer is a plant decision, not an item attribute.
- **Benchmark vendors by layer,** because ERP, MOM, PLM and automation vendors overlap, and the same function can be bought twice.

## References

**Standards**

- [ISA: ISA-95 standard](https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard), the levels 0 to 4, the scope ("primarily deals with the interface between levels 3 and 4"), the IEC 62264 designation and the eight parts
- [OPC Foundation: OPC UA](https://opcfoundation.org/about/opc-technologies/opc-ua/), the service-oriented architecture released in 2008, information modeling, X509 certificates, encryption and PubSub
- [OPC Foundation: ISA-95](https://opcfoundation.org/markets-collaboration/isa-95/), the OPC UA for ISA-95 Common Object Model companion specification and its models
- [MQTT.org](https://mqtt.org/), MQTT as an OASIS standard publish/subscribe transport
- [Eclipse Foundation: Sparkplug](https://sparkplug.eclipse.org/), Sparkplug 3.0 and birth and death certificates

**Filings and results**

- [Rockwell Automation: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1024478/000102447826000048/rok-20260930.htm), sales by segment and the unallocated tariff refund estimate, employees, the Software & Control description and the FactoryTalk, Plex and Fiix marks
- [PTC: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/857005/000119312526470217/ptc-20260930.htm), revenue, ARR, the recurring share, product descriptions, the Kepware and ThingWorx divestiture and the Schneider Electric merger agreement
- [Siemens: Fiscal 2026 results (November 12, 2026)](https://press.siemens.com/global/en/pressrelease/outstanding-fiscal-2026-performance-industrial-ai-drive-future-growth), group revenue and Digital Industries software revenue
- [Dassault Systèmes: Fourth quarter and full year 2025 results](https://www.3ds.com/assets/invest/2026-02/dassault-systemes-25q4-earnings_pr_va.pdf), revenue, Industrial Innovation software and the brand list

**Vendors**

- [AVEVA: Manufacturing execution system](https://www.aveva.com/en/products/manufacturing-execution-system/), work order execution, material tracking, sampling, SPC and OEE
- [Dassault Systèmes: DELMIA Apriso](https://www.3ds.com/products/delmia/apriso), MOM and its relation to MES
- [Siemens: Opcenter](https://www.siemens.com/en-us/products/opcenter/), MOM as the layer between PLM and automation, Opcenter Execution, APS and Quality
- [Tulip: Platform](https://tulip.co/platform/), the frontline operations platform and its shared data model
- [Microsoft Learn: Production process overview (Dynamics 365 Supply Chain Management)](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview), order types, manufacturing principles, the production life cycle, flushing and cost methods
- [Oracle: Overview of work definitions (Fusion Cloud Manufacturing 26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/faumf/overview-of-work-definitions.html), work definitions as templates for work orders, operations and work centers
- [Frappe: ERPNext Work Order](https://docs.frappe.io/erpnext/user/manual/en/work-order), the work order and job cards
