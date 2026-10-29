+++
title = "Omnichannel Fulfillment"
description = "Buy online, pick up in store, curbside, ship-from-store, endless aisle and in-store returns, store inventory accuracy and unified commerce, with the schema."
category = "Commerce Industry"
order = 2321
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "omnichannel", "bopis", "ship-from-store", "stores", "inventory"]
+++

A store is a warehouse with customers in it. The big US retailers have turned that into their fulfillment strategy: Target's stores fulfilled 97.6% of its merchandise sales in 2025, including most of what customers bought on its app; Home Depot fulfilled about half its US online orders through a store; Walmart said its US eCommerce gains were "primarily driven by store-fulfilled pickup and delivery." A brand with a few shops does the same thing at a smaller scale when it lets a website order be collected at the counter, or ships a web order from the store that has the last one in the right size.

Every option in this chapter has the same shape: an order taken in one channel is fulfilled by a store, so the store's stock, staff and shelf become part of the online promise. That only works if the system knows what is really on the shelf, which is harder than it sounds, and if the store has the people to pick, pack and hand over orders on time while serving the customers who walked in. This chapter covers buy online, pick up in store (BOPIS), curbside, ship-from-store, ship-to-store, endless aisle and in-store returns, store inventory accuracy, store capacity, and unified commerce. It extends `fulfillments` and `inventory_levels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Deciding which location fulfills an order is Order Management's sourcing; the counts themselves and their reservations are Inventory; picking in a warehouse is Warehouses, 3PLs & Fulfillment Networks; delivering from a store with the retailer's own drivers or couriers is the Field Operations volume's [Last-Mile Delivery](/books/field-operations/last-mile-delivery) and this volume's On-Demand Delivery part.

## How the Retailers Do It

As of October 2026, from each company's latest annual report:

| Retailer | Stores | Online share | Store-fulfilled | Options named in the filing |
| --- | --- | --- | --- | --- |
| **Target** | 1,995 | Digitally originated sales 20.6% of merchandise sales in 2025 | Stores fulfilled 97.6% of merchandise sales; about two-thirds of digital sales go through same-day options | Order Pickup, Drive Up, Same-Day Delivery; "stores as fulfillment hubs" |
| **Walmart** | 4,611 in Walmart U.S.; more than 10,900 in 19 countries | eCommerce added about 4.3% to Walmart U.S. comparable sales | "Substantially all our stores provide same-day pickup and delivery"; over 8,400 locations offer it globally | Pickup, delivery from store, Walmart+ "unlimited delivery from store" |
| **Best Buy** | 1,068 | Online revenue $13.2 billion, 34.4% of Domestic revenue in fiscal 2026 | Not disclosed as a share | Store pickup, curbside "for many products at most stores," alternative pickup locations, ship-from-store |
| **Home Depot** | 2,359 | Online sales 15.9% of net sales in fiscal 2025 | "Approximately 50% of our U.S. online orders were fulfilled through a store" | BOSS, BOPIS, BODFS and BORIS |
| **Shopify (platform)** | Merchant's own | Merchant's own | Per the merchant's routing rules | Local pickup per location with a "Ready for pickup" notice; Ship from Store in Shopify POS for locations on POS Pro |

Three patterns:

- **The store is the default warehouse for the big three.** Target says so in as many words; Walmart's pickup and delivery run from substantially all its stores; Home Depot sends about half its online orders through one. A store is already near the customer and already stocked, so the marginal cost of an online order fulfilled there is the picking labor, not a new building.
- **The options have names because customers choose them.** Home Depot's four acronyms (buy online, ship to store; pick up in store; deliver from store; return in store) are the menu every omnichannel retailer offers in some form, and the order record has to say which one the customer picked.
- **Nobody publishes accuracy.** The filings report how much stores fulfill, not how often a store pick fails because the shelf was empty. That number lives in each retailer's operations, and the research below is the public evidence of how large it can be.

## The Options

