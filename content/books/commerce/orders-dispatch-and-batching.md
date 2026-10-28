+++
title = "Orders, Dispatch & Batching"
description = "The delivery order lifecycle, prep time and ETA estimation, courier assignment and batching, shop-and-deliver, scheduled versus ASAP, and the handoff."
category = "Commerce Industry"
order = 2344
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "dispatch", "batching", "eta", "orders"]
+++

A delivery order is two schedules that have to meet. The kitchen's: accept the order, cook it, bag it, set it on the shelf. The courier's: get the offer, accept it, drive to the store, wait or don't, pick up, drive to the customer. If the courier arrives first, someone is paid to stand at a counter; if the food is ready first, it goes cold on the shelf. Neither schedule is known in advance. The platform doesn't see the kitchen, can't promise how long a courier will take to accept, and has to show the customer an arrival time before either has started, then keep that promise as both slip.

Dispatch is therefore a prediction problem wrapped around an optimization problem, run continuously across a city: predict when each order will be ready and how long each candidate courier needs, then decide who carries what, including two orders on one trip. This chapter covers the order's states, prep time and ETAs, assignment and batching, the shop-and-deliver step grocery adds, scheduled orders, and the handoff. It extends `orders` and `fulfillments` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The last mile itself (proof of delivery, failed attempts, returns) belongs to the Field Operations volume's [Last-Mile Delivery](/books/field-operations/last-mile-delivery), and route optimization for multi-stop routes to its [Route Optimization](/books/field-operations/route-optimization); this chapter links rather than repeats them.

## How the Platforms Do It

As of October 2026, from developer documentation, merchant help and published engineering work:

| Platform | Delivery states exposed | Prep time and ETA | Assignment and batching |
| --- | --- | --- | --- |
| **DoorDash (Drive API)** | `created`, `confirmed`, `enroute_to_pickup`, `arrived_at_pickup`, `picked_up`, `enroute_to_dropoff`, `arrived_at_dropoff`, `delivered`, `cancelled`; back to `created` if a Dasher unassigns before pickup | Merchants and integrators supply ready times; marketplace partners keep failure and merchant cancel rates below 1% | An assignment optimizer; a 2026 paper describes a learned per-store policy that tunes its trade-off between delivery quality and batching efficiency |
| **Uber Direct** | `pending`, `pickup`, `pickup_complete`, `dropoff`, `delivered`, `canceled`, `returned`, plus `shopping_completed` for courier pick-and-pack; a `courier_imminent` flag one minute out | Undeliverable orders return by default on a separate return delivery | Not documented |
| **Uber Eats** | In the merchant's orders app: accept, adjust, delay, mark ready | The merchant's default prep time "is the starting point for our delivery person dispatch prediction"; busy mode adds 10 to 20 minutes | Moved from greedy matching per order to global matching across orders and couriers, once prep and travel predictions were accurate |
| **Instacart** | Shop, then deliver | Availability predicted per item and store; replacements chosen during shopping | Not documented in a primary source I found |
| **Gopuff** | Picked from its own facility | Delivery "in as fast as 15 minutes" from local micro-fulfillment centers | Not documented |

Two patterns:

- **Status vocabularies differ, the shape doesn't.** Every network reports waiting for a courier, heading to pickup, at pickup, picked up, heading to the customer, delivered, cancelled, and a return. A platform consuming several networks maps each into one set of fulfillment states and keeps the provider's raw status beside it.
- **The merchant's estimate is the input everyone starts from.** Prep time comes from the merchant's setting and adjustments, refined by models; when it's wrong, the courier waits or the food does.

## The Order Lifecycle

An order and its fulfillment move through separate state machines, linked by events:

**Order:** `placed` (paid or authorized, sent to the location) → `accepted` (the kitchen or store took it, with a ready estimate) → `preparing` → `ready` (bagged and on the shelf) → `fulfilled` (handed to the courier or customer). Any state before `fulfilled` can go to `cancelled`, with a reason and who cancelled: the customer, the merchant (out of an item, closing early), or the platform (no courier found, fraud).

