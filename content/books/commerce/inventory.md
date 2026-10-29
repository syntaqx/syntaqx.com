+++
title = "Inventory"
description = "On hand, committed, reserved and available to promise; multi-location stock, reservations and overselling, safety stock, channel sync, cycle counts and shrink."
category = "Commerce Industry"
order = 2317
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "inventory", "available-to-promise", "reservations", "cycle-counts", "data-model"]
+++

Inventory is the number every channel asks for and no system knows exactly. The warehouse's count is right as of the last scan; the storefront's is right as of the last sync; Amazon's is right as of the last feed it accepted; the store's is right until a shopper pockets a charger. Somewhere between them a customer is buying the last unit, and two other customers on two other channels are buying it too. The work of inventory software is less about counting than about deciding, at every moment and for every channel, how many units it is safe to promise, and keeping a record of every movement good enough to find out later why the number was wrong.

This chapter covers the quantities (on hand, committed, reserved, unsellable, safety stock, incoming and available), available to promise, reservations and overselling, stock across locations, safety stock and channel buffers, sync across channels, movements as a ledger, cycle counts and shrink, and lots, serials and kits. It extends `inventory_items` and `inventory_levels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Which location ships an order is [Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)'s decision; counting inside a building is the warehouse's ([Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls)); reorder points, purchase orders and receiving are the later Purchasing & Replenishment chapter's, and store inventory accuracy for pickup the later Omnichannel Fulfillment chapter's.

## How the Platforms Do It

As of October 2026, from developer documentation:

| Platform | Quantities it keeps | Reservation and overselling | Updates and concurrency |
| --- | --- | --- | --- |
| **Shopify** | Per item per location: `available`, `committed`, `reserved`, `damaged`, `safety_stock`, `quality_control`, `incoming`; `on_hand` is the sum of every state except `incoming`; the four non-sellable states show as Unavailable | `committed` is set by Shopify for orders and can't be adjusted by the API; a variant's inventory policy is `DENY` or `CONTINUE` ("customers can buy this product variant after it's out of stock") | Set, adjust and move mutations with a reason (`received`, `correction`, `cycle_count_available`, `damaged`, `shrinkage`, `restock`, reservation and movement reasons); `changeFromQuantity` fails a write with `CHANGE_FROM_QUANTITY_STALE` if the quantity changed underneath it |
| **BigCommerce** | Stock per location; `available_to_sell`, with safety stock "not included in the Available to Sell quantity" | A relative adjustment that would take stock below the safety buffer fails | Absolute adjustments ("override of an item's stock at a specific location") and relative ones; absolute is recommended as the default, relative "only when you do not know absolute quantities" |
| **commercetools** | Inventory entries per SKU, optionally per supply channel, with stock on hand and available quantity | Inventory mode per cart: `None` (no check), `TrackOnly` (decrement at order, "allows for overselling scenarios and accepting backorders"), `ReserveOnOrder` (blocks the order if stock is short), plus cart reservations that expire after a configured number of minutes | Changes to quantities "may take up to 10 seconds to be reflected"; reservations are guaranteed regardless of that delay |
| **NetSuite** | On hand, committed and on order per location; Available to Promise as a time-phased "virtual available quantity" from expected receipts and shipments | Supply Allocation commits future supply on purchase, transfer and work orders to demand, with exceptions for orders that can't be supplied in time | Advanced Inventory Management computes demand-based reorder points, lead time, safety stock and seasonal demand on item records, recalculated on a schedule |

Three patterns:

- **"Available" is always derived.** Every system stores the parts (on hand, committed, held, buffer) and computes what may be sold. Shopify's `on_hand` is literally the sum of the other states, BigCommerce's available to sell excludes safety stock, commercetools's available quantity falls when a reservation is made and rises when it expires.
- **When stock is decremented is a setting.** commercetools makes it explicit (never, at order, or reserved at order or in the cart), Shopify commits at order, NetSuite commits by rule and can commit future supply. Each is a different answer to how much overselling the merchant will tolerate.
- **Writes are guarded.** Shopify's compare-and-set and BigCommerce's preference for absolute counts both exist because two systems writing the same count is the normal case, not the exception.

## The Quantities

Seven numbers per item per location carry almost every inventory question, and the core model already has the first two:

| Quantity | Meaning | Who changes it |
| --- | --- | --- |
| **On hand** | Physically in the building, sellable or not | Receiving, shipping, counts, adjustments |
| **Committed** | Sold on an order and not yet shipped | The order manager, at order or at sourcing; released by cancellation, consumed by shipment |
| **Reserved** | Set aside for something that isn't yet an order: a cart in checkout, a B2B quote, a drop, a store hold for a customer | Reservations, with an expiry |
| **Unsellable** | On hand but not for sale: damaged, in quality control or inspection, quarantined for a recall, a returned unit awaiting disposition | Receiving, returns, quality control |
| **Safety stock** | A buffer withheld from selling so a count error or a sync lag doesn't become an oversell | The merchant's rules |
| **Incoming** | On a purchase order or a transfer, expected but not yet received | Purchasing and transfers; not part of on hand |
| **Available** | What a channel may sell now | Nobody: it's computed |

```text
available = on_hand
          - committed
          - unsellable (damaged + quality_control + ...)
          - active reservations
          - safety stock (for this channel)