| Option | The customer | The store | The record |
| --- | --- | --- | --- |
| **BOPIS (buy online, pick up in store)** | Orders online, collects at a counter or locker | Picks from the shelf or back room, stages the order, hands it over | A `pickup` fulfillment at the store |
| **Curbside (Drive Up)** | Orders online, checks in from the car | Brings the order out to a parking spot | A `pickup` fulfillment with a curbside handoff and check-in |
| **Ship-from-store** | Orders online for delivery | Picks, packs and ships with a carrier label | A `shipping` fulfillment from the store location |
| **Deliver from store** | Orders for local same-day delivery | Picks and packs; a courier or own driver delivers | A `delivery` fulfillment from the store, with a delivery provider |
| **Ship-to-store (BOSS)** | Orders online, collects at a store that didn't have it | Receives a transfer from a warehouse, then treats it as pickup | A transfer into the store, then a `pickup` fulfillment |
| **Endless aisle** | Is in the store; the item isn't | Takes the order at the register or on a tablet; it ships from a warehouse or another store | An order with `channel = 'pos'` and a `shipping` fulfillment from elsewhere |
| **Returns in store (BORIS)** | Returns an online order at a counter | Inspects, refunds and restocks to the store's shelf or sends it on | A return with `method = 'in_store'` at the store |

The same order can combine them: one line picked up today, another shipped from a warehouse next week. That is why options are properties of each fulfillment, not of the order.

## Stores as Fulfillment Hubs

Target's 10-K states the strategy plainly: "Our strategy continues to leverage stores as fulfillment hubs," and "our stores fulfill the majority of digitally originated sales." The company's own risk factor names the dependency: "our stores-as-hubs strategy depends on adequate replenishment facilities." The economics favor it when the store already holds the stock and the customer is close: same-day options cost the retailer a picker's minutes instead of a parcel, and a customer collecting an order often buys something else on the way in.

The costs land on the store:

- **Labor.** Pickers compete with shelf stockers and cashiers for the same hours. A store with a lunchtime rush can't pick 40 orders at noon, which is why capacity is a modeled constraint ([Capacity and Slots](#capacity-and-slots)).
- **Shelf contention.** An online picker and a walk-in shopper reach for the same last unit. A store reserves stock for online orders only once it's picked; until then, what the website promised can be bought by someone in the aisle.
- **Space.** Staged orders need shelves, cold storage for groceries, lockers or a pickup counter, and parking spots for curbside.
- **Packaging and carriers.** Ship-from-store needs boxes, label printers and a daily carrier pickup at every store that ships, which a warehouse has once.

The sourcing decision weighs these against a warehouse shipment: the distance to the customer, the store's stock and buffer, its capacity right now, the cost of a split shipment, and whether shipping from the store leaves its shelf empty for walk-ins. Order Management owns the sourcing rules; this chapter owns what a store contributes to them (its buffer, capacity and pickup slots).

## Pickup

A pickup order's lifecycle adds steps a shipped order doesn't have. Shopify's documentation describes the standard flow: the merchant enables pickup per location ("Let customers pick up orders directly at this location"), sets a processing time the customer sees as the expected pickup date, marks the order ready (which sends a "Ready for pickup" email with editable instructions), and "after your customer picks up their order, you can mark the order as picked up and send a confirmation email." The full set of states:

1. **Placed and sourced** to a store with the stock.
2. **Picked** from the shelf or back room, with any shortage handled (substitute, cancel the line or source it elsewhere).
3. **Staged** in a pickup area, locker or cold storage, with a location code so an associate can find it.
4. **Ready,** with the notice to the customer and a pickup code or QR code.
5. **Checked in,** when the customer says they've arrived (in the app, by text or at the counter); for curbside, with a parking spot or vehicle description.
6. **Handed over** after checking the code or an ID, which is the moment of delivery for the order and, for age-restricted goods, the moment the age check happens (Alcohol, Tobacco & Age-Restricted Goods covers the rules).
7. **Picked up,** or **abandoned** after a hold period, when the order is cancelled, refunded and its stock returned to the shelf.

