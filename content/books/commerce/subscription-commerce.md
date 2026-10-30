+++
title = "Subscription Commerce"
description = "Product subscriptions: replenishment and boxes, schedules and anchors, skip, pause and swap, prepaid plans, renewal billing, dunning, subscription apps, churn."
category = "Commerce Industry"
order = 2324
part = "Subscriptions and Memberships"
tags = ["commerce", "subscriptions", "recurring", "dunning", "churn", "data-model"]
+++

A product subscription is a standing order. The customer agrees once to receive something on a schedule, and from then on the merchant creates the orders: a bag of dog food every four weeks, a razor cartridge refill every two months, a pest control kit timed to the season in the customer's ZIP code, a curated box of snacks every month. Each renewal is a real order, with lines, tax, a shipment and a charge to a card nobody is entering, and between renewals the customer keeps editing the promise: skip the next one, move it a week, swap the flavor, add a bottle, pause for the summer. The business is attractive because one acquisition becomes a stream of orders; Chewy's Autoship customers were 83.3% of its net sales in fiscal 2025 ([Business Models & Unit Economics](/books/commerce/business-models#subscription-dtc)).

The software is hard for three reasons. The schedule and the order are different things: the subscription decides when an order should exist, and everything else about that order (stock, price, tax, address, card) is decided on the day it is created. The charge happens without the customer, so card network rules on stored credentials and retries apply, and failed payments are a large share of churn. And the customer changes the subscription constantly, so every change has to be recorded, applied to the right future order and never to one already charged. This chapter covers product subscriptions: the kinds, schedules and anchors, skip, pause, swap and upgrade, prepaid plans and their accounting, renewal billing and dunning, the subscription apps, and churn. It extends `subscriptions` and `subscription_lines` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The general machinery of recurring billing (states, periods, renewal jobs, proration) is the playbook's [Subscriptions & Recurring Billing](/docs/payments/subscriptions); charging a stored card under network rules is the Payments volume's [Stored Cards & Recurring Billing](/books/payments/stored-credentials); paid memberships are [Memberships & Loyalty](/books/commerce/memberships-and-loyalty); and the law of renewal and cancellation is [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law).

## How the Platforms Do It

As of October 2026, from each vendor's own documentation and pricing pages:

| Platform | What it is | Who creates the renewal | Published price | Notable mechanics |
| --- | --- | --- | --- | --- |
| **Shopify Subscriptions APIs** | Shopify's native model: selling plans on products, subscription contracts per customer | The app: "A subscription is renewed when an app makes a billing attempt" | Part of the platform; apps built on it charge their own fees | Selling plan groups ("Subscribe and save", "Prepaid"), billing, delivery, inventory and pricing policies, anchors and cutoffs, billing attempts with an idempotency key |
| **Recharge** | Subscription app for Shopify brands | Recharge, on each charge's scheduled date | Starter $99 a month plus 1.49% + 19¢ per transaction; Plus $499 a month plus 1.34% + 19¢; Custom | Charges grouped per address and date; `queued`, `skipped`, `error` with a `retry_date`; prepaid charges that create several orders |
| **Skio** | Subscription app for Shopify brands | Skio | Scale $499 a month billed annually ($599 monthly) plus 1% + 20¢ on orders involving a subscription; Enterprise custom | Payment recovery campaigns with timing optimization, a multi-step cancel flow builder, build-a-box, migrations |
| **Ordergroove** | Subscription and membership platform across carts | Ordergroove | Not published | Subscriptions, bundles and clubs, memberships, an involuntary churn suite; supports Shopify, BigCommerce, commercetools, Adobe Commerce and Salesforce; lists Dollar Shave Club and BARK as customers |
| **Stay AI** | Subscription app for Shopify brands | Stay AI | Not published | Customer portal with swaps, "Proactive Smart Dunning", self-optimizing cancellation surveys, migrations |
| **Stripe Billing** | General recurring billing, used for custom stacks | Stripe, from the subscription's billing cycle | 0.7% of billing volume, pay as you go | Smart Retries (recommended default 8 tries within 2 weeks), hard decline codes never retried, configurable end state after failed recovery |

Three patterns:

- **The renewal is an order created by software the customer never sees.** On Shopify the app, not the platform, decides when to bill: it calls `subscriptionBillingAttemptCreate`, and the order exists only once the attempt succeeds. On Recharge "Orders are created once the corresponding Charge is successful." Whoever owns the scheduler owns the renewal, which is why moving between subscription apps is a migration of schedules and payment tokens, not of products ([Replatforming & Migration](/books/commerce/replatforming#subscriptions-and-stored-payment-tokens)).
- **Charges are not subscriptions.** Recharge merges every subscription on an address with the same next charge date into one charge with a line per subscription; a prepaid charge creates several orders. The subscription is the promise, the charge is the money, the order is the goods, and each has its own record.
- **Recovery is a product feature.** Every vendor in the table sells failed-payment recovery and cancellation flows as features, because involuntary churn (a declined card) and voluntary churn (a cancel click) are the two numbers the business lives on.

## Kinds of Product Subscription

Product subscriptions come in four shapes, and the shape decides what the schedule means:

- **Replenishment.** The customer subscribes to a product they already use up at a steady rate: pet food, coffee, razors, vitamins, filters. The interval is the consumption rate, and the customer's main edit is the date ("I have plenty, push it two weeks"). Chewy's Autoship and Dollar Shave Club's refills are this shape. A marketplace version is Amazon's Subscribe & Save, where the customer picks a frequency and the discount is shared between the seller and Amazon; Amazon's customer and seller help pages for it were not retrievable for this chapter, so its discount tiers and funding rules aren't stated here. <!-- source-gap: amazon-subscribe-and-save | missing | Amazon Subscribe & Save discount tiers (5% and up to 15% with five or more items), delivery frequencies, the reminder before each delivery, and seller-funded discount rules | closes with: Amazon's Subscribe & Save customer help page or seller help page, readable without a login; amazon.com help returned 503 to fetchers | checked: 2026-10-29 -->
- **Need-timed.** The schedule follows something outside the customer, not consumption. Pestie builds "a plan around your home, your pests, and your local climate" and ships "when it's the ideal time to reapply," every three months in most areas, with most customers reapplying every two to three months; the first shipment adds a sprayer, later ones carry concentrate, mixing bags, gloves and a guide. The interval comes from a rule (region and season), so a change to the rule moves every affected subscriber's next date. That is a [seasonal program](/books/field-operations/recurring-schedules#seasonal-programs) in Field Operations terms, delivered as parcels instead of visits.
- **Curated box.** The merchant picks what ships (a monthly snack box, a book club, a clothing box); the customer pays for the surprise. The lines of each renewal are chosen per cycle by the merchant, so the subscription's lines are a plan, not items, and inventory has to be committed for the whole subscriber base before the cycle ships.
- **Build-a-box.** The customer chooses the contents within rules (pick six meals, any three flavors). Recharge models the choice as a bundle selection attached to the subscription, whose current contents are extracted when the next order is created; Skio sells "Advanced Build-a-Box". The order takes whatever the selection says at cutoff.

Each shape can be **pay as you go** (charged per shipment) or **prepaid** (charged once for several shipments). Shopify's overview names exactly those two purchase models: pay-per-delivery, where "New orders are created at regular intervals," and pre-paid, a single upfront payment for products delivered "on a regular cadence until the order is fulfilled." Prescription subscriptions from direct-to-consumer telehealth companies are the regulated variant, where a renewal is also a refill ([Direct-to-Consumer Telehealth](/books/health-tech/telehealth#direct-to-consumer-telehealth)).

A subscribe-and-save offer is a pricing rule on top of any of these: a percentage or amount off the one-time price for choosing the subscription. Shopify's pricing policies separate a fixed policy from a recurring "follow up pricing policy that applies if the initial pricing policy expires," which is how "40% off your first box, 10% off after" is expressed. The price a renewal charges is a computation at renewal time (the current price, less the plan's discount) unless the subscription locked a price, and which one applies is a term the customer was shown ([Price Changes](#price-changes-on-a-running-subscription), below).

## Schedules and Anchors

A subscription's schedule has more parts than "every 30 days":

- **Interval.** A unit and a count: every 4 weeks, every 2 months. Weeks and months are different promises; "every 30 days" drifts against the calendar, "monthly on the 15th" doesn't. Intervals are calendar durations added in the customer's zone, as the playbook's [Periods and Anchors](/docs/payments/subscriptions#periods-and-anchors) describes.
- **Anchor.** The day the cycle aligns to. Shopify: "Anchors define the date when fulfillment is completed by a merchant or when delivery occurs for the customer for a given time cycle," such as the 15th of each month. Without an anchor the cycle aligns to the first successful charge; Shopify's `originTime` says the same thing in code: if none is given, "fulfillment is calculated using the date that the billing attempt was successful."
- **Cutoff.** A buffer before the anchor after which a new or changed subscription misses this cycle. Shopify's cutoff "Specifies a buffer period before the anchor date for orders to be included in a delivery or fulfillment cycle," with a pre-anchor behavior of `ASAP` (ship at the next anchor) or `NEXT` (skip to the one after). A curated box that ships to everyone on the 15th needs a cutoff, because the warehouse commits stock days earlier.
- **Charge lead.** Most merchants charge a few days before the order ships, so a declined card can be retried and fixed before the warehouse cuts the order. The lead is a plan term: it moves the customer's real deadline to skip or change the order forward by the same amount, and the reminder the customer gets has to land before the charge, not before the shipment.
- **Billing versus delivery cadence.** For prepaid plans the two differ. Shopify requires that "The billing cadence must be a whole-number multiple of the delivery cadence": billed every three months, delivered monthly.

**Grouping.** A customer with three subscriptions due on different days gets three parcels and three charges unless the system aligns them. Recharge merges subscriptions on the same address and next charge date into one charge; the usual feature is to offer the customer "ship with my next order" when they add a product, which moves it onto the existing date. Grouping is a property of the renewal job (one order per customer, address and date), not of each subscription, so the merge rule lives in one place.

**The order is created late, from current facts.** On the renewal date the job reads the subscription's lines and schedule as of now and builds an order: current price less the plan's discount, tax for today's address, the card on file, the item's current stock. A subscription stores intent; it never stores a pre-built order that goes stale. Two days before a charge, the customer should be able to see exactly what will be charged and shipped, which means the "upcoming order" is a preview computed by the same code the renewal job runs.

## Skip, Pause, Swap and Upgrade

The edits a subscriber makes, and what each does to the record:

| Edit | What the customer means | What changes |
| --- | --- | --- |
| **Skip** | Not this one | One cycle is marked skipped; the next date moves one interval later. Recharge creates a charge with `SKIPPED` status if none exists yet, so the skip is a record, not an absence |
| **Reschedule** | Later (or sooner) | `next_order_at` moves; the anchor may or may not move with it, a choice the merchant states (Shopify's anchor stays; a date-only change on a non-anchored plan resets the cadence) |
| **Ship now** | I ran out | An off-cycle renewal now, and either the cadence restarts from today or the next scheduled order stays put |
| **Pause** | Stop for a while | No renewals until a resume date or until the customer resumes; `status = 'paused'`, `next_order_at` empty. A pause with a resume date is kinder to retention than an open-ended one |
| **Swap** | Same plan, different variant | A line's item changes (flavor, size, scent); the next order is repriced from the new item |
| **Add or remove a line** | One-time add-on or a new recurring item | A one-time add-on is attached to the next renewal only; a recurring add is a new subscription line |
| **Change frequency** | More often or less | The interval changes from the next cycle, with the date recomputed |
| **Upgrade or downgrade** | A bigger or smaller plan | Applied at the next renewal for goods: there is no unused period of a physical shipment to prorate |
| **Change address or card** | Moved, new card | Applies to orders not yet created; a card change also starts a new stored-credential agreement (below) |
| **Cancel** | Stop entirely | A cancellation request with an effective date; see [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law#cancellation-flows-in-subscription-apps) |

Rules that keep this sane:

- **Every edit is a row.** `subscription_changes` records who changed what, from which channel (portal, email link, SMS reply, support, an automation), effective from which cycle. Churn analysis lives on these rows: a subscriber who skips three times in a row is a cancellation that hasn't happened yet.
- **Edits never touch an order already created.** Once a renewal order exists (charged or about to be), a swap or address change applies to it only through [Order Management](/books/commerce/order-management#edits-and-cancellations)'s edit path, and only if the order hasn't been released to the warehouse.
- **Skip and pause are the customer's; a hold is the merchant's.** An item out of stock, a failed payment or a fraud review stops a renewal too, but the customer didn't ask for it, and it must not count as a skip in churn reports. The playbook's rule ([Subscription States](/docs/payments/subscriptions#subscription-states)) applies unchanged.
- **Out of stock is a decision, not a crash.** When a subscribed item can't ship on the renewal date, the plan says what happens: substitute a stated alternative, ship the rest and back-order the line, delay the whole order a stated number of days, or skip and tell the customer. Recording the decision on the renewal keeps the customer's history honest.

## Prepaid Plans and Their Accounting

A prepaid plan sells several shipments for one payment, usually at a discount: three months of boxes, a year of refills. It changes four things:

- **The charge and the orders separate.** One charge creates several orders over time; Recharge's `orders_count` is "The number of `Orders` generated from this `Charge` (>1 for prepaid `Subscriptions`)." Each shipment is still its own order with its own fulfillment, so a missed box can be replaced and tracked like any order. The table that ties them is `prepaid_periods`: one row per prepaid term, with the shipments owed and the shipments made.
- **The cash is a liability until goods ship.** Money taken for boxes not yet delivered is not revenue; it is a contract liability (deferred revenue) that is recognized as each shipment is delivered, because each box is what the customer paid for ([Cash Is Not Revenue](/docs/payments/accounting#cash-is-not-revenue), [Recognition Schedules](/docs/payments/accounting#recognition-schedules)). The product records the facts finance needs: the amount paid, the shipments owed, the allocation per shipment, and each shipment's delivery. [Commerce Accounting](/books/commerce/commerce-accounting) covers the journal entries.
- **Cancellation needs a refund rule.** A customer who cancels after two of six prepaid boxes is owed something, and the rule must be in the terms they accepted: refund the unshipped boxes at the prepaid per-box price, refund at the full per-box price (recapturing the discount), or no refund with the remaining boxes still shipping. Whatever the rule, it is computed from the plan version and stated in the cancellation confirmation. Some laws decide part of it: New York lets a business that raises a price either get consent or let the customer cancel for a pro rata refund ([State Laws](/books/commerce/auto-renewal-law#new-york)).
- **Renewal of a prepaid term is a large charge.** A year's prepay renewing at full price is the kind of charge that draws disputes; the reminder before it is required in several states for terms of a year or more, and is good practice everywhere ([Notices and Reminders](/books/commerce/auto-renewal-law#notices-and-reminders)).

Gift subscriptions are prepaid plans with two customers: the purchaser who paid and the recipient who receives. The recipient's address and preferences drive the orders; the purchaser's consent and card drive the money; and the gift normally ends rather than renews unless the purchaser agreed to renewal.

## Renewal Billing and Stored Credentials

The first order is a customer-initiated transaction: the customer is present, authenticates if the issuer asks, and agrees to future charges. Every renewal after it is a merchant-initiated transaction that references the first one's network transaction ID, under a stored-credential agreement that says what will be charged and when ([Who Started the Payment](/books/payments/stored-credentials#who-started-the-payment), [The First Transaction Carries the Rest](/books/payments/stored-credentials#the-first-transaction-carries-the-rest)). What commerce adds:

- **The amount varies.** A product subscription's renewal amount changes with swaps, add-ons, tax at the address and price changes, so the stored-credential agreement describes a variable recurring amount, and the customer's upcoming-order preview is the evidence that they knew what would be charged.
- **One charge, several subscriptions.** A grouped renewal charges one card for lines from several subscriptions; the charge records which subscription each line came from so a refund or a dispute can be traced back.
- **A new card is a new agreement.** A customer who updates their card in the portal starts a new customer-initiated agreement on that card, and the renewal job must use the new credential's agreement, not the old one's transaction ID.
- **Authorize and capture at once, usually.** A renewal is charged before shipment and the order ships within days, so most apps capture at charge time; a merchant that authorizes and captures at shipment instead inherits the authorization-window rules of [Taking Payment in Commerce](/books/commerce/taking-payment#authorization-windows).
- **Idempotency by renewal, not by job run.** Shopify's billing attempt takes "A unique key generated by the client to avoid duplicate payments"; the key derives from the subscription, the cycle and the attempt number, exactly as the playbook's [Renewal Jobs](/docs/payments/subscriptions#renewal-jobs) prescribes. Shopify's attempts are asynchronous ("the resulting order isn't available right away") and end `success`, `failed` or action required (3D Secure), so the job polls or listens and records each outcome as a `billing_attempts` row.

## Dunning and Account Updaters

A declined renewal starts dunning: retry the card on a schedule, tell the customer with a one-step fix, and decide what happens to the order meanwhile. The general shape (retries, notices, grace, involuntary churn reported separately) is the playbook's [Dunning](/docs/payments/subscriptions#dunning), the network retry limits are the Payments volume's [Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying), and card refresh through Visa Account Updater, Mastercard's Automatic Billing Updater and network tokens is [Keeping the Card Alive](/books/payments/stored-credentials#keeping-the-card-alive). Field Operations' [Retries: How the Platforms Do It](/books/field-operations/collections-and-retention#retries-how-the-platforms-do-it) applies the same mechanics to service plans. The platforms' published limits, as of October 2026:

- **Shopify** tells subscription apps to "Avoid re-billing failed payments with the same customer payment method more than 30 times in 35 days."
- **Stripe** Smart Retries chooses retry times with a model, within a policy of a number of tries over 1 week to 2 months; "The recommended default setting is 8 tries within 2 weeks." It never retries hard declines such as `lost_card`, `stolen_card` or `revocation_of_authorization` without a new payment method, and after the last attempt the subscription is cancelled, marked unpaid, left past due or paused, as configured.
- **Recharge** records the failure on the charge (`error`, `error_type`) with a `retry_date` for the next attempt.

What changes for goods:

- **The order waits, and so does the stock.** While a renewal is in dunning, its order doesn't exist yet (or exists on hold), and stock for it is not committed. A box that would have shipped on the 15th ships on the day the retry succeeds, or the cycle is skipped if the retry lands after the next cycle's date. The rule (ship late, or skip and keep the cadence) is a plan term.
- **Pause beats cancel at the end.** When recovery fails, ending the subscription loses a customer whose card simply expired. Pausing with an "update your card to resume" message keeps the record and the history; Stripe offers pause as one of its end states for that reason.
- **Prevention is cheapest.** An account updater run before each renewal batch and an "expiring card" message a cycle ahead fix most expiry declines before they happen.
- **Report involuntary churn separately.** A subscriber lost to a decline needs better billing; one who clicked cancel needs a better product. The two go to different teams.

## How a Subscription Maps to a Service Agreement

A Commerce product subscription, a delivery app's membership and a Field Operations [service agreement](/books/field-operations/service-agreements) are the same shape: a promise with a schedule, terms, a stored payment method and a renewal. A reader moving between the books sees one model:

| Concept | Commerce `subscriptions` | Delivery membership ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-to-build-it)) | Field Operations service agreement |
| --- | --- | --- | --- |
| What a renewal produces | An order to ship | A paid period of fee waivers | Visits on the schedule ([How the Agreement Constrains Generation](/books/field-operations/service-agreements#how-the-agreement-constrains-generation)) |
| The schedule | Interval, anchor, cutoff on the subscription | The billing period | A recurrence rule, often seasonal ([RFC 5545 as the Rule Language](/books/field-operations/recurring-schedules#rfc-5545-as-the-rule-language)) |
| Billing and delivery cadence | Usually equal; differ for prepaid | One cadence | Often different: quarterly visits billed monthly ([Four Billing Models](/books/field-operations/billing-recurring-service#four-billing-models)) |
| Customer stop | Skip, pause | Cancel | Pause, hold ([Pausing and Holding](/books/field-operations/service-agreements#pausing-and-holding)) |
| Failed payment | Dunning; the order waits | Dunning; benefits stop | Dunning; service may be held ([Holding Service for Non-Payment](/books/field-operations/collections-and-retention#holding-service-for-non-payment)) |
| Renewal law | Online ARLs and ROSCA | The same | The same, plus door-to-door rules ([Renewal and Cancellation in the Field](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field)) |

The rows map one to one: `subscriptions` corresponds to the service agreement and its `agreement_terms`, `subscription_lines` to included services, a renewal order to a generated visit, and `billing_attempts` to the agreement's billing periods. Pestie is the clearest pair: its DIY subscription ships the products on the season's schedule, while a pest control company sells the same protection as a service agreement whose renewal produces a technician's visit, applying [regulated materials](/books/field-operations/regulated-materials). Selling and shipping the pesticide itself is [Pesticides, Chemicals & Hazmat](/books/commerce/pesticides-chemicals-and-hazmat#diy-pesticide-subscriptions).

## Price Changes on a Running Subscription

A subscription that charges "the current price, less 10%" changes price whenever the catalog does; one that locked a price at sign-up doesn't. Both are legitimate, and the choice is a term the customer saw:

- **Floating price.** The renewal reprices from the catalog. A catalog increase reaches subscribers automatically, which several state laws treat as a material change requiring notice before it takes effect, with how to cancel ([Price Changes](/books/commerce/auto-renewal-law#notices-and-reminders)).
- **Locked price.** `subscription_lines.unit_price` holds the price; a merchant-wide increase is then a deliberate migration: a new plan version, a notice per subscriber, and the new price only on renewals after the notice window, the playbook's price-change workflow ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).

My default is a locked price with an explicit migration for increases, because a floating price turns every catalog edit into a legal notice obligation nobody remembered to send.

## Churn Economics

The numbers a subscription business watches are all ratios over subscription records:

- **Churn rate.** Subscriptions ended in a period over subscriptions active at its start, split into **voluntary** (cancelled) and **involuntary** (ended for non-payment). Measured by cohort (subscribers who started in the same month), because a blended rate hides that new subscribers churn far faster than old ones.
- **Skip rate.** Cycles skipped over cycles due. A skip is deferred revenue at best and a soft cancellation at worst; a rising skip rate predicts churn.
- **Orders per subscriber.** How many renewals a cohort produces before it ends; the subscription's equivalent of repeat purchase rate.
- **Recovery rate.** Failed renewals later paid over failed renewals, by decline category; the number dunning is judged by.
- **Save rate.** Cancellation flows that ended in a pause, skip, swap or discount over flows started, with the later churn of saved subscribers measured too, since a save that cancels next month saved one order.

Lifetime value is contribution per renewal times expected renewals ([The Unit Economics](/books/commerce/business-models#the-unit-economics)). A worked example in round numbers: a $30 box with a 40% contribution margin after product, fulfillment and payment fees contributes $12 a renewal. At 8% monthly churn the expected number of renewals is about 1 / 0.08 = 12.5, so LTV is about $150; at 6% it is about 16.7 renewals and $200. Cutting churn by two points is worth a third more per customer, which is why the vendors in the table sell recovery and cancel flows rather than storefront features. A 10% subscribe-and-save discount costs $3 of that $12 a renewal and pays for itself only if it lowers churn or raises orders per subscriber by enough; the cohort data says whether it does.

Two traps in the arithmetic: churn measured on subscriptions rather than customers overstates loss when customers consolidate two subscriptions into one, and a subscriber who skips every other cycle has half the orders of one who doesn't, so LTV is computed from orders actually produced, not from months subscribed.

## How to Build It

The core `subscriptions` and `subscription_lines` hold the promise. This chapter adds the plan the customer chose, the schedule columns, every change, every billing attempt and prepaid terms:

```sql
CREATE TABLE subscription_plans (        -- an offer: "Subscribe and save, every 4 weeks", versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id        UUID NOT NULL REFERENCES merchants (id),
  code               TEXT NOT NULL,      -- 'sns_4w', 'prepaid_3x1m'
  version            INT NOT NULL,
  purchase_model     TEXT NOT NULL CHECK (purchase_model IN ('pay_per_delivery', 'prepaid')),
  delivery_unit      TEXT NOT NULL CHECK (delivery_unit IN ('day', 'week', 'month', 'year')),
  delivery_count     SMALLINT NOT NULL CHECK (delivery_count > 0),
  billing_multiple   SMALLINT NOT NULL DEFAULT 1 CHECK (billing_multiple > 0),  -- prepaid: shipments per charge
  anchor             JSONB,              -- {"monthday": 15} or {"weekday": 2}; null: first charge
  cutoff_days        SMALLINT NOT NULL DEFAULT 0,
  pre_anchor         TEXT NOT NULL DEFAULT 'asap' CHECK (pre_anchor IN ('asap', 'next')),
  charge_lead_days   SMALLINT NOT NULL DEFAULT 0,  -- charge this many days before the order ships
  pricing            JSONB NOT NULL,     -- [{"cycles": 1, "percent_off": 40}, {"percent_off": 10}]
  price_mode         TEXT NOT NULL CHECK (price_mode IN ('floating', 'locked')),
  min_cycles         SMALLINT,           -- a commitment, if any, disclosed at sign-up
  max_cycles         SMALLINT,           -- prepaid and gift terms end rather than renew
  out_of_stock       TEXT NOT NULL CHECK (out_of_stock IN ('substitute', 'ship_partial',
                       'delay', 'skip')),
  failed_payment_end TEXT NOT NULL CHECK (failed_payment_end IN ('pause', 'cancel')),
  prepaid_refund     TEXT CHECK (prepaid_refund IN ('unshipped_at_prepaid_price',
                       'unshipped_at_full_price', 'none')),
  terms_ref          TEXT NOT NULL,      -- the disclosure shown at sign-up
  valid_during       TSTZRANGE NOT NULL,
  UNIQUE (merchant_id, code, version)
);

ALTER TABLE subscriptions
  ADD COLUMN plan_id            UUID REFERENCES subscription_plans (id),
  ADD COLUMN kind               TEXT NOT NULL DEFAULT 'replenishment' CHECK (kind IN
                                  ('replenishment', 'need_timed', 'curated', 'build_a_box')),
  ADD COLUMN schedule_rule      TEXT,    -- need-timed: the region and season rule that sets dates
  ADD COLUMN purchaser_id       UUID REFERENCES customers (id),  -- a gift: who paid
  ADD COLUMN credential_ref     TEXT,    -- the stored-credential agreement in the Payments model
  ADD COLUMN pause_until        DATE,
  ADD COLUMN cancel_at          TIMESTAMPTZ,  -- set by a cancellation request; ends then
  ADD COLUMN ended_reason       TEXT CHECK (ended_reason IN ('cancelled', 'non_payment',
                                  'term_completed', 'fraud')),
  ADD COLUMN previous_id        UUID REFERENCES subscriptions (id);  -- a win-back links back

ALTER TABLE subscription_lines
  ADD COLUMN kind          TEXT NOT NULL DEFAULT 'recurring' CHECK (kind IN ('recurring',
                             'one_time', 'box_selection')),
  ADD COLUMN selection     JSONB,        -- build-a-box contents, read at cutoff
  ADD COLUMN applies_cycle INT;          -- one-time add-on: the cycle it rides on

CREATE TABLE subscription_changes (      -- every edit, append-only
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  kind            TEXT NOT NULL CHECK (kind IN ('skip', 'unskip', 'reschedule', 'ship_now',
                    'pause', 'resume', 'swap', 'add_line', 'remove_line', 'quantity',
                    'frequency', 'plan_change', 'address', 'payment_method', 'price_migration',
                    'hold', 'release_hold')),
  actor           TEXT NOT NULL,         -- typed: customer, staff, automation, system
  channel         TEXT NOT NULL CHECK (channel IN ('portal', 'email_link', 'sms', 'support',
                    'api', 'automation')),
  cycle           INT,                   -- the renewal it applies from
  before          JSONB,
  after           JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX subscription_changes_sub_idx ON subscription_changes (subscription_id, created_at);

CREATE TABLE subscription_renewals (     -- one row per cycle, whatever happened to it
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  cycle           INT NOT NULL,
  scheduled_for   DATE NOT NULL,         -- the ship date the schedule produced
  charge_on       DATE NOT NULL,         -- scheduled_for less charge_lead_days
  status          TEXT NOT NULL CHECK (status IN ('scheduled', 'skipped', 'charging',
                    'paid', 'failed', 'held', 'prepaid', 'cancelled')),
  group_key       TEXT,                  -- customer, address and date: one order for the group
  order_id        UUID REFERENCES orders (id),  -- set once the order exists
  prepaid_period_id UUID,                -- prepaid_periods, below
  PRIMARY KEY (subscription_id, cycle)
);

CREATE TABLE billing_attempts (          -- every charge attempt for a renewal group
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  group_key        TEXT NOT NULL,
  attempt          SMALLINT NOT NULL CHECK (attempt > 0),
  idempotency_key  TEXT NOT NULL UNIQUE, -- group and attempt, never the job run
  amount           BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  credential_ref   TEXT NOT NULL,
  outcome          TEXT NOT NULL CHECK (outcome IN ('pending', 'success', 'soft_decline',
                     'hard_decline', 'action_required', 'error')),
  decline_code     TEXT,                 -- raw issuer or network code, kept
  merchant_advice  TEXT,                 -- Mastercard MAC, when returned
  next_attempt_at  TIMESTAMPTZ,          -- null after a hard decline
  payment_ref      TEXT,                 -- the Payments record
  attempted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_key, attempt)
);

CREATE TABLE prepaid_periods (           -- one prepaid term: one charge, several shipments
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions (id),
  plan_id          UUID NOT NULL REFERENCES subscription_plans (id),
  amount_paid      BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  shipments_owed   SMALLINT NOT NULL CHECK (shipments_owed > 0),
  shipments_made   SMALLINT NOT NULL DEFAULT 0,
  per_shipment     BIGINT NOT NULL,      -- allocation recognized as each delivers
  payment_ref      TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled',
                     'refunded')),
  refund_amount    BIGINT,               -- from the plan's prepaid_refund rule
  CHECK (shipments_made <= shipments_owed)
);
```

The renewal job runs daily per merchant and does, for each renewal row whose `charge_on` has come:

```sql
-- Claim due renewals for one group, after checking the subscription is still live:
UPDATE subscription_renewals r
SET status = 'charging'
FROM subscriptions s
WHERE r.subscription_id = s.id
  AND r.status = 'scheduled'
  AND r.charge_on <= CURRENT_DATE
  AND s.status = 'active'
  AND (s.cancel_at IS NULL OR s.cancel_at > NOW())
  AND r.group_key = $1
RETURNING r.subscription_id, r.cycle;
```

Then it builds the order preview from current price, tax and stock, inserts a `billing_attempts` row with key `group_key:attempt-1`, charges, and on success creates the order with `orders.subscription_id` set (one order per group; lines carry their subscription), moves the rows to `paid` and emits `subscription.renewed`. A prepaid cycle skips the charge: its row is `prepaid`, and the order is created against the `prepaid_periods` row, incrementing `shipments_made`.

Design notes:

- **The renewal row is the unit of truth.** Skips, holds, failures and prepaid shipments are all states of one row per cycle, so "what happened to the March box?" has one answer, and the primary key makes a second March order impossible.
- **Grouping is a key, not a join.** `group_key` (customer, address, ship date) is computed when renewals are scheduled; a subscription that moves dates gets a new key, and a group's attempts are counted against the network limits per card, not per subscription.
- **Previews and renewals share code.** The "upcoming order" in the portal and the renewal job call the same pricing function at a stated instant, so the customer sees what they will be charged.
- **Plans are versioned like prices.** A subscriber stays on the plan version they accepted; a new discount or charge lead is a new version for new subscribers, and moving existing ones is a migration with notices.
- **Events:** `subscription.created`, `subscription.changed`, `subscription.skipped`, `subscription.paused`, `subscription.renewal_failed`, `subscription.renewed`, `subscription.cancel_requested` and `subscription.ended` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to email and SMS flows, inventory planning and reporting.

## Auditing

- **What was agreed.** For every subscription, the plan version and its disclosure, the consent record and the stored-credential agreement, kept as [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law#how-to-build-it) requires.
- **Every cycle and its outcome.** Each renewal row with its scheduled date, charge date, status and order, so a customer's history (shipped, skipped, held, failed) can be reproduced and a "you charged me after I skipped" claim checked against the skip's timestamp and the cutoff.
- **Every change.** Who changed what, from which channel, effective from which cycle.
- **Every charge attempt.** Amount, credential, raw decline code, merchant advice code and the next attempt, so retry counts per card can be shown to be inside network limits.
- **Prepaid balances.** Paid, owed, shipped and refunded per prepaid term, reconciling to the deferred revenue finance books.

## What This Means for the System You Build

- **Store the promise, build the order late:** a subscription holds plan, lines and schedule; each renewal order is built on the day from current price, tax, stock, address and card.
- **Model interval, anchor, cutoff and charge lead explicitly,** on a versioned plan, and compute every date in the customer's zone.
- **Keep one row per cycle** with its outcome (paid, skipped, held, failed, prepaid), keyed so a cycle can't renew twice.
- **Record every edit** with actor, channel and the cycle it applies from, and never let an edit change an order already created.
- **Separate customer stops from merchant holds** so churn and skip reports aren't polluted by stockouts and declines.
- **Treat prepaid cash as owed goods:** one charge, several orders, an allocation per shipment and a refund rule in the plan.
- **Charge renewals as merchant-initiated transactions** on the stored-credential agreement, with idempotency keys per group and attempt, and respect the platform and network retry limits.
- **End failed recovery in a pause, not a cancellation,** and report involuntary churn separately from voluntary.
- **Map subscriptions to the other books' models:** a renewal produces an order here, a fee waiver in delivery and a visit in field service, on the same promise.
- **Measure churn, skips, recovery and saves by cohort,** and compute LTV from orders actually produced.

## References

**Platform documentation**

- [Shopify: About subscriptions](https://shopify.dev/docs/apps/build/purchase-options/subscriptions), pay-per-delivery and prepaid purchase models, subscription contracts, delivery, pricing and billing policies, customer payment methods
- [Shopify: Build a subscription contract](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/contracts/build-a-subscription-contract), renewal by app billing attempts, the idempotency key, asynchronous attempts and their states, `originTime`, billing as a whole-number multiple of delivery cadence, the 30-in-35-days retry guidance
- [Shopify: Selling plans](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/selling-plans), selling plan groups, billing, delivery, inventory and pricing policies, anchors, cutoffs and pre-anchor behavior
- [Recharge: Charges API](https://developer.rechargepayments.com/2021-11/charges), charges grouped per address and date, statuses, retry dates, skip and unskip, orders created on success
- [Recharge: Subscriptions API](https://developer.rechargepayments.com/2021-11/subscriptions), subscriptions as children of an address, prepaid orders per charge, bundle selections
- [Stripe: Automate payment retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries), Smart Retries and its 8-tries-in-2-weeks default, hard decline codes, end states after failed recovery

**Pricing and product pages**

- [Recharge: Pricing](https://getrecharge.com/pricing/), Starter and Plus fees and transaction rates
- [Skio: Pricing](https://skio.com/pricing), the Scale plan, the transaction fee, recovery campaigns, cancel flow builder and build-a-box
- [Stripe: Billing pricing](https://stripe.com/billing/pricing), 0.7% of billing volume, Smart Retries and recovery automations
- [Ordergroove](https://www.ordergroove.com/), subscriptions, memberships, involuntary churn suite, supported platforms and listed customers
- [Stay AI](https://stay.ai/), the Shopify subscription platform's portal, dunning and cancellation survey features

**Brands**

- [Pestie](https://pestie.com/), the plan built around home, pests and climate, reapplication every three months in most areas, shipment contents
- [Pestie: Returns, refunds and guarantee](https://pestie.com/returns-refunds-guarantee), cancellation ending guarantee coverage, refunds limited to the latest eligible charge, paused subscriptions excluded from the guarantee
- [Pestie: Shipping and delivery policy](https://pestie.com/shipping), subscriptions fulfilled on the schedule in account settings
