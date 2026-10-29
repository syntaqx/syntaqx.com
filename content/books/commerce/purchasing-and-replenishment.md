+++
title = "Purchasing & Replenishment"
description = "Suppliers, purchase orders, lead times, MOQs, forecasting, reorder points and safety stock, landed cost, receiving against ASNs and returns to vendor."
category = "Commerce Industry"
order = 2322
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "purchasing", "replenishment", "forecasting", "suppliers", "landed-cost"]
+++

Every unit a merchant sells was bought first. A phone accessory brand orders forty thousand screen protectors from a factory twelve weeks before it needs them, paying for a container's worth because the factory won't make fewer; a subscription brand orders its quarterly product to arrive before the renewal wave; a store reorders a fast seller every Tuesday from a distributor who delivers Thursday. Purchasing is the side of commerce that turns a forecast into a commitment of cash, weeks or months before a customer pays, and replenishment is the loop that decides when and how much to buy again. Get it wrong one way and the cash sits in a warehouse as stock nobody wants; get it wrong the other way and the listing goes out of stock, the marketplace ranking drops and the advertising budget buys nothing.

This chapter covers suppliers and what the merchant knows about each item it buys, purchase orders, lead times, minimum order quantities and pack sizes, forecasting, reorder points and safety stock, landed cost, receiving against advance ship notices, and returning goods to the vendor. It extends `suppliers`, `purchase_orders` and `purchase_order_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The direction matters: a `purchase_orders` row is what this merchant buys; a retailer's purchase order to this merchant is an `orders` row ([Selling Order Versus Purchase Order](/books/commerce/commerce-business#the-core-data-model)). The counts that replenishment reads are Inventory's; the transaction sets a supplier exchanges by EDI (the 850 purchase order, 855 acknowledgment, 856 ship notice and 810 invoice) are EDI's in depth; booking inventory at cost and its valuation are Commerce Accounting's; and goods bought from abroad clear customs as [Cross-Border Commerce](/books/commerce/cross-border-commerce#customs-entry-and-duties) describes.

## How the Platforms Do It

As of October 2026, from each product's own documentation:

| System | Purchase orders | Replenishment | Lead times | Receiving | Landed cost |
| --- | --- | --- | --- | --- | --- |
| **Shopify** | A purchase order "lists the products, quantities, costs, payment terms, and supplier details"; saved as a draft, then marked Ordered once the supplier confirms | Not described on the purchase order pages | Not described on the purchase order pages | An inventory transfer from the supplier to "track shipments, receive inventory, and add cost adjustments"; full or partial receipt | Cost adjustments on the transfer |
| **Odoo** | Request for quotation, then purchase order | Reordering rules with Min, Max and a multiple; Auto (a scheduler, daily by default, or a sale that drops the forecast below Min) or Manual (listed on a replenishment report) | Vendor lead time, purchase security lead time, days to purchase; "Expected Arrival" is "Order Deadline + Vendor Lead Time" | Receipts against the order | Landed cost lines split equally, by quantity, current cost, weight or volume |
| **Microsoft Dynamics 365 Business Central** | Supply orders suggested by the planning system | Fixed Reorder Qty., Maximum Qty., Order and Lot-for-Lot policies, with order modifiers (minimum, maximum, multiple) | The reorder point "represents demand during lead time"; orders moved off nonworking days by calendar | Not on the planning pages cited | Not on the planning pages cited |
| **ERPNext** | Purchase orders, with a purchase receipt created from them | Not on the receipt page cited | Not on the receipt page cited | A purchase receipt "records the quantity that actually arrived," accepted and rejected quantities to separate warehouses, quality inspection required where set | A Landed Cost Voucher "updates inventory valuation without rewriting the original receipt" |

Three patterns:

- **The receipt is its own record.** Every system separates what was ordered from what arrived: Shopify through a transfer, ERPNext through a purchase receipt, Odoo through receipts against the order. One order is received in several parts, and the order closes only when the rest "will never be received or billed," in ERPNext's words.
- **Replenishment is rules over a projection.** Odoo's Min and Max and Business Central's reorder point both compare a projected stock level (on hand plus what's on order less what's committed) with a threshold, and order up to a level or a fixed quantity, rounded by the supplier's constraints.
- **Landed cost is allocated after the fact.** Freight and duty invoices arrive after the goods; Odoo and ERPNext let them be spread over the received units later, and Shopify takes cost adjustments on the transfer, changing the inventory value without changing the receipt.

## Suppliers and What You Buy From Them

A supplier is a manufacturer, a distributor, a drop-ship partner or a print-on-demand service (the core `suppliers.kind`). What the merchant needs to know is per item per supplier, because the same item can come from two factories at two costs:

- **The supplier's part number** and description, which is what goes on the PO and comes back on the invoice.
- **Cost,** in the supplier's currency, with quantity breaks, and its effective dates.
- **Minimum order quantity (MOQ),** case pack and order multiple: the factory won't run fewer than 5,000; the distributor sells only in cases of 24.
- **Lead time,** from order to arrival at the merchant's dock, and how much it varies.
- **Trade terms:** payment terms (net 30, a deposit and balance on shipment), the Incoterm that says where the merchant takes over the freight and the risk ([Incoterms: DAP and DDP](/books/commerce/cross-border-commerce#incoterms-dap-and-ddp)), and the ship-from location.
- **A priority,** when an item has a primary and a backup supplier.

Suppliers are measured the way retailers measure brands: on-time arrival against the promised date, fill rate (units received over units ordered), receiving accuracy (did the ASN match the cartons) and quality (units rejected at inspection). Those scores come straight out of the receipts this chapter records, and they feed the lead-time and safety stock numbers below.

## Purchase Orders

A purchase order is a commitment to buy, and its life follows the core model's states:

1. **Draft,** built by a buyer or suggested by replenishment.
2. **Sent** to the supplier by email, portal or EDI 850. Approval rules usually sit in front of this step for orders over a value.
3. **Acknowledged:** the supplier confirms, changes or rejects lines (by EDI 855 for suppliers on EDI). A change in quantity or date is recorded against the line as acknowledged, not by overwriting what was ordered.
4. **Shipped:** the supplier sends an advance ship notice (an EDI 856) with the cartons, quantities and tracking or the bill of lading.
5. **Partially received** and **received,** as receipts post.
6. **Closed,** when nothing more will arrive or be billed, with any short quantity cancelled; or **cancelled** before anything ships.

A PO carries the money side too: the expected cost per line, the supplier's invoice when it comes (an EDI 810 or a PDF), and the match between them. **Three-way match** compares the PO (what was agreed), the receipt (what arrived) and the invoice (what was billed), line by line, and pays only what all three support; a difference in price or quantity outside a tolerance holds the invoice for review. ERPNext's accounting shows why the receipt matters on its own: with perpetual inventory, the receipt books stock value against "Stock Received But Not Billed," and the purchase invoice later creates the payable. The PO is a `documents` row as sent, and so are the acknowledgment, ship notice and invoice as received.

## Lead Times

The lead time is what makes purchasing a forecast. Odoo breaks it into pieces that apply to any business: **days to purchase** (how long the supplier takes to confirm an order), **vendor lead time** (from order to arrival), and a **purchase security lead time** added as a buffer for supplier delays; its order deadline is today plus days to purchase, and its expected arrival is the "Order Deadline + Vendor Lead Time." For an imported product the vendor lead time is itself a chain: production, the trucking to the port, the ocean or air leg, customs clearance, the drayage and the receiving dock, each with its own variance.

Two properties matter more than the average:

- **Variability.** A lead time that is 60 days on average but ranges from 45 to 90 needs more safety stock than a steady 70. Record each PO's promised and actual arrival so the variance is measured, not guessed.
- **Calendars.** Factories close for holidays (a long closure stops orders for weeks), ports congest at peak, and Business Central moves a suggested order off a nonworking day using the location's calendar. Lead times are working days on a calendar, not a constant.

## MOQs, Case Packs and Order Multiples

The quantity replenishment wants is rarely the quantity a supplier will sell. Business Central's order modifiers capture the rules every system needs: increase the order to a **minimum order quantity**, decrease it to a **maximum order quantity** (splitting into several supplies to reach the total), and round up to an **order multiple**. Odoo's multiple works the other way: with a multiple of 3, a Max of 20 and a forecast of 7, the need is 13 and Odoo orders 12, rounding down to stay within Max. Which way to round is a decision with a cost on each side (too much stock, or a reorder sooner), so it's a setting per rule, not a hidden default.

MOQs change the economics of small brands. A factory's 5,000-unit minimum on a slow variant can be a year of stock; the choices are to pay a higher unit cost for a smaller run, combine variants into one production run, or drop the variant. The supplier item record keeps the MOQ and its cost break so the buyer can see that choice.

## Forecasting

Replenishment needs demand per item, per location, per period, for at least the lead time ahead. The methods that cover most commerce, from Hyndman and Athanasopoulos's *Forecasting: Principles and Practice*:

- **Simple exponential smoothing,** a weighted average of past demand with weights that decline for older periods; "suitable for forecasting data with no clear trend or seasonal pattern."
- **Holt-Winters,** which extends it with trend and seasonality: additive when "the seasonal variations are roughly constant," multiplicative when they change "proportional to the level of the series." Holiday-heavy categories are multiplicative.
- **Croston's method** for intermittent demand (most weeks zero, then a few units), which smooths the size of non-zero demands and the gaps between them separately. The book warns its forecasts "are also known to be biased" and have no algebraic prediction intervals, but it is widely used for long-tail SKUs.
- **Judgment and analogy** for new products with no history: a forecast borrowed from a similar item's launch, adjusted by a buyer.

The commerce-specific parts are what to forecast and what to clean out of history:

- **Forecast demand, not sales.** A week the item was out of stock shows zero sales, not zero demand; history must be corrected for stockouts or the forecast learns to stock out again.
- **Separate the events.** A promotion, a Prime Day, a retailer's large one-time PO or a viral week inflates history; record them as events so the baseline excludes them and planned events are added back.
- **Aggregate where it's stable.** Forecast at item and week across all channels, then split by location using recent shares, because a single store's daily sales are too noisy to forecast directly.
- **Measure error and bias,** per item, every period, and keep each forecast as published so error can be computed against it later. The playbook's [Monitoring and Drift](/docs/data/data-science-platforms#monitoring-and-drift) covers watching a model in production.

## Reorder Points and Safety Stock

Business Central states the rule in one sentence: "A reorder point represents demand during lead time." When projected stock falls below it, order. Safety stock covers the rest: the reorder point is demand over the lead time plus a buffer for demand and lead-time variation. The common sizing, for a target service level with normally distributed demand:

```text
reorder point = average daily demand x lead time (days) + safety stock
safety stock  = z x sqrt( lead time x sd(daily demand)^2 + avg daily demand^2 x sd(lead time)^2 )
```

where `z` is the service factor (about 1.65 for a 95% chance of not stocking out during a replenishment cycle). With a steady lead time the second term drops out and safety stock is `z x sd(daily demand) x sqrt(lead time)`. The formula is a starting point; its assumptions (normal demand, independent days) fail for intermittent and promotional items, which is where Croston-style forecasts and judgment take over.

Then the policy decides how much to order:

| Policy | How much | Good for |
| --- | --- | --- |
| **Fixed reorder quantity** | The same quantity each time (often an economic order quantity or the MOQ) | Cheap, stable items; Business Central suggests it for "low inventory cost" and "low risk of obsolescence" |
| **Order up to a maximum (min/max)** | The gap between projected stock and the maximum | Most stocked items; Odoo's Min/Max and Business Central's Maximum Qty. |
| **Lot-for-lot** | Exactly the forecast or ordered demand in a time bucket | Items where stock "can be accepted but should be avoided" |
| **Order (make or buy to order)** | Exactly one demand, linked to it | Custom and infrequent items |

The economic order quantity balances ordering cost against holding cost: `EOQ = sqrt(2 x annual demand x cost per order / holding cost per unit per year)`; in practice MOQs and case packs usually decide the quantity before EOQ does.

**Continuous or periodic review.** A system that checks after every sale (Odoo's automatic rules, triggered by a sale that drops the forecast below Min) orders the moment the threshold is crossed; one that reviews on a schedule (a weekly order to one distributor) needs safety stock for the review period as well as the lead time. Business Central's time buckets are the periodic version: they gather demand "to make a joint supply order," reflecting "the manual process of checking the inventory level on a frequent basis rather than for each transaction."

**Projected, not on hand.** Every rule compares a projection: on hand, plus open purchase orders arriving within the lead time, less committed and reserved demand. Ignoring open POs orders the same stock twice; ignoring the ASN's revised date assumes stock that is still at sea.

## Landed Cost

The landed cost of a unit is everything it cost to get it onto the merchant's shelf: the supplier's price plus freight, insurance, customs duties, brokerage, port and handling fees, and inbound trucking. Odoo's definition covers "the cost of shipment, insurance, customs duties, taxes, and other fees." Landed cost, not the supplier's price, is the unit cost that margin, pricing and inventory valuation should use.

The costs arrive on different invoices from different parties at different times, so they are allocated to the received units after the fact, by a rule per cost type. Odoo's split methods are the standard set: **equal** per line, **by quantity**, **by current cost** ("a product with a higher cost receives a greater share"), **by weight** and **by volume**. Freight is usually split by weight or volume (a container's cost follows its cubic meters), duty by the value of the goods it was levied on, a brokerage fee by line or equally. ERPNext's Landed Cost Voucher shows the right posture: it allocates a later charge to the received items and "updates inventory valuation without rewriting the original receipt."

The duty itself has a different base from the landed cost. US customs value is generally the transaction value, "the price actually paid or payable for the merchandise when sold for exportation to the United States," plus packing, selling commissions, assists, royalties and resale proceeds, and the price excludes international freight and insurance (19 U.S.C. 1401a). So the freight is part of landed cost but not part of the US duty base, while the UK, for one, includes transport and insurance "up to the place of introduction of the imported goods into the UK border" in its customs value ([Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties)). The allocation records which value each line's duty was computed on.

## Receiving and ASNs

Receiving is where the purchase order meets the physical goods, and the advance ship notice is what lets the dock prepare. An ASN (X12 856) lists what is on the truck or in the container, by carton or pallet, with quantities per item and the PO lines they fill; cartons carry a label with a serial shipping container code that the dock scans to bring up the carton's contents without opening it (EDI covers the 856 structure and GS1-128 labels). Without an ASN the dock counts everything by hand.

The receiving steps:

1. **Check in** the shipment against the ASN or the PO: carrier, seal, carton count, visible damage.
2. **Count and match** by carton or unit: over, short, wrong item, damaged. ERPNext's receipt splits **accepted** quantity, which "counts as usable stock," from **rejected** quantity sent to a separate warehouse, "still tracked in stock, but ... kept outside the usable warehouse."
3. **Inspect** where the item requires it (ERPNext blocks submission when an item requires inspection and none is linked): a sample for apparel, every unit for electronics with serial numbers, lot and expiry dates for consumables.
4. **Post** the receipt: on hand rises at the receiving location through Inventory's movements, the PO lines' received quantities update, and the stock is valued at the PO cost until landed cost is allocated.
5. **Put away** to a bin and release the stock to channels; until then it is on hand but not available.

Discrepancies are records, not notes: a short receipt against an ASN is a claim against the supplier, a supplier's chronic ASN errors lower its score, and a receipt posted for the wrong quantity is the most common reason a store's or warehouse's count is wrong from the moment the stock arrives ([Store Inventory Accuracy](/books/commerce/omnichannel-fulfillment#store-inventory-accuracy)). A merchant using a 3PL receives through the 3PL's system and gets its receipt back; Warehouses, 3PLs & Fulfillment Networks covers the inbound shipment to a provider.

## Returns to Vendor

Goods go back up the chain too: defective units the supplier warranted, overstock a distributor agreed to take back, units rejected at receiving. A return to vendor (RTV) needs the supplier's authorization number, the units and their condition, the shipment back, and the supplier's credit memo, which offsets a future invoice. Customer returns graded "return to vendor" ([Disposition](/books/commerce/returns-and-exchanges#disposition)) accumulate until there are enough to ship, and the vendor agreement decides whether the merchant is credited at cost, at a discount, or not at all.

## How to Build It

The core model has `suppliers`, `purchase_orders` and `purchase_order_lines`. This chapter adds supplier items, acknowledgments, receipts, reorder rules, landed cost allocations and returns to vendor:

```sql
CREATE TABLE supplier_items (            -- an item as bought from one supplier
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  supplier_id        UUID NOT NULL REFERENCES suppliers (id),
  item_id            UUID NOT NULL REFERENCES items (id),
  supplier_sku       TEXT NOT NULL,
  unit_cost          BIGINT NOT NULL CHECK (unit_cost >= 0),  -- supplier's currency
  min_order_qty      INT NOT NULL DEFAULT 1 CHECK (min_order_qty > 0),
  order_multiple     INT NOT NULL DEFAULT 1 CHECK (order_multiple > 0),  -- case pack
  lead_time_days     INT NOT NULL CHECK (lead_time_days >= 0),
  lead_time_sd_days  NUMERIC(6, 2),      -- measured from receipts
  incoterm           TEXT,               -- e.g. 'FOB', 'DAP', 'DDP'
  ship_from_country  CHAR(2),
  priority           SMALLINT NOT NULL DEFAULT 1,  -- 1: primary supplier
  valid_during       TSTZRANGE NOT NULL,
  UNIQUE (supplier_id, item_id, valid_during)
);

