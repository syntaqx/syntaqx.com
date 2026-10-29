+++
title = "Warehouses, 3PLs & Fulfillment Networks"
nav_title = "Warehouses & 3PLs"
description = "WMS basics from receiving to ship, 3PLs like ShipBob and ShipMonk, Amazon MCF and FBA, Walmart Fulfillment Services, integration, EDI and SLAs."
category = "Commerce Industry"
order = 2318
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "fulfillment", "wms", "3pl", "amazon-mcf", "data-model"]
+++

A warehouse turns pallets into parcels. Containers arrive with cartons nobody has counted yet; the building receives them against a notice of what should be inside, puts each unit somewhere it can be found again, and then, thousands of times a day, finds the right one, puts it in the right box with the right paperwork, and hands it to the right carrier before the truck leaves. Every step is a place where the count the rest of the business relies on can go wrong, and every step has a clock: dock-to-stock time, the same-day cutoff, the marketplace's ship-by date.

Most brands don't run the building. They hire a third-party logistics provider (a 3PL) such as ShipBob or ShipMonk, send stock into a marketplace's network (Fulfillment by Amazon, Walmart Fulfillment Services), or both, and their software's job becomes integration: telling someone else's warehouse what to ship, hearing back what it did, and reconciling its counts and its invoices. This chapter covers what happens inside a warehouse, receiving and inbound shipments, 3PLs and their pricing, Amazon's and Walmart's fulfillment networks, integrating with a 3PL by API and EDI, and the SLAs that measure all of it. It extends `locations` and `fulfillments` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The order's routing is [Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)'s; the counts are [Inventory](/books/commerce/inventory)'s; the label and carrier belong to [Shipping & Carriers](/books/commerce/shipping-and-carriers); returns processing is covered in [Returns & Exchanges](/books/commerce/returns-and-exchanges#disposition), and delivery by the merchant's own fleet in the Field Operations volume's [Last-Mile Delivery](/books/field-operations/last-mile-delivery#from-dock-to-door).

## How the Platforms Do It

As of October 2026, from developer documentation, published SLAs and rate cards:

| Provider | Network | Integration | Published service terms |
| --- | --- | --- | --- |
| **ShipBob** | "60+ fulfillment centers" across the US, Canada, the UK, the EU and Australia | Date-versioned REST API (a new version each January and July, each supported 24 months; 2026-07 the default); orders, products, inventory, warehouse receiving orders (WROs) and signed webhooks | Same-day fulfillment for DTC orders imported before a cutoff "ranging from noon to 6pm local time"; pricing quoted per customer |
| **ShipMonk** | "11 global locations" in the US, Canada and Europe | API for orders, products, inventory holds, receivings, returns and claims, with status webhooks | Receive and put away within three business days; "100% accuracy" with a remedy of the lesser of return postage or replacement value; under 2% breakage from packaging; missing full cartons covered "up to $10/unit"; pricing quoted, with a monthly minimum |
| **Amazon Multi-Channel Fulfillment** | Amazon's fulfillment network, shipping orders from any channel from inventory stored in FBA | SP-API Fulfillment Outbound API: previews, create, update, cancel, tracking and returns | Standard "3 business days, click-to-delivery," Expedited 2; peak rate card from October 15, 2026: $7.53 for one small standard unit up to 4 ounces at Standard speed, plus a 3.5% fuel and logistics surcharge; blank-box packaging available |
| **Fulfillment by Amazon (FBA)** | The same network, for Amazon's own orders | SP-API Fulfillment Inbound API (2024-03-20): inbound plans, packing and placement options | Capacity limits in cubic feet, set monthly; inbound placement service fee; a low-inventory-level fee avoided by keeping "more than four weeks of inventory relative to sales"; FBA fees up an average $0.08 a unit from January 15, 2026 |
| **Walmart Fulfillment Services (WFS)** | Walmart's fulfillment centers | Inbound order API that may split one shipment across centers | "Picks, packs and ships orders in two days or less"; fulfillment from $3.45 for items up to 1 lb; storage $0.75 per cubic foot a month January to September |
| **Walmart Multichannel Solutions** | WFS inventory, for orders from other channels (Amazon, eBay, Shein, Temu, TikTok Shop named) | Through WFS | Since September 10, 2024; unbranded poly bags or brown boxes; 2 business days expedited, 3 to 5 standard, not guaranteed October through December |
| **Shopify fulfillment services** | Any 3PL or warehouse app registered as a fulfillment service location | Fulfillment order requests and cancellation requests by callback, accepted or rejected by the service | Shopify sold most of its own logistics business to Flexport for a 13% equity stake, closed June 6, 2023 |

