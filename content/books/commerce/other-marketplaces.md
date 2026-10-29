+++
title = "Walmart, eBay, Etsy, TikTok Shop & Others"
nav_title = "Other Marketplaces"
description = "Walmart, eBay, Etsy, TikTok Shop, Target Plus, Best Buy, Mercado Libre, Temu and Shein compared: who can sell, fees, fulfillment, standards and payouts."
category = "Commerce Industry"
order = 2329
part = "Marketplaces"
tags = ["commerce", "marketplaces", "walmart", "ebay", "etsy", "tiktok-shop", "data-model"]
+++

Amazon is the marketplace every brand starts with, and rarely the only one. A brand that sells on Amazon usually adds Walmart Marketplace next, then eBay for refurbished and open-box units, TikTok Shop for products that sell on video, and a retailer's curated marketplace (Target Plus, Best Buy) where it can get in; a maker sells on Etsy; a brand selling in Latin America sells on Mercado Libre. Each marketplace has the same parts (an application, a fee schedule, a fulfillment program, performance standards, a return policy, a payout schedule and an API) and each sets them differently. The work for the software is to hold all of them as data, so that adding a channel is configuration and a fee change is a new row, not a release.

This chapter compares the product marketplaces other than Amazon, as of October 2026: who may sell, what they charge, how fulfillment works, what they measure and when they pay, plus the marketplaces that buy the goods instead (Temu's managed model, Wayfair's supplier model). It extends `listings` and `sales_channels` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Amazon is [Selling on Amazon](/books/commerce/selling-on-amazon); the fulfillment networks (WFS, MCF) are [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls); TikTok Shop's creator, affiliate and live-selling side is the User-Generated Platforms volume's [Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping); marketplaces of people and services (rentals, services, resale between individuals) are that volume's peer-to-peer part, from [Services Marketplaces](/books/user-generated-platforms/services-marketplaces); building a marketplace of your own is the later Running Your Own Marketplace chapter.

## How the Platforms Do It

As of October 2026, from each marketplace's seller pages, help centers and filings:

| Marketplace | Who may sell | Commission | Other fees | Fulfillment | Scale |
| --- | --- | --- | --- | --- | --- |
| **Walmart Marketplace** | Approved businesses with a US business tax ID and a record of e-commerce success | 15% most categories; 8% consumer electronics; 6% personal computers | "zero setup, monthly, or hidden fees" | Seller-fulfilled from a US warehouse, or Walmart Fulfillment Services (WFS) | Walmart's global advertising nearly $6.4 billion in fiscal 2026; marketplace growth cited, not quantified |
| **eBay** | Anyone, individual or business | Final value fee 13.6% of the sale up to $7,500 in most categories, 2.35% above | $0.30 or $0.40 per order; 250 free listings a month, then $0.35; Store subscriptions $4.95 to $2,999.95 a month | Seller-fulfilled | $79.6 billion GMV and 135 million active buyers in 2025 |
| **Etsy** | Sellers of items they make or design, vintage, and craft supplies | 6.5% transaction fee | $0.20 per listing; 3% + $0.25 US payment processing; Offsite Ads 12% to 15% on attributed orders | Seller-fulfilled | $10.5 billion marketplace GMS, 86.5 million active buyers and 5.6 million active sellers in 2025 |
| **TikTok Shop (US)** | US residents and entities 18 or older, and cross-border sellers based in Japan | 6% in most categories | Affiliate commissions the seller sets, 1% to 80% | Seller-fulfilled, or Fulfilled by TikTok (FBT) | Not disclosed in US filings |
| **Target Plus** | By invitation | Not published | Not published | Seller-fulfilled to Target's standards | "more than 1,200 partners"; about $1 billion of third-party digital sales in 2024, targeted above $5 billion by 2030 |
| **Best Buy Marketplace (US)** | Approved sellers | Not published | Not published | Seller-fulfilled; returns accepted in Best Buy stores | Launched August 19, 2025, "powered by Mirakl" |
| **Mercado Libre** | Sellers in 18 Latin American countries | By listing type and category | Fixed per-unit cost on low-priced items | Mercado Envios and fulfillment centers handling "more than half of shipments" | $65.0 billion GMV and 121 million unique active buyers in 2025 |
| **Temu** | Manufacturers and, since 2024, local sellers | Not published; in the managed model Temu sets the price | Not published | Temu's logistics, or the local seller's | Parent PDD's 2025 revenue $61.8 billion, Temu not broken out |
| **Shein Marketplace** | Third-party fashion and lifestyle sellers alongside Shein's own goods | Not published | Launch incentives with "no platform fees" for a period | Seller-fulfilled or Shein's | Not disclosed |

Three patterns run through the table:

- **Open, approved and invited.** eBay and Etsy let anyone list; Walmart and Best Buy approve each seller against published criteria; Target Plus invites. The tighter the door, the more the marketplace behaves like a retailer's buyer, choosing which brands and assortments it wants, and the more its standards read like a vendor agreement.
- **Commission is the headline, not the cost.** Etsy's 6.5% becomes 9.5% plus $0.25 with US processing and up to 15% more on an Offsite Ads order; eBay's 13.6% comes with a per-order fee, optional Store subscriptions and Promoted Listings. The comparable number is the fee as a share of the order's total, computed per order from all the lines ([Fee Models](/books/user-generated-platforms/pricing-and-fees#fee-models)).
- **Every marketplace has a fulfillment arm or wants one.** WFS, FBT, Mercado Libre's fulfillment centers and Amazon's FBA all trade lower fulfillment cost and a better badge for the seller's inventory in the marketplace's building. Walmart and Amazon now ship each other's orders from those buildings ([Marketplace networks are now 3PLs](/books/commerce/warehouses-and-3pls#how-the-platforms-do-it)).

## Walmart Marketplace

Walmart's marketplace sells third-party goods on Walmart.com beside Walmart's own inventory, and it approves every seller. Its minimum qualifications, updated September 2, 2026, are a "Business Tax ID(s) or Business License Number (SSN is not accepted)," a personal ID, documents that verify the business's name and address, a "History of Marketplace or eCommerce success," and "A B2C U.S. warehouse with returns capability and ability to adhere to our Seller Performance Standards, or use Walmart Fulfillment Services (WFS)." There is no monthly fee; the referral fee is 15% in most categories, 8% for consumer electronics and 6% for personal computers.

**Pricing rules.** Walmart's marketplace polices prices directly. Its pricing rules "will automatically unpublish offers from Walmart Marketplace that are priced egregiously higher" than prices elsewhere, with the reason code "Reasonable Price Not Satisfied"; offers "priced substantially higher than prices currently or recently offered on Walmart.com" lose Buy Box eligibility; and an "Egregious Shipping Cost" rule can unpublish an offer or make it ineligible for the Buy Box. A seller's price change on another channel can therefore unpublish its Walmart offer, so the pricing engine has to know each channel's rules before it moves a price ([Selling on Amazon](/books/commerce/selling-on-amazon#ftc-v-amazon) shows why price-parity rules are also an antitrust question).

**Returns.** Sellers must offer a "minimum return window of 30 days, which begins seven days after an item's ship date"; they "may not apply restocking fees to customers except for eligible items set up with return exemptions" (up to 20% for exempt items returned not in sellable condition) and "may not apply return shipping charges to customers"; and "Walmart will accept eligible Marketplace items returned to Walmart stores on your behalf," oversized and freight items excepted. A store return of a marketplace item is a return the seller learns about from Walmart, received at a location it doesn't run ([Returns in Store](/books/commerce/omnichannel-fulfillment#returns-in-store)).

**Fulfillment.** WFS stores the seller's inventory and ships Walmart orders in "two days or less," with the fees and storage rates in [Walmart Fulfillment Services](/books/commerce/warehouses-and-3pls#walmart-fulfillment-services); Walmart says WFS rates "cost 15% less than other marketplace fulfillment providers." Its Multichannel Solutions ship other channels' orders from the same stock.

**Pro Seller.** Walmart's badge program has three tiers (Rising, Advanced, Pro), open to sellers with "More than 100 orders in the past 90 days," "Active for at least 90 days" and in compliance with its policies. Pro requires on-time delivery of 95% or more, cancellations of 1.5% or less, responsiveness of 95%, a shipping speed score of 50%, a content quality score of 75% and a price competitiveness score of 75%; Advanced and Rising relax on-time delivery to 92.5% and 90% and cancellations to 2.0% and 2.5%.

**Money and APIs.** "Settlement cycles occur bi-weekly on alternate Fridays," and "All Marketplace orders are eligible for payment holds seven or more days after the order has been shipped or delivered." The Marketplace APIs cover "items, inventory, orders, pricing, promotions, reporting, and other operational workflows," authenticated with OAuth 2.0 client credentials whose tokens last 15 minutes; item setup is by feed against Walmart's item spec ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#walmart-item-spec)).

## eBay

eBay is an open marketplace of individuals and businesses, new and used, auction and fixed price, where 51% of 2025's "nearly $80 billion in GMV" was generated outside the United States. Its 10-K names its focus categories as "motor vehicles parts and accessories, collectibles, refurbished items, apparel," which is why brands use it for refurbished, open-box and returned stock that can't be sold as new on other channels.

**Fees.** The final value fee in most categories is "13.6% on total amount of the sale up to $7,500 calculated per item" plus "2.35% on the portion of the sale over $7,500," and a per-order fee of $0.30 on orders of $10.00 or less and $0.40 above. Categories differ: 15.3% for books, movies and music; 15% up to $2,000 then 9% for women's bags and handbags; 15% up to $5,000 then 9% for jewelry and watches; 13.25% for trading cards and coins; 8% with no per-order fee for athletic shoes at $150 or more. The first 250 listings a month are free, then $0.35 each.

**Stores.** A Store subscription lowers fees and raises free listings:

| Store | Monthly (billed monthly / yearly) | Free listings | Final value fee, most categories |
| --- | --- | --- | --- |
| Starter | $7.95 / $4.95 | 250 | 13.6% up to $7,500 |
| Basic | $27.95 / $21.95 | 1,000 fixed price | 12.7% up to $2,500, then 2.35% |
| Premium | $74.95 / $59.95 | 10,000 | 12.7% up to $2,500, then 2.35% |
| Anchor | $349.95 / $299.95 | 25,000 | 12.7% up to $2,500, then 2.35% |
| Enterprise | Yearly only, $2,999.95 | 100,000 | 12.7% up to $2,500, then 2.35% |

