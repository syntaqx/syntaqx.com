+++
title = "Product Information & Content"
nav_title = "Product Information"
description = "PIMs and attribute models, taxonomies (Google, Shopify, GS1 GPC), channel content and syndication, images, localization and the disclosures a listing carries."
category = "Commerce Industry"
order = 2306
part = "Catalog and Pricing"
tags = ["commerce", "catalog", "pim", "taxonomy", "syndication", "localization"]
+++

A product page is a set of facts. The title, description and images sell it; the attributes (material, fit, voltage, screen size, ingredients, country of origin) let it be filtered, compared, taxed, shipped and listed on someone else's channel; the disclosures (a choking hazard warning, an energy label, a Proposition 65 warning, a textile's country of origin) are what the law requires to be on the page. A brand selling on its own site, Amazon, Walmart, Google Shopping and to three retailers maintains each of those facts in five or six shapes, because every channel has its own category tree, its own required attributes and its own image rules, and a listing that is missing one is rejected or buried.

This chapter covers the content side of the catalog: product information management (PIM) and what PIMs add, attribute models and how platforms store them, taxonomies (Google's product taxonomy, Shopify's Standard Product Taxonomy, GS1's Global Product Classification and the marketplaces' own), channel-specific content and syndication, images and media, localization, and the required disclosures a listing carries. Identity (SKUs, variants, GTINs) is [Products, Variants & Bundles](/books/commerce/products-and-variants); the feeds and listing sync that push this content to marketplaces are [Multichannel Listing & Feeds](/books/commerce/multichannel-listing)'s; the safety rules behind some disclosures are Product Safety, Compliance & Recalls. The chapter extends `products` and `items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `attributes`, `attribute_values`, `categories`, `item_categories`, `media_assets` and `localized_content`, plus `attribute_requirements`.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| System | Attribute model | Grouping that sets required attributes | Channels and locales | Notes |
| --- | --- | --- | --- | --- |
| **Shopify** | Metafields on any resource; metaobjects for structured standalone records | The product's category in the Standard Product Taxonomy, whose "category metafields map to specific product categories" | Markets, with translations through Translate & Adapt | One category per product, with AI-suggested categories |
| **Commerce.com (BigCommerce)** | Custom fields (200 per product) and metafields (250 per product, variant, category, brand or channel) | Categories, up to 8 levels deep and 1,000 per product | Channels through multi-storefront | |
| **commercetools** | Attributes defined on a Product Type (up to 1,000 types per project) | The Product Type | Localized strings per attribute; stores and channels | Search indexes 50 product and 50 variant attributes |
| **Saleor** | Typed attributes (dropdown, multiselect, numeric, rich text, swatch, reference, file, boolean, date and more) on a Product Type | The Product Type, "a collection of attributes" | Channels | |
| **Akeneo PIM** | Typed attributes, including measurement, price, asset collection, reference entity and table | A **family**, "a set of attributes that are shared by products belonging to this family," with requirements per channel | Channels (scopes) and locales; attributes can be localizable, scopable or both | Completeness scored per channel and locale |
| **Salsify** | Product experience management (PXM) | Retailer and channel requirements | "Syndicate product content to every consumer touch point" | Aimed at brands selling through retailers |
| **Plytix** | Attributes and product families | Families | Channels sold as add-ons (Shopify, BigCommerce, Wayfair, feed management) | Priced by SKU count, with unlimited seats |
| **Pimcore** | Open-core data objects | Classes | Localized fields and output channels | Community edition plus paid Professional ($9,900 a year) and Enterprise ($29,900 a year) |

Three patterns run through the table:

- **A grouping decides the required attributes.** Akeneo calls it a family, commercetools and Saleor a product type, Shopify the product's category. A dress needs size, color, material and neckline; a power bank needs capacity, output and battery type. The grouping is where that rule lives, so a new dress can be checked for completeness before it's published.
- **Content varies by channel and by locale, independently.** Akeneo's model is the clearest: an attribute is localizable (a value per language), scopable (a value per channel), both or neither. A description can differ for the brand's site and for Amazon, in English and French, while the material is one value everywhere.
- **The PIM is a distinct system for brands with many channels.** A store selling only on its own platform keeps content in the platform's metafields; a brand syndicating to retailers and marketplaces keeps it in a PIM and publishes to the store, the marketplaces and the retailers from there ([System of Record](/books/commerce/commerce-landscape#oms-wms-and-erp)).

## What a PIM Is For

A PIM is the system of record for descriptive product data. It doesn't take orders or count stock; it holds the attributes, copy, media and translations for every item, enforces what each channel needs, and publishes. The jobs that justify one:

- **Many channels with different requirements.** Google, Amazon, Walmart, Target Plus and each retailer's item setup portal want different attributes, category codes and image specs for the same item. Syndigo, a content syndication network, advertises reach to "3,500+ retailers, marketplaces, and AI surfaces" and "nearly 4,000 retailer requirements," which is the size of the problem from the vendor side.
- **Many contributors.** Product development writes specs, marketing writes copy, compliance attaches warnings and certificates, photography uploads images, translators localize. A PIM gives each a workflow and shows what's missing.
- **Completeness as a gate.** Akeneo's families set which attributes are "required for the completeness calculation" per channel, and the API reports completeness per channel and locale (for example 45% for the e-commerce channel in en_US). A product that isn't complete for a channel isn't published to it.
- **One edit, everywhere.** The material changes once and the store, the feed and the retailer file follow.

Where it sits: the ERP or PLM owns the item's existence, cost and identifiers; the PIM owns its description; the commerce platform owns how it's sold (price, availability, merchandising). Each system holds a copy of the others' fields, and the [system of record per field](/docs/architecture/record-linkage#survivorship-per-field) decides which copy wins. The PIM market reflects the split: Akeneo's on-premise 7.0, released March 8, 2023, was supported until September 30, 2026, after which Enterprise customers "will have to move to the SaaS version"; its Community Edition remains open source under the Open Software License 3.0; Pimcore is open core; Salsify and Plytix are SaaS only.

## Attribute Models

Product attributes are the textbook case for flexible schemas, because every category has different ones and merchants add more every season. The playbook's [Custom Fields](/docs/architecture/custom-fields#three-storage-models) compares the three storage models (columns, entity-attribute-value rows and JSON documents); the commerce choices:

- **Columns for what every item has.** Weight, dimensions, net quantity, tax category, country of origin and GTIN are on every physical item and are read by checkout, shipping and tax. They're columns on `items` ([Products, Variants & Bundles](/books/commerce/products-and-variants#how-to-build-it)).
- **Typed attribute definitions for the rest.** An attribute is defined once with a code, a type (text, number with a unit, single select from a list, multi-select, boolean, date, rich text, reference to media or another record), whether it's localizable and whether it varies by channel. Values are stored against the definition and validated by it ([Validating Against Definitions](/docs/architecture/custom-fields#validating-against-definitions)).
- **Measurements carry units.** Akeneo's measurement attribute and Saleor's numeric type with units exist because "15.6" means nothing without "inch," and channels want different units (centimeters in the EU feed, inches in the US one). Store the value with its unit, convert on output.
- **Select options are vocabularies.** A color attribute with a list of options produces clean filters and feeds; a free-text color produces "Blk." Options map to each channel's own values ([Channel Content and Syndication](#channel-content-and-syndication)).
- **Attributes live at the right level.** Akeneo's product models and family variants put shared attributes on the model (the material of a shirt) and varying ones on the variant (the size); Shopify has product, variant and category metafields. A value set on the product is inherited by its items unless overridden.

## Taxonomies

A taxonomy is a category tree with attributes attached to its nodes. Every merchant has its own for navigation, and every channel has another for listing; the work is mapping between them.

