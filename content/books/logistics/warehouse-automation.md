+++
title = "Warehouse Automation"
nav_title = "Warehouse Automation"
description = "AS/RS, cube storage, AMRs, conveyors and sortation; the WMS, WES and WCS stack; AutoStore, Symbotic and Ocado; and the interface between software and machines."
category = "Logistics & Supply Chain Industry"
order = 2840
part = "Warehouses and Yards"
tags = ["logistics", "warehouse", "automation", "robotics", "wes", "wcs", "data-model"]
+++

Warehouse automation replaces walking and lifting with machines: conveyors and sorters that move cartons between zones and to the right trailer door, automated storage and retrieval systems (AS/RS) that store totes or pallets in dense structures and bring them to a workstation, mobile robots that carry shelves, totes or carts across the floor, robotic arms that pick items or build pallets, and the software layers that tell each machine what to do next. Amazon says it "has deployed more than 1 million robots across its operations network since 2012"; AutoStore reported about 2,050 systems in more than 68 countries in November 2026; and Walmart accounted for about 85% of Symbotic's $2,246.9 million of revenue in its fiscal 2025.

The software is hard because automation moves the system of record for position inside a machine. A WMS knows that a tote is "in the AutoStore," but only the machine's controller knows which stack and depth it is in; a sorter knows which chute a carton went down, but the WMS learns it only from a confirmation message; a robot fleet knows where every robot is, and nothing else does. Every handoff between the WMS and a machine is an asynchronous message that can be lost, duplicated or arrive out of order, every machine has faults and maintenance windows that the plan didn't expect, and the inventory inside the machine has to be reconciled with the WMS's books like a third-party warehouse's. Automation also changes the economics of a building: a cube storage system or a robotic case-handling structure is a multi-year capital commitment, bought from a small number of vendors and installed by integrators, and Kroger's decision in late 2025 to close three of its Ocado-built sites shows what happens when volume doesn't arrive.