ALTER TABLE purchase_orders
  ADD COLUMN incoterm         TEXT,
  ADD COLUMN payment_terms    TEXT,      -- copied from the supplier, may be negotiated
  ADD COLUMN approved_by      TEXT,
  ADD COLUMN sent_at          TIMESTAMPTZ,
  ADD COLUMN acknowledged_at  TIMESTAMPTZ,
  ADD COLUMN promised_at      DATE,      -- the supplier's date, from the acknowledgment
  ADD COLUMN source           TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual',
                                'reorder_rule', 'forecast', 'customer_order'));

ALTER TABLE purchase_order_lines
  ADD COLUMN supplier_item_id     UUID REFERENCES supplier_items (id),
  ADD COLUMN quantity_acknowledged INT,  -- null until the supplier confirms
  ADD COLUMN quantity_cancelled   INT NOT NULL DEFAULT 0,
  ADD COLUMN promised_at          DATE;

CREATE TABLE receipts (                  -- goods that arrived, against a PO or ASN
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  purchase_order_id  UUID REFERENCES purchase_orders (id),  -- null: unplanned receipt
  location_id        UUID NOT NULL REFERENCES locations (id),
  ship_notice_id     UUID REFERENCES documents (id),        -- the ASN, if one came
  carrier_ref        TEXT,               -- bill of lading or tracking
  status             TEXT NOT NULL CHECK (status IN ('checked_in', 'counting', 'posted',
                       'cancelled')),
  arrived_at         TIMESTAMPTZ NOT NULL,
  posted_at          TIMESTAMPTZ,
  received_by        TEXT NOT NULL
);

