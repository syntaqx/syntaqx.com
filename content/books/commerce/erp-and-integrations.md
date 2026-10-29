+++
title = "ERP & Integrations"
description = "NetSuite, Business Central, SAP, Acumatica, QuickBooks and Xero; iPaaS; what syncs where, which system owns each object, and handling sync failures."
category = "Commerce Industry"
order = 2357
part = "Running the Platform"
tags = ["commerce", "erp", "integrations", "netsuite", "ipaas"]
+++

Behind every store of any size sits an enterprise resource planning system (ERP): the general ledger, the item master and its costs, purchasing, receiving, accounts receivable for the wholesale customers who pay on terms, and the financial close. The commerce platform takes orders; the ERP books them. A brand with a Shopify store, an Amazon account, two retailers on EDI and a 3PL has five systems that each hold part of every order, and the ERP is where finance expects them to agree.

Integration is the work of making them agree: deciding which system is the record for each object, moving copies the right way at the right grain, mapping one system's IDs to another's, and handling the failures that every sync between two APIs eventually produces. This chapter covers the ERPs commerce businesses run (NetSuite, Microsoft Dynamics 365 Business Central, SAP S/4HANA and Business One, Acumatica, QuickBooks and Xero), the integration platforms between them (Celigo, Boomi, MuleSoft), what syncs where and who owns it, summary versus detail posting, and failure handling. The accounting the ERP performs is [Commerce Accounting](/books/commerce/commerce-accounting); the general patterns are the playbook's [Syncing to the Accounting System](/docs/payments/accounting#syncing-to-the-accounting-system) and [Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids). It extends `connected_systems` from [The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it) and `external_refs` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), and adds `field_ownership`, `record_mappings` and `sync_jobs`.

## How the Platforms Do It

As of October 2026, from vendor documentation and listings:

| ERP | Who runs it | Commerce connection | API budget | What an online order becomes |
| --- | --- | --- | --- | --- |
| **Oracle NetSuite** | Mid-size and growing brands, distributors | Oracle's own NetSuite Connector (listed on the Shopify App Store from $199.92 a month, syncing "product, pricing, inventory, sales order, and fulfillment data"), Celigo and other iPaaS | Concurrency shared by web services and RESTlets: 5 concurrent requests on the Standard tier to 20 on Enterprise and Ultimate, plus 10 per SuiteCloud Plus license | A sales order, then an item fulfillment and a cash sale (paid now) or invoice (paid later) |
| **Microsoft Dynamics 365 Business Central** | Small and mid-size companies on Microsoft | A Shopify Connector built in, preinstalled for new sign-ups | Per user, 6,000 OData requests per 5-minute window and 5 concurrent; pages of up to 20,000 entities | A sales order if the Shopify order needs fulfillment, a sales invoice if it is already fulfilled |
| **SAP S/4HANA** | Large enterprises | SAP Commerce Cloud replicates orders to S/4HANA through SAP's integration service; others through the sales order APIs | Not published as a request rate; SAP advises an asynchronous bulk interface for orders over 1,000 lines | A sales order through the Sales Order (A2X) API or the asynchronous A2A interface |
| **SAP Business One** | Small and mid-size companies on SAP | Partner connectors over the Service Layer, which "supports OData ... and supports JSON" | Set by the server the customer runs | A sales order or A/R invoice |
| **Acumatica** | Mid-size distributors and retailers | A commerce edition with built-in Shopify, Commerce.com and Amazon connectors | Per license: API users, concurrent requests and requests per minute | A sales order; payments and refunds imported beside it |
| **QuickBooks Online, Xero** | Small brands | App connectors that post per order or a daily summary | Xero, per connected organization: 5 concurrent calls, 60 a minute, 5,000 a day (1,000 on its free developer tier from March 2026) | A sales receipt or invoice per order, or one journal entry per day |

