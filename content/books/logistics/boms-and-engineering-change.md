+++
title = "BOMs, PLM & Engineering Change"
nav_title = "BOMs & Change Orders"
description = "Bills of materials from design to the floor: EBOM and MBOM, phantoms and kits, versions and effectivity, engineering change orders, PLM release and vendors."
category = "Logistics & Supply Chain Industry"
order = 2857
part = "Manufacturing"
tags = ["logistics", "manufacturing", "bom", "plm", "engineering-change", "effectivity", "data-model"]
+++

A bill of materials (BOM) is the list of what goes into a product: for each parent, its components and how many of each. A pump is a motor, a housing, an impeller, a seal kit and eight bolts; the housing is a casting and two machined bores; the seal kit is bought. Nested, the lists form a tree that every downstream system reads: MRP explodes it to know what to buy and make, costing rolls it up to know what the pump costs, the MES checks components against it on the line, the warehouse picks to it, and, when a seal fails in the field, traceability and recalls walk it to find every pump that took a seal from the bad lot.

It is hard because the tree changes, and the same product has several trees at once. Engineering designs one structure (by function, as the CAD assembly is drawn); manufacturing builds another (by how the plant assembles it, with the packaging and the adhesive engineering never listed); costing and planning may use simplified versions of their own. Every structure changes over time through engineering changes, each with a date or a serial number from which it applies, while the old version is still on open work orders, in stock, and in units already shipped. A BOM system that can answer "what is the pump made of" but not "what was this pump made of, built on March 3 at plant 2" can't support a recall, a warranty claim or a cost variance.