CREATE TABLE receipt_lines (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  receipt_id             UUID NOT NULL REFERENCES receipts (id),
  purchase_order_line_id UUID REFERENCES purchase_order_lines (id),
  item_id                UUID NOT NULL REFERENCES items (id),
  quantity_expected      INT,            -- from the ASN
  quantity_accepted      INT NOT NULL DEFAULT 0 CHECK (quantity_accepted >= 0),
  quantity_rejected      INT NOT NULL DEFAULT 0 CHECK (quantity_rejected >= 0),
  reject_reason          TEXT,           -- damaged, wrong item, failed inspection
  lot_number             TEXT,
  expires_on             DATE,
  unit_cost              BIGINT NOT NULL,  -- PO cost at receipt, before landed cost
  container_ref          TEXT            -- the carton or pallet label scanned
);

CREATE TABLE landed_cost_allocations (   -- freight, duty and fees spread over receipt lines
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  receipt_line_id  UUID NOT NULL REFERENCES receipt_lines (id),
  cost_kind        TEXT NOT NULL CHECK (cost_kind IN ('freight', 'insurance', 'duty',
                     'brokerage', 'port_fee', 'inbound_trucking', 'other')),
  source_document_id UUID REFERENCES documents (id),  -- the carrier's or broker's invoice
  split_method     TEXT NOT NULL CHECK (split_method IN ('equal', 'quantity', 'cost',
                     'weight', 'volume')),
  amount           BIGINT NOT NULL,      -- this line's share, minor units
  currency         CHAR(3) NOT NULL,
  duty_base        BIGINT,               -- the customs value the duty was computed on
  allocated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reorder_rules (             -- when and how much to buy, per item and location
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES inventory_items (item_id),
  location_id      UUID NOT NULL REFERENCES locations (id),
  supplier_item_id UUID REFERENCES supplier_items (id),  -- or a transfer from a warehouse
  policy           TEXT NOT NULL CHECK (policy IN ('fixed_quantity', 'min_max',
                     'lot_for_lot', 'to_order')),
  reorder_point    INT,                  -- min, in units
  max_level        INT,                  -- order up to
  fixed_quantity   INT,
  safety_stock     INT NOT NULL DEFAULT 0,
  review           TEXT NOT NULL CHECK (review IN ('continuous', 'periodic')),
  review_interval_days INT,              -- for periodic review
  rounding         TEXT NOT NULL DEFAULT 'up' CHECK (rounding IN ('up', 'down')),
  trigger          TEXT NOT NULL CHECK (trigger IN ('auto', 'manual')),
  computed_from    JSONB,                -- forecast version, service level, lead time used
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, location_id)
);

