+++
title = "Warehouse Management Systems"
nav_title = "Warehouse Management"
description = "The WMS from the operator's side: vendors, locations, license plates, lots and owners, the inventory ledger, receiving, putaway, counts and shipping."
category = "Logistics & Supply Chain Industry"
order = 2838
part = "Warehouses and Yards"
tags = ["logistics", "warehouse", "wms", "inventory", "lpn", "cycle-counting", "data-model"]
+++

A warehouse management system (WMS) is the record of what is in a building, exactly where, in what container, owned by whom, in what condition, and what the building has been told to do with it. Oracle's documentation defines it as the "computer system utilized to manage inventory within a distribution center, managing receipt through shipment of goods." That sentence hides most of the work. A distribution center has tens of thousands of addressable locations, each with a capacity and a purpose; every pallet, case and tote that moves through it carries a license plate the system tracks; every unit belongs to an item in a unit of measure, often to a lot with an expiry date, and in a third-party building to one of many owners; and every movement (received, put away, replenished, picked, packed, loaded, counted, adjusted) is a scan by a person or a machine that the inventory must reflect within seconds, because the next task is directed from it. The warehousing and storage industry alone employed 1,839,200 people in the United States in October 2026, by the Bureau of Labor Statistics' preliminary count.

It is hard because the WMS is the only system in a supply chain that must agree with physical reality at the level of a shelf, while everyone upstream treats its numbers as truth. A brand's order manager sells against its counts; a 3PL bills storage from its balances on the last day of the month; a recall needs every lot's location by noon; a carrier's bill of lading prints what it said was loaded. A count that drifts, a pallet put in the wrong bin, a lot received without its expiry, or a balance that two pickers allocated at once each surface as a short shipment, a chargeback or an invoice dispute days later, far from the scan that caused them.

The brand's side of this, what a merchant sees of a 3PL's building, how it sends inbound notices and reconciles counts, is [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#inside-a-warehouse) in the Commerce volume, which also owns the sellable quantities and reservations ([Inventory](/books/commerce/inventory#the-quantities)). This chapter is the operator's side: the WMS vendors, the building as data (zones and locations), items and their unit ladders, license plates, the inventory model (balances by location, plate, owner, lot and status, kept as a ledger of movements), receiving, putaway, replenishment, allocation, cycle counting and shipping. Waves, picking methods, slotting and labor are [Picking, Packing & Labor](/books/logistics/warehouse-operations); robots and controls are [Warehouse Automation](/books/logistics/warehouse-automation); the gate and the doors are [Yard Management & Dock Scheduling](/books/logistics/yard-and-dock); and billing clients for all of it is [Contract Logistics & 3PL Billing](/books/logistics/contract-logistics). It extends `facilities`, `items`, `lots` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

## How the Platforms Do It

As of November 2026, from vendor documentation, product pages and filings:

| Vendor | Product | What its public material shows |
| --- | --- | --- |
| **Blue Yonder** | Warehouse Management | Labor management to "measure performance accurately, uncover improvement opportunities"; machine vision for "yard visibility" with the yard, dock and trailers connected; a Warehouse Operations Agent and separate Workforce & Labor Management and Mobility & Automation products |
| **Infios** (formerly Körber Supply Chain Software) | WMS, WCS, labor management, YMS | "Körber Supply Chain Software is now Infios"; "5,000 +" customers in 70+ countries and "1600+" WMS customers with 99% retention, by its own count; labor standards with "personal time, fatigue and delay allowances" |
| **Manhattan Associates** | Manhattan Active Warehouse Management | "Warehouse management, labor management, and slotting optimization run together in one cloud-native application," "versionless," with "an embedded, vendor-agnostic WES" and Order Streaming that keeps work moving "without waiting for the next wave"; company revenue $1,081.4 million in 2025, $408.1 million of it cloud subscription, and $2,232.2 million of remaining performance obligations at December 31, 2025 |
| **Microsoft** | Dynamics 365 Supply Chain Management, Warehouse management | Wave templates processed manually, automatically or at weight, shipment and line thresholds; location directives with consolidate, empty-location, FEFO and FIFO strategies; cycle counting by threshold, plan or spot count, with the expected quantity never shown to the counter |
| **Oracle** | Warehouse Management Cloud | Thirteen location types from Active and Reserve to Yard and VAS; inbound and outbound LPNs with a published status set; four replenishment modes; a reslotting workbench that matches item velocity to location rank; cycle count approval rules by quantity or cost tolerance |

SAP's Extended Warehouse Management is the other large suite, inside S/4HANA or deployed separately; its documentation portal did not render for this survey, so it is named here and not characterized.

Three patterns:

- **The vocabulary is shared, the names are not.** Every product has locations with types and sequences, license plates, directed putaway, replenishment from reserve to pick faces, waves or their replacement, and counts. Oracle calls a putaway rule a putaway type with rules that "override the SKU's default"; Microsoft calls the same thing a location directive. A system integrating with several WMSs maps them onto one model rather than adopting one vendor's names.
- **Configuration is the product.** The behavior a building gets is in its rule tables: which location type a hazardous item goes to, which strategy runs first, which tolerance sends a count for approval. Those are rules as data, versioned and tested, which is the reason Microsoft ships acceptance tests for location directives ([Rules as Data](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)).
- **The WMS is absorbing its neighbors.** Labor management, slotting, warehouse execution and yard visibility used to be separate products bolted on; Manhattan's page sells them as one application and Blue Yonder's as one platform. The data model keeps them as separate concerns linked by tasks and locations, whatever the packaging.

## The Building as Data

A facility in the core model is a dock with an operator and a time zone. Inside a warehouse it becomes a tree: the building, its zones (ambient, chilled, frozen, hazardous, high-value cage, bonded, automated), and its locations. A location is any addressable place inventory can be, and its type decides what the system may do with it. Oracle's location master lists thirteen: Active, Consolidation, Dock, Pack and Hold, Yard, Packing Station, Drop, QC, Reserve, Staging Location, Receiving Station, VAS and Shipping Location. The working distinction is between **reserve** locations, which hold full plates in racking ("systematic locations used to track IBLPNs in the warehouse," in Oracle's words), and **active** locations, the pick faces that hold loose units and are refilled from reserve. Drop zones and staging lanes are in-between places; Oracle notes that orders "cannot be allocated to Drop Zones," which is the rule that keeps in-transit stock from being promised twice.

