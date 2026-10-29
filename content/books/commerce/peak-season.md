+++
title = "Peak Season & Drops"
description = "BFCM load and capacity planning, load tests with real carts, code freezes, waiting rooms, fair limited drops, carrier peak surcharges and incident readiness."
category = "Commerce Industry"
order = 2361
part = "Running the Platform"
tags = ["commerce", "peak-season", "bfcm", "waiting-rooms", "capacity-planning", "drops"]
+++

Commerce has a calendar, and the calendar has a cliff. A store that takes a few orders a minute in June takes many times that on Black Friday, at a time of day the marketing team picked, with every discount, every carrier surcharge and every warehouse cutoff changing in the same six weeks. A limited release is the same cliff in miniature: a sneaker, a collaboration or a restock announced for 10:00 a.m., with a hundred shoppers for every unit, many of them bots, all arriving in the first second. Both are planned events, which is the point: the date is known months ahead, and nearly every failure at peak is a decision that wasn't made in time.

This chapter covers running a store through peak season and limited drops as of October 2026: how large the peak is, capacity planning and load testing with realistic carts, change freezes, waiting rooms and queues, drops and inventory fairness, rate limits and bot defense at checkout, carrier and 3PL peak pricing and cutoffs, and incident readiness. The general engineering is the playbook's: [Load Testing](/docs/quality/load-testing), [Waiting Rooms & Admission Control](/docs/architecture/admission-control), [Incident Response](/docs/operations/incident-response), [On-Call](/docs/operations/on-call) and [SLOs](/docs/operations/slos); infrastructure autoscaling is Hosting & Cloud's [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost), and edge bot and rate controls are its [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits). The chapter extends `items` and `inventory_levels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `drops`, `drop_entries`, `drop_allocations` and `waiting_room_tokens`.

## How the Platforms Do It

As of October 2026, from the vendors' own releases and documentation:

| Vendor | What it published about peak | How it prepares or what it offers |
| --- | --- | --- |
| **Shopify** | $14.6 billion in merchant sales over BFCM 2025, up 27%; a peak of $5.1 million a minute at 12:01 p.m. EST on Black Friday; 489 million edge requests a minute and over 117 million on app servers at peak | Five scale tests at forecast traffic from April to October with its Genghis load tool, the last at 200 million requests a minute; game days; "We don't use BFCM as a release deadline"; bot protection for checkout on Plus |
| **Salesforce B2C Commerce** | Cyber Week 2025 global sales of $336.6 billion across its data set | Customers "Freeze the code (typically on November 1 in the USA)"; load testing on a time-limited loaner realm; "no load testing after October 31"; a case logged two weeks before any event at twice normal load |
| **Adobe Commerce on cloud** | Peak "approximately Mid-November through Mid-January" | A surge capacity ticket "at least 48 business hours in advance," drawn from licensed overage capacity |
| **Stripe** | Over $40 billion processed over BFCM 2025; over 152,000 transactions a minute at peak; API uptime above 99.9999% | Radar blocked over 24.6 million attempted fraudulent transactions over the weekend |
| **Adyen** | $43 billion over the BFCM weekend, up 27%; a peak of 199,000 transactions a minute on Black Friday; 99.9999% uptime | Not covered here |
| **Cloudflare Waiting Room** | Not applicable | Total active users and new users per minute as targets; FIFO on Business plans; random, passthrough, reject, scheduled events and pre-queues on the Enterprise add-on |
| **Queue-it** | Not applicable | A hosted waiting room with server-side connectors, signed tokens, pre-queue randomization and invite-only queues |

Three patterns run through the table:

- **The peak is measured per minute.** Annual and weekend totals make headlines; the number that breaks systems is sales or requests a minute at the top of the hour a promotion goes live. Shopify's and the processors' peaks are minute figures for that reason.
- **Readiness is a program, not a test.** The platforms that publish their preparation describe months of it: forecasts sent to cloud providers, repeated scale tests, failure drills and freezes. A merchant on any of them inherits the platform's capacity and still owns its own apps, integrations, promotions and warehouses.
- **Admission is a product.** Waiting rooms are sold as configuration (a rate, a ceiling, a queue order) because the alternative, provisioning for a hundred times normal traffic for one hour, costs more than queuing.

## How Big the Peak Is

Adobe, measuring US online spend across retail sites it instruments, reported for 2025:

- **The season:** $257.8 billion online from November 1 to December 31, up 6.8%, with 56.4% of transactions on a smartphone and buy now, pay later at $20 billion; 25 days topped $4 billion of spend.
- **Cyber Week:** $44.2 billion from Thanksgiving through Cyber Monday, up 7.7%: Thanksgiving $6.4 billion, Black Friday $11.8 billion, Cyber Monday $14.25 billion, the year's largest day. Between 8 and 10 p.m. on Cyber Monday shoppers spent $16 million a minute.

Salesforce, on its own data set of commerce sites, reported Cyber Week 2025 sales of $336.6 billion globally and $79.6 billion in the US, and attributed 20% of global orders to AI and agents by its own method. The National Retail Federation reported holiday sales from November 1 through December 31 up 4.1%, a figure that includes stores. The sources measure different populations and shouldn't be added or compared directly; what they agree on is the shape: a season-long plateau, a week several times higher, and evening minutes higher still.

Two consequences for a merchant's own plan. **Forecast from your own history, by hour,** not from industry growth: last year's peak hour times expected growth, adjusted for this year's promotion calendar, email sends and paid campaigns, which schedule the spikes. And **plan for the worst minute, not the busiest day:** the email that goes to two million subscribers at 6:00 a.m. produces the minute that matters.

## Capacity Planning for a Sale

The method is the playbook's ([Capacity Planning](/docs/quality/load-testing#capacity-planning)): find the bottleneck, fix it, find the next one, and know your headroom against the breakpoint. A store's bottlenecks are rarely its web servers, which a hosted platform or a CDN absorbs ([Caching Catalog Pages](/books/commerce/storefronts#caching-catalog-pages)). They are the parts that write or that call someone else:

- **Checkout and order creation.** Every order writes a checkout, an order, its lines and charges, a payment authorization and an inventory commitment in a few seconds, and the hot rows are the inventory counts of the items on sale: short stock writes outside the payment call, split counters and admission before reservation are [Inventory Consistency Under Load](/books/commerce/commerce-architecture#inventory-consistency-under-load).
- **Third-party calls at checkout.** Tax calculation, address validation, shipping rates, fraud scoring and the payment provider each have rate limits and latency of their own, and the store's capacity is the smallest of them ([Test the limits you don't control](/docs/quality/load-testing#capacity-planning)). Ask each vendor for its peak limits in writing and what it does when exceeded.
- **Apps and webhooks.** On a hosted platform every installed app that listens to `orders/create` receives a burst at the same moment, and an app that can't keep up delays fulfillment, loyalty, reviews and the ERP. The platform keeps up; the app ecosystem may not.
- **Downstream systems.** The OMS, the 3PL's order intake, the ERP and the email platform each have an ingestion rate. Orders that queue between systems are fine; orders that are dropped or duplicated are not ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **People and buildings.** A warehouse that picks 5,000 orders a day doesn't pick 50,000 because the site took them; the shipping promise on the product page has to know that ([Delivery Promises](/books/commerce/shipping-and-carriers#delivery-promises)).

Hosted platforms ask for the forecast too: Salesforce B2C Commerce customers log a case two weeks ahead of an event that doubles orders, requests or visitors with at least 1,000 orders in the peak hour, and Adobe Commerce on cloud merchants request surge capacity ahead of time against their licensed overage. Self-hosted stores scale their own infrastructure ([Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost)); scale-out takes minutes and a flash sale peaks in seconds, so capacity for a scheduled sale is raised before it starts and lowered after, on a schedule, not left to an autoscaler's reaction.

## Load Testing With Realistic Carts

A load test that requests the home page measures the CDN. The traffic that breaks a store is a mix: browsing and search (cacheable), cart changes (not cacheable), and checkouts that call every third party ([Make the Traffic Real](/docs/quality/load-testing#make-the-traffic-real)). For a commerce test that means:

- **The real funnel ratio.** Sessions, add-to-cart, checkout starts and orders in last year's peak proportions, generated at an arrival rate rather than by looping users, so stalls are recorded rather than hidden ([Coordinated Omission](/docs/quality/load-testing#coordinated-omission)).
- **Real carts.** The distribution of cart sizes, the items on promotion (the hot SKUs), bundles, discount codes and automatic discounts in force, gift cards, and addresses spread across states and zones so tax and shipping are computed rather than cached.
- **The payment path, honestly.** Processors' test environments don't promise production capacity; agree with the processor what will be tested and how, and stop the test at the payment call if they won't take the load.
- **The surroundings.** Webhook consumers, the OMS feed and inventory sync running, because a test that switches them off measures a store nobody runs.
- **Somewhere like production, announced.** Salesforce's loaner realms exist so tests run on production-sized infrastructure without touching production, are "time-limited, typically up to 60 days," and its guidance says to notify customer support of the test. Self-hosted stores warn their CDN, WAF and payment provider before a test looks like an attack.

Shopify's own program is the published high-water mark: Genghis runs scripted workflows from three cloud regions, five scale tests ran at forecast traffic between April and October 2025, the fourth reaching 146 million requests a minute and over 80,000 checkouts a minute, and game days simulate production failures at that scale, with findings kept in a "Resiliency Matrix." A merchant's program is smaller and has the same parts: a forecast, a scripted funnel, repeated tests with fixes between them, and a failure drill.

## Freezes and Change Control

Every platform that publishes its peak practice limits change, and they disagree about how. Salesforce tells B2C Commerce customers to freeze code, typically on November 1 in the US, and allows no load testing after October 31. Shopify described in 2019 a feature freeze ("most user-facing features won't be touched") followed by a code freeze in which "Only critical fixes can be deployed," against a normal pace of about 40 deploys a day; its 2025 readiness write-up says "We don't use BFCM as a release deadline," and describes no freeze.

The two positions agree once the question is what changes are risky. Shipping a feature to meet the peak is risky; so is a schema migration, a new app, a theme release, a new tax or shipping integration, or a rebuilt promotion engine, and none of them should land in the last weeks. Small, reversible deploys of fixes are safer than holding them. My rules:

- **Freeze what's hard to reverse, from a written date:** schema migrations, platform and app upgrades, new integrations, checkout extensions and theme releases. Each needs a named approver to ship inside the window.
- **Keep fixes flowing,** small and behind the same release checks, with rollback rehearsed ([Immutable Deploys Make All of This Easier](/docs/delivery/deployment-strategies#immutable-deploys-make-all-of-this-easier)).
- **Stage the sale as data before the freeze.** Prices, promotions, discount codes, collections, banners and the drop itself are records created and tested in advance with effective dates ([Price Lists, Price Books and B2B Prices](/books/commerce/pricing#price-lists-price-books-and-b2b-prices), [Codes, Limits and Budgets](/books/commerce/promotions-and-gift-cards#codes-limits-and-budgets)); a person editing a discount at midnight is the change most likely to go wrong.
- **Pre-build the degrade switches** (below) and test them in the load tests, so turning off recommendations during an incident is a toggle, not a deploy.

## Waiting Rooms and Queues

When demand will exceed what checkout can serve, a waiting room admits shoppers at the rate the store can handle and holds the rest. The design is the playbook's [Waiting Rooms & Admission Control](/docs/architecture/admission-control): capacity per scope, a queue with a ceiling, honest wait messages, a signed admission token and fairness rules. The vendors expose the same knobs:

- **Cloudflare Waiting Room** is configured with total active users ("a target threshold for how many simultaneous users you want to allow") and new users per minute ("the target threshold for the maximum rate of user influx"); a user counts as active for the session duration since their last request, and a cookie carries their place. Queueing is FIFO, random, passthrough or reject; scheduled events override the room's settings for their duration and can open a pre-queue at least five minutes before the start, with users in it "randomly admitted at event start" when shuffle is on. One basic room is included on Business plans (FIFO only); random order, events and the other methods are on the Enterprise add-on.
- **Queue-it** redirects excess visitors to a room on its own infrastructure and returns admitted ones with a signed token; server-side connectors make the queue "unskippable," while a client-side script can be bypassed. Its pre-queue shows a countdown and randomizes everyone present when the sale starts, after which arrivals get first-come places. Enqueue tokens tie a place to a visitor the store has identified so entry can't be shared, and an invite-only room admits only listed visitors.

The commerce decisions sit on top:

- **Where the gate goes.** A whole-site room protects everything and frustrates browsers; a room in front of the drop's product page or checkout protects only what's scarce. For a single hyped item, gate its product page and checkout; for a sitewide sale, gate checkout and let browsing run from cache.
- **Size the room from checkout, not the web tier.** Admission per minute is what the slowest checkout dependency (payments, tax, inventory writes) sustains with headroom, measured in the load test, not what the servers could serve as pages.
- **Stock is a second ceiling.** When there are 2,000 units and 80,000 people in line, the queue is a lottery for most of them. Show stock against queue position when it's known, end the queue when stock is gone, and say so; a shopper who waits forty minutes to reach a sold-out page has been misled ([Position and Wait Messages](/docs/architecture/admission-control#position-and-wait-messages)).
- **The token means something downstream.** The admission token is checked at checkout, not just at the page, and is tied to the same customer, session and reservation, so a token can't be passed to a bot farm ([The Admission Token](/docs/architecture/admission-control#the-admission-token)).

## Limited Drops and Inventory Fairness

A drop is a scheduled release of scarce stock, and its fairness is a policy the merchant writes down. Two allocation models dominate:

- **First come, first served.** The queue's order decides, so speed and early arrival decide, and bots are fast. Randomizing everyone present at the start (a shuffled pre-queue) removes the advantage of arriving early but not of having more entries.
- **A draw.** Shoppers enter during a window and winners are chosen at random from eligible entries. Nike's SNKRS Pass gives "a limited window of time to submit your size request" after which "we'll choose winners at random," with "a limit of one (1) reservation and pickup per person, per shoe style." A draw moves the fight from speed to identity: Nike says bot attacks "can make up about 10%-50% of all entries," and asks members to "engage with launches on SNKRS using one account on one device," noting that multiple accounts "could reduce the likelihood" of its Exclusive Access offers.

Either way the mechanics are the same:

- **Reserve at admission or on winning.** A shopper admitted from the queue, or a winner of the draw, holds a reservation for a short, stated time to pay ([Reservations](/books/commerce/inventory#reservations), [Hold Lifetimes Are Policy](/docs/architecture/reservations-and-holds#hold-lifetimes-are-policy)); an unpaid hold returns to the pool or to the next entrant on the waitlist, never to a bot reloading the page ([Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)).
- **Allocate the drop's stock once.** The units for a drop are a quantity carved out of available stock for the drop's window, so a sitewide sale on other items can't sell them and the drop can't oversell ([Safety Stock and Channel Buffers](/books/commerce/inventory#safety-stock-and-channel-buffers)).
- **Limit per person, enforced at the order.** "One per customer" means one per account, and in practice per payment card, shipping address and device too, normalized (addresses standardized, card fingerprints compared) and checked when the order is created, not only in the cart ([Identity and Merge](/books/commerce/customers-and-accounts#identity-and-merge)).
- **Cancel duplicates after the fact,** by rule and with a record, when entries that passed the checks turn out to share a card, an address or a device cluster; the rule is published with the drop, so the cancellation is the policy applied, not a surprise.
- **Accessibility is part of fairness.** A queue or a CAPTCHA that a screen-reader user can't pass excludes them from the drop ([Accessibility and ADA Litigation](/books/commerce/storefronts#accessibility-and-ada-litigation)); challenges belong at entry, with an accessible alternative.

**The law, as of October 2026.** The federal BOTS Act covers only event tickets, and the FTC keeps using it: after its August 18, 2025 suit against Key Investment Group, it sued another ticket broker, REPS & Company, through the Justice Department on October 15, 2026, alleging over 18.5 million tickets bought since 2022 with proxies, multi-session browsers and virtual cards. The Stopping Grinch Bots Act of 2025 (S. 3516) would extend the prohibition to internet retailers' measures "to enforce posted purchasing limits or to manage inventory," and hasn't passed. A retailer's purchase limit is therefore a term of sale it enforces itself; the law, the enforcement record and the fraud side of reseller bots and hoarding are [Resellers, Sneaker Bots and the BOTS Act](/books/commerce/commerce-fraud#resellers-sneaker-bots-and-the-bots-act) and [Bots and Inventory Hoarding](/books/commerce/commerce-fraud#bots-and-inventory-hoarding).

## Rate Limits and Bot Defense at Checkout

Bots arrive at peak for three reasons: to buy scarce items for resale, to test stolen cards while the store's traffic hides them, and to scrape prices and stock. The layers, in the order a request meets them:

- **At the edge.** Bot scores, verified-bot allowances, challenges and rate limits keyed on the identities that matter, configured and logged before the sale, not invented during it ([Bots: From CAPTCHA to Scores](/books/hosting-and-cloud/waf-bots-and-rate-limits#bots-from-captcha-to-scores), [Rate Limiting at the Edge](/books/hosting-and-cloud/waf-bots-and-rate-limits#rate-limiting-at-the-edge)).
- **At the gate.** The waiting room challenges on entry and rate-limits its own join and status endpoints ([Fairness and Bots](/docs/architecture/admission-control#fairness-and-bots)).
- **In checkout.** Shopify's bot protection, on Plus, "acts as a fairness control by blocking known bots from your checkout, and slowing down bot activity," targets up to 500 products or the whole store, runs an event for at most 60 minutes, and challenges with reCAPTCHA or hCaptcha on the Online Store channel. A custom checkout does the same with limits per session, customer, card fingerprint and address on the checkout endpoints ([Rate Limiting](/docs/requests/rate-limiting#what-to-key-on)).
- **At payment.** Card testing rises at peak because a burst of small authorizations hides in a burst of real ones; Stripe reported blocking over 24.6 million attempted fraudulent transactions over BFCM 2025. Velocity rules and the processor's tools are the Payments volume's [Card Testing](/books/payments/fraud-and-risk#card-testing).

Agents complicate the picture: an AI shopping agent buying on a person's behalf looks like a bot and may be a welcome customer, which is why agent traffic is identified and given its own limits rather than blocked with the rest ([Agent Identity and Access](/books/commerce/agentic-commerce#agent-identity-and-access)).

## Carriers, 3PLs and Cutoffs

Peak changes what shipping costs and when it can still arrive, and both change the promise on the product page.

**Surcharges.** The Postal Service set temporary holiday prices from October 5, 2025 to January 18, 2026 on Priority Mail Express, Priority Mail, Ground Advantage and Parcel Select; commercial Ground Advantage to zones 5 to 9, for example, rose by $0.35 up to 3 pounds and by $5.50 for 26 to 70 pounds and oversized. FedEx's 2026 demand surcharges add $0.50 per residential Ground or Home Delivery package from October 26 to November 22, $0.80 from November 23 to December 27 and $0.50 again to January 17, 2027, with higher amounts for Ground Economy, Additional Handling and Oversize; shippers of more than 20,000 residential packages a week also pay a Residential Delivery Demand Charge priced by how far their weekly volume exceeds a June 2026 baseline, recalculated weekly and applied two weeks later. UPS publishes a similar schedule, which I could read only through trade press for 2025. <!-- source-gap: ups-peak-surcharges | secondary | UPS 2025 and 2026 demand surcharge amounts and dates | closes with: the UPS demand surcharge page or its PDF, which refused automated fetches | checked: 2026-10-28 --> Surcharges are rate-table versions with effective dates like any other ([Zones, Surcharges and Rate Changes](/books/commerce/shipping-and-carriers#zones-surcharges-and-rate-changes)), and the volume-based kind means a merchant's peak shipping cost depends on its own June.

**Cutoffs.** Carriers publish last ship dates for holiday delivery; the Postal Service's for 2025 were December 17 for Ground Advantage, December 18 for Priority Mail and December 20 for Priority Mail Express in the contiguous US. Marketplaces and 3PLs set earlier ones: Amazon asked for FBA inbound shipments for the 2026 holidays by October 21 ([Fulfillment by Amazon as a selling program](/books/commerce/selling-on-amazon#fulfillment-by-amazon-as-a-selling-program)), and Amazon's Multi-Channel Fulfillment runs a peak rate card from October 15, 2026 to January 14, 2027 ([Amazon Multi-Channel Fulfillment and FBA](/books/commerce/warehouses-and-3pls#amazon-multi-channel-fulfillment-and-fba)). Some 3PLs advertise the opposite: ShipBob says it has "no cutoffs or blackout dates" for receiving inventory. The contract's peak terms (capacity reserved, surcharges, receiving cutoffs, ship-by SLAs) are the ones to read in July ([SLAs and What They Measure](/books/commerce/warehouses-and-3pls#slas-and-what-they-measure)).

**The promise.** A store that keeps showing "arrives by Christmas" after the carrier cutoff, or "ships tomorrow" when the warehouse is three days behind, makes a shipping promise it can't keep, and the FTC's Mail Order Rule requires a reasonable basis for every stated time and a delay notice when it slips ([Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule)). The delivery estimate reads the cutoff calendar and the warehouse's actual backlog, and the holiday banner changes when they do.

## Incident Readiness

An incident at peak is an ordinary incident with a higher cost per minute, so the process is the playbook's ([Incident Response](/docs/operations/incident-response), [On-Call](/docs/operations/on-call)); what changes is preparation:

- **Business signals beside system signals.** Orders per minute against the hour's forecast, checkout completion rate, payment approval rate by processor, and inventory sync lag, on one dashboard with alerts on deviation; a payment provider's partial outage shows as a falling approval rate before any error rate moves ([Dashboards & Alerts](/docs/observability/dashboards-and-alerts), [Payments Metrics](/books/payments/payments-metrics#acceptance)).
- **Synthetic checkouts** on the live site through the peak, buying a test item end to end every few minutes from outside ([Frontend & Synthetic Monitoring](/docs/observability/frontend-and-synthetic)).
- **Degrade switches, rehearsed.** Turn off personalized recommendations, fall back to a simpler search, defer non-essential webhooks and post-purchase emails, switch the waiting room from passthrough to queue, and pause a promotion, each a flag with an owner ([Mitigate First, Diagnose Later](/docs/operations/incident-response#mitigate-first-diagnose-later)).
- **A staffed calendar.** The hours of the biggest sends are covered by people who can act on every layer: the platform, payments, the 3PL, the marketing team that can delay an email. Vendor escalation contacts are confirmed in advance, not looked up during the incident. Support's own peak trails the sales peak by the days it takes to ship and deliver, and return contacts by weeks ([SLAs and Metrics](/books/commerce/customer-service#slas-and-metrics)).
- **Customer-facing words written ahead,** for a queue, a delayed shipment, a sold-out drop and a checkout outage, so support and status pages say the same thing ([Communicate on a Clock](/docs/operations/incident-response#communicate-on-a-clock)).

## How to Build It

Drops and waiting rooms add four tables; the rest of peak readiness lives in rate tables, promotions and capacity settings that earlier chapters already own:

```sql
CREATE TABLE drops (                     -- a scheduled release of scarce stock
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  name             TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('first_come', 'shuffled_queue', 'draw')),
  entry_window     TSTZRANGE,            -- for a draw: when entries are accepted
  sale_starts_at   TIMESTAMPTZ NOT NULL,
  hold_minutes     SMALLINT NOT NULL CHECK (hold_minutes > 0),  -- time to pay once admitted
  limit_per_customer SMALLINT NOT NULL DEFAULT 1,
  limit_keys       TEXT[] NOT NULL DEFAULT '{customer,card,address}',  -- what "one" means
  rules_text       TEXT NOT NULL,        -- the published rules, as shown
  status           TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'open', 'drawing',
                     'selling', 'closed')),
  CHECK ((method = 'draw') = (entry_window IS NOT NULL))
);

