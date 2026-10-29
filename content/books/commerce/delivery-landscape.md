+++
title = "The On-Demand Delivery Landscape"
nav_title = "The Delivery Landscape"
description = "Marketplaces, logistics-only networks, first-party ordering, owned inventory and shop-and-deliver, with take rates, market share and consolidation."
category = "Commerce Industry"
order = 2342
part = "On-Demand Delivery"
tags = ["commerce", "delivery", "marketplaces", "business-models", "unit-economics"]
+++

On-demand delivery is a three-sided market run on a thirty-minute clock: merchants who make or stock the goods, customers who want them now, and couriers or shoppers who carry them, matched by a platform that takes a cut from each side. The industry looks like one business from the outside (an app, a menu, a courier at the door) and is several underneath. A marketplace lists thousands of restaurants and sends its own couriers; a logistics network carries orders a restaurant took on its own website; an ordering vendor sends a restaurant's orders to whichever network quotes best; a convenience company owns its stock and its warehouses; a grocery marketplace sends a shopper into someone else's store to pick the order before delivering it.

Each model moves different money through different parties, and the software has to know which one an order is in before it can price, dispatch, settle or refund it. This chapter surveys the platforms, the business models, the unit economics as the filings disclose them, market share from the datasets that measure it, membership scale, and the consolidation that reshaped the industry in 2025. It extends `merchants`, `locations` and `orders` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from the latest annual filings and official releases:

| Platform | Model | Scale (latest full year) | How it reports its cut | Membership |
| --- | --- | --- | --- | --- |
| **DoorDash** | Marketplace with its own couriers, self-delivery and pickup; Drive white-label delivery; Wolt and Deliveroo outside the US | 3.2 billion Total Orders and $102.0 billion Marketplace GOV in 2025; over 40 countries | Net Revenue Margin, revenue as a percentage of Marketplace GOV: 13.4% in 2025 | DashPass, Wolt+ and Deliveroo Plus: over 35 million members combined |
| **Uber Eats** | Marketplace inside Uber's Delivery segment; Uber Direct white-label delivery | Delivery Gross Bookings of $20.4 billion to $25.4 billion a quarter in 2025; $17.2 billion Delivery revenue | Revenue Margin company-wide; no Delivery take rate stated | Uber One, shared with rides: 46 million members |
| **Instacart (Maplebear)** | Shop-and-deliver marketplace; Enterprise platform and storefronts for grocers; in-store technology | $37.2 billion GTV and 338.8 million orders in 2025; over 2,200 retail banners | Transaction revenue ($2.68 billion) and advertising and other revenue ($1.07 billion), reported separately | Instacart+; no member count disclosed |
| **Grubhub** | Marketplace; owned by Wonder since January 2025 | Not reported publicly since the sale | Not reported | Grubhub+, also offered free to Amazon Prime members |
| **Shipt** | Shop-and-deliver from 120+ grocery and retail stores | Not reported publicly | Not reported | Membership; no markups for Target Circle 360 members on Target orders through December 2026 |
| **Gopuff** | Owned inventory in its own micro-fulfillment centers | Not reported publicly | Not reported | Membership |
| **Deliveroo** | Marketplace, UK and Europe; part of DoorDash since October 2025 | GBP 7.43 billion GTV and 296.0 million orders in 2024 | Revenue reported against GTV | Deliveroo Plus, counted in DoorDash's total |
| **Just Eat Takeaway.com** | Marketplace, Europe; part of Prosus since October 2025 | EUR 26.3 billion GTV in 2024 including Grubhub, EUR 18.9 billion without it; 17 markets | Not reported since delisting | Varies by market |

Three patterns run through the table:

- **Every platform measures a different denominator.** DoorDash divides revenue by Marketplace GOV; Uber reports Delivery Gross Bookings and revenue but no Delivery take rate; Instacart's GTV includes taxes, deposits, tips, customer fees and even Instacart+ membership fees. Ratios across the three are only comparable after reading each definition ([Take Rates and Unit Economics](#take-rates-and-unit-economics)).
- **Memberships are counted across products and countries.** DoorDash's 35 million combines three programs in many countries; Uber's 46 million covers rides and delivery. Neither is a count of US delivery subscribers.
- **The private half of the industry is dark.** Grubhub, Shipt and Gopuff publish no audited figures; what is known comes from former parents, press releases and enforcement actions.

## Business Models

Each model answers three questions differently: who takes the order, who owns the customer, and who carries it.

