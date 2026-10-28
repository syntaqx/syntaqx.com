+++
title = "The Commerce Business"
description = "How selling things works in software: the parties, the channels an order arrives through, how the money splits, and the core data model every part extends."
category = "Commerce Industry"
order = 2230
part = "The Business"
tags = ["commerce", "business-models", "data-model", "orders", "catalog"]
+++

Commerce is a catalog, a customer and a promise. A restaurant lists a burger with a choice of cheese; a grocer lists forty thousand products whose prices change weekly; a convenience brand lists what is on the shelf of a warehouse it owns. A customer picks some of them, pays, and is owed something specific: food at the door in thirty minutes, groceries in a one-hour window, a parcel on Thursday. Between the two sit the channels the order came through (the merchant's own website, a delivery app, a phone call, the counter), the people who make and move it (cooks, shoppers, couriers, carriers), and the money each takes on the way.

The software is hard because one order lives in several systems at once. A delivery order exists in the app that took it, the point of sale that printed it in the kitchen, the dispatch system that found a courier, the payments processor that charged the card, and the merchant's statement at the end of the week, and each of them can be wrong about it in a different way. This chapter is the map the rest of the volume uses: how to read it, the parties, the channels, how the money splits, the life of a delivery order, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/commerce/glossary).

## How to Read This Volume

The volume starts with on-demand delivery, the part of commerce where every piece (catalog, order, fulfillment, fees, memberships, refunds) runs on a clock measured in minutes, and later parts extend the same model to the rest of commerce:

- **The Business.** This chapter: the parties, the channels, the money, and the core data model.
- **On-Demand Delivery.** [The Delivery Landscape](/books/commerce/delivery-landscape) (marketplaces, logistics-only networks, first-party ordering, owned inventory and shop-and-deliver, take rates from the filings, market share and consolidation); [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs) (onboarding, menus and modifiers synced from the point of sale, availability, grocery catalogs, substitutions, in-app prices); [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching) (the order lifecycle, prep time and ETAs, assignment and batching, shop-and-deliver, scheduled orders, the handoff); [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law) (consumer fees and all-in prices, merchant commission tiers, city caps, listing consent, data sharing, tips); [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions) (DashPass, Uber One, Instacart+ and Grubhub+, benefit rules, savings claims, cancellation law); and [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud) (who pays for an error, refund abuse, merchant error charges, courier fraud, account takeover, promotion abuse).
- **Reference.** A [Glossary](/books/commerce/glossary) of every term the volume defines, grouped by part.

Later parts will cover retail and e-commerce, the point of sale, selling on marketplaces like Amazon, subscriptions and memberships beyond delivery, and regulated goods; each extends the tables below rather than redefining them.

The volume covers what commerce adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/payments/money), [Payment States & Ledgers](/docs/payments/payment-states), [Idempotency](/docs/payments/idempotency), [Subscriptions](/docs/payments/subscriptions), [Sales Tax](/docs/payments/sales-tax), [Rules as Data](/docs/architecture/rules-as-data), [Events & Async Messaging](/docs/architecture/events), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Automated Risk Decisions](/docs/architecture/risk-scoring), [Location Tracking](/docs/architecture/location-tracking), [Audit Trails](/docs/architecture/audit-trails) and [Addresses](/docs/fundamentals/addresses). Other volumes own topics this one leans on: [Payments](/books/payments/card-payments) for the card charge, payouts to merchants and disputes; [Field Operations](/books/field-operations/last-mile-delivery) for the last mile, proof of delivery and failed attempts; and [User-Generated Platforms](/books/user-generated-platforms/gig-work-and-worker-law) for the people who deliver, how they are classified and paid, and the laws on deactivating them.

