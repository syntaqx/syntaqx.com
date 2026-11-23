+++
title = "Lot & Serial Traceability"
description = "Tracing what went into what and where it went: lots and serials, GS1 keys, genealogy, one-up one-down, as-built records and EPCIS 2.0 events."
category = "Logistics & Supply Chain Industry"
order = 2862
part = "Manufacturing"
tags = ["logistics", "manufacturing", "traceability", "genealogy", "gs1", "epcis", "serialization", "data-model"]
+++

Traceability is the ability to answer two questions about any unit of goods, quickly and from records: where did it come from, and where did it go. A spice supplier's lot tests positive for Salmonella; the seasoning plant needs every batch of seasoning that used it, every snack lot made with those batches, and every distribution center and store that received them. A brake caliper fails; the automaker needs the caliper's serial, the casting lot inside it, the furnace run that cast the lot, and every other vehicle that got a caliper from that run. Each answer is a walk over records: receipts and shipments outside the plant, consumption and production inside it.

It is hard because the walk crosses systems and companies, and every link is a record somebody had to create at the moment it happened. A receipt without the supplier's lot code, a backflush that consumed "resin" rather than "resin lot 24-118," a mixing tank that took three lots and produced one, a pallet relabeled at a 3PL, a serial number scanned into the wrong vehicle: each one breaks the chain, and the break is invisible until a recall needs it. Quantities make it harder: a lot partly consumed into many outputs, an output made from parts of many lots, a commingled bulk bin. And the identifiers are not the system's: lot codes are unique only within the item and maker, serials only within the item, and partners print them in GS1 barcodes, EPCIS events, ASNs and spreadsheets.