**Fulfillment (delivery):** `pending` (looking for a courier) → `assigned` → `picked_up` → `delivered`, or `failed`, `cancelled`, `returned`. Unassignment sends `assigned` back to `pending`: DoorDash's documentation says "a delivery can be in the created state multiple times if a Dasher unassigns prior to pickup," and a system that treats states as only moving forward will lose those orders.

Three rules come from how these break:

- **Acceptance is a deadline.** A merchant that doesn't accept or cancel in time leaves a customer waiting and a courier possibly on the way. DoorDash's integration requirements hold partners to an order failure rate and a merchant cancel rate below 1% each; the order needs an acceptance deadline, an escalation (a call to the store, an automatic cancel and refund) and a recorded outcome.
- **States carry their cause.** A cancellation's reason and actor decide who pays: a merchant cancel after the courier arrived is a merchant error; a platform cancel for no courier is the platform's ([Who Pays for an Error](/books/commerce/refunds-and-delivery-fraud#who-pays-for-an-error)).
- **Events, not polling.** Networks push status by webhook (Uber Direct's `event.delivery_status`); the order's state machine consumes them idempotently, ignoring stale or duplicate events by comparing provider timestamps ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).

The playbook's [Explicit State Machines](/docs/payments/payment-states#explicit-state-machines) section is the pattern: allowed transitions in a table, every transition a row with its time, actor and reason.

## Prep Time and ETAs

The customer sees one number, the estimated time of delivery, and it is a sum of predictions: time for the merchant to accept, time to prepare, time for a courier to reach the store (including finding one), time at the store, and travel to the customer. Uber's published account of its time predictions describes replacing fixed guesses (a restaurant's orders all assumed to take, say, 25 minutes, and courier travel a flat 5) with a model that makes "a prediction for each order," with a separate model for couriers on bikes and on foot.

**Prep time is the hard part, because nobody records it.** Uber notes that it doesn't observe when food is ready and that "restaurants don't have any incentive to provide related information," so it infers labels from courier and restaurant signals and corrects them in a feedback loop as new data arrives. The merchant's own inputs are the starting point: Uber's merchant guidance says the default prep time set in its manager tool "is the starting point for our delivery person dispatch prediction," recommends keeping it close to actual times, suggests busy mode adds "a buffer of 10 to 20 minutes to all orders during busy periods," and says delaying a single order must happen before the courier is on the way.

**The estimate changes as the order does.** Before checkout the ETA uses what's known about the store and the address; after acceptance it has the kitchen's estimate; after assignment, the courier's position. Uber describes the same model having fewer features while a user browses than after an order is placed or a courier matched. Each estimate shown to the customer is worth recording with the time it was shown, because "you promised 30 minutes" is a complaint about a specific number.

**Dispatch timing trades two waits.** Sending a courier so they arrive exactly at ready time minimizes both the courier's wait and the food's; sending too early pays for waiting, too late serves cold food. The ready estimate's uncertainty, not only its mean, decides how early to send.

## Assignment and Batching

Assignment decides which courier gets which delivery. Uber describes the progression most platforms followed: a **greedy** dispatch that "only starts looking for a delivery partner when there's an order coming in," choosing the best courier for each order as it arrives, then a **global** matching that considers all open orders and available couriers together. Its example cuts total travel from 6 minutes to 4 by swapping two assignments a greedy matcher would have made. Global matching depends on the predictions above: it can't be better than its estimates of ready times and travel.

**Batching** gives one courier two or more orders on one trip, usually from the same store or stores close together, delivered in sequence. It cuts courier time per order and lets a platform serve a rush with fewer couriers; it costs the second customer minutes and risks the first order's food waiting while the second is collected. DoorDash's 2026 paper on its dispatch describes the trade-off as a weight inside the existing optimizer and a learned store-level policy that picks a multiplier between "delivery quality and batching efficiency"; in a production switchback experiment it increased batching and lowered courier-side time costs without hurting customer-facing delivery quality. My rule: make the batching trade-off an explicit, versioned weight per market or store, with the customer-facing promise as a hard limit, rather than a side effect of a cost function nobody can read ([Weighing Objectives](/docs/architecture/weighing-objectives)).

**Offers, not assignments.** On most marketplaces the courier is a contractor who can decline. An assignment is an offer with an expiry; a decline or a timeout puts the delivery back in the pool, often with a higher pay offer. Each offer, its pay, its expiry and the response is a row: acceptance rate, pay transparency and deactivation rules for couriers are regulated, and the User-Generated Platforms volume's [Offers and Pay Transparency](/books/user-generated-platforms/gig-work-and-worker-law#offers-and-pay-transparency) covers what those laws require the platform to show and keep.

## Shop and Deliver

Grocery adds a step before pickup: someone has to find the items. On Instacart and Shipt a shopper walks the store with the order, scans each item, handles what's missing and pays at the register; Uber Direct's status list has a `shopping_completed` state for its courier pick-and-pack service. The step changes the model in four ways:

- **Shopping time is predicted like prep time,** from the number of items, the store's layout and the shopper's history, and is part of the ETA.
- **The order changes during fulfillment.** Items are replaced or refunded per the customer's preferences, weighted items come in at actual weight, and the total is final only after checkout at the register ([Substitutions](/books/commerce/merchants-menus-and-catalogs#substitutions)).
- **Batches form around the store.** Several orders picked from one store in one pass share the shopping time as well as the drive, which makes batching a store-level decision about cart sizes and delivery windows rather than a pairing of two restaurants.
- **Someone pays the store.** The shopper buys the goods at the register on the platform's behalf, so the platform needs a payment instrument it can limit to one store and one order's expected total; that is a card issuing problem, covered in the Payments volume's [Card Issuing](/books/payments/card-issuing). Instacart and Shipt both issue one. Instacart's shopper site says a shopper gets "a payment card from Instacart" to use at the register in every store, mailed within about 5 to 7 business days of signup. Shipt issues every shopper a virtual card for Apple Wallet or Google Wallet (a physical card on request after a first order), used only on orders that require in-store payment; it declines at any retailer other than the one the order is for, runs as credit with a PIN, and some stores cap a card at five purchases a day. When the card fails, the shopper pays with a personal non-EBT card and claims reimbursement with the full receipt, under $500 a pay period without approval. Those controls (merchant lock, per-order use, a fallback with evidence) are the ones the system has to model whatever it issues.

Owned inventory removes most of this: Gopuff picks from its own shelves, so a missing item is an inventory error in its own system rather than a store's.

## Scheduled and ASAP Orders

An ASAP order starts its clocks at checkout. A scheduled order promises a time or a window (`scheduled_for` on the order) and has to start them later, backward from the promise. Uber's orders app shows a scheduled order to the restaurant a second time, roughly 25 to 45 minutes before the scheduled time, based on the default prep time and "the current marketplace dynamics." Grocery delivery is commonly sold in windows: Shipt's app asks customers to "choose your preferred delivery window."

Scheduled orders change three things: the order is accepted early but released to the kitchen later; capacity is a reservation against a window, so a full window stops taking orders ([Reservations & Holds](/docs/architecture/reservations-and-holds)); and the card authorization may expire before capture, so a long lead time needs a later re-authorization or a capture plan ([Authorizations Expire](/docs/payments/payment-states#authorizations-expire)).

## The Handoff

At the store, the courier collects the order, ideally confirming it's the right bag (an order number on the bag, a code, a scan) because a wrong bag is the most expensive kind of missing order: two customers affected and both orders remade. Uber Direct sets `courier_imminent` when the courier is a minute from pickup or dropoff, which is the signal for the store to have the bag at the counter and for the customer to come to the door.

At the door, the handoff is the Field Operations volume's subject: the handoff type (to the customer, a safe place, a third party), photos for unattended drops, PINs and ID checks for age-restricted items that force the customer to be present, and the action when nobody can receive the order. Those rules are in [Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs) and [Failed Attempts, Redelivery and Returns](/books/field-operations/last-mile-delivery#failed-attempts-redelivery-and-returns). On-demand networks add one structural detail: Uber Direct models a return as a new delivery, its ID prefixed `ret_` and linked to the original, which moves through its own pickup and dropoff. A return is a second fulfillment on the same order, not a state of the first.

## How to Build It

```sql
CREATE TABLE order_status_changes (      -- every transition, with its cause
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  from_status TEXT,
  to_status   TEXT NOT NULL,
  actor       TEXT NOT NULL CHECK (actor IN ('customer', 'merchant', 'platform', 'courier',
                'system')),
  reason      TEXT,                      -- e.g. 'item_unavailable', 'no_courier', 'fraud'
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders
  ADD COLUMN accept_by  TIMESTAMPTZ,     -- acceptance deadline
  ADD COLUMN release_at TIMESTAMPTZ;     -- when a scheduled order goes to the kitchen

CREATE TABLE prep_estimates (            -- each estimate, as it was made and shown
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  stage       TEXT NOT NULL CHECK (stage IN ('browse', 'checkout', 'accepted', 'assigned',
                'picked_up')),
  source      TEXT NOT NULL CHECK (source IN ('merchant_default', 'merchant_adjusted',
                'model', 'busy_mode')),
  ready_at    TIMESTAMPTZ,               -- predicted ready time
  deliver_at  TIMESTAMPTZ,               -- predicted arrival, as shown to the customer
  model_version TEXT,
  shown_to_customer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fulfillments
  ADD COLUMN parent_fulfillment_id UUID REFERENCES fulfillments (id),  -- a return leg
  ADD COLUMN batch_id              UUID;  -- batches, below

CREATE TABLE fulfillment_events (        -- provider statuses, raw and mapped
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  fulfillment_id UUID NOT NULL REFERENCES fulfillments (id),
  provider_status TEXT NOT NULL,         -- e.g. 'enroute_to_pickup', 'pickup_complete'
  mapped_status  TEXT NOT NULL,          -- this system's fulfillment state
  courier_ref    TEXT,                   -- the provider's courier ID, when given
  occurred_at    TIMESTAMPTZ NOT NULL,   -- the provider's time; stale events are ignored
  received_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_event_id TEXT NOT NULL,
  UNIQUE (fulfillment_id, provider_event_id)
);

CREATE TABLE batches (                   -- one courier trip carrying several orders
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  courier_ref      TEXT,
  optimizer_version TEXT NOT NULL,
  batching_weight  NUMERIC NOT NULL,     -- the trade-off in force for this market or store
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE batch_stops (               -- pickups and dropoffs in planned order
  batch_id       UUID NOT NULL REFERENCES batches (id),
  position       SMALLINT NOT NULL,
  fulfillment_id UUID NOT NULL REFERENCES fulfillments (id),
  kind           TEXT NOT NULL CHECK (kind IN ('pickup', 'shop', 'dropoff')),
  planned_at     TIMESTAMPTZ NOT NULL,
  arrived_at     TIMESTAMPTZ,
  departed_at    TIMESTAMPTZ,
  PRIMARY KEY (batch_id, position)
);

CREATE TABLE delivery_offers (           -- every offer to a courier and its outcome
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  batch_id      UUID NOT NULL REFERENCES batches (id),
  courier_ref   TEXT NOT NULL,
  pay_offered   BIGINT NOT NULL,         -- minor units, as shown to the courier
  est_distance_m INT,
  est_minutes   INT,
  expires_at    TIMESTAMPTZ NOT NULL,
  response      TEXT CHECK (response IN ('accepted', 'declined', 'expired')),
  responded_at  TIMESTAMPTZ
);
```

Design notes:

- **Every estimate is kept.** `prep_estimates` records what was predicted at each stage and what the customer saw, so late-delivery credits, model evaluation and a complaint all read the same rows.
- **A batch is the courier's unit, the fulfillment the customer's.** Each order keeps its own fulfillment and state; the batch groups them for the trip and the offer. Unbatching (a courier drops one order) moves one fulfillment back to `pending` without touching the other.
- **The trade-off is recorded with the decision.** `batching_weight` and `optimizer_version` on the batch say which policy made it, the [Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided) pattern applied to an optimizer.
- **Offers are records the courier law cares about.** Pay shown, distance, time and the response are what pay-transparency and deactivation rules ask about; the courier identity itself lives in the gig-work model, referenced here only by ID.

## Auditing

- **The order's history.** Every status change with actor, reason and time, including acceptance deadlines missed and cancellations, which settle who pays for an error.
- **Every promise.** Each ETA and ready estimate with its stage, source and model version, and whether the customer saw it.
- **Every provider event.** Raw and mapped statuses for each fulfillment, with the provider's event ID and time, so a dispute with a logistics network is a comparison of two logs.
- **Every offer.** Pay, distance, expiry and response for each courier offer, kept for the period the courier pay rules in force require.

## What This Means for the System You Build

- **Run the order and its fulfillment as separate state machines,** with transitions as rows carrying actor and reason, and allow returns to `pending`.
- **Give acceptance a deadline and an escalation.**
- **Map every provider's statuses to one set,** keeping the raw status and event ID, and consume webhooks idempotently.
- **Store every ETA and ready estimate** with its stage and model, and record which one the customer saw.
- **Start prep predictions from the merchant's settings and correct them with inferred labels,** since nobody records when food is ready.
- **Make batching an explicit, versioned trade-off** with the customer promise as a hard limit, and keep each order's fulfillment separate from the batch.
- **Record every courier offer and its response.**
- **Model shop-and-deliver as a fulfillment step** that changes order lines, with the final total after checkout.
- **Schedule release, capacity and re-authorization** for scheduled orders.
- **Model a return as a second fulfillment** linked to the first.

## References

**Platform documentation**

- [DoorDash Developer: Delivery statuses](https://developer.doordash.com/docs/drive/reference/delivery_statuses), the nine Drive states and the return to `created` when a Dasher unassigns
- [DoorDash Developer: General integration requirements](https://developer.doordash.com/en-US/docs/marketplace/overview/getting_started/general_integration_requirements), order failure and merchant cancel rates below 1%
- [Uber Direct: Delivery status webhook](https://developer.uber.com/docs/deliveries/daas/api/webhook-event-deliverystatus), the statuses, `courier_imminent`, `returned`, `shopping_completed` and return deliveries with the `ret_` prefix
- [Uber Eats: Reduce wait times (October 3, 2021)](https://www.uber.com/au/en/blog/delivery-person-wait-time/), default prep time as the starting point for dispatch, the 10-to-20-minute busy buffer, delaying orders before the courier leaves
- [Uber Eats Merchants: Uber Eats Orders app](https://merchants.ubereats.com/gb/en/resources/learning-center/uber-eats-orders-app/), accepting, delaying and readying orders, and scheduled orders shown 25 to 45 minutes ahead
- [Gopuff: Introducing Gopuff's new website (September 18, 2025)](https://markets.financialcontent.com/ms.intelvalue/article/bizwire-2025-9-18-introducing-gopuffs-new-website-the-future-of-shopping), delivery in as fast as 15 minutes from local micro-fulfillment centers
- [Shipt: App Store listing](https://apps.apple.com/us/app/971888874), choosing a delivery window
- [Shipt Shopper: Shipt Card FAQ](https://shoppers.shipt.com/app-functionality/shipt-card), virtual and physical cards, orders that require payment, the retailer lock, PIN, five-a-day store limits, personal-card reimbursement under $500 a pay period
- [Instacart Shoppers](https://shoppers.instacart.com/), the payment card from Instacart used at the register and its delivery after signup

**Engineering and research**

- [InfoQ: Predicting Time to Cook, Arrive, and Deliver at Uber Eats (November 20, 2019)](https://www.infoq.com/articles/uber-eats-time-predictions), per-order prep and travel predictions, greedy versus global matching, the missing ground truth for prep time, inferred labels and the feedback loop
- [Multi-Agent Reinforcement Learning from Delayed Marketplace Feedback for Objective-Weight Adaptation in Three-Sided Dispatch (arXiv, June 2026)](https://arxiv.org/abs/2606.13604), a learned store-level multiplier on the optimizer's trade-off between delivery quality and batching, deployed at DoorDash, with switchback results
- [Instacart: The story behind an Instacart order, part 3](https://company.instacart.com/tech-innovation/the-story-behind-an-instacart-order-part-3-predicting-the-shop), item availability and replacement predictions for shopping