**Marketplace with platform couriers.** The customer orders in the platform's app from a merchant listed there; the platform's couriers deliver. The platform charges the customer fees and the merchant a commission, pays the courier, and owns the customer relationship. This is the core of DoorDash, Uber Eats, Grubhub, Deliveroo, Just Eat Takeaway and Wolt. Merchant plans set the commission and buy reach: DoorDash's US plans charge 15%, 25% or 30% on delivery orders, and the higher tiers widen the delivery radius, lower customer delivery fees and add access to DashPass members ([Merchant Commission Tiers](/books/commerce/delivery-fees-and-the-law#merchant-commission-tiers)).

**Marketplace with self-delivery.** The same listing, but the merchant's own drivers deliver and the commission is lower: Uber Eats lists a 15% self-delivery fee in the US against 20% to 30% for its delivery plans. The platform still owns the customer and the payment; the merchant owns the delivery promise.

**Logistics only.** The merchant takes the order on its own website, app or phone line, and pays a network to deliver it. DoorDash's 10-K describes Drive as "white-label delivery fulfillment services"; its merchant help center says Drive On-Demand lets a merchant "offer customers delivery through your own app, website, or other ordering channel" for "a flat fee per order." Uber's 10-K calls Uber Direct its "white-label Delivery-as-a-Service offering," and Uber's US merchant pricing lists it from $7.99 per delivery. The merchant owns the customer and the price; the network owns only the trip. The Field Operations volume treats these networks as external assignees on a merchant's own route ([Last-Mile Delivery](/books/field-operations/last-mile-delivery#failed-attempts-redelivery-and-returns)).

**First-party ordering through a vendor.** Restaurant brands run their own ordering through a platform such as Olo, which connects both ways. Olo Dispatch delivers orders from the brand's own site and app by "automatically pairing third-party couriers with delivery orders" from a "network of 27+ delivery service providers," with restaurant-side controls on fee limits and maximum transit times; Olo Rails syncs "menus, pricing, location data, and item availability" out to marketplaces and brings their orders back into one place, ending the era of "juggling multiple tablets and manually entering marketplace orders into the POS." The vendor is a router: it picks the network per order and owns neither the customer nor the courier.

**Owned inventory.** Gopuff describes a model "in which it owns the inventory and operates its own micro-fulfillment centers," delivering "in as fast as 15 minutes." Owning the stock means the seller is the merchant, the catalog is its own warehouse system, and substitutions largely disappear because only what is on its own shelf is listed; it also means the seller carries inventory risk, spoilage and the leases that a marketplace leaves to merchants.

**Shop and deliver.** Instacart and Shipt send a shopper into a retailer's store to pick the order, then deliver it. Instacart enables "more than 2,200 retail banners" and powers "more than 380 grocers' e-commerce sites" with its storefront technology, so the same shopper network fulfills orders taken in Instacart's app and on the retailer's own site. The retailer sets the prices and owns the stock; the platform owns the picking, the substitutions and, in its own app, the customer. [Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#shop-and-deliver) covers the extra step.

**Where the model shows up in the data.** A single location can sell through all of these at once: its own site with Drive or Direct carrying the order, two marketplaces with platform couriers, one marketplace with its own drivers at lunch. That is why [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) puts `channel` and `channel_partner` on the order and the provider on the fulfillment, never on the merchant.

## Take Rates and Unit Economics

The filings give the totals; the ratios have to be built with care:

| Measure | DoorDash 2025 | Uber Delivery 2025 | Instacart 2025 |
| --- | --- | --- | --- |
| Volume | Marketplace GOV $102,018 million | Delivery Gross Bookings about $90,864 million (sum of four reported quarters) | GTV $37,224 million |
| Orders | 3,172 million Total Orders | Not reported separately (Trips combine rides and delivery orders) | 338.8 million |
| Revenue | $13,717 million | $17,248 million Delivery revenue | $2,677 million transaction revenue, $1,065 million advertising and other |
| Ratio | 13.4% Net Revenue Margin, as reported | About 19.0% Delivery revenue over Delivery Gross Bookings (derived; 18.4% in 2024) | About 7.2% transaction revenue over GTV (derived) |
| Average order | Not stated | Not derivable | About $110 GTV per order (derived) |

The derived figures are my arithmetic on reported totals, and they mislead if read as like for like:

- **Revenue recognition differs.** A platform that acts as an agent books only its fees as revenue; one that acts as the principal books more of the order. Uber's Delivery revenue also includes advertising (the 10-K attributes $568 million of 2025's increase to it), so 19% is not Uber's fee on a typical order.
- **Denominators differ.** Instacart's GTV includes tips, taxes and membership fees; DoorDash's Marketplace GOV is Marketplace order value as DoorDash defines it in the 10-K. A tip inflates Instacart's denominator and goes entirely to the shopper.
- **Advertising is the margin.** Instacart's advertising and other revenue was $1,065 million on top of $2,677 million of transaction revenue; on Uber, advertising drove a large part of 2025's Delivery revenue growth. Sponsored listings and retail media are the highest-margin money in the industry and the reason catalogs and search rankings are worth so much ([Retail Media & Marketplace Ads](/books/commerce/retail-media)).
- **Courier pay is the largest cost.** DoorDash says over 9 million people dashed in 2025, earning over $20 billion. How that pay is set, and the minimum pay laws that bind it, are in the User-Generated Platforms volume's [gig work chapter](/books/user-generated-platforms/gig-work-and-worker-law).

For the system, unit economics are a query, not a spreadsheet. Every order's charges carry a payer and a payee ([How the Money Splits](/books/commerce/commerce-business#how-the-money-splits)), so contribution per order (customer fees plus commission plus ad revenue attributed to the order, minus courier pay, refunds, credits, payment costs and support) is a sum over rows, sliceable by city, merchant plan, channel and membership.

## Market Share

Share is measured from consumer card panels, not from company reports, and only a few datasets publish it:

- **Bloomberg Second Measure, March 2024:** DoorDash and its subsidiary Caviar earned 67% of observed US consumers' meal delivery sales, Uber Eats 23% (plus 2% for Postmates) and Grubhub 8%. The panel is debit and credit card purchases from millions of US consumers; it measures observed spend, can't separate meal from grocery delivery, and excludes Uber Cash, corporate purchases and some campus meal plans.
- **Earnest Analytics, end of 2024:** DoorDash led US food delivery with a 60.7% share against Uber Eats at 26.1% and Grubhub at 6.3%, on its consumer spend data for delivery aggregators. City shares differ sharply: in New York City DoorDash had 38.4% and Uber Eats 38.2%, with Grubhub at 17.6%.

The national figure hides the market the software has to serve: cities where two platforms split the market evenly, and rules (fee caps, disclosure laws) that differ city by city ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law)). I found no public share dataset for 2025 or 2026; the figures above are the latest a primary dataset publishes. <!-- source-gap: delivery-share-2025 | missing | US meal delivery market share for 2025 or 2026 | closes with: a dated Second Measure, Earnest or similar card-panel publication with methodology; Second Measure's datapoint is still March 2024 and Statista's mid-2025 figure is paywalled | checked: 2026-10-28 -->