Each location carries:

- **Coordinates.** Area, aisle, bay, level and position (Oracle adds bin), printed as a barcode on the rack label. The barcode is what a scanner reads; the coordinates are what travel and slotting compute from.
- **Sequences.** A pick sequence orders the walk, and Oracle stores it as an alphanumeric string, not a number; a putaway sequence orders where reserve stock goes, and Oracle recommends starting it at 10000 so every value has the same digits. Both are the cheapest routing a building has: sort tasks by sequence and the picker walks a serpentine without an optimizer.
- **Capacity.** Minimum and maximum units, maximum plates and minimum and maximum volume in Oracle's model; weight limits in others. Capacity is what lets directed putaway refuse a pallet that won't fit.
- **A lock.** Locking a location in Oracle gives "all inventory stored in this location" the lock code, and any plate later moved there inherits it. A lock is how a spill, a damaged rack upright or a recall freezes a place without touching each balance by hand.

## Items, Units and Packaging

An item ships in more than one unit. A case of 12 inner packs of 6 eaches, stacked 10 cases to a layer and 5 layers to a pallet, is five units of measure (each, inner, case, layer, pallet) for one SKU, each with its own dimensions, weight and often its own GTIN (a case GTIN differs from the each's). The WMS needs the whole ladder: receiving counts cases, reserve stores pallets, a pick face holds eaches, a store order asks for inners, and cartonization needs each unit's cube. The pallet pattern (cases per layer and layers per pallet, the "ti" and "hi") is what receiving checks a supplier's pallet against and what putaway uses to judge a full plate. The core `items` row carries the base unit's weight; the ladder is its own table, keyed by item and unit, because every conversion the floor makes (12 eaches is one inner) must come from data, not from a hard-coded multiplier.

Items also carry the handling flags the building enforces: lot-tracked, serial-tracked, expiry-tracked, hazardous (and its class, which [Hazardous Materials in Transport](/books/logistics/hazmat-in-transport) owns for the road), temperature range and stackability. Oracle's item master carries a "require batch number" flag that decides whether receiving prompts for a lot; Microsoft gates its FEFO strategy on the item being batch-enabled.

## License Plates

A license plate number (LPN) is the building's identifier for a container it tracks as one thing: a pallet, a case, a tote, a cart. Scanning one plate moves everything on it, which is why plates exist at all; a pallet of 60 cases moves in one scan instead of 60. Oracle distinguishes the **inbound LPN** (IBLPN), the plate on received stock, from the **outbound LPN** (OBLPN), "an LPN that is packed for shipping," and notes that for a full-plate allocation "the IBLPN equals the OBLPN": a full pallet picked whole ships under the plate it arrived with.

A plate has a life the system tracks as a status. Oracle's inbound plate moves through Quality Check, In Receiving, Received ("received with no location specified"), Located ("located to a WMS location (Dock, Reserve, Drop, etc.)"), Reserved, Partly Allocated, Allocated, Consumed (emptied into an active location) and Lost ("lost during cycle counting or when a short pick is confirmed"). Plates nest: cases on a pallet, totes on a cart, and a parent move carries its children.

Three identifiers get confused here, and the model keeps them apart:

- **The LPN** is the building's, unique in the building while the plate is live, and often reused after it ships or empties.
- **The SSCC** is GS1's 18-digit Serial Shipping Container Code, assigned by the company that built the pallet or carton and printed in a GS1-128 barcode; it is unique across companies and is what an ASN names ([GS1-128 Labels and SSCC](/books/commerce/edi#gs1-128-labels-and-sscc)). A building can adopt a supplier's SSCC as its inbound plate, or apply its own plate and record the SSCC beside it.
- **The handling unit** in the core model is a pallet or carton on a shipment, with the dimensions and weight a carrier rates. An inbound handling unit (as the supplier's ASN described it) becomes one or more plates at receiving; an outbound plate becomes a handling unit on a shipment at packing. The two are linked, never merged, because a plate exists for months in racking with no shipment at all, and `handling_units.shipment_id` is required.

## Inventory: Where, What, Whose and in What Condition

The WMS's inventory is a set of balances, each a quantity of one item at one location, on one plate or loose, distinguished by every attribute the business must keep apart:

- **Owner.** In a 3PL building, the same SKU from two clients is two inventories that must never be picked for each other's orders, even when the two clients' cases look identical. The model puts `owner_party_id` on every balance, not on the item or the location.
- **Lot, serial and expiry.** Oracle captures lot "in receiving and maintained up until shipping"; the lot row in the core model holds its expiry. Traceability depends on the lot never being dropped at any move ([Lots, Serials, Expiry and Kits](/books/commerce/inventory#lots-serials-expiry-and-kits) covers the seller's view).
- **Inventory status.** Available, quality hold, quarantine, damaged, customs hold, expired or recall hold. Only available stock allocates; a status change is a movement, recorded like any other.
- **Received date.** FIFO allocation reads it, and so does storage billing ([Contract Logistics & 3PL Billing](/books/logistics/contract-logistics)).
- **Owner-defined attributes.** Country of origin, grade, a purchase order or a customs entry number when a client needs stock kept apart by it. Oracle has configurable inventory attributes with formatting rules and value lists for this; they belong in a typed column set or a validated JSON field, never in a free-text note.

Balances change only through **movements**, an append-only ledger: receipt, putaway, move, replenish, pick, pack, ship, status change, owner transfer, count and adjustment, each with a from and a to, a quantity, the task or document that caused it, the actor (a worker, a device or a robot), the time it happened and the time it was recorded. The balance is the running sum, maintained in the same transaction as the movement, so a balance can always be rebuilt and a discrepancy traced to the scan that caused it. This is the same rule Commerce applies to sellable stock ([Movements, Not Overwrites](/books/commerce/inventory#movements-not-overwrites)), at the finer grain of location and plate. Scans arrive from handheld devices that retry on poor Wi-Fi, so each movement carries an idempotency key from the device ([Idempotency](/docs/requests/idempotency)).

## Receiving

Stock arrives against a notice. The supplier's or client's advance ship notice (an X12 856, or a 943 when a depositor sends stock to its own 3PL) lists what is on the trailer, ideally by SSCC; Oracle describes the ASN as "similar to a packing list" and usually "the entire contents of an inbound trailer." Commerce's chapter covers why the notice is a contract and how a brand tracks it ([Receiving and Inbound](/books/commerce/warehouses-and-3pls#receiving-and-inbound)); the building's side is the receipt.

A receipt starts when the trailer is checked in at a door, which is a yard event ([Yard Management & Dock Scheduling](/books/logistics/yard-and-dock)). Oracle uses appointments for exactly this measure, tracking "planned and actual arrival time and the lead-time from the trailer's check-in time to the receipt of the first LPN." The seal is read and compared with the notice. Then one of three modes:

- **ASN plate receiving.** Each pallet's SSCC is scanned and accepted as described, without opening it; Microsoft's location directives can locate "by license plate" so the whole plate goes to one place.
- **Detail receiving.** Cases or units are counted against the notice's lines, capturing lot, expiry and serials where the item requires them (Oracle prompts for batch, expiry, inventory attributes and serial numbers at this step).
- **Blind receiving.** No notice, or a notice the building doesn't trust; the receiver counts without seeing the expected quantity, and the receipt is reconciled afterward.

Overages, shortages and damage are recorded per line before stock is put away, as `osd_exceptions` rows the LTL chapter already defines ([LTL Networks](/books/logistics/ltl-networks#how-to-build-it)), with photos as documents; the gap becomes a claim against the supplier or the carrier ([Cargo Liability & Claims](/books/logistics/cargo-claims)). Stock that needs inspection is received to a QC location or status, and only a release makes it available. The building then sends a receipt advice (a 944 to a depositor, or an API callback), and the receipt closes. The time from check-in to closed is dock-to-stock, the measure a client's SLA names.

## Putaway

Directed putaway chooses a location for each received plate. The rules are ordered strategies with fallbacks, and the vendors express them the same way. Microsoft's example is two actions in sequence: **consolidate** with existing stock of the same item, and if that fails, **empty location with no incoming work** ("a location is considered empty if it has no physical inventory and no expected incoming work"); a third action handles overflow, or work creation fails, per a setting. Oracle assigns each item a putaway type and lets rules "override the SKU's default putaway type," with the hazardous flag as its own example, then evaluates priorities over location size types.

The constraints a putaway engine checks are the location's: its zone (temperature, hazmat segregation, security), its capacity in volume, weight and plates, whether it allows mixing items or lots, and whether another task is already bound for it. That last check matters most: two forklifts sent to the same empty slot is the classic putaway bug, and the fix is to reserve the destination when the task is created, inside the same transaction that picks it ([Optimistic Concurrency for Everything Else](/docs/building-blocks/reservations-and-holds#optimistic-concurrency-for-everything-else)).

## Replenishment

Pick faces hold a few days of stock and are refilled from reserve. Oracle defines replenishment as "the movement of inventory from reserve storage locations to picking storage locations" and supports four triggers: **minimum capacity** (the face falls below a minimum), **percentage of max** (its volume falls below a share of capacity), **reactive** (a picker scans an empty face) and **order based** (a wave's demand exceeds what the face holds). Microsoft adds demand-based replenishment as a step inside a wave and an "immediate replenishment template" that fires when a pick can't allocate. The design consequence is a dependency: a pick task that needs a replenishment first must be held until the replenishment completes, which Oracle supports as holding and releasing "replenishment dependent picking tasks." Replenishment tasks, their priorities and their place in the floor's work queue are [Picking, Packing & Labor](/books/logistics/warehouse-operations)'s.

## Allocation

Allocation reserves specific balances for an order line. Oracle defines it as "the process of matching an outbound order with LPNs available in the inventory." The rules decide which balance wins:

- **FEFO.** First expired, first out, for lot-tracked goods; Microsoft's "FEFO batch reservation" strategy is valid only for batch-enabled items.
- **FIFO by received date,** for goods without expiry; Microsoft's "location aging FIFO" exists for exactly that case.
- **Minimum remaining shelf life.** A grocer may refuse product with fewer than a set number of days left; the rule is per customer, often per item, and it is what keeps FEFO from shipping a lot the receiver will reject.
- **Unit and plate fit.** Prefer a full plate for a full-pallet quantity (Microsoft's "round up to a full LP," and Oracle's full-LPN allocation where the IBLPN ships as the OBLPN), cases from case-pick faces, eaches from each faces.
- **Owner and status,** always: an allocation can't cross owners and never touches stock that isn't available.

Allocation races are real, because waves for different orders allocate the same faces at once. Each allocation updates the balance's allocated quantity under a row lock or a version check, and a balance's allocated quantity can never exceed its quantity; a query that reads free stock locks the rows it will take and skips rows another allocator holds.

## Cycle Counting

No building stays accurate on its own. Cycle counting audits locations continuously instead of shutting down for a wall-to-wall physical inventory, and it is triggered four ways across the vendors:

- **By plan,** a schedule of locations or items. Microsoft's plans set a maximum number of counts and the days between counts; with five days between counts, a location counted on day 3 is next counted on day 8.
- **By threshold.** When a location falls below a count, it is counted while it's nearly empty and cheap to count. Microsoft's example: 60 units with a threshold of 40, a pick of 25 leaves 35, and counting work is created.
- **Opportunistically.** Oracle prompts the picker who empties a location to confirm it "reached zero"; a "no" creates a count task.
- **By exception,** after a short pick, a found overage or a mis-scan.

Two rules protect the count's honesty. **The counter doesn't see the expected quantity**: Microsoft says the app "never shows the expected quantity to count," because a shown number invites confirming it. **Variances above a tolerance need a second person**: Oracle's approval rules send a count for approval when the variance passes a quantity or cost threshold (its example: an item with a unit cost of 60 and a 10% tolerance, so a count of 99 or 101 against 100 doesn't need approval), and Microsoft sets a count to pending review when a worker who isn't a count supervisor enters a value outside their deviation limit. An approved count posts an adjustment movement with a reason code, valued at the item's cost, which is how shrink reaches the books. In a 3PL building the adjustment is also a liability question under the client's contract ([Contract Logistics & 3PL Billing](/books/logistics/contract-logistics)).

## Shipping and Loading

Picked and packed stock leaves as outbound plates: a carton or a pallet with a label, a weight and, for retail, an SSCC on a GS1-128 label the receiver will scan against its ASN. At packing the WMS creates the core model's handling units on the outbound shipment (dimensions, weight, SSCC) and links each to its plate; at loading, a scan of each plate onto the trailer at a door confirms that what the bill of lading lists is what went on the truck, and Oracle supports both loading and unloading an OBLPN, because a mis-load found before the doors close is cheap and one found at the consignee's dock is a claim. Ship confirmation closes the shipment, decrements the balances, sends the 945 or 856 and the carrier's manifest, and starts the carrier's clock. How loads are built (cube, weight, stop sequence) is [Load Planning & Optimization](/books/logistics/load-planning#cube-weight-and-floor-space); the 940/945 exchange with a depositor is in [Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl).

## How to Build It

The core model has facilities, items, lots and handling units; the WMS adds what is inside a facility. Zones and locations make the building addressable, a packaging table holds each item's unit ladder, plates track containers, balances hold the quantities by location, plate, owner, lot and status, movements are the ledger that changes them, and receipts and cycle counts are the two audited processes that create most adjustments. All `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE facilities
  ADD COLUMN wms_system   TEXT,            -- null: no WMS; 'self'; or the external WMS mirrored
  ADD COLUMN multi_client BOOLEAN NOT NULL DEFAULT FALSE;  -- holds stock for several owners

ALTER TABLE items
  ADD COLUMN expiry_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN base_uom       TEXT,          -- the unit balances are kept in, e.g. 'EA'
  ADD COLUMN storage_temp   TEXT,          -- 'ambient', 'chilled', 'frozen'
  ADD COLUMN min_ship_life_days SMALLINT;  -- the owner's default; customers can require more

ALTER TABLE lots
  ADD COLUMN country_of_origin CHAR(2);    -- kept apart in stock when a client or entry needs it

CREATE TABLE warehouse_zones (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id UUID NOT NULL REFERENCES facilities (id),
  code        TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('ambient', 'chilled', 'frozen', 'hazmat',
                'secure', 'bonded', 'automated', 'outdoor')),
  UNIQUE (facility_id, code)
);

CREATE TABLE warehouse_locations (       -- any addressable place inventory can be
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  zone_id          UUID REFERENCES warehouse_zones (id),
  barcode          TEXT NOT NULL,        -- as printed on the rack label
  kind             TEXT NOT NULL CHECK (kind IN ('receiving', 'dock', 'qc', 'reserve',
                     'active', 'drop', 'staging', 'pack_station', 'vas', 'consolidation',
                     'pack_and_hold', 'shipping', 'yard', 'automation_port')),
  aisle            TEXT,
  bay              TEXT,
  level            TEXT,
  position         TEXT,
  pick_sequence    TEXT,                 -- alphanumeric; sorting by it is the walk
  putaway_sequence TEXT,
  max_volume_cm3   BIGINT CHECK (max_volume_cm3 > 0),
  max_weight_g     BIGINT CHECK (max_weight_g > 0),
  max_lpns         SMALLINT CHECK (max_lpns >= 0),
  allows_mixed_items BOOLEAN NOT NULL DEFAULT FALSE,
  allows_mixed_lots  BOOLEAN NOT NULL DEFAULT FALSE,
  allocatable      BOOLEAN NOT NULL,     -- false for drop, staging and dock
  lock_code        TEXT,                 -- a locked location holds everything in it
  status           TEXT NOT NULL CHECK (status IN ('active', 'locked', 'retired')),
  UNIQUE (facility_id, barcode),
  CHECK (status <> 'locked' OR lock_code IS NOT NULL)
);

CREATE TABLE item_packagings (           -- the unit ladder: each, inner, case, layer, pallet
  item_id   UUID NOT NULL REFERENCES items (id),
  uom       TEXT NOT NULL,               -- 'EA', 'IP', 'CS', 'LY', 'PL'
  base_qty  INT NOT NULL CHECK (base_qty > 0),  -- base units in one of these
  gtin      TEXT,                        -- a case GTIN differs from the each's
  length_mm INT CHECK (length_mm > 0),
  width_mm  INT CHECK (width_mm > 0),
  height_mm INT CHECK (height_mm > 0),
  weight_g  BIGINT CHECK (weight_g > 0),
  ti        SMALLINT,                    -- on the pallet row: cases per layer
  hi        SMALLINT,                    -- and layers per pallet
  PRIMARY KEY (item_id, uom)
);

CREATE TABLE warehouse_lpns (            -- a container the building tracks as one thing
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id UUID NOT NULL REFERENCES facilities (id),
  lpn         TEXT NOT NULL,             -- the building's plate; reused after it retires
  kind        TEXT NOT NULL CHECK (kind IN ('inbound', 'outbound', 'tote', 'cart')),
  parent_id   UUID REFERENCES warehouse_lpns (id),  -- cases on a pallet, totes on a cart
  location_id UUID REFERENCES warehouse_locations (id),
  sscc        CHAR(18),                  -- GS1 AI (00), the supplier's or the building's
  inbound_handling_unit_id UUID REFERENCES handling_units (id),  -- as the ASN described it
  status      TEXT NOT NULL CHECK (status IN ('expected', 'in_receiving', 'received',
                'located', 'partly_allocated', 'allocated', 'picked', 'packed', 'loaded',
                'shipped', 'consumed', 'lost', 'void')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at  TIMESTAMPTZ,               -- shipped, consumed, lost or void
  CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE UNIQUE INDEX warehouse_lpns_live_idx ON warehouse_lpns (facility_id, lpn)
  WHERE retired_at IS NULL;

ALTER TABLE handling_units
  ADD COLUMN warehouse_lpn_id UUID;        -- the outbound plate this unit was packed as

CREATE TABLE inventory_balances (        -- what is where, whose, in what condition
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  location_id      UUID NOT NULL REFERENCES warehouse_locations (id),
  lpn_id           UUID REFERENCES warehouse_lpns (id),  -- null: loose in an active location
  owner_party_id   UUID NOT NULL REFERENCES parties (id),
  item_id          UUID NOT NULL REFERENCES items (id),
  lot_id           UUID REFERENCES lots (id),
  serial_number    TEXT,
  inventory_status TEXT NOT NULL CHECK (inventory_status IN ('available', 'qc_hold',
                     'quarantine', 'damaged', 'customs_hold', 'expired', 'recall_hold')),
  attributes       JSONB NOT NULL DEFAULT '{}',  -- owner-defined, validated against a schema
  received_on      DATE NOT NULL,        -- in the facility's zone; FIFO and storage read it
  quantity         NUMERIC(14, 3) NOT NULL CHECK (quantity >= 0),  -- in items.base_uom
  allocated_qty    NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (allocated_qty >= 0),
  version          BIGINT NOT NULL DEFAULT 0,
  CHECK (allocated_qty <= quantity),
  UNIQUE NULLS NOT DISTINCT (location_id, lpn_id, owner_party_id, item_id, lot_id,
    serial_number, inventory_status, received_on)
);

CREATE TABLE inventory_movements (       -- the ledger; balances are its running sum
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id     UUID NOT NULL REFERENCES facilities (id),
  kind            TEXT NOT NULL CHECK (kind IN ('receipt', 'putaway', 'move', 'replenish',
                    'pick', 'pack', 'ship', 'status_change', 'owner_transfer', 'count',
                    'adjust', 'unreceive')),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  lot_id          UUID REFERENCES lots (id),
  quantity        NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  from_balance_id UUID REFERENCES inventory_balances (id),  -- null: into the building
  to_balance_id   UUID REFERENCES inventory_balances (id),  -- null: out of it
  reason_code     TEXT,                  -- required on adjustments and counts
  task_id         UUID,                  -- the warehouse task that did it
  receipt_id      UUID,
  order_line_id   UUID REFERENCES order_lines (id),
  shipment_id     UUID REFERENCES shipments (id),
  actor_kind      TEXT NOT NULL CHECK (actor_kind IN ('worker', 'automation', 'system',
                    'integration')),
  actor_ref       TEXT NOT NULL,         -- the worker, robot cell or interface
  device_ref      TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,  -- the scan
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT NOT NULL UNIQUE,  -- device plus its scan sequence
  CHECK (from_balance_id IS NOT NULL OR to_balance_id IS NOT NULL),
  CHECK (kind NOT IN ('adjust', 'count', 'unreceive') OR reason_code IS NOT NULL)
);
CREATE INDEX ON inventory_movements (facility_id, occurred_at);
CREATE INDEX ON inventory_movements (item_id, lot_id, occurred_at);

CREATE TABLE warehouse_receipts (        -- one delivery received against its notice
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  owner_party_id   UUID NOT NULL REFERENCES parties (id),
  shipment_id      UUID REFERENCES shipments (id),    -- the inbound shipment, from the ASN
  asn_document_id  UUID REFERENCES documents (id),    -- the 856 or 943 as received
  stop_id          UUID REFERENCES stops (id),        -- the delivery stop: appointment, dwell
  trailer_id       UUID REFERENCES equipment_units (id),
  seal_expected    TEXT,
  seal_found       TEXT,
  mode             TEXT NOT NULL CHECK (mode IN ('asn_lpn', 'asn_detail', 'blind')),
  status           TEXT NOT NULL CHECK (status IN ('expected', 'checked_in', 'receiving',
                     'received', 'verified', 'closed', 'cancelled')),
  checked_in_at    TIMESTAMPTZ,
  first_lpn_at     TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ,          -- check-in to here is dock-to-stock
  advice_document_id UUID REFERENCES documents (id)   -- the 944 or callback sent back
);

CREATE TABLE warehouse_receipt_lines (   -- expected against received, per item and lot
  receipt_id       UUID NOT NULL REFERENCES warehouse_receipts (id),
  line_number      INT NOT NULL,
  item_id          UUID NOT NULL REFERENCES items (id),
  lot_id           UUID REFERENCES lots (id),
  uom              TEXT NOT NULL,
  expected_qty     NUMERIC(14, 3) NOT NULL DEFAULT 0,
  received_qty     NUMERIC(14, 3) NOT NULL DEFAULT 0,
  damaged_qty      NUMERIC(14, 3) NOT NULL DEFAULT 0,
  osd_exception_id UUID REFERENCES osd_exceptions (id),
  PRIMARY KEY (receipt_id, line_number)
);

CREATE TABLE cycle_counts (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id     UUID NOT NULL REFERENCES facilities (id),
  location_id     UUID NOT NULL REFERENCES warehouse_locations (id),
  trigger         TEXT NOT NULL CHECK (trigger IN ('plan', 'threshold', 'pick_to_zero',
                    'short_pick', 'spot', 'audit', 'wall_to_wall')),
  status          TEXT NOT NULL CHECK (status IN ('open', 'counted', 'pending_review',
                    'approved', 'rejected', 'cancelled')),
  counted_by_ref  TEXT,
  counted_at      TIMESTAMPTZ,
  approved_by_ref TEXT,                  -- never the counter
  approved_at     TIMESTAMPTZ,
  CHECK (approved_by_ref IS NULL OR approved_by_ref <> counted_by_ref)
);

CREATE TABLE cycle_count_lines (
  cycle_count_id UUID NOT NULL REFERENCES cycle_counts (id),
  balance_id     UUID REFERENCES inventory_balances (id),  -- null: found stock not on record
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  lot_id         UUID REFERENCES lots (id),
  lpn_id         UUID REFERENCES warehouse_lpns (id),
  system_qty     NUMERIC(14, 3) NOT NULL,  -- snapshot at the count; never shown to the counter
  counted_qty    NUMERIC(14, 3) NOT NULL CHECK (counted_qty >= 0),
  variance_qty   NUMERIC(14, 3) GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
  variance_value BIGINT,                 -- minor units at the item's cost
  currency       CHAR(3),
  movement_id    UUID REFERENCES inventory_movements (id)  -- the adjustment, once approved
);

ALTER TABLE handling_units ADD CONSTRAINT handling_units_warehouse_lpn_fkey
  FOREIGN KEY (warehouse_lpn_id) REFERENCES warehouse_lpns (id) NOT VALID;
CREATE INDEX CONCURRENTLY handling_units_warehouse_lpn_idx ON handling_units (warehouse_lpn_id);
ALTER TABLE handling_units VALIDATE CONSTRAINT handling_units_warehouse_lpn_fkey;
```

Allocation reads free stock in rule order and locks what it takes. FEFO with a customer's minimum remaining shelf life, then FIFO, then the walk:

```sql
SELECT b.id, l.barcode, lo.lot_code, lo.expires_on, b.quantity - b.allocated_qty AS free_qty
FROM inventory_balances b
JOIN warehouse_locations l ON l.id = b.location_id
LEFT JOIN lots lo ON lo.id = b.lot_id
WHERE b.facility_id = $1
  AND b.owner_party_id = $2
  AND b.item_id = $3
  AND b.inventory_status = 'available'
  AND l.allocatable AND l.status = 'active'
  AND b.quantity > b.allocated_qty
  AND (lo.expires_on IS NULL OR lo.expires_on >= $4::date + $5::int)  -- $4: today at the facility
ORDER BY lo.expires_on NULLS LAST, b.received_on, l.pick_sequence
FOR UPDATE OF b SKIP LOCKED;
```

Design notes:

- **Balances are derived, movements are the record.** Every balance change is a movement in the same transaction; a nightly job that rebuilds balances from movements and compares them is the cheapest integrity check a WMS can run.
- **Owner on every balance.** A 3PL building is multi-tenant at the row level; allocation, counts, adjustments and billing all filter on `owner_party_id`, and an owner transfer (a client selling stock to another client in place) is a movement, not an edit ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)).
- **Plates and handling units link, never merge.** A plate lives in racking without a shipment; a handling unit exists only on one. Inbound units become plates at receipt, outbound plates become units at packing, and the link is what traces a customer's damaged pallet back to the bin it was picked from.
- **Status is a dimension, not a flag.** Damaged, held and quarantined stock are separate balances, so a hold never hides the quantity and a release is a recorded move.
- **Local dates for date rules.** Received dates, expiry checks and count schedules use the facility's time zone ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)); a server clock in UTC ships a lot a day early.
- **Counts are separated duties.** The system quantity is captured but hidden, approval is by someone other than the counter, and the adjustment posts only on approval, with a reason and a value.
- **Mirror an external WMS by reference.** When the WMS is a vendor's, this system keeps balances by owner, item, lot and status from its snapshots and transaction feeds and keys them by the vendor's identifiers; it doesn't direct tasks it can't see ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Emit the floor's events.** `receipt.closed`, `inventory.adjusted`, `inventory.status_changed`, `lpn.shipped` and `cycle_count.approved` are what billing, the owner's inventory feed and accounting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every movement,** with its actor, device, task, from and to, and both times; the ledger is the answer to "where did it go."
- **Every receipt,** the notice as received, the seal expected and found, expected against received and damaged per line, the OS&D exceptions with photos, and the advice sent back.
- **Every count and adjustment,** the hidden system quantity, the count, the variance and its value, the approver and the reason, so shrink can be tested and a client's loss claim answered.
- **Every status change,** from available to hold and back, with who released it; a recall or a customs hold must show it was respected.
- **Lot genealogy across moves,** so a lot's every location and every shipment that carried it can be listed without gaps (Lot & Serial Traceability, later in this volume, builds on it).
- **Configuration history,** location types, putaway rules, allocation strategies and count tolerances with their effective dates, because "why did it send that pallet there" is answered by the rule in force at the time ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

## What This Means for the System You Build

- **Model the building as zones and typed locations** with coordinates, sequences, capacity and locks, and keep drop and staging places unallocatable.
- **Keep each item's unit ladder as data,** with dimensions and GTINs per unit, and convert only through it.
- **Track containers as license plates,** separate from shipment handling units, and link the two at receipt and packing.
- **Key every balance by location, plate, owner, item, lot and status,** and change it only through an append-only movement with an idempotency key.
- **Receive against the notice, record OS&D before putaway,** and measure dock-to-stock from check-in to close.
- **Reserve putaway destinations and allocated stock in the same transaction** that chooses them, with FEFO, FIFO and shelf-life rules as ordered, versioned data.
- **Count continuously, blind, with approval above tolerance** by someone other than the counter.
- **Scan plates onto the trailer** and close the shipment from the scans, not from the plan.

## References

**Filings and statistics**

- [Manhattan Associates: Fourth quarter and full year 2025 results (Form 8-K, Exhibit 99.1, January 27, 2026)](https://www.sec.gov/Archives/edgar/data/1056696/000119312526024382/manh-ex99_1.htm), 2025 revenue, cloud subscription revenue and remaining performance obligations
- [U.S. Bureau of Labor Statistics: Warehousing and Storage, NAICS 493](https://www.bls.gov/iag/tgs/iag493.htm), employment in October 2026 (preliminary)

**WMS documentation**

- [Oracle Warehouse Management Cloud: Definitions](https://docs.oracle.com/en/cloud/saas/warehouse-management/26c/owmol/definitions.html), WMS, ASN, LPN, OBLPN, reserve location, drop zone and allocation
- [Oracle Warehouse Management Cloud: Location Master](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/location-master.html), location types, coordinates, pick and putaway sequences, capacity and lock codes
- [Oracle Warehouse Management Cloud: IBLPN Statuses](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/iblpn-statuses.html), the inbound plate's statuses
- [Oracle Warehouse Management Cloud: Lot Management](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/lot-management.html), lots captured at receipt and kept to shipping, and the require-batch flag
- [Oracle Warehouse Management Cloud: Appointments](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/appointments.html), planned and actual arrival and check-in to first LPN
- [Oracle Warehouse Management Cloud: Putaway Rules](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/putaway-rules.html), rules that override an item's default putaway type
- [Oracle Warehouse Management Cloud: Replenishment](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/overview-of-replenishment.html), the definition and the four triggers
- [Oracle Warehouse Management Cloud: Online Help contents](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/toc.htm), receiving prompts for batch, expiry, attributes and serials, replenishment-dependent picking tasks, inventory attributes, and loading and unloading OBLPNs
- [Oracle Warehouse Management Cloud: Opportunistic Cycle Count](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/opportunistic-cycle-count.html), the pick-to-zero prompt and threshold counts
- [Oracle Warehouse Management Cloud: Cycle Count Adjustment Approval Rule](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/selection-criteria-button.html), quantity and cost tolerances and the 10% example
- [Oracle Warehouse Management Cloud: Reslotting Workbench](https://docs.oracle.com/en/cloud/saas/warehouse-management/26d/owmol/optimize-pick-locations-with-reslotting-workbench.html), velocity against location rank
- [Microsoft: Wave templates](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wave-templates), manual, automatic and threshold wave processing
- [Microsoft: Work with location directives](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/create-location-directive), putaway and pick strategies, locate by license plate, acceptance tests and the consolidate-then-empty example
- [Microsoft: Cycle counting](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting), thresholds, plans, spot counts, the hidden expected quantity and pending review

**Vendors**

- [Manhattan Associates: Warehouse Management](https://www.manh.com/solutions/supply-chain-management-software/warehouse-management), one application for WMS, labor and slotting, versionless, embedded WES and Order Streaming
- [Blue Yonder: Warehouse Management](https://blueyonder.com/solutions/warehouse-management), labor measurement, automation and yard visibility
- [Infios](https://www.infios.com/), the rename from Körber Supply Chain Software and its customer counts
- [Infios: Labor Management](https://www.infios.com/en/supply-chain-solutions/labor-management), standards with personal, fatigue and delay allowances
