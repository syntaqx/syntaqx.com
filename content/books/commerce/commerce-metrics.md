+++
title = "Commerce Metrics"
description = "One definition per commerce metric over the book's tables: conversion, AOV, CAC, LTV, margin, returns, turns, GMROI, fill rate, churn and marketplace scores."
category = "Commerce Industry"
order = 2363
part = "Running the Platform"
tags = ["commerce", "metrics", "analytics", "unit-economics", "inventory", "data-model"]
+++

A store runs on a few dozen numbers, and nearly every one has two or three definitions in daily use. Conversion rate is orders over sessions in one tool, over visitors in another and over users in a third, and each excludes bots differently. Average order value includes shipping and tax in the platform's dashboard and excludes them in finance's. Return rate is by units or by dollars, by the month of the order or the month of the return. Sell-through means one thing to a merchandiser and another to a wholesale buyer. A founder reading a board deck, a marketer reading an ad platform, a buyer reading a retailer's scorecard and a marketplace reading a seller's account all see the same words and compute different things, and the arguments that follow are usually about the definition, not the business.

This chapter owns the volume's metric definitions: one definition per metric, the formula over the book's own tables, and where the common variants disagree. Earlier chapters store the inputs (checkouts, orders, lines and charges, returns, inventory movements, item costs, acquisition spend, subscriptions and renewals, fulfillments, shipments and promises, marketplace observations, retailer reports) and point here for the arithmetic. The general method (one definition per metric with its version, grain and business date; frozen periods; reconciliation to source) is the playbook's [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric) and [Metric Definitions as Code](/docs/telemetry/product-analytics#metric-definitions-as-code); funnels and cohorts are [Product Analytics](/docs/telemetry/product-analytics). Acceptance, fraud and dispute rates are the Payments volume's [Payments Metrics](/books/payments/payments-metrics). Credit, deposit and servicing metrics are the Banking & Lending volume's [Banking & Lending Metrics](/books/banking-and-lending/banking-metrics). The chapter adds `storefront_sessions`, `metric_definitions` and `metric_values`, the last two in the same shape as the other volumes' operating metrics chapters.

## Why the Same Metric Disagrees

Five choices change most numbers in this chapter, and each definition below states them:

- **The denominator.** Sessions, visitors (unique devices or people) or customers; all orders or only orders of a channel; units ordered or units shipped. A shopper who visits three times and buys once is a 33% conversion by session and 100% by visitor.
- **Gross or net.** Revenue before or after discounts, returns and cancellations; with or without shipping charged and tax collected. A $100 order with $8 shipping and $7 tax is $115 of gross sales, $108 of revenue to the merchant and $100 of merchandise.
- **The clock.** Order date, ship date (when revenue is usually recognized), delivery date or return date, in which time zone. A return in January for a December order lowers December's return rate when computed by order month and January's when computed by return month.
- **The scope.** The merchant's own site, all owned channels, marketplaces, wholesale, or all of them. A brand's "conversion rate" is a site metric; its "AOV" may blend in retailer POs a hundred times larger than any web order.
- **The exclusions.** Bots, staff and test orders, fraud-cancelled orders, replacements and zero-value orders, B2B accounts. Shopify's reports let a merchant "filter your data by human and bot traffic"; a homegrown pipeline has to decide.