**Abandonment is a policy with a clock.** A store holds a pickup order for a set number of days, reminds the customer, then cancels and restocks. The hold period is a rule per merchant or per category (shorter for groceries), and the reminder and cancellation are scheduled jobs off a stored deadline ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Until it's restocked, the staged unit is committed stock nobody can sell.

**When to capture payment.** A pickup order is usually authorized at checkout and captured at handover or when it's marked ready, inside the authorization's lifetime ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)); Taking Payment in Commerce covers the choice. A pickup that waits a week can outlive its authorization, which is one more reason to keep hold periods short.

**Tax and the law.** A pickup order's ship-to is the store, where the customer takes possession, not the billing address; the tax engine gets the store as both ship-from and ship-to and applies the sourcing rule ([Sourcing Is Data](/docs/payments/sales-tax#sourcing-is-data)). The FTC's Mail, Internet, or Telephone Order Merchandise Rule covers orders placed online and is written around "shipment," which it defines as placing the merchandise "in the possession of the carrier." Whether a pickup promise falls under it isn't addressed in the FTC's business guide; my rule is to treat a stated pickup date with the same discipline as a ship date (a reasonable basis for it, a notice when it slips, and a refund on cancellation), because the risk of being wrong is a deceptive-practices claim either way.

## Curbside

Curbside is pickup where the handoff moves to the car. What it adds:

- **Check-in.** The customer tells the store they've arrived, through the app, a link in the ready notice, or a text, with a parking spot number or a description of the car. Target's Drive Up is the best-known version; I couldn't open its help page to confirm the current check-in steps, so the details are left general here.
- **Arrival prediction.** An app with location permission can tell the store the customer is on the way, so the order is at the door when they park; the playbook's [Location Tracking](/docs/architecture/location-tracking) covers collecting location with consent.
- **A wait-time metric.** Time from check-in to handover is the number customers notice and stores manage.
- **The handover record.** Who brought it out, when, and any ID check, just as for counter pickup.

## Ship-from-Store

Ship-from-store turns each store into a small parcel warehouse. In Shopify POS, stores fulfill online orders that need shipping inside the point of sale (pack or scan the items, print a packing slip, buy a label or enter a tracking number), the location needs POS Pro, and the order's assigned location, set by order routing rules in the admin, is the one that fulfills it. Best Buy's 10-K describes its version as a way "to offer additional fast and convenient delivery options for customers."

What it takes:

- **A pick list on the floor,** on a handheld or the POS, with the shelf location and a scan to confirm each unit.
- **A short-pick path:** when the shelf is empty, the line is rerouted to another location or cancelled, and the store's count is corrected, because the miss is evidence the count was wrong.
- **Carrier accounts and pickups per store,** and labels bought from the same multi-carrier setup as the warehouse (Shipping & Carriers covers the carriers).
- **A cutoff time per store** for same-day shipping, which feeds the delivery promise shown at checkout.

## Endless Aisle

Endless aisle is the reverse: an order taken in the store for something the store doesn't have. An associate builds the order at the register or on a tablet, takes payment, and the order is fulfilled from a warehouse, another store or a supplier, shipped to the customer's home or to the store for pickup. The order's channel is the point of sale and its selling location is the store, so the store gets credit for the sale; its fulfillment is a `shipping` fulfillment from somewhere else. The tax, the delivery promise and the return policy are those of a shipped order, and the receipt has to say so, because the customer leaves without the goods.

## Returns in Store