| Taxonomy | Owner | Shape, as of October 2026 | Used for |
| --- | --- | --- | --- |
| **Google product taxonomy** | Google | A tab-separated file of categories with numeric IDs; the current file is version 2021-09-21 with 5,595 categories under 21 top-level nodes (my count of the file) | `google_product_category` in Merchant Center, now optional because "all products are automatically assigned a product category" |
| **Shopify Standard Product Taxonomy** | Shopify, open source under the MIT license | Categories, attributes and attribute values, released in dated versions on GitHub; the 2026-10 distribution has more than 14,000 categories in 26 verticals and more than 8,000 attributes (my count of the distribution files) | A Shopify product's category, which drives its category metafields, tax and channel mapping |
| **GS1 Global Product Classification (GPC)** | GS1 | Four tiers, "segment, family, class, and brick"; "each Global Trade Item Number (GTIN) can be assigned only one Brick," with brick attributes "limited to 25 attributes per brick" | Retailer item setup and data synchronization between trading partners |
| **Amazon product types** | Amazon | Product type definitions served by the SP-API, schemas that "extend JSON Schema 2019-09" | The attributes and requirements to list in each product type |
| **The merchant's own** | The merchant | Whatever its navigation and merchandising need | Navigation, collections and reporting |

The design rules that follow:

- **Keep the merchant's taxonomy separate from the channels'.** Navigation changes with the season ("Gifts under $50"); a channel's taxonomy changes on its owner's schedule. Merchandising collections are a third thing again ([Collections](/books/commerce/site-search-and-merchandising#collections-and-category-pages)).
- **Map each internal category to each channel's category,** with the mapping versioned, and map at the item level when one internal category spans several channel categories. [Multichannel Listing & Feeds](/books/commerce/multichannel-listing#category-and-attribute-mapping) owns the channel mapping tables.
- **Prefer a public taxonomy as the base** when the merchant doesn't have a strong one. Shopify's taxonomy is open, versioned and attribute-rich; GS1 GPC is what retailers ask for; Google's is old but still the reference many feeds use.
- **One item, one category per taxonomy.** GS1 allows one brick per GTIN and Shopify one category per product; multiple placements belong in navigation and collections, not in the classification.

## Channel Content and Syndication

Each channel wants the same facts in its own shape. Google Merchant Center's product data specification is a fair baseline because so many channels copy it. As of October 2026:

- **Always required:** `id`, `title` (up to 150 characters), `description` (up to 5,000), `link`, `image_link`, `availability` and `price`.
- **Required for new products:** `brand` (except movies, books and music), plus `gtin` or, without one, `mpn` ([The marketplaces check](/books/commerce/products-and-variants#the-marketplaces-check)).
- **Conditionally required:** `condition` for used or refurbished goods; `item_group_id`, `color`, `size`, `age_group` and `gender` for variants and apparel, with "the same value for the item group ID ... for all variants of the same product" and each variant "as a separate product"; `is_bundle` and `multipack`; `certification` for products with an EU energy label.

Marketplaces add their own, served as machine-readable schemas: Amazon's Product Type Definitions API returns the attributes and requirements for each product type. Retailers add item setup portals and, for grocery, health and consumer goods, data synchronization over GS1's **Global Data Synchronization Network (GDSN)**, a network of certified data pools through which a brand publishes item data once and each retailer subscribes; GS1 US lists GTIN compliance as a prerequisite for "Data synchronization using the Global Data Synchronization Network (GDSN)." The data pools and syndication networks are businesses of their own: 1WorldSync describes itself as "the most-trafficked syndication network for GDSN and beyond," with "more than 17,000 brands and retailers."

Channel-specific content is more than reformatting:

- **Titles differ by channel by design.** A brand site's title is short ("Glass Elite Screen Protector"); a marketplace title carries the brand, model, compatibility and pack size because that's what the marketplace's search reads.
- **Some attributes exist only for one channel:** Amazon's bullet points, a retailer's department code, Google's product highlights.
- **Content can be refused.** A listing missing a required attribute is suppressed while the item is fine ([Item versus listing](/books/commerce/commerce-business#the-core-data-model)), so the PIM's completeness check per channel should match the channel's own validation.

My rule: one attribute value per fact, with channel overrides only where the channel wants different words for the same fact (a title, a description), never for facts themselves (a material, a capacity, a country of origin). A capacity that differs between two channels is a bug, and in a regulated product a liability.

## Images and Media

Images are the content that converts and the content channels police hardest. As of October 2026 Google requires product images to be the product itself, without overlays, watermarks or borders, no larger than 64 megapixels or 16 MB, recommends 1,500 by 1,500 pixels, and has announced "new image size requirements of at least 500 x 500 pixels for all products beginning January 31, 2027." Marketplaces have their own main-image rules (Amazon's white-background main image is the best known), published behind seller logins. <!-- source-gap: amazon-image-requirements | missing | Amazon's main image requirements (background, fill, minimum size) | closes with: a public Amazon page stating product image requirements | checked: 2026-10-28 -->

The media model that serves every channel:

- **A media asset is a record, not a URL.** It has the original file, its dimensions, its alt text (localizable), its rights (who shot it, licensed until when, which channels), and what it depicts (which items, which option value, such as all black variants).
- **Derivatives are generated, not uploaded.** Each channel's size and format is produced from the original on demand or at publish ([Variants: Eager or On Demand](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand), [Choosing a Format by Content Class](/docs/architecture/media-compression#choosing-a-format-by-content-class)).
- **Images attach to option values as well as items.** Commerce.com allows one image per variant and a thousand per product; the usual pattern is a gallery per product with each image tagged to the option values it shows, so selecting "black" swaps the gallery.
- **Alt text is content.** It's the accessibility text a screen reader announces and an attribute some channels ingest; it's localized with the rest ([Accessibility](/docs/frontend/accessibility)).
- **Video, 3D models, size charts, manuals and safety data sheets are media too,** with the same rights and channel rules. A safety data sheet or a warranty document attached to an item is also a compliance record, kept by version.

## Localization

Selling into another language or market means translating content, and also changing facts. The translation side is the playbook's [Internationalization](/docs/frontend/internationalization); the commerce side:

- **Translations are per attribute, per locale.** Akeneo's localizable attributes and Shopify's translatable resources both store a value per locale against the original; Shopify's Translate & Adapt app translates "manually, or automatically with AI translations from Shopify," and lets a merchant "choose the languages that each market uses." Market-specific adaptations (a British spelling, a different product name) are overrides on the translation, which Shopify stores separately as "a theme override rather than a translation" for theme content.
- **Locale and market are different keys.** Akeneo's locale is "a combination of a language ... and a country"; a channel carries its own locales, currencies and category tree. French for Canada and French for France are different locales; a market (Canada) can have two languages.
- **Some facts are local.** Units (metric labels for the EU), sizes (US and EU shoe sizes are different values, not translations), required warnings in the local language, and the legal names of materials (textile fiber names are regulated in both the US and the EU) change by market. Store them as values scoped to the market, not as translated strings.
- **Translations go stale.** When the source text changes, every translation of it is out of date; record the source version each translation was made from, and treat a stale translation as incomplete for that locale ([How to Build It](#how-to-build-it)).
- **Machine translation is a draft.** Generated copy for regulated attributes (ingredients, warnings, care instructions) needs a human approval before publish, recorded with who approved it; the later AI in Commerce chapter covers generation more broadly.

## Required Disclosures

Some content on a product page is required by law, and the law increasingly reaches the online listing as well as the package. The main US rules for online listings, with the safety and chemical substance behind them owned by [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls) and [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat):

| Rule | What the online listing must show | Source |
| --- | --- | --- |
| **Textile and Wool Acts** | For textile products sold by mail or internet, "a clear and conspicuous statement" that the product was "made in U.S.A., imported, or both"; the FTC says "you must disclose country of origin information in mail order or internet advertising," and fiber content where the listing mentions fiber | 16 CFR 303.34; FTC business guidance |
| **Small parts and choking hazards** | For toys and games for children that require cautionary statements (small parts, latex balloons, small balls, marbles), the statement "on or immediately adjacent to" the advertisement on "Internet websites" with a direct means of purchase | 15 U.S.C. 1278(c); 16 CFR 1500.20 |
| **Energy labeling** | For covered appliances, "a recognizable and legible image of the label" near the price, or a hyperlink using the prescribed icon that doesn't require saving the image to view it | 16 CFR 305.27 |
| **California Proposition 65** | A warning "on the product display page," a "clearly marked hyperlink using the word 'WARNING'," or a warning before the purchase completes; not compliant "if the purchaser must search for it" | 27 CCR 25602(b) |
| **Fair Packaging and Labeling Act** | Identity, the name and place of business of the manufacturer, packer or distributor, and net quantity on the package; the listing's net quantity has to match | 15 U.S.C. 1453 |

The EU's General Product Safety Regulation (Regulation (EU) 2023/988) requires online offers to show the manufacturer's name and contact address, the responsible person in the EU where the manufacturer is outside it, information identifying the product (including a picture and type), and any warning or safety information in the consumer's language. The regulation's text couldn't be retrieved from EUR-Lex when this was checked, so the list is the general shape, without article-level detail. <!-- source-gap: eu-gpsr-article-19 | missing | the exact information GPSR Article 19 requires in distance sales offers | closes with: EUR-Lex text of Regulation (EU) 2023/988 Article 19 | checked: 2026-10-28 -->

What this means for the content model:

- **A disclosure is a typed attribute with a rule, not a paragraph in the description.** "Country of origin: imported," "Choking hazard: small parts, not for children under 3," "Prop 65: cancer, lead" are values a rule can require by category and jurisdiction, a template can render in the prescribed words, and an audit can check across the catalog ([Rules as Data](/docs/architecture/rules-as-data)).
- **The rule decides placement too.** Several rules specify where the warning appears (adjacent to the advertisement, near the price, on the display page before purchase). The storefront's product template, cart and feed must each render the disclosure where its rule says; the later Storefronts chapter owns the templates.
- **Disclosures travel with syndication.** A warning required on the brand's site is required on the marketplace too; the feed carries it as an attribute and the channel's own field (Google's `certification` for EU energy labels).
- **Missing required disclosures block publishing,** exactly like a missing required attribute.

## How to Build It

Typed attributes with channel and locale scope, categories and their requirements, media and localized content, extending `products` and `items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model):

```sql
CREATE TABLE attributes (                    -- a definition: "material", "screen_size"
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  code         TEXT NOT NULL,
  data_type    TEXT NOT NULL CHECK (data_type IN ('text', 'rich_text', 'number',
                 'measurement', 'boolean', 'date', 'select', 'multi_select', 'media',
                 'reference')),
  unit_family  TEXT,                         -- 'length', 'mass', 'volume', 'power'
  options      JSONB,                        -- for select types: codes and labels
  localizable  BOOLEAN NOT NULL DEFAULT FALSE,  -- a value per locale
  scopable     BOOLEAN NOT NULL DEFAULT FALSE,  -- a value per channel
  level        TEXT NOT NULL CHECK (level IN ('product', 'item')),
  disclosure   BOOLEAN NOT NULL DEFAULT FALSE,  -- legally required text, rendered by rule
  UNIQUE (merchant_id, code)
);

CREATE TABLE attribute_values (              -- one value per subject, locale and channel
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  attribute_id  UUID NOT NULL REFERENCES attributes (id),
  product_id    UUID REFERENCES products (id),
  item_id       UUID REFERENCES items (id),  -- overrides the product's value when set
  locale        TEXT,                        -- BCP 47, e.g. 'fr-CA'; null if not localizable
  channel_id    TEXT REFERENCES sales_channels (id),  -- null: every channel
  value         JSONB NOT NULL,              -- {"amount": 15.6, "unit": "in"} for measurements
  source        TEXT NOT NULL CHECK (source IN ('manual', 'import', 'supplier', 'generated')),
  approved_by   UUID,                        -- required for generated or disclosure values
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((product_id IS NULL) <> (item_id IS NULL))
);
CREATE UNIQUE INDEX attribute_values_one ON attribute_values (attribute_id,
  COALESCE(product_id, item_id), COALESCE(locale, ''), COALESCE(channel_id, ''));

CREATE TABLE categories (                    -- the merchant's tree and each channel's
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  taxonomy     TEXT NOT NULL,                -- 'merchant', 'shopify:2026-10', 'google:2021-09-21',
                                             -- 'gs1_gpc', 'amazon'
  external_id  TEXT,                         -- the taxonomy's own ID, e.g. a GPC brick code
  parent_id    UUID REFERENCES categories (id),
  name         TEXT NOT NULL,
  path         TEXT NOT NULL,                -- 'Electronics > Phone Accessories > Screen Protectors'
  UNIQUE (taxonomy, external_id)
);

CREATE TABLE item_categories (               -- one classification per taxonomy
  item_id      UUID NOT NULL REFERENCES items (id),
  category_id  UUID NOT NULL REFERENCES categories (id),
  taxonomy     TEXT NOT NULL,                -- copied from the category for the key below
  assigned_by  TEXT NOT NULL CHECK (assigned_by IN ('manual', 'mapping', 'suggested')),
  PRIMARY KEY (item_id, taxonomy)
);

CREATE TABLE attribute_requirements (        -- what a category needs, per channel
  category_id   UUID NOT NULL REFERENCES categories (id),
  attribute_id  UUID NOT NULL REFERENCES attributes (id),
  channel_id    TEXT NOT NULL REFERENCES sales_channels (id),
  jurisdiction  TEXT NOT NULL DEFAULT '*',   -- 'US', 'US-CA', 'EU'; disclosures vary
  PRIMARY KEY (category_id, attribute_id, channel_id, jurisdiction)
);

CREATE TABLE media_assets (                  -- the original, its rights and what it shows
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  kind          TEXT NOT NULL CHECK (kind IN ('image', 'video', 'model_3d', 'document')),
  storage_key   TEXT NOT NULL,               -- the original; derivatives are generated
  width_px      INT,
  height_px     INT,
  sha256        BYTEA NOT NULL,
  rights_holder TEXT,
  licensed_until DATE,                       -- null: owned outright
  channels      TEXT[],                      -- null: every channel
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_media (                 -- placement in a gallery, by option value
  media_id        UUID NOT NULL REFERENCES media_assets (id),
  product_id      UUID NOT NULL REFERENCES products (id),
  option_value_id UUID REFERENCES product_option_values (id),  -- null: every variant
  position        SMALLINT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('main', 'gallery', 'swatch', 'size_chart',
                    'manual', 'safety_data_sheet')),
  PRIMARY KEY (media_id, product_id)
);

CREATE TABLE localized_content (             -- translations of long-form fields, with freshness
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type    TEXT NOT NULL CHECK (subject_type IN ('product', 'item', 'media',
                    'category', 'option_value')),
  subject_id      UUID NOT NULL,
  field           TEXT NOT NULL,             -- 'title', 'description', 'alt_text', 'handle'
  locale          TEXT NOT NULL,
  market          TEXT,                      -- an adaptation for one market; null: the locale
  value           TEXT NOT NULL,
  source_version  INT NOT NULL,              -- the source text's version it was made from
  method          TEXT NOT NULL CHECK (method IN ('human', 'machine', 'machine_reviewed')),
  reviewed_by     UUID,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_type, subject_id, field, locale, market)
);

-- Completeness: required attributes an item is missing for a channel and jurisdiction.
SELECT i.id AS item_id, a.code AS missing
FROM items i
JOIN item_categories ic ON ic.item_id = i.id AND ic.taxonomy = 'merchant'
JOIN attribute_requirements r ON r.category_id = ic.category_id
  AND r.channel_id = $1 AND r.jurisdiction IN ('*', $2)
JOIN attributes a ON a.id = r.attribute_id
WHERE NOT EXISTS (
  SELECT 1 FROM attribute_values v
  WHERE v.attribute_id = a.id
    AND (v.item_id = i.id OR v.product_id = i.product_id)
    AND (v.channel_id IS NULL OR v.channel_id = $1)
);
```

Design notes:

- **Items inherit product values.** The completeness query accepts a value on the item or its product; the storefront resolves the same way, item first.
- **Disclosures need approval.** A value on an attribute with `disclosure = true`, or one with `source = 'generated'`, isn't published until `approved_by` is set.
- **A stale translation is a missing one.** When the source field's version passes a translation's `source_version`, the translation stays visible (so the page isn't blank) and counts as incomplete for that locale.
- **Rights expire.** A media asset past `licensed_until` is withdrawn from every channel by a scheduled job, which also has to reach channels that cached it.
- **Change data capture feeds the channels.** Every attribute, media and translation change is an event the feed and syndication jobs consume ([Change Data Capture](/docs/architecture/data-pipelines#change-data-capture)).

## Auditing

- **What the listing said on a date.** A complaint about a false claim (a material, a capacity, "Made in USA"), a warning missing from a page or a retailer's chargeback for wrong item data is judged against what was published then; keep attribute and content history per channel ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Who approved each disclosure and generated value,** and the rule that required it.
- **Image rights,** with the license and its expiry, so a photographer's claim can be answered.
- **What was syndicated to each channel and when,** so a channel's rejection or a retailer's data dispute can be matched to the payload sent.

## What This Means for the System You Build

- **Keep one value per fact,** with channel overrides only for words, never for facts.
- **Define attributes with types, units and option lists,** grouped by a category or family that sets what each channel requires.
- **Gate publishing on completeness** per channel, locale and jurisdiction.
- **Keep your taxonomy separate from each channel's** and map between them with versions.
- **Make media records with rights and option-value tags,** and generate every channel's derivatives from the original.
- **Translate per field and locale, track the source version,** and review machine output for regulated fields.
- **Model required disclosures as typed attributes with rules** for when they're required and where they render, and carry them through every feed.
- **Use a PIM when channels and contributors multiply,** and decide field by field which system is the record.

## References

**Platform and vendor documentation**

- [Shopify: Metafields](https://shopify.dev/docs/apps/build/metafields), custom data on resources and metaobjects for standalone records
- [Shopify Help Center: Product category](https://help.shopify.com/en/manual/products/details/product-category), one category per product, category metafields and AI suggestions
- [Shopify: Standard Product Taxonomy on GitHub](https://github.com/Shopify/product-taxonomy), the open-source taxonomy, its license and distributions
- [Shopify: Product taxonomy releases](https://shopify.github.io/product-taxonomy/), dated versions through 2026-10
- [Shopify Help Center: Translate & Adapt](https://help.shopify.com/en/manual/international/languages/translate-and-adapt), manual and AI translation
- [Shopify Help Center: Languages](https://help.shopify.com/en/manual/international/languages), languages per market
- [Shopify: Manage translated content](https://shopify.dev/docs/apps/build/markets/manage-translated-content), translatable resources and market-specific theme overrides
- [BigCommerce: Platform limits](https://support.bigcommerce.com/articles/en_US/Knowledge/Platform-Limits), custom fields, metafields, images and category limits
- [commercetools: Limits](https://docs.commercetools.com/api/limits), product types and searchable attributes
- [Saleor: Attributes](https://docs.saleor.io/developer/attributes/overview), attribute input types
- [Saleor: Products overview](https://docs.saleor.io/developer/products/overview), product types as collections of attributes
- [Akeneo: Catalog structure](https://api.akeneo.com/concepts/catalog-structure.html), families, attribute types, family variants and requirements per channel
- [Akeneo: Products](https://api.akeneo.com/concepts/products.html), product models and completeness per channel and locale
- [Akeneo: Target market settings](https://api.akeneo.com/concepts/target-market-settings.html), channels, locales and currencies
- [Akeneo: PIM versions](https://help.akeneo.com/en_US/everything-you-need-to-know-about-our-pim-versions/everything-you-need-to-know-about-our-pim-versions), the 7.0 release and its support end, and the move to SaaS
- [Akeneo: Community Edition license](https://github.com/akeneo/pim-community-dev/blob/master/LICENCE.txt), Open Software License 3.0
- [Salsify: Platform](https://www.salsify.com/platform), product experience management and syndication
- [Plytix: Pricing](https://www.plytix.com/pricing), plans by SKU count, unlimited seats and channel add-ons
- [Pimcore: Pricing](https://pimcore.com/en/platform/pricing), Community, Professional and Enterprise editions
- [Pimcore: GitHub repository](https://github.com/pimcore/pimcore), the Pimcore Open Core License
- [Amazon SP-API: Product Type Definitions API](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api), attribute requirements per product type as JSON Schema
- [1WorldSync](https://www.1worldsync.com/), a GDSN syndication network and its reach
- [Syndigo](https://www.syndigo.com/), retailer reach and requirements

**Channels**

- [Google Merchant Center: Product data specification](https://support.google.com/merchants/answer/7052112), required and conditional attributes and length limits
- [Google Merchant Center: Google product category](https://support.google.com/merchants/answer/6324436), optional, with automatic assignment
- [Google: Product taxonomy file](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt), the 2021-09-21 version and its categories
- [Google Merchant Center: Item group ID](https://support.google.com/merchants/answer/6324507), variants submitted separately with a shared group ID
- [Google Merchant Center: Image link](https://support.google.com/merchants/answer/6324350), image rules and the 500 by 500 pixel minimum from January 31, 2027

**Standards**

- [GS1: GPC Development & Implementation Guide, Issue 8](https://gs1-germany.de/fileadmin/gs1/fachpublikationen/GPC_Development_and_Implementation_Guide_8.0.pdf), the four tiers, one brick per GTIN and 25 attributes per brick
- [GS1 US: An Introduction to the Global Trade Item Number](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:3b583151-bc32-4223-a190-5bb1ae565b0e/Guideline-An-Introduction-to-the-Global-Trade-Item-Number-GTIN.pdf), GTIN compliance for GDSN data synchronization

**Law**

- [16 CFR 303.34: Country of origin in mail order advertising](https://www.law.cornell.edu/cfr/text/16/303.34), the textile origin statement
- [FTC: Threading Your Way Through the Labeling Requirements Under the Textile and Wool Acts](https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts), origin and fiber disclosure in internet advertising
- [15 U.S.C. 1278: Cautionary labeling for small parts](https://www.law.cornell.edu/uscode/text/15/1278), statements in internet advertising
- [16 CFR 1500.20: Labeling requirement for advertising toys and games](https://www.law.cornell.edu/cfr/text/16/1500.20), the advertising rule for cautionary statements
- [16 CFR 305.27: Paper catalogs and websites](https://www.law.cornell.edu/cfr/text/16/305.27), energy label images and hyperlinks online
- [27 CCR 25602: Proposition 65 warning methods](https://www.law.cornell.edu/regulations/california/27-CCR-25602), internet warnings on the display page or by hyperlink
- [15 U.S.C. 1453: Fair Packaging and Labeling Act requirements](https://www.law.cornell.edu/uscode/text/15/1453), identity, responsible party and net quantity