My rule, as in the other volumes ([Operating Metrics](/books/property-tech/operating-metrics#why-the-same-metric-disagrees) in Property Tech, [Operating Metrics](/books/hosting-and-cloud/operating-metrics#how-to-build-it) in Hosting & Cloud): every metric is a versioned definition with its unit, population, exclusions, clock and formula; every report names the definition and version it used; a reported period is frozen, and late returns, settlements and deductions create restatements rather than silent changes.

## How the Platforms Report

As of October 2026, from the platforms' and companies' own definitions:

| Source | Metric | Definition as published |
| --- | --- | --- |
| **Shopify** | Conversion rate | "The percentage of sessions that resulted in a purchase" |
| **Shopify** | Reached checkout | "The total number of sessions where there was user input (for example, a key press or mouse click) during checkout" |
| **Shopify** | Sessions with cart additions | "The total number of sessions where a customer added a product to a cart" |
| **Chewy** | Active customers | Individual customers who ordered a product or service that shipped or was provided in the preceding 364 days; 21.3 million at fiscal 2025 year end |
| **Chewy** | Net sales per active customer | "the aggregate net sales for the preceding four fiscal quarters, divided by the total number of active customers"; $591 for fiscal 2025 |
| **Chewy** | Autoship customer sales | Sales and shipping revenue from Autoship purchases plus the same customers' other purchases, net of taxes, refunds and promotions; about $10.5 billion for fiscal 2025 |
| **Amazon** | Order Defect Rate | Orders with negative feedback, a non-denied A-to-z claim or a chargeback over all orders, 60 days ([Account Health](/books/commerce/selling-on-amazon#account-health)) |
| **Baymard Institute** | Cart abandonment rate | 70.22%, the average of 50 studies from 2006 to 2025 ([Abandonment and Recovery](/books/commerce/cart-and-checkout#abandonment-and-recovery)) |

Two lessons from the table. **Platforms define by session; public companies define by customer.** A store's dashboard optimizes visits; a 10-K reports people and money per person over a trailing year, because that's what investors value. **The channel's definition wins for the channel's threshold.** An Amazon ODR or a Walmart late-shipment rate is computed by the marketplace's rule, and a seller's own estimate is useful only if it uses the same window, date and exclusions ([Performance Standards Compared](/books/commerce/other-marketplaces#performance-standards-compared)).

## Traffic and Conversion

All of these are storefront metrics over sessions; the session itself is a definition (a visit ending after a period of inactivity, bots excluded by a stated rule), recorded in `storefront_sessions` below.

| Metric | Definition | Notes |
| --- | --- | --- |
| **Sessions** | Human sessions on the storefront in the period | Bot rule and inactivity timeout stated in the definition |
| **Add-to-cart rate** | Sessions with a cart addition ÷ sessions | |
| **Checkout reach rate** | Sessions that reached checkout ÷ sessions | Shopify counts a session as reached only with user input in checkout |
| **Conversion rate** | Sessions with at least one order ÷ sessions | The default; "orders ÷ sessions" overcounts sessions with two orders, and "orders ÷ visitors" is a different metric, named as such |
| **Checkout conversion** | Checkouts completed ÷ checkouts with contact captured | From `checkouts`; isolates checkout friction from browsing intent |
| **Cart abandonment rate** | 1 − (carts converted to an order ÷ carts with at least one line), carts aged past a stated window | Baymard's 70.22% is a cross-study average; compare your own over time, not with it |
| **Revenue per session** | Merchandise revenue ÷ sessions | Conversion rate × AOV; the one number that captures both |

Conversion is a site metric, and a channel mix changes it without any change on the site: a paid social campaign that doubles traffic at half the intent halves conversion and may still be profitable. Read conversion by traffic source, device and landing page, and judge campaigns on revenue per session and contribution, not on site conversion ([Acquisition and spend](#customers-and-acquisition), below). Search conversion and zero-result rate are [Measuring Search](/books/commerce/site-search-and-merchandising#measuring-search).

## Orders and Baskets

| Metric | Definition | Notes |
| --- | --- | --- |
| **Orders** | Orders placed in the period, excluding test, staff and fraud-cancelled | By `placed_at` in the merchant's reporting time zone |
| **Gross merchandise value (GMV)** | Sum of `order_lines.amount` for top-level lines, before discounts | A marketplace's GMV is the same over all sellers' orders ([Marketplace Volume and Liquidity](/books/user-generated-platforms/operating-metrics#marketplace-volume-and-liquidity)) |
| **Net merchandise revenue** | GMV − discounts allocated to lines − refunds of merchandise | Shipping charged and tax collected excluded |
| **Average order value (AOV)** | Net merchandise revenue ÷ orders | The default; "gross AOV" including shipping and tax is named as such. A mean, so report the median beside it when large orders skew it |
| **Units per order (UPT)** | Units on top-level lines ÷ orders | Bundles count as one unit sold; components are a fulfillment count |
| **Discount rate** | Discounts allocated to lines ÷ GMV | From `discount_allocations` ([Allocating Discounts to Lines](/books/commerce/promotions-and-gift-cards#allocating-discounts-to-lines)) |
| **Shipping recovery** | Shipping charged ÷ postage and fulfillment cost | Below 100% is a subsidy the contribution margin pays for |

AOV is computed per channel, never blended across retail and wholesale: a brand selling through its site and to Best Buy has two AOVs that differ by orders of magnitude, and a blended one moves with the wholesale calendar.

## Customers and Acquisition

The unit economics behind these (contribution margin, CAC, LTV, payback) are explained in [The Unit Economics](/books/commerce/business-models#the-unit-economics); the definitions here are the computable ones.

| Metric | Definition | Notes |
| --- | --- | --- |
| **New customers** | Customers whose first non-cancelled order falls in the period | After identity merge ([Identity and Merge](/books/commerce/customers-and-accounts#identity-and-merge)); guests resolved by email |
| **Active customers** | Customers with an order shipped in the trailing 364 or 365 days | Chewy's shape; state the window |
| **Repeat purchase rate** | Of a cohort's customers (first order in month M), the share with a second order within N days | Cohort-based, with N stated (90, 180, 365); the trailing "customers with 2+ orders ÷ customers" mixes cohorts |
| **Purchase frequency** | Orders ÷ active customers over the trailing year | |
| **Revenue per active customer** | Net revenue over the trailing four quarters ÷ active customers | Chewy's net sales per active customer |
| **CAC (blended)** | Acquisition spend in the period ÷ new customers in the period | From `acquisition_spend`; paid CAC divides attributed spend by attributed customers ([Attribution Models](/books/commerce/acquisition-and-attribution#attribution-models)) |
| **Contribution margin** | Net revenue − cost of goods − fulfillment, payment, marketplace and other variable costs, per order | `order_margin` in [How to Build It](/books/commerce/business-models#how-to-build-it); reported before and after acquisition spend |
| **LTV** | Cumulative contribution per customer of a cohort, by months since first order | Observed by cohort, never projected from an average; a projection is labeled as one |
| **Payback (months)** | Months until a cohort's cumulative contribution ≥ its CAC | |
| **LTV:CAC** | LTV at a stated horizon (12 or 24 months) ÷ CAC | Without a horizon the ratio means nothing |

## Returns and Margin

| Metric | Definition | Notes |
| --- | --- | --- |
| **Return rate (units)** | Units on received returns ÷ units shipped, by order month | Matures only after the return window closes; immature months are flagged |
| **Return rate (value)** | Refunded merchandise ÷ net merchandise revenue, by order month | Returnless refunds count; exchanges counted separately |
| **Exchange rate** | Returns resolved as exchanges ÷ returns | An exchange keeps revenue a refund loses ([Exchanges and Store Credit](/books/commerce/returns-and-exchanges#exchanges-and-store-credit)) |
| **Gross margin** | (Net revenue − cost of goods) ÷ net revenue | Cost of goods at the landed cost in force when sold ([Landed Cost](/books/commerce/purchasing-and-replenishment#landed-cost)) |
| **Contribution margin %** | Contribution ÷ net revenue | |

Return rate by return month is what operations staffs for; by order month is what unit economics and the ASC 606 return reserve need ([Return-Rate Economics](/books/commerce/returns-and-exchanges#return-rate-economics)). Both are legitimate and must be named.

## Inventory

| Metric | Definition | Notes |
| --- | --- | --- |
| **Sell-through rate** (own stock) | Units sold in the period ÷ (units on hand at the start + units received in the period) | The merchandising definition, by item or style; the wholesale definition is the retailer's units sold ÷ units it received ([Sell-Through and POS Data](/books/commerce/wholesale-and-retail-distribution#sell-through-and-pos-data)) |
| **Inventory turns** | Cost of goods sold over the trailing 12 months ÷ average inventory at cost over the same months | Average of month-end values; at cost, never at retail |
| **Days of supply** | On hand now ÷ average daily units sold over the trailing 28 days | Weeks of supply is the same in weeks; uses demand, not sales capped by stockouts, where known |
| **GMROI** | Gross margin dollars over 12 months ÷ average inventory at cost | Margin earned per dollar tied up in stock; a low-margin fast turner and a high-margin slow one can match |
| **In-stock rate** | Item-location-days with available stock ÷ item-location-days the item was meant to be sold | The out-of-stock days are lost demand the forecast must not learn from |
| **Aged inventory** | Units (and cost) on hand longer than N days since receipt | By receipt date from movements or cost layers |
| **Shrink rate** | Shrink adjustments at cost ÷ sales at cost | From `inventory_movements` with shrink and write-off reasons ([Cycle Counts and Shrink](/books/commerce/inventory#cycle-counts-and-shrink)) |

Turns and GMROI are computed on average inventory, not period-end inventory, because a store that receives its holiday stock on November 30 looks lean on October 31 and bloated on December 1.

## Fulfillment and Delivery

| Metric | Definition | Notes |
| --- | --- | --- |
| **Unit fill rate** | Units shipped ÷ units ordered, on orders due in the period | Cancelled-for-stock lines count as unfilled; customer cancellations are excluded |
| **Order fill rate (complete first time)** | Orders whose every line shipped in the first shipment set ÷ orders | Split shipments for stock location aren't failures if the promise was met; say which rule |
| **On-time ship rate** | Orders shipped by their promise's `ship_by` ÷ orders shipped | The Mail Order Rule deadline is the floor ([Shipping Promises: the Mail Order Rule](/books/commerce/online-consumer-protection#shipping-promises-the-mail-order-rule)) |
| **Delivered on promise** | Shipments delivered by `deliver_by` ÷ shipments with an arrival promise | From carrier `delivered_at`; carrier-caused misses kept, with their cause |
| **Click to ship / click to deliver** | Median hours from `placed_at` to first carrier scan / to delivery | Business-hour versions named as such |
| **OTIF** (wholesale) | POs arriving inside the retailer's window, in full ÷ POs, by the retailer's rule | Measured in cases by Walmart's program ([OTIF Programs](/books/commerce/wholesale-and-retail-distribution#otif-programs)) |
| **Fulfillment cost per order** | Pick, pack, packaging, postage and 3PL fees ÷ orders shipped | From carrier and 3PL invoices joined to fulfillments |

Support metrics (contacts per order by reason, self-service rate, reply times, cost of resolutions) are [SLAs and Metrics](/books/commerce/customer-service#slas-and-metrics) in Customer Service. A supplier's fill rate (units received over units ordered from it) is the same formula pointed the other way, in [Suppliers and What You Buy From Them](/books/commerce/purchasing-and-replenishment#suppliers-and-what-you-buy-from-them).

## Subscriptions

For subscription DTC, from `subscriptions`, `subscription_renewals` and `billing_attempts` ([Subscription Commerce](/books/commerce/subscription-commerce#how-to-build-it)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Active subscribers** | Customers with at least one subscription `active` or `paused` at period end | State whether paused counts; it shouldn't count toward MRR |
| **MRR** | Sum over active subscriptions of the next renewal's merchandise value, normalized to a month (× 30.4375 ÷ interval in days) | A run-rate, not revenue; skips and swaps make product subscriptions lumpier than software, so report realized renewal revenue beside it |
| **Churn rate** | Subscribers ended in the period ÷ subscribers active at its start, voluntary and involuntary separately, by cohort | Defined in [Churn Economics](/books/commerce/subscription-commerce#churn-economics) |
| **Skip rate** | Renewals skipped ÷ renewals due | |
| **Renewal recovery rate** | Failed renewals later paid ÷ failed renewals | By decline category |
| **Orders per subscriber** | Renewal orders a cohort produced ÷ subscribers in it | LTV uses this, not months subscribed |

ARR, net dollar retention and logo churn as software companies define them are Hosting & Cloud's [Recurring Revenue: ARR and Run Rate](/books/hosting-and-cloud/operating-metrics#recurring-revenue-arr-and-run-rate) and [Net Dollar Retention and Its Variants](/books/hosting-and-cloud/operating-metrics#net-dollar-retention-and-its-variants); for a replenishment subscription, cohort orders and contribution say more than MRR does.

## Marketplaces and Wholesale

A seller's marketplace metrics are two sets: the channel's, computed by the channel and stored as reported (`account_health_events`), and the seller's estimate of each, computed from its own orders by the channel's rule (`performance_standards`), with an alert when they diverge ([Account Health](/books/commerce/selling-on-amazon#account-health)).

| Metric | Definition | Notes |
| --- | --- | --- |
| **ODR, late shipment, cancel and valid tracking rates** | As each marketplace defines them, per `performance_standards` | Window, date basis and exclusions are the marketplace's |
| **Featured Offer share** (time) | Hours the seller held the Featured Offer on a listing ÷ hours the listing was active, from `offer_observations` | The seller's own measure |
| **Featured Offer percentage** (Amazon's) | Page views on which the seller's offer was featured ÷ page views of its listings, as Amazon's business reports compute it | Weighted by traffic, so it differs from the time share; described in third-party guides rather than Amazon's public pages |
| **Net proceeds rate** | Marketplace settlement deposits for the period's orders ÷ their GMV | From `settlement_lines`; the real take after referral, fulfillment, ads and refunds ([Settlements and the money](/books/commerce/selling-on-amazon#settlements-and-the-money)) |
| **Advertising cost of sales (ACoS)** | Ad spend ÷ ad-attributed sales, as the network reports | The network's claim; TACoS divides by all sales ([Retail Media & Marketplace Ads](/books/commerce/retail-media)) |
| **Deduction rate** (wholesale) | Deductions taken ÷ invoiced amount, by partner and reason | Valid and invalid separated after dispute ([Deductions and Disputes](/books/commerce/wholesale-and-retail-distribution#deductions-and-disputes)) |
| **Retail sell-through and weeks of supply** (wholesale) | From the partner's sales and stock reports | The retailer's data, loaded by week |

<!-- source-gap: amazon-featured-offer-percentage | secondary | Amazon's definition of Featured Offer percentage in Business Reports (page-view weighted) | closes with: an Amazon Seller Central help page readable without a login | checked: 2026-10-28 -->

A merchant running its own marketplace adds take rate, liquidity and seller concentration, whose definitions are User-Generated Platforms' [Marketplace Volume and Liquidity](/books/user-generated-platforms/operating-metrics#marketplace-volume-and-liquidity).

## Definitions as Code, Restatements as Rows

The playbook's rules apply, with three commerce additions:

- **Late facts are normal.** Returns arrive for weeks, marketplace fees with the settlement, retailer deductions months later, landed costs with the freight invoice. Every money metric for a period is provisional until its inputs mature, and the definition states when a period is considered final (for example, 60 days after the end of the return window).
- **Channel definitions are imported, not invented.** A marketplace's or retailer's metric is stored with the partner's own definition text and version, beside the partner-reported value ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).
- **Money numbers reconcile to the books.** Net revenue, cost of goods and margin from the pipeline are checked each month against the general ledger's totals after close; a gap is either a definition difference (written down) or a bug ([Period Close](/books/commerce/commerce-accounting#period-close)).

## How to Build It

The chapter adds a session fact for storefront metrics and the definition and value tables the other volumes use; every formula above is a query over tables earlier chapters own.

```sql
CREATE TABLE storefront_sessions (       -- one row per visit, as the session rule defines it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  storefront_id    UUID NOT NULL REFERENCES storefronts (id),
  visitor_ref      TEXT NOT NULL,        -- a first-party, deduplicated visitor identifier
  customer_id      UUID REFERENCES customers (id),  -- once known
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ NOT NULL,
  business_date    DATE NOT NULL,        -- in the merchant's reporting time zone, assigned once
  source           TEXT,                 -- 'paid_social', 'search', 'email', 'direct', 'agent'
  device           TEXT,
  landing_path     TEXT,
  is_bot           BOOLEAN NOT NULL DEFAULT FALSE,  -- by the bot rule in force
  added_to_cart    BOOLEAN NOT NULL DEFAULT FALSE,
  reached_checkout BOOLEAN NOT NULL DEFAULT FALSE,
  converted        BOOLEAN NOT NULL DEFAULT FALSE,  -- at least one order in the session
  definition_version INT NOT NULL
);

CREATE TABLE metric_definitions (        -- one definition per metric, versioned
  key            TEXT NOT NULL,          -- 'conversion_rate', 'aov_net', 'return_rate_units'
  version        INT NOT NULL,
  unit           TEXT NOT NULL CHECK (unit IN ('ratio', 'amount', 'count', 'days', 'months')),
  population     TEXT NOT NULL,          -- 'human_sessions', 'orders_first_party', 'cohort'
  scope          TEXT NOT NULL,          -- 'own_site', 'all_owned', 'marketplace:amazon_us'
  revenue_basis  TEXT,                   -- 'net_merchandise', 'gross_incl_shipping_tax'
  exclusions     TEXT NOT NULL,          -- bots, staff, test, fraud-cancelled, B2B: as written
  clock          TEXT NOT NULL,          -- 'placed_at', 'shipped_at', 'order_month', 'return_month'
  maturity_days  INT,                    -- when a period's value is final
  formula_ref    TEXT NOT NULL,          -- the SQL or model in version control
  source_definition TEXT,                -- a partner's own wording, for imported metrics
  history_policy TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  owner          TEXT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (             -- computed, frozen when reported
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key     TEXT NOT NULL,
  metric_version INT NOT NULL,
  period         DATERANGE NOT NULL,
  scope          JSONB NOT NULL DEFAULT '{}',  -- {"channel": "first_party"}, {"item_id": "..."}
  value          NUMERIC NOT NULL,
  numerator      NUMERIC,
  denominator    NUMERIC,
  currency       CHAR(3),
  source         TEXT NOT NULL DEFAULT 'computed' CHECK (source IN ('computed',
                   'partner_reported')),  -- a marketplace's or retailer's own figure
  computed_at    TIMESTAMPTZ NOT NULL,
  frozen_at      TIMESTAMPTZ,            -- reported to the board, a lender or a partner
  supersedes_id  UUID REFERENCES metric_values (id),  -- a restatement is a new row
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

Conversion and AOV for a day, by session and on net merchandise, first-party orders only:

```sql
WITH s AS (
  SELECT business_date,
         COUNT(*)                                   AS sessions,
         COUNT(*) FILTER (WHERE converted)          AS converted_sessions
  FROM storefront_sessions
  WHERE NOT is_bot AND business_date = :day
  GROUP BY business_date
), o AS (
  SELECT COUNT(DISTINCT o.id)                                       AS orders,
         SUM(l.amount) - COALESCE(SUM(d.discount), 0)               AS net_merchandise,
         SUM(l.quantity)                                            AS units
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id AND l.parent_line_id IS NULL
  LEFT JOIN LATERAL (
    SELECT SUM(a.amount) AS discount
    FROM discount_allocations a WHERE a.order_line_id = l.id) d ON TRUE
  WHERE o.channel = 'first_party' AND o.status <> 'cancelled'
    AND (o.placed_at AT TIME ZONE :tz)::date = :day
)
SELECT s.sessions,
       s.converted_sessions::numeric / NULLIF(s.sessions, 0)  AS conversion_rate,
       o.net_merchandise::numeric / NULLIF(o.orders, 0)       AS aov_net,
       o.units::numeric / NULLIF(o.orders, 0)                 AS units_per_order
FROM s, o;
```

Repeat purchase rate within 180 days, by first-order cohort:

```sql
WITH firsts AS (
  SELECT customer_id, MIN(placed_at) AS first_at
  FROM orders
  WHERE customer_id IS NOT NULL AND status <> 'cancelled'
  GROUP BY customer_id
)
SELECT date_trunc('month', f.first_at)                    AS cohort,
       COUNT(*)                                            AS customers,
       COUNT(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM orders o
         WHERE o.customer_id = f.customer_id AND o.status <> 'cancelled'
           AND o.placed_at > f.first_at
           AND o.placed_at <= f.first_at + INTERVAL '180 days'))::numeric
         / COUNT(*)                                        AS repeat_rate_180d
FROM firsts f
WHERE f.first_at < NOW() - INTERVAL '180 days'          -- only mature cohorts
GROUP BY 1
ORDER BY 1;
```

Inventory turns and GMROI over twelve months, from month-end on-hand rebuilt from movements and valued at the landed cost in force on each date:

```sql
WITH months AS (
  SELECT generate_series(date_trunc('month', :as_of::date) - INTERVAL '11 months',
                         date_trunc('month', :as_of::date), INTERVAL '1 month')
         + INTERVAL '1 month' - INTERVAL '1 second' AS month_end
), on_hand AS (                          -- units on hand per item at each month end
  SELECT m.month_end, mv.item_id, SUM(mv.quantity) AS units
  FROM months m
  JOIN inventory_movements mv ON mv.bucket = 'on_hand' AND mv.occurred_at <= m.month_end
  GROUP BY m.month_end, mv.item_id
), valued AS (
  SELECT h.month_end,
         SUM(h.units * (SELECT SUM(c.amount) FROM item_costs c
                        WHERE c.item_id = h.item_id
                          AND c.valid_during @> h.month_end)) AS inventory_at_cost
  FROM on_hand h
  GROUP BY h.month_end
), sales AS (
  SELECT SUM(net_revenue) AS net_revenue, SUM(cogs) AS cogs
  FROM order_margin
  WHERE placed_at > :as_of::date - INTERVAL '12 months' AND placed_at <= :as_of::date
)
SELECT s.cogs / NULLIF(AVG(v.inventory_at_cost), 0)                  AS inventory_turns,
       (s.net_revenue - s.cogs) / NULLIF(AVG(v.inventory_at_cost), 0) AS gmroi
FROM sales s, valued v
GROUP BY s.net_revenue, s.cogs;
```

On-time ship rate and unit fill rate for orders due in a week:

```sql
SELECT COUNT(*) FILTER (WHERE first_ship.shipped_at::date <= p.ship_by)::numeric
         / NULLIF(COUNT(first_ship.shipped_at), 0)                       AS on_time_ship_rate,
       SUM(shipped.units)::numeric / NULLIF(SUM(ordered.units), 0)        AS unit_fill_rate
FROM shipping_promises p
JOIN orders o ON o.id = p.order_id AND p.order_line_id IS NULL
LEFT JOIN LATERAL (
  SELECT MIN(sh.shipped_at) AS shipped_at
  FROM fulfillments f JOIN shipments sh ON sh.fulfillment_id = f.id
  WHERE f.order_id = o.id) first_ship ON TRUE
LEFT JOIN LATERAL (
  SELECT SUM(fl.quantity) AS units
  FROM fulfillments f JOIN fulfillment_lines fl ON fl.fulfillment_id = f.id
  WHERE f.order_id = o.id AND f.status IN ('shipped', 'delivered')) shipped ON TRUE
JOIN LATERAL (
  SELECT SUM(l.quantity) AS units
  FROM order_lines l
  WHERE l.order_id = o.id AND l.parent_line_id IS NULL
    AND l.status <> 'cancelled') ordered ON TRUE
WHERE p.ship_by <@ :week::daterange;
```

Return rate by units, by order month, flagged until the return window has closed:

```sql
WITH sold AS (                           -- units per order
  SELECT o.id AS order_id, o.placed_at, o.return_policy_id, SUM(l.quantity) AS units
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id AND l.parent_line_id IS NULL
  WHERE o.channel = 'first_party' AND o.status <> 'cancelled'
  GROUP BY o.id
), returned AS (                         -- units received back per order
  SELECT r.order_id, SUM(rl.quantity) AS units
  FROM returns r
  JOIN return_lines rl ON rl.return_id = r.id
  WHERE r.status IN ('received', 'closed')
  GROUP BY r.order_id
)
SELECT date_trunc('month', s.placed_at)                               AS order_month,
       SUM(COALESCE(x.units, 0))::numeric / NULLIF(SUM(s.units), 0)   AS return_rate_units,
       BOOL_OR(s.placed_at + INTERVAL '1 day' * COALESCE(rp.window_days, 0) > NOW())
                                                                       AS immature
FROM sold s
LEFT JOIN returned x ON x.order_id = s.order_id
LEFT JOIN return_policies rp ON rp.id = s.return_policy_id
GROUP BY 1
ORDER BY 1;
```

Design notes:

- **Sessions are a fact with a rule.** The inactivity timeout, the bot rule and the visitor identifier are part of `storefront_sessions`' definition version; changing any of them is a new version, and past conversion rates stay reproducible. A store on a hosted platform can load the platform's sessions instead and record that the definition is the platform's.
- **Reporting dates are assigned once.** `business_date` on sessions and the reporting time zone on orders are fixed in one place, so a 11:30 p.m. Pacific order on Black Friday is a Black Friday order in every report ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).
- **Margin comes from one view.** Contribution, gross margin, GMROI, LTV and payback all read `order_margin` from [Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it), so a cost correction reaches every one of them; nothing recomputes cost of goods its own way.
- **Partner figures sit beside ours.** A marketplace ODR or a retailer's OTIF is a `metric_values` row with `source = 'partner_reported'` and the partner's definition text in `metric_definitions.source_definition`, next to the computed estimate under the same key.
- **Maturity is in the definition.** Return rate and contribution by order month carry `maturity_days`; a dashboard shows immature periods as provisional and a frozen report waits for them or says it didn't.
- **Keep it off production.** These queries run on a replica or the warehouse, from the same tables by change data capture ([Keep Analytics Off Production](/docs/architecture/data-pipelines#keep-analytics-off-production)).

## Auditing

- **Every reported number** with its definition version, period, scope, inputs' as-of time and the query that produced it, whether it went to a board, a lender, an investor or a partner.
- **Definition changes,** with the reason, the approver and the effect on prior periods, shown beside the first report that uses the new version.
- **Restatements,** each linked to what it supersedes, with the late fact that caused it (a settlement, a deduction, a return batch, a cost correction).
- **Partner metrics as reported,** with the document or notice they arrived in, and the merchant's own estimate for the same period.
- **Compensation and bonus metrics,** frozen per period with the definition version, where pay depends on conversion, margin or fill rate.

## What This Means for the System You Build

- **Define each metric once,** with its denominator, revenue basis, clock, scope and exclusions, versioned, and name the definition on every report.
- **Measure conversion over human sessions** with a stated session and bot rule, and judge traffic on revenue per session and contribution.
- **Compute AOV per channel** on net merchandise, with the median beside the mean.
- **Measure customers by cohort:** repeat rate within a stated window, LTV by months since first order, payback against CAC.
- **Report returns both ways,** by order month for economics and by return month for operations, with immature months flagged.
- **Value inventory at cost on monthly averages** for turns and GMROI, and keep stockout days out of demand.
- **Measure fulfillment against stored promises,** and wholesale and marketplace performance by the partner's rule, beside the partner's own figure.
- **Treat MRR as a run-rate** for product subscriptions and lead with cohort orders and contribution.
- **Freeze reported values and restate with new rows** as returns, settlements, deductions and costs arrive.

## References

**Platforms**

- [Shopify Help Center: Behavior reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/behaviour-reports), conversion rate, reached checkout, sessions with cart additions and human and bot filtering
- [Baymard Institute: Cart abandonment rate statistics](https://baymard.com/lists/cart-abandonment-rate), the 70.22% average across 50 studies

**Filings**

- [Chewy: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/1766502/000176650226000034/chwy-20260201.htm), active customers, net sales per active customer and Autoship customer sales, with fiscal 2025 values
