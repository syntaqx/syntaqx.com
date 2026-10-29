+++
title = "Retail Media & Marketplace Ads"
description = "Sponsored Products, Amazon Ads and its DSP, Walmart Connect, Roundel, Instacart Ads, eBay and Etsy ads, measurement and clean rooms, and ad money from filings."
category = "Commerce Industry"
order = 2328
part = "Marketplaces"
tags = ["commerce", "marketplaces", "retail-media", "advertising", "attribution", "data-model"]
+++

Retail media is advertising sold by a retailer or marketplace on its own shelves and with its own shoppers' data: a sponsored product in search results on Amazon or Walmart, a display ad on Target's app, a coupon on Instacart, and increasingly the same audiences carried off the store to streaming TV and the open web. Two things make it different from other advertising. The ad sits next to the buy button, so the network sees the sale it caused; and the buyer of the ad is usually the brand whose product is on the shelf, so the money is part of the commercial relationship between the brand and the retailer as much as it is marketing.

It is also where the profit in marketplaces has moved. Amazon's advertising was $68.6 billion in 2025, against $172.2 billion of third-party seller services, and on a delivery marketplace advertising is the high-margin line ([Take Rates and Unit Economics](/books/commerce/delivery-landscape#take-rates-and-unit-economics)). For a seller on Amazon, ads are close to a second referral fee: Sponsored Products requires the product to be eligible for the Featured Offer, so ads, price and fulfillment are one decision ([The Featured Offer](/books/commerce/selling-on-amazon#the-featured-offer)). This chapter covers the networks and their formats, how the money is booked on both sides, measurement (attribution, clean rooms and incrementality), and the records a brand or a network needs. It extends `listings` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and `acquisition_spend` from [Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it). Paid social and search, Shopping ads fed from a product feed, affiliates and attribution across all channels are [Acquisition & Attribution](/books/commerce/acquisition-and-attribution); ads on user content, brand safety and data licensing are the User-Generated Platforms volume's [Ads & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing).

## How the Platforms Do It

As of October 2026, from each network's pages and filings:

| Network | Owner | Formats | Pricing | Scale disclosed |
| --- | --- | --- | --- | --- |
| **Amazon Ads** | Amazon | Sponsored Products, Sponsored Brands, display, video and audio; streaming inventory on Prime Video, Twitch, Thursday Night Football and Fire TV | Cost per click for Sponsored Products; CPC or cost per 1,000 viewable impressions (vCPM) for Sponsored Brands; "no minimum spend" for sponsored ads | $68.6 billion advertising revenue in 2025 |
| **Walmart Connect** | Walmart | Sponsored Search, Onsite Display, Brand Shop and Shelf, Offsite media, Store ads; Sponsored Products, Brands and Videos for small business | Through Ad Center and partners | Global advertising "grew 46% to nearly $6.4 billion, including VIZIO" in the fiscal year ended January 31, 2026; Walmart Connect in the US up 41% in the fourth quarter |
| **Roundel** | Target | Target Product Ads (sponsored products), managed display on Target's site, app and "150+ premium publishers," offsite CTV, programmatic, search, social and influencers, in-store and digital out-of-home | Not published | "100M+ unique Target Circle members with first-party data" and "30M+ weekly in-store visits"; advertising sits inside net sales, not reported separately |
| **Instacart Ads** | Maplebear (Instacart) | "Sponsored Product ads, display ads, coupons, and brand pages"; Carrot Ads on retailers' own storefronts | Not published | "over 9,000 active brands"; $1,065 million advertising and other revenue in 2025 |
| **eBay Promoted Listings** | eBay | General (sponsored placement), Priority (search placement), Offsite | General "Cost-per-sale," at an ad rate "between 2% and 100%"; Priority "Cost-per-click" | $1,993 million total advertising revenue in 2025, up 22% |
| **Etsy Ads and Offsite Ads** | Etsy | Etsy Ads on Etsy search; Offsite Ads on Google, social and other sites | Offsite Ads: a fee of 15% of the order, 12% for shops over $10,000 in 12 months, capped at $100 an order | Not broken out from Etsy's services revenue |

Three patterns:

- **Search ads are a marketplace's shelf rent.** Sponsored Products on Amazon, Sponsored Search on Walmart, Target Product Ads, Instacart's sponsored products and eBay's Promoted Listings all sell the same thing: a higher position for an offer the shopper could already buy. Only sellers and brands on the shelf can buy them.
- **Audiences leave the store.** Every large network now sells its shopper data for ads elsewhere: Amazon on Prime Video and "premium placements across the open internet," Walmart through "Spotify, Yahoo DSP and Warner Bros. Discovery," Roundel through social platforms, CTV and YouTube, Instacart "online, off-platform, and in-store." The sale still happens in the store, which is what lets the network claim it.
- **Some ad fees are really commissions.** eBay's general Promoted Listings and Etsy's Offsite Ads charge only when an item sells, as a percentage of the sale. For the seller they behave like a variable referral fee on attributed orders, and they belong on the order, not in a marketing budget.

## Amazon Ads

Amazon sells three self-service sponsored formats inside its store and a programmatic business around them.

**Sponsored Products** are "cost-per-click (CPC) ads that promote individual product listings," shown "at the top of, alongside, or within shopping results and on product pages," and on some sites and apps beyond Amazon. They are available to "professional sellers, vendors, book vendors," KDP authors and agencies, and "Products must be in one or more eligible categories and be eligible for the Featured Offer in order to advertise"; adult, used, refurbished and closed-category products are excluded. Targeting is by keyword or by product, chosen by the advertiser or left to "Amazon's systems" to "target relevant keywords automatically." The advertiser sets a maximum bid per keyword ("The more competitive your bid, the more likely your ad is to be displayed") and a daily budget that isn't paced day by day: a $100 daily budget can buy "up to $3,100 worth of clicks" in a 31-day month, though the month never exceeds the campaign's budget.

**Sponsored Brands** put the brand above or beside results "with video, image, or collections," and link to a product or the brand's Store. They are open to vendors, KDP authors, agencies and "professional sellers enrolled in Amazon Brand Registry," and can be bought by CPC or by "Cost per 1,000 viewable impressions (vCPM)," or reserved as a fixed share of voice with a minimum commitment.

**Display, video and audio.** Amazon's former Sponsored Display "is now known as display ads," and its demand-side platform, which offered "access to exclusive inventory on Prime Video, Twitch, Thursday Night Football, Amazon.com, and Fire TV" and "thousands of premium third-party publishers," "has evolved into Amazon Ads Agent, one omnichannel ad platform," with the former DSP's controls in its advanced settings. Prices for these aren't published.

Three consequences for a seller's system:

- **Ads and offers are coupled.** A listing that loses its Featured Offer eligibility, goes out of stock or is suppressed stops serving ads. Ad automation that keeps bidding on an unbuyable item wastes nothing (no clicks), but automation that raises bids to compensate for lost sales chases a problem the ads can't fix. Ad state is read alongside offer state ([Offer observations](/books/commerce/selling-on-amazon#how-to-build-it)).
- **Spend arrives on the settlement.** Advertising charges for a 3P seller can appear among a settlement's account-level lines, beside storage and the selling plan, so the ad bill reconciles in the same place as the fees ([Settlements and the Money](/books/commerce/selling-on-amazon#settlements-and-the-money)).
- **The keyword is the unit.** Search ads are bought by query, and the report that matters is by search term: which queries spent, which converted, which to add as keywords and which to exclude. That report is large and daily, and it is where most of the optimization happens.

## Walmart Connect, Roundel and Instacart Ads

The retailers' networks sell the same shelf position and lean harder on what Amazon has less of: stores.

- **Walmart Connect** sells to enterprise brands (Sponsored Search, Onsite Display, Brand Shop and Shelf, Offsite media, Store ads) and to small businesses and marketplace sellers (Sponsored Products, Sponsored Brands, Sponsored Videos, Onsite Display), managed in Ad Center or through partners, with targeting and "closed-loop measurement" from "Walmart's vast online and in-store transaction data." Walmart's 10-K describes "advertising solutions for brands and online marketplace sellers" as part of Walmart U.S. Its global advertising business "grew 46% to nearly $6.4 billion, including VIZIO" in fiscal 2026; VIZIO's smart TVs are an ad surface of their own.
- **Roundel** is "a media company that's part of Target," which its 10-K describes as providing "advertising services to vendors and other third parties, including marketplace sellers." It sells Target Product Ads, managed display across Target and "150+ premium publishing partners through Bullseye Marketplace," offsite channels and in-store screens, and launched an AI performance product, Precision Plus, in 2025. Target reports advertising inside net sales ("most notably advertising revenue and credit card profit-sharing income") without a separate figure.
- **Instacart Ads** sells to the brands whose products sit in hundreds of grocers' stores at once, "over 9,000 active brands," with "Sponsored Product ads, display ads, coupons, and brand pages," and Carrot Ads "brings the best of Instacart Ads to retailers' and other partners' owned and operated online storefronts and apps." That last product is retail media as a service: the grocer gets an ad business on its own site without building one, and the platform gets inventory beyond its app ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).

