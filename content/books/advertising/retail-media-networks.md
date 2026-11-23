+++
title = "Retail Media Networks"
description = "Running a retail media network: onsite sponsored products, offsite and in-store ads, closed-loop attribution, IAB/MRC guidelines and commerce media."
category = "Advertising Industry"
order = 2945
part = "Walled Gardens"
tags = ["advertising", "retail-media", "commerce-media", "walled-gardens", "measurement", "data-model"]
+++

A retail media network is a retailer selling advertising on its own shelves and with its own shoppers' data: sponsored products among its search results, display on its site and app, screens in its stores, and the same audiences carried to streaming TV, social platforms and the open web. Amazon's advertising services were $68.6 billion across the four quarters of 2025; Walmart's global advertising business "grew 46% to nearly $6.4 billion, including VIZIO" in its fiscal year ended January 2026; Instacart's advertising and other revenue was $1,065 million in 2025. IAB and PwC put US commerce media, which IAB calls "a core performance channel powered by first-party data", at $63.4 billion in 2025, up 18%.

This chapter is the operator's side: what a retailer, marketplace or commerce platform builds to run a network. The seller's side (buying Sponsored Products, reading ACoS, cost-per-sale fees as order charges, reconciling ad charges on a settlement) is Commerce's [Retail Media & Marketplace Ads](/books/commerce/retail-media), and the two map record for record: Commerce's `ad_spend_daily` is the advertiser's import of this volume's `delivery_daily`, and its `attributed_sales` is the advertiser's copy of the network's attributed conversions.

Running a network is hard because it is three businesses in one system. Onsite, the retailer is a walled garden that must blend ads into organic results without degrading the shopping experience that produces the sales it sells against. Offsite, it is a data provider and an open-web buyer, carrying shopper audiences into other companies' auctions under privacy law. And in measurement it grades its own homework: the network that shows the ad also counts the sale, so its attribution rules, windows and incrementality claims decide what brands will pay, which is why IAB and the MRC wrote retail-specific guidelines. Underneath sits the commercial relationship: the advertiser is often the retailer's own supplier, and the line between an ad buy and a trade allowance is set by contract and accounting, not by the ad server.

This chapter covers the networks, onsite sponsored products (relevance, eligibility, the auction and placement), onsite display, offsite extension, in-store media, closed-loop measurement and the IAB/MRC Retail Media Measurement Guidelines, clean rooms, building a network or renting one (Carrot Ads-style network as a service), commerce media beyond retail, and the accounting, then the records. It extends `properties`, `line_items` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The onsite auction's theory and the Amazon soft-reserve complaint are [Auction Mechanics](/books/advertising/auction-mechanics#reserve-prices); bid strategies are [Automated Bidding](/books/advertising/automated-bidding); cost-per-sale pricing is [Pricing Models](/books/advertising/pricing-models); search-ad mechanics shared with general search are [Search Advertising](/books/advertising/search-advertising); self-serve tooling and APIs for brands are [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms); offsite programmatic buying is Demand-Side Platforms; clean rooms in depth are Data Clean Rooms; attribution and incrementality in general are Attribution and Incrementality & Lift; digital screens are Digital Out-of-Home.

## How the Platforms Do It

As of November 2026, from filings and network documentation:

| Network | Onsite | Offsite and other | Measurement and data | Scale disclosed |
| --- | --- | --- | --- | --- |
| **Amazon Ads** | Sponsored Products, Sponsored Brands (CPC, vCPM, reserved share of voice), display | Amazon Ads Agent (introduced in the third quarter of 2026) and Full-Funnel Campaigns combining sponsored ads, display, video and streaming TV | A clean room (Commerce covers Amazon Marketing Cloud) | Advertising services $68.6 billion in 2025 |
| **Chase Media Solutions** | Offers in the Chase app and site | Card-linked offers with cash back | Chase's first-party transaction data | Launched April 3, 2024; about 80 million customers |
| **Criteo** | Retail media technology for retailers | Performance Media reported as a separate segment | Retail Media reported as a segment | Retail Media contribution ex-TAC $259.7 million in 2025 |
| **DoorDash** | Ads in the DoorDash app | Advertising partners through Symbiosis | Not covered here | No run rate disclosed; Smart Campaigns launched in 2025 |
| **Instacart Ads** | Sponsored products and other formats (Commerce covers them) | Carrot Ads on retailers' own storefronts; audiences on Google, Meta, Pinterest, TikTok and The Trade Desk | Data Hub clean room | Advertising and other revenue $1,065 million in 2025; 9,000+ active brands; 310+ Carrot Ads partners |
| **Walmart Connect** | Onsite formats (Commerce covers them) | VIZIO TVs as an owned surface | Not covered here | Global advertising nearly $6.4 billion in fiscal 2026, including VIZIO |

Three patterns:

- **Onsite search ads are the core.** Every network sells placement among product results to the brands and sellers on the shelf, priced per click in an auction that weighs relevance, and it is the highest-margin line because there is no publisher to pay.
- **Offsite is where networks become ad tech customers.** Instacart sends audiences to Google, Meta, Pinterest, TikTok and The Trade Desk; Amazon buys streaming and open-web inventory; Walmart extends through VIZIO. The retailer's data travels, the sale stays in the store.
- **Many networks are rented.** Instacart's Carrot Ads grew "from 220 to more than 310" partners in a year, and Criteo reports retail media as a segment; a grocer can have a network without building an ad server.

## Onsite Sponsored Products

A sponsored product is an offer the shopper could already buy, shown higher. The ad unit is a slot in the results grid, the product carousel or the product detail page, and the ad is the product itself, rendered like an organic result with a "sponsored" label. That shape drives four decisions an operator makes before any auction.

**Eligibility comes from the catalog.** Only buyable offers can advertise: Amazon requires Sponsored Products to be in eligible categories and "eligible for the Featured Offer" (Commerce's [Amazon Ads](/books/commerce/retail-media#amazon-ads)), so an out-of-stock, suppressed or unwinnable offer stops serving. The operator's ad system reads the commerce system's availability and price in near real time; an ad for an item the shopper can't buy wastes the slot and the shopper's trust.

**Relevance gates the query.** A sponsored product shown for a query it doesn't answer looks like a bad search result. Operators apply a relevance threshold between the query (or the page's product) and the advertised item before the auction, from the same models organic search uses, and Amazon says its ranking "has increasingly given greater weight to relevancy over bid amount", with "the highest ranked ad" being "the one that best balances relevancy and bid value." A threshold is a quality floor in relevance units; the price floor is separate.