Taking back online orders at a counter is the cheapest return channel for the merchant and the most convenient one for many customers ([Return Networks](/books/commerce/returns-and-exchanges#return-networks)). It needs the counter to find the online order (by receipt, email or a QR code from the return request), apply the order's return policy rather than the store's, refund to the original tender, and decide where the unit goes: onto that store's shelf if the store carries it, back to a warehouse if not. A return restocked at a store that never sold that item is stock the store can't sell; a return sent back to a warehouse costs a transfer. The disposition rule decides per item and store.

## Store Inventory Accuracy

Store counts are wrong more often than most systems assume. In the best-known public study, DeHoratius and Raman examined "nearly 370,000 inventory records from 37 stores of one retailer" and found "65% to be inaccurate" (Management Science, 2008). The causes are mundane: theft and damage not recorded, items misplaced in the store, receiving errors (a case counted as twelve that held ten), cashiers scanning one flavor for another, and returns put back without being counted. The record says three; the shelf has none ("phantom stock") or six.

For a store that only sells over its counter, an inaccurate count is a replenishment problem: the system won't reorder an item it thinks is in stock. For a store that fulfills online orders, it is a broken promise. A website that shows "available for pickup today" on the strength of a count of one, at a store where the one unit is missing, produces a short pick, a cancellation and an angry customer who drove there. The defenses:

- **A store buffer.** Show an item as available online only when the count exceeds a buffer (a fixed number, or a share of the count), so the last units are kept for walk-ins and for count error. The buffer is per item and store, set by how often that item's counts are found wrong.
- **Count where it's sold online.** Cycle counts weighted toward items with high online demand and recent short picks (the Inventory chapter covers counting programs).
- **Treat a short pick as a count.** A picker who finds the shelf empty has just counted it; the system should set that location's count to what was found, not wait for the next cycle count.
- **Item-level tags.** RFID tags on items let a store count a whole section by walking it with a reader instead of scanning each barcode, and several large apparel and general retailers use them for exactly this; I couldn't open their primary statements, so no figures are given here. <!-- source-gap: retail-rfid-programs | missing | which large US retailers tag items with RFID for store counts, and the accuracy gains they report | closes with: a retailer filing, supplier mandate or retailer press release opened and quoted | checked: 2026-10-28 -->

Online availability for a store is therefore a computation: on hand less committed, less the store buffer, less what's staged for pickup, and only if the store has fulfillment capacity left today. The core rule from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) ("available is a computation") carries one more term at a store.

## Capacity and Slots

A store's fulfillment capacity is people, not shelves. Each store has a number of orders (or units) it can pick per hour by day of week, a pickup slot schedule if it offers timed pickup, and a cutoff after which an order rolls to the next day. When capacity is full, the store stops being offered for same-day pickup, the order is sourced elsewhere, or the promised time moves.

Pickup slots are a reservation problem: a customer holds a slot during checkout, the hold expires if they don't finish, and a slot can't be oversold. The playbook's [Reservations & Holds](/docs/architecture/reservations-and-holds) covers the mechanics, including [Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory), which is what a slot with a capacity of 20 orders is.

## Unified Commerce

"Omnichannel" and "unified commerce" are often used interchangeably, but the industry draws a line. Shopify defines unified commerce as "a retail strategy that connects sales channels, inventory, and customer data through a single back-end platform," contrasting it with omnichannel setups that connect front-end channels but often keep a separate back-end database per channel. In system terms: one order record whether the order came from the website, the app, the register or a marketplace; one inventory count per location that every channel reads; one customer record that knows the online orders and the store purchases.

The alternative is integration: a POS with its own stock counts, an ecommerce platform with its own, and a sync between them that runs every few minutes. Sync works until the last unit, when the delay is exactly the window in which a walk-in buys what the website just promised. The core data model is built the unified way (channel is a property of the order, stock lives at the location, available is computed); a merchant integrating separate systems still benefits from modeling it that way, with one system as the record for each object (ERP & Integrations covers the system-of-record choice).

## How to Build It

The core model already has pickup and shipping as fulfillment kinds and stores as locations. This chapter adds pickup details, store capacity and slots, and the store buffer:

```sql
ALTER TABLE fulfillments
  ADD COLUMN handoff         TEXT CHECK (handoff IN ('counter', 'curbside', 'locker')),
  ADD COLUMN pickup_slot_id  UUID,                  -- pickup_slots, below
  ADD COLUMN pickup_code     TEXT,                  -- shown to the customer; hashed if it's a secret
  ADD COLUMN staged_at       TEXT,                  -- shelf or locker position
  ADD COLUMN ready_at        TIMESTAMPTZ,
  ADD COLUMN checked_in_at   TIMESTAMPTZ,
  ADD COLUMN check_in_detail JSONB,                 -- parking spot, vehicle
  ADD COLUMN handed_over_at  TIMESTAMPTZ,
  ADD COLUMN handed_over_by  TEXT,
  ADD COLUMN hold_until      TIMESTAMPTZ,           -- abandonment deadline
  ADD COLUMN origin_channel_location_id UUID REFERENCES locations (id);  -- endless aisle: the store that sold it

CREATE TABLE store_fulfillment_capacity (  -- what a store can pick, by day and hour
  location_id    UUID NOT NULL REFERENCES locations (id),
  kind           TEXT NOT NULL CHECK (kind IN ('pickup', 'shipping', 'delivery')),
  day_of_week    SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),  -- ISO, 1 = Monday
  hour_start     TIME NOT NULL,          -- local time at the location
  max_orders     INT NOT NULL CHECK (max_orders >= 0),
  same_day_cutoff TIME,                  -- orders after this roll to the next day
  PRIMARY KEY (location_id, kind, day_of_week, hour_start)
);

CREATE TABLE store_capacity_overrides (  -- a holiday, a short-staffed day, a closure
  location_id  UUID NOT NULL REFERENCES locations (id),
  kind         TEXT NOT NULL,
  during       TSTZRANGE NOT NULL,
  max_orders   INT NOT NULL CHECK (max_orders >= 0),
  reason       TEXT NOT NULL,
  EXCLUDE USING gist (location_id WITH =, kind WITH =, during WITH &&)
);

CREATE TABLE pickup_slots (              -- timed pickup windows with a capacity
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  handoff      TEXT NOT NULL CHECK (handoff IN ('counter', 'curbside', 'locker')),
  during       TSTZRANGE NOT NULL,
  capacity     INT NOT NULL CHECK (capacity >= 0),
  reserved     INT NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  CHECK (reserved <= capacity),
  UNIQUE (location_id, handoff, during)
);

CREATE TABLE store_buffers (             -- units kept back from online availability
  location_id  UUID NOT NULL REFERENCES locations (id),
  item_id      UUID NOT NULL REFERENCES inventory_items (item_id),
  buffer_units INT NOT NULL DEFAULT 0 CHECK (buffer_units >= 0),
  buffer_pct   NUMERIC(5, 4) NOT NULL DEFAULT 0,
  reason       TEXT NOT NULL,            -- e.g. 'default', 'short_pick_history'
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (location_id, item_id)
);

CREATE TABLE short_picks (               -- a picker found less than the record said
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  fulfillment_id UUID NOT NULL REFERENCES fulfillments (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  location_id    UUID NOT NULL REFERENCES locations (id),
  expected       INT NOT NULL,           -- on hand per the record
  found          INT NOT NULL CHECK (found >= 0),
  resolution     TEXT NOT NULL CHECK (resolution IN ('rerouted', 'substituted', 'cancelled')),
  recorded_by    TEXT NOT NULL,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- What a store may promise online for pickup today, per item.
SELECT il.item_id,
       GREATEST(il.on_hand - il.committed
                - GREATEST(COALESCE(b.buffer_units, 0),
                           CEIL(il.on_hand * COALESCE(b.buffer_pct, 0))), 0) AS pickup_available
FROM inventory_levels il
LEFT JOIN store_buffers b ON b.location_id = il.location_id AND b.item_id = il.item_id
WHERE il.location_id = $1;
```

Design notes:

- **Pickup is a fulfillment, with its own clock.** Ready, checked in, handed over and the hold deadline are columns on the fulfillment, so the store's queue, the customer's notifications and the abandonment job all read one record. Each change is also a row in `fulfillment_events` from [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it), with who made it.
- **Capacity is data with overrides.** A weekly template plus dated overrides (Black Friday, a short-staffed Sunday) is what sourcing reads; the exclusion constraint stops two overrides from covering the same hour ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)).
- **Slots are counters.** Reserve with a conditional update (`reserved = reserved + 1 WHERE reserved < capacity`), hold it during checkout with an expiry, and release on abandonment ([Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)).
- **A short pick corrects the count.** Recording `found` should post an inventory adjustment through the Inventory chapter's movements and can raise that item's store buffer; the record is the evidence a count was wrong.
- **Endless aisle keeps the selling store.** The order's `location_id` is the store that sold it; the fulfillment's `location_id` is where it ships from; `origin_channel_location_id` keeps that relationship explicit for store credit and commissions.
- **Times are local.** Capacity hours, cutoffs and slot windows are in the store's time zone, from `locations.time_zone` ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)).

