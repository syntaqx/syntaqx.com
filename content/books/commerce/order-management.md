+++
title = "Order Management"
description = "What an OMS owns: order, fulfillment and payment states, holds, edits and cancellations, splits and merges, and sourcing rules that pick where each line ships."
category = "Commerce Industry"
order = 2316
part = "Orders, Inventory and Fulfillment"
tags = ["commerce", "orders", "oms", "fulfillment", "sourcing", "data-model"]
+++

An order is accepted in a second and lived with for weeks. Between the click and the delivery it is checked for fraud, held for a bad address, edited because the shopper wanted the other color, split because the case is in Reno and the screen protector is in Memphis, partly cancelled because the Memphis count was wrong, re-routed to a store, shipped in two boxes, and reported back to the marketplace that took it inside that marketplace's deadline. Every one of those steps changes what the customer is owed, what the card may be captured for, what the warehouse should pick and what the channel should be told. Order management is the system that keeps those answers consistent while the order is still moving.

Every commerce platform ships a basic order manager, and enterprise brands buy a distributed order management system (OMS) when orders come from many channels and ship from many places ([OMS, WMS and ERP](/books/commerce/commerce-landscape#oms-wms-and-erp)). This chapter covers what that system owns: the states an order and its fulfillments move through, holds, edits and cancellations, splits and merges, and the sourcing rules that decide which location ships each line. It extends `orders`, `fulfillments` and `order_status_changes` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#how-to-build-it). Stock and availability belong to [Inventory](/books/commerce/inventory), the building that picks the order to [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls), and the parcel to [Shipping & Carriers](/books/commerce/shipping-and-carriers); store pickup and ship-from-store are covered in the later Omnichannel Fulfillment chapter.

## How the Platforms Do It

As of October 2026, from developer documentation and product pages:

| System | How an order is modeled | States | Holds, edits and splits | Sourcing |
| --- | --- | --- | --- | --- |
| **Shopify** | An order, plus one or more fulfillment orders, each assigned to a location; a fulfillment is the record of work done against a fulfillment order | Fulfillment order: `OPEN`, `SCHEDULED` (deferred until `fulfill_at`), `ON_HOLD`, `IN_PROGRESS`, `INCOMPLETE`, `CLOSED`, `CANCELLED` | Hold reasons include awaiting payment, high fraud risk, incorrect address, out of stock, a post-purchase upsell offer, return items not yet received in an exchange and an unknown delivery date; actions include hold, release, move, split, merge, request fulfillment and request cancellation; edits are staged on a calculated order and committed, unfulfilled lines only | Order routing applies rules in sequence; the defaults minimize split fulfillments, stay within the destination market and ship from the closest location; requires two or more active locations |
| **commercetools** | An order with separate order, shipment and payment state fields | Custom States model "finite state machines that reflect your custom business logic," with transitions validated on `transitionState`; no transitions set means no validation | Order edits can be created only when the order and its lines use inventory mode `None`, because order edits don't track or reserve stock | Left to the integrator or a separate OMS |
| **IBM Sterling Order Management** | Orders move through configurable pipelines of statuses, each transaction leaving the document in a "drop status" | Created, Reserved, Backordered, Scheduled, Released, Sent To Node, Included In Shipment, Shipped, Held, Shipment Delayed, Cancelled, Shorted, among others | Holds and backorders are statuses in the pipeline | Scheduling to a node (a store, a warehouse or a supplier) is a pipeline step |
| **Manhattan Active Omni** | Central orchestration across channels, fulfillment methods and sources | Not detailed publicly | Not detailed publicly | "Dynamically selects the best source and route for every order," and "governs which inventory is exposed to which channels" |
| **Fluent Commerce** | Workflow-driven orchestration "across channels, stores and warehouses" | Defined in each merchant's workflows; the technical documentation is gated | Ship from store, click and collect, returns and exchanges | Real-time availability paired with orchestration |
| **Amazon (as a channel)** | The order arrives already taken and charged; the seller's system pulls it through the Orders API | `Pending` (payment not authorized), `Unshipped`, `PartiallyShipped`, `Shipped`, `InvoiceUnconfirmed`, `Canceled`, `Unfulfillable` (Multi-Channel Fulfillment only), `PendingAvailability` (pre-orders) | A buyer can request a cancellation, with a reason | Amazon sources its own network; the seller sources the rest |

Salesforce Order Management, Kibo and others sit in the same class as Manhattan, Fluent and Sterling; Salesforce's order management documentation couldn't be read for this edition, so its object model isn't compared here. <!-- source-gap: salesforce-oms-model | missing | Salesforce Order Management order summary, change order and fulfillment order model and statuses | closes with: a readable page of Salesforce's Order Management developer guide or object reference | checked: 2026-10-28 -->

Three patterns run through the table:

- **The order is not the unit of work.** Shopify's fulfillment order, Sterling's scheduled release to a node and Amazon's partially shipped state all say the same thing: the order is what was bought, and the work is done per location in pieces that each have their own state. That is the order-versus-fulfillment split in the core model.
- **State machines are configuration.** commercetools validates transitions only if you define them, Sterling's pipelines and Fluent's workflows are configured per merchant, and Shopify's fixed fulfillment order states still leave each app to map its own. An OMS's states are a business decision written as data, not a fixed enum.
- **Holds are first-class.** Every system has a way to stop work on an order without cancelling it, and Shopify's list of hold reasons is a good catalog of why: payment, fraud, address, stock, an upsell window, a pending exchange, an unknown date.

## What an Order Manager Owns

Whatever it's called, the order manager does seven things:

1. **Capture.** Take orders from every channel (the brand's checkout, marketplaces, a retailer's EDI purchase order, the point of sale, a call center) into one model, deduplicated by the channel's order ID ([The Core Data Model](/books/commerce/commerce-business#the-core-data-model)).
2. **Validate and hold.** Check payment, fraud, address, stock and anything the merchant's rules care about, and hold what can't go yet.
3. **Source.** Decide which location ships each line, by which provider, and split the order into fulfillments.
4. **Release.** Send each fulfillment to the warehouse, 3PL, store or supplier, and get an acceptance back.
5. **Change.** Apply edits, cancellations, address changes and re-sourcing while the order is in flight, and know when it's too late.
6. **Report.** Tell the customer and the channel what shipped, with tracking, inside the channel's deadline.
7. **Reconcile.** Make the order's lines, fulfillments, shipments, captures and refunds add up when it's done.

It owns the order, not the stock, the building or the money. Inventory is counted by the WMS, the 3PL or the point of sale and summarized for selling ([Inventory](/books/commerce/inventory)); picking is the warehouse's; the authorization and capture belong to the payment provider and the [Payments](/books/payments/card-payments#the-core-data-model) volume's records. Where a mid-size brand runs a platform, an OMS and an ERP together, the first design decision is which one is the system of record for the order (usually the OMS once it exists, with the platform as one more channel), recorded as data rather than left to whichever system wrote last ([The Commerce Landscape](/books/commerce/commerce-landscape#how-to-build-it)).

## Order States

An order in flight has at least three state machines, and most bugs come from collapsing them into one status column:

- **The order** (placed, then open until every line is fulfilled or cancelled, then closed). On a delivery order it also has accepted, preparing and ready ([The Order Lifecycle](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle)).
- **Each fulfillment** (open, on hold, scheduled, requested from the provider, accepted, in progress, shipped or closed, cancelled), one per location and provider. Shopify's fulfillment order states are a fair template.
- **The payment** (authorized, partially captured, captured, partially refunded, refunded, voided, expired), which the Payments volume owns ([Explicit State Machines](/docs/payments/payment-states#explicit-state-machines)).

The order's own status is then mostly a rollup: partially fulfilled when some fulfillments shipped and others didn't, fulfilled when every line is shipped or cancelled. Amazon's `PartiallyShipped` and Shopify's `IN_PROGRESS` (set when a fulfillment covers only part of a fulfillment order) are the same rollup seen from two sides. My rule: store the fulfillment and payment states, derive the order's display status from them, and never let a person or an integration set "fulfilled" on the order directly; it then can't disagree with its own fulfillments.

Three properties every one of these machines needs:

- **Transitions are rows with a cause.** Who changed it (customer, merchant staff, a rule, a provider, a channel), why, and when, in `order_status_changes`. A cancellation with no reason can't be charged to anyone and can't be explained to a marketplace that counts cancellations against the seller.
- **Some transitions go backwards.** A hold releases to open; a provider rejects a fulfillment request and the lines go back to be re-sourced; a courier unassigns before pickup. A machine that only moves forward strands those orders.
- **Some states are a point of no return.** Once the warehouse starts picking, a cancellation is a request the warehouse may refuse: Amazon's Multi-Channel Fulfillment says an order in `Processing` can no longer be cancelled by the seller, and Shopify routes cancellation of an accepted fulfillment order to the fulfillment service as a request it accepts or rejects. The OMS has to know, per provider, which states those are.

## Holds

A hold stops work on an order, or on one of its fulfillments, without cancelling it. The reasons are the same across systems:

| Hold | Placed by | Released when |
| --- | --- | --- |
| **Payment** | The payment step: an authorization pending, a bank transfer or cash-on-delivery not yet confirmed, a B2B order over its credit limit | Payment confirmed, or the order is cancelled after a deadline |
| **Fraud review** | A fraud score over a threshold, or a chargeback-guarantee vendor's decision ([Rules, Models and Decisions](/books/payments/fraud-and-risk#rules-models-and-decisions)) | A reviewer or the vendor approves; a decline cancels and voids the authorization |
| **Address** | Address validation failed or the address is undeliverable for the chosen service ([Validate](/docs/fundamentals/addresses#validate)) | The customer confirms or corrects it |
| **Stock** | No location can source a line; a pre-order or backorder | Stock arrives or is reallocated; the customer accepts a delay or cancels |
| **Upsell window** | A post-purchase offer is still open, so the order may still grow | The window closes |
| **Exchange** | An exchange ships only after the returned item arrives | The return is received |
| **Schedule** | A subscription renewal, a delivery date the customer picked, a launch date | The release time arrives (Shopify's `SCHEDULED` with `fulfill_at`) |
| **Compliance** | Age, hazmat, export or regulated-product checks that need a person | The check passes |
| **Merchant** | Staff placed it: a customer called, a VIP gift note, a suspected duplicate | Staff release it |

Each hold is a row: what it holds (the whole order or one fulfillment), its kind, who placed it, a note, an expiry and how it ended. Holds stack (an order can wait on fraud and address at once), and release happens only when the last active hold ends. Two rules come from how holds fail:

- **Every hold has a clock.** An authorization expires while an order sits in review ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)); a shipping promise runs out while it waits for stock. A hold without an expiry or an escalation becomes an order nobody ships.
- **A hold must reach the building.** Shopify won't let fulfillment start on a held fulfillment order; a 3PL that already has the order needs a cancellation request or its own hold, which only works before picking. Holds belong before release, which is why fraud and address checks run as early as they can.

## Edits and Cancellations

Customers change their minds, and staff fix mistakes. The edit model is the same across platforms: open an edit, stage changes against a calculated copy of the order, show the new total, and commit. Shopify's order editing API stages changes on a `CalculatedOrder` and applies them on commit; it allows adding a variant or a custom item, changing a quantity (zero removes the line), adding or removing a line discount and, since its 2024-04 version, changing a custom shipping line. It allows editing "only unfulfilled line items," and if the total changes "a balance might need to be collected from or refunded to the customer," which the commit can send as an invoice. Its `orders/edited` webhook carries the changes as deltas rather than the order's new state, so every consumer has to apply edits in order. commercetools takes the stricter line that an order edit is possible only when the order doesn't track or reserve inventory, which pushes stock adjustment onto the integrator.

An edit touches four other systems, and the OMS sequences them:

- **Inventory.** An added line reserves stock; a removed one releases it ([Reservations](/books/commerce/inventory#reservations)).
- **Payment.** A higher total needs a new authorization or an incremental one where the network and the merchant category allow it; a lower total is a partial capture or a refund ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)). The later Taking Payment in Commerce chapter covers the capture plans.
- **Tax and promotions.** Tax is recalculated on the new lines; a discount that required a minimum may no longer apply, and the edit has to decide whether the customer keeps it.
- **The building.** If a fulfillment was already released, the change is a cancellation request plus a new fulfillment, and it may be refused.

**Cancellation is an edit to zero, with a cause.** A whole-order cancel before release voids the authorization, releases stock and closes the order. A partial cancel (one line, or two of five units) after the warehouse reports a short pick releases that quantity, reduces what will be captured, and has to be reported to the channel. Marketplaces count seller cancellations against the seller: Walmart's seller performance standards set a cancellation rate of 2% or lower, alongside on-time delivery of 90% or higher and a valid tracking rate of 99% or higher, evaluated over 30 or 60 days by metric. Amazon's order model separates a buyer-requested cancellation, with the buyer's reason, from one the seller initiates. The cause on the status change is what lets a merchant tell the two apart in its own rate.

**When the promise slips, the law has a script.** A US seller taking orders by mail, phone or internet must have "a reasonable basis to expect" it can ship within the time it states (30 days if it states none, 50 when the buyer applies for the seller's credit), and if it can't, must offer the buyer the option to consent to the delay or cancel for a prompt refund, which for most payments means within seven working days ([FTC Mail, Internet, or Telephone Order Merchandise Rule](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435)). The order manager is where that rule is kept: the promised ship date on the order, a stock hold that knows it, a delay notice sent before the deadline, and a cancel-and-refund path that runs without someone remembering. The later Consumer Protection Online chapter covers the rule in full; the delivery promise itself is in [Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises).

## Splits and Merges

An order splits when no one location should ship all of it:

- **Stock.** The lines sit in different locations, or none has the full quantity.
- **Timing.** A pre-order or backordered line ships later than the rest; a subscription ships an item on a different cadence.
- **Handling.** Hazmat, oversized, cold-chain, high-value or age-restricted lines ship from a location or by a service the rest don't need.
- **Provider.** A drop-ship line goes to its supplier; a marketplace's network holds some units and the brand's 3PL others.
- **Destination.** A gift goes to a different address than the rest of the order.

Shopify makes the split structural: it creates one fulfillment order per assigned location when routing completes, and lets an app or merchant split a fulfillment order further, move it to another location (only between merchant-managed locations, and without changing the shipping rate the customer already paid) or merge fulfillment orders back together. A partial fulfillment request to a 3PL closes the original fulfillment order and opens one for what was submitted and one for what wasn't.

**A split costs real money.** Each extra fulfillment is another label, another pick and pack, often another box, and on many carriers' rate cards two parcels cost more than one ([Rate Shopping](/books/commerce/shipping-and-carriers#rate-shopping)). It also costs the customer: two deliveries on different days, two tracking emails, and on a card order two captures, each inside the authorization's window. That's why Shopify's first default routing rule is to minimize split fulfillments, and why the sourcing step below scores splits rather than just allowing them.

**Merges** go the other way: two orders from the same customer to the same address within a short window, or an order and its edit's new line, combined into one shipment. Merging fulfillments of the same order is routine; merging across orders changes what each order's tracking says and how each is captured, so I merge shipments (one box, two orders' lines, recorded on each order's fulfillment) and never the orders themselves.

## Sourcing and Distributed Order Management

Sourcing (also called routing or brokering) picks, for each line, the location and provider that ship it. A brand with one warehouse has nothing to decide; a brand with two 3PL nodes, forty stores, stock at Amazon's network and two drop-ship suppliers decides on every order, and distributed order management is the name for doing it well.

Every sourcing engine has the same two stages:

1. **Filter** to the locations that can ship each line at all: the item is available there ([Available to Promise](/books/commerce/inventory#available-to-promise)), the location is active and fulfills this channel and fulfillment type, it can reach the destination by the service sold, it has capacity left today, and nothing about the item (hazmat, a state's shipping restriction, a regulated product) excludes it.
2. **Rank** the feasible plans (a plan is an assignment of every line to a location) by the merchant's objectives: fewest splits, nearest to the customer or lowest zone, lowest total cost (label plus handling plus the split's extra parcel), meeting the promised delivery date, staying in the destination market, protecting store stock for walk-in shoppers, using older or nearer-expiry stock first, balancing load across nodes.

Shopify implements the ranking as rules applied in sequence, each narrowing the candidates (its defaults: minimize splits, stay in market, closest location), with custom rules that can read location metafields such as capacity or speed. Enterprise OMSs (Manhattan's "optimized fulfillment sourcing," Sterling's scheduling, Fluent's workflows) add cost-based optimization across the network. The two approaches differ in how objectives combine: a sequence of rules is a lexicographic order, where the first rule always wins, and a cost function is a weighted sum, where a large enough saving can outvote a split. The playbook's [Two Ways to Fold](/docs/architecture/weighing-objectives#two-ways-to-fold) covers when each is right; my default for sourcing is hard constraints for anything promised to the customer (the delivery date, the market, regulated handling) and a weighted cost in one unit, money, for everything else ([One Unit, Preferably Money](/docs/architecture/weighing-objectives#one-unit-preferably-money)).

Four rules that sourcing engines learn the hard way:

- **Source against availability, then reserve, in one step.** Two orders sourced against the same last unit both win unless the decision reserves what it picked ([Overselling](/books/commerce/inventory#overselling)).
- **Expect rejection.** A store can't find the item, a 3PL rejects the request, a supplier is out. A rejected fulfillment goes back to sourcing with the rejecting location excluded, and the decision log shows both attempts.
- **Re-source on a timer, not only on events.** A fulfillment that a location accepted but hasn't started by its cutoff is a fulfillment that will miss its promise; moving it to the next-best node while there's still time is a sourcing decision too.
- **Backorders are allocation.** When no location has stock, the line waits for supply. NetSuite's Supply Allocation shows the full version: it matches demand to "future inventory on supply orders in addition to current, on-hand inventory," allocates by strategy (all at once when the full quantity is available, or as close as possible to a required-by date), and raises an exception for orders that won't be supplied in time. The later Purchasing & Replenishment chapter covers the supply side.

**Record every decision.** Which rule set and version ran, which locations were candidates, why each was excluded, the scores, the plan chosen and the one it beat. A customer asking why their order came in two boxes, a store manager asking why her stock keeps going online, and an analyst asking whether the cost weights pay off all read the same row ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Channel Orders: Marketplaces and Purchase Orders

Orders the merchant didn't take itself arrive with their own rules:

- **Marketplace orders are already paid,** with the price, tax and shipping service set by the marketplace, a ship-by deadline and often a deliver-by date. The OMS's job is to source and ship inside the deadline and confirm shipment with valid tracking, because both are measured (Walmart's 99% valid tracking and 90% on-time delivery above). The marketplace may cancel at the buyer's request before shipment; the OMS must check for that before release and again before the label is bought.
- **Marketplace-fulfilled orders are someone else's to ship.** An order Amazon fulfills from its own network appears in the seller's records for accounting but not in the OMS's sourcing; mixing them up double-ships ([Amazon Multi-Channel Fulfillment and FBA](/books/commerce/warehouses-and-3pls#amazon-multi-channel-fulfillment-and-fba)).
- **A retailer's purchase order is an order with a negotiation attached.** The brand acknowledges each line (accept, change, reject) before it ships, ships to the date and carrier the retailer's routing guide sets, and sends an advance ship notice before the truck arrives ([The Life of an Order](/books/commerce/commerce-business#the-life-of-an-order)). Its "edits" are change requests from the buyer, and its short-ships are deductions later; the later Wholesale & Retail Distribution and EDI chapters cover them.

## How to Build It

The core `orders`, `fulfillments` and `order_status_changes` tables already split the order from its fulfillments and record transitions. Order management adds holds, edits, sourcing rules and the decisions they produce:

```sql
ALTER TABLE order_lines
  ADD COLUMN cancelled_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0
    CHECK (cancelled_quantity >= 0);       -- partial cancels; quantity stays as ordered

ALTER TABLE orders
  ADD COLUMN ship_by       TIMESTAMPTZ,      -- the channel's or our own promised ship date
  ADD COLUMN deliver_by    TIMESTAMPTZ,      -- the delivery promise, when one was made
  ADD COLUMN released_at   TIMESTAMPTZ;      -- first fulfillment sent to a provider

ALTER TABLE fulfillments
  ADD COLUMN request_status TEXT NOT NULL DEFAULT 'unsubmitted' CHECK (request_status IN
    ('unsubmitted', 'requested', 'accepted', 'rejected', 'cancellation_requested',
     'cancellation_accepted', 'cancellation_rejected')),  -- the handshake with the provider
  ADD COLUMN fulfill_at     TIMESTAMPTZ,     -- scheduled release
  ADD COLUMN point_of_no_return TIMESTAMPTZ, -- when the provider started picking
  ADD COLUMN sourcing_decision_id UUID;      -- sourcing_decisions, below

ALTER TABLE order_status_changes
  ADD COLUMN fulfillment_id UUID REFERENCES fulfillments (id),  -- null: the order itself
  ADD COLUMN subject        TEXT NOT NULL DEFAULT 'order' CHECK (subject IN ('order',
                              'fulfillment', 'line'));

CREATE TABLE order_holds (               -- work stopped, not cancelled
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  fulfillment_id UUID REFERENCES fulfillments (id),  -- null: holds the whole order
  kind           TEXT NOT NULL CHECK (kind IN ('payment', 'fraud', 'address', 'stock',
                   'upsell_window', 'exchange', 'schedule', 'compliance', 'merchant')),
  placed_by      TEXT NOT NULL,          -- a rule ID, a user ID, a vendor
  note           TEXT,
  expires_at     TIMESTAMPTZ,            -- escalate or cancel after this
  released_at    TIMESTAMPTZ,
  released_by    TEXT,
  outcome        TEXT CHECK (outcome IN ('released', 'cancelled_order', 'expired')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((released_at IS NULL) = (outcome IS NULL))
);

CREATE INDEX order_holds_active ON order_holds (order_id) WHERE released_at IS NULL;

CREATE TABLE order_edits (               -- one staged-and-committed change set
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id        UUID NOT NULL REFERENCES orders (id),
  requested_by    TEXT NOT NULL CHECK (requested_by IN ('customer', 'merchant', 'channel',
                    'system')),
  actor_ref       TEXT,
  kind            TEXT NOT NULL CHECK (kind IN ('add_line', 'change_quantity', 'remove_line',
                    'cancel_order', 'change_address', 'change_shipping', 'discount')),
  changes         JSONB NOT NULL,        -- line deltas as staged
  total_before    BIGINT NOT NULL,       -- minor units
  total_after     BIGINT NOT NULL,
  payment_action  TEXT CHECK (payment_action IN ('none', 'reauthorize', 'invoice_balance',
                    'reduce_capture', 'refund')),
  status          TEXT NOT NULL CHECK (status IN ('staged', 'committed', 'abandoned',
                    'rejected_by_provider')),
  reason          TEXT,                  -- a code: 'customer_request', 'short_pick', 'fraud'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at    TIMESTAMPTZ
);

CREATE TABLE sourcing_rules (            -- the merchant's routing policy, versioned
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  rule_set     TEXT NOT NULL,            -- e.g. 'default', 'peak', 'wholesale'
  version      INT NOT NULL,
  position     SMALLINT NOT NULL,        -- evaluation order within the set
  kind         TEXT NOT NULL CHECK (kind IN ('exclude', 'require', 'prefer',
                 'minimize_splits', 'closest', 'lowest_cost', 'same_market',
                 'protect_store_stock', 'oldest_stock_first', 'balance_load')),
  params       JSONB NOT NULL DEFAULT '{}',  -- location IDs, weights, thresholds
  is_hard      BOOLEAN NOT NULL DEFAULT FALSE,  -- a constraint, not a preference
  channel      TEXT,                     -- null: every channel
  valid_during TSTZRANGE NOT NULL,
  UNIQUE (merchant_id, rule_set, version, position)
);

CREATE TABLE sourcing_decisions (        -- every routing decision and why
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id         UUID NOT NULL REFERENCES orders (id),
  attempt          SMALLINT NOT NULL,    -- 1, then 2 after a rejection, and so on
  trigger          TEXT NOT NULL CHECK (trigger IN ('placed', 'edit', 'rejected',
                     'released_hold', 'cutoff_missed', 'manual')),
  rule_set         TEXT NOT NULL,
  rule_set_version INT NOT NULL,
  candidates       JSONB NOT NULL,       -- each location: feasible, exclusion reason, score
  chosen_plan      JSONB NOT NULL,       -- line to location assignments
  runner_up_plan   JSONB,
  estimated_cost   BIGINT,               -- minor units: labels, handling, split penalty
  split_count      SMALLINT NOT NULL,
  decided_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, attempt)
);

ALTER TABLE fulfillments
  ADD CONSTRAINT fulfillments_sourcing_decision_fk
    FOREIGN KEY (sourcing_decision_id) REFERENCES sourcing_decisions (id);
```

Releasing an order is a query, not a flag: a fulfillment is releasable when its order has no active hold covering it, its own `fulfill_at` has passed and its request is unsubmitted.

```sql
SELECT f.id
FROM fulfillments f
WHERE f.request_status = 'unsubmitted'
  AND f.status = 'pending'
  AND (f.fulfill_at IS NULL OR f.fulfill_at <= NOW())
  AND NOT EXISTS (
    SELECT 1 FROM order_holds h
    WHERE h.order_id = f.order_id
      AND h.released_at IS NULL
      AND (h.fulfillment_id IS NULL OR h.fulfillment_id = f.id))
FOR UPDATE OF f SKIP LOCKED;
```

Design notes:

- **The order's status is derived.** `orders.status` moves to `partially_fulfilled` and `fulfilled` only as a result of fulfillment and line changes, in the same transaction, never by a direct update; the release query above is the only way work leaves the OMS.
- **The provider handshake is its own column.** `request_status` records what the warehouse or 3PL agreed to, separately from `status`, which records what physically happened. A fulfillment can be `pending` and `requested`, or `pending` and `rejected` on its way back to sourcing; Shopify's fulfillment request and cancellation request flow is this handshake ([Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl)).
- **Holds are rows, not a status.** Several can be active at once, each with its own clock, and the active-holds index makes the release check cheap. An expiring hold is a job that escalates or cancels ([Background Jobs](/docs/architecture/background-jobs)).
- **Edits keep the before and after.** `total_before`, `total_after` and the payment action are what the payment step executes and what a refund dispute reads. A committed edit emits `order.edited` with its deltas, and consumers apply edits in order by ID.
- **Sourcing rules are versioned data.** A rule change is a new version with a validity range, and each decision names the version it ran, so a new rule can be replayed against last month's orders before it goes live ([Replay and Shadow Testing](/docs/architecture/weighing-objectives#replay-and-shadow-testing)).
- **Rejections create attempts.** A rejected fulfillment triggers a new `sourcing_decisions` row with the rejecting location excluded; the attempts on one order are its routing history.
- **Releases use `SKIP LOCKED`.** Several release workers can take fulfillments without double-sending one ([SKIP LOCKED for Work Queues](/docs/database/transactions-and-concurrency#skip-locked-for-work-queues)), and each request to a provider carries an idempotency key derived from the fulfillment ID ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).

## Auditing

- **Every transition with its cause.** Order, line and fulfillment status changes with actor, reason and time, so a cancellation can be classed as buyer, seller or system against a marketplace's rate.
- **Every hold.** Who placed it, why, how long it lasted and how it ended; a fraud hold that expired an authorization, or a stock hold that outlived a shipping promise, is found here.
- **Every edit.** The staged changes, the totals before and after, the payment action taken, and the customer's consent where the total went up.
- **Every sourcing decision.** The rule set and version, the candidates and exclusions, the chosen plan and its cost, and each re-sourcing attempt.
- **Every promise and notice.** The ship-by and deliver-by on the order, and each delay notice sent with the option it offered, kept for as long as the FTC rule's complaint window and the merchant's own policy require.

## What This Means for the System You Build

- **Run order, fulfillment and payment as separate state machines,** derive the order's status from the other two, and allow transitions that go backwards.
- **Record every transition with actor and reason,** so cancellations and delays can be attributed.
- **Model holds as rows** with a kind, an owner and an expiry, release only when the last one ends, and hold before release to the building.
- **Stage edits against a calculated copy,** commit atomically with their inventory, tax and payment consequences, and know each provider's point of no return.
- **Treat a cancellation after release as a request** the provider can refuse.
- **Split on purpose and score the cost of a split;** merge shipments, not orders.
- **Source in two stages,** hard filters then a ranking, with promises as constraints and everything else in money, and reserve what the decision picked in the same step.
- **Version sourcing rules and log every decision,** including re-sourcing after rejections and missed cutoffs.
- **Keep the ship-by and deliver-by dates on the order** and send the delay option before the promise breaks.

## References

**Platform documentation**

- [Shopify: FulfillmentOrderStatus](https://shopify.dev/docs/api/admin-graphql/latest/enums/FulfillmentOrderStatus), the seven fulfillment order states and the scheduled `fulfill_at` deferral
- [Shopify: FulfillmentHoldReason](https://shopify.dev/docs/api/admin-graphql/latest/enums/FulfillmentHoldReason), the hold reasons
- [Shopify: FulfillmentOrderAction](https://shopify.dev/docs/api/admin-graphql/latest/enums/FulfillmentOrderAction), hold, release, move, split, merge and request actions
- [Shopify: Build fulfillment solutions](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/build-fulfillment-solutions), fulfillment orders per location, moves between merchant-managed locations without changing the shipping rate, partial requests, `IN_PROGRESS` and `CLOSED`
- [Shopify: Edit existing orders](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/edit-orders), allowed edits, unfulfilled lines only, balances and invoices, the `orders/edited` webhook
- [Shopify: orderEditBegin](https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderEditBegin), the calculated order and staged edit session
- [Shopify Help Center: Order routing](https://help.shopify.com/en/manual/fulfillment/setup/order-routing), rules in sequence, the three default rules, metafield-based rules and the two-location requirement
- [commercetools: States](https://docs.commercetools.com/api/projects/states), custom state machines and transition validation
- [commercetools: Carts and Orders overview](https://docs.commercetools.com/api/carts-orders-overview), order edits limited to inventory mode `None`
- [IBM Sterling Order Management: Order fulfillment statuses](https://www.ibm.com/docs/en/SS6PEW_10.0.0/configuration/t_OrderFulfillmentStatuses.html), the pipeline statuses and drop statuses
- [Manhattan: Order Management System](https://www.manh.com/solutions/omnichannel-software-solutions/order-management-system), source and route selection and channel inventory exposure
- [Fluent Commerce: Order management](https://fluentcommerce.com/order-management-system/), orchestration across channels, stores and warehouses with real-time availability
- [Amazon Selling Partner API: Orders API model](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/orders-api-model/ordersV0.json), order statuses and buyer cancellation fields
- [Amazon Selling Partner API: Fulfillment Outbound API model](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/fulfillment-outbound-api-model/fulfillmentOutbound_2020-07-01.json), the `Processing` state after which the seller can't cancel
- [NetSuite: Supply Allocation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156424975823.html), allocating future supply, allocation strategies and exceptions

**Marketplace standards and regulation**

- [Walmart Marketplace: Seller performance standards (updated July 28, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Seller%20performance/Seller-performance-standards), cancellation, on-time delivery and valid tracking thresholds and their windows
- [eCFR: 16 CFR Part 435, Mail, Internet, or Telephone Order Merchandise](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435), reasonable basis, the 30 and 50 day defaults, the delay option and prompt refunds
- [FTC: Business Guide to the Mail, Internet, or Telephone Order Merchandise Rule](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule), refund timing in seven working days or one billing cycle