**Targeting is keywords, products and categories.** Advertisers bid on search terms (with match types, as in [Keywords and Match Types](/books/advertising/search-advertising#keywords-and-match-types)), on specific products or categories to appear on their pages, or let automatic targeting choose. The auction and price follow general search: Amazon describes "a form of generalized 'second-price' auction" since 2006, with a "hard reserve" to enter and a "soft reserve" the winner may pay, and eBay's Priority listings pay per click "depending on the second price auction results." The complaint the FTC and 22 states filed on August 31, 2026 alleges that Amazon's soft reserves charged Sponsored Products advertisers their own winning bid "close to 80% of the time", effectively converting most of those auctions into first-price ones; Amazon calls the claim of deception "patently false" ([Reserve Prices](/books/advertising/auction-mechanics#reserve-prices)).

**Placement and ad load are the operator's product decision.** How many of the first results may be sponsored, where in the grid, how often on a product page, and whether sponsored items can displace the organic result for the same item: these set both revenue and the shopping experience, and a network that shows the same product as an ad and as the organic result next to it has paid twice for one slot. My rules: deduplicate an advertised item against its own organic result on the page, cap sponsored slots per results page by a versioned rule (the same shape as feed ad load in [Ad Load and Placement in Feeds](/books/advertising/social-advertising#ad-load-and-placement-in-feeds)), and log each slot's outcome, including slots where no ad cleared the relevance bar.

The onsite ad is also where retail media meets the supplier relationship. The advertiser is a brand that may sell to the retailer wholesale (a 1P vendor) or sell on its marketplace (a 3P seller), and the same brand pays trade allowances deducted from invoices. Commerce's [Walmart Connect, Roundel and Instacart Ads](/books/commerce/retail-media#walmart-connect-roundel-and-instacart-ads) covers the overlap from the brand's side; for the operator, a media buy and a trade allowance must be separate records with separate contracts, because they are accounted for differently.

## Onsite Display and Brand Formats

Beyond sponsored products, networks sell display and video on the site and app (homepage banners, category page takeovers, brand stores, shoppable video), usually as guaranteed buys or programmatic deals rather than per-click auctions. These run through a conventional ad server with priorities and pacing (Ad Servers, in Ad Serving and Creative) and are priced per thousand impressions or viewable impressions, as Amazon's Sponsored Brands offers vCPM and a reserved share of voice that "requires a minimum spend commitment" ([Pricing Models](/books/advertising/pricing-models#flat-fees-sponsorships-and-share-of-voice)). Retailer sites restrict third-party tags for performance and privacy reasons, so the IAB/MRC guidelines acknowledge that onsite viewability tagging by every advertiser partner "is generally not possible", which is one reason networks seek MRC accreditation for their own counting.

## Offsite Extension

Offsite, the network carries its shopper audiences into other companies' inventory: streaming TV, social platforms, the open web. Three models, often combined:

- **Buying as an advertiser on the brand's behalf.** The network buys through a DSP (its own or a partner's) using its audiences, and charges the brand for media plus a fee, then attributes sales from its own transactions. Amazon introduced Amazon Ads Agent in the third quarter of 2026 and launched Full-Funnel Campaigns in it, combining sponsored ads, display, video and streaming TV; Instacart partners with Google, Meta, Pinterest, TikTok and The Trade Desk "using our first-party grocery data."
- **Licensing audiences into another platform.** The network makes segments available in a DSP or social platform for the brand's own buys, priced as a data fee.
- **Selling the network's owned media off the store.** Walmart's VIZIO televisions are an ad surface of their own; Amazon's Prime Video and Fire TV are streaming inventory it owns.

Offsite turns the network into a data provider under privacy law. Shopper audiences are personal data; activating them on another platform is, under most US state laws, a sale or sharing that the shopper can opt out of, and in the EU needs a lawful basis the network can show (US State Privacy Law for Advertising and GDPR & ePrivacy for Ads cover the rules; [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection) the generic one). The records the network keeps are an activation log: which audience, built how, pushed to which destination, for which advertiser, on what date, under which consent basis, with opt-outs honored before each push.

## In-Store Media

Screens at the shelf, at checkout and at the entrance, audio in the aisles, and digital coupons at the register are store media. The IAB/MRC guidelines place in-store screens under the MRC's digital place-based standards, measured by audience exposure (people passing a screen) rather than impressions served to a device, and IAB with IAB Europe published in-store retail media standards recommending measurement windows around the campaign. <!-- source-gap: adv-iab-in-store-standards | secondary | the IAB and IAB Europe in-store retail media standards and their recommended pre- and post-campaign measurement periods | closes with: the IAB or IAB Europe standards document | checked: 2026-11-22 --> For the system, a store's screen network is a property of kind `screen_network`, each screen or zone an ad unit with its location, and delivery an `ad_events` stream from the screens' players with an audience multiplier from the measurement method, as Digital Out-of-Home covers.

## Closed-Loop Measurement

A network's pitch is that it saw the ad and the sale. What it reports is an attribution, and the IAB and MRC's Retail Media Measurement Guidelines (January 2024) are the standard for reading and building it:

- **Windows are disclosed before the campaign, and empirically supported.** The guidelines don't prescribe a window but note typical windows "often 3, 7, 14, 28, or 30 days"; windows must be disclosed before execution and limited to what's "empirically supported", and day-level lag between exposure and conversion is encouraged so buyers can reconcile across retailers.
- **Outcomes need viewable impressions and filtered traffic.** "The MRC requires viewable impressions for attribution of outcomes to ad exposures"; sophisticated invalid traffic must be filtered for outcomes, and unfiltered outcomes labeled and reported separately. Viewability follows the MRC's 50% of pixels for one continuous second (display) or two seconds (video).
- **Halo and extrapolation are labeled.** Attributed sales must disclose whether they rest on viewability or extrapolation, and how halo products (the brand's other items) are counted.
- **Incrementality is a separate claim.** The guidelines cover randomized controlled trials, synthetic controls, matched-market tests and machine-learning models, and encourage outcomes used for pricing or optimization to be "subject to third-party audit", with tools calibrated at least annually.
- **Accreditation is recommended.** The guidelines recommend that retail media measurement be MRC compliant and "ultimately, accredited", and acknowledge that "the majority of retail media organizations may not reflect or consider viewability in attribution today."

The operator's rules follow directly. An attribution rule is a versioned record (window by click and view, same product or brand halo, online or in-store, viewable-only, invalid traffic filtered) disclosed to the advertiser before the campaign runs, and every attributed sale names the rule it was attributed under. Online and in-store sales are separate sources (in-store sales arrive by loyalty ID or payment card match, later and less completely). And the network keeps its claim separate from incrementality: a sponsored product shown to a shopper who searched the brand by name often buys a sale the organic listing would have won, which only a holdout measures ([Holdouts](/docs/telemetry/experimentation#holdouts)). Commerce's [Measurement](/books/commerce/retail-media#measurement) makes the same point from the brand's side, and recommends total advertising cost of sales against the brand's own order book as the check.

## Clean Rooms

Networks don't hand brands shopper-level data, so they offer clean rooms where a brand can join its data with the network's and get aggregates back. Amazon Marketing Cloud is the familiar model, with pseudonymized inputs and aggregated outputs above thresholds (Commerce's [Measurement](/books/commerce/retail-media#measurement) covers it and what a brand may upload). Instacart launched Data Hub, "a privacy-first clean room solution that lets brands analyze their own customer data" alongside Instacart's first-party data; its launch partners use it to build off-platform audiences and measure ad performance across channels. The guidelines refer clean-room measurement to IAB Tech Lab's clean room guidance. For the operator a clean room is a query service with thresholds, noise and audit logs on its outputs; Data Clean Rooms, in Identity and Audiences, covers the models and the privacy techniques.

## Build or Rent

A retailer starting a network chooses between building the stack (catalog-aware ad server, auction, self-serve tools, attribution, billing) and renting one. Instacart's ad capabilities extend to "retailers' own e-commerce sites powered by our Carrot Ads technology", and grocers such as Associated Food Stores launch "leveraging Carrot Ads as their retail media network"; Criteo sells retail media technology to retailers and reports the business as its own segment.

What the rented model means for the records:

- **The provider is multi-tenant; the retailer is the tenant.** Each retailer's catalog, advertisers, auctions and attribution are isolated, and a brand that advertises on several retailers through the same provider has a separate ad account per retailer, because the inventory, rules and money belong to each retailer ([Multi-Tenancy](/docs/architecture/multi-tenancy)).
- **The provider's share is a fee.** The provider charges the retailer a revenue share or a platform fee, which is a `fee_terms` row in this volume's model (the one table for every fee a party charges another, from Take Rates & Supply Quality), and the retailer's statement from the provider is an invoice of kind `payable`.
- **Brands may buy across retailers.** A provider can offer brands one buying interface across its retailers (Instacart's ad capabilities "extend across our marketplace and retailers' own e-commerce sites"), which means the provider runs auctions per retailer but reports per brand across them, with each retailer's attribution rule applied to its own sales.
- **The retailer owns the shopper data.** The provider processes it under the retailer's instructions; offsite activation of one retailer's shoppers for another retailer's advertisers is a different legal relationship that the contract must allow.

My default for a mid-size retailer is to rent the auction and tooling and own three things from day one: the attribution rules and their disclosure, the ad load and relevance policy on its own pages, and the contracts with brands, because those are what its advertisers and regulators will hold it to.

## Commerce Media Beyond Retail

The same model (ads sold against owned transaction data, attributed to transactions the seller observes) runs outside retail:

- **Delivery and mobility apps.** DoorDash launched Smart Campaigns for ads in 2025 and said it "nearly doubled the number of advertising partners through Symbiosis from June to December"; it disclosed no advertising run rate. Uber reports an advertising business with a run rate in the billions; its figures were available to me only through secondary summaries. <!-- source-gap: adv-uber-ads-run-rate | secondary | Uber's disclosed advertising revenue run rate in 2025-2026 | closes with: an Uber filing or earnings release text stating the figure | checked: 2026-11-22 -->
- **Banks and card issuers.** Chase launched Chase Media Solutions on April 3, 2024, "its new digital media business", reaching its roughly 80 million customers with offers that pay cash back, after integrating Figg, the card-linked marketing platform JPMorgan Chase acquired in 2022. A bank's ad is an offer; the conversion is a card transaction the bank sees directly.
- **Travel.** Airlines, hotel groups and booking platforms sell media against travelers' bookings, onsite and offsite. I didn't open a primary source on a travel network's scale or products for this chapter. <!-- source-gap: adv-travel-media-networks | missing | a travel company's media network (airline, hotel or booking platform) products and scale from its own filing or site | closes with: a filing or the network's own product page | checked: 2026-11-22 -->

For engineers the variants differ in the conversion source (an order, a ride, a card transaction, a booking) and in the law that governs the data: card transaction data in particular is financial data under privacy laws that treat it more strictly, and a bank's ad network runs under its banking privacy obligations as well as advertising law (Sensitive Data & Discriminatory Targeting covers sensitive categories).

## How the Money Is Booked

The network books ad revenue as ads deliver; Amazon recognizes it "as ads are delivered based on the number of clicks or impressions." A retailer that also buys from the advertiser must separate the two relationships: Walmart records advertising "in either net sales or as a reduction to cost of sales, depending on the nature of the advertising arrangement." The accounting test is whether the brand bought a distinct advertising service ([ASC 606 and IFRS 15 in Five Steps](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps)); Advertising Revenue Accounting, in Contracts and Money, covers it. For the system the rule is that a media buy (an IO or self-serve spend, invoiced by the ad business) and a trade allowance (a deduction on the supplier's invoice, negotiated by merchandising) are different records that never share a line, even when both fund ads.

## How to Build It

The operator adds the catalog the ads advertise (the network's sellable items with their availability), the product ad that ties a line item to items, the attribution rule as a disclosed, versioned record, the columns on `conversions` that retail attribution needs, and the activation log for offsite audiences. Onsite slots are `ad_units` on a property of kind `retail_surface`, stores are properties of kind `screen_network`, and a network-as-a-service provider is an organization whose fee is a `fee_terms` row.

```sql
CREATE TABLE retail_catalog_items (      -- what the network's shoppers can buy, as the ad system sees it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  retailer_org_id     UUID NOT NULL REFERENCES organizations (id),  -- the network's owner (the tenant)
  sku                 TEXT NOT NULL,      -- the retailer's item ID
  seller_org_id       UUID REFERENCES organizations (id),  -- a marketplace seller; null: retailer-owned (1P)
  advertiser_id       UUID REFERENCES advertisers (id),    -- the brand that may advertise it
  category            TEXT,               -- the retailer's taxonomy node
  buyable             BOOLEAN NOT NULL,   -- in stock, not suppressed, winning its offer
  price_minor         BIGINT,
  currency            CHAR(3),
  updated_at          TIMESTAMPTZ NOT NULL,  -- from the commerce system's availability feed
  UNIQUE (retailer_org_id, sku)
);

CREATE TABLE product_ads (               -- a line item advertising one item
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  catalog_item_id     UUID NOT NULL REFERENCES retail_catalog_items (id),
  status              TEXT NOT NULL CHECK (status IN ('enabled', 'paused', 'ineligible', 'removed')),
  ineligible_reason   TEXT CHECK (ineligible_reason IN ('out_of_stock', 'not_buyable',
                        'category_excluded', 'policy', 'price_missing')),
  PRIMARY KEY (line_item_id, catalog_item_id),
  CHECK ((status = 'ineligible') = (ineligible_reason IS NOT NULL))
);

CREATE TABLE retail_attribution_rules (  -- how the network credits sales to ads; disclosed before use
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  retailer_org_id     UUID NOT NULL REFERENCES organizations (id),
  version             INT NOT NULL,
  click_window_days   SMALLINT NOT NULL CHECK (click_window_days BETWEEN 0 AND 90),
  view_window_days    SMALLINT NOT NULL DEFAULT 0 CHECK (view_window_days BETWEEN 0 AND 90),
  viewable_only       BOOLEAN NOT NULL DEFAULT TRUE,   -- MRC: viewable impressions for outcomes
  sivt_filtered       BOOLEAN NOT NULL DEFAULT TRUE,
  credit_scope        TEXT NOT NULL CHECK (credit_scope IN ('same_item', 'same_brand',
                        'same_category')),             -- halo beyond the advertised item
  channels            TEXT[] NOT NULL DEFAULT '{online}',  -- 'online', 'in_store'
  extrapolated        BOOLEAN NOT NULL DEFAULT FALSE,  -- in-store sales projected from a matched sample
  support_ref         TEXT NOT NULL,      -- the study supporting the window, per the guidelines
  disclosure_url      TEXT NOT NULL,
  disclosed_at        TIMESTAMPTZ NOT NULL,
  effective           TSTZRANGE NOT NULL,
  UNIQUE (retailer_org_id, version)
);

-- Retail attribution on the core's conversions.
ALTER TABLE conversions
  ADD COLUMN catalog_item_id UUID,       -- the item sold
  ADD COLUMN retail_attribution_rule_id UUID,
  ADD COLUMN credit_scope TEXT,          -- how this sale matched: 'same_item', 'same_brand', ...
  ADD COLUMN sales_channel TEXT,         -- 'online', 'in_store'
  ADD COLUMN new_to_brand BOOLEAN;       -- no purchase of the brand in the lookback
ALTER TABLE conversions ADD CONSTRAINT conversions_catalog_item_fk
  FOREIGN KEY (catalog_item_id) REFERENCES retail_catalog_items (id) NOT VALID;
ALTER TABLE conversions ADD CONSTRAINT conversions_retail_rule_fk
  FOREIGN KEY (retail_attribution_rule_id) REFERENCES retail_attribution_rules (id) NOT VALID;
ALTER TABLE conversions ADD CONSTRAINT conversions_retail_rule_required_check
  CHECK (source <> 'retailer_sales' OR retail_attribution_rule_id IS NOT NULL) NOT VALID;

CREATE TABLE audience_activations (      -- an offsite push of shopper audiences
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  retailer_org_id     UUID NOT NULL REFERENCES organizations (id),
  advertiser_id       UUID REFERENCES advertisers (id),    -- null: offered to all buyers on the destination
  audience_ref        TEXT NOT NULL,      -- the audience as First-Party Data & Audiences records it
  destination_org_id  UUID NOT NULL REFERENCES organizations (id),  -- DSP, social platform, CTV
  destination_ref     TEXT,               -- the segment ID on the destination
  legal_basis         TEXT NOT NULL CHECK (legal_basis IN ('consent', 'contract',
                        'legitimate_interest', 'not_a_sale_service_provider', 'opt_out_honored')),
  opt_outs_applied_at TIMESTAMPTZ NOT NULL,  -- when the suppression list was applied
  member_count        BIGINT,
  pushed_at           TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ
);
```

The report a network gives a brand, and that the guidelines' disclosure is about, reads attributed sales by rule and scope, never mixing halo into same-item sales:

```sql
-- Per line item and month: spend, and attributed sales split by credit scope and channel, with the rule.
SELECT li.id AS line_item_id,
       date_trunc('month', c.occurred_at)         AS month,
       r.version                                  AS rule_version,
       c.credit_scope, c.sales_channel,
       count(*)                                   AS orders,
       sum(c.value_micros)                        AS attributed_sales_micros,
       count(*) FILTER (WHERE c.new_to_brand)     AS new_to_brand_orders
FROM conversions c
JOIN retail_attribution_rules r ON r.id = c.retail_attribution_rule_id
JOIN ad_events e  ON e.id = c.attributed_event_id   -- sketch: production joins on (occurred_at, id)
JOIN line_items li ON li.id = e.line_item_id
WHERE c.source = 'retailer_sales'
  AND c.occurred_at >= date_trunc('month', now()) - interval '3 months'
GROUP BY 1, 2, 3, 4, 5
ORDER BY 1, 2, 4, 5;
```

Spend comes from `delivery_daily` for the same line item and months; the brand's own import of both is Commerce's `ad_spend_daily` and `attributed_sales` ([Retail Media & Marketplace Ads](/books/commerce/retail-media#how-to-build-it)).

Design notes:

- **The catalog is the ad system's view of commerce, not a copy of it.** `retail_catalog_items` holds only what eligibility needs (buyable, price, brand, category), refreshed from the commerce system's availability events; serving reads it, and a product ad flips to `ineligible` with a reason when the item can't be bought.
- **One rule per attributed sale, disclosed first.** `retail_attribution_rules` carries the window, viewability, invalid-traffic filtering, halo scope, channels, extrapolation and the study supporting the window, with `disclosed_at` before `effective` starts; the check on `conversions` makes a retail sale without a rule impossible to insert.
- **Halo and channel are columns, not totals.** `credit_scope` and `sales_channel` keep same-item, brand-halo, online and in-store sales apart, as the guidelines ask, so a report can't silently add them.
- **Activations are a log with a legal basis.** Each offsite push records the audience, destination, advertiser, basis and when opt-outs were applied; a shopper's opt-out must reach the next push and the destination's segment ([Retention](/docs/telemetry/consent-and-privacy#retention) for how long the log is kept).
- **A rented network is a tenant boundary.** Every table above carries the retailer; a provider runs them per tenant, and its fee is a `fee_terms` row, not a column here.
- **Media and allowances never share a record.** Ad spend is invoiced from `delivery_daily` by the ad business; trade allowances live in the commerce and accounting systems.

## Auditing

- **Every attribution rule as disclosed,** with its supporting study, disclosure date and effective range, because the brand's dispute is always about the window and the halo.
- **Every attributed sale with its rule and scope,** and the impression or click credited, viewable and filtered.
- **Every eligibility decision** (why a product ad stopped serving), with the catalog state that caused it.
- **Every offsite activation** with its legal basis, opt-out application time, destination and expiry.
- **Every sponsored slot's outcome** on a results page under the ad load rule in force, including slots left organic.
- **Every incrementality study** with design and result, kept beside the attributed numbers it qualifies.

## What This Means for the System You Build

- **Read catalog availability before every auction** and stop serving ads for items shoppers can't buy.
- **Gate onsite ads on relevance first, then auction on bid and relevance,** with a versioned cap on sponsored slots and deduplication against organic results.
- **Version and disclose attribution rules before campaigns run,** and tag every attributed sale with its rule, scope and channel.
- **Require viewable, filtered exposures for outcomes,** as the IAB/MRC guidelines do.
- **Log offsite activations with their legal basis** and apply opt-outs before each push.
- **Run a rented network as a tenant,** with the provider's share as a fee and the shopper data under the retailer's instructions.
- **Keep media buys and trade allowances in separate records** with separate contracts.

## References

**Specifications**

- [IAB and MRC: Retail Media Measurement Guidelines (January 2024)](https://www.iab.com/wp-content/uploads/2024/01/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), typical and disclosed attribution windows, empirical support, day-level lag, viewable impressions and SIVT filtration for outcomes, halo and extrapolation disclosure, incrementality methods, third-party audit and calibration, onsite tagging limits, in-store screens under digital place-based standards, and accreditation status
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), closed-loop retail auctions within scope

**Court records**

- [FTC et al. v. Amazon.com, Inc., No. 2:26-cv-03097 (W.D. Wash.), Complaint (August 31, 2026)](https://ag.ny.gov/sites/default/files/court-filings/federal-trade-commission-et-al-v-amazon.com-inc-complaint-2026_0.pdf), the FTC and 22 states as plaintiffs and the soft reserve allegations on Sponsored Products, including winning-bid pricing close to 80% of the time

**Filings**

- [Amazon.com: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), quarterly advertising services revenue for 2025
- [Amazon.com: Third quarter 2026 results](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000038/amzn-20260930xex991.htm), the launch of Amazon Ads Agent and Full-Funnel Campaigns
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), advertising revenue recognized as ads are delivered by clicks or impressions
- [Walmart: Fourth quarter fiscal 2026 earnings release](https://www.sec.gov/Archives/edgar/data/104169/000010416926000032/earningsreleasefy26q4.htm), global advertising of nearly $6.4 billion including VIZIO, and advertising in net sales or as a reduction of cost of sales
- [Maplebear (Instacart): Fourth quarter 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000006/cartfourthquarter2025sha.htm), advertising and other revenue, active brands, Carrot Ads partners and retailers using it as their network, offsite partners and Data Hub
- [Criteo: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1576427/000157642726000004/exhibit991q42025.htm), Retail Media contribution ex-TAC
- [DoorDash: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000012/prodq4dashex991-pressrelea.htm), Smart Campaigns and the growth in advertising partners through Symbiosis

**Reference**

- [IAB: Digital ad revenue climbs to nearly $300B (April 16, 2026)](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), US commerce media in 2025 and its growth

**In practice**

- [Amazon: Amazon's response to the FTC's lawsuit regarding Sponsored Ads](https://www.aboutamazon.com/md/company-news/amazon-ftc-sponsored-ads-lawsuit-response), the generalized second-price auction since 2006, hard and soft reserves, relevance-weighted ranking and Amazon's denial
- [Amazon Ads: Sponsored Products](https://advertising.amazon.com/solutions/products/sponsored-products), eligible categories and Featured Offer eligibility
- [Amazon Ads: Sponsored Brands](https://advertising.amazon.com/solutions/products/sponsored-brands), CPC, vCPM and reserved share of voice with a minimum commitment
- [eBay Developers: Promoted Listings overview](https://developer.ebay.com/api-docs/sell/static/marketing/pl-overview.html), Priority cost per click by second-price auction
- [Chase: Chase launches Chase Media Solutions (April 3, 2024)](https://media.chase.com/news/chase-launches-chase-media-solutions), the media business, its customer reach, cash-back offers and the Figg acquisition