```

My rule, as in the core model: store the parts and compute `available`, per location and per channel, never as a column someone can write ([Available Is a Computation](/books/commerce/commerce-business#the-core-data-model)). A stored available count drifts the first time an order is cancelled through a path that forgot to add it back.

**Committed is released two ways.** On cancellation, the committed unit returns to available. On shipment, both committed and on hand fall by one, and available doesn't move, because the unit was already not available. A system that decrements on hand at order time instead of committing it confuses "we sold it" with "it left the building," and its counts no longer match the warehouse's until every order ships.

## Available to Promise

Available is a number for now; available to promise (ATP) is a number for a date. NetSuite's definition is the classic one: it projects "the number of items that are available to fulfill orders for that day" from the quantity "expected to be received on purchase orders, work orders, and transfer orders" and "expected to be fulfilled on sales orders and transfer orders" by their expected dates. ATP is what lets a B2B order for 100 units be promised as 50 now and 50 when the container lands, and what lets a pre-order page say "ships May 1."

In direct-to-consumer commerce the term is used more loosely, for available summed across the locations that may serve a channel, sometimes netted against capacity and cutoffs. Three versions are worth keeping apart:

- **Available to sell:** on hand less committed, unsellable and reservations, at one location. The number a store's shelf or one warehouse can back.
- **Network available to sell:** the sum over every location allowed to fulfill a channel, less that channel's buffer. The number published to a marketplace or shown on a product page.
- **Available to promise:** network availability projected forward with incoming supply and known demand, by date. The number a delivery promise or a backorder date depends on.

Two consequences for the system. The set of locations that may serve each channel is data (a store's stock may count for pickup and not for shipping; an Amazon fulfillment center's units count only for orders Amazon fulfills), so availability is computed per channel, not once. And a promise date depends on ATP and on the shipping time from the location that will ship ([Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises)), which is why the order manager's sourcing and the inventory service have to agree on the same numbers.

## Reservations

A reservation sets stock aside before it's sold. The question every system answers is when: at add to cart, at checkout, at payment, or at order. The earlier, the fewer oversells and the more stock sits in abandoned carts; the later, the opposite. commercetools exposes the choice per cart, and documents that a reservation lowers available quantity, expires after a configured number of minutes (from the inventory entry, or the project default), and is released "accordingly" when it expires.

The usual pattern for a consumer store:

- **No reservation in the cart.** Carts are cheap and mostly abandoned; reserving there lets bots and hesitant shoppers lock up stock.
- **A short reservation at checkout,** for the minutes it takes to pay, released on abandonment.
- **Commitment at order,** when payment is authorized.

The exceptions prove the rule: a limited drop reserves at entry to a queue because demand is a hundred times supply (the later Peak Season & Drops chapter), a B2B quote reserves for days, and a store holds a unit for a customer who called. Each is a reservation with an owner, a quantity, an expiry and a reason.

The mechanics are the playbook's: a hold row with an expiry enforced on read, so an expired reservation stops counting even before a cleanup job deletes it ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)), a conditional decrement against a counter for pooled stock ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)), and an idempotent confirm that turns a reservation into a commitment exactly once ([Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently)).

## Overselling

An oversell is an order for a unit that doesn't exist. It comes from three places:

- **Concurrency.** Two checkouts buy the last unit in the same second, and both read "1 available."
- **Lag.** The marketplace still shows 3 because the last feed hasn't been processed; the store sold one at the register and the online count hasn't heard yet; the 3PL's count was wrong.
- **Policy.** The merchant chose to keep selling: Shopify's `CONTINUE` policy, commercetools's `TrackOnly`, a pre-order, a made-to-order item, a supplier who always has stock.

The first is a bug and the database fixes it: a conditional decrement (`UPDATE ... SET committed = committed + $qty WHERE on_hand - committed - ... >= $qty`) or a compare-and-set write, never a read followed by a write ([The Lost Update](/docs/database/transactions-and-concurrency#the-lost-update)). The second can't be fixed, only bounded: a safety buffer sized to the lag, faster sync for items near zero, and an order manager that notices a committed unit no location can back and acts on it. The third is a business decision, and the playbook's point applies: [Overbooking Is a Policy, Not a Bug](/docs/architecture/reservations-and-holds#overbooking-is-a-policy-not-a-bug).

**An oversell has a cost and a law.** The customer gets a delay or a cancellation; a marketplace counts the cancellation against the seller (Walmart's standard is 2% or lower, [Edits and Cancellations](/books/commerce/order-management#edits-and-cancellations)); and a US seller that can't ship in the time it stated owes the buyer the option to accept the delay or cancel for a prompt refund under the FTC's Mail, Internet, or Telephone Order Merchandise Rule. Selling on backorder deliberately is lawful, but the promised ship date has to have a reasonable basis, which means ATP, not hope.

## Stock Across Locations

Inventory is counted per item per location, and the core model makes every place that holds stock a location: a warehouse, a 3PL's building, a store, an Amazon or Walmart fulfillment center holding the seller's units, a drop-ship supplier ([Stock Lives Where It Is](/books/commerce/commerce-business#the-core-data-model)). Three movements cross locations:

- **Transfers.** Stock leaves one location (on hand falls), is in transit (counted nowhere for selling, but owned and on the books), and arrives (on hand rises at the other). The in-transit quantity is real money and the place most units go missing; the later Purchasing & Replenishment chapter covers transfer orders, and inbound shipments to 3PLs and marketplace networks are in [Receiving and Inbound](/books/commerce/warehouses-and-3pls#receiving-and-inbound).
- **Marketplace networks.** Units sent to Amazon or Walmart's network sell only through that network's orders (and through its multichannel service, if the seller uses it). They're the seller's inventory, counted at a location the seller doesn't run, and reconciled against the network's reports.
- **Store stock.** A store's count is the least accurate in the network (shoppers move and take things), which is why ship-from-store and pickup programs publish store stock behind a larger buffer, or not at all, until the store's accuracy is measured.

**Location groups.** Channels and sourcing rules usually address groups (all US DCs, all stores in a market, the Amazon network) rather than individual locations; a group is a named set of locations, and network availability is computed over it.

## Safety Stock and Channel Buffers

"Safety stock" means two different things, and systems that conflate them get both wrong:

- **Replenishment safety stock** is extra stock carried to cover variable demand and supplier lead time, so the shelf doesn't run dry before the next delivery. It drives reorder points: NetSuite's Advanced Inventory Management tracks lead time, safety stock and seasonal demand on the item record and computes reorder points from past sales. It is the later Purchasing & Replenishment chapter's subject.
- **A selling buffer** is stock withheld from a channel so that lag and count errors don't oversell. Shopify's `safety_stock` state and BigCommerce's safety stock are this kind: units on the shelf that the storefront won't sell.

A selling buffer is set per item, per location or location group, and per channel, and the useful rules are simple: a fixed number of units, a percentage of on hand, or "publish zero below N." A channel that syncs slowly (a marketplace feed processed every few minutes) or that punishes cancellations hard gets a bigger buffer; the brand's own store, where an oversell becomes a backorder email, gets a smaller one. A buffer on a slow-moving item costs almost nothing; on a fast seller near the end of its stock it is real lost sales, so buffers are worth reviewing against the oversell rate they prevent.

## Sync Across Channels

A merchant selling on its own site, Amazon, Walmart, eBay and a retailer's drop-ship program publishes availability to each, and each publication is a copy that can be wrong. The rules that keep the copies close:

- **One system of record for counts.** The WMS or 3PL for warehouse stock, the point of sale for store stock, the commerce platform or OMS for the summary every channel reads. Which system owns counts is recorded, as in [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it), so a sync never overwrites the owner with a copy.
- **Absolute counts beat deltas.** BigCommerce recommends absolute adjustments as the default because a lost or repeated delta corrupts the count permanently, while a lost absolute update is corrected by the next one. Deltas are for systems that only know what changed (a register's sale); absolute snapshots reconcile them.
- **Guard writes with what you expected.** Shopify's `changeFromQuantity` rejects a write if the quantity isn't what the writer last saw; any two-writer integration needs that or a version column ([Optimistic Concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency)).
- **Prioritize the edge.** An item with 500 units can sync every hour; an item with 2 left should sync on every change. Rate limits on marketplace and platform APIs make that a priority queue, not a timer ([Limits](/docs/requests/rate-limiting#limits)).
- **Expect lag and measure it.** commercetools documents up to 10 seconds before its own quantities reflect a change; a marketplace feed can take minutes. The time from a movement to every channel's acknowledgment is a metric, and the selling buffer is sized from it.

[Multichannel Listing & Feeds](/books/commerce/multichannel-listing) covers the feed formats; here the point is that availability is a published number per channel, computed from the same parts, with a record of what was sent and when.

## Movements, Not Overwrites

Every change to a count is a movement with a reason: received, shipped, transferred out and in, returned and restocked, damaged, moved to or from quality control, counted (a cycle count variance), found, lost, written off. Shopify's adjustment reasons (`received`, `correction`, `cycle_count_available`, `damaged`, `shrinkage`, `promotion`, `restock`, reservation and movement reasons) are a usable starting vocabulary.

My rule: `inventory_levels` is a cache of the sum of movements, updated in the same transaction as each movement, and the movements are append-only ([Append-Only Records](/docs/payments/payment-states#append-only-records)). Then every count can be explained ("why does it say 4?"), every variance has a date, shrink is a sum over reasons, inventory valuation can be rebuilt from movements and costs (the later Commerce Accounting chapter), and a sync bug is found by replaying movements against what was published.

## Cycle Counts and Shrink

Counts drift from reality through mis-picks, mis-receipts, damage nobody recorded, returns put back in the wrong bin, and theft. A **full physical inventory** counts everything at once, usually closing the building for it. A **cycle count** counts a slice of locations or items every day, so every item is counted several times a year without stopping operations. Common ways to choose the slice:

- **ABC classes.** Fast-moving or high-value items (A) counted most often, slow or cheap ones (C) least.
- **Triggers.** Count a bin when it reaches zero, when a pick finds it short, when a variance was recorded recently, or when a high-value item moves.
- **Location sweeps.** Count every bin in an aisle on a rotation.

Three practices make a count trustworthy. **Blind counts:** the counter isn't shown the expected quantity, so they count instead of confirming. **Freeze or snapshot:** the system records the expected quantity at the moment the count starts and accounts for picks and receipts during the count, so a unit picked mid-count isn't recorded as missing. **Approval above a threshold:** a variance over a set number of units or dollars is recounted or approved before it posts, because a count posted wrong is an adjustment that hides the real error. The posted variance is a movement with the reason `cycle_count` (Shopify's `cycle_count_available`).

**Shrink** is the loss nobody can explain at the item level: the difference between what the records say should be there and what is. The National Retail Federation's 2023 security survey put the average retail shrink rate at 1.6% of sales in fiscal 2022, up from 1.4%, or $112.1 billion. Stores carry most of it; warehouses and 3PLs carry less, and a 3PL's contract decides who pays for units it lost ([SLAs and What They Measure](/books/commerce/warehouses-and-3pls#slas-and-what-they-measure)). The later Store Operations chapter covers loss prevention.

## Lots, Serials, Expiry and Kits

Some items aren't fungible:

- **Lot-tracked items** (food, cosmetics, supplements, chemicals, pesticides) are counted per lot, with a manufacture or expiry date. Picking follows first-expired, first-out: NetSuite's warehouse app sorts bins by the lot's rotation type before quantity. A recall needs the lot on every shipment that carried it (the later Product Safety, Compliance & Recalls chapter).
- **Serialized items** (electronics, high-value goods) are counted by serial number, one unit per row, and the serial goes on the shipment so a return can be matched to the unit that left.
- **Kits and bundles** have no stock of their own when they're assembled at pick time: a bundle's availability is the minimum over its components of component available divided by quantity per bundle ([The Core Data Model](/books/commerce/commerce-business#the-core-data-model), `bundle_components`). A kit pre-assembled in the warehouse is an item with its own count, and assembling it is a pair of movements (components out, kit in).

## How to Build It

The core `inventory_levels` row keeps on hand and committed. Inventory adds the unsellable states, a version for guarded writes, the movement ledger, reservations, buffers and counts:

```sql
ALTER TABLE inventory_items
  ADD COLUMN tracking TEXT NOT NULL DEFAULT 'quantity' CHECK (tracking IN ('quantity', 'lot',
    'serial')),
  ADD COLUMN out_of_stock_policy TEXT NOT NULL DEFAULT 'deny' CHECK (out_of_stock_policy IN
    ('deny', 'continue', 'backorder', 'preorder'));