**Seller levels.** eBay evaluates sellers monthly on the 20th as Top Rated, Above Standard or Below Standard, over the last three months for sellers with more than 400 transactions and twelve months otherwise. Above Standard requires a transaction defect rate of 2% or less and no more than 0.3% (or 2) cases closed without seller resolution. Top Rated adds a defect rate of 0.5% or less, late shipments of no more than 3% (or 5), tracking uploaded on 95% of transactions, 90 days of activity and 100 transactions and $1,000 of US sales over twelve months; Top Rated Plus listings (same-day or one-business-day handling and free returns for 30 days or longer) earn "10% off final value fees."

**Buyer protection and APIs.** The eBay Money Back Guarantee "covers your purchase price plus original shipping on eligible purchases," with eBay stepping in if the seller hasn't resolved a problem "after three business days." The Inventory API is "used to create and manage inventory item records" and to "convert these inventory items into product offers on eBay marketplaces," with separate Sell APIs for fulfillment, finances and marketing.

## Etsy

Etsy restricts what may be sold rather than who sells it. Its creativity standards allow items the seller made or designed, curated vintage and items from nature, and craft and party supplies; mass-produced resale is not allowed. <!-- source-gap: etsy-creativity-standards | missing | Etsy creativity standards labels (made, designed, handpicked, sourced) and the vintage age rule | closes with: etsy.com/legal/creativity readable without a block | checked: 2026-10-28 -->

**Fees.** A listing costs "$0.20 USD per listing"; "Etsy charges 6.5% of the total order amount" as a transaction fee; US payment processing is 3% + $0.25 "in addition to the 6.5% transaction fee"; and Offsite Ads charge 15% (12% above $10,000 a year) on orders they're credited with, capped at $100 ([Marketplace Ads Elsewhere](/books/commerce/retail-media#marketplace-ads-elsewhere)). Etsy's 2025 take rate, revenue over GMS, was 24.2%, up from 22.3% in 2024, because services (ads, shipping labels, subscriptions) grew faster than the commission.

**Star Seller.** Etsy's recognition program asks sellers to "Reply to 95% of first messages in a thread within 24 hours," ship "95% of orders ship on time, with valid tracking or a shipping label purchased on Etsy (when required)," and hold a 4.8 rating or better. The floor every seller must meet is lower: 80% of messages answered within 24 to 48 hours, "At least 80% of orders ship on time," and a case rate under 1% (or three cases for shops under 300 orders).

**Scale and API.** The Etsy marketplace had $10,460.7 million of GMS, "86.5 million active buyers and 5.6 million active sellers" in 2025; Etsy sold Reverb on June 2, 2025 and agreed on February 15, 2026 to sell Depop to eBay "for $1.2 billion in cash." Its Open API v3 is "a REST API that extends support for inventory, sales orders, and shop management," and "Applications that access private member data must use OAuth authentication." Etsy's sellers are mostly individuals and very small businesses, which makes it a goods marketplace with the payee, tax-reporting and protection questions of the peer-to-peer platforms ([Who the Payee Is](/books/user-generated-platforms/paying-creators-and-sellers#who-the-payee-is)).

## TikTok Shop

TikTok Shop is a marketplace inside a video feed. As a seller channel it has the usual parts, and the User-Generated Platforms volume covers what is distinctive (shoppable videos, live selling, affiliate creators and their commissions) in [Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping). The seller-side summary, as of October 2026:

