+++
title = "Products, Variants & Bundles"
description = "Products versus SKUs, options and variant limits by platform, bundles and kits, digital goods, GTINs and GS1 rules, pack sizes and the product lifecycle."
category = "Commerce Industry"
order = 2305
part = "Catalog and Pricing"
tags = ["commerce", "catalog", "variants", "bundles", "gtin", "gs1"]
+++

A catalog has two jobs that pull against each other. Shoppers want to pick a product and then choose: one screen protector, then the phone it fits and the finish. Warehouses, marketplaces, tax engines and accountants want a single thing with a single code that they can count, ship, tax and cost. Every commerce platform resolves the tension the same way, with a **product** that carries the shopping experience and **variants** (the volume's items) that carry the SKU, the barcode, the weight, the stock and the cost, and every platform then draws the line between them a little differently. The differences decide how many sizes a T-shirt can come in, whether a gift box is one SKU or five, and whether a marketplace will accept the barcode at all.

This chapter covers products versus SKUs, options and the variant explosion they cause, bundles and kits, digital goods and licenses, product identifiers (GTINs, UPCs and the GS1 rules behind them), units and pack sizes, and the product's lifecycle from draft to discontinued. The descriptive content around a product (attributes, categories, images, translations and required disclosures) is the next chapter's, [Product Information & Content](/books/commerce/product-information); prices are [Pricing & Price Lists](/books/commerce/pricing). The chapter extends `products`, `items` and `bundle_components` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `product_options`, `product_option_values`, `item_identifiers`, `pack_sizes` and `digital_deliveries`.

## How the Platforms Do It

As of October 2026, from each platform's developer documentation and published limits:

| Platform | The shopping object | The sellable object | Option model | Published limits | Bundles |
| --- | --- | --- | --- | --- | --- |
| **Shopify** | Product | ProductVariant, each with one InventoryItem | Up to 3 options per product | 2,048 variants per product | Through a bundles app: fixed bundles up to 30 components, dynamic up to 150 |
| **Commerce.com (BigCommerce)** | Product | Variant, "a version of a product that has its own SKU" | Variant options (make a SKU) and modifier options (don't) | 600 SKUs per product, 250 values per option | Through apps or modifiers of type product list |
| **Adobe Commerce (Magento)** | Configurable product | A simple (or virtual) child product with its own SKU | Global-scope attributes the shopper must choose | Not published as a hard cap | Native bundle type with fixed or dynamic price, SKU and weight |
| **Salesforce B2C Commerce** | Master product, not orderable | Variation product | Variation attributes, with variation groups for merchandising | Not published in the B2C Commerce docs | Product bundles (one price) and product sets (sold separately) |
| **commercetools** | Product, typed by a Product Type | ProductVariant (Classic) or a standalone Variant (Modular) | Attributes defined on the Product Type | 100 variants per product in Classic, 10,000 in Modular | Modeled by the merchant |
| **Medusa** | Product with ProductOptions | ProductVariant | Options with values; each variant sets one value per option | Not published | Inventory kits: a variant linked to several inventory items with required quantities |
| **Saleor** | Product, typed by a ProductType | ProductVariant; "checkout and orders can only contain variants" | Variant selection attributes on the type | Not published | Modeled by the merchant |
| **WooCommerce** | Variable product | Variation | Global or per-product attributes | "Generate variations" creates 50 per run | Grouped products; bundles by extension |
| **Spree** | Product, "the listing a customer browses" | Variant, "the thing they actually buy" | Option types such as Size, Color, Material | Not published | By extension |

Three patterns run through the table:

- **Everyone separates the browsed object from the bought one.** Salesforce says outright that "master products are not orderable themselves"; Saleor that checkout and orders "can only contain variants"; Amazon's listings API that "a parent listing must not be a buyable product." The volume's product and item are the same split.
- **Limits are where platforms differ, and they move.** Shopify's variant limit stood at 100 for most of its history and is now 2,048 for all merchants; commercetools caps a Classic product at 100 variants and a Modular one at 10,000; Commerce.com at 600. A catalog designed on one platform's limits can fail to import into another's.
- **Not every choice is a variant.** Commerce.com's modifier options "do not change which product variant is fulfilled" and can't track inventory; Salesforce's option products add things like a warranty; restaurants' modifier groups are the same idea ([Menus, Modifiers and Items](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items)). A choice that changes what is picked from a shelf is a variant; one that changes only the price or a personalization is a modifier.

## Products and SKUs

A **SKU** (stock-keeping unit) is the merchant's own code for one thing it counts. It is internal, it's whatever the merchant decides (Commerce.com allows 255 characters), and it's unique within the merchant's catalog. A **GTIN** is a global identifier for the same thing, licensed from GS1 and printed as the barcode ([Identifiers](#identifiers-gtin-upc-and-gs1)). A **product** is the shopper's view: a title, a handle in the URL, images and a set of options. The data model hangs everything that is counted, shipped, taxed or costed off the item, which is the volume's name for a variant, and everything that is browsed, described and merchandised off the product ([Product versus item](/books/commerce/commerce-business#the-core-data-model)).

The test for where something belongs is the warehouse. If a picker must choose a different physical unit, it's a different item with its own SKU; if not, it's the same item with a different description, price or personalization. A black and a clear case are two items. A case engraved with initials is one item with a personalization captured on the order line. A screen protector sold in a one-pack and a three-pack is two items, because the three-pack is a different box on a different shelf with a different barcode.

Two shapes don't fit the product-and-variants pattern and are worth naming:

- **An item without a product.** A restaurant dish, a modifier option, a service, a shipping-protection fee sold as a line: the core model leaves `items.product_id` null for these.
- **A product sold by someone else's identity.** On Amazon many sellers can offer the same ASIN; the catalog record belongs to the marketplace, and each seller's listing is an offer against it. The seller's item still has its own SKU and maps to the ASIN through a listing ([Item versus listing](/books/commerce/commerce-business#the-core-data-model)).

## Options and the Variant Explosion

Options multiply. A T-shirt in 6 sizes and 8 colors is 48 variants; add 3 fits and it's 144; add 2 sleeve lengths and it's 288. A phone case brand selling 40 phone models in 6 finishes is 240 variants of one case before any bundle. The platforms' limits are therefore real design constraints:

- **Shopify** allows "up to three options" per product and "up to 2,048 variants." Above that, merchants split one product into several and join them back for shoppers with **combined listings** (Plus and enterprise plans only): up to 60 products and 2,048 variants across them, with up to 3 options added on top of each child's own. Shopify's changelog warns that apps not using its GraphQL product APIs "may see a downgraded or broken experience" above 100 variants, which is how a limit change becomes an app compatibility problem.
- **Commerce.com** allows 600 SKUs per product and 250 values per option.
- **commercetools** caps a Classic product at 100 variants and a Modular one at 10,000, and embedded prices at 100 per variant (tiers included).
- **WooCommerce** generates variations from all attribute combinations 50 at a time (the `WC_MAX_LINKED_VARIATIONS` constant), switches the storefront's dropdowns to static lists above 30 variations, and pages them in the admin after 15.
- **Amazon** models the same thing as a variation family: a non-buyable parent, children that share its `variation_theme` (size, color, size and color), and relationships that disappear for every child when the parent is deleted.

Three design rules follow from the arithmetic:

- **Don't create variants nobody stocks.** Generating every combination creates hundreds of items with no inventory, no barcode and no image. Create only the combinations that exist, and let the storefront mark the rest unavailable rather than missing.
- **Keep option values as a vocabulary.** "Black", "black" and "Blk" are three filter values and three feed values ([Facets](/books/commerce/site-search-and-merchandising#facets-and-filters)). Option values belong in a table per product (or a shared list per attribute), and each item references the values, not free text.
- **Split by what differs, merchandise by what's shared.** Salesforce's **variation groups** gather variants that share a value (all the black ones) so they can be merchandised and shown in search as one tile; its "slicing" decides how variants appear on category pages. A store that wants a separate tile per color, with one product page per phone model, needs the split decided in data, not in the theme.

## Bundles and Kits

A bundle is several items sold as one line. It is the most confused object in commerce because it has three different faces, and each system sees a different one:

| Face | The shopper sees | The warehouse sees | The ledger sees |
| --- | --- | --- | --- |
| **Fixed bundle (kit)** | One product, one price: "case plus screen protector" | The components, picked and packed, or one prebuilt SKU | Revenue split across the components for tax, returns and margin |
| **Configurable bundle (mix and match)** | A builder: "choose any three" | The chosen components | The same split, per order |
| **Prebuilt kit** | One product | One SKU, assembled ahead and stocked as its own unit, with its own GTIN | One item, with its components consumed when it was assembled |

The platforms map onto these faces:

- **Shopify** treats a bundle as "a set of two or more related products, commonly offered at a discount," built with a bundles app. Fixed bundles take up to 30 components, dynamic ones up to 150, and up to 2,000 units per component. The `productBundleCreate` mutation creates a bundle whose price comes from the parent product and whose "inventory [is] calculated from the component products." Bundles "can't be sold with selling plans, such as subscriptions, pre-orders, and try-before-you-buy," and Google's channel accepts "fixed product bundles only."
- **Adobe Commerce** has a native bundle type, "a build your own, customizable product," with price, SKU and weight each set to dynamic (summed from components) or fixed, and a choice to ship items "Together" or "Separately."
- **Salesforce** separates a **bundle**, which "can be ordered as a single unit and therefore can define its own price," from a **product set**, "a group of related products that aren't necessarily sold together": the outfit shown on one page with each piece added to the cart on its own.
- **Medusa** models kits in inventory: an **inventory kit** links one variant to several inventory items with a required quantity each, so a bicycle variant consumes two wheels.

My rules for bundles:

- **The bundle is an item; its components are items.** The core model's `bundle_components` does this, so a kit sells as one line and ships as its parts.
- **Availability is the minimum over components,** each divided by its quantity, at the location that would ship it. Stock is never stored on the bundle unless it's a prebuilt kit with its own count ([Available is a computation](/books/commerce/commerce-business#the-core-data-model)).
- **Allocate the price to components when the order is placed,** in proportion to each component's standalone price, and store the allocation on child order lines. Tax can differ by component (a gift basket with food and a mug), a return of one component needs a refund amount, and margin per SKU needs revenue per SKU. The same proportional split is the accounting standard's default for allocating a transaction price to performance obligations ([ASC 606 and IFRS 15 in Five Steps](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps)).
- **A bundle needs its own GTIN** when it's a pre-defined assortment sold as a trade item; GS1's allocation rules require a new GTIN when any component is changed, added or replaced ([When a new GTIN is required](#when-a-new-gtin-is-required)).

## Digital Goods and Licenses

A digital good has no stock, no weight and no shipment; what it has is an **entitlement**: a right to download a file, use a license key or access content, with limits and an expiry. The platforms expose the same few controls:

- **Shopify's Digital Downloads** app attaches "up to 50 files" per variant "with a combined size of up to 5 GB," sets access limits per variant (unlimited by default), and notes that "share links don't expire."
- **Adobe Commerce's** downloadable product sets "Max. Downloads" per link or unlimited, whether a link is shareable, and makes downloads available when the order reaches a pending or invoiced status.
- **WooCommerce** offers three delivery methods (forced download, X-Accel-Redirect or X-Sendfile, and "Redirect only," which it labels insecure because "anyone with the URL can access the file") and can grant access "after payment" when the order reaches processing.
- **License key services** such as Lemon Squeezy generate a key per purchase with an activation limit and a license length; for a subscription, "license keys are linked directly to the subscription lifecycle."

The design that holds across them: **the digital item is an item with `kind = 'digital'`; each purchase creates a delivery record** with its file or key, its download or activation count, its expiry and its revocation. Grant on payment captured, not on order placed, for anything a buyer could take and then dispute; revoke on refund or chargeback. Serve files through short-lived signed URLs from object storage rather than a permanent link ([The Upload Credential](/docs/architecture/file-uploads#the-upload-credential) covers the same signing in the other direction). Digital goods also change the tax: many US states and every EU country tax them by the buyer's location ([VAT and GST on Digital Goods](/docs/payments/sales-tax#vat-and-gst-on-digital-goods)). Gift cards look like digital goods and aren't: a gift card is a stored-value liability, not revenue, and is the subject of [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#gift-cards-and-store-credit). Shopify's model shows the overlap: "each gift card denomination is saved as a unique variant of the gift card product."

## Identifiers: GTIN, UPC and GS1

A **GTIN** (Global Trade Item Number) identifies a trade item, which GS1 US defines as "any product or service that may be priced, ordered, or invoiced at any point in the supply chain." GTINs "are assigned by the brand owner of the product," come in four lengths, and are printed in different barcodes:

| GTIN | Digits | Where it appears |
| --- | --- | --- |
| **GTIN-12** | 12 | The U.P.C.; "the only GTIN that can be used in UPC-A barcodes," the North American retail standard |
| **GTIN-13** | 13 | The EAN-13 barcode, standard outside North America; ISBN-13 for books is a GTIN-13 |
| **GTIN-8** | 8 | Small packages too small for a full barcode |
| **GTIN-14** | 14 | Cases and other packaging levels; "cannot be used in EAN/UPC barcodes," so it's printed in ITF-14 or GS1-128 |

GS1 US's guidance is that systems "process and store GTIN-8, GTIN-12, GTIN-13, and GTIN-14 ... in a 14-digit format," left-padded with zeros, so one column holds every length and comparisons work. The leading **indicator digit** of a GTIN-14 (1 to 8) marks a packaging level; 9 is reserved for variable-measure products such as meat sold by weight.

A GTIN begins with a **GS1 Company Prefix**, "a globally unique number licensed to a company by a GS1 Member Organization" that "identifies you as the owner of the brand." As of October 2026 GS1 US licenses a single GTIN for $30 with no renewal fee, or a prefix with capacity for 10 GTINs at $250 plus $50 a year, 100 at $750 plus $150, 1,000 at $2,500 plus $500, 10,000 at $6,500 plus $1,300 and 100,000 at $10,500 plus $2,100. A single GTIN can't be used for variable-measure products, mixed cases or coupons.

### The marketplaces check

Barcodes bought from resellers, rather than licensed from GS1, are the classic failure. GS1 US's guidance is that its barcodes "identify your company as the brand owner of that product"; a reseller's barcode identifies whoever originally licensed the prefix. The marketplaces enforce it:

- **Amazon** "verif[ies] the authenticity of product UPCs by checking the GS1 database," and "UPCs that do not match the information provided by GS1 will be considered invalid" (Amazon's Seller Central text, as quoted by GS1 US; the page itself is behind a login). Amazon's exemption process for products without GTINs exists, but its criteria aren't on a public page. <!-- source-gap: amazon-gtin-exemption | missing | Amazon's GTIN exemption criteria and process | closes with: a public Amazon page describing GTIN exemption eligibility; Seller Central help pages return only a sign-in shell to fetchers | checked: 2026-10-29 -->
- **Walmart's** product identifier policy tells sellers to "license Product IDs directly from GS1 to avoid mismatches and complications in your listings."
- **Google Merchant Center** recommends `gtin` "for all products with a GTIN assigned by the manufacturer," requires it for digital downloads, accepts 8, 12, 13 or 14 digits, rejects restricted prefixes (02, 04 and 2, used for in-store and variable-measure codes) and coupon prefixes (05, 98, 99), and advises, "If you're unsure of a GTIN, don't submit one." Without a GTIN it requires `mpn`, the manufacturer part number, and warns, "Unless you're the manufacturer, don't use a value that you've created."

GS1 US offers a lookup (up to 30 free searches a day) and Verified by GS1 to check that a GTIN belongs to the brand that claims it. My rule: validate the check digit on input, store every GTIN in 14-digit form, verify a brand's prefix once against GS1's registry, and never generate a GTIN. A merchant that resells others' goods uses the manufacturer's GTIN; one that makes its own licenses a prefix.

### When a new GTIN is required

GS1's GTIN Management Standard decides when a change makes a new trade item. The principle: "if the customer is expected to distinguish a new trade item from an old trade item and purchase accordingly, a new GTIN should be assigned." Its ten rules, as GS1 New Zealand summarizes them, require a new GTIN for:

1. A new product.
2. A change to the declared formulation or functionality.
3. "Any change (increase or decrease) to the legally-required declared net content."
4. A change of over 20% to a physical dimension on any axis, or to gross weight.
5. Adding or removing a certification mark on the pack.
6. A change of primary brand.
7. A time-critical or promotional variant (a holiday pack, "20% extra free").
8. A change in the quantity inside a pack or case.
9. Any "change, addition or replacement" of a component in a pre-defined assortment, which GS1 notes "may also be referred to as a bundle."
10. A price printed on the pack.

The rules map onto items, not products: each rule describes when a change makes a new item with its own SKU, stock and history. A reformulated product with a new GTIN is a new item under the same product, the old one sold down and retired. Editing the old item's GTIN in place breaks every marketplace listing, every retailer's item file and every historical order line that pointed at it.

### 2D barcodes and Digital Link

GS1's Sunrise 2027 is "a global transition from 1D UPC barcodes to 2D barcodes, like QR codes," with retailers' scanners made "Sunrise-capable to read 2D barcodes and extract the GTIN at POS." GS1 Digital Link encodes the GTIN in a web URL, so one code serves the register and a shopper's phone. For the catalog the change is small (the GTIN is still the key) and the content is larger: the URL a 2D code resolves to is product content the brand now has to serve ([Product Information & Content](/books/commerce/product-information)).

## Units and Pack Sizes

The same product moves through the supply chain in different units. GS1 US's packaging levels are the vocabulary:

- **Each:** "the lowest level of the item hierarchy intended or labeled for individual resale."
- **Inner pack:** an "intermediate package of multiples of the same trade item."
- **Case:** "a standard shipping unit that contains 'eaches'."
- **Pallet:** "a shipping unit that contains either cases, inner packs, or eaches."
- **Display shipper:** a self-contained display that ships to a store and goes on the floor.

Each level gets its own GTIN ("Yes ... consumer unit, inner pack, multi-pack, case, or pallet"), usually a GTIN-14 for cases. The levels matter because different channels buy in different units: a consumer buys an each on the brand's site; a retailer's purchase order is for cases of 24 ([Selling order versus purchase order](/books/commerce/commerce-business#the-core-data-model)); a distributor buys pallets; an Amazon shipment arrives in case packs the seller declared. A purchase order line for "10" is 10 eaches or 240, and the item file has to say which.

The model: **the each is the item; each larger level is a pack size** of that item, with its quantity of eaches, its own GTIN and its own dimensions and weight. Inventory is counted in eaches, so one stock level serves every channel; a pack size converts on the way in (a received case adds 24) and on the way out (a wholesale order for 50 cases commits 1,200). A multipack sold to consumers as its own product ("3-pack") is a different case: it has its own price and listing, so it's its own item, and if it's assembled from eaches it's a kit. Items sold by weight (`sold_by = 'weight'` in the core model) carry the unit they're priced in, which [Unit Pricing](/books/commerce/pricing#unit-pricing-and-price-display-law) needs to display a price per ounce. The label's net quantity, which the Fair Packaging and Labeling Act requires "in terms of weight or mass, measure, or numerical count," is data on the item, not text in its description.

## The Product Lifecycle

Products and items have lifecycles that the platforms name similarly:

- **Shopify:** `DRAFT` ("isn't ready to sell"), `ACTIVE` ("ready to sell and can be published to sales channels"), `ARCHIVED` ("no longer being sold and isn't available to customers"), and since the 2025-10 API version `UNLISTED` ("active but you need a direct link to view it"). Archiving hides a product "from your storefront and from the main product list" while keeping its details.
- **Adobe Commerce:** an Enable Product switch and a visibility setting (catalog, search, both or neither).
- **commercetools:** staged and current projections, so edits are prepared and published together; "you can only delete unpublished Products."

The states a merchant actually needs are richer than draft, active and archived, because a product's end is gradual:

| State | Sellable | Visible | Typical reason |
| --- | --- | --- | --- |
| **Draft** | No | No | Being set up, waiting for content or approval |
| **Pre-order or coming soon** | Optionally | Yes | Launch date set, stock not yet received |
| **Active** | Yes | Yes | Selling |
| **Unlisted** | Yes | Only by direct link | Replacement parts, private B2B items, landing-page-only offers |
| **Sell-down (discontinued)** | Yes, until stock is gone | Yes | Replaced by a new GTIN or season; no reorders |
| **Archived** | No | No | Gone; kept for orders, returns, reviews and reporting |

Two rules keep the end of the lifecycle safe. **Never delete an item that has been sold.** Order lines, returns, subscriptions, marketplace listings, retailer item files and accounting all point at it; archive it, and keep its identifiers reserved so a GTIN or SKU is never reused for something else. **A discontinued item can still be on a subscription,** a saved cart or a retailer's planogram; discontinuing triggers work (a swap offer to subscribers, a notice to wholesale partners, ending listings), so status changes are events, not just a column update ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## How to Build It

Options as data, identifiers as rows, pack sizes and digital deliveries, extending `products`, `items` and `bundle_components` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model):

```sql
ALTER TABLE products
  DROP CONSTRAINT products_status_check,
  ADD CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'unlisted',
    'archived')),
  ADD COLUMN published_at TIMESTAMPTZ;        -- when it first went active

ALTER TABLE items
  ADD COLUMN lifecycle      TEXT NOT NULL DEFAULT 'active' CHECK (lifecycle IN ('draft',
                              'preorder', 'active', 'sell_down', 'archived')),
  ADD COLUMN available_from TIMESTAMPTZ,      -- launch or pre-order release date
  ADD COLUMN replaced_by_id UUID REFERENCES items (id),  -- the new GTIN after a change
  ADD COLUMN weight_grams   INT,
  ADD COLUMN dimensions_mm  INT[3],          -- length, width, height of the each
  ADD COLUMN net_quantity   NUMERIC(12, 3),  -- as declared on the label
  ADD COLUMN net_unit       TEXT;            -- 'g', 'ml', 'count', 'oz', 'fl_oz'

CREATE TABLE product_options (               -- "Fit", "Finish"; at most a few per product
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id  UUID NOT NULL REFERENCES products (id),
  name        TEXT NOT NULL,
  position    SMALLINT NOT NULL,
  UNIQUE (product_id, name),
  UNIQUE (product_id, position)
);

CREATE TABLE product_option_values (         -- the vocabulary: "iPhone 17", "Matte"
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  option_id   UUID NOT NULL REFERENCES product_options (id),
  value       TEXT NOT NULL,
  position    SMALLINT NOT NULL,
  swatch      TEXT,                          -- a color or image key for the picker
  UNIQUE (option_id, value)
);

CREATE TABLE item_option_values (            -- which value of each option an item is
  item_id         UUID NOT NULL REFERENCES items (id),
  option_id       UUID NOT NULL REFERENCES product_options (id),
  option_value_id UUID NOT NULL REFERENCES product_option_values (id),
  PRIMARY KEY (item_id, option_id)
);

CREATE TABLE item_identifiers (              -- GTINs, MPNs, ISBNs and channel IDs, with history
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id     UUID NOT NULL REFERENCES items (id),
  kind        TEXT NOT NULL CHECK (kind IN ('gtin', 'mpn', 'isbn', 'asin', 'other')),
  value       TEXT NOT NULL,                 -- a GTIN stored as 14 digits, zero-padded
  source      TEXT NOT NULL CHECK (source IN ('gs1_licensed', 'manufacturer', 'channel',
                'merchant')),
  verified_at TIMESTAMPTZ,                   -- checked against the GS1 registry
  valid_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to    TIMESTAMPTZ,                   -- retired, never reused
  CHECK (kind <> 'gtin' OR value ~ '^[0-9]{14}$')
);
CREATE UNIQUE INDEX item_identifiers_gtin_once ON item_identifiers (value)
  WHERE kind = 'gtin';                       -- a GTIN belongs to one item, forever

CREATE TABLE pack_sizes (                    -- inner packs, cases, pallets of an each
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id       UUID NOT NULL REFERENCES items (id),
  level         TEXT NOT NULL CHECK (level IN ('inner_pack', 'case', 'pallet',
                  'display_shipper')),
  each_quantity INT NOT NULL CHECK (each_quantity > 1),
  gtin          TEXT CHECK (gtin ~ '^[0-9]{14}$'),  -- usually a GTIN-14
  weight_grams  INT,
  dimensions_mm INT[3],
  UNIQUE (item_id, level, each_quantity)
);

ALTER TABLE bundle_components
  ADD COLUMN price_weight NUMERIC(9, 6);     -- share of the bundle price; null: standalone prices

CREATE TABLE digital_deliveries (            -- an entitlement created by a purchase
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  order_line_id   UUID NOT NULL REFERENCES order_lines (id),
  kind            TEXT NOT NULL CHECK (kind IN ('file', 'license_key', 'access')),
  asset_ref       TEXT,                      -- object storage key; served by signed URL
  license_key_ref TEXT,                      -- a reference into a secrets store, not the key
  max_uses        INT,                       -- downloads or activations; null: unlimited
  uses            INT NOT NULL DEFAULT 0,
  granted_at      TIMESTAMPTZ,               -- on capture, not on order placed
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,               -- on refund or chargeback
  revoke_reason   TEXT,
  CHECK (max_uses IS NULL OR uses <= max_uses)
);

-- Bundle availability at a location: the scarcest component decides.
SELECT bc.bundle_item_id,
       MIN((il.on_hand - il.committed) / bc.quantity) AS sellable_bundles
FROM bundle_components bc
JOIN inventory_levels il ON il.item_id = bc.component_item_id
WHERE il.location_id = $1
GROUP BY bc.bundle_item_id;
```

Design notes:

- **Option values are rows, not JSON.** `items.option_values` from the core model stays as a denormalized copy for reads; the rows are the source, so a renamed value ("Space Gray" to "Graphite") changes once and every filter, feed and variant picker follows.
- **Identifiers have history.** A GTIN can move from one item to its replacement only as a new row with dates; the partial unique index enforces that a GTIN is never assigned to two items. Channel IDs such as ASINs live here too when a seller needs history, alongside `listings` for the channel's current state.
- **Inventory is in eaches.** Pack sizes convert at receipt and at order, never in the stock count.
- **License keys are secrets.** Store a reference into a secrets store, encrypted at rest, and show the key to the buyer only on their own order page ([Encryption at Rest](/docs/security/encryption-at-rest)).
- **Every lifecycle change is an event,** so subscriptions, listings, feeds and wholesale partners hear about a sell-down or an archive.

## Auditing

- **What an item was when sold.** Order lines snapshot name, SKU and price; keep the GTIN and option values on the line too, because a marketplace's or retailer's complaint is about the barcode they scanned.
- **Every identifier assignment and retirement,** with who made it and the GS1 verification, so a listing rejected for a GTIN mismatch can be traced to the change that caused it.
- **Every lifecycle change,** with its time and actor, so "why did this sell after it was discontinued" has an answer ([Audit Trails](/docs/architecture/audit-trails)).
- **Every digital grant, download, activation and revocation,** which is the evidence in a "never received it" dispute for a good with no tracking number ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

## What This Means for the System You Build

- **Hang everything counted, shipped, taxed and costed off the item;** the product is for browsing.
- **Treat options and their values as a controlled vocabulary,** and create only the variants that exist.
- **Design to the strictest platform's variant limit** you might ever export to, and plan combined listings or splits above it.
- **Model a bundle as an item with component items,** compute its availability from components, and allocate its price to components on the order.
- **Model a digital good as an entitlement** granted on capture, limited, expiring and revocable.
- **Store GTINs as 14 digits, validate check digits, verify the prefix with GS1,** and never buy or generate barcodes.
- **Follow the GTIN Management Standard:** a change a shopper would notice is a new item, not an edited one.
- **Count inventory in eaches** and convert pack sizes at the edges.
- **Never delete a sold item;** archive it and keep its identifiers reserved.

## References

**Platform documentation**

- [Shopify Help Center: Adding variants](https://help.shopify.com/en/manual/products/variants/add-variants), three options and 2,048 variants per product
- [Shopify changelog: The product variant limit is now 2,048 for all merchants](https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants), the new limit and degraded experience in apps above 100 variants
- [Shopify: ProductStatus](https://shopify.dev/docs/api/admin-graphql/latest/enums/ProductStatus), draft, active, archived and unlisted
- [Shopify: ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant), a version of a product with its inventory item
- [Shopify Help Center: Product status](https://help.shopify.com/en/manual/products/details/product-details-page/product-status), archiving hides a product but keeps its details
- [Shopify Help Center: Combined listings](https://help.shopify.com/en/manual/products/combined-listings-app), Plus and enterprise only, 60 products, 2,048 variants and 3 added options
- [Shopify Help Center: Bundles](https://help.shopify.com/en/manual/products/bundles), the definition and the fixed-bundle rule for Google
- [Shopify Help Center: Shopify Bundles](https://help.shopify.com/en/manual/products/bundles/shopify-bundles), component and unit limits for fixed and dynamic bundles
- [Shopify: Bundles for developers](https://shopify.dev/docs/apps/build/product-merchandising/bundles), fixed and customized bundles and the selling plan restriction
- [Shopify: productBundleCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/productBundleCreate), parent price and inventory from components
- [Shopify Help Center: Digital Downloads](https://help.shopify.com/en/manual/products/digital-service-product/digital-downloads), files per variant, size, access limits and links
- [Shopify Help Center: Gift card products](https://help.shopify.com/en/manual/products/gift-card-products/add-update-gift-card-products), denominations as variants
- [BigCommerce: Platform limits](https://support.bigcommerce.com/articles/en_US/Knowledge/Platform-Limits), SKUs per product, values per option and SKU length
- [BigCommerce: Product variants](https://docs.bigcommerce.com/docs/rest-catalog/product-variants), a variant has its own SKU
- [BigCommerce: Product modifiers](https://docs.bigcommerce.com/docs/rest-catalog/product-modifiers), modifiers don't change the variant and can't track inventory
- [Adobe: Product types](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/product-create), simple, configurable, grouped, virtual, bundle, downloadable and gift card
- [Adobe: Configurable product](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/types/product-create-configurable), child simple products and global-scope variation attributes
- [Adobe: Bundle product](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/types/product-create-bundle), dynamic or fixed price, SKU and weight, and shipping together or separately
- [Adobe: Downloadable product](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/types/product-create-downloadable), maximum downloads, shareable links and availability by order status
- [Salesforce B2C Commerce: dw.catalog.Product](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_catalog_Product.html), master, variant, option, set and bundle products
- [Salesforce B2C Commerce: dw.catalog.VariationGroup](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_catalog_VariationGroup.html), groups of variants sharing a value
- [Salesforce Trailhead: Product sets, bundles and options](https://trailhead.salesforce.com/content/learn/modules/b2c-catalog-category-product/b2c-product-sets-bundles-options), sets versus bundles
- [Salesforce Trailhead: Variation groups and slicing](https://trailhead.salesforce.com/content/learn/modules/b2c-catalog-category-product/b2c-configure-variation-groups-slicing), how variants show in search and category pages
- [commercetools: Limits](https://docs.commercetools.com/api/limits), variants per product in Classic and Modular and embedded prices per variant
- [commercetools: Products](https://docs.commercetools.com/api/projects/products), Classic and Modular catalogs, staged and current, and deleting only unpublished products
- [Medusa: Product module](https://docs.medusajs.com/resources/commerce-modules/product), options and variants
- [Medusa: Inventory kits](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit), a variant linked to several inventory items with required quantities
- [Saleor: Products overview](https://docs.saleor.io/developer/products/overview), product types and orders containing only variants
- [WooCommerce: Variable products](https://woocommerce.com/document/variable-product/), static dropdowns above 30 variations and admin paging
- [WooCommerce: class-wc-ajax.php](https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/class-wc-ajax.php), the 50-variation cap per generation run
- [WooCommerce: Digital and downloadable product handling](https://woocommerce.com/document/digital-downloadable-product-handling/), download methods and granting access after payment
- [Spree: Products](https://spreecommerce.org/docs/developer/core-concepts/products), products, variants and option types
- [Amazon SP-API: Listings management workflows](https://developer-docs.amazon/sp-api/docs/building-listings-management-workflows-guide), variation families, non-buyable parents and variation themes
- [Lemon Squeezy: Generating license keys](https://docs.lemonsqueezy.com/help/licensing/generating-license-keys), keys per purchase, activation limits and subscription-linked keys

**Standards**

- [GS1 US: An Introduction to the Global Trade Item Number](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:3b583151-bc32-4223-a190-5bb1ae565b0e/Guideline-An-Introduction-to-the-Global-Trade-Item-Number-GTIN.pdf), trade items, GTIN lengths, indicator digits, 14-digit storage and a GTIN per packaging level
- [GS1 US: What is a GS1 Company Prefix](https://www.gs1us.org/upcs-barcodes-prefixes/what-is-a-prefix), the prefix identifies the brand owner
- [GS1 US: How to get a UPC barcode](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode), single GTIN and prefix pricing
- [GS1 US: Why GS1 US](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/why-gs1us), barcodes identifying the brand owner
- [GS1 New Zealand: GTIN allocation rules](https://www.gs1nz.org/assets/Resources/Services/GS1NZ_Fact-sheet-gtin-allocation-rules.-V2.pdf), the guiding principle and the ten rules
- [GS1 US: Packaging level](https://www.help.gs1us.org/packaging-level), each, inner pack, case, pallet and display shipper
- [GS1 US: GS1 company database](https://www.gs1us.org/tools/gs1-company-database-gepir), lookups and Verified by GS1
- [GS1 US: Sunrise 2027](https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027), the move to 2D barcodes and Digital Link

**Marketplaces**

- [GS1 US: Selling on Amazon with GS1 barcodes](https://gs1us.org/upcs-barcodes-prefixes/amazon/member-services-selling-on-amazon-with-gs1-barcodes), Amazon's GS1 database check as quoted
- [Walmart Marketplace: Understanding product IDs](https://marketplacelearn.walmart.com/academy/Item%20setup/understanding-product-ids), licensing IDs directly from GS1
- [Google Merchant Center: GTIN](https://support.google.com/merchants/answer/6324461), lengths, restricted prefixes and when to omit
- [Google Merchant Center: MPN](https://support.google.com/merchants/answer/6324482), required without a GTIN and not invented by resellers

**Law**

- [15 U.S.C. 1453: Fair Packaging and Labeling Act requirements](https://www.law.cornell.edu/uscode/text/15/1453), net quantity by weight, measure or count