ALTER TABLE inventory_levels
  ADD COLUMN damaged         INT NOT NULL DEFAULT 0 CHECK (damaged >= 0),
  ADD COLUMN quality_control INT NOT NULL DEFAULT 0 CHECK (quality_control >= 0),
  ADD COLUMN version         BIGINT NOT NULL DEFAULT 0,  -- compare-and-set on every write
  ADD CONSTRAINT inventory_levels_parts CHECK (on_hand >= committed + damaged + quality_control);

CREATE TABLE inventory_movements (       -- append-only; levels are their running sum
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id        UUID NOT NULL REFERENCES inventory_items (item_id),
  location_id    UUID NOT NULL REFERENCES locations (id),
  bucket         TEXT NOT NULL CHECK (bucket IN ('on_hand', 'committed', 'damaged',
                   'quality_control')),
  quantity       INT NOT NULL CHECK (quantity <> 0),  -- signed
  reason         TEXT NOT NULL CHECK (reason IN ('received', 'shipped', 'committed',
                   'commit_released', 'transfer_out', 'transfer_in', 'restock', 'damaged',
                   'quality_control', 'cycle_count', 'correction', 'shrinkage', 'found',
                   'write_off', 'kit_assembly')),
  lot            TEXT,                   -- for lot-tracked items
  serial         TEXT,                   -- for serialized items
  source_kind    TEXT,                   -- 'order_line', 'fulfillment', 'receipt',
                                         -- 'cycle_count', 'return', 'provider_report'
  source_id      UUID,
  actor          TEXT NOT NULL,          -- a user, a job, a provider's sync
  idempotency_key TEXT NOT NULL,         -- the provider's event ID or our own
  occurred_at    TIMESTAMPTZ NOT NULL,   -- when it happened in the building
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key)
);

