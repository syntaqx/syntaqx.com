+++
title = "Replatforming & Migration"
nav_title = "Replatforming"
description = "Moving a store between platforms: what migrates, passwords, gift cards, subscriptions and card tokens, redirects and SEO, integrations, cutover and checks."
category = "Commerce Industry"
order = 2364
part = "Running the Platform"
tags = ["commerce", "replatforming", "migration", "seo", "data-model", "cutover"]
+++

Every store eventually moves. A brand outgrows WooCommerce and moves to Shopify; a retailer leaves Magento 1 or Salesforce Commerce Cloud for something cheaper to run; a Shopify Plus merchant goes headless or to commercetools; a business builds its own after years on someone else's. The catalog is the easy part. The hard parts are the records that carry obligations: customers who expect to sign in, gift cards and store credit that are money owed, subscriptions that renew next Tuesday on a card the new platform has never seen, reviews with dates and verified badges, order history that support and returns still need, and a decade of URLs that search engines and old emails still point at. A migration that moves the products and loses any of those is a migration the customers notice.

This chapter covers moving a store between Shopify, BigCommerce, Adobe Commerce, Salesforce Commerce Cloud, WooCommerce, commercetools and custom builds, as of October 2026: what each platform imports and exports, what migrates object by object, the cutover plan, SEO preservation, rewiring apps and integrations, and validating the result. The general method (crosswalks, loading with side effects off, dark launches, reconciliation, cutover and rollback windows, archives) is the playbook's [Replacing Systems](/docs/architecture/replacing-systems), and site moves for search are [Site Migrations](/docs/frontend/seo#site-migrations). Moving stored card numbers between processors is the Payments volume's [Switching Processors](/books/payments/switching-processors), and choosing the destination is [Choosing & Hosting a Store](/books/commerce/choosing-a-platform). The chapter extends `export_runs`, `url_redirects` and [ERP & Integrations](/books/commerce/erp-and-integrations#mapping-ids)' `record_mappings` and adds `migration_batches`, `migration_checks` and `token_migrations`. The health care version, where the legal medical record must survive the switch, is [Data Migration & Conversions](/books/health-tech/data-migration-and-conversions).

## How the Platforms Do It

As of October 2026, from each platform's own documentation:

| Platform | Ways in | What it says doesn't move, or moves specially | Notes |
| --- | --- | --- | --- |
| **Shopify** | Store Migration app, CSV, migration apps, Partners, and the Customer, Order, Transaction, Gift Card, Blog, Article and Page APIs; import order "products first, then customers, then historical orders" | Stored payment methods: token migration "on all Shopify plans" through the subscription app, card number migration only on Plus or Enterprise through Professional Services | URL redirects by CSV, up to 100,000 on standard plans and 20,000,000 on Plus; new customer accounts sign in with a one-time code, "A password isn't required to sign in" |
| **BigCommerce** | Data Migration app (free "up to 500,000 total records across products, customers, and orders"), CSV, API, Data Migration Services | "Passwords cannot be migrated for PCI compliance"; payment tokens only by API or Data Migration Services; storefront design can't move; orders and reviews not by CSV | Coupon codes by app or API |
| **Adobe Commerce (Magento)** | Data Migration Tool for Magento 1 to 2, in settings, data and delta modes "in particular order" | Delta mode carries "data added after main migration" for core modules only; extension tables need their own delta configuration | Triggers on the source database track changes for the delta |
| **Salesforce B2C Commerce** | Business Manager and batch imports of XML files that must match its schemas | "Commerce for B2C doesn't import data that updates existing orders" | Customer records import and export; orders flow out to an OMS |
| **WooCommerce** | Built-in product CSV importer, which updates rows matched "by `ID` or `SKU`"; extensions and the REST API for the rest | Customers and orders aren't in the built-in importer | Self-hosted, so a direct database migration is possible |
| **commercetools** | Import API and its customer import guidance | Recommends migrating passwords gradually: keep the old hash, check it on first sign-in, then set the password natively | Advises against a forced reset, which "can give them the impression that there may have been a security problem" |
| **Stripe** (stored cards) | PAN import from another processor, by encrypted file over SFTP | CVCs, data the old processor never stored, and subscriptions and invoices don't come with the cards | Returns a mapping file of old to new IDs; "typically complete within 10 business days" after valid data arrives |

Three patterns run through the table:

- **Credentials move by special process or not at all.** Every platform refuses password hashes or card numbers through its ordinary import, for the same security reasons, and offers a slow path (sign-in migration, tokens moved processor to processor) or none.
- **History imports without side effects, or not at all.** Platforms import orders as history and some won't import updates to them; a migrated order is a record, not a new sale.
- **Redirects are the merchant's job.** Every platform accepts a redirect list; none can know the old URLs, so the map is built from the old store's own data and logs.

## What Migrates, Object by Object

| Object | How it moves | What to watch |
| --- | --- | --- |
| **Products, variants, options** | Export, transform, import with handles and SKUs preserved | Each platform's option and variant limits; bundles and kits that one models natively and another as apps ([Products, Variants & Bundles](/books/commerce/products-and-variants)) |
| **Attributes, categories, collections** | Mapped field by field to the new attribute model and taxonomy | Rule-based collections re-expressed as rules, not frozen as lists ([Collections and Category Pages](/books/commerce/site-search-and-merchandising#collections-and-category-pages)) |
| **Media** | Originals copied with their placements and alt text | CSV exports can omit images; rights and generated-content labels travel with the file ([Images and Media](/books/commerce/product-information#images-and-media)) |
| **Prices and price lists** | Base, sale, market and B2B lists, with effective dates | Compare-at prices need their history to stay lawful ([Price History](/books/commerce/pricing#price-history)) |
| **Customers and addresses** | Imported with their source IDs, merged duplicates resolved first | Marketing consent must move with its evidence, never be recreated as "subscribed" ([Marketing Consent](/books/commerce/customers-and-accounts#marketing-consent)) |
| **Passwords** | Not through any import; sign-in migration or reset | Below |
| **Orders** | Imported as historical, closed records with original dates, lines and charges | Side effects off; open orders finished on the old system or moved deliberately |
| **Gift cards and store credit** | Created with the same codes and balances | A liability to the cent, below |
| **Loyalty balances** | Moved as opening ledger entries with their tier status | Points are a deferred revenue liability ([Memberships & Loyalty](/books/commerce/memberships-and-loyalty)) |
| **Subscriptions** | Recreated as contracts with their next dates, prices and plan versions | Below, with stored payment tokens |
| **Stored payment methods** | Processor to processor, or by token migration into the new platform's gateway | Below |
| **Reviews** | Imported with original dates, ratings, media and verified status | Never improved in transit, below |
| **Discount codes** | Recreated with remaining uses and limits | One-per-customer limits need the redemption history to hold |
| **URLs** | A redirect for every old path that ever served content | Below |
| **Content pages and blogs** | API import or rebuild | Not covered by some platforms' apps or CSV |
| **Tax exemption certificates, B2B companies and terms** | Moved with their documents and expiry dates | An exempt buyer charged tax after a move is a refund and an apology ([Exemption Certificates](/books/commerce/sales-tax-vat-and-duties)) |
| **Inventory** | Counts per location set at cutover from the warehouse or 3PL, not copied from the old platform | The WMS is the source of truth for counts ([Inventory](/books/commerce/inventory)) |

## Catalog and IDs

The catalog moves first because everything else points at it: order lines at items, reviews at products, subscriptions at items, redirects at products. Three rules make it work:

- **Keep handles and SKUs.** The product's URL handle and each variant's SKU are the keys people, feeds and integrations use; a migration that renames them breaks redirects, marketplace listings and the 3PL's item master at once. Where the new platform's rules force a change (character limits, uniqueness scope), the old value goes in the crosswalk and a redirect is written.
- **A crosswalk per object.** Every imported record keeps a link to its source ID in a crosswalk row, never a `legacy_id` column ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)); the store's own IDs stay its own, so the next migration is easier than this one.
- **External IDs come along.** Marketplace listing IDs, ERP item numbers and 3PL SKUs in `items.external_refs` move with the item, so channels and integrations reconnect to the same records ([External IDs are a map](/books/commerce/commerce-business#the-core-data-model)).

## Customers and Passwords

Password hashes don't move between platforms. BigCommerce states that "Passwords cannot be migrated for PCI compliance"; Shopify's migration guide doesn't offer it; the identity side is the playbook's [Identities and Passwords](/docs/architecture/replacing-systems#identities-and-passwords). Three ways to handle customers who had accounts:

- **Passwordless on the new platform.** Shopify's new customer accounts sign in with an emailed one-time code, so there's no password to migrate: the customer enters their email and is in. This is the least friction where the destination supports it.
- **Migrate on sign-in.** On a platform that lets the merchant control sign-in (commercetools, a custom build, or a front end with its own identity layer), import each customer with a random password and the old hash in a protected field; at the first sign-in, verify the entered password against the old hash with a tested reimplementation of the old algorithm, set it natively, and clear the old hash. commercetools recommends exactly this and recommends against forcing resets. Customers who never return are reset at the end and the remaining old hashes deleted.
- **Invite or reset.** Send an account invitation or reset after cutover, in batches through the same outbound gate as any email, with wording that explains the move so it doesn't read as a breach notice.

Customer records carry obligations of their own: marketing consent with its timestamp and source, privacy requests in flight (a deletion requested last week must not be reimported), and suppression lists, which move before the first campaign from the new platform ([Privacy Law](/books/commerce/customers-and-accounts#privacy-law)).

## Orders and History

Order history moves for support, returns, customer accounts, reorder flows and analytics. It moves as history:

- **Load with side effects off.** An imported order that sends a confirmation email, decrements inventory, creates a fulfillment request, fires an `orders/create` webhook to every app or posts to the ERP is a disaster at scale ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)). Importers on hosted platforms typically suppress notifications; apps listening to webhooks may not, so disconnect them or filter on a migration tag.
- **Original dates, snapshots and charges.** Each order keeps its placed date, line snapshots, discounts, shipping, tax and refunds as they were, so a return or a tax audit after the move reads the same order ([Snapshots on the line](/books/commerce/commerce-business#the-core-data-model)).
- **Open orders are a decision.** Orders placed but not shipped at cutover are either finished on the old system (the simplest) or moved with their fulfillment state and payment authorizations, which rarely survive a processor change ([Reauthorization](/books/commerce/taking-payment)). Most migrations drain open orders on the old system and start new ones on the new.
- **Some platforms won't update imported orders.** Salesforce B2C Commerce skips imported data that would update an existing order, so a delta that changes an order's status must be designed for the destination's rules.

The financial record isn't the order import: payouts, refunds and disputes stay in the processor's and the accounting system's records, and the archive of the old platform keeps what the import couldn't carry ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).

## Gift Cards, Store Credit and Loyalty

An outstanding gift card is money the merchant owes, subject to the CARD Act's expiration rules, state law and unclaimed property ([Gift Cards and Store Credit](/books/commerce/promotions-and-gift-cards#gift-cards-and-store-credit)). It moves with:

- **The same code.** Customers hold the code on paper and in email; Shopify's `giftCardCreate` accepts a supplied code ("If you don't provide a code, the system generates a random 16 character alphanumeric code"), and imports that can't preserve codes mean reissuing cards and telling every holder.
- **The balance, the issue date and the expiry,** so the federal five-year minimum and state rules keep running from the original issue date.
- **The ledger total reconciled.** The sum of migrated balances equals the old platform's outstanding liability and the general ledger's, to the cent, before cutover; after cutover, cards used on the old system in the final window are re-synced by delta.

Store credit and loyalty points follow the same rule: opening balances as ledger entries, totals reconciled to the liability, tier status with the activity that earned it.

## Subscriptions and Stored Payment Tokens

A subscription business moves its subscribers or loses them. Each subscription has a schedule, a price and plan version, an address, a next date and a stored payment method, and every one of them has to arrive intact:

- **Cards move between processors, not platforms.** Stripe imports card data from another processor by encrypted file and exports it only to another PCI DSS Level 1 processor; the importing processor returns a mapping file from old customer and card IDs to new ones ([Moving Card Numbers](/books/payments/switching-processors#moving-card-numbers)). Shopify supports token migration on all plans through the subscription app and card number migration on Plus or Enterprise, and lets a merchant keep the old gateway connected as a secondary gateway that bills existing contracts while customers move over as they update details, which "can take months or even years." Request the export first: Stripe notes processors "can take anywhere from a few days to several months to produce a final export."
- **Contracts are recreated, with their dates.** Shopify's flow is to create customers, add products, import or set up payment methods, then "Recreate subscription contracts using Shopify's APIs." The next renewal date, the price locked for the subscriber, the plan version and any prepaid cycles come across exactly; a contract recreated "starting today" bills a prepaid subscriber twice and resets the renewal notice clock ([Recurring Schedules and Dunning State](/books/payments/switching-processors#recurring-schedules-and-dunning-state), [Prepaid Plans and Their Accounting](/books/commerce/subscription-commerce#prepaid-plans-and-their-accounting)).
- **Stop the old billing first.** The old app's renewals are paused for each cohort before the new platform's start, or customers are charged twice; Stripe's migration guide says to cancel the previous subscriptions "as soon as your Stripe subscriptions become active or you'll bill your customers twice."
- **Expect declines from the new merchant ID.** Issuers may not recognize the new MID, and Stripe recommends ramping volume, customer-initiated before recurring ([Watching Declines After Cutover](/books/payments/switching-processors#watching-declines-after-cutover)). The first renewal run after a move is the one to watch hour by hour.
- **Notices and consent come along.** The subscriber's recorded consent and the renewal notices owed under state auto-renewal laws are records the new system needs on day one; a migration isn't a reason to send a new consent request or to skip a notice ([Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law)).

## Reviews

Reviews move to the new platform or review app with their original ratings, text, media, dates, reviewer names as displayed and verified-purchase status, linked to the migrated products through the crosswalk in `record_mappings` ([Reviews & Ratings](/books/commerce/reviews-and-ratings#how-to-build-it), where imported reviews carry `source = 'imported'`). What doesn't change in transit is the content: dropping the negative ones during a migration is review suppression, which the FTC's rule treats as misrepresenting the reviews that remain ([Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule)), and marking imported reviews "verified" when the new system can't verify them misstates what the badge means.

## URLs, Redirects and SEO

The redirect map is built before launch from everything the old store ever served: the old platform's product, collection, page and blog URLs, its own redirect list, the sitemap, analytics landing pages and the server or CDN logs of the last year, which catch the URLs no export lists. Each old path maps to its new equivalent, not to the home page ([Out of Stock, Discontinued and Seasonal Pages](/books/commerce/storefronts#out-of-stock-discontinued-and-seasonal-pages)). The rules from search engines and platforms:

- **Permanent, server-side redirects, kept for a long time.** Google's site move guidance is to "Use server side permanent redirects if technically possible," and to keep them "for as long as possible," generally at least a year; my default is forever, since old links arrive for years ([Status Codes and Redirects](/docs/frontend/seo#status-codes-and-redirects)).
- **Expect a dip.** Google warns of "temporary fluctuation in site ranking during the move," and says a small to medium site "can take a few weeks for most pages to move." A migration scheduled the month before peak season has no time to recover ([Peak Season & Drops](/books/commerce/peak-season)).
- **Know the destination's redirect rules.** Shopify redirects only from paths that no longer load a page ("the URL still loads a valid webpage, then the URL redirect won't work"), warns that URLs with query strings "might not work as expected," and caps redirects at 100,000 on standard plans; a large catalog with years of history may need Plus or a redirect layer at the CDN.
- **Change of Address only for a new domain.** Google's tool is needed "only... when moving from one domain or subdomain to another," not for a platform move on the same domain.
- **Carry the rest of the SEO.** Titles, meta descriptions, canonical tags, structured data, image alt text and hreflang for international stores, compared page by page on a crawl of the old and new sites ([Site Migrations](/docs/frontend/seo#site-migrations)).

Every redirect lands in `url_redirects` with `reason = 'replatform'` ([Storefronts](/books/commerce/storefronts#how-to-build-it)), and the new storefront's 404 log is read daily for the first weeks; each 404 with traffic is a missing row.

## Apps and Integrations

A store is a hub of connections, and a migration has to reconnect every one: payments, tax, shipping and labels, the 3PL or WMS, the ERP, marketplaces and feeds, email and SMS, reviews, loyalty, subscriptions, returns, search, fraud screening, analytics and advertising pixels. Start from the `connected_systems` inventory ([The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it)) and decide for each one whether it has a connector for the new platform, needs rebuilding or is replaced:

- **Systems of record stay put.** If the ERP owns items and costs and the WMS owns counts, the new platform is connected as a consumer of both, and the migration loads only what the platform owns ([System of record is data](/books/commerce/commerce-landscape#how-to-build-it)).
- **Marketplaces reconnect to the same listings.** A listing tool or marketplace integration is re-pointed at the new platform with the same seller SKUs, so the channel sees an update, not a new catalog that duplicates listings ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing)).
- **Webhooks and pixels are re-registered.** Each app subscribes to the new platform's events; conversion pixels and server-side events are reinstalled and tested before cutover, or the first week's attribution is lost.
- **Credentials are new.** API keys, OAuth grants and app installations don't move; each is re-authorized and stored in the secrets manager under the new connected system ([Secrets](/docs/operations/environments#secrets)).
- **Test orders run through everything.** Before cutover, orders placed on the new platform must reach the 3PL, the ERP, the tax engine's filing records and the email platform, and come back with tracking; a test order is the cheapest integration test there is.

The order-to-ERP and inventory mappings themselves are [ERP & Integrations](/books/commerce/erp-and-integrations#what-syncs-where).

## Cutover Plans

The playbook's phases apply ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)); a store's version, for a big-bang move (one cutover for the whole store, the usual case for a single storefront):

1. **Months before:** inventory of data, apps and integrations; request processor exports; build and test the transforms; first full load into the new platform with side effects off; the redirect map; integrations rebuilt.
2. **Weeks before:** a second full load and reconciliation; SEO crawl comparison; test orders end to end; staff trained; customer communications written. Schedule away from peak season and major promotions.
3. **Cutover window** (low-traffic hours, announced): freeze catalog and content edits on the old store; take the final delta of customers, orders, gift card activity and subscriptions; pause old subscription billing and scheduled jobs; switch DNS or the storefront route; enable redirects; reconnect integrations; reconcile counts and balances.
4. **Rollback window:** the old store kept intact and paused, not deleted, for a written period; orders taken on the new store logged so a rollback can carry them back.
5. **After:** daily 404 and search-console review, the first subscription renewal run watched, declines watched, old platform's data archived with its audit logs, then the old store closed.

Larger merchants move in phases instead: a market, a brand or a storefront at a time, or headless front ends cut over by route while the backend moves underneath ([Strangle Instead of Rewriting](/docs/architecture/replacing-systems#strangle-instead-of-rewriting), [Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel)). Phased moves need the crosswalk and the inventory sync to work in both directions for as long as both platforms sell.

## Validation and Reconciliation

A migration is done when it's proven, not when the import finishes ([Reconciliation](/docs/architecture/replacing-systems#reconciliation)). The commerce checks:

- **Counts by object and status:** products by status, variants, active customers, consenting subscribers by channel, open subscriptions by plan, reviews by rating, redirects; old against new, every difference explained.
- **Sums to the cent:** outstanding gift card balances, store credit, loyalty points, and historical order totals by month, against the old platform and the general ledger.
- **Next dates:** every subscription's next renewal date and amount, in both systems.
- **Credentials:** every active subscription has a payment method in the new system, matched through the processor's mapping file with last four digits and expiry.
- **URLs:** every old URL with traffic or links in the past year resolves in one hop to a page that returns 200.
- **Samples read by a person:** a few dozen products, customers, orders and subscriptions end to end, including the oddest (bundles, B2B accounts, prepaid subscriptions, partially refunded orders, gift cards with partial balances).

Reconciliation is a gate: cutover happens when the checks pass and someone with authority approves the report, and the approval is kept with the batches it covered.

## How to Build It

The playbook's migration batches, specialized for a store, with the crosswalk reused from [ERP & Integrations](/books/commerce/erp-and-integrations#how-to-build-it): an old platform is one more connected system, and its IDs map to the store's records in `record_mappings` exactly as an ERP's do ([Mapping IDs](/books/commerce/erp-and-integrations#mapping-ids)). Token migrations and the reconciliation gate are new:

```sql
CREATE TABLE migration_batches (         -- one load from one source, as the playbook defines it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  source_system_id UUID NOT NULL REFERENCES connected_systems (id),  -- the old platform
  export_run_id   UUID REFERENCES export_runs (id),  -- the export this batch loaded
  entity          TEXT NOT NULL,         -- 'products', 'customers', 'orders', 'gift_cards'
  cohort          TEXT NOT NULL DEFAULT 'all',
  kind            TEXT NOT NULL CHECK (kind IN ('full', 'delta', 'rerun')),
  input_sha256    BYTEA NOT NULL,
  mapping_version TEXT NOT NULL,         -- the transform code and mappings, in version control
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  created_count   INT,
  updated_count   INT,
  rejected_count  INT
);

-- ERP & Integrations' record_mappings is the crosswalk: the old platform is a connected
-- system, local_id is the new platform's record, external_id the old platform's ID, as it wrote it.
ALTER TABLE record_mappings
  ADD COLUMN migration_batch_id UUID REFERENCES migration_batches (id);  -- null for live syncs

CREATE TABLE token_migrations (          -- stored payment methods moved processor to processor
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id        UUID NOT NULL REFERENCES merchants (id),
  from_processor     TEXT NOT NULL,
  to_processor       TEXT NOT NULL,
  method             TEXT NOT NULL CHECK (method IN ('pan_transfer', 'token_migration',
                       'secondary_gateway')),  -- the last: old gateway bills until customers move
  requested_at       TIMESTAMPTZ NOT NULL,
  export_received_at TIMESTAMPTZ,
  approved_by        TEXT,               -- who approved the importer's validation summary
  mapping_file_ref   TEXT,               -- object storage key of the returned mapping file
  methods_expected   INT,
  methods_mapped     INT,
  status             TEXT NOT NULL CHECK (status IN ('requested', 'exporting', 'validating',
                       'imported', 'mapped', 'closed', 'failed'))
);

CREATE TABLE migration_checks (          -- the reconciliation gate, check by check
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  check_key     TEXT NOT NULL,           -- 'gift_card_liability', 'active_subscriptions',
                                         -- 'next_renewal_dates', 'redirect_coverage'
  batch_ids     UUID[] NOT NULL,
  expected      NUMERIC NOT NULL,        -- from the old platform or the ledger
  actual        NUMERIC NOT NULL,        -- from the new tables, read independently of the loader
  passed        BOOLEAN NOT NULL,
  explanation   TEXT,                    -- required when passed is false and accepted
  run_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by   TEXT
);
```

Gift card liability, old against new, from the crosswalk and the ledger the promotions chapter keeps:

```sql
-- :old_total is the old platform's outstanding balance report, by currency.
SELECT g.currency,
       SUM(t.balance)                       AS migrated_liability,
       :old_total                            AS old_platform_liability,
       SUM(t.balance) - :old_total           AS difference
FROM record_mappings m
JOIN gift_cards g ON g.id = m.local_id
JOIN LATERAL (
  SELECT SUM(amount) AS balance
  FROM gift_card_transactions gt WHERE gt.gift_card_id = g.id) t ON TRUE
WHERE m.object = 'gift_card' AND m.connected_system_id = :old_platform
GROUP BY g.currency;
```

Active subscriptions without a mapped payment method, the list to resolve before the first renewal run:

```sql
-- The processor's mapping file rewrites payment_method_ref to the new processor's ID at
-- load; a ref still in the old processor's format was never mapped.
SELECT s.id, s.customer_id, s.next_order_at, s.payment_method_ref
FROM subscriptions s
JOIN record_mappings m ON m.object = 'subscription' AND m.local_id = s.id
                      AND m.connected_system_id = :old_platform
WHERE s.status = 'active'
  AND (s.payment_method_ref IS NULL
       OR s.payment_method_ref LIKE :old_processor_prefix || '%')
ORDER BY s.next_order_at;
```

Old URLs with traffic and no redirect or live page, from the log-derived list of old paths:

```sql
-- old_paths(path, hits_last_year) is loaded from the old store's logs and sitemap.
SELECT op.path, op.hits_last_year
FROM old_paths op
LEFT JOIN url_redirects r ON r.storefront_id = :storefront AND r.from_path = op.path
LEFT JOIN products p ON '/products/' || p.handle = op.path AND p.status = 'active'
WHERE r.id IS NULL AND p.id IS NULL
ORDER BY op.hits_last_year DESC;
```

Design notes:

- **The export run is the provenance.** Each batch points at the `export_runs` row whose checksummed file it loaded ([Choosing & Hosting a Store](/books/commerce/choosing-a-platform#how-to-build-it)), so any migrated value traces to a file kept unchanged in the merchant's storage.
- **The crosswalk is the integrations one.** `record_mappings` is unique on both sides, so re-running a batch finds its target by the old platform's ID and updates it instead of inserting a duplicate; `migration_batch_id` says which load created each mapping, and a corrected mapping is an audited change ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)). After cutover the old platform's mappings stay as the index into its archive.
- **Imported records carry a migration actor.** Every write from a batch is made as `migration:<batch_id>`, and event consumers that send email, create fulfillments or call partners ignore that actor, which is how side effects stay off ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Password hashes, where kept, are a credential.** A sign-in migration's old hashes live in a separate, access-controlled store keyed by customer, are deleted on successful migration, and are purged entirely at the end date; they never sit in the customer table or a migration file left in object storage ([Passwords](/docs/security/authentication)).
- **A migrated gift card is its original card.** It keeps its number (stored as `number_hash` and `last4`, never in clear), its original `issued_at` and `expires_at`, and opens with one `issue` transaction for the balance remaining at cutover, so the five-year floor and escheat clocks keep running from the real issue date ([Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#how-to-build-it)).
- **Checks are rows, not a spreadsheet.** `migration_checks` keeps expected, actual and the explanation for each accepted difference, and the cutover approval cites the check IDs.
- **Card numbers never touch these tables.** `token_migrations` tracks the processor-to-processor transfer by status and counts; the card data moves only between the processors' PCI environments ([Payment Credentials](/docs/architecture/replacing-systems#payment-credentials)).

## Auditing

- **What came from where.** Every migrated record's source ID, batch and export file, kept for as long as the record.
- **The reconciliation and its approval.** Every check with its expected and actual values, accepted differences with their explanations, and who approved cutover.
- **Money owed across the move.** Gift card, store credit and loyalty balances before and after, by card and in total, tied to the ledger.
- **Payment method transfers.** Requests, approvals, mapping files, counts expected and mapped, and the old billing paused before the new began.
- **The old platform's archive.** Its final exports, audit logs and order history, retrievable by customer, order and date for the longest retention period of anything in them.
- **Redirects added at launch,** with their reason and source, and the 404s found and fixed after.

## What This Means for the System You Build

- **Inventory everything first:** data, apps, integrations, URLs and the credentials that won't export.
- **Keep handles, SKUs and external IDs,** and map every source ID through a crosswalk rather than a legacy column.
- **Plan customers' sign-in:** passwordless, migrate on sign-in, or invite, and move consent and suppressions with them.
- **Import orders as history** with side effects off, and drain open orders on the old platform.
- **Move gift cards with their codes** and reconcile every owed balance to the ledger.
- **Move cards processor to processor,** recreate subscriptions with their real dates, stop the old billing first and watch the first renewal run.
- **Import reviews unchanged.**
- **Build the redirect map from logs as well as exports,** keep redirects permanently, and schedule the move away from peak.
- **Reconnect every integration and run test orders through all of them** before cutover.
- **Gate cutover on recorded reconciliation checks,** keep a rollback window, and archive the old store before closing it.

## References

**Platforms**

- [Shopify Help Center: Migrating to Shopify](https://help.shopify.com/en/manual/migrating-to-shopify), the steps, import order, tools and APIs, and redirects before the domain moves
- [Shopify Help Center: URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect), CSV import, the 100,000 and 20,000,000 limits, broken-URL-only redirects and query strings
- [Shopify Help Center: New customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts), one-time code sign-in without a password
- [Shopify Help Center: Migrating payment methods](https://help.shopify.com/en/manual/products/purchase-options/subscriptions/migrating-payment-methods), token and card number migration, secondary gateways, timelines and recreating contracts
- [Shopify Developers: giftCardCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/giftCardCreate), supplied codes, initial value and the access scope
- [BigCommerce Support: Transferring your catalog to BigCommerce](https://support.bigcommerce.com/articles/en_US/Knowledge/Transferring-Your-Catalog-to-BigCommerce), methods by object, the 500,000-record app limit, passwords, payment tokens and storefront design
- [Adobe Experience League: Data Migration Tool technical specification](https://experienceleague.adobe.com/en/docs/commerce-operations/tools/data-migration/basics/technical-specification), settings, data and delta modes and change tracking
- [Salesforce Trailhead: Business Manager import and export](https://trailhead.salesforce.com/content/learn/modules/b2c-import-export/b2c-business-manager-import-export), schema-validated XML and no updates to existing orders
- [WooCommerce: Product CSV importer and exporter](https://woocommerce.com/document/product-csv-importer-exporter/), products and variations, matched by ID or SKU
- [commercetools: Import customers](https://docs.commercetools.com/foundry/blueprint-b2c-retail/import-customers), gradual password migration and why not to force resets
- [Stripe: Import payment data](https://docs.stripe.com/get-started/data-migrations/pan-import), the PAN import process, what can't be imported, the mapping file, timelines, decline ramp-up and exports only to PCI-compliant processors

**Search**

- [Google Search Central: Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), URL mapping, server-side permanent redirects kept at least a year, ranking fluctuation, processing time and the Change of Address tool
