+++
title = "The Commerce Landscape"
description = "Commerce platforms, marketplaces, point of sale, OMS, WMS and ERP, app ecosystems, US e-commerce size from the Census, and who owns whom as of October 2026."
category = "Commerce Industry"
order = 2302
part = "The Business"
tags = ["commerce", "platforms", "marketplaces", "point-of-sale", "market-size"]
+++

A commerce business runs on a stack of systems, most of them bought: a platform that holds the catalog and takes orders, marketplaces that take orders for it, a point of sale in its stores, an order management system that decides where each order ships from, a warehouse system or a 3PL that ships it, a tax engine, a payment provider, an ERP that keeps the books, and dozens of apps around the edges. Every one of them keeps its own copy of the product, the order and the customer, and the work of commerce engineering is mostly keeping those copies agreeing.

The market for each layer has a few large vendors and a long tail, and it moves: platforms are bought, renamed and taken private, open-source projects change licenses, and marketplaces change what they charge. This chapter maps the layers and the companies in each, sizes US e-commerce from the Census Bureau and the filings, records who owns whom as of October 2026, and ends with when to build any of it. It adds `connected_systems` to [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from filings, vendor pricing pages and official releases:

| Platform | Class | Ownership | Scale (latest reported year) | How it charges |
| --- | --- | --- | --- | --- |
| **Shopify** | Hosted SaaS, from small stores to enterprise (Plus); headless through its Storefront API | Public (NASDAQ and TSX) | $378.4 billion GMV and $11.56 billion revenue in 2025; merchants in over 175 countries, 44% in the US | Plans from $39 a month (monthly billing) to Plus from $2,300; card processing through Shopify Payments, with a fee for using another provider |
| **Commerce.com (BigCommerce)** | Hosted SaaS, open APIs, headless; Feedonomics for feeds | Public (CMRC); renamed from BigCommerce on July 31, 2025 | $342.3 million revenue in 2025 | Plans from $39 a month to Performance from $1,499, with sales caps per plan and a fee for some payment providers |
| **Salesforce Commerce Cloud** | Enterprise SaaS suite | Salesforce, since acquiring Demandware in July 2016 | Not reported separately | Contract |
| **Adobe Commerce (Magento)** | Enterprise suite, self-hosted or on Adobe's managed cloud; Magento Open Source free | Adobe, since June 2018 | Not reported separately | Contract; the open-source edition is free to run yourself |
| **commercetools** | Headless, API-first enterprise platform | Private | Not reported | Contract |
| **WooCommerce** | Open-source plugin for WordPress, self-hosted or on managed WordPress hosts | Automattic, since 2015 | Not reported | Free plugin; paid extensions; WooPayments at 2.9% + $0.30 for US cards |
| **Wix** | Hosted website builder with commerce plans | Public (NASDAQ) | $1.99 billion revenue in 2025, of which $255.0 million transaction revenue | Subscription plus payments |
| **Squarespace** | Hosted website builder with commerce plans | Permira, private since October 2024 | Not reported since | Plans from $25 a month; a 2% transaction fee on the lowest plan only |
| **Medusa** | Open-source headless commerce in Node.js and TypeScript; Medusa Cloud hosting | Private company; MIT-licensed core | Not reported | Free to self-host; Cloud from $29 a month with no GMV fee |
| **Saleor** | Open-source, GraphQL-only headless commerce in Python and Django; Saleor Cloud | Private company; BSD-3-Clause | Not reported | Free to self-host; Cloud from $1,599 a month up to $200,000 monthly GMV, then 0.8% |
| **Sylius** | Open-source commerce framework on Symfony (PHP) | In the cyber_Folks group with PrestaShop, as cyber_Folks describes it; MIT-licensed | Not reported | Free |
| **Spree** | Open-source headless commerce on Ruby on Rails | Spree Commerce; core back to BSD-3-Clause in 2026 | Not reported | Free core; paid enterprise edition |
| **PrestaShop** | Open-source store software in PHP, popular in Europe | cyber_Folks, after a 100% acquisition | Not reported | Free; paid modules and hosting |

Four patterns run through the table:

- **Payments are the revenue.** Shopify's merchant solutions (mostly payments) were $8.80 billion of its $11.56 billion revenue in 2025, and 65.6% of its GMV ran through Shopify Payments; Wix reports transaction revenue as its own line. A hosted platform's plan fee is the smaller number, and the fee for using another payment provider is how platforms steer merchants to their own ([Payments for Software Platforms](/books/payments/software-platforms)).
- **"Headless" is a feature everywhere and a product at a few.** Shopify, Commerce.com and Adobe all offer storefront APIs; commercetools, Medusa and Saleor are built so there is no storefront except the one you write.
- **The open-source projects are businesses.** Each has a company selling hosting, support or an enterprise edition, and license terms move with that business: Spree went to AGPL-3.0 in version 4.10 and returned to BSD-3-Clause in 2026.
- **Enterprise suites don't publish prices or scale.** Salesforce and Adobe report commerce inside larger clouds, and commercetools is private, so comparisons among them rest on analyst reports and customer lists rather than filings.

## Platforms by Class

**Hosted SaaS.** The vendor runs everything (servers, upgrades, security, PCI scope for the checkout) and the merchant configures a store in an admin and extends it with apps and themes. Shopify, Commerce.com, Wix and Squarespace are the US leaders. The trade is control: the checkout, the data model and the API limits are the vendor's, and extending past them means an app running on someone else's servers. Shopify's 10-K counts over 21,000 apps in its App Store.

**Enterprise suites.** Salesforce Commerce Cloud and Adobe Commerce sell to large retailers and brands with a contract, an implementation partner and integrations into the vendor's marketing, service and analytics clouds. Adobe Commerce can still be self-hosted, from the same codebase as the free Magento Open Source, and it is the heaviest of the self-hosted stores to operate ([Choosing & Hosting a Store](/books/commerce/choosing-a-platform#magento-and-adobe-commerce)).

**Headless and composable.** commercetools calls itself "the inventor and leader of headless commerce," a "cloud-native and API-first" platform; the merchant builds every storefront and joins best-of-breed services (search, content, promotions, tax) through APIs. Medusa, Saleor, Spree and Sylius are the open-source end of the same idea. Composable buys freedom over the front end and pays for it in integration work the hosted platforms do for you.

**Open source, self-hosted.** WooCommerce runs inside WordPress; PrestaShop and Magento Open Source are the PHP alternatives, Sylius the Symfony framework, Spree the Rails one, Medusa and Saleor the modern headless ones. The software is free; the servers, the patches, the security and the PCI scope are yours.

## Marketplaces

Marketplaces are the other half of where online orders are taken:

- **Amazon** runs both models at once: it sells from its own inventory (first party, $269.3 billion of online store sales in 2025) and lets third parties sell beside it ($172.2 billion of third-party seller services revenue, the commissions and fulfillment fees, not the sales themselves). Third-party sellers were 61% of paid units in the fourth quarter of 2025, and advertising, mostly sponsored listings, was another $68.6 billion. The details are in [Selling on Amazon](/books/commerce/selling-on-amazon).
- **eBay** reported $79.6 billion of GMV and $11.1 billion of revenue for 2025, and on February 18, 2026 agreed to buy Depop from Etsy for about $1.2 billion in cash, expected to close in the second quarter of 2026.
- **Walmart Marketplace, Target Plus, Etsy and TikTok Shop** each take third-party sellers on different terms: Walmart with no monthly fee and referral fees by category, Etsy with listing, transaction and processing fees ([How the Money Splits](/books/commerce/commerce-business#how-the-money-splits)); TikTok Shop inside a video feed ([Social Commerce & Live Shopping](/books/user-generated-platforms/social-commerce-and-live-shopping)).
- **Marketplace software.** Retailers that want a marketplace of their own buy one (Mirakl is one vendor) or build it; [Running Your Own Marketplace](/books/commerce/running-a-marketplace) covers both, and the User-Generated Platforms volume covers marketplaces of people and services ([Services Marketplaces](/books/user-generated-platforms/services-marketplaces)).

## Point of Sale

Stores and restaurants run on point-of-sale systems that are, increasingly, payments businesses with software attached ([Card-Present Payments](/books/payments/card-present#terminals-and-where-the-pos-sits)):

| System | Focus | Scale |
| --- | --- | --- |
| **Square (Block)** | Small and mid-size retail, restaurants and services | $250.5 billion Square gross payment volume in 2025 |
| **Toast** | Restaurants | $195.1 billion gross payment volume in 2025; about 164,000 locations |
| **Lightspeed** | Retail and hospitality, with a supplier network | $1.23 billion revenue in fiscal 2026 (year to March 31, 2026); sold Upserve to Skyview Equity |
| **Shopify POS** | Retailers selling online and in store on one catalog | Part of Shopify's GMV |
| **Clover (Fiserv)** | Small merchants through bank and processor channels | Reported inside Fiserv |

A POS is where a store's inventory, cash and staff are counted; [Point of Sale](/books/commerce/point-of-sale) and [Store Operations](/books/commerce/store-operations) cover them, and the delivery part covers how restaurant POS systems feed delivery apps ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#the-source-of-truth)).

## OMS, WMS and ERP

Behind the store, four kinds of system move and account for goods:

- **Order management (OMS).** Takes orders from every channel, decides which location ships each line, holds and edits orders, and tells channels when they shipped. [Order Management](/books/commerce/order-management) covers it, and [Inventory](/books/commerce/inventory) the counts it promises from. Every platform includes a basic one; enterprise brands buy a distributed OMS (Salesforce, Adobe, Manhattan, Fluent, Kibo and others) when orders come from many channels and ship from many places. Multichannel tools such as Rithum and Pattern sit between a brand and its marketplaces.
- **Warehouse management (WMS) and 3PLs.** A WMS directs receiving, putaway, picking and packing inside a building; a 3PL (ShipBob, ShipMonk and many regional ones) runs the building for the brand and exposes orders and stock through an API. Amazon's FBA and Multi-Channel Fulfillment and Walmart Fulfillment Services are fulfillment networks offered by marketplaces. [Warehouses, 3PLs & Fulfillment Networks](/books/commerce/warehouses-and-3pls) covers them.
- **Shipping.** Multi-carrier platforms (ShipStation, EasyPost, Shippo) buy labels across USPS, UPS, FedEx and regional carriers and return tracking. [Shipping & Carriers](/books/commerce/shipping-and-carriers) covers them.
- **ERP.** NetSuite, Microsoft Dynamics, SAP, Acumatica and, for small brands, QuickBooks keep the general ledger, inventory valuation, purchasing and the accounts receivable that wholesale customers pay into. In most mid-size brands the ERP is the system of record for items and costs and the commerce platform is the system of record for online orders, with an integration platform (Celigo and others) carrying records between them.

The pattern that matters for software: every object has one system of record, and the others hold copies with an external ID pointing back. Which system owns the item, the price, the stock count and the order is the first design decision in any commerce stack, and [ERP & Integrations](/books/commerce/erp-and-integrations) makes it explicit.

## App Ecosystems

Hosted platforms are extended by apps more than by code. A Shopify brand's stack typically adds a subscription app (Recharge, Skio), an email and SMS platform (Klaviyo, Attentive), a reviews app, a returns app (Loop), a shipping app, a tax engine where the platform's own isn't enough (Avalara), a fraud tool (Signifyd, Riskified) and a cross-border app (Global-e). Each app holds its own copy of orders and customers, reads and writes through the platform's API under rate limits, and listens to its webhooks.

Two consequences shape the whole volume. Data is spread across apps whose exports differ, which is the lock-in [Choosing & Hosting a Store](/books/commerce/choosing-a-platform#lock-in-and-the-way-out) weighs. And each app is code on the checkout or with access to customer data, which is the security and PCI surface [Store Security & PCI](/books/commerce/store-security-and-pci) covers.

## How Big It Is

The US Census Bureau's quarterly report is the standard measure of US retail e-commerce. For the second quarter of 2026, released August 18, 2026, it estimated adjusted e-commerce sales at $340.2 billion, 17.1% of total retail sales, up 3.8% from the first quarter and 12.2% from the second quarter of 2025. The third-quarter figure is due November 19, 2026, and the Bureau's page notes that later revisions supersede the release. Census counts sales by retailers of goods ordered online, whatever the platform, so it measures the market, not any vendor's share.

The company figures measure something else and don't add up to it: Shopify's $378.4 billion GMV and eBay's $79.6 billion are worldwide and include sales that are not retail in Census terms; Amazon reports revenue, not third-party sales volume. Treat each figure as that company's definition, the same caution [The Delivery Landscape](/books/commerce/delivery-landscape#take-rates-and-unit-economics) applies to delivery GOV.

## Who Owns Whom: Recent Moves

Dated facts age fast; this is the landscape as of October 2026, from each company's release, filing or the coverage cited:

| Date | Move | Why it matters |
| --- | --- | --- |
| May 19, 2015 | Automattic acquires WooThemes, the maker of WooCommerce | The largest open-source store becomes part of WordPress's parent company |
| July 11, 2016 | Salesforce completes its acquisition of Demandware, which becomes Commerce Cloud | Enterprise commerce joins a CRM suite |
| June 18, 2018 | Adobe acquires Magento | Open-source PHP commerce becomes Adobe Commerce, inside a marketing cloud |
| December 12, 2023 | CommerceHub renames itself Rithum, uniting ChannelAdvisor, Dsco and Cadeera | Marketplace listing and drop-ship networks consolidate |
| October 17, 2024 | Permira completes its take-private of Squarespace | A public site-and-store builder goes private |
| July 31, 2025 | BigCommerce renames itself Commerce.com | The platform repositions as a multi-brand company (BigCommerce, Feedonomics, Makeswift) |
| February 18, 2026 | eBay agrees to buy Depop from Etsy for about $1.2 billion | Resale marketplaces consolidate |
| 2026 | cyber_Folks reports completing a 100% acquisition of PrestaShop, jointly with Sylius and BitBag | Two open-source PHP platforms sit in one group |
| May 12, 2026 | Adobe releases Commerce 2.4.9, supported to May 31, 2029 | The self-hosted Magento line keeps a three-year support cadence |
| May 21, 2026 | Lightspeed reports selling Upserve to Skyview Equity | A POS vendor narrows its restaurant business |
| September 9, 2026 | Shopify acquires Tailwind Labs; Tailwind CSS stays MIT-licensed | A platform buys a front-end framework its theme developers use |
| October 27, 2026 | Spree 6.0 ships with its core under BSD-3-Clause | An open-source platform reverses an AGPL move |

Three patterns run through the list. **Suites absorb specialists:** Salesforce and Adobe bought their way in, and a merchant buying either buys a roadmap tied to a larger cloud. **Private capital owns the middle:** Squarespace, Rithum and much of the mid-market tooling are owned by investment firms, which shapes pricing and the pace of change. **Open source is a business model under pressure:** license changes (Spree to AGPL and back) and acquisitions (PrestaShop) move the terms a self-hosting merchant relies on, so the license and the owner belong in the platform decision ([Open Source and the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds) covers the same pressure in infrastructure).

## Build, Buy or Extend

Almost every merchant should buy the platform; the question is how much else.

**Buy** the parts that are the same for everyone and expensive to get right: the hosted checkout and its PCI scope, payments, tax calculation, carrier labels and rate shopping, fraud screening, and the marketplace connections. Each has a vendor whose whole business it is, and each is regulated or standardized in ways that punish a homemade version.

**Extend** a platform when it fits most of the business: apps, functions and APIs on a hosted platform, or modules on an open-source one. The test is the edges: B2B pricing, subscriptions, bundles, multi-location stock and multiple currencies are where platforms differ most.

**Build** where the commerce is the product: a marketplace operator, a platform selling to merchants, a business whose order model no platform has (rentals, configured-to-order goods, regulated goods with per-state rules), or a scale where platform fees exceed a team's cost. [Choosing & Hosting a Store](/books/commerce/choosing-a-platform#when-building-your-own-is-justified) sets the test in detail, and [Commerce Architecture](/books/commerce/commerce-architecture) covers building it.

## How to Build It

Every external system a merchant connects is a row, so external IDs, webhooks, credentials and sync state have something to point at:

```sql
CREATE TABLE connected_systems (         -- each external platform, marketplace, OMS, WMS, ERP
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  kind            TEXT NOT NULL CHECK (kind IN ('platform', 'marketplace', 'pos', 'oms', 'wms',
                    '3pl', 'erp', 'tax', 'shipping', 'payments', 'subscriptions', 'edi',
                    'app')),
  vendor          TEXT NOT NULL,         -- 'shopify', 'amazon_sp_api', 'netsuite', 'shipbob'
  account_ref     TEXT NOT NULL,         -- the vendor's shop, seller or account ID
  credentials_ref TEXT,                  -- a secrets-manager key, never the secret
  system_of_record TEXT[] NOT NULL DEFAULT '{}',  -- objects this system owns: 'items', 'orders'
  status          TEXT NOT NULL CHECK (status IN ('connected', 'degraded', 'disconnected')),
  connected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, vendor, account_ref)
);
```

Design notes:

- **The key in `external_refs` names a connected system,** so an item's Shopify ID, NetSuite internal ID and Amazon seller SKU each say which account they belong to; a merchant with two Amazon regions has two rows.
- **System of record is data.** Declaring that the ERP owns `items` and costs while the platform owns `orders` is what lets a sync job refuse to overwrite the owner's copy, instead of whichever system wrote last winning.
- **Credentials live in a secrets manager** and the row holds a reference; tokens for marketplaces and platforms expire and are rotated, and a disconnected status should stop syncs, not fail them silently ([Secrets](/docs/operations/environments#secrets)).

## Auditing

- **Which system said what, when.** For any order or item, which connected system created or last changed it, so a wrong price or a lost order can be traced to the system that caused it.
- **Who connected what.** Every connection, reconnection and disconnection with the person who authorized it and the scopes granted, since an app with order and customer access is a data processor.
- **Reported market figures as definitions.** Any GMV, share or market-size figure used in a decision, kept with its source and definition, because the vendors' denominators differ.

## What This Means for the System You Build

- **Expect every layer to be a different vendor,** each with its own copy of products, orders and customers.
- **Declare a system of record per object** and make sync jobs respect it.
- **Key external IDs by connected system,** not by vendor, so a second account or region is just another row.
- **Read market figures with their definitions;** Census, GMV and revenue measure different things.
- **Put the license and the owner in the platform decision,** because both change.
- **Buy what is standardized or regulated, extend the platform for fit, and build only where commerce is the product.**

## References

**Government data**

- [US Census Bureau: Quarterly Retail E-Commerce Sales](https://www.census.gov/retail/ecommerce.html), second quarter 2026 estimate, share of total retail, growth and the next release date

**Filings**

- [Shopify: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm), GMV, revenue by segment, Shopify Payments penetration, merchant countries and US share, apps in the App Store
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), net sales by group: online stores, third-party seller services and advertising
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), third-party seller unit mix
- [Commerce.com: Fourth quarter and full year 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1626450/000119312526047630/bigc-ex99_1.htm), 2025 revenue
- [Commerce.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1626450/000119312526085687/bigc-20251231.htm), the name change from BigCommerce on July 31, 2025 and the CMRC ticker
- [Wix.com: Fourth quarter and full year 2025 results (Form 6-K)](https://www.sec.gov/Archives/edgar/data/1576789/000162828026014406/fourthquarterandfullyear20.htm), revenue and transaction revenue
- [Block: Fourth quarter 2025 shareholder letter (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1512673/000119312526076557/d108590dex991.htm), Square gross payment volume
- [Lightspeed: Fiscal 2026 fourth quarter results](https://www.sec.gov/Archives/edgar/data/0001823306/000182330626000024/earningsreleasefy26q4.htm), revenue and the Upserve sale
- [Adobe: Form 10-K for fiscal 2018](https://www.sec.gov/Archives/edgar/data/796343/000079634319000019/adbe10kfy18.htm), the acquisition of Magento on June 18, 2018

**Company releases**

- [eBay: Fourth quarter and full year 2025 results](https://www.ebayinc.com/stories/news/ebay-inc-reports-fourth-quarter-and-full-year-2025-results/), GMV, revenue and the agreement to acquire Depop
- [Toast: Fourth quarter and full year 2025 results](https://seekingalpha.com/pr/20398519), gross payment volume and locations
- [Salesforce: Completes acquisition of Demandware](https://investor.salesforce.com/news/news-details/2016/Salesforce-Completes-Acquisition-of-Demandware/default.aspx), July 11, 2016 and Commerce Cloud
- [Permira: Completes acquisition of Squarespace](https://www.permira.com/news-and-insights/announcements/permira-completes-acquisition-of-squarespace), October 17, 2024
- [cyber_Folks: Investor relations](https://investors.cyberfolks.pl/en/?p=3794), the 100% acquisition of PrestaShop jointly with Sylius and BitBag
- [Spree Commerce: Developer covenant](https://spreecommerce.org/spree-commerce-developer-covenant), the license history from AGPL-3.0 back to BSD-3-Clause
- [RubyGems: spree_core](https://rubygems.org/gems/spree_core), version 6.0.0 on October 27, 2026 under BSD-3-Clause

**Platform documentation**

- [Shopify: Pricing](https://www.shopify.com/pricing), plan prices and payment fees
- [BigCommerce: Pricing](https://www.bigcommerce.com/essentials/pricing/), plans, sales caps and payment provider fees
- [Squarespace: Pricing](https://www.squarespace.com/pricing), plans and the transaction fee
- [WooPayments: Fees](https://woocommerce.com/document/woopayments/fees-and-debits/fees/), the US card rate
- [Medusa: Pricing](https://medusajs.com/pricing/), Cloud plans and the 0% GMV fee
- [Medusa: GitHub repository](https://github.com/medusajs/medusa), the MIT license
- [Saleor: Pricing](https://saleor.io/pricing), Cloud plans and GMV fees
- [Saleor: GitHub repository](https://github.com/saleor/saleor), GraphQL-native, API-only, BSD-3-Clause
- [Sylius: composer.json (2.1)](https://raw.githubusercontent.com/Sylius/Sylius/2.1/composer.json), the MIT license and Symfony foundation
- [commercetools](https://commercetools.com/), headless, cloud-native and API-first
- [Adobe: Commerce release availability](https://experienceleague.adobe.com/en/docs/commerce-operations/release/versions), 2.4.9 release and support dates

**Coverage**

- [The Next Web: WooThemes joins Automattic](https://thenextweb.com/news/woothemes-joins-wordpress-parent-company-automattic), May 19, 2015
- [destinationCRM: CommerceHub rebrands as Rithum](https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/CommerceHub-Rebrands-as-Rithum-161800.aspx), December 12, 2023
- [CMSWire: Shopify acquires Tailwind Labs](https://www.cmswire.com/digital-experience/shopify-acquires-tailwind-labs-to-secure-css-framework/), September 9, 2026 and the MIT license