CREATE INDEX inventory_movements_item ON inventory_movements (item_id, location_id, occurred_at);

CREATE TABLE inventory_reservations (    -- stock set aside before it's an order
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id      UUID NOT NULL REFERENCES inventory_items (item_id),
  location_id  UUID REFERENCES locations (id),  -- null: anywhere in the group
  location_group TEXT,
  quantity     INT NOT NULL CHECK (quantity > 0),
  purpose      TEXT NOT NULL CHECK (purpose IN ('checkout', 'quote', 'drop', 'store_hold',
                 'transfer', 'manual')),
  owner_kind   TEXT NOT NULL,            -- 'checkout', 'quote', 'customer', 'user'
  owner_id     TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,     -- enforced on read
  status       TEXT NOT NULL CHECK (status IN ('active', 'converted', 'released',
                 'expired')),
  order_id     UUID REFERENCES orders (id),  -- set when converted to a commitment
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((location_id IS NULL) <> (location_group IS NULL))
);

CREATE INDEX inventory_reservations_active
  ON inventory_reservations (item_id, location_id) WHERE status = 'active';

CREATE TABLE safety_stock_rules (        -- selling buffers, per channel
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  item_id        UUID REFERENCES inventory_items (item_id),  -- null: every item
  location_id    UUID REFERENCES locations (id),             -- null: every location
  channel        TEXT,                   -- a sales_channels ID; null: every channel
  kind           TEXT NOT NULL CHECK (kind IN ('units', 'percent_on_hand',
                   'zero_below')),
  value          NUMERIC(10, 2) NOT NULL CHECK (value >= 0),
  priority       SMALLINT NOT NULL,      -- the most specific matching rule wins
  valid_during   TSTZRANGE NOT NULL
);