The volume is US-centric, with the UK and EU platforms (Deliveroo, Just Eat Takeaway, Wolt) as contrast where they do something differently. No single company is the model: the vocabulary and tables are the industry's, and a platform's own product name appears only where the chapter is describing that platform.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Merchants** | Restaurants, grocers, convenience and retail stores, brands; one location or thousands, often franchised | Orders that arrive in the kitchen or store correctly, menus and prices they control, payouts and statements they can check |
| **Customers** | People ordering for delivery or pickup, often members of a subscription program | An accurate menu, an all-in price, a reliable ETA, and a refund when something is missing |
| **Couriers and shoppers** | Independent contractors or employees who pick, shop and deliver | Offers they can judge, accurate pickup times, pay as promised, and a fair hearing before deactivation |
| **Marketplaces** | Apps that list many merchants and take orders: DoorDash, Uber Eats, Grubhub, Instacart, Deliveroo, Just Eat Takeaway, Wolt | Supply (merchants and couriers), demand, and the fees and ads that pay for both |
| **Logistics networks** | Delivery-only services that carry orders taken elsewhere: DoorDash Drive, Uber Direct, Olo Dispatch's network of providers | A delivery request with addresses, items and a ready time |
| **Software vendors** | Points of sale and ordering platforms that sit between merchants and marketplaces: Toast, Square, Olo | Menus and orders in a shape each side accepts |
| **Payments providers** | Processors and platforms that charge customers and pay merchants and couriers | The order's money as charges, refunds, transfers and payouts ([Payments for Software Platforms](/books/payments/software-platforms)) |
| **Regulators** | City consumer agencies, state attorneys general, the FTC | Fee caps honored, prices disclosed, memberships cancellable, records on request |

The split that shapes the data model is **merchant versus location.** A restaurant brand sets the menu; each location has its own hours, prices, availability, prep times, delivery radius and, often, its own franchisee as the legal seller. A city's fee cap applies per order at a location in that city, an item is out of stock at one location and not another, and a payout goes to whoever owns the location. Designs that keep only the merchant can't answer any of that; designs that keep only locations duplicate a brand's menu thousands of times.

## Channels

An order reaches a merchant through one of a handful of channels, and the channel decides who owns the customer, who sets the price, who delivers and who pays whom:

| Channel | Who takes the order | Who delivers | Who pays whom |
| --- | --- | --- | --- |
| **Marketplace, platform delivery** | The marketplace's app | The marketplace's couriers | Customer pays the marketplace; marketplace pays the merchant net of commission |
| **Marketplace, self-delivery** | The marketplace's app | The merchant's own drivers | As above, at a lower commission |
| **First-party ordering** | The merchant's website or app, often run by an ordering vendor | The merchant, or a logistics network per order | Customer pays the merchant; merchant pays a flat delivery fee |
| **Logistics only** | Any channel the merchant controls | DoorDash Drive, Uber Direct or a provider picked by an ordering platform | Merchant pays per delivery |
| **Owned inventory** | The seller's own app | The seller's couriers from its own facilities | Customer pays the seller, which is also the merchant (Gopuff) |
| **Shop and deliver** | The marketplace's app, or the retailer's site powered by it | A shopper who picks in the store and delivers | Customer pays the marketplace or the retailer; the retailer is paid for goods |
| **Point of sale** | The counter, the phone, a kiosk | Nobody, or the merchant's drivers | Customer pays the merchant |