CREATE TABLE drop_allocations (          -- stock carved out for a drop, per item and location
  drop_id      UUID NOT NULL REFERENCES drops (id),
  item_id      UUID NOT NULL REFERENCES items (id),
  location_id  UUID NOT NULL REFERENCES locations (id),
  quantity     INT NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (drop_id, item_id, location_id)
);

CREATE TABLE drop_entries (              -- one entrant's request, with its outcome
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  drop_id        UUID NOT NULL REFERENCES drops (id),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  item_id        UUID NOT NULL REFERENCES items (id),     -- the size or variant requested
  identity_keys  JSONB NOT NULL,         -- normalized card fingerprint, address hash, device
  entered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  draw_rank      BIGINT,                 -- position from the recorded random draw
  status         TEXT NOT NULL CHECK (status IN ('entered', 'ineligible', 'won', 'lost',
                   'waitlisted', 'purchased', 'expired', 'cancelled_duplicate')),
  reason         TEXT,                   -- why ineligible or cancelled, by rule
  reservation_id UUID REFERENCES inventory_reservations (id),
  order_id       UUID REFERENCES orders (id),
  UNIQUE (drop_id, customer_id, item_id)
);

CREATE TABLE waiting_room_tokens (       -- an admission, verified again at checkout
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  room          TEXT NOT NULL,           -- the vendor's room or the store's own gate
  drop_id       UUID REFERENCES drops (id),
  session_ref   TEXT NOT NULL,           -- the session the token was issued to
  customer_id   UUID REFERENCES customers (id),
  issued_at     TIMESTAMPTZ NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,             -- set when a checkout consumes it
  checkout_id   UUID REFERENCES checkouts (id),
  UNIQUE (room, session_ref, issued_at)
);
```

A draw is a recorded random order over eligible entries, then a walk down it that allocates stock and reserves for each winner. Recording the seed and the rank on every entry is what makes the draw provable afterwards:

```sql
-- 1. Rank eligible entries with a seeded, recorded random order.
--    (:seed is generated once, stored with the drop's audit record, and never reused.)
UPDATE drop_entries e
SET draw_rank = r.rank
FROM (
  SELECT id, ROW_NUMBER() OVER (
           PARTITION BY item_id
           ORDER BY md5(:seed || id::text)) AS rank
  FROM drop_entries
  WHERE drop_id = :drop_id AND status = 'entered'
) r
WHERE e.id = r.id;

-- 2. Winners are the first N per variant, N being the drop's allocation for it;
--    each winner then gets an inventory reservation with the drop's hold time.
UPDATE drop_entries e
SET status = CASE WHEN e.draw_rank <= a.units THEN 'won' ELSE 'waitlisted' END
FROM (
  SELECT item_id, SUM(quantity) AS units
  FROM drop_allocations WHERE drop_id = :drop_id GROUP BY item_id
) a
WHERE e.drop_id = :drop_id AND e.item_id = a.item_id AND e.status = 'entered';

-- Entries that share a limit key with another entry in the same drop.
SELECT e.drop_id, k.key, k.value, array_agg(e.id) AS entries
FROM drop_entries e,
     LATERAL jsonb_each_text(e.identity_keys) k
WHERE e.drop_id = :drop_id AND e.status IN ('entered', 'won', 'purchased')
GROUP BY e.drop_id, k.key, k.value
HAVING COUNT(DISTINCT e.customer_id) > 1;
```

Design notes:

- **Eligibility runs before the draw.** Duplicate identity keys, accounts created inside the entry window and failed bot checks set `status = 'ineligible'` with a `reason` before ranking, so the draw is over the entries the rules allow and the exclusions are explainable one by one.
- **The reservation is the hold.** A winner's `inventory_reservations` row has `purpose = 'drop'` and the drop's `hold_minutes`; when it expires, the next waitlisted entry by `draw_rank` is promoted. First-come drops skip the draw and create the reservation when the waiting room admits the shopper.
- **The allocation is subtracted from available.** Available-to-sell for a drop item outside the drop is on hand less committed, reservations and the drop's allocation for its window, the same computation as any channel buffer ([Available to Promise](/books/commerce/inventory#available-to-promise)).
- **Tokens are consumed once.** Checkout for a gated item requires an unexpired, unused token for the same session, sets `used_at` in the same transaction that creates the checkout, and rejects a second use ([The Admission Token](/docs/architecture/admission-control#the-admission-token)). A vendor's signed token is verified with the vendor's key and recorded here so the check is the store's, not only the edge's.
- **Peak calendars are rate tables.** Carrier surcharges and holiday prices are new versions of the rate tables in [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it); 3PL peak terms are versions of `fulfillment_provider_slas`; store capacity overrides for holiday hours are rows in [Omnichannel Fulfillment](/books/commerce/omnichannel-fulfillment#how-to-build-it). None needs a new table, and each needs its effective dates entered before the season.
- **Emit events:** `drop.opened`, `drop.drawn`, `drop_entry.won`, `drop_entry.expired` and `drop.closed`, consumed by notifications and analytics, with winner notices sent once per entry ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate)).

## Auditing

- **The drop's rules and the draw.** The published rules text, the allocation, the seed, every entry's rank and status, and every exclusion with its reason, so a customer's complaint or a regulator's question about fairness is answered from rows.
- **Purchase-limit enforcement.** Every order rejected or cancelled for a limit, with the keys that matched.
- **Change during the freeze.** Every deploy, configuration change and promotion edit inside the freeze window, with its approver.
- **Capacity and admission settings over time.** Waiting room rates and ceilings, bot-protection events and rate-limit rules as they were at each minute of the event, beside the orders and errors of that minute.
- **Promises against cutoffs.** The delivery estimates shown after each carrier and warehouse cutoff, and the delay notices sent.

## What This Means for the System You Build

- **Forecast the peak minute** from your own history and the promotion calendar, and size checkout, not the web tier, to it.
- **Load-test the real funnel** with real carts, promotions and addresses, with webhooks and downstream feeds running, more than once, with fixes between.
- **Freeze what's hard to reverse** from a written date, keep small fixes flowing, and stage every sale as dated data before the freeze.
- **Put a waiting room in front of what's scarce,** sized from checkout capacity and stock, with a token checked again at checkout.
- **Write the drop's fairness rules down,** allocate its stock once, reserve on admission or winning, enforce limits at order creation, and record the draw.
- **Layer bot and rate controls** from the edge to payment, and identify agents rather than blocking them with bots.
- **Load peak surcharges and cutoffs as dated rate versions** and make delivery promises read them.
- **Watch business signals,** rehearse degrade switches, and staff the hours of the biggest sends.

## References

**Peak volumes**

- [Adobe: Adobe Cyber Monday hits record (December 2, 2025)](https://news.adobe.com/news/2025/12/adobe-cyber-monday-hits-record), Cyber Monday, Black Friday, Thanksgiving and Cyber Week spend, $16 million a minute between 8 and 10 p.m.
- [Adobe: Holiday shopping season results (January 7, 2026)](https://news.adobe.com/news/2026/01/adobe-holiday-shopping-season), $257.8 billion online, 56.4% on smartphones, $20 billion buy now pay later, 25 days over $4 billion
- [Salesforce: Cyber Week 2025 (December 5, 2025)](https://www.salesforce.com/news/press-releases/2025/12/05/cyber-week-ai-agents-sales/), $336.6 billion global and $79.6 billion US sales and the AI-influenced share by Salesforce's method
- [NRF: CNBC/NRF Retail Monitor December data (January 12, 2026)](https://nrf.com/media-center/press-releases/cnbc-nrf-retail-monitor-s-december-data-shows-strong-holiday-season-spending), holiday sales up 4.1%
- [Shopify: Shopify merchants achieve record-breaking $14.6 billion Black Friday-Cyber Monday (December 2, 2025)](https://www.shopify.com/investors/press-releases/shopify-merchants-achieve-record-breaking-146-billion-black), sales, the $5.1 million a minute peak and edge, app server and database figures
- [Stripe: BFCM 2025 (December 2, 2025)](https://stripe.com/newsroom/news/bfcm2025), over $40 billion processed, 152,000 transactions a minute, API uptime and fraudulent attempts blocked
- [Adyen: BFCM 2025 (December 2, 2025)](https://www.adyen.com/press-and-media/bfcm2025), $43 billion, 199,000 transactions a minute and uptime

**Readiness**

- [Shopify Engineering: BFCM readiness 2025 (November 20, 2025)](https://shopify.engineering/bfcm-readiness-2025), Genghis, five scale tests, 146 million requests and 80,000 checkouts a minute, the 200 million p99 test, game days, the Resiliency Matrix and no release deadline
- [Shopify: Preparing the back end for Black Friday and Cyber Monday (January 21, 2019)](https://www.shopify.com/news/preparing-the-back-end-for-black-friday-and-cyber-monday), the feature freeze, the code freeze and about 40 deploys a day
- [Salesforce Trailhead: Holiday readiness plan](https://trailhead.salesforce.com/content/learn/modules/b2c-holiday-season-ready/b2c-holiday-ready-plan), the November 1 code freeze and the case logged two weeks before a high-load event
- [Salesforce Trailhead: Holiday load testing](https://trailhead.salesforce.com/content/learn/modules/b2c-holiday-season-ready/b2c-holiday-ready-load-test), loaner realms up to 60 days, no load testing after October 31 and notifying support
- [Adobe Experience League: Holiday surge capacity requests for Adobe Commerce on cloud](https://experienceleague.adobe.com/en/docs/support-resources/adobe-support-tools-guide/adobe-commerce-support/holiday-surge-capacity-requests-for-magento-commerce-cloud), the peak period, the 48-business-hour ticket and overage capacity

**Waiting rooms and bots**

- [Cloudflare: How Waiting Room works](https://developers.cloudflare.com/waiting-room/about/), total active users, new users per minute, session duration and the cookie
- [Cloudflare: Queueing methods](https://developers.cloudflare.com/waiting-room/reference/queueing-methods/), FIFO, random, passthrough and reject
- [Cloudflare: Waiting Room plans](https://developers.cloudflare.com/waiting-room/plans/), Business and Enterprise availability
- [Cloudflare: Create events](https://developers.cloudflare.com/waiting-room/additional-options/create-events/), event overrides, pre-queues and shuffle at event start
- [Queue-it: How Queue-it works](https://queue-it.com/developers/how-queue-it-works), redirect and signed token, server-side connectors and an unskippable queue
- [Queue-it: Pre-queue](https://queue-it.com/pre-queue/), countdown and randomization at the start
- [Queue-it: Bots and abuse management](https://queue-it.com/developers/bots-abuse-management/), enqueue tokens and invite-only waiting rooms
- [Shopify Help Center: Bot protection](https://help.shopify.com/en/manual/checkout-settings/bot-protection), Plus only, up to 500 products, 60-minute events and challenges

**Drops and the law**

- [Nike: Inside SNKRS fairness](https://www.nike.com/launch/t/inside-snkrs-fairness), the bot share of entries, one account on one device and Exclusive Access
- [Nike Help: SNKRS Pass](https://www.nike.com/help/a/nike-snkrs-pass), the request window, random winners and one per person per style
- [15 U.S.C. 45c, the BOTS Act](https://www.law.cornell.edu/uscode/text/15/45c), the circumvention prohibition and the definition of event
- [FTC: FTC takes action against ticket resellers (August 18, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-takes-action-against-ticket-resellers-using-illegal-tactics-bypass-ticket-limit-protections), the Key Investment Group complaint and its alleged methods and scale
- [FTC: FTC sues ticket broker over unlawful tactics (October 15, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-sues-ticket-broker-over-unlawful-tactics-used-buy-millions-tickets-popular-live-events), the REPS & Company complaint
- [GovInfo: S. 3516, Stopping Grinch Bots Act of 2025](https://www.govinfo.gov/content/pkg/BILLS-119s3516is/html/BILLS-119s3516is.htm), the proposed prohibition for internet retailers' purchasing limits

**Carriers and 3PLs**

- [USPS: Temporary price change for the 2025 holiday shipping season (August 8, 2025)](https://about.usps.com/newsroom/national-releases/2025/0808-usps-announces-temporary-price-change-for-2025-holiday-shipping-season.htm), dates, products and the increases by weight and zone
- [USPS: Recommended 2025 holiday mailing and shipping dates (September 17, 2025)](https://about.usps.com/newsroom/national-releases/2025/0917-usps-recommends-2025-holiday-mailing-and-shipping-dates.htm), the December send-by dates
- [FedEx: Demand surcharges](https://www.fedex.com/en-us/shipping/rate-changes/demand-surcharges.html), the 2026 residential, Ground Economy and handling surcharges and the Residential Delivery Demand Charge
- [ShipBob: Fall 2025 release](https://www.shipbob.com/release/fall-25/), no receiving cutoffs or blackout dates