For a brand, these networks overlap the wholesale relationship. The same retailer that buys the brand's goods on a purchase order sells it ads against its own shelf, and the line between a marketing allowance deducted from an invoice and a media buy invoiced by the retailer's ad business is set by each agreement ([Wholesale](/books/commerce/business-models#wholesale); [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#co-op-mdf-and-promotional-allowances) covers co-op and allowances).

## Marketplace Ads Elsewhere

The marketplaces built on independent sellers price ads closer to commissions.

**eBay Promoted Listings.** The general strategy is "Cost-per-sale": the seller picks an ad rate "anything between 2% and 100%" of the sale price and is charged "only... if an item in the ad campaign sells" through an attributed click. Priority is "Cost-per-click" for top search placement, and Offsite runs on other sites at a "Dynamic Cost per click." eBay describes Promoted Listings as "a meaningful amount of our revenue," and its total advertising revenue (which also includes third-party ads on its pages) was $1,993 million in 2025.

**Etsy Offsite Ads.** Etsy advertises sellers' listings on other sites and charges a fee only on an attributed order: 15%, or a "discounted 12% fee" once a shop has made $10,000 in a consecutive 365-day period, and the fee "will never exceed $100 USD" per order. An order is attributed if the buyer clicked an Offsite Ad within 30 days. Shops under the threshold may opt out; above it, they are enrolled "for the lifetime of your shop." Etsy Ads, on Etsy's own search, are a separate pay-per-click product.

The modeling rule follows from the pricing. A cost-per-sale ad is a charge on a specific order, known when the order is attributed: an `order_charges` row of kind `advertising_fee`, payer the merchant, payee the platform, with the campaign as its `rule_ref`. A cost-per-click ad is a cost of a day and a campaign, not of any order; it belongs in daily spend and is allocated to orders only in analysis. Mixing the two (treating Offsite Ads fees as marketing budget, or allocating CPC spend into order charges) makes either the order margin or the marketing spend wrong ([Contribution margin](/books/commerce/business-models#the-unit-economics)).

## How the Money Is Booked

The two sides book the same dollar differently:

- **The network** recognizes ad revenue as the ad is delivered. Amazon's 10-K: "Revenue is recognized as ads are delivered based on the number of clicks or impressions." A retailer that also buys from the advertiser has to separate the two relationships: Target records vendor income from "volume rebates, promotions, certain advertising activities, and markdown allowances" generally "as a reduction of cost of sales," while the advertising revenue it reports comes from services sold through Roundel. The accounting for consideration received from a vendor is the ASC 606 question of whether the vendor bought a distinct service ([ASC 606 and IFRS 15 in Five Steps](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps)).
- **The brand or seller** books CPC and CPM spend as marketing expense in the period, and cost-per-sale fees as a selling cost of the order they're attached to. A 1P vendor that funds advertising through an allowance on its invoices sees it as a deduction against revenue, not as media spend, which is one reason 1P and 3P margins can't be compared without restating both ([Business Models & Unit Economics](/books/commerce/business-models#how-each-model-shapes-the-system)).

Agencies and partners sit in the middle. Pattern, which buys brands' products and sells them on marketplaces, says it manages "$1.8b ad spend" a year; for a brand selling through such a partner, the ads are the partner's cost inside its margin, and the brand sees results only as the partner reports them ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#resellers-and-agencies)).

## Measurement

Retail media's pitch is closed-loop measurement: the network saw the ad and the sale. What it actually reports is an attribution, and three questions decide whether the number can be used.

**Attribution: whose sale is it?** Each network credits a sale to its ads by its own rules: a window after the click or view, whether the same product or any of the brand's products counts, whether a view without a click counts, and whether the sale was online or in a store. Etsy says plainly that its window is 30 days from the click. When a shopper sees a Walmart Connect ad, a Roundel ad on social media and a sponsored listing on Amazon in the same week, each network can count a sale it influenced, and the brand's total attributed sales across networks exceed its sales. My rule: store each network's attributed sales as that network reported them, with its window and model named, and never sum them across networks as if they were sales.

**The metrics.** Return on ad spend (ROAS) is attributed sales over spend; Amazon sellers more often use its inverse, advertising cost of sales (ACoS), spend over attributed sales. Both are ratios of an attributed number, so both inherit the attribution's assumptions. The one that matters to the business is **total advertising cost of sales** (spend over all sales of the advertised items, attributed or not), because it can be checked against the order book, and contribution after ads by item and channel, which the core model's lines already support ([The Unit Economics](/books/commerce/business-models#the-unit-economics)).

**Clean rooms.** The networks won't hand over shopper-level data, so they offer clean rooms in which an advertiser can join its own data with the network's and get aggregates back. Amazon Marketing Cloud is the model: a "secure, privacy-safe, and cloud-based clean room solution" with "hundreds of fields about their Amazon Ads campaigns," into which advertisers can upload "their own pseudonymous inputs"; "AMC only accepts pseudonymized information," "You can only access aggregated, anonymous outputs from AMC," with "built-in aggregation thresholds," and it is "available at no cost to eligible advertisers." Pseudonymized data is still personal data under most privacy laws, so what a brand uploads is governed by its own consents and privacy notices ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)); the clean room limits what comes out, not what the brand may put in.

**Incrementality: would the sale have happened anyway?** Attribution answers "did an ad touch this sale"; incrementality answers "did the ad cause it." A sponsored listing for a shopper who searched for the brand by name often buys a sale the organic listing would have won. The test is a holdout: withhold ads from a random share of the audience or of the markets, and compare ([Holdouts](/docs/telemetry/experimentation#holdouts)). Networks offer lift studies run on their side; a brand can also run geographic or time-based holdouts on its own and compare total sales from its order book, which needs nothing from the network. The IAB and MRC's Retail Media Measurement Guidelines (January 2024) are a reasonable checklist for reading any network's report: digital measurement "should at least meet MRC GIVT requirements" for invalid traffic, with sophisticated invalid traffic filtered when measuring outcomes; viewability follows the MRC standard (for display, at least 50% of the ad's pixels on screen "for a minimum of one continuous second," two seconds for video); attribution windows "must be disclosed before campaign execution and measurement"; lookback periods need "empirically supported limits"; and a chapter covers incrementality methods from randomized tests to matched markets.

## How to Build It

A brand advertising on several networks needs three things: the campaigns and what they advertise, the daily spend as each network billed it, and the sales each network attributed, kept apart from the brand's own orders. `acquisition_spend` from [Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it) stays the one row per channel, campaign and day that CAC is computed from; the retail media tables are the detail behind it:

```sql
CREATE TABLE ad_campaigns (              -- a campaign on one network, as the network defines it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id         UUID NOT NULL REFERENCES merchants (id),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),  -- the ad account
  network             TEXT NOT NULL,     -- 'amazon_ads', 'walmart_connect', 'roundel', 'ebay_pl'
  external_ref        TEXT NOT NULL,     -- the network's campaign ID
  format              TEXT NOT NULL CHECK (format IN ('sponsored_product', 'sponsored_brand',
                        'display', 'video', 'audio', 'offsite', 'coupon', 'in_store')),
  pricing_model       TEXT NOT NULL CHECK (pricing_model IN ('cpc', 'vcpm', 'cpm', 'cost_per_sale',
                        'flat')),
  name                TEXT NOT NULL,
  daily_budget        BIGINT,            -- minor units; null for cost-per-sale
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  attribution_model   TEXT NOT NULL,     -- the network's, named: e.g. 'click_30d_same_listing'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (connected_system_id, external_ref)
);

CREATE TABLE ad_campaign_listings (      -- what a campaign advertises
  campaign_id  UUID NOT NULL REFERENCES ad_campaigns (id),
  listing_id   UUID NOT NULL REFERENCES listings (id),
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at   TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, listing_id, added_at)
);

CREATE TABLE ad_spend_daily (            -- as the network reports it, by day and target
  campaign_id   UUID NOT NULL REFERENCES ad_campaigns (id),
  spend_date    DATE NOT NULL,           -- in the network's reporting time zone
  target        TEXT NOT NULL DEFAULT '', -- keyword, search term, product or audience; '' = all
  match_type    TEXT,                    -- 'exact', 'phrase', 'broad', 'auto', null
  impressions   BIGINT NOT NULL DEFAULT 0,
  clicks        BIGINT NOT NULL DEFAULT 0,
  spend         BIGINT NOT NULL CHECK (spend >= 0),  -- minor units
  currency      CHAR(3) NOT NULL,
  report_ref    TEXT NOT NULL,           -- the report it came from
  restated_at   TIMESTAMPTZ,             -- networks restate recent days; keep the last import
  PRIMARY KEY (campaign_id, spend_date, target)
);

CREATE TABLE attributed_sales (          -- the network's claim, never the order book
  campaign_id      UUID NOT NULL REFERENCES ad_campaigns (id),
  sale_date        DATE NOT NULL,
  listing_id       UUID REFERENCES listings (id),   -- null: brand-level ("halo") sales
  attribution      TEXT NOT NULL,        -- 'same_listing', 'brand_halo', 'view_through', 'in_store'
  window_days      SMALLINT NOT NULL,
  units            INT NOT NULL DEFAULT 0,
  sales_amount     BIGINT NOT NULL DEFAULT 0,
  new_to_brand     INT,                  -- where the network reports it
  currency         CHAR(3) NOT NULL,
  report_ref       TEXT NOT NULL,
  PRIMARY KEY (campaign_id, sale_date, listing_id, attribution, window_days)
);

ALTER TABLE order_charges DROP CONSTRAINT order_charges_kind_check;
ALTER TABLE order_charges ADD CONSTRAINT order_charges_kind_check CHECK (kind IN (
  'shipping_fee', 'delivery_fee', 'service_fee', 'small_order_fee', 'regulatory_fee', 'tax',
  'duty', 'tip', 'discount', 'commission', 'referral_fee', 'fulfillment_fee', 'processing_fee',
  'allowance', 'chargeback_deduction', 'advertising_fee'));  -- cost-per-sale ads, per order
```

The daily rollup feeds `acquisition_spend`, and the measure the business trusts compares spend to the order book rather than to the networks' claims:

```sql
-- Total advertising cost of sales by item and month: spend over all sales, attributed or not.
WITH spend AS (
  SELECT cl.listing_id, date_trunc('month', s.spend_date) AS month, SUM(s.spend) AS spend
  FROM ad_spend_daily s
  JOIN ad_campaign_listings cl ON cl.campaign_id = s.campaign_id
   AND s.spend_date >= cl.added_at::date
   AND (cl.removed_at IS NULL OR s.spend_date < cl.removed_at::date)
  WHERE s.target = ''                    -- campaign totals only, no double counting by target
  GROUP BY 1, 2
), sales AS (
  SELECT li.id AS listing_id, date_trunc('month', o.placed_at) AS month, SUM(l.amount) AS sales
  FROM order_lines l
  JOIN orders o   ON o.id = l.order_id
  JOIN listings li ON li.item_id = l.item_id AND li.channel_id = o.channel_partner
  GROUP BY 1, 2
)
SELECT s.listing_id, s.month, s.spend, sa.sales,
       round(100.0 * s.spend / NULLIF(sa.sales, 0), 1) AS tacos_pct
FROM spend s LEFT JOIN sales sa USING (listing_id, month);
```

Design notes:

- **The network's numbers are imports, not facts.** Spend is what the network billed and reconciles to its invoice or settlement; attributed sales are its claim under its model. Both are restated for several days after the fact, so the import replaces recent days and keeps `restated_at`.
- **Spreading a campaign's spend across several listings is an analysis choice.** The sketch charges the whole campaign to each listing it advertises, which is right only for single-listing campaigns; split by the network's per-product spend where it reports one, and say which rule the report used.
- **Cost-per-sale is an order charge.** eBay's general Promoted Listings and Etsy's Offsite Ads fees go on the attributed order as `advertising_fee`, reconciled against the platform's fee statement, so order margin includes them.
- **Halo and view-through stay labeled.** Brand-level and view-through attributed sales are kept in their own rows; a dashboard that adds them to click-attributed sales overstates every campaign.
- **Clean-room outputs are aggregates, and so are your uploads' consequences.** Store queries run and results returned in a clean room with the consent basis for any data uploaded, the same way any processor is recorded ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)).
- **A network is a connected system.** Ad accounts authorize separately from the seller account (Amazon Ads has its own API and consent), with their own tokens and rate limits.

## Auditing

- **Every campaign change.** Budgets, bids, targets and status as set, by whom (a person, a rule or an agency's tool), and when, because the question after a bad month is what changed.
- **Every spend import against every invoice.** Daily spend as reported, its restatements, and its match to the network's invoice or the marketplace settlement's advertising lines.
- **Every cost-per-sale fee.** The order it was charged on, the campaign and rate that produced it, and the platform's statement line.
- **Every attribution as reported.** With the network's window and model, so a claim from last year can be read under last year's rules.
- **Every holdout.** The design, the randomization unit, the dates and the result, kept with the decision it informed.

## What This Means for the System You Build

- **Couple ads to offer state:** read Featured Offer, stock and suppression before automating bids, because an unbuyable listing can't be rescued by ads.
- **Separate cost-per-click spend from cost-per-sale fees:** the first is a day's marketing cost, the second a charge on an order.
- **Import each network's spend and attributed sales as that network's claim,** with its window and model, and never sum attributed sales across networks.
- **Measure total advertising cost of sales against the order book** and run holdouts for incrementality.
- **Treat clean rooms as processors** of data you're responsible for, under your own consents.
- **Reconcile ad spend to invoices and settlements,** and keep 1P ad allowances distinct from media buys.

## References

**Network documentation**

- [Amazon Ads: Sponsored Products](https://advertising.amazon.com/solutions/products/sponsored-products), CPC pricing, placements, eligibility including the Featured Offer, keyword and automatic targeting, bids and monthly budget behavior
- [Amazon Ads: Sponsored Brands](https://advertising.amazon.com/solutions/products/sponsored-brands), formats, CPC and vCPM, reserved share of voice and Brand Registry eligibility
- [Amazon Ads: Sponsored Display](https://advertising.amazon.com/solutions/products/sponsored-display), renamed display ads, placements on and off Amazon
- [Amazon Ads: Amazon DSP](https://advertising.amazon.com/solutions/products/amazon-dsp), streaming and third-party inventory and the move into Amazon Ads Agent
- [Amazon Ads: Amazon Marketing Cloud](https://advertising.amazon.com/solutions/products/amazon-marketing-cloud), the clean room, pseudonymized inputs, aggregated outputs and no-cost access
- [Walmart Connect](https://www.walmartconnect.com/), formats, Ad Center, offsite partners and closed-loop measurement
- [Roundel](https://www.roundel.com/), Target Circle data, onsite, offsite and in-store formats, and Bullseye Marketplace publishers
- [eBay Developers: Promoted Listings overview](https://developer.ebay.com/api-docs/sell/static/marketing/pl-overview.html), cost-per-sale and cost-per-click strategies and the ad rate range
- [Etsy Help: Offsite Ads](https://help.etsy.com/hc/articles/360000338367), the 15% and 12% fees, the $100 cap, the 30-day window and opt-out rules

**Industry guidelines**

- [IAB and MRC: Retail Media Measurement Guidelines (January 2024)](https://www.iab.com/wp-content/uploads/2024/01/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), invalid traffic, viewability, attribution window disclosure, lookback limits and incrementality

**Filings**

- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), advertising services to sellers, vendors and others, and revenue recognized as ads are delivered by clicks or impressions
- [Walmart: Fourth quarter fiscal 2026 earnings release (February 19, 2026)](https://stock.walmart.com/sec-filings/all-sec-filings/content/0000104169-26-000032/earningsreleasefy26q4.htm), global advertising of nearly $6.4 billion including VIZIO and Walmart Connect US growth
- [Walmart: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm), advertising solutions for brands and marketplace sellers
- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), Roundel, advertising revenue within net sales, Precision Plus and vendor income as a reduction of cost of sales
- [Maplebear (Instacart): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000018/cart-20251231.htm), ad formats, Carrot Ads, 9,000 active brands and advertising and other revenue
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), total advertising revenue and Promoted Listings
- [Pattern Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1811935/000181193526000013/ptrn-20251231.htm), the reseller model

**In practice**

- [Pattern](https://pattern.com/), ad spend managed yearly