[The Delivery Landscape](/books/commerce/delivery-landscape#business-models) covers each model's economics. For the data model the rule is that **channel is a property of the order, never of the merchant.** The same burger at the same location is sold through four channels at four prices (in-store, its own site, two marketplaces), and the same order can be taken by one channel and delivered by another.

## How the Money Splits

A marketplace delivery order is a bundle of separately priced lines, each with a payer and a payee:

| Line | Who pays | Who receives | Where it's covered |
| --- | --- | --- | --- |
| Items and modifiers | Customer | Merchant (at the in-app price) | [In-App Prices and Markups](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups) |
| Delivery fee, service fee, small-order fee | Customer | Marketplace | [Consumer Fees and All-In Prices](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices) |
| Tax | Customer | The taxing authority, collected by the marketplace or the merchant | [Sales Tax](/docs/payments/sales-tax) |
| Tip | Customer | Courier, in full | [Tips](/books/commerce/delivery-fees-and-the-law#tips) |
| Commission | Merchant | Marketplace | [Merchant Commission Tiers](/books/commerce/delivery-fees-and-the-law#merchant-commission-tiers) |
| Courier pay | Marketplace | Courier | The User-Generated Platforms volume's [Minimum Pay Standards](/books/user-generated-platforms/gig-work-and-worker-law#minimum-pay-standards) and [Worker Payouts](/books/user-generated-platforms/gig-work-and-worker-law#worker-payouts) |
| Membership fee | Customer | Marketplace, monthly or yearly | [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions) |
| Promotion | Marketplace or merchant | Customer, as a discount | [Promotion Abuse](/books/commerce/refunds-and-delivery-fraud#promotion-abuse) |
| Refund and error charge | Marketplace, then often merchant | Customer | [Who Pays for an Error](/books/commerce/refunds-and-delivery-fraud#who-pays-for-an-error) |

Most of the law in this volume regulates one row of that table: what the customer must see before checkout, what a merchant may be charged, where a tip goes, how a membership ends. My rule: store every order as these lines, each with its kind, payer, payee and the rule or plan version that produced it, and compute every total (the customer's price, the merchant's net, the platform's revenue) as a sum over lines. A total stored without its lines can't be audited, refunded in part, or shown to a regulator.

## The Life of a Delivery Order

**Browse.** A customer opens an app at an address. Only locations that deliver there, are open and are accepting orders appear; each shows a delivery fee and an ETA computed for that address and that moment, and items marked unavailable are hidden or greyed out ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#availability)).

**Build the cart.** The customer picks a burger, a required cheese and an optional extra patty, each a choice in a modifier group with minimum and maximum selections. The cart prices each line at the location's in-app price ([Menus, Modifiers and Items](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items)).

**Check out.** Fees, tax, a tip and any membership benefit are added; where the law requires it the total was shown earlier ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law)). The card is authorized for the total, and the order is placed with an idempotency key so a retried tap can't place two ([Idempotency](/docs/payments/idempotency)).

**Send to the merchant.** The order reaches the location's point of sale or tablet and must be accepted. The kitchen gets a ready-time estimate, and dispatch starts looking for a courier timed to arrive as the food is ready ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle)).

**Assign and batch.** An optimizer offers the delivery to a courier, possibly together with a second order from the same or a nearby store ([Assignment and Batching](/books/commerce/orders-dispatch-and-batching#assignment-and-batching)).

**Pick up and deliver.** The courier arrives, waits or doesn't, picks up, and delivers, recording the handoff and a photo when nobody is there to receive it ([Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)).

**Settle.** The authorization is captured, the merchant's payout is computed net of commission and adjustments, the courier is paid with the tip in full, and the membership benefit is recorded against the customer's plan ([Payouts & Settlement](/books/payments/payouts-and-settlement)).

**Fix what went wrong.** The customer reports a missing drink. The marketplace refunds or credits the customer, decides whether the merchant, the courier or nobody is at fault, and may charge the merchant for the error, which the merchant can dispute within a window ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud)).

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a DoorDash store, an Uber Eats store and an Instacart retailer location are all locations; a menu item, a SKU and a product listing are all items. The volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **merchant** | `merchants` | The business that sells: a restaurant group, a grocer, a brand, a franchisee under it |
| **location** | `locations` | Where an order is made or picked: a store, a kitchen, a virtual brand, a dark store |
| **item** | `items` | Something the merchant sells, once: a dish, a product, a modifier option, a bundle |
| **location item** | `location_items` | An item as sold at one location: its price and whether it's available |
| **modifier group** | `modifier_groups`, `modifier_group_options`, `item_modifier_groups` | A choice attached to an item ("choose a cheese"), with selection limits and options that are items themselves |
| **customer** | `customers` | The person or business ordering |
| **order** | `orders` | One purchase at one location through one channel, with its timing and state |
| **order line** | `order_lines` | An item ordered, with the modifiers chosen as child lines, priced as sold |
| **order charge** | `order_charges` | Every non-item line: fees, tax, tip, discounts, commission, each with a payer and a payee |
| **fulfillment** | `fulfillments` | How the order gets to the customer: delivery, pickup, dine-in or shipping, and by whom |
| **payment reference** | `order_payments` | The order's charges and refunds as rows pointing at the [Payments](/books/payments/card-payments#the-core-data-model) volume's records |

Four splits matter in every chapter. **Item versus location item.** The item is what the merchant sells, defined once with its name, description, barcode and tax category; the location item is that item at one place, with its price and availability. A franchise brand updates a description once and every location shows it; one store runs out of an item and only that store hides it. **Order line versus order charge.** Lines are goods, priced by the merchant; charges are everything else, priced by the platform, the law or the customer (the tip). Keeping them apart is what lets a city's commission cap apply to the right base, a tip go to the courier untouched, and a refund for a missing item reverse the item's price and its tax without touching the delivery fee. **Order versus fulfillment.** The order is what was bought; the fulfillment is how it moves, by which provider, with which external ID and statuses. A pickup order that becomes a delivery, a courier who unassigns and is replaced, and a delivery taken by one app and carried by another network are fulfillment changes, not new orders. **Snapshots on the line.** An order line stores the item's name and unit price as sold, because the menu will change tomorrow and a refund, a dispute or a regulator asks what was sold today.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)); columns each chapter owns (menus and hours, fee plans, batches, memberships, issues) are added there:

```sql
CREATE TABLE merchants (                 -- the business that sells
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_id           UUID REFERENCES merchants (id),  -- a franchisee under its brand
  legal_name          TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('restaurant', 'grocery', 'convenience',
                        'retail', 'other')),
  payment_account_ref TEXT,              -- the payee in the Payments volume's model
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'paused',
                        'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (                 -- where an order is made or picked
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  kind         TEXT NOT NULL CHECK (kind IN ('store', 'kitchen', 'virtual_brand', 'dark_store',
                 'warehouse')),
  name         TEXT NOT NULL,
  address_id   UUID NOT NULL,            -- the playbook's addresses table
  time_zone    TEXT NOT NULL,            -- IANA, e.g. 'America/New_York'
  country      CHAR(2) NOT NULL,         -- ISO 3166-1 alpha-2
  subdivision  TEXT,                     -- ISO 3166-2; state rules resolve from here
  locality     TEXT,                     -- city; fee caps and disclosure rules resolve here
  currency     CHAR(3) NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'paused', 'closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE items (                     -- what the merchant sells, defined once
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  kind          TEXT NOT NULL CHECK (kind IN ('prepared', 'packaged', 'modifier', 'bundle')),
  name          TEXT NOT NULL,
  description   TEXT,
  gtin          TEXT,                    -- barcode for packaged goods; null for a dish
  sold_by       TEXT NOT NULL DEFAULT 'each' CHECK (sold_by IN ('each', 'weight')),
  tax_category  TEXT NOT NULL,           -- resolves to a rate per jurisdiction
  external_refs JSONB NOT NULL DEFAULT '{}',  -- POS and partner IDs, keyed by system
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE location_items (            -- an item as sold at one location
  location_id  UUID NOT NULL REFERENCES locations (id),
  item_id      UUID NOT NULL REFERENCES items (id),
  price        BIGINT NOT NULL CHECK (price >= 0),  -- in-store price, minor units
  available    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (location_id, item_id)
);

CREATE TABLE modifier_groups (           -- "choose a cheese", "add extras"
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  name            TEXT NOT NULL,
  min_selections  SMALLINT NOT NULL DEFAULT 0,
  max_selections  SMALLINT,              -- null: no limit
  CHECK (max_selections IS NULL OR max_selections >= min_selections)
);

CREATE TABLE modifier_group_options (    -- each option is an item, so it has a price and stock
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  position          SMALLINT NOT NULL,
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (modifier_group_id, item_id)
);

CREATE TABLE item_modifier_groups (      -- which groups an item offers; options can nest
  item_id           UUID NOT NULL REFERENCES items (id),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups (id),
  position          SMALLINT NOT NULL,
  PRIMARY KEY (item_id, modifier_group_id)
);

CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  kind        TEXT NOT NULL CHECK (kind IN ('person', 'business')),
  status      TEXT NOT NULL CHECK (status IN ('active', 'locked', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (                    -- one purchase, one location, one channel
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  customer_id      UUID REFERENCES customers (id),     -- null: a walk-in sale
  channel          TEXT NOT NULL CHECK (channel IN ('marketplace', 'first_party', 'pos',
                     'phone', 'kiosk')),
  channel_partner  TEXT,                 -- e.g. 'doordash', 'ubereats'; null for own channels
  external_ref     TEXT,                 -- the partner's order ID
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup',
                     'dine_in', 'shipping')),
  timing           TEXT NOT NULL CHECK (timing IN ('asap', 'scheduled')),
  scheduled_for    TSTZRANGE,            -- the promised window for scheduled orders
  status           TEXT NOT NULL CHECK (status IN ('placed', 'accepted', 'preparing',
                     'ready', 'fulfilled', 'cancelled')),
  currency         CHAR(3) NOT NULL,
  idempotency_key  TEXT NOT NULL,
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel_partner, external_ref),
  UNIQUE (idempotency_key),
  CHECK ((timing = 'scheduled') = (scheduled_for IS NOT NULL))
);

CREATE TABLE order_lines (               -- goods, priced as sold; modifiers are child lines
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  parent_line_id UUID REFERENCES order_lines (id),
  item_id        UUID NOT NULL REFERENCES items (id),
  name           TEXT NOT NULL,          -- snapshot
  quantity       NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),  -- weight for sold_by = 'weight'
  unit_price     BIGINT NOT NULL,        -- snapshot, the channel's price
  amount         BIGINT NOT NULL,        -- quantity x unit_price, rounded once
  status         TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'substituted',
                   'unavailable', 'refunded'))
);

CREATE TABLE order_charges (             -- everything that isn't goods
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  kind        TEXT NOT NULL CHECK (kind IN ('delivery_fee', 'service_fee', 'small_order_fee',
                'regulatory_fee', 'tax', 'tip', 'discount', 'commission', 'processing_fee')),
  payer       TEXT NOT NULL CHECK (payer IN ('customer', 'merchant', 'platform')),
  payee       TEXT NOT NULL CHECK (payee IN ('merchant', 'platform', 'courier', 'authority',
                'customer')),
  amount      BIGINT NOT NULL,           -- positive; a discount is paid to the customer
  rule_ref    TEXT,                      -- the fee plan, tax rule or promotion that produced it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fulfillments (              -- how the order moves, and by whom
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id      UUID NOT NULL REFERENCES orders (id),
  kind          TEXT NOT NULL CHECK (kind IN ('delivery', 'pickup', 'dine_in', 'shipping')),
  provider      TEXT NOT NULL CHECK (provider IN ('merchant', 'marketplace_network',
                  'logistics_network', 'carrier')),
  provider_name TEXT,                    -- e.g. 'doordash_drive', 'uber_direct'
  provider_ref  TEXT,                    -- the provider's delivery ID
  dropoff       JSONB,                   -- address and instructions as given, snapshot
  status        TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'picked_up',
                  'delivered', 'failed', 'cancelled', 'returned')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_payments (            -- pointers into the Payments volume's records
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id     UUID NOT NULL REFERENCES orders (id),
  kind         TEXT NOT NULL CHECK (kind IN ('authorization', 'capture', 'refund', 'credit')),
  amount       BIGINT NOT NULL CHECK (amount > 0),
  payment_ref  TEXT NOT NULL,            -- the processor's or ledger's ID
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **Location is where rules resolve.** Fee caps are per city, disclosure laws per state, tax per jurisdiction, time per zone: `locations.country`, `subdivision`, `locality` and `time_zone` are what [Rules as Data](/docs/architecture/rules-as-data) looks up. A virtual brand (a delivery-only menu cooked in another restaurant's kitchen) is a location of its own merchant whose address is the kitchen's.
- **Modifier options are items.** A modifier option has a price, a stock level, a barcode sometimes and its own modifiers (a combo's drink has a size). Making it an item gives it all of those, and lets an option be "86'd" exactly like a dish.
- **External IDs are a map, not columns.** Every item carries a POS ID and an ID per marketplace; `external_refs` keyed by system, plus the `(channel_partner, external_ref)` uniqueness on orders, is how the same order injected twice is caught.
- **No tenant above merchants, unless you sell software.** A marketplace is one operator; the merchant is the unit of scope. A point-of-sale or ordering vendor selling to many merchants adds a tenant above merchants exactly as [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies) describes, and the later POS part does.
- **Money is the Payments model.** `order_payments` points at authorizations, captures and refunds in the [Payments](/books/payments/card-payments#the-core-data-model) volume; merchant payouts are that volume's [Payouts & Settlement](/books/payments/payouts-and-settlement); a dispute is its own object ([Refunds and Disputes Are Their Own Objects](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)).
- **Emit life-cycle events.** `order.placed`, `order.accepted`, `order.ready`, `fulfillment.assigned`, `fulfillment.picked_up`, `fulfillment.delivered`, `order.cancelled` and `order.refunded` are what dispatch, notifications, payouts and reporting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine:

| Table | Extended by |
| --- | --- |
| `merchants`, `locations` | [The Delivery Landscape](/books/commerce/delivery-landscape#how-to-build-it) (`sales_channels`, `merchant_channel_enrollments`, `delivery_providers`); [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#how-to-build-it) (`listing_agreements`, `location_hours`, `location_pauses`); [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it) (`commission_plans`, `fee_rules`, `merchant_statements`) |
| `items`, `location_items`, modifiers | [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#how-to-build-it) (`menus`, `menu_hours`, `menu_categories`, `menu_category_items`, `channel_prices`, `menu_publications`, `availability_changes`, `catalog_imports`, availability prediction columns) |
| `orders`, `order_lines` | [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it) (`order_status_changes`, `prep_estimates`); [Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#how-to-build-it) (`substitution_preferences`, `line_substitutions`); [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it) (`order_issues`, `issue_lines`, `issue_resolutions`, `error_charges`, `error_charge_disputes`) |
| `order_charges` | [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#how-to-build-it) (charge classes, `price_displays`); [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it) (`benefit_applications`) |
| `fulfillments` | [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it) (`fulfillment_events`, `delivery_offers`, `batches`, `batch_stops`) |
| `customers` | [Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it) (`membership_plans`, `memberships`, `membership_periods`, `membership_cancellations`); [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#how-to-build-it) (`identity_links`, `promotion_redemptions`) |

## Auditing

The records in this chapter are the ones merchants, customers, regulators and courts ask about later:

- **What was sold, as sold.** Every order line with its name, price, modifiers and channel at the moment of sale, so a refund, an error charge or a pricing complaint is judged against what the customer actually bought.
- **What was charged, line by line.** Every fee, tax, tip, discount and commission with its payer, payee and the rule or plan version that produced it; a city regulator checking a cap and an attorney general checking tips both read these rows.
- **Who moved the order.** Every fulfillment with its provider, external ID and status history, so a missing order can be placed with a courier or a network.
- **Every money movement.** Authorizations, captures, refunds, credits and payouts as append-only records tied to the order ([Payment States & Ledgers](/docs/payments/payment-states)).

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Separate merchant from location,** and resolve hours, prices, availability, fee caps, tax and payees at the location.
- **Define an item once and sell it per location,** with price and availability on the location item.
- **Model modifier options as items** in groups with selection limits, so they can be priced, stocked and nested.
- **Make channel a property of the order,** with the partner's order ID unique per partner.
- **Store every non-goods amount as a charge line** with a payer, a payee and the rule that produced it, and compute totals from lines.
- **Keep fulfillment separate from the order,** so providers can change without the order changing.
- **Snapshot names and prices on order lines.**
- **Point at the Payments model** for every authorization, capture, refund and payout instead of rebuilding it.
- **Emit life-cycle events** for orders and fulfillments, and let dispatch, payouts and reporting consume them.

## References

**Reference**

- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), the Marketplace and Commerce Platform, including Drive white-label delivery fulfillment
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), the Delivery segment and Uber Direct as white-label delivery for retailers and restaurants
- [Maplebear (Instacart): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000018/cart-20251231.htm), the marketplace, the Enterprise platform and storefront technology for grocers
- [Olo: Rails](https://www.olo.com/rails), syncing menus, pricing, location data and item availability with marketplaces and ending manual entry of marketplace orders into the POS
- [Olo: Dispatch](https://www.olo.com/dispatch), delivery from a restaurant's own site and app through a network of delivery service providers
- [Gopuff: Introducing Gopuff's new website (September 18, 2025)](https://markets.financialcontent.com/ms.intelvalue/article/bizwire-2025-9-18-introducing-gopuffs-new-website-the-future-of-shopping), owning the inventory and operating its own micro-fulfillment centers