CREATE TABLE vendor_returns (            -- goods going back to a supplier
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  supplier_id      UUID NOT NULL REFERENCES suppliers (id),
  location_id      UUID NOT NULL REFERENCES locations (id),
  authorization_ref TEXT,                -- the supplier's RMA number
  lines            JSONB NOT NULL,       -- item, quantity, condition, source receipt or return
  shipment_id      UUID REFERENCES shipments (id),
  credit_memo_id   UUID REFERENCES documents (id),
  status           TEXT NOT NULL CHECK (status IN ('requested', 'authorized', 'shipped',
                     'credited', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items at a location below their reorder point, counting what's already on order.
SELECT r.item_id, r.location_id,
       il.on_hand - il.committed + COALESCE(po.on_order, 0) AS projected,
       r.reorder_point
FROM reorder_rules r
JOIN inventory_levels il ON il.item_id = r.item_id AND il.location_id = r.location_id
LEFT JOIN LATERAL (
  SELECT SUM(l.quantity_ordered - l.quantity_received - l.quantity_cancelled) AS on_order
  FROM purchase_order_lines l
  JOIN purchase_orders p ON p.id = l.purchase_order_id
  WHERE l.item_id = r.item_id AND p.ship_to_id = r.location_id
    AND p.status IN ('sent', 'acknowledged', 'partially_received')
) po ON TRUE
WHERE il.on_hand - il.committed + COALESCE(po.on_order, 0) < r.reorder_point;
```

Design notes:

- **Ordered, acknowledged, received, cancelled are four numbers.** A line's ordered quantity never changes after sending; the supplier's acknowledgment, the receipts and any cancellation are separate, so fill rate and the open quantity are both computable.
- **Receipts post movements.** Accepted units add on-hand at the location through Inventory's movements, rejected units go to a non-sellable location, and the PO line's `quantity_received` is the sum of its receipt lines.
- **Landed cost changes value, not the receipt.** Allocations are rows tied to receipt lines and to the invoice that justified them; [Commerce Accounting](/books/commerce/commerce-accounting) turns them into cost layers.
- **Rules record their inputs.** `computed_from` keeps the forecast version, service level and lead time that produced a reorder point, so a stockout can be traced to a bad input rather than argued about.
- **Lead times are measured.** Each receipt's arrival against the PO's `promised_at` updates the supplier item's lead time and its standard deviation, which feed the safety stock formula.
- **Purchase orders are documents.** The PO as sent, the acknowledgment, the ASN and the invoice are `documents` rows with their bytes, linked by `purchase_order_id`.
- **Emit `purchase_order.sent`, `purchase_order.acknowledged`, `receipt.posted` and `reorder_rule.triggered`** for inventory, accounting and the buyer's queue.

## Auditing

- **Every purchase order as sent** and every acknowledgment, ASN and invoice as received, as bytes.
- **Every receipt line** with expected, accepted and rejected quantities, the reason, lot and expiry, who received it and when.
- **Every landed cost allocation** with its split method, the invoice behind it and the customs value used.
- **Every reorder rule change** with the inputs it was computed from, and every automated PO with the rule that created it.
- **Every three-way match exception** and how it was resolved, and every return to vendor with its authorization and credit.

## What This Means for the System You Build

- **Keep supplier-specific facts on a supplier item:** cost, MOQ, multiple, lead time and its variance, Incoterm.
- **Never overwrite an ordered quantity;** record acknowledged, received and cancelled separately.
- **Make the receipt its own record,** with accepted and rejected quantities, and post inventory movements from it.
- **Match PO, receipt and invoice** before paying, with tolerances and recorded exceptions.
- **Forecast demand, not sales:** correct for stockouts and separate events.
- **Compute reorder points from measured lead times and forecast error,** compare them with projected stock that includes open POs, and record the inputs.
- **Apply supplier rounding rules explicitly** (minimum, maximum, multiple, round up or down).
- **Allocate landed cost after receipt** by a rule per cost type, and keep the duty base separately.
- **Keep every document exchanged with suppliers** as received.

## References

**Platforms**

- [Shopify Help: Purchase orders](https://help.shopify.com/en/manual/products/inventory/purchase-orders), purchase order contents, Draft and Ordered, and receiving through an inventory transfer with cost adjustments
- [Shopify Help: Inventory transfers](https://help.shopify.com/en/manual/products/inventory/transfers), transfers from suppliers and full or partial receipt
- [Odoo 18 documentation: Reordering rules](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/warehouses_storage/replenishment/reordering_rules.html), Min, Max, multiple quantity, auto and manual triggers and the rounding example
- [Odoo 18 documentation: Lead times](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/warehouses_storage/replenishment/lead_times.html), vendor lead time, purchase security lead time, days to purchase, order deadline and expected arrival
- [Odoo 18 documentation: Landed costs](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/inventory/product_management/inventory_valuation/landed_costs.html), landed cost types and the equal, quantity, cost, weight and volume split methods
- [Microsoft Learn: Business Central, handling reordering policies](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-handling-reordering-policies), the reorder point as demand during lead time, the four policies, order modifiers, time buckets and calendars
- [ERPNext documentation: Purchase receipt](https://docs.frappe.io/erpnext/user/manual/en/purchase-receipt), accepted and rejected quantities, quality inspection, Stock Received But Not Billed, the Landed Cost Voucher and partial receipts

**Forecasting**

- [Hyndman and Athanasopoulos: Forecasting: Principles and Practice, 3rd edition](https://otexts.com/fpp3/), the text and its authors
- [FPP3: Simple exponential smoothing](https://otexts.com/fpp3/ses.html), weighted averages of past observations for data with no clear trend or seasonality
- [FPP3: Holt-Winters' seasonal method](https://otexts.com/fpp3/holt-winters.html), additive and multiplicative seasonality
- [FPP3: Count time series](https://otexts.com/fpp3/counts.html), Croston's method for intermittent demand, its bias and missing prediction intervals

**Law and standards**

- [GOV.UK: Delivery costs to include in the customs value](https://www.gov.uk/guidance/delivery-costs-to-include-in-the-customs-value), transport and insurance up to the UK border in the customs value
- [19 U.S.C. 1401a (Cornell LII)](https://www.law.cornell.edu/uscode/text/19/1401a), transaction value, its additions and the exclusion of international freight and insurance
- [X12: Transaction sets](https://x12.org/products/transaction-sets), the 810, 850, 855 and 856 transaction sets
</content>
</invoke>