CREATE TABLE cycle_counts (              -- a counting task over some bins or items
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  trigger      TEXT NOT NULL CHECK (trigger IN ('abc_schedule', 'zero_bin', 'short_pick',
                 'variance_recount', 'sweep', 'full_physical', 'manual')),
  blind        BOOLEAN NOT NULL DEFAULT TRUE,
  status       TEXT NOT NULL CHECK (status IN ('scheduled', 'counting', 'review', 'posted',
                 'cancelled')),
  started_at   TIMESTAMPTZ,
  posted_at    TIMESTAMPTZ,
  approved_by  TEXT                      -- required above the variance threshold
);

CREATE TABLE cycle_count_lines (
  cycle_count_id UUID NOT NULL REFERENCES cycle_counts (id),
  item_id        UUID NOT NULL REFERENCES inventory_items (item_id),
  bin            TEXT NOT NULL DEFAULT '',  -- the WMS bin, when the merchant runs one
  lot            TEXT NOT NULL DEFAULT '',
  expected       INT NOT NULL,           -- snapshot when counting began
  movements_during INT NOT NULL DEFAULT 0, -- picks and receipts while counting
  counted        INT,
  counted_by     TEXT,
  counted_at     TIMESTAMPTZ,
  PRIMARY KEY (cycle_count_id, item_id, bin, lot)
);
```

Available, per location and channel, is a query over the parts:

```sql
SELECT l.item_id, l.location_id,
       GREATEST(0, l.on_hand - l.committed - l.damaged - l.quality_control
         - COALESCE(r.reserved, 0)
         - COALESCE(b.buffer, 0)) AS available