Three patterns:

- **The warehouse is a location the brand doesn't run.** Every provider exposes the same few things: what it received, what it holds, what it shipped with tracking, and what it charged. The core model's `locations.operator` already says so; this chapter adds the account and the handshake.
- **Inbound is as hard as outbound.** ShipBob's WRO, Amazon's inbound plans with their packing and placement options, and Walmart's inbound orders that split across centers are each a small project per shipment, with fees and statuses of their own.
- **Marketplace networks are now 3PLs.** Amazon and Walmart both ship other channels' orders from inventory stored for their own, and each has had to answer the other: Walmart allows Amazon's Multi-Channel Fulfillment "as long as you ship in neutral packaging using unbranded delivery vehicles," and Amazon's blank-box option and its instructions to block Amazon Logistics as a carrier exist for exactly that.

## Inside a Warehouse

A warehouse management system (WMS) directs the work in a building. The vocabulary is shared across vendors (Oracle, Manhattan, NetSuite WMS and the 3PLs' own systems):

- **Receiving.** A truck arrives against an advance ship notice (ASN), which Oracle's WMS defines as "a notification of pending deliveries, similar to a packing list" that usually "represents the entire contents of an inbound trailer." Cartons or pallets are scanned, counted and checked against the notice; overs, shorts and damage are recorded before anything is stocked.
- **License plates.** Each pallet, carton or tote carries a license plate number (LPN), so the system can move a container of units as one thing. GS1's Serial Shipping Container Code (SSCC) is the standard plate on cartons and pallets moving between companies.
- **Putaway and slotting.** Received stock is directed to a bin. Slotting decides which bins hold which items: fast movers near the pack stations and at waist height, heavy items low, items often ordered together near each other.
- **Allocation and waves.** Open orders are matched to stock and released to the floor in groups. In Oracle's terms, a wave matches "open Orders with allocatable inventory," and creating an allocation creates a picking task.
- **Picking.** Four common methods: **discrete** (one picker, one order; NetSuite's single-order picking "generates a pick task for each line item of an order"), **batch** (one picker collects the same item for many orders, then the system distributes them, NetSuite's bulk picking), **zone** (each picker works one area and orders pass between zones) and **cluster** (one picker fills several orders at once, each in its own tote). Lot-tracked items pick first-expired first ([Lots, Serials, Expiry and Kits](/books/commerce/inventory#lots-serials-expiry-and-kits)).
- **Packing and cartonization.** Choosing the box is a decision with a cost: carriers bill dimensional weight ([Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight)), so a WMS or packing station picks the smallest carton that fits, adds dunnage, prints the packing slip and any inserts, and weighs the result.
- **Shipping.** The label is bought (by the WMS, the 3PL or the merchant's multi-carrier platform), the package is sorted to the carrier's trailer, and the carrier's manifest and pickup close the day. Once a package is packed for shipping it's an outbound LPN in Oracle's terms.

Picking dominates the cost of the floor, which is why so much of a WMS is about reducing walking: waves, batches, slotting and pick paths. Accuracy is the other measure, because a mis-pick is a return, a reship and a customer contact.

## Receiving and Inbound

Stock reaches a building with a notice. ShipBob calls its notice a warehouse receiving order ("some other solutions call it an 'ASN'"): the brand declares what's coming, by package, pallet or floor-loaded container, and each box moves through `Awaiting`, `Arrived`, `Counting`, `Stowing` and `Completed`, with the WRO's own status following its least-advanced box. Receiving takes "hours or a few days," and ShipBob suggests polling every 15 to 30 minutes or subscribing to its `wro.*` webhooks. ShipMonk commits to receiving and putting away within three business days and asks for five business days' notice for large receivings.

The marketplace networks add placement. Amazon's inbound flow creates an inbound plan, generates and confirms packing options, then generates and confirms placement options, which decide which fulfillment centers the shipment is split across. Since 2024 Amazon charges an inbound placement service fee for its choice of placement (averaging $0.27 a unit for standard-size items when announced), reduced or waived when the seller accepts more splits. Walmart's inbound order may likewise be split across WFS centers, or sent whole to a transfer station with its inventory transfer service.

Four rules for the system:

- **The notice is a contract.** Expected quantities per item per carton, with each carton labeled. GS1's SSCC is an 18-digit code, usually printed as a GS1-128 barcode, and "one scan of the SSCC" can be linked to the electronic ASN so a receiver can accept a pallet without opening it.
- **In transit is inventory.** Between the brand's warehouse and the 3PL, units are owned and counted nowhere for selling. The inbound transfer holds them, and receipts move them to on hand at the destination ([Stock Across Locations](/books/commerce/inventory#stock-across-locations)).
- **Receipts are compared, not accepted.** Received against expected, per item and per carton; a short receipt is a claim against the supplier, the carrier or the 3PL, and the difference is a record, not a silent correction.
- **Dock-to-stock time is lost sales.** Units at the dock can't be sold. The time from arrival to available is a measured SLA, and a merchant near zero stock cares about it more than about storage price.

## 3PLs

A 3PL rents the brand a share of a building, its labor and its carrier rates. The services are standard (receiving, storage, pick and pack, packaging, kitting, returns processing, B2B and retail shipments, sometimes freight) and so is the price structure, even though most 3PLs, ShipBob and ShipMonk included, publish no rates and quote each customer:

- **Receiving,** per hour, per carton or per pallet, with surcharges for unlabeled or mixed cartons.
- **Storage,** per bin, shelf, pallet or cubic foot per month, often higher in the fourth quarter.
- **Pick and pack,** per order plus per additional item, with packaging per box.
- **Postage,** at the 3PL's negotiated carrier rates, which are part of what the brand is buying.
- **Special projects:** kitting, relabeling, inserts, gift wrap, retail compliance labeling.
- **Minimums:** ShipMonk, for example, describes its monthly minimum as a formula on order volume times its first-item pick fee, reduced by 20%.

The economics push brands toward 3PLs with several nodes (ShipMonk claims reach to "95% of the US within 2 days"), because stock split across two or three buildings lowers zones and transit times at the cost of more inventory in total and more splits ([Splits and Merges](/books/commerce/order-management#splits-and-merges)).

The integration consequence is that a 3PL invoice is an order-level cost the brand has to allocate back to orders and SKUs to know its margin ([Business Models & Unit Economics](/books/commerce/business-models#the-unit-economics)). ShipBob's webhooks include billing topics (charge, refund and credit created) for that reason; a 3PL that only sends a monthly PDF makes contribution margin a spreadsheet exercise.

## Amazon Multi-Channel Fulfillment and FBA

Fulfillment by Amazon stores a seller's inventory in Amazon's network and ships its Amazon orders; Multi-Channel Fulfillment (MCF) ships the seller's orders from other channels out of the same inventory. For the system they are one location (or a group) with two ways to create outbound work.

**Outbound through MCF.** The Fulfillment Outbound API offers a fulfillment preview (what speeds and dates are possible for an address), delivery offers, and create, update, cancel and tracking calls. A fulfillment order carries:

- **A speed:** `Standard`, `Expedited` or `Priority` (`ScheduledDelivery` is Japan only).
- **A fulfillment policy:** `FillOrKill` (all or nothing), `FillAll` (ship what's available and the rest when it arrives) or `FillAllAvailable` (ship what's available and cancel the rest).
- **Feature flags:** for example `BLANK_BOX`, "non-Amazon branded packaging," and a constraint to block Amazon Logistics as the carrier.

Its states are `New`, `Received` ("received and validated," still cancellable), `Planning`, `Processing` (picking has begun, so the seller can't cancel), `Complete`, `CompletePartialled`, `Cancelled`, `Unfulfillable` and `Invalid`. Amazon's peak rate card, effective October 15, 2026 to January 14, 2027, prices MCF per unit by size, weight, speed and units per order (one small standard unit up to 4 ounces is $7.53 at Standard speed, falling to $5.17 per unit for two units), adds a 3.5% fuel and logistics surcharge, and waives through January 14, 2027 the 5% surcharge for blocking Amazon Logistics on MCF orders, Walmart's included. Amazon has published instructions for fulfilling Walmart Marketplace orders through MCF in blank packaging with Amazon Logistics blocked.

**Inbound and capacity for FBA.** Amazon limits how much each seller can send, measured "in cubic feet (vs. number of units)" as a single monthly limit, with a Capacity Manager in which a seller can request more by bidding a reservation fee, offset by performance credits. Since April 2024 it also charges a low-inventory-level fee on items with too little stock relative to sales. The two together push in opposite directions (not too much, not too little) and make FBA replenishment a planning problem [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#forecasting) treats.

[Selling on Amazon](/books/commerce/selling-on-amazon#fulfillment-by-amazon-as-a-selling-program) covers FBA as a selling program; here it is a location with an API, a rate card, capacity limits and reports to reconcile.

## Walmart Fulfillment Services

WFS is Walmart's equivalent for Walmart Marketplace sellers: the seller sends inventory, Walmart stores it, and orders placed on Walmart ship in "two days or less." The published US fees, as of the page updated May 27, 2026, are by shipping weight ($3.45 up to 1 lb, $4.95 at 2 lb, $5.45 at 3 lb, and $5.75 plus $0.40 a pound over 4 lb up to 20 lb), with monthly storage of $0.75 per cubic foot from January to September, an added $1.50 a cubic foot from October to December for items stored more than 30 days, and long-term storage fees of $2.25 a cubic foot from 366 to 450 days and $7.50 beyond, effective June 30, 2026.

Walmart's Multichannel Solutions, launched September 10, 2024, ships orders from other channels out of WFS inventory, in "unbranded poly bags or brown boxes with plain tape and dunnage," at 2 business days for expedited and 3 to 5 for standard, without a speed guarantee from October 1 to December 31. Each network's packaging rules for the other's orders are policy that changes; the system stores the packaging and carrier constraints per channel per provider rather than hard-coding them.

## Integrating With a 3PL

A brand's systems and a 3PL exchange the same five messages whatever the transport:

| Message | Direction | API example | EDI (X12) |
| --- | --- | --- | --- |
| **Item master** | Brand to 3PL | ShipBob products | Usually a file |
| **Inbound notice** | Brand to 3PL | ShipBob WRO, ShipMonk receiving, Amazon inbound plan, Walmart inbound order | 943 Warehouse Stock Transfer Shipment Advice, or the supplier's 856 |
| **Receipt** | 3PL to brand | `wro.completed` webhook | 944 Warehouse Stock Transfer Receipt Advice |
| **Shipping order** | Brand to 3PL | Create order; Shopify fulfillment request; MCF create fulfillment order | 940 Warehouse Shipping Order: "advise a warehouse to make a shipment, confirm a shipment, or modify or cancel" one |
| **Shipment confirmation** | 3PL to brand | `order.shipped` with tracking | 945 Warehouse Shipping Advice: "advise the depositor... that shipment was made" |
| **Inventory** | 3PL to brand | Get inventory; inventory history | 846 Inventory Inquiry/Advice, 947 Warehouse Inventory Adjustment Advice |
| **Charges** | 3PL to brand | `billing.charge.created` | 810 Invoice |

The X12 sets, envelopes, acknowledgments and partner testing behind the right-hand column are [EDI](/books/commerce/edi).

Shopify formalizes the shipping-order half as a handshake. A 3PL registers a fulfillment service (each corresponds to an inventory location) with a callback URL, and optionally manages inventory and supplies tracking. When a merchant submits a fulfillment request, Shopify notifies the service with a `FULFILLMENT_REQUEST`; the service finds its work with `assignedFulfillmentOrders` and accepts or rejects it, later creates fulfillments with tracking, and handles `CANCELLATION_REQUEST` the same way, accepting or rejecting. A partial request splits the fulfillment order into submitted and unsubmitted parts. That handshake is the `request_status` column [Order Management](/books/commerce/order-management#how-to-build-it) adds to fulfillments, and it's the right shape for any provider, Shopify or not.

Rules for the integration:

- **Idempotent in both directions.** Orders sent to the 3PL carry the fulfillment ID as their reference, so a retry can't create a second shipment; webhooks from the 3PL are deduplicated by their event ID ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Verify and keep up.** ShipBob signs webhooks (with `webhook-id`, `webhook-timestamp` and `webhook-signature` headers), retries with exponential backoff and disables an endpoint after five days of failures. A receiver that verifies signatures and alerts on silence is the minimum ([Verifying](/docs/api-design/webhooks#verifying)).
- **Poll as a backstop.** Webhooks get lost; a periodic pull of shipped orders and inventory catches what they missed, keyed by the same IDs.
- **Pin and upgrade API versions.** ShipBob's versions live 24 months; the integration records which version it calls and has a date to move ([Versioning](/docs/api-design/versioning)).
- **Map statuses, keep the raw one.** Each provider's order and shipment states map to the fulfillment's states, with the provider's status and event stored beside them, as with delivery networks ([The Order Lifecycle](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle)).
- **Reconcile inventory daily.** The 3PL's snapshot against the brand's levels, with differences posted as movements and investigated over a threshold ([Movements, Not Overwrites](/books/commerce/inventory#movements-not-overwrites)).
- **Keep EDI documents as exchanged.** A 945 is the 3PL's statement of what it shipped and the evidence in a dispute about what it didn't ([Documents Are Kept as Exchanged](/books/commerce/commerce-business#the-core-data-model)).

## SLAs and What They Measure

A 3PL contract is mostly its SLA and its liability clauses. The measures recur across providers and in WERC's DC Measures benchmarking study, whose 2026 report ranks on-time shipments first and dock-to-stock time second among warehouse metrics, with order picking accuracy also in its top ten (the ranking here comes from a summary of the report, not WERC's own page). <!-- source-gap: werc-dc-measures-2026 | secondary | WERC 2026 DC Measures ranking (on-time shipments first, dock-to-stock second, picking accuracy seventh) and best-in-class values (on-time at least 99.5%, dock-to-stock under 3.1 hours, picking accuracy at least 99.7%) | closes with: WERC's own DC Measures report or page, which returned 403 | checked: 2026-10-28 -->

| Measure | What it means | Published examples |
| --- | --- | --- |
| **Order cutoff** | Orders received before it ship the same business day | ShipBob: noon to 6 p.m. local time of the fulfilling center, for DTC orders |
| **Ship SLA** | Business days from order release to carrier scan | WFS: picks, packs and ships in two days or less |
| **Dock-to-stock** | Time from arrival to sellable | ShipMonk: received and put away within three business days |
| **Order accuracy** | Orders shipped with the right items and quantities | ShipMonk: 100%, remedied by the lesser of return postage or replacement value |
| **Damage** | Units damaged by handling or packaging | ShipMonk: under 2% breakage from improper packaging |
| **Inventory accuracy and loss** | Counts that match, and who pays for lost units | ShipMonk: missing full cartons covered up to $10 a unit, or $250 with its optional verified inventory service |
| **Peak exceptions** | SLAs relaxed in the fourth quarter | Walmart MCS: speeds not guaranteed October 1 to December 31 |

Three points for the system:

- **Measure it yourself.** Order release time, the 3PL's acceptance, the carrier's first scan and the receipt timestamps are all in the brand's records; computing the SLA from them is what makes a credit claim possible.
- **Business days and local time.** Cutoffs are per building in its time zone, and SLAs count business days with holidays; both belong on the provider account, not in code ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)).
- **Liability caps are low.** A per-unit cap far below the item's value means the brand self-insures most losses; an expensive item may need the 3PL's higher-coverage option or a cycle count cadence that finds losses early.

## How to Build It

The core model treats a 3PL's building or a marketplace network as a location with `operator` set and a fulfillment with a `provider`. Warehouses and 3PLs add the account behind them, inbound transfers, and pick tasks for the merchant that runs its own building:

```sql
CREATE TABLE fulfillment_provider_accounts (  -- a 3PL, FBA/MCF, WFS, a drop-ship supplier
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id        UUID NOT NULL REFERENCES merchants (id),
  connected_system_id UUID REFERENCES connected_systems (id),  -- credentials, sync state
  provider           TEXT NOT NULL,      -- 'shipbob', 'shipmonk', 'amazon_mcf', 'walmart_wfs'
  account_ref        TEXT NOT NULL,      -- the provider's merchant or seller ID
  api_version        TEXT,               -- e.g. '2026-07'; upgrade before it retires
  transport          TEXT NOT NULL CHECK (transport IN ('api', 'edi', 'file', 'platform_app')),
  channels_allowed   TEXT[] NOT NULL DEFAULT '{}',  -- empty: every channel
  packaging_rules    JSONB NOT NULL DEFAULT '{}',   -- e.g. {"walmart": "blank_box"}
  carrier_rules      JSONB NOT NULL DEFAULT '{}',   -- e.g. {"walmart": {"block": ["amzl"]}}
  status             TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'paused',
                       'closed')),
  UNIQUE (merchant_id, provider, account_ref)
);

CREATE TABLE fulfillment_provider_slas (  -- what the contract promises, per building
  provider_account_id UUID NOT NULL REFERENCES fulfillment_provider_accounts (id),
  location_id         UUID NOT NULL REFERENCES locations (id),
  order_cutoff_local  TIME,              -- same-day cutoff in the location's time zone
  ship_business_days  SMALLINT,          -- release to carrier scan
  receive_business_days SMALLINT,        -- arrival to sellable
  accuracy_target_bp  INT,               -- basis points, e.g. 9990
  loss_cap_per_unit   BIGINT,            -- minor units
  holiday_calendar    TEXT NOT NULL,     -- business days exclude these
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (provider_account_id, location_id, valid_during)
);

ALTER TABLE locations
  ADD COLUMN provider_account_id UUID REFERENCES fulfillment_provider_accounts (id),
  ADD COLUMN provider_location_ref TEXT;  -- the provider's warehouse or FC code

ALTER TABLE fulfillments
  ADD COLUMN provider_account_id UUID REFERENCES fulfillment_provider_accounts (id),
  ADD COLUMN provider_status     TEXT,   -- raw, e.g. 'Processing', 'CompletePartialled'
  ADD COLUMN accepted_at         TIMESTAMPTZ,
  ADD COLUMN first_scan_at       TIMESTAMPTZ;  -- the carrier's first event, for the SLA

CREATE TABLE inbound_transfers (         -- stock on its way to a location
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  from_location_id  UUID REFERENCES locations (id),  -- null: from a supplier
  purchase_order_id UUID REFERENCES purchase_orders (id),
  to_location_id    UUID NOT NULL REFERENCES locations (id),
  provider_ref      TEXT,                -- WRO ID, Amazon inbound plan or shipment ID, WFS IO
  package_type      TEXT NOT NULL CHECK (package_type IN ('parcel', 'pallet',
                      'floor_loaded')),
  status            TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'in_transit',
                      'arrived', 'receiving', 'received', 'closed', 'cancelled')),
  placement_fee     BIGINT,              -- minor units, when the network charges one
  shipped_at        TIMESTAMPTZ,
  arrived_at        TIMESTAMPTZ,
  received_at       TIMESTAMPTZ,         -- arrival to here is dock-to-stock
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (to_location_id, provider_ref)
);

CREATE TABLE inbound_transfer_lines (    -- expected against received, per carton
  inbound_transfer_id UUID NOT NULL REFERENCES inbound_transfers (id),
  item_id             UUID NOT NULL REFERENCES items (id),
  carton_sscc         CHAR(18) NOT NULL DEFAULT '',  -- GS1 SSCC; '' for unlabeled
  lot                 TEXT NOT NULL DEFAULT '',
  quantity_expected   INT NOT NULL CHECK (quantity_expected >= 0),
  quantity_received   INT NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  quantity_damaged    INT NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
  PRIMARY KEY (inbound_transfer_id, item_id, carton_sscc, lot)
);

CREATE TABLE pick_tasks (                -- for a building the merchant runs itself
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id    UUID NOT NULL REFERENCES locations (id),
  wave_ref       TEXT,                   -- the wave or batch this task belongs to
  method         TEXT NOT NULL CHECK (method IN ('discrete', 'batch', 'zone', 'cluster')),
  fulfillment_id UUID REFERENCES fulfillments (id),  -- null for a batch pick
  item_id        UUID NOT NULL REFERENCES items (id),
  bin            TEXT NOT NULL,
  lot            TEXT,
  quantity       INT NOT NULL CHECK (quantity > 0),
  quantity_picked INT,
  tote_ref       TEXT,                   -- the LPN of the tote or cart
  picker_ref     TEXT,
  status         TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'picked', 'short',
                   'cancelled')),
  completed_at   TIMESTAMPTZ
);
```

Design notes:

- **The account holds the policy.** Which channels a provider may fulfill, which packaging and carriers each channel requires, the API version in use and the SLA in force are rows, because they change by contract and by marketplace policy, not by release.
- **SLAs are time-ranged and per building.** A renegotiated cutoff or a peak-season exception is a new row with its own validity, and SLA reports join fulfillments to the row in force when each order was released.
- **Inbound transfers own in-transit stock.** The lines' expected quantities are what the brand believes is on the truck; received and damaged quantities post as inventory movements at the destination, and the gap is a claim.
- **SSCC is the carton's identity.** It links a physical carton to its line on the notice, so a receiver's scan settles which carton was short.
- **Pick tasks exist only where the merchant runs the floor.** A 3PL's picking is its own business; for those locations the brand sees the fulfillment's provider status and nothing finer. A brand running its own building either uses a WMS (whose tasks are mirrored by reference) or this table.
- **Charges come in as order charges or documents.** A 3PL's per-order fulfillment fee becomes an `order_charges` row of kind `fulfillment_fee` paid by the merchant; the monthly invoice is a `documents` row reconciled to those charges, the same pattern as a marketplace settlement.

## Auditing

- **Every inbound.** The notice as sent, each carton's SSCC, expected against received and damaged, timestamps from shipped to received, and any placement fee.
- **Every request and response.** Each shipping order sent, the provider's acceptance or rejection, cancellation requests and their outcomes, and the raw provider status history, so "we told them on time" can be shown.
- **Every SLA measurement.** Release, acceptance, first carrier scan and receipt times, computed against the SLA row in force, with the credits claimed.
- **Every reconciliation.** Daily inventory snapshots from each provider against the brand's levels, the movements posted from the differences, and who approved them.
- **Every charge.** Per-order fees, storage and special-project charges with the invoice they came from, as received.

## What This Means for the System You Build

- **Treat every 3PL building and marketplace network as a location** with a provider account, and keep its policies (channels, packaging, carriers, API version) as data.
- **Model inbound shipments as transfers** with expected and received quantities per carton, and count in-transit stock as owned but not sellable.
- **Use a request-and-accept handshake** for every shipping order, and treat cancellation after acceptance as a request.
- **Make every exchange idempotent,** verify and monitor webhooks, and poll as a backstop.
- **Reconcile provider inventory daily** and post differences as movements.
- **Store SLAs per building with time ranges,** in local time and business days, and measure them from your own timestamps.
- **Know each network's rules for other channels' orders** (blank boxes, blocked carriers, surcharges) and apply them per order.
- **Bring 3PL charges in per order,** so margin per order and SKU includes fulfillment.

## References

**Provider documentation and terms**

- [ShipBob Developer API](https://developer.shipbob.com/), the 2026-07 default version and the API areas
- [ShipBob: API versioning](https://developer.shipbob.com/2026-07/versioning.md), January and July releases supported for 24 months
- [ShipBob: Receiving guide](https://developer.shipbob.com/2026-07/guides/receiving.md), warehouse receiving orders, box and WRO statuses, package types and polling advice
- [ShipBob: Webhooks](https://developer.shipbob.com/2026-07/webhooks.md), order, shipment, return, receiving and billing topics, signature headers, retries and disabling after five days
- [ShipBob: Fulfillment centers](https://www.shipbob.com/fulfillment-centers/), the 60+ center network and the noon-to-6 p.m. same-day cutoff
- [ShipBob: Pricing](https://www.shipbob.com/pricing/), quotes customized per customer
- [ShipMonk: API documentation](https://apidocs.shipmonk.com/llms.txt), API areas and webhooks
- [ShipMonk: Service level agreement](https://www.shipmonk.com/service-level-agreement), receiving within three business days, accuracy and breakage commitments and carton liability
- [ShipMonk](https://www.shipmonk.com/), the 95% of the US within two days claim
- [ShipMonk: 3PL warehousing](https://www.shipmonk.com/lp/3pl-warehousing), 11 global locations
- [ShipMonk: Pricing](https://www.shipmonk.com/pricing), custom quotes and the monthly minimum formula
- [Amazon Selling Partner API: Fulfillment Outbound API model](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/fulfillment-outbound-api-model/fulfillmentOutbound_2020-07-01.json), operations, fulfillment order statuses, speeds, fulfillment policies and the blank-box feature
- [Amazon Selling Partner API: Fulfillment Inbound API v2024-03-20](https://developer-docs.amazon/sp-api/docs/fulfillment-inbound-api-v2024-03-20-reference), inbound plans
- [Amazon Selling Partner API: Fulfillment Inbound API model](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/fulfillment-inbound-api-model/fulfillmentInbound_2024-03-20.json), packing and placement options and cancellation charges
- [Amazon: MCF rate card](https://supplychain.amazon.com/docs/rate-card), peak fees from October 15, 2026, the fuel and logistics surcharge and the waived Amazon Logistics block surcharge
- [Amazon: MCF pricing](https://supplychain.amazon.com/mcf/pricing), the 2026 average increase and multi-unit savings
- [Amazon: Fulfill Walmart Marketplace orders using Amazon MCF (November 13, 2025)](https://supplychain.amazon.com/blog/fulfill-walmart-marketplace-orders-using-amazon-mcf), blank packaging and blocking Amazon Logistics
- [Amazon: Update to US referral and FBA fees (December 5, 2023)](https://sellingpartners.aboutamazon.com/Update%20to%20US%20referral%20and%20Fulfillment%20by%20Amazon%20fees), the inbound placement service fee and the low-inventory-level fee
- [Amazon Seller Forums: 2026 US FBA fee changes](https://sellercentral.amazon.com/seller-forums/discussions/t/f3fa3211-820b-4e2e-a023-158a9cf55f99), the $0.08 average increase from January 15, 2026
- [Amazon: FBA capacity limits (January 17, 2023)](https://sell.amazon.com/blog/announcements/fba-capacity), monthly limits in cubic feet and Capacity Manager
- [Walmart Marketplace: Walmart Fulfillment Services](https://marketplace.walmart.com/walmart-fulfillment-services/), the two-day ship commitment
- [Walmart Marketplace Learn: WFS fees (updated May 27, 2026)](https://marketplacelearn.walmart.com/guides/Walmart%20Fulfillment%20Services%20(WFS)/WFS%20basics/WFS-fees), fulfillment, storage and long-term storage fees
- [Walmart: Multichannel Solutions announcement (August 27, 2024)](https://corporate.walmart.com/news/2024/08/27/walmart-marketplace-accelerates-growth-launches-category-expansion-multichannel-solutions-and-omnichannel-innovations-for-sellers), the September 10 launch
- [Walmart Marketplace Learn: Multichannel Solutions basics](https://marketplacelearn.walmart.com/guides/Walmart%20Fulfillment%20Services%20(WFS)/Walmart%20Multichannel%20Solutions/multichannel-solutions-mcs-basics), unbranded packaging, channels and speeds
- [Walmart Marketplace Learn: Shipping and fulfillment policy (updated July 2, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Shipping%20&%20fulfillment/Shipping-and-fulfillment-policy), Multi-Channel Fulfillment in neutral packaging and unbranded vehicles
- [Walmart Developer: Create an inbound shipment order](https://developer.walmart.com/us-marketplace/docs/create-an-inbound-shipment-order-io), inbound orders split across centers and the transfer service
- [Shopify: fulfillmentServiceCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/fulfillmentServiceCreate), registering a fulfillment service with a callback, inventory management and tracking
- [Shopify: Build for fulfillment services](https://shopify.dev/docs/apps/build/orders-fulfillment/fulfillment-service-apps/build-for-fulfillment-services), fulfillment and cancellation requests, accept and reject, and `assignedFulfillmentOrders`
- [Shopify: fulfillmentOrderSubmitFulfillmentRequest](https://shopify.dev/docs/api/admin-graphql/latest/mutations/fulfillmentOrderSubmitFulfillmentRequest), partial requests and the resulting fulfillment orders

**Filings**

- [Shopify: First quarter 2023 results (May 3, 2023)](https://www.sec.gov/Archives/edgar/data/1594805/000159480523000023/exhibit991pressreleaseq120.htm), the agreement to sell the logistics business to Flexport for a 13% equity interest
- [Shopify: Completion of the sale of its logistics businesses to Flexport (June 6, 2023)](https://www.sec.gov/Archives/edgar/data/1594805/000159480523000033/pressrelease-shopifycomple.htm), the closing

**WMS and standards**

- [Oracle Warehouse Management Cloud: Definitions](https://docs.oracle.com/en/cloud/saas/warehouse-management/26c/owmol/definitions.html), ASN, outbound LPN and wave
- [NetSuite WMS: Wave picking](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1548078883.html), single-order and bulk picking
- [X12: Transaction sets](https://x12.org/products/transaction-sets), the 846, 856, 940, 943, 944, 945 and 947 names
- [X12: 940 Warehouse Shipping Order](https://x12.org/node/4444), its purpose
- [X12: 945 Warehouse Shipping Advice](https://x12.org/node/4447), its purpose
- [GS1 US: An Introduction to the Serial Shipping Container Code](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:494e625b-e1d8-4bbd-a1be-5918879cfc3d/An-Introduction-to-the-Serial-Shipping-Container-Code-SSCC.pdf), the 18-digit SSCC, GS1-128 and linking a scan to the ASN

**Research**

- [Yale Materials Handling: WERC 2026 DC Measures white paper (August 2026)](https://www.yale.com/4a4034/globalassets/coms/yale/north-america/documents/white-papers/yal-1558_werc2026updates_improvingdcmetricswhitepaper.pdf), a summary of WERC's ranking of warehouse metrics