## Consolidation

2025 rearranged ownership on both sides of the Atlantic:

- **Grubhub to Wonder.** Just Eat Takeaway.com completed the sale of Grubhub on January 7, 2025 at an enterprise value of $650 million, with Grubhub's $500 million of senior notes transferred with it and net proceeds to the seller of up to $50 million; Wonder "acquired all of the assets and assumed all of the material liabilities." The 2024 figures Prosus published (EUR 26.3 billion GTV with Grubhub, EUR 18.9 billion without) put Grubhub's 2024 GTV at about EUR 7.4 billion.
- **Just Eat Takeaway.com to Prosus.** Prosus offered EUR 20.30 a share in cash, valuing the company at EUR 4.1 billion, in February 2025; it declared the offer unconditional on October 2, 2025 with 90.13% of shares tendered or committed, ended at 98.19%, and the shares stopped trading on November 17, 2025.
- **Deliveroo to DoorDash.** DoorDash completed the acquisition on October 2, 2025 at 180 pence a share in cash, about $3.7 billion in aggregate. Deliveroo had reported GBP 7.43 billion of GTV and 296.0 million orders for 2024. With Wolt already inside DoorDash, its membership count now spans DashPass, Wolt+ and Deliveroo Plus.

Consolidation is a software problem before it's a financial one. An acquired marketplace brings its own merchants, menus, couriers, memberships and fee contracts; merging them means mapping merchant and location IDs across systems, keeping old contract terms in force for orders taken under them, and running two apps on one dispatch network or two networks behind one app. [Switching Processors](/books/payments/switching-processors) covers the payments side of the same migration.