## Auditing

- **Every pickup's timeline:** ready, notified, checked in, handed over (by whom, with what verification) or abandoned, so a "never got my order" complaint or an age-check question has an answer.
- **Every short pick,** with expected and found counts and the resolution, as the record of store count accuracy.
- **Every capacity override and buffer change,** with its reason, because they change what customers were offered.
- **Every endless-aisle order** with the selling store and the fulfilling location.

## What This Means for the System You Build

- **Make the fulfillment option a property of each fulfillment,** not of the order, so one order can be part pickup, part shipped.
- **Compute store availability with a buffer** and with what's staged, and offer a store only while it has capacity.
- **Model pickup as a timeline** (ready, check-in, handover, abandonment) with a hold deadline and a scheduled cancel-and-restock.
- **Model store capacity and pickup slots as data,** with dated overrides and counter-style reservations.
- **Treat every short pick as a count** and feed it to the store buffer.
- **Keep the selling location and the fulfilling location separate** for endless aisle and in-store returns.
- **Send the store as a pickup's ship-to for tax,** and hold a pickup date to the same standard as a ship date.
- **Build one order, one inventory and one customer record across channels,** or name one system of record for each if they're separate.

## References

**Filings**

- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), stores as fulfillment hubs, the 97.6% of merchandise sales fulfilled by stores, digitally originated sales at 20.6%, same-day options at about two-thirds of digital sales, the replenishment risk factor and 1,995 stores
- [Walmart: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm), same-day pickup and delivery at substantially all stores and over 8,400 locations, eCommerce's contribution to comparable sales, store counts and Walmart+ delivery from store
- [Best Buy: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/764478/000076447826000009/bby-20260131.htm), online revenue of $13.2 billion and 34.4% of Domestic revenue, store and curbside pickup, ship-from-store and 1,068 stores
- [Home Depot: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/354950/000162828026019436/hd-20260201.htm), about 50% of US online orders fulfilled through a store, BOSS, BOPIS, BODFS and BORIS, online sales at 15.9% and 2,359 stores

**Platforms**

- [Shopify Help: Setting up pickup in store for online orders](https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store), pickup per location, processing time, the ready notice and marking orders picked up
- [Shopify Help: Ship from Store on Shopify POS](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/order-management/ship-from-store), fulfilling shipped orders in POS, POS Pro and order routing rules
- [Shopify: Unified commerce](https://www.shopify.com/blog/unified-commerce), the definition and the contrast with omnichannel back ends

**Research and law**

- [DeHoratius and Raman: Inventory Record Inaccuracy: An Empirical Analysis (Management Science, 2008), abstract via OpenAlex](https://api.openalex.org/works/doi:10.1287/mnsc.1070.0789), 65% of nearly 370,000 records at 37 stores inaccurate
- [16 CFR 435.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/16/435.1), the Mail, Internet, or Telephone Order Merchandise Rule's scope and its definition of shipment
- [FTC: Business guide to the Mail, Internet, or Telephone Order Merchandise Rule](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule), the reasonable basis, delay notices and refunds on cancellation
</content>
</invoke>