This chapter covers what a BOM line carries, engineering and manufacturing BOMs, phantoms and kits, variants, versions and effectivity, the engineering change process from request to order, releasing from PLM to the ERP, and the vendors. It extends `items` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), with the plant settings and work centers from [ERP, MES & ISA-95](/books/logistics/manufacturing-systems#how-to-build-it). How MRP uses the BOM is [MRP, Scheduling & Work Orders](/books/logistics/production-planning#the-mrp-explosion); the record of which lots went into which unit (as built, not as designed) is [Lot & Serial Traceability](/books/logistics/lot-traceability)'s.

## How the Platforms Do It

As of November 2026, from each product's documentation and filings:

| System | BOM structure | Versions and effectivity | Change control |
| --- | --- | --- | --- |
| **Microsoft Dynamics 365 Supply Chain Management** | "A single BOM describes a single level"; line types Item, Phantom, Pegged supply and Vendor (subcontract); formulas add co-products and by-products | BOM versions whose validity "can be constrained by period, quantity, site, specific product dimensions"; a version must be approved, and activation checks uniqueness: "You receive an error message if the version that you're trying to activate conflicts with a version that is already active" | Engineering change management: product versions, "readiness checks," engineering change requests and orders run by workflow; one engineering company releases products to other legal entities |
| **Odoo** | BoM lines with "Consumed in Operation," "Apply on Variants," by-products and "Flexible Consumption"; a kit BoM type | An ECO works on a revised BoM that doesn't affect production until applied; revisions numbered "V2", "V3" and so on | Engineering change orders by type and stage; verification stages "require approval before the revised changes can be applied"; effectivity "As soon as possible" or "At Date"; applying archives the original and "the revised BoM becomes the new production BoM" |
| **ERPNext** | "A list of items and sub-assemblies with quantities required to manufacture an Item"; multi-level; an exploded items table; "Do Not Explode" per row; scrap and process loss (scrap items become Secondary Items in ERPNext v16) | Several BOMs per item; one "Is Default," others active as alternates | Not described on the BOM page cited |
| **Oracle Fusion Cloud Manufacturing** | The item structure, combined with routing in a work definition; "a single buildable level of the item structure" per work definition | A primary work definition (priority 1) and alternates | Not on the page cited |
| **Arena (PTC)** | EBOM: "parts or assemblies that are designed by the engineering team"; MBOM: "a structured list of subassemblies that are needed to produce a shippable product" | Not on the glossary pages cited | An ECO "lists all affected parts and assemblies" and is reviewed by "internal product teams and their external supply chain partners" |
| **PTC Windchill** | PLM that "manages all aspects of the product development lifecycle" | Not in the filing cited | Not in the filing cited |

The PLM vendors' scale, from their filings: PTC's fiscal 2026 revenue was $2,733.4 million with ARR of $2.51 billion (and PTC agreed on October 4, 2026 to become a wholly owned subsidiary of Schneider Electric, pending as of November 2026); Dassault Systèmes's 2025 revenue was €6,239.6 million, with ENOVIA among the strongest contributors to Industrial Innovation software growth; Siemens's Digital Industries software business had €7.2 billion of fiscal 2026 revenue.

Four patterns:

- **A BOM is one level; the tree is assembled from versions.** Dynamics 365 says it directly, Oracle's work definition is one buildable level, ERPNext links sub-assembly BOMs. The explosion resolves, level by level, which version of each child applies.
- **Validity is a set of constraints, not one date.** Period, quantity, site and product dimension in Dynamics 365; a date or "as soon as possible" in Odoo. Overlapping active versions are refused at activation, not discovered at explosion.
- **Changes are documents with workflow.** Every system with change control models the change as its own record that names the affected items, passes approval stages, and applies on a date, leaving the old version archived rather than overwritten.
- **Engineering and manufacturing structures differ on purpose.** Dynamics 365's lifecycle list (draft, engineering, planning, production and costing BOMs) and Arena's EBOM and MBOM agree that one product carries several structures for several uses.

## What a BOM Line Carries

A line belongs to one parent at one level. Its fields, from Arena's list and the ERPs':

- **The component** (an item, by part number) and **the quantity per** parent, in a unit of measure. Quantity per can be per batch rather than per unit for process items (a 1,000 kg batch of resin compound takes 620 kg of base resin); ERPNext states a BOM's output quantity and each row's quantity against it.
- **Scrap or yield:** the extra the line consumes because some is lost. ERPNext records scrap items, and when the scrap item is the item being made, "it is set as a Process Loss Item and its quantity is subtracted from the manufactured Item quantity."
- **Where it is consumed:** the routing operation that takes it (Odoo's "Consumed in Operation"), which decides when it must be at the line.
- **Reference designators** in electronics: "where a particular part fits on the board within the BOM."
- **The line type:** a normal component, a phantom, a pegged or subcontracted supply.
- **Procurement type,** "how each part is purchased or made," which for this volume lives per plant ([What the ERP Owns in a Plant](/books/logistics/manufacturing-systems#what-the-erp-owns-in-a-plant)).
- **Effectivity,** if the system dates lines rather than versions.

## Engineering and Manufacturing BOMs

The engineering BOM (EBOM) follows the design: functional assemblies, as engineering's CAD and PLM structure them. The manufacturing BOM (MBOM) follows the build: the subassemblies the plant actually makes, in the order it makes them, plus what engineering never drew (packaging, labels, adhesive, the shipping pallet). Dynamics 365 lists five uses (a sketching or draft BOM, an engineering BOM, a planning BOM, a production BOM and a costing BOM) and notes that engineering BOMs "must be converted to an actual production BOM" for all but simple products, and that "in simple implementations, a planning BOM, production BOM, and costing BOM can be modeled as one BOM."

The transformation from EBOM to MBOM is where engineering and the plant disagree, and the rules I use:

- **The part numbers that ship are the same in both.** The MBOM can regroup, add process materials and split subassemblies differently, but a part a customer can order as a spare, or a regulator can ask about, keeps its number.
- **Every MBOM line traces to an EBOM line or is marked as a manufacturing addition.** That keeps the two reconcilable after every change.
- **One MBOM per plant when plants build differently.** Dynamics 365 versions can be constrained by site; a plant that builds the housing in one piece and another that welds it from two have two valid MBOMs for one design.

## Phantoms and Kits

A **phantom** is a level that exists in the structure but is never stocked: a subassembly built and immediately consumed at the next level. In Dynamics 365, when an order uses a phantom line, the line "is replaced by the component items that are listed as BOM lines in that BOM," and its route's operations "are merged into the parent route." Engineering BOMs "are typically represented by phantoms," and Microsoft warns that deep phantom hierarchies hurt performance: "avoid deep hierarchies of phantoms. Instead, use pre-exploded production BOMs and routes." MRP plans through a phantom without creating a work order for it, and nets any stock of it (a returned or leftover one) before going down to its components.

A **kit** is the sales-side cousin: "sets of unassembled components sold to customers," in Odoo's words, sold as one line and shipped as its components ("on delivery orders, each component of the kit is listed"), and not sellable "if any required component is out of stock." A kit is a BOM read by order management and the warehouse rather than by production. Commerce's [Bundles and Kits](/books/commerce/products-and-variants#bundles-and-kits) are the merchant's version of the same structure.

## Variants and Configuration

A product with options (a pump in three motor sizes and two seal materials) either has one BOM per variant, or one BOM whose lines apply to some variants: Odoo's "Apply on Variants" names the variants each line serves and, left blank, applies it to all. Configure-to-order goes further: the variant "is created at the time of order entry, based on the configuration model of the sales product" (Dynamics 365), so the BOM for the order is generated from rules. My rule: whatever the mechanism, the resolved BOM for a configured order is stored with the order's work order, because the rules that generated it will change.

## Versions and Effectivity

Effectivity says when a structure applies. The common kinds:

- **Date effectivity:** a version valid from one date to another. It's the default in every ERP above, and Odoo's ECO applies "At Date" or "As soon as possible," when an authorized user applies the changes.
- **Quantity effectivity:** a version valid for a quantity band, in Dynamics 365's constraints; useful when a large order is built differently from a small one.
- **Site effectivity:** a version valid at one plant.
- **Serial or lot effectivity:** a change that applies from a given unit or lot onward, used where each unit's configuration must be known (aircraft, vehicles, medical devices). Of the systems above, none documents serial effectivity on the pages cited; it is common practice in PLM for configured products, and where it is needed the effectivity has to be checked at the unit, not the date. <!-- source-gap: logistics-boms-serial-effectivity | missing | serial or unit effectivity as a vendor-documented BOM feature | closes with: a readable PLM or ERP help page describing serial or unit effectivity | checked: 2026-11-22 -->

Two decisions sit under every effectivity design:

- **Version-level or line-level dating.** Dynamics 365 and Odoo date whole versions: a change creates a new version and the old one ends. Some systems date individual lines, which avoids copying a 300-line BOM to change one bolt but makes "show me the BOM on March 3" a filter over lines. I date versions, and make the copy cheap.
- **Planned date versus the actual cut-in.** An ECO's effective date is a plan; the first unit actually built to the new structure depends on when old stock runs out and when the new part arrives. The as-designed structure follows the ECO; the as-built record (which unit got which part) is the MES's and traceability's.

## Engineering Change

A change starts as a request and becomes an order. Arena's steps for handling an engineering change request are to gather supporting material, check the change is in scope, assess its priority, approve or reject it, and decide the course of action; an approved change becomes an engineering change order (ECO), which "outlines new product designs or proposed changes to existing designs," "lists all affected parts and assemblies," and is reviewed by "internal product teams and their external supply chain partners." Dynamics 365 runs both requests and orders "that workflows support," with readiness checks that stop a product version being activated before its required data is in; Odoo moves ECOs through stages configured per ECO type, where verification stages "require approval before the revised changes can be applied" and, when the changes are applied, archives the original so that "the revised BoM becomes the new production BoM."

What an ECO has to carry for the rest of the supply chain:

- **Affected items and the change to each:** new revision, new or removed lines, changed quantities.
- **The effectivity:** a date, a serial or lot, or "when stock is used up."
- **The disposition of what exists:** stock of the old part used as is, reworked, returned to the supplier or scrapped; open work orders finished on the old structure or changed; open purchase orders and supplier schedules changed or cancelled. Disposition is where the change costs money, and suppliers need it to decide what they're still authorized to build ([Supplier Schedules, JIT & Automotive EDI](/books/logistics/supplier-schedules#authorizations-and-cumulative-quantities)).
- **Approvals,** in sequence, by role.
- **The reason,** which quality and recalls later read.

My convention: a part's revision changes when the change is compatible (form, fit and function unchanged, so old and new interchange), and a new part number is issued when they don't. No standard cited here fixes the rule and each company writes its own; whatever it is, I store its outcome on the ECO line (`interchangeable`), because MRP must not net stock of an old, non-interchangeable part against demand for the new one.

## From PLM to the ERP

Engineering authors items and EBOMs in PLM (PTC Windchill or Arena and Dassault's ENOVIA among them) and releases them; the ERP receives released items, revisions and structures, and manufacturing engineering builds the MBOM and routing there or in the MES. Dynamics 365's variant of this is to maintain product data "in one legal entity (the engineering company) and publish the fully configured released product to other legal entities." The integration rules follow from the chapter so far: releases are versioned, the ERP refuses a release that would overlap an active version, a change carries its ECO number end to end, and the PLM's identifiers are stored as external references, not keys.

## How to Build It

The core `items` row is the part; these tables add its kind and revision, BOM versions with effectivity, their lines, and engineering change orders. Names are prefixed (`bom_`, `engineering_change_`) so they can't collide with traceability's genealogy tables, which record what was actually consumed.

```sql fragment
ALTER TABLE items
  ADD COLUMN item_kind TEXT,             -- what role the part plays in structures
  ADD COLUMN revision  TEXT;             -- the current released revision
ALTER TABLE items ADD CONSTRAINT items_item_kind_check
  CHECK (item_kind IN ('finished_good', 'subassembly', 'component', 'raw_material',
    'packaging', 'phantom', 'kit', 'service')) NOT VALID;
ALTER TABLE items VALIDATE CONSTRAINT items_item_kind_check;

CREATE TABLE item_revisions (            -- every released revision of a part
  item_id        UUID NOT NULL REFERENCES items (id),
  revision       TEXT NOT NULL,
  eco_id         UUID,                   -- the change that released it
  released_at    TIMESTAMPTZ NOT NULL,
  plm_ref        TEXT,                   -- the PLM's object ID, as an external reference
  PRIMARY KEY (item_id, revision)
);

CREATE TABLE bom_headers (               -- one level: a parent's structure, one version
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_item_id    UUID NOT NULL REFERENCES items (id),
  usage             TEXT NOT NULL CHECK (usage IN ('engineering', 'manufacturing', 'planning',
                      'costing', 'kit')),
  facility_id       UUID REFERENCES facilities (id),  -- null: any plant
  version           INT NOT NULL CHECK (version > 0),
  base_quantity     NUMERIC(14, 3) NOT NULL DEFAULT 1 CHECK (base_quantity > 0),  -- lines are per this
  base_uom          TEXT NOT NULL,
  quantity_band     NUMRANGE,            -- quantity effectivity, null: any quantity
  effective_during  TSTZRANGE,           -- null until activated
  status            TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'active',
                      'superseded', 'archived')),
  eco_id            UUID,                -- the change that created it
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  UNIQUE (parent_item_id, usage, facility_id, version),
  CHECK (status NOT IN ('active', 'superseded') OR effective_during IS NOT NULL)
);
-- No two active versions overlap for the same parent, use, plant and quantity band (btree_gist).
ALTER TABLE bom_headers ADD CONSTRAINT bom_headers_no_overlap
  EXCLUDE USING gist (parent_item_id WITH =, usage WITH =,
    COALESCE(facility_id, '00000000-0000-0000-0000-000000000000'::UUID) WITH =,
    COALESCE(quantity_band, '(,)'::NUMRANGE) WITH &&, effective_during WITH &&)
  WHERE (status = 'active');

CREATE TABLE bom_lines (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  bom_header_id      UUID NOT NULL REFERENCES bom_headers (id),
  line_number        INT NOT NULL,
  component_item_id  UUID NOT NULL REFERENCES items (id),
  line_type          TEXT NOT NULL CHECK (line_type IN ('item', 'phantom', 'pegged',
                       'subcontract', 'by_product', 'co_product')),
  quantity_per       NUMERIC(18, 6) NOT NULL CHECK (quantity_per > 0),  -- per base_quantity
  uom                TEXT NOT NULL,
  scrap_factor       NUMERIC(6, 4) NOT NULL DEFAULT 0 CHECK (scrap_factor >= 0 AND scrap_factor < 1),
  operation_seq      INT,                -- the routing operation that consumes it
  reference_designators TEXT[],
  ebom_line_id       UUID REFERENCES bom_lines (id),  -- MBOM line traced to its EBOM line
  manufacturing_addition BOOLEAN NOT NULL DEFAULT FALSE,  -- packaging, adhesive: no EBOM line
  UNIQUE (bom_header_id, line_number)
);

CREATE TABLE engineering_change_orders (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  number            TEXT NOT NULL UNIQUE,
  kind              TEXT NOT NULL CHECK (kind IN ('request', 'order')),  -- ECR, then ECO
  request_id        UUID REFERENCES engineering_change_orders (id),     -- the ECR an ECO answers
  reason            TEXT NOT NULL,
  effectivity_kind  TEXT NOT NULL CHECK (effectivity_kind IN ('date', 'as_soon_as_possible',
                      'serial', 'lot', 'stock_run_out')),
  effective_at      TIMESTAMPTZ,         -- for 'date'
  effective_from_serial TEXT,            -- for 'serial'
  status            TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved',
                      'rejected', 'applied', 'cancelled')),
  plm_ref           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at        TIMESTAMPTZ
);

CREATE TABLE engineering_change_items (  -- what the change does to each affected part
  eco_id            UUID NOT NULL REFERENCES engineering_change_orders (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  from_revision     TEXT,
  to_revision       TEXT,
  interchangeable   BOOLEAN NOT NULL,    -- may old stock net against new demand
  stock_disposition TEXT NOT NULL CHECK (stock_disposition IN ('use_as_is', 'rework',
                      'return_to_supplier', 'scrap', 'not_applicable')),
  open_order_action TEXT NOT NULL CHECK (open_order_action IN ('complete_on_old', 'change',
                      'cancel', 'not_applicable')),
  PRIMARY KEY (eco_id, item_id)
);

CREATE TABLE engineering_change_approvals (
  eco_id      UUID NOT NULL REFERENCES engineering_change_orders (id),
  step        SMALLINT NOT NULL,
  role        TEXT NOT NULL,             -- 'design', 'manufacturing', 'quality', 'supplier'
  decision    TEXT CHECK (decision IN ('approved', 'rejected')),
  decided_by  TEXT,
  decided_at  TIMESTAMPTZ,
  PRIMARY KEY (eco_id, step, role)
);
```

Applying an ECO, in one transaction: end the effective range of each superseded version at the ECO's date, activate the new versions from that date (the exclusion constraint refuses an overlap), record the revision, and emit an event that MRP, the MES and the supplier-schedule process consume. Ranges are half-open (`[from, to)`), so the old version's last instant and the new version's first never coincide ([One Naming Standard: Range Columns](/docs/database/temporal-data#one-naming-standard-range-columns)).

The as-of explosion, for one parent at one plant on one date and quantity, walks versions down the tree; a phantom contributes its components and never appears itself:

```sql
WITH RECURSIVE explode AS (
  SELECT l.component_item_id AS item_id, l.line_type,
         l.quantity_per / h.base_quantity / (1 - l.scrap_factor) * $4 AS quantity,
         1 AS depth, ARRAY[h.parent_item_id, l.component_item_id] AS path
  FROM bom_headers h JOIN bom_lines l ON l.bom_header_id = h.id
  WHERE h.parent_item_id = $1 AND h.usage = 'manufacturing' AND h.status IN ('active', 'superseded')
    AND (h.facility_id = $2 OR h.facility_id IS NULL)
    AND h.effective_during @> $3::TIMESTAMPTZ
    AND (h.quantity_band IS NULL OR h.quantity_band @> $4::NUMERIC)
  UNION ALL
  SELECT l.component_item_id, l.line_type,
         e.quantity * l.quantity_per / h.base_quantity / (1 - l.scrap_factor),
         e.depth + 1, e.path || l.component_item_id
  FROM explode e
  JOIN bom_headers h ON h.parent_item_id = e.item_id AND h.usage = 'manufacturing'
    AND h.status IN ('active', 'superseded') AND h.effective_during @> $3::TIMESTAMPTZ
    AND (h.facility_id = $2 OR h.facility_id IS NULL)
    AND (h.quantity_band IS NULL OR h.quantity_band @> e.quantity)
  JOIN bom_lines l ON l.bom_header_id = h.id
  WHERE e.line_type = 'phantom'          -- descend only through phantoms
    AND NOT l.component_item_id = ANY (e.path)  -- a cycle is a data error, not an infinite loop
)
SELECT item_id, SUM(quantity) AS quantity
FROM explode
WHERE line_type NOT IN ('phantom', 'by_product', 'co_product')
GROUP BY item_id;
```

That is one level of real demand (with phantoms flattened), which is what a work order's material list needs; MRP explodes level by level with netting in between, which is why the full multi-level explosion lives in [MRP, Scheduling & Work Orders](/books/logistics/production-planning#the-mrp-explosion). A plant-specific version, where one exists, should win over the any-plant one; ranking by `facility_id IS NULL` and keeping the first per parent is the refinement.

## Auditing

- **Every version, with its effective range, approval and the ECO that created or ended it,** never overwritten, so "what was the structure on March 3 at plant 2" has one answer.
- **Every ECO with its affected items, dispositions, approvals and reason,** because quality systems, customers (in automotive through PPAP, covered in [Quality Systems](/books/logistics/quality-management)) and regulators ask why a change was made and who approved it.
- **The structure each work order used,** stored or referenced by version on the order, so cost variances and as-built records compare against what was released, not today's BOM.
- **PLM release messages, as received,** keyed by the PLM's IDs, so a disagreement between PLM and ERP can be traced to a release.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#amend-don-t-overwrite).

## What This Means for the System You Build

- **Store one level per BOM version,** and resolve the tree by explosion, choosing each child's version by date, plant and quantity.
- **Refuse overlapping active versions at activation,** with an exclusion constraint, not at explosion time.
- **Keep EBOM and MBOM as separate structures,** with every MBOM line traced to an EBOM line or marked as a manufacturing addition.
- **Flatten phantoms on the order and net their stock in MRP;** don't create work orders for them.
- **Model the engineering change as a document,** with affected items, effectivity, dispositions and approvals, and apply it in one transaction.
- **Record interchangeability on the change,** so MRP never nets old stock against demand for a part it can't replace.
- **Keep PLM identifiers as external references,** and version every release from PLM.

## References

**Vendors**

- [Microsoft Learn: Bills of materials and formulas (Dynamics 365 Supply Chain Management)](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/bill-of-material-bom), BOM uses, single-level BOMs, version constraints, approval and activation, line types and the phantom guidance
- [Microsoft Learn: Engineering change management overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/engineering-change-management/product-engineering-overview), product versions, readiness checks, change requests and orders, and release from an engineering company
- [Microsoft Learn: Production process overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview), configure to order
- [Odoo: Engineering change orders](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/plm/manage_changes/engineering_change_orders.html), ECO types and stages, verification, revision numbering, effectivity and archiving
- [Odoo: Bill of materials](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/manufacturing/basic_setup/bill_configuration.html), components consumed in operations, variants, by-products and flexible consumption
- [Odoo: Kits](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/manufacturing/advanced_configuration/kit_shipping.html), kits sold as one line and delivered as components
- [Frappe: ERPNext Bill of Materials](https://docs.frappe.io/erpnext/user/manual/en/bill-of-materials), multi-level BOMs, default and active BOMs, exploded items, scrap and process loss, and Secondary Items in v16
- [Oracle: Overview of work definitions (Fusion Cloud Manufacturing 26C)](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/faumf/overview-of-work-definitions.html), item structures by buildable level, primary and alternate work definitions
- [Arena: Bill of materials](https://www.arenasolutions.com/resources/glossary/bill-of-materials/), the EBOM and MBOM definitions and BOM fields
- [Arena: Engineering change order](https://www.arenasolutions.com/resources/glossary/engineering-change-order/), the ECO definition, affected items, supplier review and the change request steps

**Filings and results**

- [PTC: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/857005/000119312526470217/ptc-20260930.htm), Windchill and Arena, revenue, ARR and the Schneider Electric merger agreement
- [Dassault Systèmes: Fourth quarter and full year 2025 results](https://www.3ds.com/assets/invest/2026-02/dassault-systemes-25q4-earnings_pr_va.pdf), revenue and ENOVIA's contribution to Industrial Innovation software
- [Siemens: Fiscal 2026 results (November 12, 2026)](https://press.siemens.com/global/en/pressrelease/outstanding-fiscal-2026-performance-industrial-ai-drive-future-growth), Digital Industries software revenue