## Outside the US

The UK and EU platforms run the same marketplace model under different rules, and the differences show up in the software:

- **Couriers' status is set in law differently.** European law and national courier rulings change who the courier is legally, which changes pay, insurance and data rights; the User-Generated Platforms volume's [gig work chapter](/books/user-generated-platforms/gig-work-and-worker-law) covers it.
- **Groups run many brands.** Just Eat Takeaway.com ran different brands in its 17 markets; DoorDash now runs DoorDash, Wolt and Deliveroo. Brand, currency, language and legal entity are attributes of the market, which belongs on the location and the channel, not hard-coded per app.

## How to Build It

A location sells through several channels, each with its own external store ID, plan and status:

```sql
CREATE TABLE sales_channels (            -- every place an order can come from
  id          TEXT PRIMARY KEY,          -- 'own_web', 'own_app', 'pos', 'doordash', 'ubereats', ...
  kind        TEXT NOT NULL CHECK (kind IN ('marketplace', 'first_party', 'pos', 'phone',
                'kiosk')),
  delivers    TEXT NOT NULL CHECK (delivers IN ('platform', 'merchant', 'either', 'none')),
  name        TEXT NOT NULL
);

CREATE TABLE merchant_channel_enrollments (  -- a location listed on a channel
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id        UUID NOT NULL REFERENCES locations (id),
  channel_id         TEXT NOT NULL REFERENCES sales_channels (id),
  external_store_ref TEXT,               -- the channel's store ID
  delivery_mode      TEXT NOT NULL CHECK (delivery_mode IN ('platform', 'self', 'pickup_only')),
  commission_plan_id UUID,               -- commission_plans, in Fees, Commissions & the Law
  status             TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused',
                       'removed')),
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (location_id WITH =, channel_id WITH =, valid_during WITH &&)
);

CREATE TABLE delivery_providers (        -- networks that carry orders taken elsewhere
  id          TEXT PRIMARY KEY,          -- 'doordash_drive', 'uber_direct', ...
  name        TEXT NOT NULL,
  pricing     TEXT NOT NULL CHECK (pricing IN ('flat', 'quoted', 'contract'))
);

-- Contribution per order is a sum over charge lines, never a stored column.
CREATE VIEW order_contribution AS
SELECT o.id AS order_id,
       o.location_id,
       o.channel,
       SUM(c.amount) FILTER (WHERE c.payee = 'platform') AS platform_take,
       SUM(c.amount) FILTER (WHERE c.payee = 'courier')  AS to_courier,
       SUM(c.amount) FILTER (WHERE c.payee = 'merchant') AS to_merchant
FROM orders o
JOIN order_charges c ON c.order_id = o.id
GROUP BY o.id, o.location_id, o.channel;
```

Design notes:

- **Enrollment is time-ranged.** A location joins a marketplace, changes plan, pauses during a renovation and leaves; the exclusion constraint keeps one enrollment in force per channel at a time, and an order points at the location and channel so the enrollment in force at `placed_at` decides its plan.
- **Delivery mode belongs to the enrollment and is copied to the fulfillment.** A store can be self-delivery on one marketplace and platform delivery on another; the fulfillment records who actually carried each order.
- **Providers are data.** A first-party order quoted by three networks records which one won and why (price, ETA, a fee limit) on the fulfillment, which is what a later "why did this cost $9" question needs.
- **Acquired platforms are channels too.** Mapping an acquired marketplace's store IDs onto existing locations is an enrollment per location with the old `external_store_ref`, not a second merchant table.

## Auditing

- **Which channel and plan applied.** For every order, the enrollment, delivery mode and commission plan in force when it was placed, since the merchant's statement and any cap complaint are computed from them.
- **Which network carried it and at what price.** The provider, its quote and its delivery ID for every first-party or logistics-only order.
- **Reported figures as queries.** GOV, take rate and orders as published to investors or a board are queries over orders and charges with written definitions, rerun on restatement ([Operating Metrics](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows) shows the pattern).

## What This Means for the System You Build

- **Model every channel a location sells through** as a time-ranged enrollment with its external ID, delivery mode and plan.
- **Keep the delivering provider on the fulfillment,** separate from the channel that took the order.
- **Compute take rate and contribution from charge lines,** with each metric's denominator written down, because the industry's own denominators differ.
- **Expect the same location to be in several business models at once:** marketplace, self-delivery, first-party with a logistics network, pickup.
- **Plan for acquisitions:** external IDs per channel, contract terms per enrollment, and brand, currency and language per market.