This chapter covers lot and serial identification and the GS1 keys that carry them, genealogy (as-built records and transformations), one-up one-down and the regulatory floors that require it, internal and external traceability, and GS1's EPCIS 2.0 event standard, with a genealogy trace in Go and Rust. It extends `lots`, `shipment_lines` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and records consumption per lot against the work orders, material lines and confirmations of [MRP, Scheduling & Work Orders](/books/logistics/production-planning#work-orders). The regulated regimes built on these records (FSMA 204 for food, DSCSA for drugs, UDI for devices) are [FSMA 204, DSCSA & UDI](/books/logistics/regulated-traceability); using them to scope a recall is [Recalls From the Manufacturer's Side](/books/logistics/manufacturing-recalls#how-to-build-it). Tracing an imported good's inputs to raw materials for forced labor review is [The Package: Tracing to Raw Materials](/books/logistics/forced-labor-and-partner-agencies#the-package-tracing-to-raw-materials), the same model extended upstream past the importer's own suppliers.

## How the Platforms Do It

As of November 2026, from the vendors' documentation, the standards and the regulations:

| System or rule | Unit traced | How the trace runs | What it requires or offers |
| --- | --- | --- | --- |
| **Microsoft Dynamics 365 Business Central** | Serial, lot or package number | Item Tracing over posted transactions, "Usage -> Origin" or "Origin -> Usage," with an option to show components | Only "applied transactions" are shown; a lot received on several transactions may not show them all |
| **Odoo** | Lot or serial number | A traceability report: the stock moves of one lot | Lots assigned at receipt or manufacture, picked by FIFO, LIFO or FEFO removal strategy |
| **GS1 EPCIS 2.0 and CBV 2.0** (ratified June 2022) | Instances (serials) and classes (GTIN plus lot), with quantities | Events of five types shared between companies; a trace is a query over events | JSON/JSON-LD and REST bindings; business steps and dispositions from the Core Business Vocabulary |
| **FDA, 21 CFR 1.345 (Bioterrorism Act records)** | Food released to the next recipient | One up, one down | The recipient, the food, the release date, the lot "to the extent this information exists," quantity, packaging and transporter; available within 24 hours of a qualifying request (1.361) |
| **FDA, 21 CFR 821.25 (device tracking)** | Each tracked device | Manufacturer to patient | The distributor and device location within 3 working days of a request, patient-level data within 10 working days |
| **DSCSA (21 USC 360eee-1)** | Each package (product identifier with serial) | Transaction information for each transaction back to the manufacturer | Exchanged "in a secure, interoperable, electronic manner"; kept 6 years |

The patterns:

- **A trace is only as good as its weakest link record.** Every platform traces over transactions it posted; Business Central's own note that only applied transactions are shown is the general rule. Genealogy is built at the moment of receipt, consumption, production and shipment, or not at all.
- **Forward and backward are the same graph.** "Where used" (from a bad input to every output and customer) and "where from" (from a failed unit to every input and supplier) are walks in opposite directions over the same edges.
- **The regulatory floor is one up, one down; the business need is the whole chain.** The law usually asks each company for its immediate source and recipient; a manufacturer needs its internal genealogy joined to both, so the chain can be assembled across companies when a regulator asks.
- **Events, not snapshots, are what partners share.** GS1's standard is an event log (what, when, where, why, how), and DSCSA and FSMA 204 data are commonly exchanged as events; the current state of a lot is a projection of them.

## Identifiers: Lots, Serials and GS1 Keys

A **lot** (batch) is a quantity made together under the same conditions and traced as one; a **serial** identifies a single unit. Which an item carries is a decision per item (`items.lot_tracked`, `items.serial_tracked`): bulk materials and consumables by lot, high-value assemblies, vehicles, devices and drug packages by serial, and many by both (a serialized device from a lot). The lot is the manufacturer's code for its own production; a buyer receiving it keeps the supplier's code and often assigns its own internal lot as well, and the link between the two is the first genealogy record.

GS1's application identifiers are how the codes travel on labels and in messages. From GS1's AI dataset:

| AI | Title | Format | Used for |
| --- | --- | --- | --- |
| (00) | SSCC | N2+N18 | A logistic unit: a pallet or carton |
| (01) | GTIN | N2+N14 | The trade item: product and pack level |
| (10) | BATCH/LOT | N2+X..20 | The lot, up to 20 alphanumeric characters |
| (11) | PROD DATE | N2+N6 | Production date, YYMMDD |
| (17) | USE BY or EXPIRY | N2+N6 | Expiry, YYMMDD |
| (21) | SERIAL | N2+X..20 | The serial, up to 20 characters, unique within the GTIN |

A serialized trade item is identified by GTIN plus serial (an SGTIN in EPC URIs, as in EPCIS's own example `urn:epc:id:sgtin:9524141.100734.400`); a lot of a trade item by GTIN plus lot. GS1 Digital Link encodes the same keys in a web URI, with the lot (10) and serial (21) as key qualifiers of the GTIN, so a QR code can carry both the identifiers and a resolvable link; the legacy Digital Link standard's current version is 1.1.4, published January 2026. The core `lots.lot_code` is already limited to AI (10)'s 20 characters, and `handling_units.sscc` holds AI (00).

Three identifier rules save later pain. Uniqueness is scoped: a lot code is unique within item and manufacturer, a serial within the item (GTIN), and two suppliers can both ship lot "A1"; the core `lots` unique key is `(item_id, manufacturer_party_id, lot_code)`. Codes are data, so receiving parses them from the scan and the ASN and compares, flagging a mismatch rather than trusting either. And dates in AIs are six digits, YYMMDD, so parse them with GS1's rules, not a generic date parser.

## Genealogy

Genealogy is the record of which inputs became which outputs. It has two shapes:

- **Lot genealogy** (process industries, food, chemicals, pharmaceuticals). Inputs are lots with quantities; a batch consumes portions of several lots and produces one or more output lots (and co-products, by-products and scrap). The edge is "this quantity of input lot A was consumed into output lot B," and one input lot fans out into many outputs, one output fans in from many inputs.
- **As-built (serial) genealogy** (discrete manufacturing: vehicles, aircraft, devices, electronics). A serialized assembly records which serialized or lot-tracked components went into it, at which position, and when; components can be removed and replaced in service, so the record has validity in time. The as-built record is what an aerospace or automotive manufacturer reads when a component lot is suspect.

The edges are created by the same transactions that move inventory: receipt (supplier lot to internal lot), issue or backflush to a work order (input lot consumed), production confirmation (output lot produced), split and merge (one lot into several, several into one), repack and relabel (same goods, new identifier), and assembly (child serial installed into parent). In the work order model of [MRP, Scheduling & Work Orders](/books/logistics/production-planning#consumption-and-backflush), `work_order_materials.consumed_quantity` is the quantity per component; traceability needs the same quantity per input lot, and `production_confirmations.output_lot_id` names the output. Backflush is where genealogy usually breaks: posting consumption at BOM quantity after the fact needs a rule for which lot was used (the lot staged to the line, the oldest lot in the location, FEFO), and that rule must be recorded with the edge, because an inferred lot is weaker evidence than a scanned one.

Three kinds of process make genealogy coarse no matter how good the system is: continuous processes (a silo refilled while it drains), commingling (a bulk tank of milk from many farms), and rework (a returned lot blended back into production). The industry answer is time windows and clean-outs: the silo's lot is the inputs received between two clean-outs, and every output in that window is linked to all of them. That widens a recall, so plants that care size the windows on purpose.

## One Up, One Down

The baseline every food company in the US already owes is one up, one down: for food it receives, the immediate previous source, and for food it releases, the immediate subsequent recipient. 21 CFR 1.345 lists what a nontransporter keeps for food it releases: the recipient's name, address and phone, "An adequate description of the type of food released," the release date, the lot or code number "to the extent this information exists," the quantity and packaging, and the transporter; and for manufacturers, ingredient source information "reasonably available to you" identifying the source of each ingredient in every lot of finished product. Under 1.361 the records are made available "as soon as possible, not to exceed 24 hours" after an official request when FDA has "a reasonable belief that an article of food" is adulterated and presents a threat of serious adverse health consequences or death (or believes there is a reasonable probability that it does).

One up, one down is a rule about the company's edges, not its interior. A plant that knows which supplier shipped which ingredient lot and which customer received which finished lot, but not which ingredient lot went into which finished lot, can only answer "everything we made in that period." The full trace has three parts, each a separate record set:

1. **One up:** receipts, with the supplier, the supplier's lot and the internal lot (from the ASN, the label scan and the receiving transaction).
2. **Internal:** lot genealogy and as-built records, from consumption and production.
3. **One down:** shipments, with the customer, the facility and the lot (and serials) on each shipment line.

FSMA 204 tightens all three for listed foods by naming the data elements and the events (see [FSMA 204: Food Traceability](/books/logistics/regulated-traceability#fsma-204-food-traceability)); devices add tracking to the patient for some products under 21 CFR 821, where the manufacturer must give FDA the distributor and location "within 3 working days" of a request and patient-level data within 10 working days; drugs add package-level serials under DSCSA. The model below serves all of them; the regulated chapter adds what each regime stores on top.

## Internal and External Traceability

Inside the company, traceability is a database query. Across companies it is an exchange, and the exchange is where the identifiers and the timing get lost. Three practices dominate:

- **On the ASN and the label.** The shipper's 856 or DESADV carries lot and serial per line or per SSCC, and the GS1-128 label carries the same in AIs (Commerce's [Ship Notices and Carton Labels](/books/commerce/edi#ship-notices-and-carton-labels) owns the retail version). The receiver matches scan to ASN and keeps both.
- **As EPCIS events.** Partners exchange events (commissioned, packed, shipped, received, transformed) through EPCIS repositories or by pushing EPCIS documents, which is the pattern drug serialization networks use for DSCSA data.
- **On request, as a spreadsheet.** For a regulator or a customer investigating, a company produces its records for a lot, filtered and sorted; FSMA 204 makes an electronic sortable spreadsheet the required format during an outbreak.

Two rules for external data. Store partners' events and documents as received, with their own identifiers and times, and map them to internal records ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)); an inbound lot code that doesn't match a known lot becomes an exception, never a silently created lot. And keep the event time and the received time separate, as the rest of this volume does ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)): EPCIS itself separates `eventTime` from `recordTime`.

## EPCIS 2.0

EPCIS (Electronic Product Code Information Services) is GS1's standard that "enables disparate applications to create and share visibility event data, both within and across enterprises." Release 2.0, ratified in June 2022 with the Core Business Vocabulary (CBV) 2.0, added JSON and JSON-LD syntax alongside XML, REST bindings alongside SOAP, a new AssociationEvent, and a "how" dimension for sensor data, among other changes.

Every event answers five questions the standard calls what, when, where, why and how:

- **What:** instance identifiers (EPCs such as an SGTIN) and class-level quantities (a GTIN and lot with a quantity and unit), a parent ID for aggregations, input and output lists for transformations.
- **When:** `eventTime`, `eventTimeZoneOffset` (the local offset where it happened, for display), and `recordTime`, "The date and time at which this event was recorded by an EPCIS Repository," which "does not describe anything about the real-world event."
- **Where:** a `readPoint` (where it was observed) and a `bizLocation` (where the objects are afterward), usually GLN-based (SGLN) identifiers, plus source and destination lists for a transfer of ownership or custody.
- **Why:** a `bizStep` (commissioning, packing, shipping, receiving, inspecting, holding and others from CBV), a `disposition` (the business state after the event: active, in_transit, recalled, destroyed, expired, conformant, non_sellable_other), optional persistent dispositions, and business transactions (the PO, the ASN, the invoice).
- **How:** sensor elements (temperature and the like) and certification information.

The five event types map onto genealogy directly:

| EPCIS event | What it records | Genealogy record it feeds |
| --- | --- | --- |
| **ObjectEvent** | Something happened to objects; action ADD (commissioned: "the EPC(s) have been issued and associated with an object (s) for the first time"), OBSERVE, or DELETE (decommissioned) | Serial creation, receipt, shipment, inspection, status |
| **AggregationEvent** | Objects "physically aggregated together," as cases to a pallet, with ADD, OBSERVE or DELETE | Handling unit contents: which serials are in which SSCC |
| **TransactionEvent** | Objects tied to a business transaction (a PO, a despatch advice) | The order or ASN link |
| **TransformationEvent** | "Input objects are fully or partially consumed and output objects are produced" | Lot consumption: inputs to outputs, with quantities |
| **AssociationEvent** | Persistent parent-child links, such as a sensor to an asset, that survive the children being disassociated | As-built and asset relationships |

Two mechanics matter for storage. An `eventID` is optional but, when present, "globally unique across all events other than error declarations" (CBV allows a UUID URI or a hash URI), so it is the natural deduplication key. And events are never edited: a wrong event is corrected by an **error declaration**, an event carrying the erroneous event's ID and the time it was declared in error, optionally pointing to corrective events, so the history shows both what was believed and what was corrected ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).

## How to Build It

Lots gain the supplier's code and their origin; one edge table records every input-to-output link with quantity and evidence; serialized units and their assembly history carry the discrete side; shipment lines and handling units name the serials they carry; EPCIS events are stored as received and mapped.

```sql
ALTER TABLE lots
  ADD COLUMN supplier_lot_code TEXT,       -- the supplier's code, when this is an internal lot
  ADD COLUMN supplier_party_id UUID REFERENCES parties (id),
  ADD COLUMN origin            TEXT,       -- how it came to exist
  ADD COLUMN produced_quantity NUMERIC(14, 3),
  ADD COLUMN uom               TEXT;
ALTER TABLE lots ADD CONSTRAINT lots_origin_check
  CHECK (origin IN ('received', 'produced', 'split', 'merged', 'repacked', 'relabeled',
    'commingled')) NOT VALID;
ALTER TABLE lots VALIDATE CONSTRAINT lots_origin_check;

ALTER TABLE documents                    -- EPCIS documents join the kinds already added
  DROP CONSTRAINT documents_kind_check,
  ADD CONSTRAINT documents_kind_check CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
    'proof_of_delivery', 'delivery_receipt', 'lumper_receipt', 'freight_invoice',
    'ocean_bill_of_lading', 'sea_waybill', 'air_waybill', 'arrival_notice',
    'commercial_invoice', 'packing_list', 'customs_entry', 'notice_of_assignment',
    'certificate_of_insurance', 'load_tender', 'tender_response', 'status_message',
    'ship_notice', 'power_of_attorney', 'customs_bond', 'bond_insufficiency_notice',
    'client_error_notice', 'planning_schedule', 'shipping_schedule', 'production_sequence',
    'application_advice', 'certificate_of_analysis', 'certificate_of_conformance',
    'ppap_submission', 'corrective_action_report', 'epcis_document', 'other')) NOT VALID;
ALTER TABLE documents VALIDATE CONSTRAINT documents_kind_check;

CREATE TABLE lot_consumptions (          -- every input-to-output edge, with its quantity
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                       TEXT NOT NULL CHECK (kind IN ('production', 'split', 'merge',
                               'repack', 'relabel', 'commingle', 'rework', 'receipt_link')),
  input_lot_id               UUID NOT NULL REFERENCES lots (id),
  output_lot_id              UUID NOT NULL REFERENCES lots (id),
  quantity                   NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),  -- of the input
  uom                        TEXT NOT NULL,
  facility_id                UUID NOT NULL REFERENCES facilities (id),
  work_order_id              UUID REFERENCES work_orders (id),
  work_order_material_id     UUID REFERENCES work_order_materials (id),
  production_confirmation_id UUID REFERENCES production_confirmations (id),
  lot_basis                  TEXT NOT NULL CHECK (lot_basis IN ('scanned', 'issued',
                               'staged_to_line', 'fefo_inferred', 'time_window', 'manual')),
  occurred_at                TIMESTAMPTZ NOT NULL,
  received_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source                     TEXT NOT NULL CHECK (source IN ('mes', 'erp', 'wms', 'epcis',
                               'manual')),
  source_ref                 TEXT NOT NULL,  -- the posting's ID: replays are no-ops
  reversed_by_id             UUID REFERENCES lot_consumptions (id),  -- a correction, never an edit
  UNIQUE (source, source_ref),
  CHECK (input_lot_id <> output_lot_id),
  CHECK (kind <> 'production' OR work_order_id IS NOT NULL)
);
CREATE INDEX ON lot_consumptions (input_lot_id);   -- where used
CREATE INDEX ON lot_consumptions (output_lot_id);  -- where from

CREATE TABLE serialized_units (          -- one physical unit with a serial
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id             UUID NOT NULL REFERENCES items (id),
  serial_number       TEXT NOT NULL CHECK (length(serial_number) <= 20),  -- GS1 AI (21)
  lot_id              UUID REFERENCES lots (id),  -- the lot it was made in, when both apply
  gtin                TEXT,              -- snapshot: the pack level it was commissioned at
  status              TEXT NOT NULL CHECK (status IN ('commissioned', 'in_stock', 'shipped',
                        'installed', 'in_service', 'returned', 'quarantined', 'recalled',
                        'scrapped', 'decommissioned')),
  current_facility_id UUID REFERENCES facilities (id),
  handling_unit_id    UUID REFERENCES handling_units (id),  -- the carton or pallet it is in now
  commissioned_at     TIMESTAMPTZ NOT NULL,
  work_order_id       UUID REFERENCES work_orders (id),
  UNIQUE (item_id, serial_number)
);
CREATE INDEX ON serialized_units (lot_id);

CREATE TABLE unit_assemblies (           -- as-built: a component in a parent, for a period
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_unit_id     UUID NOT NULL REFERENCES serialized_units (id),
  child_unit_id      UUID REFERENCES serialized_units (id),  -- a serialized component
  child_lot_id       UUID REFERENCES lots (id),               -- or a lot-tracked one
  child_item_id      UUID NOT NULL REFERENCES items (id),
  quantity           NUMERIC(14, 3) NOT NULL DEFAULT 1,
  position           TEXT,               -- reference designator or install location
  installed_during   TSTZRANGE NOT NULL, -- open-ended until removed
  work_order_id      UUID REFERENCES work_orders (id),  -- build, or the service order
  removal_reason     TEXT,
  CHECK ((child_unit_id IS NULL) <> (child_lot_id IS NULL)),
  EXCLUDE USING gist (child_unit_id WITH =, installed_during WITH &&)  -- btree_gist; one parent at a time
    WHERE (child_unit_id IS NOT NULL)
);
CREATE INDEX ON unit_assemblies (child_lot_id);

CREATE TABLE shipment_line_units (       -- the serials a shipment line carried
  shipment_line_id   UUID NOT NULL REFERENCES shipment_lines (id),
  serialized_unit_id UUID NOT NULL REFERENCES serialized_units (id),
  handling_unit_id   UUID REFERENCES handling_units (id),  -- the SSCC it shipped in
  PRIMARY KEY (shipment_line_id, serialized_unit_id)
);
CREATE INDEX CONCURRENTLY IF NOT EXISTS shipment_lines_lot_id_idx ON shipment_lines (lot_id);

CREATE TABLE epcis_events (              -- events as captured or received, never edited
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  event_id               TEXT,           -- the EPCIS eventID URI, when present
  event_type             TEXT NOT NULL CHECK (event_type IN ('ObjectEvent', 'AggregationEvent',
                           'TransactionEvent', 'TransformationEvent', 'AssociationEvent')),
  action                 TEXT CHECK (action IN ('ADD', 'OBSERVE', 'DELETE')),  -- null: transformation
  biz_step               TEXT,           -- as received, e.g. 'shipping' or a CBV URI
  disposition            TEXT,
  persistent_disposition JSONB,          -- set and unset lists
  read_point             TEXT,           -- SGLN or other location ID
  biz_location           TEXT,
  event_time             TIMESTAMPTZ NOT NULL,
  event_time_zone_offset TEXT NOT NULL,  -- '+05:30', kept for display
  record_time            TIMESTAMPTZ,    -- the repository's, when queried from one
  received_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  epc_list               TEXT[] NOT NULL DEFAULT '{}',  -- instance IDs, incl. child and input EPCs
  output_epc_list        TEXT[] NOT NULL DEFAULT '{}',
  parent_id              TEXT,
  quantities             JSONB NOT NULL DEFAULT '[]',   -- class-level: GTIN plus lot, quantity, uom
  biz_transactions       JSONB NOT NULL DEFAULT '[]',
  sources                JSONB NOT NULL DEFAULT '[]',
  destinations           JSONB NOT NULL DEFAULT '[]',
  ilmd                   JSONB,          -- instance and lot master data, as received
  sensor_elements        JSONB,
  error_declaration      JSONB,          -- set when this event declares an earlier one wrong
  partner_party_id       UUID REFERENCES parties (id),  -- who sent it; null: captured here
  document_id            UUID REFERENCES documents (id),  -- the EPCIS document it came in
  payload                JSONB NOT NULL, -- the event exactly as received
  dedupe_key             TEXT NOT NULL UNIQUE  -- event_id, or a hash of the canonical event
);
CREATE INDEX ON epcis_events USING gin (epc_list);
CREATE INDEX ON epcis_events (event_time);
```

Notes on the choices:

- **One edge table for every transformation.** Production, splits, merges, repacks, relabels and commingling are all "this much of lot A went into lot B"; one shape means one trace query. `kind` and the work order references say what kind of evidence it is.
- **The lot basis is part of the edge.** A scanned lot and a FEFO-inferred lot are different evidence; a recall scope or an auditor's question can filter on `lot_basis`, and a high share of inferred edges on a line is a process finding in itself.
- **Corrections reverse, never edit.** A wrong consumption is reversed by a new row and replaced, so the genealogy that scoped a recall last week can be reproduced ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **As-built has time.** `installed_during` lets a serviced vehicle or aircraft show which component was in it on a date; the exclusion constraint keeps a component in one parent at a time.
- **EPCIS is stored as received, then mapped.** `payload` is the event as sent; mapping workers create receipts, consumptions and unit status changes from it, and an error declaration reverses what its target created. Deduplication is on `eventID` when present, because partners resend.
- **Quantities stay in the input's unit.** Converting a 25 kg bag consumed into a batch measured in liters belongs in the item's unit conversion, applied when reporting, never stored as the edge quantity.

The where-used trace, from an input lot to every lot made from it and every shipment line that carried one, as a recursive query (the recall chapter stores its result as the recall's scope):

```sql
WITH RECURSIVE where_used (lot_id, depth, path) AS (
  SELECT $1::uuid, 0, ARRAY[$1::uuid]
  UNION ALL
  SELECT c.output_lot_id, w.depth + 1, w.path || c.output_lot_id
  FROM lot_consumptions c
  JOIN where_used w ON c.input_lot_id = w.lot_id
  WHERE c.reversed_by_id IS NULL
    AND NOT c.output_lot_id = ANY (w.path)       -- rework can loop a lot back into itself
    AND w.depth < 50
)
SELECT DISTINCT w.lot_id, l.lot_code, sl.shipment_id, s.consignee_party_id,
       s.destination_facility_id
FROM where_used w
JOIN lots l ON l.id = w.lot_id
LEFT JOIN (shipment_lines sl
           JOIN shipments s ON s.id = sl.shipment_id AND s.status <> 'cancelled')
  ON sl.lot_id = w.lot_id;                       -- a cancelled shipment drops its lines too
```

The same walk in application code, both directions, for a service that keeps a plant's genealogy in memory or answers traces from a graph store. It returns each lot reached with its shortest distance from the start and stops on cycles:

```go tab="Go"
package trace

// Edge is one lot_consumptions row: Qty of In consumed into Out.
type Edge struct {
	In, Out string // lot IDs
	Qty     float64
}

type Direction int

const (
	WhereUsed Direction = iota // forward: from an input to everything made from it
	WhereFrom                  // backward: from an output to everything that went into it
)

// Graph indexes edges both ways once, so each trace is a breadth-first walk.
type Graph struct {
	down map[string][]Edge // by input lot
	up   map[string][]Edge // by output lot
}

func NewGraph(edges []Edge) *Graph {
	g := &Graph{down: map[string][]Edge{}, up: map[string][]Edge{}}
	for _, e := range edges {
		g.down[e.In] = append(g.down[e.In], e)
		g.up[e.Out] = append(g.up[e.Out], e)
	}
	return g
}

// Trace returns every lot reachable from start with its distance in steps;
// distance 1 is one up or one down. Cycles (rework) are visited once.
func (g *Graph) Trace(start string, dir Direction, maxDepth int) map[string]int {
	dist := map[string]int{start: 0}
	queue := []string{start}
	for len(queue) > 0 {
		lot := queue[0]
		queue = queue[1:]
		if dist[lot] == maxDepth {
			continue
		}
		next := g.down[lot]
		if dir == WhereFrom {
			next = g.up[lot]
		}
		for _, e := range next {
			n := e.Out
			if dir == WhereFrom {
				n = e.In
			}
			if _, seen := dist[n]; !seen {
				dist[n] = dist[lot] + 1
				queue = append(queue, n)
			}
		}
	}
	return dist
}

// Shipped joins traced lots to the shipments that carried them.
func Shipped(lots map[string]int, shipmentsByLot map[string][]string) map[string][]string {
	out := map[string][]string{}
	for lot := range lots {
		if s, ok := shipmentsByLot[lot]; ok {
			out[lot] = s
		}
	}
	return out
}
```

```rust tab="Rust"
use std::collections::{HashMap, VecDeque};

/// One lot_consumptions row: `qty` of `input` consumed into `output`.
pub struct Edge {
    pub input: String,
    pub output: String,
    pub qty: f64,
}

#[derive(Clone, Copy, PartialEq)]
pub enum Direction {
    WhereUsed, // forward: from an input to everything made from it
    WhereFrom, // backward: from an output to everything that went into it
}

/// Edges indexed both ways once, so each trace is a breadth-first walk.
pub struct Graph<'a> {
    down: HashMap<&'a str, Vec<&'a Edge>>,
    up: HashMap<&'a str, Vec<&'a Edge>>,
}

impl<'a> Graph<'a> {
    pub fn new(edges: &'a [Edge]) -> Self {
        let mut g = Graph { down: HashMap::new(), up: HashMap::new() };
        for e in edges {
            g.down.entry(e.input.as_str()).or_default().push(e);
            g.up.entry(e.output.as_str()).or_default().push(e);
        }
        g
    }

    /// Every lot reachable from `start` with its distance in steps; distance 1 is
    /// one up or one down. Cycles (rework) are visited once.
    pub fn trace(&self, start: &'a str, dir: Direction, max_depth: u32) -> HashMap<&'a str, u32> {
        let mut dist = HashMap::from([(start, 0)]);
        let mut queue = VecDeque::from([start]);
        while let Some(lot) = queue.pop_front() {
            let d = dist[lot];
            if d == max_depth {
                continue;
            }
            let index = if dir == Direction::WhereUsed { &self.down } else { &self.up };
            for e in index.get(lot).into_iter().flatten() {
                let n = if dir == Direction::WhereUsed { e.output.as_str() } else { e.input.as_str() };
                if !dist.contains_key(n) {
                    dist.insert(n, d + 1);
                    queue.push_back(n);
                }
            }
        }
        dist
    }
}

/// Joins traced lots to the shipments that carried them.
pub fn shipped<'a>(
    lots: &HashMap<&'a str, u32>,
    shipments_by_lot: &'a HashMap<String, Vec<String>>,
) -> HashMap<&'a str, &'a [String]> {
    shipments_by_lot
        .iter()
        .filter(|(lot, _)| lots.contains_key(lot.as_str()))
        .map(|(lot, s)| (lot.as_str(), s.as_slice()))
        .collect()
}
```

A mock trace (pick a supplier lot, run where-used and the shipments, time it, compare with what the floor says) is the cheapest test of whether these records are complete; [Recalls From the Manufacturer's Side](/books/logistics/manufacturing-recalls) records those drills.

## Auditing

- **Every edge** with its kind, quantity, lot basis, source posting, both times and any reversal, so a trace run today and one run during last month's recall can both be reproduced.
- **Every lot's origin:** the supplier and supplier's lot for received lots, the work order for produced ones, the parent lots for splits, merges and repacks.
- **Every serial's life:** commissioning, aggregation into handling units, shipment, installation and removal with dates, return and decommissioning.
- **Every partner event and document as received,** with its error declarations, and the internal records it created.
- **What was shipped where, by lot and serial,** the one-down records 21 CFR 1.345 and the other regimes require, retained for the longest period any regime that applies to the item sets (6 years for DSCSA transaction data under 360eee-1).

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Decide lot and serial tracking per item,** and make receipt, consumption, production, split, repack and shipment refuse a tracked item without its lot or serial.
- **Keep the supplier's lot code beside the internal one** and link them at receipt.
- **Record one edge per input lot consumed,** with quantity, evidence basis and both times, and correct by reversal.
- **Keep as-built records with time ranges** so a serviced unit shows its components on any date.
- **Trace both directions over the same edges,** with cycle guards, and join to shipment lines for customers and facilities.
- **Store EPCIS events as received,** deduplicate on event ID, map them to internal records, and honor error declarations.
- **Scope identifiers to their issuer:** lot within item and maker, serial within GTIN, SSCC globally.
- **Run mock traces** and measure how long they take and how much was inferred.

## References

**Standards**

- [GS1: EPCIS and CBV standards](https://ref.gs1.org/standards/epcis/), EPCIS 2.0 (ratified June 2022): the five event types, the what-when-where-why-how dimensions, eventTime, recordTime and eventTimeZoneOffset, eventID uniqueness, error declarations, actions, ILMD and the JSON/REST bindings
- [GS1: Core Business Vocabulary](https://ref.gs1.org/standards/cbv/), CBV 2.0 (June 2022): business steps such as commissioning, packing, shipping and receiving, and dispositions such as active, in_transit, recalled, destroyed and conformant
- [GS1: Application Identifiers dataset](https://ref.gs1.org/ai/GS1_Application_Identifiers.jsonld), the titles and formats of AIs (00), (01), (10), (11), (17) and (21), and the Digital Link key qualifiers of the GTIN
- [GS1: Digital Link](https://ref.gs1.org/standards/digital-link/), GS1 keys in web URIs and the legacy standard's version 1.1.4 of January 2026

**Regulations**

- [21 CFR 1.345 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.345), the one-down records for food released and ingredient source information
- [21 CFR 1.361 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.361), records available within 24 hours of a qualifying FDA request
- [21 CFR 821.25 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/821.25), device tracking data and the 3 and 10 working day limits
- [21 U.S.C. 360eee-1 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360eee-1), DSCSA interoperable electronic exchange, package-level identifiers, tracing back to the manufacturer and six-year retention

**Vendors**

- [Microsoft Learn: Trace item-tracked items (Business Central)](https://learn.microsoft.com/en-us/dynamics365/business-central/inventory-how-to-trace-item-tracked-items), Item Tracing in both directions, components and the applied-transactions limit
- [Odoo: Lots](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/product_management/product_tracking/lots.html), lot assignment, removal strategies and the traceability report
