+++
title = "Drop Ship & Print on Demand"
description = "Selling goods someone else ships: retailer drop-ship programs, distributors and apps, Printful and Printify, margins, seller of record and liability."
category = "Commerce Industry"
order = 2338
part = "Wholesale and B2B"
tags = ["commerce", "drop-ship", "print-on-demand", "suppliers", "liability", "data-model"]
+++

In drop shipping, the business that sells an item never touches it. The customer orders from the seller; the seller passes the order to a supplier; the supplier ships from its own warehouse, usually in the seller's name; the seller earns the difference between its price and the supplier's. It runs at every scale. A retailer lists hundreds of thousands of items online that its stores never stock, and its brands ship them direct to the retailer's customers. A distributor ships electronics to a reseller's customers. A one-person shop sells products from a catalog app. Print on demand is the same model with a factory step: the supplier prints the seller's design on a blank shirt or mug after each order arrives.

The software problem is that the seller owns the promise and not the means. The delivery date, the return, the product's safety and the truth of the listing are all the seller's obligations to the customer and to the law, while the stock, the packing and the carrier are someone else's. The seller needs the supplier's stock before it sells, the supplier's confirmation after, tracking from the supplier's carrier, and a way to hold the supplier to its terms. This chapter covers retailer drop-ship vendor programs, distributors and apps, print on demand, margins, and who is liable for what. It extends `suppliers`, `fulfillments` and `locations` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), where a drop-ship supplier is already a location with `operator = 'supplier'` and a fulfillment with `provider = 'supplier'`. The business model and its margins are summarized in [Business Models & Unit Economics](/books/commerce/business-models#drop-ship); buying stock you hold yourself is [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment).

## How the Platforms Do It

As of October 2026, from the providers' own pages:

| Platform or program | Who it serves | How orders flow | Price, as published |
| --- | --- | --- | --- |
| **Shopify Collective** | Shopify stores selling other Shopify brands' products | The supplier ships to the retailer's customer; retailers "typically earn 20–50% margins" | Free in supported countries and currencies |
| **Shopify dropshipping apps** | Shopify stores sourcing from supplier catalogs | Shopify's guide lists three routes: Collective, a dropshipping app, or a direct supplier relationship | Per app |
| **Walmart Drop Ship Vendor (DSV)** | Brands invited to ship Walmart.com orders | Walmart is seller of record; the vendor ships on Walmart's packing slip with Walmart-assigned carrier accounts | Invitation only; terms in Supplier One |
| **Rithum (CommerceHub and ChannelAdvisor)** | Retailers and their drop-ship suppliers | A network connecting retailers' drop-ship orders to suppliers | Not published |
| **Printful** | Print-on-demand sellers | Printful prints and ships white-label in the seller's name; "86% of orders are fulfilled in the same region as the customer" | No upfront cost; base price per item; Growth plan $24.99 a month (free above $12,000 annual sales) for up to 33% off products |
| **Printify** | Print-on-demand sellers | A marketplace of print providers; Printify "does not own, create, sell, resell, provide... any Products" | Free for up to 5 stores; Premium $39 a month, or $24.99 billed yearly, for up to 20% off products |

Three patterns:

- **The seller of record decides the obligations.** Walmart DSV makes Walmart the seller; Printful and Printify make the merchant the seller. Every consumer obligation (the shipping promise, returns, safety, tax) follows the seller of record, not the shipper.
- **White label is the norm.** Walmart's DSV vendors ship on Walmart's packing slip; Printful prints "white-label"; Amazon requires a drop-shipper to remove other sellers' packing slips. The customer should see only the seller.
- **Price is a base cost plus a subscription.** POD services charge a base price per item and sell a monthly plan that discounts it, so the seller's margin depends on volume and on the plan.

## Retailer Drop-Ship Programs

A retailer's drop-ship vendor (DSV) program is the brand side of the "endless aisle": the retailer lists the brand's products on its site, takes the customer's order and payment, and sends the order to the brand to ship. For Walmart's DSV program, third-party guides describe Walmart as seller of record, the vendor shipping on a Walmart packing slip using Walmart-provided FedEx or UPS accounts, by invitation only. Rithum (CommerceHub, which acquired ChannelAdvisor in 2022 and rebranded in December 2023) runs the network many retailers use to send drop-ship orders to suppliers.

For the brand, a DSV order is a hybrid of the two models in [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution):

- **It is a wholesale sale.** The retailer pays the brand its cost on terms, not the shopper's price, and invoices and deductions follow ([The Order-to-Cash Loop](/books/commerce/wholesale-and-retail-distribution#the-order-to-cash-loop)).
- **It ships like a consumer order.** One parcel to one home, inside the retailer's ship-by deadline, with tracking back to the retailer, on the retailer's packing slip and carrier account.
- **It is measured like a marketplace.** On-time shipment, valid tracking and cancellation rate, with the brand's ability to stay in the program at stake.
- **It moves by EDI or API.** The order arrives as an 850 or a network API call, the shipment confirmation goes back as an 856 with the tracking number, and the invoice as an 810, with inventory sent as an 846 so the retailer doesn't oversell ([EDI](/books/commerce/edi#the-transactions)).

The brand's systems treat it as an order with `channel = 'wholesale'`, a consumer ship-to, and a fulfillment that must use the retailer's carrier account and packing slip, which is a per-partner rule on the fulfillment, not a branch in the warehouse code.

## Distributors and Apps

Drop-ship suppliers for smaller sellers come in three kinds:

- **Distributors** that ship to resellers' customers for approved resellers: Ingram Micro's drop-ship runs through platform integrations for resellers it has approved. The seller is a customer of the distributor with an account, terms and a catalog feed.
- **Catalog apps** that put many suppliers' products in front of store owners and route orders to them; Shopify's guide points to apps as one route.
- **Brand-to-brand networks** such as Shopify Collective, where one brand sells another's products and the supplier ships.

Whichever kind, the integration has four parts:

1. **Catalog and stock feed.** Items, costs, images and available quantity from the supplier, refreshed often. An item listed from a stale feed is an oversell; the safe rule is to publish supplier stock less a buffer and to stop selling when the feed is older than a stated age ([Safety Stock and Channel Buffers](/books/commerce/inventory#safety-stock-and-channel-buffers)).
2. **Order routing.** The order (or the drop-ship lines of it) goes to the supplier with the seller's order reference, ship-to, service level and packing slip instructions, idempotently ([Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl) has the same rules).
3. **Confirmation and tracking.** The supplier accepts or rejects each line and sends tracking when it ships; the seller confirms to the customer and to any marketplace that took the order.
4. **Settlement.** The supplier invoices the seller for cost and shipping, on terms or charged to a card on file per order; the seller reconciles invoices to orders.

**Split orders.** A customer order for a stocked item and a drop-shipped one is two fulfillments, from two locations, by two providers, and usually two parcels ([Splits and Merges](/books/commerce/order-management#splits-and-merges)). The customer sees two tracking numbers; the shipping charge was quoted once. The order manager's sourcing rules decide which items go where ([Sourcing and Distributed Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)).

## Print on Demand

Print on demand adds a manufacturing step to each order: the seller uploads designs, maps each to a blank product and print placement, lists the resulting products, and when an order arrives the provider prints, packs and ships. Printful's model is a base price covering the blank, one print placement and fulfillment, with shipping and tax extra; Printify routes each order to one of the print providers in its network.

What the system holds for POD:

- **Print files.** The design artwork, at the provider's required resolution and format, versioned, with the placement (front, back, sleeve) and the blank product and variant it applies to. A design change is a new file version; orders keep the version they were placed with, so a reprint matches.
- **Variant mapping.** Each sellable item (a T-shirt in a size and color) maps to the provider's blank SKU and the print files for its placements.
- **Provider routing.** Which provider prints which items, by region (Printful fulfills most orders in the customer's region) or by cost.
- **Production time.** Printing adds days before shipment; the delivery promise shown at checkout includes it ([Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises)).

**Returns are different.** A printed item can't be resold, so POD providers don't take buyer's-remorse returns. Printful accepts no returns for "buyer's remorse, wrong size, or wrong color," and for misprints offers a free reprint or refund "within 30 days of product delivery," without requiring the item back. Printify asks merchants to contact support about misprints within 30 days of delivery, with the remedy at its discretion, and its products are "non-refundable" otherwise. A seller whose own store promises free returns pays for every return out of margin, so the seller's return policy has to be written with the provider's in view ([Return Policies and the Law](/books/commerce/returns-and-exchanges#return-policies-and-the-law)).

## Margins

The arithmetic is simple and unforgiving. An illustrative POD T-shirt in round numbers: sold at $28 plus $5 shipping; base cost $13 and shipping $5 from the provider; payment processing about 3% of $33, $1; platform and app fees $1; advertising to acquire the order $6. The seller keeps about $28 + $5 - $13 - $5 - $1 - $1 - $6 = $7, a quarter of the item price before returns, chargebacks and reprints the provider won't cover. A provider plan that takes 20% off the base cost adds $2.60 to that order, which is why the plans pay for themselves above a modest volume.

Drop shipping of other goods has the same shape with a supplier cost in place of a base price, and the margin is set by how much the seller can charge above a cost every competitor selling the same catalog item also pays. Shopify Collective's "typically" 20% to 50% retailer margin is the range where a seller's own audience or curation is the product. The seller carries no inventory, so its risk is not unsold stock but cancellations, oversells, late shipments and returns, each of which costs margin on an order already thin. The model comparison is in [Business Models & Unit Economics](/books/commerce/business-models#the-unit-economics).

## Liability

The seller of record answers to the customer, and contracts with the supplier decide whether it can pass the cost on:

- **Shipping promises.** The FTC's Mail Order Rule requires a seller to have a "reasonable basis to expect that it will be able to ship" in the time stated (or within 30 days if none is stated), and when it can't, to offer the buyer the option to consent to the delay or "cancel... and receive a prompt refund." The rule binds the seller, whoever packs the box, so a seller relying on a supplier needs the supplier's ship times as data and its own delay notices when the supplier is late. The rule's mechanics and the `shipping_promises` and `delay_notices` records are [Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule); a drop-shipped line feeds them from its supplier route. In the EU, a product made to the consumer's specification or clearly personalized is one of the withdrawal right's exceptions, which a POD item designed by the customer can be and a stock design printed to order generally isn't ([The EU Right of Withdrawal](/books/commerce/online-consumer-protection#the-eu-right-of-withdrawal)).
- **Packing slips and identity.** Amazon's drop shipping policy, as posted by Amazon staff on its seller forums, requires that "you are the only seller of record," that the seller remove "any packing slips, invoices, external packaging, or other information identifying a different seller or supplier," and that the seller handle returns; buying from another retailer and having it ship to the customer is not allowed unless the seller is identified as the seller of record.
- **Product claims and safety.** The seller is responsible for what its listing says and, as the seller, for product safety duties; the later Product Safety, Compliance & Recalls chapter covers them. Printful's terms put it plainly: "Any legal claim related to a Product your Customers purchase must be brought directly against you as the seller of the Product."
- **Intellectual property.** A POD seller warrants that it owns or licenses its designs and indemnifies the provider. Printify's terms make the merchant warrant ownership of content (including AI-generated content) and indemnify Printify and its providers, and reserve the right to remove content; Printful's terms reserve the right to "pre-screen..., refuse, or remove any Content."

Whether the POD platform itself is liable for an infringing design depends on how much it does, and the courts have split on the facts. In *Ohio State University v. Redbubble* (6th Cir. 2021) the court held that the district court "applied the Lanham Act too narrowly" in finding Redbubble not liable for trademark infringement on products made and shipped through its platform, and sent the case back. In *Atari v. Redbubble* a jury found for Redbubble in 2021, affirmed by the Ninth Circuit in 2023. In *Atari v. Sunfrog* (N.D. Cal. 2019) a platform that "makes, ships, and processes the payment" couldn't use Section 230 as a defense; in *Atari v. Printify* (S.D.N.Y. 2024) a preliminary injunction was denied, the court describing Printify as "a passive facilitator" that doesn't "ship or affix its logo to any products." The seller's position is clearer than the platform's: it chose and listed the design, and the provider's terms send the claim back to it.

For the system, liability becomes records: the supplier's or provider's terms version on each order, the ship-time promise the supplier made and the one shown to the customer, the design file version and the rights evidence behind it, and every takedown notice received and acted on (the later Brand Protection chapter covers the other direction, a brand taking down infringers).

## How to Build It

A drop-ship supplier is a `suppliers` row (`kind = 'drop_ship'` or `'print_on_demand'`) with a `locations` row (`operator = 'supplier'`) where its stock is counted; a drop-shipped fulfillment has `provider = 'supplier'`. This chapter adds the routes that say which supplier fulfills which item, the supplier's stock feed, its terms per fulfillment, and print files:

```sql
CREATE TABLE supplier_routes (           -- which supplier fulfills which item, at what cost
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),
  supplier_id      UUID NOT NULL REFERENCES suppliers (id),
  location_id      UUID NOT NULL REFERENCES locations (id),  -- the supplier's warehouse or print facility
  supplier_sku     TEXT NOT NULL,        -- the supplier's or provider's blank SKU
  unit_cost        BIGINT NOT NULL,      -- base cost, minor units
  shipping_cost    JSONB,                -- by service and region
  currency         CHAR(3) NOT NULL,
  production_days  SMALLINT NOT NULL DEFAULT 0,  -- printing or handling before shipment
  ship_days        SMALLINT NOT NULL,    -- the supplier's promised handling time
  priority         SMALLINT NOT NULL DEFAULT 1,  -- fallback order when several can fulfill
  regions          TEXT[],               -- ship-to countries or regions served
  stock_buffer     INT NOT NULL DEFAULT 0,  -- units held back from the published feed
  max_feed_age     INTERVAL NOT NULL DEFAULT '6 hours',  -- stop selling on a staler feed
  terms_ref        TEXT NOT NULL,        -- the supplier agreement or provider terms version
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (item_id, supplier_id, valid_during)
);

CREATE TABLE supplier_stock_feeds (      -- each stock snapshot as received
  supplier_id      UUID NOT NULL REFERENCES suppliers (id),
  supplier_sku     TEXT NOT NULL,
  quantity         INT NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (supplier_id, supplier_sku, received_at)
);

ALTER TABLE fulfillments
  ADD COLUMN supplier_route_id UUID REFERENCES supplier_routes (id),
  ADD COLUMN supplier_ref      TEXT,     -- the supplier's order number
  ADD COLUMN accepted_at       TIMESTAMPTZ,
  ADD COLUMN ship_by           TIMESTAMPTZ,  -- from the route's days, checked against the promise
  ADD COLUMN packing_slip      TEXT CHECK (packing_slip IN ('seller', 'retailer', 'none')),
  ADD COLUMN carrier_account   TEXT,     -- a retailer's account for DSV orders
  ADD COLUMN supplier_cost     BIGINT,   -- what the supplier will invoice
  ADD COLUMN supplier_invoice  UUID REFERENCES documents (id);

CREATE TABLE print_files (               -- a design at one placement, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  design_code      TEXT NOT NULL,
  version          INT NOT NULL,
  placement        TEXT NOT NULL,        -- 'front', 'back', 'sleeve_left'
  file_ref         TEXT NOT NULL,        -- object storage key of the artwork
  content_sha256   TEXT NOT NULL,
  width_px         INT NOT NULL,
  height_px        INT NOT NULL,
  dpi              SMALLINT,
  rights_ref       TEXT NOT NULL,        -- the license or ownership evidence
  ai_generated     BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL CHECK (status IN ('active', 'retired', 'taken_down')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, design_code, placement, version)
);

CREATE TABLE item_print_files (          -- which files print on which sellable variant
  item_id          UUID NOT NULL REFERENCES items (id),
  print_file_id    UUID NOT NULL REFERENCES print_files (id),
  PRIMARY KEY (item_id, print_file_id)
);

ALTER TABLE order_lines
  ADD COLUMN print_file_ids UUID[];      -- snapshot: the versions this line was printed from
```

Publishing supplier stock to channels reads the newest feed per SKU and refuses stale ones:

```sql
SELECT r.item_id,
       CASE WHEN f.received_at > NOW() - r.max_feed_age
            THEN GREATEST(f.quantity - r.stock_buffer, 0)
            ELSE 0 END AS sellable
FROM supplier_routes r
JOIN LATERAL (
  SELECT quantity, received_at FROM supplier_stock_feeds f
  WHERE f.supplier_id = r.supplier_id AND f.supplier_sku = r.supplier_sku
  ORDER BY received_at DESC LIMIT 1
) f ON TRUE
WHERE r.valid_during @> NOW();
```

Design notes:

- **The route carries the promise.** `production_days` and `ship_days` feed the delivery promise at checkout and `fulfillments.ship_by` after the order; a supplier late against `ship_by` triggers the seller's delay notice, because the Mail Order Rule obligation is the seller's.
- **Stale feeds sell nothing.** Publishing zero for a supplier whose feed is older than `max_feed_age` trades a few lost sales for no oversells.
- **Cost is known before shipping.** `supplier_cost` on the fulfillment is the expected invoice; the supplier's actual invoice is matched against it, line by line, as in [Purchase Orders](/books/commerce/purchasing-and-replenishment#purchase-orders).
- **Print files are immutable versions** with a content hash and rights evidence; order lines snapshot the versions printed, so a reprint or a takedown is traceable to the exact artwork.
- **Events:** `dropship.routed`, `dropship.accepted`, `dropship.rejected`, `dropship.shipped`, `dropship.late`, `print_file.taken_down` and `supplier_feed.stale` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to customer notifications, channels and the operations queue.

## Auditing

- **Every routed order,** with the supplier, route, terms version, the ship-by promised and the shipment's actual times.
- **Every stock feed received,** so an oversell can be traced to the feed it sold from.
- **Every delay notice** sent to a customer when a supplier was late, against the Mail Order Rule's options.
- **Every supplier invoice** matched to the fulfillments it bills.
- **Every print file version,** its rights evidence, and every takedown notice and action.

## What This Means for the System You Build

- **Model suppliers as locations and fulfillments as provider `supplier`,** so drop-shipped lines split, source and track like any other.
- **Route each item to a supplier by a versioned route** with cost, production and handling days, regions and priority.
- **Publish supplier stock less a buffer, and nothing from a stale feed.**
- **Carry the seller's obligations:** delivery promises that include supplier time, delay notices when suppliers are late, and a return policy written around the supplier's.
- **Apply per-partner fulfillment rules** for retailer DSV orders: the retailer's packing slip and carrier account, its deadlines, and EDI confirmations.
- **Keep print files as hashed versions with rights evidence,** and snapshot them on order lines.
- **Match supplier invoices to fulfillments** and measure suppliers on acceptance, on-time shipping and defects.

## References

**Platforms and programs**

- [Shopify: Dropshipping guide](https://www.shopify.com/blog/dropshipping-guide), the three routes to drop-ship suppliers
- [Shopify Help Center: Shopify Collective](https://help.shopify.com/en/manual/products/shopify-collective), suppliers shipping to retailers' customers, typical retailer margins and pricing
- [8th & Walton: Walmart DSV](https://www.8thandwalton.com/blog/walmart-dsv), Walmart as seller of record, packing slips, carrier accounts and invitation-only enrollment (secondary)
- [SPS Commerce: Walmart DSV program vendor overview](https://community.spscommerce.com/wp-content/uploads/2018/03/Walmart-DSV-Program-Vendor-Overview.pdf), the drop-ship vendor documents and flow (secondary)
- [Rithum: CommerceHub to acquire ChannelAdvisor](https://www.rithum.com/press/commercehub-to-acquire-channeladvisor-for-23-10-per-share-2/), the combination behind Rithum's drop-ship network
- [Sellercloud: Ingram Micro integration](https://o.sellercloud.com/integrations-d/ingram), distributor drop-ship for approved resellers
- [Amazon Seller Forums: Drop shipping policy](https://sellercentral-europe.amazon.com/seller-forums/discussions/t/f16c7a0f-5bfe-43ac-807e-59a5e5fbbc9c), seller of record, removing other sellers' packing slips, returns

**Print on demand**

- [Printful: Pricing](https://www.printful.com/pricing), no upfront cost, the base price, the Growth plan and same-region fulfillment
- [Printful: Terms of service](https://www.printful.com/policies/download/terms-of-service), white-label fulfillment, claims against the seller, indemnity and content removal
- [Printful: Return and refund policy](https://help.printful.com/hc/en-us/articles/360014006840-What-is-Printful-s-return-and-refund-policy), no buyer's-remorse returns, misprint reprints and refunds within 30 days
- [Printify: Pricing](https://printify.com/pricing/), the Free, Premium and Enterprise plans
- [Printify: Terms of service](https://printify.com/terms-of-service), Printify's role, content warranties and indemnity, removal, misprint claims and non-refundable products

**Law and cases**

- [16 CFR 435.2](https://www.law.cornell.edu/cfr/text/16/435.2), the Mail Order Rule's reasonable basis to ship, the 30-day default and the delay option
- [Fross Zelnick: Sixth Circuit in Ohio State v. Redbubble](https://www.frosszelnick.com/u-s-court-of-appeals-for-the-sixth-circuit-redbubble-could-be-liable-for-direct-infringement-arising-from-print-on-demand-service/), the 2021 reversal on direct infringement
- [Morrison Foerster: Rehearing denied in Atari v. Redbubble](https://mofo.com/resources/news/231025-morrison-foerster-defeats-rehearing-of-trademark-win-for-redbubble), the 2021 verdict, 2023 affirmance and rehearing denial
- [Eric Goldman: Atari v. Sunfrog](https://blog.ericgoldman.org/?p=20360), no Section 230 defense for a platform that makes, ships and processes payment
- [Eric Goldman: Atari v. Printify](https://blog.ericgoldman.org/archives/2024/01/ataris-lawsuit-against-a-print-on-demand-service-fizzles-out-atari-v-printify.htm), the denied injunction and Printify as a passive facilitator
