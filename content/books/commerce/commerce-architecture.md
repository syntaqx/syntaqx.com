+++
title = "Commerce Architecture: Building It Yourself"
nav_title = "Commerce Architecture"
description = "Bounded contexts, the order pipeline as events, idempotency, stock under load, multi-tenant platforms, apps and functions, rate limits and a reference build."
category = "Commerce Industry"
order = 2356
part = "Running the Platform"
tags = ["commerce", "architecture", "events", "webhooks", "multi-tenancy"]
+++

Every earlier chapter of this volume ended with a How to Build It: a few tables, the queries that matter and the events they emit. This chapter is where those pieces become one system. A commerce backend is a dozen domains that each own a slice of the order (the catalog that says what it is, the price list that says what it costs, the checkout that turns a cart into a promise, the order manager that decides where it ships, the inventory that says whether it exists, the payment that says whether it's paid, the warehouse and carrier that move it, the ledger that books it), and the hard part is not any one of them. It's the seams: one order written once and read by ten consumers, retries that must not charge twice, the last unit wanted by a thousand shoppers in the same second, and code from apps the platform didn't write running inside its checkout.

The chapter covers how the platforms draw those seams, the bounded contexts and which tables each owns, the order pipeline as events through an outbox, idempotency at checkout and at every webhook, inventory consistency under load, multi-tenancy for a platform selling to many merchants, extensibility through apps, webhooks and functions, API rate limits and bulk APIs, and a reference architecture tying every chapter's tables together. The general engineering is the playbook's ([Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Webhooks](/docs/api-design/webhooks), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Rate Limiting](/docs/requests/rate-limiting)); the Payments volume's [Architecture at Scale](/books/payments/architecture-at-scale) is the same exercise for a payment provider, and the servers themselves are the [Hosting & Cloud](/books/hosting-and-cloud/regions-zones-and-cells) volume's. It adds `webhook_subscriptions`, `webhook_deliveries`, `app_installations` and `inbound_events` to [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from developer documentation and engineering posts:

| Platform | Core shape | Events out | Code inside the request | Limits and bulk |
| --- | --- | --- | --- | --- |
| **Shopify** | A Ruby on Rails modular monolith with "strictly enforced boundaries between different domains" (2019); shops sharded into pods, each "a set of shops that live on a fully isolated set of datastores" (2018) | Webhooks, retried "up to eight times in a four-hour period" and removed if failures persist; five seconds to respond; no ordering guarantee | Shopify Functions: WebAssembly modules inside checkout (discounts, cart transforms, delivery and payment customization, validation, fulfillment constraints, order routing) | GraphQL Admin cost-based, 100 points a second on Standard to 2,000 on enterprise; bulk queries and mutations as asynchronous JSONL jobs |
| **Commerce.com (BigCommerce)** | Hosted SaaS with REST and GraphQL APIs; Checkout SDK for custom checkouts | Thin webhooks (store, scope and resource ID only), retried on a schedule for 48 hours, then deactivated | None in the request; custom checkout through the SDK | Requests per 30-second window by plan: 150 on Core and Growth, 450 on Scale, unlimited on the top plan |
| **commercetools** | Headless, API-first, every resource versioned for optimistic concurrency | Subscriptions to queues and buses (SQS, SNS, EventBridge, Pub/Sub, Azure, Confluent), at least once, "not guaranteed to be delivered in their natural order" | API Extensions: a synchronous call to the merchant's endpoint before a cart, order, payment or customer change persists, 2 seconds by default and 10 at most | Published per-project limits (10 million carts, 500 update actions per request); an Import API for bulk loads |
| **Adobe Commerce** | PHP on Magento's framework, extended by plugins (interceptors) and observers in-process; App Builder out of process | Adobe I/O Events, retried "for up to 24 hours" | Webhooks that run "synchronous logic to execute calls to external systems," with a hard timeout per hook | Asynchronous and bulk REST endpoints (`/async/bulk/V1/...`) that queue work on RabbitMQ |
| **Medusa, Saleor** | Open-source headless backends (Node.js; Python and Django) | Medusa subscribers on an event bus (Redis in production); Saleor asynchronous webhooks | Medusa workflows with compensation steps; Saleor synchronous webhooks for payment, shipping and tax, which "will affect Saleor API response time" | The merchant's own servers decide |

Four patterns run through the table:

- **A monolith with boundaries, sharded by tenant, is what the largest platform runs.** Shopify kept one codebase and enforced domain boundaries inside it, then scaled by splitting shops across isolated pods. Microservices are a later decision, not the starting point ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)).
- **Events leave at least once and out of order, everywhere.** Not one platform promises ordering or single delivery; every consumer dedupes and checks versions.
- **Code inside the request is fenced.** Functions run sandboxed with instruction and memory limits; synchronous extensions and webhooks run against a timeout. The platform's checkout stays the platform's.
- **Limits are part of the contract.** Every hosted API publishes a budget, and every one offers an asynchronous bulk path for the work that doesn't fit in it.

## Bounded Contexts

A context is a part of the system that owns its data, its vocabulary and its invariants, and that other parts reach only through its API and its events ([Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)). Shopify's description of its components is the commerce version: each one is a business domain (orders, shipping, inventory, billing), with a public interface and exclusive ownership of its data. The contexts this volume's tables fall into:

| Context | Owns (tables from this volume) | Invariant it guards | Chapter |
| --- | --- | --- | --- |
| **Catalog** | `products`, `items`, `bundle_components`, options, attributes, media, `collections` | One definition of each item, with its identifiers | [Products, Variants & Bundles](/books/commerce/products-and-variants#how-to-build-it), [Product Information & Content](/books/commerce/product-information#how-to-build-it) |
| **Pricing and promotions** | `price_lists`, `price_list_items`, `price_history`, `promotions`, `discount_codes`, `discount_allocations` | The price shown is the price charged, and an old order keeps its price | [Pricing & Price Lists](/books/commerce/pricing#how-to-build-it), [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#how-to-build-it) |
| **Cart and checkout** | `carts`, `cart_lines`, `checkouts`, `shipping_quotes`, `tax_calculations` | One checkout version is one total; one key is one order | [Cart & Checkout](/books/commerce/cart-and-checkout#how-to-build-it), [Sales Tax, VAT & Duties](/books/commerce/sales-tax-vat-and-duties#how-to-build-it) |
| **Orders** | `orders`, `order_lines`, `order_charges`, `order_holds`, `order_edits`, `sourcing_decisions` | An order's lines and charges sum to what was agreed; status is derived | [Order Management](/books/commerce/order-management#how-to-build-it) |
| **Inventory** | `inventory_levels`, `inventory_movements`, `inventory_reservations`, `safety_stock_rules` | Available is never negative except by policy | [Inventory](/books/commerce/inventory#how-to-build-it) |
| **Fulfillment and shipping** | `fulfillments`, `fulfillment_lines`, `shipments`, `packages`, `rate_quotes`, `tracking_events` | A line ships at most the quantity ordered | [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls#how-to-build-it), [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it) |
| **Payments** | `order_payments`, `capture_plans`, gift card and store credit ledgers | Captured never exceeds authorized; refunds never exceed captured | [Taking Payment in Commerce](/books/commerce/taking-payment#how-to-build-it) |
| **Customers** | `customers`, `customer_addresses`, `marketing_consents`, `privacy_requests`, `companies` | One live customer per email per merchant; consent is a ledger | [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#how-to-build-it), [B2B Commerce](/books/commerce/b2b-commerce#how-to-build-it) |
| **Returns** | `returns`, `return_lines`, `return_inspections`, `return_amounts`, `exchanges` | A refund is the sum of its rows | [Returns & Exchanges](/books/commerce/returns-and-exchanges#how-to-build-it) |
| **Subscriptions and loyalty** | `subscriptions`, `subscription_renewals`, `billing_attempts`, `memberships`, `loyalty_ledger` | One renewal per period; balances are sums | [Subscription Commerce](/books/commerce/subscription-commerce#how-to-build-it), [Memberships & Loyalty](/books/commerce/memberships-and-loyalty#how-to-build-it) |
| **Channels** | `sales_channels`, `listings`, `feeds`, `marketplace_settlements`, `trading_partners`, `documents` | A partner's order is imported once; what was published is recorded | [Multichannel Listing & Feeds](/books/commerce/multichannel-listing#how-to-build-it), [Selling on Amazon](/books/commerce/selling-on-amazon#how-to-build-it), [EDI](/books/commerce/edi#how-to-build-it) |
| **Integrations and finance** | `connected_systems`, `sync_jobs`, `record_mappings`, `journal_entries` | One system of record per object; every money movement booked once | [ERP & Integrations](/books/commerce/erp-and-integrations#how-to-build-it), [Commerce Accounting](/books/commerce/commerce-accounting#how-to-build-it) |

Three boundaries are the ones teams get wrong:

- **Pricing is not the catalog.** The item's definition changes rarely and is public; its price changes constantly, varies by market, company and channel, and has law attached. Keeping prices out of the item row is what lets a price list publish without a catalog release and a cost stay confidential ([Cost Is Not Price](/books/commerce/commerce-business#the-core-data-model)).
- **Checkout is not orders.** A checkout is provisional, versioned and mostly abandoned; an order is permanent and audited. Merging them puts millions of throwaway rows into the table every report reads and makes "the order" mean two things.
- **Inventory is not fulfillment.** Inventory knows how many; fulfillment knows where they're going. The order manager's sourcing decision is the handshake between them ([Sourcing and Distributed Order Management](/books/commerce/order-management#sourcing-and-distributed-order-management)), and a fulfillment commits stock through an inventory command, never by writing the level itself.

My default is one database and one deployable with these contexts as modules: each module owns its tables, no module writes another's tables, and cross-module reads go through a module's interface or its events. That keeps the transactions that must be atomic (an order and its outbox event, a commitment and its movement) inside one database, and leaves the split into services for when a team or a scaling profile demands it ([When to Split](/docs/architecture/service-boundaries#when-to-split)). The first context worth splitting out is usually the storefront read path (catalog, search, prices for display), which scales with traffic, not with orders.

## The Order Pipeline as Events

Placing an order is the one moment that must be synchronous and atomic: freeze the checkout, check stock, authorize, write the order, emit `order.placed` ([Placing the Order Exactly Once](/books/commerce/cart-and-checkout#placing-the-order-exactly-once)). Everything after is a reaction, and each reaction belongs to the context that owns it:

![The order pipeline as events. The storefront (catalog, cart, in the browser) calls checkout, which runs synchronously to freeze the total, reserve stock and authorize; checkout writes the order and its placed event to the order tables and the outbox in one transaction; a relay and broker deliver at least once. The broker fans out to six consumers: inventory commits stock, sourcing creates fulfillments, payments captures on shipment, messages notify the customer, webhooks reach apps and partners, and the ERP and ledger get journal entries. A footer says each consumer dedupes by event ID and emits its own events through its own outbox. The path from checkout through the order and outbox is accented.](/diagrams/commerce-architecture-pipeline.svg "One synchronous write, then reactions. The order and its event commit together; every other context consumes the event at least once, deduplicates it, and emits its own events in turn.")

The events the volume's chapters already emit, in the order a typical DTC parcel order produces them:

| Event | Emitted by | Consumed by |
| --- | --- | --- |
| `checkout.completed`, `order.placed` | Cart and checkout, in the order's transaction | Inventory (commit), order management (risk check, sourcing), notifications, analytics, apps |
| `order.held`, `order.released` | Order management | Fulfillment, support tools |
| `fulfillment.created`, `fulfillment.requested`, `fulfillment.accepted` | Order management | The warehouse or 3PL connector, inventory |
| `shipment.shipped` | Fulfillment, from the label or the provider | Payments (capture), notifications, channels (ship confirmation), tax (commit) |
| `payment.captured`, `payment.authorization_expiring` | Payments | Order management, accounting |
| `shipment.delivered` | Fulfillment, from tracking | Returns (window starts), notifications, subscriptions (prepaid recognition) |
| `return.received`, `return.refunded` | Returns | Inventory (restock), payments (refund), accounting, fraud |
| `inventory_level.changed` | Inventory | Channels (availability), storefront cache, sourcing |
| `order.edited`, `order.cancelled` | Order management | Every consumer of `order.placed` |

Four rules make the pipeline hold:

- **The event and the state commit together.** Every emitter writes its event to `outbox_events` in the same transaction as the state change, and a relay publishes it ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). The alternative, writing the order and then publishing, loses an `order.placed` on every crash between the two, and a lost `order.placed` is an order the warehouse never sees.
- **Order per order, not globally.** Partition the event stream by order ID so one order's events are consumed in sequence while different orders run in parallel, and carry the order's version in each event so a consumer ignores anything older than what it has applied ([Ordering](/docs/architecture/events#ordering)). Platforms don't guarantee order on what they send you either: Shopify says it "doesn't guarantee ordering within a topic, or across different topics for the same resource," and commercetools tells consumers to use `sequenceNumber` and `version`.
- **Commands are not events.** "Capture this fulfillment's amount" is a command to payments with a key; "the shipment shipped" is the event that caused it. Naming the command as an event (`capture.should_happen`) hides its failure, because nobody is waiting for it ([Commands vs Events](/docs/architecture/events#commands-vs-events)).
- **Long processes are workflows with compensation.** An order that authorizes, commits stock, requests fulfillment from a 3PL and then fails at the 3PL has to release and void in reverse. Medusa builds this in: a compensation function "rolls back or undoes changes made by a step when an error occurs in the workflow." The Payments volume's [Sagas for Money That Moves in Steps](/books/payments/architecture-at-scale#sagas-for-money-that-moves-in-steps) is the same pattern with money; in commerce, the order's holds and edits are where a stuck workflow becomes visible to a person.

Webhooks to apps and partners are one more consumer of the same stream, not a second publishing path: the webhook dispatcher subscribes to the outbox's events and writes a delivery per subscription, so an app hears about an order exactly when every internal consumer does.

## Idempotency at Checkout and Webhooks

Every boundary in a commerce system is crossed by retries: a shopper's double click, a mobile client's timeout, a relay that published but crashed before marking the row, a carrier's webhook resent, a marketplace order pulled twice. The rule is the playbook's ([Idempotency](/docs/payments/idempotency)): every write that crosses a boundary carries a key, and the receiver stores the key with the result. The commerce map of where keys come from:

| Boundary | Key | Where it's stored | Chapter |
| --- | --- | --- | --- |
| Place order | The checkout's key, reused for the authorization and the order | `checkouts.idempotency_key`, `orders.idempotency_key` | [Cart & Checkout](/books/commerce/cart-and-checkout#how-to-build-it) |
| Import a marketplace order or a retailer PO | The partner's order ID or PO number | `UNIQUE (channel_partner, external_ref)` on orders | [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) |
| Capture for a shipment | Derived from the fulfillment ID | `order_payments` | [Taking Payment in Commerce](/books/commerce/taking-payment#how-to-build-it) |
| Request fulfillment from a 3PL | Derived from the fulfillment ID | The provider's request | [Order Management](/books/commerce/order-management#how-to-build-it) |
| Buy a label | Derived from the package | `shipments.purchase_key` | [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it) |
| Move stock | The provider's event ID or the source row | `inventory_movements.idempotency_key` | [Inventory](/books/commerce/inventory#how-to-build-it) |
| Redeem a gift card | The order and tender | `gift_card_transactions.idempotency_key` | [Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#how-to-build-it) |
| Receive a platform's or carrier's webhook | The sender's delivery or event ID | `inbound_events`, below | This chapter |

The platforms implement the same thing on their side. Stripe stores the first response to a key and lets keys be removed "after they're at least 24 hours old"; Shopify tracks keys on its `@idempotent` mutations "for 24 hours from the original request," made the directive mandatory in API version 2026-04 for 17 inventory, location and refund mutations, and rejects a reused key with different inputs (`IDEMPOTENCY_KEY_PARAMETER_MISMATCH`). That 24-hour window matters for design: a retry a day later is a new request, so a job that retries an inventory adjustment tomorrow needs its own record of what it already did, not only the platform's.

Inbound webhooks need the receiving side of the rule. Shopify says an app "might receive the same webhook more than once" and to "use the `X-Shopify-Webhook-Id` header to detect and skip duplicates"; its separate `X-Shopify-Event-Id` is shared across deliveries from one merchant action and is for correlation, not deduplication. Commerce.com's payload carries a `hash` to dedupe on and no signature header, so the receiver authenticates with a custom header it set on the subscription. commercetools delivers at least once. The receiver's pattern ([Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)): verify, store the raw delivery under the sender's ID with a unique constraint, acknowledge inside the sender's timeout (five seconds on Shopify), and process from the stored row. And because Commerce.com's thin payloads and every snapshot can be stale, fetch the current resource before acting on a state change.

## Inventory Consistency Under Load

[Inventory](/books/commerce/inventory#overselling) sets the rules: store the parts, compute available, commit with a conditional decrement, reserve briefly at checkout and expire reservations on read. Under load, the trouble is that all of those writes land on one row. A launch of a single SKU at one warehouse puts every checkout's commitment on the same `inventory_levels` row, and a row lock held for the length of a transaction that also authorizes a card is a queue of shoppers waiting on one lock.

What keeps it correct and fast:

- **Keep the stock write short and outside the payment call.** The conditional update on the level is milliseconds; the authorization is a network call to a processor. Reserve or commit in its own short transaction, authorize, then convert; never hold the row lock across the authorization ([Keep Transactions Short, and Local](/docs/database/transactions-and-concurrency#keep-transactions-short-and-local)).
- **Reserve at checkout, convert at order.** A reservation row with an expiry, converted exactly once when the order is placed, turns "is there one left" into a question asked once per checkout instead of once per click ([Confirming a Hold, Idempotently](/docs/architecture/reservations-and-holds#confirming-a-hold-idempotently)). commercetools makes the choice per cart (`ReserveOnOrder` blocks an order when stock is short; `TrackOnly` "allows for overselling").
- **Split a hot counter.** For a drop of a known quantity, divide the stock into a fixed number of buckets (rows per item and location with a bucket number), have each checkout decrement a random bucket and try another when it's empty, and sum the buckets for display. Contention falls with the bucket count; the cost is that the last few units are found by retry ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory); [Hot Accounts](/books/payments/architecture-at-scale#hot-accounts) is the same problem on a ledger).
- **Admit before you reserve.** When demand is a hundred times supply, the database is not the place to discover it. A waiting room or queue in front of checkout admits shoppers at the rate the checkout can serve, with a token per admitted session ([Admission Control](/docs/architecture/admission-control)); [Peak Season & Drops](/books/commerce/peak-season#waiting-rooms-and-queues) covers drops and queues in depth.
- **Accept eventual counts at the edges.** The storefront's "in stock" badge, the marketplace feed and the search facet read cached or published availability, seconds to minutes old; commercetools documents that quantity changes "may take up to 10 seconds to be reflected." Only the commitment at order needs to be exact, and the selling buffer absorbs the lag everywhere else ([Safety Stock and Channel Buffers](/books/commerce/inventory#safety-stock-and-channel-buffers)).

## Multi-Tenancy for Commerce Platforms

A brand runs one store and needs no tenant above its merchant. A platform (a hosted store builder, a POS vendor, a marketplace operator, a vertical software company with embedded commerce) runs thousands of merchants on shared software, and the core model's note applies: add a tenant above merchants exactly as [Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies) describes. The commerce specifics:

- **Shard by merchant, route at the edge.** Shopify's pods are the public example: shops were sharded across databases in 2015, and from 2016 each pod is "a set of shops that live on a fully isolated set of datastores," with a router (Sorting Hat, in the load balancers) sending each request to its shop's pod and a tool that moves a pod "to its recovery data center in a minute." Every query in the commerce model is scoped by merchant already, which is what makes merchant the natural shard key; [Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding) covers the infrastructure side.
- **One merchant's peak is everyone's problem.** A flash sale or a celebrity drop on one store is a traffic spike the other merchants on the same pod feel. Per-merchant rate limits on the API, per-merchant concurrency on checkout and background queues partitioned by merchant keep it contained ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)), and the largest merchants get pods of their own. Shopify's published Black Friday Cyber Monday 2024 figures (284 million requests per minute at the edge, 80 million on app servers) are the scale this has to survive.
- **Enforce the scope in the database.** A query that forgets `merchant_id` shows one store's customers to another; row-level security or a mandatory scoped connection turns a forgotten filter into an error instead of a breach ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)).
- **Merchants extend the schema.** Every merchant needs fields the platform didn't define (a product's care instructions, an order's gift message); metafields or custom attributes are definitions per merchant with typed values, not columns added per customer ([Custom Fields](/docs/architecture/custom-fields)).
- **The platform is often a payments platform too.** A platform that takes payments for its merchants is a payment facilitator or uses one, with the onboarding, payouts and liability that come with it ([Payments for Software Platforms](/books/payments/software-platforms)); the commerce tenant and the payments sub-merchant are the same merchant row with a `payment_account_ref`.

## Extensibility: Apps, Webhooks and Functions

A commerce platform is extended by code it doesn't own, and the platforms have converged on three shapes, each with a different blast radius:

| Shape | Runs | Can change the outcome | Failure mode | Examples |
| --- | --- | --- | --- | --- |
| **Asynchronous: webhooks and subscriptions** | After the change commits, on the app's servers | No; the order already exists | The app falls behind or misses events; the store is unaffected | Shopify webhooks, Commerce.com webhooks, commercetools Subscriptions, Adobe I/O Events, Medusa subscribers |
| **Synchronous: a call out inside the request** | Before the change commits, on the app's servers, within a timeout | Yes: validate, add update actions, reject | A slow or down app slows or fails the platform's request | commercetools API Extensions, Adobe Commerce webhooks, Saleor synchronous webhooks |
| **Sandboxed functions** | Inside the platform's checkout, in a WebAssembly sandbox with fixed limits | Yes, within a defined input and output | The function errors or exceeds its limits; the platform falls back | Shopify Functions |

The details show how each platform fences the risk:

- **commercetools API Extensions** run after a create or update request and before it persists, on carts, orders, payments, customers, quotes, business units, shopping lists and products; the timeout is "2 seconds by default," configurable to 10, and if the extension doesn't answer in time "the API call fails." A project may have 25 of them. The merchant's checkout availability is now the extension's availability.
- **Adobe Commerce webhooks** run synchronously on named events (`observer.*` or `plugin.*`) with a hard timeout per hook in milliseconds (0, the default, is no limit), a soft timeout that only logs, and a fallback error message shown if the hook fails. In-process plugins and observers, the older mechanism, run the merchant's PHP inside the platform with no fence at all.
- **Shopify Functions** compile from any language that targets WebAssembly (Rust is preferred), with a 256 kB binary, 10,000 kB of linear memory, and, for carts up to 200 lines, 11 million instructions, 128 kB of input and 20 kB of output. They cover discounts, cart transforms, delivery and payment customization, cart and checkout validation, fulfillment constraints, order routing and pickup options; custom apps with functions are Plus-only, public App Store apps run on any plan. A function is pure: it reads the input the platform gives it and returns operations, with no network call.

The rule I take from the three: put merchant logic that must decide the outcome in a sandboxed, pure function where you can, because a pure function with an instruction budget can't take your checkout down; use synchronous callouts only with a timeout, a fallback decision (fail open for a discount, fail closed for a fraud or compliance validation) and an alert; and send everything else asynchronously. It is the same principle [Extending a Hosted Checkout](/books/commerce/cart-and-checkout#extending-a-hosted-checkout) draws for the browser: third-party code reads events and returns decisions, and never gets the payment page.

**Apps are installations with scopes.** An app is a third party granted access to one merchant's data: Shopify's access scopes (`read_orders`, `write_orders`, with write implying read and older orders behind `read_all_orders`) and protected customer data levels, Commerce.com's OAuth scopes in read-only and modify pairs. An installation records which scopes the merchant granted, which API version the app calls, and which webhooks it subscribed to; uninstalling revokes the token and, on Shopify, starts the data deletion clock (`shop/redact` 48 hours after uninstall). What the scopes mean for security is [Store Security & PCI](/books/commerce/store-security-and-pci#app-and-admin-permissions); here the point is that each installation is a row the platform can audit, throttle and revoke.

**Privacy requests reach apps by webhook.** Shopify's App Store apps "must respond to data subject requests" received as `customers/data_request` and `customers/redact` (sent 10 days after the deletion request) and complete the action within 30 days. A platform building its own ecosystem needs the same: the privacy request in [Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#how-to-build-it) fans out to every installed app, and the request isn't complete until each has acknowledged.

## API Rate Limits and Bulk APIs

Every integration in this volume (the ERP sync, the marketplace feed, the 3PL connector, the subscription app) runs inside someone's rate limit, and the limits shape the design more than the endpoints do:

- **Shopify** prices GraphQL Admin requests by calculated cost: a restore rate of 100 points a second on Standard plans, 200 on Advanced, 1,000 on Plus and 2,000 on its enterprise tier, with no single query allowed above 1,000 points. The REST Admin API, "a legacy API as of October 1, 2024," allows 40 requests per app per store, replenishing at 2 a second, ten times that on Plus; new public apps have had to use GraphQL since April 1, 2025. Above 500,000 variants, a store can create at most 10,000 new variants a day (except on Plus).
- **Commerce.com** refreshes an app's quota every 30 seconds: 150 requests on Core and Growth, 450 on Scale, unlimited on its top plan, reported in `X-Rate-Limit-*` headers.
- **commercetools** publishes limits on resources rather than requests: up to 10 million carts and 10 million customers per project, 500 update actions per request, 500 results per query, an offset of at most 10,000, and only the last three months of orders indexed for queries.
- **Bulk paths exist for everything else.** Shopify's bulk operations run a query or a mutation as an asynchronous job: from API version 2026-01, up to five bulk queries per shop at once; results as JSONL with `__parentId` on child rows, at URLs that "expire after one week"; a query must finish in 10 days, a mutation in 24 hours, from an uploaded JSONL file of at most 100 MB. Adobe Commerce's bulk endpoints take "an array of request bodies," return a bulk ID and process on RabbitMQ. commercetools' Import API accepts up to 20 resources per request into containers it deletes after 72 hours without a retention policy.

What that means for the integration you build:

- **Spend the budget on what changed.** Webhooks or subscriptions for changes, a periodic reconciliation for what they missed, and bulk exports for full syncs; polling every resource on a timer exhausts the bucket on data that hasn't moved ([Sync Across Channels](/books/commerce/inventory#sync-across-channels) prioritizes the item with two left over the item with five hundred).
- **Back off on the platform's terms.** Read the remaining-budget headers, slow down before the 429, honor `Retry-After` when it comes, and queue work per merchant so one store's backlog doesn't starve another's ([Handling a 429](/docs/requests/rate-limiting#handling-a-429)).
- **Treat a bulk job as a job.** It has an ID, a status, a result URL that expires and partial failures to reconcile line by line; download promptly and count both sides, as [Choosing & Hosting a Store](/books/commerce/choosing-a-platform#how-to-build-it) does for exports ([Partial Failure](/docs/requests/bulk-operations#partial-failure)).
- **Pin an API version and plan the upgrade.** Shopify releases "a new API version every three months" and supports each "for a minimum of 12 months"; requests to a retired version "fall forward" to the oldest supported one, which is a silent behavior change. Each connected system records the version it calls, and the upgrade is scheduled work, not a surprise ([The Lifecycle](/docs/api-design/versioning#the-lifecycle)).

If you are the platform, the same list is your API's design: publish a budget per app per merchant, price expensive queries higher, offer a bulk path, version by date and say how long each version lives ([Limits](/docs/requests/rate-limiting#limits)).

## A Reference Architecture

Built yourself, for a brand or a platform, the system this volume describes is a short list of parts. Each is the owning chapter's tables behind a module interface, with the infrastructure in the Hosting & Cloud volume:

- **A storefront read path.** Catalog, prices for display, availability, search and content, served from caches and a search index fed by catalog and inventory events, purged by tag on `product.updated`, `price_list_item.changed` and `inventory_level.changed` ([Storefronts](/books/commerce/storefronts#how-to-build-it), [Site Search & Merchandising](/books/commerce/site-search-and-merchandising#how-to-build-it)). It scales with traffic and is the first thing to split out.
- **A transactional core.** One relational database holding the contexts above as modules: cart and checkout, orders, inventory, payments pointers, customers, returns, subscriptions. The order write, the stock commitment and the outbox share it so they can be atomic.
- **An outbox, a relay and a broker.** Every module's events go out through `outbox_events`; consumers inside the core and outside it read the broker, partitioned by order or merchant.
- **Workers.** Background jobs for everything that isn't a shopper waiting: sourcing and release, capture on shipment, label buying, renewals, feeds, exports, reconciliations, purges ([Background Jobs](/docs/architecture/background-jobs)).
- **Connectors.** One per connected system (marketplace, 3PL, carrier platform, tax engine, payments provider, ERP), each with its credentials reference, API version, rate-limit state and sync jobs ([ERP & Integrations](/books/commerce/erp-and-integrations)).
- **An extension surface.** Webhooks out, sandboxed functions in, app installations with scopes, if anyone other than you writes code against it.
- **A ledger and a warehouse.** Journal entries generated from orders, payments, inventory movements and settlements ([Commerce Accounting](/books/commerce/commerce-accounting)), and an analytics copy fed by change data capture, never reports run against the transactional database ([Data Pipelines](/docs/architecture/data-pipelines)).

What I buy rather than build, even when building the rest, is the list in [Build, Buy or Extend](/books/commerce/commerce-landscape#build-buy-or-extend): the payment page and vault (so the build stays on SAQ A), tax calculation, carrier labels, fraud screening and marketplace connections. Each is a connected system with a contract, not a module.

## How to Build It

The playbook's `outbox_events` table carries every event in the pipeline. This chapter adds the outbound side for apps and partners (subscriptions, deliveries and installations) and the inbound side for what platforms, carriers and marketplaces send:

```sql
CREATE TABLE app_installations (         -- a third party's access to one merchant
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  app_ref          TEXT NOT NULL,          -- the app's registered client ID
  scopes           TEXT[] NOT NULL,        -- as granted, e.g. '{read_orders,write_fulfillments}'
  protected_data   TEXT[] NOT NULL DEFAULT '{}',  -- customer fields granted: 'name', 'email', ...
  api_version      TEXT NOT NULL,          -- the dated version it calls
  token_ref        TEXT NOT NULL,          -- a secrets-manager key, never the token
  installed_by     TEXT NOT NULL,          -- the staff account that approved the scopes
  installed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uninstalled_at   TIMESTAMPTZ,
  redact_due_at    TIMESTAMPTZ,            -- the app's deletion deadline after uninstall
  status           TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'uninstalled')),
  UNIQUE (merchant_id, app_ref)
);

CREATE TABLE webhook_subscriptions (     -- who wants which events, where
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  app_installation_id UUID REFERENCES app_installations (id),  -- null: the merchant's own
  topic            TEXT NOT NULL,          -- 'order.placed', 'shipment.shipped', ...
  endpoint_url     TEXT NOT NULL,
  api_version      TEXT NOT NULL,          -- payload shape to render
  secret_ref       TEXT NOT NULL,          -- signing secret, rotated with overlap
  fields           TEXT[],                 -- a payload filter, null: the full snapshot
  status           TEXT NOT NULL CHECK (status IN ('active', 'failing', 'disabled')),
  failing_since    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, app_installation_id, topic, endpoint_url)
);

CREATE TABLE webhook_deliveries (        -- one event to one subscription, every attempt
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES webhook_subscriptions (id),
  event_id         UUID NOT NULL,          -- the outbox event; the receiver's dedupe key
  partition_key    TEXT NOT NULL,          -- order or resource ID, for per-entity order
  resource_version BIGINT,                 -- lets the receiver drop stale snapshots
  attempt          SMALLINT NOT NULL DEFAULT 0,
  next_attempt_at  TIMESTAMPTZ,
  last_status      SMALLINT,               -- HTTP status of the last attempt
  last_error       TEXT,
  delivered_at     TIMESTAMPTZ,
  gave_up_at       TIMESTAMPTZ,
  UNIQUE (subscription_id, event_id)
);
CREATE INDEX webhook_deliveries_due ON webhook_deliveries (next_attempt_at)
  WHERE delivered_at IS NULL AND gave_up_at IS NULL;

CREATE TABLE inbound_events (            -- what platforms, carriers and partners send in
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  sender_event_id  TEXT NOT NULL,          -- X-Shopify-Webhook-Id, a payload hash, a message ID
  topic            TEXT NOT NULL,          -- as the sender names it
  signature_ok     BOOLEAN NOT NULL,       -- verified before storing; false rows are quarantined
  body_ref         TEXT NOT NULL,          -- the raw body in object storage, as received
  resource_ref     TEXT,                   -- the sender's resource ID
  resource_version TEXT,                   -- its updated_at, version or sequence number
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at     TIMESTAMPTZ,
  outcome          TEXT CHECK (outcome IN ('applied', 'stale', 'duplicate_effect', 'failed')),
  UNIQUE (connected_system_id, sender_event_id)
);
```

Delivery is a work queue over the deliveries table, taken with `SKIP LOCKED` so several dispatchers never send one delivery twice at once ([SKIP LOCKED for Work Queues](/docs/database/transactions-and-concurrency#skip-locked-for-work-queues)):

```sql
-- Due deliveries, oldest first; per-entity order is kept by skipping an entity
-- whose earlier delivery to the same subscription is still pending.
SELECT d.id
FROM webhook_deliveries d
WHERE d.delivered_at IS NULL AND d.gave_up_at IS NULL
  AND d.next_attempt_at <= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM webhook_deliveries e
    WHERE e.subscription_id = d.subscription_id
      AND e.partition_key = d.partition_key
      AND e.id < d.id
      AND e.delivered_at IS NULL AND e.gave_up_at IS NULL)
ORDER BY d.next_attempt_at
LIMIT 100
FOR UPDATE OF d SKIP LOCKED;

-- Receiving: store first, then process. A duplicate is a no-op by constraint.
INSERT INTO inbound_events (connected_system_id, sender_event_id, topic, signature_ok,
                            body_ref, resource_ref, resource_version)
VALUES ($1, $2, $3, TRUE, $4, $5, $6)
ON CONFLICT (connected_system_id, sender_event_id) DO NOTHING
RETURNING id;   -- no row: already received; acknowledge and stop
```

Design notes:

- **Webhooks are a consumer of the outbox.** The dispatcher reads `outbox_events`, finds matching active subscriptions and inserts one delivery each; it never reads the orders table to decide what to send. An app is told about an order when, and only when, the order committed.
- **The event ID is the receiver's key.** It is stable across retries and sent as `Webhook-Id` with a signature over ID, timestamp and body ([Signatures](/docs/api-design/webhooks#signatures)); the receiver's unique constraint does the rest.
- **Per-entity order is optional and costs latency.** Holding back an order's second event until its first is delivered gives a receiver in-order delivery per order at the price of one slow event blocking that order's later ones. Shopify doesn't offer it; I offer it only when a consumer asks, and always send `resource_version` so a consumer can do without it.
- **A failing endpoint degrades, then stops.** `failing_since` starts at the first exhausted delivery; after the retry window the subscription is `disabled` and the merchant or developer is notified, as Shopify removes and Commerce.com deactivates. Redelivery from the retained events is a button, not a database edit ([Replay](/docs/api-design/webhooks#replay)).
- **Inbound bodies are kept as received.** `body_ref` holds the bytes, so a parsing bug or a renamed field is fixed by reprocessing, and an argument with a platform about what it sent is settled by the record.
- **Stale is an outcome, not an error.** An inbound event whose `resource_version` is older than what the record already reflects is recorded as `stale` and skipped; fetching the current resource is the safe default for anything that changes state.
- **Installations hold the grant.** Scopes, protected fields, the approving staff account and the API version are rows, so revoking an app is one status change and a review of who can read customer data is a query.
- **Emit `app.installed`, `app.uninstalled` and `webhook_subscription.disabled`,** which the merchant's notifications and the privacy request fan-out consume.

## Auditing

- **Every event, as published.** The outbox's events, retained long enough to replay a consumer's bug (30 days in the playbook), and every delivery attempt with its status, so "we never got that order" is answered with timestamps and response codes.
- **Every inbound delivery, as received.** Raw bodies, signatures verified, outcomes recorded, so a missed carrier scan or a duplicated marketplace order can be traced to what arrived.
- **Every app grant.** Installations, scopes, protected-data fields, approver, uninstall and deletion deadline, with the API calls made under each token in the access log ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every synchronous extension decision.** What an API extension, webhook or function returned for a checkout, and whether a timeout fell back, because a rejected order or a wrong discount is otherwise unexplainable.

## What This Means for the System You Build

- **Draw the contexts first** and give each table one owner; keep pricing out of the catalog, checkout out of orders and inventory out of fulfillment.
- **Start as a modular monolith on one database,** so the order, the stock commitment and the event commit together; split the storefront read path first.
- **Emit every state change through an outbox,** partitioned by order, with a version on every event, and treat webhooks as one more consumer.
- **Key every write that crosses a boundary,** from the checkout to the label purchase, and store inbound deliveries under the sender's ID before processing.
- **Keep the stock write short,** reserve at checkout, split hot counters, and put admission in front of a drop instead of locks.
- **Scope everything by merchant** and enforce it in the database if you sell software; shard by merchant when you outgrow one database.
- **Prefer sandboxed functions to synchronous callouts,** give every callout a timeout and a fail-open or fail-closed rule, and record installations with their scopes.
- **Design integrations for the rate limit,** with events for changes, bulk jobs for full syncs, backoff on the platform's headers and a pinned API version.

## References

**Platform documentation**

- [Shopify Engineering: Deconstructing the Monolith (February 21, 2019)](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity), the modular monolith and components that own their data
- [Shopify Engineering: A Pods Architecture to Allow Shopify to Scale (March 2, 2018)](https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale), sharding in 2015, pods in 2016, the router and pod moves
- [Shopify Engineering: BFCM readiness 2025 (November 20, 2025)](https://shopify.engineering/bfcm-readiness-2025), the 2024 peak request rates
- [Shopify: GraphQL Admin API rate limits](https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits), restore rates by plan and the 1,000-point query maximum
- [Shopify: REST Admin API](https://shopify.dev/docs/api/admin-rest), the legacy status, the 40-request bucket and the GraphQL requirement for new public apps
- [Shopify: API limits](https://shopify.dev/docs/api/usage/limits), array and pagination limits and the variant creation limit
- [Shopify: Bulk operation queries](https://shopify.dev/docs/api/usage/bulk-operations/queries), five concurrent operations, JSONL, expiring URLs and the 10-day limit
- [Shopify: Bulk operation imports](https://shopify.dev/docs/api/usage/bulk-operations/imports), bulk mutations, the 24-hour and 100 MB limits
- [Shopify: Webhooks](https://shopify.dev/docs/apps/build/webhooks), ordering and headers
- [Shopify: Troubleshooting webhooks](https://shopify.dev/docs/apps/build/webhooks/troubleshooting-webhooks), eight retries over four hours, removal and the five-second response
- [Shopify: Ignore duplicate webhooks](https://shopify.dev/docs/apps/build/webhooks/ignore-duplicates), deduplication by webhook ID and the event ID's purpose
- [Shopify: Privacy law compliance](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance), the mandatory compliance webhooks and their timing
- [Shopify: API versioning](https://shopify.dev/docs/api/usage/versioning), the quarterly release, 12-month support and fall-forward
- [Shopify: Function APIs](https://shopify.dev/docs/api/functions), the APIs and execution limits
- [Shopify: About Shopify Functions](https://shopify.dev/docs/apps/build/functions), languages and the Plus restriction for custom apps
- [Shopify: Implementing idempotency](https://shopify.dev/docs/apps/build/apis/graphql-admin/implementing-idempotency), the `@idempotent` directive, its mutations and the 24-hour window
- [Shopify changelog: Making idempotency mandatory (December 12, 2025)](https://shopify.dev/changelog/making-idempotency-mandatory-for-inventory-adjustments-and-refund-mutations), mandatory from 2026-04
- [Shopify: Access scopes](https://shopify.dev/docs/api/usage/access-scopes), order scopes and least privilege
- [Commerce.com: API rate limits](https://docs.bigcommerce.com/docs/start/best-practices/api-rate-limits), quotas per 30 seconds by plan and the headers
- [Commerce.com: Webhooks](https://docs.bigcommerce.com/docs/integrations/webhooks), the retry schedule, deactivation, thin payloads and the hash
- [Commerce.com: API accounts](https://docs.bigcommerce.com/docs/start/authentication/api-accounts), account types and scopes
- [Commerce.com: Checkout SDK](https://docs.bigcommerce.com/docs/storefront/cart-checkout/checkout-sdk), custom checkouts
- [commercetools: API Extensions](https://docs.commercetools.com/api/projects/api-extensions), resources, timeouts and the failure behavior
- [commercetools: Subscriptions](https://docs.commercetools.com/api/projects/subscriptions), destinations, at-least-once delivery and ordering
- [commercetools: General concepts](https://docs.commercetools.com/api/general-concepts), versions and eventual consistency of inventory
- [commercetools: Limits](https://docs.commercetools.com/api/limits), resource, query and import limits
- [Adobe Commerce: Webhooks](https://developer.adobe.com/commerce/extensibility/webhooks/), synchronous calls to external systems
- [Adobe Commerce: Create webhooks](https://developer.adobe.com/commerce/extensibility/webhooks/create-webhooks), hook timeouts, soft timeouts and fallback messages
- [Adobe I/O Events: Retries](https://developer.adobe.com/events/docs/common/retry-doc), the 24-hour retry window
- [Adobe Commerce: Plugins](https://developer.adobe.com/commerce/php/development/components/plugins), interceptors and their limits
- [Adobe Commerce: Bulk endpoints](https://developer.adobe.com/commerce/webapi/rest/use-rest/bulk-endpoints/), the `/async/bulk` routes and RabbitMQ
- [Saleor: Synchronous events](https://docs.saleor.io/developer/extending/webhooks/synchronous-events/overview), in-request webhooks and response time
- [Medusa: Compensation function](https://docs.medusajs.com/learn/fundamentals/workflows/compensation-function), rolling back workflow steps
- [Medusa: Events and subscribers](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers), asynchronous subscribers and the event module
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), stored responses and the 24-hour key age