- **Who may sell.** The US terms cover "residents of and entities based in the United States of America and for cross-border sellers based in Japan," sellers must be 18 or older, and registration requires a US passport, driver's license, state ID or Permanent Resident Card ("all other types of ID verification will be rejected"), the last four digits of the authorized person's SSN or ITIN, and EIN proof for a business. The seller terms name TT Commerce & Global Services as the contracting entity; TikTok's US app itself is now run by the TikTok USDS Joint Venture.
- **Fees.** A referral fee of 6% in most categories (5% for fine jewelry and pre-owned goods), calculated on the customer's payment plus any platform discount, less tax, including the shipping the customer paid ([Referral Fees and Commissions](/books/user-generated-platforms/social-commerce-and-live-shopping#referral-fees-and-commissions)). Affiliate commissions are the seller's to set, from 1% to 80%.
- **Fulfillment.** Fulfilled by TikTok is "in-house service that handles storage, packing, and shipping" with "60 days of free storage" and a "3-day shipping service that covers over 80% of U.S orders." Seller-shipped orders must be marked In Transit within two business days, "Starting January 26, 2026," and a late dispatch rate above 10% brings enforcement ([Dispatch and Delivery Clocks](/books/user-generated-platforms/social-commerce-and-live-shopping#dispatch-and-delivery-clocks)).
- **Payouts.** Settlement runs from delivery, 31 days for introductory sellers down to 8, 5 or 1 day by Shop Performance Score tier ([Settlement Tiers and Reserves](/books/user-generated-platforms/social-commerce-and-live-shopping#settlement-tiers-and-reserves)).

## Retailers' Curated Marketplaces

Big-box retailers run marketplaces to extend the assortment online without buying the inventory, and they keep them selective because the retailer's name is on every order.

**Target Plus** is "invite-only," a "curated and carefully selected third-party marketplace" that "since its debut in 2019" has selected and vetted "more than 1,200 partners," adds "dozens of new, hand-picked brands" at a time, and since 2024 accepts applications from Shopify merchants through Shopify's Marketplace Connect. Target has said it wants to grow third-party digital sales "from approximately $1 billion in 2024 to more than $5 billion in 2030." Target doesn't publish Target Plus fees or partner standards. <!-- source-gap: target-plus-terms | missing | Target Plus commission rates, fulfillment and performance standards for partners | closes with: a Target-published partner page or agreement | checked: 2026-10-28 -->

**Best Buy Marketplace** launched in the US on August 19, 2025, "powered by Mirakl," "more than doubling our total assortment and tripling it in some areas," in categories such as seasonal décor, automotive tech, movies and music. "Customers can return products purchased through a Marketplace seller at their local Best Buy store." Best Buy's 10-K describes "new commission and advertising revenue, without requiring inventory investment" and plans to "continue to expand our third-party seller count"; its Canadian marketplace dates from 2016, with sellers "thoroughly vetted and approved by Best Buy." US commission rates and seller criteria aren't public. <!-- source-gap: best-buy-marketplace-terms | missing | Best Buy US Marketplace commission rates and seller criteria | closes with: a Best Buy or Mirakl-hosted seller page with terms | checked: 2026-10-28 -->

Mirakl's platform sits under many of these: Lowe's partnered with Mirakl for its marketplace (with returns at "any of Lowe's over 1,700 stores"), and Kroger Ship announced a Mirakl-powered marketplace in 2020. The retailer's side of that software, seller onboarding and commission rules, is the later Running Your Own Marketplace chapter. For the seller, a curated marketplace often connects through Mirakl's seller API or a feed tool rather than a bespoke integration ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#how-the-platforms-do-it)).

## Mercado Libre

Mercado Libre is the marketplace of Latin America: its "e-commerce platform is present in 18 countries," Brazil, Argentina and Mexico produced 95.6% of its 2025 net revenues and financial income, and its fintech arm, Mercado Pago, "processes and settles all transactions on our Marketplace" where it operates. Third-party sellers "account for most of the GMV," with first-party sales "less than 10% of GMV." In 2025 it reported $65,037 million of GMV, 121 million unique active buyers and 2,429 million items sold, and its fulfillment centers handle "more than half of shipments"; in Mexico, "fulfillment penetration reached a record high of nearly 80% in Q4'25."

Sellers choose a listing type per item (Classic and Premium in Brazil and Mexico), which sets the commission by category, with a fixed per-unit cost on low-priced items; the commission tables are on help pages I couldn't open for this edition. <!-- source-gap: mercado-libre-commissions | secondary | Mercado Libre Classic and Premium commission ranges by country and the fixed per-unit cost | closes with: Mercado Libre's official seller fee pages | checked: 2026-10-28 -->

For a US brand, Mercado Libre is a cross-border decision as much as a marketplace one: local tax registration or a cross-border program, local-currency pricing and import duties ([Cross-Border Commerce](/books/commerce/cross-border-commerce#the-merchant-of-record)).

## Temu, Shein and the Managed Model

Temu and Shein grew by shipping individual parcels from China under the US de minimis exemption, and both have been changing their seller models as that door closed.

- **Temu,** launched "in September 2022" by PDD Holdings, "empowers merchants with value-added services." Its original model is often described as fully managed: suppliers consign goods, and Temu sets the retail price and handles logistics; in 2024 it added a semi-managed model and a local seller program in which sellers hold stock in the destination country and fulfill orders themselves. Those descriptions come from secondary sources; PDD's annual report doesn't name the models. <!-- source-gap: temu-seller-models | secondary | Temu fully managed, semi-managed and local seller programs: who sets price, who fulfills, commissions | closes with: a Temu seller-center page or PDD filing describing each model | checked: 2026-10-28 -->
- **Shein** launched a "global, integrated, fashion and lifestyle marketplace ("SHEIN Marketplace")" in 2023, beside its own on-demand fashion business, with incentives including "no platform fees and limited period waivers of commissions."
- **De minimis.** "Effective May 2, 2025, this exemption ceased to apply for imports from China and Hong Kong," and "Effective August 29, 2025, this exemption was eliminated for imports from all countries," as PDD's 20-F records; CBP reported collecting "over $1 billion in duties" on "over 246 million low-cost shipments" by December 2025. PDD expected higher prices and "reduced order volumes." That shift is what pushes both companies toward local sellers and local stock ([Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties)).
- **The EU.** The European Commission designated Shein (April 26, 2024) and Temu (May 31, 2024) as Very Large Online Platforms under the Digital Services Act, fined Temu "€200 million" on May 28, 2026 for failing "to diligently identify, analyse, and assess the systemic risks" of illegal products, and opened formal proceedings against Shein on February 17, 2026 over "sale of illegal products," "addictive design" and the "transparency of the recommender systems."

The managed model is the inverse of a marketplace: like a 1P retailer, the platform sets the price and runs logistics, but like a marketplace it never takes the goods into a retail balance sheet in the usual way. For the brand or factory it's a wholesale relationship with a very demanding buyer; for the software it's purchase orders and inbound shipments, not listings and settlements.

## Supplier Models That Look Like Marketplaces

Some sites sell many brands' goods without being marketplaces at all. Wayfair is the clearest: a supplier's "base cost is the starting price at which you sell your products to Wayfair," Wayfair "sets the retail price on-site," "Drop-shipping is Wayfair's primary method of fulfillment" (with its CastleGate warehouses as the alternative), and Wayfair pays shipping on its own carrier accounts. To the supplier, that is drop-ship wholesale: Wayfair is the merchant of record, the supplier's order is a purchase order, and its records are a retailer's, with routing, ship notices and invoices ([Business Models & Unit Economics](/books/commerce/business-models#drop-ship); the later Drop Ship & Print on Demand and EDI chapters). The test for any new channel is the same: who sets the price, who is the merchant of record, and who pays whom. The answer decides whether the channel is a row in `listings` or in the wholesale tables.

## Performance Standards Compared

Every marketplace measures sellers on the same handful of things with different thresholds, windows and consequences. As of October 2026, for seller-fulfilled orders:

| Measure | Amazon | Walmart | eBay (Top Rated) | Etsy (floor) | TikTok Shop |
| --- | --- | --- | --- | --- | --- |
| Defects or negative feedback | Order Defect Rate under 1% over 60 days | Negative feedback 2% or less over 60 days | Transaction defect rate 0.5% or less | Case rate under 1% | Shop Performance Score |
| Cancellations | Under 2.5% over 7 days | 2% or less | Counted as defects | | 2.5% or less, seller fault |
| Late shipment | Under 4% over 10 and 30 days | 5% or less | 3% or less (or 5) | 80% shipped on time | Late dispatch enforcement above 10% |
| Valid tracking | Above 95% over 30 days | 99% or more | Tracking on 95% | Valid tracking for Star Seller | 95% or more |
| On-time delivery | Tracked, no deactivation threshold | 90% or more | | | 80% or more |
| Response to buyers | 48 hours on A-to-z claims | 95% within 48 hours | | 80% within 24 to 48 hours | |
| Other | Return dissatisfaction under 10% | Return rate 6% or less; item not received 2% or less | Cases closed without resolution 0.3% or less | Rating 4.8 or better for Star Seller | |

Walmart evaluates over "the last 30 days or 60 days," and missing its standards may lead to suppression, suspension or termination; eBay evaluates monthly; TikTok's late dispatch rule counts business days excluding weekends and federal holidays. The cells say the same thing differently, which is the modeling point: each standard is a metric definition (numerator, denominator, which date, which orders excluded), a threshold, a window and a consequence, stored per channel with a validity range, and the system computes its own estimate of each and compares it with what the channel reports ([Account Health](/books/commerce/selling-on-amazon#account-health), [Seller Performance Scores](/books/user-generated-platforms/social-commerce-and-live-shopping#seller-performance-scores)).

## Payouts Compared

| Marketplace | When the seller is paid |
| --- | --- |
| Amazon | Settlements "every two weeks," with proceeds held until seven days after delivery |
| Walmart | Bi-weekly "on alternate Fridays," with orders eligible for payment holds seven or more days after shipment or delivery |
| TikTok Shop | 1 to 31 days after delivery by settlement tier, with reserves for some shops |

Every one of these pays from delivery rather than from the sale, holds reserves at its discretion and nets fees, refunds and adjustments before paying, which makes them rolling reserves in the Payments volume's sense (eBay's and Etsy's payout pages weren't readable for this edition) ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)). The seller's cash forecast is a function of delivery dates and each channel's rule, and the settlement import is the same job everywhere: lines to orders, fees to expected fees, the total to the deposit ([Settlements and the Money](/books/commerce/selling-on-amazon#settlements-and-the-money)).

## How to Build It

Every marketplace is a `sales_channels` row; the seller's account on it is a `connected_systems` row; each item offered is a `listings` row. What differs per marketplace is data with dates: the fee schedule, the listing requirements and the performance standards. This chapter adds those three:

```sql
ALTER TABLE sales_channels DROP CONSTRAINT sales_channels_kind_check;
ALTER TABLE sales_channels ADD CONSTRAINT sales_channels_kind_check CHECK (kind IN
  ('marketplace', 'first_party', 'pos', 'phone', 'kiosk', 'wholesale', 'drop_ship'));
ALTER TABLE sales_channels
  ADD COLUMN merchant_of_record TEXT NOT NULL DEFAULT 'marketplace' CHECK (merchant_of_record
               IN ('merchant', 'marketplace', 'retailer')),  -- Wayfair is 'retailer'
  ADD COLUMN price_set_by       TEXT NOT NULL DEFAULT 'merchant' CHECK (price_set_by IN
               ('merchant', 'channel')),                      -- Temu managed, Wayfair, 1P
  ADD COLUMN access             TEXT NOT NULL DEFAULT 'open' CHECK (access IN ('open',
               'approval', 'invitation')),
  ADD COLUMN payout_rule        JSONB NOT NULL DEFAULT '{}';  -- e.g. {"from": "delivery", "days": 7}

CREATE TABLE marketplace_fee_schedules (  -- every fee a channel charges, versioned
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id    TEXT NOT NULL REFERENCES sales_channels (id),
  fee_kind      TEXT NOT NULL CHECK (fee_kind IN ('referral', 'final_value', 'transaction',
                  'per_order', 'listing', 'processing', 'subscription', 'closing',
                  'advertising', 'fulfillment', 'storage')),
  plan          TEXT NOT NULL DEFAULT '',  -- e.g. eBay 'store_basic'; '' = no plan
  category      TEXT NOT NULL DEFAULT '',  -- the channel's fee category; '' = default
  base          TEXT[] NOT NULL,           -- line kinds in the base: '{item,shipping}'
  shape         TEXT NOT NULL CHECK (shape IN ('flat', 'whole_price', 'marginal')),
  from_amount   BIGINT NOT NULL DEFAULT 0, -- band lower bound, minor units
  rate_bp       INT,                       -- basis points
  fixed_amount  BIGINT,                    -- per item, order, listing or month
  min_amount    BIGINT,
  max_amount    BIGINT,                    -- e.g. Etsy Offsite Ads $100 cap
  currency      CHAR(3) NOT NULL,
  source_url    TEXT NOT NULL,             -- the page the row was read from
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (channel_id WITH =, fee_kind WITH =, plan WITH =, category WITH =,
                      from_amount WITH =, valid_during WITH &&)
);

CREATE TABLE listing_requirements (       -- what a channel needs before an item can list
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id     TEXT NOT NULL REFERENCES sales_channels (id),
  scope          TEXT NOT NULL CHECK (scope IN ('account', 'category', 'brand', 'item')),
  category       TEXT,                     -- the channel's category, for category scope
  requirement    TEXT NOT NULL,            -- 'approval', 'gtin', 'brand_authorization',
                                           -- 'safety_document', 'business_tax_id', ...
  detail         JSONB NOT NULL DEFAULT '{}',
  valid_during   TSTZRANGE NOT NULL
);

CREATE TABLE channel_approvals (          -- a requirement met, by this merchant, with evidence
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  requirement_id      UUID NOT NULL REFERENCES listing_requirements (id),
  status              TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected',
                        'revoked')),
  evidence_document_id UUID REFERENCES documents (id),  -- invoices, certificates, letters
  decided_at          TIMESTAMPTZ,
  PRIMARY KEY (connected_system_id, requirement_id)
);

CREATE TABLE performance_standards (      -- each channel metric as the channel defines it
  channel_id     TEXT NOT NULL REFERENCES sales_channels (id),
  metric         TEXT NOT NULL,            -- 'defect_rate', 'cancel_rate', 'late_ship_rate', ...
  definition     TEXT NOT NULL,            -- numerator, denominator, date basis, exclusions
  comparator     TEXT NOT NULL CHECK (comparator IN ('lt', 'lte', 'gt', 'gte')),
  threshold_bp   INT NOT NULL,
  window_days    SMALLINT NOT NULL,
  consequence    TEXT NOT NULL,            -- 'suppression', 'deactivation', 'badge', 'none'
  program        TEXT NOT NULL DEFAULT '', -- '' = baseline; 'pro_seller', 'top_rated', 'star_seller'
  valid_during   TSTZRANGE NOT NULL,
  PRIMARY KEY (channel_id, metric, program, valid_during)
);
```

A fee estimate for an order is then a query over the schedule in force when it was placed, for the order's lines:

```sql
-- Expected marketplace fees for one order line, from the schedule in force at the sale.
SELECT f.fee_kind,
       CASE f.shape
         WHEN 'flat' THEN f.fixed_amount
         WHEN 'whole_price' THEN GREATEST(COALESCE(f.min_amount, 0),
              (b.base_amount * f.rate_bp) / 10000)
         WHEN 'marginal' THEN (GREATEST(b.base_amount - f.from_amount, 0)
              * f.rate_bp) / 10000      -- summed across bands by the caller
       END AS expected_fee
FROM order_lines l
JOIN orders o ON o.id = l.order_id
CROSS JOIN LATERAL (SELECT l.amount + COALESCE((SELECT SUM(c.amount) FROM order_charges c
                     WHERE c.order_line_id = l.id AND c.kind = 'shipping_fee'
                       AND c.payer = 'customer'), 0) AS base_amount) b
JOIN marketplace_fee_schedules f
  ON f.channel_id = o.channel_partner
 AND f.valid_during @> o.placed_at
 AND f.category = :fee_category
WHERE l.id = :order_line_id;
```

Design notes:

- **Every rule row cites its page.** `source_url` and the validity range are what let a person check the schedule against the marketplace's page when a settlement disagrees, and what makes a fee change a new row instead of an edit ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Bases are line kinds.** TikTok's base adds back platform discounts, eBay's and Amazon's include shipping, Whatnot's excludes it; storing the base as the list of line kinds it sums keeps one engine for all of them.
- **Requirements are checked before listing.** A listing job reads `listing_requirements` and `channel_approvals` and refuses to submit an item to a gated category the account isn't approved for; the channel's rejection is a backstop, not the check.
- **Standards are definitions, not numbers.** The metric's definition and window are stored with its threshold, and the system's own computation of it is recorded beside the channel's reported value ([Seller Performance Scores](/books/user-generated-platforms/social-commerce-and-live-shopping#seller-performance-scores)).
- **The channel row says who sets the price and who is merchant of record.** That one pair decides whether an order from the channel produces a settlement (marketplace) or an invoice and a payment on terms (retailer or managed model).

## Auditing

- **Every fee schedule version,** with the page it was read from and the date it took effect, and every settlement variance it explained.
- **Every approval,** for an account, category or brand, with the evidence submitted and the decision.
- **Every standard and every evaluation:** the channel's reported metric with its window, the system's own computation, and any consequence (a lost badge, a suppression, a hold).
- **Every price change that crossed a channel's pricing rule,** such as a Walmart unpublish for an unreasonable price, with the prices elsewhere at the time.

## What This Means for the System You Build

- **Make each marketplace a channel row with its merchant of record, price setter, access type and payout rule,** so a new marketplace is configuration.
- **Store fee schedules as dated rows with their shape (flat, whole-price band, marginal band), base and source,** and compute expected fees per order line.
- **Check gating and requirements before submitting a listing,** and keep approvals with their evidence.
- **Model performance standards as definitions with windows and thresholds,** compute them yourself and compare with each channel's number.
- **Know each channel's pricing rules** before moving a price anywhere, because a price on one channel can unpublish an offer on another.
- **Treat managed and supplier models as wholesale,** with purchase orders and invoices, not listings and settlements.
- **Forecast cash from delivery dates and each channel's payout rule.**

## References

**Walmart Marketplace**

- [Walmart Marketplace: Referral fees](https://marketplace.walmart.com/referral-fees/), no setup or monthly fees and referral fees by category
- [Walmart Marketplace Learn: Before you start selling (updated September 2, 2026)](https://marketplacelearn.walmart.com/guides/Getting%20started/Onboarding/Before-you-start-selling-on-Walmart-Marketplace), minimum qualifications
- [Walmart Marketplace Learn: Seller performance standards (updated July 28, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Performance/Seller-performance-standards), thresholds, windows and consequences
- [Walmart Marketplace: Pro Seller badge](https://marketplace.walmart.com/pro-seller-badge/), tiers, thresholds and eligibility
- [Walmart Marketplace Learn: Pricing rules (updated December 12, 2025)](https://marketplacelearn.walmart.com/guides/Catalog%20management/Price%20management/Pricing-rules), unpublishing for unreasonable prices, Buy Box ineligibility and shipping cost rules
- [Walmart Marketplace Learn: Returns policy (updated August 31, 2026)](https://marketplacelearn.walmart.com/guides/Policies%20&%20standards/Orders%20&%20returns/returns-policy), the 30-day minimum, restocking and shipping charges, and store returns
- [Walmart Marketplace Learn: Payment activities (updated September 24, 2026)](https://marketplacelearn.walmart.com/guides/Taxes%20&%20payments/Payments/Payment-activities), bi-weekly settlements and payment holds
- [Walmart Marketplace: Walmart Fulfillment Services](https://marketplace.walmart.com/walmart-fulfillment-services/), two-day shipping and the 15% lower cost claim
- [Walmart Developer: Introduction to Marketplace APIs (updated July 30, 2026)](https://developer.walmart.com/us-marketplace/docs/introduction-to-marketplace-apis), API scope, OAuth 2.0 and 15-minute tokens
- [Walmart: Fourth quarter fiscal 2026 earnings release (February 19, 2026)](https://stock.walmart.com/sec-filings/all-sec-filings/content/0000104169-26-000032/earningsreleasefy26q4.htm), global advertising and eCommerce growth

**eBay**

- [eBay: Selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4364), final value fees by category, per-order fees and insertion fees
- [eBay: Store selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/store-selling-fees?id=4122), Store subscriptions, free listings and Store final value fees
- [eBay: Seller performance policy](https://www.ebay.com/help/policies/selling-policies/seller-performance-policy?id=4347), seller levels, evaluation windows and thresholds, and Top Rated Plus
- [eBay: Money Back Guarantee](https://pages.ebay.com/ebay-money-back-guarantee/), coverage and the three-business-day step-in
- [eBay Developers: Inventory API overview](https://developer.ebay.com/api-docs/sell/inventory/overview.html), inventory items and offers
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), active buyers, live listings, GMV and its share outside the US, focus categories and the Depop agreement

**Etsy**

- [Etsy Help: Etsy fee basics](https://help.etsy.com/hc/en-us/articles/360035902374-Etsy-Fee-Basics), listing and transaction fees
- [Etsy Help: Payment processing fees](https://help.etsy.com/hc/en-us/articles/115015628847), the US rate
- [Etsy Help: Offsite Ads](https://help.etsy.com/hc/articles/360000338367), fees, cap and threshold
- [Etsy Help: Star Seller](https://help.etsy.com/hc/articles/29654393638679), Star Seller targets and the customer service floor
- [Etsy Developers: Open API v3](https://developers.etsy.com/documentation/), API scope and OAuth
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), GMS, active buyers and sellers, take rate and the Reverb and Depop sales

**TikTok Shop**

- [TikTok Shop Academy: US seller terms (updated October 15, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=1331308753078058), eligibility, the contracting entity and referral fee basis
- [TikTok Shop Academy: Registration documents (updated May 12, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=3460256793413390&lang=en), accepted IDs, SSN or ITIN digits and EIN proof
- [TikTok Shop Academy: Referral fees (updated October 8, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en), rates by category and the fee base
- [TikTok Shop Academy: Late dispatch rate (updated September 16, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=3668989549299511&lang=en), the two-business-day rule from January 26, 2026 and enforcement above 10%
- [TikTok Shop Academy: Settlement tiers (updated August 10, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=1167036928444174&lang=en), days after delivery by tier
- [TikTok Shop Academy: Fulfilled by TikTok (updated August 6, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=8644984183162670&lang=en), FBT storage and three-day shipping
- [TikTok Shop Academy: Affiliate commissions (updated July 16, 2026)](https://seller-us.tiktok.com/university/essay?knowledge_id=6837873164896001&lang=en), the 1% to 80% range
- [TikTok USDS Joint Venture](https://usdsjv.tiktok.com/), the US joint venture

**Retailers' marketplaces**

- [Target: Target Plus growth (July 1, 2026)](https://corporate.target.com/news-features/article/2026/07/target-plus-growth), invite-only and hand-picked brands
- [Target: Target Plus and Shopify (June 24, 2024)](https://corporate.target.com/news-features/article/2024/06/target-plus-shopify), 1,200 partners since 2019 and applications through Shopify
- [Target: Strategic plans to drive more than $15 billion in sales growth by 2030 (March 4, 2025)](https://corporate.target.com/press/release/2025/03/target-announces-strategic-plans-to-drive-more-than-$15-billion-in-sales-growth-by-2030), third-party digital sales of about $1 billion in 2024 and the $5 billion goal
- [Best Buy: Best Buy Marketplace (August 19, 2025)](https://corporate.bestbuy.com/2025/marketplace/), the Mirakl-powered launch and store returns
- [Best Buy: Marketplace Q&A (August 19, 2025)](https://corporate.bestbuy.com/2025/marketplace-qa/), assortment growth
- [Best Buy: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/764478/000076447826000009/bby-20260131.htm), commission and advertising revenue without inventory investment, and the Canadian and US platforms
- [Best Buy Canada: What is Best Buy Marketplace (October 7, 2021)](https://blog.bestbuy.ca/best-buy/what-is-best-buy-marketplace), the 2016 launch and vetted sellers
- [Mirakl: Lowe's partners with Mirakl (May 21, 2025)](https://www.mirakl.com/blogs/marketplace/lowes-partners-with-mirakl-to-accelerate-its-online-marketplace/), returns at Lowe's stores
- [Mirakl: Kroger Ship to integrate a marketplace (August 11, 2020)](https://www.mirakl.com/news/kroger-ship-to-integrate-a-marketplace-this-fall), the Kroger marketplace
- [Wayfair: Beginner's guide for suppliers](https://sell.wayfair.com/start-beginners-guide), base cost, Wayfair-set retail prices, drop-ship and CastleGate

**Mercado Libre, Temu and Shein**

- [MercadoLibre: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1099590/000109959026000006/meli-20251231.htm), countries, third-party share of GMV, fulfillment, Mercado Pago and revenue concentration
- [MercadoLibre: Fourth quarter and full year 2025 results (February 24, 2026)](https://www.sec.gov/Archives/edgar/data/1099590/000109959026000003/meli-20260224xex991.htm), GMV, unique active buyers, items sold and Mexico fulfillment penetration
- [PDD Holdings: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/0001737806/000110465926050727/pdd-20251231x20f.htm), Temu's launch and services, revenue and the end of de minimis
- [CBP: Ready to enforce the end of the de minimis loophole (August 29, 2025)](https://www.cbp.gov/newsroom/national-media-release/cbp-ready-enforce-end-de-minimis-loophole-securing-borders-and), the global suspension and package volumes
- [CBP: $1 billion collected since the end of de minimis (December 17, 2025)](https://www.cbp.gov/newsroom/national-media-release/cbp-collects-1-billion-end-de-minimis-loophole), duties and shipments since May 2, 2025
- [European Commission: Temu designated a Very Large Online Platform (May 31, 2024)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/24/3047&language=en), the Temu and Shein designations
- [European Commission: Temu fined €200 million (May 28, 2026)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/26/1178&language=en), the DSA fine and timeline
- [European Commission: Formal proceedings against Shein (February 17, 2026)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/26/420&language=en), the scope of the proceedings
- [Shein: AcceleraSHEIN and the marketplace roll-out (June 22, 2023)](https://sheingroup.com/newsroom/shein-launches-accelerashein-to-empower-marketplace-sellers-continues-global-roll-out-of), the Shein Marketplace and its seller incentives
