+++
title = "Merchants, Menus & Catalogs"
description = "Onboarding restaurants and stores, menus and modifiers synced from the POS, item availability, grocery catalogs, substitutions, and in-app price markups."
category = "Commerce Industry"
order = 2343
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "catalog", "menus", "point-of-sale", "pricing"]
+++

A delivery platform sells what it doesn't stock. A restaurant's menu lives in its point of sale, a grocer's prices live in its merchandising system, and what is actually on the shelf or in the walk-in at 7:40 on a Friday lives nowhere at all until a cook or a shopper finds out. The platform has to show a customer a menu that is accurate for one location at one moment, take an order against it, and get that order back into the kitchen in a shape the kitchen's system accepts. Every gap between the copies becomes an item the customer paid for and didn't get, a modifier the kitchen never saw, or a price the customer later finds was higher than in the store.

This chapter covers getting merchants onto a platform (and the laws that forbid listing them without consent), the menu model of items, categories and modifier groups, syncing it with the point of sale, availability for items and stores, grocery catalogs where the platform predicts what is on the shelf, substitutions, and in-app prices and their disclosure. It extends `items`, `location_items`, the modifier tables and `order_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from each vendor's developer and help documentation:

| Platform | How the menu gets there | Availability | Notable rules |
| --- | --- | --- | --- |
| **DoorDash (Marketplace API)** | POS or ordering partners push a menu with POST, change it with PATCH, or DoorDash pulls it with an ingest tool | Item and modifier-option deactivation and reactivation by webhook; store deactivation through a status endpoint, temporary only, defaulting to 14 days | At least one menu update per store per day; partners keep order failure and merchant cancel rates below 1% and fix visible menu issues within 48 business hours |
| **Uber Eats (Menu API)** | One upsert that "allows a developer to create or override the entire menu for a specific store"; the delivery menu is upserted first | `suspension_info.suspend_until`, a Unix timestamp, per item; restaurants can mark an item out of stock "for the day or indefinitely" in the orders app | Menus carry days and times of availability; prices, quantities and suspensions can be overridden by menu, item or modifier-group context |
| **Toast to DoorDash** | DoorDash takes the menu from Toast; the menu must be visible to online ordering partners | Managed in Toast's third-party ordering settings, including snoozing the channel | Time-specific pricing, pre-modifiers ("no", "extra", "on side"), subgroups and prompt-for-quantity items don't sync and must be edited in DoorDash's portal |
| **Square to DoorDash and Uber Eats** | Menus assigned to the location linked to the integration | DoorDash removes an item that hits zero stock or is marked out of stock "completely, instead of listing it as sold out" | Uber Eats busy mode adds prep time to incoming orders |
| **Olo Rails** | Syncs "menus, pricing, location data, and item availability" between the brand's systems and marketplaces | Synced with the menu | Marketplace orders come back to one place instead of separate tablets |
| **Instacart (catalog)** | Retailers send inventory files (full and delta, or reinventory); static product fields are required only when a product is first created | An `available` flag per item and store, plus a model of shopper found rates | Required columns include `lookup_code`, `cost_price_per_unit`, `cost_unit`, `location_code` and `available` |
| **Gopuff** | Its own inventory in its own micro-fulfillment centers | Only what is in stock locally is listed | Says owned inventory means "eliminating frustrating product replacements" |

Three patterns:

- **The point of sale is the source, but never the whole source.** Every restaurant integration syncs the core menu from the POS and leaves pieces (time-based prices, pre-modifiers, quantity prompts) to be edited on the platform. Those pieces drift.
- **Availability is a separate, faster stream.** Menus are pushed daily or on change; "86-ing" an item (taking it off because it ran out) or pausing a store is an event that must arrive within seconds, with its own endpoint or webhook on every platform.
- **Grocery replaces truth with prediction.** No grocer knows its shelf in real time, so catalogs carry a retailer's availability flag and the platform overlays a predicted probability of finding the item.

## Onboarding Merchants

A merchant is listed on a marketplace through an agreement, and listing one without an agreement is now illegal in the two largest US markets:

- **California's Fair Food Delivery Act** (AB 2149, 2020; Business and Professions Code section 22598 and following) prohibits a platform "from arranging for the delivery of an order from a food facility without first obtaining an agreement with the food facility expressly authorizing the food delivery platform to take orders and deliver meals."
- **New York City's Local Law 91 of 2021** prohibits including a food service establishment's products on a third-party delivery platform without a written agreement, with civil penalties of up to $500 a day per establishment, and Local Law 92 of 2021 requires the restaurant's own phone number in the listing, with any platform-created number described along with its fees.
- **The FTC's December 2024 case against Grubhub** alleged that it listed "as many as 325,000 unaffiliated restaurants," more than half of the restaurants on its platform; the order requires it to stop.

So a listing starts with a signed agreement per location (or per brand covering named locations), recorded with its date and terms, and a listing that has none can't be published. The fee and data clauses of those agreements are in [Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#listing-without-consent).

The rest of onboarding is the merchant's identity and money (who owns the location, which bank account gets the payout, the tax ID), which the Payments volume's [Merchant Onboarding](/books/payments/merchant-onboarding) covers, and the location's operating facts: address and pickup instructions, delivery radius, hours per channel, default prep time, and which POS or ordering vendor it integrates through. Account takeover of merchant portals, where an attacker changes the bank account, is in [Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#account-takeover).

## Menus, Modifiers and Items

Every platform's menu model is the same four layers, and Uber Eats' Menu API spells them out:

- **Menus** are named sets of categories with days and times of availability (breakfast, lunch, late night): "The days and times of the day at which this menu should be made available."
- **Categories** are ordered lists of items ("Burgers", "Drinks").
- **Items** have a title, a price (an integer, "never decimals") and the modifier groups they offer.
- **Modifier groups** are choices with quantity rules ("choose 1 cheese", "up to 3 extras"), and their options are items themselves, so an option has its own price, availability and modifier groups.

Uber's model also allows **overrides by context:** an item's price, quantity limits or suspension can differ when it appears in a particular menu, category or modifier group. A drink that costs $2.50 alone and $0 as the drink in a combo is one item with a price override in the combo's group. [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) represents this with modifier options that are items; menus, categories and per-context prices are added below.

Three details cause most bad orders:

- **Required groups.** A modifier group with a minimum of one (a steak's doneness) must be enforced in the cart; an order that reaches the kitchen without it can't be made as intended.
- **Nesting.** A combo's drink has a size, which has a flavor. Order lines store modifiers as child lines of their parent line, to any depth, so the kitchen ticket can be printed in order.
- **Pre-modifiers.** "No onions", "extra sauce", "on the side" are modifiers of a modifier. Toast's DoorDash integration doesn't sync them, which is why they need to exist in the platform's own model rather than be inferred from the POS's.

## The Source of Truth

For a restaurant, the point of sale is where the kitchen works, so it should be where the menu is edited. The integrations differ in direction:

- **Push.** The POS or ordering vendor sends the whole menu (Uber's upsert replaces it entirely) or a change (DoorDash's PATCH). Replace-everything is simple and expensive; partial updates are cheap and drift.
- **Pull.** The platform fetches the menu from the POS on a schedule or on a webhook (DoorDash's pull from Toast, its menu refresh tools; Uber's `store.menu_refresh_request` webhook asks the integrator to send it again).
- **Middleware.** Olo Rails, and similar vendors, hold one menu and publish it to every marketplace, with a price per marketplace.

My rule: **one system edits each field, and every other copy is generated from it.** Name, description, modifiers and in-store price come from the POS; per-channel prices, photos, platform-only categories and the fields the POS can't express are edited on the platform and stored as overlays, never as edits to the synced copy, so the next sync doesn't erase them. Each publication of a menu to a channel is recorded with a version and a hash, so "what did the customer see at 7:40" has an answer, and the IDs on each side (POS item ID, platform item ID) are stored on the item ([external IDs](/books/commerce/commerce-business#the-core-data-model)) so an order can be injected back into the POS with items it recognizes.

## Availability

Availability has three levels, and each has its own clock:

- **Store.** Open, closed by hours, or paused (too busy, a broken fryer, a power cut). DoorDash's store status endpoint takes `is_active`, a reason and an end time; it no longer accepts permanent deactivations from POS providers and treats a deactivation without an end as temporary, reactivating it after a default of 14 days. A pause that ends by itself is the right default: a store forgotten in "paused" loses a day of orders, and one forgotten in "open" during an outage sends couriers to a dark kitchen.
- **Menu.** Breakfast ends at 11:00 local time; a late-night menu starts at 22:00. Menu hours are evaluated in the location's time zone, per channel, with special hours (a holiday closure) overriding regular hours.
- **Item and option.** An item or a modifier option runs out. Uber's `suspend_until` takes a time, and its orders app offers "for the day or indefinitely"; DoorDash has activation webhooks for items and options. Two behaviors differ by platform and matter to customers: whether an unavailable item is hidden or shown as sold out (Square notes that DoorDash removes it "completely"), and whether an item becomes available again automatically. An 86 "for the day" should end at the location's next opening, not at midnight UTC.

Prep load is a fourth, softer form of availability. Uber Eats' busy mode adds time to incoming orders; both platforms let a merchant set a default prep time that dispatch starts from ([Prep Time and ETAs](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas)).

## Grocery Catalogs

A grocery store has tens of thousands of products, most of them packaged goods with barcodes that are identical across stores, and prices and stock that differ store by store. The catalog therefore splits into two layers:

- **Product content, shared.** Name, brand, size, unit, images, ingredients and nutrition for a barcode, maintained once. Instacart's catalog requirements reflect it: name, size, unit count and brand are static fields required only when a product is first created.
- **Store data, per location.** Price, availability and location code, from the retailer's inventory file. Instacart's minimum requirements include `lookup_code`, `cost_price_per_unit`, `cost_unit`, `location_code` and `available`.

The file semantics are a design decision worth copying. Instacart distinguishes full and delta files, where a row missing from the file leaves the item as it was, from reinventory files, where a row missing from the file marks the item unavailable. A system that can't tell "not mentioned" from "gone" will either show items a store dropped months ago or hide its whole catalog after a truncated upload.

The retailer's flag is still not the shelf. Instacart describes predicting "the availability of over 500 million listings every 60 minutes" across nearly 25,000 stores, with shopper scans and "not found" markings as the signal, and its catalog documentation says a model based on shopper found rates can influence what is shown. The output is a probability per item and store, used to rank, warn ("may be out of stock") or hide. My default: store the retailer's flag and the predicted probability side by side, with the time of each, and make the storefront's decision a rule over both, because the retailer disputes a hidden item with its flag and the customer disputes a missing one with the prediction.

## Substitutions

When the shopper can't find an item, the order changes after the customer paid. Instacart's figures show how often: a customer shopping for themselves replaces 7% of the items they look for, and when customers leave the choice to the shopper, shoppers handle replacements about half the time. The platforms converge on the same flow:

- **A preference per line, set before shopping.** The customer chooses a best match chosen by the shopper, a specific replacement, or a refund for that item. Shipt's app lets customers "request substitutions" and talk to the shopper directly.
- **Confirmation during shopping.** Instacart's October 2025 shopper flow lets the shopper "scan up to three available replacement options" for the customer to choose from or approve, with a refund as the alternative, and counts a "customer pre-approved replacement" as a replaced item in the shopper's quality score.
- **The price difference is settled.** A replacement can cost more or less than the original; the charge for the order is adjusted after shopping, which is why grocery orders authorize more than the estimated total ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)).
- **Weighted items are estimates.** An item sold by weight is ordered as an estimate and charged at the weight picked; Instacart's pricing help describes an "Adjustment Charge" when "the final item cost was higher than estimated."

Substitutions are recorded as a link from the original order line to its replacement, never by editing the original line: the customer was promised one thing and given another, and a refund request, a regulated-item check (a replacement can't be alcohol if the original wasn't) or a dispute needs both.

## In-App Prices and Markups

Merchants usually price items higher in delivery apps than in the store, and the law and the platforms have taken positions on who may set that price and what the customer must be told:

- **The merchant sets the price, not the platform.** California's AB 286 (2021) made it unlawful for a delivery platform to "charge a customer a purchase price for food or beverage that is higher than the price set by the food facility." The restaurant can still set a higher app price; the platform can't add its own markup.
- **Platforms allow markups and police extremes.** DoorDash says it "does not require delivery prices to match in-store," that restaurants "can continue to make their own delivery menu pricing decisions," and that it may remove merchants for "extreme levels of price inflation." Uber Eats charges a pickup fee of 7% with validated in-store pricing and 10% without, a commission incentive to match.
- **Disclosure came from enforcement.** In June 2021 the District of Columbia and Pennsylvania attorneys general announced that Uber Eats would tell customers at checkout that "prices on the platform may be higher than in the restaurant." Shipt advertises "no price markups" as a benefit for Target Circle 360 members.
- **Price testing drew a retreat.** A December 2025 study by Groundwork Collaborative, Consumer Reports and More Perfect Union found nearly three-quarters of items tested on Instacart showed different prices to different shoppers, an average gap of 13% and up to 23%, through tests run with Instacart's Eversight technology; on December 22, 2025 Instacart said it was "ending all item price tests on our platform" and that retailers "will continue to set their own prices."
- **Regulators are asking.** The FTC's April 2026 advance notice on delivery fees asks whether platforms disclose that item prices differ from in-store prices or from prices offered to other users, and on October 28, 2026 the FTC sent orders to DoorDash, Instacart, Uber and others asking whether prices vary from person to person.

The design that survives all of this: **an item has an in-store price and a price per channel, each with who set it,** and every order line records which price it was sold at. A disclosure ("prices may be higher than in store") is a rule per jurisdiction and channel shown from data ([Rules as Data](/docs/architecture/rules-as-data)), and a price that differs by customer is either impossible in the schema or recorded with the experiment that produced it.

## How to Build It

```sql
CREATE TABLE listing_agreements (        -- no listing without consent
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  location_id   UUID REFERENCES locations (id),   -- null: covers the merchant's listed locations
  channel_id    TEXT NOT NULL REFERENCES sales_channels (id),
  document_ref  TEXT NOT NULL,           -- the signed agreement, versioned
  signed_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ
);