What the table shows: the ERP decides the integration's shape more than the store does. Its API budget sets how many orders a day can post one by one, its document types decide whether an order becomes one record or four, and its native connector, where one exists, already embodies an answer to who owns what. Shopify's ERP program, launched October 14, 2021 with Business Central, NetSuite, Infor, Acumatica and Brightpearl, is the platform side of the same fact: the large ERPs build their own connectors.

## What an ERP Owns

The ERP is the system of record for the things finance signs:

- **The general ledger.** Every revenue, cost, liability and cash entry, by account, period and entity. The commerce system produces the facts; the ERP holds the books ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).
- **The item master and its cost.** SKUs, units of measure, cost and inventory valuation, because cost of goods sold is a ledger number ([Commerce Accounting](/books/commerce/commerce-accounting#cogs-and-inventory-valuation)).
- **Purchasing and receiving.** Purchase orders, receipts, vendor bills and the three-way match ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment)).
- **Accounts receivable on terms.** Wholesale and B2B invoices, credit limits, collections and the remittances that pay them, net of deductions ([Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#how-to-build-it)).
- **Entities, tax liabilities and the close.** Legal entities, intercompany, the sales tax payable account and the period that closes.

What it usually does not own: the storefront's product content (a PIM or the platform), the shopper's cart, promotions, the checkout, the consumer customer's account, and, for DTC orders, the order itself, which is born in the platform or marketplace and copied in.

NetSuite's records show what a single online order becomes in an ERP. Without Advanced Shipping, fulfilling a sales order "automatically creates an invoice or cash sale": an invoice "when you sell something but don't get paid right away," a cash sale "when you sell something and get paid right away." An item fulfillment updates inventory and deducts value from the inventory asset account. A deposit taken before shipment is a customer deposit, which goes "into your general ledger as a liability until you deliver the goods," and "when the order is filled, the deposit is applied against the invoice." The commerce system's authorize-at-order, capture-at-shipment flow ([Taking Payment in Commerce](/books/commerce/taking-payment#capture-policies)) maps onto those records directly: an order is a sales order, a shipment an item fulfillment, a capture at checkout a customer deposit, a capture at shipment a cash sale.

## What Syncs Where

Every object has one system of record; the others hold copies with the owner's ID ([The Commerce Landscape](/books/commerce/commerce-landscape#oms-wms-and-erp)). The typical assignment for a brand with a commerce platform, marketplaces, a 3PL and an ERP:

| Object | System of record | Flows to | Direction and grain |
| --- | --- | --- | --- |
| **Item (SKU, units, cost)** | ERP | Platform, marketplaces, 3PL | ERP to platform on change; cost never leaves finance systems |
| **Product content and media** | PIM or the platform | Marketplaces, feeds | Out to channels ([Product Information & Content](/books/commerce/product-information)) |
| **Retail prices and promotions** | Platform (or a pricing service) | Marketplaces | Out to channels |
| **Wholesale and contract prices** | ERP | B2B storefront | ERP to platform ([B2B Commerce](/books/commerce/b2b-commerce)) |
| **Inventory counts** | WMS or 3PL for warehouse stock; POS for store stock | ERP, platform, marketplaces | From the building outward, as movements or snapshots ([Sync Across Channels](/books/commerce/inventory#sync-across-channels)) |
| **Consumer customers** | Platform | ERP (often as one "web customer," or per customer), email platform | Platform to ERP with the order |
| **B2B companies, terms, credit** | ERP | B2B storefront | ERP to platform |
| **DTC and marketplace orders** | Platform or marketplace | ERP, OMS, 3PL | Into the ERP as sales orders, or summarized daily |
| **Retailer purchase orders** | The retailer, by EDI | ERP or OMS | Inbound 850 into a sales order ([EDI](/books/commerce/edi)) |
| **Fulfillments and tracking** | 3PL or WMS | Platform, marketplaces, ERP | Out from the building |
| **Invoices and AR** | ERP | B2B storefront (for viewing and paying) | ERP outward |
| **Refunds and returns** | Platform (DTC), marketplace | ERP | Credit memos or cash refunds into the ERP |
| **Payouts and settlements** | Processor or marketplace | ERP | Deposits matched to orders ([Payout and Marketplace Reconciliation](/books/commerce/commerce-accounting#payout-and-marketplace-reconciliation)) |
| **Purchase orders and receipts** | ERP | 3PL (as inbound notices), platform (incoming stock) | ERP outward |
| **Sales tax** | Tax engine for the calculation; ERP for the liability | ERP | With the order or the summary |

The Celigo template for Shopify and NetSuite is a public example of the same table drawn as flows: Shopify orders to NetSuite sales orders and their cancellations; NetSuite item shipments to Shopify fulfillments; NetSuite items to Shopify products; Shopify refunds to NetSuite cash refunds or credit memos, and NetSuite refunds back; abandoned checkouts and draft orders to NetSuite quotes. Business Central's built-in connector draws it with settings: "If the Shopify order requires fulfillment, a Sales Order is created. For fulfilled Shopify orders ... a Sales Invoice gets created," returns become a credit memo or a return order by a setting, and posted shipments sync back with tracking. Acumatica's Shopify connector names the direction per entity: product availability, shipments, images and price lists are export only; sales orders, quotes, payments and refunds are import only; customers and items can go either way, and a "Primary System" setting decides which side wins a conflict.

Three rules hold across all of them:

- **Ownership is per field, not only per object.** The ERP owns an item's SKU, cost and unit of measure; the PIM owns its description; the platform owns its handle and SEO title. A sync that writes the whole object from one side overwrites the other side's fields. Record the owner for each group of fields, and let each side write only what it owns.
- **Bidirectional means two one-way flows with a tiebreak.** Customers and items that both sides edit need a declared primary for conflicts, as Acumatica's setting makes explicit, and a version or timestamp check so an older copy never overwrites a newer one.
- **Dependencies go first.** An order can't post before its customer and items exist in the ERP; a fulfillment can't post before its order. The sync orders its work by dependency and parks a record whose parent is missing instead of failing it.

## Summary or Detail

The biggest design choice in an ERP integration is the grain. The playbook's [Summary Journals or Detail](/docs/payments/accounting#summary-journals-or-detail) gives the general trade-off; in commerce it looks like this:

- **Order by order.** Each order becomes a sales order (or a sales receipt), with its lines, tax, shipping and discounts, then a fulfillment and a cash sale or invoice. Finance can drill from a revenue number to an order, returns match their original, and inventory relieves by SKU at the right location. It costs API calls: five or six records per order against a concurrency budget of 5 to 20 on NetSuite's base tiers or 60 calls a minute on Xero, and every one is a place to fail.
- **Daily summary.** One journal entry (or one summary sales receipt) per day, per channel and location, with revenue, discounts, shipping, tax, fees and refunds totaled by account; MyWorks, one QuickBooks connector, describes its daily summary as "a single transaction - a journal entry" per day "separated by QuickBooks account type." It fits a small brand on QuickBooks or Xero, survives any order volume and keeps the ERP's customer list clean. It gives up drill-down, and inventory relief by SKU has to happen somewhere else or be posted as a summary too.
- **Hybrid.** Order detail where the ERP needs it (wholesale and B2B orders, which carry AR and terms; anything that relieves inventory the ERP values), summaries for high-volume DTC and marketplace orders, and settlements posted as deposits that clear the summaries.

My default: detail for every order the ERP must collect (terms, invoices, credit) and every order whose inventory the ERP values; summary for card-paid DTC and marketplace orders once volume makes detail fragile, with the commerce system's order rows, not the ERP, as the drill-down. Whatever the grain, every posted entry carries the commerce system's batch or order IDs so the ERP total can be reconciled back to the rows that produced it ([One Log Per Sync Batch](/docs/payments/accounting#one-log-per-sync-batch)).

## Mapping IDs

Two systems that share records need a crosswalk: this order is NetSuite internal ID 48211 and Shopify order 5550012; this item is Business Central item 1000-BLK and Amazon seller SKU ZG-1000-B. The core model already keeps external IDs on items as a map keyed by connected system, and orders carry the partner's ID with a uniqueness rule; the crosswalk generalizes that to every object a sync touches ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)):

- **One row per object per system,** with the version or last-modified time each side had at the last sync, so the next sync can tell which side changed.
- **Write the mapping in the same step as the create.** A create that succeeded in the ERP but whose mapping wasn't saved is the classic duplicate: the retry creates it again. Where the ERP accepts an external ID or a reference field on the record, set it to the commerce ID so a retry can find the first copy.
- **Never reuse a mapping across entities or environments.** A sandbox ERP and a production ERP are two connected systems; so are two NetSuite subsidiaries posting through one account, if their records differ.

## Integration Platforms

An iPaaS (integration platform as a service) is a hosted runtime for flows between systems, with connectors, mapping, scheduling and error handling, so a brand doesn't write and host its own connector code:

- **Celigo** (integrator.io) sells prebuilt integration apps and templates for commerce pairs, the Shopify and NetSuite template above among them, and promises error management with "dashboards, detailed error messages, alerts and notifications, auto-resolve, and autonomous recovery tools."
- **Boomi** runs flows on runtimes it now calls a "basic runtime" ("a non-clustered, single-tenant runtime," formerly an Atom), a "runtime cluster" for high availability (formerly a Molecule) and a multi-tenant "runtime cloud," which can sit in Boomi's cloud or inside the customer's network next to an on-premises ERP.
- **MuleSoft** frames integration as API-led connectivity in three layers: system APIs over the systems of record (the ERP, billing, databases), process APIs that "define a common process which the organization can share," and experience APIs that reshape data "so that it is most easily consumed by its intended audience."

Native connectors (NetSuite Connector, Business Central's Shopify Connector, Acumatica's commerce connectors) cover the common objects with the ERP vendor's own answer to ownership; an iPaaS covers combinations nobody built and custom mappings; custom code covers a business whose order model the templates don't fit. All three need the same things underneath: a crosswalk, a dependency order, idempotent writes, a place errors go and a person who reads it.

## Failure Handling

An integration between two APIs fails in a small number of ways, and each has a known answer:

| Failure | Example | Handling |
| --- | --- | --- |
| **Throttled** | NetSuite's concurrency exceeded, a 429 from Business Central or Xero | Back off and retry; queue per connected system so one ERP's limit doesn't block others ([Handling a 429](/docs/requests/rate-limiting#handling-a-429)). NetSuite says its account limit "is lenient," but a sync designed to exceed it will fail at peak |
| **Timeout with unknown outcome** | The order create was sent and the response never came | Look up by external ID or reference before retrying; never blind-retry a create ([What Is Safe to Retry](/docs/architecture/retries-and-timeouts#what-is-safe-to-retry)) |
| **Missing dependency** | The order references an item or customer the ERP doesn't have | Park the record, sync the dependency, release the parked record |
| **Validation** | A closed period, a missing tax code, an item inactive in the ERP, a location not mapped | A human fixes the data or the mapping; the record waits in an error queue with the ERP's message and a retry button |
| **Too large** | An order with thousands of lines | Use the ERP's bulk or asynchronous interface; SAP's own note on the synchronous sales order API is that orders "with over 1000 line items" can time out and to use the asynchronous interface |
| **Silent drift** | A webhook was missed; someone edited the order in the ERP | A scheduled reconciliation compares counts and totals by day and channel and lists the differences |
| **Credential expiry** | A token not refreshed in time | The connected system goes to `disconnected`, syncs stop and alert instead of failing record by record; Business Central's Shopify refresh token lasts 90 days without a successful refresh |

Three practices separate integrations that work from those that are rebuilt every year:

- **Every sync is a job with counts.** A run records what it read, what it wrote, what it skipped and what failed, so a missing order is a row in a report, not a discovery at month end.
- **Errors go to a queue someone owns.** Retries handle transient failures; everything else waits with its message for a named person in finance or operations. An error queue nobody reads is a drift report written in advance.
- **Reconcile totals, not only records.** Orders, revenue, tax, refunds and fees by day and channel in the commerce system against the same totals in the ERP; the difference, not the record count, is what finance cares about ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).

## How to Build It

`connected_systems` already names each external system and the objects it owns. This chapter adds field-level ownership, the crosswalk and the sync runs:

```sql
CREATE TABLE field_ownership (           -- which system may write which fields of an object
  merchant_id          UUID NOT NULL REFERENCES merchants (id),
  object               TEXT NOT NULL,      -- 'item', 'customer', 'company', 'price_list', ...
  field_group          TEXT NOT NULL,      -- 'identity', 'cost', 'content', 'price', 'stock'
  owner_system_id      UUID REFERENCES connected_systems (id),  -- null: this system owns it
  conflict_rule        TEXT NOT NULL DEFAULT 'owner_wins' CHECK (conflict_rule IN
                         ('owner_wins', 'newest_wins', 'manual')),
  valid_during         TSTZRANGE NOT NULL,
  PRIMARY KEY (merchant_id, object, field_group, valid_during)
);

CREATE TABLE record_mappings (           -- one object here, one record there
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id  UUID NOT NULL REFERENCES connected_systems (id),
  object               TEXT NOT NULL,      -- 'order', 'item', 'customer', 'fulfillment', 'refund',
                                           -- 'invoice', 'journal_entry', 'payout'
  local_id             UUID NOT NULL,      -- the row in this system
  external_id          TEXT NOT NULL,      -- NetSuite internal ID, BC number, Xero GUID
  external_type        TEXT,               -- the record type there: 'salesorder', 'cashsale'
  local_version        BIGINT,             -- what each side had at the last successful sync
  external_version     TEXT,
  synced_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (connected_system_id, object, local_id, external_type),
  UNIQUE (connected_system_id, object, external_type, external_id)
);

CREATE TABLE sync_jobs (                 -- one run of one flow, with its counts
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id  UUID NOT NULL REFERENCES connected_systems (id),
  flow                 TEXT NOT NULL,      -- 'orders_to_erp', 'items_from_erp', 'daily_summary'
  direction            TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  grain                TEXT NOT NULL CHECK (grain IN ('record', 'summary', 'bulk')),
  period               TSTZRANGE,          -- the business period a summary or reconciliation covers
  trigger              TEXT NOT NULL CHECK (trigger IN ('event', 'schedule', 'manual', 'retry')),
  status               TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'partial',
                         'failed')),
  read_count           INT NOT NULL DEFAULT 0,
  written_count        INT NOT NULL DEFAULT 0,
  skipped_count        INT NOT NULL DEFAULT 0,  -- unchanged, or owned by the other side
  parked_count         INT NOT NULL DEFAULT 0,  -- waiting on a dependency
  failed_count         INT NOT NULL DEFAULT 0,
  totals               JSONB,              -- for summaries: amounts per account, as posted
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at          TIMESTAMPTZ
);

CREATE TABLE sync_items (                -- each record a job touched that didn't simply succeed
  sync_job_id          UUID NOT NULL REFERENCES sync_jobs (id),
  object               TEXT NOT NULL,
  local_id             UUID NOT NULL,
  outcome              TEXT NOT NULL CHECK (outcome IN ('parked', 'failed', 'resolved',
                         'ignored')),
  depends_on           JSONB,              -- {"object": "item", "local_id": ...} for parked rows
  error_code           TEXT,               -- the remote system's code
  error_message        TEXT,               -- as returned, for the person who fixes it
  owner                TEXT,               -- the team or person the queue routes to
  attempts             SMALLINT NOT NULL DEFAULT 1,
  resolved_at          TIMESTAMPTZ,
  PRIMARY KEY (sync_job_id, object, local_id)
);
CREATE INDEX sync_items_open ON sync_items (owner) WHERE outcome IN ('parked', 'failed');
```

The daily reconciliation compares this system's totals with what the ERP holds, per day and channel; a nonzero difference opens an item for finance:

```sql
-- Goods and merchant-remitted tax by day and channel, beside the summary that was posted.
WITH here AS (
  SELECT o.placed_at::date AS day, o.channel,
         SUM(l.amount) AS goods,
         SUM((SELECT COALESCE(SUM(c.amount), 0) FROM order_charges c
               WHERE c.order_id = o.id AND c.kind = 'tax'
                 AND c.remitter = 'merchant')) AS tax
  FROM orders o
  JOIN LATERAL (SELECT SUM(amount) AS amount FROM order_lines
                 WHERE order_id = o.id AND parent_line_id IS NULL) l ON TRUE
  GROUP BY 1, 2
)
SELECT h.day, h.channel, h.goods, h.tax,
       (j.totals ->> 'goods')::BIGINT AS posted_goods,
       (j.totals ->> 'tax')::BIGINT   AS posted_tax
FROM here h
LEFT JOIN sync_jobs j ON j.flow = 'daily_summary' AND j.status = 'succeeded'
                     AND j.totals ->> 'channel' = h.channel
                     AND lower(j.period)::date = h.day
WHERE j.id IS NULL
   OR (j.totals ->> 'goods')::BIGINT <> h.goods
   OR (j.totals ->> 'tax')::BIGINT <> h.tax;
```

Design notes:

- **Ownership is data with dates.** `field_ownership` is what the sync reads before writing a field; moving cost ownership from the platform to a new ERP is a new row from a date, not a code change, the same rule as `connected_systems.system_of_record` one level finer.
- **The mapping is the idempotency key.** A create writes its `record_mappings` row in the same step as the remote call's success; a retry first looks for the mapping, then for the remote record by the commerce ID set in its reference field, and only then creates.
- **Versions on both sides.** `local_version` and `external_version` let the next run skip records nobody changed and detect the ones both sides changed, which go to `conflict_rule`.
- **Jobs record counts and totals.** A summary job's `totals` are what was posted, by account, so the reconciliation compares like with like; a record job's counts are what the morning check reads ([Visibility and Stuck Jobs](/docs/architecture/background-jobs#visibility-and-stuck-jobs)).
- **Parked is not failed.** A record waiting on its customer or item is released automatically when the dependency syncs; only validation and unknown errors need a person.
- **Posting follows the close.** A record that would post into a closed ERP period is posted to the open period with its original date recorded, never forced into the closed one ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).
- **Emit `sync_job.finished`, `sync_item.failed` and `connected_system.disconnected`** to the operations channel and the owner's queue.

## Auditing

- **Every sync run,** with its trigger, counts, totals and status, kept as long as the periods it posted to stay open for audit.
- **Every mapping,** so any ERP record can be traced to the order, refund or payout that produced it, and back.
- **Every failure and its resolution,** with the remote system's message, who fixed it and how, because a revenue difference at year end is explained from these rows.
- **Ownership over time,** so a question about who changed an item's cost in March is answered by which system owned cost in March.

## What This Means for the System You Build

- **Name a system of record for every object and every group of fields,** and let each system write only what it owns.
- **Choose the grain deliberately:** detail for orders the ERP collects or whose inventory it values, summaries for high-volume card-paid orders, with batch IDs on every entry.
- **Keep a crosswalk for every synced object,** written in the same step as the create, with both sides' versions.
- **Order work by dependency** and park records whose parents haven't synced, instead of failing them.
- **Budget for the ERP's API limits,** queue per connected system, and use bulk or asynchronous interfaces for large documents.
- **Route errors to an owned queue** and reconcile totals by day and channel, not only record counts.
- **Treat credentials as a connection state** that stops syncs and alerts when it fails.

## References

**ERP documentation**

- [Oracle NetSuite: SuiteCloud Plus settings](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N259503.html), concurrency limits by service tier and license
- [Oracle NetSuite: Web services and RESTlet concurrency governance](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3448861.html), the shared limit and its leniency
- [Oracle NetSuite: Cash sales and invoices](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1221414.html), which record fulfillment creates
- [Oracle NetSuite: Item fulfillment](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2281951.html), inventory and asset effects of fulfillment
- [Oracle NetSuite: Customer deposits](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1296349.html), deposits as a liability applied to the invoice
- [Oracle NetSuite: Receiving purchase orders](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2411320.html), item receipts
- [Shopify App Store: NetSuite ERP Connector](https://apps.shopify.com/oracle-netsuite), Oracle's connector, its synced data and price
- [Microsoft Learn: Operational limits in Business Central online](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/operational-limits-online), OData request, concurrency and page limits
- [Microsoft Learn: Get started with the Shopify Connector](https://learn.microsoft.com/en-us/dynamics365/business-central/shopify/get-started), the preinstalled connector and token refresh
- [Microsoft Learn: Synchronize and fulfill sales orders](https://learn.microsoft.com/en-us/dynamics365/business-central/shopify/synchronize-orders), sales orders, invoices, returns and shipment sync
- [SAP Knowledge Base 3450503: Timeout creating sales orders using API_SALES_ORDER_SRV](https://userapps.support.sap.com/sap/support/knowledge/en/3450503), the 1,000-line timeout and the asynchronous alternative
- [SAP Learning: SAP Business One Service Layer](https://learning.sap.com/courses/leveraging-the-sap-business-one-service-layer/exploring-the-service-layer-api-architecture-and-capabilities), the Service Layer's OData and JSON interface
- [SAP Learning: Order replication from SAP Commerce Cloud to S/4HANA](https://learning.sap.com/courses/commerce-and-s-4hana-end-to-end-integration/monitoring-and-verifying-the-order-replication_d1d633b3-657d-4a06-9c2a-e2f2cc0771c3), outbound order replication
- [Acumatica (MYOB Acumatica documentation): License restrictions for API users](https://help.myob.com.au/advanced/Docs/Published/IntegrationDevelopmentGuide/IS__con_License_Restrictions_API_Users.html), per-license API limits and queueing
- [Acumatica (MYOB Acumatica documentation): Shopify stores](https://help.myob.com.au/advanced/Docs/Published/UserGuide/BC_20_10_10.html), entities, sync directions and the primary system
- [Xero Developer: API limits](https://developer.xero.com/faq/limits), concurrent, per-minute and daily limits per organization
- [Xero Developer: Pricing](https://developer.xero.com/pricing), developer tiers and daily limits from March 2026

**Integration platforms**

- [Celigo: Shopify to NetSuite integration template](https://www.celigo.com/integration-apps/shopify-netsuite/), the flows and error management
- [Boomi: Terminology changes](https://help.boomi.com/docs/Atomsphere/Platform/atm-Boomi_terminology_changes), runtimes, clusters and runtime clouds
- [MuleSoft: Using APIs to build a great architecture (May 27, 2016)](https://blogs.mulesoft.com/?p=29634), system, process and experience APIs
- [MyWorks: Syncing orders from Shopify to QuickBooks as a daily summary](https://support.myworks.software/syncing-orders-from-shopify-to-quickbooks-as-a-daily-summary), a daily journal entry by account type
- [Shopify: Shopify launches global ERP program (October 14, 2021)](https://www.shopify.com/news/the-best-in-commerce-joins-the-best-in-enterprise-shopify-launches-global-erp-program), the ERP partners and their direct integrations