FROM inventory_levels l
LEFT JOIN LATERAL (
  SELECT SUM(quantity) AS reserved
  FROM inventory_reservations
  WHERE item_id = l.item_id AND location_id = l.location_id
    AND status = 'active' AND expires_at > NOW()) r ON TRUE
LEFT JOIN LATERAL (
  SELECT CASE s.kind WHEN 'units' THEN s.value
                     WHEN 'percent_on_hand' THEN CEIL(l.on_hand * s.value / 100)
                     WHEN 'zero_below' THEN
                       CASE WHEN l.on_hand - l.committed <= s.value THEN l.on_hand ELSE 0 END
                       -- withholds everything at or below the threshold
         END AS buffer
  FROM safety_stock_rules s
  WHERE (s.item_id = l.item_id OR s.item_id IS NULL)
    AND (s.location_id = l.location_id OR s.location_id IS NULL)
    AND (s.channel = $1 OR s.channel IS NULL)
    AND s.valid_during @> NOW()
  ORDER BY s.priority DESC
  LIMIT 1) b ON TRUE;
```

Committing stock for an order line is a guarded update and a movement in one transaction:

```sql
UPDATE inventory_levels
SET committed = committed + $qty, version = version + 1, updated_at = NOW()
WHERE item_id = $item AND location_id = $location
  AND on_hand - committed - damaged - quality_control >= $qty + $reserved_by_others