CREATE TABLE location_hours (            -- regular and special hours, per channel
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  channel_id   TEXT REFERENCES sales_channels (id),  -- null: all channels
  day_of_week  SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),  -- ISO; null for a dated entry
  on_date      DATE,                     -- a special day; overrides day_of_week
  opens        TIME,                     -- location-local; null with closes: closed all day
  closes       TIME,
  CHECK ((day_of_week IS NULL) <> (on_date IS NULL))
);

CREATE TABLE location_pauses (           -- temporary store deactivation
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  channel_id   TEXT REFERENCES sales_channels (id),
  reason       TEXT NOT NULL CHECK (reason IN ('busy', 'equipment', 'staffing', 'weather',
                 'outage', 'other')),
  paused_during TSTZRANGE NOT NULL,      -- always bounded: a pause ends by itself
  set_by       TEXT NOT NULL CHECK (set_by IN ('merchant', 'pos', 'platform')),
  CHECK (NOT upper_inf(paused_during))
);

CREATE TABLE menus (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  name         TEXT NOT NULL,            -- 'Lunch', 'Late night'
  channel_id   TEXT REFERENCES sales_channels (id)  -- null: every channel
);

CREATE TABLE menu_hours (
  menu_id      UUID NOT NULL REFERENCES menus (id),
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  starts       TIME NOT NULL,            -- location-local
  ends         TIME NOT NULL,
  PRIMARY KEY (menu_id, day_of_week, starts)
);