This chapter covers the kinds of automation, the control stack (WMS, warehouse execution system and warehouse control system) and the interface contract between them, the inventory inside the machine, throughput and downtime, and the economics as the public vendors report them. It extends `facilities` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and the locations, plates, balances and tasks of [Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it) and [Picking, Packing & Labor](/books/logistics/warehouse-operations#how-to-build-it).

## How the Companies Do It

As of November 2026, from annual and quarterly reports, filings and vendor pages:

| Company | What it sells | Scale and model |
| --- | --- | --- |
| **Amazon** (Amazon Robotics) | Its own robots for its own network: Proteus, which it describes as its first fully autonomous mobile robot; Sequoia inventory storage; Sparrow and Vulcan arms; DeepFleet, a generative AI model for the fleet | More than 1 million robots deployed across its operations network since 2012, as of its June 2026 update |
| **AutoStore** | Cube storage: an aluminum grid of stacked bins, robots that run on top of it, and ports where people or arms pick | 2025 revenue $538.6 million, gross margin 72.4%, backlog $557.0 million at year end; "distributed, designed, installed, and serviced by a network of qualified system integrators"; about 2,050 systems in more than 68 countries (November 5, 2026); an opex offering, AutoStore-as-a-Service, introduced in 2025 |
| **Dematic** | Automation systems with a software stack of WMS, WES and WCS | Defines WES as uniting "warehouse management and control functionality into a single execution platform to release work continuously," and WCS as directly controlling "conveyors, shuttles, sorters, and AS/RSs" |
| **Ocado Group** (Ocado Technology Solutions) | Grocery fulfillment centers on a grid with robots, licensed to retailers | Technology Solutions revenue £561.2 million in FY25 (52 weeks to November 30, 2025); 30 live sites and 122 live modules at year end; Kroger closed three customer fulfillment centers in January 2026 and paid Ocado $350 million |
| **Symbotic** | A multi-level storage structure with autonomous bots for cases and totes, lifts between levels, and robotic depalletizing and palletizing cells | Fiscal 2025 (to September 27, 2025) revenue $2,246.9 million, about 85% from Walmart; 50 systems in deployment and 48 operational under support; backlog about $22.5 billion; acquired Walmart's Advanced Systems and Robotics business in January 2025 |

Three patterns:

- **The market is concentrated on both sides.** A few vendors sell dense storage at scale, and their customers are concentrated too: Symbotic's 10-K says Walmart "accounted for approximately 85% of our total revenue," and its 2022 agreement extended automation to all 42 of Walmart's regional distribution centers. A software team integrating with automation integrates with one vendor's controller per building, often for a decade.
- **Integrators sit in the middle.** AutoStore sells only through partners, which design, install and service each system; the WMS team talks to the integrator's controller, not to the robot maker.
- **The business model is moving toward service.** AutoStore introduced AutoStore-as-a-Service in 2025 and signed $34.4 million of contract value that year; Symbotic's GreenBox joint venture with SoftBank offers "warehouse-as-a-service." Automation priced per unit handled or per month is a 3PL-style contract, with the same metering and billing problems ([Contract Logistics & 3PL Billing](/books/logistics/contract-logistics)).

## The Kinds of Automation

**Conveyors and sortation.** Powered conveyors carry totes and cartons between receiving, storage, pick zones, packing and shipping; sorters (sliding shoe, cross-belt, tilt-tray, pop-up wheel) divert each item to a lane, a chute or a door by reading its barcode at an induction point. A sorter's job is one decision per item at line speed: which destination, from the plate or order the scan names. If the WMS hasn't told it, the item goes to a reject lane ("no read" or "no destination"), and the reject rate is the first measure of the interface's health.

**AS/RS.** Automated storage and retrieval stores loads in a structure and brings them to a station. The common forms:

- **Unit-load AS/RS:** cranes in tall aisles storing full pallets, for reserve storage at density and with no forklift travel.
- **Mini-load and shuttle systems:** totes and cases in racking served by cranes or by shuttles running on each level with lifts at the end of the aisle, for case and each picking.
- **Cube storage (grid):** AutoStore's design, where bins are "stacked high and tight within the Grid," the grid's aluminum frame doubles as the robots' rails, and robots on top "drive, dig, collect, and deliver" bins to ports. A bin under others is reached by moving the ones above it, so the controller continually re-sorts the stacks to keep fast movers near the top. Ocado's grid works on the same principle for grocery.
- **Case-handling structures:** Symbotic's bots move cases through a multi-level structure, robotic cells depalletize inbound pallets into cases and build outbound mixed pallets in store-friendly sequence, and its software re-optimizes every task multiple times per second.

**Goods-to-person.** The common thread of AS/RS and cube storage: the location travels to a stationary worker at a port, who picks the item the screen shows into an order tote, often guided by lights. The worker's productivity is set by how fast the system presents bins, not by walking, which changes the labor standard ([Labor Standards](/books/logistics/warehouse-operations#labor-standards)).

**Mobile robots.** Automated guided vehicles follow fixed paths; autonomous mobile robots (AMRs) navigate freely. They carry pallets and carts, tow trains, bring shelves to a picker (Amazon's drive units) or follow and meet pickers in the aisles. A fleet manager assigns missions; the WMS sees a robot as a resource that performs moves.

**Robotic picking and palletizing.** Arms with vision pick items from totes (Amazon's Sparrow and touch-sensing Vulcan), depalletize and palletize cases, and induct items onto sorters. They are slower and less flexible than people on unfamiliar items, so their tasks are routed by item eligibility, which is item master data.

**Put walls and pick-to-light.** Simpler automation: lights show a worker which cubby or which slot gets the next unit, which turns a batch pick into sorted orders without a sorter.

## The Control Stack

Three layers sit between an order and a motor:

- **The WMS plans and keeps the books:** inventory by owner, lot and status, orders, allocation, waves and tasks. Dematic describes it as optimizing "inventory, workflows, and labor."
- **The warehouse execution system (WES) decides the sequence:** which work to release to which resource (people, robots, conveyors) right now, balancing the zones so no one starves or floods. Dematic: WES "unites warehouse management and control functionality into a single execution platform to release work continuously." Manhattan builds it into the WMS ("Manhattan builds warehouse execution directly into the WMS") and orchestrates robots through its Manhattan Automation Network.
- **The warehouse control system (WCS) runs the equipment:** it "directly controls equipment such as conveyors, shuttles, sorters, and AS/RSs" (Dematic) and "interfaces with the logic controllers in the MHE to directly control material movements" (Infios, which describes its WCS as "vendor-neutral"). Below it, programmable logic controllers run the motors, photo eyes and scanners.

Where the lines fall varies by building: a cube storage controller is its own WCS and part of a WES; a WMS with an embedded WES talks straight to vendor controllers; a large distribution center has a WMS, a separate WES and two or three WCSs from different integrators. The data model doesn't depend on the split: it needs to know which system is authoritative for what, and what messages cross each boundary.

## The Interface Contract

Every WMS-to-automation integration exchanges the same kinds of messages, whatever the transport (vendor API, message queue, socket protocol or database tables). Oracle's WMS documentation has topics for sending picking and packing information to material handling equipment, induction locations, and LPN inventory and shipping messages back:

| Message | Direction | Meaning |
| --- | --- | --- |
| **Item and container master** | WMS to automation | Dimensions, weight, eligibility, tote types |
| **Order or task release** | WMS or WES to WCS | Retrieve this item for this order to this port; route this carton to this destination |
| **Induction and scan** | WCS to WMS | This plate was seen at this point at this time |
| **Pick and put confirmation** | Automation to WMS | This quantity moved from this bin to this tote; the bin is now empty |
| **Exception** | Automation to WMS | No read, overweight, short, damaged, jammed, rejected, timed out |
| **Inventory snapshot** | Automation to WMS | Everything the machine holds, by bin or tote and item |
| **Status and heartbeat** | Both | Available, degraded, stopped; queue depths |

Rules that keep it correct:

- **Every message has an identity and is idempotent.** A release carries the task's ID; a confirmation carries the controller's event ID; a retry or a replay after a restart applies once ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Order isn't guaranteed, so state is.** A "tote arrived at port" can arrive before "tote retrieved" after a reconnect. Each confirmation moves the task's state forward only if its sequence or timestamp is newer, and an out-of-order message is recorded, not applied backward ([Ordering](/docs/architecture/events#ordering)).
- **Every release has a deadline.** A task released to a WCS and never confirmed is an exception after a timeout; the system re-queries the controller before it re-releases, so it doesn't send a second tote.
- **The WMS never assumes success.** Inventory moves when the machine confirms, not when the WMS sends the request. A confirmed short is a short pick, with the same count follow-up as a manual one.
- **Keep the raw messages.** The bytes each side sent are the evidence in every "the system said it shipped" dispute between the software team and the integrator, kept as documents with hashes and parsed into tables.

## Inventory Inside the Machine

A cube storage system or a shuttle AS/RS is, for inventory, a building inside the building: it knows every bin's position, and the WMS doesn't need to. The usual model represents the system as a zone whose locations are its bins or totes (or one location per port, with the bins as plates), with the WMS keeping quantities by bin and the controller keeping positions. Three rules follow:

- **One authority per fact.** The WMS owns what (item, lot, owner, status, quantity); the controller owns where inside the system. Neither writes the other's fact.
- **Reconcile like a 3PL.** A daily or shift snapshot from the controller, compared bin by bin with the WMS's balances, with each difference investigated and adjusted by an approved movement, the same discipline as reconciling a third party's counts ([Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl)).
- **Holds work across the boundary.** A lot on recall hold must not be presented at a port; the WMS's status has to reach the controller's eligibility, or the WMS has to refuse to release tasks for it and confirm the controller never volunteers the bin.

## Throughput, Capacity and Downtime

Automation is sized for a design rate (totes per hour per port, cartons per hour per sorter induction, cases per hour through a palletizing cell) at a planned order profile, and the profile drifts. The system needs, per automation system:

- **Rated and observed throughput,** per hour, against the design rate, so a slowdown is visible before the cutoff is missed.
- **Queue depths at each port and induction,** because a WES releases work to keep queues within bounds.
- **Availability and downtime,** every fault with its start, end, cause code and the work it stranded. Downtime is a contract measure when automation is bought as a service or run by an integrator under a service agreement.
- **A degraded mode.** When a sorter stops, cartons go to manual sort lanes; when an AS/RS is down, the building may have no other access to that stock. The WMS needs a defined fallback (release work to manual zones, hold waves, reroute to other doors), triggered by the WCS's status, and tested.

Peak is the stress test: Lineage, the cold storage operator, reports that its occupancy and warehouse revenues "generally peak between mid-September and early December," with the holiday season and the northern hemisphere harvest. Automation that runs at its design limit in peak has no slack for faults, which is why buildings keep manual capacity beside it.

## Economics

The public filings show the capital and the concentration:

- **Symbotic** recognized $2,118.9 million of its fiscal 2025 revenue from systems, with gross margin of 18.8% and a net loss of $91.0 million; about 12% of its $22.5 billion backlog was expected to be recognized in fiscal 2026. Its January 2025 deal with Walmart had Walmart commit to buy 400 store micro-fulfillment systems (with an option for 200 more) and pay $520 million toward their development, and Symbotic pay Walmart $175 million when the first system is accepted. Its GreenBox venture, 35% Symbotic and 65% SoftBank, committed to spend at least $7.5 billion over six years.
- **AutoStore** earns most of its revenue at a point in time when a system is delivered ($497.2 million of 2025's revenue, against $43.8 million recognized over time), at a gross margin above 70%, through integrator partners. It paid Ocado $127.8 million in 2024 and $64.8 million in 2025 to settle their patent litigation, with nothing owed at the end of 2025.
- **Ocado** shows the downside. Kroger announced on November 18, 2025 that it would optimize its fulfillment network; centers in Frederick, Maryland, Pleasant Prairie, Wisconsin and Groveland, Florida closed in January 2026, Kroger dropped a planned Charlotte site and agreed a one-off payment of $350 million, and Sobeys announced it would close its Calgary center. Ocado guided to about £500 million of technology solutions revenue for 2026.

For the systems that run a building, the lesson is that automation's contract terms (service levels, uptime, throughput guarantees, per-unit fees in a service model) are data the operator measures against, and the automation's own records are the evidence.

## How to Build It

Automation adds the systems themselves, the messages that cross the boundary, faults, and the snapshots that reconcile inventory. Tasks gain the system that performs them, and handling units gain the sort decisions that sent them to a door. All `ALTER`s run on a live database ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE automation_systems (        -- one controlled system in a building
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id         UUID NOT NULL REFERENCES facilities (id),
  zone_id             UUID REFERENCES warehouse_zones (id),  -- its bins or ports as locations
  kind                TEXT NOT NULL CHECK (kind IN ('conveyor', 'sorter', 'unit_load_asrs',
                        'shuttle_asrs', 'cube_storage', 'case_handling', 'amr_fleet',
                        'robotic_cell', 'put_wall', 'palletizer')),
  vendor_party_id     UUID REFERENCES parties (id),   -- the maker
  integrator_party_id UUID REFERENCES parties (id),   -- who installed and services it
  controller_ref      TEXT NOT NULL,     -- the WCS or controller endpoint, as configured
  protocol            TEXT NOT NULL,     -- 'vendor_api', 'queue', 'socket', 'db_tables'
  design_rate_per_hour INT,              -- totes, cartons or cases, per the design
  agreement_id        UUID REFERENCES rate_agreements (id),  -- the service contract, if any
  status              TEXT NOT NULL CHECK (status IN ('commissioning', 'active', 'degraded',
                        'stopped', 'retired'))
);

ALTER TABLE warehouse_tasks
  ADD COLUMN automation_system_id UUID,  -- set when a machine, not a person, performs it
  ADD COLUMN released_to_automation_at TIMESTAMPTZ,
  ADD COLUMN automation_deadline_at    TIMESTAMPTZ;  -- unconfirmed after this is an exception

ALTER TABLE handling_units
  ADD COLUMN sort_destination TEXT,      -- the lane, chute or door it was sent to
  ADD COLUMN sorted_at        TIMESTAMPTZ;

CREATE TABLE automation_messages (       -- every message across the boundary, as sent or received
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  automation_system_id UUID NOT NULL REFERENCES automation_systems (id),
  direction            TEXT NOT NULL CHECK (direction IN ('to_automation', 'from_automation')),
  kind                 TEXT NOT NULL CHECK (kind IN ('master_data', 'task_release',
                         'task_cancel', 'scan', 'confirmation', 'exception', 'snapshot',
                         'status', 'heartbeat')),
  message_ref          TEXT NOT NULL,    -- the task ID outbound; the controller's event ID inbound
  sequence             BIGINT,           -- the sender's sequence, when it has one
  task_id              UUID REFERENCES warehouse_tasks (id),
  lpn_id               UUID REFERENCES warehouse_lpns (id),
  payload              JSONB NOT NULL,   -- parsed
  raw_document_id      UUID REFERENCES documents (id),  -- the bytes, for disputes
  occurred_at          TIMESTAMPTZ NOT NULL,  -- per the sender
  received_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied              BOOLEAN NOT NULL DEFAULT FALSE,  -- false: duplicate or stale, kept
  UNIQUE (automation_system_id, direction, kind, message_ref)
);
CREATE INDEX ON automation_messages (task_id, occurred_at);

CREATE TABLE automation_faults (         -- downtime and degraded periods
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  automation_system_id UUID NOT NULL REFERENCES automation_systems (id),
  severity             TEXT NOT NULL CHECK (severity IN ('degraded', 'stopped')),
  cause_code           TEXT,             -- as the controller reports it
  during               TSTZRANGE NOT NULL,
  tasks_affected       INT,
  planned              BOOLEAN NOT NULL DEFAULT FALSE  -- maintenance windows count separately
);

CREATE TABLE automation_snapshots (      -- what the machine says it holds, for reconciliation
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  automation_system_id UUID NOT NULL REFERENCES automation_systems (id),
  taken_at             TIMESTAMPTZ NOT NULL,
  document_id          UUID REFERENCES documents (id),
  status               TEXT NOT NULL CHECK (status IN ('received', 'compared', 'resolved'))
);

CREATE TABLE automation_snapshot_lines (
  snapshot_id     UUID NOT NULL REFERENCES automation_snapshots (id),
  container_ref   TEXT NOT NULL,         -- the bin or tote, as the controller names it
  item_id         UUID NOT NULL REFERENCES items (id),  -- an empty bin has no line
  machine_qty     NUMERIC(14, 3) NOT NULL,
  wms_qty         NUMERIC(14, 3),        -- filled by the comparison
  movement_id     UUID REFERENCES inventory_movements (id),  -- the approved adjustment
  PRIMARY KEY (snapshot_id, container_ref, item_id)
);

ALTER TABLE warehouse_tasks ADD CONSTRAINT warehouse_tasks_automation_fkey
  FOREIGN KEY (automation_system_id) REFERENCES automation_systems (id) NOT VALID;
CREATE INDEX CONCURRENTLY warehouse_tasks_automation_deadline_idx
  ON warehouse_tasks (automation_deadline_at) WHERE status IN ('assigned', 'in_progress');
ALTER TABLE warehouse_tasks VALIDATE CONSTRAINT warehouse_tasks_automation_fkey;
```

Applying a confirmation is a guarded state move: it applies only once, only forward, and records itself either way:

```sql
WITH msg AS (
  INSERT INTO automation_messages (automation_system_id, direction, kind, message_ref,
                                   sequence, task_id, payload, occurred_at)
  VALUES ($1, 'from_automation', 'confirmation', $2, $3, $4, $5, $6)
  ON CONFLICT (automation_system_id, direction, kind, message_ref) DO NOTHING
  RETURNING id, task_id, occurred_at
)
UPDATE warehouse_tasks t
SET status = 'completed', completed_at = msg.occurred_at
FROM msg
WHERE t.id = msg.task_id
  AND t.status IN ('assigned', 'in_progress')
RETURNING t.id;
```

A duplicate inserts nothing, because the first copy is already kept; when the update returns no row for a new message (the task was already completed, cancelled or shorted), the message stays with `applied = false` for the audit; when it returns one, the same transaction posts the inventory movement and sets `applied`. Tasks past their `automation_deadline_at` without a confirmation are listed by the index above for a re-query of the controller.

Design notes:

- **The machine is a resource, the task is the record.** A task performed by automation is the same task a person would perform, with the system that did it; labor, billing and audits read one table.
- **Messages are append-only evidence.** Every release, confirmation and exception is kept with its sender's identity, sequence and time and the raw bytes, applied or not ([Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds)).
- **Deadlines turn silence into exceptions.** A release has a confirmation deadline; past it, the system asks the controller before it retries ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).
- **Positions stay in the controller.** The WMS keeps quantities by the machine's containers and reconciles with snapshots; it never mirrors stack positions it can't control.
- **Faults are periods.** Downtime is a time range with a cause, so availability, contract service levels and stranded work compute from the ranges.
- **Emit the machine's events.** `automation.degraded`, `automation.recovered`, `task.automation_timeout` and `snapshot.variance_found` are what the floor's fallback, supervisors and the integrator's service desk subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every message across the boundary,** raw and parsed, with its sender's ID, sequence and times, and whether it was applied.
- **Every task performed by automation,** released, confirmed, timed out, retried or cancelled, with the system that did it.
- **Every fault,** its period, cause and the work it stranded, against the automation's service terms.
- **Every snapshot and reconciliation,** the machine's quantities against the WMS's, and the approved adjustments that closed the gaps.
- **Configuration,** each system's design rate, eligibility rules and controller version, with effective dates, because a throughput dispute turns on what the system was configured to do.

## What This Means for the System You Build

- **Name one authority per fact:** the WMS for what and how much, the controller for where inside the machine.
- **Treat every automation message as idempotent, ordered by state, and kept raw,** and move inventory only on confirmation.
- **Give every release a deadline,** and re-query before re-releasing.
- **Reconcile machine inventory by snapshot** with the same approval discipline as a cycle count.
- **Record faults as periods with causes,** and build and test a degraded mode for each system.
- **Model automation as a resource on the same task table** people use, so labor, billing and audits don't fork.
- **Measure throughput and availability against the design and the contract,** especially where automation is bought as a service.

## References

**Filings and reports**

- [Symbotic: Form 10-K for the fiscal year ended September 27, 2025](https://www.sec.gov/Archives/edgar/data/1837240/000183724025000278/sym-20250927.htm), revenue by type, gross margin, net loss, systems in deployment and operational, Walmart's share of revenue, the master automation agreements, the Walmart ASR acquisition and micro-fulfillment commitments, GreenBox, backlog, and the system's bots, structure and cells
- [AutoStore: Q4 2025 report](https://www.autostoresystem.com/hubfs/04%20Website%20Docs/IR/Q4%202025/AutoStore%20Q4%202025%20Report.pdf), 2025 revenue, margins, order intake, backlog, the partner model, revenue recognized at a point in time and over time, AutoStore-as-a-Service and the Ocado settlement payments; sales through partners
- [AutoStore: Q3 2026 press release](https://www.autostoresystem.com/hubfs/02%20Website/Investor%20relations/2026%20Documents/Q3%202026/Q3%202026%20Quarterly%20Press%20Release.pdf), about 2,050 systems in more than 68 countries
- [Ocado Group: FY25 results announcement](https://cdn.prod.website-files.com/667974bf1bf45146cf81ef1f/699fefa5d86d170effa78fe6_FY25%20Results%20Announcement.pdf), Technology Solutions revenue, live sites and modules, the Kroger closures and payment, the Sobeys closure and FY26 guidance
- [Lineage: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1868159/000186815926000012/line-20251231.htm), the mid-September to early December occupancy and revenue peak

**Vendors**

- [Amazon: Amazon robotics in fulfillment centers](https://www.aboutamazon.com/news/operations/amazon-robotics-robots-fulfillment-center), more than 1 million robots since 2012 (updated June 4, 2026), Proteus, Sequoia, Sparrow, Vulcan and DeepFleet
- [AutoStore: The system](https://www.autostoresystem.com/system), the grid, bins, robots, ports and controller
- [AutoStore: Partners](https://www.autostoresystem.com/partners), distribution, design, installation and service by qualified system integrators
- [Dematic: Software](https://www.dematic.com/en-us/software/), its definitions of WMS, WES and WCS
- [Infios: Warehouse Control System](https://www.infios.com/en/supply-chain-solutions/warehouse-control-system), control of material handling equipment through its logic controllers, vendor-neutral
- [Manhattan Associates: Warehouse Management](https://www.manh.com/solutions/supply-chain-management-software/warehouse-management), warehouse execution built into the WMS and the Manhattan Automation Network
- [Oracle Warehouse Management Cloud: Online Help contents](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/toc.htm), the warehouse automation topics: picking and packing information to MHE, induction locations, and LPN inventory and shipping messages
