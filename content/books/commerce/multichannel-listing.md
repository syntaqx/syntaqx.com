+++
title = "Multichannel Listing & Feeds"
description = "Catalog syndication: Amazon Listings Items and JSON schemas, Walmart item spec, Google Merchant Center, Rithum, Feedonomics, Pattern, sync and errors."
category = "Commerce Industry"
order = 2330
part = "Marketplaces"
tags = ["commerce", "marketplaces", "feeds", "listings", "google-merchant-center", "data-model"]
+++

A brand defines a product once and sells it in a dozen places, and each place wants it described its own way. Amazon wants a product type and a JSON document that validates against that type's schema; Walmart wants an item spec feed per product type; Google Merchant Center wants a title under 150 characters, a price that matches the landing page and a Google product category; eBay wants an inventory item and an offer; Etsy wants a listing with its own taxonomy. Catalog syndication is the job of turning one internal item into each channel's listing, keeping price and stock current on all of them, and finding out (often hours later, asynchronously) which listings the channel rejected, suppressed or changed.

It is a mapping and a feedback loop. The mapping is mostly data: categories and attributes from the brand's catalog to each channel's taxonomy and fields. The feedback loop is the hard part, because channels accept a submission, process it later, and report issues by notification, report or not at all. The same problem syndicates apartments to listing networks in the Property Tech volume ([Listings and Syndication](/books/property-tech/listings-and-marketing#listings-and-syndication)) and is solved the same way: an outbox of changes per listing, an adapter per channel, and a record of what each channel said back.

This chapter covers the channels' listing interfaces (Amazon's Listings Items API and product type schemas, Walmart's item spec, Google's product data specification and Merchant API, eBay and Etsy), category mapping, inventory and price sync, error handling, and the tools and partners that do this for brands (Rithum, Feedonomics, Pattern). It extends `listings` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The catalog's own attributes, taxonomy and content are the later Product Information & Content chapter; how available quantities are computed is [Inventory](/books/commerce/inventory#sync-across-channels); Shopping ads bought on top of a Merchant Center feed are the later Acquisition & Attribution chapter; the agentic shopping feeds now being built on the same data are the later Agentic & AI Shopping chapter.

## How the Platforms Do It

As of October 2026, from each channel's developer documentation and each tool's own pages:

| Channel or tool | How listings get in | Validation | Feedback |
| --- | --- | --- | --- |
| **Amazon** | Listings Items API per SKU (put, patch, delete), or `JSON_LISTINGS_FEED` in bulk; the old flat-file and XML listing feeds were removed December 3, 2025 | JSON Schema per product type, from the Product Type Definitions API; `VALIDATION_PREVIEW` mode validates without saving | Synchronous status and issues on each call; `LISTINGS_ITEM_STATUS_CHANGE` and `LISTINGS_ITEM_ISSUES_CHANGE` notifications |
| **Walmart Marketplace** | Bulk item setup feeds: `MP_ITEM` (full setup), `MP_ITEM_MATCH` (offer on an existing item), `MP_MAINTENANCE`, `MP_WFS_ITEM`, `OMNI_WFS` | Item spec 5.0 for setup and maintenance feeds (latest build dated 2024-11-18), v4.2 for match | Feed status and item status; submit and publish "typically takes a few hours" |
| **Google Merchant Center** | Merchant API (data sources and product inputs), files, or structured data on the site; the Content API for Shopping "was sunset on August 18, 2026" | The product data specification: required attributes, lengths, values | Product issues and diagnostics in Merchant Center and the API |
| **eBay** | Inventory API: an inventory item, then an offer that publishes it | Category aspects | Responses and listing status |
| **Etsy** | Open API v3 listings and inventory | Etsy's taxonomy and properties | Responses |
| **Rithum** | One catalog, listed "across 600+ marketplaces in the Rithum network" | Channel templates in the tool | The tool's error console |
| **Feedonomics** | Feeds for "2,000+ destinations across ad channels, marketplaces, and AI surfaces" | Full service: "Dedicated feed manager," "Hands-on implementation" | Managed by the service |
| **Pattern** | The partner buys the goods and lists them itself | The partner's | Reported to the brand |

Three patterns:

- **Every channel has a schema per product type.** Amazon's product types, Walmart's spec categories, Google's apparel and variant requirements and eBay's category aspects all say the same thing: a phone case and a vitamin need different attributes, and the channel validates against the type's list. The mapping from the brand's catalog is per channel per product type, not per channel.
- **Submissions are asynchronous.** Even Amazon's synchronous API answers "accepted for processing"; the listing becomes buyable later, and issues can appear after acceptance. Walmart and Google process feeds over hours. A listing has a submission state and a channel state, and they differ for a while after every change.
- **Bulk and single-item paths coexist.** Amazon's feed is "contractually compatible with the Listings Items API," with up to 25,000 messages per feed and a suggested minimum of 1,500; Walmart and Google take bulk files and single calls. My default is the item API for changes and the bulk path for initial loads and full refreshes, which is also Amazon's guidance.

## The Listing Life Cycle

A listing is the item on someone else's shelf, under their identifier and their status, and it goes through more states than the item does:

| State | What it means | Who moves it |
| --- | --- | --- |
| **Draft** | Mapped and assembled, not sent | The merchant |
| **Submitted** | Sent; the channel acknowledged receipt | The merchant |
| **Processing** | The channel is validating, matching or classifying | The channel |
| **Active** | Live and buyable (Amazon's `BUYABLE`) or at least visible (`DISCOVERABLE`) | The channel |
| **Suppressed** | Hidden for an issue: a missing attribute, an image, a price rule, a policy | The channel |
| **Ended** | Withdrawn by the merchant or removed by the channel | Either |

Two decisions come before the first submission:

- **Match or create.** If the product already exists on the channel (an ASIN, a Walmart item, a Google product with the same GTIN), the seller offers against it: Amazon's "offer-only" listing lets sellers "list only the necessary details to match the existing item" plus the sales terms, and Walmart's `MP_ITEM_MATCH` feed does the same. If it doesn't exist, the seller creates it with full product facts. Matching depends on identifiers, which is why GTINs and brand names have to be right before anything else (`items.gtin` in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model); the later Products, Variants & Bundles chapter covers identifiers).
- **Product facts versus sales terms.** Amazon's `requirements` parameter names the split: `LISTING` ("product facts and sales terms"), `LISTING_PRODUCT_ONLY` ("product facts only") and `LISTING_OFFER_ONLY` ("sales terms only"). Facts (title, brand, attributes, images) change rarely and are shared with other sellers on a matched product; terms (price, quantity, condition, fulfillment) change constantly and are the seller's alone. The system sends them on different schedules and tracks them separately.

## Amazon: Listings Items and Product Type Schemas

The Listings Items API "provides programmatic access to selling partner listings on Amazon," and is used with the Product Type Definitions API, which supplies "the information about Amazon product types needed to use the Listings Items API." Its operations are per seller and SKU: `getListingsItem`, `putListingsItem` (create or replace), `patchListingsItem` (change some attributes), `deleteListingsItem`, and `searchListingsItems` for the seller's listings.

**Schemas.** Each product type's definition is a JSON Schema document (with Amazon's own vocabulary extensions, validated by a published meta-schema) that lists every attribute, which are required, their types, allowed values and limits, per marketplace and locale. A submission is a JSON document of attributes for one product type. The definitions change: attributes are added and requirements tighten, so a listing that validated last month can fail this month. My rule: fetch definitions per product type and marketplace on a schedule, store them by version, and validate every submission against the current version before sending it, so that a schema change shows up as a validation failure in the brand's own system, attributed to the change.

**Validation preview.** Setting `mode=VALIDATION_PREVIEW` means "the submitted data should be validated without persisting to the selling partner's catalog," and the response returns `VALID` ("Only returned when the `mode` is `VALIDATION_PREVIEW`") or `INVALID` with issues. A normal submission returns `ACCEPTED` ("accepted for processing") or `INVALID` ("not valid and was not accepted for processing").

**Issues.** Each issue has a severity, `ERROR` ("prevented the submission from processing. For example, a validation error.") or `WARNING` ("should be reviewed, but it has not prevented the submission from processing"), a code, a message, the attributes it concerns and categories such as `MISSING_ATTRIBUTE`, `INVALID_ATTRIBUTE`, `INVALID_IMAGE` and `INVALID_PRICE`. After acceptance, new issues arrive through `LISTINGS_ITEM_ISSUES_CHANGE`, which Amazon sends "in near real-time," and status changes through `LISTINGS_ITEM_STATUS_CHANGE`.

**Patching.** A patch is a list of operations on top-level attributes: `add` and `replace` ("adds or replaces the target property"), `merge` and `delete`. A price or quantity change is a small patch; a content change replaces an attribute. A sketch of a terms-only patch:

```json
{
  "productType": "PRODUCT",
  "patches": [
    {
      "op": "replace",
      "path": "/attributes/purchasable_offer",
      "value": [{ "marketplace_id": "ATVPDKIKX0DER", "currency": "USD",
                  "our_price": [{ "schedule": [{ "value_with_tax": 29.99 }] }] }]
    },
    {
      "op": "replace",
      "path": "/attributes/fulfillment_availability",
      "value": [{ "fulfillment_channel_code": "DEFAULT", "quantity": 42 }]
    }
  ]
}
```

The attribute names and structure come from the product type's schema, which is why they're read from the definition rather than written by hand; the sketch shows the shape, not a contract. `putListingsItem` is rate limited at 5 requests a second with a burst of 10 ([Limits, Notifications and Versions](/books/commerce/selling-on-amazon#limits-notifications-and-versions)), which is the main reason bulk work uses the feed.

**The feed.** `JSON_LISTINGS_FEED` carries the same documents in bulk: "submissions can contain up to 25,000 messages," Amazon suggests a minimum of 1,500 items, and messages "are enqueued and can be processed out of order." A feed is right for a catalog load; for anything that needs "synchronous validation feedback," Amazon's guidance is the API. The flat-file and XML feeds that most older integrations used (`POST_PRODUCT_DATA`, `POST_FLAT_FILE_LISTINGS_DATA`, `POST_INVENTORY_AVAILABILITY_DATA`, `POST_PRODUCT_PRICING_DATA` and their relatives) were deprecated March 18, 2024 and removed December 3, 2025.

## Walmart Item Spec

Walmart's items move through four steps before they sell: they must be priced, have inventory assigned, be submitted and be published, and submit and publish each "typically takes a few hours." Setup is by bulk feed:

- **`MP_ITEM`** creates items with full content, for products new to Walmart.com, against item spec 5.0 (the latest build is dated November 18, 2024, the previous May 17, 2024).
- **`MP_ITEM_MATCH`** sets up an offer on an item that already exists, against spec v4.2: the seller's SKU, the identifier to match and the price, without content.
- **`MP_MAINTENANCE`** updates content on existing items; **`MP_WFS_ITEM`** and **`OMNI_WFS`** set items up for Walmart Fulfillment Services.

The spec is per product type, like Amazon's, and versions change; the version a feed was built against is part of the feed record, because a feed rejected for a spec version mismatch has to be rebuilt, not retried. Prices and inventory move separately from content through their own APIs and feeds, and Walmart's pricing rules can unpublish an item that has valid content ([Walmart Marketplace](/books/commerce/other-marketplaces#walmart-marketplace)). API access is by OAuth client credentials with 15-minute tokens.

## Google Merchant Center

Google's product data feeds Shopping ads, free listings and other Google surfaces, and it is the strictest about consistency between the feed and the store:

- **Required for every product:** `id`, `title` (or `structured_title`), `description` (or `structured_description`), `link`, `image_link`, `availability` and `price`. `brand` is required for new products except movies, books and music; `gtin` "depends" and is strongly recommended; `mpn` is required only without a GTIN; `condition` for used or refurbished goods; apparel and variant products need `age_group`, `gender`, `color`, `size` and `item_group_id` in listed countries.
- **Lengths:** `id` up to 50 characters, `title` 150, `description` 5,000, `brand` and `mpn` 70.
- **Availability** is `in_stock`, `out_of_stock`, `preorder` or `backorder`, with an `availability_date` for preorders "up to one year in the future."
- **Price** must "match with the price from your landing page, structured data, and at checkout," in the target country's currency. In the US and Canada, "Don't include any taxes, such as sales tax"; elsewhere VAT or GST is included.
- **Category:** "Include only one category" from Google's product taxonomy, preferably by ID; some products have required categories.
- **Images:** a new 500 by 500 pixel minimum, with "Enforcement of the new requirements will begin January 31, 2027."

The interface changed in 2026. "The Merchant API is a redesign of the Content API for Shopping," the Content API "was sunset on August 18, 2026," and from September 1, 2026 its requests "will experience progressive errors." The Merchant API separates what the merchant submits (`productInputs`) from the processed product Google shows, and supports several data sources per account, so a feed file, an API integration and a local inventory source can coexist.

The price rule is the pricing-page principle in another form: the store page is the truth, and the feed is a rendering of it ([The Pricing Page as Truth](/books/hosting-and-cloud/pricing-catalogs#the-pricing-page-as-truth)). A feed built from a different price source than the storefront (a nightly export from the ERP, while the site reads a promotion engine) will disagree during every sale, and the specification requires the three to match.

## Category and Attribute Mapping

The brand's catalog has its own categories and attributes; each channel has its own taxonomy and its own attribute names and allowed values. The mapping has three layers:

- **Category to product type.** The brand's "Screen protectors" maps to an Amazon product type, a Walmart spec category, a Google product category ID, an eBay category and an Etsy taxonomy node. One brand category can map to different channel categories by item (a tempered-glass protector and a privacy film may land in different places), so the mapping is a default per category with overrides per item.
- **Attribute to field.** "Compatible device" maps to a different field name on each channel, sometimes split (model and generation), sometimes required, sometimes with an enumerated list of values. Each mapping is a function from the brand's attribute values to the channel's, with a lookup table for enumerations.
- **Content per channel.** Titles differ by rule (Google's 150-character limit, Amazon's per-category title guidance), bullet points exist on some channels and not others, and images may need different backgrounds or sizes. Channel-specific content is stored per channel, derived from the master by default and overridden where a person improved it.

The output of the mapping is a document per listing per channel, and its hash is the cheapest way to know whether anything changed: if the hash of the rendered document equals the hash last accepted, there's nothing to send.

## Inventory and Price Sync

Content changes weekly; stock and price change by the minute. Availability per channel is computed from the same quantities and published with a buffer sized to the channel's lag and its penalty for oversells ([Safety Stock and Channel Buffers](/books/commerce/inventory#safety-stock-and-channel-buffers), [Sync Across Channels](/books/commerce/inventory#sync-across-channels)). Three listing-specific rules:

- **Send absolute quantities per listing,** never deltas, and keep the last value sent and its acknowledgment, so a lost update is corrected by the next one and the lag is measurable.
- **Price is per channel, within the rules of every channel.** A price can differ by channel (fees differ, and so do competitors), but Walmart unpublishes offers "priced egregiously higher" than elsewhere and Google requires the feed to match the landing page, so a price change is checked against every channel's rule before it is published to any of them.
- **FBA and WFS stock aren't the merchant's to publish.** Stock in a marketplace's network is published by the marketplace for its own listings; the merchant's job there is replenishment, and its own quantity on the same channel (for seller-fulfilled offers) must exclude it.

## Errors and Suppression

Most of the engineering in a listing integration is error handling, because most errors aren't failures of the integration. A useful classification, applied to every issue the channel returns:

| Class | Example | Who fixes it | Retry? |
| --- | --- | --- | --- |
| **Data: missing or invalid attribute** | Amazon `MISSING_ATTRIBUTE`, a value outside the enumeration | The catalog owner, by fixing the item or the mapping | No; resubmit after the fix |
| **Content policy** | A prohibited claim in a title, an image with text | Merchandising or compliance | No |
| **Price or offer rule** | Amazon `INVALID_PRICE`, Walmart "Reasonable Price Not Satisfied" | Pricing | No |
| **Approval or gating** | A restricted category or brand the account isn't approved for | The account owner, by applying | No |
| **Schema change** | A newly required attribute after a product type update | The integration owner, by updating the mapping | No |
| **Transient** | A 429, a 5xx, a processing timeout | Nobody; the system | Yes, with backoff ([Exponential Backoff With Jitter](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter)) |

The rules that follow:

- **Route each issue to the person who can fix it,** by class, and show it against the item in the brand's catalog, not in a log. A catalog manager fixes a missing attribute once on the item, and every channel's next submission picks it up.
- **Deduplicate by item, channel and issue code.** The same missing attribute on 3,000 SKUs is one problem with a count, not 3,000 tickets; it's usually a mapping fault.
- **Distinguish suppression from rejection.** A rejected submission never took effect; a suppressed listing was live and was hidden later, which loses sales now and is the higher priority.
- **Retry only the transient class,** and make every submission idempotent by sending the full desired state of the listing (or a patch computed from the last accepted state), so a retried request can't apply twice ([Partial Failure](/docs/requests/bulk-operations#partial-failure)).
- **Measure it:** listings by state per channel, issues opened and closed per day by class, and the time from a catalog change to the channel showing it.

## Feed Management Tools

Most brands don't build all of this. The tools fall into three groups:

- **Marketplace and feed platforms** that keep one catalog and publish it to many channels with templates, rules and an error console: Rithum, whose products include ChannelAdvisor and the Dsco drop-ship network, says it manages listings "across 600+ marketplaces in the Rithum network" for "more than 40,000 of the world's largest brands and retailers," with marketplace listings, inventory and order management, product feeds and retail media in one place ([Who Owns Whom](/books/commerce/commerce-landscape#who-owns-whom-recent-moves)).
- **Feed services** that clean, enrich and transform product data for ad channels, marketplaces and now AI surfaces, often as a managed service: Feedonomics, part of Commerce.com alongside BigCommerce, offers feeds for "2,000+ destinations" with a "Dedicated feed manager" and "Hands-on implementation."
- **Platform connectors** built into the commerce platform: Shopify's Marketplace Connect is the route by which Shopify merchants apply to Target Plus, and most platforms offer Amazon, Walmart and eBay connectors of varying depth.

Buying moves the mapping and error handling into the tool; it doesn't remove the need for clean catalog data, and it adds a system of record question: when the tool and the commerce platform disagree on a listing's price or content, which one wins? My rule: the catalog (PIM or platform) owns product facts, the pricing system owns price, the inventory system owns quantity, and the feed tool owns only the rendering and the channel's state, recorded in `connected_systems` ([The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it)).

## Resellers and Agencies

Some brands hand the whole channel to a partner. Agencies run the brand's own seller account for a fee. Resellers go further and buy the inventory: Pattern says "one of the best ways to monetize our technology and expertise is by purchasing products from our brand partners and selling those products to consumers on global marketplaces," across "more than 70 marketplaces" in "more than 100 countries," for "more than 200 brand partners," and "we derived 93% of our revenue from consumer product sales on Amazon" in 2025. Its agreements rely on "enforcing exclusivity provisions," and "a substantial portion" of them allow "termination for convenience upon 60 days' notice."

For the brand, a reseller turns a marketplace channel into a wholesale customer: the brand's order is the reseller's purchase order, its revenue is the wholesale price, and the marketplace's fees, ads and returns are the reseller's problem inside its margin. The brand gives up the price, the customer data and the account, and in exchange gets one buyer and no marketplace operations. It still needs the listing content to be right, because it's the brand's name on the page, and it needs the exit plan the 60-day clause implies: who owns the listings, their review history and the account when the partner leaves. Pattern's filing notes that "In the past, we have experienced account suspensions," which is a risk the brand inherits without control. In the data model the reseller is a `companies` row with a price list and the channel is wholesale; the marketplace listing, if the brand tracks it at all, is an observation, not a listing it manages.

## How to Build It

The core `listings` row is the item on a channel. Multichannel listing adds what was sent, what came back, and the mappings that produce the documents:

```sql
ALTER TABLE listings
  ADD COLUMN product_type        TEXT,    -- the channel's type: Amazon product type, Walmart spec category
  ADD COLUMN schema_version      TEXT,    -- the definition version last validated against
  ADD COLUMN content_hash        TEXT,    -- hash of the last accepted facts document
  ADD COLUMN terms_hash          TEXT,    -- hash of the last accepted price and quantity
  ADD COLUMN channel_status      TEXT,    -- raw, e.g. 'BUYABLE,DISCOVERABLE', 'PUBLISHED'
  ADD COLUMN match_mode          TEXT CHECK (match_mode IN ('create', 'offer_only')),
  ADD COLUMN published_quantity  INT,     -- the last quantity the channel acknowledged
  ADD COLUMN published_price     BIGINT,  -- minor units, as the channel shows it
  ADD COLUMN last_synced_at      TIMESTAMPTZ;

CREATE TABLE channel_category_mappings (  -- brand category to channel category and type
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id       TEXT NOT NULL REFERENCES sales_channels (id),
  category_id      UUID,                  -- the catalog's category (Product Information)
  item_id          UUID REFERENCES items (id),  -- an override for one item
  channel_category TEXT NOT NULL,         -- e.g. Google product category ID, eBay category
  product_type     TEXT,                  -- e.g. Amazon product type
  attribute_map    JSONB NOT NULL DEFAULT '{}',  -- channel field -> catalog attribute and transform
  valid_during     TSTZRANGE NOT NULL,
  CHECK (category_id IS NOT NULL OR item_id IS NOT NULL)
);

CREATE TABLE feeds (                     -- a configured outbound feed to one channel account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  channel_id          TEXT NOT NULL REFERENCES sales_channels (id),
  kind                TEXT NOT NULL CHECK (kind IN ('content', 'offer', 'inventory', 'price',
                        'full')),
  transport           TEXT NOT NULL CHECK (transport IN ('item_api', 'bulk_feed', 'file',
                        'tool')),        -- 'tool': Rithum, Feedonomics or a platform connector
  format              TEXT NOT NULL,     -- 'JSON_LISTINGS_FEED', 'MP_ITEM', 'merchant_api'
  spec_version        TEXT,              -- e.g. Walmart '5.0.20241118-04_39_24'
  schedule            TEXT,              -- cron for full refreshes; null for change-driven
  status              TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired'))
);

CREATE TABLE feed_runs (                 -- one submission: a feed file or a batch of API calls
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  feed_id       UUID NOT NULL REFERENCES feeds (id),
  external_ref  TEXT,                    -- the channel's feed or submission ID
  item_count    INT NOT NULL,
  payload_ref   TEXT NOT NULL,           -- object storage key of what was sent
  status        TEXT NOT NULL CHECK (status IN ('building', 'submitted', 'processing',
                  'done', 'done_with_errors', 'failed')),
  accepted      INT,
  rejected      INT,
  submitted_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  result_ref    TEXT                     -- the channel's processing report, as received
);

CREATE TABLE listing_errors (            -- one issue on one listing, open until resolved
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id     UUID NOT NULL REFERENCES listings (id),
  feed_run_id    UUID REFERENCES feed_runs (id),  -- null: from a notification or report
  source         TEXT NOT NULL CHECK (source IN ('submission', 'notification', 'report',
                   'validation')),       -- 'validation': caught by us before sending
  severity       TEXT NOT NULL CHECK (severity IN ('error', 'warning')),
  class          TEXT NOT NULL CHECK (class IN ('data', 'content_policy', 'price_rule',
                   'approval', 'schema_change', 'transient')),
  code           TEXT NOT NULL,          -- the channel's issue code, as reported
  message        TEXT NOT NULL,
  attributes     TEXT[] NOT NULL DEFAULT '{}',
  suppresses     BOOLEAN NOT NULL DEFAULT FALSE,  -- the listing was hidden because of it
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ,
  resolved_by    TEXT                    -- 'channel_cleared', 'resubmitted', 'ended'
);
CREATE UNIQUE INDEX ON listing_errors (listing_id, code) WHERE resolved_at IS NULL;
```

The work queue is a query, grouped so that one mapping fault is one row:

```sql
-- Open blocking issues by channel, class and code, worst first.
SELECT l.channel_id, e.class, e.code, min(e.message) AS example,
       count(*) AS listings, count(*) FILTER (WHERE e.suppresses) AS suppressed,
       min(e.first_seen_at) AS oldest
FROM listing_errors e
JOIN listings l ON l.id = e.listing_id
WHERE e.resolved_at IS NULL AND e.severity = 'error' AND e.class <> 'transient'
GROUP BY l.channel_id, e.class, e.code
ORDER BY suppressed DESC, listings DESC;
```

Design notes:

- **Changes go through an outbox.** A catalog, price or stock change emits an event; each channel adapter renders the listing, compares hashes and sends only what changed, batched to the channel's limits ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). Full refreshes run on a schedule as a safety net.
- **Validate locally first.** Product type definitions and specs are stored by version, and every rendered document is validated against them before it is sent; failures are `listing_errors` with `source = 'validation'`, which costs no API calls and names the cause.
- **Keep what was sent and what came back.** `feed_runs.payload_ref` and `result_ref` are the bytes, so a dispute about what a listing said on a date, or a channel's claim that a field was missing, can be answered.
- **An issue is open until the channel clears it.** Resubmitting doesn't resolve an issue; the next accepted submission or a notification without it does.
- **Terms and facts sync separately.** Price and quantity patches run continuously and are rate-limited per operation; content runs on change and in bulk. A content failure must never block a price or stock update for the same listing.
- **Tools are connected systems.** When a feed tool publishes, `feeds.transport = 'tool'`, and the tool's status and errors are imported into the same tables so the brand has one view.

## Auditing

- **Every submission.** The document or feed as sent, the channel's response or processing report as received, the schema or spec version it was validated against, and who or what triggered it.
- **Every listing state change,** from the channel's status and notifications, with timestamps, so the hours a listing was suppressed can be counted.
- **Every issue,** opened, deduplicated, routed and resolved, with the fix that resolved it.
- **Every published price and quantity** with the acknowledgment, which is the evidence for a pricing-rule dispute or an oversell investigation.
- **Every mapping change,** because a mapping edit can change thousands of listings at once.

## What This Means for the System You Build

- **Map per channel per product type,** with category defaults and item overrides, and store each channel's schema by version.
- **Separate product facts from sales terms,** and sync them on different paths and schedules.
- **Validate against the channel's schema before sending,** and treat every submission as asynchronous until the channel's state confirms it.
- **Use the item API for changes and bulk feeds for loads,** and move off removed formats (Amazon's flat files, Google's Content API) on the channels' calendars.
- **Classify every issue by who can fix it,** deduplicate by code, prioritize suppressions and retry only transient errors.
- **Send absolute quantities and channel-checked prices,** and record the last values each channel acknowledged.
- **Keep the system of record per object explicit** when a feed tool sits in the middle.
- **Treat a reseller as a wholesale customer,** and plan the exit the termination clause allows.

## References

**Amazon**

- [SP-API: Listings Items API v2021-08-01 reference](https://developer-docs.amazon/sp-api/docs/listings-items-api-v2021-08-01-reference), the API's purpose and its pairing with Product Type Definitions
- [SP-API models: Listings Items v2021-08-01](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/listings-items-api-model/listingsItems_2021-08-01.json), operations, validation preview, requirements, submission statuses, issue severities and categories, listing statuses, patch operations and rate limits
- [SP-API: Building listings management workflows](https://developer-docs.amazon/sp-api/docs/building-listings-management-workflows-guide), JSON_LISTINGS_FEED limits and use, offer-only listings, the meta-schema and listings notifications
- [SP-API: Deprecations](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations), the flat-file and XML feed types deprecated March 18, 2024 and removed December 3, 2025

**Walmart**

- [Walmart Developer: Item management API overview](https://developer.walmart.com/us-marketplace/docs/item-management-api-overview), the setup steps and submit and publish timing
- [Walmart Developer: Item spec versions (updated April 12, 2026)](https://developer.walmart.com/us-marketplace/docs/item-spec-versions), feed types and current spec versions
- [Walmart Developer: Introduction to Marketplace APIs](https://developer.walmart.com/us-marketplace/docs/introduction-to-marketplace-apis), OAuth 2.0 and token lifetime

**Google**

- [Google Merchant Center: Product data specification](https://support.google.com/merchants/answer/7052112?hl=en), required attributes, lengths, availability values, price and tax rules, categories and the image requirement from January 31, 2027
- [Google: Merchant API overview](https://developers.google.com/merchant/api/overview), the redesign of the Content API, its August 18, 2026 sunset and progressive errors from September 1, 2026, and product inputs

**eBay and Etsy**

- [eBay Developers: Inventory API overview](https://developer.ebay.com/api-docs/sell/inventory/overview.html), inventory items and offers
- [Etsy Developers: Open API v3](https://developers.etsy.com/documentation/), listings, inventory and OAuth

**Tools and partners**

- [Rithum](https://www.rithum.com/), 600+ marketplaces, 40,000 brands and retailers, and its products
- [Feedonomics](https://feedonomics.com/), 2,000+ destinations and the full-service model
- [Pattern Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1811935/000181193526000013/ptrn-20251231.htm), the reseller model, brand partners, marketplaces, Amazon's share of revenue, exclusivity, termination for convenience and account suspensions
- [Target: Target Plus and Shopify (June 24, 2024)](https://corporate.target.com/news-features/article/2024/06/target-plus-shopify), applications through Shopify