CREATE TABLE menu_categories (
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  menu_id   UUID NOT NULL REFERENCES menus (id),
  name      TEXT NOT NULL,
  position  SMALLINT NOT NULL
);

CREATE TABLE menu_category_items (
  category_id UUID NOT NULL REFERENCES menu_categories (id),
  item_id     UUID NOT NULL REFERENCES items (id),
  position    SMALLINT NOT NULL,
  PRIMARY KEY (category_id, item_id)
);

CREATE TABLE channel_prices (            -- in-app prices, and prices in context
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id       UUID NOT NULL REFERENCES locations (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  channel_id        TEXT NOT NULL REFERENCES sales_channels (id),
  modifier_group_id UUID REFERENCES modifier_groups (id),  -- price as an option in this group
  price             BIGINT NOT NULL CHECK (price >= 0),
  set_by            TEXT NOT NULL CHECK (set_by IN ('merchant', 'platform')),
  valid_during      TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (location_id WITH =, item_id WITH =, channel_id WITH =,
    (COALESCE(modifier_group_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    valid_during WITH &&)
);

CREATE TABLE menu_publications (         -- what each channel was sent, and when
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  channel_id   TEXT NOT NULL REFERENCES sales_channels (id),
  content_hash BYTEA NOT NULL,           -- the generated payload, stored by hash
  payload_ref  TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('sent', 'accepted', 'rejected')),
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE availability_changes (      -- every 86 and un-86, with who and until when
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id  UUID NOT NULL REFERENCES locations (id),
  item_id      UUID NOT NULL REFERENCES items (id),
  available    BOOLEAN NOT NULL,
  until        TIMESTAMPTZ,              -- automatic return; null: until changed
  source       TEXT NOT NULL CHECK (source IN ('merchant', 'pos', 'shopper', 'prediction',
                 'catalog_file', 'platform')),
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE catalog_imports (           -- retailer files and their semantics
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  kind         TEXT NOT NULL CHECK (kind IN ('full', 'delta', 'reinventory')),
  rows_total   INT NOT NULL,
  rows_rejected INT NOT NULL DEFAULT 0,
  status       TEXT NOT NULL CHECK (status IN ('received', 'validated', 'applied',
                 'quarantined')),
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE location_items
  ADD COLUMN found_probability REAL CHECK (found_probability BETWEEN 0 AND 1),
  ADD COLUMN predicted_at      TIMESTAMPTZ;

CREATE TABLE substitution_preferences (  -- set per line before shopping
  order_line_id      UUID PRIMARY KEY REFERENCES order_lines (id),
  preference         TEXT NOT NULL CHECK (preference IN ('best_match', 'specific', 'refund')),
  specific_item_id   UUID REFERENCES items (id),
  CHECK ((preference = 'specific') = (specific_item_id IS NOT NULL))
);

CREATE TABLE line_substitutions (        -- the original line stays; the replacement links to it
  original_line_id    UUID PRIMARY KEY REFERENCES order_lines (id),
  replacement_line_id UUID REFERENCES order_lines (id),  -- null: refunded instead
  approval            TEXT NOT NULL CHECK (approval IN ('pre_approved', 'approved',
                        'rejected', 'no_response')),
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **A pause can't be open-ended.** `location_pauses` requires an upper bound, which is DoorDash's rule made structural; extending a pause is a new row.
- **Prices are time-ranged per channel and context.** The exclusion constraint makes two prices for one item, location, channel and group at the same moment impossible, and an order line's `unit_price` is copied from the row in force at `placed_at`.
- **A quarantined import changes nothing.** A reinventory file with a fraction of yesterday's rows is quarantined for review instead of marking most of the store unavailable.
- **Availability is a log, the current state a projection.** `availability_changes` answers "who 86'd the salmon and when," and the current flag on `location_items` is derived from it plus scheduled returns.

## Auditing

- **Consent to list.** Every listing's agreement, signed date and term, so a city or state inquiry about an unconsented listing is a query.
- **What each channel showed.** Every menu publication with its hash and payload, so a complaint about an item, a price or a missing modifier is judged against what the customer saw.
- **Every price and who set it.** In-store and channel prices with their validity and setter, which is what a markup or personalized-pricing inquiry asks for.
- **Every availability change.** Item, store and menu changes with source and time, including the predicted probability that hid an item.
- **Every substitution.** Original, replacement, the customer's preference and approval, and the price difference charged or refunded.

## What This Means for the System You Build

- **Require a signed agreement before a listing publishes,** per location and channel.
- **Model menus, categories, items and modifier groups,** with options as items and overrides by context.
- **Let one system edit each field:** sync from the POS, store platform-only fields as overlays, and record every publication.
- **Treat availability as fast events with automatic ends,** for stores, menus, items and options, evaluated in the location's time zone.
- **Separate shared product content from store data** in grocery catalogs, and honor the difference between "not in this file" and "gone".
- **Store the retailer's flag and the predicted availability side by side.**
- **Record substitutions as links from the original line,** with the customer's preference and approval.
- **Keep in-store and per-channel prices with who set them,** and drive markup disclosures from rules per jurisdiction.

## References

**Law and enforcement**

- [California Senate Judiciary Committee: Analysis of AB 578 (2025)](https://sjud.senate.ca.gov/media/1843), the Fair Food Delivery Act's agreement requirement (Business and Professions Code section 22598 and following) and section 22599.1
- [California Senate Judiciary Committee: Analysis of AB 286 (2021)](https://sjud.senate.ca.gov/sites/sjud.senate.ca.gov/files/ab_286_l_gonzalez_sjud_analysis.pdf), the ban on charging more than the price set by the food facility
- [New York City Council: Local Law 91 of 2021](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4988638&GUID=7AD12CDE-B09E-486D-A189-98AD23128D8B), no listing without a written agreement, penalties
- [New York City Council: Local Law 92 of 2021](https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4988640&GUID=F89643AC-B419-4C51-A150-3D6EE70F2046), the restaurant's own phone number in listings
- [FTC: Action against Grubhub (December 17, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-illinois-attorney-general-take-action-against-grubhub-harming-diners-workers-small-businesses), up to 325,000 unaffiliated restaurants listed and the order to stop
- [Office of the Attorney General for the District of Columbia: Uber Eats price disclosure (June 22, 2021)](https://oag.dc.gov/node/2050), the in-app notice that prices may be higher than in the restaurant
- [FTC: Public comment on fee practices of online food and grocery delivery services (April 14, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-seeks-public-comment-unfair-deceptive-fee-practices-online-food-grocery-delivery-services), questions on in-store and personalized item prices
- [FTC: Personalized pricing and compensation inquiry (October 28, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-launches-personalized-pricing-compensation-inquiry), 6(b) orders including DoorDash, Instacart and Uber

**Platform documentation**

- [DoorDash Developer: General integration requirements](https://developer.doordash.com/en-US/docs/marketplace/overview/getting_started/general_integration_requirements), menu create, update and pull, daily updates, 86-ing items and options, store availability, failure and cancel rates below 1%, the 48-hour menu fix
- [DoorDash Developer: Store and item status](https://developer.doordash.com/docs/marketplace/how_to/store_and_item_status), the status endpoint, no permanent deactivations from POS providers, the 14-day default
- [Uber Eats Developer: Upsert menu](https://developer.uber.com/docs/eats/references/api/v2/put-eats-stores-storeid-menu), the full-menu override, menus, categories, items, modifier groups, service availability, `suspend_until`, integer prices, overrides by context
- [Uber Eats Developer: Menu API suite](https://developer.uber.com/docs/eats/guides/menu), the menu endpoints and the menu refresh request webhook
- [Uber Eats Merchants: Uber Eats Orders app](https://merchants.ubereats.com/gb/en/resources/learning-center/uber-eats-orders-app/), marking items out of stock for the day or indefinitely, busy mode, scheduled orders
- [DoorDash Merchants: Manage your Toast integration](https://help.doordash.com/en-us/merchants/article/managing-doordash-orders-on-your-toast-pos), visibility to online ordering partners and the fields that don't sync
- [Square: Troubleshoot DoorDash and Uber Eats integration](https://squareup.com/help/us/en/article/8517), menus assigned to the linked location, DoorDash removing out-of-stock items, busy mode
- [Olo: Rails](https://www.olo.com/rails), syncing menus, pricing, location data and item availability with marketplaces
- [Instacart Docs: Minimum catalog requirements](https://docs.instacart.com/catalog/catalog_inventory_file/specifications/minimum-catalog-requirements), required columns, file types and availability semantics, the found-rate model
- [Instacart Help: Pricing](https://instacart.com/help/section/pricing), the adjustment charge for weighted items
- [DoorDash: Strategic menu pricing (September 4, 2023)](https://about.doordash.com/en-us/news/strategic-menu-pricing-on-doordash), no requirement to match in-store prices and removal for extreme inflation
- [Uber Eats: Merchant pricing (US)](https://merchants.ubereats.com/us/en/pricing/), the 7% and 10% pickup fees with and without validated in-store pricing
- [Shipt: App Store listing](https://apps.apple.com/us/app/971888874), substitutions and no markups for Target Circle 360 members
- [Gopuff: Introducing Gopuff's new website (September 18, 2025)](https://markets.financialcontent.com/ms.intelvalue/article/bizwire-2025-9-18-introducing-gopuffs-new-website-the-future-of-shopping), owned inventory and fewer replacements

**Engineering and research**

- [Instacart: The story behind an Instacart order, part 3](https://company.instacart.com/tech-innovation/the-story-behind-an-instacart-order-part-3-predicting-the-shop), availability predicted for over 500 million listings every 60 minutes across nearly 25,000 stores, the 7% replacement rate, shoppers choosing replacements about half the time
- [Instacart: A more straightforward replacements experience (October 16, 2025)](https://company.instacart.com/shopper-community/providing-a-more-straightforward-replacements-experience), scanning up to three options and customer approval
- [Consumer Reports: Report on Instacart's price tests (December 9, 2025)](https://www.consumerreports.org/media-room/press-releases/2025/12/new-report-exposes-instacarts-hidden-price-games/), the share of items with different prices, the 13% average and 23% maximum gaps, Eversight
- [Instacart: Ending item price tests (December 22, 2025)](https://company.instacart.com/updates/ending-item-price-tests-on-instacart), ending all item price tests and retailers setting their own prices