## References

**Filings**

- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), Total Orders, Marketplace GOV, revenue, Net Revenue Margin and its definition, over 35 million DashPass, Wolt+ and Deliveroo Plus members, over 40 countries, over 9 million Dashers earning over $20 billion, Drive as white-label delivery fulfillment
- [DoorDash: Form 8-K on completing the Deliveroo acquisition](https://www.sec.gov/Archives/edgar/data/1792789/000114036125037039/ef20056500_8k.htm), completion on October 2, 2025, 180 pence a share, about $3.7 billion aggregate
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), quarterly Delivery Gross Bookings, Delivery revenue and the advertising increase, Revenue Margin, Trips, 46 million Uber One members, Uber Direct
- [Maplebear (Instacart): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000018/cart-20251231.htm), GTV and its definition, orders, transaction and advertising revenue, 2,200 retail banners, 380 grocers' storefronts, Instacart+
- [Deliveroo: 2024 preliminary results (FCA National Storage Mechanism)](https://data.fca.org.uk/artefacts/NSM/RNS/5572277.html), 2024 GTV, orders and revenue

**Company releases**

- [Just Eat Takeaway.com: Completes sale of Grubhub](https://newsroom.justeattakeaway.com/en-WW/245724-just-eat-takeaway-com-completes-sale-of-grubhub/), January 7, 2025, enterprise value, notes transferred, net proceeds, Wonder's assumption of assets and liabilities
- [Prosus: To acquire Just Eat Takeaway.com](https://www.prosus.com/news-insights/2025/prosus-to-acquire-just-eat-takeaway), the offer price and valuation, 2024 GTV with and without Grubhub, 17 markets
- [Just Eat Takeaway.com: Prosus declares offer unconditional](https://newsroom.justeattakeaway.com/en-WW/254974-prosus-declares-offer-for-just-eat-takeaway-com-unconditional/), October 2, 2025, 90.13% tendered or committed
- [Just Eat Takeaway.com: Final results of the Prosus offer](https://newsroom.justeattakeaway.com/en-WW/255533-final-results-of-prosus-offer-for-just-eat-takeaway-com/), 98.19% and the end of trading on November 17, 2025
- [Gopuff: Introducing Gopuff's new website (September 18, 2025)](https://markets.financialcontent.com/ms.intelvalue/article/bizwire-2025-9-18-introducing-gopuffs-new-website-the-future-of-shopping), owned inventory, micro-fulfillment centers, delivery in as fast as 15 minutes
- [Amazon: Grubhub as an ongoing Prime member offer (May 29, 2024)](https://press.aboutamazon.com/2024/5/amazon-announces-grubhub-as-ongoing-prime-member-offer-customers-can-now-order-grubhub-directly-from-amazon-com-and-the-amazon-shopping-app), the free Grubhub+ membership for Prime members

**Platform documentation**

- [DoorDash: Merchant pricing](https://merchants.doordash.com/en-us/pricing), the Basic, Plus and Premier commissions and what each includes
- [DoorDash: Drive On-Demand FAQs](https://help.doordash.com/en-us/merchants/article/doordash-drive-faqs), delivery for a merchant's own ordering channels at a flat fee per order
- [Uber Eats: Merchant pricing (US)](https://merchants.ubereats.com/us/en/pricing/), plan fees, the self-delivery fee and Uber Direct from $7.99 per delivery
- [Olo: Dispatch](https://www.olo.com/dispatch), couriers paired with orders from a network of 27+ providers, fee limits and transit times
- [Olo: Rails](https://www.olo.com/rails), menu, pricing, location and availability sync with marketplaces and orders in one place
- [Shipt: App Store listing](https://apps.apple.com/us/app/971888874), 120+ stores, delivery windows, substitutions, no markups for Target Circle 360 members through December 2026

**Datasets**

- [Bloomberg Second Measure: Which company is winning the restaurant food delivery war?](https://secondmeasure.com/datapoints/food-delivery-services-grubhub-uber-eats-doordash-postmates/), March 2024 shares of observed US meal delivery sales and the card-panel methodology
- [Earnest Analytics: DoorDash leads US delivery share](https://www.earnestanalytics.com/insights/doordash-leads-us-delivery-share-but-some-cities-still-competitive), end-of-2024 national and city shares