RETURNING version;
-- zero rows: not enough stock; the order manager re-sources or holds
-- then INSERT INTO inventory_movements (... bucket 'committed', reason 'committed' ...)
```

Design notes:

- **Levels are a cache of movements.** Every write to `inventory_levels` is accompanied by a movement row in the same transaction; a nightly job sums movements and alerts on any level that disagrees.
- **Provider counts arrive as movements too.** A 3PL's or marketplace's inventory report is compared with the level, and the difference posts as a `correction` movement with source `provider_report` and the report's ID as the idempotency key, so a resent report changes nothing.
- **`occurred_at` and `recorded_at` differ.** A store's offline sales and a 3PL's batched reports arrive late; ordering by when it happened is what makes a replay match the building.
- **Reservations expire on read.** The available query ignores expired rows whether or not a job has marked them; a sweeper moves them to `expired` for tidiness, not correctness.
- **Buffers are rules, not quantities.** A buffer stored as units on the level would have to be rewritten whenever the rule changed; a rule with priority and validity is looked up at computation time, the [Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule) shape.
- **The version column is the compare-and-set.** Every integration that writes counts sends the version it read and fails on a mismatch, the same guarantee Shopify's `changeFromQuantity` gives.
- **Publish what was sent.** Each availability publication to a channel (the item, the number, the time, the channel's acknowledgment) is worth keeping, either in the multichannel feed tables of the later Multichannel Listing & Feeds chapter or as events, so a marketplace oversell can be traced to a stale publish.

## Auditing

- **Every movement.** Item, location, bucket, signed quantity, reason, source, actor, lot or serial, and when it happened and was recorded; the trail behind every count, every valuation and every shrink figure.
- **Every count.** Expected, counted, the movements during the count, who counted and who approved a variance, so a write-off can be defended to an auditor or a 3PL.
- **Every reservation.** Owner, purpose, quantity, expiry and outcome, which is what a drop's fairness complaint or a B2B quote dispute reads.
- **Every buffer rule.** Its scope, value and validity, so a "why did it show out of stock" question has an answer for the moment it was asked.
- **Every publication.** What availability each channel was told and when, against the oversells that followed.

## What This Means for the System You Build

- **Store the parts and compute available,** per location and per channel, with on hand, committed, reserved, unsellable and buffers kept apart.
- **Commit at order and decrement on hand at shipment,** so your counts match the building's.
- **Decide when to reserve per flow,** with expiries enforced on read and conversion to a commitment done once.
- **Fix concurrent oversells in the database** with conditional decrements or compare-and-set, bound lag with buffers, and make deliberate overselling a recorded policy.
- **Treat a marketplace network and a 3PL as locations** whose counts you reconcile, not trust.
- **Keep replenishment safety stock and selling buffers separate,** and set buffers per channel from the lag you measure.
- **Sync absolute counts with a version,** prioritize items near zero, and record what each channel was told.
- **Keep movements append-only** and treat levels as their cached sum.
- **Cycle count blind, snapshot the expected quantity, and approve big variances** before they post.
- **Track lots and serials where recalls and returns need them,** and compute bundle availability from components.

## References

**Platform documentation**

- [Shopify: Manage inventory quantities and states](https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps/manage-quantities-states), the inventory states, `on_hand` as their sum, unavailable states, `changeFromQuantity` and adjustment reasons
- [Shopify: ProductVariantInventoryPolicy](https://shopify.dev/docs/api/admin-graphql/latest/enums/ProductVariantInventoryPolicy), selling after stock runs out with `CONTINUE`
- [BigCommerce: Inventory adjustments](https://docs.bigcommerce.com/docs/store-operations/catalog/inventory-adjustments), per-location stock, available to sell, safety stock and absolute versus relative adjustments
- [commercetools: Inventory overview](https://docs.commercetools.com/api/inventory-overview), inventory modes, reservations and their expiry, the 10-second delay and overselling under `TrackOnly`
- [NetSuite: Available to Promise](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2300269.html), the time-phased virtual available quantity from expected receipts and fulfillments
- [NetSuite: Supply Allocation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156424975823.html), committing future supply to demand
- [NetSuite: Advanced Inventory Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2285050.html), demand-based reorder points, lead time, safety stock and seasonal demand
- [NetSuite WMS: Pick task sorting and recommended bins](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1549310986.html), FEFO and LEFO bin ordering for lot items

**Research and regulation**

- [NRF: National Retail Security Survey 2023](https://nrf.com/research/national-retail-security-survey-2023), the 1.6% average shrink rate for fiscal 2022 and $112.1 billion in losses
- [eCFR: 16 CFR Part 435, Mail, Internet, or Telephone Order Merchandise](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435), a reasonable basis for stated shipping times and the delay option
- [Walmart Marketplace: Seller performance standards (updated July 28, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Seller%20performance/Seller-performance-standards), the 2% cancellation rate standard
